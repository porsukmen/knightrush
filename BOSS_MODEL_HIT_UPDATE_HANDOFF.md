# Boss Model-Hit Update — Memory-Wipe Handoff

Status: Bear-first prototype implemented on 2026-07-20; visible-bound paw geometry accepted on 2026-07-21; shared hit classes, Hydra swipe/pinch contacts, and Boss Lab builder added on 2026-07-21.

## Successful parry reaction

- Successful parries now have two explicit, independently editable profiles.
  `PARRY_STAGGER` (`id: 'parry_stagger'`) is the complete accepted reaction
  preserved verbatim: `.60` simulation seconds at `.30x`, white flicker, full
  body loss of balance and the approved Bear/Hydra/Turtle rebound values.
  `PARRY_COUNTER` (`id: 'parry_counter'`) is a fixed `.96` real-time reaction at
  `1x`: no white flicker, no whole-body kick/lean/shake, reduced anatomical
  rebound, and a short return shared by every species. Its ordinary limb impulse
  derives its normalized peak/return markers from fixed `.56s` and `.58s`
  endpoints. The lift therefore reads over about `.56s`, while the idle return
  has about `.38s`.
  `syncToLaneHit` keeps Bear Bite/High Shove, every Hydra struck-head pitch plus
  partner settle, and Turtle tube endpoints on that same absolute peak/return
  schedule. Bear single overhead paws retain their approved front-loaded
  `easeOut`. Larger Bear two-paw, bite, swipe, pincer and posture silhouettes use
  a dedicated synchronized clock without changing the `.96s` total. Ordinary
  large silhouettes retain their linear travel to normalized `.55`; actual Bear
  Bite alone now begins one shared eased recovery at normalized `.40`. The still
  rising captured arm pose is blended continuously toward idle, so torso, both
  arms and paws begin settling together without snapping at the overlap. The
  settle then consumes the complete remaining 60% of either profile rather than
  dropping the body late. World x/z return still uses `easeInOut` across the
  complete reaction. Turtle bite keeps its necessary two-stage recoil/retraction
  anatomy, but its stage ratios are stretched to the shared base peak.
  Camera shake, the square
  galaxy sparks and attack/combo interruption remain.
  `PARRY_REACTION_PROFILES` is the registry and `parryReactionProfile(reaction)`
  is the only lookup path. Every reaction captures `reaction.style` at contact,
  so changing the debug option cannot alter an in-flight animation.
  The debug settings sheet exposes `PARRY STAGGER`: ON selects the preserved
  profile; OFF selects the fast counter profile. It defaults OFF.
  `validateEncounterHierarchy()` rejects mutable/misordered profile clocks and
  rejects any fast profile that regains slow motion, flicker or species/body
  stagger. Both profiles therefore share one stable duration across all species.
- `doParry()` captures the interrupted move, strike animation, contact point and
  contact side plus the exact normalized strike pose in actor-owned
  `parryReaction` state before the existing interrupt sends the complete attack or
  combo to full recovery. Rebound therefore begins at the accepted parry frame,
  never by completing the strike first. A parried combo never cues its next step.
- Parry start progress is hazard-owned, never inferred from the actor's current
  `stateT`. Scheduled frame hits pass their authored impact pose (`strikeT=1`)
  even when the 75ms input/grace resolver runs after the actor entered recovery.
  Model-contact hazards pass the exact captured `lastProgress`; continuously
  swept hazards pass their exact `raw` contact progress. This distinction removes
  the intermittent Middle Bite recovery-pose teleport without snapping physical
  paws/heads away from their actual parry point.
- Slow motion scales the normal simulation clock; collision, animation, particles
  and recovery do not gain a parallel timing system. The initial hit-stop remains
  deliberately tiny so the anatomical rebound is visible instead of frozen.
- Every articulated reaction lazily captures its exact first rendered parry
  frame. Anatomy then follows one monotonic path: captured contact pose ->
  reflected/raised target -> literal idle pose. Do not restore a reversing strike
  clock plus a decaying recoil offset; that combination caused the old start
  teleport and down/up/down return.
- Bear recoil edits the complete selected shoulder/elbow/paw chain. Single hits
  raise the contacted arm higher. Rebound targets are constructed shoulder-to-paw
  first, then the elbow is placed halfway along that exact segment: raised arms are
  always completely straight, either vertical or diagonal, never independently
  bent at the elbow. The straight-down one/two-lane attacks
  (`strike_paw_left`, `strike_paw_right`, `strike_double_paw`) lock the contacted
  shoulder to idle X. Whichever arm was actually parried keeps an editable,
  restrained `3.2U` outward spread: midway between the rejected perfectly
  vertical silhouette and the older excessive diagonal. Diagonal
  targets remain exclusive to swipes and other direction-bearing moves. On
  two-lane crushes the contacted arm uses full rebound;
  its partner uses the same straight chain at 55% height and still rolls 78%
  toward its visible sole. Traveling swipes also lift/roll the free arm by a
  restrained 32%/50%, while ordinary one-lane hits use 40%/62%, so the free paw
  reacts to the body stumble without competing with the reflected attacking paw.
  Every free-arm lift starts from its idle shoulder socket and goes vertically
  upward; it never inherits the attacking swipe's diagonal contact socket.
  Pincers raise both arms fully. Swipe direction
  still selects the side the paw came from. Every raised/rebounding paw rolls through
  its own lazy cached-2.5D
  clip until the sole faces the camera: four digital pads, a broad central pad
  and the claws remain readable in normal and white-flicker variants. The arm
  sockets and both live bones remain authoritative. All values remain in the
  shared Bear sub-profile.
