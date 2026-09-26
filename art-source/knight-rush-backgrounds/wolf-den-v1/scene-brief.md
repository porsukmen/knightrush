# Wolf Den — candidate, not approved

## Current implementation: 2.5D pose cycle

Latest gameplay/presentation corrections: the final path bends slightly left,
ending at (374,340) instead of (404,340). Steak uses fresh crimson/red cut faces
and pale fat. The pup waits at the side during combat and does NOT eat on entry;
food remains in inventory until the optional post-fight OFFER MEAT action.
Each of the four fights starts the knight at x=lane=1. Real debug Kill Boss
clicks work during enemy/player turns and clear active Rush/parry debug freezes.
Browser tests exercise the actual button through all four fights on desktop
and phone, then verify optional feeding consumes the food exactly once.

Latest clarification: "blur" meant speed, NOT a blur filter. Turn to the RIGHT.
Side/diagonal ink drawings are mirrored; the turn takes .24s from t=2.1 to 2.34,
then the rear-only run begins. All pose drawings remain crisp, including the
transition. The mistakenly added blur filter has been removed.
The user requested a more centred but still slightly turned drawing before
the full back view: `rearNear` now bridges rearDiagonal -> back, using the rear
fur palette, nearly centred skull/shoulders/hips and a small visible cheek.

Latest user correction: redraw side/diagonal poses with the native wolf's block
construction, not slanted fox-like polygon silhouettes. Directional pose data
now uses ordered rectangular fur masses, square skull/muzzle, chunky paws and
stepped hackles. The same five-pose cycle remains; direct back snap is the user's
fallback if this candidate is rejected, not an automatic replacement yet.

The user explicitly requested removing the dark ear nick from all wolves.
The one `#2a2c36` ear rectangle was removed from shared `drawWolf`, so it is
absent on adults, fight wolves and the pup. This is an intentional requested
change to the approved source; its stored fingerprint was not silently updated.

The user rejected the revision-4 projected block model. It is removed from
runtime, including its box faces, projection, yaw and surface sorting.

`assets/encounters/wolf-den-poses.js` is the editable text-based drawing file:
front, front-left diagonal, left side, rear-left diagonal, back. The front calls
approved `drawWolf`; new diagonal/side poses use ordered native polygons, and
the rear uses the game's existing `drawWolfBack`. Turn animation selects these
five authored drawings without blending/squeezing one model into another.
After turning, the wolf stays back-facing with a six-frame running cycle while
its ground position follows the corrected path. Pup rendering also returns to
native 2.5D front/body/head passes, not projected volumes. Steak and feeding
gameplay from revision 4 are retained. No new image assets or plate changes.

## Revision 4 (projected actor superseded above)

User correction: no squeezed/overlapping turn drawings, keep feet on the actual
woodland path, show a smaller friendlier miniboss-like pup eating a steak beside
the battle. The generated plates and brown Tavern UI remain unchanged.

- A single articulated volume now turns continuously. Its live front surfaces
  call the approved `drawWolf`; rear fur surfaces call native `drawWolfBack`.
  No whole-sprite flattening, crossfade or profile model swap. Four connected
  legs, folded sitting hind hocks, foreground muzzle, ears and attached tail.
- Timing: sit 1.2s, rise .9s, turn left toward the trail 1s, walk 5.4s.
  Catmull–Rom ground points are (229,572), (231,515), (236,470), (274,433),
  (333,413), (374,391), (363,371), (382,352), (404,340). Heading follows the
  tangent; scale decreases from 1.48 to .12. No clipping across the right tree.
- Pup uses the same volume, shorter body/legs, larger head, cream/silver fur
  and small dark eyes, without adult red glow/scars. During pack/fights it is
  at (78,490), outside the lanes, lowered over the steak at (78,494).
- New flat steak: visible thickness, cream fat cap, red cut face and sparse
  marbling. No drumstick bone or circular target-like rings.
- If food was collected, entering consumes it once and sets `pupFed`. The pup
  eats during all four fights; after victory LET IT FOLLOW adopts it without
  charging another food item. No-food and leave branches remain available.
- Captures/tests now use `output/wolf-den-v4`. These poses are candidates;
  approved model functions and reference fingerprints have not been changed.

## Revision 3 flow (superseded where different above)

This section supersedes the v1/v2 staging and verification notes below. Only
the event flow has user approval; neither the new plates nor poses are approved
Art Lab references yet.

- Three distinct scenes: woodland `wolf-den-forest-v1`, simplified exterior
  `wolf-den-outside-v2`, simplified interior `wolf-den-inside-v2`.
- New generated forest source: `forest-source.png`. Separate open woodland,
  warm upper-left sun, rightward path behind a foreground tree, no cave or
  baked actors. Existing v2 cave plates retain their simpler large shapes.
- Sit 1.35s, rise .85s, whole-body turn .8s, walk away 2.2s. Native front and
  back miniboss renderers share a side-volume bridge; no head-only rotation.
  Scene time waits for the selected plate to settle and respects pause.
- Trail: FOLLOW / BACK TO THE ROAD. No loot-search branch. Following opens
  the separate exterior; ENTER / LEAVE, with no adult pack outside.
- Side-lying bone-in meat is native art at (90,479), supported by the low rock.
  Direct once-only padded hotspot (52,426,82,94). No TAKE label or brackets.
- Entering reveals four actual `drawWolf` miniboss actors at (229,448,.94),
  (155,415,.73), (310,408,.70), (354,467,.84). No copied adult event model.
