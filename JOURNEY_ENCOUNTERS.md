# Journey encounter prototype

Open `RoadTest.html` (or `KnightRush.html?roadlab=1`) for the Roads & Encounters lab.
The debug menu also has **ROAD LAB**. Press **F10** or the top-right lab button
to abandon a fixture and return to the selector. Lab runs start with 180 coins,
damaged hearts, God mode, and the curved renderer. F8 still compares renderers.

## Content

- **Cinder Forge:** charcoal/burnished-copper roadside workshop and new smith
  Bram. Uses the existing skill upgrade, price, rarity, failure and reveal rules.
  The town smith is unchanged. Leaving resumes this road, not the next stage.
- **Caravan:** the approved wagon merchant, stock, purchases and paid rerolls.
- **Warm Lantern Inn:** full healing costs `18 + stage * 4` coins, once per visit.
  A random table game costs 5 coins: tankard slide, arm wrestling, dice,
  find-the-queen or drinking contest. The game back button returns to this inn.
  The existing games are reused; there is no new artifact reward table yet.
- **Bloodwood:** existing red elite road and ordinary HP/AP/Resolve wolf combat.
- **Disco:** existing dance encounter, retained in the special-road pool.
- **Treasure Cache:** a gold-marked special road with a central locked chest.
  Reaching it starts the existing five-pin lockpicking game. Success opens a
  separate reward-selection screen; coins are NOT deposited automatically.
  The only current reward is `30 + stage * 5 + seeded integer [0,20]` coins.
  Tap its row (or press 1) to claim once, then Continue (Enter). Leaving loot
  skips unclaimed coins; failure gives no reward. The finished chest disappears.
- **Camp:** optional roadside stop, restores two hearts for free once per visit.
- **Roadblocks:** cutpurse, axeman, poacher, boar, stag and grey wolf. All use
  the real HP/skills/dodge/parry fight engine with three simple single-lane
  attacks initially. They do not recruit followers or advance the stage.
- **Wolf Den:** optional normal-road `?`, entered from the matching outer lane
  with a fresh outward swipe. The wolf runs off; search its seat or follow it.
  Search is seeded: 50% nothing, 30% 12–24 coins, 20% 2–3 scrap, paid once.
  Following reveals four wolves at the den entrance. The hanging meat on the
  LEFT is an actual clickable prop: take it before choosing Fight or Run Away.
  The four normal HP fights run consecutively in the cave, with no healing,
  stage advance, running distance or intermediate reward screens. After wolf
  four, the lone pup accepts one Meat artifact or can be left behind.
  The Meat quest-artifact pocket preserves all five combat artifact slots;
  it appears in the HUD and survives stages. It is not in random shop stock.
  Feeding consumes the meat and recruits one run-persistent pup. It follows
  on the road and bites for 3 damage once per player phase, without spending
  AP/Resolve or replacing Squire. It has no separate HP/turn controls yet.
  New playthroughs clear both meat and the pup. Repeat dens cannot multiply
  companions. Adults and pup use the EXISTING game wolf/front and back rigs.
  These forest clearing, rock entrance and cave backdrops are new Sharp Plane
  scene art, not reused normal-event/minigame backgrounds; cached at view DPI.
- Existing mushroom/chicken quests, wounded traveler, taxman and well
  remain in the normal-road pool and each is accessible in the lab.
  Chest was moved out of the normal `?` pool into Special Roads in the lab.

## Interaction and lifecycle

Optional roadside encounters require the matching **outer lane**, arrival at
that lane, and a **fresh outward swipe**. A swipe from the center only changes
lanes. Roadblocks and special-road venues stop automatically when reached.

Each venue owns one road-event session. Distance, branch, build and inventory
survive entering/leaving its scene. Finished venues disappear from the road.
Fights restore the suspended road actors; combat-only companions are cleared.
Normal victories open a reward-selection screen: `10 + stage * 2` coins and
**2–4 scrap**, rolled deterministically per encounter. Each row is claimed
separately (touch or 1/2); Enter continues, leaving unclaimed rewards behind.
No automatic payment. Elites retain their `24 + stage * 4` automatic coin reward.
Quests are scoped to the current playthrough. Quest delivery scheduling cannot
replace camps or fights.

## Scrap and blacksmith economy

