# Blacksmith art rollback point

Saved before the Keskin Düzlem workshop experiment. `renderer.js` is a source
snapshot, not a script loaded by the game. `approved-before.png` is the previous
native-canvas forge screenshot.

To restore only this artwork, replace the contiguous block beginning with
`function drawSmithForgeBackdrop(){` and ending immediately before
`function drawSmithCounter(` in KnightRush.html with renderer.js. Review the
diff first if any later task has modified this block. Do not restore the entire
HTML: purchases, progression, UI and unrelated changes are intentionally excluded.

The block also preserves the existing pose/acting functions verbatim. The new
experiment does not change those tracks, input, economy or menu layout.
