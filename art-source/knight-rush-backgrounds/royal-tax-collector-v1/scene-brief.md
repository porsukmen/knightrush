# Royal Tax Collector — candidate, 2026-09-27

User request: rebuild the question-mark event's art first. A charlatan with a
paper crown and a potato in hand, using Knight Rush Art and Cutscene skills.
Do not redesign the minigame yet. Existing dialogue, choices, cost and rewards stay.

## References and composition

Inspected live Art Lab isolated Duke, merchant, gatherer, Jonathan and Shuffle
dealer; inspected approved crisp Gatherer Background Lab plate + composite.
No old taxman or excluded Oakbreaker reference used for the new character.
The new actor is NOT approved or inserted into the approved reference catalog.

Eye-level forest checkpoint; empty ground in center, road receding left, patched
tent and collection crate to the right. Warm upper-left daylight, cool green
fill. Actor boots at (232,473), scale 1.48, head below upper canopy; dialogue
begins at y505. Native paper crown, held cut-potato seal and asking palm share
the live actor's pose. Fixed-length arms, grounded boots, breathing and blinking.
The torso, both shoulders, upper arms, forearms and hands draw in that order.
Separate neutral/scene palettes cover skin, cloth, paper, leather and potato.

One plate through the shared cutscene manager, no secondary full-frame cache,
filters or frame readback in production. Standard 1215x1296 = 6,298,560 RGBA
bytes; mobile 768x819 = 2,515,968 bytes. These are image payloads, not process RAM.
Packaged from the original generated image, without sharpening or added texture.
Original: generated-source.png. Runtime: assets/encounters/royal-tax-collector-v1.png
and its -mobile.png sibling. Adapter: assets/encounters/royal-tax-collector.js.
Direct playable visual preview: KnightRush.html?taxmanlab=1.

## Generation provenance

Built-in image generation, not CLI. Input image 1: approved/gatherer-clearing.png,
environment style/clarity only, not an edit target or a character reference.

Exact prompt:

> Generate a NEW Knight Rush cutscene environment plate, not an edit of the reference scene. Reference image 1 is ONLY the approved clarity, broad simplified painted planes, restrained purposeful details and vibrant daylight environment quality anchor. New setting: a laughably makeshift roadside tax checkpoint in a medieval green forest, NO cottage. Square-ish portrait 1024x1088 composition. The dirt road approaches from foreground and curves gently to the left into deep forest. Midground at right: a small shabby open wooden lean-to with patched muted russet canvas roof, a plain tilted empty board and a short rope barrier tied to two posts BEHIND the future actor, a small wooden coin crate off to the far right. It should look like a charlatan improvised a toll stop, not a fortified official station. Large thick tree trunks framing edges, large varied foliage masses, golden-green leaves and cooler teal woodland distance, quiet warm ochre earth. Camera eye level, modest downward view onto feet-ground. Reserve unobstructed central foreground x30-73%, y32-94% for a full-body standing native cartoon character to be added later, head near y32%, boots y92%; no prop, rope, foliage or shadow in front of that space. Warm sunlight upper-left, broad cool green fill from right, crisp supported wood planes. Foreground/midground boundaries clean and deliberate beside crisp vector-like native character, no blurred smudges, no microtexture. SIMPLISTIC illustrated environment with broad material planes and sparse structural detail, NOT realistic painting, NOT polygon mosaic, NOT pixelart, no sharpen halos, no grain, no glow. No people, no character, no animals, no potato, no crown, no lettering, no text, no numbers, no interface or watermark. Keep bottom center open dirt, not a decorative foreground hedge. This is a standalone generated environment; do not copy the reference cottage or its composition.

The generated plate retained crisp near-ground, timber and canvas boundaries at
the same budget as the approved clearing. The coin crate is static narrative
scenery, not an interactive reward. No runtime clarity filter was introduced.

## Review

### Fresh character replacement after explicit rejection

The rejected Tax Collector geometry is discarded, not used as a design anchor.
The replacement rebuilds head, jaw, neck, torso, legs, shoulders, arms, palms,
paper crown and potato in native canvas geometry. The backdrop and game remain.
Pre-design live overview: output/tax-collector/rebuild-live-before.png.
Primary construction IDs: knight, bear, merchant, mushroom, barry; the full live
approved overview also includes Duke, Shuffle, innkeeper and Borin. Renderer
construction inspected after the models: drawWanderingMerchant,
drawMushroomGatherer, Barry and innkeeper actor/pose/materials.

Concrete lessons: head narrower than the broad trunk; short connected neck;
square jaw rather than a pointed chin; small squared eyes; one broad nose front
and side; broad cloth faces instead of decorative triangles; planted boot
columns; independent shoulder, upper arm, forearm and palm masses.

