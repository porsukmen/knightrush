'use strict';
// Evidence for the current bodily candidate, never an approved-art baseline.
// --data-only: numerical/route analysis. --frames: native HUD captures only.
// --breakdowns: compact native-phone slam/throw breakdowns, separate evidence.
// Default: numerical checks, exact discrete-input native replays and captures.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),outDir=path.join(root,'output/oathkeeper-physical'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),game=read('KnightRush.html');
const Physical=require('../labs/oathkeeper-physical.js'),Runtime=require('../labs/boss-sequence-runtime.js');
const dataOnly=process.argv.includes('--data-only'),breakdowns=process.argv.includes('--breakdowns'),framesOnly=process.argv.includes('--frames')||breakdowns;
const sourceFiles=['KnightRush.html','labs/oathkeeper-physical.js','labs/oathkeeper-model.js','labs/oathkeeper-encounter.js','labs/boss-sequence-runtime.js','assets/mounted-combat.js','labs/mounted-knight-run-motion.js'];
const hash=p=>crypto.createHash('sha256').update(read(p)).digest('hex');
const report={kind:'oathkeeper-physical',scope:'Current bodily candidate: native three-lane geometry, contacts and route evidence; no aesthetic approval or physical-device performance claim.',hashes:Object.fromEntries(sourceFiles.map(p=>[p,hash(p)])),failures:[],warnings:[]};
fs.mkdirSync(outDir,{recursive:true});
function check(ok,label,detail={}){if(!ok)report.failures.push({label,...detail});}
function sourceFunction(name){
 const m=new RegExp('function '+name+'\\([^\\n]*\\)\\s*\\{').exec(game);assert(m,'Native function absent: '+name);
 let depth=1,i=m.index+m[0].length,quote=null,line=false,block=false;
 for(;i<game.length;i++){const c=game[i],n=game[i+1];if(line){if(c==='\n')line=false;continue;}if(block){if(c==='*'&&n==='/'){block=false;i++;}continue;}
  if(quote){if(c==='\\'){i++;continue;}if(c===quote)quote=null;continue;}
  if(c==='/'&&n==='/'){line=true;i++;continue;}if(c==='/'&&n==='*'){block=true;i++;continue;}if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
  if(c==='{')depth++;if(c==='}'&&!--depth)break;
 }assert.equal(depth,0);return game.slice(m.index,i+1);
}
const cfg={};for(const k of ['JUMP_TIME','JUMP_H','DUCK_TIME','LANE_EASE','FOCAL','Z_FAR','BOSS_Z']){const m=new RegExp('\\b'+k+'\\s*:\\s*([.\\d]+)').exec(game);assert(m,k);cfg[k]=Number(m[1]);}
const native={CFG:cfg,player:{jumpT:-1},mode:'boss',boss:{definitionId:'oathkeeper'},hasRelic:()=>false,curvedWorldActive:()=>false,journeyWorldOffset:()=>0};
vm.createContext(native);native.window=native;vm.runInContext(read('labs/mounted-knight-run-motion.js'),native);
native.activeBossDefinition=()=>({sequenceJumpLift:Number(/sequenceJumpLift\s*:\s*([\d.]+)/.exec(read('labs/oathkeeper-encounter.js'))?.[1]||0)});
for(const prefix of ['const VW=','const HORIZON_Y=','const U=','const SER_JONATHAN_SPINE_LENGTH=','const clamp=','const lerp=','const easeInOut=']){const at=game.indexOf(prefix);assert(at>=0,prefix);vm.runInContext(game.slice(at,game.indexOf(';',at)+1),native);}
for(const name of ['proj','laneX','jumpDur','playerSequenceJumpLift','jumpHeight','duckPostureAmountAt','serJonathanProjectWorldPoint','serJonathanDuckPose','serJonathanHelmetProjection','serJonathanHelmetTopLocal','serJonathanHelmetTopWorldY','createPlayerHurtVolumes','samplePlayerHurtVolumesAt'])vm.runInContext(sourceFunction(name),native);
report.native=vm.runInContext('({VW,VH,HORIZON_Y,PLAYER_Y,GROUND_Y,U,CFG})',native);
const context=(startLane=1)=>({startLane,playerLane:startLane,startActorX:1,startActorZ:cfg.BOSS_Z,actor:{x:1,z:cfg.BOSS_Z},playerY:report.native.PLAYER_Y,groundY:report.native.GROUND_Y,width:report.native.VW,height:report.native.VH,resolved:{},project(lane,height,z){const p=native.proj(z);return {x:native.laneX(lane,p.t),y:p.y-height*p.s,s:p.s,depth:z};}});
const dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i])),rotate=(p,a)=>[p[0]*Math.cos(a)+p[2]*Math.sin(a),p[1],-p[0]*Math.sin(a)+p[2]*Math.cos(a)];
function independentProject(frame,v){
 const depth=frame.actorRoot.z+v[2]*Physical.depthScale,p=native.proj(depth),s=cfg.FOCAL/(cfg.FOCAL+Math.max(depth,-cfg.FOCAL*.78));
 // Native ground is retained, but vertex geometry uses the reciprocal camera,
 // not the legacy artistic sprite-scale easing returned as native proj.s.
 return {x:native.laneX(frame.actorRoot.x,p.t)+v[0]*Physical.worldUnit*s,y:p.y-v[1]*Physical.worldUnit*s,s,depth};
}
function volumes(x,jump=-1,duck=-1){native.player.jumpT=jump;return native.samplePlayerHurtVolumesAt(native.createPlayerHurtVolumes(),native.laneX(x,1),report.native.PLAYER_Y-native.jumpHeight(),native.duckPostureAmountAt(duck));}
const recipe=Physical.recipes[0],M=Physical.markers;
function numerical(){
 const ctx=context(),f=Physical.newFrame(),metrics={samples:0,maxArmBoneError:0,maxLegBoneError:0,maxArmTargetError:0,maxElbowStep:0,maxFootTargetError:0,maxFootAttachmentError:0,maxPlantedDrift:0,maxHeldScreenGap:0,maxGroundFragmentBottomError:0,maxPrimitiveProjectionError:0,maxProps:0,maxPropFaces:0,maxHazards:0,maxPrimitives:0},events={},previousFeet=new Map(),previousElbows=new Map();
 const maximum=(key,value,t,extra)=>{if(value>metrics[key]){metrics[key]=value;metrics[key+'At']={t,...extra};}};
 for(let i=0;i<=Math.ceil(recipe.duration*120);i++){
  const t=Math.min(recipe.duration,i/120);recipe.sample(t,f,ctx);metrics.samples++;
  maximum('maxProps',f.props.length,t);maximum('maxHazards',f.hazards.length,t);maximum('maxPrimitives',f.hazards.reduce((n,h)=>n+h.primitives.length,0),t);
  if(Physical.propFaces)maximum('maxPropFaces',Physical.propFaces(f).length,t);
  for(const a of f.pose.arms){maximum('maxArmBoneError',Math.max(Math.abs(dist(a.root,a.joint)-a.upper),Math.abs(dist(a.joint,a.end)-a.lower)),t,{side:a.side});maximum('maxArmTargetError',dist(a.end,rotate(f.motion[a.side<0?'left':'right'],f.motion.facing||0)),t,{side:a.side});const previous=previousElbows.get(a.side);if(previous)maximum('maxElbowStep',dist(a.joint,previous),t,{side:a.side});previousElbows.set(a.side,[...a.joint]);}
  for(const leg of f.pose.legs){
   maximum('maxLegBoneError',Math.max(Math.abs(dist(leg.root,leg.joint)-leg.upper),Math.abs(dist(leg.joint,leg.end)-leg.lower)),t,{side:leg.side});
   maximum('maxFootTargetError',dist(leg.end,leg.target),t,{side:leg.side});
   maximum('maxFootAttachmentError',dist(leg.end,f.pose.footPoint(leg.side,[leg.side*.87,.33,-.02])),t,{side:leg.side});
   const world=[leg.end[0],leg.end[1],f.actorRoot.z+leg.end[2]*Physical.depthScale],target=[leg.target[0],leg.target[1],f.actorRoot.z+leg.target[2]*Physical.depthScale],old=previousFeet.get(leg.side),planted=Math.abs(target[1]-.33)<1e-7;
   if(planted&&old?.planted&&dist(target,old.target)<1e-7)maximum('maxPlantedDrift',dist(world,old.world),t,{side:leg.side});
   previousFeet.set(leg.side,{world,target,planted});
  }
  for(const h of f.hazards){
   const e=events[h.id]??={activeSamples:0,first:null,last:null,minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity,minDepth:Infinity,maxDepth:-Infinity,standing:[0,0,0],duck:[0,0,0]};
   if(!h.active)continue;e.activeSamples++;e.first??=t;e.last=t;
   const interval=h.id==='diagonal-fist'?M.diagonal:h.id==='return-backhand'?M.backhand:null;
   if(interval)check(t>=interval[0]-1e-8&&t<=interval[1]+1e-8,'Body contact only inside authored active interval',{id:h.id,t});
   for(const p of h.primitives){
    check([p.x,p.y,p.r].every(Number.isFinite)&&p.r>=0,'Finite contact primitive',{id:h.id,t});
    e.minX=Math.min(e.minX,p.x);e.maxX=Math.max(e.maxX,p.x);e.minY=Math.min(e.minY,p.y);e.maxY=Math.max(e.maxY,p.y);
    if(p.source?.kind==='hand'){
     const v=f.pose.handPoint(p.source.side,p.source.local),q=independentProject(f,v);
     maximum('maxPrimitiveProjectionError',Math.max(Math.hypot(p.x-q.x,p.y-q.y),dist(v,p.source.point),Math.abs(q.depth-p.source.depth)),t,{id:h.id});
     e.minDepth=Math.min(e.minDepth,q.depth);e.maxDepth=Math.max(e.maxDepth,q.depth);
     check(q.depth>-1&&q.depth<1.1,'Body damage gated at actual player depth',{id:h.id,t,depth:q.depth});
    }
   }
   for(const lane of [0,1,2]){const standing=volumes(lane),duck=volumes(lane,-1,cfg.DUCK_TIME*.5);if(h.primitives.some(p=>Runtime.touchesVolumes(p,p,standing,standing)))e.standing[lane]++;if(h.primitives.some(p=>Runtime.touchesVolumes(p,p,duck,duck)))e.duck[lane]++;}
  }
  const p=f.props.find(p=>p.id===M.propId);
  if(p?.held){const q=independentProject(f,f.pose.handPoint(1,p.gripLocal));maximum('maxHeldScreenGap',Math.hypot(p.x-q.x,p.y-q.y),t);}
  if(p&&!p.held&&t<M.pickup)maximum('maxGroundFragmentBottomError',Math.abs(p.world.height-p.h*.5),t,{height:p.world.height,halfHeight:p.h*.5});
 }
 for(const [key,tolerance]of [['maxArmBoneError',1e-8],['maxLegBoneError',1e-8],['maxArmTargetError',.025],['maxFootTargetError',.01],['maxFootAttachmentError',1e-8],['maxPlantedDrift',.01],['maxHeldScreenGap',.25],['maxGroundFragmentBottomError',1],['maxPrimitiveProjectionError',1e-8]])check(metrics[key]<=tolerance,key,{value:metrics[key],tolerance,at:metrics[key+'At']});
 if(metrics.maxElbowStep>.30)report.warnings.push({label:'Large 120Hz elbow step; inspect pole/transition',value:metrics.maxElbowStep,at:metrics.maxElbowStepAt});
 for(const id of ['diagonal-fist','return-backhand','slam-ground-front','thrown-fragment'])check(events[id]?.activeSamples>0,'Expected physical threat becomes active',{id});
 const joins=[];for(const t of [M.pickup,M.release]){const a=Physical.newFrame(),b=Physical.newFrame();recipe.sample(t-1e-6,a,ctx);recipe.sample(t+1e-6,b,ctx);const p=a.props.find(p=>p.id===M.propId),q=b.props.find(p=>p.id===M.propId);const step=p&&q?Math.hypot(p.x-q.x,p.y-q.y):Infinity;joins.push({t,step});check(step<.01,'Pickup/release position continuity',{t,step});}
 const lockA=Physical.newFrame(),lockB=Physical.newFrame(),ctxA=context(),ctxB=context();ctxA.playerLane=0;ctxB.playerLane=2;
 recipe.sample((M.release+M.throwContact)*.5,lockA,ctxA);recipe.sample((M.release+M.throwContact)*.5,lockB,ctxB);
 const flightA=lockA.props.find(p=>p.id===M.propId),flightB=lockB.props.find(p=>p.id===M.propId);
 check(flightA&&flightB&&Math.hypot(flightA.x-flightB.x,flightA.y-flightB.y)<1e-8,'Released fragment cannot retarget to live player lane');
 recipe.sample(recipe.duration,f,ctx);check(!f.hazards.some(h=>h.active),'No active danger at native turn boundary');check(Math.abs(f.actorRoot.z-cfg.BOSS_Z)<1e-8,'Authored retreat finishes at starting depth');
 report.numerical={metrics,events,joins};
}
if(!framesOnly)numerical();

