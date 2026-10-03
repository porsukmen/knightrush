'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),game=fs.readFileSync(path.join(root,'KnightRush.html'),'utf8');
const source=fs.readFileSync(path.join(root,'labs/boss-sequence-runtime.js'),'utf8');
for(const script of game.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))
 if(script[1].trim())new vm.Script(script[1],{filename:'KnightRush-inline.js'});
const api=require('../labs/boss-sequence-runtime.js');
const capsule=(x,top=0,bottom=30,r=10)=>({x1:x,x2:x,y1:top,y2:bottom,r});
const circle=(x,y,r=8)=>({x,y,r});
assert(api.movingCircleTouchesCapsule(circle(0,15),circle(0,15),capsule(-80),capsule(80)),
 'Moving player crossing a stationary stone must collide between frames');
assert(api.movingCircleTouchesCapsule(circle(-80,15),circle(80,15),capsule(0),capsule(0)),
 'Moving stone crossing a stationary mounted body must collide');
assert(!api.movingCircleTouchesCapsule(circle(-80,-30),circle(80,-30),capsule(0),capsule(0)),
 'Stone visibly above the capsule must remain safe');
assert(api.movingCircleTouchesCapsule(circle(0,-15),circle(0,-15),capsule(0,-40),capsule(0,0)),
 'Changing duck height is part of the relative sweep');
assert(!api.movingCircleTouchesCapsule(circle(0,-25),circle(0,-25),capsule(0,0),capsule(0,10)),
 'A completed duck should clear an overhead stone');

// Independent dense sampling validates the analytic moving-capsule solver.
let seed=84139,geometryCases=0;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const blend=(a,b,t)=>a+(b-a)*t;
for(let n=0;n<1800;n++){
 const a=circle(random()*180-90,random()*150-75,4+random()*12),b=circle(random()*180-90,random()*150-75,a.r);
 const v0=capsule(random()*140-70,random()*90-45,50+random()*30,9),
  v1=capsule(random()*140-70,random()*90-45,50+random()*30,9);
 let dense=false;
 for(let k=0;k<=500;k++){
  const t=k/500,x=blend(a.x,b.x,t)-blend(v0.x1,v1.x1,t),y=blend(a.y,b.y,t),
   top=blend(v0.y1,v1.y1,t),bottom=blend(v0.y2,v1.y2,t),dy=y<top?y-top:y>bottom?y-bottom:0;
  if(x*x+dy*dy<=(a.r+v0.r)**2){dense=true;break;}
 }
 const exact=api.movingCircleTouchesCapsule(a,b,v0,v1);
 assert(!dense||exact,'Relative sweep missed a dense-sampled contact '+n);geometryCases++;
}

