const {chromium}=require('playwright'),path=require('node:path'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage();await p.addInitScript(()=>requestAnimationFrame=()=>0);await p.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?dukelab=1');await p.waitForFunction(()=>window.KRDukeBluff&&KREventVisuals.peek('duke-bluff'));
 await p.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=480;canvas.height=260;const saved=g,time=perfNow;try{g=canvas.getContext('2d');perfNow=0;
  g.save();g.translate(0,-170);KRDukeBluff.drawCutscene();g.restore();
  const actor=pass=>{g.save();g.translate(60,-65);g.scale(.75,.75);KRDukeBluff.actor(true,pass,{phase:'turn',tell:0});g.restore();};
  actor('body');g.save();g.translate(48,-75);g.scale(.8,.8);KRDukeBluff.table();g.restore();
  KRDukeBluff.cup(267,218,.67);actor('front');for(let i=0;i<3;i++)KRDukeBluff.die(171+i*35,244,[4,2,4][i],27);
  canvas.id='duke-preview-export';canvas.style.cssText='position:fixed;top:0;left:0;width:480px;height:260px;z-index:2147483647';document.body.appendChild(canvas);
 }finally{g=saved;perfNow=time;}});
 await p.locator('#duke-preview-export').screenshot({path:path.join(root,'assets/encounters/duke-bluff-preview-v1.png')});
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
