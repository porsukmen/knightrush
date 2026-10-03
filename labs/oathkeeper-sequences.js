/* Whole enemy turns, sampled once by the native EncounterActor sequence driver.
 * Local actor Y is up, front is -Z. Prop coordinates use the native projection.
 * No timers, listeners, gameplay mutation, RNG or resource loading in this file. */
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;else root.KROathkeeperSequences=api;})(globalThis,root=>{
 'use strict';
 const clamp=(t,a=0,b=1)=>Math.max(a,Math.min(b,t)),mix=(a,b,t)=>a+(b-a)*t,
  smooth=t=>{t=clamp(t);return t*t*(3-2*t);},ramp=(t,a,b)=>smooth((t-a)/(b-a));
 const NEUTRAL={crouch:0,lean:.035,twist:0,shift:0,left:[-2,1.63,-.18],right:[2,1.63,-.18],pitch:.05,leftPitch:.05,rightPitch:.05,grip:0,leftPole:[-.85,-.12,.48],rightPole:[.85,-.12,.48]};
 const poses={
  rest:{},
  load:{crouch:-.20,lean:.07,twist:-.07,shift:-.08,left:[-2.05,1.75,-.25],right:[2.08,2.04,-.32],grip:.28},
  dig:{crouch:-1.22,lean:-.22,twist:.02,shift:0,left:[-1.72,.75,-.80],right:[1.72,.75,-.80],leftPitch:-.5,rightPitch:-.5,grip:.80},
  tear:{crouch:-.93,lean:-.15,twist:-.04,left:[-1.68,1.10,-1.04],right:[1.68,1.10,-1.04],leftPitch:-.30,rightPitch:-.30,grip:1},
  lift:{crouch:-.25,lean:.11,twist:-.19,shift:-.09,left:[-1.67,3.04,-1.22],right:[1.55,3.08,-1.15],leftPitch:.25,rightPitch:.25,grip:1},
  sweepLoad:{crouch:-.16,lean:.10,twist:-.34,shift:-.13,left:[-1.64,3.28,-.80],right:[1.54,3.24,-1.15],leftPitch:.5,rightPitch:.5,grip:1},
  sweepThrough:{crouch:-.35,lean:-.11,twist:.40,shift:.12,left:[-.72,2.55,-1.68],right:[2.80,2.74,-.82],leftPitch:.6,rightPitch:.6,grip:.1},
  follow:{crouch:-.24,lean:-.03,twist:.24,shift:.08,left:[-.90,2.13,-1.05],right:[2.40,2.4,-.60],grip:.15},
  reverseLoad:{crouch:-.25,lean:.04,twist:.24,shift:.10,left:[-2.25,2.55,-.50],right:[1.78,3.23,.34],leftPitch:.35,rightPitch:2.3,grip:.7},
  reverseThrough:{crouch:-.40,lean:-.13,twist:-.34,shift:-.11,left:[-2.82,2.18,-.76],right:[.70,2.25,-1.68],leftPitch:.3,rightPitch:.6,grip:.2},
  seals:{crouch:-.13,lean:.08,twist:0,left:[-2.75,3.78,-.56],right:[2.75,3.78,-.56],leftPitch:1.3,rightPitch:1.3,grip:.05},
  sealLeft:{crouch:-.16,lean:.06,twist:-.12,shift:-.07,left:[-2.70,3.48,-.80],right:[2.50,4.0,.20],leftPitch:.90,rightPitch:2.0,grip:.1},
  sealRight:{crouch:-.16,lean:.06,twist:.12,shift:.07,left:[-2.50,4.0,.20],right:[2.70,3.48,-.80],leftPitch:2.0,rightPitch:.90,grip:.1},
  throwLoad:{crouch:-.16,lean:.10,twist:-.20,shift:-.08,left:[-2.0,2.02,-.34],right:[1.50,4.82,.48],rightPitch:2.65,grip:1,leftPole:[-.85,-.1,.45],rightPole:[.60,-.1,1.10]},
  throwRelease:{crouch:-.34,lean:-.13,twist:.29,shift:.11,left:[-2.05,2.05,-.30],right:[.96,3.02,-1.81],rightPitch:.9,grip:.05},
  leftLoad:{crouch:-.18,lean:.09,twist:.22,shift:.08,left:[-1.55,4.80,.43],right:[2,2,-.35],leftPitch:2.65,grip:1,leftPole:[-.60,-.1,1.10],rightPole:[.85,-.1,.45]},
  leftRelease:{crouch:-.33,lean:-.13,twist:-.28,shift:-.10,left:[-.95,3.05,-1.82],right:[2.03,2.04,-.30],leftPitch:.9,grip:.05},
  recall:{crouch:-.28,lean:.04,twist:0,left:[-2.4,2.75,-1.08],right:[2.4,2.75,-1.08],leftPitch:.30,rightPitch:.30,grip:.5},
  crushLoad:{crouch:-.17,lean:.10,twist:0,left:[-1.47,5.13,.25],right:[1.47,5.13,.25],leftPitch:2.8,rightPitch:2.8,grip:1,leftPole:[-.55,-.12,1.1],rightPole:[.55,-.12,1.1]},
  crushContact:{crouch:-1.18,lean:-.22,twist:0,left:[-1.74,.74,-.89],right:[1.74,.74,-.89],leftPitch:0,rightPitch:0,grip:1},
  settle:{crouch:-.40,lean:-.09,twist:0,left:[-1.97,1.45,-.57],right:[1.97,1.45,-.57],leftPitch:.10,rightPitch:.10,grip:.25}
 };
 const pose=name=>({...NEUTRAL,...poses[name]}),key=(t,name)=>({t,v:pose(name)});
 // Monotone Hermite interpolation: C1 continuity at ordinary joins without
 // overshooting a hand through the floor. Explicit duplicated keys create holds.
 function scalar(keys,i,name,component){
  const value=k=>component===undefined?keys[k].v[name]:keys[k].v[name][component],a=value(i),b=value(i+1),dt=keys[i+1].t-keys[i].t,d=(b-a)/dt;
  const tangent=k=>{if(k===0||k===keys.length-1)return 0;const p=(value(k)-value(k-1))/(keys[k].t-keys[k-1].t),n=(value(k+1)-value(k))/(keys[k+1].t-keys[k].t);return p*n<=0?0:2*p*n/(p+n);};
  return {a,b,dt,m0:d===0?0:tangent(i),m1:d===0?0:tangent(i+1)};
 }
 function motionAt(keys,t,out={}){
  let i=0;while(i<keys.length-2&&t>keys[i+1].t)i++;
  const u=clamp((t-keys[i].t)/(keys[i+1].t-keys[i].t)),u2=u*u,u3=u2*u,
   sample=(name,c)=>{const {a,b,dt,m0,m1}=scalar(keys,i,name,c);return (2*u3-3*u2+1)*a+(u3-2*u2+u)*dt*m0+(-2*u3+3*u2)*b+(u3-u2)*dt*m1;};
  for(const name of Object.keys(NEUTRAL)){if(Array.isArray(NEUTRAL[name])){out[name]??=[];for(let c=0;c<3;c++)out[name][c]=sample(name,c);}else out[name]=sample(name);}
  return out;
 }
 const tracks={
  broken:[key(0,'rest'),key(.45,'load'),key(1.14,'dig'),key(1.40,'dig'),key(1.88,'tear'),key(2.48,'lift'),key(2.78,'sweepLoad'),key(3.18,'sweepThrough'),key(3.66,'follow'),key(4.35,'reverseLoad'),key(4.78,'reverseThrough'),key(5.30,'follow'),key(6.20,'sealLeft'),key(6.74,'sealRight'),key(7.25,'recall'),key(8.08,'crushLoad'),key(8.31,'crushLoad'),key(8.64,'crushContact'),key(8.91,'crushContact'),key(9.55,'settle'),key(10.62,'rest'),key(11.1,'rest')],
  cross:[key(0,'rest'),key(.50,'load'),key(1.18,'seals'),key(1.64,'sealLeft'),key(2.68,'sealRight'),key(3.82,'sealLeft'),key(4.84,'sealRight'),key(5.92,'seals'),key(6.45,'sealLeft'),key(7.48,'sealRight'),key(8.32,'seals'),key(8.88,'crushLoad'),key(9.18,'crushContact'),key(9.48,'crushContact'),key(10.10,'settle'),key(11.1,'rest')],
  return:[key(0,'rest'),key(.46,'load'),key(1.18,'throwLoad'),key(1.44,'throwLoad'),key(1.73,'throwRelease'),key(2.22,'follow'),key(2.75,'leftLoad'),key(3.0,'leftLoad'),key(3.30,'leftRelease'),key(3.8,'reverseThrough'),key(4.4,'sealRight'),key(5.30,'recall'),key(6.2,'sealLeft'),key(7.0,'recall'),key(7.65,'lift'),key(8.10,'tear'),key(8.65,'dig'),key(9.35,'settle'),key(10.5,'rest')],
  final:[key(0,'rest'),key(.6,'load'),key(1.3,'crushContact'),key(1.62,'crushContact'),key(2.35,'seals'),key(3.45,'sealLeft'),key(4.55,'sealRight'),key(5.35,'recall'),key(6.08,'throwLoad'),key(6.36,'throwRelease'),key(7.20,'sealLeft'),key(8.20,'recall'),key(9.25,'crushLoad'),key(9.65,'crushLoad'),key(10.00,'crushContact'),key(10.30,'crushContact'),key(11.0,'settle'),key(12.3,'rest'),key(12.8,'rest')]
 };
 function begin(out,t,track,ctx){out.hazards.length=out.props.length=out.cues.length=0;out._pool??={props:[],hazards:[],cues:[]};out._used??={};out._used.props=out._used.hazards=out._used.cues=0;out.motion=motionAt(tracks[track],t,out.motion||{});out.time=t;out.track=track;out.bounds=null;out.ctx=ctx;return out;}
 function pooled(out,kind){const i=out._used[kind]++;return out._pool[kind][i]||(out._pool[kind][i]={});}
 function prop(out,id,kind,x,y,s,depth,w,h,d,roll=0,yaw=0,alpha=1){const p=pooled(out,'props');Object.assign(p,{id,kind,x,y,s,depth,w,h,d,roll,yaw,alpha,variant:out.props.length%3});out.props.push(p);return p;}
 function hazard(out,id,active,parryable=false){const h=pooled(out,'hazards');h.id=id;h.active=active;h.parryable=parryable;h.hitText='The broken oath found you';h.primitives??=[];h.primitives.length=0;out.hazards.push(h);return h;}
 function circle(h,x,y,r){h._circles??=[];const i=h.primitives.length,p=h._circles[i]||(h._circles[i]={});p.x=x;p.y=y;p.r=r;h.primitives.push(p);}
 function slabHit(h,p){const r=p.h*p.s*.40,cr=Math.cos(p.roll),sr=Math.sin(p.roll),cy=Math.cos(p.yaw),sy=Math.sin(p.yaw),vx=cy*cr-.28*sy*sr,vy=cy*sr+.28*sy*cr,len=Math.hypot(vx,vy),half=Math.max(0,p.w*p.s*.43*len-r),steps=Math.max(1,Math.ceil(half*2/Math.max(8,r*1.5))),c=vx/len,s=vy/len;for(let i=0;i<=steps;i++){const x=mix(-half,half,i/steps);circle(h,p.x+x*c,p.y+x*s,r);}}
 function cue(out,id,points,tone='ground',alpha=.7,width=2){const q=pooled(out,'cues');Object.assign(q,{id,points,tone,alpha,width});out.cues.push(q);}
 const at=(ctx,lane,height,z)=>ctx.project(lane,height,z),point=p=>[p.x,p.y];
 function row(out,ctx,id,t,contact,{tell=.75,speed=20,height=-2,gap=null}={}){
  if(t<contact-tell||t>contact+.30)return;
  const release=contact-.52,z=(contact-t)*speed;
  if(t<release){const a=at(ctx,-.3,0,0),b=at(ctx,2.3,0,0);cue(out,id,[point(a),point(b)],'ground',.32+.4*ramp(t,contact-tell,release),2);return;}
  const h=hazard(out,id,Math.abs(z)<.70,false);
  for(let i=0;i<11;i++){const lane=-.35+i*.27;if(gap!==null&&Math.abs(lane-gap)<.38)continue;const q=at(ctx,lane,height,z),p=prop(out,id+':'+i,'ridge',q.x,q.y,q.s,z,47,24,25,(i%3-1)*.09,.1*(i%2),1-ramp(t,contact+.12,contact+.3));if(h.active)circle(h,p.x,p.y,12*p.s);}
 }
 function sweep(out,ctx,id,t,start,duration,height,side=1,{width=126,parryable=false}={}){
  const tell=start-.64,end=start+duration;if(t<tell||t>end+.24)return;
  const from=side>0?-.60:2.60,to=side>0?2.60:-.60;
  if(t<start){cue(out,id,[point(at(ctx,from,height,0)),point(at(ctx,to,height,0))],height>60?'high':'ground',.32+.4*ramp(t,tell,start),2);return;}
  const u=clamp((t-start)/duration),q=at(ctx,mix(from,to,u),height,0),p=prop(out,id,'slab',q.x,q.y,q.s,0,width,24,24,side*.05,side*.24,1-ramp(t,end,end+.24)),h=hazard(out,id,t<=end,parryable);slabHit(h,p);
 }
 function diagonal(out,ctx,id,t,start,duration,side=1,offset=0){
  const tell=start-.62,end=start+duration;if(t<tell||t>end+.20)return;
  const a=at(ctx,side>0?-.5:2.5,178+offset,0),b=at(ctx,side>0?2.5:-.5,-38+offset,0);
  if(t<start){cue(out,id,[point(a),point(b)],'seal',.30+.38*ramp(t,tell,start),1.5);return;}
  const u=clamp((t-start)/duration),x=mix(a.x,b.x,u),y=mix(a.y,b.y,u),p=prop(out,id,'shard',x,y,1,0,54,22,23,Math.atan2(b.y-a.y,b.x-a.x),side*.3,1-ramp(t,end,end+.2)),h=hazard(out,id,t<=end,true);slabHit(h,p);
 }
 function gate(out,ctx,id,t,start,gapFrom,gapTo,tilt){
  const end=start+1.40,tell=start-.80;if(t<tell||t>end+.15)return;
  const u=clamp((t-start)/1.40),centerY=mix(ctx.playerY-210,ctx.playerY+76,u),gap=mix(gapFrom,gapTo,smooth(u)),gapX=at(ctx,gap,0,0).x;
  if(t<start){const y=ctx.playerY-180,a=at(ctx,-.35,0,0).x,b=at(ctx,2.35,0,0).x;cue(out,id,[[a,y+(a-gapX)*tilt],[gapX-54,y-54*tilt]],'seal',.6);cue(out,id+'b',[[gapX+54,y+54*tilt],[b,y+(b-gapX)*tilt]],'seal',.6);return;}
  const h=hazard(out,id,t<=end,false);
  // Both solid wings move with the opening. Do not delete stones in a fixed
  // lattice: that would teleport the hole and invalidate swept primitive pairs.
  for(const side of [-1,1])for(let i=0;i<9;i++){const x=gapX+side*(78+i*37.2),y=centerY+(x-gapX)*tilt,p=prop(out,id+':'+side+':'+i,'shard',x,y,1,0,43,18,19,Math.atan(tilt),.18,1-ramp(t,end,end+.15));slabHit(h,p);}
 }
 function actorPoint(ctx,track,t,side,offset=[0,-.35,-.50]){
  const Model=root.KROathkeeperModel||(typeof require==='function'?require('./oathkeeper-model.js'):null),m=motionAt(tracks[track],t),p=Model.pose(7,{id:'sequence',side:0,motionOverride:m}),v=p.handPoint(side,offset),base=at(ctx,1,0,ctx.actor?.z??14),unit=base.s*3.65*30;
  return {x:base.x+v[0]*unit,y:base.y-(v[1]*.96+v[2]*.28)*unit,s:base.s,depth:ctx.actor?.z??14,unit};
 }
 function heldPose(ctx,track,t){const l=actorPoint(ctx,track,t,-1),r=actorPoint(ctx,track,t,1);return {x:(l.x+r.x)/2,y:(l.y+r.y)/2+8*l.s,s:l.s,depth:l.depth,roll:Math.atan2(r.y-l.y,r.x-l.x)};}
 function liftedLintel(out,ctx,t){
  const release=2.98,arrive=3.53,end=4.53;if(t<1.26||t>end+.18)return;
  const start=heldPose(ctx,'broken',release),edge=at(ctx,-.62,99,0);
  let q,roll=0,yaw=.06,h=null;
  if(t<release){q=heldPose(ctx,'broken',t);roll=q.roll;}
  else if(t<arrive){const u=(t-release)/(arrive-release),k=smooth(u);q={x:mix(start.x,edge.x,k),y:mix(start.y,edge.y,k)-Math.sin(Math.PI*u)*26,s:mix(start.s,1,k),depth:mix(start.depth,0,k)};yaw=mix(.06,1.17,k);roll=mix(start.roll,.04-Math.atan2(.28*Math.sin(1.17),Math.cos(1.17)),k);}
  else{const u=clamp((t-arrive)/(end-arrive)),far=at(ctx,2.62,99,0);q={x:mix(edge.x,far.x,u),y:edge.y,s:1,depth:0};yaw=1.17;roll=.04-Math.atan2(.28*Math.sin(yaw),Math.cos(yaw));h=hazard(out,'carved-lintel',t<=end,false);}
  if(t<release+.2)cue(out,'lintel-route',[point(edge),point(at(ctx,2.62,99,0))],'high',.58,2);
  const p=prop(out,'carved-lintel','slab',q.x,q.y,q.s,q.depth,335,48,70,roll,yaw,ramp(t,1.26,1.40)*(1-ramp(t,end,end+.18)));if(h)slabHit(h,p);
 }
 function bezier(a,b,c,d,u){const v=1-u;return {x:v*v*v*a.x+3*v*v*u*b.x+3*v*u*u*c.x+u*u*u*d.x,y:v*v*v*a.y+3*v*v*u*b.y+3*v*u*u*c.y+u*u*u*d.y};}
 function returningSlab(out,ctx,id,t,{launch,side=1,target=1,backAt,catchAt,returnHeight=99,track='return'}){
  if(ctx.resolved?.[id+':out']==='parry')return;
  const hand=actorPoint(ctx,track,launch,side),hit=at(ctx,target,54,0),outside=at(ctx,side>0?2.70:-.70,returnHeight,0),contact=launch+.84,endOut=launch+1.48;
  const setDown=track==='final'?10.20:8.85;
  if(t<launch-.65||t>setDown)return;
  if(t<launch){const cur=actorPoint(ctx,track,t,side);prop(out,id,'slab',cur.x,cur.y,cur.s,cur.depth,140,30,35,-.35*side,.18*side,ramp(t,launch-.65,launch-.51));cue(out,id,[point(hand),point(hit)],'seal',.45,1.5);return;}
  if(t>=catchAt){const cur=actorPoint(ctx,track,t,side);prop(out,id,'slab',cur.x,cur.y,cur.s,cur.depth,140,30,35,-.35*side,.18*side,1-ramp(t,setDown-.18,setDown));return;}
  let q,s=1,depth=0,roll=0,h;
  if(t<=endOut){const u=clamp((t-launch)/(endOut-launch)),vx=side*320,vy=(outside.y-hit.y)*1.2;
   // The visible locked aim is an actual point on the path, not merely a
   // Bezier control point. Match velocity on both sides of that contact marker.
   if(t<=contact){const d=contact-launch,k=(t-launch)/d;q=bezier(hand,{x:hand.x+side*20,y:hand.y-35},{x:hit.x-vx*d/3,y:hit.y-vy*d/3},hit,k);}
   else{const d=endOut-contact,k=(t-contact)/d;q=bezier(hit,{x:hit.x+vx*d/3,y:hit.y+vy*d/3},outside,outside,k);}
   s=mix(hand.s,1,ramp(t,launch,launch+.6));depth=mix(hand.depth,0,ramp(t,launch,launch+.65));roll=side*(-.35+u*1.5);h=hazard(out,id+':out',depth<=.35&&t<endOut,true);}
  else if(t<backAt){q=outside;roll=side*1.15*(1-ramp(t,endOut,backAt));cue(out,id+':return',[point(outside),point(at(ctx,side>0?-.6:2.6,returnHeight,0))],returnHeight>70?'high':'ground',.5+.25*ramp(t,endOut,backAt),2);h=hazard(out,id+':wait',false,false);}
  else{const u=clamp((t-backAt)/(catchAt-backAt)),catchPoint=actorPoint(ctx,track,catchAt,side),far=at(ctx,side>0?-.6:2.6,returnHeight,0),mid=backAt+(catchAt-backAt)*.60;
   if(t<mid){const k=smooth((t-backAt)/(mid-backAt));q={x:mix(outside.x,far.x,k),y:mix(outside.y,far.y,k)};roll=-side*k*.75;h=hazard(out,id+':return',true,false);}
   else{const k=(t-mid)/(catchAt-mid);q=bezier(far,{x:far.x,y:far.y-100},{x:catchPoint.x-side*35,y:catchPoint.y+30},catchPoint,smooth(k));s=mix(1,catchPoint.s,smooth(k));depth=mix(0,catchPoint.depth,smooth(k));roll=mix(-side*.75,-side*.35,smooth(k));h=hazard(out,id+':catch',false,false);}}
  const p=prop(out,id,'slab',q.x,q.y,s,depth,140,30,35,roll,.18*side);if(h)slabHit(h,p);
 }
 function edgeRain(out,ctx,id,t,start,side){
  const end=start+.58;if(t<start-.7||t>end+.3)return;const lane=side<0?-.03:2.03,x=at(ctx,lane,0,0).x;
  if(t<start){cue(out,id,[[x,ctx.playerY-185],[x,ctx.playerY+8]],'seal',.5,2);return;}
  const u=clamp((t-start)/.58),y=mix(ctx.playerY-220,ctx.playerY+48,u*u),p=prop(out,id,'slab',x,y,1,0,62,60,40,side*.14,.35,1-ramp(t,end,end+.3)),h=hazard(out,id,t<=end,false);circle(h,p.x,p.y,26);
 }
 function broken(t,out,ctx){begin(out,t,'broken',ctx);liftedLintel(out,ctx,t);row(out,ctx,'first-floor',t,2.14);diagonal(out,ctx,'rebound-a',t,4.66,1.26,-1);diagonal(out,ctx,'rebound-b',t,5.26,1.30,1,5);sweep(out,ctx,'sliding-base',t,6.66,1.18,-2,-1,{width:88});diagonal(out,ctx,'last-chip',t,7.38,1.20,-1,-4);row(out,ctx,'closing-fracture',t,9.24);return out;}
 function cross(t,out,ctx){begin(out,t,'cross',ctx);gate(out,ctx,'seal-lattice-a',t,1.68,.34,.70,.21);gate(out,ctx,'seal-lattice-b',t,3.18,1.64,1.38,-.21);gate(out,ctx,'seal-lattice-c',t,4.84,.52,1.08,.18);gate(out,ctx,'seal-lattice-d',t,6.52,1.68,1.34,-.24);sweep(out,ctx,'seal-crown',t,8.2,1.04,99,-1,{width:108});row(out,ctx,'seal-release',t,9.94);return out;}
 function returnPattern(t,out,ctx){begin(out,t,'return',ctx);const target=clamp(ctx.startLane??1,.60,1.40);returningSlab(out,ctx,'oath-right',t,{launch:1.65,target,side:1,backAt:4.03,catchAt:6.6,returnHeight:99});returningSlab(out,ctx,'oath-left',t,{launch:3.23,target:2-target,side:-1,backAt:6.14,catchAt:8.22,returnHeight:-1});return out;}
 function final(t,out,ctx){begin(out,t,'final',ctx);for(let i=0;i<4;i++)for(const side of [-1,1])edgeRain(out,ctx,'edge-'+side+'-'+i,t,2.05+i*1.72,side);gate(out,ctx,'inner-seal-a',t,2.95,.66,1.08,.17);gate(out,ctx,'inner-seal-b',t,4.54,1.45,1.08,-.17);returningSlab(out,ctx,'last-oath',t,{launch:6.28,target:1,side:1,backAt:8.13,catchAt:9.53,returnHeight:99,track:'final'});row(out,ctx,'final-fracture',t,10.67);return out;}
 const recipes=Object.freeze([
  {id:'broken_court',name:'KIRILAN AVLU',duration:11.1,sample:broken,problem:'landing and reversal'},
  {id:'crossed_seals',name:'CAPRAZ MUHURLER',duration:11.1,sample:cross,problem:'predict a moving corridor'},
  {id:'returning_oath',name:'GERI DONEN YEMIN',duration:10.5,sample:returnPattern,problem:'bait and remember the return'},
  {id:'last_oath',name:'SON YEMIN',duration:12.8,sample:final,problem:'learned motifs under spatial pressure'}
 ].map(Object.freeze));

 // Deliberate ashlar geometry, cached in object space. Broad unbroken faces,
 // chamfered corners, one recessed seal and a chipped corner; no triangle noise.
 const meshCache=new Map(),palette={slab:['#344b50','#68867e','#abb994'],ridge:['#314342','#617968','#9eab82'],shard:['#304c59','#5f8590','#a9bdaf']};
 function mesh(kind,variant){const key=kind+':'+variant;if(meshCache.has(key))return meshCache.get(key);const cut=kind==='ridge'?.19:.11,
  ring=[[-.5+cut,-.5],[.5-cut,-.5],[.5,-.5+cut],[.5,.5-cut],[.5-cut,.5],[-.5+cut,.5],[-.5,.5-cut],[-.5,-.5+cut]],
  lo=ring.map(([x,z])=>[x,-.5,z]),hi=ring.map(([x,z],i)=>[x*(kind==='ridge'?.82:1),.5-(i===(variant+1)%8?.10:0),z*(kind==='ridge'?.84:1)]),faces=[{v:hi,shade:2},{v:[...lo].reverse(),shade:0}];
  for(let i=0;i<8;i++)faces.push({v:[lo[i],lo[(i+1)%8],hi[(i+1)%8],hi[i]],shade:i<3?1:0});meshCache.set(key,faces);return faces;}
 function transform(p,v){const X=v[0]*p.w,Y=v[1]*p.h,Z=v[2]*p.d,cy=Math.cos(p.yaw),sy=Math.sin(p.yaw),rx=X*cy+Z*sy,rz=-X*sy+Z*cy,py=-Y*.96-rz*.28,cr=Math.cos(p.roll),sr=Math.sin(p.roll);return {x:p.x+(rx*cr-py*sr)*p.s,y:p.y+(rx*sr+py*cr)*p.s,depth:rz*.96-Y*.28};}
 function polygon(g,points,color){g.beginPath();for(let i=0;i<points.length;i++)i?g.lineTo(points[i].x,points[i].y):g.moveTo(points[i].x,points[i].y);g.closePath();g.fillStyle=color;g.fill();}
 function drawProp(g,p){if(p.alpha<=0)return;const colors=palette[p.kind]||palette.slab;g.save();g.globalAlpha*=p.alpha;
  const faces=mesh(p.kind,p.variant).map(f=>({shade:f.shade,v:f.v.map(v=>transform(p,v))})).sort((a,b)=>b.v.reduce((n,v)=>n+v.depth,0)/b.v.length-a.v.reduce((n,v)=>n+v.depth,0)/a.v.length);
  for(const f of faces)polygon(g,f.v,colors[f.shade]);
  if(p.kind==='slab'){
   polygon(g,[[-.28,.22,-.506],[.27,.22,-.506],[.27,-.22,-.506],[-.28,-.22,-.506]].map(v=>transform(p,v)),'#2c4244');
   polygon(g,[[-.19,.13,-.514],[.18,.13,-.514],[.18,-.13,-.514],[-.19,-.13,-.514]].map(v=>transform(p,v)),'#748d73');
   polygon(g,[[-.025,.14,-.52],[.025,.14,-.52],[.025,-.14,-.52],[-.025,-.14,-.52]].map(v=>transform(p,v)),'#c1bd83');
   polygon(g,[[-.12,.04,-.525],[.12,.04,-.525],[.12,-.015,-.525],[-.12,-.015,-.525]].map(v=>transform(p,v)),'#c1bd83');
  }g.restore();
 }
 function draw(g,pass,frame){if(!frame)return;g.save();
  if(pass==='back'){
   for(const q of frame.cues){g.globalAlpha=q.alpha;g.strokeStyle=q.tone==='high'?'#bfd9ba':q.tone==='seal'?'#b1ced1':'#dac47a';g.lineWidth=q.width;g.setLineDash([8,7]);g.beginPath();q.points.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.stroke();g.setLineDash([]);const p=q.points[0];g.fillStyle=g.strokeStyle;g.fillRect(p[0]-3,p[1]-3,6,6);}g.globalAlpha=1;
   // Grounded shadows are broad and quiet, not another animated particle layer.
   for(const p of frame.props)if(p.depth>-.1&&p.kind!=='shard'){g.globalAlpha=.12*p.alpha;g.fillStyle='#182c30';g.beginPath();g.ellipse(p.x,at(frame.ctx,1,0,p.depth).y+2,Math.max(3,p.w*p.s*.43),Math.max(2,p.d*p.s*.14),0,0,Math.PI*2);g.fill();}g.globalAlpha=1;
  }
  const items=frame.props.filter(p=>pass==='back'?p.depth>.35:p.depth<=.35).sort((a,b)=>b.depth-a.depth||a.y-b.y);
  for(const p of items)drawProp(g,p);g.restore();
 }
 return Object.freeze({recipes,tracks,poses,neutral:NEUTRAL,motionAt,actorPoint,draw,drawProp,mesh,meshStats:()=>({meshes:meshCache.size,maxMeshes:9})});
});
