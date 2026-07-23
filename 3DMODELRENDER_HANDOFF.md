# Knight Rush 3D Model Render Handoff

Status: the reimagined Bear mesh in `knight rush fable finish.html` is the approved live-3D visual reference as of 2026-07-23. The normal progression encounter `MIGHTY BEAR` keeps its preserved 2D renderer, contact rig, and attacks. A progression-excluded `3D BEAR` remains only in Boss Move Lab. Full live-3D combat is not the production route; Turtle's approved shell-wheel is the production cached-2.5D proof. Read `CACHED_2_5D_RENDER_HANDOFF.md` completely before any new angle-changing art.

## Current production direction: cached 2.5D

- Do not replace an approved 2D creature with a live 3D mesh merely to gain turning. The Bear experiment showed that live 3D made existing fight animation stiffer, harder to author, and more expensive without reliably improving the 2D fight.
- Keep the normal 2D renderer as the hero pose and combat source. Add prepared rotation frames only to moves that materially need a different angle, such as Turtle's horizontal shell spin or a future crocodile roll.
- Turtle's approved new 2D anatomy and normal renderer are `drawLavaTurtle()`. Do not rebuild, simplify, or restyle that model.
- Turtle's spin uses `TURTLE_SHELL_OUTLINE`, `TURTLE_SHELL_PLATES`, `TURTLE_SHELL_KEELS`, `TURTLE_SHELL_LAVA`, and `TURTLE_SHELL_RIM` as one shared geometry/palette source for both the normal drawing and the cached angle clip. Never draw independent profile frames by eye in a different style.
- `turtleShellProfileAtY()` derives every rotation row from the approved silhouette. `turtleShellProjected()` wraps the exact scutes around that silhouette. `paintProjectedTurtleShell()` keeps the outer contour stable and rotates only the surface anatomy, preventing size changes, gaps, and pseudo-3D distortion.
- Lazy `turtleShellSpinClip()` creates 12 crisp raster-scale-5 frames only when shell-wheel first needs them. `createAngleClip()` stores them in one atlas, and runtime work is one source-rectangle `drawImage()` through `drawAngleClip()`. Do not restore twelve eager startup canvases; that formerly reserved roughly 14 MB before the boss appeared.
- Frame zero preserves the approved front shell exactly. The profile/rear frames deliberately reuse its palette, mitered lines, lava seams, keels, and scute geometry. Hidden angles may be simpler, but must never switch to a separately invented art style.
- Cached scute outlines must match the normal renderer's apparent weight, not its raw unscaled number. Turtle uses the same `#ff6a2a` seam at `0.5` opacity and a proximity-compensated `2.1x` cached local width, because shell-wheel brings the clip much closer to the camera. Do not restore fully opaque neon outlines.
- Turtle's cached shell is sampled with high-quality smoothing only when drawn close. The source remains a crisp 5x cache; do not switch it back to nearest-neighbour enlargement, which exposes blocky stair steps near impact.
- Turtle's shell-wheel approaches in one continuous direction: `tele_turtle_spin` performs two turns while approaching and `strike_turtle_spin` adds two faster linear turns into contact. Recovery holds the front impact face briefly, then completes one full turn in the opposite direction while retreating. The return finishes front-facing before the identical live shell takes over and reveals the head/legs into idle. It never waits on a pre-impact side frame. Collision and travel time remain unchanged.
- The first `22%` of `tele_turtle_spin` is the exact reverse of the accepted final reveal: one `easeInOut` clock closes/retracts the head and jaw while all four legs fold from `0` to `TURTLE_SPIN_TUCK=30`. The shell keeps `squash=0`, `rear=0`, constant scale, and constant depth, so the live front shell hands off to cached frame zero without a vertical snap. Only after every limb is hidden do cached rotation, wind, and approach begin. Recovery uses the matching forward reveal after its return turn.
- Head masking is perceptually corrected from raw normalized retract time with a `1.15` power curve; using the cubic eased leg clock made the skull vanish while claws were still visible. The head now moves throughout the fold and disappears on the same final frame as the claws. Recovery uses `1-(1-t)^1.15`, its exact time reverse. Shell-wheel suppresses the separate glowing withdrawn-socket overlay, allowing the existing centre scute/opening to be revealed continuously instead of teleporting a new pattern into place.
- Turtle's underside has two layers. A plain unmarked `TURTLE_SHELL_RIM[0]` underfill prevents sampling cracks, but every visible rim surface, upper line, yellow/orange marking, and `TURTLE_SHELL_RING_TIPS` flange is projected into all 12 cached yaws with `turtleShellRimProjected()`. The rim uses its own `15.8` radius so protruding tips remain real rotating geometry instead of collapsing at the carapace boundary. Never leave visible rim details static.
- Profile frames reveal a hidden orthogonal black flange pair with `abs(sin(yaw))^2` visibility. The approved front/back pair still rotates normally; the side pair exists only to keep both lip tips readable when the first pair has rotated toward the centre.
- Shell-wheel recovery mirrors only the moving `strike_turtle_spin` phase; the stationary tuck/tell spin is deliberately excluded. `TURTLE_SPIN_RETURN_START=.08`, `TURTLE_SPIN_RETURN_DURATION=.70`, and `TURTLE_SPIN_RETURN_TIME_SCALE=1.15` make the retreat window last `1.15 * move.travel`. `turtleSpinReturnProgress()` begins at exactly the forward strike's angular speed, cruises through roughly the first three quarters, then applies a cosine brake to both reverse yaw and retreat depth. The extra 15% supplies stopping time without any compensating speed-up. It holds the impact position briefly, retraces two turns in the opposite direction, mirrors the wind, and reaches idle/front-facing at `.78`; only the live limb/head reveal follows.
- `drawTurtleSpinDust()` is deliberately neither an arrow nor a shell-hugging aura. Sixteen deterministic large square beige/cream dust motes spawn near the shell, spread well beyond its edges, recede upward into the road, shrink, and dissolve into the background. A fixed subset draws behind the cached shell and the rest in front. Crucially, particle age now uses a slow independent `perfNow` clock rather than `shellSpin`; shell acceleration and braking cannot drag the cloud with the model. Spin speed affects only a narrow 10% spread range and 18% opacity range, while travel speed/lifetime stay stable, giving the dust visual inertia. It remains randomness-free, visual only, and isolated for easy removal.
- The cached clip is visual only. Existing attack path, timing, hazard, collision, progression, and frame-hit/model-hit rules stay untouched unless the user separately approves a gameplay change.
- This proof is intentionally reversible: deleting the cached projection helpers and restoring the normal shell draw in `strike_turtle_spin` must not require any encounter-system changes.

