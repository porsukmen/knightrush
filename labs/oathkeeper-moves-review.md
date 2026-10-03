# Oathkeeper hands, moves and front/side budget — 2026-10-02

## 2026-10-03 — temporary normal sword-event integration

The user requested the current golem as the only active sword-event encounter,
with the sword-pull event deferred for later restoration. `KRSwordEvent.encounterOnly`
is temporarily true. The original pull, broken-blade and old guardian code remains
intact but is not selected or loaded by this normal road entry.

The existing generated `sword_clearing` road slot now lazily prepares the native
Oathkeeper and its current arena, then starts `startRoad(context)` rather than the
lab's run-reset/immortality path. Event seed, health, inventory, loop and journey
ownership are preserved. The prior guardian's road HP/posture and gold/scrap/
stoneheart reward rules are retained; its native reward sheet returns to the road.
No stage boss pool, spawn probability, approved actor art or attack trajectory is
changed. The current motion source remains the f46c1e28 candidate reviewed below.

Focused verification: `tools/sword-golem-integration-audit.cjs` passed five groups
covering actual no-lab game entry, native turn/damage integration, once-only reward
and road resume, module-load failure, and stale-load cancellation after restart.
Loading, boss and victory renders had no page errors; no old sword bitmap/pull
scene was requested. Report: `output/sword-golem-integration/report.json`; inspected
390px entry: `output/sword-golem-integration/entry-phone.png`. The arena's ten pure
ownership/budget checks also passed. This is focused integration evidence, not a
new full motion/fluidity or aesthetic approval. The retained browser preview uses
`?swordlab=1` to enter the same road event directly; normal play triggers its slot.

## 2026-10-03 — opposite-lane whip strikes (current candidate)

Latest user correction: whips from the right must strike the left lane, and
whips from the left must strike the right lane, not the center. Hand identity
owns this mapping: left-gripped whip → native lane2; right-gripped whip → lane0.
Keep the existing upper diagonals, low cross-swipe and highest overhead finish,
but move their terminal targets to the opposite outside lanes. The low sweep
may honestly cross the center while travelling; the upper and final strikes
must not retain an authored center target or an invisible center hit volume.

Preserve giant/distant body blocking, native mounted Jonathan/horse scale,
horizontal fist rays, the new shrine background, other four moves and absence
of ground target indicators. Geometry, visible native-Z0 slices and native
contacts—not labels or nominal guide keys—will verify the opposite-lane strikes.
The expected basic route is center for the upper/final strikes, with a real
native jump over the intervening low sweep. Alternative routes and all three
starting lanes must remain feasible with the existing mounted action clocks.

Implemented source: `labs/oathkeeper-moveset.js` SHA256
`f46c1e28b710b4b858d78094b537cb8edd0cf8ef9c2a819c6802ce8bbf9249b1`.
Only whip guide trajectories, low-sweep forward guide reach and live beat labels
changed. Body blocking, fixed12×.52-unit chains, inertial solve/cache bounds,
contact clocks and visible-mesh-derived collisions are retained. The other14
production/asset files still match the prior full audit. All e1f140 whip movies,
contact counts and center-target observations below are historical.

Independent fresh scoped verification:

- `output/oathkeeper-moveset/cross-whips/cross-whips-report.json`: PASS,
  3,531 pose samples plus6,183 directional/rate samples; three holds at
  30/60/120Hz, nine source escape plans,27 mortal native HP/real2AP-turn
  replays and20 fresh480/390 HUD captures. Zero failures, warnings, page errors
  or production source drift. This scoped report does not rerun the other four
  moves or promote the old full audit to a fresh five-move pass.
- Each upper/final rope's actual visible-Z0 solids and packed contacts strike
  only the opposite outside lane; center and the originating outside lane stay
  clear throughout those active windows. Upper strikes clear mounted duck.
  Low swipes contact every grounded lane during travel, clear actual jump apex,
  then reach their opposite outside target before continuing past it.
  Actual distal lanes at hold.44: upper left1.983/right.045;
  final left1.908/right.092; low clip5.10 left1.910/right.091 followed by
  clip5.20 left2.378/right−.377. The latter are real follow-through, not center
  targets. Per-link collider overshoot and missing deep-core contacts are zero.
- Fixed-link errors remain below6e-16 and bone errors below2.3e-15; the highest final rope peak remains
  above the main head. Chain vertices stay below the top HUD band with minimum
  projected Y205.933 (native480×800, HUD ends at200). No floor target indicators
  or enlarged invisible target disks were added.
- Scoped ready-scene desktop Edge CPU submission:40 renders after8 warmups,
  mean10.10/p9514.60/max15.50ms, sample mean.278ms. One build/upload and zero
  extra frozen-frame builds/uploads; drawing remains gameplay-pure. These are
  not GPU completion, real-phone FPS or touch-latency measurements.

Main-agent visual inspection includes actual390 upper-left/right impact frames,
the crossed final impact at390 and480, the refreshed native game scene, and
decoded normal contact/load/follow-through and slow overhead-final frames. The
left/right ropes visibly cross toward opposite ground lanes while the mounted
rider remains between the final endpoints. Hand/grip connection, broad stone
planes, earlier shrine lighting, distant body staging and HUD clearance remain
readable. Outboard rope tails can leave the screen during follow-through; hands
and the golem body stay in view. Those tails are not a new target indicator.

Current movie evidence uses
`output/oathkeeper-moveset/review/final-cross-whips-f46c1e28-video-review-summary.json`.
All21 sampled contact/load/final panels pass ±0.08s
timestamp gates, but the encoded normal movie has a1.028s early coverage gap
despite a continuous native trace (maximum wall gap.0402s). The slow movie
covers overhead loading/final descent, not the opening upper diagonals; its
panels pass within.011s and encoded coverage has no gap above.08s. This is
decoded-frame/clock evidence, not continuous full-speed human fluidity or
aesthetic approval. No capture retry or production workaround was introduced.

## 2026-10-03 — giant, distant shrine staging and horizontal fist beams (prior freeze)

Latest user corrections: the boss must remain much larger than Jonathan while
resting farther away; the background should follow the sword-pull cutscene's
forest-shrine setting; the planted fist emits a short beam from each side; the
body must reach toward the rider rather than approach right beside him. A return
into depth should move upward along the illustrated floor, with modest scaling,
not merely shrink in place. These changes supersede the earlier numbers below.

