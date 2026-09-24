const assert=require('node:assert/strict');
const {run,shot}=require('./journey-render-audit.cjs');
run('SFX.toggle();openRoadLab();');
shot('expedition-lab','');
const result={};
const seedReport=JSON.parse(run(`JSON.stringify((()=>{
  const counts={},enemies=new Set();let nodes=0;
  for(let seed=0;seed<80;seed++){
    const a=generateJourneyGraph(seed,CFG.LOOP_DIST*JOURNEY_ROAD_RULES.distanceScale,1),
      b=generateJourneyGraph(seed,CFG.LOOP_DIST*JOURNEY_ROAD_RULES.distanceScale,1);
    if(JSON.stringify(a)!==JSON.stringify(b))throw Error('Unseeded plan');
    nodes+=a.nodes.length;
    for(const n of a.nodes)for(const edge of n.out){
      counts[edge.preview.theme]=(counts[edge.preview.theme]||0)+1;
      const events=edge.events.filter(s=>JOURNEY_ROAD_EVENTS[s.definition].blocking);
      if(edge.preview.special&&events.length!==1)throw Error('Special needs exactly one stop');
      for(const slot of edge.events){
        if(slot.at<=n.at||slot.at>=a.nodes.find(x=>x.id===edge.to).at)throw Error('Event beyond edge');
        if(!journeyRoadEventHandlers.has(slot.definition))throw Error('Missing handler');
      }
    }
  }return {counts,nodes};
})())`,90000));
for(const theme of ['forest','forge','caravan','inn','bloodwood','disco','chest'])assert(seedReport.counts[theme]>0,theme);
result.seededMaps=seedReport;
function launch(index){run(`startRoadLabCase(${index});dist=roadLabState.slot.at;roadScroll=dist;obstacles=[];pickups=[];updateJourneyRoadEvents(0);`);}
// Shop upgrades keep build, distance, stage and route; no nextLoop on leaving.
launch(0);assert.equal(run('mode'),'shop');shot('expedition-forge','');
run('globalThis.beforeForge={dist,loop,route:journeyRoute,skill:runSkills[0]};blacksmithShop.random=()=>.99;beginSmithUpgrade();updateBlacksmithShop(5);shopTap({x:240,y:680});shopTap({x:240,y:750});');
assert(run("mode==='run'&&loop===beforeForge.loop&&dist===beforeForge.dist&&journeyRoute===beforeForge.route&&runSkills[0]!==beforeForge.skill"));
assert.equal(run('journeyRoadEventSession'),null);result.forge=true;
launch(1);assert.equal(run('mode'),'merchant');shot('expedition-caravan','');
run('globalThis.beforeMerchant={dist,loop,route:journeyRoute};buyMerchantItem();updateMerchantShop(2);merchantTap({x:240,y:760});');
assert(run("mode==='run'&&loop===beforeMerchant.loop&&dist===beforeMerchant.dist&&journeyRoute===beforeMerchant.route"));result.merchant=true;
launch(2);assert.equal(run('mode'),'journeyevent');run('update(.3)');shot('expedition-inn','');
run('globalThis.beforeInn={gold,dist,loop};handleJourneyRoadEventAction("choice1");');
assert(run('player.currentHealthUnits===player.maxHealthUnits&&gold===beforeInn.gold-(18+loop*4)'));
const paid=run('gold');run('handleJourneyRoadEventAction("choice1")');assert.equal(run('gold'),paid);
run('gold=0;handleJourneyRoadEventAction("choice2")');assert.equal(run('mode'),'journeyevent');
run('gold=50;handleJourneyRoadEventAction("choice2");render();');assert(run('MINIGAME_MODES.has(mode)'));
run('setMode("journeyinnresume");update(.3);render();');assert.equal(run('mode'),'journeyevent');
assert(run('journeyRoadEventSession.context.inn.round===1&&dist===beforeInn.dist'));
// Every reused pub game can return without consuming the visit or its rest state.
for(let i=0;i<5;i++){
  run(`journeyRoadEventSession.context.openMode(()=>INN_GAMES[${i}].start());update(.3);render();setMode('journeyinnresume');update(.3);`);
  assert.equal(run('mode'),'journeyevent');
}
run('handleJourneyRoadEventAction("choice3");');assert.equal(run('mode'),'run');result.inn=true;
// No middle-lane interaction. Reaching the outer lane is a separate gesture.
for(const index of [5,6,14,15,16,17])for(const side of [-1,1]){
  run(`startRoadLabCase(${index});
    if(journeyNormalSide(roadLabState.slot)!==${side})roadLabState.slot.id+='y';
    dist=roadLabState.slot.at;roadScroll=dist;updateJourneyRoadEvents(0);
    player.lane=player.x=1;`);
  const direction=side===1?'right':'left';
  assert.equal(run(`handleJourneyRoadEventAction('${direction}')`),false);
  assert.equal(run('mode'),'run');
  run(`player.lane=${side===1?2:0};player.x=1;`);
  assert.equal(run(`handleJourneyRoadEventAction('${direction}')`),false,'must settle in the roadside lane');
  run(`player.x=player.lane;handleJourneyRoadEventAction('${direction}');update(.3);render();`);
  assert.equal(run('mode'),'journeyevent');
  if(index===5){
    shot('expedition-camp','');const hp=run('player.currentHealthUnits');
    run('handleJourneyRoadEventAction("choice1")');const after=run('player.currentHealthUnits');assert(after>hp);
    run('handleJourneyRoadEventAction("choice1")');assert.equal(run('player.currentHealthUnits'),after);
    run('handleJourneyRoadEventAction("choice3")');assert.equal(run('mode'),'run');
  }
}
result.laneGates=12;
// Quest delivery planning cannot replace a camp or a roadblock with a hidden
// quest payload while leaving its original encounter handler in charge.
run(`for(let seed=0;seed<20;seed++){
  startJourneyWithSeed(seed);journeyMushroomQuest={status:'ready',count:10};
  const fixed=journeyRoute.nodes.flatMap(n=>n.out).flatMap(e=>e.events)
    .filter(e=>['roadside_camp','roadside_fight'].includes(e.definition));
  scheduleJourneyFollowups();
  if(fixed.some(e=>e.content||e.followup))throw Error('Delivery overwrote a fight/camp');
}`);
// All six normal enemies use genuine HP turns, skills, one reward and no stage advance.
result.enemies=[];
for(let i=8;i<14;i++){
  launch(i);assert.equal(run('mode'),'boss');
  const id=run('boss.definitionId');run('globalThis.preFight={gold,scrap,dist,loop,kills:bossKills};');
  shot('expedition-'+id,'');
  run('for(let frame=0;frame<1800&&!isPlayerTurn();frame++)update(1/60);');
  assert.equal(run('isPlayerTurn()'),true,id+' must yield AP turn');
  const hp=run('boss.hp');run('performPlayerAction(knightTurnSkills()[0]);for(let f=0;f<240;f++)update(1/60);');
  assert(run('boss.hp')<hp,id+' skill damage');
  run('boss.hp=0;defeatBoss();for(let f=0;f<240&&mode!=="run";f++)update(1/60);');
  assert(run("mode==='journeyevent'&&gold===preFight.gold&&scrap===preFight.scrap"));
  run('handleJourneyRoadEventAction("choice1");handleJourneyRoadEventAction("choice2");handleJourneyRoadEventAction("continue");');
  assert(run("mode==='run'&&loop===preFight.loop&&dist===preFight.dist&&bossKills===preFight.kills&&gold===preFight.gold+10+loop*2"));
  assert(run('scrap>=preFight.scrap+2&&scrap<=preFight.scrap+4'));
  assert.equal(run('finishJourneyRoadFight()'),false);assert.equal(run('hasCombatAlly()'),false);
  result.enemies.push(id);
}
// Every turn entry stays anchored; exercise both renderers at several yaw positions.
for(const direction of [-1,0,1])for(let index=0;index<5;index++){
  run(`roadLabState.direction=${direction};roadLabState.entry=true;startRoadLabCase(${index});`);
  shot('expedition-entry-'+direction+'-'+index,'');
  run('{const checkpoint={gold,dist};render();render();if(gold!==checkpoint.gold||dist!==checkpoint.dist)throw Error("render mutated state");}');
}
run('roadLabState.entry=false;openRoadLab();');
console.log('EXPEDITION_OK '+JSON.stringify(result));
