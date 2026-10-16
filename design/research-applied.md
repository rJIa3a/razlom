# Motion refinement, 2026-10-16

Source: study/comix-video/deep/IMPLEMENTATION.md and CHARACTER.md, observations C01–C04. These are visual observations, not original engine parameters.

Applied: separate exit preparation, short frame hand contact, tucked flight, extension into landing and recovery; 1.04 second authored transition, with contact at 0.86 seconds. Camera travels across the intact page. Landing effects fire on contact; input returns after recovery. Flight leg tuck varies with vertical speed. Pipe motion alternates hand grips and keeps the supporting hand fixed in world coordinates, in both travel directions.

Original prototype extensions retained: manual Up to climb a ledge, Down to release, responsive immediate jump input, restricted air steering. No combat or additional level introduced. WebGL and iPhone Canvas2D use the same simulation and rig.

Validation: complete route in both renderers; simulation acceptance; fixed-world pipe hand assertions; transition endpoints; automatic UI, anchor, rig and animation QA; independent motion critic. Physical iPhone testing remains with the user.
`nSecond pass: authored torso rotations at a fixed pelvis, 38px landing knee compression, wide planted landing feet, 60px apex leg tuck, separate ascent/descent arm pose, pipe pelvis sway and alternating knee heights. Motion critic confirmed visible changes and preserved contacts. Preparation extends smoothly into takeoff over 80ms.
