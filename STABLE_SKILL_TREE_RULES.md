# Stable Skill Tree Authoring Contract

This is the permanent brief for generating and reviewing Stable skill evolutions. The executable source of truth is in `KnightRush.html`, primarily `SKILL_STABLE_FORM_CONTRACTS`, `validateStableLineageContract`, the branch contracts, and the boot-time design audit.

## Core model

Stable evolution follows exactly this hierarchy:

`Form = Primary` -> `Specialization = Secondary` -> `Twist = relationship` -> `Apex = maximum expression`

Every card upgrades its immediate parent. A child is never generated again from the base skill or Form state. Rarity controls the power added by the current choice; it does not erase accumulated mechanics.

### Parent-plus-delta compiler (v5)

Stable synthesis is an immutable fold:

`Base + Form receipt + Specialization receipt + Twist receipt + Apex receipt`

- A layer may spend only its own Quality receipt on its new expression. Earlier receipts are immutable foundation.
- Total clean damage and inherited Mark output cannot fall from an immediate parent to a Stable child.
- Fixing the child route and offered rank, raising any earlier rarity must never produce a weaker child in either four-scenario power or six-turn rotation power. Parent ordering is immutable.
- Discrete thresholds may let a weaker history catch partway up, but they cannot erase the foundation gap: at least `10%` of every meaningful parent power gap and at least `1` visible design-power point must remain in the child result.
- At least 25% of the current receipt's `DIRECT_DAMAGE` allocation remains visible as new clean damage. Relationship costs may shape the rest, but cannot reach backward into parent damage.
- Every Stable layer must improve both the four-scenario guardrail and the six-turn playthrough guardrail. Resource conversion is evaluated by the real scenario, including the opportunity cost of consumed Mark; inheritance may not add synthetic conversion damage to make the result pass.
- Increasing the current card's rank may preserve a stat while another stat grows, but it may never reduce damage, Mark, contact count, Chain output, real Chain damage, Weight, Posture, Crit chance, Bleed, Charge rate, pulse count, Bloom, or Trail. At least one owned output must improve; the rounded six-turn score may remain equal but may never fall.
- A Delivery transformation may redistribute hits, but the complete inherited damage remains. A minimum six damage per visible damaging contact protects combat readability.
- Weight exists only when the current route explicitly owns `weightChannel`. Single-hit Mark/Mark and other non-owners always compile with Weight `1`.
- Weight and authored mechanic payments apply only to the current layer's direct-damage remainder. They never divide or spend the parent's realized damage.
- Stable synthesis commands are cached by their complete deterministic route and rarity history. Callers receive copies, so validation is fast without sharing mutable combat state.

These are compiler invariants, not reviewer suggestions. Distorted or Corrupted content must use a separate explicit trade contract if it is ever allowed to reduce an inherited stat.

Each skill slot contains exactly one living move. Evolution choices do not add sibling cards to a deck: the selected node replaces and synthesizes the current move. For Sharpshoot, the player has one current Sharpshoot at every moment, never Split Sight plus Blood Mark plus another Form.

Consequences:

- Sibling Forms, Specializations, Twists, and Apexes are mutually exclusive.
- A node must never require a resource or behaviour that only a locked sibling can provide.
- Every current move must function from a clean encounter state. External skills, the normal attack, companions, and artifacts may strengthen it, but cannot be required to unlock its basic loop.
- A Mark reader, consumer, or converter Form must generate Mark itself so repeated use can prime its own loop.
- Synergy is evaluated between the current versions of different equipped skill slots, companions, and artifacts; never between mutually exclusive nodes of one skill tree.
- Evolution history matters only through mechanics synthesized into the one current move and through explicitly derived systems such as Rarity Resonance.

Stable is the readable, coherent build lineage. Distorted and Corrupted will later be the authored exceptions that bend or violate these rules.

## Layer responsibilities

### 1. Form: Primary and chassis

- Selects one Primary `resource:verb`, such as `Chain:Generate`, `Mark:Generate`, `Mark:Read`, `Posture:Generate`, or `Resolve:Refund`.
- Locks the broad chassis, currently `MULTIHIT` or `SINGLE`.
- Publishes a finite affinity palette: the Secondary mechanics this Form is allowed to select later.
- May contain small incidental behavior, but that behavior does not automatically become an expandable Secondary.
- Must not declare `secondaryId` or `relationshipId`.

Form makes the largest build decision, but it does not decide the entire build.

### 2. Specialization: Secondary

- Selects exactly one `secondaryId` from the Form's affinity palette.
- Must visibly establish that Secondary in combat state.
- Uses the affinity's authored `focusAxis`.
- Every affinity contract must contain a unique name and a one-sentence mechanical `promise`.
- May select an internal axis such as cadence or damage timing, or a compatible resource mechanic such as Mark generation.
- Cannot abandon the Primary/chassis or introduce a capability outside the selected affinity.
- Numeric Secondary output may not use per-rarity lookup values or an improvised curve.
  It is compiled from accumulated Quality, the Primary/Secondary role policy and the
  weapon Handling expression coefficient. Any wallet power that the chassis cannot
  express returns to an allowed Primary axis; it is never deleted or granted for free.
- Runtime clipping is not balance. A reference-share audit may reject an authored route,
  but it must not flatten stronger histories to the same output during synthesis.

The same mechanic may appear in neighbouring Form palettes. For example, `Chain Primary -> Mark Secondary` and `Mark Primary -> Chain Secondary` are both valid. They are different builds because ownership and direction are reversed.

### 3. Twist: Primary-Secondary relationship

- Inherits the Specialization `secondaryId` exactly.
- Declares one `relationshipId`.
- Changes the balance, cadence, distribution, timing, or emphasis between the existing Primary and Secondary.
- May move weight from Primary toward Secondary or the reverse.
- Cannot introduce a third mechanic, swap the Secondary, or reset to Form.
- Uses the Form contract's relationship focus axis.
- Is authored once as a rarity-neutral mechanical blueprint. Common, Uncommon,
  Rare, and Legendary are four power expressions of that same blueprint.
- Rarity cannot change the Twist's Delivery pattern, relationship,
  Primary/Secondary ownership, or output/interaction mode. It contributes persistent
  Quality; the shared Delivery curve may therefore grow the selected pattern's parameter
  without a rarity-authored contact table.

A Twist is not a new mechanic. It is an authored answer to: "How do these two existing mechanics work together?"

### 4. Apex: maximum expression

- Inherits both `secondaryId` and `relationshipId` exactly.
- Keeps the Twist's authored cadence/shape contract.
- May increase impact or resource weight within that relationship.
- Uses an authored Resolve cost curve. The current standard Apex curve is `Common +0`, `Uncommon +0`, `Rare +1`, `Legendary +2` over its immediate Twist.
- Cannot add a mechanic, choose a new relationship, or rewrite the rotation.

