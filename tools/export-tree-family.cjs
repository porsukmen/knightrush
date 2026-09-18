const fs=require('node:fs');
const {run,sandbox,out}=require('./journey-render-audit.cjs');
run(`globalThis.familyExport=document.createElement('canvas');familyExport.width=2048;familyExport.height=2400;
{const c=familyExport.getContext('2d');c.fillStyle='#152219';c.fillRect(0,0,2048,2400);
for(let i=0;i<12;i++){
 const art=forestGiantArt((i+.85)/12,-1),x=(i%4)*512+230,y=Math.floor(i/4)*800+750;
 c.save();c.beginPath();c.rect((i%4)*512,Math.floor(i/4)*800,512,800);c.clip();
 c.translate(x,y);c.scale(.72,.95);
 for(const p of [art[0],...art.slice(2)]){c.save();c.scale(p.mirror,1);p.paint(c);c.restore();}
 c.restore();c.fillStyle='#ded6b9';c.font='19px sans-serif';c.fillText((i+1)+' · '+forestTreeNames[i],(i%4)*512+15,Math.floor(i/4)*800+785);
}}`);
fs.writeFileSync(out+'/tree-family-bark-vines.png',sandbox.familyExport.toBuffer('image/png'));
console.log('FAMILY_EXPORT_OK');
