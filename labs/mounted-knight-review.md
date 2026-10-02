# Mounted Knight Lab — local candidate, 2026-09-29

## v100 — rear-view gameplay performance (2026-10-02)

The user requested 60 FPS during NORMAL GAMEPLAY parry, shield bash and lane
changes, then clarified that only rear/slightly angled views are needed.
The production path now specializes the rear +/-10-degree range; it does not
add an FPS cap, change animation speed, replace the rig with sprites, or remove
gameplay interactions. General-angle Lab rendering remains available separately.

Changes:

- Idle horse shell/contact surfaces are built once and retained independently
  of arm targets. Only the live reins are regenerated for changed grips, using
  the original unscaled contact index. The bounded four-entry grip cache omits
  hands whose reins are not rendered. This removes full horse/saddle rebuilds
  during parry and the stationary portions of bash.
- Lateral steps no longer clone/sort/interpolate the same head/tack source twice.
  Exact live body/leg skin and fixed-bone stepping remain unchanged.
- The rear gameplay GPU path handles triangle culling and reuses immutable
  uploads across small lane yaw changes. Conservative 3D bounds are reprojected
  per angle. Equipment masks retain their original two-sided depth treatment;
  non-rear rendering keeps its previous CPU culling path.
- A shield lunge no longer blends two identical camera projection functions
  for every mesh/depth vertex. Shield face transforms also avoid seven temporary
  vectors per vertex, preserving the original arithmetic order and output.
- Bow aim inverts the existing two-axis projection instead of solving 24
  bisection steps on every lane movement. A guarded fallback remains. Total
  pose calls while aiming/moving fall from 27 to 3; all target rays remain exact
  to floating-point tolerance and center shots remain straight.

Same-machine normal-game diagnostic, desktop Edge, 1100x920, real update/render
loop and actual combat commands. No concurrent performance tests were run.
Representative before: moving bow 59.6 FPS, bash 44.0, parry 50.6. Final run:

| Normal gameplay case | Mean callback FPS | Mean render ms | 95th-percentile render ms |
| --- | ---: | ---: | ---: |
| Running lane changes | 94.1 | 9.55 | 13.5 |
| Idle combat lane changes | 122.7 | 6.28 | 8.2 |
| Lane changes while shooting | 95.0 | 9.54 | 15.9 |
| Shield bash | 93.1 | 9.43 | 15.3 |
| Parry | 126.4 | 4.59 | 7.5 |

These are headless local callback/CPU measurements, not a guarantee of every
presented frame on the user's hardware or a real-phone test. Occasional long
frames remain (maximum gaps 16-45 ms); shooting lane-change gap p95 is 17.1 ms,
although its render p95 is 15.9 ms. Do not claim perfectly locked 60 FPS.
The normal game continues to follow browser/display refresh without a software
FPS limiter. Report: `output/mounted-v100-final-game-profile.json`.

Art skill guidance kept original models, materials, layering and bone lengths.
Before/after renderer regression covers 75 rear-angle/action cases, including
parry/bash, lane steps, run, duck and jump. All 75 are pixel-identical. Actual
desktop/390px normal-game parry, bash and stepping screenshots were visually
inspected: shield/hand contact, native steel/plume, horse silhouette and occlusion
are unchanged. `output/mounted-v100-game-review.png` contains the six phone cases;
the corresponding desktop files use `mounted-v100-desktop-*`.
Combat audit passes nine bow and eighteen bash cases plus damage clocks;
steering audit passes bone, jump-entry and continuity checks. Art Lab passes
35 references/13 sampled models with zero warnings. No reference baseline edits.

## v99 — normal-combat lane facing and FPS diagnosis (2026-10-02)

The user clarified that the FPS issue concerns NORMAL GAMEPLAY, not the Lab.
Do not use the Lab's ~55 FPS result as an explanation for gameplay stutter.
The normal `frame(now)` loop requests every animation frame and renders each
iteration: there is no 55/60 FPS cap. Its `Math.min(gap,1/25)` is a simulation
delta safety clamp, not a rendering interval. No main-loop timing was changed.
An experimental Lab limiter removal was reverted after the scope clarification.

Normal combat now uses exactly the running actor's shared `laneAngle` helper:
settled left/center/right angles are 178/180/182 degrees, with the same transient
heading contribution during lane travel. Aim does not rotate the torso/horse
toward the target. Arrow-ray cache keys include the lane-facing angle; shield
contact projection is refreshed for that angle, preserving target contact.
Center-to-center settled shots remain exactly forward. The shared model,
geometry, materials, animation clocks and damage rules remain unchanged.

Validated 15 lane/heading cases against running angles, nine bow target cases,
eighteen bash cases and contact damage. Bow reach/ray checks pass and shield
contact remains exact. Native renderer degrees are mirrored with a separate
direction field; tests use that existing convention instead of confusing it
with the world angle. Actual desktop and 390px normal-combat captures were
visually inspected; no new clipping or disconnected joints. Art Lab passes
35 references/13 sampled models with zero warnings. Evidence:
`output/mounted-v99-phone-lanes.png`, `mounted-v99-desktop-lane-0.png`,
`mounted-v99-lanes.json`; main combat audit also passes.

Read-only diagnostic harness runs the normal game loop, including updates,
rendering, actual bow/bash commands and controlled repeated lane changes.
On desktop headless Edge, one unprofiled run produced: run 93.1 FPS; stationary
bow 126.0; moving bow 38.7; bash 30.0. These are local callback/CPU diagnostics,
not the user's presented FPS or real-phone performance. Mean render/actor costs
for moving bow were 24.35/23.20 ms; bash 32.14/31.06 ms. The slow states exceed
the 16.67 ms budget needed for 60 FPS. Pose solving alone is not the main cost
(moving bow 1.84 ms, despite 27 pose samples for target-ray solving).

A separate CPU-sampled run identifies repeated horse/entry-mesh generation,
horse/action GPU submission, array/vector allocation and garbage collection.
Moving bow uses `entryHorse`/`horse`; bash additionally hits saddle generation.
This is a real rendering bottleneck, not a frame cap. No broad renderer rewrite
was applied under the diagnostic request. Reports are
`output/mounted-v99-game-profile.json` (unprofiled timings) and
`mounted-v99-game-cpu-profile.json` (sampling overhead; use for attribution).
`mounted-v99-cadence.json` is LAB-ONLY and must not be cited for normal FPS.

## v98 — fixed facing, original knight size and calmer bow hand (2026-10-02)

The user requested less stutter, no knight rotation while aiming, restoration
of the old sprite's knight size, a straight center-lane shot and a more natural
left hand. Combat keeps both horse and native rider at 180 degrees. Only the
connected arm/bow targets adjust for lateral targets. When player and boss are
both centered, bow aim is exactly zero and the released arrow is parallel to
the road. Its small eye-anchor offset remains inside the boss silhouette.
All nine player/boss lane combinations pass the target/contact checks; release,
damage and contact clocks are retained.

The shared production unit is now 3 * 1.02 = 3.06, identical to the legacy
drawSerJonathanRider unit, versus v97's 2.6367. This grows knight and horse
together by 16.05% without changing their relative proportions. The direct
old/v97/new comparison confirms matching helmet width against the old sprite.

Left-hand deployment now begins at .72 and reaches its forward pose at 2.10;
return completes at 5.08 within the unchanged 5.8-second clip. The lateral
excursion and curved path are reduced, not the gameplay clock. At 480 samples
per second, including the larger production scale and Lab playback rate, peak
left-hand speed falls from 348.79 to 258.12 px/s (26%). Fixed bone lengths,
bow grip, nock/string contact, body clearance and endpoint continuity pass.

Rendering changes: native arm masks use one union clip/redraw; horse/action
passes scissor and copy only their visible pixel bounds; unchanged horse mesh
uploads can reuse revision-tagged data. Idle gait phase is NOT frozen: an
experimental freeze was removed after the raster regression detected it.
The Lab's direct and bitmap transports now use actual display size/DPR rather
than forcing 960x1120 for every viewport (1x examples: desktop 605x706,
phone 364x425). Resizing and both transport paths pass pixel-parity checks.
No new bitmap animation, palette redesign or production Lab UI was introduced.

Final renderer comparison: 46/48 states exactly match pre-optimization output;
the other two sword states each differ at nine edge pixels, maximum channel
deltas 1 and 3, with zero material differences. Isolated CPU measurements are
mixed: 90-degree bash median 13.3 -> 10.2 ms, native subpass mean 5.46 -> 2.16 ms,
but bow and other cases do not show a uniform speedup. Early actual-Lab cadence
stayed near 55 completed frames/s despite reduced CPU work. These are desktop
headless diagnostics, not presented-frame measurements or real-phone FPS;
the reported stutter cannot yet be claimed fully eliminated on the user's device.

Art skill gates used fresh approved live overview plus `knight`, `bear` and
`seated-merchant` before edits and at final review. The reference comparison,
close-up bow stages and desktop/390px combat views preserve the square helmet,
blue plume, cool steel planes, connected seated limbs and broad horse masses.
No visible joint separation or scene clipping was found. Evidence:
`output/mounted-v98-reference-comparison.png`, `mounted-v98-motion-board.png`,
`mounted-v98-bow-board.png`, `mounted-v98-scale-comparison.png`, and
`mounted-v98-{desktop,phone}-bow-{0,1,2}.png`.

Validation: Art Lab (35 references, 13 models, zero warnings), production audit,
combat audit (nine bow and eighteen bash cases plus damage), bow clearance,
contact and bow review (16 exact raster invariants), v98 transport, aim,
hand-speed and renderer raster checks. Reports/scripts retain the v98 prefix;
CPU results are `output/mounted-v98-performance-final.json`.

## v97 — forward horse, lateral steps and all-angle gait cache (2026-10-02)

The user reported slow animations, rejected the horse turning during bow fire,
and requested foot movement during lane changes. Combat bow aim now rotates only
Jonathan's connected upper-body/arm/bow assembly. Horse heading remains 180°,
with unchanged horse bones, seat and rider legs. Existing target-ray solving,
release/contact clocks and gameplay damage remain intact. Equipment and held-prop
depth passes use the rider heading separately from the horse heading.

Lane velocity now drives short lateral hoof reach/lift, with staggered front/hind
phases and fixed-length leg IK. Running retains its existing gait phases; idle
combat uses alternating steps. Inputs, lane easing and collision rules are
unchanged. The lane pose is retained at jump entry and fades through the existing
entry blend; airborne poses do not add another sidestep. Fitted tack/head surfaces
are reused while the articulated legs are regenerated for the new foot goals.

The existing bounded 96-sample world-space gait cache now works at all view
angles instead of only rear views. No new raster actor frames or extra per-angle
caches were added. Production GPU surfaces use native-resolution actor bounds;
the held-prop depth pass omits horse faces outside the prop/trail screen bounds.
The latter two changes did not establish a consistent whole-combat speedup in
the short desktop runs; no universal 60 FPS claim is made.

An isolated 20-frame-per-case desktop Edge comparison restores only the old
angle restriction in its before condition. Median CPU draw/submission timings:
90° gallop 17.1 → 2.7 ms, bow 18.8 → 6.3 ms, bash 33.0 → 18.2 ms;
135° gallop 13.8 → 2.0 ms, bow 16.3 → 4.4 ms, bash 23.3 → 10.2 ms.
These are short desktop diagnostics, not GPU completion or real-phone FPS.
See `output/mounted-v97-lab-profile.json` and its reproducible Lab-only script.

Art skill gates: fresh live approved overview, `knight`, `bear` and
`seated-merchant` inspected before edits and again at final review. The square
helmet/blue plume, cool steel, broad brown horse masses and connected seated
limbs remain consistent with the anchors; no palette or identity redesign.
Final close-up motion board and actual desktop/390px combat captures show the
horse square to the road while Jonathan aims, plus connected lateral feet.
The six-frame running lane sequence retains readable hoof silhouettes without
stretching the bones. Captures are `mounted-v97-{pre,post}-*`,
`mounted-v97-motion-board.png`, `mounted-v97-{desktop,phone}-*.png`, and the
refreshed `mounted-v83-lane-sequence.png`. This remains pending user visual
approval, not a promoted reference.

Checks passed: v97 fixed-bone/forward-horse/input audit (max bone error 5.4e-15,
zero horse movement from bow yaw, both lane-to-jump entry deltas zero); combat
audit (all nine aim rays, 18 shield contacts, damage clocks); production startup
and desktop/phone integration; steering; lane change at 30/60/120 Hz; cache
preparation (exact geometry hashes for four gaits); Art Lab 35 references,
13 models, zero motion warnings. Preparation and lane-exit tests were updated
for the explicitly new all-angle cache and combat lane-step ownership.

## v96 — production combat integration and calmer bow pickup (2026-10-02)

User requested integrating the mounted combat clips into the game, lane-based
bow aim, and the old Shield Bash approach/return. Follow-up specifically asked
for a normal, smooth bow pickup. Lab playback reduced from 2.8× to 2.2× (2.64 s
whole clip, about 0.80 s to finish bringing the bow forward). The production
adapter uses the existing release/contact/recovery clocks; the ordinary bow
releases at 1.4261 s, without changing its damage or flight-time distance.

`assets/mounted-combat.js` now supplies Jonathan's boss/miniboss/intro frames.
Bow, bash, held/released/cancelled parry and sword preview/counter poses reuse
the same mounted modules as the Lab. Running, jump input/collision rules,
Squire, other characters and death rendering stay on their existing paths.
The original special-lunge offset and sword-preview particle ownership remain.

Bow aim solves the actual projected right-eye shaft ray against the current
boss position. Mounted facing turns smoothly into the solved angle and back;
the original bow/draw hands are unchanged. Native combat projectiles own flight
after release, so the Lab's moving arrow is suppressed in production. Volley
actions keep the bow out between shots. The flight sprite begins at the actual
shaft's projected centre; gameplay still receives its original distance.

Bash follows the old 1.08 s contact, multi-hit hold, and remount return windows.
The destination now comes from the new shield's plate centre, aimed at the same
boss hit point used by the old effects. The horse takes a blended fixed-bone
stride into the strike, plants at contact, and returns to its starting lane.
Logical lane coordinates do not change. A bounded four-entry stationary horse
mesh cache and the existing jump-entry fitted-surface interpolation avoid
rebuilding unchanged horse geometry during combat. These are native meshes,
not baked actor sprites; desktop headless timings are not phone FPS evidence.

Art skill gates: fresh `v96-pre` and `v96-post` live Art Lab captures inspected,
including overview, knight, bear and seated merchant. Compact helmet/body
massing, blue plume, cool armour, separated arm blocks and original equipment
materials retained; no new character geometry/style or reference promotion.
Actual desktop and 390×844 game views inspected for all four actions and three
player lanes, plus bow pickup/bash approach/return motion boards.

Checks: `mounted-combat-audit.cjs` passes 9 bow lane/target combinations
(maximum ray miss <0.00006 logical px), 18 single/four-hit bash combinations
(zero contact error and exact return), fixed horse chains (<8e-15 drift), real
parry state transitions, sword contact mapping, and actual damage resolution.
Bow hand movement at 120 Hz stays below 2.52 logical px per sample. Existing
production/run/jump-entry audit passes with no errors or changed run duration;
bow review passes 581 fixed-chain samples and all 16 raster invariants. Art Lab
audit: 35 references, 13 sampled models, zero motion warnings. Syntax checks
pass. User visual acceptance of the integrated candidate is still pending.

## v95 — right-eye aim, real quiver pickup, faster clip (2026-10-02)

User correction: NOT a hand swap. Keep the original bow hand (+1) and draw
hand (-1), but bring the bow/arrow in front of Jonathan's RIGHT eye. Rear-view
aim grip now projects to +2.2; draw anchor is beside the right cheek. v94 is
rejected, and the shield candidate remains unapproved and unchanged.

