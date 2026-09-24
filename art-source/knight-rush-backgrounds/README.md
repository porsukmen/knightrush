# Knight Rush environment candidates

Status: **crisp clearing explicitly user-approved on 2026-09-24**.
`cutscene-references.js` records the locked plate/composite and hashes.
Use `tools/skills/knight-rush-cutscene/SKILL.md` for new settings and scene lighting.
Do not use old question-mark backdrops as quality references. Other environments
still require their own review; this approval is not a forest-only template.

## Current pilot: 2D illustration with closer live NPC (v3)

### Approved same-budget clarity revision

The current default is `assets/encounters/mushroom-clearing-crisp.png`
(1215 × 1295). The previous plate is preserved. Background Lab offers
**Compare previous image**; `?clearing=original` selects that archived, non-reference
variant in the actual game as well. Only one variant loads in each runtime. See
`gatherer-near-v3/CLARITY_TRIAL.md` for provenance, prompt and memory limits.

The current scene uses one decoded image and draws it directly, without an extra
screen-sized canvas copy or runtime filter. Existing LOW_POWER hardware hints
select a prebuilt 768 × 819 image (~2.4 MiB RGBA); standard is ~6.0 MiB RGBA.
These are pixel-payload estimates, NOT measured total browser/GPU memory.
The previous source plus extra phone-sized canvas was ~11.6 MiB at 390px/3×.
No 4K assets or per-frame image processing. A separate environment baseline was
created at the user's explicit approval; character hashes remain unchanged.
The larger comparison lab still uses its own comparison canvases; it is not
loaded by normal gameplay. Real phone frame timing still needs device testing.
Audit: `node tools/gatherer-event-browser-audit.cjs` covers one asset request,
both memory tiers, rotation without reload, A/B, real event/quest and fallback.
`assets/encounters/event-visuals.js` now owns runtime loading/release, with a shared
6 MiB mobile / 14 MiB standard reservation budget and at most two images. It
prefetches near the event on the selected road, cancels stale work and releases
plates on completion/pass/reset. See `assets/encounters/EVENT_VISUALS.md`.

The user accepted the v2 spatial model and requested the man closer to the
camera, with the cottage behind. This accepts the layout, NOT the final art.

- Default lab: `BackgroundTest.html` / `KnightRush.html?backgroundlab=1`.
- Source: `gatherer-near-v3/gatherer-near-v3.blend`; rebuild using the same
  generator with `-- --near`. Camera and cottage are unchanged; actor moves.
- The environment bitmap is `gatherer-near-v3/illustration.png`, generated with
  the built-in image generation tool, not an external API or Blender material.
- Exact generation instructions: `gatherer-near-v3/ILLUSTRATION_PROMPT.txt`.
- CRITICAL reference boundary: illustration style comes ONLY from isolated
  approved CHARACTER MODELS. Do not pass full screenshots of their backgrounds
  or UI. `tools/render-character-only-references.cjs` exports the actual approved
  gatherer and merchant renderers onto transparency. These are derived review
  inputs, not new approvals or alternate model drawings.
- Input 1: `gatherer-near-v3/environment.png`, geometry/perspective ONLY.
  Input 2: `character-only-references/mushroom.png`, character style ONLY.
  Input 3: `character-only-references/merchant.png`, character style ONLY.
- No person is baked into the plate. Lab uses unchanged `drawMushroomGatherer`
  at the new projected feet/head position, with its existing animation.
- Image generation interprets the geometry: it is NOT a pixel-exact projection
  render. Blender markers and geometry hit regions are disabled on illustration
  view so they cannot misleadingly claim exact alignment.
- Environment-only, grayscale, original model, dialogue and tall-phone checks
  remain available. Animation is throttled to 30 fps and pauses when hidden.
- Resolution is measured from the actual object-fit display area, multiplied
  by device DPR (cap 3), not fixed at 480 logical pixels. Lab canvas CSS is
  `image-rendering:auto`; vectors are rerasterized at this physical resolution.
  The original 1214 × 1295 bitmap is downsampled with high-quality smoothing into
  a cached backplate only on size/view changes. This does not add source detail
  beyond 1214 pixels when enlarged on very large HiDPI displays.
  This cache describes the comparison lab only; production uses the single-image
  memory policy above.
- **Play in-game encounter** opens a disposable iframe at
  `KnightRush.html?backgroundplaytest=1`. It uses real Journey input, encounter
  choices, quest acceptance and return to the road, using the same production
  scene renderer as the normal Mushroom Gatherer encounter.
  Reset reloads that run; close destroys it. The parent lab's state is unchanged.
  `Tall phone / compact` changes the actual game viewport, not a stretched image.
- Live Mushroom Gatherer conversations now use this scene and sunlight adapter.
  The run preloads it; failed/loading assets retain the old playable fallback.
  Other encounters and the scrolling forest are unchanged.
- Audit: `node tools/background-illustration-audit.cjs`.
- Evidence: `output/background-illustration/`.
- Tests include physical-pixel resolution, 3× phone DPR, cache reuse, iframe
  startup without a pause overlay, real choice clicks, quest state and road return.
- Status: **approved crisp plate and scene-lit composite**. Archived original
  colors and Blender views are comparison/geometry views, not separate approvals.

### Approved gatherer scene lighting

