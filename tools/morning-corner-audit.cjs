// Corner regression: world-fixed hazards and continuous distant parallax.
const {chromium}=require('playwright');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/morning-corner');
async function difference(a,b){
 const images=await Promise.all([loadImage(a),loadImage(b)]);
 const data=images.map(im=>{const c=createCanvas(im.width,im.height),g=c.getContext('2d');
  g.drawImage(im,0,0);return g.getImageData(0,0,c.width,c.height).data;});
 let major=0;for(let i=0;i<data[0].length;i+=4)
  if([0,1,2].some(k=>Math.abs(data[0][i+k]-data[1][i+k])>24))major++;
 return {major,fraction:major/(images[0].width*images[0].height)};
}
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const errors=[],results={};
  for(const [device,width,height,dpr]of [['desktop',1280,900,1],['phone',390,844,2]]){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr});
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
   await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?morninglab=1');
   await page.waitForFunction(()=>window.KRMorningForest?.report().ready);
   const run=code=>page.evaluate(code=>(0,eval)(code),code);
   const background=async(yaw,phase='turning')=>Buffer.from((await run(`(()=>{
    const main=g,frame=journeyRenderFrame,phase=journey.phase;
    const c=document.createElement('canvas');c.width=Math.ceil(VW*viewScale);
    c.height=Math.ceil((HORIZON_Y+PAD_TOP)*viewScale);
    try{g=c.getContext('2d');g.setTransform(viewScale,0,0,viewScale,0,PAD_TOP*viewScale);
     journeyRenderFrame={camera:{x:0,z:227,yaw:${yaw}}};journey.phase=${JSON.stringify(phase)};
     drawBackground();return c.toDataURL();
    }finally{g=main;journeyRenderFrame=frame;journey.phase=phase;}
   })()`)).split(',')[1],'base64');
   const seams=[];
   for(const yaw of [51/65,43/38,102/65,768/26,768/38,768/65,370/18]){
    const a=await background(yaw-.00001),b=await background(yaw+.00001);
    const diff=await difference(a,b);seams.push({yaw,...diff});
    if(diff.fraction>.005){fs.writeFileSync(path.join(out,device+'-seam-before.png'),a);
     fs.writeFileSync(path.join(out,device+'-seam-after.png'),b);}
   }
   const cacheHandoff=await difference(await background(Math.PI/2),await background(Math.PI/2,'settling'));
   await run('KRMorningForest.restart();dist=227;roadScroll=dist;curvedGroundDistance=dist;player.lane=2;player.x=2;for(const r of forestCorridor.course)r.entity.z=r.z-dist;render();');
   const snapshots=[];
   const snapshot=()=>run(`(()=>{
    const entries=[...DRAW_QUEUE.filter(d=>d.draw===drawObstacleEntity||d.draw===drawJourneyObstacle).map(d=>({o:d.ref.entity||d.ref,z:d.z})),
      ...FRONT_OBSTACLES.map(o=>({o,z:o.z})),...JOURNEY_FRONT_OBSTACLES.map(d=>({o:d.item.entity,z:d.depth}))];
    return {phase:journey.phase,t:journey.turnT,items:entries.map(d=>({at:d.o.morningAt,branch:d.o.morningBranch,depth:d.z})),
     expected:[...forestCorridor.course,...forestCorridor.branchCourse].map(r=>{
      const lane=(Math.min(...r.entity.lanes)+Math.max(...r.entity.lanes))/2,off=(lane-1)*JOURNEY_LANE_WORLD;
      const x=r.entity.morningBranch?JOURNEY_LANE_WORLD+r.z:off,z=r.entity.morningBranch?235-off:r.z;
      const c=journeyCameraPoint(x,z);return {at:r.z,branch:r.entity.morningBranch,depth:c.depth,cull:r.entity.type.cullZ};
     }).filter(d=>d.depth>=d.cull&&d.depth<=SPAWN_FAR)};
   })()`);
   snapshots.push(await snapshot());
   await run('handleAction("right");render();');
   assert.equal(await run('journey.phase'),'turning');
   for(let frame=0;frame<100;frame++){
    await run('update(1/60);render();');snapshots.push(await snapshot());
    if([0,9,18,27,35,36,37,40,46].includes(frame))
     await page.screenshot({path:path.join(out,device+'-turn-'+String(frame).padStart(2,'0')+'.png')});
    if(frame>=47&&snapshots.at(-1).phase!=='turning')break;
   }
   assert.notEqual(snapshots.at(-1).phase,'turning','Corner never handed off');
   const missing=[],duplicates=[],wrongDepth=[];
   for(const snap of snapshots)for(const expected of snap.expected){
    const actual=snap.items.filter(o=>o.at===expected.at&&o.branch===expected.branch);
    if(!actual.length)missing.push({phase:snap.phase,t:snap.t,...expected});
    if(actual.length>1)duplicates.push(expected);
    if(actual.length===1&&Math.abs(actual[0].depth-expected.depth)>1e-6)wrongDepth.push(expected);
   }
   results[device]={seams,cacheHandoff,missing,duplicates,wrongDepth,frames:snapshots.length,
    cache:await run('KRMorningForest.report().cache')};
   await page.close();
  }
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({results,errors},null,2));
  for(const [device,r]of Object.entries(results)){
   assert(r.seams.every(s=>s.fraction<.005),device+': distant wood jumped at a parallax wrap');
   assert(r.cacheHandoff.fraction<.005,device+': background changed at cache handoff');
   assert.equal(r.missing.length,0,device+': hazards absent before/during corner');
   assert.equal(r.duplicates.length,0,device+': duplicate world hazards');
   assert.equal(r.wrongDepth.length,0,device+': hazard moved away from its world anchor');
   assert(r.cache.bytes<=r.cache.budgetBytes);
  }
  assert.deepEqual(errors,[]);console.log('MORNING_CORNER_OK '+JSON.stringify(results));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
