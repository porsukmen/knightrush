const assert=require('node:assert/strict');
const {run}=require('./journey-render-audit.cjs');
const report=JSON.parse(run(`JSON.stringify((()=>{
 SFX.toggle();journeyRoadEventHandlers.delete('disco_finale');
 let checks=0;const failures=[];
 for(let seed=0;seed<4;seed++){
  startJourneyWithSeed(seed);godMode=true;
  for(const direction of [-1,1])for(const n of journeyRoute.nodes.filter(n=>n.out.some(e=>e.direction===direction))){
   for(const offset of [-50,-30,-2,3.9,9.9]){
    journeyRoute.next=n.id;const parent=journeyRoute.nodes.find(p=>p.out.some(e=>e.to===n.id));
    journeyRoute.from=parent.id;journeyRoute.activeEdge=parent.out.find(e=>e.to===n.id).id;
    journeyRoute.status='travel';journeyRoute.pendingArm=false;mode='run';
    dist=n.at+offset;armJourneyNode();player.lane=1;player.x=1;
    const action=direction<0?'left':'right';
    handleAction(action);handleAction(action);const accepted=journeyRoute.selection;
    for(let i=0;i<180&&journey.phase!=='turning';i++)update(1/60);
    checks++;if(journey.phase!=='turning'||journey.direction!==direction)failures.push({seed,node:n.id,direction,offset,accepted,
      phase:journey.phase,dist:dist-n.at,status:journeyRoute.status});
   }
  }
 }
 return {checks,failures:failures.slice(0,15),failureCount:failures.length};
})())`,30000));
assert.equal(report.failureCount,0,JSON.stringify(report.failures));
console.log('JOURNEY_TURN_INPUT_OK '+JSON.stringify(report));
