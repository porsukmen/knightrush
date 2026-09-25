const fs=require('node:fs'),path=require('node:path');
const {loadImage,createCanvas}=require('@napi-rs/canvas');
(async()=>{
 const source=process.argv[2];if(!source)throw Error('Pass generated source PNG');
 const root=path.resolve(__dirname,'..'),dir=path.join(root,'art-source/knight-rush-backgrounds/autumn-caravan-v1');
 fs.mkdirSync(dir,{recursive:true});fs.copyFileSync(source,path.join(dir,'generated.png'));
 const img=await loadImage(source);
 for(const [suffix,w,h]of [['',1448,1086],['-mobile',768,576]]){
  const c=createCanvas(w,h),ctx=c.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,0,0,w,h);
  fs.writeFileSync(path.join(root,'assets/encounters/autumn-caravan-v1'+suffix+'.png'),c.toBuffer('image/png'));
  console.log({suffix,w,h,decodedBytes:w*h*4});
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
