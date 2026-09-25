const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/treasure-road');
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});const reports=[];
 try{for(const [device,width,height,dpr]of [['desktop',775,1000,1],['phone',390,844,2]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(({phone})=>{window.requestAnimationFrame=()=>0;
   Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>phone?4:8});Object.defineProperty(navigator,'deviceMemory',{get:()=>phone?4:8});},{phone:device==='phone'});
  await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
  await page.waitForFunction(()=>window.KRTreasureRoad&&window.KRSunlitForest);
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  const shot=async name=>{await run('render();');await page.screenshot({path:path.join(out,device+'-'+name+'.png')});};
  const start=async(theme='chest',direction=0)=>run(`roadLabState.entry=${direction!==0};roadLabState.direction=${direction};
   Math.random=(()=>{let seed=731;return()=>((seed=Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;})();
   startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='${theme}'));godMode=true;SFX.setTestMuted(true);`);
  if(device==='desktop')for(const theme of ['bloodwood','disco']){await start(theme);await run('dist=roadLabState.slot.at-90;roadScroll=dist;');await shot('reference-'+theme);}
  await start();
  const spawned=await run(`(()=>{const seen=new Set(),wrong=[],drawn={},draw=KRTreasureRoad.hazard;
   KRTreasureRoad.hazard=(o,p)=>{drawn[o.kind]=(drawn[o.kind]||0)+1;return draw(o,p);};
   try{for(let i=0;i<7000&&mode==='run'&&dist<roadLabState.slot.at-100;i++){update(1/60);
    for(const o of obstacles){seen.add(o.kind);if(journeyObstacleThemeAt(dist+o.z)==='chest'&&o.roadTheme!=='chest')wrong.push(o.kind);}
    if(i%16===0)render();}return {seen:[...seen],wrong,drawn};}finally{KRTreasureRoad.hazard=draw;}})()`);
  assert.deepEqual(spawned.wrong,[]);assert(spawned.drawn.boulder>0&&spawned.drawn.pond>0);
  // Isolated lane geometry checks supplement (not replace) genuine spawn coverage.
  await run('globalThis.treasureSavedObstacles=obstacles;');
  for(const kind of ['boulder','pond'])for(const lanes of [[1],[0,1],[0,1,2],[0,2]]){
   await run(`(()=>{const req=[null,null,null];for(const i of ${JSON.stringify(lanes)})req[i]='jump';
    const o=new ObstacleEntity('${kind}',23,req,'L');o.roadTheme=journeyObstacleThemeAt(dist+23);obstacles=[o];})()`);
   await shot(kind+'-'+lanes.join(''));
  }
  await run('obstacles=treasureSavedObstacles;delete globalThis.treasureSavedObstacles;');
  await shot('road');await run('dist=roadLabState.slot.at-22;roadScroll=dist;obstacles=[];pickups=[];');await shot('venue');
  await run(`dist=roadLabState.slot.at;updateJourneyRoadEvents(0);`);assert.equal(await run('mode'),'lockpicking');
  await page.waitForFunction(()=>KRCutscenes?.report().state==='ready');
  await shot('intro');await run('globalThis.chestBefore={gold,dist,roadScroll,loop};');
  const tap=async(x,y)=>{const pt=await run(`({x:(${x}*viewScale+viewX)/renderDpr(),y:(${y}*viewScale+viewY)/renderDpr()})`);await page.touchscreen.tap(pt.x,pt.y);};
  const photo=async name=>{
   const p=await run('({x:PAUSE_BTN.x+PAUSE_BTN.w/2,y:PAUSE_BTN.y+uiTop+PAUSE_BTN.h/2})');
   await tap(p.x,p.y);assert.equal(await run('paused'),true);
   await tap(240,443);assert.equal(await run('pausePhotoMode'),true);
   const before=await run('JSON.stringify([lockpickGame?.phaseT,lockpickGame?.pins,gold])');
   await run('update(.05);');assert.equal(await run('JSON.stringify([lockpickGame?.phaseT,lockpickGame?.pins,gold])'),before);
   await shot('photo-'+name);
   await tap(240,100);assert.equal(await run('pausePhotoMode'),false);assert.equal(await run('paused'),true);
   await tap(240,100);assert.equal(await run('paused'),false);
  };
  await photo('intro');
  await tap(240,684);assert.equal(await run('lockpickGame.phase'),'playing');await shot('mechanism');
  await photo('mechanism');
  // Real two-tap touch mode, not direct state editing or invoking settle.
  await tap(84,403);assert.equal(await run('lockpickGame.pins[0].state'),'active');
  await run('for(let i=0;i<400&&lockpickGame.pins[0].segment!=="apex";i++)update(1/240);');
  await tap(84,403);assert.equal(await run('lockpickGame.pins[0].state'),'set');
  // Existing hold/release gesture works through the captured pointer callback.
  const cdp=await page.context().newCDPSession(page);
  for(let i=1;i<5;i++){
   const pt=await run(`({x:(${84+i*78}*viewScale+viewX)/renderDpr(),y:(403*viewScale+viewY)/renderDpr()})`);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[pt]});
   assert.equal(await run('lockpickGame.holdingIndex'),i);
   await run(`for(let f=0;f<400&&lockpickGame.pins[${i}].segment!=='apex';f++)update(1/240);`);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   assert.equal(await run(`lockpickGame.pins[${i}].state`),'set');
  }
  assert.equal(await run('lockpickGame.phase'),'opening');await run('update(.8);');await shot('opening-early');
  await run('update(.7);');await shot('opening-mid');await photo('opening');await run('update(.7);');await shot('opening-full');
  await run('for(let i=0;i<160;i++)update(1/120);update(.25);');assert.equal(await run('mode'),'journeyevent');
  assert.equal(await run('lockpickGame'),null);await shot('loot');
  await photo('loot');
  const plate=await run('KREventVisuals.report()');assert.equal(plate.active,'treasure-grove');assert.equal(plate.entries.length,1);assert.equal(plate.tier,device==='phone'?'mobile':'standard');
  const reward=await run('journeyRoadEventSession.context.loot.entries[0].amount');
  await tap(240,570);await tap(240,570);assert.equal(await run('gold'),await run('chestBefore.gold')+reward);
  await shot('claimed');await tap(240,730);assert.equal(await run('mode'),'run');
  assert.equal(await run('KREventVisuals.report().reservedBytes'),0);assert.equal(await run('journeyVenueVisible(roadLabState.slot.id)'),false);
  // Failure, free practice bumps, pause and cancellation must not pay loot.
  await start();await run('dist=roadLabState.slot.at;updateJourneyRoadEvents(0);beginLockpickingRound();');
  await run('beginLockpickHold(0);endLockpickHold();for(let i=0;i<200;i++)update(1/120);');assert.equal(await run('lockpickGame.picks'),3);
  await run('for(let i=0;i<3;i++){beginLockpickHold(0);update(.13);endLockpickHold();}for(let i=0;i<200;i++)update(1/120);update(.25);');
  assert.equal(await run('journeyRoadEventSession.context.loot.won'),false);assert.equal(await run('journeyRoadEventSession.context.loot.entries.length'),0);await shot('failed');
  await run("handleAction('continue');");assert.equal(await run('mode'),'run');
  for(const direction of [-1,1]){
   await start('chest',direction);await run(`for(let i=0;i<400&&dist<roadLabState.fixture.node.at-20;i++)update(1/60);
    player.x=player.lane=${direction+1};chooseJourneyDirection(${direction});for(let i=0;i<300&&journey.phase!=='turning';i++)update(1/60);
    for(let i=0;i<30;i++)update(1/120);`);await shot('turn-'+direction);
   assert(await run("journey.sunlitPreview.obstacles.every(i=>i.entity.roadTheme===journeyObstacleThemeAt(i.at))"));
   await run('for(let i=0;i<240;i++)update(1/120);');assert.notEqual(await run('journey.phase'),'turning');
  }
  assert(await run('KRSunlitForest.report().cacheBytes<=5*1048576'));assert.deepEqual(errors,[]);
  await run('startLockpicking();leaveLockpicking();');
  await page.waitForTimeout(100);
  assert.equal(await run('mode'),'minigames');
  assert.equal(await run('KREventVisuals.report().reservedBytes'),0,'rapid standalone exit must cancel pending image activation');
  // Actual intro hit targets select all four levels; configuration applies to
  // timing, remaining picks and resets, but cannot change during an attempt.
  for(const [index,key]of ['easy','normal','hard','master'].entries()){
   await run('startLockpicking();');await tap(78+index*108,745);
   assert.equal(await run('lockpickGame.difficulty'),key);await tap(240,684);
   const level=await run(`(()=>{const l=lockpickGame,d=KRTreasureRoad.difficulties.${key},picks=l.picks;
    for(let i=0;i<2;i++){beginLockpickHold(i);updateLockpicking(l.pins[i].rise+l.pins[i].apex/2);endLockpickHold();}
    beginLockpickHold(2);updateLockpicking(.11);endLockpickHold();
    const out={picks,remaining:l.picks,set:l.setCount,apex:l.pins[2].apex,canChange:KRTreasureRoad.selectDifficulty('easy'),expected:d};leaveLockpicking();return out;})()`);
   assert.equal(level.picks,level.expected.picks);assert.equal(level.remaining,level.expected.picks-1);
   assert.equal(level.set,Math.max(0,2-level.expected.reset));assert.equal(level.canChange,false);assert(level.expected.apex.includes(level.apex));
  }
  await run("startLockpicking();KRTreasureRoad.selectDifficulty('hard');leaveLockpicking();");
  // Timing contract: near-apex movement no longer counts, wrong second tap is
  // not mistaken for the first free bump, and two already-set pins fall.
  const difficulty=await run(`(()=>{
   startLockpicking();beginLockpickingRound();const l=lockpickGame;
   const catches=[];for(let i=0;i<2;i++){beginLockpickHold(i);updateLockpicking(l.pins[i].rise+.01);endLockpickHold();catches.push(l.pins[i].state);}
   beginLockpickHold(2);updateLockpicking(l.pins[2].rise*.97);endLockpickHold();
   const nearMiss={picks:l.picks,setCount:l.setCount,catches};
   beginLockpickHold(3);endLockpickHold();updateLockpicking(.02);beginLockpickHold(3);
   const earlySecondTap=l.picks;
   const profiles=[];for(let i=0;i<7;i++){beginLockpickHold(4);endLockpickHold();profiles.push([l.pins[4].rise,l.pins[4].apex]);updateLockpicking(1);}
   leaveLockpicking();return {nearMiss,earlySecondTap,profiles};})()`);
  assert.deepEqual(difficulty.nearMiss,{picks:2,setCount:0,catches:['set','set']});assert.equal(difficulty.earlySecondTap,1);
  assert.equal(new Set(difficulty.profiles.map(p=>p[0])).size,3);assert(difficulty.profiles.every(p=>p[1]<=.115));
  reports.push({device,spawned,plate,reward,errors});await page.close();
 }fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(reports,null,2));console.log('TREASURE_ROAD_OK road spawns / both turns / touch tap and hold / hinged opening / single image tiers / reward once / release / failure');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
