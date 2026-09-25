// Offline size-only packaging; clarity is drawn into the source, not a runtime filter.
const fs=require('node:fs'),path=require('node:path');
const {loadImage,createCanvas}=require('@napi-rs/canvas');
(async()=>{
  const source=process.argv[2];if(!source)throw Error('Pass generated source PNG path');
  const root=path.resolve(__dirname,'..');
  const dir=path.join(root,'art-source/knight-rush-backgrounds/gatherer-simple-v1');
  fs.mkdirSync(dir,{recursive:true});
  fs.copyFileSync(source,path.join(dir,'generated.png'));
  const img=await loadImage(source);
  for(const [suffix,w,h] of [['',1215,1295],['-mobile',768,819]]){
    const canvas=createCanvas(w,h),ctx=canvas.getContext('2d');
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.drawImage(img,0,0,w,h);
    fs.writeFileSync(path.join(root,'assets/encounters/mushroom-clearing-simple'+suffix+'.png'),canvas.toBuffer('image/png'));
    console.log({tier:suffix||'standard',width:w,height:h,decodedBytes:w*h*4});
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
