# Rest camp v2 — candidate perspective correction

## Current composition update — 2026-09-28

User chose a front-facing Jonathan directly behind the fire and requested a
better log. The v2 daylight plate is unchanged: this is a short two-heart rest,
not an overnight sleep. The previous rear-view notes below are historical.

Current coordinates: knight (240,452), scale 1.22; near fire (240,496), scale
.94; pack (171,455); shield leaning against the log at (297,446). The log is
drawn behind frontal legs. Its rounded faceted bark, cut-end growth rings and
single branch stub replace the plank/box shape. Actual Jonathan helmet volume
and plume are retained, with frontal visor slits, a small blue tabard, planted
boots and palms on knees. Fixed-length arm IK keeps elbows connected during
sitting; front shoulders precede complete arm chains. Shield is not on his chest.

Both reference gates repeated live: overview, Jonathan, seated merchant and
approved smith; Gatherer clearing/composite for bark, depth and scene light.
Before evidence and fresh after neutral/daylit sit=0/.5/1 comparison are in
`output/camp-front`. Actual phone and desktop ready/sitting/rested images in
`output/camp-v2` reviewed: visor clear, hands on knees, log support and near
fire order correct, UI clear. Local warm steel tops retain blue main planes.
No raster or approved model source changed. No extra runtime image/memory cost.

Result copy is now "You feel rested." regardless of initial health. Reward
remains a one-time maximum of two hearts, capped by missing health. Camp audit,
cutscene audit and background illustration audit pass in this update. Art Lab
integrity still stops on the unrelated existing Duke source hash mismatch;
baseline remains untouched. No remaining Gatherer timeout in this run.

## Previous rear-facing trial

User request: camp reads too close to the camera; remove the background tent;
Jonathan must behave as a rear-facing sitter rather than a front-facing body.

The v1 plate was edited with built-in image generation, removing the shelter,
ropes, poles and sleeping roll. No actor or prop was baked into the plate.
Original generated output: `generated.png`. Runtime assets:
`assets/encounters/rest-camp-v2.png` (1086x1448) and
`assets/encounters/rest-camp-v2-mobile.png` (576x768). Same decoded budgets and
cutscene ownership as v1, which is retained but no longer selected at runtime.

Native composition on the 480x640 plate: knight anchor (216,478), scale 1.22
instead of 1.65 at (190,565); fire (291,413), scale 1.05 instead of 1.55;
pack (151,479), scale .8. Fire hit bounds follow the new visible location.
Camp occupies the central clearing instead of the large foreground foliage.
Fire is ahead of the seated knight in depth, with a visible lateral offset.

Pose: rear thighs project away, no front-facing bright kneecaps or toes.
Draw far legs, then near log, then reaching forearms, torso/back, rear shoulder
caps, actual Jonathan shield and helmet. Hands disappear behind the torso as
he sits, rather than appearing on the camera side of his back. The seated
pelvis meets the log top; all of these parts share one anchor/projection.
No gameplay, reward, pause, UI layout or approved renderer changes.

Reference gates: fresh live Art Lab overview plus knight and seated-merchant
close-ups before the edit; Gatherer Background Lab inspected for clearing
depth and crisp saturated broad planes. Final live knight, seated-merchant
and merchant comparison is `output/camp-v2/final-reference-comparison.png`.
Construction lessons: squared helmet/compact steel masses, no visible face
from the rear, connected elbows, pelvis support, pose-dependent occlusion.
Neutral/daylit rigs at sit=0/.5/1 retain blue steel and plume material identity;
warm top planes do not bleach the silhouette. The new rear-arm pass is an
intentional rear-pose exception to front-facing shoulder ordering.

Visual review: desktop and 390px phone ready/intermediate/rested screenshots
in `output/camp-v2` inspected. Camp/fire stay inside the clearing, no tent,
no frontal knees/palms, no UI overlap. Background edge clarity retained at
the same memory budget, without sharpening or global colour filters.
Rest audit passes: real touch target, pause, single heal, leave lock, cap,
release and error-free desktop/phone. Cutscene contract audit passes.
Art integrity audit still reports the pre-existing KRDukeBluff.actor source
fingerprint mismatch; its protected baseline was not changed.
The broader background audit reached the unrelated Gatherer live playtest,
then timed out waiting for return to run at line 70. It is not recorded as
a pass; the dedicated camp touch/rest/return/release tests passed separately.

Built-in image generation prompt:
Use case: precise-object-edit. Edit this Knight Rush forest background plate.
Remove the entire rust-red tent/shelter, its poles, ropes, pegs and sleeping
roll in the back right. Replace that area with a natural continuation of the
existing green undergrowth, trunks and bare ground, with no new focal prop.
Keep the exact camera, perspective, clearing shape, tree framing, vivid
saturated greens and warm soil, upper-left sunlight, crisp angular broad
planes, and all other areas unchanged. No character, no campfire, no log seat,
no text, no UI. Preserve portrait dimensions and the empty central clearing:
live game characters and props are composited there separately. Do not soften
the material boundaries, add grain or desaturate the image.
