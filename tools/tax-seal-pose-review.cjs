const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),{createCanvas,loadImage}=require('@napi-rs/canvas');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/tax-collector');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage({viewport:{width:1000,height:1000}});
 await p.addInitScript(()=>{requestAnimationFrame=()=>0});
 await p.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?taxmanlab=1');
 await p.waitForFunction(()=>window.KRTaxCollector&&KRCutscenes.report().state==='ready',null,{polling:100});
 const data=await p.evaluate(()=>{
  const api=KRTaxCollector,frames=[];
  for(const offset of[-170,0,170])for(const target of['commit','strike','recover']){
   const s=api.createSeal(9);s.paper=s.target=offset;api.sealAction(s,'continue');
   let ticks=0;while((s.phase!==target||s.time<(target==='strike'?.07:.1))&&ticks++<2000)api.updateSeal(s,1/240);
   if(ticks>=2000)throw Error('Pose not reached');
   const rig=api.sealPose(s);
   if(rig.seal.elbow[1]<rig.seal.shoulder[1]+15)throw Error('Elbow flipped above shoulder');
   if(Math.hypot(220+rig.seal.wrist[0]*2.9-s.handX,780+rig.seal.wrist[1]*2.9-s.handY)>.01)throw Error('Prop outside arm reach');
   frames.push({label:offset+' / '+target,state:s});
  }
  // Lateral translation cannot change sheet width, length or edge orientation.
  for(const q of[-170,0,170]){
   const a=api.paperPoint(q,-50,0),z=api.paperPoint(q,50,0),d=api.paperPoint(q,-50,1);
   if(Math.abs(z[0]-a[0]-100)>.001||z[1]!==a[1]||d[1]-a[1]!==160)throw Error('Paper deformation');
  }
  return frames;
 });
 assert.equal(data.length,9);const board=createCanvas(1440,2040),ctx=board.getContext('2d');ctx.fillStyle='#30241e';ctx.fillRect(0,0,1440,2040);
 for(const [i,f]of data.entries()){
  const clip=await p.evaluate(s=>{journeyRoadEventSession.context.taxSeal=s;journeyRoadEventSession.context.dialogue='seal';render();return{x:viewX/renderDpr(),y:viewY/renderDpr(),width:480*viewScale/renderDpr(),height:660*viewScale/renderDpr()};},f.state);
  const shot=await p.screenshot({clip}),x=i%3*480,y=Math.floor(i/3)*680;
  ctx.drawImage(await loadImage(shot),x,y+20,480,660);ctx.font='14px monospace';ctx.fillStyle='#f5dfad';ctx.fillText(f.label,x+8,y+16);
 }
 fs.writeFileSync(path.join(out,'seal-pose-review.png'),board.toBuffer('image/png'));
 console.log('SEAL_POSES_OK: both paper extremes, elbow branch, prop reach, no paper shear');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
