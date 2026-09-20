const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {run,canvas}=require('./journey-render-audit.cjs');
const out=path.resolve('output/journey-curved-continuity');fs.mkdirSync(out,{recursive:true});
run(`SFX.toggle();startJourneyWithSeed(0);godMode=true;setCurvedWorldTrial(true);`);
const report=JSON.parse(run(`JSON.stringify((()=>{
 const originalTree=drawTree;let nearDrawn=false;
 try{
  drawTree=()=>{nearDrawn=true;};journey.phase='main';
  drawJourneyTree({old:true,x:0,z:dist-6.2,v:.1},BIO());
 }finally{drawTree=originalTree;}
 if(!nearDrawn)throw Error('Visible near tree culled at old -6 cutoff');
 if(Math.abs(curvedSpriteClipY(60.001)-curvedSpriteClipY(59.999))>.01)throw Error('Crest mask jumps');
 for(let z=-12;z<60;z+=.2){
  const p=proj(z);if(!Number.isFinite(p.y)||Math.abs(journeyDepthAtY(p.y)-z)>.0001)throw Error('Near projection/inverse mismatch');
 }
 // Closed destination ahead of a straight continuation must be previewed
 // before it becomes the armed junction, using exactly the future tree seeds.
 let found=false;
 for(let seed=0;seed<20&&!found;seed++){
  startJourneyWithSeed(seed);
  for(const node of journeyRoute.nodes){
   const edge=node.out.find(e=>e.direction===0);if(!edge)continue;
   const target=journeyNode(edge.to);if(target.type==='boss'||target.out.some(e=>e.direction===0))continue;
   journeyRoute.next=node.id;journey.phase='approach';journey.networkNode=node.id;journey.endTrees=[];
   dist=target.at+22-140;DRAW_QUEUE.length=0;drawItemCount=0;queueCurvedEndTrees();
   if(!DRAW_QUEUE.some(d=>d.ref?.endCap&&Math.abs(d.z-140)<.01))throw Error('Future dead end appears late');
   found=true;break;
  }
 }
 if(!found)throw Error('No dead-end fixture');
 return {nearTreeRetained:nearDrawn,crestMaskContinuous:true,earlyDeadEnd:true};
})())`));
// Full world-space floor must be identical at the phase handoff. Also test the
// final rotating frame, which previously used a different captured UV surface.
for(const direction of [-1,1]){
 run(`startJourneyWithSeed(0);journeyRoute=null;runJourneyPrototype=true;setCurvedWorldTrial(true);
  dist=153;roadScroll=153;curvedGroundDistance=153;journey=createJourneyState(165,${direction});
  roadsideScenery=[];obstacles=[];pickups=[];player.lane=${direction+1};player.x=player.lane;
  tryJourneyCornerTurn();dist=journey.turnStartDist+journey.turnForward;roadScroll=dist;curvedGroundDistance=dist;
  journey.turnT=1;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,480,800);drawCurvedRoadWorld();`);
 const before=canvas.toBuffer('image/png');
 const offset=run('curvedRoadViews().at(-1).offset');
 run('finishJourneyCornerTurn();g.clearRect(0,0,480,800);drawCurvedRoadWorld();');
 assert(before.equals(canvas.toBuffer('image/png')),'Curved road jumps at turn handoff '+direction);
 assert.equal(run('curvedRoadViews().at(-1).offset'),offset,'Road texture anchor moved');
 fs.writeFileSync(path.join(out,'handoff-'+direction+'.png'),before);
 run('journey.phase="turning";journey.turnT=.999;g.clearRect(0,0,480,800);drawCurvedRoadWorld();');
 fs.writeFileSync(path.join(out,'penultimate-'+direction+'.png'),canvas.toBuffer('image/png'));
}
console.log('CURVED_CONTINUITY_OK',JSON.stringify({...report,exactRoadHandoffs:2}));
