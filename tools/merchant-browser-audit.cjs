const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.resolve('MerchantTest.html')).href);
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
  const run=c=>page.evaluate(c=>(0,eval)(c),c);
  const tap=async(x,y)=>{const p=await run(`({x:(${x}*viewScale+viewX)/renderDpr(),y:(${y}*viewScale+viewY)/renderDpr()})`);await page.touchscreen.tap(p.x,p.y);};
  const out=path.resolve('output/merchant');fs.mkdirSync(out,{recursive:true});
  const shot=async name=>{await run('render()');await page.screenshot({path:path.join(out,name+'.png')});};
  assert.equal(await run('mode'),'merchant');await shot('01-mobile');
  for(let i=0;i<4;i++){await tap(75+i*110,430);assert.equal(await run('merchantShop.selected'),i);}
  await tap(240,668);assert.equal(await run('gold'),100);await tap(240,668);assert.equal(await run('gold'),100);
  await tap(240,762);assert.equal(await run('mode'),'merchant');
  await page.keyboard.press('Escape');assert.equal(await run('paused'),true);
  await run('updateMerchantShop(3)');assert.equal(await run('merchantShop.clock'),0);
  await page.keyboard.press('Escape');await run('updateMerchantShop(.9)');await shot('02-handoff');
  await run('updateMerchantShop(2)');await shot('03-sold');
  await tap(120,718);assert.equal(await run('gold'),200);
  await tap(350,718);assert.equal(await run('gold'),120);assert.equal(await run('relics.filter(Boolean).length'),0);
  await tap(240,762);assert.equal(await run('mode'),'debugcfg');
  await tap(396,359);assert.equal(await run('mode'),'merchant');
  const beforeReroll=await run('merchantShop.stock[0].id');
  await tap(365,668);assert.equal(await run('gold'),110);
  await tap(365,668);assert.equal(await run('gold'),110);
  assert.notEqual(await run('merchantShop.stock[0].id'),beforeReroll);
  await run('updateMerchantShop(.5)');assert.equal(await run('merchantRerollCost()'),15);
  await shot('05-reroll');
  await page.setViewportSize({width:780,height:1300});await run('resize()');await shot('04-desktop');
  assert.deepEqual(errors,[]);console.log('MERCHANT_BROWSER_OK mobile and desktop, four product hit areas, atomic touch purchase, pause, exit lock, lab reset/debug entry');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
