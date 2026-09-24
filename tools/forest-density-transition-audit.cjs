// Native woods / sky regression. Evidence is not aesthetic or device approval.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const label=process.argv[2]||'after',out=path.resolve('output/forest-density',label);
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 const results=[];try{for(const [device,width,height,dpr]of [['desktop',775,1278,1],['phone',390,844,2]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);await page.waitForFunction(()=>window.KRSunlitForest);
  const run=s=>page.evaluate(s=>(0,eval)(s),s);
  for(const scene of ['straight','junction','crimson']){
   await run(`Math.random=(()=>{let n=731;return()=>((n=Math.imul(n,1664525)+1013904223)>>>0)/4294967296;})();
    roadLabState.direction=1;roadLabState.entry=true;startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='bloodwood'));
    if('${scene}'==='straight')startJourneyWithSeed(647486904);
    else if('${scene}'==='crimson'){roadLabState.direction=0;roadLabState.entry=false;startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='bloodwood'));}
    godMode=true;const target='${scene}'==='straight'?120:'${scene}'==='junction'?roadLabState.fixture.node.at-20:dist+12;
    for(let i=0;i<2000&&dist<target;i++)update(1/60);perfNow=5;for(let i=0;i<50;i++)render();`);
   const before=await run('JSON.stringify({dist,player,obstacles,pickups,events:journeyRoute.eventRecords})');
   const stats=await run(`(()=>{const t=[];for(let i=0;i<160;i++){const a=performance.now();render();t.push(performance.now()-a);}t.sort((a,b)=>a-b);
    return {median:t[80],p95:t[152],report:KRSunlitForest.report(),trees:KRSunlitForest.inspect().filter(o=>o.id<3).length,
    endTrees:curvedUpcomingEnd()?journeyEndTrees(curvedUpcomingEnd().node,curvedUpcomingEnd().edge).length:0};})()`);
   assert.equal(await run('JSON.stringify({dist,player,obstacles,pickups,events:journeyRoute.eventRecords})'),before);
   assert(stats.report.cacheBytes<=5*1048576);await page.screenshot({path:path.join(out,`${device}-${scene}.png`)});
   results.push({device,scene,...stats});
  }
  // Sample real rendered sky through both ramps; keep the camera fixed.
  const sky=await run(`(()=>{const e=journeyActiveEdge(),first=e.pieces[0].start,last=e.pieces.at(-1).end,ctx=g;
   const c=document.createElement('canvas');c.width=cvs.width;c.height=cvs.height;const samples=[];let maxJump=0,allocations=0;
   const create=document.createElement.bind(document);document.createElement=function(n,...a){if(n==='canvas')allocations++;return create(n,...a);};
   try{g=c.getContext('2d');g.setTransform(viewScale,0,0,viewScale,0,PAD_TOP*viewScale);
    for(const range of [[first+30,first+96],[last-71,last+1]]){let prev=null,unique=new Set();
     for(let at=range[0];at<=range[1];at+=.15){dist=at;drawBackground();const v=Array.from(g.getImageData(4,4,1,1).data).slice(0,3);
      unique.add(v.join());if(prev)maxJump=Math.max(maxJump,...v.map((x,i)=>Math.abs(x-prev[i])));prev=v;}
     samples.push({colors:unique.size,last:prev});}
   }finally{g=ctx;document.createElement=create;}return {samples,maxJump,allocations};})()`);
  if(label!=='before'){assert(sky.maxJump<=2,'Sky still changes in visible palette steps');assert.equal(sky.allocations,0,'Transition allocates sky canvases');}
  results.push({device,sky});assert.deepEqual(errors,[]);await page.close();
 }fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(results,null,2));console.log('FOREST_DENSITY_TRANSITION',JSON.stringify(results));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
