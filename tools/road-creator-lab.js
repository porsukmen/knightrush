/* Authoring-only, demand-rendered production fixtures. No RAF/polling in normal play. */
(async()=>{
 'use strict';
 const load=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>no(Error(src));document.head.appendChild(s);});
 try{
  await load('art-source/knight-rush-special-roads/creator-references.js');
  const refs=KRRoadCreatorReferences.references,opts={theme:'bloodwood',view:'road',kind:'boulder',lanes:'012',depth:24};
  const requested=BOOT_QUERY.get('theme');if(refs.some(r=>r.theme===requested))opts.theme=requested;
  const css=document.createElement('style');css.textContent=`
   html,body{position:static!important;height:auto!important;overflow:auto!important;touch-action:auto!important;background:#121c20;color:#e7dec9;font:15px/1.5 system-ui}#game,#safe{display:none!important}*{box-sizing:border-box}
   #road-creator{max-width:1320px;margin:auto;padding:24px}h1{margin:4px 0;font-size:30px}h2{font-size:20px;margin:0}p{color:#b9c6c2}a{color:#ecd094}nav,.rc-controls{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}.rc-kicker{font-size:11px;letter-spacing:.18em;color:#dab771}
   button,select,input{font:inherit}button,select{background:#25353a;color:#eee2ca;border:1px solid #67736a;padding:9px;cursor:pointer;border-radius:4px}label{display:flex;gap:7px;align-items:center;flex-wrap:wrap}button[aria-pressed=true]{border-color:#f1d08b;background:#465148}
   .rc-layout{display:grid;grid-template-columns:minmax(260px,1fr) minmax(280px,1fr);gap:22px}.rc-card{padding:16px;border:1px solid #415152;background:#1b292c}.rc-stage{display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:start}.rc-stage figure{margin:0;min-width:0}.rc-stage figcaption{font-size:12px;margin-bottom:6px;color:#b9c6c2}
   #rc-canvas{position:static!important;width:100%!important;height:auto!important;display:block;image-rendering:auto}#rc-approved{width:100%;height:auto;display:block}#rc-status{font-size:12px}dt{color:#efd7a6;margin-top:12px}dd{margin:3px 0;color:#bfcbc5}#rc-error{color:#ffb9a5;white-space:pre-wrap}#rc-obstacle-controls[hidden]{display:none}
   @media(max-width:850px){.rc-layout{grid-template-columns:1fr}#road-creator{padding:14px}.rc-stage{max-width:660px}h1{font-size:25px}}
  `;document.head.appendChild(css);
  const root=document.createElement('main');root.id='road-creator';root.innerHTML=`
   <div class="rc-kicker">KNIGHT RUSH / APPROVED ENVIRONMENT LIBRARY</div><h1>Special Road Creator Lab</h1>
   <p>Six approved biomes. Production renderers on the left; the locked approval on the right. New edits do not inherit approval.</p>
   <nav><a href="KnightRush.html?roadlab=1">Playable Road Lab (F10)</a><a href="ArtTest.html">Character Art Lab</a><a href="BackgroundTest.html">Cutscene Lab</a><a href="KnightRush.html">Game</a></nav>
   <nav id="rc-biomes"></nav><div class="rc-controls"><label>Study <select id="rc-view">${KRRoadCreatorReferences.views.map(v=>`<option value="${v}">${v.replaceAll('-',' ')}</option>`).join('')}</select></label><button id="rc-reset">Reset fixture</button><button id="rc-save">Save clean PNG</button></div>
   <div class="rc-controls" id="rc-obstacle-controls" hidden><label>Family <select id="rc-kind"><option value="boulder">Boulder / jump</option><option value="pond">Pool / pit</option><option value="root">Root / suspended</option></select></label><label>Lanes <select id="rc-lanes"><option value="1">Middle</option><option value="01">Two joined</option><option value="012">Three joined</option><option value="02">Sides / safe middle</option></select></label><label>Depth <select id="rc-depth"><option value="65">Far</option><option value="24">Mid</option><option value="8">Near</option></select></label></div>
   <div class="rc-layout"><div class="rc-stage"><figure><figcaption>LIVE · production renderer</figcaption><canvas id="rc-canvas"></canvas></figure><figure><figcaption>APPROVED · 25 Sep 2026</figcaption><img id="rc-approved" alt="Locked road reference"><p id="rc-snapshot-note"></p></figure></div>
   <section class="rc-card"><h2 id="rc-title"></h2><p id="rc-type"></p><dl id="rc-details"></dl><p id="rc-links"></p><p id="rc-status"></p><p>Obstacle variants preserve occupied lanes and safe gaps. Inn linen is always duck-only. Generated event plates and isolated characters are reviewed in their own labs.</p></section></div><pre id="rc-error"></pre>`;
  document.body.appendChild(root);document.title='Knight Rush — Road Creator Lab';
  const $=id=>document.getElementById(id),canvas=$('rc-canvas'),ctx=canvas.getContext('2d');
  function draw(){
   paused=true;pausePhotoMode=true;perfNow=5;
   const saved={buildWorldDrawQueue,drawPlayer,drawSquire,drawWolfPupFollower,drawAmbient,drawParticles,drawProjectiles,drawTelegraphs};
   try{
    // Environment references exclude the player's presentation interpolation.
    drawPlayer=drawSquire=drawWolfPupFollower=()=>{};
    drawParticles=drawProjectiles=drawTelegraphs=()=>{};
    if(opts.view==='surface'){
     buildWorldDrawQueue=(...args)=>{saved.buildWorldDrawQueue(...args);DRAW_QUEUE.length=0;FRONT_OBSTACLES.length=0;JOURNEY_FRONT_OBSTACLES.length=0;};
     drawPlayer=drawSquire=drawWolfPupFollower=drawAmbient=()=>{};
    }
    render();
    const height=VH+PAD_TOT;canvas.width=720;canvas.height=Math.round(720*height/VW);
    if(opts.view==='decorations'){
     canvas.height=900;
     for(let side=0;side<2;side++)ctx.drawImage(cvs,viewX+side*320*viewScale,viewY+300*viewScale,160*viewScale,400*viewScale,side*360,0,360,900);
    }else ctx.drawImage(cvs,viewX,viewY-PAD_TOP*viewScale,VW*viewScale,height*viewScale,0,0,canvas.width,canvas.height);
   }finally{({buildWorldDrawQueue,drawPlayer,drawSquire,drawWolfPupFollower,drawAmbient,drawParticles,drawProjectiles,drawTelegraphs}=saved);}
   $('rc-status').textContent=`Frozen seeded fixture · ${Math.round(dist)}m · ${opts.view} · no animation loop. Lab changes only this disposable test run.`;
  }
  function prepare(){
   const random=Math.random;let seed=731;
   try{
    Math.random=()=>((seed=Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;
    paused=false;pausePhotoMode=false;SFX.setTestMuted(true);lastObsFull=false;
    roadLabState.entry=opts.view.startsWith('turn-');roadLabState.direction=opts.view==='turn-left'?-1:1;
    if(!startRoadLabCase(ROAD_LAB_CASES.findIndex(r=>r.theme===opts.theme)))throw Error('Road fixture unavailable');
    initAmbient();
    if(roadLabState.entry){
     for(let i=0;i<400&&dist<roadLabState.fixture.node.at-20;i++)update(1/60);
     player.x=player.lane=roadLabState.direction+1;chooseJourneyDirection(roadLabState.direction);
     for(let i=0;i<300&&journey.phase!=='turning';i++)update(1/60);
     for(let i=0;i<30;i++)update(1/120);
    }else{
     const target=opts.view==='venue'?journeyRoadEventTriggerAt(roadLabState.slot)-30:Math.min(roadLabState.slot.at-110,dist+110);
     for(let i=0;i<9000&&mode==='run'&&dist<target;i++)update(1/60);
     if(opts.view==='obstacles'){
      const req=[null,null,null];for(const lane of opts.lanes)req[Number(lane)]=opts.kind==='root'?'duck':'jump';
      const o=new ObstacleEntity(opts.kind,Number(opts.depth),req,'L');o.roadTheme=journeyObstacleThemeAt(dist+o.z);obstacles=[o];
     }else obstacles=[];
     pickups=[];
    }
   }finally{Math.random=random;}
   draw();info();
  }
  function info(){
   for(const k of ['view','kind','lanes','depth'])$('rc-'+k).value=opts[k];
   const ref=refs.find(r=>r.theme===opts.theme);$('rc-title').textContent=ref.name;$('rc-type').textContent=ref.construction.toUpperCase()+' · USER APPROVED';
   $('rc-details').innerHTML=[['Road surface',ref.surface],['Decorations',ref.decorations],['Jump obstacle',ref.obstacles.boulder],['Pool / pit',ref.obstacles.pond],['Root / overhead',ref.obstacles.root],['Event venue',ref.venue]].map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('');
   $('rc-links').innerHTML=`<a href="KnightRush.html?roadlab=1&roadcase=${opts.theme}">Play this biome →</a>${ref.cutscene?` · <a href="KnightRush.html?backgroundlab=1&scene=${ref.cutscene}">Cutscene reference →</a>`:''}`;
   $('rc-obstacle-controls').hidden=opts.view!=='obstacles';
   const sample=opts.view==='obstacles'&&opts.kind!=='boulder'?opts.view+'-'+opts.kind:opts.view;
   const img=$('rc-approved');img.src=`art-source/knight-rush-special-roads/approved/${opts.theme}-${sample}.png`;
   $('rc-snapshot-note').textContent=opts.view==='obstacles'?'Locked sample: three lanes, mid distance. Use the live controls for other variants.':'';
   for(const b of $('rc-biomes').children)b.setAttribute('aria-pressed',String(b.dataset.theme===opts.theme));
  }
  for(const ref of refs){const b=document.createElement('button');b.textContent=ref.name;b.dataset.theme=ref.theme;b.style.borderTop=`3px solid ${ref.color}`;b.onclick=()=>{opts.theme=ref.theme;prepare();};$('rc-biomes').appendChild(b);}
  for(const k of ['view','kind','lanes','depth']){$('rc-'+k).value=opts[k];$('rc-'+k).onchange=e=>{opts[k]=e.target.value;prepare();};}
  $('rc-reset').onclick=prepare;$('rc-save').onclick=()=>{const a=document.createElement('a');a.download=opts.theme+'-'+opts.view+'.png';a.href=canvas.toDataURL();a.click();};
  window.KRRoadCreatorLab={setOptions(v){Object.assign(opts,v);prepare();},draw,report:()=>({options:{...opts},theme:journeyObstacleThemeAt(dist+24),mode,approvedOn:KRRoadCreatorReferences.approvedOn})};
  window.addEventListener('keydown',e=>e.stopImmediatePropagation(),true);
  prepare();document.documentElement.dataset.roadCreatorReady='1';
 }catch(e){console.error(e);const p=document.createElement('pre');p.textContent=e.stack;document.body.appendChild(p);}
})();
