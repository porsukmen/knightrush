---
name: knight-rush-special-road
description: Design, implement, or revise Knight Rush special roads using Crimson as the natural reference and Disco as the man-made reference, preserving the existing running-world renderer while adapting theme colours, decorations, obstacles, and event venues.
---

# Knight Rush special roads

Resolve repository paths from the game root, three levels above this directory.
Use this skill for themed running-road art and its integration, not ordinary
combat balancing or unrelated renderer optimization. It supplements
`tools/skills/knight-rush-art/SKILL.md`; read that art contract for artwork.
Use the cutscene skill only when also making a separate event/cutscene background.

## Approved references and live inspection

Start in **`RoadCreatorLab.html` / `KnightRush.html?roadcreatorlab=1`**. Its
`art-source/knight-rush-special-roads/creator-references.js` catalogs all six
current user-approved roads: Crimson, Disco, Basalt Forge, Gilded Grove,
Autumn Caravan and Mossy Oak Inn. Inspect surface, decoration, obstacle lane/depth
variants, venue and both turns. The left image is live code; the right is a
locked approval, not permission to treat every future live edit as approved.
`creator-baseline.json` pins the clean images and records source-file hashes at
approval (uncommitted source included). Image hashes are integrity checks;
source-file hashes are provenance, not a prohibition on unrelated gameplay edits.
For reference-lab or catalog changes, run `node tools/road-creator-lab-audit.cjs`.
Its desktop/phone-sized checks include all themes, lane/depth controls, image
integrity and exclusion of lab instrumentation from normal gameplay.

Also read relevant entries in `art-source/knight-rush-special-roads/road-references.json`. It registers
Crimson (`bloodwood`) as **natural** and Disco (`disco`) as **man-made**, including
their ground, vegetation, decorations, obstacle families and central venues.
The user's 2026-09-25 approval covers these visual examples, not their performance
or every historical implementation. The source revision records the restored
palette; do not use the subsequently rejected wine-soil/red-verge experiments.

For gameplay inspection use `KnightRush.html?roadlab=1` (F10) or the Creator
Lab's per-biome Play link. Select ELITE or DISCO for the construction anchors,
use the current Sunlit/Journey forest, and inspect the entrance, full-theme road,
left/right turns, venue approach and exit. Use `?discolab=1` for the King/throne
relationship. For character design use the approved isolated Art Lab models,
not a screenshot's UI/background. Road Lab scenes ARE valid environment and
placement references; their UI is not artwork to copy.

If the live lab cannot run, inspect the registered renderers at the recorded
revision and report the missing visual check. Do not silently substitute a
placeholder minigame, an old forest version, or an arbitrary output screenshot.

## Two construction types

| Type | Anchor | Boundary treatment |
| --- | --- | --- |
| Natural | Crimson forest / elite lair | Soil and surrounding material colours blend into and out of the biome over world distance. Keep the ground opaque; interpolate material colours rather than fading an entire road sheet. |
| Man-made | Disco floor / King stage | Built surfaces have deliberate, opaque physical edges at entry AND exit. No translucent tile lead-in or trailing soil-colour fade. Surrounding vegetation/atmosphere can still transition softly. |

Choose the type from the theme and user's intent. Ask when it would materially
change the design. An artificial installation inside a natural biome can have
a hard-edged platform and soft surrounding biome; do not force one boundary
rule onto every surface. Disco is a construction example, not a requirement
that every man-made road use coloured squares, lamps or a stage.

## Preserve the road; design its theme

- Keep current road projection, width/topology, tree geometry, density, row
  distribution, depth ordering and spawn/visibility system. A special road is
  a themed layer on the existing forest, not a new scrolling background or a
  replacement renderer. Structural changes require a separate explicit request.
- Recolour existing materials with coherent main/light/shadow planes. Keep
  their identity and lighting; avoid a full-screen tint or new duplicate trees.
  Match the environment to the requested theme, not necessarily red or purple.
- Track **soil, soil details, flat off-road ground, jagged verge planes, plant
  leaves, bark, canopy and sky separately**. A request to recolour the flat
  grass ground does not authorize recolouring plants or the road. Confirm the
  target if ambiguous; preserve every unrequested palette entry.
- Make the biome readable through a few purposeful theme-specific props and
  obstacles. Vary size, spacing, orientation and combinations using seeded
  world placement. Preserve roadside depth/forest density without rigid pairs,
  random clutter or trees intersecting pools/venues.

## Decorations, obstacles and the central event

Use the catalog's individual renderers as construction references, not just
the general palette. Every new road should have an intentional decoration
family, themed obstacle appearances and a distinct central event composition.
Reuse the existing collision/action contracts unless changing mechanics is
explicitly requested.

