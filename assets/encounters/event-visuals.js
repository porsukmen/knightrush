/* Shared event-plate ownership. No lab code, pixel readbacks or render loop.
   Budgets include loading reservations; browser-owned GPU/decoder copies are
   outside this accounting. Pure factory export supports deterministic tests. */
(function(root){
  'use strict';
  const MiB=1024*1024;
  const assets=Object.freeze({
    'royal-shuffle':Object.freeze({standard:{src:'assets/encounters/royal-shuffle-v1.png',width:1086,height:1448},
      mobile:{src:'assets/encounters/royal-shuffle-v1-mobile.png',width:576,height:768}}),
    'tavern-chug':Object.freeze({standard:{src:'assets/encounters/tavern-chug-v1.png',width:1086,height:1448},
      mobile:{src:'assets/encounters/tavern-chug-v1-mobile.png',width:576,height:768}}),
    'tavern-arm':Object.freeze({standard:{src:'assets/encounters/tavern-arm-v1.png',width:1086,height:1448},
      mobile:{src:'assets/encounters/tavern-arm-v1-mobile.png',width:576,height:768}}),
    'duke-bluff':Object.freeze({standard:{src:'assets/encounters/duke-bluff-v1.png',width:1086,height:1448},
      mobile:{src:'assets/encounters/duke-bluff-v1-mobile.png',width:576,height:768}}),
    'tavern-slide':Object.freeze({standard:{src:'assets/encounters/tavern-slide-v2.png',width:1086,height:1448},
      mobile:{src:'assets/encounters/tavern-slide-v2-mobile.png',width:576,height:768}}),
    'tavern-games':Object.freeze({standard:{src:'assets/encounters/tavern-games-v1.png',width:1086,height:1448},
      mobile:{src:'assets/encounters/tavern-games-v1-mobile.png',width:576,height:768}}),
    'mossy-inn':Object.freeze({standard:{src:'assets/encounters/mossy-inn-v4.png',width:1448,height:1086},
      mobile:{src:'assets/encounters/mossy-inn-v4-mobile.png',width:768,height:576}}),
    'autumn-caravan':Object.freeze({standard:{src:'assets/encounters/autumn-caravan-v1.png',width:1448,height:1086},
      mobile:{src:'assets/encounters/autumn-caravan-v1-mobile.png',width:768,height:576}}),
    'treasure-grove':Object.freeze({standard:{src:'assets/encounters/treasure-grove-v1.png',width:1120,height:1400},
      mobile:{src:'assets/encounters/treasure-grove-v1-mobile.png',width:768,height:960}}),
    'gatherer-simple':Object.freeze({standard:{src:'assets/encounters/mushroom-clearing-simple.png',width:1215,height:1295},
      mobile:{src:'assets/encounters/mushroom-clearing-simple-mobile.png',width:768,height:819}}),
    'basalt-forge':Object.freeze({standard:{src:'assets/encounters/basalt-hearth-v4.png',width:1448,height:1086},
      mobile:{src:'assets/encounters/basalt-hearth-v4-mobile.png',width:768,height:576}}),
    gatherer:Object.freeze({standard:{src:'assets/encounters/mushroom-clearing-crisp.png',width:1215,height:1295},
      mobile:{src:'assets/encounters/mushroom-clearing-crisp-mobile.png',width:768,height:819}}),
    'gatherer-original':Object.freeze({standard:{src:'assets/encounters/mushroom-clearing.png',width:1214,height:1295},
      mobile:{src:'assets/encounters/mushroom-clearing-mobile.png',width:768,height:819}})
  });
  function createManager({catalog=assets,tier='standard',budgetBytes=tier==='mobile'?6*MiB:14*MiB,
    maxEntries=2,createImage=()=>new Image(),timeoutMs=12000}={}){
    if(!Number.isFinite(budgetBytes)||budgetBytes<=0||!Number.isInteger(maxEntries)||maxEntries<1)throw Error('Invalid visual budget');
    const entries=new Map();let active=null,clock=0,loads=0,evictions=0,peakBytes=0,lastFailure=null;
    const specFor=id=>Object.hasOwn(catalog,id)?catalog[id]?.[tier]:null;
    const cost=s=>s&&Number.isSafeInteger(s.width)&&Number.isSafeInteger(s.height)&&s.width>0&&s.height>0?s.width*s.height*4:Infinity;
    const bytes=()=>{let n=0;for(const e of entries.values())n+=e.bytes;return n;};
    function settle(e,value){if(e.resolve){const resolve=e.resolve;e.resolve=null;resolve(value);}}
    function discard(e,reason='evicted'){
      if(entries.get(e.id)!==e)return;
      entries.delete(e.id);if(active===e.id)active=null;
      clearTimeout(e.timer);const image=e.image;e.image=null;
      if(image){image.onload=image.onerror=null;if(typeof image.removeAttribute==='function')image.removeAttribute('src');else image.src='';}
      settle(e,false);if(reason==='evicted')evictions++;
    }
    function fail(e,reason){
      if(entries.get(e.id)!==e)return;
      lastFailure={id:e.id,reason};discard(e,'failed');
    }
    function room(required){
      while(entries.size>=maxEntries||bytes()+required>budgetBytes){
        let victim=null;
        for(const e of entries.values())if(e.id!==active&&(!victim||e.used<victim.used))victim=e;
        if(!victim)return false;discard(victim);
      }
      return true;
    }
    function ensure(id){
      const cached=entries.get(id);
      if(cached){cached.used=++clock;return cached.promise;}
      const spec=specFor(id),required=cost(spec);
      if(!spec||typeof spec.src!=='string'||!Number.isSafeInteger(required)||required>budgetBytes){
        lastFailure={id,reason:'invalid-or-over-budget'};return Promise.resolve(false);
      }
      if(!room(required))return Promise.resolve(false); // Never evict the active scene for a prefetch.
      const e={id,spec,bytes:required,status:'loading',used:++clock,image:null,timer:null,resolve:null};
      e.promise=new Promise(resolve=>{e.resolve=resolve;});entries.set(id,e);
      peakBytes=Math.max(peakBytes,bytes());loads++;lastFailure=null;
      try{
        const image=createImage();e.image=image;image.decoding='async';
        image.onerror=()=>fail(e,'load-error');
        image.onload=async()=>{
          if(entries.get(id)!==e)return;
          // Metadata mismatch is rejected before requesting another decoded copy.
          if(image.naturalWidth!==spec.width||image.naturalHeight!==spec.height){fail(e,'dimensions-mismatch');return;}
          try{
            if(image.decode)await image.decode();
            if(entries.get(id)!==e)return; // A cancelled decode must not resurrect a plate.
            clearTimeout(e.timer);image.onload=image.onerror=null;e.status='ready';settle(e,true);
          }catch{fail(e,'decode-error');}
        };
        e.timer=setTimeout(()=>fail(e,'timeout'),timeoutMs);image.src=spec.src;
      }catch{fail(e,'image-error');}
      return e.promise;
    }
    function activate(id){
      const spec=specFor(id);if(!spec||cost(spec)>budgetBytes)return Promise.resolve(false);
      active=id;const pending=ensure(id);
      if(!entries.has(id)&&active===id)active=null;
      return pending;
    }
    function peek(id){const e=entries.get(id);return e?.status==='ready'?e.image:null;}
    function release(id){const e=entries.get(id);if(e)discard(e,'released');if(active===id)active=null;}
    function clear(){active=null;for(const e of [...entries.values()])discard(e,'cleared');lastFailure=null;}
    function describe(id){const e=entries.get(id),spec=specFor(id);return {id,src:spec?.src,status:e?.status||(lastFailure?.id===id?'failed':'idle'),
      sourcePixels:e?.status==='ready'?[spec.width,spec.height]:null,decodedBytes:e?.status==='ready'?e.bytes:0};}
    return Object.freeze({prefetch:ensure,activate,peek,release,clear,describe,
      report:()=>({tier,budgetBytes,maxEntries,active,loads,evictions,reservedBytes:bytes(),peakBytes,
        decodedBytes:[...entries.values()].reduce((n,e)=>n+(e.status==='ready'?e.bytes:0),0),
        entries:[...entries.values()].map(e=>({id:e.id,status:e.status,bytes:e.bytes,active:e.id===active})),lastFailure,
        memoryScope:'Application-retained/reserved RGBA estimates only; excludes browser/GPU/main canvas.'})});
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={createManager,assets};
  else{
    root.KREventVisualsFactory=createManager;
    root.KREventVisuals=createManager({tier:typeof LOW_POWER!=='undefined'&&LOW_POWER?'mobile':'standard'});
  }
})(globalThis);
