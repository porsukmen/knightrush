/* Lightweight, camera-independent 3D proximity volumes on the native pose.
 * World units are pixels at the player plane: X right, Y down, Z away.
 * Conservative capsules, not mesh intersection. Pure samples/tests; the native
 * sequence driver alone owns damage and contact lifetime. */
(()=>{'use strict';
 const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(v,s)=>v.map(x=>x*s),dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0),clamp=x=>Math.max(0,Math.min(1,x));
 function sample(frame){
  const p=frame.pose,u=frame.placement.unit,a=p.angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a),bank=frame.bank?.angle||0,bc=Math.cos(bank),bs=Math.sin(bank),
   world=v=>{const x=(v[0]*c+v[2]*s)*u,y=-v[1]*u;return[frame.placement.x-240+x*bc-y*bs,frame.placement.y-PLAYER_Y-(frame.bank?.lift||0)+x*bs+y*bc,-(v[2]*c-v[0]*s)*u];},
   upper=p.actionBody?.upper||(v=>v),volumes=[],
   capsule=(id,a,b,r)=>volumes.push({id,a:world(a),b:world(b),r:(r+.3)*u}),ball=(id,v,r)=>capsule(id,v,v,r),
   torso=y=>upper([0,p.seat+y,0]);
  ball('helmet',torso(14.7),4.4);
  capsule('torso',torso(2),torso(8.5),4.7);ball('pelvis',[0,p.seat,0],3.6);
  for(const [i,l] of p.armChains.entries()){capsule('arm-'+i+'-upper',l.root,l.joint,2.05);capsule('arm-'+i+'-fore',l.joint,l.end,1.65);}
  for(const [i,l] of p.riderLegs.entries()){capsule('rider-leg-'+i+'-upper',l.root,l.joint,2);capsule('rider-leg-'+i+'-lower',l.joint,l.end,1.65);}
  const hs=p.horseScale,body=v=>mul(p.bodyPoint(v),hs),horse=(v,bend=false)=>{
   let q=body(v);const amount=p.duck?.horseAmount??p.duck?.amount??0;
   if(bend&&amount){const pivot=body([0,26.4+p.bob/hs,8]),y=q[1]-pivot[1],z=q[2]-pivot[2],forward=(-y*Math.sin(p.bodyPitch)+z*Math.cos(p.bodyPitch))/hs+8,t=clamp((forward-4.5)/10.5),a=.22*amount*t*t*(3-2*t);q=[q[0],pivot[1]+y*Math.cos(a)-z*Math.sin(a),pivot[2]+y*Math.sin(a)+z*Math.cos(a)];}return q;
  };
  capsule('horse-body',horse([0,19+p.bob/hs,-9]),horse([0,19+p.bob/hs,8]),6.7*hs);
  capsule('horse-neck',horse([0,26+p.bob/hs,10],true),horse([0,31+p.bob/hs,16],true),3.8*hs);
  ball('horse-head',horse([0,32+p.bob/hs,21],true),3.7*hs);
  for(const [i,l] of p.legs.entries()){capsule('horse-leg-'+i+'-upper',l.root,l.hock||l.joint,1.65*hs);capsule('horse-leg-'+i+'-lower',l.hock||l.joint,l.end,1.35*hs);}
  return volumes;
 }
 function guardianPoint(frame,v){const a=frame.heading*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return[(frame.actorRoot.x-1)*150-(v[0]*c+v[2]*s)*5,v[1]*5,(frame.actorRoot.z/.065-v[0]*s+v[2]*c)*5];}
 function blade(frame,transform=frame.pose.weapon,clipGround=false){
  const result=[];
  for(const [a,b,r] of [[-43,-6,3.12],[-6,-2.5,2],[-2.5,0,.9]]){
   const v={id:'blade-'+a,a:guardianPoint(frame,transform.p([0,a,-13.5])),b:guardianPoint(frame,transform.p([0,b,-13.5])),r:r*5};
   if(clipGround){
    if(v.a[1]>0&&v.b[1]>0)continue;
    if(v.a[1]>0||v.b[1]>0){const t=-v.a[1]/(v.b[1]-v.a[1]),p=v.a.map((x,i)=>x+(v.b[i]-x)*t);if(v.a[1]>0)v.a=p;else v.b=p;}
   }result.push(v);
  }return result;
 }
 // Closest points of two finite 3D segments, including zero-length spheres.
 function closest(a,b,c,d){
  const u=sub(b,a),v=sub(d,c),w=sub(a,c),aa=dot(u,u),bb=dot(u,v),cc=dot(v,v),dd=dot(u,w),ee=dot(v,w),eps=1e-10;let s=0,t=0;
  if(aa<=eps)t=cc>eps?clamp(ee/cc):0;
  else if(cc<=eps)s=clamp(-dd/aa);
  else{const det=aa*cc-bb*bb;s=det>eps?clamp((bb*ee-cc*dd)/det):0;t=(bb*s+ee)/cc;if(t<0){t=0;s=clamp(-dd/aa);}else if(t>1){t=1;s=clamp((bb-dd)/aa);}}
  const p=add(a,mul(u,s)),q=add(c,mul(v,t));return{a:p,b:q,distance:Math.hypot(...sub(p,q))};
 }
 function test(blade,volumes){let gap=Infinity,part=null,point=null,checks=0;
  for(const steel of blade)for(const volume of volumes){checks++;const q=closest(steel.a,steel.b,volume.a,volume.b),d=q.distance-steel.r-volume.r;if(d<gap){gap=d;part=volume.id;point=q.b;}}
  return{touching:gap<=0,gap,part,point,checks};
 }
 // Continuous relative motion, including rotation/deformation of both segment
 // endpoints. A Lipschitz distance bound rejects empty intervals; subdividing
 // to 0.02 world pixels prevents tunneling without a frame-rate-sized padding.
 function sweptTest(oldSteel,steel,oldVolumes,volumes,pad=0){
  // Scalar scratch avoids thousands of short-lived vectors in a defense frame.
  // This is the same closest-segment calculation and interval bound as closest.
  const speed=(a,b)=>Math.max(Math.hypot(a.a[0]-b.a[0],a.a[1]-b.a[1],a.a[2]-b.a[2]),Math.hypot(a.b[0]-b.b[0],a.b[1]-b.b[1],a.b[2]-b.b[2]))+Math.abs(a.r-b.r);
  function gapAt(a,b,c,d,t){
   const ax=a.a[0]+(b.a[0]-a.a[0])*t,ay=a.a[1]+(b.a[1]-a.a[1])*t,az=a.a[2]+(b.a[2]-a.a[2])*t,
    cx=c.a[0]+(d.a[0]-c.a[0])*t,cy=c.a[1]+(d.a[1]-c.a[1])*t,cz=c.a[2]+(d.a[2]-c.a[2])*t,
    ux=a.b[0]+(b.b[0]-a.b[0])*t-ax,uy=a.b[1]+(b.b[1]-a.b[1])*t-ay,uz=a.b[2]+(b.b[2]-a.b[2])*t-az,
    vx=c.b[0]+(d.b[0]-c.b[0])*t-cx,vy=c.b[1]+(d.b[1]-c.b[1])*t-cy,vz=c.b[2]+(d.b[2]-c.b[2])*t-cz,
    wx=ax-cx,wy=ay-cy,wz=az-cz,aa=ux*ux+uy*uy+uz*uz,bb=ux*vx+uy*vy+uz*vz,cc=vx*vx+vy*vy+vz*vz,
    dd=ux*wx+uy*wy+uz*wz,ee=vx*wx+vy*wy+vz*wz,eps=1e-10;let s=0,v=0;
   if(aa<=eps)v=cc>eps?clamp(ee/cc):0;
   else if(cc<=eps)s=clamp(-dd/aa);
   else{const det=aa*cc-bb*bb;s=det>eps?clamp((bb*ee-cc*dd)/det):0;v=(bb*s+ee)/cc;if(v<0){v=0;s=clamp(-dd/aa);}else if(v>1){v=1;s=clamp((bb-dd)/aa);}}
   return Math.hypot(ax+ux*s-(cx+vx*v),ay+uy*s-(cy+vy*v),az+uz*s-(cz+vz*v))-(a.r+(b.r-a.r)*t)-(c.r+(d.r-c.r)*t)-pad;
  }
  function separated(a,b,c,d){
   const radius=Math.max(a.r,b.r)+Math.max(c.r,d.r)+pad+.02;
   // Every interpolated segment lies inside the endpoint sweep's AABB.
   // Disjoint expanded bounds therefore cannot hide a hit, including rapid
   // crossings, changing radii, duck transitions or zero-length capsules.
   // Include the narrow phase's existing .02-pixel conservative tolerance.
   for(let k=0;k<3;k++){
    const alo=Math.min(a.a[k],a.b[k],b.a[k],b.b[k]),ahi=Math.max(a.a[k],a.b[k],b.a[k],b.b[k]),
     clo=Math.min(c.a[k],c.b[k],d.a[k],d.b[k]),chi=Math.max(c.a[k],c.b[k],d.a[k],d.b[k]);
    if(alo-chi>radius||clo-ahi>radius)return true;
   }return false;
  }
  for(let i=0;i<steel.length;i++)for(let j=0;j<volumes.length;j++){
   const b=steel[i],a=(b.id?oldSteel.find(v=>v.id===b.id):oldSteel[i])||b,c=oldVolumes[j]||volumes[j],d=volumes[j];
   if(separated(a,b,c,d))continue;
   const motion=speed(a,b)+speed(c,d),
    visit=(lo,hi)=>{const mid=(lo+hi)*.5,g=gapAt(a,b,c,d,mid),bound=motion*(hi-lo)*.5;
     if(g<=0)return true;if(g>bound)return false;if(bound<.02)return true;
     return visit(lo,mid)||visit(mid,hi);
    };
   if(visit(0,1))return true;
  }return false;
 }
 function project(v){const z=v[2]*.065/5,p=proj(z);return[laneX(1+v[0]/150,p.t),p.y+v[1]*p.s];}
 // Wire guides only; none of this drawing is part of the collision test.
 function draw(volumes,projectPoint,color,dashed=false,hit=null){g.strokeStyle=color;g.lineWidth=1;g.setLineDash(dashed?[4,4]:[]);
  for(const v of volumes){g.strokeStyle=v.id===hit?'#ef8a70':color;
   for(const center of v.a.every((n,i)=>n===v.b[i])?[v.a]:[v.a,v.b])for(const plane of [[0,1],[0,2]]){g.beginPath();for(let i=0;i<=12;i++){const a=i*Math.PI/6,q=center.slice();q[plane[0]]+=Math.cos(a)*v.r;q[plane[1]]+=Math.sin(a)*v.r;const p=projectPoint(q);i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]);}g.stroke();}
   const a=projectPoint(v.a),b=projectPoint(v.b);g.beginPath();g.moveTo(...a);g.lineTo(...b);g.stroke();
  }g.setLineDash([]);
 }
 window.KRMountedCollision=Object.freeze({sample,blade,test,sweptTest,closest,guardianPoint,project,draw});
})();
