/* Wolf-style 2D directional drawings. Model supplies JOINT landmarks only.
   No atlas, Blender render, mesh surface, crossfade or duplicate actor pass. */
(()=>{'use strict';
 const data=window.KRJonathanWalkPoses;
 // Stretch only the curious peek: move left, hold, move right, hold, return.
 // All later motion retains its original speed and relative timing.
 const peekClock=[[2.4,2.4],[2.95,2.7],[3.3,83/30],[3.95,94/30],[4.3,97/30],[4.8,3.6]];
 function sceneTime(t){
  if(t<=2.4)return t;if(t>=5.5)return t-1.9;
  if(t>=4.8)return 3.6; // Planted pause for the shoulder shrug.
  for(let i=1;i<peekClock.length;i++){
   const [a,x]=peekClock[i-1],[b,y]=peekClock[i];
   if(t<=b)return x+(y-x)*(t-a)/(b-a);
  }
 }
 function playbackTime(t){
  if(t<=2.4)return t;if(t>=3.6)return t+1.9;
  for(let i=1;i<peekClock.length;i++){
   const [a,x]=peekClock[i-1],[b,y]=peekClock[i];
   if(t<=y)return a+(b-a)*(t-x)/(y-x);
  }
 }
 function lerpPose(a,b,u){
  const out={};for(const k of Object.keys(a))out[k]=Array.isArray(a[k])?a[k].map((v,i)=>lerpPose(v,b[k][i],u)):a[k]+(b[k]-a[k])*u;
  return out;
 }
 function pose(t,playback){
  const n=Math.max(0,Math.min(data.frames.length-1,t*data.fps)),i=Math.floor(n),
   p=lerpPose(data.frames[i],data.frames[Math.min(i+1,data.frames.length-1)],n-i);
  // Relax the source rig's bent resting elbows without stretching either bone.
  // Side views keep a slight forward forearm bend, not a locked straight arm.
  const vSide=view(p),sideWeight=Math.sin(vSide.degrees*Math.PI/180)**2;
  p.arms=p.arms.map((a,j)=>{
   const ua=Math.atan2(a.ey-a.sy,a.ex-a.sx),la=Math.atan2(a.hy-a.ey,a.hx-a.ex),
    bend=Math.atan2(Math.sin(la-ua),Math.cos(la-ua)),mid=ua+bend*.5,
    restUpper=mid-bend*.14,restLower=mid+bend*.14,
    // Keep the native arm bones fixed; projected source distances shortened
    // both segments at profile and made them grow again during the turn.
    ul=5,ll=5.1,
    // Exported from the foot's actual transfer/contact phase, not a second sine.
    // Left foot landing = right arm forward; hold through double support.
    swing=p.armDrive*(j?-1:1)*.23*vSide.direction,
    u=restUpper+(Math.PI/2+vSide.direction*.035+swing-restUpper)*sideWeight,
    l=restLower+(Math.PI/2-vSide.direction*.085+swing*.94-restLower)*sideWeight,
    ex=a.sx+ul*Math.cos(u),ey=a.sy+ul*Math.sin(u);
   return {...a,ex,ey,hx:ex+ll*Math.cos(l),hy:ey+ll*Math.sin(l)};
  });
  const ramp=(a,b)=>smoothStep(clamp((t-a)/(b-a),0,1)),
   walkWeight=t<2.4?ramp(0,.2)*(1-ramp(2.2,2.4)):ramp(3.6,3.85)*(1-ramp(6.3,6.55)),
   upperMotion=KRJonathan.walkUpper(p.arms,p.heading,p.armDrive,walkWeight);
  p.arms=upperMotion.arms;p.lean=(p.lean||0)*(1-.65*walkWeight);
  // Settle into the actual first pull pose, rather than exchanging rigs at 6.8s.
  if(t>6.55&&window.KRSwordEvent){
   const q=KRSwordEvent.brokenPose(6.8),v=Math.min(1,(t-6.55)/.25),u=v*v*(3-2*v),hip=-12+q.body.y;
   p.drop+=(q.body.y-p.drop)*u;
   p.legs=p.legs.map((l,j)=>lerpPose(l,{...q.legs[j],bootAngle:0},u));
   p.arms=p.arms.map((a,j)=>{
    const b=q.arms[j],angle=(a,b,u)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*u,
     upper=angle(Math.atan2(a.ey-a.sy,a.ex-a.sx),Math.atan2(b.ey-b.sy,b.ex-b.sx),u),
     lower=angle(Math.atan2(a.hy-a.ey,a.hx-a.ex),Math.atan2(b.hy-b.ey,b.hx-b.ex),u),
     sx=a.sx+(b.sx-a.sx)*u,sy=a.sy+(b.sy+hip-a.sy)*u,
     ex=sx+5*Math.cos(upper),ey=sy+5*Math.sin(upper);
    return {sx,sy,ex,ey,hx:ex+5.1*Math.cos(lower),hy:ey+5.1*Math.sin(lower)};
   });
  }
  // A brief, small shoulder shrug after peeking. Move each entire arm chain
  // with its cap; do not bend the elbows or detach the hands from the wrists.
  const ease=(a,b)=>smoothStep(clamp((playback-a)/(b-a),0,1)),
   shrug=Number.isFinite(playback)?ease(4.84,5.03)*(1-ease(5.22,5.48)):0;
  if(shrug)for(const a of p.arms){a.sy-=.8*shrug;a.ey-=.8*shrug;a.hy-=.8*shrug;}
  p.shrug=shrug;
  return p;
 }
 // Fixed attachments, measured from the level side reference. These are native
 // 2D prop contours plus a narrow edge, not exported mesh surfaces or sprites.
 const shieldBend=1.3;
 // A .45-unit rear clearance keeps the trailing hand outside the pouch.
 // Move the rack together so the close sword/bow/quiver gaps stay unchanged.
 const gearParts={quiver:{depth:2.9,edge:1.15,slope:0,col:'#714122'},
  bow:{depth:4.49,edge:.45,slope:.13,col:'#83512b'},
  sword:{depth:3.69,edge:.95,slope:.13,col:'#1c426f'},
  shield:{depth:4.85,edge:.46,slope:.13,col:'#798b9e'}};
 // Reference IMG_1913: sword sits inside the bow's diagonal silhouette.
 // Reflect the bow about its longitudinal axis, not across the whole back.
 // All decorative marks, grip and string share the same rigid attachment.
 function attachedPoint(part,x,y){
  if(part==='bow'){
   const dx=x-3.97055,dy=y+19.335245,
    along=dx*.480135-dy*.877195,across=dx*.877195+dy*.480135;
   return [.25+along*.506-across*.862525,-18.85-along*.862525-across*.506];
  }
  if(part==='sword'){
   const dx=x,dy=y+17.3,a=-.23;
   return [dx*Math.cos(a)-dy*Math.sin(a)-.45,dx*Math.sin(a)+dy*Math.cos(a)-17.5];
  }
  return [x,y];
 }
 const shieldCrown=(x,y)=>shieldBend*Math.max(0,1-(x/4.35)**2)*Math.max(0,1-((y+17.4)/5.2)**2);
 function gearDepth(part,x,y,offset=0){
  const p=gearParts[part],
   // Each object has its own side contour, not a shared flattened silhouette.
   crown=part==='shield'?shieldCrown(x,y):0,
   // One rigid mounting incline shared by sword, bow and shield. No lower-end
   // hinge: the full weapon rests against the pouch instead of bending into it.
   depth=p.depth+p.slope*(y+17)+crown+offset;
  return depth;
 }
 function gearPoint(part,x,y,deg,dir,offset=0){
  const a=deg*Math.PI/180;
  return [-Math.cos(a)*x-Math.sin(a)*dir*gearDepth(part,x,y,offset),y];
 }
 function gearHull(points){
  const sorted=[...points].sort((p,q)=>p[0]-q[0]||p[1]-q[1]),
   cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),
   half=ps=>{const h=[];for(const p of ps){while(h.length>1&&cross(h[h.length-2],h[h.length-1],p)<=0)h.pop();h.push(p);}return h;},
   lower=half(sorted),upper=half([...sorted].reverse());
  return [...lower.slice(0,-1),...upper.slice(0,-1)];
 }
 const shieldRings=source=>[.4,.72,1].map(t=>source.map(([x,y])=>[x*t,-17.4+(y+17.4)*t]));
 const occlusionVolumes=new WeakMap();
 function nearSurfaceHull(faces,depthAt){
  // Many gear planes clip the same closed volume in one frame. Evaluate each
  // shared vertex once; fully near/far volumes need no repeated hull sorting.
  let volume=occlusionVolumes.get(faces);
  if(!volume){
   const vertices=[],indices=new Map(),edges=[],seenEdges=new Set();
   const index=v=>{if(!indices.has(v)){indices.set(v,vertices.length);vertices.push(v);}return indices.get(v);};
   for(const f of faces)for(let i=0;i<f.vertices.length;i++){
    const a=index(f.vertices[i]),b=index(f.vertices[(i+1)%f.vertices.length]),key=a+':'+b;
    if(!seenEdges.has(key)){seenEdges.add(key);edges.push([a,b]);}
   }
   volume={vertices,edges,delta:new Float64Array(vertices.length),outline:gearHull(faces.flatMap(f=>f.vertices.map(v=>v.p)))};
   occlusionVolumes.set(faces,volume);
  }
  const {vertices,edges,delta}=volume;let positive=0;
  for(let i=0;i<vertices.length;i++){const v=vertices[i];delta[i]=v.d-depthAt(v.p[1],v.p[0]);if(delta[i]>0)positive++;}
  if(!positive)return [];
  if(positive===vertices.length)return volume.outline;
  const near=[];
  for(let i=0;i<vertices.length;i++)if(delta[i]>0)near.push(vertices[i].p);
  for(const [i,j]of edges){
    const p=vertices[i],q=vertices[j],dp=delta[i],dq=delta[j];
    if((dp>0)!==(dq>0)&&Number.isFinite(dp)&&Number.isFinite(dq)){
     const u=dp/(dp-dq);
     near.push([p.p[0]+(q.p[0]-p.p[0])*u,p.p[1]+(q.p[1]-p.p[1])*u]);
    }
  }
  return near.length>=3?gearHull(near):[];
 }
 // Native polygons use a cached separating-plane tree, not average-depth
 // sorting. Intersections are split ONCE in attachment space; a tiny turn can
 // never swap a complete collar, gem or inner fitting over an unrelated face.
 const surfaceDot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
 function surfaceFace(v,col,layer=0){
  let normal;
  for(let i=1;i<v.length-1;i++){
   const a=v[i].map((n,j)=>n-v[0][j]),b=v[i+1].map((n,j)=>n-v[0][j]),
    cross=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],length=Math.hypot(...cross);
   if(length>1e-8){normal=cross.map(n=>n/length);break;}
  }
  if(!normal)return null;
  const w=surfaceDot(normal,v[0]);
  // BSP splits preserve this exact plane. Coplanar fragments share a mask;
  // no rounded depth buckets or angle approximation are involved.
  return {v,col,layer,normal,w,planeKey:normal.join(':')+':'+w};
 }
 function surfaceTree(input){
  const faces=input.filter(Boolean);if(!faces.length)return null;
  const epsilon=1e-6,side=(f,p)=>{
   let front=false,back=false;for(const v of f.v){const d=surfaceDot(p.normal,v)-p.w;front||=d>epsilon;back||=d<-epsilon;}
   return front?(back?3:1):(back?2:0);
  };
  let plane=faces[0],score=Infinity;
  for(let i=0;i<faces.length;i+=Math.max(1,Math.floor(faces.length/12))){
   const candidate=faces[i];let front=0,back=0,split=0;
   for(const f of faces){const k=side(f,candidate);front+=k===1;back+=k===2;split+=k===3;}
   const cost=split*6+Math.abs(front-back);if(cost<score){plane=candidate;score=cost;}
  }
  const front=[],back=[],on=[];
  for(const f of faces){
   const k=side(f,plane);if(k===0){on.push(f);continue;}if(k===1){front.push(f);continue;}if(k===2){back.push(f);continue;}
   const a=[],b=[];
   for(let i=0;i<f.v.length;i++){
    const p=f.v[i],q=f.v[(i+1)%f.v.length],dp=surfaceDot(plane.normal,p)-plane.w,dq=surfaceDot(plane.normal,q)-plane.w;
    if(dp>=-epsilon)a.push(p);if(dp<=epsilon)b.push(p);
    if((dp>epsilon&&dq<-epsilon)||(dp<-epsilon&&dq>epsilon)){
     const t=dp/(dp-dq),r=p.map((v,j)=>v+(q[j]-v)*t);a.push(r);b.push(r);
    }
   }
   if(a.length>=3)front.push({...f,v:a});if(b.length>=3)back.push({...f,v:b});
  }
  on.sort((a,b)=>a.layer-b.layer);
  return {normal:plane.normal,on,front:surfaceTree(front),back:surfaceTree(back)};
 }
 // Only the current exact projection is retained per immutable surface tree.
 // The body and helmet-occlusion passes share it; never quantize the angle.
 const surfaceViews=new WeakMap();
 function surfaceView(tree,deg,dir,c,s){
  let view=surfaceViews.get(tree);
  if(view&&view.deg===deg&&view.dir===dir)return view;
  const eye=[s,0,-c],ordered=view?view.ordered:[],
   visit=node=>{
    if(!node)return;const facing=surfaceDot(node.normal,eye)>=0;
    visit(facing?node.back:node.front);
    for(const f of node.on)if(surfaceDot(f.normal,eye)>1e-7)ordered.push(f);
    visit(facing?node.front:node.back);
   };
  ordered.length=0;visit(tree);
  if(view){view.deg=deg;view.dir=dir;}
  else{view={deg,dir,ordered,projected:new Map()};surfaceViews.set(tree,view);}
  return view;
 }
 // Inverse masks are convex hulls. Omit only faces fully behind the mask,
 // separated from its boundary by a full model unit for stroke/AA coverage.
 // Keep even disjoint clips: removing them changes canvas edge rounding.
 // 0: empty mask; 1: retain clipping; 2: fully hidden face.
 function maskRelation(mask,points){
  if(mask.length<3)return 0;
  const pad=1;let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
  for(const p of mask){left=Math.min(left,p[0]);right=Math.max(right,p[0]);top=Math.min(top,p[1]);bottom=Math.max(bottom,p[1]);}
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  for(const p of points){minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1]);}
  if(maxX+pad<left||minX-pad>right||maxY+pad<top||minY-pad>bottom)return 1;
  let area=0;for(let i=0;i<mask.length;i++){const p=mask[i],q=mask[(i+1)%mask.length];area+=p[0]*q[1]-q[0]*p[1];}
  if(Math.abs(area)<1e-9)return 1;const sign=area>0?1:-1;
  for(let i=0;i<mask.length;i++){
   const p=mask[i],q=mask[(i+1)%mask.length],dx=q[0]-p[0],dy=q[1]-p[1],margin=pad*Math.hypot(dx,dy);
   for(const v of points)if(sign*(dx*(v[1]-p[1])-dy*(v[0]-p[0]))<=margin)return 1;
  }
  return 2;
 }
 function drawSurfaceTree(tree,deg,dir,quiver,cleanMaterialEdges=false,seamWidth=.07){
  if(!tree)return;
  const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a)*dir,eye=[s,0,-c],
   view=surfaceView(tree,deg,dir,c,s),ordered=view.ordered;
  g.save();g.lineWidth=seamWidth*U;g.lineJoin='round';
  let colour=null,batch=[];const planeMasks=new Map();
  const path=points=>{g.moveTo(points[0][0]*U,points[0][1]*U);for(let i=1;i<points.length;i++)g.lineTo(points[i][0]*U,points[i][1]*U);g.closePath();},
   flush=()=>{if(!batch.length)return;g.beginPath();for(const points of batch)path(points);
    g.fillStyle=colour;g.strokeStyle=colour;g.fill();if(!cleanMaterialEdges)g.stroke();batch.length=0;},
   maskY=quiver?.outline.length?Math.min(...quiver.outline.map(p=>p[1])):Infinity,
   maskMaxY=quiver?.outline.length?Math.max(...quiver.outline.map(p=>p[1])):-Infinity,
   maskMinX=quiver?.outline.length?Math.min(...quiver.outline.map(p=>p[0])):Infinity,
   maskMaxX=quiver?.outline.length?Math.max(...quiver.outline.map(p=>p[0])):-Infinity;
  for(const f of ordered){
   // Y is unchanged by yaw. Reject equipment below/above the helmet before
   // projecting or sealing its many material fragments (including the rim).
   if(quiver?.head){
    const pad=cleanMaterialEdges ? .055 : 0;
    let low=Infinity,high=-Infinity;for(const v of f.v){low=Math.min(low,v[1]);high=Math.max(high,v[1]);}
    if(low-pad>maskMaxY||high+pad<maskY)continue;
   }
   let projected=view.projected.get(f);
   if(!projected){projected={raw:f.v.map(v=>[0,v[1]])};view.projected.set(f,projected);}
   if(projected.deg!==deg||projected.dir!==dir){
    for(let i=0;i<f.v.length;i++)projected.raw[i][0]=-c*f.v[i][0]-s*f.v[i][2];
    projected.deg=deg;projected.dir=dir;projected.sealed=null;projected.boundsDirty=true;
   }
   if(cleanMaterialEdges&&!projected.sealed){
    projected.sealOutput??=[];
    projected.sealed=sealedSurfacePolygon(projected.raw,f.materialEdges||[],c,s,projected.sealOutput);
   }
   const points=cleanMaterialEdges?projected.sealed:projected.raw;
   if(points.length<3)continue;
   // Share exact bounds with the head pass instead of mapping every polygon
   // to temporary arrays for each of the repeated rejection tests.
   if(projected.boundsDirty){
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
    for(const p of points){minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1]);}
    const bounds=projected.bounds||(projected.bounds={});
    bounds.minX=minX;bounds.maxX=maxX;bounds.minY=minY;bounds.maxY=maxY;projected.boundsDirty=false;
   }
   const bounds=projected.bounds;
   if(quiver?.head&&(bounds.minY>maskMaxY||bounds.maxY<maskY||bounds.minX>maskMaxX||bounds.maxX<maskMinX))continue;
   if(bounds.maxY>=maskY&&bounds.maxX>=maskMinX&&bounds.minX<=maskMaxX){
    flush();g.save();
    // Solve the face plane at each pouch vertex, not at its centroid.
    let mask=planeMasks.get(f.planeKey);
    if(!mask){
     const nx=-c*f.normal[0]-s*f.normal[2],toward=surfaceDot(f.normal,eye);
     mask=quiver.maskFor((y,x)=>(f.w-nx*x-f.normal[1]*y)/toward);
     planeMasks.set(f.planeKey,mask);
    }
    const relation=maskRelation(mask,points);
    if(relation===2){g.restore();continue;}
    if(relation===1){g.beginPath();g.rect(-100*U,-100*U,200*U,200*U);path(mask);g.clip('evenodd');}
    colour=f.col;batch.push(points);flush();g.restore();
   }else{
    // Only consecutive equal-colour surfaces may be coalesced: preserve the
    // exact plane order while filling shared native edges as one canvas path.
    if(colour!==f.col)flush();colour=f.col;batch.push(points);
   }
  }
  flush();g.restore();
 }
 // Scratch buffers are shared only during this synchronous pure calculation.
 // The final polygon is copied into each face's own retained point storage.
 const sealScratchA=[],sealScratchB=[];
 function sealedSurfacePolygon(points,boundaries,c,s,output){
  // Extend only into same-material internal seams. True outline half-planes
  // remain exact, so the seal never grows little teeth around painted details.
  // These tiny convex clips replace expensive whole-material canvas masks.
  const margin=.055;
  let area=0,minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  for(let i=0;i<points.length;i++){
   const p=points[i],q=points[(i+1)%points.length];area=area+p[0]*q[1]-p[1]*q[0];
   minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1]);
  }
  const sign=area<0?-1:1,x0=minX-margin,x1=maxX+margin,y0=minY-margin,y1=maxY+margin;
  let result=sealScratchA,next=sealScratchB,count=8;
  result[0]=x0;result[1]=y0;result[2]=x1;result[3]=y0;
  result[4]=x1;result[5]=y1;result[6]=x0;result[7]=y1;
  const clip=(ax,ay,bx,by,padding)=>{
   if(!count)return;
   const dx=bx-ax,dy=by-ay,length=Math.hypot(dx,dy);if(length<1e-9)return;
   let dp=sign*(dx*(result[1]-ay)-dy*(result[0]-ax))/length+padding,n=0;
   for(let i=0;i<count;i+=2){
    const j=(i+2)%count,px=result[i],py=result[i+1],qx=result[j],qy=result[j+1],
     dq=sign*(dx*(qy-ay)-dy*(qx-ax))/length+padding;
    if(dp>=0){next[n++]=px;next[n++]=py;}
    if((dp>0&&dq<0)||(dp<0&&dq>0)){const t=dp/(dp-dq);next[n++]=px+(qx-px)*t;next[n++]=py+(qy-py)*t;}dp=dq;
   }
   const swap=result;result=next;next=swap;count=n;
  };
  for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];clip(a[0],a[1],b[0],b[1],margin);}
  for(const [a,b]of boundaries)clip(-c*a[0]-s*a[2],a[1],-c*b[0]-s*b[2],b[1],0);
  for(let i=0;i<count;i+=2){const p=output[i/2]||(output[i/2]=[0,0]);p[0]=result[i];p[1]=result[i+1];}
  output.length=count/2;return output;
 }
 function surfaceTriangles(poly){
  const ps=poly.map(p=>p.slice()),cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),result=[];
  if(ps.reduce((n,p,i)=>n+p[0]*ps[(i+1)%ps.length][1]-p[1]*ps[(i+1)%ps.length][0],0)<0)ps.reverse();
  while(ps.length>3){
   let cut=false;
   for(let i=0;i<ps.length;i++){
    const a=ps[(i+ps.length-1)%ps.length],b=ps[i],c=ps[(i+1)%ps.length];
    if(cross(a,b,c)<1e-8)continue;
    if(ps.some(p=>p!==a&&p!==b&&p!==c&&cross(a,b,p)>=-1e-8&&cross(b,c,p)>=-1e-8&&cross(c,a,p)>=-1e-8))continue;
    result.push([a,b,c]);ps.splice(i,1);cut=true;break;
   }
   if(!cut)break;
  }
  if(ps.length===3)result.push(ps);return result;
 }
 function surfaceClip(poly,triangle){
  let result=poly;
  for(let i=0;i<3&&result.length;i++){
   const a=triangle[i],b=triangle[(i+1)%3],distance=p=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]),next=[];
   for(let j=0;j<result.length;j++){
    const p=result[j],q=result[(j+1)%result.length],dp=distance(p),dq=distance(q);
    if(dp>=-1e-8)next.push(p);
    if((dp>0&&dq<0)||(dp<0&&dq>0)){const t=dp/(dp-dq);next.push(p.map((v,k)=>v+(q[k]-v)*t));}
   }
   result=next;
  }return result;
 }
 function surfacePaintRegions(regions,ink,col){
  const result=[],area=ps=>Math.abs(ps.reduce((n,p,i)=>n+p[0]*ps[(i+1)%ps.length][1]-p[1]*ps[(i+1)%ps.length][0],0));
  for(const region of regions){
   if(surfaceClip(region.ps,ink).length<3){result.push(region);continue;}
   let inside=region.ps;
   for(let i=0;i<3&&inside.length;i++){
    const a=ink[i],b=ink[(i+1)%3],distance=p=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]),front=[],back=[];
    for(let j=0;j<inside.length;j++){
     const p=inside[j],q=inside[(j+1)%inside.length],dp=distance(p),dq=distance(q);
     if(dp>=0)front.push(p);if(dp<=0)back.push(p);
     if((dp>0&&dq<0)||(dp<0&&dq>0)){const t=dp/(dp-dq),v=p.map((n,k)=>n+(q[k]-n)*t);front.push(v);back.push(v);}
    }
    if(back.length>=3&&area(back)>1e-9)result.push({ps:back,col:region.col});inside=front;
   }
   if(inside.length>=3&&area(inside)>1e-9)result.push({ps:inside,col});
  }return result;
 }
 // Generated vector topology, not a bitmap/pose cache. Geometry changes must
 // regenerate shield-geometry.js; incompatible/missing packs use the builder.
 const shieldGeometryRevision=2;
 // Merge only convex, coplanar neighbours within one BSP node and one
 // consecutive material run. Never move faces across a separating plane.
 // Keep original coordinates and every applicable design half-plane.
 function mergeShieldSurfaces(tree){
  if(!tree)return tree;
  const merge=(a,b)=>{
   if(a.col!==b.col||a.layer!==b.layer||surfaceDot(a.normal,b.normal)<1-1e-12)return null;
   if(b.v.some(p=>Math.abs(surfaceDot(a.normal,p)-a.w)>1e-9))return null;
   const axis=a.normal.map(Math.abs).indexOf(Math.max(...a.normal.map(Math.abs))),
    axes=[0,1,2].filter(i=>i!==axis),[x,y]=axes,
    cross=(p,q,r)=>(q[x]-p[x])*(r[y]-p[y])-(q[y]-p[y])*(r[x]-p[x]),
    area=vs=>vs.reduce((s,p,i)=>s+p[x]*vs[(i+1)%vs.length][y]-p[y]*vs[(i+1)%vs.length][x],0)/2;
   const av=area(a.v),bv=area(b.v);
   if(Math.abs(av)<1e-8||Math.abs(bv)<1e-8||av*bv<=0)return null;
   const sorted=a.v.concat(b.v).slice().sort((p,q)=>p[x]-q[x]||p[y]-q[y]),unique=[];
   for(const p of sorted)if(!unique.length||Math.hypot(...p.map((v,i)=>v-unique[unique.length-1][i]))>1e-10)unique.push(p);
   const half=ps=>{const out=[];for(const p of ps){while(out.length>1&&cross(out[out.length-2],out[out.length-1],p)<=1e-12)out.pop();out.push(p);}return out;},
    lower=half(unique),upper=half(unique.slice().reverse()),hull=lower.slice(0,-1).concat(upper.slice(0,-1));
   // BSP faces in a node have disjoint interiors. Equal summed area proves
   // the convex hull adds no gap; reject even small missing wedges.
   if(Math.abs(Math.abs(area(hull))-Math.abs(av)-Math.abs(bv))>1e-9)return null;
   if(av<0)hull.reverse();
   const edges=[],keys=new Set(),sign=Math.sign(av);
   for(const edge of [...a.materialEdges,...b.materialEdges]){
    if(hull.some(p=>sign*cross(edge[0],edge[1],p)<-1e-9))return null;
    const key=JSON.stringify(edge);if(!keys.has(key)){keys.add(key);edges.push(edge);}
   }
   return {...a,v:hull,materialEdges:edges};
  };
  // A run can contain multiple disconnected patches; area/coplanarity tests
  // leave them separate. Earlier/later colours retain their painter order.
  for(let start=0;start<tree.on.length;){
   let end=start+1;while(end<tree.on.length&&tree.on[end].col===tree.on[start].col&&tree.on[end].layer===tree.on[start].layer)end++;
   let changed=true;
   while(changed){changed=false;outer:for(let i=start;i<end;i++)for(let j=i+1;j<end;j++){
    const merged=merge(tree.on[i],tree.on[j]);if(!merged)continue;
    tree.on[i]=merged;tree.on.splice(j,1);end--;changed=true;break outer;
   }}start=end;
  }
  mergeShieldSurfaces(tree.front);mergeShieldSurfaces(tree.back);return tree;
 }
 let shieldSurfaceTree,packedShield=false;
 function loadShieldGeometry(){
  const pack=window.KRJonathanShieldGeometry;
  if(!pack||pack.revision!==shieldGeometryRevision||
   pack.layout!==JSON.stringify([shieldBend,gearParts.shield])||
   pack.materials!==JSON.stringify(KRJonathanWalkEquipment.filter(r=>r.part==='shield')))return null;
  const faces=pack.faces.map(([vs,col,layer,normal,w,edges])=>({
   v:vs.map(i=>pack.points[i]),col:pack.colours[col],layer,normal:pack.points[normal],w,
   planeKey:pack.points[normal].join(':')+':'+w,
   materialEdges:edges.map(edge=>edge.map(i=>pack.points[i]))
  }));
  const nodes=pack.nodes.map(([normal,on])=>({normal:pack.points[normal],on:on.map(i=>faces[i])}));
  pack.nodes.forEach(([, ,front,back],i)=>{nodes[i].front=front<0?null:nodes[front];nodes[i].back=back<0?null:nodes[back];});
  packedShield=true;return nodes[pack.root];
 }
 function drawShield(deg,dir,occluder=null){
  if(!shieldSurfaceTree)shieldSurfaceTree=loadShieldGeometry();
  if(!shieldSurfaceTree){
   const plates=KRJonathanWalkEquipment.filter(r=>r.part==='shield');if(plates.length<2)return;
   const faces=[],patches=[],designEdges={outside:[],inside:[]},designStart={outside:new Map(),inside:new Map()},designLayer={outside:0,inside:0},thick=gearParts.shield.edge,center=[0,-17.4],
    vertex=(p,offset=0)=>[p[0],p[1],gearDepth('shield',p[0],p[1],offset)],
    add=(vs,col,sign=1,layer=0)=>{
     let f=surfaceFace(vs,col,layer);if(!f)return;
     if(f.normal[2]*sign<0)f=surfaceFace([...vs].reverse(),col,layer);faces.push(f);
    },
    subdivide=ps=>ps.flatMap((p,i)=>Array.from({length:4},(_,j)=>{
     const q=ps[(i+1)%ps.length],t=j/4;return p.map((v,k)=>v+(q[k]-v)*t);
    })),
    outer=subdivide(plates[0].points),blue=subdivide(plates[1].points),
    rings=[.33,.66,1].map(t=>blue.map(([x,y])=>[x*t,center[1]+(y-center[1])*t])).concat([outer]);
   for(let ring=0;ring<rings.length;ring++)for(let j=0;j<outer.length;j++){
    const k=(j+1)%outer.length,p=rings[ring],q=rings[ring-1],
     tris=ring?[[q[j],p[j],p[k]],[q[j],p[k],q[k]]]:[[center,p[j],p[k]]],border=ring===rings.length-1;
    for(const raw of tris){
     const tri=surfaceTriangles(raw)[0];if(!tri)continue;
     const outside=tri.map(p=>vertex(p)),inside=tri.map(p=>vertex(p,-thick));
     if(border){add(outside,plates[0].col);add(inside,'#91a1ad',-1);}
     else patches.push({tri,outside,inside,outerRegions:[{ps:tri,col:plates[1].col}],innerRegions:[{ps:tri,col:'#3b4d58'}]});
    }
   }
   // Closed, consistently wound silver wall. Neither the cavity nor its grips
   // are overlaid after this wall; all share the same exact visibility pass.
   for(let i=0;i<outer.length;i++){
    const p=outer[i],q=outer[(i+1)%outer.length];
    faces.push(surfaceFace([vertex(q),vertex(p),vertex(p,-thick),vertex(q,-thick)],'#92a2b0'));
   }
   const outlineEdges=(poly,inside=false,layer=0)=>{for(let i=0;i<poly.length;i++)designEdges[inside?'inside':'outside'].push({edge:[poly[i],poly[(i+1)%poly.length]],layer});};
   for(const inside of [false,true]){outlineEdges(plates[0].points,inside);outlineEdges(plates[1].points,inside);}
   const paint=(poly,col,inside=false)=>{
    const side=inside?'inside':'outside',layer=++designLayer[side];
    if(!designStart[side].has(col))designStart[side].set(col,layer);
    outlineEdges(poly,inside,layer);
    for(const ink of surfaceTriangles(poly))for(const patch of patches){
     const ps=surfaceClip(ink,patch.tri);if(ps.length<3)continue;
     // Paint replaces this skin region. It is not an antialiased second layer
     // whose triangle seams can expose/overpaint the base colour during yaw.
     const key=inside?'innerRegions':'outerRegions';patch[key]=surfacePaintRegions(patch[key],ink,col);
    }
   };
   plates.slice(2).forEach((r,i)=>paint(r.points,r.col,false,i+1));
   const strip=(a,b,w)=>{const dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy),nx=-dy/n*w/2,ny=dx/n*w/2;
    return [[a[0]-nx,a[1]-ny],[b[0]-nx,b[1]-ny],[b[0]+nx,b[1]+ny],[a[0]+nx,a[1]+ny]];
   };
   for(const [a,b]of [[[-2.5,-20],[1.3,-14.75]],[[2.5,-20],[-1.3,-14.75]]]){
    paint(strip(a,b,.94),'#243540',true,1);paint(strip(a,b,.66),'#83959f',true,2);
   }
   for(const [x,y]of [[-2.5,-20],[2.5,-20],[-1.3,-14.75],[1.3,-14.75],[1.25,-19.55],[1.25,-16.85]]){
    paint([[x-.32,y-.3],[x+.3,y-.3],[x+.36,y],[x+.24,y+.28],[x-.3,y+.28]],'#bdcbd0',true,3);
   }
   for(const patch of patches)for(const inside of [false,true]){
    const host=surfaceFace(inside?patch.inside:patch.outside,'');
    for(const region of patch[inside?'innerRegions':'outerRegions'])
     add(region.ps.map(([x,y])=>[x,y,(host.w-host.normal[0]*x-host.normal[1]*y)/host.normal[2]]),region.col,inside?-1:1);
   }
   const strap=(a,b,width,liftA,liftB,col)=>{
    const ps=strip(a,b,width),lifts=[liftA,liftB,liftB,liftA],
     top=ps.map((p,i)=>vertex(p,-thick-lifts[i])),bottom=top.map(p=>[p[0],p[1],p[2]+.13]);
    const center=top.concat(bottom).reduce((v,p)=>v.map((n,i)=>n+p[i]/8),[0,0,0]),
     wall=(vs,colour)=>{
      for(const ids of vs.length===4?[[0,1,2],[0,2,3]]:[[0,1,2]]){
       let f=surfaceFace(ids.map(i=>vs[i]),colour);if(!f)continue;
       if(surfaceDot(f.normal,f.v[0].map((v,i)=>v-center[i]))<0)f=surfaceFace([...f.v].reverse(),colour);faces.push(f);
      }
     };
    wall(top,col);wall([...bottom].reverse(),'#493522');
    for(let i=0;i<4;i++){const j=(i+1)%4;wall([top[i],top[j],bottom[j],bottom[i]],'#6b482e');}
   };
   strap([-.95,-19.85],[-.95,-16.8],.7,.35,.35,'#a67543');
   strap([1.25,-19.55],[2.1,-19.05],.5,.16,.62,'#87603b');
   strap([2.1,-19.05],[2.1,-17.3],.5,.62,.62,'#aa7a4b');
   strap([2.1,-17.3],[1.25,-16.85],.5,.62,.16,'#87603b');
   for(const f of faces.filter(Boolean)){
    f.materialEdges=[];
    if(Math.abs(f.normal[2])<1e-8){
     f.materialEdges=f.v.map((p,i)=>[p,f.v[(i+1)%f.v.length]]);continue;
    }
    const side=f.normal[2]>0?'outside':'inside',firstLayer=designStart[side].get(f.col)||0;
    for(const {edge:[a,b],layer}of designEdges[side]){
     // An opaque later paint (e.g. the gold badge over the red crest) has no
     // boundary at an earlier, hidden mark beneath it.
     if(layer<firstLayer)continue;
     const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),
      distances=f.v.map(p=>(dx*(p[1]-a[1])-dy*(p[0]-a[0]))/length),lo=Math.min(...distances),hi=Math.max(...distances);
     if((lo<-1e-6&&hi>1e-6)||Math.min(...distances.map(Math.abs))>.11||hi-lo<1e-8)continue;
     const vertices=[a,b].map(([x,y])=>[x,y,(f.w-f.normal[0]*x-f.normal[1]*y)/f.normal[2]]);
     if((lo>=-1e-6)!==(f.normal[2]>0))vertices.reverse();
     f.materialEdges.push(vertices);
    }
   }
   shieldSurfaceTree=mergeShieldSurfaces(surfaceTree(faces));
  }
  drawSurfaceTree(shieldSurfaceTree,deg,dir,occluder,true);
 }
 function harness(deg,dir,shape){
  if(!equipmentVisible)return;
  const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a),rear=c<0,
   face=rear?-2.05:2.05,
   point=(x,y)=>[x*-c+dir*s*face,y],
   p=point(2.65,shape.sy-.55),q=point(-2.65,shape.hip-.7);
  // Tight cast/contact shadow on the cuirass only, underneath straps and arms.
  // Project onto the back's surface rather than offsetting a floating halo.
  if(rear&&gearShown('shield')&&KRJonathanWalkEquipment.some(r=>r.part==='shield')){
   const outline=KRJonathanWalkEquipment.find(r=>r.part==='shield').points,
    drop=shape.hip+12;
   g.save();g.globalAlpha*=.19*Math.min(1,-c*2);
   rigPolygon(outline.map(([x,y])=>[-c*x-dir*s*2.2+.18,y+drop+.16]),'#172932');
   g.restore();
  }
  // Clipped to the cuirass by the shared renderer, behind arms and back gear.
  // The chest strap turns edge-on with its armour face, not into a vertical plank.
  const strapWidth=Math.abs(c);
  if(strapWidth>.001){
   rigSegment(...p,...q,1.25*strapWidth,'#32241d');
   rigSegment(...p,...q,.86*strapWidth,'#64412b');
   rigSegment(p[0]-.12*strapWidth,p[1],q[0]-.12*strapWidth,q[1],.18*strapWidth,'#91633d');
  }
  // Waist belt wraps the actual cuirass contour (the caller clips this pass).
  const beltY=shape.hip-1.15;
  rigPolygon([[-8,beltY-.58],[8,beltY-.58],[8,beltY+.58],[-8,beltY+.58]],'#32241d');
  rigPolygon([[-8,beltY-.36],[8,beltY-.36],[8,beltY+.3],[-8,beltY+.3]],'#64412b');
  rigSegment(-8,beltY-.4,8,beltY-.4,.14,'#91633d');
  if(!rear&&c>.2){
   const bx=dir*s*2.05,w=.63*c;
   rigPolygon([[bx-w,beltY-.61],[bx+w,beltY-.61],[bx+w,beltY+.61],[bx-w,beltY+.61]],'#e1b958');
   rigPolygon([[bx-w*.55,beltY-.32],[bx+w*.55,beltY-.32],[bx+w*.55,beltY+.32],[bx-w*.55,beltY+.32]],'#493021');
  }
  if(Math.abs(c)>.25){
   const t=.61,bx=p[0]+(q[0]-p[0])*t,by=p[1]+(q[1]-p[1])*t,
    w=.8*Math.abs(c);
   rigPolygon([[bx-w,by-.75],[bx+w,by-.75],[bx+w,by+.75],[bx-w,by+.75]],'#e1b958');
   rigPolygon([[bx-w*.52,by-.4],[bx+w*.52,by-.4],[bx+w*.52,by+.4],[bx-w*.52,by+.4]],'#493021');
  }
 }
 let equipmentVisible=true;
 let equipmentParts=null;
 const gearShown=part=>equipmentVisible&&equipmentParts?.[part]!==false;
 function withEquipmentParts(parts,draw){
  const previous=equipmentParts;equipmentParts=parts;
  try{return draw();}finally{equipmentParts=previous;}
 }
 function withEquipmentVisible(visible,draw){
  const previous=equipmentVisible;equipmentVisible=visible;
  try{return draw();}finally{equipmentVisible=previous;}
 }
 let swordSurfaceTree;
 function drawMountedSword(deg,dir,quiver){
  if(!swordSurfaceTree){
   // Approved native sword axes/materials, with an 18% longer, 12% broader
   // usable grip. Components meet at shared stations rather than overlapping
   // independently extruded rigJoint squares and rigSegment rectangles.
   const faces=[],length=Math.hypot(8.6,7),guard=length+.48,pommel=guard+3.85,
    axis=[8.6/length,-7/length],across=[7/length,8.6/length],
    vertex=(w,t,z)=>{
     const [x,y]=attachedPoint('sword',-4.55+axis[0]*t+across[0]*w,-13.3068+axis[1]*t+across[1]*w);
     return [x,y,gearDepth('sword',x,y,z)];
    },
    face=(vs,col,center,layer=0)=>{
     let f=surfaceFace(vs,col,layer);if(!f)return;
     if(surfaceDot(f.normal,f.v[0].map((v,i)=>v-center[i]))<0)f=surfaceFace([...vs].reverse(),col,layer);faces.push(f);
    },
    prism=(poly,half,col,edge=shade(col,-18))=>{
     const center=vertex(poly.reduce((n,p)=>n+p[0]/poly.length,0),poly.reduce((n,p)=>n+p[1]/poly.length,0),0),
      front=poly.map(p=>vertex(...p,half)),back=poly.map(p=>vertex(...p,-half));
     face(front,col,center);face(back,shade(col,-7),center);
     for(let i=0;i<poly.length;i++){const j=(i+1)%poly.length;
      face([front[i],front[j],back[j],back[i]],i%2?edge:shade(col,8),center);
     }
     return center;
    },
    paint=(poly,half,col,center)=>{for(const sign of [-1,1])face(poly.map(p=>vertex(...p,half*sign)),sign===1?col:shade(col,-7),center,1);},
    rectangle=(w,a,b)=>[[-w,a],[w,a],[w,b],[-w,b]];
   prism([[-.58,0],[.58,0],[.629,.42],[-.629,.42]],.475,'#18304f');
   const sheath=[[-.629,.42],[.629,.42],[.852,length-.34],[-.852,length-.34]],
    sheathCenter=prism(sheath,.475,'#1c426f','#183653');
   paint([[-.629,.42],[-.37,.42],[-.55,length-.34],[-.852,length-.34]],.475,'#3e6491',sheathCenter);
   // One closed collar, not three competing white faces through the guard.
   prism(rectangle(.95,length-.34,guard-.45),.5,'#d9e5ee','#91a6bb');
   const gripCenter=prism(rectangle(.75,guard+.45,pommel-.25),.34,'#4059a8','#2d3d80');
   paint([[.5,guard+.45],[.75,guard+.45],[.75,pommel-.25],[.5,pommel-.25]],.34,'#6077c2',gripCenter);
   const guardShape=[[-1.94,guard-.23],[-1.72,guard-.45],[1.72,guard-.45],[1.94,guard-.23],
    [1.94,guard+.23],[1.72,guard+.45],[-1.72,guard+.45],[-1.94,guard+.23]],
    guardCenter=prism(guardShape,.52,'#6f91d8','#4d65a2');
   prism([[-.75,pommel-.25],[.75,pommel-.25],[.75,pommel+.17],[.57,pommel+.36],[-.57,pommel+.36],[-.75,pommel+.17]],.4,'#819ee0','#536fac');
   // A shallow, clipped-corner gem is physically seated on each guard face.
   // Its wide central facet and bevel are connected, never stacked flat stamps.
   const gem=[[-.3,-.3],[.3,-.3],[.42,-.16],[.42,.16],[.3,.3],[-.3,.3],[-.42,.16],[-.42,-.16]],
    colours=['#b8edff','#8cd4f5','#539ec9','#428ab9','#5599c5','#72bae2','#a2e3fa','#c6f2ff'];
   for(const sign of [-1,1]){
    const bottom=gem.map(([x,y])=>vertex(x,guard+y,.52*sign)),
     top=gem.map(([x,y])=>vertex(x*.72,guard+y*.72,.65*sign));
    face(top,'#82d0ed',guardCenter,2);
    for(let i=0;i<gem.length;i++){const j=(i+1)%gem.length;face([bottom[i],bottom[j],top[j],top[i]],colours[i],guardCenter,2);}
   }
   swordSurfaceTree=surfaceTree(faces);
  }
  drawSurfaceTree(swordSurfaceTree,deg,dir,quiver);
 }
 const mountedWeaponSurfaces=new Map(),mountedWeaponViews=new Map();
 function mountedWeapon(part,deg,dir,quiver){
  if(part==='sword'){drawMountedSword(deg,dir,quiver);return;}
  let surfaceCenter;
  const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a)*dir,faces=[],
   maskBounds=quiver.outline.length?{
    minX:Math.min(...quiver.outline.map(p=>p[0])),maxX:Math.max(...quiver.outline.map(p=>p[0])),
    minY:Math.min(...quiver.outline.map(p=>p[1])),maxY:Math.max(...quiver.outline.map(p=>p[1]))}:null,
   maskCache=new Map(),
   records=KRJonathanWalkEquipment.filter(r=>r.part===part),
   vertex=(p,z)=>{
    const [x,y]=attachedPoint(part,...p),depth=gearDepth(part,x,y,z);
    return [x,y,depth];
   },
   add=(ps,zs,col)=>{
    const vs=ps.map((p,i)=>vertex(p,Array.isArray(zs)?zs[i]:zs)),
     u=vs[1].map((v,i)=>v-vs[0][i]),v=vs[2].map((v,i)=>v-vs[0][i]),
     normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],
     sign=normal.reduce((n,v,i)=>n+v*(vs[0][i]-surfaceCenter[i]),0)<0?-1:1;
    faces.push({vertices:vs,nx:normal[0]*sign,nz:normal[2]*sign,
     x:vs.reduce((n,p)=>n+p[0],0)/vs.length,z:vs.reduce((n,p)=>n+p[2],0)/vs.length,col});
   },
   rectangle=r=>{
    const [p,q]=r.points,dx=q[0]-p[0],dy=q[1]-p[1],len=Math.hypot(dx,dy),nx=-dy/len*r.width/2,ny=dx/len*r.width/2;
    return [[p[0]-nx,p[1]-ny],[p[0]+nx,p[1]+ny],[q[0]+nx,q[1]+ny],[q[0]-nx,q[1]-ny]];
   },
   strip=(ps,half,col,decal=false)=>{
    surfaceCenter=vertex([ps.reduce((n,p)=>n+p[0],0)/ps.length,ps.reduce((n,p)=>n+p[1],0)/ps.length],0);
    const lerp=(p,q,t)=>p.map((v,i)=>v+(q[i]-v)*t),
     count=Math.max(1,Math.ceil(Math.max(Math.hypot(...ps[0].map((v,i)=>v-ps[3][i])),Math.hypot(...ps[1].map((v,i)=>v-ps[2][i])))/.48));
    for(let i=0;i<count;i++){
     const t=i/count,u=(i+1)/count,p=lerp(ps[0],ps[3],t),q=lerp(ps[1],ps[2],t),
      r=lerp(ps[1],ps[2],u),v=lerp(ps[0],ps[3],u),plane=[p,q,r,v];
     add(plane,half,col);add(plane,-half,shade(col,-7));
     if(!decal){
      add([p,v,v,p],[-half,-half,half,half],shade(col,-16));
      add([q,r,r,q],[-half,-half,half,half],shade(col,7));
     }
    }
    if(!decal)for(const [p,q]of [[ps[0],ps[1]],[ps[3],ps[2]]])add([p,q,q,p],[-half,-half,half,half],shade(col,-10));
   };
  if(!mountedWeaponSurfaces.has(part))for(const [i,r]of records.entries()){
   const ps=r.kind==='segment'?rectangle(r):r.points,
    colour=r.col[0]==='#'?r.col:'#'+r.col.match(/\d+/g).slice(0,3).map(n=>Number(n).toString(16).padStart(2,'0')).join('');
   if(ps.length!==4)continue;
   const decal=[5,8,14,17].includes(i),string=i>=18,
    half=string?.095:[6,7,15,16].includes(i)?.28:.225;
   strip(ps,half+(decal?.018:0),colour,decal);
  }
  if(!mountedWeaponSurfaces.has(part))mountedWeaponSurfaces.set(part,faces);
  let view=mountedWeaponViews.get(part);
  if(!view){view={faces:new Map(),ordered:[]};mountedWeaponViews.set(part,view);}
  if(view.deg!==deg||view.dir!==dir){
   view.deg=deg;view.dir=dir;view.ordered.length=0;
   // Body and head share this exact projection. Keep storage per source face,
   // and re-sort from construction order so depth ties cannot inherit old yaw.
   for(const source of mountedWeaponSurfaces.get(part)){
    if(source.nx*s-source.nz*c<=.000001)continue;
    let f=view.faces.get(source);
    if(!f){f={source,points:source.vertices.map(p=>[0,p[1]]),col:source.col,plane:null,
     minY:Math.min(...source.vertices.map(p=>p[1])),maxY:Math.max(...source.vertices.map(p=>p[1]))};view.faces.set(source,f);}
    f.minX=Infinity;f.maxX=-Infinity;
    for(let i=0;i<source.vertices.length;i++){
     const p=source.vertices[i],x=-c*p[0]-s*p[2];f.points[i][0]=x;f.minX=Math.min(f.minX,x);f.maxX=Math.max(f.maxX,x);
    }
    f.depth=s*source.x-c*source.z;view.ordered.push(f);
   }
   view.ordered.sort((p,q)=>p.depth-q.depth);
  }
  const projected=view.ordered;
  // Unclipped faces share identical stroke state. Keep one outer state scope;
  // only a real inverse mask needs its own save/restore pair.
  g.save();g.lineWidth=.065*U;g.lineJoin='miter';
  for(const f of projected){
   if(quiver.head&&maskBounds&&(f.minY>maskBounds.maxY||f.maxY<maskBounds.minY||f.minX>maskBounds.maxX||f.maxX<maskBounds.minX))continue;
   let clipped=false;
   // A local depth test preserves the pouch's real overlap from either side.
   // Restrict it to the low part; no need to query the pouch near the hilt.
   if(maskBounds&&f.maxY>=maskBounds.minY&&f.minY<=maskBounds.maxY&&f.maxX>=maskBounds.minX&&f.minX<=maskBounds.maxX){
    const key=f.depth.toFixed(3);let mask=quiver.head?null:maskCache.get(key);
    if(!mask){
     if(quiver.head&&!f.plane)f.plane=surfaceFace(f.source.vertices,f.col);
     const plane=quiver.head?f.plane:null,nx=plane&&(-c*plane.normal[0]-s*plane.normal[2]),toward=plane&&(s*plane.normal[0]-c*plane.normal[2]);
     mask=quiver.maskFor(plane?(y,x)=>(plane.w-nx*x-plane.normal[1]*y)/toward:()=>f.depth);
     if(!quiver.head)maskCache.set(key,mask);
    }
    const relation=maskRelation(mask,f.points);
    if(relation===2)continue;
    if(relation===1){g.save();clipped=true;g.beginPath();g.rect(-100*U,-100*U,200*U,200*U);
     g.moveTo(mask[0][0]*U,mask[0][1]*U);for(const p of mask.slice(1))g.lineTo(p[0]*U,p[1]*U);g.closePath();g.clip('evenodd');}
   }
   rigPolygon(f.points,f.col);
   // fill() retains the exact current path: stroke it without rebuilding all
   // its vertices. This preserves both raster operations and their order.
   g.strokeStyle=f.col;g.stroke();if(clipped)g.restore();
  }
  g.restore();
 }
 function equipment(deg,dir,pass='all',head=null){
  if(!equipmentVisible||pass==='arrows')return;
  if(head){
   // A closed depth proxy fitted to the existing authored helmet silhouette.
   // Split occlusion per equipment face, not by a yaw threshold or opacity.
   const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a)*dir,
    half=head.half/(Math.abs(c)+Math.abs(s)),
    ring=y=>[[-half,-half],[half,-half],[half,half],[-half,half]].map(([x,z])=>({p:[head.x-c*x-s*z,y],d:s*x-c*z})),
    top=ring(head.top),bottom=ring(head.bottom),faces=[{vertices:top},{vertices:bottom}];
   for(let i=0;i<4;i++){const j=(i+1)%4;faces.push({vertices:[top[i],top[j],bottom[j],bottom[i]]});}
   const expanded=new WeakMap(),mask={head:true,outline:gearHull([...top,...bottom].map(v=>v.p)),maskFor:depthAt=>{
    const poly=nearSurfaceHull(faces,depthAt);
    // Seal the clipped occlusion edge: antialiased face strokes must not leave
    // a thin gold/white seam through the nearer helmet at the opposite profile.
    if(poly.length<3)return poly;
    if(!expanded.has(poly))expanded.set(poly,gearHull(poly.flatMap(([x,y])=>[[x-.06,y-.06],[x+.06,y-.06],[x+.06,y+.06],[x-.06,y+.06]])));
    return expanded.get(poly);
   }};
   for(const part of (deg>=90?['sword','bow','shield']:['shield','bow','sword']).filter(gearShown)){
    if(part==='shield')drawShield(deg,dir,mask);else mountedWeapon(part,deg,dir,mask);
   }
   return;
  }
  const quiver=gearShown('quiver')?drawQuiver(deg,dir):{maskFor:()=>[],outline:[]};
  // Physical stack is back -> quiver -> sword -> bow -> shield. The bow's
  // centered backing clears the sheath even at the exact side silhouettes.
  // Reverse the viewer's painter order from the front, not the attachments.
  const order=deg>=90?['sword','bow','shield']:['shield','bow','sword'];
  for(const part of order.filter(gearShown)){
   if(part!=='shield'){mountedWeapon(part,deg,dir,quiver);continue;}
   g.save();
   if(deg<90&&quiver.outline.length>=3){
    const mask=quiver.outline;g.beginPath();g.rect(-100*U,-100*U,200*U,200*U);
    g.moveTo(mask[0][0]*U,mask[0][1]*U);for(const p of mask.slice(1))g.lineTo(p[0]*U,p[1]*U);g.closePath();g.clip('evenodd');
   }
   drawShield(deg,dir);g.restore();
  }
 }
 let quiverArrowTree,quiverShellFaces,quiverProjection=0;
 function drawQuiver(deg,dir){
  let shellPass=true;
  const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a),
   point=(x,y,z=0)=>gearPoint('quiver',x,y,deg,dir,z),
   // Rounded D contour with restrained shading, not five hard low-poly facets.
   section=Array.from({length:13},(_,i)=>[-Math.cos(i*Math.PI/12),Math.sin(i*Math.PI/12)]),
   vertex=(t,v,z,r=1)=>{
    const radius=(1.2+.3*Math.min(t,1))*r,x=-3.9+9.2*t+v*radius*.075,
     y=-11.15-.72*t+v*radius,depth=z*radius*1.25;
    return {p:point(x,y,depth),d:s*dir*x-c*(gearParts.quiver.depth+depth),xyz:[x,y,gearParts.quiver.depth+depth]};
   },
   ring=(t,r=1)=>section.map(([v,z])=>vertex(t,v,z,r));
  let faces=[];
  const add=(vertices,col,seamless=false)=>{
    let visible=true,plane=null;
    if(shellPass){
     const vs=vertices.map(v=>v.xyz),u=vs[1].map((v,i)=>v-vs[0][i]),v=vs[2].map((v,i)=>v-vs[0][i]),
      normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],center=[.7,-11.51,gearParts.quiver.depth+.8],
      sign=normal.reduce((n,v,i)=>n+v*(vs[0][i]-center[i]),0)<0?-1:1;
     visible=sign*(normal[0]*s*dir-normal[2]*c)>.000001;
     plane={normal,sign};
    }
    faces.push({vertices,points:vertices.map(v=>v.p),depth:vertices.reduce((n,v)=>n+v.d,0)/vertices.length,col,seamless,visible,plane});
   },
   shell=(start,end,palette)=>{
    // Disjoint skin panels: bands are material on the same rounded leather,
    // not long, almost-coplanar tubes fighting the body in the painter pass.
    // Below the mouth, each longitudinal strip is exactly planar: radius,
    // center and depth are affine in t. Keep the curved cross-section and all
    // material boundaries, but paint each straight strip once. The final band
    // crosses the radius clamp at t=1; retain its original stations there.
    const count=end<=1?1:Math.max(1,Math.ceil((end-start)/.045));
    for(let i=0;i<count;i++){
     const left=ring(start+(end-start)*i/count),right=ring(start+(end-start)*(i+1)/count);
     for(let j=0;j<section.length;j++)add([left[j],right[j],right[(j+1)%section.length],left[(j+1)%section.length]],palette[j],true);
    }
   },
   leather=section.map((_,i)=>i<4?'#a76043':i<9?'#985337':'#87462f'),
   band=section.map((_,i)=>i<5?'#593b2c':'#493025');
  if(!quiverShellFaces){
  add(ring(0),'#78432f');
  for(const [start,end,isBand]of [[0,.065,true],[.065,.21,false],[.21,.26,true],
   [.26,.80,false],[.80,.85,true],[.85,.955,false],[.955,1.015,true]])shell(start,end,isBand?band:leather);
  // Recessed opening with a leather rim; arrows emerge from inside this section.
  const outer=ring(1.015),inner=ring(1.018,.72);
  for(let j=0;j<section.length;j++)add([outer[j],outer[(j+1)%section.length],inner[(j+1)%section.length],inner[j]],'#bb7a50',true);
  add(inner,'#38251f');
  quiverShellFaces=faces;
  }
  // Fixed leather panels, bands and rim: project their immutable vertices,
  // rather than rebuilding rings, cross products and material faces per yaw.
  quiverProjection++;
  for(const f of quiverShellFaces){
   for(const v of f.vertices)if(v.projectedAt!==quiverProjection){
    const [x,,z]=v.xyz;v.p[0]=-c*x-s*dir*z;v.d=s*dir*x-c*z;v.projectedAt=quiverProjection;
   }
   const {normal,sign}=f.plane;
   f.depth=f.vertices.reduce((n,v)=>n+v.d,0)/f.vertices.length;
   f.visible=sign*(normal[0]*s*dir-normal[2]*c)>.000001;
  }
  // Sort a shallow copy: equal-depth ties must retain construction order,
  // never the previous angle's order. Vertex/face storage stays bounded.
  faces=quiverShellFaces.slice();
  const ends=[ring(0),ring(1.015)],bodyFaces=[{vertices:ends[0]},{vertices:ends[1]}];
  for(let j=0;j<section.length;j++)bodyFaces.push({vertices:[ends[0][j],ends[1][j],
   ends[1][(j+1)%section.length],ends[0][(j+1)%section.length]]});
  // Occlusion uses the tapered envelope, not every material/raster patch.
  // They describe exactly the same volume; bands need no extra depth tests.
  const shellOutline=gearHull(ends.flat().map(v=>v.p));
  // Clip the physical D-volume against the sheath's local depth plane. Its
  // projection changes continuously through the turn, including both profiles.
  const maskFor=depthAt=>nearSurfaceHull(bodyFaces,depthAt);
  // Stamped lozenge and stitch seams are attached to the curved leather skin.
  // Keep decoration broad/readable; no wood grain or many tiny metal bands.
  const skin=(t,v)=>vertex(t,v,Math.sqrt(Math.max(0,1-v*v))*1.012,1.005);
  shellPass=false;
  // Fixed native arrow solids. Their bright center and dark side strips are
  // disjoint surfaces, not screen-width strokes painted over neighbouring rods.
  if(!quiverArrowTree){
   const arrowFaces=[],bundle=[[-.54,.17,1.28],[-.38,.39,1.39],[-.20,.57,1.31],
    [0,.27,1.45],[.20,.57,1.34],[.38,.39,1.41],[.54,.17,1.30]];
   for(const [arrowId,[v,z,end]]of bundle.entries()){
    const arrowVertex=(t,dv=0,dz=0)=>{
     const spread=Math.max(0,t-1)/.4;
     return vertex(t,v*(1+spread*.24)+dv,z+spread*.22+dz).xyz;
    },addArrow=(vs,col,center)=>{
     let f=surfaceFace(vs,col);if(!f)return;
     if(surfaceDot(f.normal,f.v[0].map((n,i)=>n-center[i]))<0)f=surfaceFace([...vs].reverse(),col);
     // Read-only identity survives BSP splits so an action can take this
     // actual arrow out of the rack without leaving a duplicate behind.
     arrowFaces.push({...f,arrowId});
    },rod=(t0,t1,width,col,highlight=false)=>{
     const r=width/3,h=width/3.75,center=arrowVertex((t0+t1)/2),
      cuts=[t0,...(t0<1&&t1>1?[1]:[]),t1],cross=[-r,-r*.53,r*.53,r];
     for(let i=0;i<cuts.length-1;i++){
      const left=cuts[i],right=cuts[i+1];
      for(const sign of [-1,1])for(let j=0;j<3;j++){
       const a=cross[j],b=cross[j+1];
       addArrow([arrowVertex(left,a,h*sign),arrowVertex(right,a,h*sign),
        arrowVertex(right,b,h*sign),arrowVertex(left,b,h*sign)],highlight&&j===1?'#e6c582':col,center);
      }
      for(const side of [-r,r])addArrow([arrowVertex(left,side,-h),arrowVertex(right,side,-h),
       arrowVertex(right,side,h),arrowVertex(left,side,h)],col,center);
     }
     for(const t of [t0,t1])addArrow([arrowVertex(t,-r,-h),arrowVertex(t,r,-h),
      arrowVertex(t,r,h),arrowVertex(t,-r,h)],col,center);
    },tail=end+.035,start=tail-.175;
    // The buried shaft is not a visible surface. Start at the inner mouth,
    // avoiding antialiased seam leaks through the pouch's rear leather band.
    rod(1.018,start-.023,.32,'#79502e',true);
    rod(start-.023,start+.012,.35,'#37596a');
    const center=arrowVertex((start+tail)/2),
     featherRing=(t,width)=>[[-width,-.055],[0,-.055],[width,-.055],[width,.055],[0,.055],[-width,.055]].map(([dv,dz])=>arrowVertex(t,dv,dz)),
     stations=[[start,.035],[start+.05,.18],[tail-.025,.18],[tail,.05]],
     colours=['#edf4ef','#adc9d8','#bcd3de','#adc9d8','#edf4ef','#d7e6e9'];
    // Preserve the accepted closed feather shape, size and broad colour halves.
    // Exact separating planes replace short centroid-sorted paint fragments.
    for(let i=0;i<stations.length-1;i++){
     const left=featherRing(...stations[i]),right=featherRing(...stations[i+1]);
     for(let side=0;side<6;side++)addArrow([left[side],right[side],right[(side+1)%6],left[(side+1)%6]],colours[side],center);
    }
    addArrow(featherRing(start,.035).filter((_,i)=>i!==1&&i!==4),'#d7e6e9',center);
    addArrow(featherRing(tail,.05).filter((_,i)=>i!==1&&i!==4),'#d7e6e9',center);
    rod(tail-.004,tail+.012,.22,'#395663');
   }
   quiverArrowTree=surfaceTree(arrowFaces);
  }
  faces.sort((x,y)=>x.depth-y.depth);
  rigPolygon(shellOutline,'#985337');
  for(const f of faces.filter(f=>f.visible!==false)){
    rigPolygon(f.points,f.col);
    // Cover subpixel seams between adjacent leather faces, which otherwise
    // look like slats/rings. This is a tiny native edge, not blur or a gradient.
    if(f.seamless){g.save();g.strokeStyle=f.col;g.lineWidth=(f.seamWidth??.075)*U;g.lineJoin='round';g.stroke();g.restore();}
   }
  // Embossed surface lines are not separate nested polygons: sorting those by
  // centroid caused triangular holes in the motif. Clip the skin decoration
  // against the near end cap and foreshorten it to nothing in exact profile.
  if(c<-.001){
   g.save();
   const endCap=gearHull(ring(dir>0?1.02:0,1.045).map(v=>v.p));
   g.beginPath();g.rect(-100*U,-100*U,200*U,200*U);g.moveTo(...endCap[0].map(v=>v*U));
   for(const p of endCap.slice(1))g.lineTo(p[0]*U,p[1]*U);g.closePath();g.clip('evenodd');
   const relief=Math.min(1,-c*2),line=(points,width,col)=>{
    for(let j=0;j<points.length-1;j++)for(let k=0;k<4;k++){
     const p=points[j],q=points[j+1],at=u=>skin(p[0]+(q[0]-p[0])*u,p[1]+(q[1]-p[1])*u).p;
     rigSegment(...at(k/4),...at((k+1)/4),width*relief,col);
    }
   },diamond=[[.34,0],[.51,-.52],[.69,0],[.51,.52],[.34,0]];
   line(diamond,.38,'#673724');line(diamond,.22,'#d39b69');
   line([[.455,-.10],[.51,.14],[.575,-.10]],.22,'#cc9260');
   g.restore();
  }
  drawSurfaceTree(quiverArrowTree,deg,dir,{maskFor,outline:shellOutline},false,.012);
  return {maskFor,outline:shellOutline};
 }
 // Shared vector preparation for both the inspection lab and event actor.
 // Paths remain local to the torso; no angle rounding or raster pose atlas.
 function compileGearPaths(commands){
  if(typeof Path2D!=='function')return commands;
  const output=[],pathMethods=new Set(['moveTo','lineTo','closePath','rect','arc','arcTo','ellipse','bezierCurveTo','quadraticCurveTo']),
   transforms=new Set(['translate','rotate','scale','transform','setTransform','resetTransform','restore']),
   passthrough=new Set(['save',...transforms,'fillRect','strokeRect','clearRect']);
  let path=null,snapshot=null,hasPoints=false,transformChanged=false;
  for(const command of commands){
   const [kind,name,args]=command;
   if(kind===0){output.push(command);continue;}
   if(name==='beginPath'){path=new Path2D();snapshot=null;hasPoints=false;transformChanged=false;continue;}
   if(pathMethods.has(name)){
    if(!path||transformChanged)return commands;
    path[name](...args);snapshot=null;hasPoints=true;continue;
   }
   if(name==='fill'||name==='stroke'||name==='clip'){
    if(!path||transformChanged||args.some(arg=>typeof arg!=='string'))return commands;
    if(!snapshot)snapshot=new Path2D(path);
    output.push([1,name,[snapshot,...args]]);continue;
   }
   if(!passthrough.has(name))return commands;
   if(hasPoints&&transforms.has(name))transformChanged=true;
   output.push(command);
  }
  return output;
 }
 let nativeCacheKey='',nativeCacheUses=0,nativeCacheSource=null;
 const nativePasses=new Map();
 function bodyEquipment(deg,dir,head){
  const signature=[deg,dir,U,equipmentVisible,...['shield','sword','bow','quiver'].map(gearShown)].join(':');
  if(signature!==nativeCacheKey||nativeCacheSource!==KRJonathanWalkEquipment){
   nativeCacheKey=signature;nativeCacheSource=KRJonathanWalkEquipment;nativeCacheUses=0;nativePasses.clear();
  }
  if(!head)nativeCacheUses++;
  if(nativeCacheUses<2)return equipment(deg,dir,'body',head);
  const key=head?'head:'+JSON.stringify([head.x,head.half,head.top,head.bottom]):'body',hit=nativePasses.get(key),target=g;
  if(hit){for(const [kind,name,args]of hit){if(kind===0)target[name]=args;else target[name](...args);}return;}
  if(head&&nativePasses.size>=5)for(const old of nativePasses.keys())if(old!=='body'){nativePasses.delete(old);break;}
  const commands=[],methods=new Map(),recorder=new Proxy(target,{
   get(ctx,name){const value=Reflect.get(ctx,name,ctx);if(typeof value!=='function')return value;
    if(!methods.has(name))methods.set(name,(...args)=>{commands.push([1,name,args]);return value.apply(ctx,args);});
    return methods.get(name);
   },set(ctx,name,value){commands.push([0,name,value]);Reflect.set(ctx,name,value,ctx);return true;}
  });
  try{g=recorder;equipment(deg,dir,'body',head);nativePasses.set(key,compileGearPaths(commands));}finally{g=target;}
 }
 const arrows=(deg,dir)=>equipment(deg,dir,'arrows');
 function armOccluders(deg,dir){
  if(!gearShown('shield')||deg<=90)return [];
  const outline=KRJonathanWalkEquipment.find(r=>r.part==='shield');
  // Include the bowed center in the mask, especially when the rim turns edge-on.
  const points=[...shieldRings(outline.points).flat(),[0,-17.4]].map(([x,y])=>gearPoint('shield',x,y,deg,dir));
  return [gearHull(points)];
 }
 function view(p){const angle=(p.heading%(Math.PI*2)+Math.PI*2)%(Math.PI*2),deg=Math.min(angle,Math.PI*2-angle)*180/Math.PI;
  return {direction:angle>Math.PI?-1:1,degrees:deg};
 }
 let preparation=null,prepared=false;
 function prepare(){
  if(preparation)return preparation;
  preparation=(async()=>{
   // Preparation finishes before the lab/event announces readiness. Yield
   // between parts and views; never keep the global drawing context across await.
   const scratch=document.createElement('canvas');scratch.width=scratch.height=1;
   const ctx=scratch.getContext('2d');
   for(const angle of [0,90,180,270])for(const part of ['quiver','sword','bow','shield']){
    await new Promise(resolve=>setTimeout(resolve,0));
    const target=g;
    try{g=ctx;withEquipmentVisible(true,()=>withEquipmentParts(Object.fromEntries(
     ['quiver','sword','bow','shield'].map(name=>[name,name===part])),()=>equipment(angle>180?360-angle:angle,angle>180?-1:1)));}
    finally{g=target;}
   }
   scratch.width=scratch.height=0;prepared=true;
  })();
  return preparation;
 }
 let gpuRenderer=null;
 function paintActor(ctx,paint){
  if(gpuRenderer){try{return gpuRenderer.paint(ctx,paint);}catch(error){console.warn('Jonathan GPU fallback:',error);gpuRenderer.dispose();gpuRenderer=null;}}
  const old=g;try{g=ctx;paint();}finally{g=old;}
 }
 function actorOptions(o){return gpuRenderer?{...o,solidTurn:true,arrows:undefined,
  equipment:(deg,dir,head)=>{if(equipmentVisible)gpuRenderer.draw(g,deg,dir,Object.fromEntries(['quiver','sword','bow','shield'].map(p=>[p,gearShown(p)])),U,head);}}:o;}
 window.KRJonathanWalk=Object.freeze({info:pose,sceneTime,playbackTime,extraDuration:1.9,view:t=>view(pose(t)),equipment,arrows,bodyEquipment,harness,armOccluders,withEquipmentVisible,withEquipmentParts,compileGearPaths,prepare,
  setGpu:renderer=>{gpuRenderer=renderer;},paintForeground:paint=>paintActor(g,paint),gpuStats:()=>gpuRenderer?.stats()||null,
  // Shared read adapter: use the accepted mesh, never a second prop design.
  // prepare() has already built these immutable attachment-space surfaces.
  labMeshes:()=>{
   const flatten=tree=>tree?[...tree.on,...flatten(tree.front),...flatten(tree.back)]:[];
   // Leather embossing follows the actual curved shell, with a small physical
   // relief. These are surface ribbons, not screen-space lines or texture paint.
   const decoration=[],skin=(t,v,lift)=>{
    const r=1.2+.3*Math.min(t,1),z=Math.sqrt(Math.max(0,1-v*v));
    return [-3.9+9.2*t+v*r*.075,-11.15-.72*t+v*r,gearParts.quiver.depth+z*r*1.25+lift];
   },line=(points,width,col,lift)=>{
    for(let j=0;j<points.length-1;j++)for(let k=0;k<8;k++){
     const p=points[j],q=points[j+1],dx=(q[0]-p[0])*9.2,dy=(q[1]-p[1])*1.4,
      length=Math.hypot(dx,dy),dt=-dy/length*width/18.4,dv=dx/length*width/2.8,
      at=(u,s)=>skin(p[0]+(q[0]-p[0])*u+dt*s,p[1]+(q[1]-p[1])*u+dv*s,lift);
     decoration.push({v:[at(k/8,-1),at((k+1)/8,-1),at((k+1)/8,1),at(k/8,1)],normal:[0,0,1],col,layer:0});
    }
   },diamond=[[.34,0],[.51,-.52],[.69,0],[.51,.52],[.34,0]];
   line(diamond,.38,'#673724',.035);line(diamond,.22,'#d39b69',.05);
   line([[.455,-.10],[.51,.14],[.575,-.10]],.22,'#cc9260',.05);
   return {
    shield:flatten(shieldSurfaceTree),sword:flatten(swordSurfaceTree),
    bow:(mountedWeaponSurfaces.get('bow')||[]).map(f=>({v:f.vertices,col:f.col,normal:[f.nx,0,f.nz],layer:0})),
    quiver:[...quiverShellFaces.map(f=>({v:f.vertices.map(v=>v.xyz),col:f.col,
     normal:f.plane.normal.map(n=>n*f.plane.sign),layer:0})),...flatten(quiverArrowTree),...decoration]
   };
  },
  preparationStats:()=>({prepared,packedShield}),
  equipmentCacheStats:()=>({entries:nativePasses.size,commands:[...nativePasses.values()].reduce((n,c)=>n+c.length,0)}),
  draw(ctx,t,playback){const p=pose(t,playback),v=view(p),o={clock:t,breath:false,lighting:'daylight',body:{x:0,y:p.drop,lean:p.lean||0},legs:p.legs,
    arms:p.arms,gaze:{x:p.glance*3},...v,equipment:bodyEquipment,arrows,harness,armOccluders};
   paintActor(ctx,()=>{
    g.save();g.fillStyle='rgba(20,27,27,.2)';g.beginPath();g.ellipse(p.x,p.y+2,20,5,0,0,Math.PI*2);g.fill();g.restore();
    KRJonathan.turnDrawing(p.x,p.y,2.2,actorOptions(o));
   });
  },drawPull(p,t){
   const hip=-12+p.body.y,arms=p.arms.map(a=>({...a,sy:a.sy+hip,ey:a.ey+hip,hy:a.hy+hip}));
   paintActor(g,()=>KRJonathan.turnDrawing(p.x,p.y,p.scale,actorOptions({clock:t,lighting:'daylight',body:p.body,
    arms,legs:p.legs,gaze:p.gaze,degrees:0,direction:1,equipment:bodyEquipment,arrows,harness,armOccluders})));
  },stats(){return {frames:data.frames.length,kind:gpuRenderer?'webgl-actor':'native-2d',images:0,actorPasses:1};}
 });
})();
