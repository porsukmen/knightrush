/* A fixed rear camera and a real X/Z floor for the user's statue candidate.
 * World positions, ground contacts and actor sizes share the same pinhole.
 */
(function(root){
  'use strict';
  // Match drawPlayer's normal 1.02 scale. Both camera lenses keep the same
  // focal/distance ratio, so this remains exact with one fixed world height.
  const nativeKnightScale=1.02,playerPixelsPerUnit=23,riderNativeHeight=142;
  const knightHeight=riderNativeHeight*nativeKnightScale/playerPixelsPerUnit;
  // A longer camera/lens pair softens foreground magnification. The matching
  // world scale and attack distance retain the statue's visible height and hit.
  const statueArtHeight=172.2,statueHeight=20,statueUnit=statueHeight/statueArtHeight;
  const nearZ=15.16,farZ=28.5,laneWidth=6.5;
  const actorX=-32*statueUnit;
  const laneX=lane=>(lane-1)*laneWidth;
  // The rider lanes spread across the floor. The colossal body's staging keeps
  // its original travel; the arm rig supplies the remaining lateral reach.
  const bodyLaneWidth=4.2,bodyLaneX=lane=>(lane-1)*bodyLaneWidth;
  const laneAimOffset=lane=>laneX(lane)-bodyLaneX(lane);
  const clamp=n=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));
  const smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
  function makeCamera(options={}){
    const width=Number.isFinite(options.width)?options.width:480;
    const viewportHeight=Number.isFinite(options.height)?options.height:800;
    const compact=!!options.compact,follow=compact?38:57,focal=follow*playerPixelsPerUnit;
    const height=6,playerFeet=compact?700:740;
    return Object.freeze({width,viewportWidth:width,viewportHeight,compact,follow,focal,height,
      playerFeet,horizon:playerFeet-focal*height/follow,centerX:width/2});
  }
  function project(camera,point){
    const depth=camera.follow+(point.z||0);
    if(!(depth>0))throw new RangeError('Stone King world point is behind the camera');
    const scale=camera.focal/depth;
    return {x:camera.centerX+(point.x||0)*scale,
      y:camera.horizon+(camera.height-(point.y||0))*scale,scale,depth};
  }
  function depth(progress){return farZ+(nearZ-farZ)*smooth(progress);}
  function layout(camera,z=nearZ,lane=1,actorWorldX){
    const statueX=Number.isFinite(actorWorldX)?actorWorldX:actorX+bodyLaneX(lane);
    const statueFoot=project(camera,{x:statueX,y:0,z});
    const knightFoot=project(camera,{x:0,y:0,z:0});
    return {actorX:statueX,lane,statueFoot,statueOriginY:statueFoot.y-4.2*statueUnit*statueFoot.scale,
      statueDrawScale:statueFoot.scale*statueUnit/3,knightFoot,
      knightDrawScale:knightFoot.scale*knightHeight/riderNativeHeight,
      physicalRatio:statueHeight/knightHeight,
      apparentRatio:statueHeight*statueFoot.scale/(knightHeight*knightFoot.scale)};
  }
  function polygon(ctx,camera,vertices,colour,stroke=null){
    const points=vertices.map(v=>project(camera,{x:v[0],y:v[1],z:v[2]}));
    ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();
    ctx.fillStyle=colour;ctx.fill();
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.65;ctx.stroke();}
  }
  function paintEnvironment(ctx,camera){
    ctx.save();
    try{
      const width=camera.width,bottom=camera.viewportHeight,horizon=camera.horizon;
      const sky=ctx.createLinearGradient(0,0,0,horizon);
      sky.addColorStop(0,'#0c0e14');sky.addColorStop(1,'#202229');
      ctx.fillStyle=sky;ctx.fillRect(0,-bottom,width,bottom+horizon);
      const floor=ctx.createLinearGradient(0,horizon,0,bottom);
      floor.addColorStop(0,'#2b2c31');floor.addColorStop(1,'#34353a');
      ctx.fillStyle=floor;ctx.fillRect(0,horizon,width,bottom*2);
      // Solve the first visible row on the same ground plane; nothing is
      // scaled or stretched separately to fill the bottom of the viewport.
      const visibleNear=camera.focal*camera.height/Math.max(1,bottom-horizon)-camera.follow;
      const first=Math.max(-camera.follow+2,Math.floor(visibleNear/2)*2-2),last=180;
      const colours=['#34353a','#36373c','#323338','#38393e','#35363b'];
      for(let z=last;z>=first;z-=2){
        const alpha=1-smooth((z-55)/125);
        if(alpha<.003)continue;
        ctx.globalAlpha=alpha;
        for(let x=-14;x<14;x+=2){
          const index=((x/2)*7+(z/2)*3)%colours.length;
          const colour=colours[(index+colours.length)%colours.length];
          polygon(ctx,camera,[[x,0,z],[x+2,0,z],[x+2,0,z+2],[x,0,z+2]],colour,'#24252a');
        }
      }
      // Four projected ground seams bound exactly three playable lanes. Their
      // spacing is the same world distance used by the rider and every attack.
      ctx.globalAlpha=.62;
      for(const x of [-1.5,-.5,.5,1.5].map(n=>n*laneWidth)){
        polygon(ctx,camera,[[x-.025,.008,first],[x+.025,.008,first],
          [x+.025,.008,120],[x-.025,.008,120]],'#797a7e');
      }
      // Low, continuous curbs are actual raised world surfaces. They make the
      // plane's angle legible without becoming scenery around the statue.
      for(let z=86;z>=first;z-=4){
        ctx.globalAlpha=(1-smooth((z-42)/56))*.76;
        for(const side of [-1,1]){
          const inner=side*13.5,outer=side*13.95;
          polygon(ctx,camera,[[inner,0,z],[inner,.24,z],[inner,.24,z+4],[inner,0,z+4]],'#23252a');
          polygon(ctx,camera,[[inner,.24,z],[outer,.24,z],[outer,.24,z+4],[inner,.24,z+4]],'#48494e');
        }
      }
    }finally{ctx.restore();}
  }
  const environmentCache=new WeakMap(),environmentMetrics={builds:0,hits:0,pixels:0};
  function environmentSurface(ctx,width,height){
    if(typeof root.OffscreenCanvas==='function')return new root.OffscreenCanvas(width,height);
    const doc=ctx.canvas?.ownerDocument||root.document;
    if(!doc?.createElement)return null;
    const surface=doc.createElement('canvas');surface.width=width;surface.height=height;return surface;
  }
  function drawEnvironment(ctx,camera,raster=null){
    if(root.KRStoneKingArena?.draw(ctx,camera)){
      // The selected generated plate is drawn directly. Release the temporary
      // loading/error floor surface rather than retain a second screen image.
      const cached=environmentCache.get(ctx);
      if(cached){cached.surface.width=0;cached.surface.height=0;environmentCache.delete(ctx);environmentMetrics.pixels=0;}
      return;
    }
    const transform=ctx.getTransform?.(),canvas=ctx.canvas;
    if(!transform||!canvas||transform.b!==0||transform.c!==0||transform.a<=0||transform.d<=0||
      ctx.globalAlpha!==1||ctx.globalCompositeOperation!=='source-over'||(ctx.filter&&ctx.filter!=='none')){
      paintEnvironment(ctx,camera);return;
    }
    // Rasterize once at the real backing resolution. The full canvas height
    // includes portrait sky padding; only the world strip consumes memory.
    let cached=environmentCache.get(ctx);
    const rasterSignature=raster?[raster.scale,raster.x,raster.y].join('/'):'direct';
    let baseline=cached?.rasterSignature===rasterSignature?cached.baseline:null;
    if(!raster)baseline=transform;
    else if(!baseline){
      // Use the context's own matrix precision at fractional backing scales.
      // This also keeps a normal cached blit on exact device pixel centres.
      ctx.save();ctx.setTransform(raster.scale,0,0,raster.scale,raster.x,raster.y);
      const exact=ctx.getTransform();baseline={a:exact.a,d:exact.d,e:exact.e,f:exact.f};ctx.restore();
    }
    const scaleX=baseline.a,scaleY=baseline.d,baseX=baseline.e,baseY=baseline.f;
    if(Math.abs(scaleX-transform.a)>1e-8||Math.abs(scaleY-transform.d)>1e-8){paintEnvironment(ctx,camera);return;}
    const left=Math.max(0,Math.floor(baseX)),right=Math.min(canvas.width,Math.ceil(baseX+camera.width*scaleX)),
      width=right-left,height=canvas.height;
    if(width<=0||height<=0){paintEnvironment(ctx,camera);return;}
    const key=[camera.width,camera.viewportHeight,camera.horizon,camera.height,camera.follow,camera.focal,camera.centerX,
      canvas.width,height,scaleX,scaleY,baseX,baseY].join('/');
    if(!cached||cached.key!==key){
      const surface=cached?.surface||environmentSurface(ctx,width,height);
      if(!surface){paintEnvironment(ctx,camera);return;}
      if(surface.width!==width)surface.width=width;if(surface.height!==height)surface.height=height;
      const painter=surface.getContext('2d');
      painter.setTransform(1,0,0,1,0,0);painter.clearRect(0,0,width,height);
      painter.setTransform(scaleX,0,0,scaleY,baseX-left,baseY);
      paintEnvironment(painter,camera);
      cached={surface,key,left,baseX,baseY,baseline,rasterSignature};environmentCache.set(ctx,cached);
      environmentMetrics.builds++;environmentMetrics.pixels=width*height;
    }else environmentMetrics.hits++;
    ctx.save();
    try{
      // Screen shake translates this prepared world without rebuilding it.
      ctx.setTransform(1,0,0,1,transform.e-cached.baseX,transform.f-cached.baseY);
      ctx.drawImage(cached.surface,cached.left,0);
    }finally{ctx.restore();}
  }
  function drawShadow(ctx,camera,x,z,rx,rz,opacity=.25){
    ctx.save();
    try{
      ctx.globalAlpha*=opacity;ctx.fillStyle='#08090c';ctx.beginPath();
      for(let i=0;i<64;i++){
        const angle=i/64*Math.PI*2;
        const p=project(camera,{x:x+Math.cos(angle)*rx,y:.005,z:z+Math.sin(angle)*rz});
        if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);
      }
      ctx.closePath();ctx.fill();
    }finally{ctx.restore();}
  }
  const api={version:9,makeCamera,project,layout,depth,drawEnvironment,paintEnvironment,
    environmentStats:()=>({...environmentMetrics}),drawShadow,laneX,laneWidth,bodyLaneX,bodyLaneWidth,laneAimOffset,
    nativeKnightScale,playerPixelsPerUnit,statueHeight,statueArtHeight,unit:statueUnit,statueUnit,
    knightHeight,riderNativeHeight,nearZ,farZ,actorX};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.KRStoneKingStage=api;
})(globalThis);
