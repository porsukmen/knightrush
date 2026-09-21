# Crooked Steel — a different blacksmith game

Entry: `ForgeTest.html` / `KnightRush.html?forgelab=1`, or the forge card in
Minigames. The old heat-control game is kept intact at `ForgeClassicTest.html`
(`forgeclassic=1`); the actual skill-upgrade blacksmith shop is unchanged.

## A toy about repairing a visibly bent sword

The knight brings one of three comically bent swords. Its actual shape is the
game state and the result: no hidden rhythm window, chase-the-dot targets,
temperature bar, heat/reheat trips, forced hit count, timer or random failure.

- Hold a bend on the blade to raise the tiny hammer. Longer hold = stronger blow.
- Release to hammer downward. A raised bend becomes straighter; excess force
  bends it the opposite way. Adjacent sections receive a small linked effect.
- Turn Over rolls the whole sword to work on bends facing the other way.
- Compare it against the chalk straightedge on the anvil. Hand It Back whenever
  satisfied; the smith lifts the actual result and comments on its quality.
- Next Repair starts a different bend pattern, retaining session-best quality.

Keyboard: Left/Right selects a section, hold/release Space hammers, F turns,
Enter hands it back (or starts the next repair). Escape pauses. Holds cancel on
pause, focus loss and pointer cancellation; they must never turn into free hits.

## Implementation notes

Separate `swordmending` mode and `mendGame` state. The stable catalogue ID remains
`master_cinders_forge`; its start adapter now launches this experiment. Run
resources, skills, Journey and shop upgrades are not mutated.

Nine blade nodes, seven editable. Each signed bend displaces the actual blade
geometry. Only the current upper-facing side can be hammered downward; rolling
the blade reverses which physical side is up. Force is captured on release,
settled once at hammer contact, then visually eased with a small damped rebound.
Quality comes solely from remaining absolute bends, not a random roll.

The approved Keskin Düzlem blacksmith and workshop materials are reused as art,
not as old minigame mechanics. Arms, tongs, hammer and the inspected blade share
their real attachment points. Room art is cached at display resolution; draw
functions do not advance state or RNG.

## Tests

```
node tools/crooked-steel-audit.cjs
node tools/crooked-steel-browser-audit.cjs
node tools/forge-revamp-audit.cjs
node tools/forge-revamp-browser-audit.cjs
node tools/minigame-port-audit.cjs
node tools/blacksmith-art-audit.cjs
```
