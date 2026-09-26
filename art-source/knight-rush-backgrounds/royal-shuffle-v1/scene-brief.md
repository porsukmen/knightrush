# Royal Shuffle — candidate v1

Not an approved reference. User review pending. No protected baseline changes.

## Scene and separation

- Quiet tavern gaming alcove, new native slender gambler: the Velvet Fox.
- Frontal centered camera gently looking down onto an oak table with wine velvet
  and double gilt borders. Actor head (240,220), shoulders (197/283,293), far table
  edge y347. User rejected the initial green cloth, large cards and long arms.
- Generated room is displayed at (0,80), 480x640. Native table/cards/hands remain
  separate and animate without altering the image or adding texture copies.
- Amber left lantern key, cool right window fill. Scene-local material triplets
  cover skin, plum cloth, linen, hair and gold. Neutral/scene comparison saved.
- Cards have one shared back design; 2 kings/1 queen, paper side edge and contact
  shadow. Normal hand-relative size: about 52x47 screen units after the 0.66/0.43
  table-plane foreshortening. Centers (172/240/308,407). All three stay partly
  visible at overlaps. Hands touch top card edges, hitboxes updated to match.
- Front shoulder/upper-arm layering follows Knight Rush Art. Constant 66/76
  view-space 3D bones project foreshortened over the table; wrist follows the
  actual trajectory, no independent hand oscillation during contact.
- HUD below cards, actions at y623/667. UI remains untransformed on phones.

## Inputs and method

Built-in image generation, not API/CLI. New illustration, not a character edit.
Only raster input: approved `mossy-inn-v4.png`, **environment quality only**.
Inspected live Background Lab plate/composite; current actor references inspected
as isolated Art Lab models: Jonathan, Wandering Merchant, Barrel Barry, Disco King.
Merchant renderer and Barry pose/material source informed broad planes, hands,
small eyes and construction. No legacy placeholder character used as reference.

## Exact generation prompt

Create a NEW portrait 3:4 background plate for Knight Rush Royal Shuffle card game.
Input image is ONLY an approved environment style/clarity/lighting reference, NOT
a layout to copy. Empty quiet refined medieval tavern gaming alcove: rich dark oak
wall framing, muted plaster central wall, burgundy draped curtain on far left,
small warm golden wall lantern upper left, a diamond-paned cool dusk window upper
right, a few supported ceramic jugs on a narrow side shelf. Central back wall must
be simple, quiet and EMPTY for a separately rendered live slender dealer; reserve
central x=30%-70%, y=18%-54% for him. Camera centered and slightly above seated eye
level, looking gently down; straight frontal centered wall, coherent one point
perspective. Bottom half is empty timber floor receding toward a back wall at
about y=55%, to be covered by a native wooden gaming table; DO NOT DRAW a
foreground table, counter, cards, chairs, people, silhouettes, labels or UI.
Simple crisp illustrated medieval fantasy environment matching reference broad
painted polygonal planes, very clean hard edges and deliberate geometry. Limited
detail, no photorealism, no painterly microtexture, no grain, no blurry edges, no
random triangular tessellation. Warm amber key light from left and cool subdued
window fill right, broad clean shadow planes, clear ochre oak versus warm gray
plaster. Full-bleed portrait composition without border, no text.

## Packaging and evidence

- Original: `generated.png` preserved. Tool source was
  `exec-a2ce1ee0-4122-4fea-a526-55c2cc9a2077.png`.
- Runtime `assets/encounters/royal-shuffle-v1.png`: 1086x1448, 6,290,112 RGBA bytes.
- Mobile `royal-shuffle-v1-mobile.png`: 576x768, 1,769,472 RGBA bytes.
- Shared event manager owns a single selected plate, same tavern owner; released
  on exit. Native error fallback is playable, not the intended finished backdrop.
- No per-frame filter, pixel readback, rasterized actor or new animation loop.
- `tools/royal-shuffle-audit.cjs`: seeded rules, refresh-rate consistency,
  catch/miss/wrong accusation, best-of-three, touch/keyboard, motion bones, render
  purity, pause, selected budgets, exit. Screens: `output/royal-shuffle`.
- Initial idle elbows were too wide; revised with depth-aware articulation, then
  shortened again following user feedback, with closer reachable card spacing.
  Desktop and phone-size packaged composites inspected for edge clarity and card
  readability. This is viewport emulation, not actual Safari/phone FPS evidence.
- `?queenlab=1` opens playable candidate. Menu preview built separately and lazy.
- Cutscene manager and background integrity audits passed. Full Art Lab audit
  still stops on the pre-existing Barrel Barry approved-renderer mismatch
  (`2b5c2a50…` current versus `b7e9b2e7…` baseline); not changed/rebaselined here.

## Rules

Best of three / first to two. Each hand mixes swaps, a returning feint and a
three-card rotation realized as two transfers. Shuffle gets modestly quicker.
At most one cheating hand per match; some matches have none. A post-shuffle
distraction can be honest or lead to a visible two-card swap. Once per hand,
tap either moving hand, use C, or the catch button during the active transfer.
A successful catch wins after that transfer finishes and the cards reveal.
Wrong accusation consumes only the accusation; ordinary selection still works.
Missing the cheat is never an automatic loss. Rendering never commits moves.
