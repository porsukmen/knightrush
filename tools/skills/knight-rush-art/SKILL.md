---
name: knight-rush-art
description: Create, refine, and visually verify Knight Rush character, item, environment, and animation art against its approved in-game models.
---

# Knight Rush art

Resolve paths from the repository root, three levels above this file. This is
the self-contained, current art contract: **Knight Rush — Keskin Düzlem (KR-KD),
Sharp Plane**. It covers artwork, not unrelated gameplay or infrastructure work.

`ART_STYLE_KESKIN_DUZLEM.md` and
`art-source/knight-rush-sharp-plane/ART_WORKFLOW.md` are historical archives,
not prerequisites. Do not routinely read them or follow their old screenshot
links; consult them only for an explicitly requested historical comparison.

## Start from the approved live Lab models

Before designing, open `ArtTest.html` / `KnightRush.html?artlab=1` and inspect
the relevant approved models rendered by the game. The Lab is the **starting
visual reference**, not merely a final audit. Read the matching entries in
`art-source/knight-rush-sharp-plane/art-references.js` to identify approved vs
candidate renderers, then inspect those renderer functions. Do not promote the
latest code or an image in `output/` to approved status by assumption.

- Knight, bear, wolf and toad: compact squared masses, silhouette and volume.
- Approved merchant and revamped Disco King: purposeful NPC detail, expression,
  clothes, material separation and articulation. They do not replace the first
  group's blocky foundation. NPC close-ups may be richer; road-size silhouettes
  must still read as the same game.
- Approved Mushroom Gatherer: squared civilian proportions, face and workwear;
  his asking hand is empty, mushrooms belong in the basket.
- Smith: current steel upper arms, not the red sleeves in an old screenshot.
- Approved Barrel Barry (`barry`): broad human torso, smaller squared head,
  distinct upper-arm/elbow/forearm blocks and planted palms. Inspect his isolated
  neutral Lab render, `KRTavernSlide.barry`, `barryPose` and `barryMaterials`;
  the table, mugs, room and UI are not character references. Preserve fixed bone
  lengths and counter contact when adapting this construction to another pose.
- The seated Autumn merchant (`seated-merchant`) is approved. Use its isolated
  neutral render: crossed legs belong to the existing upper-body rig; wagon,
  display blanket and scene lighting are not character style inputs.
- Mossy Oak innkeeper (`innkeeper`) v2 was explicitly reapproved 2026-09-26:
  receding hair, continuous scalp/forehead planes, squared jaw, forward shoulder
  and upper-arm layers, planted palm and live wiping cloth. Use the current
  isolated Lab model and `approved-innkeeper-v2.png`, not withdrawn v1 or the
  older actor in the archived inn composite. Pose and material palettes are
  protected alongside the renderer. Inn environment approval remains separate.
- Approved Borin / Basalt dwarf: `KRBasaltForge.dwarf` in
  `assets/forest/basalt-forge.js`, live in Art Lab. Compact muscular build,
  receding crown, small squared eyes, moustache without an extra smile mark,
  long full central beard with cheek-rooted side braids, leather workwear.
  This is a separate smith identity, not a replacement for the town knight.

Use isolated character/model views as character references. **Never import their
backgrounds, UI or full-scene layout as a style reference.** Do not open every
archived PNG on each task. If the Lab cannot run, use only a task-relevant,
explicitly registered approved isolated reference and disclose the limitation;
an old scene screenshot is not an equivalent substitute.

For cutscene/event backgrounds and scene-matched actor lighting, also use
`tools/skills/knight-rush-cutscene/SKILL.md` and its approved Background Lab
plate/composite registry. That separate environment approval does not authorize
using arbitrary NPC backgrounds. For running-world art, inspect the current
Journey/Morning scene and the relevant native renderer; the Art Lab characters
anchor shape language, not the composition of its neutral backdrop.

For themed running-road design or revisions, also read
`tools/skills/knight-rush-special-road/SKILL.md`. Its approved Crimson/Disco
catalog and `RoadCreatorLab.html` cover natural/man-made transitions, decorations, obstacles and central
event venues while preserving the existing road and trees.

## Shape and detail contract

- Crisp native-resolution 2D/2.5D medieval fantasy: rectangular/stepped masses,
  clipped corners, deliberate polygons and a few broad light/shadow planes.
  Blockiness belongs to geometry, not a pixelation filter or enlarged tiny sprite.
- Keep each object's recognizable silhouette. Horses, bears, cloth and clouds
  need not be literal rectangles. Avoid rounded pastel mascots, rubber limbs,
  generic flat cutouts and random low-poly triangulation.
- Faces use small squared eyes, readable brow/nose/cheek/chin planes. Separate
  head, shoulder, elbow, hand and torso masses; clear joints and readable hands.
  Occupation/weight comes from designed proportions, not stretching a whole model.
- Detail explains structure/material: buckles, seams, rivets, folds and wear
  where they belong. Do not scatter marks or fracture every surface to add detail.
