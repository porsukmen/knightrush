const assert=require('node:assert/strict');
const {run,shot}=require('./journey-render-audit.cjs');
run(`SFX.toggle();
function denFixture(){
 roadLabState.entry=false;startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.id==='wolfden'));
 dist=roadLabState.slot.at;roadScroll=dist;obstacles=[];pickups=[];updateJourneyRoadEvents(0);
}
function enterDen(){
 const side=journeyNormalSide(roadLabState.slot);player.lane=player.x=side+1;
 handleJourneyRoadEventAction(side>0?'right':'left');update(1.3);update(.3);
}
function clearDenWolf(){boss.hp=0;defeatBoss();boss.stateT=2.6;updateBoss(.016);}
`);
const generated=JSON.parse(run(`JSON.stringify((()=>{
 let dens=0,direct=0,maxNodes=0;
 for(let seed=0;seed<100;seed++){
  startJourneyWithSeed(seed);const a=journeyRoute,b=createJourneyRoute(seed);
  if(JSON.stringify(a.nodes)!==JSON.stringify(b.nodes))throw Error('Unseeded graph');
  if(Math.abs(a.baseTotal-CFG.LOOP_DIST*3.2)>1e-5)throw Error('Distance not doubled');
  maxNodes=Math.max(maxNodes,a.nodes.length);if(a.nodes.length===2)direct++;
  for(const n of a.nodes){
   if(n.type!=='boss'&&!n.out.length)throw Error('Unreachable boss');
   if(n.type==='boss'&&Math.abs(n.baseAt-a.baseTotal)>1e-5)throw Error('Short branch');
   for(const e of n.out)dens+=e.events.filter(s=>s.definition==='roadside_wolfden').length;
  }
 }return {seeds:100,dens,direct,maxNodes};
})())`,90000));
console.log('WOLF_DEN_GENERATION',generated);
assert(generated.dens>0);assert(generated.direct<5,'longer maps should not collapse to fallback corridors');
run('denFixture();globalThis.denBefore={dist,roadScroll,loop,hp:player.currentHealthUnits,gold,scrap};');
shot('wolfden-roadside','flashA=0;shakeMag=0;');
run('player.x=player.lane=1;');
assert.equal(run("handleJourneyRoadEventAction(journeyNormalSide(roadLabState.slot)>0?'right':'left')"),false);
assert.equal(run('mode'),'run');
run('enterDen();');assert.equal(run('journeyRoadEventSession.context.den.slide'),'trail');
shot('wolfden-trail','');
run('handleJourneyRoadEventAction("choice2");update(.3);');
assert.equal(run('journeyRoadEventSession.context.den.slide'),'entrance');
shot('wolfden-entrance','');
run('handleJourneyRoadEventAction("tap",{x:92,y:327});handleJourneyRoadEventAction("tap",{x:92,y:327});');
assert.equal(run('journeyMeat'),1);assert.equal(run('relics.filter(Boolean).length'),0,'quest pocket preserves artifact slots');
run('handleJourneyRoadEventAction("choice1");');
for(let i=0;i<4;i++){
 assert.equal(run('mode'),'boss');assert.equal(run('env'),'cave');assert.equal(run('boss.definitionId'),'den_wolf_'+i);
 assert.equal(run('player.currentHealthUnits'),run('denBefore.hp'),'no between-fight healing');
 run('for(let f=0;f<2000&&!isPlayerTurn();f++)update(1/60);');assert.equal(run('isPlayerTurn()'),true);
 if(i===0){shot('wolfden-fight','flashA=0;shakeMag=0;');const hp=run('boss.hp');
  run('performPlayerAction(knightTurnSkills()[0]);for(let f=0;f<180;f++)update(1/60);');assert(run('boss.hp')<hp);}
 run('clearDenWolf();');assert.equal(run('mode'),'journeyevent');assert.equal(run('boss'),null);
 assert.equal(run('journeyRoadEventSession.context.den.kills'),i+1);
 if(i<3)run('update(1.2)');
}
assert.equal(run('journeyRoadEventSession.context.den.slide'),'pup');
assert(run('dist===denBefore.dist&&roadScroll===denBefore.roadScroll&&loop===denBefore.loop&&gold===denBefore.gold&&scrap===denBefore.scrap'));
run('update(.3)');shot('wolfden-lone-pup','');
run('handleJourneyRoadEventAction("choice1");');assert.equal(run('journeyMeat'),0);assert(run('!!wolfPup'));
run('handleJourneyRoadEventAction("choice1");');assert.equal(run('journeyMeat'),0);
run('update(.3)');shot('wolfden-befriended','');
run('handleJourneyRoadEventAction("continue");');assert.equal(run('mode'),'run');assert.equal(run('env'),'forest');
assert.equal(run('journeyVenueVisible(roadLabState.slot.id)'),false);
shot('wolfden-pup-follows','');
// Real independent combat support does not replace or consume Squire AP.
run(`startBoss('road_greywolf');setMode('boss');boss.hp=20;boss.phase='dodge';beginPlayerTurn();
 globalThis.pupAp=boss.ap;globalThis.pupResolve=boss.resolve;updateWolfPup(.4);`);
