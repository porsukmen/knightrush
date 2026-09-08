# Forest vision: phase 1/2 checkpoint

Latest iteration: footprint-based tree cache selection (filtered 1/2/4/8/16
levels, never enlarging a coarse source). This replaces fixed .09/.4 switches.
Deterministic ground details now reserve conservative footprints and the test
obstacle zone; all-pairs including chunk boundaries are regression tested.
Denser ground uses dry plates, broken edges, darker mud with restrained wet
highlights, and three-blade grass groups. Native median about 38ms in current
audit, so density/render cost is not mobile-certified or final optimized.

## Current art direction: BLOCK STYLE, not pixel art

The user explicitly prefers the established angular knight/bear style. Preserve
rectangular/polygon silhouettes, but do not force pixelated rendering or hard
integer edge sampling. Only the test corridor currently opts into CSS `auto`.
Tree cache downsampling is filtered; near sprites use smooth scaling and distant
trees retain fractional alpha coverage with bilinear sampling, not alpha cutoff.

The active corridor ground now bypasses the legacy pixel buffer entirely:
native Canvas polygons draw dark brown soil (#503923), dark grass (#20351f),
sparse broken soil plates and separate pointed grass clumps in world space.
No per-pixel noise texture is used by this path. Existing water/rock decorations
remain. The legacy floor code below is retained only for the separate NEW route.
Tests now assert this bypass, automatic CSS filtering, replay consistency and
stable distant ground. No video is requested; inspect FOREST TEST directly.

Open KnightRush.html and choose **FOREST TEST · TREE** on the main menu.
The 384-unit straight corridor takes about 21.3 seconds. Use the ordinary
pause menu to return. It has one stone, no collisions, no turn and no score
progression. Replay uses the same world coordinates and variants.

Implemented:

- Immutable tree records in deterministic 128-unit chunks.
- Preparation 65536 units ahead; taller new trees are below half a logical pixel.
- Bounded chunk ownership and retirement behind the camera.
- Experimental giant-tree art with rooted bole/branch and separate crown cutouts.
- Warm brown bark with localized moss; three open crown silhouettes (high,
  lateral, inward bough), mirrored toward the path according to world side.
- Fixed wider, staggered placement; distant trees reprojected into one raster layer.
- Stone present from the start, including beyond the former 230-unit cutoff.
- Shared floor/contact projection, without arrival opacity or rise animation.

This is a controlled finite corridor, not the production procedural forest.
Far tree spacing is deliberately sparse and fixed in world coordinates.
PLAY and NEW spawning/art remain unchanged. Giant-tree art is now the current
visual trial, not yet approved. Quieter floor art, final canopy composition,
turning integration and environmental obstacles are later approval stages.

Validation:

Set KNIGHT_CANVAS_MODULE to the installed @napi-rs/canvas path, then run
`node tools/forest-corridor-audit.cjs`. Do not generate video unless requested.
Earlier clips are historical and do not represent the current reference floor.
The audit checks identity, replay, subpixel preparation, retirement, bounded
storage, projection, old stone cutoff, 60/120Hz agreement, menu entry,
real update-loop isolation and return to PLAY. Native raster timings are
diagnostics, not mobile/browser FPS certification.
Art checks also verify distinct crown coverage, canopy transparency, warm bark
coverage and separate left/right cached orientations.

Previous floor prototype (superseded in the corridor): logical-resolution 480-wide floor
instead of 240-wide enlarged pixels. Sparse angular world-fixed marks replace
threshold-noise blobs. Near colors are opaque palette values. Pixel-footprint
minification reduces unresolved distant mark contrast; this is sampling, not
translucent material painting or fog. Tests check near palette, opacity, full
resolution and stable distant-path pixels between moving frames. Higher floor
resolution currently costs more native raster time; phone performance unverified.
Small rocks are angular
chipped shards using the obstacle-rock palette, not round caps. Shallow water
has irregular earthen banks and stylized broken cool gray-green reflections with
pale surface highlights (not dynamic scene reflections). Mud is opaque earth.
Internal decoration layers preserve paint order (bank, water, reflection), while
each decoration as a whole is depth sorted with the scene.
These are not obstacle entities and never participate in collision checks.
Ground-detail records are covered by the deterministic replay test. No new
video is generated unless requested; inspect directly through FOREST TEST.

## Reference floor and understory trial (2026-09-08)

### Active particle-ground optimization

Close-tree extension: the existing lazy 2x foliage re-authoring now also covers
bark and roots whenever device footprint exceeds one source pixel. Same world
positions and far filtering; no per-frame re-authoring. Extra bark HD storage
is 6 MiB per encountered variant, bounded by six variants (36 MiB raw maximum,
in addition to foliage HD caches). Short multi-distance native smoke and boot
checks passed. Real GPU-floor/browser appearance and mobile memory remain
unverified; this is a close-resolution trial, not proof of zero blur at all zooms.

LATEST HD refinement: same 2048-square close atlas now covers 16x16m instead
of 24x32m, giving 128 texels/m in both directions (1.5x across, 2x forward).
Depth blend is 24->20, lateral blend 7->8m. Ring starts floor((dist-4)/2)*2,
8 bands of 2m, covering the rider-to-bottom visible floor and forward blend.
No extra texture memory or samples, but band uploads occur twice as often;
actual browser performance remains unmeasured. CPU coverage/wrap/fallback and
boot/diff checks passed. This supersedes the close-map dimensions below.

Close HD GPU trial: an additional 2048x2048 ring atlas covers 24m width/32m
length (1.5x lateral, 4x longitudinal density versus far atlas). Eight 4m bands
reuse the same seeded geometry, updating only entering bands. Shader blends
from far at depth26 to full HD at depth20 (rider at depth14), so full detail
starts ~6m ahead and extends below the rider; lateral 11-12m falloff avoids
an atlas boundary. Far map unchanged. Adds 16 MiB base/~21.3 MiB with mips
and 2 MiB staging, not a full-map resolution increase. CPU atlas wrap and
coverage tests plus boot/diff passed. Actual GPU appearance and cost still
need the user's browser test; browser file-URL access remains blocked.

EXPERIMENTAL GPU FLOOR: forestBlockGround tries forestGPUFloor, falls back on
unsupported/failed WebGL or rotated camera. G toggles GPU/Canvas in FOREST TEST;
bottom label exposes mode/failure. Normal PLAY is untouched. Existing seeded
chips/shards render into a 2048x4096 RGBA ring atlas, 16 bands covering 256m.
Only a newly entering 16m band is uploaded; preceding rows preserve long marks
across seams. Mipmaps regenerate on upload; optional anisotropy, nearest mag.
Shader projects the same floor and samples premultiplied markings. It is still
an approximation of the vector version, and may soften distant marks.

Memory: 32 MiB base atlas (~42.7 with mip levels), 2 MiB staging strip plus
bounded output canvas. Initial 16-band preparation and mip generation may hitch.
The WebGL canvas is copied into the existing 2D game canvas: synchronization/
copy overhead MAY cancel the GPU benefit. Do not claim a speedup yet.
Browser verification was blocked by local-file URL security policy; no workaround
was used. Boot/diff and tools/forest-gpu-atlas-audit.cjs CPU atlas/fallback tests
pass, but GLSL compilation, rendered appearance, actual GPU speed, memory and
band-boundary movement still require the user's browser test. Old native render
audits take the Canvas fallback and are NOT GPU performance measurements.

Ground local/culling pass: cache hot viewport/palette/sine references locally;
reject offscreen chips in world space before divisions and projected vertices,
replacing the later screen-space rejection. No removed marks, approximation,
resolution changes or new buffers. tools/ground-local-audit.cjs compares against
fixtures/ground-before-local.cjs at 0/110/110.3/384: exact zero image difference.
Repeated short native runs show a modest, noisy ~0.6-0.9 ms floor gain (one
run nearly tied): examples 7.66->6.80 and 8.16->7.53 ms. Full-scene benefit
is small; performance is not solved. Boot/diff checks passed. Further material
gains will require reducing actual path submission/raster work, not just math.

Tree filtering trial (user reported mid-bark flicker and close-leaf blur):
bark uses stable half-resolution source with high-quality minification when
device footprint <=0.5, full source closer. This removes repeated mid-distance
mip transitions. Close foliage is re-authored once at 2x only when original
source would be enlarged, not simply upscaled. Extra foliage cache: 9 MiB per
encountered variant, at most six variants (54 MiB raw); intermediate levels
use exact integer raster sizes. Neither new source is recreated per frame.
Isolated 10-frame bark audit near depth132: temporal peak 19910 -> 6520,
total 68445 -> 56361. This proxy includes legitimate motion, not just flicker,
and is not proof of browser smoothness. Full native scene ~23.8 ms versus
~20.2 before filtering; quality costs ~3-4 ms in this sample. Full-resolution
bark everywhere was tested and rejected (~41 ms). Boot checks passed.

Shared horizon trial: trees deeper than 3000 world units render together in a
single reusable 480x64 canvas (120 KiB raw pixels). The 600-3000 range still
redraws individually every frame. Rebuild on membership, owner, camera angle,
horizontal position, scale/top changes or a conservative estimated displacement
above 0.05 device pixels; no tree removal, fog, horizon cover or new spawn cutoff.
This is explicitly a tiny subpixel temporal approximation, not exact reuse.
The user proposed natural horizon occlusion as a possible later alternative;
it is NOT implemented here and obstacle rendering has not been changed.

`tools/forest-layer-audit.cjs` compares the pre-layer fixture and current renderer
across eight distances and moving frames, flushing/discarding native frames.
Latest run: moving full median 22.81 -> 19.69 ms, eight samples each. Sampled
images differed by at most 1 RGB value, several exactly equal. At distance 110,
756 trees share the cached layer. Boot and diff checks pass. This is a bounded
native diagnostic, not browser frame pacing or final performance certification.

Scalar pass: far-tree art levels use a WeakMap keyed by immutable tree records;
near/far tree projection no longer allocates temporary point arrays/objects or
reduce callbacks. The straight floor outline is projected directly with an
interpolated viewport boundary (general camera fallback retained). No density,
LOD, fade threshold or frame-skipping changes. The fixtures and
tools/forest-scalar-audit.cjs compare the previous renderer at distances
0/110/110.3/384: all four images have zero pixel difference. Short native
timings fluctuate (~23-24 ms full after vs ~24-25 ms before); this is a modest
CPU/allocation improvement, not a solved frame budget or browser certification.

LATEST CART OVERRIDE: the user chose subtle wear, not dark prominent ruts.
Cart ink is the same #372d1e as footprints (dedicated dark batch removed).
Length classes use the same 1-2 world-unit short base multiplied by 1/2/4:
short 1-2, medium 2-4, long 4-8 world units.
Raw candidate probability is 2%; the prior 24 rows exclude neighboring
candidates, so accepted pairs are at least 25 rows apart. Lane variation,
width and flat perspective remain unchanged. This supersedes older cart
color, length and frequency notes below.

Cart correction (latest annotated reference): paired wheel traces now span
3.5-3.8 world units across, leaving the middle empty; center varies across
left/middle/right at -2.5/0/2.5 with slight jitter. Stroke width is 0.12-0.145
and length 5-7. A five-row prior-candidate exclusion guarantees at least six
rows between accepted cart traces, preventing longitudinal overlap.
Dedicated dark brown #241c12
adds one batched ink pass; still four rectangles per occasional trace. Footprint
ink remains unchanged. This supersedes the too-narrow 2.5-2.8 trial.

`tools/forest-cost-comparison.cjs` provides short read-only native ablations.
Latest at distance 110: test full 24.76 ms vs normal populated PLAY 8.74 ms;
floor alone 7.32 vs 1.25 ms. Test without far trees 19.25 ms, without near
trees 15.79 ms, without any trees 10.71 ms, without floor 16.33 ms. Test
traversed 1086 tree records, submitted 44 near and 815 far trees, and cached
6199 ground marks. Normal sample had 104 scenery trees, 3 obstacles, 4 pickups;
normal without scenery 3.71 ms. This is a representative native renderer
comparison, not identical scenes, browser FPS, or update-loop profiling.
The remaining cost comes from both the new floor and near/far tree rendering;
cart-spacing adjustment does not increase geometry count. No further renderer
optimization was applied during this diagnosis.

Current trial also includes occasional dark-brown sole-like marks (15% of
2m world rows, 2-3 alternating prints) and rarer paired thin wheel ruts (5%,
short 1.5-3m broken strokes). They reuse the existing #372d1e soil ink and
bounded row cache: no extra draw calls or height. Deterministic placement,
replay/cache checks and boot validation pass. Latest short native ground
sample remains ~7.5 ms, moving ~7.9 ms; not browser FPS certification.

User direction: prefer 2.5D and performance; use raised/3D details only when
materially important. Decorative stone fragments are now flat X/Z-only texture
polygons, with no height, bevel lighting, shadow or collision. Two separated
angular marks per cached stone use ONE extra batched ink pass, not three faces.
Latest short audit: ground 7.4 ms, moving ground 8.1 ms, full scene 24.3 ms;
48 cached stone records use 6 KiB. These remain native diagnostic timings.

forestGroundRow caches deterministic particle geometry in a sliding window of
128-129 rows (~188 KiB typed geometry at distance 110). Rows behind the camera
are retired, and revisiting a row reconstructs identical marks. Colors are
batched into 15 paths; highlights follow base colors. Straight-corridor floor
projection uses scalar arithmetic and early viewport rejection, with the
general clipped projection retained for a future rotated camera. Particle
counts, sizes and world positions are unchanged. Tiny overlap differences from
batch ordering are permitted; no photo assets or raster cache were introduced.

Run `node tools/ground-batching-audit.cjs` with KNIGHT_CANVAS_MODULE configured.
The fixture preserves the pre-optimization renderer for comparison. Latest
bounded native run: old full 68.1 ms, new full 24.3 ms, new floor 7.6 ms;
moving/new-row floor median 8.2 ms, max 9.1 ms in five samples. Screenshot
mean RGB-channel error 0.002/255 (0.309% of pixels changed). Replay/cache bounds,
boot and diff checks passed. Native results exclude PNG flush and are not
browser FPS certification. No video or long-running test was generated.

SUPERSEDED visually: the user rejected the photo floor and understory, then
rejected the broad polygon soil patches. The active forestStylizedGround now
uses one opaque soil base with small world-fixed chips, moss crumbs and twigs,
inspired by drawSwampRoad. No photo loading, broad blended patches or added
understory. Trees remain unchanged. Latest single-view approval preview:
output/journey-ground-qa/swamp-inspired-ground.png. The timing figures below
refer ONLY to the older photo experiment, not this renderer.

The corridor now uses assets/forest-trail/forest-floor-v1.png in a fixed-size
inverse-perspective CPU material renderer. Three cached understory sprites add
world-positioned trunks, leaves and ferns. Far giant trees use small filtered
sprite blits in a shared 480x64 surface. The bypassed expensive ground-strip
and per-pixel distant-tree function bodies were removed.

Focused validation: `node --expose-gc tools/forest-reference-audit.cjs`.
This bounded 11-frame audit retains no frame array and creates no video. It
encodes and discards each native frame to flush deferred raster commands;
without this, native command retention misleadingly grew RSS by ~43 MB/frame.
Latest local sample: median render-call 37.9 ms (PNG flush excluded), sampled
RSS 305.3/303.9 MB, final 304.5 MB. This is a short native diagnostic, NOT a
browser FPS measurement or long-run memory certification. Boot-only validation
also passed. Screenshot: output/journey-ground-qa/reference-forest-v1.png.

Canopy composition is still repetitive, and 60 FPS has not been demonstrated.
Production integration and obstacle arrival remain separate work.
