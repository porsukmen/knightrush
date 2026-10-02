/* Lab-only action overlay. A separate depth pass lets a held prop cross the
 * existing native actor, tack and horse without changing their renderers. */
(()=>{'use strict';
 function create(){
  const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:true,premultipliedAlpha:true});
  if(!gl)throw Error('Aksiyon GPU yüzeyi açılamadı.');
  const shaders=[],program=gl.createProgram(),buffer=gl.createBuffer(),gearBuffers=new Map();let lost=false,capacity=0,frames=0;
  const loss=e=>{e.preventDefault();lost=true;};canvas.addEventListener('webglcontextlost',loss);
  const shader=(type,source)=>{const s=gl.createShader(type);shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  gl.attachShader(program,shader(gl.VERTEX_SHADER,`attribute vec3 position;attribute vec3 colour;attribute vec3 sheathLocal;attribute float blade;uniform vec2 size;uniform vec4 view;uniform vec2 viewOrigin;uniform vec2 yaw;uniform vec4 body;uniform float gear;uniform float rigidBody;uniform float bowCover;varying vec3 rgb;varying vec3 local;varying float isBlade;
   void main(){vec3 q=position;
    if(gear>.5){vec3 v=vec3(-position.x,-12.-position.y,-position.z);float d=v.z*yaw.x-v.x*yaw.y;
     vec2 screen=vec2(v.x*yaw.x+v.z*yaw.y,-v.y+d*.16);float c=cos(body.z),s=sin(body.z);
     q.xy=vec2(screen.x*c-screen.y*s,screen.x*s+screen.y*c-body.w);
     float x=v.x*cos(body.y)-v.y*sin(body.y),y=v.x*sin(body.y)+v.y*cos(body.y);
     q.z=(y*sin(body.x)+v.z*cos(body.x))*yaw.x-x*yaw.y;
     if(rigidBody>.5){vec3 r=vec3(x,y*cos(body.x)-v.z*sin(body.x),y*sin(body.x)+v.z*cos(body.x));q.xy=vec2(r.x*yaw.x+r.z*yaw.y,-r.y+q.z*.16-body.w);}
     if(bowCover>.5)q.z=120.;
    }
    vec2 p=vec2(q.x*view.x+q.y*view.z,q.x*view.y+q.y*view.w)+viewOrigin;gl_Position=vec4(p.x/size.x*2.-1.,1.-p.y/size.y*2.,-q.z/128.,1.);rgb=colour;local=sheathLocal;isBlade=blade;}`));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision highp float;varying vec3 rgb;varying vec3 local;varying float isBlade;uniform float opacity;void main(){if(isBlade>.5&&local.x>=-.04&&local.x<12.&&abs(local.y)<.96&&abs(local.z)<.66)discard;gl_FragColor=vec4(rgb*opacity,opacity);}'));
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  const pos=gl.getAttribLocation(program,'position'),col=gl.getAttribLocation(program,'colour'),sheathLocal=gl.getAttribLocation(program,'sheathLocal'),blade=gl.getAttribLocation(program,'blade'),size=gl.getUniformLocation(program,'size'),view=gl.getUniformLocation(program,'view'),opacity=gl.getUniformLocation(program,'opacity'),colours=new Map();
  const viewOrigin=gl.getUniformLocation(program,'viewOrigin'),gearUniform=gl.getUniformLocation(program,'gear'),yawUniform=gl.getUniformLocation(program,'yaw'),bodyUniform=gl.getUniformLocation(program,'body'),rigidUniform=gl.getUniformLocation(program,'rigidBody'),bowCoverUniform=gl.getUniformLocation(program,'bowCover');
  const depthValues={data:new Float32Array(262144),used:0},colourValues={data:new Float32Array(8192),used:0},trailValues={data:new Float32Array(128),used:0};
  const reserve=(target,count)=>{if(target.used+count>target.data.length){const next=new Float32Array(Math.max(target.used+count,target.data.length*2));next.set(target.data);target.data=next;}};
  function gearBuffer(faces){let part=gearBuffers.get(faces);if(part)return part;const count=faces.reduce((n,f)=>n+(f.v.length-2)*3,0),values=new Float32Array(count*10);let k=0;
   for(const f of faces)for(let i=1;i<f.v.length-1;i++)for(const v of [f.v[0],f.v[i],f.v[i+1]]){values.set(v,k);k+=10;}
   const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,values,gl.STATIC_DRAW);part={buffer:b,count,bytes:values.byteLength};gearBuffers.set(faces,part);return part;
  }
  const bind=b=>{gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,40,0);gl.enableVertexAttribArray(col);gl.vertexAttribPointer(col,3,gl.FLOAT,false,40,12);gl.enableVertexAttribArray(sheathLocal);gl.vertexAttribPointer(sheathLocal,3,gl.FLOAT,false,40,24);gl.enableVertexAttribArray(blade);gl.vertexAttribPointer(blade,1,gl.FLOAT,false,40,36);};
  function rgb(colour){let c=colours.get(colour);if(c)return c;
   c=colour.startsWith('#')?[1,3,5].map(i=>parseInt(colour.slice(i,i+2),16)/255):(colour.match(/[\d.]+/g)||[]).slice(0,3).map(v=>Number(v)/255);
   if(c.length!==3||c.some(v=>!Number.isFinite(v)))throw Error('Invalid action material '+colour);colours.set(colour,c);return c;
  }
  function draw(ctx,p,weapon,horse,meshes,visible,unit,cx,cy,trails=[]){
   if(lost)throw Error('Aksiyon GPU bağlantısı kesildi; labı yenile.');
   if(!weapon.length)return;
   const w=ctx.canvas.width,h=ctx.canvas.height;if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
   const depth=depthValues,colour=colourValues;depth.used=colour.used=0;
   const project=v=>[...p.project(v),p.depth(v)],
    upperProject=(v,screen=p.project(v))=>{const b=p.actionBody;if(!b)return [...screen,p.depth(v)];if(b.rigidProjection)return project(b.upper(v));
     const x=screen[0]-b.hip[0],y=screen[1]-b.hip[1],c=Math.cos(b.lean),s=Math.sin(b.lean);
     return [b.hip[0]+x*c-y*s,b.hip[1]+x*s+y*c,p.depth(b.upper(v))];},
    polygon=(target,points,c=[0,0,0],locals=null,isBlade=0)=>{reserve(target,(points.length-2)*30);const a=target.data;let k=target.used;
     for(let i=1;i<points.length-1;i++)for(let corner=0;corner<3;corner++){const j=corner===0?0:corner===1?i:i+1,v=points[j],l=locals?.[j];a[k++]=v[0];a[k++]=v[1];a[k++]=v[2];a[k++]=c[0];a[k++]=c[1];a[k++]=c[2];a[k++]=l?.[0]||0;a[k++]=l?.[1]||0;a[k++]=l?.[2]||0;a[k++]=isBlade;}target.used=k;};
   // A depth-only horse face outside the held prop's bounds cannot occlude
   // any of its pixels. Include trails and a native-unit antialias margin.
   let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
   for(const f of [...weapon,...trails])for(const v of f.v){const q=p.project(v);minX=Math.min(minX,q[0]-1);maxX=Math.max(maxX,q[0]+1);minY=Math.min(minY,q[1]-1);maxY=Math.max(maxY,q[1]+1);}
   const transform=ctx.getTransform(),bounds=[[minX,minY],[maxX,minY],[maxX,maxY],[minX,maxY]].map(([x,y])=>({x:(cx+x*unit)*transform.a+(cy+y*unit)*transform.c+transform.e,y:(cx+x*unit)*transform.b+(cy+y*unit)*transform.d+transform.f})),
    left=Math.max(0,Math.floor(Math.min(...bounds.map(v=>v.x)))-2),top=Math.max(0,Math.floor(Math.min(...bounds.map(v=>v.y)))-2),
    right=Math.min(w,Math.ceil(Math.max(...bounds.map(v=>v.x)))+2),bottom=Math.min(h,Math.ceil(Math.max(...bounds.map(v=>v.y)))+2);
   if(right<=left||bottom<=top)return;
   if(visible.horse){const a=p.angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
    for(const f of horse){let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
     for(const v of f.v){const d=v[2]*c-v[0]*s,x=v[0]*c+v[2]*s,y=-v[1]+d*.16;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
     if(x1<minX||x0>maxX||y1<minY||y0>maxY)continue;
     reserve(depth,(f.v.length-2)*30);const data=depth.data;let k=depth.used;
     for(let i=1;i<f.v.length-1;i++)for(let corner=0;corner<3;corner++){const v=f.v[corner===0?0:corner===1?i:i+1],d=v[2]*c-v[0]*s;data[k]=v[0]*c+v[2]*s;data[k+1]=-v[1]+d*.16;data[k+2]=d;k+=10;}depth.used=k;
    }
   }
   // Torso and helmet colour remain the shared native model. Depth proxies
   // use its broad rigid volumes, with native vertical coordinates (the
   // native torso/helmet do not apply the limbs' .16 depth shear).
   const ring=(half,deep,chamfer,y,head=false)=>[[-half+chamfer,-deep],[half-chamfer,-deep],[half,-deep+chamfer],[half,deep-chamfer],[half-chamfer,deep],[-half+chamfer,deep],[-half,deep-chamfer],[-half,-deep+chamfer]]
    .map(([x,z])=>{if(head&&p.actionBody.rigidProjection){const r=p.native.gaze.rigid,v=[x,y-12,-z],q=r.project(v);return [q[0]+p.origin[0],q[1]+p.origin[1],r.depth(v)];}const v=[x,p.seat-y,z];return upperProject(v,[p.project(v)[0],p.origin[1]+y-12]);}),
    volume=(a,b)=>{polygon(depth,a);polygon(depth,b);for(let i=0;i<a.length;i++)polygon(depth,[a[i],a[(i+1)%a.length],b[(i+1)%b.length],b[i]]);};
   volume(ring(4.35,2.2,.05,-9.7),ring(2.7,1.95,.05,0));
   volume(ring(1.4,1.4,.05,-14),ring(1.4,1.4,.05,-8.9));
   const helmet=serJonathanHelmetProjection(-27.1,0);
   volume(ring(3.5,3.5,.85,helmet.planeY+12,true),ring(3.5,3.5,.85,helmet.bottomY+12,true));
   // These native details are 2.5D silhouettes, not part of the helmet
   // cuboid or the arm capsules. Match their exact live outlines and lean;
   // only a blade farther from the camera is hidden by these depth surfaces.
   const nativePoint=(x,y,d,head=false)=>{if(head&&p.actionBody.rigidProjection){const r=p.native.gaze.rigid,v=[x,y,0],q=r.project(v);return [p.origin[0]+q[0],p.origin[1]+q[1],r.depth(v)+.45];}const a=p.actionBody.lean,c=Math.cos(a),s=Math.sin(a),dy=y+12;
    return [p.origin[0]+x*c-dy*s,p.origin[1]-12+x*s+dy*c,d];},
    nativeRect=(x,y,w,h,d,head=false)=>polygon(depth,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(q=>nativePoint(...q,d,head))),
    nativeSegment=(a,b,width,d)=>{const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,nx=-dy/len*width/2,ny=dx/len*width/2;
     polygon(depth,[[a[0]+nx,a[1]+ny],[b[0]+nx,b[1]+ny],[b[0]-nx,b[1]-ny],[a[0]-nx,a[1]-ny]].map(q=>nativePoint(...q,d,true)));},
    yaw=p.native.degrees*Math.PI/180,sin=Math.sin(yaw),capWidth=3.05+.3*sin*sin,
    crown=helmet.crownY,sway=Math.sin(p.time*1.8)*.12,plumeDir=1+(-p.native.direction-1)*sin*sin,
    crestDepth=p.depth(p.actionBody.upper([0,p.seat-crown-12,0]))+.45;
   nativeRect(-2,crown,4,.72,crestDepth,true);
   nativeSegment([0,crown],[.2,crown-4.1],1.55,crestDepth);
   nativeSegment([.2,crown-4.1],[(2.8+sway)*plumeDir,crown-6.5],1.9,crestDepth);
   nativeSegment([(2.8+sway)*plumeDir,crown-6.5],[(4.7+sway)*plumeDir,crown-5.4],1.35,crestDepth);
   for(const arm of p.native.arms){const near=arm.walkDepth.shoulder+2.65*Math.abs(Math.cos(yaw))+capWidth/2*Math.abs(sin);
    nativeRect(arm.sx-capWidth/2,arm.sy-1.525,capWidth,3.05,near);}
   const segment=(a,b,r)=>{const x=project(a),y=project(b),dx=y[0]-x[0],dy=y[1]-x[1],len=Math.hypot(dx,dy)||1,nx=-dy/len*r,ny=dx/len*r;
    polygon(depth,[[x[0]+nx,x[1]+ny,x[2]+r],[y[0]+nx,y[1]+ny,y[2]+r],[y[0]-nx,y[1]-ny,y[2]+r],[x[0]-nx,x[1]-ny,x[2]+r]]);},
    square=(v,r,d=r)=>{const [x,y,z]=project(v);polygon(depth,[[x-r,y-r,z+d],[x+r,y-r,z+d],[x+r,y+r,z+d],[x-r,y+r,z+d]]);};
   for(const arm of p.armChains){segment(...(arm.flex?.upper||[arm.root,arm.joint]),1.025);segment(...(arm.flex?.lower||[arm.joint,arm.end]),.825);square(arm.joint,.8);square(arm.end,.825);}
   for(const leg of p.riderLegs){segment(leg.root,leg.joint,1.025);segment(leg.joint,leg.end,.825);square(leg.joint,.925);square(leg.end,1.08);}
   // The blade remains full length. Hide only fragments physically inside the
   // existing scabbard envelope (its tapered shell is narrower near the tip).
   const model=p.sword?.model,mouth=model&&p.actionBody.upper([model.mouth[0],p.seat+model.mouth[1],model.mouth[2]]),axes=model&&[model.u,model.v,model.n].map(p.actionBody.rotate),
    local=v=>model?axes.map(a=>a.reduce((n,x,i)=>n+x*(v[i]-mouth[i]),0)):[0,0,0];
   for(const f of weapon)polygon(colour,f.v.map(v=>{const q=project(v);q[2]+=(f.layer||0)*.00128;return q;}),rgb(f.col),f.v.map(local),f.blade?1:0);
   gl.viewport(0,0,w,h);gl.enable(gl.SCISSOR_TEST);gl.scissor(left,h-bottom,right-left,bottom-top);gl.colorMask(true,true,true,true);gl.depthMask(true);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);gl.disable(gl.DITHER);gl.useProgram(program);
   gl.uniform2f(size,w,h);const m=ctx.getTransform();gl.uniform4f(view,unit*m.a,unit*m.b,unit*m.c,unit*m.d);gl.uniform2f(viewOrigin,cx*m.a+cy*m.c+m.e,cx*m.b+cy*m.d+m.f);
   gl.uniform1f(opacity,1);gl.colorMask(false,false,false,false);gl.uniform1f(gearUniform,1);
   const angle=(p.angle+(p.actionBody.yaw||0))*Math.PI/180;gl.uniform2f(yawUniform,Math.cos(angle),Math.sin(angle));gl.uniform4f(bodyUniform,p.actionBody.pitch,p.actionBody.roll,p.actionBody.lean,p.seat);gl.uniform1f(rigidUniform,p.actionBody.rigidProjection?1:0);
   // Only the requested rear draw/return overlap gets painter priority. The
   // bow's geometry and colour stay in their original attachment position.
   const rear=Math.abs(((p.angle%360)+360)%360-180)<.001,T=KRMountedSword.timing,cover=rear&&p.sword&&(p.sword.time<=T.windupEnd||p.sword.time>=T.recoverEnd);
   for(const name of ['quiver','bow','shield','sword'])if(visible[name]!==false&&!(name==='shield'&&p.shield?.renderShield)&&!(name==='bow'&&p.bow?.renderBow)){const part=gearBuffer(name==='sword'&&model?model.sheath:name==='quiver'&&p.bow?.renderBow?p.bow.model.quiver:meshes[name]);bind(part.buffer);gl.uniform1f(bowCoverUniform,name==='bow'&&cover?1:0);gl.drawArrays(gl.TRIANGLES,0,part.count);}
   gl.uniform1f(gearUniform,0);gl.uniform1f(bowCoverUniform,0);bind(buffer);
   const submit=values=>{const data=values.data.subarray(0,values.used);if(data.byteLength>capacity){capacity=2**Math.ceil(Math.log2(data.byteLength));gl.bufferData(gl.ARRAY_BUFFER,capacity,gl.DYNAMIC_DRAW);}gl.bufferSubData(gl.ARRAY_BUFFER,0,data);gl.drawArrays(gl.TRIANGLES,0,data.length/10);};
   gl.uniform1f(opacity,1);gl.colorMask(false,false,false,false);submit(depth);gl.colorMask(true,true,true,true);
   if(trails.length){gl.depthMask(false);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
    for(const f of trails){trailValues.used=0;polygon(trailValues,f.v.map(project),rgb(f.col));gl.uniform1f(opacity,f.alpha);submit(trailValues);}
    gl.depthMask(true);gl.disable(gl.BLEND);gl.uniform1f(opacity,1);
   }
   submit(colour);
   ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(canvas,left,top,right-left,bottom-top,left,top,right-left,bottom-top);ctx.restore();frames++;
  }
  return {draw,stats:()=>({frames,capacity,lost,gearDepthBytes:[...gearBuffers.values()].reduce((n,p)=>n+p.bytes,0)}),dispose(){canvas.removeEventListener('webglcontextlost',loss);gl.deleteBuffer(buffer);for(const p of gearBuffers.values())gl.deleteBuffer(p.buffer);gearBuffers.clear();for(const s of shaders)gl.deleteShader(s);gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();}};
 }
 window.KRMountedActionGPU={create};
})();
