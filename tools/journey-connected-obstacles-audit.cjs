const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {run,canvas}=require('./journey-render-audit.cjs');
const out=path.resolve('output/journey-connected-obstacles');fs.mkdirSync(out,{recursive:true});
run('SFX.toggle();startJourneyWithSeed(0);godMode=true;');
const report=JSON.parse(run(`JSON.stringify((()=>{
 let masks=0,collisions=0;const damage=damagePlayer,relic=hasRelic;
 try{
  damagePlayer=()=>globalThis.connectedHits++;hasRelic=()=>false;pickups=[];
  for(let mask=1;mask<8;mask++){
   const lanes=[0,1,2].filter(l=>mask&(1<<l)),groups=obstacleLaneGroups(lanes);
   if(groups.reduce((n,g)=>n+g.count,0)!==lanes.length)throw Error('Lost occupied lane');
   for(const group of groups)for(let lane=group.start;lane<=group.end;lane++)if(!lanes.includes(lane))throw Error('Bridged safe lane');
   if(mask===5&&groups.length!==2)throw Error('Non-adjacent pair merged');
   if([3,6,7].includes(mask)&&groups.length!==1)throw Error('Adjacent lanes did not merge');
   masks++;
   for(const [theme,kind] of [['disco','pond'],['bloodwood','pond'],['bloodwood','boulder']]){
    for(let lane=0;lane<3;lane++)for(const jumping of [false,true]){
     const req=[0,1,2].map(l=>lanes.includes(l)?'jump':null);
     const o=new ObstacleEntity(kind,.1,req,'L');o.prevZ=2;o.roadTheme=theme;obstacles=[o];
     player.x=lane;player.jumpT=jumping?jumpDur()*.5:-1;player.duckT=-1;globalThis.connectedHits=0;
     updateRunCollisions();if(connectedHits!==(req[lane]&&!jumping?1:0))throw Error('Collision mask changed');collisions++;
    }
   }
  }
 }finally{damagePlayer=damage;hasRelic=relic;player.jumpT=-1;player.duckT=-1;obstacles=[];}
 // Venue lifecycle, using actual event start/finish rather than manually setting statuses.
 for(const definition of ['disco_finale','elite_finale'])for(const status of ['completed','skipped','escaped']){
  startJourneyWithSeed(0);const node=journeyRoute.nodes.find(n=>n.out.some(e=>e.events.some(s=>s.definition===definition)));
  const edge=node.out.find(e=>e.events.some(s=>s.definition===definition)),slot=edge.events.find(s=>s.definition===definition);
  journeyRoute.from=node.id;journeyRoute.next=edge.to;journeyRoute.activeEdge=edge.id;
  dist=slot.at;roadScroll=dist;armJourneyNode();
  if(!journeyVenueVisible(slot.id))throw Error('Venue missing before event');
  startJourneyRoadEvent(slot);if(!journeyVenueVisible(slot.id))throw Error('Active venue disappeared');
  completeJourneyRoadEvent(journeyRoadEventSession.token,{status});
  if(journeyVenueVisible(slot.id))throw Error('Finished venue visible');
  DRAW_QUEUE.length=0;drawItemCount=0;queueJourneyDiscoVenues();queueJourneyBloodWorld();
  if(DRAW_QUEUE.some(d=>d.ref?.slotId===slot.id))throw Error('Finished venue still queued');
 }
 return {masks,collisions,venueExits:6};
})())`));
// Each row is a different authored lane span, with an extra separated pair.
for(const [theme,kind] of [['disco','pond'],['bloodwood','pond'],['bloodwood','boulder']]){
 run(`g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.fillStyle='#211923';g.fillRect(0,0,480,800);
  for(let row=0;row<4;row++){
   const req=row===0?[null,'jump',null]:row===1?['jump','jump',null]:row===2?['jump','jump','jump']:['jump',null,'jump'];
   const o=new ObstacleEntity('${kind}',0,req,'L');o.seed=731;o.roadTheme='${theme}';
   const p=proj(0);g.save();g.translate(36,90+row*180);g.scale(.85,.85);g.translate(0,-p.y);
   ${theme==='disco'?'drawDiscoRoadObstacle':'drawBloodRoadObstacle'}(o,p,1.3,20);g.restore();
   g.fillStyle='#dcc7b5';g.font='15px monospace';g.textAlign='left';g.fillText(['SINGLE','DOUBLE','TRIPLE','SEPARATE LANES'][row],18,135+row*180);
  }`);
 fs.writeFileSync(path.join(out,theme+'-'+kind+'.png'),canvas.toBuffer('image/png'));
}
assert.equal(report.collisions,126);console.log('CONNECTED_OBSTACLES_OK',JSON.stringify(report));
