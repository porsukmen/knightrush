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
  const run=code=>page.evaluate(code=>(0,eval)(code),code),out=path.resolve('output/wolf-den-browser');fs.mkdirSync(out,{recursive:true});
  const point=(x,y)=>run(`({x:(${x}*viewScale+viewX)/renderDpr(),y:(${y}*viewScale+viewY)/renderDpr()})`);
  const tap=async(x,y)=>{const p=await point(x,y);await page.touchscreen.tap(p.x,p.y);};
  const shot=async name=>{await run('flashA=0;shakeMag=0;render()');await page.screenshot({path:path.join(out,name+'.png')});};
  const cdp=await page.context().newCDPSession(page);
  const swipe=async side=>{
   const a=await point(240,470),b=await point(240+side*130,470);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[b]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  };
  await tap(240,219);assert.equal(await run('roadLabVisibleCases().length'),7);await shot('01-lab');
  await tap(120,503);assert.equal(await run('ROAD_LAB_CASES[roadLabState.index].id'),'wolfden');
  await run('dist=roadLabState.slot.at-10;roadScroll=dist;obstacles=[];pickups=[];updateJourneyRoadEvents(0);player.x=player.lane=1;');
  await shot('02-roadside-wolf');const side=await run('journeyNormalSide(roadLabState.slot)');
  await swipe(side);assert.equal(await run('mode'),'run');await run('update(.22)');await swipe(side);
  assert.equal(await run('mode'),'journeyevent');await run('update(.35)');await shot('03-wolf-runs');
  await run('update(1.1);update(.3)');await shot('04-trail-choice');
  await tap(240,740);await run('update(.3)');await shot('05-den-entrance');
  await tap(91,328);await tap(91,328);assert.equal(await run('journeyMeat'),1);await shot('06-meat-taken');
  await page.keyboard.press('Escape');assert.equal(await run('paused'),true);
  await tap(240,678);assert.equal(await run('mode'),'journeyevent');
  if(await run('paused'))await page.keyboard.press('Escape');
  await run('update(.3)');await tap(240,678);
  assert.equal(await run('mode'),'boss',JSON.stringify(await run('({mode,paused,slide:journeyRoadEventSession?.context.den?.slide,t:journeyRoadEventSession?.context.den?.t})')));
  const distance=await run('dist'),stage=await run('loop');
  for(let i=0;i<4;i++){
   assert.equal(await run('boss.definitionId'),'den_wolf_'+i);assert.equal(await run('env'),'cave');
   await run('for(let f=0;f<2000&&!isPlayerTurn();f++)update(1/60);');assert(await run('isPlayerTurn()'));
   await shot('07-fight-'+(i+1));
   if(i===0){const hp=await run('boss.hp'),p=await run('({x:TURN_FIGHT_BTN.x+TURN_FIGHT_BTN.w/2,y:TURN_FIGHT_BTN.y+TURN_FIGHT_BTN.h/2})');
    await tap(p.x,p.y);await run('for(let f=0;f<180;f++)update(1/60);');assert(await run(`boss.hp<${hp}`));}
   await run('boss.hp=0;defeatBoss();boss.stateT=2.6;updateBoss(.016);');
   if(i<3)await run('update(1.2)');
  }
  assert.equal(await run('journeyRoadEventSession.context.den.slide'),'pup');
  await run('update(.3)');await shot('08-lone-pup');await tap(240,678);
  assert.equal(await run('journeyMeat'),0);assert(await run('!!wolfPup'));
  await run('update(.3)');await shot('09-befriended');await tap(240,678);
  assert.equal(await run('mode'),'run');assert.equal(await run('dist'),distance);assert.equal(await run('loop'),stage);
  await shot('10-companion');
  await page.setViewportSize({width:1280,height:900});
  await run(`resize();startRoadLabCase(18);dist=roadLabState.slot.at;updateJourneyRoadEvents(0);
   player.x=player.lane=journeyNormalSide(roadLabState.slot)+1;handleJourneyRoadEventAction(player.lane===2?'right':'left');
   update(1.3);update(.3);handleJourneyRoadEventAction('choice2');update(.3);`);
  await shot('11-den-desktop');
  assert.deepEqual(errors,[]);console.log('WOLF_DEN_BROWSER_OK real touch lane gate, choices, meat, pause, 4 HP fights, adoption, mobile DPR2 / desktop; '+out);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
