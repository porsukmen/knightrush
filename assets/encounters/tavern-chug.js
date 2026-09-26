/* Sir Chugs: native candidate actor and articulated mugs over one generated plate. */
(()=>{'use strict';
 const P=(pts,c)=>{g.fillStyle=c;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();};
 const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
 const L=(a,b,w,c)=>expSegment(...a,...b,w,c);
 const T=(s,x,y,size=12,c='#edd4a0',max=430)=>smithText(s,x,y,size,c,max);
 const cut=(x,y,w,h,c)=>P([[x+6,y],[x+w-6,y],[x+w,y+6],[x+w,y+h-6],[x+w-6,y+h],[x+6,y+h],[x,y+h-6],[x,y+6]],c);
 const materials={
  neutral:{skin:['#e1bc8d','#c99e72','#986c53'],shirt:['#e6d6ad','#bcaa86','#807c68'],vest:['#8d6b48','#684934','#43362e'],hair:['#b57b42','#855132','#50362a'],metal:['#dfc88b','#ad915d','#6b6350']},
  scene:{skin:['#ffd39b','#e3a174','#a16955'],shirt:['#ffe3aa','#d8c29a','#819b9e'],vest:['#cf914b','#985b35','#594135'],hair:['#e2a149','#a86430','#633e2d'],metal:['#ffe2a0','#c3ac78','#738586']}
 };
 const controlRect=Object.freeze({x:35,y:622,w:410,h:124});
 const MUG_ELEVATION=.22;
 function mugPoint(x,y,z,pitch,anchor,roll=0){
  // Rigid rotation about the rear lip, then the same slightly elevated camera.
  const c=Math.cos(pitch),s=Math.sin(pitch),Y=y*c-(z+35)*s,Z=y*s+(z+35)*c;
  const X=-x*.65,V=(Y*Math.cos(MUG_ELEVATION)+Z*Math.sin(MUG_ELEVATION))*.65;
  return[anchor[0]+X*Math.cos(roll)-V*Math.sin(roll),anchor[1]+X*Math.sin(roll)+V*Math.cos(roll)];
 }
 function solve(a,b,u,v,side=1){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,q=(u*u-v*v+d*d)/(2*d),h=Math.sqrt(Math.max(0,u*u-q*q));return[a[0]+dx*q/d+side*dy*h/d,a[1]+dy*q/d-side*dx*h/d];}
 function pose(s,t=s.elapsed||0){
  const m=s.rival,lift=Math.max(0,Math.min(1,m.lift||0));
  // Frontal hold: lift first, then tip AWAY from the viewer into his mouth.
  // A side-on roll made the wrist orbit his cheek and the elbow rise to his ear.
  const head=Math.sin(t*1.4)*m.done*.035,angle=head*lift;
  const tip=Math.max(0,(lift-.72)/.28)*m.actual,pitch=tip*1.5;
  const anchor=[241+Math.sin(head)*lift,350-77*lift];
  // Grip is on the rear-side handle; lip remains at the approved mouth contact.
  const wrist=mugPoint(54,43,-26,pitch,anchor,angle),shoulder=[163,308],freeShoulder=[314,308],freeWrist=[322,411];
  // The upper arm comes toward the camera as the mug rises. A flat two-circle
  // IK solution forced the elbow across his ribs to keep its screen length.
  // Guide it beside the torso; depth supplies the natural foreshortening.
  const elbow=[158-3*lift,375-26*lift],upper=68,lower=94;
  const upperDepth=Math.sqrt(Math.max(0,upper*upper-(elbow[0]-shoulder[0])**2-(elbow[1]-shoulder[1])**2));
  const lowerDepth=Math.sqrt(Math.max(0,lower*lower-(wrist[0]-elbow[0])**2-(wrist[1]-elbow[1])**2));
  return{lift,angle,tip,pitch,anchor,wrist,shoulder,elbow,upper,lower,
   shoulder3:[...shoulder,0],elbow3:[...elbow,upperDepth],wrist3:[...wrist,upperDepth+lowerDepth],
   freeShoulder,freeWrist,freeElbow:solve(freeShoulder,freeWrist,66,64,1),lean:Math.sin(t*1.7)*m.done*4,head};
 }
 function limb(a,e,b,m){
  // Front-layer shoulder + complete upper arm, matching approved civilian blocks.
  L(a,e,39,m.shirt[2]);L([a[0]-3,a[1]-2],[e[0]-3,e[1]-2],31,m.shirt[1]);L([a[0]-12,a[1]-2],[e[0]-10,e[1]-2],9,m.shirt[0]);
  cut(e[0]-16,e[1]-12,31,25,m.shirt[1]);L([e[0]-13,e[1]-7],[e[0]+7,e[1]-2],5,m.shirt[0]);
  L(e,b,26,m.skin[2]);L([e[0]-2,e[1]-1],[b[0]-2,b[1]-1],21,m.skin[1]);L([e[0]-8,e[1]-1],[b[0]-7,b[1]-1],6,m.skin[0]);
 }
 function actor(lit=true,pass='all',s=drinkGame||KRChugRules.create()){
  const m=lit?materials.scene:materials.neutral,p=pose(s),d=s.rival.done;
  g.save();g.translate(p.lean,0);
  if(pass!=='front'){
   // Barrel-shaped middle is designed as volume, not a stretched old actor.
   P([[170,291],[205,280],[279,282],[313,298],[333,351],[339,391],[316,433],[173,432],[142,391],[149,343]],m.vest[1]);
   P([[170,291],[205,280],[223,293],[220,360],[226,424],[173,432],[142,391],[149,343]],m.vest[0]);
   P([[279,282],[313,298],[333,351],[339,391],[316,433],[285,424],[304,388],[294,336]],m.vest[2]);
   P([[215,285],[263,285],[270,310],[249,341],[217,306]],m.shirt[1]);
   P([[215,285],[236,286],[235,307],[249,341],[217,306]],m.shirt[0]);
   cut(219,266,47,30,m.skin[2]);P([[219,269],[247,269],[247,290],[230,296],[219,284]],m.skin[1]);
   P([[211,285],[222,281],[240,300],[229,313],[210,298]],m.shirt[0]);P([[265,281],[279,290],[262,314],[240,300]],m.shirt[1]);
   L([204,292],[206,356],4,m.vest[2]);L([281,296],[284,357],4,m.vest[0]);
   for(const y of [340,361,382]){cut(241,y,7,7,m.metal[1]);R(242,y,3,2,m.metal[0]);}
   P([[150,393],[233,403],[331,392],[327,407],[235,418],[155,407]],m.vest[2]);cut(232,399,24,19,m.metal[1]);R(237,404,14,9,m.vest[2]);R(233,400,21,3,m.metal[0]);
   g.save();g.translate(241,274);g.rotate(p.head);
   P([[-30,-68],[22,-70],[35,-52],[37,-19],[25,1],[10,10],[-15,9],[-31,-6],[-37,-29]],m.skin[1]);
   P([[-30,-68],[-5,-69],[-7,-17],[-15,3],[-31,-6],[-37,-29]],m.skin[0]);
   P([[22,-70],[35,-52],[37,-19],[25,1],[10,10],[5,2],[23,-13],[23,-48]],m.skin[2]);
   cut(-42,-44,10,23,m.skin[1]);R(-42,-40,3,14,m.skin[0]);cut(33,-42,9,20,m.skin[2]);
   // Receding ginger crown; contiguous scalp, no disconnected forehead cap.
   P([[-37,-31],[-41,-57],[-32,-73],[-16,-79],[9,-81],[29,-73],[37,-57],[35,-34],[30,-31],[26,-55],[13,-66],[-7,-68],[-26,-60],[-31,-35]],m.hair[1]);
   P([[-41,-57],[-32,-73],[-16,-79],[9,-81],[29,-73],[16,-74],[-7,-74],[-30,-65]],m.hair[0]);
   P([[29,-73],[37,-57],[35,-34],[30,-31],[26,-55]],m.hair[2]);
   P([[-26,-43],[-10,-46],[-9,-42],[-25,-39]],m.hair[1]);P([[9,-44],[26,-40],[26,-36],[9,-40]],m.hair[2]);
   const eye=d>.7?2:4;R(-24,-34,7,eye,'#3b392c');R(12,-33,6,eye,'#3b392c');
   P([[-2,-43],[5,-42],[11,-22],[3,-18],[-8,-22]],m.skin[1]);P([[-2,-43],[2,-41],[2,-23],[-8,-22]],m.skin[0]);P([[5,-42],[11,-22],[3,-18],[-5,-21],[3,-24]],m.skin[2]);
   // Flush stays on cheek planes, not a whole-head tint.
   if(d>0){g.globalAlpha=d*.65;P([[-30,-29],[-17,-28],[-13,-18],[-27,-15]],'#d36c53');P([[17,-26],[30,-26],[29,-16],[17,-14]],'#b45148');g.globalAlpha=1;}
   P([[-6,-20],[1,-17],[8,-20],[22,-16],[32,-19],[28,-7],[14,-5],[0,-10],[-13,-5],[-28,-8],[-31,-18],[-21,-15]],m.hair[1]);
   P([[-6,-20],[1,-17],[-12,-11],[-25,-12],[-31,-18],[-21,-15]],m.hair[0]);P([[8,-20],[22,-16],[32,-19],[28,-7],[14,-5],[16,-12]],m.hair[2]);
   P([[-10,-3],[0,0],[13,-3],[10,2],[-2,4]],'#774934');P([[-15,5],[-3,7],[9,5],[6,9],[-10,10]],m.skin[2]);g.restore();
  }
  if(pass!=='body'){
   for(const a of [p.shoulder,p.freeShoulder]){P([[a[0]-15,a[1]-14],[a[0]+10,a[1]-16],[a[0]+19,a[1]-4],[a[0]+14,a[1]+13],[a[0]-10,a[1]+16],[a[0]-20,a[1]+3]],m.shirt[1]);P([[a[0]-15,a[1]-14],[a[0]+10,a[1]-16],[a[0]+14,a[1]-8],[a[0]-8,a[1]-6],[a[0]-15,a[1]+2]],m.shirt[0]);}
   // Both shoulder caps belong behind the moving arms, including the raised grip.
   limb(p.shoulder,p.elbow,p.wrist,m);limb(p.freeShoulder,p.freeElbow,p.freeWrist,m);
   cut(309,402,28,21,m.skin[1]);R(310,402,24,6,m.skin[0]);for(let i=0;i<3;i++)R(315+i*6,411,2,9,m.skin[2]);
   rivalTankard(p,s.rival);
   // Palm behind curled fingers, with thumb hooked over the upper handle.
   g.save();g.translate(...p.wrist);g.rotate(p.angle);
   P([[-10,-7],[-3,-12],[7,-10],[10,-3],[9,12],[-5,13],[-11,6]],m.skin[2]);
   P([[-10,-7],[-3,-12],[4,-9],[4,10],[-5,13],[-11,6]],m.skin[1]);
   for(let i=0;i<3;i++){const y=-5+i*6;P([[-4,y],[8,y-1],[10,y+2],[7,y+5],[-3,y+5]],m.skin[1]);L([-2,y],[7,y],2,m.skin[0]);}
   P([[-8,-8],[-3,-15],[7,-15],[11,-10],[8,-5],[4,-9],[-2,-9],[-4,-3]],m.skin[1]);L([-2,-13],[6,-13],2,m.skin[0]);g.restore();
  }
  g.restore();
 }
 // Small fixed faceted prop, projected into the existing canvas renderer. No
 // texture warps, additional engine, image buffers or animation loop.
 const mugFaces=(()=>{
  const faces=[],ring=(r,y)=>Array.from({length:8},(_,i)=>[Math.sin(i*Math.PI/4)*r,y,Math.cos(i*Math.PI/4)*r]);
  const face=(v,n,c)=>faces.push({v,n,c,center:v.reduce((a,p)=>a.map((x,i)=>x+p[i]/v.length),[0,0,0])});
  const sides=(r0,y0,r1,y1,colors)=>{const a=ring(r0,y0),b=ring(r1,y1);for(let i=0;i<8;i++){const j=(i+1)%8,t=(i+.5)*Math.PI/4;face([a[i],a[j],b[j],b[i]],[Math.sin(t),(r0-r1)/(y1-y0),Math.cos(t)],colors[Math.sin(t)>.2?0:Math.sin(t)<-.2?2:1]);}};
  const cap=(r,y,n,c)=>face(ring(r,y),[0,n,0],c);
  // Split at hoops: a long wood face must never painter-sort over a metal band.
  const radius=y=>35-y*5/84;
  for(const [a,b]of [[3,15],[24,65],[74,78]])sides(radius(a),a,radius(b),b,['#d39b51','#b87939','#82552f']);
  for(const [y,r]of [[15,35],[65,32]]){sides(r+2,y,r+1.5,y+9,['#d3cfaa','#939d96','#627778']);for(const [h,rad,n,col]of [[y,r+2,-1,'#d3cfaa'],[y+9,r+1.5,1,'#71837e']]){const a=ring(rad,h),b=ring(radius(h),h);for(let i=0;i<8;i++){const j=(i+1)%8;face([a[i],a[j],b[j],b[i]],[0,n,0],col);}}}
  sides(37,-2,37,3,['#ded1a7','#b9b69b','#798a85']);
  const outer=ring(37,-2),inner=ring(29,-2);for(let i=0;i<8;i++){const j=(i+1)%8;face([outer[i],outer[j],inner[j],inner[i]],[0,-1,0],'#d6cdab');}
  cap(29,-1,-1,'#493322');cap(26,-1.1,-1,'#d9a03a');
  sides(32,78,32,85,['#c8c29b','#969e91','#687776']);cap(32,85,1,'#c2b58a');cap(28,85.1,1,'#896235');
  // Recessed oak base: two broad staves, no floating texture on top of the mug.
  face([[-8,85.2,-25],[-8,85.2,25],[7,85.2,25],[7,85.2,-25]],[0,1,0],'#ad8145');
  const box=(x0,y0,z0,x1,y1,z1)=>{
   face([[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],[0,0,1],'#bcc0a5');
   face([[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0]],[0,0,-1],'#596e72');
   face([[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]],[0,-1,0],'#dbceaa');
   face([[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]],[0,1,0],'#78857e');
   face([[x0,y0,z0],[x0,y1,z0],[x0,y1,z1],[x0,y0,z1]],[-1,0,0],'#66787a');
   face([[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]],[1,0,0],'#c3c5a7');
  };
  box(30,15,-30,62,24,-22);box(53,22,-30,63,62,-22);box(30,60,-30,62,69,-22);
  return faces;
 })();
 const mugOrder=mugFaces.map((f,i)=>({i,depth:0}));
 const mugCircle=Array.from({length:8},(_,i)=>[Math.sin(i*Math.PI/4),Math.cos(i*Math.PI/4)]);
 function rivalTankard(p,m,contents=false){
  const a=p.pitch-MUG_ELEVATION,sy=Math.sin(a),sz=Math.cos(a);
  for(const o of mugOrder){const q=mugFaces[o.i].center;o.depth=q[1]*sy+(q[2]+35)*sz;}
  mugOrder.sort((a,b)=>a.depth-b.depth||a.i-b.i);
  // Transform once per prop, not trigonometry + new projected arrays per vertex.
  g.save();g.translate(...p.anchor);g.rotate(p.angle);g.scale(-.65,.65);
  for(const o of mugOrder){
   const f=mugFaces[o.i];if(f.n[1]*sy+f.n[2]*sz<=.00001)continue;
   g.fillStyle=f.c;g.beginPath();
   for(let i=0;i<f.v.length;i++){const v=f.v[i],Y=v[1]*sz-(v[2]+35)*sy;if(i)g.lineTo(v[0],Y);else g.moveTo(v[0],Y);}
   g.closePath();g.fill();
  }
  if(contents&&sy<0){
   const ring=(r,y)=>{g.beginPath();for(let i=0;i<8;i++){const q=mugCircle[i],X=q[0]*r,Y=y*sz-(q[1]*r+35)*sy;if(i)g.lineTo(X,Y);else g.moveTo(X,Y);}g.closePath();};
   g.save();ring(28,-1.2);g.clip();g.fillStyle='#493322';g.fill();
   if(m.done<.999){const level=2+Math.min(1,m.done)*69,radius=26*Math.sqrt(Math.min(1,(1-m.done)/.22));ring(radius,level);g.fillStyle='#d99a35';g.fill();g.strokeStyle='#ffe6b1';g.lineWidth=Math.min(radius*.3,2.8+m.foam*3.8);g.stroke();}
   g.restore();
  }
  if(m.spillT>0){const x=15,y=-68*sy;P([[x-3,y],[x+4,y],[x+5,y+26],[x,y+35]],'#edba62');}
  g.restore();
 }
 function tankard(remaining,foam,spill,knight=false){
  // Oak staves, visible side thickness, iron hoop and open top. Not transparent wood.
  P([[33,14],[53,10],[65,20],[64,58],[53,69],[33,64],[34,53],[49,55],[53,48],[53,27],[47,23],[34,27]],'#62696a');
  P([[34,14],[53,10],[65,20],[59,23],[50,17],[35,21]],'#c6c6a4');
  P([[-35,0],[35,0],[32,76],[22,87],[-24,87],[-34,76]],'#75502c');
  P([[-32,3],[-9,7],[-8,83],[-23,82],[-30,72]],'#d39b51');P([[-9,7],[17,7],[16,84],[-8,83]],'#b87939');P([[17,7],[34,1],[30,72],[21,84],[16,84]],'#8c592f');
  for(const x of [-10,15])L([x,12],[x,75],2,'#68472c');L([-23,26],[-22,50],2,'#e5ae60');
  for(const y of [17,64]){P([[-34,y],[33,y],[32,y+10],[18,y+15],[-22,y+15],[-33,y+10]],'#7d8580');L([-32,y+1],[26,y+1],3,'#d3cfaa');R(24,y+4,4,4,'#4e6266');}
  P([[-35,0],[-23,-10],[22,-10],[35,0],[24,12],[-24,12]],'#d6cdab');P([[-28,0],[-19,-5],[18,-5],[28,0],[18,6],[-18,6]],'#493322');
  if(remaining>.015){const inset=(1-remaining)*5;P([[-25+inset,1],[-17,-3+inset*.25],[18,-3+inset*.25],[25-inset,1],[17,5],[-17,5]],'#d9a03a');L([-21+inset,1],[20-inset,1],3+foam*5,'#fff0c4');}
  if(spill>0){P([[23,-2],[32,1],[36,20],[31,29],[29,9],[22,5]],'#edba62');cut(34,39,5,10,'#edba62');cut(30,60,4,7,'#f9d389');}
  if(knight){cut(44,25,24,30,'#98a9ad');P([[44,25],[62,25],[68,31],[51,33],[44,42]],'#e9d6b1');P([[64,32],[68,31],[68,49],[60,55],[59,37]],'#526b76');for(let i=0;i<3;i++)L([49,35+i*6],[64,34+i*6],2,'#536976');}
 }
 function table(){P([[99,402],[378,402],[510,611],[-30,611]],'#624329');P([[99,402],[378,402],[500,591],[-20,591]],'#aa783e');for(let i=1;i<6;i++)L([99+i*279/6,403],[-20+i*520/6,591],2,'#7a542f');L([99,403],[378,403],3,'#dcb273');R(0,591,480,28,'#754d2c');R(0,591,480,4,'#d4a25b');L([103,458],[83,490],2,'#c8954f');L([362,508],[379,539],2,'#91602e');}
 function playerMugPoint(p,x,y,z){
  const X=x*p.scale,Y=(y*p.cosView-(z+35)*p.sinView)*p.scale;
  return[p.anchor[0]+X*p.cosRoll-Y*p.sinRoll,p.anchor[1]+X*p.sinRoll+Y*p.cosRoll];
 }
 function playerPose(s){
  const m=s.player,t=s.elapsed,p={pitch:-m.actual*1.15,roll:-m.actual*.18,scale:1.14,
   anchor:[252+Math.sin(t*1.8)*m.done*7,461-12*(m.lift||0)+Math.sin(t*2.1)*m.done*3]};
  p.sinView=Math.sin(p.pitch-MUG_ELEVATION);p.cosView=Math.cos(p.pitch-MUG_ELEVATION);p.sinRoll=Math.sin(p.roll);p.cosRoll=Math.cos(p.roll);
  p.wrist=playerMugPoint(p,54,43,-26);p.shoulder=[465,620];p.elbow=solve(p.shoulder,p.wrist,105,120,1);return p;
 }
 function player(s){const p=playerPose(s),m=s.player;
  // Jonathan's existing arm renderer, now attached to the projected handle.
  drawSerJonathanArm(...p.shoulder.map(x=>x/U),...p.elbow.map(x=>x/U),...p.wrist.map(x=>x/U),'#8d9fa8','#a9babf','#e4d8b9',false,1,5.7);
  L([p.elbow[0]-7,p.elbow[1]-6],[p.wrist[0]-7,p.wrist[1]-4],9,'#e0d5b7');L([p.elbow[0]+8,p.elbow[1]+5],[p.wrist[0]+7,p.wrist[1]+5],6,'#526a79');
  // Opposite viewing side to Sir Chugs: pouring toward us exposes the interior.
  g.save();g.translate(...p.anchor);g.rotate(p.roll);g.scale(-p.scale/.65,p.scale/.65);rivalTankard({pitch:p.pitch,anchor:[0,0],angle:0},m,true);g.restore();
  const face=(v,c)=>P(v.map(q=>playerMugPoint(p,...q)),c);
  // Volumetric steel palm, knuckle plate and curled thumb share the mug transform.
  face([[48,30,-16],[69,30,-16],[69,55,-16],[48,55,-16]],'#a9babf');
  face([[48,30,-35],[69,30,-35],[69,30,-16],[48,30,-16]],'#e4d8b9');
  face([[69,30,-35],[69,55,-35],[69,55,-16],[69,30,-16]],'#536c79');
  face([[48,55,-35],[69,55,-35],[69,55,-16],[48,55,-16]],'#6e8590');
  for(let i=0;i<3;i++){const y=35+i*6;face([[49,y,-15.8],[67,y,-15.8],[67,y+2,-15.8],[49,y+2,-15.8]],'#506976');face([[49,y-1,-15.7],[65,y-1,-15.7],[65,y,-15.7],[49,y,-15.7]],'#ddd5b8');}
  face([[42,26,-17],[51,26,-17],[54,38,-17],[45,41,-17],[40,36,-17]],'#b8c4c4');
  face([[42,26,-29],[51,26,-29],[51,26,-17],[42,26,-17]],'#eddfbc');
 }
 function camera(s){const d=s.player.done,t=s.elapsed;return{roll:d*(Math.sin(t*.92)*.024+Math.sin(t*1.61)*.006),x:Math.sin(t*.81)*d*5,y:Math.cos(t*1.23)*d*3};}
 function drawCutscene(){const im=window.KREventVisuals?.peek('tavern-chug');R(-30,50,540,740,'#795b3b');if(im){g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,-24,52,528,704);g.restore();return true;}return false;}
 function world(s){const c=camera(s);g.save();g.beginPath();g.rect(0,80,480,541);g.clip();g.translate(240+c.x,370+c.y);g.rotate(c.roll);g.translate(-240,-370);drawCutscene();actor(true,'body',s);table();actor(true,'front',s);player(s);g.restore();}
 function button(r,label){cut(r.x,r.y+4,r.w,r.h,'#493022');cut(r.x,r.y,r.w,r.h,'#e1c18a');R(r.x+8,r.y+3,r.w-16,3,'#ffdfab');T(label,r.x+r.w/2,r.y+r.h/2+5,14,'#4a2f20',r.w-15);}
 function meter(x,y,w,value,label,c){T(label,x+w/2,y-5,10);cut(x,y,w,11,'#584233');R(x+3,y+3,(w-6)*Math.min(1,value),5,c);}
 function draw(){const s=drinkGame;if(!s)return;g.save();try{
  R(0,-PAD_TOP,480,800+PAD_TOT,'#2d231c');world(s);
  R(0,-PAD_TOP,480,80+PAD_TOP,'#2d231c');T('LAST MUG STANDING',240,28,22);T('SIR CHUGS-A-LOT',240,49,10,'#cbb38b');button(MINIGAME_BACK_BTN,'< BACK');button({...PAUSE_BTN,y:PAUSE_BTN.y+uiTop},'II');
  cut(134,109,212,38,'#38271f');meter(147,132,186,s.rival.done,'SIR CHUGS', '#d19a58');
  if(s.phase==='intro'){
   cut(27,528,426,115,'#35261f');T('ONE MUG. NO STEADY HANDS.',240,551,17);
   ['DRAG UP to tilt your mug. DOWN to ease off.','The emptier it gets, the steeper the angle.','Too steep? Foam builds, then you spill.','Drinking makes your hand — and the room — sway.'].forEach((t,i)=>T(t,240,575+i*17,10));button(DRINK_START_BTN,'RAISE THE MUGS');T('Keyboard: UP / DOWN tilt. SPACE lowers the mug.',240,752,10);
  }else if(s.phase==='result'){
   cut(31,536,418,109,'#35261f');T(s.result.tie?'A VERY WOBBLY DRAW.':s.result.win?'LAST MUG STANDING!':'SIR CHUGS TAKES THE ROUND.',240,565,17);
   T(s.result.win?'“Was the room always doing that?”':'“Another? After the floor stops moving.”',240,591,11);T(s.result.time.toFixed(1)+' SECONDS  /  '+s.result.spills+' SPILLS',240,616,11);button(DRINK_REPLAY_BTN,'ANOTHER ROUND');
  }else{
   // Fixed HUD/control plane: no transformed hitboxes or postprocessing.
   cut(28,550,424,65,'#35261f');meter(43,578,181,s.player.done,'YOU','#dfb658');meter(257,578,180,s.player.foam,'FOAM','#e58e58');
   const drunk=s.player.done<.18?'STEADY':s.player.done<.48?'WARMING UP':s.player.done<.76?'WOBBLY':'ROOM IS SPINNING';T(drunk,240,604,10,'#eac68d');
   cut(controlRect.x,controlRect.y,controlRect.w,controlRect.h,'#4b3426');R(50,633,380,2,'#94693b');
   T(s.phase==='ready'?'MUGS UP...':s.player.spillT>0?'SPILLED! EASE OFF.':s.player.held?'ADJUST YOUR TILT':'DRAG HERE TO DRINK',240,651,15);
   const x=66,w=348,target=KRChugRules.ideal(s.player);R(x,680,w,9,'#241f19');R(x+w*Math.max(0,target-.04),676,w*.105,17,'#a5ad76');
   const px=x+w*s.player.actual;P([[px-6,670],[px+6,670],[px,678]],'#ffdf97');R(px-1,679,2,17,'#ffdf97');T('LOWER    <   MUG ANGLE   >    HIGHER',240,714,10);T('Drag up / down · release to lower',240,735,10);
   T('UP / DOWN tilt  ·  SPACE rest',240,775,10,'#bda683');
  }
 }finally{g.restore();}}
 window.KRTavernChug={assetId:'tavern-chug',drawCutscene,draw,world,actor,pose,materials,tankard,table,player,camera,controlRect,mugPoint,playerPose,playerMugPoint};
})();
