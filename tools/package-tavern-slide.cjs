const fs=require('node:fs'),path=require('node:path');
const {loadImage,createCanvas}=require('@napi-rs/canvas');
(async()=>{
 const src=process.argv[2];if(!src)throw Error('Pass generated room plate');
 const root=path.resolve(__dirname,'..'),dir=path.join(root,'art-source/knight-rush-backgrounds/tavern-slide-v2');
 fs.mkdirSync(dir,{recursive:true});fs.copyFileSync(src,path.join(dir,'generated.png'));
 const img=await loadImage(src);
 for(const [suffix,w,h]of [['',1086,1448],['-mobile',576,768]]){
  const c=createCanvas(w,h),g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(img,0,0,w,h);
  fs.writeFileSync(path.join(root,'assets/encounters/tavern-slide-v2'+suffix+'.png'),c.toBuffer('image/png'));
  console.log({suffix,w,h,decodedBytes:w*h*4});
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
