const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.resolve('ForgeTest.html')).href);
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  await run(`SFX.toggle();globalThis.forgeBrowserTick=seconds=>{
   for(let t=0;t<seconds-1e-8;t+=1/120)updateBlacksmith(Math.min(1/120,seconds-t));
  }`);
  const point=(x,y)=>run(`({x:(${x}*viewScale+viewX)/renderDpr(),y:(${y}*viewScale+viewY)/renderDpr()})`);
  const tap=async(x,y)=>{const p=await point(x,y);await page.touchscreen.tap(p.x,p.y);};
  const cdp=await page.context().newCDPSession(page);
  const hold=async()=>{const p=await point(72,588);await cdp.send('Input.dispatchTouchEvent',{
   type:'touchStart',touchPoints:[{...p,id:1,radiusX:2,radiusY:2}]
  });};
  const release=()=>cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  const out=path.resolve('output/forge-revamp');fs.mkdirSync(out,{recursive:true});
  const shot=async name=>{await run('flashA=0;shakeMag=0;render()');await page.screenshot({path:path.join(out,name+'.png')});};
  assert.equal(await run('mode'),'blacksmithing');await shot('01-intro-mobile');
  await tap(240,761);assert.equal(await run('forgeGame.phase'),'playing');
  await hold();assert.equal(await run('forgeGame.bellowsHeld'),true);
  await run('forgeBrowserTick(1.17)');await shot('02-heating');
  await release();assert.equal(await run('forgeGame.bellowsHeld'),false);
  await run('forgeBrowserTick(.4)');await shot('03-ready');
  for(let i=0;i<9;i++){
   if(await run('forgeGame.heat<.52')){
    await hold();await run('while(forgeGame.heat<.72)updateBlacksmith(1/120)');
    await release();await run('forgeBrowserTick(.4)');
   }
   const x=await run('FORGE_TARGET_X[forgeGame.target]');await tap(x,437);
   assert.equal(await run('forgeGame.hits'),i);
   assert.equal(await run('!!forgeGame.pendingStrike'),true);
   await run('forgeBrowserTick(.24)');if(i===0)await shot('04-windup');
   await run('forgeBrowserTick(.14)');assert.equal(await run('forgeGame.hits'),i+1);
   if(i===0)await shot('05-impact');
   await run('forgeBrowserTick(.23)');
  }
  assert.equal(await run('forgeGame.stage'),'quench');assert.equal(await run('forgeGame.idealHits'),9);
  await hold();await run('while(forgeGame.heat<.64)updateBlacksmith(1/120)');
  await release();await run('forgeBrowserTick(.4)');await tap(400,580);
  assert.equal(await run('forgeGame.phase'),'quenching');
  await run('forgeBrowserTick(.8)');await shot('06-quench');
  await run('forgeBrowserTick(1)');assert.equal(await run('forgeGame.score'),100);await shot('07-result');
  await tap(240,761);assert.equal(await run('forgeGame.best'),100);
  await page.keyboard.down('Space');assert.equal(await run('forgeGame.bellowsHeld'),true);
  await run('forgeBrowserTick(1.17)');await page.keyboard.up('Space');await run('forgeBrowserTick(.4)');
  await page.keyboard.press('Enter');assert.equal(await run('!!forgeGame.pendingStrike'),true);
  await page.keyboard.press('Escape');assert.equal(await run('paused'),true);
  const frozen=await run('JSON.stringify(forgeGame)');await run('forgeBrowserTick(1)');
  assert.equal(await run('JSON.stringify(forgeGame)'),frozen);
  await page.keyboard.press('Escape');await run('forgeBrowserTick(.7)');
  await hold();await run('autoPause()');assert.equal(await run('forgeGame.bellowsHeld'),false);
  await release();await page.keyboard.press('Escape');
  await page.setViewportSize({width:780,height:1300});await run('resize();startBlacksmith()');await shot('08-intro-desktop');
  await tap(62,70);assert.equal(await run('mode'),'minigames');
  assert.deepEqual(errors,[]);
  console.log('FORGE_REVAMP_BROWSER_OK launcher, real touch heat/9 strikes/quench, keyboard, pause/cancel hold, replay, mobile/desktop, back');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
