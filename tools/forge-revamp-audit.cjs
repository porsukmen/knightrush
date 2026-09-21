const assert=require('node:assert/strict');
const {run,shot}=require('./journey-render-audit.cjs');
run(`SFX.toggle();
 function forgeAuditTick(seconds){for(let t=0;t<seconds-1e-8;t+=1/120)updateBlacksmith(Math.min(1/120,seconds-t));}
 function forgeAuditReady(heat=.65){
   startBlacksmith();beginBlacksmithRun();forgeGame.stage='forging';forgeGame.heat=heat;forgeGame.hearthMix=0;
 }
`);
run('startBlacksmith()');assert.equal(run('mode'),'blacksmithing');
assert.equal(run('forgeGame.phase'),'intro');shot('forge-revamp-intro','');
run('beginBlacksmithRun();beginForgeBellowsHold(0,0,true);forgeAuditTick(1.10)');
assert.equal(run('forgeGame.stage'),'forging');assert.equal(run('forgeGame.bellowsHeld'),true);
assert.ok(run('forgeGame.hearthMix>.99'));assert.equal(run('strikeForgeTarget()'),false);
shot('forge-revamp-bellows','');
run('endForgeBellowsHold()');assert.equal(run('strikeForgeTarget()'),false,'still transferring from hearth');
run('forgeAuditTick(.4)');assert.ok(run('forgeGame.hearthMix<.08'));
shot('forge-revamp-target','');
assert.equal(run('strikeForgeTarget()'),true);
assert.equal(run('forgeGame.hits'),0,'input must not count before impact');
run('forgeAuditTick(.24)');shot('forge-revamp-windup','');
assert.equal(run('forgeGame.hits'),0);assert.equal(run('beginForgeBellowsHold(0,0,true)'),false);
run('forgeAuditTick(.14)');assert.equal(run('forgeGame.hits'),1);shot('forge-revamp-impact','');
run('forgeAuditTick(.5)');assert.equal(run('forgeGame.hits'),1,'one impact only');

// Every target is physically reachable, finite and continuous through the swing.
run('forgeAuditReady()');
for(let target=0;target<6;target++){
 run(`forgeGame.impactX=FORGE_TARGET_X[${target}];forgeGame.hammerT=FORGE_RULES.hammerTime*(1-FORGE_RULES.impactAt)`);
 const contact=JSON.parse(run(`JSON.stringify((()=>{
  const p=forgeSmithPose(forgeGame),h=forgeHandWorld(p,p.right),k=.62*U*FORGE_SCENE.smithScale;
  return {x:h.x+7.55*Math.cos(p.hammerAngle)*k,y:h.y+7.55*Math.sin(p.hammerAngle)*k};
 })())`));
 assert.ok(Math.abs(contact.x-run(`FORGE_TARGET_X[${target}]`))<.001);
 assert.ok(Math.abs(contact.y-run('FORGE_SCENE.bladeY'))<.001);
 let previous=null;
 for(let frame=0;frame<73;frame++){
  const p=JSON.parse(run(`forgeGame.hammerT=Math.max(0,.6-${frame}/120);JSON.stringify(forgeSmithPose(forgeGame))`));
  for(const arm of [p.left,p.right])for(const value of Object.values(arm))assert.ok(Number.isFinite(value));
  if(previous)assert.ok(Math.hypot(p.right.hx-previous.hx,p.right.hy-previous.hy)<8,'no hand teleport');
  previous=p.right;
 }
}
// A complete run with actual heat loss and reheating, not nine injected successes.
run('forgeAuditReady(.68)');
for(let i=0;i<9;i++){
 if(run('forgeGame.heat')<.52){
  run(`beginForgeBellowsHold(0,0,true);while(forgeGame.heat<.72)updateBlacksmith(1/120);
   endForgeBellowsHold();forgeAuditTick(.4);`);
 }
 assert.equal(run('strikeForgeTarget()'),true);
 run('forgeAuditTick(.61)');assert.equal(run('forgeGame.hits'),i+1);
}
assert.equal(run('forgeGame.idealHits'),9);assert.equal(run('forgeGame.stage'),'quench');
run(`beginForgeBellowsHold(0,0,true);while(forgeGame.heat<.64)updateBlacksmith(1/120);
 endForgeBellowsHold();forgeAuditTick(.4);`);
assert.equal(run('quenchForgeBlade()'),true);assert.equal(run('forgeGame.score'),100);
assert.equal(run('forgeGame.outcome'),'MASTERWORK');
run('forgeAuditTick(.8)');shot('forge-revamp-quench','');
assert.equal(run('forgeGame.phase'),'quenching');
run('forgeAuditTick(1)');assert.equal(run('forgeGame.phase'),'result');shot('forge-revamp-result','');
run('beginBlacksmithRun()');assert.equal(run('forgeGame.best'),100);assert.equal(run('forgeGame.hits'),0);

for(const [heat,result,clean] of [[.2,'cold',0],[.43,'workable',0],[.61,'ideal',1],[.95,'hot',0]]){
 run(`forgeAuditReady(${heat});strikeForgeTarget();forgeAuditTick(.61)`);
 assert.equal(run(`forgeHeatQuality(${heat})`),result);
 assert.equal(run('forgeGame.hits'),result==='cold'||result==='hot'?0:1);
 assert.equal(run('forgeGame.idealHits'),clean);
 assert.ok(run('forgeGame.flaws')===(result==='ideal'?0:result==='workable'?.35:1));
}
run(`forgeAuditReady();strikeForgeAt({x:FORGE_TARGET_X[forgeGame.target]+100,y:437});forgeAuditTick(.61)`);
assert.equal(run('forgeGame.hits'),0);assert.equal(run('forgeGame.flaws'),1);
for(const [heat,outcome] of [[.3,'WARPED'],[.43,'SERVICEABLE'],[.6,'MASTERWORK'],[.8,'SERVICEABLE'],[.9,'BRITTLE']]){
 run(`forgeAuditReady(${heat});forgeGame.stage='quench';forgeGame.hits=9;forgeGame.idealHits=9;quenchForgeBlade();forgeAuditTick(1.8)`);
 assert.equal(run('forgeGame.outcome'),outcome);assert.equal(run('forgeGame.phase'),'result');
}
run('forgeAuditReady(.97);beginForgeBellowsHold(0,0,true);forgeAuditTick(1)');
assert.equal(run('forgeGame.outcome'),'BURNT SLAG');assert.equal(run('forgeGame.bellowsHeld'),false);
shot('forge-revamp-burnt','');

// Render is pure, pause freezes all animation/rules, and menu exit clears holds.
run('forgeAuditReady();strikeForgeTarget();forgeAuditTick(.15);autoPause()');
assert.equal(run('paused'),true);
const frozen=run('JSON.stringify(forgeGame)');run('updateBlacksmith(2);blacksmithTap({x:240,y:437})');
assert.equal(run('JSON.stringify(forgeGame)'),frozen);
run('paused=false');const before=run('JSON.stringify(forgeGame)');run('render();render()');
assert.equal(run('JSON.stringify(forgeGame)'),before);
const cache=run('forgeArenaCache.canvas');run('render()');assert.equal(run('forgeArenaCache.canvas'),cache);
run('forgeAuditReady();beginForgeBellowsHold(0,0,true);leaveBlacksmith()');
assert.equal(run('forgeGame'),null);assert.equal(run('mode'),'minigames');
console.log('FORGE_REVAMP_OK complete reheat/9-strike/quench loop, exact once-only contact, six reachable marks, continuous rig, heat/miss outcomes, replay, pause, pure render, cache, exit');
