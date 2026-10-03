/* Mechanical selected-tier packaging; no sharpening or runtime copies. */
const fs=require('node:fs'),path=require('node:path'),{createCanvas,loadImage}=require('@napi-rs/canvas');
(async()=>{
 const source=process.argv[2];if(!source)throw Error('Pass the generated arena PNG');
 const root=path.resolve(__dirname,'..'),dir=path.join(root,'art-source/knight-rush-backgrounds/oathkeeper-arena-v1');
 fs.mkdirSync(dir,{recursive:true});
 const original=path.join(dir,'generated-source.png');
 if(fs.existsSync(original))throw Error('Versioned source already exists; preserve it');
 fs.copyFileSync(source,original);
 const im=await loadImage(original);
 for(const [suffix,width,height]of [['',1086,1448],['-mobile',576,768]]){
  const target=path.join(root,'assets/encounters/oathkeeper-arena-v1'+suffix+'.png');
  if(fs.existsSync(target))throw Error('Versioned runtime asset already exists: '+target);
  const canvas=createCanvas(width,height),g=canvas.getContext('2d');
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,0,0,width,height);
  fs.writeFileSync(target,canvas.toBuffer('image/png'));
  console.log(JSON.stringify({target,width,height,decodedBytes:width*height*4}));
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