- Bear bite and the three-lane duck frame hit share a dedicated cached-2.5D
  parry pose. The Bear rises on its hind legs, spreads both forelegs upward and
  pitches the skull back. The re-authored head atlas hides the eyes and keeps the
  nose on the far/top edge, but no longer substitutes the old long fully-closed
  underside. The current `8U` burgundy cavity, stepped upper/lower teeth, dark
  root gums, light chin and `#80604a` centre shade foreshorten and remain visible
  throughout the upward pitch; throat blocks attach beneath that open jaw.
  A dedicated staged clock first pulls the skull continuously out of its exact
  bite-contact pose, then raises the body/head/arms into the rear-up pose. This
  prevents an idle-head teleport before the pitch. It has normal and
  white-flicker variants. High Shove starts this skull pitch on its first reaction
  frames and drives both straight raised forelegs from that same head-pitch clock,
  so the paws travel back/up with the skull rather than visibly lagging it. They
  also settle with the High Shove skull. Actual Bite recovery is now a unified
  body clock: at normalized `.40`, torso rear-up, both articulated arms, paw
  pitch, skull descent and jaw closure all enter recovery. Torso and arms use a
  visible smoothstep settle over the complete remaining `.60`; the skull uses
  the same natural curve through `.40 -> .75` instead of the former fast
  `easeOut`. Collision
  and attack timing remain on the existing frame-hit contract. Actual Bite
  reactions hand the returning head from the cached 2.5D atlas to
  the live frontal mouth as soon as pitch reaches the atlas' frame-zero range.
  The atlas is no longer full-open-only. It owns separate lazy rise and return
  clips; each of the ten return angles contains its matching jaw opening. Head
  angle and mouth therefore change on the same cache frame instead of two
  independently rounded axes producing a one-frame lead/lag. The last two return
  cells share frontal skull topology, so the former short underside cell cannot
  snap into the much taller live muzzle on the following frame.
  `biteJawCloseStart:.40` exactly matches skull recovery start, and
  `parryBearBiteJawOpenAmount()` eases the jaw to fully closed at the skull's
  `.75` return endpoint. The live frontal handoff therefore preserves the
  current jaw opening instead of hiding the close until the final frames. The
  cached rig now remains authoritative down to its true frontal endpoint
  (`.015`) rather than handing off at `.10`. Its closed frame is aligned to the
  live muzzle. Bite pullback deliberately remains locked after reaching the neck
  socket: releasing it during body recovery reintroduced the strike's long
  contact `headY` and visibly dropped the whole skull below the torso. Reaction
  cleanup changes that locked zero only to the idle breathing offset (under
  `.35U`), not back through the attack path.
  The snarl floor is multiplied by the
  same jaw clock, so neither `parry_stagger` nor `parry_counter` can retain an
  open mouth and teleport to closed idle on reaction cleanup. High Shove is not
  routed through this Bite-only jaw clock.
  The three-lane jump keeps its normal reaction, but its
  authored dirt ridge is suppressed once parried so terrain art never plays
  backward; already emitted particles continue independently.
- The live 2D Bear mouth is an isolated editable rig (`BEAR_MOUTH_2D` /
  `drawBearMouth2D`). Its `8U` cavity opens through `7.2U`, with deep-red
  mouth/gum/tongue layers, six symmetric stepped-pixel upper teeth (large outer
  canines plus incisors), four lower teeth, and a block-tapered articulated chin.
  All mouth planes share the exact centred `8U` width. Open cavity begins on the
  upper root row, eliminating every lip/outline/separator pixel above it. Upper
  and lower gums both use the photographed rebound colour `#2a0c11`, one canvas
  pixel, and draw in front of the teeth to cap both root rows visibly.
  Idle uses one physical dark pixel.
  Endpoint-rounded rectangles share snapped `top`, `jawY`, cavity, tongue, gum
  and root anchors. The live nose endpoint and upper root additionally share the
  exact snapped `snoutY+9.8`, preventing their brown gap from flickering 0/1
  pixels during motion. Tooth bands overlap by `.38U` and contain a continuous
  spine. Chin tiers overlap by `.7U`; the base uses outer-muzzle `#9b795b` and
  the sole centre panel uses nose-adjacent `#80604a`. The removed warm `sun`
  inset remains removed. Every outer/inner ear pair also shares one snapped Y
  anchor, so inner colour squares cannot jump a frame before their ear shells.
  All Bear `tele_*` states open through the photographed former full maximum
  (`5.2U`), stored as editable `hesitationDrop`. Because the live mouth applies
  its own cubic ease, pose sampling uses `inverseEaseInOut` so the endpoint is an
  exact physical `5.2U`. Every `strike_*` begins at the new `7.2U` maximum.
  `strike_bite` then uses the authored impact-closing bite clock.
  Swipe and ordinary recovery close the jaw through return. Live and rebound gums
  use restored full-width foreground rows directly over tooth bases. Pitched
  rebound frames anchor the lower row at `jawY-.34U`, ending exactly on `jawY`;
  it remains visible while physically attached to the articulated chin.
  The pitched cavity begins on the exact upper-root edge.
  Head and paw atlases rasterize on a crisp `6x` source grid, snap every source
  endpoint, and composite with nearest-neighbour sampling rather than smoothing.
  Each angle frame selects one opaque view instead of cross-fading two textures;
  paw silhouettes and pads use solid stepped pixels rather than soft polygons.
  Every newly authored live/cached mouth plane (cavity, tongue, gums, teeth and
  muzzle shade) participates in Bear `hurtFlash`; normal frames retain the
  approved palette and counter flicker frames select the white palette.
  Combat clocks and contact timing are unchanged.
