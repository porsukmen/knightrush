/* Authoring only. Live production scene, no gameplay or economy mutations. */
(async()=>{
 'use strict';
 const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(Error(src));document.body.appendChild(s);});
 try{
  await load('art-source/knight-rush-backgrounds/cutscene-references.js');
  await load('assets/forest/basalt-forge.js');
  if(!await prepareCutscene('basalt-forge'))throw Error('Forge plate unavailable');
  const ref=KRCutsceneReferences.references.find(r=>r.id==='basalt-hearth-v4');
  const css=document.createElement('style');css.textContent=`
   html,body{position:static!important;overflow:auto!important;height:auto!important;touch-action:auto!important;background:#172127;color:#e5ddc9;font:15px system-ui}#game,#safe{display:none!important}
   #forge-lab{max-width:1100px;margin:auto;padding:22px}a{color:#d7bb87}h1{font-size:26px}nav,.forge-controls{display:flex;flex-wrap:wrap;gap:14px;margin:18px 0}button,select{font:inherit;background:#2e414b;color:#f2deba;padding:8px;border:1px solid #81928e}
   #forge-reference{position:static!important;display:block;width:100%;height:auto;aspect-ratio:4/3}#forge-error{color:#ffb7a0}p{line-height:1.6}
  `;document.head.appendChild(css);
  const root=document.createElement('main');root.id='forge-lab';root.innerHTML=`
   <nav><a href="KnightRush.html?backgroundlab=1&clearing=crisp">Gatherer clearing</a><a href="KnightRush.html?backgroundlab=1&scene=autumn-caravan">Autumn Caravan</a><a href="KnightRush.html?backgroundlab=1&scene=mossy-inn">Mossy Oak Inn</a><a href="KnightRush.html?artlab=1">Character Art Lab</a><a href="RoadCreatorLab.html">Road Creator Lab</a></nav>
   <h1>Basalt Hearth · approved cutscene</h1><p>Approved 2026-09-25. Generated environment + live Borin. No UI in the reference composite.</p>
   <div class="forge-controls"><label>View <select id="forge-view"><option value="scene">Scene-lit composite</option><option value="plate">Environment only</option><option value="neutral">Neutral actor / comparison</option></select></label>
   <label>Pose <select id="forge-pose"><option value="idle">Idle</option><option value="bow">Bow</option><option value="shield">Shield</option><option value="gauntlet">Gauntlet</option></select></label>
   <button id="forge-motion">Play motion</button></div><canvas id="forge-reference" width="1440" height="1080"></canvas>
   <p id="forge-status"></p><p>Left forge: warm skin, copper beard and metal highlights. Right window: cool shade. Anvil occludes the body; hands and workpieces stay live. The same plate supplies the foreground mask.</p>
   <p><a href="${ref?.plate||'assets/encounters/basalt-hearth-v4.png'}">Approved environment plate</a> · <a href="${ref?.composite||'#'}">Approved composite</a> · <a href="tools/skills/knight-rush-cutscene/SKILL.md">Cutscene skill</a></p><pre id="forge-error"></pre>`;
  document.body.appendChild(root);
  const canvas=document.getElementById('forge-reference'),ctx=canvas.getContext('2d'),opts={view:'scene',pose:'idle',time:5,playing:false};
  const state=()=>JSON.stringify([mode,gold,scrap,dist,player.hp,blacksmithShop]);
  function draw(){
   const before=state(),saved={g,perfNow,blacksmithShop};
   ctx.reset();ctx.scale(canvas.width/480,canvas.height/360);
   try{
    g=ctx;perfNow=opts.time;
    if(opts.view==='plate')g.drawImage(KREventVisuals.peek('basalt-forge'),0,0,480,360);
    else{
     blacksmithShop={roadToken:'reference-only',phase:opts.pose==='idle'?'browse':'forge',clock:opts.playing?opts.time%2.3:1.15,
      order:{skillId:opts.pose==='shield'?'shield_bash':opts.pose==='gauntlet'?'call_squire':'sharpshoot'}};
     if(!KRBasaltForge.drawCutscene(opts.time,opts.view!=='neutral'))throw Error('Production scene unavailable');
    }
   }finally{g=saved.g;perfNow=saved.perfNow;blacksmithShop=saved.blacksmithShop;}
   if(state()!==before)throw Error('Reference render changed game state');
   document.getElementById('forge-status').textContent=opts.view==='neutral'?'Diagnostic lighting comparison, not the approved composite.':'Approved '+(opts.view==='plate'?'environment':'scene-lit composition')+' · '+opts.pose;
  }
  for(const k of ['view','pose'])document.getElementById('forge-'+k).onchange=e=>{opts[k]=e.target.value;draw();};
  document.getElementById('forge-motion').onclick=e=>{opts.playing=!opts.playing;e.target.textContent=opts.playing?'Pause motion':'Play motion';};
  let last=0;function tick(now){if(opts.playing&&now-last>1000/30){opts.time+=last?Math.min(.1,(now-last)/1000):0;last=now;draw();}requestAnimationFrame(tick);}
  window.KRForgeBackgroundLab={draw,state,setOptions(v){Object.assign(opts,v);draw();},report:()=>({referenceId:ref?.id,approval:ref?.status,options:{...opts}})};
  draw();document.documentElement.dataset.forgeLabReady='1';requestAnimationFrame(tick);
 }catch(e){console.error(e);const p=document.createElement('pre');p.id='forge-error';p.textContent=e.message;document.body.appendChild(p);}
})();
