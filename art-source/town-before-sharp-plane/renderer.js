function townProject(x,y,z){
  const p=TOWN_EYE;return [p.x+x*p.focal/z,p.y+(p.height-y)*p.focal/z];
}
function townInk(points,color,edge=null,width=.7){
  g.beginPath();for(let i=0;i<points.length;i++)g[i?'lineTo':'moveTo'](...points[i]);g.closePath();
  g.fillStyle=color;g.fill();if(edge){g.strokeStyle=edge;g.lineWidth=width;g.stroke();}
}
function townPlane(points,color,edge=null){townInk(points.map(p=>townProject(...p)),color,edge);}
function townStroke(points,color,width=1){
  g.beginPath();points.forEach((p,i)=>g[i?'lineTo':'moveTo'](...p));g.strokeStyle=color;g.lineWidth=width;g.stroke();
}
function townFacePatch(face,u,v,w,h,color){
  townPlane([face(u,v),face(u+w,v),face(u+w,v+h),face(u,v+h)],color);
}
function townArch(face,u,y,w,h,color){
  townPlane([[u,y],[u+w,y],[u+w,y+h*.72],[u+w*.85,y+h*.91],
    [u+w*.5,y+h],[u+w*.15,y+h*.91],[u,y+h*.72]].map(([a,b])=>face(a,b)),color);
}
function townWindow(face,u,y,w,h,shutters=false){
  townArch(face,u-.025,y-.06,w+.05,h+.15,'#463c36');
  townArch(face,u,y,w,h,'#c9b08b');
  townArch(face,u+.016,y+.07,w-.032,h-.08,'#26333d');
  townArch(face,u+.026,y+.13,w-.052,h-.2,'#bd985c');
  townFacePatch(face,u+.035,y+.15,(w-.07)*.44,h*.58,'#dfbd79');
  // Leaded glass, recessed sill and individually shaded shutter boards.
  townFacePatch(face,u+w/2-.007,y+.08,.014,h-.13,'#4b4741');
  townFacePatch(face,u+.017,y+h*.45,w-.034,.035,'#514b40');
  for(let i=0;i<3;i++){
    const yy=y+.21+i*h*.19;
    townPlane([face(u+.03,yy),face(u+w*.48,yy+h*.12),face(u+w-.03,yy),
      face(u+w*.52,yy-h*.12)],'#af8b59');
  }
  townFacePatch(face,u-.04,y-.1,w+.08,.09,'#9e8b6e');
  townFacePatch(face,u-.04,y-.14,w+.08,.035,'#e2cca1');
  if(shutters)for(const a of [u-w*.48,u+w+.03]){
    townFacePatch(face,a,y,w*.43,h*.85,'#536763');
    for(let i=0;i<3;i++)townFacePatch(face,a+i*w*.14,y,.012,h*.85,'#7b8977');
    townFacePatch(face,a,y+.15,w*.43,.035,'#333f3c');
    townFacePatch(face,a,y+h*.66,w*.43,.035,'#333f3c');
  }
}
function townFacade(face,h,hero=false,kind='',sunny=true){
  const wall=sunny?'#c4b594':'#8d958c',wood=sunny?'#51463c':'#373f3e';
  townFacePatch(face,0,0,1,h,wall);
  townFacePatch(face,0,h-.2,1,.2,'#555a51');
  townFacePatch(face,0,0,1,.95,'#626e70');
  // Cut stone footing: alternate joints, chips and narrow top bevels.
  for(let row=0;row<3;row++)for(let col=0;col<8;col++){
    const u=col/8+(row%2)*.0625;if(u>=1)continue;
    const width=Math.min(.119,1-u);
    townFacePatch(face,u,row*.29,width,.255,(row+col)%3?'#7e8982':'#949b8b');
    townFacePatch(face,u,row*.29+.226,width,.026,'#b1b39b');
    if((row+col)%3===0)townFacePatch(face,u+.02,row*.29+.09,.021,.05,'#535f61');
  }
  // Deep horizontal cornices and braced timber frame.
  for(const y of [.91,h*.51,h-.27]){
    townFacePatch(face,0,y,1,.15,wood);
    townFacePatch(face,0,y+.135,1,.028,'#9b8a67');
  }
  for(const u of [.012,.328,.652,.968]){
    townFacePatch(face,u,.92,.028,h-.92,wood);
    townFacePatch(face,u+.004,.96,.006,h-.98,'#8b795b');
    if(hero)for(let i=0;i<4;i++){
      const yy=1.2+i*(h-1.4)/4;
      townFacePatch(face,u+.017,yy,.003,.26,'#aa9471');
      townFacePatch(face,u+.008,yy+.32,.006,.055,'#292f2e');
    }
  }
  for(const u of [.04,.67]){
    townPlane([face(u,h*.54),face(u+.025,h*.54),face(u+.27,h-.31),face(u+.245,h-.31)],wood);
    townPlane([face(u,h-.31),face(u+.022,h-.31),face(u+.27,h*.54),face(u+.248,h*.54)],wood);
  }
  townWindow(face,.17,h*.62,.115,h*.24,hero);
  townWindow(face,.75,h*.62,.115,h*.24,hero);
  if(!hero){
    townArch(face,.40,.05,.19,h*.41,'#373b37');
    for(let i=0;i<4;i++)townFacePatch(face,.417+i*.041,.06,.033,h*.28,'#6d5a44');
    townFacePatch(face,.41,.45,.16,.048,'#262e30');
    townWindow(face,.10,1.16,.13,.78);
    return;
  }
  if(kind==='smith'){
    // Wide, dark working bay with fire, masonry jambs and an anvil inside.
    townArch(face,.20,.04,.55,h*.49,'#5c5548');
    townArch(face,.225,.08,.50,h*.455,'#202931');
    townArch(face,.267,.46,.18,1.47,'#5b382b');
    townFacePatch(face,.284,.48,.145,.74,'#b86332');
    townPlane([face(.29,.48),face(.302,1.15),face(.327,.83),face(.351,1.34),
      face(.38,.93),face(.397,1.1),face(.413,.48)],'#e8a14b');
    townFacePatch(face,.319,.48,.061,.44,'#f7d991');
    townFacePatch(face,.51,.05,.17,.63,'#5d4534');
    townPlane([[.46,.80],[.73,.80],[.77,.94],[.75,.65],[.64,.54],
      [.63,.30],[.54,.30],[.54,.53],[.49,.62]].map(([a,b])=>face(a,b)),'#73838c');
    townFacePatch(face,.465,.79,.265,.065,'#c8d0cd');
    for(const u of [.16,.79]){
      townFacePatch(face,u,0,.034,h*.5,'#51483c');
      townFacePatch(face,u+.003,.05,.008,h*.47,'#a38c64');
    }
    // Forged tools on the wall, not generic coloured blocks.
    for(let i=0;i<3;i++){
      const u=.86+i*.04;
      townFacePatch(face,u,1.23,.008,.77,'#b2935a');
      townFacePatch(face,u-.012,1.95,.033,.09,'#a9b9bd');
    }
  }else{
    townArch(face,.47,0,.24,h*.46,'#363c35');
    townArch(face,.49,.06,.20,h*.42,'#725340');
    for(let i=0;i<5;i++)townFacePatch(face,.50+i*.036,.08,.007,h*.34,'#9f8054');
    townFacePatch(face,.50,.65,.18,.065,'#333c3d');
    townFacePatch(face,.65,1.05,.025,.07,'#dfc681');
    townWindow(face,.12,1.28,.23,1.14);
  }
  // Plaster repairs remain sparse; material detail must not become visual noise.
  for(const [u,y] of [[.075,h*.56],[.48,h*.84],[.91,1.13]])
    townPlane([face(u,y),face(u+.055,y+.03),face(u+.049,y+.17),face(u+.01,y+.12)],sunny?'#ab9c7f':'#78867f');
}
function townHouse3D(b){
  const {x0,x1,z0,z1,h,roofHeight=2,kind='',hero=false}=b,mid=(x0+x1)/2;
  const left=x1<0,inner=left?x1:x0;
  const front=(u,v)=>[x0+(x1-x0)*u,v,z0];
  const side=(u,v)=>[inner,v,z0+(z1-z0)*u];
  // Receding side and street-facing planes are part of one volume.
  townFacade(front,h,hero,kind,true);
  townFacade(side,h,hero,kind,left);
  const ridge=h+roofHeight,eave=h+.08;
  townPlane([[x0-.18,eave,z0-.18],[mid,ridge,z0-.18],[x1+.18,eave,z0-.18]],'#675d50','#302f30');
  townPlane([[x0,eave,z0-.20],[mid,ridge-.20,z0-.20],[x1,eave,z0-.20]],'#b8aa87');
  for(const u of [.2,.38,.62,.8]){
    const xx=x0+(x1-x0)*u,hh=h+roofHeight*(1-Math.abs(u-.5)*2);
    townPlane([[xx-.045,h,z0-.22],[xx+.045,h,z0-.22],[xx+.045,hh-.1,z0-.22],[xx-.045,hh-.1,z0-.22]],'#514c40');
  }
  townPlane([[x0-.28,eave,z0-.33],[mid,ridge+.08,z0-.33],[mid,ridge+.08,z1+.22],[x0-.28,eave,z1+.22]],'#3d4c57');
  townPlane([[mid,ridge+.08,z0-.33],[x1+.28,eave,z0-.33],[x1+.28,eave,z1+.22],[mid,ridge+.08,z1+.22]],b.roof||'#566572');
  // Tile courses actually lie on the roof plane and shrink into the distance.
  const edge=left?x1+.28:x0-.28,near=z0-.33,depth=z1+.22-near;
  const roofPoint=(u,v)=>[mid+(edge-mid)*u,ridge+.08+(eave-ridge-.08)*u,near+depth*v];
  const tiles=(b.seed||0)%3===2?['#694f48','#866555','#78594d','#9a7860']:
    (b.seed||0)%3===1?['#486364','#5e7771','#405656','#7c8980']:['#536372','#65727b','#485963','#72808a'];
  for(let row=0;row<7;row++)for(let col=0;col<Math.ceil(depth*2);col++){
    const count=Math.ceil(depth*2),v=(col+(row%2)*.5)/count;if(v>=1)continue;
    const u=row/7,ww=Math.min(.97/count,1-v);
    townPlane([roofPoint(u+.009,v),roofPoint((row+1)/7-.009,v),roofPoint((row+1)/7-.009,v+ww),roofPoint(u+.009,v+ww)],
      tiles[(row*3+col*7+(b.seed||0))%4]);
    if(col%3===0)townPlane([roofPoint((row+1)/7-.029,v),roofPoint((row+1)/7-.009,v),roofPoint((row+1)/7-.009,v+ww),roofPoint((row+1)/7-.029,v+ww)],'#829093');
  }
  townStroke([[x0-.3,eave,z0-.35],[mid,ridge+.1,z0-.35],[x1+.3,eave,z0-.35]].map(p=>townProject(...p)),'#d0bb8d',hero?2.1:.85);
  townStroke([[mid,ridge+.12,z0-.35],[mid,ridge+.12,z1+.24]].map(p=>townProject(...p)),'#a7aaa0',hero?1.5:.7);
  townStroke([[edge,h,z0-.35],[edge,h,z1+.24]].map(p=>townProject(...p)),'#262f35',hero?2:1);
  // Projecting upper-floor supports with bright end grain.
  for(let i=0;i<5;i++){
    const zz=z0+.5+i*(z1-z0-1)/4,x=inner+(left?.14:-.14);
    townPlane([[inner,h*.49,zz],[x,h*.51,zz],[x,h*.40,zz],[inner,h*.35,zz]],'#4b4439');
    townPlane([[inner,h*.49,zz],[x,h*.51,zz],[x,h*.51,zz+.13],[inner,h*.49,zz+.13]],'#ac9670');
  }
  if(hero||b.chimney){
    const cx=left?mid-.35:mid+.35,cz=z0+(z1-z0)*.64,cy=ridge-.25;
    townBox(cx,cy,cz,.57,1.45,.62,'#89908a','#59696b');
    for(let i=0;i<4;i++)townPlane([[cx,cy+i*.31,cz],[cx+.57,cy+i*.31,cz],[cx+.57,cy+i*.31+.035,cz],[cx,cy+i*.31+.035,cz]],'#536062');
    townBox(cx-.09,cy+1.38,cz-.06,.74,.17,.74,'#bdbda5','#788681');
  }
  if(kind==='store'){
    // Scalloped canvas awning with projecting poles on the street face.
    const outer=inner-.80,az=z0+.95,bz=z1-.40;
    for(let i=0;i<9;i++){
      const a=az+(bz-az)*i/9,b=az+(bz-az)*(i+1)/9;
      townPlane([[inner,2.48,a],[inner,2.48,b],[outer,2.07,b],[outer,2.07,a]],i%2?'#d7c4a0':'#527675');
      townPlane([[outer,2.07,a],[outer,2.07,b],[outer,1.89,b-.04],[outer,1.86,(a+b)/2],[outer,1.89,a+.04]],i%2?'#b39e7c':'#375c61');
    }
    for(const zz of [az+.1,bz-.1])townBox(outer-.04,0,zz,.065,2.16,.065,'#927850','#4c4438');
    townBox(inner-.65,0,z0+1.4,.61,.62,1.45,'#9a7850','#654f3b');
    // Fruit and folded fabric stay on the stall's top plane.
    for(let i=0;i<12;i++){
      const p=townProject(inner-.52+(i%3)*.15,.69,z0+1.52+Math.floor(i/3)*.26),sz=360/(z0+1.7)*.065;
      townInk([[p[0]-sz,p[1]],[p[0]-sz*.5,p[1]-sz],[p[0]+sz*.6,p[1]-sz*.9],[p[0]+sz,p[1]],[p[0],p[1]+sz*.5]],i%3?'#b99853':'#8f5140');
    }
  }
}
function townBox(x,y,z,w,h,d,front='#8d8068',side='#5e655d'){
  townPlane([[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z]],front);
  const xx=x<0?x+w:x;
  townPlane([[xx,y,z],[xx,y,z+d],[xx,y+h,z+d],[xx,y+h,z]],side);
  townPlane([[x,y+h,z],[x+w,y+h,z],[x+w,y+h,z+d],[x,y+h,z+d]],'#b5aa8d');
}
function townTower(x,z,w,h,roof=true){
  townBox(x,0,z,w,h,w,'#87958e','#586f73');
  for(let row=0;row<Math.ceil(h/.8);row++){
    const yy=row*.8;
    townPlane([[x,yy,z-.01],[x+w,yy,z-.01],[x+w,yy+.035,z-.01],[x,yy+.035,z-.01]],'#6b7e7c');
    for(let col=0;col<3;col++){
      const xx=x+(col+(row%2)*.5)*w/3;
      townPlane([[xx,yy,z-.015],[xx+.035,yy,z-.015],[xx+.035,yy+.8,z-.015],[xx,yy+.8,z-.015]],'#6b7e7c');
    }
  }
  const face=(u,v)=>[x+u*w,v,z-.025];
  for(let i=0;i<3;i++)townArch(face,.35,h*.28+i*h*.22,.24,h*.13,'#374f58');
  townBox(x-.12,h-.3,z-.1,w+.24,.37,w+.2,'#c0bd9f','#7e9087');
  if(roof){
    townPlane([[x-.4,h,z-.4],[x+w+.4,h,z-.4],[x+w/2,h+w*1.9,z+w/2]],'#455773');
    townPlane([[x+w+.4,h,z-.4],[x+w+.4,h,z+w+.4],[x+w/2,h+w*1.9,z+w/2]],'#30465e');
    townStroke([[x-.4,h,z-.4],[x+w/2,h+w*1.9,z+w/2]].map(p=>townProject(...p)),'#9eaa9e',.8);
  }else for(let i=0;i<4;i++)townBox(x+i*w/4,h,z,.15*w,.7,.22*w,'#b6b69e','#6b827f');
}
function townBarrel(x,z,size=1){
  const p=townProject(x,0,z),s=360/z*size;g.save();g.translate(...p);
  townInk([[-.28*s,-.03*s],[-.34*s,-.44*s],[-.27*s,-.86*s],[.24*s,-.86*s],[.32*s,-.45*s],[.27*s,0]],'#6f5036','#3c3830',.8);
  for(let i=0;i<5;i++){
    const xx=(-.23+i*.11)*s;townStroke([[xx,-.80*s],[xx*1.14,-.43*s],[xx,-.08*s]],i%2?'#987147':'#4d402f',Math.max(.55,s*.025));
  }
  for(const yy of [-.7,-.19])townInk([[-.3*s,yy*s],[.29*s,yy*s],[.30*s,(yy+.07)*s],[-.31*s,(yy+.07)*s]],'#596568');
  townInk([[-.27*s,-.86*s],[0,-.93*s],[.24*s,-.86*s],[0,-.79*s]],'#b18b57','#514533',.7);g.restore();
}
function townStaticScene(c){
  g.fillStyle=c.sky;g.fillRect(0,-PAD_TOP,480,800+PAD_TOT);
  townInk([[-40,155],[28,139],[95,151],[153,120],[213,143],[300,126],[388,150],[489,113],[500,310],[-30,310]],'#6e8988');
  townInk([[-20,207],[34,181],[104,197],[172,166],[231,199],[286,180],[343,186],[414,166],[500,188],[500,330],[-20,330]],'#546f70');
  // Angular, quiet cloud ribbons; the architecture remains the focal point.
  townInk([[31,70],[69,70],[79,63],[119,64],[130,74],[168,77],[158,82],[47,82]],'#bfccbd');
  townInk([[306,106],[328,99],[356,101],[366,110],[411,113],[402,119],[293,119]],'#aebeb1');
  // A walled hill town beyond the market street: a distinct large-scale skyline.
  townBox(-18,0,67,39,10,4,'#82978f','#597777');
  for(let i=0;i<25;i++)townBox(-18+i*1.6,10,67,.86,.8,.8,'#b2b69e','#637e7e');
  townTower(-16,63,4.2,15,false);townTower(12,66,4.4,17,false);
  townBox(-7,0,60,13,14,7,'#9baa98','#6c8780');
  townTower(-6,57,3.3,20,true);townTower(2,62,3.9,22,true);
  townPlane([[-5,14,59],[4,14,59],[-.5,19,63]],'#4d6173');
  const castleFace=(u,v)=>[-6+u*11,v,59.8];
  for(const u of [.19,.43,.68])townArch(castleFace,u,9,.10,3.4,'#4c6667');
  // A valley of roof silhouettes rather than a bare wall immediately ahead.
  for(let i=0;i<14;i++){
    const x=-18+i*2.7,z=44+(i%3)*3,h=5+(i*7%5);
    townHouse3D({x0:x,x1:x+2.65,z0:z,z1:z+4,h,roofHeight:1.7,seed:i});
  }
  g.fillStyle='#817f6c';g.fillRect(0,321,480,479+PAD_BOT);
  townPlane([[-2.8,0,45],[3.1,0,45],[6.5,0,3.0],[-7,0,3.0]],'#b0a386');
  // Projected cobbles: varied broad facets, deliberately not an outlined tile grid.
  for(let row=0;row<48;row++){
    const zz=3.0+row*.72;
    for(let col=-11;col<=11;col++){
      const x=col*.53+(row%2)*.265,j=((row*19+col*31)%9+9)%9;
      townPlane([[x+.035,0,zz+.04],[x+.49,0,zz+.05],[x+.51,0,zz+.66],[x+.02,0,zz+.63]],
        ['#a5977d','#b4a78b','#9e957e','#bcae90','#aa9f83'][j%5]);
      if(j===2)townPlane([[x+.04,.001,zz+.06],[x+.47,.001,zz+.06],[x+.44,.001,zz+.15],[x+.06,.001,zz+.14]],'#c9b996');
    }
  }
  for(const side of [-1,1]){
    townPlane([[side*3.2,.01,30],[side*3.2,.01,5],[side*3.55,.01,5],[side*3.55,.01,30]],'#636e66');
    for(let i=0;i<28;i++){
      const z=5+i*.9;
      townBox(side<0?-3.63:3.23,.015,z,.38,.08,.83,'#8f9685','#717e74');
    }
  }
  // Ground shadows from the same structures, before their walls and props.
  townPlane([[-3,0,5.5],[-3,0,15],[-.9,0,14],[-.5,0,6.5]],'#7c806e');
  townPlane([[3.4,0,6.5],[3.4,0,16],[1.85,0,17],[2.0,0,8]],'#979379');
  townTower(5.4,24,2.8,11.2,true);
  const homes=[
    {x0:-9,x1:-3.4,z0:31,z1:38,h:5.4,roofHeight:2.4,seed:1},
    {x0:3.8,x1:9,z0:30,z1:39,h:6.5,roofHeight:2.5,seed:3},
    {x0:-8,x1:-3.2,z0:23,z1:31,h:6.7,roofHeight:2.3,chimney:true},
    {x0:3.5,x1:8.7,z0:22,z1:30,h:5.8,roofHeight:2.7,seed:1},
    {x0:-8.2,x1:-3.35,z0:15,z1:23,h:5.9,roofHeight:2.8,seed:3},
    {x0:3.65,x1:9,z0:15,z1:23,h:6.8,roofHeight:2.7,chimney:true}
  ];
  for(const h of homes)townHouse3D(h);
  // Covered side alley: makes the city interlock, instead of two isolated rows.
  townBox(-3.5,3.65,25,7,1.6,2.1,'#aa9d80','#67776c');
  const bridge=(u,v)=>[-3.5+u*7,v,24.95];
  for(const u of [.04,.31,.59,.92])townFacePatch(bridge,u,3.65,.025,1.6,'#494b3e');
  townFacePatch(bridge,0,3.65,1,.14,'#4c5144');
  townWindow(bridge,.12,3.95,.14,.94);townWindow(bridge,.68,3.95,.14,.94);
  townPlane([[-3.8,5.3,24.7],[3.8,5.3,24.7],[3.5,6.0,27.3],[-3.5,6.0,27.3]],'#506577');
  // The inn balcony is scenery for now, not a third interaction/menu.
  townBox(-3.45,2.5,16,.85,.17,3.8,'#a59778','#57645d');
  for(let i=0;i<10;i++)townBox(-2.65,2.6,16+i*.39,.045,.62,.045,'#baa784','#59655d');
  townBox(-2.69,3.20,15.94,.10,.09,3.99,'#b4a07b','#47594f');
  townHouse3D({x0:-8,x1:-3,z0:5.5,z1:14.5,h:5.35,roofHeight:2.9,hero:true,kind:'smith'});
  townHouse3D({x0:3.5,x1:9,z0:6.6,z1:15,h:5.9,roofHeight:3.1,hero:true,kind:'store',seed:2});
  // Large foreground details carry the same facet/highlight language as armour.
  townBarrel(-3.12,5.6,1.1);townBarrel(-3.73,5.0,1.25);townBarrel(3.28,6.1,.9);
  townBox(3.45,0,5.2,.8,.56,.75,'#997c50','#63583e');
  const crate=(u,v)=>[3.45+u*.8,v,5.19];
  for(const u of [.08,.30,.53,.78])townFacePatch(crate,u,.04,.034,.47,'#564b38');
  townFacePatch(crate,0,.12,1,.07,'#b39560');townFacePatch(crate,0,.43,1,.055,'#baa171');
  // A real game shield on the smith's display connects town materials to combat art.
  const shield=townProject(-3.06,1.53,5.9);
  drawSerJonathanShield(shield[0]/U,shield[1]/U,.14,-.08,1.05);
}
let townSceneCache=null;
function townBackdrop(c){
  // Native-resolution cache: no low-res sprites, no per-frame roof/cobble rebuild.
  const scale=Math.max(1,viewScale)*1.18,key=[c.id,scale,PAD_TOP,PAD_BOT].join(':');
  if(!townSceneCache||townSceneCache.key!==key){
    const canvas=document.createElement('canvas');
    canvas.width=Math.ceil(480*scale);canvas.height=Math.ceil((800+PAD_TOT)*scale);
    const live=g;try{
      g=canvas.getContext('2d');g.setTransform(scale,0,0,scale,0,PAD_TOP*scale);
      townStaticScene(c);
    }finally{g=live;}
    townSceneCache={key,canvas};
  }
  g.save();g.imageSmoothingEnabled=true;
  g.drawImage(townSceneCache.canvas,0,-PAD_TOP,480,800+PAD_TOT);g.restore();
}
function townHangingSign(x,y,label,kind){
  const sway=Math.sin(perfNow*1.1+x)*.018;
  townStroke([[x-31,y-45],[x-31,y-55],[x+25,y-55]],'#293941',3);
  townStroke([[x-29,y-53],[x-9,y-42],[x+15,y-53]],'#9b976f',1.1);
  g.save();g.translate(x,y-48);g.rotate(sway);
  for(const xx of [-18,18])townStroke([[xx,-4],[xx,17]],'#3d4849',1.8);
  townInk([[-30,13],[30,13],[34,19],[34,55],[26,63],[-26,63],[-34,55],[-34,19]],'#323e42','#bca578',1.4);
  townInk([[-28,18],[28,18],[28,52],[22,58],[-22,58],[-28,52]],'#526361');
  townStroke([[-28,19],[28,19]],'#d2ba8a',1);
  if(kind==='smith'){
    townInk([[-20,32],[14,32],[22,26],[20,37],[5,42],[4,48],[-10,48],[-9,41],[-16,39]],'#98a8b0');
    townStroke([[-20,32],[14,32],[22,26]],'#e1debf',1.8);
    townStroke([[-5,28],[6,17]],'#c0a66d',2.4);
    townInk([[3,16],[9,11],[16,17],[9,22]],'#d4d7ca');
  }else{
    townInk([[-17,28],[-9,22],[7,22],[16,29],[18,45],[9,51],[-10,51],[-19,45]],'#b99a5e');
    townInk([[-12,27],[10,27],[6,32],[-8,32]],'#e1c285');
    townStroke([[-8,25],[-5,17],[4,17],[9,25]],'#daca9e',2);
    townInk([[-6,35],[5,35],[7,40],[0,44],[-7,40]],'#e3ca85');
  }
  g.restore();
  // Building labels are anchored beside their actual entrances, not menu tiles.
  g.save();g.font='bold 11px monospace';g.textAlign='center';g.lineJoin='round';
  g.strokeStyle='#202c31';g.lineWidth=3;g.strokeText(label,x,y+31);
  g.fillStyle='#f3deb0';g.fillText(label,x,y+31);g.restore();
}
function townResident(x,z,kind,t){
  const p=townProject(x,0,z),s=360/z/28,step=Math.sin(t)*1.3;
  g.save();g.translate(...p);g.scale(s,s);
  townInk([[-8,0],[-3,-2],[7,-1],[10,2],[2,3],[-6,2]],'#626b60');
  for(const side of [-1,1]){
    const dx=side*2.3,dy=side*step;
    townInk([[dx-1.7,-12],[dx+1.6,-12],[dx+1.2+dy,-2],[dx+3+dy,0],[dx-1.9+dy,0]],'#343d3e');
    townStroke([[dx-.5,-10],[dx+dy-.5,-3]],'#727b71',.8);
  }
  const guard=kind==='guard';
  townInk([[-5,-29],[-7,-19],[-4,-10],[4,-10],[6,-20],[4,-29]],guard?'#8c9da6':'#7d584d');
  townInk([[-5,-29],[0,-30],[0,-15],[-4,-10],[-7,-19]],guard?'#b3bec2':'#a67b60');
  townStroke([[-4,-26],[0,-22],[4,-26]],'#c6ad75',1);
  townInk([[-5,-15],[5,-15],[4,-12],[-4,-12]],'#3c3932');
  townInk([[-1,-15],[1,-15],[1,-12],[-1,-12]],'#d0b274');
  townInk([[-4,-39],[3,-39],[5,-36],[4,-31],[1,-29],[-4,-31]],guard?'#9eacb3':'#c6a180');
  townInk([[-4,-39],[2,-40],[4,-38],[-4,-37]],'#d7d8c6');
  if(guard){
    townStroke([[-4,-35],[4,-35]],'#283740',1.3);
    townStroke([[1,-37],[1,-30]],'#d5d9cf',.8);
    townInk([[1,-40],[1,-45],[5,-47],[8,-45],[4,-43]],'#647bae');
    townStroke([[8,-32],[8,0]],'#6e5b3e',1.1);
    townInk([[8,-38],[6,-32],[10,-32]],'#c5cdc7');
  }else{
    townInk([[-5,-38],[-5,-42],[0,-44],[5,-40],[7,-38]],'#597274');
    townInk([[2,-36],[6,-34],[3,-33]],'#dfb88e');
    townInk([[4,-26],[8,-19],[10,-18],[8,-16],[5,-18],[2,-23]],'#a57c60');
    townInk([[7,-20],[15,-20],[16,-11],[7,-12]],'#b5945e');
    townStroke([[8,-20],[9,-24],[13,-24],[14,-20]],'#625844',1);
  }
  g.restore();
}
function townAmbient(){
  // Chimney smoke and cloth move locally; the painted architecture is stationary.
  const p=townProject(-5.85,9.43,11.26);
  for(let i=0;i<5;i++){
    const q=(perfNow*.12+i*.2)%1,x=p[0]+q*21+Math.sin(q*8)*5,y=p[1]-q*67;
    g.globalAlpha=(1-q)*.23;
    townInk([[x-5-q*5,y],[x-10-q*6,y-8],[x-4,y-18-q*7],[x+8+q*6,y-16],[x+13+q*7,y-5],[x+6,y+4]],'#d4d0b8');
  }g.globalAlpha=1;
  townResident(-.9+Math.sin(perfNow*.14)*.24,17,'resident',perfNow*2.5);
  townResident(1.6,23,'guard',0);
  townResident(.7+Math.sin(perfNow*.10)*.15,32,'resident',perfNow*2);
  townHangingSign(119,407,'BLACKSMITH','smith');
  townHangingSign(378,395,'GENERAL STORE','store');
  // Two distant pennants tie the scene together, without covering shop entrances.
  for(const x of [218,285]){
    townStroke([[x,280],[x,318]],'#444e4b',1.2);
    const s=Math.sin(perfNow*1.8+x)*1.8;
    townInk([[x,282],[x+13,285+s],[x+12,307+s],[x+6,304],[x,308]],x===218?'#936553':'#597789');
    townStroke([[x+2,285],[x+3,302]],'#cab57e',.8);
  }
  // A warm forge flicker stays inside the opening instead of washing the city.
  const f=townProject(-2.995,.93,8.5);
  g.globalAlpha=.13+.045*Math.sin(perfNow*5);
  townInk([[f[0]-4,f[1]],[f[0]-3,f[1]-17],[f[0]+6,f[1]-20],[f[0]+8,f[1]-2]],'#ffd894');g.globalAlpha=1;
}
function drawTown(){
  const v=townVisit;if(!v)return;const c=v.chapter,tr=v.transition,r=tr&&TOWN_PLACES[tr.id];
  g.save();g.setTransform(viewScale,0,0,viewScale,viewX,viewY);
  if(tr){const z=1+smoothStep(clamp(tr.time/.35,0,1))*.16;
    g.translate(r.x+r.w/2,r.y+r.h/2);g.scale(z,z);g.translate(-r.x-r.w/2,-r.y-r.h/2);}
  townBackdrop(c);townAmbient();g.restore();
  g.save();g.setTransform(viewScale,0,0,viewScale,viewX,viewY);
  // Restrained title treatment leaves the whole city visible.
  g.fillStyle='#273d40';g.textAlign='center';g.font='bold 27px monospace';g.fillText(c.name,240,40);
  townStroke([[138,53],[342,53]],'#d4c9a5',1);
  smithText('CHAPTER '+v.stage+'  /  SAFE HAVEN',240,69,10,'#344b4c');
  merchantGoldLabel(gold,424,100,13,'#f3dfaa','',88);
  smithText('THE FORGE & THE GENERAL STORE',240,649,11,'#323f39');
  smithText('Tap their buildings to step inside.',240,667,10,'#455047');
  drawSmithButton(TOWN_DEPART,'CONTINUE JOURNEY','#ead6a5');
  if(v.lab){
    drawSmithButton({x:15,y:744,w:140,h:34},'BACK TO DEBUG','#d2dcb7');
    drawSmithButton({x:325,y:744,w:140,h:34},'NEXT TOWN','#d2dcb7');
  }
  if(v.dialog){
    g.fillStyle='#131e1bf2';g.fillRect(28,576,424,216);g.strokeStyle='#c4aa77';g.lineWidth=1;g.strokeRect(28,576,424,216);
    smithText('THE ROAD AHEAD',240,609,20,'#f1dca9');
    smithText('Leave town and begin stage '+(loop+1)+'?',240,642,12,'#d7dbc6',382);
    smithText('Finish your shopping before you set off.',240,663,11,'#b8c5ad',382);
    drawSmithButton({x:48,y:687,w:384,h:45},'CONTINUE JOURNEY','#e5d2a2');
    drawSmithButton({x:140,y:747,w:200,h:32},'STAY IN TOWN','#bbceb2');
  }
  g.restore();
}
function drawTownShopkeeper(s,hands=false){
  const bob=Math.sin(perfNow*1.6)*.8,reach=s.phase==='handoff'?Math.sin(clamp(s.clock/1.8,0,1)*Math.PI):0;
  g.save();g.translate(240,216+bob);g.scale(1.25,1.25);
  if(!hands){
    // A tailored waistcoat and apron, not a rectangle with a head on top.
    townInk([[-23,-7],[-35,6],[-32,36],[-28,69],[29,69],[33,34],[34,6],[20,-7]],'#49615b','#2d3f3c',1);
    townInk([[-23,-7],[-5,-3],[-8,28],[-20,51],[-29,62],[-32,13]],'#697c66');
    townInk([[4,-4],[21,-7],[30,8],[27,50],[12,51],[8,23]],'#3b514c');
    townInk([[-14,0],[11,0],[18,50],[-20,50]],'#d0bea0','#8d7d61',.8);
    townInk([[-12,-3],[-6,3],[-10,22],[-15,15]],'#efe0bc');
    townInk([[10,-3],[4,3],[8,22],[13,15]],'#a69b7e');
    townInk([[-18,28],[17,28],[26,73],[-26,73]],'#ad9b7c','#655d4a',.8);
    townInk([[-18,28],[-13,31],[-17,70],[-24,71]],'#d4c19a');
    for(const x of [-15,12]){townStroke([[x,-1],[x+2,30]],'#9c8660',3);townStroke([[x-1,0],[x+1,28]],'#ddc493',.6);}
    townInk([[-10,47],[11,47],[10,62],[-8,62]],'#958468');
    townStroke([[-9,49],[9,49],[8,60]],'#d2bd94',.7);
    for(let i=0;i<3;i++){g.fillStyle='#c7ae73';g.beginPath();g.arc(23,13+i*10,1.35,0,TAU);g.fill();}
    // Neck, ears and a faceted, expressive adult face with brow/nose/moustache.
    townInk([[-8,-22],[9,-21],[11,-6],[2,0],[-9,-6]],'#b89673');
    townInk([[-19,-39],[-24,-38],[-24,-28],[-19,-24],[19,-25],[23,-30],[22,-39],[17,-41]],'#b38a67');
    townInk([[-18,-47],[-9,-53],[10,-51],[18,-43],[17,-21],[10,-12],[-3,-10],[-14,-17],[-19,-29]],'#c9a37c','#82634f',.9);
    townInk([[-14,-44],[-7,-49],[8,-48],[12,-39],[9,-20],[1,-15],[-10,-20],[-15,-30]],'#e0b990');
    townInk([[12,-44],[17,-41],[16,-22],[10,-14],[3,-12],[4,-19],[10,-26]],'#aa8061');
    townInk([[-20,-41],[-17,-49],[-11,-53],[-13,-33],[-17,-30]],'#695342');
    townInk([[9,-51],[19,-43],[20,-29],[16,-26],[14,-39]],'#594a3d');
    townStroke([[-13,-35],[-7,-37],[-3,-35]],'#66503e',1.5);
    townStroke([[5,-36],[11,-36],[14,-33]],'#66503e',1.5);
    const blink=Math.sin(perfNow*.61)>.996;
    for(const x of [-8,9]){
      townStroke([[x-3,-31],[x+2,-31]],'#443e36',blink?1:2.3);
      if(!blink){g.fillStyle='#efe0bd';g.fillRect(x-2,-32,1,1);}
    }
    townInk([[1,-35],[-1,-25],[3,-22],[7,-24],[4,-26],[4,-34]],'#b48561');
    townStroke([[0,-26],[2,-24],[5,-24]],'#edc89a',.7);
    townInk([[1,-21],[-4,-24],[-11,-21],[-14,-17],[-6,-17],[0,-19],[5,-17],[12,-18],[9,-22],[5,-24]],'#695344');
    townStroke([[-8,-15],[-1,-13],[6,-15]],'#795242',1);
    townStroke([[-3,-10],[5,-12]],'#e3bc91',.7);
    // Soft cap: a sewn band and asymmetrical crown, rather than flat block hair.
    townInk([[-22,-44],[-20,-56],[-10,-63],[8,-61],[21,-53],[18,-44],[3,-47]],'#52716d','#344e4e',1);
    townInk([[-19,-56],[-10,-63],[8,-61],[14,-56],[-7,-57],[-18,-51]],'#789087');
    townInk([[-22,-46],[19,-46],[21,-42],[-22,-41]],'#3b5553');
    townStroke([[-20,-44],[18,-44]],'#bda574',.8);
    for(const side of [-1,1]){
      townStroke([[side*28,7],[side*46,34]],'#314844',17);
      townStroke([[side*27,7],[side*43,31]],'#667d6c',11);
    }
  }else for(const side of [-1,1]){
    const hx=side*54-(side===1?reach*14:0),hy=57-(side===1?reach*10:0);
    townStroke([[side*46,34],[hx,hy]],'#3a5048',15);
    townStroke([[side*45,34],[hx-2,hy-2]],'#73826a',8);
    townInk([[hx-8,hy-7],[hx+6,hy-7],[hx+8,hy+1],[hx-7,hy+3]],'#d0bfa0','#867558',.65);
    townInk([[hx-6,hy+1],[hx+5,hy+1],[hx+8,hy+6],[hx+6,hy+9],[hx-6,hy+8],[hx-9,hy+5]],'#d6ad82','#886a50',.7);
    townStroke([[hx-4,hy+3],[hx-3,hy+7]],'#a4805d',.65);
    townStroke([[hx,hy+3],[hx+1,hy+7]],'#a4805d',.65);
  }
  g.restore();
}
function drawTownShopInterior(s){
  const c=townVisit?.chapter||TOWN_CHAPTERS[0];
  g.fillStyle='#494c41';g.fillRect(0,-PAD_TOP,480,800+PAD_TOT);
  // A timber-and-plaster room in the approved street's line/material language.
  smithPoly([[0,-PAD_TOP],[480,-PAD_TOP],[430,36],[48,36]],'#514c40',null);
  smithPoly([[0,0],[49,36],[49,316],[0,349]],'#727665',null);
  smithPoly([[430,36],[480,0],[480,349],[430,316]],'#5b665a',null);
  g.fillStyle='#ada58c';g.fillRect(49,36,381,280);
  for(let i=0;i<7;i++){
    const x=51+i*63;g.fillStyle=i%2?'#b5aa8e':'#bdb197';g.fillRect(x,39,60,269);
    townStroke([[x+4,48],[x+4,304]],'#d2c4a3',.6);
  }
  // Exposed beams, pegs, braces and side-plane end grain.
  for(const x of [42,151,310,425]){
    g.fillStyle='#554c3b';g.fillRect(x,34,9,288);
    g.fillStyle='#8e7957';g.fillRect(x+1,35,2,285);
    for(const y of [48,151,285]){g.fillStyle='#bda373';g.fillRect(x+3,y,2,2);}
  }
  for(const y of [34,149,284]){
    g.fillStyle='#594c39';g.fillRect(44,y,390,10);g.fillStyle='#a28a63';g.fillRect(44,y,390,1.4);
    g.fillStyle='#877d63';g.fillRect(52,y+10,373,5);
  }
  townStroke([[52,48],[100,144]],'#6d5d43',7);townStroke([[370,144],[423,48]],'#6d5d43',7);
  townStroke([[53,48],[103,142]],'#ab9370',1);
  // Recessed shelves: back, dark jamb, shelf thickness and corbels.
  for(const x of [35,330]){
    smithPoly([[x,176],[x+112,176],[x+112,277],[x,277]],'#65553f','#463d32');
    smithPoly([[x+5,181],[x+106,181],[x+106,268],[x+5,268]],'#3e4840',null);
    smithPoly([[x+5,181],[x+12,188],[x+12,263],[x+5,268]],'#263831',null);
    g.fillStyle='#a68e65';g.fillRect(x-3,215,120,3);g.fillRect(x-3,267,120,4);
    smithPoly([[x-3,271],[x+117,271],[x+112,276],[x+2,276]],'#5c4b37',null);
    for(const xx of [x+8,x+97])smithPoly([[xx,276],[xx+8,276],[xx+3,290],[xx,290]],'#6b5b42',null);
    for(let j=0;j<3;j++){
      drawMerchantProp(x===35?{kind:j%2?'heal':'mystery'}:{kind:'artifact',id:ARTIFACT_IDS[j+3]},x+25+j*32,245,x===35?.40:.63);
      g.fillStyle=['#798369','#a18868','#826969'][j];g.fillRect(x+17+j*30,195,16,18);
      g.fillStyle='#b6a682';g.fillRect(x+18+j*30,197,2,14);
    }
  }
  // A small diamond-leaded transom keeps the plaster wall from reading as a menu.
  smithPoly([[67,62],[129,62],[129,134],[67,134]],'#4d5248','#8f7d5d');
  g.fillStyle='#7c9894';g.fillRect(72,67,52,62);
  g.save();g.beginPath();g.rect(72,67,52,62);g.clip();
  for(let i=-3;i<6;i++){
    townStroke([[64+i*17,65],[129+i*17,130]],'#435d5e',.8);
    townStroke([[64+i*17,130],[129+i*17,65]],'#435d5e',.8);
  }g.restore();
  townStroke([[97,64],[97,132]],'#b9ad88',2);townStroke([[70,128],[126,128]],'#e1d1a6',1);
  drawTownShopkeeper(s);
  drawSmithCounter(false);
  drawTownShopkeeper(s,true);
  smithPoly([[107,73],[373,73],[373,116],[107,116]],'#344139','#b6a076');
  townStroke([[111,77],[369,77]],'#81927b',.8);
  for(const x of [115,365]){g.fillStyle='#d2bb89';g.beginPath();g.arc(x,94,1.7,0,TAU);g.fill();}
  smithText('THE CORNER STORE',240,99,21,'#efdbb2');smithText(c.name,240,133,10,'#554a38');
}