function simulateRoute(startLane,inputs,hz,clearance=0){
 const dt=1/hz,ctx=context(startLane),f=Physical.newFrame(),state={x:startLane,lane:startLane,jump:-1,duck:-1,queued:false};
 let input=0,oldHazards=new Map(),before=volumes(state.x),contacts=[];
 for(let tick=1;tick<=Math.ceil(recipe.duration*hz);tick++){
  const t0=(tick-1)*dt,t=tick*dt;
  while(input<inputs.length&&inputs[input].t<=t0+1e-7){const action=inputs[input++].action;
   if(action==='left')state.lane=Math.max(0,state.lane-1);else if(action==='right')state.lane=Math.min(2,state.lane+1);
   else if(action==='up'&&state.jump<0){state.jump=0;state.duck=-1;}
   else if(action==='down'){if(state.jump>=0)state.queued=cfg.JUMP_TIME-state.jump<=.22;else state.duck=0;}
  }
  state.x+=(state.lane-state.x)*Math.min(1,cfg.LANE_EASE*dt);
  if(state.queued&&(state.jump<0||state.jump+dt>=cfg.JUMP_TIME)){state.queued=false;state.jump=-1;state.duck=0;}
  if(state.jump>=0){state.jump+=dt;if(state.jump>cfg.JUMP_TIME)state.jump=-1;}
  if(state.duck>=0){state.duck+=dt;if(state.duck>cfg.DUCK_TIME)state.duck=-1;}
  const after=volumes(state.x,state.jump,state.duck);ctx.playerLane=state.x;ctx.playerX=native.laneX(state.x,1);recipe.sample(Math.min(recipe.duration,t),f,ctx);const current=new Map();
  for(const h of f.hazards){if(!h.active)continue;const old=oldHazards.get(h.id);
   for(let i=0;i<h.primitives.length;i++){const p=h.primitives[i];if(Runtime.touchesVolumes(old?.[i]||p,p,old?before:after,after,clearance)){contacts.push({id:h.id,t,x:state.x,lane:state.lane,jump:state.jump,duck:state.duck});return {passed:false,hz,contacts};}}
   current.set(h.id,h.primitives.map(p=>({x:p.x,y:p.y,r:p.r})));
  }
  before=after;oldHazards=current;
 }
 return {passed:true,hz,contacts,finalLane:state.x};
}
function planRoutes(){
 const routes=[];
 for(const start of [0,1,2]){
  let found=null,attempts=0,bestFailure=null;
  // Every candidate consists of real integer lane edges and native up/down
  // actions. Positions are never placed onto the old free-steering grid.
  for(const backhandGoal of [0,2]){if(found)break;
   for(const finalGoal of [backhandGoal,1,2,0]){if(found)break;
    for(const jumpT of Array.from({length:19},(_,i)=>Number((M.waveContact-.40+i/60).toFixed(6)))){if(found)break;
     for(const duckT of backhandGoal===0?[M.backhand[0]-.22,M.backhand[0]-.12,M.backhand[0]-.02]:[-1]){
      const inputs=[];let lane=start;
      const go=(target,t)=>{let step=0;while(lane!==target){inputs.push({t:Number((t+step*.10).toFixed(6)),action:lane<target?'right':'left'});lane+=lane<target?1:-1;step++;}};
      go(0,M.approachEnd+.06);go(backhandGoal,M.diagonal[1]+.13);
      if(duckT>=0)inputs.push({t:Number(duckT.toFixed(6)),action:'down'});
      inputs.push({t:jumpT,action:'up'});go(finalGoal,M.release+.04);inputs.sort((a,b)=>a.t-b.t);
      attempts++;const samples=[30,60,120].map(hz=>simulateRoute(start,inputs,hz,2));
      if(samples.every(r=>r.passed)){found={startLane:start,inputs,samples,attempts,clearance:2};break;}
      const failure=samples.find(r=>!r.passed);if(!bestFailure||failure.contacts[0].t>bestFailure.contacts[0].t)bestFailure=failure;
     }
    }
   }
  }
  routes.push(found||{startLane:start,inputs:[],attempts,found:false,bestFailure});check(!!found,'No zero-contact discrete event plan found',{startLane:start,attempts,bestFailure});
 }
 report.routes={model:'Native integer destination + CFG.LANE_EASE interpolation, exact jump/duck capsules and swept-circle contacts. Each seed is independently replayed at30/60/120; no continuous-input grid.',plans:routes};
}
if(!framesOnly)planRoutes();