- Old minigames and rejected prototypes are placeholders, not anchors. The
  explicitly approved revamped Disco King is an exception. External cartoons
  may inspire clarity/layering, not replace Knight Rush faces, contours or palette.

## Colour, lighting and depth

- Usually three values: main material, broad shadow, narrow light plane. Reuse
  the relevant live renderer's palette; there is no mandatory universal palette.
- Separate skin, steel, cloth, wood, leather and gold by value/hue. Steel has a
  cool face/dark side/bright rim; cloth is matte with few folds; wood has structural
  grain; glass has a distinct liquid level, dark side and narrow reflection.
- Maintain a coherent light direction. Use crisp planes rather than blur/glow
  to manufacture volume. Do not wash the whole scene out or turn every colour neon.
- Preserve material identity across both arms and other paired parts. A changed
  light angle can change shade, not randomly change the garment. Scene-local
  lighting must not globally repaint an approved character.
- Depth comes from side faces, perspective, overlap and justified contact/cast
  shadows; real 3D is optional. Props stand, hang, connect or are held logically.
  Keep interactive objects and silhouettes readable in the phone viewport.

## Native implementation and motion

Use existing renderers through their actual code/Lab adapters, not redrawn copies:

| Need | Renderer in `KnightRush.html` |
| --- | --- |
| Knight proportions / horse / armour | `drawSerJonathanRider`, `drawSquireHelmet25D`, `drawSerJonathanShield` |
| Animal volume | `drawBearNatural`, `drawWolf`, `drawMireToad` |
| NPC face / cloth / gold | `drawWanderingMerchant`, `drawMushroomGatherer` |
| Expressive pose / steel articulation | `discoBodyPose`, `drawDiscoKing`, `smithKnightPose`, `drawSmithKnight` |
| Item materials | `drawMerchantDisplayItem` |

Reuse `rigPolygon`, `rigSegment`, `rigJoint`, `px` and existing material/attachment
patterns. Those helpers use `U` units; `expPoly` / `expSegment` use canvas units.
Do not mix units. Hands and held props follow the same articulated chain; joints
must stay connected during idle/action, with intentional foreground layering.
Keep live characters live rather than baking them into scene images.

### Shoulder layering standard

For front-facing character poses, default to drawing the torso first, then the
shoulder caps and complete upper arms, then forearms/hands. This is the user's
preferred construction: shoulders sit in front of the torso, and an arm reaching
inward across the chest must not disappear beneath it. Move the connected upper
arm with the shoulder pass, not just a detached shoulder patch. Keep the shoulder
root attached and carry the same material/light planes through the elbow.

Use a rear-arm pass only when the pose genuinely puts that limb behind the body
(e.g. the far arm in a turned pose). Counter/prop masks must preserve the intended
forward arm and hand contacts. Inspect both exact animation extremes and the
in-between poses in the real scene; valid bone lengths alone cannot detect a
layering error. Apply this default to new/revised art without silently repainting
approved models or treating this rule as approval of future candidates.

For bearded NPCs and forge workpieces, use the approved Borin as a concrete
example rather than prescribing his appearance to all characters:

- A braid begins in a parted hair mass. Its interwoven locks affect the outer
  contour and converge into a tied end; a zigzag strip painted over a solid
  beard reads as an attachment. Preserve a broad unbraided mass where intended.
- Muscularity comes from shoulder/bicep/forearm volume, not longer arm bones.
  Keep joint lengths fixed through the swing, with the tool attached to the wrist.
- Distinguish rotation on the table from pitch/roll exposing an object's side.
  A flattened top icon has no thickness: show cuff/palm/finger side planes.
  Inspect the item's working silhouette at phone size, not only the UI icon.
- Bow, shield and glove need per-item presentation, not one shared flattening
  matrix. Preserve their production art and leave menu icons unchanged when
  the request concerns only items lying on the anvil. Test lift AND contact.

Static environments may reuse bounded screen-resolution drawing caches. Do not
add a bitmap pipeline to code-native art without a reason. Rendering must not
alter gameplay/RNG/economy. Lab instrumentation never runs in normal play.

## Review and handoff

Compare meaningful silhouette, material and motion passes against the selected
Lab anchors, at close-up and small road scale. Use colour/grayscale/silhouette
and time scrubbing where relevant. Fix a mismatch before adding decorative detail.
Inspect the actual desktop and phone-size game scene for placement, clipping,
UI safety and animation; a neutral model board cannot establish integration.

For artwork changes, run `node tools/art-lab-audit.cjs` and relevant feature audits
from the repository root. It requires Playwright, Edge and @napi-rs/canvas; local
dependencies are at
`C:/Users/Altar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules`
(set `NODE_PATH` if needed). Inspect relevant output images, not just exit codes.
Documentation-only skill edits need skill validation, not a game render audit.

`art-source/knight-rush-sharp-plane/reference-baseline.json` protects approved
renderers/shared primitives. Do not rewrite it to make tests pass. User approval
alone promotes a candidate or authorizes a reference change. Technical checks
are not aesthetic approval; report remaining visual issues separately. Preserve
accepted work and keep a small requested edit within its requested scope.
