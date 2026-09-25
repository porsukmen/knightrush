const fs=require('node:fs'),path=require('node:path');
const {loadImage,createCanvas}=require('@napi-rs/canvas');
(async()=>{
 const src=process.argv[2];if(!src)throw Error('Pass generated source PNG');
 const version=process.argv[3]||'v1';if(!/^v\d+$/.test(version))throw Error('Expected version vN');
 const root=path.resolve(__dirname,'..'),dir=path.join(root,'art-source/knight-rush-backgrounds/mossy-inn-'+version);
 fs.mkdirSync(dir,{recursive:true});fs.copyFileSync(src,path.join(dir,'generated.png'));
 const img=await loadImage(src);
 for(const [suffix,w,h]of [['',1448,1086],['-mobile',768,576]]){
  const c=createCanvas(w,h),ctx=c.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,0,0,w,h);
  fs.writeFileSync(path.join(root,'assets/encounters/mossy-inn-'+version+suffix+'.png'),c.toBuffer('image/png'));
  console.log({suffix,w,h,decodedBytes:w*h*4});
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
