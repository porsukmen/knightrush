const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs');
const {execFileSync}=require('node:child_process');
const legacy=execFileSync('git',['show','8fbe0c4:KnightRush.html'],{encoding:'utf8',maxBuffer:8*1024*1024});
function legacyFunction(name){const start=legacy.indexOf('function '+name+'(');assert(start>=0);
 let end=legacy.indexOf('{',start),depth=1;for(end++;depth&&end<legacy.length;end++){
  if(legacy[end]==='{')depth++;else if(legacy[end]==='}')depth--;
 }return legacy.slice(start,end);}
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});
 try{const page=await browser.newPage({viewport:{width:480,height:800}});
 await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
 await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);
 await page.waitForFunction(()=>!!window.KRSunlitForest);
 const run=s=>page.evaluate(s=>(0,eval)(s),s),results=[];
 await run('globalThis.legacyCameraReference='+legacyFunction('calculateJourneyCameraPose'));
 for(const fps of [30,60,120])for(const dir of [-1,1])for(const late of [false,true]){
 const result=await run(`(()=>{
  roadLabState.direction=${dir};roadLabState.entry=true;startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='disco'));
  for(let i=0;i<800&&dist<roadLabState.fixture.node.at+${late?'JOURNEY_TURN_LATE_DISTANCE-1':'-20'};i++)update(1/120);
  player.x=player.lane=${dir+1};const accepted=chooseJourneyDirection(${dir});
  for(let i=0;i<300&&journey.phase!=='turning';i++)update(1/120);
  if(journey.phase!=='turning')return {accepted,phase:journey.phase,dist,node:roadLabState.fixture.node.at};
  const frames=[];let prev=calculateJourneyCameraPose();const referenceSpeed=speed();let maxLegacyError=0;
  for(let i=0;i<300&&journey.phase==='turning';i++){
   update(1/${fps});const p=calculateJourneyCameraPose();
   const reference=legacyCameraReference();maxLegacyError=Math.max(maxLegacyError,
    Math.abs(p.x-reference.x),Math.abs(p.z-reference.z),Math.abs(p.yaw-reference.yaw));
   frames.push({t:journey.turnT,v:Math.hypot(p.x-prev.x,p.z-prev.z)*${fps}/referenceSpeed,x:p.x,z:p.z});prev=p;
  }
  const endError=Math.abs(dist-journey.turnStartDist-journey.turnForward),phase=journey.phase;
  update(1/${fps});const next=calculateJourneyCameraPose(),handoffSpeed=Math.hypot(next.x-prev.x,next.z-prev.z)*${fps}/referenceSpeed;
  return {accepted,referenceSpeed,forward:journey.turnForward,exit:journey.turnExitTravel,
   phase,endError,handoffSpeed,maxLegacyError,duration:frames.length/${fps},minSpeedRatio:Math.min(...frames.map(f=>f.v)),
   maxSpeedRatio:Math.max(...frames.map(f=>f.v)),frames};
 })()`);
 results.push({fps,dir,late,...result});console.log(JSON.stringify({...results.at(-1),frames:undefined}));
 if(!process.argv.includes('--baseline')){
  assert.equal(result.phase,'settling');assert(result.maxLegacyError<1e-9,'Camera differs from user-requested legacy turn');
  assert(Math.abs(result.duration-.62)<2/fps,'Legacy turn timing was changed');
  assert(result.endError<1e-6,'Camera/route endpoints disagree');
  assert(Math.abs(result.handoffSpeed-1)<.02,'Straight-road handoff changes physical speed');
 }
 }
 fs.mkdirSync('output/turn-motion',{recursive:true});fs.writeFileSync('output/turn-motion/'+(process.argv.includes('--baseline')?'before':'restored-classic')+'.json',JSON.stringify(results,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
