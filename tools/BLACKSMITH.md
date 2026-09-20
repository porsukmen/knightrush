# The Little Hammer — first playable forge

Classic PLAY opens `shop` after the death presentation and healing. Journey now
opens the safe `town` hub; selecting its workshop opens the same forge. Returning
to town preserves the forge/RNG, and the town gate owns stage continuation.
The Skill Lab victory path remains separate. No old artifact screen or free skill
draft returns. RIDE ON calls the existing stage continuation once; Journey loops
to forest with its run seed and next stage. Squire is dismissed before shopping.

## Content and progression

- Current art experiment follows [Knight Rush — Keskin Düzlem](../ART_STYLE_KESKIN_DUZLEM.md):
  blue-grey steel with broad shadow planes, burgundy work sleeves, a strapped
  leather apron and brass fasteners. The original triangular Bastion build,
  projected Squire helmet, slim legs and tiny hammer remain. The forge uses
  large slate blocks, a recessed warm-stone hearth, a level back-wall tool rail and
  a bevelled anvil on an iron-bound stump. Tools have hooks and benches have legs.
- The pre-revamp rendering block and screenshot are preserved in
  `art-source/blacksmith-before-sharp-plane/`; its README explains art-only rollback.
  No shop UI geometry, cards, prices, reward logic or pose/acting tracks changed.
  Room correction: the rear wall now aligns with the counter; only narrow side
  reveals recede. The former false right-hand corner and sloping rail were removed.
- Original code-native Canvas knight: broad triangular armor, massive plated
  arms, small legs, tiny hammer, furnace and anvil. No bitmap dependency.
- The workshop is presented as a first-person visit: the animated smith stands
  behind a continuous wooden counter, with a hanging sign and a coin tray. The character uses the
  gameplay rig primitives, projected helmet planes, steel palette and articulated
  arms with bespoke oversized proportions. Bow and shield props call the actual
  production `drawSpatialBowProp` / `drawSerJonathanShield` functions. The whole
  scene draws directly into the gameplay canvas at its active display resolution;
  there is no low-resolution intermediate canvas or enlarged raster. The local
  scene coordinates are layout units, not raster pixels. Living Bastion / max
  Guard Squire inspires the doubled pauldrons, gorget, gold chevron and actual
  Squire helmet, reworked to face the player. Independent breathing, weight shift,
  articulated wrists, head tilt and plume motion keep the smith alive at idle.
- Four current skills are spread as slightly rotated illustrated parchment cards
  on the worktop; the selected card lifts forward. Hit testing inversely rotates
  pointer coordinates into the actual card, including its selection lift. A
  framed result card stays on the same counter, with wooden action plaques.
  Sharpshoot / Mark Burst put a
  bow on the anvil; Shield Bash a shield; Call Squire an armored gauntlet.
- `smithChildren` indexes **materialized current route catalogues**, not the
  retired `PLAYABLE_SKILL_MUTATIONS` reward pool. Weapon and class skill routes
  use their existing combat compilers. Only the current parent's direct children
  at the next depth are candidates. Completed depth-4 skills show APEX COMPLETE;
  post-Apex mastery is outside this first implementation.
- Choose a skill, then explicitly confirm its displayed price/risk. Roll a route
  uniformly, then success, then independent rarity (65/27/7/1%). Prior rarity
  layers are passed back into the compiler; siblings and ancestry are preserved.
  Forge RNG is independent of rendering and seeded by run seed + stage.
- Costs: 18 / 30 / 48 / 72 gold; existing Smith's Seal discount still applies.
  Failure: 0 / 10 / 18 / 28%. On fail, keep the exact existing skill and refund
  half the price rounded down. Refunds do not count as newly earned gold.
- Five automated coin-seeking routes (without event rewards) yielded 30–52 gold.
  This is a pricing sanity probe, not measured human/mobile economy balance.

## Presentation and transaction safety

The item slides onto the anvil; a wind-up lands at 1.55 s. At 2.25 s the result is
shown in neutral grey without rarity-dependent stats or frame. At 3.45 s success
reveals the rarity with colored border/sparkles and installs the compiled skill;
failure refunds the money. At 4.35 s BACK TO THE FORGE becomes available. A failed
attempt has one of three cosmetic performances: drop the entire tiny hammer,
slip and windmill the arms, or hit the anvil's horn instead of the item. Cosmetic
selection never consumes reward RNG. Higher rarity has more sparks.
The tool starts in a delicate pinch grip, rises into a held overhead anticipation,
then accelerates into the strike. After the rarity reveal, Common gives a pleased
nod, Uncommon a fist pump, Rare a two-arm celebration and Legendary a surprised
recoil followed by two hops. The result clock keeps running for these reactions;
pause freezes it. Raised forearms/hands render in front of shoulder armor.

Payment locks selection, confirmation and RIDE ON until settlement/result. The
settlement is idempotent, validates the original skill reference, and fully
refunds a stale result. Pausing freezes the animation. A new run clears the shop.
The opaque shop does not render/update the hidden arena or Journey scenery.
All UI is English, using the game's fixed virtual coordinates and pointer mapping.

## Verification

Open `BlacksmithTest.html` for a standalone launch into the real forge, or use
Debug → BLACKSMITH LAB. The lab starts with 1,000 test gold and clean skills.
RESULT cycles Random / Success / Fail: Drop / Fail: Slip / Fail: Miss; RARITY
cycles Random and all four rarities.
LEVEL cycles the selected skill through 0–4 and back to base using the first valid
Common branch (setup only); normal upgrades still choose their branch randomly.
+1000 GOLD refills the test wallet. Controls lock during an active paid animation.
BACK TO DEBUG discards the test build; normal shops never inherit lab overrides.

With the existing Canvas/Playwright dependencies on NODE_PATH:

```
node tools/blacksmith-audit.cjs
node tools/blacksmith-browser-audit.cjs
node tools/blacksmith-art-audit.cjs
node tools/blacksmith-lab-browser-audit.cjs
node tools/blacksmith-acting-audit.cjs
node tools/journey-forest-loop-audit.cjs
node tools/journey-forest-loop-browser-audit.cjs
```

The native audit validates 1,523 catalogue nodes and compiles 69 representative
routes across all forms/depths, buys 16 mixed-rarity upgrades, executes forged
skills in real boss combat, and tests money/refund/pause/reveal/reset guards.
The Edge audit exercises actual touch selection/confirmation, double taps, pause,
success/failure and continuation at mobile and desktop sizes. Screenshots are
under `output/blacksmith/`. These are not on-device iPhone performance results.
