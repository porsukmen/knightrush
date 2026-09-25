const {chromium}=require('playwright'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {loadImage,createCanvas}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/basalt-forge');
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 const results=[];
 try{for(const [device,width,height,dpr]of [['desktop',775,1000,1],['phone',390,844,2]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr}),errors=[];
  let peakCache=0;
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  if(device==='phone')await page.addInitScript(()=>{
   Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>4});
   Object.defineProperty(navigator,'deviceMemory',{get:()=>4});
  });
  await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
  await page.waitForFunction(()=>window.KRBasaltForge&&window.KRSunlitForest);
  const run=s=>page.evaluate(s=>(0,eval)(s),s);
  const sampleCache=async()=>{peakCache=Math.max(peakCache,await run('KRSunlitForest.report().cacheBytes'));assert(peakCache<=5*1048576);};
  const start=async direction=>run(`roadLabState.direction=${direction};roadLabState.entry=${direction!==0};
   Math.random=(()=>{let seed=731;return()=>((seed=Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;})();
   startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='forge'));godMode=true;SFX.setTestMuted(true);`);
  await start(0);
  assert(await run('Math.abs(roadLabState.fixture.edge.length-roadLabState.fixture.edge.baseLength*JOURNEY_ROAD_RULES.specialLengthScale)<.001'));
  assert(await run('Math.abs(roadLabState.slot.at-(roadLabState.fixture.node.at+roadLabState.fixture.edge.length*.52))<.001'));
  // Integration coverage: no hand-assigned themes. Observe the genuine spawn
  // stream and the renderer it reaches while travelling the playable road.
  const natural=await run(`(()=>{
   const seen=new Set(),wrong=[],drawn={},draw=KRBasaltForge.hazard;
   KRBasaltForge.hazard=function(o,p){drawn[o.kind]=(drawn[o.kind]||0)+1;return draw(o,p);};
   try{for(let frame=0;frame<7000&&mode==='run'&&dist<roadLabState.slot.at-100;frame++){
    update(1/60);
    for(const o of obstacles){seen.add(o.kind);if(journeyObstacleThemeAt(dist+o.z)==='forge'&&o.roadTheme!=='forge')wrong.push([o.kind,o.roadTheme]);}
    if(frame%12===0)render();
   }return {seen:[...seen],wrong,drawn};}finally{KRBasaltForge.hazard=draw;}
  })()`);
  assert.deepEqual(natural.wrong,[],'real spawned hazards must inherit forge theme');
  for(const kind of ['boulder','pond','root'])assert(natural.drawn[kind]>0,'real route must draw '+kind);
  await page.screenshot({path:path.join(out,device+'-natural-spawn.png')});
  await start(0);
  const palette=await run(`(()=>{const e=roadLabState.fixture.edge,s=e.pieces[0].start;
   const layout=KRBasaltForge.layout(e),before=JSON.stringify(layout);render();
   return {start:KRSunlitForest.roadColorAt(e,s),middle:KRSunlitForest.roadColorAt(e,s+180),
    end:KRSunlitForest.roadColorAt(e,e.pieces.at(-1).end),stable:before===JSON.stringify(KRBasaltForge.layout(e)),
    kinds:[...new Set(layout.map(p=>p.kind))],ores:[...new Set(layout.filter(p=>p.kind==='ore').map(p=>p.ore))]};})()`);
  assert.equal(palette.start,'#d6b16f');assert.equal(palette.end,'#d6b16f');assert.equal(palette.middle,'#555860');assert(palette.stable);
  for(const gap of [85,42,17]){
   await run(`for(let i=0;i<3000&&mode==='run'&&dist<roadLabState.slot.at-${gap};i++)update(1/60);
    perfNow=5;for(let i=0;i<35;i++)render();`);
   assert.equal(await run('mode'),'run');await sampleCache();await page.screenshot({path:path.join(out,`${device}-road-${gap}.png`)});
  }
  await start(0);
  await run(`for(let i=0;i<3000&&mode==='run'&&dist<roadLabState.slot.at-110;i++)update(1/60);
   globalThis.basaltSavedObstacles=obstacles;`);
  for(const kind of ['boulder','pond','root'])for(const lanes of [1,2,3]){
   await run(`(()=>{const req=[null,null,null];for(let i=0;i<${lanes};i++)req[${lanes}===1?1:i]='${kind==='root'?'duck':'jump'}';
    const o=new ObstacleEntity('${kind}',32,req,'L');o.roadTheme='forge';o.seed=731;obstacles=[o];render();})()`);
   const state=await run('JSON.stringify(obstacles)');await run('render();');assert.equal(await run('JSON.stringify(obstacles)'),state);
   await sampleCache();await page.screenshot({path:path.join(out,`${device}-${kind}-${lanes}lane.png`)});
   if(kind!=='root'){
    await run('obstacles[0].z=8;render();');
    await page.screenshot({path:path.join(out,`${device}-${kind}-${lanes}lane-near.png`)});
   }
  }
  await run('obstacles=basaltSavedObstacles;delete globalThis.basaltSavedObstacles;');
  await run(`for(let i=0;i<3000&&mode==='run';i++)update(1/60);gold=1000;scrap=100;render();`);
  assert.equal(await run('mode'),'shop');assert(await run('!!blacksmithShop.roadToken'));
  await page.waitForFunction(()=>window.KRCutscenes?.report().state==='ready');await run('render();');
  assert.equal(await run('KRCutscenes.report().scene'),'basalt-forge');
  const plate=await run('KREventVisuals.report()');
  assert.equal(plate.tier,device==='phone'?'mobile':'standard');
  assert.equal(plate.reservedBytes,device==='phone'?1769472:6290112);
  await page.screenshot({path:path.join(out,device+'-workshop.png')});
  await run('render();KRBasaltForge.drawCutscene(5,false);');
  const neutral=await page.screenshot({path:path.join(out,device+'-lighting-neutral.png')});
  await run('render();KRBasaltForge.drawCutscene(5,true);');
  const lit=await page.screenshot({path:path.join(out,device+'-lighting-forge.png')});
  const pixels=async buffer=>{const img=await loadImage(buffer),c=createCanvas(img.width,img.height),ctx=c.getContext('2d');
   ctx.drawImage(img,0,0);return ctx.getImageData(0,0,img.width,img.height).data;};
  const a=await pixels(neutral),b=await pixels(lit),lighting={changedPixels:0};
  for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2])lighting.changedPixels++;
  assert(lighting.changedPixels>100,'scene lighting must actually repaint the actor');
  const rig=await run(`(()=>{const k=KRBasaltForge;let error=0,step=0,last;
   for(let i=0;i<=240;i++){const a=k.armPose(i/240);
    error=Math.max(error,Math.abs(Math.hypot(a.ex-a.sx,a.ey-a.sy)-k.ARM_LENGTHS.upper),Math.abs(Math.hypot(a.hx-a.ex,a.hy-a.ey)-k.ARM_LENGTHS.lower));
    if(last)step=Math.max(step,Math.hypot(a.hx-last.hx,a.hy-last.hy));last=a;}
   const hit=k.armPose(0),x=k.ACTOR.x+hit.contactX*k.ACTOR.scale,y=k.ACTOR.y+hit.contactY*k.ACTOR.scale;
   return {error,step,contact:Math.hypot(x-k.FORGE_CONTACT.x,y-k.FORGE_CONTACT.y)};})()`);
  assert(rig.error<1e-8&&rig.contact<1e-8&&rig.step<2,'rig lengths, continuity and contact must hold');
  // Input uses the visible new slots and buttons; prices/outcomes use real rules.
  const purchase=await run(`(()=>{const r=KRBasaltForge.card(2);shopTap({x:r.x+20,y:r.y+20});
   const selected=blacksmithShop.selected,q=smithQuote(runSkills[selected]),g0=gold,s0=scrap;
   const r2=KRBasaltForge.UI.confirm;shopTap({x:r2.x+20,y:r2.y+20});
   return {selected,phase:blacksmithShop.phase,paid:g0-gold,salvaged:s0-scrap,price:q.price,scrapCost:q.scrapCost};})()`);
  assert.equal(purchase.selected,2);assert.equal(purchase.phase,'forge');assert.equal(purchase.paid,purchase.price);assert.equal(purchase.salvaged,purchase.scrapCost);
  await run('globalThis.savedForgeOrder={...blacksmithShop.order};');
  for(const [kind,id]of [['bow','sharpshoot'],['shield','shield_bash'],['gauntlet','call_squire']]){
   await run(`blacksmithShop.order.skillId='${id}';blacksmithShop.clock=1.15;render();`);
   await page.screenshot({path:path.join(out,device+'-anvil-'+kind+'.png')});
  }
  await run('blacksmithShop.order=savedForgeOrder;delete globalThis.savedForgeOrder;blacksmithShop.clock=0;');
  await run('updateBlacksmithShop(1.18);render();');await page.screenshot({path:path.join(out,device+'-hammer-raised.png')});
  await run('updateBlacksmithShop(.39);render();');await page.screenshot({path:path.join(out,device+'-hammer-contact.png')});
  await run('updateBlacksmithShop(2.91);render();');assert.equal(await run('blacksmithShop.phase'),'result');
  await page.screenshot({path:path.join(out,device+'-result.png')});
  await run(`shopTap({x:70,y:695});shopTap({x:350,y:695});update(.016);render();`);
  assert.equal(await run('mode'),'run');assert.equal(await run('journeyVenueVisible(roadLabState.slot.id)'),false);
  assert.equal(await run('KRCutscenes.report().state'),'idle');
  await run(`for(let i=0;i<3000&&mode==='run'&&dist<roadLabState.fixture.edge.pieces.at(-1).end-18;i++)update(1/60);render();`);
  await page.screenshot({path:path.join(out,device+'-exit.png')});
  for(const direction of [-1,1]){
   await start(direction);
   await run(`for(let i=0;i<400&&dist<roadLabState.fixture.node.at-20;i++)update(1/60);
    player.x=player.lane=${direction+1};chooseJourneyDirection(${direction});
    for(let i=0;i<300&&journey.phase!=='turning';i++)update(1/60);
    for(let i=0;i<30;i++)update(1/120);render();`);
   assert.equal(await run('journey.phase'),'turning');await page.screenshot({path:path.join(out,`${device}-turn-${direction}.png`)});
   assert(await run("journey.sunlitPreview.obstacles.every(item=>item.entity.roadTheme===journeyObstacleThemeAt(item.at))"),'turn preview must inherit route theme');
   await run('for(let i=0;i<240;i++)update(1/120);render();');
   assert.notEqual(await run('journey.phase'),'turning');
   assert(await run("obstacles.every(o=>o.roadTheme===journeyObstacleThemeAt(dist+o.z))"),'turn handoff must keep route theme');
  }
  // Town smith is still the original screen and renderer path.
  await run('openBlacksmithLab();render();');assert.equal(await run('!!blacksmithShop.roadToken'),false);
  await page.screenshot({path:path.join(out,device+'-town-unchanged.png')});
  assert.deepEqual(errors,[]);await sampleCache();
  results.push({device,palette,purchase,peakCache,plate,natural,lighting,rig});await page.close();
 }fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(results,null,2));console.log('BASALT_FORGE_OK',JSON.stringify(results));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
