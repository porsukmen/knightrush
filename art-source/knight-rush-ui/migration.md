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

Side-scroll correction (2026-09-27): user requested a standalone trial, not
main-menu integration. The unauthorized side-cylinder change was reverted to
the prior map parchment. `ScrollPreview.html` is isolated and not imported by
the game. After user clarification, its current candidate invokes the frozen
Treasure sheet and mirrors its upper edge at the bottom: identical clipped
corners, lower diamonds and double rule restored on request. Sheet height is
240 logical units instead of 212, leaving 28 units between the last button's
shadow and the lower rule; type and button sizes are unchanged. The original upper edge remains; side
rolls and the small lower curl were superseded. Do not integrate without explicit approval; the frozen UI Lab and other
parchments remain untouched.

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

Tavern visibility pass (2026-09-27): kept the approved Treasure material, not
the standalone ScrollPreview candidate. Arm/chug sheets now begin at 622 rather
than 516 so the knight's forearm and mug remain visible. Shortened their intro
copy and moved start/replay and pressure/tilt controls with their hit areas.
Shuffle has a compact in-play caption below the table instead of a full-height
sheet. Duke's sheet clears the near dice/seals; row labels and buttons have
separate vertical spacing. Barry's intro/result panels are shorter and their
titles clear the parchment ornament. Character artwork, rules, AI and timing
are unchanged. Verified desktop/phone UI, five-game input/outcome/return flow,
arm pressure/cancellation, and chug drag/cancellation and extreme poses.

Tax collector seal candidate (2026-09-27): Treasure-only brown heading, dark
pause button and compact parchment at y=658 below the physical tabletop.
Instructions/results start below the sheet ornament; primary start/leave share
one 290x44 logical-pixel draw/hit rectangle. The gameplay area remains exposed.
Photo mode hides the heading, pause and parchment without replacing the scene.
Desktop, 390px and 320px captures checked alongside the live UILab loot view.
UI-system audit passes; scene/gameplay verification is in royal-tax-collector-audit.
No venue tint, ScrollPreview promotion or changes to other menu layouts.

Matching-edge trial (2026-09-27, user requested): production parchment sheets
now mirror the top double rule and paired diamond dots at the bottom, with
matching clipped corners, based on the independent ScrollPreview experiment.
Main menu now uses this clean Treasure sheet instead of the map-paper drawing;
the map renderer stays in code. Cave, knight, bear, idle motion and logo remain.
The frozen UILab specimen and standalone ScrollPreview remain unchanged.

Reserved bottom ornament space in fight/chest loot, wolf choices, pause/settings,
duke/shuffle/arm/chug/slide, tax seal, forge and merchant information panels.
Removed redundant footer hints or merged them into existing status text instead
of shrinking the whole scene. Arm/chug, wolf and merchant button rectangles
were adjusted together with their hit areas. Keyboard bindings and rules remain.
Classic brown/parchment palette is unchanged; this is a trial, not a new frozen
reference approval. UI-system, main-menu cave, minigame-menu input, tavern-game,
tax-collector and fight-loot audits cover layout captures and interaction paths.

Paper containment follow-up: Barry's intro/result parchment now encloses its
start/rematch action; merchant information, purchase/reroll, debug controls and
exit share one sheet. Forge confirm/leave now sit inside parchment in both browse
and work/result states. Main-menu top spacing, pause bottom spacing and arm/chug,
fight-loot/camp bottom margins were opened up. Merchant draw/hit rectangles moved
together; its input audit reads the production rectangles. Scene art is unchanged.
`tools/ui-paper-containment-audit.cjs` checks action-button containment with border
clearance at 320px and desktop; main-menu, UI-system and merchant audits also run.
Containment, main-menu and UI-system checks passed; direct touch reroll/buy/exit
and duplicate-debit guards also passed in the containment audit. The broader
caravan/forge audits stopped on road scenery pond-spawn assertions outside this
UI change; those scenery expectations were not modified to suppress failures.

