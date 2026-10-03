/* Authored Oathkeeper laboratory moves. One clock drives poses and contacts.
 * No production imports, random timing, homing, rewards, or save access. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KROathkeeperMoves=api;})(globalThis,()=>{
 'use strict';
 const ORIGIN_Z=2.15,clamp=x=>Math.max(0,Math.min(1,x)),mix=(a,b,t)=>a+(b-a)*t,ease=x=>{x=clamp(x);return x*x*(3-2*x);},
  definitions=Object.freeze({
   slam:{name:'Ezici Yumruk',duration:2.8,tell:.88,activeEnd:1.36,impact:1.18,hint:'İşaretlenen şeritten çık · parry işlemez'},
   quake:{name:'Zemin Kıran',duration:3.4,tell:1.20,activeEnd:2.24,impact:1.20,hint:'İki yumruk inerken zıpla · parry işlemez'},
   throw:{name:'Taş Gülle',duration:3.2,tell:1.18,activeEnd:1.90861,impact:1.18,hint:'Gülleyi F ile savuştur veya şerit değiştir'}
  }),combo=[{id:'slam',at:0},{id:'throw',at:3.05},{id:'quake',at:6.50}],comboDuration=9.9;
 function duration(id){if(id==='combo')return comboDuration;if(!definitions[id])throw Error('Unknown Oathkeeper move');return definitions[id].duration;}
 function resolve(id,time,targetX=0){duration(id);if(!Number.isFinite(time)||!Number.isFinite(targetX))throw Error('Invalid move sample');
  const t=Math.max(0,time),target=Math.max(-2,Math.min(2,targetX));
  if(id==='combo'){const slot=combo.find(s=>t>=s.at&&t<s.at+duration(s.id));return slot?resolve(slot.id,t-slot.at,target):null;}
  if(t>=duration(id))return null;const d=definitions[id];return {id,time:t,targetX:target,side:target<0?-1:1,phase:t<d.tell?'Hazırlık':t<d.activeEnd?'Darbe':'Toparlanma',...d};
 }
 // The wrist targets are absolute model coordinates; the two-bone solver never
 // stretches to reach them. Small torso yaw keeps all tells front/side-readable.
 function motion(a){if(!a)return null;const s=a.side,x=a.targetX;
  const neutral={crouch:0,lean:.035,twist:0,shift:0,left:[-2,1.63,-.18],right:[2,1.63,-.18],pitch:.05,grip:0};
  const frame=(t,body,attack,other,pitch=0,grip=1)=>({t,...neutral,...body,[s<0?'left':'right']:attack,[s<0?'right':'left']:other,pitch,grip});
  let keys;
  if(a.id==='slam')keys=[{t:0,...neutral},
   frame(.27,{crouch:-.06,lean:.04,twist:-s*.08},[s*2.40,3.30,-1.40],[-s*2,1.75,-.24],1.2),
   frame(.52,{crouch:-.10,lean:.06,twist:-s*.18},[s*2.10,4.80,-1.05],[-s*2,1.85,-.3],2.2),
   frame(.88,{crouch:-.12,lean:.10,twist:-s*.24,shift:x*.12},[s*1.45,5.50,.18],[-s*2.1,2.15,-.45],2.95),
   frame(1.02,{crouch:-.48,lean:-.12,twist:s*.12,shift:x*.22},[s*2.15+x*.18,3.65,-1.90],[-s*2.05,1.9,-.45],1.3),
   frame(1.18,{crouch:-1.10,lean:-.36,twist:s*.48,shift:x*.30-s*.12},[x,.64,-2.22],[-s*2.0,1.6,-.45],0),
   frame(1.38,{crouch:-1.10,lean:-.36,twist:s*.48,shift:x*.30-s*.12},[x,.64,-2.22],[-s*2.0,1.6,-.45],0),
   frame(1.85,{crouch:-.48,lean:-.14,twist:s*.22,shift:x*.12},[x,1.25,-1.55],[-s*2,1.65,-.18],.2),
   {t:2.8,...neutral}];
  if(a.id==='quake')keys=[{t:0,...neutral},
   {t:.30,...neutral,crouch:-.06,lean:.04,left:[-2.40,3.30,-1.40],right:[2.40,3.30,-1.40],pitch:1.2,grip:1},
   {t:.60,...neutral,crouch:-.1,lean:.08,left:[-2.10,4.80,-1.05],right:[2.10,4.80,-1.05],pitch:2.2,grip:1},
   {t:1.0,...neutral,crouch:-.16,lean:.12,left:[-1.45,5.25,.22],right:[1.45,5.25,.22],pitch:3.0,grip:1},
   {t:1.09,...neutral,crouch:-.44,lean:-.10,left:[-2.2,3.50,-1.85],right:[2.2,3.50,-1.85],pitch:1.2,grip:1},
   {t:1.20,...neutral,crouch:-.96,lean:-.35,left:[-1.75,.64,-1.35],right:[1.75,.64,-1.35],pitch:0,grip:1},
   {t:1.50,...neutral,crouch:-.96,lean:-.35,left:[-1.75,.64,-1.35],right:[1.75,.64,-1.35],pitch:0,grip:1},
   {t:2.25,...neutral,crouch:-.5,lean:-.15,left:[-2,1.15,-.65],right:[2,1.15,-.65],pitch:.2,grip:.5},{t:3.4,...neutral}];
  if(a.id==='throw')keys=[{t:0,...neutral},
   frame(.40,{crouch:-.9,lean:-.20,twist:s*.12},[s*2,.98,-.40],[-s*2,1.9,-.3],-.15,.5),
   frame(.66,{crouch:-.35,lean:.02,twist:-s*.08},[s*2.45,3.20,-1.45],[-s*2,2,-.35],1.25,.85),
   frame(.88,{crouch:-.10,lean:.10,twist:-s*.20},[s*1.7,4.45,.35],[-s*2,2.15,-.4],2.55,.85),
   frame(1.06,{crouch:-.08,lean:.08,twist:-s*.18},[s*1.6,4.50,.4],[-s*2,2.2,-.4],2.55,.85),
   frame(1.115,{crouch:-.12,lean:-.04,twist:s*.04},[s*2.0,4.0,-1.35],[-s*2,2.1,-.3],1.8,.65),
   frame(1.18,{crouch:-.18,lean:-.16,twist:s*.24},[s*.85,3.10,-1.65],[-s*2,2.0,-.2],1.4,.15),
   frame(1.48,{crouch:-.20,lean:-.19,twist:s*.28},[s*.65,2.75,-1.8],[-s*2,1.8,-.1],1.1,0),
   {t:3.2,...neutral}];
  const i=Math.max(1,keys.findIndex(k=>k.t>=a.time)),lo=keys[i-1],hi=keys[i],u=ease((a.time-lo.t)/(hi.t-lo.t)),out={};
  for(const key of Object.keys(neutral))out[key]=Array.isArray(lo[key])?lo[key].map((v,i)=>mix(v,hi[key][i],u)):mix(lo[key],hi[key],u);return out;
 }
 function point(p,side,offset=[0,-.30,-.10],space=null){const v=p.handPoint(side,offset);return space?space.point(v):{x:v[0],y:v[1],z:v[2]+ORIGIN_Z};}
 function hazards(a,pose,space=null){if(!a)return [];const t=a.time,p=pose(7,a);
  if(a.id==='slam')return [{kind:'fist',index:0,radius:space?space.radius(.60):.60,parryable:false,activeStart:.94,activeEnd:1.36,position:point(p,a.side,undefined,space)}];
  if(a.id==='quake'){const impact=pose(7,{...a,time:1.20}),z=(point(impact,-1,undefined,space).z+point(impact,1,undefined,space).z)/2-3.1*(t-1.20);return [-2.4,-1.2,0,1.2,2.4].map((x,index)=>({kind:'wave',index,radius:.35,parryable:false,activeStart:1.20,activeEnd:2.24,position:{x,y:.29,z}}));}
  const radius=space?space.radius(.68):.68,offset=[0,-.18,-.65],release=point(pose(7,{...a,time:1.18}),a.side,offset,space),flight=Math.max(0,t-1.18),hitTime=.62,g=5,
   vy=(1.3-release.y+.5*g*hitTime*hitTime)/hitTime;
  const position=t<1.18?point(p,a.side,offset,space):{x:release.x+(a.targetX-release.x)*flight/hitTime,y:release.y+vy*flight-.5*g*flight*flight,z:release.z*(1-flight/hitTime)};
  const activeEnd=1.18+(vy+Math.sqrt(vy*vy+2*g*(release.y-radius)))/g;
  return [{kind:'rock',index:0,radius,parryable:true,activeStart:1.18,activeEnd,position,visualScale:space?.visualScale||1,heldUnit:t<1.18?space?.heldUnit:null}];
 }
 function sequence(id,targetX,pose,space=null){const slots=id==='combo'?combo:[{id,at:0}],events=[];
  for(const slot of slots){const d=duration(slot.id),sample=t=>hazards(resolve(slot.id,Math.min(t,d-1e-8),targetX),pose,space),first=sample(0);
   for(const h of first){const times=new Set([0,d,h.activeStart,h.activeEnd,definitions[slot.id].impact]);for(let t=1/24;t<d;t+=1/24)times.add(Math.round(t*1e8)/1e8);
    if(slot.id==='slam'){for(const t of [.27,.52,.88,1.02,1.38,1.85])times.add(t);for(let i=Math.ceil(h.activeStart*120);i<h.activeEnd*120;i++)times.add(Math.round(i/120*1e8)/1e8);}
    const path=[...times].sort((a,b)=>a-b).map(t=>({t,...sample(t)[h.index].position}));events.push({at:slot.at,volume:{label:`oath:${slot.id}:${h.index}`,radius:h.radius,duration:d,activeStart:h.activeStart,activeEnd:h.activeEnd,parryable:h.parryable,path}});
   }
  }return {id:'oath:'+id,duration:duration(id),events};
 }
 return Object.freeze({ORIGIN_Z,definitions,combo,duration,resolve,motion,hazards,sequence});
});