- Hydra captures all three rendered endpoints before recoil. Ordinary bites move
  the selected head straight back to its stable socket x and only moderately
  upward; the centre head therefore never drifts sideways. Its local endpoint and
  skull pitch now share a slower Hydra-specific rise instead of reaching the
  socket while the root is still at contact depth. A lazy cached normal/white
  fourteen-frame proportional serpent-head pitch grows upward from
  the fixed neck socket, hides the eyes, and exposes a broad closed lower-jaw
  underside with restrained ventral bands and a broad closed far mouth. The atlas
  reuses the live dark-green neck/body palette, so the alternate perspective
  reads clearly without becoming a separate pale model. Its larger working
  canvas is quantized to broad two-atlas-pixel cells and only three large ventral
  plates, matching the live Hydra's coarse, low-detail pixel language. Horizontal
  block snapping rounds inward and the cache draws at `12U` wide, keeping its
  outer edges aligned with the ordinary live head. Both side frills overlap the
  skull by one coarse cell, so neither can detach during quantization. The
  underside preserves the live head's broad upper-jaw / narrower lower-jaw
  proportion, including a closed far-mouth band matching the ordinary `6U`
  skull width, and postpones the sharp taper until the throat. All fourteen
  equally spaced angle frames contain a complete attached skull, mouth, jaw,
  frills and throat; no interpolated part is allowed to collapse between coarse
  rows. The reaction clock owns the easing, so reverse playback during lowering
  traverses those frames evenly instead of rushing through malformed middle
  angles. During lowering a front-loaded cubic crossfade makes the ordinary
  stepped upper/lower jaw readable on the very first descending atlas frame and
  completes it before the head is halfway down. Eyes use the live model's exact `1.5U`
  footprint in every visible cached frame, so they fade in without growing at
  the atlas-to-live handoff. Front-angle jaw rows remain part of the cranium
  (`headBottom` begins at atlas y `32`) rather than being misclassified as
  throat, keeping the face-bearing skull at full live height through every
  transition frame. The broad cranium separately ends at `bodyBottom`, which
  reaches the live skull/jaw seam y `26`; lower pitched rows fade by
  `1-faceMouth` instead of remaining full-width behind the incoming front jaw.
  Explicit fourteen-entry top/body-bottom key arrays give neighbouring
  cranium frames the monotonic logical-height sequence
  `6,8,8,10,10,12,12,14,14,14,16,18,18,18`; independent rounding can no
  longer re-shrink the frame beside a corrected pose.
  The visible underside is a fixed `10`-atlas-pixel jaw plane:
  during lowering it translates from y `8` toward y `22` without changing
  height, carrying all three ventral plates, then hands off around the face
  centre to the stepped live jaw and fades by the same ownership clock. It is
  never repainted over an increasing
  number of skull rows. The stepped jaw's combined `5.1`-pixel height is capped
  at `headBottom`, preventing middle frames from extending a chin down the neck.
  The short throat overlaps the final live neck joint by only one coarse row at
  full pitch (`headBottom=22`, `socketBottom=24`). The live segmented neck owns
  the remaining length, so no duplicate dark neck hangs below the turned skull.
  Presentation lowers the cache by `pitch*1U`, aligning that short overlap to
  the live socket without reopening a gap. Both side frills use compensated
  source heights and retain the live `1.8U x 2U` screen footprint through all
  fourteen frames, so they cannot shrink during lowering and enlarge at handoff.
  Head lowering consumes only the first `.78` of limb-return progress
  (`headLowerReturnSpan`), crossing middle atlas imperfections faster while the
  body stumble and total reaction duration remain unchanged.
  Nearest-neighbour drawing keeps every edge sharp. The explanatory block sketch
  is treated as an anatomy guide, not literal final geometry.
  The reaction returns to the current live idle sway endpoint, eliminating the
  last-frame unswayed-to-swayed teleport. Three-head frame hits pitch all heads.
  On twin/pair bites only the head nearest captured `contactLane` rebounds and
  the partner settles to idle. Swipes reflect the selected head toward the side
  it came from, while pincer heads separate outward and upward. During every
  selected-head parry, including `parry_stagger`, the segmented neck removes its
  authored sinusoidal attack bow and interpolates directly from fixed body socket
  to skull; side heads therefore recoil on a straight chain instead of an S-curve.
  During return, that idle bow is multiplied by the shared limb-return clock and
  grows back continuously, preventing a straight-neck-to-idle curve snap.
- Turtle bite heads rapidly retract through the complete rendered neck into the
  shell through two explicit stages. Both profiles now complete this inward
  motion in about `.29s`: a fast physical knockback removes the first
  quarter of the extended neck while preserving skull size, then the remaining
  neck retracts and the skull shrinks by a restrained 13% as it crosses the shell
  mouth. It holds hidden during the stumble, then re-emerges through the exact
  idle socket without replaying the attacked lane. In the fast counter profile,
  re-emergence no longer waits for the shared limb-return clock or nests a cubic
  ease that hides all early motion. `biteRevealStart:.50` begins the skull exit at
  the midpoint of the total reaction and applies one `easeInOut` across the full
  remaining `.48s`, reaching idle on the same unchanged final frame.
  Tube-pair, boiler, traveling-flame and pincer hesitation rendering records the
  last endpoint that was actually drawn for every indexed rope. Parry snapshots
  those per-move endpoints before combo interruption can replace the move, then
  rebounds each attached rope from contact to that exact hesitation pose before
  retracting. Thus tube pairs recover their overhead tell, while traveling-flame
  and pincer ropes recover their authored entry/tell direction; Steam, whose
  ropes have no visible tell, uses the overhead fallback. Both left and right
  two-lane variants use the same indexed path. The authored-time/pixel-snapping
  experiment remains reverted: tube breathing and unsnapped control points stay
  on the prior animation. Full wall-time heat wiggle remains active in
  hesitation, strike and either parry reaction. Shell-wheel is explicitly exempt and
  keeps its approved return animation.
