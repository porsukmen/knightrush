const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url'),assert=require('node:assert/strict');
const label=process.argv[2]||'after',out=path.resolve('output/road-rock-volume',label);
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 try{const results=[];for(const [device,width,height,dpr]of [['desktop',775,1000,1],['phone',390,844,2]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);await page.waitForFunction(()=>window.KRSunlitForest);
  const run=s=>page.evaluate(s=>(0,eval)(s),s);
  await run('startJourneyWithSeed(647486904);godMode=true;for(let i=0;i<90;i++)update(1/60);perfNow=5;render();');
  for(const lanes of [1,2,3])for(const depth of [95,60,30,10,2]){
   await run(`const req=[null,null,null];for(let i=0;i<${lanes};i++)req[${lanes}===1?1:i]='jump';
    obstacles=[new ObstacleEntity('boulder',${depth},req,'M')];obstacles[0].seed=312;pickups=[];render();`);
   const before=await run('JSON.stringify(obstacles)');await run('render();');assert.equal(await run('JSON.stringify(obstacles)'),before);
   await page.screenshot({path:path.join(out,`${device}-${lanes}lane-${depth}m.png`)});
  }
  const sample=await run(`(()=>{const original=g.fill;let fills=0;g.fill=function(...a){fills++;return original.apply(this,a);};
   const times=[];try{for(let i=0;i<200;i++){obstacles[0].z=100-i*.45;const at=performance.now();drawObstacleEntity(obstacles[0],BIO());times.push(performance.now()-at);}}
   finally{g.fill=original;}times.sort((a,b)=>a-b);return {fillsPerRock:fills/200,median:times[100],p95:times[190],cache:KRSunlitForest.report().cacheBytes};})()`);
  if(label!=='before'){
   const projection=await run(`(()=>{const ctx=g,frame=journeyRenderFrame,move=g.moveTo,line=g.lineTo;let vertices=0,bad=0;
    const check=(fn)=>function(x,y){vertices++;if(!Number.isFinite(x)||!Number.isFinite(y))bad++;return fn.call(this,x,y);};
    const o=new ObstacleEntity('boulder',20,['jump',null,'jump'],'L'),before=JSON.stringify(o);
    try{g.moveTo=check(move);g.lineTo=check(line);
     for(const yaw of [-Math.PI/2,-.7,0,.7,Math.PI/2]){
      journeyRenderFrame={camera:{x:-Math.sin(yaw)*25,z:-Math.cos(yaw)*25,yaw},cos:Math.cos(yaw),sin:Math.sin(yaw)};
      KRSunlitArt.rock(o,(d,x)=>({x,z:d}));
     }
     return {vertices,bad,pure:JSON.stringify(o)===before};
    }finally{g.moveTo=move;g.lineTo=line;journeyRenderFrame=frame;}})()`);
   assert(projection.vertices>100);assert.equal(projection.bad,0);assert(projection.pure);sample.projection=projection;
  }
  assert(sample.cache<=5*1048576);assert.deepEqual(errors,[]);results.push({device,...sample});await page.close();
 }fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(results,null,2));console.log('ROCK_VOLUME_OK',JSON.stringify(results));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
