const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/morning-forest');
function assertNative(report){
 assert.equal(report.renderer,'native-polygons');
 assert.equal(report.decodedBytes,0,'Native woodland must not retain decoded sprite images');
 assert.equal(report.imagePixels,null);
 assert.equal(report.assets,null);
 assert.equal(report.error,null);
 assert(report.rows<50,'World-row cache must remain bounded');
 assert(report.cache,'Native art cache accounting must be exposed');
 assert(Number.isFinite(report.cache.bytes)&&report.cache.bytes>=0);
 assert(report.cache.budgetBytes>0&&report.cache.budgetBytes<=5*1024*1024,
   'Code-native canvas cache budget must stay at or below 5 MiB');
 assert(report.cache.bytes<=report.cache.budgetBytes,'Native art cache exceeded its byte budget');
 assert(Number.isInteger(report.cache.entries)&&report.cache.entries>=0);
}
async function compareFrames(first,second){
 const images=await Promise.all([loadImage(first),loadImage(second)]);
 assert.equal(images[0].width,images[1].width);assert.equal(images[0].height,images[1].height);
 const pixels=images.map(image=>{
  const canvas=createCanvas(image.width,image.height),ctx=canvas.getContext('2d');
  ctx.drawImage(image,0,0);return ctx.getImageData(0,0,image.width,image.height).data;
 });
 let changedPixels=0,maxChannelDelta=0;
 for(let i=0;i<pixels[0].length;i+=4){
  let changed=false;
  for(let c=0;c<4;c++){
   const delta=Math.abs(pixels[0][i+c]-pixels[1][i+c]);
   if(delta)changed=true;maxChannelDelta=Math.max(maxChannelDelta,delta);
  }
  if(changed)changedPixels++;
 }
 return {changedPixels,maxChannelDelta,totalPixels:images[0].width*images[0].height};
}
function assertPoolTreeClearance(items){
 for(const pool of items.filter(o=>o.kind==='pool')){
  const xs=pool.waterBounds.map(p=>p.x),zs=pool.waterBounds.map(p=>p.z),
    left=Math.min(...xs),right=Math.max(...xs),near=Math.min(...zs),far=Math.max(...zs);
  for(const tree of items.filter(o=>o.id<3)){
   const radius=tree.width*.21+.6;
   assert(tree.x+radius<=left||tree.x-radius>=right||tree.z+radius<=near||tree.z-radius>=far,
     'Tree root-flare overlaps a decorative pool bank: '+JSON.stringify({tree,pool:{x:pool.x,z:pool.z}}));
  }
 }
}
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const errors=[],morningAssets=[],page=await browser.newPage({viewport:{width:1280,height:900}});
  page.on('request',r=>{if(/assets\/morning-forest\//.test(r.url()))morningAssets.push(r.url());});
  page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE',e.message);});
  page.on('console',m=>{if(m.type()==='error')console.error('CONSOLE',m.text());});
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?morninglab=1');
  await page.waitForFunction(()=>window.KRMorningForest?.report().ready,null,{polling:100,timeout:30000});
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  const rootRequirements=await run(`({main:forestCorridor.course.filter(r=>r.entity.kind==='root').map(r=>r.entity.req),
    branch:forestCorridor.branchCourse.filter(r=>r.entity.kind==='root').map(r=>r.entity.req)})`);
  assert.deepEqual(rootRequirements,{main:[['duck','jump',null],[null,null,'duck']],
    branch:[['jump','jump','duck'],['duck',null,null]]},'Use the production outer-duck / inner-jump root patterns');
  for(const distance of [0,40,92,108,142,155,215]){
   await run(`KRMorningForest.restart();dist=${distance};roadScroll=dist;curvedGroundDistance=dist;
     for(const item of forestCorridor.course)item.entity.z=item.z-dist;render();`);
   assertPoolTreeClearance(await run('KRMorningForest.inspectWorld()'));
   await page.screenshot({path:path.join(out,`desktop-${distance}.png`)});
  }
  // Native lane input and native corner animation, not a camera mock.
  await run('KRMorningForest.restart();dist=227;roadScroll=dist;curvedGroundDistance=dist;player.x=2;player.lane=2;handleAction("right");');
  assert.equal(await run('journey.phase'),'turning');
  for(const [id,n]of [['corner-entry',1],['corner-half',16],['corner-exit',24]]){
   await run(`for(let i=0;i<${n};i++)update(1/60);render();`);
   assertPoolTreeClearance(await run('KRMorningForest.inspectWorld()'));
   await page.screenshot({path:path.join(out,id+'.png')});
  }
  await run('for(let i=0;i<200;i++)update(1/60);render();');
  assert(['settling','branch'].includes(await run('journey.phase')));
  await page.screenshot({path:path.join(out,'branch.png')});
  await run('for(let i=0;journey.branchTravel<142&&i<1000;i++)update(1/60);render();');
  await page.screenshot({path:path.join(out,'branch-root-three-lanes.png')});
  await run('for(let i=0;journey.branchTravel<212&&i<1000;i++)update(1/60);render();');
  await page.screenshot({path:path.join(out,'branch-root-one-lane.png')});
  await page.setViewportSize({width:390,height:844});
  await run('resize();KRMorningForest.restart();for(let i=0;i<150;i++)update(1/60);render();');
  await page.screenshot({path:path.join(out,'phone.png')});
  const report=await run('KRMorningForest.report()');
  assert.equal(report.active,true);assertNative(report);
  const placements=await run('KRMorningForest.inspectWorld()');
  assertPoolTreeClearance(placements);
  assert(placements.some(o=>o.id===7&&Math.abs(o.x)>12),'Purple flowers must also appear in outer woodland belts');
  const pools=placements.filter(o=>o.kind==='pool');assert(pools.length>0,'No roadside pools');
  const roadHalf=await run('CURVED_ROAD_HALF');
  for(const pool of pools)for(const p of pool.waterBounds){
    assert(Math.abs(p.x)>roadHalf,'Decorative water overlaps the main road');
    assert(!(p.x>0&&Math.abs(p.z-235)<roadHalf),'Decorative water overlaps the branch');
  }
  assert.deepEqual(morningAssets,[],'Archived atlas must never load in the native scene');
  assert.equal(await run('typeof window.KRMorningAtlas'),'undefined');
  assert.equal(await run('forestBakedImages.size'),0,'Old forest art loaded in new scene');
  // Drawing can cache geometry, but cannot move the road, camera, knight or
  // obstacle placements. Freeze simulation and compare two complete frames.
  const snapshot=()=>run(`({dist,roadScroll,curvedGroundDistance,runDistance,
    player:{x:player.x,lane:player.lane,alive:player.alive},
    camera:calculateJourneyCameraPose(),phase:journey.phase,
    course:forestCorridor.course.map(item=>({z:item.z,depth:item.entity.z})),
    projection:[[0,60],[5,100],[-5,20]].map(([side,depth])=>journeyProjectCamera(side,depth))})`);
  await run('render();');
  const before=await snapshot(),first=await page.locator('canvas').first().screenshot();
  await run('for(let i=0;i<3;i++)render();');
  assert.deepEqual(await snapshot(),before,'Repeated rendering changed gameplay/projection state');
  const repeated=await page.locator('canvas').first().screenshot();
  const renderDifference=await compareFrames(first,repeated);
  // Chromium may round a handful of antialiased polygon-edge pixels differently
  // between complete identical frames. No positional/color/material change is
  // permitted; allow only tiny channel variations over <=0.002% of the image.
  const stable=renderDifference.maxChannelDelta<=8&&
   renderDifference.changedPixels<=Math.ceil(renderDifference.totalPixels*.00002);
  if(!stable){
   fs.writeFileSync(path.join(out,'purity-first.png'),first);
   fs.writeFileSync(path.join(out,'purity-repeated.png'),repeated);
  }
  assert(stable,'Repeated native frame changed without simulation advancing: '+JSON.stringify(renderDifference));
  await run('resetRun();setMode("menu");render();');
  assert.equal(await run('KRMorningForest.report().active'),false);
  assertNative(await run('KRMorningForest.report()'));
  assert.equal(await run('KRMorningForest.report().rows'),0);
  assert.equal(await run('KRMorningForest.report().cache.bytes'),0,'Leaving the lab must release native canvas pixels');
  assert.equal(await run('KRMorningForest.report().cache.entries'),0,'Leaving the lab must clear cached canvases');
  assert.deepEqual(errors,[]);
  // Normal game never downloads the new lab or its atlas.
  const normal=await browser.newPage();let unexpected=[];
  normal.on('request',r=>{if(/morning-forest/.test(r.url()))unexpected.push(r.url());});
  await normal.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
  await normal.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
  assert.deepEqual(unexpected,[]);
  // Constrained phone uses the same native geometry, with no atlas or decoded
  // bitmap allocation. This is device emulation, not a physical-phone benchmark.
  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
  const assets=[];mobile.on('request',r=>{if(/assets\/morning-forest\//.test(r.url()))assets.push(r.url());});
  mobile.on('pageerror',e=>errors.push(e.message));
  await mobile.addInitScript(()=>{
    window.requestAnimationFrame=()=>0;
    Object.defineProperty(navigator,'deviceMemory',{get:()=>2});
    Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>4});
  });
  await mobile.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?morninglab=1');
  await mobile.waitForFunction(()=>window.KRMorningForest?.report().ready,null,{polling:100});
  await mobile.evaluate(()=>(0,eval)('for(let i=0;i<105;i++)update(1/60);render();'));
  await mobile.screenshot({path:path.join(out,'low-memory-phone.png')});
  const mobileReport=await mobile.evaluate(()=>KRMorningForest.report());
  assertNative(mobileReport);assert.deepEqual(assets,[]);
  assert.equal(await mobile.evaluate(()=>typeof window.KRMorningAtlas),'undefined');
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({...report,mobile:mobileReport,errors,
    nativeRenderPurity:true,renderDifference,atlasRequests:morningAssets.length+assets.length,
    normalIsolation:true,physicalPhoneBenchmarked:false},null,2));
  console.log('MORNING_FOREST_OK '+JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
