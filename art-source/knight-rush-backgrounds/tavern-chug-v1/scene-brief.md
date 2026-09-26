# Last Mug Standing — candidate v1

## Intent and references

A new mug-angle race against Sir Chugs-a-Lot. A small oak-and-plaster alcove,
frontal seated POV, golden lantern at left and cool window at right. The native
table far edge is y402 in the 480x800 logical game view. Native live actor
occupies x142–339, head around y205–285; UI remains on a separate stable plane.

Approved live Art Lab models were inspected: Barrel Barry (squared civilian
massing/connected arms), Wandering Merchant (face/workwear/material planes),
Borin (hand/prop articulation). None of the old chug art is a style reference.
Mossy Oak Inn v4 plate and its current Background Lab composite were inspected
for environment clarity and material lighting, not as character geometry.
This actor and room are candidates, not automatically approved references.

## Image generation

Built-in image generation, input:
art-source/knight-rush-backgrounds/approved/mossy-inn-v4.png
Role: environment quality only. Original saved as generated.png in this folder.

Prompt:

Create a new portrait 3:4 empty environment plate for Knight Rush tavern drinking duel. The attached approved Mossy Inn image is ONLY an environment quality reference for crisp broad angular painted planes, simple medieval timber, warm fire left and cool daylight right; do NOT copy its front desk layout. New location: a cozy small alehouse seating alcove, straight-on eye-level camera sitting across a table, quiet plain ochre plaster wall in center, heavy oak beams, a single small barrel rack at far left, one wall lantern upper left, narrow blue diamond-pane window on right, low wooden wainscot, a few clear large props only. Leave center from 25%-65% image height EMPTY for a separately drawn broad seated tavern regular. No actors, no people, no mugs in center, no foreground table: native game will draw the wooden table across bottom half (its far edge at 52% image height). Empty floor lower half acceptable, no perspective diagonal tilt. Crisp deliberately simplified polygonal edges and three-value materials, no grainy texture, no photorealism, no blur, no depth of field, no microdetail, no outlines, no text, no UI. Warm golden key left, cool restrained fill right, vibrant but grounded palette. Match the reference's sharp near/midground edges at same resolution, quiet surfaces behind actor.

## Composition and articulation

Actor is separate native geometry with neutral and scene-local palettes for
skin, shirt, vest, ginger hair and metal. Warm planes face the left lantern;
cooler sleeve shadows face right. Cheek flush is a local skin-plane overlay.
Torso precedes complete shoulders/upper arms, forearms, mug and fingers.
The right drinking arm uses fixed 68/94 anatomical bone lengths and a low elbow.
The elbow stays beside the torso; a depth-aware projection shortens the upper
arm on screen as it reaches toward the camera. A flat constant-screen-length
solver was rejected because it forced the elbow inward across the ribs. Following
user feedback, the mug rests directly in front of his torso (x241), rises to
the mouth (far lip y273), then pitches away from the viewer rather than rolling
sideways toward his cheek. A fixed faceted mug now rotates rigidly about its rear
lip: the opening is occluded and the underside becomes visible as it tips up.
Wood, hoops and rear-side handle use one camera projection, not vertical scaling.
Body faces are split at hoop boundaries to avoid painter-order surface overlap.
The mug lift interpolates continuously and the wrist follows the handle's exact
projection. Curled fingers and the thumb wrap the handle. Both bones remain
fixed throughout lift and tilt; the full arm stays in front of the torso.
Player hand uses Jonathan's native steel arm construction and an articulated
gauntlet around the mug handle.

Player mug trial: the same fixed faceted oak/steel geometry is now seen from
the opposite side, tipping toward the POV so the cavity becomes visible.
Beer depth follows consumed volume, clipped inside the mouth opening. The
steel gauntlet and grip are projected with the handle, while Jonathan's arm
keeps fixed 105/120 screen-space lengths. Both props reuse one static mesh;
per-vertex projection arrays/trigonometry were replaced with a single canvas
transform per prop. No extra bitmap, engine or gameplay change. Evidence:
output/tavern-chug/{desktop,phone}-player-mug-{0,0.5,1}.png.

## Gameplay / drunkenness

Single real race, not old tracing patterns. Drag up/down adjusts tilt; release
lowers the mug. Keyboard arrows adjust, Space rests. Required angle increases
with swallowed volume. Excess angle builds foam and a timed spill; spills never
count as drinking. AI uses the same mug rules, bounded errors and recovery rests.
Smooth low-frequency hand drift increases with consumed volume. World-only
roll reaches at most 1.72 degrees, with 5px/3px displacement; fixed UI, no blur,
input latency, random camera jumps, doubled textures or per-frame image filters.
One fixed-step simulation at 120Hz inside the existing game loop.

## Packaging / clarity / tests

Standard 1086x1448 RGBA estimate 6,290,112 bytes; constrained 576x768 estimate
1,769,472 bytes. Selected tier only; existing manager releases on exit and
preserves inn ownership/return. These are decoded estimates, not process RAM.
The generated near/midground broad edges were inspected alongside native models
at actual desktop and phone sizes. No sharpening shader or extra raster cache.

Evidence: output/tavern-chug/{desktop,phone}-intro.png, -drunk-0.45.png,
-drunk-0.92.png, -spill.png, -actor-neutral.png, -actor-lit.png, -win.png.
Audit: tools/tavern-chug-audit.cjs covers 100 seeds per policy, frame-rate
consistency, actual mouse/touch/keyboard and cancellation, fixed bones, draw
purity, native fallback and selected image/release bounds. Perfect tracking wins
in about 14.2s, rival beats idle/full/static controls around 18.4s. These policy
checks do not prove human difficulty or actual phone FPS.
