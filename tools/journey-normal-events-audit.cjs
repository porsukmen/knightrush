const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {run,canvas,sandbox}=require('./journey-render-audit.cjs');
const store=new Map();sandbox.localStorage.getItem=k=>store.get(k)||null;sandbox.localStorage.setItem=(k,v)=>store.set(k,v);
run(`SFX.toggle();
function normalFixture(content,side=null){
 for(let seed=0;seed<100;seed++){
  startJourneyWithSeed(seed);godMode=true;
  for(const n of journeyRoute.nodes)for(const e of n.out){
   // This fixture asserts immediate pickups on THIS edge. A quest legitimately
   // offered near its end starts spawning on the next road instead.
   const slot=e.events.find(s=>JOURNEY_ROAD_EVENTS[s.definition].kind==='normal'&&journeyNormalContent(s)===content&&
    (content!=='mushrooms'||journeyNode(e.to).at-s.at>105)&&(side===null||journeyNormalSide(s)===side));if(!slot)continue;
   journeyRoute.from=n.id;journeyRoute.next=e.to;journeyRoute.activeEdge=e.id;journeyRoute.pendingArm=false;
   dist=slot.at-15;runDistance=dist;roadScroll=dist;armJourneyNode();
   obstacles=[];pickups=[];roadsideScenery=[];nextSpawnAt=stageDistance();nextTreeAt=stageDistance();
   journey.phase='main';journey.endTrees=[];updateJourneyRoadEvents(0);return slot;
  }
 }throw Error('Missing '+content);
}
function enterNormal(){player.x=player.lane=journeyNormalSide(journeyRoadEventSession.slot)>0?2:0;handleAction(player.lane===2?'right':'left');update(.25);}
function acceptNormal(){enterNormal();handleAction('choice1');if(mode==='journeyevent'){update(.25);handleAction('continue');}}
globalThis.slot=normalFixture('mushrooms');dist=slot.at-35;`);
assert.equal(run('mode'),'run');
const before=run('dist');run('handleAction("right");update(1/60)');assert(run('dist')>before);assert.equal(run('player.lane'),2);
run('handleAction("tap",{x:130,y:245});handleAction("interact")');assert.equal(run('mode'),'run');assert.equal(run('journeyMushroomQuest'),null);
run('dist=slot.at-15;acceptNormal()');assert.equal(run('journeyMushroomQuest.count'),0);assert.equal(run('journeyRoadEventSession'),null);
assert.equal(run('journeyMushroomQuest.status'),'collecting');
run('spawnJourneyMushrooms()');assert(run("pickups.some(c=>c.kind==='mushroom')"));
assert(run("pickups.every(c=>!obstacles.some(o=>Math.abs(o.z-c.z)<8&&occupiesLane(o,c.lane)))"));
// Exercise the real swept pickup collision, not just the counter helper.
run(`player.lane=1;player.x=1;pickups=[{kind:'mushroom',lane:1,z:0,prevZ:1}];updateRunCollisions();`);
assert.equal(run('journeyMushroomQuest.count'),1);
run(`for(let i=0;i<9;i++)collect({kind:'mushroom',lane:1,z:0});`);
assert.equal(run('journeyMushroomQuest.status'),'ready');
// A later encounter in the SAME run can accept the completed quest.
run(`dist=slot.at-15;startJourneyRoadEvent({...slot,id:slot.id+':delivery',content:'mushrooms'});globalThis.saved=journeyRoadEventSession.context;globalThis.goldBefore=gold;acceptNormal();`);
assert.equal(run('gold-goldBefore'),25);assert.equal(run('journeyMushroomQuest'),null);
assert.equal(run("saved.finish({status:'completed'})"),false);assert.equal(run('gold-goldBefore'),25);
// Chest now belongs to its own special road; journey-chest-audit owns that flow.
for(const content of ['well']){
 run(`slot=normalFixture('${content}');globalThis.frozen=JSON.stringify([dist,runDistance,roadScroll,journeyRoute.activeEdge]);globalThis.build=JSON.stringify([player.hp,runSkills]);globalThis.goldBefore=gold;acceptNormal();`);
 assert.equal(run('mode'),'wishingwell');
 run('for(let i=0;i<60;i++)update(1/60)');
 assert.equal(run('JSON.stringify([dist,runDistance,roadScroll,journeyRoute.activeEdge])'),run('frozen'));
 assert.equal(run('JSON.stringify([player.hp,runSkills])'),run('build'));
 run('beginWishingWellThrow()');
 const setup=run('JSON.stringify(wellGame.setup)');
 run('wellGame.phase="result";wellGame.result={tier:"EXCELLENT"};beginWishingWellThrow()');
 assert.equal(run('mode'),'run');assert.equal(run('journeyRoadEventSession'),null);assert.equal(run('gold-goldBefore'),12);
 assert.equal(run('JSON.stringify([dist,runDistance,roadScroll,journeyRoute.activeEdge])'),run('frozen'));
 run('update(1/60)');assert(run('dist')>JSON.parse(run('frozen'))[0]);
 run(`slot=normalFixture('${content}');acceptNormal();beginWishingWellThrow();`);
 assert.equal(run('JSON.stringify(wellGame.setup)'),setup,'Seeded challenge');
 run('goldBefore=gold;leaveWishingWell();');assert.equal(run('gold-goldBefore'),0);
 run(`slot=normalFixture('${content}');enterNormal();handleAction('choice2');update(.25);handleAction('continue');`);assert.equal(run('mode'),'run');assert.equal(run('journeyRoadEventSession'),null);
}
run(`slot=normalFixture('well');globalThis.stale=journeyRoadEventSession.context;acceptNormal();startJourneyWithSeed(12);`);
assert.equal(run('wellGame'),null);assert.equal(run("stale.finish({status:'completed'})"),false);
run(`slot=normalFixture('well');dist=slot.at+21;updateJourneyRoadEvents(0);`);assert.equal(run('journeyRoadEventSession'),null);
run(`startLockpicking();lockpickGame.phase='result';beginLockpickingRound();`);assert.equal(run('lockpickGame.phase'),'playing');
run(`leaveLockpicking();startWishingWell();wellGame.phase='result';beginWishingWellThrow();`);assert.equal(run('wellGame.phase'),'ready');run('leaveWishingWell()');
// New PLAY, replay seed, new seed and abandoning the run must all reset quests.
store.set('knightrush.roadQuest.v1','{"version":1,"status":"ready","count":10}');
for(const restart of ['startRun(0)','startJourneyWithSeed(12)','startJourneyWithSeed(99)','resetRun()']){
 run(`journeyMushroomQuest={status:'ready',count:10};${restart};`);
 assert.equal(run('journeyMushroomQuest'),null,restart);
}
const out=path.resolve('output/journey-normal-events');fs.mkdirSync(out,{recursive:true});
for(const content of ['mushrooms','well'])for(const curved of [false,true]){
 run(`journeyMushroomQuest=null;slot=normalFixture('${content}');setCurvedWorldTrial(${curved});nextTreeAt=dist-5;spawnLoopEntities();dist=slot.at-15;roadScroll=dist;render();`);
 fs.writeFileSync(path.join(out,content+(curved?'-curved':'')+'.png'),canvas.toBuffer('image/png'));
 run('enterNormal();render();');
 fs.writeFileSync(path.join(out,content+'-conversation'+(curved?'-curved':'')+'.png'),canvas.toBuffer('image/png'));
}
// Window boundary, wrong-side movement, debounced choices and refusal.
for(const side of [-1,1])for(const offset of [-24,0,15]){
 run(`journeyMushroomQuest=null;slot=normalFixture('mushrooms',${side});dist=slot.at+(${offset});handleAction(journeyNormalSide(slot)>0?'left':'right');`);
 assert.equal(run('mode'),'run');
 run(`player.x=player.lane=journeyNormalSide(slot)>0?2:0;handleAction(journeyNormalSide(slot)>0?'right':'left');handleAction('choice1');`);
 assert.equal(run('mode'),'journeyevent');assert.equal(run('journeyMushroomQuest'),null);
 run(`update(.25);handleAction('choice2');update(.25);handleAction('continue');`);
 assert.equal(run('journeyMushroomQuest'),null);assert.equal(run('mode'),'run');
}
console.log('JOURNEY_NORMAL_EVENTS_OK directional swipe/window/debounce/refusal; run-local quest/swept pickup/delivery; new play/replay/new seed/abandon reset; seeded well; frozen dialogue/resume; once-only reward; standalone; 8 renders');
