# Sunlit Wood / 05 — morning rider lighting candidate

## Journey integration

The user requested promotion of this forest into normal Journey, with seeded
roads, dead ends, encounters and colour-based special biomes. Shared art now
lives in `assets/forest/sunlit-forest.js`; `tools/morning-forest-lab.js` is only
the authoring entry. Integration and current contracts are documented in
`assets/forest/README.md`. The historical isolation notes below describe earlier
revisions, not the current production connection. The fixed Morning trial still
exists separately. Special-biome skill/reference approval is deferred.

## Revision 05 — scene-local knight and horse lighting

Morning Forest Test now defaults to a morning material palette for Jonathan:
warm pale metal highlights, cool steel shadows and warmer horse browns.
The added angular cast shadow was removed at the user's request. The existing
contact shadow, character geometry, equipment and animations are preserved.
The panel's `IŞIK: SABAH / ORİJİNAL` button compares the two in the same scene.

Knight Rush Art governs unchanged silhouette/material identity; Knight Rush
Cutscene supplies scene-matched highlight and shadow relationships. This is
an authored material profile on existing planes, not physical normal-based
relighting or moving tree shadows. It is isolated to the Morning lab player;
other Journey stages, squires and direct model previews remain unchanged.

The palette is cached by source appearance, horse and plume. No extra ground
shadow, new textures, offscreen buffers, filters or pixel readback
are used at runtime. The shared environment canvas budget stays at 5 MiB.

`tools/morning-rider-lighting-audit.cjs` checks desktop/phone pixel locality,
unchanged gameplay state, comparison controls and no lighting leakage into
other rider draws. Native-resolution idle, duck and jump close-ups are saved
under `output/morning-rider-lighting/`. Forest and approved Art Lab audits pass.
Visual approval is pending; this pass does not establish physical-phone FPS.

Corner correction: both road hazard courses now retain fixed world anchors in
the painter queue through approach, turning and settling. Collision/lane arrays
remain separate; selecting the branch no longer reveals its whole obstacle
course in one frame. Existing ground masks and foreground arch ordering remain.
Distant tree parallax no longer wraps positions by one tree spacing while
retaining different silhouette indices (the source of three visible jumps).
`tools/morning-corner-audit.cjs` checks those angle boundaries, cached-background
handoff and 48 consecutive real-input corner frames at desktop and DPR2 phone
sizes. It verifies hazard presence, unique draws and projected world depth;
evidence is under `output/morning-corner/`. No art assets or cache tiers added.
The post-fix CPU sample is below Journey in all desktop median/p95 cases. Phone
emulation is mixed: 142 m median is 3.3 vs 3.0 ms, corner p95 is 7.4 vs 6.8 ms;
the remaining median/p95 comparisons are lower. These noisy headless timings
are regression evidence, not an assurance of physical-device frame pacing.

## Revision 04 — flowers, water, connected roots and morning skyline

Follow-up correction: the user rejected the replacement root silhouette.
The original revision 03 arch contours, proportions, moss and broken tip are
restored; only a short buttress connects its outer end to the mother tree.
Inner-lane low roots still follow production jump requirements. Do not replace
that accepted arch with the thin, flattened revision 04 branch shape again.
Decorative pools now reserve their complete bank plus trunk/root-flare clearance
in deterministic placement, across neighbouring rows and both roads. A root's
mother tree takes priority over a pool site. Flower clumps sit outside the banks.
The audit checks tree-footprint separation at multiple distances and turn frames.

The user liked revision 03's forest density. Preserve those tree models,
three placement belts and the warm path. This new detail pass is pending review;
revision 03 source is retained at `output/morning-performance/before-meadow.js`.

Scene brief: a sunlit woodland trail seen from the live Journey camera. Keep
the rider/path as the focal interaction; occasional flowers and shallow pools
describe damp woodland margins. Native angular distant ridges and lower green
hills sit behind the wood; warm sun and two-plane clouds remain above them.
The sky uses slower yaw parallax than the trees. All near-world details use
the shared curved projection and painter order, not screen-space placement.
Knight Rush Art supplies broad massing/material planes; Cutscene supplies the
coherent foreground/midground/background and light relationships. Its approved
clearing is an environment reference, not a bitmap pasted into this run.

- White and purple flower clusters occur on the verge and irregularly in both
  deeper belts. Purple adds one compact native model; only 64/128 pixel cache
  tiers are allocated, with vector rendering for larger close flowers.
