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