Apex is allowed to be a clean power refinement because the build decisions were made in the previous layers.

## Capability verbs: Output and Interaction

Output and Interaction are separate contracts. Output says what the move creates; Interaction says how it uses an existing resource. A move may therefore generate Chain while reading Chain for damage, or generate Mark while converting a capped amount of starting Mark.

- Chain Output: `GENERATE`, `NONE`
- Chain Interaction: `READ_DAMAGE`, `CONSUME`, `NONE`
- Mark Output: `GENERATE`, `NONE`
- Mark Interaction: `READ`, `CONSUME`, `CONVERT_CHAIN`, `NONE`
- Posture Output: `GENERATE`, `CHAIN_POSTURE`, `NONE`
- Resolve Output: `REFUND`, `CONDITIONAL`, `NONE`
- Resolve Overflow: `CONVERT_CHAIN`, `NONE`
- Chassis: `MULTIHIT`, `SINGLE`

The Form Primary output or interaction must always remain present. Any channel that differs from the Form baseline must be explicitly allowed by the selected affinity. Otherwise it is a forbidden third mechanic. Numeric scaling inside an already-present Output is governed separately by support ownership.

## Critical output contract

- Critical Secondary grants only move-local flat chance. It cannot grant global Crit,
  change the `×1.5` multiplier, or open the Primary-only Precision engine.
- Local chance is priced by expected direct Health damage:
  `Crit power / (base damage × (Crit multiplier - 1))`.
- Crit chance must be synthesized from accumulated Quality and expression policy, never
  from per-rarity lookup percentages. A boot guardrail may reject an overpowered route
  but cannot clip stronger histories to the same runtime value.
- Each direct sequential contact rolls independently. One successful roll multiplies
  that contact's direct Health and Posture together; it does not multiply Mark payload,
  Chain bonus, Bleed or another delayed effect unless a later authored rule says so.
- Crit and Break multiply in order; the standard result is `1.5 × 1.5 = 2.25`.

## Bleed output contract

- Bleed is a short two-tick status, not integer stacks plus hidden potency or retention.
- A move adds its authored Bleed to both `NEXT` and `LATER`. The boss pays `NEXT` when
  its defense phase ends, then `LATER` advances into `NEXT`; after that it expires.
- If a defense Break ends that phase early, that single Bleed tick receives `×1.25`.
  Bleed never receives the normal direct `×1.5` Break multiplier.
- Bleed cannot Crit, does not scale from Chain, and its tick creates no Chain.
- One applied Bleed pays exactly twice, so Stable synthesis prices it as
  `Bleed = Affliction Power / 2`.
- Affliction Secondary opens application only. It cannot author potency or duration
  engines; those belong to Affliction Primary or a later explicit Twist/Apex.
- Retention/decay is reserved for a future Poison identity rather than Bleed.
- Bleed values must come from accumulated Quality and the shared conversion, never a
  per-rarity lookup table or runtime rarity cap. A technical storage cap may only guard data.

## Charge output contract

- Charge Primary commits the move across a defense phase and later Releases for zero AP
  and zero additional Resolve. Charge Secondary never delays its inherited move.
- Charge Secondary banks defense performance: completing a defense phase gives `1`, each
  Perfect Dodge or Parry adds `1`, and a defense Break guarantees at least `2`. The shared
  bank caps at `3`, persists until used, and never accumulates beyond that cap.
- Only a command with `DEFENSE_TEMPER` consumes the bank. Other skills, Fight and companions
  cannot spend it. Repeating the same command in one player phase finds an empty bank.
- Secondary Charge converts the consumed bank into base damage, so ordinary Chain, Crit and
  Break rules may multiply it. It cannot refund AP/Resolve or increase Mark by default.
- Stable synthesis prices the conditional output at expected `2 Charge`; `3 Charge` is the
  bounded reward for strong defense, not a second Quality budget. Rate comes from accumulated
  Quality and one shared formula, never a per-rarity table.

## Mark resource contract

Mark is an encounter resource with no gameplay stack or per-action generation cap. The implementation accepts non-negative safe integers only to protect arithmetic and save data; that technical check may never flatten a reachable build. Quality, weapon identity, resource opportunity cost, and scenario balance—not an arbitrary maximum—control Mark production. A sufficiently strong synthesized build may therefore produce more than `12` Mark in one action.

Presentation:

- `1-4` Mark uses one separate pixel crosshair per stack.
- `5+` Mark uses one crosshair with a numeric multiplier.

Every Mark-interacting move declares a data rule with:

- mode: `CONSUME`, `READ`, `CONVERT_CHAIN`, or `READ_TEMP_CHAIN`;
- timing: once for the action or independently per hit;
- cap: a positive amount or `ALL`;
- value curve;
- payload delivery for a multi-hit action;
- damage per Mark or Chain per converted Mark.

Hard combat rules:

- Mark itself has no universal damage value. The current move interprets it.
- Normal Fight consumes at most one Mark at full value.
- A per-hit consumer may never declare `ALL`; this prevents copying the entire reserve onto every hit.
- An action-level Mark payload is delivered once and may be assigned to the first hit, last hit, or distributed evenly. It is never duplicated implicitly.
- Standard Mark payload is added after Chain scaling, so Chain does not multiply Mark damage. Break may still multiply the complete hit.
- A capped consumer uses every consumed Mark at full value.
- A Stable move that consumes all Mark for damage must use a named, priced curve unless an explicit exception says otherwise.
- A non-consuming reader may remain linear and uncapped when that is its declared identity. It must still pay through its Quality allocation and pass clean, Mark-ready, Chain-ready, combined, and multi-turn scenario audits. F1S2T3 deliberately follows this rule: every preserved Mark grants the same temporary Chain value.
- The default `SATURATED` curve values the first four stacks at `100%`, stacks five through eight at `50%`, and later stacks at `25%`.
- Current stronger authored curves are `RARE_DETONATION` and `LEGENDARY_DETONATION`. Full-value unlimited damage consumption is reserved for an explicit future exception such as a properly priced Corrupted effect. Mark-to-Chain conversion is instead priced by subtracting the consumed Mark's option value.
- Spending a large reserve slowly through capped attacks is more efficient; consuming it immediately is faster but less efficient.
- A converter consumes only its declared amount. If it is a Form, its own Mark gain must prime the next use without a sibling Form.
- Balance evaluates net resource state. Gaining Mark is positive option value; consuming existing Mark is the matching negative opportunity cost. A converter is not allowed to count the gained Chain while pretending the spent Mark was free.

