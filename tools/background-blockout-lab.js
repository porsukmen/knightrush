/* Background candidates and their Blender geometry; never loaded by gameplay. */
(async()=>{
  'use strict';
  const archive=new URLSearchParams(location.search).get('backgroundVersion')==='v2';
  const candidate=archive?'gatherer-blockout-v2':'gatherer-near-v3';
  const base='art-source/knight-rush-backgrounds/'+candidate+'/';
  const previous=new URLSearchParams(location.search).get('clearing')==='original';
  await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='art-source/knight-rush-backgrounds/cutscene-references.js';s.onload=resolve;s.onerror=()=>reject(Error('Cannot load cutscene references'));document.body.appendChild(s);});
  const reference=KRCutsceneReferences.references.find(r=>r.id==='gatherer-clearing-crisp');
  const approval=archive?'spatial-layout-only':previous?'archived-variant':reference.status;
  const illustrationURL='assets/encounters/mushroom-clearing'+(previous?'':'-crisp')+'.png';
  const css=document.createElement('style');css.textContent=`
    html,body{position:static!important;height:auto!important;overflow:auto!important;touch-action:auto!important;user-select:text!important;background:#171b1e;color:#e0e0d7;font:14px/1.5 system-ui,sans-serif}#game,#safe{display:none!important}*{box-sizing:border-box}
    #blockout-root{max-width:1320px;margin:auto;padding:24px}h1{font-size:27px;margin:4px 0}p{color:#bfc5c3;margin:7px 0 14px}.bo-kicker{color:#d4b783;font-size:11px;letter-spacing:.17em}.bo-controls{display:flex;flex-wrap:wrap;gap:12px;align-items:center;padding:13px;background:#242c30;border:1px solid #455153;margin:18px 0}label{display:flex;align-items:center;gap:6px}button,select{font:inherit;background:#313e40;color:#eee5d6;border:1px solid #708180;padding:8px 10px;cursor:pointer}select:disabled,input:disabled{opacity:.4}a{color:#d0c398}.bo-grid{display:grid;grid-template-columns:minmax(0,860px) minmax(240px,1fr);gap:24px;align-items:start}.bo-stage{border:1px solid #69716b;background:#0e1316}#bo-canvas{position:static!important;display:block;width:100%;height:auto;max-height:85vh;object-fit:contain;cursor:crosshair}figcaption{padding:10px 14px;color:#bfc7c1;font-size:12px}figure{margin:0}h2{font-size:17px;color:#d9c395}.bo-note{padding:14px;background:#293331;border-left:3px solid #b29d6c}#bo-inspect{min-height:90px}.bo-side button{display:block;width:100%;text-align:left;margin:7px 0}.bo-side dl{display:grid;grid-template-columns:1fr auto;gap:7px;font-size:13px}.bo-side dt{color:#b7c1bb}.bo-side dd{margin:0}#bo-status{font-size:12px;color:#b7c8b6;margin:8px 0}#bo-error{color:#ffbaab;white-space:pre-wrap}@media(max-width:800px){#blockout-root{padding:12px}.bo-grid{grid-template-columns:1fr}#bo-canvas{max-height:none}.bo-controls{gap:8px;font-size:12px}}
    #bo-canvas{image-rendering:auto!important;aspect-ratio:480 / 512}
    .bo-play-dialog{position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:12px;border:0;background:#101619;color:#eee;overflow:auto}.bo-play-dialog::backdrop{background:#101619}.bo-play-toolbar{display:flex;justify-content:center;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:12px}.bo-play-dialog iframe{display:block;margin:auto;border:1px solid #69716b;width:min(100%,calc((100dvh - 100px)*.6),480px);aspect-ratio:480 / 800;background:#05070c}.bo-play-dialog.phone iframe{width:min(100%,calc((100dvh - 100px)*.461538),480px);aspect-ratio:480 / 1040}
  `;document.head.appendChild(css);
  const root=document.createElement('main');root.id='blockout-root';root.innerHTML=`
    <div class="bo-kicker">KNIGHT RUSH CUTSCENE / BACKGROUND LAB / ${archive?'SPATIAL BLOCKOUT V2':previous?'ARCHIVED VARIANT':'APPROVED REFERENCE'}</div>
    <h1>The Gatherer's Clearing</h1>
    <p>${archive?'Archived spatial model. Grey materials and tree volumes are placeholders.':previous?'Earlier image retained for comparison; not the locked cutscene reference.':'User-approved crisp clearing and scene-lit live gatherer. Environment quality reference, not a requirement for forests or this UI.'}</p>
    <div class="bo-controls">
      <label>View <select id="bo-view">${archive?'':'<option value="illustration">2D illustration</option>'}<option value="perspective">Blender viewpoint</option><option value="grid">Same camera + 1 m grid</option><option value="plan">Top-down diagnostic plan</option></select></label>
      <label>Figure <select id="bo-figure"><option value="mannequin">1.75 m scale mannequin</option><option value="none">Environment only</option><option value="approved">Approved NPC · scale check</option></select></label>
      <label><input type="checkbox" id="bo-labels" checked>Object labels</label>
      <label><input type="checkbox" id="bo-dialogue">Dialogue clearance</label>
      <label><input type="checkbox" id="bo-phone">Tall phone frame</label>
      <label><input type="checkbox" id="bo-grayscale">Grayscale</label>
      <label><input type="checkbox" id="bo-motion">NPC breathing / blinking</label>
      <label>NPC light <select id="bo-lighting"><option value="sunlit">Clearing sunlight</option><option value="original">Original colors</option></select></label>
      ${archive?'':`<button id="bo-playtest">Play in-game encounter</button><a href="KnightRush.html?backgroundlab=1&clearing=${previous?'crisp':'original'}">${previous?'View approved reference':'Compare previous image'}</a><span>${previous?'Previous image':'Approved crisp reference'} · one selected plate</span>`}
    </div><div id="bo-status" role="status">Loading Blender renders…</div>
    <div class="bo-grid"><figure class="bo-stage"><canvas id="bo-canvas" aria-label="Blender perspective blockout"></canvas><figcaption id="bo-caption">Layout candidate only. No new art style has been approved.</figcaption></figure>
    <aside class="bo-side"><div class="bo-note"><strong>Review this first</strong><p>${archive?'Do the house, person and furniture share a believable scale?':'Does the approved character belong in this clearing? Check the cottage, path, forest depth, bright greens and grounded props. Use Environment only to inspect the plate.'}</p></div>
      <h2>Real dimensions</h2><dl id="bo-dimensions"></dl>
      <h2>Inspect the layout</h2><div id="bo-links"></div><div class="bo-note" id="bo-inspect" aria-live="polite">Select an object or its numbered label.</div>
      <h2>Separate reference roles</h2><p>Style inputs contain ONLY approved character models, without backgrounds or UI. Blender supplies geometry, not foliage style. The generated illustration interprets that layout; it is not a pixel-exact camera render. Numbered labels describe Blender geometry only and are hidden on the illustration.</p>
      <p><a href="${base}${archive?'gatherer-clearing-v2':'gatherer-near-v3'}.blend" download>Download editable .blend</a><br><a href="${archive?base+'perspective.png':illustrationURL}" target="_blank" rel="noopener">Full-resolution image</a><br><a href="KnightRush.html?backgroundlab=1&backgroundVersion=v2">Approved spatial layout / v2</a><br><a href="KnightRush.html?backgroundlab=1">Current illustration trial</a><br><a href="KnightRush.html?backgroundlab=1&backgroundVersion=v1">Rejected 2D trial / archive</a><br><a href="KnightRush.html?artlab=1">Character Art Lab</a></p>
      <h2>Locked cutscene reference</h2><p>Approved ${reference.approvedOn}. <a href="${reference.plate}">Environment plate</a> · <a href="${reference.composite}">Actor + light reference</a> · <a href="tools/skills/knight-rush-cutscene/SKILL.md">Knight Rush Cutscene skill</a>. Reference files have protected hashes. Other scenes need their own review.</p><pre id="bo-error"></pre>
    </aside></div>`;document.body.appendChild(root);
  const $=id=>document.getElementById('bo-'+id),canvas=$('canvas'),ctx=canvas.getContext('2d');
  const opts={view:archive?'perspective':'illustration',figure:archive?'mannequin':'approved',labels:archive,dialogue:false,phone:false,grayscale:false,motion:!archive,lighting:archive?'original':'sunlit'};
  let renders=0,failures=[],data,images,lastFrame=0,clock=2.4,backplate=null,backplateBuilds=0;
  let resolution={};
  const state=()=>JSON.stringify([mode,gold,scrap,dist,loop,player.hp,journeyMushroomQuest,relics]);
  const viewApproval=()=>approval==='approved'&&(opts.view!=='illustration'||opts.lighting!=='sunlit'||opts.grayscale)?'diagnostic-view':approval;
  function report(){return {candidate,referenceId:approval==='approved'?reference.id:null,visualApproval:viewApproval(),options:{...opts},renders,backplateBuilds,resolution:{...resolution},failures:[...failures],scope:'Asset loading, projection metadata, framing and game-state purity. Approval comes from the explicit user registry, never test success.'};}
  const points=()=>opts.view==='plan'?data.planAnchors:data.anchors;
  function inspect(id){const entry=data.anchors.find(a=>a.id===id);if(!entry)return false;$('inspect').textContent=entry.name+' — '+entry.text;return true;}
  function draw(){
    if(!data||!images)return;
    const before=state(),dpr=Math.min(3,devicePixelRatio||1),pad=opts.phone?120:0,height=opts.dialogue?800+pad*2:512;
    canvas.style.aspectRatio='480 / '+height;
    const box=canvas.getBoundingClientRect(),displayScale=Math.min(box.width/480,box.height/height);
    const width=Math.max(1,Math.ceil(480*displayScale*dpr)),scale=width/480,physicalHeight=Math.ceil(height*scale);
    if(canvas.width!==width)canvas.width=width;if(canvas.height!==physicalHeight)canvas.height=physicalHeight;
    resolution={width,height:physicalHeight,logicalWidth:480,logicalHeight:height,displayWidth:480*displayScale,devicePixelRatio:devicePixelRatio||1,renderDpr:dpr};
    const y=opts.dialogue?pad:0,name=opts.view==='illustration'?'illustration':opts.view==='plan'?'plan':opts.view==='grid'?'metric-grid':opts.figure==='mannequin'?'perspective':'environment';
    // Resample the original image once at the displayed physical resolution;
    // the live vector character never passes through a small raster sprite.
    const key=[name,width,physicalHeight,y,opts.grayscale].join(':');
    if(backplate?.key!==key){
      const surface=document.createElement('canvas');surface.width=width;surface.height=physicalHeight;
      const c=surface.getContext('2d');c.setTransform(scale,0,0,scale,0,0);c.filter=opts.grayscale?'grayscale(1)':'none';
      c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.fillStyle='#20282b';c.fillRect(0,0,480,height);
      c.drawImage(images[name],0,y,480,512);backplate={key,surface};backplateBuilds++;
    }
    ctx.setTransform(1,0,0,1,0,0);ctx.filter='none';ctx.drawImage(backplate.surface,0,0);
    ctx.setTransform(scale,0,0,scale,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.filter=opts.grayscale?'grayscale(1)':'none';
    try{
      const savedG=g,savedClock=perfNow,savedTop=uiTop;
      try{
        g=ctx;perfNow=clock;ctx.save();ctx.translate(0,y);
        if(opts.figure==='approved'&&(opts.view==='perspective'||opts.view==='illustration')){
          const feet=data.actor.feet,head=data.actor.head,s=(feet[1]-head[1])/168;
          ctx.save();ctx.translate(feet[0],feet[1]);ctx.scale(s,s);
          if(opts.view==='illustration'&&opts.lighting==='sunlit')KRGathererLighting.draw(clock);else drawMushroomGatherer(clock);
          ctx.restore();
        }
        if(opts.dialogue){uiTop=0;drawJourneyNormalConversationPanel({content:'mushrooms',dialogue:'choice'});}
        ctx.restore();
      }finally{g=savedG;perfNow=savedClock;uiTop=savedTop;}
      if(opts.labels&&opts.view!=='illustration'){
        ctx.save();ctx.translate(0,y);ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';
        points().forEach((entry,i)=>{const [x,py]=entry.point;ctx.fillStyle='#111b20';ctx.fillRect(x-10,py-10,20,20);ctx.strokeStyle='#f5e2b2';ctx.lineWidth=1;ctx.strokeRect(x-10,py-10,20,20);ctx.fillStyle='#fff1cc';ctx.fillText(String(i+1),x,py+.5);});ctx.restore();
      }
      if(before!==state())throw Error('Layout preview changed gameplay state');
    }catch(e){if(!failures.includes(e.message))failures.push(e.message);}
    renders++;$('error').textContent=failures.join('\n');
    $('status').textContent=failures.length?'CHECK FAILED':`${opts.view==='illustration'?'2D ILLUSTRATION':'BLENDER SOURCE'} · ${width} × ${physicalHeight} render pixels · ${Math.round(resolution.displayWidth)} CSS px / ${dpr}× DPR · ${viewApproval().toUpperCase()}`;
    $('caption').textContent=opts.view==='illustration'?`Original live NPC geometry · ${opts.lighting==='sunlit'?'warm sunlight / cool reflected shade / soil contact shadows':'original approved palette'}. Not baked into the environment. Style inputs: isolated models only.`:opts.view==='plan'?'Diagnostic orthographic camera; 1 m squares. Same objects, no perspective restaging.':opts.figure==='approved'&&opts.view==='perspective'?'Approved 2D NPC at the projected 1.75 m height. This is a scale check, not final lighting or integration.':'Neutral greybox. Trees are spacing envelopes, NOT proposed final tree artwork.';
    return report();
  }
  function setOptions(values){
    Object.keys(opts).forEach(k=>{if(k in values)opts[k]=values[k];});
    if(opts.view==='illustration'&&opts.figure==='mannequin')opts.figure='approved';
    $('view').value=opts.view;$('figure').value=opts.figure;$('figure').disabled=!['perspective','illustration'].includes(opts.view);
    $('lighting').value=opts.lighting;$('lighting').disabled=opts.view!=='illustration';
    $('figure').querySelector('[value="mannequin"]').disabled=opts.view==='illustration';$('labels').disabled=opts.view==='illustration';
    for(const key of ['labels','dialogue','phone','grayscale','motion'])$(key).checked=opts[key];
    $('phone').disabled=!opts.dialogue;return draw();
  }
  try{
    await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='assets/encounters/gatherer-scene.js';s.onload=resolve;s.onerror=()=>reject(Error('Cannot load NPC scene materials'));document.body.appendChild(s);});
    await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=base+'layout.js';s.onload=resolve;s.onerror=()=>reject(Error('Cannot load Blender projection metadata'));document.body.appendChild(s);});
    data=window.KR_GATHERER_BLOCKOUT;
    if(!data||data.status!=='layout-candidate'||data.camera.projection!=='perspective')throw Error('Invalid blockout metadata');
    if(!Object.values(data.checks).every(Boolean))throw Error('Blender geometry checks failed');
    images=Object.fromEntries(await Promise.all(['perspective','environment','metric-grid','plan',...archive?[]:['illustration']].map(name=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve([name,img]);img.onerror=()=>reject(Error('Cannot load '+name+'.png'));img.src=name==='illustration'?illustrationURL:base+name+'.png';}))));
    for(const [name,img] of Object.entries(images)){
      if(name==='illustration'){if(Math.abs(img.naturalWidth/img.naturalHeight-15/16)>.005)throw Error('Illustration aspect differs from composition');}
      else if(img.naturalWidth!==960||img.naturalHeight!==1024)throw Error('Render aspect differs from calibrated camera');
    }
    for(const a of data.anchors)if(!a.point.every(Number.isFinite)||a.rect.some(v=>!Number.isFinite(v)))throw Error('Invalid projection');
    const d=data.dimensions;
    for(const [name,value] of [['Person',d.personHeight.toFixed(2)+' m'],['Door',d.doorWidth.toFixed(2)+' × '+d.doorHeight.toFixed(2)+' m'],['Table height',d.tableHeight.toFixed(2)+' m'],['Cottage footprint',d.cottageFootprint.join(' × ')+' m'],['Roof ridge',d.ridgeHeight.toFixed(2)+' m'],['Path width',d.pathWidth.toFixed(2)+' m']]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=value;$('dimensions').append(dt,dd);}
    data.anchors.forEach((entry,i)=>{const b=document.createElement('button');b.textContent=(i+1)+'. '+entry.name;b.onclick=()=>inspect(entry.id);$('links').appendChild(b);});
    for(const key of Object.keys(opts))$(key).onchange=e=>setOptions({[key]:e.target.type==='checkbox'?e.target.checked:e.target.value});
    canvas.onclick=e=>{
      if(opts.view==='illustration')return; // Geometry hotspots are not falsely assigned to generated art.
      const b=canvas.getBoundingClientRect(),height=canvas.height/(canvas.width/480),s=Math.min(b.width/480,b.height/height);
      const x=(e.clientX-b.left-(b.width-480*s)/2)/s,y=(e.clientY-b.top-(b.height-height*s)/2)/s-(opts.dialogue&&opts.phone?120:0);
      if(y<0||y>512)return;
      const near=points().find(p=>Math.hypot(x-p.point[0],y-p.point[1])<=18);
      const hit=near||(opts.view!=='plan'&&data.anchors.find(({rect:[a,b,w,h]})=>x>=a&&x<=a+w&&y>=b&&y<=b+h));if(hit)inspect(hit.id);
    };
    window.KRBackgroundBlockout={data,setOptions,draw,report,state,inspect};setOptions({});root.dataset.ready='1';
    new ResizeObserver(()=>draw()).observe(canvas);
    function tick(now){
      if(opts.motion&&!document.hidden&&now-lastFrame>=1000/30){clock+=Math.min(.05,(now-lastFrame)/1000);lastFrame=now;draw();}
      else if(!opts.motion||document.hidden)lastFrame=now;
      requestAnimationFrame(tick);
    }requestAnimationFrame(tick);
  }catch(e){$('status').textContent='BLOCKOUT LOAD FAILED';$('error').textContent=e.message;root.dataset.failed='1';}
  for(const type of ['touchstart','touchmove','touchend','pointerdown','pointerup','click'])root.addEventListener(type,e=>e.stopPropagation());
  window.addEventListener('keydown',e=>e.stopImmediatePropagation(),true);
  if(!archive){
    const dialog=document.createElement('dialog');dialog.className='bo-play-dialog';dialog.id='bo-play-dialog';
    dialog.innerHTML='<div class="bo-play-toolbar"><strong>Live game test · separate run</strong><button id="bo-play-reset">Restart encounter</button><button id="bo-play-phone">Tall phone / compact</button><button id="bo-play-close">Back to lab</button></div><iframe title="Live Mushroom Gatherer encounter" allow="autoplay"></iframe>';
    document.body.appendChild(dialog);const frame=dialog.querySelector('iframe');let savedMotion=false;
    function closePlay(){frame.removeAttribute('src');dialog.close();setOptions({motion:savedMotion});}
    const playURL=()=> 'KnightRush.html?backgroundplaytest=1&lighting='+opts.lighting+'&clearing='+(previous?'original':'crisp');
    $('playtest').onclick=()=>{savedMotion=opts.motion;setOptions({motion:false});dialog.showModal();frame.src=playURL();};
    $('play-close').onclick=closePlay;dialog.oncancel=e=>{e.preventDefault();closePlay();};
    $('play-reset').onclick=()=>{frame.src=playURL()+'&reset='+Date.now();};
    $('play-phone').onclick=()=>dialog.classList.toggle('phone');
  }
})();
