const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {run,canvas}=require('./journey-render-audit.cjs');
const out=path.resolve('output/journey-crimson');fs.mkdirSync(out,{recursive:true});
run(`SFX.toggle();
 function crimsonFixture(){
  startJourneyWithSeed(0);godMode=true;
  const node=journeyRoute.nodes.find(n=>n.out.some(e=>e.preview.theme==='bloodwood'));
  const edge=node.out.find(e=>e.preview.theme==='bloodwood');
  globalThis.bloodSlot=edge.events.find(e=>e.definition==='elite_finale');
  journeyRoute.from=node.id;journeyRoute.next=edge.to;journeyRoute.activeEdge=edge.id;
  dist=bloodSlot.at-110;roadScroll=dist;runDistance=dist;armJourneyNode();
  roadsideScenery=[];obstacles=[];pickups=[];nextTreeAt=dist-4;nextSpawnAt=Infinity;
  spawnLoopEntities();player.x=1;player.lane=1;return edge;
 }
 crimsonFixture();`);
const shot=name=>{run('render()');fs.writeFileSync(path.join(out,name+'.png'),canvas.toBuffer('image/png'));};
shot('01-forest');
const report=JSON.parse(run(`JSON.stringify((()=>{
 let collisions=0,spawns=0;
 const damage=damagePlayer,relic=hasRelic,pick=pickObstacleSpawnPattern;
 const shapes=[['boulder',['jump','jump','jump']],['root',['duck','jump',null]],['pond',[null,'jump',null]]];
 try{
  damagePlayer=()=>globalThis.bloodHits++;hasRelic=()=>false;
  for(const [kind,req] of shapes){
   pickObstacleSpawnPattern=()=>({typeId:kind,create:()=>({req:req.slice(),variant:'L'})});
   obstacles=[];spawnObstacle(1);const spawned=obstacles[0];
   if(spawned.roadTheme!=='bloodwood'||kind==='root'&&spawned.treeV===undefined)throw Error('Wrong Bloodwood producer / missing mother tree');
   spawns++;
   for(let lane=0;lane<3;lane++)for(const action of ['none','jump','duck']){
    const o=new ObstacleEntity(kind,.1,req.slice(),'L');o.prevZ=2;o.roadTheme='bloodwood';obstacles=[o];
    player.x=lane;player.jumpT=action==='jump'?jumpDur()*.5:-1;player.duckT=action==='duck'?.1:-1;
    globalThis.bloodHits=0;updateRunCollisions();
    if(bloodHits!==(req[lane]&&action!==req[lane]?1:0))throw Error('Collision '+kind+'/'+lane+'/'+action);
    collisions++;
   }
  }
 }finally{damagePlayer=damage;hasRelic=relic;pickObstacleSpawnPattern=pick;player.jumpT=-1;player.duckT=-1;}
 crimsonFixture();return {collisions,spawns};
})())`));
assert.equal(report.collisions,27);
// All seven single/double/triple lane layouts keep their own collision masks.
assert.equal(run(`(()=>{let checked=0;const original=pickObstacleSpawnPattern;
 try{for(let mask=1;mask<8;mask++){
  const req=[0,1,2].map(l=>mask&(1<<l)?'jump':null);
  pickObstacleSpawnPattern=()=>({typeId:'boulder',create:()=>({req:req.slice(),variant:'L'})});
  obstacles=[];spawnObstacle(1);const o=obstacles[0];
  if(o.roadTheme!=='bloodwood'||JSON.stringify(o.req)!==JSON.stringify(req))throw Error('Bone pile lane mask '+mask);
  drawObstacle(o,proj(o.z));checked++;
 }}finally{pickObstacleSpawnPattern=original;obstacles=[];}return checked;
})()`),7);
for(const [kind,req] of [['boulder',['jump','jump','jump']],['root',['duck','jump',null]],['pond',['jump',null,'jump']]]){
 run(`obstacles=[];globalThis.bo=new ObstacleEntity('${kind}',8,${JSON.stringify(req)},'L');bo.seed=731;bo.roadTheme='bloodwood';obstacles=[bo];`);
 shot('02-'+kind);
 assert(run(`(()=>{const surface=journeyObstacleSurface({entity:bo});return bo.kind==='root'?surface.height>1000:surface.height<400;})()`));
}
run('crimsonFixture();dist=bloodSlot.at-45;roadScroll=dist;roadsideScenery=[];nextTreeAt=dist-4;spawnLoopEntities();');
shot('03-lair');
run(`dist=bloodSlot.at-.05;roadScroll=dist;obstacles=[];pickups=[];
 for(let i=0;i<10&&mode==='run';i++)update(1/60);`);
assert.equal(run('mode'),'miniboss');assert.equal(run('activeMinibossDefinition().id'),'wolf');
assert(run('minibossFight.crimsonLair'));
const frozen=run('[dist,roadScroll]');run('for(let i=0;i<90;i++)update(1/60);');
assert.deepEqual(run('[dist,roadScroll]'),frozen);assert.equal(run('minibossFight.z'),10);
shot('04-fight');
run('for(let i=0,n=countersNeeded();i<n;i++)minibossCounterHit();for(let i=0;i<125;i++)update(1/60);');
assert.equal(run('mode'),'run');assert.equal(run('journeyRoute.eventRecords[bloodSlot.id].status'),'completed');
assert.equal(run('minibossFight'),null);
run('crimsonFixture();startJourneyRoadEvent(bloodSlot);minibossFight.state="flee";minibossFight.stateT=0;for(let i=0;i<80;i++)update(1/60);');
assert.equal(run('journeyRoute.eventRecords[bloodSlot.id].status'),'escaped');assert.equal(run('mode'),'run');
run('crimsonFixture();startJourneyRoadEvent(bloodSlot);startJourneyWithSeed(1);');
assert.equal(run('journeyRoadEventSession'),null);assert.equal(run('minibossFight'),null);
run('crimsonFixture();startJourneyRoadEvent(bloodSlot);setMode("dying");update(1/60);');
assert.equal(run('journeyRoadEventSession'),null);assert.equal(run('minibossFight'),null);
assert.equal(run('journeyRoute.eventRecords[bloodSlot.id].status'),'interrupted');
console.log(JSON.stringify({...report,laneMasks:7,stationaryCombat:true,win:true,escape:true,restart:true,interruption:true,screenshots:out},null,2));
