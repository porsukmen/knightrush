// Offline texture packaging only. Generated sources remain untouched.
// Trim empty alpha, fit each island in its cell, and create TWO device tiers.
// No colour/style processing and no image library ships in the game.
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),source=path.join(root,'art-source/morning-forest-v1'),dest=path.join(root,'assets/morning-forest');
function occupied(image,region){
 const c=createCanvas(image.width,image.height),g=c.getContext('2d');g.drawImage(image,0,0);
 const d=g.getImageData(0,0,c.width,c.height).data;
 const [x0,y0,x1,y1]=region||[0,0,c.width,c.height];let l=x1,t=y1,r=x0,b=y0;
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(d[(y*c.width+x)*4+3]>8){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
 if(r<=l||b<=t)throw Error('Empty sprite');return {x:l,y:t,w:r-l+1,h:b-t+1};
}
(async()=>{
 fs.mkdirSync(dest,{recursive:true});const objects=[];
 for(const name of ['oak','beech','lean']){const image=await loadImage(path.join(source,name+'.png'));objects.push({image,rect:occupied(image)});}
 const props=await loadImage(path.join(source,'props-source.png'));
 for(let i=0;i<3;i++)objects.push({image:props,rect:occupied(props,[Math.ceil(i*props.width/3),Math.floor(props.height*.71),Math.floor((i+1)*props.width/3),props.height])});
 const canvas=createCanvas(1920,1536),g=canvas.getContext('2d'),sprites=[];
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 for(let i=0;i<objects.length;i++){
  const {image,rect:r}=objects[i],cellX=(i%3)*640,cellY=i<3?0:1120,cellH=i<3?1120:416,
   s=Math.min(600/r.w,(cellH-40)/r.h),w=Math.round(r.w*s),h=Math.round(r.h*s),x=cellX+Math.floor((640-w)/2),y=cellY+cellH-20-h;
  g.drawImage(image,r.x,r.y,r.w,r.h,x,y,w,h);sprites.push({x:x/1920,y:y/1536,w:w/1920,h:h/1536});
 }
 const outputs=[];
 for(const [tier,w,h]of [['standard',1920,1536],['mobile',960,768]]){
  const c=createCanvas(w,h),cx=c.getContext('2d');cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality='high';cx.drawImage(canvas,0,0,w,h);
  const name='woodland-'+tier+'.png';fs.writeFileSync(path.join(dest,name),await c.encode('png'));outputs.push({tier,name,width:w,height:h,decodedBytes:w*h*4});
 }
 fs.writeFileSync(path.join(dest,'atlas-manifest.js'),'globalThis.KRMorningAtlas='+JSON.stringify({sprites,outputs})+';\n');
 console.log(JSON.stringify({sprites,outputs},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
