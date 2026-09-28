# Jonathan: shared event model studies (2026-09-28)

## Current approval

Running daylight material correction: sunlit-forest now maps armour, steel,
shield rim and sword highlights to the shared KRJonathan daylight silver palette
used by camp, replacing cream/yellow steel faces. Native mounted geometry and
animation, horse, plume, gold accents, scenery and biome lighting adapters are
unchanged. Live isolated Art Lab Jonathan checked before/after; phone/desktop
running views inspected. Lane-contact audit captures actual draw-time rider
appearance and checks the five armour/steel values against KRJonathan materials.
Full Art Lab still reports the pre-existing Duke actor fingerprint mismatch;
protected reference files are not rebaselined.

2026-09-28: user explicitly approved these as the models to use whenever the
knight is drawn ("bundan sonra knight cizilceginde bunlar kullanilacak").
Front/back standing, front/back seated, shared profile and mounted Jonathan
are the reusable identity. Earlier candidate / awaiting-approval notes below
describe review history and are superseded by this approval. New poses adapt
the shared rigs; do not create another event-specific Jonathan design.
Protected reference hashes and unrelated approvals are not reset by this note.

## Camp idle adaptation

Current standing-only correction: plain upright stance, no lateral weight shift
or lean. Near-straight arms use ~6 degree elbow flex; hands hang at the sides,
not at the waist. Only restrained vertical breathing remains in the torso.
Original seated pose, gaze and contacts are numerically preserved across 49
time samples (tolerance 1e-12); equipment placement is untouched. Before/after
live knight/smith/seated-merchant views, close-up standing 0/2/4s, phone and
desktop camp reviewed. Evidence: output/camp-v2/straight-standing.png and
straight-*-ref captures. Camp/model audits pass; Art Lab still stops at the
pre-existing Duke fingerprint mismatch, no rebaseline. Awaiting user review.

WITHDRAWN / reverted: user clarified that the seated pose was already good;
the complaint concerns standing only. Restored the previous symmetric seated
hands, torso and gaze; removed the trial's shared body.pitch projection.
Sword/bow/shield placement is retained. Standing alternatives are discussion
only until the user chooses to try one. The following paragraph is trial history.

Asymmetric rest trial: at full sitting Jonathan leans forward about the hip,
looks down toward the fire, supports the left forearm over the thigh and lets
the other hand hang lower between the knees. A bounded event-only body.pitch
projection keeps the original model/art; standing and non-camp poses are unchanged.
Hands use inverse body projection to retain their distinct world contacts;
transition targets remain inside the 5/5.1 bone reach. Slow breathing and the
pause-aware clock remain. Live knight/smith/seated-merchant references inspected
before and after; fixed bone lengths, phone/desktop and seated motion reviewed.
Camp and shared-model audits pass. Full Art Lab still stops on the pre-existing
Duke fingerprint mismatch (no baseline edits). This supersedes the symmetric
hand-on-thigh camp pose below; user visual review is pending.

Camp equipment follow-up: sword and bow now rest beside the shield against
the log, with ground contacts around y464 and a small shared contact shadow.
Bow uses the production drawSpatialBowProp at rest (no arrow/draw animation).
KRJonathan.sheathedSword presents the mounted sword's blue sheath/hilt with
the original 8.6-by-7 local blade span and 3.27 grip length. No combat renderer
or inventory changes. The frontal camp actor already omits back equipment.
Live knight equipment and approved Gatherer composite/contact were inspected;
phone/desktop camp captures reviewed. Camp and Jonathan-model tests pass;
full Art Lab remains blocked on the existing Duke fingerprint mismatch.
The user rejected the relaxed pose's look; it is retained pending discussion,
not newly approved. Proposed next pose: asymmetric forward lean, one forearm
supported on a knee and the other hand relaxed between the knees.

Relaxed-arm follow-up: camp-only standing targets now hang beside the thighs
with a small elbow bend and slight left/right asymmetry, following torso breath.
Seated hands rest above the knees instead of bracing on the log. Their inverse
body transform preserves thigh contact through breathing; both arm lengths
remain 5 / 5.1 across 21 sit blends and 25 idle samples. Shared model geometry,
palette, mounted poses and other event actions are unchanged.
Before/after live Art Lab knight, smith and seated-merchant views checked:
preserve square helm/gauntlets, dark elbow breaks and supported resting hands.
Close-up 0/3/6s standing/seated sheet: output/camp-v2/relaxed-poses.png;
actual phone/desktop camp and fresh after-ref captures reviewed. Camp audit
passes. Full Art Lab audit still stops at the pre-existing Duke actor hash;
protected reference baselines remain untouched. New pose awaits user review.

