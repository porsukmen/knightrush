// Source-matched frozen visual regression for pacing optimizations.
// Does NOT approve artwork or rewrite approved visual references.
// Usage: node tools/stutter-visual-audit.cjs [label] [--desktop|--phone]
//        [--allow-native-resampling]
// Run separately from frame-pacing tests; this audit warms/re-renders fixtures.
const {chromium}=require('playwright'),{PNG}=require('pngjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createHash}=require('node:crypto'),{pathToFileURL}=require('node:url');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..'),args=process.argv.slice(2);
const label=args.find(a=>!a.startsWith('--'))||'current';
assert(/^[a-zA-Z0-9_-]+$/.test(label),'Use a filename-safe label');
const out=path.join(root,'output/stutter-visual',label),budget=5*1048576;
const hash=data=>createHash('sha256').update(data).digest('hex');
const names=['KnightRush.html','assets/forest/sunlit-forest.js','assets/forest/journey-forest.js'];
const sourceURL=new Map(names.map(name=>[pathToFileURL(path.join(root,name)).href,name]));
const sources={},sourceHashes={};
for(const version of ['before','after']){
 sources[version]=new Map(names.map(name=>{
  const file=version==='before'?path.join(root,'output/stutter-source-before',path.basename(name)):path.join(root,name);
  assert(fs.existsSync(file),'Missing source: '+file);return [name,fs.readFileSync(file)];
 }));
 sourceHashes[version]=Object.fromEntries([...sources[version]].map(([name,data])=>[name,hash(data)]));
}
function nativeTreeGeometryEvidence(){
 const records={};
 try{
  for(const version of ['before','after']){
   const source=sources[version].get('assets/forest/sunlit-forest.js').toString('utf8'),
    first=source.indexOf('const leafColors='),last=source.indexOf('function leaves(',first);
   assert(first>=0&&last>first,'Cannot locate native tree authoring block: '+version);
   const geometry=vm.runInNewContext(source.slice(first,last)+'\n;[treeModel(0),treeModel(1),treeModel(2)];',{
    model(build){
     const planes=[],add=(points,color)=>planes.push({points:points.map(([x,y])=>[x,y]),color});
     // Visibility metadata does not change authored vertices, fill order or colors.
     add.cover=()=>{};add.crown=()=>{};build(add);return planes;
    },
    Path2D:class {moveTo(){}lineTo(){}closePath(){}}
   },{timeout:500});
   const serialized=JSON.stringify(geometry);
   records[version]={serialized,hash:hash(serialized),variants:geometry.length,
    planes:geometry.reduce((sum,planes)=>sum+planes.length,0),
    coordinates:geometry.reduce((sum,planes)=>sum+planes.reduce((n,plane)=>n+plane.points.length*2,0),0)};
  }
  return {status:records.before.serialized===records.after.serialized?'identical':'different',
   identical:records.before.serialized===records.after.serialized,method:'VM-evaluated authored treeModel(0..2) vertices, fill order and colors; no numeric tolerance',
   before:{hash:records.before.hash,variants:records.before.variants,planes:records.before.planes,coordinates:records.before.coordinates},
   after:{hash:records.after.hash,variants:records.after.variants,planes:records.after.planes,coordinates:records.after.coordinates}};
 }catch(error){return {status:'error',identical:false,error:String(error.message||error)};}
}
const scenes=[...['forest','disco','bloodwood'].flatMap(theme=>[
 {name:theme+'-straight',theme,direction:0,view:'straight'},
 {name:theme+'-left',theme,direction:-1,view:'turn'},
 {name:theme+'-right',theme,direction:1,view:'turn'}
]),{name:'dead-end-grove',theme:'forest',direction:0,view:'end'},
 {name:'forest-shake',theme:'forest',direction:0,view:'straight',shake:8},
 {name:'forest-alpha-high',theme:'forest',direction:0,view:'straight',alpha:.85},
 {name:'forest-alpha-low',theme:'forest',direction:0,view:'straight',alpha:.5}];
const devices=[['desktop',775,1000,1],['phone',390,844,2]].filter(([name])=>
 !args.includes('--desktop')&&!args.includes('--phone')||args.includes('--'+name));
