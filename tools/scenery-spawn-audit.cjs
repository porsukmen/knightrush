const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url'),root=path.resolve(__dirname,'..');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{requestAnimationFrame=()=>0;Date.now=()=>1800000000000;});
 await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
 const run=code=>page.evaluate(code=>(0,eval)(code),code),reports=[];
 for(const theme of ['forest','chest','caravan','inn','forge','bloodwood','disco']){
  const result=await run(`(()=>{
   Math.random=(()=>{let seed=731;return()=>((seed=Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;})();
   roadLabState.entry=false;roadLabState.direction=0;
   const index=ROAD_LAB_CASES.findIndex(c=>c.theme==='${theme}');
   if(index<0){startRun(0);}else startRoadLabCase(index);
   godMode=true;paused=false;render();
   const signature=()=>JSON.stringify(KRSunlitForest.inspect()),before=signature(),counts=KRSunlitForest.report(),checks=counts.placementChecks;
   for(let i=0;i<30;i++)render();
   const now=KRSunlitForest.report(),stableChecks=now.placementChecks===checks&&now.plantingBuilds===counts.plantingBuilds&&now.decorPlanBuilds===counts.decorPlanBuilds,stableScene=signature()===before;
   const candidate=KRSunlitForest.inspect().find(o=>o.id<3&&Math.abs(Math.abs(o.x)-9.3)<3&&o.z-dist>15&&o.z-dist<80);
   let rejected=null,unchanged=null;
   if(candidate){
    const at=candidate.z,ob=new ObstacleEntity('root',at-dist,[null,'jump',null],candidate.x<0?'L':'R');
    ob.roadTheme='forest';rejected=!KRSunlitForest.reserveObstacle(ob,at);
    const saved=obstacles;obstacles=[ob];render();const added=signature();obstacles=[];render();
    unchanged=added===before&&signature()===before;obstacles=saved;
   }
   return {theme:'${theme}',stableChecks,stableScene,rejected,unchanged,report:KRSunlitForest.report()};
  })()`);
  assert(result.stableChecks,result.theme+': repeated placement checks');
  assert(result.stableScene,result.theme+': stationary placement changed');
  if(result.rejected!==null){assert(result.rejected,result.theme+': late root erased occupied site');assert(result.unchanged,result.theme+': obstacle lifetime changed scenery');}
  reports.push(result);
 }
 // Exercise both turn directions using the genuine preview -> handoff path.
 for(const direction of [-1,1]){
  const result=await run(`(()=>{
   roadLabState.entry=true;roadLabState.direction=${direction};
   startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='chest'));godMode=true;paused=false;
   const phases=new Set();let peak=0;
   for(let i=0;i<500;i++){
    if(journey.phase==='approach'&&dist>roadLabState.fixture.node.at-20){player.x=player.lane=${direction+1};chooseJourneyDirection(${direction});}
    update(1/60);if(mode!=='run')break;render();phases.add(journey.phase);peak=Math.max(peak,KRSunlitForest.report().placementRows);
   }
   return {direction:${direction},phases:[...phases],peak,report:KRSunlitForest.report()};
  })()`);
  assert(result.phases.includes('turning')&&result.phases.includes('settling'),'Missing real turn coverage');assert(result.peak<=256);
  reports.push(result);
  fs.mkdirSync(path.join(root,'output/scenery-spawn'),{recursive:true});
  await page.screenshot({path:path.join(root,'output/scenery-spawn/turn-'+direction+'.png')});
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(root,'output/scenery-spawn/report.json'),JSON.stringify(reports,null,2));
 console.log(JSON.stringify(reports.map(({theme,direction,stableChecks,rejected,unchanged,phases,report:r})=>({theme,direction,stableChecks,rejected,unchanged,phases,placementChecks:r.placementChecks,rootSpawnChecks:r.rootSpawnChecks,rootSpawnRejected:r.rootSpawnRejected})),null,2));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1;});
