/* Candidate dealer and game art. Approved merchant/Barry construction, not old placeholders. */
(()=>{
 'use strict';
 const P=(pts,c)=>{g.fillStyle=c;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();};
 const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
 const L=(x,y,X,Y,w,c)=>{g.strokeStyle=c;g.lineWidth=w;g.lineCap='butt';g.beginPath();g.moveTo(x,y);g.lineTo(X,Y);g.stroke();};
 const T=(s,x,y,size=12,c='#f1d69b',max=430)=>smithText(s,x,y,size,c,max);
 const cut=(x,y,w,h,c)=>P([[x+6,y],[x+w-6,y],[x+w,y+6],[x+w,y+h-6],[x+w-6,y+h],[x+6,y+h],[x,y+h-6],[x,y+6]],c);
 const materials=Object.freeze({
  neutral:{skin:['#e1bc8d','#c99e72','#986c53'],shirt:['#e6d6ad','#bcaa86','#807c68'],coat:['#956074','#653e55','#402b3e'],hair:['#665444','#44372e','#2c2826'],gold:['#efd18b','#cfa960','#947345']},
  scene:{skin:['#ffce93','#d7a06a','#906954'],shirt:['#ffdda0','#d2bb91','#839496'],coat:['#ac6770','#784653','#483442'],hair:['#896540','#503c31','#303234'],gold:['#ffe3a3','#ddb668','#94866a']}
 });
 function solve(a,b,upper,lower,side){
  // View-space depth bends the elbow toward the table, not horizontally outward.
  // Bone lengths are constant in 3D; projected forearms naturally foreshorten.
  const dx=b[0]-a[0],dy=b[1]-a[1],planar=Math.hypot(dx,dy),z=Math.min(60,Math.sqrt(Math.max(0,(upper+lower-2)**2-planar**2))*.75);
  const d=Math.hypot(dx,dy,z),u=[dx/d,dy/d,z/d],pref=[side*.55,.85,-.3],dot=pref.reduce((n,v,i)=>n+v*u[i],0),v=pref.map((x,i)=>x-dot*u[i]),n=Math.hypot(...v);
  const along=(upper*upper-lower*lower+d*d)/(2*d),h=Math.sqrt(Math.max(0,upper*upper-along*along));
  return{elbow:[a[0]+u[0]*along+v[0]/n*h,a[1]+u[1]*along+v[1]/n*h,u[2]*along+v[2]/n*h],wrist:[b[0],b[1],z]};
 }
 function pose(s){
  const targets=KRRoyalShuffleRules.handTargets(s),talk=false;
  return{arms:targets.map((w,i)=>{const shoulder=[i?283:197,293,0],upper=66,lower=76,rig=solve(shoulder,w,upper,lower,i?1:-1);return{shoulder,elbow:rig.elbow,wrist:rig.wrist,upper,lower};}),headAngle:talk?-.025:Math.sin(s.elapsed*.9)*.009,talk};
 }
 function segment(a,b,w,colors){expSegment(a[0],a[1],b[0],b[1],w,colors[2]);expSegment(a[0]-2,a[1]-1,b[0]-2,b[1]-1,w*.76,colors[1]);expSegment(a[0]-w*.25,a[1]-1,b[0]-w*.25,b[1]-1,w*.20,colors[0]);}
 function palm(w,skin,gold,hand){
  g.save();g.translate(w[0],w[1]);g.scale(hand===0?-1:1,1);
  P([[-11,-7],[7,-8],[12,-2],[12,10],[7,15],[-8,14],[-12,8]],skin[1]);
  P([[-11,-7],[7,-8],[9,-2],[5,4],[-10,3]],skin[0]);
  P([[8,-2],[12,-2],[12,10],[7,15],[-8,14],[-8,10],[7,10]],skin[2]);
  P([[-8,-2],[-16,1],[-17,8],[-12,10],[-7,4]],skin[1]);
  for(const x of [-5,0,5])R(x,5,1,7,skin[2]);R(3,4,4,3,gold[1]);R(3,4,3,1,gold[0]);g.restore();
 }
 function pinchAmount(s){
  const shown=KRRoyalShuffleRules.caughtDisplay(s);
  const t=shown?shown.reach:s.phase==='restore'&&s.restoreFrom?1-Math.max(0,Math.min(1,(s.phaseT-.84)/.2)):0;
  return t*t*(3-2*t);
 }
 function cardHoldPalm(w,skin,gold,t){
  g.save();g.translate(w[0],w[1]);
  const blend=(a,b)=>a.map(([x,y],i)=>[x+(b[i][0]-x)*t,y+(b[i][1]-y)*t]);
  // Merchant-style compact palm: one block, top light and narrow side plane.
  // No separate thumb or gripping fingers over the face of the card.
  P(blend([[11,-7],[-7,-8],[-12,-2],[-12,10],[-7,15],[8,14],[12,8]],[[9,-11],[-8,-11],[-11,-7],[-11,3],[-8,6],[7,6],[11,1]]),skin[1]);
  P(blend([[11,-7],[-7,-8],[-9,-2],[-5,4],[10,3]],[[8,-10],[-8,-10],[-10,-7],[-7,-5],[9,-5]]),skin[0]);
  P(blend([[-8,-2],[-12,-2],[-12,10],[-7,15],[8,14],[8,10],[-7,10]],[[8,-9],[11,-5],[11,1],[7,6],[-8,6],[-8,3],[7,3]]),skin[2]);
  R(-2,-2,4,3,gold[1]);R(-2,-2,3,1,gold[0]);
  g.restore();
 }
 function actor(s,lit=true,pass='all'){
  const m=lit?materials.scene:materials.neutral,{skin,shirt,coat,hair,gold}=m,p=pose(s);
  if(pass!=='front'){
   // Squared, narrower ribcage: same material grammar as approved merchant.
   P([[191,275],[220,265],[258,265],[287,276],[296,313],[289,362],[193,362],[184,314]],coat[1]);
   P([[191,275],[220,265],[235,273],[228,357],[193,362],[184,314]],coat[0]);
   P([[262,267],[287,276],[296,313],[289,362],[269,362],[274,317]],coat[2]);
   P([[220,265],[258,265],[261,287],[242,311],[220,287]],shirt[1]);
   P([[220,265],[237,266],[242,311],[220,287]],shirt[0]);
   R(226,251,28,22,skin[2]);P([[226,251],[242,251],[243,271],[227,268]],skin[1]);
   P([[217,268],[225,263],[240,279],[230,291],[217,281]],shirt[0]);
   P([[254,263],[264,271],[259,284],[247,290],[240,279]],shirt[1]);
   P([[207,271],[218,268],[225,297],[216,321],[201,297]],coat[2]);
   P([[268,271],[278,275],[272,296],[257,320],[261,292]],coat[2]);
   L(207,277,217,305,2,gold[1]);L(272,279,264,305,2,gold[2]);
   for(const y of [309,329,347]){R(239,y,5,5,gold[1]);R(239,y,2,2,gold[0]);}
   P([[196,346],[238,351],[287,346],[287,356],[238,361],[196,356]],'#3b302a');R(233,350,17,11,gold[1]);R(237,353,9,5,'#3b302a');
   // Restrained pendant and pocket piping, not a wall of decorative triangles.
   L(216,285,232,305,1.5,gold[1]);L(232,305,260,286,1.5,gold[2]);
   P([[229,302],[235,302],[238,307],[232,312],[227,307]],gold[1]);
   L(194,325,226,325,3,coat[2]);L(194,323,226,323,1,gold[1]);
   L(254,327,286,327,3,coat[2]);L(254,325,286,325,1,gold[2]);
   const shocked=s.pocketCaught&&(s.phase==='surprise'||s.phase==='result');
   const recoil=shocked?Math.min(1,s.phase==='surprise'?s.phaseT/.12:1):0;
   g.save();g.translate(240,258-recoil*3);g.rotate(p.headAngle-recoil*.035);
   // Continuous angular face: broad cheek/jaw planes and small square eyes.
   P([[-24,-61],[17,-64],[26,-50],[24,-17],[12,0],[-8,3],[-24,-14],[-28,-42]],skin[1]);
   P([[-24,-61],[-2,-63],[-3,-10],[-8,3],[-24,-14],[-28,-42]],skin[0]);
   P([[17,-64],[26,-50],[24,-17],[12,0],[2,-4],[16,-20]],skin[2]);
   R(-30,-43,6,16,skin[1]);R(-30,-42,2,10,skin[0]);R(24,-41,5,14,skin[2]);
   P([[-28,-37],[-31,-61],[-22,-72],[5,-78],[25,-71],[31,-57],[25,-40],[21,-39],[20,-57],[6,-65],[-20,-58],[-22,-37]],hair[1]);
   P([[-31,-61],[-22,-72],[5,-78],[25,-71],[13,-69],[-4,-69],[-23,-60]],hair[0]);
   P([[25,-71],[31,-57],[25,-40],[21,-39],[20,-57],[14,-65]],hair[2]);
   // One raised brow and asymmetric restrained smirk, not a round cartoon grin.
   if(shocked){
    P([[-20,-48],[-7,-53],[-6,-49],[-19,-44]],hair[1]);
    P([[6,-53],[19,-49],[19,-45],[7,-49]],hair[2]);
   }else{
    P([[-19,-44],[-7,-46],[-6,-42],[-19,-41]],hair[1]);P([[7,-46],[18,-49],[19,-45],[7,-43]],hair[2]);
   }
   const blink=Math.sin(s.elapsed*.77)>.996;
   if(shocked){
    R(-17,-39,5,9,'#293930');R(10,-40,5,9,'#293930');
   }else{R(-17,-36,6,blink?1:3,'#293930');R(10,-37,5,blink?1:3,'#293930');}
   P([[-2,-42],[4,-42],[9,-24],[0,-21],[-5,-24]],skin[1]);P([[1,-41],[4,-42],[9,-24],[0,-21],[2,-27]],skin[2]);R(-2,-40,3,13,skin[0]);
   P([[-17,-21],[-5,-24],[0,-20],[6,-24],[19,-23],[17,-18],[5,-18],[0,-16],[-6,-18],[-17,-17]],hair[1]);
   if(shocked){
    // Dropped jaw, one recessed mouth cavity and a connected lower lip/chin.
    P([[-15,-14],[-8,-9],[8,-9],[17,-16],[12,4],[3,9],[-7,7],[-14,0]],skin[1]);
    P([[10,-10],[17,-16],[12,4],[3,9],[0,4],[8,0]],skin[2]);
    P([[-10,-14],[-2,-16],[8,-14],[11,-10],[8,-1],[-5,0],[-10,-5]],'#402d2a');
    P([[-8,-13],[-2,-14],[7,-13],[8,-10],[-7,-10]],'#e9cc9b');
    P([[-5,-3],[6,-4],[7,-1],[-5,0]],'#a15f4d');
    L(-5,2,6,1,1.5,skin[0]);
    P([[-5,4],[6,3],[7,6],[2,10],[-4,8]],hair[1]);
   }else{
    L(-7,-12,6,-12,2,'#6c4633');L(6,-12,12,-15,2,'#6c4633');
    P([[-5,-6],[6,-6],[9,-2],[2,4],[-5,1]],hair[1]);
   }
   R(-28,-26,3,6,gold[1]);g.restore();
  }
  if(pass==='body')return;
  // Torso first, then complete connected shoulders and upper arms in FRONT.
  for(const [i,a]of p.arms.entries()){
   const [x,y]=a.shoulder;
   P([[x-13,y-15],[x+12,y-16],[x+18,y-4],[x+12,y+16],[x-13,y+13],[x-18,y-2]],coat[1]);
   P([[x-13,y-15],[x+6,y-16],[x+7,y-9],[x-11,y-6],[x-15,y+4],[x-18,y-2]],coat[0]);
  }
  for(const a of p.arms){segment(a.shoulder,a.elbow,26,coat);cut(a.elbow[0]-13,a.elbow[1]-10,25,21,coat[1]);}
  for(const [hand,a] of p.arms.entries()){
   segment(a.elbow,a.wrist,21,coat);
   const dx=a.wrist[0]-a.elbow[0],dy=a.wrist[1]-a.elbow[1],n=Math.hypot(dx,dy),cuff=[a.wrist[0]-dx/n*9,a.wrist[1]-dy/n*9];
   segment(cuff,a.wrist,25,shirt);
   const pinch=hand===0?pinchAmount(s):0;
   if(pinch>0)cardHoldPalm(a.wrist,skin,gold,pinch);else palm(a.wrist,skin,gold,hand);
  }
 }
 function table(){
  // Centered elevated camera, shallow trapezoid. Real oak apron below cloth.
  P([[62,347],[418,347],[486,572],[-6,572]],'#ad7b42');
  P([[-6,572],[486,572],[484,593],[-4,593]],'#70492c');R(0,573,480,3,'#dda661');
  for(const side of [-1,1]){
   const a=side<0?62:418,b=side<0?-6:486;
   for(const d of [5,11])L(a-side*d,352,b-side*d,567,1,side<0?'#d39b54':'#87572f');
  }
  // Tailored wine velvet, woven gilt double border and restrained corner knots.
  P([[79,358],[401,358],[460,550],[20,550]],'#4d2834');
  P([[83,361],[397,361],[454,546],[26,546]],'#c6a163');
  P([[87,365],[393,365],[448,541],[32,541]],'#7d3c4b');
  P([[87,365],[393,365],[396,375],[84,375]],'#6a3242');
  P([[87,365],[92,365],[40,537],[32,541]],'#a45361');
  P([[389,365],[393,365],[448,541],[440,537]],'#582d3d');
  P([[97,378],[383,378],[430,529],[50,529]],'#cea766');
  P([[99,380],[381,380],[427,527],[53,527]],'#7d3c4b');
  // Embroidery stays outside the card playfield; no repeated speckled texture.
  for(const side of [-1,1]){
   const x=240+side*151,y=507;
   P([[x,y-18],[x+side*11,y-7],[x,y+4],[x-side*11,y-7]],'#d2ad70');
   P([[x,y-12],[x+side*5,y-7],[x,y-2],[x-side*5,y-7]],'#7d3c4b');
   L(x,y+4,x-side*26,y+4,1.5,'#d2ad70');L(x-side*26,y+4,x-side*34,y-4,1.5,'#d2ad70');
   L(x,y-18,x-side*7,y-34,1.5,'#d2ad70');
  }
  P([[20,550],[460,550],[458,563],[22,563]],'#612c3c');R(24,552,432,2,'#bc9159');
  for(let x=31;x<455;x+=14){R(x,563,2,5,'#ca9c59');R(x+2,563,1,4,'#77502f');}
 }
 function crown(x,y,s,c){P([[x-s,y+s*.45],[x-s*.85,y-s*.7],[x-s*.3,y-s*.05],[x,y-s],[x+s*.3,y-s*.05],[x+s*.85,y-s*.7],[x+s,y+s*.45]],c);R(x-s,y+s*.4,s*2,s*.22,'#f6dd94');}
 function cardSurface(sign=1,frontality=0){
  // One projective plane for every printed mark, including inverted portraits.
  const ratio=(33+6*frontality)/39;
  const point=([x,y])=>{x*=sign;y*=sign;const v=(y+56)/108,d=1+(ratio-1)*v;return[ratio*x/d,-56+108*ratio*v/d];};
  const poly=(pts,c)=>P(pts.map(point),c);
  const rect=(x,y,w,h,c)=>poly([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],c);
  const line=(x,y,X,Y,w,c)=>{const a=point([x,y]),b=point([X,Y]);L(...a,...b,w,c);};
  const clip=(x,y,w,h)=>{g.beginPath();[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(point).forEach(([X,Y],i)=>i?g.lineTo(X,Y):g.moveTo(X,Y));g.closePath();g.clip();};
  const text=(label,x,y,size,c)=>{const a=point([x,y]),b=point([x+1,y]),v=point([x,y+1]);g.save();g.transform(b[0]-a[0],b[1]-a[1],v[0]-a[0],v[1]-a[1],...a);T(label,0,0,size,c,13);g.restore();};
  return{poly,rect,line,clip,text};
 }
 function suitMark(s,queen,x,y,size){
  const shape=pts=>s.poly(pts.map(([X,Y])=>[x+X*size,y+Y*size]),queen?'#b32f3c':'#202c36');
  if(queen)shape([[0,-.38],[-.34,-.76],[-.75,-.76],[-1,-.43],[-1,-.05],[-.75,.35],[0,1],[.75,.35],[1,-.05],[1,-.43],[.75,-.76],[.34,-.76]]);
  else{
   for(const [cx,cy]of [[0,-.55],[-.55,.1],[.55,.1]])shape([[-.24,-.43],[.24,-.43],[.43,-.24],[.43,.24],[.24,.43],[-.24,.43],[-.43,.24],[-.43,-.24]].map(([X,Y])=>[X+cx,Y+cy]));
   shape([[-.15,0],[.15,0],[.2,.65],[.5,.95],[-.5,.95],[-.2,.65]]);
  }
 }
 function courtHalf(queen,s){
  const {poly:P,rect:R,line:L}=s;
  // Broad ink masses and squared facial planes, following the live merchant.
  // The silhouette, flower/sword and costume distinguish Q from K at phone size.
  const ink='#283b50',red='#b32f3c',gold='#d6aa46',paper='#f3e7cb';
  g.save();s.clip(-22.5,-44.5,45,44.5);
  P([[-22,0],[-22,-16],[-10,-23],[9,-22],[22,-15],[22,0]],ink);
  P([[-20,-14],[-11,-20],[-4,-17],[-12,0],[-20,0]],red);
  P([[8,-20],[20,-13],[20,0],[6,0]],red);
  P([[-9,-24],[8,-24],[10,-15],[0,-7],[-11,-17]],gold);
  P([[-7,-22],[6,-22],[7,-15],[0,-11],[-8,-17]],paper);
  // Continuous forehead/cheek/jaw with a narrow side shadow, no mask triangles.
  if(queen){
   P([[-11,-35],[8,-37],[12,-29],[11,-16],[7,-13],[5,-22],[-6,-23],[-9,-15],[-14,-18]],ink);
   P([[-10,-34],[-6,-34],[-7,-23],[-11,-18],[-12,-20]],gold);
  }
  P([[-8,-34],[6,-35],[10,-30],[8,-22],[3,-18],[-3,-18],[-9,-23],[-10,-30]],ink);
  P([[-7,-33],[5,-34],[8,-30],[6,-23],[2,-20],[-3,-20],[-7,-24],[-8,-29]],paper);
  P([[5,-34],[8,-30],[6,-23],[2,-20],[1,-22],[4,-25]],'#c4ad86');
  R(-6,-29,4,1.2,ink);R(2,-29,4,1.2,ink);
  R(-5,-27,2,1.7,ink);R(3,-27,1.8,1.7,ink);
  P([[0,-29],[1.5,-28],[3,-24],[0,-23],[-1,-24]],'#b5976f');
  if(queen){L(-2,-21.8,3,-21.8,1,red);R(-10,-23,2,3,gold);}
  else{
   P([[-8,-25],[-4,-23],[0,-24],[4,-23],[8,-26],[7,-19],[2,-15],[-4,-17],[-8,-20]],ink);
   P([[-6,-24],[-3,-22],[0,-23],[4,-22],[6,-24],[5,-21],[0,-20],[-5,-21]],gold);
   L(-3,-19,3,-19,1,paper);
  }
  // A stepped crown, with a printed black keyline and restrained gold details.
  P([[-10,-33],[-12,-42],[-6,-39],[-2,-44],[3,-39],[9,-42],[10,-33]],ink);
  P([[-8,-35],[-9,-39],[-5,-37],[-2,-41],[2,-37],[7,-39],[8,-35]],gold);
  R(-8,-35,16,2,gold);R(-2,-35,3,2,red);
  // Cross-body sash meets its inverted counterpart at the centre of the card.
  P([[-22,-12],[-18,-18],[22,-5],[22,0],[16,0]],gold);
  L(-20,-14,21,-1,2,ink);
  for(const x of [-15,-7,1,9])R(x,-12+(x+15)*.32,2,2,paper);
  for(const y of [-11,-5]){R(-19,y,4,2,gold);R(12,y,4,2,gold);}
  if(queen){
   L(17,-8,17,-31,1.5,ink);L(17,-24,21,-27,1.2,ink);
   P([[17,-38],[19,-35],[22,-34],[19,-31],[17,-28],[15,-31],[12,-34],[15,-35]],gold);
   R(15.5,-35.5,3,3,red);
  }else{
   P([[15,-13],[15,-38],[17,-43],[19,-38],[19,-13]],ink);
   P([[16,-15],[16,-37],[17,-40],[17,-15]],paper);
   R(12,-16,10,2,gold);R(16,-14,2,7,gold);
  }
  P([[14,-17],[18,-17],[20,-14],[18,-10],[14,-10],[13,-13]],paper);
  L(15,-15,18,-15,1,'#b5976f');g.restore();
 }
 function card(c,p,face,flip=1,highlight=false){
  g.save();g.translate(p.x,p.y-p.lift);g.rotate(p.angle||0);g.scale(Math.max(.025,flip)*.66*(p.widthScale??1),.43*(p.heightScale??1));
  const front=Math.max(0,Math.min(1,p.frontality||0));
  const outline=(a,b,c)=>P(a.map(([x,y],i)=>[x+(b[i][0]-x)*front,y+(b[i][1]-y)*front]),c);
  outline([[-35,-49],[36,-49],[43,58],[-38,58]],[[-39,-52],[41,-52],[41,56],[-39,56]],'#122f29');
  outline([[-34,-54],[34,-54],[40,50],[36,55],[-36,55],[-40,50]],[[-40,-54],[40,-54],[40,50],[40,55],[-40,55],[-40,50]],highlight?'#edca72':'#bca477');
  outline([[-33,-56],[33,-56],[39,48],[35,52],[-35,52],[-39,48]],[[-39,-56],[39,-56],[39,48],[39,52],[-39,52],[-39,48]],'#f3e7cb');
  const surface=cardSurface(1,front);
  if(!face){
   surface.rect(-33,-50,66,95,'#613345');
   surface.rect(-29,-45,58,85,'#c19a54');surface.rect(-27,-43,54,81,'#784456');
   for(const y of [-28,0,28]){surface.poly([[0,y-10],[9,y],[0,y+10],[-9,y]],'#b78a57');surface.poly([[0,y-5],[4,y],[0,y+5],[-4,y]],'#e6bf76');}
   for(const x of [-16,16])for(const y of [-27,-9,9,27])surface.rect(x-1,y,2,3,'#a17350');
  }else{
   // A printed two-way court card, not a portrait sticker on a game token.
   const queen=c.role==='QUEEN';
   surface.rect(-24,-46,48,92,'#283b50');surface.rect(-22.5,-44.5,45,89,'#f3e7cb');
   for(const sign of [1,-1]){
    const s=cardSurface(sign,front);courtHalf(queen,s);
    s.rect(-34,-52,11,30,'#f3e7cb');s.text(c.rank,-28.5,-38,15,queen?'#b32f3c':'#202c36');
    suitMark(s,queen,-28.5,-28,5.5);
   }
  }
  g.restore();
 }
 function cardState(s,c){let face=['intro','memorize'].includes(s.phase),flip=1;
  const held=c.id===s.pocketCardId?KRRoyalShuffleRules.caughtDisplay(s):null;
  if(held)return{face:held.turn>=.5,flip:Math.abs(Math.cos(held.turn*Math.PI))};
  if(s.phase==='restore'||s.phase==='coverup'){
   const moving=c.id===s.pocketCardId||c===s.spare;
   if(moving){
    const wasFace=c.id===s.pocketCardId?!!s.restoreFrom||s.pocketPicked&&!s.pocketCaught:s.phase==='restore'||c.slot===s.selectedSlot;
    if(wasFace&&s.phaseT<.16){const k=s.phaseT/.16;return{face:k<.5,flip:Math.abs(Math.cos(k*Math.PI))};}
    // Travel face-down. Only turn originals after they have reached the table.
    if(s.phaseT<.84||c===s.spare)return{face:false,flip:1};
   }else if(s.phase==='restore'||c.slot===s.selectedSlot)return{face:true,flip:1};
   const k=Math.max(0,Math.min(1,(s.phaseT-.84)/.20));return{face:k>=.5,flip:Math.abs(Math.cos(k*Math.PI))};
  }
  if(s.pocketed&&c.id===s.pocketCardId)return{face:false,flip:1};
  if(s.phase==='flip'){const k=Math.min(1,s.phaseT/KRRoyalShuffleRules.rules.flipTime);face=k<.5;flip=Math.abs(Math.cos(k*Math.PI));}
  if(s.phase==='reveal'||s.phase==='result'){
   if(s.pocketed&&!s.caught&&(c.id===s.pocketCardId||c.slot!==s.selectedSlot))return{face:false,flip:1};
   const delay=c.slot===s.selectedSlot?0:c.role==='QUEEN'?.45:.68,k=s.phase==='result'?1:Math.max(0,Math.min(1,(s.phaseT-delay)/.46));face=k>=.5;flip=Math.abs(Math.cos(k*Math.PI));
  }return{face,flip};
 }
 function cards(s,heldPass=false){
  const ordered=KRRoyalShuffleRules.visibleCards(s).map(c=>({c,p:KRRoyalShuffleRules.trajectory(s,c)})).sort((a,b)=>a.p.layer-b.p.layer||a.p.y-b.p.y);
  // Exactly one draw per physical card. A lifted card leaves its old spot empty.
  for(const {c,p} of ordered){const st=cardState(s,c),t=p.pocketAmount||0;
   const held=c.id===s.pocketCardId&&(!!KRRoyalShuffleRules.caughtDisplay(s)||s.phase==='restore'&&!!s.restoreFrom);
   if(!!held!==heldPass)continue;
   const front=c===s.spare?Math.max(0,Math.min(1,(270-p.x)/60)):c.id===s.pocketCardId?1:0;
   const proof=s.phase==='pocketReveal'&&c.id===s.pocketCardId,k=proof?Math.min(1,s.phaseT/.4):0;
   g.save();if(t>0){g.beginPath();g.rect(p.x-60,p.y-100,120,100+(-26+32*front)*t+100*(1-t));g.clip();}
   card(c,p,proof?k>=.5:st.face,proof?Math.abs(Math.cos(k*Math.PI)):st.flip,(t===0&&s.phase==='choose'&&c.slot===s.cursorSlot)||(['reveal','result'].includes(s.phase)&&st.face&&c.role==='QUEEN'));g.restore();
  }
  // The same live coat pocket overlaps the lower card, never a duplicate sprite.
  if(!heldPass&&ordered.some(({p})=>p.pocketAmount>.9&&Math.abs(p.x-210)<2)){R(194,323,32,3,'#483442');R(194,323,32,1,'#ddb668');}
  if(!heldPass&&s.phase==='choose')for(let i=0;i<3;i++)T(String(i+1),172+i*68,457,12,i===s.cursorSlot?'#ffe3a0':'#d5b497');
 }
 function drawCutscene(){R(0,80,480,640,'#896a45');const im=window.KREventVisuals?.peek('royal-shuffle');if(im){g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,0,80,480,640);g.restore();return true;}return false;}
 // Move the viewer closer, not the actor relative to the table. UI stays unscaled.
 const camera=Object.freeze({x:240,y:310,zoom:1.24});
 const toScreen=p=>({x:camera.x+(p.x-camera.x)*camera.zoom,y:camera.y+(p.y-camera.y)*camera.zoom});
 const toWorld=p=>({x:camera.x+(p.x-camera.x)/camera.zoom,y:camera.y+(p.y-camera.y)/camera.zoom});
 function world(s,lit=true){
  g.save();try{g.beginPath();g.rect(0,80,480,640);g.clip();g.translate(camera.x,camera.y);g.scale(camera.zoom,camera.zoom);g.translate(-camera.x,-camera.y);
   drawCutscene();actor(s,lit,'body');table();cards(s);actor(s,lit,'front');cards(s,true);
  }finally{g.restore();}
 }
 function button(r,label,disabled=false){cut(r.x,r.y+4,r.w,r.h,'#493427');cut(r.x,r.y,r.w,r.h,disabled?'#897b59':'#dcc48c');R(r.x+8,r.y+3,r.w-16,3,disabled?'#a09572':'#ffdfaa');T(label,r.x+r.w/2,r.y+r.h/2+5,13,'#483124',r.w-16);}
 function pocketHit(pt){const p=toWorld(pt),q=KRRoyalShuffleRules.pocket;return Math.abs(p.x-q.x)<=22&&p.y>=q.y-28&&p.y<=q.y+18;}
 function draw(){const s=findQueenGame;if(!s)return;g.save();try{
  R(0,-PAD_TOP,480,800+PAD_TOT,'#29241d');world(s);
  R(0,-PAD_TOP,480,80+PAD_TOP,'#29241d');T('ROYAL SHUFFLE',240,27,22);T('TWO KINGS. ONE QUEEN. WATCH THE HANDS.',240,47,9,'#c9b488');
  button(MINIGAME_BACK_BTN,'< BACK');button({...PAUSE_BTN,y:PAUSE_BTN.y+uiTop},'II');
  cut(146,96,188,29,'#352a23');T(s.hand?'HAND '+s.hand+' / 3':'THE VELVET FOX',240,115,12);
  T('YOU  '+s.you,85,160,12);T('FOX  '+s.dealer,397,160,12);
  for(let i=0;i<2;i++){crown(72+i*24,179,7,i<s.you?'#e9c778':'#776347');crown(384+i*24,179,7,i<s.dealer?'#e9c778':'#776347');}
  const titles={restore:'BACK ON THE TABLE',coverup:'“JUST A KING. SHALL WE?”',pocketReveal:'“LOOKING FOR THIS KING?”',memorize:'REMEMBER THE RED QUEEN',flip:'FACE DOWN',shuffle:'FOLLOW THE LADY',settle:'YOUR CALL',surprise:'“HOW DID YOU SEE THAT?”',choose:'WHERE IS THE QUEEN?',reveal:s.caught?'CAUGHT RED-HANDED':'LET US SEE…'};
  if(s.phase==='intro'){
   cut(25,554,430,94,'#342b24');T('BEST OF THREE',240,576,17);
   T('Follow the queen. Win two hands.',240,597,11);
   T('Double lifts, hand-offs, false drops. Trust the cards.',240,615,10);
   T('Queen on the table? Pick it. In his pocket? Tap it.',240,633,10);
   button(FIND_QUEEN_START_BTN,'DEAL THE CARDS');T('Do not fall for a king tucked into his pocket.',240,741,10);
  }else if(s.phase==='result'){
   cut(25,551,430,96,'#342b24');T(s.pocketCaught?'“THAT WAS NOT SUPPOSED TO HAPPEN!”':s.caught?'CAUGHT RED-HANDED':s.won?'THE LADY IS YOURS':'A KING. NOT THE LADY.',240,577,17);
   T(s.matchOver?(s.you===2?'YOU WIN THE MATCH.':'THE FOX TAKES THE MATCH.'):'YOU '+s.you+'  —  FOX '+s.dealer,240,602,12);
   T(s.matchOver?'“Shall we make it another?”':'Next hand: quicker hands, same honest eyes.',240,624,10);
   button(FIND_QUEEN_REPLAY_BTN,s.matchOver?'PLAY AGAIN':'NEXT HAND');
  }else{
   cut(25,551,430,53,'#342b24');T(titles[s.phase]||'',240,574,15);T(s.notice||(s.phase==='choose'?'Tap a card · 1 / 2 / 3 · arrows + Enter':'Follow the edges, not the empty hand.'),240,594,9);
  }
 }finally{g.restore();}}
 window.KRRoyalShuffle={assetId:'royal-shuffle',drawCutscene,draw,world,actor,pose,materials,table,cards,card,cardState,pocketHit,camera,toScreen,toWorld};
})();
