# Miniboss Frame-Hit Update Handoff

Status: frame-only miniboss fundamentals implemented and architecture-audited on 2026-07-21. The next session should author and tune the actual miniboss update without rebuilding collision architecture.

Separate persistent art handoffs: read `CACHED_2_5D_RENDER_HANDOFF.md` before any rotation/back/profile clip, and read `3DMODELRENDER_HANDOFF.md` before changing an articulated live-3D boss. Turtle's shell-wheel is the approved production 2.5D proof; Bear remains a lab-only live-3D reference. This does not alter the frame-only miniboss rules below.

## Settled direction

- Miniboss attacks use scheduled frame hits only.
- Minibosses do not use model contact rigs, traveling swipes, or pinches.
- Required collision vocabulary is ready for:
  - one-lane normal hits;
  - two-lane normal hits;
  - one-lane jump and duck hits;
  - two-lane jump and duck hits;
  - three-lane jump and duck hits.
- Existing miniboss balance, animations, timings, combos, rewards, progression, and counter-duel behavior have not been redesigned yet.

## Exact hit-class names

`MINIBOSS_HIT_CLASSES` contains only these eight frame classes:

- `frameOneLane`
- `frameTwoLane`
- `jumpOneLane`
- `duckOneLane`
- `jumpTwoLane`
- `duckTwoLane`
- `jumpAll`
- `duckAll`

`jump` means the attack is low and the knight must jump. `duck` means the attack is high and the knight must duck. The class records both posture and lane count; the attack step's `lanes` array records the actual left/middle/right placement.

Startup validation checks role, resolver, lane count, and posture. A miniboss step with a `contactId`, sweep, pinch, model class, wrong lane count, or wrong height fails immediately.

Model collision, physical swipes, and pinches are boss-exclusive. Boss classes also carry lane/posture metadata, so incorrectly labeled boss geometry fails the same hierarchy validation.

## Authoring mechanics already available

Use `MinibossCombatMechanics.attack(...)` or `MinibossCombatMechanics.step(...)`. Do not author miniboss content through the unrestricted boss factory.

`MINIBOSS_FRAME_MECHANIC_KEYS` is the single frozen allowlist. `MINIBOSS_FRAME_MECHANICS` is generated from that list by reference to the universal frozen specifications; it does not copy or manually restate their data. Add a future frame pattern to the universal catalogue and this allowlist once. Do not rebuild a second miniboss timing table.

Normal frame mechanics:

- `targetLane`, `singleLeft`, `singleCenter`, `singleRight`
- `pairLeft`, `pairRight`, `outerPair`

One-lane posture mechanics:

- `jumpTargetLane`, `jumpLeft`, `jumpCenter`, `jumpRight`
- `duckTargetLane`, `duckLeft`, `duckCenter`, `duckRight`

Two-lane posture mechanics:

- `jumpPairLeft`, `jumpPairRight`, `jumpOuterPair`
- `duckPairLeft`, `duckPairRight`, `duckOuterPair`

Three-lane posture mechanics:

- `jumpAll`
- `duckAll`

Authored raw tables are also supported. `MinibossCombatMechanics.normalizeSet()` infers the appropriate mechanic and hit class from `lanes` plus `height`, while preserving explicitly authored miniboss timings when requested.

## Runtime and Move Lab

No new collision resolver was added. The existing frame resolver already handles arbitrary one-, two-, or three-lane arrays with `mid`, `low`, or `high` posture rules. Telegraphs, perfect checks, Move Lab geometry, stage tempo, FPS behavior, and counter rewards therefore reuse the current path.

The miniboss state machine now always calls `spawnHazard(...)`. Old sweep spawning, body-sweep recovery, and sweep-render branches were removed as unreachable. Bosses retain their model and physical-sweep routes in the boss state machine.

Current Wolf, Mire Toad, and Imp tables normalize through the restricted miniboss
factory. Wolf was rebuilt on 2026-07-25 as a compact square-pixel 2D miniboss
based on its original silhouette. Its three one-lane bites and two
neighboring-lane pounces retain their accepted frame-hit timing and gameplay.
The discarded Crocodile table, encounter, renderer and pack view have been
removed rather than retained as a dormant alternate.

Wolf's obsolete 3D mesh, WebGL renderer, fallback face pool, combat sampler,
turntable, Move Lab spin entry, and obsolete experimental renderer were removed.
`drawWolf()` now owns the production pixel model: four readable jointed legs, a
long block-built tail, teeth, restrained fur patches/scars, bite animation, and a
plant/coiling/hesitation/release/two-paw pounce sequence. Miniboss collision is
still frame-only and is not derived from those visible joints.

