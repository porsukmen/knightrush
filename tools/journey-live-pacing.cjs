// Actual requestAnimationFrame -> frame() -> update()/render() pacing.
// Do not run other browser audits concurrently with this measurement.
// Phone mode is desktop Chromium at mobile dimensions/DPR, NOT real Safari.
// Usage: node tools/journey-live-pacing.cjs LABEL [--baseline] [--brave]
//        [--phone|--both] [--frames=600] [--repeats=1] [--straight]
//        [--theme=forest|disco|bloodwood|forge]
//        [--venue] (straight special-road approach, 80 m before event)
//        [--snapshot=output/path-to-flat-source-snapshot]
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/journey-live-pacing');
const args=process.argv.slice(2),has=flag=>args.includes('--'+flag);
const option=(name,fallback)=>args.find(a=>a.startsWith('--'+name+'='))?.split('=').slice(1).join('=')??fallback;
const label=args.find(a=>!a.startsWith('--'))||'current';
assert(/^[a-zA-Z0-9_-]+$/.test(label),'Use a simple filename-safe label');
const frameCount=Number(option('frames',600)),repeats=Number(option('repeats',1));
assert(Number.isInteger(frameCount)&&frameCount>=60&&frameCount<=10000,'frames must be 60..10000');
assert(Number.isInteger(repeats)&&repeats>=1&&repeats<=20,'repeats must be 1..20');
const baseline=has('baseline'),browserName=has('brave')?'brave':'edge';
const onlyTheme=option('theme',''),themes=onlyTheme?[onlyTheme]:['forest','disco','bloodwood'];
assert(themes.every(t=>['forest','disco','bloodwood','forge','chest','caravan','inn'].includes(t)),'Unsupported theme');
const devices=has('both')?['desktop','phone-emulation']:[has('phone')?'phone-emulation':'desktop'];
const snapshot=option('snapshot','');
const sourceFiles=['KnightRush.html','assets/forest/sunlit-forest.js','assets/forest/journey-forest.js'];
// The older stutter baseline predates adapter snapshots; retain its contract.
// New comparisons pin the Disco adapter too, including while files are edited.
if(!baseline||snapshot)sourceFiles.push('assets/forest/disco-grove.js');
if(!baseline&&fs.existsSync(snapshot?path.join(root,snapshot,'basalt-forge.js'):path.join(root,'assets/forest/basalt-forge.js')))
 sourceFiles.push('assets/forest/basalt-forge.js');
if(!baseline&&fs.existsSync(snapshot?path.join(root,snapshot,'treasure-road.js'):path.join(root,'assets/forest/treasure-road.js')))
 sourceFiles.push('assets/forest/treasure-road.js');
if(!baseline&&fs.existsSync(snapshot?path.join(root,snapshot,'autumn-caravan.js'):path.join(root,'assets/forest/autumn-caravan.js')))
 sourceFiles.push('assets/forest/autumn-caravan.js');
if(!baseline&&fs.existsSync(snapshot?path.join(root,snapshot,'mossy-inn.js'):path.join(root,'assets/forest/mossy-inn.js')))
 sourceFiles.push('assets/forest/mossy-inn.js');
