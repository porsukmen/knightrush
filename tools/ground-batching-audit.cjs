/* Bounded native diagnostic. Flush/discard each frame; never retain video frames. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const a=require('./journey-render-audit.cjs');
a.run('globalThis.previousGround='+require('./fixtures/ground-before-batching.cjs')+';globalThis.optimizedGround=forestStylizedGround;startForestCorridor();dist=110;roadScroll=dist;');
function flush(){a.canvas.toBuffer('image/png');}
function pixels(){return a.canvas.getContext('2d').getImageData(0,0,480,800).data;}
a.run('forestStylizedGround=previousGround;render()');flush();const before=pixels();
a.run('forestStylizedGround=optimizedGround;render()');flush();const after=pixels();
let changed=0,total=0,max=0;
for(let i=0;i<before.length;i+=4){let d=0;for(let c=0;c<3;c++){const delta=Math.abs(before[i+c]-after[i+c]);d+=delta;max=Math.max(max,delta);}if(d>0)changed++;total+=d;}
const report={difference:{changedPercent:changed/(480*800)*100,meanChannelError:total/(480*800*3),maxChannelError:max},timings:{}};
assert.ok(report.difference.meanChannelError<1,'Unexpected visible redesign');
for(const [name,code] of [['oldFull','forestStylizedGround=previousGround;render()'],['newFull','forestStylizedGround=optimizedGround;render()'],['newGround','optimizedGround()']]){
  const times=[];for(let i=0;i<5;i++){const t=performance.now();a.run(code);times.push(performance.now()-t);flush();}
  report.timings[name]=times.sort((x,y)=>x-y)[2];
}
a.run('forestStylizedGround=optimizedGround');
const moving=[];
for(let i=0;i<5;i++){
  const t=performance.now();a.run('dist+=2.1;roadScroll=dist;forestWorldFrame.camera=forestCamera();optimizedGround()');
  moving.push(performance.now()-t);flush();
}
report.timings.movingGroundMedian=moving.sort((x,y)=>x-y)[2];
report.timings.movingGroundMax=moving[4];
const row=a.run('JSON.stringify(forestGroundRow(55).map(a=>Array.from(a)))');
const stones=a.run('JSON.stringify(forestGroundRow(55).shards.map(a=>Array.from(a)))');
for(const distance of [0,110,220,384,110]){
  a.run(`dist=${distance};roadScroll=dist;forestWorldFrame.camera=forestCamera();optimizedGround()`);flush();
  assert.ok(a.run('forestGroundRows.size')<=129,'Cache grew beyond sliding window');
}
assert.equal(a.run('JSON.stringify(forestGroundRow(55).map(a=>Array.from(a)))'),row,'Replay changed particle placement');
assert.equal(a.run('JSON.stringify(forestGroundRow(55).shards.map(a=>Array.from(a)))'),stones,'Replay changed stone placement');
report.stones=a.run('({count:[...forestGroundRows.values()].filter(row=>row.shards.length).length,bytes:[...forestGroundRows.values()].reduce((n,row)=>n+row.shards.reduce((m,a)=>m+a.byteLength,0),0)})');
report.cache=a.run('({rows:forestGroundRows.size,bytes:[...forestGroundRows.values()].reduce((n,row)=>n+row.reduce((m,a)=>m+a.byteLength,0),0)})');
a.run('dist=110;roadScroll=dist;render()');
fs.writeFileSync(path.join(a.out,'swamp-ground-optimized.png'),a.canvas.toBuffer('image/png'));
report.rssMB=process.memoryUsage().rss/1048576;
console.log(JSON.stringify(report));