Phase ownership:

- Chain built during boss defense carries into the immediately following player phase.
- Ending that player phase clears Chain before the next defense phase begins. Chain created by attacks cannot leak across repeated boss cycles.
- Mark remains an encounter resource and follows the move's explicit read/consume/generate rules rather than the Chain phase reset.

The boot audit must test per-hit reserve preservation, capped Fight consumption, the `4 / 8 / 12 -> 4 / 6 / 7` Saturated values, non-consuming reads, self-priming conversion, and separation of Chain and Mark damage.

## Secondary ownership and weights

Changing a number is not automatically a new mechanic, but important support weights can have an owner. `supportOwners` declares the specialist; `supportPolicies` declares any controlled scaling available to neighbouring branches.

Split Sight always retains Sharpshoot's basic Mark Output. Its `MARK_GENERATE` Secondary owns unrestricted Stable Mark scaling and may reach `3+`. A non-owner path may still increase `1 -> 2 Mark` only on a Rare or Legendary selection; descendants inherit that amount. It may not reach `3`, and Common/Uncommon selections cannot introduce the increase. This lets every F1 lineage occasionally improve Sharpshoot's core attribute without making every branch a Mark-specialist build.

Do not hard-lock arbitrary percentages. Neighbouring builds need a readable gradient, not isolated boxes. Ownership prevents identity theft while still allowing Primary-Secondary balance to move at Twist and Apex.

`primaryFloors` and affinity `inheritanceFloors` protect the defining quantities once selected:

- A Stable child cannot reduce a protected Primary weight below its immediate parent.
- A Stable child cannot reduce its selected Secondary weight below its immediate parent.
- Split Sight currently protects total Chain as Primary weight.
- Every Split Sight lineage preserves at least its inherited Mark gain.
- `MARK_GENERATE` protects and may continue scaling Mark gain after Specialization establishes it.

These are lineage floors, not fixed final numbers. The default is **no silent regression**:

- Form and Specialization establish identity rights and may not trade them away.
- A route with no explicit trade contract may only preserve or increase inherited floors.
- A future Stable Twist may declare a bounded `tradeContract`, but only between its already selected Primary and Secondary relationship. It must name the reduced output, the gained relationship output, the retained floor, and the minimum compensation. Generic damage alone cannot buy away identity, and no defining mechanic may disappear.
- Apex may improve an inherited Twist trade but may not invent a new sacrifice.
- Distorted and Corrupted content may later use broader sacrifice contracts.

Per-hit damage, cadence, distribution, cost, and other unprotected weights may trade against each other, but every Stable child must remain a net upgrade in the combined combat guardrail. Quality receipts themselves never regress.

## Animation and Delivery contract

- A skill id never owns a bespoke hardcoded Bow timeline. Bow presentation is resolved from a bounded reusable recipe.
- Delivery owns actor, family, targeting, contact pattern and phase timing. The Bow recipe owns raise, draw, hold, release, recovery, projectile travel and impact presentation.
- Contact topology and choreography are separate contracts. Two moves may both remain `SINGLE`
  while using different preparation, targeting and impact cues; a visual distinction never
  invents a second combat contact.
- New weapons and routes extend the immutable recipe registry instead of branching inside the
  frame loop. A resolved action selects and freezes its recipe once; drawing uses fixed-cost
  canvas primitives without per-frame arrays, particles, content scans or skill-id lookups.
- The shared Bow character-motion scale is applied once while building the action timeline.
  Raise, draw, hold, release and recovery may slow together, but projectile `arrowSpeed` remains
  independent so readability changes cannot silently alter contact timing or combat balance.
- Damage resolves on the generated `CONTACT` event. Changing arrow speed or draw timing must keep animation, projectile and combat contact synchronized.
- Form selects the initial Delivery. A compatible Primary/Secondary pair may silently select
  a new Delivery at Specialization; otherwise it inherits Form. Twist may preserve or
  transform that compatible Delivery. Apex refines the chosen result.
- Attribute does not directly imply hit count or animation. Sequential, Single and Simultaneous Packet remain Delivery decisions.
- Delivery magnitude is `floor(sqrt(total cumulative Quality))`, minimum `1`, with no
  gameplay maximum. Sequential maps it to contact count, Simultaneous Packet to pellet
  count, and Single to Weight. A one-contact Sequential or Packet is valid.
- Weight does not multiply base damage universally. The authored Single relationship
  declares which mechanic Weight intensifies. F1S2T2 multiplies the global base Chain bonus
  while keeping one visible hit. Each Weight step beyond `1` currently expresses `30%` of
  one additional base-Chain coefficient; the curve remains uncapped. Quality-bought extra
  Chain scaling is added once afterward and is not recursively multiplied by Weight.
- Weight has no gameplay maximum, but it is not a second free power wallet. A converter's
  clean-impact payment uses expected defense Chain plus the Chain that its own sustainable
  Mark production will convert on later uses. A centrally authored payment share preserves
  a real reward for successfully priming the relationship while preventing high-Quality
  Mark + Weight from scaling as an unpriced second engine.
- F1S1 Mark/Mark owns a strict identity wall against F1S2 Mark/Chain. At one fixed
  Form/Specialization/Twist rarity history, the weakest Mark/Mark Twist must produce
  more guaranteed Mark than the strongest Mark/Chain Twist. Damage identity is measured
  over the shared clean/Mark-ready/Chain-ready/combined scenarios, so a weighted
  Mark/Chain arrow is credited for the Chain multiplier it actually owns instead of being
  misclassified by its deliberately reduced clean-impact payment.
- Every F1S1 Twist has exactly one damaging contact and therefore exactly one natural
  Chain. It cannot add Chain scaling, read Chain as a relationship mechanic, convert
  Mark/Chain, or create extra damaging contacts. Global combat Chain still affects the
  single hit by the universal rule; the card owns no additional Chain engine.
- F1S1T1 applies the largest unconditional Mark package in one immediate event.
  F1S1T2 lands one damaging arrow, then applies its complete Mark output through
  separate non-damaging pulses. Pulses are real Mark application events for future
  Artifact hooks, but never hits and never Chain contacts.
- F1S1T3 is independent and never reads T1's output or scaling. At the standard Common
  history it produces exactly `5` unconditional Mark, preserves visible action-start Mark,
  then adds `floor(starting Mark × 0.20)` after impact. Thus `5 / 10 / 15 / 20` starting
  Mark yield `+1 / +2 / +3 / +4` Bloom. Only action-start stacks are read, so Mark created
  by the same action cannot recurse. The rate and output have no gameplay cap or diminishing curve.