function setup(scene){return `
 window.__stutterOriginalTreeAlpha??=treeDistanceAlpha;
 treeDistanceAlpha=window.__stutterOriginalTreeAlpha;
 Math.random=(()=>{let seed=731;return()=>((seed=Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;})();
 // Ambient particles persist across runs. Their off-screen wrapping consumes
 // the shared RNG even when this renderer does not draw them.
 initAmbient();lastObsFull=false;SFX.setTestMuted(true);player.gallop=0;
 g.globalAlpha=1;g.globalCompositeOperation='source-over';
 perfNow=0;roadLabState.direction=${scene.direction};roadLabState.entry=${scene.view==='turn'};
 if(!startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='${scene.theme==='forest'?'bloodwood':scene.theme}')))throw Error('Missing lab fixture');
 godMode=true;paused=false;journeyPerf.enabled=false;
 ${scene.view==='end'?`
 startJourneyWithSeed(647486904);godMode=true;
 const end=journeyRoute.nodes.find(n=>n.type!=='boss'&&n.out.length&&!n.out.some(e=>e.direction===0)&&journeyRoute.nodes.some(p=>p.out.some(e=>e.to===n.id)));
 if(!end)throw Error('Missing closed-junction fixture');
 const parent=journeyRoute.nodes.find(n=>n.out.some(e=>e.to===end.id));
 journeyRoute.from=parent.id;journeyRoute.next=end.id;journeyRoute.activeEdge=parent.out.find(e=>e.to===end.id).id;
 dist=end.at-25;curvedGroundDistance=dist;roadScroll=dist;armJourneyNode();
 if(journey.endTrees.length!==68)throw Error('End grove lost trees');
 `:scene.view==='turn'?`
 if('${scene.theme}'==='forest'){
  const edge=roadLabState.fixture.edge;edge.preview.theme='forest';for(const piece of edge.pieces)piece.theme='forest';
 }
 for(let i=0;i<400&&dist<roadLabState.fixture.node.at-20;i++)update(1/60);
 player.x=player.lane=${scene.direction+1};
 if(!chooseJourneyDirection(${scene.direction}))throw Error('Turn request rejected');
 for(let i=0;i<300&&journey.phase!=='turning';i++)update(1/60);
 for(let i=0;i<18;i++)update(1/60);
 if(journey.phase!=='turning')throw Error('Fixture is not mid-turn');
 `:scene.theme==='forest'?`
 startJourneyWithSeed(647486904);godMode=true;for(let i=0;i<110;i++)update(1/60);
 `:``}
 perfNow=5;paused=false;journeyPerf.enabled=false;shakeMag=${scene.shake||0};shakeT=${scene.shake?1:0};
 // Every fixture starts its cache-aging serial at the same value in both
 // source versions, independently of incidental setup render counts.
 journeyRenderSerial=1000;g.globalAlpha=1;
 window.__stutterTreeAlphaCalls=0;window.__stutterTreeAlphaMin=1;window.__stutterTreeAlphaMax=0;
 ${scene.alpha?`
 // render() legitimately resets the context alpha before the world queue.
 // Exercise real per-tree translucency instead of an ineffective outer alpha.
 treeDistanceAlpha=function(...args){
  const alpha=window.__stutterOriginalTreeAlpha(...args)*${scene.alpha};
  window.__stutterTreeAlphaCalls++;
  window.__stutterTreeAlphaMin=Math.min(window.__stutterTreeAlphaMin,alpha);
  window.__stutterTreeAlphaMax=Math.max(window.__stutterTreeAlphaMax,alpha);
  return alpha;
 };
 `:``}
 `;}
const stateCode=`JSON.stringify({dist,roadScroll,curvedGroundDistance,perfNow,mode,paused,
 camera:calculateJourneyCameraPose(),phase:journey.phase,turnT:journey.turnT,
 player:{x:player.x,lane:player.lane,alive:player.alive,currentHealthUnits:player.currentHealthUnits},
 route:{seed:journeyRoute.seed,from:journeyRoute.from,next:journeyRoute.next,activeEdge:journeyRoute.activeEdge,status:journeyRoute.status,selection:journeyRoute.selection,chosen:journeyRoute.chosen},
 obstacles:obstacles.map(o=>({kind:o.kind,z:o.z,prevZ:o.prevZ,lanes:o.lanes,roadTheme:o.roadTheme})),
 pickups:pickups.map(o=>({kind:o.kind,z:o.z,lane:o.lane})),
 endTrees:(journey.endTrees||[]).map(t=>({x:t.x,z:t.z,v:t.v,endCap:t.endCap})),
 preview:journey.sunlitPreview?{obstacles:journey.sunlitPreview.obstacles.map(o=>({at:o.at,x:o.x,z:o.z,lane:o.lane,kind:o.entity.kind})),
 pickups:journey.sunlitPreview.pickups.map(o=>({at:o.at,x:o.x,z:o.z}))}:null})`;
