# Seeded Journey foundation (v7)

Entry: **NEW / SEEDED JOURNEY** in KnightRush.html. The shared base distance is now 1,984.5 (1,323 × 1.5), affecting ordinary PLAY as well. NEW additionally generates normal/special road plans and event slots. Disco roads now have world art and a live Disco King stop; other event types remain reserved.

## Play

- A fresh NEW run generates a random 32-bit seed. Pause → ROUTE MAP shows the seed, all reachable nodes, current position and selected edges.
- Move to the left/right lane, then swipe/press that direction again as the junction approaches. An explicit outer-lane press is remembered from when the road mouth enters the 60 m horizon (53 m before the node), rather than discarded outside the old 34 m window. Movement cannot carry an accepted late turn beyond its commit window. The route/turn text overlays have been removed.
- Where a straight exit exists, doing nothing continues straight. All side turns, including single-exit corners, require player input. If forward is closed, movement and distance stop at the junction until the player selects a side; there is no automatic fallback turn.
- Side-exit grace lasts until 18 m after the node (previous straight fallback was +4 m, prematurely closing the nominal +10 m input window). Selection, straight fallback, movement clamping and camera-entry limits now agree; this adds roughly 0.64 seconds at base speed without slowing the runner. Both renderers use the same rule. Seed `647486904` is regression-tested with actual approach updates, late keyboard/touch inputs and a long next frame.
- Passing straight preserves the unchosen Disco branch at its world position until the old junction leaves view. Its mouth carries the actual colored dance floor, mirror balls, speakers and a few dancers; the nearby trees stay green. No purple-dirt entry, sign/arrow UI or selection-triggered palette switch is used.
- Selected special roads also keep their preview's fixed world origin through yaw. Network camera exit travel now matches the node-relative odometer instead of interpolating the special road's origin to compensate for a shorter camera path. The last rotating frame clamps movement to the exact endpoint, preventing overshoot and a second jump when normal straight rendering resumes. Floors, props and venues share this transform in both renderers; seeded layouts and encounter distances are unchanged. `journey-special-anchor-audit.cjs` checks 32 themed left/right, early/late, normal/curved and frame-rate combinations, including the later coordinate rebase.
- Closed forward roads use the original tree grove. No replacement artwork or pixel filter is introduced.
- Obstacle/coin spawn clearance checks only the active road's `from`/`next` endpoints, never nodes on unchosen branches with similar odometer distances. The turning-camera freeze and boss runway remain intact.
- **REPLAY SEED** restarts the run with the same map seed and rider; **NEW SEED** generates a fresh run but keeps the map open and paused for browsing. Both reset campaign progress as a normal new run. Escape closes the map back to pause; a second Escape resumes.
- A URL query such as `?routeSeed=123` pins the seed for NEW. The in-map NEW SEED button can override it for that run.

## Graph and progression

The generator builds independent roads with world positions and compass headings before the run. There are no three route columns and no privileged main road. Left/straight/right are relative to the incoming road, so consecutive left turns are valid. Branches need not merge: every leaf is an alternative location for the same stage boss, not another boss to fight in sequence.

Junction pieces have explicit selection weights: straight 30%, right 10%, left 10%, left+right 10%, left+straight 17%, straight+right 17%, all three 6%. `JOURNEY_JUNCTION_PATTERNS` owns these weights. The start is always straight; above 80 nodes only single-exit pieces are considered. Geometry constraints cause weighted retries without replacement. Proven complete alternatives are retained if the search budget is exhausted; the final node records the actual piece in `junction`. These are proposal weights, not guaranteed final map frequencies. All accepted branches must still reach the boss.

Seeded normal road lengths range from 150 to 300 at the base stage distance, with a final leg up to 420; lengths scale with the stage budget. Special edges are exactly three times their `baseLength` (450–900 at the initial pace). `baseAt` consumes the original stage budget; `at` and world coordinates include the added physical distance. Every branch still reaches a boss, but special detours now take longer without shortening normal roads. The HUD estimates the boss distance by following straight/first exits ahead, updating on a committed choice; the selected terminal node's actual `at` controls boss arrival. Turns count as travel; minigames and fights pause it. Clearance checks reject crossings and nearby unrelated roads using the extended physical geometry. Backtracking is limited to 800 candidate attempts; a safe straight route is the fallback if no complete branch survives.

