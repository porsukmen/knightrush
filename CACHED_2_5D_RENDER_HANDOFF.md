# Knight Rush Cached 2.5D Render Standard

Status: approved production method as of 2026-07-23. The Lava Turtle shell-wheel in `KnightRush.html` is the canonical proof. Read this entire document before adding rotation, a back view, a roll, or a perspective-changing attack to any boss. Also read `3DMODELRENDER_HANDOFF.md` for the separate live-3D experiment history.

## One-sentence definition

Cached 2.5D keeps an approved hand-authored 2D hero model as the source of truth, projects only the anatomy that must turn through a shallow deterministic volume, rasterizes a small angle set once, and plays those cached pixels inside an existing attack without changing combat truth.

It is not live 3D, a squeezed flat sprite, independent AI-generated side art, or a replacement combat engine.

## Why this is the production direction

- Knight Rush gets convincing angle changes while retaining its established block-art drawing, silhouette, palette, proportions, and readable front pose.
- Runtime cost is a cached `drawImage`, not per-frame mesh solving, IK, offscreen painting, or procedural geometry generation.
- The move remains authored through the normal encounter state machine. Collision, timing, lane/posture class, travel, progression, and rewards do not depend on the visual clip.
- Each conversion is move-specific and reversible. A boss that never needs to rotate should remain normal 2D.
- Hidden angles can contain enough new information to sell volume without forcing every idle/attack pose into full 3D.

## Decision rule

Use cached 2.5D only when a move materially benefits from another angle:

- horizontal shell/body spin;
- an airborne webbed-foot pitch such as Mire Toad's belly slam;
- a brief back turn;
- a weapon/body rotation whose direction matters;
- an underside reveal.

Keep ordinary bites, lane hits, tells, idle poses, and attacks already strong in 2D on the live 2D renderer. Do not convert a whole creature merely because the technique exists.

Miniboss constraint remains absolute: minibosses use scheduled frame hits only. Their cached angle art may be elaborate, but it may not introduce model contact rigs, physical swipes, or pinches. Those remain boss-exclusive.

## Canonical Turtle symbols

Source geometry and palette:

- `TURTLE_SHELL_OUTLINE`
- `TURTLE_SHELL_PLATES`
- `TURTLE_SHELL_KEELS`
- `TURTLE_SHELL_LAVA`
- `TURTLE_SHELL_RIM`
- `TURTLE_SHELL_RING_TIPS`
- `TURTLE_SHELL_BACK_COLORS`

Projection/cache:

- `turtleShellProfileAtY()`
- `turtleShellProjected()`
- `turtleShellRimProjected()`
- `paintProjectedTurtleShell()`
- `createAngleClip()` / `drawAngleClip()`
- lazy `turtleShellSpinClip()` cache accessor

Animation/presentation:

- `drawLavaTurtle()`
- `TURTLE_SPIN_RETRACT_PORTION`
- `TURTLE_SPIN_TUCK`
- `TURTLE_SPIN_RETURN_START`
- `TURTLE_SPIN_RETURN_DURATION`
- `TURTLE_SPIN_RETURN_TIME_SCALE`
- `turtleSpinReturnProgress()`
- `sampleBossPresentation()`
- `drawTurtleSpinDust()`

The cache accessor and atlas layout are intentionally lazy after the 2026-07-23 efficiency refactor. Do not restore eager startup allocation.

## Non-negotiable source-of-truth rule

Approve the normal front drawing first. Extract named polygons, colors, rim pieces, markings, and silhouette from that exact drawing. The live front renderer and cached projector must consume the same data.

Never hand-paint or independently generate complete side/rear frames in a different style. That failed because outline weight, proportions, markings, and color values drifted between angles, making rotation look like model swapping.

Frame zero must reproduce the approved front shell. It is the continuity test and the rollback anchor.

## The controlled projection illusion