- F1S1T4 installs Mark Trail only after its own impact. Every later damaging player-side
  contact in the same player phase adds the authored Mark amount; its own installing hit
  cannot trigger the Trail. Trail does not change the later attack's damage or Chain and
  is cleared whenever the player phase ends or a new one begins.
- F1S2T2 is the explicit Sharpshoot conversion exception: consume half of starting Mark
  rounded up, convert `1:1` to Chain before damage, calculate the weighted hit from the
  post-conversion Chain, then apply normal Mark gain. Its future Apex may replace half with
  all; direct Mark detonation remains the second weapon skill's identity.
- F1S2T3 uses `IMPACT_ECHO`, not a packet. Exactly one physical arrow is released and,
  before Apex refinement, the action produces exactly `+1` persistent Chain. Cumulative Quality controls
  how many damage contacts echo from that one impact. Starting Mark is preserved and every
  Mark is read linearly as `0.35` temporary Chain with no cap or diminishing return; this
  temporary Chain affects only the current action's damage and is never stored.
- F1S2T4 uses a true `SIMULTANEOUS_PACKET`: cumulative Quality controls the number of
  separate pellets released at the same time. The whole packet produces exactly `+1` Chain.
  Its paid Mark floor is one per pellet; because Packet gives up the extra natural Chain
  contacts of an equivalent Sequential delivery, `ceil(lost Chain power / Mark power)`
  additional Mark compensates that delivery trade. Quality Mark output may grow beyond both
  values without a cap. It does not read or consume existing Mark.
- F1S2 and F1S2T1 sequential arrows use live Chain. Every visible arrow produces `+1`
  Chain after its hit, and every later arrow benefits from the Chain produced by earlier
  arrows in the same action. T1 must never lock all contacts to the action-start value.
- Chain scaling rank comparisons use the absolute marginal Health damage added by one
  real stored Chain across the whole action. The internal percentage coefficient may fall
  when a rank buys more base damage or contacts; the absolute per-Chain payoff and the
  move's owned identity outputs may never regress with Stable rarity.
- Stable rarity is a strict upgrade, never a sidegrade. With route and ancestry fixed,
  `Common -> Uncommon -> Rare -> Legendary` may not reduce direct damage or any existing
  combat output, and every step must improve at least one visible output. A deterministic
  prefix floor preserves the strongest earlier-rank damage and carries that correction as
  foundation power into later depths; it has no authored maximum.
- A Twist-owned Mark mechanic spends the Mark wallet rather than silently taking damage.
  Bloom/Trail power is reserved first and the remaining Mark wallet becomes immediate Mark.
  F1S1T4 reads its own Twist receipt (not arbitrary total-history thresholds), producing a
  visible `1 / 2 / 3 / 5` Trail ladder for Common/Uncommon/Rare/Legendary at the standard
  ancestry. Future discrete mechanics must declare and test an equivalent rank ladder.
- Runtime resolves the recipe once at action start. Frame updates consume the prepared timeline and may not recompile Quality or scan card history.

## Current expression axes

- `CADENCE`: hit count and delivery rhythm
- `DAMAGE_WEIGHT`: total authored base impact
- `DAMAGE_SHAPE`: even, front-loaded, back-loaded, or shaped damage
- `CHAIN_SHAPE`: Chain density and per-hit distribution
- `EFFICIENCY`: Resolve cost without creating a refund engine
- `MARK_SHAPE`: Mark generation/reading weight
- `POSTURE_SHAPE`: Posture weight
- `PAYOFF_SHAPE`: Chain cashout weight
- `ECONOMY_SHAPE`: Resolve-engine weight
- `PRIMARY_SECONDARY_BALANCE`: Twist/Apex relationship axis

Expression axes describe authored identity; they are not automatically Quality sinks.
Every Quality axis must have an executable handler. `FRONT`/`BACK` Chain shape is a
blueprint rule: Quality buys `CHAIN_TOTAL`, then the rule distributes newly opened Chain.
A shape label may never consume budget while doing nothing.

## Pool and rarity rules

The current authored breadth is six rarity-neutral Form recipes, six Specialization recipes per Form, four Twist recipes per Specialization, and four Apex recipes per Twist. These counts are content targets, not compiler assumptions. Drafting first selects distinct eligible routes with equal family probability, then rolls rarity independently for each offered route. Rarity must never make a Form, Specialization, Twist, or Apex route intrinsically harder to access.

For Twist, the exact parent history is fixed before rarity comparison. All four
rarities compile `parent history + the same relationship blueprint + the new rarity
packet`. Higher rarity strengthens permitted numeric axes and may open an already
declared threshold or Legendary Stamp slot; it may not invent a new behavior.

Rarity is an additive improvement over the complete parent history:

- Common: small but mechanically distinct
- Uncommon: stronger or more specialized
- Rare: clearly powerful
- Legendary: decisive and genuinely advantageous

A Common child of a Legendary parent is not a lower-tier replacement. `Common` describes the size of the new contribution; the synthesized result contains the accumulated power and mechanics of its whole lineage.

Rarity contributes to two persistent ledgers:

| Rarity | Quality | Resolve Pressure |
|---|---:|---:|
| Common | 1 | 0 |
| Uncommon | 4 | 1 |
| Rare | 8 | 2 |
| Legendary | 14 | 3 |

Quality is a synthesis budget allocated only through the selected route's authored axes. It is not a universal damage multiplier. Resolve Pressure controls cost independently:

Pure-Attribute Stable routes reserve a small visible rarity expression without receiving free power. Form is untouched. From Specialization onward, the desired expression is `1.5%` of the current layer's rarity premium above Common, but it may be paid only from that layer's unspent discrete Primary reserve. The compiler transfers at most that reserve into direct damage. It may never lower a completed Mark/Posture threshold, so a higher rarity cannot lose visible Primary output merely to show a damage difference. Common contributes no rarity expression. Future pure attributes must register the same reserve-funded policy explicitly rather than copying a raw damage bonus.

While the second, Mark-reading skill is not yet materialized, the Mark/Mark versus Mark/Chain solo playthrough ratio may reach `1.31`; its score ratio remains capped at `1.20`, its expected damage must remain lower, and its guaranteed Mark must remain higher. This extra one-percent observation band is provisional and must be recalibrated with the four-skill rotation simulator rather than expanded silently.

The executable Quality Compiler contract is documented in `QUALITY_COMPILER_DESIGN_TR.md`. Rarity Quality remains the visible 1/4/8/14 RNG sum. Every completed layer also carries guaranteed Structural Quality: Form 2, Specialization 2, Twist 3, Apex 4. Effective Quality applies fixed depth leverage only to the packet that arrived at that layer: Form 1.20, Specialization 1.12, Twist 1.05, Apex and post-Apex 1.00. Earlier Quality never multiplies future packets.

