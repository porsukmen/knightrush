# Dense forest performance review — 2026-09-24

Later real-frame-loop stutter work, cache policy and validation are recorded in
[STUTTER_REVIEW.md](STUTTER_REVIEW.md). The fixed-step measurements below remain
historical workload results, not proof of native game-loop frame pacing.

## Scope and method

This compares the approved denser woodland / volume-rock implementation before
and after the performance pass, not sparse legacy trees against dense trees.
Tree placement, density, animation rate and render resolution are unchanged.

Edge headless on this Windows PC; desktop 1280x900 DPR1 and a 390x844 DPR2 phone
viewport. The second configuration is **not a physical phone benchmark**.
Six seeded moving fixtures cover forest, Disco and Crimson, straight and actual
corner turns. Each runs three times for 180 simulation frames at 1/120 s while
waiting for real requestAnimationFrame callbacks. Tests run serially. Movement
is deterministic, not a long real-time play session or a thermal-soak test.

Numbers below are medians of the three per-run summaries. Steady statistics
exclude the first 30 frames; full startup-inclusive statistics remain in the
local JSON reports. FPS comes from RAF gaps, never inverse CPU submission time.
1% low is inverse mean of the slowest 1% of those gaps. These short samples have
only about two tail frames each and remain sensitive to browser/host scheduling.

## Desktop results

| Scene | Mean FPS before → after | 1% low before → after | CPU median before → after | CPU P99 before → after |
| --- | --- | --- | --- | --- |
| Forest straight | 161.8 → 165.0 | 82.6 → 141.8 | 2.9 → 2.6 ms | 4.9 → 3.5 ms |
| Forest turn | 157.6 → 162.9 | 81.3 → 82.3 | 2.5 → 2.2 ms | 4.2 → 3.7 ms |
| Disco straight | 164.0 → 165.1 | 107.5 → 155.0 | 3.0 → 2.6 ms | 4.5 → 4.3 ms |
| Disco turn | 126.3 → 133.8 | 66.2 → 81.3 | 3.1 → 2.7 ms | 5.0 → 4.5 ms |
| Crimson straight | 165.1 → 164.9 | 150.4 → 148.1 | 3.0 → 2.5 ms | 5.8 → 4.0 ms |
| Crimson turn | 120.2 → 127.0 | 65.6 → 81.6 | 2.8 → 2.6 ms | 4.6 → 4.7 ms |

## High-DPI viewport results

| Scene | Mean FPS before → after | 1% low before → after | CPU median before → after | CPU P99 before → after |
| --- | --- | --- | --- | --- |
| Forest straight | 164.1 → 136.8 | 107.5 → 66.0 | 2.8 → 2.5 ms | 5.2 → 4.8 ms |
| Forest turn | 137.6 → 139.1 | 81.6 → 65.8 | 2.5 → 1.9 ms | 3.9 → 3.7 ms |
| Disco straight | 150.1 → 142.3 | 82.0 → 82.0 | 2.7 → 2.7 ms | 4.5 → 4.5 ms |
| Disco turn | 104.0 → 106.3 | 54.9 → 54.9 | 3.1 → 2.8 ms | 5.2 → 4.9 ms |
| Crimson straight | 159.8 → 161.8 | 82.6 → 83.0 | 2.7 → 2.5 ms | 4.6 → 4.2 ms |
| Crimson turn | 101.1 → 99.9 | 65.6 → 47.1 | 3.0 → 2.9 ms | 4.9 → 5.5 ms |

CPU savings do not establish a universal frame-pacing improvement. High-DPI
tails remain mixed, including regressions in this sample; do not advertise this
pass as a phone FPS fix or all stutters eliminated. Cold first-scene intervals
also remain: the last high-DPI run recorded a 236 ms startup gap. GPU/compositor,
startup and device-specific costs still need investigation on the actual phone.

## Retained changes

- Cull invisible model planes with precomputed bounds.
- Preclip native tree geometry below its ground anchor once, avoiding repeated
  per-tree canvas masks; remove the second end-tree ground mask.
- Touch cached model LRU once per frame and reuse indexed palette tiers.
- Cache only small opaque intermediate tree colours at render scale <=1.25,
  with a 1 MiB sub-budget inside the existing shared 5 MiB pixel-surface budget.
  High-resolution transition trees retain native paths. This is not a resolution
  reduction; large foreground silhouettes stay vector-drawn.
- Keep the existing two-model-builds-per-frame and recent-surface protections.

Disconnected ground-chip batching was rejected: it reduced CPU submissions but
worsened high-DPI frame pacing. Broad high-DPI intermediate-tree caching was
also restricted to avoid crowding out the stable forest working set.

The 5 MiB limit covers tracked RGBA drawing surfaces, **not total browser RAM**.

## Evidence and checks

Local reports (generated output is not published):

- `output/sunlit-pacing/density-baseline.json`: pre-performance source snapshot.
- `output/sunlit-pacing/density-shipping.json`: final desktop measurements.
- `output/sunlit-pacing/density-shipping-hidpi-clean.json`: final high-DPI run.
  The later cache eligibility guard changes only high-resolution views, so the
  desktop measurement still describes the shipped desktop path.
- Exclude `density-shipping-hidpi.json`: it overlapped regression tests.
- Exclude batching experiments and concurrent profiling from final comparisons.

Run `node tools/sunlit-frame-pacing.cjs LABEL 180 3 live` to repeat both viewports.
Optional last argument: `desktop` or `phone-emulation`. Replacing `live` with
`baseline` loads the two saved forest modules from `output/perf-source-before/`;
that snapshot must exist to reproduce this historical before/after comparison.

Visual before/after audit passed ten scenes: largest changed-pixel fraction above
24 RGB levels was below 0.005%, confined to raster/path antialias differences.
Journey's 18 theme/direction cases, corner/handoff, row seams, biome entrance,
Disco panels/rock dimensions, battle cache, density/sky transition and Art Lab
technical checks passed. Source and Pages-build parse/boot checks also passed.
These checks do not constitute new artistic approval or physical-device testing.

For device testing use F9 or Pause → Performance (also `?perf=1`), and compare
the same route with the 600-frame rolling FPS, 1% low, P95/P99 and surface count.
Test normal forest, both special-road entrances/exits, turns and combat after
several minutes of play; report the device/browser and the problematic section.
