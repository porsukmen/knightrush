const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const a=require('./journey-render-audit.cjs');
a.run('globalThis.layerFar=forestReferenceDistant;');
a.run(require('./fixtures/forest-far-before-layer.cjs'));
a.run('globalThis.exactFar=forestReferenceDistant;startForestCorridor();');
function flush(){a.canvas.toBuffer('image/png');}
const report={images:[],timings:{}};
for(const d of [110,110.3,111,115,116,120,130,384]){
  a.run(`dist=${d};roadScroll=dist;forestReferenceDistant=exactFar;render()`);flush();
  const before=a.canvas.getContext('2d').getImageData(0,0,480,800).data;
  a.run('forestReferenceDistant=layerFar;render()');flush();
  const after=a.canvas.getContext('2d').getImageData(0,0,480,800).data;
  let sum=0,max=0;
  for(let i=0;i<before.length;i+=4)for(let c=0;c<3;c++){const delta=Math.abs(before[i+c]-after[i+c]);sum+=delta;max=Math.max(max,delta);}
  const mean=sum/(480*800*3);assert.ok(mean<.03,'Far layer changed too many pixels');
  report.images.push({d,mean,max});
}
for(const version of ['exactFar','layerFar']){
  const times=[];a.run('dist=110;roadScroll=dist;');
  for(let i=0;i<8;i++){
    const t=performance.now();a.run(`forestReferenceDistant=${version};dist+=.3;roadScroll=dist;render()`);
    times.push(performance.now()-t);flush();
  }
  report.timings[version]={median:times.sort((x,y)=>x-y)[4],max:times[7]};
}
report.cache=a.run('({trees:forestHorizonCache.count,rebuilds:forestHorizonCache.rebuilds,reuses:forestHorizonCache.reuses,bytes:480*64*4})');
fs.writeFileSync(path.join(a.out,'forest-shared-horizon.png'),a.canvas.toBuffer('image/png'));
console.log(JSON.stringify(report));
