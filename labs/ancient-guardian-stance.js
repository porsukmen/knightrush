/* Lab-only idle -> shoulder guard -> first heavy combo cut. No gameplay effects.
 * Rigid prop/hand attachment, two-bone limbs, planted feet, forward-facing head.
 * All colours and geometry come from the reviewed sculpture, never a new model.
 */
(()=>{'use strict';
 const duration=2.8,attackDuration=3.3,totalDuration=duration+attackDuration,spinDuration=3.65,comboDuration=totalDuration+spinDuration,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*x*(10+x*(-15+6*x));},phase=(t,a,b)=>ease((t-a)/(b-a)),
 add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,k)=>a.map(x=>x*k),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],len=a=>Math.hypot(...a),unit=a=>mul(a,1/(len(a)||1)),mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
 const identity=p=>p.slice(),rotateY=(p,a)=>[p[0]*Math.cos(a)+p[2]*Math.sin(a),p[1],-p[0]*Math.sin(a)+p[2]*Math.cos(a)],rotateX=(p,a)=>[p[0],p[1]*Math.cos(a)-p[2]*Math.sin(a),p[1]*Math.sin(a)+p[2]*Math.cos(a)],rotateZ=(p,a)=>[p[0]*Math.cos(a)-p[1]*Math.sin(a),p[0]*Math.sin(a)+p[1]*Math.cos(a),p[2]];
 function rotation(a,b){a=unit(a);b=unit(b);const v=cross(a,b),c=dot(a,b);if(c>1-1e-10)return identity;if(c<-.99999)return p=>[-p[0],-p[1],p[2]];return p=>add(add(p,cross(v,p)),mul(cross(v,cross(v,p)),1/(1+c)));}
 function bone(a,b,A,B){const r=rotation(sub(b,a),sub(B,A));return {p:p=>add(A,r(sub(p,a))),n:r};}
 function ik(a,b,L1,L2,pole){const d= sub(b,a),distance=Math.min(L1+L2,Math.max(Math.abs(L1-L2)+.00001,len(d))),axis=unit(d),along=(L1*L1-L2*L2+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,L1*L1-along*along)),perpendicular=sub(pole,mul(axis,dot(pole,axis))),v=len(perpendicular)>1e-8?unit(perpendicular):unit(cross(axis,Math.abs(axis[2])<.9?[0,0,1]:[1,0,0]));return add(add(a,mul(axis,along)),mul(v,height));}
 const sourceShoulder=[-18.9,-70,0],sourceElbow=[-19,-55.7,-1.5],sourceWrist=[-2.8,-63.5,-13.5],sourceGrip=[0,-55.8,-13.5],armLengths=[len(sub(sourceElbow,sourceShoulder)),len(sub(sourceWrist,sourceElbow))];
 let contactVertices;
 function swordSupport(rotate){
  if(!contactVertices){const unique=new Map();for(const f of KRAncientGuardian.parts['great-stone-sword'])for(const p of f.v)unique.set(p.join(','),sub(p,sourceGrip));contactVertices=[...unique.values()];}
  // A rigid rotation is linear. Evaluate its axes once, not its nested
  // authoring chain for every blade vertex at every override layer.
  const x=rotate([1,0,0]),y=rotate([0,1,0]),z=rotate([0,0,1]);let best=contactVertices[0],height=-Infinity;
  for(const v of contactVertices){const h=x[1]*v[0]+y[1]*v[1]+z[1]*v[2];if(h>height){height=h;best=v;}}
  return [x[0]*best[0]+y[0]*best[1]+z[0]*best[2],height,x[2]*best[0]+y[2]*best[1]+z[2]*best[2]];
 }
 function sample(time){if(time>totalDuration)return sampleSpin(time);const t=Math.max(0,Math.min(totalDuration,time)),attackTime=Math.max(0,t-duration),wind=phase(attackTime,0,1.65),strike=phase(attackTime,2.05,2.23),secondStep=phase(attackTime,2.03,2.23),transfer=phase(attackTime,2.03,2.28),drive=phase(attackTime,1.98,2.22),follow=phase(attackTime,2.23,2.7),settle=phase(attackTime,2.7,attackDuration),grab=phase(t,0,.5),rack=phase(t,.5,2.8),turn=phase(t,.35,1.7),step=phase(t,1.05,1.85),bend=phase(t,.3,2.7),yaw=(-40*turn+40*wind)*Math.PI/180,drop=7.5*bend-6.3*wind+11.5*drive+2*follow-.8*settle,lean=(8*bend-8*wind+32*drive+7*follow-3*settle)*Math.PI/180,roll=(-3*drive+6*transfer)*Math.PI/180,root=[-3*drive+5*transfer,drop,5*turn-7*drive-follow+settle-6*transfer],hipPivot=[0,-43,0];
  const bodyRotation=p=>rotateZ(rotateY(rotateX(p,lean),yaw),roll),body={p:p=>add(add(bodyRotation(sub(p,hipPivot)),hipPivot),root),n:bodyRotation},neckPivot=[0,-79,0],headAnchor=body.p(neckPivot),headNod=(12*drive+2*follow-3*settle)*Math.PI/180,head={p:p=>add(headAnchor,rotateX(sub(p,neckPivot),headNod)),n:p=>rotateX(p,headNod)};
  // Lift the rigid mantle about its shoulder attachment as the knees load;
  // no cloth deformation or flutter, and its carved hem stays above ground.
  const capePivot=[0,-76,5],capeAngle=(8*bend+4*wind)*Math.PI/180,cape={p:p=>body.p(add(capePivot,rotateX(sub(p,capePivot),capeAngle))),n:n=>body.n(rotateX(n,capeAngle))};
  // World-space grip: the torso turns underneath the held sword, rather than
  // dragging it sideways and making the hand return across the chest.
  // Derive the destination from the reviewed final shoulder pose only.
  const finalYaw=-40*Math.PI/180,finalLean=8*Math.PI/180,finalGrip=add(add(rotateY(rotateX(sub([-21,-71.15,-14],hipPivot),finalLean),finalYaw),hipPivot),[0,7.5,5]);
  let grip=mix(sourceGrip,finalGrip,rack);
  // A single reverse lift with a gradual oblique angle, independent of body
  // yaw/lean. No side waypoint, bank reversal or extra torso-induced spin.
  const weaponAngle=-(2*Math.PI-Math.acos(-.49))*rack,readyPitch=weaponAngle+finalLean*rack,cutPitch=-Math.acos(.30),pitch=readyPitch+(-Math.PI-readyPitch)*wind+(Math.PI+cutPitch)*strike,weaponYaw=finalYaw*rack*(1-wind),edgeTurn=-Math.PI/2*phase(attackTime,1.95,2.23),weaponRotation=p=>rotateY(rotateX(rotateY(p,edgeTurn),pitch),weaponYaw),weaponDirection=weaponRotation([0,1,0]);
  // Keep the arm straight throughout the downswing. Solve the shoulder arc
  // against the actual blade's lowest edge, not an invented floor offset.
  // The right foot receives the weight, while the left hand retains its grip.
  if(t>duration){const shoulder=body.p(sourceShoulder),reach=armLengths[0]+armLengths[1]-.15*(1-phase(attackTime,1.7,2.03)),endRotation=p=>rotateX(rotateY(p,-Math.PI/2),cutPitch),support=swordSupport(endRotation),gripOffset=endRotation([2.8,0,0]),endDown=Math.max(-1,Math.min(1,(-shoulder[1]-gripOffset[1]-support[1])/reach)),armAngle=Math.acos(-endDown)*strike,straightWrist=add(shoulder,rotateX([0,-reach,0],armAngle)),straightGrip=sub(straightWrist,weaponRotation([-2.8,0,0]));grip=mix(finalGrip,straightGrip,wind);}
  const weapon={p:p=>add(grip,weaponRotation(sub(p,sourceGrip))),n:weaponRotation};
  const hand={p:p=>weapon.p(add(p,[0,7.7*grab,0])),n:weapon.n},wrist=hand.p(sourceWrist),shoulder=body.p(sourceShoulder);
  const pole=unit(body.n(mix(sub(sourceElbow,sourceShoulder),[-1.7,14,-3.9],grab))),elbow=ik(shoulder,wrist,...armLengths,pole),upper=bone(sourceShoulder,sourceElbow,shoulder,elbow),forearm=bone(sourceElbow,sourceWrist,elbow,wrist);
  const legs=[-1,1].map(side=>{const H=[side*6.5,-43,0],K=[side*6.5,-26,0],A=[side*6.5,-2,0],h=body.p(H),q=side>0?step:phase(t,.5,1),footStep=side>0?secondStep:0,x=side*3.5*q+side*2*footStep,z=side>0?11*q-28*footStep:-2*q-15*footStep,up=(side>0?1.6:1.1)*Math.sin(Math.PI*q)+(side>0?4:3.5)*Math.sin(Math.PI*footStep),a=[A[0]+x,A[1]-up,z],k=ik(h,a,17,24,rotateY([0,0,-1],yaw)),footYaw=(-40*q*(1-footStep)+(side<0?40*wind:0))*Math.PI/180;
   // Left sole pivots in place as the torso squares up; it never takes a step.
   return {side,hip:h,knee:k,ankle:a,footLift:up,footYaw,thigh:bone(H,K,h,k),shin:bone(K,A,k,a),foot:{p:p=>add(a,rotateY(sub(p,A),footYaw)),n:n=>rotateY(n,footYaw)}};});
  if(t===0){for(const b of [body,head,cape,weapon,hand,upper,forearm,...legs.flatMap(l=>[l.thigh,l.shin,l.foot])]){b.p=identity;b.n=identity;}}
  const label=t<=duration?(t<.5?'Kabzayı kavra':t<1.4?'Kılıcı kaldır':t<duration?'Sol omza yerleştir':'Battle stance'):attackTime<1.65?'Ağır kaldırış · doğrul':attackTime<2.05?'Dik kılıç · gerilim':attackTime<2.23?'Dikey ağır indiriş':attackTime<2.7?'Ağırlığı karşıla':'Kombo devam pozu';
  const contact=t>duration?add(grip,swordSupport(weaponRotation)):null;
  return {time:t,attackTime,grab,body,head,cape,weapon,hand,upper,forearm,legs,grip,wrist,shoulder,elbow,yaw,drop,lean,weaponAngle,edgeTurn,contact,phase:label,weaponDirection};
 }
 let spinEntry;
 function sampleSpin(time){const u=Math.max(0,Math.min(spinDuration,time-totalDuration)),D=Math.PI/180,push=phase(u,0,.7),rise=phase(u,0,1.2),prepare=phase(u,0,1.5),transfer=phase(u,1.3,1.88),turn=phase(u,.4,1.55),resume=phase(u,1.88,2.45),fast=phase(u,2.45,2.77),swipe=phase(u,2.65,2.98),settle=phase(u,2.98,spinDuration),handoffYaw=160*D,yaw=handoffYaw*turn+(40*resume+160*fast)*D,lean=(36-24*rise+5*swipe-2*settle)*D,roll=(3*(1-rise)-5*swipe+3*settle)*D,drop=13.9-5.4*rise+2.4*swipe-settle,root=[2+7*push-transfer,drop,-8-7*push+7*transfer],hipPivot=[0,-43,0],pivot=[12,-2,-17],leftPlant=add(pivot,rotateY([-5,0,10],handoffYaw));
  spinEntry ||= sample(totalDuration);
  // Two footfalls only: left crosses just behind right to take the weight;
  // right travels low through the sweep and settles directly into the end pose.
  const turnCentre=leftPlant,turnPoint=p=>u<=1.55?add(pivot,rotateY(sub(p,pivot),yaw)):add(turnCentre,rotateY(sub(add(pivot,rotateY(sub(p,pivot),handoffYaw)),turnCentre),yaw-handoffYaw)),localRotation=p=>rotateZ(rotateX(p,lean),roll),body={p:p=>turnPoint(add(add(localRotation(sub(p,hipPivot)),hipPivot),root)),n:n=>rotateY(localRotation(n),yaw)};
  const neckPivot=[0,-79,0],headAnchor=body.p(neckPivot),nod=(11*(1-rise)+3*swipe)*D,headRotation=p=>rotateY(rotateX(p,nod),yaw),head={p:p=>add(headAnchor,headRotation(sub(p,neckPivot))),n:headRotation},capePivot=[0,-76,5],capeAngle=(12+6*rise)*D,cape={p:p=>body.p(add(capePivot,rotateX(sub(p,capePivot),capeAngle))),n:n=>body.n(rotateX(n,capeAngle))};
  // Unpose the exact first-strike grip, then carry it across the front of the
  // torso. A bent left elbow places the hand on anatomical right before release.
  const entryLocal=add(hipPivot,rotateX(rotateZ(sub(sub(spinEntry.grip,[2,13.9,-8]),hipPivot),-3*D),-36*D)),localGrip=mix(mix(entryLocal,[3,-62,-20],prepare),[-23,-61,-21],swipe),pitch=-Math.acos(.30)+(-Math.PI/2+Math.acos(.30))*prepare,heading=yaw+(-90*prepare+160*swipe)*D,edgeTurn=-Math.PI/2*(1-prepare),weaponRotation=p=>rotateY(rotateX(rotateY(p,edgeTurn),pitch),heading),shoulder=body.p(sourceShoulder),extend=phase(u,2.65,2.75),driveDirection=rotateY([0,0,-1],yaw+70*D*swipe),driveWrist=add(shoulder,mul(driveDirection,armLengths[0]+armLengths[1])),driveGrip=sub(driveWrist,weaponRotation([-2.8,0,0])),grip=mix(body.p(localGrip),driveGrip,extend),weapon={p:p=>add(grip,weaponRotation(sub(p,sourceGrip))),n:weaponRotation},hand={p:p=>weapon.p(add(p,[0,7.7,0])),n:weapon.n},wrist=hand.p(sourceWrist);
  const pole=unit(mix(spinEntry.body.n([-1.7,14,-3.9]),body.n([-4,12,-9]),prepare)),elbow=ik(shoulder,wrist,...armLengths,pole),upper=bone(sourceShoulder,sourceElbow,shoulder,elbow),forearm=bone(sourceElbow,sourceWrist,elbow,wrist);
  const release=phase(u,.48,.8),land=phase(u,1.15,1.55),heel=.28*phase(u,.1,.45)*(1-release),crossStep=phase(u,.8,1.55),lift=8*release*(1-land),leftYaw=yaw*release,leftAnkle=u<1.55?add(pivot,rotateY(mix([-22,0,15],[-5,0,10],crossStep),leftYaw)):leftPlant.slice();leftAnkle[1]-=lift;
  // The right foot does not replant during preparation or change the support
  // again. One low free-foot arc ends in a wider, grounded recovery stance.
  const finishStep=phase(u,1.88,2.98),rightLift=3*Math.sin(Math.PI*finishStep),rightAnkle=u<=1.88?pivot.slice():add(add(leftPlant,rotateY(sub(pivot,leftPlant),yaw-handoffYaw)),rotateY([5*phase(u,2.45,2.98),0,0],yaw));rightAnkle[1]-=rightLift;
  const legs=[-1,1].map(side=>{const H=[side*6.5,-43,0],K=[side*6.5,-26,0],A=[side*6.5,-2,0],h=body.p(H),footYaw=side>0?yaw:leftYaw,base=side>0?rightAnkle:leftAnkle,footPoint=p=>{let v=sub(p,A);if(side<0)v=sub(rotateX(add(v,[0,-2,6.6]),heel),[0,-2,6.6]);return add(base,rotateY(v,footYaw));},a=footPoint(A),k=ik(h,a,17,24,rotateY([0,0,-1],yaw));return {side,hip:h,knee:k,ankle:a,footLift:side>0?rightLift:lift,footYaw,thigh:bone(H,K,h,k),shin:bone(K,A,k,a),foot:{p:footPoint,n:n=>rotateY(rotateX(n,side<0?heel:0),footYaw)}};});
  return {time:totalDuration+u,spinTime:u,grab:1,body,head,cape,weapon,hand,upper,forearm,legs,grip,wrist,shoulder,elbow,yaw,drop,lean,weaponAngle:pitch,edgeTurn,weaponDirection:weaponRotation([0,1,0]),contact:add(grip,swordSupport(weaponRotation)),phase:u<.7?'Sol ayakla itiş':u<1.55?'Ağır dönüş':u<1.88?'Sol ayağı sağın arkasına bas · ağırlığı aktar':u<2.65?'Sol destek üzerinde dönüş':u<2.98?'Sol destek · düz kolla savuruş':'Doğrudan bitiş duruşu'};
 }
 // Editor-only pose overrides. Keep the authored sampler pure and untouched.
 function applyEdits(base,e){if(!e||!Object.keys(e).length)return base;const issues=[],v=k=>e[k]?.p||[0,0,0],angles=k=>(e[k]?.r||[0,0,0]).map(x=>x*Math.PI/180),euler=(p,r)=>rotateY(rotateZ(rotateX(p,r[0]),r[2]),r[1]),br=angles('body'),anchor=base.body.p([0,-43,0]),bodyShift=v('body').slice(),dr=p=>euler(p,br),raw=p=>add(anchor,dr(sub(p,anchor)));let minimum=-Infinity,maximum=Infinity;for(const [i,l] of base.legs.entries()){const key=i?'rightFoot':'leftFoot';if(e[key]?.ground??(l.footLift<.001)){const y=raw(l.hip)[1];minimum=Math.max(minimum,-43-y);maximum=Math.min(maximum,-9.001-y);}}const upperOnly=(e.torso||e.leftShoulder||e.rightShoulder)&&!['body','leftFoot','rightFoot','leftKnee','rightKnee'].some(k=>e[k]&&([...(e[k].p||[]),...(e[k].r||[])].some(Boolean)||typeof e[k].ground==='boolean')),corrected=upperOnly?bodyShift[1]:Math.max(minimum,Math.min(maximum,bodyShift[1]));if(corrected!==bodyShift[1]){bodyShift[1]=corrected;issues.push('Gövde zemin / bacak sınırında');}const dp=p=>add(raw(p),bodyShift),wrap=b=>({p:p=>dp(b.p(p)),n:n=>dr(b.n(n))}),body=wrap(base.body);
  // The old body channel remains the pelvis/root. New upper-body controls
  // pivot about attached waist/clavicle roots; dragging aims a fixed-length
  // link instead of translating a floating chest or stretching a shoulder.
  function jointEdit(key,pivot,point){
   const r=angles(key),shift=v(key);if(![...r,...shift].some(Boolean))return{p:p=>p,n:n=>n};
   const lever=euler(sub(point,pivot),r),target=add(lever,shift);let aim=identity;
   if(len(target)>1e-6){const a=unit(lever),b=unit(target);if(dot(a,b)<-.99999){const axis=unit(cross(a,Math.abs(a[0])<.8?[1,0,0]:[0,1,0]));aim=n=>sub(mul(axis,2*dot(axis,n)),n);}else aim=rotation(lever,target);}
   const n=p=>aim(euler(p,r));return{p:p=>add(pivot,n(sub(p,pivot))),n};
  }
  const baseTorso=base.torso||base.body,t=jointEdit('torso',body.p([0,-50,0]),dp(baseTorso.p([0,-65,0]))),up=p=>t.p(dp(p)),un=n=>t.n(dr(n)),upperWrap=b=>({p:p=>up(b.p(p)),n:n=>un(b.n(n))}),torso=upperWrap(baseTorso),cape=upperWrap(base.cape);
  const leftBase=base.leftShoulder||baseTorso,rightBase=base.rightShoulder||baseTorso,left=jointEdit('leftShoulder',torso.p([-12.8,-73,0]),up(leftBase.p(sourceShoulder))),right=jointEdit('rightShoulder',torso.p([12.8,-73,0]),up(rightBase.p([17,-71,0]))),lp=p=>left.p(up(p)),ln=n=>left.n(un(n)),leftShoulder={p:p=>lp(leftBase.p(p)),n:n=>ln(leftBase.n(n))},rightShoulder={p:p=>right.p(up(rightBase.p(p))),n:n=>right.n(un(rightBase.n(n)))};
  const neck=torso.p([0,-79,0]),hr=angles('head'),head={p:p=>add(neck,euler(sub(up(base.head.p(p)),neck),hr)),n:n=>euler(un(base.head.n(n)),hr)},wr=angles('weapon'),weaponRotation=p=>euler(euler(ln(base.weapon.n(rotateY(p,(e.weapon?.roll||0)*Math.PI/180))),angles('hand')),wr),shoulder=leftShoulder.p(sourceShoulder);
  let grip=add(lp(base.grip),v('hand'));const wristOffset=weaponRotation([-2.8,7.7*(base.grab-1),0]),requestedWrist=add(grip,wristOffset),armVector=sub(requestedWrist,shoulder),reach=armLengths[0]+armLengths[1];if(len(armVector)>reach||len(armVector)<Math.abs(armLengths[1]-armLengths[0])+.0001){const armReach=Math.min(reach,Math.max(Math.abs(armLengths[1]-armLengths[0])+.0001,len(armVector))),axis=len(armVector)>.00001?unit(armVector):[0,0,-1];grip=sub(add(shoulder,mul(axis,armReach)),wristOffset);issues.push('El erişim sınırında');}
  const weapon={p:p=>add(grip,weaponRotation(sub(p,sourceGrip))),n:weaponRotation},hand={p:p=>weapon.p(add(p,[0,7.7*base.grab,0])),n:weaponRotation},wrist=hand.p(sourceWrist),elbowTarget=add(lp(base.elbow),v('elbow')),elbow=ik(shoulder,wrist,...armLengths,euler(sub(elbowTarget,shoulder),angles('elbow'))),upper=bone(sourceShoulder,sourceElbow,shoulder,elbow),forearm=bone(sourceElbow,sourceWrist,elbow,wrist);
  const legs=upperOnly?base.legs:base.legs.map((l,index)=>{const key=index?'rightFoot':'leftFoot',kkey=index?'rightKnee':'leftKnee',H=[l.side*6.5,-43,0],K=[l.side*6.5,-26,0],A=[l.side*6.5,-2,0],hip=body.p(H),ground=e[key]?.ground??(l.footLift<.001),fr=angles(key),footYaw=l.footYaw+fr[1],fn=ground?n=>euler(rotateY(n,l.footYaw),fr):n=>euler(l.foot.n(n),fr),floorY=-Math.max(...[-3.8,3.8].flatMap(x=>[-6.6,3].map(z=>fn([x,2,z])[1])));let ankle=add(l.ankle,v(key));if(ground)ankle[1]=floorY;let delta=sub(ankle,hip);if(len(delta)<7.0001){ankle=add(hip,mul(len(delta)>.00001?unit(delta):[0,1,0],7.0001));issues.push('Diz katlanma sınırında');}if(len(delta)>41){if(ground&&Math.abs(delta[1])<=41){const radius=Math.sqrt(Math.max(0,41*41-delta[1]*delta[1])),flat=Math.hypot(delta[0],delta[2])||1;ankle=[hip[0]+delta[0]/flat*radius,floorY,hip[2]+delta[2]/flat*radius];}else ankle=add(hip,mul(unit(delta),41));issues.push((index?'Sağ':'Sol')+' bacak erişim sınırında');}const kneeTarget=add(dp(l.knee),v(kkey)),knee=ik(hip,ankle,17,24,euler(sub(kneeTarget,hip),angles(kkey))),foot={p:p=>add(ankle,fn(sub(p,A))),n:fn};return {...l,hip,knee,ankle,footYaw,footLift:Math.max(0,floorY-ankle[1]),thigh:bone(H,K,hip,knee),shin:bone(K,A,knee,ankle),foot};});
  const upperEdits=base.torso||e.torso||e.leftShoulder||e.rightShoulder?{torso,leftShoulder,rightShoulder}:{};
  return {...base,body,...upperEdits,cape,head,weapon,hand,shoulder,wrist,grip,elbow,upper,forearm,legs,weaponDirection:weapon.n([0,1,0]),editorIssues:issues,phase:'Elle düzenlenen poz',contact:add(grip,swordSupport(weaponRotation))};
 }
 const userPoseTime=7.49,userPoseEdits={body:{p:[.1469105767688251,3.131404615415047,-8.321205225339781]},leftFoot:{p:[-11.351997700424105,16.432160382907053,-18.737717715991906],ground:true}};
 let authoredAnchor;
 function sampleUserPose(time){if(time<=totalDuration)return sample(time);const t=Math.min(comboDuration,time),u=t-totalDuration;
  if(t<userPoseTime){const b=sample(t),weight=phase(u,.48,userPoseTime-totalDuration),edits={body:{p:mul(userPoseEdits.body.p,weight)},leftFoot:{p:[userPoseEdits.leftFoot.p[0]*weight,(-2-b.legs[0].ankle[1])*weight,userPoseEdits.leftFoot.p[2]*weight],ground:false}};if(!weight)return b;const p=applyEdits(b,edits);p.phase='Poz 1’e geç · sol ayağı yerleştir';return p;}
  authoredAnchor ||= applyEdits(sample(userPoseTime),userPoseEdits);
  const a=authoredAnchor,v=t-userPoseTime,D=Math.PI/180,wind=phase(v,.2,.9),fast=phase(v,.96,1.28),swipe=phase(v,1.18,1.51),extend=phase(v,1.18,1.28),settle=phase(v,1.51,comboDuration-userPoseTime),turn=(200*D-a.yaw)*wind+160*D*fast,yaw=a.yaw+turn,pivot=a.legs[0].ankle,hip=a.body.p([0,-43,0]),balanced=add(pivot,rotateY([3,0,0],a.yaw)),weight=phase(v,0,.7),shift=[(balanced[0]-hip[0])*weight,-2*wind+4*swipe-settle,(balanced[2]-hip[2])*weight],dp=p=>add(pivot,rotateY(add(sub(p,pivot),shift),turn)),dn=n=>rotateY(n,turn),wrap=b=>({p:p=>dp(b.p(p)),n:n=>dn(b.n(n))}),body=wrap(a.body),head=wrap(a.head),cape=wrap(a.cape),shoulder=body.p(sourceShoulder),weaponRotation=p=>rotateY(a.weapon.n(p),turn+160*D*swipe),driveDirection=rotateY([0,0,-1],yaw+70*D*swipe),driveWrist=add(shoulder,mul(driveDirection,armLengths[0]+armLengths[1])),driveGrip=sub(driveWrist,weaponRotation([-2.8,0,0])),grip=mix(dp(a.grip),driveGrip,extend),weapon={p:p=>add(grip,weaponRotation(sub(p,sourceGrip))),n:weaponRotation},hand={p:p=>weapon.p(add(p,[0,7.7,0])),n:weaponRotation},wrist=hand.p(sourceWrist),elbow=ik(shoulder,wrist,...armLengths,sub(dp(a.elbow),shoulder)),upper=bone(sourceShoulder,sourceElbow,shoulder,elbow),forearm=bone(sourceElbow,sourceWrist,elbow,wrist);
  // Keep the user's left sole exactly planted. The right foot travels once,
  // unloaded, and settles into recovery without a second support exchange.
  const rightLift=3.5*phase(v,.2,.48)*(1-phase(v,1.51,1.82)),rightOrbit=add(pivot,rotateY(mul(sub(a.legs[1].ankle,pivot),1-.14*phase(v,.2,.7)),turn)),rightEnd=add(pivot,[14,0,-4]),rightAnkle=mix(rightOrbit,rightEnd,phase(v,.85,1.51));rightAnkle[1]-=rightLift;
  const legs=a.legs.map((l,i)=>{const H=[l.side*6.5,-43,0],K=[l.side*6.5,-26,0],A=[l.side*6.5,-2,0],h=body.p(H),ankle=i?rightAnkle:pivot.slice(),footYaw=l.footYaw+turn,knee=ik(h,ankle,17,24,mix(dn(sub(l.knee,l.hip)),rotateY([0,0,-17],yaw),phase(v,.3,1.28))),foot={p:p=>add(ankle,rotateY(sub(p,A),footYaw)),n:n=>rotateY(n,footYaw)};return {...l,hip:h,knee,ankle,footYaw,footLift:i?rightLift:0,thigh:bone(H,K,h,knee),shin:bone(K,A,knee,ankle),foot};});
  return {...a,time:t,spinTime:u,body,head,cape,shoulder,grip,weapon,hand,wrist,elbow,upper,forearm,legs,yaw,weaponDirection:weaponRotation([0,1,0]),contact:add(grip,swordSupport(weaponRotation)),phase:v<.2?'Poz 1 · sol ayağa ağırlık':v<.96?'Sol destek üzerinde ağır dönüş':v<1.51?'Sol destekle hızlı savuruş':'Doğrudan bitiş duruşu',editorIssues:[]};
 }
 // Versioned breakdown: preserve v0/v1 so saved editor offsets never apply twice.
 const widePoseTime=7.25,widePoseEdits={leftFoot:{p:[12.85408849724243,2.142348082873724,0],ground:true}};
 function sampleWidePose(time){
  const base=sampleUserPose(time);if(time<=6.58||time>=userPoseTime)return base;
  if(Math.abs(time-widePoseTime)<1e-9){const p=applyEdits(base,widePoseEdits);p.phase='Poz 2 · sol ayağı geniş aç';return p;}
  const arriving=time<widePoseTime,q=phase(time,widePoseTime,userPoseTime),w=arriving?phase(time,6.58,widePoseTime):1-q;
  // The wide breakdown touches down; lift again briefly while moving to the
  // support key instead of dragging a planted sole across the floor.
  const y=arriving?base.legs[0].ankle[1]*(1-w)-2*w:-2-1.6*Math.sin(Math.PI*q)**2;
  const p=applyEdits(base,{leftFoot:{p:[widePoseEdits.leftFoot.p[0]*w,y-base.legs[0].ankle[1],0],ground:false}});
  p.phase=arriving?'Poz 2’ye geç · sol ayağı geniş aç':'Poz 2 → Poz 1 · sol desteğe yerleş';return p;
 }
 // v3 keeps the wider breakdown airborne; only Poz 1 accepts body weight.
 // Keep v2 immutable for any drafts created before this timing adjustment.
 function sampleAirbornePose(time){
  const base=sampleWidePose(time);if(time<=6.58||time>=userPoseTime)return base;
  const lift=3.2*phase(time,6.58,7.08)*(1-phase(time,7.30,userPoseTime));
  const p=applyEdits(base,{leftFoot:{p:[0,-lift,0],ground:false}});
  p.phase=time<7.30?'Sol ayak havada · geniş dönüş':'Sol ayağı son destek pozuna indir';return p;
 }
 // User video: cross-behind turn, compact arm across the chest, then a
 // committed forward lunge/sweep. Exaggerate only the aerial silhouette/impact.
 function aimRotation(from,to,amount){
  const a=unit(from),b=unit(to),axis=unit(cross(a,b)),angle=Math.acos(Math.max(-1,Math.min(1,dot(a,b))))*amount,c=Math.cos(angle),sn=Math.sin(angle);
  if(len(axis)<1e-8)return identity;return p=>add(add(mul(p,c),mul(cross(axis,p),sn)),mul(axis,dot(axis,p)*(1-c)));
 }
 function sampleReferenceSpin(time,anchor=null,grounded=false,alignFeet=false,stepped=false){
  if(time<=userPoseTime)return sampleAirbornePose(time);
  const a=anchor||sampleAirbornePose(userPoseTime),t=Math.min(time,comboDuration),v=t-userPoseTime,D=Math.PI/180;
  const wind=phase(v,0,1.08),launch=grounded?0:phase(v,.78,1.13),fall=clamp((v-1.43)/.28)**2,cut=phase(v,1.43,1.71),impact=phase(v,1.71,1.79),recover=phase(v,1.84,2.26);
  const loadedYaw=(stepped?90:220)*D,sweepYaw=(stepped?285:155)*D,yaw=a.yaw+(loadedYaw-a.yaw)*wind+sweepYaw*cut,turn=yaw-a.yaw,height=13*launch*(1-fall),travel=grounded?0:phase(v,.78,1.71),drift=mul([-7,0,-17],travel),pivot=a.legs[0].ankle;
  const oldHip=a.body.p([0,-43,0]),balanced=stepped?mix(pivot,add(pivot,rotateY([14,0,-5],15*D)),.45):add(pivot,rotateY([3,0,0],a.yaw)),center=mix(oldHip,[balanced[0],oldHip[1],balanced[2]],phase(v,0,stepped?1.05:.65));
  center[0]+=drift[0];center[2]+=drift[2];center[1]+=grounded?3*phase(v,.25,.66)-2*cut+2*impact-recover:3*phase(v,.25,.66)-4*phase(v,.66,.86)-height+7*impact-2*recover;
  const lean=(grounded?5*cut+2*impact-recover:-7*launch+19*cut+4*impact-3*recover)*D,bank=-4*cut*D;
  const dn=p=>rotateY(rotateZ(rotateX(rotateY(p,-a.yaw),lean),bank),yaw),dp=p=>add(center,dn(sub(p,oldHip))),wrap=b=>({p:p=>dp(b.p(p)),n:n=>dn(b.n(n))}),body=wrap(a.body),cape=wrap(a.cape),head=wrap(a.head),shoulder=body.p(sourceShoulder);
  // Show the loaded sword above the shoulder while the back is oblique.
  const turnedRot=p=>rotateY(a.weapon.n(p),turn),turnedDir=turnedRot([0,1,0]),show=aimRotation(turnedDir,grounded?unit([turnedDir[0],0,turnedDir[2]]):unit([turnedDir[0]*.78,-.62,turnedDir[2]*.78]),phase(v,.24,1.02)),prepRot=p=>show(turnedRot(p)),driveDir=unit(rotateY([-1,grounded?0:.16,-.42],yaw)),aim=aimRotation(prepRot([0,1,0]),driveDir,cut),weaponRotation=p=>aim(prepRot(p)),loadedGrip=add(dp(a.grip),[0,-(grounded?6:10)*phase(v,.24,1.02),0]);
  const straightWrist=add(shoulder,mul(driveDir,armLengths[0]+armLengths[1]-.04)),straightGrip=sub(straightWrist,weaponRotation([-2.8,0,0]));let grip=mix(loadedGrip,straightGrip,cut);
  const offset=weaponRotation([-2.8,0,0]),reach=sub(add(grip,offset),shoulder),maxReach=armLengths[0]+armLengths[1]-.0001;if(len(reach)>maxReach)grip=sub(add(shoulder,mul(unit(reach),maxReach)),offset);
  const weapon={p:p=>add(grip,weaponRotation(sub(p,sourceGrip))),n:weaponRotation},hand={p:p=>weapon.p(add(p,[0,7.7,0])),n:weaponRotation},wrist=hand.p(sourceWrist),elbow=ik(shoulder,wrist,...armLengths,sub(dp(a.elbow),shoulder)),upper=bone(sourceShoulder,sourceElbow,shoulder,elbow),forearm=bone(sourceElbow,sourceWrist,elbow,wrist);
  const endLeft=add(add(pivot,[-7,0,-17]),rotateY([-5,0,6],15*D)),endRight=add(add(pivot,[-7,0,-17]),rotateY([11,0,-13],15*D));
  const legs=a.legs.map((l,i)=>{const H=[l.side*6.5,-43,0],K=[l.side*6.5,-26,0],A=[l.side*6.5,-2,0],hip=body.p(H),ankle=grounded?(i?mix(l.ankle,add(pivot,rotateY([14,0,-5],15*D)),phase(v,.3,stepped?1.05:1.75)):pivot.slice()):mix(l.ankle,i?endRight:endLeft,travel),tuck=(i?7:4)*launch*(1-fall),free=i?2.5*phase(v,.20,.5)*(grounded?1-phase(v,stepped?.8:1.65,stepped?1.08:1.85):1-launch):0;
   ankle[1]=-2-height-tuck-free;const footYaw=stepped?(i?l.footYaw+(70*D-l.footYaw)*phase(v,.3,1.05):l.footYaw)+sweepYaw*cut:alignFeet?l.footYaw+(yaw-l.footYaw)*wind:l.footYaw+turn,knee=ik(hip,ankle,17,24,mix(dn(sub(l.knee,l.hip)),rotateY([0,0,-17],yaw),phase(v,.2,1.71))),foot={p:p=>add(ankle,rotateY(sub(p,A),footYaw)),n:n=>rotateY(n,footYaw)};
   return {...l,hip,knee,ankle,footYaw,footLift:height+tuck+free,thigh:bone(H,K,hip,knee),shin:bone(K,A,knee,ankle),foot};
  });
  return {...a,time:t,spinTime:t-totalDuration,body,cape,head,shoulder,grip,weapon,hand,wrist,elbow,upper,forearm,legs,yaw,weaponDirection:weaponRotation([0,1,0]),contact:add(grip,swordSupport(weaponRotation)),airHeight:height,landingContact:grounded?null:mix(endLeft,endRight,.5),editorIssues:[],phase:grounded?(v<1.43?'Ayak basılı · yay gibi yüklen':'Yerden kopmadan yatay savuruş'):v<.78?'Referans · arkadan adım ve yüklenme':v<1.13?'Sıçra · kılıcı göster':v<1.43?'Havada asılı · sırt çapraz':v<1.71?'Sert çapraz iniş · tam kol savuruş':'İniş ağırlığını dizlerde karşıla'};
 }
 // v5: foot leads the entry, the torso only follows a little until planting.
 // Older pose versions remain available to every saved editor record.
 function sampleFootLeadEntry(time){
  if(time<=totalDuration)return sample(time);
  const t=Math.min(time,userPoseTime),base=sampleAirbornePose(t),entry=sample(totalDuration),hip=base.body.p([0,-43,0]),entryHip=entry.body.p([0,-43,0]);
  const out=phase(t,6.28,6.88),across=phase(t,6.88,7.30),load=phase(t,7.30,userPoseTime),yaw=(25*phase(t,6.4,7.30)+15*load)*Math.PI/180;
  const ankle=mix(mix(entry.legs[0].ankle,[-20,-2,-6],out),[8,-2,-7],across);ankle[1]-=4*phase(t,6.28,6.60)*(1-phase(t,7.05,7.30));
  const targetHip=mix(entryHip,[7,-31,-11],phase(t,6.28,userPoseTime));
  const p=applyEdits(base,{body:{p:sub(targetHip,hip),r:[0,(yaw-base.yaw)*180/Math.PI,0]},leftFoot:{p:sub(ankle,base.legs[0].ankle),r:[0,25*phase(t,6.5,7.3)-base.legs[0].footYaw*180/Math.PI,0],ground:t>=7.30}});
  p.yaw=yaw;p.phase=t<6.88?'Önce sol ayak dışarı dolanır':t<7.30?'Ayak arkadan geçer · gövde hafif eşlik eder':'Ayak yerleşir · yayı yükle';return p;
 }
 let footLeadAnchor;
 function sampleFootLeadSpin(time){
  if(time<=userPoseTime)return sampleFootLeadEntry(time);
  footLeadAnchor ||= sampleFootLeadEntry(userPoseTime);
  return sampleReferenceSpin(time,footLeadAnchor,true);
 }
 // v6 restores the user's original foot route/plant. Only the torso's yaw
 // is delayed; do not invent new ankle coordinates or overwrite saved poses.
 function sampleRestoredEntry(time){
  if(time<=totalDuration)return sample(time);
  const t=Math.min(time,userPoseTime),base=sampleAirbornePose(t),yaw=base.yaw*(.4+.6*phase(t,6.85,userPoseTime));
  const delta=yaw-base.yaw,hip=base.body.p([0,-43,0]);let shift=[0,0,0];
  // Counter-turning the pelvis can otherwise make IK pull the restored foot
  // inward. Move the weight slightly instead; the authored feet own contact.
  for(let pass=0;pass<8;pass++)for(const l of base.legs){const h=add(add(hip,rotateY(sub(l.hip,hip),delta)),shift),to=sub(l.ankle,h),distance=len(to);if(distance>40.95)shift=add(shift,mul(to,1-40.95/distance));}
  const p=applyEdits(base,{body:{p:shift,r:[0,delta*180/Math.PI,0]},leftFoot:{ground:false},rightFoot:{ground:false}});
  // Preserve the exact authored sole orientation/clearance, including heel lift.
  p.legs=p.legs.map((l,i)=>({...l,foot:base.legs[i].foot,footYaw:base.legs[i].footYaw,footLift:base.legs[i].footLift}));
  p.yaw=yaw;p.phase=t<7.30?'Özgün ayak yayı · gövde hafif eşlik eder':'Özgün basışa yerleş · dönüşü yükle';return p;
 }
 let restoredEntryAnchor;
 function sampleRestoredSpin(time){
  if(time<=userPoseTime)return sampleRestoredEntry(time);
  restoredEntryAnchor ||= sampleRestoredEntry(userPoseTime);
  return sampleReferenceSpin(time,restoredEntryAnchor,true,true);
 }
 // v7: a cross-behind step, not a pirouette during the preparation. Keep the
 // authored ankle route, the supporting sole's heading, and shift the pelvis
 // toward the new support only as the travelling foot actually touches down.
 function sampleBalancedEntry(time){
  if(time<=totalDuration)return sample(time);
  const t=Math.min(time,userPoseTime),base=sampleAirbornePose(t),entry=sample(totalDuration),yaw=(18*phase(t,6.4,7.05)+52*phase(t,7.05,userPoseTime))*Math.PI/180;
  const hip=base.body.p([0,-43,0]),delta=yaw-base.yaw,weight=phase(t,7.28,userPoseTime),support=mix(base.legs[1].ankle,mix(base.legs[1].ankle,base.legs[0].ankle,.5),weight),approach=phase(t,6.1,6.72);
  let shift=[(support[0]-hip[0])*approach,0,(support[2]-hip[2])*approach];
  for(let pass=0;pass<12;pass++)for(const l of base.legs){const h=add(add(hip,rotateY(sub(l.hip,hip),delta)),shift),to=sub(l.ankle,h),distance=len(to);if(distance>40.9)shift=add(shift,mul(to,1-40.9/distance));}
  const p=applyEdits(base,{body:{p:shift,r:[0,delta*180/Math.PI,0]},leftFoot:{ground:false},rightFoot:{ground:false}});
  p.legs=p.legs.map((l,i)=>{const A=[l.side*6.5,-2,0],footYaw=i?entry.legs[i].footYaw:entry.legs[i].footYaw+(70*Math.PI/180-entry.legs[i].footYaw)*phase(t,6.58,7.42),turn=footYaw-base.legs[i].footYaw,fn=i?v=>rotateY(v,footYaw):v=>rotateY(base.legs[i].foot.n(v),turn);return {...l,footYaw,footLift:i?0:base.legs[i].footLift,foot:{p:v=>add(l.ankle,fn(sub(v,A))),n:fn}};});
  p.yaw=yaw;p.phase=t<7.28?'Dengeli adım · sağ taban sabit':'Sol ayağı yerleştir · ağırlığı iki ayağa aktar';return p;
 }
 let balancedEntryAnchor;
 function sampleBalancedSpin(time){
  if(time<=userPoseTime)return sampleBalancedEntry(time);
  balancedEntryAnchor ||= sampleBalancedEntry(userPoseTime);
  const p=sampleReferenceSpin(time,balancedEntryAnchor,true,true,true);
  p.phase=time<8.57?'Ağırlığı aktar · sağ adımı tamamla':time<8.92?'İki ayakla dengeli yüklen':'Yatay savuruş · ağırlığı karşıla';return p;
 }
 // v8 is blocked directly from referansa.MOV: cross-behind (2.0–2.7 s),
 // second step to a back-facing load (2.7–3.6), then turn and forward sweep
 // (4.0–4.8). Do not replace these separate contacts with one orbiting root.
 let videoEntry;
 function sampleVideoSteps(time,quick=false,naturalStep=false){
  if(time<=totalDuration)return sample(time);
  const a=videoEntry||(videoEntry=sample(totalDuration)),t=Math.min(time,comboDuration),D=Math.PI/180;
  const crossStep=phase(t,6.25,7.49),second=quick?0:phase(t,7.60,8.35),load=quick?phase(t,7.49,7.75):phase(t,8.35,8.72),wind=phase(t,7.49,8.34),spin=phase(t,8.40,8.60),turnDegrees=155*wind+140*spin,cut=quick?phase(t,8.43,8.60):phase(t,8.92,9.20),settle=quick?phase(t,8.66,9.12):phase(t,9.20,9.75),rise=phase(t,6.1,7.3);
  const facingOffset=naturalStep?20*spin:0,yaw=(20*phase(t,6.4,6.95)+45*phase(t,7.0,7.49)+(quick?turnDegrees:115*second+20*load+160*cut)+facingOffset)*D;
  const leftEnd=[24,-2,-20],rightReady=[7,-2,3],rightEnd=naturalStep?add(leftEnd,rotateY([14,0,-22],20*D)):[38,-2,-42];
  const left=mix(a.legs[0].ankle,leftEnd,crossStep);left[0]-=7*Math.sin(Math.PI*crossStep);left[1]-=4*Math.sin(Math.PI*crossStep)**2;
  // The free leg folds under its hip, then swings forward like a step. It no
  // longer keeps the crossed entry offset for an entire circular orbit.
  const swingLocal=naturalStep?mix(rotateY(sub(a.legs[1].ankle,leftEnd),-65*D),[11,0,5],phase(t,7.49,8.16)):null;
  const right=quick?mix(naturalStep?(t<=7.49?a.legs[1].ankle.slice():add(leftEnd,rotateY(swingLocal,yaw))):add(leftEnd,rotateY(sub(a.legs[1].ankle,leftEnd),turnDegrees*D)),rightEnd,spin):mix(mix(a.legs[1].ankle,rightReady,second),rightEnd,cut);right[1]-=quick?(4+2*cut)*phase(t,7.49,7.64)*(1-settle):3*Math.sin(Math.PI*second)**2+2.5*Math.sin(Math.PI*cut)**2;
  const entryCenter=mix(a.body.p([0,-43,0]),[16,-32,-16],phase(t,6.1,7.49)),center=quick?mix(mix(entryCenter,[24,-32,-20],load),[29,-28,-33],settle):mix(mix(entryCenter,[15,-34,-9],second),[29,-28,-33],cut);center[1]-=1.2*settle;
  const lean=a.lean+(12*D-a.lean)*rise+13*D*cut,roll=3*D*(1-rise),bodyRotation=p=>rotateZ(rotateY(rotateX(p,lean),yaw),roll),body={p:p=>add(center,bodyRotation(sub(p,[0,-43,0]))),n:bodyRotation};
  const neck=body.p([0,-79,0]),nod=(11*(1-rise)+7*cut)*D,headRotation=p=>rotateY(rotateX(p,nod),yaw),head={p:p=>add(neck,headRotation(sub(p,[0,-79,0]))),n:headRotation};
  const capePivot=[0,-76,5],capeAngle=(12+8*rise)*D,cape={p:p=>body.p(add(capePivot,rotateX(sub(p,capePivot),capeAngle))),n:n=>body.n(rotateX(n,capeAngle))};
  const shoulder=body.p(sourceShoulder),rack=phase(t,6.18,7.49),direction=rotateY([1,0,0],yaw+Math.PI*cut),turnedRot=p=>rotateY(a.weapon.n(p),yaw),aim=aimRotation(turnedRot([0,1,0]),direction,rack),rawRotation=p=>aim(turnedRot(p));
  // Roll around the blade axis, not its direction: the broad face and guard
  // lie in the horizontal cutting plane instead of standing upright.
  const bladeAxis=unit(rawRotation([0,1,0])),normal=unit(rawRotation([0,0,1])),flatNormal=unit(sub([0,-1,0],mul(bladeAxis,dot([0,-1,0],bladeAxis)))),bladeRoll=quick?Math.atan2(dot(bladeAxis,cross(normal,flatNormal)),dot(normal,flatNormal))*rack:0;
  const weaponRotation=p=>rawRotation(rotateY(p,bladeRoll));
  const prepGrip=body.p([4,-62,-15]),oldHip=a.body.p([0,-43,0]),carriedGrip=add(center,rotateY(sub(a.grip,oldHip),yaw)),reach=armLengths[0]+armLengths[1]-.04*rack,driveWrist=add(shoulder,mul(direction,reach));
  let grip=mix(mix(carriedGrip,prepGrip,rack),sub(driveWrist,weaponRotation([-2.8,0,0])),cut);
  const offset=weaponRotation([-2.8,0,0]),arm=sub(add(grip,offset),shoulder);if(len(arm)>reach)grip=sub(add(shoulder,mul(unit(arm),reach)),offset);
  const weapon={p:p=>add(grip,weaponRotation(sub(p,sourceGrip))),n:weaponRotation},hand={p:p=>weapon.p(add(p,[0,7.7,0])),n:weaponRotation},wrist=hand.p(sourceWrist),pole=mix(sub(a.elbow,a.shoulder),rotateY([-9,7,-19],yaw),rack),elbow=ik(shoulder,wrist,...armLengths,pole),upper=bone(sourceShoulder,sourceElbow,shoulder,elbow),forearm=bone(sourceElbow,sourceWrist,elbow,wrist);
  const legs=a.legs.map((l,i)=>{const H=[l.side*6.5,-43,0],K=[l.side*6.5,-26,0],A=[l.side*6.5,-2,0],hip=body.p(H),ankle=i?right:left,footYaw=naturalStep?(i?yaw*phase(t,7.49,7.84):(65*crossStep+turnDegrees+facingOffset)*D):quick?(i?turnDegrees+65*spin:65*crossStep+turnDegrees)*D:i?(180*second+180*cut)*D:(65*crossStep+95*second+180*cut)*D,knee=ik(hip,ankle,17,24,mix(sub(l.knee,l.hip),rotateY([quick&&i&&!naturalStep?6*phase(t,7.49,8.20):0,0,-17],yaw),rise)),foot={p:p=>add(ankle,rotateY(sub(p,A),footYaw)),n:n=>rotateY(n,footYaw)};return {...l,hip,knee,ankle,footYaw,footLift:-2-ankle[1],thigh:bone(H,K,hip,knee),shin:bone(K,A,knee,ankle),foot};});
  return {...a,time:t,spinTime:t-totalDuration,body,head,cape,shoulder,elbow,wrist,grip,weapon,hand,upper,forearm,legs,yaw,lean,weaponDirection:weaponRotation([0,1,0]),contact:add(grip,swordSupport(weaponRotation)),airHeight:0,landingContact:null,editorIssues:[],phase:quick?(t<7.49?'Sol çapraz adım · kılıcı yana yatır':t<8.34?'Sol destek · ağır ve kesintisiz yüklen':t<8.40?'Kısa gerilim':t<8.60?'Sol ayakta hızlı spin · yatay slice':'Kesiş bitti · sağ ayakla dengeyi karşıla'):t<7.49?'Referans · sol ayak arkadan çapraz adım':t<8.35?'Referans · ikinci adımla sırtı çevir':t<8.92?'Referans · iki ayakla yüklen':t<9.20?'Referans · öne bas ve yatay savur':'Referans · öndeki dizle ağırlığı karşıla'};
 }
 const sampleQuickSlice=time=>sampleVideoSteps(time,true);
 const sampleNaturalSlice=time=>sampleVideoSteps(time,true,true);
 const sampleActive=time=>window.KRGuardianAuthoredTurn?.sample(time)||sampleNaturalSlice(time);
 function sampleVersion(time,version){return version===0?sample(time):version===1?sampleUserPose(time):version===2?sampleWidePose(time):version===3?sampleAirbornePose(time):version===4?sampleReferenceSpin(time):version===5?sampleFootLeadSpin(time):version===6?sampleRestoredSpin(time):version===7?sampleBalancedSpin(time):version===8?sampleVideoSteps(time):version===9?sampleQuickSlice(time):version===10?sampleNaturalSlice(time):version===28&&window.KRGuardianAuthoredTurnV28?window.KRGuardianAuthoredTurnV28.sample(time):version===27&&window.KRGuardianAuthoredTurnV27?window.KRGuardianAuthoredTurnV27.sample(time):version===26&&window.KRGuardianAuthoredTurnV26?window.KRGuardianAuthoredTurnV26.sample(time):version===25&&window.KRGuardianAuthoredTurnV25?window.KRGuardianAuthoredTurnV25.sample(time):version===24&&window.KRGuardianAuthoredTurnV24?window.KRGuardianAuthoredTurnV24.sample(time):version===23&&window.KRGuardianAuthoredTurnV23?window.KRGuardianAuthoredTurnV23.sample(time):version===22&&window.KRGuardianAuthoredTurnV22?window.KRGuardianAuthoredTurnV22.sample(time):version===21&&window.KRGuardianAuthoredTurnV21?window.KRGuardianAuthoredTurnV21.sample(time):version===20&&window.KRGuardianAuthoredTurnV20?window.KRGuardianAuthoredTurnV20.sample(time):version===19&&window.KRGuardianAuthoredTurnV19?window.KRGuardianAuthoredTurnV19.sample(time):version===18&&window.KRGuardianAuthoredTurnV18?window.KRGuardianAuthoredTurnV18.sample(time):version===17&&window.KRGuardianAuthoredTurnV17?window.KRGuardianAuthoredTurnV17.sample(time):version===16&&window.KRGuardianAuthoredTurnV16?window.KRGuardianAuthoredTurnV16.sample(time):version===15&&window.KRGuardianAuthoredTurnV15?window.KRGuardianAuthoredTurnV15.sample(time):version===14&&window.KRGuardianAuthoredTurnV14?window.KRGuardianAuthoredTurnV14.sample(time):version===13&&window.KRGuardianAuthoredTurnV13?window.KRGuardianAuthoredTurnV13.sample(time):version===12&&window.KRGuardianAuthoredTurnV12?window.KRGuardianAuthoredTurnV12.sample(time):sampleActive(time);}
 function bind(part,p){if(part==='stone-cape')return 'cape';if(part==='great-stone-sword')return 'weapon';if(['head','crown','embedded-event-sword'].includes(part))return 'head';if(part==='left-hand')return 'hand';if(part==='left-upper-arm')return 'upper';if(part==='left-forearm')return 'forearm';if(part==='legs')return p[0]<0?'leg0':'leg1';if(part==='torso'||part==='neck')return 'torso';if(part==='left-shoulder')return 'leftShoulder';if(part==='broken-right-arm')return 'rightShoulder';return 'body';}
 function vertex(p,n,key,s){if(key==='centerSpike'&&!s.centerSpike)return {p:[0,100,0],n};let b=s[key]||s.body;if(key.startsWith('leg')){const l=s.legs[+key.slice(-1)];if(p[1]>=-4)b=l.foot;else if(p[1]<-26)b=l.thigh;else b=l.shin;
   // Blend the ankle only; both rigid knee segments meet at the same joint.
   if(p[1]>-8&&p[1]<-4){const q=(p[1]+8)/4;return {p:mix(l.shin.p(p),l.foot.p(p),q),n:mix(l.shin.n(n),l.foot.n(n),q)};}
  }
  if(key==='hand'&&p[1]>-63.6&&p[2]<-14.4){const a=1.05*s.grab,c=Math.cos(a),sn=Math.sin(a),dy=p[1]+63.6,dz=p[2]+16;return {p:b.p([p[0],-63.6+dy*c-dz*sn,-16+dy*sn+dz*c]),n:b.n([n[0],n[1]*c-n[2]*sn,n[1]*sn+n[2]*c])};}
  return {p:b.p(p),n:b.n(n)};
 }
 // Compile each rigid chain once per pose. No quantized frame cache: arbitrary
 // scrubbing/editor poses keep their exact time, and storage is one pose only.
 function compactTransform(b){
  const o=b.p([0,0,0]),x=b.n([1,0,0]),y=b.n([0,1,0]),z=b.n([0,0,1]);
  return {basis:[o,x,y,z],p:v=>[o[0]+x[0]*v[0]+y[0]*v[1]+z[0]*v[2],o[1]+x[1]*v[0]+y[1]*v[1]+z[1]*v[2],o[2]+x[2]*v[0]+y[2]*v[1]+z[2]*v[2]],
   n:v=>[x[0]*v[0]+y[0]*v[1]+z[0]*v[2],x[1]*v[0]+y[1]*v[1]+z[1]*v[2],x[2]*v[0]+y[2]*v[1]+z[2]*v[2]]};
 }
 function compilePose(pose){
  const out={...pose};for(const key of ['body','torso','leftShoulder','rightShoulder','head','cape','weapon','hand','upper','forearm'])out[key]=compactTransform(pose[key]||pose.body);
  if(pose.centerSpike)out.centerSpike=compactTransform(pose.centerSpike);
  out.legs=pose.legs.map(l=>({...l,thigh:compactTransform(l.thigh),shin:compactTransform(l.shin),foot:compactTransform(l.foot)}));return out;
 }
 // Stream rigid vertices into reusable scratch vectors. The finger/ankle
 // exceptions keep their exact existing deformation; no pose quantization.
 function vertexInto(p,n,key,s,out){
  let b=s[key]||s.body;
  if(key==='centerSpike'&&!s.centerSpike){out.p[0]=out.p[2]=0;out.p[1]=100;for(let i=0;i<3;i++)out.n[i]=n[i];return out;}
  if(key.startsWith('leg')){const l=s.legs[+key.slice(-1)];b=p[1]>=-4?l.foot:p[1]<-26?l.thigh:l.shin;}
  if(key.startsWith('leg')&&p[1]>-8&&p[1]<-4||key==='hand'&&p[1]>-63.6&&p[2]<-14.4){const v=vertex(p,n,key,s);for(let i=0;i<3;i++){out.p[i]=v.p[i];out.n[i]=v.n[i];}return out;}
  const [o,x,y,z]=b.basis;for(let i=0;i<3;i++){out.p[i]=o[i]+x[i]*p[0]+y[i]*p[1]+z[i]*p[2];out.n[i]=x[i]*n[0]+y[i]*n[1]+z[i]*n[2];}return out;
 }
 // Same flat orthographic projection/depth convention as Jonathan. Only the
 // position/normal stream changes; colours and topology are uploaded once.
 function create(options={}){const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true});if(!gl)throw Error('WebGL gerekli');
  const shader=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;},vs=shader(gl.VERTEX_SHADER,`
   attribute vec3 p;attribute vec3 n;attribute vec3 colour;attribute float layer;attribute float ground;attribute vec4 joints;
   uniform vec2 yaw;uniform vec2 size;uniform mat3 transform;uniform float bias;uniform float worldMode;
   uniform float nativeMode;uniform mat4 bones[17];uniform float grab;uniform vec4 camera;uniform vec4 scene;uniform vec3 root;
   varying vec3 col;varying float facing;varying float worldDepth;varying float groundY;
   void main(){vec3 point=p,normal=n;groundY=ground;
    if(nativeMode>.5){
     if(joints.w>0.5){float a=1.05*grab,c=cos(a),sn=sin(a);vec2 delta=point.yz-vec2(-63.6,-16.);point.yz=vec2(-63.6,-16.)+vec2(delta.x*c-delta.y*sn,delta.x*sn+delta.y*c);normal.yz=vec2(normal.y*c-normal.z*sn,normal.y*sn+normal.z*c);}
     mat4 a=bones[int(joints.x)],b=bones[int(joints.y)];
     vec3 posed=mix((a*vec4(point,1.)).xyz,(b*vec4(point,1.)).xyz,joints.z);
     normal=mix((a*vec4(normal,0.)).xyz,(b*vec4(normal,0.)).xyz,joints.z);
     groundY=ground>.5?posed.y:-1.;
     float x=posed.x*yaw.x+posed.z*yaw.y,z=root.y+(-posed.x*yaw.y+posed.z*yaw.x)*.065;
     float f=camera.x,farZ=camera.y,horizon=camera.z,floorY=camera.w,t,sy,scale;
     if(scene.y>.5){float d=max(z,-f*.98);scale=f/(f+d);t=(scale-.16)/.84;sy=horizon+(floorY-horizon)*f*(d-farZ)*(d-farZ)/(farZ*farZ*(f+d));}
     else{float far=f/(f+farZ),d=max(z,-f*.78);t=(f/(f+d)-far)/(1.-far);sy=mix(horizon,floorY,t);scale=mix(.09,1.,t*t*.35+t*.65);}
     point=vec3(scene.x*.5+(root.x-1.-x/30.)*mix(24.,150.,t),sy+posed.y*5.*scale,z);
    }
    float d=yaw.y*point.x-yaw.x*point.z;vec3 s=transform*(worldMode>.5?vec3(point.xy,1.):vec3(-yaw.x*point.x-yaw.y*point.z,point.y+d*.09,1.));worldDepth=point.z;
    gl_Position=vec4(s.x/size.x*2.-1.,1.-s.y/size.y*2.,(worldMode>.5?point.z/128.:-d/128.)-layer*bias*.5,1.);col=colour;facing=yaw.y*normal.x-yaw.x*normal.z-.09*normal.y;
   }`),fs=shader(gl.FRAGMENT_SHADER,`precision highp float;varying vec3 col;varying float facing;varying float worldDepth;varying float groundY;uniform float depthSide;uniform float clipGround;void main(){if(clipGround>.5&&groundY>0.)discard;if(depthSide>0.5&&worldDepth<0.)discard;if(depthSide<-.5&&worldDepth>=0.)discard;if(facing<=.0000001)discard;gl_FragColor=vec4(col,1.);}`),program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  const records=[],colors=[];for(const f of KRAncientGuardian.meshes.sword){const col=options.materialColor?.(f.col,f.part)||f.col,rgb=[0,2,4].map(i=>parseInt(col.slice(1+i,3+i),16)/255);for(let i=1;i<f.v.length-1;i++)for(const p of [f.v[0],f.v[i],f.v[i+1]]){records.push({p,n:f.normal,key:bind(f.part,p)});colors.push(...rgb,f.layer||0);}}
  // One opt-in prop reuses the exact sword topology/materials in the same depth
  // buffer. No second renderer, bitmap cache or normal-game allocation.
  if(options.centerSpike)for(const f of KRAncientGuardian.parts['great-stone-sword']){const col=options.materialColor?.(f.col,f.part)||f.col,rgb=[0,2,4].map(i=>parseInt(col.slice(1+i,3+i),16)/255);for(let i=1;i<f.v.length-1;i++)for(const p of [f.v[0],f.v[i],f.v[i+1]]){records.push({p,n:f.normal,key:'centerSpike'});colors.push(...rgb,f.layer||0);}}
  // Shared triangle corners keep separate colour/layer slots, but skin/project once.
  const unique=[],cornerMap=new Map(),cornerIndex=new Uint32Array(records.length);
  for(let i=0;i<records.length;i++){const r=records[i],key=[r.key,...r.p,...r.n].join(':');let index=cornerMap.get(key);if(index===undefined){index=unique.length;cornerMap.set(key,index);unique.push(r);}cornerIndex[i]=index;}
  cornerMap.clear();const transformed=new Float32Array(unique.length*6);
  const data=new Float32Array(records.length*6),colorData=new Float32Array(colors),dynamic=gl.createBuffer(),fixed=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,fixed);gl.bufferData(gl.ARRAY_BUFFER,colorData,gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,dynamic);gl.bufferData(gl.ARRAY_BUFFER,data.byteLength,gl.DYNAMIC_DRAW);
  const attributes=Object.fromEntries(['p','n','colour','layer','ground','joints'].map(k=>[k,gl.getAttribLocation(program,k)])),uniforms=Object.fromEntries(['yaw','size','transform','bias','worldMode','depthSide','clipGround','nativeMode','bones[0]','grab','camera','scene','root'].map(k=>[k,gl.getUniformLocation(program,k)]));let lastTime=-1,frames=0;
  const boneKeys=['body','torso','leftShoulder','rightShoulder','head','cape','weapon','hand','upper','forearm','centerSpike','leg0thigh','leg0shin','leg0foot','leg1thigh','leg1shin','leg1foot'],boneData=new Float32Array(17*16);
  let nativeBuffer=null,nativeData=null,lastNative=false;
  function prepareNative(){if(nativeBuffer)return;
   nativeData=new Float32Array(records.length*11);
   for(let i=0;i<records.length;i++){const r=records[i],p=r.p;let a=boneKeys.indexOf(r.key),b=a,w=0;
    if(r.key.startsWith('leg')){const base=r.key==='leg0'?11:14;a=base+(p[1]>=-4?2:p[1]<-26?0:1);b=a;if(p[1]>-8&&p[1]<-4){a=base+1;b=base+2;w=(p[1]+8)/4;}}
    const offset=i*11;nativeData.set(p,offset);nativeData.set(r.n,offset+3);nativeData.set([a,b,w,r.key==='hand'&&p[1]>-63.6&&p[2]<-14.4?1:0,r.key==='weapon'||r.key==='centerSpike'?1:0],offset+6);
   }nativeBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,nativeBuffer);gl.bufferData(gl.ARRAY_BUFFER,nativeData,gl.STATIC_DRAW);
  }
  function writeBones(pose){const compiled=compilePose(pose);
   for(let i=0;i<17;i++){const key=boneKeys[i],b=key.startsWith('leg')?compiled.legs[+key[3]][key.slice(4)]:compiled[key],offset=i*16;
    if(!b){boneData.fill(0,offset,offset+16);boneData[offset+13]=100;boneData[offset+15]=1;continue;}
    const [o,x,y,z]=b.basis;boneData.set([x[0],x[1],x[2],0,y[0],y[1],y[2],0,z[0],z[1],z[2],0,o[0],o[1],o[2],1],offset);
   }
  }
  // Opt-in authoring ground plane. Allocate/upload once per changed pose, not
  // per render pass. Only the sword is clipped; normal play allocates no buffer.
  let groundBuffer=null,groundData=null,groundUnique=null,lastGround=false;
  let lastOverride=null,lastPose=null,lastWorldKey=null,lastWorldMode=false;
  const vertexScratch={p:[0,0,0],n:[0,0,0]},projectScratch=[0,0,0];
  const depthBias=Math.max(.00001,4/2**gl.getParameter(gl.DEPTH_BITS));
  function draw(ctx,deg,dir,visible,scale,time=0,override=null,world=null){const clipGround=!!world?.clipGround,native=!!world?.nativeProjection,changed=time!==lastTime||override!==lastOverride||!!world!==lastWorldMode||(world?.cacheKey??null)!==lastWorldKey||clipGround!==lastGround||native!==lastNative,pose=changed?(override||sampleActive(time)):lastPose;
   if(native)prepareNative();
   if(clipGround&&!native&&!groundBuffer){groundBuffer=gl.createBuffer();groundData=new Float32Array(records.length);groundUnique=new Float32Array(unique.length);gl.bindBuffer(gl.ARRAY_BUFFER,groundBuffer);gl.bufferData(gl.ARRAY_BUFFER,groundData.byteLength,gl.DYNAMIC_DRAW);}
   if(changed){if(native)writeBones(pose);else{const compiled=compilePose(pose);for(let i=0;i<unique.length;i++){const r=unique[i],v=vertexInto(r.p,r.n,r.key,compiled,vertexScratch);transformed.set(world?(world.projectInto?world.projectInto(v.p,projectScratch):world.project(v.p)):v.p,i*6);transformed.set(world?.normal?world.normal(v.n):v.n,i*6+3);if(clipGround)groundUnique[i]=(r.key==='weapon'||r.key==='centerSpike')?v.p[1]:-1;}for(let i=0;i<records.length;i++){const src=cornerIndex[i]*6,dst=i*6;for(let j=0;j<6;j++)data[dst+j]=transformed[src+j];if(clipGround)groundData[i]=groundUnique[cornerIndex[i]];}gl.bindBuffer(gl.ARRAY_BUFFER,dynamic);gl.bufferSubData(gl.ARRAY_BUFFER,0,data);if(clipGround){gl.bindBuffer(gl.ARRAY_BUFFER,groundBuffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,groundData);}}lastTime=time;lastOverride=override;lastPose=pose;lastWorldMode=!!world;lastWorldKey=world?.cacheKey??null;lastGround=clipGround;lastNative=native;}
   const m=ctx.getTransform(),crop=native&&m.a>0&&m.b===0&&m.c===0,
    left=crop?Math.max(0,Math.floor(m.e)):0,
    width=crop?Math.min(ctx.canvas.width,Math.max(1,Math.ceil((m.a*world.nativeProjection.width+2)/32)*32)):ctx.canvas.width;
   // Native gameplay clips to this stage already. Do not allocate/copy the
   // black side bars into both Guardian depth passes on wide viewports. Width
   // is stable under subpixel camera shake, avoiding repeated GPU reallocations.
   if(canvas.width!==width||canvas.height!==ctx.canvas.height){canvas.width=width;canvas.height=ctx.canvas.height;}gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.disable(gl.BLEND);gl.disable(gl.DITHER);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.useProgram(program);
   gl.bindBuffer(gl.ARRAY_BUFFER,native?nativeBuffer:dynamic);for(const [k,offset]of [['p',0],['n',12]]){gl.enableVertexAttribArray(attributes[k]);gl.vertexAttribPointer(attributes[k],3,gl.FLOAT,false,native?44:24,offset);}
   gl.uniform1f(uniforms.nativeMode,native?1:0);
   if(native){const c=world.nativeProjection;gl.enableVertexAttribArray(attributes.joints);gl.vertexAttribPointer(attributes.joints,4,gl.FLOAT,false,44,24);gl.enableVertexAttribArray(attributes.ground);gl.vertexAttribPointer(attributes.ground,1,gl.FLOAT,false,44,40);gl.uniformMatrix4fv(uniforms['bones[0]'],false,boneData);gl.uniform1f(uniforms.grab,pose.grab||0);gl.uniform4f(uniforms.camera,c.focal,c.far,c.horizon,c.ground);gl.uniform4f(uniforms.scene,c.width,c.curved?1:0,0,0);gl.uniform3f(uniforms.root,c.x,c.z,0);}
   else{gl.disableVertexAttribArray(attributes.joints);gl.vertexAttrib4f(attributes.joints,0,0,0,0);if(clipGround){gl.bindBuffer(gl.ARRAY_BUFFER,groundBuffer);gl.enableVertexAttribArray(attributes.ground);gl.vertexAttribPointer(attributes.ground,1,gl.FLOAT,false,4,0);}else{gl.disableVertexAttribArray(attributes.ground);gl.vertexAttrib1f(attributes.ground,0);}}
   gl.bindBuffer(gl.ARRAY_BUFFER,fixed);for(const [k,count,offset]of [['colour',3,0],['layer',1,12]]){gl.enableVertexAttribArray(attributes[k]);gl.vertexAttribPointer(attributes[k],count,gl.FLOAT,false,16,offset);}
   const a=deg*Math.PI/180;gl.uniform2f(uniforms.yaw,Math.cos(a),Math.sin(a)*dir);gl.uniform2f(uniforms.size,canvas.width,canvas.height);gl.uniform1f(uniforms.bias,depthBias);gl.uniform1f(uniforms.worldMode,world?1:0);gl.uniform1f(uniforms.depthSide,world?.depthSide||0);gl.uniform1f(uniforms.clipGround,clipGround?1:0);gl.uniformMatrix3fv(uniforms.transform,false,new Float32Array([m.a*scale,m.b*scale,0,m.c*scale,m.d*scale,0,m.e-left,m.f,1]));gl.drawArrays(gl.TRIANGLES,0,records.length);ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(canvas,left,0);ctx.restore();frames++;return pose;
  }
  return {draw,stats:()=>({meshBytes:data.byteLength+colorData.byteLength,transformBytes:transformed.byteLength+cornerIndex.byteLength,groundClipBytes:(groundData?.byteLength||0)+(groundUnique?.byteLength||0),nativeBytes:(nativeData?.byteLength||0)+boneData.byteLength,nativeMode:lastNative,triangleCorners:records.length,uniqueCorners:unique.length,frames,kind:'guardian-stance-gpu'}),dispose(){gl.deleteBuffer(dynamic);gl.deleteBuffer(fixed);if(groundBuffer)gl.deleteBuffer(groundBuffer);if(nativeBuffer)gl.deleteBuffer(nativeBuffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);gl.getExtension('WEBGL_lose_context')?.loseContext();}};
 }
 window.KRAncientGuardianStance=Object.freeze({duration,attackDuration,totalDuration,spinDuration,comboDuration,poseVersion:29,markers:Object.freeze({ready:duration,upright:duration+1.65,tension:duration+1.98,cut:duration+2.23,follow:duration+2.7,end:totalDuration,get spinWide(){return window.KRGuardianAuthoredTurn?.timing?.playbackTime(7.25)||7.25;},get spinPlant(){return window.KRGuardianAuthoredTurn?.timing?.playbackTime(7.95)||7.95;},get spinReady(){return window.KRGuardianAuthoredTurn?.timing?.cutStart||8.99;},get spinCut(){return window.KRGuardianAuthoredTurn?.timing?.finish||9.27;},get spinLaunch(){return window.KRGuardianAuthoredTurn?.timing?.playbackTime(8.55)||8.55;},get spinHang(){return this.spinReady;},get spinLand(){return this.spinCut;},comboEnd:comboDuration}),sample:sampleActive,sampleOriginal:sample,sampleVersion,applyEdits,compilePose,create,vertex});
})();
