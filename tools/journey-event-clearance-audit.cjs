const assert=require('node:assert/strict');
const {run}=require('./journey-render-audit.cjs');
const report=JSON.parse(run(`JSON.stringify((()=>{
 SFX.toggle();let cases=0,suppressed=0,retained=0;
 const originalSpawn=spawnPattern;
 try{
  for(let seed=0;seed<35;seed++)for(const disable of [false,true]){
   startJourneyWithSeed(seed);godMode=true;
   const node=journeyRoute.nodes.find(n=>n.out.some(e=>e.direction===0&&e.events.some(s=>['roadside_quest','roadside_cache'].includes(s.definition)&&s.at-n.at<160)));
   if(!node)continue;
   const edge=node.out.find(e=>e.direction===0),slot=edge.events.find(s=>['roadside_quest','roadside_cache'].includes(s.definition));
   const parent=journeyRoute.nodes.find(n=>n.out.some(e=>e.to===node.id)),incoming=parent.out.find(e=>e.to===node.id);
   journeyRoute.from=parent.id;journeyRoute.next=node.id;journeyRoute.activeEdge=incoming.id;
   journeyRoute.total=journeyPlannedBossDistance(journeyRoute);
   journeyRoute.normalPlans={};journeyRoute.normalSeen=disable?{[journeyNormalContent(slot)]:true}:{};
   journey=createJourneyState(node.at+12);journey.phase='approach';
   dist=node.at-20;nextSpawnAt=node.at+40;nextTreeAt=Infinity;obstacles=[];pickups=[];
   const scheduled=[];spawnPattern=z=>scheduled.push(dist+z);spawnLoopEntities();
   const gapSamples=scheduled.filter(at=>at>node.at+36&&at<journeyNode(edge.to).at-36&&journeyNormalOfferClearance(slot,at));
   if(disable){if(!gapSamples.length)throw Error('Invisible event left an empty road');suppressed++;}
   else if(gapSamples.length)throw Error('Incoming road spawned obstacles inside visible upcoming event');
   if(journeyNormalSlotEnabled(slot)===disable)throw Error('Content/clearance decision disagrees');
   // Changing seen state must not hide an already planned/visible encounter.
   if(!disable){journeyRoute.normalSeen[journeyNormalContent(slot)]=true;
    if(!journeyNormalSlotEnabled(slot))throw Error('Visible event changed its decision');}
   // Place existing actors in the precise event and junction regions that
   // armJourneyNode used to filter out. Arming must preserve object identity.
   journeyRoute.from=node.id;journeyRoute.next=edge.to;journeyRoute.activeEdge=edge.id;
   dist=node.at+56;
   obstacles=[new ObstacleEntity('boulder',slot.at-dist,['jump',null,null],'L'),
     new ObstacleEntity('pond',journeyNode(edge.to).at-dist,[null,'jump',null],'M')];
   pickups=[{kind:'coin',lane:1,z:slot.at-dist}];
   const obs=obstacles.slice(),coins=pickups.slice();armJourneyNode();
   if(obs.some((o,i)=>obstacles[i]!==o)||coins.some((c,i)=>pickups[i]!==c))throw Error('Arming erased visible actors');
   retained+=obs.length+coins.length;
   // The handler must honor the SAME latched decision at encounter time.
   dist=slot.at-15;journey.phase='main';startJourneyRoadEvent(slot);
   if(disable){if(journeyRoadEventSession||journeyRoute.eventRecords[slot.id].status!=='repeat-suppressed')throw Error('Suppressed event activated');}
   else if(journeyRoadEventSession?.slot!==slot)throw Error('Visible planned event failed to activate');
   cases++;
  }
 }finally{spawnPattern=originalSpawn;}
 return {cases,suppressed,retained};
})())`,30000));
assert(report.cases>=30);assert(report.suppressed>0);
console.log('JOURNEY_EVENT_CLEARANCE_OK '+JSON.stringify(report)+'; straight lookahead; invisible events retain normal spawns; visible decisions stable; no arm-time actor deletion');
