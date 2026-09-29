/* Shared Jonathan renderer: static equipment, streamed native body triangles.
 * Animation/joints stay on the CPU; all actor rasterization and masks use WebGL.
 * One bounded surface, no pixel readback, texture atlas or second body design. */
(()=>{'use strict';
 const vertexSource=`
 attribute vec3 a_position;
 attribute vec2 a_normal;
 attribute vec3 a_colour;
 attribute float a_layer;
 uniform vec2 u_yaw;
 uniform mat3 u_transform;
 uniform vec2 u_size;
 uniform float u_layerBias;
 varying vec3 v_colour;
 varying vec2 v_view;
 varying float v_depth;
 varying float v_facing;
 void main(){
  float c=u_yaw.x,s=u_yaw.y;
  vec2 p=vec2(-c*a_position.x-s*a_position.z,a_position.y);
  float depth=s*a_position.x-c*a_position.z;
  vec3 screen=u_transform*vec3(p,1.0);
  gl_Position=vec4(screen.x/u_size.x*2.0-1.0,1.0-screen.y/u_size.y*2.0,
   -depth/64.0-a_layer*u_layerBias,1.0);
  v_colour=a_colour;v_view=p;v_depth=depth;
  v_facing=s*a_normal.x-c*a_normal.y;
 }`;
 const fragmentSource=`
 precision highp float;
 uniform vec2 u_yaw;
 uniform vec4 u_head;
 uniform float u_headPass;
 uniform float u_chamfer;
 varying vec3 v_colour;
 varying vec2 v_view;
 varying float v_depth;
 varying float v_facing;
 // Ray/box intersection in the helmet's exact yaw-dependent depth proxy.
 // The Canvas rig supplies the same x/half/top/bottom, and keeps its head clip.
 void main(){
  if(v_facing<=0.0000001)discard;
  if(u_headPass>0.5){
   float c=u_yaw.x,s=u_yaw.y,q=v_view.x-u_head.x;
   if(v_view.y<u_head.z||v_view.y>u_head.w)discard;
   float halfWidth=u_chamfer>0.0?3.5:u_head.y/(abs(c)+abs(s));
   float lo=-1000.0,hi=1000.0;
   if(abs(s)>0.000001){
    float a=(-halfWidth+c*q)/s,b=(halfWidth+c*q)/s;
    lo=max(lo,min(a,b));hi=min(hi,max(a,b));
   }else if(abs(-c*q)>halfWidth)discard;
   if(abs(c)>0.000001){
    float a=(-halfWidth+s*q)/(-c),b=(halfWidth+s*q)/(-c);
    lo=max(lo,min(a,b));hi=min(hi,max(a,b));
   }else if(abs(-s*q)>halfWidth)discard;
   if(u_chamfer>0.0){
    for(int i=0;i<4;i++){
     float nx=i<2?-1.0:1.0,nz=mod(float(i),2.0)<0.5?-1.0:1.0;
     float a=-nx*c*q-nz*s*q,b=nx*s-nz*c;
     if(abs(b)<0.000001){if(a>7.0-u_chamfer)discard;}
     else{float edge=(7.0-u_chamfer-a)/b;if(b>0.0)hi=min(hi,edge);else lo=max(lo,edge);}
    }
   }
   if(lo>hi||v_depth<=hi+0.015)discard;
  }
  gl_FragColor=vec4(v_colour,1.0);
 }`;
 // A deliberately small native-vector adapter, not a Canvas implementation.
 // Every polygon is tessellated once per pose; clip coverage stays in stencil.
 function makeVectorContext(canvas,submit,clipPaths,setMask){
  let state,stack=[],paths=[],path=null,values=new Float32Array(65536),used=0;
  const colours=new Map(),identity=()=>({a:1,b:0,c:0,d:1,e:0,f:0});
  const point=(x,y)=>[state.m.a*x+state.m.c*y+state.m.e,state.m.b*x+state.m.d*y+state.m.f];
  const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  function indices(poly){
   const ids=poly.map((_,i)=>i),out=[];
   let area=0;for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length];area+=p[0]*q[1]-q[0]*p[1];}
   const sign=area<0?-1:1;
   for(let guard=0;ids.length>2&&guard<poly.length*poly.length;guard++){
    let cut=false;
    for(let j=0;j<ids.length;j++){
     const a=ids[(j+ids.length-1)%ids.length],b=ids[j],c=ids[(j+1)%ids.length];
     if(cross(poly[a],poly[b],poly[c])*sign<=1e-8)continue;
     if(ids.some(i=>i!==a&&i!==b&&i!==c&&cross(poly[a],poly[b],poly[i])*sign>1e-7&&cross(poly[b],poly[c],poly[i])*sign>1e-7&&cross(poly[c],poly[a],poly[i])*sign>1e-7))continue;
     out.push(a,b,c);ids.splice(j,1);cut=true;break;
    }
    if(!cut)break;
   }
   return out;
  }
  const triangles=(poly,col)=>{const ids=indices(poly),out=new Float32Array(ids.length*6);let i=0;for(const id of ids){out.set([...poly[id],...col],i);i+=6;}return out;};
  const colour=()=>{
   let c=colours.get(state.fill);if(!c){const hex=state.fill.match(/^#([\da-f]{6}|[\da-f]{3})$/i),rgb=state.fill.match(/^rgba?\(([^)]+)\)$/);
    if(hex){const h=hex[1].length===3?[...hex[1]].map(v=>v+v).join(''):hex[1];c=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255);c.push(1);}
    else if(rgb){c=rgb[1].split(',').map(Number);for(let i=0;i<3;i++)c[i]/=255;if(c.length===3)c.push(1);}
    else throw Error('Unsupported actor colour '+state.fill);colours.set(state.fill,c);
   }const a=c[3]*state.alpha;return [c[0]*a,c[1]*a,c[2]*a,a];
  };
  const append=poly=>{const ids=indices(poly),col=colour(),need=used+ids.length*6;
   if(need>values.length){const next=new Float32Array(Math.max(need,values.length*2));next.set(values);values=next;}
   for(const id of ids){values[used++]=poly[id][0];values[used++]=poly[id][1];for(const n of col)values[used++]=n;}
  };
  const api={canvas,
   reset(m){state={m:{...identity(),a:m.a,b:m.b,c:m.c,d:m.d,e:m.e,f:m.f},fill:'#000000',alpha:1,mask:0};stack=[];paths=[];path=null;used=0;},
   flush(){if(used){submit(values.subarray(0,used));used=0;}},
   save(){stack.push({...state,m:{...state.m}});},
   restore(){const previous=stack.pop();if(!previous)throw Error('Unbalanced actor restore');if(previous.mask!==state.mask){api.flush();setMask(previous.mask);}state=previous;},
   getTransform(){return {...state.m};},
   setTransform(a,b,c,d,e,f){state.m=typeof a==='object'?{a:a.a,b:a.b,c:a.c,d:a.d,e:a.e,f:a.f}:{a,b,c,d,e,f};},
   resetTransform(){state.m=identity();},
   transform(a,b,c,d,e,f){const m=state.m;state.m={a:m.a*a+m.c*b,b:m.b*a+m.d*b,c:m.a*c+m.c*d,d:m.b*c+m.d*d,e:m.a*e+m.c*f+m.e,f:m.b*e+m.d*f+m.f};},
   translate(x,y){api.transform(1,0,0,1,x,y);},scale(x,y){api.transform(x,0,0,y,0,0);},rotate(a){api.transform(Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a),0,0);},
   beginPath(){paths=[];path=null;},moveTo(x,y){path=[point(x,y)];paths.push(path);},lineTo(x,y){if(!path)api.moveTo(x,y);else path.push(point(x,y));},closePath(){},
   rect(x,y,w,h){paths.push([point(x,y),point(x+w,y),point(x+w,y+h),point(x,y+h)]);path=null;},
   fillRect(x,y,w,h){if(w&&h)append([point(x,y),point(x+w,y),point(x+w,y+h),point(x,y+h)]);},
   fill(){for(const poly of paths)append(poly);},
   clip(){api.flush();state.mask=clipPaths(state.mask,paths,triangles);},
   ellipse(x,y,rx,ry,rotation,start,end){const poly=[];for(let i=0;i<=40;i++){const a=start+(end-start)*i/40,xx=Math.cos(a)*rx,yy=Math.sin(a)*ry;poly.push(point(x+xx*Math.cos(rotation)-yy*Math.sin(rotation),y+xx*Math.sin(rotation)+yy*Math.cos(rotation)));}paths.push(poly);path=poly;},
   get fillStyle(){return state.fill;},set fillStyle(v){state.fill=v;},
   get globalAlpha(){return state.alpha;},set globalAlpha(v){state.alpha=v;}
  };return api;
 }
 function create(meshes,onLoss=()=>{}){
  const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{
   alpha:true,antialias:true,depth:true,stencil:true,premultipliedAlpha:true,preserveDrawingBuffer:false
  });
  if(!gl)throw Error('WebGL bu cihazda açılamadı');
  let disposed=false,lost=false,drawCalls=0,frames=0,program=null,vectorProgram=null,vector=null;
  const buffers=[],shaders=[],parts={},uniforms={};
  const loss=e=>{e.preventDefault();lost=true;if(!disposed)onLoss('GPU bağlantısı kesildi; Canvas 2D aktif.');};
  canvas.addEventListener('webglcontextlost',loss);
  const dispose=()=>{disposed=true;canvas.removeEventListener('webglcontextlost',loss);
   for(const b of buffers)gl.deleteBuffer(b);for(const s of shaders)gl.deleteShader(s);
   if(program)gl.deleteProgram(program);if(vectorProgram)gl.deleteProgram(vectorProgram);canvas.width=canvas.height=1;
   gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
  try{
   if(gl.getParameter(gl.STENCIL_BITS)<8)throw Error('GPU actor requires an 8-bit stencil buffer');
   if(!gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER,gl.HIGH_FLOAT)?.precision)throw Error('GPU yüksek hassasiyetli derinlik desteklemiyor');
   const shader=(type,source)=>{const s=gl.createShader(type);shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
   program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertexSource));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragmentSource));gl.linkProgram(program);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
   for(const name of ['yaw','transform','size','head','headPass','layerBias','chamfer'])uniforms[name]=gl.getUniformLocation(program,'u_'+name);
   const attributes=[['position',3,0],['normal',2,3],['colour',3,5],['layer',1,8]].map(([name,size,offset])=>({location:gl.getAttribLocation(program,'a_'+name),size,offset}));
   for(const [name,faces]of Object.entries(meshes).filter(([name])=>name!=='decorations')){
    const values=[];
    for(const face of faces){
     const colour=face.col.match(/^#([0-9a-f]{6})$/i),decimal=face.col.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
     if(!colour&&!decimal)throw Error('Unsupported mesh material: '+face.col);
     const rgb=colour?[0,2,4].map(i=>parseInt(colour[1].slice(i,i+2),16)/255):decimal.slice(1).map(v=>Number(v)/255),n=face.normal,length=Math.hypot(n[0],n[2])||1;
     // All exported native faces are convex; retain original vertices/winding.
     for(let i=1;i<face.v.length-1;i++)for(const p of [face.v[0],face.v[i],face.v[i+1]])values.push(...p,n[0]/length,n[2]/length,...rgb,face.layer||0);
    }
    const data=new Float32Array(values),buffer=gl.createBuffer();buffers.push(buffer);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
    parts[name]={buffer,count:data.length/9,bytes:data.byteLength};
   }
   gl.disable(gl.DITHER);gl.disable(gl.BLEND);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clearColor(0,0,0,0);
   const extension=gl.getExtension('WEBGL_debug_renderer_info'),device=extension?gl.getParameter(extension.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),
    depthBits=gl.getParameter(gl.DEPTH_BITS),layerBias=Math.max(.00001,4/2**depthBits);
   const drawPart=name=>{const part=parts[name];if(!part?.count)return;gl.bindBuffer(gl.ARRAY_BUFFER,part.buffer);
    for(let i=0;i<8;i++)gl.disableVertexAttribArray(i);
    for(const a of attributes){gl.enableVertexAttribArray(a.location);gl.vertexAttribPointer(a.location,a.size,gl.FLOAT,false,36,a.offset*4);}
    gl.drawArrays(gl.TRIANGLES,0,part.count);drawCalls++;
   };
   const start=ctx=>{
     if(disposed||lost||gl.isContextLost())throw Error('GPU bağlamı kullanılamıyor');
     const width=ctx.canvas.width,height=ctx.canvas.height;
     if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
     gl.viewport(0,0,width,height);gl.colorMask(true,true,true,true);gl.depthMask(true);gl.stencilMask(255);
     gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);gl.disable(gl.STENCIL_TEST);
   };
   const composite=ctx=>{ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(canvas,0,0);ctx.restore();frames++;};
   const drawGear=(ctx,deg,dir,visible,unit,head)=>{
     vector?.flush();
     gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.BLEND);gl.clear(gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
     const width=canvas.width,height=canvas.height;
     const angle=deg*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle)*dir,m=ctx.getTransform();
     gl.uniform2f(uniforms.yaw,c,s);gl.uniform2f(uniforms.size,width,height);
     // At least two depth-buffer steps for coplanar sword paint, including
     // implementations with a 16-bit default depth attachment.
     gl.uniform1f(uniforms.layerBias,layerBias);
     gl.uniformMatrix3fv(uniforms.transform,false,new Float32Array([m.a*unit,m.b*unit,0,m.c*unit,m.d*unit,0,m.e,m.f,1]));
     gl.uniform1f(uniforms.headPass,head?1:0);gl.uniform4f(uniforms.head,head?.x||0,head?.half||0,head?.top||0,head?.bottom||0);
     gl.uniform1f(uniforms.chamfer,head?.chamfer||0);
     for(const name of ['quiver','sword','bow','shield'])if(visible[name]!==false)drawPart(name);
   };
   vectorProgram=gl.createProgram();
   gl.attachShader(vectorProgram,shader(gl.VERTEX_SHADER,`attribute vec2 a_xy;attribute vec4 a_rgba;uniform vec2 u_size;varying vec4 v_rgba;void main(){gl_Position=vec4(a_xy.x/u_size.x*2.0-1.0,1.0-a_xy.y/u_size.y*2.0,0.0,1.0);v_rgba=a_rgba;}`));
   gl.attachShader(vectorProgram,shader(gl.FRAGMENT_SHADER,`precision mediump float;varying vec4 v_rgba;void main(){gl_FragColor=v_rgba;}`));
   gl.linkProgram(vectorProgram);if(!gl.getProgramParameter(vectorProgram,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(vectorProgram));
   const dynamicBuffer=gl.createBuffer();buffers.push(dynamicBuffer);
   const xy=gl.getAttribLocation(vectorProgram,'a_xy'),rgba=gl.getAttribLocation(vectorProgram,'a_rgba'),size=gl.getUniformLocation(vectorProgram,'u_size');
   let dynamicCapacity=0;
   const submit=values=>{
    if(!values.length)return;gl.useProgram(vectorProgram);gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform2f(size,canvas.width,canvas.height);gl.bindBuffer(gl.ARRAY_BUFFER,dynamicBuffer);
    if(values.byteLength>dynamicCapacity){dynamicCapacity=Math.max(65536,2**Math.ceil(Math.log2(values.byteLength)));gl.bufferData(gl.ARRAY_BUFFER,dynamicCapacity,gl.DYNAMIC_DRAW);}
    gl.bufferSubData(gl.ARRAY_BUFFER,0,values);
    for(let i=0;i<8;i++)gl.disableVertexAttribArray(i);
    gl.enableVertexAttribArray(xy);gl.vertexAttribPointer(xy,2,gl.FLOAT,false,24,0);
    gl.enableVertexAttribArray(rgba);gl.vertexAttribPointer(rgba,4,gl.FLOAT,false,24,8);
    gl.drawArrays(gl.TRIANGLES,0,values.length/6);drawCalls++;
   };
   const stencil=mask=>{
    if(mask){gl.enable(gl.STENCIL_TEST);gl.stencilFunc(gl.EQUAL,mask,mask);gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);gl.stencilMask(0);}
    else gl.disable(gl.STENCIL_TEST);
   };
   vector=makeVectorContext(canvas,submit,(mask,paths,triangles)=>{
    const bit=mask+1;if(bit>128)throw Error('Actor clip nesting exceeds stencil budget');
    gl.enable(gl.STENCIL_TEST);gl.stencilMask(bit);gl.clear(gl.STENCIL_BUFFER_BIT);
    gl.stencilFunc(gl.EQUAL,mask,mask);gl.stencilOp(gl.KEEP,gl.KEEP,gl.INVERT);gl.colorMask(false,false,false,false);
    for(const path of paths)submit(triangles(path,[1,1,1,1]));
    gl.colorMask(true,true,true,true);stencil(mask|bit);return mask|bit;
   },stencil);
   return Object.freeze({
    canvas,dispose,
    draw(ctx,deg,dir,visible,unit,head){if(ctx===vector){drawGear(ctx,deg,dir,visible,unit,head);return;}start(ctx);drawGear(ctx,deg,dir,visible,unit,head);composite(ctx);},
    paint(ctx,fn){start(ctx);vector.reset(ctx.getTransform());const previous=g;
     try{g=vector;fn(vector);vector.flush();}finally{g=previous;}
     composite(ctx);
    },
    finish:()=>gl.finish(),
    stats:()=>({kind:'webgl-actor',lost,device,depthBits,layerBias,antialias:gl.getContextAttributes()?.antialias,dynamicBytes:dynamicCapacity,
     frames,drawCalls,meshBytes:Object.values(parts).reduce((n,p)=>n+p.bytes,0),
     triangles:Object.fromEntries(Object.entries(parts).map(([n,p])=>[n,p.count/3])),width:canvas.width,height:canvas.height})
   });
  }catch(error){dispose();throw error;}
 }
 window.KRGearGPU=Object.freeze({create});
})();
