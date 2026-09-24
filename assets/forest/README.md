# Shared Sunlit Forest / Journey

`sunlit-forest.js` owns the accepted Morning trial's native tree/plant/obstacle
models, ground geometry, morning rider palette and bounded drawing buffers.
`journey-forest.js` connects that art to the live Journey route. The fixed
Morning course remains available through `?morninglab=1`; its UI, invulnerability
and scripted obstacle sequence are **not** installed in normal play.

## Ownership

- Journey still owns the seeded graph, lane input, turns, dead ends, spawning,
  collisions, question-mark gestures, quests, services, combat, loot and town.
- `curvedRoadViews()` provides physical road frames. New woodland uses those
  frames, absolute ground-distance row IDs and the Journey camera, including
  left/right/straight previews and the post-turn coordinate rebase.
- Dead-end trees use four staggered, node-cached native rows (68 records) behind
  the existing road stop, with Journey's unchanged end-cap projection/rebase.
  The legacy renderer retains its original 14 instances. Venues, signs, dancers and encounter props remain in the
  existing depth-sorted world queue. Cave battle interiors remain unchanged.
- Normal rocks, ponds and attached roots use the Morning art. Disco has been
  restored to its original four-column jointed floor, club entrance, dancers,
  amps, cables and soda art in `KnightRush.html`. `disco-grove.js` is now ONLY
  a shared-projection adapter, not a replacement design. Bloodwood bones/pools
  remain intact; crimson roots use the shared native geometry. New plantings
  reserve the original themed decor footprints so grass/trees cannot bury them.
- Selected branch hazards/coins are prepared using the existing pattern and
  clearance rules during the turn. Their exact entity identities transfer to
  the gameplay stream at handoff; rendering does not roll patterns or rewards.
- Per user request, corner timing and Hermite camera translation are restored
  to the established .62-second behavior from commit `8fbe0c4`. The later
  inverse arc-length/odometer-scaling experiment is removed. Lane acceptance,
  route endpoints and preloaded entity handoff are preserved.

## Biome materials, not duplicated forests

The same eight native models serve every road. `journeyThemeStrength()` defines
location-based entry/exit colour amounts. Material palettes map broad foliage,
bark, ground and sky values, with no translucent full-screen colour sheet.
The wide soil/shoulder polygons interpolate continuous opaque material colours
within each world row; they do not inherit tree-cache colour quantization.
Disco retains its dance-floor/light/crowd concept; bloodwood retains bones/thorns and
the wolf lair. Forge/caravan/inn/chest keep their signs, places and interactions
on more lightly coloured variants of the same woodland. No new biome skill is
created yet: disco and elite are candidates for later user review/reference.
Disco again uses its original four-column coloured tiles and dark joints, with
the original opaque RGB exit transition. Both the powered/unpowered experiment
and the contiguous three-column redesign are rejected. Whole-footprint culling
and the shared scratch-buffer projection are retained; covered soil chips are
omitted. **Disco's manufactured dance deck is the hard-entrance exception.**
Natural biome soil (including Crimson) must start at the forest colour, then
blend by world distance like its trees/sky: normal through the first 30 m,
smoothly reaching full biome colour at 95 m. Never reintroduce a minimum-red
floor at the Crimson mouth. This is opaque RGB interpolation, not alpha sheets.

The sky uses a continuous reusable material profile during transitions, **not**
the 16 discrete prop-palette steps (the old sky changed by up to 11 RGB levels
at once). Intermediate sky frames draw the small native panorama directly;
only stable endpoints use the screen-resolution cache. No transition textures
accumulate. Crimson now has a deeper red sky, without changing Disco's floor.

## Woodland density

### Road-stone volume trial

Normal Journey/Morning obstacle rocks now use a small shared road-space solid:
an asymmetric, bevelled slab with a readable front, light upper face and darker
side. Vertices use the existing curved-ground camera, so the top becomes visible
with approach and side faces respond to turns. There is no threshold-based pose
swap, new image asset or raster cache. One/two/three-lane widths remain 3.36 times
lane count; height grows only 1 / 1.18 / 1.36. Bevel widths and the crack are not
stretched with lane coverage. Disjoint lane groups remain separate stones.
Roadside decorative rocks, Disco amps, Crimson skeletons and collision rules
are untouched. Candidate art follows KR-KD broad faces, restrained moss and one
structural crack; it is not promoted to an approved reference yet.