- Turtle posture break owns a separate editable `TURTLE_BREAK_POSE`. The skull
  leaves the centre socket, drops while sliding toward the visible screen-right
  foot, and rolls onto its side. Its neck collar remains the rope endpoint; eight
  articulated neck segments morph from the direct chain into a loose L running
  down from the socket and then across to the grounded skull, with a small sag
  instead of a rigid diagonal. The same normalized pose is reversible by
  `breakRecover`, so recovery reconnects through the authored path without a
  detached or teleported head.
- Boss/miniboss white flicker is reaction-profile-owned while the reaction is
  active. `parry_stagger` owns the white/normal cadence; `parry_counter` forces
  it off, so the ordinary continuous hurt tint cannot leak into the fast return.
  Turtle's two small lower side-rim tabs are shell anatomy, not flesh; they remain
  dark through `hurtFlash` so no detached white squares appear beside the shell.
- `parrySparkCloud()` is an edge-on galaxy of small square sparks. The long thin
  disc is perpendicular to the attack-to-knight vector, grows equally to both
  sides of the contact centre, and has a restrained symmetric central bulge.
  It reuses the bounded generic square-particle update/draw path.
- Parry reaction recovery owns world travel as well as joint recovery. The exact
  strike `x/z` is reconstructed from captured `strikeT`, then interpolated to the
  actor's idle lane/depth during the selected profile clock. Never return only the
  skeleton and leave the actor at contact depth; that causes an idle teleport.
- While a combo is interrupted, `sequenceIndex` still advances to its terminal
  step for state/budget completion, but presentation is pinned to
  `parryReaction.move`. Swipe contacts rewind from captured strike progress and a
  combo bite can never borrow the combo's final step pose or contact targets.
- Bear stumble is a bounded whole-body lean plus damped local shake. Paw recoil
  uses the configured shoulder-relative `limbBack/limbLift` target and
  `elbowBack/elbowLift` target; bite-family arms use their own raised target. Avoid
  stacking another screen-space limb translation on top of this joint motion.
- Body return and limb hold use separate clocks. `returnStart` begins moving the
  boss away from contact early, including a short depth kick, while
  `limbHoldEnd` keeps the attacking anatomy at its reflected opposite-and-up
  position. Never hold the complete boss at contact merely to hold the limb.
- The impulse now has an extended balance-loss hold: it reaches peak quickly and
  keeps the limb/head at the reflected position through most of the reaction.
  `reboundDir` is captured from
  `sign(sweep.from-sweep.to)` and also drives the boss root lean/kick, so the large
  limb reflection visibly pulls the boss off balance instead of moving in isolation.
- Hydra recoil is applied after contact aiming and sampled model-head overrides;
  applying it earlier lets those authoritative targets erase the visible head
  bounce. Its captured endpoint moves to the configured socket-relative target;
  `headBack` is used only by directional swipes/pincers and `headLift` is shared.
- Traveling-swipe impulse is explicitly diagonal. Its horizontal component uses
  `sign(sweep.from-sweep.to)`, so the limb returns toward the side it came from;
  its vertical component always lifts. Bear applies this to the complete
  shoulder/elbow/paw chain and Hydra to the final endpoint of the complete
  segmented neck. Keep these species distances independently tunable.
- At the exact final reaction frame, Bear, Hydra and Turtle render a literal idle state
  rather than the old strike name with zeroed coefficients. This removes the
  last-frame rotated paw/contact-head mismatch that otherwise becomes a visible
  teleport when `parryReaction` is cleared.
- Boss Move Lab keeps its normal attack playlist and controls unchanged. A real
  successful parry input during a live lab attack invokes `doMoveLabParry()` at
  physical/frame contact: it plays the production reaction, interrupts the move
  or full combo, and finishes through ordinary recovery without damage, rewards,
  chain stacks, taming progress, fake playlist rows, or preview buttons.
- Boss Move Lab never enables the legacy `debugParryInputFrozen` simulation stop,
  even if the debug-run freeze toggle is on. The geometry/result snapshot remains
  available, but freezing at input prevents the attack from reaching physical
  parry contact and makes the boss appear permanently stuck before rebound.
- Boss/Miniboss Move Lab pause controls include an `AUTO PARRY` toggle, disabled
  by default and also bound to `A` while the lab is paused. It is an input
  assistant, not a separate collision or animation path: model hits call the
  existing live spatial evaluator and press only in `VIOLET`/`BURGUNDY` while
  the knight volumes overlap the correct lane; frame hits require both their
  symmetric purple timing window and a threatened current screen lane; legacy
  traveling sweeps press at their first truthful physical contact. The press
  goes through `playerAction('parry')`, so normal snapshots, interruption,
  rebound and recovery remain authoritative. Each hazard owns a one-shot guard,
  and changing/restarting moves preserves the lab-level toggle.

Implemented checkpoint result:

