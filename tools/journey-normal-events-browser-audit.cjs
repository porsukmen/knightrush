const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:480,height:800},hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;localStorage.setItem('knightrush.roadQuest.v1',JSON.stringify({version:1,status:'ready',count:10}));});
  await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  const tap=async(x,y)=>{const p=await run(`({x:(${x}*viewScale+viewX)/renderDpr(),y:(${y}*viewScale+viewY)/renderDpr()})`);await page.touchscreen.tap(p.x,p.y);};
  const cdp=await page.context().newCDPSession(page);
  const swipe=async()=>{
   const side=await run('journeyNormalSide(journeyRoadEventSession.slot)');
   const points=await run(`[{x:240,y:490},{x:240+${side}*120,y:490}].map(p=>({x:(p.x*viewScale+viewX)/renderDpr(),y:(p.y*viewScale+viewY)/renderDpr()}))`);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[points[0]]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[points[1]]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   assert.equal(await run('mode'),'journeyevent');await run('update(.25);render();');
  };
  assert.equal(await run('journeyMushroomQuest'),null,'Legacy 10/10 ignored at boot');
  await run(`SFX.toggle();
   function fixture(content){
    for(let seed=0;seed<100;seed++){
     startJourneyWithSeed(seed);godMode=true;
     for(const n of journeyRoute.nodes)for(const e of n.out){
      const slot=e.events.find(s=>JOURNEY_ROAD_EVENTS[s.definition].kind==='normal'&&journeyNormalContent(s)===content);if(!slot)continue;
      journeyRoute.from=n.id;journeyRoute.next=e.to;journeyRoute.activeEdge=e.id;journeyRoute.pendingArm=false;
      dist=slot.at-15;runDistance=dist;roadScroll=dist;armJourneyNode();journey.phase='main';journey.endTrees=[];
      obstacles=[];pickups=[];updateJourneyRoadEvents(0);render();return;
     }
    }throw Error('No fixture');
   }fixture('mushrooms');`);
  await tap(130,246);assert.equal(await run('mode'),'run');
  await swipe();
  const frozenTalk=await run('JSON.stringify([dist,roadScroll,runDistance])');
  await run('for(let i=0;i<100;i++)update(1/60);');assert.equal(await run('JSON.stringify([dist,roadScroll,runDistance])'),frozenTalk);
  await page.keyboard.press('Escape');assert.equal(await run('paused'),true);await page.keyboard.press('Escape');
  await tap(240,666);assert.equal(await run('journeyMushroomQuest.count'),0);
  await run('update(.25);');await page.keyboard.press('Enter');assert.equal(await run('mode'),'run');
  await run(`for(let i=0;i<4;i++)collect({kind:'mushroom',lane:1,z:0});`);
  assert.equal(await run('journeyMushroomQuest.count'),4,'Progress survives conversation return in this run');
  await page.reload();await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
  assert.equal(await run('journeyMushroomQuest'),null,'Reload does not restore the old quest');
  // Reinstall fixture helpers after reload.
  const fixtureSource=fs.readFileSync(__filename,'utf8').match(/function fixture\(content\)\{[\s\S]*?\}fixture\('mushrooms'\);/)[0].replace("fixture('mushrooms');",'');
  await run(fixtureSource);
  for(const content of ['chest','well']){
   await run(`fixture('${content}');globalThis.before=JSON.stringify([dist,runDistance,roadScroll,journeyRoute.activeEdge]);globalThis.oldGold=gold;`);
   await swipe();await tap(240,666);assert.equal(await run('mode'),content==='chest'?'lockpicking':'wishingwell');
   await run('for(let i=0;i<60;i++)update(1/60);render();');assert.equal(await run('JSON.stringify([dist,runDistance,roadScroll,journeyRoute.activeEdge])'),await run('before'));
   await page.keyboard.press('Escape');assert.equal(await run('paused'),true);await page.keyboard.press('Escape');
   await tap(240,682);assert.equal(await run(content==='chest'?'lockpickGame.phase':'wellGame.phase'),content==='chest'?'playing':'ready');
   await run(content==='chest'?`lockpickGame.phase='result';lockpickGame.won=true;render();`:`beginWellAim(WELL_THROW_ORIGIN);perfNow+=.25;launchWishingCoin({x:240+(wellGame.setup.x-240)/wellGame.setup.distance*wellGame.setup.idealLength,y:682+(wellGame.setup.y-682)/wellGame.setup.distance*wellGame.setup.idealLength});for(let i=0;i<90;i++)update(1/60);render();`);
   const reward=await run('journeyRoadReward(journeyRoadEventSession.context)');
   await tap(240,682);assert.equal(await run('mode'),'run');assert.equal(await run('gold-oldGold'),reward);
   await run(`fixture('${content}');`);await swipe();await tap(240,728);await run('update(.25);');await tap(240,666);assert.equal(await run('journeyRoadEventSession'),null);
  }
  await run("fixture('chest');");await page.keyboard.press('e');assert.equal(await run('mode'),'run');
  await page.keyboard.press(await run("journeyNormalSide(journeyRoadEventSession.slot)>0?'ArrowRight':'ArrowLeft'"));
  await run('update(.25);');await page.keyboard.press('1');assert.equal(await run('mode'),'lockpicking');
  await tap(45,70);assert.equal(await run('mode'),'run');
  await run("fixture('taxman');gold=9;");await swipe();await tap(240,704);
  assert.equal(await run('gold'),4);await run('update(.25);');await tap(240,666);assert.equal(await run('mode'),'run');
  await run("fixture('taxman');gold=0;");await swipe();await tap(240,704);
  assert.equal(await run('journeyRoadEventSession.context.dialogue'),'choice');assert.equal(await run('gold'),0);
  await tap(240,754);await run('update(.25);');await tap(240,666);assert.equal(await run('mode'),'run');
  await run("fixture('taxman');");await swipe();await tap(240,654);assert.equal(await run('mode'),'armwrestling');
  await tap(45,70);assert.equal(await run('mode'),'run');
  await run("fixture('traveler');gold=10;");await swipe();await tap(240,666);
  assert.equal(await run('gold'),5);assert.equal(await run('journeyTravelerFavor.status'),'waiting');
  await run('update(.25);');await tap(240,666);
  await run("fixture('chickens');");await swipe();await tap(240,666);
  assert.equal(await run('journeyChickenQuest.count'),0);await run('update(.25);');await tap(240,666);
  // An ongoing collection must not auto-enter the next full NPC scene.
  await run("fixture('traveler');journeyChickenQuest={status:'collecting',count:2};journeyMushroomQuest={status:'collecting',count:4};");
  await run('for(let i=0;i<30;i++)update(1/60);render();');assert.equal(await run('mode'),'run');
  // A held direction generates repeated keydowns with no new press.
  await run(`globalThis.entryKey=journeyNormalSide(journeyRoadEventSession.slot)>0?'ArrowRight':'ArrowLeft';
    window.dispatchEvent(new KeyboardEvent('keydown',{key:entryKey,repeat:true}));`);
  assert.equal(await run('mode'),'run','Held key must not open new NPC');
  // A new encounter cannot replace the live session, including during dialogue.
  assert.equal(await run(`startJourneyRoadEvent({...journeyRoadEventSession.slot,id:'unexpected-next-event'})`),false);
  await page.keyboard.press(await run('entryKey'));assert.equal(await run('mode'),'journeyevent');
  assert.equal(await run('journeyChickenQuest.count'),2);assert.equal(await run('journeyMushroomQuest.count'),4);
  assert.equal(await run(`startJourneyRoadEvent({...journeyRoadEventSession.slot,id:'unexpected-next-event'})`),false);
  await run('update(.25);');await page.keyboard.press('2');await run('update(.25);');await page.keyboard.press('Enter');
  // Start a finger gesture before the next offer exists, then reveal the offer.
  const stalePoints=await run(`[{x:240,y:490},{x:360,y:490}].map(p=>({x:(p.x*viewScale+viewX)/renderDpr(),y:(p.y*viewScale+viewY)/renderDpr()}))`);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[stalePoints[0]]});
  await run("fixture('traveler');");
  const endPoint=await run(`({x:((240+journeyNormalSide(journeyRoadEventSession.slot)*120)*viewScale+viewX)/renderDpr(),y:(490*viewScale+viewY)/renderDpr()})`);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[endPoint]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.equal(await run('mode'),'run','Old touch must not enter a new event');
  await swipe();assert.equal(await run('mode'),'journeyevent','Fresh swipe still enters');
  await run("journeyMushroomQuest=null;fixture('mushrooms');render();");await swipe();
  const out=path.resolve('output/journey-normal-events');fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'browser-offer.png')});
  assert.deepEqual(errors,[]);console.log('JOURNEY_NORMAL_BROWSER_OK real touch swipes; dialogue choices/refusal; keyboard; legacy save ignored; reload clears quest; pause; frozen dialogue/road; single-attempt rewards; no browser errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
