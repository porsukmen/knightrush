/* Shared on-foot Jonathan. The actual mounted renderer owns all upper-body art.
   Native rig units (U), feet at (0,0); events supply poses, never duplicate armour. */
(()=>{'use strict';
 const neutral=Object.freeze({armor:'#919da7',dark:'#4b5966',light:'#c4ced5',steel:'#aebbc5',shine:'#edf4f7',plume:'#268ee8',blue:'#285dba'});
 const daylight=Object.freeze({...neutral,armor:'#95a7b5',dark:'#485e73',light:'#cbd9e3',steel:'#b6c9d7',shine:'#eef5fa'});
 const palettes=Object.freeze({neutral,daylight});
 function materials(lighting='neutral'){return palettes[lighting]||neutral;}
 function arm(a,m){
  drawSerJonathanArm(a.sx,a.sy,a.ex,a.ey,a.hx,a.hy,m.armor,m.steel,m.dark,true,.95);
 }
 function reach(side,hx,hy){
  const sx=side*3.7,sy=-8.9,dx=hx-sx,dy=hy-sy,d=Math.max(.001,Math.hypot(dx,dy)),upper=5,lower=5.1;
  const along=(upper*upper-lower*lower+d*d)/(2*d),off=Math.sqrt(Math.max(0,upper*upper-along*along));
  return {sx,sy,ex:sx+dx*along/d+side*dy*off/d,ey:sy+dy*along/d-side*dx*off/d,hx,hy};
 }
 function seatedPose(sit,facing='front'){
  const a=Math.max(0,Math.min(1,sit))*Math.PI/2,forward=6*Math.sin(a),hip=-6-6*Math.cos(a);
  // Fixed six-unit thigh/shin bones. Only the forward thigh is foreshortened;
  // the vertical shin retains its full length throughout the sit transition.
  const depth=forward*Math.sqrt(1-.18*.18)*(facing==='back'?-1:1),spread=forward*.18;
  return {hip,legs:[-1,1].map(side=>({hx:side*1.9,hy:hip,
   kx:side*(1.9+spread),ky:-6+depth*.28,fx:side*(1.9+spread),fy:depth*.28})),
   arms:[-1,1].map(side=>reach(side,side*(3.95+.35*sit),.3-1.3*sit))};
 }
 function draw(x,y,scale,o={}){
  const front=o.facing==='front',sit=Math.max(0,Math.min(1,o.sit||0)),t=o.clock||0,
   pose=seatedPose(sit,o.facing),m=materials(o.lighting),hip=pose.hip,b=o.breath===false?0:Math.sin(t*1.4)*.08,
   body=o.body||{};
  g.save();try{
   g.translate(x,y);g.rotate(o.rotation||0);g.scale(scale,scale);
   if(o.shadow)expPoly([[-23,0],[-15,-5],[17,-5],[25,0],[14,5],[-15,5]],'rgba(24,36,40,.22)');
   if(!o.bust)for(let i=0;i<2;i++){
    const l=o.legs?.[i]||pose.legs[i];
    // The production rider's leg widths; hip, knee and ankle align at rest.
    rigSegment(l.hx,l.hy,l.kx,l.ky,2.05,m.dark);rigJoint(l.kx,l.ky,1.85,m.light);
    rigSegment(l.kx,l.ky,l.fx,l.fy,1.65,m.armor);
    // Narrow ankle, flat heel and low toe cap; no widening trapezoid/hoof.
    px(l.fx-.9,l.fy-1.05,1.8,2.2,m.dark);
    px(l.fx-1.08,l.fy+.2,2.15,.7,m.steel);
    if(front)px(l.fx-.9,l.fy+.9,1.8,.35,m.dark);
   }
   g.save();g.translate((body.x||0)*U,((body.y||0)+hip+b)*U);g.rotate(body.lean||0);
   let arms=o.arms;
   if(!arms)arms=pose.arms;
   // Optional event equipment is in standing foot coordinates. Follow the same
   // pelvis/lean transform as the cuirass, and stay behind a front-facing actor.
   if(front&&o.backEquipment){g.save();g.translate(0,12*U);o.backEquipment(0,1);g.restore();}
   // Identical live mounted torso/helmet/plume/equipment, not a copied design.
   // Compensate its seat origin and neutral rider bob to put its pelvis at zero.
   const riderBob=Math.sin(.9)*.34;
   drawSerJonathanRider(0,(20-riderBob)*U,1,{gallop:0,lean:0,feather:m.plume,
     eventUpper:{front,arms,shield:o.shield,headPitch:o.gaze?.pitch||0,headX:o.gaze?.x||0,headY:o.gaze?.y||0},
     appearance:{armor:m.armor,armorDark:m.dark,armorLight:m.light,steel:m.steel,steelLight:m.shine},
     mountedIdle:{breath:0,horseBreath:0,plumeSway:Math.sin(t*1.8)*.14,plumeTip:0}});
   if(o.armsBehind&&arms)for(const a of arms)rigJoint(a.hx,a.hy,1.55,m.steel);
   g.restore();
  }finally{g.restore();}
 }
 function hand(x,y,scale=1,side=1,lighting='neutral'){
  const m=materials(lighting);g.save();g.translate(x,y);g.scale(scale*side,scale);
  px(-.82,-1.05,1.65,2.1,m.armor);px(-.82,-1.05,1.65,.4,m.light);
  px(.54,-.65,.29,1.7,m.dark);
  for(let i=0;i<3;i++)px(-.48+i*.4,.32,.1,.55,m.dark);
  g.restore();
 }
 // Resting presentation of Jonathan's back sword: same sheath length, hilt
 // dimensions and blue materials as drawSerJonathanRider, tip anchored at zero.
 function sheathedSword(x,y,scale=1,tilt=0,lighting='neutral'){
  const m=materials(lighting),length=Math.hypot(8.6,7),mouth=-length,guard=mouth-.48,pommel=guard-3.27;
  g.save();g.translate(x,y);g.rotate(tilt);g.scale(scale,scale);
  rigPolygon([[-.62,0],[.62,0],[.86,mouth],[-.86,mouth]],'#1c426f');
  rigSegment(-.62,0,-.86,mouth,.48,shade('#1c426f',34));
  rigJoint(0,0,1.08,shade('#1c426f',-34));
  rigSegment(-.92,mouth,.92,mouth,.72,m.shine);
  rigSegment(0,guard,0,pommel,1.34,'#4059a8');
  rigSegment(-.67,guard,-.67,pommel,.24,shade('#4059a8',-34));
  rigSegment(.67,guard,.67,pommel,.15,shade('#4059a8',22));
  rigSegment(-1.62,guard,1.62,guard,.9,'#6f91d8');
  rigJoint(-1.62,guard,.68,'#6f91d8');rigJoint(1.62,guard,.68,shade('#6f91d8',10));
  rigJoint(0,pommel,.92,shade('#6f91d8',18));rigJoint(0,guard,.52,'#7fc9ff');
  g.restore();
 }
 // Profile presentation for lance/sword minigames. Same Jonathan proportions,
 // production great helm, stepped plume and silver materials; never a recoloured rival.
 function side(x,y,scale=1,o={}){
  const m=materials(o.lighting),mounted=!!o.mounted,hip=-12+(o.body?.y||0),sy=hip-8.9;
  g.save();g.translate(x,y);g.scale(scale,scale);
  for(const far of [true,false]){
   const poseLeg=o.legs?.[far?0:1];
   if(poseLeg){const l=poseLeg;
    rigSegment(l.hx,l.hy,l.kx,l.ky,2.05,far?m.dark:m.armor);
    rigSegment(l.kx,l.ky,l.fx,l.fy,1.65,far?m.dark:m.steel);
    rigJoint(l.kx,l.ky,1.8,far?m.armor:m.light);px(l.fx-.9,l.fy-.7,2.4,1.2,m.dark);continue;
   }
   const hx=far?-1.2:1.2,kx=mounted?4.4:(far?-2:2.1),ky=mounted?-8:-6,
    fx=mounted?3.6:kx,fy=mounted?-4:0;
   rigSegment(hx,hip,kx,ky,2.05,far?m.dark:m.armor);
   rigSegment(kx,ky,fx,fy,1.65,far?m.dark:m.steel);
   rigJoint(kx,ky,1.8,far?m.armor:m.light);px(fx-.9,fy-.7,2.4,1.2,m.dark);
  }
  rigPolygon([[-3.3,sy-1],[3,sy-1],[2.5,hip],[-2.4,hip]],m.dark);
  rigPolygon([[-1.9,sy-.7],[3,sy-.7],[2.5,hip-.4],[-1.5,hip-.4]],m.armor);
  rigSegment(2,sy,1.7,hip-1,.55,m.light);
  rigSegment(0,sy,0,hip-14,2,m.dark);
  const h=drawSerJonathanHelmet25D(0,hip-15.1,.06,1,m.armor,m.dark,m.light,m.shine);
  px(1,h.planeY+1.5,2.5,.8,'#233747');
  for(let i=0;i<2;i++)px(1.45+i*.85,h.bottomY-1.65,.4,.65,m.dark);
  rigSegment(0,h.crownY,0,h.crownY-4.1,1.55,m.plume);
  rigSegment(0,h.crownY-4.1,2.8,h.crownY-6.5,1.9,shade(m.plume,12));
  rigSegment(2.8,h.crownY-6.5,4.7,h.crownY-5.4,1.35,m.plume);
  const swing=o.walking?Math.sin((o.clock||0)*8)*.8:0,
   hx=o.walking?2+swing:mounted?4:7,hy=o.walking?hip-.6:mounted?-24:-14,
   ex=o.walking?2.4:mounted?5:4.8,ey=o.walking?sy+4.7:mounted?-18.8:-16.5;
  rigSegment(1,sy,ex,ey,2.05,m.armor);rigJoint(1,sy,3.05,m.light);
  rigSegment(ex,ey,hx,hy,1.65,m.steel);rigJoint(ex,ey,1.6,m.dark);
  hand(hx*U,hy*U,1,1,o.lighting);
  g.restore();
 }
 // Authored 2D turnaround drawings, like the wolf's directional pose sheets.
 // Blender is a proportion/landmark reference only: no mesh, sprite or yaw projection.
 // Each drawing uses broad native planes, not a second actor over the first.
 // Hand-authored screen-space keys, not rotation of a 3D mesh. Interpolate
 // matching corners instead of switching whole drawings or alpha-blending actors.
 const turnKeys=[
  // angle, torso half, waist, helm half, face ridge, side width, cap width, eye width
  [0,4.35,2.7,3.5,0,0,3.05,6],
  [35,4.7,3.0,4.2,1.7,2.6,3.15,4.5],
  [65,4.1,2.8,4.0,3.2,5.1,3.3,3.0],
  [90,3.2,2.5,3.5,3.2,6.5,3.35,2.4],
  [115,4.1,2.8,4.0,3.0,5.1,3.3,0],
  [145,4.7,3.0,4.2,1.7,2.6,3.15,0],
  [180,4.35,2.7,3.5,0,0,3.05,0]
 ];
 function turnShape(deg,solid=false){
  if(solid){
   // Continuous support widths instead of easing to a stop at every authored
   // 35/65/90-degree key. End-on proportions and fixed limb landmarks stay put.
   const a=deg*Math.PI/180,s=Math.sin(a),side=s*s,quarter=Math.sin(2*a)**2;
   return [deg,4.35-1.15*side+.9*quarter,2.7-.2*side+.35*quarter,3.5,0,6.5*s,3.05+.3*side,0];
  }
  let i=0;while(i<turnKeys.length-2&&deg>turnKeys[i+1][0])i++;
  const a=turnKeys[i],b=turnKeys[i+1],t=Math.max(0,Math.min(1,(deg-a[0])/(b[0]-a[0]))),u=t*t*(3-2*t);
  return a.map((v,j)=>v+(b[j]-v)*u);
 }
 // Shared by the directional body and the foreground stone/helmet passes.
 // Neither angle nor near/far classification may change this material recipe.
 // Shared by the route animation and the angle-controlled Lab. Keep native
 // bones fixed while making sagittal arm motion readable from front/back.
 function walkUpper(arms,heading,drive,weight=1){
  if(!weight)return {arms,roll:0};
  const c=Math.cos(heading),s=Math.sin(heading),pitch=.28,
   project=([x,y,z])=>[x*c-z*s,y*Math.cos(pitch)+(x*s+z*c)*Math.sin(pitch)],
   lift=(dx,dy)=>[dx*c+dy*Math.sin(pitch)*s,dy*Math.cos(pitch),-dx*s+dy*Math.sin(pitch)*c],
   bone=(from,to,length)=>{const v=from.map((n,i)=>n+(to[i]-n)*weight),k=length/Math.hypot(...v);return v.map(n=>n*k);};
  return {roll:0,arms:arms.map((a,j)=>{
   const side=j?1:-1,phase=drive*(j?-1:1),theta=-.32*phase,
    // Keep the elbow's inner edge outside the tapered cuirass throughout
    // the stride. This is constant clearance, not side-to-side arm motion.
    ux=side*.85,lx=-side*.10,ul=Math.sqrt(25-ux*ux),ll=Math.sqrt(5.1**2-lx*lx),
    elbow=bone(lift(a.ex-a.sx,a.ey-a.sy),[ux,ul*Math.cos(theta),-ul*Math.sin(theta)],5),
    lower=bone(lift(a.hx-a.ex,a.hy-a.ey),[lx,ll*Math.cos(theta+.12),-ll*Math.sin(theta+.12)],5.1),
    hand=elbow.map((n,i)=>n+lower[i]),
    e=project(elbow),h=project(hand);
   // Constant anatomical X: front/back motion is foreshortening + depth,
   // never a lateral elbow flap. Physical lengths are 5 and 5.1 in all views.
   return {...a,ex:a.sx+e[0],ey:a.sy+e[1],
    hx:a.sx+h[0],hy:a.sy+h[1],
    walkDepth:{shoulder:-side*3.7*s,
     upper:-side*3.7*s-(elbow[0]*s+elbow[2]*c)*weight,
     hand:-side*3.7*s-(hand[0]*s+hand[2]*c)*weight,weight},
    physical:{shoulder:[0,0,0],elbow,hand}};
  })};
 }
 function turnHand(x,y,scale=1,lighting='neutral'){
  const m=materials(lighting);g.save();g.translate(x,y);g.scale(scale,scale);
  rigJoint(0,0,1.65,m.armor);px(-.82,-.82,1.65,.38,m.light);g.restore();
 }
 function turnElbow(a,m){
  rigJoint(a.ex,a.ey,1.6,m.dark);
  rigJoint(a.ex-.18,a.ey-.18,.85,m.armor);
 }
 function turnForearm(a,lighting='neutral',withHand=true,withElbow=true){
  const m=materials(lighting);
  rigSegment(a.ex,a.ey,a.hx,a.hy,1.65,m.steel);
  rigSegment(a.ex-.35,a.ey,a.hx-.35,a.hy,.32,m.light);
  if(withElbow)turnElbow(a,m);
  const dx=a.hx-a.ex,dy=a.hy-a.ey,d=Math.max(.01,Math.hypot(dx,dy));
  rigSegment(a.hx-dx/d*.85,a.hy-dy/d*.85,a.hx,a.hy,1.65,m.dark);
  if(withHand)turnHand(a.hx*U,a.hy*U,1,lighting);
 }
 function turnHipLinks(o,torsoOuter,hip){
  // The cuirass lives in the leaning upper-body frame; thigh roots are already
  // projected into the ground frame. Join those frames with the existing dark
  // hip material, never by moving joints or lengthening the leg segments.
  const a=o.body?.lean||0,c=Math.cos(a),s=Math.sin(a),bx=o.body?.x||0,
   hem=[torsoOuter[3],torsoOuter[4]].map(([x,y])=>{
    const dy=y-.18-hip;return [bx+x*c-dy*s,hip+x*s+dy*c];
   }).sort((p,q)=>p[0]-q[0]),
   socket=x=>{
    x=Math.max(hem[0][0],Math.min(hem[1][0],x));
    const t=(x-hem[0][0])/Math.max(.001,hem[1][0]-hem[0][0]);
    return [x,hem[0][1]+(hem[1][1]-hem[0][1])*t];
   };
  return o.legs.map(l=>{
   const dx=l.kx-l.hx,dy=l.ky-l.hy,d=Math.max(.001,Math.hypot(dx,dy)),
    nx=-dy/d*1.025,ny=dx/d*1.025,cx=l.hx+dx/d*.3,cy=l.hy+dy/d*.3;
   return [socket(l.hx-.95),socket(l.hx+.95),[cx-nx,cy-ny],[cx+nx,cy+ny]];
  });
 }
 function turnDrawing(x,y,scale,o){
  const deg=o.degrees,m=materials(o.lighting),dir=o.direction||1,
   [,half,waist,keyHelmHalf,ridge,sideWidth,capWidth,eye]=turnShape(deg,o.solidTurn),
   helmHalf=o.solidTurn?3.5*(Math.abs(Math.cos(deg*Math.PI/180))+Math.sin(deg*Math.PI/180))-.85*Math.min(Math.abs(Math.cos(deg*Math.PI/180)),Math.sin(deg*Math.PI/180)):keyHelmHalf,
   hip=-12+(o.body?.y||0),sy=hip-8.9,rear=deg>90,armList=o.arms,
   near=dir>0?0:1,far=1-near;
  // Native 2D contour morph: frontal trapezoid -> compact straight side planes.
  // Align the tapered profile with shoulder/hip roots; frontal endpoints stay put.
  const profile=Math.sin(deg*Math.PI/180)**2,torsoShift=dir*.18*profile;
  const torsoContour=inset=>{
   const top=sy-(inset?.35:.8),bottom=hip-(inset?.3:0),
    upper=half-(inset?.6:0),lower=waist-(inset?.5:0),
    midY=top+(bottom-top)*.32,
    // Move the full upper chest edge outward; keep the waist and shoulder cap fixed.
    frontDepth=capWidth/2+(inset?.05:.45),backDepth=inset?1.85:2.2,
    frontTopBase=upper+(frontDepth-upper)*profile,
    frontTop=frontTopBase+.37*profile,
    frontBottom=lower+(frontDepth-.45-lower)*profile,
    frontMid=frontTopBase+(frontBottom-frontTopBase)*.32+.60*profile,
    backTop=upper+(backDepth-upper)*profile,
    backBottom=lower+(backDepth-.1-lower)*profile,
    backMid=backTop+(backBottom-backTop)*.32;
   return [[-backTop,top],[frontTop,top],[frontMid,midY],
    [frontBottom,bottom],[-backBottom,bottom],[-backMid,midY]]
    .map(([x,y])=>[dir*x+torsoShift,y]);
  };
  const torsoOuter=torsoContour(false),torsoFace=torsoContour(true);
  g.save();g.translate(x,y);g.scale(scale,scale);
  const upperSpace=fn=>{g.save();g.translate((o.body?.x||0)*U,hip*U);
   g.rotate(o.body?.lean||0);g.translate(0,-hip*U);fn();g.restore();};
  const exclude=points=>{g.beginPath();g.rect(-100*U,-100*U,200*U,200*U);
   g.moveTo(points[0][0]*U,points[0][1]*U);for(const p of points.slice(1))g.lineTo(p[0]*U,p[1]*U);
   g.closePath();g.clip('evenodd');};
  const behindShield=fn=>{g.save();
   for(const p of o.armOccluders?.(deg,dir)||[])exclude(p.map(([x,y])=>[x,y+(o.body?.y||0)]));
   fn();g.restore();};
  // Clip the real chest silhouette by a limb's depth plane. Scaling a chest
  // mask made a moving vertical cut through the arm and shaved the rear caps.
  const heading=deg*Math.PI/180*dir,viewC=Math.cos(heading),viewS=Math.sin(heading);
  const chestMask=(depth,fn)=>{
   const clip=(poly,value)=>{
    const out=[];if(!poly.length)return out;
    let a=poly[poly.length-1],va=value(a);
    for(const b of poly){const vb=value(b);
     if((va>0)!==(vb>0)){const t=va/(va-vb);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
     if(vb>0)out.push(b);a=b;va=vb;
    }return out;
   };
   const top=sy-.8,height=hip-top;
   let mask=torsoOuter;
   // The nearer surface is the minimum of the two ray/box exit planes.
   // Both tests must agree before the actual torso silhouette hides a limb.
   if(Math.abs(viewS)>.00001)mask=clip(mask,([x,y])=>
    (4.35-1.65*(y-top)/height+Math.sign(viewS)*viewC*(x-torsoShift))/Math.abs(viewS)-depth(x,y));
   if(Math.abs(viewC)>.00001)mask=clip(mask,([x,y])=>
    (2.2-.25*(y-top)/height-Math.sign(viewC)*viewS*(x-torsoShift))/Math.abs(viewC)-depth(x,y));
   g.save();if(mask.length>2)exclude(mask);fn();g.restore();
  };
  const armDepthMask=(a,part,fn)=>{
   if(!a.walkDepth)return fn();
   const upper=part==='upper',x0=upper?a.sx:a.ex,y0=upper?a.sy:a.ey,
    dx=(upper?a.ex:a.hx)-x0,dy=(upper?a.ey:a.hy)-y0,
    d0=upper?a.walkDepth.shoulder:a.walkDepth.upper,
    dd=a.walkDepth[part]-d0,length2=Math.max(.001,dx*dx+dy*dy),radius=upper?1.025:.825;
   walkChestMask(a,(x,y)=>d0+dd*((x-x0)*dx+(y-y0)*dy)/length2+radius,fn);
  };
  const walkChestMask=(a,depth,fn)=>{
   // Authored walking layer rule: front AND back armour cover intersecting
   // arm pieces for the ENTIRE stride, including the forward swing. Fade
   // this priority smoothly towards profiles; retain real side-view depth.
   // Caps and non-walking reaches/pulls deliberately do not use this rule.
   const torsoPriority=8*viewC**4*a.walkDepth.weight;
   chestMask((x,y)=>depth(x,y)-torsoPriority,fn);
  };
  const upper=(a)=>{
   rigSegment(a.sx,a.sy,a.ex,a.ey,2.05,m.armor);
   rigSegment(a.sx-.35,a.sy,a.ex-.35,a.ey,.38,m.light);
  };
  const shoulder=(a)=>{
   // The cap is attached to the shoulder, not stretched along the arm. Keep
   // it only slightly wider than the 2.8-unit neck, including the exact side.
   const width=capWidth;
   px(a.sx-width/2,a.sy-1.525,width,3.05,m.light);
   const bevel=.3*Math.sin(deg*Math.PI/180);
   px(a.sx+width/2-bevel,a.sy-1.525,bevel,3.05,m.armor);
  };
  // A continuous silhouette mask replaces the walk/frontReach layer switch.
  // As the torso turns frontal, its occlusion narrows smoothly to nothing.
  const farVisible=(fn,physical=false)=>{
   g.save();
   const occlusion=Math.sin(deg*Math.PI/180)**2;
   if(!physical&&occlusion>.00001)exclude(torsoOuter.map(([x,y])=>[x*occlusion,y]));
   for(const p of o.armOccluders?.(deg,dir)||[])exclude(p.map(([x,y])=>[x,y+(o.body?.y||0)]));
   // Legs were painted outside upperSpace: convert their masks back into it.
   const local=(x,y)=>{const dx=x-(o.body?.x||0),dy=y-hip,a=o.body?.lean||0;
    return [dx*Math.cos(a)+dy*Math.sin(a),hip-dx*Math.sin(a)+dy*Math.cos(a)];};
   for(const l of occlusion>.00001?o.legs:[]){
    const dx=l.kx-l.hx,dy=l.ky-l.hy,d=Math.max(.01,Math.hypot(dx,dy)),nx=-dy/d*1.025*occlusion,ny=dx/d*1.025*occlusion;
    exclude([[l.hx+nx,l.hy+ny],[l.kx+nx,l.ky+ny],[l.kx-nx,l.ky-ny],[l.hx-nx,l.hy-ny]].map(p=>local(...p)));
   }
   fn();g.restore();
  };
  const quiver=()=>{g.save();g.translate(0,(o.body?.y||0)*U);o.arrows?.(deg,dir);g.restore();};
  const gear=head=>{g.save();g.translate(0,(o.body?.y||0)*U);o.equipment?.(deg,dir,head);g.restore();};
  // Front view: back-mounted props are behind the knight. Rear view: they
  // cover the complete knight (including forearms) where silhouettes overlap.
  // The low quiver overlaps the hips/thighs too, not just the cuirass. Paint
  // the complete front-view equipment pass before legs, in the same torso
  // space, so it stays behind the whole knight during the rebound and lean.
  if(!rear)upperSpace(()=>{quiver();gear();});
  for(const poly of turnHipLinks(o,torsoOuter,hip))rigPolygon(poly,m.dark);
  for(const i of [far,near]){
   const l=o.legs[i],hx=l.hx,kx=l.kx,fx=l.fx;
   rigSegment(hx,l.hy,kx,l.ky,2.05,m.dark);rigJoint(kx,l.ky,1.85,m.light);
   rigSegment(kx,l.ky,fx,l.fy,1.65,m.armor);
   // Walk-only ankle roll; neutral/pull poses retain the approved flat boot.
   g.save();g.translate(fx*U,l.fy*U);g.rotate(l.bootAngle||0);
   px(-.9,-1.05,1.8,2.2,m.dark);px(-1.08,.2,2.15,.7,m.steel);g.restore();
  }
  upperSpace(()=>{
  // Neck is underneath the armour. Painting it last cut a dark notch down
  // through the side shoulder cap, which incorrectly split that single plate.
  rigSegment(0,sy,0,hip-14,2.8,m.dark);
  rigPolygon(torsoOuter,m.dark);
  rigPolygon(torsoFace,m.armor);
  const yaw=deg*Math.PI/180,cosYaw=Math.cos(yaw),sinYaw=Math.sin(yaw),
   seam=(rear?-dir*2.2:dir*(capWidth/2+.42))*sinYaw,
   stripeWidth=Math.max(0,(Math.abs(cosYaw)-.06)/.94);
  // Front and back seams belong to opposite faces. Taper/foreshorten with
  // the torso plane and disappear at its side edge, never slide across it.
  // Back-face depth is fixed, not the yaw-dependent screen half-width: using
  // that width pushed the seam under the shield at rear-quarter angles.
  // Match the armour face endpoints/taper. A narrow profile dead zone avoids
  // a subpixel white remnant when the authored side pose is almost 90 degrees.
  if(stripeWidth>.00001){
   // Keep the accepted stripe position, but never let paint escape the armour.
   g.save();g.beginPath();g.moveTo(torsoFace[0][0]*U,torsoFace[0][1]*U);
   for(const p of torsoFace.slice(1))g.lineTo(p[0]*U,p[1]*U);
   g.closePath();g.clip();
   if(rear)rigSegment(seam+torsoShift,sy-.35,seam*(waist-.5)/(half-.6)+torsoShift,hip-.3,stripeWidth,m.light);
   else{
    // A fixed chest ridge follows the same upper bulge/waist profile as the
    // armour; using screen half-width made it slide inward during rotation.
    const top=sy-.35,bottom=hip-.3,mid=top+(bottom-top)*.32,
     chest=dir*(capWidth/2+.65)*sinYaw+torsoShift,waistLine=dir*(capWidth/2-.4)*sinYaw+torsoShift;
    rigSegment(seam+torsoShift,top,chest,mid,stripeWidth,m.light);
    rigSegment(chest,mid,waistLine,bottom,stripeWidth,m.light);
   }
   g.restore();
  }
  if(o.harness){
   g.save();g.beginPath();g.moveTo(torsoOuter[0][0]*U,torsoOuter[0][1]*U);
   for(const p of torsoOuter.slice(1))g.lineTo(p[0]*U,p[1]*U);
   g.closePath();g.clip();o.harness(deg,dir,{sy,hip});g.restore();
  }
  farVisible(()=>armDepthMask(armList[far],'upper',()=>upper(armList[far])),!!armList[far].walkDepth);
  behindShield(()=>armDepthMask(armList[near],'upper',()=>upper(armList[near])));
  // Caps wrap beyond both faces of the cuirass. Resolve their full depth,
  // not a rear-view cutout: the rear cap must remain a solid shoulder plate.
  const shoulderCap=(a,i)=>{
   if(!o.solidTurn){
    const back=Math.max(0,-viewC);
    g.save();if(back>.00001)exclude(torsoOuter.map(([x,y])=>[x*back,y]));shoulder(a);g.restore();return;
   }
   const root=-(i?1:-1)*3.7*viewS,
    surface=root+2.65*Math.abs(viewC)+capWidth/2*Math.abs(viewS);
   chestMask(()=>surface,()=>shoulder(a));
  };
  farVisible(()=>shoulderCap(armList[far],far),!!o.solidTurn);shoulderCap(armList[near],near);
  // Broad authored side plane, shallow top strip and connected front visor.
  // Side/quarter silhouettes are measured against the Blender angle references.
  const helmet=()=>{
  const h=serJonathanHelmetProjection(hip-15.1+(o.gaze?.y||0),o.gaze?.pitch||0),
   top=h.planeY,bottom=h.bottomY,hx=o.gaze?.x||0,
   // The crest is attached behind the front lip, not pinned to its silhouette.
   // Upward pitch sends it rearward; the rising front plate occludes its base.
   crownRecess=Math.max(0,-h.topDepth),crownY=h.crownY,
   crownX=hx-dir*sinYaw*Math.min(1,crownRecess/1.2)*1.4;
  if(o.solidTurn){
   // A single chamfered helmet turns rigidly. Facial marks live on its planes,
   // not independent screen-width keys; no eye/bridge threshold or fading.
   const ring=[[-2.65,-3.5],[2.65,-3.5],[3.5,-2.65],[3.5,2.65],[2.65,3.5],[-2.65,3.5],[-3.5,2.65],[-3.5,-2.65]],
    project=([x,z],y)=>[hx+x*cosYaw-z*sinYaw*dir,y],
    face=(a,b,y,height,col)=>rigPolygon([project(a,y),project(b,y),project(b,y+height),project(a,y+height)],col),
    nearFaces=[],visorSpans=[];
   for(let i=0;i<ring.length;i++){
    const a=ring[i],b=ring[(i+1)%ring.length],nx=b[1]-a[1],nz=a[0]-b[0],facing=-nx*sinYaw*dir-nz*cosYaw;
    if(facing>1e-8)nearFaces.push({a,b,i});
   }
   for(const {a,b,i}of nearFaces){
    face(a,b,top,h.faceHeight,i===0||i===4?m.armor:(i%2?shade(m.armor,-5):shade(m.armor,-10)));
    face(a,b,top,.25,m.light);face(a,b,bottom-.82,.82,m.dark);
   }
   const surfaceMark=(edge,start,end,y,height,col)=>{
    const a=ring[edge],b=ring[(edge+1)%ring.length];
    if(!nearFaces.some(f=>f.i===edge))return;
    const p=[a[0]+(b[0]-a[0])*start,a[1]+(b[1]-a[1])*start],q=[a[0]+(b[0]-a[0])*end,a[1]+(b[1]-a[1])*end];
    if(col==='#233747'){const x=project(p,y)[0],z=project(q,y)[0];visorSpans.push([Math.min(x,z),Math.max(x,z)]);}
    else face(p,q,y,height,col);
   };
   surfaceMark(0,.425,.575,top+.12,h.faceHeight-.94,m.light);
   for(const side of [-1,1]){
    const center=.5+side*.285;
    surfaceMark(0,side<0?0:center-.205,side>0?1:center+.205,top+1.5,.8,'#233747');
    for(let j=0;j<2;j++){const x=.5+side*(.225+j*.145);surfaceMark(0,x-.034,x+.034,bottom-1.65,.65,m.dark);}
   }
   // The eye slit wraps over the chamfer onto each side, with two fixed vents.
   for(const edge of [1,7])surfaceMark(edge,0,1,top+1.5,.8,'#233747');
   surfaceMark(2,0,.43,top+1.5,.8,'#233747');surfaceMark(6,.57,1,top+1.5,.8,'#233747');
   // Merge touching coplanar screen spans into one fill. Separate tiny slit
   // rectangles exposed bright steel cracks at the front/chamfer boundaries.
   visorSpans.sort((a,b)=>a[0]-b[0]);const slits=[];
   for(const span of visorSpans){const last=slits.at(-1);if(last&&span[0]<=last[1]+1e-7)last[1]=Math.max(last[1],span[1]);else slits.push(span.slice());}
   for(const [left,right]of slits)px(left,top+1.5,right-left,.8,'#233747');
   for(const edge of [2,6])for(const x of [.46,.60])surfaceMark(edge,x-.025,x+.025,bottom-1.65,.65,m.dark);
   surfaceMark(4,.425,.575,top+.12,h.faceHeight-.94,m.light);
   if(h.topDepth>.001)rigPolygon([[hx-helmHalf+.32,h.topY],[hx+helmHalf-.32,h.topY],[hx+helmHalf,top],[hx-helmHalf,top]],m.shine);
  }else{
  if(h.topDepth>.001)rigPolygon([[hx-helmHalf+.32,h.topY],[hx+helmHalf-.32,h.topY],
   [hx+helmHalf,top],[hx-helmHalf,top]],m.shine);
  px(hx-helmHalf,top,helmHalf*2,h.faceHeight,m.armor);
  // The side is the same steel material, with only a narrow depth edge.
  const sideEdge=Math.min(.45,sideWidth*.12);
  if(sideEdge>.001)px(dir>0?hx-helmHalf:hx+helmHalf-sideEdge,top,sideEdge,h.faceHeight,m.dark);
  px(hx-helmHalf,top,helmHalf*2,.25,m.light);
  const faceTravel=(helmHalf-.1)*sinYaw;
  // The back seam moves opposite the face ridge. It leaves through the rear
  // silhouette while the front visor bridge arrives through the forward edge.
  const backWidth=.8*Math.max(0,-cosYaw);
  if(backWidth>.00001)px(hx-dir*faceTravel-backWidth*.625,top+.12,backWidth,h.faceHeight-.3,m.light);
  px(hx-helmHalf,bottom-.82,helmHalf*2,.82,m.dark);
  // One front plate carries ALL facial marks. Its outer edge is the authored
  // helmet silhouette; its center and scale cannot drift independently of
  // the visor/vents. No screen-space clipping or eye-width keyframe switches.
  const front=Math.max(0,cosYaw),faceCenter=hx+dir*(helmHalf-3.5*front);
  const faceMark=(x,y,w,height,color)=>px(faceCenter+(x-w/2)*front,y,w*front,height,color);
  if(front>1e-10){
   faceMark(0,top+.12,.8,h.faceHeight-.94,m.light);
   for(const side of [-1,1])faceMark(side*1.75,top+1.5,2.5,.8,'#233747');
   for(const side of [-1,1])for(let j=0;j<2;j++){
    faceMark(side*(1.3+j*.85),bottom-1.65,.4,.65,m.dark);
   }
  }
  // The side plate occupies exactly the remaining width. Its short visor
  // return and two vents use that same mapping even beyond the profile, so
  // they turn out of sight with the surface instead of popping off at 115°.
  const sideScale=Math.max(0,(2*helmHalf-7*Math.abs(cosYaw))/7),
   sideCenter=hx-dir*3.5*cosYaw;
  const sideMark=(x,y,w,height,color)=>px(sideCenter+dir*x*sideScale-w*sideScale/2,y,w*sideScale,height,color);
  if(sideScale>1e-10){
   // Join the return to the near eye's inset, not a third floating eye slit.
   // Include the near eye in this single fill to avoid an antialiased seam
   // between two touching dark rectangles at fractional pixel positions.
   const visorEnd=sideCenter+dir*(3.5*sideScale+3*front),visorWidth=2.9*sideScale+2.5*front;
   px(dir>0?visorEnd-visorWidth:visorEnd,top+1.5,visorWidth,.8,'#233747');
   for(const along of [-.77,.105])sideMark(along,bottom-1.65,.3,.65,m.dark);
  }
  }
  const sway=Math.sin((o.clock||0)*1.8)*.12,
   plumeDir=1+(-dir-1)*Math.sin(deg*Math.PI/180)**2;
  g.save();
  if(crownRecess>0){
   // Retain the neutral mount's .37-unit lip overlap, then reveal the front
   // rim continuously as it rises. Both the white mount and blue stem share
   // this occlusion: neither can paint over the forehead during the look-up.
   const edge=top+.37*Math.max(0,1-crownRecess/.6),roof=crownY-10;
   g.beginPath();g.rect((crownX-10)*U,roof*U,20*U,Math.max(0,edge-roof)*U);g.clip();
  }
  px(crownX-2,crownY,4,.72,m.shine);
  rigSegment(crownX,crownY,crownX+.2,crownY-4.1,1.55,m.plume);
  rigSegment(crownX+.2,crownY-4.1,crownX+(2.8+sway)*plumeDir,crownY-6.5,1.9,shade(m.plume,12));
  rigSegment(crownX+(2.8+sway)*plumeDir,crownY-6.5,crownX+(4.7+sway)*plumeDir,crownY-5.4,1.35,m.plume);
  g.restore();
  };
  // Paint the head, then resolve only overlapping equipment against its
  // actual depth envelope. A right/left profile is not the same depth order:
  // the hilt's lateral mounting can put it nearer on one side and farther on
  // the other. Neither a 90-degree switch nor an always-front helmet works.
  if(!rear)helmet();
  const forearm=a=>{
   armDepthMask(a,'hand',()=>turnForearm(a,o.lighting,true,!a.walkDepth));
   // Do not cut the elbow with the narrower forearm's extrapolated depth
   // plane. Its cap has one shared depth/width at the upper/lower bone pivot.
   if(a.walkDepth)walkChestMask(a,()=>a.walkDepth.upper+1.05,()=>turnElbow(a,m));
  };
  farVisible(()=>forearm(armList[far]),!!armList[far].walkDepth);
  forearm(armList[near]);
  if(rear){quiver();gear();helmet();}
  if(o.equipment){
   const h=serJonathanHelmetProjection(hip-15.1+(o.gaze?.y||0),o.gaze?.pitch||0),hx=o.gaze?.x||0;
   g.save();g.beginPath();g.rect((hx-helmHalf)*U,h.topY*U,helmHalf*2*U,(h.bottomY-h.topY)*U);g.clip();
   gear({x:hx,half:helmHalf,top:h.topY-(o.body?.y||0),bottom:h.bottomY-(o.body?.y||0),chamfer:o.solidTurn?.85:0});
   g.restore();
  }
  });
  g.restore();
 }
 window.KRJonathan=Object.freeze({palettes,materials,arm,reach,seatedPose,hand,sheathedSword,side,draw,turnDrawing,turnHand,turnForearm,walkUpper});
})();