async function browserChecks(){
 const {chromium}=require('playwright'),sharp=require('sharp'),browser=await chromium.launch({channel:'msedge',headless:true}),errors=[],missing=[];
 try{
  const browserContext=await browser.newContext({viewport:{width:480,height:850},deviceScaleFactor:1,hasTouch:true}),page=await browserContext.newPage();
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))missing.push({url:r.url(),status:r.status()});});
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  await page.goto((process.env.KR_BASE_URL||'http://127.0.0.1:8765')+'/KnightRush.html?oathkeeperlab=1&mortal=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.KROathkeeperPhysical&&window.KROathkeeperEncounter&&window.KRMountedRunner?.ready,{},{polling:100,timeout:120000});
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  await run('SFX.setTestMuted(true);');
  if(!framesOnly){
   report.nativeRoutes=await page.evaluate(plans=>(0,eval)(`(${function(plans){
    const result=[];
    for(const plan of plans)for(const hz of [30,60,120]){
     if(plan.found===false){result.push({startLane:plan.startLane,hz,passed:false,reason:'No source-level candidate plan'});continue;}
     KROathkeeperEncounter.start();player.x=player.lane=plan.startLane;player.jumpT=player.duckT=-1;player.invuln=0;
     // Keep counter rewards from prematurely defeating the boss. Player damage
     // remains fully native: successful replay must produce no contact verdict.
     boss.hp=boss.maxhp=1e9;boss.posture=0;
     const driver=KROathkeeperEncounter.sequenceDriver;driver.startRecipe(boss,0,0);
     const before=player.currentHealthUnits,dt=1/hz,contacts=[],seen=new Set();let input=0,ticks=0;
     for(let tick=1;tick<=Math.ceil(KROathkeeperPhysical.duration*hz)+3&&boss.phase==='dodge'&&player.alive;tick++){
      const t0=(tick-1)*dt;
      while(input<plan.inputs.length&&plan.inputs[input].t<=t0+1e-7){const a=plan.inputs[input++].action;
       if(a==='left'||a==='right'){driver.key(boss,a,true,false);driver.key(boss,a,false,false);}else playerAction(a);
      }
      update(dt);ticks++;
      const state=boss._sequence,verdicts=state?.resolved||boss._lastSequence?.resolved||{};
      for(const [id,value]of Object.entries(verdicts))if(value==='hit'&&!seen.has(id)){seen.add(id);contacts.push({id,t:state?.time,x:player.x,lane:player.lane,jumpT:player.jumpT,duckT:player.duckT});}
     }
     const stats=boss._lastSequence?.stats||boss._sequence?.stats||{},after=player.currentHealthUnits;
     result.push({startLane:plan.startLane,hz,ticks,inputCount:input,contacts,stats,before,after,phase:boss.phase,alive:player.alive,
      lastRecipe:boss._lastSequence?.id,passed:stats.hits===0&&before===after&&boss.phase==='player'&&boss._lastSequence?.id==='weight-of-the-oath'});
    }return result;
   }.toString()})(${JSON.stringify(plans)})`),report.routes.plans);
   for(const replay of report.nativeRoutes)check(replay.passed,'Native discrete route replay failed',replay);
   report.integration=await run(`(()=>{
    const driver=KROathkeeperEncounter.sequenceDriver,M=KROathkeeperPhysical.markers,result={};
    const fresh=(time=0,lane=1)=>{KROathkeeperEncounter.start();player.x=player.lane=lane;player.jumpT=player.duckT=-1;player.invuln=0;boss.hp=boss.maxhp=1e9;driver.startRecipe(boss,0,time);};
    const candidate=parry=>{fresh();for(let tick=1;tick<Math.ceil(M.slamContact*240);tick++){
     const t=tick/240,frame=driver.sample(boss,t);for(const lane of [0,1,2]){
      player.x=player.lane=lane;const volumes=samplePlayerHurtVolumes();
      for(const h of frame.hazards){if(!h.active||parry&&!h.parryable)continue;
       const hit=h.primitives.some(p=>KRBossSequenceRuntime.touchesVolumes(p,p,volumes,volumes)),near=h.primitives.some(p=>KRBossSequenceRuntime.touchesVolumes(p,p,volumes,volumes,h.parryMargin||18));
       if(parry?near&&!hit:hit)return {t,lane,id:h.id};
      }
     }
    }return null;};
    const hit=candidate(false);if(hit){fresh(hit.t,hit.lane);const before=player.currentHealthUnits;driver.resolve(boss);const after=player.currentHealthUnits,hits=boss._sequence?.stats.hits;
     for(let i=0;i<8;i++)driver.resolve(boss);
     result.mortal={...hit,before,after,alive:player.alive,godMode,hits,hitsAfterRepeatedResolve:boss._sequence?.stats.hits};
    }else result.mortal={error:'No actual standing body contact fixture found'};
    const parry=candidate(true);if(parry){fresh(parry.t,parry.lane);boss.postureMax=1e9;boss.posture=0;const before=player.currentHealthUnits;playerAction('parry');
     const state=boss._sequence,parries=state?.stats.parries,afterParry=state?.resolved[parry.id],phase=boss.phase,posture=boss.posture;
     playerAction('parry');const repeated=state?.stats.parries;player.invuln=999;
     // Immunity only keeps this interruption fixture alive; this is NOT a dodge.
     let ticks=0;while(boss.phase==='dodge'&&ticks++<1800)update(1/120);
     result.parry={...parry,before,after:player.currentHealthUnits,parries,repeated,afterParry,phase,posture,
      finalPhase:boss.phase,laterVerdicts:boss._lastSequence?.resolved||boss._sequence?.resolved||{}};
    }else result.parry={error:'No actual pre-contact parry shell fixture found'};
    fresh(2.0);paused=true;const pausedState=boss._sequence,pausedTime=boss.stateT,pausedRoot={x:boss.x,z:boss.z},pausedHealth=player.currentHealthUnits;
    const stamp=performance.now();for(let i=0;i<6;i++)frame(stamp+i*16.667);
    result.pause={sameSequence:boss._sequence===pausedState,before:pausedTime,after:boss.stateT,rootBefore:pausedRoot,rootAfter:{x:boss.x,z:boss.z},healthBefore:pausedHealth,healthAfter:player.currentHealthUnits};paused=false;
    fresh(2.2);const old=boss._sequence;driver.key(boss,'left',true,false);KROathkeeperEncounter.start();driver.startRecipe(boss,0,0);
    result.restart={newSequence:boss._sequence!==old,time:boss._sequence.time,records:boss._sequence.records.size,resolved:Object.keys(boss._sequence.resolved),lane:player.lane,root:{x:boss.x,z:boss.z}};
    fresh(2.2);const breakFrame=boss._sequence.frame;applyBossPosture(boss.postureMax||CFG.BOSS_POSTURE_MAX,'physical-audit');
    result.break={phase:boss.phase,sequenceCleared:boss._sequence===null,retainedHazards:breakFrame.hazards.length,ap:boss.ap,apMax:boss.apMax};
    fresh(2.2);const deathFrame=boss._sequence.frame;damagePlayer('Physical audit lethal fixture',true);
    result.playerDeath={alive:player.alive,mode,sequenceCleared:boss._sequence===null,retainedHazards:deathFrame.hazards.length};
    fresh(M.recoveryEnd);update(1/120);const healthAtMenu=player.currentHealthUnits,rootAtMenu={x:boss.x,z:boss.z};for(let i=0;i<30;i++)update(1/120);
    result.menu={phase:boss.phase,sequenceCleared:boss._sequence===null,healthBefore:healthAtMenu,healthAfter:player.currentHealthUnits,root:rootAtMenu,ap:boss.ap,apMax:boss.apMax};
    return result;
   })()`);
   const I=report.integration;
   check(!I.mortal.error&&I.mortal.after<I.mortal.before&&I.mortal.alive&&!I.mortal.godMode,'Body collision causes real nonlethal mortal damage',I.mortal);
   check(I.mortal.hits===1&&I.mortal.hitsAfterRepeatedResolve===1,'One semantic body contact resolves once',I.mortal);
   check(!I.parry.error&&I.parry.parries===1&&I.parry.repeated===1&&I.parry.afterParry==='parry'&&I.parry.phase==='dodge'&&I.parry.posture>0,'Individual body parry preserves native reward and ongoing chain',I.parry);
   check(I.parry.laterVerdicts?.['slam-ground-front']==='hit','Parry does not silently consume a later independent wave',I.parry);
   check(I.pause.sameSequence&&I.pause.before===I.pause.after&&I.pause.rootBefore.x===I.pause.rootAfter.x&&I.pause.rootBefore.z===I.pause.rootAfter.z&&I.pause.healthBefore===I.pause.healthAfter,'Actual paused frame freezes sequence/contact state',I.pause);
   check(I.restart.newSequence&&I.restart.time===0&&I.restart.records===0&&I.restart.resolved.length===0&&I.restart.root.z===cfg.BOSS_Z,'Restart clears old contacts and restores authored entry',I.restart);
   check(I.break.phase==='player'&&I.break.sequenceCleared&&I.break.retainedHazards===0&&I.break.ap===I.break.apMax,'Native Break clears chain before real player turn',I.break);
   check(!I.playerDeath.alive&&I.playerDeath.mode==='dying'&&I.playerDeath.sequenceCleared&&I.playerDeath.retainedHazards===0,'Native player death clears sequence and active contacts',I.playerDeath);
   check(I.menu.phase==='player'&&I.menu.sequenceCleared&&I.menu.healthBefore===I.menu.healthAfter&&I.menu.ap===I.menu.apMax,'No retained damage in native player menu',I.menu);
   report.performance=await run(`(()=>{
    KROathkeeperEncounter.start();const d=KROathkeeperEncounter.sequenceDriver,r=KROathkeeperEncounter.renderer;d.startRecipe(boss,0,0);player.invuln=999;
    const samples=[],renders=[],summary=values=>{const a=[...values].sort((a,b)=>a-b);return {mean:values.reduce((x,y)=>x+y,0)/values.length,median:a[Math.floor(a.length*.5)],p95:a[Math.floor(a.length*.95)],max:a.at(-1)};};
    let maxFaces=0,maxProps=0,maxPropFaces=0,maxBuildsPerRender=0,maxUploadsPerRender=0;
    for(let i=0;i<8;i++){d.sample(boss,KROathkeeperPhysical.duration*i/8);render();}
    for(let i=0;i<120;i++){
     const t=KROathkeeperPhysical.duration*(i+.5)/120;let stamp=performance.now();d.sample(boss,t);samples.push(performance.now()-stamp);
     const frame=boss._sequence.frame,props=KROathkeeperPhysical.propFaces?.(frame)||[];maxProps=Math.max(maxProps,frame.props.length);maxPropFaces=Math.max(maxPropFaces,props.length);
     const before=r.stats();stamp=performance.now();render();renders.push(performance.now()-stamp);const after=r.stats();maxFaces=Math.max(maxFaces,after.faces);
     maxBuildsPerRender=Math.max(maxBuildsPerRender,after.geometryBuilds-(before?.geometryBuilds||0));maxUploadsPerRender=Math.max(maxUploadsPerRender,after.uploads-(before?.uploads||0));
    }
    d.sample(boss,2.35);render();const before=r.stats();for(let i=0;i<8;i++)render();const after=r.stats();
    return {note:'120 sampled whole-scene CPU submission wall times in headless Edge after8warmups. GPU completion and actual-phone FPS are not measured.',samples:120,sampleCPUms:summary(samples),renderCPUms:summary(renders),maxProps,maxPropFaces,maxFaces,maxBuildsPerRender,maxUploadsPerRender,frozenExtraBuilds:after.geometryBuilds-before.geometryBuilds,frozenExtraUploads:after.uploads-before.uploads};
   })()`);
   check(report.performance.maxBuildsPerRender<=1&&report.performance.maxUploadsPerRender<=1,'Far/near physical passes reuse one geometry build/upload',report.performance);
   check(report.performance.frozenExtraBuilds===0&&report.performance.frozenExtraUploads===0,'Frozen native renders reuse physical geometry',report.performance);
  }
  report.captures=[];
  const captureGroups=breakdowns?[{prefix:'slam-breakdown',times:[5.44,5.50,5.57,5.65,5.73]},{prefix:'throw-breakdown',times:[8.56,8.63,8.70,8.77,8.88]}]:[{prefix:'physical',times:[2.35,3.95,5.76,7.3,8.88,13.0]}];
  for(const [width,height]of breakdowns?[[390,844]]:[[480,850],[390,844]]){
   await page.setViewportSize({width,height});await run('resize();KROathkeeperEncounter.start();update(1/120);');
   for(const group of captureGroups){const tiles=[],columns=breakdowns?5:3;
   for(const [i,t]of group.times.entries()){
    const state=await run(`(()=>{const d=KROathkeeperEncounter.sequenceDriver;d.seek(boss,${t});player.x=player.lane=1;player.jumpT=player.duckT=-1;perfNow=200+${t};flashA=0;shakeMag=0;bannerT=0;floaters.length=0;particles.length=0;paused=false;pausePhotoMode=false;render();return {t:boss._sequence.time,beat:boss._sequence.frame.beat,actorRoot:{...boss._sequence.frame.actorRoot},nativeHUD:!paused&&!pausePhotoMode};})()`);
    const file=path.join(outDir,`${group.prefix}-${width}-${String(t).replace('.','_')}.png`),raw=await page.screenshot({path:file});report.captures.push({...state,group:group.prefix,width,height,file});
    const tileWidth=width===480?240:195,tileHeight=Math.round(height*tileWidth/width),label=Buffer.from(`<svg width="${tileWidth}" height="24"><text x="7" y="17" fill="#e4d1a2" font-family="sans-serif" font-size="12">${t.toFixed(2)} s</text></svg>`),tile=await sharp(raw).resize(tileWidth,tileHeight).extend({top:24,bottom:0,left:0,right:0,background:'#17252b'}).composite([{input:label,left:0,top:0}]).png().toBuffer();tiles.push({input:tile,left:(i%columns)*tileWidth,top:Math.floor(i/columns)*(tileHeight+24)});
   }
   const tileWidth=width===480?240:195,tileHeight=Math.round(height*tileWidth/width),file=path.join(outDir,`${group.prefix}-${width}-sheet.png`);await sharp({create:{width:tileWidth*columns,height:(tileHeight+24)*Math.ceil(group.times.length/columns),channels:4,background:'#17252b'}}).composite(tiles).png().toFile(file);
   }
  }
  report.browser={errors,missing};check(!errors.length,'Native browser page errors',{errors});check(!missing.length,'Native assets missing',{missing});
 }finally{await browser.close();}
}
(async()=>{
 if(!dataOnly)await browserChecks();
 for(const [p,value]of Object.entries(report.hashes))check(hash(p)===value,'Source changed during audit; evidence requires rerun',{file:p});
 report.passed=report.failures.length===0;fs.writeFileSync(path.join(outDir,breakdowns?'breakdowns-report.json':framesOnly?'frames-report.json':'physical-report.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
})().catch(error=>{report.failures.push({label:'Audit exception',message:error.message});fs.writeFileSync(path.join(outDir,'physical-failure.json'),JSON.stringify(report,null,2));console.error(error);process.exitCode=1;});
