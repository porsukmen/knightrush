---
name: knight-rush-art
description: Create, refine, and visually verify Knight Rush character, item, environment, and animation art against its approved in-game models.
---

# Knight Rush art

Resolve paths below from the Knight Rush repository root (three levels above
this skill directory). This is an art workflow, not a gameplay redesign.

For cutscene/event background composition and matching a live character to scene
lighting, also follow `tools/skills/knight-rush-cutscene/SKILL.md`. Its approved
environment registry is separate from the character reference hashes below.

Read `ART_STYLE_KESKIN_DUZLEM.md` and
`art-source/knight-rush-sharp-plane/ART_WORKFLOW.md` before changing artwork.
Use `art-source/knight-rush-sharp-plane/art-references.js` to locate the relevant
approved renderer, visual reference and the candidate. Open the actual approved
images and inspect the relevant renderer implementation; names like "pixel" or
"sharp plane" alone are not specifications.

For NPCs, compare the knight/boss/miniboss blocky massing with the approved
merchant and revamped Disco King detail. Reuse the existing `rigPolygon`,
`rigSegment`, `rigJoint`, `px`, material colors and articulated attachment
patterns. These helpers use `U` units; `expPoly` / `expSegment` use canvas units.
Do not mix units or duplicate an approved renderer to make a disconnected copy.

Use `ArtTest.html` for side-by-side native-resolution views and time scrubbing.
Develop in silhouette, volume/material, then detail/animation passes. At each
meaningful pass inspect the candidate beside approved anchors at both close-up
and small road scale. Fix visible mismatches before adding more detail. Use the
lab's real-time checks while experimenting; use the repeatable audit for handoff.

Run `node tools/art-lab-audit.cjs` from the repository root (requires Playwright,
Edge, and @napi-rs/canvas). On this host the existing dependencies are under
`C:/Users/Altar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules`;
set `NODE_PATH` for that command if Node cannot resolve them. The tool emits
frames, a contact sheet and a technical report under `output/art-lab/`.
Inspect the images, not just the exit code. Also run the relevant feature audit
and inspect the real game scene: the isolated board cannot prove world-layering,
road projection or dialogue composition.

Treat automated failures as concrete bugs and warnings as review requests.
Unchanged approved-reference fingerprints protect against accidental edits;
do not update their baseline to make a failing test green. User authorization
to change a reference is needed first. A prototype never becomes approved just
because a script passed. Report technical results and visual judgments separately,
including any unresolved aesthetic issue. Preserve the user's existing accepted
art and do not broaden a one-character request into a scene-wide revamp.
