# Same-budget clarity trial

User requested clearer scenery without expensive phone rendering or high RAM.
Status: explicitly user-approved on 2026-09-24; now registered in
`../cutscene-references.js` with immutable plate/composite copies. This document
retains the original generation provenance, not permission to silently revise it.

Built-in image generation/edit tool, not an API or runtime shader.
Original preserved as `illustration.png` here and
`assets/encounters/mushroom-clearing.png` in deployment.
Output: `assets/encounters/mushroom-clearing-crisp.png` (1215 × 1295).
Offline size-only packaging: `tools/build-gatherer-mobile-plate.cjs` creates
768 × 819 PNGs for both variants. No resize library ships to gameplay.

Edit target: original environment plate. Only additional style reference:
`character-only-references/mushroom.png`, isolated native approved character.
No character/reference UI or background supplied as a style input.

## Final prompt

Use case: style-transfer (precision clarity pass, not a redesign).
Image 1 is the EDIT TARGET: an existing approved-layout game environment plate.
Image 2 is ONLY an isolated character-model reference for crisp angular material
edges; DO NOT add this character, people, UI or text to the environment.
Preserve Image 1's exact portrait framing/aspect ratio, camera, cottage silhouette
and position, trees, winding path, table left, fallen log right, foreground
rocks/plants, bright lush palette, sun direction and empty central foreground
for a live character. No new objects, no rearranging or zooming. Return the
environment alone at approximately the same 1214x1295 resolution, not a huge
4K file.
Make a carefully localized clarity refinement: replace soft painterly smudges
and ambiguous small transitions in the foreground and middle ground with clean
crisp, intentional angular boundaries between broad flat color planes.
Especially the fallen log, nearby mushrooms, foreground stones/grass/flowers
and cottage wood/steps should have legible stable sharp edges similar to the
character reference. Keep existing fine structural detail but no extra busy
detail. Distant foliage remains restrained, not uniformly hyper-sharp. Maintain
the lush beautiful atmosphere and existing composition exactly; not a mosaic,
not triangulated low-poly, not blocky pixelation. No sharpening halos, grain,
glow or photographic texture. The goal is the same image, cleaner and more
crisply drawn at the same pixel budget, so it belongs behind the separately
drawn geometric character.

## Observed limitations

The edit preserves the major layout but reinterprets some small foliage, stone
and timber shapes. It is not a pixel-identical deblur. This is why A/B and the
original are retained. Distant foliage is still softer than the live geometry;
this is not resolution-independent vector artwork.

## Runtime budget

One selected PNG Image, one drawImage per conversation frame; no extra plate
canvas, pixel readback, sharpen filter or duplicate variant preloads. Browser
decode/texture caches are browser-owned; code does not promise exact process RAM.
Standard decoded RGBA payload: 6,293,700 bytes (~6.0 MiB).
Low-power payload: 2,515,968 bytes (~2.4 MiB).
Source stays fixed through viewport rotation; no per-resize image allocation.
Existing low-power hints (device memory <=4 GB or <=4 logical cores) are reused.
Missing hardware hints retain the bounded standard tier; no stronger claim of
automatic real-world device performance detection is made.

Tests: `gatherer-event-browser-audit.cjs`, `gatherer-lighting-audit.cjs`,
`background-illustration-audit.cjs`, `journey-normal-events-browser-audit.cjs`,
`art-lab-audit.cjs`. See `output/gatherer-event/report.json` for budget checks.
Tests use headless Edge, not an actual low-end handset; phone FPS remains to
be checked by the user. Approved character source fingerprints remain untouched.
