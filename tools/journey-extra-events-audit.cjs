const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
// Also runs the original interaction/quest regressions and installs fixtures.
require('./journey-normal-events-audit.cjs');
const {run,canvas}=require('./journey-render-audit.cjs');
run(`function finishReply(){update(.25);handleAction('continue');}
function visitFollowup(content){
 scheduleJourneyFollowups();
 for(const node of journeyRoute.nodes)for(const edge of node.out){
  const slot=edge.events.find(s=>s.followup===content);if(!slot)continue;
  journeyRoute.from=node.id;journeyRoute.next=edge.to;journeyRoute.activeEdge=edge.id;
  dist=slot.at-15;runDistance=dist;roadScroll=dist;armJourneyNode();journey.phase='main';
  updateJourneyRoadEvents(0);return slot;
 }throw Error('Missing authored follow-up '+content);
}`);
// Insufficient funds never become a negative balance, and declining is free.
for(const content of ['traveler','taxman']){
 run(`slot=normalFixture('${content}');gold=0;enterNormal();handleAction('${content==='taxman'?'choice2':'choice1'}');`);
 assert.equal(run('gold'),0);assert.equal(run('journeyRoadEventSession.context.dialogue'),'choice');
 assert(run('!!journeyRoadEventSession.context.notice'));
 run(`handleAction('${content==='taxman'?'choice3':'choice2'}');finishReply();`);assert.equal(run('mode'),'run');
}
run(`slot=normalFixture('taxman');gold=9;enterNormal();handleAction('choice2');finishReply();`);
assert.equal(run('gold'),4);assert.equal(run('mode'),'run');
// Real arm-wrestling input wins; Journey result returns instead of rematching.
run(`slot=normalFixture('taxman');gold=0;globalThis.position=JSON.stringify([dist,roadScroll,runDistance]);acceptNormal();beginArmWrestlingMatch();
for(let i=0;i<80&&armWrestleGame.phase==='playing';i++){armWrestleSwipe('right');update(.06);}update(.7);`);
assert.equal(run('armWrestleGame.phase'),'result');assert.equal(run('armWrestleGame.result.win'),true);
run('beginArmWrestlingMatch()');assert.equal(run('mode'),'run');assert.equal(run('gold'),15);
assert.equal(run('JSON.stringify([dist,roadScroll,runDistance])'),run('position'));
run(`slot=normalFixture('taxman');gold=3;acceptNormal();beginArmWrestlingMatch();pinArmWrestling(false);update(.7);beginArmWrestlingMatch();`);
assert.equal(run('gold'),3);assert.equal(run('mode'),'run');
run(`slot=normalFixture('taxman');acceptNormal();leaveArmWrestling();`);assert.equal(run('journeyRoadEventSession'),null);
// Accept, collect through swept collisions, then deliver in the SAME run.
run(`slot=normalFixture('chickens');gold=0;acceptNormal();dist=journeyNode(journeyRoute.from).at+40;spawnJourneyMushrooms();`);
assert.equal(run('journeyChickenQuest.count'),0);assert(run("pickups.some(c=>c.kind==='chicken')"));
run(`for(let i=0;i<5;i++){player.x=1;player.lane=1;pickups=[{kind:'chicken',lane:1,z:0,prevZ:1}];updateRunCollisions();}`);
assert.equal(run('journeyChickenQuest.status'),'ready');assert.equal(run('gold'),0);
run(`globalThis.oldActors=obstacles.slice();globalThis.planDistance=dist;scheduleJourneyFollowups();
globalThis.followupCount=journeyRoute.nodes.flatMap(n=>n.out).flatMap(e=>e.events).filter(s=>s.followup==='chicken_return').length;
for(let i=0;i<60;i++)scheduleJourneyFollowups();`);
assert(run('followupCount>0'));assert.equal(run("journeyRoute.nodes.flatMap(n=>n.out).flatMap(e=>e.events).filter(s=>s.followup==='chicken_return').length"),run('followupCount'));
assert(run('oldActors.every((o,i)=>obstacles[i]===o)'));
assert(run("journeyRoute.nodes.flatMap(n=>n.out).flatMap(e=>e.events).filter(s=>s.followup==='chicken_return').every(s=>s.at-JOURNEY_ROAD_RULES.normalOfferLead-6>planDistance+SPAWN_FAR)"));
run(`slot=visitFollowup('chicken_return');globalThis.returnContext=journeyRoadEventSession.context;acceptNormal();`);
assert.equal(run('gold'),20);assert.equal(run('journeyChickenQuest'),null);assert.equal(run("returnContext.finish({status:'completed'})"),false);
// Aid now, repayment at a future normal-road stop; no free repeated reward.
run(`slot=normalFixture('traveler');gold=10;acceptNormal();`);assert.equal(run('gold'),5);assert.equal(run('journeyTravelerFavor.status'),'waiting');
run(`slot=visitFollowup('traveler_return');acceptNormal();`);assert.equal(run('gold'),20);assert.equal(run('journeyTravelerFavor'),null);
run(`journeyChickenQuest={status:'ready',count:5};journeyTravelerFavor={status:'waiting'};startJourneyWithSeed(88);`);
assert.equal(run('journeyChickenQuest'),null);assert.equal(run('journeyTravelerFavor'),null);
// Standalone arm-wrestling still rematches.
run(`startArmWrestling();armWrestleGame.phase='result';beginArmWrestlingMatch();`);assert.equal(run('armWrestleGame.phase'),'playing');run('leaveArmWrestling()');
const out=path.resolve('output/journey-extra-events');fs.mkdirSync(out,{recursive:true});
for(const content of ['chickens','taxman','traveler']){
 run(`slot=normalFixture('${content}');gold=12;setCurvedWorldTrial(true);enterNormal();render();`);
 fs.writeFileSync(path.join(out,content+'.png'),canvas.toBuffer('image/png'));
}
console.log('JOURNEY_EXTRA_EVENTS_OK chickens/swept collection/delivery; tax pay/real arm win/loss/leave; traveler aid/return; money guards; spawn-safe/idempotent follow-up scheduling; run reset; portraits');
