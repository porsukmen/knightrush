/* Autumn Caravan: existing live merchant/rigs, managed environment plate and
   native themed road props. No stock, price, collision or route rule changes. */
(()=>{
 'use strict';if(window.KRAutumnCaravan)return;
 const P=expPoly,R=expRect,L=expSegment;
 const light=Object.freeze({
  '#e1bc8d':'#f3c78f','#c99e72':'#dba66d','#986c53':'#886b55',
  '#e7bf8d':'#ffd395','#edcda0':'#ffdaa0','#b7895e':'#bd8c5c',
  '#cba173':'#dfb078','#ecd0a0':'#ffe0a2','#d1b588':'#e7be83',
  '#eee0b4':'#ffdfa1','#e3b688':'#f2c58b','#b48b65':'#c09767',
  '#467f80':'#438f85','#265760':'#215d62','#193f4b':'#183e45',
  '#b96263':'#d16c51','#b15e60':'#ce684f','#8c3b47':'#a03940',
  '#883b49':'#a13d42','#653441':'#62323c','#6a3343':'#60343d',
  '#753744':'#87473f','#a55158':'#bd6853','#c88174':'#df9b77',
  '#e6d6ad':'#ffdfa4','#dfcaa4':'#dcc599','#bcaa86':'#c9b288',
  '#b7a080':'#a5a184','#f0e0b7':'#ffebb4','#b76a67':'#d48364',
  '#753946':'#86453c','#a35256':'#b9644f','#492c39':'#3b3535',
  '#d1c29a':'#e3c997','#b6a781':'#ccb17c','#9c906e':'#a3946b',
  '#665f49':'#4d5a4b','#734f30':'#845832','#91663b':'#a47740',
  '#c09a61':'#dfb46c','#b0874b':'#c89750','#714326':'#84532d',
  '#5a7774':'#658e80','#91a18a':'#b0bc8e','#334f50':'#354d49',
  '#ac8553':'#c79756','#765131':'#875b35','#d2b886':'#efd099',
  '#15231b':'#655638','#14231b':'#655638',
  '#69958b':'#75aa91','#60422d':'#70462c','#795335':'#966132',
  '#b08650':'#d4a05c','#a87c46':'#bd8a46'
 });
 let sceneLighting=false;
 const material=c=>sceneLighting?(light[c]||c):c;
 function withLighting(draw,enabled=true){
  const previousLighting=sceneLighting;sceneLighting=enabled;
  if(!enabled){try{return draw();}finally{sceneLighting=previousLighting;}}
  const orig=[rigPolygon,rigSegment,rigJoint,px,townInk,townStroke],map=c=>light[c]||c;
  try{
   rigPolygon=(v,c)=>orig[0](v,map(c));rigSegment=(a,b,c,d,w,k)=>orig[1](a,b,c,d,w,map(k));
   rigJoint=(x,y,s,c)=>orig[2](x,y,s,map(c));px=(x,y,w,h,c)=>orig[3](x,y,w,h,map(c));
   townInk=(v,c,e,w)=>orig[4](v,map(c),map(e),w);townStroke=(v,c,w)=>orig[5](v,map(c),w);
   return draw();
  }finally{[rigPolygon,rigSegment,rigJoint,px,townInk,townStroke]=orig;sceneLighting=previousLighting;}
 }
 function drawCutscene(){
  const image=window.KREventVisuals?.peek('autumn-caravan');if(!image)return false;
  g.save();try{
   R(0,-PAD_TOP,480,800+PAD_TOT,'#30241e');
   // One aspect-preserving cover crop, bottom anchored. Do not repeat a canopy
   // strip above it: that creates a hard horizontal seam on tall phones.
   g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
   const height=590+PAD_TOP,scale=Math.max(480/image.width,height/image.height),sw=480/scale,sh=height/scale;
   g.drawImage(image,(image.width-sw)/2,image.height-sh,sw,sh,0,-PAD_TOP,480,height);return true;
  }finally{g.restore();}
 }
 function button(r,label,enabled=true){
  const {x,y,w,h}=r;
  P([[x+5,y+4],[x+w-5,y+4],[x+w,y+9],[x+w,y+h],[x+w-5,y+h+5],[x+5,y+h+5],[x,y+h],[x,y+9]],'#241b17');
  P([[x+5,y],[x+w-5,y],[x+w,y+5],[x+w,y+h-5],[x+w-5,y+h],[x+5,y+h],[x,y+h-5],[x,y+5]],enabled?'#ead7ac':'#b3a185');
  L(x+8,y+3,x+w-8,y+3,2,'#fff0cc');L(x+8,y+h-3,x+w-8,y+h-3,2,'#a27a43');
  smithText(label,x+w/2,y+h/2+5,13,enabled?'#503720':'#756853',w-12);
 }
 function price(r,prefix,amount,enabled=true){button(r,'',enabled);merchantGoldLabel(amount,r.x+r.w/2,r.y+r.h/2+5,13,enabled?'#503720':'#756853',prefix,r.w-16);}
 const UI={item:i=>({x:24+i*110,y:441,w:102,h:111}),
  buy:{x:30,y:687,w:255,h:43},reroll:{x:297,y:687,w:153,h:43},
  addGold:{x:30,y:740,w:200,h:24},reset:{x:250,y:740,w:200,h:24},
  leave:lab=>({x:140,y:lab?775:750,w:200,h:lab?25:36})};
 function withRoadFacing(draw){
  // A mild yaw towards the road (screen left), not an in-plane lean. Front
  // details move around the rounded head/belly; their side planes stay broad.
  // Scope to this candidate: the approved merchant and shop pose are untouched.
  const orig=[rigPolygon,rigSegment,rigJoint,px];
  const xAt=(x,y)=>{
   const head=clamp((-y-1)/3,0,1),radius=21-13*head;
   const depth=(3.8-1.1*head)*Math.max(0,1-Math.pow(Math.abs(x)/radius,2));
   return x*.92-depth;
  };
  try{
   rigPolygon=(v,c)=>orig[0](v.map(([x,y])=>[xAt(x,y),y]),c);
   rigSegment=(x,y,a,b,w,c)=>orig[1](xAt(x,y),y,xAt(a,b),b,w*.94,c);
   rigJoint=(x,y,size,c)=>orig[2](xAt(x,y),y,size*.94,c);
   px=(x,y,w,h,c)=>orig[3](xAt(x,y),y,Math.max(w*.65,xAt(x+w,y)-xAt(x,y)),h,c);
   return draw();
  }finally{[rigPolygon,rigSegment,rigJoint,px]=orig;}
 }
 function actor(s,front=false){
  // Native seated legs must share the upper body's local material lighting.
  const P=(v,c)=>expPoly(s.roadFacing?v.map(([x,y])=>[165+(x-165)*.92,y]):v,material(c));
  // The accepted head, clothes and live upper-body rig remain unchanged. A
  // seated lower body gives the belly a real lap instead of hiding it at a desk.
  if(!front){
   P([[76,442],[94,410],[134,396],[180,397],[220,408],[247,439],[228,457],[103,459]],'#776342');
   P([[85,432],[90,414],[116,399],[151,402],[170,429],[142,448],[106,446]],'#467f80');
   P([[177,402],[208,399],[232,415],[240,435],[214,451],[172,444],[150,426]],'#265760');
   P([[94,414],[116,399],[138,402],[131,411],[107,421],[98,435],[85,432]],'#69958b');
   P([[210,410],[230,421],[240,435],[214,451],[170,443],[183,433],[211,434]],'#193f4b');
   // Overlapping shins and turned boots: two bent legs, not a standing skirt.
   P([[102,437],[127,431],[187,440],[193,453],[174,459],[117,450]],'#265760');
   P([[216,431],[197,428],[143,442],[139,454],[158,459],[214,446]],'#467f80');
   P([[179,442],[193,440],[207,446],[210,455],[202,461],[179,458]],'#60422d');
   P([[125,442],[140,442],[145,451],[141,457],[119,460],[111,455],[111,449]],'#795335');
   L(115,448,134,446,3,material('#b08650'));L(185,446,200,451,3,material('#a87c46'));
  }
  g.save();g.translate(3,154);g.scale(.72,.72);
  if(s.roadFacing)withRoadFacing(()=>drawWanderingMerchant(s,front));
  else drawWanderingMerchant(s,front);
  g.restore();
 }
 function blanket(){
  // A cloth resting on the clearing, with a few low folds and a thin hem.
  // No vertical apron, wood edge or legs: the earth stays visible around it.
  P([[63,446],[410,447],[464,567],[436,580],[23,578],[16,566]],'#806044');
  P([[62,440],[407,442],[454,559],[443,570],[24,568],[21,559]],'#a34343');
  P([[62,440],[82,441],[46,558],[25,566],[21,559]],'#c56b53');
  P([[386,442],[407,442],[454,559],[443,570],[426,564]],'#73343c');
  P([[24,558],[188,562],[293,558],[444,560],[443,570],[24,568]],'#823637');
  L(67,446,402,448,2,'#d7a75f');L(34,559,436,562,2,'#d7a75f');
  L(67,446,34,559,1.5,'#d7a75f');L(402,448,436,562,1.5,'#b78148');
  for(let i=0;i<17;i++)L(31+i*25,569,30+i*25,574+(i%3),1.5,'#c3a273');
  // Coin purse and a neatly folded spare cloth belong beside the trader.
  P([[263,407],[281,407],[290,422],[286,438],[262,440],[255,429]],'#997047');
  L(263,412,282,412,3,'#d4ad67');L(273,413,276,426,1,'#594735');
  P([[298,425],[331,424],[343,435],[336,444],[298,442]],'#698b85');
  L(304,428,330,428,2,'#a8b69a');
 }
 // A separate candidate carriage: do not overwrite the approved merchant or
 // the town's original wagon. All coordinates below are canvas units.
 const wheelRings=new Map(); // Four fixed wheels, twenty small immutable rings.
 function carriageWheel(x,y,r,far=false){
  const ring=(radius,dx=0)=>{
   const key=x+','+y+','+radius+','+dx;
   if(!wheelRings.has(key))wheelRings.set(key,Array.from({length:12},(_,i)=>[x+dx+Math.cos(i*Math.PI/6)*radius*.8,y+Math.sin(i*Math.PI/6)*radius]));
   return wheelRings.get(key);
  };
  P(ring(r,5),'#293938');P(ring(r),far?'#695a3a':'#cea858');
  P(ring(r-3),'#384b48');P(ring(r-6),'#4d3830');
  P(ring(r-9),'#756040');
  if(far)return; // The chassis occludes their hubs/spokes; keep only the rim.
  for(let i=0;i<8;i++){const a=i*Math.PI/4;
   L(x,y,x+Math.cos(a)*(r-7)*.8,y+Math.sin(a)*(r-7),4,far?'#857045':'#cc934e');
   L(x-1,y-1,x+Math.cos(a)*(r-9)*.8-1,y+Math.sin(a)*(r-9)-1,1,'#e5c582');
  }
  P([[x-6,y-4],[x+3,y-6],[x+8,y-1],[x+6,y+5],[x-4,y+6],[x-7,y+1]],'#e6c678');
  R(x-2,y-2,5,5,'#53635a');
 }
 // One cabinet-space projection for ALL architectural planes. x runs along
 // the chassis, z recedes across it, h is height. Fixed vectors preserve the
 // same depth direction in the roof, front door, window frames and plinth.
 const wagonPoint=(x,z,h)=>[50+x*.85+z*1.1,285+x*.12-z*.34-h*(1+x*.0007)];
 const wagonPanels=(()=>{
  const out=[],face=(v,c)=>out.push({v:v.map(p=>wagonPoint(...p)),c});
  const side=(x0,h0,x1,h1,c,z=0)=>face([[x0,z,h0],[x1,z,h0],[x1,z,h1],[x0,z,h1]],c);
  const end=(z0,h0,z1,h1,c)=>face([[210,z0,h0],[210,z1,h0],[210,z1,h1],[210,z0,h1]],c);
  side(-8,8,218,22,'#463c30');
  face([[218,0,8],[218,76,8],[218,76,22],[218,0,22]],'#2e3c35');
  side(0,22,210,125,'#287f79');end(0,22,76,125,'#23554f');
  side(4,26,21,123,'#499c8c');side(24,68,195,120,'#369b95');
  for(const x of [35,116]){
   side(x-4,69,x+58,121,'#dfb766');side(x,74,x+54,117,'#253f47');
   side(x+4,78,x+50,113,'#729f98');
   face([[x+4,0,113],[x+22,0,113],[x+4,0,94]],'#b7d2ae');
   face([[x,0,117],[x+17,0,117],[x+13,0,98],[x+5,0,88],[x,0,74]],'#ab4d55');
   face([[x+38,0,117],[x+54,0,117],[x+54,0,74],[x+48,0,87],[x+43,0,99]],'#732e46');
   side(x+26,74,x+29,117,'#bc9853');side(x,92,x+54,95,'#d4b06c');
   side(x-5,66,x+59,70,'#f0cd80');
   side(x-3,28,x+58,60,'#143f42');side(x,31,x+55,57,'#b85850');
   side(x+5,35,x+50,53,'#793d44');
   face([[x+27,0,55],[x+39,0,44],[x+27,0,33],[x+15,0,44]],'#d3a85c');
   face([[x+27,0,51],[x+34,0,44],[x+27,0,37],[x+20,0,44]],'#47a097');
  }
  for(const x of [4,24,200])side(x,24,x+4,125,'#dab165');
  side(0,22,210,27,'#e1b46b');end(0,22,76,27,'#aa8148');
  // The front door is on the end plane, not a differently skewed side panel.
  end(17,28,64,116,'#b58e50');end(21,28,60,112,'#142e32');
  face([[210,21,112],[210,35,112],[210,36,83],[210,26,54],[210,23,29]],'#a94455');
  end(23,77,35,80,'#ebc674');end(64,27,68,124,'#c59c57');
  // Extruded barrel cross-section. Every rib follows these exact same planes.
  const arch=[[0,125],[8,154],[23,171],[45,177],[65,160],[76,125]];
  for(let i=arch.length-2;i>=0;i--){
   const [z,h]=arch[i],[z2,h2]=arch[i+1];
   face([[-9,z,h],[219,z,h],[219,z2,h2],[-9,z2,h2]],['#343e68','#576b9b','#7a85b3','#4a577f','#343e68'][i]);
  }
  face(arch.map(([z,h])=>[219,z,h]),'#225c5b');
  // The visible arched front is a real cross-section, not a thin triangular
  // cap. A broad brass rim follows the same roof section around the doorway.
  for(let i=0;i<arch.length-1;i++){
   const [z,h]=arch[i],[z2,h2]=arch[i+1];
   face([[219,z,h],[219,z2,h2],[219,z2,h2-5],[219,z,h-5]],i<3?'#ecc778':'#b58b4b');
  }
  face([[219,38,157],[219,46,147],[219,38,137],[219,30,147]],'#cda35a');
  face([[219,38,153],[219,42,147],[219,38,141],[219,34,147]],'#509387');
  for(const x of [15,99,187])for(let i=0;i<3;i++){
   const [z,h]=arch[i],[z2,h2]=arch[i+1];
   face([[x,z,h+.2],[x+2.4,z,h+.2],[x+2.4,z2,h2+.2],[x,z2,h2+.2]],i===0?'#d6b069':'#eed292');
  }
  side(-9,110,219,125,'#9d4156');side(-9,122,219,126,'#f0c879');side(-9,109,219,112,'#dba258');
  face([[219,0,110],[219,76,110],[219,76,125],[219,0,125]],'#81394b');
  face([[219,0,122],[219,76,122],[219,76,126],[219,0,126]],'#b68d50');
  // Retained vector paths, not another bitmap: no per-frame projection/RNG.
  return out.map(({v,c})=>{const path=new Path2D();v.forEach(([x,y],i)=>i?path.lineTo(x,y):path.moveTo(x,y));path.closePath();return {path,c};});
 })();
 function luxuryWagon(){
  g.save();g.globalAlpha*=.22;
  P([[48,315],[128,290],[331,318],[318,331],[231,355],[62,327]],'#483d29');g.restore();
  carriageWheel(159,262.8,31,true);carriageWheel(300,282.7,33,true);
  L(75.5,288.6,159,262.8,7,'#596052');L(216.6,308.5,300,282.7,7,'#596052');
  for(const panel of wagonPanels){g.fillStyle=panel.c;g.fill(panel.path);}
  g.save();g.translate(0,50);wagonFrontFittings();g.restore();
  carriageWheel(75.5,288.6,35);carriageWheel(216.6,308.5,38);
  // Tight tyre contacts on the same sloping ground plane as the wheel bottoms.
  g.save();g.globalAlpha*=.32;
  for(const [x,y]of [[75.5,323.6],[216.6,346.5]])P([[x-11,y-1],[x+9,y-1],[x+12,y+2],[x-9,y+3]],'#42392a');
  g.restore();
 }
 function wagonFrontFittings(){
  P([[273,239],[304,224],[338,239],[310,254]],'#c08e52');
  P([[310,254],[338,239],[338,246],[310,261]],'#654b35');
  // Raised coachman's seat meets his seated pelvis; the lower board is a deck,
  // not the seat. Both seat posts terminate on that deck.
  L(310,213,314,240,5,'#765539');L(330,210,334,238,5,'#765539');
  P([[299,208],[323,204],[339,211],[315,217]],'#d4ab69');
  P([[315,217],[339,211],[339,216],[315,222]],'#88633f');
  L(311,260,318,279,5,'#544733');L(334,248,343,271,5,'#544733');
  P([[310,279],[345,268],[355,275],[319,287]],'#c19a61');
  // Small lantern is physically hung from the front corner, no glow pass.
  L(289,153,303,157,3,'#674f34');L(301,156,301,171,2,'#c49c55');
  P([[293,175],[301,168],[309,175],[309,194],[301,199],[293,194]],'#554733');
  P([[296,177],[306,177],[306,191],[301,195],[296,191]],'#e7be70');
  L(301,176,301,195,2,'#9a7745');
 }
 function caravanHorse(){
  const main='#936036',lit='#c38b4a',shade='#644631',dark='#3c332c';
  // Hoof plane follows the chassis' ground direction instead of a separate
  // horizontal screen baseline. Rear and front feet now share its perspective.
  g.save();g.translate(404,305);g.transform(1,.162,0,1,0,0);
  g.save();g.globalAlpha*=.3;
  P([[-47,66],[-23,57],[49,55],[73,65],[47,75],[-30,76]],'#826c48');
  g.restore();
  // Far legs, tail and belly: squared joints and real weight-bearing hooves.
  P([[-28,13],[-18,16],[-15,40],[-8,61],[-17,64],[-26,43]],shade);
  P([[27,10],[36,11],[39,40],[48,60],[39,64],[30,43]],shade);
  R(-19,59,15,7,dark);R(37,59,16,7,dark);
  const tail=Math.sin(perfNow*1.3)*2;
  P([[-41,-10],[-49,-1],[-50,23],[-56+tail,42],[-50+tail,50],[-42+tail,40],[-43,19],[-39,4]],dark);
  P([[-43,-11],[-29,-24],[16,-24],[35,-14],[40,4],[30,25],[-24,26],[-42,16]],main);
  P([[-43,-11],[-29,-24],[16,-24],[27,-19],[-25,-16],[-35,-4],[-36,13],[-42,16]],lit);
  P([[-26,17],[18,18],[35,8],[30,25],[-24,26]],shade);
  P([[-34,10],[-20,17],[-23,42],[-28,65],[-41,65],[-34,40]],main);
  P([[-34,10],[-28,14],[-29,40],[-34,60],[-39,61],[-34,40]],lit);
  P([[23,9],[36,6],[34,40],[29,65],[17,65],[23,39]],main);
  L(26,22,26,55,3,lit);
  P([[-42,61],[-27,61],[-23,68],[-25,72],[-43,72]],dark);
  P([[17,61],[31,61],[37,68],[34,72],[16,72]],dark);
  // Strong rising neck and broad muzzle, not a miniature stick-figure horse.
  P([[14,-14],[23,-43],[35,-63],[46,-60],[53,-41],[41,-4],[32,13],[18,7]],main);
  P([[23,-43],[35,-63],[42,-61],[32,-40],[25,-15],[17,-10]],lit);
  P([[23,-48],[33,-67],[42,-66],[38,-55],[33,-42],[29,-21],[21,-12],[19,-25]],dark);
  P([[35,-61],[52,-62],[58,-51],[72,-43],[73,-29],[64,-25],[48,-36],[38,-37]],main);
  P([[36,-60],[49,-60],[51,-53],[42,-51],[41,-39],[38,-37]],lit);
  P([[61,-43],[72,-43],[73,-29],[64,-25],[60,-31],[67,-33],[66,-39]],shade);
  P([[38,-61],[34,-75],[41,-73],[45,-61]],lit);
  P([[48,-61],[48,-75],[55,-71],[54,-59]],main);
  R(52,-52,3,3,'#273333');R(67,-33,3,2,dark);
  P([[46,-55],[49,-54],[51,-44],[49,-40],[46,-43]],'#e9d6aa');
  // Proper draft collar, traces, girth and bridle. Warm brass, dark leather.
  L(32,-40,20,-8,8,'#3c3e32');L(33,-39,23,-9,2,'#dcb56e');
  P([[-9,-21],[-2,-21],[-1,23],[-8,23]],'#483e2e');
  R(-8,-14,5,5,'#d3b06b');
  L(-37,9,-6,14,4,'#554530');L(-6,14,23,2,4,'#554530');
  L(50,-57,58,-34,3,'#4d3d2d');L(58,-35,72,-37,3,'#d1b275');
  R(57,-35,4,4,'#e5c47c');g.restore();
 }
 function raggedDriver(){
  // Thin, hunched and patched: seated pelvis, knees, feet and reins all meet
  // physical supports. Head idle is local; planted feet do not drift.
  P([[306,208],[318,207],[334,222],[334,245],[327,247],[325,227],[310,218]],'#554d43');
  P([[315,209],[325,207],[344,219],[347,240],[340,244],[337,224],[320,220]],'#6e6850');
  L(331,235,331,260,4,'#a78e64');L(344,233,347,251,4,'#bf9d71');
  P([[327,258],[334,258],[343,263],[343,267],[328,267]],'#4a4032');
  P([[343,250],[350,249],[358,252],[358,256],[346,258]],'#4a4032');
  P([[306,170],[313,166],[322,178],[326,192],[325,211],[318,215],[314,211],[309,215],[305,209],[302,192]],'#888170');
  P([[306,170],[311,171],[308,190],[311,208],[305,209],[302,192]],'#b1a184');
  P([[317,176],[322,178],[326,192],[325,211],[318,215],[319,194]],'#596052');
  P([[307,191],[316,190],[317,203],[307,204]],'#a68c67');
  L(309,192,315,201,1,'#675d4c');L(314,191,309,202,1,'#675d4c');
  L(309,169,312,160,4,'#b69970');
  g.save();g.translate(0,Math.sin(perfNow*1.1)*.45);
  P([[304,140],[315,138],[322,145],[321,158],[316,165],[310,165],[304,158],[302,149]],'#be9f78');
  P([[304,140],[309,139],[308,151],[312,160],[310,165],[304,158],[302,149]],'#ddbc89');
  P([[316,142],[322,145],[321,152],[326,156],[320,158],[316,165],[315,156]],'#967c5e');
  P([[301,144],[301,136],[307,132],[317,134],[322,142],[316,142],[312,138],[310,144],[306,141]],'#54483b');
  R(315,148,3,2,'#343b33');L(311,146,318,146,1,'#756147');
  L(313,160,319,159,1,'#6f5a45');
  P([[308,158],[311,158],[312,166],[316,165],[313,170],[308,167]],'#77715a');g.restore();
  // Exposed forearms and small hands hold both slack reins.
  L(308,177,316,194,5,'#b29a75');L(316,194,339,196,4,'#c4a57a');
  L(319,179,327,191,4,'#998367');L(327,191,341,194,3,'#b59b71');
  P([[336,192],[342,192],[345,196],[342,200],[337,198]],'#d0b384');
 }
 function luxuryCaravan(){
  luxuryWagon();
  townStroke([[304,302],[367,323],[421,322]],'#55442d',6);
  townStroke([[304,300],[367,321],[421,320]],'#ba8d50',2);
  caravanHorse();
  townStroke([[313,322],[365,339],[428,323]],'#8e683f',5);
  townStroke([[313,320],[365,337],[428,321]],'#d0a669',1.5);
  L(427,323,428,312,3,'#4f4231');
  g.save();g.translate(0,50);raggedDriver();g.restore();
  townStroke([[341,245],[378,274],[429,279],[462,279]],'#b79c64',1.2);
  townStroke([[340,248],[380,282],[431,285],[463,281]],'#5b5a44',1.2);
 }
 function camp(s){
  // Parked off to the right, farther away. A single transform keeps wheels,
  // shafts, horse and driver attached; none are sitting on the display cloth.
  // User-selected composition: horse at front-left, cabin at rear-right.
  // Preserve the generated composition, but render the actors/vehicle natively.
  g.save();g.translate(495,126);g.scale(-.62,.62);luxuryCaravan();g.restore();
  blanket();actor(s);actor(s,true);
 }
 function drawScene(s,sceneLit=true){
  if(!window.KRCutscenes?.draw('autumn-caravan',perfNow)){
   R(0,-PAD_TOP,480,800+PAD_TOT,'#30241e');R(0,0,480,590,'#56644b');
  }
  withLighting(()=>{
   camp(s);
  },sceneLit);
 }
 function tap(pt){
  const s=merchantShop;if(!s||mode!=='merchant'||paused||s.phase!=='browse')return false;
  for(let i=0;i<4;i++)if(pointInRect(pt,UI.item(i))){s.selected=i;s.message='';SFX.swipe();return true;}
  if(pointInRect(pt,UI.buy))return buyMerchantItem();
  if(pointInRect(pt,UI.reroll))return rerollMerchantStock();
  if(s.lab&&pointInRect(pt,UI.addGold)){gold+=100;return true;}
  if(s.lab&&pointInRect(pt,UI.reset)){openMerchantLab();return true;}
  if(pointInRect(pt,UI.leave(s.lab))){
   if(s.lab){resetRun();debugRun=false;setMode('debugcfg');}
   else{merchantShop=null;setMode(s.returnMode);}return true;
  }return false;
 }
 function drawShop(sceneLit=true){
  const s=merchantShop;if(!s)return;
  g.save();try{
   g.setTransform(viewScale,0,0,viewScale,viewX,viewY);
   drawScene(s,sceneLit);
   if(pausePhotoMode)return;
   P([[91,6],[389,6],[398,15],[389,48],[91,48],[82,15]],'#30241e');
   L(100,9,380,9,1,'#b98d4d');smithText('THE AUTUMN CARAVAN',240,33,17,'#f5dfad');
   P([[334,382],[448,382],[454,388],[448,404],[334,404],[328,398],[328,388]],'#30241e');
   merchantGoldLabel(gold,391,398,12,'#ffe4a5','',106);
   for(let i=0;i<4;i++){
    const item=s.stock[i],r=UI.item(i),x=r.x,w=r.w,cx=x+w/2,selected=i===s.selected;
    // Goods sit directly on the cloth. Only the selected item gets four small
    // brass corner marks; no display plinths or store-card backgrounds.
    if(selected)for(const side of [-1,1]){
     L(cx+side*36,507,cx+side*43,507,1.5,'#edc87b');
     L(cx+side*43,507,cx+side*43,500,1.5,'#edc87b');
    }
    if(!item.sold){
     P([[cx-28,502],[cx-20,495],[cx+23,495],[cx+29,502],[cx+20,506],[cx-20,506]],'#773b37');
     drawMerchantProp(item,cx,480-(selected?3:0),selected?1.2:1.1,false,true);
     P([[x+13,527],[x+w-13,525],[x+w-10,546],[x+11,548]],selected?'#efdcad':'#ccb88e');
     merchantGoldLabel(item.price,cx,541,12,'#503720','',w-14);
    }else{smithText('SOLD',cx,501,11,'#5c432e');}
   }
   const item=s.stock[s.selected],blocked=merchantBlock(item),active=s.phase==='handoff',rerolling=s.phase==='reroll';
   R(0,583,480,217+PAD_BOT,'#30241e');
   P([[30,601],[39,592],[441,592],[450,601],[450,675],[30,675]],'#dfc99e');
   L(41,597,438,597,2,'#fff0c9');L(42,625,438,625,1,'#b39868');
   const reveal=item.sold&&s.last===item&&(!active||s.clock>=.864);
   smithText(merchantName(item,reveal),240,619,16,'#523b24',390);
   const desc=item.kind==='heal'?'Restore up to two hearts. Not consumed at full health.':
    item.kind==='mystery'&&!reveal?'A sealed artifact from distant lands. Reroll to change the unopened parcel.':ARTIFACT_DEFS[item.id]?.desc||'No stock left.';
   g.fillStyle='#705437';g.font='11px monospace';g.textAlign='left';drawWrappedTooltipText(desc,47,641,386,14);
   smithText(s.message||blocked||'Select an item, then confirm your purchase.',240,671,9,s.message?'#914e31':'#795f3f',380);
   if(active){
    const t=clamp(s.clock/1.8,0,1),arc=Math.sin(t*Math.PI);
    drawCoin(267-t*34,489-t*87-arc*38,.4,.25);
    drawMerchantProp(s.last,230+t*10,400+t*105-arc*24,.65+t*.7,t>.48,true);
    smithText(t<.48?'"A fine choice."':'"Pleasure doing business."',240,715,13,'#ffe1a3');
   }else{
    if(!rerolling&&!item.sold&&!blocked)price(UI.buy,'BUY ',item.price);
    else button(UI.buy,rerolling?'NEW STOCK...':item.sold?'SOLD':'CANNOT BUY',false);
    const available=s.stock.some(p=>!p.sold&&p.kind!=='heal');
    price(UI.reroll,'REROLL ',merchantRerollCost(),!rerolling&&available&&gold>=merchantRerollCost());
   }
   if(s.lab){price(UI.addGold,'TEST +',100);button(UI.reset,'RESET TEST');}
   button(UI.leave(s.lab),s.lab?'BACK TO DEBUG':'BACK TO THE ROAD',!active&&!rerolling);
  }finally{g.restore();}
 }
 const layouts=new WeakMap();
 const venues=new WeakMap();
 function venueLayout(edge){
  if(!edge)return null;
  if(venues.has(edge))return venues.get(edge);
  const slot=edge.events.find(e=>e.definition==='merchant_stop');if(!slot)return null;
  // Physical camp anchors stay independent of the approach camera. Interaction
  // starts alongside the merchant, not at the old slot ahead of this pull-off.
  const siteAt=slot.at+20;
  const result={slotId:slot.id,at:siteAt,eventAt:siteAt-6,
   merchant:{at:siteAt+6,offset:9.4},caravan:{at:siteAt+18,offset:13.2},
   clearing:{from:siteAt-3,to:siteAt+24,left:6.1,right:21},
   rug:{from:siteAt+1,to:siteAt+5.5,left:7.1,right:11.7},clearances:[]};
  // Reserve both the physical camp and its narrow roadside sightline. Trees
  // immediately before the pull-off must not cover the entire parked wagon.
  for(const d of [-16,-8,0,8,16,24])for(const offset of [9,14,19])result.clearances.push({at:siteAt+d,offset});
  for(const d of [-40,-32,-24])for(const offset of [9,14])result.clearances.push({at:siteAt+d,offset});
  venues.set(edge,result);return result;
 }
 function layout(edge){
  if(layouts.has(edge))return layouts.get(edge);
  const rnd=journeyRandom(journeyKeySeed(journeyRoute.seed,'autumn:'+edge.id)),list=[],slot=edge.events.find(e=>e.definition==='merchant_stop');
  for(const side of [-1,1])for(let at=edge.pieces[0].start+25+rnd()*15;at<edge.pieces.at(-1).end-24;at+=47+rnd()*24){
   if(slot&&Math.abs(at-(slot.at+20))<38)continue;
   list.push({at,offset:side*(8.6+rnd()*1.8),kind:['leaves','wheel','bundles','berries'][list.length%4],size:.8+rnd()*.3});
  }layouts.set(edge,list);return list;
 }
 function leaves(){
  P([[-39,0],[-19,-6],[2,-4],[26,-7],[39,1],[13,7],[-22,6]],'#73503a');
  for(let i=0;i<6;i++){
   const x=-29+i*11,y=(i%3)*2;
   P([[x-9,y-3],[x-5,y-9],[x,y-7],[x+4,y-11],[x+8,y-5],[x+5,y],[x,y+3]],['#b75a2c','#d89038','#954133'][i%3]);
  }
 }
 function prop(item){
  const p=journeyDecorProjection(item);if(!p)return;
  const s=p.scale*1.4;
  g.save();try{
   if(item.kind==='seated-merchant'||item.kind==='parked-caravan'||item.kind==='goods'){
    const bottom=curvedSpriteClipY(p.z)+2;
    g.beginPath();g.rect(-VW*4,-PAD_TOP-6000,VW*9,bottom+PAD_TOP+6000);g.clip();
   }
   g.globalAlpha=p.alpha;g.translate(p.x,p.y);g.scale(s*(item.size||1),s*(item.size||1));
   if(item.kind==='seated-merchant'){
    g.scale(.55,.55);g.translate(-165,-459);
    withLighting(()=>{actor({clock:0,phase:'browse',roadFacing:true});actor({clock:0,phase:'browse',roadFacing:true},true);});return;
   }
   if(item.kind==='parked-caravan'){
    // Native cutscene art has a sloping contact baseline. Remove that slope
    // for the road billboard, then anchor the actual near tyres/hooves at y=0.
    g.scale(-.49,.49);g.translate(-260,-311.346);
    g.transform(1,-.1623,0,1,0,0);withLighting(luxuryCaravan);return;
   }
   if(item.kind==='goods'){
    drawMerchantProp({id:item.id},0,-13,.55,false,true);return;
   }
   leaves();
   if(item.kind==='wheel'){
    L(-23,-4,24,-9,13,'#63452d');L(-25,-8,22,-13,5,'#b08650');
    g.save();g.scale(1,.72);g.rotate(-.26);drawMerchantWagonWheel(0,-23,25);g.restore();
   }else if(item.kind==='bundles'){
    P([[-22,0],[-22,-22],[15,-22],[26,-14],[26,3],[14,8]],'#8e6239');
    P([[-22,-22],[15,-22],[26,-14],[-10,-14]],'#c09255');
    P([[14,-14],[26,-14],[26,3],[14,8]],'#55452f');
    for(let i=0;i<2;i++){
     const y=-23-i*12;P([[-19,y],[-19,y-9],[-11,y-14],[15,y-14],[21,y-9],[21,y],[-11,y+4]],i?'#52747a':'#996449');
     P([[-19,y-9],[-11,y-14],[15,y-14],[17,y-10],[-11,y-10],[-15,y-6]],i?'#84a19e':'#c39262');
     R(-2,y-13,4,15,'#d1b780');
    }
   }else if(item.kind==='berries'){
    for(const [x,y]of [[-18,-8],[0,-18],[19,-10]]){
     P([[x-15,y+7],[x-18,y-3],[x-8,y-17],[x+9,y-14],[x+17,y-2],[x+11,y+8]],'#405d47');
     P([[x-18,y-3],[x-8,y-17],[x+9,y-14],[x+5,y-6],[x-5,y-7]],'#718649');
     R(x-7,y-4,4,4,'#ae4f39');R(x+2,y-8,4,4,'#d98b4e');
    }
   }
  }finally{g.restore();}
 }
 function queueView(view){
  const enqueue=(at,off,data)=>{const p=view.point(at,off),c=journeyCameraPoint(p.x,p.z);if(c.depth>-6&&c.depth<SPAWN_FAR)queueWorldDraw(c.depth,prop,{...p,...data});};
  if(view.spill){enqueue(view.begin+42.5,view.onlySide*7,{kind:'leaves'});return;}
  for(const item of layout(view.edge))enqueue(item.at,item.offset,item);
  const venue=venueLayout(view.edge);
  // A roadside camp remains physically present after shopping; eventRecords
  // prevent retriggering. Ordinary depth culling retires it as we pass.
  if(venue){
   enqueue(venue.caravan.at,venue.caravan.offset,{kind:'parked-caravan',slotId:venue.slotId});
   enqueue(venue.merchant.at,venue.merchant.offset,{kind:'seated-merchant',slotId:venue.slotId});
   for(let i=0;i<3;i++)enqueue(venue.at+3,7.8+i*1.45,{kind:'goods',id:['flask','storm','venom'][i],slotId:venue.slotId});
  }
 }
 function floorDetails(view,row,a,b,edge=null,routeA=a){
  const out=[],shape=(pts,color)=>out.push({color,vertices:pts.map(([x,z])=>view.point(z,x))});
  const venue=edge&&venueLayout(edge),routeB=routeA+(b-a);
  if(venue){
   const slice=(rect,color,inset=0)=>{
    const from=Math.max(routeA,rect.from+inset),to=Math.min(routeB,rect.to-inset);
    if(from>=to)return;
    shape([[rect.left+inset,a+from-routeA],[rect.right-inset,a+from-routeA],
     [rect.right-inset,a+to-routeA],[rect.left+inset,a+to-routeA]],color);
    out.at(-1).caravanGround=true;
   };
   const from=Math.max(routeA,venue.clearing.from),to=Math.min(routeB,venue.clearing.to);
   if(from<to){
    const edgeX=d=>{
     const t=clamp((d-venue.clearing.from)/(venue.clearing.to-venue.clearing.from),0,1);
     return venue.clearing.left+(venue.clearing.right-venue.clearing.left)*Math.min(1,t*4,(1-t)*4);
    };
    shape([[venue.clearing.left,a+from-routeA],[edgeX(from),a+from-routeA],
     [edgeX(to),a+to-routeA],[venue.clearing.left,a+to-routeA]],'#b58d55');
    out.at(-1).caravanGround=true;
   }
   slice(venue.rug,'#c99b58');slice(venue.rug,'#973e42',.16);
  }
  if(Math.abs(row)%3!==0)return out;
  // Short worn cart tracks, not a continuous pair of rails. Only one in three
  // cached rows needs these additional projected details (also on phones).
  for(const x of [-2.9,2.7])shape([[x,a],[x+.085,a],[x+.085,b-.12],[x,b-.12]],'#cfaa6d');
  for(const side of [-1,1]){
   const x=side*(4.6+(Math.abs(row)%4)*.2),z=(a+b)/2;
   shape([[x-.3,z],[x-.5,z-.3],[x,z-.55],[x+.38,z-.23],[x+.28,z+.27]],'#dcb776');
  }return out;
 }
 // Cargo has true world-space depth, not a front-facing crate card.
 const models=[1,2,3].map(n=>{
  const vertices=[],faces=[],face=(pts,color)=>faces.push({ids:pts.map(p=>{vertices.push(p);return vertices.length-1;}),color,depth:0});
  for(let i=0;i<n;i++){
   const x=(i-(n-1)/2)*3.5,w=1.52,z=(i%2)*.16,h=1.55;
   face([[x-w,0,z-.85],[x+w,0,z-.85],[x+w,h,z-.85],[x-w,h,z-.85]],'#997047');
   face([[x-w,0,z+.85],[x-w,0,z-.85],[x-w,h,z-.85],[x-w,h,z+.85]],'#bd9159');
   face([[x+w,0,z-.85],[x+w,0,z+.85],[x+w,h,z+.85],[x+w,h,z-.85]],'#604832');
   face([[x-w,h,z-.85],[x+w,h,z-.85],[x+w,h,z+.85],[x-w,h,z+.85]],'#d2ad70');
   for(const y of [.12,.68,1.2])face([[x-w+.1,y,z-.86],[x+w-.1,y,z-.86],[x+w-.1,y+.045,z-.86],[x-w+.1,y+.045,z-.86]],'#644a32');
   for(const dx of [-1.12,.93]){
    face([[x+dx,.04,z-.88],[x+dx+.2,.04,z-.88],[x+dx+.2,h,z-.88],[x+dx,h,z-.88]],'#515954');
    face([[x+dx,h+.01,z-.88],[x+dx+.2,h+.01,z-.88],[x+dx+.2,h+.01,z+.86],[x+dx,h+.01,z+.86]],'#9b9e82');
   }
  }return {vertices,faces,screen:vertices.map(()=>[0,0,0])};
 });
 function hazard(o,point){
  // Explicit design exception: retain the existing connected water ponds.
  if(o.kind!=='boulder')return false;
  for(const group of obstacleLaneGroups(o.lanes)){
   const n=group.end-group.start+1,offset=((group.start+group.end)/2-1)*JOURNEY_LANE_WORLD;
   const m=models[n-1];let valid=true,clip=-Infinity;
   for(let i=0;i<m.vertices.length;i++){
    const [x,h,z]=m.vertices[i],p=point(z,x+offset),c=journeyCameraPoint(p.x,p.z);
    if(c.depth<=sceneryNearLimit()){valid=false;break;}
    const pr=journeyProjectCamera(c.side,c.depth);m.screen[i][0]=pr.x;m.screen[i][1]=pr.y-h*150/JOURNEY_LANE_WORLD*linS(pr.t);m.screen[i][2]=c.depth;clip=Math.max(clip,curvedSpriteClipY(c.depth));
   }if(!valid)continue;
   for(const f of m.faces)f.depth=f.ids.reduce((sum,i)=>sum+m.screen[i][2],0)/f.ids.length;
   m.faces.sort((a,b)=>b.depth-a.depth);
   g.save();g.beginPath();g.rect(-VW*4,-PAD_TOP-6000,VW*9,clip+PAD_TOP+6000);g.clip();
   for(const f of m.faces){g.beginPath();f.ids.forEach((i,j)=>j?g.lineTo(m.screen[i][0],m.screen[i][1]):g.moveTo(m.screen[i][0],m.screen[i][1]));g.closePath();g.fillStyle=f.color;g.fill();}g.restore();
  }return true;
 }
 window.KRAutumnCaravan={assetId:'autumn-caravan',drawCutscene,drawShop,drawScene,actor,withRoadFacing,withLighting,luxuryCaravan,UI,tap,layout,venueLayout,queueView,floorDetails,hazard};
})();