## Current 3D Bear experiment

- `MIGHTY BEAR` uses `drawBearNatural()` plus `BEAR_CONTACT_RIG`. Do not route the progression Bear through the 3D experiment without a new explicit approval.
- `3D BEAR` is registered as `bear3d` with `labOnly:true`, `drawBear3DNative()`, `BEAR3D_DUEL_ATTACKS`, and `BEAR3D_NATIVE_CONTACT_RIG`. It appears as a separate fourth Boss Lab choice and is not listed in any stage.
- The first native moveset contains exactly seven attacks: left/centre/right single-lane strikes, low right-to-left and left-to-right swipes, and high right-to-left and left-to-right swipes. Paw and jaw contacts use the boss-only model-contact system; low/high attacks retain the shared physical swipe mechanics.
- The animation rule is **continuous preload, uncertain release, fast commitment**. `bear3dTension()` is strictly increasing. During every tell, the feet, knees, torso, shoulder, elbow, paw or jaw, head, and counterweight keep drawing farther into the attack like a rubber band. Never replace this with a frozen hold, inward jitter, or sinusoidal shake.
- `EncounterActor.cueMove()` supports opt-in `hesitationMin`/`hesitationExtra`. This only adds safe tell time; the normalized pose continues moving throughout that extra time. Other encounters remain unchanged unless their move opts in.
- Paw strikes rise from four feet into the upright stance while the selected arm draws outward/upward, then accelerate down at the rider. The centre bite stays quadrupedal, pulls the head and jaw back, then bends the spine and all four leg chains into a real close-range snap. Low swipes stay low; high swipes rise before the reaping arm crosses.
- The new sampler is constant-work direct pose arithmetic. It performs no coordinate-descent IK, no run cycle, no idle paw noise, no detached-limb correction, and no per-frame collection allocation. At commitment, one whole-animal screen-plane follow keeps the visible striking joint and its red contact core coincident without distorting a limb.
- An endpoint audit found finite poses and `0.0000 px` error between the visible damaging joint and the authored contact endpoint for all seven moves. A 12,000-sample browser stress pass completed without invalid geometry. Captures checked early/middle/final preload, paw impact, bite impact, and high/low swipe staging.
- The failed route-matching implementation (`drawBearCombat3D`, iterative paw IK, its sample/contact rig, and the obsolete legacy Bear mesh) was unregistered and removed in the 2026-07-23 efficiency refactor. Its lesson is preserved here: do not force an established 2D route onto a different 3D skeleton. The native lab-only Bear path is the only live 3D combat experiment retained.
- The `bear_model_spin` closed/open-mouth turntable now belongs only to `bear3d`. Screenshot mode and manual mouth toggle remain available.

