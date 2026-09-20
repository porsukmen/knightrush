const assert=require('node:assert/strict');
const {run,shot}=require('./journey-render-audit.cjs');
run('SFX.toggle();openTownLab();perfNow=0;');
assert.equal(run('typeof townHouse3D'),'undefined','retired corridor renderer is archived, not active');
const plan=JSON.parse(run('JSON.stringify(TOWN_MARKET_PLAN)'));
for(let i=0;i<plan.length;i++)for(let j=i+1;j<plan.length;j++){
  const a=plan[i],b=plan[j];
  const overlaps=a.x<b.x+b.w&&b.x<a.x+a.w&&a.z<b.z+b.d&&b.z<a.z+a.d;
  assert.equal(overlaps,false,`${a.id} and ${b.id} building footprints intersect`);
}
assert.equal(plan.filter(b=>b.hero).length,2);
// Both doors remain inside their existing interaction regions.
for(const id of ['smith','store']){
  assert.equal(run(`(()=>{const b=TOWN_MARKET_PLAN.find(b=>b.id==='${id}');
    const p=townProject(b.x+b.w*('${id}'==='smith'?.6:.32),1,b.z);
    return pointInRect({x:p[0],y:p[1]},TOWN_PLACES['${id}']);})()`),true,id+' entrance target');
}
assert.equal(run(`(()=>{let labels=0;const original=g.fillText;g.fillText=()=>labels++;
  try{townHangingSign(98,378,'smith');townHangingSign(405,353,'store');return labels;}
  finally{g.fillText=original;}})()`),0,'building signs must be painted emblems without text labels');
const contacts=JSON.parse(run(`JSON.stringify((()=>{
  const original=drawMerchantProp,points=[];
  drawMerchantProp=(item,x,y,scale)=>points.push({item,x,y,scale});
  try{drawTownStoreBackdrop(TOWN_CHAPTERS[0]);return points;}
  finally{drawMerchantProp=original;}
})())`));
assert.equal(contacts.length,8);
for(const {item,y,scale} of contacts){
  const bottom=item.kind==='mystery'?22*Math.cos(.07)+20*Math.sin(.07):
    item.kind==='heal'?22:({flask:22,venom:22,quiver:25,horn:20,bead:26}[item.id]);
  const support=y+bottom*scale;
  assert.ok(Math.min(Math.abs(support-263),Math.abs(support-208))<1e-6,'each item rests on its shelf surface');
}
const state=run('JSON.stringify({gold,dist,loop,visit:townVisit})');
shot('town-market-square','perfNow=0;');
run('perfNow=3;render();');
assert.equal(run('JSON.stringify({gold,dist,loop,visit:townVisit})'),state);
console.log('TOWN_MARKET_ART_OK disjoint authored footprints, two aligned entrances, text-free signs, eight shelf contacts, draw state isolation');
