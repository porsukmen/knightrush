// Controlled CPU comparison with the pre-integration Journey renderer.
// Viewport/DPR emulation is NOT physical-phone FPS or total process/GPU RAM.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/sunlit-performance');
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 const results=[];
 try{
  for(const [device,width,height,dpr]of [['desktop',1280,900,1],['phone-emulation',390,844,2]])for(const variant of ['legacy','sunlit']){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   if(variant==='legacy')await page.route('**/assets/forest/*.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'/* Baseline: original Journey rendering. */'}));
   await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
   await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
   if(variant==='sunlit')await page.waitForFunction(()=>!!window.KRSunlitForest);
   const run=code=>page.evaluate(code=>(0,eval)(code),code);
   for(const theme of ['forest','disco','bloodwood','turn']){
    await run(`Math.random=(()=>{let seed=731;return()=>((seed=Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;})();
     if(${JSON.stringify(theme)}==='forest'){
      startJourneyWithSeed(647486904);godMode=true;for(let i=0;i<110;i++)update(1/60);
     }else{
      roadLabState.direction=1;roadLabState.entry=${theme==='turn'};
      startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme===${JSON.stringify(theme==='turn'?'disco':theme)}));
      if(${theme==='turn'}){
       for(let i=0;i<400&&dist<roadLabState.fixture.node.at-20;i++)update(1/60);
       player.x=player.lane=2;chooseJourneyDirection(1);
       for(let i=0;i<300&&journey.phase!=='turning';i++)update(1/60);
       for(let i=0;i<18;i++)update(1/60);
      }
     }render();`);
    const timing=await run(`(()=>{for(let i=0;i<35;i++)render();const times=[];
     for(let i=0;i<120;i++){const at=performance.now();render();times.push(performance.now()-at);}
     times.sort((a,b)=>a-b);return {medianMs:times[60],p95Ms:times[114],maxMs:times[119],
      mode,cache:window.KRSunlitForest?.report()||null};})()`);
    assert.equal(timing.mode,'run');if(timing.cache)assert(timing.cache.cacheBytes<=5*1048576);
    results.push({device,variant,theme,...timing});console.log(device,variant,theme,JSON.stringify(timing));
    await page.screenshot({path:path.join(out,`${device}-${variant}-${theme}.png`)});
   }
   assert.deepEqual(errors,[]);await page.close();
  }
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({kind:'cpu-command-submission',physicalPhone:false,results},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