Wolf pounce lazily builds one seven-frame cached 2.5D paw-pitch atlas. Only the
two front paws rotate: their four claws and underside pads face the rider in
midair, then return to the exact front orientation before impact. Recovery keeps
that front frame and retracts the same leg pose continuously. The tail root stays
hidden behind the rump, and bite recovery keeps the jaw closed instead of
replaying the strike opening.

Mire Toad replaced Crocodile on 2026-07-25 as the swamp miniboss. Its live hero
renderer is `drawMireToad()` and its follower back view routes through the same
model via `drawMireToadBack()`. The silhouette uses a neckless broad head/torso,
raised eye sockets, a restrained breathing throat sac, paired folded hind
thighs, two jointed front arms, five connected hind toes and four webbed front
toes. All four front toes use the same root width, tip width and pad size; only
their fan direction differs. Hind and front limbs are each drawn once. Hind
limbs remain behind the torso, while both front-arm chains render in the near
pass with their shoulder roots anchored at the outer body edge so they cannot
cover the mouth. Idle movement is deliberately limited to a
small throat breath and rare blink so the silhouette never swims. Both eyes use
the same centred socket/pupil construction and a clamped lane look. The face is
now built around real frog proportions: a broad upper skull, widely spaced eye
towers, fixed nostrils and a mouth spanning almost the full head width. Opening
the mouth raises and pitches the skull backward while the interior expands to
occupy most of the face instead of behaving like a small muzzle flap.

`TOAD_DUEL_ATTACKS` contains eight scheduled frame hits:

- three one-lane mid tongue lashes;
- two neighboring two-lane mid belly slams;
- three one-lane high bog globs requiring duck.

The encounter owns `ranged:true`, so tongue and glob casting never inherit the
shared miniboss approach. Belly slam supplies its own visual approach: the body
coils on the tell, follows a high arc toward the selected pair, lands with a
restrained squash and deterministic mud/ripple burst, then makes a smaller return
hop during recovery. Collision remains the selected pair's scheduled frame hit;
the moving drawing is never used as model contact.

Tongue lash is a prepared whip instead of a straight projectile. Through the
first `82%` of the tell the mouth stays closed: the cached face settles about one
local unit, trembles without changing atlas index, lowers inward brows and adds
short nose creases while retaining the normal closed mouth. Mouth launch uses
`easeOut((t-.82)/.12)`; tongue launch follows roughly 20 ms later through
the linear `clamp((t-.84)/.16)`. The scrunch overlay falls away cubically as
the mouth opens. The tongue has no raised hold or tremble. Its source curve uses 96 samples, but
presentation always resamples the visible portion into the same 64 fractional
render segments. Its upper end climbs well above the eye line and curls
slightly downward, then opens directly into a high
lane-specific downward whip. There is no S coil, forward-facing bulb, shadow
hook, or cached tongue atlas. The canonical mouth renderer suppresses its
ordinary interior tongue strip during this move, so only the attacking tongue
exists. Its `.24`-second strike uses a hold-remapped `easeOut`, reaching the rider
only at the scheduled frame hit and turning launch plus impact into two immediate beats.
At the tele/strike boundary, the shared `SFX.slash()` is the first beat and the
tongue is already at its raised peak. `TOAD_TONGUE_PEAK_HOLD=.07` preserves that
peak for about `.017` seconds (one frame at 60 Hz); the remapped `easeOut` then
uses the remaining travel and reaches the rider on the second beat/frame-hit.
Recovery retracts the struck curve completely during its first `.58`;
the mouth remains fully open throughout that interval and only then closes, so
the tongue can never be cut off by the jaw.

Belly slam travel is `.74` seconds with a `1.16` total recovery. Its 78-local-unit
arc uses a broad `.52` power curve, producing a much higher jump and a visibly
longer apex hang without moving the scheduled impact away from normalized strike
completion. A dedicated `easeInOut(t)` preload keeps the model origin, both
front palms and both rear feet pixel-still. A `.92 * crouch` articulated core
sink lowers only the head/torso mass while the shoulders, elbows, hips and knees
bend around those four planted contacts. Strike frame zero inherits that exact
skeleton; there is no sprite slide or planted-to-air position pop.
The air pitch and leg extension then ease across the first `.28` of normalized
strike time, so the cached underside does not replace the crouched face in the
first few frames. During flight both long
jointed rear legs straighten downward and converge beneath the body, their webbed
toe fans remain front-facing, and the short front arms stay beside the shoulders.
Landing fold is based on actual remaining height: on descent the
legs begin folding at 52 local units of clearance and finish by 28, while still
above the red lane-warning plane. Rear feet remain front-facing throughout
flight rather than rotating sideways. Hind legs render before the torso; the
front arms/hands render after the complete core as the near pair. Idle rear ankle
height remains matched to the front-hand sole. In the
frontal view both hind legs use the darker, slightly faded rear-plane palette;
the torso and front limbs then occlude them, preventing rear joints from reading
as foreground arms.

