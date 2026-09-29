/* Forgotten Oath: seeded, session-owned rewards and code-native movable art.
   Candidate, not an approved Art Lab reference. The owner/awakening chain is deferred. */
(()=>{'use strict';
 let actorPreparation=null,actorReady=false,actorGpu=null,actorError='';
 function prepareActor(){
  if(actorPreparation)return actorPreparation;
  actorPreparation=(async()=>{
   const base='art-source/blender/jonathan-approved-v1/';
   for(const [name,symbol]of [['walk-poses.js','KRJonathanWalkPoses'],['walk-equipment.js','KRJonathanWalkEquipment'],['shield-geometry.js','KRJonathanShieldGeometry'],['walk-native.js','KRJonathanWalk']]){
    if(!await loadEventVisualModule(base+name,symbol))throw Error('Jonathan asset unavailable: '+name);
   }
   await KRJonathanWalk.prepare();
   if(BOOT_QUERY.get('renderer')!=='canvas'){
    try{
     if(!await loadEventVisualModule('assets/encounters/jonathan-gpu.js','KRGearGPU'))throw Error('GPU module unavailable');
     actorGpu=KRGearGPU.create(KRJonathanWalk.labMeshes(),()=>{KRJonathanWalk.setGpu(null);actorGpu?.dispose();actorGpu=null;});
     KRJonathanWalk.setGpu(actorGpu);
    }catch(error){actorError=String(error);console.warn('Jonathan uses Canvas fallback:',error);}
   }
  })().catch(error=>{actorError=String(error);console.warn('Jonathan animation fallback:',error);})
   .finally(()=>{actorReady=true;});
  return actorPreparation;
 }
 addEventListener('pagehide',()=>{actorGpu?.dispose();actorGpu=null;window.KRJonathanWalk?.setGpu(null);});
 const assetId='sword-clearing',P=(p,c)=>expPoly(p,c),R=(x,y,w,h,c)=>expRect(x,y,w,h,c),
  accept={x:48,y:674,w:384,h:46},leave={x:108,y:731,w:264,h:36},
  bladeRect={x:163,y:207,w:154,h:281},replaceBack={x:108,y:747,w:264,h:27};
 // Only the authored broken-blade sequence is active. Keep the other outcome
 // implementations below for later; seeds and old lab URLs cannot select them.
 function roll(seed){return 'broken';}
 function sword(x,y,s=1,broken=false,lighting='shrine'){
  KROathSwordArt.draw(g,x,y,s,broken?'broken':'decayed',lighting);
 }
 const approachDuration=6.8,coreOffset=approachDuration-2.2,
  brokenDuration=8.7+coreOffset,releaseTime=4.15+coreOffset,
  stumbleStart=9.115-coreOffset; // User-selected time in SwordAnimationLab.
 // Ground contacts are world-space. Swing feet travel in depth and lift;
 // the knees solve two fixed six-unit bones before projecting into the front view.
 function pullPose(time){
  const t=Math.max(0,time),ease=(a,b)=>smoothStep(clamp((t-a)/(b-a),0,1)),
   walk=ease(0,2.2),grasp=ease(2.2,2.8),squat=ease(2.8,3.4)*(1-ease(4.15,4.58)),
   strain=ease(3.15,3.7)*(1-ease(4.15,4.3)),pop=ease(4.15,4.32),
   balance=ease(stumbleStart,4.78)*(1-ease(5.8,6.15)),lower=ease(5.9,6.75),
   release=ease(4.20,4.40),scratch=ease(6.95,7.35)*(1-ease(8.05,8.4)),
   overhead=ease(4.15,4.58),sideOpen=ease(stumbleStart,4.88),
   hopPulse=(a,b,h)=>t>a&&t<b?Math.sin(Math.PI*(t-a)/(b-a))**2*h:0,
   hop=hopPulse(4.74,5.12,2)+hopPulse(5.22,5.56,1.2),
   travel=-64*ease(4.74,5.12)-32*ease(5.22,5.56),
   tremble=strain*(Math.sin(t*39)*.14+Math.sin(t*57)*.055),scale=2.2,k=scale*U;
  function footTrack(side){
   const steps=side<0?[[0,.48,560,540],[1.05,1.6,540,515]]:[[.5,1.03,560,527],[1.62,2.2,527,515]];
   let ground=560,height=0,stance=true;
   for(const [a,b,from,to]of steps){
    if(t>=b)ground=to;
    else if(t>=a){const u=(t-a)/(b-a);ground=lerp(from,to,smoothStep(u));height=Math.sin(u*Math.PI)**2*2.1;stance=false;break;}
   }
   // Front view: screen-left is Jonathan's RIGHT support foot.
   height+=hop;
   if(hop>0)stance=false;
   if(side>0&&balance>0){height+=3.8*balance;stance=false;}
   return {x:240+travel+side*1.9*k,y:970-ground,height,stance};
  }
  const feet=[footTrack(-1),footTrack(1)],
   x=240+travel-7*balance,
   y=(feet[0].y+feet[1].y)/2,
   body={x:tremble,y:.55+1.25*(1-ease(1.9,2.2))+1.65*squat+tremble*.3-hop,
    lean:(-.14+.045*Math.sin((t-4.7)*15))*balance},
   hip=-12+body.y;
  const legs=feet.map((f,i)=>{
   const side=i?1:-1,hx=side*1.9+body.x,hy=hip,hz=0,
    fx=(f.x-x)/k,fy=-f.height,fz=(f.y-y)/(k*.6),
    dx=fx-hx,dy=fy-hy,dz=fz-hz,d=Math.hypot(dx,dy,dz),
    off=Math.sqrt(Math.max(0,36-d*d/4)),yz=Math.max(.001,Math.hypot(dy,dz)),
    v=[side*(.25+.30*squat),-dz/yz,dy/yz],dot=(v[0]*dx+v[1]*dy+v[2]*dz)/(d*d),
    bend=[v[0]-dot*dx,v[1]-dot*dy,v[2]-dot*dz],bn=Math.hypot(...bend),
    kx=hx+dx/2+off*bend[0]/bn,ky=hy+dy/2+off*bend[1]/bn,kz=hz+dz/2+off*bend[2]/bn;
   return {hx,hy,kx,ky:ky+kz*.6,fx,fy:fy+fz*.6,
    physical:{h:[hx,hy,hz],k:[kx,ky,kz],f:[fx,fy,fz]}};
  });
  // Keep the continuous extraction arc. Once clear of the stone, the wrist
  // turns the blade INWARD and tip-up during the same upward pull.
  const blade={x:240,y:373,angle:body.lean+(-Math.PI+.08+.24*lower)*ease(4.32,4.58),scale:.52};
  const cs=Math.cos(body.lean),sn=Math.sin(body.lean),
   rightX=lerp(-4.9,-7.1,lower),rightY=lerp(-18.9,-10.5,lower),
   raisedWrist={x:x+(body.x+rightX*cs-rightY*sn)*k,
    y:y+(-12+body.y+rightX*sn+rightY*cs)*k},
   initialWrist={x:240,y:373-30*blade.scale};
  // Vertical release leads the outward arc; both share a single time curve
  // with no stopped chest-height waypoint or second acceleration.
  const wrist={x:lerp(initialWrist.x,raisedWrist.x,overhead*overhead),
   y:lerp(initialWrist.y,raisedWrist.y,overhead)};
  blade.x=wrist.x-Math.sin(blade.angle)*30*blade.scale;
  blade.y=wrist.y+Math.cos(blade.angle)*30*blade.scale;
  const grip=[-30,-49].map(yy=>({x:blade.x-Math.sin(blade.angle)*yy*blade.scale,
    y:blade.y+Math.cos(blade.angle)*yy*blade.scale}));
  const arms=grip.map((h,i)=>{
   const side=i?1:-1,dx=(h.x-x)/k-body.x,dy=(h.y-y)/k+12-body.y,
    cs=Math.cos(body.lean),sn=Math.sin(body.lean);
   // Raise beside the rock before reaching inward over its crown. The final
   // grip and extraction clock stay unchanged; only the approach path bends.
   const raise=ease(2.2,2.50),across=ease(2.46,2.8);
   let hx=lerp(side*(4.1+.9*raise),dx*cs+dy*sn,across),
    hy=lerp(lerp(-.1,-6.8,raise),-dx*sn+dy*cs,across);
   if(i===1){
    // Empty hand accompanies the right wrist through the lift, separated
    // from the hilt. Only the loss of balance sends it out to the left side.
    const counter=1-ease(5.8,6.65),
     wx=(wrist.x-x)/k-body.x,wy=(wrist.y-y)/k+12-body.y,
     followX=wx*cs+wy*sn+4.4*overhead,
     followY=-wx*sn+wy*cs-1.5+5.1*overhead,
     wave=1.7*Math.sin((t-4.88)*10.5)*balance*sideOpen,
     targetX=lerp(followX,4.2+8.6*counter,sideOpen),
     targetY=lerp(followY,-.1-9*counter+wave,sideOpen);
    hx=lerp(hx,targetX,release);hy=lerp(hy,targetY,release);
   }
   const a=KRJonathan.reach(side,hx,hy);
   // The hilt is in front of the chest. Keep an outward elbow pole throughout
   // the reach/lift instead of rotating between opposite planar IK branches.
   // Depth only supplies continuous foreshortening to the native 2D rig.
   // The released hand still travels in front of the chest until it lowers;
   // do not flatten its reach depth while passing the shoulder.
   const contact=grasp*(i===1?1-release*smoothStep(clamp((hy-a.sy)/6,0,1)):1);
   if(contact>0){
    const ax=a.hx-a.sx,ay=a.hy-a.sy,
     az=Math.min(4*contact,Math.sqrt(Math.max(0,100-ax*ax-ay*ay))),
     d2=ax*ax+ay*ay+az*az,along=(25-26.01+d2)/(2*d2),
     off=Math.sqrt(Math.max(0,25-along*along*d2)),
     // A sideways free reach opens through a low elbow, not through a
     // foreshortened wrist/elbow overlap on the horizontal shoulder line.
     free=i===1?sideOpen*(1-ease(5.8,6.65)):0,poleX=side*(1-.5*free),poleY=.6*free,
     dot=(poleX*ax+poleY*ay)/d2,nx=poleX-ax*dot,ny=poleY-ay*dot,nz=-az*dot,
     norm=Math.hypot(nx,ny,nz);
    a.ex=a.sx+ax*along+off*nx/norm;
    a.ey=a.sy+ay*along+off*ny/norm;
    a.physical={s:[a.sx,a.sy,0],e:[a.ex,a.ey,az*along+off*nz/norm],h:[a.hx,a.hy,az]};
   }
   if(i===1&&scratch>0){
    // Rotate fixed bones through the OUTSIDE arc. Interpolating IK targets
    // across the shoulder flipped the elbow inward on the previous version.
    const rest=KRJonathan.reach(-1,-4.2,-.1),target=KRJonathan.reach(-1,-3.9,-16.6+Math.sin(t*17)*.23),
     dx=target.hx-target.sx,dy=target.hy-target.sy,d2=dx*dx+dy*dy,
     along=(25-26.01+d2)/(2*d2),ex=2*(target.sx+dx*along)-target.ex,
     ey=2*(target.sy+dy*along)-target.ey,
     a0=Math.atan2(rest.ey-rest.sy,rest.ex-rest.sx),a1=Math.atan2(ey-target.sy,ex-target.sx)+Math.PI*2,
     b0=Math.atan2(rest.hy-rest.ey,rest.hx-rest.ex),b1=Math.atan2(target.hy-ey,target.hx-ex),
     upper=lerp(a0,a1,scratch),lowerAngle=lerp(b0,b1,scratch);
    a.ex=a.sx-5*Math.cos(upper);a.ey=a.sy+5*Math.sin(upper);
    a.hx=a.ex-5.1*Math.cos(lowerAngle);a.hy=a.ey+5.1*Math.sin(lowerAngle);
    delete a.physical;
   }
   return a;
  });
  const palms=arms.map(a=>{
   const cs=Math.cos(body.lean),sn=Math.sin(body.lean);
   return {x:x+(body.x+a.hx*cs-a.hy*sn)*k,y:y+(-12+body.y+a.hx*sn+a.hy*cs)*k};
  });
  return {x,y,scale,body,legs,arms,palms,feet,blade,grasp,lift:pop,strain,scratch,release,overhead,hop,balance,sideOpen,
   gaze:{pitch:.2*squat+.18*lower-.15*overhead*(1-lower),x:-.9*lower,
    y:.6*grasp*(1-overhead)-.5*overhead*(1-lower)+.35*lower},facing:'front',clock:t};
 }
 // Short footfall itinerary: stairs, a curious pause, then the clear right
 // perimeter of the rock. Each stance foot is stored in world coordinates.
 const approachSteps=[];
 for(let i=0;i<6;i++)approachSteps.push({side:i%2?1:-1,a:i*.35,b:i*.35+.32,
  x:240,y:[596,575,555,535,515,515][i]});
 for(let i=0;i<12;i++){const q=Math.min(1,(i+1)/11),angle=q*Math.PI;
  approachSteps.push({side:i%2?1:-1,a:3.8+i*.24,b:3.8+i*.24+.22,
   x:240+142*Math.sin(angle),y:485+30*Math.cos(angle)});
 }
 function approachPose(t){
  const scale=2.2,k=scale*U,smooth=(a,b)=>smoothStep(clamp((t-a)/(b-a),0,1));
  const feet=[-1,1].map(side=>{
   let x=240+side*1.9*k,y=620,height=0,stance=true;
   for(const step of approachSteps){if(step.side!==side)continue;
    const tx=step.x+side*1.9*k;
    if(t>=step.b){x=tx;y=step.y;}
    else if(t>=step.a){const u=(t-step.a)/(step.b-step.a),q=smoothStep(u);
     x=lerp(x,tx,q);y=lerp(y,step.y,q);height=Math.sin(Math.PI*u)**2*2.7;stance=false;break;
    }else break;
   }
   return {x,y,height,stance};
  });
  const x=(feet[0].x+feet[1].x)/2,y=(feet[0].y+feet[1].y)/2,
   moving=feet.some(f=>!f.stance),front=t>6.62,profile=t>=3.8&&t<6.62,
   direction=t<5.25?1:-1,body={x:0,y:.55+1.7*(t<2.12?1-smooth(1.95,2.12):t>3.8?1-smooth(6.42,6.66):0),lean:0},hip=-12+body.y;
  const legs=feet.map((f,i)=>{
   const side=i?1:-1,hx=side*1.9,hy=hip,fx=(f.x-x)/k,fy=-f.height,fz=(f.y-y)/(k*.6),
    dx=fx-hx,dy=fy-hy,dz=fz,d=Math.hypot(dx,dy,dz),off=Math.sqrt(Math.max(0,36-d*d/4)),
    yz=Math.max(.001,Math.hypot(dy,dz)),sign=front?1:-1,
    kx=hx+dx/2,ky=hy+dy/2-sign*off*dz/yz,kz=dz/2+sign*off*dy/yz;
   return {hx,hy,kx,ky:ky+kz*.6,fx,fy:fy+fz*.6,physical:{h:[hx,hy,0],k:[kx,ky,kz],f:[fx,fy,fz]}};
  });
  const glance=-1.1*smooth(2.2,2.46)+2.1*smooth(2.7,2.96)-smooth(3.2,3.48),
   arms=[-1,1].map(side=>KRJonathan.reach(side,side*4.1,-.2+(moving?Math.sin(t*8)*side*.3:0)));
  return {x,y,scale,body,feet,legs,arms,palms:[],blade:{x:240,y:373,angle:0,scale:.52},
   grasp:0,lift:0,strain:0,scratch:0,release:0,clock:t,facing:front?'front':'back',profile,direction,
   gaze:{x:glance,y:.3*smooth(3.2,3.48),pitch:.12*smooth(3.2,3.48)}};
 }
 function brokenPose(time){return time<approachDuration?approachPose(Math.max(0,time)):pullPose(time-coreOffset);}
 function drawBrokenScene(c){
  const active=c.phase==='pull',t=active?(window.KRJonathanWalk?.sceneTime(c.phaseTime)??c.phaseTime):brokenDuration,
   pose=brokenPose(t),b=pose.blade;
  const drawBlade=()=>{
   g.save();
   if(!pose.lift){g.beginPath();g.rect(0,0,480,389);g.clip();}
   else if(pose.lift<1){g.beginPath();g.rect(0,0,480,389);g.clip();}
   g.translate(b.x,b.y);g.rotate(b.angle);sword(0,0,b.scale,true);g.restore();
  };
  g.save();g.beginPath();g.rect(0,0,480,548);g.clip();
  // Shared approach/pull rig is prepared before the normal event starts moving.
  const modelWalk=window.KRJonathanWalk&&t<approachDuration,
   inFront=(modelWalk?KRJonathanWalk.info(t).y:pose.y)>485;
  if(inFront){stone(240,467,1.07,0);drawBlade();}
  if(modelWalk)KRJonathanWalk.draw(g,t,c.phaseTime);
  else if(window.KRJonathanWalk)KRJonathanWalk.drawPull(pose,t);
  else if(pose.profile){
   g.save();g.translate(pose.x,pose.y);g.scale(pose.direction,1);
   const legs=pose.legs.map(l=>({...l,hx:l.hx*pose.direction,kx:l.kx*pose.direction,fx:l.fx*pose.direction}));
   KRJonathan.side(0,0,pose.scale,{lighting:'daylight',legs,body:pose.body,walking:true,clock:t});g.restore();
  }else KRJonathan.draw(pose.x,pose.y,pose.scale,{facing:pose.facing,clock:t,breath:false,
   lighting:'daylight',shadow:true,body:pose.body,arms:pose.arms,legs:pose.legs,gaze:pose.gaze,
   backEquipment:window.KRJonathanWalk?.equipment});
  if(!inFront)stone(240,467,1.07,0);
  if(pose.grasp>0&&pose.lift>0){
   const m=KRJonathan.materials('daylight');
   g.save();
   // Before extraction the rock already occludes the actor's forearms.
   // Do not repaint them through its surface during the approach to the hilt.
   // The existing foreground release pass only starts after the blade lifts.
   if(window.KRJonathanWalk){
    // Repaint only pixels actually occluded by the rock, not a second layer of
    // antialiasing over the already-visible arm/shoulder.
    g.beginPath();stoneOutline.forEach(([x,y],i)=>g[i?'lineTo':'moveTo'](240+x*1.07,467+y*1.07));g.closePath();g.clip();
    g.beginPath();g.rect(0,0,480,360+188*pose.grasp*pose.grasp);g.clip();
   }
   g.translate(pose.x,pose.y);g.scale(pose.scale,pose.scale);
   g.translate(pose.body.x*U,(-12+pose.body.y)*U);g.rotate(pose.body.lean);
   for(let i=0;i<2;i++)if(i===0||pose.release<.01){const a=pose.arms[i];
    if(window.KRJonathanWalk){KRJonathanWalk.paintForeground(()=>KRJonathan.turnForearm(a,'daylight',false));continue;}
    rigSegment(a.ex,a.ey,a.hx,a.hy,1.65,m.steel);
    rigSegment(a.ex-.35,a.ey,a.hx-.35,a.hy,.32,m.light);
    rigJoint(a.ex,a.ey,1.6,m.dark);
   }
   g.restore();
  }
  if(!inFront)drawBlade();
  if(pose.grasp>0){
   g.save();
   // Hands pass in front of the hilt, but not through the rock. Its actual
   // crown silhouette remains the occluder until the blade is extracted.
   if(pose.lift<=0)clipAboveStone();
   for(let i=0;i<2;i++)if(i===0||pose.release<.01){
    const h=pose.palms[i];
    if(window.KRJonathanWalk)KRJonathanWalk.paintForeground(()=>KRJonathan.turnHand(h.x,h.y,pose.scale,'daylight'));
    else KRJonathan.hand(h.x,h.y,1.4,i?1:-1,'daylight');
   }
   g.restore();
  }
  // The scratching forearm lies on the near side of the helmet.
  if(pose.scratch>0){
   const a=pose.arms[1],m=KRJonathan.materials('daylight');
   g.save();g.translate(pose.x,pose.y);g.scale(pose.scale,pose.scale);
   g.translate(pose.body.x*U,(-12+pose.body.y)*U);g.rotate(pose.body.lean);
   if(window.KRJonathanWalk)KRJonathanWalk.paintForeground(()=>KRJonathan.turnForearm(a,'daylight'));
   else{rigSegment(a.ex,a.ey,a.hx,a.hy,1.65,m.steel);rigJoint(a.ex,a.ey,1.65,m.dark);
    KRJonathan.hand(a.hx*U,a.hy*U,.85,-1,'daylight');}g.restore();
  }
  g.restore();
 }
 function chip(x,y,s=1){g.save();g.translate(x,y);g.scale(s,s);
  P([[-36,-17],[-11,-37],[24,-30],[38,1],[16,34],[-25,28],[-39,3]],'#456454');
  P([[-36,-17],[-11,-37],[24,-30],[5,-6],[-15,2]],'#bdd080');
  P([[-15,2],[5,-6],[24,-30],[38,1],[16,34]],'#789157');
  P([[-8,-13],[8,-19],[15,-7],[6,3],[9,18],[-5,9],[-15,-2]],'#2bba9a');
  P([[-7,-9],[6,-14],[8,-6],[0,2],[-6,-1]],'#b4ffe0');g.restore();}
 function icon(id,x,y,s=1){if(id==='stoneheart')chip(x,y,s);else{g.save();g.translate(x,y);g.rotate(-.42);sword(0,-17*s,s*.80,id==='oath_broken','neutral');g.restore();}}
 const stoneOutline=[[-91,-9],[-83,-43],[-62,-57],[-54,-80],[-22,-94],[24,-88],[49,-68],[66,-63],[83,-32],[91,3],[68,16],[-63,18]];
 function clipAboveStone(){
  g.beginPath();g.moveTo(0,548);g.lineTo(240+stoneOutline[0][0]*1.07,467+stoneOutline[0][1]*1.07);
  for(let i=1;i<=9;i++)g.lineTo(240+stoneOutline[i][0]*1.07,467+stoneOutline[i][1]*1.07);
  g.lineTo(480,548);g.lineTo(480,0);g.lineTo(0,0);g.closePath();g.clip();
 }
 function stone(x,y,s=1,crack=0){g.save();g.translate(x,y);g.scale(s,s);
  // Broad weathered limestone masses, not a green faceted cube. Socket stays
  // at y=-72 to meet the exposed native blade; the base stays on the dais.
  P([[-86,11],[-49,-2],[66,-1],[113,20],[48,29],[-64,24]],'rgba(71,53,27,.27)');
  P(stoneOutline,'#786f50');
  P([[-54,-80],[-22,-94],[24,-88],[49,-68],[25,-53],[-24,-49],[-62,-57]],'#d6bd86');
  P([[-54,-80],[-22,-94],[-3,-91],[-26,-78],[-34,-56],[-62,-57]],'#ebd49a');
  P([[-83,-43],[-62,-57],[-24,-49],[-18,-15],[-36,10],[-63,18],[-91,-9]],'#b7a373');
  P([[-24,-49],[25,-53],[44,-30],[36,5],[-8,17],[-36,10],[-18,-15]],'#c3ac7a');
  P([[25,-53],[49,-68],[66,-63],[83,-32],[91,3],[68,16],[36,5],[44,-30]],'#8e8661');
  P([[-91,-9],[-63,4],[-36,10],[-8,17],[68,16],[91,3],[80,20],[-57,23],[-79,15]],'#756d4d');
  // A cleft starting at the sword slot continues through the front plane.
  P([[-11,-73],[0,-77],[12,-72],[3,-68]],'#3b4748');
  P([[0,-69],[-4,-59],[5,-48],[4,-31],[13,-16],[10,8],[10,-15],[1,-30],[2,-48],[-6,-59]],'#87764f');
  P([[5,-48],[22,-41],[33,-43],[22,-39],[3,-46]],'#9f8c5e');
  P([[-68,-52],[-62,-35],[-48,-27],[-57,-29],[-65,-37],[-70,-49]],'#92815a');
  P([[60,-51],[65,-35],[78,-24],[68,-28],[61,-35]],'#bca774');
  P([[-53,-78],[-44,-77],[-40,-70],[-48,-72]],'#c2aa77');
  P([[-23,-93],[-12,-90],[-22,-88],[-31,-85]],'#f0dba4');
  // Moss grows from edges and crevices, never covers entire light planes.
  P([[-80,-18],[-69,-23],[-61,-15],[-62,-4],[-49,1],[-53,12],[-72,9],[-85,1]],'#4c813e');
  P([[-79,-18],[-68,-21],[-64,-15],[-70,-9],[-81,-8]],'#8fb644');
  P([[43,7],[55,2],[62,8],[77,6],[80,16],[67,21],[40,18],[32,13]],'#517c3d');
  P([[46,7],[55,4],[60,10],[71,9],[66,14],[45,13]],'#98b94b');
  // Contact debris bridges the native stone and the illustrated landing.
  P([[-99,15],[-90,10],[-80,15],[-81,21],[-96,22]],'#9b895d');
  P([[-99,15],[-90,10],[-80,15],[-89,17]],'#d3bb80');
  P([[81,18],[90,13],[98,20],[92,25],[79,24]],'#a5905d');
  P([[81,18],[90,13],[98,20],[89,20]],'#dcc58a');
  P([[-79,20],[-67,17],[-59,22],[-65,26],[-85,26]],'#6d873a');
  P([[57,21],[68,17],[83,22],[78,26],[59,26]],'#82923b');
  if(crack>0){P([[0,-70],[7,-43],[-1,-31],[11,-14],[7,15],[2,-11],[-9,-29],[0,-44],[-4,-69]],'#303f3b');}
  g.restore();}
 function guardian(x,y,s=1,anim='idle',t=0,hurt=false){
  const tele=anim.startsWith('tele'),strike=anim.startsWith('strike'),a=clamp(t,0,1),
    drive=tele?-a*5:strike?Math.sin(a*Math.PI)*12:Math.sin(perfNow*1.1)*.7,
    rock=hurt?'#dfe8a5':'#9f9f6d',light=hurt?'#ffffff':'#d6c982',dark='#506148';
  g.save();g.translate(x,y);g.scale(s,s);
  P([[-34,3],[-17,-1],[28,0],[49,8],[31,12],[-24,10]],'rgba(28,49,37,.30)');
  if(anim==='dying'){g.globalAlpha=clamp(1-t*.36,0,1);g.translate(0,Math.min(13,t*7));}
  // Feet, knees, pelvis, broad torso. One mass per joint; no round blob joints.
  for(const side of [-1,1]){const xx=side*13;
    P([[xx-7,-34],[xx+8,-34],[xx+7,-7],[xx+11,-2],[xx+11,5],[xx-10,5],[xx-10,-7]],dark);
    P([[xx-7,-33],[xx+3,-34],[xx+2,-9],[xx-8,-7]],rock);R(xx-8,-5,15,6,light);}
  g.translate(0,drive);
  P([[-27,-79],[-15,-89],[17,-88],[30,-74],[24,-36],[13,-26],[-19,-29],[-28,-43]],dark);
  P([[-27,-79],[-15,-89],[17,-88],[25,-76],[17,-45],[-21,-43]],rock);
  P([[-27,-79],[-15,-89],[17,-88],[9,-79],[-17,-72]],light);
  P([[-15,-75],[-5,-81],[11,-76],[16,-60],[4,-48],[-11,-54]],'#466654');
  P([[-4,-75],[5,-74],[9,-65],[2,-55],[-5,-62]],'#42d1aa');R(-1,-70,4,8,'#b3ffe0');
  P([[-16,-106],[-8,-117],[13,-114],[21,-100],[16,-82],[-13,-83]],dark);
  P([[-16,-106],[-8,-117],[13,-114],[15,-103],[-12,-99]],light);
  P([[-12,-99],[15,-103],[15,-85],[-12,-87]],rock);
  R(-10,-98,8,4,'#243d36');R(5,-98,8,4,'#243d36');R(-9,-97,6,2,'#97f4ad');R(6,-97,6,2,'#97f4ad');
  P([[-10,-114],[-2,-119],[14,-116],[16,-112],[3,-110],[0,-104],[-9,-106]],'#6b9b33');
  for(const side of [-1,1]){
    const active=anim.includes(side<0?'right':'left')||anim.includes('double')||anim.includes('bite'),
      lift=active?(tele?a*22:strike?(1-a)*22:0):0,xx=side*34;
    P([[xx-10,-80],[xx+9,-82],[xx+13,-64],[xx+8,-38-lift],[xx-8,-36-lift],[xx-13,-61]],dark);
    P([[xx-10,-80],[xx+6,-82],[xx+7,-62],[xx+2,-44-lift],[xx-8,-40-lift],[xx-13,-61]],rock);
    P([[xx-11,-80],[xx+5,-85],[xx+11,-77],[xx+5,-70],[xx-12,-68]],light);
    P([[xx-11,-41-lift],[xx+10,-42-lift],[xx+14,-23-lift],[xx+6,-16-lift],[xx-13,-19-lift]],dark);
    P([[xx-11,-41-lift],[xx+6,-42-lift],[xx+8,-24-lift],[xx-12,-23-lift]],rock);R(xx-10,-39-lift,14,4,light);
  }g.restore();
 }
 function drawCutscene(){const im=window.KREventVisuals?.peek(assetId);if(!im)return false;
  g.save();try{
   g.fillStyle=KRUI.theme('treasure').dark;g.fillRect(0,-PAD_TOP,480,800+PAD_TOT);
   // V4's actual pedestal contact is at source y=808/1448, not the prompt's
   // requested height. Keep that surface under the native rock on tall phones too.
   const k=Math.max(480/im.width,(482+PAD_TOP)/(im.height*(808/1448)));
   g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
   g.drawImage(im,(480-im.width*k)/2,-PAD_TOP,im.width*k,im.height*k);return true;
  }finally{g.restore();}}
 function setPhase(c,phase){c.phase=phase;c.phaseTime=0;}
 function equip(c,index){if(c.claimed||!c.reward||index<0||index>=relics.length)return false;
  c.claimed=true;relics[index]=ARTIFACT_DEFS[c.reward].create();syncArtifactCache();
  if(c.reward==='oath_rusted')journeyRoute.oathBlade={status:'dormant',source:c.slot.id};
  setPhase(c,'claimed');SFX.relic();return true;}
 function take(c){
  if(c.claimed||!c.reward)return;
  if(hasRelic(c.reward)){c.claimed=true;awardGold(10);c.duplicate=true;setPhase(c,'claimed');return;}
  const empty=relics.findIndex(r=>!r);if(empty>=0)equip(c,empty);else setPhase(c,'replace');
 }
 function fight(c){
  c.roadState={env,obstacles,pickups,roadsideScenery};setPhase(c,'battle');
  c.openMode(()=>startBoss('oath_guardian',c));c.game=boss;player.x=player.lane=1;
 }
 function victory(c){
  if(journeyRoadEventSession?.context!==c||c.phase!=='battle'||c.game!==boss||boss?.state!=='dying')return false;
  const random=journeyRandom(journeyKeySeed(c.seed,'stoneheart-drop'));
  c.coins=18+loop*2;c.scrap=3+Math.floor(random()*3);c.reward=random()<.15?'stoneheart':null;
  awardGold(c.coins);awardScrap(c.scrap);c.paid=true;
  journeyRoadEventHandlers.get('elite_finale').dispose(c);c.game=null;
  journeyRoadEventSession.ownedMode='journeyevent';setMode('journeyevent');setPhase(c,'victory');
  requestJourneyEventVisual(c.slot,true);SFX.relic();return true;
 }
 function slotRect(i){return {x:42+(i%2)*201,y:627+Math.floor(i/2)*39,w:194,h:32};}
 function action(c,act,pt){
  if(paused||mode!=='journeyevent'||journeyRoadEventSession?.context!==c||c.phaseTime<.22)return false;
  const hit=r=>act==='tap'&&pt&&pointInRect(pt,r),yes=act==='choice1'||hit(accept),no=act==='choice2'||hit(leave)||act==='continue';
  if(c.phase==='intro'){
    if(yes||hit(bladeRect)){
     if(c.outcome==='broken'&&!actorReady){c.pullRequested=true;prepareActor().then(()=>{
      if(journeyRoadEventSession?.context===c&&c.phase==='intro'&&c.pullRequested){setPhase(c,'pull');SFX.swipe();}
     });}else{setPhase(c,'pull');SFX.swipe();}
    }
    else if(no)c.finish({status:'declined'});return true;
  }
  if(c.phase==='guardian'){if(yes)fight(c);return true;}
  if(['result','victory'].includes(c.phase)){
    if(yes&&c.reward)take(c);
    else if(no||yes&&!c.reward)c.finish({status:'completed',outcome:c.outcome,claimed:!!c.claimed,coins:c.coins||0,scrap:c.scrap||0});return true;
  }
  if(c.phase==='replace'){
    const i=relics.findIndex((r,i)=>act==='choice'+(i+1)||hit(slotRect(i)));
    if(i>=0)equip(c,i);else if(hit(replaceBack))setPhase(c,c.outcome==='guardian'?'victory':'result');return true;
  }
  if(c.phase==='claimed'&&(yes||no))c.finish({status:'completed',outcome:c.outcome,artifact:c.reward,claimed:true});
  return true;
 }
 function draw(c){
  if(mode!=='journeyevent')return;
  if(!window.KRCutscenes?.draw(assetId,c.time)){g.fillStyle=KRUI.theme('treasure').dark;g.fillRect(0,-PAD_TOP,480,800+PAD_TOT);}
  const pulling=c.phase==='pull',p=clamp(c.phaseTime/2.1,0,1),lift=pulling?smoothStep(clamp((p-.50)/.5,0,1))*117:0;
  if(c.outcome==='broken'&&c.phase!=='intro')drawBrokenScene(c);
  else if(c.phase==='guardian'){
    const rise=smoothStep(clamp(c.phaseTime/.7,0,1));
    if(rise<1)stone(240,467,1.07,1);
    g.save();g.beginPath();g.rect(0,0,480,510);g.clip();guardian(240,495+(1-rise)*190,2.1,'idle',c.time);g.restore();
  }
  else if(c.phase==='intro'||pulling){
    const tremble=pulling&&p>.17&&p<.60?Math.sin(c.phaseTime*36)*1.6:0;
    stone(240+tremble,467,1.07,p>.55&&pulling?1:0);
    // Draw only the exposed blade: it cannot show through the boulder.
    // Human-scale heirloom for the planned shared Jonathan third-person pull.
    g.save();g.beginPath();g.rect(0,0,480,389);g.clip();sword(240+tremble,373-lift,.52,false);g.restore();
    if(pulling){const enter=smoothStep(clamp(p/.2,0,1)),hy=301-lift+115*(1-enter);
      const m=KRJonathan.materials('daylight');
      P([[276,553],[310,544],[255,hy+8],[231,hy+16]],m.dark);
      P([[276,553],[292,548],[249,hy+9],[231,hy+16]],m.steel);
      expSegment(276,546,236,hy+22,6,m.light);KRJonathan.hand(240,hy,2.2,-1,'daylight');
    }
  }else if(c.reward){icon(c.reward,240,381,c.reward==='stoneheart'?1.75:1.38);}
  else{stone(240,471,1.05,1);}
  if(paused&&pausePhotoMode)return;
  const ui=KRUI.theme('treasure'),paper={x:26,y:548,w:428,h:240};
  // Treasure's sheet() contract: the lower UI ground starts 12 units inside
  // the parchment, independently of where the environment bitmap ends.
  R(0,paper.y+12,480,800+PAD_TOT-paper.y-12,ui.dark);
  KRUI.sheet(g,paper,'treasure');
  const heading=c.phase==='intro'||pulling?'THE FORGOTTEN OATH':c.phase==='guardian'?'THAT WAS NOT A STONE.':
    c.phase==='victory'?'THE STONE FALLS SILENT':ARTIFACT_DEFS[c.reward]?.name||'THE FORGOTTEN OATH';
  KRUI.text(g,heading,240,584,19,ui.ink,390);
  let lines=c.phase==='intro'?['A worthy hand shall draw the blade.','Probably.']:pulling?['The hilt gives. The stone trembles.']:c.phase==='guardian'?['Something beneath the moss opens its eyes.']:
    c.phase==='replace'?['Choose an artifact to replace.']:c.phase==='claimed'?[c.duplicate?'Already owned. You salvage 10 gold instead.':'Artifact equipped.']:
    c.phase==='victory'?[`+${c.coins} GOLD   +${c.scrap} SCRAP`,c.reward?'A living shard survives inside the rubble.':'The blade crumbles with its keeper.']:
    c.outcome==='broken'?['The legend was longer than the blade.','+3% sword counter damage.']:['Rusted, but whole. It has not chosen you.','+5% sword counter damage.'];
  lines.forEach((line,i)=>KRUI.text(g,line,240,615+i*22,12,ui.paperSoft,388));
  if(c.phase==='replace'){
    for(let i=0;i<5;i++)KRUI.button(g,slotRect(i),ARTIFACT_DEFS[relics[i]?.type]?.name||'EMPTY','treasure',{size:10});
    KRUI.button(g,replaceBack,'BACK','treasure',{variant:'secondary',size:12});
  }else if(!pulling){
    KRUI.button(g,accept,c.phase==='intro'?'DRAW THE SWORD':c.phase==='guardian'?'STAND YOUR GROUND':c.phase==='claimed'||!c.reward&&c.phase==='victory'?'BACK TO THE ROAD':'TAKE ARTIFACT','treasure',{size:15});
    if(['intro','result','victory'].includes(c.phase)&&(c.phase!=='victory'||c.reward))KRUI.button(g,leave,c.phase==='intro'?'LEAVE IT ALONE':'LEAVE','treasure',{variant:'secondary',size:12});
  }
  drawPauseButton();
 }
 ENCOUNTERS.register(new EncounterDefinition('oath_guardian','boss',{
  name:'THE OATHKEEPER',hitText:'The Oathkeeper crushed your guard',finisherHit:'Stone outlasted steel',arenaLine:'THE STONE WAKES',
  roadEnemy:true,roadOnly:true,roadHp:55,scale:2.55,finisherReach:8,element:'earth',
  attacks:BEAR_DUEL_ATTACKS.slice(0,3),draw:guardian
 }));
 registerJourneyRoadEvent('sword_clearing',{
  start(c){c.time=0;c.dialogue=true;c.outcome=roll(c.seed);
    setPhase(c,'intro');prepareActor();requestJourneyEventVisual(c.slot,true);},
  update(c,dt){if(paused||mode!=='journeyevent')return;c.time+=dt;c.phaseTime+=dt;
    if(c.phase==='pull'&&c.phaseTime>=(c.outcome==='broken'?brokenDuration+(window.KRJonathanWalk?.extraDuration||0):2.1)){
      if(c.outcome==='guardian'){setPhase(c,'guardian');SFX.roar();}
      else{c.reward=c.outcome==='broken'?'oath_broken':'oath_rusted';setPhase(c,'result');SFX.relic();}
    }},action,draw,dispose:c=>journeyRoadEventHandlers.get('elite_finale').dispose(c)
 });
 window.KRSwordEvent=Object.freeze({assetId,roll,sword,stone,guardian,icon,drawCutscene,drawBrokenScene,draw,victory,action,brokenPose,prepareActor,
  actorStatus:()=>({ready:actorReady,error:actorError,renderer:window.KRJonathanWalk?.gpuStats()?.kind||'canvas',gpu:window.KRJonathanWalk?.gpuStats()||null}),
  get brokenDuration(){return brokenDuration+(window.KRJonathanWalk?.extraDuration||0);},
  get releaseTime(){return releaseTime+(window.KRJonathanWalk?.extraDuration||0);}});
})();
