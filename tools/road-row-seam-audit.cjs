const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');const label=process.argv[2]||'after';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});
try{const out=path.resolve('output/road-row-seams',label);fs.mkdirSync(out,{recursive:true});const reports=[];
for(const [width,height,dpr]of [[480,800,1],[390,844,2]]){
const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr});await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);await page.waitForFunction(()=>!!window.KRSunlitForest);
const data=await page.evaluate(()=> (0,eval)(`(()=>{
 startJourneyWithSeed(647486904);godMode=true;dist=45;roadScroll=dist;render();
 const original=KRSunlitArt.drawFloorShape,main=g,c=document.createElement('canvas');c.width=cvs.width;c.height=cvs.height;
 let worst=0,badTotal=0;const frames=[];
 try{KRSunlitArt.drawFloorShape=function(shape,paint,...args){if(['#d6b16f','#a2af50'].includes(shape.color))original(shape,paint,...args);};
 for(let i=0;i<24;i++){
  update(1/120);render();g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);
  g.setTransform(viewScale,0,0,viewScale,viewX,viewY);drawBackground();drawCurvedRoadWorld();
  const data=g.getImageData(0,0,c.width,c.height).data;let bad=0;
  for(let y=Math.ceil((HORIZON_Y+25)*viewScale+viewY);y<Math.floor((VH-20)*viewScale+viewY);y++){
   const x=Math.floor(VW/2*viewScale+viewX),p=(y*c.width+x)*4;
   const delta=Math.abs(data[p]-214)+Math.abs(data[p+1]-177)+Math.abs(data[p+2]-111);if(delta>4)bad++;
  }
  frames.push(bad);worst=Math.max(worst,bad);badTotal+=bad;g=main;
 }
 return {worst,badTotal,frames,image:c.toDataURL()};
 }finally{g=main;KRSunlitArt.drawFloorShape=original;render();}
})()`));
fs.writeFileSync(path.join(out,width+'-plain.png'),Buffer.from(data.image.split(',')[1],'base64'));delete data.image;
await page.screenshot({path:path.join(out,width+'-run.png')});reports.push({width,height,dpr,...data});
if(label!=='before')assert.equal(data.worst,0,'Uniform soil contains raster row seams');await page.close();
}fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(reports,null,2));console.log(JSON.stringify(reports));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
