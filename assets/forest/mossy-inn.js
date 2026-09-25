/* Mossy Oak Inn candidate. Road models are native world geometry; only the
   fixed-camera interior uses a managed generated plate. No second render loop. */
(()=>{
 'use strict';if(window.KRMossyInn)return;
 const P=expPoly,R=expRect,L=expSegment,layouts=new WeakMap(),sites=new WeakMap();
 const mesh=()=>({vertices:[],faces:[],screen:[]});
 function face(m,pts,color){const ids=pts.map(p=>{m.vertices.push(p);m.screen.push([0,0,0]);return m.vertices.length-1;});m.faces.push({ids,color,depth:0});}
 function box(m,x,y,z,w,h,d,c){
  face(m,[[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z]],c[0]);
  face(m,[[x,y,z+d],[x,y,z],[x,y+h,z],[x,y+h,z+d]],c[1]);
  face(m,[[x+w,y,z],[x+w,y,z+d],[x+w,y+h,z+d],[x+w,y+h,z]],c[2]||c[1]);
  face(m,[[x,y+h,z],[x+w,y+h,z],[x+w,y+h,z+d],[x,y+h,z+d]],c[3]||c[0]);
 }
 const timber=['#62472e','#987047','#493c2b','#bf945a'],stone=['#7d8271','#a4a58a','#566256','#c0baa0'];
 function drawMesh(m,point){
  let clip=-Infinity;
  for(let i=0;i<m.vertices.length;i++){
   const [x,h,z]=m.vertices[i],w=point(z,x),c=journeyCameraPoint(w.x,w.z);
   if(c.depth<=sceneryNearLimit())return;
   const p=journeyProjectCamera(c.side,c.depth),s=m.screen[i];
   s[0]=p.x;s[1]=p.y-h*150/JOURNEY_LANE_WORLD*linS(p.t);s[2]=c.depth;
   clip=Math.max(clip,curvedSpriteClipY(c.depth));
  }
  for(const f of m.faces)f.depth=f.ids.reduce((n,i)=>n+m.screen[i][2],0)/f.ids.length;
  m.faces.sort((a,b)=>b.depth-a.depth);
  g.save();g.beginPath();g.rect(-VW*4,-PAD_TOP-6000,VW*9,clip+PAD_TOP+6000);g.clip();
  for(const f of m.faces){g.beginPath();f.ids.forEach((id,i)=>{const p=m.screen[id];i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]);});g.closePath();g.fillStyle=f.color;g.fill();}
  g.restore();
 }
 const house=mesh();
 // Ridge, walls, windows and porch use one shared physical building frame.
 box(house,0,0,0,9,1.4,11,stone);
 box(house,0,1.4,0,9,5.2,11,['#e0c594','#c1b58b','#927d60','#e7d2ab']);
 for(const z of [0,5.5,10.7])box(house,-.08,1.3,z,.26,5.45,.28,timber);
 for(const x of [0,4.3,8.72])box(house,x,1.3,-.12,.28,5.45,.24,timber);
 for(const h of [1.4,3.9,6.3]){
  box(house,-.13,h,-.14,9.3,.23,.24,timber);box(house,-.13,h,0,.24,.23,11,timber);
 }
 face(house,[[0,6.6,0],[9,6.6,0],[4.5,9.4,0]],'#d5c5a0');
 face(house,[[-.6,6.45,-.65],[4.5,9.5,-.65],[4.5,9.5,11.6],[-.6,6.45,11.6]],'#a95c40');
 face(house,[[4.5,9.5,-.65],[9.6,6.45,-.65],[9.6,6.45,11.6],[4.5,9.5,11.6]],'#713c32');
 box(house,4.34,6.6,-.14,.32,2.7,.2,timber);
 // Broad roof courses, not a noisy texture.
 for(let i=1;i<5;i++){
  const x=-.6+i*1.02,y=6.45+i*.61;
  face(house,[[x,y+.025,-.66],[x+.045,y+.052,-.66],[x+.045,y+.052,11.61],[x,y+.025,11.61]],'#874735');
 }
 box(house,6.4,6.9,7,1.15,3,1.25,stone);box(house,6.2,9.65,6.8,1.55,.35,1.65,stone);
 // Front windows; left long wall faces the road and contains the entrance.
 for(const x of [1.25,5.7])for(const h of [2,4.5]){
  box(house,x-.12,h-.1,-.22,1.85,1.45,.2,timber);
  face(house,[[x,h,-.23],[x+1.6,h,-.23],[x+1.6,h+1.2,-.23],[x,h+1.2,-.23]],'#e7b65e');
  box(house,x+.73,h,-.25,.12,1.2,.05,timber);box(house,x,h+.57,-.25,1.6,.1,.05,timber);
  box(house,x-.22,h-.18,-.5,2.03,.18,.45,timber);
 }
 // Timber braces explain the frame; stone courses and moss establish scale.
 for(const x of [.4,4.8]){
  face(house,[[x,4.18,-.16],[x+.25,4.18,-.16],[x+1.5,6.32,-.16],[x+1.25,6.32,-.16]],'#735033');
  box(house,x+.7,3.65,-.65,2.3,.38,.6,timber);
  for(const dx of [.8,1.5,2.1])box(house,x+dx,4,-.55,.46,.26,.33,['#8ba352','#b6c56a','#486447']);
 }
 for(const h of [.42,.9])box(house,0,h,-.035,9,.045,.05,['#5c695d','#5c695d','#5c695d']);
 for(const x of [1.6,3.6,6,7.6])box(house,x,0,-.045,.045,.42,.05,['#59645a','#59645a','#59645a']);
 face(house,[[.1,1.3,-.06],[1.7,1.3,-.06],[1.1,1.1,-.06],[.7,1.13,-.06],[.4,.85,-.06],[.1,.9,-.06]],'#667b4a');
 box(house,3.9,7,-.18,1.2,1.05,.18,timber);
 face(house,[[4.1,7.15,-.2],[4.9,7.15,-.2],[4.9,7.88,-.2],[4.1,7.88,-.2]],'#d9b267');
 // A real swinging-sign bracket at the inn, never a miniature route ad.
 box(house,-2.5,4.4,.8,2.6,.16,.16,timber);
 for(const x of [-2.24,-1.14])box(house,x,3.62,.8,.06,.8,.07,['#414940','#414940','#414940']);
 box(house,-2.45,2.7,.74,1.65,.95,.18,['#3b604c','#789268','#2a4438']);
 face(house,[[-2.02,2.91,.72],[-1.33,2.91,.72],[-1.33,3.39,.72],[-2.02,3.39,.72]],'#ddc389');
 face(house,[[-2.08,3.4,.71],[-1.28,3.4,.71],[-1.28,3.53,.71],[-2.08,3.53,.71]],'#f0ddaa');
 face(house,[[-.16,0,3.1],[-.16,0,5.4],[-.16,3.45,5.4],[-.16,3.45,3.1]],'#352b23');
 for(const z of [3.25,3.8,4.35,4.9])box(house,-.21,.15,z,.09,3.05,.45,timber);
 box(house,-2.2,0,2.5,2.2,.22,3.5,stone);
 for(const z of [2.3,6.2])box(house,-2.4,0,z,.24,3.95,.24,timber);
 face(house,[[-2.75,3.9,2],[-.1,4.55,2],[-.1,4.55,6.7],[-2.75,3.9,6.7]],'#94623d');
 box(house,-2.7,3.75,2,2.7,.18,.25,timber);
 // Small connected lean-to stable, hay and trough, behind the main house.
 for(const x of [-.1,4.5])box(house,x,0,14.5,.25,3.5,.25,timber);
 face(house,[[-.5,3.5,15.2],[5,3.5,15.2],[5,4.4,10.9],[-.5,4.4,10.9]],'#67704b');
 box(house,.2,0,12.5,3.4,.5,1.2,timber);box(house,.4,.49,12.65,3,.08,.85,['#578884','#739f8f','#365a55']);
 box(house,5.9,0,12,2,.75,1.6,['#b39a43','#d0b964','#87793e']);
 function site(edge){
  if(!edge)return null;if(sites.has(edge))return sites.get(edge);
  const slot=edge.events.find(e=>e.definition==='inn_stop');if(!slot)return null;
  const at=slot.at+8,result={at,slotId:slot.id,eventAt:slot.at+2,offset:9.2,clearances:[]};
  for(const d of [-20,-12,-4,4,12,20])for(const x of [8,13,18,23])result.clearances.push({at:at+d,offset:x});
  sites.set(edge,result);return result;
 }
 function layout(edge){
  if(layouts.has(edge))return layouts.get(edge);
  const rnd=journeyRandom(journeyKeySeed(journeyRoute.seed,'mossy-inn:'+edge.id)),out=[],s=site(edge);
  for(let at=edge.pieces[0].start+30;at<edge.pieces.at(-1).end-25;at+=33+rnd()*18){
   if(s&&Math.abs(at-s.at)<36)continue;
   out.push({at,offset:(out.length%2?-1:1)*(8.3+rnd()*1.5),kind:out.length%3});
  }layouts.set(edge,out);return out;
 }
 // Native roadside drawings: bounded paths built once, one projected ground
 // anchor per prop. No vertex projection, face sorting or bitmap cache.
 const decorPaths=[[],[],[]];
 function decorPlane(kind,color,points){
  const path=new Path2D();points.forEach(([x,y],i)=>i?path.lineTo(x,y):path.moveTo(x,y));path.closePath();
  decorPaths[kind].push({path,color});
 }
 const D=decorPlane;
 D(0,'#405132',[[-46,0],[-29,-7],[35,-5],[48,1],[30,5],[-30,4]]);
 D(0,'#926638',[[-42,-30],[-30,-43],[25,-43],[40,-32],[43,-13],[28,0],[-30,0],[-43,-12]]);
 D(0,'#c09954',[[-42,-30],[-30,-43],[25,-43],[40,-32],[27,-28],[-30,-28]]);
 D(0,'#63472c',[[-43,-12],[-30,-17],[32,-18],[43,-13],[28,0],[-30,0]]);
 D(0,'#b38b4c',[[29,-31],[38,-27],[40,-14],[29,-5],[22,-13],[22,-26]]);
 for(const x of [-26,12]){
  D(0,'#4b5c56',[[x,-42],[x+6,-42],[x+3,-28],[x+3,-13],[x+6,-1],[x,-1],[x-3,-13],[x-3,-28]]);
  D(0,'#a1ab87',[[x,-42],[x+6,-42],[x+3,-29],[x-3,-29]]);
 }
 D(0,'#73512e',[[-20,-26],[10,-26],[10,-24],[-20,-24]]);
 D(0,'#5f452a',[[29,-23],[34,-23],[34,-19],[29,-19]]);
 // Bark masses overlap naturally; pale cut ends are not rectangular beams.
 D(1,'#405132',[[-56,0],[-38,-9],[35,-9],[59,-1],[44,5],[-39,5]]);
 function splitLog(x,y){
  const plane=(c,v)=>D(1,c,v.map(([a,b])=>[a+x,b+y]));
  plane('#674728',[[-18,-22],[22,-31],[36,-25],[38,-12],[-2,1],[-20,-6]]);
  plane('#99703a',[[-18,-22],[22,-31],[36,-25],[-3,-13]]);
  plane('#493a25',[[-3,-13],[36,-25],[38,-12],[-2,1]]);
  plane('#bd9655',[[-18,-22],[-5,-22],[4,-14],[1,-3],[-9,1],[-20,-6],[-22,-15]]);
  plane('#dfbd78',[[-18,-22],[-5,-22],[1,-16],[-13,-14],[-20,-9],[-22,-15]]);
  plane('#856133',[[-13,-13],[-5,-16],[-2,-10],[-7,-5],[-15,-8],[-15,-13],[-12,-11],[-10,-7],[-5,-9],[-7,-12]]);
  plane('#a87d40',[[5,-23],[25,-28],[28,-27],[7,-20]]);
 }
 splitLog(-31,-1);splitLog(17,0);splitLog(-8,-18);
 // Hewn stone lip, dark inner wall and inset water, not a blue box lid.
 D(2,'#405132',[[-60,-1],[-40,-9],[46,-9],[61,1],[43,5],[-43,5]]);
 D(2,'#737a60',[[-57,-27],[-47,-37],[43,-37],[58,-26],[53,-5],[44,0],[-47,0],[-55,-6]]);
 D(2,'#a6ac83',[[-57,-27],[-47,-37],[43,-37],[58,-26],[46,-18],[-44,-18]]);
 D(2,'#3b514b',[[-46,-27],[-40,-31],[38,-31],[46,-26],[37,-21],[-38,-21]]);
 D(2,'#518d83',[[-43,-25],[-34,-28],[38,-28],[43,-25],[36,-22],[-37,-22]]);
 D(2,'#9ec9a8',[[-32,-26],[-10,-27],[1,-25],[-25,-24]]);
 D(2,'#8b946e',[[-57,-27],[-44,-20],[46,-20],[58,-26],[55,-17],[44,-13],[-46,-13],[-55,-18]]);
 D(2,'#bec398',[[-57,-27],[-44,-20],[46,-20],[58,-26],[56,-22],[45,-17],[-45,-17]]);
 D(2,'#56654f',[[44,-13],[55,-17],[53,-5],[44,0]]);
 D(2,'#59674e',[[-27,-13],[-23,-13],[-25,-7],[-22,-3],[-28,-7]]);
 D(2,'#637947',[[-49,-9],[-38,-9],[-34,-5],[-27,-5],[-25,0],[-47,0]]);
 function drawRoadDecor(item,p){
  const s=p.scale;if(p.alpha<=0||p.x+65*s<0||p.x-65*s>VW)return;
  g.save();g.beginPath();g.rect(-VW*4,-PAD_TOP-6000,VW*9,curvedSpriteClipY(p.z)+PAD_TOP+6000);g.clip();
  g.translate(p.x,p.y);g.scale(s,s);
  for(const layer of decorPaths[item.kind]||[]){g.fillStyle=layer.color;g.fill(layer.path);}
  g.restore();
 }
 function prop(item){
  const p=journeyDecorProjection(item);if(!p)return;
  g.save();g.globalAlpha=p.alpha;
  if(item.house){drawMesh(house,(d,x)=>item.point(item.at+d,item.offset+x));
   // Smoke uses the chimney's own projected anchor, with three quiet shapes.
   const w=item.point(item.at+7.5,item.offset+7),c=journeyCameraPoint(w.x,w.z),q=journeyProjectCamera(c.side,c.depth),u=150/JOURNEY_LANE_WORLD*linS(q.t);
   for(let i=0;i<3;i++){const t=(perfNow*.13+i/3)%1;g.globalAlpha=p.alpha*(1-t)*.22;const x=q.x+t*14*u/10,y=q.y-(10+t*2.6)*u;P([[x-7*u/10,y],[x-9*u/10,y-5*u/10],[x,y-9*u/10],[x+9*u/10,y-4*u/10],[x+6*u/10,y]],'#e3d7b9');}
  }else drawRoadDecor(item,p);
  g.restore();
 }
 function queueView(view){
  const enqueue=item=>{const p=view.point(item.at,item.offset),c=journeyCameraPoint(p.x,p.z);if(c.depth>-20&&c.depth<SPAWN_FAR)queueWorldDraw(c.depth,prop,{...p,...item,point:view.point});};
  if(view.spill){enqueue({at:view.begin+42.5,offset:view.onlySide*8,kind:1});return;}
  for(const item of layout(view.edge))enqueue(item);
  const s=site(view.edge);if(s)enqueue({...s,house:true});
 }
 const pavingColors=Object.freeze(['#77796d','#a7a58a','#aaa992','#999e8b','#b2ad93','#c3bea1']);
 function floorDetails(view,row,a,b,edge,routeA){
  const out=[],s=site(edge),shape=(pts,color,stableCurve=false)=>out.push({color,caravanGround:true,innBase:color===pavingColors[0],stableCurve,vertices:pts.map(([x,z])=>view.point(z,x))});
  // Laid stone is a manufactured surface: exact opaque start/end, while the
  // woodland's existing material blend remains independent. Fixed world rows
  // and staggered joints prevent the paving from crawling during turns.
  const pieces=edge.pieces.filter(p=>p.theme==='inn');
  if(pieces.length){
   const lo=Math.max(a,a+pieces[0].start-routeA),hi=Math.min(b,a+pieces.at(-1).end-routeA),h=CURVED_ROAD_HALF;
   if(hi>lo){
    shape([[-h,lo],[h,lo],[h,hi],[-h,hi]],'#77796d');
    out.at(-1).coversSoil=lo===a&&hi===b;
    const width=h*2/5,colors=['#a7a58a','#aaa992','#999e8b','#b2ad93'];
    for(let r=0;r<2;r++){
     const z=row*4+r*2+.09,z0=Math.max(lo,z),z1=Math.min(hi,z+1.81);if(z1<=z0)continue;
     for(let col=-1;col<5;col++){
      const x=-h+(col+(Math.abs(row*2+r)%2)*.5)*width,x0=Math.max(-h,x+.07),x1=Math.min(h,x+width-.07);if(x1-x0<.14)continue;
      const cut=Math.min(.16,(x1-x0)/4,(z1-z0)/4),id=Math.abs(row*7+r*3+col);
      shape([[x0+cut,z0],[x1-cut,z0],[x1,z0+cut],[x1,z1-cut],[x1-cut,z1],[x0+cut,z1],[x0,z1-cut],[x0,z0+cut]],colors[id%4],true);
      if(id%3===0&&z0===z)shape([[x0+cut,z0],[x1-cut,z0],[x1-cut,z0+.07],[x0+cut,z0+.11]],'#c3bea1',true);
     }
    }
   }
  }
  if(s&&routeA<s.at+17&&routeA+b-a>s.at-4){
   const lo=Math.max(a,a+s.at-4-routeA),hi=Math.min(b,a+s.at+17-routeA);
   shape([[6.1,lo],[20,lo],[20,hi],[6.1,hi]],'#8c8c6b');
   if(Math.abs(row)%2===0)for(let x=6.4;x<19;x+=2.2)shape([[x,lo+.1],[x+1.85,lo+.1],[x+1.85,Math.min(hi,lo+1.5)],[x,Math.min(hi,lo+1.5)]],'#b1aa86');
  }
  return out;
 }
 function laundry(o,point){
  // Two roadside posts and a high rope; only occupied lanes carry low linen.
  // Flat native planes follow projected road anchors, not a sorted 3D mesh.
  const project=x=>{
   const w=point(0,x),c=journeyCameraPoint(w.x,w.z);if(c.depth<=sceneryNearLimit())return null;
   const p=journeyProjectCamera(c.side,c.depth);return{x:p.x,y:p.y,u:150/JOURNEY_LANE_WORLD*linS(p.t),depth:c.depth};
  };
  const a=project(-6.9),b=project(6.9);if(!a||!b)return;
  const at=(p,h)=>[p.x,p.y-h*p.u],ropeHeight=x=>3.95+.7*Math.abs(x)/6.9;
  g.save();g.beginPath();g.rect(-VW*4,-PAD_TOP-6000,VW*9,Math.max(curvedSpriteClipY(a.depth),curvedSpriteClipY(b.depth))+PAD_TOP+6000);g.clip();
  for(const p of [a,b]){
   const x=p.x,y=p.y,s=p.u;
   P([[x-.38*s,y],[x-.16*s,y-.09*s],[x+.4*s,y],[x+.6*s,y+.08*s],[x-.25*s,y+.06*s]],'#4d5937');
   P([[x-.13*s,y],[x-.13*s,y-4.9*s],[x+.06*s,y-5.03*s],[x+.15*s,y-4.9*s],[x+.15*s,y]],'#725333');
   P([[x-.13*s,y],[x-.13*s,y-4.9*s],[x-.02*s,y-4.96*s],[x-.02*s,y]],'#b99759');
   L(x-.2*s,y-4.67*s,x+.23*s,y-4.62*s,.10*s,'#d9c493');
  }
  const rope=[a,project(-4),project(0),project(4),b],xs=[-6.9,-4,0,4,6.9];
  for(let i=1;i<rope.length;i++)if(rope[i-1]&&rope[i]){
   const p=at(rope[i-1],ropeHeight(xs[i-1])),q=at(rope[i],ropeHeight(xs[i]));
   L(...p,...q,Math.max(.8,(rope[i-1].u+rope[i].u)*.035),'#6b583b');
  }
  for(const lane of o.lanes){
   const x=(lane-1)*JOURNEY_LANE_WORLD,l=project(x-1.52),r=project(x+1.52);if(!l||!r)continue;
   const hl=ropeHeight(x-1.52),hr=ropeHeight(x+1.52),bottom=1.85;
   const sheet=(u,h)=>[lerp(l.x,r.x,u),lerp(l.y,r.y,u)-h*lerp(l.u,r.u,u)];
   P([at(l,hl),at(r,hr),sheet(1,bottom+.10),sheet(.72,bottom),sheet(.46,bottom+.12),sheet(.17,bottom),sheet(0,bottom+.1)],lane===1?'#bfd0c1':'#ece0b5');
   P([sheet(.75,lerp(hl,hr,.75)),at(r,hr),sheet(1,bottom+.1),sheet(.74,bottom)],lane===1?'#72918b':'#b7ad83');
   P([at(l,hl),sheet(.12,lerp(hl,hr,.12)),sheet(.16,bottom+.13),sheet(.03,bottom+.13)],lane===1?'#deead0':'#fff1ce');
   P([sheet(.03,bottom+.29),sheet(.98,bottom+.29),sheet(.98,bottom+.19),sheet(.03,bottom+.19)],'#7b9482');
   for(const u of [.13,.83]){
    const p=sheet(u,lerp(hl,hr,u)),s=lerp(l.u,r.u,u);
    P([[p[0]-.045*s,p[1]-.12*s],[p[0]+.065*s,p[1]-.12*s],[p[0]+.065*s,p[1]+.2*s],[p[0]-.045*s,p[1]+.2*s]],'#ad793c');
   }
  }
  g.restore();return true;
 }
 function hazard(o,point){
  if(o.kind==='root'){laundry(o,point);return true;}
  if(o.kind==='pond'){
   for(const group of obstacleLaneGroups(o.lanes)){
    const x=((group.start+group.end)/2-1)*JOURNEY_LANE_WORLD,w=(group.end-group.start+1)*3.65;
    const slab=(pts,color)=>KRSunlitArt.drawFloorShape({vertices:pts.map(([a,b])=>point(b,x+a*w)),color,stableCurve:true});
    // Collapsed paving: broken courses, exposed earth sides and a dark dry
    // recess. Joined occupied lanes share one hole; safe lanes stay open.
    slab([[-.5,-1.1],[-.44,-1.7],[-.12,-1.7],[-.12,-1.9],[.35,-1.8],[.35,-1.5],[.49,-1.5],[.5,1.2],[.34,1.2],[.34,1.7],[-.33,1.7],[-.33,1.4],[-.5,1.4]],'#6b6d5b');
    slab([[-.44,-1.1],[-.36,-1.5],[.29,-1.5],[.29,-1.25],[.44,-1.25],[.43,1.1],[.29,1.1],[.29,1.4],[-.29,1.4],[-.29,1.15],[-.44,1.15]],'#302e25');
    slab([[-.44,1.15],[-.29,1.15],[-.29,1.4],[.29,1.4],[.29,1.1],[.43,1.1],[.34,.35],[-.33,.35]],'#766247');
    slab([[-.44,-1.1],[-.44,1.15],[-.33,.35],[-.33,-.95]],'#4e4935');
    slab([[-.33,-.95],[-.33,.35],[.34,.35],[.34,-.95],[.25,-1.2],[-.22,-1.2]],'#242720');
    slab([[-.49,1.15],[-.49,1.48],[-.32,1.48],[-.32,1.16]],'#b6b398');
    slab([[-.27,1.4],[-.27,1.76],[.07,1.76],[.07,1.42]],'#aaa990');
    slab([[.12,1.41],[.12,1.76],[.34,1.71],[.34,1.2],[.28,1.2],[.28,1.41]],'#c3bea1');
    slab([[-.43,-1.73],[-.37,-1.95],[-.14,-1.9],[-.17,-1.66]],'#b2ad93');
    slab([[.29,-1.53],[.29,-1.81],[.48,-1.77],[.46,-1.51]],'#999e8b');
    slab([[-.23,-.61],[-.17,-.42],[-.03,-.46],[.02,-.7],[-.09,-.79]],'#555540');
   }return true;
  }
  // Fallen casks retain their existing jump/lane contract.
  if(o.kind!=='boulder')return false;
  for(const lane of o.lanes){
   const w=point(0,(lane-1)*JOURNEY_LANE_WORLD),c=journeyCameraPoint(w.x,w.z);
   if(c.depth<=sceneryNearLimit())continue;
   const q=journeyProjectCamera(c.side,c.depth),scale=150/JOURNEY_LANE_WORLD*linS(q.t)/24;
   g.save();g.beginPath();g.rect(-VW*4,-PAD_TOP-6000,VW*9,curvedSpriteClipY(c.depth)+PAD_TOP+6000);g.clip();g.translate(q.x,q.y);g.scale(scale,scale);
   // Broad native art planes, not a many-sided rotating mesh. Two hoops and
   // three stave seams describe one fallen cask without noisy 3D facets.
   P([[-39,0],[-28,-5],[30,-4],[43,2],[28,5],[-26,5]],'#575641');
   P([[-35,-32],[-25,-43],[25,-43],[37,-33],[40,-13],[29,0],[-25,0],[-36,-10]],'#997040');
   P([[-35,-32],[-25,-43],[25,-43],[37,-33],[28,-30],[-26,-30]],'#c39b5d');
   P([[-36,-10],[-25,-15],[30,-16],[40,-13],[29,0],[-25,0]],'#6f5135');
   P([[27,-35],[36,-30],[39,-14],[29,-4],[22,-12],[22,-28]],'#805d39');
   L(-23,-29,20,-29,1.5,'#795837');L(-25,-17,20,-17,1.5,'#775333');
   for(const x of [-22,14]){
    P([[x,-42],[x+5,-42],[x+2,-31],[x+2,-12],[x+5,0],[x,0],[x-3,-11],[x-3,-31]],'#596861');
    P([[x,-42],[x+5,-42],[x+2,-31],[x-3,-31]],'#a0a58b');
   }
   L(28,-29,30,-12,1.5,'#b18a51');R(28,-23,4,4,'#5b4430');g.restore();
  }return true;
 }
 // Left hand rests; the right palm and cloth travel together on the counter.
 // The smooth reversal is time-based, with fixed-length two-bone arms.
 function keeperPose(t=perfNow){
  // Counter contacts are scene constraints. The torso follows the wiping effort;
  // shoulders move, while the two fixed-length bones solve to the planted palms.
  const breath=Math.sin(t*1.6)*.35,lean=Math.sin(t*1.4)*.7;
  const arm=side=>{
   const shoulder=[side*39+lean,-111+breath],wrist=side<0?[-30,-54]:[34+18*Math.sin(t*1.4),-52];
   const dx=wrist[0]-shoulder[0],dy=wrist[1]-shoulder[1],d=Math.hypot(dx,dy),upper=35,lower=36;
   const along=(upper*upper-lower*lower+d*d)/(2*d),out=Math.sqrt(Math.max(0,upper*upper-along*along));
   return{shoulder,elbow:[shoulder[0]+dx*along/d+side*dy*out/d,shoulder[1]+dy*along/d-side*dx*out/d],wrist,upper,lower};
  };
  const left=arm(-1),right=arm(1);
  return{breath,lean,left,right,cloth:[right.wrist[0]+2,right.wrist[1]+5],headAngle:-.012+Math.sin(t*.65)*.005,blink:Math.sin(t*.73)>.997};
 }
 // Model materials first; the hearth adapter changes planes, never geometry.
 // Shape anchors: approved Barry/merchant/Borin/Gatherer, not the retired keeper.
 const keeperMaterials={
  neutral:{skin:['#e1bc8d','#c99e72','#986c53'],shirt:['#e6d6ad','#bcaa86','#807c68'],vest:['#b15e60','#8c3b47','#653441'],leather:['#c69a61','#a57548','#694932'],hair:['#a28b67','#6e5b45','#463b31'],metal:['#e4d5a4','#b19f78','#71796f']},
  hearth:{skin:['#f9cb8f','#dea06c','#986751'],shirt:['#ffe0a6','#d5bd90','#819190'],vest:['#d38167','#a85048','#713d43'],leather:['#efb35f','#c48340','#7b4d32'],hair:['#c5a36e','#876441','#4e433b'],metal:['#ffe1a0','#c9ad78','#748b8f']}
 };
 function keeper(x,y,s=1,lit=true,front=false){
  const {skin,shirt,vest,leather,hair,metal}=lit?keeperMaterials.hearth:keeperMaterials.neutral,p=keeperPose();
  const S=(a,b,w,c,dx=0,dy=0)=>expSegment(a[0]+dx,a[1]+dy,b[0]+dx,b[1]+dy,w,c);
  const forearms=()=>{
   // The cloth and palm share the contact coordinate. It lies flat, not held.
   g.save();g.translate(...p.cloth);
   P([[-19,-3],[-12,-8],[13,-7],[20,0],[17,8],[-13,8],[-20,3]],'#715638');
   P([[-19,-5],[-12,-10],[13,-9],[20,-2],[17,5],[-13,6],[-20,1]],shirt[1]);
   P([[-19,-5],[-12,-10],[13,-9],[15,-5],[-10,-5],[-16,1],[-20,1]],shirt[0]);
   P([[-13,3],[17,2],[17,5],[-13,6],[-20,1],[-18,-1]],shirt[2]);
   P([[-13,-8],[-10,-8],[-13,1],[-10,4],[-13,4],[-16,1]],vest[1]);
   P([[12,-7],[15,-5],[13,3],[10,3]],vest[1]);g.restore();
   for(const [side,a] of [[-1,p.left],[1,p.right]]){
    const e=a.elbow,w=a.wrist,dx=w[0]-e[0],dy=w[1]-e[1],len=Math.hypot(dx,dy);
    R(e[0]-8,e[1]-7,16,15,skin[2]);
    S(e,w,17,skin[2]);S(e,w,12,skin[1],-1.5,-1);S(e,w,4,skin[0],-5,-1);
    const ca=[e[0]-dx/len*5,e[1]-dy/len*5],cb=[e[0]+dx/len*3,e[1]+dy/len*3];
    S(ca,cb,22,shirt[1]);S(ca,cb,7,shirt[0],-6.5,-1);
    S([cb[0]-dx/len*1.6,cb[1]-dy/len*1.6],cb,22,shirt[2]);
    g.save();g.translate(...w);
    // Palm-down knuckle block and attached inward thumb; all follow the wrist.
    P([[-8,-5],[6,-5],[9,-1],[10,6],[6,9],[-7,8],[-10,4]],skin[1]);
    P([[-8,-5],[6,-5],[8,-1],[5,2],[-8,1]],skin[0]);
    P([[-7,5],[7,5],[10,3],[10,6],[6,9],[-7,8]],skin[2]);
    P([[-side*6,-3],[-side*11,-1],[-side*13,3],[-side*10,5],[-side*6,1]],skin[1]);
    for(const fx of [-4,0,4])R(fx,2,1,4,skin[2]);
    g.restore();
   }
  };
  g.save();try{
   g.translate(x,y);g.scale(s,s);
   if(front){forearms();return;}
   // Stable stance beneath the counter, with one foot slightly forward.
   for(const [bx,dy] of [[-29,0],[8,-2]]){
    R(bx,-38,23,34,'#354247');R(bx,-37,6,31,'#66756e');
    P([[bx-1,-12+dy],[bx+20,-12+dy],[bx+25,-4+dy],[bx+25,6+dy],[bx-4,6+dy],[bx-4,-2+dy]],leather[2]);
    R(bx-2,-6+dy,22,4,leather[1]);R(bx-4,3+dy,29,3,'#40362c');
   }
   g.save();g.translate(p.lean,p.breath);
   // Broad, slightly forward-set chest. Clothing has continuous broad planes.
   P([[-35,-126],[-17,-133],[20,-131],[38,-124],[46,-102],[48,-68],[39,-30],[-39,-30],[-48,-65],[-46,-102]],vest[1]);
   P([[-35,-126],[-17,-133],[-5,-128],[-9,-102],[-15,-63],[-30,-32],[-39,-30],[-48,-65],[-46,-102]],vest[0]);
   P([[20,-131],[38,-124],[46,-102],[48,-68],[39,-30],[29,-33],[34,-70],[31,-105]],vest[2]);
   R(-12,-143,26,17,skin[2]);P([[-12,-143],[2,-143],[3,-128],[-10,-126]],skin[1]);
   P([[-15,-133],[12,-132],[17,-122],[4,-108],[-11,-119]],shirt[1]);
   P([[-15,-133],[-5,-134],[-2,-121],[-5,-113],[-11,-119]],shirt[0]);
   // Practical open collar and leather apron, no decorative chest armour.
   P([[-17,-132],[-12,-134],[-3,-123],[-10,-116],[-20,-126]],shirt[0]);
   P([[12,-133],[18,-129],[19,-121],[8,-116],[-3,-123]],shirt[1]);
   for(const xx of [-25,25]){
    expSegment(xx,-126,xx*.88,-103,7,leather[2]);
    expSegment(xx-1.5,-126,xx*.88-1.5,-103,3,leather[0]);
   }
   P([[-26,-105],[24,-105],[32,-83],[32,-27],[-30,-27],[-33,-79]],leather[1]);
   P([[-26,-105],[-19,-105],[-23,-78],[-23,-28],[-30,-27],[-33,-79]],leather[0]);
   P([[24,-105],[32,-83],[32,-27],[23,-28],[24,-81],[18,-104]],leather[2]);
   L(-24,-101,22,-101,1.5,leather[0]);
   for(const xx of [-24,21]){R(xx,-107,5,5,metal[1]);R(xx,-107,2,2,metal[0]);}
   P([[-45,-57],[-2,-54],[45,-57],[43,-49],[-2,-46],[-43,-49]],leather[2]);
   R(9,-56,12,10,metal[1]);R(12,-53,6,5,leather[2]);R(10,-56,10,2,metal[0]);
   P([[-19,-71],[10,-71],[10,-60],[-15,-60],[-19,-64]],leather[2]);L(-19,-71,10,-71,2,leather[0]);
   // Inn keys hang from the belt, not from the wiping wrist.
   R(33,-48,5,6,metal[2]);R(34,-47,3,3,metal[0]);
   L(35,-44,35,-33,2,metal[1]);R(35,-36,5,3,metal[1]);
   L(39,-44,41,-31,2,metal[1]);R(41,-34,4,3,metal[1]);
   // Smaller squared head and a readable clean jaw. No bright chin stripe.
   g.translate(0,-132);g.rotate(p.headAngle);g.translate(0,132);
   // Rear hair first. Scalp and forehead below are ONE continuous skin surface,
   // so there is no leftover hair edge or separate shadow seam at the join.
   P([[-24,-159],[-26,-173],[-19,-184],[-5,-187],[15,-184],[24,-177],[27,-167],[23,-154],[19,-155],[-20,-155]],hair[1]);
   P([[-26,-173],[-19,-184],[-5,-187],[15,-184],[13,-180],[-8,-181],[-21,-173]],hair[0]);
   P([[-22,-173],[-17,-180],[-9,-183],[7,-183],[16,-178],[22,-170],[22,-144],[15,-132],[8,-127],[-12,-128],[-22,-139]],skin[1]);
   P([[-22,-173],[-17,-180],[-9,-183],[-2,-183],[-3,-147],[-12,-137],[-21,-140]],skin[0]);
   P([[14,-179],[16,-178],[22,-170],[22,-144],[15,-132],[8,-127],[2,-131],[13,-141]],skin[2]);
   P([[-21,-143],[-10,-144],[-4,-138],[10,-138],[14,-141],[13,-133],[7,-130],[-11,-131],[-20,-137]],skin[1]);
   P([[-11,-131],[7,-130],[13,-133],[8,-127],[-12,-128],[-18,-135]],skin[2]);
   R(-27,-164,6,13,skin[1]);R(-27,-163,2,9,skin[0]);R(21,-162,5,12,skin[2]);
   // Only the actual side locks overlap the continuous head surface.
   P([[-26,-173],[-20,-181],[-17,-180],[-22,-170],[-21,-155],[-24,-155]],hair[1]);
   P([[17,-183],[24,-177],[27,-167],[23,-154],[19,-155],[21,-169],[19,-177]],hair[2]);
   // A small remaining forelock makes the recession slight, not a fully bald head.
   P([[-9,-184],[2,-184],[9,-179],[5,-176],[-2,-178],[-5,-180],[-11,-180]],hair[1]);
   P([[-9,-184],[2,-184],[5,-182],[-5,-182],[-11,-180]],hair[0]);
   R(-24,-168,4,16,lit?'#d5be94':'#b5ad97');R(20,-164,4,12,lit?'#a9aa98':'#8d978f');
   // Restrained, slightly fed-up expression: low lids, inward-lowered brows.
   P([[-16,-160],[-5,-158],[-5,-155],[-16,-157]],hair[1]);
   P([[5,-158],[15,-160],[16,-157],[5,-155]],hair[2]);
   R(-14,-153,5,p.blink?.7:2.5,'#293930');R(8,-153,4.5,p.blink?.7:2.5,'#293930');
   P([[-2,-158],[3,-158],[7,-145],[3,-141],[-5,-143],[-5,-146]],skin[1]);
   R(-2,-157,2.5,11,skin[0]);P([[3,-155],[7,-145],[3,-141],[-5,-143],[-2,-146],[3,-146]],skin[2]);
   // Broad trimmed moustache, no smile arc, no second fake jaw underneath it.
   P([[-16,-143],[-5,-145],[0,-142],[5,-145],[17,-142],[16,-137],[5,-138],[0,-140],[-6,-138],[-16,-138]],hair[1]);
   R(-14,-142,8,1.7,hair[0]);R(6,-142,8,1.5,hair[0]);
   R(-6,-135,12,1.5,lit?'#885339':'#79543f');
   g.restore();
   // Arms reach FORWARD from the chest. Draw the shoulder and complete upper
   // arm after the torso, including the inward wiping extreme, not behind it.
   for(const [side,a] of [[-1,p.left],[1,p.right]]){
    const [sx,sy]=a.shoulder;
    P([[sx-side*9,sy-14],[sx+side*5,sy-15],[sx+side*14,sy-6],[sx+side*12,sy+10],[sx-side*9,sy+13]],shirt[1]);
    S(a.shoulder,a.elbow,25,shirt[2]);S(a.shoulder,a.elbow,18,shirt[1],-2,-1);S(a.shoulder,a.elbow,6,shirt[0],-8,-1);
   }
   forearms();
  }finally{g.restore();}
 }
 function drawCutscene(){
  const img=window.KREventVisuals?.peek('mossy-inn');if(!img)return false;
  R(0,-PAD_TOP,480,800+PAD_TOT,'#302820');
  g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(img,0,88,480,360);g.restore();return true;
 }
 const UI={keeper:{x:158,y:140,w:154,h:170}};
 function choice(action,pt){
  if(paused)return -1;
  if(action==='tap'&&pt&&pointInRect(pt,UI.keeper))return 3;
  return roadServiceChoice(action,pt);
 }
 function button(r,label,price=null,enabled=true){
  const {x,y,w,h}=r;
  P([[x+6,y+4],[x+w-6,y+4],[x+w,y+10],[x+w,y+h],[x+5,y+h+5],[x,y+h-1],[x,y+10]],'#1d201a');
  P([[x+5,y],[x+w-5,y],[x+w,y+5],[x+w,y+h-5],[x+w-5,y+h],[x+5,y+h],[x,y+h-5],[x,y+5]],enabled?'#ded2a2':'#938975');
  L(x+8,y+4,x+w-8,y+4,2,'#f3e6bd');L(x+7,y+h-3,x+w-7,y+h-3,2,'#9c824f');
  if(price===null)smithText(label,x+w/2,y+h/2+5,13,'#3d3828',w-20);
  else{smithText(label,x+w/2,y+20,13,'#3d3828',w-20);merchantGoldLabel(price,x+w/2,y+39,11,'#59432a','',90);}
 }
 function drawScene(lit=true){
  if(!drawCutscene()){
   R(0,-PAD_TOP,480,800+PAD_TOT,'#302820');smithText('Opening the inn...',240,255,16,'#e6d2a0');
  }else{
   keeper(232,355,1.22,lit);
   // The same managed image supplies foreground occlusion. No duplicate plate
   // or mask texture; the live cloth and forearms are drawn over its worktop.
   const image=KREventVisuals.peek('mossy-inn');
   g.save();g.beginPath();g.rect(0,284,480,164);g.clip();
   g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(image,0,88,480,360);g.restore();
   keeper(232,355,1.22,lit,true);
  }
 }
 function drawInterior(context,lit=true){
  drawScene(lit);
  R(0,447,480,353+PAD_BOT,'#302820');
  P([[20,33],[458,33],[466,67],[450,80],[22,80],[13,47]],'#344d3a');L(25,37,452,37,2,'#c4a365');
  smithText('THE MOSSY OAK',240,62,22,'#f0d7a0',410);
  smithText('"Welcome, traveller. A room or a game?"',240,480,12,'#e1c99d',430);
  merchantGoldLabel(gold,405,513,13,'#f2d17e');
  button(ROAD_SERVICE_BUTTONS[0],context.inn.rested?'WELL RESTED':'A ROOM AND A HOT MEAL, PLEASE',18+loop*4,!context.inn.rested&&player.currentHealthUnits<player.maxHealthUnits&&gold>=18+loop*4);
  button(ROAD_SERVICE_BUTTONS[1],'ANY GAMES GOING?',5,gold>=5);
  smithText(context.notice||'"Beds are ready. The regulars need another player."',240,679,11,'#d5bd95',422);
  button(ROAD_SERVICE_BUTTONS[2],'BACK TO THE ROAD');
 }
 window.KRMossyInn={assetId:'mossy-inn',drawCutscene,drawScene,drawInterior,keeper,keeperPose,keeperMaterials,choice,site,layout,queueView,floorDetails,pavingColors,hazard,UI};
})();
