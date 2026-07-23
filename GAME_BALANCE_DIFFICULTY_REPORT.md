# Knight Rush — Game Balance, Difficulty, Boss Combat, and Future Direction Report

Date: 2026-07-19

Terminology in this report follows the game: one **loop** is three individual stages/maps, rotating through beginner, intermediate, and final map pools.

## Executive verdict

Knight Rush already has a strong foundation for its intended identity. The three-stage pool registry, immutable encounter definitions, universal attack vocabulary, seeded content selection, fixed-duration route scaling, readable hesitation animation, and swept slide collision are all good systems to build on.

The current game is not yet primarily a build roguelite. It is currently a runner followed by a reaction exam and then a damage volley. Artifacts and upgrades improve numbers or forgive isolated mistakes, but most builds do not change how the player solves a boss. That is expected because the artifact, shop, and miniboss redesigns have not happened yet.

The most important combat finding is that the user's concern about perfect dodge is correct:

- Fixed attacks use invisible lane/posture rules resolved at a scheduled impact time.
- The boss model is animated toward those rules, but the model does not create the collision.
- A perfect dodge is mainly awarded from the timestamp of the last input, provided the player is safe at impact.
- Sweeping attacks are substantially better: rendering and collision share the same continuous path and the resolver prevents frame-rate tunnelling.

The right long-term direction is not pixel-perfect sprite collision. It is a shared pose sampler that produces both visible joints and simple attack capsules. The renderer and combat resolver should consume the same pose data. This will make the boss model the source of truth without making collision fragile or expensive.

The current infinite mode should keep escalating execution pressure after the move ladder is taught, but only through a readable bounded curve. Build quality, build synergy, boss HP, modifiers, and resource decisions should remain the main determinants of deep-run survival. The encounter-length, combo-cost, and shared deep-tempo curves move the game in that direction.

## Changes implemented with this report

### 1. Boss encounter length now bends after loop 12

The first twelve loops retain the original `+1 visible hit per loop` progression. After loop 12, additional hits use unbounded square-root growth.

| Loop | Previous visible hits | New visible hits |
|---:|---:|---:|
| 1 | 4 | 4 |
| 6 | 9 | 9 |
| 12 | 15 | 15 |
| 20 | 23 | 19 |
| 30 | 33 | 21 |
| 50 | 53 | 24 |
| 100 | 103 | 30 |
| 500 | 503 | 50 |

This curve never stops growing, so endless play remains endless. It prevents late bosses from becoming multi-minute reaction tests before the player's build receives its volley.

### 2. Authored combo-rank preference is now bounded

The previous rank preference grew linearly forever. Even though the main balance-beam curve was bounded, this second multiplier eventually made combos consume nearly every selection.

The preference now rises exponentially toward a small maximum. With the current three-boss catalogue, eligible combo **selection probability** settles around 51%.

| Loop | Previous combo selection | New combo selection |
|---:|---:|---:|
| 6 | 5.3% plus guarantee | 5.1% plus guarantee |
| 8 | 20.6% plus rank-3 guarantee | 19.3% plus rank-3 guarantee |
| 12 | 37.0% | 34.6% |
| 20 | 49.5% | 45.1% |
| 50 | 62.6% | 51.2% |
| 100 | 71.4% | 51.3% |

This percentage describes selection rolls while a combo fits the remaining move budget. A combo contains multiple visible hits, so the fraction of visible hits inside strings is higher.

### 3. Combos now use discounted, length-aware move cost

A normal attack costs one boss-move token. A combo costs `max(2, ceil(visible steps × 0.60))`. Short three-step strings therefore cost two moves, but a long procedural chain cannot purchase unlimited reactions with one or two tokens.

Fixed costs were rejected because they undo the encounter-length bend:

| Policy | Loop-50 visible hits | Loop-100 visible hits |
|---|---:|---:|
| Full step cost | 24 | 30 |
| Fixed cost 2 | 56 | 89 |
| Fixed cost 1 | 84 | 137 |
| **Implemented 60% cost** | **33** | **43** |

An 81,000-fight simulation across all three current bosses produced these final averages:

| Loop | Budget tokens | Average visible hits | Combo selections per fight |
|---:|---:|---:|---:|
| 6 | 9 | 9.9 | 1.31 |
| 8 | 11 | 14.1 | 1.65 |
| 10 | 13 | 15.5 | 1.97 |
| 12 | 15 | 18.7 | 2.88 |
| 20 | 19 | 24.7 | 4.12 |
| 50 | 24 | 32.9 | 4.84 |
| 100 | 30 | 42.7 | 5.12 |

