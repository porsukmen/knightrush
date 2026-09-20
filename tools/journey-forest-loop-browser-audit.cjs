const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:480,height:800},hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  await run('SFX.toggle();startJourneyWithSeed(647486904);render();');
  assert.equal(await run('curvedWorldActive()'),true);
  await page.keyboard.press('F8');assert.equal(await run('curvedWorldActive()'),false);
  await page.keyboard.press('F8');assert.equal(await run('curvedWorldActive()'),true);
  for(let stage=1;stage<=3;stage++){
   await run(`startBoss();setMode('boss');squire.present=true;squire.active=true;squire.health=3;
    boss.hp=0;defeatBoss();boss.stateT=2.6;updateBoss(.016);render();`);
   assert.equal(await run('mode'),'town');
   const gate=await run('({x:(240*viewScale+viewX)/renderDpr(),y:(705*viewScale+viewY)/renderDpr()})');
   await page.touchscreen.tap(gate.x,gate.y);
   const ride=await run('({x:(240*viewScale+viewX)/renderDpr(),y:(705*viewScale+viewY)/renderDpr()})');
   await page.touchscreen.tap(ride.x,ride.y);
   await run('spawnLoopEntities();render();');
   assert.deepEqual(await run('[mode,loop,biome,journeyRoute.stage,squire.present,curvedWorldActive()]'),
    ['run',stage+1,'forest',stage+1,false,true]);
   await run('godMode=true;for(let i=0;i<180;i++)update(1/60);render();');
  }
  const out=path.resolve('output/journey-forest-loop');fs.mkdirSync(out,{recursive:true});
  await page.screenshot({path:path.join(out,'forest-after-third-bear.png')});
  assert.deepEqual(errors,[]);console.log('PASS: 3 browser victories → forest; F8 toggle; no runtime errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
