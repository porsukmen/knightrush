/* A single bodily phrase: step / diagonal / backhand / slam / lift / throw.
 * Model, contacts and props share this clock and the native world projection.
 * Candidate blocking, deliberately separate from the retired floating patterns. */
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;else root.KROathkeeperPhysical=api;})(globalThis,root=>{
 'use strict';
 const Model=root.KROathkeeperModel||(typeof require==='function'?require('./oathkeeper-model.js'):null),
  Art=root.KROathkeeperSequences||(typeof require==='function'?require('./oathkeeper-sequences.js'):null);
 const DEPTH=4.5,UNIT=79.616,DURATION=13.2,clamp=t=>Math.max(0,Math.min(1,t)),mix=(a,b,t)=>a+(b-a)*t,
  ease=t=>{t=clamp(t);return t*t*(3-2*t);},ramp=(t,a,b)=>ease((t-a)/(b-a)),
  turn=(p,a)=>[p[0]*Math.cos(a)+p[2]*Math.sin(a),p[1],-p[0]*Math.sin(a)+p[2]*Math.cos(a)];
 const neutral={crouch:0,lean:.035,twist:0,shift:0,facing:0,left:[-2,1.63,-.18],right:[2,1.63,-.18],
  pitch:.05,leftPitch:.05,rightPitch:.05,grip:0,leftPole:[-.85,-.12,.48],rightPole:[.85,-.12,.48]};
 const k=(t,v)=>({t,v:{...neutral,...v}});
 const keys=[
  k(0,{}),k(.3,{crouch:-.22,shift:-.08,right:[1.9,2.15,.12]}),
  k(1.02,{crouch:-.30,lean:.04,twist:-.14,shift:-.06,left:[-1.9,1.95,-.28],right:[1.78,2.8,.3],grip:.8}),
  k(1.35,{crouch:-.20,lean:.06,twist:-.2,shift:-.10,left:[-1.8,2.15,-.32],right:[1.64,3.1,.38],grip:1}),
  k(1.9,{crouch:-.40,lean:-.11,twist:-.12,shift:-.10,left:[-1.7,2.3,-.35],right:[1.64,3.25,.34],grip:1}),
  k(2.22,{crouch:-.77,lean:-.38,twist:.14,shift:.12,left:[-1.9,2.4,-.15],right:[1.25,1.27,-2.05],rightPitch:-.2,grip:1}),
  k(2.54,{crouch:-.84,lean:-.38,twist:.26,shift:.16,left:[-1.8,2.55,-.20],right:[.20,1.10,-2.10],rightPitch:-.2,grip:1}),
  k(2.9,{crouch:-.70,lean:-.28,twist:.30,shift:.18,left:[-1.85,2.8,-.32],right:[.36,1.24,-1.55],grip:1}),
  k(3.35,{crouch:-.61,lean:-.23,twist:.25,shift:.12,left:[-1.92,2.82,-.5],right:[1.50,1.70,-.76],leftPitch:.1,grip:1}),
  k(3.72,{crouch:-.74,lean:-.38,twist:-.08,shift:-.11,left:[-1.25,1.75,-2.12],right:[1.9,2.3,-.2],leftPitch:-.30,grip:1}),
  k(4.12,{crouch:-.76,lean:-.40,twist:-.27,shift:-.16,left:[-.17,1.74,-2.14],right:[1.8,2.75,-.3],leftPitch:-.30,grip:1}),
  k(4.45,{crouch:-.59,lean:-.23,twist:-.19,shift:-.1,left:[-.45,2.0,-1.30],right:[1.90,3.45,-.55],grip:1}),
  k(4.82,{crouch:-.37,lean:-.10,left:[-2.05,3.70,-1.0],right:[2.05,3.70,-1.0],leftPitch:1.4,rightPitch:1.4,grip:1,leftPole:[-1,0,.6],rightPole:[1,0,.6]}),
  k(5.12,{crouch:-.22,lean:.05,left:[-1.70,4.75,-.75],right:[1.70,4.75,-.75],leftPitch:2.5,rightPitch:2.5,grip:1,leftPole:[-1,0,.6],rightPole:[1,0,.6]}),
  k(5.40,{crouch:-.26,lean:.02,left:[-1.70,4.72,-.75],right:[1.70,4.72,-.75],leftPitch:2.5,rightPitch:2.5,grip:1,leftPole:[-1,0,.6],rightPole:[1,0,.6]}),
  k(5.57,{crouch:-.77,lean:-.29,left:[-1.62,2.38,-1.68],right:[1.62,2.38,-1.68],leftPitch:.6,rightPitch:.6,grip:1,leftPole:[-1,0,.6],rightPole:[1,0,.6]}),
  k(5.76,{crouch:-1.18,lean:-.38,left:[-.95,.555,-1.45],right:[.95,.555,-1.45],leftPitch:0,rightPitch:0,grip:1}),
  k(6.04,{crouch:-1.18,lean:-.38,left:[-.95,.555,-1.45],right:[.95,.555,-1.45],leftPitch:0,rightPitch:0,grip:1}),
  k(6.6,{crouch:-1.10,lean:-.31,twist:-.10,shift:.1,left:[-1.65,1.0,-.65],right:[1.03,.90,-1.40],rightPitch:0,grip:.25}),
  k(7.0,{crouch:-1.14,lean:-.33,twist:-.10,shift:.1,left:[-1.65,1.12,-.65],right:[1.03,.70,-1.40],rightPitch:0,grip:1}),
  k(7.68,{crouch:-.56,lean:-.08,twist:-.19,shift:-.1,left:[-1.78,2.1,-.6],right:[1.5,2.5,-1.0],rightPitch:.8,grip:1}),
  k(8.24,{crouch:-.25,lean:.08,twist:-.25,shift:-.13,left:[-1.9,2.0,-.4],right:[1.55,4.6,.20],rightPitch:2.35,grip:1,rightPole:[.8,0,1.0]}),
  k(8.48,{crouch:-.25,lean:.08,twist:-.25,shift:-.13,left:[-1.9,2.0,-.4],right:[1.55,4.6,.20],rightPitch:2.35,grip:1,rightPole:[.8,0,1.0]}),
  k(8.88,{crouch:-.73,lean:-.33,twist:.22,shift:.14,left:[-1.9,2.2,-.25],right:[.95,2.45,-1.50],rightPitch:.05,grip:1}),
  k(9.2,{crouch:-.78,lean:-.35,twist:.28,shift:.15,left:[-1.9,2.2,-.25],right:[.12,1.3,-1.68],rightPitch:.05,grip:0}),
  k(10.0,{crouch:-.45,lean:-.13,twist:.14,shift:.07,left:[-1.9,1.65,-.4],right:[1.65,1.34,-.65]}),
  k(10.5,{crouch:-.20,lean:0,left:[-1.96,1.6,-.25],right:[1.98,1.6,-.25]}),
  k(12.65,{crouch:-.20,lean:0,left:[-1.96,1.6,-.25],right:[1.98,1.6,-.25]}),k(12.95,{}),k(DURATION,{})
 ];
 // Shape-preserving Hermite: no floor overshoot; coherent velocity at breakdowns.
 function motionAt(t,out={}){
  let i=0;while(i<keys.length-2&&t>keys[i+1].t)i++;
  const u=clamp((t-keys[i].t)/(keys[i+1].t-keys[i].t)),u2=u*u,u3=u2*u,dt=keys[i+1].t-keys[i].t;
  const sample=(name,c)=>{const val=j=>c===undefined?keys[j].v[name]:keys[j].v[name][c],tangent=j=>{if(j===0||j===keys.length-1)return 0;const a=(val(j)-val(j-1))/(keys[j].t-keys[j-1].t),b=(val(j+1)-val(j))/(keys[j+1].t-keys[j].t);return a*b<=0?0:2*a*b/(a+b);};
   return (2*u3-3*u2+1)*val(i)+(u3-2*u2+u)*dt*tangent(i)+(-2*u3+3*u2)*val(i+1)+(u3-u2)*dt*tangent(i+1);};
  for(const n of Object.keys(neutral)){if(Array.isArray(neutral[n])){out[n]??=[];for(let c=0;c<3;c++)out[n][c]=sample(n,c);}else out[n]=sample(n);}
  return out;
 }
 // Two visible steps in and two out. Ground-space support targets do not move
 // with the root; swing soles lift before translating and land before transfer.
 function locomotion(t,ctx,m){
  const start=Number.isFinite(ctx.startActorZ)?ctx.startActorZ:14,near=9,
   first=ramp(t,.30,.92),second=ramp(t,1.02,1.65),out1=ramp(t,10.6,11.5),out2=ramp(t,11.65,12.65),
   travel=(start-near)*(.5*first+.5*second-.5*out1-.5*out2),z=start-travel;
  const steps=[{side:1,a:.30,b:.92,from:0,to:start-near},{side:-1,a:1.02,b:1.65,from:0,to:start-near},
   {side:-1,a:10.6,b:11.5,from:start-near,to:0},{side:1,a:11.65,b:12.65,from:start-near,to:0}];
  for(const side of [-1,1]){
   let progress=0,lift=0;for(const step of steps)if(step.side===side&&t>=step.a){const u=clamp((t-step.a)/(step.b-step.a));progress=mix(step.from,step.to,ease(u));lift=.24*Math.sin(Math.PI*u)**2;}
   const world=[side*.87,.33+lift,(travel-progress)/DEPTH-.02],local=turn(world,-m.facing),name=side<0?'leftFoot':'rightFoot';m[name]=local;m[name+'Yaw']=-m.facing;
  }
  return {x:1,z};
 }
 // Native proj.s is an artistic SPRITE scale, not a vertex camera. The native
 // ground curve itself is a pinhole: y=204.8+429.2*(14/(14+z)). Keep that ground
 // exactly, with one reciprocal camera scale for every vertex and contact.
 const perspectiveScale=z=>14/(14+Math.max(z,-10.92));
 function projectPoint(frame,v){const z=frame.actorRoot.z+v[2]*DEPTH,q=frame.ctx.project(frame.actorRoot.x,0,z),s=perspectiveScale(z);return {x:q.x+v[0]*UNIT*s,y:q.y-v[1]*UNIT*s,s,depth:z};}
 function worldPoint(frame,v){const z=frame.actorRoot.z+v[2]*DEPTH,q=frame.ctx.project(frame.actorRoot.x,0,z),next=frame.ctx.project(frame.actorRoot.x+1,0,z),s=perspectiveScale(z);return {lane:frame.actorRoot.x+v[0]*UNIT*s/(next.x-q.x),height:v[1]*UNIT,z};}
 function newFrame(){return {hazards:[],props:[],cues:[],motion:{},actorRoot:null};}
 function pool(out,kind){const i=out._used[kind]++;return out._pool[kind][i]||(out._pool[kind][i]={});}
 function hazard(out,id,active,parryable=false){const h=pool(out,'hazards');Object.assign(h,{id,active,parryable,hitText:'The oathkeeper found you'});h.primitives??=[];h.primitives.length=0;out.hazards.push(h);return h;}
 function circle(h,p,r,source){h._pool??=[];const i=h.primitives.length,q=h._pool[i]||(h._pool[i]={});Object.assign(q,{x:p.x,y:p.y,r,source});h.primitives.push(q);}
 function limb(out,id,side,from,to){
  const h=hazard(out,id,out.time>=from&&out.time<=to,true);if(!h.active)return;
  // Each circle lies inside the visible palm/knuckles, not an arbitrary lane.
  for(const x of [-.28,0,.28]){const local=[x,-.28,-.23],v=out.pose.handPoint(side,local),p=projectPoint(out,v);
   if(p.depth<1.0&&p.depth>-.85)circle(h,p,.195*UNIT*p.s,{kind:'hand',side,local,point:v,depth:p.depth});}
  h.active=h.primitives.length>0;
 }
 function prop(out,id,kind,world,w,h,d,alpha=1){const q=out.ctx.project(world.lane,0,world.z),s=perspectiveScale(world.z),p=pool(out,'props');Object.assign(p,{id,kind,x:q.x,y:q.y-world.height*s,s,depth:world.z,w,h,d,roll:0,yaw:.12,alpha,variant:0,world});out.props.push(p);return p;}
 function cue(out,id,points,tone='ground',alpha=.6){const q=pool(out,'cues');Object.assign(q,{id,points,tone,alpha,width:2});out.cues.push(q);}
 function samplePose(t,ctx){const m=motionAt(t),actorRoot=locomotion(t,ctx,m),pose=Model.pose(7,{id:'physical-chain',time:t,motionOverride:m});return {ctx,motion:m,actorRoot,pose};}
 const markers=Object.freeze({approachEnd:1.65,diagonal:[2.12,2.72],backhand:[3.60,4.32],slamContact:5.76,waveContact:6.43,pickup:7.0,aimLock:8.48,release:8.88,throwContact:9.50,recoveryStart:10.5,recoveryEnd:DURATION,propId:'court-fragment'});
 function sample(t,out,ctx){
  out.hazards??=[];out.props??=[];out.cues??=[];out.hazards.length=out.props.length=out.cues.length=0;
  out._pool??={props:[],hazards:[],cues:[]};out._used??={};out._used.props=out._used.hazards=out._used.cues=0;
  out.time=t;out.ctx=ctx;out._propFacesTime=null;out.motion=motionAt(t,out.motion||{});out.actorRoot=locomotion(t,ctx,out.motion);
  out.pose=Model.pose(7,{id:'physical-chain',time:t,motionOverride:out.motion});out.track='physical';
  out.beat=t<1.65?'Yaklaşma':t<3?'Çapraz yumruk':t<4.5?'Ters kol':t<6.6?'Çift elle darbe':t<8.88?'Kavrama ve atış':'Toparlanma';
  limb(out,'diagonal-fist',1,...markers.diagonal);limb(out,'return-backhand',-1,...markers.backhand);
  if(t>=5.76&&t<=6.80){
   const z=mix(2.48,-1.1,clamp((t-5.76)/.96)),h=hazard(out,'slam-ground-front',Math.abs(z)<.72,false);
   for(let i=0;i<13;i++){const lane=-.35+i*.225,p=prop(out,'ground:'+i,'ridge',{lane,height:7,z},37,24,25,1-ramp(t,6.65,6.80));if(h.active)circle(h,p,10.2*p.s,{kind:'ground',lane,z});}
  }
  // The fragment exists at the hand's eventual pickup location from impact on.
  // There is no offscreen spawn, levitation, return pass, or flight retargeting.
  if(t>=5.76&&t<10.12){
   const pickup=samplePose(markers.pickup,ctx),gripLocal=[0,25/UNIT-.70,-.16],ground=worldPoint(pickup,pickup.pose.handPoint(1,gripLocal));
   let world=ground,held=false;
   if(t>=markers.pickup&&t<=markers.release){world=worldPoint(out,out.pose.handPoint(1,gripLocal));held=true;}
   if(t>markers.release){const released=samplePose(markers.release,ctx),from=worldPoint(released,released.pose.handPoint(1,gripLocal)),age=t-markers.release,u=age/(markers.throwContact-markers.release),target=Number.isFinite(ctx.startLane)?ctx.startLane:1;
    world={lane:mix(from.lane,target,u),height:from.height+(54-from.height)*u+44*4*u*(1-u),z:mix(from.z,0,u)};
   }
   const p=prop(out,markers.propId,'slab',world,73,50,52,1-ramp(t,9.84,10.12));p.held=held;p.gripLocal=gripLocal;
   const h=hazard(out,'thrown-fragment',t>markers.release&&Math.abs(world.z)<.75&&t<9.72,true);
   if(h.active)for(const x of [-16,0,16])circle(h,{x:p.x+x*p.s,y:p.y},19*p.s,{kind:'fragment',offset:x,world});
   if(t>=markers.aimLock&&t<markers.release){const target=ctx.project(ctx.startLane??1,54,0);cue(out,'throw-aim',[[p.x,p.y],[target.x,target.y]],'seal',.5);}
  }
  if(t>=4.85&&t<5.76){const a=ctx.project(-.2,0,0),b=ctx.project(2.2,0,0);cue(out,'slam-cue',[[a.x,a.y],[b.x,b.y]],'ground',.25+.45*ramp(t,4.85,5.5));}
  return out;
 }
 // Held and released masonry uses the SAME depth buffer as the articulated
 // hands. Screen-space stickers cannot preserve the palm/finger occlusion.
 function propFaces(frame){
  if(frame._propFacesTime===frame.time)return frame._propFaces;
  const faces=frame._propFaces||(frame._propFaces=[]);faces.length=0;
  const triangleFan=n=>Array.from({length:n-2},(_,i)=>[0,i+1,i+2]);
  for(const p of frame.props){
   const centerQ=frame.ctx.project(p.world.lane,0,p.world.z),rootQ=frame.ctx.project(frame.actorRoot.x,0,p.world.z),
    center=[(centerQ.x-rootQ.x)/(UNIT*perspectiveScale(p.world.z)),p.world.height/UNIT,(p.world.z-frame.actorRoot.z)/DEPTH];
   let heldPose=null,anchor=null;
   if(p.id===markers.propId){heldPose=p.held?frame.pose:samplePose(frame.time<markers.pickup?markers.pickup:markers.release,frame.ctx).pose;anchor=heldPose.handPoint(1,p.gripLocal);}
   const transform=v=>{const delta=[v[0]*p.w/UNIT,v[1]*p.h/UNIT,v[2]*p.d/UNIT];
    if(heldPose){const at=heldPose.handPoint(1,p.gripLocal.map((x,i)=>x+delta[i]));return center.map((x,i)=>x+at[i]-anchor[i]);}
    const d=turn(delta,p.yaw);return center.map((x,i)=>x+d[i]);};
   for(const f of Art.mesh(p.kind,0)){
    let v=f.v.map(transform);const a=v[1].map((x,i)=>x-v[0][i]),b=v[2].map((x,i)=>x-v[0][i]),normal=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    if(normal.reduce((sum,x,i)=>sum+x*(v[0][i]-center[i]),0)<0)v.reverse();
    faces.push({v,mat:p.kind==='ridge'?'old':'boulder',part:'physical-prop:'+p.id,solid:true,triangles:triangleFan(v.length)});
   }
   if(p.kind==='slab')for(const [rect,color]of [[[-.27,.21,.27,-.21],'#263f45'],[[-.035,.14,.035,-.14],'#b7c097'],[[-.14,.04,.14,-.025],'#b7c097']]){
    const [l,t,r,b]=rect,z=color==='#263f45'?-.507:-.516,v=[[l,b,z],[l,t,z],[r,t,z],[r,b,z]].map(transform);
    faces.push({v,mat:color,unlit:true,part:'physical-seal',solid:true,triangles:[[0,1,2],[0,2,3]]});
   }
  }
  frame._propFacesTime=frame.time;return faces;
 }
 function drawShadows(g,frame){if(!frame?.pose)return;g.save();g.fillStyle='#101a20';
  for(const side of [-1,1]){const v=frame.pose.footPoint(side,[side*.88,0,-.25]),p=projectPoint(frame,[v[0],0,v[2]]),lift=Math.max(0,v[1]);
   g.globalAlpha=.24*(1-Math.min(.65,lift));g.beginPath();g.ellipse(p.x,p.y+2,.54*UNIT*p.s,.17*UNIT*p.s,0,0,Math.PI*2);g.fill();}
  for(const p of frame.props){const q=frame.ctx.project(p.world.lane,0,p.depth);g.globalAlpha=.16;g.beginPath();g.ellipse(q.x,q.y+1,p.w*p.s*.44,p.d*p.s*.12,0,0,Math.PI*2);g.fill();}g.restore();
 }
 function drawProps(g,pass,frame){const view=frame._cueView||(frame._cueView={props:[]});view.ctx=frame.ctx;view.cues=frame.cues;Art.draw(g,pass,view);}
 const recipes=Object.freeze([{id:'weight-of-the-oath',name:'YEMİNİN AĞIRLIĞI',duration:DURATION,sample}]);
 return Object.freeze({recipes,neutral,keys,markers,duration:DURATION,depthScale:DEPTH,worldUnit:UNIT,perspectiveScale,motionAt,locomotion,projectPoint,worldPoint,samplePose,newFrame,propFaces,drawShadows,drawProps});
});
