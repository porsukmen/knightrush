# UI migration · 2026-09-26

## Reference status

Treasure Chest is the sole current approved UI reference. Tavern/minigame UI
approval as a style reference was withdrawn by the user; the games stay present.
Character and background approvals are independent and unchanged.
UILab opens directly on the approved Treasure components, with lock and loot
examples and the characteristic lower parchment sheet. No Tavern or Royal-game
reference tabs, and no contextual palette selector remain. Versioned specimen
`ui-specimen-treasure-v2.js` is frozen separately from the production module;
the older v1 file is archived, not an active reference. Adaptations remain
pending user visual review, not automatically approved by passing tests.

## Current classic-brown pass

- Main menu now reuses the live bear-cave encounter, cropped above/below;
  approved bear idle breathing and Jonathan's right-down sword follow-through.
  The revised close composition places the larger knight in the left foreground,
  bear upper-centre/right and independent title on the upper-left cave wall.
  A short bottom-anchored sheet overlaps the continuous scene; portrait padding
  affects both the drawn buttons and their shared hit rectangles.
  Existing Treasure parchment holds PLAY, Minigames, Relic Codex, Settings and
  Debug Run. Forest Test, Old Forest, Quit and Changelog buttons/hit areas are
  hidden; their underlying features remain in source.
- Settings no longer exposes the old WORLD renderer toggle. Performance and
  sound controls (plus applicable debug controls) fit inside the parchment.
- `ParchmentPreview.html` is a standalone rolled-paper candidate only. It is
  not imported by the game or promoted to an approved UI reference.

- All eight existing venue IDs resolve to Treasure's single classic palette.
  Main-menu actions, gameplay/combat controls and all shared buttons therefore
  retain brown/cream materials regardless of biome. Semantic status colours stay.
- Treasure-derived `KRUI.sheet` supplies clipped top corners, double rules,
  diamond marks and #ddc79b parchment; explanatory text is dark brown.
- Pause/settings have parchment bodies. Main-menu logo/character are unchanged.
- Minigame catalogue, relic codex, changelog, score screen and route-map UI use
  the same brown frame language; map route colours and item rarities stay semantic.
- Roadside conversations, camp, Wolf Den choices and combat-loot panels use
  parchment. Wolf battles themselves retain their deliberately minimal HUD.
- Inn service sheet, caravan description and forge instructions use parchment.
- Duke, Shuffle, arm wrestling and chug lower instructions/results use parchment;
  Table Slide and shared tavern panels use the same component. Gameplay and
  card/table/character drawing functions are unchanged.
- Treasure's approved mechanical lock, loot layout and original sheet remain
  the anchor, not replacements derived from tavern layouts.

## Prior integration (superseded palette choices)

- Main menu actions; logo, rider and backdrop unchanged.
- Minigames catalogue: consistent panels, titles, PLAY actions and scrollbar.
- Settings and pause overlays, with venue-aware colours and unchanged hit areas.
- Combat action buttons: material frame/text; rarity and action colours preserved.
- Table Slide, Duke, Royal Shuffle, arm wrestling, chug and shared tavern games:
  common buttons/panels; gameplay, props, characters and animations unchanged.
- Mossy Oak Inn: heading, buttons and price legibility.
- Autumn Caravan: heading, description panel, buy/reroll/navigation buttons.
- Basalt Forge: ledger panels, selected card accent and copper-toned actions.
- Treasure: action buttons. Its approved heading, loot and lock composition remain.
- Legacy smith/merchant common buttons and their separately drawn price labels.

## Not yet a full redesign

Skill trees/tooltips, authoring/debug labs and bespoke legacy non-tavern minigame
or old-shop content can still contain local presentation. The shared controls
are brown, but this does not claim every old content layout was redesigned.
Fine-grained health, rarity and combat status colours are intentionally retained.
Contextual Crimson/Disco UI palettes are no longer active or approved references.

## Checks

Main-menu map parchment trial (2026-09-27): only `drawMenu` uses the new
native Canvas `assets/ui/menu-map-paper.js` surface. Existing button rectangles,
title, cave/actors/idle animations and photo-mode behavior are unchanged.
Pause, settings, events and all other sheets still use the approved Treasure
components. The static paper is cached in one surface (DPR capped at 2, less
than 2 MiB), not repainted every animation frame. This is a user-requested trial,
not a newly approved UI reference. `ParchmentPreview.html` remains independent.

Screenshot routing (2026-09-27): photo mode retains each current menu, event and
minigame renderer instead of exposing an old world underneath. Gameplay HUD and
pause overlays stay hidden; minigame scene props remain visible. PLAY bypasses
the retained character selector and starts Jonathan. Legacy forest source is
retained but its background fallback and F8 renderer switch are retired.
`node tools/photo-mode-audit.cjs` covers all 19 registered games, five menus,
freeze/exit behavior and direct Jonathan startup at phone and desktop sizes.

Wolf Den only (2026-09-26): shortened event choices using existing buttons;
direct scene hotspots added alongside keyboard actions. During den combat,
wallet/score/stage and empty relic slots are omitted; duplicate turn prose and
the empty special meter are suppressed. Health, active relics, posture, AP,
Resolve and actionable combat controls remain. No general HUD redesign implied.

`node tools/ui-system-audit.cjs`: all palettes/states, dark/light text contrast,
canvas-state isolation, desktop/phone integrated captures and state invariance.
`node tools/minigame-menu-input-audit.cjs`: wheel, drag, touch scrolling, preview
rendering, opening a game and returning after scrolling.
Character reference baselines are not regenerated by UI work.
