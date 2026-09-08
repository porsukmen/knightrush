const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {run,canvas,out,shot}=require('./journey-render-audit.cjs');
run('startForestCorridor()');
run(`
  const crownCounts=[];
  for(const variant of [.1,.45,.85]){
    const art=forestGiantArt(variant,-1),crown=art[1].levels[0].canvas;
    const pixels=crown.getContext('2d').getImageData(0,0,crown.width,crown.height).data;
    let opaque=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>128)opaque++;
    if(opaque/(crown.width*crown.height)>.6)throw new Error('Crown became a solid blanket');
    crownCounts.push(opaque);
    const bark=art[0].levels[0].canvas,bp=bark.getContext('2d').getImageData(0,0,bark.width,bark.height).data;
    let warm=0,colored=0;for(let i=0;i<bp.length;i+=4)if(bp[i+3]>128){colored++;if(bp[i]>bp[i+1])warm++;}
    if(warm/colored<.75)throw new Error('Bark lost its warm wood palette');
    if(forestGiantArt(variant,1)===art)throw new Error('Left/right crown orientation shares wrong cache');
  }
  if(new Set(crownCounts).size!==3)throw new Error('Crown silhouettes are not distinct');
`);
run(`
  const firstChunk=forestCorridor.chunks.get(1),firstTree=firstChunk.trees[0];
  const firstPosition=JSON.stringify(firstTree),initialCount=forestCorridor.chunks.size;
  if(!Object.isFrozen(firstTree))throw new Error('Mutable world record');
  const firstDetails=JSON.stringify(firstChunk.details);
  if(!firstChunk.details.length||firstChunk.details.some(d=>!Object.isFrozen(d)))throw new Error('Missing fixed ground details');
  const allDetails=[...forestCorridor.chunks.values()].flatMap(c=>c.details),extent=d=>d.radius*(d.kind==='leaves'?1.6:1.35);
  for(let i=0;i<allDetails.length;i++){
    const a=allDetails[i];
    if(Math.abs(a.z-260)<3&&a.x<-1.8)throw new Error('Detail overlaps obstacle reserve');
    for(let j=i+1;j<allDetails.length;j++){
      const b=allDetails[j];
      if(Math.abs(a.x-b.x)<extent(a)+extent(b)+.22&&Math.abs(a.z-b.z)<(extent(a)+extent(b))*1.7+.3)
        throw new Error('Ground detail footprints overlap');
    }
  }
  for(const scale of [.04,.089,.091,.249,.251,.399,.401,.51,1.2])for(const device of [1,1.5,2,3]){
    const levels=forestGiantArt(.1,-1)[0].levels,footprint=scale*device,
      selected=levels.reduce((best,l)=>l.factor*footprint<=1?l:best,levels[0]);
    if(selected.factor>1&&selected.factor*footprint>1)throw new Error('Coarse tree image is being enlarged');
  }
  for(let i=0;i<440;i++)updateForestCorridor(1/60);
  if(forestCorridor.chunks.get(1)!==firstChunk||JSON.stringify(firstTree)!==firstPosition)
    throw new Error('Chunk advance replaced or moved an existing tree');
  if(forestCorridor.nearestNew<FOREST_CORRIDOR.ahead-1)throw new Error('Preparation entered visible distance');
  if(784*525/16/(forestCorridor.nearestNew+14)>=.5)throw new Error('New tree exceeds subpixel size');
  if(tryJourneyCornerTurn())throw new Error('Test unexpectedly turns');
  while(!forestCorridor.finished)updateForestCorridor(1/60);
  if(!forestCorridor.retired||forestCorridor.chunks.size>initialCount+2)throw new Error('Chunks are not bounded');
  const finalDistance=dist;updateForestCorridor(2);
  if(dist!==finalDistance)throw new Error('Test does not stop');
  startForestCorridor();
  if(JSON.stringify(forestCorridor.chunks.get(1).trees[0])!==firstPosition)throw new Error('Replay changes layout');
  if(JSON.stringify(forestCorridor.chunks.get(1).details)!==firstDetails)throw new Error('Replay changes floor details');
`);
// The stone exists and draws before crossing the former 230-unit hard cutoff.
run(`
  forestWorldFrame={camera:forestCamera(),faces:[],front:[],colors:new Map(),faceCount:0};
  forestObstacle(forestCorridor.stone,[0,0,260]);
  if(!forestWorldFrame.faces.length)throw new Error('Distant stone still culled');
  for(const z of [150,230,260,1000]){
    const p=forestProjectCamera({x:0,y:0,z:14+z}),horizon=HORIZON_Y-(GROUND_Y-HORIZON_Y)*14/60;
    const recovered=(GROUND_Y-horizon)*14/(p.y-horizon)-14;
    if(Math.abs(recovered-z)>.0001)throw new Error('Contact plane mismatch');
  }
`);
shot('corridor-start','');
run(`
  if(cvs.style.imageRendering!=='auto')throw new Error('Test still forces CSS pixelation');
  if(forestFloorSurface)throw new Error('Block ground still uses the legacy pixel buffer');
`);
if(process.argv.includes('--giant'))shot('giant-tree-start','');
run('dist=230;roadScroll=dist;prepareForestCorridor()');shot('corridor-stone-approach','');
run('dist=252;roadScroll=dist;prepareForestCorridor()');shot('corridor-stone-near','');
if(process.argv.includes('--giant'))shot('giant-tree-near','');
const samples=[];
for(let i=0;i<35;i++){const t=performance.now();run('render()');if(i>=5)samples.push(performance.now()-t);}
samples.sort((a,b)=>a-b);
const stats=run('({chunks:forestCorridor.chunks.size,trees:[...forestCorridor.chunks.values()].reduce((n,c)=>n+c.trees.length,0),draws:forestWorldFrame.faceCount})');
const metrics={...stats,medianMs:samples[15],p95Ms:samples[28]};
// Compare sequential 60/120 Hz travel at the same destination, world and time.
run('startForestCorridor();for(let i=0;i<600;i++)updateForestCorridor(1/60);perfNow=10;render()');
const a=Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data);
run('startForestCorridor();for(let i=0;i<1200;i++)updateForestCorridor(1/120);perfNow=10;render()');
const b=Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data);
let changed=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])changed++;
if(changed>100)throw new Error('Frame-rate-dependent world: '+changed+' channels');
// Unresolved floor marks must not sparkle in the distant path center.
run('startForestCorridor();dist=80;forestWorldFrame={camera:forestCamera()};forestGround()');
const distantFloor=canvas.getContext('2d').getImageData(239,208,2,5).data;
run('dist+=.3;forestWorldFrame={camera:forestCamera()};forestGround()');
const nextDistantFloor=canvas.getContext('2d').getImageData(239,208,2,5).data;
for(let i=0;i<distantFloor.length;i++)if(distantFloor[i]!==nextDistantFloor[i])throw new Error('Distant ground flicker');
if(process.argv.includes('--video')){
  run('startForestCorridor()');const frames=[];
  // Entire 21.3-second corridor at 30fps; no skipped simulation travel.
  for(let i=0;i<641;i++){
    run('updateForestCorridor(1/30);perfNow+=1/30;render()');frames.push(canvas.toBuffer('image/png'));
  }
  const file=path.join(out,process.argv.includes('--giant')?'forest-warm-tree-preview.mp4':'forest-corridor-phase12.mp4');
  const result=spawnSync('ffmpeg',['-y','-hide_banner','-loglevel','error','-framerate','30','-f','image2pipe','-i','pipe:0',
    '-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',file],
    {input:Buffer.concat(frames),maxBuffer:4*1024*1024,windowsHide:true});
  if(result.status!==0)throw new Error(String(result.stderr));console.log(file);
}
run('resetRun();if(forestCorridor)throw new Error("Test leaked into normal run")');
run(`
  const originalAudioInit=SFX.init;SFX.init=()=>{};
  setMode('menu');handleAction('tap',{x:240,y:646});SFX.init=originalAudioInit;
  if(!forestCorridor||mode!=='run')throw new Error('Menu test entry failed');
  for(let i=0;i<180;i++)update(1/60);
  if(Math.abs(dist-54)>.001||obstacles.length||pickups.length||roadsideScenery.length)
    throw new Error('Normal spawner leaked into corridor update');
  if(journey.phase!=='main'||!player.alive)throw new Error('Test triggered combat or turn');
  resetRun();pendingJourneyPrototype=false;startRun(charSel);
  if(forestCorridor||runJourneyPrototype)throw new Error('Normal PLAY inherited the test');
`);
fs.writeFileSync(path.join(out,'forest-corridor-metrics.json'),JSON.stringify(metrics,null,2));
console.log('FOREST_CORRIDOR_OK '+JSON.stringify(metrics));
