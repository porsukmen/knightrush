const {chromium}=require('playwright'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true}),out=path.resolve('output/road-battle-cache');fs.mkdirSync(out,{recursive:true});
try{const results=[];
for(const [device,width,height,dpr] of [['desktop',1280,900,1],['phone',390,844,2]]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
 await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);await page.waitForFunction(()=>!!window.KRSunlitForest);
 const run=s=>page.evaluate(s=>(0,eval)(s),s);
 const ids=await run("['bloodwood',...ROAD_ENEMIES.map(e=>e.id)]");
 for(const id of ids){
  await run(`roadLabState.direction=0;roadLabState.entry=false;startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.id==='${id}'));godMode=true;
   dist=roadLabState.slot.at-.01;roadScroll=dist;for(let i=0;i<10&&mode==='run';i++)update(1/60);
   perfNow=5;for(let i=0;i<8;i++)render();`);
  assert.equal(await run('mode'),'boss');
  const report=await run(`(()=>{
   const helper=KRSunlitForest.drawBattleWorld;
   const snapshot=()=>JSON.stringify({player,hp:boss.hp,ap:boss.ap,resolve:boss.resolve,phase:boss.phase,
    state:boss.state,stateT:boss.stateT,dist,roadScroll,events:journeyRoute.eventRecords});
   const state=snapshot();
   function pixels(){render();return g.getImageData(0,0,cvs.width,cvs.height).data;}
   const a=pixels();let b;try{KRSunlitForest.drawBattleWorld=()=>false;b=pixels();}finally{KRSunlitForest.drawBattleWorld=helper;}
   let major=0,total=0;for(let i=0;i<a.length;i+=4){const d=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);if(d>45)major++;total+=d;}
   const before=KRSunlitForest.report();for(let i=0;i<60;i++)render();const after=KRSunlitForest.report();
   const unchanged=state===snapshot();
   return {major,meanDelta:total/(a.length/4),unchanged,before,after};
  })()`);
  assert(report.unchanged,'Rendering mutated combat state');assert(report.major<150,'Cached scenery differs visibly from the live pipeline');
  assert(report.after.cacheBytes<=5*1048576);assert.equal(report.after.battleBuilds,report.before.battleBuilds,'Stationary battle repeatedly rebuilds');
  if(device==='desktop')assert(report.after.battleHits>report.before.battleHits,'Road battle not using shared cache');
  await page.screenshot({path:path.join(out,device+'-'+id+'.png')});
  // Camera changes invalidate immediately; particles behind the world use live order.
  assert(await run(`(()=>{const hits=KRSunlitForest.report().battleHits;dist+=.5;render();return KRSunlitForest.report().battleHits===hits;})()`));
  await run('render();render();');
  assert(await run(`(()=>{const hits=KRSunlitForest.report().battleHits;particles.push({behindBoss:true,behindPlayer:false,life:1,maxLife:1,x:20,y:20,size:2,col:'#fff'});render();particles.length=0;return KRSunlitForest.report().battleHits===hits;})()`));
  await run("setMode('run');");assert.equal(await run('KRSunlitForest.report().battleCacheBytes'),0,'Plate retained after battle');
  results.push({device,id,...report});
 }
 assert.deepEqual(errors,[]);await page.close();
}
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(results,null,2));console.log('ROAD_BATTLE_CACHE_OK',results.map(r=>({device:r.device,id:r.id,major:r.major,meanDelta:r.meanDelta,bytes:r.after.cacheBytes,cached:r.after.battleCacheBytes>0})));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
