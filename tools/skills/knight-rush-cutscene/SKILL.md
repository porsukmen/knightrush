---
name: knight-rush-cutscene
description: Create or refine Knight Rush cutscene and point-and-click event backgrounds, including interiors and different biomes, with coherent perspective, scene-matched live characters, approved reference checks, and bounded mobile memory.
---

# Knight Rush Cutscene

Use the user's requested setting and story, not a fixed forest template. Resolve
project paths from the Knight Rush repository root, three levels above this file.
Start by reading `references/scene-contract.md`, the project's
`ART_STYLE_KESKIN_DUZLEM.md`, and
`art-source/knight-rush-backgrounds/cutscene-references.js`.
Open the relevant approved plate AND its character composite before designing.
The Mushroom Gatherer's crisp clearing was explicitly approved on 2026-09-24;
it sets environment clarity, meaningful detail and scene integration quality,
not a requirement for cottages, trees, daylight, or a fixed palette.

## Reference boundaries

- Existing knight/boss silhouettes and approved NPCs remain character anchors.
  Use `knight-rush-art` for actual character geometry/animation changes.
- Character style inputs must contain isolated models, NOT their old UI or
  unrelated backgrounds. The separately approved cutscene plate is now a valid
  environment-quality reference; do not confuse these two roles.
- Rejected event backdrops and old minigame placeholders are not references.
- Preserve approved character identity/rig. Lighting adapters are scene-local;
  they must not recolor the model globally or bake it into the background.

## Design and production

1. Define a short scene brief: location, narrative clues, focal interaction,
   camera/horizon, actor foot position and scale, key light, ambient/bounce light,
   foreground/midground/background, UI-safe area and movable/clickable props.
2. Establish coherent spatial layout. A sketch or clear 2D perspective plan is
   normally enough. Blender is OPTIONAL: use a greybox when room geometry,
   multiple interacting planes, scale or camera uncertainty warrants it. A
   greybox supplies geometry only, not final surface style.
3. Produce the environment plate without actors, UI or baked interactive states.
   Follow the requested medium: use the available image-generation skill for
   bitmap illustration/editing, native code for genuinely code-native elements.
   Save variants non-destructively; keep generation prompt/input roles with them.
4. Match the live actor to the scene's light and palette using material planes,
   not an all-screen tint. Apply the checks below before adding more detail.
5. Package standard and constrained-device assets and register them with the
   shared event visual manager. Read `assets/encounters/EVENT_VISUALS.md` for the
   current API/budgets. Do not preload every event or hold images in each NPC.

## Check yourself at each meaningful pass

- **Layout:** horizon, object sizes, door/actor relationship, reachable props,
  contact with ground, sensible overlaps and consistent building planes.
- **Environment:** sharp purposeful near-plane edges, readable materials and
  narrative clues; no random foliage filler, muddy wash, ubiquitous tiny facets,
  low-resolution enlargement or sharpen halos. Softer distance is acceptable.
- **Actor integration:** same light direction, warm/cool balance, saturation and
  depth; same garment remains the same material on both arms; shoulder shading
  reads as a plane, not one outlined arm and one solid dark sleeve. Hands stay
  empty unless holding a supported object. Check contact/cast shadows and feet.
- **Game view:** compare environment-only, original lighting, scene lighting,
  grayscale, idle-motion frames and actual dialogue at desktop and phone size.
  Check foreground occlusion, UI clearance and the real return to the run.
- **Budget:** selected quality only; no extra screen-sized plate copy, per-frame
  filtering/pixel readback, or unbounded decoded images. Report decoded RGBA
  estimates separately from actual process RAM; desktop emulation is not phone FPS.

Run `node tools/cutscene-audit.cjs` for approved-file integrity and manager bounds;
run `node tools/background-illustration-audit.cjs` and the relevant event browser
audit for composition/integration. If the character adapter changes, also run
`node tools/gatherer-lighting-audit.cjs` (or the new scene's equivalent) and
`node tools/art-lab-audit.cjs`. Inspect the resulting images yourself.
Current local Node dependencies, if needed, are at
`C:/Users/Altar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules`.

Report concrete remaining visual weaknesses rather than declaring art correct
because tests pass. User approval alone promotes a new plate/composite. Preserve
approved files and their hashes; do not rewrite a baseline to silence failures.
No audit polling, lab UI or per-second pixel inspection belongs in gameplay.
