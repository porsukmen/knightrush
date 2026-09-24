# Travelling merchant — first playable shop prototype

Launch `MerchantTest.html`, or choose Debug → MERCHANT LAB. This is separate from
the post-boss blacksmith. It does not add encounters to route generation yet.
Journey's town General Store now shares these transactions with a separate
`town:<stage>:store` stock key and its own permanent-building interior/shopkeeper.
Exiting returns to the same square; sold slots and reroll cost survive re-entry.

The current wandering-merchant draft is anchored to Knight Rush's own artwork,
not the rejected rounded/cartoon or hooded-caravan experiments. The camp directly
uses `drawTreeArt` from the runner. The trader uses Jonathan/Squire's `rigPolygon`,
`rigSegment`, `rigJoint` and `px` primitives: square joints and facial features,
hard-edged cloth silhouettes, broad lit/dark planes. The current style contract is
the [Knight Rush art skill](skills/knight-rush-art/SKILL.md); use approved live
Art Lab models as visual anchors, not the background/UI in old shop screenshots.
The wealthy, slightly stout merchant wears a wine-red cap/coat, teal doublet,
cream fur collar and gold jewelry. A separate wooden table with a red cloth
stands in front; behind him are an oblique covered wagon, a very thin seated
driver holding reins, and a harnessed bay horse based on Jonathan's mount.
The backdrop is a tree-lined grassy clearing, with no road behind the stall.

All 22 artifact display drawings, tonic and sealed package use the same angular
vocabulary. Warden Shield directly uses the gameplay shield renderer with its
cross palette. There is no pixelation post-effect or enlarged low-resolution
raster. The native-resolution backdrop is cached; idle breathing, head motion,
blinking and articulated hand-off animate separately.

Town's General Store now also uses the approved detailed item renderer, with its
own resident keeper and cached interior in the same style. Wandering character,
wagon, forest and gameplay HUD are unchanged by that revamp. Drawing does not mutate stock, use reward RNG or alter
prices/inventory. Mystery art stays concealed until the existing hand-off reveal.
Tap an object to inspect, then confirm to buy; sold objects leave an empty space.
The brief hand-off locks purchase, lab controls and exit; pause freezes it.

Stock is seeded by run seed + visit ID, generated once per visit, with two distinct
unowned artifacts (30 / 42 gold), two-heart tonic (12), and one distinct sealed
artifact (20). Paid rerolls cost 10 gold initially, then +5 per reroll in that visit.
Only unsold artifact/mystery slots change; sold slots and tonic are preserved.
New candidates exclude equipped artifacts and, when possible, every previous
offer. No duplicate offers. Reward selection uses the visit seed + reroll count;
the .45-second reroll lock prevents double-tap charging. No remaining/changeable
stock or insufficient funds means no charge. Sold stock and price escalation both
survive revisits. Prices are provisional; no economy balance claim is made.
The hidden reward is fixed before inspection and uses no render RNG.

Purchases charge and apply exactly once before the cosmetic hand-off. Artifact
effects use the real definitions/equipped cache. Full bags, duplicate artifacts,
insufficient gold and full-health tonic purchases do not charge or sell the item.
No automatic artifact replacement. Reopening the same visit retains sold stock.
New runs clear visits. No score/earned-gold bonuses from purchases or test funds.

`openMerchantShop(visitId, environment=biome)` is the entry point for later road-event integration;
the environment is captured on entry and included in the static-art cache key.
Only forest is authored now; unknown keys fall back to forest. Later backdrops
can register in `MERCHANT_ENVIRONMENTS` without duplicating actors/transactions;
the caller's mode is restored on exit. No new random map spawn or side-road marker
is enabled by this prototype. The lab starts a clean test with 120 gold, two missing
hearts, +100 test gold and reset controls, and returns to Debug when closed.

Tests (with the workspace Canvas/Playwright dependencies on NODE_PATH):

```
node tools/merchant-audit.cjs
node tools/merchant-browser-audit.cjs
node tools/merchant-reroll-audit.cjs
node tools/merchant-art-audit.cjs
```

Audits cover unique seeded offers, actual inventory/effect activation, healing,
mystery, money, sold revisits, full bag/health/poor guards, reset, touch selection,
double taps, pause and exit lock, and mobile/desktop screenshots. No on-device
phone performance measurement has been made.
