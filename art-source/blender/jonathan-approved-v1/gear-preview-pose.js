/* Angle-controlled joint landmarks for Gear Lab. Native Jonathan still paints
   every surface: this contains no replacement character/gear drawing or mesh.
   Gait timing, ankle roll, support extension and arm retargeting come from
   export-walk.py and walk-native.js, without their curved scene route. */
(()=>{'use strict';
 // Match the revised rock-side walk, not the short review-placeholder stride:
 // its steady middle contacts cover ~10.8 rig units per same-foot cycle.
 // Keep the authored .30s steps, contact timing and fixed six-unit bones.
 const TAU=Math.PI*2,CYCLE=.6,STEP=.3,SWING=STEP*.82,STRIDE=10.8,SPEED=STRIDE/CYCLE;
 const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
 const ease=(v,a,b)=>smooth((v-a)/(b-a));
 const mod=(v,n)=>(v%n+n)%n;
 const mix=(a,b,u)=>a+(b-a)*u;
 const length=v=>Math.hypot(...v);
 const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
 const sub=(a,b)=>a.map((v,i)=>v-b[i]);
 const add=(a,b)=>a.map((v,i)=>v+b[i]);
 const mul=(a,s)=>a.map(v=>v*s);
 // Exact rest landmarks captured by native-geometry.json. These are joints,
 // not a duplicate of the shared Jonathan model's anatomy or surfaces.
 const REST={shoulder:3.7,elbow:5.902733345420226,wrist:3.95,
  shoulderZ:20.9,elbowZ:16.411351449603811,wristZ:11.7};

 function foot(side,t){
  const phase=mod(t-(side<0?0:STEP),CYCLE),air=phase<SWING;
  let contactY,pitch,lift=0,carry=1;
  if(air){
   const u=phase/SWING;
   // A planted contact travels backwards relative to a constant-speed root.
   // Swing interpolates between consecutive world-space contacts. Its zero
   // endpoint slope therefore meets stance with the same relative velocity.
   contactY=SPEED*(phase+.22-CYCLE*smooth(u));
   lift=Math.sin(Math.PI*u)**2;
   pitch=.30*(1-ease(u,0,.48))-.20*ease(u,.58,1);
   carry=.55*(1-ease(u,0,.7))+ease(u,.75,1);
  }else{
   contactY=SPEED*(phase-.38);
   pitch=-.20*(1-ease(phase,SWING,SWING+.075))+.30*ease(phase,CYCLE-.09,CYCLE);
   carry=1-.45*ease(phase,CYCLE-.09,CYCLE);
  }
  // Roll the ankle around the stationary heel/toe rather than through the
  // floor. This is the same local X-axis pivot used by the walk exporter.
  const py=(pitch>0?-1:1)*1.06,pz=-.9,c=Math.cos(pitch),s=Math.sin(pitch);
  const rollY=py-(c*py-s*pz),rollZ=pz-(s*py+c*pz);
  return {side,phase,stance:!air,pitch,carry,contactY,
   ankle:[side*1.9,contactY+rollY,lift+rollZ]};
 }

 function frame(time,walking){
  if(!walking)return {drop:0,weight:0,phase:0,drive:0,feet:[],legs:[-1,1].map(side=>({
   side,hip:[side*1.9,0,12],knee:[side*1.9,0,6],ankle:[side*1.9,0,0],pitch:0,stance:true
  }))};
  const t=mod(time,CYCLE),phase=TAU*t/CYCLE,weight=.42*Math.sin(phase);
  const feet=[foot(-1,t),foot(1,t)];
  for(const f of feet)f.ankle[0]-=weight;
  const heights=feet.map(f=>f.ankle[2]+Math.sqrt(Math.max(0,
   11.98**2-(f.ankle[0]-f.side*1.9)**2-f.ankle[1]**2)));
  const push=Math.max(...feet.map(f=>ease(f.ankle[1],-1.5,2.5)*f.carry));
  const base=.55+.20*(.5+.5*Math.cos(phase*2));
  const drop=mix(base,12-Math.min(...heights),push);
  const stepIndex=Math.floor(t/STEP),stepTime=t-stepIndex*STEP,target=stepIndex===0?1:-1;
  const drive=mix(-target,target,ease(stepTime,0,SWING));
  const legs=feet.map(f=>{
   const hip=[f.side*1.9,0,12-drop],ankle=f.ankle.slice(),delta=sub(ankle,hip);
   const d=length(delta),forward=[0,-1,0];
   let bend=sub(forward,mul(delta,dot(forward,delta)/(d*d)));
   bend=mul(bend,1/length(bend));
   const knee=add(mul(add(hip,ankle),.5),mul(bend,Math.sqrt(Math.max(0,36-d*d/4))));
   return {...f,hip,knee,ankle};
  });
  return {drop,weight,phase,drive,feet,legs};
 }

 function arm(side,j,heading,view,pose){
  const shoulder=[side*REST.shoulder,0,REST.shoulderZ-pose.drop];
  const swing=-.13*side*pose.drive,c=Math.cos(swing),s=Math.sin(swing);
  const rotated=(x,z)=>{
   const dz=z-REST.shoulderZ;
   return [side*x,-s*dz,shoulder[2]+c*dz];
  };
  const project=p=>[p[0]*Math.cos(heading)-p[1]*Math.sin(heading),-p[2]];
  const [sx,sy]=project(shoulder),[ex0,ey0]=project(rotated(REST.elbow,REST.elbowZ)),
   [hx0,hy0]=project(rotated(REST.wrist,REST.wristZ));
  // Match the source native renderer's relaxed elbows and level profile:
  // neither arms nor shoulders inherit ground-plane perspective.
  const ua=Math.atan2(ey0-sy,ex0-sx),la=Math.atan2(hy0-ey0,hx0-ex0);
  const bend=Math.atan2(Math.sin(la-ua),Math.cos(la-ua)),mid=ua+bend*.5;
  // Projection supplies directions only, never the native bone lengths.
  const ul=5,ll=5.1;
  const sideWeight=Math.sin(heading)**2,drive=pose.drive*(j?-1:1)*.23*view.direction;
  const upper=mix(mid-bend*.14,Math.PI/2+view.direction*.035+drive,sideWeight);
  const lower=mix(mid+bend*.14,Math.PI/2-view.direction*.085+drive*.94,sideWeight);
  const ex=sx+ul*Math.cos(upper),ey=sy+ul*Math.sin(upper);
  return {sx,sy,ex,ey,hx:ex+ll*Math.cos(lower),hy:ey+ll*Math.sin(lower)};
 }

 function sample(angleDegrees,time=0,walking=false){
  const angle=mod(Number.isFinite(angleDegrees)?angleDegrees:0,360),heading=angle*Math.PI/180;
  const view={degrees:Math.min(angle,360-angle),direction:angle<=180?1:-1};
  const pose=frame(Number.isFinite(time)?time:0,!!walking),c=Math.cos(heading),s=Math.sin(heading);
  const project=p=>[p[0]*c-p[1]*s,-p[2]-(walking?(p[0]*s+p[1]*c)*.6:0)];
  const legs=pose.legs.map(l=>{
   const [hx,hy]=project(l.hip),[kx,ky]=project(l.knee),[fx,fy]=project(l.ankle);
   return {hx,hy,kx,ky,fx,fy,bootAngle:l.pitch*s};
  });
  const upper=KRJonathan.walkUpper([-1,1].map((side,j)=>arm(side,j,heading,view,pose)),heading,pose.drive,walking?1:0);
  return {...view,clock:walking&&Number.isFinite(time)?time:0,breath:false,lighting:'daylight',
   body:{x:0,y:pose.drop,lean:walking?.02*s+.006*c*Math.sin(pose.phase):0},
   arms:upper.arms,legs};
 }

 // Numeric evidence for the lab audit, never an extra UI control. Ground
 // landmarks remain available before projection to verify fixed bone lengths.
 function inspect(time){
  const p=frame(time,true);
  return {cycle:CYCLE,stride:STRIDE,speed:SPEED,armDrive:p.drive,drop:p.drop,legs:p.legs.map(l=>({
   side:l.side,stance:l.stance,pitch:l.pitch,phase:l.phase,
   hip:l.hip,knee:l.knee,ankle:l.ankle,contactY:l.contactY,
   thigh:length(sub(l.hip,l.knee)),shin:length(sub(l.knee,l.ankle))
  }))};
 }
 window.KRGearPreviewPose=Object.freeze({sample,inspect,cycle:CYCLE});
})();
