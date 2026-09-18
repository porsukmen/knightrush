/* Opt-in sprite batch experiment. Rendering order is preserved across atlas pages. */
class ForestSpriteGPU {
 constructor(){
  this.canvas=document.createElement('canvas');const gl=this.gl=this.canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false});
  if(!gl)throw Error('Sprite WebGL unavailable');this.pages=[];this.items=new WeakMap();this.uploads=0;this.draws=0;
  const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const p=this.program=gl.createProgram();
  gl.attachShader(p,shader(gl.VERTEX_SHADER,'attribute vec2 p;attribute vec2 uv;uniform vec2 size;varying vec2 v;void main(){gl_Position=vec4(p.x/size.x*2.-1.,1.-p.y/size.y*2.,0.,1.);v=uv;}'));
  gl.attachShader(p,shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 v;uniform sampler2D tex;void main(){gl_FragColor=texture2D(tex,v);}'));
  gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
  this.buffer=gl.createBuffer();this.position=gl.getAttribLocation(p,'p');this.uv=gl.getAttribLocation(p,'uv');this.size=gl.getUniformLocation(p,'size');
  this.side=Math.min(4096,gl.getParameter(gl.MAX_TEXTURE_SIZE));
 }
 upload(image){
  if(this.items.has(image))return this.items.get(image);
  const gl=this.gl,s=this.side,w=image.width,h=image.height;if(w+2>s||h+2>s)throw Error('Sprite exceeds atlas');
  let page=this.pages.at(-1);
  if(page&&page.x+w+2>s){page.x=1;page.y+=page.row+2;page.row=0;}
  if(!page||page.y+h+2>s){page={texture:gl.createTexture(),x:1,y:1,row:0};this.pages.push(page);
   gl.bindTexture(gl.TEXTURE_2D,page.texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,s,s,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  }
  gl.bindTexture(gl.TEXTURE_2D,page.texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
  gl.texSubImage2D(gl.TEXTURE_2D,0,page.x,page.y,gl.RGBA,gl.UNSIGNED_BYTE,image);
  const item={page,u:page.x/s,v:page.y/s,du:w/s,dv:h/s};page.x+=w+2;page.row=Math.max(page.row,h);this.items.set(image,item);this.uploads++;return item;
 }
 render(context,jobs,width,height){
  if(!jobs.length)return;
  const gl=this.gl;if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}
  gl.viewport(0,0,width,height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(this.program);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.uniform2f(this.size,width,height);
  gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.enableVertexAttribArray(this.position);gl.enableVertexAttribArray(this.uv);
  gl.vertexAttribPointer(this.position,2,gl.FLOAT,false,16,0);gl.vertexAttribPointer(this.uv,2,gl.FLOAT,false,16,8);
  let page=null,vertices=[];
  const flush=()=>{if(!vertices.length)return;gl.bindTexture(gl.TEXTURE_2D,page.texture);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STREAM_DRAW);gl.drawArrays(gl.TRIANGLES,0,vertices.length/4);this.draws++;vertices=[];};
  for(const j of jobs){const t=this.upload(j.image);if(page!==t.page){flush();page=t.page;}
   const x=j.x,y=j.y,r=x+j.w,b=y+j.h,u=t.u,v=t.v,ur=u+t.du,vb=v+t.dv;
   vertices.push(x,y,u,v,r,y,ur,v,r,b,ur,vb,x,y,u,v,r,b,ur,vb,x,b,u,vb);
  }flush();context.save();context.setTransform(1,0,0,1,0,0);context.drawImage(this.canvas,0,0);context.restore();
 }
}
