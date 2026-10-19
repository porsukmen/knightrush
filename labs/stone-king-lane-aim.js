/* Keep the original statue staging while its real arm/blade reaches the wider
 * three-lane targets. Rendering, contact and planted release share these poses. */
(function(root){'use strict';
 const V=(x=0,y=0,z=0)=>({x,y,z}),add=(a,b)=>V(a.x+b.x,a.y+b.y,a.z+b.z),
  sub=(a,b)=>V(a.x-b.x,a.y-b.y,a.z-b.z),mul=(a,k)=>V(a.x*k,a.y*k,a.z*k),
  dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z,
  cross=(a,b)=>V(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x),
  length=a=>Math.hypot(a.x,a.y,a.z),unit=a=>mul(a,1/(length(a)||1)),
  clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(x)?x:a)),
  smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
 const shoulder=V(32,-92,0),upperLength=31,foreLength=36,reach=upperLength+foreLength;
 function create({art,stage}){
  if(!art?.pose||!stage?.laneX)throw new TypeError('Stone King lane aim needs the shared art and stage');
  const u=stage.unit||20/172.2,
   bodyLaneX=lane=>stage.bodyLaneX?stage.bodyLaneX(clamp(lane,0,2)):(clamp(lane,0,2)-1)*4.2,
   bodyWorldX=lane=>stage.actorX+bodyLaneX(lane),
   aimOffset=lane=>stage.laneAimOffset?stage.laneAimOffset(clamp(lane,0,2)):stage.laneX(clamp(lane,0,2))-bodyLaneX(lane);
  const yaw=(v,a)=>{const c=Math.cos(a),s=Math.sin(a);return V(v.x*c+v.z*s,v.y,-v.x*s+v.z*c);};
  function elbowFor(wrist){
   const delta=sub(wrist,shoulder),d=length(delta);
   if(d>reach+1e-8||d<foreLength-upperLength-1e-8)throw new RangeError('Lane aim exceeds the fixed arm reach');
   const axis=unit(delta),along=(upperLength*upperLength-foreLength*foreLength+d*d)/(2*Math.max(d,.001));
   let pole=sub(V(1,0,0),mul(axis,axis.x));
   if(length(pole)<1e-8)pole=sub(V(0,0,-1),mul(axis,-axis.z));
   return add(add(shoulder,mul(axis,along)),mul(unit(pole),Math.sqrt(Math.max(0,upperLength*upperLength-along*along))));
  }
  function plantEndY(offset){
   const z=art.plantSpec.plantedWristZ,lateral=offset/u,remaining=reach*reach-z*z-lateral*lateral;
   if(remaining<0)throw new RangeError('Planted lane is outside the fixed arm reach');
   return shoulder.y+Math.sqrt(remaining);
  }
  function policy(p){
   const q=Number.isFinite(p.q)?clamp(p.q):0,state=p.state;
   if(state==='tele_stone_king')return {kind:'yaw',weight:q};
   if(state==='strike_stone_king')return {kind:'yaw',weight:1};
   if(state==='recover_stone_king'||state==='bridge_stone_king_swipe')return {kind:'yaw',weight:1-q};
   if(state==='bridge_stone_king_plant')return {kind:'plant',weight:q,vertical:0};
   if(state==='tele_stone_king_plant')return {kind:'plant',weight:1,vertical:0};
   if(state==='strike_stone_king_plant')return {kind:'plant',weight:1,vertical:q};
   if(['hold_stone_king_plant','tele_stone_king_eruption','strike_stone_king_eruption'].includes(state))
    return {kind:'plant',weight:1,vertical:1};
   if(state==='recover_stone_king_plant')return {kind:'plant',weight:1-q,vertical:1-clamp(q/.65)};
   return null;
  }
  function aimPose(p,options={}){
   const lane=clamp(options.lane??1,0,2),offset=aimOffset(lane),apply=policy(p);
   if(!apply||apply.weight===0||Math.abs(offset)<1e-12)return p;
   let wrist,elbow,axis=p.axis,side=p.side;
   if(apply.kind==='yaw'){
    const depth=Number.isFinite(options.depth)?options.depth:stage.nearZ,
     angle=Math.atan2(offset,Math.max(.001,depth))*apply.weight;
    wrist=add(shoulder,yaw(sub(p.wrist,shoulder),angle));
    elbow=add(shoulder,yaw(sub(p.elbow,shoulder),angle));
    axis=yaw(p.axis,angle);side=yaw(p.side,angle);
   }else{
    // Raise the reachable planted endpoint before interpolating the stroke.
    // A late reach clamp would make the descending hand reverse direction.
    const correction=plantEndY(offset)-art.plantSpec.plantedWristY;
    wrist=V(p.wrist.x+offset/u*apply.weight,p.wrist.y+correction*(apply.vertical||0),p.wrist.z);
    elbow=elbowFor(wrist);
   }
   return {...p,wrist,elbow,axis,side,projectionX:wrist.x,
    grip:art.project?art.project(wrist,wrist.x,p.projectionDepth??1):p.grip};
  }
  const pose=(state,raw=0,options={})=>aimPose(art.pose(state,raw),options);
  function worldFrame(p,options={}){
   const lane=clamp(options.lane??1,0,2),depth=Number.isFinite(options.depth)?options.depth:stage.nearZ,
    axis=V(p.axis.x,-p.axis.y,-p.axis.z),side=V(p.side.x,-p.side.y,-p.side.z);
   return {wrist:V(bodyWorldX(lane)+p.wrist.x*u,(23.2-(p.crouch||0)-p.wrist.y)*u,depth-p.wrist.z*u),
    axis,side,normal:unit(cross(side,axis)),unit:u};
  }
  function plantedFrame(options={}){
   const opts={...options,depth:options.depth??art.plantSpec.actorZ};
   return worldFrame(pose('strike_stone_king_plant',1,opts),opts);
  }
  return Object.freeze({version:1,pose,aimPose,worldFrame,plantedFrame,bodyLaneX,bodyWorldX,aimOffset,plantEndY});
 }
 const api=Object.freeze({version:1,create});root.KRStoneKingLaneAim=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