Camp keeps the approved shared model and its corrected stand/seat anchors.
Scene-local knightPose supplies slightly asymmetric resting arms, slow torso
breathing (~6.8 s), small weight shifts and a restrained downward gaze. Both feet
stay planted; inverse-transformed seated hand targets keep the palms fixed on
the log while the upper body moves. Arm lengths remain 5 / 5.1 units.
Optional `gaze` goes through the production helmet/plume frame and defaults to
zero everywhere else. The camp's pause-aware context clock drives the motion.

Live Jonathan/smith/seated-merchant comparison inspected before and after:
retain the squared armour identity; use merchant-style supported contacts,
not whole-sprite rocking. Actual 390/1000 camp idle samples at 0/3/6/9 seconds
reviewed; evidence in output/camp-v2. Camp audit checks contact stability over
24 seconds, bone lengths, pause and existing health/exit behaviour. Shared-model
audit also passes; no model proportions, mounted movement or palette changed.

## Game-wide identity and rear seat follow-up

User approved the new event appearance and requested removal of the mounted
belt too. Only Jonathan's belt draw is removed; the Squire is a separate model
and retains his belt. Pixel regression checks the original mounted capture:
all changed pixels must be inside the old belt rectangle, with changes present.

Model Lab now includes BACK / SEATED. Fixed-length thighs project away from the
camera in that view; shins and hands lie behind the torso/back equipment rather
than reusing the front-facing depth. Both facings have 21-pose length checks.

Live game inventory:
- Run/combat, main menu, slot, punching bag, balance: actual mounted renderer,
  automatically inherit the belt removal; attack/gallop tracks unchanged.
- Disco, climbing, camp: shared KRJonathan body, already wired and rechecked.
- Joust and quick-draw duel: Jonathan now dispatches to shared profile art,
  production square helmet and common steel/plume. Rivals remain unchanged.
  Original lance/sword wrist anchors, fall transforms and timing are retained.
- Pickpocket: shared silver materials and squared, thumb-free gauntlets replace
  the player's flesh-coloured hand; reach targets and coin animation retained.
- Active arm wrestling/chug: existing pose-specific first-person grips already
  use KRJonathan materials. Do not replace a functioning grip with a full body.
- Barry/Queen/Duke: current presentations do not display a separate player body.
  Dormant legacy renderers are not mistaken for active game models.

Fresh live knight/smith/seated-merchant comparison gates repeat the previous
construction lessons. Evidence: output/jonathan-models/reference-comparison.png,
model-board.png, profile-and-rear-seat.png and desktop/phone game captures.
Rear seating and profile art remain reviewable candidates, not registry changes.

## Arm readability and seated projection follow-up

Removed the unused brown waist belt from on-foot models only, following the
user's observation that the sword is now on his back. Mounted drawing is intact.
Explicit front-pose override: torso, upper arms, shoulder caps, forearms, hands.
Steel upper arms have narrow light planes, dark elbow articulation and a dark
wrist break; squared gauntlets stay thumb-free. No approved NPC was repainted.

The seated pose uses fixed six-unit thighs and shins, projecting the forward
thigh depth rather than shortening the shin. Arms use fixed 5/5.1-unit segments.
Palms land beside the thighs on the log edge, not over bright knee caps.
Twenty-one intermediate poses are checked for both arm and leg bone lengths.

Fresh before gate: output/jonathan-seat/references-before.png and isolated
knight, seated-merchant and smith captures. Jonathan supplies helmet/body mass;
smith supplies clear steel/joint separation; merchant supplies distinct seated
hand/leg contacts. After gate: fresh live reference-comparison.png, model board
colour/silhouette and actual 390/1000 camp renders reviewed. Cool silver remains
distinct from the daylight background; front hands no longer merge into knees.
Model and camp audits pass. Mounted PNG is compared byte-for-byte to its
pre-edit capture. Full Art Lab audit remains blocked on the previously existing
Duke actor fingerprint mismatch; protected baselines are not rewritten.

## Mounted-match correction (current)