The debug map fits the generated world-coordinate centerlines rather than arranging nodes into rows/columns. The scene still uses local coordinates rebased after each junction: this is not a freely explorable persistent overhead world, and the map does not model the detailed turning curves or road width. The runner's three obstacle lanes are independent of route generation.

## Encounters and scope

- The first rollout enables generated networks on **forest stages**. Other biomes retain their existing route rendering/progression.
- Junction nodes remain roads. Each connecting edge owns ordered pieces and event slots rather than encoding encounters into junction types.
- Eligible candidate edges have a 20% chance of a special region before geometric acceptance. Longer special roads can fail clearance more often, so the final map frequency can be lower. The entry edge, boss edge and edges whose base length is too short are always normal. A region has one guaranteed special piece, then 70%, 45%, 20% continuation chances, capped at four pieces and by available length. The last special piece is always a finale, then a normal exit. Regions currently fit between junctions.
- Disco retains original tree silhouettes with a purple/plum palette and world-anchored lighting stands, mirror balls, speaker stacks and dancing minigame crowd sprites. The road becomes a four-column colored dance floor with dark seams, gently pulsing tiles and low stage lights between the larger party stands. No mushrooms. Each tree stores its spatially sampled palette strength and keeps it through preview, turn capture and handoff, avoiding recolors caused by camera rotation. Bloodwood remains map metadata only. `edge.preview` exposes the incoming road's theme; `journeyRoadContext()` exposes the current piece/theme to rendering and content systems.
- The debug map colors an entire node-to-node special connection purple/red at full opacity with a thicker stroke, including its forest transition buffers. This is an overview of the road's identity, not the exact biome boundary; gameplay pieces and event positions are unchanged.
- Special final slots are blocking by definition; normal forest slots are non-blocking. Eligible non-special roads have a 35% chance of a normal event slot, equally split between quest and cache. Start/boss connections and roads of length 110 or less are excluded. Quest and cache slots use a separate deterministic RNG stream. Unregistered content is recorded as reserved when passed, never launching a dummy minigame or silently granting rewards.
- The old fixed midpoint miniboss gate remains disabled while the generated graph is active, so it cannot interrupt the route-only trial.
- Standalone minigames and normal PLAY encounter mechanics are unchanged. Ordinary runner obstacles and pickups remain; their timing follows the increased route length.
- Version 7 changes old seed layouts because tripled special roads participate in geometric clearance. Within this version a seed reproduces its geography, road themes and event slots. Road themes and event slots use keyed independent RNG streams; registering content does not reroll geography.
- Route topology, leg lengths and terminal encounter selection are seeded. Ordinary obstacle placement and scenery variants are not a deterministic replay system yet.
- Quest inventory/persistence across runs, reward balance, full biome artwork and save/resume are not implemented. Results are run-local; content handlers will own quest/reward rules. Merely passing a reserved slot does not award anything.

## Event extension contract

`JOURNEY_ROAD_RULES`, `JOURNEY_ROAD_THEMES` and `JOURNEY_ROAD_EVENTS` declare policy and metadata. `buildJourneyRoadPlan()` is pure and adds contiguous edge pieces/slots to the seeded graph. Boss edges always remain normal, so special finales cannot swallow the terminal boss.

Register a content adapter with `registerJourneyRoadEvent(definitionId, handler)`. It returns an unregister callback. Duplicate registrations are rejected. Handlers may implement:

- `start(context)` (required), `update(context, dt)`, `action(context, action, point)`, `draw(context, canvasContext)`, `dispose(context, reason)`. Optional `returnResult(context)` supplies a result when an owned mode returns; absent this hook, a bare return is skipped.
- `context.slot`, `definition`, and a stable per-slot `seed` describe the encounter.
- `context.finish({status, ...result})` completes once, records a run-local result and resumes a blocking event. Stale callbacks after restart and duplicate finishes are ignored.
- `context.openMode(returnMode => startExistingMinigame(biome, returnMode))` lets a blocking adapter launch an existing minigame without copying its art/rules. Returning to the supplied mode safely resumes the road. An adapter can call `finish` explicitly to retain completed results; a bare back/exit is recorded as skipped.
- A non-blocking adapter stays in `run`; return false from `action` to preserve runner controls. It expires at the end of its window. Blocking adapters run in `journeyevent` unless they own another mode; world distance and collisions do not update. Implemented blocking slots clamp movement to the exact event boundary.
- Restart, stage transition, boss entry and interruption dispose active sessions. Pausing uses the existing pause system. Hooks must not mutate route geometry or directly grant duplicate rewards; result consumption should be keyed by slot ID.

