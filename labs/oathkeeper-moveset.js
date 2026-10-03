/* User-authored five-move blocking, 2026-10-03. Native encounter only.
 * Hesitation varies between runs; release, contact, props and pose share a clock.
 * Parry design is deliberately deferred. This is a candidate, not an art anchor. */
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;else root.KROathkeeperMoveset=api;})(globalThis,root=>{
 'use strict';
 const Model=root.KROathkeeperModel||(typeof require==='function'?require('./oathkeeper-model.js'):null),
  Physical=root.KROathkeeperPhysical||(typeof require==='function'?require('./oathkeeper-physical.js'):null);
 // A longer lens removes the close-range ultra-wide look. Keep the native
 // player plane exactly fixed; the boss, held/released props and contacts all
 // use this same camera. Historical Physical clips keep their old projector.
 const ACTOR_SCALE=100/46.7744,REACH_SCALE=2.8,REST_LIFT=24,REST_DEPTH_OFFSET=61,FIST_BODY_DEPTH=35,FOCAL=160,UNIT=100,
  DEPTH=Physical.depthScale*REACH_SCALE,GROUND_RISE=320,FRONT_EYE=4.6,
  camera=Object.freeze({focal:FOCAL,groundRise:GROUND_RISE,worldUnit:UNIT,depthScale:DEPTH,frontEye:FRONT_EYE}),
  perspectiveScale=z=>FOCAL/(FOCAL+Math.max(z,-FOCAL*.78)),
  clamp=t=>Math.max(0,Math.min(1,t)),mix=(a,b,t)=>a+(b-a)*t,
  ease=t=>{t=clamp(t);return t*t*(3-2*t);},ramp=(t,a,b)=>ease((t-a)/(b-a)),
  add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,n)=>a.map(v=>v*n),
  dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  norm=v=>mul(v,1/(Math.hypot(...v)||1)),lerp3=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t));
 const neutral=Object.freeze({...Physical.neutral,crouch:-.16,jawOpen:0}),K=(t,v)=>({t,v:{...neutral,...v}});
 const HASH=n=>{n=(n^61)^(n>>>16);n=Math.imul(n,9);n^=n>>>4;n=Math.imul(n,0x27d4eb2d);return(n^(n>>>15))>>>0;};
 function variantFor(ctx={},index=0){const seed=(Number(ctx.seed)||1)>>>0,a=HASH(seed+index*997),b=HASH(a+31),safeLane=b%3;
  const variant={...{seed,hold:[.18,.44,.76][a%3],lane:b%3,side:a&1?1:-1,high:!!(b&8),split:!!(b&16),safeLane,
   beamLanes:a&8?[0,1,2].filter(l=>l!==safeLane):[b%3]},...(ctx.variant||{})};
  // Edge strikes use the outside hand so the supported torso stays in view.
  // Center strikes retain either hand; do not slide a planted fist or fake reach.
  if(index===0&&variant.lane!==1)variant.side=variant.lane===0?-1:1;
  return variant;}
 function clipTime(t,hold,at=1.95){return t<=at?t:t<=at+hold?at:t-hold;}
 function poseAt(keys,t,out={}){
  let i=0;while(i<keys.length-2&&t>keys[i+1].t)i++;
  const u=clamp((t-keys[i].t)/(keys[i+1].t-keys[i].t)),u2=u*u,u3=u2*u,dt=keys[i+1].t-keys[i].t;
  const get=(n,c)=>{const v=j=>c===undefined?keys[j].v[n]:keys[j].v[n][c],m=j=>{if(j===0||j===keys.length-1)return 0;const a=(v(j)-v(j-1))/(keys[j].t-keys[j-1].t),b=(v(j+1)-v(j))/(keys[j+1].t-keys[j].t);return a*b<=0?0:2*a*b/(a+b);};return(2*u3-3*u2+1)*v(i)+(u3-2*u2+u)*dt*m(i)+(-2*u3+3*u2)*v(i+1)+(u3-u2)*dt*m(i+1);};
  for(const n of Object.keys(neutral)){if(Array.isArray(neutral[n])){out[n]??=[];for(let c=0;c<3;c++)out[n][c]=get(n,c);}else out[n]=get(n);}
  return out;
 }
 const raised={crouch:-.26,lean:.065,left:[-1.70,4.75,-.62],right:[1.70,4.75,-.62],leftPitch:2.45,rightPitch:2.45,grip:1,leftPole:[-1,0,.65],rightPole:[1,0,.65]},
  ground={crouch:-1.18,lean:-.38,left:[-1.08,.555,-1.25],right:[1.08,.555,-1.25],leftPitch:0,rightPitch:0,grip:1},
  bent={crouch:-.68,lean:-.22,left:[-1.8,1.7,-.7],right:[1.8,1.7,-.7],grip:.6};
 const fistPlant={...ground,crouch:-1.25,lean:-.65,left:[-1.60,2.00,-.60],right:[1.13,.555,-FIST_BODY_DEPTH/DEPTH+.23*Math.cos(.03)],twist:.1},
  fistKeys=[K(0,{}),K(.35,{crouch:-.28,shift:-.1}),
  K(.80,{crouch:-.30,twist:-.11,right:[2.86,2.65,-.04],rightPitch:.75,grip:1,rightPole:[1,-.12,.65]}),
  K(1.20,{crouch:-.30,twist:-.16,right:[3.02,3.65,-.08],rightPitch:1.45,grip:1,rightPole:[1,-.12,.65]}),
  K(1.62,{crouch:-.28,lean:.07,twist:-.18,right:[2.68,4.80,-.28],rightPitch:2.15,grip:1,rightPole:[1,-.12,.65]}),
  K(1.95,{crouch:-.34,lean:.10,twist:-.20,right:[2.62,4.85,-.28],rightPitch:2.15,grip:1,rightPole:[1,-.12,.65]}),
  K(2.14,{crouch:-.80,lean:-.20,twist:-.09,right:[1.77,3.2,-1.25],rightPitch:1.20,grip:1,rightPole:[1,-.12,.65]}),
  K(2.30,{crouch:-1.20,lean:-.55,twist:.07,right:[1.13,1.32,-2.30],rightPitch:.28,grip:1}),
  K(2.43,fistPlant),K(2.58,fistPlant),K(2.93,fistPlant),
  K(3.18,fistPlant),K(3.82,fistPlant),K(3.91,fistPlant),
  K(4.50,{...bent,twist:.03}),K(5.15,bent),K(7.65,{}),K(8.1,{})];
 const boulderKeys=[K(0,{}),K(.62,{crouch:-.38,lean:-.05,left:[-1.9,2.6,-.30],right:[1.9,2.6,-.30],grip:.3}),
  K(1.3,{crouch:-.34,lean:.02,left:[-1.05,2.88,-.75],right:[1.05,2.88,-.75],leftPitch:.60,rightPitch:.60,grip:.4}),
  K(1.95,{crouch:-.39,lean:.08,left:[-1.03,2.88,-.76],right:[1.03,2.88,-.76],leftPitch:.60,rightPitch:.60,grip:.65}),
  K(2.19,{crouch:-.62,lean:-.22,left:[-.97,2.66,-1.45],right:[.97,2.66,-1.45],leftPitch:.05,rightPitch:.05,grip:.25}),
  K(2.43,{crouch:-.64,lean:-.25,left:[-1.08,2.50,-1.52],right:[1.08,2.50,-1.52],grip:.1}),
  K(3.9,{...bent}),K(5.0,{}),K(6.0,{})];
 const pillarKeys=[K(0,{}),K(.55,{crouch:-.35,left:[-2.05,2.6,-.6],right:[2.05,2.6,-.6],grip:1}),
  K(1.35,raised),K(1.95,{...raised,crouch:-.32,lean:.09}),
  K(2.20,{crouch:-.75,lean:-.26,left:[-1.58,2.5,-1.4],right:[1.58,2.5,-1.4],leftPitch:.60,rightPitch:.60,grip:1}),
  K(2.43,ground),K(4.25,ground),K(4.90,bent),K(5.75,{}),K(6.2,{})];
 const whipLoad={grip:1,leftPole:[-1,.18,.78],rightPole:[1,.18,.78]},whipKey=(t,v)=>K(t,{...whipLoad,...v});
 const whipKeys=[K(0,{}),whipKey(.68,{crouch:-.44,lean:.03,left:[-1.94,3.55,-.70],right:[1.94,3.55,-.70],leftPitch:1,rightPitch:1}),
  whipKey(1.18,ground),whipKey(1.42,ground),whipKey(1.95,{crouch:-.45,lean:.05,left:[-2.18,3.15,-.76],right:[2.18,3.15,-.76],leftPitch:.8,rightPitch:.8}),
  whipKey(2.22,{crouch:-.31,lean:.08,twist:.23,left:[-2.60,4.43,-.36],right:[2.12,2.91,-.64],leftPitch:1.75,rightPitch:.60}),
  whipKey(2.58,{crouch:-.47,lean:-.10,twist:-.09,left:[-1.16,3.62,-1.56],right:[2.05,3.17,-.45],leftPitch:.83,rightPitch:.80}),
  whipKey(2.90,{crouch:-.60,lean:-.21,twist:-.26,left:[.09,2.97,-1.60],right:[2.48,4.31,-.33],leftPitch:.35,rightPitch:1.62}),
  whipKey(3.28,{crouch:-.42,lean:.04,twist:-.13,left:[-1.55,3.04,-.91],right:[1.77,4.00,-1.04],leftPitch:.65,rightPitch:1.20}),
  whipKey(3.72,{crouch:-.62,lean:-.22,twist:.25,left:[-2.23,3.03,-.49],right:[-.09,2.97,-1.60],leftPitch:.62,rightPitch:.35}),
  whipKey(4.24,{crouch:-.43,lean:.06,twist:.08,left:[-3.04,3.30,-.81],right:[3.04,3.30,-.81],leftPitch:.72,rightPitch:.72}),
  whipKey(4.55,{crouch:-.44,lean:.04,twist:0,left:[-3.12,3.10,-.80],right:[3.12,3.10,-.80],leftPitch:.56,rightPitch:.56}),
  whipKey(4.96,{crouch:-.78,lean:-.25,left:[-.78,1.80,-1.65],right:[.78,1.80,-1.65],leftPitch:.13,rightPitch:.13}),
  whipKey(5.34,{crouch:-.53,lean:-.07,left:[-1.10,3.17,-1.36],right:[1.10,3.17,-1.36],leftPitch:1.12,rightPitch:1.12}),
  whipKey(5.80,{crouch:-.24,lean:.09,left:[-1.42,4.92,-.45],right:[1.42,4.92,-.45],leftPitch:2.65,rightPitch:2.65}),
  whipKey(6.17,{crouch:-.20,lean:.12,left:[-1.27,5.16,-.34],right:[1.27,5.16,-.34],leftPitch:2.84,rightPitch:2.84}),
  whipKey(6.35,{crouch:-.35,lean:.05,left:[-1.24,4.72,-1.10],right:[1.24,4.72,-1.10],leftPitch:2.25,rightPitch:2.25}),
  whipKey(6.50,{crouch:-.74,lean:-.18,left:[-1.36,2.79,-1.66],right:[1.36,2.79,-1.66],leftPitch:1.08,rightPitch:1.08}),
  whipKey(6.69,{...ground,left:[-.79,.94,-1.51],right:[.79,.94,-1.51]}),whipKey(7.25,ground),
  whipKey(7.60,{...bent,left:[-1.87,1.51,-.91],right:[1.87,1.51,-.91]}),K(8.25,{}),K(9.0,{})];
 const beamKeys=[K(0,{}),K(.70,{crouch:-.38,lean:.06,left:[-2.22,1.90,-.2],right:[2.22,1.9,-.2],grip:1,jawOpen:.15}),
  K(1.45,{crouch:-.50,lean:.15,left:[-2.4,2.2,-.25],right:[2.4,2.2,-.25],grip:1,jawOpen:.85}),
  K(1.95,{crouch:-.55,lean:.17,left:[-2.45,2.18,-.3],right:[2.45,2.18,-.3],grip:1,jawOpen:1}),
  K(2.27,{crouch:-.82,lean:-.25,left:[-2.32,1.65,-.85],right:[2.32,1.65,-.85],grip:1,jawOpen:1}),
  K(2.38,{crouch:-.85,lean:-.28,left:[-2.33,1.62,-.85],right:[2.33,1.62,-.85],grip:1,jawOpen:1}),
  K(3.18,{crouch:-.78,lean:-.22,left:[-2.28,1.72,-.80],right:[2.28,1.72,-.80],grip:1,jawOpen:.93}),
  K(3.40,{...bent,jawOpen:.65}),K(4.55,{}),K(6.0,{})];
 const tracks=[fistKeys,boulderKeys,pillarKeys,whipKeys,beamKeys];
 const markers=Object.freeze([
  {holdAt:1.95,impact:2.43,bulletRelease:3.00,recovery:4.5},
  {holdAt:1.95,release:2.27,split:2.58,contact:3.00,recovery:3.7},
  {holdAt:1.95,impact:2.43,dust:2.52,rise:3.22,contact:3.35,clear:4.20},
  {holdAt:1.95,dig:1.18,left:2.89,right:3.72,close:5.10,vertical:6.76,clear:7.45},
  {holdAt:1.95,release:2.28,contact:2.38,clear:3.18,recovery:3.40}
 ]);
 function playerPlane(ctx){const center=ctx.project(1,0,0);return{x:center.x,y:center.y,span:ctx.project(2,0,0).x-center.x};}
 function projectWorld(ctx,w){const plane=playerPlane(ctx),s=perspectiveScale(w.z);return{x:plane.x+(w.lane-1)*plane.span*s,y:plane.y-GROUND_RISE*(1-s)-w.height*s,s,depth:w.z};}
 function nativeX(ctx,lane,z){return projectWorld(ctx,{lane,height:0,z}).x;}
 function worldPoint(frame,v){const plane=playerPlane(frame.ctx);return{lane:frame.actorRoot.x+v[0]*UNIT/plane.span,height:(frame.actorRoot.height||0)+v[1]*UNIT,z:frame.actorRoot.z+v[2]*DEPTH};}
 function projectPoint(frame,v){return projectWorld(frame.ctx,worldPoint(frame,v));}
 function localPoint(frame,w){return[(w.lane-frame.actorRoot.x)*playerPlane(frame.ctx).span/UNIT,(w.height-(frame.actorRoot.height||0))/UNIT,(w.z-frame.actorRoot.z)/DEPTH];}
 // Sharp-plane staging separates the actor's frontal surface presentation from
 // its vertical composition. Growing the distant giant must not tilt the face
 // upward or raise the whole actor into the HUD; native z0 remains untouched.
 function cameraPosition(frame){return[-(frame.actorRoot.x-1)*playerPlane(frame.ctx).span/UNIT,FRONT_EYE+(REST_LIFT-(frame.actorRoot.height||0))/UNIT,-(FOCAL+frame.actorRoot.z)/DEPTH];}
 function footWorld(ctx,actorRoot,side){return worldPoint({ctx,actorRoot},[side*.87,.33,-.02]);}
 function locomotion(t,ctx,v,m,index){
  // Keep the native logical encounter depth untouched. The larger golem rests
  // beyond it, leaving an actual approach corridor in front of the rider.
  const start={x:ctx.startActorX??1,z:(ctx.startActorZ??14)+REST_DEPTH_OFFSET};if(index!==0&&index!==1)return start;
  const near=index===0?{x:v.lane-v.side*(v.lane===1?.22:(1.13-.23*Math.sin(.03))*UNIT/playerPlane(ctx).span),z:FIST_BODY_DEPTH}:{x:start.x,z:start.z+10*REACH_SCALE},steps=index===0?[
   [v.side,.22,.38,.25],[-v.side,.41,.57,.25],[v.side,.60,.76,.25],[-v.side,.79,.95,.25],[v.side,.98,1.14,.25],[-v.side,1.17,1.33,.25],[v.side,1.36,1.52,.25],[-v.side,1.55,1.69,.25],
   [-v.side,5.40,5.61,-.25],[v.side,5.65,5.86,-.25],[-v.side,5.90,6.11,-.25],[v.side,6.15,6.36,-.25],[-v.side,6.40,6.61,-.25],[v.side,6.65,6.86,-.25],[-v.side,6.90,7.11,-.25],[v.side,7.15,7.39,-.25]]:[
   [-1,.15,.41,.5],[1,.45,.71,.5],[-1,.75,1.01,.5],[1,1.05,1.31,.5],
   [1,3.70,4.05,-.5],[-1,4.11,4.46,-.5],[1,4.52,4.87,-.5],[-1,4.93,5.28,-.5]],
   progressBySide={[-1]:0,[1]:0},liftBySide={[-1]:0,[1]:0};
  for(const[side,a,b,amount]of steps){const u=ramp(t,a,b);progressBySide[side]+=u*amount;liftBySide[side]+=.18*Math.sin(Math.PI*u)**2;}
  // Pelvis momentum continues across footfalls instead of stopping at each
  // alternating step. Grounded foot targets remain in world space below.
  const a=index===0?.22:.15,b=index===0?1.69:1.31,c=index===0?5.40:3.70,d=index===0?7.39:5.28,
   travel=ramp(t,a,b)-ramp(t,c,d),actorRoot={x:mix(start.x,near.x,travel),z:mix(start.z,near.z,travel)},f={ctx,actorRoot};
  // The planted leg carries the pelvis while the opposite short step advances.
  const stepping=ramp(t,a-.15,a)*(1-ramp(t,b,b+.16))+ramp(t,c-.22,c)*(1-ramp(t,d,d+.20)),
   gait=(liftBySide[1]-liftBySide[-1])/.18;
  m.crouch-=.43*stepping+.045*(liftBySide[1]+liftBySide[-1])/.18;
  m.shift+=gait*.045;m.twist+=gait*.018;
  if(index===0){m.left[2]-=gait*.15*stepping;m.left[1]+=.08*stepping;
   if(t>5.15){m.right[2]+=gait*.15*stepping;m.right[1]+=.08*stepping;}}
  for(const side of [-1,1]){const progress=progressBySide[side],
   from=footWorld(ctx,start,side),to=footWorld(ctx,near,side),lift=liftBySide[side],
   world={lane:mix(from.lane,to.lane,progress),height:UNIT*(.33+lift),z:mix(from.z,to.z,progress)};
   m[side<0?'leftFoot':'rightFoot']=localPoint(f,world);
  }return actorRoot;
 }
 function actorLift(clip,index){const windows=[[1.95,2.30,4.50,5.15],[1.95,2.19,3.90,5.00],[1.95,2.30,4.25,5.75],[.68,1.18,7.25,8.20]][index];
  return windows?REST_LIFT*(1-ramp(clip,windows[0],windows[1])+ramp(clip,windows[2],windows[3])):REST_LIFT;
 }
 function samplePose(t,ctx={},index=0){const variant=variantFor(ctx,index),ct=clipTime(t,variant.hold),motion=poseAt(tracks[index],ct);
  // Keep the heavier raised palm inside both phone edges without changing the
  // planted contact pose or moving the actor merely to manufacture a hit.
  if(index===0){const raised=ramp(ct,.45,.85)*(1-ramp(ct,2.14,2.30));
   motion.right[0]-=1.30*raised;motion.right[1]-=1.85*raised;
   // One bend plane carries the raise, reach, planted hold and withdrawal.
   // Restoring the idle pole during the descent causes an IK branch flip;
   // unfold only while the whole actor is already retreating into depth.
   const compact=ramp(ct,.80,1.62)*(1-ramp(ct,7.39,8.10));
   motion.rightPole=lerp3(motion.rightPole,[.20,-.25,1],compact);
   // The unused arm braces close to the chest, rather than letting the enlarged
   // elbow hang outside the phone while the striking arm is raised.
   const brace=ramp(ct,.22,.68)*(1-ramp(ct,6.35,7.39));
   motion.left=lerp3(motion.left,[-1.30,2.30,.10],brace);
   motion.leftPole=lerp3(motion.leftPole,[.30,.30,.90],brace);
   // The giant palm folds inward after firing, before the first backward step.
   // Never apply this tuck to the planted hit or either emitter origin.
   motion.right[0]-=.12*ramp(ct,3.91,4.50)*(1-ramp(ct,6.35,7.39));
   if(variant.lane===1){const target=.22*playerPlane(ctx).span/UNIT+.23*Math.sin(.03),plant=ramp(ct,2.14,2.43)*(1-ramp(ct,3.91,4.50));motion.right[0]-=(1.13-target)*plant;}
  }
  if(index===3){const lowSweep=ramp(ct,4.10,4.62)*(1-ramp(ct,5.20,5.52));
   // Load the pelvis under the forward-reaching hands. The distant body stays
   // put while the fixed-length chains sweep through the mounted player plane.
   motion.left[1]-=.50*lowSweep;motion.right[1]-=.50*lowSweep;motion.crouch-=.30*lowSweep;
   motion.left[2]-=.60*lowSweep;motion.right[2]-=.60*lowSweep;
   // The two diagonal preparations and the final overhead load squat under
   // their hands. This preserves a real head-high arch below the native HUD,
   // without shortening the stone links or shifting the distant actor root.
   const leftLoad=ramp(ct,1.95,2.20)*(1-ramp(ct,2.50,2.70)),
    rightLoad=ramp(ct,2.72,2.97)*(1-ramp(ct,3.25,3.48)),
    finalLoad=ramp(ct,5.20,5.68)*(1-ramp(ct,6.35,6.58));
   motion.crouch-=.70*leftLoad+.55*rightLoad+.70*finalLoad;
   motion.left[1]-=.90*(leftLoad+rightLoad)+1.15*finalLoad;
   motion.right[1]-=.90*(leftLoad+rightLoad)+1.15*finalLoad;}
  if(index===0&&variant.side<0){const l=motion.left;motion.left=motion.right.map((v,i)=>i===0?-v:v);motion.right=l.map((v,i)=>i===0?-v:v);const pole=motion.leftPole;motion.leftPole=motion.rightPole.map((v,i)=>i===0?-v:v);motion.rightPole=pole.map((v,i)=>i===0?-v:v);[motion.leftPitch,motion.rightPitch]=[motion.rightPitch,motion.leftPitch];motion.twist*=-1;motion.shift*=-1;}
  // A small loaded breath during the authored hold, not an animation freeze.
  if(t>1.95&&t<1.95+variant.hold){const breath=Math.sin((t-1.95)/variant.hold*Math.PI);motion.lean+=.008*breath;}
  const actorRoot=locomotion(ct,ctx,variant,motion,index);actorRoot.height=actorLift(ct,index);
  const pose=Model.pose(7,{id:'moveset',time:t,motionOverride:motion});
  // The native encounter keeps its stable logical depth. The long-lens world
  // frame owns rendered travel, held objects and every actual contact slice.
  // Keeping these explicit prevents a restart from adding the rest offset twice.
  const logicalActorRoot={x:actorRoot.x,z:ctx.startActorZ??14};
  return{ctx,time:t,clip:ct,variant,index,motion,actorRoot,logicalActorRoot,pose};
 }
 function newFrame(){return{hazards:[],props:[],cues:[],motion:{},actorRoot:null};}
 function pooled(out,kind){const n=out._used[kind]++;return out._pool[kind][n]||(out._pool[kind][n]={});}
 function hazard(out,id,active){const h=pooled(out,'hazards');Object.assign(h,{id,active,parryable:false,hitText:'The oathkeeper found you'});h.primitives??=[];h.primitives.length=0;out.hazards.push(h);return h;}
 function circle(h,p,r,source){h._circles??=[];const i=h.primitives.length,c=h._circles[i]||(h._circles[i]={});Object.assign(c,{x:p.x,y:p.y,r,source});h.primitives.push(c);}
 function rock(out,id,world,w,h,d,kind='rock',extra={}){const p=pooled(out,'props'),q=projectWorld(out.ctx,{...world,height:0}),s=perspectiveScale(world.z);
  Object.assign(p,{id,world,w,h,d,kind,x:q.x,y:q.y-world.height*s,s,depth:world.z,yaw:0,roll:0,alpha:1,mat:kind==='chip'?'earth':'boulder',segment:null,crack:0},extra);out.props.push(p);return p;}
 function solid(out,id,world,w,h,d,active,extra={}){const p=rock(out,id,world,w,h,d,'rock',extra),hit=hazard(out,id,active);
  if(active){const radius=Math.min(extra.collisionWidth||w,h)*.34,half=Math.max(0,h*.39-radius),steps=Math.max(1,Math.ceil(half*2/Math.max(16,radius*1.5)));for(let i=0;i<=steps;i++)circle(hit,{x:p.x,y:p.y+mix(-half,half,i/steps)*p.s},radius*p.s,{kind:'rock',world});}return p;}
 // No authored floor reticles. Attack direction is carried by the real arm,
 // held rock, rope silhouette and mouth charge, never a lane marker.
 function solidPlaneContact(out,p,h){const plane=-out.actorRoot.z/DEPTH,tr=propTransform(out,p),points=[],turn=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  for(const face of mesh(p.kind)){const verts=face.map(tr);for(let i=0;i<verts.length;i++){const a=verts[i],b=verts[(i+1)%verts.length],az=a[2]-plane,bz=b[2]-plane;if(Math.abs(az)<1e-9)points.push(projectPoint(out,a));if(az*bz<0)points.push(projectPoint(out,lerp3(a,b,-az/(bz-az))));}}
  points.sort((a,b)=>a.x-b.x||a.y-b.y);const pts=points.filter((p,i)=>!i||Math.hypot(p.x-points[i-1].x,p.y-points[i-1].y)>1e-7),hull=[];
  for(const p of pts){while(hull.length>1&&turn(hull.at(-2),hull.at(-1),p)<=1e-7)hull.pop();hull.push(p);}const lower=hull.length;
  for(let i=pts.length-2;i>=0;i--){const p=pts[i];while(hull.length>lower&&turn(hull.at(-2),hull.at(-1),p)<=1e-7)hull.pop();hull.push(p);}hull.pop();
  if(hull.length<3){h.active=false;return;}
  const horizontal=p.id.startsWith('arm-bullet'),axis=horizontal?'x':'y',crossAxis=horizontal?'y':'x',
   first=Math.min(...hull.map(p=>p[axis])),last=Math.max(...hull.map(p=>p[axis])),count=15;
  // Pack the long axis of the actual slice. A horizontal44px ray needs
  // contacts across its length, not fifteen circles on one vertical centerline.
  for(let i=0;i<count;i++){const value=mix(first,last,(i+.5)/count);let l=Infinity,r=-Infinity;for(let j=0;j<hull.length;j++){const a=hull[j],b=hull[(j+1)%hull.length];if((a[axis]<=value&&b[axis]>value)||(b[axis]<=value&&a[axis]>value)){const crossing=mix(a[crossAxis],b[crossAxis],(value-a[axis])/(b[axis]-a[axis]));l=Math.min(l,crossing);r=Math.max(r,crossing);}}
   const at=horizontal?{x:value,y:(l+r)/2}:{x:(l+r)/2,y:value};let radius=40;for(let j=0;j<hull.length;j++){const a=hull[j],b=hull[(j+1)%hull.length];radius=Math.min(radius,turn(a,b,at)/Math.hypot(b.x-a.x,b.y-a.y)-.65);}if(radius>.15)circle(h,at,radius,{kind:horizontal?'arm-bullet':'rock',propId:p.id,sliceDepth:0,sample:i});
  }h.active=h.primitives.length>0;
 }
 function chips(out,id,world,age,count=10,force=1){if(age<0||age>.65)return;const fade=1-ramp(age,.40,.65);for(let i=0;i<count;i++){const a=i*2.399,spread=(.12+age*.95)*force,height=Math.max(0,Math.sin(Math.PI*age/.65)*(16+(i%4)*8)*force),size=(6+i%3*3)*fade;
   rock(out,id+i,{lane:world.lane+Math.cos(a)*spread,height:world.height+height,z:world.z+Math.sin(a)*spread*2},size,size*.8,size,'chip',{yaw:a,roll:age*(i%2?2:-2)});}}
 const armEmitterCache=new Map();
 function armSurfaceEmitters(frame,height){const side=frame.variant.side,span=playerPlane(frame.ctx).span,
  key=[frame.variant.lane,side,height,span,frame.actorRoot.x,frame.actorRoot.z,frame.actorRoot.height].join('|');
  if(armEmitterCache.has(key))return armEmitterCache.get(key);
  const model=Model.build(7,{id:'moveset',time:frame.time,motionOverride:frame.motion},{hideEffectMeshes:true}),
   target=localPoint(frame,{lane:1,height,z:0}),parts=['forearm','wrist','palm','finger','knuckle','thumb'],points=[];
  // Intersect actual stone surfaces with the horizontal firing line. This is
  // the planted arm's two outer faces, not an emitter floating beside the rig.
  const cut=(poly,axis,value)=>{const at=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=a[axis]-value,db=b[axis]-value;
   if(Math.abs(da)<1e-9)at.push(a);if(da*db<0)at.push(lerp3(a,b,-da/(db-da)));}return at;};
  for(const part of parts){const faces=model.faces.filter(f=>f.solid&&f.part===part),half=faces.length/2;
   for(const face of faces.slice(side<0?0:half,side<0?half:faces.length))points.push(...cut(cut(face.v,1,target[1]),2,target[2]));
  }
  const result=points.length?[-1,1].map(direction=>{const x=direction<0?Math.min(...points.map(p=>p[0])):Math.max(...points.map(p=>p[0]));return{direction,world:worldPoint(frame,[x,target[1],target[2]])};}):[];
  armEmitterCache.set(key,result);while(armEmitterCache.size>16)armEmitterCache.delete(armEmitterCache.keys().next().value);return result;
 }
 function prepareFist(ctx={}){const variant=variantFor(ctx,0),frame=samplePose(3+variant.hold,ctx,0);
  armSurfaceEmitters(frame,100);armSurfaceEmitters(frame,20);return{cacheEntries:armEmitterCache.size,maxCacheEntries:16};}
 function fist(out){const t=out.clip,v=out.variant,s=v.side,palm=out.pose.handPoint(s,[0,-.38,-.23]),p=projectPoint(out,palm),hit=hazard(out,'fist',t>=2.14&&t<=2.60);
  if(hit.active){for(const x of [-.23,0,.23]){const at=projectPoint(out,out.pose.handPoint(s,[x,-.34,-.25]));if(at.depth<1.2&&at.depth>-.95)circle(hit,at,.24*UNIT*at.s,{kind:'fist',side:s});}hit.active=hit.primitives.length>0;}
  if(t>=2.86&&t<=3.91){const height=v.high?100:20,launch=samplePose(3+v.hold,out.ctx,0),emitters=armSurfaceEmitters(launch,height),span=playerPlane(out.ctx).span;
   out.armBeamEmitters=emitters;
   if(t<3.17){const charge=ramp(t,2.86,3)*(1-ramp(t,3.03,3.17));for(const emitter of emitters)rock(out,'arm-muzzle-'+emitter.direction,emitter.world,10*charge,10*charge,6*charge,'energy',{mat:'#71d8ef'});}
   if(t>=3){const length=44,distance=(t-3)*650;for(const emitter of emitters){const direction=emitter.direction,
     w={lane:emitter.world.lane+direction*(length/2+distance)/span,height,z:0},center=localPoint(out,w),half=length/(2*UNIT),
     p=rock(out,'arm-bullet-'+(direction<0?'left':'right'),w,10,length,6,'beam',{segment:[sub(center,[half,0,0]),add(center,[half,0,0])],mat:'#087df7',emitter:emitter.world,direction,speed:650}),h=hazard(out,p.id,true);solidPlaneContact(out,p,h);}
   }
  }
  out.beat=t<1.65?'Ağırlıkla yaklaşma':t<2.14?'Yandan kol kaldırma · bekletme':t<2.72?'Kol darbesi · el sabit':t<=3.91?(v.high?'El yerde · yatay çift ışın · EĞİL':'El yerde · yatay çift ışın · ZIPLA'):'Atış sonrası eli çekme';
 }
 function boulder(out){const t=out.clip,v=out.variant,release=2.27,arrival=3.00,W=84,H=72,D=40;
  if(t>=1.05&&t<release){const grip=lerp3(out.pose.handPoint(-1,[.10,-.24,-.38]),out.pose.handPoint(1,[-.10,-.24,-.38]),.5),world=worldPoint(out,grip),growth=ramp(t,1.05,1.70);
   rock(out,'forming-stone',world,W*growth,H*growth,D*growth,'rock',{crack:v.split?ramp(t,1.60,1.95):0});}
  if(t>=release&&t<3.30){const rf=samplePose(release+v.hold,out.ctx,1),from=worldPoint(rf,lerp3(rf.pose.handPoint(-1,[.1,-.24,-.38]),rf.pose.handPoint(1,[-.1,-.24,-.38]),.5)),u=(t-release)/(arrival-release),z=mix(from.z,-.1,u),height=mix(from.height,68,clamp(u))+12*Math.sin(Math.PI*clamp(u));
   if(v.split&&t>=2.58){const split=ramp(t,2.58,2.92),span=nativeX(out.ctx,2,z)-nativeX(out.ctx,1,z),halfOffset=W*.25*perspectiveScale(z)/span;
    for(const side of [-1,1]){const p=rock(out,'split-'+side,{lane:1+side*mix(halfOffset,1,split),height,z},W,H,D,side<0?'half-left':'half-right',{yaw:side*.16*split,roll:side*.06*split}),h=hazard(out,p.id,true);solidPlaneContact(out,p,h);}}
   else {const p=rock(out,'whole-stone',{lane:1,height,z},W,H,D,'rock',{yaw:0,roll:v.split?0:-u*.08,crack:v.split?1:0}),h=hazard(out,p.id,true);solidPlaneContact(out,p,h);}
  }
  out.beat=t<1.2?'Geride avuçlarda kaya':t<2.27?'Kompakt kaya · bekletme':t<3.30?(v.split?'Hızlı çatlak kaya':'Uzaktan hızlı kaya'):'Toparlanma';
 }
 function pillars(out){const t=out.clip,lanes=[0,1,2].filter(l=>l!==out.variant.safeLane);
  for(const side of [-1,1]){const w=worldPoint(out,out.pose.handPoint(side,[0,-.45,-.23]));chips(out,'slam-'+side,w,t-2.43,7,.55);}
  if(t>=2.52&&t<3.22){for(const lane of lanes)chips(out,'dust-'+lane,{lane,height:0,z:.1},(t-2.52)*.75,7,.35);}
  if(t>=3.22&&t<4.55){const rise=ramp(t,3.22,3.40),sink=1-ramp(t,4.20,4.55),height=190*rise*sink;
   for(const lane of lanes){solid(out,'pillar-'+lane,{lane,height:height/2,z:.12},86,height,75,t>=3.26&&t<=4.20,{mat:'old',yaw:(lane-1)*.08,kind:'pillar'});chips(out,'pillar-break-'+lane,{lane,height:0,z:.12},t-3.22,8,.65);}}
  out.beat=t<2.14?'Çift yumruk · bekletme':t<2.52?'Yere mühürleme':t<3.22?'İki şeritte toz':t<4.2?'Yükselen sütunlar':'Toparlanma';
 }
 function curve(a,b,c,d,u){const q=1-u;return a.map((v,i)=>q*q*q*v+3*q*q*u*b[i]+3*q*u*u*c[i]+u*u*u*d[i]);}
 // The left grip strikes the right outside lane and the right grip strikes
 // the left. Cross-swipes continue beyond those targets as real follow-through.
 const whipTipKeys={
  left:[[1.18,-.18,5,7],[1.42,-.18,5,7],[1.95,-.42,115,4],[2.25,-.35,420,.5],[2.55,1.35,260,-.9],[2.89,2.04,100,-.8],[3.12,2.55,70,.8],[3.40,2.85,48,4],[3.85,-.55,70,4],[4.28,-.9,18,.2],[4.62,-.9,18,-.65],[4.82,-.1,18,-.35],[5.05,2.10,18,-.35],[5.20,2.8,18,.35],[5.40,2.72,65,2.5],[5.68,1.50,205,3],[6.05,1.06,400,.3],[6.30,1.08,405,-.4],[6.50,1.85,225,-.7],[6.76,2.05,7,-2.8],[7.25,2.40,8,.5],[7.60,2.50,4,6.5]],
  right:[[1.18,2.18,5,7],[1.42,2.18,5,7],[1.95,2.42,115,4],[2.38,2.45,116,4],[3.00,2.35,420,.5],[3.38,.65,260,-.9],[3.72,-.04,100,-1.1],[3.95,-.55,70,.8],[4.20,-.85,48,4],[4.45,2.9,18,.2],[4.62,2.9,18,-.65],[4.82,2.1,18,-.35],[5.05,-.10,18,-.35],[5.20,-.8,18,.35],[5.40,-.72,65,2.5],[5.68,.50,205,3],[6.05,.94,400,.3],[6.30,.92,405,-.4],[6.50,.15,225,-.7],[6.76,-.05,7,-2.8],[7.25,-.40,8,.5],[7.60,-.50,4,6.5]]
 };
 function whipTip(side,t){const keys=whipTipKeys[side<0?'left':'right'];let i=0;while(i<keys.length-2&&t>keys[i+1][0])i++;
  const dt=keys[i+1][0]-keys[i][0],u=clamp((t-keys[i][0])/dt),u2=u*u,u3=u2*u;
  return [1,2,3].map(c=>{const v=j=>keys[j][c],slope=j=>{if(j===0||j===keys.length-1)return 0;const a=(v(j)-v(j-1))/(keys[j][0]-keys[j-1][0]),b=(v(j+1)-v(j))/(keys[j+1][0]-keys[j][0]);return a*b<=0?0:2*a*b/(a+b);};return(2*u3-3*u2+1)*v(i)+(u3-2*u2+u)*dt*slope(i)+(-2*u3+3*u2)*v(i+1)+(u3-u2)*dt*slope(i+1);});
 }
 const WHIP_LINKS=12,WHIP_LENGTH=.52,WHIP_HZ=120,WHIP_START=1.18,whipCache=new Map();
 function whipSweep(frame,side,t){const start=frame.pose.handPoint(side,[0,-.42,-.15]),tip=whipTip(side,t),
  reach=ramp(t,4.10,4.62)*(1-ramp(t,5.20,5.52)),end=localPoint(frame,{lane:tip[0],height:tip[1],z:tip[2]-4.5*reach}),
  loaded=ramp(t,1.42,2.18),overhead=ramp(t,5.35,6.05)*(1-ramp(t,6.30,6.70)),close=ramp(t,3.94,4.36)*(1-ramp(t,5.20,5.55)),
  first=add(start,[side*(.85+.40*close),.65*loaded+.50*overhead,-.56]),second=lerp3(start,end,.67);
  second[0]+=side*(.66+.40*close);second[1]+=.46*overhead-.32*loaded;second[2]-=.35;
  return Array.from({length:WHIP_LINKS+1},(_,i)=>curve(start,first,second,end,i/WHIP_LINKS));
 }
 function whipConstrain(points,anchor,passes=12){
  for(let pass=0;pass<passes;pass++){points[0][0]=anchor[0];points[0][1]=anchor[1];points[0][2]=anchor[2];
   // Alternating traversal lets a loaded tip transmit tension back to the grip.
   for(let k=0;k<WHIP_LINKS;k++){const i=pass%2?WHIP_LINKS-k:k+1,a=points[i-1],b=points[i],dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],d=Math.hypot(dx,dy,dz)||1e-8,q=(d-WHIP_LENGTH)/d,w=i===1?1:.5;
    b[0]-=dx*q*w;b[1]-=dy*q*w;b[2]-=dz*q*w;if(i>1){a[0]+=dx*q*.5;a[1]+=dy*q*.5;a[2]+=dz*q*.5;}
   }
   for(let i=1;i<=WHIP_LINKS;i++)points[i][1]=Math.max(.12,points[i][1]);
  }
  points[0][0]=anchor[0];points[0][1]=anchor[1];points[0][2]=anchor[2];
  // One anchored projection restores exact rigid-link lengths after the
  // iterative floor/tension solve and fractional-frame interpolation.
  for(let i=1;i<=WHIP_LINKS;i++){const a=points[i-1],b=points[i],d=sub(b,a),length=Math.hypot(...d);for(let c=0;c<3;c++)b[c]=a[c]+(length>1e-8?d[c]/length:(c===2?-1:0))*WHIP_LENGTH;}
 }
 function whipTrajectory(out){const span=playerPlane(out.ctx).span,key=[out.variant.hold,out.actorRoot.x,out.actorRoot.z,span].join('|');
  let cache=whipCache.get(key);if(cache){whipCache.delete(key);whipCache.set(key,cache);return cache;}
  const hold=out.variant.hold,end=7.60+hold,count=Math.ceil((end-WHIP_START)*WHIP_HZ)+2,stride=(WHIP_LINKS+1)*3*2,data=new Float32Array(count*stride),
   ctx={...out.ctx,variant:{...out.variant,hold}},initial=samplePose(WHIP_START,ctx,3),chains=[-1,1].map(side=>{const p=whipSweep(initial,side,WHIP_START);whipConstrain(p,p[0].slice(),64);return{side,p,old:p.map(v=>v.slice())};}),dt=1/WHIP_HZ;
  for(let tick=0;tick<count;tick++){const now=WHIP_START+tick*dt,frame=samplePose(now,ctx,3),t=frame.clip;
   for(let s=0;s<2;s++){const chain=chains[s],p=chain.p,old=chain.old,anchor=frame.pose.handPoint(chain.side,[0,-.42,-.15]),guide=whipSweep(frame,chain.side,t+.075);
    if(tick){for(let i=1;i<=WHIP_LINKS;i++){const u=i/WHIP_LINKS,stiff=30+u*u*u*150,damping=Math.exp(-(6+u*13)*dt);
      for(let c=0;c<3;c++){const at=p[i][c],velocity=(at-old[i][c])*damping,force=(guide[i][c]-at)*stiff+(c===1?-11:0);p[i][c]=at+velocity+force*dt*dt;old[i][c]=at;}
     }whipConstrain(p,anchor,18);
    }
    for(let i=0;i<=WHIP_LINKS;i++)for(let c=0;c<3;c++)data[tick*stride+s*(WHIP_LINKS+1)*3+i*3+c]=p[i][c];
   }
  }
  cache={data,count,stride,hold};whipCache.set(key,cache);while(whipCache.size>4)whipCache.delete(whipCache.keys().next().value);return cache;
 }
 function prepareWhips(ctx={}){const frame=samplePose(WHIP_START,ctx,3);whipTrajectory(frame);return{links:WHIP_LINKS,linkLength:WHIP_LENGTH,simulationHz:WHIP_HZ,cacheEntries:whipCache.size,cacheBytes:[...whipCache.values()].reduce((n,c)=>n+c.data.byteLength,0),maxCacheEntries:4};}
 function whip(out,side,active,id,visibility=1){const cache=whipTrajectory(out),tick=clamp((out.time-WHIP_START)/((cache.count-1)/WHIP_HZ))*(cache.count-1),a=Math.floor(tick),b=Math.min(cache.count-1,a+1),u=tick-a,offset=side<0?0:(WHIP_LINKS+1)*3,
  points=Array.from({length:WHIP_LINKS+1},(_,i)=>[0,1,2].map(c=>mix(cache.data[a*cache.stride+offset+i*3+c],cache.data[b*cache.stride+offset+i*3+c],u))),anchor=out.pose.handPoint(side,[0,-.42,-.15]),hit=hazard(out,id,active);
  // Correct interpolation round-off without changing any authored contact clock.
  whipConstrain(points,anchor,4);
  for(let i=0;i<WHIP_LINKS;i++){const previous=points[i],at=points[i+1],world=worldPoint(out,lerp3(previous,at,.5)),width=mix(22,17,(i+.5)/WHIP_LINKS)*visibility,
   p=rock(out,id+':'+i,world,width,Math.hypot(...sub(at,previous))*UNIT*1.10,width*.92,'chain',{segment:[previous,at],mat:i%4===0?'old':'boulder'});
   if(active&&width>1){const first=hit.primitives.length,wanted=hit.active;
    // A contact is the visible stone's exact plane slice, not a large invisible
    // disk around a nearby endpoint. The native sweep retains its sample IDs.
    beamSliceCircles(out,p,hit);hit.active=wanted;for(let j=first;j<hit.primitives.length;j++)Object.assign(hit.primitives[j].source,{kind:'whip',side,segment:i,propId:p.id});
   }
  }
  hit.active=hit.active&&hit.primitives.length>0;out.whipPhysics??={};Object.assign(out.whipPhysics,{links:WHIP_LINKS,linkLength:WHIP_LENGTH,simulationHz:WHIP_HZ,cacheEntries:whipCache.size,cacheBytes:[...whipCache.values()].reduce((n,c)=>n+c.data.byteLength,0),maxCacheEntries:4});
 }
 function whips(out){const t=out.clip;
  if(t>=1.18&&t<=7.60){const visibility=ramp(t,1.42,2.16)*(1-ramp(t,7.25,7.60));
   let la=t>=2.79&&t<=3.02,ra=t>=3.62&&t<=3.85,lid='whip-left',rid='whip-right';
   if(t>=4.10&&t<5.52){la=ra=t>=4.86&&t<=5.20;lid='whip-close-left';rid='whip-close-right';}
   else if(t>=5.52){la=ra=t>=6.62&&t<=6.87;lid='whip-vertical-left';rid='whip-vertical-right';}
   whip(out,-1,la,lid,visibility);whip(out,1,ra,rid,visibility);
   for(const side of [-1,1])chips(out,'whip-dig-'+side,worldPoint(out,out.pose.handPoint(side,[0,-.40,-.15])),t-1.18,6,.55);
  }
  out.beat=t<1.42?'Kolları toprağa saplama':t<2.38?'Taş kamçıları çekme':t<3.18?'Sol kamçı → sağ şerit · EĞİL':t<4.1?'Sağ kamçı → sol şerit · EĞİL':t<5.52?'Karşı dış şeritlere alçak çapraz süpürme · ZIPLA':t<6.35?'En yüksek noktaya yükleme':t<7?'Tepeden karşı dış şeritlere darbe':'Kamçıları bırakma';
 }
 // Cut the rendered solid at the native player plane. Every contact circle is
 // inset from every edge of that convex slice, including the oblique end cap.
 function beamSliceCircles(out,p,h){const tr=propTransform(out,p),plane=-out.actorRoot.z/DEPTH,points=[],cross2=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  for(const face of mesh(p.kind)){const verts=face.map(tr);for(let i=0;i<verts.length;i++){const a=verts[i],b=verts[(i+1)%verts.length],az=a[2]-plane,bz=b[2]-plane;
   if(Math.abs(az)<1e-9)points.push(projectPoint(out,a));
   if(az*bz<0)points.push(projectPoint(out,lerp3(a,b,-az/(bz-az))));
  }}
  points.sort((a,b)=>a.x-b.x||a.y-b.y);const unique=points.filter((p,i)=>!i||Math.hypot(p.x-points[i-1].x,p.y-points[i-1].y)>1e-7),hull=[];
  for(const p of unique){while(hull.length>1&&cross2(hull[hull.length-2],hull[hull.length-1],p)<=1e-7)hull.pop();hull.push(p);}
  const lower=hull.length;for(let i=unique.length-2;i>=0;i--){const p=unique[i];while(hull.length>lower&&cross2(hull[hull.length-2],hull[hull.length-1],p)<=1e-7)hull.pop();hull.push(p);}hull.pop();
  if(hull.length<3){h.active=false;return;}
  const top=Math.min(...hull.map(p=>p.y)),bottom=Math.max(...hull.map(p=>p.y)),count=11;
  // Fixed, ordered samples preserve primitive identity throughout the hold.
  for(let i=0;i<count;i++){const y=mix(top,bottom,(i+.5)/count);let left=Infinity,right=-Infinity;
   for(let j=0;j<hull.length;j++){const a=hull[j],b=hull[(j+1)%hull.length];if((a.y<=y&&b.y>y)||(b.y<=y&&a.y>y)){const x=mix(a.x,b.x,(y-a.y)/(b.y-a.y));left=Math.min(left,x);right=Math.max(right,x);}}
   const at={x:(left+right)*.5,y};let radius=p.w*.5;
   for(let j=0;j<hull.length;j++){const a=hull[j],b=hull[(j+1)%hull.length];radius=Math.min(radius,cross2(a,b,at)/Math.hypot(b.x-a.x,b.y-a.y)-.45);}
   if(radius>0)circle(h,at,radius,{kind:'beam',lane:p.beamLane,propId:p.id,sliceDepth:0,sample:i});
  }h.active=h.primitives.length>0;
 }
 function beam(out){const t=out.clip,v=out.variant,mouth=out.pose.mouthPoint?out.pose.mouthPoint():out.pose.head([0,4.45,-.76]);
  // The mouth is the complete warning: a small focused emitter, not a floor
  // reticle. The flash and ray keep the same saturated blue material identity.
  if(t>=1.20&&t<3.30){const charge=ramp(t,1.20,1.95)*(1-ramp(t,3.18,3.30)),flash=1-ramp(t,2.28,2.39),firing=t>=2.28?flash:0,
   size=(18+8*firing)*charge,world=worldPoint(out,mouth);rock(out,'mouth-core',world,size,size*.76,size*.76,'energy',{mat:'#31d6ff'});}
  if(t>=2.28&&t<3.30){const grow=ramp(t,2.28,2.38),fade=1-ramp(t,3.18,3.30);
   for(const lane of v.beamLanes){
    // Aim through the real native player plane, then extend beyond it. This
    // keeps the visible center and contact slice exactly at height 60 / z 0.
    const aim=localPoint(out,{lane,height:60,z:0}),past=1+2/Math.max(.1,worldPoint(out,mouth).z),end=lerp3(mouth,aim,past),to=lerp3(mouth,end,grow),center=lerp3(mouth,to,.5),world=worldPoint(out,center),
     p=rock(out,'beam-'+lane,world,12*fade,Math.hypot(...sub(to,mouth))*UNIT,12*fade,'beam',{segment:[mouth,to],mat:'#087df7',beamLane:lane,aimHeight:60}),
     h=hazard(out,'beam-hit-'+lane,t>=2.38&&t<3.18);if(h.active)beamSliceCircles(out,p,h);
   }
  }out.beat=t<1.45?'Ağız açılıyor':t<2.28?'Odaklı mavi çekirdek':t<3.18?'İnce yemin ışını':'Sönüş ve toparlanma';
 }
 const samplers=[fist,boulder,pillars,whips,beam];
 function sample(index,t,out,ctx){out.hazards??=[];out.props??=[];out.cues??=[];out.hazards.length=out.props.length=out.cues.length=0;out._pool??={props:[],hazards:[],cues:[]};out._used??={};out._used.props=out._used.hazards=out._used.cues=0;
  Object.assign(out,samplePose(t,ctx,index));out.track='moveset';out._propFacesTime=null;out.armBeamEmitters=null;samplers[index](out);return out;}
 const IDS=['fist-eruption','splitting-boulder','twin-pillars','stone-whips','maw-beam'],NAMES=['KOL / MERMİ','KIRILAN KAYA','İKİ SÜTUN','TAŞ KAMÇILAR','YEMİN IŞINI'],DURATIONS=[8.9,6.3,7.0,9.8,5.4];
 const recipes=Object.freeze(IDS.map((id,index)=>Object.freeze({id,name:NAMES[index],duration:DURATIONS[index],markers:markers[index],sample:(t,out,ctx)=>sample(index,t,out,ctx)})));
 const meshCache=new Map();
 function mesh(kind){if(meshCache.has(kind))return meshCache.get(kind);
  if(kind==='beam'){
   // Parallel octagonal rings form a ray with fixed thickness. Do not reuse
   // the expanding rock prism: that reads as a broad mouth-to-floor fan.
   const ring=[[-.3,-.5],[.3,-.5],[.5,-.3],[.5,.3],[.3,.5],[-.3,.5],[-.5,.3],[-.5,-.3]],
    rings=[-.5,.5].map(y=>ring.map(([x,z])=>[x,y,z])),faces=[[...rings[0]].reverse(),rings[1]];
   for(let i=0;i<8;i++)faces.push([rings[0][i],rings[0][(i+1)%8],rings[1][(i+1)%8],rings[1][i]]);meshCache.set(kind,faces);return faces;
  }
  if(kind==='half-left'||kind==='half-right'){
   const side=kind==='half-left'?-1:1,faces=[];for(const poly of mesh('rock')){const clipped=[];
    for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],inside=a[0]*side>=-1e-9,next=b[0]*side>=-1e-9;if(inside)clipped.push(a);if(inside!==next)clipped.push(lerp3(a,b,-a[0]/(b[0]-a[0])));}
    if(clipped.length>=3)faces.push(clipped.map(v=>[v[0]-side*.25,v[1],v[2]]));}
   faces.push([[0,-.46,-.31],[0,-.46,.31],[0,0,.5],[0,.46,.33],[0,.46,-.33],[0,0,-.5]].map(v=>[v[0]-side*.25,v[1],v[2]]));meshCache.set(kind,faces);return faces;
  }
  const cut=kind==='chip'?.24:.20,ring=[[-.5+cut,-.5],[.5-cut,-.5],[.5,-.5+cut],[.5,.5-cut],[.5-cut,.5],[-.5+cut,.5],[-.5,.5-cut],[-.5,-.5+cut]],bulky=kind==='rock'||kind==='chain'||kind==='chip',
   factors=bulky?(kind==='chain'?[[.53,-.5],[1,0],[.56,.5]]:[[.66,-.46],[1,0],[.72,.46]]):[[.83,-.5],[kind==='pillar'?.83:.94,.5]],
   rings=factors.map(([factor,y],j)=>ring.map(([x,z],i)=>[x*factor,y-(bulky&&j===2&&i===1?.07:0),z*factor])),faces=[[...rings[0]].reverse(),rings[rings.length-1]];
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<8;i++)faces.push([rings[j][i],rings[j][(i+1)%8],rings[j+1][(i+1)%8],rings[j+1][i]]);meshCache.set(kind,faces);return faces;}
 function propTransform(frame,p){const center=localPoint(frame,p.world),cy=Math.cos(p.yaw),sy=Math.sin(p.yaw),cr=Math.cos(p.roll),sr=Math.sin(p.roll);
  let axis,right,front;if(p.segment){axis=norm(sub(p.segment[1],p.segment[0]));right=norm(cross(Math.abs(axis[2])>.9?[0,1,0]:[0,0,1],axis));front=norm(cross(right,axis));}
  return v=>{const x=v[0]*p.w/UNIT,y=v[1]*p.h/UNIT,z=v[2]*p.d/UNIT;if(axis)return add(center,add(mul(right,x),add(mul(axis,y),mul(front,z))));const X=x*cr-y*sr,Y=x*sr+y*cr;return add(center,[X*cy+z*sy,Y,-X*sy+z*cy]);};
 }
 function propFaces(frame){if(frame._propFacesTime===frame.time)return frame._propFaces;const faces=frame._propFaces||(frame._propFaces=[]);faces.length=0;
  for(const p of frame.props){if(p.w<.1||p.h<.1)continue;const center=localPoint(frame,p.world),tr=propTransform(frame,p);
   for(const [faceIndex,f]of mesh(p.kind).entries()){let verts=f.map(tr),normal=norm(cross(sub(verts[1],verts[0]),sub(verts[2],verts[0])));if(dot(normal,sub(verts[0],center))<0){verts.reverse();normal=mul(normal,-1);}faces.push({v:verts,mat:p.kind==='beam'&&faceIndex<2?'#8cefff':p.mat,part:'moveset:'+p.id,solid:true,unlit:p.kind==='energy'||p.kind==='beam',triangles:Array.from({length:verts.length-2},(_,i)=>[0,i+1,i+2])});
    // The luminous core belongs on the visible beam shell. An opaque outer
    // volume cannot reveal another smaller opaque box hidden inside it.
    if(p.kind==='beam'&&f.length===4&&faceIndex>=2){for(const [width,col,lift]of [[.72,'#21cfff',.0005],[.30,'#b8f5ff',.001]]){const strip=[lerp3(f[0],f[1],.5-width*.5),lerp3(f[0],f[1],.5+width*.5),lerp3(f[3],f[2],.5+width*.5),lerp3(f[3],f[2],.5-width*.5)].map(v=>add(tr(v),mul(normal,lift)));if(dot(cross(sub(strip[1],strip[0]),sub(strip[2],strip[0])),normal)<0)strip.reverse();faces.push({v:strip,mat:col,part:'beam-surface-core',solid:true,unlit:true,triangles:[[0,1,2],[0,2,3]]});}}
   }
   if(p.crack>.01){const a=[[-.025,-.39],[.035,-.18],[-.035,.12],[.02,.39]].map(([x,y])=>[x,y,-.5*(1-.30*Math.abs(y)/.46)-.007]),verts=[...a.map(v=>tr([v[0]-.025*p.crack,v[1],v[2]])),...a.slice().reverse().map(v=>tr([v[0]+.025*p.crack,v[1],v[2]]))];faces.push({v:verts,mat:'dark',part:'stone-split-crack',solid:true,unlit:true,triangles:[[0,1,6],[0,6,7],[1,2,5],[1,5,6],[2,3,4],[2,4,5]]});}
  }frame._propFacesTime=frame.time;return faces;
 }
 function drawProps(){} // Prop meshes use the same depth passes as the actor.
 function drawShadows(g,frame){if(!frame?.pose)return;g.save();g.fillStyle='#101a20';
  for(const side of [-1,1]){const v=frame.pose.footPoint(side,[side*.88,0,-.25]),world=worldPoint(frame,[v[0],0,v[2]]),p=projectWorld(frame.ctx,{...world,height:0}),lift=Math.max(0,v[1])+(frame.actorRoot.height||0)/UNIT;g.globalAlpha=.24*(1-Math.min(.65,lift));g.beginPath();g.ellipse(p.x,p.y+2,.54*UNIT*p.s,.17*UNIT*p.s,0,0,Math.PI*2);g.fill();}
  for(const p of frame.props){if(p.kind==='beam'||p.kind==='energy')continue;const q=projectWorld(frame.ctx,{...p.world,height:0});g.globalAlpha=.16;g.beginPath();g.ellipse(q.x,q.y+1,p.w*p.s*.44,p.d*p.s*.12,0,0,Math.PI*2);g.fill();}g.restore();
 }
 return Object.freeze({recipes,neutral,markers,tracks,variantFor,clipTime,samplePose,newFrame,propFaces,drawProps,drawShadows,camera,cameraPosition,projectWorld,actorScale:ACTOR_SCALE,restLift:REST_LIFT,restDepthOffset:REST_DEPTH_OFFSET,worldUnit:UNIT,depthScale:DEPTH,perspectiveScale,projectPoint,worldPoint,localPoint,prepareFist,prepareWhips,meshStats:()=>({meshes:meshCache.size,maxMeshes:8})});
});