Turtle deliberately does not project its outer silhouette as a free 3D mesh. The approved outline stays fixed while surface anatomy rotates. This avoids breathing, size changes, profile collapse, and the distorted “rubber model” look.

`turtleShellProfileAtY(y)` scans the exact approved outline at each polygon vertex height. The left/right intersections define that row's centre and radius. A source x coordinate is normalized inside the row, converted to a surface angle with `asin`, yawed, and projected back to x. Height is preserved exactly.

Conceptually:

```text
row = silhouette intersections at source y
nx = clamp((x - row.center) / row.radius, -1, 1)
frontAngle = asin(nx)
surfaceAngle = front hemisphere ? frontAngle : PI - frontAngle
rotatedX = row.radius * sin(surfaceAngle + yaw)
depth = row.radius * cos(surfaceAngle + yaw)
screenY = sourceY               // deliberately unchanged
```

Front and rear copies of each scute use the same source polygon. Depth sorting chooses the visible order, and surfaces behind the shallow volume are culled. Rear colors are restrained mappings of the same palette, not a new art style.

The rim uses `turtleShellRimProjected()` with its own radius (`15.8`). It cannot reuse the dome row radius because the rim and flange physically protrude beyond the carapace. A plain, unmarked static underfill may exist only to hide sub-pixel sampling cracks. Every visible line, stripe, panel, and tip must rotate.

## Profile continuity details that made Turtle work

- The outer contour remains stable.
- Scutes, keels, lava seams, visible rim panels, yellow/orange lower markings, and flange tips all share yaw and depth sorting.
- Scute seam color is the approved `#ff6a2a` at roughly `0.5` stroke opacity, not an opaque neon outline.
- Cached local seam width is multiplied by `2.1` because the attack brings the cached art much closer than idle. Match apparent screen weight, not the raw idle number.
- The approved front/back flange pair rotates normally. At exact profile it moves toward the centre, so a hidden orthogonal black pair fades in with `abs(sin(yaw))^2`. This keeps both profile lip tips readable without leaving a front-facing strip glued in place.
- The ring underfill contains no markings. Leaving decorated underfill static instantly breaks the illusion.

## Cache quality and performance contract

Turtle uses 12 yaw frames, a logical `108 x 108` frame, a `54,90` anchor, and raster scale `5`. Twelve frames are enough because the surface markings create intermediate motion while the fixed silhouette prevents angle-to-angle size jumps.

The cache is created only when shell-wheel first needs it. Frames live in one atlas rather than twelve independent canvases. This preserves the exact 5x source density while reducing DOM/canvas overhead and avoiding roughly 14 MB of eager pixel allocation on the title screen and early stages.

At runtime:

- choose the wrapped frame index from progress;
- source the frame rectangle from the atlas;
- call one `drawImage`;
- use high-quality smoothing when the cached shell is enlarged near impact;
- do not regenerate or mutate the cache;
- do not allocate arrays or canvases per frame.

Nearest-neighbour enlargement exposed large stair steps during close attacks. The source remains crisp block art, but the already-high-resolution cache is smoothly down/up-sampled at presentation time.

If a future creature needs more than 12 angles, increase frames only after a profile capture proves visible stepping. First improve shared geometry and markings; frame count is not a substitute for coherent anatomy.

## Mire Toad pitch clips

Mire Toad now provides the canonical non-yaw example of this standard. It does
not scale or squeeze the live frog to imply pitch. Five lazy atlases own the
surfaces that actually change viewing angle:

- `TOAD_HEAD_PITCH_CLIP` / `toadHeadPitchClip('normal')` for idle and the
  tongue head turn;
- `TOAD_HEAD_POISON_PITCH_CLIP` / `toadHeadPitchClip('poison')` for the charged
  bog glob mouth;
- `TOAD_HEAD_SPIT_PITCH_CLIP` / `toadHeadPitchClip('spit')` for the brief
  narrow rounded poison-release aperture;