The Disco and Bloodwood elite adapters are registered by default. Generic route-only and adapter audits explicitly remove both in their isolated test environment. `journey-disco-browser-audit.cjs` tests the shipped Disco adapter, actual three-round completion, pause/back, exact distance preservation, no re-entry, straight and side-road previews, and takes world screenshots.

## Disco road trial

- Dancers are separate world-anchored actors at ±7.1 m along the verge, rendered at alpha 1 independently of lamp strength. The detached incoming-shoulder dancer was removed; entrance equipment remains. Sky colors and the overhead canopy receive a subtle distance-based purple palette inside Disco. The canopy uses a lazily generated second cache, invalidated only with the normal resolution/padding cache, not rebuilt each frame. Dance tiles are single full-row polygons: the former 2 m subdivision caused a shimmering midpoint seam in each 4 m tile.

- Special road length is tripled for both Disco and bloodwood. Disco event placement sits near 52% of the extended road, giving roughly 11–21 seconds of running before the venue at initial pace and a similar stretch afterward. Metadata retains the `disco_finale` ID for compatibility, but the stop is no longer at the exit.
- Disco is entirely location-authored, including before selection. Fully colored dance tiles extend 5 m into the junction throat from the start; there is no purple soil strip or gradual tile appearance. The road material is opaque, never alpha-composited over green road sheets. Trees stay green through the first 30 m, then reach full purple at 95 m, with the usual final 70 m exit fade. Sparse entrance props precede the full party. Tree instances retain their spatial palette and originating edge ID through preview/capture/handoff. Dead-end backdrop trees explicitly capture the incoming road palette at creation. There is no turn-timer or post-turn whole-scene recoloring. Turn-to-settling road coordinates blend to the final local origin. Props are spaced at 24 m with floor lights halfway between; everything is culled by camera depth. Beams are low-alpha Canvas geometry, not real lights; the road patches themselves always use alpha 1. Tree color interpolation uses 25 quantized levels to bound the color cache.
- A full-width nightclub entrance marks the stop: dark recessed passage, curtains, tall speaker towers, a DISCO KING header, mirror ball and painted beams. It enters at the scenery spawn horizon with the lair-style soft-horizon growth and fills the view at the event threshold. Its world anchor is 2 m beyond the stop. A 24 m clearance on either side prevents obstacles/coins intersecting the venue, including actors scheduled before arming the road. The usual obstacle stream resumes outside that small area.
- Disco obstacles are skins bound once at spawn to the actual Disco road piece (not the preview/spill envelope). Fallen speaker cabinets replace boulders; suspended cable bundles replace duck roots, and coiled leads replace the jump sections; irregular purple grape-soda spills replace ponds. Every occupied spill lane includes an empty ribbed PET bottle with a GAZOZ / 2L wrapper, open neck and loose cap. The original type IDs, lane masks, jump/duck checks and relic immunities are unchanged. Safe lanes stay open, including non-adjacent speaker layouts. Cables no longer spawn/clear a mother tree. Turn surfaces retain the same skin, with compact cable bounds and separate speaker side faces. Normal roads and classic PLAY keep the original art.
- Reaching the stop opens the existing Disco King minigame without changing its drawings/rules. Run distance freezes, completion/skip is recorded once, and leaving resumes the same edge. Restart disposes the session. No new artifact/reward balance or cross-run persistence is introduced.
- Decorations use Canvas rectangles and clipped ground polygons, with no dynamic lights, new shaders, image assets or full-screen color filter. Desktop rendering checks do not certify iPhone frame rate.

## Bloodwood / Crimson trial

