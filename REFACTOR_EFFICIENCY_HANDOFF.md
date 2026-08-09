# Knight Rush Efficiency and Scaling Handoff

Status: targeted old-device refactor completed 2026-07-23. Read this after the maintainer block in `KnightRush.html` when changing render architecture, caches, or encounter ownership. This pass intentionally did not change attack timing, collision, progression, approved art, or encounter selection.

## What changed

- `createAngleClip()` stores prepared angles in one near-square atlas instead of one canvas per angle. `drawAngleClip()` selects the matching source rectangle.
- Turtle's heavy 12-frame, raster-scale-5 shell cache is lazy through `turtleShellSpinClip()`. It no longer reserves roughly 14 MB of pixel backing storage at the title screen. The approved shell-wheel output is unchanged.
- `buildBearModel3D()` is lazy through `bearModel3D()`. Normal runs and the production 2D Mighty Bear never construct the lab-only mesh or WebGL target.
- `fillLocalContacts()` and two shared scratch arrays replace Hydra/Turtle/Wolf/Imp per-frame contact `.map()` arrays.
- `p3hex()` caches parsed RGB triplets. Depth rendering no longer reparses and allocates the same color array for every triangle.
- Wolf and Bear triangle submission no longer create a temporary `[a,b,c]` array per triangle.
- Wolf's Canvas fallback reuses projected vertices and face records from bounded pools rather than rebuilding them every frame.
- Boss and miniboss world rendering use `drawActiveBossWorld` and `drawActiveMinibossWorld`; the main render loop no longer creates two closures per active frame.
- Removed genuinely unreachable code: the obsolete Bear mesh builder, unused CPU rasterizer, unused ear/joint helpers, and the unregistered failed Bear route-matching/iterative-IK combat path. The production 2D Bear and native lab-only `bear3d` path remain.
- Main HTML fell from about 635 KB to about 604 KB before documentation edits, mostly by removing the failed Bear route rather than minifying live code.

## Ownership hierarchy for future content

Keep this direction as the boss catalogue grows:

1. `STAGES` owns stage composition and encounter id pools.
2. `RUN_POLICIES` owns flow, eligibility, rewards, and continuation.
3. `ENCOUNTERS` owns one immutable `EncounterDefinition` per boss/miniboss.
4. Shared combat semantics belong in `EncounterCombatMechanics`; miniboss access remains the restricted frame-only view.
5. Species attack tables own only move data and genuinely species-specific recovery/hesitation fields.
6. Species renderers own art geometry, pose sampling, and visual-only caches.
7. `EncounterActor` owns mutable fight state; never put mutable runtime state in a definition.
8. Collision consumes scheduled frame hits or boss-only sampled contacts. Cached 2.5D pixels never become collision truth.

Adding a boss should normally mean one definition, one renderer, and one attack table. Do not add new boss-id switches to the shared update/render loop. A special visual technique should be behind one species renderer or a reusable helper, not spread through encounter state.

## Allocation and cache rules

- Heavy assets are lazy unless the title screen visibly needs them.
- A prepared multi-angle clip owns one atlas, not N canvases.
- Caches are immutable after construction and bounded by authored content.
- Hot render/update paths reuse scratch arrays/objects; reset `.length` or overwrite fields.
- Never use unbounded memoization on continuous animation values. `p3hex()` is safe because its keys come from a finite authored palette.
- Do not create a canvas, WebGL context, typed buffer, closure, projected-face object, or random art sample inside a per-frame species draw.
- Keep visual caches outside `EncounterDefinition`; definitions must remain lightweight, immutable data.
- Failed experiments do not stay connected “just in case.” Preserve their design lesson in handoff text, then remove the unreachable runtime graph.

## Reversibility boundaries

There is no usable Git history in this workspace (`.git` is empty), so reversibility must remain architectural:

- The live Turtle front renderer is still the source/rollback path; the cached clip is invoked only by shell-wheel.
- `createAngleClip()` and `drawAngleClip()` form one replaceable cache boundary.
- `turtleShellSpinClip()` is one replaceable species cache accessor.
- `bearModel3D()` is one replaceable lazy construction boundary; `MIGHTY BEAR` remains independent 2D.
- Shared scratch helpers affect storage only, not values or combat rules.
- Named world callbacks contain the exact former render bodies and can be moved without touching queue ordering.

Before a risky future refactor, make a recoverable copy or initialize proper version control. Do not depend on obsolete functions being left in the production file as a rollback strategy.

## Verification performed

- Normal 480x800 headless Chrome startup reached the title screen.
- Turtle shell-wheel was frozen on a real strike frame: lazy construction succeeded and the single atlas drew the approved shell correctly.
- Lab-only 3D Bear opened and rendered after lazy model construction.
- A final startup test is required after any later source edit.
- No 30/60/120 collision sweep was needed for this pass because no timing, movement, hit geometry, or resolver code changed.
- Temporary smoke hooks must be removed, Chrome processes stopped, and all `knight-rush-refactor-*` temp profiles/screenshots deleted after verification.

## Next audit priorities (only when profiling justifies them)

- Cache Boss Lab's boss-definition menu list after encounter registration if menu profiling shows repeated filtering matters.
- Reuse pose blending storage in turntable-only tools if lab performance becomes a problem.
- Consider splitting the single HTML into build-time modules only after a reliable bundling/version-control workflow exists. Runtime registries already provide the logical hierarchy; a premature file split adds deployment risk without improving frame time.
- Measure on an actual low-end phone before reducing approved raster density. Memory should first be saved through lazy construction, atlases, and bounded reuse—not by making close-up art blurry.
