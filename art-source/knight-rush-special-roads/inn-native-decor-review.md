# Inn roadside native decoration revision

User requested removing the unnecessary 3D appearance/work from the trough and
firewood. These and the small roadside cask now use bounded, prebuilt Path2D
layers, with one shared scenery projection per object. The house remains its
existing model. Road/foliage, placement seeds, collision and root obstacles are
unchanged. No raster asset, bitmap cache or resolution reduction was added.

Art / Special Road skill review: live Art Lab models plus current Crimson/Disco
road captures. Cut ends and bark give the logs shape; the trough has a recessed
water surface, thick uneven stone lip, restrained moss and a contact shadow.
No per-vertex projection or face sorting for these three roadside decorations.
New artwork remains a candidate, not an approved reference.

Checks: inn-decor-audit (real simulation close/far, desktop/phone, one projection
and zero sorts per object, canvas restoration, no RNG/game-state mutation),
mossy-inn-audit (both turns and full service lifecycle), art-lab-audit (22 source
checks / nine approved models). Screenshots in output/inn-decor and output/mossy-inn.

Short serial Edge measurements, 180 frames, desktop and phone emulation:
render CPU straight desktop 2.93 -> 2.69 ms; turn 3.15 -> 3.05 ms.
Phone-emulated straight 2.63 -> 2.70 ms; turn 4.04 -> 3.79 ms.
Frame p99 remains roughly 12.2 ms desktop / 24.3 ms phone-emulated turns.
Normal forest control still has better pacing: this edit does not resolve the
whole inn-road frame-pacing cost. Do not claim stutter fixed or phone FPS tested.
Reports: output/journey-live-pacing/inn-decor-{before,after,forest-control,venue-after}.json.
