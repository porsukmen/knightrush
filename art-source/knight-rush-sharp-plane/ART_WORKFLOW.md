# Art production and acceptance

## Reference ownership

The user-approved original knight, bear and minibosses establish blocky massing,
crisp silhouettes and volume. Merchant and revamped Disco King establish the NPC
detail/expression ceiling. The original forest is the environment anchor.
The Mushroom Gatherer was **user-approved on 2026-09-24** after removing the
mushroom from his asking hand. Use `approved-mushroom-gatherer.png` for the
character's squared civilian proportions, face and workwear. The approval does
not promote the existing conversation background to an environment reference.
The old smith screenshot has red upper arms: the current steel arms override it.

`art-references.js` is the explicit reference registry; it is not populated from
the newest images in output/. `reference-baseline.json` records renderer source
fingerprints at setup, not a claim that every current scene has been approved.
If a reference changes intentionally, review its affected views before manually
updating that baseline. Never automatically overwrite it after a mismatch.

## What the middle ground means

- At road size: broad squared head, torso and limb masses read as clearly as the
  knight/wolf. Avoid thin broken silhouettes or large flat diagonal paper shapes.
- At conversation size: merchant-like side faces, material boundaries, hands,
  brows, fasteners and purposeful folds add depth. More polygons is not a goal.
- Use the character's silhouette for personality; material planes for volume;
  small marks for occupation/expression. Do not use detail to hide weak anatomy.
- Preserve sharp stepped/rectangular rhythms without imposing a low-res filter.
- Keep the same body and attachment chain across animations. A held basket or
  hammer follows its hand; moving arms use coherent shoulders and elbows.

## Reusable implementation sources

| Need | Existing source in KnightRush.html |
| --- | --- |
| Blocky body / articulated limbs | drawSerJonathanRider, drawWolf, drawMireToad |
| Broad animal volume | drawBearNatural |
| NPC face, cloth, gold, hands | drawWanderingMerchant |
| Forest civilian, squared proportions / workwear | drawMushroomGatherer |
| Expressive continuous pose | discoBodyPose, drawDiscoKing |
| Steel, hammer grip, work animation | smithKnightPose, drawSmithKnight |
| Geometry / joints (U-scaled units) | rigPolygon, rigSegment, rigJoint, px |
| Geometry (canvas units) | expPoly, expSegment, expRect |
| Items / materials | drawMerchantDisplayItem |
| Forest | drawTreeArt |

Use these actual functions through the lab adapters. Do not redraw "references"
inside the lab: that would silently replace the standard with another experiment.

## Three review gates

1. **Silhouette:** compare candidate with knight/wolf and merchant; inspect the
   small-scale strip and silhouette mode. Can occupation, weight and limbs read?
2. **Volume/material:** inspect full color and grayscale. Do side planes describe
   thickness? Are face, cloth, leather and metal distinct? Are props supported?
3. **Motion/integration:** scrub idle and action sequences, inspect contact sheets,
   then test the actual dialogue and roadside scene on mobile and desktop.

Each gate produces evidence before the next pass, not only a final screenshot.
The agent must describe remaining weaknesses rather than certify itself with
"looks good". User approval alone promotes a candidate to a style reference.

## Automated checks and their limits

In Art Lab only, every rendered frame checks finite drawing parameters, balanced
save/restore, and restored drawing state. Once each animation second it checks
visible pixels, clipping at canvas edges and selected gameplay-state purity.
Failures stay visible until reset; sampling does not silently erase earlier bugs.
The audit also compares repeat renders at identical times, captures 0–5 seconds,
checks 30 fps motion samples for large discontinuities, and checks source hashes
of approved renderers and shared primitives. Motion outliers request inspection:
a legitimate strike can be fast. There is no automatic beauty or style score.

The report always keeps `visualApproval: "pending-user-review"`. Browser speed
in this debug lab is not a phone performance benchmark. No lab polling, pixel
readback, screenshot capture or art checks are added to normal gameplay.

## Commands

Open `ArtTest.html` or `KnightRush.html?artlab=1`. The lab supports pause, scrub,
idle/action, color/grayscale/silhouette, and neutral/forest backgrounds.
`node tools/art-lab-audit.cjs` runs repeatable technical checks and creates evidence.
Existing `tools/journey-roadside-art-audit.cjs` remains a render smoke test, not
an art acceptance test. Mechanic tests still apply after art changes.

Environment pilot: `BackgroundTest.html` / `KnightRush.html?backgroundlab=1`.
Read `art-source/knight-rush-backgrounds/README.md` for its separate review gates.
The 2D gatherer's clearing v1 was rejected; it is not a style reference. The
default lab now reviews illustration v3 using the accepted Blender v2 layout
with a closer, separately drawn NPC. Style inputs contain isolated character
models ONLY, never their old backgrounds or UI. The crisp clearing and its
scene-lit character composite were explicitly approved on 2026-09-24. New
environment tasks use `tools/skills/knight-rush-cutscene/SKILL.md` and the separate
`art-source/knight-rush-backgrounds/cutscene-references.js` registry. This does not
promote rejected backdrops or prescribe forests for every scene. Run
`node tools/background-illustration-audit.cjs` for current resolution, integration
and live-game-preview checks, `node tools/background-blockout-audit.cjs` for
the archived geometry, or `node tools/background-lab-audit.cjs` for rejected v1.

## Completed first trial

The Mushroom Gatherer pilot is now an approved reference, with an empty asking
hand and mushrooms held in the basket. Its renderer and reference image are
protected by the baseline. Preserve this accepted version; new NPCs and future
redesigns remain candidates until the user approves them separately. Continue
using all three review gates rather than treating technical checks as approval.
