# Seeded Journey prototype (v3)

Entry: **NEW / SEEDED JOURNEY** in KnightRush.html. Normal PLAY is unchanged. Current trial is **roads only**: intermediate events and fights are disabled; the terminal boss remains.

## Play

- A fresh NEW run generates a random 32-bit seed. Pause → ROUTE MAP shows the seed, all reachable nodes, current position and selected edges.
- Move to the left/right lane, then swipe/press that direction again as the junction approaches (within 34 m). The route/turn text overlays have been removed.
- Where a straight exit exists, doing nothing continues straight. All side turns, including single-exit corners, require player input. If forward is closed, movement and distance stop at the junction until the player selects a side; there is no automatic fallback turn.
- Closed forward roads use the original tree grove. No replacement artwork or pixel filter is introduced.
- **REPLAY SEED** restarts the run with the same map seed and rider; **NEW SEED** generates a fresh run but keeps the map open and paused for browsing. Both reset campaign progress as a normal new run. Escape closes the map back to pause; a second Escape resumes.
- A URL query such as `?routeSeed=123` pins the seed for NEW. The in-map NEW SEED button can override it for that run.

## Graph and progression

The generator builds the complete forward-only graph before the run. Branches can merge; there is no privileged main road. Every reachable node has a path to one terminal boss. Unreachable nodes are removed.

Six seeded leg-length budgets vary the road lengths. Node distances are ordered and all paths consume the same total stage distance. The distance budget is fixed for the generated stage; a later speed change affects travel time, not the graph's endpoint. Turns and every road count toward that budget; minigames and fights pause it.

The scene uses local coordinates rebased after each junction. This is a schematic Slay-the-Spire-style network, not a geographically continuous overhead world. The debug map shows graph connectivity, not exact physical road geometry.

## Encounters and scope

- The first rollout enables generated networks on **forest stages**. Other biomes retain their existing route rendering/progression.
- All intermediate nodes are roads. Minigame and fight dispatch adapters remain available for later, but no such nodes are generated.
- The old fixed midpoint miniboss gate remains disabled while the generated graph is active, so it cannot interrupt the route-only trial.
- Standalone minigames and normal PLAY encounters are unchanged. Ordinary runner obstacles and pickups remain.
- The former encounter RNG draws are reserved so existing seeds retain the same road lengths and connections.
- Route topology, leg lengths and terminal encounter selection are seeded. Ordinary obstacle placement and scenery variants are not a deterministic replay system yet.
- Rare nodes, reward balance, full biome transitions and save/resume are outside this first trial.

## Verification

With @napi-rs/canvas and playwright available through NODE_PATH:

```
node tools/journey-seed-audit.cjs
node tools/journey-seed-browser-audit.cjs
node tools/journey-render-audit.cjs --classic-only
node tools/journey-classic-browser-audit.cjs
node tools/minigame-port-audit.cjs
node tools/minigame-browser-audit.cjs
node tools/render-refactor-audit.cjs --skip-menu --skip-journey
```

The pure audit verifies 2,000 seeds and traverses every generated path, plus 30 simulated full runs with different selection policies. Both the native and browser audits reject any intermediate mode change: the run must continue to bossintro without minigames or minibosses. The browser audit also checks branch input, a closed forward junction, replay/new seed, map isolation and normal PLAY isolation. Low-level rendering tests check corner continuity and original-road parity. These are functional desktop checks, not iPhone performance certification.

The older journey-event audit filenames forward to the new seeded audits.
