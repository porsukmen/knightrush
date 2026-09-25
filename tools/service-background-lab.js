/* Approved service scenes, drawn through production adapters without their UI. */
(async()=>{
 'use strict';
 const load=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>no(Error(src));document.head.appendChild(s);});
 try{
  await load('art-source/knight-rush-backgrounds/cutscene-references.js');
  const scene=BOOT_QUERY.get('scene'),inn=scene==='mossy-inn',id=inn?'mossy-inn-v4':'autumn-caravan-v1';
  if(!await prepareCutscene(scene,true,'background-reference'))throw Error('Scene unavailable');
  const ref=KRCutsceneReferences.references.find(r=>r.id===id),opts={view:'scene',time:2,playing:false};
  const style=document.createElement('style');style.textContent=`html,body{position:static!important;height:auto!important;overflow:auto!important;touch-action:auto!important;background:#172127;color:#eee1c9;font:15px/1.5 system-ui}#game,#safe{display:none!important}#service-lab{max-width:1050px;margin:auto;padding:22px}nav,.service-controls{display:flex;flex-wrap:wrap;gap:14px;margin:16px 0}a{color:#dfc48e}button,select{font:inherit;padding:8px;background:#2e414b;color:#eee1c9;border:1px solid #81928e}#service-reference{position:static!important;width:100%;height:auto;display:block;max-height:80vh;object-fit:contain}#service-lab p{color:#bfcbc5}`;document.head.appendChild(style);
  const root=document.createElement('main');root.id='service-lab';root.innerHTML=`
   <nav><a href="KnightRush.html?backgroundlab=1&clearing=crisp">Gatherer</a><a href="KnightRush.html?backgroundlab=1&scene=basalt-forge">Forge</a><a href="KnightRush.html?backgroundlab=1&scene=autumn-caravan">Caravan</a><a href="KnightRush.html?backgroundlab=1&scene=mossy-inn">Inn</a><a href="ArtTest.html">Art Lab</a><a href="RoadCreatorLab.html">Road Creator Lab</a></nav>
   <h1>${inn?'The Mossy Oak · Inn v4':'Autumn Caravan · v1'}</h1><p>Approved 25 Sep 2026. Generated environment + separate live actors. No shop UI in the reference.</p>
   <div class="service-controls"><label>View <select id="service-view"><option value="scene">Scene-lit composite</option><option value="plate">Environment plate</option><option value="neutral">Neutral actor comparison</option><option value="approved">Locked approved composite</option></select></label><button id="service-motion">Play motion</button></div>
   <canvas id="service-reference"></canvas><p>${inn?'Warm hearth / cool window · cloth and forearms over the same-plate counter mask.':'Warm autumn light · seated merchant, supported wagon, horse and driver remain native.'}</p><p id="service-status"></p>`;
  document.body.appendChild(root);const canvas=document.getElementById('service-reference'),ctx=canvas.getContext('2d');
  const approved=new Image();approved.src=ref?.composite||'';approved.onload=()=>{if(opts.view==='approved')draw();};
  const state=()=>JSON.stringify([mode,gold,dist,player.hp,merchantShop,journeyRoadEventSession]);
  function draw(){
   const before=state(),saved={g,perfNow,PAD_TOP,PAD_BOT,PAD_TOT},plate=KREventVisuals.peek(scene);
   const height=opts.view==='plate'?360:inn?360:590;canvas.width=960;canvas.height=height*2;
   ctx.reset();ctx.scale(2,2);
   try{
    g=ctx;perfNow=opts.time;PAD_TOP=PAD_BOT=PAD_TOT=0;
    if(opts.view==='plate')g.drawImage(plate,0,0,480,360);
    else if(opts.view==='approved'){if(approved.complete&&approved.naturalWidth)g.drawImage(approved,0,0,480,height);}
    else if(inn){g.translate(0,-88);KRMossyInn.drawScene(opts.view!=='neutral');}
    else KRAutumnCaravan.drawScene({phase:'browse',clock:opts.time},opts.view!=='neutral');
   }finally{({g,perfNow,PAD_TOP,PAD_BOT,PAD_TOT}=saved);}
   if(state()!==before)throw Error('Scene reference changed gameplay');
   document.getElementById('service-status').textContent=opts.view==='neutral'?'Diagnostic neutral lighting, not the approved look.':opts.view==='approved'?'Pinned approval image; live edits do not replace it.':'Live production '+opts.view+' · compare with the locked approved composite.';
  }
  document.getElementById('service-view').onchange=e=>{opts.view=e.target.value;draw();};
  document.getElementById('service-motion').onclick=e=>{opts.playing=!opts.playing;e.target.textContent=opts.playing?'Pause motion':'Play motion';};
  let last=0;function tick(now){if(opts.playing&&now-last>1000/30){opts.time+=last?Math.min(.1,(now-last)/1000):0;last=now;draw();}requestAnimationFrame(tick);}
  window.KRServiceBackgroundLab={draw,state,setOptions(v){Object.assign(opts,v);draw();},report:()=>({scene,id,approval:ref?.status,options:{...opts}})};
  window.addEventListener('keydown',e=>e.stopImmediatePropagation(),true);
  draw();document.documentElement.dataset.serviceLabReady='1';requestAnimationFrame(tick);
 }catch(e){console.error(e);const p=document.createElement('pre');p.textContent=e.stack;document.body.appendChild(p);}
})();
