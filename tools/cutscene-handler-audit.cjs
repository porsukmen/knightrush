const assert=require('node:assert/strict');
const {createHandler}=require('../assets/encounters/cutscene-handler.js');
const {createManager}=require('../assets/encounters/event-visuals.js');
const tick=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
function rig(){
  const images=[],draws=[];
  const visuals=createManager({catalog:{a:{standard:{src:'a.png',width:2,height:2}},b:{standard:{src:'b.png',width:2,height:2}}},
    budgetBytes:32,createImage:()=>{const image={naturalWidth:2,naturalHeight:2,decode:async()=>{},removeAttribute(){this.src='';}};images.push(image);return image;}});
  const catalog={},adapters={};
  for(const id of ['a','b']){
    catalog[id]={module:id+'.js',symbol:id,assetId:id,drawMethod:'draw',opaque:true};
    adapters[id]={assetId:id,draw:t=>{draws.push([id,t]);return true;}};
  }
  let load=async()=>true;
  const handler=createHandler({visuals,catalog,getAdapter:id=>adapters[id],loadModule:(...args)=>load(...args)});
  return {handler,visuals,images,draws,adapters,setLoad:value=>{load=value;},finish:async(i=images.length-1)=>{await images[i].onload?.();}};
}
async function audit(){
  {
    const r=rig(),h=r.handler,p=h.prepare('a');await tick();await r.finish();assert(await p);
    assert.equal(h.report().state,'idle','Prefetch must not open the dialogue');assert.equal(h.draw('a',1),false);
    const open=h.open('a',1);assert.equal(h.open('a',1),open,'Duplicate open recreated a session');
    assert(await open);assert(h.coversWorld('a'));assert.equal(h.coversWorld('b'),false);
    assert(h.draw('a',2.4));assert.deepEqual(r.draws,[['a',2.4]]);assert.equal(r.images.length,1);
    assert.equal(h.close(99),false,'Stale owner closed current scene');assert(h.close(1));
    assert.equal(h.report().state,'idle');assert.equal(r.visuals.report().reservedBytes,0);
    assert.equal(h.close(1),false);assert.equal(await h.open('unknown',2),false);assert.equal(await h.open('a'),false);
  }
  {
    const r=rig(),h=r.handler;let finishModule;
    r.setLoad(()=>new Promise(resolve=>{finishModule=resolve;}));
    const p=h.open('a',1);assert.equal(h.report().state,'loading');assert(!h.coversWorld('a'));
    h.reset();finishModule(true);assert.equal(await p,false);assert.equal(r.images.length,0,'Reset still decoded the image');
  }
  {
    const r=rig(),h=r.handler,a=h.open('a',1);await tick();const late=r.images[0].onload;
    const b=h.open('b',2);await tick();await r.finish(1);assert(await b);await late();assert.equal(await a,false);
    assert.equal(h.report().scene,'b');assert.equal(h.report().owner,2);assert.equal(h.draw('a',0),false);assert(h.draw('b',0));h.reset();
  }
  {
    const r=rig(),h=r.handler;r.setLoad(async()=>false);assert.equal(await h.open('a',1),false);
    assert.equal(h.report().state,'fallback');assert(!h.draw('a',0));assert(!h.coversWorld('a'));assert.equal(r.images.length,0);
    h.reset();r.setLoad(async()=>{throw Error('loader');});assert.equal(await h.open('b',2),false);h.reset();
  }
  {
    const r=rig(),h=r.handler,p=h.open('a',1);await tick();r.images[0].onerror();assert.equal(await p,false);
    assert.equal(h.report().state,'fallback');assert.equal(r.visuals.report().reservedBytes,0);h.reset();
    r.adapters.a.assetId='wrong';assert.equal(await h.open('a',2),false);assert.equal(r.images.length,1);h.reset();
  }
  {
    const r=rig(),h=r.handler,p=h.open('a',1);await tick();await r.finish();await p;
    r.adapters.a.draw=()=>{throw Error('drawing');};assert.equal(h.draw('a',0),false);
    assert.equal(h.report().state,'fallback');assert.equal(h.report().lastError.reason,'draw-error');
    assert.equal(r.visuals.report().reservedBytes,0);assert(!h.coversWorld('a'));h.reset();
  }
  console.log('CUTSCENE_HANDLER_OK prepare/open/ready/fallback/close/reset; duplicate entry; owner guard; scene switch; cancelled module/image; draw failure; release');
}
module.exports=audit;
if(require.main===module)audit().catch(error=>{console.error(error);process.exitCode=1;});