- `TOAD_AIR_PITCH_CLIP` / `toadAirPitchClip(false)` for takeoff and the
  belly-slam underside;
- `TOAD_AIR_LAND_PITCH_CLIP` / `toadAirPitchClip(true)` for the reverse
  underside-to-planted strike landing handoff.

All five atlases contain nine logical `44 x 46` frames with anchor `22,42` and
raster scale `5`. `paintToadHeadPitch()` keeps one approved fused head, lip and
lower-jaw contour for every state. Idle renders frame zero of that same atlas,
including the same full-size jaw plate used by the open frames; opening only
translates that fixed jaw and never creates or deletes it. The poison variant
only adds the liquid pool; the spit variant pushes the upper lip and lower jaw
together around a small pixel-rounded O. Spit contracts the actual lip and
jaw boundaries; it must not fake this by painting face-colored polygons inside
an unchanged large mouth. Its paired nostrils remain part of the contracted
spit muzzle at full pitch instead of disappearing with the frontal-face layer.
The head clock uses a monotonic, strain-free turn value so telegraph tremble
cannot flip cached frame indices and make the mouth flicker.

`paintToadAirPitch()` keeps the core contour and anchor stable while frontal face
markings recede and the rounded, spotted belly/chin plane becomes visible from
below. Launch and landing use separate air atlases because their frame-zero anatomy is
different: launch begins from the fully crouched coil, while landing must return
to the neutral planted face. Their full-underside frames are identical, so the
atlas switch at the apex is invisible. Live face, eyes, lids, and nostrils are
not drawn underneath an active cached head/core. Suppressing those hidden layers
prevents a second pair of eyes, residual eyelid outlines, and one-frame flicker
when the angle clip returns to live art.

All five are created only on first use. Normal attack frames select one cached
frame through `drawAngleClip()`; there is no per-frame canvas, offscreen repaint,
flat body squeeze, or runtime polygon projection. The tongue itself is
intentionally not cached 2.5D. Before it appears, a live overlay keeps the
normal cached mouth closed and scrunches only the brows and nose without
changing atlas frame. Mouth launch starts at normalized tell `.82`; tongue
launch follows at `.84` and reaches full extension at the tell/strike boundary.
The 96-sample near-vertical source continuously resamples its visible span into 64 fixed
fractional render segments. It has no raised hold or tremble. The ribbon keeps a
shallow bow and high down-curled tip, then opens directly into the `.24`-second
downward lane whip. Its raised peak holds for normalized `.07` (about one 60 Hz
frame) after the first slash beat; a remapped `easeOut` then reaches contact
exactly at the second beat/frame-hit. During recovery it retracts completely by `.58` while the
head and jaw stay fully open; mouth closure begins only after the ribbon is gone.

The belly-slam landing is height-driven rather than tied to an arbitrary late
time slice. On the descending half, remaining local distance from the model core
to `groundY` drives `groundClose`: the rear legs begin folding at 52 local units
of clearance and finish by 28, entirely above the red lane-warning plane. Their
feet remain front-facing instead of quarter-turning sideways. A dedicated
full-tell `easeInOut` preload keeps the model origin, front palms and rear feet
fixed. Only the articulated core sinks while shoulder/elbow and hip/knee chains
fold; strike frame zero inherits that skeleton. Takeoff pitch
then eases across the first `.28` of the strike. On the main descent the landing
atlas reverses into the neutral core before contact; the smaller post-impact
return hop stays live 2D and must not reactivate either underside atlas.

## Cave Bear parry pitch clips

The Cave Bear successful bite-parry reaction is a visual-only cached-2.5D
underside reveal. `paintBearParryHeadPitch()` and
`bearParryHeadPitchClip()` own lazy normal/white-flicker atlases with ten
logical `24 x 36` frames at raster scale `5`. Only the skull, jaw and throat
plane is cached; the approved live torso, hind legs and articulated forelegs
remain live.