- Occasional roadside pools share the lane pond's native ground-plane geometry:
  dark banks/reflected trees, turquoise shallow water, pale sky and thin glints.
  Their whole banks are excluded from both road footprints. Decorative pools
  have no collision requirement. No image, filter or animated texture is loaded.
- Root obstacles now own an existing morning oak, with a continuous buttress
  and raised root extending into the outer duck lane. Low continuation across
  inner lanes is drawn only when the entity requires jumping in those lanes.
  Requirements come from production `OBSTACLE_SPAWN_PATTERNS.get('root')`, not a
  second gameplay rule. Examples cover one, two and three lanes on both sides.
  The lab intentionally remains damage-free for art review.
- Mother trees reserve nearby planting space. Their feet and root vertices
  use fixed world coordinates and their own crest clips; the generic root mask
  is bypassed only in this isolated lab to avoid a second, mismatched clip.
- Skyline shares the existing native-resolution background cache. The shared
  canvas budget remains 5 MiB; the normal Journey and approved anchors are
  unchanged. Native PNG atlases remain archived and unused.

Audit additionally checks outer-belt purple flowers, off-road pool bounds and
production root requirements. Close water, attached roots and all lane widths
are captured by `tools/morning-forest-audit.cjs` for visual review. Current
timings are in `output/morning-performance/performance-report.json`; only a
real phone can establish physical-phone FPS.

Revision 04 validation: native feature audit, approved Art Lab fingerprints,
cutscene integrity/manager tests and boot smoke test pass. Canvas storage in
the DPR2 constrained-phone capture is 4,804,880 bytes (about 4.58 MiB). All eight
CPU medians are below Journey; seven CPU p95 cases are lower, while desktop
92 m is effectively close but slightly higher (9.6 vs 9.5 ms). Headless native
rAF throughput is higher overall, but p95 intervals remain worse (12.4 vs
9.4 ms in this sample). Do not claim frame-pacing or physical-device parity.

## Woodland depth pass

- Existing native tree silhouettes, obstacles and warm path are retained.
  Each 18 m section now has two irregular verge trees, two middle-belt trees
  and one deep-belt tree on each side, with independently seeded positions.
  Depth belts are approximately 9–11 m, 15–19 m and 24–29 m off the road.
- Small verge plants were reduced from seven to four per side per section to
  spend the drawing budget on forest structure rather than repetitive clutter.
  The forest floor is darker; the path and sunny grass edge are unchanged.
- Opaque two-value distant silhouettes replace ghostly translucent trees.
  Their material paths are merged once, requiring just two fills per tree
  during turns. The stationary distant layer still uses the bounded cache.
- Camera transforms are shared per frame; branch rejection bounds include the
  outer belt. All nearby trees retain independent, fixed world positions,
  normal depth sorting and curved-ground reveal throughout the right turn.
- The shared native canvas budget remains 5 MiB; no external sprite images,
  extra model-cache tiers or density-dependent image buffers were added.
- This is an isolated Morning Forest trial, not a replacement of Journey.
  Candidate approval remains pending. Pre-density code is preserved at
  `output/morning-performance/before-density.js` for comparison.

Revision 03 verification: native lab audit passes desktop, constrained-phone emulation,
real turn, stable repeated frames and exit cleanup. Native canvas storage is
about 3.2 MiB desktop / 4.5 MiB DPR2 phone, still below the shared 5 MiB cap.
The eight controlled CPU comparisons (three straight positions and a turn,
two viewports) are below Journey for both median and p95 submission time.
Headless scheduled throughput is higher overall, but its p95 frame interval
is slightly worse (14.5 ms vs 13 ms in this sample); do not interpret CPU parity
as a guarantee of identical frame pacing or physical-phone FPS. Reports:
`output/morning-forest/report.json`,
`output/morning-performance/performance-report.json`.

## Current revision — simpler, code-drawn environment

User feedback: preserve the ground/path, but the generated tree and prop sprites
are too detailed next to Jonathan. `tools/morning-forest-lab.js` now paints all
trees, flowers, leaf fans, rocks, logs and obstacles with native canvas geometry.
The original `drawTreeArt` is the technical reference: rooted trunk, squared
canopy masses and a small number of light/main/shadow planes. Knight Rush Art
sets the style; no approved renderer or reference hash was changed.

