# Oathkeeper model candidate 01 — 2026-10-02

Follow-up: user explicitly liked the body, pointed out reversed hands, requested
moves, and prioritized front/side optimization. The body proportions are retained;
see `oathkeeper-moves-review.md` for the subsequent hand/motion/rendering changes.
The v1 scope and findings below are historical evidence, not the current moveset.

Request: the sword-bearing stone opens its eyes when gripped, then rises from
underground as an intimidating, man-made stone golem. This is an authored native
3D candidate in the standalone Combat Lab, not an approved reference or boss
moveset. The grip button currently substitutes for a real knight-hand contact.

## Reference gates

Before design, inspected the live Art Lab overview and isolated `knight`, `bear`,
`barry`, and `basalt-dwarf`; then read the applicable renderer/pose code. Bear:
small head and broad shoulder weight. Barry: separately readable upper arms,
elbows, forearms, and planted palms with fixed lengths. Borin: broad material
planes and compact joints. Knight: squared silhouette and material separation.
Treasure current-system/states were inspected separately for the Lab UI.
Neither Disco King nor Oakbreaker was used as a character anchor.

Final review reopens the live references and captures them beside the candidate
in `output/oathkeeper/reference-comparison.png`; reviewed close/small size,
color/grayscale/silhouette, front/quarter/profile/back, nine emergence samples,
and actual desktop/390px Lab layouts. These are neutral Lab scene checks only;
no claim of production encounter integration or scene-lighting approval.

## Findings and repairs

- Initial shoulder tops betrayed the buried body: lower the dormant root until
  all shoulder surfaces are below ground; start with a head-sized contact shadow.
- The first palette was too bleached: use cooler green-grey masonry planes with
  distinct moss and orange inset eyes, keeping the existing sword's colors.
- Hand contacts initially clipped too deeply: raise the planted wrist target to
  keep the tilted stone fingertips at ground level while the torso rises.
- Final side-by-side inspection exposed diagonal surface fragmentation: top-face
  winding reversed a shared ring array and twisted side quads. Copy before
  reversing. Broad intact planes now read consistently with the approved anchors.
- Phone footer labels overlapped: remove redundant renderer text from the canvas.

The model has an intentionally regular carved mask, shoulder grooves, masonry
collars and large forearms rather than a pile of natural boulders. No glow blur,
full-scene filter or random surface fractures. Its final menace/proportions still
need the user's aesthetic review; tests are not art approval.

## Verification and limits

- Fixed-length arms sampled at 60 Hz through all seven seconds; maximum length
  error below 1e-14; planted wrist targets stable during the bracing interval.
- Finite geometry, dormant shoulders below Y=0, eye closure/opening, WebGL output,
  trigger, scrub, pause/single-step/reset, desktop/phone bounds and page errors.
- Combat core: 24 checks; desktop/phone browser checks pass. No production script,
  iframe or save access is added by this Lab.
- Art Lab: 35 reference symbols, 13 sampled models, no motion warnings.
- UI button material audit passes. Broad UI system/action audits remain blocked
  by the existing unrelated Road Lab null `journey.nodes` fixture.
- No production attachment, real knight-grip animation, combat attacks or damage.
  The Canvas fallback is diagnostic; WebGL is the reviewed primary path.
