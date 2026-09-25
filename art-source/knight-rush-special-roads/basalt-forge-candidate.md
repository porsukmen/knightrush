# Basalt Hearth — iteration history

## Current approval (2026-09-25)

The user explicitly approved the final Borin character and Basalt Hearth v4
cutscene after the revisions below. Authoritative current records are
`../knight-rush-sharp-plane/art-references.js` and
`../knight-rush-backgrounds/cutscene-references.js`. The live views are Art Lab
and `?backgroundlab=1&scene=basalt-forge`. Earlier candidate/rejected descriptions
below are history, not the final reference. This does not promote the road biome
itself to the Crimson/Disco special-road anchor catalog.

## Revision 4 (2026-09-25)

User rejected v3 dwarf as stylistically foreign. New candidate uses the approved
live merchant's small-eye face grammar, heavy quiet beard, broad muscular body,
simple smile; no wild hair/goggle/grin. V3 remains rejected, not a reference.
Anvil is lower in a new generated v4 plate; articulated fixed-length arms and
production weapon props share its work-face anchor. Items lie in the surface
plane, not upright. Road Lab uses genuine production special-edge lengths and
production entrance/exit/event-position rules; its1000m extension was removed.
Full prompt/layout/rig notes: `art-source/knight-rush-backgrounds/basalt-hearth-v4/scene-brief.md`.

## Revision 3 (2026-09-25)

User rejected v2's tidy dwarf, overly detailed background and insufficient actor
lighting, and reported unchanged obstacles. Do not use v2 as a visual reference.
Root cause: `journeyObstacleThemeAt` discarded forge and returned null, so actual
spawned entities used normal forest art. The prior audit manually set roadTheme
and therefore missed this integration failure. Forge now passes the spawn-time
theme resolver; genuine run spawns and both turn-preview/handoff paths are tested
without manual theme assignment. Root and its mother tree inherit the palette.

V3 simplifies the generated workshop into broad, quiet planes; source and prompt
are preserved under `art-source/knight-rush-backgrounds/basalt-hearth-v3/`.
The native dwarf now has dishevelled hair and uneven beard, an off-centre work
goggle, asymmetrical expression, a missing-tooth grin and local soot marks.
A separate furnace material adapter warms the left-facing skin/beard/steel and
leaves cool shaded right planes. The held hammer uses the same scoped adapter.
Neutral/lit equal-pose screenshots verify an actual repaint; visual judgement is
still user-owned. V3 retains v2's image dimensions and memory limits.

V3 verification: real-spawn boulder/pond/root all reach Forge art with no missing
theme; left/right turn preview and handoff preserve it. Desktop and constrained
viewport shop/upgrade/return checks pass. Cutscene, Art Lab, 18-case Sunlit Journey,
Background Lab and skill validations pass. No approved reference was promoted.
Short serial Brave timing samples are in `output/journey-live-pacing/basalt-v3-*`:
Forge steady CPU means 2.63/3.14ms desktop straight/turn and 3.42/4.10ms phone
viewport; forest controls 2.20/2.27 and 2.56/2.69ms. Forge phone-emulated p99 CPU
was 9.7/10.6ms versus forest 5.0/4.8ms. These short runs retain a performance gap,
not evidence of forest-cost parity or physical-phone fluidity. No silent quality,
density or resolution reduction was made to hide that limitation.

The records below describe earlier work, not approval or current QA evidence.

## Revision 2 (2026-09-25)

Replaced the rejected workshop with an image-generated cutscene plate; rebuilt
the live dwarf with substantial limbs, cheek/steel/leather planes and layered
copper beard. Scene-matched warm-left/cool-right lighting is local. The foreground
anvil reuses a clipped part of the same plate; workpiece and hammer remain live.
Prompt, inspected layout, source image and packaging notes live in
`art-source/knight-rush-backgrounds/basalt-hearth-v2/scene-brief.md`.

On-road hazards now have new geometry: clustered hexagonal basalt columns for
the boulder, a DRY excavated pit with broken rim and dark depth planes instead
of pond water. Existing tree-attached root continues; jump/duck/collision rules
are unchanged. The legacy `pond` identifier is mechanical, not the pit's art.
Connected 1/2/3-lane layouts use the shared road projection and ground clipping.

Road Lab special fixtures are 1000m with an event at 70%; production route
generation is unchanged. Direct-entry testing starts 42m after the junction.

Verification: dedicated Basalt desktop and constrained-device viewport audit,
real purchase/result/return, both turns, distant/near 1/2/3-lane hazards; current
Art Lab, 18-case Sunlit Journey, cutscene ownership/integrity and Background Lab
audits pass. Approved reference files were not replaced. Skill validators pass.
Mobile tier selection is exercised using LOW_POWER hardware hints: 768x576,
1,769,472 RGBA bytes. Exit returns cutscene ownership to idle. Native forest
cache remains under its independent 5 MiB cap.

