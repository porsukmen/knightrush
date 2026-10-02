/* Jonathan's production mounted actor. Death/Squire renderers are unchanged.
 * Shared pose modules contain no Lab UI; opt-in controls live separately. */
(()=>{'use strict';
 const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(Error(src+' yüklenemedi'));document.body.append(s);}),
  visible={knight:true,horse:true,shield:true,sword:true,bow:true,quiver:true},runUnit=3*1.02,
  laneYaw=2,gaitTempo=1.15;
 const test=window.KRMountedRunner={unit:runUnit,ready:false,busy:false,draws:0,lastDuck:0,lastState:null,motion:'gallop',clock:0,swordT:-1,entryGaitOffset:0,entryState:null,jumpRate:1,fastFall:false,jumpBuffered:false,gaitRate:gaitTempo,
  laneAngle:(x,heading=0,weight=1,cornerYaw=0)=>180+Math.max(-9.5,Math.min(9.5,laneYaw*Math.max(-1,Math.min(1,x-1))+(-2.6*heading+cornerYaw)*weight)),
  active:()=>mode==='run'&&player.alive&&!player.mountedDeath&&playerChar.rigId==='ser_jonathan',
  prepare:async()=>{
   for(const name of ['walk-poses.js','walk-equipment.js','shield-geometry.js','walk-native.js'])await load('art-source/blender/jonathan-approved-v1/'+name);
   await KRJonathanWalk.prepare();
   for(const name of ['mounted-knight-rig.js','mounted-horse-gpu.js','mounted-horse-saddle.js','mounted-knight-sword.js','mounted-knight-shield.js','mounted-knight-bow.js','mounted-knight-duck.js','mounted-knight-jump.js','mounted-knight-jump-entry.js','mounted-knight-steering.js','mounted-knight-action-gpu.js','mounted-knight-renderer.js','mounted-knight-run-motion.js'])await load('labs/'+name);
   await KRMountedReview.prepare({angle:180,motion:'gallop',action:'jump'});
   // Compile action GPU programs before the first interactive frame.
   const warm=document.createElement('canvas');warm.width=480;warm.height=800;
   for(const [action,time]of [['none',.5],['duck',.67],['sword',.4],['sword',1.6],['bash',1.1],['parry',1.7],['bow',2.8],['jump',1.075]])KRMountedReview.draw(warm.getContext('2d'),{angle:180,motion:'gallop',action,time,zoom:1,visible},null,{x:240,y:650,unit:2.397});
   for(const elapsed of [0,.017,.05,.10,.15,.199])KRMountedReview.draw(warm.getContext('2d'),{angle:180,motion:'gallop',action:'jump',time:KRMountedRunMotion.timeAt(elapsed),entryElapsed:elapsed,entryState:{angle:180,time:.23,motion:'gallop',action:'none',gaitRate:1},zoom:1,visible},null,{x:240,y:650,unit:2.397});
   const originalDuckTime=CFG.DUCK_TIME;
   const J=KRMountedJump,T=J.timing,M=KRMountedRunMotion,jumpLength=M.timing.duration,
    originalPlayer=drawPlayer,originalUpdate=updatePlayer,originalWorldUpdate=update,originalObstacleFront=obstacleDrawsOverRider,originalAction=playerAction,originalJumpHeight=jumpHeight,originalJumpDur=jumpDur,originalAirborne=isAirborne;
   let worldUpdating=false,travelFraction=1;
   const laneMotion=test.laneMotion={};M.resetLane(laneMotion);
   jumpDur=function(){return test.active()?jumpLength*(hasRelic('feather')?1.18:1):originalJumpDur();};
   const jumpTime=()=>M.timeAt(Math.max(0,player.jumpT)/jumpDur()*jumpLength);
   const jumpContact=()=>M.timing.contact/jumpLength*jumpDur();
   let cachedKey='',cachedFrame=null;
   const modelFrame=()=>{
    const jumping=player.jumpT>=0,duck=player.duckT>=0,steeringWeight=jumping?1-.35*Math.sin(Math.PI*player.jumpT/jumpDur())**2:duck?1-.2*M.duckAmountAt(player.duckT):1,
     corner=M.cornerPose(runJourneyPrototype?journey:null),
     state={angle:test.laneAngle(player.x,laneMotion.heading,steeringWeight,corner.yaw),laneBank:(laneMotion.bank*.02617993878+corner.bank)*steeringWeight,riderSteer:Math.max(-1,Math.min(1,laneMotion.rider+corner.rider))*steeringWeight,time:jumping?jumpTime():test.clock,motion:jumping?'gallop':test.motion,action:jumping?'jump':duck?'duck':test.swordT>=0?'sword':'none',actionTime:test.swordT,entryGaitOffset:0,
      entryState:jumping?test.entryState:null,entryElapsed:jumping?player.jumpT/jumpDur()*jumpLength:0,
      laneStep:jumping?0:laneMotion.heading,stepClock:laneMotion.stepClock,duckAmount:duck?M.duckAmountAt(player.duckT):0,zoom:1,visible,worldViewport:true},
     key=[state.time,state.motion,state.action,state.actionTime,state.entryElapsed,test.entryId||0,state.duckAmount,player.x,state.angle,state.laneBank,state.riderSteer].join('|');
    if(key!==cachedKey){cachedKey=key;cachedFrame=M.frame(state,laneX(player.x,1),PLAYER_Y,runUnit);}
    return cachedFrame;
   };
   test.frame=modelFrame;
   jumpHeight=function(){return test.active()?modelFrame().height:originalJumpHeight();};
   isAirborne=function(){return test.active()?modelFrame().airborne:originalAirborne();};
   obstacleDrawsOverRider=function(obstacle,depth,overArch){
    // Only the low branch in the rider's current lane is cleared by a normal
    // jump. Keep duck arches and camera-near scenery in the foreground.
    const clearsLowBranch=test.active()&&obstacle.req?.[Math.round(player.x)]==='jump'&&modelFrame().airborne;
    return originalObstacleFront(obstacle,depth,overArch||clearsLowBranch);
   };
   playerAction=function(a,...args){
    const entryState=a==='up'&&test.active()?{...modelFrame().state,entryState:null,runElapsed:Math.max(0,player.jumpT)/jumpDur()*jumpLength,gaitRate:test.gaitRate}:null;
    if(a==='up'&&test.active()&&test.motion!=='gallop'){test.command('jump');return;}
    if(a==='up'&&test.active()&&player.jumpT>=0){
     if(knightRushSequence||runJourneyPrototype&&journey?.phase==='turning')return;
     if(player.jumpT<jumpContact()){
      // A single early press survives the descent, not just the last part of
      // the grounded recovery. No midair double jump or indefinite queue.
      if(player.jumpT>=jumpContact()-.22)test.jumpBuffered=true;
      return;
     }
     // Feet have landed: recovery is cosmetic and must not block the next
     // obstacle. Start from this recovery stride rather than a stale clock.
     test.clock=J.gaitTime(jumpTime());player.jumpT=-1;
    }
    if(a==='down'&&test.active()&&player.jumpT>=0){test.fastFall=true;test.jumpBuffered=false;test.swordT=-1;return;}
    if(a==='down'&&test.active()&&player.duckT>=0){
     // Refresh the hold without snapping an already lowered torso upright.
     if(player.duckT>M.duckTiming.lower){const amount=M.duckAmountAt(player.duckT);let lo=0,hi=M.duckTiming.lower;for(let i=0;i<16;i++){const mid=(lo+hi)/2;if(M.duckAmountAt(mid)<amount)lo=mid;else hi=mid;}player.duckT=(lo+hi)/2;}
     test.swordT=-1;return;
    }
    const wasJumping=player.jumpT>=0,entry=test.clock,oldLane=player.lane;
    const result=originalAction(a,...args);
    if((test.active()||window.KRMountedCombat?.active())&&(a==='left'||a==='right')&&player.lane!==oldLane)M.cueLane(laneMotion,player.lane-oldLane);
    if(test.active()&&!wasJumping&&player.jumpT>=0){test.swordT=-1;test.fastFall=false;test.jumpRate=1;test.jumpBuffered=false;test.entryGaitOffset=0;test.entryState=entryState;test.entryId=(test.entryId||0)+1;}
    if(test.active()&&a==='down')test.swordT=-1;
    return result;
   };
   updatePlayer=function(dt){
    CFG.DUCK_TIME=test.active()?M.duckTiming.duration:originalDuckTime;
    const jumping=player.jumpT>=0,oldJump=player.jumpT,duration=jumpDur(),oldX=player.x;
    if(test.active()&&jumping){test.jumpRate+=((test.fastFall?2.4:1)-test.jumpRate)*Math.min(1,dt*14);player.jumpT+=dt*(test.jumpRate-1);}
    const result=originalUpdate(dt);
    if(test.active()){
     const canSteer=!(runJourneyPrototype&&journey?.phase==='turning');
     M.advanceLane(laneMotion,canSteer&&dt>0?(player.x-oldX)/dt:0,dt);
     if(!worldUpdating)test.clock+=dt*test.gaitRate;
     if(jumping&&player.jumpT<0){
      const overshoot=Math.max(0,oldJump+dt*test.jumpRate-duration)/test.jumpRate;
      test.clock=J.gaitTime(T.settle)+(worldUpdating?0:overshoot*test.gaitRate);travelFraction=dt>0?Math.min(1,overshoot/dt):0;
      test.fastFall=false;test.jumpRate=1;if(test.jumpBuffered){test.jumpBuffered=false;playerAction('up');}
     }
     if(test.jumpBuffered&&player.jumpT>=jumpContact())playerAction('up');
     if(test.swordT>=0){test.swordT+=dt;if(test.swordT>=KRMountedSword.duration())test.swordT=-1;}
    }else {test.swordT=-1;test.clock=0;test.entryGaitOffset=0;test.entryState=null;test.fastFall=false;test.jumpRate=1;test.jumpBuffered=false;if(window.KRMountedCombat?.active())M.advanceLane(laneMotion,dt>0?(player.x-oldX)/dt:0,dt);else M.resetLane(laneMotion);}
    return result;
   };
   update=function(dt){
    const active=test.active(),before=roadScroll;worldUpdating=true;travelFraction=1;
    try{return originalWorldUpdate(dt);}finally{
     worldUpdating=false;
     if(active&&test.active()){
      // Slightly brisker cadence, still integrated from actual road travel.
      // Speed tiers/slowdowns/turns remain synchronized; world speed and the
      // jump/duck action clocks do not change with this visual tempo setting.
      const travel=Math.max(0,roadScroll-before),phaseTravel=travel/22*gaitTempo;
      test.gaitRate=dt>0?phaseTravel/dt:0;
      test.clock+=phaseTravel*travelFraction;
     }
    }
   };
   drawPlayer=function(...args){
    const combat=window.KRMountedCombat?.active();
    if(!test.active()&&!combat)return originalPlayer(...args);
    const f=combat?KRMountedCombat.frame():modelFrame(),s=f.shadow;
    // Own the entire run actor pass. Do not call the old rider placement,
    // normalized 100px jump, rush lunge, air angles or scale modifiers.
    g.save();try{
     g.fillStyle='#000';g.globalAlpha=s.alpha;g.beginPath();g.ellipse(s.x,s.y,s.rx,s.ry,0,0,Math.PI*2);g.fill();
     g.globalAlpha=player.invuln>0&&(perfNow*14|0)%2===0?.45:1;
     // A shared native projection bank keeps horse, rider, depth masks and
     // equipment together. The ground shadow above deliberately stays level.
     if(f.bank.angle){g.translate(f.placement.x,f.placement.y-f.bank.lift);g.rotate(f.bank.angle);g.translate(-f.placement.x,-f.placement.y);}
     KRMountedReview.draw(g,f.state,null,f.placement,f.pose);
     if(combat)KRMountedCombat.afterDraw(f);
    }finally{g.restore();}
    test.draws++;test.lastDuck=f.state.duckAmount;test.lastState=f.state;test.lastPlacement=f.placement;
   };
   await load('assets/mounted-combat.js');
   test.ready=true;
  }
 };
 const originalStart=startRun;let pending=null;
 startRun=function(...args){
  if(test.ready||test.failed){if(test.laneMotion)KRMountedRunMotion.resetLane(test.laneMotion);return originalStart(...args);}
  pending={args,mode};menuMsg='Model hazırlanıyor…';menuMsgT=perfNow+2;
 };
 const prepare=test.prepare;let preparation=null;
 test.prepare=()=>preparation||(preparation=prepare().catch(error=>{test.failed=true;console.error('Mounted runner could not load',error);}).finally(()=>{
  if(pending&&mode===pending.mode)originalStart(...pending.args);pending=null;
 }));
})();
