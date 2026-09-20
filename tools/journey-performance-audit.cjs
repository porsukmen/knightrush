// Controlled desktop/CPU-throttled comparison, not a phone FPS claim.
const {chromium}=require('playwright'),{pathToFileURL}=require('node:url');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const mobile=process.env.MOBILE==='1';
  const page=await browser.newPage(mobile?{viewport:{width:414,height:896},deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:{width:480,height:800}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href+(process.env.CURVED==='1'?'?curvedWorld=1':''));
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:Number(process.env.CPU_RATE||4)});
  await run(`SFX.toggle();Math.random=(()=>{let s=731;return()=>((s=Math.imul(s,1664525)+1013904223)>>>0)/4294967296;})();
   function performanceFixture(theme,turn){
    // Isolate fixture RNG from earlier rendering/warmup/moving-frame samples.
    Math.random=(()=>{let s=731;return()=>((s=Math.imul(s,1664525)+1013904223)>>>0)/4294967296;})();
    perfNow=1000;
    if(theme==='classic'){pendingJourneyPrototype=false;startRun(0);dist=130;roadScroll=dist;}
    else{
     startJourneyWithSeed(0);
     const node=journeyRoute.nodes.find(n=>n.out.some(e=>e.preview.theme===theme&&e.direction===1));
     const edge=node.out.find(e=>e.preview.theme===theme&&e.direction===1);
     if(turn){
      const parent=journeyRoute.nodes.find(n=>n.out.some(e=>e.to===node.id));
      journeyRoute.from=parent.id;journeyRoute.next=node.id;journeyRoute.activeEdge=parent.out.find(e=>e.to===node.id).id;
      dist=node.at-28;roadScroll=dist;runDistance=dist;armJourneyNode();
      roadsideScenery=[];obstacles=[];pickups=[];nextTreeAt=dist-4;nextSpawnAt=dist+3;spawnLoopEntities();
      godMode=true;player.lane=2;chooseJourneyDirection(1);
      for(let i=0;i<250&&journey.phase!=='turning';i++)update(1/60);
      for(let i=0;i<18;i++)update(1/60);
      return;
     }
     journeyRoute.from=node.id;journeyRoute.next=edge.to;journeyRoute.activeEdge=edge.id;
     dist=Math.min(node.at+140,journeyNode(edge.to).at-40);roadScroll=dist;runDistance=dist;armJourneyNode();
    }
    godMode=true;roadsideScenery=[];obstacles=[];pickups=[];nextTreeAt=dist-4;nextSpawnAt=dist+3;spawnLoopEntities();
   }
   globalThis.perfTotals={};globalThis.perfCalls={};
  `);
  const names=['render','drawRoad','drawTree','journeyNode','journeyActiveEdge','journeyDiscoRoadViews','journeyCameraPose','drawJourneyTexturedRoad','journeyWidenedRoadSurface','journeyRoadSurface','drawJourneyTextureTriangle','drawJourneyDiscoGround','drawJourneyBloodGround','queueJourneyDiscoParty','queueJourneyBloodWorld','drawJourneyDiscoParty','drawJourneyBloodDecor','journeyObstacleSurface','drawJourneyGroundObstacle','buildWorldDrawQueue'];
  await run(names.map(n=>`{const original=${n};${n}=function(...args){const t=performance.now();try{return original.apply(this,args);}finally{perfTotals['${n}']=(perfTotals['${n}']||0)+performance.now()-t;perfCalls['${n}']=(perfCalls['${n}']||0)+1;}};}`).join('\n'));
  const output=path.resolve('output/journey-performance');fs.mkdirSync(output,{recursive:true});
  const label=process.argv[2]||'current',results={};
  for(const [theme,turn] of [['classic',false],['forest',false],['forest',true],['disco',false],['disco',true],['bloodwood',false],['bloodwood',true]]){
   await run(`performanceFixture('${theme}',${turn});for(let i=0;i<100;i++){perfNow+=1/60;render();}perfTotals={};perfCalls={};`);
   const result=await run(`(()=>{const times=[];for(let i=0;i<36;i++){perfNow+=1/60;roadScroll+=.3;const t=performance.now();render();times.push(performance.now()-t);}times.sort((a,b)=>a-b);return {median:times[18],p95:times[34],phase:journey?.phase,trees:roadsideScenery.length,queue:DRAW_QUEUE.length,functions:Object.fromEntries(Object.entries(perfTotals).map(([k,v])=>[k,{ms:v/36,calls:perfCalls[k]/36}]))};})()`);
   results[theme+(turn?'-turn':'-straight')]=result;
   await page.screenshot({path:path.join(output,label+'-'+theme+(turn?'-turn':'-straight')+'.png')});
   // Real moving frames, including turn completion/spawning. Timed separately
   // from the frozen-scene hotspot probe above.
   const moving=await run(`(()=>{const updates=[],draws=[];for(let i=0;i<90;i++){
    const a=performance.now();update(1/60);const b=performance.now();render();updates.push(b-a);draws.push(performance.now()-b);
   }updates.sort((a,b)=>a-b);draws.sort((a,b)=>a-b);return {updateMedian:updates[45],updateP95:updates[85],drawMedian:draws[45],drawP95:draws[85],cacheMiB:journeyTreeSpritePixels*4/1048576,mode,phase:journey?.phase};})()`);
   result.moving=moving;
  }
  if(errors.length)throw Error(errors.join('\n'));
  await page.keyboard.press('F9');
  if(!await run('journeyPerf.enabled'))throw Error('F9 performance toggle failed');
  await run('settingsOpen=true;render();');await page.screenshot({path:path.join(output,label+'-settings.png')});
  await run('settingsTap({x:240,y:VH/2-244});');
  if(await run('journeyPerf.enabled'))throw Error('Touch performance toggle failed');
  await run('settingsOpen=false;journeyPerf.enabled=true;for(let i=0;i<35;i++)frame(lastTime+16.667);');
  if(!await run('journeyPerf.fps>0&&journeyPerf.p95>0&&journeyPerf.renderMs>=0&&journeyRenderFrame===null'))throw Error('Live performance sampling failed');
  await page.screenshot({path:path.join(output,label+'-hud.png')});
  fs.writeFileSync(path.join(output,label+'.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify(Object.fromEntries(Object.entries(results).map(([k,v])=>[k,{median:v.median,p95:v.p95,triangles:v.functions.drawJourneyTextureTriangle?.calls,moving:v.moving}])),null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