- The existing red special-road seed selection now has game-native Canvas art: maroon foliage/trunks, dim red canopy and ground, skull standards and scattered bones. Entrance standards sit behind the junction lip; outgoing scenery retains location-bound colors through left/right turns. Trees use the same 30–95 m spatial transition as Disco. No camera-triggered recoloring or transparent road overlays.
- Blood pools replace ponds and fallen skeleton/rib piles replace rocks in each occupied lane. Duck/jump roots now use the original tree-root art and full-size mother tree, with a spatially bound Bloodwood palette. Tree clearance and full-height turning surfaces are restored for these roots; Disco cables remain compact and treeless. Collision type IDs, lane masks and relic rules remain unchanged. Turning bone piles do not acquire a solid rock side face.
- The elite stop is in the final special piece, up to 70 m before its end so the lair stays inside the red area. A skull-lined rocky den and stepped dais grow with perspective; the original wolf waits motionless there. Approaching starts the existing wolf miniboss with its existing attacks, counters, taming and rewards. There is no new reward balance or new boss moveset in this trial.
- This encounter pins the wolf definition and freezes both stage distance and forest scroll. Winning or escaping completes the road event once and resumes the same road. Restart/interruption disposes the owned actor and hazards. A 24 m obstacle/coin exclusion zone protects blocking venues, including the wolf den.
- `journey-crimson-audit.cjs` checks 27 collision/action cases, themed spawning, full-height root surfaces, stationary combat, win/escape/restart; `journey-crimson-browser-audit.cjs` checks left/right/straight entry, palette stability, opaque ground, fight completion and no duplicate reward in Edge, with screenshots. These checks do not certify iPhone performance.

## Shared biome scenery revision

- Crimson and Disco roadside decorations share `sceneryDepthProjection` with the trees: 150 m visibility, a 26 m far-horizon fade and the same soft-horizon growth. Equipment and dancers become fully opaque at 124 m; biome light strength affects beams, not actor opacity. Road obstacles are NOT scenery: all skins use the normal 76 m obstacle window / 10 m fade and the same turning projection. The previous special-only 150 m visibility and `softScenery` turning override were removed; they stacked distant hazards at the horizon and detached turning hazard projection from the normal road contract. Painter order and near-root over-rider behavior remain shared.
- Per-edge layouts are cached in a WeakMap and generated with a dedicated seed stream, never gameplay RNG. Left/right streams have independent longitudinal spacing, lateral offsets, scale and orientation. Crimson selects skulls, rib cages, loose bones, spines, thorn bushes and mushrooms; plants comprise 57% of proposals. Skull standards remain as entry markers rather than repeating down the road. Disco equipment/dancers use irregular independent placements too, with dancers kept at the verge. This supersedes the fixed 24 m mirrored rows above.
- `journey-biome-scenery-audit.cjs` verifies cached/reproducible layouts, all six variants, independent sides, continuous horizon growth, actual pixels at 140 m for five decorator renderers, normal obstacle visibility for all six biome skins, plus the red mother-tree palette. It saves a variant contact sheet and a forest screenshot. `journey-obstacle-render-parity-audit.cjs` compares identical probe art through normal/Disco/Bloodwood dispatch: 78 straight draws (including the lowered boss horizon), 27 turning projections and 27 rider-layer assignments.

## Verification

### Journey render efficiency pass

