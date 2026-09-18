const assert=require('node:assert/strict');
const a=require('./journey-render-audit.cjs');
const report=[];
for(const [index,lane,action,wantHit] of [[0,1,'none',true],[0,1,'jump',false],[0,0,'none',false],
  [1,0,'duck',false],[1,0,'none',true],[2,1,'jump',false],[2,1,'none',true]]){
  a.run(`{startForestCorridor();forestGPU.enabled=false;globalThis.courseHits=0;
    globalThis.savedDamage=damagePlayer;damagePlayer=()=>{courseHits++};
    const item=forestCorridor.course[${index}];dist=item.z-1;roadScroll=dist;
    for(const p of forestCorridor.course){p.entity.z=p.z-dist;p.entity.prevZ=p.entity.z;}
    player.x=${lane};player.lane=${lane};player.jumpT=${action==='jump'?'jumpDur()/2':'-1'};player.duckT=${action==='duck'?'0':'-1'};
    updateForestCorridor(.1);damagePlayer=savedDamage;}`);
  const hits=a.run('courseHits');assert.equal(hits,wantHit?1:0);
  report.push({index,lane,action,hits});
}
a.run('startForestCorridor();forestGPU.enabled=false;');
const course=a.run('forestCorridor.course');assert.equal(course.length,6);
for(const d of [0,44,92,140]){a.run(`dist=${d};roadScroll=dist;for(const p of forestCorridor.course)p.entity.z=p.z-dist;`);a.shot('course-'+d,'');}
a.run('pendingJourneyPrototype=false;startRun(0)');assert.equal(a.run('forestCorridor'),null);
console.log(JSON.stringify({collisions:report,normalPlayIsolated:true}));
