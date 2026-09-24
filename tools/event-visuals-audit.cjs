const assert=require('node:assert/strict');
const {createManager}=require('../assets/encounters/event-visuals.js');
function rig(options={}){
  const images=[];
  const spec=id=>({standard:{src:id+'.png',width:2,height:2}});
  const catalog={a:spec('a'),b:spec('b'),c:spec('c'),huge:{standard:{src:'huge.png',width:9000,height:9000}}};
  const manager=createManager({catalog,budgetBytes:32,maxEntries:2,...options,createImage:()=>{
    const image={naturalWidth:2,naturalHeight:2,decode:()=>Promise.resolve(),removeAttribute(){this.src='';this.released=true;}};
    images.push(image);return image;
  }});
  return {manager,images,load:async(index=images.length-1)=>{await images[index].onload?.();}};
}
async function audit(){
  {
    const r=rig(),m=r.manager,p=m.prefetch('a');assert.equal(m.prefetch('a'),p);
    assert.equal(r.images.length,1);assert.equal(m.report().reservedBytes,16);
    await r.load();assert.equal(await p,true);assert(m.peek('a'));
    await m.activate('a');const b=m.prefetch('b');await r.load();await b;
    const c=m.prefetch('c');assert(r.images[1].released,'Unpinned LRU should be released');
    assert(m.peek('a'),'Prefetch evicted active plate');await r.load();await c;
    assert.equal(m.report().active,'a');assert.equal(m.report().peakBytes,32);
    const loads=m.report().loads;assert.equal(await m.prefetch('huge'),false);assert.equal(await m.prefetch('unknown'),false);
    assert.equal(m.report().loads,loads);m.clear();assert.equal(m.report().reservedBytes,0);
    assert(r.images.every(i=>i.released));
  }
  {
    const r=rig({maxEntries:1,budgetBytes:16}),m=r.manager,p=m.activate('a');await r.load();await p;
    assert.equal(await m.prefetch('b'),false,'Prefetch should yield to active plate');assert.equal(r.images.length,1);
    const b=m.activate('b');assert.equal(m.peek('a'),null);await r.load();assert(await b);
    assert.equal(m.report().active,'b');m.release('b');assert.equal(m.report().reservedBytes,0);
  }
  {
    const r=rig(),m=r.manager,p=m.prefetch('a'),lateOnload=r.images[0].onload;
    m.clear();assert.equal(await p,false);await lateOnload();assert.equal(m.peek('a'),null);
    const retry=m.activate('a');await r.load();assert(await retry);assert.equal(m.report().active,'a');m.clear();
  }
  {
    const r=rig(),m=r.manager,p=m.activate('a');let finish;
    r.images[0].decode=()=>new Promise(resolve=>{finish=resolve;});
    const loading=r.load();m.release('a');assert.equal(await p,false);
    const next=m.activate('a');await r.load(1);assert(await next);
    finish();await loading;assert.equal(m.report().active,'a','Old decode unpinned the new generation');
    assert.equal(m.peek('a'),r.images[1]);m.clear();
  }
  for(const failure of ['error','decode','dimensions']){
    const r=rig(),p=r.manager.activate('a');
    if(failure==='error')r.images[0].onerror();
    else{if(failure==='decode')r.images[0].decode=()=>Promise.reject(Error('decode'));else r.images[0].naturalWidth=999;await r.load();}
    assert.equal(await p,false);assert.equal(r.manager.report().reservedBytes,0);
    assert.equal(r.manager.describe('a').status,'failed');
    const retry=r.manager.prefetch('a');await r.load();assert(await retry);r.manager.clear();
  }
  {
    const r=rig({timeoutMs:5});assert.equal(await r.manager.prefetch('a'),false);
    assert.equal(r.manager.report().lastFailure.reason,'timeout');assert.equal(r.manager.report().reservedBytes,0);
  }
  {
    const r=rig(),a=r.manager.prefetch('a'),b=r.manager.prefetch('b'),c=r.manager.prefetch('c');
    assert.equal(await a,false,'Loading entries count toward LRU/budget');await r.load(1);await r.load(2);
    assert(await b);assert(await c);assert(r.manager.report().peakBytes<=32);r.manager.clear();
  }
  console.log('EVENT_VISUALS_OK dedupe / reserved budgets / pinned active / LRU / max entries / cancellation / stale decode / retry / errors / timeout');
}
module.exports=audit;
if(require.main===module)audit().catch(error=>{console.error(error);process.exitCode=1;});
