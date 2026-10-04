/* Opt-in native game trial: approved guardian sampler + actual mounted player.
 * Overhead uses blade contact; the second swipe is an explicit two-lane area. */
(()=>{'use strict';
 // Scene-local stone/moss planes; the source sculpture and its Lab stay neutral.
 const materials=Object.freeze({'#999989':'#b0ad91','#747969':'#727e72','#858a76':'#89947b','#b1af99':'#d0c399',
  '#777e6b':'#7f8970','#5e6858':'#556b60','#717b65':'#71836d','#969c80':'#b1b087',
  '#8c917c':'#a1a486','#7b8470':'#829179','#828a75':'#8b987c','#87907a':'#96a17e','#a2a38c':'#c1b993',
  '#536445':'#4c633d','#63754c':'#617c40','#788453':'#879449','#89935e':'#a3ad57'});
 const M=KRAncientGuardianStance,renderer=M.create({materialColor:BOOT_QUERY.get('guardianlight')==='neutral'?null:(col,part)=>part==='embedded-event-sword'?col:materials[col]||col}),ROOT_Z=6,UNIT=5,DEPTH=.065,HEADING=10;
 const facing=HEADING*Math.PI/180,cos=Math.cos(facing),sin=Math.sin(facing);
 const cut=KRGuardianAuthoredTurn.timing.cutStart,finish=KRGuardianAuthoredTurn.timing.finish;
 const sample=KRAncientGuardianCombatPose.sample,rest={time:0,pose:sample(0),actorRoot:{x:1,z:ROOT_Z}},bladeCount=39;
 let preview=null;
 // A centered, fixed staging orientation puts the existing overhead arc into
 // screen-right lane 2. Rotate the entire rig, never detach/shift just its blade.
 function project(frame,v){const a=(frame.heading??HEADING)*Math.PI/180,c=Math.cos(a),s=Math.sin(a),x=v[0]*c+v[2]*s,z=frame.actorRoot.z+(-v[0]*s+v[2]*c)*DEPTH,p=proj(z);return [laneX(frame.actorRoot.x-x*UNIT/150,p.t),p.y+v[1]*UNIT*p.s,z];}
 const recipe={id:'guardian-sword-combo',name:'ANTİK GARDİYAN · ÜSTTEN + ÇAPRAZ',duration:M.comboDuration,
  sample(t,out,ctx){out.time=t;out.pose=preview?.pose||sample(t);out.heading=preview?.heading??HEADING;out.actorRoot??={x:1,z:ROOT_Z};out.actorRoot.x=preview?.rootX??1;out.actorRoot.z=preview?.rootZ??ROOT_Z;
   out.props.length=out.cues.length=0;
   for(let pass=0;pass<2;pass++){
    const h=out.hazards[pass]||(out.hazards[pass]={id:pass?'guardian-diagonal':'guardian-overhead',primitives:[],parryable:false,hitText:'The guardian’s stone blade struck you.'});
    h.active=pass?t>=cut&&t<=finish:t>=M.markers.tension&&t<=M.markers.cut+.22;
    if(pass){
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
   }
   out.hazards.length=2;return out;
  }};
 function drawFrame(frame,side){g.save();renderer.draw(g,frame.heading??HEADING,1,{sword:true},1,frame.time,frame.pose,{project:v=>project(frame,v),depthSide:side,cacheKey:[frame.heading,frame.actorRoot.x,frame.actorRoot.z,VW,VH,proj(ROOT_Z).y,laneX(1,1)].join(':')});g.restore();}
 const driver=KRBossSequenceRuntime.createDriver({sequences:[recipe],inputMode:'lanes',maxContactStep:1/240,
  drawLayer(pass,frame){if(pass==='front')drawFrame(frame,-1);if(pass==='front'&&BOOT_QUERY.get('guardianlab')==='1'){
   if(BOOT_QUERY.get('hitboxes')==='1'){g.save();g.strokeStyle='#edb66b';g.lineWidth=1;for(const h of frame.hazards)if(h.active)for(const p of h.primitives)if(Math.abs(p.z)<=p.depthRadius){g.beginPath();g.arc(p.x,p.y,p.r,0,Math.PI*2);g.stroke();}g.restore();}
  }}});
 function currentFrame(){if(boss?._sequence)return boss._sequence.frame;rest.time=boss?._lastSequence?M.comboDuration:0;rest.pose=sample(rest.time);rest.actorRoot.x=1;return rest;}
 function drawSwipeLanes(frame){
  if(BOOT_QUERY.get('attackeditor')==='1')return;
  if(!boss?._sequence||frame.time<cut-.8||frame.time>finish)return;
  const active=frame.time>=cut;g.save();g.fillStyle=active?'rgba(220,155,75,.28)':'rgba(191,129,55,.13)';g.strokeStyle=active?'#edc283':'#bd945f';g.lineWidth=active?2:1;
  for(const lane of [1,2]){g.beginPath();for(const [i,[offset,z]] of [[-.32,4],[.32,4],[.32,-.7],[-.32,-.7]].entries()){const p=proj(z),x=laneX(lane+offset,p.t);i?g.lineTo(x,p.y):g.moveTo(x,p.y);}g.closePath();g.fill();g.stroke();}g.restore();
 }
 function draw(x,y,scale,anim,t){const frame=currentFrame(),p=proj(ROOT_Z);g.save();g.globalAlpha=anim==='dying'?Math.max(0,1-t):1;
  drawSwipeLanes(frame);
  g.fillStyle='rgba(18,27,19,.14)';g.beginPath();g.ellipse(laneX(frame.actorRoot.x,p.t),p.y,UNIT*23*p.s,8*p.s,0,0,Math.PI*2);g.fill();
  for(const leg of frame.pose.legs){const foot=leg.foot.p([leg.side*6.5,0,-1.5]),q=project(frame,[foot[0],0,foot[2]]),s=proj(q[2]).s;g.fillStyle=`rgba(29,34,20,${.3/(1+leg.footLift*.2)})`;g.beginPath();g.ellipse(q[0],q[1],4*UNIT*s,1.5*UNIT*s,0,0,Math.PI*2);g.fill();}
  drawFrame(frame,1);
  if(!boss?._sequence)drawFrame(frame,-1);g.restore();}
 ENCOUNTERS.register(new EncounterDefinition('ancientguardian','boss',{name:'ANCIENT GUARDIAN',hitText:'The stone blade struck you.',finisherHit:'The guardian passed judgment',arenaLine:'THE STONE GUARDIAN AWAKENS',draw,attacks:[],scale:3,sequenceDriver:driver,finisherReach:12,element:'earth',rises:false,labOnly:true}));
 function start(){driver.cancel(boss);debugRun=true;resetRun();loop=debugLoop;godMode=false;playerChar=CHARS[charSel]||CHARS[0];startBoss('ancientguardian');
  boss.x=boss.xTarget=1;boss.z=ROOT_Z;boss.entering=false;boss.rise=1;boss.state='idle';boss.stateT=0;boss.enemyTurnBudget=boss.attacksLeft=1;boss.enemyTurn=1;boss.hp=boss.maxhp=80;
  hazards=[];paused=false;pausePhotoMode=false;flashA=0;shakeMag=0;setMode('boss');driver.startRecipe(boss,0);KROathkeeperArena.sync();return state();}
 function state(){return{definition:boss?.definitionId,phase:boss?.phase,time:boss?._sequence?.time??boss?._lastSequence?.time??0,health:player.currentHealthUnits,stats:boss?._sequence?.stats||boss?._lastSequence?.stats,cut,finish};}
 function handleLabKey(e){if(BOOT_QUERY.get('guardianlab')!=='1'||boss?.definitionId!=='ancientguardian'||settingsOpen||e.ctrlKey||e.altKey||e.metaKey||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName||''))return false;if(e.key.toLowerCase()!=='r')return false;if(!e.repeat)start();return true;}
 function drawLabHint(ctx){if(BOOT_QUERY.get('guardianlab')!=='1'||mode!=='boss'||paused||settingsOpen)return;const palette=KRUI.theme(currentUITheme());KRUI.text(ctx,'← / → DODGE · ↑ JUMP · ↓ DUCK · R REPLAY',VW/2,VH-uiTop-64,11,palette.onDark,450);}
 function setPreview(config){if(BOOT_QUERY.get('attackeditor')!=='1')throw Error('Authoring preview is opt-in only');preview=config;driver.sample(boss,Math.max(0,Math.min(M.comboDuration,config?.time||0)));return boss._sequence.frame;}
 window.KRAncientGuardianEncounter=Object.freeze({start,restart:start,state,sequenceDriver:driver,recipe,project,renderer,handleLabKey,drawLabHint,setPreview});
})();