Current blocking uses a160-unit long lens,100-pixel actor world unit and12.6
depth scale. The ground horizon is314 (=native634 minus320), aligned with the
plate's distant floor. The native mounted player and z0 contact plane are not
moved or rescaled. Rendered rest depth75 is separate from native logical14;
first-move body depth stops at35, with shoulder lean and a forward-reaching arm.
The planted pose is constant from clip2.43 through3.91; withdrawal starts only
after the paired beams. Eight supported steps carry the farther approach/return.

Both fist beams begin at the actual striking-arm stone surface intersected by
native z0 and height100 (duck) or20 (jump). Their trailing caps touch opposite
outer faces at clip3.00; length44, thickness10, depth6 and outward-only650px/s.
There is no three-lane forward fan or single fictional universal arrival time.
Rendered zero-depth sections own conservative collision primitives.

The new generated environment is packaged at1086×1448 and576×768, registered
with the shared event visual manager. Scene-local stone, sword and native
Jonathan palettes follow warm upper-left light and cool forest ambient. Source,
prompt and packaging evidence live in
`art-source/knight-rush-backgrounds/oathkeeper-arena-v1/BRIEF.md`.

Latest source freeze: `labs/oathkeeper-moveset.js` SHA256
`e1f140368350316ca7c926a9cb54d2e4de652bc8374aa425dc571da45f943432`.
All15 production/asset hashes in the fresh audit still match the working files.
Earlier route counts, captures and videos below are historical evidence, not
the evidence for this freeze.

The first arm keeps its compact, continuous elbow pole through descent, plant,
withdrawal and retreat; the unused arm braces the leaned torso. The old pole
restore during descent was removed because it switched IK branches. The torso
stays loaded until the backward steps, rather than returning to neutral between
the strike and retreat. Normal-depth return shifts the feet upward along the
floor, with only modest perspective reduction. Whip upper diagonals and the
highest final overhead arc are above the main head but below the native top
HUD band; independently projected chain vertices stay at Y205.35 or lower on
screen (native480×800, HUD band ends at200). Ground target indicators remain
absent; physical object/contact shadows are not attack telegraphs.

Fresh verification for this source:

- `output/oathkeeper-moveset/moveset-report.json`: PASS,37,118 pose/geometry
  samples,114 source-planned escape routes,342 mortal native HP/real2AP-turn
  replays and156 desktop/phone HUD captures; zero failures or warnings.
  Native jump/duck clocks, all lanes, both striking sides, three authored hold
  lengths, exact horizontal emitter/mesh contact, fixed bones, stable elbow
  poles and one semantic damage resolution per paired beam are covered.
- Planted-palm drift is below1.2e-13 pixels; horizontal height/depth/axis error
  is zero; maximum elbow bend reversal is zero. Numeric precision is not a
  claim about acting or fluidity. No draw-time gameplay mutation was detected.
- Independent mounted-combat,1800-case boss-runtime,35-reference/13-model Art Lab and
  cutscene asset/manager audits pass. Approved baselines were not rewritten.
- `output/oathkeeper-moveset/perf-isolated.json`: isolated desktop Edge scene
  CPU submission,40 measured renders after8 warmups per move. Mean/p95 ms:
  fist15.11/21.10, rock14.36/18.10, pillars13.21/21.20,
  whips13.76/17.40, mouth ray12.05/15.30. The earlier contended full-audit
  render timings are not the representative isolated measurement. These
  numbers are neither GPU completion nor physical-phone FPS/touch latency.

Main-agent live final comparisons reopened the current Art Lab anchors `barry`,
`basalt-dwarf`, `knight` and `bear`. The golem retains broad squared blocks,
separate elbow/wrist/palm masses and saturated sage material planes, without
lengthening the underlying arm bones. Native Jonathan/horse proportions and
silhouette remain unchanged. Actual native IAB scene and fresh390 phone stills
were inspected: body remains behind the rider, the arm reaches the contact
plane, paired blue rays visibly leave opposite arm surfaces, and final whip
arches clear the head/HUD. Foreground plate seams/stone/foliage remain crisp
beside the live actors; warm upper-left planes and cool forest shadows preserve
stone, armour and horse material identity.

Normal/slow native movie evidence is tracked in
`output/oathkeeper-moveset/review/final-giant-arena-e1f140-video-review-summary.json`.
Original browser-seek boards are provisional. Clean offline-decoded slow pose
boards pass the ±0.08s panel gate, but normal-first entry coverage has an encoded
gap and fails that gate. A single recorder-warm attempt did not repair it.
The native action trace stays continuous; this is a captured-video limitation,
not evidence that the production pose clock jumped. All whip evidence from
that freeze is superseded by the opposite-lane correction above.
Decoded-frame inspection and native-clock completion do not establish a
continuous human full-speed aesthetic review. The latest golem, motion and
plate remain user-review candidates, not approved anchors. Parry authoring and
physical-device performance are still outside this request's completed checks.

## 2026-10-03 — heavier limbs and fluid five-move rework (earlier staging)

User direction: larger limbs, a bear-like approach and side-raised arm strike,
arm-fired bullets instead of ground-rock eruption, physical upper-diagonal
whips into a center sweep and highest overhead slam, a smaller faster rock from
farther away, a small focused blue Guardian-inspired ray, and **no floor target
indicators at any point**. The two pillars were explicitly liked and retain
their geometry/choreography. Mounted Jonathan, native lane controls, God mode
practice, the +30 sequence jump lift and the preceding long-lens repair remain.
Parry design is still deferred; this candidate is not an approved art anchor.

Main-agent live Art Lab gates were completed before geometry edits and reopened
afterwards. Selected current registry IDs: `barry`, `basalt-dwarf`, `knight`,
`bear`; the overview also included approved Duke, Shuffle and innkeeper. Neutral
and action-study models were actually inspected, including the bear's side-led
paw lift and Borin's distinct muscular upper-arm/elbow/forearm construction.
Transferred lessons: muscularity comes from transverse mass, not longer bones;
keep the squared palm/wrist and joint collars distinct; let the support feet
carry torso momentum; route the raised elbow out beside its shoulder rather
than through a near-collinear overhead target. Approved actors were not edited.

Changed candidate construction and motion:

- Upper-arm section .76/.81 → .98/1.03; forearms +24–26% width, with heavier
  elbows, wrists, palms, fingers, thighs, shins and feet. Arm/leg bone lengths
  stay fixed. The torso, head, sword and material identity are retained.
- First move: continuous pelvis travel across four supported steps, lateral
  arm-raise breakdowns, downward strike at clip2.43, then a real forearm emitter
  at clip3.00. Three small bolts reach the native lanes at clip3.51, height100
  (duck) or20 (jump). No eruption objects or scattered impact stones remain.
  Edge raises are slightly inset, without changing root travel or contact.
