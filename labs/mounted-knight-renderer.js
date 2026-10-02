/* Shared mounted renderer for the game and pose Lab. Depth-tested horse mesh
 * and approved Jonathan actor; no Lab UI, bitmap atlases or game mutations. */
(()=>{'use strict';
 const R=KRMountedRig,{add,sub,mul,unit}=R,cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 let gpu=null,horseGpu=null,shieldPoints=[],actionGearGpu=null,shieldGearGpu=null,bowGearGpu=null,actionGpu=null,gearMeshes=null,transitionCanvas=null,transitionAttachedCanvas=null,duckGpu=null,actorViewport=null;
 const gearDepthShear=.16;
 // Shield arm masks use the same mounted projection as its actual GPU mesh.
 // Keep one cached hull per yaw; the static attachment points are prepared once.
 let shieldMaskAngle=NaN,shieldMask=[];
 function mountedShieldMask(angle,visible){
  const deg=Math.min((angle%360+360)%360,360-(angle%360+360)%360);
  if(!visible.shield||deg<=90)return [];
  if(angle===shieldMaskAngle)return shieldMask;
  const a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a),points=shieldPoints.map(p=>[-c*p[0]-s*p[2],p[1]+(s*p[0]-c*p[2])*gearDepthShear]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]),
   cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),lower=[],upper=[];
  for(const p of points){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}
  for(let i=points.length-1;i>=0;i--){const p=points[i];while(upper.length>1&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}
  lower.pop();upper.pop();shieldMaskAngle=angle;return shieldMask=[lower.concat(upper)];
 }
 const palette=['#a37043','#85532f','#58341f'],mane=['#b68139','#916027','#67421e'],leather=['#91653d','#68462c','#48301f'],blue=['#4b63ac','#354a8b','#263568'],steel=['#edf4f7','#bac9d4','#7c8d9f'],cream=['#eee5c9','#d2c6a5','#aaa083'],gold=['#d8b65e','#b89345','#826233'];
 // Frame-local broad phase for neck/head/mane contacts. Each cell retains
 // original face order; the original bounds and triangle test remain final.
 function indexSurfaces(all){
  if(!all.length)return {all,cells:[],minY:0,minZ:0,width:0,height:0};
  let minY=Infinity,minZ=Infinity,maxY=-Infinity,maxZ=-Infinity,references=0;
  for(const q of all){
   const y0=Math.floor(q.y0/2),y1=Math.floor(q.y1/2),z0=Math.floor(q.z0/2),z1=Math.floor(q.z1/2),
    count=(y1-y0+1)*(z1-z0+1);
   if(!Number.isSafeInteger(y0)||!Number.isSafeInteger(y1)||!Number.isSafeInteger(z0)||!Number.isSafeInteger(z1)||q.y1<q.y0||q.z1<q.z0||references+count>4096)return {all,cells:null};
   references+=count;minY=Math.min(minY,y0);maxY=Math.max(maxY,y1);minZ=Math.min(minZ,z0);maxZ=Math.max(maxZ,z1);
  }
  const width=maxZ-minZ+1,height=maxY-minY+1;
  if(width*height>256)return {all,cells:null};
  // A bounded dense address table avoids allocating string keys for every
  // inserted face. Unoccupied cells remain empty; no cross-frame state.
  const cells=new Array(width*height);
  for(const q of all){
   const y0=Math.floor(q.y0/2),y1=Math.floor(q.y1/2),z0=Math.floor(q.z0/2),z1=Math.floor(q.z1/2);
   for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++){
    const key=(y-minY)*width+z-minZ;(cells[key]||(cells[key]=[])).push(q);
   }
  }
  return {all,cells,minY,minZ,width,height};
 }
 function surfaceCandidates(surfaces,y,z){
  if(!surfaces.cells||!Number.isFinite(y)||!Number.isFinite(z))return surfaces.all;
  const row=Math.floor(y/2)-surfaces.minY,col=Math.floor(z/2)-surfaces.minZ;
  return row>=0&&row<surfaces.height&&col>=0&&col<surfaces.width?surfaces.cells[row*surfaces.width+col]||[]:[];
 }
 function face(list,v,colors,tag){const n=unit(cross(sub(v[1],v[0]),sub(v[2],v[0]))),light=n[1]*.7-n[0]*.3+n[2]*.2;
  list.push({v,n,col:colors[light>.35?0:light<-.25?2:1],tag});}
 function loft(list,sections,colors,tag){const rings=sections.map(([z,y,rx,ry,x=0])=>Array.from({length:8},(_,i)=>{const a=Math.PI/8+i*Math.PI/4;return [x+Math.cos(a)*rx,y+Math.sin(a)*ry,z];}));
  face(list,[...rings[0]].reverse(),colors,tag);for(let r=1;r<rings.length;r++)for(let j=0;j<8;j++)face(list,[rings[r-1][j],rings[r-1][(j+1)%8],rings[r][(j+1)%8],rings[r][j]],colors,tag);face(list,rings.at(-1),colors,tag);
 }
 // Separate the dorsal contour from the belly/throat: changing a back arch
 // must not inflate the entire barrel or move its planted leg sockets.
 function contour(list,sections,colors,tag){loft(list,sections.map(([z,bottom,top,width])=>[z,(bottom+top)/2,width,(top-bottom)/(2*Math.cos(Math.PI/8))]),colors,tag);}
 function box(list,center,size,colors,tag){const v=[];for(const z of [-1,1])for(const y of [-1,1])for(const x of [-1,1])v.push(add(center,[x*size[0]/2,y*size[1]/2,z*size[2]/2]));
  for(const ids of [[0,4,6,2],[1,3,7,5],[0,1,5,4],[2,6,7,3],[0,2,3,1],[4,5,7,6]])face(list,ids.map(i=>v[i]),colors,tag);
 }
 function rod(list,a,b,w,colors,tag,endWidth=w){const dir=unit(sub(b,a)),u=unit(cross(dir,Math.abs(dir[1])<.95?[0,1,0]:[0,0,1])),v=cross(dir,u),pts=[];
  for(const [index,p]of [a,b].entries())for(const [x,y]of [[-1,-1],[1,-1],[1,1],[-1,1]])pts.push(add(p,add(mul(u,x*(index?endWidth:w)/2),mul(v,y*(index?endWidth:w)/2))));
  for(const ids of [[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]])face(list,ids.map(i=>pts[i]),colors,tag);
 }
 // Cross-sections perpendicular to a curved centre line, for cheek/poll,
 // ears and hanging hair. Width and depth describe volume, not bone lengths.
 function chain(list,sections,colors,tag,stripe=false,endMaterialAt=Infinity,fixedAxis=null){const rings=sections.map(([c,w,d],j)=>{
  const before=sections[Math.max(0,j-1)][0],after=sections[Math.min(sections.length-1,j+1)][0],axis=fixedAxis||unit(sub(after,before)),u=unit(cross(axis,[0,0,1])),v=cross(axis,u);
  return Array.from({length:8},(_,i)=>{const a=Math.PI/8+i*Math.PI/4;return add(c,add(mul(u,Math.cos(a)*w/2),mul(v,Math.sin(a)*d/2)));});});
  face(list,[...rings[0]].reverse(),colors,tag);for(let r=1;r<rings.length;r++)for(let i=0;i<8;i++){
   const q=[rings[r-1][i],rings[r-1][(i+1)%8],rings[r][(i+1)%8],rings[r][i]];
   if(r>=endMaterialAt)face(list,q,cream,tag);
   else if(stripe&&i===5){const mix=(a,b,t)=>add(a,mul(sub(b,a),t)),a=mix(q[0],q[1],.18),c=mix(q[0],q[1],.82),d=mix(q[3],q[2],.82),e=mix(q[3],q[2],.18);
    face(list,[q[0],a,e,q[3]],colors,tag);face(list,[a,c,d,e],cream,tag);face(list,[c,q[1],q[2],d],colors,tag);
   }else face(list,q,colors,tag);
  }face(list,rings.at(-1),rings.length-1>=endMaterialAt?cream:colors,tag);return rings;
 }
 // A continuous skin across the stifle/hock: adjacent bones share one ring,
 // rather than overlapping capped rods that make a knot at each joint.
 function legRings(sections,angles){return sections.map(([c,w,d,fixedAxis],j)=>{
  const before=sections[Math.max(0,j-1)][0],after=sections[Math.min(sections.length-1,j+1)][0],axis=fixedAxis||unit([0,after[1]-before[1],after[2]-before[2]]),v=[0,axis[2],-axis[1]];
  return Array.from({length:10},(_,i)=>{const q=angles?angles[i]:Math.PI/10+i*Math.PI/5;return add(c,add([Math.cos(q)*w/2,0,0],mul(v,Math.sin(q)*d/2)));});});}
 // Keep the authored fore-right material correspondence independent of later
 // belly fullness; the body boundary may move without retwisting this leg.
 const skinBindAngles=new Map([['true:1',[
  .052359877559829904,1.2042771838760873,1.832595714594046,2.155416497555291,2.5656340004316642,
  3.193952531149623,4.155013220582465,4.618688278855718,5.078908123303499,5.707226654021458
 ]]]);
 function legSkin(list,sections,sockIndex,socket,restSections,offset=4){
  let angles=socket&&skinBindAngles.get(socket.bindKey);
  if(socket&&!angles){
   // The body opening is not a regular decagon. Aim each material column
   // toward its own bind boundary, once, instead of twisting uniform sectors.
   // The 15-degree limit preserves at least six degrees between neighbours.
   const axis=unit(sub(restSections[1][0],restSections[0][0])),depth=[0,axis[2],-axis[1]];
   angles=Array.from({length:10},(_,i)=>{const v=sub(socket.rest[(i+offset)%10],restSections[0][0]),q=Math.PI/10+i*Math.PI/5,
    a=Math.atan2((v[1]*depth[1]+v[2]*depth[2])/restSections[0][2],v[0]/restSections[0][1]);
    return q+Math.max(-Math.PI/12,Math.min(Math.PI/12,Math.atan2(Math.sin(a-q),Math.cos(a-q))));
   });
   skinBindAngles.set(socket.bindKey,angles);
  }
  const rings=legRings(sections,angles),rest=legRings(restSections,angles),coatColumns=[],
   // The right shoulder's oblique socket normals point under the torso even
   // on its exposed outer face. Author that face as one coat plane; the four
   // contiguous underside columns keep their broad shadow through the leg.
   // Keep the left haunch's broad field independent of the trimmed rear
   // contour too; that silhouette edit must not add another dark wedge.
   coatField=socket?.bindKey==='true:1'?[1,1,1,1,1,2,2,2,2,1]:
    socket?.bindKey==='false:-1'?[2,2,1,1,0,1,1,1,1,1]:null;
  if(socket?.moving&&socket.bindKey.startsWith('false:')){
   // The hamstring stays broad when the stifle folds forward. A regular
   // narrow shin ring alone lets this posterior mass collapse in collection.
   // Fill only its rear half, tapering into the next row; bones, hoof paths,
   // lateral width and the shared body boundary are unchanged. Joint-driven
   // broad quintic pose gates leave the extended/standing leg alone. Spread
   // collection over the bend and an eight-unit height range: the former
   // three-unit gate pulsed through its full volume in about 2.5 frames at
   // 60 Hz. No frame-history filter, bone delay or bind-colour change.
   const l=socket.pose,a=unit(sub(l.joint,l.root)),b=unit(sub(l.hock,l.joint)),
    bend=Math.acos(Math.max(-1,Math.min(1,a.reduce((n,x,i)=>n+x*b[i],0)))),
    smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(10+x*(-15+6*x));},
    response=smooth((bend-1.35)/.85)*smooth((l.joint[1]-l.hock[1]+4)/8);
   for(const [index,amplitude]of [[0,5],[1,2.5]])for(let i=0;i<10;i++){
    const weight=Math.max(0,-Math.sin(angles[i]));
    rings[index][i]=add(rings[index][i],[0,0,-amplitude*response*weight*weight]);
   }
  }
  // Material planes are authored in the bind pose. Pose normals are only for
  // culling; three-colour threshold changes must not repaint the moving skin.
  const shade=(vertices,colors)=>{const n=unit(cross(sub(vertices[1],vertices[0]),sub(vertices[2],vertices[0]))),l=n[1]*.7-n[0]*.3+n[2]*.2;return colors[l>.35?0:l<-.25?2:1];},
   strip=(a,b,restA,restB,colors,region)=>{for(let i=0;i<10;i++){const j=(i+1)%10;
    let col=shade([restA[i],restA[j],restB[j],restB[i]],colors);
    // Author each broad coat plane at its body attachment, then carry it
    // through the muscle. Reclassifying every tapered row makes isolated
    // dark triangles and stair-stepped shadow borders at the moving joints.
    // White socks retain their separate material planes.
    if(colors===palette){
     if(region==='torso-cuff')coatColumns[i]=coatField?palette[coatField[i]]:col;
     col=coatColumns[i]||col;
    }
    // Mirror the quad diagonal with its bind correspondence. A global diagonal
    // can fold one handedness through the adjacent strip at a deep joint bend.
    for(const v of (offset===5?[[a[i],a[j],b[i]],[a[j],b[j],b[i]]]:[[a[i],a[j],b[j]],[a[i],b[j],b[i]]])){face(list,v,colors,'leg');const q=list.at(-1);q.col=col;q.skinRegion=region;}
   }};
  if(socket){
   // The barrel has an actual ten-edge opening here. Reuse those exact
   // vertices: no hidden cap, intersecting tube, or painted shoulder patch.
   // Fixed material correspondence, including winding. Re-optimizing nearest
   // vertices per pose would make the skin jump or turn inside-out mid-stride.
   const best=rings[0].map((_,i)=>socket.posed[(i+offset)%10]),bind=rings[0].map((_,i)=>socket.rest[(i+offset)%10]),
    mix=(a,b,t)=>add(a,mul(sub(b,a),t)),
    cuffRest=bind.map((v,i)=>mix(v,rest[0][i],.38)),cuff=best.map((v,i)=>mix(v,rings[0][i],.38)),
    middle=cuff.map((v,i)=>mix(v,rings[0][i],.55)),middleRest=cuffRest.map((v,i)=>mix(v,rest[0][i],.55));
   if(socket.moving&&socket.bindKey.startsWith('false:')){
    // Soften only the raised inner thigh notch. Keep the shared rump edge,
    // lateral width and posterior volume response intact; the small fill
    // fades with the local lift, not an animation time or camera angle.
    const i=socket.pose.side<0?0:4,h=Math.max(0,Math.min(1,(rings[0][i][1]-best[i][1])/3)),
     fill=.65*h*h*h*(10+h*(-15+6*h));
    rings[0][i]=add(rings[0][i],[0,-fill,0]);
    rings[1][i]=add(rings[1][i],[0,-fill*.15,0]);
    cuff[i]=mix(best[i],rings[0][i],.38);middle[i]=mix(cuff[i],rings[0][i],.55);
   }
   // The boundary follows the bounded shoulder/haunch pose; this local fan
   // connects it to the articulated upper-leg mass.
   // Intermediate rows follow the same material paths without a rigid lip
   // that a raised leg could fold through.
   strip(best,cuff,bind,cuffRest,palette,'torso-cuff');
   strip(cuff,middle,cuffRest,middleRest,palette,'transition');
   strip(middle,rings[0],middleRest,rest[0],palette,'transition');
  }else face(list,[...rings[0]].reverse(),palette,'leg');
  for(let r=1;r<rings.length;r++)strip(rings[r-1],rings[r],rest[r-1],rest[r],r>sockIndex?cream:palette,'limb');face(list,rings.at(-1),cream,'leg');list.at(-1).col=shade(rest.at(-1),cream);
 }
 const bindPose=R.sample({angle:0,time:0,motion:'idle'}),
  localLeg=(world,s)=>({...world,root:mul(world.root,1/s),baseRoot:world.baseRoot&&mul(world.baseRoot,1/s),socketOffset:world.socketOffset?mul(world.socketOffset,1/s):[0,0,0],joint:mul(world.joint,1/s),end:mul(world.end,1/s),elbow:world.elbow&&mul(world.elbow,1/s),hock:world.hock&&mul(world.hock,1/s)}),
  bindLegs=bindPose.legs.map(l=>localLeg(l,bindPose.horseScale));
 // Pose only the soft lower envelope; authored rings and socket bind geometry
 // never change. The dorsal saddle contact and the leg roots stay outside it.
 function bellyPoint(p,v){
  const amount=p.abdomenTuck||0;if(!amount)return [...v];
  const b=p.bob/p.horseScale,smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(10+x*(-15+6*x));},
   along=smooth((v[2]+10)/5)*smooth((10-v[2])/6),
   height=1-smooth((v[1]-b-13)/7.5),side=1-smooth((Math.abs(v[0])-2.5)/3.1),
   w=along*height*side;
  return [v[0]*(1-.025*amount*w),v[1]+amount*w,v[2]];
 }
 function fleshPose(p){
  const b=p.bob/p.horseScale,smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
  if(p.motion==='idle'&&!p.jump)return p.bodyPoint;
  const muscles=p.legs.map(world=>{
   const l=localLeg(world,p.horseScale),rest=bindLegs.find(v=>v.front===l.front&&v.side===l.side),
    restRoot=p.bodyPoint(add(rest.root,[0,b,0])),
    restUpper=p.bodyPoint(add(l.front?add(rest.root,mul(sub(rest.joint,rest.root),.4)):rest.joint,[0,b,0])),
    upper=l.front?l.elbow:l.joint,a=sub(restUpper,restRoot),c=sub(upper,l.root),
    raw=Math.atan2(c[2],c[1])-Math.atan2(a[2],a[1]),delta=Math.atan2(Math.sin(raw),Math.cos(raw));
   return {l,angle:.8*Math.tanh(delta/.8)};
  });
  return v=>{
   let q=p.bodyPoint(bellyPoint(p,v));
   for(const {l,angle}of muscles){
    // The shoulder/haunch itself now follows the actual proximal bone.
    // Softly fade into the centre saddle and spine, keeping the tail root,
    // head and central tack in their existing attachment frames.
    const side=smooth((l.side*v[0]-.5)/5),z=l.front?v[2]:-v[2],
     along=smooth((z-5.6)/4.2)*smooth(((l.front?16:19)-z)/3),
     height=1-smooth((v[1]-b-23.5)/5.5),weight=side*along*height,
     r=angle*weight*(l.front?.90:.65);
    // The load-bearing socket and its overlying flesh share the same local
    // translation. The middle saddle band still has zero shoulder weight.
    q=add(q,mul(l.socketOffset,weight));
    const y=q[1]-l.root[1],depth=q[2]-l.root[2];
    if(r)q=[q[0],l.root[1]+y*Math.cos(r)-depth*Math.sin(r),l.root[2]+y*Math.sin(r)+depth*Math.cos(r)];
   }
   return q;
  };
 }
 function skinSections(l,moving=false){const between=(a,b,t)=>add(a,mul(sub(b,a),t)),lower=l.front?l.joint:l.hock,
  sock=between(lower,l.end,.32),rotate=v=>[v[0],v[1]*Math.cos(l.pitch)-v[2]*Math.sin(l.pitch),v[1]*Math.sin(l.pitch)+v[2]*Math.cos(l.pitch)],
  // Rear skin terminates just inside the solid hoof, so its closure cannot
  // cut the lower sock at the folded-hock extreme. Keep the visible hoof rig.
  fetlock=add(l.end,[0,1.25,.05]),toe=add(l.end,rotate([0,l.front?.15:-.10,.15])),hoofAxis=rotate([0,-1,0]);
  const elbow=l.elbow||between(l.root,l.joint,.4);
  // Upper muscle belongs to the short proximal bones. Its taper reaches a
  // visible elbow/stifle before the narrow lower leg, not a long skin sack.
  // During motion the muscle ends on the actual elbow, not above the joint.
  // Its first ring is then aligned with the forearm and cannot fold back
  // through the shoulder transition when the chest loads onto this leg.
  return l.front?[[between(l.root,elbow,moving?1:.8),4.3,4.2],[between(elbow,l.joint,.40),3.3,3.4],[l.joint,2.4,2.5],[sock,1.95,2.1],[fetlock,3.3,3.5],[toe,3.25,2.75,hoofAxis]]:
   [[between(l.joint,l.hock,moving?.40:.50),4.0,4.4],[between(l.joint,l.hock,moving?.60:.70),3.0,3.2],[l.hock,2.3,2.65],[sock,2.0,2.15],[fetlock,3.35,3.55],[toe,3.3,2.8,hoofAxis]];
 }
 // One connected, bevelled hair mass. No second capped tube poking out near
 // the end: a short oblique cut keeps the tip blunt in profile, not needle-like.
 const tailRest=[[0,23,-15.4],[.15,19,-17.4],[.2,14.2,-18.6],[.05,9.7,-18.4],[-.15,6.65,-17.7],[-.4,5.10,-17.05]],
  tailSizes=[[1.7,1.9],[3.1,2.15],[3.35,2.1],[2.8,1.7],[1.55,1.25],[1.0,.9]],
  tailCorners=[[-.5,-.3],[-.3,-.5],[.3,-.5],[.5,-.3],[.5,.3],[.3,.5],[-.3,.5],[-.5,.3]];
 function tailPoints(p){
  const idle=p.motion==='idle',walk=p.motion==='walk',fast=p.motion==='gallop',
   clock=idle?p.time*Math.PI*2/2.4:p.phase,bodyWeight=p.jump?.bodyWeight??1,
   sideAmp=(idle?.009:walk?.026:fast?.065:.050)*bodyWeight,
   pitchAmp=(idle?.008:walk?.020:fast?.075:.033)*bodyWeight,points=[add(tailRest[0],[0,p.bob/p.horseScale,0])];
  for(let i=1;i<tailRest.length;i++){
   const u=i/(tailRest.length-1),lag=.2+u*1.1,
    // Each segment keeps its length, while the distal motion arrives later.
    // Fast travel carries the hair back; idle is a quiet residual sway.
    // A sinking haunch lifts the hair slightly at its root, preserving the
    // accepted cut and sway without letting the stronger body dip drag it.
    counterPitch=fast?Math.sqrt(p.bodyPitch*p.bodyPitch+.003*.003)-p.bodyPitch:0,
    pitch=counterPitch+p.tailLift*.09*(.45+.65*u)+pitchAmp*(.35+.9*u)*Math.sin(clock*(idle||fast?1:2)-lag),
    sway=sideAmp*(.4+1.2*u)*Math.sin(clock-lag),d=sub(tailRest[i],tailRest[i-1]),
    y=d[1]*Math.cos(pitch)-d[2]*Math.sin(pitch),z=d[1]*Math.sin(pitch)+d[2]*Math.cos(pitch),
    rotated=[d[0]*Math.cos(sway)-y*Math.sin(sway),d[0]*Math.sin(sway)+y*Math.cos(sway),z];
   points.push(add(points.at(-1),rotated));
  }
  return points.map(p.bodyPoint);
 }
 function tailGeometry(points){
  const rings=tailSizes.map(([w,d],i)=>{const axis=unit(sub(points[Math.min(points.length-1,i+1)],points[Math.max(0,i-1)])),
   side=unit(sub([1,0,0],mul(axis,axis[0]))),depth=cross(axis,side);
   return tailCorners.map(([x,z])=>{const v=add(points[i],add(mul(side,x*w),mul(depth,z*d)));
    if(i===tailSizes.length-1)v[1]+=z*.55+x*.15;return v;
   });
  }),faces=[[...rings[0]].reverse()];
  for(let r=1;r<rings.length;r++)for(let i=0;i<8;i++){const j=(i+1)%8;
   faces.push([rings[r-1][i],rings[r-1][j],rings[r][j]],[rings[r-1][i],rings[r][j],rings[r][i]]);
  }
  faces.push(rings.at(-1));
  return faces;
 }
 const tailBindFaces=tailGeometry(tailRest),tailColors=tailBindFaces.map(v=>{const n=unit(cross(sub(v[1],v[0]),sub(v[2],v[0]))),light=n[1]*.7-n[0]*.3+n[2]*.2;return mane[light>.35?0:light<-.25?2:1];});
 function tailMesh(p){return tailGeometry(tailPoints(p)).map((v,i)=>({v,n:unit(cross(sub(v[1],v[0]),sub(v[2],v[0]))),col:tailColors[i],tag:'tail'}));}
 // Shared source corners need each pure pose transform only once per horse.
 // These maps die with this call; final scaling still copies every face corner.
 function memoPoint(transform){
  const points=new Map();
  return v=>{let q=points.get(v);if(!q){q=transform(v);points.set(v,q);}return q;};
 }
 // A small shared duck nod, layered on the current gait. The neck root stays
 // planted; skull, ears, bridle and bits share the rigid upper-neck rotation.
 // Work in posed horse coordinates so the cached rear mesh and procedural
 // views use the same deformation without rebuilding the expensive skin.
 function horseDuckPoint(p,scale=p.horseScale){
  if(!(p.duck?.horseAmount??p.duck?.amount))return null;
  const pivot=mul(p.bodyPoint([0,26.4+p.bob/p.horseScale,8]),scale),
   bc=Math.cos(p.bodyPitch),bs=Math.sin(p.bodyPitch),angle=.22*(p.duck.horseAmount??p.duck.amount);
  return v=>{const y=v[1]-pivot[1],z=v[2]-pivot[2],
   forward=(-y*bs+z*bc)/scale+8,t=Math.max(0,Math.min(1,(forward-4.5)/10.5)),
   a=angle*t*t*(3-2*t),c=Math.cos(a),s=Math.sin(a);
   return [v[0],pivot[1]+y*c-z*s,pivot[2]+y*s+z*c];};
 }
 const duckHorsePart=f=>f.tag==='head'||f.tag==='neck'||f.tag==='mane';
 function bendHorseFace(target,source,point){
  target.v=source.v.map(point);
  target.n=unit(cross(sub(target.v[1],target.v[0]),sub(target.v[2],target.v[0])));
 }
 function horse(p,withReins=true,entryShell=null,contacts=null){const f=[],s=p.horseScale,b=p.bob/s,fleshPoint=memoPoint(fleshPose(p)),bodyPoint=memoPoint(p.bodyPoint);
  // Reference relationship: broad horse mass beneath a seated, smaller rider.
  // Twelve broad oval planes replace the vertical eight-ring side wall and
  // pinched bottom bevel. The low central belly remains visible between the
  // forelegs in front view, and rises back into both leg roots in profile.
  // Keep the established back/seat and rear socket stations.
  // Continue the solid pectoral core into the neck's underside; the old low
  // front station left a real slit that no culling change could fill.
  // Trim only the low rear overhang: the old flat buttock underside formed
  // a ledge above the moving thigh. This gives it a sloping muscle contour
  // without moving the hip, dorsal seat, central belly or leg skeleton.
  const bodySections=[[-16,18.5,22.4,2.8],[-11.4,14.9,25.7,6],[-5.5,13.45,25,6.1],[-3.8,12.0,24.7,6.1],[-3,11.6,24.4,6.1],[0,11.3,24.7,6.05],[3,11.6,25.133333333333333,5.95],[9,14.8,26,5.7],[12.8,17.8,26.5,3.5],[14.2,20.2,27.5,2.4]],
   sectors=12,bodyRings=bodySections.map(([z,bottom,top,width])=>Array.from({length:sectors},(_,i)=>{const a=Math.PI/sectors+i*Math.PI*2/sectors,bellyWidth=Math.abs(z)<=3?.9:.6;return [Math.cos(a)*width*((i===8||i===9)?bellyWidth:1),(bottom+top)/2+b+Math.sin(a)*(top-bottom)/(2*Math.cos(Math.PI/sectors)),z];})),
   sockets=new Map(),holes=[{front:false,start:0},{front:true,start:6}];
  // Share the exact posed shoulder/haunch boundary with each upper-leg skin;
  // the central saddle band remains outside this local muscle deformation.
  for(const {front,start}of holes)for(const side of [-1,1]){
   const j=side>0?9:5,at=(r,k)=>bodyRings[start+r][(j+k)%sectors],
    boundary=[at(0,0),at(0,1),at(0,2),at(0,3),at(1,3),at(2,3),at(2,2),at(2,1),at(2,0),at(1,0)];
   sockets.set(`${front}:${side}`,{bindKey:`${front}:${side}`,posed:boundary.map(fleshPoint),rest:boundary.map(v=>add(v,[0,-b,0]))});
  }
  face(f,[...bodyRings[0]].reverse(),palette,'barrel');
  for(let r=1;r<bodyRings.length;r++)for(let j=0;j<sectors;j++){
   if(holes.some(h=>r>h.start&&r<=h.start+2)&&(j===5||j===6||j===7||j===9||j===10||j===11))continue;
   face(f,[bodyRings[r-1][j],bodyRings[r-1][(j+1)%sectors],bodyRings[r][(j+1)%sectors],bodyRings[r][j]],palette,'barrel');
  }
  face(f,bodyRings.at(-1),palette,'barrel');
  if(entryShell){
   for(const q of f){q.v=q.v.map(fleshPoint);q.n=unit(cross(sub(q.v[1],q.v[0]),sub(q.v[2],q.v[0])));}
   f.push(...entryShell);
  }else{
  // Narrow LEFT/RIGHT in the head-on view, not the side-profile throat.
  // Restore the approved Y/Z contour; taper the lateral change to zero at
  // the chest root and poll so neither the barrel nor head needs resizing.
  const neckSideSections=[[4.5,1],[7.8,.8],[10.5,.8],[13.2,.84],[14.7,.9],[15.6,.94],[17.5,1]],
   neckSideScale=z=>{for(let i=1;i<neckSideSections.length;i++){
    const [a,sa]=neckSideSections[i-1],[c,sc]=neckSideSections[i];
    if(z<=c)return sa+(sc-sa)*Math.max(0,(z-a)/(c-a));
   }return 1;};
  contour(f,[[4.5,18.5+b,26.0+b,4.65],[7.8,19.0+b,29.4+b,4.9],[10.5,22.0+b,32.2+b,4.25],[13.2,26.0+b,34.1+b,3.3],
   [14.7,27.35+b,34.44375+b,2.70625],[15.6,27.75+b,34.65+b,2.35],[16.5,27.92+b,34.555263+b,2.136842],
   [17.5,28.08+b,34.45+b,1.9],[18.25,28.8+b,33.8+b,1.8]]
   .map(([z,bottom,top,width])=>[z,bottom,top,width*neckSideScale(z)]),palette,'neck');
  const headStart=f.length;
  // Head-only contour: independent nose and jaw edges, not a uniformly
  // tapered tube. Zelda references have a full cheek behind the nasal ridge
  // and a short blunt lip. The approved poll/neck attachment stays put.
  // y, jaw/back edge, nasal/front edge, full width, white marking, jaw drop.
  // Fill the user's marked lower jaw contour, not the face width or nasal
  // length. Taper the downward offset to zero at the poll and muzzle tip.
  const headSections=[[34.9,16.5,19.5,3.8,.20,0],[33.3,16.0,21.0,5.6,.32,0],
   [31.6,15.6,22.2,6.2,.38,.15],[29.4,16.45,23.4,6.8,.45,.85],
   [27.5,19.25,24.4,4.75,.58,1.4],[25.4,22.0,25.5,4.25,.65,1.05],
   [24.4,22.1,26.0,4.8,.78,.55],[23.3,22.65,25.8,4.5,.80,.18],[22.9,23.1,25.1,3.9,.8,0]];
  const skull=headSections.map(([y,back,front,w,mark,jawDrop])=>{
   const edge=(front-back)*.29;
   return [[-w/2,back+edge],[-w*.21,back],[w*.21,back],[w/2,back+edge],
    [w/2,front-edge],[w*.21,front],[-w*.21,front],[-w/2,front-edge]].map(([x,z])=>[x,y+b-jawDrop*(front-z)/(front-back),z]);
  });
  const mix=(a,c,t)=>add(a,mul(sub(c,a),t));
  face(f,[...skull[0]].reverse(),palette,'head');
  for(let r=1;r<skull.length;r++)for(let sector=0;sector<8;sector++){
   const j=(sector+1)%8,q=[skull[r-1][sector],skull[r-1][j],skull[r][j],skull[r][sector]];
   if(r>=6&&sector>=3){face(f,q,cream,'head');continue;}
   if(sector<4||sector>6){face(f,q,palette,'head');continue;}
   // Partition the actual surface into coat/white planes. The marking widens
   // toward the nose and wraps its bevels rather than floating above a face.
   const band=ring=>{const width=headSections[ring][4],clamp=v=>Math.max(0,Math.min(1,v));
    return sector===5?[clamp((1-width/.42)/2),clamp((1+width/.42)/2)]:sector===4?[clamp((.5-width/2)/.29),1]:[0,clamp((width/2-.21)/.29)];};
   const [a,c]=band(r-1),[d,e]=band(r),strip=(u0,u1,v0,v1,colors)=>{
    if(Math.abs(u1-u0)+Math.abs(v1-v0)<1e-6)return;
    const v=[mix(q[0],q[1],u0),mix(q[0],q[1],u1),mix(q[3],q[2],v1),mix(q[3],q[2],v0)]
     .filter((p,i,a)=>Math.hypot(...sub(p,a[(i+a.length-1)%a.length]))>1e-7);
    if(v.length>2)face(f,v,colors,'head');
   };
   strip(0,a,0,d,palette);strip(a,c,d,e,cream);strip(c,1,e,1,palette);
  }
  face(f,skull.at(-1),cream,'head');
  // Sample an actual skull panel for each eye/tack attachment, so changing
  // cheek proportions cannot leave a free-floating or buried facial feature.
  const skinPoint=(r,sector,u,t,lift=.045)=>{const j=(sector+1)%8,a=mix(skull[r][sector],skull[r][j],u),c=mix(skull[r+1][sector],skull[r+1][j],u),n=unit(cross(sub(skull[r][j],skull[r][sector]),sub(skull[r+1][j],skull[r][sector])));return add(mix(a,c,t),mul(n,lift));};
  // Tack has real flat leather faces, not round lines or camera overlays.
  // Each cross-section follows the skull; the closed .06-thick back sits
  // above the coat. All headstall parts share the existing head/nod transform.
  const bridle=['#805334','#603b24','#3e271c'],headstallEnds=[],browEnds=[],throatStarts=[];
  const strap=(rows,colors=bridle)=>{
   const outward=(v,n)=>{const q=cross(sub(v[1],v[0]),sub(v[2],v[0]));face(f,q.reduce((s,x,i)=>s+x*n[i],0)<0?[...v].reverse():v,colors,'head');},
    inner=rows.map(([a,c,n])=>[sub(a,mul(n,.06)),sub(c,mul(n,.06))]);
   for(let i=1;i<rows.length;i++){
    const [a,c,n]=rows[i-1],[d,e,m]=rows[i],normal=unit(add(n,m));
    outward([a,c,e,d],normal);outward([inner[i-1][0],inner[i][0],inner[i][1],inner[i-1][1]],mul(normal,-1));
    outward([a,d,inner[i][0],inner[i-1][0]],sub(a,c));
    outward([c,inner[i-1][1],inner[i][1],e],sub(c,a));
   }
   for(const i of [0,rows.length-1]){const [a,c]=rows[i],other=rows[i===0?1:i-1];
    outward([a,inner[i][0],inner[i][1],c],sub(add(a,c),add(other[0],other[1])));
   }
  };
  const sideStrapRow=(side,r,u,t=0,width=.48,sector=side>0?3:7)=>{
   const at=(u,lift)=>skinPoint(r,sector,side>0?u:1-u,t,lift),
    span=Math.hypot(...sub(at(1,0),at(0,0))),du=width/(2*span),
    n=unit(sub(at(u,.1),at(u,0)));
   return [at(u-du,.12),at(u+du,.12),n];
  };
  const bitPoints=[];
  for(const side of [-1,1]){
   chain(f,[[[side*1.5,34.2+b,17.5],1.4,1.4],[[side*1.75,36.0+b,17.6],1.0,1.0],[[side*1.9,37.35+b,17.8],.12,.15]],palette,'head');
   const sector=side>0?4:6,u=side>0?.32:.68;
   const eye=[skinPoint(1,sector,u-.28,.59),skinPoint(1,sector,u-.13,.40),skinPoint(1,sector,u+.20,.40),skinPoint(1,sector,u+.29,.61),skinPoint(1,sector,u+.18,.88),skinPoint(1,sector,u-.16,.88)];
   face(f,eye,['#241f19','#241f19','#241f19'],'head');
   face(f,[skinPoint(1,sector,u-.03,.47,.065),skinPoint(1,sector,u+.12,.47,.065),skinPoint(1,sector,u+.12,.68,.065),skinPoint(1,sector,u-.03,.68,.065)],['#82989d','#52696d','#39494c'],'head');
   rod(f,skinPoint(1,sector,u-.16,.36),skinPoint(1,sector,u+.22,.36),.15,palette,'head');
   const nostril=[skinPoint(5,sector,u-.19,.18),skinPoint(5,sector,u+.23,.25),skinPoint(5,sector,u+.20,.77),skinPoint(5,sector,u-.16,.86)];
   face(f,nostril,['#514531','#514531','#514531'],'head');
   const bit=skinPoint(6,sector,side>0?.01:.99,.5,.16);
   // Behind the eye: side panels 3/7, then the rear upper bevel at the poll.
   // Knots at every skull ring stop a long strap chord cutting the cheek.
   const cheekRows=[sideStrapRow(side,0,.35,0,.48,side>0?2:0),
    sideStrapRow(side,1,.17),sideStrapRow(side,2,.36),sideStrapRow(side,3,.58),
    sideStrapRow(side,4,.7),sideStrapRow(side,5,.8),sideStrapRow(side,6,.88)];
   const endNormal=unit(sub(bit,skinPoint(6,sector,side>0?.01:.99,.5,0))),
    endAcross=unit(cross(endNormal,sub(bit,mul(add(cheekRows.at(-1)[0],cheekRows.at(-1)[1]),.5)))),
    bitRow=[add(bit,mul(endAcross,.22)),sub(bit,mul(endAcross,.22)),endNormal],
    previousSpan=sub(cheekRows.at(-1)[1],cheekRows.at(-1)[0]);
   // Mirroring changes the cross-product sign, not the ribbon's edge order.
   // Keep the two edges paired to avoid a half-twist at the left bit ring.
   if(sub(bitRow[1],bitRow[0]).reduce((sum,x,i)=>sum+x*previousSpan[i],0)<0)[bitRow[0],bitRow[1]]=[bitRow[1],bitRow[0]];
   cheekRows.push(bitRow);
   strap(cheekRows);headstallEnds.push(cheekRows[0]);
   // One small open metal buckle, aligned with the leather rather than an
   // axis-aligned gold block floating in front of the cheek.
   const a=mul(add(cheekRows[1][0],cheekRows[1][1]),.5),c=mul(add(cheekRows[2][0],cheekRows[2][1]),.5),
    along=unit(sub(c,a)),normal=unit(add(cheekRows[1][2],cheekRows[2][2])),across=unit(cross(normal,along)),
    centre=add(mix(a,c,.64),mul(normal,.10)),corners=[[-1,-1],[1,-1],[1,1],[-1,1]]
     .map(([u,v])=>add(centre,add(mul(across,u*.34),mul(along,v*.42))));
   for(let j=0;j<4;j++)rod(f,corners[j],corners[(j+1)%4],.11,steel,'head');
   rod(f,sub(centre,mul(across,.28)),add(centre,mul(across,.23)),.08,steel,'head');
   // User-marked V: the second branch passes IN FRONT of the ear and meets
   // the rear crown/cheek branch at the same buckle, never across the eye.
   const brow=sideStrapRow(side,0,.22,0,.42,side>0?4:6),
    buckleRow=[add(centre,mul(across,.22)),sub(centre,mul(across,.22)),normal];
   if(sub(buckleRow[1],buckleRow[0]).reduce((sum,x,i)=>sum+x*previousSpan[i],0)<0)[buckleRow[0],buckleRow[1]]=[buckleRow[1],buckleRow[0]];
   strap([brow,sideStrapRow(side,1,.60,0,.42),buckleRow]);
   browEnds.push(brow);throatStarts.push({side,centre});
   // The rein keeps its exact existing anchor in the centre of the bit ring.
   const ringY=unit(cross(endNormal,[0,0,1])),ringZ=cross(endNormal,ringY),ring=[];
   for(let j=0;j<8;j++){const angle=j*Math.PI/4;ring.push(add(bit,add(mul(ringY,Math.cos(angle)*.34),mul(ringZ,Math.sin(angle)*.34))));}
   for(let j=0;j<8;j++)rod(f,ring[j],ring[(j+1)%8],.11,steel,'head');
   bitPoints.push(bit);
  }
  // Connect both cheek straps over the rear skull, behind the ear roots.
  // The forelock stays free; the band does not run across the eyes or blaze.
  const crownCentre=x=>[[x,35.01+b,16.60],[x,35.01+b,17.02],[0,1,0]];
  strap([headstallEnds[0],crownCentre(-.6),crownCentre(0),crownCentre(.6),headstallEnds[1]]);
  const browCentre=x=>[[x,35.01+b,18.65],[x,35.01+b,19.05],[0,1,0]];
  strap([browEnds[0],browCentre(-.6),browCentre(0),browCentre(.6),browEnds[1]]);
  // No nose loop: the reference uses the bit/cheek straps and throatlatch.
  // Broad locks over the arched neck: each is a solid taper with a clear tip.
  const maneStart=f.length;
  for(const [z,y,x,length]of [[6.2,27.8,4.8,4.6],[8.7,30.45,4.65,5.0],[11,32.7,4.0,5.35],[13.4,34.35,3.05,4.8],[15.5,34.85,2.35,4.05],[17.1,34.6,1.9,3.1]]){
   chain(f,[[[0,y+b,z],.85,2.85],[[2.0,y-.65+b,z-.25],1.35,2.95],[[x+.22,y-2.65+b,z-.7],1.12,2.45],[[x+.34,y-length+b,z-1.25],.12,.65]],mane,'mane');
  }
  // Fit the locks in X only; keep every side-view Y/Z vertex unchanged.
  for(const q of f.splice(maneStart))face(f,q.v.map(([x,y,z])=>[x*neckSideScale(z),y,z]),mane,'mane');
  // Forelock falls between the ears; it does not create another upright plate.
  chain(f,[[[0,35.05+b,18.95],2.8,1.4],[[-.5,33.7+b,21.1],2.6,.75],[[-.9,31.55+b,22.55],.12,.15]],mane,'head');
  // Small requested head-only volume adjustment around the fixed poll. Add
  // vertical weight below it without lengthening ears or moving the neck.
  const headVolume=v=>{const dy=v[1]-(34.1+b);return [v[0]*1.035,34.1+b+dy*(dy<0?1.08:1),18+(v[2]-18)*1.035];};
  // A slight nod belongs to the whole skull/bridle, so reins use that same bit.
  const nod=p.headNod;
  const nodPoint=v=>{const y=v[1]-(32+b),z=v[2]-18;return [v[0],32+b+y*Math.cos(nod)-z*Math.sin(nod),18+y*Math.sin(nod)+z*Math.cos(nod)];};
  const headPoint=memoPoint(v=>nodPoint(headVolume(v)));
  for(let i=headStart;i<f.length;i++)if(f[i].tag==='head'){f[i].v=f[i].v.map(headPoint);f[i].n=unit(cross(sub(f[i].v[1],f[i].v[0]),sub(f[i].v[2],f[i].v[0])));}
  p.bits=bitPoints.map(v=>mul(headPoint(v),s));
   // Real horse-space straps share the neck's depth test. Route each sample
   // outside the actual neck/head/mane surface, not an unrelated screen-space
   // midpoint. Bounds reject most faces before the small Y/Z intersection.
   const surfaceEnvelope=()=>{
    const all=[];
    for(const q of f)if(q.tag==='neck'||q.tag==='head'||q.tag==='mane'){
     let y0=Infinity,y1=-Infinity,z0=Infinity,z1=-Infinity;
     for(const v of q.v){y0=Math.min(y0,v[1]);y1=Math.max(y1,v[1]);z0=Math.min(z0,v[2]);z1=Math.max(z1,v[2]);}
     all.push({v:q.v,y0,y1,z0,z1});
    }
    return indexSurfaces(all);
   };
   let surfaces=surfaceEnvelope();
   const outside=(point,side,clearance=.36)=>{
    const y=point[1],z=point[2];let extent=-Infinity;
    for(const q of surfaceCandidates(surfaces,y,z)){if(y<q.y0||y>q.y1||z<q.z0||z>q.z1)continue;
     const a=q.v[0];for(let j=1;j<q.v.length-1;j++){
      const c=q.v[j],d=q.v[j+1],dy=c[1]-a[1],dz=c[2]-a[2],ey=d[1]-a[1],ez=d[2]-a[2],det=dy*ez-dz*ey;
      if(Math.abs(det)<1e-8)continue;
      const u=((y-a[1])*ez-(z-a[2])*ey)/det,v=(dy*(z-a[2])-dz*(y-a[1]))/det;
      if(u>=-1e-6&&v>=-1e-6&&u+v<=1.000001)extent=Math.max(extent,side*(a[0]+u*(c[0]-a[0])+v*(d[0]-a[0])));
     }
    }
    if(Number.isFinite(extent))point[0]=side*Math.max(side*point[0],extent+clearance);
    return point;
   };
  // Throatlatch: moving buckle anchors, neck-space underside. Generate AFTER
  // the skull nod so it cannot swing through the fixed neck. Sample both
  // edges against the actual head/neck envelope rather than a straight chord.
  const throatSides=throatStarts.map(({side,centre})=>{
   // Refine the last side span at the neck bevel: the .06 backing needs
   // clearance as well as the visible outer leather face.
   const anchor=headPoint(centre),rows=[],target=[side*.75,28.05+b,16.2],
    samples=[...Array.from({length:12},(_,i)=>i/12),11.25/12,11.5/12,11.75/12,1];
   for(const t of samples){
    // Ease a little clearance into the throat, away from the fixed buckle.
    // The head/neck envelope has a sharp join even between close samples.
    const c=mix(anchor,target,t),clearance=.15+.13*Math.min(1,t*4),
     a=outside(add(c,[0,0,-.19]),side,clearance),d=outside(add(c,[0,0,.19]),side,clearance);
    rows.push([a,d,[side,0,0]]);
   }
   // Follow the lower bevel in short strips down to the underside.
   for(let i=1;i<=4;i++){
    const t=i/4,c=mix(target,[side*.75,27.62+b,16.2],t);
    rows.push([outside(add(c,[0,0,-.19]),side,.28),outside(add(c,[0,0,.19]),side,.28),unit([side*(1-t),-t,0])]);
   }
   return rows;
  });
  strap([...throatSides[0],[[0,27.62+b,16.01],[0,27.62+b,16.39],[0,-1,0]],...throatSides[1].reverse()]);
  // Body and live leg sockets use the SAME shoulder/haunch articulation.
  // Head/bridle stay attached, then reins are routed against the posed skin.
  // Saddle follows the central pitch; rider and gear balance at the hip pivot.
  if(p.motion!=='idle'||p.jump){
   for(const q of f){q.v=q.v.map(q.tag==='barrel'||q.tag==='neck'?fleshPoint:bodyPoint);q.n=unit(cross(sub(q.v[1],q.v[0]),sub(q.v[2],q.v[0])));}
   p.bits=p.bits.map(v=>mul(p.bodyPoint(mul(v,1/s)),s));surfaces=surfaceEnvelope();
  }
  const duckPoint=horseDuckPoint(p,1);
  if(duckPoint){
   for(const q of f)if(duckHorsePart(q))bendHorseFace(q,q,duckPoint);
   p.bits=p.bits.map(v=>mul(duckPoint(mul(v,1/s)),s));surfaces=surfaceEnvelope();
  }
  if(contacts)contacts.surfaces=surfaces;
  if(withReins){
   const reinColours=['#b38b55','#8d683c','#664823'];
   for(const limb of p.armChains){
    if(limb.side===-1&&p.sword?.renderWeapon||limb.side===1&&p.shield?.renderShield)continue;
    const reinStart=f.length;
    const hand=mul(limb.end,1/s),bit=mul(p.bits[limb.side<0?0:1],1/s),
     approach=outside(add(bit,[limb.side*.32,.08,-.12]),limb.side);let last=hand;
    // Short chords follow the cheek/neck corners without cutting through a
    // convex panel between valid endpoints. The final link enters the bit
    // from outside the cheek, never from the throat through the jaw.
    for(let j=1;j<=32;j++){
     const t=j/32,next=add(hand,mul(sub(approach,hand),t));next[1]-=.35*Math.sin(Math.PI*t);
     outside(next,limb.side);
     rod(f,last,next,.18,reinColours,'rein');last=next;
    }
    rod(f,last,bit,.18,reinColours,'rein');
    for(let i=reinStart;i<f.length;i++)f[i].reinSide=limb.side;
   }
  }
  }
  f.push(...tailMesh(p));
  for(const world of p.legs){const l=localLeg(world,s),rest=bindLegs.find(v=>v.front===l.front&&v.side===l.side),skinStart=f.length;
   const socket=sockets.get(`${l.front}:${l.side}`);
   socket.pose=l;socket.moving=p.motion!=='idle';
   // Ten-edge correspondence is selected in the bind pose, never per-frame.
   // Mirrored openings start at different angular edges: HL4 HR5 FL5 FR4.
   legSkin(f,skinSections(l,p.motion!=='idle'),3,socket,skinSections(rest),l.front?(l.side>0?4:5):(l.side>0?5:4));
   for(let i=skinStart;i<f.length;i++)f[i].limbId=(l.front?'F':'H')+(l.side<0?'L':'R');
   // Chamfered, sloped dark hoof below cream fetlock hair, not a white boot.
   const start=f.length,hoof=['#746b55','#514936','#342f26'],rings=[];
   for(const [y,w,back,front]of [[-1.08,1.5,-1.0,2.0],[-.78,1.53,-1.02,2.0],[.1,1.15,-.75,1.35]])rings.push([[-w*.65,y,back],[-w,y,back+.4],[-w,y,front-.45],[-w*.62,y,front],[w*.62,y,front],[w,y,front-.45],[w,y,back+.4],[w*.65,y,back]].map(v=>add(l.end,v)));
   face(f,[...rings[0]].reverse(),hoof,'leg');for(let r=1;r<rings.length;r++)for(let j=0;j<8;j++)face(f,[rings[r-1][j],rings[r-1][(j+1)%8],rings[r][(j+1)%8],rings[r][j]],hoof,'leg');face(f,rings.at(-1),hoof,'leg');
   for(let i=start;i<f.length;i++){
    f[i].v=f[i].v.map(v=>{const y=v[1]-l.end[1],z=v[2]-l.end[2];return [v[0],l.end[1]+y*Math.cos(l.pitch)-z*Math.sin(l.pitch),l.end[2]+y*Math.sin(l.pitch)+z*Math.cos(l.pitch)];});
    f[i].n=unit(cross(sub(f[i].v[1],f[i].v[0]),sub(f[i].v[2],f[i].v[0])));
   }
  }
  // Cloth is fitted after the complete posed skin exists, in the same
  // unscaled horse coordinates. It can then clear the moving limbs as well
  // as the barrel instead of intersecting a later-built shoulder surface.
  if(!entryShell)KRMountedHorseSaddle.add(f,p,{face,box,rod,loft,add,mul,leather,blue,steel,gold,bellyPoint:v=>bellyPoint(p,v)});
  for(const q of f)q.v=q.v.map(v=>mul(v,s));return f;
 }
 // One active gait, bounded at 96 samples (~12 MiB). These are live mesh
 // positions, not a bitmap/pose atlas: the rider, sword and depth passes stay
 // live. Sampling and expensive skin/tack contact fitting happen only when
 // the gait changes. A small lane-relative yaw reuses the same world-space
 // vertices; projection belongs to the GPU, not to the pose cache.
 const rearSamples=96,rearCycles={idle:2.4,walk:1.2,trot:.84,gallop:.6};
 let rearCache=null,rearBuild=null,rearEpoch=0,jumpCache=null,jumpBuild=null;
 const stationaryHorseCache=new Map();
 let stationaryShell=null;
 function stationaryHorse(p,withReins){
  const s=p.horseScale;
  if(!stationaryShell){
   const contacts={},faces=horse(p,false,null,contacts);
   faces.renderRevision=0;stationaryShell={faces,bits:p.bits.map(v=>v.slice()),index:contacts.surfaces,reinAt:faces.findIndex(f=>f.tag==='tail')};
  }
  if(!withReins)return stationaryShell.faces;
  const arms=p.armChains.filter(a=>!(a.side===-1&&p.sword?.renderWeapon||a.side===1&&p.shield?.renderShield)),
   key=JSON.stringify(arms.map(a=>[a.side,...a.end]));
  if(stationaryHorseCache.has(key))return stationaryHorseCache.get(key);
  const rein=[],outside=(point,side)=>{const y=point[1],z=point[2];let extent=-Infinity;
   for(const q of surfaceCandidates(stationaryShell.index,y,z)){if(y<q.y0||y>q.y1||z<q.z0||z>q.z1)continue;
    const a=q.v[0];for(let j=1;j<q.v.length-1;j++){const c=q.v[j],d=q.v[j+1],dy=c[1]-a[1],dz=c[2]-a[2],ey=d[1]-a[1],ez=d[2]-a[2],det=dy*ez-dz*ey;if(Math.abs(det)<1e-8)continue;
     const u=((y-a[1])*ez-(z-a[2])*ey)/det,v=(dy*(z-a[2])-dz*(y-a[1]))/det;if(u>=-1e-6&&v>=-1e-6&&u+v<=1.000001)extent=Math.max(extent,side*(a[0]+u*(c[0]-a[0])+v*(d[0]-a[0])));
    }
   }if(Number.isFinite(extent))point[0]=side*Math.max(side*point[0],extent+.36);return point;
  };
  for(const limb of arms){const start=rein.length,hand=mul(limb.end,1/s),bit=mul(stationaryShell.bits[limb.side<0?0:1],1/s),approach=outside(add(bit,[limb.side*.32,.08,-.12]),limb.side),colours=['#b38b55','#8d683c','#664823'];let last=hand;
   for(let j=1;j<=32;j++){const t=j/32,next=add(hand,mul(sub(approach,hand),t));next[1]-=.35*Math.sin(Math.PI*t);outside(next,limb.side);rod(rein,last,next,.18,colours,'rein');last=next;}
   rod(rein,last,bit,.18,colours,'rein');for(let j=start;j<rein.length;j++){rein[j].reinSide=limb.side;rein[j].v=rein[j].v.map(v=>mul(v,s));}
  }
  const faces=stationaryShell.faces.slice();faces.splice(stationaryShell.reinAt,0,...rein);faces.renderRevision=0;
  if(stationaryHorseCache.size>=4)stationaryHorseCache.delete(stationaryHorseCache.keys().next().value);stationaryHorseCache.set(key,faces);return faces;
 }
 const isRear=angle=>Math.abs(((angle%360)+360)%360-180)<=10;
 // This renderer also runs in the Lab's hidden iframe. Chained timers there
 // can be throttled to one second each: 32 yields then exceed the 15s ACK
 // deadline. A posted task still lets input/messages run between batches,
 // without making mesh preparation depend on background timer cadence.
 const yieldPreparation=()=>new Promise(resolve=>{
  const channel=new MessageChannel();
  channel.port1.onmessage=()=>{channel.port1.close();channel.port2.close();resolve();};
  channel.port2.postMessage(null);
 });
 async function prepareState(state){
  if(state.motion==='gallop'&&state.action==='jump'){
   await prepareState({...state,action:'none'});await prepareRearJump();return;
  }
  if(rearCache?.motion===state.motion)return;
  if(rearBuild){await rearBuild;return prepareState(state);}
  const epoch=rearEpoch,motion=state.motion,cycle=rearCycles[motion];
  rearCache=null;
  rearBuild=(async()=>{let cache;
   for(let i=0;i<rearSamples;i++){
    if(epoch!==rearEpoch)return;
    const p=R.sample({angle:180,time:i*cycle/rearSamples,motion}),faces=horse(p,true);
    if(!cache){const coordinates=faces.reduce((n,f)=>n+f.v.length*3,0);cache={motion,cycle,faces,positions:new Float32Array(rearSamples*coordinates),colours:new Uint8Array(rearSamples*faces.length),palette:[],coordinates,bits:new Float32Array(rearSamples*6),lastTime:NaN};
     cache.noReins=faces.filter(f=>f.tag!=='rein');cache.leftRein=faces.filter(f=>f.reinSide!==-1);cache.rightRein=faces.filter(f=>f.reinSide!==1);
    }
    if(faces.length!==cache.faces.length||faces.some((f,j)=>f.v.length!==cache.faces[j].v.length||f.tag!==cache.faces[j].tag))throw Error('Arka at önbelleği topolojisi değişti.');
    let k=i*cache.coordinates;for(let j=0;j<faces.length;j++){const f=faces[j];for(const v of f.v){cache.positions[k++]=v[0];cache.positions[k++]=v[1];cache.positions[k++]=v[2];}
     let colour=cache.palette.indexOf(f.col);if(colour<0){colour=cache.palette.length;cache.palette.push(f.col);}if(colour>255)throw Error('Arka at paleti sınırı aşıldı.');cache.colours[i*faces.length+j]=colour;
    }
    cache.bits.set(p.bits.flat(),i*6);
    if(i%3===2)await yieldPreparation();
   }
   if(epoch===rearEpoch)rearCache=cache;
  })();
  try{await rearBuild;}finally{rearBuild=null;}
 }
 // A bounded second cache covers only the authored jump interval. Quantized
 // live vertex positions use half the RAM of Float32; one code step is under
 // .027 pixels even at the enlarged Lab scale. No raster frames are baked.
 const jumpSamples=193,jumpQuant=65535/256;
 async function prepareRearJump(){
  if(jumpCache||!window.KRMountedJump)return;if(jumpBuild)return jumpBuild;
  const epoch=rearEpoch,start=KRMountedJump.timing.lead,end=KRMountedJump.timing.settle;
  jumpBuild=(async()=>{let cache;
   for(let i=0;i<jumpSamples;i++){
    if(epoch!==rearEpoch)return;
    const state={angle:180,motion:'gallop',action:'jump',time:start+(end-start)*i/(jumpSamples-1)},faces=horse(samplePose(state),true);
    if(!cache){const coordinates=faces.reduce((n,f)=>n+f.v.length*3,0);cache={start,end,faces,coordinates,positions:new Uint16Array(jumpSamples*coordinates),colours:new Uint8Array(jumpSamples*faces.length),palette:[],lastTime:NaN};cache.noReins=faces.filter(f=>f.tag!=='rein');}
    if(faces.length!==cache.faces.length||faces.some((f,j)=>f.v.length!==cache.faces[j].v.length||f.tag!==cache.faces[j].tag))throw Error('Zıplama önbelleği topolojisi değişti.');
    let k=i*cache.coordinates;for(let j=0;j<faces.length;j++){const f=faces[j];for(const v of f.v)for(const n of v){if(n< -128||n>128||!Number.isFinite(n))throw Error('Zıplama önbelleği koordinat sınırı.');cache.positions[k++]=Math.round((n+128)*jumpQuant);}
     let colour=cache.palette.indexOf(f.col);if(colour<0){colour=cache.palette.length;cache.palette.push(f.col);}if(colour>255)throw Error('Zıplama paleti sınırı.');cache.colours[i*faces.length+j]=colour;
    }
    if(i%3===2)await yieldPreparation();
   }if(epoch===rearEpoch)jumpCache=cache;
  })();try{await jumpBuild;}finally{jumpBuild=null;}
 }
 function entryHorse(p,withReins){
  const {source,target,weight:w}=p.entryBlend,s=p.horseScale,
   selected=f=>!['barrel','leg','tail'].includes(f.tag)&&(withReins||f.tag!=='rein'),
   // Copy only these cached surfaces: a recovery source can share jumpCache.
   order=(a,b)=>a.tag.localeCompare(b.tag),
   cachePose=q=>q.duck?.amount<1e-8?{...q,duck:null}:q;
  // Lateral steps reuse one unchanged head/tack pose. Do not copy, sort and
  // interpolate that same mesh twice merely to produce a zero-weight blend.
  if(source===target){const shell=rearHorse(cachePose(source),withReins).filter(selected).sort(order).map(f=>({...f,v:f.v.map(v=>[v[0]/s,v[1]/s,v[2]/s])}));return horse(p,withReins,shell);}
  const
   a=rearHorse(cachePose(source),withReins).filter(selected).sort(order).map(f=>({...f,v:f.v.map(v=>v.slice())})),
   b=rearHorse(cachePose(target),withReins).filter(selected).sort(order);
  if(a.length!==b.length||a.some((f,i)=>f.tag!==b[i].tag||f.v.length!==b[i].v.length))return horse(p,withReins);
  for(let i=0;i<a.length;i++){const f=a[i];f.v=f.v.map((v,j)=>v.map((n,k)=>(n+(b[i].v[j][k]-n)*w)/s));f.n=unit(cross(sub(f.v[1],f.v[0]),sub(f.v[2],f.v[0])));if(w>=.5)f.col=b[i].col;}
  // Body, every articulated leg and tail use the exact IK pose. Fitted tack
  // and head/bridle surfaces interpolate their two already-fitted envelopes
  // only for this short entry; do not rebuild contact meshes on every frame.
  return horse(p,withReins,a);
 }
 function rearJump(p,withReins){const cache=jumpCache;if(p.entryBlend&&cache&&rearCache?.motion==='gallop')return entryHorse(p,withReins);if(!cache||p.jump.blending)return horse(p,withReins);
  const phase=Math.max(0,Math.min(jumpSamples-1,(p.jump.time-cache.start)/(cache.end-cache.start)*(jumpSamples-1))),i=Math.min(jumpSamples-2,Math.floor(phase)),j=i+1,t=phase-i;
  if(cache.lastTime!==phase){let a=i*cache.coordinates,b=j*cache.coordinates;
   for(let fi=0;fi<cache.faces.length;fi++){const f=cache.faces[fi];for(const v of f.v)for(let q=0;q<3;q++){v[q]=(cache.positions[a]+(cache.positions[b]-cache.positions[a])*t)/jumpQuant-128;a++;b++;}
    const [v,u,w]=f.v,ux=u[0]-v[0],uy=u[1]-v[1],uz=u[2]-v[2],vx=w[0]-v[0],vy=w[1]-v[1],vz=w[2]-v[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,n=Math.hypot(nx,ny,nz)||1;
    f.n[0]=nx/n;f.n[1]=ny/n;f.n[2]=nz/n;f.col=cache.palette[cache.colours[(t<.5?i:j)*cache.faces.length+fi]];
   }cache.lastTime=phase;
  }return withReins?cache.faces:cache.noReins;
 }
 function rearHorse(p,withReins){
  if(p.laneBase){const source=p.laneBase;return entryHorse({...p,entryBlend:{source,target:source,weight:0}},withReins);}
  if(p.lungeBlend&&rearCache?.motion==='gallop'){
   // Reuse the running entry's already-fitted tack/head surfaces. The body
   // and legs still use this frame's exact fixed-bone lunge pose.
   return entryHorse({...p,entryBlend:p.lungeBlend},withReins).filter(f=>
    !(f.reinSide===1&&p.shield?.renderShield||f.reinSide===-1&&p.sword?.renderWeapon));
  }
  // Combat holds the horse's idle clock at zero while the upper actor moves.
  // Reuse its exact fitted live mesh at every facing angle. Reins are part of
  // the key, so a changed grip never borrows another action's hand contact.
  if(p.motion==='idle'&&p.time===0&&!p.jump&&!p.duck&&!p.steering){
   return stationaryHorse(p,withReins);
  }
  const cache=rearCache;if(p.jump)return rearJump(p,withReins);if(cache?.motion!==p.motion)return horse(p,withReins);
  const phase=((p.time%cache.cycle)+cache.cycle)%cache.cycle/cache.cycle*rearSamples,i=Math.floor(phase),j=(i+1)%rearSamples,t=phase-i;
  if(cache.lastTime!==phase){let a=i*cache.coordinates,b=j*cache.coordinates;
   for(let fi=0;fi<cache.faces.length;fi++){const f=cache.faces[fi];for(const v of f.v)for(let q=0;q<3;q++){v[q]=cache.positions[a]+(cache.positions[b]-cache.positions[a])*t;a++;b++;}
    const [v,u,w]=f.v,ux=u[0]-v[0],uy=u[1]-v[1],uz=u[2]-v[2],vx=w[0]-v[0],vy=w[1]-v[1],vz=w[2]-v[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,n=Math.hypot(nx,ny,nz)||1;
    f.n[0]=nx/n;f.n[1]=ny/n;f.n[2]=nz/n;f.col=cache.palette[cache.colours[(t<.5?i:j)*cache.faces.length+fi]];
   }cache.lastTime=phase;
   for(const faces of [cache.faces,cache.noReins,cache.leftRein,cache.rightRein])faces.renderRevision=(faces.renderRevision||0)+1;
  }
  let shell=cache.faces,noReins=cache.noReins;
  const duckPoint=horseDuckPoint(p);
  if(duckPoint){
   // Keep the base interpolation untouched. Re-scrubbing a fixed gait time
   // through different duck amounts must never accumulate deformation.
   if(!cache.duckFaces){cache.duckFaces=cache.faces.map(f=>duckHorsePart(f)?{...f}:f);cache.duckNoReins=cache.duckFaces.filter(f=>f.tag!=='rein');}
   for(let fi=0;fi<cache.faces.length;fi++)if(duckHorsePart(cache.faces[fi]))bendHorseFace(cache.duckFaces[fi],cache.faces[fi],duckPoint);
   shell=cache.duckFaces;noReins=cache.duckNoReins;
  }
  if(!withReins)return noReins;
  if(p.sword?.renderWeapon)return cache.leftRein;
  if(p.shield?.renderShield)return cache.rightRein;
  if(!p.duck&&(!p.sword||p.sword.phase.reach*(1-p.sword.phase.settle)<1e-12))return cache.faces;
  // Sword reach moves one grip; duck slides both grips forward. Route only
  // these live reins against the reused shell, not a rebuilt horse mesh.
  const result=(p.duck?noReins:cache.leftRein).slice(),surfaces=[];
  for(const f of shell)if(f.tag==='neck'||f.tag==='head'||f.tag==='mane'){let y0=Infinity,y1=-Infinity,z0=Infinity,z1=-Infinity;for(const v of f.v){y0=Math.min(y0,v[1]);y1=Math.max(y1,v[1]);z0=Math.min(z0,v[2]);z1=Math.max(z1,v[2]);}surfaces.push({v:f.v,y0,y1,z0,z1});}
  const index=indexSurfaces(surfaces),s=p.horseScale;
  for(const side of p.duck?[-1,1]:[-1]){const outside=point=>{const y=point[1],z=point[2];let extent=-Infinity;
   for(const q of surfaceCandidates(index,y,z)){if(y<q.y0||y>q.y1||z<q.z0||z>q.z1)continue;const a=q.v[0];for(let k=1;k<q.v.length-1;k++){const c=q.v[k],d=q.v[k+1],dy=c[1]-a[1],dz=c[2]-a[2],ey=d[1]-a[1],ez=d[2]-a[2],det=dy*ez-dz*ey;if(Math.abs(det)<1e-8)continue;
    const u=((y-a[1])*ez-(z-a[2])*ey)/det,v=(dy*(z-a[2])-dz*(y-a[1]))/det;if(u>=-1e-6&&v>=-1e-6&&u+v<=1.000001)extent=Math.max(extent,side*(a[0]+u*(c[0]-a[0])+v*(d[0]-a[0])));}}
   if(Number.isFinite(extent))point[0]=side*Math.max(side*point[0],extent+.36*s);return point;},
   hand=p.armChains.find(l=>l.side===side).end,baseBit=[0,1,2].map(q=>{const n=q+(side===1?3:0);return cache.bits[i*6+n]+(cache.bits[j*6+n]-cache.bits[i*6+n])*t;}),bit=duckPoint?duckPoint(baseBit):baseBit,approach=outside(add(bit,[side*.32*s,.08*s,-.12*s])),colours=['#b38b55','#8d683c','#664823'],reinStart=result.length;let last=hand;
  for(let k=1;k<=32;k++){const t=k/32,next=add(hand,mul(sub(approach,hand),t));next[1]-=.35*s*Math.sin(Math.PI*t);outside(next);rod(result,last,next,.18*s,colours,'rein');last=next;}rod(result,last,bit,.18*s,colours,'rein');for(let k=reinStart;k<result.length;k++)result[k].reinSide=side;}
  return result;
 }
 function samplePose(state){let p=state.action==='jump'?KRMountedJump.sample(state):R.sample(state);
  if(state.lungeStride&&window.KRMountedJumpEntry)p=KRMountedJumpEntry.motion(state,state.lungeStride);
  if(state.action==='jump'&&state.entryState&&window.KRMountedJumpEntry)p=KRMountedJumpEntry.apply(p,state);
  if(state.laneStep&&window.KRMountedJumpEntry)KRMountedJumpEntry.sidestep(p,state);
  if(state.action==='sword')KRMountedSword.apply(p,state);
  if(state.action==='bow'&&window.KRMountedBow)KRMountedBow.apply(p,state);
  if((state.action==='bash'||state.action==='parry')&&window.KRMountedShield)KRMountedShield.apply(p,state);
  if(state.action==='duck')KRMountedDuck.apply(p,state);
  if(state.riderSteer&&window.KRMountedSteering)KRMountedSteering.apply(p,state);
  return p;
 }
 function steeringFaces(p,withReins){
  if(p.bow){const arms=p.armChains;try{p.armChains=p.bow.reinArms;return rearHorse(p,withReins);}finally{p.armChains=arms;}}
  if(!p.steering)return rearHorse(p,withReins);
  const arms=p.armChains;let faces;
  try{p.armChains=p.steering.baseArms;faces=rearHorse(p,withReins);}finally{p.armChains=arms;}
  if(!withReins)return faces;
  const totals=new Map(),seen=new Map();for(const f of faces)if(f.tag==='rein')totals.set(f.reinSide,(totals.get(f.reinSide)||0)+1);
  return faces.map(f=>{
   if(f.tag!=='rein')return f;
   const side=f.reinSide,index=seen.get(side)||0;seen.set(side,index+1);
   const before=p.steering.baseArms.find(l=>l.side===side),after=arms.find(l=>l.side===side);
   if(!before||!after)return f;
   const delta=sub(after.end,before.end),rods=totals.get(side)/6,rodIndex=Math.floor(index/6),faceIndex=index%6,
    // Rod caps/sides retain exact shared endpoints. Fade the grip shift to
    // zero at the unchanged bit; do not detach reins or rebuild horse skin.
    endpoints=[[0,0,0,0],[1,1,1,1],[0,0,1,1],[0,0,1,1],[0,0,1,1],[0,0,1,1]],
    v=f.v.map((v,i)=>add(v,mul(delta,(1-(rodIndex+endpoints[faceIndex][i])/rods)**2)));
   return {...f,v,n:unit(cross(sub(v[1],v[0]),sub(v[2],v[0])))};
  });
 }
 function draw(ctx,state,transitionPass=null,placement=null,preparedPose=null){if(!gpu)throw Error('GPU hazırlanmadı');const p=preparedPose||samplePose(state),visible=state.visible,unit=placement?.unit??6.65*state.zoom,cx=placement?.x??240-p.project([0,0,4*p.horseScale])[0]*unit,cy=placement?.y??495;
  if(placement&&state.worldViewport&&!state.localViewport){
   // Native-resolution actor-sized surfaces, not one full-screen GL surface
   // per layer. Quantized bounds remain stable through pickup/hold/recovery.
   const m=ctx.getTransform(),corners=[[-42,-92],[42,-92],[-42,16],[42,16]].map(([dx,dy])=>m.transformPoint({x:cx+dx*unit,y:cy+dy*unit})),
    left=Math.floor(Math.min(...corners.map(v=>v.x)))-2,top=Math.floor(Math.min(...corners.map(v=>v.y)))-2,
    width=Math.ceil((Math.max(...corners.map(v=>v.x))-left+2)/64)*64,height=Math.ceil((Math.max(...corners.map(v=>v.y))-top+2)/64)*64;
   actorViewport??=document.createElement('canvas');if(actorViewport.width!==width||actorViewport.height!==height){actorViewport.width=width;actorViewport.height=height;}
   const local=actorViewport.getContext('2d');local.setTransform(1,0,0,1,0,0);local.clearRect(0,0,width,height);local.setTransform(m.a,m.b,m.c,m.d,m.e-left,m.f-top);
   draw(local,{...state,localViewport:true},transitionPass,placement,p);
   ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(actorViewport,left,top);ctx.restore();return;
  }
  if(p.sword?.renderWeapon||p.shield?.renderShield||p.bow?.renderBow){
   const rawWeight=p.bow?p.bow.weight:p.shield?p.shield.weight:p.sword.phase.reach*(1-p.sword.phase.settle),weight=rawWeight<1e-12?0:rawWeight>1-1e-12?1:rawWeight;
   // Both passes use exactly the same posed arm and rigid sheathed weapon.
   // Ease only their different depth/compositing ownership while the hand
   // reaches/releases; ownership is fully transferred BEFORE extraction.
   if(transitionPass===null&&weight<1){
    if(placement&&weight>0){
     // The Lab's opaque background cannot be used in a placed world draw.
     // Blend premultiplied transparent actors, then composite once: ordinary
     // source-over crossfading would leave a translucent double silhouette.
     transitionCanvas??=document.createElement('canvas');transitionAttachedCanvas??=document.createElement('canvas');
     const transform=ctx.getTransform(),corners=[[-38,-70],[38,-70],[-38,10],[38,10]].map(([dx,dy])=>transform.transformPoint({x:placement.x+dx*unit,y:placement.y+dy*unit})),
      left=state.localViewport?0:Math.max(0,Math.floor(Math.min(...corners.map(p=>p.x)))-2),top=state.localViewport?0:Math.max(0,Math.floor(Math.min(...corners.map(p=>p.y)))-2),
      width=state.localViewport?ctx.canvas.width:Math.max(1,Math.min(ctx.canvas.width,Math.ceil(Math.max(...corners.map(p=>p.x)))+2)-left),height=state.localViewport?ctx.canvas.height:Math.max(1,Math.min(ctx.canvas.height,Math.ceil(Math.max(...corners.map(p=>p.y)))+2)-top);
     // Only the actor bounds need two transparent buffers, not two complete
     // phone/desktop framebuffers. The caller's transform/clip stays intact.
     for(const [canvas,pass]of [[transitionAttachedCanvas,'attached'],[transitionCanvas,'detached']]){
      if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
      const c=canvas.getContext('2d');c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.clearRect(0,0,canvas.width,canvas.height);c.setTransform(transform.a,transform.b,transform.c,transform.d,transform.e-left,transform.f-top);draw(c,state,pass,placement);
     }
     const c=transitionAttachedCanvas.getContext('2d');c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='destination-in';c.globalAlpha=1-weight;c.fillStyle='#fff';c.fillRect(0,0,c.canvas.width,c.canvas.height);c.globalCompositeOperation='lighter';c.globalAlpha=weight;c.drawImage(transitionCanvas,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';
     ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(transitionAttachedCanvas,left,top);ctx.restore();return;
    }
    draw(ctx,state,'attached',placement);
    if(weight>0){transitionCanvas??=document.createElement('canvas');
     if(transitionCanvas.width!==ctx.canvas.width||transitionCanvas.height!==ctx.canvas.height){transitionCanvas.width=ctx.canvas.width;transitionCanvas.height=ctx.canvas.height;}
     draw(transitionCanvas.getContext('2d'),state,'detached');
     ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=weight;ctx.drawImage(transitionCanvas,0,0);ctx.restore();
    }return;
   }
   if(transitionPass==='attached'){if(p.sword)p.sword.renderWeapon=false;if(p.shield)p.shield.renderShield=false;if(p.bow)p.bow.renderBow=false;}
  }
  if(p.sword?.renderWeapon&&!actionGearGpu)actionGearGpu=KRGearGPU.create({...gearMeshes,sword:p.sword.model.sheath},undefined,{depthShear:gearDepthShear});
  if(p.shield?.renderShield&&!shieldGearGpu)shieldGearGpu=KRGearGPU.create({...gearMeshes,shield:[]},undefined,{depthShear:gearDepthShear});
  if(p.bow?.renderBow&&!bowGearGpu)bowGearGpu=KRGearGPU.create({...gearMeshes,bow:[],quiver:p.bow.model.quiver},undefined,{depthShear:gearDepthShear});
  if((p.sword?.renderWeapon||p.shield?.renderShield||p.bow?.renderBow)&&!actionGpu)actionGpu=KRMountedActionGPU.create();
  const upperPose=p.steering?.upperPose||p.duck||p.shield?.upperPose;
  if(upperPose&&!duckGpu)duckGpu=KRGearGPU.create(gearMeshes,undefined,{depthShear:gearDepthShear,duckPose:true});
  const actorGpu=upperPose?duckGpu:p.sword?.renderWeapon?actionGearGpu:p.shield?.renderShield?shieldGearGpu:p.bow?.renderBow?bowGearGpu:gpu;
  if(!placement){ctx.setTransform(ctx.canvas.width/480,0,0,ctx.canvas.height/560,0,0);ctx.fillStyle='#1c232c';ctx.fillRect(0,0,480,560);
   ctx.save();ctx.translate(cx,cy);ctx.scale(unit,unit);ctx.fillStyle='#111820';ctx.globalAlpha=p.jump?1-.035*p.jump.height:1;const shadow=p.jump?1-.012*p.jump.height:1;ctx.beginPath();ctx.ellipse(0,0,(10+9*Math.abs(Math.sin(p.angle*Math.PI/180)))*p.horseScale*shadow,3.2*shadow,0,0,Math.PI*2);ctx.fill();ctx.restore();}
  const faces=steeringFaces(p,visible.knight);
  if(visible.horse)horseGpu.draw(ctx,faces,p.angle,unit,cx,cy,false,visible,false,!!state.worldViewport);
  actorGpu.paint(ctx,()=>{g.save();g.translate(cx,cy);g.scale(unit,unit);
   if(visible.knight){
    const parts={...visible,shield:visible.shield&&!p.shield?.renderShield,bow:visible.bow&&!p.bow?.renderBow};
    const harness=upperPose?(deg,dir)=>{const b=p.native.body,k=-(b.shoulderX||0)/8.9,h=(-12-b.shoulderY)/8.9;g.save();g.translate(0,-12*U);g.transform(1,0,k,h,0,0);g.translate(0,12*U);KRJonathanWalk.harness(deg,dir,{sy:-20.9,hip:-12});g.restore();}:KRJonathanWalk.harness;
    const native={...p.native,equipment:(deg,dir,head)=>actorGpu.draw(g,deg,dir,parts,U,head,upperPose),harness,armOccluders:()=>upperPose?[]:mountedShieldMask(p.angle,parts)};
    KRJonathanWalk.withEquipmentParts(parts,()=>{
     const drawNative=()=>KRJonathan.turnDrawing(p.origin[0],p.origin[1],1/U,native);
     if(p.sword)KRMountedSword.withJointFlex(p,drawNative);else drawNative();
     const masks=p.sword?.renderWeapon||p.shield?.renderShield||p.bow?.renderBow?KRMountedSword.neckMasks(p):[];
     if(masks.length){
      // Reuse the actual native neck/equipment render inside the depth mask.
      // No copied neck art and no change to the protected shared renderer.
      // Explicit stencil union keeps overlaps filled and restores the native
      // surface once, not once for every intersecting arm-volume fragment.
      g.save();g.beginPath();for(const poly of masks){g.moveTo(...poly[0]);for(const point of poly.slice(1))g.lineTo(...point);g.closePath();}g.clipUnion();
      KRJonathan.turnDrawing(p.origin[0],p.origin[1],1/U,{...native,arms:p.actionBody.restArms});g.restore();
     }
    });
   }
   g.restore();});
  if(visible.horse&&visible.knight)horseGpu.draw(ctx,faces,p.angle,unit,cx,cy,p,visible,true,!!state.worldViewport);
  if(p.sword?.renderWeapon)actionGpu.draw(ctx,p,KRMountedSword.faces(p),faces,gearMeshes,visible,unit,cx,cy,KRMountedSword.trails(p,state));
  if(p.shield?.renderShield)actionGpu.draw(ctx,p,KRMountedShield.faces(p),faces,gearMeshes,visible,unit,cx,cy);
  if(p.bow?.renderBow)actionGpu.draw(ctx,p,KRMountedBow.faces(p),faces,gearMeshes,visible,unit,cx,cy);
 }
 async function prepare(initialState={angle:180,motion:'idle'}){if(gpu)return;if(!window.KRGearGPU)await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='assets/encounters/jonathan-gpu.js';s.onload=resolve;s.onerror=reject;document.body.append(s);});
  const meshes=KRJonathanWalk.labMeshes();gearMeshes=meshes;
  window.KRMountedSword?.prepare(meshes);
  window.KRMountedShield?.prepare(meshes);
  window.KRMountedBow?.prepare(meshes);
  // Preserve every Gear Lab attachment verbatim. The saddle's shortened rear
  // lip clears the approved quiver rather than moving equipment to fit tack.
  const points=new Map();for(const f of meshes.shield)for(const p of f.v)points.set(p.join(','),p);shieldPoints=[...points.values()];
  gpu=KRGearGPU.create(meshes,undefined,{depthShear:gearDepthShear});horseGpu=KRMountedHorseGPU.create(meshes);
  await prepareState(initialState);
 }
 window.KRMountedReview={prepare,draw,bodyPoint:(state,v)=>fleshPose(R.sample(state))(v),skinMesh:state=>horse(R.sample(state),false).filter(q=>q.tag==='barrel'||q.tag==='leg'),tail:state=>{const p=R.sample(state);return {points:tailPoints(p),rest:tailRest,faces:tailMesh(p),root:p.bodyPoint(add(tailRest[0],[0,p.bob/p.horseScale,0]))};},dispose:()=>{gpu?.dispose();horseGpu?.dispose();actionGearGpu?.dispose();shieldGearGpu?.dispose();actionGpu?.dispose();gpu=horseGpu=actionGearGpu=shieldGearGpu=actionGpu=null;gearMeshes=null;},stats:()=>({...gpu?.stats(),horse:horseGpu?.stats(),action:actionGpu?.stats()}),inspect:state=>{const p=samplePose(state);return {horse:p.legs.map(l=>({a:l.a,b:l.b,front:l.front,cannon:l.cannon,root:l.root,stifle:l.joint,hock:l.hock,stance:l.stance,foot:l.end,pitch:l.pitch,phase:l.phase,contactSpeed:l.contactSpeed})),rider:p.riderLegs.map(l=>({a:l.a,b:l.b})),arms:p.armChains.map(l=>({a:l.a,b:l.b})),seat:p.seat,jump:p.jump,shield:p.shield&&{action:p.shield.action,time:p.shield.t,held:p.shield.held,grip:p.shield.grip,reachError:p.shield.reachError},sword:p.sword&&{time:p.sword.time,held:p.sword.held,hand:p.sword.hand,target:p.sword.target,reachError:p.sword.reachError,reveal:p.sword.reveal}};}};
 window.KRMountedReview.pose=samplePose;
 window.KRMountedReview.posedMesh=state=>horse(samplePose(state),true);
 window.KRMountedReview.bodyPose=state=>fleshPose(R.sample(state));
 window.KRMountedReview.prepareState=prepareState;
 window.KRMountedReview.rearStats=()=>({motion:rearCache?.motion||null,samples:rearCache?rearSamples:0,bytes:rearCache?rearCache.positions.byteLength+rearCache.colours.byteLength+rearCache.bits.byteLength:0,building:!!rearBuild,
  jumpSamples:jumpCache?jumpSamples:0,jumpBytes:jumpCache?jumpCache.positions.byteLength+jumpCache.colours.byteLength:0,jumpBuilding:!!jumpBuild});
 const stats=window.KRMountedReview.stats;window.KRMountedReview.stats=()=>({...stats(),rear:window.KRMountedReview.rearStats()});
 const dispose=window.KRMountedReview.dispose;window.KRMountedReview.dispose=()=>{rearEpoch++;rearCache=null;jumpCache=null;stationaryShell=null;stationaryHorseCache.clear();duckGpu?.dispose();duckGpu=null;bowGearGpu?.dispose();bowGearGpu=null;actorViewport=transitionCanvas=transitionAttachedCanvas=null;dispose();};
 window.KRMountedReview.bellyPoint=(state,v)=>bellyPoint(R.sample(state),v);
 window.KRMountedReview.girthMesh=state=>horse(R.sample(state),false).filter(q=>q.tag==='girth');
 // Read-only Lab collision evidence: actual posed head/neck triangles.
 window.KRMountedReview.collisionMesh=state=>horse(R.sample(state),false).filter(q=>q.tag==='head'||q.tag==='neck');
})();
