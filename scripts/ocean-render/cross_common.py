"""Shared setup for the 3x3 'cross' world render: camera span, water extension,
linear ocean time, zenith sky gradient. Never saves the .blend."""
import bpy
import math
import mathutils

def setup_cross_scene():
    scene = bpy.context.scene
    cam = scene.camera.data

    # Triple both spans with identical center projection:
    # horizontal: lens/3 (sensor fit HORIZONTAL, sensor 36mm)
    # vertical: follows aspect => 3240/5760 tracks 3x the original vfov
    cam.lens = cam.lens / 3.0
    cam.sensor_fit = "HORIZONTAL"
    scene.render.resolution_x = 5760
    scene.render.resolution_y = 3240
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"

    # Linear ocean time (matches the approved wide-pass stills)
    plane = bpy.data.objects["Plane"]
    fc = plane.animation_data.action.fcurves.find('modifiers["Ocean"].time')
    for k in fc.keyframe_points:
        k.interpolation = "LINEAR"
    fc.keyframe_points[0].co = (0.0, 1.0)
    fc.keyframe_points[1].co = (1000.0, 1.0 + 1000.0 * 0.036)
    fc.extrapolation = "LINEAR"
    fc.update()

    # Extend water as ONE continuous mesh via ocean repeat (no normal seams).
    # The sim is periodic every spatial_size local units, so shifting the
    # object by exactly one period keeps the original view pixel-identical.
    ocean = next(m for m in plane.modifiers if m.type == "OCEAN")
    period = float(ocean.spatial_size)
    ocean.repeat_x = 3
    ocean.repeat_y = 3
    # repeats extend in +x/+y; pull the object back one period in both axes
    # so the original tile stays in place and coverage grows toward the camera
    local_off = mathutils.Vector((-period, -period, 0.0))
    plane.location = plane.location + plane.matrix_world.to_3x3() @ local_off

    # report world-space coverage vs camera for sanity
    dg = bpy.context.evaluated_depsgraph_get()
    ev = plane.evaluated_get(dg)
    bb = [ev.matrix_world @ mathutils.Vector(c) for c in ev.bound_box]
    xs = [v.x for v in bb]; ys = [v.y for v in bb]
    cam_loc = scene.camera.matrix_world.translation
    print(f"WATER_COVERAGE x[{min(xs):.1f},{max(xs):.1f}] "
          f"y[{min(ys):.1f},{max(ys):.1f}] camera=({cam_loc.x:.1f},{cam_loc.y:.1f})")

    # Zenith gradient: deepen the sky ABOVE the home tile's field of view.
    # Home/left/right rows see at most ~8.2 deg above the horizon; the ramp
    # starts at 10 deg so the approved tiles are untouched.
    world = scene.world
    world.use_nodes = True
    nt = world.node_tree
    bg = next(n for n in nt.nodes if n.type == "BACKGROUND")
    base = tuple(bg.inputs["Color"].default_value)[:3]
    deep = (base[0] * 0.62, base[1] * 0.70, base[2] * 0.86)  # darker, cooler

    texco = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ramp = nt.nodes.new("ShaderNodeMapRange")
    lp = nt.nodes.new("ShaderNodeLightPath")
    gate = nt.nodes.new("ShaderNodeMath")
    gate.operation = "MULTIPLY"
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    ramp.inputs["From Min"].default_value = math.sin(math.radians(10.0))
    ramp.inputs["From Max"].default_value = math.sin(math.radians(45.0))
    ramp.inputs["To Min"].default_value = 0.0
    ramp.inputs["To Max"].default_value = 1.0
    ramp.clamp = True
    ramp.interpolation_type = "SMOOTHSTEP"
    mix.inputs["A"].default_value = (*base, 1.0)
    mix.inputs["B"].default_value = (*deep, 1.0)
    nt.links.new(texco.outputs["Generated"], sep.inputs["Vector"])
    nt.links.new(sep.outputs["Z"], ramp.inputs["Value"])
    # only direct camera rays see the gradient; water reflections keep the
    # original flat sky so the approved tiles stay pixel-identical
    nt.links.new(ramp.outputs["Result"], gate.inputs[0])
    nt.links.new(lp.outputs["Is Camera Ray"], gate.inputs[1])
    nt.links.new(gate.outputs["Value"], mix.inputs["Factor"])
    nt.links.new(mix.outputs["Result"], bg.inputs["Color"])
    return scene