- Rock:84×72×40 instead of144×118×60. The actor steps back from z14 to24,
  releases at clip2.27, optionally splits at2.58 and passes the player around3.00.
  Its entire rendered zero-depth section now generates conservative contacts;
  the pre-existing pre-active/late ghost overlap described below is repaired.
- Whips:12 rigid .52-unit links per hand, deterministic120Hz inertial rope,
  true grip anchoring, gravity/tension and lag. Upper diagonals descend toward
  center (duck); the low cross-center sweep clears jump apex; the final paired
  overhead strike is loaded above the opening peak and lands in center.
  Three normal hold caches use775,008bytes; LRU bound4. Expensive preparation
  happens before the interactive clock. One local cold preparation measured
  123.2ms; warm sample mean .227ms over2400 Node samples (not phone FPS).
- Ray:constant12×12 octagonal blue/cyan shell with a pale-blue narrow surface
  core and compact mouth charge. Growth2.28→2.38, active2.38–3.18, clear3.30,
  recovery3.40. One/two lane branches remain. Guardian is a visual direction,
  not a claimed frame-accurate copy of BOTW timing or watched reference footage.
- Floor reticle authoring and drawing are removed globally from this moveset,
  including pillar preparation. Physical dust and object/contact shadows remain;
  energy and beam objects do not cast marker-like ellipses.

Main visual review compared the heavier actor with the freshly reopened live
anchors and inspected real390px/480px native-HUD frames for both edge fists,
arm bolts, whole/split rock, unchanged pillars, whip phases and single/double
blue rays. A small edge palm crop was found and fixed: independent raised-arm
vertex extents are now x4.805..474.059 in the480px native scene. No floor reticles,
hand/prop detachment, joint inversion, head/HUD crop or ray/player-depth seam
was seen in those frames. Sampled sheets alone do not establish full-speed
fluidity or aesthetic acceptance; whole-cycle recording evidence is separate.

Final post-edge-fix audit:37,118 pose samples,114/114 bounded source-level input
plans and342/342 real mortal native replays at30/60/120Hz. Every replay preserves
health and reaches the real player turn with2AP. Pause, seek, restart, Break,
death, single semantic-contact damage, menu cleanup and draw purity pass.
Arm/leg length change0; arm reach error<7e-16; foot target error .00508 local
unit; elbow bend reversal0. Independent beam and boulder collider overshoot0;
whole/split boulder visible-lifetime ghost samples0. Whip rigid-link error
<7e-16, joint/grip gap0. All six edge/hold variants keep the emitted arm vertices
inside the viewport. Floor target indicators0 in every sample.

108 final-source native-HUD captures cover390px phone and480px desktop views;
page errors, missing assets, failures, warnings and source drift are0. Fresh
Lab Godmode is true, native9.7 spine and configured+30 jump lift are unchanged.
Art Lab passes35 references/13 models with0 motion warnings; mounted combat
and the1800-case sequence-runtime audit also pass. No approved baseline changed.

Final headless desktop whole-scene CPU means:11.87–15.56ms; p95:19.30–30.20ms
(whip p95 highest). This run overlapped recording/test activity, so it is not a
clean physical-device frame-rate claim. Every changed sampled frame builds and
uploads once; frozen renders do neither. Draw-time gameplay state remains pure.
Evidence: `output/oathkeeper-moveset/moveset-report.json`; source identity for
the active moveset is `8d40365023adc194d425ae2414a08731afa5cfde3e7793c14683111a41369ae0`.

## 2026-10-03 — close-range camera correction (preceding pass)

The user rejected the near-camera distortion as resembling a 0.5x wide-angle
camera and requested a normal, flatter view. The previous short pinhole was
mathematically consistent, but that did not make its visual distortion desirable:
within one fist frame, the nearest/farthest sampled body landmarks differed by
1.507× in magnification; over the whole approach the scale span reached 2.080×.

The active moveset now owns a longer-lens projector: focal 80, model unit
46.7744, depth unit 4.5 and ground rise 846.520357142857. Its zero-depth ground
and three lane centers are anchored exactly to the native mounted player plane.
Model, props, shadows, cues, contacts and beam-volume slicing share the same
projector/inverse. Renderer culling uses the matching local camera position,
including horizontal offset for off-center attacks, with reciprocal depth and
clip-plane interpolation unchanged in principle. The historical physical-chain
module, shared mounted renderer, actor geometry and attack/hesitation clocks are
not changed. The fist approach's lateral offset is recalibrated .60→.3525 to
keep the smaller-perspective fist in its target lane.

The far neutral body's scale stays 39.808 px/model unit. Stage composition is
deliberately flatter: far feet move from about y419 to y508 in native coordinates,
rather than tilting the new lens sharply downward merely to preserve the old
screen position. Body-part proportions remain substantially steadier on approach.
Same-frame near/far landmark magnification ratios changed as follows:
fist 1.507→1.087, boulder 1.423→1.097, pillars 1.327→1.079,
whips 1.472→1.110, beam 1.236→1.060. This is a mild-perspective camera,
not a fisheye filter removal or a claim of a literal physical phone lens setting.

Main review sampled live normal-speed fist, boulder and whip cycles and inspected
the matched before/after phone frame. Independent phone/desktop sheets cover all
five moves, both edge fists and the double beam. No head/HUD cropping or new
beam/player-depth seam was observed. The body is no longer artificially enlarged
at contact. Existing model/motion aesthetics remain candidates; this is a camera
repair, not a new character design or approval.

One existing move-level polish issue is more exposed by the new lens: the large
forming boulder obscures/intersects more of the cupped hands and wrists. The
user's original action describes a beam-like conjuring gesture, not carrying a
surface-gripped rock, so this camera-only pass retains the giant stone's world
size, emergence point and collision timing. Do not describe this as a verified
physical surface grip. Moving only the stone forward would cross the player
plane before the active window; a future pose refinement must preserve that
causal contact mapping and be reviewed separately.
An additional independent inspection found a pre-existing visible-contact timing
mismatch in this move: the whole stone's rendered zero-depth slice touches the
standing rider before its active window (old lens: clip 3.180, new lens: 2.760;
horse old 3.416/new 3.188; activation 3.570). The retained physical thickness and
new lens expose the mismatch more strongly. The passing route suite does not
cover pre-active visible overlap, so do not cite it as proof of exact boulder
contact timing. This camera pass leaves move timing unchanged; depth thickness,
emergence and active-window refinement remain a separate move-level concern.

