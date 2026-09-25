// Export only native model canvases, never the Art Lab UI/background layout.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const root=path.resolve(__dirname,'..'),out=path.join(root,'output/caravan-style-refs');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1080}});
  await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?artlab=1');
  await page.waitForFunction(()=>window.KRArtLab&&document.documentElement.dataset.artLabReady==='1');
  await page.evaluate(()=>{KRArtLab.setOptions({playing:false,action:false,view:'color'});KRArtLab.renderAt(1,true);});
  const refs=await page.evaluate(()=>KRArtLab.registry.references);
  for(const id of ['knight','merchant','gatherer']){
   const i=refs.findIndex(r=>r.id===id);if(i<0)continue;
   const data=await page.locator('.art-card canvas').nth(i).evaluate(c=>c.toDataURL('image/png').split(',')[1]);
   const file=path.join(out,id+'.png');fs.writeFileSync(file,Buffer.from(data,'base64'));console.log(file);
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
