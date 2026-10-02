/* Mounted Lab shield: fixed bones, forearm threaded through the inner straps.
 * Native plate/crest; inner leather loops have clearance for the gauntlet. */
(()=>{'use strict';
 const R=KRMountedRig,{add,sub,mul,unit}=R,blend=(a,b,t)=>add(a,mul(sub(b,a),t)),
  dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  clamp=v=>Math.max(0,Math.min(1,v)),smooth=v=>{const t=clamp(v);return t*t*t*(10+t*(-15+6*t));},span=(t,a,b)=>smooth((t-a)/(b-a));
 const timing=Object.freeze({bash:Object.freeze({grip:.36,ready:.94,contact:1.10,hold:1.10,retreat:1.10,remount:2.40,end:2.76}),
  parry:Object.freeze({grip:.36,ready:1.24,guard:1.24,release:1.49,contact:1.70,follow:1.84,retreatStart:2.00,retreat:2.00,remount:2.90,end:3.26})});
 let model=null;
 function prepare(meshes){
  const world=q=>[-q[0],-12-q[1],-q[2]],center=col=>{const vs=meshes.shield.filter(f=>f.col===col).flatMap(f=>f.v);if(!vs.length)throw Error('Kalkan kayışı bulunamadı.');return world([0,1,2].map(i=>(Math.min(...vs.map(p=>p[i]))+Math.max(...vs.map(p=>p[i])))/2));},
   anchor=add(center('#a67543'),[0,0,.72]),loop=add(center('#aa7a4b'),[0,0,.72]),u=unit(sub(anchor,loop)),n=unit(cross(u,[0,1,0])),v=cross(n,u),
   leather=new Set(['#a67543','#aa7a4b','#87603b','#493522','#6b482e']);
  // The original shallow loops were sized for a painted hand. Lift only
  // their existing leather surfaces so the unchanged armour fits beneath.
  // Plate, rim, crest and metal bracing are not rescaled or repainted.
  const faces=meshes.shield.map(f=>({col:f.col,layer:f.layer||0,v:f.v.map(q=>{const p=world(q);if(leather.has(f.col))p[2]+=1.7*(q[0]<0?1:clamp((q[0]-1.25)/.60));return sub(p,anchor);})})),
   palmPoints=[...new Map(meshes.shield.filter(f=>f.col==='#a67543').flatMap(f=>f.v).map(p=>[p.join(','),p])).values()];
  // Return both ends of the palm strap to its original plate anchors.
  for(const y of [Math.min(...palmPoints.map(p=>p[1])),Math.max(...palmPoints.map(p=>p[1]))]){const edge=palmPoints.filter(p=>Math.abs(p[1]-y)<1e-5).sort((a,b)=>a[0]-b[0]);if(edge.length<2)continue;
   const a=world(edge[0]),b=world(edge.at(-1));faces.push({col:'#87603b',layer:0,v:[a,b,add(b,[0,0,1.7]),add(a,[0,0,1.7])].map(p=>sub(p,anchor))});}
  model={anchor,loop,u,v,n,faces};
 }
 const identity={u:[1,0,0],v:[0,1,0],n:[0,0,1]},transform=(f,p)=>add(mul(f.u,p[0]),add(mul(f.v,p[1]),mul(f.n,p[2])));
 function quaternion(f){const m=[f.u[0],f.v[0],f.n[0],f.u[1],f.v[1],f.n[1],f.u[2],f.v[2],f.n[2]],tr=m[0]+m[4]+m[8];let q,s;
  if(tr>0){s=Math.sqrt(tr+1)*2;q=[(m[7]-m[5])/s,(m[2]-m[6])/s,(m[3]-m[1])/s,s/4];}
  else if(m[0]>m[4]&&m[0]>m[8]){s=Math.sqrt(1+m[0]-m[4]-m[8])*2;q=[s/4,(m[1]+m[3])/s,(m[2]+m[6])/s,(m[7]-m[5])/s];}
  else if(m[4]>m[8]){s=Math.sqrt(1+m[4]-m[0]-m[8])*2;q=[(m[1]+m[3])/s,s/4,(m[5]+m[7])/s,(m[2]-m[6])/s];}
  else{s=Math.sqrt(1+m[8]-m[0]-m[4])*2;q=[(m[2]+m[6])/s,(m[5]+m[7])/s,s/4,(m[3]-m[1])/s];}return unit(q);
 }
 function frameBlend(a,b,t){if(t<=0)return a;if(t>=1)return b;const qa=quaternion(a);let qb=quaternion(b),d=dot(qa,qb);if(d<0){qb=mul(qb,-1);d=-d;}
  const theta=Math.acos(Math.min(1,d)),q=d>.9995?unit(blend(qa,qb,t)):mul(add(mul(qa,Math.sin((1-t)*theta)),mul(qb,Math.sin(t*theta))),1/Math.sin(theta)),r=q.slice(0,3),
   turn=v=>add(v,mul(add(mul(cross(r,v),q[3]),cross(r,cross(r,v))),2));return {u:turn([1,0,0]),v:turn([0,1,0]),n:turn([0,0,1])};
 }
 // While threaded, the elbow-to-hand direction also runs from the raised
 // loop to the palm strap. Recovery releases the loop before folding the arm.
 function forearmFrame(arm){const u=unit(sub(arm.end,arm.joint)),n=unit(cross(u,[0,1,0])),v=cross(n,u),
   map=p=>add(mul(u,dot(p,model.u)),add(mul(v,dot(p,model.v)),mul(n,dot(p,model.n))));return {u:map([1,0,0]),v:map([0,1,0]),n:map([0,0,1])};}
 function shieldIK(root,hand,pole){const axis=unit(sub(hand,root)),distance=Math.min(10.1,Math.hypot(...sub(hand,root))),along=(25-26.01+distance*distance)/(2*distance);
  return {root,joint:add(add(root,mul(axis,along)),mul(pole,Math.sqrt(Math.max(0,25-along*along)))),end:add(root,mul(axis,distance)),a:5,b:5.1,side:1};}
 const shoulder=[3.7,8.9,0],guard=[3.2,10.6,6.4],bashPitch=.40,bashYaw=.45,finishDirection=unit([.92,.38,.10]),readyHand=action=>action==='bash'?[5.8,10.4,3.5]:guard,
  cubic=(a,b,c,d,t)=>add(add(mul(a,(1-t)**3),mul(b,3*(1-t)**2*t)),add(mul(c,3*(1-t)*t*t),mul(d,t**3)));
 // Inspired by the native bash: turn the plate upright beside the shoulder
 // and drive its broad face forward with a braced elbow, not a straight fist.
 // A small inward yaw clears the helmet; both rigid bones determine the hand.
 function bashBrace(){const elbow=[3,1,Math.sqrt(15)],forearm=[-model.u[0]*Math.cos(bashYaw)-model.u[2]*Math.sin(bashYaw),model.u[1],model.u[0]*Math.sin(bashYaw)-model.u[2]*Math.cos(bashYaw)],
   unpitch=v=>[v[0],v[1]*Math.cos(bashPitch)+v[2]*Math.sin(bashPitch),-v[1]*Math.sin(bashPitch)+v[2]*Math.cos(bashPitch)];
  return {hand:add(shoulder,unpitch(add(elbow,mul(forearm,5.1)))),guide:unpitch(elbow)};
 }
 function transfer(a,action){const t=smooth(a);return {hand:cubic(model.anchor,[14,5.6,-7.2],[16,9.0,8.0],readyHand(action),t),thread:smooth((a-.36)/.24)};}
 // Build speed into the hit; reserve only the final 12% for braking instead
 // of easing slowly into contact for half of the forward stroke.
 function strikeEase(v){const u=clamp(v);if(u<.88)return u*u*u;const x=(u-.88)/.12,x2=x*x,x3=x2*x;
  return (2*x3-3*x2+1)*.681472+(x3-2*x2+x)*.278784-2*x3+3*x2;}
 function poseAt(action,time){const T=timing[action],t=Math.max(0,Math.min(T.end,time)),reach=span(t,0,T.grip),settle=span(t,T.remount,T.end),a=clamp((t-T.grip)/(T.ready-T.grip)),ready=transfer(1,action);
  let {hand,thread}=transfer(a,action),drive=0,bend=0;
  if(action==='bash'){
   // The strike overtakes the draw BEFORE it reaches the guard. The old
   // separate ready/strike eases brought the shield to a stop in between.
   drive=strikeEase((t-.76)/(T.contact-.76));hand=blend(hand,bashBrace().hand,drive);
  }
  else if(t>T.release){const sweep=span(t,T.release,T.follow),from=unit(sub(guard,shoulder)),high=unit([.22,.72,.66]),finish=finishDirection,
    direction=unit(add(add(mul(from,(1-sweep)**2),mul(high,2*(1-sweep)*sweep)),mul(finish,sweep*sweep))),
    reach=Math.hypot(...sub(guard,shoulder)),extension=smooth(sweep/.62);
   hand=add(shoulder,mul(direction,reach+(10.1-reach)*extension));drive=sweep;bend=extension;
  }
  if(action==='parry'&&t>=T.retreatStart){const back=span(t,T.retreatStart,T.remount);
   // From the high finish directly around the left shoulder to the back.
   // Do not reload the forward guard before remounting the shield.
   hand=cubic(add(shoulder,mul(finishDirection,10.1)),[11.8,11,-3],[9,7.5,-7],model.anchor,back);
   thread=1-back;drive=1-back;bend=1-back;
  }else if(action==='bash'&&t>=T.retreat){const a=clamp((t-T.retreat)/(T.remount-T.retreat)),back=transfer(1-a,action);
   // Short recoil feeds directly into the returning arc, not a guard hold.
   drive=1-smooth(a/.40);hand=blend(back.hand,bashBrace().hand,drive);thread=back.thread;
  }
  // Clear the helmet with the rim while the plate turns upright. This small
  // outward/forward arc vanishes at contact and on the back mount.
  if(action==='bash')hand=add(hand,mul([.6,0,.85],4*drive*(1-drive)));
  return {t,reach,settle,hand,thread,drive,bend,held:t>=T.grip&&t<=T.remount,renderShield:t>1e-12&&t<T.end-1e-12};
 }
 function apply(p,state){const action=state.action;if(!timing[action]||state.visible?.knight===false||state.visible?.shield===false)return p;
  if(!model)throw Error('Kalkan modeli hazırlanmadı.');const q=poseAt(action,state.actionTime??state.time),T=timing[action],weight=q.reach*(1-q.settle);if(!q.renderShield)return p;
  const arm=p.armChains.find(l=>l.side===1),baseRoot=sub(arm.root,[0,p.seat,0]),rest=sub(arm.end,[0,p.seat,0]),
   empty=t=>add(blend(rest,model.anchor,t),[3.1*Math.sin(Math.PI*t),-2.5*Math.sin(Math.PI*t),0]),
   target=q.t<T.grip?empty(q.reach):q.t>T.remount?empty(1-q.settle):q.hand,
   pitch=action==='bash'?bashPitch*q.drive**1.8-.075*span(q.t,T.grip,.76)*(1-q.drive)*(1-span(q.t,T.contact,T.remount)):.025*q.drive,roll=action==='bash'?0:-.015*q.drive,
   rotate=v=>{const x=v[0]*Math.cos(roll)-v[1]*Math.sin(roll),y=v[0]*Math.sin(roll)+v[1]*Math.cos(roll);return [x,y*Math.cos(pitch)-v[2]*Math.sin(pitch),y*Math.sin(pitch)+v[2]*Math.cos(pitch)];},
   upper=v=>add(rotate(sub(v,[0,p.seat,0])),[0,p.seat,0]),root=upper(arm.root),hand=upper(add(target,[0,p.seat,0])),
   basis=target=>{const axis=unit(sub(target,baseRoot)),v=unit(cross(axis,[0,0,1]));return {axis,v,n:cross(axis,v)};},
   angle=(target,pole)=>{const b=basis(target);return Math.atan2(dot(pole,b.n),dot(pole,b.v));},
   restAngle=angle(rest,[.28,-.8,-.5]),gripAngle=angle(model.anchor,[1,-1.6,.1]),delta=Math.atan2(Math.sin(gripAngle-restAngle),Math.cos(gripAngle-restAngle)),
   // Empty-hand reach interpolates a stable bend angle. Once holding, an
   // outward/downward anatomical guide avoids frame winding as the hand
   // crosses in front of the chest. The elbow never orbits the wrist.
   b=basis(target),transferAmount=q.t<T.grip?0:q.t>T.remount?0:q.t<T.ready?span(q.t,T.grip,T.ready):q.t>T.retreat?1-span(q.t,T.retreat,T.remount):1,
   bendAngle=restAngle+delta*weight,baseGuide=blend([1,-1.6,.1],[1,-.25,0],transferAmount),guide=action==='bash'?blend(baseGuide,bashBrace().guide,q.drive):baseGuide,
   bendPole=q.held?unit(sub(guide,mul(b.axis,dot(guide,b.axis)))):add(mul(b.v,Math.cos(bendAngle)),mul(b.n,Math.sin(bendAngle))),
   pole=rotate(bendPole),solved=shieldIK(root,hand,pole),
   hip=p.project([0,p.seat,0]),chest=p.project(upper([0,p.seat+9,0])),lean=Math.atan2(chest[0]-hip[0],hip[1]-chest[1]),
   local=v=>{const a=p.project(v),x=a[0]-hip[0],y=a[1]-hip[1];return [x*Math.cos(lean)+y*Math.sin(lean),-12-x*Math.sin(lean)+y*Math.cos(lean)];};
  p.actionBody={pitch,roll,lean,upper,rotate,hip,restArms:p.native.arms};
  p.armChains=p.armChains.map(l=>l.side===1?solved:{...R.ik(upper(l.root),l.end,5,5.1,rotate([-.28,-.8,-.5])),side:l.side});
  p.native={...p.native,depthShoulders:true,body:{...p.native.body,lean},arms:p.armChains.map(l=>{const [sx,sy]=local(l.root),[ex,ey]=local(l.joint),[hx,hy]=local(l.end);return {sx,sy,ex,ey,hx,hy,walkDepth:{shoulder:p.depth(l.root),upper:p.depth(l.joint),hand:p.depth(l.end),weight:0},physical:l};})};
  const mounted={u:rotate(identity.u),v:rotate(identity.v),n:rotate(identity.n)};
  let carried=forearmFrame(solved);
  if(action==='parry'&&q.t>=T.retreatStart){
   // Preserve the finish's plate orientation while the elbow folds. Using the
   // changing forearm here first yaws the plate away, then snaps it back toward
   // the mount as the loop releases. One shortest-arc blend avoids that wobble;
   // the palm remains attached and the forearm is free to leave the loose loop.
   const finish=add(shoulder,mul(finishDirection,10.1)),fb=basis(finish),guide=[1,-.25,0],
    finishPole=rotate(unit(sub(guide,mul(fb.axis,dot(guide,fb.axis)))));
   carried=forearmFrame(shieldIK(root,upper(add(finish,[0,p.seat,0])),finishPole));
  }
  const frame=frameBlend(mounted,carried,q.thread);
  p.shield={...q,action,weight,model,frame,grip:q.held?solved.end:upper(add(model.anchor,[0,p.seat,0])),reachError:Math.hypot(...sub(hand,solved.end))};
  if(action==='bash'&&Math.abs(pitch)>1e-10){
   // Screen-space roll alone loses a forward hinge at 0/180 degrees. Reuse
   // the native duck rig's projected body/head contract, retaining this
   // action's exact bones, hand path, timing and rigid equipment attachment.
   const local=v=>{const a=p.project(v);return [a[0]-p.origin[0],a[1]-p.origin[1]];},yaw=p.angle*Math.PI/180,
    shoulder=local(upper([0,p.seat+8.9,0])),neck=local(upper([0,p.seat+14,0])),head=local(upper([0,p.seat+15.1,0])),
    amount=clamp(Math.abs(pitch)/bashPitch),headWorld=([x,y,z])=>upper([x,p.seat-12-y,-z]),
    headProject=v=>{const a=local(headWorld(v)),neutralDepth=-v[2]*Math.cos(yaw)-v[0]*Math.sin(yaw);a[1]-=neutralDepth*.16*(1-amount);return a;},
    zero=headProject([0,0,0]),basis=[[1,0,0],[0,1,0],[0,0,1]].map(v=>{const a=headProject(v);return [a[0]-zero[0],a[1]-zero[1]];}),
    view=cross(basis.map(v=>v[0]),basis.map(v=>v[1])),rigid={project:headProject,depth:v=>p.depth(headWorld(v)),facing:n=>-dot(n,view)};
   p.actionBody={...p.actionBody,lean:0,rigidProjection:true};
   p.shield.upperPose={pitch,headDepth:p.depth(upper([0,p.seat+15.1,0]))+3.5};
   p.native={...p.native,body:{...p.native.body,lean:0,shoulderX:shoulder[0],shoulderY:shoulder[1],neckX:neck[0],neckY:neck[1],duckDepth:p.depth(upper([0,p.seat+5,0]))+2.2},
    gaze:{x:head[0],y:head[1]+27.1,pitch,roll:pitch*Math.sin(yaw),rigid},
    arms:p.armChains.map(l=>{const [sx,sy]=local(l.root),[ex,ey]=local(l.joint),[hx,hy]=local(l.end);return {sx,sy,ex,ey,hx,hy,walkDepth:{shoulder:p.depth(l.root),upper:p.depth(l.joint),hand:p.depth(l.end),weight:0},physical:l};})};
  }
  return p;
 }
 function faces(p){const q=p.shield;if(!q?.renderShield)return [];const {u,v,n}=q.frame,g=q.grip;
  // A rigid plate needs one result vector per vertex, not seven temporary
  // vectors for nested multiply/add operations on every painted face.
  return model.faces.map(f=>({...f,v:f.v.map(a=>[g[0]+(u[0]*a[0]+(v[0]*a[1]+n[0]*a[2])),g[1]+(u[1]*a[0]+(v[1]*a[1]+n[1]*a[2])),g[2]+(u[2]*a[0]+(v[2]*a[1]+n[2]*a[2]))])}));}
 window.KRMountedShield={prepare,apply,faces,timing,poseAt};
})();
