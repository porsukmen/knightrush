const assert=require('node:assert/strict');
const {run,shot}=require('./journey-render-audit.cjs');
run(`SFX.toggle();
 function mendTick(seconds){for(let t=0;t<seconds-1e-8;t+=1/120)updateSwordMending(Math.min(1/120,seconds-t));}
 function mendDuration(force){let lo=0,hi=1;for(let i=0;i<24;i++){const mid=(lo+hi)/2;if(mendForce(mid)<force)lo=mid;else hi=mid;}return (lo+hi)/2;}
 function mendRepairStep(){
  const m=mendGame;let index=1;
  for(let i=2;i<8;i++)if(Math.abs(m.bends[i])>Math.abs(m.bends[index]))index=i;
  if(m.bends[index]*m.face<0){flipMendBlade();mendTick(.43);}
  beginMendAt(mendNodePoint(index));mendTick(mendDuration(Math.abs(m.bends[index])));releaseMendHold();mendTick(.44);
 }
 startSwordMending();
`);
assert.equal(run('mode'),'swordmending');assert.equal(run('mendGame.phase'),'intro');
shot('crooked-intro','');
run('beginSwordMending()');assert.ok(run('mendQuality()')<60);
assert.equal(run('beginMendAt({x:50,y:600})'),false);
const bends=run('JSON.stringify(mendGame.bends)');
run('beginMendAt(mendNodePoint(2));mendTick(.65)');
assert.equal(run('JSON.stringify(mendGame.bends)'),bends,'charging cannot reshape');
shot('crooked-charge','');run('releaseMendHold();mendTick(.15)');
assert.equal(run('mendGame.strikes'),0);run('mendTick(.02)');
assert.equal(run('mendGame.strikes'),1);assert.ok(run('mendQuality()')>50);
assert.equal(run('finishSwordMending()'),false,'cannot leave a swing half-settled');
run('mendTick(.3)');assert.equal(run('mendGame.strikes'),1);

// A flip changes how geometry is projected, not its actual bends/quality.
const beforeFlip=run('JSON.stringify(mendGame.bends)'),quality=run('mendQuality()');
run('flipMendBlade();mendTick(.21)');assert.ok(Math.abs(run('mendFace()'))<.001);
assert.equal(run('beginMendAt(mendNodePoint(2))'),false);shot('crooked-flip','');
run('mendTick(.22)');assert.equal(run('mendGame.face'),-1);
assert.equal(run('JSON.stringify(mendGame.bends)'),beforeFlip);assert.equal(run('mendQuality()'),quality);

// Overshoot is real, predictable, and reversible, not a hidden RNG failure.
run('startSwordMending();beginSwordMending();mendGame.bends.fill(0);mendGame.shown.fill(0);mendGame.bends[3]=.15;mendGame.shown[3]=.15;beginMendAt(mendNodePoint(3));mendTick(1);releaseMendHold();mendTick(.44)');
assert.ok(run('mendGame.bends[3]')<-.8);assert.equal(run('mendGame.impactGood'),false);
assert.ok(run('mendGame.bends[2]')<0,'neighboring metal responds');
for(let i=0;i<12&&run('mendQuality()')<94;i++)run('mendRepairStep()');
assert.ok(run('mendQuality()')>=94,'bad blow remains fixable');

// All authored jobs are solvable with real hold/turn/impact updates.
for(let job=0;job<3;job++){
 run(`startSwordMending();mendGame.job=${job};beginSwordMending()`);
 let steps=0;
 while(run('mendQuality()')<95&&steps++<24)run('mendRepairStep()');
 assert.ok(run('mendQuality()')>=95,'job '+job+' solvable');
 assert.ok(steps<=14,'repair should not require dozens of exact blows');
 assert.ok(run('mendGame.turns')>=1);assert.ok(run('mendGame.strikes')>=3);
 run('finishSwordMending();mendTick(.8)');shot('crooked-inspect-'+job,'');
 assert.equal(run('mendGame.phase'),'inspect');run('mendTick(.7)');
 assert.equal(run('mendGame.phase'),'result');assert.equal(run('mendGame.outcome'),'TRUE AS AN ARROW');
 const best=run('mendGame.best');run('beginSwordMending()');
 assert.equal(run('mendGame.job'),(job+1)%3);assert.equal(run('mendGame.best'),best);
}

// Every playable section's contact is attached to the real tiny hammer head.
for(let index=1;index<8;index++){
 run(`startSwordMending();beginSwordMending();beginMendAt(mendNodePoint(${index}));mendTick(.6);releaseMendHold();mendGame.swing.time=MEND_RULES.contactAt`);
 const distance=run(`(()=>{const p=mendSmithPose(),s=mendGame.swing,k=.62*U*MEND_SMITH.scale;
  return Math.hypot(MEND_SMITH.x+(p.bodyX+p.right.hx+7.55*Math.cos(p.hammerAngle))*k-s.x,
   MEND_SMITH.y+(p.bodyY+p.right.hy+7.55*Math.sin(p.hammerAngle))*k-s.y);})()`);
 assert.ok(distance<.001,'hammer contact '+index);
}
run('startSwordMending();beginSwordMending()');
const rest=JSON.parse(run('JSON.stringify(mendSmithPose().right)'));
run('beginMendAt(mendNodePoint(2))');
assert.deepEqual(JSON.parse(run('JSON.stringify(mendSmithPose().right)')),rest,'press must not teleport hand');
run('mendTick(.4);autoPause()');assert.equal(run('mendGame.charge'),null);
const paused=run('JSON.stringify(mendGame)');run('mendTick(2);releaseMendHold()');
assert.equal(run('JSON.stringify(mendGame)'),paused,'pause is inert');
run('paused=false');assert.equal(run('mendGame.strikes'),0);
const beforeDraw=run('JSON.stringify(mendGame)');run('render();render()');
assert.equal(run('JSON.stringify(mendGame)'),beforeDraw,'pure rendering');
const cache=run('mendRoomCache.canvas');run('render()');assert.equal(run('mendRoomCache.canvas'),cache);
run('finishSwordMending();mendTick(1.5)');assert.equal(run('mendGame.outcome'),'THE BANANA BLADE');
shot('crooked-banana-result','');
run('leaveSwordMending()');assert.equal(run('mode'),'minigames');assert.equal(run('mendGame'),null);
console.log('CROOKED_STEEL_OK physical repair, controllable force, recoverable overshoot, 3 solvable jobs, continuous flip, 7 hammer contacts, inspection, pause/cancel, pure cached art, exit');
