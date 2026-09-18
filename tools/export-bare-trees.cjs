const fs=require('node:fs');
const {run,sandbox,out}=require('./journey-render-audit.cjs');
run(`globalThis.bareSheet=document.createElement('canvas');bareSheet.width=3072;bareSheet.height=2400;
globalThis.bareTrees=[];
{const sheet=bareSheet.getContext('2d');sheet.fillStyle='#152219';sheet.fillRect(0,0,3072,2400);
for(let i=0;i<12;i++){
 const art=forestGiantArt((i+.1)/12,-1),p=art[0],canvas=document.createElement('canvas');
 canvas.width=1024;canvas.height=800;const c=canvas.getContext('2d');
 c.fillStyle='#152219';c.fillRect(0,0,1024,800);
 c.save();c.translate(512,750);c.scale(p.mirror,1);p.paint(c);c.restore();
 c.fillStyle='#ded6b9';c.font='22px sans-serif';c.fillText((i+1)+' · '+forestTreeNames[i],20,785);
 bareTrees.push(canvas);
 sheet.drawImage(canvas,(i%4)*768,Math.floor(i/4)*800+100,768,600);
}}`);
fs.writeFileSync(out+'/agaclar-ciplak-cizim-sablonu.png',sandbox.bareSheet.toBuffer('image/png'));
for(let i=0;i<12;i++)fs.writeFileSync(out+'/agac-ciplak-'+String(i+1).padStart(2,'0')+'.png',sandbox.bareTrees[i].toBuffer('image/png'));
console.log('BARE_TREES_OK: 3072x2400 sheet + 12 individual 1024x800 images');
