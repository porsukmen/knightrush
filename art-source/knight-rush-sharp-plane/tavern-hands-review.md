# Tavern hands — 2026-09-27

User requested all tavern NPC hands be rebuilt like the approved merchant and
Mushroom Gatherer: shallow simple palms, visible finger divisions, no extra
thumb or inflated individual fingers. Follow-up approved the new shape but
asked for larger hands relative to forearms. Final palms are 1.18 times the
initial revision; table/cloth contacts stay anchored at the fingertip edge.

Scope: Barry, Duke, Royal Shuffle dealer (rest and card presentation), Sir Chugs
(rest and drinking), Oakbreaker (rest and shared wrestling grip), innkeeper
(rest and wiping). Legacy tavern presentation fallback uses the same grammar.
The paired knight grip in arm wrestling was simplified with the rival's grip;
the normal Jonathan model and his other in-game hands are untouched. Faces,
body geometry, material palettes, rig endpoints, game rules and UI are unchanged.

## Reference gates

Read canonical Knight Rush Art skill and approval registry. Reopened live Art
Lab before and after edits; inspected full approved overview, merchant and
gatherer isolated models, then their real palm/cuff render code. Knight and
bear remain massing anchors; no excluded character was used as a reference.
The concrete construction lesson is a single clipped rectangular palm, broad
front, narrow side, small upper highlight and three short finger lines. Volume
does not require a separate thumb polygon or individual sausage-like fingers.

Evidence in output/tavern-hands: before/live-reference-overview.png,
before/reference-merchant.png, before/reference-gatherer.png, corresponding
after references; hands-before-after.png, characters-before-after.png and
motion-before-after.png. Before sources are preserved in the before directory.
The comparison script executes those original renderers in an isolated browser
page, including clearing the inn module's duplicate-load guard. It does not
reconstruct an old model, replace current source or change protected baselines.
All pairs use identical state, time, camera/crop and native 2x render scale.

18 deterministic poses cover cup lift, dealer presentation, mug lift and tip,
wrestling center/both lean directions, and both wiping extremes. Color and
small silhouettes were inspected alongside unchanged live merchant/gatherer.
Final 18% enlargement keeps the approved new contour; fingertips remain on
counter/cloth, handle/grip attachments remain at existing rig coordinates.
Actual phone and desktop game captures are in output/tavern-redesign.

## Checks

- tavern-hands-review.cjs before/after: six actors, 18 poses each, no JS errors
  or rendering changes to mode, gold or distance.
- tavern-games-audit.cjs: desktop + phone, five games, input/outcomes/return,
  rendering purity, selected plate budget and release; rerun after enlargement.
- innkeeper-art-audit.cjs: 601 rig samples, 18 renders; fixed lengths/contact,
  layering and state checks; rerun after enlargement.
- Dedicated chug and arm audits passed during initial hand revision, including
  rig, both outcomes/input, projected mug contact and resource release.
- art-lab-audit.cjs flags KRDukeBluff.actor: expected protected baseline
  mismatch because this user-requested revision intentionally changes its hands.
  No protected reference hash or approval was updated to silence it. The old
  pre-existing Barry mismatch also remains outside this task's approval work.

The user liked the initial new hand shape; the larger version is presented for
review. Do not promote these revised renderers to approved baselines implicitly.

## Handedness correction — all characters

User clarified that left/right handedness applies to the full cast, not just
tavern actors. Preserve the accepted compact shape and 1.18 tavern hand scale.
Mirror the palm/finger geometry locally at its wrist using arm identity, never
the moving wrist's screen position. Do not mirror the whole arm or held prop.

Corrected Barry, Duke, innkeeper, Chugs, Oakbreaker's rival grip, fallback tavern
actors, tax collector, both merchant presentations, Gatherer's asking palm,
roadside NPC helper and smith hand details. Royal Shuffle already mirrors its
resting pair and presentation hand; symmetric knight/dwarf blocks and the
Disco King's side-aware gesture need no silhouette flip. Merchant reflection
is applied in rig coordinates before the road-facing projection, preserving
roadside wrist contact as well as the frontal shop view.

Pre/post live Lab overview and merchant/Gatherer close-ups were inspected.
The 18-pose hand board and motion board show opposite clipped edges and finger
directions; mug/cloth/shared-grip attachments remain connected. Desktop slide
and phone drink scenes were inspected. Tavern desktop/phone audit and innkeeper
601-frame contact audit pass. Tax collector loads normally with ready cutscene;
its older RAF-disabled audit times out at startup, so that full audit is not
reported as passing. Art Lab protected renderer hashes intentionally flag these
requested edits; no approved baseline was overwritten.
