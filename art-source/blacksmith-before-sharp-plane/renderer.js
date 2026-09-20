function drawSmithForgeBackdrop(){
  // Draw into the live gameplay canvas. No low-resolution intermediate sprite.
    g.fillStyle='#171b23';g.fillRect(0,0,240,140);
    for(let row=0;row<6;row++)for(let col=0;col<10;col++){
      g.fillStyle=(row+col)%3?'#252a32':'#2c3038';g.fillRect(col*27-(row%2)*13,row*21,25,19);
    }
    for(let row=0;row<6;row++)for(let col=0;col<10;col++){
      const x=col*27-(row%2)*13,y=row*21;
      g.strokeStyle='#3b4148';g.lineWidth=.45;g.beginPath();g.moveTo(x+2,y+18);g.lineTo(x+2,y+2);g.lineTo(x+23,y+2);g.stroke();
      if((col+row)%4===0){g.strokeStyle='#181e26';g.beginPath();g.moveTo(x+18,y+2);g.lineTo(x+17,y+7);g.lineTo(x+19,y+10);g.stroke();}
    }
    g.fillStyle='#3b302b';g.fillRect(0,127,240,13);
    for(let i=0;i<8;i++){g.fillStyle=i%2?'#493b30':'#584633';g.fillRect(i*33,129,31,3);}
    g.fillStyle='#5f4840';g.fillRect(9,12,44,111);
    for(let y=14;y<115;y+=12){g.fillStyle='#3a3030';g.fillRect(9,y,44,2);g.fillRect(29+(y%24?0:10),y,2,12);}
    smithPoly([[10,71],[18,57],[46,57],[56,72],[56,119],[10,119]],'#3c3032',null);
    g.fillStyle='#10141b';g.fillRect(18,74,31,39);g.fillStyle='#80614a';g.fillRect(15,112,37,5);
    g.fillStyle='#584335';g.fillRect(182,29,49,5);
    g.fillStyle='#634936';g.fillRect(203,100,25,27);g.fillStyle='#8a6645';g.fillRect(203,99,25,5);
    g.fillStyle='#383d47';g.fillRect(206,109,19,4);g.fillRect(206,121,19,3);
    drawSerJonathanShield(65,24,0,.18,.7,.9);
    g.save();g.translate(221,76);g.rotate(-1.35);drawSmithItem('bow',0,0,.62);g.restore();
    // Match the approved town's masonry/timber craftsmanship. Keep the live
    // smith, hammer contact and fire opening completely unchanged.
    // Recessed side-wall joints frame the room rather than a flat brick wallpaper.
    smithPoly([[0,0],[8,8],[8,127],[0,134]],'#21292b',null);
    smithPoly([[231,8],[240,0],[240,134],[231,127]],'#11181f',null);
    smithPoly([[0,0],[240,0],[231,8],[8,8]],'#574b3e',null);
    g.fillStyle='#937b58';g.fillRect(8,7,223,1);g.fillStyle='#302b28';g.fillRect(8,9,223,3);
    // Stone hood and chamfered hearth; same mouth coordinates as the fire pass.
    smithPoly([[9,12],[15,16],[15,55],[9,64]],'#8c7863',null);
    smithPoly([[48,16],[53,12],[53,64],[47,57]],'#40362f',null);
    smithPoly([[8,64],[17,54],[45,54],[55,64],[55,71],[8,71]],'#7b6955',null);
    smithPoly([[8,64],[17,54],[45,54],[42,57],[19,58],[11,66]],'#aa9170',null);
    for(let i=0;i<5;i++){
      const x=13+i*8;
      g.strokeStyle='#483c34';g.lineWidth=.6;g.beginPath();g.moveTo(x,65);g.lineTo(x-2,70);g.stroke();
    }
    smithPoly([[13,114],[51,114],[57,121],[7,121]],'#9d8160',null);
    smithPoly([[7,121],[57,121],[57,124],[7,124]],'#4f4134',null);
    // Individual tongs, chisel and mallet hang from forged hooks.
    g.fillStyle='#9b815a';g.fillRect(181,28,50,1);g.fillStyle='#342c28';g.fillRect(181,34,50,2);
    for(const x of [187,200,214]){
      g.strokeStyle='#2b353a';g.lineWidth=1;g.beginPath();g.moveTo(x-1,34);g.lineTo(x-1,37);g.lineTo(x+1,38);g.stroke();
    }
    g.strokeStyle='#a9b4b7';g.lineWidth=.9;g.beginPath();g.moveTo(188,38);g.lineTo(186,46);g.lineTo(188,52);g.moveTo(188,38);g.lineTo(191,46);g.lineTo(190,52);g.stroke();
    g.fillStyle='#4a3b2d';g.fillRect(198,37,4,14);g.fillStyle='#b9c2c0';g.fillRect(199,47,2,9);
    g.fillStyle='#d0b27c';g.fillRect(212,37,1.2,14);smithPoly([[209,40],[217,40],[217,44],[209,44]],'#83949c',null);
    // Iron corner straps, dovetailed drawer and worn end grain on the side chest.
    g.fillStyle='#b29362';g.fillRect(203,99,25,1);g.fillStyle='#3f3027';g.fillRect(204,105,23,1);
    for(const x of [204,224]){g.fillStyle='#4b5658';g.fillRect(x,104,2,23);g.fillStyle='#b3b0a1';g.fillRect(x+.4,106,.7,.7);}
    g.strokeStyle='#d0b57d';g.lineWidth=.8;g.strokeRect(213,111,5,2);
}
function smithKnightPose(time,lift,bounce,working,failed,forgeTime){
  const idle=working?0:1,breath=Math.sin(time*1.85),weight=Math.sin(time*.72),
    bodyX=idle*weight*.55+bounce*.65,bodyY=idle*breath*.28+bounce*.55,
    chest=1+idle*breath*.018;
  return {bodyX,bodyY,chest,
    headTilt:idle*Math.sin(time*.61)*.025+lift*.07,
    headDrop:failed?Math.min(2,Math.max(0,forgeTime-1.55)*4):0,
    left:{sx:-16,sy:3,ex:-22+idle*Math.sin(time*.72+.3)*.4,ey:17+idle*breath*.3,
      hx:-10+idle*weight*.5,hy:29+idle*Math.sin(time*1.85+.8)*.55},
    right:{sx:16,sy:3,ex:23+lift*3+idle*Math.sin(time*.72+1)*.5,
      ey:12-lift*13+idle*breath*.35,
      hx:20+lift*8+idle*Math.sin(time*1.1)*.35,
      hy:27-lift*42+idle*Math.sin(time*1.1+.8)*.65},
    plume:Math.sin(time*2.2)*.55+lift*.8};
}
function smithActingPose(p,t,order){
  // Authored continuous poses: delicately present the tiny tool, hold overhead,
  // then accelerate through the strike. Reactions cannot disclose rarity early.
  const keys=[
    [0,20,27,23,12,2.55,0,0,0],
    [.42,25,16,24,10,4.05,0,-.2,-.025],
    [1.13,20,-10,28,-1,4.55,-1,-.6,-.045],
    [1.32,20,-10,28,-1,4.55,-1,-.6,-.045],
    [1.55,20,27,23,12,2.55,0,0,0],
    [1.66,20,26,23,13,2.55,1,1.2,.025],
    [2.15,22,21,25,13,3.4,0,0,0],
    [2.8,22,21,25,13,3.4,0,0,0]];
  let a=keys[0],b=a;
  for(let i=1;i<keys.length;i++){b=keys[i];if(t<=b[0])break;a=b;}
  let u=clamp((t-a[0])/Math.max(.001,b[0]-a[0]),0,1);
  u=a[0]===1.32?u*u*u:smoothStep(u);
  const v=i=>lerp(a[i],b[i],u);
  Object.assign(p.right,{hx:v(1),hy:v(2),ex:v(3),ey:v(4)});
  p.hammerAngle=v(5);p.bodyX=v(6);p.bodyY=v(7);p.lean=v(8);
  p.hop=0;p.slip=0;p.openGrip=1-smoothStep(clamp((t-.8)/.33,0,1));
  p.headTilt=-.07*Math.sin(Math.min(t,1.55)/1.55*Math.PI);
  p.headDrop=0;p.glyph='';p.drop=false;
  const pulse=(start,end)=>{const q=clamp((t-start)/(end-start),0,1);return Math.sin(q*Math.PI);};
  if(!order.success&&order.failStyle===2){
    const miss=smoothStep(clamp((t-1.32)/.23,0,1))*(1-smoothStep(clamp((t-1.85)/.7,0,1)));
    p.right.hx+=miss*20;p.right.hy+=miss*3;p.right.ex+=miss*7;
  }
  if(!order.success&&t>=1.55){
    const f=order.failStyle||0,panic=pulse(1.55,3.3);
    if(f===0){
      p.drop=true;p.openGrip=1;p.right.hx+=panic*6;p.right.hy-=panic*12;
      p.left.hx-=panic*5;p.left.hy-=panic*13;p.headTilt=panic*.19;
      p.headDrop=panic*1.6;p.glyph=t<2.7?'?':'';
    }else if(f===1){
      const slip=pulse(1.55,3.25);p.slip=slip*13;p.bodyX=-slip*4;
      p.bodyY=slip*3;p.lean=-slip*.15;p.headTilt=slip*.20;
      p.left.hx-=slip*15;p.left.hy-=slip*28;
      p.right.hx+=slip*5;p.right.hy-=slip*24;p.glyph=t<2.8?'!':'';
    }else{
      p.headTilt=-panic*.22;p.left.hx+=panic*6;p.left.hy-=panic*13;
      p.glyph=t>1.75&&t<3?'...':'';
    }
  }
  if(order.success&&t>=SMITH_RULES.rarity){
    const rank=['COMMON','UNCOMMON','RARE','LEGENDARY'].indexOf(order.rarity),
      age=t-SMITH_RULES.rarity,ease=pulse(SMITH_RULES.rarity,7.2);
    if(rank===0){p.headDrop=Math.sin(clamp(age/1.3,0,1)*Math.PI*2)*.65;p.chest+=ease*.012;}
    if(rank===1){p.left.hy-=ease*25;p.left.hx-=ease*4;p.headTilt=-ease*.08;p.chest+=ease*.03;}
    if(rank===2){
      p.left.hy-=ease*35;p.left.hx-=ease*8;p.left.ey-=ease*12;
      p.right.hy-=ease*25;p.right.hx+=ease*3;p.chest+=ease*.035;
      p.hop=-Math.pow(Math.sin(clamp(age/1.2,0,1)*Math.PI),2)*1.6;p.glyph=age<1.5?'!':'';
    }
    if(rank===3){
      const surprise=pulse(SMITH_RULES.rarity,4.45),cheer=pulse(4.15,7.2);
      p.headTilt=surprise*.12;p.bodyX-=surprise*2;p.lean=-surprise*.06;
      p.left.hx+=surprise*4-cheer*12;p.left.hy-=surprise*31+cheer*36;
      p.left.ey-=cheer*14;p.right.hy-=surprise*23+cheer*29;p.right.ex+=cheer*3;
      p.hop=-Math.abs(Math.sin(clamp((t-4.3)/1.65,0,1)*Math.PI*2))*3.2;
      p.chest+=cheer*.04;p.glyph=age<.9?'?!':age<2.8?'!!!':'';
    }
  }
  return p;
}
function drawSmithHammer(x,y,angle){
  g.save();g.translate(x*U,y*U);g.rotate(angle);
  rigSegment(-.6,0,7.2,0,.7,'#a07a50');
  px(6.45,-1.65,1.7,3.3,'#aebbc5');px(6.45,-1.65,.5,3.3,'#edf4f7');g.restore();
}
function drawSmithGuardArm(arm,near=false,openGrip=0,layer='all'){
  const {sx,sy,ex,ey,hx,hy}=arm;
  // Max Guard's broad arm planes, doubled shoulder plates and square gauntlets.
  if(layer!=='forearm'){
  rigSegment(sx,sy,ex,ey,6.76,'#657380');
  rigSegment(sx-.8,sy,ex-.8,ey,3.4,'#a9b5bd');
  rigSegment(sx-1.9,sy+.4,ex-1.9,ey,.8,'#d0d9db');
  rigJoint(ex,ey,4.7,'#465563');rigJoint(ex-.6,ey-.7,3.8,'#9aaab4');
  }
  if(layer==='upper')return;
  rigSegment(ex,ey,hx,hy,5.4,near?'#8596a2':'#788997');
  rigSegment(ex-.7,ey-.6,hx-.7,hy-.6,3,'#b1bdc5');
  rigSegment(ex-1.6,ey-.7,hx-1.6,hy-.7,.6,'#dae1df');
  const dx=hx-ex,dy=hy-ey,length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length;
  for(const k of [.24,.61]){
    const x=lerp(ex,hx,k),y=lerp(ey,hy,k);
    rigSegment(x+nx*2.6,y+ny*2.6,x-nx*2.6,y-ny*2.6,.55,'#4b5966');
  }
  rigJoint(hx,hy,5.4,'#536371');rigJoint(hx-.3,hy-.6,4.6,'#b4c1c8');
  px(hx-2.5,hy-2.9,4.5,.75,'#e0e5e4');
  for(let i=0;i<3;i++)px(hx-1.8+i*1.35,hy-1.2,.7,2.6,'#718391');
  if(openGrip>0){
    // Thumb and forefinger pinch the handle; the other fingers curl clear of it.
    rigSegment(hx-1,hy+.2,hx-.5,hy+2,1,'#e0e5e4');
    rigSegment(hx+.4,hy+.2,hx+1.4,hy+1.4,1,'#b4c1c8');
    for(let i=0;i<2;i++)rigSegment(hx+1+i,hy-.5,hx+2.5+i,hy-1.8-openGrip,.7,'#c4ced5');
  }
}
function drawSmithPauldron(side,sy){
  g.save();g.translate(side*16*U,sy*U);g.scale(side*.78,.90);
  rigPolygon([[-6,-1],[-3,-5],[5,-4],[10,0],[11,6],[7,9],[-3,7]],'#455565');
  rigPolygon([[-6,-2],[-3,-6],[5,-5],[10,-1],[8,4],[-3,4]],'#a8b5bf');
  rigPolygon([[-6,-2],[-3,-6],[5,-5],[6,-3],[-3,-3]],'#d8dfe0');
  rigPolygon([[6,-3],[10,-1],[8,4],[5,3]],'#798c9b');
  rigPolygon([[-3,4],[8,4],[10,7],[7,10],[-2,8]],'#8b9ca8');
  rigSegment(-3,4,8,4,.8,'#d7b878');rigSegment(-2,8,7,10,.6,'#a8793e');
  rigJoint(5,1,1.15,'#d7b878');g.restore();
}
function drawSmithKnight(x,y,lift,bounce,failed,t,working,order=null){
  const pose=smithKnightPose(perfNow,lift,bounce,working,failed,t),
    dark='#4b5966',armor='#919da7',light='#c4ced5',trim='#d7b878';
  if(order&&working)smithActingPose(pose,t,order);
  g.save();g.translate(x,y);g.scale(.62,.62);g.translate(0,(pose.hop||0)*U);
  // Feet remain planted while knees absorb the slow shift of the giant body.
  for(const side of [-1,1]){
    g.save();g.translate((side===1?pose.slip||0:0)*U,0);
    const hip=side*5+pose.bodyX*.4,knee=side*6+pose.bodyX*.2;
    rigSegment(hip,31,knee,38,2.8,dark);rigJoint(knee,38,3,armor);
    rigSegment(knee,38,side*6,43,2.2,armor);rigSegment(knee-.5,38,side*6-.5,42,.55,light);
    rigPolygon([[side*6-1.3,41],[side*6+1.3,41],[side*6+2.5,45],[side*6-2,45]],dark);
    px(side*6-1.3,41.5,2.6,.85,light);
    g.restore();
  }
  g.save();g.translate(pose.bodyX*U,pose.bodyY*U);
  g.translate(0,28*U);g.rotate(pose.lean||0);g.translate(0,-28*U);
  // Living Bastion's long rigid cuirass, tapering to a small smith's waist.
  g.save();g.scale(pose.chest,1);
  rigPolygon([[-15,-1],[-8,-4],[8,-4],[15,-1],[11.5,15],[6.5,30],[-6.5,30],[-11.5,15]],dark);
  rigPolygon([[-13.5,1],[-6,-1],[0,.5],[0,25],[-6.2,27],[-10.3,14]],armor);
  rigPolygon([[0,.5],[6,-1],[13.5,1],[10.3,14],[6.2,27],[0,25]],'#8293a0');
  rigPolygon([[-13.5,1],[-6,-1],[0,.5],[0,2.4],[-6,1.2],[-13.2,3.2]],light);
  rigPolygon([[0,.5],[6,-1],[13.5,1],[13.2,3.2],[6,1.2],[0,2.4]],'#afbdc6');
  rigPolygon([[-13.5,3],[-10.3,14],[-6.2,27],[-7.5,27],[-11.5,15],[-15,1]],'#6b7e8b');
  rigPolygon([[13.5,3],[15,1],[11.5,15],[7.5,27],[6.2,27],[10.3,14]],'#5d7282');
  rigSegment(-.3,2,-.3,24,1.05,'#c4ced5');
  // Gold Bastion chevron follows the cuirass planes, not a flat painted triangle.
  rigSegment(-10.5,5,0,14,.75,trim);rigSegment(0,14,10.5,5,.75,trim);
  rigJoint(0,14,1.6,'#a8793e');rigJoint(-.25,13.7,.8,'#ead7a8');
  for(let row=0;row<2;row++){
    const top=23+row*3,w=8-row*.8;
    rigQuad(-w,top,w,top,w-.8,top+3,-w+.8,top+3,row%2?'#778b99':'#889ba8');
    rigSegment(-w,top,w,top,.6,'#b3c3cc');
  }
  // Short split apron, rather than a strip covering the whole chest.
  rigPolygon([[-6,28],[6,28],[6.5,35],[1,35],[0,31],[-1,35],[-6.5,35]],'#59412e');
  rigSegment(-6,28,6,28,1.8,'#3a281f');px(-1.3,27.1,2.6,1.8,trim);
  rigSegment(-4.5,30,-5,34,.8,'#8c6846');
  // Raised gorget cradles the helmet; no thin floating neck.
  rigPolygon([[-9,-4],[-5,-7],[5,-7],[9,-4],[6,1],[-6,1]],'#536575');
  rigSegment(-8,-3,-4,-5,1.2,light);rigSegment(-4,-5,4,-5,1.2,light);rigSegment(4,-5,8,-3,1.2,trim);
  g.restore();
  // Both arms are on the viewer-facing side of this frontal pose. Drawing the
  // left arm before the cuirass hid its forearm whenever the idle rig crossed it.
  drawSmithGuardArm(pose.left,false,0,'upper');
  drawSmithGuardArm(pose.right,true,0,'upper');
  drawSmithPauldron(-1,pose.left.sy-2);drawSmithPauldron(1,pose.right.sy-2-lift*1.2);
  g.save();g.translate(0,(-4+pose.headDrop)*U);g.rotate(pose.headTilt);
  const h=drawSquireHelmet25D(0,-.7,.17+lift*.18,1.38,armor,dark,light,'#edf4f7',trim);
  // Front-facing visor and shadowed eye slits on the same projected Squire cap.
  rigPolygon([[-3.6,h.planeY+1.8],[3.6,h.planeY+1.8],[3.1,h.bottomY-.8],[0,h.bottomY+.3],[-3.1,h.bottomY-.8]],'#788c9c');
  px(-3.35,h.planeY+2,2.65,.85,'#17222b');px(.7,h.planeY+2,2.65,.85,'#17222b');
  rigSegment(0,h.planeY+1.5,0,h.bottomY-.7,.75,'#d5dfe3');
  for(const side of [-1,1])for(let i=0;i<2;i++)px(side*(1.2+i*.85)-.25,h.bottomY-1.6,.48,.8,'#354958');
  rigSegment(0,h.crownY,0,h.crownY-2.4,.85,'#738c9f');
  rigPolygon([[0,h.crownY-2.4],[2,h.crownY-4.2],[5.3+pose.plume,h.crownY-3.5],
    [3.2+pose.plume,h.crownY-1.6],[1,h.crownY-1.5]],'#627bdd');
  g.restore();
  // Raised wrists belong in front of the pauldrons and face, not behind them.
  drawSmithGuardArm(pose.left,false,0,'forearm');
  drawSmithGuardArm(pose.right,true,pose.openGrip??1,'forearm');
  const hand=pose.right;
  if(!pose.drop)drawSmithHammer(hand.hx,hand.hy,pose.hammerAngle??2.55);
  if(pose.glyph){g.fillStyle='#ffe7ac';g.font='bold 11px monospace';g.textAlign='center';g.fillText(pose.glyph,14*U,-13*U);}
  g.restore();g.restore();
}
function drawSmithScene(shop,pov=false){
  const t=shop.clock,order=shop.order,working=shop.phase!=='browse',
    hit=working&&t>=SMITH_RULES.impact,failed=hit&&!order.success,
    wind=working?smoothStep(clamp((t-.55)/.6,0,1)):0,
    slam=working?easeIn(clamp((t-1.32)/.23,0,1)):0,
    lift=wind*(1-slam),bounce=hit?Math.max(0,1-(t-SMITH_RULES.impact)*4):0;
  g.save();g.translate(pov?-24:0,pov?5:82);g.scale(pov?2.4:2,pov?2.4:2);
  g.beginPath();g.rect(0,0,240,140);g.clip();
  try{
    drawSmithForgeBackdrop();
    // Local furnace fire; no full-screen lighting/shadow pass on mobile.
    const fire=Math.floor(perfNow*10)%3;
    g.fillStyle='#963d2e';g.fillRect(20,87,27,23);
    g.fillStyle='#e87b39';g.fillRect(23,80+fire*2,6,30-fire*2);g.fillRect(32,83,8,27);g.fillRect(42,89-fire*2,4,21+fire*2);
    g.fillStyle='#ffe09a';g.fillRect(26,94,6,16);g.fillRect(35,90+fire,6,20-fire);
    g.fillStyle='#111610';g.beginPath();g.ellipse(111,125,31,6,0,0,TAU);g.fill();
    drawSmithKnight(110,43,lift,bounce,failed,t,working,order);
    // Anvil: three hard material planes, matching in-game metal/rock shading.
    g.fillStyle='#49321f';g.fillRect(123,111,22,22);g.fillStyle='#765132';g.fillRect(124,113,4,18);g.fillRect(140,111,3,20);
    g.save();g.translate(134,102);g.scale(.6,.6);
    rigPolygon([[-16,0],[17,0],[21,-3],[18,3],[8,6],[7,12],[-7,12],[-6,6],[-14,4]],'#4b5966');
    rigPolygon([[-19,-2],[16,-2],[21,-3],[17,0],[-16,0]],'#c4ced5');
    rigQuad(-7,7,7,7,7,10,-7,10,'#919da7');g.restore();
    if(working){const move=smoothStep(clamp(t/.5,0,1));
      drawSmithItem(smithItemKind(order.skillId),134+(1-move)*28,100-Math.sin(move*Math.PI)*18,.65);}
    if(hit&&t<2.2&&(!failed||order.failStyle===2)){const k=(t-SMITH_RULES.impact)/.65,impactX=failed?172:134;
      for(let i=0;i<9;i++){g.fillStyle=i%2?'#eab963':'#ffe7ac';
        g.fillRect(Math.round(impactX+Math.cos(i*1.8)*k*26),Math.round(99-Math.abs(Math.sin(i*1.8))*k*23+k*k*15),1+i%2,1+i%2);}}
    if(failed&&order.failStyle===0){
      const age=t-SMITH_RULES.impact,k=clamp(age/.65,0,1),settle=clamp((age-.65)/.5,0,1);
      g.save();g.translate(147+k*12,93+37*k*k-Math.sin(settle*Math.PI)*5);
      g.scale(.62,.62);drawSmithHammer(0,0,2.55+k*5+settle*.6);g.restore();
    }
    // A few small embers, kept inside the scene and away from the card UI.
    for(let i=0;i<4;i++){const phase=(perfNow*.3+i*.23)%1;g.globalAlpha=(1-phase)*.5;g.fillStyle='#e6ae5a';
      g.fillRect(24+i*6+Math.sin(perfNow+i)*2,98-phase*30,1,1);}g.globalAlpha=1;
  }finally{g.restore();}
  if(shop.phase==='result'){
    const praise={COMMON:'"SOLID WORK."',UNCOMMON:'"STILL GOT IT."',RARE:'"DID YOU SEE THAT?!"',LEGENDARY:'"I... MEANT TO DO THAT!"'},
      excuses=['"GRAVITY. NOT MY FAULT."','"WHO POLISHED THIS FLOOR?!"','"THE ANVIL NEEDED AN UPGRADE."'];
    if(!pov)smithText(order.success?praise[order.rarity]:excuses[order.failStyle||0],240,354,10,'#d7b48b');
  }
}
