/* Mossy Oak games: presentation only. All timers, hitboxes, gestures, wagers
   and outcomes belong to the original five minigames in KnightRush.html. */
(()=>{
 'use strict';
 const C={ink:'#493323',paper:'#e8d6ab',panel:'#ddc79b',gold:'#b58a48',light:'#fff0cd',dark:'#302820',blue:'#548d99',red:'#a4513c',green:'#406f52'};
 const P=(pts,c)=>{g.fillStyle=c;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();};
 const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
 const L=(x,y,X,Y,w,c)=>{g.strokeStyle=c;g.lineWidth=w;g.lineCap='butt';g.beginPath();g.moveTo(x,y);g.lineTo(X,Y);g.stroke();};
 const T=(s,x,y,size=12,c=C.ink,max=420)=>smithText(s,x,y,size,c,max);
 function bevel(x,y,w,h,c,cut=7){P([[x+cut,y],[x+w-cut,y],[x+w,y+cut],[x+w,y+h-cut],[x+w-cut,y+h],[x+cut,y+h],[x,y+h-cut],[x,y+cut]],c);}
 function button(r,label,on=true){bevel(r.x,r.y+5,r.w,r.h,'#201b16');bevel(r.x,r.y,r.w,r.h,on?C.paper:'#aa9a7a');L(r.x+9,r.y+4,r.x+r.w-9,r.y+4,2,C.light);L(r.x+8,r.y+r.h-3,r.x+r.w-8,r.y+r.h-3,2,C.gold);T(label,r.x+r.w/2,r.y+r.h/2+5,14,C.ink,r.w-18);}
 function panel(y,h,title,lines=[],tone=C.ink){bevel(28,y+5,424,h,'#211b16');bevel(28,y,424,h,C.panel);L(39,y+5,441,y+5,2,C.light);T(title,240,y+27,16,tone,396);lines.forEach((s,i)=>T(s,240,y+50+i*19,11,C.ink,394));}
 function header(title){R(0,-PAD_TOP,480,102+PAD_TOP,C.dark);T('THE MOSSY OAK  /  '+title,240,31,15,C.paper,442);button(MINIGAME_BACK_BTN,'< BACK');button({...PAUSE_BTN,y:PAUSE_BTN.y+uiTop},'II');L(122,77,358,77,1,'#866c43');}
 function drawCutscene(){
  R(0,-PAD_TOP,480,800+PAD_TOT,C.dark);const img=window.KREventVisuals?.peek('tavern-games');
  if(!img){T('Lighting the hearth...',240,210,14,C.paper);return false;}
  g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(img,0,90,480,640);g.restore();return true;
 }
 function table(top=342,bottom=742,narrow=false,felt=false){
  const a=narrow?111:30,b=480-a,l=narrow?18:-16,r=480-l;
  P([[a-9,top-9],[b+9,top-9],[r+8,bottom+9],[l-8,bottom+9]],'#543323');
  P([[a,top],[b,top],[r,bottom],[l,bottom]],'#b37a42');
  P([[l,bottom],[r,bottom],[r,bottom+25],[l,bottom+25]],'#6b442c');
  for(let i=1;i<6;i++)L(lerp(a,b,i/6),top,lerp(l,r,i/6),bottom,2,'#85542e');
  L(a,top,b,top,4,'#edbb6d');L(l,bottom,r,bottom,4,'#d5a05c');
  // A few grain strokes follow boards, never scatter noisy texture.
  L(a+33,top+19,a+40,top+71,2,'#cc9555');L(b-30,top+68,b-22,top+114,2,'#85542e');
  if(felt){P([[a+14,top+15],[b-14,top+15],[r-20,bottom-18],[l+20,bottom-18]],'#315b50');P([[a+21,top+21],[b-21,top+21],[r-28,bottom-26],[l+28,bottom-26]],'#477568');L(a+21,top+21,b-21,top+21,2,'#c8b876');}
 }
 function segment(x,y,X,Y,w,base,lit,shade){
  const len=Math.hypot(X-x,Y-y)||1,nx=-(Y-y)/len*w*.5,ny=(X-x)/len*w*.5;
  P([[x+nx,y+ny],[X+nx,Y+ny],[X-nx,Y-ny],[x-nx,y-ny]],base);
  P([[x+nx,y+ny],[X+nx,Y+ny],[X+nx*.35,Y+ny*.35],[x+nx*.35,y+ny*.35]],lit);
  P([[x-nx*.7,y-ny*.7],[X-nx*.7,Y-ny*.7],[X-nx,Y-ny],[x-nx,y-ny]],shade);
 }
 function hand(x,y,s=1,steel=false){g.save();g.translate(x,y);g.scale(s,s);
  P([[-13,-8],[-4,-13],[10,-11],[15,-3],[12,11],[-6,13],[-15,4]],steel?'#687d83':'#ac704b');
  P([[-13,-8],[-4,-13],[9,-11],[10,1],[-5,4],[-12,0]],steel?'#c4ccbd':'#f0bd7e');
  P([[-5,4],[10,1],[12,11],[-6,13]],steel?'#92a7a7':'#d6975f');
  for(let i=0;i<3;i++)L(-4+i*5,4,-3+i*5,10,1.4,steel?'#526771':'#996243');g.restore();}
 const clothes={barry:['#a35e35','#df9e56','#663c30'],duke:['#386576','#78a3a3','#303e53'],baron:['#943f44','#cf7861','#552e35'],dealer:['#724363','#bc7583','#403149'],chugs:['#658347','#adc173','#394b37']};
 function actor(x,y,s,kind='barry',lit=true,arms=true){
  const skin=lit?['#f3c88a','#d99d65','#a17055']:['#dfb08a','#bd8c64','#91684f'],cloth=clothes[kind]||clothes.barry;
  const hi=lit?cloth[1]:cloth[0],base=cloth[0],dark=cloth[2],bob=Math.sin(perfNow*1.8)*.65;
  g.save();g.translate(x,y+bob);g.scale(s*(kind==='baron'?1.18:kind==='dealer'?.93:1),s);
  // A supported chair back, squared shoulders and a real neck, not a round mascot.
  bevel(-65,-94,130,117,'#62432f');L(-58,-89,58,-89,5,'#c49555');
  P([[-35,-92],[-65,-79],[-78,-44],[-64,6],[61,6],[77,-44],[62,-78],[30,-92]],dark);
  P([[-35,-92],[-59,-79],[-47,-47],[-46,5],[37,5],[46,-48],[57,-80],[30,-92]],base);
  P([[-35,-92],[-59,-79],[-47,-47],[-33,-57],[-26,-81]],hi);
  P([[-15,-113],[15,-113],[18,-85],[0,-73],[-19,-87]],skin[1]);
  P([[-32,-91],[-15,-94],[0,-77],[-15,-56],[-32,-74]],'#ebd9ab');P([[15,-94],[30,-90],[33,-72],[16,-59],[0,-77]],'#c3c6a5');
  L(0,-68,0,-5,3,'#d8b36a');for(let j=0;j<3;j++)R(6,-57+j*20,5,5,'#e8bd61');
  // Tailoring, not surface noise: pocket, waistcoat edging and a watch chain.
  if(kind==='duke'){P([[18,-42],[37,-42],[34,-27],[19,-27]],dark);L(19,-40,35,-40,2,'#b6c2a7');L(9,-34,22,-21,1.5,'#dbb467');L(22,-21,32,-29,1.5,'#dbb467');}
  if(kind==='dealer'){P([[-43,-17],[42,-17],[43,-3],[-45,-3]],'#b27a4e');P([[-15,-17],[-7,-3],[-26,6],[-35,-8]],'#d0a665');}
  if(kind==='baron'){L(-36,-78,-43,-26,4,'#c69354');L(33,-78,40,-26,4,'#c69354');P([[-25,-35],[-10,-40],[0,-30],[-10,-18]],'#cba559');}
  if(kind==='barry'){P([[-31,-72],[-22,-76],[-24,-2],[-35,-2]],'#75492c');P([[19,-75],[27,-73],[35,-2],[24,-2]],'#75492c');R(-29,-48,7,8,'#d8b374');R(23,-48,7,8,'#d8b374');}
  P([[-27,-152],[-17,-170],[12,-172],[28,-158],[30,-130],[19,-109],[4,-103],[-17,-111],[-28,-129]],skin[2]);
  P([[-26,-151],[-16,-167],[9,-166],[16,-148],[13,-122],[5,-108],[-13,-112],[-24,-130]],skin[1]);
  P([[-26,-151],[-16,-167],[-3,-166],[-4,-143],[-13,-137],[-25,-137]],skin[0]);
  R(-31,-143,6,14,skin[1]);R(28,-142,5,12,skin[2]);
  // Different occupations/hair silhouettes; small eyes share approved NPC scale.
  const hair=kind==='chugs'?'#a28b62':kind==='baron'?'#523728':'#513729';
  if(kind==='baron'){
   P([[-29,-145],[-31,-159],[-21,-171],[-10,-175],[-10,-163],[-24,-151]],hair);
   P([[12,-169],[26,-159],[31,-145],[28,-126],[23,-127],[22,-151]],hair);
   P([[-19,-171],[-22,-192],[-9,-183],[0,-200],[9,-182],[23,-191],[20,-170]],'#c79443');L(-17,-173,18,-173,4,'#f4d57e');
  }else{
   P([[-30,-144],[-33,-163],[-21,-178],[1,-181],[23,-172],[32,-157],[28,-136],[22,-136],[20,-156],[7,-165],[-11,-160],[-24,-151],[-23,-137]],hair);
   P([[-32,-163],[-21,-178],[1,-181],[16,-176],[0,-171],[-17,-169]],lit?'#ae7c47':'#886647');
  }
  if(kind==='dealer'){P([[-34,-167],[-25,-192],[8,-196],[35,-179],[22,-166]],'#883e58');P([[-34,-167],[24,-168],[30,-156],[-33,-156]],'#c89859');P([[13,-184],[26,-182],[23,-164],[10,-165]],'#f1dfad');R(15,-177,5,6,'#9b4c47');}
  if(kind==='duke'){P([[-34,-167],[-25,-192],[19,-191],[31,-170]],'#2e515b');P([[-39,-168],[38,-168],[32,-158],[-35,-157]],'#ccaa66');R(12,-180,9,8,'#dab764');}
  L(-19,-146,-7,kind==='dealer'?-146:-143,3,hair);L(7,kind==='duke'?-148:-143,20,-146,3,hair);
  const blink=Math.sin(perfNow*.81)>.995;R(-17,-139,5,blink?1:3.5,'#30382e');R(10,-139,5,blink?1:3.5,'#30382e');
  P([[-3,-145],[3,-145],[8,-131],[2,-126],[-6,-129]],skin[1]);P([[-3,-145],[0,-145],[0,-132],[-6,-129]],skin[0]);P([[3,-141],[8,-131],[2,-126],[0,-130]],skin[2]);
  P([[-2,-129],[-10,-132],[-23,-124],[-19,-117],[-5,-121],[0,-126]],hair);P([[1,-127],[8,-130],[22,-123],[18,-117],[5,-120]],hair);
  L(-8,-115,8,-115,2,'#83543b');P([[-12,-111],[5,-109],[13,-112],[7,-106],[-7,-107]],skin[0]);
  if(kind==='chugs'){P([[-24,-123],[-16,-112],[-7,-116],[6,-115],[19,-124],[20,-103],[8,-88],[-8,-91],[-23,-108]],hair);P([[-23,-120],[-15,-112],[-6,-114],[-4,-97],[-13,-101]],'#cab27e');}
  if(arms)for(const side of [-1,1]){segment(side*55,-76,side*79,-37,25,base,hi,dark);segment(side*79,-37,side*57,-7,18,skin[1],skin[0],skin[2]);hand(side*57,-6,.76);}
  g.restore();
 }
 function tankard(x,y,s=1,amount=1,angle=0,accent=C.blue){
  g.save();g.translate(x,y);g.rotate(angle);g.scale(s,s);
  P([[-22,6],[-12,14],[29,12],[36,5],[20,-2]],'#583a2d');
  // Open angular handle behind staves; the empty hole is not painted solid.
  const handle=[[18,-29],[34,-29],[39,-22],[37,-4],[29,4],[17,3]];
  g.strokeStyle='#d5b76d';g.lineWidth=6;g.beginPath();handle.forEach(([a,b],i)=>i?g.lineTo(a,b):g.moveTo(a,b));g.stroke();
  P([[-22,-39],[-16,-47],[15,-47],[23,-38],[20,4],[12,10],[-15,7],[-21,0]],'#76502f');
  P([[-21,-36],[-10,-32],[-10,6],[-20,0]],'#d19b55');P([[-10,-32],[11,-32],[12,8],[-10,6]],'#aa713a');
  P([[11,-32],[23,-38],[20,4],[12,8]],'#654431');
  P([[-22,-39],[-16,-47],[15,-47],[23,-38],[13,-31],[-12,-31]],'#ded2a2');
  P([[-16,-39],[-11,-43],[12,-43],[17,-38],[10,-35],[-10,-35]],amount>.06?'#a96024':'#4b3529');
  if(amount>.06)P([[-15,-41],[-6,-44],[2,-41],[11,-43],[16,-38],[6,-37],[-2,-39],[-10,-37]],'#f7e6b2');
  P([[-21,-22],[-10,-18],[12,-18],[22,-24],[21,-17],[12,-12],[-10,-12],[-21,-16]],accent);
  P([[-20,-2],[-10,2],[12,3],[20,-2],[20,4],[12,10],[-15,7],[-20,2]],'#b3b4a0');
  L(-10,-30,-10,-23,1,'#ecd09a');g.restore();
 }
 function die(x,y,n,size=46,angle=0){g.save();g.translate(x,y);g.rotate(angle);const h=size/2;
  bevel(-h+4,-h+6,size,size,'#704b31',5);bevel(-h,-h,size,size,'#f4e4b9',5);P([[-h+5,-h],[h-5,-h],[h,-h+5],[-h+5,-h+5]],'#fff3d1');P([[h-5,-h+5],[h,-h+5],[h,h-5],[h-5,h]],'#b7a886');
  for(const [u,v]of DIE_PIPS[n])bevel((u-.5)*size-2.6,(v-.5)*size-2.6,5.2,5.2,'#51392d',1);g.restore();}
 function cup(x,y,lift=0,accent=C.red){
  P([[x-40,y+13],[x-24,y+22],[x+37,y+19],[x+46,y+9],[x+20,y]],'#694932');
  g.save();g.translate(x,y-lift*87);P([[-39,11],[-28,-54],[-20,-62],[20,-62],[30,-53],[40,11],[29,22],[-28,22]],'#6c3e2e');
  P([[-28,-54],[-20,-62],[4,-62],[3,14],[-27,17],[-39,11]],'#b47848');P([[4,-62],[20,-62],[30,-53],[40,11],[29,22],[3,14]],'#895032');
  P([[-39,8],[-26,16],[27,16],[39,8],[40,16],[29,24],[-28,24],[-40,16]],accent);
  L(-22,-47,-30,9,2,'#e4b876');L(-18,-52,18,-52,3,'#d5b374');g.restore();
 }
 function dice(){const d=diceGame,reveal=['revealing','result'].includes(d.phase);actor(240,351,1.03,'duke');table(350,729,false,true);
  T('DUKE',92,399,11,'#f0d09b');T('YOU',90,530,11,'#cfdfcf');
  for(const [i,x,y]of [[0,174,429],[1,302,429],[2,174,553],[3,302,553]]){
   const hidden=i%2===1&&(!reveal||d.cupLift<1),rolling=d.phase==='rolling',j=rolling?Math.sin(perfNow*19+i)*7:0;
   die(x+j,y,i<2?d.rivalDice[i]:d.playerDice[i-2],46,rolling?Math.sin(perfNow*15+i)*.25:0);
   if(hidden)cup(x+j,y,reveal?d.cupLift:0,i<2?C.red:C.blue);
  }
  if(d.phase==='intro'){panel(566,80,"DUKE'S HALF-TRUTH",['One die each is hidden under a leather cup.','Will YOUR two dice total HIGHER or LOWER?']);button(DICE_REPLAY_BTN,'ROLL THE DICE');}
  else if(d.phase==='choose'){button(DICE_LOWER_BTN,'LOWER',d.cursor===0);button(DICE_HIGHER_BTN,'HIGHER',d.cursor===1);T('YOUR TOTAL compared with the Duke',240,632,12,C.light);}
  else if(d.phase==='rolling')panel(652,54,'THE BONES ARE ROLLING');
  else if(d.phase==='revealing')panel(652,54,'YOU CALLED '+d.choice.toUpperCase());
  else if(d.phase==='result'){const r=d.result;panel(568,78,r.correct===null?'A DRAW':r.correct?'A CLEVER CALL':'THE DUKE TAKES THIS ONE',['YOU '+r.playerTotal+'   /   DUKE '+r.rivalTotal],r.correct===false?C.red:C.green);button(DICE_REPLAY_BTN,'ROLL AGAIN');}
 }
 function card(cx,cy,w,h,c,face,sx=1,lift=0,chosen=false){g.save();g.translate(cx,cy-lift);g.scale(Math.max(.035,sx),1);
  bevel(-w/2+5,-h/2+7,w,h,'#203d35');bevel(-w/2,-h/2,w,h,'#f0dfb6',5);bevel(-w/2+7,-h/2+7,w-14,h-14,face?'#e1cea3':'#833f4b',3);
  if(!face){P([[0,-h*.32],[w*.30,0],[0,h*.32],[-w*.30,0]],'#b48853');P([[0,-h*.25],[w*.22,0],[0,h*.25],[-w*.22,0]],'#344d4a');drawFindQueenCrown(0,0,13,'#e8c87d');}
  else{const queen=c.role==='QUEEN',ink=c.red?'#963e43':'#354957';T(c.rank,-w*.34,-h*.30,17,ink,22);T(c.rank,w*.34,h*.39,17,ink,22);
   P([[-23,43],[-17,10],[0,0],[18,12],[25,43]],queen?'#a54f5c':'#477385');P([[-16,-22],[-8,-30],[10,-29],[19,-18],[15,5],[2,13],[-12,5]],'#a7764f');P([[-14,-22],[-6,-27],[7,-25],[7,3],[0,8],[-11,2]],'#e7bd80');
   P([[-19,-20],[-18,-33],[-4,-40],[16,-33],[21,-17],[15,-13],[10,-27],[-8,-28],[-12,-12]],queen?'#8c5931':'#555045');drawFindQueenCrown(0,-33,15,'#d7ac51');R(-10,-12,4,3,'#374036');R(7,-12,4,3,'#374036');
   if(!queen)P([[-12,1],[0,6],[13,0],[9,16],[0,23],[-10,14]],'#555045');L(-3,-2,1,1,2,'#b58757');L(-12,30,13,30,3,'#ddb873');
  }
  if(chosen){L(-w/2,-h/2-5,w/2,-h/2-5,3,'#f3d887');P([[-6,h/2+12],[0,h/2+5],[6,h/2+12],[0,h/2+17]],'#e7c478');}g.restore();}
 function queen(){const q=findQueenGame;actor(240,352,1,'dealer');table(352,728,false,true);
  const ordered=q.cards.slice().sort((a,b)=>findQueenCardPosition(a).y-findQueenCardPosition(b).y);
  for(const c of ordered){const p=findQueenCardPosition(c);let face=['intro','memorize','result'].includes(q.phase),sx=1,lift=0;
   if(q.phase==='flip'){const k=clamp(q.phaseT/FIND_QUEEN_RULES.flipTime,0,1);sx=Math.abs(Math.cos(k*Math.PI));face=k<.5;}
   if(q.phase==='result'){const k=clamp((q.phaseT-c.slot*.07)/.28,0,1);sx=Math.abs(Math.cos(k*Math.PI));face=k>=.5;lift=c.slot===q.selectedSlot?10:0;}
   card(p.x,p.y,110,156,c,face,sx,lift,(q.phase==='choose'&&c.slot===q.cursorSlot)||(q.phase==='result'&&c.role==='QUEEN'));
  }
  if(q.phase==='intro'){panel(557,86,'A QUEEN AMONG KINGS',['Remember her face. Follow the moving cards.','Pick the Queen when the dealer stops.']);button(FIND_QUEEN_START_BTN,'SHOW ME THE QUEEN');}
  else if(q.phase==='result'){panel(557,86,q.won?'YOU FOUND HER':'THE QUEEN SLIPPED AWAY',[q.won?'The dealer quietly straightens his collar.':'The gold marker reveals her hiding place.'],q.won?C.green:C.red);button(FIND_QUEEN_REPLAY_BTN,'SHUFFLE AGAIN');}
  else panel(566,72,q.phase==='choose'?'WHICH CARD?':q.phase==='memorize'?'REMEMBER THE QUEEN':'FOLLOW THE SHUFFLE',[q.phase==='choose'?'Tap a card  /  arrows + Enter':q.message]);
 }
 function elbowFor(a,b,upper,lower,side=1){const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),u=(upper*upper-lower*lower+d*d)/(2*d),v=Math.sqrt(Math.max(0,upper*upper-u*u));return{x:a.x+dx/d*u-dy/d*v*side,y:a.y+dy/d*u+dx/d*v*side};}
 function arm(){const a=armWrestleGame,k=clamp(a.power,0,1),angle=(k-.5)*2.5,handPt={x:240+Math.sin(angle)*106,y:450-Math.cos(angle)*106};
  actor(240,363,1.13,'baron',true,false);table(350,732);bevel(204,440,72,29,'#713e3c');bevel(212,440,55,16,'#aa6853');
  // Rival shoulder -> fixed elbow -> rotating fixed-length forearm. The hand
  // belongs to that chain all the way to either pin, rather than stretching.
  segment(167,278,240,450,41,'#d49a60','#f1c98b','#9e6c4f');
  segment(240,450,handPt.x,handPt.y,32,'#d49a60','#f1c98b','#9e6c4f');
  segment(313,278,352,350,36,'#943f44','#cd7660','#59323a');segment(352,350,363,411,24,'#d49a60','#f1c98b','#9e6c4f');hand(363,411,.9);
  const skin=playerChar?.caveman,base=skin?'#d49a60':'#8ca4a6',hi=skin?'#f1c98b':'#e0dfc0',dark=skin?'#9e6c4f':'#526974';
  const shoulder={x:330,y:660},wrist={x:handPt.x+9,y:handPt.y+6},elbow=elbowFor(shoulder,wrist,166,185);
  segment(shoulder.x,shoulder.y,elbow.x,elbow.y,53,base,hi,dark);segment(elbow.x,elbow.y,wrist.x,wrist.y,44,base,hi,dark);
  if(!skin)for(const t of [.28,.54,.79]){const x=lerp(elbow.x,wrist.x,t),y=lerp(elbow.y,wrist.y,t);L(x-18,y+6,x+18,y-6,4,'#597580');L(x-18,y+3,x+18,y-9,2,'#d9d9b9');}
  hand(handPt.x-6,handPt.y-.5,1.15);hand(handPt.x+10,handPt.y+5,1.12,!skin);
  bevel(68,112,344,35,'#413529');R(79,126,322,7,'#974c43');R(240,126,161,7,'#598995');bevel(77+322*k,119,7,21,'#f3d480',2);
  T('BARON',104,167,10,'#f0d39e');T('YOU',383,167,10,'#dae6d6');
  if(a.phase==='intro'){panel(554,94,'THE ROYAL ELBOW DISPUTE',['Swipe RIGHT repeatedly to pin the Baron.','Hesitation loses ground. Left swipes help him.']);button(ARM_WRESTLE_START_BTN,'LOCK HANDS');}
  else if(a.phase==='result'){panel(554,94,a.result.win?'A CLEAN PIN':'BEEFWRIST HOLDS HIS TITLE',['RIGHT SWIPES: '+a.result.swipes],a.result.win?C.green:C.red);button(ARM_WRESTLE_REPLAY_BTN,'REMATCH');}
  else panel(650,54,a.wrongT>0?'WRONG WAY — SWIPE RIGHT':a.phase==='pinning'?'KNUCKLES TO OAK':'SWIPE RIGHT  >  >  >',[],a.wrongT>0?C.red:C.ink);
 }
 function slide(){const t=tavernSlideGame;actor(240,272,.74,'barry');table(TAVERN_SLIDE_RULES.tableTop,TAVERN_SLIDE_RULES.tableBottom,true);
  for(let i=TAVERN_SLIDE_RULES.rings.length-1;i>=0;i--){g.strokeStyle=[C.paper,'#dbc17c','#8b4939'][i];g.lineWidth=3;g.beginPath();g.ellipse(TAVERN_SLIDE_RULES.targetX,TAVERN_SLIDE_RULES.targetY,TAVERN_SLIDE_RULES.rings[i],TAVERN_SLIDE_RULES.rings[i]/1.48,0,0,TAU);g.stroke();}
  for(const [i,dx]of [[0,0],[1,63],[2,105]])T(String(3-i),TAVERN_SLIDE_RULES.targetX+dx,TAVERN_SLIDE_RULES.targetY+4,11,'#efe0b6');
  for(const m of t.mugs.slice().sort((a,b)=>a.y-b.y)){g.save();g.globalAlpha=m.alpha;tankard(m.x,m.y,tavernMugScale(m.y)*.8,1,m.onTable?0:m.angle,m.owner==='player'?C.blue:C.red);g.restore();}
  const owner=tavernCurrentOwner(t);if(t.phase==='playing'&&!t.shotActive){const p=tavernLaunchPoint(owner);tankard(p.x,p.y,tavernMugScale(p.y)*.8,1,0,owner==='player'?C.blue:C.red);}
  if(t.gesture){const a=t.gesture.start,b=t.gesture.current,len=Math.hypot(b.x-a.x,b.y-a.y),valid=b.y>a.y;
   g.save();g.beginPath();const top=tavernTableBounds(TAVERN_SLIDE_RULES.tableTop),bottom=tavernTableBounds(TAVERN_SLIDE_RULES.tableBottom);g.moveTo(top.left,TAVERN_SLIDE_RULES.tableTop);g.lineTo(top.right,TAVERN_SLIDE_RULES.tableTop);g.lineTo(bottom.right,TAVERN_SLIDE_RULES.tableBottom);g.lineTo(bottom.left,TAVERN_SLIDE_RULES.tableBottom);g.closePath();g.clip();
   L(a.x,a.y,a.x+(a.x-b.x)*2,a.y+(a.y-b.y)*2,3,valid?'#e9d5a1':C.red);g.restore();T(valid?'PULL '+Math.round(clamp(len/130,0,1)*100)+'%':'PULL TOWARD YOU',240,705,12,C.paper);
  }
  const score=tavernScores();bevel(104,110,272,31,'#403629');T('YOU '+score.player+'    /    BARRY '+score.ai,240,131,12,C.paper);
  if(t.phase==='intro'){panel(516,132,'THREE MUGS. ONE BULLSEYE.',['Pull your mug toward you; release to slide.','Inner rings score 3 / 2 / 1.','Knock his mugs away. Keep yours on the oak.','A coin decides who slides first.']);button(TAVERN_SLIDE_START_BTN,'TOSS THE COIN');}
  else if(t.phase==='coinToss'){const k=clamp(t.phaseT/TAVERN_SLIDE_RULES.coinTossTime,0,1);g.save();g.translate(240,422-Math.sin(k*Math.PI)*85);g.scale(Math.max(.1,Math.abs(Math.cos(k*Math.PI*5))),1);bevel(-32,-34,64,68,'#ac7937',15);bevel(-27,-30,54,59,'#f1cb72',12);drawFindQueenCrown(0,0,16,'#ac7937');g.restore();panel(565,73,k>.8?(t.first==='player'?'YOU SLIDE FIRST':'BARRY SLIDES FIRST'):'CROWN OR BARREL?');}
  else if(t.phase==='result'){panel(526,119,t.result.winner==='tie'?'AN HONOURABLE DRAW':t.result.winner==='player'?'YOU OWN THE TABLE':'BARRY TAKES THE TABLE',['YOU '+t.result.player+'   /   BARRY '+t.result.ai,'Three mugs each. Every ring counts.']);button(TAVERN_SLIDE_START_BTN,'REMATCH');}
  else if(t.phase==='resolving')panel(726,51,'LAST CALL — COUNTING');
  else {bevel(26,727,428,46,C.panel);T(t.feedback,240,747,11,C.ink,408);const left=3-t.mugs.filter(m=>m.owner==='player').length;T('MUGS LEFT '+left+'  /  '+(owner==='player'?'YOUR TURN':'BARRY'),240,764,10,C.ink);}
 }
 function knightBust(x,y){
  const skin=playerChar?.caveman;if(skin){actor(x,y,.64,'barry',true,false);return;}
  g.save();g.translate(x,y);
  P([[-24,-62],[-43,-49],[-36,-3],[32,-3],[42,-49],[24,-62]],'#516b76');
  P([[-24,-62],[-37,-48],[-26,-25],[-23,-3],[22,-3],[28,-30],[31,-52],[20,-62]],'#95a9a5');
  P([[-24,-62],[-37,-48],[-26,-25],[-17,-34],[-15,-56]],'#e0dfbb');
  P([[-28,-52],[25,-52],[25,-29],[0,-18],[-26,-29]],'#68828b');L(-20,-47,16,-47,3,'#b9c6b7');
  g.save();g.translate(0,-83);drawSquireHelmet25D(0,0,.1,2.4,'#a4b3af','#516c77','#e5e2bf','#f0e7c9','#75848a');
  const plume=playerChar?.feather||'#5185e9';P([[-3,-28],[-1,-45],[12,-57],[22,-49],[16,-43],[11,-46],[4,-34],[3,-26]],plume);g.restore();
  R(-8,-3,17,5,'#c3a157');g.restore();
 }
 function drink(){const d=drinkGame;knightBust(107,249);actor(375,249,.66,'chugs',true,false);table(247,729);
  // Each supported mug follows a real shoulder/elbow/wrist chain. Its handle
  // is behind the curled fingers; neither hand floats detached from the actor.
  for(const [x,playerSide]of [[107,true],[375,false]]){
   const metal=playerSide&&!playerChar?.caveman,base=metal?'#91a6a4':'#d49a60',hi=metal?'#e0dfbf':'#f1c98b',dark=metal?'#536d76':'#9e6c4f';
   const progress=playerSide?(d.pattern?clamp((d.nextIndex-1)/(d.pattern.points.length-1),0,1):0):d.rivalProgress,lift=progress*25,
    shoulder={x:x+35,y:198},wrist={x:x+57,y:219-lift},elbow=elbowFor(shoulder,wrist,34,26);
   segment(shoulder.x,shoulder.y,elbow.x,elbow.y,17,base,hi,dark);segment(elbow.x,elbow.y,wrist.x,wrist.y,14,base,hi,dark);
   tankard(x+38,230-lift,.65,1-progress,0,playerSide?C.blue:C.red);
   hand(wrist.x,wrist.y,.47,metal);
   segment(x-34,198,x-43,232,17,base,hi,dark);hand(x-41,238,.45,metal);
  }
  T('YOU '+d.wins,95,118,11,C.light);T('SIR CHUGS '+d.rivalWins,365,118,11,C.light);
  if(d.pattern&&!['intro','complete'].includes(d.phase)){
   const pts=d.pattern.points;bevel(47,214,386,306,'#372e24');bevel(52,219,376,296,'#596b50');L(62,224,418,224,2,'#bdb58a');
   g.lineJoin='bevel';g.strokeStyle='#455640';g.lineWidth=DRINK_RULES.corridors[d.round]*2;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();
   g.strokeStyle='#c3c6a0';g.lineWidth=3;g.stroke();
   if(d.tracePoints.length>1){g.strokeStyle='#eed397';g.lineWidth=5;g.beginPath();d.tracePoints.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();}
   pts.forEach((p,i)=>{bevel(p.x-12,p.y-12,24,24,i<d.nextIndex?'#d5bc7a':i===d.nextIndex?'#f4dfaa':'#354b3d',5);T(i===0?'GO':String(i),p.x,p.y+4,10,i<=d.nextIndex?'#493323':'#e4d6ae',23);});
   T(d.pattern.name,240,238,10,'#e5d6a6');
   bevel(77,531,326,9,'#493c2a',2);R(80,533,320*d.rivalProgress,5,'#c17b50');
  }
  if(d.phase==='intro'){tankard(239,454,2.5,1,0,C.gold);panel(552,94,'THE STEADY-HAND CHALLENGE',['Hold GO and trace every numbered checkpoint.','Stay on the route; lifting early spills your ale.','First to win two mugs takes the contest.']);button(DRINK_START_BTN,'RAISE THE MUGS');}
  else if(d.phase==='complete'){panel(552,94,d.wins>d.rivalWins?'TAVERN CHAMPION':'SIR CHUGS FINISHES FIRST',['YOU '+d.wins+'   /   SIR CHUGS '+d.rivalWins,'SPILLS: '+d.spills]);button(DRINK_REPLAY_BTN,'ANOTHER ROUND');}
  else if(d.phase==='roundResult'){panel(558,82,d.roundWon?'A CLEAN FINISH':'OUT-CHUGGED THIS ROUND',['YOU '+d.wins+'   /   SIR CHUGS '+d.rivalWins,'Tap to continue.'],d.roundWon?C.green:C.red);}
  else panel(554,94,d.spillT>0?'STEADY — ALE SPILLED':d.phase==='preview'?'READ THE ROUTE':'KEEP YOUR HAND STEADY',['MUG '+(d.round+1)+'/3   /   SPILLS '+d.spills,d.phase==='preview'?'Begins in '+Math.max(0,DRINK_RULES.preview-d.phaseT).toFixed(1)+' s':'Hold GO, then trace the numbered route.'],d.spillT>0?C.red:C.ink);
 }
 const drawers={dice,queen,arm,slide,drink},names={dice:"LIAR'S DICE",queen:'FIND THE QUEEN',arm:'ARM WRESTLING',slide:'TANKARD SLIDE',drink:'DRINKING CONTEST'};
 function draw(id){g.save();try{drawCutscene();drawers[id]();header(names[id]);}finally{g.restore();}}
 window.KRTavernGames={assetId:'tavern-games',drawCutscene,draw,actor,tankard,die,cup,card,elbowFor};
})();