Discrete threshold curves belong to a registered skill-family policy, not a global table.
Every descendant inherits its parent's `thresholdPolicyId`; a generated child cannot
silently switch to another skill's Hit/Chain/Mark economy.

The 1/4/8/14 curve is an authored reward curve informed by the base 65%/27%/7%/1% distribution and the effective highest-rarity distribution of a three-card draft. Identical full histories must compile deterministically from mechanical blueprints and allocation receipts; sequential stat mutation is forbidden for migrated routes. Stable wallets may never lower inherited stats implicitly; unspent discrete-axis power remains in that axis's Reserve.

`projected cost = Form base cost + floor(total Resolve Pressure / 3)`

During migration, legacy absolute cards keep their authored combat cost. Projected cost becomes authoritative only after that route owns a complete mechanical blueprint and Quality allocation profile. This prevents half-migrated content from changing balance.

Guardrail power is internal comparison currency, not combat damage. Current centralized
values are generated Chain `2`, generated Mark `6`, net Resolve `4`, and Posture `0.35`
per point. A one-Resolve refund adds four guardrail points because it cancels one point of
action cost; it does not deal four damage. These values are calibration policy and must
never be duplicated as magic numbers in individual routes.

Same-rarity siblings must create a tactical tradeoff. They cannot be separated only by damage numbers, and one cannot strictly dominate the other across all tested combat scenarios. Resolve recovery remains rare and authored; Common cards cannot introduce or improve it.

### Equal-power route contract

Route and rarity are orthogonal. After fixing the exact parent history and the offered rarity, every eligible sibling route must land in approximately the same effective-power band. A route may move that budget between hit count, timing, resource output, scaling, or another permitted axis; it may not secretly receive a higher budget because its authored catalogue node used to be Rare or Legendary.

For the first synthesized F1 slice, the boot audit evaluates clean, prepared-Mark, prepared-Chain, and combined scenarios. The maximum sibling spread is `10%` of the row mean. This is a regression guardrail, not a claim of final encounter balance. Every rarity ladder for one fixed route must also be strictly increasing.

Average power cannot hide a dead clean-state card or an uncontrolled prepared-state card.
Every recipe declares a clean floor, maximum scenario ratio, optional favored scenario,
minimum total impact, and minimum per-hit impact. Twist may intentionally move these
weights as part of the inherited Primary–Secondary relationship, but the contract must
state the change explicitly.

The effective-score ladder is not enough on its own. Within one fixed Stable route, higher rarity may not reduce Hit count, generated Chain, generated Mark, or an owned interaction rate. Base damage may fall only when accumulated discrete reserve visibly crystallizes into one of those mechanics and the combined score still rises. Without that readable mechanic gain, lower damage is a regression. Route-to-route sacrifices require the explicit Twist-only trade contract above.

Every synthesized history node records its Common route contribution and rarity premium separately. Later children must preserve earlier recorded contributions exactly. This makes a Legendary parent permanently relevant even when the following choice rolls Common.

AP is outside the Quality ledger. Until an explicit AP revamp, Stable synthesis cannot change the standard one-AP skill cost, generate AP, or refund AP. Rarity and accumulated Quality never increase AP cost automatically. Any future AP change must belong to an explicit authored chassis such as Charge/Release or a Distorted/Corrupted rule.

Resolve is an encounter-economy cost, not a generic rarity tax. The existing Resolve Pressure projection remains provisional and must not be expanded route-by-route before the economy revamp. The target rule is that Resolve changes only at an authored mechanical breakpoint where the move gains a materially new action-scale payoff; it should not rise on every rarity step, and its increase cannot erase that rarity's net reward. Final AP/Resolve curves are deferred until all four starting skills, Fight, companion actions, and the normal attack can be tested together in a full-turn rotation simulator. Until then the compiler leaves today's provisional combat costs unchanged and records the data needed for that pass.

### Rarity Resonance

Rarity Resonance is a persistent jackpot derived from the complete evolution history. It is not an intrinsic Resolve mechanic and does not consume a Form/Secondary capability slot.

- Every Rare contributes 1 Resonance point.
- Every Legendary contributes 2 Resonance points.
- Common and Uncommon neither contribute nor erase high-rarity history.
- At least two Rare/Legendary selections are required; one Legendary alone does not activate Resonance.
- 2 points: refund exactly 1 spent Resolve.
- 3 points: refund half the action's spent Resolve, rounded up.
- 4 or more points: refund the action's full Resolve spend.

Therefore two total Rare grant +1, three total Rare or Rare + Legendary grant half, and four total Rare, two Legendary, or two Rare + Legendary grant full refund regardless of intervening lower rarities.

Refund occurs once after the final hit and is capped by the Resolve actually spent. It cannot overflow, convert into Chain, recursively trigger another refund, or refund AP. Intrinsic Resolve is separate: it is explicit card text such as "regain 1 on Break" and requires an authored economy identity. F1 Stable synthesis does not roll intrinsic Resolve mechanics.

Resonance and synthesis ledgers are recalculated only when a mutation is applied or a skill is rebuilt, then cached on the run skill. Combat and rendering never scan lineage history per frame.

## Stable generation procedure

1. Define six rarity-neutral Form route recipes with Primary, chassis, affinity palette, Quality axes, and support ownership.
2. Calibrate every Form as a Common baseline; this is a balance fixture, not the route's permanent rarity.
3. Define six rarity-neutral Specialization recipes per Form. Assign one `secondaryId`, preserve the parent, and calibrate their Common results.
4. Author one normalized Quality allocation profile per route. The generic compiler distributes every history packet through the profile, derives Resolve cost from cumulative Pressure, preserves discrete reserve, and solves final damage from the shared targetPower.
5. Generate each candidate from full history: parent result + route recipe + rarity contribution + aspect contribution.
6. Generate the current four Twist and four Apex recipes from their immediate synthesized parents while preserving Secondary and relationship contracts.
7. Verify every result is a net upgrade, retains inherited Quality/Pressure/aspects, introduces no unauthorized mechanic, and obeys refund caps.
8. Boot the game and require every schema, lineage, economy, Resonance, sibling, branch, spectrum, and negative validator to pass.

## Split Sight Specialization identities

These six sibling paths must remain mechanically distinguishable before any Twist is authored:

- **Ranger's Rhythm — Ranger Tempo:** more independent hits with even Chain generation.
- **Opening Signal — Chain Distribution:** front-loaded Chain inside the paired shot.
- **Marked Rhythm — Mark Generation:** Mark becomes Secondary while Chain remains Primary.
- **Forked Cadence — Damage Timing:** impact is back-loaded while the paired Chain engine remains.
- **Driving Pair — Chain Crescendo:** Chain generation is back-loaded into the second beat.
- **Crown's Refraction — Chain Read:** every hit keeps generating Chain while current Chain supplies additional damage.