function harness(recipes,options={}){
 const calls={damage:0,parry:0,perfect:0,turn:0,swipe:0,jump:0,duck:0,input:[],draw:[]};
 const h={console,Math,Number,Object,Array,Map,Set,Float32Array,
  mode:'boss',paused:false,settingsOpen:false,knightRushSequence:null,perfNow:1,
  knightRushQueued:false,hazards:[],
  VW:480,VH:800,PLAYER_Y:640,GROUND_Y:640,BOSS_SOURCE:'boss',SWIPE_TH:24,
  KNIGHT_RUSH_BTN:{x:430,y:20,w:40,h:40},
  player:{x:1,lane:1,laneFrom:1,jumpT:-1,duckT:-1,lastLaneChange:-99,lastJump:-99,lastDuck:-99,alive:true},
  boss:{state:'idle',phase:'dodge',stateT:0,enemyTurn:1,x:1,xTarget:1,z:14,attacksLeft:1,
   hp:100,hurtT:0,rise:1,poisonT:0,burnT:0,tick(dt){this.stateT+=dt;}},
  laneX:(lane,t)=>240+(lane-1)*(24+126*t),proj:z=>({t:14/(14+z),s:14/(14+z),y:640-z*10}),
  jumpDur:()=>.52,jumpHeight:()=>h.player.jumpT<0?0:Math.sin(Math.PI*h.player.jumpT/.52)*100,
  duckPostureAmountAt:t=>t<0?0:1,serJonathanHelmetTopWorldY:(y,d)=>y-116+d*34,
  perfectWin:()=>.18,activeBossDefinition:()=>({hitText:'stone contact'}),
  SFX:{duck(){calls.duck++;},swipe(){calls.swipe++;},jump(){calls.jump++;}},
  damagePlayer:()=>{calls.damage++;},doSequenceObjectParry:()=>{calls.parry++;},
  doPerfectDodge:()=>{calls.perfect++;},floater(){},toGame:(x,y)=>({x,y}),
  immediateParryTapEligible:()=>true,cancelPlayerParryHold(){},clearProvisionalDebugParryMark(){},clearTapIntent(){},
  handleAction:action=>{calls.input.push(action);if(action==='up'){h.player.jumpT=0;h.player.lastJump=h.perfNow;}},
  beginPlayerTurn:()=>{assert.equal(h.boss._sequence,null,'Clean all sequence objects before native player turn');
   calls.turn++;h.boss.phase='player';h.boss.ap=3;}
 };
 vm.createContext(h);
 const capsuleSource=game.slice(game.indexOf('function createPlayerHurtVolumes(){'),game.indexOf('function pointSegmentDistanceSq('));
 assert(capsuleSource.length>500&&capsuleSource.length<2500,'Native capsule source boundary');
 vm.runInContext(capsuleSource,h);vm.runInContext(source,h);
 const driver=h.KRBossSequenceRuntime.createDriver({sequences:recipes,...options,drawLayer:(pass,frame)=>calls.draw.push(pass)});
 h.driver=driver;
 return {h,calls,driver,tick(time){h.perfNow=1+time;h.boss.stateT=time;driver.update(h.boss,1/60);}};
}
function nativePlayerFixture(h,calls,driver){
 // Exercise the real target/actions/easing without starting a second renderer.
 const laneEase=Number(game.match(/LANE_EASE\s*:\s*([\d.]+)/)[1]),
  duckTime=Number(game.match(/DUCK_TIME\s*:\s*([\d.]+)/)[1]);
 Object.assign(h,{runJourneyPrototype:false,playerChar:{monkey:false},
  CFG:{LANE_EASE:laneEase,DUCK_TIME:duckTime},burst(){},speed:()=>9,rnd:()=>0,
  activeBossSequenceDriver:()=>h.mode==='boss'?driver:null,
  updatePlayerParryShield(){},updatePlayerSwordPreview(){},updatePlayerSwordCombo(){},updateSquire(){}});
 Object.assign(h.player,{gallop:0,attackAnim:0,counterAnim:0,parryAnim:0,invuln:0});
 const actionSource=game.slice(game.indexOf('function playerAction(a,parryIntent=null){'),
  game.indexOf('function firstHalfPostureTime(')),
  updateSource=game.slice(game.indexOf('function updatePlayer(dt){'),game.indexOf('function squireFormationX('));
 assert(actionSource.length>1000&&actionSource.length<4000,'Native playerAction source boundary');
 assert(updateSource.length>1000&&updateSource.length<3000,'Native updatePlayer source boundary');
 vm.runInContext(actionSource+'\n'+updateSource,h);
 h.handleAction=action=>{calls.input.push(action);h.playerAction(action);};
 return {laneEase,duckTime};
}
const pooled={id:'objects',name:'Objects',duration:1,sample(t,out,ctx){
 const pool=out._pool||(out._pool=[{id:'slab',primitives:[{},{}]},{id:'return',primitives:[{}]}]);
 out.hazards.length=0;
 Object.assign(pool[0],{active:t<.4,parryable:true});
 for(const p of pool[0].primitives)Object.assign(p,{x:240,y:610,r:8});
 Object.assign(pool[1],{active:t>=.55&&t<.85,parryable:true});
 Object.assign(pool[1].primitives[0],{x:240,y:610,r:8});
 out.hazards.push(...pool);out.motion={test:t};out.props=[ctx.project(1,100,14)];
}};
{
 const {h,calls,driver,tick}=harness([pooled]);
 driver.update(h.boss,1/60);assert.equal(h.boss.state,'sequence');assert.equal(h.boss.attacksLeft,0);
 tick(.1);tick(.2);assert.equal(calls.damage,1,'Two primitives on one object resolve once');
 tick(.5);tick(.65);assert.equal(calls.damage,2,'Return pass uses a separate ID and verdict');
 driver.drawLayer('back',h.boss);driver.drawLayer('front',h.boss);
 assert.deepEqual(calls.draw,['back','front']);tick(1);
 assert.equal(calls.turn,1);assert.equal(h.boss.ap,3);assert.equal(h.boss._lastSequence.stats.hits,2);
 driver.update(h.boss,1/60);assert.equal(calls.turn,1,'Player phase never restarts an enemy sequence');
}
{
 const parryRecipe={...pooled,id:'parry',sample(t,out){
  out.hazards=[{id:'first',active:t<.4,parryable:true,primitives:[circle(280,610)]},
   {id:'second',active:t>=.5&&t<.9,parryable:true,primitives:[circle(240,610)]}];
 }};
 const {h,calls,driver,tick}=harness([parryRecipe]);driver.startRecipe(h.boss,0);
 driver.parry(h.boss);assert.equal(calls.parry,1);assert.equal(h.boss.state,'sequence');
 driver.parry(h.boss);assert.equal(calls.parry,1,'Parrying the same object cannot duplicate rewards');
 tick(.6);assert.equal(calls.damage,1,'Parry did not cancel the following object');
}
{
 const crossing={id:'cross',duration:1,sample(t,out){
  const h=out._stone||(out._stone={id:'moving',active:true,primitives:[circle(100,610)]});
  h.primitives[0].x=t<.2?100:380;out.hazards=[h];
 }};
 const {h,calls,driver,tick}=harness([crossing]);driver.startRecipe(h.boss,0);tick(.1);tick(.3);
 assert.equal(calls.damage,1,'Pooled sample mutations must not overwrite previous primitive positions');
}
{
 const quiet={id:'quiet',duration:1,sample(t,out){out.hazards=[];}};
 const {h,driver,tick}=harness([quiet,{...quiet,id:'two'},{...quiet,id:'three'},{...quiet,id:'four'}]);
 assert.equal(driver.inputMode,'continuous','Other sequence users keep continuous input by default');
 driver.startRecipe(h.boss,2);assert.equal(h.boss._sequence.recipe.id,'three');
 assert.equal(h.boss._sequence.context.startLane,1);
 driver.key(h.boss,'right',true);driver.updatePlayer(h.boss,.2);
 assert(h.player.x>1&&h.player.x<2,'Held movement is fractional');
 assert.equal(h.boss._sequence.context.startLane,1,'Target snapshot must never track movement');
 driver.key(h.boss,'right',false);const at=h.player.x;driver.updatePlayer(h.boss,.1);assert.equal(h.player.x,at);
 h.player.jumpT=.1;driver.action(h.boss,'down');assert.equal(h.player.jumpT,.1,'Early down never forces fast-fall');
 h.player.jumpT=.4;driver.action(h.boss,'down');driver.updatePlayer(h.boss,.13);
 assert.equal(h.player.jumpT,-1);assert.equal(h.player.duckT,0,'Late down buffers native duck on landing');
 const start={done:false};driver.pointerStart(h.boss,start,240,550);driver.pointerMove(h.boss,start,300,520);
 assert.equal(h.player.jumpT,0,'Drag keeps native upward jump action');assert(driver.pointerEnd(h.boss,start));
 h.mode='run';assert.equal(driver.updatePlayer(h.boss,.2),false,'Runner cannot inherit boss free steering');h.mode='boss';
 driver.seek(h.boss,.7);assert.equal(h.boss.stateT,.7);assert.equal(h.boss._sequence.records.size,0);
 tick(1);h.boss.phase='dodge';h.boss.state='idle';h.boss.enemyTurn=4;driver.update(h.boss,.01);
 assert.equal(h.boss._sequence.recipe.id,'four');driver.cancel(h.boss);
 h.boss.state='idle';h.boss.enemyTurn=5;driver.update(h.boss,.01);assert.equal(h.boss._sequence.recipe.id,'quiet');
}
const laneRates=[30,60,120],laneSamples=[];
for(const hz of laneRates){
 const quiet={id:'lane-control',duration:3,sample(t,out){out.hazards=[];}};
 const {h,calls,driver}=harness([quiet],{inputMode:'lanes'}),{laneEase}=nativePlayerFixture(h,calls,driver);
 assert.equal(driver.inputMode,'lanes');Object.assign(h.player,{x:0,lane:0});driver.startRecipe(h.boss);
 driver.key(h.boss,'right',true);assert.equal(h.player.lane,1);assert.equal(h.player.x,0);
 assert.equal(calls.swipe,1,'Lane step uses native swipe action');
 for(let frame=0;frame<hz/2;frame++){
  driver.key(h.boss,'right',true,true);driver.key(h.boss,'right',true);
  h.updatePlayer(1/hz);
 }
 const expected=1-Math.pow(1-Math.min(1,laneEase/hz),hz/2);
 assert(Math.abs(h.player.x-expected)<1e-12,'Lane motion uses unmodified native easing at '+hz+' Hz');
 assert.equal(h.player.lane,1,'Held/repeated keyboard events cannot march across lanes');
 laneSamples.push({hz,time:.5,x:h.player.x,target:h.player.lane,laneEase});
 driver.key(h.boss,'right',false);driver.key(h.boss,'right',true);assert.equal(h.player.lane,2);
 driver.key(h.boss,'right',false);driver.key(h.boss,'right',true);assert.equal(h.player.lane,2);
 assert.equal(calls.swipe,2,'Arena-edge presses do not invent a dodge');
 h.player.jumpT=.1;const before=h.player.x;
 driver.key(h.boss,'left',true);assert.equal(h.player.lane,1);
 h.updatePlayer(1/hz);assert.equal(h.player.jumpT,.1+1/hz,'Lane action preserves the airborne clock');
 assert(h.player.x>before,'Midair position continues easing toward its new native target');
 driver.key(h.boss,'left',false);driver.key(h.boss,'left',true);assert.equal(h.player.lane,0);
 const midair=h.player.x;h.updatePlayer(1/hz);assert(h.player.x<midair,'Midair lane reversal remains available');
 driver.cancelInput();driver.key(h.boss,'right',true,true);assert.equal(h.player.lane,0,
  'Browser autorepeat after canceled ownership must not become a fresh step');
 h.player.jumpT=.4;h.handleAction('down');h.updatePlayer(.13);
 assert.equal(h.player.jumpT,-1);assert(h.player.duckT>=0,'Native landing duck remains buffered');
 assert.equal(calls.duck,1);
 h.player.x=.6;h.player.lane=1;driver.cancel(h.boss);
 assert.equal(h.player.lane,1,'Cancel preserves the integer native destination');
 assert.equal(h.player.x,.6,'Cancel never teleports the mounted player');
 h.boss.phase='player';assert.equal(driver.key(h.boss,'right',true),false);
 assert.equal(driver.action(h.boss,'left'),false);assert.equal(driver.updatePlayer(h.boss,.1),false);
 h.boss.phase='dodge';h.boss.state='sequence';h.mode='run';
 assert.equal(driver.key(h.boss,'right',true),false,'Runner input is not owned by the sequence');
 h.mode='boss';h.paused=true;assert.equal(driver.key(h.boss,'right',true),false);
 assert.equal(driver.pointerStart(h.boss,{done:false},240,550),false,'Paused defense cannot start a gesture');
}
{
 const quiet={id:'lane-touch',duration:3,sample(t,out){out.hazards=[];}};
 const {h,calls,driver}=harness([quiet],{inputMode:'lanes'});nativePlayerFixture(h,calls,driver);
 driver.startRecipe(h.boss);Object.assign(h.player,{x:0,lane:0});
 const swipe={done:false};assert(driver.pointerStart(h.boss,swipe,200,550));
 driver.pointerMove(h.boss,swipe,230,552);assert.equal(h.player.lane,1,'A 30px short swipe is one full lane');
 driver.pointerMove(h.boss,swipe,400,554);driver.pointerMove(h.boss,swipe,80,550);
 assert.equal(h.player.lane,1,'Long drag and reversal cannot add another lane step');
 assert(driver.pointerEnd(h.boss,swipe,450,550));assert.equal(calls.swipe,1);
 const releaseOnly={done:false};driver.pointerStart(h.boss,releaseOnly,200,550);
 assert(driver.pointerEnd(h.boss,releaseOnly,230,550));assert.equal(h.player.lane,2,
  'Release-only short swipe uses final pointer coordinates');
 const jump={done:false};driver.pointerStart(h.boss,jump,220,550);
 driver.pointerMove(h.boss,jump,223,520);assert.equal(h.player.jumpT,0);assert.equal(calls.jump,1);
 driver.pointerMove(h.boss,jump,225,460);assert.equal(calls.jump,1,'One touch fires one vertical action');
 driver.pointerEnd(h.boss,jump);assert.equal(h.player.lane,2,'Vertical jump has no lateral drift');
 const midair={done:false};driver.pointerStart(h.boss,midair,220,550);
 driver.pointerMove(h.boss,midair,190,550);assert.equal(h.player.lane,1,'Touch lane change works while airborne');
 assert.equal(h.player.jumpT,0);driver.pointerEnd(h.boss,midair);
 h.player.jumpT=-1;
 const duck={done:false};driver.pointerStart(h.boss,duck,220,550);
 driver.pointerMove(h.boss,duck,220,580);assert.equal(h.player.duckT,0);assert.equal(calls.duck,1);
 driver.pointerEnd(h.boss,duck);
 h.player.duckT=-1;
 const diagonal={done:false};driver.pointerStart(h.boss,diagonal,220,550);
 driver.pointerMove(h.boss,diagonal,229,558);
 assert.equal(h.player.lane,1,'Early dx9/dy8 movement must not prematurely lock a lane gesture');
 assert.equal(h.player.duckT,-1);
 driver.pointerMove(h.boss,diagonal,242,600);
 assert.equal(h.player.lane,1,'A completed dx22/dy50 gesture has no lateral drift');
 assert.equal(h.player.duckT,0,'Dominant vertical intent survives early diagonal motion');
 assert.equal(calls.duck,2);driver.pointerEnd(h.boss,diagonal);
 const tap={done:false};driver.pointerStart(h.boss,tap,220,550);
 assert.equal(driver.pointerEnd(h.boss,tap,222,551),false,'Tap remains available to native parry release');
 assert.equal(driver.pointerStart(h.boss,{done:false},440,30),false,'Native Special button keeps pointer ownership');
 const paused={done:false};driver.pointerStart(h.boss,paused,220,550);h.paused=true;
 driver.pointerMove(h.boss,paused,260,550);assert.equal(h.player.lane,1);
 assert(driver.pointerEnd(h.boss,paused),'Inactive defense consumes its stale pointer without firing');
}
{
 const stepping={id:'authored-root',duration:1,sample(t,out,ctx){
  const root=out.actorRoot||(out.actorRoot={});
  root.x=ctx.startActorX+t*.5;root.z=ctx.startActorZ-t*4.5;
  out.hazards=[{id:'root-contact',active:t>=.4&&t<.6,primitives:[circle(240,610)]}];
 }};
 const {h,calls,driver,tick}=harness([stepping],{inputMode:'lanes'});
 Object.assign(h.boss,{x:.75,xTarget:.75,z:14});driver.startRecipe(h.boss,0,.25);
 assert.equal(h.boss._sequence.context.startActorX,.75);assert.equal(h.boss._sequence.context.startActorZ,14);
 assert.equal(h.boss.x,.875);assert.equal(h.boss.xTarget,.875);assert.equal(h.boss.z,12.875);
 const rootObject=h.boss._sequence.frame.actorRoot;
 driver.sample(h.boss,.75);assert.equal(h.boss.x,1.125);assert.equal(h.boss.z,10.625);
 driver.sample(h.boss,.75);assert.equal(h.boss.x,1.125);assert.equal(h.boss.z,10.625,
  'Repeated timeline samples cannot accumulate root movement');
 assert.equal(h.boss._sequence.frame.actorRoot,rootObject,'Root samples may reuse bounded frame objects');
 Object.assign(h.player,{x:2,lane:2});driver.seek(h.boss,.25);
 assert.equal(h.boss._sequence.context.startActorX,.75);assert.equal(h.boss._sequence.context.startActorZ,14);
 assert.equal(h.boss._sequence.context.startLane,1,'Seek preserves the committed initial player snapshot');
 assert.equal(h.boss._sequence.context.playerLane,2,'Live player context remains live during deterministic seek');
 assert.equal(h.boss.x,.875);assert.equal(h.boss.z,12.875,'Seek does not rebase on the previous sampled root');
 Object.assign(h.player,{x:1,lane:1});
 h.damagePlayer=()=>{calls.damage++;assert.equal(h.boss.x,1);assert.equal(h.boss.z,11.75,
  'Authored root is applied before native contact resolution');};
 tick(.5);assert.equal(calls.damage,1);
 driver.drawLayer('back',h.boss);driver.drawLayer('front',h.boss);
 assert.equal(h.boss.x,1);assert.equal(h.boss.z,11.75,'Layer rendering does not advance authored root');
 const interruptedFrame=h.boss._sequence.frame;h.boss.state='break';driver.update(h.boss,.1);
 assert.equal(h.boss._sequence,null);assert.equal(interruptedFrame.hazards.length,0);
 assert.equal(h.boss.x,1);assert.equal(h.boss.z,11.75,'Break cleanup cannot teleport the supported root');
 assert.equal(calls.turn,0);
 h.boss.state='idle';driver.startRecipe(h.boss);
 assert.equal(h.boss._sequence.context.startActorZ,11.75,'A new sequence may deliberately start at the live root');
 tick(1);assert.equal(calls.turn,1);assert.equal(h.boss.x,1.5);assert.equal(h.boss.z,7.25,
  'The native player turn keeps the authored final root; recovery belongs to the recipe');
}
{
 const stationary={id:'legacy-stationary',duration:1,sample(t,out){out.hazards=[];}};
 const {h,driver,tick}=harness([stationary]);Object.assign(h.boss,{x:.4,z:12});
 driver.startRecipe(h.boss);assert.equal(h.boss.x,1);assert.equal(h.boss.z,12);
 tick(.5);assert.equal(h.boss.x,1);assert.equal(h.boss.z,12,'Absent actorRoot never opts a legacy recipe into depth movement');
 const bad={id:'invalid-root',duration:1,sample(t,out){out.hazards=[];out.actorRoot={x:1,z:NaN};}};
 const invalid=harness([bad]);assert.throws(()=>invalid.driver.startRecipe(invalid.h.boss),
  /Invalid sequence actorRoot/,'Reject non-finite authored root before rendering/contact');
}
{
 const near={id:'near',duration:.5,sample(t,out){out.hazards=[{id:'graze',active:t<.3,
  primitives:[circle(275,610)]}];}};
 const {h,calls,driver,tick}=harness([near]);driver.startRecipe(h.boss,0);h.player.lastLaneChange=1;
 tick(.1);tick(.4);assert.equal(calls.perfect,1);assert.equal(calls.damage,0);
}
{
 const near={id:'lethal-counter',duration:.5,sample(t,out){out.hazards=[{id:'graze',active:t<.3,
  primitives:[circle(275,610)]}];}};
 const {h,calls,driver,tick}=harness([near]);
 h.doPerfectDodge=()=>{driver.cancel(h.boss);h.boss.state='dying';};
 driver.startRecipe(h.boss,0);h.player.lastLaneChange=1;tick(.1);tick(.5);
 assert.equal(h.boss.state,'dying','Final perfect counter must not be overwritten by turn transition');
 assert.equal(calls.turn,0);
}
{
 // Execute the real updateBoss hook, not a second model of its integration.
 const quiet={id:'native-hook',duration:.2,sample(t,out){out.hazards=[];}};
 const {h,calls,driver}=harness([quiet]);
 h.isPlayerTurn=()=>h.boss.phase==='player';h.isTurnCombat=()=>true;
 h.activeBossDefinition=()=>({sequenceDriver:driver,hitText:'test'});
 const nativeUpdate=game.slice(game.indexOf('function updateBoss(dt){'),game.indexOf('function updateProjectiles(dt){'));
 assert(nativeUpdate.length>10000&&nativeUpdate.length<24000,'Native boss source boundary');
 vm.runInContext(nativeUpdate,h);
 h.updateBoss(.1);assert.equal(h.boss.state,'sequence');assert.equal(h.boss.stateT,0);
 h.updateBoss(.1);assert.equal(h.boss._sequence.time,.1);
 h.updateBoss(.1);assert.equal(calls.turn,1);assert.equal(h.boss.phase,'player');
 h.updateBoss(.1);assert.equal(calls.turn,1,'Native player turn owns the early return');
 // No opt-in driver: unchanged ordinary boss approach/idle timer executes.
 h.activeBossDefinition=()=>({hitText:'bear'});
 Object.assign(h.boss,{phase:'dodge',state:'idle',stateT:0,x:0,xTarget:1,atkTimer:1,attacksLeft:2});
 h.updateBoss(.1);assert.equal(h.boss.x,.5);assert.equal(h.boss.atkTimer,.9);
 assert.equal(h.boss.state,'idle');assert.equal(h.boss.stateT,.1);
}
assert(!/requestAnimationFrame|createElement\(['"]canvas/.test(source.replace(/\/\*[\s\S]*?\*\//g,'')),
 'Sequence runtime must not create another engine/renderer');
for(const token of ['activeBossDefinition().sequenceDriver?.update(boss,dt)',
 "drawLayer('back',boss)","drawLayer('front',boss)",'function doSequenceObjectParry(x,y)',
 'key(boss,a,true,e.repeat)','pointerEnd(boss,tStart,t.clientX,t.clientY)',
 'pointerEnd(boss,tStart,e.clientX,e.clientY)'])
 assert(game.includes(token),'Missing native opt-in hook: '+token);
console.log('BOSS_SEQUENCE_RUNTIME_OK',JSON.stringify({geometryCases,nativeCapsules:true,
 independentObjects:true,relativeMotion:true,pooledSamples:true,turnCleanup:true,inputScoped:true,
 nativeUpdateHook:true,ordinaryBossIdleUnchanged:true,nativeLaneActions:true,discreteKeys:true,
 shortOneSwipeOneLane:true,midairLaneChange:true,authoredRoot:true,deterministicRootSeek:true,
 breakRetainsPhysicalRoot:true,laneSamples}));
