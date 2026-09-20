const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createCanvas}=require('@napi-rs/canvas');
const {run,canvas}=require('./journey-render-audit.cjs');
const out=path.resolve('output/journey-silhouette-continuity');fs.mkdirSync(out,{recursive:true});
run(`SFX.toggle();startJourneyWithSeed(0);setCurvedWorldTrial(true);godMode=true;
 journey.phase='main';dist=100;perfNow=1;roadsideScenery=[];obstacles=[];pickups=[];
 function clearSilhouette(){g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,480,800);worldA=1;g.globalAlpha=1;}
 function rootSilhouette(z,side,theme){
  clearSilhouette();const o=new ObstacleEntity('root',z,side==='L'?['duck','jump',null]:[null,'jump','duck'],side);
  o.seed=731;o.treeV=.1;o.roadTheme=theme;
  drawGroundMaskedWorldItem(drawObstacleEntity,o,z,BIO());
 }
 function endSilhouette(z){
  clearSilhouette();drawGroundMaskedWorldItem(drawJourneyTree,{old:true,endCap:true,x:0,z:dist+z,v:.1},z,BIO());
 }`);
const pixels=()=>Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data);
const difference=(a,b)=>{let sum=0;for(let i=0;i<a.length;i++)sum+=Math.abs(a[i]-b[i]);return sum;};
let crestChecks=0,maxCrestDelta=0;
for(const side of ['L','R'])for(const theme of ['normal','bloodwood','disco']){
 run(`rootSilhouette(60.0001,'${side}','${theme}');`);const before=pixels();
 run(`rootSilhouette(59.9999,'${side}','${theme}');`);const after=pixels();
 const delta=difference(before,after);maxCrestDelta=Math.max(maxCrestDelta,delta);
 assert(delta<1200,'Root uncovers a strip at crest: '+side+' '+theme+' '+delta);crestChecks++;
}
// No population expansion: only the canonical 14 end-cap actors have a longer
// fade runway. Their tallest tips must already exist before the old 150 limit.
const depths=[170,160,155,150,140,120,100,60];
const sheet=createCanvas(480*4,400*2),sg=sheet.getContext('2d');
let earlyPixels=0;
for(let i=0;i<depths.length;i++){
 run(`endSilhouette(${depths[i]});`);
 if(depths[i]===155){const p=pixels();for(let j=3;j<p.length;j+=4)if(p[j])earlyPixels++;}
 sg.fillStyle='#44504b';sg.fillRect(i%4*480,Math.floor(i/4)*400,480,400);
 sg.drawImage(canvas,0,0,480,400,i%4*480,Math.floor(i/4)*400,480,400);
 sg.fillStyle='#fff';sg.font='20px monospace';sg.fillText(depths[i]+' m',i%4*480+12,Math.floor(i/4)*400+28);
}
assert(earlyPixels>0,'Tall end-cap crown still enters after 150 m');
fs.writeFileSync(path.join(out,'end-cap-emergence.png'),sheet.toBuffer('image/png'));
const identity=JSON.parse(run(`JSON.stringify((()=>{
 const originalTree=drawTree;let capturedY;
 try{
  drawTree=(x,y)=>{capturedY=y;};
  for(const z of [70,60,30,0]){
   const p=proj(z),o=new ObstacleEntity('root',z,['duck','jump',null],'L');
   o.roadTheme='bloodwood';o.seed=731;
   drawRoot(o,p.y,p,linS(p.t)*1.6);
   if(Math.abs(capturedY-p.y-4*linS(p.t))>1e-8)throw Error('Mother-tree foot differs from baked turn face');
  }
 }finally{drawTree=originalTree;}
 for(let seed=0;seed<30;seed++){
  startJourneyWithSeed(seed);
  const node=journeyRoute.nodes.find(n=>n.type!=='boss'&&n.out.length&&!n.out.some(e=>e.direction===0));
  if(!node)continue;
  const parent=journeyRoute.nodes.find(n=>n.out.some(e=>e.to===node.id)),edge=parent.out.find(e=>e.to===node.id);
  const preview=journeyEndTrees(node,edge);
  journeyRoute.from=parent.id;journeyRoute.next=node.id;journeyRoute.activeEdge=edge.id;
  armJourneyNode();
  if(journey.endTrees!==preview)throw Error('Arming replaced end-cap actors');
  const tree=preview[0];
  if(treeVisibilityFar(tree)!==214||treeDistanceAlpha(tree,150)!==1)throw Error('End-cap runway mismatch');
  if(treeVisibilityFar({})!==150)throw Error('Ordinary population extended');
  setCurvedWorldTrial(false);
  if(treeVisibilityFar(tree)!==150)throw Error('Legacy visibility changed');
  return {sameActors:true,count:preview.length,legacyUnchanged:true,scaledMotherFoot:true};
 }throw Error('Missing closed road');
})())`));
assert.equal(identity.count,14);
console.log('SILHOUETTE_CONTINUITY_OK '+JSON.stringify({crestChecks,maxCrestDelta,earlyPixels,...identity,screenshots:out}));