const sourceContents=new Map(sourceFiles.map(name=>{
 const file=snapshot?path.join(root,snapshot,path.basename(name)):baseline?path.join(root,'output/stutter-source-before',path.basename(name)):path.join(root,name);
 assert(fs.existsSync(file),'Missing '+(baseline?'pre-edit baseline':'live source')+': '+file);
 return [name,fs.readFileSync(file)];
}));
const sourceHashes=Object.fromEntries([...sourceContents].map(([name,body])=>[name,createHash('sha256').update(body).digest('hex')]));
const sourceByURL=new Map(sourceFiles.map(name=>[pathToFileURL(path.join(root,name)).href,name]));
const mean=a=>a.length?a.reduce((n,x)=>n+x,0)/a.length:null;
const quantile=(sorted,p)=>sorted.length?sorted[Math.floor((sorted.length-1)*p)]:null;
function distribution(values){
 const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b);
 return {count:sorted.length,mean:mean(sorted),median:quantile(sorted,.5),p95:quantile(sorted,.95),p99:quantile(sorted,.99),max:sorted.at(-1)??null};
}
function summarize(samples,cadence){
 const gaps=samples.map(s=>s.gap),sorted=[...gaps].sort((a,b)=>a-b),tail=sorted.slice(-Math.max(1,Math.ceil(sorted.length*.01)));
 const missed=samples.filter(s=>s.gap>cadence*1.5).length;
 return {
  count:samples.length,frames:{...distribution(gaps),averageFps:gaps.length?1000/mean(gaps):null,
   low1Fps:tail.length?1000/mean(tail):null,cadenceMs:cadence,missedIntervalThresholdMs:cadence*1.5,
   missedIntervals:missed,missedIntervalPercent:samples.length?100*missed/samples.length:null,
   estimatedSkippedRefreshes:gaps.reduce((n,x)=>n+Math.max(0,Math.round(x/cadence)-1),0),
   over25:gaps.filter(x=>x>25).length,over50:gaps.filter(x=>x>50).length},
  cpu:distribution(samples.map(s=>s.cpu)),updateCpu:distribution(samples.map(s=>s.update)),renderCpu:distribution(samples.map(s=>s.render)),
  canvasAllocations:samples.reduce((n,s)=>n+s.allocated,0),
  simulationTimeMs:samples.reduce((n,s)=>n+s.simulatedMs,0),
  frameTimeNotSimulatedMs:samples.reduce((n,s)=>n+Math.max(0,s.gap-s.simulatedMs),0)
 };
}
function fixtureCode(theme,turn){return `
 Math.random=(()=>{let seed=731;return()=>((seed=Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;})();
 // Ambient survives resetRun(), and its wrapping consumes this same RNG.
 // Reset it before each fixture so baseline/live spawn identical obstacles.
 initAmbient();lastObsFull=false;SFX.setTestMuted(true);perfNow=0;player.gallop=0;
 roadLabState.direction=1;roadLabState.entry=${turn};
 if(!startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='${theme==='forest'?'bloodwood':theme}')))throw Error('No road fixture');
 if('${theme}'==='forest'){
  if(!${turn})startJourneyWithSeed(647486904);
  else {const edge=roadLabState.fixture.edge;edge.preview.theme='forest';for(const piece of edge.pieces)piece.theme='forest';}
 }
 godMode=true;paused=false;hitstop=0;
 // Fixed steps place the fixture BEFORE measurement only. Recorded movement
 // below is exclusively the game's native frame(now) and its real dt.
 if(${turn}){
  for(let i=0;i<400&&dist<roadLabState.fixture.node.at-20;i++)update(1/60);
  player.x=player.lane=2;chooseJourneyDirection(1);
  for(let i=0;i<300&&journey.phase!=='turning';i++)update(1/60);
  if(journey.phase!=='turning')throw Error('Fixture failed to enter a real turn');
 }
 if(${has('venue')&&!turn&&theme!=='forest'}){
  for(let i=0;i<5000&&mode==='run'&&dist<roadLabState.slot.at-80;i++)update(1/60);
  if(mode!=='run')throw Error('Venue fixture entered event too early');
 }
 hadFocus=document.hasFocus();window.__livePacing.arm=true;
 `;}

