/* Candidate daylight camp. One generated plate; native log, fire, pack and knight.
   Presentation only: event-owned rest timing and health live in KnightRush.html. */
(()=>{'use strict';
 const assetId='rest-camp',fireRect=Object.freeze({x:198,y:446,w:84,h:72}),leaveRect=Object.freeze({x:100,y:710,w:280,h:44});
 const P=(p,c)=>expPoly(p,c),R=(x,y,w,h,c)=>expRect(x,y,w,h);
 function fire(t,spent=0){
  P([[-31,5],[-22,-3],[21,-3],[35,6],[20,15],[-21,14]],'rgba(40,43,29,.25)');
  for(let i=0;i<7;i++){
   const a=i*Math.PI*2/7,x=Math.cos(a)*26,y=Math.sin(a)*9;
   P([[x-7,y-4],[x-3,y-8],[x+6,y-6],[x+8,y+2],[x-5,y+4]],i<4?'#829995':'#aebbb0');
   P([[x-7,y-4],[x-3,y-8],[x+6,y-6],[x+2,y-2]],'#cad0b1');
  }
  expSegment(-20,6,19,-3,6,'#75422c');expSegment(-19,-4,18,8,6,'#a36635');
  R(-12,0,7,3,'#e86f25');R(7,3,6,3,'#f3952e');
  const h=1-spent*.83;
  g.save();g.scale(1,h);
  const f=Math.sin(t*5)*3;
  P([[-19,4],[-22,-12],[-13,-7],[-11,-30],[0,-48+f],[6,-24],[16,-34-f],[18,-13],[22,-5],[14,8],[-10,10]],'#e35b20');
  P([[-13,5],[-13,-14],[-5,-8],[0,-33-f],[7,-12],[14,-17],[12,6],[0,10]],'#ffae2b');
  P([[-6,7],[-4,-6],[1,-18],[5,-4],[8,7]],'#ffe793');g.restore();
  for(let i=0;i<4;i++){
   const age=(t*.22+i*.25)%1,x=Math.sin(age*4+i)*7+age*7,y=-37-age*67;
   g.save();g.globalAlpha=(1-age)*.15;
   P([[x-4,y],[x-6,y-6],[x+3,y-9],[x+7,y-2],[x+2,y+5]],'#d4d9c4');g.restore();
  }
 }
 function pack(){
  P([[-19,2],[-17,-32],[-10,-39],[14,-37],[23,-26],[23,2]],'#85442c');
  P([[-17,-32],[-10,-39],[14,-37],[18,-29],[-7,-24]],'#d4903e');
  P([[-17,-27],[17,-29],[18,0],[-19,2]],'#b47732');R(-10,-30,4,31,'#f0c777');
  P([[-13,-37],[-13,-46],[18,-45],[23,-39],[18,-34]],'#276e72');R(-8,-46,4,12,'#d6b05b');
  P([[17,-28],[23,-26],[23,2],[16,1]],'#613b2b');R(-10,-13,10,7,'#5e422c');R(-8,-12,6,4,'#e6b54b');
 }
 function road(t){
  g.save();g.translate(-23,0);g.scale(.8,.8);pack();g.restore();
  g.save();g.translate(22,0);g.scale(.66,.66);fire(t);g.restore();
 }
 const materials=Object.freeze({neutral:KRJonathan.materials(),scene:KRJonathan.materials('daylight')});
 function log(){
  // Faceted bark follows a rounded trunk, with one clearly cut end.
  rigPolygon([[-16,-5],[-12,-7.5],[13,-8],[16,-5],[15,1],[12,3],[-14,3],[-17,0]],'#543723');
  rigPolygon([[-16,-5],[-12,-7.5],[13,-8],[16,-5],[12,-3],[-12,-2]],'#b27a36');
  rigPolygon([[-12,-2],[12,-3],[16,-5],[15,1],[12,3],[-13,3]],'#80502c');
  rigPolygon([[-10,-1],[-4,-2],[2,-1],[9,-3],[12,-2],[7,0],[1,0],[-4,1]],'#98612d');
  rigSegment(-8,2,1,1,.55,'#3e3025');rigSegment(4,1,12,0,.65,'#4f3221');
  rigSegment(-9,-5,-2,-6,.65,'#d19b4f');rigSegment(5,-5,12,-6,.55,'#db9a43');
  rigPolygon([[-17,-3],[-15,-6],[-12,-7],[-10,-4],[-10,0],[-12,3],[-15,2],[-17,0]],'#c98e46');
  rigPolygon([[-16,-3],[-14,-5.5],[-12,-5],[-11.3,-3],[-11.5,0],[-13,1.7],[-15,.7]],'#ebbd72');
  rigPolygon([[-14.8,-2.7],[-13.6,-4.2],[-12.2,-3.4],[-12,-.7],[-13.2,.5],[-14.6,-.4]],'#bb803b');
  rigPolygon([[-14,-2.7],[-13.3,-3.2],[-12.8,-2.2],[-12.8,-.7],[-13.5,-.3],[-14,-1.2]],'#e7b266');
  rigSegment(-16,-2,-14.8,-1.7,.35,'#744d2a');
  // One small broken branch, not decorative parallel plank lines.
  rigPolygon([[10,-7],[10,-10],[12,-11],[13,-10],[12.5,-7]],'#684225');
  rigPolygon([[10,-10],[12,-11],[13,-10],[11.7,-9.4]],'#d3a15b');
 }
 function knightPose(t,sit=0){
  sit=clamp(sit,0,1);
  const breath=Math.sin(t*.92),
   body={x:0,y:-breath*lerp(.05,.10,sit),
    lean:sit*Math.sin(t*.43)*.012},
   cs=Math.cos(body.lean),sn=Math.sin(body.lean),knees=KRJonathan.seatedPose(sit).legs,
   arms=[-1,1].map(side=>{
    // Straight standing: about six degrees of elbow flex, not outward elbows.
    // Both hanging arms follow only the small vertical breath, with no body sway.
    // Seated palms rest on the thighs just above the knees, fixed in world space.
    const kneeX=knees[side<0?0:1].kx,
     dx=kneeX-body.x,dy=.85-body.y,
     hx=lerp(side*4.10,dx*cs+dy*sn,sit),
     hy=lerp(1.18,-dx*sn+dy*cs,sit);
    return KRJonathan.reach(side,hx,hy);
   });
  return {body,arms,breath:false,gaze:{pitch:sit*(.075+.025*Math.sin(t*.54+1)),
   x:sit*.10*Math.sin(t*.29),y:sit*(.08+.04*Math.sin(t*.54+1))}};
 }
 function knight(t,sit=0,lit=true){
  sit=clamp(sit,0,1);
  g.save();g.translate(240,452);g.scale(1.22,1.22);log();g.restore();
  // Standing feet belong on the ground in FRONT of the log, not at its centre.
  // Shift back onto the seat as he bends; keep the approved shared pose intact.
  const y=lerp(470,452,sit),footY=y+(KRJonathan.seatedPose(sit).legs[0].fy+1.25)*U*1.22;
  P([[228,footY],[234,footY-2],[247,footY-2],[253,footY],[248,footY+2],[232,footY+2]],'rgba(30,40,31,.24)');
  KRJonathan.draw(240,y,1.22,{facing:'front',sit,clock:t,lighting:lit?'daylight':'neutral',...knightPose(t,sit)});
 }
 function drawCutscene(t=0){
  const im=window.KREventVisuals?.peek(assetId);if(!im)return false;
  g.save();try{g.fillStyle='#30241e';g.fillRect(0,-PAD_TOP,480,800+PAD_TOT);
   g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,0,0,480,640);return true;
  }finally{g.restore();}
 }
 function equipment(){
  // Separate ground contacts beside the log, not a floating pile of UI icons.
  P([[280,464],[285,461],[308,462],[325,466],[320,469],[288,468]],'rgba(30,40,31,.24)');
  g.save();g.translate(307,438);g.rotate(-.42);g.scale(1.22,1.22);
  drawSpatialBowProp({grip:[0,0,0],up:[0,-1,0],back:[1,0,0],string:[1.4,0,0],draw:0},
    0,p=>[p[0],p[1]],'#afcfff');g.restore();
  KRJonathan.sheathedSword(286,464,1.22,-.28,'daylight');
  // The shield occludes the lower weapons where they lean against the log.
  g.save();g.translate(297,446);g.rotate(.13);drawSerJonathanShield(0,0,0,0,1.1);g.restore();
 }
 function drawProps(context,t){
  t=context.time??t; // Scene clock freezes with pause; never restart on sitting.
  const rest=context.restT||0,sit=context.resting||context.rested?smoothStep(clamp(rest/.9,0,1)):0;
  g.save();try{
   P([[178,443],[292,444],[309,461],[254,470],[176,461]],'rgba(32,60,46,.22)');
   g.save();g.translate(171,455);g.scale(.8,.8);pack();g.restore();
   knight(t,sit);
   equipment();
   g.save();g.translate(240,496);g.scale(.94,.94);fire(t,context.rested?1:clamp((rest-1.5)/1.5,0,1));g.restore();
  }finally{g.restore();}
 }
 window.KRRestCamp=Object.freeze({assetId,fireRect,leaveRect,materials,fire,pack,road,knightPose,knight,equipment,drawCutscene,drawProps});
})();
