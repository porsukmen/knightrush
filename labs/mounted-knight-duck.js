/* Mounted duck: a fixed hip hinge, fixed-length arms and planted stirrups. */
(()=>{'use strict';
 const R=KRMountedRig,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
 const timing=Object.freeze({lead:.15,lower:.44,hold:.16,rise:.45,rest:.30,action:1.05});
 const amountAt=t=>{const q=t-timing.lead;return q<0||q>timing.action?0:q<timing.lower?ease(q/timing.lower):q<=timing.lower+timing.hold?1:1-ease((q-timing.lower-timing.hold)/timing.rise);};
 function apply(p,state){
  const amount=clamp(state.duckAmount??amountAt(state.time));if(!amount)return p;
  const pitch=1.1*amount,c=Math.cos(pitch),s=Math.sin(pitch),
   rotate=v=>[v[0],v[1]*c-v[2]*s,v[1]*s+v[2]*c],
   upper=v=>R.add([0,p.seat,0],rotate(R.sub(v,[0,p.seat,0]))),
   local=v=>{const q=p.project(v);return [q[0]-p.origin[0],q[1]-p.origin[1]];},
   shoulder=local(upper([0,p.seat+8.9,0])),neck=local(upper([0,p.seat+14,0])),head=local(upper([0,p.seat+15.1,0]));
  p.actionBody={pitch,roll:0,lean:0,upper,rotate,hip:p.project([0,p.seat,0])};
  // Let the rein grip travel forward along the neck as the shoulders fold.
  // Otherwise the shoulder overtakes a fixed hand and the IK bend flips out.
  // The live reins follow these grips; both native bone lengths stay fixed.
  const poseArms=(a,transform)=>p.armChains.map(l=>({...R.ik(transform(l.root),R.add(l.end,[0,-.35*a,3.4*a]),5,5.1,[l.side*(.28-.22*a),-.8-.2*a,-.5+.15*a]),side:l.side}));
  p.armChains=poseArms(amount,upper);
  const yaw=p.angle*Math.PI/180;
  const gearOffset=[0,2*amount,-1.2*amount];
  // Move the back assembly as one rigid group. Sliding only the shield
  // changed its relative clearance from the bow, quiver and sheathed sword.
  p.duck={amount,horseAmount:amount,pitch,gearOffset,shieldOffset:gearOffset,headDepth:p.depth(upper([0,p.seat+15.1,0]))+3.5};
  const headWorld=([x,y,z])=>upper([x,p.seat-12-y,-z]),
   headProject=v=>{const q=local(headWorld(v)),neutralDepth=-v[2]*Math.cos(yaw)-v[0]*Math.sin(yaw);q[1]-=neutralDepth*.16*(1-amount);return q;},
   zero=headProject([0,0,0]),basis=[[1,0,0],[0,1,0],[0,0,1]].map(v=>{const q=headProject(v);return [q[0]-zero[0],q[1]-zero[1]];}),
   rowX=basis.map(v=>v[0]),rowY=basis.map(v=>v[1]),view=[rowX[1]*rowY[2]-rowX[2]*rowY[1],rowX[2]*rowY[0]-rowX[0]*rowY[2],rowX[0]*rowY[1]-rowX[1]*rowY[0]],
   rigid={project:headProject,depth:v=>p.depth(headWorld(v)),facing:n=>-n.reduce((a,x,i)=>a+x*view[i],0)};
  p.native={...p.native,body:{...p.native.body,shoulderY:shoulder[1],shoulderX:shoulder[0],neckX:neck[0],neckY:neck[1],duckDepth:p.depth(upper([0,p.seat+5,0]))+2.2},
   gaze:{x:head[0],y:head[1]+27.1,pitch:.85*amount*Math.abs(Math.cos(yaw)),roll:pitch*Math.sin(yaw),rigid},
   arms:p.armChains.map(l=>{const [sx,sy]=local(l.root),[ex,ey]=local(l.joint),[hx,hy]=local(l.end);return {sx,sy,ex,ey,hx,hy,walkDepth:{shoulder:p.depth(l.root),upper:p.depth(l.joint),hand:p.depth(l.end),weight:0},physical:l};})};
  return p;
 }
 window.KRMountedDuck={apply,amountAt,timing,duration:timing.lead+timing.action+timing.rest};
})();
