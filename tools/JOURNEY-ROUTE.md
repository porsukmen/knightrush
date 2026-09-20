# Seeded Journey foundation (v7)

Entry: **NEW / SEEDED JOURNEY** in KnightRush.html. The shared base distance is now 1,984.5 (1,323 × 1.5), affecting ordinary PLAY as well. NEW additionally generates normal/special road plans and event slots. Disco roads now have world art and a live Disco King stop; other event types remain reserved.

## Play

- A fresh NEW run generates a random 32-bit seed. Pause → ROUTE MAP shows the seed, all reachable nodes, current position and selected edges.
- Move to the left/right lane, then swipe/press that direction again as the junction approaches. An explicit outer-lane press is remembered from when the road mouth enters the 60 m horizon (53 m before the node), rather than discarded outside the old 34 m window. Movement cannot carry an accepted late turn beyond its commit window. The route/turn text overlays have been removed.
- Where a straight exit exists, doing nothing continues straight. All side turns, including single-exit corners, require player input. If forward is closed, movement and distance stop at the junction until the player selects a side; there is no automatic fallback turn.
- Passing straight preserves the unchosen Disco branch at its world position until the old junction leaves view. Its mouth carries the actual colored dance floor, mirror balls, speakers and a few dancers; the nearby trees stay green. No purple-dirt entry, sign/arrow UI or selection-triggered palette switch is used.
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

The Disco adapter is registered by default. Generic route-only and adapter audits explicitly remove it in their isolated test environment. `journey-disco-browser-audit.cjs` tests the shipped adapter, actual three-round completion, pause/back, exact distance preservation, no re-entry, straight and side-road previews, and takes world screenshots.

## Disco road trial

- Dancers are separate world-anchored actors at ±7.1 m along the verge, rendered at alpha 1 independently of lamp strength. The detached incoming-shoulder dancer was removed; entrance equipment remains. Sky colors and the overhead canopy receive a subtle distance-based purple palette inside Disco. The canopy uses a lazily generated second cache, invalidated only with the normal resolution/padding cache, not rebuilt each frame. Dance tiles are single full-row polygons: the former 2 m subdivision caused a shimmering midpoint seam in each 4 m tile.

- Special road length is tripled for both Disco and bloodwood. Disco event placement sits near 52% of the extended road, giving roughly 11–21 seconds of running before the venue at initial pace and a similar stretch afterward. Metadata retains the `disco_finale` ID for compatibility, but the stop is no longer at the exit.
- Disco is entirely location-authored, including before selection. Fully colored dance tiles extend 5 m into the junction throat from the start; there is no purple soil strip or gradual tile appearance. The road material is opaque, never alpha-composited over green road sheets. Trees stay green through the first 30 m, then reach full purple at 95 m, with the usual final 70 m exit fade. Sparse entrance props precede the full party. Tree instances retain their spatial palette and originating edge ID through preview/capture/handoff. Dead-end backdrop trees explicitly capture the incoming road palette at creation. There is no turn-timer or post-turn whole-scene recoloring. Turn-to-settling road coordinates blend to the final local origin. Props are spaced at 24 m with floor lights halfway between; everything is culled by camera depth. Beams are low-alpha Canvas geometry, not real lights; the road patches themselves always use alpha 1. Tree color interpolation uses 25 quantized levels to bound the color cache.
- A full-width nightclub entrance marks the stop: dark recessed passage, curtains, tall speaker towers, a DISCO KING header, mirror ball and painted beams. It enters at the scenery spawn horizon with the lair-style soft-horizon growth and fills the view at the event threshold. Its world anchor is 2 m beyond the stop. A 24 m clearance on either side prevents obstacles/coins intersecting the venue, including actors scheduled before arming the road. The usual obstacle stream resumes outside that small area.
- Disco obstacles are skins bound once at spawn to the actual Disco road piece (not the preview/spill envelope). Fallen speaker cabinets replace boulders; suspended cable bundles replace duck roots, and coiled leads replace the jump sections; irregular purple grape-soda spills replace ponds. Every occupied spill lane includes an empty ribbed PET bottle with a GAZOZ / 2L wrapper, open neck and loose cap. The original type IDs, lane masks, jump/duck checks and relic immunities are unchanged. Safe lanes stay open, including non-adjacent speaker layouts. Cables no longer spawn/clear a mother tree. Turn surfaces retain the same skin, with compact cable bounds and separate speaker side faces. Normal roads and classic PLAY keep the original art.
- Reaching the stop opens the existing Disco King minigame without changing its drawings/rules. Run distance freezes, completion/skip is recorded once, and leaving resumes the same edge. Restart disposes the session. No new artifact/reward balance or cross-run persistence is introduced.
- Decorations use Canvas rectangles and clipped ground polygons, with no dynamic lights, new shaders, image assets or full-screen color filter. Desktop rendering checks do not certify iPhone frame rate.

## Verification

With @napi-rs/canvas and playwright available through NODE_PATH:

```
node tools/journey-seed-audit.cjs
node tools/journey-junction-audit.cjs
node tools/journey-spawn-audit.cjs
node tools/journey-disco-browser-audit.cjs
node tools/journey-disco-obstacles-audit.cjs
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
