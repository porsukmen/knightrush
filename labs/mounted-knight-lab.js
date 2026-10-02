/* Local authoring only. Reuses the paused Gear Lab engine, never game state. */
(()=>{'use strict';
 const $=id=>document.getElementById(id),scene=$('scene'),engine=$('engine'),
  direct=typeof scene.transferControlToOffscreen==='function'&&typeof OffscreenCanvas==='function'&&new URLSearchParams(location.search).get('transport')!=='bitmap',
  ctx=direct?null:scene.getContext('2d'),fileOrigin=location.protocol==='file:'||location.origin==='null',targetOrigin=fileOrigin?'*':location.origin;
 const state={angle:180,zoom:1,time:0,speed:1,motion:'idle',action:'none',playing:true,rotate:false,
  visible:{knight:true,horse:true,shield:true,sword:true,bow:true,quiver:true}};
 let ready=false,initializing=false,last=0,next=0,dirty=true,drag=null,frames=0,elapsed=0,uiTick=0,error='',
  revision=0,sequence=0,inflight=null,gpuStats=null,shown=null,transport=null,parryInput=null,parrySource=null;
 const shieldInput=KRMountedShieldInput;
 const resolution=()=>{const rect=scene.getBoundingClientRect(),width=Math.max(1,Math.ceil(Math.min(rect.width,rect.height*480/560)*(devicePixelRatio||1)));return {width:Math.min(3500,width),height:Math.round(Math.min(3500,width)*560/480)};};
 const requests=[];
 for(const b of document.querySelectorAll('button')){b.disabled=true;const c=document.createElement('canvas');c.setAttribute('aria-hidden','true');b.append(c);}
 const wrap=n=>(n%360+360)%360;
 // Four .84s trot cycles; walk/idle retain their existing 2.4s authoring loop.
 const duration=()=>state.action==='bow'?5.8:state.action==='bash'?2.76:state.action==='parry'?3.26:state.action==='jump'?2.16:state.action==='duck'?1.5:state.action==='sword'?3.34:state.motion==='trot'?3.36:2.4;
 function buttons(){for(const b of document.querySelectorAll('button')){
  const selected=b.dataset.angle!==undefined?Math.abs(state.angle-Number(b.dataset.angle))<.5:b.dataset.motion?state.motion===b.dataset.motion:b.dataset.action?state.action===b.dataset.action:b.dataset.part?state.visible[b.dataset.part]:b.id==='rotate'?state.rotate:b.id==='play'?state.playing:false;
  b.setAttribute('aria-pressed',String(selected));const c=b.querySelector('canvas'),w=b.clientWidth||130;
  c.width=w*2;c.height=92;const g=c.getContext('2d');g.scale(2,2);
  KRUI.button(g,{x:0,y:0,w,h:42},b.querySelector('.sr').textContent,'treasure',{variant:'secondary',selected,enabled:!b.disabled,size:13,focus:b.matches(':focus-visible')});
 }}
 function controls(paint=true){$('time').max=duration();for(const name of ['angle','zoom','time','speed'])$(name).value=state[name];
  $('angle-value').value=Math.round(state.angle)+'°';$('zoom-value').value=state.zoom.toFixed(1)+'×';$('speed-value').value=state.speed.toFixed(1)+'×';$('time-value').value=state.time.toFixed(3)+' s';
  $('play').querySelector('.sr').textContent=state.playing?'Duraklat':'Oynat';if(paint)buttons();
 }
 function paper(){const p=document.querySelector('.panel'),c=p.querySelector('.paper');c.width=p.clientWidth*2;c.height=p.clientHeight*2;const g=c.getContext('2d');g.scale(2,2);KRUI.sheet(g,{x:0,y:0,w:p.clientWidth,h:p.clientHeight-4});buttons();}
 new ResizeObserver(paper).observe(document.querySelector('.panel'));
 new ResizeObserver(()=>{dirty=true;revision++;}).observe(scene);
 function set(p){if(p.action!==undefined&&!['none','sword','duck','jump','bash','parry','bow'].includes(p.action))throw Error('Geçersiz knight aksiyonu.');
  if(['action','motion','time','playing'].some(k=>p[k]!==undefined)){parryInput=null;parrySource=null;}
  // Jump is one extended gallop stride, not an independent standing action.
  if(p.action==='jump')p={...p,motion:'gallop'};
  else if(p.motion&&p.motion!=='gallop'&&state.action==='jump')p={...p,action:'none'};
  Object.assign(state,p);state.angle=wrap(state.angle);state.zoom=Math.max(.7,Math.min(2.5,state.zoom));state.time=Math.max(0,Math.min(duration(),state.time));revision++;dirty=true;controls();}
 for(const name of ['angle','zoom','time','speed'])$(name).oninput=e=>set({[name]:Number(e.target.value),...(name==='time'?{playing:false}:{})});
 for(const b of document.querySelectorAll('[data-angle]'))b.onclick=()=>set({angle:Number(b.dataset.angle),rotate:false});
 for(const b of document.querySelectorAll('[data-motion]'))b.onclick=()=>set({motion:b.dataset.motion,time:0});
 for(const b of document.querySelectorAll('[data-action]'))if(b.dataset.action!=='parry')b.onclick=()=>set({action:b.dataset.action,time:0,playing:b.dataset.action!=='none'});
 const parryButton=document.querySelector('[data-action="parry"]');
 function pressParry(source){if(!ready||error||parryInput)return false;set({action:'parry',time:0,playing:true});parryInput=shieldInput.begin();parrySource=source;return true;}
 function releaseParry(source){if(!parryInput||(source!==undefined&&source!==parrySource))return;parrySource=null;shieldInput.release(parryInput);state.time=parryInput.time;revision++;dirty=true;controls();}
 parryButton.style.touchAction='none';
 parryButton.onpointerdown=e=>{if(e.button!==0||!e.isPrimary)return;if(pressParry(e.pointerId)){parryButton.setPointerCapture(e.pointerId);e.preventDefault();parryButton.focus({preventScroll:true});}};
 parryButton.onpointerup=parryButton.onpointercancel=parryButton.onlostpointercapture=e=>releaseParry(e.pointerId);
 parryButton.onkeydown=e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();if(!e.repeat)pressParry(e.code);}};
 addEventListener('keyup',e=>{if(e.code==='Space'||e.code==='Enter')releaseParry(e.code);});
 // Assistive/programmatic click has no down/up pair: treat it as a short tap.
 parryButton.onclick=e=>{if(e.detail===0&&pressParry('click'))releaseParry('click');};
 parryButton.oncontextmenu=e=>e.preventDefault();
 addEventListener('blur',()=>releaseParry());
 for(const b of document.querySelectorAll('[data-part]'))b.onclick=()=>{state.visible[b.dataset.part]=!state.visible[b.dataset.part];set({});};
 $('play').onclick=()=>set({playing:!state.playing});$('rotate').onclick=()=>set({rotate:!state.rotate});$('step').onclick=()=>set({playing:false,time:(state.time+1/60)%duration()});$('reset').onclick=()=>set({time:0});
 scene.onpointerdown=e=>{if(!ready)return;drag={x:e.clientX,angle:state.angle};scene.setPointerCapture(e.pointerId);set({rotate:false});};
 scene.onpointermove=e=>{if(drag)set({angle:drag.angle+(e.clientX-drag.x)*.65});};scene.onpointerup=scene.onpointercancel=()=>{drag=null;};
 scene.addEventListener('wheel',e=>{e.preventDefault();set({zoom:state.zoom+(e.deltaY<0?.1:-.1)});},{passive:false});
 addEventListener('keydown',e=>{if(!ready||e.target.tagName==='INPUT'||e.target.tagName==='BUTTON')return;if(e.code==='Space'){e.preventDefault();$('play').click();}if(e.key==='.')$('step').click();if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();set({angle:state.angle+(e.key==='ArrowRight'?1:-1)*(e.shiftKey?1:5),rotate:false});}});
 function rejectPending(reason){if(inflight){clearTimeout(inflight.timer);inflight.reject?.(reason);inflight=null;}for(const job of requests)job.reject(reason);requests.length=0;}
 function fail(e){error=String(e);$('status').classList.add('error');$('status').textContent='Lab açılamadı: '+error;state.playing=false;rejectPending(Error(error));}
 const post=(message,transfer=[])=>engine.contentWindow.postMessage(message,targetOrigin,transfer);
 function send(job){
  inflight=job;
  if(job.operation==='render'&&job.revision===revision)dirty=false;
  job.timer=setTimeout(()=>fail('Çizim motoru yanıt vermedi. Sayfayı yenile.'),15000);
  try{post({type:'kr-mounted-'+job.operation,id:job.id,state:job.state,...resolution()});}catch(e){fail(e);}
 }
 // Never queue animation frames. Only explicit audit calls are queued; live
 // input/clock changes coalesce into the newest pose after the current ACK.
 function drain(){if(ready&&!error&&!inflight&&requests.length)send(requests.shift());}
 function request(operation){
  if(!ready||error)return Promise.reject(Error(error||'Atlı lab henüz hazır değil.'));
  if(requests.length>=64)return Promise.reject(Error('Çok fazla bekleyen lab isteği.'));
  return new Promise((resolve,reject)=>{requests.push({id:++sequence,operation,state:structuredClone(state),revision,resolve,reject});drain();});
 }
 addEventListener('message',e=>{
  if(e.source!==engine.contentWindow||(fileOrigin?e.origin!=='null':e.origin!==targetOrigin))return;
  const m=e.data;if(!m||typeof m!=='object')return;
  if(m.type==='kr-mounted-ready'&&!initializing&&!ready){
   initializing=true;
   try{if(direct){const canvas=scene.transferControlToOffscreen();post({type:'kr-mounted-init',canvas,...resolution()},[canvas]);}
    else post({type:'kr-mounted-init',...resolution()});
   }catch(e){fail(e);}
  }else if(m.type==='kr-mounted-initialized'&&initializing&&!ready){
   gpuStats=m.stats;transport=m.transport;ready=true;clearTimeout(bootTimeout);
   for(const element of document.querySelectorAll('button,input'))element.disabled=false;
   controls();dirty=true;
  }else if(m.type==='kr-mounted-result'){
   const job=inflight;if(!job||m.id!==job.id){m.bitmap?.close();return;}
   clearTimeout(job.timer);inflight=null;
   try{
    if(job.operation==='render'){
     if(m.bitmap){try{if(scene.width!==m.bitmap.width||scene.height!==m.bitmap.height){scene.width=m.bitmap.width;scene.height=m.bitmap.height;}ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(m.bitmap,0,0);}finally{m.bitmap.close();}}
     gpuStats=m.stats;shown=m.state;frames++;elapsed+=m.cpuMs;
     const now=performance.now();
     if(now-uiTick>250||!state.playing){controls(false);$('status').textContent='GPU · '+(elapsed/frames).toFixed(1)+' ms çizim / kare · '+shown.motion+(shown.action==='bow'?' · bow shoot':shown.action==='bash'?' · shield bash':shown.action==='parry'?' · parry':shown.action==='sword'?' · kılıç':shown.action==='duck'?' · duck':shown.action==='jump'?' · zıplama':'')+'\nYerel prototip · gerçek telefon FPS testi değil';uiTick=now;}
    }
    job.resolve?.(job.operation==='inspect'?m.inspection:m.stats);
   }catch(e){job.reject?.(e);fail(e);}
   drain();
  }else if(m.type==='kr-mounted-error'){if(m.id!==undefined&&m.id!==inflight?.id)return;fail(m.message);}
 });
 function tick(now){requestAnimationFrame(tick);if(document.hidden||!ready||error){last=0;return;}const dt=last?Math.min(.05,(now-last)/1000):0;last=now;
  if(state.playing){
   if(parryInput){const phase=parryInput.phase;shieldInput.advance(parryInput,dt*state.speed);state.time=parryInput.time;if(parryInput.phase!==phase)controls(false);if(parryInput.phase==='done'){parryInput=null;parrySource=null;state.playing=false;controls();}}
   else state.time=(state.time+dt*state.speed*(state.action==='bow'?2.2:state.action==='parry'||state.action==='bash'?shieldInput.rate:1))%duration();
   revision++;dirty=true;
  }if(state.rotate){state.angle=wrap(state.angle+dt*24);revision++;dirty=true;}
  if(!dirty||inflight||requests.length||now<next)return;next=now+1000/60-.8;
  send({id:++sequence,operation:'render',state:structuredClone(state),revision});
 }
 // Audit calls are asynchronous across the engine boundary. render() resolves
 // after drawing, not after the browser presents a transferred canvas frame.
 window.KRMountedLab={set,state:()=>structuredClone(state),parryInput:()=>parryInput?structuredClone(parryInput):null,ready:()=>ready,render:()=>request('render'),inspect:()=>request('inspect'),stats:()=>gpuStats,
  connection:()=>({transport,inflight:!!inflight,pending:requests.length,shown:shown?structuredClone(shown):null})};
 engine.src='KnightRush.html?swordlab=1&animation=model-walk&gearreview=1&mountedreview=1';requestAnimationFrame(tick);controls();
 const bootTimeout=setTimeout(()=>{if(!ready&&!error)fail('Knight yüklenemedi. Labı proje klasöründen açıp sayfayı yenile.');},45000);
 document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden)releaseParry();});
 addEventListener('pagehide',()=>{clearTimeout(bootTimeout);post({type:'kr-mounted-dispose'});rejectPending(Error('Lab kapatıldı.'));});
})();