Scrap is a run-local material currency, shown with a bent-steel icon. It starts
at zero on a new playthrough and survives town visits and stage transitions.
It is not included in the gold-earned score and cannot be spent in the merchant.
Both roadside and town smiths charge coins **and** scrap for each attempt:

| Upgrade to | Coins | Scrap |
| --- | ---: | ---: |
| Form | 18 | 2 |
| Specialization | 30 | 3 |
| Technique | 48 | 5 |
| Apex | 72 | 8 |

The Seal discount affects coins only. Insufficient funds/materials spend neither
currency and do not roll the recipe. Ordinary failures keep the skill, refund
half the coins and consume the scrap. An invalid/stale recipe refunds both in
full (or charges nothing if caught before payment). Claims and settlements are
once-only. Labs grant test materials: Road Lab 12, Town Lab 20, Smith Lab 100.
These grants do not carry into a new game.

## Initial generation tuning

`JOURNEY_ROAD_RULES` in `KnightRush.html` owns these prototype values:

- Base boss distance: **3.2 times** the original pre-expansion distance,
  i.e. **twice the preceding 1.6x Journey version**.
- Road-piece lengths stay the same: the extra distance adds junctions.
- Bounded crowded-seed recovery keeps a seeded chain of normal-sized turning
  pieces and encounters, instead of one empty stage-length corridor.
- Eligible special-road chance: **30%**, six equally weighted themes.
- Eligible normal-road encounter chance: **70%**.
- Given a normal encounter: 44% fight, 16% camp, 20% quest, 10% cache/event,
  10% Wolf Den (before per-stage repeat suppression).
- Existing special length multiplier (3x) and continuation chances are retained.

These are eligible-piece probabilities, not guarantees per run. Boss exits and
the initial road stay clear. Normal quest repeat suppression still applies.
Actual travel length varies with special-road choices.

## Roadside encounter art

The former block-portrait drawings have been replaced with native **KR-KD /
Keskin Düzlem** geometry. The gatherer, farmer, tax collector and traveler use
the same live model on the roadside and in dialogue (including return visits).
Faces blink; shoulders, hands and held objects move together. Quest chickens
and mushrooms, baskets, the old chest, the well and the campsite share this
material/plane language. Wolf Den retains the original gameplay wolf models.

Authored forest staging gives each stop its own landmark: a gathering stump,
broken chicken coop/fence, improvised tax checkpoint, wounded traveler's rock,
old well paving, root-bound chest and pitched camp. Static scenery is cached
at display resolution, capped at four scenes and invalidated on resize; actors
and fire remain live. No scaled-up bitmap portraits or minigame placeholders.

Roadside well and taxman minigames keep these new models/backgrounds, without
changing hit targets, pressure rules, rewards or input gates. Their standalone
minigame versions are deliberately outside this roadside-art replacement.

## Verification

`tools/journey-expedition-audit.cjs` covers deterministic generation, service
lifecycles, economy, lane gates, all six enemy fights, rewards and cleanup.
`tools/journey-expedition-browser-audit.cjs` covers real browser touch input,
all lab entries, old/new renderers and left/straight/right service entries,
plus desktop and high-DPI portrait screenshots.
`tools/journey-chest-audit.cjs` and `tools/journey-chest-browser-audit.cjs` cover
the chest migration, real pin win/loss, selectable/once-only coins, skipped
rewards, abandoned sessions, seeded replay, entry turns and touch/keyboard UI.
`tools/journey-scrap-audit.cjs` covers selectable fight loot, 40 seeded salvage
rolls, duplicate/stale claims, the same-run fight-to-forge economy, both smith
currencies, all four upgrade costs, failures/refunds, and reset/persistence.
`tools/journey-wolfden-audit.cjs` and `tools/journey-wolfden-browser-audit.cjs`
cover doubled seeded route budgets, all Wolf Den branches, four consecutive
real-engine fights, food pickup/adoption, companion lifecycle and turn support,
and mobile touch/desktop scene renders. Road Lab → Roadside ? → Wolf Den.

`tools/journey-roadside-art-audit.cjs` renders six roadside props, nine
conversation/camp variants, and the two embedded games in DPR2 portrait and
desktop layouts. It checks render-state purity and the bounded scene cache.
