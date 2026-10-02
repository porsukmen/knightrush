/* Lab-only shoulder-driven 3D sword action. The arm and blade share the
 * strike direction; no independent wrist-spin curve or growing blade. */
(()=>{'use strict';
 const R=KRMountedRig,{add,sub,mul,unit}=R,dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),
  cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  mix=(a,b,t)=>a+(b-a)*t,blend=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t)),
  smooth=v=>{const t=Math.max(0,Math.min(1,v));return t*t*t*(10+t*(-15+6*t));};
 const TIMING=Object.freeze({reachEnd:.24,gripEnd:.36,drawEnd:.72,windupEnd:1.00,contact:1.28,reboundEnd:1.54,crossContact:1.80,followEnd:1.88,poseHoldEnd:2.08,recoverEnd:2.32,alignEnd:2.58,sheathEnd:2.94,settleEnd:3.34});
 function phaseAt(time){const t=Math.max(0,Math.min(TIMING.settleEnd,time)),T=TIMING,part=(a,b)=>smooth((t-a)/(b-a));
  return {t,reach:part(0,T.reachEnd),extract:part(T.gripEnd,T.drawEnd),windup:part(T.drawEnd,T.windupEnd),slash:part(T.windupEnd,T.contact),
   rebound:part(T.contact,T.reboundEnd),cross:part(T.reboundEnd,T.crossContact),follow:part(T.crossContact,T.followEnd),recover:part(T.poseHoldEnd,T.recoverEnd),
   align:part(T.recoverEnd,T.alignEnd),sheath:part(T.alignEnd,T.sheathEnd),settle:part(T.sheathEnd,T.settleEnd),
   trail:Math.max(Math.sin(Math.PI*Math.max(0,Math.min(1,(t-T.windupEnd)/(.32)))),Math.sin(Math.PI*Math.max(0,Math.min(1,(t-T.reboundEnd)/(.30)))))};
 }
 function arc(a,b,t){const d=Math.max(-1,Math.min(1,dot(a,b))),theta=Math.acos(d);if(theta<1e-7)return [...a];
  return unit(add(mul(a,Math.sin((1-t)*theta)),mul(b,Math.sin(t*theta))));}
 function transport(frame,target){const u=unit(target),d=Math.max(-1,Math.min(1,dot(frame.u,u))),theta=Math.acos(d),axis=unit(Math.abs(d)>.999999?frame.n:cross(frame.u,u)),
  turn=v=>add(add(mul(v,Math.cos(theta)),mul(cross(axis,v),Math.sin(theta))),mul(axis,dot(axis,v)*(1-Math.cos(theta))));
  const n=unit(turn(frame.n));return {u,v:unit(cross(n,u)),n};
 }
 // Quaternion interpolation preserves the entire rigid grip/blade frame on
 // the draw-to-ready and ready-to-sheath transitions, including its roll.
 function quaternion(f){const m=[f.u[0],f.v[0],f.n[0],f.u[1],f.v[1],f.n[1],f.u[2],f.v[2],f.n[2]],tr=m[0]+m[4]+m[8];let q,s;
  if(tr>0){s=Math.sqrt(tr+1)*2;q=[(m[7]-m[5])/s,(m[2]-m[6])/s,(m[3]-m[1])/s,s/4];}
  else if(m[0]>m[4]&&m[0]>m[8]){s=Math.sqrt(1+m[0]-m[4]-m[8])*2;q=[s/4,(m[1]+m[3])/s,(m[2]+m[6])/s,(m[7]-m[5])/s];}
  else if(m[4]>m[8]){s=Math.sqrt(1+m[4]-m[0]-m[8])*2;q=[(m[1]+m[3])/s,s/4,(m[5]+m[7])/s,(m[2]-m[6])/s];}
  else{s=Math.sqrt(1+m[8]-m[0]-m[4])*2;q=[(m[2]+m[6])/s,(m[5]+m[7])/s,s/4,(m[3]-m[1])/s];}return unit(q);
 }
 function frameBlend(a,b,t){if(t<=0)return a;if(t>=1)return b;let qa=quaternion(a),qb=quaternion(b),d=dot(qa,qb);if(d<0){qb=mul(qb,-1);d=-d;}
  const q=d>.9995?unit(blend(qa,qb,t)):arc(qa,qb,t),r=q.slice(0,3),turn=v=>add(v,mul(add(mul(cross(r,v),q[3]),cross(r,cross(r,v))),2));
  return {u:turn([1,0,0]),v:turn([0,1,0]),n:turn([0,0,1])};
 }
 function turnFrame(frame,axis,angle){const c=Math.cos(angle),s=Math.sin(angle),turn=v=>add(add(mul(v,c),mul(cross(axis,v),s)),mul(axis,dot(axis,v)*(1-c)));
  return {u:turn(frame.u),v:turn(frame.v),n:turn(frame.n)};
 }
 function drawFrame(start,end,t){
  if(t<=0)return start;if(t>=1)return end;
  // One continuous upper/back arc, without a stopped intermediate pose or
  // two unrelated quaternion rolls. Only the shortest final edge roll remains.
  const axis=unit(cross(start.u,end.u)),angle=Math.acos(Math.max(-1,Math.min(1,dot(start.u,end.u))))-2*Math.PI,
   landed=turnFrame(start,axis,angle),swing=turnFrame(start,axis,angle*t),
   roll=Math.atan2(dot(cross(landed.v,end.v),end.u),dot(landed.v,end.v));
  return turnFrame(swing,swing.u,roll*t);
 }
 let model=null;
 function prepare(meshes){
  const length=Math.hypot(8.6,7),axis=[8.6/length,-7/length],across=[7/length,8.6/length],guard=length+.48,
   attached=(w,t)=>{const x=-4.55+axis[0]*t+across[0]*w,y=-13.3068+axis[1]*t+across[1]*w,a=-.23,dy=y+17.3;
    const xx=x*Math.cos(a)-dy*Math.sin(a)-.45,yy=x*Math.sin(a)+dy*Math.cos(a)-17.5;
    return [-xx,-12-yy,-(3.69+.13*(yy+17))];},
   anchor=attached(0,guard+1.52),mouth=attached(0,length),tip=attached(0,0),u=unit(sub(tip,mouth)),
   n=unit(cross(u,sub(attached(1,guard),attached(0,guard)))),v=unit(cross(n,u)),
   world=q=>[-q[0],-12-q[1],-q[2]],
   along=q=>{const a=.23,x=q[0]+.45,y=q[1]+17.5,xx=x*Math.cos(a)-y*Math.sin(a),yy=x*Math.sin(a)+y*Math.cos(a)-17.3;
    return (xx+4.55)*axis[0]+(yy+13.3068)*axis[1];},
   hilt=[],sheath=[];
  for(const f of meshes.sword){
   if(Math.min(...f.v.map(along))>=guard-.450001){
    hilt.push({col:f.col,layer:f.layer||0,v:f.v.map(q=>{const d=sub(world(q),anchor);return [dot(d,u),dot(d,v),dot(d,n)];})});
   }else sheath.push(f);
  }
  if(!hilt.length||!sheath.length)throw Error('Kılıcın kabza/kın ayrımı bulunamadı.');
  model={anchor,mouth,tip,u,v,n,length,hilt,sheath};return model;
 }
 function apply(p,state){
  if(state.action!=='sword'||state.visible?.knight===false||state.visible?.sword===false)return p;
  if(!model)throw Error('Kılıç modeli hazırlanmadı.');
  const time=Math.max(0,Math.min(TIMING.settleEnd,state.actionTime??state.time)),a=phaseAt(time),
   firstDrive=a.slash>0&&a.slash<1?Math.sin(Math.PI*a.slash):0,secondDrive=a.cross>0&&a.cross<1?Math.sin(Math.PI*a.cross):0,
   pitch=.055*firstDrive+.045*secondDrive-.018*a.windup*(1-a.slash),
   roll=.025*(-a.windup+2*a.slash-2*a.cross)*(1-a.align),
   rotate=v=>{const x=v[0]*Math.cos(roll)-v[1]*Math.sin(roll),y=v[0]*Math.sin(roll)+v[1]*Math.cos(roll);
    return [x,y*Math.cos(pitch)-v[2]*Math.sin(pitch),y*Math.sin(pitch)+v[2]*Math.cos(pitch)];},
   upper=v=>add(rotate(sub(v,[0,p.seat,0])),[0,p.seat,0]),
   arm=p.armChains.find(l=>l.side===-1),rest=arm.end,root=upper(arm.root),L=10.1,
   grip=add(model.anchor,[0,p.seat,0]),r=sub(grip,arm.root),along=dot(r,model.u),
   drawDistance=model.length+2-dot(sub(model.mouth,model.anchor),model.u)+.35,drawn=add(grip,mul(model.u,-drawDistance)),drawReach=Math.hypot(...sub(drawn,arm.root)),
   drawDir=unit(sub(drawn,arm.root)),returnReach=drawReach,
   returnDistance=along+Math.sqrt(Math.max(0,along*along+returnReach*returnReach-dot(r,r))),returned=add(grip,mul(model.u,-returnDistance)),returnDir=unit(sub(returned,arm.root)),
   // X negative is the anatomical sword side. All cutting directions point
   // forward (+Z), with one long straight shoulder/elbow/hand/blade chain.
   rightUp=unit([-.56,.62,.55]),leftDown=unit([.64,-.46,.62]),leftUp=unit([.56,.65,.54]),rightDown=unit([-.64,-.46,.62]),
   followDir=unit([-.72,-.48,.50]),baseFrame={u:model.u,v:model.v,n:model.n},readyFrame=transport(baseFrame,rightUp),
   // The same upper/back draw arc is traversed in reverse when sheathing.
   followFrame=transport(readyFrame,followDir),
   firstCut=t=>unit(add(arc(rightUp,leftDown,t),[0,.52*Math.sin(Math.PI*t),0])),
   // The first cut's broad blade plane contains its travel tangent. Its
   // sharpened longitudinal edge leads the cut, not the flat of the blade.
   firstEdge=t=>{const u=firstCut(t),tangent=sub(firstCut(Math.min(1,t+.0001)),firstCut(Math.max(0,t-.0001))),
    v=unit(sub(tangent,mul(u,dot(tangent,u))));return {u,v,n:unit(cross(u,v))};},
   firstStart=firstEdge(0),firstEnd=firstEdge(1);
  // Route the empty hand outside the shoulder, not straight through its IK
  // singularity. The same reversible arc is used to take/release the grip.
  const emptyHand=t=>add(blend(rest,grip,t),[-3.5*Math.sin(Math.PI*t),0,0]);
  let hand=emptyHand(a.reach),frame=baseFrame,straight=0,reveal=0,dir=drawDir,flexTurn=null;
  if(a.extract>0){hand=blend(grip,drawn,a.extract);reveal=a.extract;}
  if(time>=TIMING.drawEnd&&time<=TIMING.alignEnd){
   let reach=mix(drawReach,L,a.windup);
   flexTurn=2.25*(1-a.windup);
   dir=arc(drawDir,rightUp,smooth(((time-TIMING.drawEnd)/(TIMING.windupEnd-TIMING.drawEnd)-.25)/.75));
   frame=drawFrame(baseFrame,firstStart,a.windup);reveal=1;
   if(a.slash>0){dir=firstCut(a.slash);frame=firstEdge(a.slash);}
   if(a.rebound>0){dir=arc(leftDown,leftUp,a.rebound);frame=frameBlend(transport(firstEnd,dir),transport(readyFrame,dir),a.rebound);}
   if(a.cross>0){dir=arc(leftUp,rightDown,a.cross);frame=transport(readyFrame,dir);}
   if(a.follow>0){dir=arc(rightDown,followDir,a.follow);frame=transport(readyFrame,dir);}
   // Lift into the same high pose that ends the draw. Then replay its full
   // hand/blade curve backward, without a separate wrist-turn choreography.
   if(a.recover>0){dir=arc(followDir,rightUp,a.recover);reach=L;frame=frameBlend(transport(followFrame,dir),transport(firstStart,dir),a.recover);}
   if(a.align>0){
    const reverse=1-(time-TIMING.recoverEnd)/(TIMING.alignEnd-TIMING.recoverEnd);
    dir=arc(drawDir,rightUp,smooth((reverse-.25)/.75));reach=mix(drawReach,L,1-a.align);
    frame=drawFrame(baseFrame,firstStart,1-a.align);
    flexTurn=2.25*a.align;
   }
   straight=time>=TIMING.windupEnd&&time<=TIMING.recoverEnd?1:0;hand=add(arm.root,mul(dir,reach));
  }
  if(a.sheath>0){hand=blend(returned,grip,a.sheath);frame=baseFrame;reveal=1-a.sheath;}
  if(a.settle>0){hand=emptyHand(1-a.settle);frame=baseFrame;reveal=0;}
  hand=upper(hand);
  // Interpolate bend angle in a nonsingular frame, not two raw pole vectors
  // that can cancel when projected onto the hand axis.
  const bendAngle=(target,pole)=>{const axis=unit(sub(target,arm.root)),v=unit(cross(axis,[0,1,0])),n=cross(axis,v),perp=unit(sub(pole,mul(axis,dot(pole,axis))));
   return Math.atan2(dot(perp,n),dot(perp,v));},
   restBend=bendAngle(rest,[-.28,-.8,-.5]),gripBend=bendAngle(grip,[-.9,-.1,1]),
   bendDelta=Math.atan2(Math.sin(gripBend-restBend),Math.cos(gripBend-restBend)),
   emptyPole=t=>{const axis=unit(sub(emptyHand(t),arm.root)),v=unit(cross(axis,[0,1,0])),n=cross(axis,v),angle=restBend+bendDelta*t;return add(mul(v,Math.cos(angle)),mul(n,Math.sin(angle)));};
  const axis=unit(sub(hand,root)),distance=Math.hypot(...sub(hand,root)),amount=a.reach*(1-a.settle),
   flex=straight?0:flexTurn??2.25*smooth((distance-9.2)/(drawReach-9.2)),
   solve=()=>{const A=5+flex,B=5.1+flex,d=Math.max(Math.abs(A-B)+1e-9,Math.min(A+B,distance)),
    along=(A*A-B*B+d*d)/(2*d),pole=rotate(amount<1?emptyPole(amount):[-.9,-.1,1]),raw=unit(sub(pole,mul(axis,dot(pole,axis)))),
    // During withdrawal, settle into a single sagittal bend plane. At full
    // draw the elbow has no extra anatomical-X excursion beyond the hand
    // line; opening it cannot sweep the upper arm sideways. Keep the grip
    // and blade path unchanged, and reverse the same guide on insertion.
    planar=unit(cross(rotate([1,0,0]),axis)),perp=arc(raw,planar,smooth(reveal));
    return {root,joint:add(add(root,mul(axis,along)),mul(perp,Math.sqrt(Math.max(0,A*A-along*along)))),end:add(root,mul(axis,d)),a:A,b:B,side:-1};},
   solved=amount===0?arm:straight?
    {root,joint:add(root,mul(axis,5)),end:add(root,mul(axis,10.1)),a:5,b:5.1,side:-1}:
    solve();
  if(flex>0){
   // Only joint spacing changes. The native silver upper/lower armour cores
   // retain their original 5 / 5.1 lengths; caps and fist keep their sizes.
   const u=unit(sub(solved.joint,root)),v=unit(sub(solved.end,solved.joint));
   solved.flex={amount:flex,upper:[add(root,mul(u,flex/2)),add(solved.joint,mul(u,-flex/2))],
    lower:[add(solved.joint,mul(v,flex/2)),add(solved.end,mul(v,-flex/2))]};
   solved.a=5;solved.b=5.1;
  }
  p.armChains=p.armChains.map(l=>l.side===-1?solved:amount===0?l:{...R.ik(upper(l.root),l.end,5,5.1,rotate([.28,-.8,-.5])),side:l.side});
  const hip=p.project([0,p.seat,0]),chest=p.project(upper([0,p.seat+9,0])),
   lean=Math.atan2(chest[0]-hip[0],hip[1]-chest[1]),
   toLocal=v=>{const q=p.project(v),x=q[0]-hip[0],y=q[1]-hip[1];return [x*Math.cos(lean)+y*Math.sin(lean),-12-x*Math.sin(lean)+y*Math.cos(lean)];};
  p.actionBody={pitch,roll,lean,upper,rotate,hip,restArms:p.native.arms};
  p.native={...p.native,depthShoulders:time>0&&time<TIMING.settleEnd,body:{...p.native.body,lean},arms:p.armChains.map(l=>{const [sx,sy]=toLocal(l.root),[ex,ey]=toLocal(l.joint),[hx,hy]=toLocal(l.end);
   return {sx,sy,ex,ey,hx,hy,flex:l.flex&&{upper:l.flex.upper.map(toLocal),lower:l.flex.lower.map(toLocal)},walkDepth:{shoulder:p.depth(l.root),upper:p.depth(l.joint),hand:p.depth(l.end),weight:0},physical:l};})};
  const held=time>=TIMING.gripEnd&&time<=TIMING.sheathEnd,u=rotate(frame.u),v=rotate(frame.v),n=rotate(frame.n),renderWeapon=time>0&&time<TIMING.settleEnd;
  p.sword={time,phase:a,held,renderWeapon,hand:solved.end,gripPoint:held?solved.end:upper(grip),target:hand,u,v,n,reveal,straight,drawDistance,reachError:Math.hypot(...sub(hand,solved.end)),model};
  return p;
 }
 function faces(p){
  const s=p.sword;if(!s?.renderWeapon)return [];
  const {u,v,n,gripPoint,model:m}=s,point=([t,w,d])=>add(gripPoint,add(mul(u,t),add(mul(v,w),mul(n,d)))),result=[];
  for(const f of m.hilt)result.push({...f,v:f.v.map(point)});
  // One rigid full blade throughout draw, strike and return. The real sheath
  // depth hides the inserted section; never grow, clip or swap the sword mesh.
  const base=1.64,tip=m.length+2,width=1.45,tipLength=Math.min((tip-base)*.45,Math.max(.85,width*1.15)),
   shape=[[base,-width/2],[tip-tipLength,-width/2],[tip,0],[tip-tipLength,width/2],[base,width/2]];
  if(shape.length>2){
   for(const sign of [-1,1])result.push({blade:true,col:sign===1?'#edf4f7':'#bac9d4',v:shape.map(([t,w])=>point([t,w,.10*sign]))});
   for(let i=0;i<shape.length;i++){const a=shape[i],b=shape[(i+1)%shape.length];result.push({blade:true,col:'#ffffff',v:[point([...a,-.1]),point([...b,-.1]),point([...b,.1]),point([...a,.1])]});}
  }
  return result;
 }
 function trails(p,state){
  const s=p.sword;if(!s?.held||s.phase.trail<=.02||s.reveal<=.25)return [];
  // A deterministic 45ms look-back preserves scrub/replay equivalence; it
  // never accumulates geometry or depends on the browser's frame rate.
  const priorState={...state,time:Math.max(0,state.time-.045),actionTime:Math.max(0,s.time-.045)},old=apply(R.sample(priorState),priorState).sword;
  if(!old?.held)return [];
  const edge=q=>[add(q.hand,mul(q.u,1.64)),add(q.hand,mul(q.u,q.model.length+2))],
   [base,tip]=edge(s),[oldBase,oldTip]=edge(old),middleBase=blend(oldBase,base,.54),middleTip=blend(oldTip,tip,.54);
  return [{col:'#a9e9ff',alpha:.13*s.phase.trail,v:[middleBase,middleTip,oldTip,oldBase]},
   {col:'#3978ff',alpha:.245*s.phase.trail,v:[base,tip,middleTip,middleBase]}];
 }
 function neckMasks(p){
  if(!p.sword?.renderWeapon&&!p.shield?.renderShield&&!p.bow?.renderBow)return [];
  // The shared native arm mask ends at the cuirass. Mask only physical arm
  // fragments behind the exposed neck; never put the complete arm behind it.
  const clip=(poly,value)=>{const out=[];if(!poly.length)return out;let a=poly.at(-1),va=value(a);
   for(const b of poly){const vb=value(b);if((va>=0)!==(vb>=0)){const t=va/(va-vb);out.push([mix(a[0],b[0],t),mix(a[1],b[1],t)]);}if(vb>=0)out.push(b);a=b;va=vb;}return out;},
   neck=[[-1.4,-23.95],[1.4,-23.95],[1.4,-21.7],[-1.4,-21.7]],a=p.angle*Math.PI/180,
   depth=p.depth(p.actionBody.upper([0,p.seat+11.1,0]))+1.4*(Math.abs(Math.cos(a))+Math.abs(Math.sin(a))),masks=[],
   h=serJonathanHelmetProjection(-27.1,0),c=Math.cos(a),s=Math.sin(a),half=3.5*(Math.abs(c)+Math.abs(s))-.85*Math.min(Math.abs(c),Math.abs(s)),
   volumes=[{outline:neck,depth:()=>depth}],
   helmetDepth=q=>{let near=Infinity;for(const [nx,nz,bound]of [[1,0,3.5],[-1,0,3.5],[0,1,3.5],[0,-1,3.5],[1,1,6.15],[1,-1,6.15],[-1,1,6.15],[-1,-1,6.15]]){const along=-nx*s+nz*c;if(along>1e-8)near=Math.min(near,(bound-(nx*c+nz*s)*q[0])/along);}return near+p.depth(p.actionBody.upper([0,p.seat-q[1]-12,0]));},
   addMask=(x0,y0,x1,y1,r,d0,d1)=>{const dx=x1-x0,dy=y1-y0,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
    for(const volume of volumes){let q=volume.outline;q=clip(q,v=>(v[0]-x0)*dx/len+(v[1]-y0)*dy/len+r);
    q=clip(q,v=>len+r-(v[0]-x0)*dx/len-(v[1]-y0)*dy/len);
    q=clip(q,v=>r-(v[0]-x0)*nx-(v[1]-y0)*ny);q=clip(q,v=>r+(v[0]-x0)*nx+(v[1]-y0)*ny);
    q=clip(q,v=>volume.depth(v)-(d0+(d1-d0)*((v[0]-x0)*dx+(v[1]-y0)*dy)/(len*len)+r));
    if(q.length>2)masks.push(q);
    }
   };
  // The native profile paints its helmet before raised forearms. Restore
  // only fragments behind the actual helmet; the near arm remains untouched.
  if(p.actionBody.rigidProjection){
   volumes.length=0;
   const rigid=p.native.gaze.rigid,surface=vertices=>{const points=vertices.map(v=>[...rigid.project(v),rigid.depth(v)]),a=points[0],b=points[1],d=points[2],
     dx=b[0]-a[0],dy=b[1]-a[1],ex=d[0]-a[0],ey=d[1]-a[1],det=dx*ey-dy*ex;
    if(Math.abs(det)<1e-8)return;const zx=((b[2]-a[2])*ey-(d[2]-a[2])*dy)/det,zy=(dx*(d[2]-a[2])-ex*(b[2]-a[2]))/det;
    volumes.push({outline:points.map(v=>v.slice(0,2)),depth:q=>a[2]+zx*(q[0]-a[0])+zy*(q[1]-a[1])});},
    box=(ring,top,bottom)=>{const a=ring.map(([x,z])=>[x,top,z]),b=ring.map(([x,z])=>[x,bottom,z]);surface(a);surface(b);for(let i=0;i<a.length;i++)surface([a[i],a[(i+1)%a.length],b[(i+1)%a.length],b[i]]);};
   box([[-1.4,-1.4],[1.4,-1.4],[1.4,1.4],[-1.4,1.4]],-26,-20.9);
   if(p.native.degrees<=90)box([[-2.65,-3.5],[2.65,-3.5],[3.5,-2.65],[3.5,2.65],[2.65,3.5],[-2.65,3.5],[-3.5,2.65],[-3.5,-2.65]],h.planeY,h.bottomY);
  }else if(p.native.degrees<=90)volumes.push({outline:[[-half+.32,h.topY],[half-.32,h.topY],[half,h.planeY],[half,h.bottomY],[-half,h.bottomY],[-half,h.planeY]],depth:helmetDepth});
  for(const arm of p.native.arms){
   addMask(arm.sx,arm.sy,arm.ex,arm.ey,1.025,arm.walkDepth.shoulder,arm.walkDepth.upper);
   addMask(arm.ex,arm.ey,arm.hx,arm.hy,1.05,arm.walkDepth.upper,arm.walkDepth.hand);
  }
  return masks.map(poly=>poly.map(([x,y])=>{const a=p.actionBody.lean,v=y+12;return [p.origin[0]+x*Math.cos(a)-v*Math.sin(a),p.origin[1]-12+x*Math.sin(a)+v*Math.cos(a)];}));
 }
 // Scope the existing primitive adapter to this one native draw call. This
 // reuses the approved arm recipe and its chest/gear/shoulder painter order,
 // without modifying the shared model or scaling any armour mesh.
 function withJointFlex(p,draw){
  const a=p.native.arms.find(a=>a.flex);if(!a)return draw();
  const original=rigSegment,near=(x,y)=>Math.abs(x-y)<1e-7,[[ux,uy],[vx,vy]]=a.flex.upper,[[lx,ly],[hx,hy]]=a.flex.lower;
  rigSegment=function(x0,y0,x1,y1,width,col){
   const shift=near(width,.38)||near(width,.32)?-.35:0;
   if(near(x0,a.sx+shift)&&near(y0,a.sy)&&near(x1,a.ex+shift)&&near(y1,a.ey))return original(ux+shift,uy,vx+shift,vy,width,col);
   if(near(x0,a.ex+shift)&&near(y0,a.ey)&&near(x1,a.hx+shift)&&near(y1,a.hy))return original(lx+shift,ly,hx+shift,hy,width,col);
   if(near(width,1.65)&&near(x1,a.hx)&&near(y1,a.hy)){const d=Math.hypot(hx-lx,hy-ly)||1;return original(hx-(hx-lx)/d*.85,hy-(hy-ly)/d*.85,hx,hy,width,col);}
   return original(x0,y0,x1,y1,width,col);
  };
  try{return draw();}finally{rigSegment=original;}
 }
 window.KRMountedSword={prepare,apply,faces,trails,neckMasks,withJointFlex,phaseAt,timing:TIMING,duration:()=>TIMING.settleEnd};
})();
