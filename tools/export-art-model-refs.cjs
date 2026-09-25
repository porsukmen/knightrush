// Live, isolated approved character canvases; no scene or Lab UI references.
const {chromium}=require('playwright'),{createCanvas,loadImage}=require('@napi-rs/canvas');
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const root=path.resolve(__dirname,'..'),out=path.join(root,'output/approved-model-review');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1080}});
  await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?artlab=1');
  await page.waitForFunction(()=>window.KRArtLab&&document.documentElement.dataset.artLabReady==='1');
  const refs=await page.evaluate(()=>KRArtLab.registry.references);
  for(const action of [false,true]){
   await page.evaluate(action=>{KRArtLab.setOptions({playing:false,action,view:'color'});KRArtLab.renderAt(1,true);},action);
   const sheet=createCanvas(990,Math.ceil(refs.length/3)*380),ctx=sheet.getContext('2d');ctx.fillStyle='#202c31';ctx.fillRect(0,0,sheet.width,sheet.height);
   for(let i=0;i<refs.length;i++){
    if(refs[i].status!=='approved')continue;
    const data=await page.locator('.art-card canvas').nth(i).evaluate(c=>c.toDataURL('image/png'));
    fs.writeFileSync(path.join(out,refs[i].id+(action?'-action':'-idle')+'.png'),Buffer.from(data.split(',')[1],'base64'));
    const img=await loadImage(data),x=i%3*330,y=Math.floor(i/3)*380;
    const scale=Math.min(310/img.width,340/img.height);ctx.drawImage(img,x+(330-img.width*scale)/2,y,img.width*scale,img.height*scale);
    ctx.fillStyle='#e4d2a9';ctx.font='16px monospace';ctx.fillText(refs[i].label,x+12,y+363);
   }
   fs.writeFileSync(path.join(out,action?'all-action.png':'all-idle.png'),sheet.toBuffer('image/png'));
  }
  console.log('Exported '+refs.filter(r=>r.status==='approved').length+' approved models in idle and action. No reference changes.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
