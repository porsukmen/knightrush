/* Duke's Bluff: generated room, native articulated actor and interactive table. */
(()=>{'use strict';
 const P=(pts,c)=>{g.fillStyle=c;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();};
 const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
 const L=(x,y,X,Y,w,c)=>{g.strokeStyle=c;g.lineWidth=w;g.lineCap='butt';g.beginPath();g.moveTo(x,y);g.lineTo(X,Y);g.stroke();};
 const T=(s,x,y,size=12,c='#f2dab0',max=440)=>smithText(s,x,y,size,c,max);
 const cut=(x,y,w,h,c)=>P([[x+6,y],[x+w-6,y],[x+w,y+6],[x+w,y+h-6],[x+w-6,y+h],[x+6,y+h],[x,y+h-6],[x,y+6]],c);
 const rects={count:Array.from({length:6},(_,i)=>({x:33+i*70,y:573,w:64,h:44})),face:Array.from({length:6},(_,i)=>({x:33+i*70,y:631,w:64,h:44})),raise:{x:32,y:690,w:200,h:49},call:{x:248,y:690,w:200,h:49}};
 const materials={
  neutral:{skin:['#e1bc8d','#c99e72','#986c53'],coat:['#467f80','#265760','#193f4b'],linen:['#e6d6ad','#bcaa86','#807c68'],hair:['#87725b','#534738','#343331'],gold:['#efd18b','#cfa960','#947345']},
  scene:{skin:['#f8cc96','#dfa476','#9b7765'],coat:['#659b91','#386e70','#284e60'],linen:['#ffe3ae','#d6c29a','#889694'],hair:['#b2986d','#6c5741','#3b4547'],gold:['#ffe7a4','#d7af63','#838876']}
 };
 function pose(t=perfNow,s=diceGame){
  const breath=Math.sin(t*1.5)*.4,reveal=s?.phase==='revealing'?Math.min(1,s.phaseT/.9):s?.phase==='result'?1:0;
  const lift=reveal*reveal*(3-2*reveal)*61,shake=s?.phase==='rolling'?Math.sin(s.phaseT*27)*5:0;
  const cup={x:240+shake+reveal*9,y:380-lift};
  const solve=(side,wrist)=>{const shoulder=[side*36,-87+breath],upper=55,lower=57,dx=wrist[0]-shoulder[0],dy=wrist[1]-shoulder[1],d=Math.hypot(dx,dy),a=(upper*upper-lower*lower+d*d)/(2*d),h=Math.sqrt(Math.max(0,upper*upper-a*a));return{shoulder,elbow:[shoulder[0]+dx*a/d+side*dy*h/d,shoulder[1]+dy*a/d-side*dx*h/d],wrist,upper,lower};};
  return{breath,cup,left:solve(-1,[-66,-6]),right:solve(1,[cup.x-240+26,cup.y-315-45]),headAngle:(s?.tell===1?.018:-.008)+Math.sin(t*.65)*.005};
 }
 function actor(lit=true,pass='all',s=diceGame){
  const m=lit?materials.scene:materials.neutral,p=pose(perfNow,s);
  const seg=(a,b,w,c,dx=0)=>expSegment(a[0]+dx,a[1],b[0]+dx,b[1],w,c);
  const forearm=a=>{seg(a.elbow,a.wrist,19,m.coat[2]);seg(a.elbow,a.wrist,14,m.coat[1],-2);seg(a.elbow,a.wrist,4,m.coat[0],-7);
   const [x,y]=a.wrist;cut(x-12,y-11,23,12,m.linen[1]);R(x-11,y-11,20,3,m.linen[0]);
   P([[x-10,y-1],[x+8,y-1],[x+12,y+4],[x+9,y+10],[x-8,y+10],[x-12,y+5]],m.skin[1]);R(x-9,y,16,3,m.skin[0]);R(x+6,y+3,4,6,m.skin[2]);
   for(let i=0;i<3;i++)R(x-6+i*5,y+6,1,3,m.skin[2]);if(a===p.right){R(x,y+3,5,5,m.gold[1]);R(x+1,y+3,3,2,'#9fd0c7');}};
  g.save();try{g.translate(240,315);
   if(pass==='front'){forearm(p.left);forearm(p.right);return;}
   g.save();g.translate(0,p.breath);
   // Tailored upright torso: approved civilian construction, not the old generic Duke.
   P([[-32,-99],[-15,-107],[15,-107],[34,-98],[42,-59],[35,24],[-35,24],[-42,-59]],m.coat[1]);
   P([[-32,-99],[-15,-107],[-6,-101],[-8,22],[-35,24],[-42,-59]],m.coat[0]);
   P([[19,-104],[34,-98],[42,-59],[35,24],[22,24],[28,-56]],m.coat[2]);
   P([[-13,-112],[12,-112],[13,-90],[0,-79],[-12,-92]],m.skin[2]);
   P([[-12,-112],[1,-112],[1,-91],[-12,-92]],m.skin[1]);
   P([[-16,-107],[-10,-108],[0,-94],[-6,-77],[-21,-94]],m.linen[0]);
   P([[10,-108],[18,-105],[22,-93],[6,-79],[0,-94]],m.linen[1]);
   L(-26,-96,-23,10,2,m.gold[1]);L(26,-95,23,10,2,m.gold[2]);
   for(const y of [-67,-49,-31,-13]){R(-1,y,5,5,m.gold[1]);R(-1,y,2,2,m.gold[0]);}
   L(-23,-89,-11,-65,2,m.gold[1]);L(-11,-65,12,-66,2,m.gold[0]);L(12,-66,24,-87,2,m.gold[1]);
   cut(-5,-70,12,12,m.gold[1]);R(-2,-68,5,5,'#873e49');
   g.save();g.translate(0,-111);g.rotate(p.headAngle);g.translate(0,111);
   // A narrower angular head, readable chin and restrained expression.
   P([[-23,-177],[17,-179],[25,-163],[22,-129],[11,-115],[-10,-115],[-23,-128],[-26,-159]],m.skin[1]);
   P([[-23,-177],[-1,-178],[-2,-126],[-10,-118],[-23,-129],[-26,-159]],m.skin[0]);
   P([[16,-177],[25,-163],[22,-129],[11,-115],[2,-121],[13,-131]],m.skin[2]);
   R(-28,-154,6,15,m.skin[1]);R(-28,-152,2,10,m.skin[0]);R(22,-152,5,14,m.skin[2]);
   P([[-26,-153],[-29,-176],[-17,-190],[9,-192],[24,-184],[29,-167],[24,-151],[20,-152],[18,-170],[1,-176],[-18,-170],[-21,-150]],m.hair[1]);
   P([[-29,-176],[-17,-190],[9,-192],[24,-184],[6,-183],[-14,-180],[-23,-170]],m.hair[0]);
   P([[24,-184],[29,-167],[24,-151],[20,-152],[18,-170]],m.hair[2]);
   R(-25,-164,5,21,'#c0bba1');R(21,-163,4,20,'#8d9a91');
   P([[-18,-160],[-7,-157],[-6,-154],[-18,-157]],m.hair[1]);P([[7,-157],[18,-159],[18,-156],[7,-154]],m.hair[2]);
   const blink=Math.sin(perfNow*.71)>.996;R(-16,-151,6,blink?1:3,'#303a35');R(9,-151,5,blink?1:3,'#303a35');
   P([[-1,-155],[4,-155],[8,-137],[-3,-137]],m.skin[1]);R(-1,-153,3,13,m.skin[0]);P([[4,-153],[8,-137],[2,-134],[-3,-137],[3,-139]],m.skin[2]);
   P([[-15,-134],[-4,-138],[0,-135],[5,-137],[16,-133],[13,-129],[4,-131],[0,-130],[-5,-131],[-13,-130]],m.hair[1]);
   R(-6,-126,12,2,'#795640');P([[-8,-122],[9,-122],[5,-117],[-5,-118]],m.skin[1]);
   g.restore();g.restore();
   // Entire connected shoulder/upper arm pass is in FRONT of the coat.
   for(const a of [p.left,p.right]){const side=a.shoulder[0]<0?-1:1,b=p.breath;
    P([[side*25,-102+b],[side*38,-101+b],[side*49,-87+b],[side*44,-72+b],[side*27,-77+b]],m.coat[1]);
    P([[side*25,-102+b],[side*38,-101+b],[side*49,-87+b],[side*43,-85+b],[side*32,-94+b]],m.coat[0]);
    seg(a.shoulder,a.elbow,25,m.coat[2]);seg(a.shoulder,a.elbow,19,m.coat[1],-2);seg(a.shoulder,a.elbow,5,m.coat[0],-9);
    if(pass==='all')forearm(a);
   }
  }finally{g.restore();}
 }
 function drawCutscene(){R(0,-PAD_TOP,480,800+PAD_TOT,'#2a221c');const im=window.KREventVisuals?.peek('duke-bluff');if(im){g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,0,72,480,640);g.restore();return true;}R(0,90,480,490,'#674d3d');T('Room illustration unavailable',240,114,10);return false;}
 function table(){
  P([[114,300],[366,300],[481,595],[-1,595]],'#644025');
  P([[114,300],[366,300],[474,580],[6,580]],'#ba8147');
  for(let i=1;i<7;i++){const x=114+i*36;L(x,301,6+i*67,580,1.5,'#8e5b33');}
  P([[140,309],[340,309],[433,566],[47,566]],'#563034');
  P([[143,310],[337,310],[426,559],[54,559]],'#863f4d');
  P([[143,310],[337,310],[339,316],[141,316]],'#b76863');
  L(146,316,62,554,2,'#d0a165');L(334,316,418,554,2,'#a77549');L(62,554,418,554,2,'#d0a165');
  P([[6,580],[474,580],[474,594],[6,594]],'#7d4e2c');L(6,580,474,580,3,'#edb467');
 }
 function die(x,y,n,size=30,angle=0,highlight=false){g.save();g.translate(x,y);g.rotate(angle);const h=size/2;
  cut(-h+3,-h+4,size,size,'#654336');cut(-h,-h,size,size,'#f5dfb2');P([[-h+5,-h],[h-5,-h],[h,-h+5],[-h+5,-h+5]],'#fff0ce');P([[h-4,-h+4],[h,-h+5],[h,h-5],[h-4,h]],'#b7b095');
  for(const [u,v]of DIE_PIPS[n])R((u-.5)*size-2,(v-.5)*size-2,4,4,'#52372c');
  if(highlight){L(-h,-h-4,h,-h-4,2,'#ffe498');}g.restore();}
 function cup(x,y,scale=1){g.save();g.translate(x,y);g.scale(scale,scale);
  P([[-53,9],[-33,16],[45,15],[58,4],[25,-4]],'#4d282f');
  P([[-52,4],[-38,-57],[-25,-66],[27,-66],[41,-55],[52,4],[39,13],[-38,13]],'#77472e');
  P([[-38,-57],[-25,-66],[0,-66],[-2,11],[-38,13],[-52,4]],'#ba8250');
  P([[27,-66],[41,-55],[52,4],[39,13],[23,10],[20,-60]],'#533c31');
  P([[-51,-3],[-38,5],[39,5],[51,-3],[52,4],[39,13],[-38,13],[-52,4]],'#c9a065');
  L(-32,-51,-43,-4,2,'#edbf7d');L(-24,-58,23,-58,3,'#d7b278');
  for(let i=0;i<5;i++)L(13,-47+i*9,18,-44+i*9,1,'#c79864');g.restore();}
 function seal(x,y,active=true){g.save();g.translate(x,y);g.globalAlpha=active?1:.25;cut(-8,-8,16,16,'#947142');cut(-8,-10,16,16,'#dfb970');P([[-4,-6],[-2,-2],[0,-7],[2,-2],[4,-6],[3,1],[-3,1]],'#765232');g.restore();}
 function coinPose(t,starter){
  t=Math.max(0,t);const u=Math.min(1,t/1.25),landed=t>=1.25;
  let height=96*4*u*(1-u),tilt=Math.max(.07,Math.abs(Math.cos(u*Math.PI*8)))*(1-.52*u);
  if(landed){const b=Math.min(1,(t-1.25)/.65);height=15*Math.abs(Math.sin(b*Math.PI*2))*(1-b);tilt=.48+Math.sin(b*Math.PI*4)*.20*(1-b);}
  return{x:240,y:432-height,groundY:432,radius:27,angle:0,height,tilt,crown:(starter==='player')===(landed||Math.cos(u*Math.PI*8)>=0),settled:t>=KRDukeRules.rules.coinSettle};
 }
 function coin(t,starter){
  KRTavernCoin.draw(g,coinPose(t,starter));
 }
 function button(r,label,enabled=true,selected=false){cut(r.x,r.y+3,r.w,r.h,'#31241e');cut(r.x,r.y,r.w,r.h,enabled?selected?'#f2d69c':'#d4b778':'#70634e');L(r.x+7,r.y+3,r.x+r.w-7,r.y+3,2,enabled?'#ffebba':'#96846a');if(selected)R(r.x+8,r.y+r.h-6,r.w-16,4,'#813c47');T(label,r.x+r.w/2,r.y+r.h/2+5,14,enabled?'#4b3227':'#c3b397',r.w-10);}
 function canPlay(s){return s.phase==='turn'&&s.turn==='player';}
 function draw(){const s=diceGame;if(!s)return;g.save();try{
  drawCutscene();actor(true,'body',s);table();
  const reveal=s.phase==='revealing'||s.phase==='result',rolling=s.phase==='rolling',p=pose();
  // Never expose the Duke's pips before challenge, even if a cup is moved.
  if(reveal)for(const [i,x,y]of [[0,240,351],[1,224,375],[2,254,375]])die(x,y,s.rivalDice[i],24,0,s.rivalDice[i]===s.bid?.face);
  cup(p.cup.x,p.cup.y,.76);actor(true,'front',s);
  T('DUKE',93,357,10);T('YOU',78,475,10,'#d7e7d7');
  for(let i=0;i<3;i++){seal(69+i*22,384,i<3-s.losses.duke);seal(48+i*22,503,i<3-s.losses.player);}
  if(s.phase==='result'&&s.phaseT<.7){const u=Math.min(1,s.phaseT/.7),e=u*u*(3-2*u),fromPlayer=s.result.loser==='player',n=3-s.losses[s.result.loser],x=(fromPlayer?48:69)+n*22,y=fromPlayer?503:384;seal(x+(382-x)*e,y+((fromPlayer?379:506)-y)*e-Math.sin(u*Math.PI)*28);}
  if(s.phase!=='intro'&&s.phase!=='coinToss')for(let i=0;i<3;i++)die(184+i*55,485,rolling?1+(Math.floor(s.phaseT*18)+i*2)%6:s.playerDice[i],37,rolling?Math.sin(s.phaseT*22+i)*.1:0,reveal&&s.playerDice[i]===s.bid?.face);
  cup(381,500,.61);
  if(s.bid){cut(142,407,196,42,'#382725');T(s.bid.owner==='duke'?"DUKE CLAIMS AT LEAST":"YOU CLAIMED AT LEAST",240,422,9,'#d8b983');T(String(s.bid.count)+' ×',222,442,17);die(268,434,s.bid.face,22);}
  else if(s.phase!=='intro'&&s.phase!=='coinToss')T('OPEN WITH AN HONEST CLAIM... OR NOT.',240,429,10,'#ecd0a0');
  if(s.phase==='coinToss')coin(s.phaseT,s.starter);
  R(0,-PAD_TOP,480,82+PAD_TOP,'#2e241d');T("DUKE'S BLUFF",240,29,22);T('SIX DICE. THREE SEALS. NO WILD ONES.',240,48,9,'#cbb38c');
  button(MINIGAME_BACK_BTN,'< BACK');button({...PAUSE_BTN,y:PAUSE_BTN.y+uiTop},'II');
  if(s.round)T('HAND '+s.round,240,95,10,'#e8c895');
  if(s.phase==='intro'){
   cut(25,523,430,145,'#352820');T('OUTBID HIM. OR CALL HIS BLUFF.',240,548,17);
   ['You see your 3 dice. His 3 stay hidden.','Claim how many dice share one face, across BOTH hands.','Raise the count — or the face at the same count.','Call BLUFF to open both cups. Wrong side loses a seal.','Lose all 3 seals and the match is over.'].forEach((t,i)=>T(t,240,571+i*19,10,'#dfc8a1'));
   button(DICE_REPLAY_BTN,'FLIP FOR FIRST');
  }else if(s.phase==='coinToss'){
   const settled=coinPose(s.phaseT,s.starter).settled;
   cut(25,530,430,139,'#352820');T(settled?(s.starter==='player'?'CROWN — YOU OPEN!':'BARREL — DUKE OPENS!'):'WHO MAKES THE FIRST CLAIM?',240,558,17);
   T('CROWN: YOU     /     BARREL: DUKE',240,593,12,'#dfc8a1');
   T(settled?'First claim decided. Now shake the dice.':'Let the coin land on the table...',240,633,11,'#dfc8a1');
  }else if(s.phase==='result'||s.phase==='revealing'){
   cut(25,530,430,139,'#352820');
   if(s.phase==='revealing'){T(s.result.caller==='player'?'YOU CALLED BLUFF!':'DUKE CALLS YOUR BLUFF!',240,559,18);T('THE CUPS TELL THE TRUTH.',240,585,12);}
   else{T(s.matchWinner?(s.matchWinner==='player'?'THE DUKE CONCEDES.':'THE DUKE KEEPS HIS TITLE.'):s.result.loser==='duke'?'THE DUKE LOSES A SEAL.':'YOU LOSE A SEAL.',240,556,17);T('CLAIM: '+s.bid.count+' × '+s.bid.face+'     FOUND: '+s.result.count,240,583,14);T(s.result.truth?'The claim was true. The caller pays.':'Not enough dice. The bidder pays.',240,607,11,'#d7c3a1');T('YOU '+(3-s.losses.player)+' SEALS     DUKE '+(3-s.losses.duke)+' SEALS',240,641,12);button(DICE_REPLAY_BTN,s.matchWinner?'REMATCH':'NEXT HAND');}
  }else{
   cut(25,526,430,34,'#352820');const texts=['He studies your claim.','He gives you a measuring look.','He pauses with his hand on the cup.','He looks entirely too comfortable.'];T(rolling?'SHAKING THE BONES...':s.turn==='duke'?'DUKE IS CONSIDERING...':s.bid?texts[s.tell]:'YOUR OPENING CLAIM',240,548,12);
   const playable=canPlay(s);T('HOW MANY DICE?',240,570,9);T('WHICH FACE?',240,628,9);
   for(let i=0;i<6;i++){button(rects.count[i],String(i+1),playable,s.selected.count===i+1);const r=rects.face[i];button(r,'',playable,s.selected.face===i+1);die(r.x+r.w/2,r.y+21,i+1,25);}
   button(rects.raise,s.bid?'RAISE CLAIM':'MAKE CLAIM',playable&&KRDukeRules.valid(s.selected,s.bid));button(rects.call,'BLUFF!',playable&&!!s.bid);
   const minimum=KRDukeRules.next(s.bid);T(playable&&!KRDukeRules.valid(s.selected,s.bid)?minimum?'Raise to at least '+minimum.count+' × '+minimum.face+', or call BLUFF.':'No higher claim. Call BLUFF.':'Your claim counts ALL SIX dice. Ones are ordinary.',240,764,10,'#cdb58b');
  }
 }finally{g.restore();}}
 function tap(pt){const s=diceGame;if(!s)return;if(pointInRect(pt,MINIGAME_BACK_BTN)){leaveDiceGuess();return;}
  if((s.phase==='intro'||s.phase==='result')&&pointInRect(pt,DICE_REPLAY_BTN)){beginDiceGuessRound();return;}
  if(!canPlay(s))return;
  for(let i=0;i<6;i++){if(pointInRect(pt,rects.count[i]))s.selected.count=i+1;if(pointInRect(pt,rects.face[i]))s.selected.face=i+1;}
  if(pointInRect(pt,rects.raise))submitDukeBid();else if(pointInRect(pt,rects.call))callDukeBluff();
 }
 window.KRDukeBluff={assetId:'duke-bluff',drawCutscene,draw,actor,pose,materials,table,die,cup,coinPose,rects,tap};
})();