This restores meaningful combo pressure while keeping deep fights far below the old linear encounter length. Procedural combo length should still be reviewed after model-driven collision is implemented.

### 4. Deep boss tempo is sharper and species-neutral

All normal hits, traveling swipes, combos, recovery, and between-attack cadence continue to use one shared tempo function. The original `0.78` floor now bends gradually toward a `0.60` deep floor by cubing the existing progression pressure. This adds only one balance value and no parallel timing system.

The first loop is unchanged and the early curve moves only slightly. At stage 212 (loop 71), a normal slide now has approximately `0.766 s` of scaled tell and `0.479 s` of travel, compared with `0.920 s` and `0.577 s` previously. Physical tell floors and swept collision remain authoritative, so higher speed cannot tunnel through the rider or erase jump/duck reaction requirements.

Bear and Hydra traveling swipes already shared collision, active timing, perfect windows, tell, and travel data. The actual inconsistency was a Bear-only torso-follow animation rule that accelerated from `0.46` to `0.80` during its strike while Hydra stayed at `0.34`. Both now use a constant `0.34` body-follow factor. Their silhouettes remain different, but neither species has a hidden swipe-speed curve.

## Current difficulty curve

### Route pressure

Every normal route remains approximately 60.14 seconds because route distance is derived from live speed. This is correct and automatically supports future speed-changing artifacts.

The spawn gap is measured in world distance, so a faster route produces more spawn opportunities during the same minute:

| Loop | Route speed | Approx. spawn opportunities per stage |
|---:|---:|---:|
| 1 | 22.00 | 102 |
| 6 | 28.45 | 132 |
| 12 | 32.70 | 151 |
| 20 | 36.31 | 168 |
| 50 | 43.46 | 201 |
| 100 | 49.20 | 228 |

This means route difficulty already rises in two ways: objects approach faster and more events occur per stage. The logarithmic speed curve is appropriate for endless play, but future map pools should use their obstacle composition—not another global speed multiplier—as their main tier identity.

### Boss tempo

Normal attack tell, travel, recovery, and cadence begin at the slower Move Lab values and scale every loop toward a bounded floor. A cubed late-pressure bend makes deep runs materially faster while keeping loop 1 unchanged and early teaching close to the previous curve. Physical telegraph floors remain authoritative.

The hesitation variance adds uncertainty without changing average speed:

| Loop | Chance of a varied boss tell | Maximum change |
|---:|---:|---:|
| 1–6 | 0% | 0% |
| 7 | 4.8% | ±1.8% |
| 10 | 16.0% | ±6.1% |
| 12 | 21.6% | ±8.2% |
| 20 | 34.2% | ±13.0% |
| 50+ | ~42% | ~±16% |

This is a good difficulty tool because it changes anticipation rather than simply making everything faster. It also preserves the artistic pull/hang/tremble/release language. One offset applies to the whole selected combo so its internal rhythm remains authored.

### Boss health and build pressure

First-map boss HP currently grows from 105 at loop 1 to 429 at loop 6, 906 at loop 12, 1,694 at loop 20, 6,188 at loop 50, and 19,078 at loop 100. Intermediate and final map pools add their pool modifiers.

This quadratic health growth is potentially suitable for a build-focused endless mode, but it cannot be judged in isolation before the artifact/shop redesign. Damage supply, upgrade cost, artifact rarity, synergy multipliers, defensive power, status scaling, and boss HP must be simulated together.

### Miniboss pressure

Current approximate base requirements are:

| Loop | Counters required | Attacks available |
|---:|---:|---:|
| 1 | 2 | 3 |
| 6 | 3 | 5 |
| 12 | 5 | 8 |
| 20 | 8 | 12 |
| 50 | 18 | 27 |

This converges toward requiring roughly two-thirds perfect execution in an optional one-hit-kill encounter. That is already strict. Do not increase it before the planned 40-miniboss/build redesign.

## Boss combat structure

The current boss loop is:

1. Boss introduction.
2. Player survives a fixed budget of visible boss hits.
3. Perfect dodges automatically counter and build chain damage.
4. Boss enters the volley phase.
5. Arrows, lances, follower attacks, status effects, and overkill resolve.

This separation is clean and readable, but it creates an important build-design limitation: even a broken offensive build must finish almost the entire dodge exam before its damage matters. Counter damage can reduce the boss below zero, but the game deliberately continues the chain until the volley.

For the future build update, different builds should influence the defensive phase itself:

