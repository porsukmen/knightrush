# Journey safe towns — first story hub

Journey's policy now routes actual boss completion to `town`; classic PLAY still
opens its existing forge directly. The Skill Lab victory path is unchanged.
Boss healing and summon cleanup remain in their existing flow. No town fee,
automatic restock on re-entry, free inventory or silent next-stage transition.

## Play / preview

Open `TownTest.html`, or Debug → TOWN LAB. The lab starts a fresh seeded Journey
with 150 test gold. NEXT TOWN previews the next stage's theme; CONTINUE JOURNEY starts the
next forest run with the current build. BACK TO DEBUG clears the test run.

The new market square is authored in Canvas, not an imported reference image or a
set of isolated building cards. `townProject` supplies one shared perspective
for the lord's hill castle, adjoining houses, deep front/side facades, gables,
timber braces, attic windows, chimneys, shop canopy and two market stalls.
`TOWN_MARKET_PLAN` defines ten disjoint building footprints, not random spawns.
Smoke, square-jointed residents, guards, stallholders,
pennants and hanging signs have local animation. Building selection makes a
short camera approach before entering. No Journey world simulation runs here.

Detailed static architecture is cached once at native display resolution, with
18% approach-zoom headroom. The cache is replaced on palette, resolution or
letterbox changes; it is not a low-resolution/pixelated scene sprite. Animated
elements are drawn on top. Only BLACKSMITH and GENERAL STORE are building targets.

- Blacksmith: existing live character, animation and upgrade screen; exit returns
  to the square. The actual forge object/RNG stream, attempt count and build are
  retained across entries during the same town visit.
- General Store: dedicated fixed-building interior and apron-wearing shopkeeper,
  sharing the tested merchant economy. Stock key is `town:<stage>:store` so it
  cannot collide with roadside trader visits. Sold stock and reroll prices persist.
- Other buildings, stalls and the distant lord's castle are noninteractive scenery.
- CONTINUE JOURNEY: separate control and explicit confirmation; only then does `nextLoop()` advance the
  stage once, preserve the run's equipment/economy/quests, and generate the route.

The approved wealthy travelling trader/wagon remains available in Merchant Lab. This town
implementation does NOT yet add its random roadside spawn.

## Current market-square experiment

The user requested a from-scratch town after the earlier color-only pass. The old
street renderer and screenshot are preserved in `art-source/town-before-market-square/`;
its obsolete facade/house/resident renderers are no longer loaded by the game.
The current design uses the approved wandering merchant/Keskin Düzlem shape and
material language, not the minigame placeholders. Castle, market stalls, houses
and residents are authored anew; navigation and shop economy are preserved.

The distant lord's keep has a gate, crenellated walls, watchtowers, heraldic banners
and an animated pennant. Side buildings have actual connected walls/roof planes;
the front doors are not duplicated on the side walls. Residents move within the
central pedestrian area, while vendors are clipped behind their stall counters.
Shop signs contain no written building names: thick wooden boards, iron straps,
chain links and wall brackets support an anvil/hammer or purse/bottle emblem.

The resident store now has a live square-jointed keeper in a burgundy cap, teal
doublet and ochre apron. Recessed cabinets hold actual detailed game items, folded
cloth and parcels. The native-resolution static interior cache is independent
of the live keeper/handoff. Display and purchased items use the same approved
detailed renderer as the travelling merchant; UI geometry and economy are retained.
Shelf placement uses each item's actual bottom vertex, including the sealed
parcel's rotation, instead of sharing an arbitrary centre height. All eight props
sit directly on their support surfaces.
The former town/store drawing block and screenshots are saved under
`art-source/town-before-sharp-plane/`, with art-only rollback notes. The approved
travelling merchant is also saved as a style anchor in the art guide and is unchanged.
No prices, stock, forge RNG, animation timings or transaction rules changed.

## Chapter boundary

`TOWN_CHAPTERS` owns names, arrival text and visual palettes; `TOWN_PLACES` owns
the clickable locations, separate from `townVisit` transaction/flow state. Three
initial atmospheric palette studies exist: Bramblewick, Stoneford, Emberwatch.
They reuse the street architecture and cycle after stage 3;
these are not three complete story chapters or uniquely authored cities yet.
Later chapters can replace the layout/art without changing shop state contracts.

## Tests

```
node tools/town-audit.cjs
node tools/town-browser-audit.cjs
node tools/town-style-audit.cjs
node tools/town-market-art-audit.cjs
node tools/journey-forest-loop-audit.cjs
node tools/journey-forest-loop-browser-audit.cjs
node tools/debug-journey-audit.cjs
node tools/blacksmith-audit.cjs
node tools/blacksmith-browser-audit.cjs
```

Native audit covers real boss arrival, no distance advance, paused entrance,
forge/build/RNG retention, sold stock/reroll retention, exactly two entrances,
departure cancel/confirm, cache reuse/resolution invalidation, single stage
advance, theme selection, reset and classic/lab isolation. Edge
touch audit covers mobile/desktop, building hit areas, approach, interiors/back,
retained purchases, noninteractive scenery, pause, theme previews and departure. Screenshots:
`output/town/`. On-device mobile performance has not been measured.
