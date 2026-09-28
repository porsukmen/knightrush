// Paired CPU microbenchmark complements (does not replace) live rAF pacing.
// Disable random obstacles in BOTH builds to compare exactly the same forest.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),root=path.resolve(__dirname,'..');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true}),results=[];try{
 for(const turn of [false,true])for(const version of ['before','after','after','before']){
  const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
  await p.addInitScript(()=>{requestAnimationFrame=()=>0;Date.now=()=>1800000000000;});
  if(version==='before')for(const name of ['KnightRush.html','assets/forest/journey-forest.js']){
   await p.route(pathToFileURL(path.join(root,name)).href,route=>route.fulfill({body:fs.readFileSync(path.join(root,'output/scenery-spawn-before',path.basename(name))),contentType:name.endsWith('.html')?'text/html':'text/javascript'}));
  }
  await p.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
  const r=await p.evaluate(turn=>(0,eval)(`(()=>{
   Math.random=(()=>{let s=731;return()=>((s=Math.imul(s,1664525)+1013904223)>>>0)/4294967296;})();
   CFG.P_OBSTACLE=0;CFG.P_MIXED=0;CFG.P_COINS=0;initAmbient();
   roadLabState.entry=${turn};roadLabState.direction=1;
   startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='chest'));godMode=true;paused=false;
   if(${turn}){
    for(let i=0;i<400&&dist<roadLabState.fixture.node.at-20;i++)update(1/60);
    player.x=player.lane=2;chooseJourneyDirection(1);
    for(let i=0;i<300&&journey.phase!=='turning';i++)update(1/60);
    for(let i=0;i<22;i++)update(1/60);
   }
   for(let i=0;i<80;i++)render();
   const times=[];for(let i=0;i<400;i++){const t=performance.now();render();times.push(performance.now()-t);}
   times.sort((a,b)=>a-b);
   return {mean:times.reduce((a,b)=>a+b,0)/times.length,p95:times[Math.floor(times.length*.95)],
    objects:KRSunlitForest.inspect().map(o=>[o.id,o.kind,Math.round(o.x*1e4),Math.round(o.z*1e4)]).sort().join('|'),report:KRSunlitForest.report()};
  })()`),turn);
  results.push({version,turn,...r});await p.close();
 }
 for(const turn of [false,true])assert.equal(new Set(results.filter(r=>r.turn===turn).map(r=>r.objects)).size,1,'Unequal comparison scenery');
 fs.writeFileSync(path.join(root,'output/scenery-spawn/perf.json'),JSON.stringify(results,null,2));
 console.log(results.map(({version,turn,mean,p95,report:r})=>({version,turn,mean,p95,placementChecks:r.placementChecks,plantingBuilds:r.plantingBuilds,decorPlanBuilds:r.decorPlanBuilds})));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1;});
