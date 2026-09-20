const assert=require('node:assert/strict');
const {run}=require('./journey-render-audit.cjs');
run("SFX.toggle();journeyRoadEventHandlers.delete('disco_finale');");
const report=JSON.parse(run(`JSON.stringify((()=>{
 let eligible=0,special=0,slots=0;const lengths=new Set(),themes=new Set();
 for(let seed=0;seed<300;seed++){
  const r=generateJourneyGraph(seed,1984.5),byId=new Map(r.nodes.map(n=>[n.id,n]));
  if(JSON.stringify(r)!==JSON.stringify(generateJourneyGraph(seed,1984.5)))throw Error('Non-deterministic road plan');
  for(const n of r.nodes)for(const e of n.out){
   const end=byId.get(e.to),pieces=e.pieces,s=pieces.filter(p=>p.kind==='special');
   const eligibleRoad=n.type!=='start'&&end.type!=='boss'&&e.baseLength>=140;
   const expectedSpecial=eligibleRoad&&journeyRandom(journeyKeySeed(r.seed,'road:'+r.stage+':'+e.id))()<.20;
   if(Boolean(s.length)!==expectedSpecial)throw Error('Special probability rule changed');
   if(Math.abs(e.length-e.baseLength*(s.length?3:1))>1e-6)throw Error('Special road not tripled');
   if(Math.abs(end.at-n.at-e.length)>1e-6)throw Error('Road odometer mismatch');
   if(n.type!=='start'&&end.type!=='boss'&&end.at-n.at>=140)eligible++;
   if(s.length){special++;lengths.add(s.length);themes.add(s[0].theme);}
   if(s.length>4||new Set(s.map(p=>p.theme)).size>1)throw Error('Region continuity');
   if(pieces[0].start!==n.at||pieces.at(-1).end!==end.at)throw Error('Road coverage');
   for(let i=0;i<pieces.length;i++){
    if(pieces[i].end<=pieces[i].start)throw Error('Negative piece');
    if(i&&Math.abs(pieces[i-1].end-pieces[i].start)>1e-8)throw Error('Gap/overlap');
   }
   if(end.type==='boss'&&s.length)throw Error('Boss on special road');
   if(s.length){
    if(s.at(-1).role!=='finale'||pieces.at(-1).kind!=='normal')throw Error('Missing finale/return');
    for(let i=1;i<s.length;i++)if(s[i].continueChance>=s[i-1].continueChance)throw Error('Chance did not decrease');
    if(e.events.filter(x=>JOURNEY_ROAD_EVENTS[x.definition].blocking).length!==1)throw Error('Finale count');
   }
   for(const slot of e.events){
    slots++;const p=pieces.find(p=>p.id===slot.pieceId),definition=JOURNEY_ROAD_EVENTS[slot.definition];
    if(!p||p.kind!==definition.kind||slot.at<p.start||slot.expiresAt>p.end||slot.at>=slot.expiresAt)throw Error('Invalid slot');
   }
  }
 }
 return {seeds:300,eligible,special,rate:special/eligible,pieceCounts:[...lengths],themes:[...themes],slots};
})())`,30000));
// Long roads are rejected more often by geometric clearance. Verify each
// seeded 20% proposal above rather than assuming unbiased surviving geography.
assert(report.special>0);assert.equal(report.themes.length,2);
assert.deepEqual(report.pieceCounts.sort(),[1,2,3,4]);
run(`
 if(CFG.LOOP_DIST!==1323*1.5)throw Error('Distance multiplier');
 pendingJourneyPrototype=false;startRun(0);if(stageDistance()!==1984.5)throw Error('Normal route length');
 startJourneyWithSeed(123);godMode=true;if(stageDistance()<1984.5||journeyRoute.baseTotal!==1984.5)throw Error('Seeded length');
 function auditRoadSlot(kind){
  for(let seed=0;seed<200;seed++){
   startJourneyWithSeed(seed);godMode=true;
   for(const n of journeyRoute.nodes)for(const e of n.out){
    const slot=e.events.find(s=>JOURNEY_ROAD_EVENTS[s.definition].kind===kind);if(!slot)continue;
    journeyRoute.from=n.id;journeyRoute.next=e.to;journeyRoute.activeEdge=e.id;
    journeyRoute.pendingArm=false;armJourneyNode();
    dist=slot.at-.1;roadScroll=dist;runDistance=dist;obstacles=[];pickups=[];
    nextSpawnAt=stageDistance();nextTreeAt=stageDistance();return slot;
   }
  }throw Error('Missing fixture '+kind);
 }
 globalThis.probe={starts:0,updates:0,disposed:0,context:null};
 const blocked=auditRoadSlot('special');
 const unregister=registerJourneyRoadEvent(blocked.definition,{
  start:ctx=>{probe.starts++;probe.context=ctx;},update:()=>probe.updates++,
  action:(ctx,a)=>{if(a==='tap')ctx.finish({status:'completed',rewardKey:'test-only'});},
  dispose:()=>probe.disposed++
 });
 globalThis.beforeBuild=JSON.stringify([player.hp,gold,runSkills]);
 update(1/25);
 if(mode!=='journeyevent'||dist!==blocked.at||probe.starts!==1)throw Error('Blocking start/position');
 const frozen=JSON.stringify([dist,runDistance,roadScroll]);
 for(let i=0;i<60;i++)update(1/60);
 if(JSON.stringify([dist,runDistance,roadScroll])!==frozen||probe.updates!==60)throw Error('Blocking freeze');
 if(beforeBuild!==JSON.stringify([player.hp,gold,runSkills]))throw Error('Build changed');
 handleAction('tap',{x:240,y:400});
 if(mode!=='run'||probe.disposed!==1||journeyRoute.eventHistory.length!==1)throw Error('Resume/result');
 if(probe.context.finish({status:'completed'}))throw Error('Duplicate completion');
 update(1/60);if(dist<=blocked.at||probe.starts!==1)throw Error('Did not resume / repeated event');
 unregister();
 const moving=auditRoadSlot('normal');
 const removeMoving=registerJourneyRoadEvent(moving.definition,{
  start:ctx=>{probe.context=ctx;probe.starts++;},update:()=>probe.updates++
 });
 update(1/60);const beforeMoving=dist;
 if(mode!=='run'||!journeyRoadEventSession)throw Error('Normal event blocked');
 handleAction('right');if(player.lane!==2)throw Error('Moving event swallowed lane input');
 for(let i=0;i<20;i++)update(1/60);
 if(dist<=beforeMoving)throw Error('Moving event froze runner');
 dist=moving.expiresAt+.1;updateJourneyRoadEvents(0);
 if(journeyRoadEventSession||journeyRoute.eventRecords[moving.id].status!=='expired')throw Error('Expiry');
 removeMoving();
 const abandoned=auditRoadSlot('special');
 const removeAbandoned=registerJourneyRoadEvent(abandoned.definition,{start:ctx=>probe.context=ctx});
 update(1/60);const stale=probe.context;
 startJourneyWithSeed(789);
 if(journeyRoadEventSession||mode!=='run'||stale.finish({status:'completed'}))throw Error('Stale event crossed restart');
 removeAbandoned();
 const reserved=auditRoadSlot('special');update(1/60);
 if(mode!=='run'||journeyRoute.eventRecords[reserved.id].status!=='reserved')throw Error('Placeholder blocked gameplay');
`);
console.log('JOURNEY_ROADS_OK '+JSON.stringify(report)+'; blocking/moving lifecycle, expiry, exactly-once results, restart, reserved content, 1.5x distance');
