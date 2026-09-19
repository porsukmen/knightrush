# Presentation cleanup — 2026-09-19

This is a behavior-preserving cleanup, not a new renderer or a skill rebalance.
The game remains one self-contained HTML entry point. Existing script-extraction
audits and the single-file Pages deployment still work.

## Ownership

- `buildWorldDrawQueue`: resets reusable frame queues, gathers stage geometry,
  scenery and actors, then sorts the world queue far-to-near.
- `queueRoadsideWorld` / `queueVisibleJourneyTrees`: ordinary scenery and the
  incoming/outgoing Journey tree lists, with identical visibility boundaries.
- `obstacleDrawsOverRider`: shared root/arch layering rule, including Greaves.
- `render`: frame transforms and painter-order orchestration. World geometry,
  rider, foreground arches, particles and UI must retain this order.
- `FULLSCREEN_RENDERERS`: full-screen UI dispatch and world-rider suppression.
- `drawModeScreen`: menus or the gameplay HUD, keeping HUD transforms independent
  of screen shake. `drawCombatDebugGeometry` owns debug-only geometry.
- `captureJourneyRoadActors`: preserves old-road entity identity during a turn.
- `finishJourneyCornerTurn`: hands prepared trees to the ordinary road spawner.
- `JOURNEY_TURN_SECONDS` / `JOURNEY_WIDEN_DISTANCE`: shared transition constants.

Avoid changing art, combat math or gameplay timing as part of this cleanup.
Normal PLAY still uses the original map; Journey reuses it with the left corner.
The experimental world renderer remains isolated to FOREST TEST.

## Validation

Run from the repository root with Node and `@napi-rs/canvas` / `playwright`
available via NODE_PATH (or the existing KNIGHT_CANVAS_MODULE and
KNIGHT_PLAYWRIGHT_MODULE overrides). The browser test currently uses Edge.

```text
node tools/validate-html.cjs KnightRush.html
node tools/validate-runtime.cjs KnightRush.html --boot-only
node tools/journey-render-audit.cjs --classic-only
node tools/journey-classic-browser-audit.cjs
node tools/validate-runtime.cjs KnightRush.html --squire --shield-bash --global-chain
```

For presentation edits, first capture a baseline BEFORE making changes:

```text
node tools/render-refactor-audit.cjs --record
# make the presentation changes
node tools/render-refactor-audit.cjs
```

This compares raw pixel hashes for 19 deterministic frames (menus/labs, run,
pause/photo, shake, cave, foreground root and Journey stages). Baselines are
local files in `output/`: fonts and raster-library versions are machine-specific.
Never re-record a failed baseline merely to make a regression pass.

Completed checks: initial world-queue extraction preserved all 10 original
frame hashes; subsequent UI extraction preserved the expanded 19-frame set.
Journey geometry/pixel checks, actual browser turn input and the focused
Chain/Shield Bash/Squire runtime audits passed. These are targeted checks,
not exhaustive all-skill coverage or an iPhone performance benchmark.

No remote push was made for this cleanup. The earlier GitHub checkpoint is
`2cd29bc`; local Journey and refactor edits remain available for review.
