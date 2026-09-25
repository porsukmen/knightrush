# Inn obstacle / Autumn Caravan palette pass

Candidate artwork, not automatic reference approval. Uses Knight Rush Art and
Special Road contracts; no generated bitmap or cutscene/UI changes.

Inn only: legacy pond identifier now draws a dry collapsed-cobblestone pit,
with broken rim stones, exposed earth and dark recess. Adjacent lanes join;
separate groups preserve the safe lane. It retains the jump requirement.

User explicitly selected slide-only laundry instead of root. Spawn converts
every occupied inn root lane to duck before the entity reaches gameplay or
the incoming-branch preview. The internal root ID remains for spawn frequency,
but no native root/mother tree is drawn and tree reservations are removed.
Two roadside posts support the high rope; low cloth appears only in occupied
lanes. Safe lanes have overhead rope but no hanging collision silhouette.
Existing greaves/oak artifact exceptions are unchanged. Other biomes retain
their original root and pond behavior. Decorative ponds remain scenery.

Caravan only: orange/amber canopy and burnt-copper shadow faces replace the
large greenish canopy shade masses. Plants/verges shift to ochre leaf tones;
soil is slightly warmer. Tree geometry/density, road topology, natural blend,
ponds, wagon, merchant and cutscene are unchanged. No full-screen filter.

Tests: mossy-inn-audit now covers actual spawned and previewed duck-only linen,
63 lane/action collision combinations on desktop and phone viewport, separated
pit bounds, 1/2/3-lane renders, near/far linen, both turns and inn lifecycle.
Autumn-caravan-audit, roadside-service-entry-audit, art-lab-audit and
crimson-verge-audit cover neighboring contracts and protected references.
Phone captures are desktop emulation, not a physical Safari performance test.
Serial timing report: output/journey-live-pacing/inn-linen-pit.json.