- Bear paw mauls, double-paw strikes, traveling low/high swipes, and pincers use swept circles derived from each rendered paw's complete palm-and-claw bound.
- The Bear's approximately square 10.4px paw uses a 5.2px square-inscribed lethal circle: the red circumference meets the middle of the paw sides while corner/claw pixels may pass harmlessly. Normal single/double paw gold is 1.76x red. Traveling swipe gold was tightened from 1.67x to 1.58x, uses a harder 0.045s viability target, does not preserve the earlier broad reference window, and can grow no farther than 1.72x in deep play. Pinch alone uses 1.84x gold plus a 0.04s profile-owned timing bonus because playtesting found the hard two-shell PERFECT too narrow. Lethal red geometry is unchanged for every family.
- Authored toward-camera limb growth remains active. Model-driven maul growth is tempered by a 0.72 release multiplier; traveling low/high and pincer growth uses the same 0.90 multiplier (larger than the accepted 0.82 pass, still below the original full-size presentation). Low paws move their centre as radius changes so their upper core edge remains exactly at `MODEL_JUMP_CLEARANCE_Y`; high paws do the opposite so their lower edge remains at `MODEL_DUCK_CLEARANCE_Y`. Recovery reverses the sampled scale. Quake/shove animation sizing is untouched because those attacks remain frame-driven.
- Traveling swipe contact is centred on the rotated visible palm/claw mass, not a wrist or hidden claw-root proxy.
- Bear pinch is a physical two-sided swipe with a clap-specific posture contract. Its paws approach upright with their lethal top edge at `MODEL_PINCH_WALL_TOP_Y` (538px), preventing the rider from jumping across either individual outer hand. Over the final physical approach they rotate their claws inward and lower; when the red cores meet, both top edges are exactly `MODEL_JUMP_CLEARANCE_Y` (572px). A rider centred and clearly above the profile-owned 70px normal-clear height when the paws physically meet resolves SAFE even if the gold shells never touch. Both gold shells touching an airborne rider inside the normal input window resolves PERFECT instead, so the accepted gold graze may be lower than an ordinary clear. Grounded, excessively early, late, and outer-paw contacts remain lethal.
- `closing_jaws` uses the shared standard-swipe travel of 0.70. Cave King's inserted pinch uses 0.56, exactly matching its neighboring low swipe, so every shared loop/tempo multiplier preserves speed parity.
- Contact is resolved immediately from the shared presentation/Bear pose sample; no scheduled impact frame remains on those steps.
- `center_bite`, every `strike_bite` combo step, `cave_quake`, and `high_shove` remain on the supported frame-hit resolver.
- Authored and generated combos inherit each step's collision contract without a parallel state machine.
- Traveling-swipe PERFECT is two-stage: valid gold contact arms `PENDING`, but the red swept core stays lethal until the visible attack finishes. A late jump that cannot clear the approaching paw therefore becomes `LATE HIT`; only surviving the complete sweep confirms PERFECT and awards the counter. Bear pinch is the deliberate exception: its terminal clap immediately resolves either airborne SAFE or two-gold PERFECT, because its post-clap settle is not a second attack.
- Model-driven attacks now have one shared deep-tempo viability contract. At hazard spawn, `configureModelDodgeViability` samples the exact visible gold and red contact clocks against a cached upright rider and evaluates `usable = perfectWin + profileBonus + (redRaw - goldRaw) * travel - clearanceTime`. It normally preserves the larger of the move's accepted reference budget and 0.060s usable time after reserving one 30 FPS frame. It first adds at most 0.060s of runtime timing bonus; only if that is insufficient does it grow the visible gold aura in 0.03 steps, capped globally at 2.06x. Traveling swipes intentionally override that policy with a 0.045s target, no reference-window preservation, a 1.58x authored shell, and a 1.72x cap. The lethal red core is never enlarged or reduced. A final model-contact travel floor prevents the boss model from outrunning the knight: 0.28s for ordinary mid-lane paws and 0.34s for traveling low/high posture attacks. Pinch is deliberately excluded because its accepted physical-clap SAFE/PERFECT rules are already terminal and independently tuned. Runtime compensation clones a contact profile; all shared definitions remain frozen.
- Shared frame collision names are `frameOneLane`, `frameTwoLane`, `jumpOneLane`, `duckOneLane`, `jumpTwoLane`, `duckTwoLane`, `jumpAll`, and `duckAll`. `MINIBOSS_HIT_CLASSES` contains exactly these eight frame classes. `BOSS_HIT_CLASSES` extends them with `modelOneLane`, `modelTwoLane`, `lowSwipe`, `highSwipe`, and `pinch`. There are deliberately no frame swipe or frame pinch classes: traveling swipes and pinches are always resolved by physical visible geometry. Bear and Hydra use articulated contact rigs; Turtle keeps its accepted continuously swept visible shapes without becoming a hidden frame hit. Positional mechanics still preserve exact left/middle/right timing, and startup validation rejects a traveling shape assigned to a frame class.
- Move Lab draws the exact red core, gold near shell, always-live cyan player hurt capsules, prior/current swept positions, phase clocks, input age, FPS, simulation speed, and verdict reason. Model circles preview during tells and continue through the rest of a resolved strike. Pending/hit/late-hit/perfect snapshots are colored separately instead of freezing live geometry. Every model red hit captures its death frame; a pending dodge that becomes lethal replaces its earlier gold-contact picture. The thick red corridor shows the tested sweep and a white crosshair marks the computed core-to-knight contact point. The head `PERFECT NOW` lamp predicts against cached pre-dodge player volumes so jump/duck posture cannot move its target, uses each contact profile's actual timing bonus, uses the physical two-core clap for pinch, and stays hidden when no future gold contact exists. While paused, the lab provides tap and keyboard controls to select/restart any move, run at 0.25x, 0.5x, 1x, 1.5x, or 2x, and change the test stage in ±1 or ±10 steps (`[`/`]`, with Shift for 10). Stage changes rebuild every lab move through the real encounter-tempo and viability paths, update cycle progression and procedural-combo depth, and restart the same selected move. The boss definition and arena captured when the lab opened remain pinned; changing stage cannot reroll the boss.
- Boss Lab is a direct debug button rather than a checkbox. It opens a boss picker, starts the chosen boss with its home arena pinned, and uses only plain player-facing attack names. The pause panel's MOVESET button opens a two-column checklist of every attack, shows each attack's `BOSS_HIT_CLASSES` ownership, applies exactly the checked attacks, and optionally loops that sequence indefinitely. Custom sets do not receive an unrequested procedural random chain. The old result list is intentionally absent: model PERFECT, HIT, and gold-then-red LATE HIT outcomes instead leave a geometry snapshot. HIT snapshots show a white crosshair at the computed meeting point between the swept red core and the knight hurt capsule.
- Arena updates now receive background ownership centrally: every particle created by `StageDefinition.arenaUpdate` is marked `behindBoss`, and boss-rise spray follows the same contract. Hydra bubbles, Turtle embers, and future arena particles render before bosses without species-specific fixes.
- Startup hierarchy validation covers missing rigs, unknown IDs, invalid dimensions, and unfrozen contact data.
- Browser traces verified immediate HIT and physical PERFECT outcomes at 30/60/120 FPS for paws, low/high traveling swipes, and pincers. The pending-clearance and pinch-boundary checkpoints remain recorded below. After the harder swipe pass, cycle-10 scans still found non-empty PERFECT bands at every tested frame rate: Bear low swipe produced 6/8/8 sampled inputs at 30/60/120 FPS, while Hydra low head swipe produced 3/3/4. The runtime shell remained 1.58x for both species rather than regrowing. Browser interaction also verified direct boss selection, plain names, an exact one-move Hydra custom set, real loop restart, stage-30 rebuilding with Hydra pinned, a model `hydraRightHead` hazard, immutable definitions, and background-only arena/rise particles. Continue tuning sampled presentation geometry or the named viability caps; do not change unrelated pacing/progression data as part of collision work.
- Hydra's converted two-head pinch was separately scanned at 30/60/120 FPS: grounded centre contact HIT at every rate, while centred jump inputs produced non-empty SAFE/PERFECT ranges at every rate. Its ordinary one/two-lane head bites remained `frameOneLane`/`frameTwoLane`; only traveling side-head swipes and the pinch became model-driven.

