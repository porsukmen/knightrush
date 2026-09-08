const assert=require('node:assert/strict');
const a=require('./journey-render-audit.cjs');
a.run('globalThis.newGround=forestStylizedGround;');
a.run(require('./fixtures/ground-before-local.cjs'));
a.run('globalThis.oldGround=forestStylizedGround;startForestCorridor();');
function flush(){a.canvas.toBuffer('image/png');}
const report={images:[],timings:{}};
for(const d of [0,110,110.3,384]){
  a.run(`dist=${d};roadScroll=dist;forestStylizedGround=oldGround;render()`);flush();
  const before=a.canvas.getContext('2d').getImageData(0,0,480,800).data;
  a.run('forestStylizedGround=newGround;render()');flush();
  const after=a.canvas.getContext('2d').getImageData(0,0,480,800).data;
  let sum=0;for(let i=0;i<before.length;i++)sum+=Math.abs(before[i]-after[i]);
  assert.equal(sum,0,'Ground image changed');report.images.push({d,difference:sum});
}
for(const version of ['oldGround','newGround']){
  a.run(`dist=110;roadScroll=dist;forestStylizedGround=${version};render()`);flush();
  for(const [name,code] of [['floor','forestStylizedGround()'],['full','render()']]){
    const samples=[];for(let i=0;i<7;i++){const t=performance.now();a.run(code);samples.push(performance.now()-t);flush();}
    report.timings[version+'_'+name]=samples.sort((x,y)=>x-y)[3];
  }
}
console.log(JSON.stringify(report));