`assets/encounters/gatherer-scene.js` provides a native material-color override for
this sunny clearing: saturated teal coat, cognac leather, warm skin and ivory
beard planes, cooler forest-reflected shade, and translucent cast/contact ground
shadows. It calls the unchanged approved renderer, not a duplicated rig or a
small recolored bitmap. No screen-wide filter or new character design is used.

The subsequent user-requested screen-left shoulder trial replaces only the two
nested upper-sleeve fills at their original draw-order position: light reaches
the outer edge, with one inward-facing shade plane instead of a dark outline.
Its synchronous segment adapter is restored immediately after drawing. The
right shoulder, body, clothing palette and animation are unchanged by this fix.

Default illustration view and its live playtest use **Clearing sunlight**.
Select **Original colors** for A/B review; that choice follows into the playtest.
Greybox views and Art Lab anchors keep the approved original. Live Mushroom
Gatherer conversations use the sunlight version. No reference hash is replaced.

Run `node tools/gatherer-lighting-audit.cjs` for deterministic native rendering,
unchanged silhouette outside that shoulder, palette isolation, context restoration and
animation-frame clipping checks. Evidence: `output/gatherer-lighting/`, plus
original/sunlit scene captures from the background illustration audit.

### Bitmap environment boundary

This plate suits a fixed-camera point-and-click encounter. Keep NPCs, UI,
interactable/animated objects and foreground occluders as separate layers as
those mechanics are added. A clickable region can refer to a painted object;
opening a door or moving a basket requires separate art, not treating the whole
plate as editable geometry. Do not replace the scrolling run renderer with this
single static plate. Ship `assets/encounters/` with the HTML: the runtime scene
module and `mushroom-clearing.png` are required for this encounter's new art.

## Accepted spatial layout / archive: Blender blockout (v2)

The user rejected v1 for inconsistent perspective/scale, dull green values and
uninformative background shapes. It is not a reference. V2 tests actual spatial
construction FIRST, with neutral clay materials, not final stylized art.

- Archive lab: `KnightRush.html?backgroundlab=1&backgroundVersion=v2`.
- Generator: `tools/build-gatherer-blockout.py`, run using Blender background mode.
- Editable source: `gatherer-blockout-v2/gatherer-clearing-v2.blend`.
- Rendered views: perspective, environment-only, same-camera metric grid and a
  separate top-down diagnostic plan. The plan hides trees to expose the layout.
- `layout.json` / `layout.js` are generated from the real Blender camera. Labels
  and the optional approved NPC's display height use projected world coordinates.
- Units: metres; human 1.75, door 2.00, table 0.80, cottage footprint 4.2 × 3.8.
- One perspective camera at eye height 1.70 m; tree crowns are spacing proxies,
  not new foliage designs. Do NOT promote their faceted surfaces into art style.
- The Blender images are LAB ONLY. Live conversation/gameplay is unchanged by v2.
- Audit: `node tools/background-blockout-audit.cjs` (same NODE_PATH as Art Lab).
- Evidence: `output/background-blockout/`.
- Spatial layout accepted by user. The subsequent crisp v3 plate and scene-lit
  composite are now approved under the separate Knight Rush Cutscene skill.

Rebuilding regenerates only this version's generated outputs. Save manual edits
to a new .blend version before rebuilding. No existing tree/character sources
are imported, modified or replaced by this builder.

## Rejected pilot: The Gatherer's Clearing (v1)

A worried father works outside a modest woodland home. A warm curtained window
suggests someone inside; a sparse drying rack explains the shortage; a sorting
bench and damp fallen birch establish his work. The worn path connects to the
actual door. The middle clearing is reserved for the approved gatherer.

- Source: `drawGathererClearingStatic`, `drawGathererClearingAmbient`,
  `drawGathererClearingForeground` in `KnightRush.html`.
- Same scene is used in the mushroom conversation, not just a separate mockup.
- Character source is unchanged; conversation placement is now (264,486), 1.48×.
- Previous backdrop remains available through the lab's version selector.
- Character and material anchors: approved Mushroom Gatherer and merchant.
- Archive lab: `KnightRush.html?backgroundlab=1&backgroundVersion=v1`.
- Inspection areas demonstrate environmental storytelling only. They do not
  award items, alter quest state, or imply a new gameplay mechanic is complete.
- Evidence: `output/background-lab/`; regenerate with
  `node tools/background-lab-audit.cjs` using the same NODE_PATH as Art Lab.

## Review sequence

1. Environment alone: depth, scale, construction, supported props and paths.
2. Character present: same world, clear silhouette, believable location.
3. Grayscale: foreground / midground / distance and useful contrast.
4. Actual dialogue overlay, compact and tall phone framing: important details
   stay above the panel; touch regions follow their objects.
5. Motion: subtle smoke; no moving scenery, random prop respawns or detached art.

Automated checks cover finite geometry, drawing state, selected gameplay state,
canvas coverage, deterministic pixels, cache reuse and lab isolation. They do
not judge beauty, narrative, physical perspective or real-phone performance.

The current approved plate/composite are archived under `approved/`. New scenes
must be reviewed and explicitly approved before adding their own registry entry;
never update hashes merely to make an audit pass or restyle unrelated events.
For interiors and this outdoor revision, establish a shared camera and actual
object dimensions before committing to the final 2D visual treatment.