Read this file before editing boss combat. It records the player's intent, the current technical baseline, the Bear-first migration, and the architecture required to scale the result to future bosses.

## 1. The player's vision

Boss combat should feel closer to *Clair Obscur: Expedition 33* and *Sekiro*: a giant boss visibly pulls an attack back, hangs in the anticipation, releases it, and the player escapes the physical attack at the last possible moment. The attacking paw, limb, body, weapon, or ground wave should be the thing that hits. A successful dodge should look like the model narrowly missed the rider, not like the player pressed a button on a hidden impact frame.

The hesitation/pull animation is artistically important. It creates uncertainty and tension, especially in later loops. Preserve that animation language. The upgrade is about making release and contact physically truthful, not removing anticipation or making every move uniformly fast.

The combat system must remain hybrid:

- Bear is the prototype and the only boss to migrate first.
- General Bear paw, body, pincer, and traveling swipe attacks should become continuous model-driven attacks.
- Bite attacks remain deliberate frame-impact attacks. This includes `center_bite` and every combo step using `strike_bite`.
- “Upper attacks” means the stationary three-lane `jumpduck` group: the full-road attack the player jumps and the full-road attack the player ducks. For Bear these are `cave_quake` (`jumpAll`) and `high_shove` (`duckAll`). Both remain frame-impact attacks. Traveling low/high swipes are a distinct group and are model-driven.
- A single combo may contain both collision styles. Each step chooses its own contact contract.
- The switch must be seamless: no change to attack selection, groups, guarantees, weights, combo cost, hesitation, tempo, chain, scoring, or run progression merely because collision ownership changed.

The immediate goal is responsive physical dodging, not a new parry button. A real counter/parry system can be added later as a separate defensive action after model contact feels correct.

## 2. Current combat baseline

The game is a single HTML file: `KnightRush.html`.

Important current symbols:

- `drawBearNatural(...)`: monolithic Bear animation and drawing. It calculates pose-like values internally but does not expose named joints.
- `BEAR_DUEL_ATTACKS`: Bear attacks and authored combos.
- `UNIVERSAL_ENCOUNTER_HITS` and `CombatMechanicSet`: shared lane/posture mechanics and construction-time normalization.
- `EncounterActor`: shared boss/miniboss runtime state.
- `moveContactXs(...)`: obtains the current hidden lane/sweep contact position for renderers.
- `spawnHazard(...)` / `resolveHazard(...)`: fixed impact-time lane and posture attacks.
- `spawnSweepHazard(...)` / `resolveSweepHazard(...)`: continuous traveling attacks with swept-segment collision.
- `updateBoss(...)`: attack state machine and hazard spawning.
- The boss draw block near `queueWorldDraw(boss.z, ...)`: independently calculates presentation depth, lunge, screen position, animation name, and normalized animation time.
- `drawMoveLabMarkers(...)` and `drawMoveLabPerfectTimer(...)`: current collision diagnostics.
- `biteJawAt(t)`: shared bite-impact visual clock. Preserve it for frame-hit bites.

Current data flow:

`attack definition -> hidden lane/sweep hazard -> contactXs -> renderer aims art at hazard`

Sweeps already update continuously and test the complete segment traveled since the previous frame. That prevents tunnelling and is the best existing prototype. However, the hazard still owns the path and the visible paw/head follows it. The target flow is:

`attack definition -> shared presentation + species pose sample -> renderer and collider -> hit result`

The model should become the source of contact truth, while collision continues to use stable simple geometry rather than pixels.

For an active model-driven attack, contact is immediate: if the swept visible paw/limb collider touches a player hurt volume at any moment, the player is hit and dies under the current damage rules. There is no hidden scheduled impact frame and no waiting for `travel` to end. `travel` controls animation duration; the moving model controls contact. Bear pinch is the explicit posture exception added after playtesting: while centred and airborne, approach contact is held until the two visible cores physically meet; the clap then resolves SAFE above its 70px normal-clear height, PERFECT on valid two-gold timing, or HIT. Outer-paw contact is never deferred.

## 3. Target hybrid contract

Do not replace every hazard or add a parallel boss state machine. Extend the existing step/hazard pipeline with one optional semantic contact key.

Recommended minimal data contract:

```js
// Opted-in physical Bear step
{ ..., contactId:'rightPaw' }

// No contactId: keep the current frame/sweep resolver
{ ..., strike:'strike_bite' }
```