- Counter/stagger builds could shorten the remaining attack budget.
- Guard builds could absorb contact by spending posture or armour.
- Mobility builds could gain resources from near misses.
- Status builds could damage or slow the boss during its attack phase.
- Companion builds could interrupt one move or create a safe recovery opening.
- Glass-cannon volley builds could remain mechanically demanding but end the boss immediately when their turn arrives.

This makes build choice affect how the boss is played, not only the size of the final damage number.

## Why perfect dodge currently feels frame-based

### Fixed lane and posture attacks

Fixed attacks spawn a hazard when the strike begins and resolve it once at `impact = strike start + travel`.

- Mid attacks check whether the player's eased screen position is inside a lane footprint.
- Low attacks check that the player is above a fixed jump-height threshold.
- High attacks check whether the duck state is active.
- Perfect status checks whether the appropriate input timestamp occurred within the last 180 ms and the player is safe at impact.
- The Serpent Eye widens the player window by 60 ms.
- Minibosses currently add another 90 ms.

The player must physically escape the hazard, so this is not a completely fake result. However, the reward is still defined mainly by “was the input recent enough?” rather than “did the attacking limb narrowly miss the player's body?” That is why it feels like hitting a timing frame.

Lane movement clears a standard 62-pixel footprint in roughly 50 ms under ideal frame timing. A jump takes roughly 65 ms to rise above the safe-height threshold. This creates a real late-input failure zone, but the perfect classification remains timestamp-based.

### Sweeps and pinches

Sweeps are the strongest current combat implementation:

- The same eased lane path drives visual contact positions and collision.
- Collision checks the entire segment crossed since the previous frame.
- This prevents tunnelling on slow devices or at high attack speed.
- The hit capsule and wider perfect edge travel with the visible limb.
- Pincer collision changes from a side wall to a low central snap using physical distance, not an unrelated timer.

This is the best prototype for the future collision system.

### Current model/collision relationship

The current data flow is effectively:

`attack definition → hidden lane/sweep contact → renderer aims model at that contact`

The artwork often lines up well because renderers receive `contactXs`, strike progress, and the same travel clock. But collision is still upstream of the model. The desired relationship is:

`attack definition → shared pose sample → renderer + attack collider → contact result`

## Recommended model-driven collision system

The implementation-ready Bear-first hybrid plan now lives in `BOSS_MODEL_HIT_UPDATE_HANDOFF.md`. That document is authoritative for the next combat update and preserves frame-driven bites plus the stationary three-lane jump/duck attacks during the migration.

Do not use per-pixel sprite collision. Pixel collision is expensive, difficult to debug, and makes harmless visual changes alter balance.

Instead, introduce a small pose/contact contract when boss animation work begins:

1. Each articulated model exposes a pure pose sampler for an animation and normalized time.
2. The pose contains named joints such as `leftPaw`, `rightPaw`, `jaw`, `shellEdge`, `waveFront`, or `weaponTip`.
3. An attack definition identifies which joint is dangerous and supplies a simple circle, capsule, segment, or arc around it.
4. Both renderer and collision resolver consume the same pose sample.
5. The resolver sweeps the collider from its previous pose to its current pose, preserving low-FPS safety.
6. The player's horse/rider use a small set of posture-dependent hurt capsules rather than one lane point.
7. Debug Move Labs render those exact capsules and record the contact frame.

This makes the visible paw, jaw, body, wave, or weapon the attack while keeping combat deterministic and performant.

### Recommended defensive outcomes

Separate physical evasion from a future active counter:

- **Hit:** attack capsule overlaps the player hurt volume.
- **Dodge:** no overlap when the attack passes.
- **Perfect dodge:** the attack passes through a narrow near-miss envelope without overlap while the player is actively moving into safety.
- **Parry/counter:** a separate, narrower defensive action intersects the attack during its parryable active phase.

The current automatic counter on every perfect dodge removes the strategic distinction between escaping and challenging an attack. A separate counter would allow:

- Dodge: more forgiving, survival-focused, little or no damage.
- Perfect dodge: resource/chain reward and strong feedback.
- Parry: hardest timing, direct posture damage or interruption.

This matches the desired Expedition 33/Sekiro tension much better than making the existing 180 ms timestamp window smaller.

### Animation requirements

Every boss move should satisfy these rules:

