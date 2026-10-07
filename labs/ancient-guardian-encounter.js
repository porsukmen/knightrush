/* Sword-road encounter and opt-in trial: authored guardian + mounted player.
 * Native contacts follow the visible blade, including duck clearance. */
(()=>{'use strict';
 // Scene-local stone/moss planes; the source sculpture and its Lab stay neutral.
 const materials=Object.freeze({'#999989':'#b0ad91','#747969':'#727e72','#858a76':'#89947b','#b1af99':'#d0c399',
  '#777e6b':'#7f8970','#5e6858':'#556b60','#717b65':'#71836d','#969c80':'#b1b087',
  '#8c917c':'#a1a486','#7b8470':'#829179','#828a75':'#8b987c','#87907a':'#96a17e','#a2a38c':'#c1b993',
  '#536445':'#4c633d','#63754c':'#617c40','#788453':'#879449','#89935e':'#a3ad57'});
 const native=window.KRGuardianAttackNative,editor=BOOT_QUERY.get('attackeditor')==='1';
 const blender=window.KRGuardianBlenderV9,spatial=!!(blender||native);
 const targeted=window.KRGuardianArcCombo||window.KRGuardianDiagonalCombo||window.KRGuardianJumpCombo||window.KRGuardianFlightCombo||window.KRGuardianTargetedCombo,lastTargetedFrame=new WeakMap();
 const M=KRAncientGuardianStance,renderer=M.create({centerSpike:editor||spatial,materialColor:BOOT_QUERY.get('guardianlight')==='neutral'?null:(col,part)=>part==='embedded-event-sword'?col:materials[col]||col}),ROOT_Z=6,UNIT=5,DEPTH=.065,HEADING=10;
 const facing=HEADING*Math.PI/180,cos=Math.cos(facing),sin=Math.sin(facing);
 const cut=native?8.85:KRGuardianAuthoredTurn.timing.cutStart,finish=native?9.30:KRGuardianAuthoredTurn.timing.finish;
 const sample=blender?.sample||native?.sample||KRAncientGuardianCombatPose.sample,rest={time:0,pose:sample(0),actorRoot:{x:1,z:ROOT_Z}},bladeCount=39;
 let preview=null;
 // A centered, fixed staging orientation puts the existing overhead arc into
 // screen-right lane 2. Rotate the entire rig, never detach/shift just its blade.
 let projectionHeading=NaN,projectionCos=1,projectionSin=0;const projectionScratch={};
 function project(frame,v,out=[]){const heading=frame.heading??HEADING;if(heading!==projectionHeading){projectionHeading=heading;projectionCos=Math.cos(heading*Math.PI/180);projectionSin=Math.sin(heading*Math.PI/180);}const x=v[0]*projectionCos+v[2]*projectionSin,z=frame.actorRoot.z+(-v[0]*projectionSin+v[2]*projectionCos)*DEPTH,p=proj(z,projectionScratch);out[0]=laneX(frame.actorRoot.x-x*UNIT/150,p.t);out[1]=p.y+v[1]*UNIT*p.s;out[2]=z;return out;}
 const recipe={id:blender?'guardian-blender-v9':targeted?'guardian-targeted-combo':'guardian-sword-combo',name:blender?'ANCIENT GUARDIAN':targeted?'ANTİK GARDİYAN · HEDEFLİ KOMBO':'ANTİK GARDİYAN · KILIÇ KOMBOSU',duration:blender?blender.duration:targeted?targeted.duration:native?native.effectGameTime(13.15):M.comboDuration,
  sample(t,out,ctx){const gameTime=t,effectTime=native?native.effectTime(t):t;t=native?native.authoredTime(t):t;out.time=gameTime;out.pose=preview?.pose||sample(gameTime,ctx);out.heading=preview?.heading??HEADING;out.actorRoot??={x:1,z:ROOT_Z};out.actorRoot.x=preview?.rootX??1;out.actorRoot.z=preview?.rootZ??ROOT_Z;
   out.props.length=out.cues.length=0;
   out.centerSpike=null;
   if(blender){
    out.sourceTime=out.pose.authoredTime;out.centerSpike=out.pose.spike||null;out.targeting=out.pose.targeting;
    for(let i=0;i<blender.windows.length;i++){
     const [a,b]=blender.windows[i],h=out.hazards[i]||(out.hazards[i]={id:'guardian-v9-'+i,primitives:[],parryable:false,hitText:'The guardian’s stone blade struck you.'});
     h.active=gameTime>=a&&gameTime<=b&&(i!==2||out.centerSpike?.height>.1);h.spatial=h.active?KRMountedCollision.blade(out,i===2?out.pose.centerSpike:out.pose.weapon,true):[];h.primitives.length=0;
    }
    out.hazards.length=blender.windows.length;
    if(ctx.actor)lastTargetedFrame.set(ctx.actor,{time:gameTime,pose:out.pose,heading:out.heading,actorRoot:{...out.actorRoot}});
    return out;
   }
   if(targeted){out.targeting=targeted.sample(gameTime,ctx);out.pose=out.targeting.pose;if(ctx.actor)lastTargetedFrame.set(ctx.actor,{time:gameTime,pose:out.pose,heading:out.heading,actorRoot:{...out.actorRoot}});}
   out.sourceTime=native?native.sourceTime(gameTime):t;
   if(native&&t>=11.49&&ctx.guardianTargetLane===undefined)ctx.guardianTargetLane=Math.max(0,Math.min(2,Math.round(ctx.playerLane)));
   const animationId=preview?.animationId||native?.animationId,authoredTime=preview?.authoredTime??effectTime,targetLane=native?(ctx.guardianTargetLane??1):1;
   if(!targeted?.flyingSword&&!preview?.flyingSword&&['guardian-center-spike-v19','guardian-center-smoke-v20'].includes(animationId)){
    // Authored continuation clock, deliberately independent of source pose time.
    const smokeVersion=animationId==='guardian-center-smoke-v20',start=smokeVersion?12.15:11.60,end=start+.34,u=Math.max(0,Math.min(1,(authoredTime-start)/.34)),sink=native||preview?.effectTime!==undefined?Math.max(0,Math.min(1,((preview?.effectTime??effectTime)-12.7)/.34)):0,height=(smokeVersion?22.14:11.07)*u*u*(3-2*u)*(1-sink*sink*(3-2*sink)),a=out.heading*Math.PI/180,c=Math.cos(a),s=Math.sin(a),x=(out.actorRoot.x-targetLane)*30,z=-out.actorRoot.z/DEPTH,cx=x*c-z*s,cz=x*s+z*c;
    const transform={p:v=>[cx+v[0],-height-v[1],cz-(v[2]+13.5)],n:v=>[v[0],-v[1],-v[2]]};
    out.pose={...out.pose,centerSpike:transform};
    const smokePhase=smokeVersion?Math.max(0,Math.min(1,(authoredTime-11.49)/1.12)):0;
    out.centerSpike={height,lane:targetLane,depth:0,tip:transform.p([0,0,-13.5]),base:[cx,0,cz],start,end,smoke:{phase:smokePhase,opacity:smokeVersion&&smokePhase>0&&smokePhase<1 ? .25*Math.sin(Math.PI*smokePhase)**2 : 0}};
   }
   for(let pass=0;pass<2;pass++){
    const h=out.hazards[pass]||(out.hazards[pass]={id:pass?'guardian-diagonal':'guardian-overhead',primitives:[],parryable:false,hitText:'The guardian’s stone blade struck you.'});
    const clock=out.sourceTime;
    h.active=(!native||t<=9.75)&&(pass?(native?t:clock)>=cut&&(native?t:clock)<=finish:clock>=M.markers.tension&&clock<=M.markers.cut+.22);
    if(native){h.spatial=h.active?KRMountedCollision.blade(out):[];if(!h.active){h.primitives.length=0;continue;}}
    if(pass&&!native){
     // Explicit lane area, not a blade collider. One contact covers both lanes;
     // moving left is the escape (duck is not immunity against this area).
     h.hitText='The guardian swept the middle and right lanes.';
     for(let i=0;i<10;i++)Object.assign(h.primitives[i]||(h.primitives[i]={}),{x:laneX(i<5?1:2,1),y:PLAYER_Y-170+(i%5)*40,z:0,r:48,depthRadius:2.2});
     h.primitives.length=10;continue;
    }
    for(let i=0;i<bladeCount;i++){
     // The actual blade extends from y=-44.28 to its point at y=0.
     // Closely spaced small spheres follow steel only, excluding hilt/guard.
     const y=-43+43*i/(bladeCount-1),v=out.pose.weapon.p([0,y,-13.5]),q=project(out,v),scale=proj(q[2]).s;
     const radius=(y> -6?Math.max(.35,3.12*(-y)/6):3.12)*UNIT*scale;
     Object.assign(h.primitives[i]||(h.primitives[i]={}),{x:q[0],y:q[1],z:q[2],r:radius,depthRadius:2.2});
    }
    h.primitives.length=bladeCount;
   }
   out.hazards.length=native?(targeted&&window.KRGuardianFinale?10:4):2;
   if(native){
    const stab=out.hazards[2]||(out.hazards[2]={id:'guardian-left-stab',primitives:[],parryable:false,hitText:'The guardian drove its blade into the ground.'});
    stab.active=t>=11.18&&t<=11.6;
    stab.spatial=stab.active?KRMountedCollision.blade(out,out.pose.weapon,true):[];
    for(let i=0;stab.active&&i<bladeCount;i++){
     const y=-43+43*i/(bladeCount-1),v=out.pose.weapon.p([0,y,-13.5]),q=project(out,v),scale=proj(q[2]).s;
     Object.assign(stab.primitives[i]||(stab.primitives[i]={}),{x:q[0],y:q[1],z:v[1]>0?100:q[2],r:Math.min(Math.max(.35,-y*.52),3.12,Math.max(0,-v[1]))*UNIT*scale,depthRadius:2.2});
    }
    stab.primitives.length=stab.active?bladeCount:0;
    const spike=out.centerSpike,h=out.hazards[3]||(out.hazards[3]={id:'guardian-aimed-spike',primitives:[],parryable:false,hitText:'The blade erupted beneath you.'});
    h.active=!!spike&&spike.height>.1&&effectTime<12.7;
    h.spatial=h.active?KRMountedCollision.blade(out,out.pose.centerSpike,true):[];
    for(let i=0;h.active&&i<24;i++){
     const height=(spike?.height||0)*i/23,p=ctx.project(targetLane,height*UNIT,0),tipDistance=(spike?.height||0)-height;
     Object.assign(h.primitives[i]||(h.primitives[i]={}),{x:p.x,y:p.y,z:0,r:Math.max(0,Math.min(2.6,tipDistance*.52))*UNIT*p.s,depthRadius:.4});
    }
    h.primitives.length=h.active?24:0;
   }
   if(targeted&&window.KRGuardianFinale){
    const f=out.targeting;
    for(let i=0;i<6;i++){
     const h=out.hazards[4+i]||(out.hazards[4+i]={id:i?'guardian-rapid-'+i:'guardian-low-reverse',primitives:[],parryable:false,hitText:i?'The guardian hammered your locked lane.':'The low stone blade swept your legs.'});
     h.active=!!f.active&&f.contact===i;h.spatial=h.active?KRMountedCollision.blade(out,out.pose.weapon,true):[];
     h.primitives.length=0;
    }
    out.hazards.length=10;
   }
   return out;
  }};
 function drawSmoke(frame,projectPoint=v=>project(frame,v)){
  const spike=frame.centerSpike,smoke=spike?.smoke;if(!smoke||smoke.opacity<.001)return;
  const b=spike.base,p=projectPoint(b),up=projectPoint([b[0],-1,b[2]]),unit=Math.hypot(up[0]-p[0],up[1]-p[1]),phase=smoke.phase;
  g.save();g.globalAlpha*=smoke.opacity;
  // Five bounded, camera-facing wisps. Authored samples only: no RNG, timers,
  // particle accumulation, or damage; the actual blade draws in front of these.
  for(let i=0;i<5;i++){const spread=(i-2)*(1.05+phase*1.8),lift=.8+phase*(3.5+(i%2)*2),radius=1.5+phase*2.0;
   g.fillStyle=i%2?'#a9a99b':'#777e77';g.beginPath();g.ellipse(p[0]+spread*unit,p[1]+(12-lift)*unit,radius*unit,(.8+phase*1.1)*unit,(i-2)*.15,0,Math.PI*2);g.fill();
  }g.restore();
 }
 function drawFrame(frame,side){g.save();renderer.draw(g,frame.heading??HEADING,1,{sword:true},1,frame.time,frame.pose,{project:v=>project(frame,v),projectInto:(v,out)=>project(frame,v,out),nativeProjection:spatial?{x:frame.actorRoot.x,z:frame.actorRoot.z,width:VW,focal:CFG.FOCAL,far:CFG.Z_FAR,horizon:HORIZON_Y,ground:GROUND_Y,curved:curvedWorldActive()}:null,clipGround:editor||spatial,depthSide:side,cacheKey:[frame.heading,frame.actorRoot.x,frame.actorRoot.z,VW,VH,proj(ROOT_Z).y,laneX(1,1)].join(':')});g.restore();}
 const coreDriver=KRBossSequenceRuntime.createDriver({sequences:[recipe],inputMode:'lanes',maxContactStep:1/240,
  // Outside these conservative active envelopes there is no collidable steel.
  // Render the current exact pose once; preserve 240-Hz contact sampling when
  // an update crosses any envelope (including both boundaries).
  needsContactSubsteps:blender?blender.needsContact:native?(from,to)=>{if(targeted&&(window.KRGuardianFlightCombo||window.KRGuardianFinale)?.needsContact(from,to))return true;const effectFrom=native.effectTime(from),effectTo=native.effectTime(to);from=native.authoredTime(from);to=native.authoredTime(to);return [[4.6,5.6],[8.85,9.3],[11.18,11.6]].some(([a,b])=>from<=b&&to>=a)||(effectFrom<=12.7&&effectTo>=12.15);}:undefined,
  samplePlayerVolumes:spatial?out=>KRMountedCombat.sampleHurtVolumes(out):undefined,
  contactTest:spatial?(h,before,after,record)=>{
   const previous=record.active?record.spatial||h.spatial:h.spatial,C=KRMountedCollision;
   const hit=C.sweptTest(previous,h.spatial,before.spatial,after.spatial);
   return {hit,near:hit||C.sweptTest(previous,h.spatial,before.spatial,after.spatial,h.perfectMargin||12)};
  }:undefined,
  drawLayer(pass,frame){if(pass==='front')drawFrame(frame,-1);if(pass==='front'&&BOOT_QUERY.get('guardianlab')==='1'){
   if(BOOT_QUERY.get('hitboxes')==='1'){g.save();g.strokeStyle='#edb66b';g.lineWidth=1;for(const h of frame.hazards)if(h.active)for(const p of h.primitives)if(Math.abs(p.z)<=p.depthRadius){g.beginPath();g.arc(p.x,p.y,p.r,0,Math.PI*2);g.stroke();}g.restore();}
  }}});
 // First encounter entry still includes the sword pickup. Subsequent native
 // enemy turns begin at the exact shoulder rest retained during the player turn.
 // Reuse the native startRecipe path so contacts, targets and stats reset normally.
 const driver=blender?Object.freeze({...coreDriver,update(actor,dt){
  if(actor===boss&&actor.phase==='dodge'&&actor.state==='idle'&&(actor.enemyTurn||1)>1){
   coreDriver.startRecipe(actor,0,blender.gameTime(2.24));
   floater(VW/2,230,recipe.name,'#d7b878',18);return true;
  }
  return coreDriver.update(actor,dt);
 }}):coreDriver;
 function currentFrame(){if(boss?._sequence)return boss._sequence.frame;if((blender||targeted)&&boss&&lastTargetedFrame.has(boss))return lastTargetedFrame.get(boss);rest.time=boss?._lastSequence?recipe.duration:0;rest.pose=sample(rest.time);rest.actorRoot.x=1;return rest;}
 function drawSwipeLanes(frame){
  if(editor||spatial)return;
  const clock=native?frame.time:(frame.sourceTime??frame.time);
  if(!boss?._sequence||clock<cut-.8||clock>finish||(native&&frame.time>9.75))return;
  const active=clock>=cut;g.save();g.fillStyle=active?'rgba(220,155,75,.28)':'rgba(191,129,55,.13)';g.strokeStyle=active?'#edc283':'#bd945f';g.lineWidth=active?2:1;
  for(const lane of [1,2]){g.beginPath();for(const [i,[offset,z]] of [[-.32,4],[.32,4],[.32,-.7],[-.32,-.7]].entries()){const p=proj(z),x=laneX(lane+offset,p.t);i?g.lineTo(x,p.y):g.moveTo(x,p.y);}g.closePath();g.fill();g.stroke();}g.restore();
 }
 function draw(x,y,scale,anim,t){const frame=currentFrame(),p=proj(ROOT_Z);g.save();g.globalAlpha=anim==='dying'?Math.max(0,1-t):1;
  drawSwipeLanes(frame);
  const feet=frame.pose.legs.map(l=>l.foot.p([l.side*6.5,0,-1.5])),shadowCenter=feet.reduce((a,v)=>a.map((x,i)=>x+v[i]/feet.length),[0,0,0]),shadow=project(frame,[shadowCenter[0],0,shadowCenter[2]]),shadowScale=proj(shadow[2]).s;
  g.fillStyle='rgba(18,27,19,.14)';g.beginPath();g.ellipse(shadow[0],shadow[1],UNIT*23*shadowScale,8*shadowScale,0,0,Math.PI*2);g.fill();
  for(const leg of frame.pose.legs){const foot=leg.foot.p([leg.side*6.5,0,-1.5]),q=project(frame,[foot[0],0,foot[2]]),s=proj(q[2]).s;g.fillStyle=`rgba(29,34,20,${.3/(1+leg.footLift*.2)})`;g.beginPath();g.ellipse(q[0],q[1],4*UNIT*s,1.5*UNIT*s,0,0,Math.PI*2);g.fill();}
  drawSmoke(frame);drawFrame(frame,1);
  if(!boss?._sequence)drawFrame(frame,-1);g.restore();}
 ENCOUNTERS.register(new EncounterDefinition('ancientguardian','boss',{name:'ANCIENT GUARDIAN',hitText:'The stone blade struck you.',finisherHit:'The guardian passed judgment',arenaLine:'THE STONE GUARDIAN AWAKENS',draw,attacks:[],scale:3,sequenceDriver:driver,finisherReach:12,element:'earth',rises:false,labOnly:true}));
 function startRoad(context){
  // The road session owns progression, player health and rewards. Do not call
  // the trial reset path or enable debug/immortality for a normal encounter.
  startBoss('ancientguardian',context);
  boss.hp=boss.maxhp=Math.round(55+progressionTier()*8);boss.postureMax=30;
  boss.guaranteeQueue=[];boss.x=boss.xTarget=1;boss.z=ROOT_Z;
  boss.enemyTurnBudget=boss.attacksLeft=1;
  driver.startRecipe(boss,0);KROathkeeperArena.sync();return boss;
 }
 function start(){const visuals=window.KREventVisuals;return boss?.definitionId==='ancientguardian'&&visuals?.retainForReplay?visuals.retainForReplay('ancient-guardian-courtyard',resetEncounter):resetEncounter();}
 function resetEncounter(){driver.cancel(boss);debugRun=true;resetRun();loop=debugLoop;godMode=BOOT_QUERY.get('guardianlab')==='1'&&BOOT_QUERY.get('guardianinvincible')==='1';playerChar=CHARS[charSel]||CHARS[0];startBoss('ancientguardian');
  boss.x=boss.xTarget=1;boss.z=ROOT_Z;boss.entering=false;boss.rise=1;boss.state='idle';boss.stateT=0;boss.enemyTurnBudget=boss.attacksLeft=1;boss.enemyTurn=1;boss.hp=boss.maxhp=80;
  hazards=[];paused=false;pausePhotoMode=false;flashA=0;shakeMag=0;setMode('boss');driver.startRecipe(boss,0);KROathkeeperArena.sync();return state();}
 function state(){return{definition:boss?.definitionId,phase:boss?.phase,time:boss?._sequence?.time??boss?._lastSequence?.time??0,health:player.currentHealthUnits,stats:boss?._sequence?.stats||boss?._lastSequence?.stats,cut,finish};}
 function handleLabKey(e){if(BOOT_QUERY.get('guardianlab')!=='1'||boss?.definitionId!=='ancientguardian'||settingsOpen||e.ctrlKey||e.altKey||e.metaKey||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName||''))return false;if(e.key.toLowerCase()!=='r')return false;if(!e.repeat)start();return true;}
 function drawLabHint(ctx){if(BOOT_QUERY.get('guardianlab')!=='1'||mode!=='boss'||paused||settingsOpen)return;const palette=KRUI.theme(currentUITheme());KRUI.text(ctx,'← / → DODGE · ↑ JUMP · ↓ DUCK · R REPLAY',VW/2,VH-uiTop-64,11,palette.onDark,450);}
 function setPreview(config){if(BOOT_QUERY.get('attackeditor')!=='1')throw Error('Authoring preview is opt-in only');preview=config;driver.sample(boss,Math.max(0,Math.min(M.comboDuration,config?.time||0)));return boss._sequence.frame;}
 window.KRAncientGuardianEncounter=Object.freeze({start,startRoad,restart:start,state,sequenceDriver:driver,recipe,project,renderer,drawSmoke,handleLabKey,drawLabHint,setPreview});
})();
