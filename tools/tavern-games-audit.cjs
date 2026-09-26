const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/tavern-redesign');
(async()=>{
 fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({channel:'msedge',headless:true});
 try{for(const [device,width,height,dpr]of [['desktop',775,1000,1],['phone',390,844,2]]){
  const p=await b.newPage({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(phone=>{window.requestAnimationFrame=()=>0;Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>phone?4:8});Object.defineProperty(navigator,'deviceMemory',{get:()=>phone?4:8});},device==='phone');
  await p.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
  const run=code=>p.evaluate(code=>(0,eval)(code),code),ready=()=>p.waitForFunction(()=>mode==='tavernslide'?(window.KRTavernSlide&&window.KREventVisuals?.peek('tavern-slide')):mode==='diceguess'?(window.KRDukeBluff&&window.KREventVisuals?.peek('duke-bluff')) :mode==='drinkingcontest'?(window.KRTavernChug&&window.KREventVisuals?.peek('tavern-chug')):mode==='armwrestling'?(window.KRTavernArm&&window.KREventVisuals?.peek('tavern-arm')):mode==='findqueen'?(window.KRRoyalShuffle&&window.KREventVisuals?.peek('royal-shuffle')):(window.KRTavernGames&&window.KREventVisuals?.peek('tavern-games')),null,{polling:50});
  await p.waitForFunction(()=>window.KRSunlitForest,null,{polling:50});
  const shot=async name=>{await run('paused=false;pausePhotoMode=false;perfNow=2;shakeT=0;render();');await p.screenshot({path:path.join(out,device+'-'+name+'.png')});};
  const tap=async r=>{const q=await run(`(()=>{const r=${r};return{x:((r.x+r.w/2)*viewScale+viewX)/renderDpr(),y:((r.y+r.h/2)*viewScale+viewY)/renderDpr()};})()`);await p.touchscreen.tap(q.x,q.y);};
  const starts={slide:'startTavernSlide',arm:'startArmWrestling',dice:'startDiceGuess',queen:'startFindQueen',drink:'startDrinkingContest'};
  for(const [id,start]of Object.entries(starts)){
   await run(`${start}('forest','minigames');SFX.setTestMuted(true);`);await ready();await shot(id+'-intro');
   const state=await run('JSON.stringify([gold,scrap,dist,player.currentHealthUnits])');
   await run(`for(let i=0;i<20;i++){perfNow=i/10;drawTavernPresentation('${id}');}`);
   assert.equal(await run('JSON.stringify([gold,scrap,dist,player.currentHealthUnits])'),state,'Drawing changed gameplay');
   if(id==='slide'){
    await tap('TAVERN_SLIDE_START_BTN');assert.equal(await run('tavernSlideGame.phase'),'coinToss');await shot(id+'-coin');
    await run('updateTavernSlide(TAVERN_SLIDE_RULES.coinTossTime+.01);');
    for(let i=0;i<4000&&await run("tavernSlideGame.phase!=='result'");i++){
     await run("if(tavernCanPlayerAim())launchTavernKeyboardShot();for(let i=0;i<15;i++)updateTavernSlide(1/60);");
     if(i===5)await shot(id+'-playing');
    }
    assert.equal(await run('tavernSlideGame.phase'),'result');assert.equal(await run('tavernSlideGame.mugs.length'),6);
   }else if(id==='arm'){
    await tap('ARM_WRESTLE_START_BTN');assert.equal(await run('armWrestleGame.phase'),'ready');await run('for(let i=0;i<90;i++)updateArmWrestling(1/60)');
    for(const k of [.05,.5,.95]){await run(`armWrestleGame.power=${k};`);await shot(id+'-pressure-'+k);}
    await run("armWrestleGame.power=.5;for(let i=0;i<9000&&armWrestleGame.phase!=='result';i++){const s=armWrestleGame;KRArmRules.hold(s,s.cue==='recover'||s.cue==='rest'&&s.energy>.65);updateArmWrestling(1/60);}");
    assert.equal(await run('armWrestleGame.result.win'),true);
   }else if(id==='dice'){
    await tap('DICE_REPLAY_BTN');assert.equal(await run('diceGame.phase'),'coinToss');await run('updateDiceGuess(3.3)');assert.equal(await run('diceGame.phase'),'rolling');await shot(id+'-rolling');await run("diceGame.starter='player';updateDiceGuess(1);");await shot(id+'-choose');
    await tap('KRDukeBluff.rects.raise');assert.equal(await run('diceGame.turn'),'duke');await run('updateDiceGuess(3)');
    if(await run("diceGame.phase==='turn'"))await tap('KRDukeBluff.rects.call');
    assert.equal(await run('diceGame.phase'),'revealing');await run('updateDiceGuess(.3)');await shot(id+'-reveal');await run('updateDiceGuess(1.4)');
    assert.equal(await run('diceGame.losses.player+diceGame.losses.duke'),1);
   }else if(id==='queen'){
    await tap('FIND_QUEEN_START_BTN');assert.equal(await run('findQueenGame.phase'),'memorize');
    await run("for(let i=0;i<1000&&findQueenGame.phase!=='shuffle';i++)updateFindQueen(1/60);");await shot(id+'-shuffle');
    await run("for(let i=0;i<1000&&findQueenGame.phase!=='choose';i++)updateFindQueen(1/60);");await shot(id+'-choose');
    await tap('FIND_QUEEN_CARD_RECTS[findQueenGame.cards.find(c=>c.role===\'QUEEN\').slot]');await run('updateFindQueen(1.3);');assert.equal(await run('findQueenGame.won'),true);
   }else{
    await tap('DRINK_START_BTN');assert.equal(await run('drinkGame.phase'),'ready');await shot(id+'-ready');
    await run("for(let i=0;i<100;i++)updateDrinkingContest(1/60);");await shot(id+'-playing');
    await run("for(let i=0;i<4000&&drinkGame.phase!=='result';i++){KRChugRules.hold(drinkGame,true);KRChugRules.setAngle(drinkGame,KRChugRules.ideal(drinkGame.player)-KRChugRules.sway(drinkGame.player,drinkGame.elapsed)+.02);updateDrinkingContest(1/60);}");
    assert.equal(await run('drinkGame.phase'),'result');assert.equal(await run('drinkGame.result.win'),true);
   }
   await shot(id+'-result');await tap('MINIGAME_BACK_BTN');assert.equal(await run('mode'),'minigames');assert.equal(await run('KREventVisuals.report().reservedBytes'),0);
  }
  // Material lighting reference: same pose, neutral and scene-local material values.
  await run("startDiceGuess('forest','minigames');");await ready();
  for(const lit of [false,true]){await run(`g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle='#a99979';g.fillRect(0,0,cvs.width,cvs.height);KRDukeBluff.actor(${lit});g.restore();`);await p.screenshot({path:path.join(out,device+'-actor-'+(lit?'lit':'neutral')+'.png')});}
  // Real inn ownership/fee/return path, including image pin handoff.
  await run("setMode('menu');roadLabState.entry=false;startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='inn'));godMode=true;gold=100;dist=journeyRoadEventTriggerAt(roadLabState.slot);roadScroll=dist;updateJourneyRoadEvents(0);player.x=player.lane=2;handleAction('right',null,null,{fresh:true,mode:'run',roadStop:roadLabState.slot.id});updateJourneyRoadEvents(.3);");
  await p.waitForFunction(()=>window.KREventVisuals?.peek('mossy-inn'),null,{polling:50});
  const pos=await run('dist');await tap('ROAD_SERVICE_BUTTONS[1]');await ready();assert.equal(await run('gold'),95);assert.equal(await run('dist'),pos);
  const report=await run('KREventVisuals.report()');assert.equal(report.tier,device==='phone'?'mobile':'standard');assert(report.reservedBytes<=report.budgetBytes);assert.equal(report.active,await run("mode==='tavernslide'?'tavern-slide':mode==='diceguess'?'duke-bluff':mode==='armwrestling'?'tavern-arm':mode==='drinkingcontest'?'tavern-chug':mode==='findqueen'?'royal-shuffle':'tavern-games'"));
  await tap('MINIGAME_BACK_BTN');assert.equal(await run('mode'),'journeyevent');await p.waitForFunction(()=>KREventVisuals.peek('mossy-inn'),null,{polling:50});assert.equal(await run('KREventVisuals.report().active'),'mossy-inn');await shot('inn-return');
  await run('updateJourneyRoadEvents(.3);');await tap('ROAD_SERVICE_BUTTONS[2]');assert.equal(await run('mode'),'run');assert.equal(await run('KREventVisuals.report().reservedBytes'),0);
  // A queued load must not resurrect the scene after exit.
  await run("startDiceGuess();setMode('menu');");await p.waitForTimeout(100);assert.equal(await run('KREventVisuals.report().reservedBytes'),0);
  await run("startArmWrestling('forest','journeyroadresume');armWrestleGame.roadAttempt=true;");await p.waitForTimeout(100);assert.equal(await run('KREventVisuals.report().reservedBytes'),0,'Taxman must not load tavern plate');
  // Dedicated actor audits sample each new rig through its whole motion.
  assert(await run("window.KRTavernArm&&window.KRRoyalShuffle&&window.KRTavernChug?true:false"));
  // Native fallback remains playable if the new bitmap cannot load.
  await run("setMode('menu');");
  // file:// assets may bypass Playwright routing; fail the actual image source.
  await p.evaluate(()=>{const d=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');window.restoreTavernImageSource=()=>Object.defineProperty(HTMLImageElement.prototype,'src',d);Object.defineProperty(HTMLImageElement.prototype,'src',{...d,set(value){d.set.call(this,String(value).includes('duke-bluff-v1')?'assets/encounters/intentionally-missing-tavern-audit.png':value);}});});
  await run('startDiceGuess();');
  await p.waitForFunction(()=>window.KRCutscenes?.report().state==='fallback',null,{polling:50});await shot('image-fallback');await tap('DICE_REPLAY_BTN');assert.equal(await run('diceGame.phase'),'coinToss');await tap('MINIGAME_BACK_BTN');assert.equal(await run('mode'),'minigames');
  await p.evaluate(()=>window.restoreTavernImageSource());
  assert.deepEqual(errors,[]);console.log(device,'TAVERN_GAMES_OK five games / input / outcomes / return / bounded plates');await p.close();
 }}finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
