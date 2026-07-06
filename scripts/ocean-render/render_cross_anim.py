"""Render the 5760x3240 cross-world animation frames.

Usage: blender -b ocean.blend --python render_cross_anim.py -- <start> <end>
"""
import bpy
import os
import sys

BASE = r"C:\Users\gokul\AppData\Local\Temp\claude\C--Users-gokul-Desktop-WEBSITE-gokul-website2-0\81be825f-7240-4a54-96ae-9116891a7adb\scratchpad"
sys.path.insert(0, BASE)
from cross_common import setup_cross_scene

argv = sys.argv[sys.argv.index("--") + 1:]
F_START, F_END = int(argv[0]), int(argv[1])

OUT_DIR = os.path.join(BASE, "tiles", "frames")
os.makedirs(OUT_DIR, exist_ok=True)

scene = setup_cross_scene()
scene.render.image_settings.file_format = "JPEG"
scene.render.image_settings.quality = 92
scene.render.use_overwrite = True
scene.frame_start = F_START
scene.frame_end = F_END
scene.render.filepath = os.path.join(OUT_DIR, "f")
bpy.ops.render.render(animation=True)
print(f"CROSS_ANIM_DONE {F_START}..{F_END}")
