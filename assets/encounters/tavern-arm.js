/* Native Oakbreaker duel. Broad approved human masses, Borin-style muscle planes,
   fixed table elbows, one shared grip. Candidate, not an approved art anchor. */
(()=>{'use strict';
 const P=(pts,c)=>{g.fillStyle=c;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();};
 const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
 const L=(a,b,w,c)=>expSegment(a[0],a[1],b[0],b[1],w,c);
 const T=(s,x,y,size=12,c='#edd4a0',max=430)=>smithText(s,x,y,size,c,max);
 const cut=(x,y,w,h,c)=>P([[x+6,y],[x+w-6,y],[x+w,y+6],[x+w,y+h-6],[x+w-6,y+h],[x+6,y+h],[x,y+h-6],[x,y+6]],c);
 const holdRect=Object.freeze({x:72,y:654,w:336,h:71});
 const materials={
  neutral:{skin:['#e1bc8d','#c99e72','#986c53'],leather:['#a67448','#6c4935','#403733'],fur:['#c9c2a1','#a49e84','#777d75'],hair:['#775338','#4f382d','#302f2d'],steel:['#d6dad0','#8a9b9b','#4e666d']},
  scene:{skin:['#ffd19a','#df9d69','#986953'],leather:['#d49951','#87522f','#4a3831'],fur:['#f4d293','#c2b08b','#7c9395'],hair:['#9b6837','#603a28','#354044'],steel:['#f1dbab','#a2b9b5','#536f7b']}
 };
 // User pose reference: rival's right elbow at left/far, player's at right/near.
 // The grip rotates on the intersection of the two fixed forearm spheres.
 const project=([x,d,z])=>[240+x,455+d*.43-z];
 function pose(s={},t=0){
  let power=s.power??.5;
  if(s.phase==='pinning'){const u=Math.min(1,s.phaseT/KRArmRules.rules.pinTime),e=u*u*(3-2*u);power=(s.pinFrom??power)+((s.result?.win?1:0)-(s.pinFrom??power))*e;}
  if(s.phase==='result')power=s.result?.win?1:0;
  const angle=(.5-power)*Math.PI+(s.cue==='surge'&&s.phase==='playing'?Math.sin(t*22)*.004:0),axis=Math.hypot(62,68),swing=138*Math.sin(angle);
  const grip3=[swing*68/axis,-swing*62/axis,138*Math.cos(angle)],rivalElbow3=[-62,-68,0],playerElbow3=[62,68,0];
  const grip=project(grip3),rivalElbow=project(rivalElbow3),playerElbow=project(playerElbow3);
  const set=s.cue==='windup'?-7*Math.min(1,(s.cueT||0)/.3):s.cue==='surge'?-7:0;
  const lean=(.5-power)*25,dx=-44+lean+set,shoulder=[rivalElbow[0]+dx,rivalElbow[1]-Math.sqrt(135*135-dx*dx)];
  const body=[shoulder[0]+80,shoulder[1]],freeShoulder=[body[0]+79,body[1]+2],freeWrist=[393,408];
  const vx=freeWrist[0]-freeShoulder[0],vy=freeWrist[1]-freeShoulder[1],d=Math.hypot(vx,vy),u=79,v=91,a=(u*u-v*v+d*d)/(2*d),h=Math.sqrt(Math.max(0,u*u-a*a));
  const freeElbow=[freeShoulder[0]+vx*a/d+vy*h/d,freeShoulder[1]+vy*a/d-vx*h/d];
  return{power,angle,grip,grip3,rivalElbow,playerElbow,rivalElbow3,playerElbow3,shoulder,body,freeShoulder,freeElbow,freeWrist,
   strain:s.cue==='windup'||s.cue==='surge',breath:Math.sin(t*1.7)*.4};
 }
 function muscle(a,b,width,m){
  const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,n=[-dy/d,dx/d],q=(u,v)=>[a[0]+dx*u+n[0]*width*v,a[1]+dy*u+n[1]*width*v];
  P([q(0,-.42),q(.25,-.57),q(.72,-.44),q(1,-.27),q(1,.27),q(.62,.47),q(.2,.5),q(0,.35)],m[2]);
  P([q(0,-.42),q(.25,-.57),q(.65,-.40),q(1,-.27),q(1,.10),q(.62,.25),q(.16,.3)],m[1]);
  P([q(.04,-.37),q(.25,-.49),q(.61,-.35),q(.72,-.18),q(.26,-.16),q(.09,-.08)],m[0]);
 }
 function actor(lit=true,pass='all',s=armWrestleGame||{},time=perfNow){
  const m=lit?materials.scene:materials.neutral,p=pose(s,time),[bx,by]=p.body;
  g.save();try{
   if(pass!=='front'){
    g.translate(bx,by);
    // Wide squared ribcage, short thick neck, open leather vest, not a stretched Barry.
    P([[-75,-15],[-34,-48],[34,-48],[78,-13],[82,51],[57,117],[-56,117],[-83,48]],m.skin[1]);
    P([[-75,-15],[-34,-48],[-6,-29],[-8,43],[-56,64],[-83,48]],m.skin[0]);
    P([[34,-48],[78,-13],[82,51],[57,117],[24,98],[33,24]],m.skin[2]);
    P([[-28,-65],[24,-65],[27,-31],[13,-9],[-9,-13],[-31,-34]],m.skin[1]);
    P([[-28,-65],[-10,-63],[-7,-23],[-9,-13],[-31,-34]],m.skin[0]);
    P([[17,-64],[24,-65],[27,-31],[13,-9],[6,-20]],m.skin[2]);
    P([[-63,-19],[-43,-29],[-31,-19],[-37,17],[-21,61],[-29,112],[-58,116],[-76,44]],m.leather[1]);
    P([[42,-29],[64,-17],[76,45],[59,116],[24,113],[27,59],[36,17],[31,-18]],m.leather[2]);
    P([[-63,-19],[-43,-29],[-31,-19],[-37,17],[-42,21],[-42,-10]],m.leather[0]);
    P([[42,-29],[64,-17],[61,-7],[42,-15],[36,17],[31,-18]],m.leather[0]);
    // Low-detail sheepskin at the shoulder roots; no furry noise.
    P([[-66,-19],[-45,-35],[-30,-24],[-31,-13],[-42,-18],[-46,-8],[-57,-11],[-66,-3],[-72,-10]],m.fur[1]);
    P([[-66,-19],[-45,-35],[-30,-24],[-39,-25],[-49,-24],[-58,-14]],m.fur[0]);
    P([[30,-24],[43,-35],[65,-19],[72,-8],[61,-3],[57,-12],[47,-8],[42,-18],[31,-13]],m.fur[2]);
    P([[30,-24],[43,-35],[65,-19],[58,-16],[43,-26],[34,-17]],m.fur[1]);
    P([[-22,8],[-7,12],[0,24],[10,12],[24,7],[23,16],[7,23],[-7,23],[-21,18]],m.skin[2]);
    P([[-66,88],[62,88],[59,106],[-61,106]],m.leather[2]);cut(-12,86,26,22,m.steel[1]);R(-7,91,16,12,m.leather[2]);R(-11,87,23,3,m.steel[0]);
    g.save();g.translate(-3,-73+p.breath);g.rotate(p.strain?-.055:-.025);g.scale(1.12,1.05);
    // Compact block head; raised outer brow, lopsided closed-mouth smirk.
    P([[-30,-44],[24,-46],[33,-27],[30,15],[15,33],[-17,32],[-32,15],[-35,-21]],m.skin[1]);
    P([[-30,-44],[-7,-44],[-10,16],[-17,25],[-32,15],[-35,-21]],m.skin[0]);
    P([[24,-46],[33,-27],[30,15],[15,33],[4,25],[18,11],[18,-24]],m.skin[2]);
    R(-38,-17,8,19,m.skin[1]);R(-38,-14,3,12,m.skin[0]);R(29,-16,8,17,m.skin[2]);
    P([[-34,-10],[-39,-32],[-30,-46],[-35,-52],[-10,-57],[5,-66],[12,-57],[27,-53],[35,-37],[33,-17],[27,-7],[23,-31],[3,-36],[-15,-34],[-27,-24],[-28,-6]],m.hair[1]);
    P([[-39,-32],[-30,-46],[-35,-52],[-10,-57],[5,-66],[12,-57],[-10,-47],[-27,-41]],m.hair[0]);
    P([[27,-53],[35,-37],[33,-17],[27,-7],[23,-31]],m.hair[2]);
    P([[-26,-18],[-9,-15],[-8,-10],[-27,-13]],m.hair[2]);
    P([[7,-15],[24,p.strain?-16:-23],[25,-17],[8,-10]],m.hair[2]);
    R(-23,-6,7,4,'#343129');R(10,-8,6,4,'#343129');
    P([[-3,-15],[3,-14],[8,6],[-5,8]],m.skin[1]);R(-3,-12,4,14,m.skin[0]);P([[3,-14],[8,6],[2,10],[-5,8],[2,5]],m.skin[2]);
    P([[-29,6],[-20,15],[-10,15],[-3,12],[4,13],[14,11],[27,4],[24,22],[14,35],[-13,34],[-28,22]],m.hair[1]);
    P([[-29,6],[-20,15],[-17,29],[-13,34],[-28,22]],m.hair[0]);
    P([[-14,19],[4,19],[17,p.strain?17:14],[16,22],[-10,24]],'#4c3228');
    if(!p.strain)P([[-9,19],[5,19],[14,17],[12,20],[-7,21]],m.fur[0]);
    R(29,-4,5,8,m.steel[1]);R(29,-4,2,5,m.steel[0]);g.restore();g.restore();g.save();
   }
   if(pass!=='body'){
    // Shoulders AND upper arms clear the far table edge; no amputated elbow.
    muscle(p.shoulder,p.rivalElbow,56,m.skin);muscle(p.freeShoulder,p.freeElbow,55,m.skin);
    L([p.shoulder[0]-7,p.shoulder[1]+19],[p.shoulder[0]+4,p.shoulder[1]+35],5,m.leather[2]);
    muscle(p.freeElbow,p.freeWrist,36,m.skin);cut(382,398,25,23,m.skin[1]);R(382,398,21,6,m.skin[0]);
    for(let i=0;i<3;i++)R(385+i*6,412,2,7,m.skin[2]);
    cut(p.rivalElbow[0]-17,p.rivalElbow[1]-13,34,29,m.skin[1]);
    muscle(p.rivalElbow,p.grip,42,m.skin);
    const cuff=[p.rivalElbow[0]+(p.grip[0]-p.rivalElbow[0])*.70,p.rivalElbow[1]+(p.grip[1]-p.rivalElbow[1])*.70];
    L(cuff,[cuff[0]+(p.grip[0]-p.rivalElbow[0])*.12,cuff[1]+(p.grip[1]-p.rivalElbow[1])*.12],34,m.leather[2]);
   }
  }finally{g.restore();}
 }
 function table(){
  P([[84,385],[396,385],[495,597],[-15,597]],'#543322');
  P([[84,385],[396,385],[480,580],[0,580]],'#ac723b');
  for(let i=1;i<7;i++){const x=84+i*312/7;L([x,386],[i*480/7,580],2,'#805027');}
  P([[0,580],[480,580],[480,614],[0,614]],'#714326');R(0,580,480,4,'#e4ac60');R(14,601,452,4,'#563423');
  for(const x of [26,446]){cut(x,587,10,10,'#4a4140');R(x+2,589,3,3,'#a59b79');}
  for(const [x,y,w,h]of [[148,414,61,30],[269,474,67,35],[112,481,58,31],[312,399,58,31]]){cut(x,y+4,w,h,'#472b27');cut(x,y,w,h,'#804b39');R(x+7,y+3,w-14,2,'#b27a51');}
  for(const [x,y]of [[393,413],[96,518]]){cut(x-13,y-3,26,13,'#493126');cut(x-7,y-37,14,41,'#765333');R(x-6,y-34,4,32,'#ce9a52');}
  // Sparse long wear marks follow the wood rather than dense diagonal texture.
  L([73,505],[60,534],2,'#bf8746');L([393,463],[405,491],2,'#875629');
 }
 function knightMaterials(lit=true){
  // Jonathan's existing steel palette; only this room adds warm/cool reflected light.
  const base={armor:'#919da7',dark:'#4b5966',light:'#c4ced5',steel:'#aebbc5',shine:'#edf4f7'};
  return lit?{armor:mixCol(base.armor,'#e7b984',.14),dark:mixCol(base.dark,'#496c7b',.16),light:mixCol(base.light,'#ffdda1',.22),steel:mixCol(base.steel,'#e9bd86',.12),shine:mixCol(base.shine,'#ffe5b6',.20)}:base;
 }
 function player(s,lit=true){
  const p=pose(s),m=lit?materials.scene:materials.neutral,k=knightMaterials(lit);
  const arm=(a,e,b,bulk)=>drawSerJonathanArm(a[0]/U,a[1]/U,e[0]/U,e[1]/U,b[0]/U,b[1]/U,k.armor,k.steel,k.light,false,1,bulk);
  const plate=(a,b,w)=>{
   const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,n=[-dy/d,dx/d],q=(u,v)=>[a[0]+dx*u+n[0]*w*v,a[1]+dy*u+n[1]*w*v];
   P([q(.04,-.50),q(.85,-.43),q(.96,-.28),q(.96,.29),q(.24,.48),q(.04,.38)],k.dark);
   P([q(.04,-.50),q(.85,-.43),q(.96,-.28),q(.94,.08),q(.24,.25),q(.04,.17)],k.steel);
   P([q(.07,-.47),q(.83,-.40),q(.9,-.30),q(.26,-.31),q(.08,-.26)],k.light);
   L(q(.24,.25),q(.89,.10),1.5,k.armor);
   // Overlapping wrist lames articulate with the forearm, not a painted stripe.
   for(const u of [.72,.86]){L(q(u,-.42),q(u,.29),4,k.dark);L(q(u-.015,-.4),q(u-.015,.27),2,k.light);}
  };
  // Reuse the knight's actual upper-arm / elbow / forearm construction in U units.
  const shoulder=[432,617];arm(shoulder,p.playerElbow,p.grip,8);
  plate(shoulder,p.playerElbow,48);plate(p.playerElbow,p.grip,42);
  cut(p.playerElbow[0]-20,p.playerElbow[1]-13,40,30,k.armor);
  P([[p.playerElbow[0]-14,p.playerElbow[1]-13],[p.playerElbow[0]+14,p.playerElbow[1]-13],[p.playerElbow[0]+20,p.playerElbow[1]-7],[p.playerElbow[0]+10,p.playerElbow[1]-4],[p.playerElbow[0]-17,p.playerElbow[1]-5]],k.light);
  // The knight's other steel gauntlet stays closed around the near handle.
  const freeA=[32,613],freeE=[69,548],freeW=[96,500];arm(freeA,freeE,freeW,5.6);plate(freeA,freeE,34);plate(freeE,freeW,28);
  cut(83,489,26,26,k.steel);R(84,490,7,18,k.light);
  for(let i=0;i<3;i++){L([87,496+i*6],[104,496+i*6],3,k.dark);L([87,494+i*6],[103,494+i*6],1.5,k.light);}
  // One interlocked grip. Both wrists terminate at this same attachment.
  g.save();g.translate(...p.grip);g.rotate(p.angle*.72);
  P([[-20,-14],[-12,-24],[4,-23],[14,-10],[12,19],[-3,25],[-20,11]],m.skin[2]);
  P([[-20,-14],[-12,-24],[-3,-23],[3,-9],[-2,15],[-17,12]],m.skin[1]);
  P([[-3,-20],[11,-23],[23,-13],[24,5],[17,23],[6,27],[-6,14],[-7,-3]],k.steel);
  P([[-3,-20],[11,-23],[23,-13],[17,-9],[6,-12],[-6,-3]],k.light);
  P([[20,-10],[24,5],[17,23],[6,27],[7,19],[16,12]],k.dark);
  for(let i=0;i<3;i++){L([8,-5+i*7],[18,-3+i*7],2,k.dark);L([8,-7+i*7],[18,-5+i*7],1.5,k.shine);}
  // Opponent's fingers curl around the outside of our palm; thumb crosses above.
  for(let i=0;i<3;i++){const y=-12+i*8;P([[-20,y],[-14,y-4],[-4,y-2],[1,y+3],[-3,y+6],[-15,y+5]],m.skin[1]);L([-16,y],[-6,y+1],2,m.skin[0]);}
  P([[-6,-22],[0,-27],[8,-24],[14,-13],[11,-5],[5,-8],[1,-15],[-6,-17]],k.steel);
  L([0,-23],[5,-20],3,k.light);L([6,-16],[10,-13],2,k.dark);g.restore();
 }
 function drawCutscene(){R(0,-PAD_TOP,480,800+PAD_TOT,'#30231c');const im=window.KREventVisuals?.peek('tavern-arm');if(im){g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,0,80,480,640);g.restore();return true;}R(0,80,480,640,'#75543a');return false;}
 function button(r,label,active=false){cut(r.x,r.y+4,r.w,r.h,'#493022');cut(r.x,r.y,r.w,r.h,active?'#b77b43':'#e1c18a');R(r.x+8,r.y+3,r.w-16,3,active?'#ecc482':'#ffdfab');T(label,r.x+r.w/2,r.y+r.h/2+5,15,'#4a2f20',r.w-15);}
 function draw(){const s=armWrestleGame;if(!s)return;g.save();try{
  drawCutscene();actor(true,'body',s);table();actor(true,'front',s);player(s);
  R(0,-PAD_TOP,480,81+PAD_TOP,'#2d231c');T('OAKBREAKER',240,29,23);T('STRONG ARMS. LOUD MOUTH.',240,49,10,'#cbb38b');button(MINIGAME_BACK_BTN,'< BACK');button({...PAUSE_BTN,y:PAUSE_BTN.y+uiTop},'II');
  const text=s.phase==='intro'?'“Careful. I charge extra for splinters.”':s.phase==='result'?(s.result.win?'“Fine. That one counts.”':'“Other arm next time?”'):s.cue==='windup'?'HE SETS HIS SHOULDER...':s.cue==='surge'?'HOLD YOUR GROUND.':s.cue==='recover'?'HIS GRIP SOFTENS — PUSH!':'He sizes you up.';
  cut(47,112,386,31,'#38271f');T(text,240,132,12,'#eed8ae');
  if(s.phase==='intro'){
   cut(32,531,416,115,'#35261f');T('OUTLAST THE BRAGGART',240,554,18);
   ['HOLD to push. RELEASE to catch your breath.','Watch his shoulder: a heavy surge is coming.','Push as he relaxes for a strong counter.','Constant pushing burns you out.'].forEach((t,i)=>T(t,240,579+i*17,10));button(ARM_WRESTLE_START_BTN,'LOCK HANDS');
  }else if(s.phase==='result'){
   cut(32,544,416,100,'#35261f');T(s.result.win?'YOU BROKE HIS STREAK.':'THE OAK STILL BELONGS TO HIM.',240,573,17);
   T(Math.round(s.result.time)+' SECONDS  /  '+s.result.counters+' COUNTERS',240,604,12);button(ARM_WRESTLE_REPLAY_BTN,'REMATCH');
  }else{
   cut(42,591,396,53,'#35261f');T('YOUR STAMINA',240,608,10);cut(75,618,330,14,'#574133');
   R(79,621,322*s.energy,8,s.energy<.22?'#d57f51':'#d8bd79');
   const label=s.phase==='ready'?(s.phaseT<.7?'ELBOWS DOWN...':'READY...'):s.phase==='pinning'?'DOWN!':s.held?'PUSHING — RELEASE TO REST':'HOLD TO PUSH';
   button(holdRect,label,s.held);T(s.counterT>0?'COUNTER!':s.energy<.22?'BREATHE. YOU ARE LOSING STRENGTH.':'Release during his surge. Catch his recovery.',240,754,11);
  }
 }finally{g.restore();}}
 window.KRTavernArm={assetId:'tavern-arm',drawCutscene,draw,actor,pose,materials,table,player,knightMaterials,holdRect};
})();
