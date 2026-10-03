/* Oathkeeper: approved base shape, authored laboratory motion extensions.
 * Reuses the ceremonial sword's actual drawing through a vector collector.
 * Local Y is up, local front is -Z. All animation is sampled from one clock. */
(function(root){'use strict';
 const Moves=root.KROathkeeperMoves||(typeof require==='function'?require('./oathkeeper-moves.js'):null);
 const clamp=t=>Math.max(0,Math.min(1,t)),mix=(a,b,t)=>a+(b-a)*t,ease=t=>{t=clamp(t);return t*t*(3-2*t);},ramp=(t,a,b)=>ease((t-a)/(b-a)),
  add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),
  cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/(Math.hypot(...a)||1));
 const M={stone:['#34464a','#617c78','#91a695'],edge:['#3c5153','#738e83','#a3b49a'],old:['#2b3d41','#526f63','#81997b'],dark:['#16282c','#2e433e','#526e58'],moss:['#203e25','#4f792b','#8aaa40'],earth:['#302922','#584333','#896648'],seal:['#253e3d','#4a6860','#879b7f'],boulder:['#24383e','#496970','#77908e']};
 const battleMaterials={...M,stone:['#344c51','#6b8580','#acb994'],edge:['#3c555b','#7f9888','#bdc997'],old:['#2e4547','#5a7966','#95ad7c'],boulder:['#29454f','#587b80','#96aaa0']};
 const identity=p=>p,rotateY=(p,a)=>[p[0]*Math.cos(a)+p[2]*Math.sin(a),p[1],-p[0]*Math.sin(a)+p[2]*Math.cos(a)],rotateX=(p,a)=>[p[0],p[1]*Math.cos(a)-p[2]*Math.sin(a),p[1]*Math.sin(a)+p[2]*Math.cos(a)];
 function solve(root,target,a,b,side,pole=[side,0,-.24]){const delta=sub(target,root),length=Math.min(a+b-.015,Math.max(Math.abs(a-b)+.015,Math.hypot(...delta))),axis=norm(delta),end=add(root,mul(axis,length)),
  rawBend=sub(pole,mul(axis,dot(pole,axis))),bend=norm(Math.hypot(...rawBend)>.00001?rawBend:cross(axis,Math.abs(axis[1])<.9?[0,1,0]:[1,0,0])),along=(a*a-b*b+length*length)/(2*length),height=Math.sqrt(Math.max(0,a*a-along*along));
  return {root,joint:add(root,add(mul(axis,along),mul(bend,height))),end,upper:a,lower:b};}
 // Optional locomotion channels are authored before whole-rig facing. The
 // native encounter owns root travel; planted targets compensate that travel.
 function facedPose(p,facing){
  if(!facing)return p;
  const turn=v=>rotateY(v,facing),chain=a=>({...a,root:turn(a.root),joint:turn(a.joint),end:turn(a.end),...(a.pole?{pole:turn(a.pole)}:{}),...(a.target?{target:turn(a.target)}:{})});
  return {...p,facing,torso:v=>turn(p.torso(v)),head:v=>turn(p.head(v)),arms:p.arms.map(chain),legs:p.legs?.map(chain)||null,
   handPoint:(side,v)=>turn(p.handPoint(side,v)),footPoint:(side,v)=>turn(p.footPoint(side,v)),jawPoint:v=>turn(p.jawPoint(v)),mouthPoint:v=>turn(p.mouthPoint(v)),sword:turn(p.sword)};
 }
 function pose(time=0,action=null,localFrame=false){const t=Math.max(0,Math.min(7,time)),motion=action?.motionOverride||Moves?.motion(action);
  let rootY=-4.62;
  if(t>.7)rootY=mix(-4.62,-2.55,ramp(t,.7,2.45));
  if(t>2.45)rootY=mix(-2.55,-1.65,ramp(t,2.45,3.8));
  if(t>3.8)rootY=mix(-1.65,.045,ramp(t,3.8,5.9));
  if(t>5.9)rootY=mix(.045,0,ramp(t,5.9,6.5));
  if(motion)rootY=motion.crouch;
  const braced=motion?0:ramp(t,1.5,2.45)*(1-ramp(t,3.8,5.3)),lean=motion?motion.lean:.035+.10*Math.sin(Math.PI*ramp(t,.75,5.9)),twist=motion?.twist||0,jawOpen=clamp(Number.isFinite(motion?.jawOpen)?motion.jawOpen:0),
   tremor=t>.55&&t<2.45?Math.sin(t*31)*.014*Math.sin(Math.PI*ramp(t,.55,2.45)):0,
   torso=p=>add(rotateY(rotateX(sub(p,[0,2.05,0]),lean),twist),[tremor+(motion?.shift||0),2.05+rootY,0]),head=p=>torso(add(rotateY(sub(p,[0,4.78,0]),-.12*ramp(t,5.5,6.6)-twist*.65),[0,4.78,0])),
   // The stone lower jaw is its own rigid block. Its rear links remain attached;
   // the upper skull, eyes, crown and ceremonial sword never scale with the gape.
   jawLocal=v=>add(rotateX(sub(v,[0,4.55,.10]),-.50*jawOpen),[0,4.55-.20*jawOpen,.10-.10*jawOpen]),
   jawPoint=jawOpen?v=>head(jawLocal(v)):head,
   mouthCenter=mul(add([0,4.6375,-.634],jawLocal([0,4.5825,-.634])),.5),mouthPoint=(offset=[0,0,0])=>head(add(mouthCenter,offset)),
   arms=[-1,1].map(side=>{const root=torso([side*1.52,3.91,0]),idle=torso([side*2.00,1.63,-.18]),planted=[side*2.12,.73,-.70],target=motion?motion[side<0?'left':'right']:idle.map((v,i)=>mix(v,planted[i],braced)),authoredPole=motion?.[side<0?'leftPole':'rightPole'],pole=authoredPole?rotateY(rotateX(authoredPole,lean),twist):[side,0,-.24*(1-(motion?.grip||0))];return {...solve(root,target,1.18,1.30,side,pole),side,pole};}),
   handPoint=(side,v)=>add(arms.find(a=>a.side===side).end,rotateY(rotateX(v,motion?(motion[side<0?'leftPitch':'rightPitch']??(action.id==='quake'||side===action.side?motion.pitch:.05)):mix(.05,-1.15,braced)),twist*.3)),
   legs=motion?[-1,1].map(side=>{const name=side<0?'leftFoot':'rightFoot',authoredFoot=Array.isArray(motion[name]),target=authoredFoot?motion[name]:[side*.87,.33,-.02],footYaw=motion[name+'Yaw']||0;
    return {...solve(torso([side*.63,1.95,.06]),target,Math.hypot(.17,.92,.1),Math.hypot(.07,.70,.02),side,[side*.18,0,-1]),side,target,authoredFoot,footYaw};}):null,
   footPoint=(side,v)=>{if(!legs)return add(v,[0,rootY,0]);const leg=legs.find(a=>a.side===side);if(!leg.authoredFoot&&!leg.footYaw)return v;
    const pivot=[side*.87,.33,-.02],anchor=leg.authoredFoot?leg.end:pivot;return add(anchor,rotateY(sub(v,pivot),leg.footYaw));};
  const p={time:t,rootY,eye:ramp(t,.10,.56),braced,lean,torso,head,jawOpen,jawPoint,mouthPoint,arms,legs,handPoint,footPoint,facing:0,grip:motion?.grip||0,action,
   stage:t===0?'Uyuyan kaya':t<.7?'Gözler açılıyor':t<2.45?'Toprak yarılıyor':t<3.8?'Eller yere dayanıyor':t<5.9?'Gövde yükseliyor':t<6.5?'Ağırlık oturuyor':'Uyanık muhafız',
   sword:head([0,6.30,-.03])};
  return localFrame?p:facedPose(p,motion?.facing||0);
 }
 const fans=new Map(),fan=n=>{if(!fans.has(n))fans.set(n,Array.from({length:n-2},(_,i)=>[0,i+1,i+2]));return fans.get(n);};
 function build(time,action=null,options={}){const p=pose(time,action,true),faces=[],joints=[];
  const face=(v,mat='stone',part='stone',unlit=false,triangles=null,solid=false)=>faces.push({v,mat,part,unlit,triangles:triangles||fan(v.length),solid});
  function block(part,center,size,mat='stone',transform=identity,bevel=.12,taper=1){
   const [w,h,d]=size,b=Math.min(w,d)*bevel,
    ring=[[-w/2+b,-d/2],[w/2-b,-d/2],[w/2,-d/2+b],[w/2,d/2-b],[w/2-b,d/2],[-w/2+b,d/2],[-w/2,d/2-b],[-w/2,-d/2+b]],
    rings=[-1,1].map((side,i)=>ring.map(([x,z])=>transform(add(center,[x*(i?taper:1),side*h/2,z*(i?taper:1)]))));
   const centerWorld=transform(center),emit=v=>{if(dot(cross(sub(v[1],v[0]),sub(v[2],v[0])),sub(v[0],centerWorld))<0)v=[...v].reverse();face(v,mat,part,false,null,true);};
   emit([...rings[0]].reverse());emit(rings[1]);
   for(let i=0;i<8;i++)emit([rings[0][i],rings[0][(i+1)%8],rings[1][(i+1)%8],rings[1][i]]);
  }
  function beam(part,a,b,width,depth,mat='stone',taper=.90){const axis=norm(sub(b,a)),right=norm(cross(Math.abs(axis[2])>.9?[1,0,0]:[0,0,1],axis)),forward=norm(cross(right,axis)),length=Math.hypot(...sub(b,a)),center=mul(add(a,b),.5),
   tr=v=>add(center,add(mul(right,v[0]),add(mul(axis,v[1]),mul(forward,v[2]))));block(part,[0,0,0],[width,length,depth],mat,tr,.15,taper);}
  const ground=pnt=>add(pnt,[0,p.rootY,0]);
  // Seated ashlar legs: broad toes, carved knees, narrow joint collars.
  for(const side of [-1,1]){
   const leg=p.legs?.find(a=>a.side===side),hip=leg?.root||ground([side*.63,1.95,.06]),knee=leg?.joint||ground([side*.80,1.03,-.04]),ankle=leg?.end||ground([side*.87,.33,-.02]),foot=v=>p.footPoint(side,v),articulatedFoot=leg&&(leg.authoredFoot||leg.footYaw);
   beam('thigh',hip,knee,.93,.97,'old',1.08);block('knee',knee,[.98,.46,1.01],'edge');
   beam('shin',knee,ankle,.77,.84,'stone',1.03);
   block('foot',articulatedFoot?[side*.88,.21,-.25]:foot([side*.88,.21,-.25]),[1.08,.42,1.40],'old',articulatedFoot?foot:identity,.18,.88);
   for(const x of [-.27,0,.27])block('toe',articulatedFoot?[side*.88+x,.17,-.90]:foot([side*.88+x,.17,-.90]),[.22,.27,.17],'edge',articulatedFoot?foot:identity);
   block('knee-groove',add(knee,[0,.03,-.452]),[.50,.075,.045],'dark');
  }
  block('pelvis',[0,1.96,0],[1.78,.64,1.17],'old',p.torso,.15,.88);
  block('waist-joint',[0,2.35,.03],[1.26,.33,.86],'dark',p.torso,.17);
  block('ribcage',[0,3.16,.06],[1.87,1.44,1.17],'stone',p.torso,.16,1.37);
  block('collar',[0,3.98,.06],[2.55,.39,1.21],'edge',p.torso,.14,.88);
  // Back remains a closed plain mass; front/side views own the detail budget.
  // A recessed carved seal, architectural rather than a glowing reactor.
  block('sternum',[0,3.16,-.625],[.76,.96,.11],'old',p.torso,.25,.80);
  block('seal-inset',[0,3.23,-.70],[.43,.54,.06],'dark',p.torso,.18);
  block('seal-stroke',[0,3.22,-.744],[.08,.39,.025],'seal',p.torso,.03);
  block('seal-cross',[0,3.29,-.760],[.27,.06,.025],'seal',p.torso,.03);
  for(const side of [-1,1]){
   block('rib-cut',[side*.78,3.15,-.56],[.12,.75,.055],'dark',p.torso,.04);
   for(let i=0;i<2;i++)block('collar-cut',[side*(.75+i*.29),3.99,-.55],[.11,.22,.11],'old',p.torso,.02);
  }
  // Hood-like stone shoulders enclose the smaller head. One weathered slab is larger.
  for(const a of p.arms){const side=a.side;
   block('shoulder',[side*1.48,3.98,.02],[side<0?1.33:1.22,1.09,1.48],'old',p.torso,.22,.93);
   block('shoulder-cap',[side*1.48,4.45,.02],[side<0?1.28:1.17,.23,1.40],'edge',p.torso,.16,.95);
   block('shoulder-slot',[side*1.48,4.01,-.676],[.60,.095,.04],'dark',p.torso,.02);
   for(let i=0;i<3;i++)block('shoulder-carving',[side*1.48+(i-1)*.22,3.84,-.676],[.065,.25,.04],'dark',p.torso,.02);
   beam('upper-arm',a.root,a.joint,.98,1.03,'stone',.91);
   block('elbow',a.joint,[.96,.78,1.00],'dark',identity,.20);
   beam('forearm',a.joint,a.end,side<0?1.25:1.16,1.17,'stone',.86);
   const hand=v=>p.handPoint(side,v);
   block('wrist',[0,-.01,0],[.74,.25,.77],'dark',hand,.13);
   block('palm',[0,-.27,-.07],[1.12,.54,.92],'old',hand,.15,.92);
   for(const i of [-1,0,1]){block('knuckle',[i*.33,-.44,-.41],[.295,.30,.38],'edge',hand,.13);block('finger',[i*.33,mix(-.64,-.47,p.grip),mix(-.38,-.12,p.grip)],[.275,.31,.36],'stone',hand,.12,.85);}
   block('thumb',[-side*mix(.58,.45,p.grip),-.31,-.08],[.285,.45,.42],'stone',hand,.19,.82);
   joints.push({side,root:a.root,joint:a.joint,end:a.end,upper:a.upper,lower:a.lower});
  }
  block('neck',[0,4.30,.01],[.81,.40,.73],'dark',p.torso,.18);
  // Dormant head is the visible stone. Its broad, chipped crown hides the mask.
  block('head',[0,4.88,-.02],[1.53,1.12,1.13],'stone',p.head,.18,.93);
  block('crown',[.03,5.40,.03],[1.47,.27,1.12],'old',p.head,.24,.76);
  block('jaw',[0,4.42,-.14],[1.20,.31,1.04],'old',p.jawPoint,.20,.90);
  block('jaw-front',[0,4.44,-.706],[.74,.18,.16],'edge',p.jawPoint,.12,.93);
  if(!p.jawOpen)block('mouth-cut',[0,4.61,-.607],[.60,.055,.045],'dark',p.head,.03);
  else{
   const half=.30+.18*p.jawOpen;
   face([p.head([-half,4.6375,-.634]),p.head([half,4.6375,-.634]),p.jawPoint([half,4.5825,-.634]),p.jawPoint([-half,4.5825,-.634])],M.dark[0],'mouth-cavity',true);
   block('upper-lip',[0,4.66,-.641],[half*2+.10,.065,.065],'old',p.head,.10);
   for(const side of [-1,1])beam('jaw-hinge',p.head([side*.52,4.54,.04]),p.jawPoint([side*.52,4.54,.04]),.14,.16,'dark',1);
  }
  block('nose-keystone',[0,4.94,-.635],[.18,.48,.17],'old',p.head,.14,.90);
  for(const side of [-1,1]){
   block('eye-recess',[side*.36,4.88,-.621],[.46,.23,.11],'dark',p.head,.05);
   if(p.eye>.001){block('eye',[side*.36,4.875,-.689],[.285,.075*p.eye,.028],'#ed552f',p.head,.01);faces.slice(-10).forEach(f=>f.unlit=true);
    block('eye-core',[side*.36,4.875,-.712],[.052,.068*p.eye,.012],'#ffd284',p.head,.01);faces.slice(-10).forEach(f=>f.unlit=true);}
   block('eyelid',[side*.36,4.87+.18*p.eye,-.70],[.50,.18,.20],'stone',p.head,.08);
   // A slanted carved brow compresses the eye towards the bridge.
   const brow=[[side*.12,5.04,-.79],[side*.65,5.14,-.79],[side*.65,5.02,-.79],[side*.12,4.96,-.79]];
   face(brow.map(v=>p.head(v)),'old','brow');
   block('cheek',[side*.59,4.64,-.60],[.22,.30,.18],'edge',p.head,.16,.83);
  }
  // Moss follows upward-facing joints only, in a few broad patches.
  block('crown-moss',[-.32,5.543,.04],[.56,.035,.52],'moss',p.head,.24,.88);
  block('crown-moss',[.20,5.545,.16],[.30,.038,.28],'moss',p.head,.22);
  block('shoulder-moss',[-1.64,4.565,.14],[.58,.042,.59],'moss',p.torso,.25,.88);
  // A chipped crown corner and a single dark masonry crack, no noisy tessellation.
  face([[-.68,5.37,-.48],[-.53,5.23,-.53],[-.52,5.02,-.58],[-.60,5.14,-.57]].map(p.head),'dark','crown-crack');
  for(const poly of swordPolygons()){
   const convert=(z)=>poly.points.map(([x,y])=>p.head([x*.0056,6.04-y*.0056,z]));
   const front=convert(-.028-poly.layer*.0002),back=convert(.028+poly.layer*.0002);
   face(front,poly.color,'sword',true,poly.triangles);face(back,poly.color,'sword',true,poly.triangles);
   // Only the exterior silhouette needs thickness; internal color layers do not.
   if(poly.extrude)for(let i=0;i<front.length;i++)face([front[i],front[(i+1)%front.length],back[(i+1)%back.length],back[i]],poly.color,'sword-edge');
  }
  // Deterministic dislodged fragments. They fall back to the ground, never float.
  for(let i=0;i<10;i++){const born=1.15+i*.17,age=p.time-born;if(age<0||age>1.20)continue;
   const side=i%2?1:-1,fall=Math.max(.06,1.0+age*.8-3.1*age*age),x=side*(.8+age*.75+(i%3)*.14);
   block('debris',[x,fall,-.18+(i%4)*.23],[.12+(i%3)*.025,.14,.13],'earth',identity,.20);
  }
  if(action){
   for(const h of options.hideEffectMeshes?[]:Moves.hazards(action,(time,act)=>pose(time,act,true))){
    if(h.kind==='fist'||h.kind==='wave'&&(action.time<h.activeStart||action.time>h.activeEnd)||h.kind==='rock'&&(action.time<.40||action.time>h.activeEnd))continue;
    if(options.hiddenEffects?.includes(`oath:${action.id}:${h.index}`))continue;
    const v=h.position,center=[v.x,v.y,v.z-Moves.ORIGIN_Z];
    block(h.kind,center,h.kind==='wave'?[1.10,.58,.55]:[1.28,1.35,1.28],h.kind==='wave'?'old':'boulder',identity,.24,.78);
   }
   const impact=action.id==='throw'?null:action.impact,age=action.time-impact;
   if(impact!==null&&age>=0&&age<.65){const x=action.id==='slam'?action.targetX:0,z=action.id==='slam'?-2.22:-1.35;
    for(let i=0;i<6;i++){const angle=i*Math.PI/3,d=.3+age*(1.2+(i%2)*.4),y=Math.max(.05,.12+age*1.6-age*age*3);block('impact-chip',[x+Math.cos(angle)*d,y,z+Math.sin(angle)*d],[.13,.13,.14],'earth',identity,.15);}
   }
  }
  const facing=(action?.motionOverride||Moves?.motion(action))?.facing||0,worldPose=facedPose(p,facing);
  if(facing){for(const f of faces)f.v=f.v.map(v=>rotateY(v,facing));for(let i=0;i<joints.length;i++){const a=worldPose.arms[i];Object.assign(joints[i],{root:a.root,joint:a.joint,end:a.end});}}
  return {pose:worldPose,faces,joints};
 }
 let swordCache=null;
 function swordPolygons(){if(swordCache)return swordCache;if(!root.KROathSwordArt)throw Error('Shared ceremonial sword is required');
  const out=[],stack=[];let state={sx:1,sy:1,tx:0,ty:0,color:'#ffffff',clips:[]},path=[];
  const point=(x,y)=>[x*state.sx+state.tx,y*state.sy+state.ty];
  function clipped(poly,clip){const area=clip.reduce((sum,a,i)=>{const b=clip[(i+1)%clip.length];return sum+a[0]*b[1]-a[1]*b[0];},0),sign=Math.sign(area)||1;
   for(let i=0;i<clip.length;i++){const a=clip[i],b=clip[(i+1)%clip.length],value=p=>sign*((b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0])),next=[];
    for(let j=0;j<poly.length;j++){const p=poly[j],q=poly[(j+1)%poly.length],u=value(p),v=value(q);if(u>=0)next.push(p);if((u>=0)!==(v>=0)){const t=u/(u-v);next.push([mix(p[0],q[0],t),mix(p[1],q[1],t)]);}}poly=next;
   }return poly;
  }
  const emit=poly=>{for(const clip of state.clips)poly=clipped(poly,clip);if(poly.length>=3)out.push({points:poly,color:state.color,layer:out.length});};
  const g={save(){stack.push({...state,clips:[...state.clips]});},restore(){state=stack.pop();},translate(x,y){state.tx+=x*state.sx;state.ty+=y*state.sy;},scale(x,y){state.sx*=x;state.sy*=y;},
   beginPath(){path=[];},moveTo(x,y){path.push(point(x,y));},lineTo(x,y){path.push(point(x,y));},closePath(){},fill(){emit(path);},clip(){state.clips.push([...path]);},fillRect(x,y,w,h){emit([point(x,y),point(x+w,y),point(x+w,y+h),point(x,y+h)]);},
   get fillStyle(){return state.color;},set fillStyle(v){state.color=v;}};
  root.KROathSwordArt.draw(g,0,0,1,'intact','neutral');const m=root.KROathSwordArt.palettes.neutral,solidColors=new Set([m.steel,m.grip,m.hilt,m.hiltSide,m.gem]);
  for(const poly of out){poly.triangles=triangulate(poly.points.map(([x,y])=>[x,y,0]));poly.extrude=solidColors.has(poly.color);}return swordCache=out;
 }
 function triangulate(points){
  // Ear clipping preserves the concave outlines of the shared sword guard.
  const normal=cross(sub(points[1],points[0]),sub(points[2],points[0])),drop=normal.map(Math.abs).indexOf(Math.max(...normal.map(Math.abs))),
   p=points.map(v=>v.filter((_,i)=>i!==drop)),indices=p.map((_,i)=>i),area=p.reduce((sum,a,i)=>{const b=p[(i+1)%p.length];return sum+a[0]*b[1]-a[1]*b[0];},0),sign=Math.sign(area),triangles=[],orient=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  if(!sign)return triangles;
  for(let guard=0;indices.length>3&&guard<points.length*points.length;guard++){
   let found=false;
   for(let i=0;i<indices.length;i++){const a=indices[(i+indices.length-1)%indices.length],b=indices[i],c=indices[(i+1)%indices.length];if(sign*orient(p[a],p[b],p[c])<=1e-10)continue;
    if(indices.some(j=>j!==a&&j!==b&&j!==c&&sign*orient(p[a],p[b],p[j])>1e-9&&sign*orient(p[b],p[c],p[j])>1e-9&&sign*orient(p[c],p[a],p[j])>1e-9))continue;
    triangles.push([a,b,c]);indices.splice(i,1);found=true;break;
   }if(!found)break;
  }
  if(indices.length===3)triangles.push([...indices]);return triangles;
 }
 const colorCache=new Map(),rgb=hex=>{if(!colorCache.has(hex))colorCache.set(hex,[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255));return colorCache.get(hex);},light=norm([-.5,.85,-.6]);
 function createRenderer(){
  const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:true,premultipliedAlpha:true});
  let program,buffer,position,color,height,worldZ,size,clipZ,depthSide,disposed=false,lastKey='',lastData=null,uploadedData=null,geometryBuilds=0,uploads=0;
  if(gl){
   const shader=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;},vs=shader(gl.VERTEX_SHADER,'attribute vec3 a_position;attribute vec3 a_color;attribute float a_height;attribute float a_worldZ;uniform vec2 u_size;varying vec3 v_color;varying float v_height;varying float v_worldZ;void main(){gl_Position=vec4(a_position.x/u_size.x*2.-1.,1.-a_position.y/u_size.y*2.,a_position.z,1.);v_color=a_color;v_height=a_height;v_worldZ=a_worldZ;}'),
    fs=shader(gl.FRAGMENT_SHADER,'precision highp float;uniform float u_clipZ;uniform float u_depthSide;varying vec3 v_color;varying float v_height;varying float v_worldZ;void main(){if(v_height<0.||(v_worldZ-u_clipZ)*u_depthSide<0.)discard;gl_FragColor=vec4(v_color,1.);}');
   program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.deleteShader(vs);gl.deleteShader(fs);
   buffer=gl.createBuffer();position=gl.getAttribLocation(program,'a_position');color=gl.getAttribLocation(program,'a_color');height=gl.getAttribLocation(program,'a_height');worldZ=gl.getAttribLocation(program,'a_worldZ');size=gl.getUniformLocation(program,'u_size');clipZ=gl.getUniformLocation(program,'u_clipZ');depthSide=gl.getUniformLocation(program,'u_depthSide');
  }
  function geometry(time,angle,project,mode,action,options){const model=build(time,action,options),materials=options.materials||(options.lighting==='battle'?battleMaterials:M),a=angle*Math.PI/180,vertices=[],polygons=[],
    faces=options.extraFaces?.length?[...model.faces,...options.extraFaces]:model.faces;let minZ=Infinity;geometryBuilds++;
   for(const f of faces){const normal=rotateY(norm(cross(sub(f.v[1],f.v[0]),sub(f.v[2],f.v[0]))),a),v=f.v.map(p=>rotateY(p,a));
    if(f.solid){
     if(options.cameraPosition){
      const centre=[0,1,2].map(i=>v.reduce((sum,p)=>sum+p[i],0)/v.length);
      if(dot(normal,sub(options.cameraPosition,centre))<0)continue;
     }else if(dot(normal,[0,.28,-.96])<-.001)continue;
    }
    const lit=dot(normal,options.lightDirection||light),
     shade=clamp((lit+.55)/1.4)*2,band=Math.min(1,Math.floor(shade)),blend=shade-band,
     col=materials[f.mat]?rgb(materials[f.mat][band]).map((c,i)=>mix(c,rgb(materials[f.mat][band+1])[i],blend)):rgb(options.colorMap?.[f.mat]||f.mat),shaded=f.unlit||materials[f.mat]?col:col.map(x=>x*(.66+.34*clamp((lit+.55)/1.4))),
     projected=v.map(p=>{const q=project(p),weight=options.perspectiveScale?options.perspectiveScale(p):1,
      depth=options.depthProject?options.depthProject(p):(p[2]*.96-p[1]*.28)/22;
      // Screen coordinates already contain the perspective divide (GL w=1).
      // Reciprocal-scaled plane distances interpolate correctly across those
      // projected triangles; raw local coordinates would move the split seam.
      return [q.x,q.y,depth,p[1]*weight,options.perspectiveScale?(p[2]-(options.clipZ||0))*weight:p[2]];});
    polygons.push({points:projected,color:shaded,part:f.part});
    for(const q of v)minZ=Math.min(minZ,q[2]);
    for(const tri of f.triangles)for(const i of tri){const q=projected[i];vertices.push(q[0],q[1],q[2],...shaded,q[3],q[4]);}
   }return {model,faceCount:faces.length,vertices:new Float32Array(vertices),polygons,mode,minZ};
  }
  function draw(ctx,time,options={}){
   if(disposed)return;const width=options.width||480,heightPx=options.height||540,angle=options.angle??-18,unit=options.unit||61,baseY=options.baseY||466,
    project=options.project||(p=>({x:width/2+p[0]*unit,y:baseY-(p[1]*.96+p[2]*.28)*unit})),action=options.action||null,key=[time,angle,width,heightPx,unit,baseY,options.projectKey,options.mode||'model',options.lighting,action?.id,action?.time,action?.targetX,options.hideEffectMeshes,options.hiddenEffects?.join(','),options.projectionMode,options.cameraPosition?.join(','),!!options.depthProject,!!options.perspectiveScale,options.perspectiveScale?options.clipZ:'',options.extraFaces?.length||0,options.extraFacesKey,action?.motionOverride?.jawOpen].join('|');
   if(key!==lastKey){lastKey=key;lastData=geometry(time,angle,project,options.mode,action,options);}
   // A neutral lab ground contact, not an authored encounter environment.
   const rise=ramp(time,.6,2.5),base=project([0,0,0]),reach=project([mix(.95,2.6,rise),0,0]);ctx.save();
   if(options.ground!==false){ctx.fillStyle='#181d1b';ctx.beginPath();ctx.ellipse(base.x,base.y,Math.abs(reach.x-base.x),Math.abs(reach.x-base.x)*.23,0,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle='#77634a';ctx.lineWidth=1.5;
   if(rise>0)for(let i=0;i<9;i++){const a=i*Math.PI*2/9,points=[.8,1.5,2.3].map((r,j)=>project([Math.cos(a+j*.08)*r*rise,0,Math.sin(a+j*.08)*r*rise]));ctx.beginPath();points.forEach((v,j)=>j?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.stroke();}
   }
   if(gl&&!gl.isContextLost()){
    const ratio=options.pixelRatio||Math.min(devicePixelRatio||1,2),w=Math.round(width*ratio),h=Math.round(heightPx*ratio);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);gl.useProgram(program);gl.uniform2f(size,width,heightPx);gl.uniform1f(clipZ,options.perspectiveScale?0:options.clipZ||0);gl.uniform1f(depthSide,options.depthSide||0);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    if(uploadedData!==lastData){gl.bufferData(gl.ARRAY_BUFFER,lastData.vertices,gl.DYNAMIC_DRAW);uploadedData=lastData;uploads++;}
    for(const [loc,n,offset]of [[position,3,0],[color,3,12],[height,1,24],[worldZ,1,28]]){gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,n,gl.FLOAT,false,32,offset);}
    gl.drawArrays(gl.TRIANGLES,0,lastData.vertices.length/8);ctx.drawImage(canvas,0,0,width,heightPx);
   }else{
    // Exact ground-plane clipping for the non-WebGL diagnostic fallback.
    const clip=(points,value)=>{const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],u=value(a),v=value(b);if(u>=0)out.push(a);if((u>=0)!==(v>=0)){const t=u/(u-v);out.push(a.map((n,j)=>mix(n,b[j],t)));}}return out;},
     polys=lastData.polygons.map(f=>{let points=clip(f.points,p=>p[3]);if(options.depthSide)points=clip(points,p=>(p[4]-(options.perspectiveScale?0:options.clipZ||0))*options.depthSide);return {...f,points};}).filter(f=>f.points.length>2).sort((a,b)=>b.points.reduce((s,p)=>s+p[2],0)/b.points.length-a.points.reduce((s,p)=>s+p[2],0)/a.points.length);
    for(const f of polys){ctx.beginPath();f.points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=`rgb(${f.color.map(v=>Math.round(v*255)).join(',')})`;ctx.fill();}
   }
   ctx.restore();return {stage:lastData.model.pose.stage,faces:lastData.faceCount,triangles:lastData.vertices.length/24,geometryBuilds,uploads,frontNeeded:options.clipZ!==undefined&&lastData.minZ<options.clipZ,renderer:gl&&!gl.isContextLost()?'WebGL':'Canvas fallback',joints:lastData.model.joints};
  }
  return {draw,dispose(){disposed=true;if(gl){gl.deleteBuffer(buffer);gl.deleteProgram(program);}},stats:()=>lastData?{faces:lastData.faceCount,triangles:lastData.vertices.length/24,geometryBuilds,uploads}:null};
 }
 const effectCache=new Map();
 function drawEffect(ctx,h,project){
  // Small world-space props get their own depth-sort entries, so a released
  // boulder can pass in front of the player without repainting the whole golem.
  if(!effectCache.has(h.kind)){
   const [w,ht,d]=h.kind==='wave'?[1.10,.58,.55]:[1.28,1.35,1.28],b=Math.min(w,d)*.24,ring=[[-w/2+b,-d/2],[w/2-b,-d/2],[w/2,-d/2+b],[w/2,d/2-b],[w/2-b,d/2],[-w/2+b,d/2],[-w/2,d/2-b],[-w/2,-d/2+b]],
    lo=ring.map(([x,z])=>[x,-ht/2,z]),hi=ring.map(([x,z])=>[x*.78,ht/2,z*.78]),faces=[[...lo].reverse(),hi,...ring.map((_,i)=>[lo[i],lo[(i+1)%8],hi[(i+1)%8],hi[i]])];
   effectCache.set(h.kind,faces.map(v=>{let n=norm(cross(sub(v[1],v[0]),sub(v[2],v[0])));if(dot(n,v[0])<0)n=mul(n,-1);const lit=dot(n,light);return {v,n,color:M[h.kind==='wave'?'old':'boulder'][lit>.32?2:lit>-.23?1:0]};}));
  }
  const {x,y,z}=h.position,center=project(x,y,z),unit=h.heldUnit||center.s*(h.visualScale||1);ctx.save();
  for(const f of effectCache.get(h.kind).filter(f=>dot(f.n,[0,.28,-.96])>=0).map(f=>({...f,depth:f.v.reduce((s,p)=>s+p[2]*.96-p[1]*.28,0)/f.v.length})).sort((a,b)=>b.depth-a.depth)){
   ctx.beginPath();f.v.forEach((v,i)=>{const p={x:center.x+v[0]*unit,y:center.y-(v[1]*.96+v[2]*.28)*unit};if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.closePath();ctx.fillStyle=f.color;ctx.fill();ctx.strokeStyle=f.color;ctx.lineWidth=.4;ctx.stroke();
  }ctx.restore();
 }
 const api=Object.freeze({pose,build,materials:M,createRenderer,drawEffect,duration:7});root.KROathkeeperModel=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
