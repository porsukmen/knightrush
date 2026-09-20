const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {run,canvas}=require('./journey-render-audit.cjs');
const out=path.resolve('output/journey-disco-obstacles');fs.mkdirSync(out,{recursive:true});
const report=JSON.parse(run(`JSON.stringify((()=>{
 SFX.toggle();startJourneyWithSeed(0);godMode=true;
 let samples=0,spawns=0,collisionCases=0;
 const route=journeyRoute,random=Math.random,pickPattern=pickObstacleSpawnPattern;
 const fixture=(node,edge,at)=>{
   route.from=node.id;route.next=edge.to;route.activeEdge=edge.id;dist=at;
   journey=createJourneyState(journeyNode(edge.to).at+12);journey.phase='approach';
 };
 const shapes=[['boulder',['jump',null,'jump'],'L'],
   ['root',['duck','jump',null],'L'],['pond',[null,'jump',null],'M']];
 try{
  Math.random=()=>.5;
  for(const node of route.nodes)for(const edge of node.out){
   for(const piece of edge.pieces){
    const at=(piece.start+piece.end)/2;fixture(node,edge,at-1);
    const expected=piece.theme==='disco'?'disco':null;
    if(journeyObstacleThemeAt(at)!==expected)throw Error('Wrong piece skin '+piece.id);
    for(const [kind,req,side] of shapes){
     obstacles=[];pickups=[];
     pickObstacleSpawnPattern=()=>({typeId:kind,create:()=>({req:req.slice(),variant:side})});
     spawnObstacle(1);const o=obstacles[0];
     if(!o||o.roadTheme!==expected||JSON.stringify(o.req)!==JSON.stringify(req))
       throw Error('Producer changed collision demands or skin');
     if(o.type!==OBSTACLE_TYPES.get(kind))throw Error('Type contract changed');
     if(expected==='disco'&&o.treeV!==undefined)throw Error('Cable has a mother tree');
     spawns++;
    }
    samples++;
   }
   // Only the straight preview shares future obstacle coordinates.
   const next=journeyNode(edge.to),straight=next.out.find(e=>e.direction===0);
   fixture(node,edge,next.at-20);
   const at=next.at+100;
   const expected=straight?.pieces.find(p=>at>=p.start&&at<p.end)?.theme==='disco'?'disco':null;
   if(journeyObstacleThemeAt(at)!==expected)throw Error('Branch theme leaked into straight preview');
  }
 }finally{Math.random=random;pickObstacleSpawnPattern=pickPattern;}
 const damage=damagePlayer,relic=hasRelic;
 try{
  let hits=0;damagePlayer=()=>hits++;hasRelic=()=>false;pickups=[];
  for(const [kind,req,side] of shapes)for(let lane=0;lane<3;lane++){
   for(const action of ['none','jump','duck']){
    const o=new ObstacleEntity(kind,.1,req.slice(),side);o.prevZ=2;o.roadTheme='disco';obstacles=[o];
    player.x=lane;player.jumpT=action==='jump'?jumpDur()*.5:-1;player.duckT=action==='duck'?.1:-1;
    hits=0;updateRunCollisions();
    const expected=req[lane]&&action!==req[lane]?1:0;
    if(hits!==expected||!o.resolved)throw Error('Collision mismatch '+kind+'/'+lane+'/'+action);
    collisionCases++;
   }
  }
 }finally{damagePlayer=damage;hasRelic=relic;player.jumpT=-1;player.duckT=-1;}
 // Classic mode never receives a Disco skin, including forest stage.
 journeyRoute=null;if(journeyObstacleThemeAt(100)!==null)throw Error('Classic skin leak');
 startJourneyWithSeed(0);godMode=true;
 const node=journeyRoute.nodes.find(n=>n.out.some(e=>e.preview.theme==='disco'));
 const edge=node.out.find(e=>e.preview.theme==='disco'),slot=edge.events.find(e=>e.definition==='disco_finale');
 journeyRoute.from=node.id;journeyRoute.next=edge.to;journeyRoute.activeEdge=edge.id;
 dist=slot.at-110;roadScroll=dist;runDistance=dist;armJourneyNode();
 journeyRoute.discoEnteredAt={[edge.id]:dist-100};
 roadsideScenery=[];obstacles=[];pickups=[];nextTreeAt=dist-4;nextSpawnAt=Infinity;
 spawnLoopEntities();player.x=1;player.lane=1;
 globalThis.discoArtSlot=slot;
 globalThis.discoArtShapes=shapes;
 return {samples,spawns,collisionCases,classicIsolated:true};
})())`));
assert(report.spawns>30);assert.equal(report.collisionCases,27);
for(const [index,name] of ['speakers','cables','grape-soda'].entries()){
 run(`(()=>{obstacles=[];const [kind,req,side]=discoArtShapes[${index}];
   const artObstacle=new ObstacleEntity(kind,8,req.slice(),side);
   artObstacle.seed=731;artObstacle.roadTheme='disco';obstacles=[artObstacle];render();})();`);
 fs.writeFileSync(path.join(out,name+'.png'),canvas.toBuffer('image/png'));
 // Offscreen turning surface must retain the same skin and bound cable height.
 const surface=run(`(()=>{const o=obstacles[0],item={entity:o};
   const c=journeyObstacleSurface(item);return {width:c.width,height:c.height,key:item.surfaceKey};})()`);
 assert(surface.key.includes('disco'));assert(surface.height<400);
}
// The venue is world-fixed and grows continuously, including soft-horizon entry.
const bounds=[];
for(const depth of [140,80,24,2]){
 run(`dist=discoArtSlot.at+2-${depth};roadScroll=dist;obstacles=[];pickups=[];roadsideScenery=[];
   g.clearRect(0,0,480,800);drawJourneyDiscoVenue({x:0,z:discoArtSlot.at+2});`);
 const ctx=canvas.getContext('2d'),pixels=ctx.getImageData(0,0,480,800).data;
 let x0=480,x1=-1,y0=800,y1=-1;
 for(let y=0;y<800;y++)for(let x=0;x<480;x++)if(pixels[(y*480+x)*4+3]){
   x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
 }
 bounds.push({depth,width:x1-x0+1,height:y1-y0+1});
}
for(let i=1;i<bounds.length;i++){
 assert(bounds[i].width>bounds[i-1].width);assert(bounds[i].height>bounds[i-1].height);
}
run('nextTreeAt=dist-4;spawnLoopEntities();render();');
fs.writeFileSync(path.join(out,'venue-threshold.png'),canvas.toBuffer('image/png'));
console.log('JOURNEY_DISCO_OBSTACLES_OK '+JSON.stringify({...report,bounds,screenshots:out}));
