/* User-authored donus poses, captured 2026-10-04. Original browser saves stay intact. */
(()=>{'use strict';
const M=KRAncientGuardianStance;
const sharedLeft=[4.825879894951564,2.142348082873724,-8.464933122649098],sharedKnee=[-.7164646329856411,-1.6717867788715752,-3.4394682722764327],sharedRightKnee=[.055355108266278236,-2.5769887778660547,.09214072193903007];
const keys=[
{name:'donus',time:7.25,edits:{leftFoot:{p:sharedLeft,ground:true}}},
{name:'donus 1',time:7.95,edits:{leftFoot:{p:sharedLeft,ground:true,r:[0,69.69158557148297,0]},elbow:{r:[0,0,0]},body:{r:[0,71,27],p:[-1.9128802598376633,-3.1625252021061416,-9.18299474875461]},leftKnee:{p:sharedKnee},rightFoot:{r:[0,66.17222034552852,0],p:[1.9425635866985436,0,1.537461300531915],ground:true}}},
{name:'donus 2',time:8.55,edits:{leftFoot:{p:sharedLeft,ground:true,r:[0,128.82503250357652,0]},elbow:{r:[0,0,0]},body:{r:[0,131,39],p:[-1.9128802598376633,-3.1625252021061416,-9.18299474875461]},leftKnee:{p:sharedKnee},rightFoot:{r:[0,139.3832141044917,0],p:[11.929163760683284,-9.360321975950114,1.9086314880835626],ground:false},rightKnee:{p:sharedRightKnee}}},
{"name":"donus 3 yeni","time":8.99,"edits":{"body":{"p":[-1.9128802598376633,-3.1625252021061416,-9.18299474875461],"r":[0,208,47]},"elbow":{"r":[0,2.8228729708833953,0],"p":[-1.4005596501519666,2.130043053283059,0.595405485313883]},"leftFoot":{"p":[4.825879894951564,2.142348082873724,-8.464933122649098],"r":[0,199.6897684580615,0],"ground":true},"rightFoot":{"p":[21.797396097951044,-24.009387438124133,-24.39445688926579],"r":[0,218.93644606029298,0],"ground":false},"leftKnee":{"p":[-0.7164646329856411,-1.6717867788715752,-3.4394682722764327]},"rightKnee":{"p":[-6.071068895351661,-21.625180551115783,-3.2104787541174074],"r":[0,3.9960233538853345,0]},"hand":{"p":[3.080566369410393,0.011310549828498218,-2.3730298836385137],"r":[0,5.205733995280228,0]},"weapon":{"r":[0,14.370888124527333,0],"p":[-2.8474121352374926,0.1386105892523317,1.730953145979216]}}},
{"name":"donus 4 yeni2","time":9.27,"edits":{"body":{"p":[-6.554682591212559,4.537307285070771,-20.823701223806275],"r":[1,270.53812652423926,2]},"elbow":{"r":[0,31.454710675605018,0],"p":[-1.4005596501519666,2.130043053283059,0.595405485313883]},"leftFoot":{"p":[4.825879894951564,2.142348082873724,-8.464933122649098],"r":[0,268.20824660806824,0],"ground":true},"rightFoot":{"p":[-15.438013604086386,4.105483619751445,-39.96456275432042],"r":[0,280.8927444825071,0],"ground":true},"leftKnee":{"p":[-0.7164646329856411,-1.6717867788715752,-3.4394682722764327]},"rightKnee":{"p":[-6.071068895351661,-21.625180551115783,-3.2104787541174074],"r":[0,3.9960233538853345,0]},"hand":{"p":[-95.53724961510214,-0.2545934489825967,61.91093405797872],"r":[0,-102.94273244532397,0]},"weapon":{"r":[0,247.60492994645872,0],"p":[-2.8474121352374926,0.1386105892523317,1.730953145979216]},"head":{"r":[0,-18.293576153998288,0]}}}
];
const base=M.sampleVersion(7.25,1),sub=(a,b)=>a.map((v,i)=>v-b[i]),mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
const poses=keys.map(k=>M.applyEdits(base,k.edits));
const add=(a,b)=>a.map((v,i)=>v+b[i]),mul=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],length=a=>Math.hypot(...a),unit=a=>mul(a,1/(length(a)||1));
const sourceShoulder=[-18.9,-70,0],sourceElbow=[-19,-55.7,-1.5],sourceWrist=[-2.8,-63.5,-13.5],sourceGrip=[0,-55.8,-13.5],upperLength=length(sub(sourceElbow,sourceShoulder)),foreLength=length(sub(sourceWrist,sourceElbow));
function bone(a,b,A,B){const x=unit(sub(b,a)),y=unit(sub(B,A)),v=cross(x,y),c=dot(x,y),n=p=>add(add(p,cross(v,p)),mul(cross(v,cross(v,p)),1/Math.max(1e-8,1+c)));return {p:p=>add(A,n(sub(p,a))),n};}
function flatBasis(direction){const x=unit(cross(direction,[0,-1,0]));return [x,direction,unit(cross(x,direction))];}
const sweepStart=poses[3],sweepEnd=poses[4],armEnd=unit(sub(sweepEnd.wrist,sweepEnd.shoulder)),startBlade=sweepStart.weaponDirection,endBlade=sweepEnd.weaponDirection,startFlat=flatBasis(startBlade),initialRoll=Math.atan2(dot(sweepStart.weapon.n([0,0,1]),startFlat[0]),dot(sweepStart.weapon.n([0,0,1]),startFlat[2]));
// Either broad face can be up. Choose the nearest horizontal face in the
// preparation; never unwind a near-180-degree roll during the actual cut.
const heldRoll=Math.round(initialRoll/Math.PI)*Math.PI;
// Settle blade elevation during the slow body turn, not in the first 90 ms
// of the cut. Rotate the forearm and sword together about the elbow: no
// extra wrist pitch. Upper arm, body and support poses stay authored.
function prepareBlade(p,time){
 const raw=p.weaponDirection,settle=ease((time-8.25)/.74),pitch=Math.asin(Math.max(-1,Math.min(1,raw[1])))*(1-settle),horizontal=unit([raw[0],0,raw[2]]),direction=[horizontal[0]*Math.cos(pitch),Math.sin(pitch),horizontal[2]*Math.cos(pitch)];
 const originalAxes=flatBasis(raw),normal=p.weapon.n([0,0,1]),current=Math.atan2(dot(normal,originalAxes[0]),dot(normal,originalAxes[2]));let delta=heldRoll-current;while(delta>Math.PI)delta-=2*Math.PI;while(delta< -Math.PI)delta+=2*Math.PI;
 const turn=bone([0,0,0],raw,[0,0,0],direction),around=v=>add(p.elbow,turn.n(sub(v,p.elbow))),wrist=around(p.wrist),forearm={p:v=>around(p.forearm.p(v)),n:v=>turn.n(p.forearm.n(v))};
 const roll=current+delta*ease((time-8.55)/.44),axes=flatBasis(direction),c=Math.cos(roll),s=Math.sin(roll),n=v=>add(add(mul(axes[0],v[0]*c+v[2]*s),mul(axes[1],v[1])),mul(axes[2],-v[0]*s+v[2]*c)),grip=sub(wrist,n([-2.8,0,0])),weapon={p:v=>add(grip,n(sub(v,sourceGrip))),n};
 return {...p,wrist,forearm,grip,weapon,weaponDirection:direction,contact:grip,hand:{p:v=>weapon.p(add(v,[0,7.7,0])),n}};
}
const preparedStart=prepareBlade(sweepStart,8.99),armStart=unit(sub(preparedStart.wrist,preparedStart.shoulder));
function cleanSweep(p,time){const u=clamp((time-8.99)/.28),s=cutProgress(u),extend=ease(u/.32),arc=(a,b,y)=>{const angle=Math.atan2(a[0],-a[2])+(Math.atan2(b[0],-b[2])-Math.atan2(a[0],-a[2]))*s,r=Math.sqrt(Math.max(0,1-y*y));return [Math.sin(angle)*r,y,-Math.cos(angle)*r];},arm=arc(armStart,armEnd,armStart[1]+(armEnd[1]-armStart[1])*s),reach=length(sub(preparedStart.wrist,preparedStart.shoulder))+(upperLength+foreLength-length(sub(preparedStart.wrist,preparedStart.shoulder)))*extend,wrist=add(p.shoulder,mul(arm,reach)),along=(upperLength*upperLength-foreLength*foreLength+reach*reach)/(2*reach),height=Math.sqrt(Math.max(0,upperLength*upperLength-along*along)),pole=sub(sweepStart.elbow,sweepStart.shoulder),perp=unit(sub(pole,mul(arm,dot(pole,arm)))),elbow=add(add(p.shoulder,mul(arm,along)),mul(perp,height));
 const direction=arc(startBlade,endBlade,0),axes=flatBasis(direction),roll=heldRoll,c=Math.cos(roll),sn=Math.sin(roll),n=v=>add(add(mul(axes[0],v[0]*c+v[2]*sn),mul(axes[1],v[1])),mul(axes[2],-v[0]*sn+v[2]*c)),grip=sub(wrist,n([-2.8,0,0])),weapon={p:v=>add(grip,n(sub(v,sourceGrip))),n};
 return {...p,wrist,elbow,grip,weapon,hand:{p:v=>weapon.p(add(v,[0,7.7,0])),n},upper:bone(sourceShoulder,sourceElbow,p.shoulder,elbow),forearm:bone(sourceElbow,sourceWrist,elbow,wrist),weaponDirection:direction,contact:grip};
}
// Interpolate resolved foot heights, not editor offsets whose ground flag can
// otherwise snap a foot down when a saved contact changes from false to true.
const curves=keys.map((k,i)=>{const e=JSON.parse(JSON.stringify(k.edits));e.rightFoot??={};e.rightFoot.p=sub(poses[i].legs[1].ankle,base.legs[1].ankle);e.rightFoot.ground=false;return e;});
const channels=[...new Set(curves.flatMap(Object.keys))],value=(i,key,field,axis)=>curves[i][key]?.[field]?.[axis]||0;
const capeVertices=[...new Map(KRAncientGuardian.parts['stone-cape'].flatMap(f=>f.v).map(v=>[v.join(','),v])).values()];
// Eight conservative support corners keep clearance checks off the detailed
// moss mesh on every animation frame.
const capeRange=[0,1,2].map(i=>[Math.min(...capeVertices.map(v=>v[i])),Math.max(...capeVertices.map(v=>v[i]))]),capeBounds=capeRange[0].flatMap(x=>capeRange[1].flatMap(y=>capeRange[2].map(z=>[x,y,z])));
function clearCape(p){const original=p.cape,pivot=p.body.p([0,-76,5]),axis=p.body.n([1,0,0]),dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],rotate=(v,a)=>{const c=Math.cos(a),s=Math.sin(a),x=cross(axis,v),d=dot(axis,v);return v.map((n,i)=>n*c+x[i]*s+axis[i]*d*(1-c));},coefficients=capeBounds.map(v=>{const x=sub(original.p(v),pivot),d=dot(axis,x);return [x[1]-axis[1]*d,cross(axis,x)[1],pivot[1]+axis[1]*d];}),floor=a=>{const c=Math.cos(a),s=Math.sin(a);let max=-Infinity;for(const v of coefficients)max=Math.max(max,v[0]*c+v[1]*s+v[2]);return max;};if(floor(0)<=-.2)return original;let lo=0,hi=Math.PI/2;for(let i=0;i<15;i++){const mid=(lo+hi)/2;if(floor(mid)>-.2)lo=mid;else hi=mid;}return {p:v=>rotate(sub(original.p(v),pivot),hi).map((x,i)=>x+pivot[i]),n:v=>rotate(original.n(v),hi)};}
function tangent(i,key,field,axis){if(i===0||i===keys.length-1)return 0;const left=(value(i,key,field,axis)-value(i-1,key,field,axis))/(keys[i].time-keys[i-1].time),right=(value(i+1,key,field,axis)-value(i,key,field,axis))/(keys[i+1].time-keys[i].time);return left*right<=0?0:2*left*right/(left+right);}
function editsAt(time){let i=0;while(i<keys.length-2&&time>keys[i+1].time)i++;const dt=keys[i+1].time-keys[i].time,u=clamp((time-keys[i].time)/dt),out={};for(const key of channels){out[key]={};for(const field of ['p','r'])out[key][field]=[0,1,2].map(axis=>{const a=value(i,key,field,axis),b=value(i+1,key,field,axis),m=tangent(i,key,field,axis),n=tangent(i+1,key,field,axis);return (2*u**3-3*u*u+1)*a+(u**3-2*u*u+u)*dt*m+(-2*u**3+3*u*u)*b+(u**3-u*u)*dt*n;});}out.leftFoot.ground=true;out.rightFoot.ground=false;return out;}
// Ease into the user's source 7.41 s pose, then release like a loaded spring.
// Integrating smoothstep velocity keeps time, velocity and acceleration joined.
// No new airborne pose: foot contacts and the authored motion path are retained.
// Preserve the user's 7.74 s pose and everything before it. Complete the
// speed build-up immediately after weight transfer, before the lifted-leg turn.
const slowStart=6.3,anticipationSource=7.41,loadedSpeed=.78,sourceFinish=9.27;
const gentleRamp=.85,gentleBurstSpeed=3,boostStart=7.74,boostDuration=.22,burstSpeed=3.5;
const slowDuration=(anticipationSource-slowStart)/((1+loadedSpeed)/2),accelerationStart=slowStart+slowDuration;
const integralEase=u=>u*u*u-.5*u*u*u*u;
const boostU=(boostStart-accelerationStart)/gentleRamp,boostSource=anticipationSource+loadedSpeed*(boostStart-accelerationStart)+(gentleBurstSpeed-loadedSpeed)*gentleRamp*integralEase(boostU);
const boostSpeed=loadedSpeed+(gentleBurstSpeed-loadedSpeed)*ease(boostU),boostAcceleration=(gentleBurstSpeed-loadedSpeed)*6*boostU*(1-boostU)/gentleRamp;
const velocityA=boostAcceleration*boostDuration,velocityB=3*(burstSpeed-boostSpeed)-2*velocityA,velocityC=-2*(burstSpeed-boostSpeed)+velocityA;
const boostDistance=u=>boostDuration*(boostSpeed*u+velocityA*u*u/2+velocityB*u*u*u/3+velocityC*u*u*u*u/4);
const rampDuration=boostStart+boostDuration-accelerationStart,finishTime=boostStart+boostDuration+(sourceFinish-boostSource-boostDistance(1))/burstSpeed;
function authoredTime(time){
 if(time<=slowStart)return time;
 if(time<accelerationStart){const x=time-slowStart,u=x/slowDuration;return slowStart+x-(1-loadedSpeed)*slowDuration*integralEase(u);}
 if(time<boostStart){const x=time-accelerationStart,u=x/gentleRamp;return anticipationSource+loadedSpeed*x+(gentleBurstSpeed-loadedSpeed)*gentleRamp*integralEase(u);}
 const x=time-boostStart;
 if(x<boostDuration)return boostSource+boostDistance(x/boostDuration);
 return Math.min(sourceFinish,boostSource+boostDistance(1)+burstSpeed*(x-boostDuration));
}
function playbackTime(source){if(source<=slowStart)return source;let lo=slowStart,hi=finishTime;for(let i=0;i<40;i++){const mid=(lo+hi)/2;if(authoredTime(mid)<source)lo=mid;else hi=mid;}return (lo+hi)/2;}
function cutProgress(u){u=clamp(u);return u+u*u-u*u*u;}
const timing=Object.freeze({slowStart,anticipationSource,accelerationStart,rampDuration,boostStart,boostDuration,burstSpeed,cutStart:playbackTime(8.99),finish:finishTime,authoredTime,playbackTime});
const playbackKeys=keys.map(k=>({...k,sourceTime:k.time,time:playbackTime(k.time)}));
function samplePlayback(time){const p=sample(authoredTime(time));return {...p,time,phase:time<slowStart?p.phase:time<accelerationStart?'Senin pozların · yay gibi yüklen':time<timing.cutStart?'Senin pozların · hızlanan dönüş':time<finishTime?'Senin pozların · hızlı savuruş':p.phase};}
let lastTime=-1,lastPose;
function sample(time){if(time===lastTime)return lastPose;let p;
 if(time<7.25){
 // The existing first attack stays untouched. Approach the saved starting
 // pose using its own native predecessor, so there is no jump at 7.25.
 if(time<=6.1)return M.sampleVersion(time,10);
 const entry=M.sampleVersion(time,1),u=ease((time-6.1)/1.15),offset=sharedLeft.map(v=>v*u);offset[1]=(-2-entry.legs[0].ankle[1])*u;
 const e={leftFoot:{p:offset,ground:false}};
 p=M.applyEdits(entry,e);
 }else if(time>=9.27)p=poses[4];else p=M.applyEdits(base,editsAt(time>=8.99?8.99+.28*cutProgress((time-8.99)/.28):time));
 if(time>=8.99)p=cleanSweep(p,time);else if(time>=8.25)p=prepareBlade(p,time);
 p={...p,time,cape:clearCape(p),phase:time<7.25?'Dönüş girişine yaklaş':time<8.99?'Senin pozların · ağır dönüş':time<9.27?'Senin pozların · hızlı savuruş':'donus 4 · bitiş',landingContact:null};lastTime=time;lastPose=p;return p;
}
window.KRGuardianAuthoredTurnV20={sample:samplePlayback,keys:playbackKeys,poses,timing,baseVersion:1,sourceTime:7.25};
})();

