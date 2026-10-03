'use strict';
// Focused production entry/ownership audit. This deliberately does not repeat
// the Oathkeeper motion, art, route-search or full damage audits.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const base=process.env.KR_BASE_URL||'http://127.0.0.1:8765';
const out=path.resolve(__dirname,'../output/sword-golem-integration');
const fixture=`(()=>{
 SFX.setTestMuted(true);
 for(let seed=0;seed<500;seed++){
  startJourneyWithSeed(seed);
  for(const node of journeyRoute.nodes)for(const edge of node.out){
   const slot=edge.events.find(s=>s.definition==='sword_clearing');if(!slot)continue;
   journeyRoute.from=node.id;journeyRoute.next=edge.to;journeyRoute.activeEdge=edge.id;
   journeyRoute.pendingArm=false;journeyRoute.status='travel';armJourneyNode();
   journey.phase='main';journey.endTrees=[];
   dist=slot.at-30;runDistance=dist;roadScroll=dist;
   obstacles=[];pickups=[];roadsideScenery=[];
   nextSpawnAt=stageDistance()+999;nextTreeAt=stageDistance()+999;
   godMode=false;debugRun=false;player.alive=true;
   player.currentHealthUnits=player.maxHealthUnits-1;player.invuln=0;
   gold=73;scrap=11;relics=[{type:'oath_broken',charged:true},null,null,null,null];syncArtifactCache();
   globalThis.swordAudit={slot,route:journeyRoute,road:{env,obstacles,pickups,roadsideScenery},
    before:{seed:journeyRoute.seed,loop,gold,scrap,relics:JSON.stringify(relics),health:player.currentHealthUnits,
     maxHealth:player.maxHealthUnits,debugRun,godMode,bossKills},context:null};
   return {seed,slot:slot.id,at:slot.at};
  }
 }throw Error('No generated normal sword event found');
})()`;
const trigger=`dist=swordAudit.slot.at;runDistance=dist;roadScroll=dist;
 updateJourneyRoadEvents(0);swordAudit.context=journeyRoadEventSession?.context;
 ({mode,phase:journeyRoadEventSession?.context.phase,event:journeyRoadEventSession?.definition.id})`;

