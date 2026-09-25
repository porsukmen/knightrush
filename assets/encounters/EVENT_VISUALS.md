# Event visual ownership

`event-visuals.js` is the shared runtime manager, loaded on demand. The scene
adapter owns drawing, not image lifetime. Current bitmap-backed registration:
Mushroom Gatherer, road-only Basalt Forge, Treasure Grove, Autumn Caravan and Mossy Oak Inn;
other existing code-native events remain unchanged. Basalt Forge uses a generated workshop plate, a native
animated dwarf, and a clipped redraw of the same plate for foreground anvil
occlusion (no second full-resolution bitmap). Its standard plate is 1448x1086
(6,290,112 decoded RGBA bytes); mobile is 768x576 (1,769,472 bytes).

Autumn Caravan uses these same two image dimensions. Its clearing is a single
bottom-anchored cover crop; the seated merchant, parked wagon/horse and red
ground cloth remain native live art. The material-lighting adapter is scoped
to this scene, not the approved actor globally. Road-event exit or Merchant Lab
exit releases the image; the town general store is not changed.

Mossy Oak Inn selects v4's same-layout clarity edit, standard1448x1086/mobile768x576.
The innkeeper is native and scene-lit; foreground counter occlusion redraws a
clipped part of the same plate, with forearms and wiping cloth layered above. Inn exit
and reset release the plate.

The five inn table games use a separate candidate `tavern-games` alcove plate
(standard 1086×1448 / mobile 576×768; 6,290,112 / 1,769,472 RGBA bytes).
It loads only on table-game entry through the shared cutscene handler. Live
opponents, tables and all movable gameplay props are native; the rules remain
unchanged. Leaving cancels/releases game artwork; returning to the inn reopens
the approved Mossy Oak scene. The roadside taxman's arm wrestling is excluded.
Audit: `node tools/tavern-games-audit.cjs`.

Tankard Slide now has a separate candidate `tavern-slide` plate (same two size
tiers and decoded budgets), plus a native wooden table and rival. Only this
game selects it; the other four still use `tavern-games`. Its physical table
coordinates are independent of perspective and its AI uses the live fixed-step
solver, evaluated in small batches during the opponent's turn. No extra bitmap
cache, shader or per-frame image processing. Direct prototype entry:
`?tavernslidelab=1`; audit: `node tools/tavern-slide-audit.cjs`.

## Limits

| Tier | Reserved RGBA budget | Maximum resident/loading plates |
| --- | --- | --- |
| Mobile (existing LOW_POWER hints) | 6 MiB | 2 |
| Standard | 14 MiB | 2 |

Both READY and LOADING entries reserve width * height * 4 bytes. An active plate
is pinned; speculative prefetch cannot evict it. Unpinned entries use LRU eviction.
Dimensions in the catalog must match assets; mismatches fail rather than silently
expanding the budget. This is application-owned payload accounting, not a total
RAM/GPU guarantee: browser decode caches and texture copies are outside our control.

## API

- `prefetch(id)`: deduplicated Promise<boolean>; false if unknown, over budget,
  timeout or load/decode failure. No active plate is evicted to satisfy it.
- `activate(id)`: switch the single active pin and ensure loading. Can evict the
  previous scene if needed. Call from transition/input logic, not drawing.
- `peek(id)`: ready Image or null; draw directly and do not retain it in an NPC.
- `release(id)`: cancel/release that plate, including pending decode callbacks.
- `clear()`: release all application references and invalidate in-flight entries.
- `describe(id)` / `report()`: debug snapshots; never call each frame for logging.

The manager removes `src`, clears image handlers/timers, drops its references and
resolves cancelled waiters false. A late decode cannot restore an evicted entry.
Errors/timeouts leave the event's code-native fallback playable. Explicit later
requests can retry; the run controller does not retry a failed plate every frame.

## Current game integration

`updateJourneyEventVisuals` considers only the active road, at most 180m ahead,
rescanning after 24m or an edge change. It does not preload unexplored branches.
Only eligible registered bitmap events request an image. A swipe into the event
activates its plate. Completion, refusal, passing, abandonment, menu/score/town,
new run or seed reset clears ownership. The shared module-loader epoch stops late
script completion from starting an image request after a reset.

