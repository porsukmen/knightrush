/* Local mounted pose experiment. Coordinates: X right, Y up, Z forward.
 * Jonathan is the shared approved rig, not a replacement character mesh. */
(()=>{'use strict';
 const TAU=Math.PI*2,add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,k)=>a.map(v=>v*k),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),len=a=>Math.hypot(...a),unit=a=>mul(a,1/(len(a)||1));
 const mod=(a,b)=>(a%b+b)%b,
  smoothMax=(a,b,width)=>{const h=Math.max(width-Math.abs(a-b),0)/width;return Math.max(a,b)+h*h*width*.25;},
  smoothStep=v=>{const x=Math.max(0,Math.min(1,v));return x*x*x*(10+x*(-15+6*x));};
 function ik(root,target,a,b,pole){const delta=sub(target,root),d=Math.max(.001,Math.min(a+b-.001,len(delta))),axis=unit(delta),end=add(root,mul(axis,d));
  const along=(a*a-b*b+d*d)/(2*d),perp=unit(sub(pole,mul(axis,dot(pole,axis)))),joint=add(add(root,mul(axis,along)),mul(perp,Math.sqrt(Math.max(0,a*a-along*along))));return {root,joint,end,a:len(sub(joint,root)),b:len(sub(end,joint))};
 }
 // Video at kosu.MOV: walk 0–4s (~1.2s), diagonal medium trot 7.4–9.2s
 // (measured saddle repeat .83-.87s). Separate footfall patterns, not a sped-up walk.
 const gaits=Object.freeze({walk:Object.freeze({cycle:1.2,duty:.66,reach:3.8}),trot:Object.freeze({cycle:.84,duty:.41,reach:5.5}),gallop:Object.freeze({cycle:.6,duty:.30,reach:8.0})});
 function sample(state){const {angle,time,motion}=state,a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a),moving=motion!=='idle',walking=motion==='walk',fast=motion==='gallop',gait=gaits[motion]||gaits.trot,cycle=gait.cycle,t=moving?time:0,phase=t/cycle*TAU;
  // Authored body timing follows the staggered footfalls, not one rigid bob:
  // the chest settles after fore contact and the pelvis after hind contact.
  // These amplitudes/phases are animation settings, not physiological data.
  // Small two-pulse walk/trot motion is retained; gallop has one body cycle.
  // Jump can quiet the running body's oscillators without stopping the feet's
  // recovery clock. Default 1 preserves every ordinary gait exactly.
  const gaitBodyWeight=fast?(state.gaitBodyWeight??1):1,
   horseScale=1.22,bodyFrequency=fast?1:2,
   collection=moving?.5+.5*gaitBodyWeight*Math.cos(phase*bodyFrequency-TAU*(fast?.83:.64)):0,
   quietBob=!moving?.06*Math.sin(time*TAU/2.4):walking?-.55+.10*Math.cos(phase*2):-1.9+.85*Math.cos(phase*2+TAU*.08),
   quietPitch=!moving?0:-(walking?.012:.018)*Math.sin(phase*2+.35),
   // The initial -1.9 setting exceeded the fixed hind-chain reach during
   // early recovery. Lower both channels .4, preserving every hoof target.
   chestHeave=fast?-2.3+1.1*gaitBodyWeight*Math.cos(phase-TAU*.03):quietBob-10.75*Math.tan(quietPitch),
   hipHeave=fast?-2.3+1.1*gaitBodyWeight*Math.cos(phase-TAU*.65):quietBob+10.75*Math.tan(quietPitch),
   baseBob=(chestHeave+hipHeave)*.5,bob=baseBob*horseScale,
   bodyPitch=moving?Math.atan2(hipHeave-chestHeave,21.5):0,
   // Flexion tucks the pelvis under: negative local Y/Z rotation lowers the
   // croup behind the hinge while protracting its lower attachment points.
   // Six degrees TOTAL fast excursion is a deliberately restrained start.
   lumbarFlexion=moving?(walking?.003:fast?.05:.008)*(2*collection-1):0,
   lumbarPitch=-lumbarFlexion,abdomenTuck=!moving?0:walking?.08+.04*collection:fast?1.1+.65*collection:.45+.30*collection,
   bodyFlex={cyclePhase:moving?mod(t/cycle,1):0,cyclesPerStride:moving?bodyFrequency:0,
    chestHeave,hipHeave,baseHeave:baseBob,lumbarFlexion,lumbarPitch,thoraxPitch:0,collection,
    lumbarBlendStart:-5.8,lumbarRigidStart:-10.5};
  const headNod=!moving?.012*Math.sin(time*TAU/2.4):walking?.018*Math.sin(phase*2-.35):fast?.055*gaitBodyWeight*Math.sin(phase-.5):.025*Math.sin(phase*2-.55),
   tailSway=!moving?0:(walking?.45:fast?.9*gaitBodyWeight:.7)*Math.sin(phase-.7),tailLift=fast?2.6+.7*gaitBodyWeight*Math.sin(phase-.7):0;
  // The spine frame is evaluated before IK; ground targets are never rotated
  // with the body. Local lumbar bend fades behind the rigid saddle band and
  // is one rigid frame for the entire far rear, including every tail segment.
  // No longitudinal scaling and no second additive rump-push oscillator.
  const bump=x=>x>0&&x<1?64*x**3*(1-x)**3:0,
   bodyRock=0,rumpDrive=0,rumpHeave=0,rumpPitch=lumbarPitch,
   bodyPoint=v=>{if(!bodyPitch&&!lumbarPitch)return [...v];
    const w=smoothStep((-v[2]-5.8)/4.7),rr=lumbarPitch*w,py=24+baseBob,dy=v[1]-py,dz=v[2]+5.8,
     y=py+dy*Math.cos(rr)-dz*Math.sin(rr)-(26.4+baseBob),z=-5.8+dy*Math.sin(rr)+dz*Math.cos(rr);
    return [v[0],26.4+baseBob+y*Math.cos(bodyPitch)-z*Math.sin(bodyPitch),y*Math.sin(bodyPitch)+z*Math.cos(bodyPitch)];};
  // Seat is the rider's hip-joint centre, not the saddle contact surface.
  // Leave room for the full thigh/hip thickness above the leather seat.
  // Feet and their stirrups follow this lift so the fixed bones do not pull
  // the knees inward through the horse when the pelvis is raised.
  const seat=(26.4+baseBob)*horseScale;
  const project=p=>[p[0]*c+p[2]*s,-p[1]+(p[2]*c-p[0]*s)*.16],depth=p=>p[2]*c-p[0]*s;
  const legs=[];for(const front of [false,true])for(const side of [-1,1]){
   // Walk: LH→LF→RH→RF with overlapping support. Trot: LH+RF, then
   // RH+LF half a cycle later. Same-side legs never move as a pacing pair.
   // Fast reference 12–18s: hind push → staggered fore support → collected
   // suspension. Four contacts, not two locked pairs (nor a faster trot).
   const onset=front?(side<0?.38:.49):(side<0?0:.11),
    offset=fast?-onset:walking?(front?(side<0?.75:.25):(side<0?0:.5)):(front?(side<0?.5:0):(side<0?0:.5));
   const {duty,reach}=gait,ph=mod(t/cycle+offset,1),stance=ph<duty,u=(ph-duty)/(1-duty);
   // Linear support travel cancels world motion. The swing meets it with the
   // same endpoint speed (Hermite), avoiding a foot-speed snap at touchdown.
   const swingZ=(v)=>{const m=-2*reach*(1-duty)/duty,hermite=(a,b,ma,mb,x)=>{const x2=x*x,x3=x2*x;return (2*x3-3*x2+1)*a+(x3-2*x2+x)*ma+(-2*x3+3*x2)*b+(x3-x2)*mb;};
    if(!fast)return hermite(-reach,reach,m,m,v);
    // Bounded toe-off / landing overshoot. One long Hermite would throw the
    // hoof far beyond its fixed bone reach at the fast contact speed.
    // The fore hoof unfolds FORWARD while airborne, then sweeps back into
    // contact. A late low reach leaves the carpus tucked like a short arm.
    if(front){
     if(v<.09)return hermite(-reach,-reach-1.3,m*.09,0,v/.09);
     if(v<.575)return hermite(-reach-1.3,reach+7,0,0,(v-.09)/.485);
     return hermite(reach+7,reach,0,m*.425,(v-.575)/.425);
    }
    // Preserve the planted endpoint speed, but turn around the rear extreme
    // with finite forward acceleration. Zero speed AND zero acceleration
    // there created a visible dwell before the hoof could recover forward.
    // Quintic Hermite shares the same rear acceleration on both segments.
    const kickHermite=(a,b,ma,mb,aa,ab,x)=>{const d=b-a,x2=x*x,x3=x2*x,x4=x3*x,x5=x4*x;
     return a+ma*x+aa*x2/2+(10*d-6*ma-4*mb-1.5*aa+.5*ab)*x3+(-15*d+8*ma+7*mb+1.5*aa-ab)*x4+(6*d-3*ma-3*mb-.5*aa+.5*ab)*x5;},rearAcceleration=220;
    if(v<.18)return kickHermite(-reach,-reach-3,m*.18,0,0,rearAcceleration*.18*.18,v/.18);
    if(v<.82)return kickHermite(-reach-3,reach+.45,0,0,rearAcceleration*.64*.64,0,(v-.18)/.64);
    return kickHermite(reach+.45,reach,0,m*.18,0,0,(v-.82)/.18);
   };
   // One complete hind-foot lift arch, never a base lift plus an early bump:
   // the monotonic time warp moves its sole crest to u=.40, then rejoins the
   // existing late clearance at u=.80. Position, speed and acceleration are
   // continuous at the zero-height ends and at the time-warp boundary.
   const fold=moving&&!stance?Math.sin(Math.PI*u)**2*(fast&&!front?smoothStep(u/.12)*smoothStep((1-u)/.06):1):0,
    hindArc=fast&&!front&&!stance?Math.sin(Math.PI*(u+.1*bump(u/.8)))**2*smoothStep(u/.12)*smoothStep((1-u)/.06):0,
    // The sole still faces back at the rear kick; wait for initial clearance
    // before turning the toe down. Its orientation is separate from height.
    rearKick=fast&&!front&&!stance?bump((u-.05)/.30):0,
    z=moving?(stance?reach*(1-2*ph/duty):swingZ(u)):0,lift=fast&&!front?6.1*hindArc:fold*(walking?(front?2.6:2.2):fast?4.4:(front?3.5:4.2)),
    // Standing is not a paused swing: sockets sit higher inside the shoulder
    // and haunch. Breath moves the barrel, never the four planted leg chains.
    // The scapula settles under this leg's own support, and glides with its
    // reach. Apply this translation AFTER bodyPoint in horse-space XYZ;
    // the renderer receives the same offset for its attached shoulder mass.
    // Hind sockets follow the articulated pelvis; their ground-space target
    // curves and pitches remain on the accepted trajectories.
    shoulderLoad=moving&&front&&stance?bump(ph/duty):0,
    baseRoot=bodyPoint([side*(front?4.8:5.2),(front?21.1:21.35)+(moving?baseBob:0),front?9.5:-12]),
    socketOffset=moving&&front?[0,-(walking?.16:fast?.65*gaitBodyWeight:.32)*shoulderLoad,(walking?.18:fast?.6*gaitBodyWeight:.3)*Math.tanh(z/(reach*.9))]:[0,0,0],
    root=add(baseRoot,socketOffset),
    // The support path is ground-space, independent of the rocking sockets.
    foot=[side*(front?4.8:4.7),1.15+lift,(front?9.5:-12)+z+(front?(moving?0:.25):.65)],
    // During the rear kick the sole turns rearward, rather than remaining
    // almost parallel to the ground. Positive pitch rotates the DOWNWARD
    // sole normal to [0,-cos(pitch),-sin(pitch)] in these Y-up/Z-forward axes.
    // The C2 kick weight rejoins normal collection; support stays flat.
    pitch=fold*(walking?.42:fast?(front?1.15:.9):(front?.92:.72))*(1-rearKick)+rearKick*1.5;
   // Keep the raised forward arc inside the constant-length chain's reach.
   // This is foot clearance, never limb stretching or a changed stance path.
   if(front&&fast&&!stance){const dz=foot[2]-root[2],dx=foot[0]-root[0],
    minY=root[1]-Math.sqrt(Math.max(0,(20-.25*fold)**2-dz*dz-dx*dx));
    foot[1]=smoothMax(foot[1],minY,.35);
   }
   let limb;
   if(front){
    if(!moving)limb=ik(root,foot,10,10,[0,0,-1]);
    else{
     // Split the existing proximal 10 units into humerus 4 + forearm 6.
     // Elbow folds back under the shoulder; carpus folds forward. Support
     // compression belongs mainly to the hidden elbow, not a broken knee.
     const unfold=fast&&!stance?Math.max(0,Math.min(1,(u-.30)/.26)):0,
      elbowFold=fold*(1-smoothStep(unfold)),
      delta=sub(foot,root),d=len(delta),axis=Math.atan2(delta[2],-delta[1]),
      cone=Math.acos(Math.max(-1,Math.min(1,(d*d+4*4-15.999**2)/(2*d*4)))),
      // Do not let the carpus curl into the chest during collection. These
      // are authored rig limits, not angles measured from the video.
      lowerReach=Math.sqrt(6*6+10*10+120*Math.cos((fast?105:95)*Math.PI/180)),
      minCone=Math.acos(Math.max(-1,Math.min(1,(d*d+16-lowerReach*lowerReach)/(8*d)))),
      // A collected foreleg should not leave its humerus almost horizontal
      // behind the chest. Blend this bounded pickup pose only in flight;
      // support keeps its long, lightly flexed chain. The lower air arc is
      // coordinated with this upper pose so the carpus does not hook high.
      wantedCone=cone*(.97-.80*elbowFold),pickup=!stance?smoothStep(u/.12)*smoothStep((1-u)/.12):0,backLimit=fast?.78:walking?.95:.86,
      limitedCone=-smoothMax(-wantedCone,-Math.max(0,axis+backLimit),.08),boundedCone=wantedCone+(limitedCone-wantedCone)*pickup;
     let theta=axis-smoothMax(boundedCone,minCone,Math.max(1e-8,Math.min(.16,cone*.08)));
     if(fast&&!stance){
      // Lead the upper arm through one broad recovery sweep. Following the
      // reach cone alone held it at the back stop, then threw it forward as
      // that cone narrowed near extension. This phase-only C2 envelope has
      // no frame history; support and the last tenth of flight stay exact.
      const shoulderMax=(a,b,width)=>{const h=Math.max(width-Math.abs(a-b),0)/width;return Math.max(a,b)+h*h*h*width/6;},
       sweep=-.78+1.28*smoothStep((u-.08)/.52),weight=smoothStep(u/.24)*smoothStep((.90-u)/.30),
       // Stay inside the same fixed-length reach and carpus-flexion limits.
       // Smooth both bounds, rather than clipping the new sweep at a corner.
       target=axis-shoulderMax(-shoulderMax(-cone*.97,-axis+sweep,.12),minCone,Math.max(1e-8,Math.min(.12,cone*.08)));
      theta+=(target-theta)*weight;
     }
     const elbow=add(root,[0,-4*Math.cos(theta),4*Math.sin(theta)]),lower=ik(elbow,foot,6,10,[0,0,1]);
     limb={...lower,root,elbow,shoulder:len(sub(elbow,root)),forearm:lower.a,a:len(sub(elbow,root))+lower.a};
    }
   }
   else{
    // Equine hind limb: forward stifle, backward hock, then the long cannon.
    // The old two-link chain mistook the forward stifle for the ankle/hock.
    // Solve the thigh/shank to a hock behind the hoof; cannon stays 8.2 units.
    const cannon=8.2,back=moving?.8+z*.5+fold*(walking?.9:1.6):.75,
     delta=sub(root,foot),d=Math.hypot(delta[1],delta[2]),axis=Math.atan2(delta[2],delta[1]),
     reach=Math.sqrt(12.599**2-delta[0]**2),cone=Math.acos(Math.max(-1,Math.min(1,(d*d+cannon*cannon-reach*reach)/(2*d*cannon)))),
     theta=Math.max(axis-cone,Math.min(axis+cone,Math.asin(-back/cannon))),
     // The stifle folds forward in the leg's own plane, without a sideways
     // knee kick. Feet keep their ground track and all three bones stay fixed.
     hock=add(foot,[0,cannon*Math.cos(theta),cannon*Math.sin(theta)]),upper=ik(root,hock,6.3,6.3,[0,0,1]);
    limb={...upper,hock:upper.end,end:foot,cannon:len(sub(foot,upper.end))};
   }
   legs.push({...limb,front,side,baseRoot,socketOffset,shoulderLoad,phase:ph,pitch,stance:!moving||stance,target:foot,
    contactSpeed:moving?2*reach/(duty*cycle):0});
  }
  // Horse size changes independently of the rider's fixed mounted bones.
  const horseLegs=legs.map(l=>({...l,root:mul(l.root,horseScale),baseRoot:mul(l.baseRoot,horseScale),socketOffset:mul(l.socketOffset,horseScale),joint:mul(l.joint,horseScale),end:mul(l.end,horseScale),target:mul(l.target,horseScale),elbow:l.elbow&&mul(l.elbow,horseScale),shoulder:l.shoulder&&l.shoulder*horseScale,forearm:l.forearm&&l.forearm*horseScale,hock:l.hock&&mul(l.hock,horseScale),a:l.a*horseScale,b:l.b*horseScale,cannon:l.cannon&&l.cannon*horseScale,contactSpeed:l.contactSpeed*horseScale}));
  // Mounted-only proportion adjustment requested by the user: longer thighs
  // and greaves, not a stretched torso or a moving seat. Knees wrap forward
  // around the blanket, while the feet hang lower and slightly behind them.
  // These lengths are constant through every yaw/pose; stirrups use the same ends.
  const riderLegs=[-1,1].map(side=>({...ik([side*1.9,seat,0],[side*7.9,seat-10.8,2.1],6.8,7.2,[side,0,.6]),side}));
  const handLag=moving?(walking?.07:fast?.28*gaitBodyWeight:.16)*Math.sin(phase*(fast?1:2)-.45):0;
  const armChains=[-1,1].map(side=>{const root=[side*3.7,seat+8.9,0],rest=[side*2.9,seat+4.3+handLag,6.3+handLag*.65];
   return {...ik(root,rest,5,5.1,[side*.28,-.8,-.5]),side};
  });
  const origin=[0,seat-12,0],origin2=project(origin),local=p=>{const q=project(p);return [q[0]-origin2[0],q[1]-origin2[1]];};
  const arms=armChains.map(l=>{const [sx,sy]=local(l.root),[ex,ey]=local(l.joint),[hx,hy]=local(l.end);return {sx,sy,ex,ey,hx,hy,
   walkDepth:{shoulder:depth(l.root),upper:depth(l.joint),hand:depth(l.end),weight:0},physical:l};});
  const nativeLegs=riderLegs.map(l=>{const [hx,hy]=local(l.root),[kx,ky]=local(l.joint),[fx,fy]=local(l.end);return {hx,hy,kx,ky,fx,fy,bootAngle:0};});
  return {angle,time,motion,bob,seat,horseScale,cycle,phase,headNod,tailSway,tailLift,bodyPitch,bodyRock,rumpDrive,rumpHeave,rumpPitch,bodyFlex,abdomenTuck,bodyPoint,project,depth,legs:horseLegs,riderLegs,armChains,origin:origin2,
   native:{degrees:Math.min(mod(angle,360),360-mod(angle,360)),direction:mod(angle,360)<=180?1:-1,clock:time,breath:false,lighting:'daylight',solidTurn:true,neckOverShoulders:true,body:{x:0,y:0,lean:0},arms,legs:nativeLegs}};
 }
 window.KRMountedRig={sample,ik,add,sub,mul,unit,gaits};
})();
