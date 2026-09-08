const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const a=require('./journey-render-audit.cjs');
const names=['forestReferenceDistant','forestStylizedGround','drawForestCorridor','forestGiantTree'];
a.run('globalThis.newForestFns=['+names.join(',')+'];');
a.run(require('./fixtures/forest-before-scalar.cjs'));
a.run(require('./fixtures/forest-near-before-scalar.cjs'));
a.run('globalThis.oldForestFns=['+names.join(',')+'];startForestCorridor();');
function select(key){a.run(names.map((n,i)=>n+'='+key+'['+i+']').join(';'));}
function flush(){a.canvas.toBuffer('image/png');}
const report={images:[],timings:{}};
for(const d of [0,110,110.3,384]){
  a.run(`dist=${d};roadScroll=dist;`);select('oldForestFns');a.run('render()');flush();
  const before=a.canvas.getContext('2d').getImageData(0,0,480,800).data;
  select('newForestFns');a.run('render()');flush();
  const after=a.canvas.getContext('2d').getImageData(0,0,480,800).data;
  let sum=0,max=0,changed=0;
  for(let i=0;i<before.length;i+=4){let different=false;for(let c=0;c<3;c++){const delta=Math.abs(before[i+c]-after[i+c]);sum+=delta;max=Math.max(max,delta);different ||= delta>0;}changed+=different?1:0;}
  const mean=sum/(480*800*3);assert.ok(mean<.05,'Visible renderer mismatch');
  report.images.push({d,mean,max,changedPercent:changed/(480*800)*100});
}
a.run('dist=110;roadScroll=dist;');
for(const version of ['oldForestFns','newForestFns']){
  select(version);a.run('render()');flush();
  for(const [name,code] of [['full','render()'],['floor','forestStylizedGround()']]){
    const times=[];for(let i=0;i<5;i++){const t=performance.now();a.run(code);times.push(performance.now()-t);flush();}
    report.timings[version+'_'+name]=times.sort((x,y)=>x-y)[2];
  }
}
fs.writeFileSync(path.join(a.out,'forest-scalar-optimized.png'),a.canvas.toBuffer('image/png'));
console.log(JSON.stringify(report));