Opening Signal and Driving Pair are intentional mirrors. Ranger's Rhythm and Crown's Refraction are not: one is hit cadence, the other is a prepared-Chain payoff.

## Split Sight reference lineage

- Form: **Split Sight**
  - Primary: `Chain:Generate`
  - Chassis: `MULTIHIT`
  - Incidental baseline: 1 Mark
- Specialization: **Marked Rhythm**
  - Secondary: `Mark:Generate`
  - Establishes 2 Mark while preserving multihit Chain generation
- The parallel F1S1 Mark/Mark pilot now owns four materialized Twists:
  concentrated immediate Mark, separate non-damage Mark pulses, action-start Mark Bloom,
  and phase-long Mark Trail. All four stay one-hit/one-Chain builders and are mechanically
  barred from entering the Mark/Chain tree.
- The compiler scans `4 × 4 × 4 × 4 = 256` Mark/Mark Twist cards and compares the four
  Mark/Mark siblings against all four Mark/Chain siblings across 64 equivalent rarity
  histories. It also validates 192 independent Form/Spec/Twist rarity ladders. Boot fails
  if total power stops rising, an owned mechanic regresses, the Mark/expected-damage
  identity wall is crossed, or the two routes leave their shared power bands.
- T1, T2 and T4 convert cumulative Quality into an additional Mark every seven Quality,
  including the first partial step. T3 opts out of that exact reward: it keeps a fixed `20%`
  Bloom and receives the linear historical foundation `max(0, ceil(total Quality / 7) - 2)`
  as flat Mark. This preserves strong ancestry without making Bloom recursively accelerate.
  The conversion,
  Bloom result, Trail per contact, pulse payload, and delivery magnitude have no authored
  maximum. High-Quality audits verify that larger synthetic inputs keep producing output.
- Four authored pilot Twists each create a distinct Mark/Chain combat loop. They are not a numeric spectrum.
- Apex breadth follows the number of honest, independently playable outputs already owned by its
  immediate Twist. Four is a content target, not a quota. A narrow Twist may stop at two or three
  Apexes when additional children would only duplicate numbers, steal a sibling Twist, or introduce
  a third mechanic. Every Apex preserves its exact Twist relationship and Delivery family, then
  maximizes a different already-owned output.
- The repeatable Apex craft method is: list inherited outputs and forbidden sibling identities;
  count only independent tactical allocation axes; author one refinement per honest axis; allocate
  only the current Apex receipt; then exhaustively audit parent/rank non-regression, sibling role
  ordering, equal-power bands, Delivery inheritance, and cross-route identity walls. The generator
  must reduce breadth instead of fabricating filler when these gates cannot be satisfied.
- `F1S1T1` therefore owns exactly two Apexes. Both remain one immediate damaging contact, one natural
  Chain, and one unconditional Mark application event. A1 is the guaranteed Mark-volume leader with
  a `10/90` direct-damage/Mark Apex receipt. A2 is the impact leader with a `40/60` receipt. Neither
  may pulse, Bloom, install Trail, read/consume Mark or Chain, gain Chain scaling, or add contacts.
  At equal history/rank A1 Mark may never fall below A2, A2 damage may never fall below A1, and both
  inherited Mark and damage remain non-decreasing from their Twist parent.
- `F1S1T2` owns exactly three Apexes because separate non-damaging Mark application events are a
  third honest axis in addition to total Mark and impact damage. A1 spends `20%` of only its Apex
  receipt on `MARK_APPLICATION_EVENTS`, with each additional pulse priced at `2 power`; unspent
  fractional power remains Reserve. A2 uses a `5/95` direct-damage/Mark receipt and is the total-Mark
  leader. A3 uses `40/60` and is the real-arrow impact leader. All three retain one damaging contact,
  one natural Chain, positive pulse payloads, and all inherited output. They may not add hit contacts,
  read/consume resources, Bloom, Trail, Chain scaling, or a new combat mechanic. Pulse count has no
  authored maximum; it is bounded only by the requirement that every real pulse carry positive Mark.
- `F1S1T3` owns exactly three Apexes. All preserve one immediate hit, one natural Chain, starting-Mark
  preservation, the inherited `20%` Bloom foundation and no same-action Bloom recursion. A1 is the
  Bloom-rate leader: its Apex receipt is `70/15/15` direct damage/Mark/Bloom-rate, every `1.5 power`
  buys `+5` percentage points, and Reserve carries fractional power without a cap. A2 is the flat-Mark
  leader with `5/95`. A3 is the impact leader with `80/20`. Only A1 may change Bloom rate; no child may
  pulse, Trail, consume/read Mark for damage, add contacts, or gain Chain scaling. The T3 foundation
  bonus scales linearly from full history while A1 rate scaling uses only its own Apex receipt.
- `F1S1T4` owns exactly three Apexes. All preserve one immediate hit, one natural Chain, the full
  inherited direct Mark package, and the phase-bound Trail installed only after their own impact.
  A1 is the Trail-strength leader with a `30/25/45` direct damage/Mark/Trail receipt. Trail strength
  is a separately priced uncapped axis: every `6 power` buys `+1 Mark` on every later damaging player
  contact that phase, with fractional power retained as Reserve. A2 is the upfront-Mark leader with
  `5/95`; A3 is the impact leader with `80/20`. Only A1 may change Trail strength. None may trigger
  Trail on its own hit, change its phase duration, add contacts, pulse/Bloom, read/consume resources,
  or gain Chain scaling.
- Adjacent completed F1S1 Apex families are compared across all `4^4` equivalent rarity histories.
  Their family-mean score and six-phase playthrough spreads may not exceed `12%`; the most extreme
  individual sibling cards across those families may not exceed `20%`. This gate is cumulative: every
  newly authored F1S1 Apex family must enter the same comparison instead of being balanced in isolation.
