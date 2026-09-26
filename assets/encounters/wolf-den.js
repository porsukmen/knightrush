/* Wolf Den: approved native wolf renderer, scene-local poses/materials.
   No rejected event model is a style source. No runtime bitmap actor copies. */
(()=>{
 'use strict';
 const palettes={
  outside:{'#8b8fa0':'#979aa8','#5d6070':'#606878','#aeb2c2':'#d1cdbb','#8f8d88':'#d5ccb6',
   '#6d7280':'#828996','#4d5160':'#515c6d','#8a8fa0':'#bbbeb9'},
  inside:{'#8b8fa0':'#8994a8','#5d6070':'#4d5d76','#aeb2c2':'#c1c7cd','#8f8d88':'#c4bfac',
   '#6d7280':'#748197','#4d5160':'#4b596f','#8a8fa0':'#a7b6c7'},
  pup:{'#8b8fa0':'#b1bac7','#5d6070':'#798a9e','#aeb2c2':'#e0dacc','#8f8d88':'#ded5c2',
   '#7a2020':'#b1bac7','#ffd23a':'#242c39','#4a3438':'#aab6c6','#1b1a20':'#303440',
   '#6d7280':'#a1adbf','#4d5160':'#76859c','#8a8fa0':'#d3d3cd'}
 };
 const contexts={outside:new WeakMap(),inside:new WeakMap(),pup:new WeakMap()};
 function litContext(target,kind){
  const cache=contexts[kind];if(cache.has(target))return cache.get(target);
  const methods=new Map(),proxy=new Proxy(target,{
   get(o,k){const v=Reflect.get(o,k,o);if(typeof v!=='function')return v;if(!methods.has(k))methods.set(k,v.bind(o));return methods.get(k);},
   set(o,k,v){return Reflect.set(o,k,k==='fillStyle'?(palettes[kind][v]??v):kind==='pup'&&k==='shadowBlur'?0:v,o);}
  });cache.set(target,proxy);return proxy;
 }
 function lighting(kind,fn){const original=g;original.save();try{g=litContext(original,kind);fn();}finally{g=original;original.restore();}}
 function shadow(x,y,s){g.save();g.fillStyle='rgba(31,35,45,.24)';g.beginPath();g.ellipse(x+3*s,y+2*s,23*s,5*s,0,0,Math.PI*2);g.fill();g.restore();}
 function combat(x,y,s,anim,t,hurt,contacts){lighting('inside',()=>drawWolf(x,y,s,anim,t,hurt,contacts));}
 function adult(x,y,s=1,t=0,inside=false){
  shadow(x,y,s);
  const snarl=Math.sin(t*.65)>.92;
  lighting(inside?'inside':'outside',()=>drawWolf(x,y,s,snarl?'tele_wolf_bite':'idle',snarl?.2:0,false));
 }
 // Authored directional drawings, selected as animation frames. No 3D yaw.
 function wolf(x,y,s=1,stand=0,turn=0,t=0,moving=false,inside=false,neutral=false){
  shadow(x,y,s);
  const draw=()=>{g.translate(x,y);
   if(window.KRWolfDenPoses)KRWolfDenPoses.draw(s,stand,turn,t,moving);
   else drawWolf(0,0,s,'idle',0,false);
  };
  if(neutral){g.save();try{draw();}finally{g.restore();}}
  else lighting(inside?'inside':'outside',draw);
 }
 function pup(x,y,s=1,t=0,back=false,moving=false,eating=false,groundY=y){
  shadow(x,groundY,s*.75);
  lighting('pup',()=>{g.translate(x,y);
   if(window.KRWolfDenPoses)KRWolfDenPoses.pup(s,t,back,moving,eating);
   else drawWolf(0,0,s*.68,'idle',0,false);
  });
 }
 // Authored from the actual path on the unchanged generated woodland plate.
 // All control points are walkable earth; the old straight line crossed shrubs.
 const trail=[[229,572],[231,515],[236,470],[274,433],[333,413],
  [374,391],[360,371],[366,352],[374,340]];
 function pathAt(u){
  const q=clamp(u,0,.999999)*(trail.length-1),i=Math.floor(q),t=q-i;
  const p0=trail[Math.max(0,i-1)],p1=trail[i],p2=trail[i+1],p3=trail[Math.min(trail.length-1,i+2)];
  const calc=k=>.5*((2*p1[k])+(-p0[k]+p2[k])*t+
   (2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t*t+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t*t*t);
  const deriv=k=>.5*((-p0[k]+p2[k])+2*(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t+
   3*(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t*t);
  return {x:calc(0),y:calc(1),yaw:-Math.PI-Math.atan2(deriv(0),-deriv(1)),
   scale:lerp(1.48,.12,u)};
 }
 const departureTiming=Object.freeze({turnAt:2.1,turnDuration:.24,walkAt:2.34,walkDuration:5.4,end:7.79});
 function departure(t){
  const rise=easeInOut(clamp((t-1.2)/.9,0,1)),turn=clamp((t-departureTiming.turnAt)/departureTiming.turnDuration,0,1);
  const walk=clamp((t-departureTiming.walkAt)/departureTiming.walkDuration,0,1),p=pathAt(walk);
  return {...p,rise,turn,walk,yaw:walk?p.yaw:pathAt(0).yaw*turn};
 }
 function meat(x,y,s=1,bites=0){
  g.save();g.translate(x,y);g.scale(s,s);
  // Thick steak resting flat: cream fat cap, red cut surface and a broad dark
  // side. No drumstick bone or concentric icon rings.
  shadow(0,6,1.1);
  const outline=[[-29,-5],[-24,-13],[-11,-18],[6,-17],[23,-9],[28,0],[24,10],[10,16],[-9,14],[-25,7]];
  expPoly(outline.map(([x,y])=>[x,y+5]),'#7e202d');
  expPoly(outline,'#f0d5c6');
  expPoly([[-24,-5],[-20,-11],[-9,-14],[6,-13],[20,-7],[23,0],[19,7],[8,11],[-8,10],[-20,5]],'#ca303e');
  expPoly([[-20,-10],[-9,-14],[6,-13],[20,-7],[12,-5],[2,-8],[-10,-7]],'#ed5961');
  expPoly([[-20,5],[-8,10],[8,11],[19,7],[23,0],[13,3],[4,6],[-9,5]],'#a51d31');
  expPoly([[-9,-13],[-5,-6],[-9,0],[-4,8],[-1,8],[-5,0],[-2,-6],[-6,-13]],'#f3d9cd');
  expPoly([[6,-11],[3,-4],[9,0],[14,-1],[10,-3],[7,-4],[9,-9]],'#f1c8c0');
  if(bites>0){
   expPoly([[18,-8],[23,-2],[15,2],[11,-2]],'#783d3b');
  }
  g.restore();
 }
 function tracks(){
  for(let i=0;i<8;i++){
   // The ink toes point up (-Y); canvas rotation is opposite to model yaw.
   const u=.1+i*.095,p=pathAt(u),s=lerp(.95,.3,u),angle=-(p.yaw+Math.PI);
   g.save();g.translate(p.x+(i%2?4:-4)*s,p.y);g.rotate(angle);g.scale(s,s*.62);
   expPoly([[-4,1],[-2,-2],[2,-2],[4,1],[3,5],[-3,5]],'#846845');
   for(const [a,b]of[[-5,-4],[-2,-6],[2,-6],[5,-4]])expPoly([[a-1,b],[a,b-2],[a+2,b-1],[a+1,b+2],[a-1,b+2]],'#947650');
   g.restore();
  }
 }
 function feedingPup(t,fed=true){
  // Out of the attack lanes, feet on the left cave floor, muzzle over steak.
  pup(78,490,.80,t,false,false,fed);
  if(fed)meat(78,494,.27,1);
 }
 function drawPlate(id){
  const image=window.KREventVisuals?.peek(id);if(!image)return false;
  g.save();try{g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(image,0,-PAD_TOP,480,800+PAD_TOT);}finally{g.restore();}return true;
 }
 for(const [symbol,id]of[['KRWolfDenForest','wolf-den-forest'],['KRWolfDenOutside','wolf-den-outside'],['KRWolfDenInside','wolf-den-inside']])
  window[symbol]=Object.freeze({assetId:id,drawCutscene:()=>drawPlate(id)});
 window.KRWolfDen=Object.freeze({wolf,adult,pup,meat,tracks,combat,palettes,departure,pathAt,feedingPup,departureTiming});
})();
