// Background-only drawing cost plus actual Journey composition. Not a phone benchmark.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs');
const label=process.argv[2]||'current',out=path.resolve('output/sunlit-background',label);
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 const results=[];
 try{for(const [device,width,height,dpr]of [['desktop',1280,900,1],['phone',390,844,2]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);
  await page.waitForFunction(()=>!!window.KRSunlitForest);
  const run=s=>page.evaluate(s=>(0,eval)(s),s);
  for(const theme of ['forest','disco','bloodwood']){
   await run(`Math.random=(()=>{let seed=731;return()=>((seed=Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;})();
    if('${theme}'==='forest'){startJourneyWithSeed(647486904);godMode=true;for(let i=0;i<110;i++)update(1/60);}
    else{roadLabState.direction=0;roadLabState.entry=false;startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='${theme}'));}
    perfNow=5;for(let i=0;i<24;i++)render();`);
   const state=await run('JSON.stringify({dist,player,records:journeyRoute.eventRecords,obstacles,pickups})');
   await page.screenshot({path:path.join(out,`${device}-${theme}-run.png`)});
   const data=await run(`(()=>{const times=[],ctx=g,phase=journey.phase;let fills=0,allocations=0;
    const originalFill=ctx.fill,create=document.createElement.bind(document);
    const background=()=>KRSunlitArt.background(null,0);
    const c=document.createElement('canvas');c.width=Math.ceil(VW*viewScale);c.height=Math.ceil((HORIZON_Y+PAD_TOP)*viewScale);
    try{journey.phase='turning';
     ctx.fill=function(...args){fills++;return originalFill.apply(this,args);};
     document.createElement=function(name,...args){if(name==='canvas')allocations++;return create(name,...args);};
     for(let i=0;i<160;i++){const t=performance.now();KRSunlitArt.background(null,i/160*Math.PI/2);if(i>=20)times.push(performance.now()-t);}
     g=c.getContext('2d');g.setTransform(viewScale,0,0,viewScale,0,PAD_TOP*viewScale);background();
     return {times,fillsPerFrame:fills/160,allocations,image:c.toDataURL()};
    }finally{ctx.fill=originalFill;document.createElement=create;g=ctx;journey.phase=phase;render();}
   })()`);
   assert.equal(await run('JSON.stringify({dist,player,records:journeyRoute.eventRecords,obstacles,pickups})'),state);
   assert.equal(data.allocations,0,'Background creates canvases while turning');
   const report=await run('KRSunlitForest.report()');assert(report.cacheBytes<=5*1048576);
   fs.writeFileSync(path.join(out,`${device}-${theme}-background.png`),Buffer.from(data.image.split(',')[1],'base64'));
   data.times.sort((a,b)=>a-b);results.push({device,theme,median:data.times[70],p95:data.times[133],fillsPerFrame:data.fillsPerFrame,allocations:data.allocations,cacheBytes:report.cacheBytes});
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({results,physicalPhone:false,visualApproval:'pending-user-review'},null,2));
 console.log('SUNLIT_BACKGROUND_OK',JSON.stringify(results));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
