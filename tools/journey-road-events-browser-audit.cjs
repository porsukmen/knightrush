const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:480,height:800},hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});
  await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  const tap=async(x,y)=>{
   const p=await run(`({x:(${x}*viewScale+viewX)/renderDpr(),y:(${y}*viewScale+viewY)/renderDpr()})`);
   await page.touchscreen.tap(p.x,p.y);
  };
  await run(`SFX.toggle();journeyRoadEventHandlers.clear();
   function findRoadFixture(definition){
    for(let seed=0;seed<100;seed++){
     startJourneyWithSeed(seed);godMode=true;
     for(const n of journeyRoute.nodes)for(const e of n.out){
      const slot=e.events.find(s=>s.definition===definition);if(!slot)continue;
      journeyRoute.from=n.id;journeyRoute.next=e.to;journeyRoute.activeEdge=e.id;
      armJourneyNode();dist=slot.at-.1;runDistance=dist;roadScroll=dist;
      obstacles=[];pickups=[];nextSpawnAt=stageDistance();return slot;
     }
    }throw Error('Fixture missing');
   }
   globalThis.fixture=findRoadFixture('disco_finale');
   globalThis.removeAdapter=registerJourneyRoadEvent('disco_finale',{
    start:ctx=>{globalThis.savedEventContext=ctx;ctx.openMode(ret=>startDiscoDance(biome,ret));},
    dispose:()=>{discoGame=null;}
   });
   update(1/60);render();`);
  assert.equal(await run('mode'),'discodance');
  const frozen=await run('JSON.stringify([dist,runDistance,roadScroll])');
  const start=await run('({x:DISCO_START_BTN.x+DISCO_START_BTN.w/2,y:DISCO_START_BTN.y+DISCO_START_BTN.h/2})');
  await tap(start.x,start.y);assert.equal(await run('discoGame.phase'),'rise');
  await run('for(let i=0;i<120;i++)update(1/60);render();');
  assert.equal(await run('JSON.stringify([dist,runDistance,roadScroll])'),frozen);
  await page.keyboard.press('Escape');assert.equal(await run('paused'),true);
  await page.keyboard.press('Escape');assert.equal(await run('paused'),false);
  await tap(45,70);assert.equal(await run('mode'),'run');
  assert.equal(await run('journeyRoadEventSession'),null);
  assert.equal(await run('journeyRoute.eventRecords[fixture.id].status'),'skipped');
  await run('update(1/60);');assert.notEqual(await run('JSON.stringify([dist,runDistance,roadScroll])'),frozen);
  await run(`removeAdapter();fixture=findRoadFixture('roadside_quest');
   globalThis.removeMoving=registerJourneyRoadEvent('roadside_quest',{
    start:ctx=>globalThis.savedEventContext=ctx,
    action:(ctx,action)=>{if(action==='tap'){ctx.finish({status:'accepted'});return true;}return false;}
   });update(1/60);render();`);
  assert.equal(await run('mode'),'run');const previous=await run('dist');
  await page.keyboard.press('ArrowRight');assert.equal(await run('player.lane'),2);
  await run('update(1/60);render();');assert((await run('dist'))>previous);
  await tap(240,450);assert.equal(await run('journeyRoadEventSession'),null);
  assert.equal(await run('journeyRoute.eventRecords[fixture.id].status'),'accepted');
  await run('removeMoving();startJourneyWithSeed(0,true);render();');
  const out=path.resolve('output/journey-road-foundation');fs.mkdirSync(out,{recursive:true});
  await page.screenshot({path:path.join(out,'road-regions-map.png')});
  assert.deepEqual(errors,[]);
  console.log('JOURNEY_ROAD_BROWSER_OK real minigame adapter launch/back; pause; frozen distance; moving event input/finish; region map');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
