# Sunlit biome adaptation — candidate, 2026-09-24

## Current material rule: Disco is the exception

User confirmed: only the manufactured Disco deck has a hard entrance. Crimson
soil must use the ordinary location-based natural-biome blend (0 at entry,
normal through 30 m, full red at 95 m). The later 72% minimum-red experiment
below was rejected because it creates a visible cross-road colour step.
Road colour stays opaque; no translucent overlapping floor sheets. Disco art,
decor and tile entrance behavior are unchanged by this correction.

## Current decision: restore original Disco and turn behavior

The user rejected the replacement Disco look. Its original four-column dark-
jointed tiles, nightclub mouth, actors and hazard drawings are active again;
`disco-grove.js` now only adapts floor projection. The chronological experiments
below are superseded, not accepted style references. The .62-second Hermite
camera from `8fbe0c4` replaces the later constant-speed turn experiment.

Crimson decor was still seeded/queued, but the new planting stream occupied
its ground positions. Existing decor positions now reserve planting clearance
for both Crimson and Disco; no new decor RNG or duplicate spawn path is added.
The inspected Crimson fixture retained all 22 decor entries, including 9 bone
variants, while nearby planting collisions dropped to zero. See
`output/sunlit-restoration/{before,after}/` and the legacy-comparison turn audit.

## Follow-up: simple Disco deck and readable Crimson entrance

The user rejected the powered/unpowered floor idea. The deck now uses ordinary
static coloured inlays: eight-metre rows, no dark micro-gaps, no animation clock,
no alpha fade. Timber borders are submitted per 32-metre section. Footprint
culling replaces centre-only rejection, so a panel still on screen during a
turn is not removed just because its centre leaves the camera range. Hidden
soil chips beneath the opaque deck are not drawn. No extra texture memory.

Historical, superseded: Crimson clay started red at the branch mouth (72% of the full clay
palette), deepening spatially. This changes the branch's own soil, not the old
road's trees, sky or soil. Both left/right previews are covered by
`tools/sunlit-biome-entrance-audit.cjs`, including clock-independent colour,
150-frame turn/handoff stability and footprint-culling regressions.

The turn fixture submits 3,840 floor patches instead of the previous 21,630
over 150 frames (82% fewer). This is floor submission work, NOT an 82% whole-game
speedup. Serialized moving-frame reports are under
`output/sunlit-pacing/simple-floor-{before,after}.json`. Phone-viewport emulation
Disco turn steady CPU P99 measured 10.1 -> 6.2 ms; desktop turn P99 was essentially
unchanged at 6.3 -> 6.4 ms. A cold first-scene GPU/RAF stall remains. These are not
physical-phone measurements or a guarantee that all frame spikes are solved.
Preview evidence: `output/sunlit-entrances/`. Candidate pending user review.

## Previous follow-up: light panels and grounded stone proportions

Per user direction, installed Disco floor panels no longer blend into soil at
their exit. They start/end at physical deck boundaries, always opaque. Fixed
world-row colours alternated bright powered panels with dark unpowered panels
(superseded above);
travel supplies the changing pattern, not animated flashing or extra lights.
Forest foliage/atmosphere still retain their spatial biome transition. The
sharp-plane silhouette and existing wooden frame remain unchanged.

Native obstacle stones widen for two/three-lane groups with restrained height
growth: 1 / 1.18 / 1.36 times the single-lane height, rather than 1 / 2 / 3.
Their feet, lane footprint and collision requirements stay put;
single-lane stones are also 20% lower. Roadside decorative rocks are unchanged.
Both live Path2D drawing and bounded-cache crops use the same vertical scale.
Evidence: `output/sunlit-panels-stones/` (desktop and DPR2) and
`tools/sunlit-panels-stones-audit.cjs`. Art Lab reference checks passed, but these
new materials/proportions remain pending user review, not approved references.

## Second pass: user-requested Disco rebuild / Crimson continuity

The first Disco adaptation below was rejected as insufficiently integrated.
`disco-grove.js` now owns a new open timber pavilion and throne, three-column
inlaid dance deck with wooden edges, supported mirror-ball rigs and pennants,
volume-shaded speaker cabinets, copper plugs/cables and labelled soda spills.
Roadside actors call the approved articulated `drawDiscoCourtier` rather than
the old stick-figure crowd. The King and his minigame are not redesigned.

The scene is authored in native geometry at existing world anchors; original
forest/tree silhouettes and the shared road remain the base. The pavilion is
open to the trees, not a flat black wall. Dawn becomes cooler beneath the purple
canopy; amber timber/gold, turquoise accents and purple cloth retain separate
materials. Supported props, contact with the ground and predictable overlaps
take priority over adding decorative density. No bitmap or extra raster cache.

