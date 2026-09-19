const {chromium}=require(process.env.KNIGHT_PLAYWRIGHT_MODULE||'playwright');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:480,height:800},hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  const point=async expression=>run(`(()=>{const p=${expression};return {x:(p.x*viewScale+viewX)/renderDpr(),y:(p.y*viewScale+viewY)/renderDpr()};})()`);
  const click=async expression=>{const p=await point(expression);await page.mouse.click(p.x,p.y);};
  const down=async expression=>{const p=await point(expression);await page.mouse.move(p.x,p.y);await page.mouse.down();};
  const step=async n=>run(`for(let i=0;i<${n};i++)update(1/60);render();`);
  const out=path.resolve('output/minigames-browser');fs.mkdirSync(out,{recursive:true});
  await run(`SFX.setTestMuted(true);setMode('menu');render();`);
  await click('({x:325,y:489})');assert.equal(await run('mode'),'minigames');
  await run('render()');await page.screenshot({path:path.join(out,'menu.png')});
  await page.mouse.move(240,400);await page.mouse.wheel(0,500);
  await page.waitForFunction(()=>minigameMenuScroll>0);
  await run('setMinigameMenuScroll(0)');await down('({x:240,y:550})');await page.mouse.move(240,250,{steps:5});await page.mouse.up();
  assert((await run('minigameMenuScroll'))>100);assert.equal(await run('mode'),'minigames');
  await run('setMinigameMenuScroll(maxMinigameMenuScroll());minigameMenuVelocity=0;render()');
  await click('({x:240,y:MINIGAME_CARD_RECTS[18].y-minigameMenuScroll+180})');
  assert.equal(await run('mode'),'tavernslide');
  await click('({x:45,y:70})');assert.equal(await run('mode'),'minigames');
  await page.keyboard.press('Escape');assert.equal(await run('mode'),'menu');
  const ids=await run('MINIGAMES.ids');
  for(const id of ids){
   await run(`MINIGAMES.get('${id}').start();render();`);
   await page.keyboard.press('Enter');await step(150);
   if(id==='chicken_derby'){await page.keyboard.press('Enter');await step(60);}
   assert.equal(await run('keyboardParryHeld'),false,id+' captured parry');
   await click('({x:45,y:70})');assert.equal(await run('mode'),'minigames',id+' exit');
  }
  await run('startPunchBag();render()');
  const punch=await point('({x:240,y:450})');await page.touchscreen.tap(punch.x,punch.y);
  assert.equal(await run('punchGame.score'),1);
  await page.keyboard.press('Space');assert.equal(await run('punchGame.score'),2);
  await page.keyboard.press('Escape');assert.equal(await run('paused'),true);
  await page.keyboard.press('Space');assert.equal(await run('punchGame.score'),2);
  await page.keyboard.press('Escape');await run('leavePunchBag();startBlacksmith();beginBlacksmithRun();render()');
  await down('({x:FORGE_BELLOWS_RECT.x+20,y:FORGE_BELLOWS_RECT.y+20})');
  assert.equal(await run('forgeGame.bellowsHeld'),true);
  await step(20);await page.mouse.up();assert.equal(await run('forgeGame.bellowsHeld'),false);
  await down('({x:FORGE_BELLOWS_RECT.x+20,y:FORGE_BELLOWS_RECT.y+20})');
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  assert.equal(await run('forgeGame.bellowsHeld'),false);assert.equal(await run('paused'),true);
  await page.mouse.up();await run('paused=false;leaveBlacksmith();startKnifeFlip();render()');
  await down('(()=>{const r=knifeFlickHitbox(knifeGame,true);return {x:r.x+r.w/2,y:r.y+r.h/2};})()');
  assert.equal(await run('knifeGame.phase'),'aiming');
  const release=await point('({x:knifeGame.flick.startX,y:knifeGame.flick.startY-180})');
  await page.mouse.move(release.x,release.y,{steps:8});await page.mouse.up();
  assert.equal(await run('knifeGame.phase'),'flying');await step(90);
  await page.screenshot({path:path.join(out,'knife.png')});
  await run('leaveKnifeFlip();startPickpocket();beginPickpocketRun();render()');
  await down('pickpocketPurseCenter(pickpocketGame)');assert.equal(await run('pickpocketGame.holding'),true);
  await page.mouse.up();assert.equal(await run('pickpocketGame.holding'),false);
  await run('leavePickpocket();startTavernSlide();beginTavernSlideMatch();render()');
  await page.keyboard.press('Space');await step(60);
  await page.screenshot({path:path.join(out,'tavern.png')});
  assert.deepEqual(errors,[]);
  console.log('MINIGAME_BROWSER_OK 19 keyboard starts/back; menu wheel/drag/last card; touch punch; hold/release; blur cancel; knife flick; no page errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
