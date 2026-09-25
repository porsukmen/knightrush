/* Tankard duel: its own camera and plate. Other tavern games stay unchanged. */
(()=>{
 'use strict';
 const P=(pts,c)=>{g.fillStyle=c;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();};
 const L=(x,y,X,Y,w,c)=>{g.strokeStyle=c;g.lineWidth=w;g.lineCap='butt';g.beginPath();g.moveTo(x,y);g.lineTo(X,Y);g.stroke();};
 const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
 const T=(s,x,y,size=12,c='#edd4a0',max=420)=>smithText(s,x,y,size,c,max);
 const proj=(x,y)=>KRTavernPhysics.project(x,y);
 const surface=(x,y)=>proj(x,(y-237)/477*900);
 const W=(pts,c)=>P(pts.map(([x,y])=>{const p=surface(x,y);return[p.x,p.y];}),c);
 function WL(x,y,X,Y,w,c){const a=surface(x,y),b=surface(X,Y);L(a.x,a.y,b.x,b.y,w,c);}
 function bevel(x,y,w,h,c){P([[x+7,y],[x+w-7,y],[x+w,y+7],[x+w,y+h-7],[x+w-7,y+h],[x+7,y+h],[x,y+h-7],[x,y+7]],c);}
 function button(r,s){bevel(r.x,r.y+4,r.w,r.h,'#38271e');bevel(r.x,r.y,r.w,r.h,'#e3c184');L(r.x+8,r.y+4,r.x+r.w-8,r.y+4,2,'#ffdfa0');T(s,r.x+r.w/2,r.y+r.h/2+5,14,'#50301d',r.w-16);}
 function panel(y,h,title,lines){bevel(35,y+4,410,h,'#291e19');bevel(35,y,410,h,'#dfc08b');T(title,240,y+26,17,'#57321d',385);lines.forEach((s,i)=>T(s,240,y+51+i*19,11,'#664327',385));}
 function drawCutscene(){
  R(0,-PAD_TOP,480,800+PAD_TOT,'#30231c');const img=window.KREventVisuals?.peek('tavern-slide');
  if(img){g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(img,0,90,480,640);g.restore();return true;}
  R(0,90,480,650,'#775539');T('The table is ready. Room artwork unavailable.',240,175,11);return false;
 }
 // Approved construction anchors: merchant torso/material planes and Borin's
 // two-bone solver, squared forearm/palm connections. No innkeeper anchor.
 // This rebuilt Barry was explicitly approved as an Art Lab reference, 2026-09-25.
 const barryMaterials={
  neutral:{skin:['#e1bc8d','#c99e72','#986c53'],shirt:['#e6d6ad','#bcaa86','#807c68'],vest:['#467f80','#265760','#193f4b'],hair:['#ab794b','#7d5034','#513b2d'],leather:['#bc8755','#8c5739','#57392d'],metal:['#efd18b','#cfa960','#947345']},
  hearth:{skin:['#ffd095','#e5a06b','#98634f'],shirt:['#ffe0a1','#d5c39c','#7e989e'],vest:['#719b86','#396f69','#284d51'],hair:['#d39543','#985b30','#543b30'],leather:['#eaa04e','#b96632','#693b2c'],metal:['#ffe3a3','#d9b66e','#8f8061']}
 };
 function barryPose(t=perfNow){
  const breath=Math.sin(t*1.6)*.45;
  const arm=side=>{
   const shoulder=[side*45,-112+breath],wrist=[side*48,-52];
   const dx=wrist[0]-shoulder[0],dy=wrist[1]-shoulder[1],d=Math.hypot(dx,dy),upper=39,lower=40;
   const a=(upper*upper-lower*lower+d*d)/(2*d),h=Math.sqrt(Math.max(0,upper*upper-a*a));
   return{shoulder,elbow:[shoulder[0]+dx*a/d+side*dy*h/d,shoulder[1]+dy*a/d-side*dx*h/d],wrist,upper,lower};
  };
  return{breath,left:arm(-1),right:arm(1),headAngle:Math.sin(t*.65)*.006,blink:Math.sin(t*.73)>.997};
 }
 function barry(lit=true,pass='all'){
  const {skin,shirt,vest,hair,leather,metal}=lit?barryMaterials.hearth:barryMaterials.neutral,p=barryPose();
  // Canvas-unit version of the exact segment primitive used by the Lab rigs.
  const S=(a,b,width,c)=>expSegment(...a,...b,width,c);
  const plane=(a,b,width,c,dx=0,dy=0)=>S([a[0]+dx,a[1]+dy],[b[0]+dx,b[1]+dy],width,c);
  const forearms=()=>{
   for(const a of [p.left,p.right]){
    const e=a.elbow,w=a.wrist,dx=w[0]-e[0],dy=w[1]-e[1],len=Math.hypot(dx,dy);
    // Broad straight forearm, a separate block elbow, and a wrist-sized hand.
    R(e[0]-10,e[1]-8,20,17,skin[2]);
    plane(e,w,20,skin[2]);plane(e,w,15,skin[1],-2,-1);plane(e,w,5,skin[0],-6,-1);
    const cuffA=[e[0]-dx/len*5,e[1]-dy/len*5],cuffB=[e[0]+dx/len*4,e[1]+dy/len*4];
    plane(cuffA,cuffB,25,shirt[1]);plane(cuffA,cuffB,8,shirt[0],-8,-1);
    plane([cuffB[0]-dx/len*2,cuffB[1]-dy/len*2],cuffB,25,shirt[2]);
    // Palm rests on the far table edge. Inward thumb is rooted at the wrist.
    g.save();g.translate(...w);
    const side=w[0]<0?-1:1;
    P([[-9,-5],[7,-5],[10,0],[10,7],[6,10],[-8,9],[-11,5]],skin[1]);
    P([[-9,-5],[7,-5],[8,-1],[5,3],[-9,2]],skin[0]);
    P([[-8,6],[7,6],[10,4],[10,7],[6,10],[-8,9]],skin[2]);
    P([[-side*6,-3],[-side*12,-1],[-side*14,4],[-side*10,6],[-side*6,2]],skin[1]);
    for(const x of [-5,0,5])R(x,3,1,4,skin[2]);
    g.restore();
   }
  };
  g.save();try{
   g.translate(240,379);
   if(pass==='front'){forearms();return;}
   g.save();g.translate(0,p.breath);
   // Merchant's wide ribcage and belly proportions, with a square human neck.
   P([[-39,-125],[-18,-132],[23,-130],[42,-120],[51,-96],[56,-60],[47,-26],[-45,-26],[-55,-58],[-51,-96]],vest[1]);
   P([[-39,-125],[-18,-132],[-7,-127],[-10,-105],[-13,-64],[-13,-27],[-45,-26],[-55,-58],[-51,-96]],vest[0]);
   P([[23,-130],[42,-120],[51,-96],[56,-60],[47,-26],[34,-29],[39,-61],[35,-97]],vest[2]);
   P([[-17,-130],[17,-130],[15,-105],[1,-88],[-15,-109]],shirt[1]);
   P([[-17,-130],[-4,-131],[-3,-109],[1,-88],[-15,-109]],shirt[0]);
   R(-14,-144,29,20,skin[2]);P([[-14,-143],[3,-143],[4,-127],[-12,-128]],skin[1]);
   // Small standing linen collar, no oversized cartoon lapels.
   P([[-19,-132],[-14,-134],[-3,-121],[-8,-110],[-20,-122]],shirt[0]);
   P([[13,-134],[20,-130],[18,-119],[6,-111],[-3,-121]],shirt[1]);
   P([[-35,-124],[-26,-130],[-22,-112],[-13,-99],[-25,-105]],vest[1]);
   P([[28,-127],[37,-122],[24,-106],[15,-97],[20,-113]],vest[2]);
   for(const y of [-91,-73,-55]){R(1,y,5,5,metal[1]);R(1,y,2,2,metal[0]);}
   // A leather waist belt explains the lower volume, rather than a pointed hem.
   P([[-52,-48],[-1,-44],[52,-48],[50,-38],[-1,-34],[-50,-38]],leather[2]);
   R(0,-46,14,12,metal[1]);R(3,-43,8,6,leather[2]);R(1,-46,12,2,metal[0]);
   P([[-36,-81],[-15,-80],[-15,-72],[-35,-74]],vest[2]);L(-35,-81,-15,-80,2,vest[0]);
   // One small barrel clasp; details follow construction, not decorative facets.
   P([[-33,-108],[-25,-108],[-23,-104],[-25,-98],[-33,-98],[-35,-103]],metal[1]);
   L(-33,-106,-25,-106,1.5,metal[0]);L(-33,-100,-25,-100,1.5,metal[2]);
   // Head-to-torso ratio follows approved civilian models, not the old Barry.
   g.translate(0,-132);g.rotate(p.headAngle);g.translate(0,132);
   P([[-25,-185],[20,-185],[27,-171],[26,-145],[16,-132],[-13,-132],[-26,-145]],skin[1]);
   P([[-25,-185],[-2,-185],[-2,-139],[-13,-132],[-26,-145]],skin[0]);
   P([[17,-182],[27,-171],[26,-145],[16,-132],[5,-137],[17,-149]],skin[2]);
   R(-30,-170,6,15,skin[1]);R(-30,-169,2,10,skin[0]);R(25,-168,5,13,skin[2]);
   // Stepped swept hair and squared temples, with restrained broad streaks.
   P([[-27,-168],[-29,-184],[-19,-194],[3,-197],[22,-193],[29,-180],[25,-165],[21,-165],[19,-179],[-6,-183],[-21,-176],[-21,-164]],hair[1]);
   P([[-29,-184],[-19,-194],[3,-197],[22,-193],[13,-189],[-6,-189],[-22,-182]],hair[0]);
   P([[22,-193],[29,-180],[25,-165],[21,-165],[19,-179],[14,-185]],hair[2]);
   R(-26,-171,5,17,hair[1]);R(-26,-170,2,11,'#c0b296');
   R(21,-169,5,15,hair[2]);R(24,-168,2,9,'#918d7c');
   // Readable small eyes and broad nose planes, as in the approved merchant.
   R(-17,-168,11,3,hair[1]);R(7,-167,10,3,hair[2]);
   R(-15,-161,6,p.blink?.7:3, '#293930');R(9,-160,5,p.blink?.7:3,'#293930');
   P([[-2,-166],[4,-166],[8,-150],[-3,-150]],skin[1]);
   R(-1,-165,3,12,skin[0]);P([[4,-163],[8,-150],[3,-148],[-3,-150],[3,-152]],skin[2]);
   // Close beard follows the squared jaw; no soft bulbous cheeks/smile mask.
   P([[-25,-154],[-20,-153],[-17,-144],[-7,-139],[9,-139],[19,-145],[21,-155],[26,-154],[24,-139],[14,-129],[-12,-129],[-24,-140]],hair[2]);
   P([[-24,-153],[-20,-152],[-17,-143],[-7,-138],[9,-138],[16,-141],[13,-133],[-11,-133],[-21,-141]],hair[1]);
   P([[-23,-152],[-20,-150],[-18,-142],[-11,-138],[-12,-134],[-21,-141]],hair[0]);
   P([[-17,-148],[-5,-151],[0,-148],[6,-151],[18,-147],[17,-141],[6,-144],[0,-143],[-6,-145],[-17,-143]],hair[1]);
   R(-15,-147,9,2,hair[0]);R(6,-147,8,2,hair[0]);
   R(-6,-138,12,2,'#594034');
   g.restore();
   // Front-facing standard: connected shoulder caps AND upper arms cover torso.
   // Keep this outside the head/breath transform; the rig includes breathing.
   for(const a of [p.left,p.right]){
    const side=a.shoulder[0]<0?-1:1,b=p.breath;
    P([[side*33,-126+b],[side*44,-127+b],[side*58,-118+b],[side*57,-102+b],[side*42,-94+b],[side*32,-109+b]],shirt[1]);
    P([[side*33,-126+b],[side*44,-127+b],[side*58,-118+b],[side*54,-113+b],[side*41,-119+b]],side<0?shirt[0]:shirt[1]);
    plane(a.shoulder,a.elbow,28,shirt[2]);
    plane(a.shoulder,a.elbow,21,shirt[1],-3,-1);
    plane(a.shoulder,a.elbow,7,shirt[0],-10,-1);
   }
   if(pass==='all')forearms();
  }finally{g.restore();}
 }
 function table(){
  const a=surface(47,237),b=surface(433,237),c=surface(433,714),d=surface(47,714);
  P([[a.x+7,a.y+17],[b.x+9,b.y+17],[c.x+17,c.y+31],[d.x+10,d.y+31]],'#3c281ba0');
  P([[a.x,a.y],[b.x,b.y],[c.x,c.y+22],[d.x,d.y+22]],'#603920');
  W([[47,237],[433,237],[433,714],[47,714]],'#6c4228');
  const palette=['#b47b40','#bf8748','#c18a4a','#b67d40','#ae743b'];
  for(let i=0;i<5;i++){
   const x=70+i*68;W([[x,237],[x+68,237],[x+68,714],[x,714]],palette[i]);
   WL(x,237,x,714,1,'#8d572e');WL(x+2,238,x+2,713,.7,'#db9d59');
   // Grain is drawn ON the projected board plane. No pasted screen-space lines.
   for(let k=0;k<3;k++){const y=300+k*130+(i%2)*30;
    W([[x+24,y],[x+21,y+24],[x+23,y+69],[x+26,y+95],[x+25,y+59],[x+24,y+25]],'#a16a35');
    W([[x+47,y+16],[x+44,y+40],[x+46,y+65],[x+48,y+44]],'#ce9653');
   }
  }
  // Raised wood rails with dark leather impact faces; open ends remain open.
  for(const [x,X] of [[47,70],[410,433]]){
   W([[x,237],[X,237],[X,714],[x,714]],'#6e4328');
   const p=surface(x,237),q=surface(X,237),r=surface(X,714),s=surface(x,714);
   P([[p.x,p.y-8],[q.x,q.y-8],[r.x,r.y-9],[s.x,s.y-9]],'#d39a55');
   const inside=x===47?X:x,u=surface(inside,237),v=surface(inside,714);P([[u.x,u.y-5],[v.x,v.y-6],[v.x,v.y+1],[u.x,u.y+1]],'#70462f');
  }
  for(let i=2;i>=0;i--){const radius=TAVERN_SLIDE_RULES.rings[i];g.strokeStyle=['#ffe1a0','#f1d1a0','#804831'][i];g.lineWidth=i===0?2.5:2;g.beginPath();for(let n=0;n<=64;n++){const angle=n/64*Math.PI*2,p=proj(240+Math.cos(angle)*radius,450+Math.sin(angle)*radius);n?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y);}g.stroke();}
  const rings=TAVERN_SLIDE_RULES.rings;
  for(const [value,offset] of [[3,0],[2,(rings[0]+rings[1])*.5],[1,(rings[1]+rings[2])*.5]]){const p=proj(240+offset,450);T(String(value),p.x,p.y+3,9,'#f9dfa8');}
  WL(95,642,385,642,1,'#e2b474');WL(95,309,385,309,1,'#e2b474');
  L(d.x,d.y+2,c.x,c.y+2,4,'#e1ad67');
 }
 function mug(m,ghost=false){const p=proj(m.x,m.y),s=p.scale*TAVERN_SLIDE_RULES.mugRadius/17;g.save();g.globalAlpha=ghost?.72:m.alpha;g.translate(p.x,p.y+(m.onTable?0:m.fallT*70));g.scale(s,s);if(!m.onTable)g.rotate(m.fallT*2);
  P([[-13,2],[-18,-2],[-14,-9],[9,-11],[23,-2],[20,5],[0,8]],'#68451d60');
  // Tankard proportions against Barry, not a small cup scaled from an icon.
  // Height grows independently of its footprint; shadow stays on the table.
  g.scale(1,TAVERN_SLIDE_RULES.mugHeightScale);
  P([[14,-31],[28,-31],[32,-24],[30,-11],[19,-7],[17,-13],[24,-16],[25,-26],[15,-26]],'#b49c6d');
  P([[-17,-37],[15,-37],[18,-9],[12,-1],[-12,-1],[-18,-9]],'#61482d');
  P([[-14,-34],[10,-34],[11,-4],[-12,-4]],'#c9964e');P([[10,-34],[16,-30],[17,-10],[11,-4]],'#8a6036');
  for(const x of [-8,0,8])L(x,-32,x,-6,1,'#996d37');
  P([[-18,-34],[-11,-41],[10,-41],[18,-34],[11,-28],[-11,-28]],'#e7c98b');P([[-12,-34],[-8,-37],[9,-37],[13,-33],[8,-30],[-8,-30]],'#f7e6b3');
  P([[-16,-22],[16,-22],[17,-15],[-16,-15]],m.owner==='player'?'#499eb1':'#b94d36');L(-15,-22,14,-22,2,m.owner==='player'?'#89d0d5':'#e69b63');
  L(-12,-5,11,-5,3,'#c8b47c');g.restore();
 }
 function coinPose(time,first='player'){
  const [land,bounce,rest]=TAVERN_SLIDE_RULES.coinImpacts,t=Math.max(0,time),p=Math.min(1,t/land);
  const floor=proj(240+5*p,80+490*p),radius=31*floor.scale;
  let height=0,tilt=.48,angle=0,face=first==='player';
  if(t<land){height=112*4*p*(1-p);const flip=Math.cos(p*Math.PI*6);tilt=Math.max(.06,Math.abs(flip))*(1-.52*p);face=flip>=0?face:!face;angle=Math.sin(p*Math.PI)*.23;}
  else if(t<bounce){const b=(t-land)/(bounce-land);height=23*4*b*(1-b);tilt=.48+Math.sin(b*Math.PI*2)*.31;angle=Math.sin(b*Math.PI)*.19;}
  else if(t<rest){const b=(t-bounce)/(rest-bounce);height=7*4*b*(1-b);tilt=.48+Math.sin(b*Math.PI*2)*.12;angle=-Math.sin(b*Math.PI)*.09;}
  else if(t<rest+.26){const b=(t-rest)/.26;tilt=.48+Math.sin(b*Math.PI*4)*.08*(1-b);}
  return{x:floor.x,y:floor.y-height,groundY:floor.y,radius,height,tilt,angle,crown:face,settled:t>=rest+.26};
 }
 function coin(time,first){
  const p=coinPose(time,first),rim=Array.from({length:16},(_,i)=>{const a=i*Math.PI/8;return[Math.cos(a),Math.sin(a)];});
  const disc=(r,c,dy=0)=>P(rim.map(([x,y])=>[x*r,y*r+dy]),c);
  g.save();g.translate(p.x+3,p.groundY+2);g.scale(p.radius*(1+p.height/170),p.radius*.32);g.globalAlpha=.28/(1+p.height/65);disc(1,'#36210e');g.restore();
  g.save();g.translate(p.x,p.y);g.rotate(p.angle);g.scale(p.radius,p.radius);
  // Thin reeded edge, a stepped raised rim, then one of two minted faces.
  g.save();g.translate(0,.12);g.scale(1,p.tilt);disc(1,'#8f581f');g.restore();
  g.scale(1,p.tilt);disc(1,'#e6b44c');disc(.91,'#ffe194');disc(.79,'#b98430');disc(.72,'#dba94a');
  for(let i=0;i<16;i++){const a=i*Math.PI/8;L(Math.cos(a)*.86,Math.sin(a)*.86,Math.cos(a)*.95,Math.sin(a)*.95,.025,i>7?'#fff0b3':'#a57229');}
  if(p.crown){
   const crown=[[-.5,-.28],[-.29,-.06],[0,-.44],[.28,-.06],[.5,-.28],[.37,.27],[-.37,.27]];
   P(crown.map(([x,y])=>[x,y+.065]),'#8d5a21');P(crown,'#ffe8a2');R(-.37,.31,.74,.10,'#f6d481');
   for(const x of [-.23,0,.23])R(x-.035,.11,.07,.08,'#a97628');
  }else{
   P([[-.29,-.48],[.26,-.48],[.41,-.18],[.41,.24],[.26,.49],[-.29,.49],[-.42,.24],[-.42,-.18]],'#885820');
   P([[-.23,-.46],[.22,-.46],[.34,-.17],[.34,.21],[.22,.43],[-.23,.43],[-.34,.21],[-.34,-.17]],'#f2d07a');
   L(-.11,-.37,-.13,.36,.035,'#a7762e');L(.11,-.37,.13,.36,.035,'#a7762e');
   L(-.34,-.22,.34,-.22,.10,'#a3742c');L(-.34,.22,.34,.22,.10,'#a3742c');
  }g.restore();
 }
 function mugLayers(t){
  const layers=t.mugs.map(m=>({m,ghost:false})),owner=tavernCurrentOwner(t);
  // The waiting cup belongs to the SAME ground-depth order as launched cups.
  // Barry's far cup must not be painted over a cup nearer the camera.
  if(t.phase==='playing'&&!t.shotActive&&owner)layers.push({m:{...tavernLaunchPoint(owner),owner,onTable:true,alpha:1},ghost:owner==='player'});
  return layers.sort((a,b)=>a.m.y-b.m.y);
 }
 function draw(){g.save();try{
  drawCutscene();const t=tavernSlideGame;barry(true,'body');table();barry(true,'front');
  for(const layer of mugLayers(t))mug(layer.m,layer.ghost);
  const owner=tavernCurrentOwner(t),score=tavernScores();
  if(t.phase==='playing'&&!t.shotActive){
   if(owner==='player'){
    const shot=t.gesture?tavernShotVelocityFromGesture(t.gesture,t.gesture.current,performance.now()):{vx:Math.sin(t.keyAngle),vy:-Math.cos(t.keyAngle),power:t.keyPower};
    if(shot){const start=tavernLaunchPoint('player'),len=Math.hypot(shot.vx,shot.vy),end=proj(start.x+shot.vx/len*65,start.y+shot.vy/len*65),p=proj(start.x,start.y);
     L(p.x,p.y-3,end.x,end.y,2,'#b6e2d6');bevel(119,704,242,12,'#4f3827');R(123,707,234*shot.power,6,'#edbc67');
    }
   }
  }
  R(0,-PAD_TOP,480,102+PAD_TOP,'#30231c');T('THE MOSSY OAK / TANKARD DUEL',240,28,14);button(MINIGAME_BACK_BTN,'< BACK');button({...PAUSE_BTN,y:PAUSE_BTN.y+uiTop},'II');
  bevel(83,108,314,34,'#38281ee8');T('YOU '+score.player+'   :   '+score.ai+' BARRY',240,130,15,'#f2d398');
  T('BARREL BARRY',240,170,10,'#e8c292');
  for(const [side,x,col] of [['player',33,'#7ac0cd'],['ai',403,'#dd8666']])for(let i=0;i<3;i++)R(x+i*16,152,10,6,i<t.mugs.filter(m=>m.owner===side).length?'#624b37':col);
  if(t.phase==='intro'){
   panel(500,147,'PLAY THE TABLE, NOT JUST THE TARGET',['Three mugs each. Alternate shots.','Pull your mug back, release to slide.','Use the side cushions to bank around guards.','Hit his mugs away, or push yours into a ring.','Final positions score 3 / 2 / 1.']);button(TAVERN_SLIDE_START_BTN,'TOSS THE COIN');
  }else if(t.phase==='coinToss'){
   coin(t.phaseT,t.first);const settled=coinPose(t.phaseT,t.first).settled;
   bevel(65,734,350,49,'#35251de8');T(settled?(t.first==='player'?'CROWN — YOU THROW FIRST':'BARREL — BARRY THROWS FIRST'):'CROWN FOR YOU / BARREL FOR BARRY',240,756,12);
   T(settled?'LET THE DUEL BEGIN':'THE COIN DECIDES...',240,774,9,'#c6b18b');
  }else if(t.phase==='result'){
   panel(530,111,t.result.winner==='player'?'THE TABLE IS YOURS':t.result.winner==='ai'?'BARRY WINS THIS ONE':'A DRAW — BUY ANOTHER ROUND?',['YOU '+t.result.player+'   :   '+t.result.ai+' BARRY','Cups are scored only after the last shot.']);button(TAVERN_SLIDE_START_BTN,'REMATCH');
  }else{
   bevel(18,731,444,57,'#35251de8');T(t.phase==='resolving'?'LAST CALL — COUNTING':t.feedback,240,750,11,'#f1d39b');
   T(owner==='player'&&!t.shotActive?'DRAG MUG  /  ARROWS: AIM & POWER  /  SPACE: THROW':t.shotActive?'LET THE MUGS SETTLE':"BARRY IS READING THE TABLE",240,773,9,'#c6b18b');
  }
 }finally{g.restore();}}
 window.KRTavernSlide={assetId:'tavern-slide',drawCutscene,draw,barry,barryPose,barryMaterials,table,mug,mugLayers,coinPose};
})();