## Read this before making another 3D boss

The approved result is the current Bear built by `buildBearModel3D()` and displayed by `drawBearModelTurntable()` through the Boss Move Lab entry `bear_model_spin`. Inspect that implementation and reuse its architecture. Do not restart from the earlier projection/distortion experiments.

`3dmodelrender.html` is an older preserved checkpoint from the Wolf experiment. Keep it untouched as historical/reversible reference, but the current Bear in `knight rush fable finish.html` is the stronger modeling standard.

## Approved visual direction

- Build a real articulated 3D mesh from simple game-native primitives while keeping the established Knight Rush low-poly/block-art character. It may be angular, but it must not look like unrelated cubes randomly stacked together.
- Anatomy and silhouette come first. The creature must remain recognizable and proportionally coherent from front, profile, three-quarter, rear, and underside views.
- The front view is the hero view and must be especially strong, threatening, readable, and stable because the player sees it most often.
- Model the entire animal, including sides, back, belly/underside, butt, tail, joints, paws/feet, mouth interior, and any anatomy revealed during rotation or attack poses. Do not hide missing geometry behind a front-facing 2D curtain.
- Use genuine articulated parts and named joints. Limbs bend anatomically, planted feet stay grounded, and transitions must preserve the creature's volume and scale.
- Details should feel organic and asymmetric: several fur shades, triangular fur tufts that break the silhouette, irregular hide patches, old and fresh wounds, hooked/forked/broken/crescent/claw-rake scar shapes, and non-mirrored placement.
- Texture marks must belong to the moving body part. Painted patches sit flush on the correct surface; scars rise only a hair above it; projecting fur tufts use real triangular geometry. Nothing may float, flash, clip deeply, or stay behind when a joint moves.
- Avoid coplanar surfaces. Separate sockets, brows, scars, patches, teeth, mouth surfaces, and other layers by stable deliberate depth so rotation never causes z-fighting or flicker.
- Do not make textures crawl, regenerate, flash, or change randomly during movement. The mesh and markings are stable; only articulated transforms and explicitly animated parts move.
- Keep rendering crisp at close range: stable raster resolution, `imageSmoothingEnabled=false`, no low-resolution blur, and no changing model size during yaw.

## What made the Bear successful

