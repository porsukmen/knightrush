---
name: knight-rush-cutscene
description: Create or refine Knight Rush cutscene and point-and-click event backgrounds, including interiors and different biomes, with coherent perspective, scene-matched live characters, approved reference checks, and bounded mobile memory.
---

# Knight Rush Cutscene

Use the user's requested setting and story, not a fixed forest template. Resolve
project paths from the Knight Rush repository root, three levels above this file.
Start with `tools/skills/knight-rush-art/SKILL.md` for the self-contained shared style,
`references/scene-contract.md`, and
`art-source/knight-rush-backgrounds/cutscene-references.js`.
Use Background Lab (`BackgroundTest.html` / `?backgroundlab=1`) to inspect the
relevant approved plate AND its character composite before designing. Character
shape references come from approved isolated Art Lab models. Do not load the
archived `ART_STYLE_KESKIN_DUZLEM.md` as a routine prerequisite.
The Mushroom Gatherer's crisp clearing (`?backgroundlab=1&clearing=crisp`)
was explicitly approved on 2026-09-24;
it sets environment clarity, meaningful detail and scene integration quality,
not a requirement for cottages, trees, daylight, or a fixed palette.
Basalt Hearth v4 and its current Borin composite were explicitly approved on
2026-09-25. Inspect `?backgroundlab=1&scene=basalt-forge` for an interior example:
quiet generated room, warm forge/cool window, live actor and foreground anvil.
Earlier Basalt plates and dwarf drafts are not approved references. Use
`references/scene-contract.md` for its transferable contact/occlusion lessons.
The **Mossy Oak Inn v4 environment** and **Autumn Caravan v1** are approved.
The rebuilt innkeeper v2 was reapproved separately on 2026-09-26. Use its current
isolated Art Lab model for character shape; the archived inn composite still
shows the withdrawn v1 actor and guides room lighting/occlusion only.
Open `?backgroundlab=1&scene=mossy-inn` or
`?backgroundlab=1&scene=autumn-caravan`: each has environment-only, live scene-lit,
neutral-light comparison and locked approved composite views, without UI.
Inn: frontal bar, shelves behind, warm hearth/cool window, same-plate counter
mask and live wiping cloth. Caravan: autumn clearing, seated native merchant,
red cloth and grounded parked native wagon/horse/driver. Keep their exact
registered versions; older inn plates or generated horse drafts are not anchors.
Approval of these scenes does not promote the simplified Gatherer candidate.

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

The established **Knight Rush Cutscene** pipeline is the Gatherer's workflow:
**generate an illustrated raster environment, then composite a separate native,
live character and interactive/animated props**. This is not a name for drawing
a simple polygon room with the character-art helpers. Reading the lighting rules
alone does not fulfil a request to use this skill. Use image generation for new
cutscene backgrounds by default; change the medium only when the user explicitly
requests a code-native background. Do not substitute one on performance grounds:
package the generated plate to the measured mobile budget instead.

1. Define a short scene brief: location, narrative clues, focal interaction,
   camera/horizon, actor foot position and scale, key light, ambient/bounce light,
   foreground/midground/background, UI-safe area and movable/clickable props.
2. Establish coherent spatial layout. A sketch or clear 2D perspective plan is
   normally enough. Blender is OPTIONAL: use a greybox when room geometry,
   multiple interacting planes, scale or camera uncertainty warrants it. A
   greybox supplies geometry only, not final surface style.
3. Use the available `imagegen` skill to generate the environment plate without
   actors, UI or baked interactive states. Supply the approved Background Lab
   plate as an environment-quality reference, not as a mandatory layout/setting.
   Describe the camera, actor's reserved space, grounded furniture, key light
   and intended foreground occlusion in the generation prompt. Inspect the
   actual output before placing the live character; correct failed perspective
   or asset positioning instead of pretending the prompt guarantees compliance.
   Save variants non-destructively; keep the final prompt and input roles.
   Every cutscene, including simplified plates, must pass the **same-budget
   clarity pass** below before integration; detail reduction is not permission
   for softer edges behind the live character.
4. Match the live actor to the scene's light and palette using material planes,
   not an all-screen tint. This requires an actual scene-local material adapter,
   not merely naming warm/cool colours in the brief. Render the same actor and
   pose with neutral and scene lighting side by side; inspect the final composite
   at game size. The key light must visibly reach the facing skin, beard/cloth,
   armour and held tool, with coherent shadow faces on the opposite side.
   If the actor still looks pasted on, the lighting pass is unfinished.
   Match background detail density to the actor: broad quiet surfaces and a few
   purposeful props are preferable to painterly microtexture behind a simple NPC.
   Apply the checks below before adding more detail.
5. Package standard and constrained-device assets and register them with the
   shared event visual manager. Read `assets/encounters/EVENT_VISUALS.md` for the
   current API/budgets. Do not preload every event or hold images in each NPC.
   Draw the selected-resolution plate directly, without pixelated scaling,
   per-frame filters or a second full-screen copy. Foreground masks may redraw
   a clipped part of the SAME plate to place a live actor behind a static prop.
   Moving workpieces/characters remain separate; a native fallback is only for
   loading/error recovery and must not be presented as the finished cutscene.

## Mandatory clarity pass — all cutscenes

The Gatherer's successful sharpness correction was a generated clarity edit,
NOT a sharpen shader, CSS filter, larger texture or per-frame image processing.
Use `references/scene-contract.md` for the reusable procedure. Historical exact
prompt and evidence: `art-source/knight-rush-backgrounds/gatherer-near-v3/CLARITY_TRIAL.md`
(only retrieve when investigating that original correction).

Compare near/midground materials directly beside the native actor at actual
desktop and phone game sizes. If they look blurry while the actor is crisp,
refine the plate's painted boundaries with image generation at the same pixel
budget, preserving layout, lighting and empty actor space. Broad clear planes,
not more texture or artificial halos, supply clarity. Check the packaged mobile
asset as well as the source. Restrained distance softness is intentional depth;
do not indiscriminately sharpen everything. Existing approved plates that
already pass are retained, never blindly filtered or overwritten.

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
