const fs=require('node:fs');
const {run,out,sandbox}=require('./journey-render-audit.cjs');
for(const [name,skin] of [['cizgili',0],['parcali',1]]){
  run(`globalThis.barkExport=document.createElement('canvas');
    barkExport.width=2048;barkExport.height=1536;
    {const p=forestGiantArt((8+.1+${skin}*.5)/12,-1)[0],c=barkExport.getContext('2d');
    c.scale(2,2);c.translate(-p.left,-p.top);c.scale(p.mirror,1);p.paint(c);}`);
  fs.writeFileSync(out+'/agac-kabuk-'+name+'-2x.png',sandbox.barkExport.toBuffer('image/png'));
}
console.log('EXPORTED transparent 2048x1536 bark/branch PNGs');
