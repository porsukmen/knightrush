const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs');
const out=path.resolve('output/fight-loot');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  for(const [name,width,height,dpr] of [['desktop',1000,1000,1],['phone',390,844,2],['small-phone',320,568,2]]){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:true}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>requestAnimationFrame=()=>0);
   if(name!=='desktop')await page.addInitScript(()=>{
    Object.defineProperty(navigator,'deviceMemory',{get:()=>4});
    Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>4});
   });
   const run=s=>page.evaluate(s=>(0,eval)(s),s);
   const shot=async n=>{await run('render()');await page.screenshot({path:path.join(out,`${name}-${n}.png`)});};
   const tap=async(x,y)=>{
    const p=await run(`({x:(${x}*viewScale+viewX)/renderDpr(),y:(${y}*viewScale+viewY)/renderDpr()})`);
    await page.touchscreen.tap(p.x,p.y);
   };
   await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href+'?fightlootlab=1');
   await page.waitForFunction(()=>window.KRCutscenes?.report().state==='ready',null,{polling:100,timeout:20000});
   assert.equal(await run('mode'),'journeyevent');
   assert.equal(await run('journeyRoadEventSession.context.loot.fight'),true);
   const before=await run('({gold,scrap,dist,roadScroll})');
   await run('update(.25);flashA=0;shakeMag=0');await shot('unclaimed');
   assert.deepEqual(await run('({gold,scrap,dist,roadScroll})'),before);
   const rewards=await run('journeyRoadEventSession.context.loot.entries.map(e=>e.amount)');
   await run('paused=true');await tap(139,404);
   assert.equal(await run('gold'),before.gold);
   await run('paused=true;pausePhotoMode=true');await shot('photo');
   await run('paused=false;pausePhotoMode=false');
   await tap(139,404);await tap(139,404);
   assert.equal(await run('gold'),before.gold+rewards[0]);
   await run('update(.18)');await shot('pickup');
   await run('update(.4)');await shot('one-claimed');
   await tap(331,450);await tap(331,450);await run('update(.5)');
   assert.equal(await run('scrap'),before.scrap+rewards[1]);
   assert.equal(await run('dist'),before.dist);await shot('collected');
   const bytes=await run('KREventVisuals.report()');console.log(name,JSON.stringify(bytes));
   assert.equal(bytes.tier,name==='desktop'?'standard':'mobile');
   await tap(240,735);assert.equal(await run('mode'),'run');
   assert.equal(await run('KRCutscenes.report().state'),'idle');
   assert.equal(await run('KREventVisuals.report().reservedBytes'),0);
   // Loading/missing-asset fallback must keep the same live props and claims.
   await run(`roadLabState.entry=false;startRoadLabCase(8);dist=roadLabState.slot.at;roadScroll=dist;
    updateJourneyRoadEvents(0);boss.hp=0;defeatBoss();boss.stateT=2.6;updateBoss(.016);
    clearEventVisuals();update(.25);`);
   await shot('fallback');
   await page.keyboard.press('1');await page.keyboard.press('2');
   assert(await run('journeyRoadEventSession.context.loot.entries.every(e=>e.claimed)'));
   await page.keyboard.press('Enter');assert.equal(await run('mode'),'run');
   assert.deepEqual(errors,[]);await page.close();
  }
  console.log('FIGHT_LOOT_OK desktop/phone/small phone; combat->loot, touch, keyboard, pause, photo, pickup, claim-once, frozen road, fallback, release');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
