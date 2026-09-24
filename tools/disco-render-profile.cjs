// Frozen-frame subsystem attribution; run serially, not as an FPS benchmark.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const label=process.argv[2]||'current',out=path.resolve('output/disco-render-profile',label);
(async()=>{fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',headless:true});
 const results=[];
 try{const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
  await page.addInitScript(()=>{window.auditRAF=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=()=>0;});
  await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);await page.waitForFunction(()=>!!window.KRSunlitForest);
  const run=s=>page.evaluate(s=>(0,eval)(s),s),cdp=await page.context().newCDPSession(page);
  await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:250});
  for(const theme of ['forest','disco']){
   await run(`Math.random=(()=>{let n=731;return()=>((n=Math.imul(n,1664525)+1013904223)>>>0)/4294967296;})();
    roadLabState.direction=0;roadLabState.entry=false;startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='disco'));
    if('${theme}'==='forest'){const e=journeyActiveEdge();e.preview.theme='forest';for(const p of e.pieces)p.theme='forest';e.events=[];}
    for(let i=0;i<110;i++)update(1/60);perfNow=5;for(let i=0;i<80;i++)render();`);
   for(const omit of ['none','floor','venue','party','trees']){
    await run(`globalThis.profileSaved={drawJourneyDiscoGround,drawJourneyDiscoVenue,drawJourneyDiscoParty,drawJourneyDiscoDancer,drawJourneyDiscoLight,drawCurvedRoadWorld,drawJourneyTree};
     if('${omit}'==='floor'){drawJourneyDiscoGround=()=>{};drawCurvedRoadWorld=()=>{};}
     if('${omit}'==='venue')drawJourneyDiscoVenue=()=>{};
     if('${omit}'==='party'){drawJourneyDiscoParty=()=>{};drawJourneyDiscoDancer=()=>{};drawJourneyDiscoLight=()=>{};}
     if('${omit}'==='trees')drawJourneyTree=()=>{};`);
    if(omit==='none')await cdp.send('Profiler.start');
    const timing=await run(`(async()=>{const t=[];for(let i=0;i<100;i++){
     await new Promise(auditRAF);const at=performance.now();render();t.push(performance.now()-at);
    }t.sort((a,b)=>a-b);return {median:t[50],p95:t[95],cache:KRSunlitForest.report()};})()`);
    if(omit==='none'){
     const {profile}=await cdp.send('Profiler.stop');fs.writeFileSync(path.join(out,theme+'.cpuprofile'),JSON.stringify(profile));
     const nodes=new Map(profile.nodes.map(n=>[n.id,n])),times=new Map();
     profile.samples.forEach((id,i)=>{const n=nodes.get(id),key=n.callFrame.functionName+' @ '+path.basename(n.callFrame.url||'native')+':'+n.callFrame.lineNumber;
      times.set(key,(times.get(key)||0)+(profile.timeDeltas[i]||0));});
     timing.top=[...times].sort((a,b)=>b[1]-a[1]).slice(0,35);
    }
    results.push({theme,omit,...timing});console.log(theme,omit,timing.median,timing.p95);
    await run('Object.assign(globalThis,profileSaved);');
   }
  }
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(results,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
