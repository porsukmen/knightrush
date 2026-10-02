/* On-demand native 2D renderer for labs/GearLab.html. Never runs in gameplay. */
(()=>{'use strict';
 if(parent===window||BOOT_QUERY.get('gearreview')!=='1')return;
 // Mounted authoring owns its renderer inside this same native engine realm.
 // Load a fixed local bridge, not scripts supplied by a message or parent DOM.
 if(BOOT_QUERY.get('mountedreview')==='1'){
  SFX.setTestMuted(true);paused=true;pausePhotoMode=true;
  const script=document.createElement('script');script.src='labs/mounted-knight-bridge.js';
  script.onerror=()=>parent.postMessage({type:'kr-mounted-error',message:'Atlı lab bağlantısı yüklenemedi.'},'*');
  document.body.append(script);return;
 }
 let surface=document.createElement('canvas');surface.width=960;surface.height=1120;
 let ctx=surface.getContext('2d'),direct=false;
 SFX.setTestMuted(true);paused=true;pausePhotoMode=true;
 let gpu=null,gpuLoading=null,gpuFailure='';
 async function prepareGpu(){
  if(gpu&&!gpu.stats().lost)return gpu;
  if(gpuLoading)return gpuLoading;
  gpuLoading=(async()=>{
   if(!window.KRGearGPU)await new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src='assets/encounters/jonathan-gpu.js';
    script.onload=resolve;script.onerror=()=>reject(Error('GPU denemesi yüklenemedi'));document.body.append(script);
   });
   gpu?.dispose();gpu=KRGearGPU.create(KRJonathanWalk.labMeshes(),message=>{
    gpuFailure=message;parent.postMessage({type:'kr-gear-review-gpu-lost',message},'*');
   });gpuFailure='';return gpu;
  })();
  try{return await gpuLoading;}finally{gpuLoading=null;}
 }
 // Cache native vector commands, never raster sprites. Walking changes the
 // torso transform but not the rigid gear's local geometry/material masks.
 // Keep only the latest angle/visibility. Head clips use exact local bounds:
 // walking can produce a few floating-point variants of the same rigid head.
 // Never round a pose, reuse a different clip, or retain an angle atlas.
 let cacheKey='',cacheUses=0,cachedPasses=new Map();
 const gearSignature=(angle,visible)=>[angle,...['shield','sword','bow','quiver'].map(p=>visible[p]!==false)].join(':');
 const compileGearPaths=KRJonathanWalk.compileGearPaths;
 function cachedGear(key,paint){
  const target=g,hit=cachedPasses.get(key);
  if(hit){for(const [kind,name,args]of hit){if(kind===0)target[name]=args;else target[name](...args);}return;}
  // Record native paint/clip order under the current torso transform.
  const commands=[],methods=new Map();
  const recorder=new Proxy(target,{
   get(ctx,name){
    const value=Reflect.get(ctx,name,ctx);if(typeof value!=='function')return value;
    if(!methods.has(name))methods.set(name,(...args)=>{
     commands.push([1,name,args]);
     return value.apply(ctx,args);
    });
    return methods.get(name);
   },
   set(ctx,name,value){commands.push([0,name,value]);Reflect.set(ctx,name,value,ctx);return true;}
  });
  try{g=recorder;paint();cachedPasses.set(key,compileGearPaths(commands));}finally{g=target;}
 }
 function draw({angle,time,visible={},walking=false,zoom=1,renderer='canvas'},useCache=true){
  const signature=renderer+':'+gearSignature(angle,visible);
  if(cacheKey!==signature){cacheKey=signature;cacheUses=0;cachedPasses.clear();}
  // During a drag every angle is new: don't spend extra time recording a
  // one-use view. Start caching only after the angle is reused.
  useCache=useCache&&++cacheUses>1;
  const equipment=(deg,dir,head)=>{
   if(renderer==='gpu'){
    if(!gpu||gpuFailure)throw Error(gpuFailure||'GPU denemesi henüz hazır değil');
    gpu.draw(g,deg,dir,visible,U,head);return;
   }
   if(!useCache)return KRJonathanWalk.equipment(deg,dir,'body',head);
   const key=head?'head:'+JSON.stringify([head.x,head.half,head.top,head.bottom]):'body';
   if(head&&!cachedPasses.has(key)&&cachedPasses.size>=5){
    // Bounded four-entry FIFO for exact head bounds plus the rigid body pass.
    for(const oldKey of cachedPasses.keys())if(oldKey!=='body'){cachedPasses.delete(oldKey);break;}
   }
   cachedGear(key,()=>KRJonathanWalk.equipment(deg,dir,'body',head));
  };
  const old=g;
  try{
   g=ctx;ctx.setTransform(2,0,0,2,0,0);
   ctx.fillStyle='#1c232c';ctx.fillRect(0,0,480,560);
   ctx.translate(240,280);ctx.scale(zoom,zoom);ctx.translate(-240,-280);
   const p=KRGearPreviewPose.sample(angle,time,walking),x=240,y=492,scale=3.7;
   if(visible.knight!==false){
    ctx.fillStyle='#111820';ctx.beginPath();ctx.ellipse(x,y+8,42,8,0,0,Math.PI*2);ctx.fill();
   }
   const actor=()=>KRJonathanWalk.withEquipmentParts(visible,()=>{
    if(visible.knight!==false){
     KRJonathan.turnDrawing(x,y,scale,{...p,equipment,
      arrows:renderer==='gpu'?undefined:KRJonathanWalk.arrows,harness:KRJonathanWalk.harness,armOccluders:KRJonathanWalk.armOccluders,
      solidTurn:renderer==='gpu'});
    }else{
     const hip=-12+(p.body.y||0);
     g.save();g.translate(x,y);g.scale(scale,scale);
     g.translate((p.body.x||0)*U,hip*U);g.rotate(p.body.lean||0);
     g.translate(0,(-hip+(p.body.y||0))*U);
     equipment(p.degrees,p.direction);g.restore();
    }
   });
   if(renderer==='gpu')gpu.paint(ctx,actor);else actor();
  }finally{g=old;}
 }
 // A single reusable full-resolution frame buffer, not a sprite/pose cache.
 // Stable-angle walking has many nested gear clips: rasterize those locally
 // and upload once, instead of submitting thousands of GPU clipping jobs.
 // One-use turning views keep the original direct path (faster while turning).
 let walkSurface=null,walkContext=null;
 function renderFrame(frame){
  const buffered=frame.renderer!=='gpu'&&direct&&frame.walking&&cacheKey==='canvas:'+gearSignature(frame.angle,frame.visible);
  if(!buffered){draw(frame);return;}
  if(!walkSurface){
   walkSurface=new OffscreenCanvas(surface.width,surface.height);
   // CPU-backed uploads are expensive on touch/mobile profiles. Keep their
   // scratch surface GPU-oriented; desktop retains its measured software path.
   walkContext=walkSurface.getContext('2d',{willReadFrequently:!matchMedia('(pointer:coarse)').matches});
  }
  const output=ctx;
  try{ctx=walkContext;draw(frame);}finally{ctx=output;}
  // draw() clears and redraws the entire current pose, including moving limbs.
  output.setTransform(1,0,0,1,0,0);output.drawImage(walkSurface,0,0);
 }
 let busy=false;
 addEventListener('message',async e=>{
  if(e.source!==parent)return;
  if(e.data?.type==='kr-gear-review-output'&&!direct&&e.data.canvas){
   // Turning draws straight into the transferred canvas. Stable walking can
   // copy its reusable frame buffer here; neither path allocates ImageBitmaps.
   surface=e.data.canvas;ctx=surface.getContext('2d');direct=true;return;
  }
  if(e.data?.type!=='kr-gear-review-render'||busy)return;
  const angle=Number(e.data.angle),time=Number(e.data.time);
  if(!Number.isFinite(angle)||!Number.isFinite(time))return;
  const visible=e.data.visible||{},walking=!!e.data.walking,
   zoom=Math.max(1,Math.min(3,Number(e.data.zoom)||1));
  let renderer=e.data.renderer==='gpu'?'gpu':'canvas',warning='',cpuMs=0;
  busy=true;
  try{
   if(renderer==='gpu')try{await prepareGpu();}catch(error){renderer='canvas';warning=String(error);}
   const start=performance.now();
   try{renderFrame({angle,time,visible,walking,zoom,renderer});}
   catch(error){if(renderer!=='gpu')throw error;renderer='canvas';warning=String(error);renderFrame({angle,time,visible,walking,zoom,renderer});}
   cpuMs=performance.now()-start;
  }catch(error){parent.postMessage({type:'kr-gear-review-error',message:String(error)},'*');busy=false;return;}
  if(direct){
   parent.postMessage({type:'kr-gear-review-frame',angle,zoom,time,walking,visible,renderer,warning,cpuMs},'*');busy=false;return;
  }
  try{
   const bitmap=await createImageBitmap(surface);
   parent.postMessage({type:'kr-gear-review-frame',bitmap,angle,zoom,time,walking,visible,renderer,warning,cpuMs},'*',[bitmap]);
  }catch(error){parent.postMessage({type:'kr-gear-review-error',message:String(error)},'*');}
  finally{busy=false;}
 });
 addEventListener('pagehide',()=>gpu?.dispose());
 window.KRGearReviewRenderer=Object.freeze({kind:'native-2d',width:480,height:560,prepareGpu,
  gpuStats:()=>gpu?.stats()||null,gpuCanvas:()=>gpu?.canvas||null,
  // Manual deterministic lab audits only; never registered in normal gameplay.
  renderForAudit:frame=>renderFrame(frame),finishGpu:()=>gpu?.finish(),
  drawForAudit:(frame,target,useCache=true)=>{const previous=ctx;try{ctx=target;draw(frame,useCache);}finally{ctx=previous;}}});
 parent.postMessage({type:'kr-gear-review-ready'},'*');
})();