Final camera audit: 38,246 poses; 114/114 route plans; 342/342 mortal native
replays at 30/60/120 Hz with no contact, unchanged HP and real 2AP player turns.
Player-plane alignment error is zero; world/local round-trip error <1.1e-15;
independent projection error <1.2e-13 px; beam collider overshoot and mouth
attachment error are zero. Pause/seek/restart/Break/death/menu cleanup and
single-contact damage pass; 108 captures, no page errors, missing resources,
warnings or source drift. Art Lab (35 references/13 models) and mounted combat
audits pass; no approved baseline was changed.

Desktop whole-scene CPU means are 7.70–11.84 ms and p95 10.7–18.4 ms; the whip's
isolated maximum is 37.3 ms. One build/upload per changed frame, none on frozen
repeats; draw purity passes. Repeated native-plane calculations are a possible
future micro-optimization, but this sample shows no performance regression.
These are desktop submission measurements, not physical-phone FPS.

Evidence: `output/oathkeeper-moveset/camera-before/`,
`output/oathkeeper-moveset/camera-after/moveset-report.json` and the matched
`camera-after/camera-comparison.png` (2.87 seconds, full phone scene/HUD).
Tested moveset SHA256:
`aaf600fc28298585556b7e1df50985012ec621923de2a8b83b9bac11bcacf9cc`;
encounter SHA256:
`d1091f67c420a40613a6dc368501fbd44402eee9af03a035e253393039dfcfc8`.

## 2026-10-03 — user-authored five-move draft (pre-camera-repair evidence)

The user rejected the prior physical chain's motion, stones and overall feel.
Its passing collision tests below are historical engineering evidence, not
approval. The user then authored a new draft and explicitly deferred parry until
the moves themselves exist. This pass implements those moves separately in
`labs/oathkeeper-moveset.js`; random cross-move combo assembly is not yet enabled.
The draft is open to iteration, not a frozen specification or approved reference.

Native mounted Jonathan, three lanes, jump/duck clocks, +30 jump lift and default
immortal practice remain. No shared mounted artwork, normal encounter pool,
economy or progression is changed. New hazard parry flags are provisionally false;
this is not a final parry/counter/Break design. Keys 1–5 select each move, R repeats
the same seed, N (or Shift+R) starts a new variant. Ordinary native player turns
still separate moves; the next enemy turn cycles through the five drafts.

Each run chooses a bounded hesitation (.18/.44/.76 seconds) before the authored
release. Sampling never rolls RNG; seek preserves the seed and variant. The hold
has a small loaded torso motion, with a fixed readable release afterward. All
contacts/props/cues/poses derive from the same timeline. Times below are authored
clip times; actions after 1.95 seconds are delayed by the selected hold.

- Fist / eruption: four short supported approach steps, one raised left/right
  fist, lane impact at 2.43, hand held on ground, side eruption at 2.96 and low
  jump/high duck contact near 3.72, followed by supported retreat. The first two
  long strides produced up to .49 model-unit foot reach error and were replaced;
  the supported four-step version removed that reach defect. Final phone review
  exposed torso/head cropping with the opposite hand on an edge lane. Edge lanes
  now choose the outside hand (left lane/left hand, right lane/right hand); center
  keeps either hand. This preserves three target lanes and both hands while
  keeping the torso inward, without moving a planted fist to fake contact.
- Splitting boulder: cupped forward hands form one bulky stone; release 2.27.
  A visible crack identifies the splitting variant. At 2.94 the same mesh divides
  into its actual left/right halves and opens toward side lanes, leaving center
  clear. The whole variant stays centered. Initial overlapping narrow halves
  caused an unacceptable silhouette shrink at release and were removed.
- Twin pillars: overhead double slam at 2.43; hands stay planted. Dust marks two
  selected lanes from 2.52; pillars emerge 3.22 and clear after 4.20. Dust does not
  damage and the third lane remains available.
- Stone whips: hands dig at 1.18 and pull out connected stone segments. Left arm
  strikes screen-right near 2.89, right arm screen-left near 3.72; two low closing
  arcs near 5.10 require a jump, then a vertical center strike at 6.76. Fixed arm
  bones are not stretched. Extraction and curve-bend transitions are continuous;
  a forward wrist breakdown at 6.45 avoids the earlier compressed-elbow whip.
- Maw beam: a clamped optional `jawOpen` channel opens the existing lower jaw,
  leaving head/crown/sword identity unchanged. `pose.mouthPoint()` is the actual
  emitter. One/two marked lanes lock before release 2.28, active near 2.70–3.92.
  Contact circles are inset into the rendered beam's exact slice at player depth,
  not into an approximate tall capsule. Bright cream/white strips on the visible
  outer faces keep the energy core readable through the full one/two-lane burst.

Before geometry work the live Art Lab overview and isolated Barry, innkeeper v2,
Duke/dealer, Jonathan, Bear, Borin and seated merchant were inspected. Lessons:
separate connected shoulder/elbow/hand masses, broad unbroken light/shadow planes,
and support-driven body motion. Live Mounted Knight Lab shield bash plus the
shared rider/shield source anchored body lead and fixed-chain equipment contact.
The new golem poses, rocks and jaw remain candidates, not accepted assets.

First 390px native-camera boards exposed long column-like boulders, ribbon-like
whips and a flat orange beam. Those were visible defects despite feasible escape
routes. Rocks now use a bulged three-ring silhouette with clipped corners, actual
split halves preserve the parent volume, whip stones have necked joints, and the
beam's bright core is placed on visible faces instead of hidden inside an opaque
outer volume.

Native update-time feedback adds once-per-crossing thuds/shakes for the major
ground impacts, a swipe for the boulder release and a roar for beam release.
The existing mute setting is preserved. There is no added hit-stop or clock
retiming; seek, rendering, pause and interruption do not replay the sounds.
The focused feedback check passed 45 native runs across three holds and
30/60/120 Hz with exactly 72 expected sound crossings.

Final live review revisited the approved Art Lab overview and isolated models
beside the repaired 390px boards: boulder silhouettes are compact masses rather
than columns; the split retains the original stone's volume; whip segments read
as necked rock joints rather than flat ribbons. Shoulders, elbows and hands stay
connected, with broad material planes and unchanged mounted Jonathan.
Normal-speed native cycles were sampled through all five complete actions,
including the boulder's split variant, and the real AP/player-turn menu.
Slow/scrubbed pose boards cover the
holds, maximum extension, ground contact, release/split and recovery. These are
live/sampled observations, not a claim of frame-by-frame continuous video review.
The full-open jaw reads clearly from the actual game camera, with the beam
starting in its mouth. A close-up profile of the crouched beam brace still hides
much of the jaw hinge behind the near collar/shoulder; the frontal dark cavity
is intentionally simple and remains a visual-polish candidate. No new artwork
or motion is promoted to an approved reference by these tests.