User-requested external motion references inspected: Dan Sawyer's thumb-draw
photo and explanation (https://www.bow-international.com/features/step-by-step-the-thumb-draw/)
and mounted rider photo (https://www.cowgirlmagazine.com/mounted-archery/).
Read Horse Archery USA and Ridgeline mounted-archery material. Visual findings:
bow arm extends toward aim; draw hand stays by the face, elbow opens backward;
waist-quiver extraction must precede placing the arrow on the string. These
inform choreography only, never replace approved Knight Rush model/style.

The arrow is now actual accepted quiver arrow #0: exact feather, nock and
exposed shaft surfaces. Added read-only arrowId metadata in walk-native.js,
preserved through existing BSP splitting; no accepted mesh/material edits.
The held copy replaces only that arrow in the rack. A full rigid buried shaft
is completed and hidden at the pouch mouth until withdrawn. The nock stays
at its stowed point before 1.04, in the hand thereafter, and on the string
from 2.10 to release 3.25. No high-up spawning or duplicated rack arrow.
Extraction ends 1.60; the point swings outward, then forward to nock by 2.10.
Full draw is 2.75. Lab playback is 2.8x: intended cycle 2.07 s, pickup-to-shot
0.79 s at speed 1x; scrub coordinates remain the 5.8 s authoring timeline.

Bow pickup clipping fixed separately: withdraw behind the rack, carry outside
the shoulder, rotate upright in that free corridor, then move in front of the
face. A reversible cubic path replaces the body-crossing diagonal. Final
clearance probe samples 120 pickup poses against native helmet and torso
volumes: zero sampled intersections, fixed arm reach within 1e-8. Pose board
includes both profiles and rear, with stages .60 through 1.40 inspected.

Fresh live Art Lab v95 pre/post overview/knight/bear/seated-merchant references
inspected; fixed square helmet, cool armour, separate block joints, wood colour
and original seated proportions preserved. Actual desktop and 390px road
preview plus phone Lab inspected. Lab-only optional integration; no combat
binding, saves or production loader changes. 581 samples pass fixed bones/
reach, 16/16 exact endpoint/replay/hidden-bow raster cases, zero page errors.
Contact audit has zero nock/string/grip/stowed error, continuous phase joins,
six remaining arrow IDs and 64 selected faces. Art Lab audit passes: 35 refs,
13 models, zero warnings. Candidate still awaits user visual approval.

## v94 — Bow shoot candidate, 2026-10-02

User left v93 shield work in place but explicitly disliked it; NOT approved.
Shield source/choreography stays unchanged. Added a Lab-only 5.8 s bow clip:
reach .55, nock 1.65, full draw 2.50, release 3.25, follow-through 3.85,
remount 5.15, reins 5.80. No combat binding or production loader change.
Reuses accepted bow mesh surfaces/materials and shared Jonathan; separately
posed string, arrow flight, two fixed 5 / 5.1 arm chains and hanging reins.

Fresh live pre/post gates: `knight`, `bear`, `seated-merchant`, overview,
`output/mounted-v94-{pre,post}-*.png`, inspected alongside the pose board.
Preserved compact square helmet, layered cool armour, distinct shoulder/elbow/
palm blocks, deliberate wood planes and fixed seated proportions. Native
`sampleSpatialBow` sequence was inspected live (`mounted-v94-native-bow.png`).
Candidate silhouette is taller during aim, without resizing the accepted bow.
Profile, rear, intermediates and desktop/390px actual road previews inspected.
Raised aim to clear horse head; corrected original attachment basis so string
is behind limbs rather than reversed. No new character approval implied.

`mounted-knight-bow-review.cjs`: 581 time samples, fixed bones and target reach
within 1e-8, 16/16 exact endpoint/replay/hidden-bow raster checks, no page errors.
Art Lab technical audit passes (35 refs, 13 models, zero motion warnings).
Treasure system/states inspected; new action is a secondary selection button
with explicit selected state, preserving existing KRUI styling. Button-material
audit passes. Full UI-system/action-role audits stop in unrelated Road Lab
`startRoadLabCase`: null `nodes` at KnightRush.html:53916; not repaired here.
World captures are disposable preview injection, NOT a live combat integration
or real phone FPS measurement. Candidate awaits user visual feedback.

Entry: `labs/MountedKnightLab.html` (localhost). No production renderer or game
HTML changes. No commit or push. Catalog entry is local like Gear Lab.

## Reference gates

Before geometry work: opened the live Art Lab overview, then isolated Jonathan,
Bear and seated Autumn merchant. Also inspected the live GPU Gear Lab Jonathan.
Selected registered IDs: `knight`, `bear`, `seated-merchant`.

Construction observations: retain Jonathan's square helmet, blue plume, discrete
shoulder/elbow blocks and existing cool metal palette. The old mounted horse's
paired broad haunch planes and brown/mane separation are the starting point, not
the background or UI. Seated limbs must hinge at the pelvis without stretching.
The horse's full turning volume is a **new lab candidate**, not an approved
replacement for the old rear-view horse.

Final review: reopened those three live reference models, captured fresh isolated
views (`output/mounted-final-reference-*.png`), and compared them with the new
front/rear/profile/quarter and action frames. Existing GPU Jonathan geometry and
equipment are reused unchanged. Reduced the initial wide akimbo elbows, tapered
the horse ears, removed back-facing horse surfaces, and moved attack targets
outward away from the neck. The new horse is longer/narrower than the stylized
old rear-only model; proportions and attack choreography await user review.

## Implementation and limits

- Hidden paused Gear Lab engine provides the shared rig and static equipment.
- Native Jonathan body + equipment use the existing WebGL actor renderer.
- Horse triangles use a dedicated small WebGL depth renderer; this replaces
  centroid painter ordering so saddle and mane surfaces occlude consistently.
  CPU builds the broad-plane geometry; GPU resolves horse surface visibility.
- Four fixed-length horse leg chains, fixed rider legs and arms; reins follow
  bridle and live hands. Seat/root follow the horse's body movement.
- Idle, walk, gallop; reins-only rider; 360° rotation, zoom,
  individual visibility, speed, pause, scrub, frame stepping, automatic rotation.
- No gameplay damage, rewards, enemies, actual hit detection or game integration.
- Strike drafts and their controls were removed at the user's request. Future
  combat choreography needs explicit direction; do not invent extra movements.

## Verification

Run manually with project NODE_PATH: `node labs/mounted-knight-audit.cjs`.
144 numeric poses: maximum fixed-bone error 6.22e-15; 72 rendered turn frames;
no page/network errors; 390px layout and controls; paused frames stop after one
pending draw. Browser CPU submission averaged ~4.56ms in the latest desktop run
(RTX 2060, 960×1120 canvas). This is **not** a GPU-completion measurement, stable
FPS promise, iPhone result, or IPA verification.

UI uses unchanged KRUI sheet/button helpers after inspecting current-system and
states in the standalone Treasure UI Lab. Manual mobile/desktop screenshots and
`ui-button-material-audit.cjs` pass. Unrelated Duke baseline audits were not run,
per the user's explicit instruction. No reference baselines were updated.

## User-reference horse pass and standing correction

Compared the seven supplied front/profile/rear BOTW horse-and-rider frames,
then the supplied horse skeleton and standing side profile. The new horse uses
a fuller chest/haunch, longer arched neck, chestnut planes, ochre mane/tail,
cream blaze/socks, and a saddle blanket with broad gold details. Jonathan's
shared mesh and equipment remain unchanged. This supersedes the narrower first
candidate noted above; it remains a local candidate awaiting user approval.

Hind legs now have three fixed-length segments: thigh 6.3, shank 6.3, cannon
8.2. The stifle points forward under the haunch, the hock back. Walk/gallop
retain their separate support/swing poses and hoof lift. Idle is explicitly
not a paused walking pose: higher sockets inside the body give near-vertical
forelegs and a subtle hind hock angle instead of a crouched zigzag. Body
breathing does not move the standing leg chains; all four hooves stay planted.

The manual lab-only audit verifies unchanged bone lengths, planted idle feet
through the breathing cycle, forward stifles/backward hocks and near-vertical
idle cannon/forelegs. No checks run automatically in the game. Final front,
rear and both side idle captures were visually reviewed, along with fresh live
Jonathan/Bear/seated reference captures. Production HTML/model/GPU files were
not changed by this pass. No labs were committed or pushed.

## Size, muzzle and leg volume revision; strikes removed

User rejected the previous horse as too small, narrow-faced and thin-legged.
Reopened the approved live overview and isolated knight/bear/seated references,
then compared the supplied horse side profile directly with the candidate.
Horse dimensions are now 1.22 times the previous rig while Jonathan's bones and
mesh stay unchanged. The larger barrel/haunch has a lower belly, the skull has
a deeper cheek/jaw, a steeper and shorter nose, and a wider blunt muzzle.

The rear thigh and shank now have broad eight-sided muscle volume narrowing
toward the hock. A continuous skin shares rings across joints rather than
overlapping capped bone rods; this removes the angular knots visible during
the first thickening attempt. Standing foot contacts and bend directions stay
fixed. Horse bone lengths are the previous values multiplied by 1.22, with no
per-frame stretching. Rider legs spread to fit the larger saddle, still 6 + 6.

The user then explicitly requested removal of the unsolicited sword moves.
Deleted the attack keyframes, held-sword geometry/pass, action state and action
controls/catalog text. Both hands stay on the reins; the equipment sword stays
on the back. The local audit checks that attack controls are absent and stale
action input cannot restore them. Only the lab was changed, not game combat.

Reviewed final idle profiles, walking side pose, front/rear, three-quarter and
390px layout; live style references were freshly recaptured. Proportions and
anatomy remain a candidate for user review, not an approved reference. No push.

## Idle model reconstruction from profile reference

The user approved implementing the prior anatomy review, explicitly prioritizing
the MODEL and idle stance, not animation. Reopened the approved live overview
and knight/bear/seated anchors before editing; retained broad deliberate planes,
existing material separation and the shared Jonathan mesh. No rig timing or
attack moves were added. No overall scale increase in this pass.

- Rebuilt the barrel sections with raised, fuller croup, a dipped saddle back,
  deep ribcage/belly and a fuller shoulder. Upper hind skin now begins inside
  the high haunch and extends continuously into the thigh rather than hanging
  below the belly as an isolated rod.
- Arched the neck crest and throat. The head now uses cross-sections along its
  downward axis, giving real cheek/jaw depth and a blunt muzzle. Visible eyes,
  tapered ears and a falling forelock replace the old spear-shaped profile.
  The white blaze partitions the actual face surface; no floating overlay.
- Replaced pale boot boxes with cream fetlock volume and separate chamfered
  dark hooves. The later supplied `C:/Users/Altar/Desktop/yan referans.jpeg`
  clarifies the idle proportions and larger pale fetlocks; its uphill foot
  height difference was deliberately NOT copied to the flat-ground rig.
- Mane locks drape to one side, tail has a hanging curved mass with a small
  staggered tip instead of two long rigid forks. Idle tail is stationary.
- Added local `mounted-horse-saddle.js`: concave leather seat, raised ends,
  wrapped cloth, girth and foot-following stirrups. No production dependency.

Final review used both idle profiles, front/rear and 390px lab view, with fresh
live style captures and the new user side reference placed beside the model in
`output/horse-v4-final-comparison.png`. Manual checks: 144 poses, 72 rendered
angles, planted idle hooves, unchanged bone lengths, no page/network errors,
no attack controls. The horse dynamic buffer is now 128 KiB. Desktop CPU
submission timing is not a phone FPS or GPU-completion claim. The render stays
a local candidate; no game/shared Jonathan files changed and nothing pushed.

## Idle forequarter / hindquarter balance revision

Applied the user's five requested proportion corrections together, using the
flat-ground horse photo and `yan referans.jpeg` (without copying its slope).
The pre-edit live overview and isolated `knight`, `bear`, `seated-merchant`
anchors were inspected again: broad connected masses, deliberate shadow
planes and clear steel/leather/coat separation remain the construction rules.

- Shoulder/chest rings extend 1.5 base units forward and have fuller volume;
  the foreleg roots move from Z8.1 to Z9.5 under that mass.
- Neck base and middle gain both width and throat volume without raising the
  crest. The head moves forward with the neck, rather than stretching the nose.
- The complete skull grows 14% across, 6% vertically and 13% in depth around
  the poll. Eyes, blaze, forelock, bridle and bit share the transform. Ears are
  shortened before that transform so the relative silhouette is less donkey-like.
- Reduced the high/rear croup bulge, retaining a deep barrel and muscular thighs.
- Both hind roots move from Z-10 to Z-12 with their complete joint/foot chains.
  Upper-thigh skin is retapered to stay inside the reduced haunch rather than
  producing a new rear protrusion. No limb lengths or gait timing were changed.

The final 145-degree/rear review caught an exposed upper-thigh cap after the
croup reduction. Recessed only the first skin ring (width4.6/depth6.6), keeping
the fuller lower thigh and new joint positions. Re-ran the targeted audit and
reviewed the corrected rear, both-profile and phone-size output.

Before capture: `output/horse-v5-before-side.png`. Final both profiles,
front/rear and phone captures use `output/mounted-final-*.png` and
`output/mounted-phone.png`. Fresh live style references were re-rendered and
visually compared after editing. Targeted manual audit: 144 poses, 72 rendered
angles, unchanged bones (max error 6.22e-15), planted idle feet, no page/network
errors, no attack controls, no horizontal overflow at 390px. This is not an
actual iPhone performance test or visual approval. The game/shared knight files
remain unchanged; this work is lab-only and was not pushed.

The user also supplied https://3dmodels.org/360-view/?id=186494. Automated web
access returned 403 and the normal browser showed a security-verification page;
the 360 model itself was not inspected and is not claimed as review evidence.

## Idle head / topline revision and mounted depth pass (v6-v7)

The 360 reference subsequently loaded in the normal in-app browser and its
side, front and rear views were inspected. This supersedes the earlier access
limitation above. Its poll/jaw/throat and withers-to-croup transitions inform
anatomy, while the user's BOTW side reference supplies the fuller horse mass.
Do not copy the BOTW screenshot's uphill footing onto this flat-ground stance.

Before editing, inspected the live Art Lab overview and isolated `knight`,
`bear`, `seated-merchant` references, then their renderer excerpts. Construction
lessons: broad connected masses, readable jaw/neck separation, deliberate
light/shadow planes and steel/cloth/coat contrast. Fresh final live captures
were compared with the candidate at close-up and 390px lab size. The approved
Jonathan geometry/materials remain unchanged.

- Separated the horse's back contour from the belly: withers, gentle saddle
  dip, restrained rounded croup and tail descent now have independent heights.
- Rebuilt the tapered neck and continuous cheek/jaw/nasal bridge/muzzle.
  Cream muzzle/blaze belong to the same surface; eyes, nostrils and bridle
  sample that surface. A fixed skull section axis removes the pinched bridge.
- Following the user's size feedback, increased head down/forward dimensions
  28% around the poll and width 20%; ear height only 10%. Facial details and
  bridle share that transform. Body/neck/horse scale are not increased again.
- Moved mounted knee/foot targets laterally with fixed 6+6-unit rider bones.
  Tucked the upper blanket/skirt/girth folds toward the barrel so they do not
  hide the near thigh. Stirrups continue following the actual foot endpoints.
- Replaced the horse foreground face-average switch with an outer-shell depth
  prepass and fragment-level coverage. In rider-leg regions, horse surfaces
  compare against projected limb-depth envelopes (the knight remains a shared
  2.5D actor, not a new 3D mesh). The complete horse depth prepass prevents
  hidden inner faces leaking through excluded outer faces. Far legs are
  covered by the barrel/tack, while near legs stay visible. No production
  renderer hook, knight geometry copy or new animation was introduced.

Reviewed both profiles, front/rear, 45/315 and 145/215 idle quarters, existing
walk/gallop samples and the phone-width lab. A pixel check at all four diagonal
angles confirms far-boot centers equal horse-only output, and near-boot centers
remain distinct. Manual lab audit: 144 poses, 72 rendered angles, bone max error
6.22e-15, no page/network errors, paused redraws 0 and no 390px overflow.
Horse buffer stays 128 KiB; desktop submission time is not iPhone FPS evidence.
No unrelated Duke/full audit or boot-time tests were added. This remains a
local visual candidate; no production/shared-knight changes or push.

## Zelda head-only study (v8)

User explicitly liked the v7 body and asked for the head to be reconsidered
against their Zelda references. Body, neck, mane along the neck, legs, saddle,
rider pose and depth compositor were held unchanged. Head acceptance is still
pending; the user's body approval does not approve this new head candidate.

Reopened `yan referans.jpeg` and the supplied BOTW front and right-side images
ending `DCF20825-BAA5-40A5-9766-2896CEBE4876.jpeg` and
`481354A0-D751-4ADC-A68B-D7AE90A7D44D.jpeg`. The old head read as one long wedge,
with a small high eye, a separate pale muzzle cap and little independent cheek.
The references instead show a full cheek below/behind the eye, a narrower nasal
ridge emerging from it, a blunt lower lip and a broader white facial marking.

Fresh pre-edit live overview and isolated `knight`, `bear`, `seated-merchant`
views plus their renderer excerpts supplied the KR shape/material checks:
large connected masses, purposeful broad planes, compact face details and
clean material separation. Reopened the same live references for final review;
Zelda anatomy was adapted to the game's sharp planes rather than its textures.

Replaced whole-head scaling with independent horizontal cheek/jaw/nose contours.
The poll remains attached at the existing neck, while the lower/back cheek has
its own volume and the muzzle ends in a short flat lip instead of an angled
octagonal cap. The white marking widens across actual front/bevel surfaces;
eyes, nostrils, bridle and reins follow the new skin. The forelock is now visible
over the forehead. A second visual pass opened the slit-like eye slightly and
filled only the lower cheek, leaving the nasal bridge and body size alone.

Reviewed both profiles, front and diagonal views against the user images and
fresh live style references, including the 390px lab render. Final targeted
manual audit: 144 poses, 72 angles, fixed bones (max error 6.22e-15), no runtime
or network errors, no phone-width overflow. Horse GPU buffer remains 128 KiB.
The lab renderer and this review are the only v8 edits; no shared knight or
production changes, no new motion, no push and no unrelated baseline audit.

## Small vertical head-volume adjustment (v9)

At the user's request, kept the v8 face construction and added 8% vertical
extent below the fixed poll, with 3.5% width/depth growth. Poll-top/ear height
is unchanged. Eyes, markings, forelock, bridle and bit anchors share the same
head-volume transform before nodding; the neck/body/mane/rig/tack are unchanged.

Fresh pre-edit live overview plus `knight`, `bear`, `seated-merchant` inspection
and renderer excerpts confirmed retaining broad connected planes, small face
details and material separation. Final fresh reference comparison, both head
profiles, front/quarter and phone-size scene showed no new attachment gap or
clipping at the jaw/neck, ears or reins. Targeted lab audit: 144 poses, 72 angles,
fixed bones, no page/network errors and no phone-width overflow. Candidate only;
no production edit, push, new animation or unrelated full audit.

## Marked lower-jaw volume and small ear extension (v10)

The user's red outline in `codex-clipboard-98a800b5-5ac4-4d79-9200-5d35294badd6.png`
clarified that volume was needed below the jaw-to-muzzle diagonal, not across
the face. Added a graduated underside drop, peaking at 1.4 local units between
cheek and muzzle, tapering to zero at the poll and tip. Face width and the nasal
edge are unchanged. Ear roots stay fixed; tips are 0.45 units taller. Skin-based
eye/tack anchors follow the modified sections before the existing head transform.
Body, neck, mane, saddle, rider and motion remain unchanged.

Fresh pre-edit live overview and isolated `knight`, `bear`, `seated-merchant`
renders plus renderer excerpts confirmed retaining broad connected masses,
small face features and crisp material planes. Final fresh reference comparison
and both profiles/front/quarter views show a fuller lower jaw, retained neck
contact and no new visible surface gap. Checked the 390px scene as well.
Targeted lab audit: 144 poses, 72 angles, fixed bones (max error 6.22e-15),
no runtime/network errors or phone-width overflow. Syntax check passed.
Local lab candidate only; no shared production edits, new animations or push.

## Softer jaw-to-neck junction (v11)

User accepted the fuller head and requested only a smoother jaw/neck connection.
Filled the sharp concave throat notch with two additional contour stations;
their upper heights and widths interpolate the existing crest. The short lower
transition finishes inside the head through both nod extremes. No skull, ear,
body, mane, saddle, rider or animation parameters changed.

Fresh pre-edit live overview and isolated `knight`, `bear`, `seated-merchant`
renders and renderer excerpts reinforced a few broad connected planes rather
than fine smoothing facets. Reopened those live references after the edit and
compared both profiles/front/quarter views and the 390px scene. The pointed V
is now a short faceted curve with the accepted head volume intact. Walk nod
extremes at 0.3/0.9 seconds show no visible gap at the connection.
Targeted lab audit: 144 poses, 72 angles, fixed bones, no page/network errors,
no phone overflow; syntax check passed. Horse buffer remains 128 KiB. No
production changes, push or unrelated baseline audit.

## Mounted rider placement and rotation-layer review (2026-09-30)

Correction after user feedback: the placement conclusion in this initial
review was incomplete. Matching the hip JOINT to the saddle top ignored the
visible thigh thickness and left the upper leg embedded. The rotation/foot
occlusion checks below do not establish correct saddle contact; see v12.

Review only: no model, pose, layer or production code changed. The accepted
v11 horse remains intact. Inspected 24 idle yaw views, 12 views at each of two
walk phases, 12 gallop views, plus close-ups around 78–102 and 258–282 degrees.
The seat/pelvis is within about 0.04 world units of the saddle top; the boot
bottom meets the stirrup tread within about 0.01. No angle-dependent joint
movement or double scaling in the mounted rig.

Rendered 2160 combinations (2-degree yaw steps, three motions, four times),
with no runtime or GPU-context errors. This is execution coverage, not a
claim that every rendered frame received individual visual review. The
reviewed angle boards showed no definite horse/leg/equipment clipping at the
time. Correction in v15: the earlier claimed far-leg replacement diagnostic
was invalid. It tried to overwrite a method on frozen KRJonathan and silently
did nothing; its 18 zero-difference ROIs do not establish absence of a leak.
The valid v15 diagnostic replaces the window object and checks wrapper calls.
Checked +/-0.01-degree transitions at 0/90/180/270: small contour changes,
no large equipment/layer reveal. Reins/hands/mane and stirrup overlaps also
reviewed in the enlarged profile images.

Targeted lab audit passed: 144 fixed-bone poses, 72 rendered angles, no page
or network errors, stable pause, and 390px layout without horizontal overflow.
Fresh live `knight`, `bear`, `seated-merchant` references checked for retained
block massing and clear material/overlap boundaries. Desktop/phone previews
remain legible. Current compositor still uses analytical leg depth envelopes
and a separate neck/head foreground rule: this review does not certify future
unimplemented riding/attack poses or real-device performance.

Evidence: `output/mounted-layer-idle.png`, `mounted-layer-walk-a.png`,
`mounted-layer-walk-b.png`, `mounted-layer-gallop.png`,
`mounted-layer-close-right.png`, `mounted-layer-close-left.png`,
`mounted-layer-far-foot-comparison.png`, `mounted-layer-thresholds.png`.

## Rider hip/thigh saddle clearance correction (v12)

User correctly identified the rider sitting inside the horse. The previous
seat joint was only ~0.04 below the saddle top, but the thigh is 2.05 units
thick: treating a joint centre as the contact surface buried its lower half.
Raised the local rider hip-centre parameter from 25.3 to 26.4 (+1.342 world
units). Upper body, equipment, legs and hands follow together; the stirrups
already follow the live feet. Keeping the existing foot-to-seat offset retains
fixed bone lengths and knee spread. Horse and saddle geometry are unchanged;
no foreground mask or layer-order workaround was added.

Fresh pre-edit live overview and isolated `knight`, `bear`, `seated-merchant`
references and code excerpts reinforced connected body/limb masses and an
actual readable seated lap. Final fresh reference comparison plus both
profiles, front, rear, both rear quarters and front quarter views show the
upper thigh emerging above the saddle rather than being truncated into it.
No obvious floating gap in inspected profiles/quarters; boot/stirrup contact
remains. Rear centre contact is partly hidden by equipment, not independent
proof of clearance. Reviewed moving poses and the 390px scene too.
Targeted audit passed 144 fixed-bone poses and 72 angles, no page/network
errors or phone overflow. Syntax check passed. Only local rig and review edits;
no approved horse, shared Jonathan, game integration or push changes.

## Mounted leg length and connected saddle surfaces (v13)

User identified disconnected-looking layers and then explicitly requested longer
mounted legs. The earlier visual check missed actual tack intersections: cloth
at 25.45 passed above the seat top at 25.30, and the leather skirt began beneath
the cloth before re-emerging below it. These were geometry defects, not evidence
that the knight needed another global height or foreground-bias adjustment.

Mounted-only thigh/greave lengths are now 6.8/7.2 instead of 6/6 (combined +16.7%).
Feet hang 10.8 below the hip instead of 8.6; forward offset changes 2.7 to 2.1,
and the knee pole gains a modest forward component. Hip centre, upper body,
horse model and the shared Jonathan sources are unchanged. Every yaw/motion uses
the same new lengths. Stirrups continue to derive their position from the feet.

The blanket top follows the existing dorsal contour with 0.15 clearance. Seat
top/contact stays unchanged; its underside clears the cloth. Skirt roots now
connect to the varying seat rim, and thin closed hems remove open edges. Stirrup
leather moves slightly inward behind the greave; the metal frame is unchanged.
No shader depth bias or universal foreground ordering workaround was added.

Art skill pre-edit gate: fresh live overview plus isolated knight, bear and
seated-merchant, followed by short renderer excerpts. Construction lessons were
continuous joint/seat contacts, broad material planes and retained knight massing.
Fresh final reference comparison preserves these features; saddle leather remains
close in colour to the horse, but the blue cloth separates the materials.

Reviewed both profiles, both rear quarters, front/rear and front-quarter renders,
with/without gear, enlarged saddle/leg crops, horse-only tack, and the 390px scene.
The former blue split under the seat is closed in the inspected profile/quarter
views; leg/boot contacts remain connected. This is not a claim that all possible
future poses or every angle is visually certified.

Manual mounted audit passed: 144 fixed-length poses (maximum error 6.22e-15),
72 rendered angles, no page/network errors, stopped redraw while paused, no
390px horizontal overflow. Horse GPU buffer remains 128 KiB. No unrelated
baseline/Duke audit, production changes or push.

Evidence: output/mounted-contact-before-{plain,horse}.png,
output/mounted-contact-final-{plain,horse}.png, output/mounted-final-*.png,
output/mounted-final-reference-{knight,bear,seated}.png, output/mounted-phone.png.

## Saddle / equipment depth composition (v14)

User reported mixed saddle/equipment layers. The horse foreground pass only
considered six rider-leg depth envelopes, then used a neck-only fallback.
It could erase a near quiver inside a leg envelope while failing to cover far
equipment outside that envelope. This is independent of v13's cloth/seat
geometry intersections. No model dimensions, rider pose or attachment positions
were changed for this correction.

The local horse GPU now receives the same one-time labMeshes snapshot as the
shared Jonathan GPU. Static gear buffers use the identical face-normal culling
and exact native projection: px=-c*x-s*z, py=y-(seat-12), depth=s*x-c*z. Native
gear does not have the horse's vertical depth shear; adding it would misalign
the invisible surface and visible item. Shared production renderers are untouched.

During horse foreground composition, actual equipment triangles stamp coverage
into stencil on both depth pass/fail while keeping the nearer shell/gear depth.
The normal limb/neck pass therefore cannot overwrite nearer gear. A second
horse pass confined to gear coverage lets saddle/barrel cover farther gear even
outside the leg envelopes, while preserving the limb comparisons. No texture
readback, proxy gear silhouettes, angle-specific ordering or global bias was added.
The static extra gear depth buffer is 449484 bytes; actual phone performance is
not established by this desktop check.

Visual evidence: output/mounted-gear-depth-{before,after}.png contains ten angles
and waist crops; output/mounted-gear-depth-quiver.png isolates the quiver. At
45/70/290 degrees far-quiver pixels no longer cover the nearer saddle; at
115/245 near-quiver fragments previously overwritten by saddle are retained.
Changed pixels stay at the waist/saddle interface; inspected boards show no new
arm/torso cut. In four isolated-quiver comparisons, strong differences occupy
only y505..536 of the 1120px image. With all gear hidden, old/new pipelines are
pixel-identical at the reviewed 145-degree pose. This does not certify future
unimplemented torso-lean/attack poses, which require their own depth alignment.

Art skill guided reuse of exact approved meshes, retaining their materials and
contacts rather than redrawing or repositioning them. Fresh live knight, bear,
seated-merchant reference renders and final 390px scene inspected; silhouettes
and model geometry remain unchanged. Manual mounted audit includes equipment
coverage clearing when each item is toggled off; syntax checks are clean and
the shared game/model/GPU files have no changes. No unrelated Duke audit or push.

## Fixed equipment camera / quiver anchor and exact leg masks (v15)

User identified a far-leg sliver in profile, plus a quiver embedded in the saddle
whose apparent placement changed with yaw. Two separate causes were confirmed.

The horse uses vertical depth shear 0.16; the equipment previously used a flat
projection, including its v14 depth copy. Even perfectly aligned gear colour and
depth therefore implied a different world height as the horse camera rotated.
Jonathan's GPU now has an opt-in depthShear option, default zero. Only this lab
requests 0.16. Its visible gear, horse gear-depth prepass and shield arm mask use
the same projection. The shield mask is cached by yaw from approved mesh points.

The mounted quiver snapshot is translated upward by a fixed 2.8 rider-local
units, without changing its shape or the shared source mesh. At idle time zero
its underside is Y32.958 and the highest saddle rim is Y32.208: 0.75 clearance.
Both follow the same bob; this is not a per-angle screen-position correction.
Inspected eight cardinal/diagonal yaw views and enlarged waist crops: the quiver
clears the saddle and remains attached consistently. Far-side occlusion is still
intentional; equipment is not universally painted over the horse.

The old leg capsule masks were wider/rounder than the actual native flat-ended
limbs. They protected a strip of the far leg outside the near leg's silhouette.
Masks now match thigh half-width 1.025, greave 0.825, square knee half-size 0.925,
and the real boot/toe union. The 1.22 hip connector allowance exists only at the
root. Bone lengths, rider pose and accepted horse geometry are unchanged.

The corrected diagnostic replaces the frozen KRJonathan window object with a
wrapper, verifies one wrapper call per render, then restores it. Replacing only
the far native leg with the near leg leaves the physical depth envelopes intact.
At 86/90/94/266/270/274 degrees, strong changed ROI pixels (>40 per channel) fell
from 525/376/471/501/399/549 to 28/52/33/38/42/39. Viewed 90/270 close-up comparison
boards: the continuous silver strip is gone. Residual isolated anti-aliased edge
pixels remain; this is not a zero-difference or all-angle clipping certification.
The older ineffective frozen-method diagnostic above is explicitly corrected.

Art skill gates: fresh approved live overview and isolated knight, bear and
seated-merchant before changes, short renderer excerpts, then fresh final anchor
renders viewed beside the mounted profiles/rear quarter and 390px lab scene.
Kept squared steel articulation, broad animal planes, material colours and
continuous contact. No character redesign, new attacks or game integration.

Manual mounted audit passed 144 fixed-length poses, 72 rendered angles, matching
0.16 camera assertion, gear-toggle stencil clearing, no page/network errors,
no 390px horizontal overflow and zero paused redraws. Syntax checks passed.
Independent shared-GPU regression compared HEAD/current in six deterministic
GearLab views: idle 0/90/180 and walk t0.41 at 145/270/315. All six were pixel
identical (zero changed pixels); default shear remains zero and mesh/memory
counts are unchanged. Desktop Edge/RTX2060 checks do not establish phone FPS.

Evidence: output/mounted-anchor-before-*.png, mounted-anchor-final-board.png,
mounted-calf-comparison-{90,270}.png, mounted-calf-final-*.png,
mounted-default-gpu-regression.png, mounted-final-*.png,
mounted-final-reference-{knight,bear,seated}.png and mounted-phone.png.

No unrelated Duke/baseline audit, baseline edits or push.

## Preserve Gear Lab attachments / shorten cantle / hide AA ghost (v16)

User rejected the v15 quiver lift and requested reducing the saddle tip instead.
Removed the entire 2.8-unit quiver translation. The actual meshes received by
KRGearGPU.create were intercepted in a read-only browser check: shield, sword,
bow and quiver (1624/64/488/695 faces) all exactly match fresh labMeshes JSON,
before and after drawing. The matching mounted camera projection is retained;
no Gear Lab model or attachment adjustment is needed.

The tall rear leather lip is now lower and shorter: rear station moves from
Z-4.2/Y26.25 to Z-2.2/Y25.05 in unscaled horse space. The upper skirt joins the
shorter lip; the blanket, horse body, rider pose and front seat remain unchanged.
At idle, the original quiver spans world Y30.158..33.5888 and Z-4.775..-2.9.
The lip begins at world Z-2.684. Clipping all saddle leather faces to that quiver
height interval gives at least 0.1374 longitudinal clearance. Viewed close-ups
at 45/90/145/215/270/315: original hip-level quiver stays continuous in rear
quarters; the shortened leather no longer cuts through it.

The reported dotted white hidden-leg silhouette was still a real visible defect
after v15, not something to dismiss as acceptable anti-aliasing. Controlled
MSAA-off diagnostics isolated actor edge coverage as the cause: partially
covered pixels lay outside the analytic limb mask, so the foreground horse
failed to cover them. Normal actor/horse anti-aliasing remains enabled.

The horse mask now intersects the projected limb with each native pixel's
footprint (derived from canvas scale/zoom), including knee and boot rectangles.
Actual limb coverage takes priority over fringe coverage, keeping the previous
profile-strip fix and depth order. No limb widths, lengths, horse shapes,
equipment meshes, textures or render-buffer sizes were changed for this fix.
Fresh 145/215 renders no longer show the hidden shin outline on the haunch.
At 135/145/215/225 degrees and zoom 0.7/1/2.5, the hidden lower-shin/boot ROI
below both knee squares exactly matches a valid far-leg-removed diagnostic:
maximum RGB difference zero, including the >8 low-contrast check. At 2.5 zoom a
test-only camera recenter kept the entire calf onscreen; production framing is
unchanged. Viewed recentered 215/270 close-ups: no dotted haunch outline or
continuous profile band. Isolated shared-AA profile-edge differences remain,
not a hidden contour; this is not an all-pose guarantee.

Art skill pre/post gates used live knight, bear and seated-merchant plus the
overview and short renderer excerpts. Preserved broad material planes, squared
armour and existing attachments; reshaped only the requested leather tip.
Final desktop/rear-quarter and 390px phone previews inspected beside fresh
approved references. Targeted manual audit passed 144 fixed-length poses,
72 angles, camera/stencil checks, no page/network errors or phone overflow.
Syntax checks passed. No unrelated Duke tests, production integration or push.

Evidence: output/mounted-v16-reference-*.png, mounted-v16-saddle-board.png,
mounted-v16-quiver-close.png (pre-AA-fix),
mounted-original-gear-short-saddle-review.png, mounted-final-*.png,
mounted-fringe-centered-2.5-{215,270}.png,
mounted-fringe-final-{0.7,1}-{135,145,215,225}.png,
mounted-final-reference-{knight,bear,seated}.png and mounted-phone.png.

## Quiver top faces / side-only neck / depth-tested reins / low skirt (v17)

User requested fixing the quiver's dark top during yaw, a slightly thinner neck,
better reins, and a small brown saddle extension beneath the quiver. They then
clarified that neck thinning means SIDE profile, not frontal width. The initial
width reduction was reverted: all original neck width stations and mane X
dimensions are retained. Only the throat rises, mostly 1.1..1.5 unscaled units
in the middle (about 13..15% less side-profile depth); chest root, crest,
poll/jaw connection and the head are unchanged.

The quiver defect was culling, not its material. An oblique camera exposes
upward-facing surfaces but the previous facing test ignored normal Y. Both the
shared gear colour shader and local horse gear-depth shader now account for
the camera's vertical normal component. Default shear-zero gear uses its same
two normal components, nine-float stride and original buffer size. Opt-in
mounted gear adds Ny (ten-float stride); source faces, colours and attachments
are unchanged. The horse depth buffer reuses its previously unused third normal
slot. Inspected before/after crops at 80/85/90/95/100 and 260/265/270/275/280:
the upper brown shell/rim stays continuous instead of exposing a dark wedge.
Six default GearLab frames remain exactly pixel-identical to HEAD (idle
0/90/180; walk t0.41 at145/270/315).

Reins are now thin horse-space rods, not two actor-space lines painted across
the horse. Endpoints follow actual hand and nodding bit anchors. Intermediate
points route outside the current neck/head/mane surface using bounded Y/Z ray
intersections; short chords and an exterior bit-approach point avoid crossing
convex panels between otherwise valid endpoints. This matters: a twelve-chord
candidate visibly cut the neck, and 24/.55 clearance still intersected at an
intermediate sample. Final routing uses 32 chords plus the short bit contact
per side, .36 local surface clearance and .18 strap width. Normal horse depth
hides far straps; native hands cover their ends. The rein tag is deliberately
not promoted to the foreground fallback (there is no separate hand depth mask).
Reins are absent when the knight is hidden; no angle-specific painter switch.

The saddle's upper lip stays in place. Its brown side drops below quiver height
before extending rearward: new Y24.4 row, then rear Z-4.1/-4.45/-3.95 on lower
rows. The extension starts 0.390 world units below the original quiver bottom.
All 74 leather seat/skirt face bounds avoid the quiver bounds. Inspected both
profiles/rear quarters: a modest leather area is visible behind/below the
quiver without moving the quiver or introducing an obvious leather/leg cut.

Art skill gates: fresh live overview, knight, bear, seated-merchant plus short
renderer excerpts before editing; fresh anchors inspected again beside final
front, side and rear-quarter renders and the 390px phone layout. Kept broad
planes, existing materials, squared armour and continuous attachments. The
horse remains an independently approved model, not a redraw from the NPCs.

Final manual mounted audit: 144 fixed-length poses, 72 yaw renders, matching
camera/stencil checks, no page/network errors or phone overflow, zero redraws
while paused. Syntax/diff checks passed. Reins add 792 triangles; horse dynamic
buffer capacity is 256 KiB, actor dynamic buffer 64 KiB. Mounted static gear
colour data is 642120 bytes (+64212 for Ny); horse gear-depth data remains
449484 bytes. No new texture or mobile FPS claim. Normal production projection
is unchanged. No unrelated baseline/Duke test or push.

Evidence: output/mounted-v17-reference-*.png, mounted-v17-before-*.png,
mounted-quiver-normal-profile-before-after.png,
mounted-v17-saddle-extension-{90,145,215,270}.png,
mounted-rein-diagnostic-{wide,fine}.png (intermediate candidates),
mounted-final-*.png, mounted-final-reference-{knight,bear,seated}.png and
mounted-phone.png. Earlier v17 candidate boards precede the user's side-only
clarification; the final named renders contain the restored frontal width.

## Corrected request: head-on neck width, restored side profile (v18)

The user explicitly corrected the v17 interpretation: narrow the neck on its
left and right when viewed head-on, NOT the throat in side profile. The v17
side-thinning is now undone. Original neck Y/Z stations, including bottom
Y19/22/26/27.35/27.75, are restored exactly. Only X half-width changes: 20%
reduction at Z7.8..10.5, smoothly tapering to unchanged chest root and poll.
Mane vertices use the same lateral scale; their Y/Z positions are unchanged.
Normals and material planes are rebuilt after this X-only fit. Head, barrel,
limbs, saddle and all native gear transforms are untouched.

Art skill checks used fresh live overview/knight/bear/seated-merchant renders
and short construction excerpts before editing, then fresh approved anchors
beside the final local model and 390px phone preview. Broad connected planes,
head identity and existing materials were retained. Viewed front0, near-front
10/350 and both profiles90/270. A separate read-only review confirmed the
correct axis, restored throat and continuous reins; sampled idle/walk segments
stay outside the neck, apart from the intended final bit contact. Quiver normal-Y
culling, hidden-leg AA coverage and low rear saddle extension remain intact.

Manual mounted audit passed 144 fixed-length poses, 72 yaw renders and the
camera/stencil checks; no page/network errors or phone overflow, one final
redraw while paused. Renderer syntax passed. No unrelated audit, game
integration or push. This entry supersedes v17's neck interpretation only.

Evidence: output/mounted-v18-reference-*.png, mounted-v18-before-{0,90,270}.png,
mounted-v18-after-{0,90,270}.png, mounted-final-*.png,
mounted-final-reference-{knight,bear,seated}.png and mounted-phone.png.

## Marked upper rear saddle lip beneath quiver (v19)

The user's red outline clarifies the target: a short upper leather rim below
the quiver, not a wider/lower skirt. Added two closed side lips joined to the
existing rear seat rim. They drop to local Y24.58 below the quiver, extend to
Z-3.95, and only then rise gently toward the Z-5.15 tip. The original high seat,
lower skirt, blanket, rider and equipment positions remain unchanged; the v18
neck change is also untouched. No quiver lift or screen-angle adjustment.

Three spatial clearances separate the lip from the unchanged quiver bounds:
front drop is .0208 world units ahead, low shelf .1704 below, and rising rear
section .044 behind. These are complementary segment bounds, not a claim that
the whole saddle and quiver bounding boxes are disjoint. Inspected 90/270 and
145/215 degrees plus the side close-up: the rim is visible under the quiver,
has real thickness and remains attached. A separate read-only review agreed.

Art skill: fresh approved knight, bear, seated-merchant and overview before
editing plus source excerpts; final fresh references and phone preview reviewed.
Preserved broad leather planes/material and native equipment rather than moving
the gear to create space. Manual local audit passed 144 poses/72 yaw samples,
camera and gear-mask checks, no errors or phone overflow, one settled paused
redraw. Syntax passed; no unrelated audit, production integration or push.

Evidence: output/mounted-v19-reference-*.png, mounted-v19-before-*.png,
mounted-v19-after-*.png, mounted-v19-saddle-close.png (before left/after right),
mounted-final-*.png, mounted-final-reference-*.png and mounted-phone.png.

## Reference headstall, marked ear V and no nose loop (v20)

The user supplied a horse-head tack photo, then explicitly removed the nose
loop and marked a V around the ear with a downward throat connection. Replaced
the thin incomplete cheek rods with closed flat leather strips, an open metal
buckle and an octagonal bit ring. The rear crown and forward temple branch
join the same buckle behind the eye; their top bands pass behind the ears and
beneath the existing forelock. The old horizontal noseband is removed.

All skull-mounted parts use actual skull-section anchors and the unchanged
headVolume/nod transform. The original bit centres/rein anchors remain exact.
A mirrored endpoint ordering issue discovered in review was corrected: the
last bit cross-section now retains the previous strip's edge direction on
both sides. Head, neck, saddle and native rider/equipment geometry are unchanged.

The throatlatch is generated after the head transform, from the live buckle
anchors to the stationary neck underside. Both edges of its subdivided side
strips are routed outside the actual head/neck/mane envelope; clearance eases
from .15 at the buckle to .28 in the throat, with .06 solid leather thickness.
The underside wraps below the neck instead of moving rigidly with the skull.
A read-only review checked idle and walk nod extremes in profile/quarters. It
found a small hidden backing intersection at the sharp head/neck boundary;
refined final-side samples plus the eased clearance fixed it. Final walk .9
coat/backing samples have no negative clearance (minimum backing .0669 local
units), while the buckle contact is unchanged. No visible gap in the final close-up.

Fresh approved Art Lab overview, knight, bear and seated merchant were viewed
before edits and again alongside the final close-up/phone model; chosen source
excerpts were inspected. Kept their broad material planes and connected prop
construction, using the supplied photo/marking for the tack layout rather than
redesigning the horse. Viewed front, profiles and both front/rear quarters.
Manual mounted audit passed 144 fixed-length poses, 72 angles, camera/stencil
checks, zero errors, no 390px overflow and zero paused redraws. Actor/horse
dynamic allocations remain 64/256 KiB. Syntax passed; no production change,
unrelated audit, texture, gear movement or push.

Evidence: output/mounted-v20-reference-*.png, mounted-v20-before-*.png,
mounted-v20-after-*.png (first candidate before nose-loop removal),
mounted-v20-final-*.png, mounted-v20-bridle-final-close.png,
mounted-final-*.png, mounted-final-reference-*.png and mounted-phone.png.

## Fill the rear saddle interior, not just its outline (v21)

The user rejected the two narrow rear rims because blue cloth showed between
them. Joined their inner upper/lower edges with a closed, shallow crowned
leather insert, including convex front/rear half-caps. Removed the obsolete
internal rim walls. The existing outer lip silhouette, seat contact, skirt,
blanket, quiver and all actor/head/bridle geometry remain unchanged.

The insert's centre top follows max(rimY-.04, blanketTop+.12), with a separate
lower surface. Unlike a flat low fill, this stays above the rising blanket.
Read-only comparison against the actual native quiver triangles (not its
overly conservative global bounding box) sampled 7392 insert points: minimum
top-to-quiver clearance .190376 world units, visible top above cloth .103968.
The hidden bottom meets/overlaps cloth at the existing inner-rim seam; no blue
cloth penetrates the visible leather surface in these checks. Profile close-up
and 145/215 views now show continuous brown fill, not two outline strips.

Art skill pre/post gates used the fresh approved overview, knight, bear and
seated merchant, source excerpts, actual model close-ups and 390px phone view.
Preserved broad leather planes and the existing material palette. Manual audit
passed 144 poses/72 angles, camera/stencil checks, zero page/network errors,
no phone overflow and one settling paused frame. Syntax passed. Only the local
saddle geometry/review changed; no shared model change or push.

Evidence: output/mounted-v21-reference-*.png, mounted-v21-before-*.png,
mounted-v21-after-*.png, mounted-v21-fill-close.png (before left/after right),
mounted-v21-filled-saddle.png, mounted-final-*.png and mounted-phone.png.

## Video-led walk, trot and fast gallop; body/leg coupling (v22)

Read the user's local `at kosu.MOV` in separate walk (0-4s), medium (5-10s)
and fast (12-18s) sections. The first medium candidate looked too much like
walking to the user, so retained it as `Orta koşu` and added a distinct
`Hızlı koşu`, not just faster playback. Also viewed the supplied Sketchfab
Horse Run Animation by cmthoman in the interactive viewer. No remote model
was downloaded or incorporated. Timing below is an authored approximation
from the local video, not motion capture or a measurement of Sketchfab.

Walk uses a 1.2s cycle/four separate contacts; medium uses a .9s diagonal
trot cycle. Fast uses a .6s cycle, successive HL/HR/FL/FR contacts at
0/.066/.228/.294 seconds and a 21% unsupported phase. Fast recovery folds
the legs higher and reaches farther. Piecewise Hermite hoof paths retain
continuous position and velocity at lift-off, touchdown and internal joins.
The trot authoring timeline is 3.6s (four cycles), while walk/fast use 2.4s.

The moving foreleg now has a true shoulder/elbow/carpus chain: fixed 4/6/10
lengths, replacing the old moving two-link approximation. The upper elbow
takes compression while the loaded carpus remains relatively straight.
The existing fixed 6.3/6.3/8.2 hind chain keeps the stifle forward of its
hock. The approved idle leg geometry is untouched.

Latest user request specifically compared the fast Zelda body/leg relation.
Added phase-linked shoulder/haunch rocking: rear propulsion raises the front
mass, and front support lowers the chest. The same smooth body transform
poses the flesh and leg sockets BEFORE IK; planted feet keep their original
ground path rather than being rotated with the torso. Head/bridle/bit points
and tail follow the posed body, then reins route against its actual surface.
The central saddle zone remains identity-transformed, protecting v21's fill
and the approved native gear relationship. No horse rest-shape redesign,
extra attack, random action, native knight stretching or shared GPU edit.

Fresh pre/post approved Art Lab overview, Jonathan, bear and seated merchant
were viewed, with relevant source excerpts inspected. Their connected limb
construction, broad planes and stable native dimensions guided this pass.
Main review compared the fast video sheet with right/left and rear-quarter
candidate phase sheets, plus a fresh 390px phone capture. Independent review
also covered both profiles and 45/145 degree views. No visible root gaps,
reversed hocks, rein disconnections or new tack overlap in reviewed poses.
Remaining visible difference: the native rider is more upright/static than
Zelda's fast rider; torso lean and its gear-depth frame are not changed here.

Final numeric audit: 9600 samples, no failures; fixed lengths, no clamped
targets, stable ground velocity (error < 9.2e-10), attached body sockets
(error < 1.1e-14), loop continuity and camera-independent world joints.
288000 central saddle samples retained exact identity. Manual browser audit
passed 192 poses/72 angles, gear stencil reset, all gait controls/timeline
wraps, zero page/network errors, zero paused redraws and no phone overflow.
Syntax checks passed. Independent idle comparison at 0/45/90/145/180/270
degrees (time 0, zoom 1, viewport 1400x1000) found zero changed RGBA pixels.
Only local labs/evidence changed; no production integration or push, and no
unrelated art-lab audit was run.

Evidence: output/mounted-v22-reference-*.png, mounted-v22-idle-before-*.png,
mounted-v22-video-{overview,medium-full,fast-full}.png,
mounted-v22-review-bodyrock-{90,270,45,145}.png,
mounted-v22-fast-desktop.png, mounted-final-reference-*.png, mounted-phone.png.

## Serverless local-file opening (v23, transport only)

Replaced the outer page's direct iframe DOM/renderer access with a source- and
origin-checked message bridge. The existing local Gear renderer loads that
bridge only for `gearreview=1&mountedreview=1`; ordinary Gear Lab keeps its
original renderer and protocol. The bridge loads the same fixed mounted
scripts inside the native engine realm and owns its drawing surface. No
production HTML, model, rig, animation, material or layer-order changes.

The default path transfers the visible canvas once. Browsers without that
capability use ImageBitmap presentation; `?transport=bitmap` allows explicit
fallback testing. Both work under ordinary `file://` security, without a
server, external network requests or relaxed browser flags. The host uses
one in-flight request, coalesces live control/clock updates, correlates ACKs
by request id, rejects stalled manual calls and closes transferred bitmaps.
The file-protocol stop/localhost-only error were removed. Keep the page in
the project folder so its relative engine/script dependencies remain present.

Manual `KRMountedLab.render()` and `inspect()` now return promises; `stats()`
returns the last acknowledged snapshot. A direct-canvas render ACK confirms
engine drawing, not compositor presentation. The adapted audit waits for
presentation before exact canvas pixel reads; the animation hot path does not
wait. The full existing audit passed twice via file URLs: 192 poses, fixed
bone lengths, exact equipment-off image restoration, 72 angles, zero errors,
zero paused redraws, and no overflow at 390px. A separate read-only regression
opened the original Gear Lab in default and GPU modes, rotated/walked both,
and confirmed the mounted renderer remained absent with no page errors.

Dedicated serverless checks also passed both direct/bitmap startup, all four
gaits, paused frame stability, rapid-control coalescing and rejection of
foreign messages. Both transports produce identical scene pixels in all four
gaits and at six idle angles; the six idle captures also match the pre-change
v22 baselines exactly. No HTTP requests were required (40 local file requests
per transport, zero resource/console/page errors). Deliberately suppressing
ACKs in an isolated test page rejected the render promise after 15004ms,
cleared pending/in-flight work and stopped playback as expected.

No server was started, no browser security setting changed and nothing pushed.
Evidence: output/mounted-file-smoke.png, output/mounted-file-{direct,bitmap}.png;
manual checks: labs/mounted-knight-audit.cjs and mounted-knight-file-audit.cjs.

## Connected shoulder/haunch skin and measured motion (v24)

User requested measurements and called out the legs sliding in/out of a
cylindrical body. This is an intentional horse geometry revision, not a
transport-only edit and not an approved new reference.

Pre-edit live Art Lab overview and isolated `knight`, `bear`,
`seated-merchant` models were rendered and visually inspected. Construction
lesson: broad squared masses, coherent coat planes and connected articulation;
not extra rounded socket caps. The chosen live renderer/pose excerpts were
read after viewing. Fresh final live references were inspected alongside the
new idle and moving horse, at close-up and 390px lab width. The native Jonathan,
equipment, head/bridle, saddle and palette implementations are preserved.

The barrel now omits four actual side openings. Each opening's eight boundary
vertices are reused by the proximal leg skin with fixed winding/correspondence.
There are no capped upper-leg tubes buried inside an intact barrel. Small
scapula/haunch movement also deforms the shared side vertices; the dorsal saddle
region stays fixed in its existing frame. Non-planar connecting strips have
per-triangle culling normals but paired material values, avoiding artificial
triangular colour fragments. Broad attachment planes replace the old tube rims.

Video evidence is **frame-series measurement**, not continuous human-style
watching. `mounted-video-measure.cjs` reads the local 1920x1080, nominal 30fps
MOV through ffmpeg at 640x360 and tracks a saddle-cloth template. From 7.0–9.4s,
vertical correlation peaks at 12–13 frames (0.40–0.43s) and 25 frames (0.83s):
two bounces per medium stride. The observed saddle range is 11 image pixels,
including camera/cloth variation. From 15.0–17.4s, the fast repeat is strongest
at 17–18 frames (0.57–0.60s); its raw 31px range is not treated as calibrated
world-space bounce because rotation, cloth deformation and camera motion matter.
The video-analysis service's doctor timed out after 300s; no result from that
service is claimed. Occluded/overlapping hooves and the stamina HUD prevent a
reliable automatic hind-toe/contact measurement; no exact match is claimed.

Medium cycle: .90 -> .84s; authored seat peak-to-peak: 1.0248 -> 2.074 world
units (about 2.02x). Fast cycle remains .60s; seat peak-to-peak: 1.952 -> 2.562.
Fast stance reach: 7 -> 8 horse units, hind toe-off overshoot: .45 -> 2.0.
Sampled maximum rearward hoof distance from its moving hip: 7.189 -> 9.382 horse
units (about +30.5%). These last values describe our rig, not the video's horse.
The medium timeline is now four complete .84s cycles (3.36s), avoiding a reset
snap. Fixed-length limb chains, hoof ground paths, native rider and gear remain.

Verification after the final geometry edit:
- Numeric gait audit: 9,600 poses, no failures (IK targets, bone lengths,
  contact velocities, hoof clearance and loop/phase continuity).
- New skin audit: 484 poses; every skin edge has two opposite-wound incidents;
  one connected barrel/four-leg component plus four separate hoof shells.
- Mounted browser audit: 192 poses, 72 yaw renders, gear-toggle pixel restoration,
  no page errors, paused redraw count zero, no 390px horizontal overflow.
- File transport audit with explicit `--allow-authored-shape-change`: both
  transports agree pixel-for-pixel for four gaits and six idle angles, no HTTP
  requests/errors; missing ACK still rejects near 15s. Legacy v22 idle images
  remain untouched. Their expected shape deltas are reported, not called equal.
- Final live reference/desktop/phone and both profile/quarter motion-sample
  sheets were visually inspected. This is technical/visual review, not approval.

Evidence: `output/mounted-v24-ref-*.png`, `mounted-v24-video-measure.json`,
`mounted-v24-motion-{trot,gallop}-{90,270,145}.png`, `mounted-final-*.png`,
`mounted-phone.png`. Local browser-control policy blocked refreshing the user's
existing file:// tab; no workaround was attempted. User should refresh it.
No production integration, baseline promotion or push.

## v25 — stable barrel/materials and an airborne forward foreleg reach (2026-09-30)

User feedback: the hind leg enters the belly, the foreleg distorts the body,
moving material/shadow regions reveal the deformation, and the foreleg remains
curled like a short arm instead of opening forward as in the supplied video.

Pre-edit live Art Lab `knight`, `bear`, and `seated-merchant` references were
inspected, followed by their native renderer/pose excerpts. Their broad squared
masses and clear material planes informed the change: keep the barrel surface
independent of leg bending and confine articulation to the attachment/limb skin.
The same live models were freshly rendered during final review and compared
beside the candidate in `mounted-v25-live-comparison.png`. Jonathan's square
helmet, silver/blue materials, native equipment and mounted rig are unchanged.
The horse retains broad brown planes and distinct cream fetlocks, with no new
texture noise, rounded joint caps, or copied NPC geometry.

Implementation:
- Barrel vertices are fixed in their own body frame; only the existing shared
  bob/body rock affects them. The skin openings and local underside contour now
  accommodate retraction/recovery without dragging the entire barrel.
- Hind roots/poles place the folding leg beside the haunch. Ground tracks,
  contact timing, and all three hind bone lengths remain fixed.
- Leg strips are triangulated with pose normals for culling, but their material
  colours come from the bind pose. Turning/bending no longer switches those
  surfaces across three-colour shading thresholds.
- Fast forefoot swing now has a forward airborne peak at swing fraction .66,
  followed by the rearward landing sweep. The lower chain unfolds between .36
  and .62 of recovery. The peak is about 14.80 horse units ahead of the moving
  shoulder; beyond 14.5 units, sampled carpal flexion is at most 13.64 degrees
  (0 means straight). Maximum authored flexion is 105 degrees in fast motion
  and 95 in other moving gaits. These are our rig measurements, not exact video
  angle measurements. The supplied frame strip supports the sequence only.
- Fore bones remain 4 + 6 + 10 units. Raised forward targets stay within their
  reach; no bone stretching or stance-path change is used.
- Default lab framing is 6.9 pixels per world unit instead of 7.5 to keep the longest
  strides in the canvas. It stays constant throughout motion; zoom still works.

Final checks:
- Numeric gait: 9,600 poses, no failures, including new airborne extension and
  flexion limits, new swing joins, fixed lengths, hoof contacts and loop seams.
- Topology: 484 poses; 566 faces, 936 edges and 380 vertices per pose; one welded
  barrel/four-leg component plus four separate hoof shells, closed/opposite edges.
- New surface audit: 960 poses; zero tested limb/transition crossings against
  the barrel/attachment cuff, zero face-colour changes, and maximum unexpected
  barrel deformation about 1.1e-14. This is sampled verification, not a proof
  about every continuous-time triangle pair.
- Browser: 192 inspected poses, 72 yaw renders, equipment-toggle restoration,
  no page errors, paused redraw count zero, no 390px horizontal overflow.
- Direct/bitmap file transports: pixel parity for all four gaits and six idle
  angles, no HTTP requests/errors; missing ACK rejected at about 15 seconds.
  Legacy v22 baselines were not rewritten; authored shape/framing differences
  are explicitly reported through `--allow-authored-shape-change`.
- Fresh final live references, desktop/phone views, both profiles and oblique
  motion-sample boards were inspected. Forward extension is visible before
  landing, the barrel no longer follows the knee, and broad coat values stay
  consistent across the samples. No aesthetic approval is implied.

Evidence: `output/mounted-v25-ref-*.png`, `mounted-v25-reference-foreleg.png`,
`mounted-v25-motion-{trot,gallop}-{90,270,145}.png`,
`mounted-v25-live-comparison.png`, `mounted-final-*.png`, `mounted-phone.png`.
An early v25 review run reused the old v24 motion-board filenames; those v24
boards are therefore not reliable before-images. They were never approved
reference baselines. The motion-review script now takes an explicit version.
All browser captures were isolated development tests, not control of the user's
open file tab. No attempt to bypass its refresh restriction, no production/Godot
integration, no unrelated full-game art audit (per user instruction), no push.

## v26 — connected tail end and restrained running sway (2026-09-30)

Requested scope: remove the small cylindrical protrusion near the tail end and
improve tail motion. The first continuous-tail candidate ended in an apex;
the user then explicitly rejected its sharp profile and requested a slightly
blunter end plus gentle left/right movement while running. The final candidate
uses a bevelled, obliquely cut terminal section, not that rejected apex.

The separate lower capped tuft has been removed. One closed hair mesh now runs
from the attached root to the end, with six sections and five constant-length
links. The lower contour is slightly shorter for ground clearance. Its terminal
width/depth stay nonzero (1.0 / .9 horse units), so the profile does not collapse
into a needle. Broad stable bind-pose hair colours preserve the existing mane
palette; moving face normals do not flip the material colours.

Motion is analytic and periodic: a small idle sway, progressively delayed
rotation down the chain, and increased trailing/side movement in running gaits.
The root follows the horse's existing body transform without sliding. Authored
lateral amplitudes are .050 in medium motion and .065 in fast motion; the tip's
sampled side-to-side travel is about 1.78 / 2.27 horse units respectively. No
length stretch or frame-to-frame simulation state is used.

Both mandatory reference gates were completed: fresh live overview and isolated
`knight`, `bear`, `seated-merchant` captures before editing, then a fresh final
live comparison beside the candidate. Native renderer excerpts were inspected
after the first visual pass. Their broad masses, clipped edges and few material
planes informed the tail's continuous bevelled volume. Profile, rear and oblique
tail close-ups were inspected for idle/walk/trot/gallop, plus the full desktop
and 390px lab scene. The protruding disc and needle tip are absent in these
views. The running sway remains small relative to the haunch width.

Verification of the final blunt-end variant:
- New tail audit: 1,920 poses; one closed, consistently wound connected mesh,
  fixed segment lengths, attached root, periodic wrap, stable face colours,
  no ground contact and at least 12.66 logical pixels of horizontal frame margin
  over all yaw angles at default zoom. Minimum ground clearance is .763 world
  units. These are sampled checks, not a blanket collision proof.
- The existing 9,600-pose gait audit passed; the limb rig was not edited.
- Final browser audit: 192 poses, 72 yaw renders, equipment-toggle restoration,
  no page errors, paused frames zero, 390px viewport without horizontal overflow.
- Final direct/bitmap file audit: pixel parity across four gaits/six idle angles,
  no HTTP/errors, missing ACK rejected at 15.001s. Protected baseline images were
  not updated; authored shape differences were reported explicitly.

Evidence: `output/mounted-v26-pre-*.png`, `mounted-v26-tail-*.png`,
`mounted-v26-motion-*.png`, `mounted-v26-live-comparison.png`, and fresh
`mounted-final-*.png` / `mounted-phone.png`. Captures are isolated development
tests, not control of the user's existing file tab. User must refresh that tab.
The separate feedback about lateral leg motion and bag-like upper-limb volume
was diagnosed but is not fixed by this tail-only change. No production/Godot
integration, no reference promotion, no unrelated art audit, no push.

## v27–v28 — coupled body mass and single-arc rear recovery (2026-09-30)

Requested follow-ups: remove sideways joint kicks and bag-like upper legs; let
the back, shoulders and haunches participate in the stride; make the rear push
and rear-facing sole readable; remove the hanging rectangular underside while
retaining belly volume; fix rear-foot hesitation/double lift and forelegs folding
too far behind the chest. These changes remain local to this mounted lab.

The limb bends now stay in their own sagittal planes. Fore roots/feet use a
4.8-unit half-track; hind roots use 5.2 and feet 4.7. Upper-leg skin sections
start near the actual elbow/stifle chain, with an intermediate narrowing before
the lower joint, rather than one long attachment fan reaching toward the hoof.
The shoulder and haunch surfaces receive a bounded rotation from the actual
proximal bone. Their exact boundary vertices are reused by the welded leg skin.
This deformation fades out across the saddle band and upper spine: the central
body stays coherent and tack is not independently stretched.

Body pitch now participates in walk/trot as well as gallop. Fast motion combines
.045 whole-body pitch and .030 outer-body articulation, plus a small rump lift
and rotation driven by the actual staggered hind support phases. Gallop body
bounce is phase-shifted to follow that push. The belly retains its middle volume
(lowest authored section 13.85), but the bottom face narrows instead of hanging
as a broad rectangle; the girth follows the adjusted underside. The v26 tail's
geometry and side sway remain, with a small fast-motion counter-pitch to keep
the end above ground under the stronger body dip. Default framing is fixed at
6.65 pixels/world unit; it does not zoom during a stride.

Fast hind recovery now uses one time-warped height arch, peaking at 40% of the
airborne phase. An earlier additive kick-height bump caused the reported second
rise and was removed. Hoof orientation is independent: its rear-facing kick
reaches 1.5 radians after initial clearance. Quintic rear-turn segments preserve
finite acceleration, avoiding the near-stall before forward recovery, while
stance paths, footfall order and fixed bone lengths are preserved.

Fast fore recovery turns forward at u=.09, reaches forward at u=.575 and unfolds
over u=.30–.56. This keeps the collected lower chain closer beneath the chest
and retains the long airborne forward extension. The .58 trial had two tested
triangle crossings at one gallop pose; the final .575 timing cleared that case
without changing hind motion or planted support travel.

Reference gates: fresh live Art Lab overview and isolated `knight`, `bear` and
`seated-merchant` before edits, followed by their native renderer excerpts; fresh
live anchors beside the final candidate during review. Their broad connected
masses, distinct joint transitions and stable material planes guided the new
upper-leg volume and skin coupling. Final right/left profiles, oblique fast-run
phases, trot phases and desktop/390px lab scenes were inspected. The chest gap
is reduced and body mass now participates in the poses. The haunch-to-upper-leg
taper remains somewhat angular in the rear three-quarter view; this is a
candidate for user feedback, not a claim of aesthetic approval. The previous
external horse-running link was not recovered or viewed; the existing local
Zelda reference was inspected. No claim of an exact reference match is made.

Final checks:
- Gait: 9,600 samples, no failures; each hind foot has one lift crest and zero
  upward rebounds. Minimum hoof clearance .0854 world units; maximum horse
  bone-length error below 1.25e-14. Authored join/loop continuity checks pass.
- Surface: 960 poses, zero tested limb/transition crossings against body/cuff,
  zero face-colour changes; central saddle-band skin deformation stays zero.
  This does not cover all skin-to-skin triangle pairs. Wider exploratory probes
  found local self-intersections outside that standard audit; no universal
  intersection-free or continuous-time collision claim is made.
- Skin topology: 484 poses, 630 faces / 1,032 edges / 412 vertices, five closed
  components (welded body/four legs and four hoof shells), no failures.
- Tail: 1,920 samples; fixed lengths, attached root, periodic motion, stable
  colours and closed mesh pass. Minimum ground clearance .4598 world units;
  default all-yaw horizontal margin at least 18.31 logical pixels.
- Final browser: 192 poses, 72 yaw renders, gear-toggle restoration, no page
  errors, paused frames zero, 390px viewport without horizontal overflow.
- Final direct/bitmap file transport: pixel parity in all four gaits and six
  idle angles, no HTTP requests/errors; missing ACK rejected at 15.001 seconds.
  Protected v22 baselines remain unchanged; authored deltas explicitly allowed.

Evidence: `output/mounted-v27-pre-*.png`, `mounted-v28-pre-*.png`, final
`mounted-v28-motion-*.png`, `mounted-v28-live-comparison.png`, fresh
`mounted-final-reference-*.png`, `mounted-desktop.png`, `mounted-phone.png`.
All captures are isolated development checks, not interaction with the user's
open file tab. User refresh is still required. No production/Godot changes,
reference promotion, unrelated full-game art audit, formal-memory writes or push.

## v30–v31 — rounded barrel, coupled foreleg mass and marked front belly (2026-09-30)

The user requested a less rectangular body, a modest belly and more coherent
body/leg participation. Their follow-up front screenshot explicitly placed the
belly's lower edge at a red arc between the forelegs. That marked silhouette is
the final height target, not the earlier, shallower v30 belly trial.

The barrel now has twelve broad oval planes. Its central underside drops to
11.3 horse units and rises into the existing fore/rear socket regions, while
the back, seated rider, head, tack identity and palette remain unchanged. The
short central bottom edge is wider than the initial v30 trial, with sloping
lower sides rather than a hanging rectangular panel. The girth follows this
new underside. At matched character scale, the front bottom moved about 24px,
to approximately y559 in the final 663px-wide front capture: the user's red
arc aligns at approximately the same height. The side profile retains one
continuous bowl-shaped volume. The rear socket body stations were preserved.

The preceding v30 motion work gives each fore root a bounded load-dependent
vertical/depth response and carries that response into its shoulder skin.
Fast/trot airborne fore lift is smaller and the proximal rearward angle is
bounded; fixed bone lengths and the existing forward foot-path timing remain.
The hind foot position/pitch sample hash was identical before/after that rig
change. v31 changes only body/skin/tack geometry, not the rig or foot paths.

The body and limbs share actual ten-edge openings and fixed bind-material
correspondences. Broad upper-leg sections taper through distinct joints.
Mirrored strip diagonals on HR/FL remove internal folds without changing any
vertex positions. FR retains its authored bind angles when the belly expands,
so body fullness does not retwist that leg. The rear skin's terminal closure
ends 0.25 local units farther inside the unchanged solid hoof; other section
centres, widths and hoof motion are preserved. Trials that rotated the whole
fetlock centre or forced its entire frame to the hoof frame were rejected and
were not saved.

Both reference gates were performed using fresh live Art Lab overview and
isolated `knight`, `bear`, `seated-merchant` models, with their native renderer
excerpts inspected after viewing. Broad connected masses, purposeful joint
transitions and a few stable material planes guided the construction. Final
review uses fresh references beside the candidate, profile/front/oblique motion
samples, and the actual desktop/390px local lab. No reference was promoted.

Two visual observations remain distinct from mesh correctness. Small dark
triangles in the 90-degree foreleg overlap at gallop .050s and trot .140s are
genuine negative space between FL and FR: read-only projected-triangle checks
found no covering triangle even with culling ignored. They are not holes that
should be painted over. The rear three-quarter haunch still has an angular
internal dark/light boundary from fixed per-row bind shading; it is not a
temporal recolouring change or a new external tear. This candidate does not
claim that every animation/material transition has aesthetic approval.

## v32 — researched chest/pelvis timing and soft abdominal collection (2026-09-30)

The user requested less stiffness, visible body flexion and a slimmer moving
belly, with internet research into actual horse motion and animation practice.
The standing v31 belly marked by the user's red arc remains the rest shape.

Research inspected before implementation:

- BBC Earth, [Ultimate Horsepower in Super Slow Motion](https://www.youtube.com/watch?v=86Zu8mqd8LM):
  actually played in the research browser, then visually inspected paused
  footage around 1:01, 1:06, 1:11, 1:16 and 1:21. These edited slow-motion shots
  support comparison of support, collection and extension poses, not exact
  stride-phase measurements from their timestamps.
- Muybridge, [Horse in Motion, National Gallery of Art](https://www.nga.gov/artworks/206147-horse-motion):
  inspected the photographic sequence itself, not only the catalogue text.
- [Hatrisse et al. 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10747348/):
  distinct back flexion/extension patterns and a single cycle per gallop stride,
  compared with two in walk/trot; not a reason for cat-like accordion scaling.
- [Marlin et al. 2002](https://pubmed.ncbi.nlm.nih.gov/12405721/): small chest and
  abdominal circumference changes during exercise, with different phase
  relationships across gaits. The implemented belly displacement is a
  conservative visual design setting, not a percentage measured by that paper.
- Animator [Daniel Fotheringham, Spine Gaits](https://danielfotheringham.com/quad-blog-beta/the-spine/spine-gaits/):
  author the chest/pelvis relationship and contact-to-load delay before polishing
  limbs. His example offsets are not treated as universal horse anatomy.
- [Animation Resources, Animation Reference](https://animationresources.org/instruction-animation-reference/):
  reference footage and photographic key positions guide the body tracks and
  breakdowns. A separate automated video-index attempt was not relied on as
  evidence of having watched footage.

The new rig separates chest and hip heave, then derives the central body pitch
from their difference. Fast chest/hip peaks occur at authored stride phases
.03/.65; the chest's low point follows the first fore contact. A signed lumbar
bend changes the rear frame around the loin, fading to zero behind the saddle
and becoming rigid at the tail attachment. Fast excursion is approximately
5.73 degrees total, not plus/minus six degrees. The old extra rump-push/bob
oscillator is removed to avoid stacking two copies of the same body movement.
Walk/trot use much smaller two-pulse bending. These are animation choices
informed by the references, not a validated biomechanical simulation.

Only the soft lower abdominal envelope lifts and gently narrows: .08–.12 local
units in walk, .45–.75 in trot and 1.10–1.75 in gallop, greatest during collection.
The dorsal saddle band, leg-root anchors and rest mesh are excluded. The girth
follows that same field while the hard saddle and rider attachment remain in
their rigid central frame. No whole-body longitudinal scaling is used. Body
frames are evaluated before fixed-length leg IK; ground targets are not rotated
with the torso. The fast baseline is lowered slightly to preserve reach without
stretching bones. Hind hoof XYZ/pitch paths are exactly unchanged; fore horizontal
paths, ground contacts and pitch are unchanged within floating-point precision.
The existing foreleg reach guard adjusts airborne height for the new roots by
up to .904 local units; nominal swing timing and lift curves remain unchanged.

Both mandatory live-reference gates use the approved knight, bear and seated
Autumn merchant. Broad connected volumes, restrained material planes and
attached joint transitions remain the construction criteria. The v32 draft
phase boards showed a readable chest/hip timing difference and a more tucked
running underside. Small dark folds remained internal shading/occlusion in
those images; intersection testing is reported separately from visual judgment.

## v33 — user-reported chest loss and detached limb transitions (2026-09-30)

The user's new left-profile collection screenshot identified disappearing chest
volume, an abrupt haunch/leg join and forelegs that appeared to move separately
from the body. This extends the v32 request; a passing gait audit did not resolve
these visible surface problems.

Diagnosis separated three defects:

- The front barrel ended at z12.8, top24.5, below the neck's lower contour there
  (approximately25.5). Much of the remaining lateral chest was a large socket
  opening lofted straight into the foreleg. It therefore lacked a persistent
  pectoral core during collection. Two-sided diagnostic rendering confirmed
  the large notch was missing volume, not only back-face culling.
- The moving fore skin started 80% of the way from shoulder to elbow. This put
  its first cross-section above the actual joint and twisted it toward the next
  forearm section. The full v32 scan found126 internal fore-skin intersections
  in47 of240 gallop samples, despite the narrower body/limb check being clear.
  Moving that first section onto the real elbow eliminated those intersections
  in all240 samples of each moving gait, without changing any bone or hoof path.
- The GPU culled a whole polygon using the normal of its first triangle. Posed
  barrel caps and neck quads can become nonplanar, leaving some constituent
  triangles front-facing while the first one faces away. Culling is now per
  rendered triangle, with unchanged authored face colour and depth testing.
  A mixed-facing synthetic polygon and192 actual-mesh views agree pixel-for-
  pixel with explicitly triangulated geometry in the dedicated regression.

The fore elbow correction is uniform across walk/trot/gallop; standing retains
its previous leg skin. The first two moving hind rows shift from50/70% to40/60%
of the stifle-to-hock segment, giving the upper thigh more of the transition.
An attempted first row directly on the stifle was rejected: it penetrated the
closed barrel in collection. No bones were stretched and no collision check
was disabled to accommodate it. A solid pectoral extension is built ahead of
the existing shoulder socket, rather than painting over the missing region.

The final pectoral contour rises26.0→26.5→27.5 across z9→12.8→14.2, bridging
the lower neck in width as well as height. Merely raising the new foremost cap
left a narrow real slit behind it and was rejected. A read-only two-profile
scan of all240 gallop phases (480 views) found no enclosed neck/barrel background
gap after the corrected contour. This is a sampled visual-connectivity check,
not a claim that every possible view and time has been proven gap-free.

Haunch flesh now follows65% rather than50% of the bounded thigh response, so the
outer mass accompanies the upper leg more clearly. The central saddle, marked
standing lower belly, foot trajectories and bone rig are not moved by these
v33 skin/culling repairs. Standing leg skin remains unchanged; the new chest
volume intentionally also repairs the standing neck junction. The richer chest
is therefore not described as an exact whole-character idle-image match.

Final combined v33 checks (renderer9b72e02f, rig389a074e, horseGPU8aca7bb8):

- Full surface scan:960 poses, zero standard crossings and zero unordered
  body/leg-skin triangle crossings in every gait, including terminal closures.
  No material-colour changes. Maximum skin deformation2.46030 stays below the
  existing2.5 limit; upper central saddle-band motion is zero and the independent
  lower-belly contract matches within floating-point precision.
- Body/girth:960 poses, no failures. Collection phase, amplitude, periodicity,
  upward/inward-only soft deformation and exact tack attachment pass. The
  maximum added girth gap is.129227 local units (budget.15); no sampled girth
  penetration. Minimum gallop clearance is.114039 local units.
- Welded skin:484 poses,802 faces/1,320 edges/528 vertices, five closed components
  (one connected body/four legs plus four hoof shells); maximum frame step1.137893.
- Unchanged final rig:9,600 gait poses pass fixed lengths, planted contacts,
  cadence, gait phase and join/loop continuity. Tail:1,920 samples pass, with
  final gallop minimum ground clearance2.07980 world units.
- GPU culling: synthetic mixed-facing polygon plus192 sampled mesh views match
  explicit triangle geometry with zero pixel differences.
- Expanded neck seam check:1,920 close profile renders (four gaits,240 phases,
  both90/270-degree views) contain zero enclosed background holes between the
  actual posed neck and barrel under independent per-triangle depth rendering.
- Browser:192 pose inspections and72 yaw renders pass, no page errors, gear
  toggle restoration correct, paused redraws zero and390px layout without
  horizontal overflow. Concurrent test timings are not a phone FPS benchmark.
- File transport: direct/bitmap pixel parity in all four gaits and six idle
  views; no HTTP requests or errors. Missing acknowledgement is rejected after
  approximately15 seconds. Historical protected image baselines were not edited.

Final visual review inspected12 phases of trot and gallop at0/90/145/270 degrees,
fresh live knight/bear/seated-merchant references beside the candidate, and the
actual desktop/390px Lab layouts. Chest volume stays readable in collection;
the under-throat gap is absent in the inspected frames, and the shoulder/haunch
surfaces follow their limbs without the earlier collapsing transitions. Broad
faceted material boundaries remain deliberate; no claim of user aesthetic
approval or continuous-time universal collision freedom is made.

Evidence: `output/mounted-v33-motion-*.png`, `mounted-v33-post-*.png`,
`mounted-v33-live-comparison.png`, `mounted-desktop.png`, `mounted-phone.png`.
All checks ran in isolated development browsers, not the user's open file tab.
Refresh is required to see the saved changes. No production/Godot changes,
reference promotion, unrelated full-game art audit, formal-memory write or push.

## v34 — remove coat islands and trim the rear-thigh ledge

The user's new screenshot rejects the small dark foreleg triangles and the
sharp buttock-to-hindleg transition. The v33 collision pass did not establish
visual acceptability: these particular front artifacts were authored colours,
and the rear silhouette still had an overly low, flat overhang.

Fresh live Art Lab pre/post gates used the current `knight`, `bear`
and `seated-merchant` IDs, with the isolated renderers inspected after the
previews. Their broad, continuous material planes informed this cleanup;
small independently shaded strips were not treated as intentional detail.

- Coat columns now carry one bind-authored colour from body cuff through the
  brown leg. Previously each longitudinal strip classified its own normal:
  FL columns0/9 turned dark only in the transition, making the screenshot's
  isolated wedge. White socks keep their separate material planes.
- The right forequarter has an explicit broad main/underside field, removing
  the equivalent pocket found when checking the opposite270-degree profile.
  The left haunch keeps its original broad column field independently of the
  edited rear contour, so that shape change cannot add a new shadow wedge.
- Only the rear-most barrel bottom changes16.3→18.5 at z−16; its top22.4 and
  width2.8 stay fixed. This removes the hanging horizontal ledge and creates a
  sloping haunch-to-thigh contour. The central standing belly, other barrel
  stations, saddle and every bone/hoof trajectory remain unchanged.

Curving just the intermediate cuff rows had negligible visible benefit and
was not adopted. A larger posterior muscle expansion introduced crossings and
was rejected. No overlay, blur, camera-specific mask or weakened collision
threshold is used. The rear contour also intentionally changes the standing
silhouette; this is not claimed as an exact idle-image match.

Final renderer is `aef2c5ad7d2c4d9aaedffada38d66383b4c86dfe865eb4fc8b3f1b2cf748125b`.
Rig389a074e, saddle52648ce1 and horseGPU8aca7bb8 are unchanged. Dense geometry
checks ran on355cfe7a before the final HL colour-only branch; undoing only that
branch and its two comments reconstructs that exact source hash.

- Final material960: zero column, phase or brown/cream-region errors, with
  multiple broad tones preserved. Four negative checks reject broken colour
  continuity, flattened shading, repainted socks and pose-changing materials.
  Full-horse geometry equivalence over960 poses compares22,590,720 coordinate
  values against355cfe7a: zero position/normal/topology/semantic differences;
  only the intended HL column7 colour changes.
- Surface960: zero core/limb and all-skin crossings in every gait, zero colour
  changes, maximum skin motion2.460297 below the existing2.5 bound.
- Topology484:802 faces,528 vertices,1,320 edges, five closed components;
  maximum frame step1.137893. Body/girth960: no failures or penetrations,
  maximum added gap.129227 below.15, minimum gallop clearance.114039.
- Unchanged rig9,600 and tail1,920 samples pass. Independent rear-edit
  comparison found zero standing central-belly/other-station displacement and
  zero bone-position change across725 sampled poses. Hind bind-skin vertices
  can change by.089286 world units; that is not bone stretching.
- Browser final:192 pose inspections,72 yaw renders, equipment-toggle
  restoration, zero paused redraws, no errors and390px layout without overflow.
  File transport final: four-gait direct/bitmap pixel parity, zero HTTP requests
  or errors, missing-ACK timeout15.002s. The explicit authored-shape option
  reports old idle-image deltas without changing protected v22 references.
- Per-triangle culling still agrees with explicit triangulation in192 views.
  These sampling results are not universal continuous-time or aesthetic proof.

Final visual review inspected twelve phases each of trot/gallop at90/270/145
degrees, exact gallop.275s details from both profiles, the fresh live-reference
comparison, and actual desktop/390px Lab layouts. The small forecoat islands
are gone in those views, and the rear ledge is visibly reduced while keeping
the game's crisp faceted planes. No new character approval is implied.

Evidence: `output/mounted-v34-motion-*.png`, `mounted-v34-final-detail-*.png`,
`mounted-v34-live-comparison.png`, `mounted-v34-pre-*.png`,
`mounted-v34-post-*.png`, `mounted-v34-hind-probe-rear-cut.png`,
`mounted-desktop.png` and `mounted-phone.png`. Only the local Lab renderer,
its material regression and this review changed; the user's open tab was not
controlled. Refresh the Lab to load the saved renderer.

## v35 — moving cloth clearance and collected hind-thigh volume

Status: superseded for the hind-thigh appearance by the user's four subsequent
111-degree screenshots at2.120/2.210/2.287/2.376s. The user still sees excessive
opening below the rump. The technical passes below remain valid measurements,
but the A5 volume correction is not accepted as resolving that visual defect.
The cloth change is being preserved while that attachment is revised.

The user's three new screenshots identify two different faults: a raised
foreleg cuts through the blue blanket, and the posterior thigh loses too much
volume below the buttock in collection while the closed pose looks connected.
The earlier skin-only collision checks did not cover cloth; they cannot serve
as evidence that the blanket was clear.

Fresh pre-design live Art Lab inspection used registry IDs `knight`, `bear`
and `seated-merchant`, followed by their native renderer/pose source. Broad
connected muscle masses and continuous layered materials informed this edit.
Final fresh live references were inspected beside the actual candidate again;
the character, colour planes and approved rider identity were not redesigned.

- Tack is built after the complete posed, unscaled horse skin. The blanket
  now fits its hanging panels around actual triangle footprints in the saddle
  frame, including interior contacts instead of checking only panel corners.
  Shared panel nodes carry the folds, closed hems and gold binding together.
  Dorsal rows and the rider/seat anchors remain pinned. No camera mask, render
  order workaround or depth-bias adjustment is used.
- Moving the blue panel initially buried part of the broad leather skirt.
  Visual review caught this regression. Its lower folded panels now follow
  the same cloth field, split at fold/station boundaries so interior chords
  cannot bury the flap. The upper seat/rim and metal stirrup contacts stay
  fixed; original authored face colours remain stable.
- Only the posterior half of the first two hind-leg skin rings gains
  pose-dependent longitudinal volume. Fixed-length bones, feet, body socket,
  X/Y coordinates, forelegs, closed gallop pose and standing skin are preserved.
  The response uses smooth knee-flexion/collection gates and amplitudes5/2.5
  local units. An earlier6/3 trial exceeded the existing frame-step limit and
  was rejected; no acceptance bound was weakened.

Final renderer SHA256:
`0bb1e209545633e0e5092c8335290000e1f4e984d28d4fca84238917a550441b`.
Final saddle SHA256:
`e0406e8afffae614afe31a74da60ec3c600235925b26af965d6accf2eeac9c6e`.
Rig389a074e and horseGPU8aca7bb8 remain unchanged.

- New cloth contact audit:960 poses, zero blue/gold intersections with all
  four legs; zero hanging-panel/gold intersections with the barrel. Maximum
  cloth displacement.980088 local units, maximum skirt displacement.833805;
  zero cloth/skirt colour changes or pinned-anchor movement. A separate
  temporal check found maximum lateral cloth step.03152 local units and
  cycle seam error below4e-15.
- Scope caveat: the old hidden dorsal/seat stack still has intersections.
  They are explicitly reported, not counted as complete coat clearance:
 116–118 triangle pairs per pose versus134–136 for the same grid without
  drape. Layered saddle/girth/tack contacts remain informational. The task
  does not migrate the seat or claim that every material is intersection-free.
- Surface960 and material960 pass: zero core/limb or all-skin crossings,
  zero coat-column/material changes. Body/girth960 passes with maximum added
  gap.129227 below.15 and minimum gallop clearance.114039 local units.
- New haunch regression checks960 poses against an independently evaluated
  response and deformation-disabled control. Body/central belly, forelegs,
  hooves, bones, X/Y coordinates, anterior/distal rings, idle/walk and colours
  remain exact. The user's closed gallop pose is unchanged; the.443s pose
  retains more posterior muscle volume without shifting the hoof trajectory.
- Welded-skin484 passes with802 faces,528 vertices,1,320 edges and five closed
  components. Maximum frame steps are1.245838 trot and1.185683 gallop, below
  the original1.4 limit. Unchanged gait9,600 and tail1,920 checks pass.
- Browser:192 pose inspections and72 yaw renders, no errors, equipment toggle
  restoration and zero paused redraws. The390px layout has no horizontal
  overflow. File direct/bitmap transports are pixel-identical in four gaits,
  use zero HTTP requests and reject a missing acknowledgement after15.001s.
  Triangle-culling192 views has zero pixel mismatches. Timings measured under
  parallel desktop QA are not a phone FPS benchmark. Syntax checks pass.

Final visual review inspected twelve phases of trot/gallop from0/90/270/145
degrees, both close profiles at gallop.443s, the fresh live-reference comparison
and actual desktop/390px Lab layouts. The blue cloth no longer exposes the
crossing foreleg in the inspected collection poses; the leather flap remains
whole above it. The posterior thigh fills the screenshot's excessive notch
while retaining the closed-pose contour and deliberate broad material planes.
These are sampled technical/visual checks, not aesthetic approval or a proof
of continuous-time universal collision freedom.

Evidence: `output/mounted-v35-motion-*.png`, `mounted-v35-cloth-leather-*.png`,
`mounted-v35-live-comparison.png`, `mounted-v35-pre-*.png`,
`mounted-v35-cloth-audit.json`, `mounted-final-reference-*.png`,
`mounted-desktop.png` and `mounted-phone.png`. Only local Lab renderer/tack,
the two new scoped audits and this review changed. No production/Godot change,
reference promotion, formal-memory write, unrelated full-game art audit or
push. The user's open file tab was not controlled; refresh loads the result.

## v36 — remove the false split exposed by the four111-degree screenshots

The user rejected the remaining rump/leg opening in gallop at111 degrees,
times2.120,2.210,2.287 and2.376s. Exact local reproductions matched those
screenshots; this was not dismissed as a stale-tab issue. The v35 entry above
records that its volume change had not resolved the reported appearance.

Fresh live pre-design Art Lab gates again used `knight`, `bear` and
`seated-merchant`, with their native code inspected afterward. Broad connected
material planes were the applicable construction lesson. Fresh final references
were inspected beside the new candidate and actual desktop/390px Lab previews.

Per-face diagnostic colours and uniform-coat renders distinguish the visible
causes. The conspicuous near-side horizontal dark strip is actual HL skin,
especially coat columns8/9 in the torso-cuff and transition, not background
showing through a topological hole. Its medial web turns toward the111-degree
view as the leg folds, exposing a very dark bind-authored plane and making the
thigh look split from the rump. The ruled upper attachment also has a real
concavity, so a flat diagnostic colour alone was not treated as sufficient.

Four independent shape trials were evaluated. Femur-shell, hip-anchor and
lateral-cuff variants introduced intersections without a clear visual gain.
A continuous posterior envelope passed its coarse surface checks but made
the haunch hang like a broad triangular skirt; it was rejected visually.
None of these geometry trials was applied to the runtime.

The adopted change is deliberately material-only: HL columns8/9 now carry
the existing main coat tone, continuously from rump cuff through brown leg.
HL columns0/1 retain underside shadow and column4 retains its highlight.
The rest of the coat, white socks, opposite leg, rig, skin geometry and v35
cloth fix are unchanged. Mirroring this colour change onto HR created a
bright patch on the270-degree shadow side and was rejected. The remaining
small triangle at111 degrees/time2.120 is the far HR leg/underside, chiefly
faces1161–1164; it is not the removed near-side band or an empty hole.
This correction does not claim that every dark triangle or natural leg gap
has disappeared, or that a new upper-leg skeleton has been implemented.

Final renderer:
`956cc7febc7fce17a65689d4fda07828740186e728baae23f240728d9e578535`.
Reverting only the two material indices reconstructs the exact v35 renderer
hash0bb1e209. Saddle e0406e8a, rig389a074e and horseGPU8aca7bb8 remain unchanged.

- Material960 passes the new posterior-continuity regression and all existing
  broad-shading, phase, topology and sock-colour contracts.
  A32-pose negative run restoring the old HL field is correctly rejected by
  `leftPosteriorHaunchContinuity`.
- Full-horse comparison over960 poses checks25,539,840 position coordinates
  and6,779,520 normal coordinates: zero geometry, topology or semantic
  differences. Exactly24 HL brown faces per pose change dark→main tone;
  all other materials remain exact. Thus v35 cloth/skin collision results
  apply to identical geometry; they were not silently relabeled as new tests.
- Fresh browser192/72 views: no page errors, equipment restoration correct,
  zero paused redraws,390px layout without horizontal overflow.
- Fresh file direct/bitmap parity holds for all four gaits; zero HTTP requests
  or errors, missing-ACK rejection15.006s. Protected historical baselines were
  not rewritten. Syntax checks pass.

Main visual review inspected all four exact111-degree user poses before/after,
twelve phases of both trot and gallop at111/90/270/145 degrees, fresh live
references side by side and actual desktop/phone layouts. The broad false
near-side split is gone in the inspected frames, without enlarging the thigh
or disrupting the cloth. This remains a candidate for user visual judgment,
not automatic character/reference approval.

Evidence: `output/mounted-v36-before-user-poses.png`,
`mounted-v36-after-user-poses.png`, `mounted-v36-motion-*.png`,
`mounted-v36-haunch-probe-*.png`, `mounted-v36-color-probe-*.png`,
`mounted-v36-live-comparison.png`, `mounted-v36-pre-*.png`,
`mounted-final-reference-*.png`, `mounted-desktop.png`, `mounted-phone.png`.
Rejected `mounted-v36-hind-*.png` boards and `labs/v36-haunch-probe.cjs`
are diagnostics, not runtime or approved models. Runtime delta is one Lab
material-field line; its regression and this review were updated. No production,
Godot, formal-memory, reference-baseline, unrelated-art or push changes; no
control of the user's open browser tab.

## v38 — smoother forelimb recovery and posterior haunch response

The v37 check confirmed two continuous but visibly abrupt motions, not broken
bone attachments: a held/released fore upper arm followed by a fast reach-cone
collapse, and the A5 posterior-volume gate opening in about 41 ms. The user
then explicitly requested the correction. This is a Lab-only motion change.

Fresh pre-edit Art Lab inspection used the approved `knight`, `bear` and
`seated-merchant` IDs, the live overview, isolated large/small renders and
their native pose/render code. Connected broad masses, fixed articulated
limbs and continuous material planes were the construction constraints.
Fresh post-edit references were inspected beside the candidate, along with
the actual desktop and 390px Lab layouts. No reference was promoted or replaced.

The fore upper arm now follows a broad, bounded recovery sweep during gallop
flight. Quintic entry/exit and unfold envelopes avoid the previous hold/release
and anticipate the narrowing fixed-length reach cone. A C2 smooth bound retains
the existing carpus-flexion and reach limits. No history-dependent filtering
was added. The stance chain, shoulder roots, hoof targets/pitches, hind skeleton,
body channels and rider are exact against the frozen pre-edit rig across 4,800
poses; idle, walk and trot rig poses are unchanged. Hoof endpoint differences
are numerical noise below 1.1e-14, not authored trajectory changes.

At 6,000 gallop samples, maximum forward humerus speed falls from about 1,140
to 734 degrees/s, and maximum angular acceleration from 114,305 to 61,850
degrees/s². Arbitrary-phase forward frame steps fall from 16.59 to 11.56 degrees
at 60 Hz and 8.91 to 6.02 at 120 Hz. Whole-cycle absolute steps improve only
slightly because the retained backward return now dominates; this is not a claim
that all fast rotation was removed. Early pickup acceleration increases locally
by about 19%, while staying below the new overall peak; the sampled pickup was
also visually checked. The new envelope/unfold knots pass second-derivative
convergence. The protected hoof Hermites retain their existing acceleration
breaks; the complete leg motion is not claimed to be globally C2.

The posterior A5 response keeps its 5/2.5-unit amplitudes and posterior-only
direction, but widens its pose gates to `(bend-1.35)/.85` and
`(jointY-hockY+4)/8`. It retains collected volume while spreading its change
over more of the pose. The shared body boundary, width/height, bones and v36
coat fields are unchanged. At actual 60/120 Hz with four frame-grid offsets,
the cuff/middle-row maximum steps decrease by 24.6–44.4% and accelerations by
61.6–77.9%. Scrubbing remains deterministic and the cycle joins without a seam.

Final source hashes:

- Rig: `9056fca336972d3b18d6e1e84ec28ed3b992f95dccd1d47ade1a8fc48e64385f`.
- Renderer: `1abeadbe10ed12f1028c3d5b9954a045fc8608dabf5a4111b36c5bdd0272dcc7`.
- Saddle remains `e0406e8a`; horse GPU remains `8aca7bb8`.

Final combined verification passed the unchanged 9,600-pose gait audit, new
fore-motion and real-time haunch regressions, 960-pose body/surface/material/
haunch/cloth suites, 484 skin-topology poses, 1,920 tail poses and 192 culling
views. Skin self-crossings and cloth-versus-leg/side-panel intersections are
zero in their sampled checks; the separately reported historical hidden roof/
seat overlap remains, so this is not a blanket zero-intersection assertion.
The old haunch audit changed only its expected authored response, not topology,
colour, displacement, collection or protected-region limits. Art Lab's full
technical audit also passed, without rewriting its protected images/baseline.

The browser check passed 192 poses and 72 render views, equipment restoration,
paused redraw suppression and the 390px layout. The file transport check first
rejected its old v22 idle image, as it has for subsequent authored geometry;
rerunning its existing `--allow-authored-shape-change` mode preserved that old
image and passed exact direct/bitmap parity in all four gaits, zero HTTP loads
and the 15-second missing-ACK rejection. A separate 48-pose before/after check
proved that this v38 edit leaves the entire idle horse geometry, normals,
topology and materials byte-for-byte equivalent. Concurrent diagnostic render
timings are not phone-FPS measurements.

Main visual review inspected all eight 24-phase trot/gallop boards at 90, 270,
111 and 145 degrees, plus five 16-frame transition boards sampled at 240 Hz.
The latter cover late fore unfolding, pickup, back-limit release and both
posterior gates. The forward change is distributed more evenly, the haunch
response is quieter, and the broad coat fields and accepted tack treatment
remain coherent. These are labelled sampled frames, not claimed video playback.

Evidence: `output/mounted-v38-before-*.png`, `mounted-v38-motion-*.png`,
`mounted-v38-fore-*.png`, `mounted-v38-haunch-*.png`,
`mounted-v38-transitions.json`, `mounted-v38-final-*-audit.json`,
`mounted-v38-live-comparison.png`, `mounted-v38-pre-*.png`, fresh
`mounted-final-reference-*.png`, `mounted-desktop.png` and `mounted-phone.png`.
Source changes are the two Lab motion blocks, their targeted regressions and
manual visual-capture helper. No production, Godot, formal-memory, reference
promotion, push or control of the user's open browser tab.

## v39 — inner-haunch connection and quieter front blanket

The user requested a slightly fuller inner rear-leg connection at 1.000s,
reported a small brown flicker on Jonathan's greave, and asked to reduce the
blanket being pushed sideways when the forelegs return. All changes remain
inside Mounted Knight Lab. The rig, rider, GPU depth masks and production
Jonathan model are unchanged.

Fresh pre-edit live Art Lab overview and isolated `knight`, `bear` and
`seated-merchant` models were inspected, followed by their native renderer
code. The constraints were connected broad masses, clear articulated joints
and stable material planes. Fresh final live references were then inspected
beside the candidate in `output/mounted-v39-live-comparison.png`; broad coat
planes, saturated blue/gold cloth, cool steel and the original rider identity
remain coherent. This is technical/visual review, not reference promotion.

Only the raised inner hind-thigh corner receives a bounded .65-unit downward
fill, with a smaller .15-weight continuation into the next ring. Its quintic
weight follows the local opening, not a camera angle or hard-coded time. The
shared rump boundary, X/Z coordinates, bones and posterior A5 response remain
unchanged. At 1.000s the inner corner moves down .47477 local units, reducing
the visible notch height by about 25%. The dedicated 960-pose attachment audit
and disabled-fill negative control verify the intended small scope; sampled
60/120 Hz overall motion peaks do not increase.

The front lower blanket corner is tailored rearward: local front Z4.5 becomes
Z3.25 below Y21.4, blending back to the untouched upper edge at Y24.2. Its
gold binding and lower leather skirt follow the same mapping, with the inverse
mapping used for cloth-shift sampling. The existing contact solver remains.
Shared rod vertices are transformed exactly once; independent review caught
and removed an earlier in-memory repeated-vertex candidate error.

This removes the source of the greave chip: the old contact correction pushed
the leather skirt through the rider's native shin coverage. No enlarged rider
mask, depth bias, hidden stirrup or permanent blanket-width increase is used.
The 480-pose stability audit measures gallop front lateral range decreasing
from .771483 to .147893 local units (80.83%); walk/trot also decrease. Seat,
upper cloth, other tack, horse surfaces and material colors are exact against
the shaping-off comparison. The independent one-transform check has zero
error; a deliberate repeated-transform control is detected.

The unchanged 960-pose cloth audit passes with zero blue/gold-versus-leg,
hanging-side-panel-versus-barrel and gold-versus-barrel crossings. Historical
hidden dorsal/seat intersections remain separately reported; this is not a
claim that every layered tack surface is intersection-free. Maximum drape is
.685363 and maximum skirt displacement .764271, below the unchanged bounds.

The native greave regression covers 198 actual-renderer cases at 60/120 Hz,
87/90/93/267/270/273 degrees and .30-.48s. There are zero skirt-colored pixels
fully inside the shin's pixel-covered core; the archived faulty saddle still
produces 22 under the same test. Subpixel AA fringe is separately measured,
not silently counted as solid intrusion or used to inflate the rider mask.

Main visual review inspected eight 12-phase trot/gallop boards at 90, 270,
145 and 180 degrees, native shin close-ups on both sides, exact 1.000s rear
views at 172/180 degrees, and the actual desktop/390px Lab layouts. The smaller
inner-leg opening stays connected, the blanket stays close to the flank, and
the front gold binding stays attached. These are sampled-frame inspections,
not claimed video playback or phone-FPS measurements.

Final runtime hashes: renderer `f6eaa207`, saddle `4132b295`; unchanged rig
`9056fca3` and horse GPU `8aca7bb8`. Evidence is under
`output/mounted-v39-*`, with new attachment, cloth-stability and native greave
regressions in `labs/`. No unrelated working-tree changes were overwritten.

Final combined verification completed successfully: the unchanged gait, skin,
body, surface, material, posterior-volume, real-time haunch-motion, tail and
GPU-culling audits, the new inner-attachment audit, and the existing fore-motion
regression. The browser audit passed 192 poses and 72 render views, equipment
restoration, paused redraw suppression and the 390px layout. Direct/bitmap file
transport parity and missing-ACK rejection passed using the existing explicit
authored-shape-change mode; old reference images were preserved. The full Art
Lab technical audit passed without changing its protected reference baseline.

## v40 — final visual gate and output-preserving CPU/upload optimization

The user liked v39 and requested a final check, then optimization. Scope stays
inside Mounted Knight Lab: no production renderer, rig, material, geometry,
shader, depth mask, draw resolution or gameplay changes. Both horse and rider
are native WebGL-rendered; CPU code still prepares their posed geometry. Their
GPU surfaces are composited into the Lab canvas, not replaced by baked sprites.

Fresh live Art Lab overview plus `knight`, `bear` and `seated-merchant` anchors
were inspected before work, followed by the relevant native renderer code.
Ten 12-phase trot/gallop boards at 45/135/180/225/315 degrees and desktop/390px
layouts showed no new blocker. During final review, the fresh same live anchors
were compared beside the optimized actor in `output/mounted-v40-live-comparison.png`.
Four additional 12-phase boards at 90/145 degrees and fresh desktop/phone Lab
captures were visually inspected. Connected broad masses, stable coat planes,
blue/gold cloth, cool steel, articulated limbs and the rider identity are retained.
These are sampled-frame checks, not a claim of video or real-phone FPS testing.

Two bounded changes remove redundant work. The horse foreground pass explicitly
reuses the immediately preceding base pass's packed/uploaded vertex buffer only
for the same face-array identity and yaw. Base draws always repack; foreground
consumes the reuse token. All draw/depth/stencil passes remain intact. The saddle
contact fit memoizes shared skin vertices only within that one fit, reuses its
already computed triangle area/sign, and avoids temporary map arrays for fixed
three-coordinate bounds/intersections. Arithmetic order is preserved; nothing
is cached across animation poses.

`mounted-knight-equivalence-audit.cjs` passed 492/492 exact full-horse cases:
1,256,772 faces and 18,042,732 numbers are identical to the frozen v39 sources,
including face order, normals and material metadata. The injected 1e-6 vertex
negative control fails as expected. `mounted-horse-upload-audit.cjs` passed 433
cases and 1,727 draws with identical packed bytes and non-upload GL commands;
433 old uploads become 223, including 192 real-horse view pairs. Its old-uploader
negative control is rejected.

Exact native 960x1120 RGBA checks pass all 48 states for baseline-repeat,
GPU-only, saddle-only and combined variants. This passes both readback-oriented
per-variant canvases and a fresh default canvas read once per state. The initial
pilot's first two baseline frames were affected by an asymmetric Canvas 2D
readback-backend switch; that failed report is retained. Parity now uses a
separate stable target and never changes the timed drawing canvas or tolerance.

Two sequential full ABBA runs each use 120 measured + 30 warm-up frames per
case/pass (1,920 measured frames/run). Median CPU draw/submission times in ms:

| Scene | Run 1 before → after | Run 2 before → after |
| --- | --- | --- |
| Idle, 45 degrees | 16.80 → 12.85 | 18.05 → 12.60 |
| Trot, 45 degrees | 17.80 → 15.40 | 19.80 → 18.00 |
| Gallop, 45 degrees | 16.55 → 13.80 | 17.70 → 15.25 |
| Gallop, rotating | 17.20 → 14.25 | 18.30 → 15.70 |

Motion-case median reductions range from 9.1–17.2%; idle improves 23.5–30.2%.
Means and p95 improve in all eight comparisons. These are desktop headless Edge
CPU wall-time diagnostics, not GPU execution time, presentation FPS or mobile
performance. Both runs report unchanged sources, no page errors and 48/48 exact
raster states. Full distributions are retained in `mounted-v40-performance*.json`.

The 480-pose cloth-stability gate passes with zero protected-geometry, pinned,
color, width-increase or camera error; gallop front range stays .1478933 versus
.7714826 with the v39 shaping disabled. The 198-case native greave regression
still has zero solid skirt intrusion, while its archived faulty saddle yields
22 pixels. Browser checks pass 192 poses, 72 views, gear restoration, pause and
390px layout. File transport/ACK checks pass in the pre-existing authored-shape
mode; those historical v22 images remain untouched. The full Art Lab technical
audit passes without editing its protected baseline.

The unchanged full 960-pose cloth-contact audit also passes: zero leg,
hanging-panel/barrel and gold/barrel crossings; maximum drape .685363 and skirt
shift .764271. Its entire results array exactly matches v39, including the
separately reported historical hidden-roof/tack contacts.

Final runtime hashes: renderer `137f853a`, saddle `91fb4b51`, horse GPU
`b8b6bb66`; rig remains `9056fca3`. Reports and frozen before sources are under
`output/mounted-v40-*`. This is an optimization of the reviewed candidate,
not promotion of a new reference or integration into normal gameplay.

## v41 — bounded local surface lookup, second optimization pass

The user requested the next optimization round. Only the Lab horse renderer
changes at runtime; the rig, saddle, horse GPU, rider, shader/depth logic and
production game remain untouched. Frozen `mounted-v41-before-*` sources are
the completed v40 version, so the timings below measure additional savings.

Fresh live overview and isolated `knight`, `bear` and `seated-merchant` anchors
were inspected before work, followed by native rider/bear/seated code. Broad
connected masses, coherent material planes and the original rider construction
remain the constraints, not a redesign. Final fresh references were inspected
beside the actor in `output/mounted-v41-live-comparison.png`, along with four
12-phase trot/gallop boards at 90/145 degrees and the actual desktop/390px Lab.
No visible silhouette, material, joint or tack-layering change was found.

The throatlatch/rein contact broad phase now uses a frame-local two-unit Y/Z
grid. It preserves original face order, inclusive bounds, exact triangle tests
and arithmetic. Both envelope builds remain: the moving posed envelope includes
the newly built throat geometry. A single bounds loop replaces four temporary
coordinate arrays per face; dense integer addressing avoids string-key work.
The grid is capped at 256 address slots and 4,096 face references, with the old
full scan retained for oversized, invalid or non-finite inputs. It never caches
geometry across frames. The sampled maximum is 132 slots and 2,024 references.

An initial string-keyed Map candidate reduced scanning but did not improve total
draw cost consistently. That candidate was superseded after separate routing
profiling exposed its setup cost; its pilot/full reports remain as evidence,
not the final result. The final dense/scalar version reduces candidate face
visits by 95.97% (4,898,064 to 197,268 over 7,008 actual contact queries).

Two sequential full ABBA benchmarks, each with 120 measured and 30 warm-up
frames per case/pass, give these median CPU draw/submission times in ms:

| Scene | Run 1 v40 → v41 | Run 2 v40 → v41 |
| --- | --- | --- |
| Idle, 45 degrees | 15.20 → 14.50 | 15.50 → 14.90 |
| Trot, 45 degrees | 18.80 → 17.90 | 20.10 → 17.60 |
| Gallop, 45 degrees | 17.00 → 14.55 | 17.70 → 15.30 |
| Gallop, rotating | 17.70 → 16.00 | 18.30 → 15.20 |

Motion medians improve a further 4.8–16.9%; idle improves 3.9–4.6%. Means and
p95 also improve in all eight comparisons. Final reports are specifically
`output/mounted-v41-final-performance{,-repeat}.json`, each with 1,920 measured
frames, unchanged-source confirmation, zero page errors and 48/48 exact native
RGBA states. These are desktop headless Edge CPU diagnostics, not phone FPS,
GPU execution time or proof that no further optimization is possible.

Verification: 492/492 full-horse cases remain numerically exact against the
frozen pre-optimization v39 model (18,042,732 numbers, including face order,
normals and material metadata). The new index audit passes 33,339 boundary/
ordering checks across synthetic inputs and 84 real envelopes from 48 poses;
all seven fallback cases pass, and deliberately omitting a face fails. Native
default-canvas raster parity passes 48/48 states for baseline repeat, renderer/
GPU, saddle and combined variants. The existing upload regression passes 433
cases/1,727 draws. Browser checks pass 192 poses, 72 views, gear restoration,
paused redraw suppression and the 390px layout; the full Art Lab technical
audit passes without changing its protected baseline. No audit tolerance was
loosened and no old reference image was replaced to obtain these results.

Final renderer SHA-256: `4f60e8447ceaba38b022a60621561ba79c176903be95a447970103becb92ba29`.
Saddle `91fb4b51`, horse GPU `b8b6bb66` and rig `9056fca3` remain unchanged.

## v58 — rear duck shoulders and small horse nod (2026-10-01)

User confirmed the previous startup timeout is gone, then requested a shoulder/
torso clipping fix and a slight synchronized horse-head dip, with rear view as
the current review scope. User also authorized local HTTP setup after the
browser tool rejected file-protocol automation. `tools/local-lab-server.cjs`
serves this project on `127.0.0.1:8765` only; no directory listing, dotfiles,
outside-root real paths, non-local Host headers or write methods are served.

Fresh live Art Lab pre/post captures use approved registry IDs `knight`, `bear`
and `seated-merchant`. Inspected overview, isolated references and final comparison
board: preserve the square helmet, blue plume, cool steel, connected squared
shoulder plates, fixed limbs and broad animal planes. No palette or UI redesign.

The shared Jonathan renderer now keeps the full authored shoulder caps over
the cuirass in rear duck poses. The old single average duck chest depth removed
a triangular part of both caps; arm occlusion and other poses are unchanged.
Horse neck/head/mane use a maximum 0.14-radian (~8 degree) duck bend, smoothly
zero at the neck root and full at the skull. Ears, bridle and bit/rein anchors
follow the same transform. Cached rear geometry has a separate reusable duck
shell, so scrubbing a fixed gait time never bends the baseline cumulatively.
The same transform is available to the procedural view; visual acceptance here
is scoped to rear view as requested, not a new all-angle approval.

Evidence: `mounted-v58-{before,after}-shoulders.png`, fresh
`mounted-v58-reference-comparison.png`, desktop/390px Lab and actual-game duck
captures. Inspected full bend, intermediate poses and recovered pose with and
without back gear; shoulder plates stay whole and the mild head dip retains
the native silhouette. Art Lab technical audit passes (35 references,
13 sampled models, zero motion warnings); this is not user aesthetic approval.

`node labs/mounted-knight-duck-shoulder-audit.cjs` passes: 36 non-duck run/sword
states exactly match pre-edit RGBA under matched SwiftShader warmups; all four
gaits retain every non-head/neck/mane coordinate, recover exactly and remain
stable under repeated scrubbing. Eight shoulder samples recover the exact
light-steel colour where the old model showed the dark torso mask. Pixel
probes avoid the helmet footprint, whose legitimate foreground edge must not
be mistaken for clipping. Real ArrowDown input starts duck, the test action
remains 1.05s, recovery returns to running, and normal startup omits the test
renderer and retains 0.52s. Page errors: none. Desktop CPU timings displayed
by the Lab are not phone-FPS evidence. No protected reference images changed.

## v59 — slightly deeper neck-led duck (2026-10-01)

User requested that the horse lower its head a little farther from the neck.
The sole runtime delta from v58 is the neck duck amplitude: 0.14 to 0.22 radians
(about 8 to 12.6 degrees). The existing planted neck-root blend, skull/bridle/
bit connection, action timing, horse gait and shared knight remain unchanged.
Fresh pre/post live Art Lab captures retain approved `knight`, `bear` and
`seated-merchant` anchors. The rear six-pose board shows the ears and poll lower
at full duck, with intact squared armour, broad horse planes and original
material colours. No character redesign or new all-angle approval is implied.
Evidence uses the `mounted-v59-` output prefix; v58 evidence is preserved.
The shoulder review/audit scripts now accept `KR_DUCK_REVIEW_VERSION` for these
separate outputs, retaining the pre-v58 model only as the clipping regression
fixture. The drop sanity ceiling is six horse units for the requested stronger
angle; exact non-duck, unaffected-coordinate and recovery checks remain strict.
Final checks pass: 36/36 non-duck RGBA states unchanged, all four gaits recover
exactly without accumulated deformation, eight shoulder samples intact, actual
ArrowDown duck and return to running pass, normal startup unchanged, page
errors zero. The maximum head-vertex drop is 4.76–4.85 units across the gaits.
Fresh desktop/390px game captures and the live-reference comparison were
visually inspected. Art Lab technical audit again passes with zero warnings.

## v60 — sword elbow/shoulder depth overlap (2026-10-01)

The user identified a rear-view sword elbow painting over its shoulder cap.
The sword pose now opts into depth-tested cap occlusion in the shared Jonathan
renderer. Upper arm, elbow and forearm fragments are clipped only where the
posed shoulder surface is nearer. A forearm genuinely in front remains visible;
the cap is not repainted indiscriminately over the whole arm. Shoulder depth
uses the posed root instead of the static root while this option is active.
Sword path, IK, phase timing, equipment and the v59 neck duck are unchanged.

The art skill kept this a shared-model layering correction, preserving square
helmet/plume, separate compact joint masses and cool steel material planes.
Fresh pre/post live Art Lab anchors are `knight`, `bear`, `seated-merchant`.
The final `mounted-v60-reference-comparison.png` and native desktop/390px Lab
captures were visually inspected, alongside the 30-pose rear board. The elbow
no longer interrupts the cap in the overlapping rear poses; the raised hand
and its weapon grip remain visible. No reference promotion or gameplay
integration is implied. Evidence and frozen before sources use `mounted-v60-`.

Final strict SwiftShader audit passes: 3,232 poses retain identical motion,
32 non-sword/duck raster states are byte-identical, and all changed pixels in
366 sword states remain within the projected shoulder caps. The five changed
rear-view differences were visually inspected. The raster harness now uses a
fresh canvas for each capture: reusing a twice-drawn canvas had produced a
spurious missing ground shadow in one baseline frame, visibly unrelated to
the knight. No tolerance was relaxed. Hardware-only AA noise is not used as
the exact-equality gate. The completed v60 model is frozen in the v61-before
snapshot so this test remains independent of the later neck correction.

## v61 — exposed neck in front of mounted shoulder caps (2026-10-01)

The user's profile screenshot shows the shoulder covering the bottom of the
exposed neck. Mounted poses now opt into a small neck silhouette exclusion on
the shoulder-cap pass. It stops at the cuirass top edge: the neck reads in front
above the chest without a dark slot cutting down through the entire shoulder.
The existing cap shape and lower attachment, arms, reins, sword motion, helmet
and material colours are unchanged. The duck's separately posed neck keeps its
existing behaviour, and shared non-mounted models do not enable this option.

Fresh approved live `knight`, `bear`, `seated-merchant` references were inspected
before and after editing. Their compact separate neck/shoulder masses informed
this layer-only correction. `mounted-v61-reference-comparison.png` and the real
desktop/390px Mounted Lab captures show the exposed neck continuous in both
profiles, without changing front/rear identity or the square steel planes.
The technical Art Lab audit passes (35 references, 13 models, zero warnings).
The dedicated audit passes 96 angle/gait/action states: all changed pixels stay
within the exposed-neck region, and all 32 duck cases remain byte-identical.
The rig also matches its frozen predecessor in 5,856 poses after excluding the
new rendering-only flag. There are no page errors. This is not a new approved
model or gameplay release.

## v62 — horse jump candidate in the Mounted Lab (2026-10-01)

User scope: add the horse's jump animation. `mounted-knight-jump.js` layers a
load, hind push, airborne collection, fore-first landing and recovery over the
existing horse rig. Body lift peaks at eight unscaled horse units; the saddle
and rider hip share that lift. The existing small hip hinge supplies a restrained
forward rider balance, with live reins, fixed stirrups and rigid back equipment.
No horse/knight geometry or material identity is replaced. Standing forelegs
retain their existing bend branch; moving forelegs retain the articulated
4/6/10 chain. Hind legs retain 6.3/6.3/8.2 bones. A late hind hoof stays airborne
until the pitched croup is low enough for its fixed chain to reach the ground.

The active movement settles at 1.42 seconds. Authoring loops close on exact gait
cycles: idle/walk 2.4 seconds, trot 1.68, gallop 1.8. The ground shadow remains
on the floor and becomes slightly smaller/lighter in flight. Active jump frames
use the existing procedural horse path rather than contaminating the bounded
rear gait cache; ordinary movement returns to its existing cache. No new atlas
or persistent pose cache is added. This is not a phone-FPS performance claim.

Fresh live Art Lab overview and isolated `knight`, `bear`, `seated-merchant`
anchors were inspected before edits and in final side-by-side colour/value
review. Their broad connected masses, smaller seated rider, compact joints,
steel planes and saturated materials remain the construction contract. Final
`mounted-v62-reference-comparison.png`, idle/gallop phase boards and actual
desktop/390px Lab views were inspected. Saddle contact, rein connections and
shoulder/neck separation remain readable through load, apex and landing.

The existing action group now includes `Jump · Zıpla`, using the same secondary
KRUI controls, selected diamond and parchment layout. Treasure current-system
and states references were inspected. Default game startup and the existing
duck-only game-test route are unchanged; jump currently belongs to this Lab.
No gameplay timing, collision/economy, baseline promotion or new art approval.

Verification: 5,472 poses across four gaits/eight views keep every checked bone
length and foot target within 1e-7. Hoof geometry stays above ground; the lowest
sampled sole is 0.067 world units, and the minimum apex sole clearance is 15.38.
Start/end boundary error is below 1.2e-13; gait-loop positional error below
4.3e-14. Eighteen old/new non-jump RGBA states are byte-identical, including
duck and sword. Repeated apex scrubbing is byte-identical. The actual posed
mesh has 2,750 faces with finite coordinates. Jump selection, reset, per-gait
scrub durations and phone hit bounds/overflow pass with zero page errors.
UI system/material/action-role audits and the Art Lab technical audit pass.

## v63 — jump as an extended fast-running stride (2026-10-01)

User correction: the jump must happen in fast running, rise from a rear kick,
land and blend back into the running animation. This supersedes v62's
standalone/multi-gait action. Normal game and duck test integration are unchanged.

Movement research: USHJA Horsemanship Quiz Challenge Study Guide, printed
page 146, describes approach, hind-limb propulsion, folded forelegs in flight,
staggered forefoot landing, and departure into the gait:
https://www.rideiea.org/wp-content/uploads/2019/11/HQC_StudyGuide_10.01.18.pdf
This supplies the sequence, not measured animation timings. The timings here
are authored around the existing 0.6-second gallop. Rear support targets retain
their exact running sweep through toe-off at .780/.846s; the feet do not park.
Front pickup leads the rear push, the rear hoof sole rotates back in the kick,
and a ballistic arc reaches its apex at 1.137s. Fore contacts rejoin the actual
gallop at 1.428/1.494s. Recovery is complete by 1.8s, with another running stride
before the 2.4s loop. The base gait clock never resets at takeoff or landing.
Jump selection switches to fast run; another gait selection exits Jump.

Art skill: fresh approved live overview plus `knight`, `bear`, and
`seated-merchant` inspected before editing. Preserve the shared squared helmet,
compact torso, broad animal volume, connected fixed-length limbs and saddle
contact. No model geometry, material or baseline edits. Fresh live references
compared beside the kick/apex/landing/rear poses in
`output/mounted-v63-reference-comparison.png`, including grayscale small views.
Front/side/rear/oblique phase boards and actual desktop/390px Lab views inspected.
The kick reads as a connected long rear extension, the hands follow the reins,
the rider balances forward, and the forefeet reach into landing without stopping
the run. No remaining visible volume, contact or material issue was identified.
This remains a candidate for user motion review, not reference approval.

`mounted-knight-running-jump-audit.cjs` (also the stable `jump-audit` entry point)
checks 19,208 poses: max bone error 1.25e-14, target error 8.4e-15, minimum sole
height .0305, minimum apex sole height 15.66, exact rear ground-sweep parity,
boundary error 1.01e-14, and loop error 3.09e-14. Dense authored-phase samples
have no positional discontinuity. Eighteen non-jump raster states stay exact;
apex rescrubbing is exact; five posed mesh phases are finite. Action/gait
selection, reset, duration, phone bounds and no-overflow checks pass with zero
page errors. Art Lab passes 35 references/13 models with no motion warnings.
UI system, button-material and action-role audits also pass; helper text is
verified at desktop and phone widths after the final copy update.

## v64 — balance from the user's TOTK jump recording (2026-10-01)

Source: `C:/Users/Altar/Desktop/ziplama.mp4`, 1920x1080, 60000/1001 fps,
12.454 seconds. The user specifically asked for the last two side-running
jumps. Reviewed the full clip as a 2-fps contact sheet, both side sequences at
10 fps (8.3–9.6s and 10.1–11.5s), and the second lift at 30 fps
(10.55–11.02s). The camera turns/moves and grass/HUD obscure some ground
contacts; these are phase observations, not world-space motion capture or
claims of exact source height/speed. No TOTK visual assets enter the renderer.

Concrete observations from both jumps: the chest rises before departure,
forearms lead forward while the lower forelegs fold back, hind legs trail
through the crest and recover later, then the forelegs reach down/forward
before the next running step. The rider does not hold one constant lean.
The former v63 tuck drew the hind feet under the belly too early, and its
foreleg IK could hide the carpus inside the chest instead of showing a fold.

The revised jump keeps the existing .6s gallop and its exact rear ground
sweep / fore landing times. Preparation begins at .62 rather than .54s;
full return is at 1.68 rather than 1.80s (active interval 1.06 vs 1.26s).
The takeoff now rises to 1.2 horse units instead of making a second deep dip.
The authored ballistic apex is 6.615 horse units (8.0703 world), down from
8 horse units. Chest lift is stronger, so pose/propulsion carry the motion
instead of extra vertical float. Flight still spans .846–1.428s to preserve
the accepted native footfall rhythm; it is an adaptation, not frame-for-frame
retiming of the source. The 2.4s Lab loop remains phase-exact.

Foreleg IK now keeps the elbow under the shoulder, a visible forward carpus,
and the cannon folded backward. The rear cannon uses the existing gallop's
Z-dependent hock rule (trailing hoof behind hock, then forward recovery), not
the old always-tucked hock. The rider follows a smaller takeoff hinge and
deeper mid-flight balance, releasing it for landing. Bone lengths, horse and
Jonathan geometry/materials, normal gait, sword and duck are unchanged.

Art gates: fresh live approved overview plus knight, bear and seated-merchant
were visually inspected before changing pose code; compact squared masses,
distinct steel/cloth planes and attached fixed-length seated limbs remain the
construction constraints. Final fresh live anchors were compared in
`output/mounted-v64-reference-comparison.png` in color and small grayscale,
plus five view-angle phase boards and actual desktop/390px Lab captures.
`output/mounted-v64-motion-comparison.png` compares four source/action phases.
The previously hidden forearm and backward rear-hock articulation were fixed
during this review. No remaining visible attachment/material/volume issue was
identified; the motion is still a candidate awaiting the user's review.

Verification: 19,208 poses, max bone error 1.07e-14, target error 8.38e-15,
minimum sole Y .0305 and sampled apex sole clearance 11.07. Exact rear support
targets, phase-exact loop, continuous authored boundaries, and explicit crest
gates for fore carpus visibility/backward cannon fold and trailing rear feet
pass. Eighteen old/new non-jump RGBA cases are exact, as is apex rescrubbing;
five mesh phases are finite. Jump/gait controls, reset, phone hit bounds and
no overflow pass with no page errors. Art Lab passes 35 references/13 models
and zero motion warnings. Syntax and diff checks pass. No UI, default game,
collision, economy, or production jump integration changes in this revision.

## v65 — planted preparation, held fore fold, complete hind landing (2026-10-01)

User identified three remaining errors in v64: hovering forefeet before the
jump, forefeet running/folding too far behind the shoulder in flight, and rear
feet missing the landing. Re-inspected `ziplama.mp4` at 20 fps from 10.25 s:
fore support precedes pickup, then the knees stay in front near the neck while
the cannon folds back. The source is a motion reference, not an asset source.

Rechecked the approved live knight, bear and seated-merchant anchors before
editing (`mounted-v65-pre-*`) and after (`mounted-v65-post-*`). Retained their
construction lessons: connected fixed-length chains, compact masses and crisp
material planes. No shared character geometry or palette changed.

Replaced the forefoot blend that leaked the native running cycle into flight
with explicit contact/pickup/hold/reach/support phases. Preparation contacts are
.620/.655 s and toe-offs .700/.735 s: both soles are flat at .685 s. The full
air pose holds each foot at shoulder-local Y -11.5, Z +2 from .900–1.120 s;
the elbow and hoof pitch follow that body frame, so there is no extra running
animation or backward foot sweep during the hold. Landing contacts are
1.328/1.394 s, followed by .180 s of support and a smooth return to gallop.

The jump-only base-gait clock now advances smoothly by .240 s during flight.
This brings hind contacts to 1.560/1.626 s instead of leaving the next native
rear support a stride away from the authored fore landing. The hind trajectory
joins the native target by its own contact; both rear soles are flat and planted
at 1.640 s. Body lift/pitch settles by 1.650 s; fore recovery ends by 1.800 s.
The 2.160 s Lab loop maps exactly to 2.400 s of base gait. Normal running, duck,
sword and all non-gallop actions keep their existing clocks and appearance.

Inspected fresh 12-phase boards from 0/90/135/180/270 degrees, the live-reference
comparison in color and small grayscale, and actual desktop/390px Lab renders.
The side views now show the planted preparation, forward held carpi, and separate
rear landing contacts. Joint attachment and approved material identity remain
intact. This is a candidate for user review, not newly approved reference art.

Validation: `mounted-knight-running-jump-audit.cjs` passed 19,208 poses; maximum
bone error 1.07e-14, target error 9.59e-15, minimum sole clearance .0305, exact
rear takeoff support parity, loop error 9.61e-14. Added explicit preparation,
both fore landing and both hind landing gates (sole clearance .0854), plus dense
body-local airborne hold checks (max error 7.11e-15). All authored boundaries
are continuous at a 1e-7 s probe. 18 unrelated-action RGB comparisons and repeat
scrubbing are exact; mesh/phone/control checks passed without page errors.
Art Lab audit passed 35 references / 13 models / zero motion warnings.
Evidence: `output/mounted-v65-running-jump-audit.json`,
`output/mounted-v65-running-jump-90.png`,
`output/mounted-v65-reference-comparison.png`, and desktop/phone captures.

## v66 — quiet airborne body and uninterrupted rotation (2026-10-01)

User requested removal of airborne wobble and a more fluid jump. The source
was the running chest/hip heave, lumbar flex, head nod and shoulder offsets
continuing beneath the jump while the accelerated recovery clock ran. The
authored flight pitch also eased to a stop at several intermediate keys.

Added an opt-in `gaitBodyWeight` to the mounted rig. Jump eases that weight
from 1 to 0 over .720–.846 s, holds it at zero until fore landing at 1.328 s,
then restores it smoothly by 1.560 s. The footfall clock is untouched. Chest,
hip, pelvis, neck, shoulder sockets and hand lag share the quiet body frame;
the renderer suppresses the tail's stride oscillation with the same envelope.
Authored tail carriage and leg recovery still follow the jump.

Replaced the multiple flight-pitch keys with one quintic sweep from -.35 at
takeoff to +.13 at landing, followed by one recovery to zero at 1.650 s. The
ballistic height, foreleg hold, preparation contacts, all four landing contacts,
and 2.160 s loop remain as in v65. No model geometry or palette changed.

Fresh live Art Lab overview and isolated knight/bear/seated-merchant anchors
were inspected before editing (`mounted-v66-pre-*`); compact connected masses,
fixed bones and crisp material planes remain the construction constraints.
Fresh final reference comparison was inspected in color and small grayscale,
with side/rear/quarter phase boards and desktop/390px actual Lab captures.
No new visible joint separation, clipping or material change was found.

19,208-pose audit passes, including previous preparation/fore/hind contact
gates. Added dense flight-stability assertions: base-seat range 7.11e-15,
zero residual body pitch, lumbar flex, cyclic head nod or shoulder offsets;
height changes direction exactly once and flight pitch is monotonic. All
1,936 default idle/walk/trot/gallop rig samples match the pre-edit rig exactly.
18 unrelated-action RGB comparisons and repeat scrubbing are exact; no page
errors or nonfinite mesh vertices. Art Lab passes 35 refs / 13 models with
zero motion warnings. Visual approval remains with the user.
Evidence: `output/mounted-v66-running-jump-audit.json`,
`output/mounted-v66-reference-comparison.png`, five phase boards and
`output/mounted-v66-{desktop,phone}.png`.

## v93 — show the bash hinge from behind (2026-10-02)

User reported that forward lean was invisible from the rear. The cause was a
projection mismatch: v92 had physical arm/prop pitch but supplied the native
body only a screen-space roll, which becomes zero at 180 degrees. Its helmet
and back equipment therefore retained their upright projections.

Bash now uses the existing native articulated body/head contract already used
by the mounted duck: projected shoulder/neck positions, a rigid helmet basis,
and the opt-in pitched equipment shader. It does not invoke the duck animation
or alter the horse. Neck/helmet arm masks and the held-shield depth pass now
follow that same projection, including the plume and back equipment. All new
projection branches are bash-only; shared Jonathan source/geometry is untouched.

The 0.40-radian hinge, timing, all arm coordinates and every shield vertex are
unchanged from v92. `mounted-knight-shield-pitch-review.cjs` checks 2,576 samples:
arm error 0, shield vertex error 0, parry native-pose differences 0. The rear
screen roll remains correctly zero, but helmet depth now contributes 1.694
units of vertical projection and equipment receives the actual 0.40 pitch.
Before/after captures at 180/135/90/270 degrees document the render correction.

Inspected fresh live overview and isolated `knight`, `bear`, `seated-merchant`
before and after (`mounted-v93-pre-*`, `post-*`). The same square helmet,
separate armour blocks and native materials remain; the rear helmet planes and
back assembly now turn with the torso. Visually reviewed all four cardinal
action boards, rear/quarter before-after comparisons and desktop/phone road
captures. No additional mismatch was apparent in the reviewed poses. The pose
remains a candidate for user review, not automatically approved by these tests.

Full shield audit: 7,744 samples pass, no helmet/torso vertex contacts, unchanged
horse/legs/grip and valid joins. All 40 warmed raster endpoint/repeat/hidden
checks remain exact; the separate cold control remains recorded. Continuous
strike audit and syntax/whitespace checks pass. Art Lab passes 35 references,
13 models and zero warnings. No input bindings, production model files,
reference baselines, formal memory store, commits or pushes changed.

## v92 — heavy, upright bash inspired by the native clip (2026-10-02)

User rejected v91's light-looking shove, requested one hard strike with an
upright shield and forward body lean, then explicitly requested inspiration
from the old animation. Captured the actual `shieldBashPoseAt` /
`drawSerJonathanRider` clip afresh (`mounted-v92-native-bash.png`) and inspected
its transfer, face turn, raised strike and slower return; read
`sampleShieldTransfer` and the native bash arm/plate path. This is choreography
inspiration, not a replacement of Jonathan's shared geometry or an exact copy
of the old 2D coordinates.

The new hit keeps the elbow bent behind the shield, holds its vertical axis
upright and presents its broad face forward with an inward yaw for clearance.
Contact is at 1.10 pose seconds (0.88 actual seconds at the retained 1.25x rate).
The body loads slightly backward during the draw, then pitches forward 0.40 rad
(about 23 degrees) late in the drive. The strike runs through without a guard
stop; recovery is slower. Total duration remains 2.208 seconds. A small
outward/forward clearance arc disappears at contact. Early experimental low
contact poses were discarded after the user's native-animation direction.

Impact is constrained from two fixed bones and the existing strap axis; the
plate is not independently detached from the forearm. Hand advance over the
last portion is 6.428 world units. Hand speed rises from 18.123 at the former
ready marker to 103.575 near contact, while contact itself brakes continuously.
The shield frame's up axis is world-up at impact. Its inward yaw is intentional;
it is not claimed to be a mathematically zero-yaw frontal plate.

Both reference gates used fresh live overview and isolated `knight`, `bear`,
`seated-merchant` captures (`mounted-v92-pre-*`, `post-*`). Comparison preserved
the square helmet, blue plume, compact torso, separate rigid limb blocks and
cool steel materials. Reviewed front/rear/both profile action boards, native
bash reference, and actual desktop/phone road-scene contact captures. The
upright raised shield stays readable beside the helmet; intermediate rim/head
collisions found during development were fixed before handoff. Visual approval
remains with the user.

Checks: 7,744 pose samples pass, maximum arm-bone error 7.994e-15, no sampled
helmet/torso contacts, exact grip and unchanged rider legs/horse. Grip-loop axis
error is 2.22e-16; bash frame step is 0.05054 rad at 240 samples/second.
All 40 warmed raster comparisons remain exact. Parry arm poses match the prior
version exactly across 401 samples; hold/release/tap/keyboard/blur/cancel/touch
input checks pass. Art Lab: 35 references, 13 models, no warnings. Syntax and
scoped whitespace checks pass. No normal game bindings, reference baselines,
formal memory store, commits or pushes changed.

## v91 — continuous bash and profile arm occlusion (2026-10-02)

User requested the proposed uninterrupted bash and reported the shield arm
overpainting the body in profile. Bash now starts its forward drive while the
shield is still coming around from the back, without settling into parry's guard.
The final drive accelerates into contact, with shoulder/body follow-through,
then a short recoil blending directly into the return. Contact, hold and retreat
all meet at pose time 1.22; there is no impact hold interval. The existing 1.25x
playback rate and 2.208-second full duration remain.

The existing depth-clipped neck/helmet masks previously ran only for sword
actions. They now also cover shield actions, restoring only native body surfaces
in front of genuinely far-arm fragments. Profile 90-degree comparisons at 1.70
and 1.84 show the reported forearm-over-helmet defect removed; the opposite
270-degree near arm retains its foreground visibility. Shared Jonathan geometry,
arm lengths, materials, horse and production game bindings are unchanged.

Reference gates: inspected fresh live Art Lab overview and isolated `knight`,
`bear`, `seated-merchant` before the change and again for final comparison
(`mounted-v91-pre-*` / `post-*`). Square helmet, distinct elbow/shoulder blocks,
cool armour planes and compact body mass remain consistent with these anchors.
Inspected the continuous action boards at 0/90/180/270 degrees, both profile
layer comparisons, desktop/phone Lab hold views and actual road-scene bash/parry
captures. No remaining layering mismatch was apparent in the reviewed frames.
This remains a local animation candidate, not new user approval.

Verification: 7,744 shield poses pass fixed-length/reach/contact checks; 40 warm
raster endpoint/repeat/hidden comparisons are exact (the separate cold-native
control remains recorded, not treated as a pose regression). The former ready
point now has hand speed 11.976 and forward speed 10.152 rig units/pose-second;
late strike speed reaches 25.789. A 401-sample comparison confirms parry arm poses
are unchanged (maximum error 0). Grip and return-path checks pass, including
zero return-orientation reversals. Desktop hold/outside release, short tap,
keyboard, blur, action cancellation and mobile touch checks pass without page
errors. Art Lab passes with 35 references, 13 models and zero warnings. Browser
phone-size checks are not physical-device performance measurements.

Evidence: `output/mounted-v91-*`; the new
`labs/mounted-knight-shield-continuous-review.cjs` checks continuous drive and
records profile-mask comparisons. No reference baselines, normal gameplay,
formal memory store, commits or pushes were changed by this pass.

## v90 — faster shields, held parry and shared bash guard (2026-10-02)

User liked v89 and requested slightly faster motion, press/hold to bring the
shield forward, release to parry, and bash starting from the same front guard.
This is the local Mounted Knight Lab control/animation candidate; the main
game's combat inputs and damage/timing rules have not been rebound.

Shield playback now runs at 1.25x before the existing speed slider. Authored
pose time is unchanged for exact scrubbing/regression checks; the hint explains
this distinction. Bash takes 2.208 real seconds at slider 1x. Interactive parry
reaches guard in 0.992s, holds indefinitely while pressed, and takes 1.416s from
release to rest. Early release queues the strike after the draw reaches guard,
without teleporting to a pose. The completed interactive clip stops at rest.

`mounted-knight-shield-input.js` supplies the small prepare/hold/release/done
controller. Mouse/touch pointer capture handles release outside the button;
Space/Enter on the focused Parry button also work. Repeat keydown cannot restart
it. Lost capture/cancel, window blur and hidden tabs release a pending hold;
manual action/time/playback changes clear it. Assistive click is a short tap.
The UI keeps existing brown/parchment materials, selected-state treatment and
hit rectangles; only the explanatory hint and input behavior changed.

Bash now shares the parry wrist guard (3.2, 10.6, 6.4), then strikes forward
to (3.2, 11.3, 9.4): 3 units forward, no sideways displacement, a small rise.
Its original return path remains. The user-liked parry pose geometry and v89
single-direction return orientation are unchanged. Fixed bones, native shield
geometry/materials and approved model construction remain intact.

Verification: deterministic controller hold/early-release/end tests and real
browser desktop hold, outside release, short tap, keyboard, blur, action-change
and mobile touch cases pass. Guard equality and forward bash displacement are
asserted. Full shield audit passes 7,744 poses, no sampled torso/helmet contacts;
horse/legs, palm attachment and endpoints are unchanged. Grip/joint and v89
return-monotonicity checks pass, as do 40 warmed raster cases (cold control 720
recorded separately). Art Lab passes 35 references/13 models, no warnings.
UI button-material audit passes. General UI-system and UI-action-role audits
cannot finish: both encounter the unrelated Road Lab `startRoadLabCase` null
`nodes` error; those game files were not changed for this request. Scoped syntax
and whitespace checks pass.

Visual gates: freshly inspected live overview plus `knight`, `bear`, and
`seated-merchant` before and after; preserved squared joints, seated proportions,
clear hand/strap contact and armour values. Inspected Treasure current-system
and states references. Reviewed bash rear/profile phases and close-up inner/
outer faces, desktop/phone held guard, and actual-world bash/parry previews.
Evidence is `output/mounted-v90-*`, including input-audit JSON and touch/desktop
hold screenshots. New motion/control behavior remains for user review.

## v89 — remove the return-orientation wobble (2026-10-02)

User supplied a rear-view image showing an unwanted shield angle change while
remounting. The previous recovery frame followed the changing forearm until
2.35s, then blended rapidly toward the mounted frame around 2.4–2.55s. This
made the plate turn away from its destination before turning back. Measured
total angular travel was 2.2886 radians for endpoints only 0.4054 radians apart.

Parry recovery now retains the finish's carried orientation and blends once
toward the mounted frame over the same eased return. The loop releases with
that return instead of pulling the plate along with the folding elbow; palm
contact stays exact. The original fixed-bone solver is shared with the finish
frame calculation. Guard, strike, high finish, wrist path, duration and bash
are unchanged. No geometry, materials, UI styling or production binding changed.

The dedicated 240Hz return check now reports zero angular reversal, 0.4057
radians total travel and a maximum frame increment of 0.00352 radians (previous
0.04990). It asserts monotonic approach to the mount and near-shortest angular
travel, and captures eight return moments at rear, quarter and shield-side
views. The full 7,744-pose audit passes with no sampled helmet/torso contacts,
fixed arm lengths, exact palm contact, unchanged legs/horse and rest endpoints.
Grip/loop alignment remains exact while fully threaded; forty warmed raster
cases remain exact. Art Lab passes 35 references/13 models, no motion warnings.
Syntax and scoped whitespace checks pass.

Art gates: inspected freshly rendered live overview and isolated `knight`,
`bear`, `seated-merchant` before and after. Their compact block construction,
clear elbow/hand masses and cool armour planes remain intact. Reviewed close-up
return boards and the inner strap side, then the exact 2.4s recovery in desktop
and phone Lab/world previews. The plate no longer briefly turns edge-on during
the return; final mounting still preserves the original equipment silhouette.
Evidence: `output/mounted-v89-*`, including the `before-return-*` comparison,
return-review JSON/boards, fresh references and full shield audit/raster reports.
Visual acceptance remains with the user.

## v88 — slightly left guard and direct back remount (2026-10-02)

User direction: the shield was too centred in front; hold it slightly left like
before so it reads from behind, then put it directly on the back after parry.
The guard wrist is now (3.2, 10.6, 6.4), with rendered plate centre X=4.3563
and inward normal Z=-0.8819. Its inner face clears the left helmet silhouette
in the rear view. The existing higher, fully extended parry finish is retained.

Recovery now goes directly from that finish to the back anchor along one eased
cubic, with no forward guard reload. It starts at 2.00s and remounts at 2.90s;
the empty hand settles by 3.26s. Bash remains 2.76s. A first tighter return path
produced torso contact at 2.46–2.48s; moving its second control point outward
to (9, 7.5, -7) removed those sampled contacts without changing bone lengths.
The Lab duration/hint match. No gameplay binding or shield geometry changed.

Art gates: freshly inspected the live overview and isolated `knight`, `bear`,
and `seated-merchant` before and after editing. Preserved the approved squared
joint blocks, compact seated torso and cool armour material planes. Reviewed
front/rear/profile/quarter phase boards, the small rear guard/finish comparison,
and desktop/phone Lab and actual-world previews. The guard reads beside the
helmet, and the final return no longer revisits the chest-facing guard.

Verification: 7,744 pose samples pass, bone error <=7.99e-15, reach error
<=3.58e-15, no sampled shield-vertex torso/helmet contacts, unchanged horse,
rider legs, grip and endpoints. The 240Hz grip/joint audit passes: loop-axis
error <=2.23e-16, full-extension error <=1.78e-15, maximum elbow step 0.2392,
maximum frame step 0.1022, finish rise 3.6703. Direct recovery is separately
asserted to remain behind Z=2 (the guard is at Z=6.4). Forty warmed raster
rest/repeat/hidden cases remain exact; the pre-existing cold control difference
is recorded separately. Art Lab passes 35 references/13 models with no motion
warnings. Evidence is in `output/mounted-v88-*`; visual acceptance remains
with the user.

## v87 — centred defensive guard, higher parry and smoother transfer (2026-10-02)

User direction: v86 is better, but hold the shield directly in front during
parry preparation, restore the old higher parry silhouette, and improve the
arm joints while taking/replacing the shield. This is a scoped Lab animation
revision, not approval/promotion of a new shared character reference.

The guard wrist is now (-0.86, 10.6, 5.25) relative to the seat, with the plate
centred over the chest and its outside facing forward. The rendered shield
bounds centre is X=0.254; its inward normal Z=-0.9973. The parry follows one
up/forward directional curve, extends the original 5 / 5.1 bones, then opens
left into the higher finish. Follow-through wrist rise above the shoulder is
3.67, versus roughly 1.3 before, while full extension remains exact.

Replaced the stopped side-clear/forward-transfer segments with one eased cubic
path. The elbow has an outward/downward guide, and the empty hand reaches
around the lower side before gripping behind the back. Parry transfer lasts
0.88s in each direction; its 0.25s guard hold remains. The full parry Lab clip
is 3.69s; bash remains 2.76s and shares the improved reach/transfer rig. The
Lab duration and its numeric hint agree. No UI styling or gameplay bindings
changed; shield geometry/materials are unchanged from v86.

Intermediate trials exposed two issues that were fixed before handoff: using
one angular frame across the central guard caused the elbow/shield to wind
around at the chest crossing, and the initially narrower path let inner straps
clip the torso. The final held-arm guide has no such orbit, the draw clears
the body continuously, and recovery includes a small forward clearance arc
to avoid the helmet. No bone scaling or protected-baseline changes were used.

Art gates: freshly inspected the live overview plus `knight`, `bear`, and
`seated-merchant` before and after the edit. Retained the squared shoulder,
elbow/gauntlet blocks, cool armour planes, compact torso and seated construction.
Fresh native parry renders informed the higher silhouette. Reviewed sixteen
close-up moments from front, rear, profile and quarter views, the native/new
comparison, and actual desktop/390px world previews through a disposable test
browser override. The centred guard covers the front torso; the higher finish
retains visible straight-arm support and the two inner straps.

Verification: 7,744 shield samples, bone error <=7.11e-15, reach error
<=3.98e-15; horse/rider legs and rest endpoints unchanged, zero 10ms sampled
shield-vertex contacts with torso/helmet volumes. The 240Hz joint/frame audit
passes; maximum empty-reach elbow step is 0.2391 (v86: 0.2590), maximum whole
clip elbow step is 0.2392 (v86: 0.6116), loop-axis error <=3.34e-16, and full
follow extension error is zero. Forty warmed raster rest/repeat/hidden cases
remain exact; the pre-existing 720-channel cold native control is recorded
separately. Art Lab passes 35 references/13 models with zero motion warnings.
Syntax and scoped whitespace checks pass.

Evidence: `output/mounted-v87-{pre,post}-*.png`,
`mounted-v87-grip-{0,90,180,225}.png`, `mounted-v87-guard-and-parry.png`,
`mounted-v87-parry-comparison.png`, native parry board, phase/clearance boards,
desktop/phone Lab and actual-world captures, and `mounted-v87-{grip-review,
shield-audit,shield-raster,shield-final}.json`. Visual acceptance remains with
the user.

## v86 — repair rejected shield grip, elbow path and parry extension (2026-10-02)

The user rejected v85: elbow spasms on reaching back, an incorrect grip outside
the inner belts, an inward shield turn, and a bent parry follow-through. Its
passing technical checks did not establish correct anatomy or choreography.
v85 is superseded, not an approved reference.

Rebuilt the shield-arm attachment in the Lab module. The palm uses one native
inner strap and the forearm passes beneath the other; the loop-to-palm axis is
constrained to the elbow-to-hand axis after threading. Independent time-driven
shield yaw is removed. The plate clears the side before forward travel, and
the return reverses that threading route. Fixed 5 / 5.1 bones now fully extend
in parry follow-through. Empty-hand reach is 0.36s instead of 0.18s. Bash lasts
2.76s and parry 3.34s; the Lab timeline was updated accordingly.

The empty-hand elbow plane uses a stable Z-reference angular construction.
The first repair trial still used a near-vertical singular basis: a 240Hz scan
caught 1.60-unit elbow jumps during reach despite valid bone lengths. The final
reach maximum is 0.259 units per 1/240s, with no pole flips. Final whole-clip
maxima are 0.612 units for elbow movement and 0.0742 radians for shield-frame
movement per sample; these are continuity diagnostics, not aesthetic approval.

Kept the approved plate, rim, crest and metal bracing unchanged. Only existing
inner leather loops gain depth clearance, with the palm strap ends returned to
their plate anchors. This fits the unchanged arm/gauntlet under the belts and
keeps the fist behind the outside face. No shared approved asset or protected
baseline was overwritten. No production combat/input bindings were added.

Fresh pre/post live Art Lab gates used `knight`, `bear`, `seated-merchant` and
the overview. Their squared armour/joints, compact massing and material planes
were preserved. Fresh native `parryShieldPoseForClip` renders were compared
with the new exterior/interior follow-through; close-up 0/90/180/225-degree
reach, threading, guard, strike and return frames were inspected. An earlier
threading trial visibly cut the arm across the crest; moving threading ahead
of forward travel fixed that overlap. Final actual desktop/390px world
previews were inspected through a disposable test-browser pose override only.

Checks: 7,744 shield poses across four gaits/eight angles; fixed-bone/reach
errors below 8e-15; unchanged horse/rider legs, exact rest endpoints and zero
helmet/torso vertex contacts. 240Hz loop-axis error <=2.23e-16; parry extension
error <=1.78e-15. Forty warmed raster rest/repeat/hidden cases are exact (the
existing 720-channel cold native control is separately recorded). Existing
sword quick audit passes. Art Lab passes 35 references / 13 models with no
motion warnings. Syntax and diff-whitespace checks pass.

Evidence: `output/mounted-v86-{pre,post}-*.png`,
`mounted-v86-grip-{0,90,180,225}.png`, `mounted-v86-parry-comparison.png`,
`mounted-v86-native-parry-close.png`, shield phase/clearance boards,
Lab and actual-world desktop/phone previews, `mounted-v86-grip-review.json`,
`mounted-v86-shield-{audit,raster,final}.json`. Candidate awaits user review.

## v85 — mounted shield bash and parry candidates (2026-10-02)

Added `bash` and `parry` to the existing Mounted Knight Lab action choices and
file-safe bridge. This is animation authoring only: no combat timing, input,
damage, production loader or boss binding changed. Bash lasts 2.46s; parry lasts
2.43s with the Lab's explicit 0.25s guard hold. Captured the live native
`shieldBashPoseAt` / `parryShieldPoseForClip` sequences before adapting them to
the rotating mounted rig: take the back-mounted shield, clear the shoulder,
turn the face forward, thrust or deflect, remount, then release to the reins.

`mounted-knight-shield.js` reuses every approved shield mesh face/material at
unchanged scale. The actual raised inner handle is the rigid grip anchor.
The anatomical left arm uses fixed 5 / 5.1 bones; the other hand stays on its
rein. A shared action-depth pass handles the held plate against the native
rider, horse and other equipment. The shield's static gear pass is removed
only during its transfer, with an eased ownership handoff during empty-hand
reach/release. The cached horse simply omits the released left rein. Shield
geometry, armour, head, horse gait, seat and mounted legs were not redesigned.

The initial straight ready-to-forward path intersected the helmet in intermediate
poses despite clean endpoints. Replaced it with an outside/forward arc, keeping
the contact pose and timing intact. A 10ms mesh-vertex scan against the helmet
and torso volumes now reports zero intersections. Close-up 135/270-degree
in-between boards were inspected after the repair, along with front/rear/profile/
225-degree phase boards. Native foreground/background overlap remains readable;
the same plate exposes its inner straps in guard and outer crest in follow-through.

Verification: 7,744 angle/gait/action/time samples; arm-length error <=7.11e-15,
grip separation zero, target reach error <=1.99e-15, rigid-shield distance error
<=2.67e-15. Horse/rider leg deltas and start/end pose deltas are exactly zero.
All phase joins are continuous. Forty warmed software-raster checks (rest,
repeat scrub, hidden shield; five angles x two actions) are byte-exact. A separate
cold `none` control records a 720-channel first-frontal-draw cache difference;
it also occurs without either new action and is not counted as action parity.
Existing sword audit passes 928 poses and its raster checks. Art Lab passes
35 references / 13 models with zero motion warnings and no page errors.

Art gates: fresh approved live overview plus `knight`, `bear`, `seated-merchant`
were inspected before and again beside final candidate renders. They constrained
the square helmet, compact torso, block joints, seated contact and cool armour
planes. Actual desktop/390px phone world previews used a disposable test-browser
pose override, not new gameplay bindings. UI uses existing KRUI secondary +
selected controls, 46px targets and unchanged parchment styling; desktop/phone
layouts and Treasure system/states references were inspected. UI material audit
passes. Broader UI system/action-role audits stop in unrelated `startRoadLabCase`
initialization (`null.nodes`, KnightRush.html:53916); those checks are not claimed
as passing, and no road/gameplay fix was made in this animation task.

Evidence: `output/mounted-v85-{pre,post}-*.png`, native bash/parry and UI
reference boards, `mounted-v85-{bash,parry}-{0,90,180,225}.png`, both clearance
boards, desktop/phone Lab and world previews, `mounted-v85-shield-audit.json`,
`mounted-v85-shield-{raster,final}.json`, `output/art-lab/report.json`.
These are candidates for user review, not promoted reference baselines.

## v84 — preserve separate rein roles in diagonal views (2026-10-02)

Fixed the confirmed 135/225-degree hand classification error. Absolute projected
hand X included forward reach, so both hands could be treated as the same side.
Guidance now uses each arm's anatomical `side` times the yaw cosine. The pulling
and supporting roles remain separate at diagonal angles and fade continuously
through profile; the exact rear-view cue is unchanged. No head/body timing,
horse gait, mounted leg geometry, lane motion or collision change was needed.

Extended the steering audit first: the old implementation failed at 135 degrees
with both hand Y offsets equal to -0.042. After the fix, all 30 angle/action/
direction cases pass (135/176/180/184/225 degrees, gallop/duck/jump, both signs).
At 135/225 degrees the offsets are +0.089095 and -0.029698, swapping by input.
Profile continuity across 0.002 degrees is within 0.0000227 rig units; maximum
fixed-arm bone error is 7.11e-15. Horse and rider legs are exactly unchanged;
jump-entry arm discontinuity is zero. The 30/60/120 FPS corner regression also
passes. Art Lab: 35 references, 13 models, zero motion warnings or page errors.

Art skill gates used fresh live approved overview and isolated `knight`, `bear`
and `seated-merchant` before editing and again during final comparison. Preserved
the square helmet, compact torso, cool steel planes, seated contacts and distinct
shoulder/elbow/hand blocks. Inspected all three nine-pose 135/180/225-degree boards
and actual desktop-left/phone-right scenes: small rein cues retain connected
arms and existing equipment overlap, without a new material or silhouette change.
Visual acceptance remains with the user; no baseline was promoted.

Evidence: `output/mounted-v84-{pre,post}-*.png`,
`output/mounted-v84-steering-{135,180,225}.png`,
`output/mounted-v84-steering-audit.json`, `output/mounted-v84-{desktop,phone}-*.png`,
rerun `output/mounted-v83-corner-audit.json`, and `output/art-lab/report.json`.

## v83 — rebuilt lane change around subtle rein guidance (2026-10-02)

User rejected the previous steering choreography and requested a fresh, gentle
direction cue that fits the existing animations. Replaced the added forward
chest fold with a rein-led pose: the guiding grip moves slightly outward/back
and upward; the supporting grip follows with a smaller lateral shift and release.
Fixed-length arm IK keeps both shoulders and elbows connected. Small lateral
balance peaks near two degrees in ordinary lane travel; the head shares part
of that balance and looks a little into the requested direction around its neck.
Existing duck/jump posture composes underneath this guidance without an extra
forward hinge. The seat, stirrups, horse gait and collision trajectory are intact.

The input cue is 140ms with continuous spring position/velocity on reversal;
ordinary guidance peaks around 150–167ms and settles smoothly. Lane-relative
view offset is two degrees rather than four; transient horse heading is limited
to 2.6 degrees and bank to 1.5 degrees, reaching about .71 degrees in the tested
lane transition. The existing authored Journey-corner envelope is retained.

Fresh approved live Art Lab overview and isolated `knight`, `bear` and
`seated-merchant` anchors were inspected before. Their square helmet, compact
material planes, connected shoulders/elbows and planted seated pose guided this
pass. Reopened those same live anchors during final comparison. Inspected the
new nine-pose gallop/duck/jump board, rear/135-degree diagonal board, both
six-frame input sequences, desktop left and phone right at 180ms, and both
Journey-corner sequences. The small hand/head motion reads without visible
neck gaps, detached gear or changed material identity in these views. Aesthetic
acceptance remains with the user.

Evidence: `output/mounted-v83-{pre,post}-*.png`,
`output/mounted-v83-steering-board.png`, `output/mounted-v83-diagonal-board.png`,
`output/mounted-v83-input-sequence.png`, `output/mounted-v83-corner-board.png`,
and the corresponding input-lead/steering/corner/lane-change/lane-tempo reports.
At 30/60/120 FPS both lane directions preserve the exact lateral trajectory,
zero input/reversal discontinuity and zero jump-entry arm/angle/bank change.
Thirty head cases preserve neck contact below 1e-10 error. Fixed-bone error
<=7.11e-15; horse and rider legs are unchanged. Repeated jump and touch controls
pass; gait tempo, .78s jump and .42s duck timings pass. Existing cache sizes are
unchanged. Art Lab passes 35 references / 13 models with zero motion warnings.
Runtime syntax checks pass. No protected renderer or reference baseline changed.

## v82 — head accompanies the shoulders during guidance (2026-10-02)

User requested some head movement because v81 read too strongly as shoulder-only.
The helmet now shares 65% of the lateral upper-body roll, around the attached
neck (about four degrees in a normal lane cue). It retains the existing action
pitch rather than adding a deep nod. Chest pitch, spring timing, horse motion,
grips and gameplay are unchanged. The camera-plane rotation preserves head
volume/depth and fixes the neck pivot instead of rotating around the helmet centre.

Fresh live Art Lab overview and knight/bear/seated anchors were inspected before
and the same three isolated anchors again after. Their square helmet, compact
planes and connected joints guided preservation of the existing rig. Inspected
the refreshed nine-pose action board, both six-frame input sequences, desktop
left and phone right at 180ms. The helmet visibly tilts with guidance without
detaching from the neck; armour, plume, gear and colour separation remain intact.
Evidence: `output/mounted-v82-input-sequence.png`, v82 pre/post reference and
desktop/phone captures, and `output/mounted-v82-input-lead-audit.json`.

Input-response and steering audits pass: thirty head cases verify the intended
partial rotation and neck attachment below 1e-10 error across five angles, three
actions and both directions. Duck amounts remain unchanged, jump-entry arm error
is zero, fixed-bone error <=6.22e-15, and horse/rider legs are unchanged. Syntax
checks pass. Art Lab passes 35 references / 13 models with zero motion warnings.
Motion feel remains subject to user review; no baselines changed.

## v81 — independent guidance pose, level head and gentle chest lean (2026-10-02)

User accepted trying a dedicated steering pose after v80 read as a head motion.
Steering no longer reuses the duck action. The shoulders/chest hinge forward by
at most eight degrees while retaining the lateral weight shift and directional
rein guidance. The head translates with the neck but preserves its pre-steering
orientation; duck/jump still supply their own underlying head pose. Equipment
and arm occlusion follow the composed upper-body pose. Horse neck/reins no longer
receive a synthetic duck amount; gameplay duck and collision state are unchanged.

The input lead now uses an exact critically damped spring with a 180ms cue and
slower recovery. Both position and velocity survive direction reversals. Peak
forward lean occurs around 183ms at 60/120 FPS and 200ms at 30 FPS. No delay was
added to lane travel or the horse response. Exit/reset also clears rider velocity.

Fresh live overview and isolated knight/bear/seated references were inspected
before; the same three fresh live anchors were compared again during final review.
Square helmet/plume, cool armour planes, shoulder/arm connections and seated
contacts remain intact. Inspected nine-pose and rear-quarter boards, both input
sequences at 0/17/80/180/300/550ms, actual desktop left and phone right at 180ms.
The head stays level as the chest leans; no visible joint gaps or detached gear
were found in these views. Preferred motion feel remains pending user review.
Evidence includes `output/mounted-v81-input-sequence.png`, v81 desktop/phone and
pre/post reference captures, and `output/mounted-v81-input-lead-audit.json`.

Input/reversal pose and velocity discontinuities are zero. At 120 FPS the largest
forward-pitch step is .01392 radians; rider response settles below .00016 after
one second. Thirty head/neck cases cover five rear/diagonal angles, three actions
and both directions: orientation/attachment errors stay below 1e-14, with actual
duck amounts unchanged. Steering, corner, lane, repeat-jump and touch checks pass;
fixed-bone error is <=6.22e-15, horse/rider legs and jump-entry arms are unchanged.
Art Lab passes 35 references / 13 models with zero motion warnings. Existing
cache budgets and protected reference baselines are unchanged.

## v80 — softer onset, recovery and shallower diagonal lean (2026-10-02)

User found v79 too abrupt and too deep. Removed its instantaneous .35 steering
pose jump. Accepted input now changes a rider target, not the live pose: a 100ms
cue uses a 90ms exponential response, followed by a slower 120ms travel-following
recovery. Reversal starts from the current rider lean without a pose step.
The cue is split at its exact expiry within a frame. Horse heading/bank and
actual lane movement retain their existing timing; drawing remains pure.

Forward steering depth is capped at 55% of full duck (34.7 degrees); the normal
lane cue peaks around 30.2 degrees at 100ms, versus v79's 63 degrees at 33ms.
Gameplay duck still reaches its original full depth. Shared fixed-length limbs,
guiding grips, saddle/stirrups, horse neck, jump and collision rules are unchanged.
`resetLane` now clears the full rider/horse response state on exit or new runs.

Fresh live overview and knight/bear/seated anchors were inspected before, and
the three fresh isolated anchors again after. Square helmet/plume, cool armour
planes, shoulder connections and seated contact remain intact. The rear/quarter
board and both 0/17/50/100/250/450ms sequences were inspected, plus actual desktop
left and phone right at the peak. Equipment remains attached; user review is
still required for the preferred feel. Evidence: v80 pre/post references,
`output/mounted-v80-input-sequence.png`, desktop/phone frames and
`output/mounted-v80-input-lead-audit.json`, plus refreshed diagonal boards.

Input-response audit passes both directions at 30/60/120 FPS: zero input/reversal
pose discontinuity, positive first-update response, identical .52627-radian peak
at 100ms, zero lane-trajectory error, and near-neutral recovery. At 120 FPS the
largest pitch step is .06087 radians, below the .065 smoothness bound. An initial
70ms response exceeded that bound and was softened to 90ms before final review.
Blocked-input, render-stability and exit-reset tests pass. Steering/lanes/corners
pass; bones remain fixed (<=4.45e-15 error), horse/rider legs and jump-entry arms
remain unchanged. Syntax passes; Art Lab passes 35 references / 13 models with
zero motion warnings. No reference baselines changed.

## v79 — input-led rider anticipation and full-duck depth (2026-10-02)

User requested earlier leaning immediately on input, with the horse following,
and forward depth equal to duck. An accepted lane action now cues the rider in
the input frame (signed .35 steering), independently of the horse's existing
velocity-driven heading/bank. A 60ms exponential lead hands over to the normal
response; an opposite accepted input immediately cues the new side. Rejected
outer-lane input does not cue an animation. Exit/start resets clear the lead,
and drawing does not advance it. No delay was added to actual lane movement.

The forward hinge now reaches the complete 1.1-radian duck angle, retaining
side lean and rein guidance. Existing duck/jump blending never exceeds that
forward angle. This is visual steering only: it does not activate the gameplay
duck flag or change collision/jump rules. Horse neck, fixed bones, saddle and
stirrup poses remain intact.

Fresh live Art Lab overview and knight/bear/seated anchors were inspected
before and fresh isolated anchors after. The approved helmet/plume, cool
armour, connected shoulders and seated contact were retained. Input-frame,
17/33/50/100/250ms left/right sequence, rear/quarter extremes, and actual
desktop-left/phone-right peak frames were visually reviewed. Equipment stays
attached through the full forward fold. This requested stronger/snappier trial
still awaits the user's visual preference.

New input-lead audit passes both directions at 30/60/120 FPS: rider pitch is
.6133 radians in the input frame while horse heading/bank/position are unchanged;
full duck depth is reached at 33.3ms, with no over-fold. Lateral trajectory error
is zero, the lead settles to zero, blocked edge input stays neutral, reversal
cues the correct side, and paused render / exit-reset checks pass. Existing
steering, lane and corner audits pass; fixed-bone error <=7.11e-15 and zero
steering-to-jump entry discontinuity. Syntax checks pass. Art Lab passes 35
references / 13 models with zero warnings; reference baselines were not changed.
Evidence: `output/mounted-v79-input-lead-audit.json`,
`output/mounted-v79-input-sequence.png`, individual desktop/phone frames and
`output/mounted-v79-{pre,post}-*.png`, plus refreshed steering/corner boards.

## v78 — duck-like diagonal lean depth (2026-10-02)

User requested a clearly duck-like forward fold, slightly shallower than duck,
combined with the existing sideways lean. Steering now drives 70% of the full
hip hinge at normal peak lane response (.65), using smoothstep at both ends.
This is about 44 degrees forward versus the full duck's 63 degrees. Lateral
lean, guiding grip, fixed stirrups, horse neck and actual movement are unchanged.
An existing duck/jump posture still consumes its share of the available hinge,
so steering cannot push the combined forward fold beyond the full duck.

The art skill's live reference gates were repeated: overview and isolated
knight/bear/seated anchors before, then the same fresh isolated anchors after.
Their square helmet, cool armour planes, connected shoulders and seated contact
were retained. Current reruns of the steering/corner boards show the deeper
fold at rear/quarter views; actual desktop-left and phone-right lane captures
were inspected. Arms and back equipment remain attached, with no visible new
joint gap. User visual approval remains pending.

Steering audit passes with maximum bone error 7.99e-15, unchanged horse/rider
legs and zero steering-to-jump entry discontinuity. Corner checks pass both
directions at 30/60/120 FPS with unchanged trajectory/cache budget and upright
exit. Updated forward-pitch assertions verify the requested .77 radian peak.
JS syntax passes; Art Lab passes 35 references / 13 models, zero warnings.
Evidence: `output/mounted-v78-{pre,post}-*.png` and the refreshed existing
v76 steering / v77 diagonal-corner audit images and reports. No baselines changed.

## v77 — corner counterbalance and diagonal rider steering (2026-10-02)

Requested: animate road-corner turns, and refine lane steering into a slight
forward-left / forward-right lean rather than only sideways. The existing
hip-hinge rig now adds a small forward pitch proportional to steering strength,
combined with v76's lateral lean and guiding grip. The additive pitch tapers
against an existing duck/jump posture instead of doubling its full bend.
Pelvis, stirrup feet and horse-leg poses remain unchanged. Horse neck bending
retains its original action amount; the rider-only forward lean does not add
an unsolicited horse duck. Baseline grip chains keep cached reins attached.
Jump-entry source and target both include the forward component, preserving
the exact input-frame pose during a steering-to-jump transition.

Road corners use the existing .62s turn progress and direction. A sine-squared
envelope smoothly turns the actor toward the exit, banks the horse about 4.9
degrees and guides the rider/reins into the turn. Both ends have zero envelope
and zero slope. The camera owns the actual 90-degree world rotation; the actor
adds only a modest camera-relative heading, staying inside the rear-mesh cache
range. Existing lane response decays during the turn. No camera, route, lateral
trajectory, collision, world speed or turn-duration changes were made.

Fresh live Art Lab overview plus knight/bear/seated-merchant anchors were
inspected before the edit, then the three anchors reopened for final comparison.
The square helmet/plume, cool metal planes, block shoulders, connected arms and
seated proportions were preserved. Rear/quarter diagonal comparison, run/duck/
jump extremes, both corner phase sequences and desktop-left/phone-right world
views were visually inspected. No new joint gaps or detached gear were seen;
the forward component reads most clearly at the quarter angle. Visual approval
remains with the user. Evidence: `output/mounted-v77-{pre,post}-*.png`,
`output/mounted-v77-diagonal-board.png`, `output/mounted-v77-corner-board.png`
and the individual desktop/phone corner frames.

The new corner audit passes both directions at 30/60/120 FPS: zero input-frame
pose step, unchanged lateral path (floating-point error <=2.22e-16), centred
upright exit, stable paused rendering and unchanged cache budgets. At steering
strength .65, forward pitch is 9.83 degrees standing, reduced during duck/jump;
shoulders move forward on both sides, bones remain fixed, stirrup legs unchanged.
Existing steering, lane-change and repeat-jump/touch audits pass with zero page
errors; steering-to-jump arm discontinuity is zero. JS syntax checks pass.
Art Lab: 35 references / 13 models, zero motion warnings. No baselines changed.

## v76 — rider lean and directional rein guidance (2026-10-02)

Requested: Jonathan should lean slightly into each lane change and guide the
horse that way. The rider now has a separate hip-centred upper-body lean,
driven by v75's damped heading response, peaking around six degrees in normal
lane changes. The pelvis and stirrup feet retain their original poses. Native
helmet, shoulders and equipment follow the upper body, then settle naturally
as lateral motion ends. Jump/duck retain the continuous steering weighting.
The optional lab sword action is excluded from this reins-only adjustment.

Fixed-length arm IK moves the grips toward the requested side, with a modest
extra pull on that side's rein. Copied rein faces taper that displacement to
zero at the bridle, preserving the horse mesh cache. Duck-generated rein faces
now carry the same side metadata. The gear depth mask follows the additional
upper-body lean, keeping the native equipment and horse passes aligned.

Fresh live knight/bear/seated references were inspected before and after;
the nine-pose steering board and actual desktop-left/phone-right scenes were
visually reviewed. The approved square helmet, plume, cool armour, connected
limbs and saddle relationship remain intact. User visual approval is pending.
Evidence: `output/mounted-v76-{pre,post}-*.png`,
`output/mounted-v76-steering-board.png` and desktop/phone steering captures.

`mounted-knight-steering-audit.cjs` passes run/duck/jump in both directions:
maximum fixed-arm bone error 7.99e-15, zero horse-leg/rider-leg displacement,
exact requested native lean and zero jump-entry arm discontinuity. Lane-change
and repeated-jump/touch regressions pass; all changed JS passes syntax checks.
Art Lab passes 35 references / 13 models with zero motion warnings. No changes
to world speed, collision, lane trajectory, action timing or reference baselines.

## v75 — running lane-change steering animation (2026-10-02)

Requested: animate the horse during lane changes. Actual lateral velocity now
drives a damped heading response (55ms) and a slightly slower weight-shift
response (90ms). The shared live actor turns toward travel and banks modestly,
then returns to v74's +/-4-degree resting lane view. The gait phase keeps
advancing; no replacement pose, restarted stride or lateral gameplay delay.
Jump/duck smoothly soften steering without an input-frame angle/bank step.
Reversals start from the current state; leaving the run or starting a new one
clears it. Drawing alone cannot advance the animation.

Bank is a shared native 2.5D projection transform, not a rasterized animation
or a new limb rig. A small sole-based lift prevents the bank lowering a hoof
below its original road projection; the shadow stays level on the road.
Horse and action GPU passes now consume the complete caller affine matrix,
including their equipment depth masks, keeping them aligned with the native
Jonathan/gear pass. Existing world-space mesh caches remain usable because
total yaw stays inside their rear-view range; no new mesh cache was added.

Fresh live Art Lab knight/bear/seated-merchant references were captured and
visually inspected before and after. Square helmet/plume, broad horse mass,
fixed connected limbs, saddle/rider relationship and cool armour are retained.
Desktop phase sequence plus the actual 390px phone scene were inspected:
subtle lean, attached equipment, no new joint gaps or layering mismatch.
Evidence is `output/mounted-v75-{pre,post}-*.png`, the lane sequence board and
desktop/phone captures. This review does not replace user visual approval.

`mounted-knight-lane-change-audit.cjs` passes left/right at 30/60/120 FPS:
peak bank 1.61–1.67 degrees, transient yaw 2.34–2.45 degrees, zero change to
the original lateral-position trajectory, settled angles 176/184, continuous
reversal/jump entry, stable paused rendering, restored caller transform,
exit reset and unchanged cache budget. Repeat-jump/touch regression and JS
syntax checks pass; Art Lab passes 35 references / 13 models, zero warnings.
No world speed, collision, jump/duck timing, shape or palette changes.

## v74 — gentler lane angles and brisker road-linked cadence (2026-10-02)

User found the side-lane turns excessive and the run cadence slow against the
road. Runtime lane yaw is halved from +/-8 to +/-4 degrees (176/180/184), still
following the actual eased lane position. Visual gait tempo is 1.15x the prior
distance-linked clock: road travel / 22 * 1.15. World speed, jump/duck duration,
input timing, mesh geometry, materials and cache budgets are unchanged. This
is a scoped presentation/timing refinement, not a character redesign.

`mounted-knight-lane-tempo-audit.cjs` passes exact lane/intermediate angles,
zero/half/normal/double road-speed scaling, unchanged actual world travel,
zero jump-entry pose error, .78s jump/.42s duck, no God/playtest in normal play
and zero page errors. All three lanes were captured at 1100x920 and 390x844;
desktop left and phone right were visually inspected for the reduced turn and
preserved silhouette. Art Lab technical audit passes 35 refs / 13 models with
zero motion warnings. Evidence: `output/mounted-v74-lane-tempo-audit.json` and
`output/mounted-v74-{desktop,phone}-lane{0,1,2}.png`.

## v73 — lane yaw, arbitrary-pose entry and production running (2026-10-02)

Requested scope: subtle road-relative yaw, no forced-foot-pose jump entry,
and the new mounted actor in the normal game. The normal PLAY path now loads
`assets/mounted-runner.js`; opt-in seed/God/K/message controls remain in
`labs/mounted-knight-playtest.js`. The production module uses the shared pure
pose/render modules, not Art Lab or its UI/instrumentation. Boss, death and
non-Jonathan rendering remains on the existing path. No combat redesign.

Lane yaw follows the actual eased lateral position: 172 / 180 / 188 degrees.
The world-space horse caches are valid throughout this small yaw range, so
changing lanes does not rebuild the skin or allocate a cache per angle.

Run entry captures the actual pre-input action and continues from it. A 200ms
quintic transition blends goals and solves the fixed horse/rider bones instead
of forcing the gait clock into the clip's starting footfall in roughly 30ms.
Ground entries carry the live stride; interrupted landing entries carry the
current recovery pose/velocity, then let that old action subside. The original
standalone Lab choreography, .78s jump and apex height remain unchanged.
The renderer reuses head/tack envelopes during entry but builds the barrel,
articulated legs and tail from the solved pose. It rejoins the ordinary jump
cache at 200ms. Entry rendering is warmed at startup and shares the frame pose.

Fresh Art Lab knight/bear/seated-merchant references were inspected before and
after (`output/mounted-v73-{pre,post}-*.png`). The block helmet/blue plume, cool
armour, broad horse masses, connected legs and equipment identity are retained.
Final close-up exact/cached entry comparison and desktop/390px actual game
screens were inspected: no visible joint gaps or material/layering mismatch.
The 8-degree turns remain modest and the centre lane is directly rear-facing.
No reference baselines or approved palettes were edited; user approval remains
separate from this technical/visual review.

Verification: `mounted-knight-entry-audit.cjs` covers 60 gait phases and 21
landing poses, each at 1/1200s sampling. Input pose error is 0, epsilon-entry
error <.000007, bone error <1.1e-14, minimum sole clearance .0305, and cache-join
error <.000006 horse units. Worst regular-entry equivalent 120Hz foot step is
3.10 versus 37.43 with the old phase warp. Existing fast recovery velocity is
preserved (worst 5.30), rather than introducing a velocity reset at input.

Production audit verifies normal menu/manual PLAY, queued early PLAY, random
map/no God mode, all three yaw values at desktop and phone sizes, no playtest or
Art Lab scripts, zero input-pose discontinuity and boss/death/Squire fallback.
One desktop headless run showed first menu at 1.05s and complete preparation
at 8.20s; preparing never black-screens the menu. Entry actor draws were mostly
8.5–17.5ms (one 21ms sample), returning to 2.9–4.9ms after entry. These are CPU
wall/submission samples, not a phone FPS or GPU execution claim.
Repeat-jump/keyboard/touch/fullscreen regressions pass. Art Lab technical audit
passes 35 references / 13 sampled models with zero motion warnings.
Evidence: `output/mounted-v73-{entry,production}-audit.json`,
`output/mounted-v73-entry-comparison.png`, `output/mounted-v73-normal-*.png`.

## v71 — fullscreen demo and landing-ready repeat jumps (2026-10-01)

v72 correction (2026-10-02): User clarified that the normal menu must stay.
The wrapper auto-start code is removed; only its bottom test panel is absent.
Native menu PLAY starts the candidate, verified by a real phone-size click.
`mounted-knight-fullscreen-audit.cjs` now asserts menu-first behavior and manual
PLAY, plus full viewport, keyboard and pause checks. Repeat-jump behavior stays
unchanged; its audit explicitly starts a test run instead of relying on boot.

The wrapper's bottom menu is removed on request. It fills desktop/phone height,
waits for model readiness, starts once and focuses the game. No periodic start
command resets a paused run. Arrow keys, K and touch remain native game input;
normal-game HUD and pause UI are unchanged. UI reference checks and all three
UI audits pass; `mounted-knight-fullscreen-audit.cjs` covers automatic start,
no wrapper controls/overflow, keyboard actions and preserved pause.

A second jump no longer waits until .780s grounded recovery completes. After
fore contact at .570s, an Up input immediately starts the next jump from the
current recovery stride. One input up to .220s before contact is buffered and
consumed at contact; earlier taps are ignored, Down cancels the buffer, and
there is no midair double jump or automatic endless chain. The .480s flight,
41.1px apex, 1.10x actor scale and authored model geometry are unchanged.
`mounted-knight-repeat-jump-audit.cjs` measures chained starts at .600/.583/.575s
for 30/60/120 FPS, verifies direct recovery interrupts, cancellation, single
consumption and touch swipe input. Desktop landing/restart/apex and phone full
viewport inspected. The change is input/recovery gating, not a new character
design or a modification of the original Model Lab choreography.

## v70 — ground-linked gait, responsive actions and larger run actor (2026-10-01)

Scope: the opt-in Mounted Run Lab only. The user's follow-ups request a larger
horse/rider, then a longer and higher jump. Both models now share a 1.10x run
scale (unit 2.6367); bones, authored poses, palettes and GPU caches are unchanged.

The run gait clock integrates actual `roadScroll` travel / 22, including speed
tiers, slowdowns and turns. Zero travel stops phase advancement; phase never
resets on speed changes. Jump, duck and sword remain real-time actions. Landing
continues from the authored gait phase, adding only the leftover frame travel.

Final jump timing: takeoff .090s, authored apex .330s, fore contact .570s,
settle .780s. This supersedes the intermediate .600s jump: the last request
extends flight from .310s to .480s while preserving the quick takeoff. A smooth
5-horse-unit flight-only lift raises the body/feet together, returning to zero
with zero velocity at takeoff/contact. Apex height is about 41.1 game pixels
(the intermediate enlarged version was 31.5). Collision clearance and shadow
use the same lift. The last .120s accepts one buffered jump input for landing;
early repeated taps do not queue an unrequested chain. Down cancels that buffer.

Duck reaches its existing full pose in .100s, holds .160s, and rises in .160s.
Repeated duck input preserves current hinge depth instead of resetting upright.
The original authored Model Lab duck/jump choreography is not retimed.

Depth fix: a low `jump` branch in the player's current lane goes behind the
airborne actor in the shared native/old-Journey draw queue. `duck` arches and
very near roots retain foreground order; the tree/foliage split is untouched.
Reproduced the foreground-root issue before editing and checked the final
low-branch overlap at desktop and 390px phone size.

Fresh pre/post live Art Lab overview, knight, bear and seated-merchant references
were inspected. The new height/scale preserves the square silver helmet, blue
plume, separate shoulder masses, broad horse planes and attached seated rider;
no geometry/material redesign was introduced. Final motion and reference
comparison images are `output/mounted-v70-*.png`. Phone controls stay below the
scene; helper copy alone changed under the Treasure brown/parchment UI rules.

Checks: new ground-sync audit covers 0/.5/1/2 ground rates, frame chunking,
production update travel, monotone retiming, duck refresh, single jump buffering,
native and old-Journey obstacle queues, pointer input and normal-boot isolation.
Measured first lift .074s; actual hoof-clearance window .145–.518s. Integration
checks retain keyboard actions, all four gait caches, sword placement and boss
fallback. Art Lab and all three UI audits pass. These are technical and visual
reviews, not new art-reference approval. No normal-game rollout or new weapon
animation work is included.

## v69 — responsive run jump and pose-owned world placement (2026-10-01)

User requested faster jump response and a fresh animation-driven in-game
placement, particularly avoiding inherited jump angles. The approved Lab rig,
geometry, jump pose curves and rear mesh caches are unchanged. A new opt-in
`mounted-knight-run-motion.js` retimes that clip with monotone C1 Hermite joins:
0/.070/.105/.300/.500/.640/.760 seconds correspond to authored clip times
.50/.78/.846/1.07495/1.328/1.626/1.80. This shortens preparation and recovery
without replacing the accepted takeoff/fold/nose-down/landing poses. End rate
is 1, matching the resumed base gait. Feather still scales the whole duration.

The opt-in run now owns its complete player draw pass. It no longer delegates
to the legacy `drawPlayer`/`drawRider` placement, normalizes lift to the old
100-pixel jump, counter-translates model lift, or inherits rush/air/lean/scale
modifiers. Lane X and the existing road ground anchor remain gameplay inputs;
the new model projects its own body pitch, vertical motion and contacts at a
fixed 2.397 unit scale. Actual authored peak lift is 22.8265 game pixels, rather
than the artificial 100-pixel translation. Its shadow is derived from the posed
body footprint projected onto the ground, shrinking/fading with model lift.

Run hazard clearance now follows all four actual hoof soles (>4 horse units,
about two hoof thicknesses, and only during the jump flight phase); ordinary
gallop suspension is never treated as a safe jump. At 1x, the first >.5px rise
is .087s, authored takeoff .105s (previously .346s), apex .300s, fore landing
.500s, complete clip .760s (previously 1.30s). Measured safe window .160–.425s.
Down during flight smoothly speeds the remaining timeline instead of using
the old instantaneous jump to 82% of the duration. It does not teleport a pose.
Normal boot and boss/death/Squire paths retain their original implementations.

Live pre/post approved knight, bear and seated-merchant references were
inspected, as were the current Journey/Morning run before/after, ten run phases,
desktop and 390px views, and the fresh side-by-side reference board. Connected
limbs, cool silver/blue materials and grounded fore/hind landing are retained;
the jump no longer floats far above its own pose. The existing Treasure panel
only receives updated timing copy; no controls, materials or roles are changed.

`mounted-knight-responsive-run-audit.cjs` passes a 761-sample monotonic time/
height/sole sweep, fixed ground placement, no gallop false positives, continuous
fast-fall entry, base-gait return and pointer input. It deliberately changes old
CFG jump height/safe height to 900/800 and makes old lean throw: rendering and
new clearance are unaffected. The refreshed general run audit passes all gaits,
keyboard jump/duck/sword, placed sword compositing, pause/non-run fallbacks and
normal-boot isolation. Art Lab passes 35 refs / 13 models / zero warnings; UI
system/material/action-role audits pass. Candidate still awaits user feel review.
Evidence: `output/mounted-v69-run-audit.json`, `mounted-v69-integration-run-audit.json`,
`mounted-v69-run-phases.png`, `mounted-v69-run-phone.png`, and
`mounted-v69-reference-comparison.png`.

## v68 — bounded rear action cache and actual-run playtest (2026-10-01)

User scope: optimize the approved rear gaits/actions for the game, then try them
inside run before moving to bow/shield. No bow/shield animation is authored here.

The existing 96-sample single-gait mesh cache is retained. Jump adds a separate
193-sample Uint16 position cache covering only .50–1.80 seconds, with an indexed
material palette and interpolated live geometry. Combined typed-array storage
is 24,941,174 bytes (23.79 MiB), not counting live mesh objects or GPU targets.
There are no raster pose atlases. Gait replacement stays bounded; action GPU
programs are warmed before the test becomes interactive. Disposal clears both
mesh caches and action buffers. Non-rear views retain their procedural renderer.

The jump cache is deliberately approximate: at 2.397 game units per model unit,
96 off-grid poses / 1,003,392 vertices have mean projected error .00738 pixels;
largest non-head/rein vertex error is .7742 pixels. Hidden contact-fitted head
and rein vertices can differ more (1.19 / 4.49 pixels), so vertex distances are
not claimed as silhouette differences. Eight full-raster comparisons, including
head/reins, have mean maximum-channel error <= .061/255. An initial .25-pixel
per-vertex target failed at IK reach limits; the reviewed release criterion is
subpixel body error (<1), mean <.01, and full-raster error <.12/255. A denser
recovery-only experiment cost 6.3 MiB more without eliminating other IK cusps;
it was not retained. Raw/cached phase boards were visually compared.

Placed sword transitions now blend two transparent, actor-bounded buffers,
preserving the caller's placement, transform, alpha and clip. They cannot paint
the Lab's opaque background over the road. Sword action time is independent
from the gait clock, including its deterministic trail look-back.

`MountedRunLab.html` wraps the real `KnightRush.html?mountedplaytest=1` run in
an iframe with a separate lower test panel: start, jump, duck, sword and four
gait choices. Test start enables existing god mode. Sword is visual-only and
does not deal damage. Original keyboard/swipe controls remain; K previews the
sword. Only the opt-in run uses 1.3-second jump / 1.05-second duck timing, with
the existing feather multiplier. Jump height/collision follow the same arc;
duplicate model lift is removed from world placement. A .12-second gait-entry
offset blend prevents an arbitrary-phase start snap, using the exact procedural
mesh only while this blend is active. Landing rejoins the matching base stride.
Normal boot loads none of these Lab modules and keeps both .52-second timings.
Boss/Squire/death renderers and foreground-world painter order are untouched.

Fresh live approved knight, bear and seated-merchant anchors were inspected
before and after work (`mounted-v68-{pre,post}-*`). Compact connected joints,
cool silver/blue identity and crisp material planes remain unchanged. The new
model was inspected on the current Journey/Morning road at desktop and 390px,
including jump, duck and sword poses. The UI uses Treasure's live system/states
and shared KRUI parchment/buttons, entirely outside the gameplay viewport.

Verification: run audit passes all four gait cache switches, 30 arbitrary jump
entry phases (max error 5.6e-14), world arc/apex/landing, action keys, draw-clock
purity, eight placed sword phases (zero modified pixels outside the actor box),
canvas transform/alpha preservation, desktop/phone layout and normal-boot
isolation. 19,208-pose jump audit / 1,936 base-rig samples / 18 unrelated-action
raster comparisons pass. Art Lab: 35 refs, 13 models, zero motion warnings.
UI system/material/action-role audits pass. Physical-device FPS has not been
measured, and this is still a user-review candidate rather than normal release.

Evidence: `output/mounted-v68-cache-audit.json`, `mounted-v68-cache-comparison.png`,
`mounted-v68-run-audit.json`, run desktop/phone/action captures, and
`mounted-v68-performance.json` (desktop CPU submission benchmark, not phone FPS).

Final isolated ABBA run (90 measured + 12 warm-up samples per case/pass,
480x880 target, rear unit 2.397) has median CPU submission milliseconds:
idle 2.1→2.2, walk 2.1→2.3, trot 2.1→2.2, gallop 2.2→2.2,
duck 3.6→3.4, sword 3.6→3.2, jump 13.3→2.4. Jump p95 is 19.3→3.9;
sword p95 is 8.6→6.4. Ordinary gait differences are small measurement noise,
not claimed speedups. An earlier overlapping-audit run was discarded because
concurrent browser work distorted its timings. Approximate jump cache gain
does not imply the same factor for complete gameplay or a physical phone.

The additional mobile-touch audit passes start/jump/duck/sword taps and keyboard
jump from the walk selection (switching/preparing gallop first). It caught a
real iframe-focus issue: touching the outer panel invoked the game's normal
blur auto-pause. Preventing pointer-down focus transfer on these test buttons
fixes that without disabling app-switch auto-pause. Fresh live-HUD desktop and
phone views and `mounted-v68-reference-comparison.png` were visually inspected;
the character, props and panel remain separated. Evidence is
`output/mounted-v68-run-touch-audit.json` and `mounted-v68-run-*-live.png`.

## v67 — modest higher arc and sharper nose-down landing (2026-10-01)

User requested a slightly higher jump and a sharper descent. Scaled the whole
connected lift curve by 1.18, including its takeoff and compression joins, so
the authored peak increases from 6.615 to 7.8057 horse units (8.0703 to 9.522954
world units) without changing duration or introducing velocity discontinuities.
The downward landing velocity also increases 18%. Landing pitch changes from
.13 to .24 radians (about 7.4 to 13.8 degrees nose-down), retaining v66's single
smooth airborne sweep and its quiet body-oscillator envelope. Contact times,
forefoot hold, normal gaits, shared model geometry and materials are unchanged.

Fresh approved live knight/bear/seated-merchant overview and isolated views
were inspected before editing (`mounted-v67-pre-*`), retaining the fixed bones,
connected masses and crisp material planes. Fresh final reference comparison
was inspected in color and small grayscale, plus side/quarter phase boards
and desktop/390px actual Lab renders. The added height and steeper fore-first
landing read without detached joints or clipping; both rear feet still land.

19,208-pose audit passes, with exact new peak/pitch assertions, all preparation
and four landing contacts preserved, minimum sole clearance .0305 and apex
minimum sole height 12.5181. Flight remains free of gait-body oscillation with
one height reversal and monotonic pitch. 1,936 base-rig parity samples and
18 unrelated-action RGB comparisons pass; no page errors or nonfinite vertices.
Art Lab audit passes 35 refs / 13 models / zero motion warnings. Syntax and
diff whitespace checks pass. Candidate remains subject to user review.
Evidence: `output/mounted-v67-running-jump-audit.json`,
`output/mounted-v67-reference-comparison.png`, phase boards, desktop and phone.

## v55 — Mounted duck candidate, 2026-10-01

User scope: begin the jump/duck/lane-change series with duck, leaning Jonathan
forward, and test it in the game. Jump and lane-change animation are untouched.
The shared Jonathan rig is extended through optional pose fields, not copied.
The hip stays in the saddle, both fixed-length 5/5.1 arms retain their rein
contacts, and the rider legs/stirrups remain identical. Upper body and attached
equipment pitch forward up to 1.1 radians. The helmet keeps its square geometry
and blue plume. The loop has .15s lead-in, the existing .52s duck, and .20s rest.

Pre/post live Art Lab anchors: `knight`, `bear`, `seated-merchant`; captures are
`output/mounted-v55-{pre,post}-*.png`. The construction lesson is articulation
of separate compact masses, not scaling the whole actor flat. Fresh side-by-side
review is `mounted-v55-reference-comparison.png`; profile and quarter extremes
and in-betweens are in `mounted-v55-duck-{board,inbetweens}.png`. Review retained
the square head, cool steel faces, block shoulders/elbows and saturated plume.
The pitched chest seam and harness were made to follow the torso instead of
remaining upright. No reference baseline or approved palette was changed.

`KnightRush.html?mountedplaytest=1` loads the candidate explicitly, then wraps
only the actual Jonathan run draw. The existing player input, duck timing,
collision rules, road draw order and foreground layers are retained. Other
characters, squire, menu, combat and death use their existing render paths.
The ordinary boot never loads the playtest. Desktop and 390px game captures
verify the actor on the live road; these are viewport checks, not phone FPS.

`node labs/mounted-knight-duck-audit.cjs` checks 2,424 posed samples for hand
contact/fixed bones/unchanged legs, 64 old idle/sword states for exact warmed
RGBA parity, real ArrowDown initiation, the normal game's full duck cycle,
and normal-boot isolation. The cold front-hoof raster also varied against an
unchanged self-control, so both parity sides receive an identical full warm-up.
The diagnostic is `mounted-knight-duck-parity.cjs`; tolerances were not widened.
Art Lab and three UI audits pass. New duck aesthetics await user review.

### v56 — Slower duck, tucked elbows, lower shield (2026-10-01)

User found v55 too fast, with laterally flaring elbows and a high shield.
The lowering beat changes from .1872s to .44s, followed by .16s hold and .45s
recovery. Smoothstep removes the sharp midpoint acceleration of the previous
cubic easing. The lab loop is 1.5s including pauses. Only the explicit mounted
playtest adopts the 1.05s action/collision window; normal boot retains .52s.

Holding the hands at their former world positions made the shoulders overtake
them and the IK elbow plane swing sideways during the fold. The new grips
slide 3.4 units forward and .35 down at full duck, with both live reins following
them. The native 5/5.1 bone lengths and legs remain unchanged. Across 241 gait
samples, maximum absolute elbow X drops from 7.803 to 4.391 units. The shield
alone receives an eased local translation down/toward the back; at full duck
its world height is 1.977 units lower. Colour and horse-occlusion passes apply
the same translation. Its neutral attachment, mesh and palette are untouched.

Fresh `v56-pre`/`v56-post` live references use `knight`, `bear`, and
`seated-merchant`. The compact linked limbs, squared helmet, steel planes and
blue plume were retained. `output/mounted-v56-duck-comparison.png` shows old,
halfway and new poses at front/rear/both profiles; the fresh side-by-side anchor
board is `mounted-v56-reference-comparison.png`. Desktop and 390px live game
captures were inspected. This remains a user-review candidate.

`node labs/mounted-knight-duck-audit.cjs` now routes to the current refinement
audit. It passes fixed-bone/grip-target checks, unchanged legs, a width bound,
shield-height check, 64 exact warmed non-duck RGBA regressions under the fixed
SwiftShader backend, real ArrowDown, full 1.05s recovery, and normal-boot .52s
isolation with zero page errors. Art Lab technical audit passes. The earlier
fixed-hand/.52s test source is preserved in `output/mounted-v56-before-duck-audit.cjs`.

### v57 — Rear-view head pitch and back-equipment clearance (2026-10-01)

User accepts the bending motion, but flags the rear-view head and clipping
between the shield, quiver and bow. Body/arm/leg poses and timing are unchanged:
808 sampled states match v56 exactly. Neutral head projection is approached
continuously (maximum sampled near-rest delta 0.000002635 native units).

The shared Jonathan solid-turn helmet now optionally projects its existing
chamfered wall, rim, visor and vent geometry as articulated surfaces. The same
stepped plume and mount rotate with it, including rear-view foreshortening;
no replacement head drawing, palette or approved neutral pose was introduced.
The former flat near-depth helmet clip is replaced for duck by per-surface
affine depth planes, including the plume. Coplanar face details share one
equipment pass to bound overhead. Other Jonathan callers keep the old path.

All back equipment now shares the already-authored duck translation instead
of translating only the shield. This preserves their relative clearances and
the requested lower shield position. The colour shader and horse occlusion
shader use the same offset. A rigid-transform check preserves inter-item
distances to 5.4e-15; a vertex probe found no helmet-volume intrusion for the
current full-duck assembly (not a blanket triangle-collision proof).

Fresh live Art Lab pre/post anchors remain `knight`, `bear`, `seated-merchant`.
`output/mounted-v57-rear-head-poses.png` was inspected at 135/180/225 degrees and
0/35/70/100% duck, with fresh side-by-side anchors in
`mounted-v57-reference-comparison.png`. Cool steel, squared planes and blue
plume are retained. Desktop and 390px game captures were reviewed; new head
and occlusion rendering remains a candidate for the user's visual review.

Current duck audit passes 64 exact warmed non-duck RGBA cases, fixed limbs,
input/recovery and normal-game isolation. Art Lab technical audit passes.
The head review's short desktop CPU submission pilot showed no observed
regression (v56 median 4.3ms, v57 3.4ms); this is not a phone FPS or speedup claim.
Historical v56 boards were regenerated from the saved pre-v57 sources after
an early visual-only trial reused their filenames; v57 evidence is separate.

## v43–v45 — sword action, then authored 3D adaptation (2026-09-30)

The additional fitted-cloth point-cache optimization was tested twice in ABBA
order and discarded: its gains did not repeat, with a rotating case regressing
in the second run. Saddle source is restored exactly to v42 (`91fb4b51`).
`mounted-v43-performance{,-repeat}.json` describes that rejected candidate,
not a new adopted speedup. The v42 horse optimizations remain in place.

The first sword port reused `backSwordPoseAt` and the actual approved equipment
hilt. The user subsequently explicitly dropped one-to-one copying, requested
forward 3D cuts, straighter draw/return elbows, subtle body motion, and rear arm
layering, then supplied `C:/Users/Altar/Desktop/referans.MOV` as motion reference.
The 7.53-second video was inspected as timestamped frame sequences, including
8-fps close-ups of 3–4.5, 4.5–6 and 6–7.5 seconds. This is sampled-frame review,
not motion capture or a claim of continuous video perception. The asynchronous
video analyzer did not return before it was cancelled; the local frame evidence
is `output/mounted-v45-video-*.png`.

The resulting local candidate keeps the original 2.96-second beat, raised-right
preparation and two opposing cuts, but authors a forward-bowed XYZ hand path and
a canted blade plane. The original hilt mesh, narrow pointed steel blade and
blue trail palette remain. Both arm bones stay at 5 / 5.1 units. The elbow
extends during the draw/return, then bends smoothly for the seated grip; there
is no arm stretching. Small hip-pivot pitch/roll drives the torso, helmet and
equipment, while the free hand retains rein contact. The shared native model
renders the body with its projected lean; this remains a hybrid 2.5D actor,
not a replacement fully volumetric character. No production/shared rig source
or protected reference was changed.

Rear layering was inspected at 145, 180 and 215 degrees, with shield on/off.
A forearm-over-neck leak was found and fixed locally: depth-clipped fragments
reuse the actual neutral-arm native neck/equipment drawing, with separate clip
passes so overlapping masks do not make parity-stencil holes. The held weapon
also depth-tests against the neck, helmet, torso, limbs, horse and equipment.
Arm/chest occlusion retains the native renderer. Close-ups, phone layout,
side/front/back phase boards and the fresh approved live knight/bear/seated
merchant comparison were inspected. Square helmet, blue plume, cool armour,
fixed joints and broad plane masses remain consistent with those anchors.

Validation: 608 action poses across eight views/four gaits; native phase error
zero, fixed-bone/rigid-hilt/straight-elbow error below 1e-10, planted-hip error
zero, and projected shoulder alignment below 1e-10. All 20 endpoint, hidden
weapon and scrub-repeat raster comparisons are exact on pinned SwiftShader.
The hardware MSAA path showed occasional 1-byte differences in a handful of
edge pixels; the strict test pins its backend instead of relaxing tolerances.
Default hardware baseline raster comparisons still pass 48/48 per variant;
492 full horse geometry cases remain identical to v39, including 18,042,732
numeric values. Browser controls/192 poses/390px/pause and the Art Lab technical
audit pass. Evidence: `mounted-v45-sword{,-layers}-audit.json`,
`mounted-v45-idle-{pixel-audit,equivalence}.json`, `mounted-v45-browser-audit.json`
and `mounted-v45-art-audit.json` in `output/`.

Only the local Mounted Knight Lab exposes the new sword choice. Parry, shield
bash and bow/arrow actions are not implemented in this step. This is a visual
candidate for user review, not a new approved baseline or production integration.

## v46 — rebuilt shoulder-driven forward double cut (2026-10-01)

The user rejected v45's bent strike elbow and wrist-led turn, and explicitly
requested right-up to left-down, then left-up to right-down, then sheathing.
The v43–v45 notes above are historical evidence, not an approval of that motion.

Rebuilt the local phase curve and shoulder-direction arcs. During both cuts,
shoulder, elbow, hand and blade share one straight forward-pointing direction;
there is no separate wrist-spin curve. Both bones remain 5 / 5.1 units. Recovery
returns the rigid grip frame to the actual original scabbard axis. The final
reach to the seated hilt naturally bends the elbow; the straight-elbow constraint
is exact during the cutting phase. Small hip-pivot body motion remains local.

The complete blade and original hilt now retain constant geometry throughout
extraction and insertion. Only fragments physically inside the scabbard envelope
are hidden. The handoff no longer swaps drawing pipelines at grip/release;
the original and action depth passes transfer ownership smoothly during the
earlier reach and later hand return, using identical arm poses. Reins transfer
with that pass. The stroke is stylized, not a physically exact sword-drawing
simulation: the fixed arm cannot pull the entire long blade out along the fixed
back-scabbard axis, so the ready rotation starts before the tip fully clears.

Fresh pre/post Art Lab overview and isolated `knight`, `bear`, `seated-merchant`
anchors were actually inspected. The final side-by-side comparison preserves
the approved square helmet/plume, compact silver torso, distinct elbow/hand
blocks and broad material planes. Reviewed front/profile/back phase boards,
dense draw/return frames, rear 145/180/215-degree shield-on/off close-ups and
actual desktop/390px Lab layouts. Cuts are forward in profile, and consequently
foreshorten or pass behind the native actor in some rear intermediate views;
they are not forced on top of the body for visibility. No detached joint or new
neck-overdraw was seen in those captures. This is still a user-review candidate.

Validation: 800 poses / eight angles / four gaits; rigid whole-weapon, straight
elbow, cut alignment and original hilt handoff errors below 1e-10; hip and rest
endpoint errors zero. All 20 strict SwiftShader rest/hidden/scrub raster checks
pass. The separate continuity check covers the start, pre-draw pass completion,
grip, sheath and final release across six views: 30 checks pass, with zero
action-only channel deltas. The original 24 start/grip/sheath/end cases are
byte-identical; at 0.24s two views have four changed plume-edge pixels whose
signed channel deltas exactly match the unmodified breathing actor. This is
recorded separately, not hidden behind a pixel-error tolerance. Baseline raster and browser
checks pass with no page errors; Art Lab technical check passes. Evidence lives
in `output/mounted-v46-sword-audit.json`, `mounted-v46-draw-continuity.json`,
`mounted-v46-idle-pixel-audit.json`, `mounted-v46-browser-audit.json`,
`mounted-v46-art-audit.json`, and the corresponding v46 PNG boards.

Only local Lab action/render/test/review files changed. The approved production
Jonathan model, horse rig, shared equipment and protected baselines were not
modified. No production integration or visual approval is implied.

## v47 — outside draw turn and high/left sheathing (2026-10-01)

The user liked the v46 double cut but requested that the draw turn travel
outside the sword arm, and that return first hold the sword at the top before
breaking left toward the scabbard. This is a scoped transition revision, not
a new character design or a change to the two cutting arcs.

The draw-to-ready rigid frame now passes through an explicit outside/back
orientation instead of the inward shortest rotation. A 9.2-unit shoulder/hand
reach and forward/outward elbow pole provide blade clearance during draw and
alignment; the two bones remain 5 / 5.1 units, and the cuts still fully extend
to 10.1. Return raises the hand and upright blade to a high pose, briefly holds,
turns the blade left, then lowers and aligns it with the original scabbard.
The same complete blade/hilt mesh and original sheathed attachment remain.
The stylized fixed-scabbard extraction limitation described for v46 remains;
this is not a physical full-withdrawal simulation.

Dense review caught a narrow return-arm surface overlap and moved the return
elbow bend earlier, before the blade points down. A new clearance regression
samples 242 rotation poses, the full blade width/thickness, 0.04-unit length
steps and 33 width samples against upper/forearm capsules. The minimum sampled
surface gap is 0.0622 world units; this is a sampled conservative arm-volume
check, not an all-body or mathematically continuous collision proof. Separate
800-case comparisons against the saved v46 sword source preserve accepted cut
arms, body lean and all blade/hilt vertices within 1.43e-14.

The new elbow routing exposed a side-view neck-mask pop at grip and release.
Neck depth masking now follows the continuous action-render ownership rather
than the discrete held flag. All 30 start/reach/grip/sheath/end continuity
checks pass with no action-only signed channel deltas. The 800-pose action audit,
20 strict endpoint/hidden/scrub checks, unchanged idle raster comparisons and
Art Lab technical audit pass. Evidence: `output/mounted-v47-clearance.json`,
`mounted-v47-continuity.json`, `mounted-v47-final-sword-audit.json`,
`mounted-v47-idle-pixel-audit.json`, and `mounted-v47-art-audit.json`.

Fresh pre/post approved live overview, knight, bear and seated-merchant anchors
were inspected beside the revised outside/high/left poses. Square helmet,
blue plume, cool steel, connected elbow/hand blocks and seated massing remain.
Dense 145/180/215/270-degree transition boards and desktop/390px scenes were
reviewed. The new high pose stays within the scene, and rear/profile views
retain actual depth occlusion rather than painting the blade over the actor.
The art contract constrained this to the approved shared appearance and fixed
bone lengths. Only Lab action/render/audit/review files changed; no production
or protected-reference edit and no automatic approval of this new transition.

## v48 — upper draw turn, horse clearance, edge-led first cut (2026-10-01)

User requested an upper rather than lower draw turn, no first-cut horse-head
contact, a short low-right hold, a lower arm during recovery and slower insertion.
During the work they additionally requested that the first cut rotate its sharp
edge along the cutting direction, like the second cut. These supersede the v47
high-arm return and first-cut blade orientation, not the approved character.

The draw waypoint now travels above/behind the hand. The first cut adds a smooth
vertical lift through its midpoint, clearing the ears before descending beside
the head. Its rigid blade frame uses the cut-path tangent as the width/leading
edge direction; windup enters that frame continuously, and rebound rolls smoothly
back into the existing second-cut frame. Second-cut geometry is unchanged in
848 comparisons against the saved v47 source (zero numeric error).

The low-right follow pose holds for 0.20s (1.88–2.08). Recovery uses a bent,
shoulder-side arm instead of the vertical extended v47 pose, and its aligned
shoulder/hand reach is reduced to 8.4 units. Both arm bones remain 5 / 5.1 units.
Insertion takes 0.70s (2.58–3.28), formerly 0.29s; total action is 3.44s.
The Lab timeline and helper sentence were updated accordingly, without changing
button roles, materials, hit targets or other UI geometry. The fixed long back
scabbard still uses the stylized extraction described above, not a physical
full-withdrawal simulation.

New read-only Lab collision instrumentation returns the actual posed head/neck
faces without changing their renderer. Blade/horse triangle intersection checks
pass in 484 sampled cut poses across idle/walk/trot/gallop; an old-source negative
control detects the previous first-cut collision. First-cut leading-edge/path
tangent alignment is at least 0.9999999999999997. These are sampled geometric
checks, not a proof of continuous collision freedom at every possible instant.
Dense draw/return arm checks retain a positive 0.123-unit sampled surface gap.
The 832-pose action audit, 20 strict reset/hidden/scrub raster checks, 30 handoff
checks, browser controls/390px/pause checks and Art Lab technical audit pass.
Treasure system/states were inspected before the helper-text change, and all
three UI system/material/action-role audits pass. Reports use `mounted-v48-*`
under `output/`, including `sword-audit`, `horse-clearance`, `clearance`,
`continuity`, `browser-audit`, `art-audit`, and `ui-*`.

Fresh approved pre/post live knight, bear and seated-merchant anchors were
visually compared with the revised upper turn and lower return. Front/profile
cut boards, rear/quarter transition boards and actual desktop/phone scenes were
inspected. The art/UI skills constrained the edit to the existing square helmet,
cool steel, connected fixed-size limbs and brown/parchment controls. No new
viewport clipping or disconnected joint was seen. This remains a local Lab
candidate; production/shared character, horse and protected references did not
change, and passing audits do not promote it to an approved reference.

## v49 — equal draw/insert speed and raise-before-turn recovery (2026-10-01)

User corrections: insertion was too slow; the draw crossed the helmet, the
second cut painted through the shoulder/plume/white crest mount, and recovery
must turn diagonally backward without the old lateral detour. Follow-up:
**raise the arm first, then turn the sword behind it**.

- Draw and insertion now traverse the same rigid grip-axis distance in the
  same 0.36 seconds with reversed matching easing. Total action: 3.10 seconds.
- Delay the draw hand's forward travel until the blade turns above/behind the
  hand outside the helmet. The upper waypoint clears the plume; no actor,
  weapon length, attachment, or approved shared geometry was altered.
- Keep the low-right hold. From 2.08–2.32 the arm rises while the sword keeps
  its direction. From 2.32–2.58 the hand stays at its raised body-space target
  while the sword turns through a backward waypoint into the scabbard axis.
  The former high/left loop is removed. Insertion is 2.58–2.94.
- Native shoulder caps, three plume segments and white crest mount now have
  matching silhouette/depth surfaces in the lab-only action pass. These do not
  repaint the actor or force the entire sword behind him: nearer blade
  fragments remain visible, farther fragments are correctly occluded.
- Both authored cuts and their edge alignment are unchanged; first-cut horse
  clearance and the straight fixed-length shoulder/elbow/hand/blade chain remain.

Reference gates: fresh live Art Lab overview and isolated `knight`, `bear`,
`seated-merchant` captured and inspected before/after (`mounted-v49-pre/post-*`).
Jonathan retains the square helmet, blue stepped plume, separate armour blocks,
unchanged silver palette and gear. The small helper-text/timeline update retains
the UI skill's brown/parchment surfaces and existing utility/selection roles;
fresh Treasure system/states views were inspected, no controls were restyled.

Evidence: `mounted-v49-rider-clearance.json` samples 2,068 poses over four gaits
against conservative helmet/mount/plume/shoulder volumes, with zero hits. The
frozen v48 negative control catches 26 helmet and four plume-hit poses. It also
checks no blade rotation during lifting, no body-space hand drift during the
backward turn, and identical draw/insert travel profiles (errors < 1.2e-14).
`mounted-v49-depth-audit.json` checks 48 native-detail locations at eight angles:
behind fragments are hidden, front fragments visible; omission of the new
surfaces exposes every tested detail category. These are sampled checks, not a
continuous collision-proof simulation. The pre-existing stylized scabbard/full
withdrawal limitation remains; the blade is neither resized nor grown.

Live close-up boards `mounted-v49-rider-*` cover extraction, second-cut overlap,
the raised arm, backward rotation and insertion at rear/profile/quarter angles.
Final desktop/390px scenes, fresh side-by-side reference comparison, rigid-pose,
handoff, replay/hidden/reset, horse-clearance and UI/Art Lab audits accompany
this candidate. Lab only; no production promotion, reference change or approval
claim, and no unrelated working-tree edits.

## v50 — lift the blade upright, then lower backward; fluid draw (2026-10-01)

User clarification supersedes v49's fixed blade direction during the lift:
raise the arm with the **sword pointing up**, then lower the sword backward.
An additional request asks for a more fluid draw without unnecessary turning.

- Recovery keeps the same hand path, timings and fixed bone lengths. Its blade
  direction now rises continuously from the low-right pose to vertical at
  2.32 seconds, before any backward turn. It then lowers through the existing
  rearward waypoint into the scabbard axis; the hand does not wander sideways.
- Drawing now uses one continuous upper/back rotation instead of two separately
  eased quaternion turns that nearly stopped in the middle. The blade follows
  one rotation axis and only the shortest roll needed to meet the existing
  first-cut edge frame. Forward hand travel uses a single easing curve.
- Dense comparison against frozen v49: blade-direction travel falls from
  237.22° to 207.79°, full-frame travel from 292.05° to 258.11°. Peak angular
  speed falls from 3652.43°/s to 1728.41°/s; the former near-zero middle speed
  is gone. These are choreography measurements, not runtime performance claims.
- Draw/insert duration remains 0.36 seconds each, whole action 3.10 seconds.
  The two cuts, shield/helmet/plume depth handling, actor geometry, materials,
  horse and UI remain unchanged.

Fresh live Art Lab pre/post overview and isolated `knight`, `bear`, and
`seated-merchant` were inspected; fixed steel limb blocks, square helmet and
blue plume remain the same shared model. Current rear/profile/quarter boards
and desktop/390px return/draw scenes accompany the new upright apex. The final
live-reference comparison includes draw, upright recovery, and backward lowering.

Evidence: `mounted-v50-fluid-audit.json`, `mounted-v50-rider-clearance.json`
(2,068 samples, no protected rider-volume hits; upright Y=1, no backward blade
component before the apex), `mounted-v50-clearance.json` (242 draw/return samples,
minimum blade/arm surface gap 0.18399, unchanged second cut), pose/rigidity,
scrub/reset/hidden, handoff and Art Lab checks. Collision tests are sampled, not
continuous proofs. The earlier physical withdrawal limitation remains. Lab-only
candidate, not approval or production/reference promotion.

## v51 — mirrored sheathing; full-withdrawal choice still needed (2026-10-01)

Completed: the sheathing turn now traverses the exact draw hand/blade curve in
reverse, after recovery lifts into the draw's high-ready pose. The old separate
upright/backward wrist route is removed. Body-space mirrored hand error is
2.28e-14 and frame error 6.81e-15 over 101 samples. Timings remain unchanged.

NOT completed: the request to fully withdraw the blade before it turns. Opening
the existing arm from 9.2 to its full 10.1-unit reach was tested and rejected:
the tip still remains 3.016 units inside the scabbard, still intersects the
shield on three sampled turn frames, and blade/forearm clearance becomes
negative (-0.406). The trial was removed; the accepted 9.2 reach is retained.
`mounted-v51-shield-audit.json` explicitly compares current, fullReachTrial and
frozen v50. Full axial withdrawal needs at least 12.992 units of shoulder-hand
reach, versus the existing 10.1 total bone length (at least 28.6% longer, before
allowing elbow bend/clearance). A small elbow extension cannot solve this.
Do not claim the shield/tip problem is fixed. Changing limb/weapon dimensions
requires the user's choice rather than silently breaking the art skill's fixed
bone-length contract. Existing full-withdrawal limitation is now quantified.

The independent mirrored-return edit passes 2,068 rider-volume samples, the
242-pose arm-clearance check (minimum +0.18399), unchanged-cut comparison, 832
pose/rigidity samples, strict replay/reset/hidden checks and boundary handoffs.
Fresh live pre/post Art Lab overview plus knight/bear/seated-merchant references,
side-by-side comparison and actual desktop/390px return scenes were inspected.
The knight's geometry, colours, shoulder/plume depth fix and UI remain unchanged.
Art Lab audit passes; this remains lab-only, with no reference promotion.

## v52 — joint-only full draw, stable release and fluid elbow (2026-10-01)

The user explicitly allowed temporary joint spacing for full withdrawal, then
requested a fluid bent-to-straight elbow transition. Changes remain Lab-only.
The shared Jonathan model, weapon dimensions, gear attachments, approved
reference hashes and accepted double cuts are unchanged.

Fresh approved live Art Lab overview plus `knight`, `bear` and
`seated-merchant` anchors were inspected before the edit, with native arm
construction inspected afterward. Construction lesson: keep the square
helmet/plume, broad cool-steel planes and separate shoulder/elbow/fist blocks;
do not stretch their solid armour. The user-authorized exception is spacing
between those blocks, not a model redesign. Upper/lower armour cores remain
exactly 5 / 5.1 units. A draw-scoped primitive adapter reuses the native arm
recipe, materials and painter masks; it restores the original helper in
`finally`. Matching action-depth segments follow those same shortened cores.

Full axial travel is now 11.42817 units, placing the blade tip 0.35 units
outside the sheath before turning. At peak, each effective arm segment has
2.25 units of temporary joint spacing, split between its two ends. This
spacing closes continuously through the 0.72–1.00s ready transition, and
opens with the exact reverse curve during sheathing. There is no final-frame
switch from a still-bent IK chain to a straight arm. The action solver also
avoids the generic IK solver's 0.001-unit straight-arm clamp at this join.

The original post-insertion flip came from the hand passing nearly through
the shoulder while raw pole interpolation became unstable. The empty hand
now takes an outside arc and interpolates its bend angle in a nonsingular
frame. Release lasts 0.40s instead of 0.16s (2.94–3.34s); draw/insert and cut
timings are unchanged. The Lab loop and scrubber include the full new duration.
Only the duration/action hint changed visually in the UI. The Treasure
current-system/states were inspected: view/motion/action/visibility choices
remain selections, playback/reset/step remain utilities; no roles, styling,
hit targets or layouts were redesigned.

Verification evidence:

- `mounted-v52-flex-audit.json`: 13,364 poses over four gaits; fixed solid-core
  error below 1.3e-14, grip error below 1.1e-14; release hand stays at least
  2.509 units from shoulder. Maximum 1ms elbow step is 0.08949 units versus
  12.6254 in the frozen v51 negative control. Dense four-gait transition joins
  check position and velocity continuity; UI duration/scrubber are asserted.
- `mounted-v52-shield-audit.json`: actual blade/shield triangle intersection
  checks over 2,068 full-action poses have zero hits; frozen v51 is detected.
- Rider-volume audit has zero helmet, plume, mount or shoulder intersections.
  Mirrored draw/return hand and blade frames remain equal in body space.
- Arm clearance remains positive (minimum conservative surface clearance
  0.02012 units); 848 accepted second-cut regressions are exactly unchanged.
- Sword rigidity, exact rest endpoints, hidden-weapon and deterministic
  scrub/raster checks, handoff continuity, Art Lab and UI audits were run.

Fresh live anchors were compared beside the final candidate in
`mounted-v52-live-comparison.png`. Near and small-scale turn/release boards,
the new `mounted-v52-elbow-transition.png`, and actual desktop/390px views
were inspected. Silver armour cores keep their block widths/lengths while
the deliberately spaced joints briefly open; the helmet, plume, torso and
equipment identities remain unchanged. The elbow now progressively aligns
in the 0.90/0.94/0.97/0.99/1.00s poses, and the release hand lowers without
the former flip. These are reviewed candidates, not a new user approval.

## v53 — remove elbow-opening side sweep (2026-10-01)

The user requested that straightening not visibly wag the arm left/right.
The v52 hand/blade path, joint spacing amounts, rigid armour cores and all
timings remain unchanged. Only the bent arm's guide changes: withdrawal
smoothly blends the grip's bend guide into a sagittal plane; at full draw
the elbow has zero anatomical-X offset from its projected shoulder/hand
line. The same guide is reversed for insertion. Empty-hand reach/release
and accepted cuts/recovery retain the exact prior pose (floating-point
roundoff only). There is no camera-dependent pose or hidden snap.

The art skill's before/after gates used fresh live approved overview plus
`knight`, `bear` and `seated-merchant` references. Native shoulder, elbow,
forearm and fist construction was rechecked. The implementation keeps their
fixed broad armour blocks and cool-steel material planes, changing only
the articulation guide rather than reshaping the character. Final fresh
side-by-side comparison, four eight-pose elbow boards and actual desktop/
390px scenes were inspected. In rear and rear-quarter views the elbow now
tracks the arm line instead of swinging sideways as it straightens; side
views retain natural depth bending. This is a candidate, not user approval.

`mounted-v53-plane-audit.json` checks 13,364 poses in four gaits: added lateral
excursion drops from 1.68734 units in frozen v52 to below 5.3e-15. Hand and
blade-frame errors are exactly zero, fixed-core error below 1.2e-14, and
unrelated arm-pose error below 7.4e-15. The existing release/join continuity,
shield, rider-volume, fixed blade/arm, accepted-cut and raster regressions
are rerun. Conservative blade/arm surface clearance improves from 0.02012
to 0.08779 units. Production/shared renderers, references and UI are untouched.

## v54 — fixed-rear fast path, far arm and bow layering (2026-10-01)

User requested substantial optimization for the normally fixed rear camera,
with other views reserved for authoring/cutscenes. Also requested that the far
sword arm stop showing over the helmet at left profile, and that the unchanged
bow cover sword intersections during rear-view draw/return.

- Default Lab yaw is now 180°, with automatic rotation still off. Exactly rear
  uses one active gait's 96-sample, linearly interpolated live mesh cache. Other
  angles retain the procedural horse. Rider IK, sword and GPU depth stay live;
  no character bitmap, animation timing, attachment or shared Jonathan edit.
- Cache storage is 12,307,008 bytes (11.74 MiB), plus reusable face objects.
  Changing gait rebuilds this one cache asynchronously, yielding every three
  samples; it does not retain four full gait caches. Cold preparation takes
  1.25–1.50 seconds on this desktop (2–3 seconds under parallel audit load), so this is a
  steady-state optimization, not a claim of instant gait switching.
- The original skin/tack contact fitting is performed at preparation, not
  every rear frame. The left rein is cached; the right rein is omitted while
  detached and is routed live only while the action hand reaches/releases.
- Static equipment depth meshes are uploaded once for the action pass and
  projected on the GPU. Reusable typed buffers replace per-frame polygon
  spread/array packing. The 64-angle/time action overlay comparison is byte
  identical when the requested bow-priority change is disabled.
- A local native-model depth mask restores only helmet-covered fragments of
  the far arm. At 270°/.86 s the forearm no longer crosses the helmet face;
  the 90° near arm remains visible. No shared-model/reference-baseline edits.
- Rear draw/windup and return use bow coverage to hide intersecting weapon
  fragments. Bow/sword vertices and attachment coordinates are unchanged;
  the negative-control audit confirms removed fragments, no added fragments.

ABBA desktop CPU submission measurements, 120 samples and 30 warmups per case:
rear gallop 11.9–12.3 ms → 2.0–2.1 ms median; rear sword gallop 26.9–27.8 ms →
3.1–3.2 ms; profile sword gallop 27.5–27.9 ms → 13.0–13.1 ms. These exclude
cold cache preparation and are not GPU-completion, phone FPS or IPA results.
Evidence: `output/mounted-v54-performance.json`.

The real Lab transport also ran for 120 live sword-gallop frames: 3.30 ms mean
CPU submission, 18.1 ms median / 20.3 ms p95 acknowledgement interval in this
headless desktop run. This is transport pacing, not a display-present or
physical-phone measurement (`mounted-v54-scene-check.json`).

The rear cache is intentionally **not bit-exact**. Main horse/leg/tack vertex
projection error stayed below 0.157 Lab pixels across 192 sampled poses.
The original front throat/rein ray routing has discrete contact jumps, so those
vertices have larger interpolation errors (recorded, not suppressed). Actual
rear raster comparison over 96 poses, with/without rider, found at most 42
pixels with a channel delta over 20 (0.039% of subject pixels) and 5 silhouette
pixels at 960×1120. See `mounted-v54-rear-audit.json` and
`mounted-v54-rear-raster.json`; do not describe this as exact geometry reuse.

Fresh post-change Art Lab overview and isolated `knight`, `bear`, and
`seated-merchant` were inspected beside rear/profile candidate frames. Square
helmet, blue plume, cool armour blocks, broad horse planes and distinct gold/
blue tack remain intact. The before/after profile makes the corrected far-arm
layer visible; desktop and 390px phone-width Lab scenes were inspected too.
Evidence: `mounted-v54-live-comparison.png`, `mounted-v54-layer-comparison.png`,
`mounted-v54-desktop.png`, `mounted-v54-phone.png` in `output/`.

Checks: sword audit (928 poses plus reset/hide/scrub raster checks), native
detail depth audit, static action-GPU parity (64 cases), rear geometry/raster,
default-angle/gait-switch/desktop/phone scene checks, syntax checks, and Art
Lab audit (35 references, 13 sampled models, zero motion warnings) passed.
All changes remain local to the Mounted Lab; no production integration,
baseline promotion, commit or push. Visual acceptance remains the user's.

## v42 — frame-local shared-corner pose reuse, third optimization pass

The next requested optimization changes only the Lab horse renderer. Source
corners shared by multiple faces now reuse their flesh, body or head transform
within one horse build. Three separate identity-keyed maps preserve the different
deformation functions. No poses survive across frames, and final scaling still
creates independent output corners per face. Rig, saddle, GPU upload/shaders,
materials and production gameplay remain unchanged. The frozen
`output/mounted-v42-before-*` sources are the completed v41 runtime.

Fresh approved live Art Lab overview, knight, bear and seated-merchant anchors
were inspected before editing, followed by their native construction code.
The art skill constrained this to output-preserving work: connected broad
masses, square helmet/blue plume, cool steel and distinct material planes.
Final fresh anchors were inspected beside the candidate in
`output/mounted-v42-live-comparison.png`, with four 12-phase trot/gallop boards
at 90/145 degrees and actual desktop/390px Lab captures. No new silhouette,
joint, tack/cloth layering or material mismatch was found. This is not a new
reference approval or production integration.

The new `mounted-horse-pose-cache-audit.cjs` passes 96 full-output comparisons
against v41, verifies independent emitted corners and previous-frame ownership,
and rejects a deliberately aliased output. Across those poses, the three paths
receive 433,728 transform requests but execute 177,600 transforms (59.05% fewer).
The sampled maximum is 2,248 cached points per horse build; this is a measured
bound for current authored geometry, not a general cache size cap.

Two sequential ABBA benchmarks use 120 measured and 30 warm-up frames per
case/pass (1,920 measured frames each), native 960x1120 headless Edge drawing.
Median total CPU draw/submission times in milliseconds:

| Scene | Run 1 v41 → v42 | Run 2 v41 → v42 |
| --- | --- | --- |
| Idle, 45 degrees | 14.35 → 14.10 | 15.10 → 14.60 |
| Trot, 45 degrees | 17.60 → 17.35 | 17.20 → 17.40 |
| Gallop, 45 degrees | 17.95 → 14.10 | 14.50 → 14.20 |
| Gallop, rotating | 16.40 → 14.30 | 16.10 → 14.55 |

Horse preparation excluding saddle improves 3.6–20.3% across the eight stage
comparisons. Total rotating-gallop medians improve 9.6–12.8%; fixed trot is
essentially unchanged (-1.4% / +1.2%). Fixed-gallop savings vary substantially
between runs, so this is not a uniform whole-scene speedup claim. Reports are
`output/mounted-v42-final-performance{,-repeat}.json`, with unchanged-source
confirmation, zero page errors and 48/48 exact native RGBA states in each.
These are desktop CPU wall/submission diagnostics, not GPU execution times,
phone FPS or presentation latency. The shorter pilot is not the final evidence.

Full-horse regression remains exactly equal to frozen pre-optimization v39 in
492/492 cases and all 18,042,732 numeric values, plus face order and metadata.
Separate default-context fresh-canvas raster checks pass 48/48 states for every
variant and baseline repeat. Surface-index, upload, cloth-stability (120 samples
per gait), browser pose/view/gear/pause/390px checks and the full Art Lab technical
audit pass without loosening tolerances or modifying protected references.
The cloth check retains zero relief-once, pinned-row, material and camera errors.

Final renderer SHA-256: `bdaa4087b827d3b07172298bfef9a6022bb7fdb1a857d56a99c2ccf670d4b0fe`.
Saddle `91fb4b51`, horse GPU `b8b6bb66` and rig `9056fca3` remain unchanged.
