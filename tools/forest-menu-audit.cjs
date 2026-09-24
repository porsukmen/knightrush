// Both menu entries share Journey gameplay; OLD FOREST bypasses Sunlit art.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/forest-menu');
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  for(const viewport of [{width:480,height:800},{width:390,height:844}]){
   const page=await browser.newPage({viewport}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
   await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
   await page.waitForFunction(()=>!!window.KRSunlitForest);
   const run=code=>page.evaluate(code=>(0,eval)(code),code);
   await run("resetRun();setMode('menu');render();");
   await page.screenshot({path:path.join(out,`menu-${viewport.width}.png`)});
   const maps=[];
   for(const [style,x] of [['classic',325],['sunlit',155]]){
    await run(`resetRun();setMode('menu');pendingJourneySeed=647486904;handleAction('tap',{x:${x},y:430});`);
    assert.equal(await run('mode'),'charsel');
    await run('uiConfirm();godMode=true;for(let i=0;i<120;i++)update(1/60);render();');
    assert.equal(await run('journeyForestStyle'),style);
    assert.equal(await run('KRSunlitForest.active()'),style==='sunlit');
    assert.equal(await run('KRSunlitDisco.active()'),style==='sunlit');
    assert.equal(await run('activeRunPolicyId'),'journey_forest');
    maps.push(await run('JSON.stringify(journeyRoute.nodes)'));
    await page.screenshot({path:path.join(out,`${style}-${viewport.width}.png`)});
    for(const theme of ['disco','bloodwood']){
     await run(`roadLabState.direction=1;roadLabState.entry=true;startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='${theme}'));render();`);
     assert.equal(await run('KRSunlitForest.active()'),style==='sunlit');
     await run(`for(let i=0;i<400&&dist<roadLabState.fixture.node.at-20;i++)update(1/60);
      player.x=player.lane=2;chooseJourneyDirection(1);
      for(let i=0;i<300&&journeyRoute.activeEdge!==roadLabState.fixture.edge.id;i++)update(1/60);
      for(let i=0;i<400&&journeyRoute.pendingArm;i++){update(1/60);if(i%30===0)render();}render();`);
     assert.equal(await run('journeyRoute.activeEdge'),await run('roadLabState.fixture.edge.id'));
     assert.equal(await run('journeyRoute.pendingArm'),false);
     assert.equal(await run('KRSunlitForest.active()'),style==='sunlit');
     await page.screenshot({path:path.join(out,`${style}-${theme}-${viewport.width}.png`)});
    }
   }
   assert.equal(maps[0],maps[1],'same seed must generate the same map in both forests');
   await run("setMode('menu');handleAction('up');uiConfirm();render();");
   assert.equal(await run('KRSunlitForest.active()'),true);
   assert.deepEqual(errors,[]);
   await page.close();
  }
  console.log('PASS: menu, both forest renderers, seeded map parity, special-road turns, keyboard PLAY; desktop + phone viewport');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
