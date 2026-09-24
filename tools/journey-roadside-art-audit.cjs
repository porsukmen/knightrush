const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href+'?roadlab=1');
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
  const run=code=>page.evaluate(code=>(0,eval)(code),code),out=path.resolve('output/roadside-sharp-plane');fs.mkdirSync(out,{recursive:true});
  const shot=async name=>{await run('flashA=0;shakeMag=0;render()');await page.screenshot({path:path.join(out,name+'.png')});};
  await run(`SFX.toggle();
    function artFixture(content,enter=true){
      const index=ROAD_LAB_CASES.findIndex(c=>c.content===content||(content==='camp'&&c.id==='camp'));
      startRoadLabCase(index>=0?index:ROAD_LAB_CASES.findIndex(c=>c.content==='traveler'));
      const slot=roadLabState.slot;slot.content=content;
      dist=slot.at-10;roadScroll=dist;obstacles=[];pickups=[];
      updateJourneyRoadEvents(0);
      player.x=player.lane=journeyNormalSide(slot)+1;
      if(!enter)return;
      handleJourneyRoadEventAction(player.lane===2?'right':'left');update(.3);
      if(content==='chicken_return')journeyChickenQuest={status:'ready',count:5};
      if(content==='traveler_return')journeyTravelerFavor={status:'waiting'};
    }
  `);
  for(const content of ['mushrooms','chickens','taxman','traveler','well','camp']){
   await run(`artFixture('${content}',false);setCurvedWorldTrial(true);`);await shot('road-'+content);
  }
  for(const content of ['mushrooms','chickens','chicken_return','traveler','traveler_return','taxman','well','chest','camp']){
   await run(`artFixture('${content}');perfNow=2.4;`);
   assert.equal(await run('mode'),'journeyevent',content);
   const state=await run('JSON.stringify([gold,scrap,dist,journeyMushroomQuest,journeyChickenQuest,journeyTravelerFavor,journeyRoadEventSession.context.dialogue])');
   await shot('mobile-'+content);
   assert.equal(await run('JSON.stringify([gold,scrap,dist,journeyMushroomQuest,journeyChickenQuest,journeyTravelerFavor,journeyRoadEventSession.context.dialogue])'),state,'Render must not mutate '+content);
   await run('perfNow+=.55;render();');
   if(content==='taxman'||content==='well'){
    await run("handleJourneyRoadEventAction('choice1');update(.3);");await shot('mobile-'+content+'-game');
   }
  }
  await page.setViewportSize({width:1280,height:900});await run('resize()');
  for(const content of ['mushrooms','taxman','well','camp']){
   await run(`artFixture('${content}');perfNow=2.4;`);await shot('desktop-'+content);
  }
  assert(await run('roadsideSceneCache.size<=4'));
  assert.deepEqual(errors,[]);console.log('ROADSIDE_RENDER_SMOKE_OK (not visual approval) 9 story/camp scenes + 2 embedded games, DPR2 mobile / desktop, render purity, bounded cache; '+out);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