Frame zero preserves the frontal skull. As the Bear rises onto its hind legs,
the eyes recede, the nose becomes the far/top edge, and the lower jaw plus
throat face the camera. The underside lower jaw is a closed tapered plane: it
covers the mouth completely and contains no mouth-color stripe. A separate
staged pullback clock returns the skull continuously from the exact bite contact
before `parryBearBitePoseAmount()` raises/pitches it; the cached frame never
borrows idle as an intermediate pose. High Shove uses an earlier pitch clock
shared by its skull and both straight raised forelegs, including their return,
so its paws cannot lag the head. Bite recovery still uses
`parryBearHeadPitchAmount()` to finish the downward skull roll before the longer
live arm settle, so middle perspective frames do not linger near idle.

`paintBearParryPawPitch()` / `bearParryPawPitchClip()` add lazy normal and
white-flicker eight-frame `20 x 20` atlases at raster scale `5`. Only each
selected paw plane is cached. Frame zero repeats the live front paw; the final
angle exposes four toe pads, one broad central pad and claws while the existing
live shoulder/elbow/wrist chain supplies all motion. Rebound builds a straight
shoulder-to-paw segment and places the elbow on that line. On two-lane attacks
the non-contacted partner uses a half-height straight target and a partial sole
roll instead of remaining down. Ordinary mauls, doubles,
swipes, pincers, bites and the Bear's three-lane duck frame hit use this same
reversible paw-angle contract. Collision, timing, lane/posture truth and boss
travel are unchanged.

## Hydra parry head-pitch clip

`paintHydraParryHeadPitch()` / `hydraParryHeadPitchClip()` own lazy normal and
white-flicker fourteen-frame `24 x 34` skull atlases at raster scale `5`. Only the
skull plane turns. Frame zero reproduces the compact live front head around the
final neck joint at fixed atlas anchor `(12,26)`. The larger atlas is silhouette
working space, not permission for smaller model pixels: every painted shape is
quantized to broad two-atlas-pixel cells and the underside uses only three large
ventral plates. Horizontal quantization rounds inward so broad cells cannot grow
past the authored silhouette. Draw width is `12U`, matching the normal head's
outer span more closely. Frills overlap the skull by one cell, and the jaw
retains the live head's broad-upper/narrower-lower proportion before tapering
into the throat. Its closed far-mouth band retains the live skull's `6U` width
instead of pinching into a point, while height
interpolates from the exact `20U` front match to a restrained `16U` underside.
Each equally spaced angle is authored as a complete connected set of broad rows:
skull, mouth, lower jaw, both overlapping frills and throat exist in every
frame. This replaces the old interpolated tapers whose early rows collapsed,
leaving detached eyes/frills and producing especially poor reverse playback.
The reaction clock alone owns easing; lowering therefore walks the atlas evenly
in reverse. A front-loaded cubic crossfade makes the front-facing stepped
upper/lower jaw readable on the first descending atlas frame and completes it
before half-lower, avoiding a late mouth-type swap. Visible cached eyes use
the live renderer's exact `1.5U` footprint and only change opacity/position, not
size. Front-angle jaw rows remain inside the cranium (`headBottom` starts at
atlas y `32`), so the face-bearing skull never collapses to half height while
eyes and mouth are already present. A separate `bodyBottom` reaches the live
skull/jaw seam at atlas y `26`; pitched rows below it fade by `1-faceMouth`, so
they cannot sit at full width behind the incoming front jaw and cause a final
thin-pop. Explicit fourteen-entry top/body-bottom key arrays give neighbouring
cranium frames the monotonic logical-height sequence
`6,8,8,10,10,12,12,14,14,14,16,18,18,18`; independent rounding can no longer
re-shrink the frame beside a corrected pose. The underside is one fixed-height
`10`-atlas-pixel jaw plane translating from y `8` to y `22`; its three plates
move with it and fade on the same ownership clock. It never expands downward with newly exposed skull rows, and
crossfades into the stepped front jaw around the face centre. The stepped jaw's
combined `5.1`-pixel height is capped inside `headBottom`, so no middle frame can
extend it down the neck. At full pitch the cached throat overlaps the live neck
by one coarse row only (`headBottom=22`, `socketBottom=24`); the live
seven-segment rig owns all remaining neck length. Presentation lowers the clip
by `pitch*1U` to close the socket gap without lengthening cached throat. Frill
source heights compensate for the changing draw height, preserving the live
`1.8U x 2U` screen footprint in all fourteen frames. Lowering completes within
the first `.78` of limb-return progress; only the visual head roll is shortened,
not the body stumble or reaction duration. The live dark-green neck/body palette
keeps the underside readable without making it look like a separate pale model.
`drawAngleClip(..., false)` enforces nearest-neighbour edges.
The reference sketch defines only anatomy and viewing direction; its colored
rectangles are not copied as final geometry. The live seven-segment neck still
owns the socket and endpoint; its Hydra-specific slower rise keeps the pitching
skull on screen while the boss returns from contact depth. Final return includes
current live idle sway, so the cache cannot hand off to a differently positioned head.
Twin/pair selection rules remain outside the cache, so only the contacted head
changes perspective while its partner settles through the live rig.

