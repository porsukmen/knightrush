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
  const m=materials(o.lighting),mounted=!!o.mounted,hip=-12,sy=hip-8.9;
  g.save();g.translate(x,y);g.scale(scale,scale);
  for(const far of [true,false]){
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
  const hx=mounted?4:7,hy=mounted?-24:-14,ex=mounted?5:4.8,ey=mounted?-18.8:-16.5;
  rigSegment(1,sy,ex,ey,2.05,m.armor);rigJoint(1,sy,3.05,m.light);
  rigSegment(ex,ey,hx,hy,1.65,m.steel);rigJoint(ex,ey,1.6,m.dark);
  hand(hx*U,hy*U,1,1,o.lighting);
  g.restore();
 }
 window.KRJonathan=Object.freeze({palettes,materials,arm,reach,seatedPose,hand,sheathedSword,side,draw});
})();
