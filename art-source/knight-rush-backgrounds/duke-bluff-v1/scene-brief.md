# Duke's Bluff — candidate, 2026-09-26

User approved the gameplay direction, not the finished visual reference.
Built-in image generation produced `generated.png`; runtime packaging uses
`assets/encounters/duke-bluff-v1.png` and `duke-bluff-v1-mobile.png`.
No approved images, renderers or baseline hashes were replaced.

## Composition and references

- Frontal seated gaming alcove, single camera/perspective; no diagonal table.
- Approved isolated merchant, innkeeper v2 and Borin inspected in live Art Lab.
  Merchant's material/face planes and articulated innkeeper/Borin arm construction
  informed the new narrow tailored noble. None of their scenes/UI is a character input.
- Approved Mossy Oak Inn v4 plate supplied to image generation only as an
  environment clarity/style reference. Live Background Lab composite inspected.
- Warm lantern left, cool window right; Duke has separate neutral/scene material
  palettes for skin, linen, teal coat, hair and brass. Foreground shoulders,
  fixed 55/57-unit arm bones, hand follows the lifted cup.
- Logical plate `(0,72,480,640)`. Native table top y=300, Duke root (240,315).
  Generated chair actual back begins about source y=435; this is an environment
  prop, not a reason to distort the actor or move the game camera.
- Runtime native cups/dice/tokens/UI are never baked into the plate. Duke's cup
  reduced to 76% following user feedback; three dice form a tight triangular pack.
- Standard 1086x1448; mobile 576x768; no extra bitmap mask, filter or pixel readback.
  Runtime memory payload 6,290,112 / 1,769,472 bytes, not total browser RAM.
- Menu thumbnail generated from the native renderer, not an AI-rendered actor.

## Final built-in generation prompt

Use case: stylized-concept. Asset type: Knight Rush Duke's Bluff game background
plate ONLY. Reference image is approved environment style/clarity reference,
not an edit target. Generate a NEW portrait 3:4 illustration of a quiet
comfortable noble's gaming alcove inside a medieval timber inn. Frontal camera,
seated eye height, coherent one point perspective, NOT diagonal. Very simplified
crisp cartoon angular broad planes like reference, no painterly tiny texture,
no blurry edges, no outlines, no pixelation. Warm honey light from a small wall
lantern upper left, gentle cool daylight from narrow diamond pane window at
right. Muted warm plaster, chestnut timber uprights, a modest burgundy banner
without symbols left, a small side shelf with ceramic jug at left edge. Center
back wall intentionally plain, with a single EMPTY high-backed oak chair centered
at x50%, top at y25%, seat at y57%, reserved for a native character. Lower half
simple floor space, will be covered by a live wooden game table. DO NOT DRAW ANY
TABLE, countertop, people, bodies, faces, dice, cups, tokens, writing, text, UI
or frame. Upper third quiet with structural beams. Clean geometry, restrained
detail; material boundaries should be as sharp as flat native polygon characters.
Vibrant warm/cool material colors but not noisy. Match reference simplicity and
clarity, not its bar layout. No fireplace required. No stairs. Image is backdrop
only, foreground objects added separately by game.

## Review evidence

`output/duke-bluff`: desktop/mobile intro, bid, cup-lift frames, true/false claim,
neutral/scene actor. `tools/duke-bluff-audit.cjs` checks all binomial outcomes,
400 seeded matches, forbidden private-hand access, UI input, pause, one-time
seal loss, draw purity, fixed limb lengths, mobile asset tier and image release.
`tools/tavern-games-audit.cjs` covers other tavern games, actual inn entry/return,
load cancellation and failed-plate playable fallback.
Full Art Lab audit still flags the previously requested Barry shoulder edit
against its older approved fingerprint. That unrelated baseline was not changed.