Final expanded evidence after the edge-framing repair:

- `tools/oathkeeper-moveset-audit.cjs`: 38 variants (all four valid fist lane/hand
  pairs × low/high × three holds, plus the other move variants), 114 source route
  plans from all three starting lanes, and 342/342 native replays at 30/60/120 Hz.
  All replays used mortal health checks, had zero contact verdicts, unchanged HP,
  and reached the real native player turn. This is bounded route evidence, not a
  human-difficulty or every-possible-input proof.
- 38,246 sampled poses: arm/leg length error below 1.2e-15 model units; planted
  foot target error below 3.8e-16; exact mouth attachment; zero measured beam
  collider overshoot. Fifteen release/split/whip joins pass their geometry checks.
  Maximum 44 props, 792 prop faces, four hazard records and 22 primitives;
  the geometry-kind cache stays within eight entries.
- Seek/restart determinism, pause, Break/death/menu cleanup and independent
  single-contact damage pass. The damage fixture changes HP 576→432 once;
  repeated sampling does not apply that same contact again. No page errors,
  missing resources, failed assertions or source drift in the final report.
- 108 fresh captures cover desktop and 390px phone viewports. Main review
  inspected both repaired edge-fist sheets: head, torso and limbs now remain
  inside the scene, with visible fist/cue and clear HUD. The five-move overview
  is evidence of this draft, not a new approved baseline.
- Desktop Edge CPU measurements (40 whole-scene submissions after eight warmups
  per recipe): pose sample mean .133–.190 ms; whole-scene render mean
  9.52–13.30 ms, p95 14.4–20.5 ms, maximum 34.4 ms on the whip. Maximum 1,804
  combined faces, one geometry build/upload per changed frame, none for frozen
  repeats, and draw purity pass. These are not GPU completion, physical-phone
  FPS or touch-latency measurements; the whip remains the costliest candidate.
- Art Lab audit passes (35 references, 13 models, zero warnings), mounted combat
  audit passes unchanged action/contact checks, and the sequence runtime audit
  passes 1,800 geometry/sweep cases plus scoped controls/cleanup. Syntax and
  whitespace checks pass. Approved-reference hashes were not rewritten.

Final report: `output/oathkeeper-moveset/moveset-report.json`. Tested moveset SHA256:
`f04fa1d794c83e27066f8a137d79b19a9611fcbe1157b81a5999cd497dc16cb6`.
The encounter feedback source remains
`5ff587ed6dd163405fb398369d8c3ef4aefe8ebb0327b89c7e6987d4990480c7`.

## 2026-10-03 — first physical chain (rejected candidate; historical evidence)

The user authorized trying the first bodily chain. The default lab encounter
now uses only `labs/oathkeeper-physical.js`; the four floating-pattern recipes
remain source history, not the active encounter or an approved boss template.

One 13.2-second enemy turn: two supported steps forward, a diagonal right fist,
weight transfer into a high left backhand, an overhead two-hand ground impact,
pickup of the fragment already lying at that impact, a committed throw, then two
supported retreat steps and the real native player turn. Jonathan stays mounted;
three lanes, native jump/duck clocks, +30 apex lift and immortal practice remain.
No normal spawn pool, progression, economy or shared mounted clip was changed.

The first per-vertex candidate was visibly wrong. The user specifically flagged
its perspective. It mixed native sprite-size easing with per-vertex ground depth
and the model's old orthographic culling/depth order. Foreground fists ballooned,
the crown moved upward during crouch, and a held stone looked pasted on an arm.
Those frames are defect evidence, not an accepted baseline.

The correction preserves native ground placement exactly but uses one pinhole
scale `14/(14+z)` for the golem, its contact circles and masonry. World unit
79.616 preserves the earlier far neutral body scale. Native ground is equivalently
`204.8 + 429.2 * scale`; 286 is the finite far boundary, not this camera's true
vanishing line. Face culling uses the actual local camera position, depth uses
reciprocal camera depth, and clip-plane attributes are perspective weighted.
Held masonry shares the hand's transform and the actor depth buffer. Foot
shadows follow the actual support soles. Mounted rendering is unchanged.

Contact identities are independent: diagonal fist, returning backhand, low
ground front and thrown fragment. The first two and the fragment can be parried;
the ground front cannot. The fragment's lane is committed from the opening
player snapshot and shown before release; there is no mid-flight retargeting.
Pickup is at 7.0 seconds, release 8.88, intended flight contact 9.50. Render and
hazard sampling have no independent clock. Death, Break, restart and player-turn
entry must clear the sequence and its inputs; cancellation retains the last
authored root rather than teleporting the body.

Live reference gate before geometry: Art Lab overview plus Jonathan, Bear,
Barrel Barry, seated merchant, innkeeper v2, Duke/dealer and Borin. Concrete
lessons were broad torso/small head, separate connected shoulder/elbow/palm
blocks, broad material planes and planted feet. Fresh Mounted Knight Lab walk
and shield-bash inspection anchored support travel and body-led action; no horse
mechanics or proportions were copied into the golem. During the corrected pass,
the same live Art Lab references were reopened beside the new 390px pose sheet.
The broad planes and connected limb blocks remain; near-fist inflation is reduced,
the crouched crown no longer rises into the HUD, and the stone shares hand depth.
Native desktop playback and the real player-turn menu were checked live. The
slab still reads as a small seal-bearing fragment; this is candidate acting,
not a new approved motion reference or a claim of physical-device performance.

Current-camera verification: `tools/oathkeeper-physical-audit.cjs` passes 1,585
pose samples, all nine native no-contact replays (three starts at 30/60/120 Hz),
and mortal damage, independent parry/later hazards, actual-frame pause, restart,
Break, lethal player cleanup and real turn completion. Native health stays 576
on each valid route. A tested route uses a left escape, duck at 3.38 seconds and
jump at 6.13; a left-start player also leaves the committed throw lane at 8.92.
Hand contact projection error and ground-fragment bottom error are zero; held
grip screen error is below 6e-14 pixels. Pickup/release positions are continuous.
The original mounted combat audit and Art Lab also pass (35 references, 13
models, no motion warnings); no protected reference baseline changed.

The 120-sample warm CPU check reports recipe mean 0.097ms / p95 0.20ms, whole
scene render submission mean 9.15ms / p95 13.10ms (not display FPS). Maximum
14 props, 143 prop faces and 1,155 total actor/prop faces; one geometry build and
upload per sampled render, none added by a frozen redraw or the second depth
pass. Evidence: `output/oathkeeper-physical/physical-report.json`, the current
480/390 sheets and their individual captures. Earlier floating-pattern and
continuous-control route reports remain explicitly obsolete for this encounter.