- Anticipation clearly identifies the attacking body part and required response.
- Hesitation pulls, hangs, trembles, and releases; random duration must stretch the pose rather than freeze it.
- Acceleration into contact is monotonic and visually forceful.
- The dangerous joint reaches the player on the collision frame.
- Contact has hit-stop, sound, shake, debris, and a readable recovery silhouette.
- Recovery starts from the exact contact pose without snapping.
- Combo transitions visibly release tension before the next pull.
- Audio cues come from animation/contact events, not arbitrary parallel timers.

The existing code already does several of these well: hesitation is normalized, bite closure reaches contact at `t=1`, recovery profiles are species-owned, sweep motion is monotonic, rendering is read-only, and effects freeze with hit-stop.

## Build and artifact direction

The current game has 22 artifacts, five equipment slots, two-choice rewards, and five linear shop upgrades. Early archetype clusters already exist:

- Arrow/volley: Quiver, Storm, Whetstone, Brand.
- Lance: Flask and lance upgrades.
- Counter/status: Drum, Moon, Venom, Serpent Eye.
- Companion: Horn, Alpha Fang, fang upgrades.
- Economy: Clover, Idol, Smith's Seal.
- Survival/mobility: Shield, Oak, Boots, Feather, Greaves, Time Bead.

These are useful seeds, but most are flat bonuses, immunities, or duplicate resource increases. They do not yet create enough different play patterns. Upgrade costs grow exponentially while most upgrade benefits grow linearly, which can make late purchases feel predetermined or irrelevant unless gold generation also scales strongly.

Recommended build architecture:

- Give artifacts tags such as `projectile`, `counter`, `guard`, `companion`, `status`, `economy`, `mobility`, and `score`.
- Move scattered artifact checks toward shared combat/run events: `onPerfectDodge`, `onParry`, `onBossAttackStart`, `onVolleyHit`, `onStatusTick`, `onPickup`, and `onStageClear`.
- Let common artifacts establish a build, uncommon artifacts convert mechanics, and rare artifacts multiply or break established engines.
- Allow negative or awkward combinations. Not every run needs to be equally strong.
- Protect a few universal survivability tools so a weak build is disappointing rather than immediately non-interactive.
- Make broken combinations visible and celebratory instead of silently clamping all synergy.

Suggested future build families:

1. **Volley engine:** projectile duplication, ammo conversion, crit/overkill loops.
2. **Parry engine:** posture damage, counter echoes, riskier narrow windows.
3. **Perfect-evade engine:** near-miss resources, speed, chain preservation.
4. **Companion pack:** different miniboss species provide roles and combination bonuses.
5. **Status engine:** poison, burn, bleed, frost/slow, detonation, duration conversion.
6. **Guard/tank:** armour, guard meter, retaliation, shield recharge.
7. **Economy/score:** compound gold, expensive transformations, overkill conversion.
8. **Mobility/runner:** route control, pickup magnetism, obstacle conversion, boss evasion benefits.

The most important design rule is that a build should be recognizable by loops 3–5, meaningfully online around combo introduction, and capable of becoming exceptional in later loops.

## Scaling to 20 maps and 40–60 bosses

### What is already ready

- `StageDefinition` and `EncounterDefinition` are immutable registered content.
- Beginner/intermediate/final map pools already rotate in the required order.
- Stage and encounter choice is seeded, so UI/render calls do not reroll content.
- Universal mechanics and species-owned render/recovery data are separated.
- Startup validation catches missing content contracts.

### What should change before the roster becomes large

- Do not require every future boss to feel like the same six attack groups with different art. Keep a small universal survival vocabulary, then declare optional capability/signature tags per boss.
- Guarantee mechanic teaching across a map tier or encounter pool when appropriate, not necessarily by forcing every boss to demonstrate every mechanic.
- Add encounter metadata for tier suitability, mechanical complexity, elements, build interactions, and mode availability.
- Separate code into balance, core simulation, mode policies, map content, boss data, and renderers before dozens of large model functions make the single HTML file unmanageable. A build step can still emit one deployable HTML file.
- Add content-budget validation: maximum authored combo length, required recovery event, collider coverage, animation/contact alignment, and mobile performance cost.

## Multiple game modes

The shared run-policy layer is now implemented. The current `endless_build` policy preserves existing behavior and owns stage pools, progression tiers, boss/miniboss inclusion, boss scoring, reward continuation, and stage advancement.

A run policy should own:

- Stage/map selection.
- Difficulty progression.
- Boss/miniboss inclusion.
- Reward cadence and artifact rarity.
- Shop cadence.
- Run termination and victory conditions.
- Score rules and persistence.

