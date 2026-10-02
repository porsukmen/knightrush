/* Shared running jump, timed against the user's ziplama.mp4 side views.
 * Y is up. Articulated bones keep their lengths; the saddle carries the hip. */
(()=>{'use strict';
 const R=KRMountedRig,{add,sub,mul}=R,clamp=x=>Math.max(0,Math.min(1,x)),
  ease=x=>{x=clamp(x);return x*x*x*(10+x*(-15+6*x));},
  mix=(a,b,t)=>a+(b-a)*t,len=v=>Math.hypot(...v),
  track=(keys,t)=>{for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){const a=keys[i-1],b=keys[i];return mix(a[1],b[1],ease((t-a[0])/(b[0]-a[0])));}return keys.at(-1)[1];},
  hermite=(a,b,va,vb,d,t)=>{const x=clamp(t/d),x2=x*x,x3=x2*x;return (2*x3-3*x2+1)*a+(x3-2*x2+x)*va*d+(-2*x3+3*x2)*b+(x3-x2)*vb*d;};
 const timing=Object.freeze({lead:.50,loaded:.69,takeoff:.846,apex:1.07495,contact:1.328,compressed:1.42,settle:1.80});
 // Finish on an exact base-gait cycle so looping the Lab cannot skip a step.
 const durationFor=()=>2.16;
 // Advance the recovery stride continuously while airborne. Its hind contacts
 // now follow the authored fore landing, instead of waiting an extra stride.
 const gaitTime=t=>t+.24*ease((t-timing.takeoff)/(timing.contact-timing.takeoff));
 const bodyWeight=t=>1-ease((t-.72)/(timing.takeoff-.72))*(1-ease((t-timing.contact)/(1.56-timing.contact)));
 const entryOffset=state=>(state.entryGaitOffset||0)*(1-ease((state.time-timing.lead)/.12));
 const sample=state=>apply(R.sample(state.motion==='gallop'?{...state,time:gaitTime(state.time)+entryOffset(state),gaitBodyWeight:bodyWeight(state.time)}:state),state);
 function phaseAt(time){const t=Math.max(0,time),T=timing,air=(t-T.takeoff)/(T.contact-T.takeoff),
  weight=ease((t-.62)/.16)*(1-ease((t-T.compressed)/.23));
  let lift=0;
  // A small rising takeoff replaces the old deep second dip. Lower flight
  // lift leaves the chest-up / trailing-hind shape to sell the jump, not float.
  if(t<T.loaded)lift=-.35*ease((t-.62)/(T.loaded-.62));
  else if(t<T.takeoff)lift=hermite(-.35,1.2,0,22.8/(T.contact-T.takeoff),T.takeoff-T.loaded,t-T.loaded);
  else if(t<T.contact)lift=1.2*(1-air)+24*air*(1-air);
  else if(t<T.compressed)lift=hermite(0,-.55,-25.2/(T.contact-T.takeoff),0,T.compressed-T.contact,t-T.contact);
  else lift=-.55*(1-ease((t-T.compressed)/.23));
  // A modest higher arc with the same timing: scale the connected takeoff,
  // flight and compression curves together to preserve endpoint velocities.
  lift*=1.18;
  // One continuous nose-up -> nose-down sweep, not several eased keys that
  // brake and reaccelerate during flight. The quiet base frame adds no wobble.
  return {time:t,weight,lift,bodyWeight:bodyWeight(t),pitch:track([[0,0],[.62,0],[.846,-.35],[1.328,.24],[1.65,0]],t),
   foreFold:track([[0,0],[.70,0],[.89,1],[1.12,1],[1.328,0],[2.4,0]],t),
   // In both supplied jumps the hind legs trail through the crest; their
   // recovery is delayed until the forelegs are reaching toward the landing.
   hindFold:track([[0,0],[.846,0],[1.10,.08],[1.27,.38],[1.40,.55],[1.56,0],[2.4,0]],t),
   airborne:t>T.takeoff&&t<T.contact};
 }
 function apply(p,state){
  if(p.motion!=='gallop')return p;
  const q=phaseAt(state.time);if(state.time<=timing.lead||state.time>=timing.settle)return p;
  const s=p.horseScale,baseSeat=p.seat,pivot=baseSeat/s,c=Math.cos(q.pitch),sn=Math.sin(q.pitch),
   rotate=v=>[v[0],v[1]*c-v[2]*sn,v[1]*sn+v[2]*c],
   point=v=>add([0,pivot+q.lift,0],rotate(sub(v,[0,pivot,0]))),
   oldBody=p.bodyPoint,raise=v=>add(v,[0,q.lift*s,0]);
  p.bodyPoint=v=>point(oldBody(v));p.bodyPitch+=q.pitch;
  p.seat+=q.lift*s;p.origin=add(p.origin,[0,-q.lift*s]);
  p.headNod+=.06*q.foreFold;p.tailLift+=1.8*q.hindFold;
  p.legs=p.legs.map(source=>{
   const local=v=>mul(v,1/s),root=point(local(source.root)),t=state.time,
    fold=source.front?q.foreFold:q.hindFold,station=source.front?9.5:-12,
    // Keep the actual gallop support sweep through the rear kick. Each hind
    // hoof leaves on its existing toe-off (.78 / .846); never park all four.
    toeOff=source.side<0?.78:.846,contact=source.side<0?1.328:1.394,
    prepContact=source.side<0?.62:.655,prepOff=source.side<0?.70:.735,
    hindContact=source.side<0?1.56:1.626,
    limbWeight=source.front?ease((t-.50)/(prepContact-.50))*(1-ease((t-contact-.18)/(1.80-contact-.18))):ease((t-toeOff)/.10)*(1-ease((t-1.30)/(hindContact-1.30))),
    forward=source.front?0:track([[0,-8],[toeOff,-8],[toeOff+.10,-11],[1.075,-8],[1.24,-5],[1.48,6],[1.626,8]],t),
    hindPickup=source.front?0:2.2*ease((t-toeOff)/.18)*(1-ease((t-1.24)/.16)),
    desired=[source.side*(source.front?4.8:4.7),1.15+Math.max(0,q.lift)+fold*(source.front?11:4)+hindPickup,station+(source.front?0:.65)+forward],
    foot=local(source.end).map((v,i)=>mix(v,desired[i],limbWeight)),
    kick=source.front?0:1.4*ease((state.time-toeOff)/.055)*(1-ease((state.time-toeOff-.09)/.15)),
    airFold=ease((t-prepOff)/.16)*(1-ease((t-1.12)/(contact-1.12)));
   let hoofPitch=mix(source.pitch,Math.max(fold*.85,kick),limbWeight);
   if(source.front){
    // One planted preparation, one pickup, a body-local held fold, then one
    // forward reach. No native gallop foot target leaks into the air pose.
    const pitch=p.bodyPitch,cv=Math.cos(pitch),sv=Math.sin(pitch),
     held=add(root,[0,-11.5*cv-2*sv,-11.5*sv+2*cv]),
     ground=[source.side*4.8,1.15,17.5-88.8888888889*(t-(t<1.12?prepContact:contact))],
     target=ground.map((v,i)=>mix(v,held[i],airFold));
    for(let i=0;i<3;i++)foot[i]=mix(local(source.end)[i],target[i],limbWeight);
    hoofPitch=mix(source.pitch,(1.05-pitch)*airFold,limbWeight);
   }
   const soleFloor=-Math.min(...[-1.08,-.78,.1].flatMap(y=>[-1,2].map(z=>y*Math.cos(hoofPitch)-z*Math.sin(hoofPitch))));
   foot[1]=Math.max(foot[1],soleFloor+.025);
   // Fore contact can precede hind contact while the croup is still raised.
   // Keep that last rear hoof airborne until the fixed chain can reach down.
   const dx=foot[0]-root[0],dz=foot[2]-root[2],reach=source.front?Math.sqrt(15.999**2-dx*dx)+4:Math.sqrt(12.599**2-dx*dx)+8.2;
   foot[1]=Math.max(foot[1],root[1]-Math.sqrt(Math.max(0,reach*reach-dz*dz)));
   let limb;
   if(source.front&&p.motion==='idle'){
    // Standing uses the approved two-link foreleg. Keep its bend branch at
    // both ends of the action instead of switching the knee in one frame.
    const chain=R.ik(root,foot,10,10,[0,0,-1]);
    limb={...chain,elbow:add(root,mul(sub(chain.joint,root),.4)),shoulder:4,forearm:6};
   }else if(source.front){
    const delta=sub(foot,root),distance=len(delta),axis=Math.atan2(delta[2],-delta[1]),
     cone=Math.acos(Math.max(-1,Math.min(1,(distance*distance+16-15.999**2)/(8*distance)))),
     original=point(local(source.elbow||add(source.root,mul(sub(source.joint,source.root),.4)))),
     rest=Math.atan2(original[2]-root[2],root[1]-original[1]),
     // Keep the elbow below the shoulder. The old cone-only fold put the
     // carpus inside the chest, hiding the forward forearm behind the skin.
     wanted=mix(axis-cone*.85,.20-p.bodyPitch,airFold),
     theta=Math.max(axis-cone,Math.min(axis+cone,mix(rest,wanted,limbWeight))),
     elbow=add(root,[0,-4*Math.cos(theta),4*Math.sin(theta)]),lower=R.ik(elbow,foot,6,10,[0,0,1]);
    limb={root,elbow,joint:lower.joint,end:lower.end,shoulder:4,forearm:lower.a,a:4+lower.a,b:lower.b};
   }else{
    const cannon=8.2,delta=sub(root,foot),distance=Math.hypot(delta[1],delta[2]),axis=Math.atan2(delta[2],delta[1]),
     reach=Math.sqrt(Math.max(0,12.599**2-delta[0]**2)),cone=Math.acos(Math.max(-1,Math.min(1,(distance*distance+cannon*cannon-reach*reach)/(2*distance*cannon)))),
     original=point(local(source.hock)),originalFoot=point(local(source.end)),rest=Math.atan2(original[2]-originalFoot[2],original[1]-originalFoot[1]),
     // A trailing hoof belongs behind its hock; as it recovers forward the
     // cannon reverses this slant. Keep the native gallop's Z-dependent rule
     // instead of the old always-vertical/backward hock used for a tuck.
     wanted=Math.asin(Math.max(-1,Math.min(1,-(.8+.5*forward+1.6*fold)/cannon))),theta=Math.max(axis-cone,Math.min(axis+cone,mix(rest,wanted,q.weight))),
     hock=add(foot,[0,cannon*Math.cos(theta),cannon*Math.sin(theta)]),upper=R.ik(root,hock,6.3,6.3,[0,0,1]);
    limb={root,joint:upper.joint,hock:upper.end,end:foot,a:upper.a,b:upper.b,cannon:len(sub(foot,upper.end))};
   }
   const result={...source,...limb,baseRoot:point(local(source.baseRoot)),socketOffset:rotate(local(source.socketOffset)),target:foot,
    pitch:hoofPitch,stance:source.front?((t>=prepContact&&t<=prepOff)||(t>=contact&&t<=contact+.18)||(source.stance&&limbWeight<.01)):source.stance&&limbWeight<.01};
   for(const name of ['root','baseRoot','socketOffset','joint','end','target','elbow','hock'])if(result[name])result[name]=mul(result[name],s);
   for(const name of ['a','b','cannon','shoulder','forearm'])if(limb[name]!==undefined)result[name]=limb[name]*s;
   return result;
  });
  p.riderLegs=p.riderLegs.map(l=>({...l,root:raise(l.root),joint:raise(l.joint),end:raise(l.end)}));
  p.armChains=p.armChains.map(l=>({...l,root:raise(l.root),joint:raise(l.joint),end:raise(l.end)}));
  // Reuse the approved hip hinge/head/equipment projection at a small amount;
  // this is the rider's forward balance, not a second full duck animation.
  // The reference rider follows the lift first, then closes the hip in flight;
  // avoid one full forward lean held identically through every jump phase.
  const riderBalance=track([[0,0],[.62,0],[.85,.16],[1.075,.29],[1.33,.20],[1.65,0]],state.time);
  KRMountedDuck.apply(p,{duckAmount:riderBalance,time:state.time});
  p.jump={...q,height:Math.max(0,q.lift)*s,blending:Math.abs(entryOffset(state))>1e-9};return p;
 }
 window.KRMountedJump={apply,sample,gaitTime,bodyWeight,phaseAt,timing,durationFor};
})();