Final sampled breakdown inspection: phone slam frames 5.44/5.50/5.57/5.65/5.73
carry raised hands through a forward/downward arc into the ground, without the
earlier elbow inversion. Throw frames 8.56/8.63/8.70/8.77/8.88 preserve connected
shoulder/elbow/hand and HUD clearance. The grip is least readable around
8.63–8.70 where the stone overlaps the fist/forearm; this remains an acting
refinement, not a claim of final visual approval. These are scrubbed samples,
not a recorded slow-playback or physical-phone motion review. The separate
`breakdowns-report.json` matches final source hashes and preserves the full
passing gameplay report.

## 2026-10-03 — user feedback: restore lanes; reject floating-pattern direction

The user rejected the four-pattern family's feel: threats should visibly come
from the golem's physical actions, not look like an avoidance game with a golem
behind it. This is a direction rejection, not a request for more particles or
faster stones. The earlier family below is retained as historical implementation
evidence, not an approved moveset or a future boss template.

The two direct control changes are now scoped to this lab encounter:

- Three discrete lane targets again. One keyboard press or horizontal swipe moves
  one lane; key repeat/continued dragging does not march across another lane.
  Native easing completes the move after release, including in midair. A new
  opposite input can reverse from the actual current position. Both swipe axes
  use the native 24 game-pixel action threshold; the smaller movement slop only
  cancels tap/parry intent, avoiding premature sideways locks on vertical swipes.
- An extra 30 game-pixel lift at the mounted clip apex, shared by rendered
  placement and native hurt-volume displacement. The accepted horse/rider pose
  clips, jump duration, planted takeoff/landing and ground-shadow anchor stay
  intact. Late landing-duck buffering and immortal practice remain available.

The controls do not establish that the old moving-gap patterns are fair with
three lanes. The previous continuous-control no-hit routes and 36 replays are
obsolete for the current controls; current integration tests must not present
those old results as new lane-route evidence. The attack patterns are retained
temporarily so the changed controls can be tried, pending a physical redesign.

Neutral assessment: the criticism is supported by the implementation. Screen-
space diagonal/gate/edge-fall helpers are mostly independent of hand contact,
and the returning slab stops and reverses in the air. Body movement accompanies
the danger rather than causing it. But stones themselves are not the problem:
a visibly gripped throw or a floor fracture beginning at a fist impact can fit
the golem. Likewise, right/left/cross/double animations are not automatically
different gameplay decisions; all-side-dodge variants would remain repetitive.

Recommended next representative slice (not implemented or approved): a visible
supporting step into a diagonal punch, weight transfer into a high returning
backhand, a two-fist slam that originates a low fracture at the actual contact,
then pickup of an already-present fragment and a committed throw. Review body
reach, source visibility, support/pivot contacts and phone framing before
deriving multiple whole-turn variants. The current fixed feet, torso-only twist
and one-scale actor projection need explicit support-step/contact work; neither
stretching arms nor sliding the root to a hit point is an acceptable shortcut.

Current verification: focused runtime audit passes 1,800 swept-contact cases and
lane-control samples at 30/60/120 Hz. Native `--controls-only` passes real keyboard
repeat/release, touch directions/release-only flicks, an initially diagonal
vertical gesture, midair lane changes, landing duck, default immortal practice
through seven real contacts, and ordinary Bear controls/jump. At the authored
apex, visual placement and both native capsule endpoints receive the same +30 px;
the underlying pose and ground shadow are unchanged. Native mounted-combat audit
passes, as does Art Lab (35 references / 13 models / no motion warnings).

The current data audit passes 5,464 numeric samples but explicitly reports zero
routes with `skipped-obsolete-input-model`; `--routes-only` rejects those skipped
results. No current pattern-feasibility claim is made. Evidence is in
`output/oathkeeper-sequence/native-controls-report.json` and `data-audit.json`.
The 390px HUD-visible ground/takeoff/apex/contact board and apex comparison were
visually inspected: unchanged identity, visible additional height, retained
ground shadow, no HUD crop in these fixtures. This is sampled visual review and
browser touch emulation, not a continuous-motion or physical-phone playtest.

## 2026-10-03 — whole enemy-turn sequences (superseded direction)

This supersedes the individual-punch catalogue below. The native game remains
the only combat engine; `labs/boss-sequence-runtime.js` is an opt-in driver on
the existing EncounterActor. Registration remains lab-only. No economy,
progression, encounter-pool, approved horse mesh or Jonathan clip changes.

The reusable `knight-rush-animation` and `knight-rush-boss` skills are available
as personal entry points and canonical project instructions. The user's existing
horse/knight motion approval is recorded separately from this candidate. Their
four skill directories validate; an independent hypothetical new-boss exercise
confirmed native-rig reuse and whole-turn design without copying this moveset.

| Native sequence | Duration | Implemented spatial problem |
| --- | --- | --- |
| Kırılan Avlu | 11.1 s | Low floor ridge, continuously released lintel, opposing fragments, low slide and final floor fracture. |
| Çapraz Mühürler | 11.1 s | Four sloping stone bands with continuously moving solid wings and a real opening, then high/low closure. |
| Geri Dönen Yemin | 10.5 s | Two independently resolved outward/returning slabs with visible return cues and hand catches. |
| Son Yemin | 12.8 s | Warned edge falls, moving openings, returning slab and final low wave. |

Held left/right arrows or A/D steer continuously during this defense phase only.
Native jump/duck clocks remain 0.52 s; sideways air control and late landing-duck
buffering use the existing mounted poses. Touch/mouse horizontal drag supports
vertical jump/duck gestures. Native press/release parry resolves one eligible
object; a real posture Break still ends the enemy phase. Every completed recipe
clears its hazards and opens the real AP player turn. The normal runner and Bear
retain their original controls and attack logic.

At the user's request, `?oathkeeperlab=1` now starts immortal using native God Mode.
Normal menu Play clears that native flag as before. Append `&mortal=1` for actual
health-damage testing; the native audit checks both default immunity with real
contacts and the separate mortal path. For a specific review
entry, append `&sequence=1`, `2` or `3` (zero-based); subsequent enemy turns follow
the same cyclic family. No damage-suppressed Move Lab loop is enabled; real AP
turns remain in place even during immortal practice.
Returning aim is deterministic from sequence-entry position, clamped to 0.60–1.40
to leave an edge escape; the visible path does not home after release. This is
a deliberate first-version simplification of the earlier release-time baiting
proposal, not a claim that dynamic release locking is already implemented.

