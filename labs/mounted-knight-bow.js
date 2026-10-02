/* Mounted authoring candidate: accepted bow surfaces, two fixed-length arms,
 * deterministic nock/string/release. No combat or input binding. */
(()=>{'use strict';
 const R=KRMountedRig,{add,sub,mul,unit}=R,dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{const t=clamp(v);return t*t*t*(10+t*(-15+6*t));},span=(t,a,b)=>ease((t-a)/(b-a));
 const timing=Object.freeze({grip:.72,arrowGrip:1.04,extract:1.60,nock:2.10,draw:2.75,release:3.25,follow:3.85,remount:5.08,end:5.8});let model;
 const aim=[-2.2,14.5,4.75],anchorHand=[-2.2,14.5,1.7],shootDirection=unit(sub(aim,anchorHand));
 function prepare(meshes){const world=q=>[-q[0],-12-q[1],-q[2]],wrap=meshes.bow.filter(f=>f.col==='#353938').flatMap(f=>f.v).map(world),anchor=mul(wrap.reduce(add,[0,0,0]),1/wrap.length),
   rough=unit([-.506,.862525,0]),strings=new Set(['#e4dec8','rgb(221,215,193)','rgb(212,206,184)','rgb(235,229,207)','rgb(218,212,190)']),raw=meshes.bow.filter(f=>strings.has(f.col)).flatMap(f=>f.v).map(world),
   heights=raw.map(p=>dot(sub(p,anchor),rough)),average=ps=>mul(ps.reduce(add,[0,0,0]),1/ps.length),ends=[Math.min(...heights),Math.max(...heights)].map(h=>average(raw.filter((p,i)=>Math.abs(heights[i]-h)<.2))),
   u=unit(sub(ends[1],ends[0])),toward=sub(mul(add(...ends),.5),anchor),v=unit(sub(toward,mul(u,dot(toward,u)))),n=unit(cross(u,v)),
   local=q=>{const d=sub(world(q),anchor);return [dot(d,u),dot(d,v),dot(d,n)];},faces=meshes.bow.filter(f=>!strings.has(f.col)).map(f=>({col:f.col,layer:f.layer||0,v:f.v.map(local)})),points=raw.map(p=>{const d=sub(p,anchor);return [dot(d,u),dot(d,v),dot(d,n)];}),
   lo=Math.min(...points.map(p=>p[0])),hi=Math.max(...points.map(p=>p[0])),mid=points.filter(p=>Math.abs(p[0])<.3),center=mul(mid.reduce(add,[0,0,0]),1/mid.length),tip=h=>{const ps=points.filter(p=>Math.abs(p[0]-h)<.2);return mul(ps.reduce(add,[0,0,0]),1/ps.length);};
  if(!mid.length)throw Error('Yay kiriş merkezi bulunamadı.');
  // The top, short arrow in the accepted waist quiver is reachable without
  // changing either bone length. Keep its exact feather/nock/shaft surfaces.
  const arrowVertex=t=>{const spread=Math.max(0,t-1)/.4,v=-.54*(1+spread*.24),z=.17+spread*.22,r=1.2+.3*Math.min(t,1);return world([-3.9+9.2*t+v*r*.075,-11.15-.72*t+v*r,2.9+z*r*1.25]);},
   arrowNock=arrowVertex(1.327),arrowMouth=arrowVertex(1.018),arrowDirection=unit(sub(arrowMouth,arrowNock)),
   arrowFaces=meshes.quiver.filter(f=>f.arrowId===0).map(f=>({col:f.col,v:f.v.map(q=>sub(world(q),arrowNock))})),quiver=meshes.quiver.filter(f=>f.arrowId!==0);
  if(!arrowFaces.length)throw Error('Sadaktaki ilk okun yüzeyleri bulunamadı.');
  // Complete only the buried shaft. At rest it is depth-hidden by the same
  // leather pouch; its full rigid length emerges as the hand withdraws it.
  const shaftStart=sub(arrowMouth,arrowNock),shaftEnd=mul(arrowDirection,10.9),nose=mul(arrowDirection,11.7),across=unit(cross(arrowDirection,[0,1,0]));
  rod(arrowFaces,shaftStart,shaftEnd,.19,'#e6c582');
  for(const s of [-1,1])arrowFaces.push({col:s===1?'#edf4ef':'#adc9d8',v:[nose,add(shaftEnd,mul(across,s*.36)),add(shaftEnd,[0,.19,0])]});
  model={anchor,u,v,n,faces,center,tips:[tip(lo),tip(hi)],arrowNock,arrowMouth,arrowDirection,arrowFaces,quiver};
 }
 function frame(t,direction=shootDirection){const u=unit(mix(model.u,[0,1,0],t)),raw=mix(model.v,mul(direction,-1),t),v=unit(sub(raw,mul(u,dot(raw,u))));return {u,v,n:unit(cross(u,v))};}
 function turn(v,from,to){const axis=cross(from,to),c=Math.max(-1,Math.min(1,dot(from,to)));return add(add(mul(v,c),cross(axis,v)),mul(axis,dot(axis,v)/(1+c)));}
 const point=(f,q)=>add(mul(f.u,q[0]),add(mul(f.v,q[1]),mul(f.n,q[2])));
 function apply(p,state){if(state.action!=='bow'||state.visible?.knight===false||state.visible?.bow===false)return p;
  const t=Math.max(0,Math.min(timing.end,state.actionTime??state.time));if(t===0||t===timing.end)return p;
  const yaw=(state.bowAim||0)*Math.PI/180,shotDirection=[Math.sin(yaw),0,Math.cos(yaw)],
   reach=span(t,0,timing.grip),settle=span(t,timing.remount,timing.end),weight=reach*(1-settle),deploy=span(t,timing.grip,timing.nock)*(1-span(t,timing.follow,timing.remount)),f=frame(span(deploy,.03,.30),shotDirection),base=add(model.anchor,[0,p.seat,0]),left=p.armChains.find(a=>a.side===1),right=p.armChains.find(a=>a.side===-1),aimPoint=add(add(anchorHand,mul(shotDirection,aim[2]-anchorHand[2])),[0,p.seat,0]),
   // Withdraw behind the rack, carry OUTSIDE the shoulder, then cross only
   // in front of the helmet. Rotation finishes while still in that free lane.
   travel=a=>add(add(mul(base,(1-a)**3),mul([12,p.seat+5.9,-11],3*a*(1-a)**2)),add(mul([9.5,p.seat+13,8],3*a*a*(1-a)),mul(aimPoint,a**3))),
   held=t>=timing.grip&&t<=timing.remount,empty=a=>add(mix(left.end,base,a),[3.8*Math.sin(Math.PI*a),0,0]),target=held?travel(deploy):empty(weight),
   l={...R.ik(left.root,target,5,5.1,mix([.28,-.8,-.5],[1,-.3,0],weight)),side:1},grip=held?l.end:base,
   stringRest=add(grip,point(f,model.center)),draw=span(t,timing.nock,timing.draw),drawn=add(anchorHand,[0,p.seat,0]),quiver=add(model.arrowNock,[0,p.seat,0]),mouth=add(model.arrowMouth,[0,p.seat,0]),raised=[-10.5,p.seat+12.2,-2.2],liftDirection=unit(sub(mouth,raised));
  let hand=right.end,arrowNock=quiver,arrowDirection=model.arrowDirection;
  if(t>.55&&t<timing.arrowGrip)hand=add(mix(right.end,quiver,span(t,.55,timing.arrowGrip)),[-1.5*Math.sin(Math.PI*span(t,.55,timing.arrowGrip)),0,0]);
  else if(t>=timing.arrowGrip&&t<timing.extract){const a=span(t,timing.arrowGrip,timing.extract);
   // A low outward pull rises beside the shoulder, not a vertical arrow
   // appearing above the head. Nock stays in this hand for the entire action.
   hand=add(mix(quiver,raised,a),[-1.3*Math.sin(Math.PI*a),-1.2*Math.sin(Math.PI*a),0]);arrowNock=hand;
   arrowDirection=unit(sub(mouth,hand));
  }else if(t>=timing.extract&&t<timing.nock){const a=span(t,timing.extract,timing.nock);
   hand=add(mix(raised,stringRest,a),[-1.5*Math.sin(Math.PI*a),1.1*Math.sin(Math.PI*a),3.2*Math.sin(Math.PI*a)]);arrowNock=hand;
   // Sweep the point outside the rider before bringing it forward. A direct
   // interpolation swings the tip through the torso and the horse's neck.
   arrowDirection=unit(add(add(mul(liftDirection,(1-a)**2),mul([-1,.4,.5],2*a*(1-a))),mul(unit(sub(grip,stringRest)),a*a)));
  }else if(t>=timing.nock&&t<3.25){hand=mix(stringRest,drawn,draw);arrowNock=hand;arrowDirection=unit(sub(grip,hand));}
  else if(t>=3.25&&t<3.85)hand=add(drawn,[-.25*span(t,3.25,3.43),.1*span(t,3.25,3.43),-1.2*span(t,3.25,3.43)]);
  else if(t>=3.85)hand=mix(add(drawn,[-.25,.1,-1.2]),right.end,span(t,3.85,4.5));
  const r={...R.ik(right.root,hand,5,5.1,mix([-.28,-.8,-.5],[-1,.15,-.65],span(t,.55,timing.arrowGrip)*(1-span(t,3.85,4.5)))),side:-1};
  const reinArms=p.armChains;p.actionBody={pitch:0,roll:0,lean:0,upper:v=>v,rotate:v=>v,hip:p.project([0,p.seat,0]),restArms:p.native.arms};p.armChains=[r,l];
  const local=v=>sub(p.project(v),p.origin);
  p.native={...p.native,depthShoulders:true,arms:p.armChains.map(a=>{const [sx,sy]=local(a.root),[ex,ey]=local(a.joint),[hx,hy]=local(a.end);return {sx,sy,ex,ey,hx,hy,walkDepth:{shoulder:p.depth(a.root),upper:p.depth(a.joint),hand:p.depth(a.end),weight:0},physical:a};})};
  const released=t>=3.25,string=t>=timing.nock&&!released?r.end:released?add(stringRest,mul(f.v,Math.sin((t-3.25)*85)*.22*Math.exp(-(t-3.25)*12))):stringRest;
  if(t>=timing.arrowGrip&&!released)arrowNock=r.end;
  if(released){arrowNock=add(drawn,mul(shotDirection,(t-3.25)*90));arrowDirection=shotDirection;}
  const buriedLimit=t<timing.extract?Math.hypot(...sub(mouth,arrowNock)):Infinity;
  p.bow={t,weight,held,renderBow:true,grip,frame:f,string,stringRest,draw,released,externalProjectiles:!!state.externalProjectiles,hand:r.end,arrowNock,arrowDirection,buriedLimit,reinArms,reachError:Math.max(Math.hypot(...sub(target,l.end)),Math.hypot(...sub(hand,r.end))),model};
  return p;
 }
 function rod(out,a,b,width,col){const d=unit(sub(b,a)),u=mul(unit(cross(d,Math.abs(d[1])>.9?[1,0,0]:[0,1,0])),width/2),v=mul(unit(cross(d,u)),width/2),ring=c=>[add(add(c,u),v),add(sub(c,u),v),sub(sub(c,u),v),add(sub(c,v),u)],x=ring(a),y=ring(b);out.push({col,v:x},{col,v:y});for(let i=0;i<4;i++)out.push({col,v:[x[i],x[(i+1)%4],y[(i+1)%4],y[i]]});}
 function faces(p){const q=p.bow;if(!q?.renderBow)return [];const at=v=>add(q.grip,point(q.frame,v)),out=model.faces.map(f=>({...f,v:f.v.map(at)}));
  for(const tip of model.tips)rod(out,at(tip),q.string,.16,'#e4dec8');
  if(q.t<3.7&&!(q.released&&q.externalProjectiles))for(const f of model.arrowFaces){let vertices=f.v;
   // Pouch-mouth occlusion, not a growing arrow. The complete fixed-length
   // mesh exists from frame zero; only its still-buried portion is hidden.
   if(Number.isFinite(q.buriedLimit)){const clipped=[];let a=vertices.at(-1),da=q.buriedLimit-dot(a,model.arrowDirection);for(const b of vertices){const db=q.buriedLimit-dot(b,model.arrowDirection);if((da>=0)!==(db>=0))clipped.push(mix(a,b,da/(da-db)));if(db>=0)clipped.push(b);a=b;da=db;}vertices=clipped;}
   if(vertices.length>2)out.push({...f,v:vertices.map(v=>add(q.arrowNock,turn(v,model.arrowDirection,q.arrowDirection)))});
  }
  return out;
 }
 window.KRMountedBow={prepare,apply,faces,timing};
})();