`node tools/road-rock-volume-audit.cjs` captures 95/60/30/10/2 m approach views
at desktop and DPR2 phone size. It checks state purity, finite projected vertices
through left/right rotations and the existing memory cap. The local isolated
rock-draw sample was <=0.2 ms p95, not a physical-phone FPS claim. Evidence lives
in `output/road-rock-volume/after/`.

### Staggered planting

The existing foreground models/sizes stay intact. Four staggered side belts
replace the sparse three-belt layout: the near verge remains readable, while
middle/far ranks and the four-row end grove close empty views beyond trunks.
Pond, root, road and special-prop footprint exclusions still apply. Outer trees
are screen-culled before palette and footprint work, and end trees are culled
before native drawing. The shared 5 MiB raster-cache cap is unchanged.

`node tools/forest-density-transition-audit.cjs` captures desktop/DPR2 straight,
junction and Crimson evidence and samples both real rendered sky ramps. The
September 24 sample reduced sky jumps to <=1 RGB level with no canvas allocation
during transitions. Denser woods add some CPU cost (roughly 0.3–0.8 ms median in
the frozen-frame samples); this is not a zero-cost density increase or a phone
FPS guarantee. Moving-frame, corner, biome-prop, battle-cache and Art Lab audits
also run separately. Screenshots in `output/forest-density/after/` are candidates
for user review, not new approved style references.

Knight Rush Art controls shape/material identity; Knight Rush Cutscene controls
scene light and depth relationships. No approved character renderer or reference
fingerprint is changed. The previously removed long rider shadow stays removed.

## Running background: open Godot-style horizon

The user clarified the intended reference with the sunny Godot screenshot:
open blue sky, thin stepped clouds, low hills and dense distant tree silhouettes.
NOT the classic nighttime canopy and NOT an overhead curtain masking arrivals.
The actual references are `native-godot/assets/world/sky/sunny-morning-v1.png`
and `native-godot/scripts/forest_horizon.gd`. Only their environment composition
is referenced; no HUD or screenshot is pasted into gameplay.

The former tall isolated backdrop trees have been replaced by two low connected
broadleaf silhouette ranks in front of two hill profiles. They supply a forest
backing at the live trees' emergence horizon without covering the sky or
occluding gameplay. Geometry is native sharp-plane Canvas paths, not a bitmap.
Morning stays blue/green; Disco and Crimson retain their local material mapping.
Approved character models were inspected in Art Lab; merchant screenshot UI
and its background were not scene references. Characters, gameplay trees,
road, hazards, camera and route topology are unchanged by this backdrop pass.

Geometry is built once and grouped by material into native Path2Ds. Straight
travel keeps the existing native-resolution sky cache; changing yaw draws the
paths directly, without allocating/uploading a new canvas each frame. This
version uses 21 background path fills in the tested quarter turn. The sun is
one flat light-yellow face without a darker rim. No new bitmap,
render loop or raster memory allowance is added (the shared cap remains 5 MiB).

Evidence: `tools/sunlit-background-audit.cjs`,
`output/sunlit-background/open-horizon/`, and the panorama-boundary cases in
`tools/morning-corner-audit.cjs`. These are technical checks and desktop/phone
viewport captures, not physical-phone measurements or user aesthetic approval.

## Runtime limits

Road cells are painted in material passes: all grass backings, contiguous soil,
then chips/edge details. Same-colour soil cells append to one native path fill,
so antialiased cell boundaries cannot expose the next row's green backing.
This applies to Journey and Morning Lab; spatial biome gradients retain their
existing paints. No extra textures or raster surfaces are used.
`tools/road-row-seam-audit.cjs` checks 24 moving forest frames at desktop and
DPR2 phone viewport sizes against uniform soil; the previous horizontal seams
produced up to 9 bad scanlines/frame, the corrected pass produces zero.

