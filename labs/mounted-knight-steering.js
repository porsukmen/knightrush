/* Rein-led guidance layered over the live gait, duck or jump pose. */
(()=>{'use strict';
 const R=KRMountedRig,{add,sub}=R;
 function apply(p,state){
  const amount=Math.max(-1,Math.min(1,state.riderSteer||0));
  if(Math.abs(amount)<1e-7||p.sword)return p;
  const yaw=p.angle*Math.PI/180,cy=Math.cos(yaw),sy=Math.sin(yaw),
   lean=amount*.055,c=Math.cos(lean),s=Math.sin(lean),
   // The seat stays planted. A small lateral balance follows the rein cue.
   upper=v=>{const x=v[0]*cy+v[2]*sy,d=v[2]*cy-v[0]*sy,y=v[1]-p.seat,nx=x*c+y*s;
    return [nx*cy-d*sy,p.seat-x*s+y*c,nx*sy+d*cy];},
   baseUpper=p.actionBody?.upper||(v=>v),oldArms=p.armChains,
   baseLean=p.native.body.lean||0,totalLean=baseLean+lean,
   hip=p.project([0,p.seat,0]),lc=Math.cos(totalLean),ls=Math.sin(totalLean),
   local=v=>{const q=p.project(v),x=q[0]-hip[0],y=q[1]-hip[1];return [x*lc+y*ls,-12-x*ls+y*lc];},
   baseNeck=baseUpper([0,p.seat+14,0]),neckDelta=sub(upper(baseNeck),baseNeck),
   screenDelta=sub(p.project(add(baseNeck,neckDelta)),p.project(baseNeck)),depthDelta=p.depth(neckDelta),
   oldRigid=p.native.gaze?.rigid,baseProject=oldRigid?.project||(v=>[v[0]*cy-v[2]*sy,v[1]]),
   baseDepth=oldRigid?.depth||(v=>p.depth([v[0],p.seat-12-v[1],-v[2]])),
   baseFacing=oldRigid?.facing||(n=>-n[0]*sy-n[2]*cy),
   // A slight look into the requested direction; keep the neck as the pivot.
   headYaw=-amount*.055,yc=Math.cos(headYaw),ys=Math.sin(headYaw),
   headTurn=v=>[v[0]*yc+v[2]*ys,v[1],-v[0]*ys+v[2]*yc],
   bc=Math.cos(baseLean),bs=Math.sin(baseLean),headLean=lean*.6,hc=Math.cos(headLean),hs=Math.sin(headLean),
   baseHead=v=>{const q=baseProject(v);return [q[0]*bc-(q[1]+12)*bs,q[0]*bs+(q[1]+12)*bc];},
   headPivot=baseHead([0,-26,0]),
   headProject=v=>{const q=sub(baseHead(headTurn(v)),headPivot),x=headPivot[0]+q[0]*hc-q[1]*hs+screenDelta[0],y=headPivot[1]+q[0]*hs+q[1]*hc+screenDelta[1];return [x*lc+y*ls,-12-x*ls+y*lc];},
   rigid={project:headProject,depth:v=>baseDepth(headTurn(v))+depthDelta,facing:n=>baseFacing(headTurn(n))};
  p.armChains=oldArms.map(l=>{
   // Anatomical side, not absolute projected hand position: forward reach
   // puts both hands on the same screen side at diagonal views. Fade the
   // side-dependent cue through profile so roles exchange continuously.
   const cue=amount*l.side*cy,
    guide=Math.max(0,cue),support=Math.max(0,-cue),
    shift=.45*amount+.4*Math.sign(amount)*guide,
    target=add(l.end,[shift*cy,.18*guide-.06*support,shift*sy-.85*guide+.20*support]),
    root=upper(l.root),pole=sub(upper(l.joint),root);
   return {...R.ik(root,target,l.a,l.b,pole),side:l.side};
  });
  p.native={...p.native,body:{...p.native.body,lean:totalLean},gaze:{...p.native.gaze,rigid},arms:p.armChains.map(l=>{
   const [sx,sy]=local(l.root),[ex,ey]=local(l.joint),[hx,hy]=local(l.end);
   return {sx,sy,ex,ey,hx,hy,walkDepth:{shoulder:p.depth(l.root),upper:p.depth(l.joint),hand:p.depth(l.end),weight:0},physical:l};
  })};
  const upperPose=p.duck?{...p.duck,headDepth:p.depth(add(baseUpper([0,p.seat+15.1,0]),neckDelta))+3.5}:null;
  p.steering={amount,lean,headLean,headYaw,forwardPitch:0,neckDelta,upperPose,baseArms:oldArms};return p;
 }
 window.KRMountedSteering={apply};
})();
