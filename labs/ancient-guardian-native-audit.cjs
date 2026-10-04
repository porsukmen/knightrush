const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{fs.mkdirSync('output/guardian-native',{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:480,height:850}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text());});
 await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
 await page.goto('http://127.0.0.1:8765/KnightRush.html?guardianlab=1');
 await page.waitForFunction(()=>window.KRAncientGuardianEncounter&&typeof boss!=='undefined'&&boss?.definitionId==='ancientguardian',null,{timeout:90000,polling:100});
 await page.evaluate(()=>KROathkeeperArena.ready());
 console.log('BOOT',await page.evaluate(()=>({state:KRAncientGuardianEncounter.state(),mounted:KRMountedRunner.ready,proj:proj(8.5),player:samplePlayerHurtVolumes(createPlayerHurtVolumes())})));
 for(const time of [0,4.98,5.03,8.4,8.9,9.01]){
  console.log('POSE',time,await page.evaluate(t=>{KRAncientGuardianEncounter.sequenceDriver.seek(boss,t);render();const f=boss._sequence.frame;return f.hazards.map(h=>({active:h.active,minY:Math.min(...h.primitives.map(p=>p.y)),maxY:Math.max(...h.primitives.map(p=>p.y)),minZ:Math.min(...h.primitives.map(p=>p.z)),maxZ:Math.max(...h.primitives.map(p=>p.z))}));},time));
  await page.screenshot({path:`output/guardian-native/pose-${time}.png`});
 }
 const reports=[];
 for(const hz of [30,60,120])for(const lane of [0,1,2])reports.push(await page.evaluate(({hz,lane})=>{KRAncientGuardianEncounter.restart();player.x=player.lane=lane;KRAncientGuardianEncounter.sequenceDriver.startRecipe(boss,0);const initial=player.currentHealthUnits;for(let i=0;i<hz*10&&boss.phase==='dodge'&&player.alive;i++)update(1/hz);return{hz,lane,initial,root:boss.x,...KRAncientGuardianEncounter.state(),resolved:boss._sequence?.resolved||boss._lastSequence?.resolved,alive:player.alive};},{hz,lane}));
 console.log('CONTACTS',JSON.stringify(reports));
 for(const r of reports){assert.equal(r.root,1);assert.equal(r.phase,'player');assert.equal(r.stats.hits,r.lane);assert.equal(r.health,r.initial-r.lane*144);}
 for(const key of ['ArrowLeft','ArrowRight']){
  await page.evaluate(()=>{KRAncientGuardianEncounter.restart();for(let i=0;i<552;i++)update(1/120);});
  await page.keyboard.press(key);
  const dodge=await page.evaluate(()=>{for(let i=0;i<648&&boss.phase==='dodge';i++)update(1/120);return{...KRAncientGuardianEncounter.state(),lane:player.lane,x:player.x};});
  console.log('KEY_ROUTE',key,dodge);assert.equal(dodge.stats.hits,key==='ArrowLeft'?0:2);assert.equal(dodge.lane,key==='ArrowLeft'?0:2);
 }
 for(const hz of [30,60,120])for(const lane of [1,2]){
  await page.evaluate(({hz,lane})=>{KRAncientGuardianEncounter.restart();player.x=player.lane=lane;const pressAt=8.88-CFG.DUCK_TIME*.49;for(let i=0;i<Math.round(pressAt*hz);i++)update(1/hz);},{hz,lane});
  await page.keyboard.press('ArrowDown');
  const duck=await page.evaluate(hz=>{const accepted=player.duckT>=0;for(let i=0;i<hz*2&&boss.phase==='dodge';i++)update(1/hz);return{accepted,...KRAncientGuardianEncounter.state()};},hz);
  console.log('TIMED_DUCK',hz,lane,duck);assert.equal(duck.accepted,true);assert.equal(duck.stats.hits,lane);
 }
 const geometry=await page.evaluate(()=>{
  const M=KRAncientGuardianStance,C=KRAncientGuardianCombatPose,d=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));let bone=0,grip=0,feet=0,capeFloor=-Infinity,first=0;
  for(let t=0;t<=9.75;t+=1/120){const a=M.sample(t),b=C.sample(t);bone=Math.max(bone,Math.abs(d(a.shoulder,a.elbow)-d(b.shoulder,b.elbow)),Math.abs(d(a.elbow,a.wrist)-d(b.elbow,b.wrist)));grip=Math.max(grip,d(b.wrist,b.hand.p([-2.8,-63.5,-13.5])));for(let i=0;i<2;i++)feet=Math.max(feet,d(a.legs[i].ankle,b.legs[i].ankle));first=Math.max(first,d(a.wrist,b.wrist),d(a.body.p([0,-50,0]),b.body.p([0,-50,0])),d(a.weapon.p([0,0,-13.5]),b.weapon.p([0,0,-13.5])));for(const f of KRAncientGuardian.parts['stone-cape'])for(const v of f.v)capeFloor=Math.max(capeFloor,b.cape.p(v)[1]);}
  return{bone,grip,feet,capeFloor,first};
 });console.log('COMBAT_GEOMETRY',geometry);assert.ok(geometry.bone<1e-6);assert.ok(geometry.grip<1e-6);assert.ok(geometry.feet<.001);assert.ok(geometry.capeFloor<=0);assert.equal(geometry.first,0);
 for(const hz of [30,60,120]){
  await page.evaluate(hz=>{KRAncientGuardianEncounter.restart();for(let i=0;i<Math.round(8.05*hz);i++)update(1/hz);},hz);await page.keyboard.press('ArrowLeft');
  const route=await page.evaluate(hz=>{for(let i=0;i<hz*2&&boss.phase==='dodge';i++)update(1/hz);return KRAncientGuardianEncounter.state();},hz);assert.equal(route.stats.hits,0);assert.equal(route.phase,'player');console.log('SWIPE_LEFT_ESCAPE',hz,route.health);
 }
 const lifecycle=await page.evaluate(()=>{
  const E=KRAncientGuardianEncounter;E.restart();E.sequenceDriver.seek(boss,4.96);
  const time=boss._sequence.time,health=player.currentHealthUnits;paused=true;
  for(let i=0;i<3;i++)frame(performance.now());
  const frozen=boss._sequence.time===time&&player.currentHealthUnits===health;
  paused=false;for(let i=0;i<5;i++)render();const pureDraw=player.currentHealthUnits===health;
  E.restart();player.x=player.lane=2;player.currentHealthUnits=144;for(let i=0;i<650&&player.alive;i++)update(1/120);
  const dead=!player.alive&&mode==='dying'&&!boss._sequence;
  E.handleLabKey({key:'r',target:document.body});const restart=player.alive&&boss._sequence.time===0&&player.currentHealthUnits===576;
  startBoss('bear');const ordinary=!activeBossSequenceDriver();
  const v={x1:0,x2:0,y1:0,y2:20,r:1},f=KRBossSequenceRuntime.movingCircleTouchesCapsule;
  const depthReject=!f({x:0,y:10,z:10,r:1,depthRadius:2},{x:0,y:10,z:9,r:1,depthRadius:2},v,v),depthSweep=f({x:0,y:10,z:5,r:1,depthRadius:2},{x:0,y:10,z:-5,r:1,depthRadius:2},v,v);
  E.restart();return{frozen,pureDraw,dead,restart,ordinary,depthReject,depthSweep,asset:KROathkeeperArena.assetId};
 });console.log('LIFECYCLE',lifecycle);for(const k of ['frozen','pureDraw','dead','restart','ordinary','depthReject','depthSweep'])assert.equal(lifecycle[k],true,k);assert.equal(lifecycle.asset,'ancient-guardian-courtyard');
 for(const [name,width,height] of [['desktop',1200,1000],['phone',390,844]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(150);await page.evaluate(async()=>{await KROathkeeperArena.ready();paused=false;floaters.length=0;flashA=0;shakeMag=0;KRAncientGuardianEncounter.sequenceDriver.seek(boss,1);render();});
  await page.screenshot({path:`output/guardian-native/${name}-courtyard.png`});
 }
 console.log('ERRORS',errors);assert.deepEqual(errors,[]);console.log('GUARDIAN_NATIVE_OK');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
