/* Menu composition from the actual native actor/table/mugs; no HUD or redraw. */
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage();await page.addInitScript(()=>{requestAnimationFrame=()=>0;});
 await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
 await page.waitForFunction(()=>window.KRSunlitForest,null,{polling:50});
 await page.evaluate(()=>{startTavernSlide('forest','minigames');SFX.setTestMuted(true);});
 await page.waitForFunction(()=>window.KRTavernSlide&&KREventVisuals.peek('tavern-slide'),null,{polling:50});
 await page.evaluate(()=>{
  const canvas=document.createElement('canvas');canvas.width=480;canvas.height=260;
  const oldG=g,oldTime=perfNow;try{
   g=canvas.getContext('2d');perfNow=0;
   g.save();g.translate(0,-160);KRTavernSlide.drawCutscene();g.restore();
   const actor=pass=>{g.save();g.translate(84,-90);g.scale(.65,.65);KRTavernSlide.barry(true,pass);g.restore();};
   actor('body');g.save();g.translate(48,-135);g.scale(.8,.8);KRTavernSlide.table();g.restore();actor('front');
   g.save();g.translate(48,-135);g.scale(.8,.8);
   for(const m of [{owner:'ai',x:224,y:415},{owner:'player',x:292,y:495},{owner:'player',x:177,y:660}])KRTavernSlide.mug({...m,onTable:true,alpha:1,angle:0});
   g.restore();canvas.id='tavern-preview-export';canvas.style.cssText='position:fixed;left:0;top:0;width:480px;height:260px;z-index:2147483647';document.body.appendChild(canvas);
  }finally{g=oldG;perfNow=oldTime;}
 });
 const file=path.join(root,'assets/encounters/tavern-slide-preview-v2.png');await page.locator('#tavern-preview-export').screenshot({path:file});
 console.log({file,bytes:fs.statSync(file).size,decodedBytes:480*260*4});
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