function compare(before,after,file,{allowNativeResampling=false,geometryEvidence=null}={}){
 const a=PNG.sync.read(before),b=PNG.sync.read(after);
 assert.equal(a.width,b.width,'Screenshot widths differ');assert.equal(a.height,b.height,'Screenshot heights differ');
 const diff=file?new PNG({width:a.width,height:a.height}):null;
 const interiorMask=file?new PNG({width:a.width,height:a.height}):null;
 const flat=(image,x,y)=>{
  if(x<2||y<2||x>=image.width-2||y>=image.height-2)return false;
  let minR=255,minG=255,minB=255,maxR=0,maxG=0,maxB=0;
  for(let yy=y-2;yy<=y+2;yy++)for(let xx=x-2;xx<=x+2;xx++){
   const index=(yy*image.width+xx)*4,r=image.data[index],g=image.data[index+1],b=image.data[index+2];
   minR=Math.min(minR,r);maxR=Math.max(maxR,r);minG=Math.min(minG,g);maxG=Math.max(maxG,g);minB=Math.min(minB,b);maxB=Math.max(maxB,b);
   if(maxR-minR>6||maxG-minG>6||maxB-minB>6)return false;
  }
  return true;
 };
 const interiors={radius:2,maxChannelRange:6,majorThreshold:24,
  beforeFlatMajorPixels:0,afterFlatMajorPixels:0,bothFlatMajorPixels:0,eitherFlatMajorPixels:0,
  neitherFlatMajorPixels:0,beforeFlatOnlyMajorPixels:0,afterFlatOnlyMajorPixels:0,
  bothFlatChangedPixels:0,maxBothFlatDelta:0,maxEitherFlatDelta:0,majorBothFlatSamples:[]};
 let changedPixels=0,majorPixels=0,maxDiff=0,totalDelta=0,minX=a.width,minY=a.height,maxX=-1,maxY=-1;
 for(let i=0;i<a.data.length;i+=4){
  let delta=0;for(let k=0;k<4;k++)delta=Math.max(delta,Math.abs(a.data[i+k]-b.data[i+k]));
  maxDiff=Math.max(maxDiff,delta);totalDelta+=delta;
  const pixel=i/4,x=pixel%a.width,y=Math.floor(pixel/a.width);
  let beforeFlat=false,afterFlat=false;
  if(delta){
   changedPixels++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
   beforeFlat=flat(a,x,y);afterFlat=flat(b,x,y);
   if(beforeFlat||afterFlat)interiors.maxEitherFlatDelta=Math.max(interiors.maxEitherFlatDelta,delta);
   if(beforeFlat&&afterFlat){interiors.bothFlatChangedPixels++;interiors.maxBothFlatDelta=Math.max(interiors.maxBothFlatDelta,delta);}
   if(delta>24){
    if(beforeFlat)interiors.beforeFlatMajorPixels++;
    if(afterFlat)interiors.afterFlatMajorPixels++;
    if(beforeFlat||afterFlat)interiors.eitherFlatMajorPixels++;
    if(beforeFlat&&afterFlat){
     interiors.bothFlatMajorPixels++;
     if(interiors.majorBothFlatSamples.length<16)interiors.majorBothFlatSamples.push({x,y,delta,before:[...a.data.subarray(i,i+3)],after:[...b.data.subarray(i,i+3)]});
    }else if(beforeFlat)interiors.beforeFlatOnlyMajorPixels++;
    else if(afterFlat)interiors.afterFlatOnlyMajorPixels++;
    else interiors.neitherFlatMajorPixels++;
   }
  }
  if(delta>24)majorPixels++;
  if(diff){
   if(delta){diff.data[i]=255;diff.data[i+1]=Math.min(255,delta*4);diff.data[i+2]=0;}
   else{for(let k=0;k<3;k++)diff.data[i+k]=Math.round(a.data[i+k]*.22);}
   diff.data[i+3]=255;
   const color=delta>24?(beforeFlat&&afterFlat?[255,0,255]:beforeFlat?[0,255,255]:afterFlat?[255,128,0]:[190,190,0]):null;
   for(let k=0;k<3;k++)interiorMask.data[i+k]=color?color[k]:Math.round(a.data[i+k]*.15);
   interiorMask.data[i+3]=255;
  }
 }
 if(file){fs.writeFileSync(file,PNG.sync.write(diff));fs.writeFileSync(file.replace(/\.png$/,'-interiors.png'),PNG.sync.write(interiorMask));}
 const pixels=a.width*a.height;
 const rawStrictPassed=majorPixels/pixels<=.0005&&totalDelta/pixels<=.1;
 const resamplingChecks={nativeTreeGeometryExactlyEqual:geometryEvidence?.identical===true,
  noMajorChangesInsideEitherFlatRegion:interiors.eitherFlatMajorPixels===0,
  flatRegionMaxDeltaWithin20:interiors.maxEitherFlatDelta<=20,
  majorFractionWithinPoint002:majorPixels/pixels<=.002,meanDeltaWithinPoint3:totalDelta/pixels<=.3};
 const resamplingEligible=Object.values(resamplingChecks).every(Boolean);
 const resamplingReviewed=allowNativeResampling&&!rawStrictPassed&&resamplingEligible;
 return {width:a.width,height:a.height,pixels,changedPixels,changedFraction:changedPixels/pixels,
  majorPixels,majorThreshold:24,majorFraction:majorPixels/pixels,maxDiff,meanDelta:totalDelta/pixels,
  changedBounds:changedPixels?{minX,minY,maxX,maxY}:null,interiors,
  interiorMaskLegend:{magenta:'Major change, both 5x5 neighborhoods flat',cyan:'Major change, only before flat',orange:'Major change, only after flat',yellow:'Major change on edges in both versions'},
  // Strict acceptance remains the default. The explicit review flag is ONLY
  // for an otherwise-identical native tree sampled from a larger cached tier.
  rawStrictPassed,resamplingReviewed,resamplingReview:{requested:allowNativeResampling,
   status:!allowNativeResampling?'not-requested':rawStrictPassed?'strict-pass':resamplingReviewed?'accepted-native-resampling':'rejected',
   checks:resamplingChecks},passed:rawStrictPassed||resamplingReviewed};
}
function stateDifferences(a,b,at='state'){
 if(a===b)return [];
 if(a===null||b===null||typeof a!=='object'||typeof b!=='object')return [{path:at,before:a,after:b}];
 return [...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(key=>stateDifferences(a[key],b[key],at+'.'+key));
}
async function main(){
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 const results=[],errors=[],failures=[],geometryEvidence=nativeTreeGeometryEvidence();
 const allowNativeResampling=args.includes('--allow-native-resampling');
 if(allowNativeResampling&&!geometryEvidence.identical)failures.push('Native resampling review requires exactly identical authored tree geometry and colors');
 try{
  for(const [device,width,height,dpr] of devices){
   const captures={before:new Map(),after:new Map()};
   for(const version of ['before','after']){
    const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr}),page=await context.newPage();
    const routed=Object.fromEntries(names.map(name=>[name,0]));
    await page.route('**/*',route=>{
     const url=new URL(route.request().url());url.search='';url.hash='';const name=sourceURL.get(url.href);
     if(!name)return route.continue();routed[name]++;
     return route.fulfill({contentType:name.endsWith('.html')?'text/html; charset=utf-8':'text/javascript; charset=utf-8',body:sources[version].get(name)});
    });
    page.on('pageerror',e=>errors.push({device,version,message:e.message}));
    await page.addInitScript(()=>{
     window.requestAnimationFrame=()=>0;
     let seed=731;Math.random=()=>((seed=Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;
    });
    await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
    await page.waitForFunction(()=>!!window.KRSunlitForest);
    for(const name of names)assert(routed[name]>0,'Source route was not used: '+version+' '+name);
    const run=code=>page.evaluate(code=>(0,eval)(code),code);
    for(const scene of scenes){
     await run(`(()=>{${setup(scene)}})()`);
     const before=await run(stateCode);
     const details=await run(`(()=>{
      let maxCacheBytes=0,maxOccludedTrees=0,minOccludedTrees=Infinity,maxCoveredTreePlanes=0;
      for(let i=0;i<80;i++){
       render();const report=KRSunlitForest.report();maxCacheBytes=Math.max(maxCacheBytes,report.cacheBytes);
       maxOccludedTrees=Math.max(maxOccludedTrees,report.occludedTrees||0);minOccludedTrees=Math.min(minOccludedTrees,report.occludedTrees||0);
       maxCoveredTreePlanes=Math.max(maxCoveredTreePlanes,report.coveredTreePlanes||0);
      }
      const world=KRSunlitForest.inspect(),report=KRSunlitForest.report();
      return {report,maxCacheBytes,occlusion:{reported:report.occludedTrees??null,min:minOccludedTrees,max:maxOccludedTrees,
       coveredTreePlanes:report.coveredTreePlanes??null,maxCoveredTreePlanes,
       queuedTreeDraws:DRAW_QUEUE.filter(d=>d.draw===drawJourneyTree||d.draw?.name==='drawScenery'&&d.ref?.id<3).length},
       renderSerial:journeyRenderSerial,worldShake:{x:worldFxShakeX,y:worldFxShakeY},contextAlpha:g.globalAlpha,
       treeAlpha:{calls:window.__stutterTreeAlphaCalls,min:window.__stutterTreeAlphaMin,max:window.__stutterTreeAlphaMax},
       treeRecords:world.filter(o=>o.id<3).length,endTreeRecords:(journey.endTrees||[]).length,world};
     })()`);
     const after=await run(stateCode),state=JSON.parse(after);
     const gameplayPure=before===after;if(!gameplayPure)failures.push(device+' '+version+' '+scene.name+': render changed gameplay state');
     if(details.maxCacheBytes>budget)failures.push(device+' '+version+' '+scene.name+': cache budget exceeded');
     if((scene.shake||scene.alpha)&&version==='after'&&(details.occlusion.max||details.occlusion.maxCoveredTreePlanes))
      failures.push(device+' '+scene.name+': shake or translucent trees incorrectly contributed occlusion');
     if(scene.shake&&!details.worldShake.x&&!details.worldShake.y)failures.push(device+' '+scene.name+': shake fixture inactive');
     if(scene.alpha&&(!details.treeAlpha.calls||details.treeAlpha.max>scene.alpha))failures.push(device+' '+scene.name+': translucent-tree fixture inactive');
     const filename=device+'-'+scene.name+'-'+version+'.png';
     const image=await page.screenshot({path:path.join(out,filename)});
     await run('treeDistanceAlpha=window.__stutterOriginalTreeAlpha;');
     captures[version].set(scene.name,{image,state,gameplayPure,details,filename});
    }
    await context.close();
   }
   for(const scene of scenes){
    const a=captures.before.get(scene.name),b=captures.after.get(scene.name);
    let identicalState=true,identicalWorld=true;
    try{assert.deepEqual(a.state,b.state);}catch{identicalState=false;failures.push(device+' '+scene.name+': baseline/live camera or gameplay state differs');}
    try{assert.deepEqual(a.details.world,b.details.world);}catch{identicalWorld=false;failures.push(device+' '+scene.name+': tree/scenery world records differ');}
    if(a.details.renderSerial!==b.details.renderSerial)failures.push(device+' '+scene.name+': render serials differ');
    const diffName=device+'-'+scene.name+'-diff.png',pixels=compare(a.image,b.image,path.join(out,diffName),{allowNativeResampling,geometryEvidence});
    if(!pixels.passed)failures.push(device+' '+scene.name+': visible pixel difference exceeds roundoff tolerance');
    const describe=capture=>({state:capture.state,gameplayPure:capture.gameplayPure,report:capture.details.report,
     maxCacheBytes:capture.details.maxCacheBytes,occlusion:capture.details.occlusion,treeRecords:capture.details.treeRecords,
     endTreeRecords:capture.details.endTreeRecords,renderSerial:capture.details.renderSerial,
     worldShake:capture.details.worldShake,contextAlpha:capture.details.contextAlpha,treeAlpha:capture.details.treeAlpha,
     worldHash:hash(JSON.stringify(capture.details.world))});
    const result={device,scene:scene.name,identicalState,identicalWorld,pixels,stateDifferences:stateDifferences(a.state,b.state),
     screenshots:{before:a.filename,after:b.filename,diff:diffName,interiors:diffName.replace(/\.png$/,'-interiors.png')},before:describe(a),after:describe(b)};
    results.push(result);
    console.log(JSON.stringify({device,scene:scene.name,identicalState,identicalWorld,pixels,
     occludedBefore:a.details.occlusion,occludedAfter:b.details.occlusion,
     cacheBefore:a.details.maxCacheBytes,cacheAfter:b.details.maxCacheBytes}));
   }
  }
 }finally{
  await browser.close();
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({label,sourceHashes,budgetBytes:budget,
   frozen:true,physicalPhone:false,aestheticApproval:false,allowNativeResampling,geometryEvidence,errors,failures,results},null,2));
  console.log('Report: '+path.join(out,'report.json'));
 }
 assert.deepEqual(errors,[],'Browser runtime errors');assert.deepEqual(failures,[],'Visual or state regressions; inspect report and screenshot pairs');
 console.log('STUTTER_VISUAL_OK '+results.length+' frozen source-matched comparisons');
}
module.exports={compare,nativeTreeGeometryEvidence};
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
