# Disco King — Keskin Düzlem revamp

Open `DiscoTest.html` / `KnightRush.html?discolab=1`, the existing Minigames card,
or the real Journey disco-road finale. The original Journey host adapter remains:
distance is frozen during the event and exiting settles its existing result once.
This art/gameplay revision does not introduce a new artifact or payout rule.

## Play

King starts seated, rises and steps onto the floor. Three rounds each contain
five moves. He demonstrates **the entire five-move sequence first**. After a
short handoff the player recalls that sequence, in order, with five swipes.
Left/right mean the viewer's left/right, up means reaching up, down means
crouching. No mirrored-body guesswork and no next-move hints during recall.

Each demonstration move lasts 1.05 seconds: enter, hold, return to neutral, then
a small gap, so consecutive identical directions remain readable. A .45-second
lead-in and .65-second handoff separate watching and playing. The whole player
turn has 12 seconds; there is no hidden beat-line target or per-move lockout.
Fast swipes are accepted and queued for Jonathan to perform in order, including
repeated directions. One touch gesture is consumed once by the shared input host.
Responding within .8 seconds of the last accepted move (or turn start) counts
toward the existing `perfects` field. Show/rise/handoff inputs are ignored, not
punished. A wrong direction or turn timeout loses the round. The result waits
for queued player animations to finish. Escape/pause freezes all of this.

There are no direction arrows, sequence cards, lanes, note highway or progress
indicators. Short turn/response text and start/exit controls remain. Arrow keys /
WASD are supported by the existing input host. A rear-view, on-foot Jonathan
stands on the near end of the floor facing the King. His real helmet and shield
renderers preserve the gameplay identity, with jointed arms/legs copying each
accepted swipe (including wrong directions), easing in and returning to idle.

## Art and architecture

Actual `drawTreeArt(..., disco=1)` trees reuse the purple special-road palette.
Native-resolution cached scenery has supported string lights, a mirror ball,
PA speakers, a raised throne and opaque perspective floor tiles. King is a new
jointed human-scale rig: original King's gold sequined robe, purple cape, black
opaque sunglasses and crown, now with a white beard, green moustache and broad smile.
Flared sleeves and gilt trim carry the showman's silhouette; the audience is
scaled to the same human proportions rather than appearing as tiny figurines.
The left/right reach, both-arms-up and low crouch poses share one continuous rig.
The floor draws before the throne so it cannot cut through the throne feet.
Four dedicated royal disco courtiers replace the town bystanders. Their gold-trim
outfits, sunglasses, hair and dance/clapping loops differ: alternating lifted
steps, hip sway, shoulder lean, overhead claps and alternating arm pumps.
Successful swipes smoothly raise their cheering: `crowdCheer` eases in/out in
update, while every limb amplitude interpolates continuously. Input, judgment
expiry and round changes never reset the dance clock or snap between poses.
Their animation, like the King's and Jonathan's, uses the paused scene clock.
The shared old crowd helper is left intact for other minigames.

The old Disco source is archived in `art-source/disco-before-sharp-plane/`.
That snapshot is not loaded by the game. Don't restore the entire HTML to roll
back art; the old rhythm rules differ from the new call-and-response state machine.

## Tests

```
node tools/disco-revamp-audit.cjs
node tools/disco-revamp-browser-audit.cjs
node tools/journey-disco-browser-audit.cjs
node tools/journey-road-events-browser-audit.cjs
node tools/minigame-port-audit.cjs
```

Browser tests use Edge with real touch events; this is not on-device phone
performance validation. Screenshots: `output/disco-revamp/`.