assert.equal(run('boss.hp'),17);assert.equal(run('boss.ap'),run('pupAp'));
assert.equal(run('boss.resolve'),run('pupResolve'));
run('queueWolfPupAssist();updateWolfPup(.5)');assert.equal(run('boss.hp'),17,'only once per turn');
run('boss.phase="dodge";beginPlayerTurn();paused=true;updateWolfPup(1);');assert.equal(run('boss.hp'),17);
run('paused=false;updateWolfPup(.4);');assert.equal(run('boss.hp'),14);
run('nextLoop();');assert(run('!!wolfPup'));run('resetRun();');assert.equal(run('wolfPup'),null);assert.equal(run('journeyMeat'),0);
// Leaving, no food, stale input, and search rewards are distinct once-only branches.
run('denFixture();enterDen();handleJourneyRoadEventAction("choice2");update(.3);handleJourneyRoadEventAction("choice2");update(.3);handleJourneyRoadEventAction("continue");');
assert.equal(run('mode'),'run');assert.equal(run('boss'),null);assert.equal(run('wolfPup'),null);
run('denFixture();enterDen();handleJourneyRoadEventAction("choice2");update(.3);handleJourneyRoadEventAction("choice1");');
for(let i=0;i<4;i++)run('clearDenWolf();update(1.2);');
run('handleJourneyRoadEventAction("choice1");');assert.equal(run('wolfPup'),null);assert.equal(run('journeyMeat'),0);
assert.equal(run('journeyRoadEventSession.context.den.slide'),'pup');
run('handleJourneyRoadEventAction("choice2");update(.3);handleJourneyRoadEventAction("continue");');assert.equal(run('mode'),'run');
run('denFixture();enterDen();globalThis.searchBefore=gold+scrap;handleJourneyRoadEventAction("choice1");globalThis.afterSearch=gold+scrap;update(.3);handleJourneyRoadEventAction("choice1");');
assert.equal(run('gold+scrap'),run('afterSearch'));assert.equal(run('mode'),'run');
run('denFixture();enterDen();handleJourneyRoadEventAction("choice2");update(.3);globalThis.oldDen=journeyRoadEventSession.context;openRoadLab();');
assert.equal(run('wolfDenTakeMeat(oldDen)'),false);
assert.equal(run('ARTIFACT_IDS.includes("meat")'),false,'event food must not pollute merchant RNG');
console.log('WOLF_DEN_OK '+JSON.stringify({generated,tests:'lane entry, four real fights, frozen road, food pickup once, adoption/decline/no-food/search/runaway, turn assist, pause, stage persistence and new-run reset'}));
