/* Bounded, deterministic art/motion preview. No random spawning, collisions,
   score changes or production route generation are represented by this clip. */
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {canvas,shot,out,run}=require('./journey-render-audit.cjs');
run(`
  debugRun=false;godMode=false;startRun(0);runJourneyPrototype=true;
  dist=30;roadScroll=dist;journey=createJourneyState();
  obstacles=[];pickups=[];roadsideScenery=[];journey.sideTrees=[];
  const previewTrees=[];
  for(let i=0,d=18;d<1400;i++,d+=9+i*.12){
    for(const side of [-1,1]){
      const off=side*(2.5+sRnd(i*97+side)*.65),v=sRnd(i*23+side+5),x=off*4.8;
      if(!journeyRoadContainsWorldPoint(x,d))previewTrees.push({d,off,v});
    }
  }
  for(let i=0,d=6;d<1400;i++,d+=9+i*.12){
    for(const side of [-1,1])journey.sideTrees.push({d,off:side*(2.6+sRnd(i*29+side)*.6),v:sRnd(i*61+side+9),gnd:false});
  }
  journey.nextSideTree=1500;
  const previewStone=new ObstacleEntity('boulder',100,['jump',null,null],'L');
  previewStone.seed=731;obstacles=[previewStone];
  function previewDistance(d){
    dist=d;roadScroll=d;journey.forkZ=JOURNEY_FORK_DISTANCE-d;
    roadsideScenery=previewTrees.map(t=>new RoadsideSceneryEntity(t.d-d,t.off,t.v));
    previewStone.z=130-d;obstacles=[previewStone];
    perfNow=d/18;player.lane=1;player.x=1;
  }
  previewDistance(30);
`);
shot('preview-01-distance','previewDistance(30)');
shot('preview-02-approach','previewDistance(103)');
shot('preview-03-stone-near','previewDistance(122)');
run(`
  previewDistance(153);player.lane=0;player.x=0;tryJourneyCornerTurn();
  updateJourneyPrototype(.31,0);
`);
shot('preview-04-turn','');
// Exact repeatability, contact and alpha checks; animation is only perspective.
run(`
  const savedDrawTree=drawTree,previewAlphas=[];
  drawTree=(...args)=>{previewAlphas.push(worldA);return savedDrawTree(...args);};
  render();drawTree=savedDrawTree;
  if(previewAlphas.some(a=>a!==1))throw new Error('Tree arrival still fades');
  forestWorldFrame={camera:forestCamera(),faces:[],front:[],colors:new Map(),faceCount:0};
  for(const z of [8,30,60,100,150,600,1200]){
    const p=forestProjectCamera({x:0,y:0,z:14+z}),horizon=HORIZON_Y-(GROUND_Y-HORIZON_Y)*14/60;
    const recovered=(GROUND_Y-horizon)*14/(p.y-horizon)-14;
    if(Math.abs(recovered-z)>.0001)throw new Error('Floor and actor disagree at '+z);
  }
  journey.turnT=1;player.x=1;render();
`);
const end=Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data);
run('updateJourneyPrototype(0,0);render()');
if(!end.equals(Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data)))
  throw new Error('Preview world changes at turn handoff');
const timings={};
for(const [name,setup] of [['straight',"journey=createJourneyState();previewDistance(103)"],
  ['turn',"journey=createJourneyState();previewDistance(153);player.lane=0;player.x=0;tryJourneyCornerTurn();updateJourneyPrototype(.31,0)"]]){
  run(setup+';render()');const samples=[];
  for(let i=0;i<20;i++){const start=performance.now();run('render()');samples.push(performance.now()-start);}
  samples.sort((a,b)=>a-b);timings[name]={median:samples[10],p95:samples[18]};
}
// Encode actual 60 Hz sampled motion, including the complete single turn.
if(process.argv.includes('--video')){
  run('journey=createJourneyState();previewDistance(30)');
  // Reuse the same prepared side trees, not a new RNG-generated set.
  run('journey.nextSideTree=1500;journey.sideTrees=[];for(let i=0,d=6;d<1400;i++,d+=9+i*.12)for(const side of [-1,1])journey.sideTrees.push({d,off:side*(2.6+sRnd(i*29+side)*.6),v:sRnd(i*61+side+9),gnd:false});');
  const frames=[];let turned=false;
  for(let f=0;f<480;f++){
    const d=30+f*18/60;
    if(d<=153)run('previewDistance('+d+')');
    else if(!turned){run('previewDistance(153);player.lane=0;player.x=0;tryJourneyCornerTurn()');turned=true;}
    if(turned)run("if(journey.phase!=='turning'){dist+=18/60;for(const t of roadsideScenery)t.z-=18/60;}updateJourneyPrototype(1/60,18/60);perfNow+=1/60");
    run('render()');frames.push(canvas.toBuffer('image/png'));
  }
  const target=path.join(out,'forest-perspective-preview.mp4');
  const encoded=spawnSync('ffmpeg',['-y','-hide_banner','-loglevel','error','-f','image2pipe','-framerate','60','-i','pipe:0',
    '-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',target],
    {input:Buffer.concat(frames),maxBuffer:8*1024*1024,windowsHide:true});
  if(encoded.status!==0)throw new Error('Video encode failed: '+encoded.stderr);
  console.log('PREVIEW_VIDEO '+target);
}
fs.writeFileSync(path.join(out,'forest-preview-metrics.json'),JSON.stringify(timings,null,2));
console.log('FOREST_PREVIEW_OK '+JSON.stringify(timings));
