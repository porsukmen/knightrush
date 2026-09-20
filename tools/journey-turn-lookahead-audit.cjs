const assert=require('node:assert/strict');
const {run}=require('./journey-render-audit.cjs');
const report=JSON.parse(run(`JSON.stringify((()=>{
 SFX.toggle();journeyRoadEventHandlers.delete('disco_finale');journeyRoadEventHandlers.delete('elite_finale');
 const originalSpeed=speed;let cases=0,newTreesAtHandoff=0;
 try{
  for(const curved of [false,true])for(const direction of [-1,1])
  for(const late of [0,17.9])for(const pace of [22,66]){
   speed=()=>22;let node;
   for(const seed of [647486904,0,1,2]){
    startJourneyWithSeed(seed);node=journeyRoute.nodes.find(n=>n.out.some(e=>e.direction===direction));
    if(node)break;
   }
   if(!node)throw Error('No side exit');
   godMode=true;setCurvedWorldTrial(curved);speed=()=>pace;
   const parent=journeyRoute.nodes.find(n=>n.out.some(e=>e.to===node.id));
   journeyRoute.from=parent.id;journeyRoute.next=node.id;
   journeyRoute.activeEdge=parent.out.find(e=>e.to===node.id).id;
   journeyRoute.status='travel';journeyRoute.pendingArm=false;
   dist=node.at+late;roadScroll=dist;curvedGroundDistance=dist;runDistance=dist;armJourneyNode();
   roadsideScenery=[];obstacles=[];pickups=[];nextTreeAt=dist+SPAWN_FAR;nextSpawnAt=Infinity;
   player.lane=direction+1;player.x=player.lane;
   if(!chooseJourneyDirection(direction))throw Error('Turn rejected');
   updateJourneyRoute();
   if(journey.nextSideTree<journey.turnExitTravel+SPAWN_FAR)throw Error('Exit horizon not prepared before yaw');
   const prepared=new Map(journey.sideTrees.map(t=>[t.v,{...t}]));
   while(journey.phase==='turning')update(1/60);
   for(const tree of roadsideScenery){
    const before=prepared.get(tree.v);
    if(!before){newTreesAtHandoff++;continue;}
    if(Math.abs(tree.z-(before.d-journey.branchTravel))>1e-8)throw Error('Prepared tree changed depth at handoff');
   }
   if(nextTreeAt<dist+SPAWN_FAR)throw Error('Spawner cursor behind camera horizon');
   // The regular spawner resumes ONLY at the far boundary, never inside the
   // full-opacity area that caused the post-turn batch to pop into view.
   for(let frame=0;frame<30;frame++){
    const known=new Set(roadsideScenery.map(t=>t.v));update(1/60);
    for(const tree of roadsideScenery)if(!known.has(tree.v)&&tree.z<SPAWN_FAR-pace/60-.01)
     throw Error('New tree spawned inside the visible road after turn: '+tree.z);
   }
   cases++;
  }
 }finally{speed=originalSpeed;}
 return {cases,newTreesAtHandoff,normalAndCurved:true,earlyAndLate:true,baseAndFast:true};
})())`,30000));
assert.equal(report.newTreesAtHandoff,0,'Visible trees appeared only after the camera turn');
console.log('TURN_LOOKAHEAD_OK '+JSON.stringify(report));
