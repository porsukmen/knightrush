const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/mossy-inn');
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 try{for(const [device,width,height,dpr]of [['desktop',775,1000,1],['phone',390,844,2]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(({phone})=>{window.requestAnimationFrame=()=>0;Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>phone?4:8});Object.defineProperty(navigator,'deviceMemory',{get:()=>phone?4:8});},{phone:device==='phone'});
  await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
  await page.waitForFunction(()=>window.KRMossyInn&&window.KRSunlitForest);
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  const shot=async name=>{await run('render();');await page.screenshot({path:path.join(out,device+'-'+name+'.png')});};
  const start=async(direction=0)=>run(`Math.random=(()=>{let seed=731;return()=>((seed=Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;})();initAmbient();lastObsFull=false;roadLabState.entry=${direction!==0};roadLabState.direction=${direction};startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='inn'));godMode=true;SFX.setTestMuted(true);`);
  await start();
  const seen=await run(`(()=>{const counts={},bad=[],original=KRMossyInn.hazard;KRMossyInn.hazard=(o,p)=>{counts[o.kind]=(counts[o.kind]||0)+1;return original(o,p);};
   try{for(let f=0;f<8000&&mode==='run'&&dist<roadLabState.slot.at-100;f++){update(1/60);for(const o of obstacles){if(journeyObstacleThemeAt(dist+o.z)==='inn'&&o.roadTheme!=='inn')bad.push(o.kind);
    if(o.roadTheme==='inn'&&o.kind==='root'&&o.lanes.some(l=>o.req[l]!=='duck'))bad.push('linen-must-duck');}if(f%12===0)render();}return{counts,bad};}finally{KRMossyInn.hazard=original;}})()`);
  assert.deepEqual(seen.bad,[]);assert(seen.counts.boulder&&seen.counts.root&&seen.counts.pond);
  const collisions=await run(`(()=>{const damage=damagePlayer,relic=hasRelic,saved=obstacles,coins=pickups,px=player.x,jt=player.jumpT,dt=player.duckT;
   let hits=0,checks=0;try{damagePlayer=()=>hits++;hasRelic=()=>false;pickups=[];
    for(let mask=1;mask<8;mask++)for(let lane=0;lane<3;lane++)for(const action of ['stand','jump','duck']){
     const req=[0,1,2].map(l=>mask&(1<<l)?'duck':null),o=new ObstacleEntity('root',.1,req,'L');o.roadTheme='inn';o.prevZ=2;obstacles=[o];
     player.x=lane;player.jumpT=action==='jump'?jumpDur()*.5:-1;player.duckT=action==='duck'?.2:-1;hits=0;updateRunCollisions();
     if(hits!==(req[lane]&&action!=='duck'?1:0))throw Error('Linen collision mismatch');checks++;
    }return checks;
   }finally{damagePlayer=damage;hasRelic=relic;obstacles=saved;pickups=coins;player.x=px;player.jumpT=jt;player.duckT=dt;}})()`);
  assert.equal(collisions,63);
  await shot('road');
  for(const kind of ['boulder','pond','root'])for(const lanes of [[1],[0,1],[0,1,2],[0,2]]){
   await run(`const innReq=[null,null,null];for(const i of ${JSON.stringify(lanes)})innReq[i]='${kind==='root'?'duck':'jump'}';obstacles=[new ObstacleEntity('${kind}',20,innReq,'L')];obstacles[0].roadTheme=journeyObstacleThemeAt(dist+20);`);
   await shot(kind+'-'+lanes.join(''));
  }
  await run(`obstacles=[new ObstacleEntity('root',20,['duck','duck',null],'L')];obstacles[0].roadTheme='inn';`);await shot('duck');
  for(const depth of [65,8]){await run(`obstacles=[new ObstacleEntity('root',${depth},['duck',null,'duck'],'L')];obstacles[0].roadTheme='inn';`);await shot('linen-gap-depth-'+depth);}
  const pit=await run(`(()=>{const draw=KRSunlitArt.drawFloorShape,shapes=[];
   try{KRSunlitArt.drawFloorShape=s=>shapes.push(s);KRMossyInn.hazard({kind:'pond',lanes:[0,2]},(z,x)=>({x,z}));
    return{colors:[...new Set(shapes.map(s=>s.color))],safe:shapes.every(s=>s.vertices.every(p=>p.x<-2)||s.vertices.every(p=>p.x>2))};
   }finally{KRSunlitArt.drawFloorShape=draw;}})()`);
  assert(pit.safe,'Dry pits must not close a separated safe lane');assert(pit.colors.includes('#242720'));assert(!pit.colors.includes('#497b73'),'No water in inn pit');
  for(const depth of [65,8]){await run(`obstacles=[new ObstacleEntity('boulder',${depth},[null,'jump',null],'L')];obstacles[0].roadTheme='inn';`);await shot('cask-depth-'+depth);}
  await run('obstacles=[];pickups=[];');
  for(const gap of [70,35,12,0]){await run(`dist=journeyRoadEventTriggerAt(roadLabState.slot)-${gap};roadScroll=dist;`);await shot('venue-'+gap);}
  await run('gold=100;player.currentHealthUnits=2;updateJourneyRoadEvents(0);');
  assert.equal(await run('mode'),'run','Inn must wait for an outward swipe');
  await run("player.x=player.lane=2;handleAction('right',null,null,{fresh:true,mode:'run',roadStop:roadLabState.slot.id});");
  assert.equal(await run('mode'),'journeyevent');await page.waitForFunction(()=>KRCutscenes?.report().state==='ready');
  await run('updateJourneyRoadEvents(.3);');await shot('interior');
  const state=await run('JSON.stringify([gold,dist,player.currentHealthUnits,journeyRoadEventSession.context.inn])');
  await run('KRMossyInn.drawInterior(journeyRoadEventSession.context,false);');await page.screenshot({path:path.join(out,device+'-neutral-light.png')});
  await run('KRMossyInn.drawInterior(journeyRoadEventSession.context,true);');await page.screenshot({path:path.join(out,device+'-scene-light.png')});
  assert.equal(await run('JSON.stringify([gold,dist,player.currentHealthUnits,journeyRoadEventSession.context.inn])'),state);
  const manager=await run('KREventVisuals.report()');assert.equal(manager.active,'mossy-inn');assert.equal(manager.entries.length,1);assert.equal(manager.tier,device==='phone'?'mobile':'standard');
  const tap=async(x,y)=>{const p=await run(`({x:(${x}*viewScale+viewX)/renderDpr(),y:(${y}*viewScale+viewY)/renderDpr()})`);await page.touchscreen.tap(p.x,p.y);};
  await tap(232,210);assert.equal(await run('gold'),100,'Talking alone does not charge coins');assert(await run('journeyRoadEventSession.context.notice.includes("clean sheets")'));
  const cost=await run('18+loop*4');await tap(240,562);assert.equal(await run('gold'),100-cost);assert(await run('player.currentHealthUnits===player.maxHealthUnits'));
  await tap(240,562);assert.equal(await run('gold'),100-cost,'Room purchase is one-shot');await shot('rested');
  await tap(240,625);assert((await run('INN_GAMES.map(g=>g.id)')).includes(await run('mode')));assert.equal(await run('gold'),95-cost);
  await run("setMode('journeyinnresume');updateJourneyRoadEvents(.3);");assert.equal(await run('mode'),'journeyevent');await shot('game-return');
  await tap(240,724);assert.equal(await run('mode'),'run');assert.equal(await run('KREventVisuals.report().reservedBytes'),0);await shot('return-road');
  await run('updateJourneyRoadEvents(0);');assert.equal(await run('mode'),'run');
  for(const direction of [-1,1]){
   await start(direction);await run(`for(let i=0;i<400&&dist<roadLabState.fixture.node.at-20;i++)update(1/60);player.x=player.lane=${direction+1};chooseJourneyDirection(${direction});for(let i=0;i<300&&journey.phase!=='turning';i++)update(1/60);for(let i=0;i<30;i++)update(1/120);`);await shot('turn'+direction);
   assert(await run('journey.sunlitPreview.obstacles.every(i=>i.entity.roadTheme===journeyObstacleThemeAt(i.at))'));
   assert(await run("journey.sunlitPreview.obstacles.filter(i=>i.entity.kind==='root'&&i.entity.roadTheme==='inn').every(i=>i.entity.lanes.every(l=>i.entity.req[l]==='duck'))"),'Incoming linen must already have duck requirements');
  }
  await start();await run("dist=journeyRoadEventTriggerAt(roadLabState.slot);updateJourneyRoadEvents(0);player.x=player.lane=2;handleAction('right',null,null,{fresh:true,mode:'run',roadStop:roadLabState.slot.id});setMode('menu');");await page.waitForTimeout(150);assert.equal(await run('KREventVisuals.report().reservedBytes'),0);
  assert.deepEqual(errors,[]);assert(await run('KRSunlitForest.report().cacheBytes<=5*1048576'));
  console.log(device,JSON.stringify({seen,manager}));await page.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
