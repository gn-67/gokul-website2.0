# Ocean background render pipeline

Produces the five seamless looping background videos in `src/assets/ocean/`
from `C:\Users\gokul\Documents\ocean.blend`. The whole cross-shaped world
(About / Experiences–Home–Work / Life) is rendered as ONE 5760×3240 frame per
frame and sliced into five 1920×1080 tiles, so every seam between adjacent
screens is pixel-perfect in both axes. Never modifies or saves the .blend.

## Why one big render

Anything computed in screen space (compositor glare, raytraced reflections)
differs between separate renders — separate per-screen renders can never seam
perfectly. Slicing one render is seamless by construction. The camera stays
put; the 3× span comes from `lens / 3` + `sensor_fit HORIZONTAL` at 3× the
resolution, which keeps the center tile's projection identical.

## Loop

480-frame (20s @ 24fps) loop + 72 extra frames crossfaded over the head
(`assemble.py` header has the formula). Ocean time is re-driven linearly
(0.036/frame) in memory so wave speed is constant across the loop point.

## Steps (PowerShell)

```powershell
# 1. render all 552 frames (~75 min, EEVEE) to the scratch dir set in the scripts
& "C:\Program Files\Blender Foundation\Blender 4.5\blender.exe" -b `
  "C:\Users\gokul\Documents\ocean.blend" --python render_cross_anim.py -- 0 551

# 2. slice + crossfade + encode five MP4s (needs: pip install pillow numpy imageio-ffmpeg)
python assemble.py
```

Note: both scripts currently write to a session temp dir via the absolute
`BASE`/`OUT_DIR` paths at the top — point those somewhere durable before
re-running. Poster PNGs are frame-45 crops of the same render.

## Scene adjustments applied in-memory (cross_common.py)

- Ocean modifier `repeat_x/y = 3` + object shifted one wave-period back so
  water covers under/behind the camera as one continuous mesh (no normal
  seams; integer-period shifts leave the visible wave pattern unchanged).
- Zenith sky gradient (deepens above ~10° elevation — above the home row's
  field of view), gated by Light Path → Is Camera Ray so water reflections
  keep the original flat sky color.
