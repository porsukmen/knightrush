const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/autumn-caravan');
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 try{for(const [device,width,height,dpr]of [['desktop',775,1000,1],['phone',390,844,2]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(({phone})=>{window.requestAnimationFrame=()=>0;
   Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>phone?4:8});Object.defineProperty(navigator,'deviceMemory',{get:()=>phone?4:8});},{phone:device==='phone'});
  await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
  await page.waitForFunction(()=>window.KRAutumnCaravan&&window.KRSunlitForest);
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  const shot=async name=>{await run('render();');await page.screenshot({path:path.join(out,device+'-'+name+'.png')});};
  const start=async(theme='caravan',direction=0)=>run(`roadLabState.entry=${direction!==0};roadLabState.direction=${direction};
   Math.random=(()=>{let seed=731;return()=>((seed=Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;})();
   startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='${theme}'));godMode=true;SFX.setTestMuted(true);`);
  if(device==='desktop')for(const theme of ['bloodwood','disco']){await start(theme);await run('dist=roadLabState.slot.at-90;roadScroll=dist;');await shot('reference-'+theme);}
  await start();
  const spawning=await run(`(()=>{const seen=new Set(),bad=[],counts={},orig=KRAutumnCaravan.hazard;
   KRAutumnCaravan.hazard=(o,p)=>{counts[o.kind]=(counts[o.kind]||0)+1;return orig(o,p);};
   try{for(let f=0;f<8000&&mode==='run'&&dist<roadLabState.slot.at-110;f++){update(1/60);
    for(const o of obstacles){seen.add(o.kind);if(journeyObstacleThemeAt(dist+o.z)==='caravan'&&o.roadTheme!=='caravan')bad.push(o.kind);}
    if(f%12===0)render();}return {seen:[...seen],bad,counts};}finally{KRAutumnCaravan.hazard=orig;}})()`);
  assert.deepEqual(spawning.bad,[]);assert(spawning.counts.boulder>0&&spawning.counts.pond>0);
  assert.equal(await run("KRAutumnCaravan.hazard({kind:'pond'},()=>{})"),false,'Retain native pond renderer');
  await shot('road');
  await run('globalThis.savedCaravanObstacles=obstacles;');
  for(const kind of ['boulder','pond','root'])for(const lanes of kind==='root'?[[0,1]]:[[1],[0,1],[0,1,2],[0,2]]){
   await run(`(()=>{const req=[null,null,null];for(const lane of ${JSON.stringify(lanes)})req[lane]='jump';
    const o=new ObstacleEntity('${kind}',23,req,'L');o.roadTheme=journeyObstacleThemeAt(dist+23);obstacles=[o];})()`);await shot(kind+'-'+lanes.join(''));
  }
  await run('obstacles=savedCaravanObstacles;delete globalThis.savedCaravanObstacles;');
  await run('dist=roadLabState.slot.at-25;roadScroll=dist;obstacles=[];pickups=[];');await shot('venue');
  const venue=await run('KRAutumnCaravan.venueLayout(journeyForestEdgeAt(roadLabState.slot.at))');
  assert(venue.rug.left>6&&venue.merchant.offset>8&&venue.caravan.offset>10,'Camp must leave all three road lanes clear');
  assert.notEqual(venue.merchant.at,venue.caravan.at,'Separate world-depth contacts, not one scene billboard');
  for(const remaining of [55,12,1]){
   await run(`dist=roadLabState.slot.at-${remaining};roadScroll=dist;`);await shot('venue-'+remaining);
  }
  await run('dist=roadLabState.slot.at;updateJourneyRoadEvents(0);');
  assert.equal(await run('mode'),'run','Do not open the shop at the old distant trigger');
  assert.equal(await run('journeyRoadEventTriggerAt(roadLabState.slot)'),venue.eventAt);
  assert.equal(venue.merchant.at-venue.eventAt,12,'Enter only within the roadside interaction range');
  await run('dist=journeyRoadEventTriggerAt(roadLabState.slot)-1;roadScroll=dist;');await shot('alongside');
  assert.equal(await run('journeyStepDistance(10)'),10,'Roadside services must not brake the runner');
  await run('updateJourneyRoadEvents(0);');assert.equal(await run('mode'),'run');
  await run('dist=journeyRoadEventTriggerAt(roadLabState.slot);roadScroll=dist;updateJourneyRoadEvents(0);gold=150;');
  assert.equal(await run('mode'),'run','Merchant waits for an outward swipe');
  await run("player.x=player.lane=2;handleAction('right',null,null,{fresh:true,mode:'run',roadStop:roadLabState.slot.id});");
  assert.equal(await run('mode'),'merchant');await page.waitForFunction(()=>KRCutscenes?.report().state==='ready');await shot('shop');
  const state=await run('JSON.stringify([gold,merchantShop.stock,relics,dist,roadScroll])');
  await run('KRAutumnCaravan.drawShop(false);');await page.screenshot({path:path.join(out,device+'-neutral-light.png')});
  await run('KRAutumnCaravan.drawShop(true);');await page.screenshot({path:path.join(out,device+'-scene-light.png')});
  assert.equal(await run('JSON.stringify([gold,merchantShop.stock,relics,dist,roadScroll])'),state);
  const lighting=await run(`(()=>{
   const original=expPoly,helpers=[rigPolygon,rigSegment,rigJoint,px,townInk,townStroke],colors=[];
   try{
    expPoly=(v,c)=>{if(v[0][0]===85&&v[0][1]===432)colors.push(c);return original(v,c);};
    KRAutumnCaravan.drawShop(false);KRAutumnCaravan.drawShop(true);KRAutumnCaravan.drawShop(false);
    try{KRAutumnCaravan.withLighting(()=>{throw Error('restore-probe');});}catch(e){if(e.message!=='restore-probe')throw e;}
    return {colors,restored:helpers.every((h,i)=>h===[rigPolygon,rigSegment,rigJoint,px,townInk,townStroke][i]),filter:g.filter};
   }finally{expPoly=original;}
  })()`);
  assert.deepEqual(lighting.colors,['#467f80','#438f85','#467f80'],'Seated legs must receive scene lighting without leaking into neutral view');
  assert(lighting.restored,'Lighting helpers leaked after an exception');assert.equal(lighting.filter,'none');
  await run('KRAutumnCaravan.drawShop(true);');
  const manager=await run('KREventVisuals.report()');assert.equal(manager.active,'autumn-caravan');assert.equal(manager.entries.length,1);assert.equal(manager.tier,device==='phone'?'mobile':'standard');
  const tap=async(x,y)=>{const p=await run(`({x:(${x}*viewScale+viewX)/renderDpr(),y:(${y}*viewScale+viewY)/renderDpr()})`);await page.touchscreen.tap(p.x,p.y);};
  await tap(365,708);assert.equal(await run('gold'),140);await tap(365,708);assert.equal(await run('gold'),140);await run('updateMerchantShop(.5);');
  for(let i=0;i<4;i++){await tap(75+i*110,490);assert.equal(await run('merchantShop.selected'),i);}
  await tap(150,708);assert.equal(await run('gold'),120);await tap(150,708);assert.equal(await run('gold'),120);
  await run('updateMerchantShop(.9);');await shot('handoff');await run('updateMerchantShop(1);');await shot('sold');
  await tap(240,762);assert.equal(await run('mode'),'run');assert.equal(await run('KREventVisuals.report().reservedBytes'),0);
  assert.equal(await run('journeyVenueVisible(roadLabState.slot.id)'),false);
  const retained=await run(`(()=>{const edge=journeyForestEdgeAt(roadLabState.slot.at),v=KRAutumnCaravan.venueLayout(edge),items=[],original=queueWorldDraw;
   try{queueWorldDraw=(d,fn,item)=>items.push(item.kind);
    KRAutumnCaravan.queueView({edge,point:(at,offset)=>({x:offset,z:at})});
   }finally{queueWorldDraw=original;}return items;})()`);
  assert(retained.includes('seated-merchant')&&retained.includes('parked-caravan'),'Visited camp stays queued on the roadside');
  await shot('return-road');
  await run('updateJourneyRoadEvents(0);');assert.equal(await run('mode'),'run','Completed merchant never retriggers');
  await run('for(let i=0;i<30;i++)update(1/60);');await shot('passing-camp');
  for(const direction of [-1,1]){
   await start('caravan',direction);await run(`for(let i=0;i<400&&dist<roadLabState.fixture.node.at-20;i++)update(1/60);
    player.x=player.lane=${direction+1};chooseJourneyDirection(${direction});for(let i=0;i<300&&journey.phase!=='turning';i++)update(1/60);
    for(let i=0;i<30;i++)update(1/120);`);await shot('turn'+direction);
   assert(await run('journey.sunlitPreview.obstacles.every(i=>i.entity.roadTheme===journeyObstacleThemeAt(i.at))'));
   await run('for(let i=0;i<240;i++)update(1/120);');assert.notEqual(await run('journey.phase'),'turning');
  }
  await run('openMerchantLab();');await page.waitForFunction(()=>KRCutscenes.report().state==='ready');await shot('lab');
  await tap(240,787);assert.equal(await run('mode'),'debugcfg');assert.equal(await run('KREventVisuals.report().reservedBytes'),0);
  // Cancel while loading: no late image/adapter callback may re-open the plate.
  await run("openMerchantLab();setMode('menu');");await page.waitForTimeout(150);
  assert.equal(await run('KREventVisuals.report().reservedBytes'),0);
  assert(await run('KRSunlitForest.report().cacheBytes<=5*1048576'));assert.deepEqual(errors,[]);
  console.log(device,JSON.stringify({spawning,manager}));await page.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