Road Lab / F10: the playable test selector now uses one Treasure parchment with
all direction, entry, category, case, seed and navigation controls inside it.
Replaced green/biome-coloured buttons with classic materials; selected controls
have both a light fill and outline. Shared ROAD_LAB_UI geometry drives drawing
and touch hit areas, with at least 29 units reserved at each ornamented edge.
The route generator, case mapping, seed behaviour and production lengths remain
unchanged. The independent approved Road Creator Lab is not redesigned.
`tools/road-lab-ui-audit.cjs` passes at 320/390/1000px: all categories, containment,
touch selection, case launch, F10 return, new seed and both navigation targets.
Screenshots in `output/road-lab-ui` were visually inspected; user approval pending.

Question-stop interaction follow-up: Road Lab no longer lists Wishing Well or
Wounded Traveler. Its roadside hint and the in-run question-stop prompt now say
to ride into the correct outer lane, matching direct contact entry (no outward
swipe). The in-run prompt uses the existing classic brown panel/text helpers.
Merchant/inn service gestures are unchanged. Placement/entry checks are in
`tools/question-lane-contact-audit.cjs`; no character/prop art was redesigned.

Rest camp follow-up: replaced its large choice sheet with a small Treasure
parchment at y619, keeping the native fire clickable above it. One leave button
inside the sheet, disabled during the short rest animation. Photo mode hides
the panel and pause button. Road Lab now describes full health rather than the
old fractional missing-heart fixture. `tools/rest-camp-audit.cjs` covers touch,
one-time recovery, pause, cap, leave, reset and image release on phone/desktop.

Persistent run/event vitals: reuse the existing red heart sprites on the road
and a compact Treasure-brown panel in event scenes. Photo mode stays clean.
Healing now animates the displayed fill without delaying actual recovery or
mutating health during rendering; camp still restores at most two hearts.
Road obstacle contact costs exactly one heart with existing contact invulnerability.
Normal/purple skill shields clear between battles; artifact protection is separate.
`tools/run-event-vitals-audit.cjs`, rest-camp and UI-system audits pass. Phone run,
camp refill, chest, inn and merchant captures were visually checked for placement.

User follow-up: removed the event-heart backing panel. Heart positions, sprites
and animated fill remain unchanged; hearts now render directly over the scene.

Question-stop approach cleanup: removed the top title/instruction banner and
floating '?' above the native roadside actors/props. Event dialogue, HUD and
lane-contact entry stay unchanged. The lane-contact audit checks that neither
overlay is drawn and exercises all four active question stops on both sides.

Pause control consistency: running HUD, event scenes, Treasure and tavern
minigames now use the same `drawPauseButton` renderer: Treasure-brown secondary
button with two native cream bars, not font-dependent 'II'. Existing 38x38 hit
rectangle, safe-area offset and input behavior are preserved. The HUD passes
zero extra offset because its canvas is already translated. UI-system checks
and `tools/pause-button-audit.cjs` cover phone/desktop rendering and touch input;
run, camp and Duke captures were visually inspected. The approved specimen is
unchanged.

2026-09-28 / button selection and explicit Lab refresh: fixed the selected/focus
rectangle overwriting the brown lower rim and adding an unrelated dark inner
underline. The indicator now follows clipped corners outside the button face;
selected options use the standard cream face, keyboard focus preserves role,
and disabled overrides both. No hit rectangles or action semantics changed.
UILab opens on the current symmetric-parchment system with documented palette,
layer construction, ornament spacing and primary/secondary/tab/disabled roles.
Original Treasure v2 remains untouched; current v3 is a new independent snapshot
requested by the user, not an automatic production import. The corrected outline
still awaits user visual review. This documents the role standard; it does not
claim that every legacy screen's action hierarchy has been reclassified.
UI-system, Road Lab input/containment and button-material audits cover the change.

