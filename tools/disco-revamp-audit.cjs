const assert=require('node:assert/strict');
const {run,shot,canvas}=require('./journey-render-audit.cjs');
run('SFX.toggle();startDiscoDance();flashA=0;shakeMag=0;');
shot('disco-new-intro','');
assert.equal(run('typeof drawDiscoHighway'),'undefined');
assert.equal(run('typeof drawDiscoSequenceStrip'),'undefined');
run('beginDiscoRun();');assert.equal(run('discoGame.phase'),'rise');
assert.equal(run("handleDiscoSwipe('left')"),false);
run('paused=true;updateDiscoDance(4);');assert.equal(run('discoGame.phaseT'),0);
run('paused=false;updateDiscoDance(DISCO_RULES.riseTime);');assert.equal(run('discoGame.rise'),1);
function showAllMoves(){
  assert.equal(run('discoGame.phase'),'show');
  const sequence=JSON.parse(run('JSON.stringify(discoGame.sequence)'));
  run('updateDiscoDance(DISCO_RULES.showLead+.35)');
  for(let i=0;i<5;i++){
    assert.equal(run('discoGame.showCue'),i);assert.equal(run('discoGame.kingPose'),sequence[i]);
    assert.equal(run("handleDiscoSwipe('left')"),false,'watching must not consume inputs');
    assert.equal(run('discoGame.inputIndex'),0);
    assert.equal(run('discoKingMoveAmount(discoGame)'),1);
    assert.equal(run('discoKingMoveAmount({...discoGame,phaseT:DISCO_RULES.showLead+discoGame.showCue*DISCO_RULES.demonstrate+.96})'),0,'repeated directions need a neutral gap');
    run('updateDiscoDance(DISCO_RULES.demonstrate)');
  }
  assert.equal(run('discoGame.phase'),'ready');assert.equal(run('discoGame.kingPose'),null);
  assert.equal(run("handleDiscoSwipe('left')"),false);
  run('updateDiscoDance(DISCO_RULES.readyTime)');assert.equal(run('discoGame.phase'),'input');
}
for(let round=0;round<3;round++){
  if(round===0)run("discoGame.sequence=['left','left','right','up','down']");
  showAllMoves();
  for(let move=0;move<5;move++){
    assert.equal(run('discoGame.phase'),'input');
    assert.equal(run('discoGame.kingPose'),null,'King must not reveal the next remembered move');
    if(round===0&&move===0)shot('disco-new-input','');
    run('updateDiscoDance(.4);handleDiscoSwipe(discoGame.sequence[discoGame.inputIndex]);');
    if(move<4)assert.equal(run('discoGame.phase'),'input');
  }
  assert.equal(run('discoGame.phase'),'reply');assert.equal(run("handleDiscoSwipe('left')"),false);
  run('updateDiscoDance(4)');
  assert.equal(run('discoGame.phase'),'roundResult');run('updateDiscoDance(DISCO_RULES.resultTime)');
}
assert.equal(run('discoGame.phase'),'complete');assert.equal(run('discoGame.wins'),3);
assert.equal(run('discoGame.perfects'),15);shot('disco-new-complete','');
for(const direction of ['left','right','up','down']){
  shot('disco-new-'+direction,`flashA=0;shakeMag=0;discoGame.phase='show';discoGame.showCue=0;discoGame.phaseT=DISCO_RULES.showLead+.35;discoGame.rise=1;discoGame.kingPose='${direction}';discoGame.playerPose='${direction}';discoGame.playerPoseT=.4;`);
}
assert.equal(run('discoPlayerMoveAmount(0)'),0);
assert.equal(run('discoPlayerMoveAmount(.7)'),0);
assert.equal(run('discoPlayerMoveAmount(.4)'),1);
assert(run('discoPlayerMoveAmount(.65)')<run('discoPlayerMoveAmount(.6)'),'player eases into each move');
for(const side of [-1,1]){
  const idle=run(`discoPlayerLegPose('down',0,${side},0)`);
  let previousDepth=idle.kneeDepth;
  for(const amount of [.25,.5,.75,1]){
    const pose=run(`discoPlayerLegPose('down',${amount},${side},0)`);
    assert.equal(pose.kneeX,idle.kneeX,'crouching must not splay knees sideways');
    assert.equal(pose.footX,idle.footX);assert.equal(pose.footY,idle.footY);
    assert(pose.kneeDepth>previousDepth,'knees bend forward toward King');previousDepth=pose.kneeDepth;
    assert(Math.abs(Math.hypot(pose.kneeHeight,pose.kneeDepth)-pose.legLength)<1e-8);
    assert(Math.abs(Math.hypot(pose.hipHeight-pose.kneeHeight,pose.hipDepth-pose.kneeDepth)-pose.legLength)<1e-8);
  }
}
run('paused=true');const poseTimer=run('discoGame.playerPoseT');run('updateDiscoDance(1)');
assert.equal(run('discoGame.playerPoseT'),poseTimer);run('paused=false');
run('beginDiscoRun();updateDiscoDance(2);');showAllMoves();
run("handleDiscoSwipe(DISCO_DIRECTIONS.find(x=>x!==discoGame.sequence[0]));");
assert.equal(run('discoGame.phase'),'reply');run('updateDiscoDance(.71)');
assert.equal(run('discoGame.phase'),'roundResult');assert.equal(run('discoGame.wins'),0);
run('beginDiscoRun();updateDiscoDance(2);');showAllMoves();
run('updateDiscoDance(DISCO_RULES.responseTime*5+1.51);updateDiscoDance(.01)');
assert.equal(run('discoGame.phase'),'roundResult');
run("beginDiscoRun();updateDiscoDance(2);discoGame.sequence=['left','left','right','up','down'];");showAllMoves();
run('for(const dir of discoGame.sequence)handleDiscoSwipe(dir)');
assert.equal(run('discoGame.inputIndex'),5);assert.equal(run('discoGame.playerQueue.length'),4);
run('paused=true');const queued=run('JSON.stringify(discoGame)');run('updateDiscoDance(2)');
assert.equal(run('JSON.stringify(discoGame)'),queued);run('paused=false');
for(const dir of ['left','left','right','up','down']){
  assert.equal(run('discoGame.playerPose'),dir);run('updateDiscoDance(.7)');
}
assert.equal(run('discoGame.wins'),1);assert.equal(run('discoGame.playerQueue.length'),0);
for(const t of [0,.22,.5,.9])shot('disco-crowd-'+t,`flashA=0;shakeMag=0;discoGame.sceneT=${t};`);
assert.notEqual(run('JSON.stringify(discoCourtierMotion(0,0,0))'),run('JSON.stringify(discoCourtierMotion(0,.3,0))'));
// A cheer must blend every animated component, not switch on the truthiness
// of a tiny fractional value (the old source of the swipe-time crowd snap).
for(let i=0;i<4;i++)for(const clock of [0,.35,.8,1.4]){
  const poses=[0,.001,.5,1].map(c=>run(`discoCourtierMotion(${i},${clock},${c})`));
  for(const key of Object.keys(poses[0])){
    assert(Math.abs(poses[2][key]-(poses[0][key]+poses[3][key])*.5)<1e-9,`continuous crowd ${key}`);
    assert(Math.abs(poses[1][key]-poses[0][key])<.004,`no binary jump in ${key}`);
  }
}
run("startDiscoDance();discoGame.phase='input';discoGame.sequence=['left','right','up','down','left'];discoGame.sceneT=.35;");
const cheerAtInput=run('discoGame.crowdCheer');
run("handleDiscoSwipe('left')");assert.equal(run('discoGame.crowdCheer'),cheerAtInput,'swipe cannot directly snap NPC pose');
let lastCheer=cheerAtInput;
for(let frame=0;frame<100;frame++){
  if(frame===20){run("handleDiscoSwipe('right')");assert.equal(run('discoGame.crowdCheer'),lastCheer,'repeated input does not reset dance');}
  run('updateDiscoDance(1/60)');const nextCheer=run('discoGame.crowdCheer');
  assert(nextCheer>=0&&nextCheer<=1);assert(Math.abs(nextCheer-lastCheer)<.075,'cheer onset/expiry must ease');lastCheer=nextCheer;
}
assert(lastCheer<.15,'cheer settles back to baseline dancing');
run('discoGame.crowdCheer=.7;beginDiscoRound()');assert.equal(run('discoGame.crowdCheer'),.7,'round transition preserves crowd continuity');
run('paused=true');const pausedCrowd=run('JSON.stringify(discoGame)');run('updateDiscoDance(2)');assert.equal(run('JSON.stringify(discoGame)'),pausedCrowd);
run('startDiscoDance();render();');const cache=run('discoArenaCache.canvas');
const state=run('JSON.stringify(discoGame)');run('render();');
assert.equal(run('discoArenaCache.canvas'),cache);assert.equal(run('JSON.stringify(discoGame)'),state);
run('leaveDiscoDance()');assert.equal(run('mode'),'minigames');assert.equal(run('discoGame'),null);
console.log('DISCO_REVAMP_OK sequence recall, input queue, wrong/timeout, pause, legs, continuous crowd across swipes/expiry/rounds, render isolation, exit');
