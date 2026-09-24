const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:480,height:800},hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.resolve('RoadTest.html')).href);
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  const out=path.resolve('output/journey-expedition-browser');fs.mkdirSync(out,{recursive:true});
  const shot=async name=>{await run('render()');await page.screenshot({path:path.join(out,name+'.png')});};
  const point=async(x,y)=>run(`({x:(${x}*viewScale+viewX)/renderDpr(),y:(${y}*viewScale+viewY)/renderDpr()})`);
  const tap=async(x,y)=>{const p=await point(x,y);await page.touchscreen.tap(p.x,p.y);};
  const cdp=await page.context().newCDPSession(page);
  const swipe=async side=>{
   const a=await point(240,490),b=await point(240+side*120,490);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[b]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  };
  assert.equal(await run('mode'),'roadlab');await shot('lab-special-roads');
  assert.equal(await run('ROAD_LAB_CASES.length'),19);
  await tap(225,219);assert.equal(await run('roadLabState.category'),1);await shot('lab-roadside');
  assert.equal(await run('roadLabVisibleCases().length'),7);
  await tap(390,219);assert.equal(await run('roadLabVisibleCases().length'),6);await shot('lab-enemies');
  await tap(80,219);await tap(110,289);assert.equal(await run('mode'),'run');
  const approach=async index=>{
   if(index!==undefined)await run(`roadLabState.entry=false;startRoadLabCase(${index});`);
   await run('dist=roadLabState.slot.at-10;roadScroll=dist;runDistance=dist;obstacles=[];pickups=[];');
   await shot('approach-'+await run('ROAD_LAB_CASES[roadLabState.index].id'));
   await run('for(let f=0;f<300&&mode==="run";f++)update(1/60);render();');
  };
  await approach();assert.equal(await run('mode'),'shop');await shot('cinder-forge');
  const stage=await run('loop'),distance=await run('dist');
  await run('blacksmithShop.random=()=>.99');await tap(240,682);
  await run('updateBlacksmithShop(1.55)');await shot('cinder-forge-strike');
  await run('updateBlacksmithShop(4)');await tap(240,682);await tap(240,750);
  assert.equal(await run('mode'),'run');assert.equal(await run('loop'),stage);assert.equal(await run('dist'),distance);
  await approach(1);assert.equal(await run('mode'),'merchant');await shot('caravan');
  await tap(240,760);assert.equal(await run('mode'),'run');
  await approach(2);assert.equal(await run('mode'),'journeyevent');await run('update(.3)');await shot('inn');
  const coins=await run('gold');await tap(240,560);
  assert.equal(await run('player.currentHealthUnits'),await run('player.maxHealthUnits'));
  assert.equal(await run('gold'),coins-22);await tap(240,560);assert.equal(await run('gold'),coins-22);
  await tap(240,624);assert(await run('MINIGAME_MODES.has(mode)'));await tap(45,70);
  assert.equal(await run('mode'),'journeyevent');assert.equal(await run('journeyRoadEventSession.context.inn.rested'),true);
  for(let i=0;i<5;i++){
   await run(`journeyRoadEventSession.context.openMode(()=>INN_GAMES[${i}].start());update(.3);render();`);
   await tap(45,70);assert.equal(await run('mode'),'journeyevent');assert.equal(await run('journeyRoadEventSession.context.inn.rested'),true);
  }
  await run('update(.3)');await tap(240,724);assert.equal(await run('mode'),'run');
  // Real touch input: a middle-lane swipe only changes lanes. A fresh second
  // swipe is required after the knight reaches the side of this particular NPC.
  for(const index of [5,6,14,15,16,17])for(const side of [-1,1]){
   await run(`startRoadLabCase(${index});if(journeyNormalSide(roadLabState.slot)!==${side})roadLabState.slot.id+='y';
    dist=roadLabState.slot.at-10;roadScroll=dist;updateJourneyRoadEvents(0);player.x=player.lane=1;render();`);
   await swipe(side);assert.equal(await run('mode'),'run');assert.equal(await run('player.lane'),side+1);
   await run('update(.22)');await swipe(side);assert.equal(await run('mode'),'journeyevent');
   await run('update(.3)');await shot('roadside-'+index+'-'+side);
   if(index===5){await tap(240,560);await tap(240,724);assert.equal(await run('mode'),'run');}
   await page.keyboard.press('F10');assert.equal(await run('mode'),'roadlab');
  }
  // Active-road fixtures exercise the common combat scene and a real touch attack.
  for(let index=8;index<14;index++){
   await approach(index);assert.equal(await run('mode'),'boss');
   await run('for(let f=0;f<1800&&!isPlayerTurn();f++)update(1/60);');
   assert(await run('isPlayerTurn()'));const hp=await run('boss.hp');
   const p=await run('({x:TURN_FIGHT_BTN.x+TURN_FIGHT_BTN.w/2,y:TURN_FIGHT_BTN.y+TURN_FIGHT_BTN.h/2})');
   await tap(p.x,p.y);await run('for(let f=0;f<180;f++)update(1/60);');assert(await run(`boss.hp<${hp}`));
   const wallet=await run('({gold,scrap})');
   await run('boss.hp=0;defeatBoss();for(let f=0;f<240&&mode!=="run";f++)update(1/60);');
   assert.equal(await run('mode'),'journeyevent');await shot('victory-'+index);
   assert.deepEqual(await run('({gold,scrap})'),wallet,'no automatic payout');
   const materials=await run('journeyRoadEventSession.context.loot.entries[1].amount');
   await tap(240,518);await tap(240,518);await tap(240,612);await tap(240,612);
   assert.equal(await run('gold'),wallet.gold+12);assert.equal(await run('scrap'),wallet.scrap+materials);
   await tap(240,734);
   assert.equal(await run('mode'),'run');assert.equal(await run('hasCombatAlly()'),false);
  }
  // New venues/ground obey the same anchors in left, straight and right entries.
  for(const curved of [false,true])for(const direction of [-1,0,1])for(let index=0;index<3;index++){
   await run(`roadLabState.direction=${direction};roadLabState.entry=true;startRoadLabCase(${index});setCurvedWorldTrial(${curved});
    dist=roadLabState.fixture.node.at-28;roadScroll=dist;obstacles=[];pickups=[];player.x=player.lane=${direction+1};
    updateJourneyPrototype(0,0);`);
   await shot('entrance-'+curved+'-'+direction+'-'+index);
   if(direction)await swipe(direction);else await run('chooseJourneyDirection(0)');
   await run('for(let f=0;f<350&&journeyRoute.activeEdge!==roadLabState.fixture.edge.id;f++)update(1/60);');
   assert.equal(await run('journeyRoute.activeEdge'),await run('roadLabState.fixture.edge.id'));
   await run('for(let f=0;f<16;f++)update(1/60)');await shot('turn-'+curved+'-'+direction+'-'+index);
   await run('for(let f=0;f<600&&mode==="run"&&(journey.phase==="turning"||journey.phase==="settling"||journeyRoute.pendingArm);f++)update(1/60);render();');
   await shot('entered-'+curved+'-'+direction+'-'+index);
   assert.equal(await run('mode'),'run');
  }
  // Return button, wide desktop and high-DPI portrait stay usable.
  await tap(410,23);assert.equal(await run('mode'),'roadlab');
  await page.setViewportSize({width:1280,height:900});await run('resize();roadLabState.entry=false;startRoadLabCase(0);dist=roadLabState.slot.at;updateJourneyRoadEvents(0);render();');
  await shot('forge-desktop');await page.keyboard.press('F10');assert.equal(await run('mode'),'roadlab');
  const phone=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true});
  phone.on('pageerror',e=>errors.push(e.message));await phone.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await phone.goto(pathToFileURL(path.resolve('RoadTest.html')).href);
  await phone.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
  await phone.evaluate(()=>{startRoadLabCase(2);dist=roadLabState.slot.at;updateJourneyRoadEvents(0);update(.3);render();});
  await phone.screenshot({path:path.join(out,'inn-phone-dpr2.png')});
  const phoneRun=code=>phone.evaluate(code=>(0,eval)(code),code);
  const phoneTap=async(x,y)=>{const p=await phoneRun(`({x:(${x}*viewScale+viewX)/renderDpr(),y:(${y}*viewScale+viewY)/renderDpr()})`);await phone.touchscreen.tap(p.x,p.y);};
  await phoneRun('startRoadLabCase(8);dist=roadLabState.slot.at;updateJourneyRoadEvents(0);boss.hp=0;defeatBoss();boss.stateT=2.6;updateBoss(.016);update(.25);render();');
  await phone.screenshot({path:path.join(out,'fight-loot-phone-dpr2.png')});
  const phoneMaterial=await phoneRun('scrap+journeyRoadEventSession.context.loot.entries[1].amount');
  await phoneTap(240,612);await phoneTap(240,612);assert.equal(await phoneRun('scrap'),phoneMaterial);
  await phone.keyboard.press('1');assert.equal(await phoneRun('gold'),192);
  await phone.keyboard.press('Enter');assert.equal(await phoneRun('mode'),'run');
  await phoneRun('startRoadLabCase(0);dist=roadLabState.slot.at;updateJourneyRoadEvents(0);scrap=0;');
  await phoneTap(240,690);assert.equal(await phoneRun('gold'),180);assert.equal(await phoneRun('scrap'),0);
  assert.equal(await phoneRun('blacksmithShop.phase'),'browse');
  await phoneRun('render()');await phone.screenshot({path:path.join(out,'forge-no-scrap-phone-dpr2.png')});
  await phoneRun('scrap=2;blacksmithShop.random=()=>.99;');await phoneTap(240,690);await phoneTap(240,690);
  assert.equal(await phoneRun('scrap'),0);assert.equal(await phoneRun('gold'),162);
  await phoneRun('updateBlacksmithShop(5);');assert.equal(await phoneRun('runSkills[0].evolutionDepth'),1);
  await phone.close();
  assert.deepEqual(errors,[]);
  console.log('EXPEDITION_BROWSER_OK real touch lane gates (12), shop/rest/game returns, 6 HP enemies, 18 renderer/turn combinations, lab navigation, desktop/phone; '+out);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