`contactId` is a string, not an embedded collider object. A Bear contact rig maps that string to one or more named joints and collider shapes. This avoids repeating radii and geometry throughout attack tables, keeps random-combo cloning cheap, and gives future balance work one source of truth.

Suggested Bear contact IDs:

- `leftPaw`
- `rightPaw`
- `bothPaws`
- `swipePawLeft`
- `swipePawRight`
- `pincerPaws`

Exact names may change during implementation, but one optional step key plus one species rig is preferable to new subclasses or many per-attack parameters.

`EncounterDefinition` may gain one optional `contactRig` function/object. Only Bear should register one initially. When a step has both a `contactId` and an active encounter rig, `updateBoss` creates a pose/model hazard. Otherwise it follows the current hazard path unchanged. This is the compatibility seam that lets one combo mix model-driven paws and frame-driven bites naturally.

## 4. Shared presentation sample first

Before changing collision, extract the boss presentation calculation currently embedded in the render closure into a pure reusable helper. It must produce the exact values the renderer already uses:

- projected depth and scale;
- screen-space model origin;
- animation/state name;
- normalized animation progress;
- current move and contact targets;
- recovery/intro offsets where relevant.

Both update-side pose collision and rendering must consume this same presentation result. Collision must never call the renderer, and rendering must remain read-only. Do not leave one copy of lunge/depth math in update and another in draw; they will drift and recreate hidden hit frames.

This extraction is checkpoint one and should cause zero visible or gameplay change. Compare screenshots/Move Lab states before proceeding.

## 5. Bear pose sampler

Refactor Bear animation calculations into a pure sampler, for example `sampleBearPose(presentation, outPose)`. Reuse a preallocated pose object owned by the actor or rig; do not allocate joint objects every frame.

The sampler should expose only useful named geometry, not every pixel rectangle:

- shoulder/wrist/paw or paw/claw endpoints for each forelimb;
- jaw/muzzle if needed for debug, even though bites stay frame-based;
- any body edge genuinely intended to damage the player.

`drawBearNatural` should render from the same sampled coefficients/joints. The first version does not need a universal skeleton framework. A compact Bear-specific sampler plus the shared collider interface is enough. Generalize only after it survives the prototype.

Do not use per-pixel collision. A rig may expose a stable authored bound for the complete damaging model part, as Bear now does for its palm and claws. Cosmetic shading, fur noise, and particles must not silently change balance, but an explicitly sampled attack-part scale must resize its collider so model size and hit size remain truthful.

## 6. Collision geometry and update rules

Use a small shared set of primitives:

- circle for a paw/fist or wave point;
- capsule for a forearm, claw travel, or elongated limb;
- segment/arc band for the dirt shockwave;
- a grouped set of capsules for double-paw and pincer attacks.

Player collision should use a few posture-dependent hurt capsules for the horse/rider silhouette. Jump and duck should physically move or replace those capsules. Keep these volumes deliberately smaller and calmer than the art so animation noise does not produce unfair hits.

Each update:

1. Sample the dangerous geometry at the previous and current strike progress.
2. Sweep the primitive across that interval, not only at the current point.
3. Test the swept core against player hurt volumes and resolve a hit immediately on first contact.
4. Resolve each grouped attack only once.
5. Keep anticipation and recovery non-damaging unless an attack explicitly declares otherwise.

This preserves the current low-FPS safety of `resolveSweepHazard`. Results must agree at 30, 60, and 120 FPS and during deep-loop tempo scaling.

The visible model/effect and collision must use the same sampled path. Do not create a model collider and then separately force the paw toward an old `contactXs` path.

## 7. Dodge and perfect-dodge classification

For the first Bear migration, preserve existing controls, the 180 ms base input window, relic/miniboss modifiers, automatic counter behavior, and damage rules. Change the physical evidence used to classify the result:

- **Hit:** the swept attack core overlaps a player hurt capsule.
- **Safe:** neither the core nor the outer near-miss shell reaches the player.
- **Perfect:** the core misses, a slightly wider swept near-miss shell reaches the relevant player volume, and the correct dodge action was recent/active.

This keeps the current timing vocabulary while making a perfect dodge depend on a visible near miss. Do not make the window smaller just to simulate difficulty.

A later update may separate:

- ordinary physical dodge;
- perfect evade/resource reward;
- explicit parry/counter with its own input and parryable collider.

That later system should not be mixed into the first collision migration, because it would make responsiveness bugs hard to diagnose.

## 8. Bear migration matrix

Migrate one family at a time and test it in Move Lab before enabling the next.

### Model/effect-driven candidates

- `left_maul`, `right_maul`: attacking paw capsule.
- `left_center_crush`, `right_center_crush`, `twin_crush`: one or both visible paw capsules, according to the animation.
- `earthbreaker_rtl`, `earthbreaker_ltr`: continuous low paw swipe.
- `high_reaper_rtl`, `high_reaper_ltr`: continuous high paw swipe. These are traveling swipes, not the stationary `jumpduck` group.
- `closing_jaws` and the inserted `squeeze` step: two visible paw colliders closing inward, then the physical central snap/jump phase.
- Paw, traveling-swipe, and pincer steps inside `cross_execution`, `red_hunt`, `cave_king`, and random combos inherit the same contact IDs and resolver automatically.

### Keep frame-driven initially

- `center_bite`.
- Every combo step whose strike is `strike_bite`.
- The stationary three-lane `jumpduck` attacks: `cave_quake` (`jumpAll`) and `high_shove` (`duckAll`).
- Finishers and death cinematics.

Do not select collision mode by attack ID inside hot update code. Put the semantic `contactId` on reusable step definitions; combos then work without special cases.

## 9. Move Lab is the authority during migration

Upgrade Boss Move Lab before judging feel. It should render the exact sampled data used by collision:

- attack core in red;
- perfect/near-miss shell in gold;
- player hurt capsules;
- current and previous collider positions or a short swept trail;
- active/inactive state;
- animation time, strike time, input age, FPS, and final HIT / PERFECT / SAFE reason.

The existing yellow `PERFECT NOW` indicator should read the model hazard's predicted/contact geometry instead of assuming only an impact timestamp or authored sweep path.

Keep the old and new resolver available behind a temporary debug A/B switch while tuning a move. Remove that temporary flag and dead comparison code once the Bear migration is accepted; the permanent compatibility mechanism is simply `contactId` present versus absent.

## 10. Seamless implementation order

1. Capture baseline screenshots and Move Lab timing for every Bear move.
2. Extract the shared boss presentation sampler with zero behavior change.
3. Extract/refactor `sampleBearPose` and make `drawBearNatural` consume it, still with old collision.
4. Add shared player hurt volumes and primitive/swept intersection helpers.
5. Add one pose-hazard branch to the existing hazard array/resolver.
6. Prototype one simple paw maul.
7. Add exact Move Lab geometry and FPS diagnostics.
8. Tune and accept the paw maul at 30/60/120 FPS.
9. Migrate double paws, traveling low/high swipes, then pincer.
10. Verify hybrid authored and random combos.
11. Remove temporary A/B code, freeze rig/contact data with the other encounter definitions, and extend startup validation.
12. Only then decide whether to migrate Hydra or Turtle.

Do not rebalance attack weights, counts, tempo, hesitation, or perfect-window duration during these steps. Collision feel needs an isolated comparison.

## 11. Architecture, efficiency, and hierarchy requirements

- Reuse `EncounterActor`, the existing hazard list, attack state machine, shared tempo, and Move Lab.
- Add no Bear subclass and no new boss-specific update loop.
- Keep species artistry in the Bear pose/contact rig and generic geometry in shared helpers.
- Cache pose/shape scratch objects; avoid per-frame arrays, closures, and object churn.
- Keep render functions read-only.
- Freeze static contact profiles during the existing construction/freeze phase.
- Extend `validateEncounterHierarchy()` to reject unknown `contactId` values, missing rigs, invalid radii, and unfrozen static data.
- Swept tests are mandatory; point sampling is not an acceptable shortcut.
- Never make collision depend on fur pixels, particles, screen shake, or decorative offsets.
- An explicitly authored attacking-part scale may move and resize its named visual bound, and collision must follow both. Purely cosmetic fur/shading/particle changes remain non-physical.
- Preserve the current frame-hit resolver as a first-class supported path for bites, stationary `jumpduck` attacks, and bosses not yet migrated. It is not temporary dead code.

## 12. Can this scale to 40–60 bosses?

Yes, naturally—but not automatically.

The reusable part should be written once:

- presentation sampling contract;
- pose-hazard lifecycle;
- circle/capsule/segment sweeping;
- player hurt volumes;
- hit/safe/perfect classification;
- low-FPS protection;
- Move Lab visualization and diagnostics;
- hybrid fallback to frame hits;
- validation and performance rules.

Each boss still needs authored work because anatomy and attack character matter. A Bear paw, Hydra neck, Turtle shell/flame limb, sword tip, tentacle, and dirt wave should not be generated from the same fake path. For each new boss, an author must expose the meaningful joints/effect fronts and map its attacks to contact IDs. That is content work plugged into the shared engine, not a new combat system.

Similar body plans can reuse rig helpers—quadruped paws, humanoid weapons, serpent chains, radial waves—but each boss should retain individual anticipation, reach, recovery, and collider tuning. This is the correct tradeoff: shared rules make results consistent and maintainable; species-authored poses preserve personality and Expedition-style physicality.

Do not mass-produce dozens of bosses before the Bear contract feels excellent. Once Bear is accepted, implement one anatomically different boss (Hydra is a good stress test) to prove the interface is truly reusable before expanding the roster.

## 13. Acceptance checklist

The Bear prototype is complete only when all of these are true:

- Every migrated hit visibly intersects the same paw/wave geometry shown by Move Lab.
- A visible clean escape never becomes a hidden hit.
- A visible body intersection never becomes SAFE merely because an old impact frame passed.
- Perfect results are physical near misses plus valid recent input.
- Anticipation, hesitation, release, contact, hold, and recovery remain visually continuous.
- Results are equivalent at 30, 60, and 120 FPS and cannot tunnel at deep-loop speeds.
- Frame-hit bites and stationary three-lane jump/duck attacks behave exactly as before.
- Hybrid combos transition without duplicate hits, truncated steps, or recovery snaps.
- Attack grouping, targeting, guarantees, weights, costs, chain, counters, score, and progression remain unchanged.
- The Move Lab explains every verdict.
- No per-frame allocation regression or duplicated species state machine was introduced.
- Startup hierarchy validation covers every contact profile.

## 14. New-chat startup instructions

After a memory wipe, the next AI should:

1. Read this entire file.
2. Read the maintainer handoff at the top of `KnightRush.html`.
3. Read `GAME_BALANCE_DIFFICULTY_REPORT.md`, especially “Why perfect dodge currently feels frame-based” and “Recommended model-driven collision system.”
4. Inspect the symbols listed in section 2 instead of assuming the old architecture.
5. Treat the definition of “upper attack” as settled: it means the stationary three-lane `jumpduck` group (`cave_quake` and `high_shove`), not traveling low/high swipes.
6. Begin with the no-behavior-change presentation extraction, not a bulk collision rewrite.
7. Keep the user informed at each checkpoint and perform hierarchy, efficiency, reuse, dead-code, browser, and Move Lab checks after every migrated family.

This document is the authoritative handoff for the Bear-first boss attack update unless the player explicitly changes the vision.