The apparent airborne body turn is not a live scale/squeeze.
`TOAD_AIR_PITCH_CLIP` and `TOAD_AIR_LAND_PITCH_CLIP` are separate nine-frame,
raster-scale-5 cached 2.5D atlases. Both preserve the approved outer contour and
anchor while the front face recedes and a rounded spotted belly/chin surface
rotates into view from below. The launch atlas starts at the live crouched core;
the landing atlas ends at the live neutral core. Their apex frames are identical,
so the direction switch is seamless. Live eyes, eyelids and nostrils are
suppressed while either cache is active, eliminating the former doubled eyes,
rear eyelid remnants and post-jump handoff flicker.
The main descent reverses through the landing atlas and reaches the neutral
front-facing core before impact. The post-impact return hop deliberately stays
live 2D: its joints may extend for the small hop, but it never reopens the cached
underside after the strike.

Tongue and Bog glob share the corresponding cached head construction.
`TOAD_HEAD_PITCH_CLIP`, `TOAD_HEAD_POISON_PITCH_CLIP`, and
`TOAD_HEAD_SPIT_PITCH_CLIP` are nine-frame, raster-scale-5 variants painted by
one `paintToadHeadPitch()` source. Idle uses the normal atlas's frame zero.
Every variant preserves the same skull anchor and connected facial topology. The
idle chin plate uses exactly the same width, depth and inner plane as the opened
jaw, so opening only translates fixed anatomy instead of replacing it. Poison
only adds the liquid pool. Spit is the deliberate exception to fixed jaw size:
the actual upper-lip edge moves down and narrows while the actual lower jaw moves
up, narrows and shortens around a small pixel-rounded O. No interior-colored
patch is used to fake closure. The paired nostrils remain painted on the
contracted spit muzzle even when the frontal-face alpha reaches zero.
The head turn uses a monotonic clock without hesitation strain, eliminating
mouth-frame oscillation.
Deterministic live surface bubbles rise, swell and pop over the immutable cached
pool while the glob is charging.
At release the spit atlas begins in the puckered O, holds for the opening `.10`,
then closes monotonically across `.72` of normalized strike time. The upper lip,
aperture, jaw and pitched skull therefore animate shut while the projectile is
still travelling; recovery begins on the exact closed idle frame. The projectile still
follows its screen-space half arc to rider-head height and splashes at the
scheduled contact coordinate. Recovery burst alpha reaches true zero early
enough to prevent a suspended afterimage.

`TOAD_WEB_FOOT_CLIP` / `toadWebFootClip()` lazily creates one seven-frame,
raster-scale-4 cached 2.5D atlas. Frame zero is the live idle/impact foot.
Midair frames reveal the connected webbing and underside pads; both front feet
return to frame zero before landing, preventing an idle/impact flash. These foot
frames remain separate from the cached core so joint positions can follow the
height-driven landing fold without redrawing either atlas.
All eight attacks passed deterministic 30/60/120 FPS state-order and
duration-spread validation.

Imp was rebuilt on 2026-07-25 around nine ranged-only frame attacks. Three
one-lane mid beams charge between its joined hands and reach the chosen rider
lane at frame impact. Three two-lane mid eruptions raise both hands while stable
ground cracks heat, then produce large layered flame clouds. Three one-lane high
fireballs travel to rider-head height and require ducking. Every step owns
`x:1`, `bodyLunge:0`; the Imp definition has `ranged:true`, so shared miniboss
presentation adds no tell/strike depth approach or horizontal lane chase.

These ranged patterns are no longer authored only inside the Imp. The global
`RangedFrameAttackFactory` exposes `singleLaneFamily(spec)` and
`twoLaneFamily(spec)`. Each expands one timing/animation specification into the
complete lane variants with stationary casting already applied. The returned
tables remain compatible with either frame-hit normalization set, so future
bosses and minibosses should build from this factory instead of copying Imp rows.
`singleLaneFamily` is used for the beam and high projectile families;
`twoLaneFamily` supplies neighboring pairs and includes the outer pair unless
`includeOuter:false` is requested, as Mire Toad does for its physical landing.

