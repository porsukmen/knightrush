const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 fs.mkdirSync('output/road-lab-ui',{recursive:true});
 try{for(const width of [320,390,1000]){
  const page=await browser.newPage({viewport:{width,height:width===320?568:width===390?844:1000},hasTouch:true});
  await page.addInitScript(()=>requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href+'?roadlab=1');
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  await page.waitForFunction(()=>window.KRSunlitForest&&window.KRUI,null,{polling:100});
  assert.equal(await run('mode'),'roadlab');
  const tap=async key=>{
   const pt=await run(`(()=>{const r=ROAD_LAB_UI.${key};return{x:((r.x+r.w/2)*viewScale+viewX)/renderDpr(),y:((r.y+r.h/2)*viewScale+viewY)/renderDpr()}})()`);
   await page.touchscreen.tap(pt.x,pt.y);
  };
  for(let i=0;i<3;i++){await tap(`direction(${i})`);assert.equal(await run('roadLabState.direction'),i-1);}
  const entry=await run('roadLabState.entry');await tap('entry');assert.equal(await run('roadLabState.entry'),!entry);await tap('entry');
  for(let category=0;category<3;category++){
   await tap(`category(${category})`);assert.equal(await run('roadLabState.category'),category);
   assert(await run(`(()=>{const ui=ROAD_LAB_UI,p=ui.sheet;return [ui.entry,ui.creator,ui.seed,ui.back,...[0,1,2].flatMap(i=>[ui.direction(i),ui.category(i)]),...roadLabVisibleCases().map((_,i)=>ui.test(i))].every(r=>r.x>=p.x+8&&r.x+r.w<=p.x+p.w-8&&r.y>=p.y+29&&r.y+r.h+4<=p.y+p.h-29)})()`),'paper containment');
   const before=await run('JSON.stringify([roadLabState,gold,scrap])');await run('render()');assert.equal(await run('JSON.stringify([roadLabState,gold,scrap])'),before);
   await page.screenshot({path:`output/road-lab-ui/${width}-category-${category}.png`});
   const index=await run('roadLabVisibleCases()[0].index');
   await tap('test(0)');assert.equal(await run('mode'),'run');assert.equal(await run('roadLabState.index'),index);
   await page.keyboard.press('F10');assert.equal(await run('mode'),'roadlab');
  }
  const seed=await run('roadLabState.seed');await tap('seed');assert.notEqual(await run('roadLabState.seed'),seed);
  await tap('back');assert.equal(await run('mode'),'menu');assert.equal(await run('debugRun||godMode'),false);
  await run('openRoadLab()');await tap('creator');await page.waitForURL(/RoadCreatorLab\.html$/);
  await page.close();
 }
 console.log('ROAD_LAB_UI_OK: three categories, paper containment, touch controls, launch mapping, seed, F10, menu and creator navigation at 320/390/1000px.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
