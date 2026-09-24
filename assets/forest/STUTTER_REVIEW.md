# Journey frame-pacing follow-up — 2026-09-24

## What changed

- Reuse projection results and end-grove transforms instead of allocating them
  for every tree on every frame. Calls without an output argument still return
  independent objects, preserving the other render modes.
- Stabilize floor/water **cache identities** at 1e-6 world units. Camera and
  geometry coordinates are not rounded. Separately accumulated scroll values
  must not rebuild identical floor geometry because of floating-point drift.
- Use conservative opaque-crown coverage in corners/settling and close end
  groves. Only fully covered trees or native planes are omitted. Placement,
  density, collision, visibility distance and draw order are unchanged.
  Coverage is disabled for screen shake and nonstandard alpha/compositing.
- Reuse a sufficiently detailed resident native-tree tier for smaller requests;
  retire duplicate smaller tiers only after the larger replacement exists.
  Failed allocation preserves the smaller fallback; nothing is upscaled.
- Reuse native crown planes for opaque foreground trees at render scale <=1.25.
  The high-resolution variant was rejected after worse DPR2 pacing. These are
  runtime copies of the original polygon art, not new/generated sprites.
- Whole-tree/background surfaces take priority over optional crown surfaces.
  Reclamation pauses new crown admission to avoid allocation churn. A surface
  sampled in the current frame is never resized/recycled in that same frame.
- Preserve the existing 5 MiB shared RGBA surface cap (not total browser RAM).
  The reusable CPU coverage grid is small and contains no additional texture.

## Measurement contract

`tools/journey-live-pacing.cjs` measures the real game `frame(now)` callback.
Fixed update steps only position the initial fixture; they do not drive the
measured movement. Forest, Disco and Crimson are tested straight and turning,
including subsequent settling. Native RAF intervals, CPU submission time,
1% low, missed intervals, canvas allocation and cache usage are reported.

Sources are pinned and hashed. The pre-change baseline is the local snapshot
`output/stutter-source-before/` (HTML plus both forest modules). The boot/fixture
RNG and persistent ambient state are reset identically; fixture hashes must
match before comparing results. The first 30 frames are excluded from steady
statistics, but startup-inclusive results are retained separately.

Tests use headless Brave on this PC. DPR2 is desktop Chromium at a phone-sized
viewport, **not Safari, a physical phone, or a thermal-soak test**. RAF gaps are
a pacing proxy, not a guarantee of display presentation time. Idle cadence is
measured for each context: this host changed from roughly 6 ms to roughly 8 ms
during testing, so those populations must not be pooled into one speedup claim.

## Visual and gameplay checks

`tools/stutter-visual-audit.cjs` compares 26 deterministic baseline/live views:
three biomes, both corner directions, a dead-end grove, shake and translucent
trees, on desktop and DPR2. Camera/gameplay state and scenery world records
must match. Original tree vertices, material colors and plane order must match
exactly. Frame-by-frame cache usage must remain within the shared cap.

The default image test remains strict. `--allow-native-resampling` explicitly
permits reviewed edge-antialias differences from sampling a larger native cache
tier: zero major changes in flat interiors, interior difference <=20/255,
major changed pixels <=0.2%, mean difference <=0.3/255, and exact source-geometry
equality are all required. It does not replace art approval or update Art Lab
references. The observed large pixel differences were confined to edges.

## Final source-matched result

`output/journey-live-pacing/final-before.json` and `final.json` are consecutive,
non-overlapping native-loop runs. All 12 initial fixture hashes match; all three
final source hashes match the working files. Both runs have roughly 8 ms idle
cadence. The earlier roughly 6 ms populations are separate diagnostic evidence,
not combined with these numbers. Each row is one short 600-frame maximum run;
straight venue fixtures stop when gameplay enters the encounter.

Steady missed intervals (gap >1.5x measured idle cadence), before -> after:

| Viewport | Section | Straight | Turn + settling + following road |
| --- | --- | ---: | ---: |
| Desktop DPR1 | Forest | 0.00% -> 0.18% | 0.00% -> 0.00% |
| Desktop DPR1 | Disco | 0.00% -> 0.00% | 5.79% -> 4.74% |
| Desktop DPR1 | Crimson | 0.61% -> 0.00% | 8.95% -> 6.67% |
| Phone viewport DPR2 | Forest | 1.05% -> 0.00% | 5.09% -> 4.21% |
| Phone viewport DPR2 | Disco | 15.33% -> 12.37% | 20.53% -> 14.04% |
| Phone viewport DPR2 | Crimson | 7.09% -> 7.64% | 18.07% -> 12.98% |

This is a partial improvement, not elimination of missed frames. In particular,
special-road turns still miss deadlines, and short-sample 1% lows remain noisy.
Desktop forest's single late frame worsened its 1% low in this final sample;
Crimson straight DPR2 was also slightly worse. Do not cherry-pick these away.
No physical Safari or long-session result has been obtained.

Additional regressions cover all 18 Journey theme/direction combinations,
obstacle handoff, dead ends, road-row seams, skyline/biome transitions and road
battle caching. The final reviewed-resampling visual report is
`output/stutter-visual/final/report.json`; raw strict image results remain in
that report alongside the separate edge-only review.

## Repeating the checks

Run browser measurements serially, with other browser audits stopped:

```text
node tools/journey-live-pacing.cjs before --baseline --brave --both
node tools/journey-live-pacing.cjs after --brave --both
node tools/stutter-visual-audit.cjs review --allow-native-resampling
```

Do not claim zero stutter from a higher average FPS. Compare the same route in
Brave and physical Safari, including sustained special-road turns. No FPS cap,
simulation-speed change, density reduction or render-resolution reduction was
used in this pass.
