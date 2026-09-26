const {chromium}=require('playwright'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),out=path.resolve('output/wolf-den-presentation');
 fs.mkdirSync(out,{recursive:true});
 try{for(const mobile of [false,true]){
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1100,height:900},deviceScaleFactor:mobile?2:1,hasTouch:mobile});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href+'?roadlab=1');
  await page.waitForFunction(()=>document.querySelector('#game')?.dataset.bootReady==='1');
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  await run(`startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.id==='wolfden'));
   dist=roadLabState.slot.at;obstacles=[];pickups=[];updateJourneyRoadEvents(0);
   player.x=player.lane=journeyNormalSide(roadLabState.slot)+1;
   handleJourneyRoadEventAction(player.lane===2?'right':'left');debugRun=false;flashA=0;shakeMag=0;`);
  assert(await run("prepareCutscene('wolf-den-forest',true,journeyRoadEventSession.context.token)"));
  assert(await run("!ROAD_LAB_CASES.some(c=>c.id==='chickens')&&Array.from({length:1000},(_,i)=>journeyNormalContent({id:'audit-'+i,seed:i,definition:'roadside_quest'})).every(c=>c!=='chickens')"));
  for(const t of [0,1.75,2.2,2.5,3.2,4.4]){
   await run(`journeyRoadEventSession.context.den.t=${t};perfNow=${t};render()`);
   await page.screenshot({path:path.join(out,`${mobile?'phone':'desktop'}-motion-${t}.png`)});
  }
  await run('paused=true');const before=await run('journeyRoadEventSession.context.den.t');
  await run('update(1)');assert.equal(await run('journeyRoadEventSession.context.den.t'),before);await run('paused=false');
  await run('wolfDenSlide(journeyRoadEventSession.context,"entrance")');
  await run("prepareCutscene('wolf-den-outside',true,journeyRoadEventSession.context.token)");
  await run('update(.3)');
  const pt=await run('({x:(90*viewScale+viewX)/renderDpr(),y:((479*(800+PAD_TOT)/800-PAD_TOP)*viewScale+viewY)/renderDpr()})');
  if(mobile)await page.touchscreen.tap(pt.x,pt.y);else await page.mouse.click(pt.x,pt.y);
  assert.equal(await run('journeyMeat'),1,'Click real displayed meat, not stale unpadded coordinates');
  // Same native rig/pose, neutral vs scene material adapters; no screen filter.
  await run(`g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle='#192b30';g.fillRect(0,0,480,280);
   KRWolfDen.wolf(120,240,2.5,0,0,0,false,false,true);KRWolfDen.wolf(330,240,2.5,0,0,0,false,false,false);g.restore();`);
  await page.screenshot({path:path.join(out,`${mobile?'phone':'desktop'}-lighting.png`)});
  await run("startWolfDenFight(journeyRoadEventSession.context)");
  assert(await run("prepareCutscene('wolf-den-inside',true,journeyRoadEventSession.context.token)"));
  const active=await run('KRCutscenes.report()');assert.equal(active.scene,'wolf-den-inside');assert.equal(active.state,'ready');
  await run('openRoadLab()');assert.equal(await run('KRCutscenes.report().state'),'idle');
  assert.deepEqual(errors,[]);await page.close();
 }console.log('WOLF_DEN_PRESENTATION_OK desktop/phone motion, native lighting, exact meat hotspot, no new chicken encounters, pause, scene switch and release');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
