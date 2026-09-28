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
current-system and states tabs first, then the original components/lock/loot
when comparing provenance. The current standard includes the symmetric lower
parchment ornament and classic brown text.
New adaptations remain candidates until explicitly approved.

The original frozen specimen is `art-source/knight-rush-ui/ui-specimen-treasure-v2.js`.
The explicitly captured current specimen is `art-source/knight-rush-ui/ui-specimen-classic-v3.js`.
The independently maintained production module is `assets/ui/knight-rush-ui.js`.
Do not silently sync the frozen Lab to a changed game or call technical test
success visual approval.

## One classic brown system

Use Treasure's brown palette everywhere: main menu, pause/settings, running
controls, events, shops and minigames. Contextual recolouring is suspended.
Legacy venue IDs are compatibility aliases, not separate palettes.
Description/instruction/result regions use `KRUI.sheet`: #ddc79b parchment,
clipped corners, mirrored upper/lower fine double rules and diamond ornaments.
Keep content (including button shadows) at least 28 units inside both ends.
Buttons use #e8d6ab; backdrop #30241e; main ink #493323; helper ink #725839.
Keep live scene/character areas unobstructed. Sheets are UI, not scene filters.

Only UI surface/material tokens change. Success, danger, warning and focus
retain their meaning through `KRUI.semantic`. Pair state colours with labels,
disabled styling or a selection marker. A red-tinted venue is not itself an
error state. Text must remain readable on its actual panel, not merely match
the room colour.

## Mandatory action hierarchy (apply during every UI task)

Classify each visible control by its job in the CURRENT state before drawing.
Do not infer priority from label text, venue, old caller colours or button order.

| Job | Material / options | Examples |
| --- | --- | --- |
| Main action / progress | cream, dark ink; default button | Play, buy, collect, start/rematch, result Continue |
| Equal gameplay alternatives | same cream emphasis | tax pay vs challenge; Duke raise vs call bluff; inn rest vs games |
| Auxiliary / cancel / exit before completion | brown, cream ink; `variant:'secondary'` | Back, pause, settings, reroll, leave unclaimed loot |
| Selection group / toggle | secondary + explicit `selected` boolean | difficulty, Duke count/face, Road Lab tabs, settings toggles |
| Unavailable | `enabled:false`, muted face/ink | unaffordable purchase, sold item, waiting animation |

Selected turns a choice cream, with a subtly seated face (2 units lower), a
fully removed cast shadow and a small hollow diamond centered below the label;
no selection outline. Keep the light-brown material bevel, not a dark base below it.
The diamond has a 1-unit light-brown (#a8824a) stroke, no fill or dark ink.
Keep text horizontally centered and leave vertical clearance above the marker.
Use a smaller marker for compact numeric/icon controls; do not overlap contents
or the lower bevel. Keep hit bounds fixed.
Focus is separate: `focus:true` preserves material and uses an outside outline
only for keyboard/controller navigation, not as a synonym for selected.
Disabled wins over both: muted face/ink, subdued light upper edge (#d0bea0),
brown lower edge. Never give disabled paper two identical brown bevel lines.
Never portray an available unselected option as disabled. A pressed action can
use `selected` for feedback without recolouring its equivalent alternatives.
Keep both bevel rules identical to a normal button; never paint selection over
the bottom rim or add a second dark underline inside it.

State-dependent examples: camp leave is secondary before resting, disabled
during rest, primary afterward; leaving loot is secondary while rewards remain
and primary Continue once collected; lone post-dialogue BACK TO THE ROAD is
primary completion, whereas the same label alongside a service is secondary.
Do not force exactly one primary when choices are equivalent, or invent one on
an all-utility screen such as pause/settings. Price/count labels drawn separately
must use onDark for secondary, ink for primary, mutedInk when disabled.

Use shared KRUI helpers; pass roles explicitly through local wrappers. Do not
create per-screen palettes or new label-regex priority heuristics. Preserve
actual affordability, hit targets, input and game state. Audit both entry and
completion states, not just a screenshot of the initial screen. Keep panels off
characters/gameplay. Red/green/yellow communicate status, not button priority.

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
isolation and integrated screens. Run `node tools/ui-button-material-audit.cjs`
for selection bevel/disabled precedence, and `node tools/ui-action-role-audit.cjs`
for integrated action roles and state transitions. Run `node tools/minigame-menu-input-audit.cjs`
when menu drawing/scroll clipping changes. Relevant feature tests remain needed
when adapting that feature's controls. Use NODE_PATH from the project's existing
runtime tooling if required.

Inspect screenshots at desktop and phone widths: clipping, contrast, hierarchy,
gameplay occlusion, price/button contrast and selected/disabled states. Verify
scroll and opening games, not just rendering. Keep a record of migrated surfaces
in `art-source/knight-rush-ui/migration.md`; untouched systems must not be called
revamped. New adaptations require user visual review. Do not auto-update
character baselines during UI-only changes.