(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true}),report={checks:[]};
 try{
  async function boot(routeHook=null){
   const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],requests=[];
   page.on('pageerror',error=>errors.push(error.message));
   page.on('request',request=>requests.push(new URL(request.url()).pathname));
   await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
   if(routeHook)await routeHook(page);
   await page.goto(base+'/KnightRush.html',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.KRSwordEvent&&window.KRMountedRunner?.ready,null,{timeout:120000,polling:100});
   const run=code=>page.evaluate(code=>(0,eval)(code),code);
   assert.equal(await run('mode'),'menu','Normal startup must not enter a laboratory');
   assert.equal(requests.some(src=>src.includes('/labs/oathkeeper-')),false,'Oathkeeper stays lazy on the main menu');
   assert.equal(await run('KRSwordEvent.encounterOnly'),true,'Temporary monster-only adapter is enabled');
   return {page,errors,requests,run};
  }

  const success=await boot(),{page,run,requests,errors}=success;
  const pools=await run('JSON.stringify(STAGES.list.map(s=>({id:s.id,bossIds:s.bossIds,minibossIds:s.minibossIds})))');
  const bear=await run('JSON.stringify(ENCOUNTERS.get("bear").attacks.map(a=>a.id))');
  report.fixture=await run(fixture);
  await run('updateJourneyRoadEvents(0)');
  assert.equal(await run('journeyRoadEventSession'),null,'Approach only prefetches, it must not trigger early');
  assert.equal((await run(trigger)).event,'sword_clearing','Native road event trigger owns this entry');
  await run('render()');
  assert.equal(await run('journeyRoadEventSession?.definition.id'),'sword_clearing','Loading frame draws without losing event ownership');
  await page.waitForFunction(()=>typeof boss!=='undefined'&&boss?.definitionId==='oathkeeper'&&mode==='boss',null,{timeout:120000,polling:100});
  const entry=await run(`(()=>{const a=swordAudit,c=journeyRoadEventSession.context;return {
   mode,definition:boss.definitionId,phase:c.phase,outcome:c.outcome,owned:journeyRoadEventSession.ownedMode,
   correctRoute:a.route===journeyRoute,seed:journeyRoute.seed,loop,gold,scrap,relics:JSON.stringify(relics),
   health:player.currentHealthUnits,maxHealth:player.maxHealthUnits,debugRun,godMode,bossKills,
   before:a.before,token:boss.roadEventToken===journeyRoadEventSession.token,
   ownedActor:c.game===boss,z:boss.z,turnCombat:isTurnCombat(),moveLab:!!boss._moveLab,
   budget:boss.enemyTurnBudget,recipeSeed:boss._oathRunSeed,contextSeed:c.seed,
   oldPlate:!!window.KREventVisuals?.peek('sword-clearing'),oldPullPrepared:KRSwordEvent.actorStatus().ready};})()`);
  report.entry=entry;
  assert.equal(entry.mode,'boss');assert.equal(entry.definition,'oathkeeper');assert.equal(entry.phase,'battle');
  assert.equal(entry.owned,'boss');assert.equal(entry.correctRoute,true);assert.equal(entry.token,true);assert.equal(entry.ownedActor,true);
  for(const key of ['seed','loop','gold','scrap','relics','health','maxHealth','debugRun','godMode','bossKills'])
   assert.equal(entry[key],entry.before[key],'Production encounter must preserve '+key);
  assert.equal(entry.z,14);assert.equal(entry.turnCombat,true);assert.equal(entry.moveLab,false);assert.equal(entry.budget,1);
  assert.equal(entry.recipeSeed,entry.contextSeed,'Native event supplies a stable recipe seed');
  assert.equal(entry.oldPlate,false);assert.equal(entry.oldPullPrepared,false);
  // The real mounted runner shares Jonathan's model modules on ordinary boot;
  // their presence is not evidence that the archived sword pull was started.
  assert.equal(requests.some(src=>/sword-clearing|sword-(?:preview|review)-/.test(src)),false,'No old pull scene/review request');
  await page.waitForFunction(()=>window.KROathkeeperArena?.coversWorld(),null,{timeout:30000,polling:100});
  await run('render()');
  assert.equal(await run('mode'),'boss','Native boss frame draws without changing phase');
  await page.screenshot({path:path.join(out,'entry-phone.png')});
  report.checks.push('normal lazy boot and real sword slot -> native mortal Oathkeeper without pull scene or run reset');

  report.turn=await run(`(()=>{player.invuln=99;let ticks=0;
   while(boss.phase!=='player'&&player.alive&&ticks++<3000)update(1/120);
   return {ticks,alive:player.alive,mode,phase:boss.phase,ap:boss.ap,apMax:boss.apMax,
    hazards:hazards.length,activeSequence:!!boss._sequence,lastSequence:boss._lastSequence?.id,
    distance:dist,slotAt:swordAudit.slot.at};})()`);
  assert.equal(report.turn.alive,true);assert.equal(report.turn.mode,'boss');assert.equal(report.turn.phase,'player');
  assert.equal(report.turn.ap,report.turn.apMax);assert.equal(report.turn.hazards,0);assert.equal(report.turn.activeSequence,false);
  assert.equal(report.turn.distance,report.turn.slotAt);assert(report.turn.lastSequence);
  report.damage=await run(`(()=>{player.invuln=0;const before=player.currentHealthUnits;
   damagePlayer('integration audit',false,1,'attack');const delta=before-player.currentHealthUnits;
   player.currentHealthUnits=before;player.invuln=99;return {delta,godMode};})()`);
  assert(report.damage.delta>0,'Normal event must use the real health damage path');assert.equal(report.damage.godMode,false);
  report.nextTurn=await run(`(()=>{const turn=boss.enemyTurn;endPlayerTurn();let ticks=0;
   while(!boss._sequence&&ticks++<600)update(1/120);
   return {turnBefore:turn,turn:boss.enemyTurn,phase:boss.phase,state:boss.state,recipe:boss._sequence?.recipe.id};})()`);
  assert.equal(report.nextTurn.turn,report.nextTurn.turnBefore+1);assert.equal(report.nextTurn.phase,'dodge');assert(report.nextTurn.recipe);
  report.checks.push('enemy sequence -> real AP player turn -> next defense; mortal health path');

  report.victory=await run(`(()=>{boss.hp=0;defeatBoss();let ticks=0;
   while(mode==='boss'&&ticks++<600)update(1/60);
   const c=swordAudit.context;return {mode,phase:c.phase,gold,scrap,bossGone:!boss,
    cleared:hazards.length===0&&projectiles.length===0,health:player.currentHealthUnits,
    currentRoute:swordAudit.route===journeyRoute,distance:dist,loop,bossKills,
    roadRestored:env===swordAudit.road.env&&obstacles===swordAudit.road.obstacles&&
      pickups===swordAudit.road.pickups&&roadsideScenery===swordAudit.road.roadsideScenery,
    oldPlate:!!window.KREventVisuals?.peek('sword-clearing')};})()`);
  assert(['journeyevent','run'].includes(report.victory.mode));assert.equal(report.victory.bossGone,true);assert.equal(report.victory.cleared,true);
  assert.equal(report.victory.currentRoute,true);assert.equal(report.victory.roadRestored,true);assert.equal(report.victory.oldPlate,false);
  assert.equal(report.victory.health,entry.health,'Road fight must not stage-boss heal');
  assert.equal(report.victory.distance,report.fixture.at);assert.equal(report.victory.loop,entry.loop);assert.equal(report.victory.bossKills,entry.bossKills);
  assert.equal(report.victory.gold-entry.gold,18+entry.loop*2,'Existing guardian coin reward unchanged');
  assert(report.victory.scrap-entry.scrap>=3&&report.victory.scrap-entry.scrap<=5,'Existing guardian scrap range unchanged');
  await run('render()');
  assert.equal(await run('mode'),report.victory.mode,'Victory sheet must draw without cancelling the event');
  if(report.victory.mode==='journeyevent')assert.equal(await run('journeyRoadEventSession.context.phase'),'victory');
  await page.screenshot({path:path.join(out,'phone-native-victory.png')});
  const paid={gold:report.victory.gold,scrap:report.victory.scrap};
  assert.equal(await run('KRSwordEvent.victory(swordAudit.context)'),false,'Victory cannot pay twice');
  assert.deepEqual(await run('({gold,scrap})'),paid);
  if(await run('mode')==='journeyevent')await run("updateJourneyRoadEvents(.3);handleJourneyRoadEventAction('choice2');");
  assert.equal(await run('mode'),'run');assert.equal(await run('journeyRoadEventSession'),null);
  assert.equal(await run('KROathkeeperArena.coversWorld()'),false,'Completed event releases active arena ownership');
  report.finish=await run('journeyRoute.eventRecords[swordAudit.slot.id]');
  assert.equal(report.finish.status,'completed');
  const roadAt=await run('dist');await run('update(1/60)');assert((await run('dist'))>roadAt,'Normal journey resumes');
  assert.equal(await run('JSON.stringify(STAGES.list.map(s=>({id:s.id,bossIds:s.bossIds,minibossIds:s.minibossIds})))'),pools);
  assert.equal(await run('JSON.stringify(ENCOUNTERS.get("bear").attacks.map(a=>a.id))'),bear);
  assert.equal(await run('ENCOUNTERS.get("oathkeeper").labOnly'),true,'Explicit road integration must not alter random boss pool');
  await run("startBoss('bear');");
  assert.equal(await run('activeBossDefinition().sequenceDriver||null'),null,'Ordinary bear remains native');
  assert.deepEqual(errors,[]);
  report.checks.push('native lethal finish, once-only existing reward, road/health/loop restoration and unchanged ordinary boss pools');
  await page.close();

  const failed=await boot(async page=>{await page.route('**/labs/oathkeeper-model.js',route=>route.abort('failed'));});
  await failed.run(fixture);await failed.run(trigger);
  await failed.page.waitForFunction(()=>mode==='run'&&journeyRoadEventSession===null,null,{timeout:30000,polling:100});
  report.failure=await failed.run('({mode,record:journeyRoute.eventRecords[swordAudit.slot.id],boss:boss?.definitionId||null,health:player.currentHealthUnits,before:swordAudit.before.health})');
  assert.equal(report.failure.record.status,'error');assert.equal(report.failure.boss,null);assert.equal(report.failure.health,report.failure.before);
  assert.deepEqual(failed.errors,[]);await failed.page.close();
  report.checks.push('failed lazy module exits safely to road without spawning another monster or losing health');

  let releaseLoad;const gate=new Promise(resolve=>{releaseLoad=resolve;});
  const stale=await boot(async page=>{await page.route('**/labs/oathkeeper-model.js',async route=>{await gate;await route.continue();});});
  await stale.run(fixture);await stale.run(trigger);
  await stale.page.waitForFunction(()=>journeyRoadEventSession?.definition.id==='sword_clearing',null,{timeout:30000,polling:100});
  const oldToken=await stale.run('journeyRoadEventSession.token');
  await stale.run('startJourneyWithSeed(999);');releaseLoad();
  await stale.page.waitForFunction(()=>window.KROathkeeperEncounter,null,{timeout:120000,polling:100});
  report.stale=await stale.run('({mode,seed:journeyRoute.seed,event:journeyRoadEventSession?.token||null,boss:boss?.definitionId||null})');
  assert.equal(report.stale.mode,'run');assert.equal(report.stale.seed,999);assert.equal(report.stale.event,null);assert.equal(report.stale.boss,null);
  assert.deepEqual(stale.errors,[]);await stale.page.close();
  report.checks.push('late loading completion cannot attach stale event '+oldToken+' to a restarted journey');

  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
  console.log('SWORD_GOLEM_INTEGRATION_OK',report.checks);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
