// Reproducible CPU command-submission comparison, NOT a physical-device FPS test.
// Canvas work may finish asynchronously on the GPU. Headless refresh is unrelated
// to a user's 165 Hz display, so these timings must never be labelled real FPS.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/morning-performance');
const baseline=path.join(out,'before-native.js');
const variants=process.env.KR_PERF_VARIANTS?.split(',')||['before','optimized','journey'];
const devices=[{name:'desktop',viewport:{width:1280,height:900},deviceScaleFactor:1},
 {name:'phone-emulation',viewport:{width:390,height:844},deviceScaleFactor:2}];
const samples=Number(process.env.KR_PERF_SAMPLES)||180,warmup=90;
const summarize=values=>{
 const sorted=[...values].sort((a,b)=>a-b),at=q=>sorted[Math.floor((sorted.length-1)*q)];
 return {samples:values.length,meanMs:values.reduce((a,b)=>a+b,0)/values.length,
   medianMs:at(.5),p95Ms:at(.95),p99Ms:at(.99),maxMs:at(1)};
};
async function runCode(page,code){return page.evaluate(code=>(0,eval)(code),code);}
async function openVariant(browser,device,variant){
 const page=await browser.newPage({viewport:device.viewport,deviceScaleFactor:device.deviceScaleFactor});
 const errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/assets\/morning-forest/.test(r.url()))requests.push(r.url());});
 await page.addInitScript(lowMemory=>{
   window.__performanceNativeRaf=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=()=>0;
   let rng=1729;Math.random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
   window.__resetPerfRandom=()=>{rng=1729;};
   if(lowMemory){
     Object.defineProperty(navigator,'deviceMemory',{get:()=>2});
     Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>4});
   }
 },device.name==='phone-emulation');
 if(variant==='before'){
   assert(fs.existsSync(baseline),'Save the pre-optimization lab to output/morning-performance/before-native.js first');
   await page.route('**/tools/morning-forest-lab.js',route=>route.fulfill({
     status:200,contentType:'application/javascript',body:fs.readFileSync(baseline,'utf8')}));
 }
 const query=variant==='journey'?'?routeSeed=647486904':'?morninglab=1';
 await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+query);
 await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
 if(variant!=='journey'){
   await page.waitForFunction(()=>window.KRMorningForest?.report().ready,null,{polling:100});
   if(variant==='before')assert.equal(await runCode(page,'KRMorningForest.report().cache'),undefined,
     'The before page must execute the archived, uncached baseline');
   else assert(await runCode(page,'!!KRMorningForest.report().cache'),'Optimized page must expose bounded cache accounting');
 }
 return {page,errors,requests};
}
async function initialize(page,variant){
 await runCode(page,`__resetPerfRandom();${variant==='journey'?'startJourneyWithSeed(647486904);':'KRMorningForest.restart();'}
   godMode=true;paused=false;resize();`);
}
async function advanceTo(page,distance){
 await runCode(page,`for(let i=0;dist<${distance}&&i<3000;i++){
   update(1/60);if(i%6===0)render();
   if(mode!=='run')throw Error('Benchmark left run mode at '+dist+': '+mode);
 }render();`);
}
async function prepareCase(page,variant,id){
 await initialize(page,variant);
 if(id.startsWith('straight-')){
   await advanceTo(page,Number(id.split('-')[1]));
   assert.equal(await runCode(page,'journey.phase'),'approach');
 }else if(variant!=='journey'){
   await advanceTo(page,227);
   await runCode(page,'player.x=2;player.lane=2;handleAction("right");');
   assert.equal(await runCode(page,'journey.phase'),'turning','Morning turn must use the real input path');
   await runCode(page,'for(let i=0;i<18;i++)update(1/60);render();');
 }else{
   // Find a fixed, reproducible starting road offering right. Keep generation,
   // obstacle spawning, route events, draw queues and native turn machinery intact.
   const seed=await runCode(page,`(()=>{
     for(const seed of [647486904,...Array.from({length:40},(_,i)=>i+1)]){
       startJourneyWithSeed(seed);godMode=true;
       if(journey.networkDirections?.includes(1))return seed;
     }return null;
   })()`);
   assert.notEqual(seed,null,'No deterministic right-turn seed found');
   const target=await runCode(page,'journeyNode(journeyRoute.next).at-2');
   await advanceTo(page,target);
   await runCode(page,`player.x=2;player.lane=2;handleAction('right');
     for(let i=0;i<90&&journey.phase!=='turning';i++)update(1/60);`);
   assert.equal(await runCode(page,'journey.phase'),'turning','Journey turn must use the real input path');
   await runCode(page,'for(let i=0;i<18;i++)update(1/60);render();');
 }
 assert.equal(await runCode(page,'mode'),'run');
}
async function counters(page){
 return runCode(page,`(()=>{
   const counts={},p=CanvasRenderingContext2D.prototype,names=['fill','fillRect','stroke','drawImage','clip','save','restore','lineTo','moveTo'],originals={};
   try{
     for(const name of names){originals[name]=p[name];counts[name]=0;p[name]=function(...args){counts[name]++;return originals[name].apply(this,args);};}
     render();
   }finally{for(const name of names)p[name]=originals[name];}
  return {canvasCalls:counts,drawQueue:DRAW_QUEUE.length,obstacles:obstacles.length,
     roadside:roadsideScenery.length,phase:journey.phase,mode,dist,
     canvasPixels:cvs.width*cvs.height,viewScale,
     journeyTreeCache:{entries:JOURNEY_TREE_SPRITES.size,bytes:journeyTreeSpritePixels*4},
     morning:window.KRMorningForest?.report()||null};
 })()`);
}
async function measureCase(page,variant,id){
 await prepareCase(page,variant,id);
 // Full render warmup makes tree caching fair. All timings below run without
 // monkeypatched drawing functions or performance-overlay instrumentation.
 await runCode(page,`for(let i=0;i<${warmup};i++)render();`);
 const raw=await runCode(page,`(()=>{const timings=[];
   for(let i=0;i<${samples};i++){const begin=performance.now();render();timings.push(performance.now()-begin);}
   return timings;})()`);
 const count=await counters(page);
 if(variant==='journey')assert(count.roadside>10,'Normal Journey comparison must contain its real populated forest');
 const shot=path.join(out,variant+'-'+id+'-'+(await page.viewportSize()).width+'.png');
 await page.locator('#game').screenshot({path:shot});
 let update=null,combined=null;
 if(id==='straight-40'){
   // 48 advancing frames stay in the same early road. The full normal game
   // update is used, including spawning, collision checks and event offers.
   const moving=await runCode(page,`(()=>{const updates=[],combined=[];
     for(let i=0;i<48;i++){const start=performance.now();update(1/60);const middle=performance.now();render();const end=performance.now();
       updates.push(middle-start);combined.push(end-start);}
     return {updates,combined,mode};})()`);
   assert.equal(moving.mode,'run');update=summarize(moving.updates);combined=summarize(moving.combined);
 }
 return {render:summarize(raw),update,combined,counters:count,screenshot:path.relative(root,shot)};
}
async function measureScheduledThroughput(report){
 const flags=['--disable-frame-rate-limit','--disable-gpu-vsync'];
 const browser=await chromium.launch({channel:'msedge',headless:true,args:flags});
 const scheduled={kind:'headless-native-raf-throughput',flags,durationMs:2600,warmupMs:650,
   physicalFPS:false,physicalPhone:false,
   warning:'One captured native requestAnimationFrame loop performs real moving update/render. The game-owned loop is disabled. Browser compositor scheduling is included, but headless results do not certify a 165 Hz display or a phone.',variants:{}};
 try{
   for(const variant of variants){
     const {page,errors}=await openVariant(browser,devices[0],variant);
     try{
       await prepareCase(page,variant,'straight-40');
       const result=await runCode(page,`(async()=>{
         const once=duration=>new Promise(resolve=>{
           const intervals=[],work=[];let first=null,last=null;
           const tick=now=>{
             if(first===null){first=last=now;__performanceNativeRaf(tick);return;}
             const delta=now-last;last=now;
             const began=performance.now();update(Math.min(delta/1000,1/25));render();
             intervals.push(delta);work.push(performance.now()-began);
             if(now-first>=duration)resolve({intervals,work,elapsedMs:now-first});
             else __performanceNativeRaf(tick);
           };__performanceNativeRaf(tick);
         });
         await once(650);
         const sample=await once(2600);
         return {...sample,mode,dist,phase:journey.phase,cache:window.KRMorningForest?.report().cache||null};
       })()`);
       assert.equal(result.mode,'run');assert.deepEqual(errors,[]);
       const intervals=summarize(result.intervals),work=summarize(result.work);
       scheduled.variants[variant]={intervals,work,scheduledFramesPerSecond:1000/intervals.meanMs,
         elapsedMs:result.elapsedMs,endDistance:result.dist,endPhase:result.phase,cache:result.cache};
       console.log('SCHEDULED '+variant+' '+JSON.stringify(scheduled.variants[variant]));
     }finally{await page.close();}
   }
   const a=scheduled.variants.optimized,b=scheduled.variants.journey;
   if(a&&b){
     const capLike=v=>Math.abs(v.intervals.medianMs-1000/60)<.8||Math.abs(v.intervals.medianMs-1000/120)<.5;
     scheduled.possibleRefreshCap=Object.values(scheduled.variants).every(capLike);
     scheduled.optimizedVsJourney={scheduledRateRatio:a.scheduledFramesPerSecond/b.scheduledFramesPerSecond,
       p95IntervalRatio:a.intervals.p95Ms/b.intervals.p95Ms,
       conclusion:scheduled.possibleRefreshCap?'Refresh-cap-like results: cannot infer peak performance parity.':
         'Headless scheduled throughput only; confirm responsiveness in the visible game and on a real phone.'};
   }
   report.scheduledThroughput=scheduled;
 }finally{await browser.close();}
}
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 if(process.env.KR_PERF_RAF_ONLY==='1'){
   const report=JSON.parse(fs.readFileSync(path.join(out,'performance-report.json'),'utf8'));
   await measureScheduledThroughput(report);
   fs.writeFileSync(path.join(out,'performance-report.json'),JSON.stringify(report,null,2));
   console.log('MORNING_SCHEDULED_PERFORMANCE_RECORDED');return;
 }
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const report={kind:'cpu-command-submission',physicalDevice:false,physicalFPS:false,
   startedAt:new Date().toISOString(),
   warning:'Canvas submission is asynchronous. These are controlled CPU regression timings, not real GPU frame times or physical phone FPS.',
   browser:await browser.version(),warmup,samples,devices:{}};
 try{
   // One page is measured at a time; no parallel browser tests or live rAF loops.
   for(const device of devices){
     report.devices[device.name]={viewport:device.viewport,deviceScaleFactor:device.deviceScaleFactor,variants:{}};
     for(const variant of variants){
       assert(['before','optimized','journey'].includes(variant));
       const {page,errors,requests}=await openVariant(browser,device,variant),cases={};
       try{
         for(const id of ['straight-40','straight-92','straight-142','right-turn-half']){
           cases[id]=await measureCase(page,variant,id);
           console.log(device.name+' '+variant+' '+id+' '+JSON.stringify(cases[id].render));
         }
         assert.deepEqual(errors,[],'Browser errors');assert.deepEqual(requests,[],'Archived bitmap sprites must not load');
         report.devices[device.name].variants[variant]={cases,errors,archivedSpriteRequests:requests.length};
       }finally{await page.close();}
     }
     const runs=report.devices[device.name].variants;
     if(runs.optimized&&runs.journey){
       report.devices[device.name].ratios=Object.fromEntries(Object.keys(runs.optimized.cases).map(id=>{
         const opt=runs.optimized.cases[id].render,normal=runs.journey.cases[id].render,old=runs.before?.cases[id].render;
         return [id,{medianVsJourney:opt.medianMs/normal.medianMs,p95VsJourney:opt.p95Ms/normal.p95Ms,
           medianVsBefore:old?opt.medianMs/old.medianMs:null}];
       }));
       const ratios=Object.values(report.devices[device.name].ratios);
       report.devices[device.name].cpuParity={
         medianAtOrBelowJourney:ratios.every(ratio=>ratio.medianVsJourney<=1),
         p95AtOrBelowJourney:ratios.every(ratio=>ratio.p95VsJourney<=1),
         note:'A failed comparison needs investigation; a pass does not certify physical-phone FPS.'};
     }
     fs.writeFileSync(path.join(out,'performance-report.json'),JSON.stringify(report,null,2));
   }
 }finally{await browser.close();}
 await measureScheduledThroughput(report);
 fs.writeFileSync(path.join(out,'performance-report.json'),JSON.stringify(report,null,2));
 console.log('MORNING_PERFORMANCE_RECORDED '+path.join(out,'performance-report.json'));
})().catch(error=>{console.error(error);process.exitCode=1;});