Future policies can replace those decisions while the existing stage definitions, encounter definitions, actors, renderers, mechanics, and collision remain shared. Mode-specific UI and victory presentation can be added when the first additional mode is designed.

### Current infinite build mode

- Endless seeded three-tier map rotation.
- Difficulty after onboarding should emphasize build checks and content combinations.
- Mechanical reaction floors and bounded variance remain stable.
- Rare broken builds are a feature.

### Future three-act progression mode

- Curated act difficulty rather than endless formulas.
- Carefully selected map/boss pools and fixed act bosses.
- Predictable reward budgets with controlled build assembly.
- Bosses test learned mechanics and build decisions, not arbitrary late-loop speed.
- A complete run should have a designed dramatic arc and an achievable ending.

### Future pure infinite scroller

- Route-only or route-dominant policy.
- Minimal combat interruption.
- Separate score expectations and leaderboards.
- Reuse map obstacles, atmosphere, speed, pickups, and route artifacts.

## Priority roadmap

### Priority 1 — Instrument responsiveness before replacing it

Expand Move Lab to record:

- Telegraph release time.
- Visible joint/player distance at collision.
- Input-to-state latency.
- Safe, perfect, parry, and hit classification.
- Frame rate and swept distance.
- A short replay trail of player and collider positions.

This turns “it feels late” into measurable evidence.

### Priority 2 — Prototype pose-driven collision on one boss

Use the Bear because its paws, frame-hit bites/jumpduck moves, traveling sweeps, and pinch cover the hybrid vocabulary. Do not migrate all bosses until the contract feels correct.

Acceptance targets:

- The dangerous joint/collider visually overlaps on every hit frame.
- Results remain the same at 30, 60, and 120 FPS.
- No attack tunnels through the player.
- Move Lab explains every hit and perfect result.
- Cosmetic animation edits cannot silently resize damage unless collider data changes.

### Priority 3 — Separate dodge, perfect dodge, and parry

Test the combat feel with one explicit parry/counter input. Keep dodge as physical escape. Decide mobile controls before building an entire counter artifact family.

### Priority 4 — Artifact/shop event architecture and build redesign

Create real mechanical archetypes, rarity, event hooks, transformations, and intentional broken combinations. Balance HP, gold, damage, defense, and rewards together.

### Priority 5 — Miniboss redesign

Use the future 40 minibosses as build components rather than forty variations of the same counter quota. Species can offer follower roles, artifact hooks, one-run transformations, or mutually exclusive build commitments.

### Priority 6 — Content expansion and additional run policies

Only after the combat and build contracts are stable should production scale toward 20 maps and 40–60 bosses. Register progression and pure-scroller policies through the shared layer instead of duplicating stage flow.

## Additional balance recommendations

1. **Do not reduce the universal perfect window yet.** The frame-based feeling comes from classification and collision architecture, not simply generosity.
2. **Keep hesitation bounded and symmetric.** It is tension, not a hidden global speed increase.
3. **Review random combo length after collision v2.** Deep procedural strings grow without a fixed ceiling. Consider authored recovery breaks every 5–7 actions rather than an arbitrary total-length cap.
4. **Give new players more than one mistake-learning channel.** One-hit death is dramatic, but a base guard point, early-loop wound, or generous retry resource may teach bosses better than repeated full-run restarts.
5. **Avoid scaling every axis together.** When a loop introduces a new mechanic or content tier, hold at least one of speed, count, HP, or combo pressure nearly stable.
6. **Measure build success separately from execution.** Record damage sources, artifact triggers, gold curve, defensive saves, boss attacks survived, and cause of death in debug runs.
7. **Use soft build checks, not immunity checks.** A boss may pressure a build's weakness, but should not invalidate an entire archetype unless the mode clearly telegraphs that rule.
8. **Preserve giant-boss readability.** Large silhouettes need exaggerated anticipation, a clean attacking limb, quiet backgrounds near contact, strong sound, and recovery poses that reveal the next neutral state.

## Final assessment

The project is heading toward a distinctive combination rather than a copy of one reference: endless runner navigation, roguelite build construction, giant reaction-driven bosses, and score/overkill chasing.

The architecture is already unusually thoughtful for a single-file game, especially its registries, immutable content, universal mechanic catalogue, render/update separation, and swept collision. The next major quality leap will not come from more speed or smaller timing windows. It will come from making visible animation the source of combat contact, separating evade from counter, and allowing builds to change how the player survives and controls a boss phase.

Once that combat contract and the build event system are stable, the planned map and boss count can expand without multiplying hidden timing exceptions or copied game-mode logic.