Post-design reopened live comparison: rebuild-live-after.png, color / true
grayscale / silhouette; rebuild-motion.png covers four idle times. The smaller
head, continuous cheek/jaw and broad vest sit closer to the merchant/gatherer
construction. The crooked brow, compact moustache and paper crown distinguish
this candidate without reusing the rejected face. Props remain attached and
both arms cover their shoulder roots. Scene lighting uses a warm left plane
and cooler right planes, preserving neutral geometry. Small-phone-scene-0.png
and desktop/phone-scene-0/2/4.png were visually inspected: full boots, crown and
potato remain clear of the dialogue sheet and controls. No baked actor/imagegen.

royal-tax-collector-audit.cjs passes desktop, phone, small phone, fixed bones,
neutral/lit alpha identity, input, release and missing-image fallback.
cutscene-audit.cjs passes. art-lab-audit.cjs remains blocked by the pre-existing
KRTavernSlide.barry protected hash mismatch (2b5c2a50 actual vs b7e9b2e7 baseline).
Barry and the protected baseline are untouched. Technical checks do not approve
the candidate; explicit user visual approval is still required.

Follow-up: user requested taller human proportions and cheaper imitation royal
clothes, noting the dwarf-like height. Reopened the same live approved models
before editing and for final color/value/silhouette review. Added 24 native units
to the legs and about eight to the trunk; raised head and fixed-length arm roots
by 32 while preserving face, hands, boots and the scene scale. Roughly 16% taller,
not a uniform actor scale-up. Faded wine coat, ochre waistcoat, uneven imitation
gold braid, mismatched/missing buttons and three localized repairs replace the
prosperous teal outfit. Neutral and scene palettes retain the same light direction.
Rechecked desktop, phone, small phone and four idle poses: no UI intersection,
feet remain planted, connected shoulder/hand/prop layers. Scene audit passes;
the same unrelated Barry baseline warning remains. Latest review images above
now show this taller, patched-clothes revision; still a candidate for user review.

Hands-only follow-up: user requested the approved merchant hand construction.
Reopened the live Lab overview and isolated merchant before editing; inspected
drawWanderingMerchant foreground palm/cuff code. merchant-hands-live.png records
that live reference. Replaced the flat pointed palms with a compact clipped
knuckle mass, narrow side plane, short three-line finger separation and no
separate protruding thumb. Cuffs now follow each forearm's angle. Potato rests
eight local units higher with its lower edge occluded by the supporting palm.
Face, clothes, height and fixed bone lengths are unchanged. Fresh post-change
live color/value/silhouette board and four idle poses were compared again;
desktop and small-phone composites checked for connection and prop contact.
All scene audit cases pass; the unrelated Barry baseline mismatch is unchanged.

Run tools/royal-tax-collector-audit.cjs for desktop, phone, small phone, lighting,
silhouette, motion, source dimensions, UI clearance, choices, load failure and
release. Inspect output/tax-collector. Technical passing is not user approval.
Minigame implementation is intentionally deferred; the existing arm-wrestling
choice remains functional, with its existing presentation, until redesigned.

## Hands, neck and clearing light revision

User rejected the rotated hands and neck join and requested scene-matched light.
Pre-edit live Art Lab review: Jonathan/bear block massing, merchant/Gatherer
compact palms, Barry's separated arm blocks; close source check of merchant and
Gatherer hands. Background Lab crisp clearing was inspected as both plate and
live sunlit composite (output/tax-collector/reference-clearing-*.png).

Rebuilt both palms as broad simple blocks with three short finger marks, no
protruding thumb. Opposite outer edges are mirrored; lighting remains upper-left
on both hands. The empty arm now rests naturally beside the waist, with unchanged
35/33 bone lengths. The raised hand is independent of cuff rotation and supports
the potato's lower edge. Short tapered neck is behind the collar; chin lowered
three local units and shirt opening raised so no long rectangular neck overlaps
the lapels. Face identity, paper crown, potato, height and gameplay are retained.

Scene-local material table now uses warm straw-gold sun-facing planes, terracotta
coat highlights, cooler desaturated woodland shade and green-grey trouser fill.
Skin, paper, potato and boots share this light; the neutral palette is unchanged.
No global tint, filters, new plate or decoded-image allocation was added.

Post-review evidence: rebuild-live-after.png color/value/silhouette reference
comparison, rebuild-motion.png, actor-neutral.png / actor-scene.png and desktop,
phone, small-phone scene frames. Event audit passes lighting alpha equivalence,
fixed bones, input, render-state purity, asset budget/release and missing-image
fallback. Its RAF-frozen loading waits now use timer polling (test-only fix).
Cutscene and Background Illustration audits pass. Art Lab still stops at the
pre-existing Duke hand-baseline mismatch; no protected hash is changed.
This revision remains a candidate awaiting user visual approval.

