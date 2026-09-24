// Moving-frame test, not repeated submission of a frozen render. Emulation
// does not stand in for a physical phone or a 165 Hz display.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/sunlit-pacing');
const label=process.argv[2]||'current',frameCount=Number(process.argv[3])||180;
const repeats=Number(process.argv[4])||1;
const baseline=process.argv[5]==='baseline';
const onlyDevice=process.argv[6];
if(baseline)for(const name of ['sunlit-forest.js','journey-forest.js']){
 assert(fs.existsSync(path.join(root,'output/perf-source-before',name)),
  'Baseline requires the saved pre-edit forest sources: '+name);
}
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 const results=[];
 try{for(const [device,width,height,dpr]of [['desktop',1280,900,1],['phone-emulation',390,844,2]]){
  if(onlyDevice&&onlyDevice!==device)continue;
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr}),errors=[];
  if(baseline)await page.route('**/assets/forest/*.js',route=>{
   const file=path.join(root,'output/perf-source-before',path.basename(new URL(route.request().url()).pathname));
   return fs.existsSync(file)?route.fulfill({contentType:'text/javascript',body:fs.readFileSync(file,'utf8')}):route.continue();
  });
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   window.pacingRAF=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=()=>0;
   window.pacingCanvases=0;const create=document.createElement.bind(document);
   document.createElement=function(name,...args){if(name==='canvas')window.pacingCanvases++;return create(name,...args);};
  });
  await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
  await page.waitForFunction(()=>!!window.KRSunlitForest);
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  assert(await run(`(()=>{const p={frames:new Float64Array(100).fill(5),sorted:new Float64Array(100),count:100};
   p.frames[99]=20;summarizeJourneyFrames(p);return p.p99===5&&p.low1===50&&p.p95===5&&p.over25===0;})()`),'1% low must use the slowest frame tail');
  for(let repeat=0;repeat<repeats;repeat++)for(const theme of ['forest','disco','bloodwood'])for(const turn of [false,true]){
   await run(`Math.random=(()=>{let seed=731;return()=>((seed=Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;})();
    roadLabState.direction=1;roadLabState.entry=${turn};
    startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme===${JSON.stringify(theme==='forest'?'bloodwood':theme)}));
    if('${theme}'==='forest'){
     if(!${turn}){startJourneyWithSeed(647486904);godMode=true;for(let i=0;i<110;i++)update(1/60);}
     else{const e=roadLabState.fixture.edge;e.preview.theme='forest';for(const p of e.pieces)p.theme='forest';}
    }
    if(${turn}){
     for(let i=0;i<400&&dist<roadLabState.fixture.node.at-20;i++)update(1/60);
     player.x=player.lane=2;chooseJourneyDirection(1);
     for(let i=0;i<300&&journey.phase!=='turning';i++)update(1/60);
    }
    render();`);
   const data=await run(`(async()=>{
    const frames=[],cpu=[],steadyFrames=[],steadyCpu=[],phases={},canvasStart=pacingCanvases;let last=0;
    for(let i=0;i<${frameCount};i++){
     if(mode!=='run')break; // Do not count the minigame/fight as running frames.
     const now=await new Promise(resolve=>pacingRAF(resolve));if(last)frames.push(now-last);last=now;
     const at=performance.now();update(1/120);render();const elapsed=performance.now()-at;cpu.push(elapsed);
     if(i>=30){steadyFrames.push(frames.at(-1));steadyCpu.push(elapsed);}
     const phase=journey.phase;(phases[phase]||(phases[phase]=[])).push(elapsed);
    }
    const summary=a=>{a.sort((a,b)=>a-b);const tail=a.slice(Math.floor(a.length*.99));return {
     median:a[Math.floor(a.length*.5)],p95:a[Math.floor(a.length*.95)],p99:a[Math.floor(a.length*.99)],max:a.at(-1),
     averageFps:1000/(a.reduce((s,n)=>s+n,0)/a.length),
     low1Fps:1000/(tail.reduce((s,n)=>s+n,0)/tail.length),over25:a.filter(n=>n>25).length,over50:a.filter(n=>n>50).length};};
    return {sampleCount:cpu.length,cpu:summary(cpu),frames:summary(frames),steadyCpu:summary(steadyCpu),steadyFrames:summary(steadyFrames),phases:Object.fromEntries(Object.entries(phases).map(([k,v])=>[k,summary(v)])),
     canvasAllocations:pacingCanvases-canvasStart,cache:KRSunlitForest.report(),mode};
   })()`);
   if(frameCount===180)assert.equal(data.mode,'run');assert(data.sampleCount>=180);assert(data.cache.cacheBytes<=5*1048576);
   assert(data.canvasAllocations<=48,'Native surfaces are churning during movement');
   const result={device,theme,turn,repeat,...data};results.push(result);console.log(JSON.stringify(result));
   if(repeat===0)await page.screenshot({path:path.join(out,`${label}-${device}-${theme}-${turn?'turn':'straight'}.png`)});
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 fs.writeFileSync(path.join(out,`${label}.json`),JSON.stringify({label,physicalPhone:false,results},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
