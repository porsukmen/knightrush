# Minigame-only integration — 2026-09-19

Source: `KnightRushMinigame.html` (user-supplied version).
Target: `KnightRush.html` (current game, not the older donor game).

The donor's complete 4,303-line MINIGAMES section is retained verbatim, including
19 definitions, practice purses, rules, drawing functions and its system audit.
Only its minigame-specific synthesized sound methods were added to current SFX.
No donor skills, combat, runner, character or main rendering code replaced ours.

## Entry and integration

- Main menu: MINIGAMES next to RELIC CODEX; PLAY and Journey NEW remain.
- Standalone catalogue supports wheel, touch/mouse drag and arrow-key scrolling.
- `MINIGAME_MODES` dispatches updates and full-screen drawing, preventing the
  ordinary player/HUD from appearing over the minigames.
- The host adapter routes minigame keys and gestures before runner/parry input.
  Paused/settings input does not start minigame gestures. Auto-pause cancels holds.
- All practice rewards remain local to their minigame. No run encounters,
  campaign coin rewards, new save format or economy changes were added.
- Source file is unchanged; no Git push was requested or performed for this port.

## Checks run

```text
node tools/validate-html.cjs KnightRush.html
node tools/validate-runtime.cjs KnightRush.html --boot-only
node tools/minigame-port-audit.cjs
node tools/minigame-browser-audit.cjs
node tools/journey-render-audit.cjs --classic-only
node tools/journey-classic-browser-audit.cjs
node tools/render-refactor-audit.cjs --skip-menu
node tools/validate-runtime.cjs KnightRush.html --squire --shield-bash --global-chain
```

Canvas/browser tests use the existing NODE_PATH / KNIGHT_CANVAS_MODULE /
KNIGHT_PLAYWRIGHT_MODULE setup. Browser test uses installed Edge.

The native minigame audit checks source fidelity, all 19 intros, active updates,
rendering and Back navigation, plus campaign-state and parry/pause isolation.
The browser test checks all 19 keyboard starts/Back actions, wheel/drag catalogue
navigation through the last card, actual touch punches, paused input, forge
hold/release and blur cancellation, knife flick and pickpocket hold/release.
Screenshots are in `output/minigames-browser/`.

The existing 18 non-menu visual baselines remain pixel-identical; only main-menu
layout changed deliberately. Journey and focused combat regression tests passed.
These checks are not exhaustive win/loss-path testing for every game, nor a real
iPhone performance or touch-latency certification.

`import-minigames.cjs` documents the one-time mechanical transplant and refuses
to run again when MinigameDefinition already exists. Do not re-run it to update
the port; review any later donor changes selectively.
