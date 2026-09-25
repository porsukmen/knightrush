# Knight Rush

The game lives in `KnightRush.html`. Preserve unrelated working-tree changes.

## Art tasks

For character, item, environment, or animation artwork, use
`tools/skills/knight-rush-art/SKILL.md`, the self-contained style contract.
Start visual reference work in Art Lab using its approved live models, selected
through `art-source/knight-rush-sharp-plane/art-references.js`. Do not routinely
read the archived `ART_STYLE_KESKIN_DUZLEM.md` or `ART_WORKFLOW.md`, or use old
full-scene screenshots as character/style references. Character references
exclude their backgrounds and UI; technical baselines remain protected.

Original knight/boss/miniboss massing is the foundation. Approved merchant and
revamped Disco King provide NPC detail, expression and material references.
Prototypes, rejected work, and old minigame placeholders are not style anchors.
Do not equate a passing render test with aesthetic approval.

Art Lab: `ArtTest.html`. Automated check: `node tools/art-lab-audit.cjs`.
Read the skill for dependencies, review stages and evidence expectations.
Art Lab and its instrumentation must not run during normal gameplay.

For cutscene/event environments, also use
`tools/skills/knight-rush-cutscene/SKILL.md`. The approved crisp Mushroom
Gatherer clearing is registered in
`art-source/knight-rush-backgrounds/cutscene-references.js` and Background Lab.
It is an environment quality anchor, not a forest-only template. Blender is
optional. Scene-lighting overrides must preserve native character identity.
Basalt Hearth v4 is the approved interior reference in Background Lab
(`?backgroundlab=1&scene=basalt-forge`); Borin is separately approved in Art Lab.
Use the registries' exact versions, not earlier Basalt candidates.

For themed running roads, also use
`tools/skills/knight-rush-special-road/SKILL.md`. Its reference catalog at
`art-source/knight-rush-special-roads/road-references.json` registers Crimson
as natural (blended boundaries) and Disco as man-made (hard built-surface
boundaries), including obstacles, decorations and central event venues.
Keep the existing road/tree system; inspect the current Journey Road Lab.

Special Road Creator reference lab: `RoadCreatorLab.html` (`?roadcreatorlab=1`).
All six current roads are explicitly user-approved in `creator-references.js`;
locked images/source provenance are in `creator-baseline.json` beside it.
F10 remains the playable Road Lab. Art Lab includes the approved seated merchant
and Barrel Barry (rebuilt torso/arms; neutral isolated character only).
Rebuilt innkeeper v2 was reapproved 2026-09-26 after the receding-hair and forward
shoulder-layer fixes. Use the current isolated Art Lab model, not withdrawn v1.
Cutscene Lab retains the approved Autumn Caravan v1 and Mossy Oak Inn v4
environments; its archived inn composite still contains the superseded actor.
These approvals do not automatically approve later changes or older variants.
