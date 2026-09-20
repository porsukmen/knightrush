const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:480,height:800}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href+'?curvedWorld=1');
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
  const run=code=>page.evaluate(code=>(0,eval)(code),code),out=path.resolve('output/journey-curved-world-browser');fs.mkdirSync(out,{recursive:true});
  const shot=async name=>{await run('render()');await page.screenshot({path:path.join(out,name+'.png')});};
  await run(`SFX.toggle();journeyRoadEventHandlers.delete('disco_finale');journeyRoadEventHandlers.delete('elite_finale');
   function curvedFixture(theme,direction){
    for(let seed=0;seed<100;seed++){
     startJourneyWithSeed(seed);godMode=true;
     for(const node of journeyRoute.nodes)for(const edge of node.out){
      if(edge.preview.theme!==theme||edge.direction!==direction)continue;
      const parent=journeyRoute.nodes.find(n=>n.out.some(e=>e.to===node.id));if(!parent)continue;
      journeyRoute.from=parent.id;journeyRoute.next=node.id;journeyRoute.activeEdge=parent.out.find(e=>e.to===node.id).id;
      dist=node.at-28;roadScroll=dist;runDistance=dist;armJourneyNode();
      roadsideScenery=[];obstacles=[];pickups=[];nextTreeAt=dist-4;nextSpawnAt=dist+50;spawnLoopEntities();return edge.id;
     }
    }throw Error('Missing fixture');
   }`);
  let cases=0;
  for(const theme of ['forest','disco','bloodwood'])for(const direction of [-1,1]){
   const id=await run(`curvedFixture('${theme}',${direction})`);await shot(theme+'-'+direction+'-approach');
   await run(`player.lane=${direction+1};chooseJourneyDirection(${direction});
    for(let i=0;i<250&&journey.phase!=='turning';i++)update(1/60);for(let i=0;i<20;i++)update(1/60);`);
   assert.equal(await run('journey.phase'),'turning');await shot(theme+'-'+direction+'-turn');
   await run("for(let i=0;i<500&&(journey.phase==='turning'||journey.phase==='settling'||journeyRoute.pendingArm);i++){update(1/60);if(i%30===0)render();}");
   assert.equal(await run('journeyRoute.activeEdge'),id);await shot(theme+'-'+direction+'-entered');cases++;
  }
  for(const theme of ['disco','bloodwood']){
   await run(`(()=>{
    for(let seed=0;seed<40;seed++){
     startJourneyWithSeed(seed);godMode=true;
     for(const n of journeyRoute.nodes)for(const e of n.out){
      const next=journeyNode(e.to);
      if(e.preview.theme!=='${theme}'||!next.out.some(x=>x.direction===0&&x.preview.theme==='forest'))continue;
      journeyRoute.from=n.id;journeyRoute.next=e.to;journeyRoute.activeEdge=e.id;
      dist=next.at-36;roadScroll=dist;curvedGroundDistance=dist;runDistance=dist;armJourneyNode();
      for(const slot of e.events)journeyRoute.eventRecords[slot.id]={status:'completed'};
      roadsideScenery=[];obstacles=[];pickups=[];nextTreeAt=dist-4;nextSpawnAt=dist+50;spawnLoopEntities();return;
     }
    }throw Error('No special exit fixture');
   })()`);
   await shot(theme+'-exit-far');
   await run('for(let i=0;i<70;i++)update(1/60);');await shot(theme+'-exit-near');
   await run('for(let i=0;i<70;i++)update(1/60);');await shot(theme+'-exit-passed');
  }
  const state=await run('JSON.stringify([dist,player.hp,player.x,journeyRoute.seed])');
  await page.keyboard.press('F8');assert.equal(await run('curvedWorldTrial'),false);await shot('toggle-original');
  await page.keyboard.press('F8');assert.equal(await run('curvedWorldTrial'),true);assert.equal(await run('JSON.stringify([dist,player.hp,player.x,journeyRoute.seed])'),state);
  await run('settingsOpen=true;');await shot('settings');
  await page.mouse.click(240,203);assert.equal(await run('curvedWorldTrial'),false);
  await run('settingsOpen=false;setCurvedWorldTrial(true);');
  const timing=await run(`(()=>{const ms=[];for(let i=0;i<60;i++){perfNow+=1/60;const start=performance.now();render();if(i>9)ms.push(performance.now()-start);}ms.sort((a,b)=>a-b);return {median:ms[25],p95:ms[47]};})()`);
  assert.deepEqual(errors,[]);console.log('CURVED_BROWSER_OK',JSON.stringify({cases,F8:true,touchToggle:true,timing}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
