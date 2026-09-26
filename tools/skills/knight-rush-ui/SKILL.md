---
name: knight-rush-ui
description: Design and verify Knight Rush menus, HUDs, services and minigame UI using the sole approved Treasure Chest reference, classic brown materials and parchment. Excludes character/background redesign and gameplay changes.
---

# Knight Rush UI

Resolve repo paths from the project root. Begin in `UILab.html`, a standalone
reference document, not a playable game or an embedded game iframe.

## Approval and references

Treasure Chest UI is the ONLY current approved UI reference. The user withdrew
tavern/minigame UI as a reference; those games remain but are not style anchors.
This does not withdraw character or background approval. Inspect the Treasure
components, lock and loot tabs, especially the lower parchment with brown text.
New adaptations remain candidates until explicitly approved.

The frozen specimen is `art-source/knight-rush-ui/ui-specimen-treasure-v2.js`.
The independently maintained production module is `assets/ui/knight-rush-ui.js`.
Do not silently sync the frozen Lab to a changed game or call technical test
success visual approval.

## One classic brown system

Use Treasure's brown palette everywhere: main menu, pause/settings, running
controls, events, shops and minigames. Contextual recolouring is suspended.
Legacy venue IDs are compatibility aliases, not separate palettes.
Description/instruction/result regions use `KRUI.sheet`: #ddc79b parchment,
clipped upper corners, fine double rule and two small diamond ornaments.
Buttons use #e8d6ab; backdrop #30241e; main ink #493323; helper ink #725839.
Keep live scene/character areas unobstructed. Sheets are UI, not scene filters.

Only UI surface/material tokens change. Success, danger, warning and focus
retain their meaning through `KRUI.semantic`. Pair state colours with labels,
disabled styling or a selection outline. A red-tinted venue is not itself an
error state. Text must remain readable on its actual panel, not merely match
the room colour.

Primary actions use light material and dark ink; supporting/back actions may
use dark panels and light ink. Disabled controls lose emphasis but remain
legible. Selected/focused controls have an outline, not just a hue difference.
Do not multiply equally bright primary buttons or add giant opaque panels
over the game/character.

## Native integration

`KRUI.button(ctx, rect, label, theme, options)` supports enabled, selected,
focus, variant ('secondary'), size. `panel`, `heading`, `text` and `theme`
provide the same material language. Pass an explicit context and theme.
Helpers restore canvas state and never read/write game state.

Edit UI-only drawing functions; preserve existing hit rectangles, scroll clips,
transforms, keyboard actions, timing, economy, text content and disabled logic.
Never theme by monkey-patching Canvas fillStyle/fillText, broad colour replacement,
or filtering a full scene: these also recolour approved character/prop art.
An icon or price drawn separately must use the right on-paper/on-dark ink.
Preserve semantic rarity/health/status colours rather than converting them to
decoration. Do not replace the title logo or repaint approved characters as a
side effect of a UI task.

Respect the 480-unit game coordinate system and existing viewport transform.
Lab uses independent coordinates. Keep game controls in place unless layout is
explicitly being redesigned; then update and test draw/hit rectangles together.
Prefer readable 12–14 unit action text and generous touch targets; retain compact
existing debug controls only where needed. Check long prices, disabled labels
and narrow phone screens rather than squeezing everything with tiny text.

Use knight-rush-art only when actually changing an icon, item or character.
Use knight-rush-cutscene only when changing a background or scene integration.
UI approval does not authorize either kind of artwork edit.

## Verification and scope

Run `node tools/ui-system-audit.cjs` for Lab palette/state checks, canvas-state
isolation and integrated screens. Run `node tools/minigame-menu-input-audit.cjs`
when menu drawing/scroll clipping changes. Relevant feature tests remain needed
when adapting that feature's controls. Use NODE_PATH from the project's existing
runtime tooling if required.

Inspect screenshots at desktop and phone widths: clipping, contrast, hierarchy,
gameplay occlusion, price/button contrast and selected/disabled states. Verify
scroll and opening games, not just rendering. Keep a record of migrated surfaces
in `art-source/knight-rush-ui/migration.md`; untouched systems must not be called
revamped. New adaptations require user visual review. Do not auto-update
character baselines during UI-only changes.