Short serial Brave samples (180 frames/case) after this revision: steady CPU mean
2.60ms straight / 2.99ms turn on desktop, 2.61 / 3.27ms in phone viewport
emulation. Frame delivery still misses refresh intervals; these are not proof
of eliminated stutter or a physical-phone performance result. Fixture lengths
changed, so earlier timings below are NOT a controlled before/after comparison
for revision 2. New actor/environment visual quality remains pending user review.

## Rejected first-draft history (not current implementation)

2026-09-25. User requested a basalt special road and a new fantasy dwarf smith,
with a separate road-shop UI and a coherent workshop containing a forge/anvil.
Approval of Crimson/Disco does not automatically approve this scene.

User review: dwarf is below the approved character quality standard; a recoloured
normal boulder does not satisfy the requested new basalt obstacle; the native
polygon workshop does not satisfy the requested Cutscene background treatment.
Do not use these three components as references. Keep the following brief and
measurements as implementation history, not acceptance evidence. Road palette,
UI and other components were not separately approved or rejected in this review.

## Scene brief

- Natural biome: retain Journey's road, forest geometry, density, projection,
  topology, collision and event rules. Slate soil, charcoal verge, ash-grey
  foliage and stone-like bark blend by existing world-distance strengths.
- Raw resources: narrow gold/lapis/iron veins in soil; embedded uncut mineral
  faces on asymmetric roadside boulders; basalt columns and low ash heaps.
  No added collectible/currency mechanic. Ore props avoid native tree footprints.
- Hazards: same low-volume road boulder in basalt materials, dark existing
  pit/pond silhouette, existing root and attached mother tree. Lane rules unchanged.
- Destination: gabled basalt workshop, shallow right side, roof-connected
  chimney, working furnace left, sheltered smith/anvil in open bay. Doorstep
  shares the curved-ground reveal; venue retires through the existing event token.
- Actor: Borin, squat broad dwarf, copper beard in two broad braided locks,
  square face and brows, blue-slate sleeves, steel gloves, leather apron and
  short planted boots. Not a replacement for the approved town smith.
- Interior camera: logical 480-wide composition; horizon/vanishing point
  (245,164), rear wall/floor join around y=240. Actor at (285,346), 1.21 scale.
  Foreground anvil (308,339), furnace (128,302), supported tools/ore bench right.
- Light: warm forge on actor's left, cool slate ambient. Broad warm skin and
  metal light planes, darker right planes; paired sleeves keep material identity.
- Layers: native architectural backdrop, live body, grounded anvil/workpiece,
  articulated foreground hammer arm, small sparks, slate upgrade ledger.
  UI does not copy the town smith's card spread. Gold/scrap rules unchanged.
- Medium: native Canvas polygon art, not an image plate. No bitmap decode,
  event image registration or additional full-screen image cache is needed.
  No new animation loop, blur pass or per-frame pixel inspection.

## Source and test entry

- `assets/forest/basalt-forge.js`: character, architecture, props, UI, world queue.
- `assets/forest/journey-forest.js`: forge material targets + cached ore veins.
- `KnightRush.html?roadlab=1`: select FORGE, test direct approach and both turns.
- Town `?smithlab=1` retains its old actor, scene and UI.
- `node tools/basalt-forge-audit.cjs`: desktop/phone layout, 1/2/3-lane hazard
  renders, rendering purity, seeded decoration, natural boundaries, real turns,
  actual gold/scrap purchase, arm lift/contact, result, event exit/venue retirement.

## Verification and limits

Art Lab approved renderer hashes remain untouched. Art Lab, 18-way Sunlit Journey,
cutscene integrity and Background Lab browser audits pass. Dedicated Basalt audit
passes. Measured native scene cache peaks remain below the existing 5 MiB budget
(about 4.6 MiB in the dedicated phone-size fixture; this is not total process RAM).

Serial Brave rAF samples, 180 frames per case, before/after source-pinned:

| Fixture | Desktop CPU mean before → after | Phone-emulated CPU mean before → after |
| --- | --- | --- |
| Road straight | 3.07 → 3.18 ms | 3.42 → 2.68 ms |
| Turn + settling | 3.79 → 2.91 ms | 4.66 → 3.20 ms |
| Venue approach | 2.28 → 2.39 ms | 2.48 → 2.72 ms |

These are short diagnostic samples, not a guaranteed performance improvement.
Venue art costs slightly more than the old simple shack. Current forest controls
were also measured (roughly 2.3–2.6 ms mean CPU), so no claim of equal cost to the
normal forest or eliminated 1% lows is made. The final doorstep clipping guard
was added after these pinned timing samples. Physical iPhone/Safari untested.
Raw reports/screenshots are under `output/basalt-forge` and
`output/journey-live-pacing/basalt-*`; these diagnostic outputs are not approved
reference assets. Background remains a simpler native workshop, not a generated
illustration matching the Gatherer's painted level of detail. Subsequent user
review rejected the background, dwarf quality and obstacle substitution above;
passing technical audits did not establish their visual quality.
