/* Fresh Tax Collector candidate. Live approved NPC construction only.
   Scene plate, dialogue and existing minigame are independent. */
(()=>{'use strict';
 const assetId='royal-tax-collector';
 const materials=Object.freeze({
  neutral:{skin:['#e3af74','#c28650','#85563a'],coat:['#b85d42','#873e38','#4d3032'],vest:['#c9963b','#a97829','#655020'],linen:['#e4cf97','#bfaa70','#89794c'],hair:['#976132','#613c26','#38291f'],paper:['#ecd397','#c6a85e','#89763e'],boot:['#b27a36','#7c4b28','#433122'],potato:['#d9af53','#ae7d32','#735427'],trousers:['#568978','#326458','#243e3b']},
  // Saturated material colours first, restrained sunlight second. No pale wash
  // or grey-green replacement of the skin/coat's own shadow colour.
  scene:{skin:['#ebbb7f','#ce8d52','#895c3c'],coat:['#c26943','#9a4332','#59312f'],vest:['#d8a53e','#b58525','#735824'],linen:['#ecd49a','#cbb277','#93804c'],hair:['#a56d31','#704323','#3e2d21'],paper:['#f1d991','#d4b25d','#948044'],boot:['#c58a3b','#915727','#503720'],potato:['#e3bb5b','#bb8b32','#7d5d26'],trousers:['#649782','#397565','#264b44']}
 });
 const P=(a,c)=>expPoly(a,c),R=(x,y,w,h,c)=>expRect(x,y,w,h,c);
 const bones=Object.freeze({upper:35,lower:33});
 function pose(t=0){
  const breath=Math.sin(t*1.35)*.48,sway=Math.sin(t*.65);
  const chain=(shoulder,a,b)=>{
   const elbow=[shoulder[0]+Math.cos(a)*bones.upper,shoulder[1]+Math.sin(a)*bones.upper];
   return{shoulder,elbow,wrist:[elbow[0]+Math.cos(b)*bones.lower,elbow[1]+Math.sin(b)*bones.lower]};
  };
  return{breath,head:Math.sin(t*.43)*.008,
   asking:chain([-41,-150+breath],1.95+sway*.012,1.22+sway*.035),
   seal:chain([41,-150+breath],1.12+sway*.008,-1.86+sway*.018)};
 }
 function sleeve(a,b,width,m){
  const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),nx=-dy/len*width/2,ny=dx/len*width/2;
  const q=(p,s)=>[p[0]+nx*s,p[1]+ny*s];
  P([q(a,-1),q(b,-.85),q(b,.85),q(a,1)],m[1]);
  P([q(a,.5),q(b,.45),q(b,.85),q(a,1)],m[0]);
  P([q(a,-1),q(b,-.85),q(b,-.5),q(a,-.6)],m[2]);
 }
 // Cuff orientation follows the forearm; the hand has its own supported pose.
 function handFrame(a,draw){
  g.save();g.translate(...a.wrist);
  g.rotate(Math.atan2(a.wrist[1]-a.elbow[1],a.wrist[0]-a.elbow[0])-Math.PI/2);
  draw();g.restore();
 }
 function cuff(a,m){handFrame(a,()=>{
  P([[-9,-5],[8,-5],[9,2],[-9,2]],m.linen[1]);
  R(-9,-5,17,2,m.linen[0]);R(6,-3,3,5,m.linen[2]);
 });}
 function palm(a,m,holding=false){
  g.save();g.translate(...a.wrist);
  // Both are broad frontal hands, not the cuff's narrow rotated end-cap.
  const side=holding?1:-1,poly=(v,c)=>P(v.map(([x,y])=>[x*side,y]),c);
  if(holding){
   // User-requested mirror of the complete hand only; potato and cuff stay put.
   g.scale(-1,1);
   poly([[-9,-13],[5,-13],[10,-9],[9,2],[-7,3],[-10,-1]],m.skin[1]);
   P([[-9,-12],[5,-12],[7,-9],[-9,-9]],m.skin[0]);
   poly([[7,-8],[10,-9],[9,2],[6,3],[6,-3]],m.skin[2]);
   // Raised fingertips meet the potato at the TOP edge. Keep the lower
   // palm/back of the hand clear instead of drawing fingers down to the cuff.
   for(const x of[-5,-1,3])R(x,-12.5,.8,5,m.skin[2]);
  }else{
   poly([[-8,-1],[7,-1],[11,3],[9,13],[-7,13],[-9,9]],m.skin[1]);
   P([[-9,1],[7,0],[8,3],[-9,4]],m.skin[0]);
   P([[6,4],[8,3],[8,12],[5,13],[5,5]],m.skin[2]);
   for(const x of[-5,-1,3])R(x,7,.8,5,m.skin[2]);
  }
  g.restore();
 }
 function head(t,m,p){
  g.save();g.translate(0,-161+p.breath);g.rotate(p.head);
  // Neck is behind the shirt collar, not a rectangle painted over it.
  P([[-23,-41],[-16,-48],[13,-48],[24,-39],[24,-9],[15,2],[-13,2],[-24,-10]],m.skin[1]);
  P([[-23,-41],[-16,-48],[-2,-48],[-2,-13],[-9,-7],[-20,-10],[-24,-18]],m.skin[0]);
  P([[14,-47],[24,-39],[24,-9],[15,2],[5,2],[15,-10],[17,-30]],m.skin[2]);
  R(-28,-29,6,14,m.skin[1]);R(-28,-28,3,8,m.skin[0]);R(24,-28,5,13,m.skin[2]);
  P([[-25,-24],[-27,-43],[-17,-52],[13,-53],[25,-45],[28,-31],[23,-22],[20,-37],[11,-43],[-8,-42],[-20,-36],[-21,-23]],m.hair[1]);
  P([[-27,-43],[-17,-52],[13,-53],[20,-47],[-5,-46],[-20,-39]],m.hair[0]);
  P([[19,-43],[25,-45],[28,-31],[23,-22],[20,-25]],m.hair[2]);
  P(p.sad?[[-18,-29],[-7,-33],[-7,-30],[-18,-26]]:[[-18,-31],[-7,-29],[-7,-26],[-18,-28]],m.hair[1]);
  P(p.sad?[[6,-33],[17,-29],[18,-26],[6,-30]]:[[6,-32],[17,-34],[18,-31],[6,-29]],m.hair[1]);
  const blink=Math.sin(t*.83)>.995;
  R(-16,-23,5,blink?1:3,m.hair[2]);R(9,-24,5,blink?1:3,m.hair[2]);
  P([[-3,-30],[3,-30],[6,-15],[2,-11],[-5,-14]],m.skin[1]);
  P([[-3,-30],[-1,-29],[-1,-15],[-5,-14]],m.skin[0]);
  P([[3,-30],[6,-15],[2,-11],[-1,-13],[2,-16]],m.skin[2]);
  P([[-15,-12],[-6,-15],[0,-12],[-1,-8],[-8,-9],[-15,-7]],m.hair[1]);
  P([[0,-12],[6,-15],[16,-13],[17,-9],[8,-9],[2,-8]],m.hair[2]);
  P(p.sad?[[-8,-2],[-3,-6],[5,-6],[11,-2],[6,-3],[-3,-3]]:[[-8,-4],[5,-4],[12,-7],[10,-4],[5,-2],[-8,-2]],m.hair[1]);
  P([[-9,-.5],[9,-.5],[5,2],[-7,2]],m.skin[1]);
  // Small folded paper hat, bent tip; no jewels or metallic highlights.
  P([[-22,-45],[-24,-65],[-13,-58],[-4,-70],[5,-58],[18,-65],[23,-44]],m.paper[1]);
  P([[-22,-45],[-24,-65],[-13,-58],[-4,-70],[-2,-47]],m.paper[0]);
  P([[18,-65],[25,-60],[20,-56]],m.paper[0]);
  P([[5,-58],[18,-65],[23,-44],[15,-45]],m.paper[2]);
  P([[-22,-49],[-3,-51],[22,-48],[23,-43],[-21,-44]],m.paper[0]);
  P([[-3,-51],[22,-48],[23,-43],[-2,-45]],m.paper[1]);
  g.restore();
 }
 function actor(t=0,lit=true,performance=null,pass='all'){const m=materials[lit?'scene':'neutral'],p=performance||pose(t);
  g.save();try{
   if(pass!=='front'){
   // Extra leg height, not a uniform enlargement of head, hands or boots.
   R(-30,-77,25,63,m.trousers[2]);R(-29,-77,8,60,m.trousers[0]);
   R(8,-77,25,63,m.trousers[2]);R(9,-77,9,60,m.trousers[1]);
   P([[-27,-47],[-15,-49],[-13,-35],[-25,-34]],m.trousers[1]);
   R(-24,-46,1,3,m.linen[2]);R(-18,-47,1,3,m.linen[2]);
   for(const [x,k]of[[-32,0],[7,1]]){
    R(x,-22,27,13,m.boot[1]);R(x,-22,27,4,m.boot[k]);
    P([[x,-11],[x+25,-11],[x+31,-5],[x+31,2],[x-3,2],[x-3,-6]],m.boot[1]);
    R(x,-10,23,4,m.boot[k]);R(x-3,-1,34,4,m.boot[2]);
   }
   // Short tapered neck meets the jaw and disappears inside the shirt opening.
   g.save();g.translate(0,p.breath);
   P([[-11,-165],[11,-165],[10,-154],[0,-151],[-10,-155]],m.skin[1]);
   P([[-11,-165],[-5,-165],[-5,-153],[-10,-155]],m.skin[0]);
   P([[-11,-161],[11,-161],[10,-157],[-7,-157]],m.skin[2]);
   g.restore();
   g.save();g.translate(0,p.breath-32);
   // Extend the coat/waist by eight units below the shoulder, independently
   // of the untouched head/arm rig and the longer trouser columns.
   g.translate(0,-133);g.scale(1,1.09);g.translate(0,133);
   P([[-34,-126],[-15,-133],[17,-132],[37,-124],[48,-94],[47,-65],[37,-43],[-36,-43],[-46,-65],[-47,-94]],m.coat[1]);
   P([[-34,-126],[-17,-131],[-20,-104],[-25,-77],[-22,-45],[-36,-43],[-46,-65],[-47,-94]],m.coat[0]);
   P([[29,-126],[37,-124],[48,-94],[47,-65],[37,-43],[25,-44],[33,-69],[33,-98]],m.coat[2]);
   P([[-17,-128],[18,-128],[30,-99],[32,-69],[24,-47],[-24,-47],[-30,-68],[-29,-98]],m.vest[1]);
   P([[-17,-128],[-2,-127],[-1,-48],[-24,-47],[-30,-68],[-29,-98]],m.vest[0]);
   P([[18,-128],[30,-99],[32,-69],[24,-47],[14,-48],[20,-74],[19,-102]],m.vest[2]);
   P([[-10,-124],[0,-121],[10,-124],[8,-107],[-7,-107]],m.linen[1]);
   P([[-17,-130],[-11,-130],[-8,-125],[0,-120],[-8,-110],[-23,-121]],m.linen[0]);
   P([[11,-130],[19,-128],[24,-119],[10,-110],[0,-120],[8,-125]],m.linen[1]);
   // Uneven imitation-gold braid; inexpensive sewn cloth, not noble metal.
   P([[-21,-125],[-18,-126],[-23,-96],[-21,-72],[-24,-70],[-26,-97]],m.paper[2]);
   P([[20,-126],[23,-124],[27,-97],[24,-81],[22,-82],[24,-97]],m.paper[1]);
   R(-2,-104,5,4,m.boot[0]);R(0,-89,3,3,m.linen[1]);
   R(-1,-78,1,3,m.boot[2]);R(1,-78,1,3,m.boot[2]);
   // A replacement panel and exposed stitches interrupt the would-be finery.
   P([[11,-101],[24,-103],[26,-88],[12,-86]],m.coat[2]);
   for(const sy of[-99,-94,-89])R(12,sy,3,1,m.linen[1]);
   P([[-40,-69],[-4,-67],[40,-70],[39,-61],[-4,-58],[-40,-60]],m.boot[2]);
   P([[-5,-70],[9,-70],[9,-57],[-5,-57]],m.paper[1]);R(-2,-67,8,7,m.boot[1]);
   P([[-38,-55],[-26,-57],[-24,-45],[-37,-43]],m.coat[2]);
   R(-35,-54,1,4,m.linen[1]);R(-29,-55,1,4,m.linen[1]);
   P([[30,-67],[43,-67],[48,-51],[40,-41],[27,-45],[25,-57]],m.boot[1]);
   P([[30,-67],[43,-67],[43,-61],[28,-60]],m.boot[0]);
   g.restore();head(t,m,p);
   }
   if(pass==='body')return;
   // Torso -> both shoulder roots -> both upper arms -> forearms -> hands.
   for(const a of[p.asking,p.seal]){const[x,y]=a.shoulder;
    P([[x-10,y-10],[x+7,y-12],[x+14,y-3],[x+12,y+10],[x-11,y+10],[x-15,y]],m.coat[1]);
    P([[x-10,y-10],[x+7,y-12],[x+11,y-6],[x-8,y-3],[x-15,y]],m.coat[0]);
   }
   for(const a of[p.asking,p.seal])sleeve(a.shoulder,a.elbow,23,m.coat);
   for(const a of[p.asking,p.seal])sleeve(a.elbow,a.wrist,18,m.coat);
   for(const a of[p.asking,p.seal])cuff(a,m);
   palm(p.asking,m);
   // The block palm supports/occludes the lower potato edge; no platter-shaped
   // hand or detached grabbing fingers. Lift prop onto that unchanged wrist.
   if(performance)return;
   palm(p.seal,m,true);
   g.save();g.translate(...p.seal.wrist);
   g.translate(0,-8);
   P([[-13,-9],[-15,-24],[-7,-32],[7,-33],[17,-24],[18,-12],[10,-3],[-5,-2]],m.potato[1]);
   P([[-13,-9],[-15,-24],[-7,-32],[7,-33],[7,-20],[-4,-13]],m.potato[0]);
   P([[7,-33],[17,-24],[18,-12],[10,-3],[6,-17]],m.potato[2]);
   P([[-12,-11],[-5,-19],[7,-20],[15,-13],[11,-3],[-4,-2]],m.linen[0]);
   P([[-6,-13],[-2,-10],[1,-16],[5,-10],[10,-14],[8,-6],[-4,-6]],'#a24e3d');
   R(-8,-27,3,2,m.potato[2]);R(5,-29,2,2,m.potato[2]);
   g.restore();
   palm(p.seal,m,true);
  }finally{g.restore();}
 }
 const placement=Object.freeze({x:232,y:473,scale:1.48});
 function drawConversation(t){const im=window.KREventVisuals?.peek(assetId);if(!im)return false;
  g.save();try{
   g.fillStyle='#30241e';g.fillRect(0,-PAD_TOP,480,800+PAD_TOT);
   g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,0,0,480,512);
   g.translate(placement.x,placement.y);g.scale(placement.scale,placement.scale);
   P([[-38,1],[-4,-5],[35,-3],[77,16],[53,23],[-11,11]],'rgba(53,60,35,.21)');
   P([[-37,2],[-27,-3],[-5,-3],[1,3],[-10,6],[-34,6]],'rgba(49,49,31,.36)');
   P([[4,2],[13,-3],[36,-2],[41,4],[31,7],[6,6]],'rgba(49,49,31,.36)');
   actor(t,true);return true;
  }finally{g.restore();}
 }
 // Deterministic, event-owned game. No global rewards, timers or input listeners.
 const GO={x:95,y:713,w:290,h:44},CONTACT_Y=510;
 const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
 const PAPER_CONTACT=(CONTACT_Y-450)/160;
 // One rigid sheet on the table plane: lateral world translation is projected
 // at each depth. Neither paper nor glove is sheared around a pinned corner.
 const paperPoint=(offset,u,v)=>[240+(u+offset*.5)*(1+v*.25),450+v*160];
 const paperCenter=s=>paperPoint(s.paper,0,PAPER_CONTACT)[0];
 const raisedX=s=>clamp(s.aim+55,285,310);
 function createSeal(seed=1){return{phase:'intro',time:0,elapsed:0,paper:0,target:0,aim:240,handX:295,handY:385,misses:0,hits:0,marks:[],rng:seed>>>0,feinted:false,drag:null,result:null,settled:false};}
 function random(s){s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;}
 function phase(s,id){s.phase=id;s.time=0;s.fromX=s.handX;s.fromY=s.handY;}
 function impact(s){
  // Actual paper half-width at this depth plus the flat seal's half-width.
  const hit=Math.abs(s.aim-paperCenter(s))<50*(1+PAPER_CONTACT*.25)+25;
  s.marks.push({x:s.aim,y:CONTACT_Y,hit,offset:s.paper});
  if(hit)s.hits++;else s.misses++;
  if(s.hits>=2||s.misses>=3){s.result={win:s.misses>=3};phase(s,'result');s.drag=null;}
  else phase(s,'recover');
 }
 function updateSeal(s,dt){
  if(s.phase==='intro')return;
  // Bounded substeps make collision and pointer speed independent of frame rate.
  for(let remaining=Math.min(dt,.25);remaining>1e-8;){const h=Math.min(remaining,1/120);remaining-=h;s.time+=h;s.elapsed+=h;
   const delta=s.target-s.paper;s.paper+=Math.sign(delta)*Math.min(Math.abs(delta),h*900);
   if(s.phase==='track'){
    s.aim=clamp(paperCenter(s),210,290);s.handX+=(raisedX(s)-s.handX)*Math.min(1,h*10);s.handY+=(385-s.handY)*Math.min(1,h*10);
    if(s.time>s.wait){if(!s.feinted&&s.misses+s.hits>0&&random(s)<.58){s.feinted=true;phase(s,'feint');}else phase(s,'commit');}
   }else if(s.phase==='feint'){
    const k=Math.sin(clamp(s.time/.3,0,1)*Math.PI);
    s.handX=lerp(s.fromX,s.aim,k*.25);s.handY=s.fromY+k*35;
    if(s.time>=.3){s.wait=.28+random(s)*.22;phase(s,'track');}
   }else if(s.phase==='commit'){
    const k=smooth(s.time/.32);s.handX=lerp(s.fromX,raisedX(s),k);s.handY=lerp(s.fromY,360,k);
    if(s.time>=.32)phase(s,'strike');
   }else if(s.phase==='strike'){
    const k=smooth(s.time/.14);s.handX=lerp(s.fromX,s.aim,k);s.handY=lerp(s.fromY,CONTACT_Y-28,k);
    if(s.time>=.14)impact(s);
   }else if(s.phase==='recover'){
    const k=smooth(s.time/.55);s.handX=lerp(s.fromX,raisedX(s),k);s.handY=lerp(s.fromY,385,k);
    if(s.time>=.72){s.feinted=false;s.wait=.65+random(s)*.45;phase(s,'track');}
   }else if(s.phase==='result'){
    const k=smooth(s.time/1.1);s.handX=lerp(s.fromX,s.result.win?s.fromX:raisedX(s),k);s.handY=lerp(s.fromY,s.result.win?CONTACT_Y-28:385,k);
   }
  }
 }
 function sealAction(s,action,point){
  if(s.phase==='intro'&&(action==='continue'||action==='choice1'||(action==='tap'&&point&&pointInRect(point,GO)))){s.wait=1.0;phase(s,'track');return true;}
  if(s.phase==='result')return s.time>1.6&&(action==='continue'||(action==='tap'&&point&&pointInRect(point,GO)))?'leave':true;
  if(action==='left'||action==='right')s.target=action==='left'?-170:170;
  return true;
 }
 function sealPointer(s,kind,pt){
  if(kind==='cancel'){s.drag=null;return false;}
  if(['intro','result'].includes(s.phase))return false;
  if(kind==='down'){if(pt.y<405||pt.y>650)return false;s.drag={x:pt.x,offset:s.target};return true;}
  if(!s.drag)return false;
  s.target=clamp(s.drag.offset+(pt.x-s.drag.x)*1.25,-170,170);
  if(kind==='up')s.drag=null;return true;
 }
 function solve(shoulder,target,side){
  const dx=target[0]-shoulder[0],dy=target[1]-shoulder[1],d=clamp(Math.hypot(dx,dy),2.01,67.99),angle=Math.atan2(dy,dx),
   bend=Math.acos(clamp((35*35+d*d-33*33)/(70*d),-1,1)),a=angle+side*bend;
  return{shoulder,elbow:[shoulder[0]+35*Math.cos(a),shoulder[1]+35*Math.sin(a)],wrist:[shoulder[0]+d*Math.cos(angle),shoulder[1]+d*Math.sin(angle)]};
 }
 function sealPose(s){
  const p=pose(s.elapsed),sad=s.result?.win?smooth(s.time/1.0):0;
  p.sad=sad>.25;p.head+=sad*.055;
  const local=([x,y])=>[(x-220)/2.9,(y-780)/2.9];
  p.asking=solve([-41,-150+sad*3],local(paperPoint(s.paper,-55,-.0375)),1);
  p.seal=solve([41,-150+sad*3],local([s.handX,s.handY]),-1);return p;
 }
 function sealMark(x,y,k=1){g.save();g.translate(x,y);g.scale(k,k);P([[-14,-7],[-8,-4],[-3,-9],[3,-3],[11,-8],[9,5],[-11,5]],'#8f382b');R(-10,7,19,2,'#8f382b');g.restore();}
 function paperQuad(offset){return[[-50,0],[50,0],[50,1],[-50,1]].map(([u,v])=>paperPoint(offset,u,v));}
 function paperPath(offset){const q=paperQuad(offset);g.moveTo(...q[0]);for(let i=1;i<4;i++)g.lineTo(...q[i]);g.closePath();}
 function drawSeal(s){
  g.save();try{
   R(0,-PAD_TOP,480,800+PAD_TOT,'#30241e');
   const im=window.KREventVisuals?.peek(assetId);if(im)g.drawImage(im,-60,0,600,640);else{R(0,0,480,640,'#607246');}
   const p=sealPose(s),m=materials.scene;
   g.save();g.translate(220,780);g.scale(2.9,2.9);actor(s.elapsed,true,p,'body');g.restore();
   // Physical oak checkpoint table, not another opaque UI panel.
   P([[73,402],[407,402],[479,636],[1,636]],'#a66f32');
   P([[1,636],[479,636],[479,654],[1,654]],'#674123');R(3,636,474,4,'#d3a159');
   for(let i=1;i<6;i++){const x=73+i*334/6;expSegment(x,404,(x-240)*1.43+240,633,2,'#815125');}
   for(const mark of s.marks){g.save();g.beginPath();g.rect(0,402,480,234);paperPath(mark.offset);g.clip('evenodd');sealMark(mark.x,mark.y);g.restore();}
   const q=s.paper,quad=paperQuad(q);
   P(quad.map(([x,y])=>[x+3,y+5]),'rgba(49,31,19,.24)');P(quad,'#dec58c');
   P([[-46,.025],[46,.025],[46,.95],[-46,.95]].map(([u,v])=>paperPoint(q,u,v)),'#efdaa8');
   g.fillStyle='#755334';g.textAlign='center';g.font='bold 11px monospace';g.fillText('ROYAL PASS',...paperPoint(q,0,.22));
   for(let i=0;i<5;i++){const v=.39+i*.10;expSegment(...paperPoint(q,-32,v),...paperPoint(q,32,v),1.5,'#b59b68');}
   g.save();g.beginPath();paperPath(q);g.clip();
   for(const mark of s.marks)if(mark.hit){const u=(mark.x-240)/(1+PAPER_CONTACT*.25)-mark.offset*.5;sealMark(...paperPoint(q,u,PAPER_CONTACT));}
   g.restore();
   // Jonathan's plated fingertips travel with the near end of the document.
   const grip=paperPoint(q,0,1);g.save();g.translate(grip[0]-240,grip[1]-610);
   P([[219,594],[253,594],[261,609],[255,627],[224,627],[215,610]],'#8397a2');
   P([[219,594],[253,594],[255,601],[220,601]],'#d5ded8');
   for(const x of[226,236,246])R(x,605,2,14,'#435d6d');g.restore();
   g.save();g.translate(220,780);g.scale(2.9,2.9);actor(s.elapsed,true,p,'front');g.restore();
   const wrist=[220+p.seal.wrist[0]*2.9,780+p.seal.wrist[1]*2.9],crush=s.result?.win?smooth(s.time/.5):0;
   g.save();g.translate(...wrist);
   g.scale(1,1-crush*.50);
   P([[-24,-8],[19,-8],[30,9],[25,24],[-23,24],[-29,10]],m.potato[1]);
   P([[-24,-8],[1,-8],[1,23],[-23,24],[-29,10]],m.potato[0]);
   P([[19,-8],[30,9],[25,24],[17,24],[21,8]],m.potato[2]);
   P([[-23,24],[25,24],[19,28],[-19,28]],'#963d29');
   g.restore();
   // A broad merchant-style palm presses from above. Short finger divisions
   // terminate on the potato, not on the back of an upward-facing fist.
   g.save();g.translate(...wrist);
   P([[-23,-19],[17,-20],[25,-11],[23,8],[-19,8],[-25,1]],m.skin[1]);
   P([[-23,-19],[17,-20],[21,-13],[-23,-12]],m.skin[0]);
   P([[20,-12],[25,-11],[23,8],[18,8]],m.skin[2]);
   for(const x of[-13,-2,9])R(x,-1,2,9,m.skin[2]);g.restore();
   if(crush){for(let i=0;i<5;i++){const d=crush*(15+i*5);P([[wrist[0]+(i-2)*d,wrist[1]+17+i*2],[wrist[0]+(i-2)*d+6,wrist[1]+20+i*2],[wrist[0]+(i-2)*d+1,wrist[1]+26+i*2]],m.potato[i%3]);}}
   if(pausePhotoMode)return;
   KRUI.heading(g,{x:72,y:24,w:336,h:48},'THE ROYAL SEAL','treasure',23);
   drawPauseButton();
   KRUI.sheet(g,{x:24,y:658,w:432,h:134});
   g.textAlign='center';g.fillStyle='#493323';g.font='bold 14px monospace';
   if(s.phase==='intro'){
    g.fillText('Dodge 3 stamps. Two hits: up to 5 gold.',240,698,406);
    KRUI.button(g,GO,'TRY STAMPING THIS','treasure',{size:15});
   }else if(s.phase==='result'){
    g.fillText(s.result.win?'His royal authority... mashed.':s.cost?'Tax paid: '+s.cost+' gold.':'An empty purse. He gives up collecting.',240,698,406);
    KRUI.button(g,GO,s.result.win?'LEAVE HIM TO HIS POTATO':'BACK TO THE ROAD','treasure',{enabled:s.time>1.6,size:14});
   }else{
    g.fillText('MISSED '+s.misses+'/3     STAMPED '+s.hits+'/2',240,698);
    g.font='13px monospace';g.fillText(s.phase==='commit'?'He commits. MOVE!':s.phase==='feint'?'Not yet...':s.phase==='strike'?'STAMP!':'Watch the hand. He follows your paper.',240,723,404);
    g.font='11px monospace';g.fillText('Hold and drag the lower paper edge.  [A / D]',240,758,400);
   }
  }finally{g.restore();}
 }
 window.KRTaxCollector=Object.freeze({assetId,materials,bones,pose,actor,placement,drawConversation,createSeal,updateSeal,sealAction,sealPointer,sealPose,paperPoint,drawSeal});
})();