- For a new special road or full redesign, create theme-specific obstacle
  artwork, not only a palette swap of the normal road's obstacles. Preserving
  the renderer means preserving projection, visibility, lane/collision and
  jump/duck contracts, NOT retaining the old obstacle model. Design a distinct
  silhouette, structure and material planes that communicate the new theme.
  Roadside decoration does not fulfil an on-road obstacle requirement.
  Before drawing, map each obstacle family to its requested new appearance;
  record explicit keep-as-is exceptions. For example, basalt calls for a new
  basalt rock and a dry pit with broken rock edges and visible depth, not a
  recoloured pond; the tree-attached root continues. A pit and a pond are
  different visual designs even when they share the same jump/lane mechanics
  or a legacy internal obstacle identifier.
  This does not expand a narrow colour-only edit into an obstacle redesign.
- Decoration: ground contact, physical support and scale must make sense.
  Crimson mixes bone shapes, skulls, ribs, thorns and mushrooms; Disco combines
  supported lighting rigs, speakers, mirror balls and cheering/dancing people.
  Do not substitute the same skull or NPC repeatedly at uniform intervals.
- Junction cues are part of the environment, not route advertisements. Do not
  place a signboard, pictogram or miniature event prop at a turn to announce
  its destination (for example, a tiny chest on a pillar for the treasure road).
  Suggest the biome through grounded, theme-appropriate materials and scenery:
  treasure can use raw gold seams or small gem clusters. Keep the actual event
  chest at its venue. Apply this distinction to new entrance/turn decorations;
  do not retroactively redesign unrelated approved roads without a request.
- Obstacles: respect occupied lanes and the original jump/duck requirements.
  Connected pools merge across adjacent 2/3 lanes; separated lanes stay separate
  with a real safe gap. Crimson skeleton groups have distinct 1/2/3-lane
  silhouettes. These are reference contracts, not permission to change hitboxes.
  Roots remain attached to a mother tree; suspended artificial obstacles need
  believable supports. Keep the road-surface projection and shared masking.
- Venue: create a coherent, prominent focal composition centred on the event
  slot, supported by the setting. Crimson's bone-framed cave/dais and waiting
  wolf; Disco's open-air throne, King, stage and rigging are the two examples.
  Reuse approved live actors rather than baking them into a background image.
  Venue placement follows the slot, not the arbitrary geometric midpoint.
- The approach must visually lead to the event. Ground contacts, bottom bones,
  steps and platform edges emerge with the same ground curve; no abrupt clipping
  or snapping onto the road. Enter the event through its existing trigger/session
  lifecycle, then hide/retire the venue as appropriate when completed, escaped or
  cancelled so the player cannot run through a stale event illustration.

## Integration and performance guardrails

Consult the catalog's source map before editing. Natural material colour belongs
in the Journey presentation adapter; the Disco adapter is projection compatibility,
not a second copy of the Disco art. Use the shared route/world coordinates and
draw queue for all additions.

- Previews, selected branches and old roads retain their world anchors through
  turns. Do not key positions, natural colour strength or visibility to camera
  yaw or the moment of selection. Both reference themes must be visible around
  junctions when physically in view.
- Decoration and obstacles approach through the existing distance projection,
  clipping and visibility pipeline like trees. Avoid late pop-in, near-ground
  snaps and decorations sliding backward onto the incoming road during turns.
- Continuous sky transitions must not rebuild screen-sized caches or jump
  between coarse colour tiers. Keep tree/material identity stable across handoff.
- Preserve bounded caches (currently the native scene cache has a 5 MiB budget),
  seeded gameplay RNG and stable per-frame work. Avoid new blur/shadow passes,
  unbounded per-colour textures or regenerating static decoration every frame.
  Do not lower resolution, thin the forest or slow gameplay silently for FPS.
- Measure additions against the same current normal-road fixture and the
  pre-change special road, on straights, turns and near the venue. Examine frame
  times and low-percentile pacing as well as mean FPS. Disco has a known remaining
  turn/FPS cost: its approved art is NOT an approved performance budget. Browser
  phone emulation is not physical iPhone/Safari evidence. Reject optimizations
  that only reduce call counts but worsen measured pacing.

## Checks and handoff

For a small palette edit, verify the requested materials and unchanged neighbours
plus relevant entrance/exit screenshots. For a new road or layout change, also
inspect desktop and phone-sized views, distant/near obstacles, 1/2/3 lanes,
both turn directions, event handoff and cleanup. Reuse the catalog's audits;
extend cases for the new theme rather than assuming a passing Crimson/Disco
test covers it. Run the Art Lab audit for artwork changes as its skill requires.
Compare each redesigned obstacle against its normal-road model without relying
on colour: its theme-specific form must be visible, not just claimed in a label.
Verify actual on-road obstacles, not the separate decoration renderer. Retained
families must match the user's explicit exceptions.
Exercise the real spawn/preview/turn-handoff path and assert that entities acquire
the theme themselves. A fixture that manually assigns `roadTheme` only tests the
renderer, not integration; it cannot establish that players see the new art.

For performance-affecting work run `tools/journey-live-pacing.cjs` serially, not
alongside other browser tests; it currently supports forest, disco and bloodwood.
Record limitations and remaining regressions. Test success is not aesthetic
approval. Promote a new visual reference only after the user approves it, record
its source revision and scope in the catalog, and never rewrite an approved
baseline merely to pass a test. Documentation-only work requires skill/link
validation, not a game redesign or a fresh full performance run.