- The hotspot audit found the original fixed road mesh issuing roughly 430–900 textured-triangle calls per tested turning frame, with 2,400–3,400 repeated camera-pose evaluations. Junction previews also draw both incoming/outgoing tree sets; the original tree art rebuilt dozens of rectangles per tree each frame.
- Camera transform/trigonometry and special-road views now live in a render-scoped cache, discarded in `finally`. Node lookup uses a route-owned WeakMap index. No cache is keyed solely by time: pause, reseed, and same-clock state changes remain safe.
- The road uses an adaptive mesh, testing projected edge error against a 3-logical-pixel target with bounded subdivision. Invisible tiles are rejected before painting; shared vertices reuse projection. Turning throat width is applied to geometry rather than first resampling a full-size canvas through hundreds of scanline blits. The aligned widening path remains available for the handoff, and its full-width spans are copied together. Source road art is invalidated by scroll/size/projection changes rather than blindly every frame.
- Seeded Journey trees use their exact original variant and quantized biome palette, rasterized lazily. The cache has a 24 MiB RGBA-pixel budget and at most two builds per frame. It never evicts residents already used in the current frame; overflow falls back to the original vector art to prevent cyclic cache thrashing. Canvas/driver overhead is additional to the pixel budget. Original PLAY and the unseeded low-level corner control keep their original tree draw path.
- Rotating rock/root textures remain cached; water source animation refreshes at 12 Hz while movement/projection stays full-rate. Off-screen special decorations are culled conservatively. No tree/decor spawn counts, gameplay rules, seeds, rewards, or biome colors were reduced/changed.
- Optional **Settings → PERFORMANCE** / **F9** / `?perf=1` exposes sampled rAF FPS, frame-time P95, CPU update/draw time, submitted texture triangles and tree-cache pixels on the device. The sampling overlay is disabled by default; CPU timings are not GPU completion timings. FPS/P95 include browser scheduling, so phone testing is still necessary.
- `journey-performance-audit.cjs LABEL` produces JSON and screenshots under `output/journey-performance`. Default: Edge, 480×800, 4× CPU throttle; `MOBILE=1` uses 414×896/DPR 2/touch (emulation, not iOS Safari). `CPU_RATE` changes throttle. Reports contain a warmed fixed-scene hotspot sample and a separate 90-frame update+render sequence. Avoid comparing timing runs with different machine load, throttle or instrumentation as device FPS.
- `journey-efficiency-audit.cjs` stresses 220 exact tree variants beyond cache capacity, enforces allocation/pixel budgets and zero steady-state churn, verifies node identity, frame-cache disposal, static/animated obstacle invalidation and the touch performance toggle. Existing renderer parity, seeded path, spawn, event, left/right input, Disco/Crimson encounter and curved-world tests remain required.

### Reversible curved-world projection trial

- Continuity revision: curved mode now paints the normal road directly as world-space ground polygons, using the same curved projection and clipping as Disco/Bloodwood floors. It no longer warps an already-projected road screenshot. Base strips share a single fill to avoid antialias seams; biome width and final forest soil match the normal road. Stable visual ground coordinates survive the turn handoff without changing gameplay distance.
- Silhouette continuity: root obstacles retain their ground mask after crossing the crest and when drawn over the rider. Their mother-tree foot offset scales like the baked turning face. Dead-end crowns have a 214 m preparation / 64 m fade runway, without extending ordinary tree or obstacle spawning; the same 14 cached end-cap actors survive preview-to-armed transitions. `journey-silhouette-continuity-audit.cjs` checks crest pixels for all root skins/sides, early crown pixels, actor identity, the scaled foot and legacy visibility.
- Trees retain their roots' ground mask on both sides of the crest instead of dropping the entire mask at 60 m; the old extra 6 px base offset is removed in this mode. Near-tree culling extends to the actual camera near plane rather than the legacy -6 m cutoff. Transformed preview trees are not tested against the incoming road using camera-relative coordinates. Tree lateral width is retained through handoff/rearming.
- Upcoming closed ends along a visible straight continuation are previewed before the destination junction is armed, using the same seeds/palettes as the final end-cap trees. The narrowed corner throat finishes its visual handoff only once the last narrowed section has left the viewport. These changes apply to the curved trial; legacy road art remains unchanged.
- `journey-curved-continuity-audit.cjs` checks near-tree survival, continuous crest masking, near-plane inverse projection, early dead-end previews, stable texture anchors and pixel-identical left/right road phase handoffs. The curved browser audit also captures Disco/Bloodwood exits. `CURVED=1` selects this renderer in the performance audit.

