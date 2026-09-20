const assert=require('node:assert/strict');
const {run}=require('./journey-render-audit.cjs');
const report=JSON.parse(run(`JSON.stringify((()=>{
 SFX.toggle();startJourneyWithSeed(0);godMode=true;
 for(const node of journeyRoute.nodes)if(journeyNode(node.id)!==node)throw Error('Node lookup changed identity');
 // Stress more exact tree variants than the pixel budget can hold. Once full,
 // the current frame's residents must not churn/reallocate on every traversal.
 let built=0;for(let frame=0;frame<100;frame++){
  journeyRenderSerial++;journeyTreeSpriteBuilds=0;
  for(let i=0;i<220;i++)drawTree(240,320,.08,(i+.5)/220,i%2?1:0,0);
  if(journeyTreeSpriteBuilds>2||journeyTreeSpritePixels>6*1024*1024)throw Error('Cache budget exceeded');
  built+=journeyTreeSpriteBuilds;
 }
 let lateBuilds=0;for(let frame=0;frame<8;frame++){
  journeyRenderSerial++;journeyTreeSpriteBuilds=0;
  for(let i=0;i<220;i++)drawTree(240,320,.08,(i+.5)/220,i%2?1:0,0);
  lateBuilds+=journeyTreeSpriteBuilds;
 }
 if(lateBuilds)throw Error('Overfull cache is churning');
 // Scene state may change without perfNow advancing (pause/reseed/test probes).
 const a=journeyCameraPoint(3,180);dist+=7;render();const b=journeyCameraPoint(3,180);
 if(a.depth===b.depth||journeyRenderFrame!==null)throw Error('Frame cache leaked');
 const root=new ObstacleEntity('root',20,['duck',null,null],'L');
 const item={entity:root,lane:0,x:-JOURNEY_LANE_WORLD,z:dist+20};
 const surface=journeyObstacleSurface(item),key=item.surfaceKey;perfNow+=.2;
 if(journeyObstacleSurface(item)!==surface||item.surfaceKey!==key)throw Error('Static root cache rebuilt');
 const water={entity:new ObstacleEntity('pond',20,['jump',null,null],'L'),lane:0,x:-JOURNEY_LANE_WORLD,z:dist+20};
 journeyObstacleSurface(water);const waterKey=water.surfaceKey;perfNow+=.2;journeyObstacleSurface(water);
 if(water.surfaceKey===waterKey)throw Error('Water animation frozen');
 settingsTap({x:240,y:VH/2-244});if(!journeyPerf.enabled)throw Error('Touch performance toggle failed');
 settingsTap({x:240,y:VH/2-244});if(journeyPerf.enabled)throw Error('Touch performance toggle failed');
 return {indexedNodes:journeyRoute.nodes.length,cacheMiB:journeyTreeSpritePixels*4/1048576,built,lateBuilds,maxBuildsPerFrame:2,frameCacheIsolated:true,animatedWater:true};
})())`,60000));
assert.equal(report.lateBuilds,0);console.log('JOURNEY_EFFICIENCY_OK',JSON.stringify(report));
