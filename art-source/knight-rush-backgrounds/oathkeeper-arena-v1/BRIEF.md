# Forgotten Oath — open shrine arena candidate

User request: rebuild the background in the cutscene / sword-pulling scene's
visual language and move the large golem farther back to leave attack space.
This is a combat background, not a new cutscene or a change to encounter rules.

## Inputs and visual contract

- Built-in ImageGen, extensively redesigned sibling of the sword clearing.
- Input 1: approved Gatherer clearing, environment clarity / material-plane
  quality only. Its cottage, layout and characters are not design inputs.
- Input 2: sword-clearing-v4 candidate, edit target and user-requested forest sanctuary setting,
  ancient trees, honey limestone arch and warm-key / cool-teal depth.
- Inspected the approved crisp clearing in live Background Lab both without the
  actor and with the live, scene-lit Gatherer. Feet, basket and contact shadow
  sit on the same amber ground; cool sleeves retain material identity. Broad
  crisp ground/rock edges, rather than texture density, supply useful clarity.
- Character construction continues to use the existing native golem and mounted
  Jonathan. No actor, weapon or attack is baked into the new environment.

## Camera, layout and lighting

Portrait3:4 plate, cover-cropped into the native480×800 combat view. Frontal
ground-level perspective. The generated distant floor reads around logical314;
the current boss projector uses that same horizon, not the earlier290 target.
Open shallow honey-stone/earth arena, extending
from distant golem resting ground around y=510 through player ground around
y=634. The central 80% width below y=300 stays clear enough for three lanes,
approaches, hands, stone projectiles and whip arcs. No central dais, boulder,
sword, pillars or foliage in the playable corridor. Ancient trees and ruined
limestone arch at the far perimeter frame the space; no near raised step blocks
the player plane. Upper y=0..200 is quiet canopy / sky behind native HUD.

Latest staging correction: rendered rest depth75, first-strike body depth35,
long lens160 and actor world unit100. The large body reaches forward with a
leaned shoulder/arm instead of standing beside the rider. Ground rise320 keeps
native player floor634 fixed and gives a314 depth horizon. Return motion rises
along this floor and scales modestly. Depth reach scale12.6 remains separate
from the screen-unit scale so the live fixed-length arm can reach the native
contact plane. This is a Sharp-Plane2.5D presentation, not a photoreal camera.

Warm sunlight from upper left, cool teal forest ambient and reflected green
fill. Saturated sage stone, steel and horse materials keep their identities.
Actual scene-local native material adapter is required, with neutral/lit same-
pose comparison. Ground contact/cast shadows follow this same key direction.
No global filter or recolour of approved actors.

## Final generation prompt

Use case: stylized-concept.
Asset type: illustrated static environment plate for a portrait 3:4 Knight Rush
boss combat arena, native animated actors and UI will be drawn separately.
Create a NEW open forest-shrine arena by extensively redesigning image 2.
Image 1 is the APPROVED environment-quality
reference: match its crisp purposeful planar material edges, vibrant greens,
clear warm/cool lighting and restrained detail, but do not copy its cottage or
layout. Image 2 is the EDIT TARGET and user-requested SETTING reference: ancient forest cathedral,
ruined honey-limestone arch, massive trees, cool teal depth, warm upper-left sun.
Adapt that setting for spacious combat, not a pedestal scene. Frontal perspective
with a horizon at about 45% image height; a wide deep flat clearing stretches from
the far shrine perimeter to the bottom edge. Put the ruined stone arch and two
short broken walls far in the background, massive trees framing the outer edges.
The middle 80% width from 45% image height to the bottom is an EMPTY unobstructed
continuous ground plane of warm honey stone slabs and ochre earth, broad quiet
planar surfaces with sparse structural seams following sensible perspective.
No raised central landing, dais, steps, pedestal, central rock, path blockers or
foreground vegetation in that reserved combat corridor. The ground must support
a giant live golem at 80% image height and a mounted knight at 98%, with open
approach distance between them. Upper 30% is quiet dark-green canopy and a small
soft-blue sky opening, suitable behind game HUD; leave room over the golem for
overhead whip swings. Large ancient trees, restrained ivy tracing stone joints,
some ferns and tiny white flowers ONLY at outer edges. Warm sunlight from high
upper left, cool teal-green ambient shadow, vibrant saturated material colours,
clean broad light and shadow faces. Epic through tree scale, deep space and strong
architectural framing, not decorative clutter. Crisp 2.5D painted game art,
purposeful angular contours, moderate detail, near/midground as clear as the
approved first reference; slightly softer distant forest. No painterly smudges,
grain, pixelation, photorealism, random mosaic facets, sharpen halos or blurred
light beams. Environment only: NO character, creature, horse, golem, knight,
weapon, sword, loose projectile, statue, chest, UI, text, logo or watermark.

## Packaging and review plan

Keep generated-source.png plus standard 1086x1448 and mobile 576x768 PNGs.
Decoded RGBA estimates: 6,290,112 and 1,769,472 bytes, not total process RAM.
Use one selected tier through the existing shared event visual manager; activate
on encounter entry, release on exit/reset/death/other encounter. No screen-sized
copy, per-frame filter or readback. Check source and packaged mobile beside native
actors at actual desktop/phone game sizes, including distant rest, planted fist,
projectile release and overhead whip. If source edges are soft, use a same-budget
ImageGen clarity edit preserving layout; do not add a shader or larger texture.
Candidate only: user approval alone promotes this plate or its composite.

## Integrated candidate verification — 2026-10-03

Generated source, standard and mobile assets were visually inspected beside
native actors at actual480 desktop and390 phone game views. Broad near-ground
slab edges, angular vegetation borders and limestone joints stay crisp; softer
distant teal forest supplies depth without a sharpen filter. The central floor
is open, allowing the large distant golem's forward arm and separate live props
to overlap naturally. No character, sword, attack, UI or target indicator is
baked into the environment plate.

Fresh scene checks compare neutral and warm-key/cool-ambient palettes; actual
stone, silver armour and horse surfaces keep their identities. Shared visual
manager activation/release and decoded bounds pass the arena/cutscene audits;
the complete current moveset audit includes156 desktop/phone HUD captures with
zero failures/warnings. That scene-integration review used motion source
`e1f140368350316ca7c926a9cb54d2e4de652bc8374aa425dc571da45f943432`.
The later opposite-lane whip correction does not change this plate; current
motion verification belongs in `labs/oathkeeper-moves-review.md`.
Decoded movie frames and scene CPU submission timings are additional technical
evidence, not full-speed aesthetic approval or physical-phone performance.