- Original rendering remains the default. Toggle **WORLD: CURVED TEST / ORIGINAL** in Settings (also accessible from pause), press **F8**, or launch with `?curvedWorld=1`. This is a session-only option. It applies to the original forest, including Disco/Bloodwood roads, not the separate FOREST TEST renderer, swamp/volcano or combat arenas.
- The trial uses one perspective scale `14 / (14 + depth)` for road width, lane spread, trees, hazards, pickups and venues. Its curved ground has a screen-space crest at 60 m; objects beyond the crest retain their true projected base and are clipped by the foreground ground. Tall silhouettes emerge before low obstacles. There is no far-distance compressed-depth/growth branch in the trial. The existing 150 m scenery envelope bounds drawing; a distant fade still softens the outer spawn boundary.
- Seeds, route choice, spawns, movement, collisions and encounter rules are unchanged. Original sprite art is reused. Toggling invalidates road/turn-surface caches; it does not restart the run. The classic renderer and its shorter hazard visibility window remain intact when disabled.
- `journey-curved-world-audit.cjs` checks 307 depths, scale agreement, visible-road inverse mapping, exact restoration of the original screenshot, all nine theme/hazard draw paths around the crest, cave approach and scope isolation. `journey-curved-world-browser-audit.cjs` tests six themed left/right turns, keyboard/touch toggles and state preservation, with approach/turn/exit screenshots.
- This is a visual A/B prototype, not a finished renderer replacement or an iPhone performance certification. Painter ordering and obstacle turn surfaces are retained; assess emergence/readability in motion before making this default or extending other biomes.

### Connected obstacles and completed venues

- `obstacleLaneGroups` joins only adjacent occupied lanes. Disco soda and Bloodwood blood pools draw one continuous shoreline per group; a left/right pair with an empty center remains two pools. Each connected soda spill retains its empty GAZOZ bottle.
- Bloodwood skeleton obstacles have distinct one-, two- and three-lane compositions: broken torso, long fallen skeleton and large horned carcass. They share a continuous spine/rib structure rather than repeated single-lane sprites. The three-lane turning surface includes the taller horns. Collision masks and jump rules are unchanged.
- Disco entrance buildings and the wolf lair are visible only before/during their slot. Completed, skipped, escaped or otherwise closed event records suppress both queuing and direct drawing of the venue; the surrounding biome and roadside decorations remain. This prevents riding through an already-finished event image.
- `journey-connected-obstacles-audit.cjs` checks all seven masks, 126 action/collision cases and six real start/finish venue lifecycle cases, and saves single/double/triple/separated art sheets.

With @napi-rs/canvas and playwright available through NODE_PATH:

```
node tools/journey-seed-audit.cjs
node tools/journey-junction-audit.cjs
node tools/journey-spawn-audit.cjs
node tools/journey-disco-browser-audit.cjs
node tools/journey-disco-obstacles-audit.cjs
node tools/journey-crimson-audit.cjs
node tools/journey-crimson-browser-audit.cjs
node tools/journey-biome-scenery-audit.cjs
node tools/journey-connected-obstacles-audit.cjs
node tools/journey-obstacle-render-parity-audit.cjs
node tools/journey-seed-browser-audit.cjs
node tools/journey-turn-input-audit.cjs
node tools/journey-turn-input-browser-audit.cjs
node tools/journey-roads-audit.cjs
node tools/journey-road-events-browser-audit.cjs
node tools/journey-render-audit.cjs --classic-only
node tools/journey-classic-browser-audit.cjs
node tools/minigame-port-audit.cjs
node tools/minigame-browser-audit.cjs
node tools/render-refactor-audit.cjs --skip-menu --skip-journey --baseline-distance
```

The pure audit verifies 300 seeds and traverses every generated path, checks non-adjacent road clearance and relative headings, plus 30 simulated full runs with different selection policies including consecutive left turns. Both the native and browser audits reject any intermediate mode change: the run must continue to bossintro without minigames or minibosses. The browser audit also checks branch input, a closed forward junction, replay/new seed, map isolation and normal PLAY isolation. Low-level rendering tests check corner continuity and original-road parity. These are functional desktop checks, not iPhone performance certification.

The older journey-event audit filenames forward to the new seeded audits.

The road-plan audit checks another 300 seeds: piece continuity, special probability, decreasing continuation chances, mandatory finale/normal exit, event placement and normal-only boss edges. Runtime probes verify blocking freeze, moving events, result idempotency, expiry, restarts and inert reserved content. `--baseline-distance` compares old render snapshots with their original distance budget; the deliberate new HUD progress ratio is tested separately.
