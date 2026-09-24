const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 await page.addInitScript(()=>{window.testRAF=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=()=>0;});
 await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);
 await page.waitForFunction(()=>!!window.KRSunlitForest);
 const run=code=>page.evaluate(code=>(0,eval)(code),code);
 const cdp=await page.context().newCDPSession(page);
 if(process.argv.includes('--trace'))await cdp.send('Tracing.start',{categories:'devtools.timeline,cc,gpu,viz,v8',transferMode:'ReturnAsStream'});
 await run(`roadLabState.direction=1;roadLabState.entry=false;startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='disco'));render();`);
 await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:100});await cdp.send('Profiler.start');
 const frames=await run(`(async()=>{const frames=[];let last=0;
 for(let i=0;i<240;i++){const now=await new Promise(r=>testRAF(r));const start=performance.now();
 update(1/120);render();frames.push({i,wall:last?now-last:0,cpu:performance.now()-start});last=now;}return frames;})()`);
 const {profile}=await cdp.send('Profiler.stop'),nodes=new Map(profile.nodes.map(n=>[n.id,n])),times=new Map();
 profile.samples.forEach((id,i)=>{const f=nodes.get(id).callFrame,key=f.functionName+' '+path.basename(f.url)+':'+(f.lineNumber+1);times.set(key,(times.get(key)||0)+profile.timeDeltas[i]/1000);});
 console.log('CPU self ms',JSON.stringify([...times].sort((a,b)=>b[1]-a[1]).slice(0,35)));
 console.log('Slow frames',JSON.stringify(frames.sort((a,b)=>b.wall-a.wall).slice(0,12)));
 if(process.argv.includes('--trace')){
  const ended=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));await cdp.send('Tracing.end');
  const {stream}=await ended;let json='';for(;;){const part=await cdp.send('IO.read',{handle:stream});json+=part.data;if(part.eof)break;}
  await cdp.send('IO.close',{handle:stream});const trace=JSON.parse(json);
  console.log('Long traced slices',JSON.stringify(trace.traceEvents.filter(e=>e.ph==='X'&&e.dur>25000).sort((a,b)=>b.dur-a.dur).slice(0,25).map(e=>({name:e.name,ms:e.dur/1000,args:e.args}))));
 }
 fs.mkdirSync('output/sunlit-pacing',{recursive:true});fs.writeFileSync('output/sunlit-pacing/disco.cpuprofile',JSON.stringify(profile));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
