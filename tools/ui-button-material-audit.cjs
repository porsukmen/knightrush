const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {createCanvas}=require('@napi-rs/canvas'),{chromium}=require('playwright'),{pathToFileURL}=require('node:url');
for(const [file,key] of [['assets/ui/knight-rush-ui.js','KRUI'],['art-source/knight-rush-ui/ui-specimen-classic-v3.js','KRUIClassicSpecimen']]){
 const scope={};vm.runInNewContext(fs.readFileSync(file,'utf8'),scope);const ui=scope[key];
 const draw=options=>{const c=createCanvas(240,100),g=c.getContext('2d');ui.button(g,{x:20,y:20,w:200,h:48},'TEST','treasure',options);return g};
 const normal=draw({}),selected=draw({variant:'secondary',selected:true}),focused=draw({focus:true});
 // Exclude clipped corners (outside the face), but include both material rules.
 assert.deepEqual(focused.getImageData(28,20,184,48).data,normal.getImageData(28,20,184,48).data,file+' focus preserves material');
 assert.deepEqual(selected.getImageData(28,65,184,2).data,normal.getImageData(28,65,184,2).data,file+' selection preserves lower rim');
 assert(Array.from(selected.getImageData(20,68,200,8).data).every((v,i)=>i%4!==3||v===0),'Selected button has no shadow below its face');
 assert(normal.getImageData(120,71,1,1).data[3]>0,'Normal button remains raised');
 assert.equal(selected.getImageData(18,40,1,1).data[3],0,'No outer selection outline');
 assert.deepEqual(Array.from(selected.getImageData(120,60,1,1).data),[232,214,171,255],'Selection diamond is hollow below the centered label');
 const marker=Array.from(selected.getImageData(116,56,8,8).data);
 assert(marker.some((v,i)=>i%4===0&&v<220),'Diamond contour is visible');
 assert(marker.every((v,i)=>i%4!==0||v>=168),'Diamond uses light brown, not dark ink');
 const secondary=draw({variant:'secondary'}),focusSecondary=draw({variant:'secondary',focus:true});
 assert.deepEqual(secondary.getImageData(28,20,184,48).data,focusSecondary.getImageData(28,20,184,48).data,'Focus never changes role');
 const disabled=draw({enabled:false}),disabledSelected=draw({enabled:false,selected:true,focus:true});
 assert.deepEqual(disabled.getImageData(0,0,240,100).data,disabledSelected.getImageData(0,0,240,100).data,'Disabled overrides emphasis');
 assert.deepEqual(Array.from(disabled.getImageData(40,23,1,1).data),[208,190,160,255],'Muted upper light stays lighter');
 assert.deepEqual(Array.from(disabled.getImageData(40,65,1,1).data),[168,130,74,255],'Muted lower edge stays brown');
}
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 fs.mkdirSync('output/ui-materials',{recursive:true});
 for(const width of [390,1000]){
  const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve('UILab.html')).href);
  assert.equal(await page.locator('[data-view="system"]').getAttribute('aria-pressed'),'true');
  for(const view of ['system','states']){
   await page.click(`[data-view="${view}"]`);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.screenshot({path:`output/ui-materials/${width}-${view}.png`,fullPage:true});
   await page.locator('#reference').screenshot({path:`output/ui-materials/${width}-${view}-canvas.png`});
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('UI_MATERIAL_OK: seated selection + diamond, unchanged lower rim, distinct focus, muted upper light, disabled precedence; phone/desktop Lab.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
