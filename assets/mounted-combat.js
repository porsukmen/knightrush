/* Production adapter: shared mounted clips, existing combat clocks/damage.
 * No Lab controls, alternate actors, RNG or gameplay state writes. */
(()=>{'use strict';
 const U=KRMountedRunner.unit,visible={knight:true,horse:true,shield:true,sword:true,bow:true,quiver:true},
  clamp=t=>Math.max(0,Math.min(1,t)),smooth=t=>{t=clamp(t);return t*t*(3-2*t);},
  mix=(a,b,t)=>a+(b-a)*t,
  map=(t,knots)=>{for(let i=1;i<knots.length;i++)if(t<=knots[i][0])return mix(knots[i-1][1],knots[i][1],clamp((t-knots[i-1][0])/Math.max(.00001,knots[i][0]-knots[i-1][0])));return knots.at(-1)[1];},
  base=()=>({angle:KRMountedRunner.laneAngle(player.x,KRMountedRunner.laneMotion?.heading||0),time:0,motion:'idle',action:'none',zoom:1,visible,externalProjectiles:true,worldViewport:true,
   lighting:window.KROathkeeperArena?.knightLighting()||undefined}),
  active=()=>['boss','bossintro','miniboss'].includes(mode)&&player.alive&&!player.mountedDeath&&playerChar.rigId==='ser_jonathan',
  target=height=>{const p=proj(boss.z);return {x:laneX(boss.x,p.t),y:p.y-height*p.s};};
 let aimKey='',aimCache=null,shieldContact=null,shieldAngle=NaN;
 function shieldContactOffset(){
  const state=base();if(shieldContact&&shieldAngle===state.angle)return shieldContact;
  shieldAngle=state.angle;
  const p=KRMountedReview.pose({...state,action:'bash',actionTime:KRMountedShield.timing.bash.contact}),
   points=KRMountedShield.faces(p).filter(f=>!['#a67543','#aa7a4b','#87603b','#493522','#6b482e'].includes(f.col)).flatMap(f=>f.v),
   centre=[0,1,2].map(i=>(Math.min(...points.map(v=>v[i]))+Math.max(...points.map(v=>v[i])))/2);
  return shieldContact=p.project(centre);
 }
 function aim(){
  const to=target(66),x=laneX(player.x,1),y=PLAYER_Y,key=[x,y,to.x,to.y,base().angle].join('|');
  if(key===aimKey)return aimCache;
  // Solve the actual projected shaft ray, including the right-eye anchor.
  // Only arm goals and bow direction aim. Horse, torso and helmet retain the
  // same lane-facing angle used during running, independent of the target.
  const sample=(angle,basis=false)=>{const state={...base(),bowAim:angle-180,action:'bow',actionTime:3.25-1e-7},p=KRMountedReview.pose(state),q=p.bow,
   n=p.project(q.arrowNock),tip=p.project(KRMountedRig.add(q.arrowNock,KRMountedRig.mul(q.arrowDirection,11.7))),
   dx=tip[0]-n[0],dy=tip[1]-n[1],from={x:x+(n[0]+dx*13.1/30.1)*U,y:y+(n[1]+dy*13.1/30.1)*U};
   const result={angle,from,to,error:dx*(to.y-from.y)-dy*(to.x-from.x),scale:Math.hypot(dx,dy)*U/30.1};
   if(basis){const o=p.project([0,0,0]),a=p.project([1,0,0]),b=p.project([0,0,1]);result.basis=[a[0]-o[0],a[1]-o[1],b[0]-o[0],b[1]-o[1]];result.nock={x:x+n[0]*U,y:y+n[1]*U};}return result;};
  // At centre, shoot parallel to the road from the right-eye anchor. Do not
  // introduce a tiny sideways correction merely to hit the boss's centre pixel.
  if(Math.abs(player.x-1)<1e-7&&Math.abs(boss.x-1)<1e-7&&Math.abs(base().angle-180)<1e-7){const a=sample(180);a.to={x:a.from.x,y:to.y};a.error=0;aimKey=key;return aimCache=a;}
  // The bow rotates in the horizontal plane around the unchanged eye anchor.
  // Invert that two-axis projection once instead of sampling 26 complete rigs
  // whenever the lane position changes. Keep the numerical solver as a guard
  // if a later pose introduces a non-linear projection or a moving anchor.
  const front=sample(180,true),[ax,ay,bx,by]=front.basis,det=ax*by-ay*bx,
   dx=(to.x-front.nock.x)/U,dy=(to.y-front.nock.y)/U,
   yaw=Math.atan2((dx*by-dy*bx)/det,(ax*dy-ay*dx)/det)*180/Math.PI;
  if(Number.isFinite(yaw)&&Math.abs(yaw)<=30){const a=sample(180+yaw);if(Math.abs(a.error)<1e-6){aimKey=key;return aimCache=a;}}
  let lo=150,hi=210,a=sample(lo);
  for(let i=0;i<24;i++){const mid=(lo+hi)/2,b=sample(mid);if(a.error*b.error<=0)hi=mid;else{lo=mid;a=b;}}
  aimKey=key;return aimCache=sample((lo+hi)/2);
 }
 function bowTime(action){
  const T=action.bowTimeline,t=action.t,releases=[...new Set(T.releases)],first=releases[0],last=releases.at(-1);
  if(t<first)return map(t,[[0,0],[first*2.1/3.25,2.1],[first*2.75/3.25,2.75],[first,3.25]]);
  // Volley variants keep the bow out: nock/draw each subsequent shot without
  // replaying a full back-equipment transfer between tightly spaced arrows.
  for(let i=1;i<releases.length;i++)if(t<releases[i]){const a=releases[i-1],b=releases[i],span=b-a;
   return map(t,[[a,3.25],[a+span*.22,3.43],[a+span*.30,2.1],[b,3.25]]);}
  const follow=Math.min(T.recoveryEnd-.001,T.contacts.at(-1)+T.recipe.releaseTime);
  return map(t,[[last,3.25],[follow,3.85],[T.recoveryEnd,5.8]]);
 }
 function parryTime(clip){
  const T=PARRY_SHIELD_CLIP;
  if(clip.phase==='prepare'||clip.phase==='hold')return (clip.prepare||0)*1.24;
  if(clip.phase==='cancel')return (clip.releaseFrom||0)*1.24*(1-smooth(clip.t/T.cancel));
  return map(clip.t,[[0,(clip.releaseFrom||0)*1.24],[T.contact,1.70],[T.strike,1.84],[T.retreatStart,2],[T.remountEnd,2.90],[T.settleEnd,3.26]]);
 }
 function frame(){
  const state=base(),action=boss?.turnAction;let x=laneX(player.x,1),y=PLAYER_Y;
  state.laneStep=KRMountedRunner.laneMotion?.heading||0;state.stepClock=KRMountedRunner.laneMotion?.stepClock||0;
  if(action?.actorId==='knight'&&isBowTurnAction(action)){
   state.action='bow';state.actionTime=bowTime(action);
   state.bowAim=aim().angle-180;
  }else if(action?.actorId==='knight'&&isShieldTurnAction(action)){
   const t=shieldActionPoseTime(action),T=SHIELD_BASH_TIMING,N=KRMountedShield.timing.bash;
   state.action='bash';state.actionTime=map(t,[[0,0],[T.impact,N.contact],[T.holdEnd,N.contact],[T.remountEnd,N.remount],[T.recoveryEnd,N.end]]);
   const travel=smooth((t-.45)/(T.impact-.45))*(1-smooth((t-T.holdEnd)/(T.remountEnd-T.holdEnd))),
    // Use the shield's actual front plate centre at impact, not the old rig's
    // hardcoded palm offset. All three lanes reach the boss's same hit point.
    q=shieldContactOffset(),to=target(22);
   x=mix(action.shieldTravel?.fromX??x,to.x-q[0]*U,travel);
   y=mix(action.shieldTravel?.fromY??y,to.y-q[1]*U,travel);
   // A short gallop carries the horse into contact; authored contact stays
   // planted, then the return runs the stride back to its original lane.
   state.lungeStride=travel<=0||travel>=1?0:Math.sin(Math.PI*travel)**2;state.time=state.lungeStride?travel*.6:0;
  }else if(activePlayerParryShieldPose()){
   state.action='parry';state.actionTime=parryTime(player.parryShield);
  }else if(player.swordPreviewT>=0){
   state.action='sword';const A=BACK_SWORD_TIMING,B=KRMountedSword.timing;
   state.actionTime=map(player.swordPreviewT,[[0,0],...Object.keys(A).map(k=>[A[k],B[k]])]);
  }else if(player.attackAnim>0||player.swordCombo||player.counterAnim>0){
   state.action='sword';const clip=player.swordCombo;
   state.actionTime=clip?clip.returning?mix(2.08,3.34,clip.k):mix(clip.to>0?1:1.54,clip.to>0?1.28:1.8,clip.k):map(1-player.attackAnim,[[0,1.0],[.3,1.28],[.65,2.08],[1,3.34]]);
  }else{
   const prepared=activePlayerBowPose();
   if(prepared?.preparedFocus){state.action='bow';state.actionTime=mix(2.1,2.75,prepared.drawAmount);state.bowAim=aim().angle-180;}
  }
  if(player.jumpT>=0){state.laneStep=0;state.motion='gallop';state.time=KRMountedRunMotion.timeAt(player.jumpT/jumpDur()*.78);state.action='jump';state.actionTime=undefined;}
  else if(player.duckT>=0){state.action='duck';state.duckAmount=duckPostureAmountAt(player.duckT);}
  const rush=state.action==='bash'?0:characterSpecialLungeAmount();
  const f=KRMountedRunMotion.frame(state,x,y-rush*68,U*(1+rush*.08/1.02)),lift=playerSequenceJumpLift();
  // Raise the complete existing rig; retain its ground-anchored shadow and
  // articulated takeoff/landing, with the same added lift as native collision.
  if(lift){f.placement.y-=lift;f.height+=lift;f.minSole+=lift/f.placement.unit;}
  api.lastFrame=f;return f;
 }
 function afterDraw(f){
  const s=f.pose.sword;if(!s||player.swordPreviewT<0)return;
  const project=v=>{const q=f.pose.project(v);return {x:f.placement.x+q[0]*f.placement.unit,y:f.placement.y+q[1]*f.placement.unit};},
   at=length=>project(KRMountedRig.add(s.gripPoint,KRMountedRig.mul(s.u,length)));
  player.swordFxPose={base:at(1.64),tip:at(s.model.length+2),t:player.swordPreviewT};
  if(player.pendingSwordFx){const pending=player.pendingSwordFx;player.pendingSwordFx=null;
   if(Math.abs(player.swordFxPose.t-pending.t)<.2)scatterSwordPoseParticles(player.swordFxPose,...pending.args);
  }
 }
 const originalGeometry=bowTurnActionGeometry,originalScale=bowFlightArrowScale;
 bowTurnActionGeometry=function(actorId='knight'){
  if(active()&&boss&&actorId==='knight'){const distance=originalGeometry(actorId).distance,a=aim();return {from:{...a.from},to:{...a.to},distance};}
  return originalGeometry(actorId);
 };
 bowFlightArrowScale=function(actorId='knight'){return active()&&boss&&actorId==='knight'?aim().scale:originalScale(actorId);};
 const api=window.KRMountedCombat={active,frame,afterDraw,aim,bowTime,parryTime};
})();
