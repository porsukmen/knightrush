# Knight Rush Cached 2.5D Render Standard

Status: approved production method as of 2026-07-23. The Lava Turtle shell-wheel in `knight rush fable finish.html` is the canonical proof. Read this entire document before adding rotation, a back view, a roll, or a perspective-changing attack to any boss. Also read `3DMODELRENDER_HANDOFF.md` for the separate live-3D experiment history.

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
- crocodile death roll;
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