(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch(browserName==='brave'?{
  executablePath:option('brave-path','C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe'),headless:true
 }:{channel:'msedge',headless:true});
 const results=[],errors=[],calibrations=[];
 try{
  for(const device of devices)for(let repeat=0;repeat<repeats;repeat++){
   const context=await browser.newContext({viewport:device==='desktop'?{width:1280,height:900}:{width:390,height:844},deviceScaleFactor:device==='desktop'?1:2});
   const page=await context.newPage(),routed=Object.fromEntries(sourceFiles.map(n=>[n,0]));
   // Pin BOTH baseline and live sources for the entire process. Live edits
   // made elsewhere mid-run therefore cannot silently contaminate later cases.
   await page.route('**/*',route=>{
    const url=new URL(route.request().url());url.search='';url.hash='';
    const name=sourceByURL.get(url.href);
    if(!name)return route.continue();
    routed[name]++;
    return route.fulfill({contentType:name.endsWith('.html')?'text/html; charset=utf-8':'text/javascript; charset=utf-8',body:sourceContents.get(name)});
   });
   page.on('pageerror',e=>errors.push({device,repeat,message:e.message}));
   await page.addInitScript(({frameCount})=>{
    let seed=731;Math.random=()=>((seed=Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;
    const nativeRAF=window.requestAnimationFrame.bind(window),create=document.createElement.bind(document);
    const p=window.__livePacing={nativeRAF,allocated:0,collect:false,suspended:true,arm:false,count:0,
     frameCount,rows:new Float64Array(frameCount*15),phases:new Array(frameCount),modes:new Array(frameCount),
     update:0,render:0,updateDt:0,updateCalls:0,negativeDt:0,nonFiniteDt:0,error:null,reason:null};
    document.createElement=function(name,...rest){if(String(name).toLowerCase()==='canvas')p.allocated++;return create(name,...rest);};
    window.requestAnimationFrame=cb=>nativeRAF(now=>{
     if(cb.name!=='frame')return cb(now);
     if(p.suspended){window.requestAnimationFrame(cb);return;}
     if(p.arm){p.arm=false;p.align(now);}
     if(!p.collect)return cb(now);
     // Preallocated recording buffers avoid a new object/array for every frame.
     const index=p.count,offset=index*15,rows=p.rows;
     p.readBefore(rows,offset);p.phases[index]=p.phase;
     p.update=p.render=p.updateDt=p.updateCalls=0;
     const allocations=p.allocated,start=performance.now();
     try{cb(now);}catch(e){p.error=String(e.stack||e);p.reason='frame-error';p.collect=false;p.suspended=true;throw e;}
     const cpu=performance.now()-start;
     rows[offset]=now;rows[offset+1]=start;rows[offset+2]=cpu;rows[offset+3]=p.update;rows[offset+4]=p.render;
     rows[offset+5]=p.updateDt;rows[offset+6]=p.updateCalls;rows[offset+7]=p.allocated-allocations;
     p.readAfter(rows,offset);p.modes[index]=p.mode;p.count++;
     if(p.mode!=='run'){p.reason='mode:'+p.mode;p.collect=false;}
     else if(p.paused){p.reason='paused';p.collect=false;}
     else if(p.count>=p.frameCount){p.reason='frame-limit';p.collect=false;}
     if(!p.collect)p.suspended=true;
    });
   },{frameCount});
   await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
   await page.waitForFunction(()=>!!window.KRSunlitForest);
   const run=code=>page.evaluate(code=>(0,eval)(code),code);
   for(const name of sourceFiles)assert(routed[name]>0,'Source interception did not occur: '+name);
   await run(`(()=>{
    const p=window.__livePacing,originalUpdate=update,originalRender=render;
    p.align=now=>{lastTime=now;hadFocus=document.hasFocus();};
    p.readBefore=(rows,o)=>{rows[o+8]=dist;rows[o+10]=perfNow;p.phase=journey?.phase||'none';};
    p.readAfter=(rows,o)=>{rows[o+9]=dist;rows[o+11]=perfNow;rows[o+12]=hitstop;rows[o+13]=paused?1:0;rows[o+14]=journeyRenderSerial;p.mode=mode;p.paused=paused;};
    update=function(dt){const start=performance.now();p.updateDt+=dt;p.updateCalls++;
     if(p.collect&&dt<0)p.negativeDt++;if(p.collect&&!Number.isFinite(dt))p.nonFiniteDt++;
     try{return originalUpdate(dt);}finally{p.update+=performance.now()-start;}};
    render=function(){const start=performance.now();try{return originalRender();}finally{p.render+=performance.now()-start;}};
   })()`);
   const cadenceSamples=await page.evaluate(async()=>{
    const p=window.__livePacing,gaps=[];let last;
    for(let i=0;i<151;i++){const now=await new Promise(p.nativeRAF);if(last!==undefined&&i>30)gaps.push(now-last);last=now;}
    return gaps;
   });
   const sortedCadence=cadenceSamples.filter(x=>x>0&&x<100).sort((a,b)=>a-b);
   assert(sortedCadence.length>=100,'Insufficient idle rAF calibration samples');
   // A lower-half median resists occasional OS stalls in calibration, without
   // assuming this host has the 165 Hz display used in previous reports.
   const cadence=quantile(sortedCadence,.25);
   assert(cadence>0&&cadence<50,'Unusable native rAF cadence: '+cadence);
   calibrations.push({device,repeat,cadenceMs:cadence,samples:cadenceSamples,summary:distribution(cadenceSamples)});
   for(const theme of themes)for(const turn of (has('straight')?[false]:[false,true])){
    await run(`window.__livePacing.suspended=true;${fixtureCode(theme,turn)}`);
    await page.waitForFunction(()=>(0,eval)('!forestPreparing'));
    const initialFixture=await run(`({dist,phase:journey.phase,camera:calculateJourneyCameraPose(),activeEdge:journeyRoute.activeEdge,
     obstacles:obstacles.map(o=>({kind:o.kind,z:o.z,lanes:o.lanes})),pickups:pickups.map(o=>({kind:o.kind,z:o.z,lane:o.lane})),
     preview:journey.sunlitPreview?{obstacles:journey.sunlitPreview.obstacles.map(o=>({at:o.at,x:o.x,z:o.z,lane:o.lane,kind:o.entity.kind})),
      pickups:journey.sunlitPreview.pickups.map(o=>({at:o.at,x:o.x,z:o.z}))}:null})`);
    await run(`(()=>{const p=window.__livePacing;p.count=0;p.error=p.reason=null;p.negativeDt=p.nonFiniteDt=0;p.arm=true;
     p.canvasStart=p.allocated;p.collect=true;p.suspended=false;paused=false;})()`);
    await page.waitForFunction(()=>!window.__livePacing.collect,null,{timeout:Math.max(30000,frameCount*100)});
    const data=await run(`(()=>{const p=window.__livePacing;p.suspended=true;return {
     rows:Array.from(p.rows.subarray(0,p.count*15)),phases:p.phases.slice(0,p.count),modes:p.modes.slice(0,p.count),
     count:p.count,reason:p.reason,error:p.error,negativeDt:p.negativeDt,nonFiniteDt:p.nonFiniteDt,
     canvasAllocations:p.allocated-p.canvasStart,cache:KRSunlitForest.report()};})()`);
    const samples=[];
    for(let i=1;i<data.count;i++){
     const o=i*15,r=data.rows;
     samples.push({index:i,now:r[o],start:r[o+1],gap:r[o]-r[o-15],cpu:r[o+2],update:r[o+3],render:r[o+4],
      updateDt:r[o+5],updateCalls:r[o+6],allocated:r[o+7],beforeDistance:r[o+8],afterDistance:r[o+9],
      simulatedMs:(r[o+11]-r[o+10])*1000,hitstop:r[o+12],paused:!!r[o+13],serial:r[o+14],phase:data.phases[i],mode:data.modes[i]});
    }
    const stateErrors=[];
    if(data.error)stateErrors.push(data.error);
    if(data.negativeDt)stateErrors.push(data.negativeDt+' negative measurement update dt values');
    if(data.nonFiniteDt)stateErrors.push(data.nonFiniteDt+' non-finite measurement update dt values');
    if(data.reason==='paused')stateErrors.push('Run unexpectedly paused (focus loss or watchdog)');
    if(samples.some(s=>s.gap<=0||!Number.isFinite(s.gap)))stateErrors.push('Invalid rAF interval');
    if(samples.some(s=>![s.beforeDistance,s.afterDistance,s.simulatedMs,s.cpu,s.update,s.render].every(Number.isFinite)))stateErrors.push('Non-finite measured state');
    if(samples.length<30)stateErrors.push('Insufficient running frames');
    const steady=samples.filter(s=>s.index>=30),phaseNames=[...new Set(samples.map(s=>s.phase))];
    const result={device,repeat,theme,turn,requestedFrames:frameCount,recordedFrames:data.count,stopReason:data.reason,
     initialFixture,initialFixtureHash:createHash('sha256').update(JSON.stringify(initialFixture)).digest('hex'),
     complete:data.reason==='frame-limit',stateErrors,all:summarize(samples,cadence),steady:summarize(steady,cadence),
     phases:Object.fromEntries(phaseNames.map(name=>[name,summarize(samples.filter(s=>s.phase===name),cadence)])),
     canvasAllocations:data.canvasAllocations,cache:data.cache,samples};
    results.push(result);
    console.log(JSON.stringify({device,repeat,theme,turn,recordedFrames:result.recordedFrames,stopReason:data.reason,
     steady:result.steady,phases:Object.fromEntries(Object.entries(result.phases).map(([name,value])=>[name,{count:value.count,frames:value.frames}])),
     canvasAllocations:data.canvasAllocations,cacheBytes:data.cache.cacheBytes,stateErrors}));
   }
   await context.close();
  }
 }finally{
  await browser.close();
  const report={label,baseline,snapshot,browser:browserName,physicalPhone:false,audioTestMuted:true,method:'Native game frame(now); fixed steps used only before fixture measurement',
   caveat:'rAF scheduling intervals estimate pacing, not guaranteed display presentation times. Chromium mobile emulation is not Safari or physical phone performance.',
   frameCount,repeats,steadyDropsFirstFrames:30,sourceHashes,calibrations,errors,results};
  fs.writeFileSync(path.join(out,label+'.json'),JSON.stringify(report,null,2));
  console.log('Report: '+path.join(out,label+'.json'));
 }
 assert.deepEqual(errors,[],'Browser errors occurred');
 assert(results.every(r=>r.stateErrors.length===0),'Invalid measurement state; inspect report');
})().catch(error=>{console.error(error);process.exitCode=1;});
