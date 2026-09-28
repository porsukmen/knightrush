# Fight loot — candidate v1

User requested post-fight loot as a cutscene and new native Knight Rush scrap art.
Not a new approved reference. No change to reward amounts, RNG, eligibility,
claim-once semantics, optional leaving, or road progression.

## Art direction and reference roles

- Live Art Lab inspected before editing: Jonathan's readable steel faces,
  Merchant/Borin/Smith material construction, approved item-style board.
- Approved Gatherer clearing: environment clarity, warm key from upper left,
  cool green fill, compositing of crisp native foreground art. Environment-only
  and live composite captured in `output/fight-loot/reference-plate.png` and
  `reference-composite.png`. Not a cottage/layout reference.
- Treasure-only UILab loot tab: classic brown panels and small lower parchment;
  captured in `output/fight-loot/reference-ui.png`. No tavern UI reference.
- No character redesign. Scrap uses broad steel faces, a folded plate with two
  rivets, a broken blade with a torn end, and a detached open buckle. HUD mark
  and physical salvage share native construction; scene-local warmer highlights.

## Shot / layering / interactions

Quiet forest path immediately after a fight. Downward-looking foreground, roots
and stones framing the edges; no chest, table, pedestal, bodies, or baked loot.
Logical background 480 × 640. Purse at (139,404), salvage at (331,450), on open
earth. Tight contact + cast shadows beneath native pieces. Warm ochre ground
contrasts with cool steel. UI starts at y630 and does not cover physical loot.

Layer order: plate → contact shadows → native gold/purse and native salvage →
occasional small glints → amount labels → title/wallet → Treasure parchment.
Tap actual items or use 1/2. Claim animates a 0.44s lift/fade and removes the item.
Enter/Continue returns to the suspended road. Rendering never pays rewards.
Screenshot mode removes labels and panels but retains the live scene.

## Selected source / packaging / lifecycle

- Source: `generated-source.png`, retained unmodified.
- Runtime: `assets/encounters/fight-loot-v1.png`, 1086 × 1448,
  6,290,112 bytes decoded RGBA payload (not total browser/GPU memory).
- Mobile: `assets/encounters/fight-loot-v1-mobile.png`, 576 × 768,
  1,769,472 bytes decoded RGBA payload.
- Shared manager prefetches on fight approach; activates after actual victory,
  and releases on exit/reset. Existing 14MiB / 6MiB tier budgets unchanged.
- No full-frame canvas caches, pixel-readback, runtime sharpen, or cloned image.
- A missing/cancelled image leaves native loot and controls functional on a
  simple placeholder, never the old forest. This is a failure fallback only.

## Image generation prompt

Use case: stylized-concept. Asset: Knight Rush portrait game cutscene BACKGROUND
PLATE only, no UI or characters. The supplied image is an ENVIRONMENT
STYLE/CLARITY REFERENCE ONLY; do not copy its cottage or layout. Create a NEW
simpler post-battle forest roadside close-up. Portrait 3:4 composition. Camera
looks diagonally down at a quiet patch of warm ochre dirt beside a woodland
trail, from a standing person's viewpoint. Upper quarter shows a short stretch
of path receding between two substantial tree roots, framing green ferns and a
few broad slate rocks along edges; no sky necessary. Lower three quarters mostly
open flat earthen ground with broad crisp sunlight/shadow shapes, not texture
noise. At about 55-65 percent height leave two generously separated empty areas
of bare soil, left and right, where game code will later draw a coin pouch and
metal salvage; DO NOT DRAW those items yourself. A couple of subtle boot scuffs
and flattened grass at the margins suggest a recently finished skirmish, no gore,
no people, no bodies, no weapons, no coins, no chest, no pedestal, no table, no
loot, no text, no symbols, no border. Shape language: simplified illustrated 2.5D
medieval forest, strongly defined broad polygonal/stepped leaf groups, attractive
deliberate silhouettes, 3-4 material values per surface, crisp near-plane
boundaries matching the reference, restrained distance depth without blurry near
surfaces. Vibrant warm golden daylight from upper left, cool deep teal-green
shade, ochre floor that contrasts with silver-gray live items. Calm readable
composition, less detailed than reference, not photorealistic, no watercolor
smudges, no 3D-render look, no tiny triangulated facets or patterned ground. Lower
18 percent should remain quiet dirt for a separately rendered parchment footer.
Keep foreground open: no giant log/rock crossing the loot placement zones. This
is a finished in-game background, not a concept sheet.

Reference input: `art-source/knight-rush-backgrounds/approved/gatherer-clearing.png`.

## Checks

`tools/journey-scrap-audit.cjs`: all six enemy variants; reward eligibility,
seeded quantities, duplicate/pause/stale/loss guards, leaving, same-run forge.
`tools/fight-loot-audit.cjs`: actual victory path, desktop + two phone sizes,
standard/mobile assets, touch + keyboard, claim animation, photo mode, fallback,
road frozen while looting, release on exit. Screenshots in `output/fight-loot`.
`tools/cutscene-audit.cjs`: metadata, budgets, shared lifecycle, approved hashes.
Screenshots visually compared to the approved item board and Treasure specimen;
technical checks do not imply user visual approval.

Verified: all three feature audits above passed; UI system audit passed all 20
desktop/phone screens and five Lab views. General Art Lab audit remains blocked
by the pre-existing `KRDukeBluff.actor` fingerprint mismatch (actual
`da63f3ef0fb4a05bdf7976802b8a60887b4e34bb5b2ca17e0e830336232c6cb7`, expected
`7655ee2c3c74f9857ebdf7f01aca2c5372df859e06f460e4362f24eaa7f227ca`). No approved
baseline or unrelated actor was changed to suppress this failure.