- Four real fights: waiting wolves remain in the same interior, the next wolf
  advances over .7s immediately after the prior defeat. No wave/blank screen,
  road movement, intermediate loot or healing. Existing kill score remains;
  the large ENEMY DEFEATED / OVERKILL banners are suppressed inside the den.
- Pup emerges from the nest. Separate proportions assembled from native art:
  short .66 body, .90 head, silver/cream fur, dark eyes, no red sockets/glow.
  Meat feeds it once; returning to the run grants the existing companion.
- Local warm exterior/cool interior material adapters, not screen filters.
  UI uses the exact shared Tavern brown palette, no contextual green recolor.
- All three registered plates have 1086×1448 and 576×768 tiers (6,290,112 /
  1,769,472 decoded bytes each); the manager still permits max two resident
  or loading entries, only the active scene pinned. No three-plate preload.

Current QA: `journey-wolfden-audit.cjs` tests 100 seeds, real attacks, four
continuous fights, no-food/decline/stale input, one pickup, adoption and companion
persistence. `journey-wolfden-browser-audit.cjs` tests desktop and phone touch,
three scene IDs, native four-wolf count, pause, feeding and return/release.
Motion and composite captures: `output/wolf-den-v3`. Additional presentation
audit covers scene material comparisons and retired chicken selection.
These tests do not constitute aesthetic approval.

## Historical v1/v2 notes (superseded where different)

Requested 2026-09-26: replace the roadside wolf adventure environment with generated cutscenes; a sitting wolf stands and leaves; four readable adults, clear native clickable meat, minimal narrative UI. Escaped Chickens removed from new encounter selection and Road Lab. Existing chicken quest completion is retained for already-started quests; chicken minigames are unrelated.

## References and generation

- Approved Gatherer crisp plate and archived composite: clear forest material boundaries and scene-lit live actor.
- Approved Basalt Hearth v4 plate: broad simplified materials and readable warm/cool lighting, not its forge setting.
- Approved isolated Art Lab wolf: square ears, amber eyes, broad chest, wedge muzzle, stepped fur, planted paws. Original combat renderer unchanged.
- Exterior generated source: `outside-source.png`; interior: `inside-source.png`. Built-in image generation, no rasterized code placeholder.

Exterior prompt: portrait 3:4 woodland cave, direct mildly downward camera, irregular mossy stone arch, open continuous clearing, warm upper-left daylight and cool green shade, empty ground for four wolves and an initial foreground wolf. Low rock at left for separately rendered meat. No baked actors, food, bones, UI or text; crisp broad simplified shapes, no painterly microtexture, blur, fog or bloom.

Interior prompt: same stone/material family, spacious natural den, dry straw nest right, open central fighting floor, warm light from upper-left and cool deep blue-green shade. Broad clean rock boundaries, no actors or interactive props, no text/UI. Exterior source is world/material reference, forge plate only clarity/style reference.

## Scene contract

480×800 authored frame; whole image fills device safe padding. Native story actors share its vertical mapping and scene hotspots invert that mapping; decision buttons remain in logical UI space. No extruded edge pixels. Exterior low rock/meat anchor (91,462), initial feet (249,593), four adults' feet (215,404), (285,414), (183,466), (313,478). Interior waiting adults use staggered side positions to avoid hiding behind the active wolf. Active fight uses existing combat camera. Pup feet (245,539).

Initial motion: seated 1.35s; haunches rise over .85s with planted front paws; .55s turn; 1.9s walk into cave, then trail choice. No duplicate front/back actor or crossfade. Native seated/rising rig is a candidate variation of approved wolf, not a new approved reference. Scene-local fur material adapters cover both adventure actor and unchanged combat renderer. No full-screen tint/filter.

Meat is native art, with contact shadow and small object-local corner indicators; one hit rectangle (52,426,82,94). Cave, tracks and pup have direct hotspots plus keyboard-compatible compact decisions. No four-fight counter/exposition panel. Normal combat action/health feedback remains for playability.

## Asset ownership

Two plates; standard 1086×1448 (6,290,112 decoded RGBA bytes each), constrained 576×768 (1,769,472 bytes each). Shared event-visuals/cutscene-handler owns selected tier, max two entries; only active scene is pinned. No per-frame image allocation, processing or secondary fullscreen cache for ready plates. Original native background only loading/error fallback. Both tiers are packaging resamples, no sharpening.

User approval is still required before promotion to Background Lab references.

## User-directed simplification v2

Both original sources were edited through image generation, preserving camera, cave opening, rock/nest positions and lighting. Prompt: remove roughly 70% of small foliage shapes, rock facets/cracks and ground noise; retain broad grouped leaves, large quiet rock faces and only a few ground color patches. Crisp edges, no blur/sharpen trick. New sources `outside-simple-source.png` / `inside-simple-source.png`; runtime uses `wolf-den-*-v2.png` and mobile variants. V1 kept as a recoverable draft, not selected at runtime.

## Verification

Passed: journey-wolfden-audit (100 seeded routes; four sequential fights; no between-fight heal; meat once; adopt/decline/no-food/search/retreat; pause; companion persistence), journey-wolfden-browser-audit (real phone touch and desktop), wolf-den-presentation-audit (sit/rise/turn/walk frames, neutral/scene lighting comparison, exact padded meat hotspot, retired chicken selection, scene ownership/release), cutscene-audit (approved plates untouched, both tiers/reservations), event-visuals-browser-audit, background-illustration-audit and ui-system-audit. Captures in output/wolf-den-browser and output/wolf-den-presentation inspected.

Global art-lab-audit still stops at the pre-existing KRTavernSlide.barry source digest mismatch. That actor and baseline were not changed in this task. Native wolf source remains untouched; new event poses are candidates.
