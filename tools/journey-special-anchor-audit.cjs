const assert=require('node:assert/strict');
const {run}=require('./journey-render-audit.cjs');
const report=JSON.parse(run(`JSON.stringify((()=>{
 SFX.toggle();journeyRoadEventHandlers.delete('disco_finale');journeyRoadEventHandlers.delete('elite_finale');
 function fixture(theme,direction,late,curved){
  for(let seed=0;seed<100;seed++){
   startJourneyWithSeed(seed);godMode=true;setCurvedWorldTrial(curved);
   for(const node of journeyRoute.nodes){
    const edge=node.out.find(e=>e.direction===direction&&e.preview.theme===theme);
    if(!edge)continue;
    const parent=journeyRoute.nodes.find(n=>n.out.some(e=>e.to===node.id));if(!parent)continue;
    journeyRoute.from=parent.id;journeyRoute.next=node.id;
    journeyRoute.activeEdge=parent.out.find(e=>e.to===node.id).id;
    journeyRoute.status='travel';journeyRoute.pendingArm=false;
    dist=node.at+late;roadScroll=dist;curvedGroundDistance=dist;runDistance=dist;
    armJourneyNode();obstacles=[];pickups=[];roadsideScenery=[];
    nextTreeAt=Infinity;nextSpawnAt=Infinity;player.lane=direction+1;player.x=player.lane;
    return {edge,node};
   }
  }throw Error('Missing themed side road');
 }
 const point=(theme,id,at,side)=>journeyDiscoRoadViews(theme).find(v=>v.edge.id===id&&!v.spill).point(at,side);
 let cases=0,samples=0,maxDrift=0;
 for(const curved of [false,true])for(const theme of ['disco','bloodwood'])
 for(const direction of [-1,1])for(const late of [0,17.9])for(const dt of [1/60,.1]){
  const {edge,node}=fixture(theme,direction,late,curved);
  // Probe the same coordinates used by floors, cached decorations and venues.
  const anchors=[{at:edge.pieces[0].start,side:0},
   ...journeyRoadDecorLayout(edge).slice(0,8).map(d=>({at:d.at,side:d.offset})),
   ...edge.events.map(e=>({at:e.at+10,side:0}))];
  const expected=anchors.map(a=>point(theme,edge.id,a.at,a.side));
  if(!chooseJourneyDirection(direction))throw Error('Input rejected');
  updateJourneyRoute();if(journey.phase!=='turning')throw Error('Turn did not start');
  while(journey.phase==='turning'){
   anchors.forEach((a,i)=>{
    const p=point(theme,edge.id,a.at,a.side),q=expected[i];
    const drift=Math.hypot(p.x-q.x,p.z-q.z);maxDrift=Math.max(maxDrift,drift);samples++;
    if(drift>1e-8)throw Error('Special world anchor moves during yaw: '+drift);
   });
   update(dt);
  }
  if(Math.abs(dist-node.at-journey.branchTravel)>1e-8)throw Error('Camera/odometer handoff disagrees');
  anchors.forEach((a,i)=>{
   const p=point(theme,edge.id,a.at,a.side),q=expected[i];
   if(Math.hypot(p.x-q.x,p.z-q.z)>1e-8)throw Error('World anchor jumps at handoff');
  });
  // The frame rebase after settling must preserve visible forward positions.
  const at=node.at+120,side=8;
  while(journeyRoute.pendingArm){
   const p=point(theme,edge.id,at,side),before=journeyCameraPoint(p.x,p.z),oldDist=dist;
   update(dt);
   const q=point(theme,edge.id,at,side),after=journeyCameraPoint(q.x,q.z);
   if(Math.abs(after.side-before.side)>1e-7||Math.abs(after.depth-before.depth+dist-oldDist)>1e-7)
    throw Error('Decoration jumps when road frame is rebased');
  }
  const final=point(theme,edge.id,at,side);
  if(Math.abs(journeyCameraPoint(final.x,final.z).depth-(at-dist))>1e-7)
   throw Error('Venue/decoration distance no longer agrees with gameplay');
  cases++;
 }
 return {cases,samples,maxDrift,turnAndRearm:true,normalAndCurved:true};
})())`,30000));
assert.equal(report.maxDrift,0);
console.log('SPECIAL_ANCHOR_OK '+JSON.stringify(report));
