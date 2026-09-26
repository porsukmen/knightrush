/* Cutscene presentation lifecycle. Gameplay owns dialogue, rewards and input;
   event-visuals owns decoded images. No renderer loop or image cache here. */
(function(root){
  'use strict';
  function createHandler({visuals,loadModule,getAdapter,catalog}){
    if(!visuals||typeof loadModule!=='function'||typeof getAdapter!=='function'||!catalog)throw Error('Invalid cutscene dependencies');
    let epoch=0,current=null,lastError=null,opened=0;
    const specFor=id=>Object.hasOwn(catalog,id)?catalog[id]:null;
    const error=(id,reason)=>{lastError={id,reason};};
    async function adapterFor(id,generation){
      const spec=specFor(id);if(!spec)return null;
      try{
        if(!await loadModule(spec.module,spec.symbol)||generation!==epoch)return null;
        const adapter=getAdapter(spec.symbol);
        if(!adapter||adapter.assetId!==spec.assetId||typeof adapter[spec.drawMethod]!=='function'){
          error(id,'invalid-adapter');return null;
        }
        return adapter;
      }catch{if(generation===epoch)error(id,'module-error');return null;}
    }
    async function prepare(id){
      const spec=specFor(id),generation=epoch;if(!spec)return false;
      if(!await adapterFor(id,generation)||generation!==epoch)return false;
      try{return !!await visuals.prefetch(spec.assetId)&&generation===epoch;}
      catch{if(generation===epoch)error(id,'prefetch-error');return false;}
    }
    function close(owner){
      if(!current||(owner!==undefined&&current.owner!==owner))return false;
      const old=current;current=null;epoch++;
      visuals.release(old.spec.assetId);return true;
    }
    function open(id,owner){
      const spec=specFor(id);
      if(!spec||owner===undefined||owner===null)return Promise.resolve(false);
      if(current?.id===id&&current.owner===owner)return current.pending;
      if(current)close();
      const generation=epoch,s={id,owner,spec,state:'loading',adapter:null,pending:null};
      current=s;opened++;lastError=null;
      s.pending=(async()=>{
        const adapter=await adapterFor(id,generation);
        if(current!==s||generation!==epoch)return false;
        if(!adapter){s.state='fallback';error(id,'module-or-adapter-unavailable');return false;}
        s.adapter=adapter;
        try{
          const ready=await visuals.activate(spec.assetId);
          if(current!==s||generation!==epoch)return false;
          s.state=ready?'ready':'fallback';if(!ready)error(id,'image-unavailable');
          return !!ready;
        }catch{
          if(current===s&&generation===epoch){s.state='fallback';visuals.release(spec.assetId);error(id,'activation-error');}
          return false;
        }
      })();
      return s.pending;
    }
    function ready(id){return !!current&&current.id===id&&current.state==='ready'&&!!visuals.peek(current.spec.assetId);}
    function draw(id,time){
      if(!ready(id))return false;
      const s=current;
      try{return s.adapter[s.spec.drawMethod](time)!==false;}
      catch{
        // Fail once into the caller's native fallback; don't throw every frame.
        s.state='fallback';visuals.release(s.spec.assetId);error(id,'draw-error');return false;
      }
    }
    function reset(){epoch++;current=null;lastError=null;visuals.clear();}
    return Object.freeze({prepare,open,close,reset,draw,
      coversWorld:id=>ready(id)&&current.spec.opaque===true,
      report:()=>({state:current?.state||'idle',scene:current?.id||null,owner:current?.owner??null,
        assetId:current?.spec.assetId||null,opened,lastError})});
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={createHandler};
  else{
    const clearing=new URLSearchParams(root.location.search).get('clearing');
    root.KRCutscenes=createHandler({visuals:root.KREventVisuals,loadModule:root.loadEventVisualModule,
      getAdapter:symbol=>root[symbol],catalog:Object.freeze({
        'royal-shuffle':Object.freeze({module:'assets/encounters/royal-shuffle.js',symbol:'KRRoyalShuffle',
          assetId:'royal-shuffle',drawMethod:'drawCutscene',opaque:true}),
        'tavern-chug':Object.freeze({module:'assets/encounters/tavern-chug.js',symbol:'KRTavernChug',
          assetId:'tavern-chug',drawMethod:'drawCutscene',opaque:true}),
        'tavern-arm':Object.freeze({module:'assets/encounters/tavern-arm.js',symbol:'KRTavernArm',
          assetId:'tavern-arm',drawMethod:'drawCutscene',opaque:true}),
        'duke-bluff':Object.freeze({module:'assets/encounters/duke-bluff.js',symbol:'KRDukeBluff',
          assetId:'duke-bluff',drawMethod:'drawCutscene',opaque:true}),
        'tavern-slide':Object.freeze({module:'assets/encounters/tavern-slide.js',symbol:'KRTavernSlide',
          assetId:'tavern-slide',drawMethod:'drawCutscene',opaque:true}),
        'tavern-games':Object.freeze({module:'assets/encounters/tavern-games.js',symbol:'KRTavernGames',
          assetId:'tavern-games',drawMethod:'drawCutscene',opaque:true}),
        'mossy-inn':Object.freeze({module:'assets/forest/mossy-inn.js',symbol:'KRMossyInn',
          assetId:'mossy-inn',drawMethod:'drawCutscene',opaque:true}),
        'autumn-caravan':Object.freeze({module:'assets/forest/autumn-caravan.js',symbol:'KRAutumnCaravan',
          assetId:'autumn-caravan',drawMethod:'drawCutscene',opaque:true}),
        'treasure-grove':Object.freeze({module:'assets/forest/treasure-road.js',symbol:'KRTreasureRoad',
          assetId:'treasure-grove',drawMethod:'drawCutscene',opaque:true}),
        'basalt-forge':Object.freeze({module:'assets/forest/basalt-forge.js',symbol:'KRBasaltForge',
          assetId:'basalt-forge',drawMethod:'drawCutscene',opaque:true}),
        gatherer:Object.freeze({module:'assets/encounters/gatherer-scene.js',symbol:'KRGathererScene',
          assetId:clearing==='original'?'gatherer-original':clearing==='crisp'?'gatherer':'gatherer-simple',drawMethod:'drawConversation',opaque:true})
      })});
  }
})(globalThis);
