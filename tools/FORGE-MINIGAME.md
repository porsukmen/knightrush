# The Little Hammer — Blacksmith minigame

This heat/strike/quench experiment is now preserved at `ForgeClassicTest.html`
or `KnightRush.html?forgeclassic=1`. It is no longer the active forge experiment.
`ForgeTest.html` / `forgelab=1` and the minigame catalogue now open Crooked Steel;
see `CROOKED-STEEL.md`. `smithlab=1` still opens the separate skill-upgrade shop.
Neither minigame spends gold or changes run skills.

## First-play loop

- Hold the physical bellows / Space to heat the steel into the gold working band.
- Release: the smith brings the billet back from the hearth to the anvil.
- Tap the glowing mark / Enter. Nine hits shape the billet into a blade.
- Reheat between strikes as required; the mark is hidden during transfer/swing.
- Tap the water / Enter in the blue temperature band to quench. Timing and clean
  strikes determine the 0–100 score. Overheating too long burns the billet.
- Replay keeps the session best; Back returns to the minigame menu.

## Art and animation

KR-KD / Keskin Düzlem: native-resolution crisp polygon planes, intentional hard
light/shadow, the existing approved armored blacksmith, tiny hammer and shop
backdrop. No old minigame NPC/crowd art is used. The static room is cached at
display resolution. Fire, bellows, arms, workpiece and steam remain live.

`drawSmithKnight` accepts an optional pose/clock override; existing shop callers
keep their defaults. The minigame arm rig targets real billet/tong coordinates,
and the real tiny hammer head meets the tapped point. Input heat/aim is sampled
on touch-down; damage is settled exactly once at the contact part of the swing.
Drawing does not mutate minigame state. Pausing freezes heat and animation and
cancels an active bellows hold through the shared gesture controller.

Prior minigame source: `art-source/forge-before-sharp-plane/minigame.js` (backup,
not loaded by the game). Other placeholder minigames remain unchanged.

## Verification

With the installed Node dependencies available via `NODE_PATH`:

```
node tools/forge-revamp-audit.cjs
node tools/forge-revamp-browser-audit.cjs
node tools/minigame-port-audit.cjs
node tools/blacksmith-art-audit.cjs
node tools/blacksmith-acting-audit.cjs
node tools/blacksmith-audit.cjs
```

The browser test uses actual touch and keyboard input, completing a full
reheat/shape/quench attempt on a phone-sized viewport. The native test checks
all six contact points, continuous arms, every heat/quench outcome, pause,
one-shot impact handling, replay, draw purity and cache reuse.
