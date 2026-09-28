const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {pathToFileURL}=require('url');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 fs.mkdirSync('output/camp-v2',{recursive:true});
 for(const width of [390,1000]){
  const p=await b.newPage({viewport:{width,height:width===390?844:1000},deviceScaleFactor:1,hasTouch:true}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>requestAnimationFrame=()=>0);
  await p.goto(pathToFileURL(path.resolve('KnightRush.html')).href+'?roadlab=1');
  await p.waitForFunction(()=>window.KRSunlitForest,null,{polling:100});
  const run=s=>p.evaluate(s=>(0,eval)(s),s);
  // Capture placement only; production knight geometry is unchanged.
  const anchors=await run(`(()=>{const original=window.KRJonathan,calls=[];
   try{window.KRJonathan={...original,draw:(x,y,s,o)=>calls.push({x,y,s,sit:o.sit})};
    for(const sit of [0,.25,.5,.75,1])KRRestCamp.knight(0,sit);
   }finally{window.KRJonathan=original}return calls})()`);
  assert.equal(anchors[0].y,470,'Standing anchor must be in front of log');
  assert(anchors[0].y+1.25*3*1.22>452+3*3*1.22+8,'Boots clear log front');
  assert.equal(anchors[4].y,452,'Approved seated contact stays fixed');
  assert(anchors.every((a,i)=>i===0||a.y<anchors[i-1].y),'Continuous retreat onto seat');
  const poses=await run(`Array.from({length:49},(_,i)=>KRRestCamp.knightPose(i*.5,1))`);
  for(const pose of poses)for(const [i,a] of pose.arms.entries()){
   const c=Math.cos(pose.body.lean),s=Math.sin(pose.body.lean);
   assert(Math.abs(a.hx*c-a.hy*s+pose.body.x-(i?2.98:-2.98))<1e-8,'Seated palm slides off thigh');
   assert(Math.abs(a.hx*s+a.hy*c+pose.body.y-.85)<1e-8,'Seated palm leaves thigh');
   assert(Math.abs(Math.hypot(a.ex-a.sx,a.ey-a.sy)-5)<1e-8);
   assert(Math.abs(Math.hypot(a.hx-a.ex,a.hy-a.ey)-5.1)<1e-8);
  }
  assert.notEqual(poses[0].body.lean,poses[8].body.lean,'Idle must animate');
  const transitions=await run(`Array.from({length:21},(_,i)=>Array.from({length:25},(_,j)=>KRRestCamp.knightPose(j,i/20))).flat()`);
  for(const pose of transitions)for(const a of pose.arms){
   assert(Math.abs(Math.hypot(a.ex-a.sx,a.ey-a.sy)-5)<1e-8,'Upper arm stretches');
   assert(Math.abs(Math.hypot(a.hx-a.ex,a.hy-a.ey)-5.1)<1e-8,'Forearm stretches');
  }
  for(const a of transitions[0].arms)assert(Math.abs(a.ex-a.sx)<1.3&&a.hy>1,'Standing arm must hang beside body');
  const standing=await run(`Array.from({length:49},(_,i)=>KRRestCamp.knightPose(i*.5,0))`);
  for(const pose of standing){
   assert(pose.body.x===0,'No standing weight shift');assert(pose.body.lean===0,'No standing lean');
   for(const a of pose.arms){
    const dot=((a.ex-a.sx)*(a.hx-a.ex)+(a.ey-a.sy)*(a.hy-a.ey))/(5*5.1);
    const bend=Math.acos(Math.max(-1,Math.min(1,dot)))*180/Math.PI;
    assert(bend>0&&bend<8,'Standing elbows must be only slightly bent');
   }
  }
  await run(`globalThis.campFixture=()=>{roadLabState.entry=false;roadLabState.direction=0;startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.id==='camp'));
   dist=roadLabState.slot.at;roadScroll=dist;player.x=player.lane=journeyNormalSide(roadLabState.slot)+1;updateJourneyRoadEvents(0);}`);
  await run('campFixture()');assert.equal(await run('player.currentHealthUnits'),await run('player.maxHealthUnits'),'Debug starts genuinely full');
  await run("prepareCutscene('rest-camp',true,journeyRoadEventSession.token)");
  assert.equal(await run('KRCutscenes.report().state'),'ready');
  await run('update(.3);render()');await p.screenshot({path:`output/camp-v2/${width}-ready.png`});
  const before=await run('JSON.stringify([gold,scrap,dist,player.currentHealthUnits])');
  await run('render();render()');assert.equal(await run('JSON.stringify([gold,scrap,dist,player.currentHealthUnits])'),before);
  await run('player.currentHealthUnits-=3*PLAYER_HEALTH_CONTRACT.unitsPerHeart');const hp=await run('player.currentHealthUnits');
  const tap=async r=>{const pt=await run(`(()=>{const r=KRRestCamp.${r};return{x:((r.x+r.w/2)*viewScale+viewX)/renderDpr(),y:((r.y+r.h/2)*viewScale+viewY)/renderDpr()}})()`);await p.touchscreen.tap(pt.x,pt.y);};
  await tap('fireRect');assert.equal(await run('journeyRoadEventSession.context.resting'),true);await tap('fireRect');
  await run('update(.6);render()');await p.screenshot({path:`output/camp-v2/${width}-sitting.png`});
  const time=await run('journeyRoadEventSession.context.restT');await run('paused=true;update(.5)');assert.equal(await run('journeyRoadEventSession.context.restT'),time);
  await run('paused=false');await tap('leaveRect');assert.equal(await run('mode'),'journeyevent');
  await run('for(let i=0;i<32;i++)update(.1);render()');
  assert.equal(await run('player.currentHealthUnits'),hp+await run('2*PLAYER_HEALTH_CONTRACT.unitsPerHeart'));
  await p.screenshot({path:`output/camp-v2/${width}-rested.png`});
  const clock=await run('journeyRoadEventSession.context.time');
  await run('paused=true;update(.4)');assert.equal(await run('journeyRoadEventSession.context.time'),clock);
  await run('paused=false');
  for(const t of [0,3,6,9]){
   await run(`journeyRoadEventSession.context.time=${t};render()`);
   await p.screenshot({path:`output/camp-v2/${width}-idle-${t}.png`});
  }
  await tap('fireRect');await run('update(4)');assert.equal(await run('player.currentHealthUnits'),hp+await run('2*PLAYER_HEALTH_CONTRACT.unitsPerHeart'));
  await tap('leaveRect');assert.equal(await run('mode'),'run');assert.equal(await run('KREventVisuals.report().reservedBytes'),0);
  // Current scene actors at road size, without loading any character bitmap.
  for(const id of ['taxman','mushrooms','wolfden','camp']){
   await run(`startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.id==='${id}'));dist=roadLabState.slot.at-7;roadScroll=dist;updateJourneyRoadEvents(0);render()`);
   await p.screenshot({path:`output/camp-v2/${width}-road-${id}.png`});
   assert.equal(await run('player.currentHealthUnits'),await run('player.maxHealthUnits'));
  }
  await run('campFixture();update(.3);handleJourneyRoadEventAction("choice1");for(let i=0;i<35;i++)update(.1)');
  assert.equal(await run('player.currentHealthUnits'),await run('player.maxHealthUnits'),'Full health rest never overheals');
  await run('resetRun()');assert.equal(await run('journeyRoadEventSession'),null);assert.deepEqual(errors,[]);
  await p.close();
 }
 console.log('REST_CAMP_OK: tap/sit/one-time 2-heart heal, pause, leave lock, full-health cap, release, lit roadside actors; desktop/phone.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