Motion uses authored loading/action/follow-through poses with monotone Hermite
joins, explicit rearward elbow poles, independent wrist pitch and fixed chains.
The root is not shifted across the arena to force a hand collision. New slabs
have chamfered solid faces, thickness and an inset seal; nine reusable object-space
meshes cover the prop family. The sampled body/props/contacts share one clock.

Review fixes: a moving gap no longer deletes/reinserts stones (which mismatched
swept primitive indices); a parried outbound slab cannot reappear on its return;
held/released/caught shapes retain dimensions and position; the outward aim is
actually on the Bezier path; stone shadows are projected onto the ground. The
large lintel turns in 3D during release, and collision follows its projected axis,
so it no longer traps every route inside the native duck interval.

Live Art Lab overview and close cards for Barry, Duke, innkeeper, Borin, Jonathan
and Bear were inspected before work and reopened during final comparison. The
retained small head/broad torso, distinct elbows/palms and broad stone planes
remain consistent with those anchors. Existing horse gallop/jump were inspected
live; shared mounted artwork was not copied or repainted. Native full/phone-size
boards show readable prop depth and preserved actor identity. This review includes
scrubbed poses and full-speed sampled frames, not a claim that human playtesting
or a physical-phone motion/performance review has been completed.

Verification: 1,800 runtime sweep cases; 5,464 finite recipe samples; arm/leg
length error <= 1.11e-15; reachable hands; planted-ankle drift <= 0.007772 local
units; Hermite joins and 18 exact prop-boundary checks. All 12 recipe/start routes
replay without a native contact at 30/60/120 Hz (36 actual game-loop replays).
The route fixture uses immunity only to continue failures; passing requires zero
contact verdicts, unchanged health and the native player-turn boundary. A separate
unprotected check confirms first-hit health 576→432, not a false god-mode pass.
Keyboard/touch, pause/input cleanup, independent parry, ordinary Bear and mounted
combat audits pass. Art Lab: 35 references, 13 sampled models, zero warnings.

Evidence: `output/oathkeeper-sequence/{data-audit,native-route-report,native-report}.json`
and current scene sheets/phone frames. The separate `native-lintel-clearance.json`
and HUD-visible 4.03 s standing/duck frames verify real overhead clearance.
Warm headless full-scene CPU medians were 8.0–10.7 ms; sampling means were below
0.2 ms in these runs. The actor submits 1,696 triangles;
repeated frozen draws build/upload no new geometry. These are CPU diagnostics,
not a phone-FPS claim. All visual/feel/balance results remain user-review candidates.

The cave is still the native test arena, not the selected ruined oath-temple
courtyard. Final environment art, richer impact/deflection presentation and
player-reviewed rhythm polish remain separate follow-up work. The broad lintel
uses a visibly curved supernatural path; its physical weight/acting should be
judged in play, not declared natural merely because contact tests pass.

## 2026-10-03 — earlier native encounter replacement (superseded moveset)

The user rejected the separate combat scene/engine. `CombatLab.html` now opens
the actual game with a lab-only Oathkeeper EncounterDefinition. The old page is
preserved as `OathkeeperModelLab.html`; the sections below describe that archived
candidate, not the current combat entry. Its generated background is not used.

Only the golem adapter and attack catalogue are new: EncounterActor, arena,
camera/projection, mounted Jonathan, input, lane warnings, model hazard sweeps,
parry/dodge, recovery and move-lab controls are the production implementations.
The actor is centered at direct lab entry (the ordinary intro would otherwise
leave its starting X off-screen). No normal encounter-pool or reward changes.

Five singles: left/right stone punches, a held center punch, low sweep and high
sweep. Three authored strings: left/right/held center; low/high/held center;
right/left/held center/low. These replace the standalone throw/quake rules.
Native combos and tempo scaling are retained; no separate HP-phase system was
invented. Full rhythm/balance acceptance remains a player review, not a test result.