The forge stop activates the same handler on shop entry, scoped to its road
event token. Leaving the shop releases the plate. The ordinary town smith is
not routed through this scene.

The factory supports active + one lookahead. Current blocking conversations do
not advance the road, so the run controller generally needs only one plate; it
does not invent extra prefetch work to fill two slots. No per-frame filter,
pixel readback, separate full-screen plate canvas, or lab audit runs in gameplay.

## Adding a scene

1. Package the approved/candidate plate in standard and mobile versions. Preserve
   source and approval ownership separately from deployment.
2. Add an ID and exact dimensions/paths to `assets` in `event-visuals.js`.
3. Register its adapter in the catalog in `cutscene-handler.js`, and add its
   content-to-scene ID in `JOURNEY_CUTSCENE_BINDINGS` in the game. The common
   `prepareCutscene` loader handles dependencies; no per-NPC loader is needed.
   Use the shared image manager rather than `new Image` inside the scene.
4. Keep actor/material adapters scoped; draw using `peek`, fallback when null.
5. Test cancellation, reset during load, actual mobile frame, choices and return.

Checks: `node tools/cutscene-audit.cjs`,
`node tools/gatherer-event-browser-audit.cjs`,
`node tools/background-illustration-audit.cjs`. These are not physical-phone FPS
measurements. No automatic reference promotion or baseline rewriting.

## Cutscene handler

`cutscene-handler.js` owns presentation lifecycle above this image manager:

- `prepare(sceneId)`: load the drawing adapter and prefetch its image; never open
  a conversation or change game mode. Use while approaching or for one next slide.
- `open(sceneId, owner)`: one active scene, identified by the event session token.
  State is `loading`, then `ready` or `fallback`. Repeated open for the same scene
  and owner shares the pending promise; no duplicate load or automatic retry loop.
- `draw(sceneId, time)`: draw only the current ready scene, otherwise return false
  so the game draws its native fallback. Draw exceptions fail once to fallback and
  release the plate. The adapter restores canvas state in a finally block.
- `coversWorld(sceneId)`: skip the hidden run renderer only for a ready opaque
  scene. No image loading, image copies or report allocation on the render path.
- `close(owner)`: close only the matching event's scene; stale owners cannot close
  a newer one. Release its image. `reset()` also clears speculative images and
  invalidates pending adapter/image work, returning to `idle`.
- `report()`: diagnostic snapshot for tests/labs, not a per-frame logger.

The game still owns dialogue, choice hitboxes, pause, frozen road distance, quest
progress, rewards and return to the run. The handler does not install input
listeners or create a second animation loop. A failed image therefore cannot
prevent choosing an answer or leaving. No game art, palette or UI was redesigned.

Each catalog entry supplies `module`, `symbol`, `assetId`, `drawMethod` and
`opaque`. The adapter's `assetId` must match. The existing gatherer adapter uses
`drawConversation(t)` and draws the plate plus native animated actor. Future
scene adapters can layer foreground objects without changing lifecycle code.
For a multi-slide event, call `open(nextSceneId, sameSessionToken)` and optionally
`prepare(followingSceneId)`; gameplay remains responsible for story choices.
Only the current scene may draw. Reset/scene changes invalidate late completions.

The gatherer compatibility helper remains for existing labs; production routing
uses `prepareCutscene` and `JOURNEY_CUTSCENE_BINDINGS`. Preloading does NOT grant
permission to show an NPC; the existing lane + fresh swipe checks still own entry.

Audit: `node tools/cutscene-handler-audit.cjs` (also run by `cutscene-audit.cjs`).
Browser coverage: gatherer-event, event-visuals, normal-events and background
illustration audits. Draw/logic tests are not physical-phone performance measurements.

## Gatherer simplification trial (2026-09-25)

Default Gatherer adapter selects `gatherer-simple`; `?clearing=crisp` selects
the unchanged approved `gatherer`, and `?clearing=original` the older archive.
The simplified candidate uses exactly the same standard/mobile decoded sizes
as the approved crisp plate. Handler and adapter resolve the same ID; only
one variant loads. Sharpness is in the source art, never a runtime filter.
Background Lab defaults to the candidate and links to the protected reference.
