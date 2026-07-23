# Miniboss Frame-Hit Update Handoff

Status: frame-only miniboss fundamentals implemented and architecture-audited on 2026-07-21. The next session should author and tune the actual miniboss update without rebuilding collision architecture.

Separate persistent art handoffs: read `CACHED_2_5D_RENDER_HANDOFF.md` before any rotation/back/profile clip, and read `3DMODELRENDER_HANDOFF.md` before changing an articulated live-3D boss. Turtle's shell-wheel is the approved production 2.5D proof; Bear remains a lab-only live-3D reference. This does not alter the frame-only miniboss rules below.

## Settled direction

- Miniboss attacks use scheduled frame hits only.
- Minibosses do not use model contact rigs, traveling swipes, or pinches.
- Required collision vocabulary is ready for:
  - one-lane normal hits;
  - two-lane normal hits;
  - one-lane jump and duck hits;
  - two-lane jump and duck hits;
  - three-lane jump and duck hits.
- Existing miniboss balance, animations, timings, combos, rewards, progression, and counter-duel behavior have not been redesigned yet.

## Exact hit-class names

`MINIBOSS_HIT_CLASSES` contains only these eight frame classes:

- `frameOneLane`
- `frameTwoLane`
- `jumpOneLane`
- `duckOneLane`
- `jumpTwoLane`
- `duckTwoLane`
- `jumpAll`
- `duckAll`

`jump` means the attack is low and the knight must jump. `duck` means the attack is high and the knight must duck. The class records both posture and lane count; the attack step's `lanes` array records the actual left/middle/right placement.

Startup validation checks role, resolver, lane count, and posture. A miniboss step with a `contactId`, sweep, pinch, model class, wrong lane count, or wrong height fails immediately.

Model collision, physical swipes, and pinches are boss-exclusive. Boss classes also carry lane/posture metadata, so incorrectly labeled boss geometry fails the same hierarchy validation.

## Authoring mechanics already available

Use `MinibossCombatMechanics.attack(...)` or `MinibossCombatMechanics.step(...)`. Do not author miniboss content through the unrestricted boss factory.

`MINIBOSS_FRAME_MECHANIC_KEYS` is the single frozen allowlist. `MINIBOSS_FRAME_MECHANICS` is generated from that list by reference to the universal frozen specifications; it does not copy or manually restate their data. Add a future frame pattern to the universal catalogue and this allowlist once. Do not rebuild a second miniboss timing table.

Normal frame mechanics:

- `targetLane`, `singleLeft`, `singleCenter`, `singleRight`
- `pairLeft`, `pairRight`, `outerPair`

One-lane posture mechanics:

- `jumpTargetLane`, `jumpLeft`, `jumpCenter`, `jumpRight`
- `duckTargetLane`, `duckLeft`, `duckCenter`, `duckRight`

Two-lane posture mechanics:

- `jumpPairLeft`, `jumpPairRight`, `jumpOuterPair`
- `duckPairLeft`, `duckPairRight`, `duckOuterPair`

Three-lane posture mechanics:

- `jumpAll`
- `duckAll`

Authored raw tables are also supported. `MinibossCombatMechanics.normalizeSet()` infers the appropriate mechanic and hit class from `lanes` plus `height`, while preserving explicitly authored miniboss timings when requested.

## Runtime and Move Lab

No new collision resolver was added. The existing frame resolver already handles arbitrary one-, two-, or three-lane arrays with `mid`, `low`, or `high` posture rules. Telegraphs, perfect checks, Move Lab geometry, stage tempo, FPS behavior, and counter rewards therefore reuse the current path.

The miniboss state machine now always calls `spawnHazard(...)`. Old sweep spawning, body-sweep recovery, and sweep-render branches were removed as unreachable. Bosses retain their model and physical-sweep routes in the boss state machine.

Current Wolf, Serpent, and Imp tables normalize through the restricted miniboss factory. Their accepted timing and gameplay remain unchanged. The next update may replace their moves and animations deliberately.

## Next-session checklist

1. Read this file completely.
2. Inspect the current Wolf, Serpent, and Imp tables and renderers before editing.
3. Decide which miniboss is updated first.
4. Prefer one-lane jump/duck attacks where intended; the two- and three-lane versions remain available for future species and combos.
5. Preserve the optional counter-duel structure unless the user explicitly changes it.
6. Test every materially changed move in Miniboss Move Lab. Run 30/60/120 FPS sweeps when timing, collision, or animation geometry changed—not repeatedly after text-only or registry-only edits.
7. Finish with hierarchy, frame-only validation, reuse, allocation, browser, process-cleanup, and dead-code checks.

## Credit-efficient working rule

Use targeted `rg` searches and narrow file ranges. Read this handoff once, then inspect only the miniboss table, renderer, or shared function currently being changed. Reuse the existing architecture and browser harness. Batch related static checks into one command and use one final browser pass per coherent implementation checkpoint. Do not repeat expensive FPS scans when no timing or collision behavior changed. Always terminate browser/test processes and delete temporary profiles/scripts after verification.
