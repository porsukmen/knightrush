const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),out=path.resolve('output/wolf-den-v4');fs.mkdirSync(out,{recursive:true});
 try{for(const phone of [true,false]){
  const page=await browser.newPage({viewport:phone?{width:390,height:844}:{width:1200,height:900},deviceScaleFactor:phone?2:1,hasTouch:phone}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href+'?roadlab=1');
  await page.waitForFunction(()=>document.querySelector('#game')?.dataset.bootReady==='1');
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  const ready=()=>run("prepareCutscene(wolfDenScene(journeyRoadEventSession.context),true,journeyRoadEventSession.context.token)");
  const shot=async name=>{await run('flashA=0;shakeMag=0;render()');await page.screenshot({path:path.join(out,(phone?'phone-':'desktop-')+name+'.png')});};
  const tap=async(x,y,world=false)=>{
   const p=await run(`({x:(${x}*viewScale+viewX)/renderDpr(),y:((${world?y+'*(800+PAD_TOT)/800-PAD_TOP':y})*viewScale+viewY)/renderDpr()})`);
   if(phone)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);
  };
  await run(`startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.id==='wolfden'));
   dist=roadLabState.slot.at;roadScroll=dist;obstacles=[];pickups=[];updateJourneyRoadEvents(0);
   player.x=player.lane=journeyNormalSide(roadLabState.slot)+1;
   handleJourneyRoadEventAction(player.lane===2?'right':'left');debugRun=false;`);
  await ready();assert.equal(await run('KRCutscenes.report().scene'),'wolf-den-forest');
  assert.equal(await run('currentUITheme()'),'treasure');
  assert.deepEqual(await run('KRWolfDenPoses.names'),['front','diagonal','side','rearDiagonal','rearNear','back']);
  assert.equal(await run('KRWolfDenPoses.poseName(.8,false)'),'rearNear');
  assert.equal(await run('KRWolfDenPoses.poseName(.4,true)'),'back','Running stays rear-facing');
  const sheet=await run(`(()=>{const c=document.createElement('canvas');c.width=1080;c.height=250;
   const previous=g;try{g=c.getContext('2d');g.fillStyle='#243038';g.fillRect(0,0,1080,250);
    for(let i=0;i<6;i++){g.save();g.translate(90+i*180,212);KRWolfDenPoses.draw(2,1,[0,.2,.4,.6,.8,1][i],0,false);g.restore();}
    return c.toDataURL();}finally{g=previous;}})()`);
  fs.writeFileSync(path.join(out,'directional-poses.png'),Buffer.from(sheet.split(',')[1],'base64'));
  assert.equal(await run('KRWolfDen.departureTiming.turnDuration'),.24);
  assert(await run(`(()=>{const c=document.createElement('canvas');c.width=c.height=240;const old=g;
   try{g=c.getContext('2d');drawWolfBack(120,180,4/2.6,0,0);
    const pixels=g.getImageData(116,125,8,9).data;
    for(let i=3;i<pixels.length;i+=4)if(pixels[i]!==255)return false;return true;
   }finally{g=old;}})()`),'Rear torso must be opaque between shoulders and hips');
  assert.equal(await run('KRWolfDen.wolf.toString().includes("g.filter")'),false,'Fast turn must remain unfiltered');
  assert.equal(await run('KRWolfDen.departure(2.4).turn'),1);
  assert.equal(await run('KRWolfDen.departure(2.1).turn'),0);
  for(const t of [0,1.8,2.1,2.15,2.2,2.24,2.29,2.34,3,4.8,6,7,7.7]){
   await run(`journeyRoadEventSession.context.den.t=${t};perfNow=${t}`);await shot('motion-'+t);
   assert.equal(await run('g.filter'),'none','Motion blur must not leak to the scene/UI');
  }
  await run('paused=true');const clock=await run('journeyRoadEventSession.context.den.t');
  await run('update(1)');assert.equal(await run('journeyRoadEventSession.context.den.t'),clock);await run('paused=false;update(1);update(.3)');
  assert.equal(await run('journeyRoadEventSession.context.den.slide'),'trail');
  assert(await run(`(()=>{const original=g,angles=[];
   try{g=new Proxy(original,{get(o,k){if(k==='rotate')return a=>angles.push(a);
    const v=Reflect.get(o,k,o);return typeof v==='function'?v.bind(o):v;},set(o,k,v){return Reflect.set(o,k,v,o);}});
    KRWolfDen.tracks();
   }finally{g=original;}
   return angles.length===8&&angles.every((a,i)=>{const u=.1+i*.095,
    p=KRWolfDen.pathAt(u-.001),q=KRWolfDen.pathAt(u+.001),dx=q.x-p.x,dy=q.y-p.y;
    return (Math.sin(a)*dx-Math.cos(a)*dy)/Math.hypot(dx,dy)>.999;});
  })()`),'All paw toes must point along the forward path, not mirrored sideways');
  await shot('trail');await tap(240,715);await ready();await run('update(.3)');
  assert.equal(await run('KRCutscenes.report().scene'),'wolf-den-outside');await shot('outside');
  await tap(90,479,true);await tap(90,479,true);assert.equal(await run('journeyMeat'),1);
  await run('update(.5)');await tap(240,715);await ready();await run('update(.3)');await shot('four-wolves');
  assert.equal(await run('journeyRoadEventSession.context.den.slide'),'pack');
  assert.equal(await run('journeyMeat'),1,'Entering must not feed the pup automatically');
  assert.equal(await run('KRCutscenes.report().scene'),'wolf-den-inside');
  // All four bodies invoke the approved miniboss renderer, not a copied model.
  assert.equal(await run(`(()=>{const original=drawWolf;let n=0;try{drawWolf=(...a)=>{if(a[2]>.5)n++;return original(...a)};drawWolfDenAdventure(journeyRoadEventSession.context);}finally{drawWolf=original}return n})()`),4);
  await run('debugRun=true;update(1.5)');assert.equal(await run('mode'),'boss');
  const distance=await run('dist'),health=await run('player.currentHealthUnits');
  for(let i=0;i<4;i++){
   assert.equal(await run('boss.definitionId'),'den_wolf_'+i);assert.equal(await run('env'),'cave');
   assert.equal(await run('player.currentHealthUnits'),health);
   assert.equal(await run('player.lane'),1);assert.equal(await run('player.x'),1);
   assert.equal(await run('journeyMeat'),1,'Food stays with the knight throughout combat');
   await run('player.gallop=.35;updatePlayer(.1)');
   assert.equal(await run('player.gallop'),0,'Stationary knight keeps the horse planted');
   if(i===0){
    await run('player.lane=0;updatePlayer(.1)');
    assert(await run('player.gallop>0'),'Horse moves with a lane change');
    await run('player.x=player.lane=1;updatePlayer(.1)');
    assert.equal(await run('player.gallop'),0,'Horse stops again after moving');
   }
   await shot('arrival-'+i);await run('updateBoss(.7)');await shot('battle-'+i);
   if(i===1)await run("boss.phase='player';boss.state='idle'");
   if(i===2)await run('knightRushSequence={finalHit:false};debugParryInputFrozen=true');
   await tap(408,'168+uiTop');assert.equal(await run('boss.state'),'dying','Real debug kill button '+i+': '+JSON.stringify(await run('({mode,paused,settingsOpen,debugRun,forestPreparing,uiTop,VW,viewScale,viewX,viewY,phase:boss.phase,tStart,skillTooltipIndex,moveTreeOpen,moveHistoryOpen})')));
   await run('boss.stateT=2.6;player.x=player.lane=2;updateBoss(.016)');
   assert(await run("!floaters.some(f=>f.txt.startsWith('ENEMY DEFEATED'))"),'No victory banner over the following wolf');
   if(i<3){assert.equal(await run('mode'),'boss','No blank wave mode');assert.equal(await run('boss.definitionId'),'den_wolf_'+(i+1));
    assert.equal(await run('KRCutscenes.report().state'),'ready','Interior never released between fights');}
  }
  assert.equal(await run('journeyRoadEventSession.context.den.slide'),'pup');
  await run('update(.35)');await shot('pup-emerges');await run('update(1.3)');await shot('pup');
  await tap(240,715);assert.equal(await run('journeyRoadEventSession.context.den.slide'),'feeding');
  assert.equal(await run('journeyMeat'),0);await run('update(1.4)');await shot('feeding');await run('update(1.3)');await shot('friend');
  await run('update(.3)');await tap(240,715);assert.equal(await run('mode'),'run');assert.equal(await run('dist'),distance);
  assert(await run('!!wolfPup'));assert.equal(await run('KRCutscenes.report().state'),'idle');
  await run('player.x=player.lane=wolfPup.lane=1');
  await run('player.gallop=0;updatePlayer(.1)');
  assert(await run('player.gallop>0'),'Normal road gallop still runs');
  for(const t of [0,.12,.24]){await run(`perfNow=${t}`);await shot('follower-run-'+t);}
  assert(await run(`(()=>{const original=KRWolfDen;let pose;
   try{window.KRWolfDen={...original,pup:(...args)=>{pose=args}};drawWolfPupFollower();}
   finally{window.KRWolfDen=original;}
   return pose[0]===laneX(player.x,1)&&pose[1]>PLAYER_Y+40&&pose[4]&&pose[5]&&pose[7]===PLAYER_Y+52;})()`),'Pup runs directly behind the horse with a grounded shadow');
  await run('wolfPup.trail=null;player.jumpT=-1;updateWolfPup(.01);player.x=player.lane=2;player.jumpT=jumpDur()/2;roadScroll+=1;updateWolfPup(.04)');
  assert.equal(await run('wolfPup.lane'),1,'No immediate sideways slide');
  assert.equal(await run('wolfPup.jump'),0,'No simultaneous jump');
  await run('player.jumpT=-1;roadScroll+=WOLF_PUP_FOLLOW_DISTANCE;updateWolfPup(.25)');
  assert.equal(await run('wolfPup.lane'),2,'Same lane at the same travelled point');
  assert(await run('Math.abs(wolfPup.jump-CFG.JUMP_H*.5)<.01'),'Recorded jump happens after the follow distance');
  await shot('follower-delayed-jump');
  await run('roadScroll+=WOLF_PUP_FOLLOW_DISTANCE;updateWolfPup(.25)');
  assert.equal(await run('wolfPup.jump'),0,'Delayed landing');
  await shot('follower-lane-change');
  assert.deepEqual(errors,[]);await page.close();
 }console.log('WOLF_DEN_2_5D_OK desktop + phone: 6 poses, curved path, 4 real debug-kill clicks including player turn/Rush/freeze, centred knight each fight, food kept until optional final feeding, adoption, pause and release');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