Research: [Sandfall on learning attack patterns and timing](https://blog.playstation.com/2024/07/29/clair-obscur-expedition-33-devs-discuss-classic-turn-based-rpg-inspiration-and-real-time-mechanics/),
[Miyazaki on learning and overcoming rather than repetitive attacks](https://blog.playstation.com/archive/2011/02/04/dark-souls-qa-variety-is-the-spice-of-death/),
and [Eye of Cthulhu's repeated charges and phase-dependent patterns](https://terraria.wiki.gg/wiki/Eye_of_Cthulhu).
The authored application is a short-short-held rhythm and recognizable repeatable
strings with recovery, not a claim to reproduce those games' combat wholesale.
Articles/wiki were read; no gameplay-video review is claimed.

Art gates: live Art Lab overview plus knight, bear and Barry inspected before
adapter work; fresh `output/art-lab/idle-contact-sheet.png` and actual cave bear
comparison reviewed afterward. Preserve small squared head, broad torso and
distinct fixed-length upper-arm/elbow/forearm masses. Desktop/phone idle, tells,
contact and low/high mid-sweep views are in `output/oath-native/`. Idle scale is
comparable to the native bear. Committed close strikes can crop the far arm at
the screen edge; that remains a visual limitation, not an approved composition.

Fixes: renderer uses the real game backing-store scale, not an enlarged fixed
lab bitmap. Lighting now interpolates between material planes instead of popping
across hard angular thresholds; intersecting seal bars have separate depths.
Contact positions are projected from the exact rendered hand pose. Sweep staging
puts the hand on the combat plane before crossing all three lanes; parry return
uses the native reaction clock. No approved reference baselines were changed.

Verification: native desktop/phone audit passes, exact model/contact error 0,
low and high sweeps reach every advertised lane, and a live native run advances
through attacks without page errors. Art Lab technical audit: 35 references,
13 sampled models, zero motion warnings. Global encounter-hierarchy validation
is separately blocked by the existing `road_cutpurse` missing two-lane group;
that unrelated catalogue was left unchanged. Art remains pending user review.

User approved the general look, identified reversed hands, requested a moveset,
then specified that front and side views matter more than the back. Preserve
the head/body proportions, stone palette, carved details, and shared sword.
The following is a laboratory move candidate, not a production encounter.

## Design

- Ezici Yumruk: single arm lifts, holds its tell, then drops toward the locked
  lane. Torso yaw, forward lean and a planted-foot squat supply weight; bones do
  not stretch. Lane dodge, no parry. Slow lift-out creates recovery.
- Zemin Kıran: both fists rise together and hit the ground, sending a low five-
  segment stone ridge through the lanes. Jump as the fists descend; no parry.
- Taş Gülle: squat to pick up a darker stone, draw back, release toward a fixed
  lane, recover. Dodge or timed parry; parry shows a non-damaging return flight.
- Three-move sequence: fist, throw, ground break, with recovery gaps. A concrete
  no-hit input route is exercised by the audit, not merely assumed possible.

Targets are locked at launch. The user can select left/center/right; starting a
practice resets the proxy to center as stated in the UI. Inspect mode has no
hidden-player damage. No boss health, reward, production timing or save changes.

## Reference gates and repairs

Reopened the live Art Lab overview and knight/bear/Barry/Borin models before
editing; read Barry's shoulder/elbow/forearm/palm rig and Borin's fixed-length
hammer-arm contact code. Concrete lessons: separate block masses, small head,
connected wrist/prop transforms, fixed bones and broad planes. Reopened the same
live references during final review (`output/oathkeeper/reference-comparison.png`)
alongside the retained silhouette/value structure. Motion boards, action extrema
and intermediate poses, ±90-degree profiles and front views were inspected,
plus actual desktop/390px inspection and collision scenes.

Thumbs now face inward. Animated hand pitch is attached to the wrist, and the
idle opposite hand does not inherit the attacking hand's overhead rotation.
The body crouch articulates the legs rather than pushing feet underground.
Contact meshes and hazard paths share hand sample functions. A small interpolation
error was reduced by denser fist contact samples (max 0.01075 world units).

Scene review found two integration issues and fixed them: a foreground fist was
painted behind the proxy, and the sword crossed the combat hint band. The golem
is now clipped into behind/in-front passes around player Z, while the combat
projection leaves a dedicated top status band. Moving props clip before the
bottom labels. The projectile has a distinct darker stone material for clarity.

## Optimization scope

Back keystone/moss decoration removed; structural back caps stay closed for side
volume. Yaw controls are bounded to -100..100 degrees, with front/left/right
presets. Torso attack yaw stays under 28 degrees and head counterturn preserves
frontal tells. No texture atlas, full-scene bitmap or production renderer change.

Static convex face topology and sword triangulation are reused. Only structural
sword colors retain extruded sides, so the hilt/pommel still have side thickness.
Solid backfaces are culled before projection; color conversion is cached. Paused
or unchanged geometry reuses the same uploaded vertex buffer. A foreground
combat pass is skipped unless geometry actually crosses the player plane.

The previous renderer submitted 2,978 triangles per model pass; current front
is 1,696 and the default quarter view 1,576 (about 43–47% fewer). The short
foreground interval of a punch uses two passes for correct overlap, sharing
geometry and one upload. These counts are per pass, not a claim that every
combat frame has half the total GPU work. Local changing-view microbenchmarks
varied roughly 4.7–7.3 ms after vs 10.4 ms in the initial measurement; these are
diagnostics, not device-independent FPS guarantees.

## Checks

- 14 move checks: bones, inward thumbs, path alignment, stationary hits,
  dodge/jump/parry and rejected early/unparryable parries, no homing, no-hit
  combo route, ground-impact cutoff, finite/planar geometry, deterministic clocks,
  30/60/120 Hz replay.
- 24 unchanged combat-core checks; desktop/phone browser checks.
- Existing emergence audit: shoulders buried, eye opening, planted wrist contact,
  trigger/scrub/pause/step/reset, no page errors or horizontal overflow.
- GPU split test: the union matches the unsplit actor alpha mask (one edge pixel
  beyond the diagnostic threshold); visible foreground exists at fist impact.
- Static cache test: 60 repeat draws create no new geometry and no new uploads.
- Art Lab: 35 reference symbols, 13 sampled models, no motion warnings.
- UI material checks pass. Broad UI system/action-role audits retain the existing
  unrelated Road Lab null `journey.nodes` failure.

Evidence is under `output/oathkeeper-moves/`; technical passes do not approve the
new animations aesthetically. Player remains a labelled capsule proxy, not a new
Jonathan model or actual knight-grip implementation.

## Native rider, full-size battle scene and fixed actor projection (2026-10-03)

This revision supersedes the proxy-player and old scene notes above. Combat Lab
now uses the actual shared mounted Jonathan/horse modules, with production
`proj`, `laneX`, `linS` and 11/s lane easing extracted by a checked mechanical
bundle. The canvas is 480x800; near lane centers are 90/240/390 and rider feet
remain at y=648. Native jump/duck poses supply live hitbox anchors. Model
inspection stays separate from combat and still has its own 480x540 viewport.
No production game loop, iframe, save access, rewards or normal gameplay edits.

The newly generated empty battle clearing is packaged at 960x1600 standard and
480x800 mobile, one selected manager-owned image (6,144,000 / 1,536,000 RGBA
payload bytes). Source prompts and lighting review are in the background brief.
Fullscreen preserves 3:5 at desktop and 390px widths; touch/swipe controls and
repeating attack sequences are available. The bigger boulder stays native.

The user's distortion report exposed per-vertex road projection on the golem.
The actor now uses one 56px/model-unit projection rooted at (240,500): hands,
elbows and feet retain their sizes at all depths. 3D articulation and the
behind/front player split remain. Contact positions inverse-map the same visible
hand point into road-world space; target lanes map back into model coordinates.
Each prop likewise has one root projection rather than perspective per corner.
Projectile active duration is derived from its new ground-contact trajectory.

Both live-reference gates were completed with knight, bear, Barry and Borin.
Fresh final comparison: `output/oathkeeper/reference-comparison.png`, including
neutral color, grayscale, silhouette and small scale. The retained wide torso,
separate squared shoulders/elbows/palms and compact head follow those references.
The former folding elbows were corrected with forward/outward lift waypoints,
fixed bone lengths and a stable bend pole; all three moves were inspected from
front and side through intermediate poses, not just endpoints. Final actual
desktop/phone scene, jump/duck debug shapes, left/right punches and neutral vs
battle sunlight comparison were inspected in `output/combat-v4/`.

Checks: 24 core tests, 14 move tests, 14 native-function parity checks, model
awakening audit, desktop/phone input and scene audits, local file startup,
fullscreen enter/exit, two repeated rounds, all three stationary hits,
dodge/jump/parry, and left/right targeted hit vs non-target miss. Projection
size/contact error is below 1e-10 pixels. Art Lab reports 35 reference symbols,
13 models and zero motion warnings. Cutscene/background and button material
audits pass. Broad UI system/action-role audits still stop at the pre-existing
unrelated Road Lab null `journey.nodes` fixture; no baseline was rewritten.
Candidate visuals remain subject to the user's review, not automatically approved.