`drawImp()` keeps the accepted block model but renders tail first, body/head
second and jointed arms third. It now passes its hand anchors, target contacts,
timing and palette to the global `drawRangedFireAttackVisual(ctx)` renderer.
That shared renderer owns charge, continuous beam, beam retraction, heating
ground, eruption rise/sink, arced projectile, explosion and particles. It owns
no Imp joints or pose names, so another encounter can reuse it with different
anchors and a six-color palette. Beam, eruption, and fireball effects reach their
authored contact coordinates at normalized strike completion. The obsolete
claw, flame-floor/fan, firestep, inferno-dance poses and renderer were removed.

Imp fire retains the organic silhouettes from the first ranged-Imp pass. The
beam is a layered, wavering flame ribbon with small pixel texture blocks and
rising particles around its body and mouth. Each shallow rounded cap tracks the
final wave offset of its own ribbon layer. Each colored layer is now one closed
Bezier silhouette containing its body and both rounded ends; no separately
painted tip or hidden flat body endpoint remains to create a seam. The ribbon
tapers at the Imp to roughly the charge-orb diameter, then widens toward impact,
and its rounded source bulb is authored directly inside those same red, orange,
and gold ribbon layers. No second fireball renderer is used during beam strike.
Wave displacement is zero at the source, so bulb and taper share one centre and
texture. Ribbon half-width starts at 40% of each authored layer—matching its
source bulb—and eases to full width toward contact. The impact mouth uses deeper
red/orange/gold caps, producing a layered ball-like finish without a separate
white point at its centre.
During the `.65` recovery portion, the source cuts off and the detached ribbon
contracts from the Imp toward its fixed impact cap. Its last short segment becomes
a shrinking layered ember instead of collapsing into a thin polygon line. The
moving cut end is rounded by the ribbon's own red/orange/gold layers (with no
extra hot core), so it never exposes a flat line during the contraction.
For high attacks the Imp raises both jointed arms, forms the fireball overhead,
then swings forward to throw it along a pronounced screen-depth half-arc. The
ball grows slightly toward the rider, never returns to the Imp, and bursts at
rider-head height. High-attack arrows are limited to the targeted lane.

Adjacent two-lane eruptions are now one giant flame, not two overlapping lane
flames. Their single connected heat bed, broad root pocket and all five animated
color layers share the midpoint of the selected neighboring lanes; the flame
width spans the complete pair and its full-rise height is `106` local units.
The outer-lane pair deliberately remains two separate beds and two separate
flames so the safe centre lane stays empty. Beds sit vertically below the shared
red lane telegraphs and use layered perspective ellipses to read as a slowly
heating ground surface. Eruption strikes retain the referenced broad base and
three-tongue composition, with natural pointed Bezier curves.
Red/orange/gold/cream/white layers bend, flicker, and shift on separate clocks.
They rise from zero, then shrink into the ground over the first part of an
extended `.82` recovery portion. Curved ember pockets cover the flame roots from
the front, burying each cut lower edge without a straight mask. The bed stays hot
while the flames sink, then contracts and cools only after they disappear.

The overhead fireball follows a pronounced screen-space half-arc from the Imp's
head to rider-head height. Its orientation follows the arc tangent. The
projectile remains visible until the last 1.5% of travel, then becomes a small
burst at the same contact coordinate on frame-hit. Overlapping irregular
red/orange/gold/cream lobes expand from there and fade through recovery.

## Next-session checklist

1. Read this file completely.
2. Inspect the current Wolf, Mire Toad, and Imp tables and renderers before editing.
3. Decide which miniboss is updated first.
4. Prefer one-lane jump/duck attacks where intended; the two- and three-lane versions remain available for future species and combos.
5. Preserve the optional counter-duel structure unless the user explicitly changes it.
6. Test every materially changed move in Miniboss Move Lab. Run 30/60/120 FPS sweeps when timing, collision, or animation geometry changed—not repeatedly after text-only or registry-only edits.
7. Finish with hierarchy, frame-only validation, reuse, allocation, browser, process-cleanup, and dead-code checks.

## Credit-efficient working rule

Use targeted `rg` searches and narrow file ranges. Read this handoff once, then inspect only the miniboss table, renderer, or shared function currently being changed. Reuse the existing architecture and browser harness. Batch related static checks into one command and use one final browser pass per coherent implementation checkpoint. Do not repeat expensive FPS scans when no timing or collision behavior changed. Always terminate browser/test processes and delete temporary profiles/scripts after verification.
