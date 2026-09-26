# Oakbreaker / candidate arm-wrestling corner

Built-in image generation, 2026-09-26. Not an approved reference.
Input: approved Mossy Oak Inn v4 plate, environment quality only. Isolated live
Art Lab Barry, Borin and Jonathan inspected separately for native actor/arm and
steel shape language. No old arm opponent used as a style anchor.

Camera: frontal, slightly elevated, central vanishing direction. Plate logical
region (0,80,480,640). Empty central wall behind broad seated actor; warm lantern
left and cool window right. Native wooden table, pads, pegs, barbarian, player
arm, joined hands and UI remain separate from the raster. Elbows are fixed on
the surface, joined hand moves on a 3D pin arc (projected in 2D).

Standard 1086x1448 = 6,290,112 RGBA bytes. Mobile 576x768 = 1,769,472 bytes.
Single selected plate owned by event-visuals; no additional full-screen cache,
runtime sharpen or filter. Native material palettes provide warm lit planes and
cooler shadow faces. Desktop and phone outputs: output/tavern-arm/.

## Final generation prompt

Pose revision from the user's arm-wrestling photo: photo guides anatomy/contact
ONLY, never character style. Rival elbow is left/far, player elbow right/near;
the player wins by pinning left. The grip lies on the intersection of two fixed
forearm spheres (radius sqrt(138^2+62^2+68^2)). Full upper arms draw after the
table so the far edge cannot amputate them. Both player arms reuse Jonathan's
actual drawSerJonathanArm primitive in U coordinates, steel palette, articulated
elbow guard and gauntlets; not bare skin or a different character's arms.

Gameplay checks: 100 deterministic seeds for each policy; continuous hold loses,
rest-only loses, ideal recovery timing wins around 22 seconds. This is automated
policy coverage, not a claim about human difficulty. 30/60/120 Hz consistency,
touch/mouse/keyboard release, cancel, pause, both outcomes, pure rendering and
unchanged taxman covered by tools/tavern-arm-audit.cjs. Desktop/mobile images
reviewed; actor/scene remain candidates pending user feedback. General Art Lab
baseline check still flags the pre-existing Barry shoulder source mismatch.

Built-in prompt:

Use case: stylized-concept. Asset type: Knight Rush arm-wrestling minigame BACKGROUND PLATE ONLY, portrait 3:4. Input image is the approved Mossy Oak Inn environment, reference ONLY for crisp simplified illustration quality, warm wood and broad angular materials, NOT its bar layout. Create a new cozy rowdy tavern contest corner, straight-on symmetrical camera slightly looking down, no diagonal camera. Back wall quiet warm plaster center behind a seated massive native character that will be composited later (keep central 30%-70% width empty and low detail). Heavy timber beams frame upper sides, warm hanging lantern at upper left, a small cool blue daylight window on right, a few barrels and simple drinking vessels to outer edges. Reserve bottom half as empty broad floor planes, NO foreground table, NO bar or counter, no chair obstructing center. Our native close wooden wrestling table will cover bottom half, vanishing point at center x50% y35%, far edge at image y49%, near edge y80%. Light from upper left orange-amber, cool reflected right shadows. Intentional crisp illustrated polygon shapes, controlled warm vibrant colors, chunky wood construction, three major value planes per material, very sparse grain, same-budget clarity, no smudgy texture, no blur, no photographic realism, no tiny facets. No people, hands, arms, creatures, UI, writing, symbols, logos, weapons, trophy plaques. Quiet uncluttered center so a muscular barbarian and joined hands read cleanly. Generate polished environment only, not a mockup.
