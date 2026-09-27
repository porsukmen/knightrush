const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),{createCanvas,loadImage}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/tax-collector');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage({viewport:{width:1440,height:1080}});
 await p.goto('file:///'+root.replaceAll('\\','/')+'/KnightRush.html?artlab=1');
 await p.waitForFunction(()=>window.KRArtLab&&document.documentElement.dataset.artLabReady==='1');
 await p.evaluate(()=>{KRArtLab.setOptions({playing:false,action:false,view:'color'});KRArtLab.renderAt(0,true)});
 const refs=await p.locator('.art-card').evaluateAll(ns=>[6,7,10,12,2].map(i=>({title:ns[i].innerText.split('\n')[0],url:ns[i].querySelector('canvas').toDataURL()})));
 await p.goto('file:///'+root.replaceAll('\\','/')+'/KnightRush.html?taxmanlab=1');
 await p.waitForFunction(()=>window.KRTaxCollector&&KRCutscenes.report().state==='ready');
 const frames=await p.evaluate(()=>{const old=g,c=document.createElement('canvas');c.width=280;c.height=310;const ctx=c.getContext('2d');try{g=ctx;return[0,1.16,2.33,3.49].map(t=>{ctx.clearRect(0,0,280,310);ctx.save();ctx.translate(135,298);ctx.scale(1.2,1.2);KRTaxCollector.actor(t,false);ctx.restore();return{title:'New candidate t='+t,url:c.toDataURL()};});}finally{g=old;}});
 const board=createCanvas(1680,1000),g=board.getContext('2d');g.fillStyle='#1a2b31';g.fillRect(0,0,1680,1000);
 for(const[i,item]of[...refs,frames[0]].entries()){
  const im=await loadImage(item.url);g.fillStyle='#efdbb2';g.font='14px sans-serif';g.fillText(item.title,i*280+8,20);
  // Actual live source canvas, no redrawing or reinterpreting any approved model.
  for(let row=0;row<3;row++){
   const tmp=createCanvas(270,300),c=tmp.getContext('2d');c.drawImage(im,0,0,270,300);
   if(row){const pix=c.getImageData(0,0,270,300);for(let k=0;k<pix.data.length;k+=4){const v=row===2?225:Math.round(pix.data[k]*.2126+pix.data[k+1]*.7152+pix.data[k+2]*.0722);pix.data[k]=pix.data[k+1]=pix.data[k+2]=v;}c.putImageData(pix,0,0);}
   g.drawImage(tmp,i*280+5,30+row*320);
  }
 }
 fs.writeFileSync(path.join(out,'rebuild-live-after.png'),board.toBuffer('image/png'));
 const motion=createCanvas(1120,310),mg=motion.getContext('2d');mg.fillStyle='#1a2b31';mg.fillRect(0,0,1120,310);
 for(const[i,f]of frames.entries())mg.drawImage(await loadImage(f.url),i*280,0);
 fs.writeFileSync(path.join(out,'rebuild-motion.png'),motion.toBuffer('image/png'));
 console.log('Fresh live references + candidate comparison and four motion poses captured.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
