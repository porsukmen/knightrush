const fs=require('node:fs'),path=require('node:path');
const {run,sandbox}=require('./journey-render-audit.cjs');
const dest=path.resolve('assets/forest-baked');fs.mkdirSync(dest,{recursive:true});
const manifest={},parts=new Map();
for(let shape=0;shape<12;shape++)for(const side of [-1,1])for(let plant=0;plant<3;plant++){
 const key=(shape*2+(side>0?1:0))*3+plant;
 run(`globalThis.bakeArt=forestGiantArt((${shape}+[.1,.45,.85][${plant}])/12,${side})`);
 const art=sandbox.bakeArt,entries=[];
 for(const p of art){
  if(!parts.has(p)){
   const name='part-'+parts.size+'.png';sandbox.bakePart=p;
   run(`globalThis.bakeCanvas=document.createElement('canvas');
    bakeCanvas.width=bakePart.width*2;bakeCanvas.height=bakePart.height*2;
    {const c=bakeCanvas.getContext('2d');c.scale(2,2);c.translate(-bakePart.left,-bakePart.top);c.scale(bakePart.mirror,1);bakePart.paint(c);}`);
   fs.writeFileSync(path.join(dest,name),sandbox.bakeCanvas.toBuffer('image/png'));
   fs.writeFileSync(path.join(dest,'mid-'+name),p.levels[0].canvas.toBuffer('image/png'));parts.set(p,name);
  }
  entries.push({file:parts.get(p),left:p.left,top:p.top,width:p.width,height:p.height,depth:p.depth});
 }
 const tiny='tiny-'+key+'.png';fs.writeFileSync(path.join(dest,tiny),art.distant.toBuffer('image/png'));
 manifest[key]={parts:entries,tiny};
}
console.log(JSON.stringify(manifest));