- `F1S2T1` is the direct sequential continuation. Every visible arrow generates one Chain and reads the live Chain value, including Chain created earlier in the same action.
- Its four Apex refinements are: produce and distribute distinctly more Mark across contacts, ramp the live Chain coefficient on later arrows, back-load clean damage into the final arrow, or increase uncapped contact cadence. The Mark refinement pays for its guaranteed extra Mark from its own damage allocation and must outproduce the Tempo refinement at the same history/rarity. None may consume/read Mark or replace sequential Delivery.
- The Chain-ramp Apex must visibly scale its last-arrow coefficient with its own Apex Quality packet; higher rarity may not merely add damage while leaving this defining payoff flat. Its displayed skill coefficient is additive over the global `5% per Chain` combat rule.
- For one fixed parent history and Apex rarity, sibling Apexes must remain in an approximately equal combined-power band; the tactical allocation, not raw superiority, is the choice.
- `F1S2T2` remains one `SINGLE` heavy arrow in all four Apexes. Every child retains Weight-based Chain scaling, converts before damage, generates one natural Chain on impact, and applies its normal Mark gain only after conversion.
- Its four Apex refinements are: convert all starting Mark for maximum burst, preserve half conversion but grow uncapped Weight faster, preserve half conversion and emphasize direct impact, or preserve half conversion and rebuild more post-hit Mark. Only the full-conversion child may change the inherited 50% conversion fraction.
- T2 sibling balance is evaluated across clean, Mark-ready, Chain-ready, and combined scenarios. A full-conversion jackpot may lead while primed, but the four-option combined-power spread may not exceed 25% for a fixed history and rarity.
- `F1S2T3` keeps one physical arrow, `IMPACT_ECHO`, preserved Mark, and an uncapped linear Mark read in all four Apexes.
- Its four Apex refinements are: grow uncapped echo count faster; grow temporary Chain granted per Mark; multiply only real stored Chain while leaving temporary Chain unchanged; or make every impact/echo generate one real Chain which later echoes use immediately.
- The fourth refinement pays for its additional stored Chain from its current-layer allocation. Chain output itself has no authored cap. For Common Form + Common Specialization history, all four Apex rarity ladders must remain within a `21%` six-phase contribution band.
- `F1S2T4` keeps a true `SIMULTANEOUS_PACKET`, never reads or consumes existing Mark, and remains a setup move in all four Apexes.
- Its four Apex refinements are: grow uncapped pellet count faster; preserve normal pellet count but grow extra Mark from the Apex Quality packet; make every simultaneous pellet add one real Chain after damage without strengthening its siblings; or split the unchanged pellet budget into two balanced waves.
- The two-wave child always has exactly two timing groups. Each wave creates one Chain, and the second wave reads the first wave's Chain. Pellets inside one wave stay simultaneous and cannot strengthen each other. Quality grows total pellets, never wave count.
- T4 role checks are hard contracts: A1 is contact leader, A2 Mark leader, A3 Chain leader, and only A4 has two waves. Every synthesized pellet must keep at least `6` clean damage in the current prototype readability scale.
- Across completed T1/T2/T3/T4 Apex families, the same standard-history six-phase family means must remain within `21%`; this catches a whole Twist family becoming the automatic Apex choice while allowing the conversion family to pay its real Mark opportunity cost instead of receiving fake compiler damage.
- Twist balance is also evaluated as a six-phase playthrough starting from zero Mark and using
  the defense-Chain pattern `0, 2, 4, 1, 6, 3`. Mark persists; attack-phase Chain does not leak
  into the next phase. Damage and net resource option value are summed across the run. Across
  Common Form + Common Specialization histories must remain within `25%` of the row mean
  across all Twist rarities. Extremely rare stacked-rarity histories are reported separately
  and may break the target band; they are never flattened with caps or diminishing returns.
  While a Twist/Apex family or the complementary Mark-consumer skill is still unauthored,
  jackpot violations are reported rather than blocking the game boot.
  Raw damage may differ more because setup output is intentionally reserved for the other
  three skills, especially the future Mark consumer.

## Mandatory automated gate

Run the single post-implementation template before publishing:

`node tools/validate-skill-implementation.cjs KnightRush.html`

It runs both lower-level commands and reports separate Structure, Design, Bug, Rarity and Power gates:

`node tools/validate-html.cjs KnightRush.html`

`node tools/validate-runtime.cjs KnightRush.html`

The authoring order and manual/runtime acceptance questions are fixed in
`MOVE_FAMILY_ACCEPTANCE_TEMPLATE_TR.md`. Every new family must use that sequence; a passing total
score alone cannot replace parent identity, sibling-role, event-order, uncapped-scale or UI checks.
The shared runtime helper `auditStableApexFamily` is the required matrix runner for new four-Apex
families, so all `4^4` rarity histories are exercised before family-specific assertions are applied.

The runtime gate must cover all materialized Sharpshoot routes, not a hand-picked sample. The current slice requires:

- exactly `12` Twist contracts and `43` Apex contracts;
- `11,872` immediate parent-to-child comparisons across every prior-rarity history and offered rank;
- `2,969` independent rank ladders and `8,907` adjacent rank comparisons;
- `25,992` stronger-parent comparisons, changing every earlier rarity one adjacent step while fixing the exact child route and rank;
- zero inherited damage, Mark, owned Weight, real Chain payoff, or full-playthrough regression;
- zero parent-strength reversal, at least `10%` score/play gap retention, and at least `1` visible child gap whenever the parent gap is meaningful;
- zero stagnant rank step;
- inheritance repair must remain at or below `1.1` damage with a `0` 95th percentile; rank-floor damage repair must remain at or below `2` with a `0` 95th percentile. A larger repair means the recipe/compiler is erasing power and the guard is hiding it;
- Common-parent Mark/Chain Twist rotations must stay within `20%`; while the Mark-consuming
  skill is not materialized, equivalent Mark/Mark versus Mark/Chain histories use shared
  visible `0/5/10/15/20` Mark states and must remain inside `0.87-1.20` scenario value and
  `0.895-1.31` provisional rotation value ratios;
- all existing per-family identity, scenario, sibling, animation-delivery, and Mark runtime audits.

### F1S3 Mark/Posture contract

- MARK remains Primary; POSTURE is a light-ranged Secondary. Secondary role `0.80` and Light Ranged
  handling `0.40` create a linear `0.32` expression ratio. This is not an output cap.
- The same expression applies to every later Posture-owned Twist receipt. Unexpressed Posture wallet
  redirects to Primary Mark, so the bow cannot silently become a heavy Posture chassis.
- T1 is reliable flat Posture. T2 preserves and reads every action-start Mark as uncapped Posture.
  T3 installs a source-agnostic bonus consumed by the next positive Posture source. T4 snapshots the
  action-start bar and gains a bonus at `50%` or above.
- All four Twists preserve inherited damage, inherited Mark, one direct contact, and one natural Chain.
  They may neither consume Mark nor introduce Chain scaling.
- All four therefore keep `SINGLE` contact topology but use distinct Bow choreography: T1 compresses
  a heavy Posture impact at the bow, T2 converges visible Mark aim around the target, T3 inscribes a
  Posture-primer sigil, and T4 changes from a restrained finisher cue to a gold break-ready cue when
  its action-start threshold is met. These are reusable recipe/cue ids, not four bespoke update loops.