All native model tiers, biome variants, background and battle-plate pixels share a
5 MiB RGBA cap. Variant rasterization is limited to two models per frame;
overflow uses native paths. Large foreground trees never upscale a tiny cache.
Stable forest/full-biome materials are raster-cached. Small opaque intermediate
trees can also reuse 64/128-pixel tiers at render scale <=1.25, with a 1 MiB
sub-limit **inside**, not on top of, the shared 5 MiB budget. High-DPI views keep
native transition paths: extra colour textures crowded their stable working
set and did not improve frame pacing. Larger or fading transitions also remain native paths.
Recently used surfaces cannot evict one
another cyclically. Matching stale surfaces are repainted in place, and the
background surface is reused instead of reallocated. While yaw changes
(including post-turn settling), the distant background uses its native paths
so a full-screen texture is not repainted/uploaded every frame.

The dense-woods performance pass removes duplicate end-tree ground masks.
Model planes carry authored bounds; fully offscreen/buried planes are skipped.
Their below-ground portions are clipped once when geometry is built, so a tree
at its ordinary ground anchor needs no fresh canvas clip. Cached model LRU is
touched once per frame, and biome palette lookup reuses indexed material tiers.
Tree placement, density, camera movement and silhouettes remain unchanged.
Batching disconnected soil chips was tested and rejected: fewer CPU submissions
did not translate into better DPR2 frame pacing. Individual chip paths remain.

Performance evidence: `tools/sunlit-frame-pacing.cjs` covers forest, Disco and
Crimson on straights and real turns, supports repeated runs and records both RAF
frame intervals and CPU command-submission time. `steady*` excludes the first
30 frames; all-frame results retain startup spikes. CPU-derived rates are NOT
actual FPS. DPR2 viewport emulation is not physical-phone hardware. The visual
comparison tool `tools/sunlit-perf-visual-audit.cjs` requires a pre-edit snapshot
of the two forest JS files in `output/perf-source-before/`; it checks the same
seeded scenes without promoting new art references.
See [PERFORMANCE_REVIEW.md](PERFORMANCE_REVIEW.md) for the before/after table,
high-DPI regressions, rejected experiments and physical-phone testing limits.

### Stationary road battles

All ordinary road enemies and the Crimson elite use the same optional stationary
world cache. Only the static painter-queue prefix (background, ground, native
trees, Crimson bones/lair) is retained; the first unknown/animated prop stops the
prefix. All actors, near scenery, dancers, attacks and HUD continue live in the
original order. Behind-world particles bypass the plate for correct occlusion.
Camera/distance/viewport changes invalidate it immediately; returning to the run
releases it. Moving runs and turns never use this battle plate. Other arenas keep
their own rendering (the Wolf Den interior already has a background cache).

One native-resolution plate shares the existing 5 MiB cap, not a second budget.
If it cannot fit (including large DPR2 displays), rendering falls back to live
paths without lowering resolution. Failed reservations are not retried each
frame. This cap measures these tracked RGBA surfaces, not total process RAM.

`tools/road-battle-cache-audit.cjs` checks Crimson plus all six normal enemy types
at desktop and DPR2 phone viewports: live/cached image equivalence, stable combat
state, no per-frame plate rebuild, camera invalidation, particle order and release.
`tools/crimson-battle-pacing.cjs` measures moving combat frames. A serialized
desktop before/after sample reduced CPU median 3.2 to 1.5 ms and P95 5.6 to 2.1 ms.
These instrumented headless measurements do not guarantee physical-device FPS.
Model tiers are built on demand rather than all being baked on the first frame.
Row/floor caches retain only visible road neighbourhoods, clear on a new run,
and release drawing buffers at menu/town. There is no generated sprite atlas,
full-scene image, dynamic light map, per-pixel tint or per-frame audit in play.
The browser/GPU and the rest of the game have additional memory costs.

F8's original projection remains a legacy fallback; normal Journey starts with
the curved renderer and Sunlit Forest. Non-forest stages and separate art labs
keep their own renderers. The common runtime is loaded before the normal frame
loop; only Morning authoring loads `tools/morning-forest-lab.js`.

## Checks

- `tools/sunlit-journey-audit.cjs`: 18 theme/direction combinations, real input,
  exact obstacle/coin handoff, seeded topology/render purity, dead ends, bounded
  caches, no test UI in normal play. `output/sunlit-journey/` has scene captures.
- Existing normal-event, expedition, disco, crimson, chest and forest-loop
  browser audits exercise actual interaction/completion/reward flows.
- `tools/journey-turn-motion-audit.cjs`: both directions, early/late input,
  30/60/120 Hz steps, frame-by-frame equality with the camera function extracted
  from `8fbe0c4`, original duration, exact endpoint and straight handoff speed.
