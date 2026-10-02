/* Phase-independent run entry. Blend goals, then solve fixed-length bones.
 * This is animation data only; it has no Lab UI or gameplay instrumentation. */
(()=>{'use strict';
 const R=KRMountedRig,{add,sub,mul}=R,lerp=(a,b,w)=>a+(b-a)*w,
  vector=(a,b,w)=>a.map((v,i)=>lerp(v,b[i],w)),length=v=>Math.hypot(...v),
  ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(10+x*(-15+6*x));};
 function blend(a,b,w){
  if(typeof a==='number'&&typeof b==='number')return lerp(a,b,w);
  if(typeof a==='function'&&typeof b==='function')return (...args)=>blend(a(...args),b(...args),w);
  if(Array.isArray(a)&&Array.isArray(b))return a.map((v,i)=>blend(v,b[i],w));
  if(a&&b&&typeof a==='object'&&typeof b==='object'){const o={...b};for(const k of Object.keys(a))if(k in b)o[k]=blend(a[k],b[k],w);return o;}
  return w<.5?a:b;
 }
 function leg(a,b,w,s){
  const l=blend(a,b,w),root=l.root,foot=l.end,pitch=l.pitch;
  const floor=-s*Math.min(...[-1.08,-.78,.1].flatMap(y=>[-1,2].map(z=>y*Math.cos(pitch)-z*Math.sin(pitch))));
  foot[1]=Math.max(foot[1],floor+.025*s);
  if(l.front){
   const upper=4*s,lower=16*s-.001,delta=sub(foot,root),d=length(delta),axis=Math.atan2(delta[2],-delta[1]),
    cone=Math.acos(Math.max(-1,Math.min(1,(d*d+upper*upper-lower*lower)/(2*d*upper)))),
    desired=Math.atan2(l.elbow[2]-root[2],root[1]-l.elbow[1]),theta=Math.max(axis-cone,Math.min(axis+cone,desired)),
    elbow=add(root,[0,-upper*Math.cos(theta),upper*Math.sin(theta)]),chain=R.ik(elbow,foot,6*s,10*s,[0,0,1]);
   Object.assign(l,{elbow,joint:chain.joint,end:chain.end,shoulder:upper,forearm:chain.a,a:upper+chain.a,b:chain.b});
  }else{
   const cannon=8.2*s,delta=sub(root,foot),d=Math.hypot(delta[1],delta[2]),axis=Math.atan2(delta[2],delta[1]),
    reach=Math.sqrt(Math.max(0,(12.6*s-.001)**2-delta[0]**2)),
    cone=Math.acos(Math.max(-1,Math.min(1,(d*d+cannon*cannon-reach*reach)/(2*d*cannon)))),
    desired=Math.atan2(l.hock[2]-foot[2],l.hock[1]-foot[1]),theta=Math.max(axis-cone,Math.min(axis+cone,desired)),
    hock=add(foot,[0,cannon*Math.cos(theta),cannon*Math.sin(theta)]),chain=R.ik(root,hock,6.3*s,6.3*s,[0,0,1]);
   Object.assign(l,{joint:chain.joint,hock:chain.end,end:foot,a:chain.a,b:chain.b,cannon:length(sub(foot,chain.end))});
  }
  l.target=l.end;return l;
 }
 function apply(target,state){
  if(!state.entryState||state.entryElapsed>=.20)return target;
  const elapsed=Math.max(0,state.entryElapsed||0),w=ease(elapsed/.20),entry=state.entryState,
   previous={...entry,angle:state.angle,entryState:null,entryGaitOffset:0};
  if(entry.action==='jump'){
   // Preserve recovery velocity at input, then relinquish that old action.
   // Otherwise its accelerated landing stride fights the next takeoff.
   const recovery=(entry.runElapsed||0)+.035*(1-Math.exp(-elapsed/.035));
   if(recovery>=.78){previous.action='none';previous.time=2.04+recovery-.78;}
   else previous.time=KRMountedRunMotion.timeAt(recovery);
  }
  else previous.time=entry.time+elapsed*(entry.gaitRate??1);
  let source=previous.action==='jump'?KRMountedJump.sample(previous):R.sample(previous);
  if(previous.action==='duck')KRMountedDuck.apply(source,previous);
  if(previous.laneStep)sidestep(source,previous);
  if(!w)return {...source,jump:{...target.jump,height:source.jump?.height||0,blending:true},entryBlend:{source,target,weight:w}};
  // Keep optional rigid projection fields continuous at zero balance too.
  if(!source.duck)KRMountedDuck.apply(source,{duckAmount:1e-12});
  if(!target.duck)KRMountedDuck.apply(target,{duckAmount:1e-12});
  const p=blend(source,target,w);
  p.legs=source.legs.map((l,i)=>leg(l,target.legs[i],w,p.horseScale));
  // Re-solve the rider's two-link chains too; no shortened mesh lerp limbs.
  for(const key of ['riderLegs','armChains'])p[key]=source[key].map((l,i)=>{
   const end=vector(l.end,target[key][i].end,w),root=vector(l.root,target[key][i].root,w),joint=vector(l.joint,target[key][i].joint,w);
   return {...R.ik(root,end,l.a,l.b,sub(joint,root)),side:l.side};
  });
  const local=v=>sub(p.project(v),p.origin);
  p.native.arms=p.armChains.map(l=>{const [sx,sy]=local(l.root),[ex,ey]=local(l.joint),[hx,hy]=local(l.end);return {sx,sy,ex,ey,hx,hy,walkDepth:{shoulder:p.depth(l.root),upper:p.depth(l.joint),hand:p.depth(l.end),weight:0},physical:l};});
  p.native.legs=p.riderLegs.map(l=>{const [hx,hy]=local(l.root),[kx,ky]=local(l.joint),[fx,fy]=local(l.end);return {hx,hy,kx,ky,fx,fy,bootAngle:0};});
  p.jump={...target.jump,height:lerp(source.jump?.height||0,target.jump?.height||0,w),blending:true};
  p.entryBlend={source,target,weight:w};
  return p;
 }
 // A grounded rush can enter/leave a stride without snapping from the idle
 // horse to a running skeleton. Reuse the fixed-bone goal solver above.
 function motion(state,weight){
  const source=R.sample({...state,motion:'idle',time:0}),target=R.sample({...state,motion:'gallop'}),w=Math.max(0,Math.min(1,weight));
  if(w===0)return source;
  for(const l of source.legs)if(l.front&&!l.elbow)l.elbow=add(l.root,mul(R.unit(sub(l.joint,l.root)),4*source.horseScale));
  const p=blend(source,target,w);p.motion='lunge';
  // Both poses have this frame's same camera angle. Blending identical
  // projection functions repeats two projections and allocates a third vector
  // for every depth/colour vertex without changing any result.
  p.project=source.project;p.depth=source.depth;
  p.legs=source.legs.map((l,i)=>leg(l,target.legs[i],w,p.horseScale));
  for(const key of ['riderLegs','armChains'])p[key]=source[key].map((l,i)=>{
   const root=vector(l.root,target[key][i].root,w),end=vector(l.end,target[key][i].end,w),joint=vector(l.joint,target[key][i].joint,w);
   return {...R.ik(root,end,l.a,l.b,sub(joint,root)),side:l.side};
  });
  const local=v=>sub(p.project(v),p.origin);
  p.native.arms=p.armChains.map(l=>{const [sx,sy]=local(l.root),[ex,ey]=local(l.joint),[hx,hy]=local(l.end);return {sx,sy,ex,ey,hx,hy,walkDepth:{shoulder:p.depth(l.root),upper:p.depth(l.joint),hand:p.depth(l.end),weight:0},physical:l};});
  p.native.legs=p.riderLegs.map(l=>{const [hx,hy]=local(l.root),[kx,ky]=local(l.joint),[fx,fy]=local(l.end);return {hx,hy,kx,ky,fx,fy,bootAngle:0};});
  p.lungeBlend={source,target,weight:w};
  return p;
 }
 function sidestep(p,state){
  const amount=Math.max(-1,Math.min(1,state.laneStep||0));if(Math.abs(amount)<.001||p.jump)return p;
  p.laneBase={...p};const s=p.horseScale,clock=state.stepClock||0;
  p.legs=p.legs.map(l=>{
   const phase=p.motion==='idle'?((clock/.42+(l.front?0:.5)+(l.side>0?.5:0))%1):l.phase,
    lift=Math.sin(Math.PI*phase)**2,shift=-amount*s*(.65+1.65*lift),
    source={...l,elbow:l.elbow||add(l.root,mul(R.unit(sub(l.joint,l.root)),4*s))},
    target={...source,end:add(l.end,[shift,Math.abs(amount)*s*1.2*lift,0])};
   return leg(source,target,1,s);
  });p.laneStep=amount;return p;
 }
 window.KRMountedJumpEntry={apply,motion,sidestep,duration:.20};
})();
