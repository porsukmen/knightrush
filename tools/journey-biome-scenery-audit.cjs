const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {run,canvas}=require('./journey-render-audit.cjs');
const out=path.resolve('output/journey-biome-scenery');fs.mkdirSync(out,{recursive:true});
run(`SFX.toggle();startJourneyWithSeed(0);godMode=true;
 globalThis.sceneryEdge=journeyRoute.nodes.flatMap(n=>n.out).find(e=>e.preview.theme==='bloodwood');
 const n=journeyRoute.nodes.find(n=>n.out.includes(sceneryEdge));
 journeyRoute.from=n.id;journeyRoute.next=sceneryEdge.to;journeyRoute.activeEdge=sceneryEdge.id;
 dist=sceneryEdge.pieces[0].start+115;roadScroll=dist;runDistance=dist;armJourneyNode();
 roadsideScenery=[];obstacles=[];pickups=[];nextTreeAt=dist-4;nextSpawnAt=Infinity;spawnLoopEntities();`);
const report=JSON.parse(run(`JSON.stringify((()=>{
 const layout=journeyRoadDecorLayout(sceneryEdge),copy=JSON.stringify(layout);
 if(journeyRoadDecorLayout(sceneryEdge)!==layout)throw Error('Layout rebuilt every frame');
 JOURNEY_DECOR_LAYOUTS.delete(sceneryEdge);
 if(JSON.stringify(journeyRoadDecorLayout(sceneryEdge))!==copy)throw Error('Non-deterministic decor');
 const kinds=new Set(),edges=journeyRoute.nodes.flatMap(n=>n.out).filter(e=>e.preview.theme==='bloodwood');
 for(const e of edges)for(const d of journeyRoadDecorLayout(e))kinds.add(d.kind);
 if(kinds.size!==6)throw Error('Missing decor variants');
 const left=layout.filter(d=>d.side<0),right=layout.filter(d=>d.side>0);
 if(left.some(a=>right.some(b=>a.at===b.at)))throw Error('Mirrored rows');
 const depths=[150,149,140,125,100,80,CFG.Z_FAR,.01];
 const samples=depths.map(z=>{const q=sceneryDepthProjection(z);return {z,alpha:q.alpha,scale:q.scale,y:q.p.y};});
 for(let i=1;i<samples.length;i++)if(samples[i].scale<samples[i-1].scale)throw Error('Scenery does not grow with approach');
 // Match the existing tree horizon (including its slight drift), and verify
 // continuity at the soft-horizon/ordinary-projection handoff, not monotonic Y.
 const far=sceneryDepthProjection(CFG.Z_FAR+.001),near=sceneryDepthProjection(CFG.Z_FAR-.001);
 if(Math.abs(far.p.y-near.p.y)>.1||Math.abs(far.scale-near.scale)>.001)throw Error('Scenery handoff snap');
 for(const theme of ['disco','bloodwood']){
  for(const depth of [140,100,76,70,60,10])if(obstacleDistanceAlpha({roadTheme:theme},depth)!==obstacleDistanceAlpha({},depth))throw Error('Obstacle differs from normal road');
 }
 const draw=drawTree,seen=[];
 try{drawTree=(...a)=>seen.push(a[5]);
  drawRoot({side:'L',roadTheme:'bloodwood',bloodAmount:.8,treeV:.4,req:['duck','jump',null],seed:11},proj(10).y,proj(10),linS(proj(10).t)*1.6);
 }finally{drawTree=draw;}
 if(seen.length!==1||seen[0]!==.8)throw Error('Root mother tree palette mismatch');
 return {variants:[...kinds],independentSides:true,cachedSeedLayout:true,samples,motherTreePalette:true};
})())`));
// Each renderer must actually paint at 140 m, not merely pass a queue test.
for(const renderer of ['drawJourneyBloodDecor','drawJourneyDiscoDancer','drawJourneyDiscoEntryBall','drawJourneyDiscoParty','drawJourneyDiscoLight']){
 run(`g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,480,800);${renderer}({x:0,z:dist+140,kind:'ribs',seed:23,index:0,strength:1});`);
 const data=canvas.getContext('2d').getImageData(0,0,480,800).data;
 assert(data.some((v,i)=>i%4===3&&v>0),renderer+' missing at tree horizon');
}
for(const theme of ['bloodwood','disco'])for(const kind of ['root','boulder','pond'])for(const depth of [140,70]){
 run(`g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,480,800);
  globalThis.farOb=new ObstacleEntity('${kind}',${depth},${JSON.stringify(kind==='root'?['duck','jump',null]:[null,'jump',null])},'L');
  farOb.roadTheme='${theme}';farOb.seed=123;drawObstacle(farOb,proj(${depth}));`);
 const painted=canvas.getContext('2d').getImageData(0,0,480,800).data.some((v,i)=>i%4===3&&v>0);
 assert.equal(painted,depth<76,theme+'/'+kind+' must use normal obstacle horizon');
}
run('g.setTransform(1,0,0,1,0,0);render();');
fs.writeFileSync(path.join(out,'forest.png'),canvas.toBuffer('image/png'));
// Isolated contact sheet to inspect all six code-native silhouettes.
run(`g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.fillStyle='#29161b';g.fillRect(0,0,480,800);
 const project=journeyDecorProjection;
 try{let i=0;for(const kind of ['skull','ribs','bones','spine','thorns','mushrooms']){
  const x=120+(i%2)*240,y=190+Math.floor(i/2)*230;
  journeyDecorProjection=()=>({x,y,scale:1.4,alpha:1});
  drawJourneyBloodDecor({kind,index:i,seed:37,size:1});g.fillStyle='#dec3b2';g.font='16px monospace';g.fillText(kind,x-42,y+34);i++;
 }}finally{journeyDecorProjection=project;}`);
fs.writeFileSync(path.join(out,'variants.png'),canvas.toBuffer('image/png'));
console.log('BIOME_SCENERY_OK',JSON.stringify(report));
