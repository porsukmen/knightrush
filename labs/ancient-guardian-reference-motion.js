/* Reference-guided animation on the existing fixed-length stone rig.
 * Keep the footwork and major body poses, not the performer's incidental sway.
 */
(()=>{'use strict';
const data=window.KRGuardianReferenceTrack;if(!data)return;
const M=window.KRAncientGuardianStance,add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,k)=>a.map(v=>v*k),dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],len=a=>Math.hypot(...a),unit=a=>mul(a,1/(len(a)||1)),mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
const S=[-18.9,-70,0],E=[-19,-55.7,-1.5],W=[-2.8,-63.5,-13.5],G=[0,-55.8,-13.5],HP=[0,-43,0],L1=len(sub(E,S)),L2=len(sub(W,E));
function rotate(a,b){a=unit(a);b=unit(b);const v=cross(a,b),c=dot(a,b);if(c>.99999999)return p=>p.slice();if(c<-.999999)return p=>[-p[0],-p[1],p[2]];return p=>add(add(p,cross(v,p)),mul(cross(v,cross(v,p)),1/(1+c)));}
const bone=(a,b,A,B)=>{const n=rotate(sub(b,a),sub(B,A));return {p:p=>add(A,n(sub(p,a))),n};};
function ik(a,b,x,y,pole){const d=sub(b,a),distance=Math.min(x+y,Math.max(Math.abs(x-y)+.0001,len(d))),axis=unit(d),along=(x*x-y*y+distance*distance)/(2*distance),h=Math.sqrt(Math.max(0,x*x-along*along)),v=unit(sub(pole,mul(axis,dot(pole,axis))));return add(add(a,mul(axis,along)),mul(v,h));}
function axes(x,y){x=unit(x);y=unit(sub(y,mul(x,dot(x,y))));return [x,y,unit(cross(x,y))];}
const turn=(v,b)=>add(add(mul(b[0],v[0]),mul(b[1],v[1])),mul(b[2],v[2]));
// Deliberate pose guides, averaged locally, replace frame-by-frame tracking.
// Monotone cubic channels keep continuous velocity without noisy overshoot.
const guideTimes=[0,1.6,1.9,2.35,2.7,3.2,3.65,3.93,4.2,4.43,4.67,4.9,5.25,6.8];
const guides=guideTimes.map(t=>{const n=Math.round(Math.min(t,4.9)*data.fps),average=key=>data.frames[n][key].map((v,j)=>v.map((_,k)=>{let total=0,weight=0;for(let d=-4;d<=4;d++){const w=5-Math.abs(d);total+=data.frames[Math.max(0,Math.min(data.frames.length-1,n+d))][key][j][k]*w;weight+=w;}return total/weight;}));return {t,p:average('p'),s:average('s')};});
function cleanFrame(t){let i=0;while(i<guides.length-2&&guides[i+1].t<t)i++;const a=guides[i],b=guides[i+1],prev=guides[Math.max(0,i-1)],next=guides[Math.min(guides.length-1,i+2)],dt=b.t-a.t,u=clamp((t-a.t)/dt),slope=(x,y)=>x*y<=0?0:2*x*y/(x+y),channel=key=>a[key].map((v,j)=>v.map((x,k)=>{const y=b[key][j][k],d=(y-x)/dt,m0=i?slope((x-prev[key][j][k])/(a.t-prev.t),d):0,m1=i<guides.length-2?slope(d,(next[key][j][k]-y)/(next.t-b.t)):0;return (2*u**3-3*u*u+1)*x+(u**3-2*u*u+u)*dt*m0+(-2*u**3+3*u*u)*y+(u**3-u*u)*dt*m1;}));return {t,p:channel('p'),s:channel('s')};}
function observedForearm(f){
 // A short image-space forearm is foreshortening, not a shortened bone. The
 // raw depth estimator collapsed that bone at 2.5–3.1 s and pointed it down.
 const p=f.p,s=f.s,hips=mix(p[23],p[24],.5),shoulders=mix(p[11],p[12],.5),ih=mix(s[23],s[24],.5),is=mix(s[11],s[12],.5),scale=len(sub(hips,shoulders))/Math.hypot((ih[0]-is[0])*.5625,ih[1]-is[1]);
 let x=-(s[15][0]-s[13][0])*.5625*scale/.255,y=(s[15][1]-s[13][1])*scale/.255;
 const r=Math.hypot(x,y);if(r>.995){x*=.995/r;y*=.995/r;}
 const k=.09,disc=Math.max(0,(k*y)**2-(1+k*k)*(x*x+y*y-1)),sign=p[15][2]-p[13][2]<-.025?-1:1,z=(-k*y+sign*Math.sqrt(disc))/(1+k*k);
 return unit([x,y+k*z,z]);
}
// Contacts read from the actual film. Intermediate right-foot support and the
// final forward right landing are retained; this is not the previous variant.
// The rear foot in the finishing lunge is on the carpet, not airborne. Its
// screen height is perspective/occlusion; never turn that into a lifted sole.
const planted=(t,i)=>i?(t<3.93||t>=4.67):(t<1.90||t>=2.70);
// Front camera looks along +Z: negative Z is closer to the viewer. This is a
// staggered front/back stance, not two soles beside each other at equal depth.
const leftPlantOffset=[9,0,-24];
const preparationWeight=t=>ease((t-2.25)/.65)*(1-ease((t-3.65)/.78));
const bodyLead=t=>.85*preparationWeight(t);
const yawVector=(p,a)=>[p[0]*Math.cos(a)+p[2]*Math.sin(a),p[1],-p[0]*Math.sin(a)+p[2]*Math.cos(a)];
const samples=[];let root=[0,0,0],anchors=[null,null];
for(const raw of data.frames){const f=cleanFrame(raw.t),p=f.p,hips=mix(p[23],p[24],.5),shoulders=mix(p[11],p[12],.5),shoulderAxis=sub(p[12],p[11]),lead=bodyLead(f.t);shoulderAxis[1]*=.2;const b=axes(yawVector(shoulderAxis,lead),yawVector(sub(hips,shoulders),lead)),h=[turn([-6.5,0,0],b),turn([6.5,0,0],b)],knees=[],ankles=[];
 for(let i=0;i<2;i++){const k=add(h[i],mul(unit(sub(p[25+i],p[23+i])),17)),a=add(k,mul(unit(sub(p[27+i],p[25+i])),24));knees.push(k);ankles.push(a);}
 if(!samples.length){root=[0,-2-Math.max(...ankles.map(v=>v[1])),0];}
 const contacts=[planted(f.t,0),planted(f.t,1)];
 for(let i=0;i<2;i++){if(contacts[i]&&!anchors[i]){anchors[i]=add(root,ankles[i]);anchors[i][1]=-2;
 // The crossing step has a real footprint beside the supporting right foot.
 // Do not infer its ground depth from the carpet's screen-space height.
 if(i===0&&f.t>=2.70&&anchors[1])anchors[i]=add(anchors[1],leftPlantOffset);
 }if(!contacts[i])anchors[i]=null;}
 const targets=anchors.flatMap((a,i)=>a?[sub(a,ankles[i])]:[]);
 if(targets.length)root=mul(targets.reduce(add,[0,0,0]),1/targets.length);
 // Keep airborne feet above the floor, without altering the measured bend pole.
 const feet=ankles.map((a,i)=>anchors[i]?.slice()||add(root,a));
 if(f.t>=1.90&&f.t<2.70&&anchors[1]){
 const q=clamp((f.t-1.90)/.80),target=add(anchors[1],leftPlantOffset),w=ease(q);
 feet[0]=mix(feet[0],target,w);
 feet[0][1]=-2-5*Math.sin(Math.PI*q);
 }
 // The right foot stays down through the preparation, then clears the floor
 // on the slice. Blend lift/landing rather than accepting depth-estimator pops.
 if(f.t>=3.93&&f.t<4.67){const q=clamp((f.t-3.93)/.74);feet[1][1]=-2-7*Math.sin(Math.PI*q);}
 for(let i=0;i<2;i++)feet[i][1]=Math.min(-2,feet[i][1]);
 for(let pass=0;pass<8;pass++)for(let i=0;i<2;i++){const d=sub(feet[i],add(root,h[i])),r=len(d);if(r>40.98)root=add(root,mul(d,1-40.98/r));}
 samples.push({t:f.t,b,root:root.slice(),feet,poles:knees.map((k,i)=>yawVector(sub(k,h[i]),lead)),footDirs:[0,1].map(i=>yawVector(unit(sub(p[31+i],p[29+i])),lead)),upper:yawVector(unit(sub(p[13],p[11])),lead),fore:yawVector(observedForearm(f),lead),headX:yawVector(unit(sub(p[8],p[7])),lead),contacts});
}
// Author the released foot's arc from its actual support point. Raw tracking
// at release must not teleport it to an unrelated estimated ankle position.
const rightStart=samples[Math.floor(3.90*data.fps)].feet[1],rightEnd=samples[Math.ceil(4.67*data.fps)].feet[1];
for(const s of samples)if(s.t>=3.90&&s.t<=4.70){const u=clamp((s.t-3.93)/.74);s.feet[1]=mix(rightStart,rightEnd,ease(u));s.feet[1][1]=-2-7*Math.sin(Math.PI*u);}
const roots=samples.map(s=>s.root.slice());
for(let j=0;j<samples.length;j++){const s=samples[j];let r=[0,0,0],w=0;for(let k=-3;k<=3;k++){const weight=4-Math.abs(k);r=add(r,mul(roots[Math.max(0,Math.min(samples.length-1,j+k))],weight));w+=weight;}s.root=add(mul(r,1/w),mul([5,2,0],preparationWeight(s.t)));
 for(let pass=0;pass<10;pass++)for(let i=0;i<2;i++){const h=turn([i?6.5:-6.5,0,0],s.b),d=sub(s.feet[i],add(s.root,h)),distance=len(d);if(distance>40.98)s.root=add(s.root,mul(d,1-40.98/distance));}
}
const entry=M.sampleVersion(6.1,10),start=1.6,startSample=samples[Math.round(start*data.fps)],offset=sub(entry.legs[1].ankle,startSample.feet[1]);offset[1]=0;
const capePoints=[...new Map(KRAncientGuardian.parts['stone-cape'].flatMap(f=>f.v).map(v=>[v.join(','),v])).values()];
function tracked(time){const video=Math.min(5.25,Math.max(start,time-6.1+start)),index=video*data.fps,j=Math.floor(index),u=index-j,a=samples[j],z=samples[Math.min(j+1,samples.length-1)],blend=k=>mix(a[k],z[k],u),b=axes(mix(a.b[0],z.b[0],u),mix(a.b[1],z.b[1],u)),center=add(blend('root'),offset),body={p:p=>add(center,turn(sub(p,HP),b)),n:p=>turn(p,b)},headX=blend('headX'),headB=axes([headX[0],0,headX[2]],[0,1,0]),neck=body.p([0,-79,0]),head={p:p=>add(neck,turn(sub(p,[0,-79,0]),headB)),n:p=>turn(p,headB)};
 const shoulder=body.p(S),elbow=add(shoulder,mul(unit(blend('upper')),L1)),wrist=add(elbow,mul(unit(blend('fore')),L2));
 const dir=unit([blend('fore')[0],0,blend('fore')[2]]),blade=axes(cross(dir,[0,-1,0]),dir),weaponN=p=>turn(p,blade),grip=sub(wrist,weaponN([-2.8,0,0])),weapon={p:p=>add(grip,weaponN(sub(p,G))),n:weaponN},hand={p:p=>weapon.p(add(p,[0,7.7,0])),n:weaponN};
 const legs=[-1,1].map((side,i)=>{const H=[side*6.5,-43,0],K=[side*6.5,-26,0],A=[side*6.5,-2,0],hip=body.p(H),ankle=add(mix(a.feet[i],z.feet[i],u),offset),knee=ik(hip,ankle,17,24,mix(a.poles[i],z.poles[i],u)),forward=mix(a.footDirs[i],z.footDirs[i],u),footYaw=Math.atan2(-forward[0],-forward[2]),c=Math.cos(footYaw),s=Math.sin(footYaw),fn=p=>[p[0]*c+p[2]*s,p[1],-p[0]*s+p[2]*c],foot={p:p=>add(ankle,fn(sub(p,A))),n:fn};return {side,hip,knee,ankle,footYaw,footLift:Math.max(0,-2-ankle[1]),thigh:bone(H,K,hip,knee),shin:bone(K,A,knee,ankle),foot};});
 // A stone mantle stays rigid. Raise it about the shoulder only for clearance.
 const cp=[0,-76,5];let cape,angle=12*Math.PI/180;
 for(let i=0;i<30;i++){const c=Math.cos(angle),s=Math.sin(angle),r=p=>[p[0],p[1]*c-p[2]*s,p[1]*s+p[2]*c];cape={p:p=>body.p(add(cp,r(sub(p,cp)))),n:p=>body.n(r(p))};let floor=-Infinity;for(const v of capePoints)floor=Math.max(floor,cape.p(v)[1]);if(floor<=-.5)break;angle+=2*Math.PI/180;}
 return {...entry,time,body,head,cape,shoulder,elbow,wrist,grip,weapon,hand,upper:bone(S,E,shoulder,elbow),forearm:bone(E,W,elbow,wrist),legs,yaw:Math.atan2(-b[0][2],b[0][0]),weaponDirection:dir,contact:grip.slice(),landingContact:null,airHeight:0,referenceTime:video,phase:'Video takibi · '+video.toFixed(2)+' s',editorIssues:[]};
}
// Cache just the measured rigid poses, not rendered frames or GPU resources.
let cachedTime=-1,cached;
function sample(time){if(time<=6.1)return M.sampleVersion(time,10);if(time===cachedTime)return cached;let p=tracked(time);const q=ease((time-6.1)/.16);if(q<1){
 // Entry joins the existing first strike before the reference's first step.
 const bodyBlend=(a,b)=>({p:v=>mix(a.p(v),b.p(v),q),n:v=>unit(mix(a.n(v),b.n(v),q))});
 p={...p,body:bodyBlend(entry.body,p.body),head:bodyBlend(entry.head,p.head),cape:bodyBlend(entry.cape,p.cape)};
 const shoulder=p.body.p(S),wrist=mix(entry.wrist,p.wrist,q),elbow=ik(shoulder,wrist,L1,L2,mix(sub(entry.elbow,entry.shoulder),sub(p.elbow,p.shoulder),q)),wb=axes(mix(entry.weapon.n([1,0,0]),p.weapon.n([1,0,0]),q),mix(entry.weapon.n([0,1,0]),p.weapon.n([0,1,0]),q)),r=v=>turn(v,wb),grip=sub(wrist,r([-2.8,0,0])),weapon={p:v=>add(grip,r(sub(v,G))),n:r};
 p={...p,shoulder,elbow,wrist,grip,weapon,hand:{p:v=>weapon.p(add(v,[0,7.7,0])),n:r},upper:bone(S,E,shoulder,elbow),forearm:bone(E,W,elbow,wrist)};
 p.legs=p.legs.map((l,i)=>{const H=[l.side*6.5,-43,0],K=[l.side*6.5,-26,0],A=[l.side*6.5,-2,0],hip=p.body.p(H),ankle=mix(entry.legs[i].ankle,l.ankle,q),knee=ik(hip,ankle,17,24,mix(sub(entry.legs[i].knee,entry.legs[i].hip),sub(l.knee,l.hip),q));return {...l,hip,knee,ankle,thigh:bone(H,K,hip,knee),shin:bone(K,A,knee,ankle),foot:{p:v=>add(ankle,l.foot.n(sub(v,A))),n:l.foot.n}};});
 }cachedTime=time;cached=p;return p;}
window.KRAncientGuardianReference={sample,videoStart:start,videoEnd:5.25,labStart:6.1,samples:samples.length};
})();
