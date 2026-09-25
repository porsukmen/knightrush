# Mossy Oak road revision — candidate

Uses Knight Rush Special Road and Knight Rush Art. Inspected live Road Lab
Crimson/Disco references; retained existing trees, placement, road projection,
collision lanes and the inn building/interior. No new approved reference.

## Materials and obstacles

- Man-made cobblestone carriageway starts 8 world units after the junction,
  in both production generation and Road Lab. Exact opaque boundaries follow
  the inn pieces. Green woodland keeps its separate distance-based blend.
- Staggered, clipped-corner stone blocks use quiet warm-grey planes. Placement
  follows fixed world rows, never time/yaw. Their small fixed polygons avoid
  camera-dependent subdivision. Existing row cache owns the geometry.
- Opaque mortar replaces hidden soil on fully paved rows, avoiding duplicate
  ground fill. No new image textures, lower resolution or tree-density changes.
- Boulder contract: fallen native-drawn cask, broad top/front/end planes,
  two hoops, few stave seams. Removed the many-face obstacle mesh.
- Root contract: BOTH jump and duck variants use the existing tree-attached
  root, with inn materials. Removed the artificial gate and stacked wood hazard.
- Pond contract: retain the existing inn connected water design and lane gaps.

## Optional roadside stops

Inn and merchant require a fresh outward gesture from their physical outer lane.
They no longer brake movement or open automatically. An approach hint begins
40 units ahead; entry is valid from trigger -4 to +18, bounded by slot expiry.
The player must actually reach the outside lane. Fresh keyboard and pointer
consent carry the offered slot ID; held keys, old gestures, paused play and
middle-lane swipes cannot enter. Passing records the stop without interrupting.
Forge, chest, Disco and elite entry contracts remain unchanged. Entered services
still use the existing blocking session, purchases, cleanup and return lifecycle.

## Checks and limits

- `tools/roadside-service-entry-audit.cjs`: keyboard and real pointer entry,
  wrong lane/direction, repeat/stale gesture, pass, return/reentry, paving bounds.
- `tools/mossy-inn-audit.cjs`: real spawn theme assignment, all lane groups,
  native duck/root, cask near/far, desktop/phone, both turns, inn lifecycle.
- `tools/autumn-caravan-audit.cjs`: revised entry and unchanged shop lifecycle.
- `tools/art-lab-audit.cjs`: approved models/baselines unchanged.
- Pacing reports: `output/journey-live-pacing/inn-paving-before.json`,
  `inn-paving-no-overdraw.json`, `inn-paving-normal-control.json`,
  `inn-paving-venue.json`. Short 180-frame Chromium runs, not physical Safari.
  Final mean render CPU before/after (ms): desktop straight 2.87/2.77,
  turn 3.42/3.32; phone emulation straight 2.70/2.79, turn 3.48/3.41.
  Frame pacing remains variable; straight mean FPS was lower in this run despite
  similar CPU, so this is NOT a guarantee of equal FPS or elimination of stutter.
  Rejected same-colour stone batching after worse mobile pacing.
