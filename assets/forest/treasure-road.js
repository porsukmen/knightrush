/* Gilded Grove. Native articulated chest + isolated mechanical lock close-up.
   Gameplay owns route/claims. One shared, bounded cutscene plate owns scenery. */
(()=>{
 'use strict';
 const P=expPoly,R=expRect,L=expSegment;
 const C={gold:'#d3a34c',light:'#ffe29a',shade:'#846037',dark:'#302b26',wood:'#315951',side:'#203e3c',edge:'#102d30'};
 const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
 const difficulties=Object.freeze({
  easy:{label:'EASY',rise:[.40,.55,.70],apex:[.18,.24,.31],drop:[.24,.30,.38],picks:5,reset:0},
  normal:{label:'NORMAL',rise:[.30,.43,.58],apex:[.09,.13,.18],drop:[.16,.22,.28],picks:4,reset:1},
  hard:{label:'HARD',rise:[.23,.34,.49],apex:[.045,.075,.115],drop:[.10,.15,.22],picks:3,reset:2},
  master:{label:'MASTER',rise:[.18,.25,.34],apex:[.025,.035,.05],drop:[.07,.10,.13],picks:2,reset:5}
 });
 let selectedDifficulty='hard';
 const difficultyOf=l=>difficulties[l?.difficulty||selectedDifficulty];
 const difficultyRect=i=>({x:28+i*108,y:727,w:100,h:36});
 function selectDifficulty(key){
  if(!difficulties[key]||!lockpickGame||lockpickGame.phase!=='intro'||paused)return false;
  selectedDifficulty=key;lockpickGame.difficulty=key;return true;
 }
 function chest(x,y,s=1,opening=0,t=0){
  // Scene-local chest materials: upper-left amber light, brown/olive shade.
  // Do not recolour road inlays, the lock close-up or UI with this palette.
  const C={gold:'#be913f',light:'#ebc977',shade:'#886131',dark:'#403425',wood:'#936536',side:'#64482e',edge:'#3b3326'};
  const a=clamp(Number(opening),0,1),angle=a*1.82;
  g.save();g.translate(x,y);g.scale(s,s);
  // Frontal visitor POV: the lock faces us, rear edges converge symmetrically.
  const q=(x,y,z)=>[x*(1-z*.0014),-y-z*.29];
  const face=(v,c)=>P(v.map(v=>q(...v)),c);
  const front=(x,y,w,h,c)=>face([[x,y,0],[x+w,y,0],[x+w,y+h,0],[x,y+h,0]],c);
  const lidQ=(x,y,z)=>{const dy=y-68,dz=z-66;return q(x,68+dy*Math.cos(angle)-dz*Math.sin(angle),66+dy*Math.sin(angle)+dz*Math.cos(angle));};
  const lidFace=(v,c)=>P(v.map(v=>lidQ(...v)),c);
  P([[-66,2],[-55,-16],[53,-19],[73,-3],[58,5],[-47,6]],'#625231');
  const lid=()=>{
   const section=[[0,68],[0,82],[13,100],[49,100],[66,83],[66,68]];
   const visible=(dy,dz)=>dy*Math.cos(angle)-dz*Math.sin(angle)+.29*(dy*Math.sin(angle)+dz*Math.cos(angle))>0;
   // Lid is a rigid extrusion rotating about its real rear hinges.
   lidFace(section.map(([z,y])=>[66,y,z]),C.side);
   for(let i=0;i<section.length-1;i++){
    const [z0,y0]=section[i],[z1,y1]=section[i+1];
    if(!visible(y1-y0,z1-z0))continue;
    lidFace([[-66,y0,z0],[66,y0,z0],[66,y1,z1],[-66,y1,z1]],['#865930','#b48244','#a9773b','#755332','#58402c'][i]);
    for(const bx of [-59,44])lidFace([[bx,y0+.5,z0],[bx+15,y0+.5,z0],[bx+15,y1+.5,z1],[bx,y1+.5,z1]],i===2?C.light:i===1?C.gold:C.shade);
   }
   if(visible(1,0))lidFace([[-66,70,0],[66,70,0],[66,77,0],[-66,77,0]],C.gold);
   if(visible(0,1)){
   lidFace([[-26,100.7,22],[0,100.7,14],[26,100.7,22],[0,100.7,45]],C.gold);
   lidFace([[-16,101,22],[0,101,13],[16,101,22],[0,101,36]],C.edge);
   lidFace([[-9,101.2,22],[0,101.2,17],[9,101.2,22],[0,101.2,31]],'#a75035');
   }
   if(visible(1,0))lidFace([[-7,69,-1],[9,69,-1],[9,82,-1],[-7,82,-1]],C.light);
   if(visible(0,-1)){
    lidFace([[-66,68,0],[66,68,0],[66,68,66],[-66,68,66]],C.gold);
    // All lining belongs to ONE underside plane, behind the rigid brass frame.
    lidFace([[-54,67.8,7],[54,67.8,7],[54,67.8,59],[-54,67.8,59]],'#9b703e');
    lidFace([[-47,67.6,13],[47,67.6,13],[47,67.6,53],[-47,67.6,53]],'#725032');
    for(const z of [25,39])lidFace([[-47,67.4,z],[47,67.4,z],[47,67.4,z+1],[-47,67.4,z+1]],'#604630');
    for(const x of [-42,36])lidFace([[x,67.2,13],[x+6,67.2,13],[x+6,67.2,53],[x,67.2,53]],'#af8449');
   }
  };
  face([[-66,8,66],[66,8,66],[66,68,66],[-66,68,66]],C.edge);
  face([[-66,68,0],[66,68,0],[66,68,66],[-66,68,66]],C.gold);
  face([[-59,66,6],[59,66,6],[59,66,60],[-59,66,60]],'#3a3022');
  if(a>.01){
   for(let i=0;i<19;i++){
    const cx=-48+(i%6)*18+(i%2)*2,cz=8+Math.floor(i/6)*15,h=57+(i%3)*3;
    face([[cx-7,h,cz],[cx-4,h+3,cz+5],[cx+6,h+3,cz+5],[cx+9,h,cz],[cx+5,h-3,cz-3],[cx-5,h-3,cz-3]],i%3?C.gold:C.light);
   }
  }
  face([[66,8,0],[66,8,66],[66,68,66],[66,68,0]],C.side);
  front(-66,8,132,60,C.wood);
  // Broad bevels and supported plank joins, not noisy wood texture.
  face([[-64,14,0],[-59,18,0],[-59,58,0],[-64,62,0]],'#bc8c4d');
  face([[29,14,0],[63,14,0],[63,60,0],[45,54,0]],'#805632');
  front(-60,59,119,3,'#c29552');front(-60,14,119,3,'#77512d');
  for(const xx of [-39,-19,20,40]){front(xx,18,1,39,'#74502e');front(xx+1,18,1,39,'#ac7c42');}
  front(-67,8,134,8,C.shade);front(-67,63,134,7,C.gold);front(-66,68,132,2,C.light);
  for(const bx of [-59,44]){
   front(bx,12,15,52,C.gold);front(bx,12,2,52,C.light);front(bx+12,12,3,52,C.shade);
   for(const yy of [20,52]){front(bx+6,yy,4,4,C.shade);front(bx+6,yy+2,2,2,C.light);}
  }
  for(const yy of [12,61])face([[66,yy,0],[66,yy,66],[66,yy+6,66],[66,yy+6,0]],C.shade);
  face([[66.2,30,20],[66.2,46,20],[66.2,46,45],[66.2,30,45]],C.gold);
  face([[66.4,32,24],[66.4,42,24],[66.4,42,41],[66.4,32,41]],C.edge);
  for(const xx of [-57,45]){front(xx,0,13,10,'#252b28');front(xx,6,13,4,C.gold);}
  // A raised lid is above the rim from the very first frame. No threshold
  // switch between drawing behind/in front of the chest body.
  lid();
  P([[-16,-49],[-9,-60],[11,-60],[19,-49],[15,-30],[-12,-30]],C.shade);
  P([[-13,-49],[-7,-56],[9,-56],[15,-48],[12,-34],[-9,-34]],C.light);
  R(-2,-51,5,7,C.edge);P([[-1,-45],[1,-45],[4,-38],[-4,-38]],C.edge);
  g.restore();
 }
 const layouts=new WeakMap();
 function layout(edge){
  if(layouts.has(edge))return layouts.get(edge);
  const random=journeyRandom(journeyKeySeed(journeyRoute.seed,'gilded:'+edge.id)),list=[],slot=edge.events.find(e=>e.definition==='chest_stop');
  for(const side of [-1,1])for(let at=edge.pieces[0].start+20+random()*12;at<edge.pieces.at(-1).end-20;at+=32+random()*22){
   if(slot&&Math.abs(at-slot.at)<34)continue;
   list.push({at,offset:side*(8.5+random()*1.3),kind:['urn','marker','crystals'][list.length%3],size:.8+random()*.2});
  }layouts.set(edge,list);return list;
 }
 function floorDetails(view,row,a,b){
  const out=[],shape=(pts,color)=>out.push({color,treasureBuilt:true,vertices:pts.map(([x,z])=>view.point(z,x))});
  // Narrow gold inlays: no full-road overlay, no animated/rebuilt tile sheet.
  for(const x of [-4.6,4.45])shape([[x,a],[x+.15,a],[x+.15,b],[x,b]],'#c49c48');
  if(Math.abs(row)%3===0){
   const m=(a+b)/2;
   shape([[0,a+.3],[1.8,m],[0,b-.3],[-1.8,m]],'#91672e');
   shape([[0,a+.55],[1.5,m],[0,b-.55],[-1.5,m]],'#e4bc60');
   shape([[0,a+.85],[1.12,m],[0,b-.85],[-1.12,m]],'#ad8948');
  }return out;
 }
 function pillar(x,y,s=1){
  g.save();g.translate(x,y);g.scale(s,s);
  P([[-17,0],[-17,-60],[7,-67],[21,-59],[21,-4],[6,4]],'#a38d5f');
  P([[7,-67],[21,-59],[21,-4],[6,4]],'#685d40');R(-14,-58,4,52,'#d3bf81');
  P([[-21,-59],[7,-69],[24,-60],[7,-51]],'#e5c98a');
  P([[-20,-1],[7,-9],[25,1],[6,9],[-20,5]],'#85744d');
  P([[-3,-46],[5,-37],[-3,-27],[-11,-37]],C.gold);P([[-3,-42],[1,-37],[-3,-32],[-7,-37]],C.edge);
  g.restore();
 }
 function venue(){
  // Squared dressed-stone dais: concentric steps, visible risers and corner caps.
  P([[-135,19],[-98,-5],[99,-5],[135,19],[110,37],[-110,37]],'#84734f');
  P([[-135,19],[-110,37],[110,37],[135,19],[135,28],[110,46],[-110,46],[-135,28]],'#554935');
  P([[-119,5],[-83,-21],[84,-21],[120,5],[94,23],[-94,23]],'#b19a68');
  P([[-119,5],[-94,23],[94,23],[120,5],[120,14],[94,32],[-94,32],[-119,14]],'#796140');
  P([[-102,-5],[-74,-29],[74,-29],[102,-5],[80,12],[-80,12]],'#dac28a');
  P([[-102,-5],[-80,12],[80,12],[102,-5],[102,4],[80,20],[-80,20],[-102,4]],'#9b7c4a');
  P([[-87,-5],[-66,-22],[66,-22],[87,-5],[73,6],[-73,6]],'#b7a070');
  for(const x of [-62,0,61]){L(x,24,x,31,1,'#594a35');L(x-20,38,x-20,45,1,'#3e382d');}
  pillar(-121,-10,1.3);pillar(126,-23,1.2);
  // Low ruined arch keeps the reward readable instead of a giant road billboard.
  for(const [x,h]of [[-86,111],[88,111]]){R(x-12,-h,24,h-20,'#a18a59');R(x-12,-h,6,h-20,'#d3b878');}
  P([[-98,-104],[-74,-131],[-28,-150],[36,-148],[93,-120],[100,-101],[74,-107],[29,-126],[-23,-129],[-64,-113],[-75,-99]],'#bba269');
  P([[-28,-150],[6,-158],[36,-148],[30,-126],[-23,-129]],'#ead097');
  P([[-7,-140],[4,-149],[15,-140],[4,-132]],C.shade);
  chest(0,4,.95);
 }
 function prop(item){
  if(item.kind==='venue'&&!journeyVenueVisible(item.slotId))return;
  const p=journeyDecorProjection(item);if(!p)return;
  const s=p.scale*1.4,extent=item.kind==='venue'?150:38;
  if(p.x+extent*s<0||p.x-extent*s>VW)return;
  g.save();
  if(item.kind==='venue'&&curvedWorldActive()){
   const reveal=smoothStep(clamp((CFG.Z_FAR-p.z)/12,0,1));
   const bottom=curvedSpriteClipY(p.z)+48*s*reveal;
   g.beginPath();g.rect(-VW*4,-PAD_TOP-4096,VW*9,bottom+PAD_TOP+4096);g.clip();
  }
  g.globalAlpha=p.alpha;g.translate(p.x,p.y);g.scale(s,s);
  if(item.kind==='venue')venue();
  else if(item.kind==='marker')pillar(0,0,item.size||1);
  else if(item.kind==='ore'){
   // A grounded mineral seam hints at the biome; never a miniature event sign.
   P([[-33,1],[-25,-14],[-9,-22],[12,-19],[30,-8],[35,3],[6,7]],'#776b4d');
   P([[-25,-14],[-9,-22],[12,-19],[4,-8],[-12,-4]],'#a08b5d');
   P([[4,-8],[12,-19],[30,-8],[35,3],[6,7]],'#5e5740');
   P([[-24,-6],[-19,-15],[-10,-17],[-7,-8],[-14,-3]],'#d0a34d');
   P([[-19,-15],[-10,-17],[-13,-10],[-21,-8]],'#f0ce79');
   P([[2,-7],[8,-15],[16,-12],[18,-5],[10,-2]],'#c3933c');
   P([[8,-15],[16,-12],[11,-8],[4,-8]],'#e9c167');
   P([[18,1],[15,-12],[21,-22],[29,-17],[31,-4],[26,3]],'#94b8af');
   P([[15,-12],[21,-22],[23,-10],[18,1]],'#d8e5cc');
   P([[21,-22],[29,-17],[23,-10]],'#f1edd3');
   P([[23,-10],[29,-17],[31,-4],[26,3]],'#628a83');
  }
  else if(item.kind==='urn'){
   P([[-16,0],[-22,-24],[-15,-44],[-10,-53],[11,-53],[16,-42],[23,-23],[15,0]],C.shade);
   P([[-15,-44],[-10,-53],[1,-53],[2,-3],[-12,-3],[-18,-24]],C.gold);
   R(-13,-53,28,5,C.light);R(-17,-34,35,5,'#344b40');R(-15,-9,30,4,C.light);
   P([[-6,-29],[1,-34],[8,-29],[1,-22]],'#872f36');
  }else{
   P([[-32,1],[-24,-17],[4,-22],[29,-10],[32,1]],'#776a43');
   for(let i=0;i<3;i++){const x=-17+i*15,h=23+i%2*16;P([[x-8,0],[x-8,-h],[x,-h-9],[x+8,-h],[x+6,0]],i%2?C.gold:'#bd9040');P([[x,-h-9],[x+8,-h],[x+6,0],[x,0]],C.shade);}
  }g.restore();
 }
 function queueView(view){
  const enqueue=(at,off,data)=>{const p=view.point(at,off),c=journeyCameraPoint(p.x,p.z);if(c.depth>-6&&c.depth<SPAWN_FAR)queueWorldDraw(c.depth,prop,{...p,...data});};
  if(view.spill){enqueue(view.begin+42.5,view.onlySide*7,{kind:'ore'});return;}
  for(const item of layout(view.edge))enqueue(item.at,item.offset,item);
  const slot=view.edge.events.find(e=>e.definition==='chest_stop');
  if(slot&&journeyVenueVisible(slot.id))enqueue(slot.at+8,0,{kind:'venue',slotId:slot.id});
 }
 const models=[1,2,3].map(n=>{
  const vertices=[],faces=[];
  const face=(v,color)=>faces.push({ids:v.map(p=>{vertices.push(p);return vertices.length-1;}),color,depth:0});
  for(let i=0;i<n;i++){
   const x=(i-(n-1)/2)*3.45,w=1.7,h=i%2?1.25:1.65,z=i%2?.2:-.1;
   face([[x-w,0,z-.8],[x+w,0,z-.8],[x+w,h,z-.8],[x-w,h,z-.8]],'#8c7546');
   face([[x+w,0,z-.8],[x+w,0,z+.8],[x+w,h,z+.8],[x+w,h,z-.8]],'#5a5238');
   face([[x-w,0,z+.8],[x-w,0,z-.8],[x-w,h,z-.8],[x-w,h,z+.8]],'#bca36a');
   face([[x-w,h,z-.8],[x+w,h,z-.8],[x+w,h,z+.8],[x-w,h,z+.8]],'#dbbf83');
   face([[x-w+.1,.15,z-.805],[x-w+.32,.15,z-.805],[x-w+.32,h-.1,z-.805],[x-w+.1,h-.1,z-.805]],C.gold);
   face([[x,.35,z-.81],[x+.45,.8,z-.81],[x,h-.2,z-.81],[x-.45,.8,z-.81]],C.light);
   face([[x,.53,z-.82],[x+.23,.8,z-.82],[x,h-.4,z-.82],[x-.23,.8,z-.82]],'#4e6653');
  }return {vertices,faces,screen:vertices.map(()=>[0,0,0])};
 });
 function hazard(o,point){
  if(!['boulder','pond'].includes(o.kind))return false;
  for(const group of obstacleLaneGroups(o.lanes)){
   const n=group.end-group.start+1,offset=((group.start+group.end)/2-1)*JOURNEY_LANE_WORLD;
   if(o.kind==='pond'){
    const w=n*3.65/2;
    const paint=(pts,c)=>KRSunlitArt.drawFloorShape({color:c,vertices:pts.map(([x,z])=>point(z,x+offset))});
    paint([[-w,-1.7],[w,-1.7],[w,1.6],[-w,1.6]],'#bfa36c');
    paint([[-w+.18,-1.4],[w-.18,-1.4],[w-.18,1.3],[-w+.18,1.3]],'#192a29');
    paint([[-w+.18,-1.4],[w-.18,-1.4],[w-.65,-.65],[-w+.65,-.65]],'#655439');
    paint([[-w,-1.7],[w,-1.7],[w,-1.5],[-w,-1.5]],C.gold);
    paint([[-w,1.3],[w,1.3],[w,1.6],[-w,1.6]],'#715c35');
    paint([[-.35,-.2],[.2,-.4],[.5,-.1],[.1,.15]],C.gold);
    continue;
   }
   const m=models[n-1];let valid=true,clip=-Infinity;
   for(let i=0;i<m.vertices.length;i++){
    const [x,h,z]=m.vertices[i],p=point(z,x+offset),c=journeyCameraPoint(p.x,p.z);
    if(c.depth<=sceneryNearLimit()){valid=false;break;}
    const pr=journeyProjectCamera(c.side,c.depth);m.screen[i][0]=pr.x;m.screen[i][1]=pr.y-h*150/JOURNEY_LANE_WORLD*linS(pr.t);m.screen[i][2]=c.depth;clip=Math.max(clip,curvedSpriteClipY(c.depth));
   }if(!valid)continue;
   for(const f of m.faces)f.depth=f.ids.reduce((a,i)=>a+m.screen[i][2],0)/f.ids.length;
   m.faces.sort((a,b)=>b.depth-a.depth);
   g.save();g.beginPath();g.rect(-VW*4,-PAD_TOP-6000,VW*9,clip+PAD_TOP+6000);g.clip();
   for(const f of m.faces){g.beginPath();f.ids.forEach((i,j)=>j?g.lineTo(m.screen[i][0],m.screen[i][1]):g.moveTo(m.screen[i][0],m.screen[i][1]));g.closePath();g.fillStyle=f.color;g.fill();}g.restore();
  }return true;
 }
 function drawCutscene(){
  const image=window.KREventVisuals?.peek('treasure-grove');if(!image)return false;
  g.save();R(0,-PAD_TOP,480,800+PAD_TOT,'#28201c');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(image,0,0,480,600);g.restore();return true;
 }
 function scene(open=0,t=0){
  if(!drawCutscene()){R(0,-PAD_TOP,480,800+PAD_TOT,'#332920');R(0,400,480,200,'#706440');}
  // Feet meet the generated dais (source y~1015), not the step riser below it.
  chest(240,435,1.08,open,t);
 }
 function button(r,label,muted=false){
  const {x,y,w,h}=r;
  P([[x+6,y+4],[x+w-6,y+4],[x+w,y+10],[x+w,y+h],[x+w-6,y+h+6],[x+6,y+h+6],[x,y+h],[x,y+10]],'#1f1713');
  P([[x+6,y],[x+w-6,y],[x+w,y+6],[x+w,y+h-6],[x+w-6,y+h],[x+6,y+h],[x,y+h-6],[x,y+6]],muted?'#b2a185':'#e8d6ab');
  L(x+8,y+3,x+w-8,y+3,2,'#fff0cd');L(x+8,y+h-3,x+w-8,y+h-3,2,'#a8824a');
  smithText(label,x+w/2,y+h/2+5,13,muted?'#756853':'#493323');
 }
 function heading(title,sub){
  P([[83,112],[397,112],[405,123],[397,162],[83,162],[75,123]],'#30241e');
  L(96,115,384,115,1,'#b68b49');
  smithText(title,240,143,21,'#f5dfad');
  if(sub)smithText(sub,240,185,11,'#ead6b1');
 }
 function sheet(y=550){
  R(0,y+12,480,800+PAD_TOT-y,'#30241e');
  P([[16,y+12],[28,y],[452,y],[464,y+12],[464,792+PAD_TOT],[16,792+PAD_TOT]],'#ddc79b');
  R(24,y+12,432,3,'#f6e8c3');R(24,y+20,432,1,'#a78857');
  for(const x of [34,446])P([[x,y+9],[x+4,y+13],[x,y+17],[x-4,y+13]],'#a07840');
 }
 function drawLoot(context){
  const loot=context.loot,entry=loot.entries[0];scene(loot.won?1:0,perfNow);
  if(pausePhotoMode)return;
  button({x:PAUSE_BTN.x,y:PAUSE_BTN.y+uiTop,w:PAUSE_BTN.w,h:PAUSE_BTN.h},'II');
  heading(loot.won?'A FORTUNE UNCOVERED':'THE LOCK HOLDS');sheet(486);
  smithText(loot.won?'YOUR SPOILS':'NO SPOILS',240,519,14,'#503921');
  if(entry){
   const r=CHEST_REWARD_RECT;button(r,entry.claimed?'COLLECTED':'TAKE COINS',entry.claimed);
   drawCoin(r.x+32,r.y+r.h/2,1.1,.25);smithText(String(entry.amount),r.x+72,r.y+r.h/2+7,21,'#674421');
   smithText(entry.claimed?'Safely in your purse.':'Tap the reward to collect it.',240,631,11,'#725839');
  }else smithText('Only the broken lockpicks remain.',240,573,12,'#725839');
  button(CHEST_CONTINUE_RECT,entry&&!entry.claimed?'LEAVE WITHOUT LOOT':'CONTINUE');
  smithText('1: TAKE  /  ENTER: CONTINUE',240,782,10,'#725839');
 }
 function lockView(l){
  // Physical lock close-up on dark walnut, not a coloured minigame panel.
  R(0,-PAD_TOP,480,800+PAD_TOT,'#29211c');
  for(let i=0;i<7;i++){
   const x=i*74-20;R(x,-PAD_TOP,71,800+PAD_TOT,['#453427','#3d2e24','#49382a'][i%3]);
   R(x+3,-PAD_TOP,2,800+PAD_TOT,'#5e4933');
   for(let j=0;j<3;j++){const y=80+i*39+j*207;P([[x+19,y],[x+16,y+44],[x+20,y+92],[x+22,y+34]],'#33291f');}
  }
  // Forged escutcheon with an architectural crown and a lower tension housing.
  const outline=[[22,265],[42,240],[131,240],[153,215],[191,215],[212,188],[240,176],[268,188],[289,215],[327,215],[349,240],[438,240],[458,265],[458,491],[430,516],[311,516],[286,547],[240,567],[194,547],[169,516],[50,516],[22,491]];
  for(const point of outline)if(point[1]>=491)point[1]+=28;
  P(outline.map(([x,y])=>[x+3,y+7]),'#1d1713');P(outline,'#806137');
  g.strokeStyle='#d0ad69';g.lineWidth=4;g.stroke();
  P([[39,269],[55,255],[143,255],[160,232],[205,232],[222,207],[240,198],[258,207],[275,232],[320,232],[338,255],[425,255],[441,269],[441,509],[423,526],[302,526],[276,560],[240,573],[204,560],[178,526],[57,526],[39,509]],'#bb9450');
  P([[212,226],[222,211],[240,205],[258,211],[268,226],[257,221],[249,231],[231,231],[223,221]],'#eed394');
  for(const side of [-1,1]){
   g.save();g.translate(240,0);g.scale(side,1);
   L(61,246,88,264,2,'#806133');L(88,264,136,264,2,'#806133');
   P([[70,242],[80,238],[90,246],[80,249]],'#e0bd78');
   L(69,521,99,534,2,'#75562e');L(99,534,147,534,2,'#75562e');
   g.restore();
  }
  // The inset is deep and quiet; supported brass guides enclose moving pins.
  R(47,271,386,212,'#4d3927');R(51,275,378,206,'#241e19');
  R(47,269,386,7,'#ebca81');
  for(let i=0;i<5;i++){
   const pin=l.pins[i],x=84+i*78,y=366-pin.lift*40,set=pin.state==='set',sel=i===l.cursor;
   R(x-25,278,50,137,'#352a20');R(x-24,278,3,137,'#725a38');
   const springBottom=y-6;
   g.strokeStyle='#aa9b7c';g.lineWidth=3;g.beginPath();g.moveTo(x,280);
   for(let k=1;k<=12;k++)g.lineTo(x+(k%2?11:-11),280+(springBottom-280)*k/13);g.lineTo(x,springBottom);g.stroke();
   R(x-13,y,26,49,set?'#dcb762':'#b38843');R(x-13,y,5,49,'#f1d591');R(x+8,y,5,49,'#78572d');
   R(x-17,y-6,34,12,'#cfa65a');R(x-17,y-6,34,3,'#f2d893');
   R(x-14,y+10,28,4,'#473320');R(x-13,y+14,26,2,'#e1bd71');
   // A seated metal latch, not a UI checkmark, makes a caught pin readable.
   if(set){R(x-24,336,15,5,'#e6c477');R(x+10,336,14,5,'#9c7a40');}
   if(sel)P([[x-7,521],[x,513],[x+7,521],[x,525]],'#f2d795');
  }
  // A genuine open throat joins the pin chamber. Its raised lips are solid
  // brass; the tool's shaft pivots at (8,467) inside the opening, never in them.
  P([[-8,450],[12,450],[22,441],[47,441],[51,415],[417,415],[417,484],[47,484],[22,486],[12,482],[-8,482]],'#191914');
  // The channel ceiling stays just below the unraised pin contact plane.
  L(51,417,414,417,2,'#473b29');
  P([[-8,446],[10,446],[21,437],[44,437],[48,433],[47,441],[22,441],[12,450],[-8,450]],'#dfbd77');
  P([[-8,482],[12,482],[22,486],[47,484],[417,484],[417,490],[47,490],[21,492],[10,488],[-8,488]],'#b58b48');
  L(48,484,416,484,2,'#ebcd8e');
  // Sliding bolt, fixed bracket and lower tension wheels belong to the plate.
  R(45,490,390,16,'#8c6534');R(45,490,390,4,'#e1bd76');
  R(421,455,17,59,'#d1ad68');R(426,459,5,50,'#76572e');
  for(const x of [206,273]){
   const y=550;
   for(let i=0;i<8;i++){g.save();g.translate(x,y);g.rotate(i*Math.PI/4);R(-4,-22,8,11,'#866130');g.restore();}
   P([[x-17,y-10],[x-9,y-18],[x+9,y-18],[x+17,y-10],[x+17,y+9],[x+8,y+17],[x-9,y+17],[x-17,y+9]],'#d6b571');
   P([[x-10,y-5],[x-5,y-10],[x+5,y-10],[x+10,y-5],[x+10,y+5],[x+5,y+10],[x-5,y+10],[x-10,y+5]],'#9c743e');
   R(x-2,y-6,4,12,'#59432b');
  }
  if(l.phase==='playing'){
   const pose=pickPose(l);pickIron(pose.x,pose.y,pose.angle);
  }
  for(const x of [37,444])for(const y of [263,518]){P([[x-5,y-3],[x-3,y-5],[x+3,y-5],[x+5,y-3],[x+5,y+3],[x+3,y+5],[x-3,y+5],[x-5,y+3]],'#6f542f');L(x-2,y+2,x+2,y-2,2,'#e9cb88');}
  if(!pausePhotoMode)heading('THE ROYAL SEAL','Study the spring. Catch the moment it rests.');
 }
 function pickPose(l){
  const pin=l.pins[l.cursor],targetX=l.pickX??84+l.cursor*78;
  // Lower the pick before sliding across pins. A caught/released pin no longer
  // drags the tool up; only a held pin which the hook has reached is supported.
  const contact=clamp(1-Math.abs(targetX-(84+l.cursor*78))/8,0,1);
  const lift=pin.state==='active'&&l.holdingIndex===l.cursor?pin.lift*contact:0;
  const targetY=415-lift*40,dx=targetX-8,dy=targetY-467;
  const angle=Math.atan2(dy,dx)+Math.asin(52/Math.hypot(dx,dy));
  return {x:targetX-52*Math.sin(angle),y:targetY+52*Math.cos(angle),angle,targetX,targetY};
 }
 function pickIron(x,y,angle=0){
  // Fixed-length rigid iron. Local tip (0,-52), shaft centre y=0; its
  // intersection with the left keyway remains stationary throughout a lift.
  g.save();g.translate(x,y);g.rotate(angle);
  P([[-480,-4],[-470,-9],[-428,-9],[-417,-4],[-20,-4],[-9,-13],[-6,-46],[0,-52],[5,-46],[3,-8],[-12,5],[-419,5],[-429,10],[-470,10],[-480,5]],'#41453f');
  P([[-475,-2],[-468,-6],[-429,-6],[-418,-1],[-18,-1],[-6,-11],[-3,-45],[0,-48],[2,-45],[0,-9],[-14,2],[-419,2],[-430,7],[-468,7],[-475,3]],'#9b9d8d');
  P([[-468,-6],[-429,-6],[-418,-1],[-18,-1],[-6,-11],[-3,-45],[0,-48],[0,-43],[-3,-10],[-17,1],[-419,1]],'#dbd7be');
  P([[-3,-46],[0,-52],[3,-48],[2,-44]],'#dbd7be');
  P([[-467,-3],[-434,-3],[-426,0],[-434,4],[-467,4],[-472,1]],'#292620');
  for(const xx of [-412,-401,-390])P([[xx,-3],[xx+3,-3],[xx-1,4],[xx-4,4]],'#665c45');
  g.restore();
 }
 function controls(){
  button(MINIGAME_BACK_BTN,'< BACK');
  button({x:PAUSE_BTN.x,y:PAUSE_BTN.y+uiTop,w:PAUSE_BTN.w,h:PAUSE_BTN.h},'II');
 }
 function drawGame(){
  const l=lockpickGame;if(!l)return;
  if(l.phase==='playing'||l.phase==='broken')lockView(l);else scene(l.openAmount||0,l.phaseT);
  if(pausePhotoMode)return;
  controls();
  if(l.phase==='intro'){
   heading('THE GILDED CACHE');sheet();
   smithText('A ROYAL SEAL',240,587,17,'#503921');
   smithText('Five pins. '+difficultyOf(l).picks+' picks. Choose your challenge.',240,611,11,'#725839');
   smithText('Tap twice or hold & release.  Arrows + Space.',240,633,10,'#725839');button(LOCKPICK_START_BTN,'EXAMINE THE LOCK');
   Object.entries(difficulties).forEach(([key,d],i)=>{const r=difficultyRect(i);button(r,d.label,l.difficulty!==key);if(l.difficulty===key)L(r.x+8,r.y+r.h+4,r.x+r.w-8,r.y+r.h+4,3,'#8b4c28');});
   smithText('Difficulty does not change loot yet.',240,790,10,'#725839');
  }else if(l.phase==='playing'){
   const msg=l.nearT>0?l.nearText:l.message;
   sheet(592);smithText(msg,240,631,12,l.nearText==='SNAP'?'#a03d2b':'#503921');
   smithText('PINS  '+l.setCount+' / 5',128,672,13,'#725839');
   for(let i=0;i<difficultyOf(l).picks;i++){const x=265+i*27;L(x,663,x+18,668,3,i<l.picks?'#72522e':'#b5a17e');L(x+18,668,x+21,664,2,i<l.picks?'#72522e':'#b5a17e');}
   const d=difficultyOf(l);smithText(d.label+'  /  Failed catch: '+(d.reset===5?'all':d.reset)+' pins reset',240,724,10,'#725839');
   smithText('Watch a bounce for free. Speed changes each lift.',240,747,10,'#725839');
  }else if(l.phase==='opening'){
   sheet();smithText(l.phaseT<.55?'THE BOLT SLIDES FREE':'A FORTUNE UNCOVERED',240,595,16,'#503921');
  }else if(l.phase==='broken'){sheet(592);smithText('No picks left. The lock holds.',240,639,16,'#953d2c');}
  else{sheet();smithText(l.won?'TREASURE UNLOCKED':'THE LOCK HOLDS',240,595,20,'#503921');button(LOCKPICK_REPLAY_BTN,l.roadAttempt?'CONTINUE':'TRY A NEW LOCK');}
 }
 // A new lift / ballistic return mechanic, not the old continuously cycling bar.
 function makePins(random=Math.random){
  const behaviors=['smooth','sticky','twitchy','decoy','stubborn'];
  for(let i=4;i>0;i--){const j=Math.floor(random()*(i+1));[behaviors[i],behaviors[j]]=[behaviors[j],behaviors[i]];}
  return behaviors.map((behavior,index)=>({index,behavior,hint:'',state:'idle',lift:0,holdT:0,cycleT:0,segment:'idle',tested:false,flash:0,
   rise:.28,apex:.06,drop:.14,window:0,flight:0,
   rhythm:[0,1,2,...Array.from({length:4},()=>Math.floor(random()*3))],rhythmOffset:Math.floor(random()*7)}));
 }
 function lift(index){
  const l=lockpickGame;if(!l||l.phase!=='playing'||paused)return false;
  const pin=l.pins[clamp(index|0,0,4)];
  if(l.holdingIndex>=0&&l.holdingIndex!==pin.index)cancelLockpickHold();
  l.cursor=pin.index;if(pin.state==='set')return true;
  if(pin.state==='active'){l.holdingIndex=pin.index;settle(true);return true;}
  const speed=pin.rhythm[(pin.flight+pin.rhythmOffset)%pin.rhythm.length];
  // A seeded sequence varies both ascent and dwell; no guaranteed third-bump gift.
  const d=difficultyOf(l);pin.rise=d.rise[speed];pin.apex=d.apex[speed];pin.drop=d.drop[speed];
  l.holdingIndex=pin.index;Object.assign(pin,{state:'active',lift:0,holdT:0,cycleT:0,flight:pin.flight+1,segment:'rise'});
  l.message='Catch the pin at its highest point.';l.nearText='';SFX.lockTest();return true;
 }
 function settle(catchTap=false){
  const l=lockpickGame;if(!l||l.holdingIndex<0||l.phase!=='playing')return false;
  const pin=l.pins[l.holdingIndex];l.holdingIndex=-1;if(pin.state!=='active')return false;
  // A quick first tap releases the pick, while the bumped pin keeps moving.
  if(!catchTap&&pin.holdT<.10&&pin.segment==='rise')return true;
  l.attempts++;pin.tested=true;
  if(pin.segment==='apex'){
   pin.state='set';pin.lift=1;pin.flash=.45;l.lastSet.push(pin.index);l.setCount++;l.nearText='CLICK';l.nearT=.6;SFX.lockSet();
   if(l.setCount===5){l.won=true;l.phase='opening';l.phaseT=0;l.openAmount=0;SFX.win();}
  }else{
   pin.state='idle';pin.lift=0;pin.flash=-.3;l.picks--;l.misses++;l.nearText='SNAP';l.nearT=.7;l.message='Too early or too late. Try its rhythm again.';
   SFX.lockMiss();shake(2,.1);for(let i=0;i<difficultyOf(l).reset;i++)dropLastSetLockpickPin();
   if(l.picks===0){l.phase='broken';l.phaseT=0;}
  }return true;
 }
 function updateGame(dt){
  const l=lockpickGame;if(!l||paused)return;l.phaseT+=dt;l.nearT=Math.max(0,l.nearT-dt);
  l.pickX=lerp(l.pickX??84,84+l.cursor*78,1-Math.exp(-22*dt));
  for(const pin of l.pins){
   pin.flash*=Math.max(0,1-dt*8);
   if(l.phase!=='playing'||pin.state!=='active')continue;
   pin.holdT+=dt;pin.cycleT+=dt;
   // A different dwell per successive bump rewards observing the spring.
   const dwell=pin.apex,t=pin.cycleT,old=pin.segment;
   if(t<pin.rise){pin.lift=t/pin.rise;pin.segment='rise';}
   else if(t<pin.rise+dwell){pin.lift=1;pin.segment='apex';}
   else{pin.lift=Math.max(0,1-(t-pin.rise-dwell)/pin.drop);pin.segment='drop';}
   if(pin.segment==='apex'&&old!=='apex')SFX.slotStop(1);
   if(t>=pin.rise+dwell+pin.drop){pin.state='idle';pin.lift=0;if(l.holdingIndex===pin.index)l.holdingIndex=-1;l.message='Missed it? Bump the pin again.';}
  }
  if(l.phase==='opening'){
   const u=clamp((l.phaseT-.55)/1.55,0,1);l.openAmount=smooth(u);
   if(l.phaseT>2.9){l.phase='result';l.phaseT=0;l.openAmount=1;}
  }else if(l.phase==='broken'&&l.phaseT>1.15){l.phase='result';l.phaseT=0;l.won=false;}
 }
 // Keep established pointer/keyboard routes and event ownership, replace art/rules.
 const startBase=startLockpicking,leaveBase=leaveLockpicking,roundBase=beginLockpickingRound,tapBase=lockpickingTap;
 makeLockpickPins=makePins;
 beginLockpickingRound=function(){roundBase();if(lockpickGame?.phase==='playing'){lockpickGame.difficulty=selectedDifficulty;lockpickGame.picks=difficultyOf(lockpickGame).picks;lockpickGame.pickX=84;lockpickGame.message='Lift a pin. Catch it at its highest point.';}};
 startLockpicking=function(stage,returnMode){startBase(stage,returnMode);lockpickGame.difficulty=selectedDifficulty;prepareCutscene('treasure-grove',true,journeyRoadEventSession?.token??'lockpick-standalone');};
 lockpickingTap=function(pt){if(lockpickGame?.phase==='intro')for(const [i,key]of Object.keys(difficulties).entries())if(pointInRect(pt,difficultyRect(i))){selectDifficulty(key);SFX.swipe();return;}tapBase(pt);};
 leaveLockpicking=function(){const l=lockpickGame;if(l&&!l.chestRoadToken)clearEventVisuals();leaveBase();};
 beginLockpickHold=lift;endLockpickHold=settle;updateLockpicking=updateGame;drawLockpickingGame=drawGame;
 drawRoadTreasureChest=chest;drawJourneyChestLoot=drawLoot;
 window.KRTreasureRoad={assetId:'treasure-grove',drawCutscene,chest,scene,drawGame,drawLoot,layout,queueView,floorDetails,hazard,settle,difficulties,selectDifficulty,pickIron,pickPose};
})();
