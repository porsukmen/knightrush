const {run,canvas}=require('./journey-render-audit.cjs');
run(`startForestCorridor();dist=44;roadScroll=dist;render();
  globalThis.closePaints=0;
  for(const art of forestGiantSprites.values())for(const p of art){
    if(p.auditWrapped)continue;p.auditWrapped=true;
    const original=p.paint;p.paint=c=>{closePaints++;original(c)};
  }`);
for(const scale of [1,2]){
  run(`viewScale=${scale};render();closePaints=0`);
  const samples=[];
  for(let i=0;i<6;i++){
    const t=performance.now();run('render()');canvas.toBuffer('image/png');samples.push(performance.now()-t);
  }
  console.log(JSON.stringify({scale,samples:samples.map(x=>Math.round(x)),
    state:run('({closePaints,retained:forestCloseSprites.size})')}));
}
