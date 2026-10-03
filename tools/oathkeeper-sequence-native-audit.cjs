'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const sharp=require('sharp');
const base=process.env.KR_BASE_URL||'http://127.0.0.1:8765';
const out=path.resolve(__dirname,'../output/oathkeeper-sequence');
const routesOnly=process.argv.includes('--routes-only'),withRoutes=routesOnly||process.argv.includes('--routes');
const capturesOnly=process.argv.includes('--captures-only');
const controlsOnly=process.argv.includes('--controls-only');
const routeData=withRoutes?JSON.parse(fs.readFileSync(path.join(out,'data-audit.json'),'utf8')):null;
const sourceHash=file=>crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'..',file))).digest('hex');
const controlSources=['KnightRush.html','labs/boss-sequence-runtime.js','labs/oathkeeper-encounter.js','assets/mounted-combat.js','labs/mounted-knight-run-motion.js'];
const controlHashes=Object.fromEntries(controlSources.map(file=>[file,sourceHash(file)]));
if(routeData){
 assert.deepEqual(routeData.failures,[],'Route replay requires a passing current data audit first');
 assert.equal(routeData.routeSearch?.status,'completed','Route search is obsolete/skipped; no current route-replay success may be claimed');
 assert.equal(routeData.routeSearch?.inputMode,'continuous','This replay supports only the legacy continuous-input solver');
 assert(routeData.routes?.length>0,'An empty route report cannot establish encounter feasibility');
 for(const file of ['KnightRush.html','labs/boss-sequence-runtime.js','labs/oathkeeper-encounter.js','labs/mounted-knight-run-motion.js','assets/mounted-combat.js'])
  assert(routeData.hashes[file],'Route evidence lacks current control/jump source identity: '+file);
 for(const [file,hash] of Object.entries(routeData.hashes))
  assert.equal(sourceHash(file),hash,'Data-audit source changed before native replay: '+file);
}
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const errors=[],missing=[];let report={};
 try{
  const context=await browser.newContext({viewport:{width:480,height:850},hasTouch:true,deviceScaleFactor:1});
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{
   if(message.type()!=='error')return;
   const location=message.location().url||'';
   if(location&&new URL(location,base).pathname==='/favicon.ico')return;
   errors.push(message.text()+' @ '+location);
  });
  page.on('response',response=>{if(response.status()>=400&&!response.url().endsWith('/favicon.ico'))
   missing.push({url:response.url(),status:response.status()});});
  // Boot all real production/opt-in assets, then drive the native update loop
  // deterministically. No second gameplay implementation is used by this audit.
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  await page.goto(base+'/KnightRush.html?oathkeeperlab=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.KROathkeeperEncounter&&window.KRMountedRunner?.ready&&
   typeof boss!=='undefined'&&boss?.definitionId==='oathkeeper',{},{polling:100,timeout:120000});
  report.immortalPractice=await page.evaluate(()=>(0,eval)(`(()=>{
   SFX.setTestMuted(true);const before=player.currentHealthUnits;let ticks=0;
   while(boss.phase==='dodge'&&player.alive&&ticks++<1600)update(1/120);
   return {godMode,before,after:player.currentHealthUnits,alive:player.alive,
    contacts:boss._lastSequence?.stats.hits||0,phase:boss.phase};
  })()`));
  assert.equal(report.immortalPractice.godMode,true,'Requested default practice must be immortal');
  assert(report.immortalPractice.contacts>0,'Practice fixture must actually contact stones');
  assert.equal(report.immortalPractice.after,report.immortalPractice.before);
  assert.equal(report.immortalPractice.alive,true);assert.equal(report.immortalPractice.phase,'player');
  // All damage/balance assertions below explicitly choose mortal mode, so a
  // default practice setting cannot turn them into false immunity passes.
  await page.goto(base+'/KnightRush.html?oathkeeperlab=1&mortal=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.KROathkeeperEncounter&&window.KRMountedRunner?.ready&&
   typeof boss!=='undefined'&&boss?.definitionId==='oathkeeper',{},{polling:100,timeout:120000});
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  report.initial=await run(`(()=>{SFX.setTestMuted(true);return {mode,definition:boss.definitionId,
   alive:player.alive,health:player.currentHealthUnits,maxHealth:player.maxHealthUnits,
   godMode,moveLab:!!boss._moveLab,turnCombat:isTurnCombat(),mountedReady:KRMountedRunner.ready,bossZ:boss.z};})()`);
  assert.equal(report.initial.mode,'boss');assert.equal(report.initial.alive,true);
  assert(report.initial.health>0&&report.initial.health===report.initial.maxHealth);
  assert.equal(report.initial.godMode,false,'Explicit mortal mode must retain real damage');
  assert.equal(report.initial.moveLab,false);assert.equal(report.initial.turnCombat,true);
  const captureActiveLintel=async()=>{
   const states=[];
   for(const [posture,width,height] of [['standing',480,850],['duck',480,850],['duck',390,844]]){
    await page.setViewportSize({width,height});
    const state=await run(`(()=>{
     resize();KROathkeeperEncounter.start();
     player.x=player.lane=1;player.jumpT=-1;
     player.duckT=${posture==='duck'?'CFG.DUCK_TIME*.5':'-1'};player.invuln=0;
     KROathkeeperEncounter.sequenceDriver.startRecipe(boss,0,4.03);
     perfNow=204.03;flashA=0;shakeMag=0;bannerT=0;floaters.length=0;particles.length=0;
     paused=false;pausePhotoMode=false;render();
     const volumes=structuredClone(samplePlayerHurtVolumes()),
      activeHazards=boss._sequence.frame.hazards.filter(h=>h.active).map(h=>({id:h.id,
       contact:h.primitives.some(p=>KRBossSequenceRuntime.touchesVolumes(p,p,volumes,volumes)),
       primitives:h.primitives.map(p=>({x:p.x,y:p.y,r:p.r}))}));
     return {id:boss._sequence.recipe.id,t:boss._sequence.time,posture:'${posture}',
      viewport:{width:${width},height:${height}},nativeHUD:!pausePhotoMode&&!paused,
      duckT:player.duckT,duckAmount:duckPostureAmountAt(player.duckT),volumes,activeHazards};
    })()`);
    const file=path.join(out,`broken_court-active-lintel-4_03-${posture}-${width}x${height}-hud.png`);
    await page.screenshot({path:file});states.push({...state,file});
    assert.equal(state.nativeHUD,true,'Delivery capture must retain actual native HUD');
    assert.equal(state.activeHazards.find(h=>h.id==='carved-lintel')?.contact,posture==='standing',
     'Active lintel must contact standing rider but clear real mid-clock duck posture');
   }
   const result={fixture:'Native rendering and real mid-clock duck posture at active lintel time; no paused photo mode. Fixed-frame contact geometry only; no full-turn feasibility claim under current discrete lane controls.',states};
   fs.writeFileSync(path.join(out,'native-lintel-clearance.json'),JSON.stringify(result,null,2));
   return result;
  };
  if(capturesOnly){
   const capture=await captureActiveLintel();
   assert.deepEqual(errors,[],'Browser errors during active-lintel captures');
   assert.deepEqual(missing,[],'Missing active-lintel assets');
   console.log('OATHKEEPER_NATIVE_CAPTURES_OK',JSON.stringify(capture));return;
  }
  if(routeData){
   report.routeReplay=await page.evaluate(({routes,hashes})=>{
    const results=[];
    for(const route of routes)for(const hz of [30,60,120]){
     KROathkeeperEncounter.start();
     const driver=KROathkeeperEncounter.sequenceDriver,index=KROathkeeperSequences.recipes.findIndex(r=>r.id===route.id);
     if(index<0)throw Error('Native recipe absent: '+route.id);
     player.x=player.lane=route.startLane;player.jumpT=player.duckT=-1;
     player.invuln=999;
     // Do not let incidental native Perfect counters end the encounter early.
     // This fixture changes no player motion, contact geometry or hazard rules.
     boss.hp=boss.maxhp=1e9;
     driver.startRecipe(boss,index,0);
     const healthBefore=player.currentHealthUnits,contacts=[],seen=new Set(),dt=1/hz,
      duration=boss._sequence.recipe.duration;
     let input=0,ticks=0;
     for(let tick=1;tick<=Math.ceil(duration*hz)+3&&boss.phase==='dodge';tick++){
      const beforeTime=(tick-1)*dt;
      while(input<route.inputs.length&&route.inputs[input].t<=beforeTime+.00006){
       const command=route.inputs[input++];
       driver.key(boss,'left',command.dir<0);driver.key(boss,'right',command.dir>0);
       if(command.action==='jump')playerAction('up');
       else if(command.action==='duck'||command.action==='queue-duck')playerAction('down');
      }
      update(dt);ticks++;
      const state=boss._sequence,verdicts=state?.resolved||boss._lastSequence?.resolved||{};
      for(const [id,result] of Object.entries(verdicts))if(result==='hit'&&!seen.has(id)){
       seen.add(id);const hazard=state?.frame.hazards.find(h=>h.id===id);
       contacts.push({id,t:state?.time??duration,lane:player.x,jumpT:player.jumpT,duckT:player.duckT,
        jumpHeight:jumpHeight(),volumes:structuredClone(samplePlayerHurtVolumes()),
        primitives:hazard?hazard.primitives.map(p=>({x:p.x,y:p.y,r:p.r})):[]});
      }
     }
     const stats=boss._lastSequence?.stats||boss._sequence?.stats||{},healthAfter=player.currentHealthUnits;
     results.push({id:route.id,startLane:route.startLane,hz,ticks,inputCount:input,
      phase:boss.phase,lastId:boss._lastSequence?.id,finalLane:player.x,hits:stats.hits??null,
      healthBefore,healthAfter,contacts,
      passed:stats.hits===0&&healthAfter===healthBefore&&boss.phase==='player'&&boss._lastSequence?.id===route.id});
    }
    return {hashes,fixture:'Actual native update/playerAction and held-key driver. Native invulnerability only keeps failures running; success requires zero contact verdicts. Boss HP enlarged only to prevent Perfect-counter early kills.',
     rateHz:[30,60,120],results,passed:results.every(r=>r.passed)};
   },{routes:routeData.routes,hashes:routeData.hashes});
   for(const [file,hash] of Object.entries(routeData.hashes))
    assert.equal(sourceHash(file),hash,'Source changed during native route replay: '+file);
   fs.writeFileSync(path.join(out,'native-route-report.json'),JSON.stringify(report.routeReplay,null,2));
   assert.equal(report.routeReplay.passed,true,'At least one generated route touched a real native hazard; see native-route-report.json');
   if(routesOnly){
    assert.deepEqual(errors,[],'Browser errors during route replay');assert.deepEqual(missing,[],'Missing route assets');
   console.log('OATHKEEPER_NATIVE_ROUTES_OK',JSON.stringify({cases:report.routeReplay.results.length,
     rateHz:report.routeReplay.rateHz,starts:[0,1,2],zeroNativeContacts:true}));
    return;
   }
   // Continue the combined audit from the same fresh, unprotected native state
   // used by its ordinary launch path, not the final replay's immunity fixture.
   await run('KROathkeeperEncounter.start();');
  }
  report.damage=await run(`(()=>{
   const before=player.currentHealthUnits;let frames=0;
   while(player.currentHealthUnits===before&&player.alive&&frames++<240)update(1/120);
   return {frames,time:boss._sequence?.time,before,after:player.currentHealthUnits,
    alive:player.alive,godMode,phase:boss.phase,state:boss.state};
  })()`);
  // The first guaranteed low row contacts at ~2.14 seconds; allow 3 seconds.
  if(report.damage.after===report.damage.before)report.damage=await run(`(()=>{
   const before=player.currentHealthUnits;let frames=0;
   while(player.currentHealthUnits===before&&player.alive&&frames++<180)update(1/120);
   return {frames,time:boss._sequence?.time,before,after:player.currentHealthUnits,
    alive:player.alive,godMode,phase:boss.phase,state:boss.state};
  })()`);
  assert(report.damage.after<report.damage.before,'Standing in a real stone must cause native health loss');
  assert.equal(report.damage.alive,true,'A first ordinary sequence hit must not be an artificial one-shot');
  assert.equal(report.damage.godMode,false);
  report.turnFixture='After the real unprotected hit test, native player.invuln protects only the turn-progression fixture; this is not a no-hit route or difficulty proof.';
  report.turns=await run(`(()=>{
   const results=[];
   // Damage was checked above with no immunity. Protect this fixture now so all
   // four complete schedules can be examined without replacing native damage.
   for(let index=0;index<4;index++){
    player.invuln=99;let frames=0;
    while(boss.phase==='dodge'&&player.alive&&frames++<1800)update(1/120);
    results.push({index,id:boss._lastSequence?.id,phase:boss.phase,state:boss.state,
     ap:boss.ap,apMax:boss.apMax,enemyTurn:boss.enemyTurn,sequenceCleared:boss._sequence===null,
     liveHazards:hazards.filter(h=>h.src===BOSS_SOURCE&&!h.done).length,alive:player.alive,frames});
    if(index<3){endPlayerTurn();update(1/120);}
   }return results;
  })()`);
  assert.deepEqual(report.turns.map(t=>t.id),['broken_court','crossed_seals','returning_oath','last_oath']);
  for(const turn of report.turns){assert.equal(turn.phase,'player');assert.equal(turn.ap,turn.apMax);
   assert.equal(turn.sequenceCleared,true);assert.equal(turn.liveHazards,0);assert.equal(turn.alive,true);}
  await run(`KROathkeeperEncounter.start();update(1/120);player.invuln=99;player.x=player.lane=0;`);
  assert.equal(await run('KROathkeeperEncounter.sequenceDriver.inputMode'),'lanes');
  await page.keyboard.down('ArrowRight');await run('update(1/120)');
  const firstStep=await run('({x:player.x,lane:player.lane,ease:CFG.LANE_EASE})');
  assert.equal(firstStep.lane,1,'A right key edge must request exactly one lane');
  assert(Math.abs(firstStep.x-firstStep.ease/120)<1e-12,'Native lane easing must own the actual position');
  await page.keyboard.down('ArrowRight');await run('for(let i=0;i<17;i++)update(1/120)');
  report.keyboard={firstStep,held:await run('({x:player.x,lane:player.lane,heading:KRMountedRunner.laneMotion.heading})')};
  assert.equal(report.keyboard.held.lane,1,'A held or repeated key must not march through multiple lanes');
  assert(report.keyboard.held.x>0&&report.keyboard.held.x<1);
  assert(Math.abs(report.keyboard.held.heading)>0,'Approved mounted steering receives the eased lane movement');
  await page.keyboard.up('ArrowRight');await run('for(let i=0;i<12;i++)update(1/120)');
  report.keyboard.released=await run('({x:player.x,lane:player.lane})');
  assert.equal(report.keyboard.released.lane,1);
  assert(report.keyboard.released.x>report.keyboard.held.x&&report.keyboard.released.x<1,
   'Releasing the key must finish gliding to its integer lane destination');
  await page.keyboard.press('ArrowRight');assert.equal(await run('player.lane'),2,'A fresh edge may request the next lane');
  await run('for(let i=0;i<60;i++)update(1/120)');
  await page.keyboard.press('ArrowRight');assert.equal(await run('player.lane'),2,'Lane targets remain bounded');
  const airStart=await run('player.x');
  await page.keyboard.press('ArrowUp');await page.keyboard.press('ArrowLeft');
  await run('for(let i=0;i<15;i++)update(1/120)');
  report.airControl=await run('({x:player.x,lane:player.lane,jumpT:player.jumpT,height:jumpHeight()})');
  assert.equal(report.airControl.lane,1);
  assert(report.airControl.x<airStart&&report.airControl.height>0,'Native jump and discrete midair lane change coexist');
  await run('player.jumpT=jumpDur()-.15');
  const jumpBefore=await run('player.jumpT');await page.keyboard.press('ArrowDown');
  assert.equal(await run('player.jumpT'),jumpBefore,'Down buffer must not fast-fall the native mount');
  await run('for(let i=0;i<20;i++)update(1/120)');
  report.landingDuck=await run('({jumpT:player.jumpT,duckT:player.duckT,duck:duckPostureAmountAt(player.duckT)})');
  assert.equal(report.landingDuck.jumpT,-1);assert(report.landingDuck.duckT>=0);

  await run('KROathkeeperEncounter.start();update(1/120);player.invuln=99;player.x=player.lane=0;');
  const points=await run(`({start:{x:(240*viewScale+viewX)/renderDpr(),y:(520*viewScale+viewY)/renderDpr()},
   short:{x:(270*viewScale+viewX)/renderDpr(),y:(517*viewScale+viewY)/renderDpr()},
   end:{x:(350*viewScale+viewX)/renderDpr(),y:(485*viewScale+viewY)/renderDpr()},
   up:{x:(242*viewScale+viewX)/renderDpr(),y:(450*viewScale+viewY)/renderDpr()},
   down:{x:(242*viewScale+viewX)/renderDpr(),y:(590*viewScale+viewY)/renderDpr()},
   jitter:{x:(249*viewScale+viewX)/renderDpr(),y:(528*viewScale+viewY)/renderDpr()},
   diagonalDown:{x:(262*viewScale+viewX)/renderDpr(),y:(570*viewScale+viewY)/renderDpr()}})`);
  const cdp=await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[points.start]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[points.short]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[points.end]});
  await run('for(let i=0;i<16;i++)update(1/120)');
  report.touch={horizontal:await run('({x:player.x,lane:player.lane,jumpT:player.jumpT,gesture:!!tStart?.sequencePointer})')};
  assert.equal(report.touch.horizontal.lane,1,'A short swipe is one whole lane; longer movement in the same gesture must not add another');
  assert(report.touch.horizontal.x>0&&report.touch.horizontal.x<1&&report.touch.horizontal.gesture);
  assert.equal(report.touch.horizontal.jumpT,-1,'Horizontal-dominant diagonal motion must not also jump');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.equal(await run('tStart'),null,'Touch release must clean the gesture');
  await run('for(let i=0;i<12;i++)update(1/120)');
  assert(await run('player.x')>report.touch.horizontal.x,'Touch release also preserves the eased lane destination');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[points.start]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[points.up]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  report.touch.verticalUp=await run('({lane:player.lane,jumpT:player.jumpT})');
  assert.equal(report.touch.verticalUp.lane,1);assert.equal(report.touch.verticalUp.jumpT,0);
  await run('player.jumpT=-1;player.duckT=-1;');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[points.start]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[points.down]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  report.touch.verticalDown=await run('({lane:player.lane,jumpT:player.jumpT,duckT:player.duckT})');
  assert.equal(report.touch.verticalDown.lane,1);assert.equal(report.touch.verticalDown.duckT,0);
  // Native changedTouches listeners also handle devices that emit no move event.
  report.touch.releaseOnly=await page.evaluate(({start,end})=>{
   const fire=(type,p)=>{const touch=new Touch({identifier:77,target:document.body,clientX:p.x,clientY:p.y});
    window.dispatchEvent(new TouchEvent(type,{bubbles:true,cancelable:true,touches:type==='touchend'?[]:[touch],changedTouches:[touch]}));};
   fire('touchstart',start);fire('touchend',end);
   return (0,eval)('({lane:player.lane,gestureCleared:tStart===null})');
  },{start:points.start,end:points.short});
  assert.equal(report.touch.releaseOnly.lane,2);assert.equal(report.touch.releaseOnly.gestureCleared,true);
  await run('player.duckT=-1;');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[points.start]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[points.jitter]});
  report.touch.subthreshold=await run('({lane:player.lane,jumpT:player.jumpT,duckT:player.duckT})');
  assert.equal(report.touch.subthreshold.duckT,-1);assert.equal(report.touch.subthreshold.lane,2);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[points.diagonalDown]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  report.touch.diagonalDown=await run('({lane:player.lane,duckT:player.duckT})');
  assert.equal(report.touch.diagonalDown.lane,2);assert.equal(report.touch.diagonalDown.duckT,0,
   'Initial subthreshold diagonal jitter must not lock out the intended vertical swipe');

  report.jumpLift=await run(`(()=>{
   player.x=player.lane=1;player.jumpT=player.duckT=-1;
   const T=KRMountedRunMotion.timing,duration=jumpDur(),maxLift=activeBossDefinition().sequenceJumpLift,
    times=[-1,0,T.takeoff,T.takeoff+.0001,(T.takeoff+T.apex)/2,T.apex,(T.apex+T.contact)/2,T.contact-.0001,T.contact,T.duration],rows=[];
   for(const t of times){
    player.jumpT=t<0?-1:t/T.duration*duration;
    const lift=playerSequenceJumpLift(),phase=t<T.apex?(t-T.takeoff)/(T.apex-T.takeoff):(T.contact-t)/(T.contact-T.apex),
     expected=t<=T.takeoff||t>=T.contact?0:maxLift*Math.sin(Math.PI*.5*phase)**2,
     originalHeight=player.jumpT<0?0:Math.sin(Math.PI*clamp(player.jumpT/duration,0,1))*CFG.JUMP_H,
     actual=KRMountedCombat.frame(),original=KRMountedRunMotion.frame(actual.state,laneX(player.x,1),PLAYER_Y,KRMountedRunner.unit),
     volumes=structuredClone(samplePlayerHurtVolumes()),baseline=samplePlayerHurtVolumesAt(createPlayerHurtVolumes(),laneX(player.x,1),PLAYER_Y-originalHeight,0);
    rows.push({t,gameTime:player.jumpT,lift,expected,height:jumpHeight(),heightDelta:jumpHeight()-originalHeight,
     placementDelta:original.placement.y-actual.placement.y,visualHeightDelta:actual.height-original.height,
     poseIdentical:JSON.stringify(actual.pose)===JSON.stringify(original.pose),shadowIdentical:JSON.stringify(actual.shadow)===JSON.stringify(original.shadow),
     volumes:volumes.capsules.map((v,i)=>({id:v.id,y1Delta:baseline.capsules[i].y1-v.y1,y2Delta:baseline.capsules[i].y2-v.y2,
      shapePreserved:v.x1===baseline.capsules[i].x1&&v.x2===baseline.capsules[i].x2&&v.r===baseline.capsules[i].r}))});
   }
   player.jumpT=-1;return {duration,maxLift,timing:T,rows};
  })()`);
  assert.equal(report.jumpLift.maxLift,30);assert.equal(report.jumpLift.duration,.52,'The accepted native jump clock must stay intact');
  for(const row of report.jumpLift.rows){
   for(const key of ['lift','heightDelta','placementDelta','visualHeightDelta'])
    assert(Math.abs(row[key]-row.expected)<1e-8,'Encounter lift must agree across native collision and visual placement: '+key+' at '+row.t);
   assert.equal(row.poseIdentical,true,'Approved mounted local pose must not change');
   assert.equal(row.shadowIdentical,true,'Ground shadow must not be lifted');
   for(const volume of row.volumes){assert.equal(volume.shapePreserved,true);assert(Math.abs(volume.y1Delta-row.expected)<1e-8&&Math.abs(volume.y2Delta-row.expected)<1e-8);}
  }

  report.geometry=await run(`(()=>{
   const keep={x:player.x,jumpT:player.jumpT,duckT:player.duckT};player.x=1;
   const result={width:VW,height:VH,playerY:PLAYER_Y,groundY:GROUND_Y,jumpDuration:jumpDur(),
    duckDuration:CFG.DUCK_TIME,jump:[],duck:[],projection:[]};
   for(let i=0;i<=64;i++){
    player.jumpT=jumpDur()*i/64;player.duckT=-1;
    result.jump.push({t:player.jumpT,height:jumpHeight(),volumes:structuredClone(samplePlayerHurtVolumes())});
    player.jumpT=-1;player.duckT=CFG.DUCK_TIME*i/64;
    result.duck.push({t:player.duckT,amount:duckPostureAmountAt(player.duckT),volumes:structuredClone(samplePlayerHurtVolumes())});
   }
   for(const z of [0,1,7,14]){const p=proj(z);result.projection.push({z,...p,lanes:[0,1,2].map(l=>laneX(l,p.t))});}
   Object.assign(player,keep);return result;
  })()`);
  fs.writeFileSync(path.join(out,'native-geometry.json'),JSON.stringify(report.geometry,null,2));
  delete report.geometry;

  if(controlsOnly){
   await page.setViewportSize({width:390,height:844});
   await run('resize();KROathkeeperEncounter.start();update(1/120);player.invuln=99;player.x=player.lane=1;');
   report.controlCaptures=[];const buffers=new Map();
   for(const [name,t,withoutLift]of [['ground',-1,false],['takeoff',.09,false],['apex',.33,false],['contact',.57,false],['apex-before',.33,true]]){
    const state=await run(`(()=>{
     player.jumpT=${t}<0?-1:${t}/KRMountedRunMotion.timing.duration*jumpDur();player.duckT=-1;
     perfNow=200;flashA=0;shakeMag=0;bannerT=0;floaters.length=0;particles.length=0;paused=false;pausePhotoMode=false;
     const savedLift=playerSequenceJumpLift;try{
      if(${withoutLift})playerSequenceJumpLift=()=>0;
      render();return {jumpT:player.jumpT,lift:playerSequenceJumpLift(),height:jumpHeight(),nativeHUD:!paused&&!pausePhotoMode};
     }finally{playerSequenceJumpLift=savedLift;}
    })()`);
    const file=path.join(out,'controls-390-'+name+'.png'),raw=await page.screenshot({path:file});
    buffers.set(name,raw);report.controlCaptures.push({name,file,...state});
   }
   const board=async(names,width,file)=>{
    const height=Math.round(844*width/390),tiles=[];
    for(let i=0;i<names.length;i++){
     const name=names[i],label=name==='apex-before'?'Apex - original lift':name==='apex'?'Apex - added 30 px':name,
      raw=await sharp(buffers.get(name)).resize(width,height).extend({top:26,bottom:0,left:0,right:0,background:'#17252b'}).png().toBuffer(),
      text=Buffer.from('<svg width="'+width+'" height="26"><text x="8" y="18" fill="#e4d1a2" font-family="sans-serif" font-size="12">'+label+'</text></svg>'),
      input=await sharp(raw).composite([{input:text,left:0,top:0}]).png().toBuffer();
     tiles.push({input,left:i*width,top:0});
    }
    await sharp({create:{width:width*names.length,height:height+26,channels:4,background:'#17252b'}}).composite(tiles).png().toFile(path.join(out,file));
   };
   await board(['ground','takeoff','apex','contact'],195,'controls-390-contact-sheet.png');
   await board(['apex-before','apex'],390,'controls-390-apex-comparison.png');
   await page.setViewportSize({width:480,height:850});await run('resize()');
  }

  report.ordinaryBoss=await run(`(()=>{
   startBoss('bear');setMode('boss');boss.entering=false;boss.rise=1;boss.state='idle';boss.stateT=0;
   boss.x=boss.xTarget=1;boss.atkTimer=.1;player.x=player.lane=1;player.invuln=99;
   player.jumpT=player.duckT=-1;const driver=activeBossSequenceDriver();
   playerAction('right');const target=player.lane;update(1/120);const first=player.x;
   const states=new Set();for(let i=0;i<360;i++){update(1/120);states.add(boss.state);}
   player.jumpT=jumpDur()*KRMountedRunMotion.timing.apex/KRMountedRunMotion.timing.duration;player.duckT=-1;
   const expectedHeight=Math.sin(Math.PI*player.jumpT/jumpDur())*CFG.JUMP_H,
    mounted=KRMountedCombat.frame(),baseline=KRMountedRunMotion.frame(mounted.state,laneX(player.x,1),PLAYER_Y,KRMountedRunner.unit);
   return {driver:driver===null,target,first,states:[...states],sequence:!!boss._sequence,definition:boss.definitionId,
    jumpLift:playerSequenceJumpLift(),height:jumpHeight(),expectedHeight,visualPlacementDelta:baseline.placement.y-mounted.placement.y};
  })()`);
  assert.equal(report.ordinaryBoss.driver,true);assert.equal(report.ordinaryBoss.target,2);
  assert(report.ordinaryBoss.first>1&&report.ordinaryBoss.first<2);
  assert(report.ordinaryBoss.states.includes('tele')&&report.ordinaryBoss.states.includes('strike'));
  assert.equal(report.ordinaryBoss.sequence,false);
  assert.equal(report.ordinaryBoss.jumpLift,0);assert.equal(report.ordinaryBoss.visualPlacementDelta,0);
  assert(Math.abs(report.ordinaryBoss.height-report.ordinaryBoss.expectedHeight)<1e-8,'Ordinary bosses retain their original jump height');
  if(controlsOnly){
   assert.deepEqual(errors,[],'Browser errors during control checks');assert.deepEqual(missing,[],'Missing control assets');
   report.passed=true;report.scope='Native three-lane input, encounter-local added jump lift, immunity and ordinary-boss regressions. No rejected-pattern feasibility or aesthetic approval.';
   for(const [file,hash]of Object.entries(controlHashes))assert.equal(sourceHash(file),hash,'Control source changed during native audit: '+file);
   report.hashes=controlHashes;
   fs.writeFileSync(path.join(out,'native-controls-report.json'),JSON.stringify(report,null,2));
   console.log('OATHKEEPER_NATIVE_CONTROLS_OK',JSON.stringify(report));return;
  }
  await run('KROathkeeperEncounter.start();update(1/120);player.jumpT=player.duckT=-1;player.invuln=0;paused=true;pausePhotoMode=true;render();');
  await page.screenshot({path:path.join(out,'native-start.png')});
  const captures=[
   ['broken_court',[1.35,2.45,4.03,4.90,8.30,9.25]],
   ['crossed_seals',[1.70,3.50,5.20,6.95,8.60,9.95]],
   ['returning_oath',[1.35,2.48,3.30,4.35,6.25,7.80]],
   ['last_oath',[1.35,3.55,5.10,6.95,8.60,10.70]]
  ];
  report.contactSheets=[];
  for(let index=0;index<captures.length;index++){
   const [id,times]=captures[index],tiles=[];
   for(let i=0;i<times.length;i++){
    const time=times[i];
    await run(`KROathkeeperEncounter.sequenceDriver.startRecipe(boss,${index},${time});
     player.x=player.lane=1;player.jumpT=player.duckT=-1;player.invuln=0;
     perfNow=200+${time};flashA=0;shakeMag=0;bannerT=0;render();`);
    const file=id+'-'+String(i+1)+'-'+String(time).replace('.','_')+'.png';
    const raw=await page.screenshot({path:path.join(out,file)});
    const panel=await sharp(raw).resize(240,425).extend({top:26,bottom:0,left:0,right:0,
     background:'#17252b'}).png().toBuffer();
    const label=Buffer.from(`<svg width="240" height="26"><text x="8" y="18" fill="#e4d1a2" font-family="sans-serif" font-size="12">${id} / ${time.toFixed(2)} s</text></svg>`);
    const tile=await sharp(panel).composite([{input:label,left:0,top:0}]).png().toBuffer();
    tiles.push({input:tile,left:(i%3)*240,top:Math.floor(i/3)*451});
   }
   const sheet=path.join(out,id+'-sheet.png');
   await sharp({create:{width:720,height:902,channels:4,background:'#17252b'}})
    .composite(tiles).png().toFile(sheet);
   report.contactSheets.push({id,times,file:sheet});
  }
  await page.setViewportSize({width:390,height:844});
  await run('resize();KROathkeeperEncounter.sequenceDriver.startRecipe(boss,0,3.15);render();');
  await page.screenshot({path:path.join(out,'native-phone-390x844.png')});
  await page.setViewportSize({width:480,height:850});await run('resize()');
  report.performance=await run(`(()=>{
   const driver=KROathkeeperEncounter.sequenceDriver,renderer=KROathkeeperEncounter.renderer,rows=[];
   const stats=values=>{const a=[...values].sort((a,b)=>a-b);return {mean:values.reduce((a,b)=>a+b,0)/values.length,
    median:a[Math.floor(a.length*.5)],p95:a[Math.floor(a.length*.95)],max:a[a.length-1]};};
   for(let index=0;index<4;index++){
    driver.startRecipe(boss,index);const duration=boss._sequence.recipe.duration,samples=[],renders=[];
    for(let i=0;i<10;i++){boss.stateT=duration*(i+.5)/10;driver.sample(boss,boss.stateT);render();}
    for(let i=0;i<40;i++){
     boss.stateT=duration*(i+.5)/40;let stamp=performance.now();driver.sample(boss,boss.stateT);
     samples.push(performance.now()-stamp);stamp=performance.now();render();renders.push(performance.now()-stamp);
    }
    const before=renderer.stats();for(let i=0;i<8;i++)render();const after=renderer.stats();
    rows.push({id:boss._sequence.recipe.id,sampleCPUms:stats(samples),fullSceneRenderCPUms:stats(renders),
     renderer:after,frozenExtraGeometryBuilds:after.geometryBuilds-before.geometryBuilds,
     frozenExtraUploads:after.uploads-before.uploads});
   }return {note:'Warm CPU wall times in headless Edge; GPU completion and real-phone FPS are not measured.',rows};
  })()`);
  assert.deepEqual(errors,[],'Browser page errors');assert.deepEqual(missing,[],'Missing native assets');
  report.passed=true;report.errors=errors;report.missing=missing;
  fs.writeFileSync(path.join(out,'native-report.json'),JSON.stringify(report,null,2));
  console.log('OATHKEEPER_SEQUENCE_NATIVE_OK',JSON.stringify(report));
 }catch(error){
  fs.writeFileSync(path.join(out,routesOnly?'native-route-failure.json':controlsOnly?'native-controls-report.json':'native-report.json'),
   JSON.stringify({...report,passed:false,errors,missing,failure:error.message},null,2));
  throw error;
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
