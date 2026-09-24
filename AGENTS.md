# Knight Rush

The game lives in `KnightRush.html`. Preserve unrelated working-tree changes.

## Art tasks

For character, item, environment, or animation artwork, use
`tools/skills/knight-rush-art/SKILL.md` and its task-relevant references.
Start with `ART_STYLE_KESKIN_DUZLEM.md`; the approved reference list and current
technical baselines live in `art-source/knight-rush-sharp-plane/`.

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