Action-role follow-up: applied state-dependent hierarchy to camp (leave/rest/
completed), fight and fallback chest loot, merchant buy/reroll/debug/exit and
their separately drawn price labels. Treasure difficulty and Duke count/face
now show available unselected choices in brown, never disabled grey. Confirmed
tax pay/challenge and inn service alternatives keep equal cream weight; Wolf
Den results and post-dialogue continuation retain cream while optional exits
stay brown. Forge purchase/result, dance/repair/forge-game start and replay,
town continuation, codex/changelog back/tabs and pause utilities were aligned.
The canonical UI skill now requires classification by state, explicit wrapper
roles, consistent label contrast and initial/result checks on every UI task.
UILab documents these concrete mappings. Archived inaccessible prototypes and
bespoke combat/debug card renderers were not redesigned. No hit areas, prices,
rewards, input gating or saved state were changed.

User-approved selection revision: remove the selection outline, lower the face
by 2 units with a shorter shadow and add a small left diamond, reserving label
space (compact numeric/icon controls use a smaller marker). Hit rectangles and
lower brown bevel stay fixed. Keyboard/controller focus remains a separate
outline, not selection. Disabled paper now has a subdued #d0bea0 upper light
and the normal brown lower rim. Explicitly revised the independent classic-v3
specimen and UILab explanation for this approved request; original Treasure-v2
is unchanged. Updated the canonical skill. Material, action-role and UI-system
audits pass; phone Lab and compact Duke selections were visually inspected.

Selection marker refinement: the small diamond is now hollow, with a 1-unit
light-brown #a8824a contour and no fill. Applied to production and the explicitly
maintained classic-v3 Lab specimen; skill wording and material tests match.

Marker placement follow-up: center the hollow diamond below the label, above
the lower bevel. Restore horizontal text centering and reserve vertical space;
compact controls use the smaller marker. Production, Lab and skill agree.

2026-09-28 / main-menu cover trial: replaced the previous title with an original
single-line filled chisel-serif wordmark and a small red/gold rising-road pennant.
This is a fresh logo design, not a restyle of the previous stacked title. Reframed
the existing native cave, bear and mounted knight into one title composition;
menu-only cave detail suppression removes scattered props and old light pools.
Existing character renderers, idle motion, parchment materials and button hit
areas remain intact. Phone and desktop main-menu audits pass, including settings
and Play; UI-system checks also pass. Live approved Art Lab references and both
menu layouts were visually checked. The protected Art Lab audit still reports
the pre-existing KRDukeBluff.actor fingerprint mismatch; no baseline was changed.
This menu/logo trial is not added to the frozen approved UI specimen.

User follow-up: rejected the pennant/single-line logo. Trial now uses a compact
two-row KNIGHT / RUSH title, with Jonathan's cool steel and blue plume colours,
retaining the custom cut-letter shapes but no emblem. Selected buttons now omit
the cast-shadow pass entirely (not just shortening it); the material bevel and
hollow diamond remain. Production, current v3 Lab, skill and pixel audit agree;
original Treasure v2 is unchanged. The rear mounted horse neck patch was removed
at the user's request; the riderless horse keeps its neck/head geometry.

Follow-up supersedes removal: restored the horse neck/head geometry and moved
its pass before the rider's legs as well as his torso, so Jonathan is in front.
No shape, colour or pose changes. Phone/desktop menu and idle checks pass;
the Art Lab integrity audit still stops at the existing Duke fingerprint.

Main-menu cover composition trial: one warm ivory cut-letter nameplate on a
plain brown clipped plaque, no separate pictorial emblem. The existing native
cave and live bear/rider are reframed closer together; the enlarged lower
parchment now occupies about a third of the viewport. Shared menu hit rectangles
move with their drawn controls and retain primary Play / secondary utilities.
Menu-only cave planes extend into wide-screen gutters before the normal world
clip; gameplay viewport, input transform and other screens remain unchanged.
No new bitmap, character geometry, lighting adapter or animation was introduced.
UI Lab current Treasure specimen and Basalt v4 plate/composite were inspected
for spacing, broad quiet planes and foreground layering; neither was modified.
Phone 320/390 and desktop menu captures include real tap/click verification,
paper containment, spacing, state purity and unchanged idle checks. This is a
candidate composition, not a newly approved reference.

