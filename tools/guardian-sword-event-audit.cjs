'use strict';
// Normal seeded Sword Event ownership, native controls, rewards and exit checks.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.KR_BASE_URL||'http://127.0.0.1:8765',out=path.resolve(__dirname,'../output/guardian-sword-event');
const fixture=()=>{
 SFX.setTestMuted(true);
 for(let seed=0;seed<500;seed++){
  startJourneyWithSeed(seed);
  for(const node of journeyRoute.nodes)for(const edge of node.out){
   const slot=edge.events.find(s=>s.definition==='sword_clearing');if(!slot)continue;
   journeyRoute.from=node.id;journeyRoute.next=edge.to;journeyRoute.activeEdge=edge.id;
   journeyRoute.pendingArm=false;journeyRoute.status='travel';armJourneyNode();journey.phase='main';journey.endTrees=[];
   dist=slot.at-30;runDistance=roadScroll=dist;obstacles=[];pickups=[];roadsideScenery=[];nextSpawnAt=nextTreeAt=stageDistance()+999;
   godMode=debugRun=false;player.alive=true;player.invuln=0;player.currentHealthUnits=player.maxHealthUnits-1;
   gold=73;scrap=11;relics=[null,null,null,null,null];syncArtifactCache();
   window.swordAudit={slot,route:journeyRoute,before:{seed:journeyRoute.seed,loop,gold,scrap,health:player.currentHealthUnits,bossKills}};
   return {seed,slot:slot.id};
  }
 }throw Error('No normal sword slot');
};
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 const report={errors:[],missing:[],routes:[]};
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),requests=[];
  page.on('pageerror',e=>report.errors.push(e.message));page.on('request',r=>requests.push(new URL(r.url()).pathname));
  page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))report.missing.push(r.url());});
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(base+'/KnightRush.html');
  await page.waitForFunction(()=>window.KRSwordEvent&&window.KRMountedRunner?.ready,null,{timeout:120000,polling:100});
  assert.equal(await page.evaluate(()=>mode),'menu');
  assert.equal(requests.some(p=>p.includes('guardian-blender')),false,'Guardian loads only on approach');
  report.fixture=await page.evaluate(fixture);
  await page.evaluate(()=>{updateJourneyRoadEvents(0);});
  assert.equal(await page.evaluate(()=>journeyRoadEventSession),null,'Prefetch does not enter early');
  await page.evaluate(()=>{dist=swordAudit.slot.at;runDistance=roadScroll=dist;updateJourneyRoadEvents(0);});
  await page.waitForFunction(()=>boss?.definitionId==='ancientguardian'&&mode==='boss',null,{timeout:120000,polling:100});
  await page.evaluate(()=>journeyRoadEventSession.context.preparation);
  report.entry=await page.evaluate(()=>({definition:boss.definitionId,recipe:boss._sequence.recipe.id,revision:KRGuardianBlenderV9.stats().revision,
   routeSame:swordAudit.route===journeyRoute,token:boss.roadEventToken===journeyRoadEventSession.token,owned:journeyRoadEventSession.ownedMode,
   actorOwned:journeyRoadEventSession.context.game===boss,phase:journeyRoadEventSession.context.phase,godMode,debugRun,seed:journeyRoute.seed,
   loop,gold,scrap,health:player.currentHealthUnits,bossKills,before:swordAudit.before,hp:boss.maxhp,expectedHp:Math.round(55+progressionTier()*8),
   arena:KROathkeeperArena.report(),legacy:!!window.KRGuardianAttackNative}));
  const e=report.entry;assert.equal(e.recipe,'guardian-blender-v9');assert.equal(e.revision,16);assert.equal(e.owned,'boss');assert.equal(e.phase,'battle');
  for(const key of ['routeSame','token','actorOwned'])assert.equal(e[key],true,key);
  for(const key of Object.keys(e.before))assert.equal(e[key],e.before[key],'Entry preserves '+key);
  assert.equal(e.hp,e.expectedHp);assert.equal(e.godMode,false);assert.equal(e.debugRun,false);assert.equal(e.legacy,false);
  assert.equal(e.arena.assetId,'ancient-guardian-courtyard');assert.equal(e.arena.ready,true);
  console.log('NORMAL_SWORD_ENTRY_OK');
  assert.deepEqual(requests.filter(p=>/guardian-attack-|oathkeeper-adaptive|oathkeeper-2d|sword-clearing|sword-review/.test(p)),[],'No editor/retired encounter runtime');
  for(const [name,width,height] of [['phone',390,844],['desktop',1200,1000]]){
   await page.setViewportSize({width,height});await page.waitForTimeout(100);
   await page.evaluate(()=>{KRAncientGuardianEncounter.sequenceDriver.seek(boss,KRGuardianBlenderV9.gameTime(18.57));flashA=shakeMag=0;floaters.length=0;render();});
   await page.screenshot({path:path.join(out,name+'-battle.png')});
  }
  report.routes=await page.evaluate(()=>{
   const E=KRAncientGuardianEncounter,V=KRGuardianBlenderV9,c=journeyRoadEventSession.context,results=[];
   for(const hz of [30,60,120])for(const lane of [0,1,2]){
    let best;
    for(const duck of [6,6.08,5.95,6.15,6.22,6.3]){
     E.sequenceDriver.cancel(boss);c.game=E.startRoad(c);player.alive=true;player.currentHealthUnits=player.maxHealthUnits;player.invuln=0;
     player.x=player.lane=lane;player.jumpT=player.duckT=-1;const done=new Set();
     const once=(id,action)=>{if(!done.has(id)){done.add(id);handleAction(action);}};
     for(let i=0;i<hz*24&&boss._sequence&&player.alive;i++){
      const t=V.authoredTime(boss._sequence.time);
      if(t>=3.1)once('first',player.lane===2?'left':'right');
      if(t>=duck)once('swipe','down');
      if(t>=9.4)once('spike',player.lane===0?'right':'left');
      if(t>=14.12+player.lane*.06)once('low','up');
      for(let j=0;j<5;j++)if(t>=18.88+j*1.05)once('five'+j,player.lane===2?'left':'right');
      update(1/hz);
     }
     const r={hz,lane,hits:E.state().stats?.hits,health:player.currentHealthUnits,maxHealth:player.maxHealthUnits,phase:boss.phase,owned:journeyRoadEventSession.ownedMode};
     if(!best||r.hits<best.hits)best=r;if(!r.hits)break;
    }results.push(best);
   }return results;
  });
  for(const r of report.routes){assert.equal(r.hits,0,JSON.stringify(r));assert.equal(r.health,r.maxHealth);assert.equal(r.phase,'player');assert.equal(r.owned,'boss');}
  console.log('NORMAL_SWORD_ROUTES_OK',report.routes.length);
  report.repeat=await page.evaluate(()=>{endPlayerTurn();update(1/60);return {source:boss._sequence.frame.pose.authoredTime,enemyTurn:boss.enemyTurn};});
  assert.equal(report.repeat.source,2.24);assert.equal(report.repeat.enemyTurn,2);
  report.pause=await page.evaluate(()=>{const time=boss._sequence.time,hp=player.currentHealthUnits;paused=true;frame(performance.now());render();render();paused=false;return time===boss._sequence.time&&hp===player.currentHealthUnits;});assert.equal(report.pause,true);
  report.victory=await page.evaluate(()=>{
   const c=journeyRoadEventSession.context,route=journeyRoute,seed=route.seed,stage=loop,beforeGold=gold,beforeScrap=scrap,kills=bossKills;
   boss.hp=0;defeatBoss();boss.stateT=2.6;updateBoss(.01);
   const result={mode,phase:c.phase,paid:c.paid,coins:c.coins,scrap:c.scrap,goldDelta:gold-beforeGold,scrapDelta:scrap-beforeScrap,
    routeSame:journeyRoute===route,seedSame:journeyRoute.seed===seed,stageSame:loop===stage,killsSame:bossKills===kills,clean:!activeBossSequenceDriver(),arenaActive:KROathkeeperArena.active()};
   const paidGold=gold;KRSwordEvent.victory(c);result.noDoublePay=gold===paidGold;
   c.phaseTime=1;handleJourneyRoadEventAction('continue');result.exitMode=mode;result.closed=journeyRoadEventSession===null;result.noBoss=boss===null;
   return result;
  });
  const v=report.victory;assert.equal(v.mode,'journeyevent');assert.equal(v.phase,'victory');assert.equal(v.goldDelta,v.coins);assert.equal(v.scrapDelta,v.scrap);
  for(const key of ['paid','routeSame','seedSame','stageSame','killsSame','clean','noDoublePay','closed','noBoss'])assert.equal(v[key],true,key);
  assert.equal(v.exitMode,'run');assert.equal(v.arenaActive,false);
  await page.evaluate(fixture);await page.evaluate(()=>{dist=swordAudit.slot.at;runDistance=roadScroll=dist;updateJourneyRoadEvents(0);});
  await page.waitForFunction(()=>boss?.definitionId==='ancientguardian'&&mode==='boss',null,{polling:100});
  report.death=await page.evaluate(()=>{player.currentHealthUnits=144;player.invuln=0;godMode=false;KRAncientGuardianEncounter.sequenceDriver.seek(boss,KRGuardianBlenderV9.gameTime(3.55));for(let i=0;i<360&&player.alive;i++)update(1/120);update(1/120);return {alive:player.alive,sequence:!!boss?._sequence,session:!!journeyRoadEventSession,arena:KROathkeeperArena.active()};});
  assert.deepEqual(report.death,{alive:false,sequence:false,session:false,arena:false});
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.missing,[]);
  fs.writeFileSync(path.join(out,'audit.json'),JSON.stringify(report,null,2));
  console.log('GUARDIAN_SWORD_EVENT_OK',JSON.stringify({entry:e.recipe,routes:report.routes.length,repeat:report.repeat,victory:v,death:report.death}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
