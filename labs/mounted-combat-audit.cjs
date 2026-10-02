const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage({viewport:{width:1100,height:920}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/KnightRush.html');await page.waitForFunction(()=>window.KRMountedRunner?.ready,null,{timeout:90000});
 const report=await page.evaluate(()=>{
  SFX.setTestMuted(true);uiConfirm();openSkillLab();startSkillLabCombat();paused=true;pausePhotoMode=true;flashA=0;shakeMag=0;
  const check=(condition,message)=>{if(!condition)throw Error(message);},unit=KRMountedRunner.unit,rows=[];
  const fresh=()=>{boss.phase='player';boss.state='idle';boss.ap=9;boss.resolve=99;boss.partyActor='knight';boss.turnAction=null;boss.hp=boss.maxhp=100000;boss.posture=0;boss.postureMax=100000;boss.playerPhaseSerial++;boss.classSkillUseSerial=Object.create(null);boss.skillUseSerial=Object.create(null);player.jumpT=player.duckT=player.swordPreviewT=-1;player.parryShield=null;player.swordCombo=null;player.attackAnim=player.counterAnim=0;};
  const finite=f=>{for(const a of [...f.pose.legs,...f.pose.riderLegs,...f.pose.armChains])for(const v of [a.root,a.joint,a.end])check(v.every(Number.isFinite),'nonfinite bones');};
  for(const lane of [0,1,2])for(const bossLane of [0,1,2]){
   fresh();player.x=player.lane=lane;boss.x=bossLane;
   check(performPlayerAction(fightCommand('knight')),'normal bow command');
   const a=boss.turnAction,T=a.bowTimeline,snapshot=JSON.stringify({a,x:player.x,lane:player.lane,hp:boss.hp}),legacy=(()=>{const p=proj(boss.z);return Math.hypot(laneX(boss.x,p.t)-laneX(player.x,1),p.y-66*p.s-(PLAYER_Y-88));})();
   check(Math.abs(bowTurnActionGeometry().distance-legacy)<1e-8,'flight timing distance changed');
   KRMountedCombat.frame();check(snapshot===JSON.stringify({a,x:player.x,lane:player.lane,hp:boss.hp}),'render mutated combat');
   let previous=null,maxHandStep=0;
   for(let t=0;t<=T.recoveryEnd;t+=1/120){a.t=t;const f=KRMountedCombat.frame(),angle=KRMountedRunner.laneAngle(player.x,KRMountedRunner.laneMotion.heading);finite(f);check(f.state.angle===angle&&Math.abs(f.pose.native.degrees-Math.min(angle,360-angle))<1e-8&&!f.pose.actionBody?.yaw,'bow added target-facing rotation to the lane angle');const arm=f.pose.armChains.find(q=>q.side===1),q=f.pose.project(arm.end),hand=[f.placement.x+q[0]*unit,f.placement.y+q[1]*unit];
    if(previous)maxHandStep=Math.max(maxHandStep,Math.hypot(hand[0]-previous[0],hand[1]-previous[1]));previous=hand;
   }
   a.t=T.releases[0]-1e-7;let f=KRMountedCombat.frame(),q=f.pose.bow;
   const n=f.pose.project(q.arrowNock),tip=f.pose.project(KRMountedRig.add(q.arrowNock,KRMountedRig.mul(q.arrowDirection,11.7))),target=bowTurnActionGeometry().to,
    nx=f.placement.x+n[0]*unit,ny=f.placement.y+n[1]*unit,dx=tip[0]-n[0],dy=tip[1]-n[1],error=Math.abs(dx*(target.y-ny)-dy*(target.x-nx))/Math.hypot(dx,dy);
   check(error<.001,'lane ray misses boss');check(maxHandStep<10,'bow pickup discontinuity');check(q.reachError<1e-7,'bow hand cannot reach');
   if(lane===1&&bossLane===1){check(f.state.bowAim===0,'centre must aim straight ahead');check(Math.abs(q.arrowDirection[0])<1e-9,'centre arrow turned sideways');check(Math.abs(bowTurnActionGeometry().from.x-target.x)<1e-9,'centre flight must stay parallel to road');}
   a.t=T.releases[0];f=KRMountedCombat.frame();check(f.pose.bow.released&&f.pose.bow.externalProjectiles,'duplicate projectile ownership');
   a.t=T.recoveryEnd;f=KRMountedCombat.frame();check(!f.pose.bow,'bow recovery exact rest');
   rows.push({kind:'bow',lane,bossLane,error,maxHandStep,release:T.releases[0],contact:T.contacts[0]});
  }
  for(const lane of [0,1,2])for(const bossLane of [0,1,2])for(const hits of [1,4]){
   fresh();player.x=player.lane=lane;boss.x=bossLane;
   check(performPlayerAction({...compileClassSkillRoute('shield_bash_reinforced'),hits}),'real shield command');
   const a=boss.turnAction,T=a.shieldTimeline;check(T,'shield gameplay timeline');
   let maxStep=0,previous=null,maxBoneError=0;
   for(let t=0;t<=T.recoveryEnd;t+=1/120){a.t=t;const f=KRMountedCombat.frame();finite(f);
    for(const l of f.pose.legs){const sub=KRMountedRig.sub,length=v=>Math.hypot(...v),s=f.pose.horseScale;
     if(l.front&&l.elbow)maxBoneError=Math.max(maxBoneError,Math.abs(length(sub(l.elbow,l.root))-4*s),Math.abs(length(sub(l.joint,l.elbow))-6*s),Math.abs(length(sub(l.end,l.joint))-10*s));
     else if(!l.front)maxBoneError=Math.max(maxBoneError,Math.abs(length(sub(l.joint,l.root))-6.3*s),Math.abs(length(sub(l.hock,l.joint))-6.3*s),Math.abs(length(sub(l.end,l.hock))-8.2*s));
    }
    if(previous)maxStep=Math.max(maxStep,Math.hypot(f.placement.x-previous.x,f.placement.y-previous.y));previous=f.placement;
   }
   let contactError=0;
   for(const t of T.contacts){a.t=t;const f=KRMountedCombat.frame(),faces=KRMountedShield.faces(f.pose),points=faces.filter(q=>!['#a67543','#aa7a4b','#87603b','#493522','#6b482e'].includes(q.col)).flatMap(q=>q.v),centre=[0,1,2].map(i=>(Math.min(...points.map(v=>v[i]))+Math.max(...points.map(v=>v[i])))/2),q=f.pose.project(centre),p=proj(boss.z);
    contactError=Math.max(contactError,Math.hypot(f.placement.x+q[0]*unit-laneX(boss.x,p.t),f.placement.y+q[1]*unit-(p.y-22*p.s)));
   }
   a.t=T.recoveryEnd;const end=KRMountedCombat.frame();check(Math.hypot(end.placement.x-laneX(lane,1),end.placement.y-PLAYER_Y)<1e-8,'shield lane return');check(!end.pose.shield,'shield restored');
   check(contactError<1e-6,'shield misses boss');check(maxStep<20,'shield travel discontinuity');check(maxBoneError<.005,'horse bone drift');
   check(player.x===lane&&player.lane===lane,'shield changed logical lane');rows.push({kind:'bash',lane,bossLane,hits,contactError,maxStep,maxBoneError});
  }
  fresh();boss.phase='dodge';paused=false;check(beginPlayerParryHold(),'parry hold begins');paused=true;updatePlayerParryShield(.42);let f=KRMountedCombat.frame();check(f.state.action==='parry'&&f.state.actionTime>0,'parry prepare');
  updatePlayerParryShield(.5);f=KRMountedCombat.frame();check(f.state.actionTime===1.24,'held guard');
  player.parryShield.phase='release';player.parryShield.releaseFrom=1;player.parryShield.t=PARRY_SHIELD_CLIP.contact;f=KRMountedCombat.frame();check(f.state.actionTime===1.7,'parry contact');
  updatePlayerParryShield(2);check(KRMountedCombat.frame().state.action==='none','parry returns');
  player.swordPreviewT=BACK_SWORD_TIMING.contact;check(KRMountedCombat.frame().state.actionTime===KRMountedSword.timing.contact,'sword contact mapping');
  // Actual resolver still owns when damage lands, independently of draws.
  for(const kind of ['bow','bash']){fresh();player.x=player.lane=1;boss.x=1;const command=kind==='bow'?fightCommand('knight'):compileClassSkillRoute('shield_bash_reinforced');check(performPlayerAction(command),'resolver command');
   const a=boss.turnAction,contact=a.bowTimeline?.contacts[0]??a.impactDelay,hp=boss.hp;updateTurnAction(contact-.001);check(boss.hp===hp,'early damage');KRMountedCombat.frame();updateTurnAction(.002);check(boss.hp<hp,'contact damage');rows.push({kind:kind+'-damage',contact,damage:hp-boss.hp});}
  return {rows};
 });
 report.errors=errors;console.log(JSON.stringify(report,null,2));fs.writeFileSync('output/mounted-v96-combat-audit.json',JSON.stringify(report,null,2));assert.deepEqual(errors,[]);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