### Saturated base-colour correction

User rejected the previous scene palette as bleached. Replaced the neutral AND
scene material tables with richer brick-red cloth, mustard vest, warm tan skin,
petrol-green trousers and brown leather. Lower, more saturated highlights and
material-coloured shadows replace the pale cream/grey-green wash. The local
scene variation remains restrained; no filter or background/UI edit is involved.
Mirrored the complete potato-holding palm around its wrist, including finger
marks, without moving the potato, cuff, arm, neck or the other hand.
Live Lab colour/value/silhouette and desktop/phone scene captures are refreshed
by the existing review and event audit tools. Reference baselines stay unchanged.

Raised-grip correction: the three short finger divisions now start at the upper
potato-contact edge (local y=-12.5) and stop above the blank palm, rather than
running toward the cuff. Hand mirror, silhouette, pose and palette are unchanged.
Merchant/Gatherer live reference and post-edit scene/pose review repeated.

### Potato cancellation seal playable candidate — 2026-09-27

Replaces this event's arm-wrestling route with two choices: pay 5 gold or
challenge his authority. He threatens to invalidate the travel pass, pins its
far end and tries to stamp it. The player drags the near end (touch/mouse) or
uses A/D or arrows. Three misses beat him; two contacts cost min(5, gold),
stated before play. Zero-gold players can still finish. No bonus gold or free
goodbye choice. Win: mashed potato, disappointed eyebrows/mouth, lowered
shoulders, then an explicit return to the road.

Existing approved-reference construction and saturated character materials are
retained. Pre/post live Art Lab comparison includes Jonathan, bear, Merchant,
Gatherer and Barry, not just one bartender. Arms keep 35/33-unit bones; torso,
shoulders, upper arms, forearms and hands have explicit passes. Broad short
merchant-style gripping hand presses on the potato; no protruding thumb rig.
The game crops the existing forest plate without stretching it, adding no image
decode or new cutscene asset. Oak table, shearing paper, ink and live arm poses
are native drawings. One pinned-paper contact geometry drives collision and
ink; ink at the paper edge is clipped between the paper and tabletop.

Rules use event-owned seeded state and bounded 1/120-second simulation steps,
not frame-count timers or extra event listeners. Tracking, one possible feint,
committed windup, impact and recovery are separate phases. Settlement happens
once in the event owner; draw is read-only. Dispose clears the drag and game.

Evidence: royal-tax-collector-audit captures desktop/390px/320px intro, win,
loss and clean photo frames, tests two choices, pay, win, poor-player loss,
one-time settlement, fixed bones, pointer/keyboard, loading/fallback and release.
UI-system and cutscene audits pass. Art Lab still flags the existing Duke
renderer hash mismatch; no baseline was rewritten. The older broad normal-event
browser audit passes the updated tax section, then fails on its removed chickens
fixture (line 76); this is not claimed as a passing suite.
This game/pose adaptation is a candidate for user review, not a new approved art
reference. No other event gameplay or main-menu parchment is changed.

### Paper/arm correction after user review

The pinned-corner shear was rejected: it stretched the sheet and the knight's
glove into a diagonal ribbon. Replaced it with a single table-plane projection:
constant sheet dimensions, parallel near/far edges, lateral translation and
depth-scaled displacement. The far hand now follows the paper's corner; the
near glove only translates. Ink, contact width and hit position use that same
projection. No background, face, material or table redesign.

Live approved Jonathan/bear/Merchant/Gatherer/Barry board inspected before and
after. Barry's planted arm construction informed the corrected elbow-down
working range: raised wrist stays below/inward of the shoulder, reaches forward
on the downstroke and returns along the same continuous path. Bone lengths,
three-value sleeves and forward arm layers are preserved. Merely switching the
IK branch would have put the elbow above the shoulder and was not used.

Restored exact original introduction from Git: "Halt! Royal road tax. Five gold."
and "His crown is paper. His seal is a potato." Current seal rules remain below.
`tax-seal-pose-review.cjs` captures nine actual scene poses (left/centre/right,
windup/strike/recovery), checks elbow-down orientation, wrist reach and invariant
paper dimensions. `royal-tax-collector-audit.cjs` passes desktop/phone/small-phone
gameplay, real mouse/touch controls, pause, one-time settlement and release.
Reviewed new pose board and phone intro beside fresh live approved references.
Art Lab still stops at the unchanged Duke baseline mismatch; not rebaselined.
