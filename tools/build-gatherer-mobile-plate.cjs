// Offline packaging only: no image processing library runs in the game.
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
  const root=path.resolve(__dirname,'..');
  for(const [source,destination] of [
    ['mushroom-clearing-crisp.png','mushroom-clearing-crisp-mobile.png'],
    ['mushroom-clearing.png','mushroom-clearing-mobile.png']
  ]){
    const image=await loadImage(path.join(root,'assets/encounters',source));
    const canvas=createCanvas(768,Math.round(768*image.height/image.width));
    const c=canvas.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
    c.drawImage(image,0,0,canvas.width,canvas.height);
    const buffer=await canvas.encode('png');
    fs.writeFileSync(path.join(root,'assets/encounters',destination),buffer);
    console.log(destination,canvas.width,canvas.height,buffer.length);
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
