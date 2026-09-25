# Cutscene scene contract

## Transfer the approved principles, not the setting

The accepted clearing combines a bright, detailed environment with a simpler,
crisp, articulated foreground NPC. Its success is grounded in coherent space,
material edges, color and lighting, not maximum texture detail. Outdoor forest
daylight is one example. A candlelit inn, snow pass, crypt, castle room, market,
desert camp or rainy port can use the same contract with a different palette,
construction, light sources and narrative props.

Ask only when a missing user choice materially changes the scene. Otherwise
choose a plausible setup and state the assumption. Do not add mechanics while
designing scenery unless requested.

## Compact brief template

- Story / action: who lives here, what happened, where does the player look?
- Camera: viewpoint height, horizon, vanishing directions, foreground scale.
- Layout: actor feet/head, walkable ground, supported furniture/props, depth.
- Lighting: key direction/color, ambient color, reflected fill, cast shadows.
- Palette: main setting colors, readable focal contrast, material identities.
- Layers: background, optional occluders, actor, animated/interactable objects, UI.
- Output: logical composition, physical image size, mobile tier, selected-asset ID.

## Spatial accuracy without mandatory Blender

For simple scenes, choose the camera and major planes in 2D first. Keep parallel
architecture consistent with its vanishing direction; scale furniture against
the person/door. Ground paths must follow the ground plane, not float as ribbons.
Show near and far faces of props intentionally. No arbitrary overlapping houses
or filler colored shapes posing as distance.

Use Blender when these relationships remain ambiguous (especially interiors).
Start with boxes and a camera, then draw from that layout. Render guides do not
guarantee that a generated image preserved perspective: inspect it afterwards.
Do not impose the accepted clearing's actor coordinates on another camera.

## Light and color integration

Reuse the native live character. Repaint materials locally: base, lit face,
shade face; maintain material identity even when the two arms receive different
light. A warm light can create warm skin/cloth highlights and cooler shade, but
not every scene must use that formula. Cave torchlight, overcast snow and neon
disco require different illumination. Preserve hue separation and clear values.

Place a tight contact shadow at feet/props and a consistent cast shadow away
from the key light. Avoid a solid black ground slab and pasted-on outlines.
Avoid global filters which tint UI or flatten all materials. Restore canvas
state and any temporary material/segment adapter in finally blocks.

The gatherer's last shoulder correction lets the lit face meet the outer
silhouette and gives shade a real inward-facing plane. This is a shading lesson,
not permission to repeat its exact coordinates or split ratio on every NPC.

## Clarity, detail and bitmap limits

All cutscenes inherit the Gatherer's same-budget clarity requirement, including
simplified interiors and future non-forest settings. The historical fix was an
image-generation refinement of soft painted shapes, not a numeric sharpening
effect. Preserve composition, camera, actor space and lighting; replace smudgy
near/midground transitions with crisp intentional boundaries between broad
material planes. Keep supports, silhouettes and useful structural details.
Do not introduce halos, grain, extra tiny texture, mosaic triangles, nearest-
neighbour pixelation or a uniformly sharp distant background.

Review environment-only AND with the real native actor at game size: compare
adjacent material edges (e.g. cloth/wood, armour/anvil, feet/ground), not their
different detail counts. Inspect the selected mobile PNG too. If softness is
only in the lab/game rather than the source, check backing-store/DPR, CSS image
rendering and repeated down/upscaling before regenerating. A plate remains a
bitmap, so this is not a promise of vector-resolution edges at arbitrary zoom.
No runtime sharpen filter, readback, duplicate texture or 4K memory workaround.
Preserve approved originals; use versioned candidates when a repair is needed.

Angular does not mean pixelated. Near rocks, wood edges, flowers and the actor
should read cleanly at game size. Use broad intentional color planes with useful
small structural details. Do not add random triangles, grain, bevels or blur to
pretend there is more information. Distant shapes may simplify with depth.

Approved Gatherer plate: 1215 x 1295, displayed in a 480 x 512 scene region.
Gatherer mobile packaging: 768 x 819. These are proven budgets for THIS shot,
not a mandatory aspect ratio for every future scene. Higher resolution needs a
visible benefit and a measured budget. Compressed file size is not decoded RAM:
width * height * 4 estimates RGBA payload; browser/GPU copies add overhead.

Keep characters and moving/clickable state out of the plate. An illustration is
appropriate for a fixed camera; it does not replace the scrolling run's world.
Do not build full-frame bitmap animation to make a door or a hand move.

## Working interiors: approved Basalt Hearth v4

Inspect the clean plate and live composite in Background Lab's Basalt view;
the approval registry gives exact paths and hashes. This is a second quality
anchor, not a requirement that future rooms use basalt, anvils or orange light.

- Match detail density to the live actor. Broad stone, timber and steel planes
  with a few supported tools work better here than painterly microtexture.
- Derive contact coordinates and foreground masks from the **actual generated
  image**, not requested prompt coordinates. V4's workface begins near source
  y=694 despite the prompt asking for 740. Its logical contact is (315,235) in a
  480 x 360 scene; these coordinates are specific to this shot.
- Place the work surface at a believable reach/height before solving the arm.
  Composite plate → body → clipped same-plate foreground → workpiece → front
  arm/tool. A single flattened transform for every workpiece loses volume;
  see the art skill's per-item pitch/side-plane guidance.
- Apply scene-local material lighting to skin, beard, cloth, metal AND the
  foreground arm/tool. Never let a separately drawn arm revert to neutral colours.
  Compare identical poses with original and scene palettes.
- Reuse the shared plate for occlusion, not another decoded full-size mask.
  V4 standard 1448 x 1086 is 6,290,112 RGBA bytes; mobile 768 x 576 is 1,769,472.
  These are retained image payload estimates, not total RAM/FPS guarantees.

## Review record

Retain the scene brief, final prompt, input roles, original plate, chosen variant,
runtime versions and screenshot evidence. The lab must say which exact variant
is approved; switching to an old or experimental view must not inherit approval.
New scenes stay candidates until the user approves. Compare image + actor + UI,
not just a pretty standalone image. Technical checks must not invent an aesthetic
score or automatically rewrite reference hashes.