- Three tree silhouettes, three main leaf/bark values, broad angular contours.
  No painted foliage texture, leaf stippling or low-resolution bitmap upscale.
- Geometry uses shared immutable `Path2D` models, built once for the lab. Trees
  remain individually positioned in Journey world space and use its camera,
  painter queue, crest reveal and right-turn projection.
- The ground/path artwork is retained. Revision 03 changes the placement and
  distant-layer composition to supply the depth requested in the forest review.
- Native Jonathan/horse and original PLAY/Forest Test are unchanged.
- No morning atlas, source PNG or event image manager is loaded. External
  decoded-image storage remains zero, but code-drawn runtime canvases now use
  a **shared maximum of 5 MiB RGBA**, reported separately under `report().cache`.
  Canvas/GPU copies, geometry and normal game caches have additional costs.
- Audit covers native-only loads, desktop/phone views, real turn input, stable
  repeated drawing, gameplay/projection state purity, row retirement and exit
  cleanup. Screenshots are under `output/morning-forest/`.

All raster files below are preserved as the **superseded first experiment**,
not runtime dependencies or approved references. Do not rebuild/re-enable their
atlas as part of normal testing. Current candidate still needs user approval.

### Performance pass

The unoptimized native revision was substantially heavier than Journey. Do not
equate zero downloaded bitmaps or a passing screenshot audit with good FPS.

- Geometry for visible ground rows is retained in a bounded cache. World-space
  placement, palette, soil marks, shoulders, shadows and draw order are unchanged.
  Entire hidden roads/rows are rejected before detail work; the remaining small
  polygons use the same curved projection with redundant clip passes removed.
- Scenery is rejected before sorting/drawing if it is offscreen or wholly buried
  behind the crest. Visible projections use pooled records rather than being
  calculated a second time. Crest masking is applied once, not twice.
- Static native models are prepared at 64/128/256 **physical-pixel** width tiers.
  A tier is only used at or below its resolution. Large close trees stay vector
  drawn; far translucent models retain per-plane alpha. Cached opaque models use
  source cropping for crest reveal. No generated sprite design was brought back.
- A stationary distant background is cached at current screen resolution.
  Turning keeps the actual moving parallax. Resize/orientation changes invalidate
  the background; all canvas buffers share the 5 MiB cap and clear on exit/reset.
- Meter text changes only when the displayed value changes. No resolution cap,
  tree density, path art, obstacle logic or frame skipping was used as a shortcut.

Run `node tools/morning-forest-audit.cjs` for functional/visual evidence and
`node tools/morning-forest-performance.cjs` for a reproducible comparison with
populated Journey (desktop and phone viewport/DPR emulation). The performance
audit compares the archived `output/morning-performance/before-native.js`, the
current lab, and seeded normal Journey, with no overlapping test browsers.
The report distinguishes CPU command-submission time from actual scheduled
frames; neither certifies FPS on a physical phone or the user's 165 Hz display.

## Archived revision 01

Brief: an independent playable morning-forest art trial. Reference environment:
the approved Gatherer's Clearing, `../knight-rush-backgrounds/approved/gatherer-clearing.png`.
Native Jonathan/horse remain live and unchanged. Old run artwork, night palette,
old giant-tree art and minigame placeholders were NOT visual references.

Skills: Knight Rush Cutscene for spatial/light/material clarity; Knight Rush Art
for crisp massing and live-character identity; built-in ImageGen for new bitmap
trees/props. No Blender needed for this straight path / one right junction.

## Scene contract

- Camera, curved ground, crest occlusion, painter queue, controls and the 0.62 s
  corner come from Journey. This is NOT a scrolling screenshot.
- Warm upper-left morning sunlight, cool foliage shadow, blue-green sky.
- Far quiet woodland; independent irregular tree groups; rooted verge fans,
  occasional flowers, mossy rock and fallen wood; warm earth path in world space.
- Native knight, horse, input/HUD. No baked actor or UI in the environment art.
- Four straight-course hazards and three branch-course hazards. No damage/boss/
  rewards in this visual sandbox. Right junction at 240 m; choose the right lane
  and swipe right near the junction. Missing it continues straight.
- Original game/Forest Test unchanged. Only `?morninglab=1` loads this runtime.

## Sources and generation prompts

Source files are non-destructive generated candidates. All generated with the
built-in image tool, no API-key/CLI fallback. The approved plate was used only
as a style/lighting reference, never an edit target.

