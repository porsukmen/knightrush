// Package only: preserve generated source, create bounded-resolution runtime tier.
const fs=require('node:fs'),path=require('node:path');
const {loadImage,createCanvas}=require('@napi-rs/canvas');
(async()=>{
 const source=process.argv[2];if(!source)throw Error('Pass generated source PNG path');
 const version=process.argv[3]||'v2';if(!/^v\d+$/.test(version))throw Error('Invalid version');
 const root=path.resolve(__dirname,'..'),dest=path.join(root,'assets/encounters');
 const original=path.join(root,'art-source/knight-rush-backgrounds/basalt-hearth-'+version);
 fs.mkdirSync(original,{recursive:true});const img=await loadImage(source);
 fs.copyFileSync(source,path.join(original,'generated.png'));
 fs.copyFileSync(source,path.join(dest,'basalt-hearth-'+version+'.png'));
 const width=768,height=Math.round(img.height*width/img.width),canvas=createCanvas(width,height),c=canvas.getContext('2d');
 c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(img,0,0,width,height);
 fs.writeFileSync(path.join(dest,'basalt-hearth-'+version+'-mobile.png'),canvas.toBuffer('image/png'));
 console.log(JSON.stringify({standard:[img.width,img.height],mobile:[width,height],bytes:[img.width*img.height*4,width*height*4]}));
})().catch(e=>{console.error(e);process.exitCode=1;});
