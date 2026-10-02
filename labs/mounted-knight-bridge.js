/* File-safe mounted authoring transport. Loaded only by the local gear engine
 * with mountedreview=1; the native model/rig/rendering code stays unchanged. */
(()=>{'use strict';
 if(parent===window||BOOT_QUERY.get('gearreview')!=='1'||BOOT_QUERY.get('mountedreview')!=='1')return;
 const fileOrigin=location.protocol==='file:'||location.origin==='null',
  targetOrigin=fileOrigin?'*':location.origin;
 let renderer=null,surface=null,ctx=null,direct=false,busy=false,disposed=false;
 const post=(message,transfer=[])=>parent.postMessage(message,targetOrigin,transfer);
 const fail=(error,id)=>post({type:'kr-mounted-error',id,message:String(error?.message||error)});
 const resize=m=>{const width=Number.isSafeInteger(m.width)?Math.max(1,Math.min(3500,m.width)):960,height=Number.isSafeInteger(m.height)?Math.max(1,Math.min(4096,m.height)):1120;if(surface.width!==width||surface.height!==height){surface.width=width;surface.height=height;}};
 const validState=value=>{
  if(!value||!['angle','time','zoom'].every(key=>Number.isFinite(value[key]))||
   !['idle','walk','trot','gallop'].includes(value.motion))throw Error('Geçersiz atlı lab pozu.');
   const action=value.action??'none';if(!['none','sword','duck','jump','bash','parry','bow'].includes(action))throw Error('Geçersiz knight aksiyonu.');
   return {angle:(value.angle%360+360)%360,time:Math.max(0,value.time),action,
   zoom:Math.max(.7,Math.min(2.5,value.zoom)),motion:value.motion,
   visible:Object.fromEntries(['knight','horse','shield','sword','bow','quiver'].map(key=>[key,value.visible?.[key]!==false]))};
 };
 addEventListener('message',async e=>{
  if(e.source!==parent||(fileOrigin?e.origin!=='null':e.origin!==targetOrigin)||disposed)return;
  const m=e.data;if(!m||typeof m!=='object')return;
  if(m.type==='kr-mounted-dispose'){disposed=true;renderer?.dispose();return;}
  if(m.type==='kr-mounted-init'){
   if(!renderer||surface)return;
   try{
    direct=typeof OffscreenCanvas==='function'&&m.canvas instanceof OffscreenCanvas;
    surface=direct?m.canvas:document.createElement('canvas');
    resize(m);ctx=surface.getContext('2d');
    if(!ctx)throw Error('Atlı lab çizim yüzeyi açılamadı.');
    post({type:'kr-mounted-initialized',transport:direct?'direct':'bitmap',stats:renderer.stats()});
   }catch(error){fail(error);}
   return;
  }
  if(!['kr-mounted-render','kr-mounted-inspect'].includes(m.type)||!Number.isSafeInteger(m.id)||m.id<1||!ctx||busy)return;
  busy=true;
  try{
   const state=validState(m.state);
   if(m.type==='kr-mounted-inspect'){
    post({type:'kr-mounted-result',id:m.id,inspection:renderer.inspect(state)});return;
   }
   await renderer.prepareState(state);if(disposed)return;
   resize(m);const start=performance.now();renderer.draw(ctx,state);
   const response={type:'kr-mounted-result',id:m.id,state,cpuMs:performance.now()-start,stats:renderer.stats()};
   if(direct)post(response);
   else{
    const bitmap=await createImageBitmap(surface);
    if(disposed)bitmap.close();else post({...response,bitmap},[bitmap]);
   }
  }catch(error){fail(error,m.id);}
  finally{busy=false;}
 });
 (async()=>{
  for(const name of ['mounted-knight-rig.js','mounted-horse-gpu.js','mounted-horse-saddle.js','mounted-knight-sword.js','mounted-knight-shield.js','mounted-knight-bow.js','mounted-knight-duck.js','mounted-knight-jump.js','mounted-knight-action-gpu.js','mounted-knight-renderer.js']){
   await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='labs/'+name;
    script.onload=resolve;script.onerror=()=>reject(Error(name+' yüklenemedi.'));document.body.append(script);});
  }
  if(disposed)return;renderer=window.KRMountedReview;await renderer.prepare();
  if(!disposed)post({type:'kr-mounted-ready'});
 })().catch(error=>fail(error));
 addEventListener('pagehide',()=>{disposed=true;renderer?.dispose();});
})();
