const assert=require('node:assert/strict');
const {run}=require('./journey-render-audit.cjs');
const report=JSON.parse(run(`JSON.stringify((()=>{
 SFX.toggle();startJourneyWithSeed(0);godMode=true;
 const original=spawnPattern,random=Math.random,route=journeyRoute;
 let restored=0,checked=0;const calls=[];
 const probe=(from,to,position,phase='approach')=>{
  route.from=from.id;route.next=to.id;
  route.total=journeyPlannedBossDistance(route);
  journey=createJourneyState(to.at+12);journey.phase=phase;
  dist=position-20;nextSpawnAt=position;nextTreeAt=Infinity;
  calls.length=0;spawnLoopEntities();
  return calls.some(p=>Math.abs(p-position)<1e-7);
 };
 try{
  spawnPattern=z=>calls.push(dist+z);
  for(const from of route.nodes)for(const edge of from.out){
   const to=journeyNode(edge.to);
   for(let p=from.at+50;p<to.at-50;p+=CFG.SPAWN_GAP){
    route.activeEdge=edge.id;
    if(edge.events.some(e=>e.definition==='disco_finale'&&Math.abs(p-e.at)<24))continue;
    checked++;if(!probe(from,to,p))throw Error('Empty road '+edge.id+' at '+p);
    if(route.nodes.some(n=>n!==from&&n!==to&&Math.abs(p-n.at)<36))restored++;
   }
   for(const p of [from.at+20,to.at-20,to.at+20])
    if(probe(from,to,p))throw Error('Junction clearance lost');
  }
  const from=route.nodes.find(n=>n.type==='road'&&n.out.length),to=journeyNode(from.out[0].to);
  route.activeEdge=from.out[0].id;
  if(probe(from,to,from.at+60,'turning'))throw Error('Spawned during camera turn');
  // Exercise the real producer as well, forcing one obstacle and one coin roll.
  spawnPattern=original;route.from=from.id;route.next=to.id;
  route.total=journeyPlannedBossDistance(route);
  journey=createJourneyState(to.at+12);dist=from.at+40;
  obstacles=[];pickups=[];nextSpawnAt=from.at+60;nextTreeAt=Infinity;
  Math.random=()=>0;spawnLoopEntities();
  if(!obstacles.length)throw Error('Real obstacles missing');
  obstacles=[];pickups=[];nextSpawnAt=from.at+60;
  Math.random=() => CFG.P_OBSTACLE+CFG.P_COINS/2;spawnLoopEntities();
  if(!pickups.some(p=>p.kind==='coin'))throw Error('Real coins missing');
  return {seed:0,checked,restored,obstaclesAndCoins:true};
 }finally{spawnPattern=original;Math.random=random;}
})())`));
assert(report.restored>0);
console.log('JOURNEY_SPAWN_OK '+JSON.stringify(report));
