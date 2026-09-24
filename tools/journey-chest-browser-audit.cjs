const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,deviceScaleFactor:2}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.resolve('RoadTest.html')).href);
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
  const run=code=>page.evaluate(code=>(0,eval)(code),code),out=path.resolve('output/journey-chest-browser');fs.mkdirSync(out,{recursive:true});
  const point=(x,y)=>run(`({x:(${x}*viewScale+viewX)/renderDpr(),y:(${y}*viewScale+viewY)/renderDpr()})`);
  const tap=async(x,y)=>{const p=await point(x,y);await page.touchscreen.tap(p.x,p.y);};
  const shot=async name=>{await run('render()');await page.screenshot({path:path.join(out,name+'.png')});};
  const cdp=await page.context().newCDPSession(page);
  const hold=async index=>{const p=await point(84+index*78,403);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});};
  const release=()=>cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.equal(await run('roadLabVisibleCases().length'),6);
  assert(await run('roadLabVisibleCases().at(-1).entry.id==="chest"'));
  await tap(350,432);assert.equal(await run('ROAD_LAB_CASES[roadLabState.index].id'),'chest');
  const arrive=async()=>{
   await run('dist=roadLabState.slot.at-12;roadScroll=dist;obstacles=[];pickups=[];');await shot('chest-approach');
   await run('for(let i=0;i<300&&mode==="run";i++)update(1/60);render();');assert.equal(await run('mode'),'lockpicking');
  };
  await arrive();await shot('lock-intro');const before=await run('[gold,dist,roadScroll,loop]');
  await tap(240,684);assert.equal(await run('lockpickGame.phase'),'playing');
  for(let index=0;index<5;index++){
   await hold(index);assert.equal(await run('lockpickGame.holdingIndex'),index);
   const ready=await run(`(()=>{for(let f=0;f<1200;f++){
    update(1/240);const pin=lockpickGame.pins[${index}];
    if(pin.holdT>LOCKPICK_RULES.minTap+.02&&Math.abs(lockpickPinY(pin)+12-LOCKPICK_RULES.shearY)<Math.max(8,pin.window-lockpickGame.setCount)-1)return true;
   }return false;})()`);assert(ready);await release();
   assert.equal(await run(`lockpickGame.pins[${index}].state`),'set');
  }
  await run('for(let i=0;i<600&&mode==="lockpicking";i++)update(1/120);');
  assert.equal(await run('mode'),'journeyevent');assert.equal(await run('gold'),before[0]);
  await tap(240,566);assert.equal(await run('gold'),before[0],'release debounce');
  await run('update(.25)');await shot('loot-phone');
  const reward=await run('journeyRoadEventSession.context.loot.entries[0].amount');
  await page.keyboard.press('Escape');assert.equal(await run('paused'),true);await page.keyboard.press('Escape');
  await tap(240,566);assert.equal(await run('gold'),before[0]+reward);await shot('loot-collected-phone');
  await tap(240,566);assert.equal(await run('gold'),before[0]+reward,'double tap');
  await tap(240,736);assert.equal(await run('mode'),'run');assert.deepEqual(await run('[dist,roadScroll,loop]'),before.slice(1));
  assert.equal(await run('journeyVenueVisible(roadLabState.slot.id)'),false);
  // Exhaust the picks through real touch release, then continue with no reward.
  await run('startRoadLabCase(7)');await arrive();await tap(240,684);
  for(let i=0;i<3;i++){await hold(0);await run('update(.14)');await release();}
  await run('for(let i=0;i<300&&mode==="lockpicking";i++)update(1/120);update(.25)');
  assert.equal(await run('journeyRoadEventSession.context.loot.won'),false);await shot('failed-phone');
  await tap(240,566);assert.equal(await run('gold'),180);await tap(240,736);assert.equal(await run('mode'),'run');
  // Every visible entrance uses anchored road coordinates, both renderers.
  await page.setViewportSize({width:480,height:800});await run('resize()');
  for(const curved of [false,true])for(const direction of [-1,0,1]){
   await run(`roadLabState.direction=${direction};roadLabState.entry=true;startRoadLabCase(7);setCurvedWorldTrial(${curved});
    dist=roadLabState.fixture.node.at-28;roadScroll=dist;player.x=player.lane=${direction+1};obstacles=[];pickups=[];updateJourneyPrototype(0,0);chooseJourneyDirection(${direction});
    for(let f=0;f<350&&journeyRoute.activeEdge!==roadLabState.fixture.edge.id;f++)update(1/60);`);
   assert.equal(await run('journeyRoute.activeEdge'),await run('roadLabState.fixture.edge.id'));
   await run('for(let f=0;f<16;f++)update(1/60);');await shot('turn-'+curved+'-'+direction);
   await run('for(let f=0;f<600&&mode==="run"&&(journey.phase==="turning"||journey.phase==="settling"||journeyRoute.pendingArm);f++)update(1/60);');
   assert.equal(await run('mode'),'run');
  }
  await page.setViewportSize({width:1280,height:900});
  await run('resize();roadLabState.entry=false;startRoadLabCase(7);dist=roadLabState.slot.at;updateJourneyRoadEvents(0);lockpickGame.phase="result";lockpickGame.won=true;update(.016);update(.25);');
  await shot('loot-desktop');const wallet=await run('gold');await page.keyboard.press('1');
  assert((await run('gold'))>wallet);await page.keyboard.press('Enter');assert.equal(await run('mode'),'run');
  await page.keyboard.press('F10');assert.equal(await run('mode'),'roadlab');
  assert.deepEqual(errors,[]);console.log('CHEST_BROWSER_OK real touch five-pin win / three-pick loss, loot selection, duplicate protection, pause, keyboard, 6 turn/renderer combinations, phone/desktop; '+out);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