## Transition choreography

The cached clip must never abruptly replace a live creature with missing limbs or a shifted shell.

Turtle entry:

1. Start from the exact live idle shell at constant depth and scale.
2. During the first `22%` of `tele_turtle_spin`, retract head, jaw, and all four legs while the shell stays pixel-still.
3. Legs use the shared eased clock and end at `TURTLE_SPIN_TUCK=30`.
4. The skull crosses its mask differently from the feet, so head folding uses `rawTime^1.15`. This keeps it moving throughout the fold while making the skull and final claws disappear on the same visible frame.
5. Suppress the separate glowing withdrawn-socket overlay during shell-wheel. The centre scute/opening already supplies continuity; adding another pattern makes it teleport.
6. Only after all limbs are hidden may cached yaw and forward approach begin.

Turtle exit:

1. Hold the front-facing impact pose briefly.
2. Retreat while rotating in the opposite direction. Never slide before rotation begins.
3. Mirror only the moving `strike_turtle_spin` phase; do not include the stationary tuck/tell spin in the return-duration equation.
4. Begin at the forward strike's angular speed.
5. `TURTLE_SPIN_RETURN_TIME_SCALE=1.15` adds stopping time. `turtleSpinReturnProgress()` cruises through roughly three quarters of the reverse trip and applies a cosine brake at the end without an artificial compensating speed-up.
6. Rotation and retreat depth use the same progress function, preventing a stationary-looking shell from sliding.
7. At normalized recovery `.78`, the cache is front-facing and at idle depth.
8. The final `.22` reveals live limbs/head with the exact reverse masking curve. The live front shell is identical, so the handoff is invisible.

Forward strike remains two linear turns. Reverse return remains two turns in the opposite direction. Impact, hazard, and collision clocks are unchanged.

## Dust/woosh rule

The accepted effect is dust caused by violent rotation, not an arrow showing direction and not an aura glued to the shell.

`drawTurtleSpinDust()` uses 16 stable square beige/cream motes:

- spawn near the shell;
- spread far beyond its edges;
- move upward to imply receding into the road/background;
- shrink and fade with age;
- draw a fixed subset behind the cached shell and the rest in front;
- never use random per-frame generation;
- never trace the exact shell contour.

Particle age uses a slow independent `perfNow` clock, not `shellSpin`. This is essential: when the Turtle accelerates or brakes, airborne dust keeps its own inertia instead of speeding/slowing in lockstep and looking attached. Spin speed influences only a narrow 10% spread range and 18% opacity range. Recovery visibility fades lingering dust after the shell stops.

## Generic implementation recipe for another boss