- A complete mesh and coherent anatomy replaced the attempt to force the old 2D bear into fake depth.
- `BEAR_MODEL_BIND_3D` defines a reusable skeleton with jaw, neck, forelimb, hind-leg, paw, and tail pivots.
- Every triangle has a part tag. `poseBearModelPoint()` applies hierarchical transforms, so geometry, surface detail, future contact points, and joints all agree.
- The bear has separate four-foot and upright poses. Its back legs plant on the same ground line, knees bend during the rise, the spine transitions between poses, and the chest bridge prevents gaps.
- The mouth is modeled as connected anatomy rather than two detached blocks. Permanent teeth, a hollow cavity, painted mouth surfaces, restrained gums, and a smaller darker tongue remain readable while opening, closing, and turning.
- Eyes use stable sockets, small threatening red eyes, and thick brows physically above the eyes. The skull backing is depth-separated to prevent flicker.
- Paws use compact bear-like palms, five readable toes/claws, and underside pads rather than oversized slabs.
- The rounded rump and back remain continuous. Rear-facing triangular patches, upper-back marks, leg-back details, scars, and tufts make the model finished from every angle.
- The turntable supports automatic mouth cycling plus a manual open/closed mouth toggle. Screenshot mode removes UI for clean evaluation.

## Architecture to reuse

Reuse the existing `p3*` helpers, material-tier system, mesh part tags, pose hierarchy, depth renderer, cached raster frame, joint sampling, turntable controls, and Boss Lab integration. Prefer a species-specific bind skeleton and pose function over special-case screen-space distortions.

Useful Bear references in the main HTML:

- `BEAR_MODEL_MATS`
- `BEAR_MODEL_BIND_3D`
- `buildBearModel3D()`
- `poseBearModelPoint()`
- `BEAR_MODEL_HIT_BIND_3D`
- `BEAR3D_NATIVE_CONTACT_RIG` / `sampleBear3DNativePose()`
- `renderBearDepthFrame()` / `drawBearModel3D()`
- `drawBearModelTurntable()`
- Boss Lab move `bear_model_spin`

The model should first exist as an isolated, reversible Boss Lab turntable. Include closed-mouth and open-mouth inspection and rotate through front, both profiles, back, and underside-revealing angles. Keep the current live boss renderer and attacks intact until the user approves the model. Only then adapt existing moves to the new joints and sampled model contact geometry.

Boss 3D models may drive boss-exclusive model attacks, swipes, and pinches through named sampled joints and visible geometry. This does not change the settled miniboss rule: minibosses remain frame-hit only and must not receive model contact rigs, swipes, or pinches.

## Failure modes to avoid

- Do not rotate a flat front model by squeezing/skewing it; that distorted silhouettes, changed apparent size, erased features, and made profiles unrecognizable.
- Do not place a copied 2D face over a weaker 3D body.
- Do not use large blurred raster upscaling or a deliberately chunky pixel filter.
- Do not use detached mouth slabs, floating eyes, floating textures, floating feet, or decals on unrelated transform layers.
- Do not make every scar the same diagonal line or every fur patch the same rectangle.
- Do not rebuild combat, progression, or existing boss moves while the model itself is still awaiting visual approval.

## Next model work

1. Treat the cached Turtle shell spin as approved and complete unless the user requests a concrete change. If richer profiles are ever requested, add hidden side scutes through the same silhouette-derived projection and existing palette; do not replace the approved front or hand-paint unrelated complete frames.
2. Hydra is the next likely angle-art candidate, but first decide whether a specific move truly needs turning. Prefer a small cached 2.5D clip for that move over another complete live-3D conversion.
3. The old full-3D Bear remains a lab reference only. Do not resume full-3D production across every boss unless the user explicitly changes direction after the 2.5D test.

For any cached 2.5D creature: approve the normal front model first, share its exact geometry with prepared angle frames second, review front/profile/back continuity in a lab or isolated move third, and only then use those frames in one existing attack without changing its mechanics.
