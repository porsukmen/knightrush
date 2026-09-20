const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.resolve('BlacksmithTest.html')).href);
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  const tap=async(x,y)=>{const p=await run(`({x:(${x}*viewScale+viewX)/renderDpr(),y:(${y}*viewScale+viewY)/renderDpr()})`);
   await page.touchscreen.tap(p.x,p.y);};
  assert.deepEqual(await run('[mode,gold,!!blacksmithShop.lab]'),['shop',1000,true]);
  const out=path.resolve('output/blacksmith');fs.mkdirSync(out,{recursive:true});
  await run('render()');await page.screenshot({path:path.join(out,'09-test-lab.png')});
  await tap(120,620);assert.equal(await run('runSkills[0].evolutionDepth'),1);
  await tap(350,620);assert.equal(await run('gold'),2000);
  await tap(120,570);assert.equal(await run('blacksmithShop.lab.outcome'),1);
  for(let i=0;i<4;i++)await tap(350,570);
  assert.equal(await run('blacksmithShop.lab.quality'),4);
  await tap(240,690);
  assert.deepEqual(await run('[blacksmithShop.order.success,blacksmithShop.order.rarity]'),[true,'LEGENDARY']);
  await tap(120,620);assert.equal(await run('runSkills[0].evolutionDepth'),1,'controls locked during forge');
  await run('updateBlacksmithShop(5)');await tap(240,690);
  assert.equal(await run('runSkills[0].evolutionDepth'),2);
  await tap(120,570);await tap(240,690);
  assert.equal(await run('blacksmithShop.order.success'),false);
  await run('updateBlacksmithShop(5)');await tap(240,690);
  assert.equal(await run('runSkills[0].evolutionDepth'),2);
  // Level cycling, independent slots, actual base reset at wrap.
  for(let slot=0;slot<4;slot++){
   const card=await run(`smithCardPose(${slot})`);await tap(card.x,card.y);
   const depth=await run(`runSkills[${slot}].evolutionDepth`);
   for(let i=0;i<5;i++)await tap(120,620);
   assert.equal(await run(`runSkills[${slot}].evolutionDepth`),depth);
  }
  await tap(240,750);assert.equal(await run('mode'),'debugcfg');
  assert.equal(await run('blacksmithShop'),null);
  await tap(240,359);assert.deepEqual(await run('[mode,gold,runSkills[0].evolutionDepth]'),['shop',1000,0]);
  await tap(240,750);
  await run('startJourneyWithSeed(5);gold=100;openBlacksmithShop()');
  assert.equal(await run('!!blacksmithShop.lab'),false,'test overrides must not leak into a real run');
  assert.deepEqual(errors,[]);
  console.log('BLACKSMITH_LAB_OK launcher, debug entry, touch controls, forced outcomes, rarity, four level cycles, animation lock, exit and real-run isolation');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