Crimson keeps its existing props and foliage. Soil is now red clay rather than
brown. The visible bands came from four-metre flat fills AND sixteen-level
material rounding. Road/shoulder fills now use continuous RGB interpolation
inside the existing opaque polygons, with a gradient axis derived from the
projected road cross-section. Tree-cache variants stay bounded; ground colours
do not grow a new palette cache. Small soil chips remain flat, crisp shapes.

Evidence: `sunlit-biome-art-audit.cjs` additionally captures the transition and
one/two/three-lane Disco hazards, checks opaque continuous soil paints and
collision-state purity. Existing turn/completion/reward and Art Lab checks still
apply. Neither scene is promoted; a biome skill waits for the user's approval.

Second-pass isolated headless CPU check: DPR2 Disco median 3.0 ms versus old
Journey's 2.3 ms (the articulated crowd is more costly); Crimson 1.7 versus
2.5 ms. Raster cache remained below 5 MiB without new bitmap allocations.
Maximum outliers still occurred, so this is not a real-phone smoothness claim.

---

## Historical first-pass review

Uses Knight Rush Art and Knight Rush Cutscene. This review is not a new skill
or a user-approved reference. Base models and all approved character hashes stay
unchanged; the visual output is pending user review.

## Shared scene contract

The existing Journey camera, curved ground and native Morning tree silhouettes
are the spatial authority. No background plate, image filter, alternate forest
mesh or new gameplay mechanic. Entrance props advertise a turn; the incoming
woods stay green. Spatial colour begins farther into the branch and recedes at
the exit. All foliage, bark and soil retain their broad three-value planes.

## Disco

- Story: a forest party leading to the King's existing speaker/curtain venue.
- Lighting: violet canopy shade, cooler ambient fill, pale key highlights.
  Gold/cyan/rose lamps and dance tiles carry the colour accents. Distant hills
  and clouds are explicitly muted; generic colour math must not make them neon.
- Ordinary water remains cool reflective water, not grape soda. Existing soda
  obstacles and bottles retain their separate meaning.
- Timber lighting arms point inward on either roadside. The existing attached
  fixtures, dancers, entrance mirror balls and venue stay in the depth queue.
- The dance floor's opaque exit colours interpolate toward the actual shared
  soil material at that position, not the retired green road or a fixed tan.

## Crimson / elite

- Story: an unhealthy red grove, discarded remains, thorns and a wolf lair.
- Lighting: smoky plum/ash distance, restrained amber key, dark wine shadows.
  Scarlet crowns contrast with bark, the earthen road and pale bone landmarks.
- Local flowers, moss, logs and rock planes have explicit material targets:
  dried ivory/rust plants, deep red growth and desaturated stone. No accidental
  candy-pink flower field. Woodland water receives dark red/reflected ash values.
- The native root silhouette remains attached to its mother tree. Existing
  skeleton, blood-pool hazards, totems and lair keep their geometry/gameplay.

## Live actor and budget

Only the real player's supported appearance materials receive local steel
key/shadow changes. Brown horse, blue plume and heraldry retain their identity.
The adapter returns the exact morning appearance outside the colour envelope.
No new shadow, full-screen tint or change to an approved rig.

No additional raster models or buffers. Existing native/environment cache cap
remains 5 MiB. Colour maps and one current rider appearance are cached; there is
no per-pixel processing or runtime audit. Real phone performance remains untested.

## Evidence

- `tools/sunlit-biome-art-audit.cjs`: desktop and DPR2 phone-size entry, venue,
  exit and post-exit; source-model identity, state purity, local rider material
  restoration and buffer bounds. Captures in `output/sunlit-biomes/`.
- `tools/sunlit-journey-audit.cjs`: 18 direction/theme cases and hazard handoff.
- Disco and crimson browser audits: real turns, minigame/fight completion,
  rewards and run return. Art Lab and cutscene audits protect approved anchors.

Visual review: the woods are now consistent with the shared road art, and the
focal props read against quieter distance. The old venue/lair structures and
small roadside dancers were retained, not redesigned or newly approved here.

Final isolated CPU submission comparison (DPR2 viewport, not a phone): disco
median 4.1 ms versus legacy 4.1; crimson 3.1 versus 3.6. Turn p95 was 11.8 ms
versus 8.7. Long maximum outliers appeared in this headless batch (up to 702 ms
new, 521 ms legacy); this does not certify stutter-free physical-device play.
No claim of universal speedup is made. Tracked raster buffers remained below
5 MiB in all captured cases. Raw aggregate results are in the performance report.
