/* Opt-in whole enemy turns. Native EncounterActor, updatePlayer, mounted hurt
 * capsules, combat rewards and renderer remain the only game engine. No RAF,
 * canvas, camera, player clone or asset loading is owned by this module. */
(function(root){'use strict';
 const finite=Number.isFinite;

 /* Exact relative sweep for the native vertical horse/rider capsules, including
  * the changing helmet endpoint while ducking. Split where the moving circle
  * crosses a moving endpoint, then minimize a quadratic on each interval. This
  * catches two objects crossing between frames, not only the final silhouette. */
 function movingCircleTouchesCapsule(a,b,v0,v1,pad=0){
  // Optional depth slab; ordinary 2D hazards retain the original path.
  let zFrom=0,zTo=1;
  if(finite(a.z)&&finite(b.z)){
   const radius=Math.max(a.depthRadius||0,b.depthRadius||0),dz=b.z-a.z;
   if(Math.abs(dz)<1e-9){if(Math.abs(a.z)>radius)return false;}
   else{const u=(-radius-a.z)/dz,v=(radius-a.z)/dz;zFrom=Math.max(0,Math.min(u,v));zTo=Math.min(1,Math.max(u,v));if(zFrom>zTo)return false;}
  }
  const x0=a.x-v0.x1,dx=(b.x-v1.x1)-x0;
  const lo0=Math.min(v0.y1,v0.y2),hi0=Math.max(v0.y1,v0.y2);
  const lo1=Math.min(v1.y1,v1.y2),hi1=Math.max(v1.y1,v1.y2);
  const lower0=a.y-lo0,lowerD=(b.y-lo1)-lower0;
  const upper0=a.y-hi0,upperD=(b.y-hi1)-upper0;
  const radius=Math.max(a.r,b.r)+Math.max(v0.r,v1.r)+pad,rr=radius*radius;
  const lowerCross=Math.abs(lowerD)>1e-9?-lower0/lowerD:1,
   upperCross=Math.abs(upperD)>1e-9?-upper0/upperD:1,
   cutA=lowerCross>0&&lowerCross<1?lowerCross:1,cutB=upperCross>0&&upperCross<1?upperCross:1,
   first=Math.min(cutA,cutB),second=Math.max(cutA,cutB);
  // At most two endpoint crossings: scalar cuts avoid per-contact allocation.
  let from=0;
  for(let i=0;i<3;i++){
   const to=i===0?first:i===1?second:1;if(to<=from)continue;
   const mid=(from+to)*.5;
   let y0=0,dy=0;
   if(lower0+lowerD*mid<0){y0=lower0;dy=lowerD;}
   else if(upper0+upperD*mid>0){y0=upper0;dy=upperD;}
   const low=Math.max(from,zFrom),high=Math.min(to,zTo);if(low>high){from=to;continue;}
   const den=dx*dx+dy*dy,t=den?Math.max(low,Math.min(high,-(x0*dx+y0*dy)/den)):low;
   if((x0+dx*t)**2+(y0+dy*t)**2<=rr)return true;
   from=to;
  }
  return false;
 }
 function touchesVolumes(a,b,before,after,pad=0){
  for(let i=0;i<after.count;i++)
   if(movingCircleTouchesCapsule(a,b,before.capsules[i],after.capsules[i],pad))return true;
  return false;
 }
 function copyVolumes(from,to){
  to.count=from.count;
  for(let i=0;i<from.count;i++)Object.assign(to.capsules[i],from.capsules[i]);
  if(from.spatial){
   to.spatial ||= [];to.spatial.length=from.spatial.length;
   for(let i=0;i<from.spatial.length;i++){
    const v=from.spatial[i],p=to.spatial[i]||(to.spatial[i]={a:[],b:[]});p.id=v.id;p.r=v.r;
    for(let k=0;k<3;k++){p.a[k]=v.a[k];p.b[k]=v.b[k];}
   }
  }else to.spatial=undefined;
 }
 function validCircle(p){return p&&finite(p.x)&&finite(p.y)&&finite(p.r)&&p.r>=0;}
 function createDriver(options){
  const sequences=options.sequences;
  const sampleVolumes=options.samplePlayerVolumes||samplePlayerHurtVolumes;
  if(!Array.isArray(sequences)||!sequences.length)throw Error('Boss sequences need at least one recipe');
  for(const recipe of sequences)if(!recipe.id||!(recipe.duration>0)||typeof recipe.sample!=='function')
   throw Error('Invalid whole-turn recipe');
  const inputMode=options.inputMode==='lanes'?'lanes':'continuous',lanes=inputMode==='lanes';
  const input={left:false,right:false,pointer:null,duckQueued:false};
  const speed=options.lateralSpeed||2.25;
  const driver={
   sequences,inputMode,
   controlActive(actor){
    return !!(mode==='boss'&&actor===boss&&actor.phase==='dodge'&&(actor.state==='idle'||actor.state==='sequence')&&
      player.alive&&!paused&&!settingsOpen&&!knightRushSequence);
   },
   cancelInput(){input.left=input.right=input.duckQueued=false;input.pointer=null;},
   cancel(actor){
    driver.cancelInput();
    if(actor?._sequence){
     actor._sequence.frame.hazards.length=0;
     actor._lastSequence={id:actor._sequence.recipe.id,time:actor._sequence.time,
      stats:{...actor._sequence.stats},resolved:{...actor._sequence.resolved}};
     actor._sequence=null;
    }
    // Free steering keeps its fractional resting point. Lane mode preserves the
    // native integer destination so an in-flight lane change finishes normally.
    if(actor===boss)player.lane=lanes?Math.max(0,Math.min(2,Math.round(
     finite(player.lane)?player.lane:player.x))):player.x;
   },
   context(actor,state){
    const ctx=state.context;
    ctx.actor=actor;ctx.playerX=laneX(player.x,1);ctx.playerLane=player.x;
    ctx.playerY=PLAYER_Y;ctx.groundY=GROUND_Y;ctx.jumpHeight=jumpHeight();
    ctx.width=VW;ctx.height=VH;ctx.arenaLeft=laneX(0,1);ctx.arenaRight=laneX(2,1);
    ctx.resolved=state.resolved;
    return ctx;
   },
   sample(actor,time){
    const state=actor?._sequence;if(!state)return null;
    state.time=Math.max(0,Math.min(state.recipe.duration,time));
    state.recipe.sample(state.time,state.frame,driver.context(actor,state));
    if(!Array.isArray(state.frame.hazards))throw Error('Sequence sample must provide frame.hazards');
    // Optional native root choreography is authored alongside the support feet,
    // never inferred from a desired fist contact. A scoped cinematic projection
    // may retain an explicit logical root while its frame.actorRoot drives the
    // shared rendered-world/contact geometry. Older recipes keep their behavior.
    const actorRoot=state.frame.logicalActorRoot??state.frame.actorRoot;
    if(actorRoot!=null){
     if(!finite(actorRoot.x)||!finite(actorRoot.z))throw Error('Invalid sequence actorRoot: expected finite x and z');
     actor.x=actor.xTarget=actorRoot.x;actor.z=actorRoot.z;
    }else actor.x=actor.xTarget=1; // Existing recipes retain their stationary center.
    return state.frame;
   },
   startRecipe(actor,index=0,time=0,initial=null){
    if(!actor||actor!==boss)throw Error('Sequence must use the active native boss');
    driver.cancel(actor);
    const selected=((Math.floor(index)%sequences.length)+sequences.length)%sequences.length;
    const recipe=sequences[selected],context={
     startLane:initial?.startLane??player.x,startPlayerX:initial?.startPlayerX??laneX(player.x,1),
     startActorX:initial?.startActorX??actor.x,startActorZ:initial?.startActorZ??actor.z,
     project(lane,height,z){
     const p=proj(z);return {x:laneX(lane,p.t),y:p.y-height*p.s,s:p.s,depth:z};
    }};
    const state=actor._sequence={recipe,index:selected,time:0,frame:{hazards:[],props:[],cues:[],motion:null,actorRoot:null},
     context,records:new Map(),resolved:Object.create(null),tick:0,
     previousPlayer:createPlayerHurtVolumes(),currentPlayer:createPlayerHurtVolumes(),
     stats:{hits:0,parries:0,perfects:0,safe:0}};
    sampleVolumes(state.previousPlayer);
    actor.phase='dodge';actor.state='sequence';actor.stateT=Math.max(0,Math.min(recipe.duration,time));
    actor.x=actor.xTarget=1;actor.hazardLanes=[];actor.attacksLeft=0;
    // Compatibility metadata is inert: sequence objects, never fists, own damage.
    actor.attack={id:recipe.id,name:recipe.name,rec:0,sequence:true,steps:[{
     lanes:[],height:'all',tele:.001,travel:recipe.duration,anim:'sequence',strike:'sequence',
     stageReach:0,bodyLunge:0,x:1}]};
    actor.sequenceIndex=0;
    driver.sample(actor,actor.stateT);
    return state;
   },
   seek(actor,time){
    if(!actor?._sequence)return false;
    const {index,context}=actor._sequence;
    // Rebuilding contact records must not rebase choreography on its current
    // mid-step root or retarget a previously committed player snapshot.
    driver.startRecipe(actor,index,time,context);
    return true;
   },
   key(actor,direction,held,repeat=false){
    if(direction!=='left'&&direction!=='right')return false;
    if(!held){const was=input[direction];input[direction]=false;return !!was||driver.controlActive(actor);}
    if(!driver.controlActive(actor))return false;
    if(lanes){
     // The browser repeat bit also prevents a held key from becoming a fresh
     // step after pause/restart clears input ownership.
     if(!repeat&&!input[direction]){input[direction]=true;handleAction(direction);}
     return true;
    }
    if(!input[direction]){player.laneFrom=player.x;player.lastLaneChange=perfNow;}
    input[direction]=true;return true;
   },
   action(actor,action){
    if(!driver.controlActive(actor))return false;
    if(action==='left'||action==='right'){
     // Let playerAction own the native target, dodge timestamp and swipe sound.
     if(lanes)return false;
     player.laneFrom=player.x;player.lastLaneChange=perfNow;
     player.x=Math.max(0,Math.min(2,player.x+(action==='left'?-.25:.25)));
     player.lane=player.x;return true;
    }
    if(action==='down'&&player.jumpT>=0){
     // Buffer a late landing transition, never force the mounted jump down.
     input.duckQueued=jumpDur()-player.jumpT<=.22;return true;
    }
    return false;
   },
   updatePlayer(actor,dt){
    if(!driver.controlActive(actor))return false;
    if(!lanes){
     const dir=Number(input.right)-Number(input.left);
     if(dir)player.x=Math.max(0,Math.min(2,player.x+dir*speed*dt));
     else if(input.pointer?.moved){
      const delta=input.pointer.target-player.x;
      player.x+=Math.sign(delta)*Math.min(Math.abs(delta),speed*dt);
     }
     player.lane=player.x;
    }
    if(input.duckQueued&&(player.jumpT<0||player.jumpT+dt>=jumpDur())){
     input.duckQueued=false;player.jumpT=-1;player.duckT=0;player.lastDuck=perfNow;SFX.duck();
    }
    // False keeps native CFG.LANE_EASE interpolation (including midair motion).
    return !lanes;
   },
   pointerStart(actor,start,cx,cy){
    if(!driver.controlActive(actor)||start.done||!immediateParryTapEligible(toGame(cx,cy)))return false;
    const point=toGame(cx,cy);
    // Leave the native Special button and pause button to their ordinary owners.
    if(point.x>=KNIGHT_RUSH_BTN.x&&point.x<=KNIGHT_RUSH_BTN.x+KNIGHT_RUSH_BTN.w&&
       point.y>=KNIGHT_RUSH_BTN.y&&point.y<=KNIGHT_RUSH_BTN.y+KNIGHT_RUSH_BTN.h)return false;
    start.sequencePointer=true;
    input.pointer={startX:point.x,startY:point.y,gestureY:point.y,lane:player.x,target:player.x,moved:false};
    return true;
   },
   pointerMove(actor,start,cx,cy){
    if(!start?.sequencePointer||!input.pointer)return false;
    if(!driver.controlActive(actor))return true;
    const p=input.pointer,point=toGame(cx,cy),dx=point.x-p.startX,dy=point.y-p.startY;
    if(lanes){
     if(p.action)return true;
     const ax=Math.abs(dx),ay=Math.abs(dy);
     // A short horizontal flick is a full lane step, never a fractional drag.
     // Both axes retain the native threshold so early diagonal slop cannot
     // lock a vertical gesture into an unintended lateral action.
     if(!p.moved&&Math.max(ax,ay)>=8){
      p.moved=true;start.done=true;start.intentMoved=true;
      cancelPlayerParryHold(start);clearProvisionalDebugParryMark(start);clearTapIntent(start);
     }
     if(ax>=SWIPE_TH&&ax>=ay)p.action=dx<0?'left':'right';
     else if(ay>=SWIPE_TH&&ay>ax)p.action=dy<0?'up':'down';
     if(p.action)handleAction(p.action);
     return true;
    }
    if(!p.moved&&Math.max(Math.abs(dx),Math.abs(dy))>8){
     p.moved=true;start.done=true;start.intentMoved=true;
     cancelPlayerParryHold(start);clearProvisionalDebugParryMark(start);clearTapIntent(start);
     player.laneFrom=player.x;player.lastLaneChange=perfNow;
    }
    if(p.moved)p.target=Math.max(0,Math.min(2,p.lane+dx/(laneX(2,1)-laneX(1,1))));
    const vertical=point.y-p.gestureY;
    if(Math.abs(vertical)>=SWIPE_TH){
     p.gestureY=point.y;handleAction(vertical<0?'up':'down');
    }
    return true;
   },
   pointerEnd(actor,start,cx,cy){
    if(!start?.sequencePointer)return false;
    // Some touch devices deliver a short flick only at release.
    if(lanes&&finite(cx)&&finite(cy))driver.pointerMove(actor,start,cx,cy);
    const consumed=!!input.pointer?.moved||!driver.controlActive(actor);
    input.pointer=null;return consumed;
   },
   parry(actor){
    if(!driver.controlActive(actor))return false;
    const state=actor._sequence;if(!state)return true;
    const volumes=sampleVolumes(state.currentPlayer);
    let candidate=null,best=Infinity;
    for(const h of state.frame.hazards){
     if(!h.active||h.parryable!==true||state.resolved[h.id])continue;
     for(const p of h.primitives||[]){
      if(!validCircle(p))continue;
      const near=touchesVolumes(p,p,volumes,volumes,h.parryMargin||18);
      // The release must be before actual red contact, as in native model parry.
      if(near&&!touchesVolumes(p,p,volumes,volumes)){
       const distance=Math.abs(p.x-laneX(player.x,1))+Math.abs(p.y-(PLAYER_Y-60))*.2;
       if(distance<best){best=distance;candidate={h,p};}
      }
     }
    }
    if(candidate){
     state.resolved[candidate.h.id]='parry';state.stats.parries++;
     const record=state.records.get(candidate.h.id);if(record)record.done=true;
     doSequenceObjectParry(candidate.p.x,candidate.p.y);
    }
    return true;
   },
   resolve(actor,override=null){
    const state=actor._sequence;if(!state)return;
    const volumes=override||sampleVolumes(state.currentPlayer),tick=++state.tick;
    for(const h of state.frame.hazards){
     if(!h.id)throw Error('Every sequence hazard needs a stable ID');
     let record=state.records.get(h.id);
     if(!record){record={previous:[],active:false,done:false,near:false,tick};state.records.set(h.id,record);}
     record.tick=tick;
     if(state.resolved[h.id]){record.done=true;continue;}
     const primitives=h.primitives||[];
     if(h.active&&!record.done){
      let hit=false,near=false;
      if(options.contactTest){
       const result=options.contactTest(h,record.active?state.previousPlayer:volumes,volumes,record);
       hit=result.hit;near=result.near;
      }else for(let i=0;i<primitives.length;i++){
       const p=primitives[i];if(!validCircle(p))throw Error('Invalid sequence hazard circle: '+h.id);
       const old=record.active&&record.previous[i]||p;
       const before=record.active?state.previousPlayer:volumes;
       hit=hit||touchesVolumes(old,p,before,volumes);
       near=near||touchesVolumes(old,p,before,volumes,h.perfectMargin||12);
      }
      if(hit){
       record.done=true;state.resolved[h.id]='hit';state.stats.hits++;
       damagePlayer(h.hitText||activeBossDefinition().hitText);
       if(!player.alive||actor._sequence!==state||actor.phase!=='dodge'||actor.state!=='sequence')break;
      }else if(near){
       record.near=true;
       const last=Math.max(player.lastLaneChange,player.lastJump,player.lastDuck);
       if(perfNow-last<=perfectWin())record.perfect=true;
      }
     }
     if(!h.active&&record.active&&!record.done)driver.closeHazard(actor,h.id,record);
     if(actor._sequence!==state||actor.phase!=='dodge'||actor.state!=='sequence')break;
     record.active=!!h.active;record.previous.length=primitives.length;
     // Opt-in world shapes are immutable snapshots made by the sampler.
     record.spatial=h.spatial;
     for(let i=0;i<primitives.length;i++){
      const p=primitives[i];if(!validCircle(p))continue;
      const copy=record.previous[i]||(record.previous[i]={});copy.x=p.x;copy.y=p.y;copy.r=p.r;copy.z=p.z;copy.depthRadius=p.depthRadius;
     }
    }
    for(const [id,record] of state.records)if(actor._sequence===state&&actor.state==='sequence'&&
      record.tick!==tick&&record.active&&!record.done){
     driver.closeHazard(actor,id,record);record.active=false;
    }
    copyVolumes(volumes,state.previousPlayer);
   },
   closeHazard(actor,id,record){
    const state=actor._sequence;
    if(!state||record.done||actor.state!=='sequence'||actor.phase!=='dodge')return;
    record.done=true;
    if(record.near&&record.perfect){
     state.resolved[id]='perfect';state.stats.perfects++;
     floater(laneX(player.x,1),PLAYER_Y-jumpHeight()-96,'PERFECT!','#ffe37a',20);
     doPerfectDodge(BOSS_SOURCE);
    }else{state.resolved[id]='safe';state.stats.safe++;}
   },
   update(actor,dt){
    if(actor.phase!=='dodge'||['dying','finisher','break','breakRecover'].includes(actor.state)){
     if(actor._sequence)driver.cancel(actor);return false;
    }
    if(actor.state==='idle'){
     driver.startRecipe(actor,Math.max(0,(actor.enemyTurn||1)-1));
     floater(VW/2,230,actor._sequence.recipe.name||actor._sequence.recipe.id,'#d7b878',18);
     return true;
    }
    if(actor.state!=='sequence')return false;
    const state=actor._sequence;if(!state)return false;
    if(options.maxContactStep&&actor.stateT>state.time){
     const from=state.time,to=Math.min(actor.stateT,state.recipe.duration),substep=options.needsContactSubsteps?.(from,to)??true,
      count=substep?Math.max(1,Math.ceil((to-from)/options.maxContactStep)):1;
     state.sweepFrom ||= createPlayerHurtVolumes();state.sweepTo ||= createPlayerHurtVolumes();state.sweepAt ||= createPlayerHurtVolumes();
     copyVolumes(state.previousPlayer,state.sweepFrom);sampleVolumes(state.sweepTo);
     for(let i=1;i<=count;i++){
      const q=i/count;copyVolumes(state.sweepTo,state.sweepAt);
      for(let j=0;j<state.sweepAt.count;j++)for(const k of ['x1','x2','y1','y2','r'])
       state.sweepAt.capsules[j][k]=state.sweepFrom.capsules[j][k]+(state.sweepTo.capsules[j][k]-state.sweepFrom.capsules[j][k])*q;
      if(state.sweepAt.spatial)for(let j=0;j<state.sweepAt.spatial.length;j++){
       const a=state.sweepFrom.spatial[j],b=state.sweepTo.spatial[j],v=state.sweepAt.spatial[j];
       for(const end of ['a','b'])for(let k=0;k<3;k++)v[end][k]=a[end][k]+(b[end][k]-a[end][k])*q;
       v.r=a.r+(b.r-a.r)*q;
      }
      driver.sample(actor,from+(to-from)*q);driver.resolve(actor,state.sweepAt);
      if(actor._sequence!==state||!player.alive||actor.phase!=='dodge'||actor.state!=='sequence')return true;
     }
    }else{driver.sample(actor,actor.stateT);driver.resolve(actor);}
    if(actor._sequence!==state||!player.alive||actor.phase!=='dodge'||actor.state!=='sequence')return true;
    if(state.time>=state.recipe.duration){
     for(const [id,record] of state.records)driver.closeHazard(actor,id,record);
     if(actor._sequence!==state||!player.alive||actor.phase!=='dodge'||actor.state!=='sequence')return true;
     driver.cancel(actor);actor.state='idle';actor.stateT=0;actor.attacksLeft=0;
     beginPlayerTurn();
    }
    return true;
   },
   drawLayer(pass,actor){
    if(!actor?._sequence||actor.state!=='sequence'||actor.phase!=='dodge')return;
    const state=actor._sequence;
    if(options.drawLayer)options.drawLayer(pass,state.frame,actor);
   }
  };
  return Object.freeze(driver);
 }
 const api=Object.freeze({createDriver,movingCircleTouchesCapsule,touchesVolumes});
 root.KRBossSequenceRuntime=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