Mobile-frame follow-up: removed the desktop gutter painting and native cave
jamb additions. A narrow clipped-corner timber-style UI frame now runs above
the title and down the INSIDE edges of the 480-unit viewport, using Treasure
brown materials and restrained edge highlights. It is omitted in photo mode.
Raised the bear by 30*zoom and rider by 56*zoom, with their ground pools; their
models, colours and idle rigs are unchanged. Parchment/button layout is kept.
320/390 phone captures show more of the horse and sword; menu input tests pass.

Temporary clean-title revision: user rejected the timber frame. Removed all
frame geometry and the title's brown backing plaque; retained a plain warm
ivory wordmark with a restrained 2-unit brown depth. Raised bear and rider a
further 70*zoom / 28*zoom, moving their contact pools with them. Expanded only
the upper menu-scene clip to leave the bear's head intact near the wordmark.
Parchment and input rectangles unchanged. 320/390/desktop menu audits pass;
phone views inspected. Leave this as a temporary candidate, not an approval.

Alignment correction: the cave background now uses the same 100*zoom scene lift
as the bear, restoring the cave mouth/moon relationship after raising actors.
Actor and UI coordinates unchanged; phone/desktop menu audit passes.

Pre-push follow-up: restored original cave floor cracks, rubble, bones and
wall-base fungi in the title scene. Default cave rendering remains unchanged;
the menu skips only the old light pools, keeping its actor-aligned pools.

User-requested close-camera restoration: restored the pre-cover cave transform,
bear/rider scale and anchors from ea92a0d, including original ground details and
moonlight pools. Restored compact bottom-menu dimensions and hit rectangles,
retaining the current Treasure parchment material and plain ivory wordmark.
Layer order is cave -> title -> live bear -> rider -> menu. Photo mode omits
the title. Small/large phone and desktop menu audit passes, including real
input and an explicit title-before-bear assertion. Other UI/model fixes remain.

Guardian Attack Studio (2026-10-05): new standalone authoring shell with native
game scene embedded only as a frozen rendering instrument. Treasure system and
states inspected live before design. Shared KRUI.sheet/KRUI.button render the
DOM controls' materials; no production theme/specimen changes. Primary actions
are play and add key; utilities are secondary; selections carry explicit state.
Desktop 1536/1280 and 390px layouts inspected, including the timeline and lower
pose/archive controls. Scene art is untouched. Feature audit covers native
player poses, lanes, joint drag, key saves, interpolation, retiming, delete/restore,
draft retention, JSON round trip and no old-pose-store overwrite. Material audit
passes; broad system/action audits still stop at the pre-existing Road Lab null
journey.nodes fixture. Candidate UI pending user review, not new approval.

Guardian Attack Studio camera controls (2026-10-05): auxiliary fullscreen with
in-page fallback, secondary front/side/back/game-camera selection group, yaw and
zoom controls. Existing KRUI materials and action roles retained; system/states
reference inspected. Native models reused with an opt-in orthographic camera;
authored joints, saved projects and game collision evaluation do not rotate.
Feature and camera audits pass, including mobile and full-screen layout. No
character baseline or production encounter changed. Visual approval remains pending.

Attack Studio fullscreen editor refinement (2026-10-05): the actual joint panel
now docks beside the fullscreen scene; the selected foot's ground-lock checkbox
is near the top, retaining its handlers and state on entry/exit. Added secondary
camera recenter utility and explicit left-edit/right-pan/middle-orbit hints.
Knight orbit yaw sign corrected to preserve its world heading (no model edit).
System/states references rechecked; material, studio and camera audits pass.
Broad UI audits retain the previously recorded Road Lab fixture failure.

Attack Studio joint mouse mapping (2026-10-05): joint hits take precedence over
camera orbit for middle-button rotation; left-button hits select Move regardless
of the prior tool. Existing selected-tool materials reflect the active gesture.
No panel/art changes; pointer audit covers rotate-then-move and camera invariance.

Attack Studio wrist gesture (2026-10-05): hand/sword middle drag now provides
camera-relative horizontal tilt and depth pitch simultaneously. Added helper
copy and a wrist mode label; separate sword roll retained. No authored pose,
schema, gameplay or model change. Gesture, camera and studio audits pass;
Treasure references and desktop/mobile controls checked. Broad Road Lab audit
fixture issue remains as recorded above.
