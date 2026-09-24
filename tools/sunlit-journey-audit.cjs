const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/sunlit-journey');
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:480,height:800}}),errors=[],requests=[];
  page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
  page.on('request',r=>requests.push(r.url()));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
  await page.waitForFunction(()=>!!window.KRSunlitForest);
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  const shot=async name=>{await run('render();');await page.screenshot({path:path.join(out,name+'.png')});};
  await run('startJourneyWithSeed(647486904);godMode=true;for(let i=0;i<120;i++)update(1/60);render();');
  assert(await run('KRSunlitForest.active()'));assert.equal(await run('!!forestCorridor'),false);
  assert.equal(await page.locator('#morning-lab-controls').count(),0,'Authoring UI leaked into Journey');
  assert.equal(await run('typeof KRMorningForest'),'undefined');
  const originalGraph=await run('JSON.stringify(journeyRoute.nodes)');
  const before=await run('JSON.stringify({dist,player,obstacles,pickups,chosen:journeyRoute.chosen})');
  await shot('01-normal');await run('for(let i=0;i<3;i++)render();');
  assert.equal(await run('JSON.stringify({dist,player,obstacles,pickups,chosen:journeyRoute.chosen})'),before);
  assert.equal(await run('JSON.stringify(journeyRoute.nodes)'),originalGraph);
  const cases=[];
  for(const direction of [-1,0,1])for(const theme of ['disco','bloodwood','forge','caravan','inn','chest']){
   const index=await run(`ROAD_LAB_CASES.findIndex(c=>c.theme===${JSON.stringify(theme)})`);
   await run(`roadLabState.direction=${direction};roadLabState.entry=true;startRoadLabCase(${index});render();`);
   assert(await run('KRSunlitForest.active()'));
   await shot(`entry-${theme}-${direction}`);
   await run(`for(let i=0;i<400&&dist<roadLabState.fixture.node.at-20;i++)update(1/60);
    player.x=player.lane=${direction+1};chooseJourneyDirection(${direction});
    for(let i=0;i<300&&journeyRoute.activeEdge!==roadLabState.fixture.edge.id;i++)update(1/60);render();`);
   assert.equal(await run('journeyRoute.activeEdge'),await run('roadLabState.fixture.edge.id'));
   if(direction){
    assert.equal(await run('journey.phase'),'turning');
    await run('globalThis.previewRefs=journey.sunlitPreview.obstacles.map(o=>o.entity);globalThis.previewCoins=journey.sunlitPreview.pickups.map(o=>o.entity);');
    for(const [name,n] of [['half',17],['end',24]]){
     await run(`for(let i=0;i<${n};i++)update(1/60);render();`);
     if(theme==='disco'||theme==='bloodwood')await shot(`turn-${theme}-${direction}-${name}`);
    }
   // Constant-speed corners have a geometry-dependent duration; wait for the
   // actual handoff rather than assuming the old fixed 0.62-second sprint.
   await run('for(let i=0;i<180&&journey.phase==="turning";i++)update(1/60);render();');
   assert.equal(await run('journey.phase'),'settling');
   assert(await run('previewRefs.every(o=>obstacles.includes(o))'),'Turn replaced preview obstacles');
    assert(await run('previewCoins.every(o=>pickups.includes(o))'),'Turn replaced preview coins');
   }
   // Go through the real handoff/rebase, not only a single quarter-turn frame.
   await run('for(let i=0;i<260&&mode==="run"&&journeyRoute.pendingArm;i++)update(1/60);render();');
   await shot(`inside-${theme}-${direction}`);
   assert.equal(await run('journeyRoute.pendingArm'),false);
   const report=await run('KRSunlitForest.report()');
   assert(report.cacheBytes<=5*1048576);assert(report.rows<65);assert(report.floorRows<120);
   const variants=await run('KRSunlitForest.inspect().map(o=>o.palette)');
   if(['disco','bloodwood'].includes(theme))assert(variants.some(p=>p.startsWith(theme+':')),'No spatial biome palette');
   cases.push({direction,theme,report});
  }
  // A closed junction keeps its existing tree wall but uses the new models.
  await run(`startJourneyWithSeed(647486904);godMode=true;
   globalThis.endNode=journeyRoute.nodes.find(n=>n.type!=='boss'&&n.out.length&&!n.out.some(e=>e.direction===0)&&journeyRoute.nodes.some(p=>p.out.some(e=>e.to===n.id)));
   globalThis.parentNode=journeyRoute.nodes.find(n=>n.out.some(e=>e.to===endNode.id));
   journeyRoute.from=parentNode.id;journeyRoute.next=endNode.id;journeyRoute.activeEdge=parentNode.out.find(e=>e.to===endNode.id).id;
   dist=endNode.at-25;curvedGroundDistance=dist;roadScroll=dist;armJourneyNode();render();`);
  assert(await run('journey.endTrees.length===14'));await shot('dead-end');
  assert(await run('DRAW_QUEUE.some(o=>o.draw===drawJourneyTree&&o.ref.endCap)'));
  await page.setViewportSize({width:390,height:844});await run('resize();');await shot('phone-dead-end');
  await run('resetRun();setMode("menu");render();');
  assert.equal(await run('KRSunlitForest.report().cacheBytes'),0);
  assert(!requests.some(url=>/assets\/morning-forest\//.test(url)),'Archived generated sprites loaded');
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({cases,errors,gameplayPurity:true,seedGraphPreserved:true,realPhoneTested:false},null,2));
  console.log('SUNLIT_JOURNEY_OK 18 route/biome combinations, seeded graph, real turns, entity handoff, dead ends, no lab UI, bounded caches');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
