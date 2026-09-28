/* Isolated authoring preview. Never loaded by a normal run; no new game art is approved. */
(async()=>{
  'use strict';
  const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(Error(src));document.body.appendChild(s);});
  await load('art-source/gatherer-native-trial/clearing.js');
  await load('assets/encounters/gatherer-scene.js');
  const style=document.createElement('style');style.textContent=`
    html,body{margin:0;overflow:auto;background:#19221d;color:#e7e5d2;font:14px system-ui;position:static;height:auto;touch-action:auto}
    #game{display:none!important} #native-preview{max-width:660px;margin:auto;padding:18px;box-sizing:border-box}
    #native-preview h1{font-size:20px;margin:0 0 4px} #native-preview p{color:#aebbab;margin:4px 0 14px;line-height:1.5}
    #native-preview.comparing{max-width:1160px} #native-panels{display:grid;grid-template-columns:minmax(0,1fr);gap:16px}
    #native-preview.comparing #native-panels{grid-template-columns:repeat(2,minmax(0,1fr))}
    #native-panels figure{margin:0;min-width:0} #native-panels figcaption{margin-bottom:8px;color:#c1caba}
    #native-original{display:none} #native-preview.comparing #native-original{display:block}
    #native-original canvas{display:block;position:static;width:100%;height:auto;image-rendering:auto}
    @media(max-width:650px){#native-preview.comparing #native-panels{grid-template-columns:minmax(0,1fr)}}
    #native-controls{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
    #native-controls button{font:inherit;background:#334739;color:#eee9d3;border:1px solid #78906c;padding:8px 12px;cursor:pointer}
    #native-controls button[aria-pressed=true]{background:#d4c697;color:#293627}
    #native-canvas{display:block;position:static;width:100%;height:auto;image-rendering:auto;transform:none} #native-status{font-size:12px;margin-top:10px}
  `;document.head.appendChild(style);
  const box=document.createElement('main');box.id='native-preview';box.innerHTML=`
    <h1>Mantar açıklığı — parça parça Canvas</h1><p>Orijinalin renkleri ve yerleşimi · Bütün şekillerle sade çizim · Otomatik kopyalama yok</p>
    <nav id="native-controls"><button id="native-actor" aria-pressed="true">Mantar dayı</button><button id="native-motion" aria-pressed="true">Hareket</button><button id="native-light" aria-pressed="true">Sahne ışığı</button><button id="native-gray" aria-pressed="false">Gri ton</button><button id="native-compare" aria-pressed="false">Orijinalle karşılaştır</button></nav>
    <section id="native-panels"><figure><figcaption>CANVAS ÇİZİMİ · PNG kullanılmıyor</figcaption><canvas id="native-canvas" aria-label="Orijinal mantar açıklığının vektör çizimi"></canvas></figure><figure id="native-original"><figcaption>ORİJİNAL · Yalnızca karşılaştırma için PNG</figcaption><canvas id="native-reference"></canvas></figure></section>
    <p id="native-status">Ağaç, kulübe, çatı, kütük ve bitkiler ayrı çizimler · Canlı karakter korunuyor · Asıl oyun değiştirilmedi</p>`;
  document.body.appendChild(box);
  const canvas=box.querySelector('canvas'),ctx=canvas.getContext('2d'),plate=document.createElement('canvas');
  let actor=true,motion=true,lit=true,gray=false,builds=0,draws=0,scale=1,last=0,time=0,comparison=null,comparing=false;
  function rebuild(){
    const width=Math.round(canvas.getBoundingClientRect().width*Math.min(devicePixelRatio||1,2));
    if(canvas.width===width&&builds)return;
    canvas.width=plate.width=width;canvas.height=plate.height=Math.round(width*512/480);scale=width/480;
    const p=plate.getContext('2d');p.setTransform(scale,0,0,scale,0,0);KRGathererNativePlate.draw(p);builds++;draw(time);
  }
  function drawActor(context,t,factor){if(!actor)return;const original=g;context.save();try{g=context;context.setTransform(factor,0,0,factor,0,0);context.translate(245.285,467.554);context.scale(1.2962857,1.2962857);if(lit)KRGathererLighting.draw(t);else drawMushroomGatherer(t);}finally{g=original;context.restore();}}
  function draw(t){
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(plate,0,0);
    drawActor(ctx,t,scale);
    if(comparison&&comparing){const ref=document.getElementById('native-reference');if(ref.width!==canvas.width||ref.height!==canvas.height){ref.width=canvas.width;ref.height=canvas.height;}const rc=ref.getContext('2d');rc.drawImage(comparison,0,0,ref.width,ref.height);drawActor(rc,t,scale);ref.style.filter=gray?'grayscale(1)':'none';}
    draws++;
  }
  const toggle=(id,get,set)=>{const b=document.getElementById(id);b.onclick=()=>{set(!get());b.setAttribute('aria-pressed',String(get()));draw(time);};};
  toggle('native-actor',()=>actor,v=>actor=v);toggle('native-motion',()=>motion,v=>motion=v);
  toggle('native-light',()=>lit,v=>lit=v);toggle('native-gray',()=>gray,v=>{gray=v;canvas.style.filter=v?'grayscale(1)':'none';});
  document.getElementById('native-compare').onclick=async()=>{
    const button=document.getElementById('native-compare');button.disabled=true;
    try{if(!comparison){const image=new Image();image.src='assets/encounters/mushroom-clearing-simple.png';await image.decode();comparison=image;}
      comparing=!comparing;box.classList.toggle('comparing',comparing);button.setAttribute('aria-pressed',String(comparing));rebuild();draw(time);
    }catch(e){document.getElementById('native-status').textContent='Karşılaştırma görseli açılamadı; Canvas çizimi kullanılabilir.';}finally{button.disabled=false;}
  };
  new ResizeObserver(rebuild).observe(canvas);rebuild();
  function tick(now){if(now-last>=1000/30){if(motion&&!document.hidden){time+=Math.min((now-last)/1000,.1);draw(time);}last=now;}requestAnimationFrame(tick);}requestAnimationFrame(tick);
  window.KRGathererNativePreview=Object.freeze({draw,setOptions(o){if(o.actor!==undefined)actor=o.actor;if(o.motion!==undefined)motion=o.motion;if(o.lit!==undefined)lit=o.lit;draw(o.time??time);},report:()=>({builds,draws,width:canvas.width,height:canvas.height,cacheBytes:plate.width*plate.height*4,actor,motion,lit,status:'candidate',rasterBackground:false,comparing,geometry:KRGathererNativePlate.report()})});
  document.documentElement.dataset.gathererNativeReady='1';
})().catch(e=>{console.error(e);document.documentElement.dataset.gathererNativeError=e.message;});