1. Identify one approved move that needs angle change. Do not start with the whole boss.
2. Freeze gameplay: record the current hit class, lanes, height, telegraph, travel, impact, recovery, body depth path, and collision resolver.
3. Approve the live front drawing and extract shared named geometry/palette.
4. Decide what remains silhouette-stable and what must wrap around volume.
5. Write a species-specific row/profile function from the approved silhouette.
6. Project front/rear copies of visible surface anatomy and depth-sort them.
7. Give genuinely protruding anatomy (rim, spikes, tail band, weapon, etc.) its own radius/profile instead of forcing it onto the torso radius.
8. Add hidden profile-only continuity geometry only where the normal front/rear geometry collapses. Fade it by yaw; never leave it visible at the hero view.
9. Produce a lazy cached angle atlas from shared geometry.
10. Inspect front, both three-quarters, both profiles, back, and front wrap before combat integration.
11. Build an entry transition from live art to cached frame zero with constant model anchor, depth, and scale.
12. Play the clip only during the necessary attack phase.
13. Return to the same front frame before restoring live art.
14. Add optional dust/woosh only after rotation itself is approved.
15. Test close-range quality, slow motion, normal speed, return direction, pause/screenshot mode, and repeated loops.

## Acceptance checklist

- Front frame is faithful to the approved 2D drawing.
- Apparent model size and anchor do not pulse with yaw.
- Profile remains recognizable as the same animal/object.
- No decorated lower strip, rim, eye, marking, or appendage remains static while the surface turns.
- No layer disappears at rear/profile unless anatomically occluded.
- No limb/head teleports during entry or reveal.
- No pre-impact side-frame pause hides the actual hit.
- Forward movement always rotates; return movement always rotates until its planned stop.
- Return direction is deliberate and wind/dust is compatible with it.
- Close frames are not blurry or visibly low-resolution.
- Runtime is cached drawing with no per-frame canvas creation, projection arrays, or random generation.
- Collision and gameplay validation are unchanged unless separately approved.
- Temporary screenshot hooks, browser profiles, and captures are removed.

## Failure modes already observed

- Flat x-squeeze/skew: destroys proportions and makes side views unrecognizable.
- Independent profile drawings: style, line weight, color, and anatomy swap between frames.
- Projecting the entire outline: makes the model breathe, shrink, and distort.
- Static decorated rim: looks pasted to the screen while the shell turns.
- Missing profile flange/edge: makes the shell appear cut open at 90 degrees.
- Nearest-neighbour enlargement: exposes coarse pixels at contact distance.
- Eager high-resolution frame canvases: wastes startup memory before the boss appears.
- Reversing strike frames blindly: can replay the hit, pause on a bad frame, or move without rotation.
- Dust phase driven by shell yaw: makes particles accelerate and brake with the model like an attached aura.
- Per-frame random particles: flicker and crawl instead of behaving like persistent dust.
- Using cached art as collision: couples visual iteration to gameplay and breaks the reversible contract.

## Hierarchy and ownership

Shared reusable layer:

- lazy angle-atlas creation/drawing;
- generic cache metadata and frame wrapping;
- zero-allocation runtime selection;
- common validation and cleanup expectations.

Species-owned layer:

- source silhouette and feature polygons;
- row/profile projection;
- hidden profile continuity pieces;
- palette and rear shading;
- entry/exit anatomy choreography;
- move-specific dust art.

Encounter-owned layer:

- attack table, lanes, height, timing, body travel, recovery duration, hit class, and collision.

Never move species geometry into the encounter table, and never move collision rules into the cached renderer.

## Rollback contract

The angle clip is visual-only. To roll back a conversion, route the affected animation state back through the accepted live 2D drawing and remove the clip/dust branch. Encounter tables, hazard creation, collision classes, progression, and rewards must require no edits.

Do not delete the live hero renderer after approving cached angles. It is both the normal production art and the guaranteed rollback path.
