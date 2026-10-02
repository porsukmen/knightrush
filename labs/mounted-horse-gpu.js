/* Shared gameplay/Lab solid mesh. Real depth testing for overlapping saddle,
 * mane, joints and coat; no average-face painter sort for horse surfaces. */
(()=>{'use strict';
 function create(meshes={}){const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:true,stencil:true,premultipliedAlpha:true});if(!gl)throw Error('At için WebGL açılamadı');
  if(gl.getParameter(gl.STENCIL_BITS)<8)throw Error('Mounted equipment depth requires an 8-bit stencil buffer');
  const shaders=[],program=gl.createProgram(),buffer=gl.createBuffer(),colours=new Map(),gearParts={};let capacity=0,data=new Float32Array(32768),lost=false;
  const loss=e=>{e.preventDefault();lost=true;};canvas.addEventListener('webglcontextlost',loss);
  function shader(type,source){const s=gl.createShader(type);shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
  gl.attachShader(program,shader(gl.VERTEX_SHADER,`attribute vec3 position;attribute vec3 colour;attribute float overlay;uniform vec2 yaw;uniform vec2 size;uniform vec4 view;uniform vec2 viewOrigin;uniform float gearPass;uniform float riderOrigin;uniform float riderSteer;uniform vec3 actionBody;uniform float duckPitch;uniform vec3 gearOffset;varying vec3 rgb;varying vec3 projected;varying float front;varying float facing;
   void main(){float d=position.z*yaw.x-position.x*yaw.y;vec2 p=vec2(position.x*yaw.x+position.z*yaw.y,-position.y+d*.16);facing=1.;
    if(gearPass>.5){d=position.x*yaw.y-position.z*yaw.x;p=vec2(-position.x*yaw.x-position.z*yaw.y,position.y-riderOrigin+d*.16);facing=yaw.y*colour.x-yaw.x*colour.y-.16*colour.z;
     if(actionBody.x!=0.||actionBody.y!=0.){float hip=-riderOrigin-12.;vec2 q=p-vec2(0.,hip);float c=cos(actionBody.z),s=sin(actionBody.z);p=vec2(q.x*c-q.y*s,q.x*s+q.y*c+hip);
      vec3 v=vec3(-position.x,-12.-position.y,-position.z);float x=v.x*cos(actionBody.y)-v.y*sin(actionBody.y),y=v.x*sin(actionBody.y)+v.y*cos(actionBody.y),z=y*sin(actionBody.x)+v.z*cos(actionBody.x);d=z*yaw.x-x*yaw.y;}
     if(duckPitch!=0.){vec3 v=position+gearOffset;float c=cos(duckPitch),s=sin(duckPitch),py=(12.+v.y)*c-v.z*s-12.,pz=(12.+v.y)*s+v.z*c;d=v.x*yaw.y-pz*yaw.x;p=vec2(-v.x*yaw.x-pz*yaw.y,py-riderOrigin+d*.16);facing=yaw.y*colour.x-yaw.x*(colour.z*s+colour.y*c)-.16*(colour.z*c-colour.y*s);}}
    if(gearPass>.5&&riderSteer!=0.){float hip=-riderOrigin-12.,c=cos(riderSteer),s=sin(riderSteer);vec2 q=p-vec2(0.,hip);p=vec2(q.x*c-q.y*s,q.x*s+q.y*c+hip);}
    projected=vec3(p,d);p=vec2(p.x*view.x+p.y*view.z,p.x*view.y+p.y*view.w)+viewOrigin;gl_Position=vec4(p.x/size.x*2.-1.,1.-p.y/size.y*2.,-d/128.,1.);rgb=colour;front=overlay;}`));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision highp float;varying vec3 rgb;varying vec3 projected;varying float front;varying float facing;uniform float gearPass;uniform float foreground;uniform vec4 limbStart[6];uniform vec4 limbEnd[6];uniform vec2 pixelHalfSize;
   // The actor's MSAA can colour a sample even when the pixel centre is just
   // outside a limb. Test the pixel footprint against the real quad rather
   // than enlarging its physical width/depth by a fixed world-space amount.
   bool segmentCoverage(vec2 q,vec2 delta,float halfWidth){
    float len=max(length(delta),.0001);vec2 axis=delta/len,normal=vec2(-axis.y,axis.x),mid=q-delta*.5;
    return abs(dot(mid,axis))<=len*.5+dot(abs(axis),pixelHalfSize)&&
     abs(dot(mid,normal))<=halfWidth+dot(abs(normal),pixelHalfSize)&&
     all(lessThanEqual(abs(mid),abs(delta)*.5+abs(normal)*halfWidth+pixelHalfSize));
   }
   void main(){if(gearPass>.5){if(facing<=.0000001)discard;gl_FragColor=vec4(0.);return;}if(foreground>.5){
    float riderDepth=-128.,fringeDepth=-128.;
    for(int i=0;i<6;i++){vec2 delta=limbEnd[i].xy-limbStart[i].xy,q=projected.xy-limbStart[i].xy;float length2=max(dot(delta,delta),.0001),u=dot(q,delta)/length2,t=clamp(u,0.,1.);bool covered=false,sampled=false;
     if(i==0||i==3){
      // Preserve the short hip-link allowance at the root only. Extending
      // that disc down the whole thigh also exposed the far knee's edge.
      float crossDistance=delta.x*q.y-delta.y*q.x;
      covered=length(q)<1.22||(u>=0.&&u<=1.&&crossDistance*crossDistance<=limbStart[i].w*limbStart[i].w*length2);
      sampled=length(q)<1.22||segmentCoverage(q,delta,limbStart[i].w);
      vec2 knee=abs(projected.xy-limbEnd[i].xy);
      if(all(lessThanEqual(knee,vec2(.925))))riderDepth=max(riderDepth,limbEnd[i].z+limbEnd[i].w);
      if(all(lessThanEqual(knee,vec2(.925)+pixelHalfSize)))fringeDepth=max(fringeDepth,limbEnd[i].z+limbEnd[i].w);
     }else if(i==1||i==4){
      // Native rigSegment is a butt-ended quad. An inflated capsule protected
      // the far greave's silver edge outside the near greave's real silhouette.
      float crossDistance=delta.x*q.y-delta.y*q.x;
      covered=u>=0.&&u<=1.&&crossDistance*crossDistance<=limbStart[i].w*limbStart[i].w*length2;
      sampled=segmentCoverage(q,delta,limbStart[i].w);
     }else{
      // Union of the native flat boot and its wider steel toe strip.
      covered=(q.x>=-.9&&q.x<=.9&&q.y>=-1.05&&q.y<=1.15)||(q.x>=-1.08&&q.x<=1.07&&q.y>=.2&&q.y<=.9);
      sampled=(q.x>=-.9-pixelHalfSize.x&&q.x<=.9+pixelHalfSize.x&&q.y>=-1.05-pixelHalfSize.y&&q.y<=1.15+pixelHalfSize.y)||
       (q.x>=-1.08-pixelHalfSize.x&&q.x<=1.07+pixelHalfSize.x&&q.y>=.2-pixelHalfSize.y&&q.y<=.9+pixelHalfSize.y);
     }
     if(covered)riderDepth=max(riderDepth,mix(limbStart[i].z,limbEnd[i].z,t)+limbEnd[i].w);
     if(sampled)fringeDepth=max(fringeDepth,mix(limbStart[i].z,limbEnd[i].z,t)+limbEnd[i].w);
    }
    // Never promote an AA fringe over a real limb surface: doing so would
    // reintroduce the far shin strip alongside the near leg at profile yaw.
    if(riderDepth<-127.)riderDepth=fringeDepth;
    if(riderDepth>-127.){if(projected.z<=riderDepth+.025)discard;}
    else if(foreground<1.5&&(front<.5||projected.z<=2.4))discard;
   }gl_FragColor=vec4(rgb,1.);}`));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  const pos=gl.getAttribLocation(program,'position'),col=gl.getAttribLocation(program,'colour'),overlay=gl.getAttribLocation(program,'overlay'),yaw=gl.getUniformLocation(program,'yaw'),size=gl.getUniformLocation(program,'size'),view=gl.getUniformLocation(program,'view'),foregroundUniform=gl.getUniformLocation(program,'foreground'),limbStart=gl.getUniformLocation(program,'limbStart[0]'),limbEnd=gl.getUniformLocation(program,'limbEnd[0]');
  const riderSteer=gl.getUniformLocation(program,'riderSteer'),viewOrigin=gl.getUniformLocation(program,'viewOrigin'),gearPass=gl.getUniformLocation(program,'gearPass'),riderOrigin=gl.getUniformLocation(program,'riderOrigin'),pixelHalfSize=gl.getUniformLocation(program,'pixelHalfSize'),actionBody=gl.getUniformLocation(program,'actionBody'),duckPitch=gl.getUniformLocation(program,'duckPitch'),gearOffset=gl.getUniformLocation(program,'gearOffset');
  // Reuse the exact approved equipment faces, uploaded once. In this pass the
  // colour slots carry the same normalized X/Z/Y face normal as Jonathan's GPU.
  // The mounted colour renderer opts into the same .16 camera-depth shear.
  // Depth and colour therefore share one rigid rider-local attachment space.
  for(const name of ['quiver','sword','bow','shield']){
   const values=[];for(const face of meshes[name]||[]){const n=face.normal,length=Math.hypot(n[0],n[2])||1;
    for(let i=1;i<face.v.length-1;i++)for(const p of [face.v[0],face.v[i],face.v[i+1]])values.push(...p,n[0]/length,n[2]/length,n[1]/length,0);
   }
   const values32=new Float32Array(values),b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,values32,gl.STATIC_DRAW);
   gearParts[name]={buffer:b,count:values32.length/7,bytes:values32.byteLength};
  }
  const bind=b=>{gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,28,0);gl.enableVertexAttribArray(col);gl.vertexAttribPointer(col,3,gl.FLOAT,false,28,12);gl.enableVertexAttribArray(overlay);gl.vertexAttribPointer(overlay,1,gl.FLOAT,false,28,24);};
  const starts=new Float32Array(24),ends=new Float32Array(24);
  let packedFaces=null,packedAngle=NaN,packedUsed=0,packedBounds=null,packedRevision=null,packedRear=false,worldBounds=null;
  return {draw(ctx,faces,angle,scale,cx,cy,foreground=false,visible={},reuseFrame=false,rearOnly=false){if(lost)throw Error('At GPU bağlantısı kesildi; labı yenile.');
   const w=ctx.canvas.width,h=ctx.canvas.height;if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
   const a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a),rear=rearOnly&&Math.abs(((angle%360)+360)%360-180)<=10,
    reuse=faces===packedFaces&&rear===packedRear&&(rear||angle===packedAngle)&&(!!foreground&&reuseFrame||Number.isFinite(faces.renderRevision)&&faces.renderRevision===packedRevision);
   let used=reuse?packedUsed:0,minX=reuse?packedBounds[0]:Infinity,minY=reuse?packedBounds[1]:Infinity,maxX=reuse?packedBounds[2]:-Infinity,maxY=reuse?packedBounds[3]:-Infinity;
   // Raw meshes always repack. Controlled pose caches can prove their exact
   // revision is unchanged, including a stationary horse under moving arms.
   if(!reuse&&rear)worldBounds=[Infinity,Infinity,Infinity,-Infinity,-Infinity,-Infinity];
   if(!reuse)for(const f of faces){if(!rear&&f.v.length===3&&-f.n[0]*s+f.n[1]*.16+f.n[2]*c<=1e-8)continue;
    for(const v of f.v){if(rear){for(let j=0;j<3;j++){worldBounds[j]=Math.min(worldBounds[j],v[j]);worldBounds[j+3]=Math.max(worldBounds[j+3],v[j]);}}else{const d=v[2]*c-v[0]*s,x=v[0]*c+v[2]*s,y=-v[1]+d*.16;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}}
    const front=['neck','head','mane'].includes(f.tag)?1:0;
    let rgb=colours.get(f.col);if(!rgb){rgb=[1,3,5].map(i=>parseInt(f.col.slice(i,i+2),16)/255);colours.set(f.col,rgb);}
    const need=used+(f.v.length-2)*21;if(need>data.length){const n=new Float32Array(Math.max(need,data.length*2));n.set(data);data=n;}
    for(let i=1;i<f.v.length-1;i++){
     // A bent quad/cap is no longer planar. Its first triangle cannot decide
     // visibility for the entire face: that made the loaded chest disappear.
     // Keep the authored material colour but cull each actual triangle.
     if(!rear&&f.v.length>3){const a=f.v[0],b=f.v[i],d=f.v[i+1],
      ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=d[0]-a[0],vy=d[1]-a[1],vz=d[2]-a[2],
      nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,norm=Math.hypot(nx,ny,nz);
      if(!norm||(-nx*s+ny*.16+nz*c)/norm<=1e-8)continue;
     }
     for(let j=0;j<3;j++){const p=f.v[j===0?0:j===1?i:i+1];data[used++]=p[0];data[used++]=p[1];data[used++]=p[2];data[used++]=rgb[0];data[used++]=rgb[1];data[used++]=rgb[2];data[used++]=front;}
    }
   }
   if(rear){minX=minY=Infinity;maxX=maxY=-Infinity;for(const x of [worldBounds[0],worldBounds[3]])for(const y of [worldBounds[1],worldBounds[4]])for(const z of [worldBounds[2],worldBounds[5]]){const px=x*c+z*s,py=-y+(z*c-x*s)*.16;minX=Math.min(minX,px);maxX=Math.max(maxX,px);minY=Math.min(minY,py);maxY=Math.max(maxY,py);}}
   const m=ctx.getTransform(),bounds=[[minX,minY],[maxX,minY],[maxX,maxY],[minX,maxY]].map(([x,y])=>({x:(cx+x*scale)*m.a+(cy+y*scale)*m.c+m.e,y:(cx+x*scale)*m.b+(cy+y*scale)*m.d+m.f})),
    left=Math.max(0,Math.floor(Math.min(...bounds.map(v=>v.x)))-2),top=Math.max(0,Math.floor(Math.min(...bounds.map(v=>v.y)))-2),right=Math.min(w,Math.ceil(Math.max(...bounds.map(v=>v.x)))+2),bottom=Math.min(h,Math.ceil(Math.max(...bounds.map(v=>v.y)))+2);
   if(right<=left||bottom<=top){packedFaces=null;return;}
   gl.viewport(0,0,w,h);gl.enable(gl.SCISSOR_TEST);gl.scissor(left,h-bottom,right-left,bottom-top);gl.colorMask(true,true,true,true);gl.depthMask(true);gl.stencilMask(255);gl.disable(gl.STENCIL_TEST);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.BLEND);gl.disable(gl.DITHER);gl.useProgram(program);gl.uniform1f(gearPass,0);
   gl.uniform2f(yaw,c,s);gl.uniform2f(size,w,h);
   gl.uniform4f(view,scale*m.a,scale*m.b,scale*m.c,scale*m.d);gl.uniform2f(viewOrigin,cx*m.a+cy*m.c+m.e,cx*m.b+cy*m.d+m.f);
   const determinant=Math.max(.0001,Math.abs(scale*(m.a*m.d-m.b*m.c)));
   gl.uniform2f(pixelHalfSize,.5*(Math.abs(m.d)+Math.abs(m.c))/determinant,.5*(Math.abs(m.b)+Math.abs(m.a))/determinant);
   if(foreground){
    let i=0;const segment=(a,b,radius,depthRadius)=>{starts.set([...foreground.project(a),foreground.depth(a),radius],i);ends.set([...foreground.project(b),foreground.depth(b),depthRadius],i);i+=4;};
    for(const leg of foreground.riderLegs){
     segment(leg.root,leg.joint,1.025,.75);segment(leg.joint,leg.end,.825,.7);
     segment(leg.end,leg.end,1.08,.85);
    }
    gl.uniform4fv(limbStart,starts);gl.uniform4fv(limbEnd,ends);
   }
   gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
   if(!reuse){if(used*4>capacity){capacity=Math.max(65536,2**Math.ceil(Math.log2(used*4)));gl.bufferData(gl.ARRAY_BUFFER,capacity,gl.DYNAMIC_DRAW);}gl.bufferSubData(gl.ARRAY_BUFFER,0,data.subarray(0,used));}
   packedFaces=faces;packedAngle=angle;packedUsed=used;packedBounds=[minX,minY,maxX,maxY];packedRevision=faces.renderRevision;packedRear=rear;
   bind(buffer);
   // Rear gameplay has only a small lane yaw. Let the GPU cull triangles,
   // retaining the same uploaded mesh across those camera-angle changes.
   if(rear){gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.frontFace(m.a*m.d-m.b*m.c>=0?gl.CCW:gl.CW);}else gl.disable(gl.CULL_FACE);
   // Establish the complete outer shell first. Otherwise a hidden mane/tack
   // face can leak through a nearer surface discarded by the rider mask.
   gl.uniform1f(foregroundUniform,0);if(foreground)gl.colorMask(false,false,false,false);gl.drawArrays(gl.TRIANGLES,0,used/7);
   if(foreground){
    // Mark actual gear coverage even behind the horse (depth-fail REPLACE),
    // while depth writes retain the nearer of horse shell / equipment. This
    // protects a near quiver from the leg mask and permits a near saddle to
    // cover a far quiver outside that mask. Never paint every prop on top.
    gl.disable(gl.CULL_FACE);gl.enable(gl.STENCIL_TEST);gl.stencilFunc(gl.ALWAYS,1,255);gl.stencilOp(gl.KEEP,gl.REPLACE,gl.REPLACE);
    gl.uniform1f(gearPass,1);gl.uniform1f(riderOrigin,foreground.seat-12);
    gl.uniform1f(riderSteer,foreground.steering?.lean||0);
     gl.uniform3f(actionBody,foreground.actionBody?.pitch||0,foreground.actionBody?.roll||0,foreground.actionBody?.lean||0);
     const upperPose=foreground.steering?.upperPose||foreground.duck;
     gl.uniform1f(duckPitch,upperPose?.pitch||0);
    const riderAngle=(angle+(foreground.actionBody?.yaw||0))*Math.PI/180;gl.uniform2f(yaw,Math.cos(riderAngle),Math.sin(riderAngle));
    for(const [name,part]of Object.entries(gearParts))if(visible[name]!==false&&part.count&&!(name==='bow'&&foreground.bow?.renderBow)&&!(name==='shield'&&foreground.shield?.renderShield)){const offset=upperPose?.gearOffset??(name==='shield'?upperPose?.shieldOffset:null);gl.uniform3f(gearOffset,offset?.[0]||0,offset?.[1]||0,offset?.[2]||0);bind(part.buffer);gl.drawArrays(gl.TRIANGLES,0,part.count);}
    gl.uniform2f(yaw,c,s);bind(buffer);gl.uniform1f(gearPass,0);gl.colorMask(true,true,true,true);gl.disable(gl.STENCIL_TEST);if(rear)gl.enable(gl.CULL_FACE);
    gl.uniform1f(foregroundUniform,1);gl.drawArrays(gl.TRIANGLES,0,used/7);
    gl.enable(gl.STENCIL_TEST);gl.stencilMask(0);gl.stencilFunc(gl.EQUAL,1,255);gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);
    gl.uniform1f(foregroundUniform,2);gl.drawArrays(gl.TRIANGLES,0,used/7);gl.disable(gl.STENCIL_TEST);
   }
   ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(canvas,left,top,right-left,bottom-top,left,top,right-left,bottom-top);ctx.restore();
  },dispose(){canvas.removeEventListener('webglcontextlost',loss);gl.deleteBuffer(buffer);for(const p of Object.values(gearParts))gl.deleteBuffer(p.buffer);gl.deleteProgram(program);for(const s of shaders)gl.deleteShader(s);gl.getExtension('WEBGL_lose_context')?.loseContext();canvas.width=canvas.height=1;},stats:()=>({lost,dynamicBytes:capacity,gearDepthBytes:Object.values(gearParts).reduce((n,p)=>n+p.bytes,0)})};
 }
 window.KRMountedHorseGPU={create};
})();