- `tools/sunlit-biome-entrance-audit.cjs`: continuous/monotonic Crimson soil,
  left/right biome previews, unchanged
  incoming forest, time-independent floor colour, conservative corner coverage
  and non-duplicated patch submissions across turn/handoff.
- `tools/sunlit-restoration-audit.cjs`: original decor still queued, no new
  planting/decor footprint collisions; before/after scene evidence.
- `tools/sunlit-panels-stones-audit.cjs`: original four-column opaque tiles,
  restrained one/two/three-lane stone height growth; desktop and DPR2 evidence.
- Morning forest/corner/rider audits protect the isolated trial. Art Lab protects
  approved model fingerprints. Technical passes are not new artistic approval.
- `tools/sunlit-journey-performance.cjs`: serialized old/new Journey CPU drawing
  comparisons at desktop and DPR2 phone viewport sizes, normal/disco/elite/turn.
  These are not real phone FPS or total memory measurements.

### Integration benchmark (2026-09-24)

After the bounded-cache LRU change, the serialized DPR2 phone-viewport run
measured median CPU draw submission of 2.4 / 2.8 / 2.2 / 2.3 ms for forest,
disco, elite and turning, versus legacy 3.8 / 3.9 / 3.1 / 3.1 ms. Peak tracked
native/background buffers stayed below 5 MiB. Desktop medians were 2.3 / 3.5 /
2.9 / 2.7 ms versus 4.2 / 3.6 / 2.7 / 3.4 ms: elite was slightly slower in
that run, and tail timings remain mixed. These headless CPU measurements do
not establish physical-phone FPS, GPU cost or total process RAM. The audit
writes raw samples' aggregates to `output/sunlit-performance/report.json`;
reruns replace that local report.

### Moving-frame optimization pass (2026-09-24)

`node tools/sunlit-frame-pacing.cjs verified` measures real RAF intervals AND
update/render CPU time while moving, separately for Disco/Crimson and
straight/turning at desktop and DPR2 phone viewport sizes. The optional second
argument sets the frame count (e.g. `extended 360`); measurement stops when the
actual venue starts its event, not after measuring a minigame as running.
It preserves cold-frame results, also reports samples after the first 30 frames,
checks the 5 MiB surface cap and rejects more than 48 new canvases per fixture.
Raw reports: `output/sunlit-pacing/before.json` and `verified.json`.

One serialized before/after comparison, 180 moving frames per fixture:

| Fixture | New canvas allocations before / after | CPU P99 before / after |
| --- | --- | --- |
| Desktop Disco turn | 282 / 28 | 7.9 / 6.4 ms |
| DPR2 Disco turn | 286 / 26 | 7.1 / 5.7 ms |
| DPR2 Disco straight | 51 / 22 | 9.7 / 6.8 ms |
| DPR2 Crimson turn | 286 / 26 | 5.4 / 4.7 ms |

These are CPU submission improvements, **not equivalent FPS/1%-low claims**.
Wall-clock tails are still mixed: the verified desktop run retained a 254.5 ms
cold first-scene interval and a 48.5 ms Disco turn interval. A separate Chrome
trace found long GPU raster/flush work during cold scene startup. The test
does not establish that every remaining stall has that cause. Physical phone,
thermal soak and in-app-browser performance still require device validation.

Scratch buffers now replace per-polygon camera/clip allocations; Disco tiles
use that same optimized ground path. Visible roadside water geometry and
scenery records are reused. Mirror-ball cells of equal colour share a Path2D
without reducing dancers' animation rate, forest density, resolution or assets.
`tools/sunlit-ground-equivalence.cjs` compares 50 moving frames against the old
ground projection (zero major alpha differences in this pass). Journey's 18
theme/direction cases, Morning corner/parallax, Disco and Crimson encounter
flows and the biome art/exit tests passed.

F9 / pause Performance now shows a 600-frame rolling mean FPS, actual frame
P95/P99, 1% low (inverse mean of slowest 1%), >25 ms count and active forest
surface memory. Sorting uses a reusable typed buffer twice a second, only
when the overlay is enabled. Authoring audits remain outside normal play.
`tools/sunlit-cpu-profile.cjs --trace` is an optional offline diagnostic;
profiling itself adds overhead and its timings must not be used as FPS claims.