- T1 has four Stable Apex refinements. A1 maximizes raw flat Posture, A2 maximizes immediate Mark,
  and A3 maximizes clean Health damage. A4 keeps one damaging arrow and one natural Chain but splits
  its total Posture `60/40` between impact and one delayed fracture event. The fracture produces no
  damage, Mark or Chain. `POSTURE_APPLICATION_EVENTS` pays for the extra trigger opportunity from the
  same light-ranged `0.32` expression wallet, so it is neither a free delivery reward nor a second
  Posture withdrawal.
- A1 must remain the raw-Posture leader, A2 the Mark leader and A3 the direct-damage leader for every
  one of the `256` prior-rarity + offered-rank histories. A4 must always retain exactly two normalized
  Posture shares and a paid event receipt. The four siblings must stay within a `15%` combined-power band.
- T2 also has four Stable Apex refinements. A1 maximizes the uncapped linear Posture coefficient per
  preserved starting Mark. A2 keeps the inherited read and allocates the largest share to post-impact
  Mark generation. A3 keeps the read and maximizes clean Health damage. A4 preserves the inherited
  linear read, then adds `rate × Mark × (Mark - 1) / 2` Posture from a separately paid
  `MARK_POSTURE_ESCALATION` axis.
- T2 never consumes Mark and never changes its one-arrow Delivery. Escalation is calibrated against a
  `16`-Mark balance reference but has no gameplay cap, soft cap or diminishing return. This reference
  prices the Quality packet; it does not clip runtime output. At equal histories A1 must lead linear
  read, A2 Mark allocation/output, A3 direct damage and A4 high-reserve Posture.
- All `1,024` T2 Apex cards are checked at `0/4/8/16/32` starting Mark plus the standard six-phase
  persistent-Mark simulation. Reference-state sibling spread may not exceed `20%`, six-phase spread
  may not exceed `35%`, and a million-Mark input must remain finite and strictly exceed a thousand-Mark
  input. These are observation points, never authored limits.
- T3 has four Stable Apex refinements. A1 maximizes the flat Primer consumed by the next positive
  Posture source, A2 buys a paid `+1` visible Mark distinction and maximizes immediate Mark, and A3
  maximizes clean Health damage. A4 preserves
  a flat Primer and adds an uncapped percentage of the triggering source's own base Posture.
- Primer amplification never multiplies the flat Primer or its own result. Its Quality price uses a
  `20`-Posture reference source, but runtime reads the complete positive source without a cap, soft cap
  or diminishing return. Multiple installed Primer rates add; the first positive source consumes the
  complete flat and proportional state. Break clears both values.
- All `1,024` T3 Apex cards are checked in `256` same-history groups. A1 must lead flat Primer, A2
  Mark allocation/output, A3 direct damage, and A4 the `100`-Posture source bonus. The validator also
  proves exact `20 + 5 + 25% = 30` runtime ordering and finite monotonic output through the safe-integer
  source probe.
- T4 has four Stable Apex refinements. A1 maximizes the fixed half-bar Finisher bonus, A2 buys a
  paid `+1` visible Mark distinction, and A3 maximizes clean Health damage. A4 preserves the exact
  `%50` condition and adds `rate × max(0, action-start Posture - half-bar threshold)` Posture.
- Crescendo snapshots before the attack. This action's own Posture cannot grow its result, it never
  consumes existing Posture, and it does not lower or remove the half-bar condition. Its Quality
  price uses a `%75`-full reference state; runtime reads the real boss bar without an authored cap.
- All `1,024` T4 Apex cards are checked in `256` same-history groups at `0/49/50/60/75/90/99`
  Posture. A1 must lead exactly when the condition opens, A2 Mark, A3 direct damage, and A4 at high
  bar. A `200`-Posture bar must produce exactly twice the Crescendo delta of a `100`-Posture bar at
  equal fill percentages, and safe-integer-sized bars must remain finite.

Adding a new materialized route must update the expected coverage count deliberately. A test count changing silently is a structure failure, even if the page still boots.

The GitHub Pages workflow runs both HTML parsing and the complete runtime balance validator. A failed hierarchy, rank, sibling, rotation, repair, or parent-strength contract blocks deployment rather than publishing a silently broken build.

Current authored jackpot examples are executable test fixtures:

- `Blooded Refrain (Rare) -> Legendary Apex`: cost 5, Rarity Resonance II refunds 3.
- `Royal Convergence (Legendary) -> Legendary Apex`: cost 6, Crown Resonance refunds all 6.

## Mandatory negative checks

The boot-time validator must reject at least these cases:

1. Form selects a Secondary early.
2. Specialization selects a Secondary outside the Form affinity palette.
3. Twist introduces a third mechanic.
4. Twist changes the inherited Secondary.
5. Apex changes the inherited relationship.
6. A child resets to Form instead of evolving its immediate parent.
7. A child regresses a protected Primary or Secondary quantity without a valid, explicitly authored Twist `tradeContract` (the current executable slice has no such exception).
8. A Stable child is not a net upgrade over its immediate parent.
9. An Apex violates its Twist's named Resolve cost curve.
10. A Stable unlimited Mark damage consumer uses full value without an explicit paid exception, or a linear non-consuming reader bypasses scenario and multi-turn pricing.
11. A per-hit rule attempts to consume all Mark on every hit.
12. A Mark converter lacks a positive conversion output.
13. Mark output is negative, fractional, or outside safe integer arithmetic. High positive output is valid and must not be rejected merely for being high.
14. A Mark-interacting Form relies on a mutually exclusive sibling to prime its resource.
15. A rarity upgrade reduces an owned identity output or its real combat payoff. A displayed coefficient may move only when the stronger card's resulting payoff still grows; raw generic damage is not a substitute for lost identity.
16. A resource converter's guardrail counts gained resources but omits the opportunity cost of resources it consumes.

Rarity Resonance tests must prove that lower rarities do not erase high-rarity totals, one Legendary alone does not activate, two/three/four total Rare reach +1/half/full, Rare + Legendary reaches half, two Legendary reaches full, and refund never exceeds the action's actual spend.

It must also positively accept compatible neighbouring overlap such as `Chain -> Mark` and `Mark -> Chain`.

## Short future prompt

> Create a Stable evolution tree for `[skill]` using `STABLE_SKILL_TREE_RULES.md`. Treat the skill as one living move whose selected node replaces its parent; never assume mutually exclusive siblings coexist. Define Form Primary/chassis/affinities, make every Form self-sufficient from clean combat state, select one Secondary per Specialization, Twist only the inherited Primary-Secondary relationship, and let Apex maximize that exact relationship. Generate every child from its immediate parent, use declarative Mark rules when applicable, add executable contracts, and make all boot-time audits pass.
