const fs=require('node:fs'),path=require('node:path');
const {loadImage,createCanvas}=require('@napi-rs/canvas');
(async()=>{
 const source=process.argv[2];if(!source)throw Error('Pass generated source PNG');
 const root=path.resolve(__dirname,'..'),dir=path.join(root,'art-source/knight-rush-backgrounds/autumn-caravan-v2');
 fs.mkdirSync(dir,{recursive:true});fs.copyFileSync(source,path.join(dir,'generated.png'));
 const img=await loadImage(source);
 for(const [suffix,w,h]of [['',1080,1440],['-mobile',576,768]]){
  const c=createCanvas(w,h),ctx=c.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  // Aspect-preserving cover; no stretch if generation adds a few edge pixels.
  const scale=Math.max(w/img.width,h/img.height),sw=w/scale,sh=h/scale;
  ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,0,0,w,h);
  fs.writeFileSync(path.join(root,'assets/encounters/autumn-caravan-v2'+suffix+'.png'),c.toBuffer('image/png'));
  console.log({suffix,w,h,decodedBytes:w*h*4});
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
