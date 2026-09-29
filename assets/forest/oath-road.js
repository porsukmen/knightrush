/* Forgotten Oath — live road/event, not an approved visual reference.
   Native planes only. Route/planting own placement; no per-frame RNG or textures. */
(()=>{
 'use strict';
 const P=expPoly,R=expRect,L=expSegment,layouts=new WeakMap(),sites=new WeakMap();
 const C={stone:'#b8ae80',light:'#ded0a0',side:'#7c795a',deep:'#4d5740',
  moss:'#568731',leaf:'#8fb642',cloth:'#a43c4c',fold:'#672d40',hem:'#ddb359',wood:'#75512f'};
 const art=new Map();
 function shape(id,color,points){
  const path=new Path2D();points.forEach(([x,y],i)=>i?path.lineTo(x,y):path.moveTo(x,y));path.closePath();
  if(!art.has(id))art.set(id,[]);art.get(id).push({path,color});
 }
 const rect=(id,c,x,y,w,h)=>shape(id,c,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]);
 // Carved armour fragments: broad squared masses, no new living NPC design.
 shape('statue',C.deep,[[-37,2],[-30,-10],[29,-10],[39,2],[20,9],[-25,8]]);
 shape('statue',C.side,[[-31,0],[-31,-14],[25,-14],[34,-6],[34,2],[-22,5]]);
 shape('statue',C.light,[[-31,-14],[-23,-22],[25,-22],[34,-14],[23,-9],[-23,-9]]);
 shape('statue',C.stone,[[-22,-21],[-29,-55],[-25,-77],[-10,-84],[1,-78],[14,-84],[27,-71],[23,-21]]);
 shape('statue',C.side,[[10,-80],[27,-71],[23,-21],[5,-21],[10,-48]]);
 shape('statue',C.light,[[-29,-55],[-25,-77],[-10,-84],[-9,-66],[-17,-56]]);
 shape('statue',C.deep,[[-9,-80],[-2,-87],[9,-83],[14,-78],[5,-74],[-4,-74]]);
 shape('statue',C.stone,[[-27,-73],[-42,-69],[-43,-55],[-28,-50],[-19,-57]]);
 shape('statue',C.light,[[-42,-69],[-28,-77],[-19,-69],[-27,-63],[-42,-63]]);
 shape('statue',C.side,[[22,-74],[37,-67],[40,-56],[27,-51],[18,-58]]);
 // Broken shield still attached at the breast, with a single carved chevron.
 shape('statue',C.side,[[-21,-57],[3,-58],[11,-47],[5,-29],[-8,-22],[-23,-37]]);
 shape('statue',C.light,[[-19,-55],[2,-55],[7,-46],[0,-33],[-9,-27],[-20,-39]]);
 shape('statue',C.stone,[[-16,-52],[-2,-52],[4,-45],[-9,-34],[-17,-41]]);
 shape('statue',C.side,[[-16,-48],[-8,-42],[0,-49],[0,-43],[-8,-37],[-16,-43]]);
 shape('statue',C.moss,[[-31,-14],[-21,-19],[-8,-16],[-11,-10],[-23,-9],[-23,-4],[-30,-3]]);
 shape('statue',C.leaf,[[-29,-15],[-22,-18],[-13,-16],[-19,-12],[-29,-11]]);
 shape('statue',C.moss,[[12,-83],[23,-77],[22,-71],[14,-74],[10,-71],[7,-77]]);
 // A supported, timeworn banner; folds are broad, not a noisy cloth texture.
 shape('banner',C.deep,[[-14,1],[-8,-4],[9,-3],[17,3],[-4,6]]);
 rect('banner',C.wood,-3,-113,6,115);rect('banner','#b99251',-3,-111,2,106);
 shape('banner',C.hem,[[-6,-114],[0,-126],[6,-114],[0,-108]]);
 rect('banner',C.wood,-5,-108,42,5);
 shape('banner',C.fold,[[4,-102],[37,-102],[36,-58],[29,-62],[26,-50],[16,-57],[4,-53]]);
 shape('banner',C.cloth,[[4,-102],[27,-102],[26,-58],[16,-61],[5,-57]]);
 rect('banner',C.hem,7,-99,2,36);rect('banner',C.hem,7,-99,24,2);
 shape('banner',C.hem,[[17,-91],[24,-84],[17,-72],[13,-76],[18,-84],[13,-88]]);
 // Helmet and a snapped, rusty blade half-buried in the grass.
 shape('relics',C.deep,[[-31,1],[-17,-9],[27,-6],[34,2],[9,7],[-21,5]]);
 shape('relics','#64776c',[[-22,0],[-23,-19],[-17,-27],[-2,-26],[5,-18],[3,0]]);
 shape('relics','#acb7a0',[[-23,-19],[-17,-27],[-2,-26],[-3,-18]]);
 shape('relics','#3d524a',[[-3,-18],[5,-18],[3,0],[-4,-1]]);
 rect('relics','#283d38',-19,-14,15,3);rect('relics','#a86833',-12,-26,3,8);
 shape('relics','#8e5932',[[12,0],[8,-29],[13,-37],[16,-32],[18,-35],[20,-1]]);
 shape('relics','#c09959',[[8,-29],[13,-37],[14,-14],[11,-14]]);
 shape('relics',C.moss,[[-27,-2],[-22,-7],[-13,-4],[-11,1],[4,1],[4,5],[-21,4]]);
 // Low rectangular fallen column. Its end rings clarify jump-height stone.
 shape('column',C.deep,[[-43,1],[-36,-7],[35,-7],[44,1],[32,6],[-33,6]]);
 shape('column',C.stone,[[-40,-5],[-40,-19],[-30,-29],[30,-29],[40,-20],[40,-5]]);
 shape('column',C.light,[[-40,-19],[-30,-29],[30,-29],[40,-20],[-29,-20]]);
 shape('column',C.side,[[28,-20],[40,-20],[40,-5],[28,-5]]);
 for(const x of [-33,23]){rect('column',C.side,x,-20,7,15);rect('column',C.light,x,-24,7,4);}
 shape('column',C.moss,[[-22,-29],[-8,-29],[-2,-25],[5,-25],[4,-21],[-13,-21],[-19,-17],[-24,-20]]);
 shape('column',C.leaf,[[-22,-29],[-8,-29],[-3,-26],[-15,-25],[-20,-22]]);
 shape('stone',C.deep,[[-63,3],[-48,-9],[43,-12],[66,4],[30,14],[-42,11]]);
 shape('stone',C.stone,[[-51,0],[-57,-30],[-38,-57],[-11,-63],[27,-60],[49,-40],[56,-5],[29,5],[-31,7]]);
 shape('stone',C.light,[[-57,-30],[-38,-57],[-11,-63],[27,-60],[13,-40],[-12,-34]]);
 shape('stone',C.side,[[13,-40],[27,-60],[49,-40],[56,-5],[29,5],[8,-10]]);
 shape('stone',C.deep,[[-7,-53],[1,-57],[11,-49],[4,-40],[-4,-43]]);
 shape('stone',C.moss,[[-51,0],[-54,-15],[-44,-19],[-33,-12],[-21,-11],[-18,3],[-31,7]]);
 shape('stone',C.leaf,[[-51,-6],[-48,-15],[-39,-15],[-33,-10],[-39,-5]]);
 // Road marker only; final blade identity/artifact art belongs to the event.
 shape('stone','#8b9b99',[[-4,-48],[-5,-104],[4,-107],[6,-47],[1,-42]]);
 shape('stone','#e0e6c8',[[-5,-104],[-1,-106],[-1,-46],[-4,-48]]);
 rect('stone','#9d7535',-19,-108,38,6);rect('stone','#e5c263',-19,-108,38,2);
 rect('stone','#65432e',-4,-128,8,21);rect('stone','#b99747',-6,-134,12,7);
 const paint=(id)=>{for(const plane of art.get(id)||[]){g.fillStyle=plane.color;g.fill(plane.path);}};
 function site(edge){
  if(sites.has(edge))return sites.get(edge);
  const slot=edge.events.find(e=>e.definition==='sword_clearing');if(!slot)return null;
  const at=slot.at+8,clearances=[];
  for(const z of [-12,-5,3,11])for(const x of [-10,-7,7,10])clearances.push({at:at+z,offset:x});
  const s={at,slotId:slot.id,clearances};sites.set(edge,s);return s;
 }
 function layout(edge){
  if(layouts.has(edge))return layouts.get(edge);
  const rnd=journeyRandom(journeyKeySeed(journeyRoute.seed,'forgotten-oath:'+edge.id)),list=[],s=site(edge),
   pieces=edge.pieces.filter(p=>p.theme==='oath'),start=pieces[0]?.start??edge.pieces[0].start,end=pieces.at(-1)?.end??edge.pieces.at(-1).end;
  for(const side of [-1,1])for(let at=start+6+rnd()*17;at<end-15;at+=27+rnd()*20){
   if(s&&Math.abs(at-s.at)<32)continue;
   list.push({at,offset:side*(7.9+rnd()*1.6),kind:['banner','relics','statue','column'][list.length%4],size:.85+rnd()*.22,side});
  }
  layouts.set(edge,list);return list;
 }
 function floorDetails(view,row,a,b,edge,routeA){
  const out=[],pieces=edge.pieces.filter(p=>p.theme==='oath');if(!pieces.length)return out;
  const lo=Math.max(a,a+pieces[0].start-routeA),hi=Math.min(b,a+pieces.at(-1).end-routeA);if(hi<=lo)return out;
  const shape=(v,color)=>out.push({color,caravanGround:true,stableCurve:true,vertices:v.map(([x,z])=>view.point(z,x))});
  const s=site(edge),mid=routeA+(b-a)/2;
  // A round ground-plane clearing, built row by row in the existing floor cache.
  if(s&&Math.abs(mid-s.at)<11){
   const radius=z=>Math.sqrt(Math.max(0,121-(routeA+z-a-s.at)**2));
   const l=Math.max(lo,a+s.at-11-routeA),h=Math.min(hi,a+s.at+11-routeA);
   shape([[-radius(l),l],[radius(l),l],[radius(h),h],[-radius(h),h]],'#728347');
   if(radius((l+h)/2)>2)shape([[-radius(l)*.89,l],[radius(l)*.89,l],[radius(h)*.89,h],[-radius(h)*.89,h]],'#baa56b');
  }
  const progress=clamp(Math.min(mid-pieces[0].start,pieces.at(-1).end-mid)/32,0,1);
  for(let col=0;col<3;col++){
   const id=Math.abs(row*29+col*13),n=sRnd(id+923),x=-5.55+col*3.72+(n-.5)*.42,
    w=3.2+n*.32,z0=Math.max(lo,row*4+.18+n*.2),z1=Math.min(hi,row*4+3.6-n*.3);
   if(z1<=z0||n>progress*.83+.12)continue;
   const c=.24+n*.22;
   shape([[x+c,z0],[x+w-c,z0],[x+w,z0+c],[x+w,z1-c],[x+w-c,z1],[x+c,z1],[x,z1-c],[x,z0+c]],'#628139');
   shape([[x+c+.08,z0+.08],[x+w-c,z0+.08],[x+w-.15,z0+c],[x+w-.18,z1-c],[x+w-c-.1,z1-.16],[x+c,z1-.18],[x+.12,z1-c],[x+.12,z0+c]],['#b2ac7c','#c5b788','#a5a374'][id%3]);
   if(id%3===0)shape([[x+.25,z0+c],[x+.65,z0+.12],[x+1.2,z0+.13],[x+.82,z0+.35],[x+.53,z0+.56],[x+.17,z0+.52]],C.leaf);
  }
  return out;
 }
 function prop(item){
  if(item.slotId&&!journeyVenueVisible(item.slotId))return;
  const p=journeyDecorProjection(item);if(!p)return;
  const scale=p.scale*(item.size||1)*1.45;
  if(p.x+80*scale<0||p.x-80*scale>VW)return;
  g.save();g.globalAlpha=p.alpha;
  g.beginPath();g.rect(-VW*4,-PAD_TOP-6000,VW*9,curvedSpriteClipY(p.z)+PAD_TOP+6000);g.clip();
  g.translate(p.x,p.y);g.scale(scale*(item.kind==='banner'&&item.side<0?-1:1),scale);paint(item.kind);g.restore();
 }
 function queueView(view){
  const enqueue=item=>{const p=view.point(item.at,item.offset),cam=journeyCameraPoint(p.x,p.z);
   if(cam.depth>-12&&cam.depth<SPAWN_FAR)queueWorldDraw(cam.depth,prop,{...p,...item});};
  if(view.spill){enqueue({at:view.begin+42.5,offset:view.onlySide*8,kind:'column',size:.85});return;}
  for(const item of layout(view.edge))enqueue(item);
  const s=site(view.edge);if(!s||!journeyVenueVisible(s.slotId))return;
  if(journeyRoadEventSession?.slot.id!==s.slotId)
    enqueue({at:s.at,offset:0,kind:'stone',size:1.7,slotId:s.slotId});
  for(const side of [-1,1])enqueue({at:s.at+4,offset:side*8.4,kind:'statue',size:2.2,slotId:s.slotId});
 }
 function hazard(o,point){
  const project=x=>{const w=point(0,x),c=journeyCameraPoint(w.x,w.z),q=journeyProjectCamera(c.side,c.depth);
   return {...q,depth:c.depth,u:150/JOURNEY_LANE_WORLD*linS(q.t)};};
  const p=project(0);if(p.depth<=sceneryNearLimit())return true;
  g.save();g.beginPath();g.rect(-VW*4,-PAD_TOP-6000,VW*9,curvedSpriteClipY(p.depth)+PAD_TOP+6000);g.clip();
  if(o.kind==='root'){
   for(const group of obstacleLaneGroups(o.lanes)){
    const l=project((group.start-1)*JOURNEY_LANE_WORLD-1.68),r=project((group.end-1)*JOURNEY_LANE_WORLD+1.68);
    const v=(t,h)=>[lerp(l.x,r.x,t),lerp(l.y,r.y,t)-h*lerp(l.u,r.u,t)];
    for(const t of [0,1]){
     const q=t?r:l,x=q.x,y=q.y,u=q.u;
     P([[x-.15*u,y],[x-.21*u,y-3.45*u],[x+.12*u,y-3.57*u],[x+.22*u,y],[x-.15*u,y]],C.side);
     P([[x-.15*u,y],[x-.21*u,y-3.45*u],[x-.06*u,y-3.5*u],[x+.02*u,y]],C.light);
    }
    P([v(0,3.35),v(1,3.45),v(1,3.13),v(0,3.04)],C.wood);
    P([v(0,3.35),v(1,3.45),v(1,3.34),v(0,3.24)],'#ba9857');
    P([v(.04,3.04),v(.95,3.13),v(.95,2.08),v(.79,2.2),v(.74,1.98),v(.55,2.11),v(.39,2.01),v(.2,2.15),v(.04,2.05)],C.fold);
    P([v(.04,3.04),v(.72,3.1),v(.70,2.1),v(.55,2.11),v(.39,2.01),v(.2,2.15),v(.04,2.05)],C.cloth);
    P([v(.08,2.92),v(.91,3),v(.91,2.93),v(.08,2.85)],C.hem);
   }
  }else for(const lane of o.lanes){
   const q=project((lane-1)*JOURNEY_LANE_WORLD);g.save();g.translate(q.x,q.y);g.scale(q.u/24,q.u/24);
   paint(o.kind==='statue'?'statue':'column');g.restore();
  }
  g.restore();return true;
 }
 window.KROathRoad={layout,site,floorDetails,queueView,hazard,paint,colors:C};
})();
