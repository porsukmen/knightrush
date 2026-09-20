const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createCanvas}=require('@napi-rs/canvas');
const {run,canvas}=require('./journey-render-audit.cjs');
const out=path.resolve('output/journey-venue-ground');fs.mkdirSync(out,{recursive:true});
run(`SFX.toggle();startJourneyWithSeed(0);setCurvedWorldTrial(true);godMode=true;
 journey.phase='main';dist=0;roadScroll=0;perfNow=1;roadsideScenery=[];obstacles=[];pickups=[];
 function venueFrame(kind,depth,ground=true){
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.clearRect(0,0,480,800);
  if(ground){drawBackground();drawCurvedRoadWorld();}
  const draw=kind==='boss'?drawStageMouth:kind==='disco'?drawJourneyDiscoVenue:drawJourneyBloodLair;
  const ref=kind==='boss'?depth:{x:0,z:depth,slotId:'ground-audit',reveal:1};
  drawGroundMaskedWorldItem(draw,ref,depth,BIO());
 }`);
const kinds=['boss','disco','bloodwood'],depths=[62,60,58,56,52,48,10];
const sheet=createCanvas(240*depths.length,400*kinds.length),sg=sheet.getContext('2d');
let maxThresholdDelta=0;
for(let row=0;row<kinds.length;row++){
 for(let col=0;col<depths.length;col++){
  run(`venueFrame('${kinds[row]}',${depths[col]});`);
  sg.drawImage(canvas,col*240,row*400,240,400);
  sg.fillStyle='#fff';sg.font='14px monospace';sg.fillText(kinds[row]+' '+depths[col]+'m',col*240+5,row*400+18);
 }
 for(const threshold of [60,48]){
  run(`venueFrame('${kinds[row]}',${threshold+.0001},false);`);
  const before=Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data);
  run(`venueFrame('${kinds[row]}',${threshold-.0001},false);`);
  const after=canvas.getContext('2d').getImageData(0,0,480,800).data;
  // Compare visible (premultiplied) colors. Unassociated RGB in a nearly
  // transparent antialiased edge can jump by 255 while changing no visible art.
  let delta=0;for(let i=0;i<before.length;i+=4){
   const a=before[i+3]/255,b=after[i+3]/255;
   delta+=Math.abs(before[i+3]-after[i+3]);
   for(let k=0;k<3;k++)delta+=Math.abs(before[i+k]*a-after[i+k]*b);
  }
  maxThresholdDelta=Math.max(maxThresholdDelta,delta);
  console.log(kinds[row]+' '+threshold+'m pixel delta: '+delta);
 }
}
fs.writeFileSync(path.join(out,'approach.png'),sheet.toBuffer('image/png'));
if(process.argv.includes('--verify')){
 assert(maxThresholdDelta<1500,'Venue foot opens suddenly across the crest');
 run("venueFrame('boss',1,false);");
 assert(canvas.getContext('2d').getImageData(240,780,1,1).data[3]>200,'Cave entry fade was clipped');
 run("journeyRoute.eventRecords['ground-audit']={status:'completed'};");
 for(const kind of ['disco','bloodwood']){
  run(`venueFrame('${kind}',20,false);`);
  assert(!canvas.getContext('2d').getImageData(0,0,480,800).data.some(Boolean),'Completed venue reappeared');
 }
}
console.log('VENUE_GROUND_REPORT '+JSON.stringify({maxThresholdDelta,screenshots:out}));
