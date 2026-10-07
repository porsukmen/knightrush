/* Opt-in v9: sampled authored bone motion; shared native meshes and contacts. */
(()=>{'use strict';
 const base=new URL('../art-source/blender/guardian-command-timing-v9/',document.currentScript.src);
 const keys=['body','torso','leftShoulder','rightShoulder','head','cape','weapon','hand','upper','forearm','fingers','leg0_thigh','leg0_shin','leg0_foot','leg1_thigh','leg1_shin','leg1_foot'];
 let data;const sourceDuration=24.25,fps=60,stride=keys.length*7;
 // Explicit authored/game clocks: shorten holds, not the mounted action clips.
 // Measured unwrapped torso headings from the unchanged baked turn. Retiming
 // by angle removes its long mid-turn crawl; retain only a 6% central time bias.
 const turnHeadings=[[4.7,-17.22],[4.8,-.25],[4.9,16.75],[5,33.27],[5.1,49.26],[5.2,64.64],[5.3,79.38],[5.4,93.42],[5.5,106.72],[5.6,119.25],[5.7,131],[5.8,141.99],[5.9,158.72],[6,183.53],[6.1,207.9],[6.2,231.61],[6.3,254.44],[6.4,276.34],[6.5,298.23],[6.6,321.43],[6.7,341.88],[6.8,353.5],[6.85,353.5]];
 const turnStart=3+(4.7-4.48)*.2/(5.05-4.48),turnClock=turnHeadings.map(([t,a])=>{if(t===6.85)return[t,4.2];const u=.97*(a+17.22)/370.72+.03*(t-4.7)/2.1,f=u-.06*Math.sin(2*Math.PI*u)/(2*Math.PI);return[t,turnStart+(4.15-turnStart)*f];});
 const baseClock=[[0,0],[2.24,1.1],[4.48,3],...turnClock,...[[8.6,6],[9.21,6.15],[10.9,7.65],[12.1,8.3],[13.7,9],[14.78,9.95],[16.25,11],[16.8,11.15],[17.65,11.95],[18.45,12.2],[23.7,16.7],[24.25,17.1]].map(([a,g])=>[a,g-.5])];
 const interpolateClock=(table,t,from,to)=>{t=Math.max(0,Math.min(table.at(-1)[from],t));const i=Math.max(1,table.findIndex(k=>k[from]>=t)),a=table[i-1],b=table[i];return a[to]+(b[to]-a[to])*(t-a[from])/(b[from]-a[from]);};
 // Give only the downward cuts 15% more time. Keep the faster spin and all
 // jump/action clocks intact; reserve one harmless second to shoulder the sword.
 const downstrokes=[[3.8,4.48],...Array.from({length:5},(_,i)=>[18.83+i*1.05,19.47+i*1.05])],extensions=downstrokes.map(([a,b])=>[a,b,.15*(interpolateClock(baseClock,b,0,1)-interpolateClock(baseClock,a,0,1))]);
 extensions.push([23.7,24.25,.6]);
 // Shorten only the standing recovery/dead hold before the command. The free
 // blade's own rise, sweep and recall retain their existing gameplay durations.
 for(const [a,b,seconds] of [[11.2,12.1,.3],[12.1,12.75,.04]])extensions.push([a,b,seconds-(interpolateClock(baseClock,b,0,1)-interpolateClock(baseClock,a,0,1))]);
 // Give each inter-strike lift a real recovery beat, without slowing the cuts.
 for(let i=1;i<5;i++)extensions.push([18.45+i*1.05,18.93+i*1.05,.4]);
 for(let i=0;i<5;i++)extensions.push([18.93+i*1.05,19.47+i*1.05,.54*(4.5/5.25)*1.15*(1/(1.32*1.3)-1)]);
 // The post-hop lift gets the same full recovery beat as the other lifts.
 // Its visible travel is redistributed below, so this does not extend a hold.
 extensions.push([18.1,18.83,.8242857142857143-(interpolateClock(baseClock,18.83,0,1)-interpolateClock(baseClock,18.1,0,1))]);
 // Match the first shoulder-to-overhead lift to the closing lift's angular
 // speed: measured paths are .927197526 and 1.883435975 radians respectively.
 const openingLiftSeconds=.8242857142857143*.9271975256320445/1.8834359754798558;
 extensions.push([2.24,3.55,openingLiftSeconds-(interpolateClock(baseClock,3.55,0,1)-interpolateClock(baseClock,2.24,0,1))]);
 const clock=[...new Set([...baseClock.map(k=>k[0]),...extensions.flatMap(k=>k.slice(0,2)),23.98])].sort((a,b)=>a-b).map(t=>[t,interpolateClock(baseClock,t,0,1)+extensions.reduce((sum,[a,b,extra])=>sum+extra*Math.max(0,Math.min(1,(t-a)/(b-a))),0)]);
 const mapClock=(t,from,to)=>interpolateClock(clock,t,from,to);
 const gameTime=t=>mapClock(t,0,1),authoredTime=t=>mapClock(t,1,0),duration=gameTime(sourceDuration);
 // Each semantic pass resolves once; recovery, lift and recall are harmless.
 // Preparation crossing the centre is harmless; the downward stab is contact 9.
 // Slot 2 remains the separately warned ground eruption.
 const sourceWindows=[[3.55,4.48],[6.35,6.85],[9.87,10.42],[14.15,14.78],...Array.from({length:5},(_,i)=>[18.45+i*1.05+.38,18.45+i*1.05+1.02]),[8.32,8.6]];
 const windows=sourceWindows.map(w=>w.map(gameTime));
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),smooth=(t,a,b)=>{const u=clamp((t-a)/(b-a));return u*u*u*(10+u*(-15+6*u));};
 const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(v,s)=>v.map(x=>x*s),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),unit=v=>mul(v,1/(Math.hypot(...v)||1)),mix=(a,b,u)=>add(mul(a,1-u),mul(b,u)),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 // v3 rebuilt these rest joints before v9 was authored (the earlier setup-v1
 // Blender armature had different elbow/hand anchors and is not this rig).
 const S=[-18.9,-70,0],E=[-19,-55.7,-1.5],W=[-2.8,-63.5,-13.5],HIP=[0,-43,0],G=[0,-55.8,-13.5],c=Math.cos(Math.PI/18),s=Math.sin(Math.PI/18);
 const upperKeys=keys.filter(k=>k!=='body'&&!k.startsWith('leg'));
 const shift=(b,d)=>({p:v=>add(b.p(v),d),n:b.n});
 const yawVector=(v,a)=>[v[0]*Math.cos(a)+v[2]*Math.sin(a),v[1],-v[0]*Math.sin(a)+v[2]*Math.cos(a)];
 function yawPose(p,a){if(Math.abs(a)<1e-10)return;const pivot=p.body.p(HIP);for(const k of upperKeys){const b=p[k];p[k]={p:v=>add(pivot,yawVector(sub(b.p(v),pivot),a)),n:v=>yawVector(b.n(v),a)};}}
 function align(a,b){a=unit(a);b=unit(b);const axis=cross(a,b),d=dot(a,b),q=unit([...axis,1+d]);return v=>{const t=mul(cross(q,v),2);return add(v,add(mul(t,q[3]),cross(q,t)));};}
 function segment(base,a,b,A,B){const rotate=align(base.n(sub(b,a)),sub(B,A)),n=v=>rotate(base.n(v));return {p:v=>add(A,n(sub(v,a))),n};}
 function transform(a,b,u){
  let dot=0;for(let j=3;j<7;j++)dot+=data[a+j]*data[b+j];const sign=dot<0?-1:1;dot=Math.abs(dot);
  let v=1-u,w=u;if(dot<.9995){const angle=Math.acos(Math.min(1,dot)),sn=Math.sin(angle);v=Math.sin((1-u)*angle)/sn;w=Math.sin(u*angle)/sn;}w*=sign;
  let x=data[a+3]*v+data[b+3]*w,y=data[a+4]*v+data[b+4]*w,z=data[a+5]*v+data[b+5]*w,q=data[a+6]*v+data[b+6]*w;
  const norm=Math.hypot(x,y,z,q);x/=norm;y/=norm;z/=norm;q/=norm;
  const o=[0,1,2].map(j=>data[a+j]*(1-u)+data[b+j]*u),X=[1-2*(y*y+z*z),2*(x*y+z*q),2*(x*z-y*q)],Y=[2*(x*y-z*q),1-2*(x*x+z*z),2*(y*z+x*q)],Z=[2*(x*z+y*q),2*(y*z-x*q),1-2*(x*x+y*y)];
  const n=p=>[X[0]*p[0]+Y[0]*p[1]+Z[0]*p[2],X[1]*p[0]+Y[1]*p[1]+Z[1]*p[2],X[2]*p[0]+Y[2]*p[1]+Z[2]*p[2]];
  return{p:p=>n(p).map((v,i)=>v+o[i]),n,basis:[o,X,Y,Z]};
 }
 function raw(t){
  if(!data)throw Error('Guardian v9 motion is not prepared');
  t=Math.max(0,Math.min(sourceDuration,t));const f=t*fps,a=Math.floor(f),b=Math.min(1455,a+1),u=f-a,p={time:t,phase:'blender-v9',editorIssues:[]};
  keys.forEach((key,i)=>p[key]=transform(a*stride+i*7,b*stride+i*7,u));
  return p;
 }
 function metadata(p){
  p.legs=[-1,1].map((side,i)=>{const thigh=p[`leg${i}_thigh`],shin=p[`leg${i}_shin`],foot=p[`leg${i}_foot`],ankle=foot.p([side*6.5,-2,0]);return{side,hip:thigh.p([side*6.5,-43,0]),knee:shin.p([side*6.5,-26,0]),ankle,footLift:Math.max(0,-2-ankle[1]),footYaw:0,thigh,shin,foot};});
  p.shoulder=p.upper.p(S);p.elbow=p.forearm.p(E);p.wrist=p.hand.p(W);p.grip=p.weapon.p(G);p.weaponDirection=p.weapon.n([0,1,0]);
  const fy=p.fingers.n([0,1,0]),hy=p.hand.n([0,1,0]),hz=p.hand.n([0,0,1]);p.grab=Math.atan2(fy.reduce((s,v,i)=>s+v*hz[i],0),fy.reduce((s,v,i)=>s+v*hy[i],0))/1.05;
  return p;
 }
 let centeredDelta,aimAnchors,openingStance,landingDelta,stabEntry,strokeTravel,landingLiftTravel;
 function prepareCorrections(){
  // Land at the opening clip's actual distance. Only airborne horizontal travel
  // changes: jump height, torso pitch, legs and landing compression stay authored.
  openingStance=raw(3.55);const finalHip=raw(18.1).body.p(HIP),readyHip=openingStance.body.p(HIP);
  landingDelta=[readyHip[0]-finalHip[0],0,readyHip[2]-finalHip[2]];
  stabEntry=raw(8.3);
  const back=raw(12.1).body.p(HIP),x=back[0]*c+back[2]*s;centeredDelta=[-x*c,0,-x*s];
  aimAnchors=[4.18,6.62,4.18].map(t=>{const p=raw(t);return{hip:p.body.p(HIP),blade:p.weapon.p([0,-15,-13.5])};});
  // Parameterize the existing full-body path by visible travel, not by the
  // baked holds. Stop at the planted impact (4.05), before the second body sink.
  strokeTravel=[[3.55,0]];let previous=raw(3.55),distance=0;
  for(let i=1;i<=120;i++){const t=3.55+.5*i/120,p=raw(t);distance+=Math.max(.0001,Math.hypot(...sub(p.weapon.p(G),previous.weapon.p(G)))+2*Math.hypot(...sub(p.body.p(HIP),previous.body.p(HIP))));strokeTravel.push([t,distance]);previous=p;}
  for(const point of strokeTravel)point[1]/=distance;
  landingLiftTravel=[[18.1,0]];previous=landingStance(18.1);distance=0;
  for(let i=1;i<=180;i++){const t=18.1+.73*i/180,p=landingStance(t);distance+=Math.max(.0001,Math.hypot(...sub(p.weapon.p(G),previous.weapon.p(G)))+20*Math.hypot(...sub(p.weapon.n([0,1,0]),previous.weapon.n([0,1,0]))));landingLiftTravel.push([t,distance]);previous=p;}
  for(const point of landingLiftTravel)point[1]/=distance;
 }
 const strokeSource=u=>interpolateClock(strokeTravel,clamp(u),1,0);
 // Blend only the post-landing recovery; strikes reuse every opening bone.
 function blendRotation(a,b,u){const X=unit(mix(a.n([1,0,0]),b.n([1,0,0]),u)),z=mix(a.n([0,0,1]),b.n([0,0,1]),u),Y=unit(cross(z,X)),Z=cross(X,Y);return v=>add(add(mul(X,v[0]),mul(Y,v[1])),mul(Z,v[2]));}
 function landingStance(t){
  const p=raw(t),u=smooth(t,18.1,18.83),target=openingStance;
  for(const k of keys){const a=shift(p[k],landingDelta),b=target[k],anchor=k==='body'||upperKeys.includes(k)?HIP:[(k.startsWith('leg0')?-1:1)*6.5,-2,0],o=mix(a.p(anchor),b.p(anchor),u),n=blendRotation(a,b,u);p[k]={p:v=>add(o,n(sub(v,anchor))),n};}
  repairChains(p);return p;
 }
 function finalStance(p,t){
  if(t<=16.8)return;
  if(t>=23.7){
   // Recover along the same authored step, then lower the sword from overhead
   // onto its original shoulder rest. The final cached frame is this idle pose.
   const source=t<23.98?strokeSource(1-smooth(t,23.7,23.98)):3.55-(3.55-2.24)*smooth(t,23.98,24.25),target=raw(source);
   for(const k of keys)p[k]=target[k];p.repeatedOpeningTime=source;p.shoulderRecovery=true;return;
  }
  if(t>=18.83){
   const i=Math.min(4,Math.floor((t-18.45+1e-8)/1.05)),start=18.45+i*1.05,phase=t-start;
   // One uninterrupted, eased descent ends at the planted impact. The slower
   // return retraces that exact step with no rapid bottom-settle snap. All bones
   // share one travel parameter, keeping hips, feet, grip and blade together.
   const now=gameTime(t),top=gameTime(start+.48),source=phase<.48?(i===0?3.55:strokeSource(1-smooth(now,gameTime(start),top))):strokeSource(smooth(now,top,gameTime(start+1.02))),target=raw(source);
   for(const k of keys)p[k]=target[k];p.repeatedOpeningTime=source;return;
  }
  const delta=mul(landingDelta,smooth(t,16.8,17.65));for(const k of keys)p[k]=shift(p[k],delta);
  if(t<=18.1)return;
  const progress=smooth(gameTime(t),gameTime(18.1),gameTime(18.83)),source=interpolateClock(landingLiftTravel,progress,1,0),target=landingStance(source);
  for(const k of keys)p[k]=target[k];p.postJumpLiftSource=source;
 }
 // Fractional sampling of the baked world transforms can separate rotating
 // joint endpoints. Use the same fixed-chain reconstruction for the opening
 // and all five copies, without replacing the body or authored foot path.
 function repairChains(p,source){
  for(let i=0;i<2;i++){
   const side=i?1:-1,H=[side*6.5,-43,0],K=[side*6.5,-26,0],A=[side*6.5,-2,0],fk=`leg${i}_foot`,sk=`leg${i}_shin`,tk=`leg${i}_thigh`,ankle=p[fk].p(A),hip=p.body.p(H),v=sub(ankle,hip),d=Math.hypot(...v),axis=unit(v),along=(17*17-24*24+d*d)/(2*d),height=Math.sqrt(Math.max(0,17*17-along*along)),pole=sub(p[sk].p(K),hip),bend=unit(sub(pole,mul(axis,dot(pole,axis)))),knee=add(hip,add(mul(axis,along),mul(bend,height)));
   p[tk]=segment(p[tk],H,K,hip,knee);p[sk]=segment(p[sk],K,A,knee,ankle);
  }
  const shoulder=p.leftShoulder.p(S),l1=Math.hypot(...sub(E,S)),l2=Math.hypot(...sub(W,E));let wrist=p.hand.p(W),v=sub(wrist,shoulder),d=Math.hypot(...v);
  // The baked world-space wrist path briefly collapses from ~36 to ~26 units
  // between extended-arm keys. Rebuild a continuous reach before solving IK.
  const stableWeight=Number.isFinite(source)?smooth(source,3.8,3.9)*(1-smooth(source,4.05,4.4)):0,targetDistance=Math.min(l1+l2-.001,d+(l1+l2-.12-d)*stableWeight);
  if(Math.abs(targetDistance-d)>1e-9){const delta=mul(v,targetDistance/d-1);for(const k of ['hand','weapon','fingers'])p[k]=shift(p[k],delta);wrist=p.hand.p(W);v=sub(wrist,shoulder);d=Math.hypot(...v);}
  const axis=unit(v),along=(l1*l1-l2*l2+d*d)/(2*d),pole=sub(p.forearm.p(E),shoulder);
  let bend=unit(sub(pole,mul(axis,dot(pole,axis))));
  // Interpolated baked elbow transforms cross the straight-arm singularity
  // around source 3.93. Keep one outward bend plane through that moving arc;
  // blend back only near its almost-straight endpoints, never from frame history.
  if(Number.isFinite(source)){
   const outward=p.torso.n([-1,0,-.35]),stable=unit(sub(outward,mul(axis,dot(outward,axis))));
   bend=unit(mix(bend,stable,stableWeight));
  }
  const elbow=add(shoulder,add(mul(axis,along),mul(bend,Math.sqrt(Math.max(0,l1*l1-along*along)))));
  p.upper=segment(p.upper,S,E,shoulder,elbow);p.forearm=segment(p.forearm,E,W,elbow,wrist);p.weapon=shift(p.weapon,sub(p.hand.p([0,-63.5,-13.5]),p.weapon.p(G)));
 }
 function swipeToStab(p,t,lane){
  if(t<=6.85||t>=8.3)return;
  const start=raw(6.85);yawPose(start,aim(lane,1));const end=stabEntry,u=smooth(t,6.85,8.3),shoulder=p.leftShoulder.p(S),l1=Math.hypot(...sub(E,S)),l2=Math.hypot(...sub(W,E));
  let wrist=mix(start.hand.p(W),end.hand.p(W),u),v=sub(wrist,shoulder),d=Math.hypot(...v);
  if(d>l1+l2-.001){wrist=add(shoulder,mul(v,(l1+l2-.001)/d));v=sub(wrist,shoulder);d=Math.hypot(...v);}
  // One wrist path and one continuous elbow pole replace the old out/back route.
  const hn=blendRotation(start.hand,end.hand,u),endWrist=end.hand.p(W),axes=[[1,0,0],[0,1,0],[0,0,1]].map(v=>end.hand.n(v)),rotate=v=>hn(axes.map(a=>dot(v,a))),move=v=>add(wrist,rotate(sub(v,endWrist)));
  for(const k of ['hand','weapon','fingers']){const b=end[k];p[k]={p:v=>move(b.p(v)),n:v=>rotate(b.n(v))};}
  const axis=unit(v),along=(l1*l1-l2*l2+d*d)/(2*d),pole=mix(sub(start.forearm.p(E),start.leftShoulder.p(S)),sub(end.forearm.p(E),end.leftShoulder.p(S)),u),bend=unit(sub(pole,mul(axis,dot(pole,axis)))),elbow=add(shoulder,add(mul(axis,along),mul(bend,Math.sqrt(Math.max(0,l1*l1-along*along)))));
  p.upper=segment(p.upper,S,E,shoulder,elbow);p.forearm=segment(p.forearm,E,W,elbow,wrist);p.armReachError=Math.max(0,d-l1-l2);
 }
 function aim(lane,index){
  const {hip,blade}=aimAnchors[index],x=(1-clamp(lane,0,2))*30,z=-6/.065,target=[x*c-z*s,0,x*s+z*c];
  let a=Math.atan2(target[0]-hip[0],target[2]-hip[2])-Math.atan2(blade[0]-hip[0],blade[2]-hip[2]);
  while(a>Math.PI)a-=Math.PI*2;while(a< -Math.PI)a+=Math.PI*2;return a;
 }
 function sample(t,ctx={}){
  const sequenceTime=t;const p=raw(authoredTime(t));t=p.time;
  // Change horizontal travel only while both feet are airborne. The resulting
  // centered stance is held through the command/recall; the forward hop joins
  // the original front stance. The released sword stays in world space.
  const centerWeight=smooth(t,10.1666666667,10.9)*(1-smooth(t,16.8,17.65));
  if(centerWeight){for(const k of keys)if(k!=='weapon')p[k]=shift(p[k],mul(centeredDelta,centerWeight));}
  const swordWeight=t<16.25?smooth(t,14.78,16.25):centerWeight;
  if(swordWeight)p.weapon=shift(p.weapon,mul(centeredDelta,swordWeight));
  // Keep the released blade's wind-up inside the left edge of the native view.
  // The C1 soft boundary rejoins the original sweep before it reaches lane 0.
  if(t>=13.35&&t<=14.5){
   const grip=p.weapon.p(G),lane=1-(grip[0]*c+grip[2]*s)/30,edge=-.4,e=.1,d=lane-edge,visibleLane=d<=-e?edge:d>=e?lane:edge+(d+e)*(d+e)/(4*e),dx=-30*(visibleLane-lane);
   if(dx)p.weapon=shift(p.weapon,[dx*c,0,dx*s]);
  }
  finalStance(p,t);
  if((t>=2.24&&t<=5.05)||p.repeatedOpeningTime!==undefined)repairChains(p,p.repeatedOpeningTime??t);
  const lane=clamp(Number.isFinite(ctx.playerLane)?ctx.playerLane:1,0,2),locks=ctx.guardianV9Targets||(ctx.guardianV9Targets={five:[]});
  if(t>=2.24&&locks.first===undefined)locks.first=lane;
  if(t>=5.05&&locks.swipe===undefined)locks.swipe=lane;
  if(t>=9.21&&locks.spike===undefined)locks.spike=lane;
  let yaw=0;
  if(t<8.3){const first=aim(locks.first??lane,0)*smooth(t,2.24,3.55),second=aim(locks.swipe??lane,1);yaw=mix([first],[second],smooth(t,5.05,6.35))[0]*(1-smooth(t,6.85,8.3));}
  if(t>=18.1){const i=Math.min(4,Math.max(0,Math.floor((t-18.45+1e-8)/1.05))),start=18.45+i*1.05;
   for(let k=0;k<=i;k++)if(t>=18.45+k*1.05&&locks.five[k]===undefined)locks.five[k]=lane;
   const previous=i?aim(locks.five[i-1]??lane,2):0,target=aim(locks.five[i]??lane,2);yaw=(previous+(target-previous)*smooth(t,i?start:18.1,start+.38))*(1-smooth(t,23.7,24.25));
  }
  yawPose(p,yaw);swipeToStab(p,t,locks.swipe??lane);p.targeting={first:locks.first,swipe:locks.swipe,spike:locks.spike,five:locks.five.slice(),yaw};
  // The previous smoke/ground-blade event uses the exact same native model,
  // projection and blade collider. This is separate from the physical stab.
  if(t>=9.21&&t<10.76){
   const target=locks.spike??lane,x=(1-target)*30,z=-6/.065,cx=x*c-z*s,cz=x*s+z*c;
   const height=22.14*smooth(t,9.87,10.21)*(1-smooth(t,10.42,10.76));
   p.centerSpike={p:v=>[cx+v[0],-height-v[1],cz-(v[2]+13.5)],n:v=>[v[0],-v[1],-v[2]]};
   const phase=clamp((t-9.21)/1.12);p.spike={height,lane:target,depth:0,tip:p.centerSpike.p([0,0,-13.5]),base:[cx,0,cz],start:9.87,end:10.21,smoke:{phase,opacity:phase>0&&phase<1?.25*Math.sin(Math.PI*phase)**2:0}};
  }
  p.authoredTime=t;p.time=sequenceTime;return metadata(p);
 }
 function loadMotion(){
  if(base.protocol!=='file:')return fetch(new URL('game-motion.bin',base)).then(r=>{if(!r.ok)throw Error('Guardian v9 motion: '+r.status);return r.arrayBuffer();});
  // Local HTML cannot fetch sibling binary files. A classic script can load
  // the exact same bytes without requiring a server or relaxed browser security.
  return new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src=new URL('game-motion-file.js',base).href;
   script.onload=()=>{try{
    const encoded=window.KRGuardianBlenderV9Motion;delete window.KRGuardianBlenderV9Motion;
    if(typeof encoded!=='string')throw Error('Guardian file motion unavailable');
    const raw=atob(encoded),bytes=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    resolve(bytes.buffer);
   }catch(error){reject(error);}finally{script.remove();}};
   script.onerror=()=>{script.remove();reject(Error('Guardian file motion could not load'));};
   document.head.appendChild(script);
  });
 }
 const ready=loadMotion().then(buffer=>{if(buffer.byteLength!==1456*stride*4)throw Error('Invalid v9 motion length');data=new Float32Array(buffer);prepareCorrections();return true;});
 window.KRGuardianBlenderV9=Object.freeze({ready,sample,raw:t=>metadata(raw(t)),aim,duration,windows,sourceWindows,authoredTime,gameTime,needsContact:(a,b)=>windows.some(([start,end])=>a<=end&&b>=start),stats:()=>({bytes:data?.byteLength||0,frames:1456,bones:keys.length,fps,revision:16})});
})();