Tree generation template (one call per design):

> One SINGLE isolated full-grown deciduous tree for a 2.5D game billboard sprite,
> genuine transparent RGBA background, no other objects or sheet. Show entire
> leafy crown and all root feet completely inside frame with 8% transparent
> padding on every side. Tall portrait composition. Eye-level front-three-quarter
> view, no isometric perspective. Match reference's Knight Rush sharp-plane art:
> crisp angular leaf clusters, broad material planes, warm amber sunlit bark and
> cool teal shadows, vibrant spring yellow-green leaves, fresh sunny MORNING from
> upper left. Not pixelated, not blurry, no halos, no tiny noisy triangles. No
> ground slab, no shadow outside roots, no house, no grass foreground, no text.
> Reference is style only. Tree design:

- `oak.png`: A magnificent mature oak with a thick knotted slightly bent trunk,
  spreading horizontal limbs and broad asymmetrical canopy with several distinct
  leaf masses.
- `beech.png`: A tall slender beech with two elegant forks, pale warm bark, open
  spaces between high branches and a narrower light green crown. Different
  silhouette from a broad oak.
- `lean.png`: A medium old oak leaning to the left, strongly angular lower side
  branches, irregular wide fresh green crown with a gap showing branch structure.

Final cleanup prompt for each tree (built-in edit, own generated tree as target):

> Precise background removal, NOT new art. Preserve this entire tree exactly.
> REMOVE ALL of the yellow/green/brown fuzzy glow outside the physical solid tree.
> REMOVE ALL black background. Output a sharp clean sticker cutout on real
> transparent alpha, with alpha ZERO anywhere there is not an actual solid leaf,
> branch, trunk, or root. No bloom, no aura, no haze, no light rays, no feathered
> falloff, no colored ambient wash. Keep internal painted light and shadow on
> solid tree surfaces unchanged. Restore any missing outer leaf tips so no leaves
> are cut by canvas edges, with at least 5% completely EMPTY transparent margin.
> Do not generate a new backdrop. DO NOT add a shadow. Crisp hard silhouette with
> only ordinary one-pixel antialiasing, all open sky spaces between branches also
> transparent. Same tree shape and colors.

`props-source.png` is the earlier six-part atlas candidate. Its three lower
islands are used: fern/daisies/purple flowers, mossy grey rock, sideways mossy log.
Trees from that sheet are NOT used (insufficient packing gutters). The brief
specified the same sharp-plane morning palette, eye-level front/three-quarter
objects, genuine transparent background, no ground rectangle/text/actor, with
the lower third divided into those three isolated props. The follow-up asked
to preserve artwork while separating the six cells with transparent padding.
The tree-only alternatives and discarded packing drafts remain in the tool's
generation archive; they are not runtime dependencies or approved references.

## Packaging / runtime budget

`node tools/build-morning-forest-assets.cjs` trims only empty margins, resizes and
packs the six source islands into non-overlapping cells. No creative repaint,
colour filter or source mutation. Standard: 1920×1536 / 11.25 MiB RGBA. Mobile:
960×768 / 2.8125 MiB RGBA. One selected atlas only; never both device tiers.

The shared `KREventVisualsFactory` owns this run-specific one-entry manager with
12 MiB standard / 4 MiB constrained budget. This is NOT a cutscene session: the
road keeps moving. Restart reuses the atlas; exit/reset releases application
references. Native code paints the path, leaf fans and duck-branch. No pixel
readback or per-frame image filtering, old GPU-floor cache, or per-tree bitmap.
Browser decoding, GPU copies and the main canvas add memory beyond these figures.

## Review / limitations

Entry: `../../MorningForestTest.html` or `KnightRush.html?morninglab=1`.
Audit: `node tools/morning-forest-audit.cjs`. Evidence: `output/morning-forest/`.
Tests cover real corner input, update, layering, phone frames, one selected
mobile texture, reset cleanup and no asset loads on normal game boot.

Still a first candidate: only three tree silhouettes, one biome, one right turn;
ground/verges and the code-drawn duck branch are simpler than the approved
cutscene. Distant backdrop is an atmospheric layer, not traversable geometry.
Trees face the camera during turns (2.5D sprites), not rotatable 3D models.
No physical-phone FPS claim, no final art approval and no replacement of PLAY.
