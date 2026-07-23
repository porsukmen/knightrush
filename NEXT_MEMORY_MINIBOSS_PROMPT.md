# Prompt for the next memory

Continue the Knight Rush miniboss update in `C:\Users\Altar\Desktop\knight rush\knight rush fable finish.html`.

First read `MINIBOSS_FRAME_UPDATE_HANDOFF.md` completely. Read `REFACTOR_EFFICIENCY_HANDOFF.md` before changing caches, render ownership, encounter hierarchy, or hot loops. Before any rotation, profile, rear-view, roll, or perspective-changing art, read `CACHED_2_5D_RENDER_HANDOFF.md` completely; Turtle's shell-wheel is the approved production method. Before articulated live-3D boss work, also read `3DMODELRENDER_HANDOFF.md` completely; Bear is a lab-only reference, not the default production route. Then read the maintainer handoff at the top of the HTML and inspect only the systems relevant to the requested task. Do not rebuild or rename the finished fundamentals unless you find a concrete defect.

Settled architecture:

- Minibosses are frame-hit only.
- Supported hit classes are `frameOneLane`, `frameTwoLane`, `jumpOneLane`, `duckOneLane`, `jumpTwoLane`, `duckTwoLane`, `jumpAll`, and `duckAll`.
- Model contact, `contactId`, traveling swipes, and pinches are boss-exclusive.
- Use the restricted `MinibossCombatMechanics` factory. It is generated from the frozen `MINIBOSS_FRAME_MECHANIC_KEYS` allowlist and shared universal specifications.
- The miniboss runtime always uses `spawnHazard`; do not restore sweep/model branches.
- Prefer one-lane jump/duck moves for the upcoming design where appropriate. Two- and three-lane versions are available for future attacks and combos.
- Preserve the optional counter-duel flow, existing balance, tempo, rewards, progression, and unrelated boss work unless I explicitly request changes.

Work credit-efficiently. Use targeted `rg` searches and narrow code ranges instead of rereading the full HTML repeatedly. Reuse existing helpers and batch related edits/checks. Run proportional tests: use a quick browser/startup validation for structural edits, and run 30/60/120 FPS or deep-stage scans only when collision timing, movement, or animation geometry actually changes. Avoid repeated equivalent probes. Use temporary test scripts only when necessary, close every browser/test process in guaranteed cleanup, delete temporary profiles/files, and report the cleanup. Explain changes to me in simple language and pause for design feedback at meaningful gameplay checkpoints.
