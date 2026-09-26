/* Authoring-only. Uses the real game renderers and a separate canvas per model. */
(()=>{
  'use strict';
  const registry=window.KR_ART_REFERENCES;
  const W=320,H=330,ORIGIN=360,BASE=540;
  let clock=0,playing=true,last=0,lastSample=-1,action=false,view='color',background='neutral';
  let history=[],failures=[],sampleCount=0;
  const entries=new Map(),raw=document.createElement('canvas');raw.width=raw.height=720;
  const rawContext=raw.getContext('2d',{willReadFrequently:true});
  const remember=(id,message)=>{
    const text=id+': '+message;
    if(!failures.includes(text))failures.push(text);
    failures=failures.slice(-30);
  };
  const state=()=>JSON.stringify({mode,gold,scrap,dist,loop,health:player.hp,
    relics,mushrooms:journeyMushroomQuest,chickens:journeyChickenQuest,
    favor:journeyTravelerFavor});
  // All adapters draw existing game code. Coordinates below only frame the models.
  function drawModel(id,t,moving){
    const pulse=(1-Math.cos(t*Math.PI))/2;
    switch(id){
      case 'oakbreaker':g.save();try{g.translate(ORIGIN-240,BASE-438);KRTavernArm.actor(false,'all',{power:moving?pulse:.5,phase:'playing',cue:moving?'surge':'rest'},t);}finally{g.restore();}return;
      case 'duke':g.save();try{g.translate(ORIGIN-240,BASE-340);KRDukeBluff.actor(false,'all',{phase:moving?'revealing':'turn',phaseT:moving?pulse*.9:0,tell:0});}finally{g.restore();}return;
      case 'barry':g.save();try{g.translate(ORIGIN-240,BASE-353);KRTavernSlide.barry(false);}finally{g.restore();}return;
      case 'knight':return drawSerJonathanRider(ORIGIN,BASE,1.5,{gallop:moving?t*.55:0,lean:moving?Math.sin(t*1.4)*.12:0});
      case 'bear':return drawBearNatural(ORIGIN,BASE,1.5,moving?'tele_paw_right':'idle',moving?pulse:t,false);
      case 'wolf':return drawWolf(ORIGIN,BASE,2,moving?'howl':'idle',moving?pulse:t,false);
      case 'toad':return drawMireToad(ORIGIN,BASE,1.6,moving?'croak':'idle',moving?pulse:t,false);
      case 'merchant':
        g.save();g.translate(ORIGIN-225,BASE-375);
        drawWanderingMerchant({phase:moving?'handoff':'browse',clock:pulse*1.8});
        drawWanderingMerchant({phase:moving?'handoff':'browse',clock:pulse*1.8},true);
        g.restore();return;
      case 'disco':{
        const u=(t/1.4)%1,dir=['left','up','right','down'][Math.floor(t/1.4)%4];
        return drawDiscoKing(ORIGIN,BASE,1.6,moving?dir:null,moving?Math.sin(u*Math.PI)**2:0,0,t);
      }
      case 'smith':
        g.save();g.translate(ORIGIN,BASE-180);g.scale(1.5,1.5);
        drawSmithKnight(0,0,0,0,false,moving?t%2.8:0,moving,null,null,t);
        g.restore();return;
      case 'mushroom':g.save();g.translate(ORIGIN,BASE);drawMushroomGatherer(t);g.restore();return;
      case 'basalt-dwarf':return KRBasaltForge.dwarf(ORIGIN,BASE,1.5,t,moving?pulse:0,null,0,true,true);
      case 'innkeeper':return KRMossyInn.keeper(ORIGIN,BASE,1.8,false);
      case 'seated-merchant':{
        g.save();try{g.translate(ORIGIN-165,BASE-461);
          const pose={phase:moving?'handoff':'browse',clock:moving?pulse*1.8:0};
          KRAutumnCaravan.withLighting(()=>{KRAutumnCaravan.actor(pose);KRAutumnCaravan.actor(pose,true);},false);
        }finally{g.restore();}return;
      }
      default:throw Error('Unknown art model '+id);
    }
  }
  // Instrument only the lab context, never CanvasRenderingContext2D.prototype.
  function guard(ctx,id){
    let depth=0;
    const functions=new Map();
    const proxy=new Proxy(ctx,{
      get(target,key){
        const value=Reflect.get(target,key,target);
        if(typeof value!=='function')return value;
        if(!functions.has(key))functions.set(key,(...args)=>{
          if(args.some(v=>typeof v==='number'&&!Number.isFinite(v)))throw Error('Non-finite '+String(key));
          if(key==='save')depth++;
          if(key==='restore'&&--depth<0)throw Error('Canvas restore without save');
          return value.apply(target,args);
        });
        return functions.get(key);
      },
      set(target,key,value){
        if(typeof value==='number'&&!Number.isFinite(value))throw Error('Non-finite '+String(key));
        return Reflect.set(target,key,value,target);
      }
    });
    return {proxy,finish(){if(depth!==0)throw Error('Unbalanced canvas stack: '+depth+' in '+id);}};
  }
  function invoke(ctx,id,t,moving){
    const savedG=g,savedClock=perfNow,checked=guard(ctx,id);
    const initial=ctx.getTransform(),alpha=ctx.globalAlpha,composite=ctx.globalCompositeOperation;
    ctx.save();
    try{
      g=checked.proxy;perfNow=t;drawModel(id,t,moving);checked.finish();
      const after=ctx.getTransform();
      if(['a','b','c','d','e','f'].some(k=>Math.abs(after[k]-initial[k])>1e-6)||ctx.globalAlpha!==alpha||ctx.globalCompositeOperation!==composite)
        throw Error('Renderer leaked transform, opacity or composite state');
    }finally{g=savedG;perfNow=savedClock;ctx.restore();}
  }
  function pixels(ctx){
    const {width:w,height:h}=ctx.canvas,data=ctx.getImageData(0,0,w,h).data;
    let left=w,top=h,right=-1,bottom=-1,count=0,hash=2166136261;
    for(let i=0;i<data.length;i+=4){
      if(data[i+3]>20){const p=i/4,x=p%w,y=Math.floor(p/w);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);count++;}
      // Deterministic same-time checks include RGB, not just a silhouette.
      for(let j=0;j<4;j++)hash=Math.imul(hash^data[i+j],16777619);
    }
    return {left,top,right,bottom,count,hash:(hash>>>0).toString(16),edge:count>0&&(left===0||top===0||right===w-1||bottom===h-1)};
  }
  function calibrate(id){
    const box={left:720,top:720,right:0,bottom:0};
    // Fixed union, not auto-fit every frame: changing pose must not change scale.
    for(const moving of [false,true])for(let i=0;i<=8;i++){
      rawContext.reset();invoke(rawContext,id,i*.7,moving);
      const p=pixels(rawContext);
      if(!p.count||p.edge)throw Error('Reference framing needs adjustment: '+id);
      box.left=Math.min(box.left,p.left);box.top=Math.min(box.top,p.top);
      box.right=Math.max(box.right,p.right);box.bottom=Math.max(box.bottom,p.bottom);
    }
    return box;
  }
  const style=document.createElement('style');
  style.textContent=`
    html,body{position:static!important;height:auto!important;overflow:auto!important;touch-action:auto!important;user-select:text!important;background:#10171b;color:#e5e2d5;font:15px/1.5 system-ui,sans-serif}
    #game,#safe{display:none!important}*{box-sizing:border-box}
    #art-root{max-width:1440px;margin:auto;padding:26px}h1{font-size:27px;letter-spacing:.04em;margin:0}p{margin:5px 0 18px;color:#aebeba}
    .art-kicker{color:#dfbb77;letter-spacing:.16em;font-size:11px;font-weight:700}
    .art-controls{display:flex;flex-wrap:wrap;gap:12px;align-items:center;padding:14px;background:#1b282d;border:1px solid #3d5156;margin-bottom:16px}
    button,select,input{font:inherit}button,select{background:#243a40;color:#f0e6cb;border:1px solid #64766d;border-radius:3px;padding:8px 12px;cursor:pointer}label{display:flex;align-items:center;gap:7px}input[type=range]{width:145px}a{color:#bcd2bd}
    .art-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.art-card{border:1px solid #3a4d50;background:#19232a;min-width:0}.art-card[data-status=candidate]{border:2px solid #d8ae69}
    .art-card header{padding:11px 13px;border-bottom:1px solid #34464b}.art-card h2{font-size:16px;margin:0}.art-card small{color:#adc0b9}.art-card canvas{position:static!important;width:100%;height:auto;aspect-ratio:320/330;background:transparent;image-rendering:auto;display:block}
    .art-stage{background:linear-gradient(#18262c 77%,#25322f 77%,#25322f 78%,#131d22 78%)}.art-stage[data-bg=forest]{background:#14271b}
    .art-foot{padding:8px 12px;font-size:11px;color:#aebeba;min-height:44px}.art-status{padding:12px 16px;background:#26362e;border-left:3px solid #9dbd99;margin-bottom:16px}.art-status[data-failed=true]{border-color:#f59383;background:#432c2a}
    details{margin-top:22px;border-top:1px solid #3a4d50;padding-top:14px}summary{cursor:pointer;color:#d8bc83}.art-approved{display:flex;gap:18px;align-items:start;flex-wrap:wrap}.art-approved figure{margin:18px 0;max-width:350px}.art-approved img{width:100%;height:auto}.art-approved figcaption{font-size:12px;color:#b6c3bc}
    #art-errors{color:#ffb6a8;white-space:pre-wrap}#art-time{font-variant-numeric:tabular-nums}#art-notes{display:flex;gap:14px;flex-wrap:wrap;margin:14px 0;font-size:12px;color:#aebeba}
    @media(max-width:1000px){.art-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){#art-root{padding:14px}.art-grid{gap:8px}.art-card header{padding:8px}.art-card h2{font-size:13px}.art-card small{font-size:10px}.art-foot{padding:6px;font-size:10px}.art-controls{gap:8px}h1{font-size:23px}}
  `;document.head.appendChild(style);
  const root=document.createElement('main');root.id='art-root';
  root.innerHTML=`<div class="art-kicker">KNIGHT RUSH / ART WORKSHOP</div><h1>One world. One visual language.</h1>
    <p>Blocky knight & boss forms · merchant detail · Disco King expression. Live models, not redrawn references. <a href="KnightRush.html?backgroundlab=1">Background Lab →</a> · <a href="RoadCreatorLab.html">Road Creator Lab →</a></p>
    <div class="art-controls">
      <button id="art-play">Pause</button><label>Time <input id="art-scrub" aria-label="Animation time" type="range" min="0" max="6" step="0.01" value="0"><output id="art-time">0.00s</output></label>
      <label>Pose <select id="art-pose"><option value="idle">Idle</option><option value="action">Action study</option></select></label>
      <label>View <select id="art-view"><option value="color">Color</option><option value="grayscale">Values</option><option value="silhouette">Silhouette</option></select></label>
      <label>Ground <select id="art-bg"><option value="neutral">Neutral</option><option value="forest">Forest</option></select></label>
      <button id="art-reset">Reset checks</button><button id="art-report">Export report</button>
    </div><div class="art-status" id="art-status" role="status" aria-live="polite">Preparing reference framing…</div>
    <div id="art-notes"><span>Equal display height, not world size.</span><span>Small strip = distance readability.</span><span>Registered user-approved anchors. New edits need review.</span></div>
    <div class="art-grid" id="art-grid"></div><pre id="art-errors"></pre>
    <details><summary>Approved scene references & review checklist</summary><p>Shape → volume → motion. Check supported props, connected hands, clear side planes and small-scale readability. The smith screenshot's old red upper sleeves are superseded by steel.</p><div class="art-approved" id="art-approved"></div></details>`;
  document.body.appendChild(root);document.title='Knight Rush — Art Lab';
  const $=id=>document.getElementById(id);
  // The forest option uses the actual runner tree art, on its own cached layer.
  // It is excluded from model metrics so a background cannot hide an empty NPC.
  const forestCanvas=document.createElement('canvas');forestCanvas.width=640;forestCanvas.height=660;
  const forestContext=forestCanvas.getContext('2d'),savedForestG=g;
  try{
    g=forestContext;g.scale(2,2);g.fillStyle='#101e18';g.fillRect(0,0,W,H);
    g.fillStyle='#21351f';g.fillRect(0,195,W,H-195);
    for(const [x,y,s,v] of [[28,247,.88,.14],[275,254,1.1,.68],[100,192,.57,.43],[215,204,.64,.82]])drawTreeArt(x,y,s,v);
    g.fillStyle='#15211e';g.fillRect(0,258,W,H-258);
  }finally{g=savedForestG;}
  const forestURL=forestCanvas.toDataURL();
  for(const ref of registry.references){
    const card=document.createElement('article');card.className='art-card';card.dataset.status=ref.status;card.dataset.model=ref.id;
    card.innerHTML=`<header><h2>${ref.label}</h2><small>${ref.role}${ref.id==='merchant'?' · counter bust':''}</small></header><div class="art-stage"><canvas aria-label="${ref.label} animated reference"></canvas></div><div class="art-foot">Waiting for first sample</div>`;
    $('art-grid').appendChild(card);
    const canvas=card.querySelector('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
    const dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=W*dpr;canvas.height=H*dpr;
    try{entries.set(ref.id,{ref,card,canvas,ctx,dpr,box:calibrate(ref.id),last:null});}
    catch(e){remember(ref.id,e.message);}
  }
  for(const file of registry.images){
    const figure=document.createElement('figure'),img=document.createElement('img');
    img.src='art-source/knight-rush-sharp-plane/'+file;img.alt=file;img.loading='lazy';
    const caption=document.createElement('figcaption');caption.textContent=file;figure.append(img,caption);$('art-approved').appendChild(figure);
  }
  function paint(entry,t){
    const {ctx,dpr,box,ref}=entry;
    ctx.reset();ctx.scale(dpr,dpr);
    const factor=Math.min(238/(box.bottom-box.top+1),280/(box.right-box.left+1));
    const center=(box.left+box.right)/2;
    ctx.save();ctx.translate(W/2,255);ctx.scale(factor,factor);ctx.translate(-center,-box.bottom);
    invoke(ctx,ref.id,t,action);ctx.restore();
    ctx.save();ctx.translate(W/2,318);ctx.scale(factor*.21,factor*.21);ctx.translate(-center,-box.bottom);
    invoke(ctx,ref.id,t,action);ctx.restore();
    if(view==='silhouette'){
      ctx.globalCompositeOperation='source-in';ctx.fillStyle='#dce6dc';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over';
    }
    entry.canvas.style.filter=view==='grayscale'?'grayscale(1)':'none';
    const stage=entry.card.querySelector('.art-stage');stage.dataset.bg=background;
    stage.style.backgroundImage=background==='forest'?`url("${forestURL}")`:'';
    stage.style.backgroundSize='100% 100%';
  }
  function status(){
    const panel=$('art-status');panel.dataset.failed=String(failures.length>0);
    panel.textContent=failures.length?`CHECK FAILED · ${failures.length} persistent issue(s). Visual acceptance remains pending.`:
      `TECHNICAL CHECKS · ${sampleCount} time samples · every 1 animation second · Visual acceptance still requires review.`;
    $('art-errors').textContent=failures.join('\n');
  }
  function renderAt(t,sample=false){
    clock=Math.max(0,Number(t)||0);
    const before=sample?state():null;
    const results=[];
    for(const entry of entries.values()){
      try{
        paint(entry,clock);
        if(sample){
          const p=pixels(entry.ctx);entry.last=p;
          if(!p.count)remember(entry.ref.id,'Empty model');
          if(p.edge)remember(entry.ref.id,'Pixels touch frame edge — inspect clipping');
          entry.card.querySelector('.art-foot').textContent=`${entry.ref.status==='candidate'?'CANDIDATE':'REFERENCE'} · t ${clock.toFixed(2)}s · ${p.edge?'CLIP WARNING':'inside frame'} · ${p.count} pixels`;
          results.push({id:entry.ref.id,...p});
        }
      }catch(e){remember(entry.ref.id,e.message);}
    }
    if(sample){
      if(before!==state())remember('state','Drawing changed selected gameplay state');
      sampleCount++;history.push({time:clock,pose:action?'action':'idle',results});if(history.length>120)history.shift();
    }
    $('art-time').value=clock.toFixed(2)+'s';$('art-scrub').value=clock%6;status();
    return results;
  }
  const report=()=>({version:1,visualApproval:registry.visualApproval,technicalStatus:failures.length?'failed':'passed-sampled-checks',
    sampleCount,failures:[...failures],history:[...history],scope:'Art Lab only; no automatic aesthetic, anatomy, world-layering or phone-performance guarantee'});
  $('art-play').onclick=()=>{playing=!playing;$('art-play').textContent=playing?'Pause':'Play';last=0;};
  $('art-scrub').oninput=e=>{playing=false;$('art-play').textContent='Play';renderAt(Number(e.target.value),true);};
  $('art-pose').onchange=e=>{action=e.target.value==='action';renderAt(clock,true);};
  $('art-view').onchange=e=>{view=e.target.value;renderAt(clock,true);};
  $('art-bg').onchange=e=>{background=e.target.value;renderAt(clock,true);};
  $('art-reset').onclick=()=>{failures=[];history=[];sampleCount=0;lastSample=-1;renderAt(clock,true);};
  $('art-report').onclick=()=>{
    const url=URL.createObjectURL(new Blob([JSON.stringify(report(),null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='knight-rush-art-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  window.KRArtLab={registry,report,renderAt,state,
    setOptions(options={}){
      if(options.playing!==undefined)playing=!!options.playing;
      if(options.action!==undefined)action=!!options.action;
      if(options.view)view=options.view;if(options.background)background=options.background;
      $('art-play').textContent=playing?'Pause':'Play';$('art-pose').value=action?'action':'idle';$('art-view').value=view;$('art-bg').value=background;
    },
    source(name){const value=(0,eval)(name);if(typeof value==='function')return value.toString();if(value&&typeof value==='object')return JSON.stringify(value);throw Error('Not a renderer/material '+name);},
    bounds(){return Object.fromEntries([...entries].map(([id,v])=>[id,v.box]));}
  };
  // Game key handlers must not consume space/arrows in the authoring controls.
  window.addEventListener('keydown',event=>event.stopImmediatePropagation(),true);
  function tick(now){
    if(playing&&!document.hidden){
      if(last&&now-last<1000/30){requestAnimationFrame(tick);return;}
      if(last)clock+=Math.min(.1,(now-last)/1000);last=now;
      const second=Math.floor(clock);renderAt(clock,second!==lastSample);lastSample=second;
    }else last=0;
    requestAnimationFrame(tick);
  }
  renderAt(0,true);document.documentElement.dataset.artLabReady='1';requestAnimationFrame(tick);
})();
