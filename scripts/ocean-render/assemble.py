"""Assemble five looping ocean MP4 tiles from 5760x3240 cross-world frames.

Loop formula (N=480 loop frames, K=72 crossfade):
  out[i] = (1-a)*frame[N+i] + a*frame[i],  a=i/K   for i < K
  out[i] = frame[i]                                 for K <= i < N
Continuity: out[N-1]=f[N-1] -> out[0]=f[N] are consecutive rendered frames.
"""
import os
import subprocess
import numpy as np
from PIL import Image
import imageio_ffmpeg

BASE = os.path.dirname(os.path.abspath(__file__))
FRAMES = os.path.join(BASE, "tiles", "frames")
OUT = os.path.join(BASE, "tiles")
N, K, FPS = 480, 72, 24
H = 1080
TW = 1920

# crop boxes in the 5760x3240 cross frame (left, upper, right, lower)
TILES = {
    "home":  (1920, 1080, 3840, 2160),
    "left":  (0,    1080, 1920, 2160),
    "right": (3840, 1080, 5760, 2160),
    "up":    (1920, 0,    3840, 1080),
    "down":  (1920, 2160, 3840, 3240),
}

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

def load(i):
    return np.asarray(
        Image.open(os.path.join(FRAMES, f"f{i:04d}.jpg")).convert("RGB"),
        dtype=np.uint8)

def encoder(path):
    return subprocess.Popen(
        [FFMPEG, "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{TW}x{H}", "-r", str(FPS), "-i", "-",
         "-c:v", "libx264", "-preset", "medium", "-crf", "21",
         # 1s GOPs: OceanBackground resyncs tile clocks via currentTime at
         # nav time, and long default GOPs (~250 frames) make that seek a
         # visible freeze mid-slide.
         "-g", str(FPS), "-sc_threshold", "0",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", path],
        stdin=subprocess.PIPE, stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL)

procs = {n: encoder(os.path.join(OUT, f"ocean-{n}.mp4")) for n in TILES}

first_out = None
prev = None
consec_diffs = []
for i in range(N):
    if i < K:
        a = i / K
        frame = ((1.0 - a) * load(N + i).astype(np.float32)
                 + a * load(i).astype(np.float32)).astype(np.uint8)
    else:
        frame = load(i)
    for name, (x0, y0, x1, y1) in TILES.items():
        procs[name].stdin.write(frame[y0:y1, x0:x1, :].tobytes())
    if i == 0:
        first_out = frame.astype(np.int16)
    if prev is not None and i % 60 == 1:
        consec_diffs.append(float(np.abs(frame.astype(np.int16) - prev).mean()))
    prev = frame.astype(np.int16)
    if i % 60 == 0:
        print(f"frame {i}/{N}", flush=True)

for p in procs.values():
    p.stdin.close()
for p in procs.values():
    p.wait()

wrap = float(np.abs(first_out - prev).mean())  # out[N-1] -> out[0]
print(f"loop wrap diff (last->first): {wrap:.3f}")
print(f"typical consecutive-frame diff: {np.mean(consec_diffs):.3f}")
for n in TILES:
    path = os.path.join(OUT, f"ocean-{n}.mp4")
    print(f"{n}: {os.path.getsize(path)/1e6:.1f} MB")
print("ASSEMBLE_DONE")
