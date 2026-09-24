/* Authoring only. Actual game renderers, not a second copy of the scene. */
(()=>{
  'use strict';
  const candidate={id:'gatherer-clearing-v1',status:'rejected',title:"The Gatherer's Clearing — rejected v1 archive",
    premise:'A worried father works outside his small forest home. The harvest is not enough.',
    hotspots:[
      {id:'home',name:'An occupied home',rect:[72,274,34,37],text:'A warm window, drawn curtains and a bowl on the sill. Someone is being cared for inside.'},
      {id:'rack',name:'An almost empty drying rack',rect:[49,343,72,48],text:'Only a few caps remain. The gaps on the rack explain why the gatherer needs help.'},
      {id:'bench',name:'The sorting bench',rect:[73,363,95,37],text:'A cloth, a paring knife and trimmed stems. This is a working clearing, not a roadside display.'},
      {id:'log',name:'A damp fallen birch',rect:[327,356,115,80],text:'Moss and mushrooms follow the damp side of the bark. The cut end shows the log has thickness.'}
    ]};
  const opts={character:true,dialogue:false,foreground:true,ambient:true,guides:false,hotspots:false,values:false,variant:'candidate',frame:'tall',playing:true};
  let clock=2.4,last=0,samples=0,lastSample=-1,failures=[],cache=null,cacheBuilds=0;
  const css=document.createElement('style');css.textContent=`
    html,body{height:auto!important;overflow:auto!important;position:static!important;touch-action:auto!important;background:#121c20;color:#dfdfcf;font:14px/1.5 system-ui,sans-serif;user-select:text!important}
    #game,#safe{display:none!important}*{box-sizing:border-box}#bg-root{max-width:1280px;margin:auto;padding:24px}#bg-root h1{font-size:28px;margin:2px 0 6px}#bg-root p{color:#b8c6ba;margin:0 0 14px}.bg-kicker{font-size:11px;letter-spacing:.16em;color:#d9b27a}.bg-controls{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:18px 0;padding:14px;background:#1e2c30;border:1px solid #41534e}.bg-controls label{display:flex;gap:5px;align-items:center}button,select,input{font:inherit}button,select{background:#29433f;border:1px solid #647b67;color:#eee3c8;padding:7px 10px;cursor:pointer}a{color:#b9d7bd}.bg-layout{display:grid;grid-template-columns:minmax(0,640px) minmax(230px,1fr);gap:26px;align-items:start}#bg-canvas{position:static!important;display:block;width:100%;height:auto;max-height:82vh;object-fit:contain;background:#101b19;cursor:crosshair;touch-action:pan-y}#bg-stage{background:#0c1518;border:1px solid #576c54}#bg-inspect{padding:16px;border:1px solid #6b7759;background:#23352e;min-height:130px}.bg-aside h2{font-size:17px;color:#e4c58e}.bg-aside button{display:block;width:100%;text-align:left;margin:6px 0}.bg-aside img{max-width:100%;max-height:360px;object-fit:contain}#bg-status{margin-bottom:16px;color:#bdd2b2}#bg-errors{color:#ffad98;white-space:pre-wrap}#bg-time{min-width:45px}#bg-scrub{width:120px}details{margin:20px 0}.bg-caption{padding:9px 13px;font-size:12px;color:#bbcbbd}@media(max-width:760px){#bg-root{padding:12px}.bg-layout{grid-template-columns:1fr}#bg-canvas{max-height:none}.bg-controls{gap:8px;font-size:12px}#bg-root h1{font-size:24px}}
  `;document.head.appendChild(css);
  const root=document.createElement('main');root.id='bg-root';root.innerHTML=`
    <div class="bg-kicker">KNIGHT RUSH / ENVIRONMENT WORKSHOP / REJECTED V1 — NOT A REFERENCE</div>
    <h1>${candidate.title}</h1><p>${candidate.premise}</p>
    <div class="bg-controls">
      <button id="bg-play">Pause</button><input id="bg-scrub" aria-label="Scene time" type="range" min="0" max="12" step=".01" value="2.4"><output id="bg-time">2.40s</output>
      <label>Version <select id="bg-variant"><option value="candidate">New clearing</option><option value="legacy">Previous background</option></select></label>
      <label>Frame <select id="bg-frame"><option value="tall">Tall phone · 480 × 1040</option><option value="compact">Game · 480 × 800</option></select></label>
      ${[['character','Character'],['dialogue','Actual dialogue UI'],['foreground','Foreground'],['ambient','Smoke'],['values','Grayscale'],['hotspots','Inspection areas'],['guides','Layout guides']].map(([id,name])=>`<label><input type="checkbox" id="bg-${id}" ${opts[id]?'checked':''}>${name}</label>`).join('')}
      <button id="bg-reset">Reset checks</button><button id="bg-export">Export report</button>
    </div><div id="bg-status" role="status" aria-live="polite"></div>
    <div class="bg-layout"><section id="bg-stage"><canvas id="bg-canvas" aria-label="Gatherer's clearing scene preview"></canvas><div class="bg-caption">Same renderer as the mushroom encounter. Click a scene detail to inspect its story. No quest changes.</div></section>
    <aside class="bg-aside"><div id="bg-inspect" aria-live="polite"><strong>Look around</strong><p>Select the window, drying rack, workbench or fallen log. Inspection is a lab prototype, not a new quest mechanic.</p></div>
    <h2>Story details</h2><div id="bg-locations"></div>
    <h2>Review gates</h2><p>1. Space: supported objects, clear path, consistent scale.<br>2. Atmosphere: readable focal point, distinct material planes.<br>3. Integration: character, dialogue and phone framing.</p>
    <p>This environment was rejected for perspective, scale, color and background design. Technical checks do not reverse that decision. <a href="KnightRush.html?backgroundlab=1">Open the Blender layout revision →</a></p>
    <details><summary>Approved character anchors</summary><p>Reference characters only; their old backgrounds are not the target.</p><img src="art-source/knight-rush-sharp-plane/approved-mushroom-gatherer.png" alt="Approved Mushroom Gatherer"><img src="art-source/knight-rush-sharp-plane/approved-wagon-merchant.png" alt="Approved merchant material and detail reference"></details>
    <a href="KnightRush.html?artlab=1">Character Art Lab</a> · <a href="KnightRush.html?roadlab=1">Road Lab</a><pre id="bg-errors"></pre></aside></div>`;
  document.body.appendChild(root);
  const $=id=>document.getElementById('bg-'+id),canvas=$('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
  const state=()=>JSON.stringify({mode,gold,scrap,dist,loop,hp:player.hp,relics,quest:journeyMushroomQuest,session:journeyRoadEventSession?.token});
  const remember=message=>{if(!failures.includes(message))failures.push(message);};
  function invoke(target,fn,pad){
    const saved={g,perfNow,PAD_TOP,PAD_BOT,PAD_TOT,uiTop};let depth=0;
    const guard=new Proxy(target,{get(obj,key){
      const value=obj[key];if(typeof value!=='function')return value;
      return (...args)=>{
        for(const arg of args)if(typeof arg==='number'&&!Number.isFinite(arg))throw Error('Non-finite '+key);
        if(key==='save')depth++;if(key==='restore'&&--depth<0)throw Error('Unbalanced restore');
        return value.apply(obj,args);
      };
    },set(obj,key,value){if(typeof value==='number'&&!Number.isFinite(value))throw Error('Non-finite '+key);obj[key]=value;return true;}});
    target.save();
    try{
      g=guard;perfNow=clock;PAD_TOP=PAD_BOT=pad;PAD_TOT=pad*2;uiTop=-pad+10;
      const matrix=target.getTransform(),alpha=target.globalAlpha,composite=target.globalCompositeOperation;
      fn();
      if(depth!==0)throw Error('Unbalanced save / restore');
      const after=target.getTransform();if(['a','b','c','d','e','f'].some(k=>after[k]!==matrix[k])||target.globalAlpha!==alpha||target.globalCompositeOperation!==composite)throw Error('Leaked drawing state');
    }finally{
      while(depth>0){target.restore();depth--;}
      target.restore();g=saved.g;perfNow=saved.perfNow;PAD_TOP=saved.PAD_TOP;PAD_BOT=saved.PAD_BOT;PAD_TOT=saved.PAD_TOT;uiTop=saved.uiTop;
    }
  }
  function inspect(id){
    const h=candidate.hotspots.find(h=>h.id===id);if(!h)return false;
    $('inspect').replaceChildren();const title=document.createElement('strong'),p=document.createElement('p');title.textContent=h.name;p.textContent=h.text;$('inspect').append(title,p);return true;
  }
  for(const h of candidate.hotspots){const b=document.createElement('button');b.textContent=h.name;b.onclick=()=>inspect(h.id);$('locations').appendChild(b);}
  function renderAt(t=clock,sample=true){
    clock=Math.max(0,Number(t)||0);const before=state(),height=opts.frame==='tall'?1040:800,pad=(height-800)/2,dpr=Math.min(2,devicePixelRatio||1);
    const key=[height,dpr,opts.variant].join(':');
    try{
      if(!cache||cache.key!==key){
        const backing=document.createElement('canvas');backing.width=480*dpr;backing.height=height*dpr;
        const bg=backing.getContext('2d');bg.setTransform(dpr,0,0,dpr,0,pad*dpr);
        invoke(bg,()=>drawRoadsideSceneStatic('mushrooms',opts.variant),pad);
        cache={key,backing};cacheBuilds++;
      }
      if(canvas.width!==480*dpr||canvas.height!==height*dpr){canvas.width=480*dpr;canvas.height=height*dpr;}
      ctx.reset();ctx.drawImage(cache.backing,0,0);ctx.setTransform(dpr,0,0,dpr,0,pad*dpr);
      invoke(ctx,()=>{
        if(opts.ambient&&opts.variant==='candidate')drawGathererClearingAmbient(clock);
        if(opts.character){g.save();g.translate(opts.variant==='candidate'?264:248,486);const s=opts.variant==='candidate'?1.48:2.12;g.scale(s,s);drawMushroomGatherer(clock);g.restore();}
        if(opts.foreground&&opts.variant==='candidate')drawGathererClearingForeground();
        if(opts.dialogue)drawJourneyNormalConversationPanel({content:'mushrooms',dialogue:'choice'});
        if(opts.guides){
          g.save();g.strokeStyle='#c9ddbc';g.lineWidth=1;g.setLineDash([5,5]);
          for(const x of [160,320]){g.beginPath();g.moveTo(x,-pad);g.lineTo(x,800+pad);g.stroke();}
          g.strokeRect(20,512,440,276);g.beginPath();g.moveTo(0,486);g.lineTo(480,486);g.stroke();g.restore();
        }
        if(opts.hotspots&&opts.variant==='candidate'){
          g.save();g.strokeStyle='#efd198';g.lineWidth=1.4;g.setLineDash([3,3]);
          for(const h of candidate.hotspots)g.strokeRect(...h.rect);g.restore();
        }
      },pad);
      canvas.style.filter=opts.values?'grayscale(1)':'none';
      if(before!==state())throw Error('Renderer changed gameplay state');
      if(sample){
        samples++;const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
        for(let i=3;i<data.length;i+=4)if(data[i]!==255)throw Error('Scene contains unpainted / transparent pixels');
      }
    }catch(e){remember(e.message);}
    $('time').value=clock.toFixed(2)+'s';$('scrub').value=clock%12;
    $('status').textContent=failures.length?'CHECK FAILED — '+failures.join(' · '):`TECHNICAL CHECKS · ${samples} samples · ${cacheBuilds} background builds · visually rejected archive`;
    $('errors').textContent=failures.join('\n');return report();
  }
  function report(){return {candidate:candidate.id,visualApproval:'rejected',technical:failures.length?'failed':'passed-sampled-checks',failures:[...failures],samples,cacheBuilds,options:{...opts},scope:'Finite drawing, balanced state, selected gameplay purity, full canvas coverage. Not a perspective, aesthetic or phone performance certificate.'};}
  function setOptions(values){
    for(const key of Object.keys(opts))if(key in values)opts[key]=values[key];
    for(const key of ['character','dialogue','foreground','ambient','guides','hotspots','values'])$(key).checked=opts[key];
    $('frame').value=opts.frame;$('variant').value=opts.variant;$('play').textContent=opts.playing?'Pause':'Play';last=0;
  }
  $('play').onclick=()=>{setOptions({playing:!opts.playing});};
  $('scrub').oninput=e=>{setOptions({playing:false});renderAt(e.target.value);};
  for(const key of ['character','dialogue','foreground','ambient','guides','hotspots','values','frame','variant'])$(key).onchange=e=>{setOptions({[key]:e.target.type==='checkbox'?e.target.checked:e.target.value});renderAt();};
  $('reset').onclick=()=>{failures=[];samples=0;renderAt();};
  $('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(report(),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='background-lab-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  canvas.onclick=e=>{
    if(opts.variant!=='candidate')return;
    const box=canvas.getBoundingClientRect(),height=canvas.height/(canvas.width/480);
    // object-fit:contain can letterbox a tall scene in the desktop max-height.
    const s=Math.min(box.width/480,box.height/height),ox=(box.width-480*s)/2,oy=(box.height-height*s)/2;
    const x=(e.clientX-box.left-ox)/s,y=(e.clientY-box.top-oy)/s-(height-800)/2;
    if(opts.dialogue&&x>=20&&x<=460&&y>=512&&y<=788)return;
    const h=candidate.hotspots.find(({rect:[a,b,w,h]})=>x>=a&&x<=a+w&&y>=b&&y<=b+h);if(h)inspect(h.id);
  };
  for(const name of ['touchstart','touchmove','touchend','pointerdown','pointerup','click'])root.addEventListener(name,e=>e.stopPropagation());
  window.addEventListener('keydown',e=>e.stopImmediatePropagation(),true);
  window.KRBackgroundLab={candidate,renderAt,report,state,setOptions,inspect};
  function tick(now){
    if(opts.playing&&!document.hidden){if(last&&now-last<1000/30){requestAnimationFrame(tick);return;}if(last)clock+=Math.min(.1,(now-last)/1000);last=now;const second=Math.floor(clock);renderAt(clock,second!==lastSample);lastSample=second;}else last=0;
    requestAnimationFrame(tick);
  }
  renderAt();root.dataset.ready='1';requestAnimationFrame(tick);
})();
