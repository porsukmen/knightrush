/* Basalt Reach. Native KR-KD actors/road art plus a managed cutscene plate.
   The route still owns collision, spawning, currencies and upgrade outcomes. */
(()=>{
 'use strict';
 const furnacePalette=Object.freeze({
  '#ecc18a':'#ffb96c','#c08759':'#d77f45','#855542':'#684450',
  '#ce9563':'#e7964e','#f1c990':'#ffd188','#98654d':'#6e4951',
  '#c99260':'#db8749','#ffe0a0':'#ffd681','#b7754c':'#a45436',
  '#dbac7a':'#ffbc68','#af7552':'#925348','#fff1cc':'#ffe8ae','#e7dab9':'#adc0c9',
  '#d49d68':'#efa45b','#976041':'#a45935',
  '#a4774a':'#d88e40','#80563a':'#8d492b','#49352f':'#332730',
  '#553729':'#362934','#ad753e':'#dc7837','#996035':'#9d4d2b','#68452f':'#493039',
  '#c58c4a':'#f69945','#dfae65':'#ffc070','#ad7440':'#b56336','#c48b4c':'#db8946',
  '#c39357':'#ffb25e','#aa7947':'#b76535','#f0c37d':'#ffda8e','#dbaa63':'#dc9659',
  '#b9b8a0':'#ffd08a','#7f9499':'#ac8b65','#596b73':'#68584d',
  '#668887':'#9b7952','#304b55':'#333f48','#889da3':'#b6976c','#dcc3a0':'#ffd180',
  '#9baba6':'#bca179','#ead5ad':'#ffdaa0','#64777c':'#565c61',
  '#324e58':'#2b3c48','#597d7c':'#6e7058','#243943':'#242b38',
  '#855334':'#884729','#c18948':'#dc8741','#563b30':'#432d32',
  '#a46c3c':'#b66b33','#bb8c51':'#d58d45',
  '#728a92':'#667587','#c7c9b7':'#b8b9a5','#354f61':'#303e53',
  '#829ba5':'#7f909f','#d8c9a5':'#e4b777','#768c96':'#657986','#cccfba':'#c2b48e',
  '#9dabb0':'#9e9a8c','#dedcc8':'#ffcf83','#4f6674':'#48566c',
  '#c69f57':'#e2a547','#efd195':'#ffe0a0'
 });
 let actorLighting=false;
 const material=c=>actorLighting?(furnacePalette[c]||c):c;
 const P=(pts,c)=>expPoly(pts,material(c)),R=(x,y,w,h,c)=>expRect(x,y,w,h,material(c)),
  L=(ax,ay,bx,by,w,c)=>expSegment(ax,ay,bx,by,w,material(c));
 function withActorLighting(enabled,draw){const old=actorLighting;try{actorLighting=enabled;return draw();}finally{actorLighting=old;}}
 const ore=[['#c39746','#efd38b'],['#3766a3','#8cafce'],['#99a4ad','#d2d6d2']];
 const layouts=new WeakMap();
 function layout(edge){
  let list=layouts.get(edge);if(list)return list;
  list=[];const random=journeyRandom(journeyKeySeed(journeyRoute.seed,'basalt:'+edge.id)),
   start=edge.pieces[0].start,end=edge.pieces.at(-1).end,slot=edge.events.find(e=>e.definition==='forge_stop');
  let oreIndex=0;
  for(const side of [-1,1])for(let at=start+16+random()*13;at<end-16;at+=23+random()*20){
   if(slot&&Math.abs(at-slot.at)<31)continue;
   const offset=side*(8.4+random()*2.3),kind=random()<.24?'ash':random()<.35?'columns':'ore';
   list.push({at,offset,side,index:list.length,kind,ore:kind==='ore'?oreIndex++%3:0,size:.72+random()*.42});
  }layouts.set(edge,list);return list;
 }
 function floorDetails(view,row,a,b){
  if(Math.abs(row)%5!==2)return [];
  const type=Math.abs(row)%3,x=(sRnd(row*31)-.5)*7,z=row*4+.6;
  if(z<a||z+1.5>b)return [];
  const shape=(pts,color)=>({color,vertices:pts.map(([px,d])=>view.point(d,x+(px-x)*.52))});
  return [shape([[x-.3,z],[x+.08,z-.15],[x+.29,z+.45],[x+.08,z+.64],[x+.38,z+1.3],[x+.12,z+1.45],[x-.17,z+.55]],ore[type][0]),
   shape([[x+.02,z],[x+.12,z+.02],[x+.18,z+.38],[x+.08,z+.45]],ore[type][1])];
 }
 function rock(x,y,s=1,type=0,columns=false){
  g.save();g.translate(x,y);g.scale(s,s);
  P([[-39,1],[-44,-13],[-28,-34],[1,-41],[30,-28],[40,-5],[29,4]],'#252b34');
  P([[-44,-13],[-28,-34],[1,-41],[8,-30],[-14,-19],[-20,0]],'#606872');
  P([[1,-41],[30,-28],[40,-5],[29,4],[10,-10],[8,-30]],'#39424e');
  P([[-28,-34],[1,-41],[8,-30],[-14,-19]],'#80888e');
  if(columns){
   for(const [cx,h]of [[-15,48],[4,73],[22,54]]){
    P([[cx-10,-6],[cx-10,-h],[cx,-h-7],[cx+10,-h],[cx+10,-6],[cx,0]],'#343c47');
    P([[cx,-h-7],[cx+10,-h],[cx+10,-6],[cx,0]],'#222933');
    P([[cx-10,-h],[cx,-h-7],[cx+10,-h],[cx,-h+5]],'#737c84');
    R(cx-8,-h+4,2,h-15,'#515c67');
   }
  }else{
   const c=ore[type];
   P([[-25,-28],[-17,-31],[-11,-21],[-4,-23],[3,-12],[-2,-8],[-10,-16],[-17,-15]],c[0]);
   P([[-25,-28],[-17,-31],[-15,-26],[-21,-23]],c[1]);
   P([[11,-27],[20,-25],[26,-16],[19,-15],[16,-20],[9,-21]],c[0]);
   P([[11,-27],[20,-25],[19,-22],[11,-23]],c[1]);
   R(-4,-33,5,3,c[0]);R(5,-5,4,3,c[0]);
  }g.restore();
 }
 function ash(x,y,s=1){
  g.save();g.translate(x,y);g.scale(s,s);
  P([[-46,1],[-31,-9],[-11,-14],[12,-12],[39,-5],[48,2],[11,7],[-21,6]],'#41434a');
  P([[-31,-9],[-11,-14],[12,-12],[32,-6],[1,-3],[-19,1]],'#777b7c');
  P([[-11,-14],[12,-12],[18,-9],[-4,-8],[-16,-5]],'#9b9d95');
  R(-25,-4,8,2,'#282e36');R(13,-6,11,2,'#555b63');g.restore();
 }
 // Authored world-space basalt columns, NOT the normal boulder's recolour.
 const hazardModels=[1,2,3].map(lanes=>{
  const vertices=[],faces=[],w=lanes*3.36,count=lanes+2;
  const face=(points,color)=>{const indices=points.map(p=>{vertices.push(p);return vertices.length-1;});faces.push({indices,color,depth:0});};
  for(let k=0;k<count;k++){
   const cx=-w/2+w*(k+.5)/count,r=w/count*.68,h=[.86,1.75,1.12,1.5,1.05][k],cz=k%2?.24:-.2;
   const ring=[[-r*.65,-.65],[r*.65,-.65],[r,-.1],[r*.65,.65],[-r*.65,.65],[-r,-.1]];
   const bottom=ring.map(([x,z])=>[cx+x,0,cz+z]),top=ring.map(([x,z],i)=>[cx+x*.9,h+(i===4?.12:0),cz+z*.92]);
   for(let i=0;i<6;i++)face([bottom[i],bottom[(i+1)%6],top[(i+1)%6],top[i]],['#353d49','#222a37','#1b222e','#394656','#54616d','#69747e'][i]);
   face(top,'#86929a');
   // An exposed column fracture, a narrow mineral seam and chipped top edge.
   face([[cx-r*.6,h*.1,cz-.656],[cx-r*.4,h*.1,cz-.656],[cx-r*.4,h*.53,cz-.656],[cx-r*.6,h*.6,cz-.656]],'#191f29');
   if(k===1)face([[cx-.13,h*.22,cz-.659],[cx+.04,h*.28,cz-.659],[cx+.04,h*.55,cz-.659],[cx+.16,h*.64,cz-.659],[cx+.04,h*.71,cz-.659],[cx-.13,h*.59,cz-.659]],'#b08a47');
   face([[cx-r*.5,h+.005,cz-.56],[cx+r*.4,h+.005,cz-.56],[cx+r*.3,h+.005,cz-.4],[cx-r*.4,h+.005,cz-.4]],'#b5bab2');
  }
  return {vertices,faces,screen:vertices.map(()=>[0,0,0])};
 });
 function hazard(o,point){
  if(!['boulder','pond'].includes(o.kind))return false;
  for(const group of obstacleLaneGroups(o.lanes)){
   const lanes=group.end-group.start+1,offset=((group.start+group.end)/2-1)*JOURNEY_LANE_WORLD;
   if(o.kind==='pond'){
    // The legacy collision ID is pond; the forge visual is a DRY excavation.
    const w=lanes*3.65/2;
    const rim=[[-w,-1.25],[-w*.55,-1.75],[w*.35,-1.62],[w,-1.03],[w+.15,.56],[w*.68,1.52],[-w*.45,1.6],[-w-.12,.64]];
    const paint=(points,color)=>KRSunlitArt.drawFloorShape({color,vertices:points.map(([x,z])=>point(z,x+offset))});
    paint(rim,'#8b9090');
    paint(rim.map(([x,z])=>[x*.92,z*.86]),'#141b24');
    paint([[-w,-1.25],[-w*.55,-1.75],[w*.35,-1.62],[w,-1.03],[w*.78,-.48],[w*.25,-.65],[-w*.5,-.74],[-w*.83,-.39]],'#414b57');
    paint([[-w*.83,-.39],[-w*.5,-.74],[w*.25,-.65],[w*.78,-.48],[w*.55,.02],[-w*.48,.16]],'#29323f');
    paint([[-w-.12,.64],[-w*.45,1.6],[w*.68,1.52],[w+.15,.56],[w*.87,.74],[w*.61,1.16],[-w*.4,1.25]],'#292e39');
    paint([[-w*.91,-1.25],[-w*.55,-1.58],[-w*.3,-1.53],[-w*.49,-1.3],[-w*.69,-1.16]],'#b2b2a3');
    continue;
   }
   const m=hazardModels[lanes-1];let clip=-Infinity,valid=true;
   for(let i=0;i<m.vertices.length;i++){
    const [x,h,z]=m.vertices[i],world=point(z,x+offset),c=journeyCameraPoint(world.x,world.z);
    if(c.depth<=sceneryNearLimit()){valid=false;break;}
    const p=journeyProjectCamera(c.side,c.depth),screen=m.screen[i];
    screen[0]=p.x;screen[1]=p.y-h*150/JOURNEY_LANE_WORLD*linS(p.t);screen[2]=c.depth;
    clip=Math.max(clip,curvedSpriteClipY(c.depth));
   }
   if(!valid)continue;
   for(const f of m.faces)f.depth=f.indices.reduce((sum,i)=>sum+m.screen[i][2],0)/f.indices.length;
   m.faces.sort((a,b)=>b.depth-a.depth);
   g.save();g.beginPath();g.rect(-VW*4,-PAD_TOP-6000,VW*9,clip+PAD_TOP+6000);g.clip();
   for(const f of m.faces){
    let area=0;for(let j=0;j<f.indices.length;j++){const a=m.screen[f.indices[j]],b=m.screen[f.indices[(j+1)%f.indices.length]];area+=a[0]*b[1]-b[0]*a[1];}
    if(area>=-.001)continue;
    g.beginPath();f.indices.forEach((i,j)=>j?g.lineTo(m.screen[i][0],m.screen[i][1]):g.moveTo(m.screen[i][0],m.screen[i][1]));
    g.closePath();g.fillStyle=f.color;g.fill();
   }g.restore();
  }return true;
 }
 function anvil(x,y,s=1){
  g.save();g.translate(x,y);g.scale(s,s);
  // One broad horn, square heel, narrow waist and flared four-foot base.
  P([[-28,-1],[23,-7],[35,0],[35,30],[-24,35],[-36,26],[-36,6]],'#3a3534');
  P([[-36,6],[-28,-1],[23,-7],[35,0],[22,8],[-24,14]],'#74706a');
  P([[-24,14],[22,8],[35,0],[35,30],[-24,35]],'#4d4845');
  L(-25,22,34,17,4,'#252c35');R(-17,23,3,3,'#a6a8a2');R(25,18,3,3,'#a6a8a2');
  P([[-54,-47],[-24,-45],[-20,-54],[37,-54],[43,-47],[40,-36],[17,-27],[12,-14],[22,-8],[22,-3],[-21,1],[-27,-5],[-15,-14],[-16,-27],[-33,-33]],'#424e5d');
  P([[-54,-47],[-28,-50],[-22,-51],[-20,-58],[36,-58],[43,-51],[12,-47],[-23,-44]],'#d0d5cf');
  P([[-23,-44],[12,-47],[43,-51],[40,-43],[12,-39],[-25,-38],[-42,-43]],'#8d9ba5');
  P([[12,-39],[40,-43],[40,-36],[17,-27],[12,-14],[22,-8],[22,-3],[9,-5],[3,-16],[5,-30]],'#263441');
  P([[-16,-27],[-11,-26],[-10,-13],[-22,-5],[-21,0],[-27,-5],[-15,-14]],'#7c8e99');
  P([[-21,-55],[-1,-55],[1,-52],[-21,-51]],'#f0dfbc');
  P([[24,-55],[31,-55],[34,-53],[26,-52]],'#303c4a');g.restore();
 }
 // Second character pass: broad forged shoulder masses, squared face, layered
 // beard locks and real workwear construction. First draft is not a reference.
 // New dwarf: approved merchant face scale + knight's squared massing.
 // Local units are canvas units, not U-scaled rig coordinates.
 function dwarf(x,y,s=1,t=perfNow,lift=0,result=null,strike=0,frontArm=true,restOnAnvil=false){
  g.save();g.translate(x,y);g.scale(s,s);
  for(const side of [-1,1]){
   const x=side<0?-37:9;
   R(x,-36,28,27,'#303f4b');R(x,-36,8,25,'#53616a');
   P([[x-2,-18],[x+28,-18],[x+33,-5],[x+37,-2],[x+37,5],[x-5,5],[x-5,-7]],'#4e3b34');
   R(x-2,-16,25,4,'#9e734a');R(x-5,-3,37,5,'#89735a');R(x-5,3,42,3,'#28313a');
  }
  // Square shoulders, broad ribcage, compact waist: muscular, not a round belly.
  P([[-48,-118],[-29,-126],[29,-126],[48,-118],[48,-84],[36,-40],[-36,-40],[-48,-84]],'#324e58');
  P([[-48,-118],[-29,-126],[0,-124],[0,-45],[-36,-40],[-48,-84]],'#597d7c');
  P([[26,-124],[48,-118],[48,-84],[36,-40],[25,-45],[31,-88]],'#243943');
  P([[-34,-109],[31,-109],[35,-64],[35,-26],[4,-23],[0,-30],[-4,-23],[-36,-27],[-34,-69]],'#855334');
  P([[-34,-109],[-24,-109],[-26,-62],[-27,-27],[-36,-27],[-34,-69]],'#c18948');
  P([[24,-109],[31,-109],[35,-64],[35,-26],[25,-28]],'#563b30');
  L(-30,-123,-25,-102,7,'#49362c');L(30,-123,25,-102,7,'#49362c');
  L(-31,-122,-26,-104,2,'#c18948');
  for(const x of [-25,25]){R(x-2,-106,4,4,'#c69f57');R(x-2,-106,2,1,'#efd195');}
  // Broad dwarf's tool belt, forged square buckle and reinforced apron hem.
  R(-37,-51,74,12,'#49362c');R(-37,-51,74,2,'#c18948');
  P([[-10,-53],[9,-53],[13,-49],[13,-39],[9,-36],[-10,-36]],'#4f6674');
  R(-9,-52,18,14,'#9dabb0');R(-5,-49,10,8,'#49362c');R(-5,-46,13,3,'#dedcc8');
  for(const bx of [-29,-19,22,31])R(bx,-47,3,3,'#c69f57');
  L(-33,-31,-7,-27,3,'#c18948');L(7,-27,32,-30,3,'#c18948');
  P([[-39,-48],[-29,-48],[-29,-28],[-39,-28]],'#563b30');R(-38,-45,8,3,'#9dabb0');
  // Leather shoulder harness sits over the tunic, clear of the bare biceps.
  for(const side of [-1,1]){
   const xx=side*32;
   L(xx,-124,side*27,-101,10,'#49362c');
   L(xx-2,-123,side*27-2,-102,3,'#c18948');
   R(xx-5,-118,10,9,'#9dabb0');R(xx-2,-116,4,5,'#49362c');
  }
  P([[-16,-78],[16,-78],[16,-60],[-14,-60]],'#563b30');R(-16,-78,32,3,'#bb8c51');
  // Rolled sleeve + broad bare bicep and forearm, three purposeful planes.
  const left={sx:-45,sy:-113,ex:-62,ey:-84,hx:restOnAnvil?-37:-47,hy:restOnAnvil?-65:-49};
  muscularArm(left,false);
  R(-15,-137,30,22,'#c08759');R(-15,-137,10,22,'#ecc18a');
  // Head is deliberately smaller than the rejected drafts (44 wide / 110 shoulders).
  P([[-22,-164],[-16,-171],[16,-171],[23,-163],[22,-137],[13,-127],[-13,-127],[-22,-138]],'#c08759');
  P([[-22,-164],[-16,-171],[0,-171],[0,-132],[-13,-127],[-22,-138]],'#ecc18a');
  P([[16,-171],[23,-163],[22,-137],[13,-127],[5,-132],[15,-141]],'#855542');
  R(-27,-156,7,13,'#ce9563');R(-27,-155,2,9,'#f1c990');R(21,-156,7,13,'#98654d');
  // Receding crown and short swept-back side hair, without hanging hair braids.
  P([[-25,-149],[-26,-170],[-17,-182],[9,-184],[23,-176],[27,-160],[23,-144],[17,-150],[17,-168],[-17,-167],[-17,-149]],'#49352f');
  P([[-17,-176],[-10,-181],[8,-181],[16,-175],[18,-164],[8,-157],[-13,-157],[-20,-165]],'#c08759');
  P([[-17,-176],[-10,-181],[2,-181],[2,-160],[-13,-157],[-20,-165]],'#ecc18a');
  P([[-26,-170],[-17,-182],[-10,-182],[-18,-174],[-21,-157],[-18,-149],[-24,-149]],'#a4774a');
  P([[11,-182],[23,-176],[27,-160],[23,-144],[17,-150],[21,-165],[18,-174]],'#80563a');
  P([[23,-162],[27,-160],[23,-144],[19,-149]],'#68452f');
  // Merchant's small squared eyes, broad brows and solid nose planes.
  R(-15,-154,10,3,'#68412d');R(6,-154,10,3,'#50352d');
  const blink=Math.sin(t*.77)>.996;
  R(-13,-147,4,blink?1:3,'#323a34');R(9,-147,4,blink?1:3,'#2b3334');
  R(-17,-140,10,2,'#dbac7a');R(12,-139,7,2,'#af7552');
  P([[-3,-153],[3,-153],[7,-139],[3,-136],[-7,-137],[-7,-140]],'#c99260');
  R(-3,-152,3,12,'#ffe0a0');P([[-7,-140],[7,-140],[3,-136],[-7,-137]],'#b7754c');
  // Full, combed central beard, with side sections parted at the cheeks.
  // Only those outer sections are braided; the centre keeps its long hair mass.
  P([[-23,-145],[-14,-137],[0,-135],[15,-137],[23,-145],[25,-128],[20,-111],[19,-94],[13,-81],[5,-73],[-5,-75],[-15,-83],[-21,-101],[-20,-116],[-25,-131]],'#68452f');
  P([[-16,-136],[-5,-134],[1,-125],[-4,-110],[-3,-97],[6,-82],[3,-74],[-7,-79],[-16,-94],[-18,-112]],'#ad753e');
  P([[-5,-134],[9,-135],[17,-125],[13,-110],[15,-94],[9,-81],[3,-74],[1,-90],[-6,-105],[0,-121]],'#996035');
  P([[12,-132],[19,-127],[16,-113],[19,-99],[13,-85],[8,-82],[12,-99],[9,-114]],'#553729');
  // Long tapered planes follow the fall of the hair, not crosswise stripes.
  P([[-12,-131],[-8,-132],[-10,-115],[-8,-103],[-3,-94],[-2,-86],[-11,-101],[-14,-115]],'#c58c4a');
  P([[1,-130],[4,-129],[0,-114],[2,-104],[8,-94],[7,-88],[-2,-102],[-4,-114]],'#ad7440');
  P([[-16,-114],[-13,-108],[-12,-96],[-6,-85],[-5,-80],[-14,-91],[-18,-103]],'#996035');
  for(const side of [-1,1]){
   // Hair flows from the jaw into the plait root: no cord starts on the chest.
   const root=side*20,base=side<0?'#ad753e':'#996035',
    light=side<0?'#c58c4a':'#ad7440',shadow=side<0?'#68452f':'#553729';
   P([[side*23,-144],[side*15,-137],[side*15,-128],[side*20,-118],[side*27,-125],[side*26,-136]],base);
   P([[side*23,-142],[side*20,-134],[side*23,-124],[side*26,-127],[side*25,-136]],light);
   // Interlocking lobes change the OUTER contour, not a zigzag painted on top.
   for(let i=0;i<5;i++){
    const yy=-129+i*8,cx=root+side*(2+Math.min(i,2)),w=6.6-i*.5;
    P([[cx-2,yy-3],[cx+w*.65,yy-2],[cx+w,yy+2],[cx+w*.65,yy+6],[cx-1,yy+11],[cx-w*.7,yy+7],[cx-w,yy+3]],shadow);
    P([[cx-w*.7,yy],[cx-2,yy-3],[cx+2,yy],[cx+w*.55,yy+5],[cx+1,yy+9],[cx-2,yy+6],[cx-w*.85,yy+4]],base);
    P([[cx-w*.7,yy],[cx-2,yy-3],[cx,yy],[cx-2,yy+3],[cx-w*.55,yy+3]],light);
    P([[cx+2,yy],[cx+w*.65,yy-2],[cx+w,yy+2],[cx+1,yy+7],[cx-1,yy+6],[cx+w*.35,yy+2]],base);
   }
   const cx=root+side*4;
   P([[cx-3,-85],[cx+3,-85],[cx+5,-77],[cx+3,-71],[cx-2,-72],[cx-5,-76]],base);
   P([[cx-3,-83],[cx-1,-82],[cx-1,-73],[cx-4,-77]],light);
   R(cx-4,-88,8,5,'#4f6674');R(cx-4,-88,6,4,'#9dabb0');R(cx-4,-88,1.5,4,'#dedcc8');
  }
  P([[-20,-136],[-8,-141],[0,-137],[-4,-132],[-17,-131],[-22,-133]],'#c39357');
  P([[0,-137],[8,-141],[19,-136],[22,-133],[16,-131],[4,-132]],'#aa7947');
  // The moustache's lower edge is enough: no separate smile/mouth mark.
  if(frontArm)hammerArm(lift,result,strike);
  g.restore();
 }
 function muscularArm(a,near){
  const {sx,sy,ex,ey,hx,hy}=a;
  L(sx,sy,ex,ey,34,'#855542');L(sx-3,sy,ex-3,ey-1,27,'#c08759');
  L(sx-9,sy-1,ex-8,ey-2,9,'#ecc18a');
  // Sleeve has its own broad face and rolled edge, not a pauldron.
  L(sx,sy-2,sx+(ex-sx)*.22,sy+(ey-sy)*.22,36,'#243943');
  L(sx-2,sy-3,sx-2+(ex-sx)*.18,sy+(ey-sy)*.18,27,'#597d7c');
  P([[ex-10,ey-7],[ex+8,ey-9],[ex+12,ey+5],[ex+4,ey+11],[ex-10,ey+7]],'#c08759');
  L(ex,ey,hx,hy,28,'#855542');L(ex-2,ey-2,hx-2,hy-2,21,'#c08759');
  L(ex-8,ey-2,hx-6,hy-2,6,'#ecc18a');
  const dx=hx-ex,dy=hy-ey,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
  L(hx-dx*.20+nx*12,hy-dy*.20+ny*12,hx-dx*.20-nx*12,hy-dy*.20-ny*12,7,'#49362c');
  R(hx-9,hy-7,18,16,'#855542');R(hx-9,hy-7,13,14,'#c08759');R(hx-9,hy-7,5,12,'#ecc18a');
  for(let i=0;i<3;i++)R(hx-5+i*4,hy+3,2,4,'#b7754c');
 }
 const FORGE_CONTACT=Object.freeze({x:315,y:235});
 const ACTOR=Object.freeze({x:300,y:318,scale:1.25});
 const ARM_LENGTHS=Object.freeze({upper:37,lower:40});
 function solveArm(hx,hy){
  const sx=46,sy=-113,dx=hx-sx,dy=hy-sy,d=Math.hypot(dx,dy),u=ARM_LENGTHS.upper,v=ARM_LENGTHS.lower,
   a=(u*u-v*v+d*d)/(2*d),h=Math.sqrt(Math.max(0,u*u-a*a)),nx=-dy/d,ny=dx/d,
   sign=nx>=0?1:-1,ex=sx+dx/d*a+nx*h*sign,ey=sy+dy/d*a+ny*h*sign;
  return {sx,sy,ex,ey,hx,hy};
 }
 const contactLocal={x:(FORGE_CONTACT.x-ACTOR.x)/ACTOR.scale,y:(FORGE_CONTACT.y-ACTOR.y)/ACTOR.scale};
 const lowArm=solveArm(contactLocal.x+31,contactLocal.y-10),highArm=solveArm(49,-155);
 const shortAngle=(a,b)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a));
 function armPose(lift=0){
  const u=clamp(lift,0,1),aa=Math.atan2(lowArm.ey-lowArm.sy,lowArm.ex-lowArm.sx),
   ab=shortAngle(aa,Math.atan2(highArm.ey-highArm.sy,highArm.ex-highArm.sx)),
   ba=Math.atan2(lowArm.hy-lowArm.ey,lowArm.hx-lowArm.ex),
   bb=shortAngle(ba,Math.atan2(highArm.hy-highArm.ey,highArm.hx-highArm.ex)),
   a=lerp(aa,ab,u),b=lerp(ba,bb,u),sx=46,sy=-113,
   ex=sx+Math.cos(a)*37,ey=sy+Math.sin(a)*37,
   hx=ex+Math.cos(b)*40,hy=ey+Math.sin(b)*40,angle=lerp(Math.PI,4.45,u);
  return {sx,sy,ex,ey,hx,hy,angle,
   contactX:hx+31*Math.cos(angle)+10*Math.sin(angle),
   contactY:hy+31*Math.sin(angle)-10*Math.cos(angle)};
 }
 function hammerArm(lift,result,strike){
  const a=armPose(lift);muscularArm(a,true);
  // Handle, head and wrist share one transform; bottom face reaches FORGE_CONTACT.
  g.save();g.translate(a.hx,a.hy);g.rotate(a.angle);
  R(-6,-3,37,6,'#684933');R(-6,-3,36,2,'#b28a50');
  P([[24,-10],[37,-10],[41,-6],[41,7],[37,10],[24,10]],'#293844');
  R(24,-10,13,20,'#9dabb0');R(24,-10,4,20,'#dedcc8');
  P([[37,-10],[41,-6],[41,7],[37,10]],'#4f6674');g.restore();
  R(a.hx-7,a.hy-5,14,11,'#c08759');R(a.hx-7,a.hy-5,4,11,'#ecc18a');
  for(let i=0;i<3;i++)R(a.hx-3+i*3,a.hy+1,1,4,'#855542');
 }
 function drawAnvilItem(kind,x=FORGE_CONTACT.x,y=FORGE_CONTACT.y){
  // Production prop art, transformed into the horizontal anvil plane.
  // Contact is the visual centre of the workpiece, not an upright icon's foot.
  g.save();g.translate(x,y);
  // The production bow is already horizontal. Show its side profile, resting
  // on its grip; the flattened shield-plane transform erased its limb bends.
  if(kind==='bow'){drawSmithItem(kind,0,1.4*2.05,2.05);g.restore();return;}
  if(kind==='gauntlet'){
   // Pitch the glove toward the viewer, not diagonally across the tabletop.
   // Extruded cuff/palm/finger edges give the production top art real thickness.
   const outline=[[-4,3],[.5,3],[.5,1],[0,1],[0,-1.2],[1.7,-3.5],[.7,-4.1],[.25,-3.3],
    [.25,-5.25],[-.15,-5.25],[-.15,-6],[-1.2,-6],[-1.2,-5.25],[-1.45,-5.25],
    [-1.45,-6],[-2.5,-6],[-2.5,-5.25],[-2.75,-5.25],[-2.75,-6],[-3.8,-6],
    [-3.8,-5.25],[-4.25,-5.25],[-4.25,-.75],[-4,-.75]],
    project=([u,v])=>{const ax=-(v+2)*U*2.1,ay=(u+1.4)*U*2.1;return [ax-.20*ay,.55*ay];},
    top=outline.map(project),depth=4;
   for(let i=0;i<top.length;i++){
    const a=top[i],b=top[(i+1)%top.length];
    P([a,b,[b[0],b[1]+depth],[a[0],a[1]+depth]],b[0]>a[0]?'#536574':'#344653');
   }
   g.transform(1,0,-.20,.55,0,0);g.rotate(Math.PI/2);g.scale(2.1,2.1);
   g.translate(1.4*U,2*U);drawSmithItem(kind,0,0,1);g.restore();return;
  }
  g.transform(1,0,-.30,.22,0,0);
  if(kind==='shield'){g.rotate(-Math.PI/2);drawSerJonathanShield(0,0,0,0,3.7,.75);}
  else {g.rotate(Math.PI/2);g.scale(2.1,2.1);g.translate(1.4*U,2*U);drawSmithItem(kind,0,0,1);}
  g.restore();
 }
 function furnace(x,y,s=1,t=perfNow){
  g.save();g.translate(x,y);g.scale(s,s);
  P([[-43,0],[-43,-96],[-28,-113],[28,-113],[44,-96],[44,0]],'#30333a');
  P([[29,-112],[44,-96],[44,0],[31,-5]],'#20272f');
  R(-36,-94,67,79,'#5c6167');R(-25,-76,44,56,'#181d26');
  P([[-27,-20],[-27,-66],[-16,-83],[9,-83],[22,-66],[22,-20]],'#201b21');
  P([[-22,-22],[-22,-49],[-14,-57],[-7,-42],[1,-66],[13,-48],[18,-22]],'#bc4b2c');
  P([[-18,-22],[-12,-47],[-5,-36],[3,-51],[13,-30],[13,-22]],'#ed943b');
  P([[-11,-22],[-5,-39],[2,-31],[6,-39],[10,-22]],'#ffe3a0');
  for(let i=0;i<4;i++){R(-29+i*16,-98,13,10,'#82847f');R(-36,-80+i*16,9,13,'#787970');R(24,-80+i*16,8,13,'#494f59');}
  P([[-48,-20],[36,-24],[51,-15],[42,-8],[-47,-8]],'#9b8170');
  R(-43,-8,85,8,'#3a3234');R(-38,-3,74,3,'#c27848');
  for(let i=0;i<3;i++){const h=(t*10+i*13)%33;R(-8+i*8,-38-h,2,3,i%2?'#e9aa5c':'#ffd58a');}
  g.restore();
 }
 function house(animate=true,includeSmith=true){
  const t=animate?perfNow:0;
  P([[-183,5],[-155,-9],[143,-13],[187,8],[148,20],[-151,20]],'#252a32');
  // Gabled front and a shallow, consistently receding right side.
  P([[-151,0],[-151,-145],[-27,-221],[112,-144],[112,0]],'#4c525b');
  P([[112,-144],[167,-166],[167,-12],[112,0]],'#2d3642');
  for(let row=0;row<5;row++)for(let col=0;col<7;col++){
   const x=-144+col*36+(row%2?12:0),y=-135+row*27;
   if(x>90)continue;R(x,y,31,22,(row+col)%3?'#555e68':'#626973');R(x,y,31,2,'#788087');
  }
  P([[-172,-144],[-29,-236],[128,-146],[112,-134],[-28,-214],[-157,-132]],'#252f3a');
  P([[-29,-236],[25,-253],[187,-169],[128,-146]],'#465363');
  P([[-29,-236],[25,-253],[187,-169],[184,-163],[25,-244],[-29,-228]],'#8b959b');
  for(let k=1;k<5;k++)L(-29+31*k,-236+18*k,25+32*k,-253+17*k,2,'#27333f');
  P([[-97,-189],[-97,-258],[-65,-267],[-45,-256],[-45,-219]],'#333d49');
  P([[-97,-258],[-65,-267],[-45,-256],[-77,-247]],'#818b91');
  R(-94,-254,16,62,'#5c6772');R(-93,-259,43,8,'#9c9f96');
  const depthAlpha=g.globalAlpha;
  if(animate)for(let i=0;i<3;i++){
   const age=(t*.17+i/3)%1;g.globalAlpha=depthAlpha*.12*(1-age);
   P([[-78+age*24,-267-age*55],[-87+age*23,-274-age*55],[-80+age*28,-287-age*55],[-62+age*26,-282-age*55],[-58+age*25,-270-age*55]],'#d0cbc0');
  }g.globalAlpha=depthAlpha;
  // Open work bay, lintel, timber doors, wall-mounted tools and forge.
  P([[-24,0],[-24,-126],[-10,-143],[74,-143],[91,-126],[91,0]],'#151e29');
  R(-29,-139,8,137,'#85898b');R(90,-138,9,138,'#727c87');R(-27,-146,124,10,'#9da3a3');
  R(98,-116,9,109,'#48525f');R(103,-110,3,92,'#687382');
  furnace(-100,-6,.81,t);
  R(-5,-127,69,4,'#856f53');
  for(const [x,len]of [[7,25],[31,33],[54,21]]){R(x,-125,3,len,'#a89b7d');R(x-5,-125+len,13,6,'#9baeb6');}
  P([[-6,-168],[48,-168],[55,-158],[48,-151],[-6,-151],[-12,-159]],'#293844');
  R(10,-165,26,4,'#bdc7c4');P([[10,-161],[31,-161],[27,-157],[17,-157],[15,-154],[12,-154]],'#bdc7c4');
  P([[-38,0],[99,0],[117,10],[-47,13]],'#717b80');P([[-47,13],[117,10],[117,17],[-47,20]],'#3a424e');
  rock(-157,6,.62,0);rock(157,4,.62,2);
  if(includeSmith){dwarf(35,-1,.69,t);anvil(53,-2,.76);}
 }
 function drawProp(item){
  if(item.kind==='venue'&&!journeyVenueVisible(item.slotId))return;
  const p=journeyDecorProjection(item);if(!p)return;
  const s=p.scale*1.45;if(p.x+210*s<0||p.x-210*s>VW)return;
  g.save();
  // Match the shared venue skirt reveal as the doorstep crosses the crest.
  if(item.kind==='venue'&&curvedWorldActive()){
   const reveal=smoothStep(clamp((CFG.Z_FAR-p.z)/12,0,1));
   if(reveal<1){g.beginPath();g.rect(-VW*4,-PAD_TOP-4096,VW*9,curvedSpriteClipY(p.z)+24*reveal+PAD_TOP+4096);g.clip();}
  }
  g.translate(p.x,p.y);g.scale(s,s);
  // Natural entrance/exit: props retain fixed anchors and inherit depth reveal.
  g.globalAlpha=p.alpha;
  if(item.kind==='venue')house(true,true);
  else if(item.kind==='sign'){rock(0,0,.95,0,true);L(-4,-55,23,-71,4,'#a8afb0');L(9,-79,23,-65,6,'#a8afb0');}
  else if(item.kind==='ash')ash(0,0,item.size);
  else rock(0,0,item.size,item.ore,item.kind==='columns');g.restore();
 }
 function queueView(view){
  const enqueue=(at,off,data)=>{const p=view.point(at,off),c=journeyCameraPoint(p.x,p.z);
   if(c.depth>-6&&c.depth<SPAWN_FAR)queueWorldDraw(c.depth,drawProp,{...p,...data});};
  if(view.spill){enqueue(view.begin+42.5,view.onlySide*7,{kind:'sign'});return;}
  for(const item of layout(view.edge))enqueue(item.at,item.offset,item);
  const slot=view.edge.events.find(e=>e.definition==='forge_stop');
  if(slot&&journeyVenueVisible(slot.id))enqueue(slot.at+8,0,{kind:'venue',slotId:slot.id});
 }
 function workshop(t=perfNow){
  // Fixed camera: horizon y=164, back wall/floor join y=240; vanishing point
  // (245,164). Native geometry stays crisp at any screen DPR.
  R(0,-PAD_TOP,480,380+PAD_TOP,'#252e3a');
  P([[0,0],[63,38],[63,238],[0,306]],'#323d49');
  P([[63,38],[432,38],[432,240],[63,238]],'#424c58');
  P([[432,38],[480,0],[480,307],[432,240]],'#202b38');
  for(let row=0;row<6;row++)for(let col=0;col<7;col++){
   const x=67+col*53+(row%2?18:0);if(x>414)continue;
   R(x,42+row*32,Math.min(48,429-x),28,(row+col)%3?'#485563':'#53616d');
   R(x,42+row*32,Math.min(48,429-x),2,'#6c7880');
  }
  P([[0,306],[63,238],[432,240],[480,307],[480,380],[0,380]],'#55545a');
  for(const x of [-280,-95,65,240,420,590,800])L(245+(x-245)*.34,240,x,380,1,'#383f48');
  L(0,312,480,313,2,'#41434b');L(0,359,480,359,2,'#41434b');
  R(54,32,11,209,'#202c36');R(428,32,10,209,'#192530');R(53,30,385,12,'#768087');
  // Tall exhaust hood connects directly to the forge on the left.
  P([[74,174],[78,104],[104,75],[158,75],[181,107],[184,174]],'#27323d');
  P([[104,75],[104,-PAD_TOP],[156,-PAD_TOP],[156,75]],'#3a4653');
  R(109,-PAD_TOP,9,75+PAD_TOP,'#717d84');L(102,73,158,73,4,'#9eaaad');
  furnace(128,302,1.43,t);
  // Warm reflected planes remain local; no global colour filter.
  P([[69,309],[154,296],[221,342],[174,346],[156,331],[69,333]],'#6a605a');
  P([[83,309],[146,303],[166,317],[89,322]],'#847263');
  R(349,89,60,7,'#263541');R(356,96,3,39,'#9b8766');R(377,96,3,46,'#9b8766');R(397,96,3,31,'#9b8766');
  R(350,130,14,9,'#9bafb6');L(370,141,387,131,4,'#a9b7bb');R(390,126,17,6,'#a9b7bb');
  R(349,212,65,8,'#ae8552');R(353,220,7,55,'#5d4d41');R(405,220,7,61,'#453d37');
  rock(376,209,.38,1);rock(404,207,.3,2);
  // Quench tub stands on the same floor plane, to the right of the worker.
  P([[396,279],[429,274],[448,283],[448,327],[398,336],[383,322],[383,288]],'#4b463f');
  P([[383,288],[396,279],[429,274],[448,283],[435,294],[402,300]],'#918574');
  P([[392,287],[400,282],[428,278],[440,284],[431,289],[403,294]],'#2c4c5b');
  L(387,305,446,298,4,'#25343f');L(396,328,446,319,4,'#25343f');
 }
 const UI={confirm:{x:28,y:677,w:278,h:47},leave:{x:320,y:677,w:132,h:47}};
 const card=i=>({x:28+i%2*217,y:399+Math.floor(i/2)*91,w:207,h:80});
 function button(r,label,enabled=true){
  P([[r.x+5,r.y],[r.x+r.w-5,r.y],[r.x+r.w,r.y+5],[r.x+r.w,r.y+r.h-5],[r.x+r.w-5,r.y+r.h],[r.x+5,r.y+r.h],[r.x,r.y+r.h-5],[r.x,r.y+5]],enabled?'#475967':'#303b47');
  R(r.x+6,r.y+3,r.w-12,2,enabled?'#d4a65c':'#56616a');
  smithText(label,r.x+r.w/2,r.y+r.h/2+5,12,enabled?'#f2dfb7':'#839099',r.w-12);
 }
 function drawUI(shop){
  g.save();g.setTransform(viewScale,0,0,viewScale,viewX,viewY);
  R(0,-PAD_TOP,VW,VH+PAD_TOT,'#192632');
  if(!window.KRCutscenes?.draw('basalt-forge',perfNow)){
  workshop();
  const work=!!shop.order&&shop.phase!=='browse',t=shop.clock,
   slam=work?smoothStep(clamp((t-1.28)/.27,0,1)):0,
   strike=slam*(1-smoothStep(clamp((t-1.82)/.55,0,1))),
   lift=work?smoothStep(clamp((t-.35)/.88,0,1))*(1-slam):0,
   result=work&&t>SMITH_RULES.rarity?(shop.order.success?'success':'fail'):null;
  dwarf(285,359,1.21,perfNow,lift,result,strike,false);anvil(308,339,1.04);
  if(work){drawAnvilItem(smithItemKind(shop.order.skillId),299.52,278.65);
   if(t>1.55&&t<2.05)for(let i=0;i<7;i++)R(299+Math.cos(i*1.9)*(t-1.55)*80,281-Math.abs(Math.sin(i*1.9))*(t-1.55)*100,3,3,'#f3ce7e');}
  g.save();g.translate(285,359);g.scale(1.21,1.21);
  hammerArm(lift,result,strike);g.restore();
  }
  const work=!!shop.order&&shop.phase!=='browse',t=shop.clock;
  R(16,14,190,48,'#202d39');R(16,14,3,48,'#c89b56');
  smithText('BASALT HEARTH',111,35,16,'#eed7a6');smithText('BORIN · DWARVEN SMITH',111,51,9,'#aebfc7');
  R(294,351,168,23,'#202d39');drawCoin(311,362,.4,.25);smithText(String(gold),344,367,12,'#e5c776');
  drawScrapIcon(397,362,.4);smithText(String(scrap),430,367,12,'#c6d3d7');
  // UI is a slate order ledger, not the town smith's spread of tilted cards.
  P([[0,374],[480,374],[480,800],[0,800]],'#1d2b37');R(0,374,480,5,'#7f8d92');
  if(!work){
   for(let i=0;i<runSkills.length;i++){
    const r=card(i),q=shop.cards[i],sel=i===shop.selected;
    R(r.x,r.y,r.w,r.h,sel?'#425461':'#293b48');R(r.x,r.y,4,r.h,sel?'#e9b967':'#657b87');
    drawSmithItem(smithItemKind(runSkills[i].baseId),r.x+32,r.y+31,.74);
    const labels=['SHARPSHOOT','MARK BURST','SHIELD BASH','CALL SQUIRE'];
    smithText(labels[i]||runSkills[i].name,r.x+127,r.y+22,11,sel?'#f5e2b6':'#bbcbd0',146);
    smithText('LV '+q.depth+' / 4',r.x+126,r.y+40,10,'#9eafb6');
    drawCoin(r.x+82,r.y+61,.37,.25);smithText(q.maxed?'—':String(q.price),r.x+105,r.y+65,11,'#dfc58a');
    drawScrapIcon(r.x+137,r.y+61,.37);smithText(q.maxed?'APEX':String(q.scrapCost),r.x+167,r.y+65,11,'#b6c7ce');
   }
   const q=shop.cards[shop.selected],skill=runSkills[shop.selected];
   smithText(skill.evolutionName||skill.name,240,602,15,'#f1d5a1',419);
   smithText(q.maxed?'APEX REACHED':q.fail?Math.round(q.fail*100)+'% FAIL · HALF COINS REFUNDED':'FIRST UPGRADE GUARANTEED',240,624,11,'#9eb9c7',419);
   smithText(shop.message||'Choose your craft. I will wake the steel.',240,651,11,shop.message?'#efad83':'#c7c4b8',424);
   button(UI.confirm,q.maxed?'APEX COMPLETE':'FORGE UPGRADE',!q.maxed&&gold>=q.price&&scrap>=q.scrapCost);
  }else{
   const reveal=t>=SMITH_RULES.reveal,quality=t>=SMITH_RULES.rarity,o=shop.order,
    c=quality?(o.success?SKILL_MUTATION_RARITY_COL[o.rarity]:'#d9987d'):'#b5c1c7';
   R(44,401,392,241,'#293c49');R(44,401,392,4,c);
   smithText(!reveal?'THE HAMMER IS SPEAKING...':quality?(o.success?'A FINE PIECE OF WORK':'EVEN STONE HAS BAD DAYS'):'A NEW TECHNIQUE',240,434,14,c,369);
   drawSmithItem(smithItemKind(o.skillId),240,486,1.6,!quality);
   smithText(reveal?(o.success?o.command.evolutionName||o.command.name:'The metal would not hold.'):'Heating · shaping · tempering',240,548,15,c,352);
   if(quality){smithText(o.success?o.rarity:'RETURNED: '+o.refund+' COINS',240,579,13,c);
    smithText(o.success?'Your new upgrade is ready.':'Scrap was consumed in the attempt.',240,607,11,'#b4c4c9');}
   button(UI.confirm,shop.phase==='result'?'TAKE IT':'FORGING...',shop.phase==='result');
  }
  button(UI.leave,'RIDE ON',shop.phase==='browse');
  smithText('Gold + scrap · Upgrades last for this journey',240,754,10,'#8d9fa8');g.restore();
 }
 function tap(pt){
  const shop=blacksmithShop;if(!shop?.roadToken)return false;
  if(mode!=='shop'||paused)return false;
  if(shop.phase==='result'&&pointInRect(pt,UI.confirm)){shop.phase='browse';shop.order=null;refreshSmithCards();return true;}
  if(shop.phase!=='browse')return false;
  for(let i=0;i<runSkills.length;i++)if(pointInRect(pt,card(i))){shop.selected=i;shop.message='';SFX.swipe();return true;}
  if(pointInRect(pt,UI.confirm))return beginSmithUpgrade();
  if(pointInRect(pt,UI.leave)){blacksmithShop=null;setMode('journeyroadresume');return true;}
  return false;
 }
 function drawCutscene(time,sceneLit=true){
  const plate=window.KREventVisuals?.peek('basalt-forge'),shop=blacksmithShop;
  if(!plate||!shop?.roadToken)return false;
  g.save();try{
   g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
   g.drawImage(plate,0,0,480,360);
   const work=!!shop.order&&shop.phase!=='browse',t=shop.clock,
    slam=work?smoothStep(clamp((t-1.28)/.27,0,1)):0,
    strike=slam*(1-smoothStep(clamp((t-1.82)/.55,0,1))),
    lift=work?smoothStep(clamp((t-.35)/.88,0,1))*(1-slam):0,
    result=work&&t>SMITH_RULES.rarity?(shop.order.success?'success':'fail'):null;
   const breath=work?0:Math.sin(time*1.8)*.35;
   withActorLighting(sceneLit,()=>dwarf(ACTOR.x,ACTOR.y+breath,ACTOR.scale,time,lift,result,strike,false,true));
   // Static foreground reuses the SAME image, not an extra decoded mask/plate.
   // Coordinates follow the actual generated anvil, not the prompt's requested position.
   g.save();g.beginPath();
   const outline=[[635,710],[778,702],[809,693],[1129,697],[1124,713],[1202,718],[1205,765],
    [1115,786],[1083,825],[1071,850],[1103,875],[1146,880],[1168,889],[1177,1025],
    [1113,1079],[740,1086],[695,1035],[706,950],[715,900],[739,881],[768,875],
    [795,832],[804,810],[777,790],[703,760],[656,730]];
   outline.forEach(([x,y],i)=>i?g.lineTo(x*480/1448,y*360/1086):g.moveTo(x*480/1448,y*360/1086));
   g.closePath();g.clip();g.drawImage(plate,0,0,480,360);g.restore();
   if(work)drawAnvilItem(smithItemKind(shop.order.skillId));
   g.save();g.translate(ACTOR.x,ACTOR.y+breath);g.scale(ACTOR.scale,ACTOR.scale);
   withActorLighting(sceneLit,()=>hammerArm(lift,result,strike));g.restore();
   if(work&&t>1.55&&t<2.05)for(let i=0;i<7;i++)R(FORGE_CONTACT.x+Math.cos(i*1.9)*(t-1.55)*80,FORGE_CONTACT.y-Math.abs(Math.sin(i*1.9))*(t-1.55)*100,2,3,'#fbd093');
   return true;
  }finally{g.restore();}
 }
 window.KRBasaltForge={assetId:'basalt-forge',drawCutscene,hazard,layout,floorDetails,queueView,house,dwarf,muscularArm,hammerArm,anvil,workshop,drawUI,tap,UI,card,armPose,ARM_LENGTHS,ACTOR,FORGE_CONTACT,drawAnvilItem};
})();