User rejected the separate body's proportions, thumb-like hand highlight,
splayed legs and hoof-shaped boots. The shared renderer now calls the actual
`drawSerJonathanRider` with an `eventUpper` option, which skips horse/mounted
legs and supplies front visor or event arm targets. The original helmet,
projected torso, shoulder caps, plume, mounted shield, sword, bow and quiver
are drawn by the production code. No upper-body imitation remains in the
shared model. Standing hips/knees/ankles share X = +/-1.9; leg widths and
narrow rectangular boot/sole construction match the mounted leg renderer.
Hands use its simple square gauntlets with no added thumb/highlight protrusion.
Existing custom dance/climb action targets remain pose-specific.

The production function's source intentionally gained opt-in event branches;
its normal mounted path is unchanged. Exact before/after mounted PNG comparison
at identical scale/pose passed (`output/jonathan-match/mounted-before.png` and
`mounted-after.png`). The protected source fingerprint was NOT rebaselined:
this is not a claim that the source text stayed unchanged. Live Art Lab gates
were repeated before and after, and the model board now includes the actual
mounted source at matching upper-body size beside front/back standing views.
Review confirms same head/torso/equipment dimensions, straight standing legs,
no thumb spur, no flared hoof silhouette, and retained silver/blue materials.
Model/mobile/pose-purity, camp and full Disco rules/render regressions pass.
The broad Art Lab audit still stops at the existing Duke hash mismatch.

## Previous shared-body trial (superseded geometry)

User request: keep front/back standing Jonathan models available separately,
reuse them in events, and stop turning his silver armour yellow. Candidate
models are in `KnightModelLab.html` / `?knightmodellab=1`; not auto-approved
or added to the protected Art Lab registry. Renderer:
`assets/encounters/jonathan-model.js`, global `KRJonathan`.

Before/after gates: fresh live Art Lab overview plus Jonathan, approved smith,
seated merchant examined. Evidence: `output/jonathan-models/references-before.png`,
isolated ref images and fresh `reference-comparison.png`. Square Jonathan helm,
blue plume, small articulated steel limbs and actual heraldic shield retained.
Smith informs front visor / steel planes, not his larger body proportions.
Seated merchant informs supported hips and palms, not his clothing or palette.
Mounted Jonathan and protected reference renderers/hashes are unchanged.

One neutral material contract copies Jonathan's production silver steel:
armor 919da7, shadow 4b5966, light c4ced5, steel aebbc5, shine edf4f7, plume
268ee8. Daylight remains cool silver/blue; no cream-yellow armour faces.
The camp-only blue apron and gold chevron were removed: the front is a steel
cuirass, with narrow structure highlights instead of a separate costume.

Reuse inventory:
- Camp: front standing -> seated pose, native log remains event-owned.
- Disco: rear shared model; existing dance leg/hand targets and timing retained.
- Bouldering: Jonathan branch uses rear model with climbing targets/rotation;
  alternate dormant characters keep their existing renderers.
- Legacy tavern drink bust: shared front upper body, no second helmet design.
- Active chug and arm wrestling: existing first-person grip/pose geometry is
  preserved; armour and gauntlets use shared materials and existing arm helper.
- Mounted run/combat, mounted event miniatures and side-on joust remain mounted
  or side-on; standing front/back art is not a replacement for those poses.
- Taxman, merchant, gatherer, loot and wolf dialogue show NPCs/props, not a
  separate on-foot Jonathan. No unrelated NPC model was changed.

API: `KRJonathan.draw(x,y,scale,{facing:'front'|'back',clock,sit,lighting})`.
Foot-ground anchor, U-unit rig. Optional custom `legs`, `arms`, `body`,
`armsBehind`, `rotation`, `bust`, `shield` support event poses without cloned
body/head art. `materials('neutral'|'daylight')` provides immutable materials.
No image assets, timers, gameplay mutations, per-frame readback or caches.
Lab code is loaded only by its query and never in a normal run.

Review: desktop/phone model board, grayscale/silhouette, front/rear and sit
0/.5/1 compared beside fresh references. Actual camp, disco, climbing and
chug views inspected. Silver identity retained in camp daylight and warm inn.
`jonathan-model-audit.cjs` passes model board/mobile, pose extremes, render
purity, live reference capture and browser error checks. Camp and arm browser
audits and cutscene contract audit pass. Art integrity still stops on existing
Duke fingerprint; unchanged baseline. Older Disco browser audit waits for a
missing bootReady marker; old Chug audit times out at re-entry bitmap preload
after its desktop input/rig/win/release checks. Those are not reported as passes.
The direct model browser audit covers actual Disco/Chug entry and rendering.
