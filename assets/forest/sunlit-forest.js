/* Shared native Sunlit Forest artwork. Journey owns routes/events/gameplay;
   ?morninglab=1 retains the isolated authoring course and its controls. */
(()=>{
  'use strict';
  const state={ready:false,playing:true,restarting:false,seed:7341,rows:new Map(),error:null,draws:0,displayedMeter:-1,lighting:true};
  const original={background:drawBackground,road:drawCurvedRoadWorld,scenery:queueRoadsideWorld,
    update:updateForestCorridor,baked:prepareForestBaked,populate:populateJourneyTrees,
    obstacle:drawObstacleEntity,journeyObstacle:drawJourneyObstacle,ambient:drawAmbient,
    vignette:drawVignette,particles:drawParticles,status:drawForestTestStatus,reset:resetRun,mode:setMode,
    masked:drawGroundMaskedWorldItem,rider:drawRider,player:drawPlayer,queue:buildWorldDrawQueue};
  const labMode=new URLSearchParams(location.search).get('morninglab')==='1';
  const journeyForest=()=>!forestCorridor&&runJourneyPrototype&&!!journeyRoute&&!!journey&&
    biome==='forest'&&env==='forest'&&curvedWorldActive();
  const active=()=>!!forestCorridor?.morning||(!labMode&&journeyForest());
  const R=n=>sRnd(n+state.seed),half=CURVED_ROAD_HALF;
  let materialPalette=null,backgroundYaw=null;
  const material=color=>materialPalette?materialPalette.color(color):color;
  function withPalette(palette,draw){const previous=materialPalette;
    try{materialPalette=palette;return draw();}finally{materialPalette=previous;}}
  function polygon(points,color){g.fillStyle=material(color);g.beginPath();for(let i=0;i<points.length;i++){
    if(i)g.lineTo(points[i][0],points[i][1]);else g.moveTo(points[i][0],points[i][1]);
  }g.closePath();g.fill();}
  // Local authored material-lighting profile, NOT a tint over the screen.
  // The existing rider rig receives its supported appearance values unchanged
  // in shape/animation. Cache the palette; no per-pixel work or extra canvases.
  const morningRiderLight=Object.freeze({
    armor:'#a3b2ad',armorDark:'#536e76',armorLight:'#e8e3bf',
    steel:'#bccbc5',steelLight:'#fff0cc',
    shield:Object.freeze({face:'#2c6490',rim:'#e9e7ca',rimDark:'#70898b',emblem:'#d05249',boss:'#e5b85a'}),
    sword:Object.freeze({grip:'#485fa4',guard:'#839dc1',blade:'#e8eee0',edge:'#fff4d6',sheath:'#244d71'})
  });
  let riderLightCache=null,insideMorningPlayer=false;
  function morningRiderAppearance(o){
    const source=o.appearance||null,horse=source?.horse||o.horse||'#6f4327',
      plume=source?.plume||o.feather||'#268ee8';
    if(riderLightCache?.source===source&&riderLightCache.horse===horse&&riderLightCache.plume===plume)
      return riderLightCache.value;
    const value={...source,...morningRiderLight,
      horse:mixCol(horse,'#c39856',.24),horseMane:mixCol(source?.horseMane||shade(horse,-48),'#34493f',.24),
      horseMark:mixCol(source?.horseMark||'#eee7d5','#fff0bd',.28),
      plume:mixCol(plume,'#9fcece',.15)};
    riderLightCache={source,horse,plume,value};return value;
  }
  drawPlayer=function(){
    if(!active()||!state.lighting||playerChar.rigId!=='ser_jonathan'||player.mountedDeath)return original.player();
    const previous=insideMorningPlayer;
    try{insideMorningPlayer=true;return original.player();}
    finally{insideMorningPlayer=previous;}
  };
  drawRider=function(x,y,scale,o){
    if(insideMorningPlayer&&o?.rigId==='ser_jonathan'&&!o.squire){
      const appearance=morningRiderAppearance(o);
      return original.rider(x,y,scale,{...o,appearance:!labMode&&window.KRSunlitForest
        ?KRSunlitForest.riderAppearance(appearance):appearance});
    }
    return original.rider(x,y,scale,o);
  };
  // Same native shape approach as drawTreeArt: a rooted trunk, a few squared
  // leaf masses and three material values. Geometry is built once, not rebuilt
  // leaf by leaf. None of the archived generated atlas is loaded.
  function model(build){
    const shapes=[];let left=Infinity,right=-Infinity,top=0,bottom=0;
    const add=(points,color)=>{
      const path=new Path2D();points.forEach(([x,y],i)=>{
        if(i)path.lineTo(x,y);else path.moveTo(x,y);
        left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
      });path.closePath();shapes.push({path,color});
    };
    build(add);return {shapes,left,right,top,bottom,width:right-left};
  }
  const leafColors=[['#285d40','#528b41','#95b951'],['#376643','#67984b','#b2c85f'],['#23583c','#4b8341','#91b44b']];
  function crown(add,x,y,w,h,colors){
    const shape=(pts,c)=>add(pts.map(([a,b])=>[x+a*w,y+b*h]),c);
    shape([[-.5,.05],[-.5,-.22],[-.37,-.22],[-.32,-.4],[-.12,-.4],[-.12,-.5],
      [.2,-.5],[.2,-.4],[.38,-.4],[.44,-.23],[.5,-.23],[.5,.15],[.37,.15],[.37,.32],
      [.13,.32],[.13,.44],[-.15,.44],[-.15,.33],[-.36,.33],[-.43,.14],[-.5,.14]],colors[0]);
    shape([[-.5,-.22],[-.37,-.22],[-.32,-.4],[-.12,-.4],[-.12,-.5],[.2,-.5],[.2,-.4],
      [.38,-.4],[.44,-.23],[.33,-.06],[.08,-.06],[.08,.1],[-.18,.1],[-.18,.02],[-.5,.02]],colors[1]);
    shape([[-.37,-.22],[-.32,-.4],[-.12,-.4],[-.12,-.5],[.2,-.5],[.2,-.39],
      [.05,-.32],[-.12,-.32],[-.12,-.18],[-.37,-.18]],colors[2]);
  }
  function treeModel(variant){return model(add=>{
    const bark='#805936',light='#b58b50',shade='#4f432d',leaves=leafColors[variant];
    if(variant===0){
      // Tall oak: visible branch forks, a heavy base, four broad leaf masses.
      add([[-28,0],[-15,-17],[-12,-97],[-21,-139],[-9,-221],[7,-225],[9,-150],
        [20,-112],[12,-57],[18,-13],[34,1],[10,0],[0,-11],[-10,2]],bark);
      add([[-12,-110],[-39,-152],[-63,-169],[-60,-183],[-30,-164],[0,-127],
        [33,-164],[60,-181],[65,-170],[43,-151],[10,-101]],bark);
      add([[-15,-17],[-12,-97],[-21,-139],[-9,-221],[-3,-220],[-10,-143],
        [0,-96],[-4,-20],[-10,2],[-28,0]],light);
      add([[6,-142],[20,-112],[12,-57],[18,-13],[34,1],[10,0],[4,-41]],shade);
      add([[-11,-116],[-38,-154],[-62,-174],[-60,-183],[-30,-164],[0,-127]],light);
      crown(add,-43,-180,90,68,leaves);crown(add,37,-199,102,78,leaves);
      crown(add,-34,-229,90,73,leaves);crown(add,15,-249,80,59,leaves);
    }else if(variant===1){
      // Slim beech: higher fork and deliberately quieter bark.
      add([[-22,0],[-9,-13],[-10,-105],[-4,-181],[-12,-256],[1,-260],[11,-182],
        [6,-115],[11,-15],[22,0],[4,0],[-2,-8],[-8,1]],bark);
      add([[-1,-144],[-35,-184],[-37,-212],[-26,-211],[-25,-191],[6,-163],
        [36,-204],[42,-239],[52,-237],[45,-198],[5,-144]],bark);
      add([[-22,0],[-9,-13],[-10,-105],[-4,-181],[-12,-256],[-6,-258],
        [2,-183],[-3,-106],[-1,-14],[-8,1]],light);
      add([[6,-174],[6,-115],[11,-15],[22,0],[4,0],[0,-112]],shade);
      add([[-26,-193],[-35,-184],[-37,-212],[-31,-211]],light);
      crown(add,-34,-219,70,59,leaves);crown(add,39,-250,69,66,leaves);
      crown(add,-3,-276,86,66,leaves);
    }else{
      // Broad, lower forked oak: the gap between its two crowns stays open.
      add([[-31,0],[-17,-12],[-14,-78],[-33,-108],[-52,-167],[-38,-174],
        [-19,-126],[-2,-112],[16,-145],[21,-191],[36,-188],[31,-137],[10,-90],
        [17,-16],[35,0],[12,1],[0,-9],[-11,2]],bark);
      add([[-31,0],[-17,-12],[-14,-78],[-33,-108],[-52,-167],[-44,-169],
        [-25,-112],[-5,-85],[-4,-19],[-11,2]],light);
      add([[8,-94],[17,-16],[35,0],[12,1],[5,-19],[-1,-71]],shade);
      add([[0,-107],[16,-145],[21,-191],[28,-189],[23,-141],[7,-104]],light);
      crown(add,-46,-168,106,77,leaves);crown(add,34,-196,115,84,leaves);
      crown(add,-2,-221,87,60,leaves);
    }
    // One attached moss patch, not dozens of bark grooves or leaf speckles.
    add([[-14,-6],[-14,-29],[-6,-29],[-6,-36],[0,-36],[-2,-13],[-8,-5]],'#658744');
    add([[-14,-29],[-6,-29],[-6,-36],[0,-36],[-1,-29],[-9,-24],[-9,-11],[-14,-9]],'#9bb24e');
  });}
  function leaves(add,x=0,y=0,s=1){
    for(const [tipX,tipY,wide] of [[-40,-20,12],[-22,-38,10],[2,-46,12],[27,-36,11],[43,-16,12]]){
      const pts=[[0,0],[tipX-wide,tipY+9],[tipX,tipY],[tipX+4,tipY+16]];
      add(pts.map(([a,b])=>[x+a*s,y+b*s]),'#407749');
      add([[x,y],[x+tipX*s,y+tipY*s],[x+(tipX+4)*s,y+(tipY+16)*s]],'#88a949');
    }
  }
  function flowerModel(purple=false){return model(add=>{
      leaves(add,0,0,.6);
      for(const [x,y] of [[-21,-38],[1,-50],[23,-29]]){
        add([[x-1,0],[x-1,y],[x+1,y],[x+1,0]],'#507940');
        add([[x-4,y-7],[x+4,y-7],[x+4,y-4],[x+8,y-4],[x+8,y+3],
          [x+4,y+3],[x+4,y+7],[x-4,y+7],[x-4,y+3],[x-8,y+3],[x-8,y-4],[x-4,y-4]],purple?'#8061b5':'#f3ecc5');
        if(purple)add([[x-4,y-7],[x+4,y-7],[x+4,y-3],[x,y],[x-8,y],[x-8,y-4],[x-4,y-4]],'#b19bdf');
        add([[x-3,y-3],[x+3,y-3],[x+3,y+3],[x-3,y+3]],'#dcb04a');
      }
    });}
  const models=[treeModel(0),treeModel(1),treeModel(2),flowerModel(),
    model(add=>{
      add([[-50,0],[-45,-31],[-25,-49],[13,-54],[39,-36],[50,-7],[37,1]],'#6b7b76');
      add([[-50,0],[-45,-31],[-25,-49],[13,-54],[1,-33],[-21,-27],[-31,-1]],'#a9b4a0');
      add([[1,-33],[13,-54],[39,-36],[50,-7],[37,1],[24,-22]],'#4d6460');
      add([[-45,-31],[-25,-49],[13,-54],[8,-44],[-12,-43],[-12,-35],[-30,-29]],'#86a44b');
      add([[-25,-49],[13,-54],[8,-47],[-18,-43]],'#bed069');
      add([[-12,-16],[-4,-21],[4,-19],[1,-11]],'#526965');
    }),
    model(add=>{
      add([[-50,-2],[-50,-22],[-35,-34],[39,-29],[50,-17],[49,0],[33,5],[-34,7]],'#735437');
      add([[-50,-22],[-35,-34],[39,-29],[29,-18],[-34,-18]],'#b18b54');
      add([[-34,-18],[29,-18],[36,-8],[-33,-8]],'#89663e');
      add([[29,-18],[39,-29],[50,-17],[49,0],[33,5],[26,-5]],'#d2b076');
      add([[33,-16],[40,-22],[46,-14],[45,-3],[35,0],[31,-6]],'#9c7748');
      add([[35,-13],[41,-17],[43,-11],[42,-5],[36,-5]],'#d2b076');
      add([[-42,-26],[-33,-34],[13,-31],[10,-23],[-14,-23],[-14,-18],[-35,-18]],'#739447');
      add([[-33,-34],[13,-31],[10,-27],[-29,-27]],'#a9bd59');
    }),model(add=>leaves(add)),flowerModel(true)];
  // Runtime caches contain ONLY the native geometry above, never generated
  // artwork. Fixed pixel tiers are used only at or below their resolution;
  // larger foreground trees stay vector-sharp. All buffers share a hard cap.
  const nativeCache={bytes:0,budgetBytes:5*1048576,models:new Map(),surfaces:new Set(),background:null,prepared:false};
  function releaseSurface(canvas){
    if(!canvas||!nativeCache.surfaces.delete(canvas))return;
    nativeCache.bytes-=canvas.width*canvas.height*4;canvas.width=canvas.height=1;
  }
  function reserveSurface(width,height){
    const bytes=width*height*4;if(!reserveNative(bytes))return null;
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    nativeCache.bytes+=bytes;nativeCache.surfaces.add(canvas);return canvas;
  }
  function reserveNative(bytes){
    if(bytes>nativeCache.budgetBytes)return false;
    for(const [key,entry]of nativeCache.models){
      if(nativeCache.bytes+bytes<=nativeCache.budgetBytes)break;
      // A full working set must not chase its own tail every other frame.
      // Recent surfaces stay resident; overflow uses the original vector art.
      if(entry.frame>=journeyRenderSerial-60)continue;
      nativeCache.bytes-=entry.canvas.width*entry.canvas.height*4;
      entry.canvas.width=entry.canvas.height=1;nativeCache.models.delete(key);
    }
    return nativeCache.bytes+bytes<=nativeCache.budgetBytes;
  }
  function paintNative(m,context){
    for(const shape of m.shapes){context.fillStyle=material(shape.color);context.fill(shape.path);}
  }
  function prepareNativeCache(){
    if(nativeCache.prepared)return;nativeCache.prepared=true;
    // Demand-build at most two visible tiers per frame. Eagerly baking all
    // normal-forest tiers blocked the first frame, then evicted them for biomes.
  }
  function clearBackgroundCache(){
    const c=nativeCache.background;if(!c)return;
    nativeCache.bytes-=c.canvas.width*c.canvas.height*4;c.canvas.width=c.canvas.height=1;
    nativeCache.background=null;
  }
  function clearNativeCache(){
    for(const canvas of nativeCache.surfaces)releaseSurface(canvas);
    clearBackgroundCache();
    for(const c of nativeCache.models.values())c.canvas.width=c.canvas.height=1;
    nativeCache.models.clear();nativeCache.bytes=0;nativeCache.prepared=false;
    nativeCache.lastYaw=undefined;
  }
  function nativeShape(id,x,y,width,opacity=1,clipBottom=Infinity,heightRatio=1){
    const m=models[id];if(!m||opacity<=0)return;const scale=width/m.width,scaleY=scale*heightRatio;
    if(x+m.right*scale<0||x+m.left*scale>VW||y+m.bottom*scaleY<-PAD_TOP||
      y+m.top*scaleY>Math.min(VH+PAD_BOT,clipBottom))return;
    const pixels=width*viewScale,tier=pixels<=64?64:pixels<=128?128:pixels<=256?256:0,
      key=id+':'+tier+(materialPalette?':'+materialPalette.id:'');
    // Transition materials are short-lived and spatially numerous. Caching
    // all 16 variants displaced both settled biomes every frame. Draw those
    // same Path2Ds directly; cache only the stable endpoint materials.
    const cacheable=opacity===1&&g.globalAlpha===1&&tier&&(!materialPalette||materialPalette.id.endsWith(':16'));
    let cached=cacheable?nativeCache.models.get(key):null;
    // Coloured variants share the existing hard budget. At most two small
    // rasterizations per frame; overflow falls back to the native paths.
    if(!cached&&cacheable){
      if(nativeCache.buildFrame!==journeyRenderSerial){nativeCache.buildFrame=journeyRenderSerial;nativeCache.builds=0;}
      const cs=tier/m.width,pad=2,cw=tier+4,ch=Math.ceil((m.bottom-m.top)*cs)+4,bytes=cw*ch*4;
      // Repaint an unused matching surface instead of destroying/allocating a
      // GPU texture for each of the biome's intermediate material palettes.
      let recycled=null;
      if(nativeCache.builds<2&&nativeCache.bytes+bytes>nativeCache.budgetBytes){
        for(const [oldKey,entry]of nativeCache.models){
          if(entry.frame>=journeyRenderSerial-60||entry.canvas.width!==cw||entry.canvas.height!==ch)continue;
          recycled=entry;nativeCache.models.delete(oldKey);break;
        }
      }
      if(nativeCache.builds<2&&(recycled||reserveNative(bytes))){
        const canvas=recycled?.canvas||document.createElement('canvas');
        if(!recycled){canvas.width=cw;canvas.height=ch;nativeCache.bytes+=bytes;}
        const ctx=canvas.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cw,ch);
        ctx.setTransform(cs,0,0,cs,pad-m.left*cs,pad-m.top*cs);paintNative(m,ctx);
        cached={canvas,scale:cs,left:m.left-pad/cs,top:m.top-pad/cs};
        nativeCache.models.set(key,cached);nativeCache.builds++;
      }
    }
    if(cached){
      cached.frame=journeyRenderSerial;nativeCache.models.delete(key);nativeCache.models.set(key,cached);
      // Source-crop the buried part: no per-object Canvas clip or extra mask.
      const factor=scale/cached.scale,factorY=scaleY/cached.scale,top=y+cached.top*scaleY,
        sourceHeight=Math.min(cached.canvas.height,(clipBottom-top)/factorY);
      if(sourceHeight<=0)return;
      const smoothing=g.imageSmoothingEnabled;g.imageSmoothingEnabled=true;
      g.drawImage(cached.canvas,0,0,cached.canvas.width,sourceHeight,
        x+cached.left*scale,top,cached.canvas.width*factor,sourceHeight*factorY);
      g.imageSmoothingEnabled=smoothing;
    }else{
      // Preserve per-plane alpha in the far fade; flattening that transparency
      // would change the authored colors. Very close silhouettes also stay live.
      g.save();g.globalAlpha*=opacity;
      if(y+m.bottom*scaleY>clipBottom){g.beginPath();g.rect(-VW*4,-PAD_TOP-6000,VW*9,clipBottom+PAD_TOP+6000);g.clip();}
      g.translate(x,y);g.scale(scale,scaleY);paintNative(m,g);g.restore();
    }
    state.draws++;
  }
  // Open morning panorama, following Godot's sunny-morning sky / forest_horizon
  // composition. Low hills and two distant broadleaf ranks, never a roof.
  function backgroundModel(build){
    const grouped=new Map();
    const m=model(build);
    for(const shape of m.shapes){
      if(!grouped.has(shape.color))grouped.set(shape.color,new Path2D());
      grouped.get(shape.color).addPath(shape.path);
    }
    return [...grouped].map(([color,path])=>({color,path}));
  }
  const distantRidge=backgroundModel(add=>{
    add([[0,-60],[48,-70],[94,-75],[134,-72],[186,-60],[234,-57],
      [292,-64],[350,-76],[402,-80],[456,-71],[507,-61],[555,-57],
      [611,-66],[668,-76],[714,-71],[768,-60],[768,24],[0,24]],'#7eabb0');
    add([[0,-51],[54,-45],[99,-50],[141,-57],[192,-59],[242,-48],
      [288,-43],[340,-49],[395,-58],[447,-60],[493,-53],[548,-45],
      [599,-49],[653,-58],[710,-58],[768,-51],[768,24],[0,24]],'#5f8d89');
  });
  const horizonWoods=[0,1].map(layer=>backgroundModel(add=>{
    // Continuous opaque crowns fill the horizon behind newly arriving trees.
    // Fixed world-indexed shapes cannot reshuffle when crossing a yaw seam.
    const heights=[45,57,49,62,51,44,58,53,46,61,50,56,43,59,48,54];
    for(let i=-1;i<=32;i++){
      const n=(i+32)%16,x=i*24,w=30,h=heights[n]*(layer?.82:1),
        y=layer?8:0,color=layer?'#376643':'#5b8061';
      add([[x,y-h*.56],[x+w*.1,y-h*.76],[x+w*.23,y-h*.76],
        [x+w*.32,y-h*.94],[x+w*.51,y-h],[x+w*.7,y-h*.89],
        [x+w*.72,y-h*.76],[x+w*.86,y-h*.7],[x+w,y-h*.54],
        [x+w,24],[x,24]],color);
    }
  }));
  const distantCloud=backgroundModel(add=>{
    add([[0,0],[19,0],[19,-5],[36,-5],[36,-11],[65,-11],[65,-6],
      [81,-6],[81,-9],[109,-9],[109,-4],[130,-4],[130,0],[149,0],
      [149,3],[105,3],[105,6],[75,6],[75,3],[0,3]],'#f6f3d9');
    add([[27,3],[75,3],[75,6],[105,6],[105,3],[133,3],[133,5],
      [113,5],[113,8],[73,8],[73,5],[27,5]],'#d7e5d9');
  });
  const morningSun=backgroundModel(add=>{
    add([[-11,-19],[10,-19],[19,-10],[19,10],[10,19],[-10,19],[-19,10],[-19,-10]],'#fff2bb');
  });
  function paintBackgroundModel(m,x,y){
    g.save();g.translate(x,y);
    for(const shape of m){g.fillStyle=material(shape.color);g.fill(shape.path);}
    g.restore();
  }
  function paintBackgroundBelt(m,yaw,rate){
    const shift=yaw*rate,first=Math.floor(shift/768);
    // Repeat complete world sections. No wrapping/reseeding at a turn boundary.
    for(let i=first-1;i<=first+Math.ceil(VW/768);i++)
      paintBackgroundModel(m,i*768-shift,HORIZON_Y+8);
  }
  function paintBackground(){
    const sky=g.createLinearGradient(0,-PAD_TOP,0,HORIZON_Y+40);
    sky.addColorStop(0,material('#65b2e8'));sky.addColorStop(.75,material('#86c9ed'));sky.addColorStop(1,material('#acdced'));
    g.fillStyle=sky;g.fillRect(0,-PAD_TOP,VW,HORIZON_Y+PAD_TOP+50);
    const yaw=backgroundYaw??journeyCameraPose().yaw;
    paintBackgroundModel(morningSun,VW*.59-Math.sin(yaw)*18,HORIZON_Y-201);
    const cloudShift=yaw*18,cloudStart=Math.floor(cloudShift/370);
    for(let i=cloudStart-1;i<=cloudStart+Math.ceil(VW/370);i++)
      paintBackgroundModel(distantCloud,i*370-54-cloudShift,HORIZON_Y-192+((i%2+2)%2)*23);
    paintBackgroundBelt(distantRidge,yaw,26);
    paintBackgroundBelt(horizonWoods[0],yaw,38);
    paintBackgroundBelt(horizonWoods[1],yaw,65);
    g.fillStyle=material('#50713f');g.fillRect(0,HORIZON_Y,VW,VH+PAD_BOT-HORIZON_Y);
  }
  function background(){
    const yaw=backgroundYaw??journeyCameraPose().yaw;
    // In motion around a corner keep the real parallax. Cache the quiet sky/
    // far wood only when its camera is stationary, at native screen resolution.
    const moving=nativeCache.lastYaw!==undefined&&Math.abs(yaw-nativeCache.lastYaw)>1e-8;
    nativeCache.lastYaw=yaw;
    // Settling also changes yaw. Repainting and uploading a screen-sized
    // cache every settling frame cost more than these few native paths.
    if(journey.phase==='turning'||moving){paintBackground();return;}
    const key=viewScale+':'+PAD_TOP+':'+yaw+':'+(materialPalette?.id||'forest');
    let cached=nativeCache.background;
    if(cached?.key!==key){
      const width=Math.ceil(VW*viewScale),height=Math.ceil((HORIZON_Y+PAD_TOP)*viewScale);
      if(cached&&(cached.canvas.width!==width||cached.canvas.height!==height)){clearBackgroundCache();cached=null;}
      if(cached||reserveNative(width*height*4)){
        const canvas=cached?.canvas||document.createElement('canvas');
        if(!cached){canvas.width=width;canvas.height=height;nativeCache.bytes+=width*height*4;}
        const main=g;
        try{g=canvas.getContext('2d',{alpha:false});g.setTransform(viewScale,0,0,viewScale,0,PAD_TOP*viewScale);paintBackground();}
        finally{g=main;}
        cached=nativeCache.background={canvas,key};
      }else cached=null;
    }
    if(!cached){paintBackground();return;}
    g.drawImage(cached.canvas,0,-PAD_TOP,cached.canvas.width/viewScale,cached.canvas.height/viewScale);
    g.fillStyle=material('#50713f');g.fillRect(0,HORIZON_Y,VW,VH+PAD_BOT-HORIZON_Y);
  }
  // Geometry is authored once per world row, never as a scrolling screen
  // texture. Only camera projection changes each frame. The bounded cache
  // retains the same deterministic soil chips, shoulders and cast shadows.
  const floorRows=new Map();let floorFrame=null;
  function floorShape(view,pts,color){
    const vertices=pts.map(([x,z])=>view.point(z,x));
    if(labMode&&(color==='#a2af50'||color==='#8da641'||color==='#526f39')){
      const branch=Math.abs(view.point(0,0).x)>1;
      if(vertices.some(p=>branch?Math.abs(p.x)<half+.2:p.x>0&&Math.abs(p.z-235)<half+.2))return null;
    }
    return {vertices,color};
  }
  // Five non-overlapping scratch buffers: camera, near/far clipping, then
  // each strip's two boundaries. No per-polygon point garbage during turns.
  const floorScratch=Array.from({length:5},()=>({points:[],result:[]}));
  function floorPoint(buffer,index,side,depth){
    const p=buffer.points[index]||(buffer.points[index]={side:0,depth:0});
    p.side=side;p.depth=depth;buffer.result[index]=p;
  }
  function floorClip(vertices,bound,greater,slot){
    const buffer=floorScratch[slot],result=buffer.result;let count=0;
    for(let i=0;i<vertices.length;i++){
      const a=vertices[i],b=vertices[(i+1)%vertices.length],ia=greater?a.depth>=bound:a.depth<=bound,
        ib=greater?b.depth>=bound:b.depth<=bound;
      if(ia)floorPoint(buffer,count++,a.side,a.depth);
      if(ia!==ib){const t=(bound-a.depth)/(b.depth-a.depth);
        floorPoint(buffer,count++,a.side+(b.side-a.side)*t,bound);}
    }
    result.length=count;return result;
  }
  function floorOutside(vertices){
    const f=floorFrame;let near=true,far=true,left=true,right=true;
    for(const p of vertices){
      if(p.depth>=f.near)near=false;if(p.depth<=f.far)far=false;
      const extent=f.frustum*(f.focal+p.depth);
      if(p.side>=-extent)left=false;if(p.side<=extent)right=false;
    }
    return near||far||left||right;
  }
  function floorCamera(vertices){
    const f=floorFrame,buffer=floorScratch[0];
    for(let i=0;i<vertices.length;i++){
      const p=vertices[i],x=p.x-f.x,z=p.z-f.z;
      floorPoint(buffer,i,x*f.cos-z*f.sin,x*f.sin+z*f.cos);
    }
    buffer.result.length=vertices.length;return buffer.result;
  }
  function appendFloor(vertices){
    const f=floorFrame;
    for(let i=0;i<vertices.length;i++){
      const p=vertices[i],inv=1/(f.focal+p.depth),dz=p.depth-f.far,
        x=VW/2+p.side*f.horizontal*inv,y=HORIZON_Y+f.vertical*dz*dz*inv;
      if(i)g.lineTo(x,y);else g.moveTo(x,y);
    }
    g.closePath();
  }
  function drawFloorShape(shape,paint=null,append=false){
    if(!shape)return;
    let vertices=floorCamera(shape.vertices);if(floorOutside(vertices))return;
    const f=floorFrame;let lo=Infinity,hi=-Infinity;
    for(const p of vertices){if(p.depth<lo)lo=p.depth;if(p.depth>hi)hi=p.depth;}
    if(lo<f.near){vertices=floorClip(vertices,f.near,true,1);lo=f.near;}
    if(hi>f.far){vertices=floorClip(vertices,f.far,false,2);hi=f.far;}
    if(vertices.length<3)return;
    if(!append){g.fillStyle=paint||material(shape.color);g.beginPath();}
    // Identical curved-ground strip spacing to Journey. Small polygons that
    // fit within one strip skip both redundant clipping passes entirely.
    const step=Math.max(1.5,(lo+f.focal)*.16),start=Math.floor(lo/step)*step;
    if(hi<start+step+.001)appendFloor(vertices);
    else for(let depth=start;depth<hi+.001;depth+=step){
      let strip=vertices;
      if(depth>lo)strip=floorClip(strip,depth,true,3);
      if(depth+step+.002<hi)strip=floorClip(strip,depth+step+.002,false,4);
      if(strip.length>=3)appendFloor(strip);
    }
    if(!append)g.fill();
  }
  function floorPoly(view,pts,color){drawFloorShape(floorShape(view,pts,color));}
  function morningPoint(branch,z,x){return branch?{x:JOURNEY_LANE_WORLD+z,z:235-x}:{x,z};}
  function waterShapes(branch,x,z,width,length,road=false,point=null){
    // One horizontal ground footprint for roadside pools AND lane obstacles.
    // Dark reflected trees, pale reflected sky and thin broken highlights read
    // as water without blur, transparency, filters or a standing sprite card.
    const shapes=[],add=(points,color)=>shapes.push({color,vertices:points.map(([a,b])=>
      point?point(z+b*length,x+a*width):morningPoint(branch,z+b*length,x+a*width))});
    const outline=[[-.52,-.28],[-.32,-.5],[.13,-.53],[.43,-.34],[.53,-.07],
      [.44,.32],[.14,.48],[-.28,.43],[-.53,.16]];
    add(outline.map(([a,b])=>[a*1.12,b*1.12]),road?'#a38e59':'#3d5d3e');
    add(outline,'#528d80');
    add([[-.48,-.26],[-.29,-.44],[.12,-.47],[.37,-.3],[.43,-.07],[.22,.05],[-.1,-.02],[-.38,.09]],'#397878');
    add([[-.43,.1],[-.19,-.1],[.17,-.07],[.41,-.22],[.48,-.04],[.39,.29],[.12,.42],[-.26,.37]],'#7ebcb2');
    add([[-.35,.13],[-.13,-.01],[.15,.04],[.3,-.04],[.39,.01],[.28,.2],[.03,.17],[-.14,.24]],'#acd7c9');
    // Broken vertical reflections merge into the darker far bank.
    add([[-.28,-.41],[-.19,-.43],[-.18,-.14],[-.12,-.11],[-.22,-.07],[-.28,-.17]],'#356960');
    add([[.1,-.44],[.17,-.42],[.15,-.22],[.22,-.16],[.13,-.13],[.08,-.25]],'#46776a');
    add([[-.33,.15],[-.07,.15],[-.02,.17],[-.3,.18]],'#e1efcf');
    add([[.04,.27],[.31,.26],[.28,.29],[.09,.3]],'#d6ebcf');
    add([[-.27,.4],[.12,.44],[.36,.3],[.32,.35],[.13,.49],[-.25,.45]],road?'#c6b77e':'#91ab68');
    return shapes;
  }
  function pathEdge(d,side){return side*(half+.12*Math.sin(d*.18)+.16*Math.sin(d*.43+side));}
  function floorRow(view,row,a,b){
    const shapes=[],add=(pts,color)=>{const shape=floorShape(view,pts,color);if(shape)shapes.push(shape);},
      z=row*4,r=R(row*37),l=pathEdge(a,-1),rr=pathEdge(a,1),lf=pathEdge(b,-1),rf=pathEdge(b,1);
    add([[l-.8,a],[rr+.8,a],[rf+.9,b],[lf-.9,b]],'#a2af50');
    add([[l,a],[rr,a],[rf,b],[lf,b]],'#d6b16f');
    for(let k=0;k<9;k++){
      const seed=row*53+k*19,x=(R(seed)-.5)*(half*2-1),zz=z+.2+R(seed+8)*3.4,
        w=.09+R(seed+11)*.34,h=.09+R(seed+12)*.42;
      if(zz<a||zz+h>b)continue;
      add([[x,zz],[x+w,zz-.03],[x+w*.83,zz+h],[x-w*.24,zz+h*.7]],
        ['#dfbb7c','#dcb776','#c8a369','#cfaa6d'][k%4]);
    }
    for(const side of [-1,1]){
      const edge=side*half;
      add([[edge,a],[edge-side*(.25+r*.7),a+.5],[edge-side*.18,a+1.2],
        [edge-side*(.5+R(row+side)*.5),a+2],[edge,a+3.8],[edge+side*.85,a+2]],'#8da641');
      if(row%2===0)add([[edge+side*.5,a+.8],[edge+side*1.5,a+.35],
        [edge+side*2.3,a+2.4],[edge+side*.3,a+2.1]],'#526f39');
    }
    if(row%4===1)for(const x of [-1.1,1.1])add(
      [[x,a+.5],[x+.18,a+.5],[x+.24,a+1.3],[x+.02,a+1.1]],'#b39664');
    if(row%5===2)add([[1.8,a+.7],[2.15,a+.85],[2.23,a+1.13],[1.76,a+1.2]],'#b4ad86');
    return shapes;
  }
  function floorSectionVisible(view,a,b){
    // Frustum planes are linear in camera space. The enclosing world box is
    // conservative even while the branch widens or the camera turns, so an
    // offscreen branch/row can be skipped before constructing its details.
    const extent=half+2.4,points=[view.point(a,-extent),view.point(a,extent),
      view.point(b,-extent),view.point(b,extent)];
    let left=Infinity,right=-Infinity,near=Infinity,far=-Infinity;
    for(const p of points){left=Math.min(left,p.x);right=Math.max(right,p.x);
      near=Math.min(near,p.z);far=Math.max(far,p.z);}
    return !floorOutside(floorCamera([{x:left,z:near},{x:right,z:near},{x:right,z:far},{x:left,z:far}]));
  }
  const groundRows=[];
  function ground(){
    const cam=journeyCameraPose(),f=CFG.FOCAL,used=new Set();
    floorFrame={x:cam.x,z:cam.z,cos:Math.cos(cam.yaw),sin:Math.sin(cam.yaw),focal:f,
      near:journeyDepthAtY(VH+PAD_BOT+32),far:CFG.Z_FAR,
      frustum:(VW/2+2)*JOURNEY_LANE_WORLD/(150*f),horizontal:150*f/JOURNEY_LANE_WORLD,
      vertical:(GROUND_Y-HORIZON_Y)*f/(CFG.Z_FAR*CFG.Z_FAR)};
    g.save();g.globalAlpha=1;
    for(const view of curvedRoadViews()){
      const from=Math.max(view.start,view.center-24),to=Math.min(view.finish,view.center+SPAWN_FAR);
      if(!floorSectionVisible(view,from,to))continue;
      const kind=Math.sign(view.point(0,0).x);
      // A continuous underpaint prevents anti-aliased row edges exposing grass.
      floorPoly(view,[[-half+.2,from],[half-.2,from],[half-.2,to],[-half+.2,to]],'#d6b16f');
      groundRows.length=0;
      // Gather rows first: a later grass strip must never paint over an
      // already antialiased soil edge. All soil cells share one opaque fill.
      for(let row=Math.floor(from/4);row*4<to;row++){
        const z=row*4,a=Math.max(from,z),b=Math.min(to,z+4.015);
        if(!floorSectionVisible(view,a,Math.max(b,a+3.8)))continue;
        let shapes;
        if(a===z&&b===z+4.015){
          const key=state.seed+':'+kind+':'+row;used.add(key);shapes=floorRows.get(key);
          if(!shapes){shapes=floorRow(view,row,a,b);floorRows.set(key,shapes);}
        }else shapes=floorRow(view,row,a,b);
        groundRows.push(shapes);
      }
      for(const shapes of groundRows)for(const shape of shapes)if(shape.color==='#a2af50')drawFloorShape(shape);
      g.beginPath();
      for(const shapes of groundRows)for(const shape of shapes)if(shape.color==='#d6b16f')drawFloorShape(shape,null,true);
      g.fillStyle=material('#d6b16f');g.fill();
      for(const shapes of groundRows)for(const shape of shapes)
        if(shape.color!=='#a2af50'&&shape.color!=='#d6b16f')drawFloorShape(shape);
      // Dappled cast shapes project in the SAME world space as the path.
      for(let row=Math.floor(from/17);row*17<to;row++){
        const z=row*17+4;
        if(z<from||z>to-4)continue;
        if(!floorSectionVisible(view,z-.4,z+2))continue;
        floorPoly(view,[[-half,z],[-half+1.3,z-.4],[-half+3.8,z+.4],[-half+3.4,z+1.2],
          [-half+2.7,z+.8],[-half+2.4,z+1.6],[-half+.6,z+1.3],[-half,z+2]],'#b7a66a');
        floorPoly(view,[[-half+2.9,z+.5],[-half+4.8,z+.85],[-half+5.4,z+1.4],[-half+3.4,z+1.2]],'#c3ac6d');
      }
    }
    for(const key of floorRows.keys())if(!used.has(key))floorRows.delete(key);
    // Pools sit under trees/props in the ground pass; their banks never cover
    // either road. Reuse the bounded deterministic placement rows.
    for(const branch of [false,true]){
      // Match scenery retirement: don't rebuild an invisible branch's cleared
      // planting rows every frame only for queueScenery to discard them again.
      if(branch&&cam.yaw===0&&235-30-cam.z>=SPAWN_FAR)continue;
      if(!branch&&cam.yaw===Math.PI/2&&30-cam.x<=sceneryNearLimit())continue;
      const center=branch?cam.x-JOURNEY_LANE_WORLD:cam.z;
      for(let row=Math.floor(Math.max(0,center-28)/18);row<=Math.ceil((center+100)/18);row++){
        for(const o of rowRecords(row,branch))if(o.kind==='pool'){
          for(const shape of o.water)drawFloorShape(shape);
        }
      }
    }
    g.restore();
  }
  function poolSite(row,branch,side){
    if(row<0||(row+(side>0?2:0))%4!==1)return null;
    const s=row*139+(branch?4001:0)+(side>0?971:227),
      x=side*(11.8+R(s+751)*3),z=row*18+9,w=5.6+R(s+759)*2.5,
      world=morningPoint(branch,z,x),hx=branch?3.3:w*.6,hz=branch?w*.6:3.3;
    if(Math.abs(world.x)<=half+hx+1||labMode&&world.x>0&&Math.abs(world.z-235)<=half+hz+1)return null;
    for(const branchRoad of [false,true])for(const root of (branchRoad?forestCorridor?.branchCourse:forestCorridor?.course)||[]){
      if(root.entity.kind!=='root')continue;
      const tree=morningPoint(branchRoad,root.z,root.entity.side==='L'?-9.3:9.3);
      if(Math.abs(tree.x-world.x)<hx+2.7&&Math.abs(tree.z-world.z)<hz+2.7)return null;
    }
    return {x,z,w,world,hx,hz};
  }
  function clearPoolFootprints(records){
    // Resolve both roads and adjacent rows during placement, not per frame.
    // A full bank + trunk/root-flare margin is reserved, including trees from
    // the neighbouring row or the perpendicular road at the junction.
    const sites=[];
    for(const branch of labMode?[false,true]:[false]){
      const values=records.map(o=>branch?o.x-JOURNEY_LANE_WORLD:o.z);
      const lo=Math.floor(Math.min(...values)/18)-1,hi=Math.floor(Math.max(...values)/18)+1;
      for(let row=lo;row<=hi;row++)for(const side of [-1,1]){
        const site=poolSite(row,branch,side);if(site)sites.push(site);
      }
    }
    return records.filter(o=>{
      if(o.kind==='pool')return true;
      const radius=o.id<3?o.w*.21+.6:o.id===4||o.id===5?o.w*.5:.35;
      return !sites.some(p=>Math.abs(o.x-p.world.x)<p.hx+radius&&Math.abs(o.z-p.world.z)<p.hz+radius);
    });
  }
  function rowRecords(row,branch){
    const key=branch+':'+row;let result=state.rows.get(key);if(result)return result;
    const seed=row*139+(branch?4001:0),base=row*18;
    result=[];
    // Three staggered world-space belts, not a screen-space forest wall.
    // The sunny verge is sparse; trunks fill the gaps behind it. Each side has
    // a different seed so the road never becomes a mirrored avenue.
    for(const side of [-1,1]){
      const grove=(row%4+4)%4,s=seed+(side>0?971:227);
      for(let belt=0;belt<3;belt++)for(let k=0;k<(belt===2?1:2);k++){
        const n=s+belt*181+k*43;
        result.push({x:side*([8.6,15,24][belt]+R(n+8)*[2.5,4,5][belt]),
          z:base+k*8+R(n+3)*6+(belt===2?5:0),
          id:Math.min(2,Math.floor(R(n+17)*3)),w:[8.2,9.2,11][belt]+R(n+12)*2});
      }
      for(let k=0;k<4;k++)result.push({x:side*(6.45+R(s+k)*2.7),z:base+k*4.5+R(s+k+19),
        id:k===grove?(R(s+41)<.4?7:3):6,w:k===grove?2.3+R(s+k+41)*1.4:1.3+R(s+k+41)*2.6,v:R(s+k+71)});
      for(let belt=0;belt<2;belt++)if(R(s+581+belt*73)<.68){
        result.push({x:side*(12+belt*8+R(s+611+belt)*3),z:base+3+R(s+631+belt)*12,
          id:R(s+641+belt)<.48?7:3,w:2.4+R(s+671+belt)*1.3});
      }
      const site=poolSite(row,branch,side);
      if(site){
        const {x,z,w,hx,hz}=site;
        result.push({kind:'pool',x,z,w,hx,hz,water:waterShapes(branch,x,z,w,5.5)});
        result.push({x:x+side*w*.77,z:z+1.8,id:6,w:2.4});
        result.push({x:x-side*w*.77,z:z-2,id:7,w:2.1});
      }
      if(grove===0)result.push({x:side*9,z:base+12,id:side>0?5:4,w:3.3});
    }
    for(const o of result){
      o.localZ=o.z;o.branch=branch;
      if(branch){const x=JOURNEY_LANE_WORLD+o.z;o.z=235-o.x;o.x=x;}
      Object.freeze(o);
    }
    result=clearPoolFootprints(result);
    state.rows.set(key,result);return result;
  }
  const sceneryPool=[];let sceneryCount=0;
  function queueScenery(){
    const cam=journeyCameraPose(),keys=new Set(),near=sceneryNearLimit(),
      sin=Math.sin(cam.yaw),cos=Math.cos(cam.yaw);sceneryCount=0;
    for(const branch of [false,true]){
      // Bounds include both verges and the outer saplings; a road outside the
      // depth range cannot contribute even a tree crown to this frame.
      if(branch&&cam.yaw===0&&235-30-cam.z>=SPAWN_FAR)continue;
      if(!branch&&cam.yaw===Math.PI/2&&30-cam.x<=near)continue;
      const center=branch?cam.x-JOURNEY_LANE_WORLD:cam.z;
      // World-coordinate rows are retained through the entire corner, rather
      // than regenerated relative to the new camera when the turn ends.
      const lo=Math.floor(Math.max(-12,center-35)/18),hi=Math.ceil((center+SPAWN_FAR+30)/18);
      for(let row=lo;row<=hi;row++){
        if(branch&&row<0)continue;
        keys.add(branch+':'+row);
        for(const o of rowRecords(row,branch)){
          if(o.kind==='pool')continue;
          // A rogue root owns its mother tree's footprint. Don't plant a second
          // tree through it or hide its connection beneath a decorative trunk.
          const course=branch?forestCorridor.branchCourse:forestCorridor.course;
          if(o.id<3&&course.some(r=>r.entity.kind==='root'&&Math.abs(o.localZ-r.z)<5&&
            Math.abs((branch?235-o.z:o.x)-(r.entity.side==='L'?-9.3:9.3))<4))continue;
          if(Math.abs(o.x)<half+1.4||o.x>0&&Math.abs(o.z-235)<half+1.4)continue;
          const dx=o.x-cam.x,dz=o.z-cam.z,depth=dx*sin+dz*cos,side=dx*cos-dz*sin;
          if(depth<=near||depth>=SPAWN_FAR)continue;
          const p=journeyProjectCamera(side,depth),m=models[o.id],
            width=o.w*150/JOURNEY_LANE_WORLD*linS(p.t),scale=width/m.width,
            clipBottom=depth>=CFG.Z_FAR?HORIZON_Y:p.y;
          // Reject before painter sorting and clipping, including a plant whose
          // whole silhouette is still buried beyond the curved-ground crest.
          if(p.x+m.right*scale<0||p.x+m.left*scale>VW||p.y+m.bottom*scale<-PAD_TOP||
            p.y+m.top*scale>Math.min(clipBottom,VH+PAD_BOT))continue;
          const item=sceneryPool[sceneryCount]||(sceneryPool[sceneryCount]={});sceneryCount++;
          item.id=o.id;item.x=p.x;item.y=p.y;item.width=width;item.clipBottom=clipBottom;
          item.alpha=treeDistanceAlpha(o,depth);
          queueWorldDraw(depth,drawScenery,item);
        }
      }
    }
    for(const key of state.rows.keys())if(!keys.has(key))state.rows.delete(key);
  }
  function drawScenery(o){
    nativeShape(o.id,o.x,o.y,o.width,o.alpha,o.clipBottom);
  }
  function drawMorningRoot(o,point=x=>morningPoint(o.morningBranch,o.morningAt,x)){
    const dir=o.side==='L'?1:-1,trunk=-dir*9.3,
      anchor=point(trunk),c=journeyCameraPoint(anchor.x,anchor.z),
      p=journeyProjectCamera(c.side,c.depth),unit=150/JOURNEY_LANE_WORLD*linS(p.t);
    nativeShape(0,p.x,p.y,9.6*unit,1,curvedSpriteClipY(c.depth));
    const paint=(pts,color)=>{
      let bottom=-Infinity;const screen=[];
      for(const [u,h] of pts){
        const world=point(trunk+dir*u),cam=journeyCameraPoint(world.x,world.z);
        if(cam.depth<=sceneryNearLimit())return;
        const q=journeyProjectCamera(cam.side,cam.depth);
        bottom=Math.max(bottom,curvedSpriteClipY(cam.depth));
        screen.push([q.x,q.y-h*150/JOURNEY_LANE_WORLD*linS(q.t)]);
      }
      g.save();g.beginPath();g.rect(-2000,-PAD_TOP-6000,4480,bottom+PAD_TOP+6000);g.clip();
      polygon(screen,color);g.restore();
    };
    // Restore the original Morning arch verbatim (rev03), reflected for R.
    // Only the short ground-root connector to its mother tree is new.
    paint([[-.3,0],[-.2,.7],[.8,.72],[2,.85],[3.35,1.05],[3.3,.55],[1.8,.33],[.6,.2]],'#775739');
    paint([[-.2,.7],[.8,.72],[2,.85],[3.35,1.05],[3.3,.86],[1.9,.64],[.6,.52]],'#b28b4f');
    const arch=(pts,color)=>paint(pts.map(([x,h])=>[5.3+x*3.36,h*85/37.5]),color);
    arch([[-.65,0],[-.58,.95],[-.43,1.18],[-.32,.93],[.44,.83],[.64,.6],[.7,0],
      [.56,0],[.48,.53],[-.38,.62],[-.47,0]],'#775739');
    arch([[-.57,.93],[-.43,1.17],[-.32,.93],[.45,.83],[.58,.62],[-.38,.76]],'#b28b4f');
    arch([[-.54,.94],[-.43,1.17],[-.32,.93],[.44,.83],[.31,.72],[-.4,.87]],'#8bac46');
    arch([[-.43,1.18],[-.49,1.26],[-.43,1.3],[-.36,1.21],[-.32,.93]],'#d3b06d');
    const jumps=o.req.filter(req=>req==='jump').length;
    if(jumps){
      const end=jumps===2?14.9:10.9;
      paint([[7.45,.12],[7.75,.55],[8.4,.68],[end-.8,.58],[end,.23],[end+.15,.02],
        [end-.8,.08],[8,.12]],'#775739');
      paint([[7.75,.55],[8.4,.68],[end-.8,.58],[end,.23],[end-.8,.4],[8.3,.48]],'#b28b4f');
      paint([[8.4,.68],[9.5,.65],[9.3,.53],[8.4,.53]],'#8bac46');
    }
  }
  function drawHazard(o,side,depth){
    if(depth>SPAWN_FAR||depth<o.type.cullZ)return;
    if(o.kind==='pond'){
      g.save();g.globalAlpha=obstacleDistanceAlpha(o,depth);
      for(const shape of o.morningWater)drawFloorShape(shape);
      g.restore();return;
    }
    if(o.kind==='root'){
      g.save();g.globalAlpha=treeDistanceAlpha(o,depth);drawMorningRoot(o);g.restore();return;
    }
    const p=journeyProjectCamera(side,depth),s=linS(p.t),unit=150/JOURNEY_LANE_WORLD*s,
      width=o.lanes.length*JOURNEY_LANE_WORLD*.84;
    g.save();g.globalAlpha=obstacleDistanceAlpha(o,depth);
    g.beginPath();g.rect(-2000,-PAD_TOP-6000,4480,curvedSpriteClipY(depth)+PAD_TOP+6000+2);g.clip();
    if(o.kind==='boulder'){
      const lanes=Math.max(1,o.lanes.length);
      nativeShape(4,p.x,p.y,Math.max(2.8,width)*unit,1,Infinity,.8*(1+.18*(lanes-1))/lanes);
    }
    g.restore();
  }
  function updateMorning(dt){
    if(!state.playing)return;
    const mv=journeyStepDistance(speed()*dt);dist+=mv;roadScroll=dist;curvedGroundDistance+=mv;runDistance+=mv;
    for(const item of forestCorridor.course){item.entity.prevZ=item.entity.z;item.entity.z=item.z-dist;}
    updateJourneyPrototype(dt,mv);
    // Safe art trial: movement/jump/duck/turn are real; no death interrupts QA.
    obstacles=journeyActiveRoad()?[]:forestCorridor.course.map(o=>o.entity).filter(o=>o.z>o.type.cullZ);
    if(journey.phase==='branch'||journey.phase==='settling'){
      obstacles=forestCorridor.branchCourse.map(o=>{o.entity.prevZ=o.entity.z;o.entity.z=o.z-journey.branchTravel;return o.entity;})
        .filter(o=>o.z>o.type.cullZ);
    }
    const meter=Math.floor(dist);
    if(meter!==state.displayedMeter){state.displayedMeter=meter;uiDistance.textContent=meter+' m';}
  }
  function start(){
    state.restarting=true;
    try{startForestCorridor('journey');}finally{state.restarting=false;}
    forestCorridor.morning=true;forestCorridor.chunks.clear();
    journey=createJourneyState(240,1,false);journey.gateSpawned=true;
    const course=(rows,branch=false)=>rows.map(([kind,z,lane,sizeRoll=.3])=>{
      let req=[null,null,null],variant=['L','M','R'][lane];req[lane]='jump';
      if(kind==='root'){
        const pattern=OBSTACLE_SPAWN_PATTERNS.get('root').create({side:variant,out:lane,inn:2-lane,sizeRoll,lastFull:false});
        req=pattern.req;variant=pattern.variant;
      }
      const entity=new ObstacleEntity(kind,z,req,variant);entity.seed=7341+z;
      entity.morningAt=z;entity.morningBranch=branch;
      if(kind==='pond')entity.morningWater=waterShapes(branch,(lane-1)*JOURNEY_LANE_WORLD,z,3.7,3.2,true);
      const drawLane=(Math.min(...entity.lanes)+Math.max(...entity.lanes))/2,
        offset=(drawLane-1)*JOURNEY_LANE_WORLD;
      // Visual ownership is independent of the active collision/lane stream.
      // Both roads exist before, during and after the corner, like the trees.
      const world={entity,lane:drawLane,...morningPoint(branch,z,offset)};
      return {entity,z,world};
    });
    forestCorridor.course=course([['boulder',65,1],['pond',114,0],['root',163,0,.72],['boulder',300,2],['root',345,2,.3]]);
    forestCorridor.branchCourse=course([['boulder',45,0],['pond',95,1],['root',150,2,.96],['root',220,0,.3]],true);
    obstacles=forestCorridor.course.map(o=>o.entity);pickups=[];roadsideScenery=[];
    particles.length=0;state.rows.clear();floorRows.clear();floorFrame=null;state.displayedMeter=-1;
    prepareNativeCache();state.playing=true;pauseButton.textContent='DURAKLAT';panel.hidden=false;
    setCurvedWorldTrial(true);paused=false;state.ready=true;
    cvs.style.imageRendering='auto';document.title='Knight Rush — Morning Forest Lab';
  }
  if(!labMode){
    window.KRSunlitArt={active:journeyForest,models,nativeShape,withPalette,material,polygon,
      background:(palette,yaw)=>{const previous=backgroundYaw;try{backgroundYaw=yaw;withPalette(palette,background);}finally{backgroundYaw=previous;}},
      prepare:prepareNativeCache,reserveSurface,releaseSurface,
      clear:()=>{state.rows.clear();floorRows.clear();clearNativeCache();riderLightCache=null;},
      setSeed:seed=>{if(state.seed!==seed){state.seed=seed;state.rows.clear();floorRows.clear();}},
      setFloorFrame:frame=>{floorFrame=frame;},floorSectionVisible,floorRow,drawFloorShape,waterShapes,
      rowRecords,root:drawMorningRoot,
      trimRows:keys=>{for(const key of state.rows.keys())if(!keys.has(key))state.rows.delete(key);},
      report:()=>({cacheBytes:nativeCache.bytes,budgetBytes:nativeCache.budgetBytes,rows:state.rows.size,models:models.length})};
    return;
  }
  drawBackground=function(){if(active())background();else original.background();};
  buildWorldDrawQueue=function(stage,newForest){
    original.queue(stage,newForest);
    if(!active())return;
    // Replace only the phase-dependent hazard entries. All other painter items
    // stay intact, and gameplay arrays are never mutated by rendering.
    let write=0;
    for(const item of DRAW_QUEUE)if(item.draw!==drawObstacleEntity&&item.draw!==drawJourneyObstacle)
      DRAW_QUEUE[write++]=item;
    DRAW_QUEUE.length=write;FRONT_OBSTACLES.length=0;JOURNEY_FRONT_OBSTACLES.length=0;
    const overArch=hasRelic('greaves')&&isAirborne();
    for(const course of [forestCorridor.course,forestCorridor.branchCourse])for(const record of course){
      const item=record.world,o=item.entity,depth=journeyCameraPoint(item.x,item.z).depth;
      if(depth<o.type.cullZ||depth>SPAWN_FAR)continue;
      if(obstacleDrawsOverRider(o,depth,overArch))JOURNEY_FRONT_OBSTACLES.push({item,depth});
      else queueWorldDraw(depth,drawJourneyObstacle,item);
    }
    DRAW_QUEUE.sort(compareWorldDepthDescending);
  };
  drawCurvedRoadWorld=function(){if(active())ground();else original.road();};
  queueRoadsideWorld=function(newForest){if(active())queueScenery();else original.scenery(newForest);};
  drawGroundMaskedWorldItem=function(draw,ref,depth,stage){
    // The lab's scenery renderer already source-crops against the exact crest.
    // Production's generic mask would repeat that work for every distant item.
    const nativeRoot=(draw===drawObstacleEntity?ref:draw===drawJourneyObstacle?ref.entity:null)?.kind==='root';
    if(active()&&(draw===drawScenery||nativeRoot))draw(ref);else original.masked(draw,ref,depth,stage);
  };
  updateForestCorridor=function(dt){if(active())updateMorning(dt);else original.update(dt);};
  prepareForestBaked=function(){if(!active())original.baked();};
  populateJourneyTrees=function(){if(!active())original.populate();};
  drawObstacleEntity=function(o,stage){if(active()){
    const lane=(Math.min(...o.lanes)+Math.max(...o.lanes))/2;drawHazard(o,(lane-1)*JOURNEY_LANE_WORLD,o.z);
  }else original.obstacle(o,stage);};
  drawJourneyObstacle=function(item,stage){if(active()){
    const c=journeyCameraPoint(item.x,item.z);drawHazard(item.entity,c.side,c.depth);
  }else original.journeyObstacle(item,stage);};
  drawAmbient=function(){if(!active())original.ambient();};
  drawVignette=function(){if(!active())original.vignette();};
  drawParticles=function(...args){if(!active())original.particles(...args);};
  drawForestTestStatus=function(){if(!active())original.status();};
  resetRun=function(){
    const was=active();original.reset();
    if(was&&!state.restarting){state.rows.clear();floorRows.clear();floorFrame=null;clearNativeCache();
      sceneryPool.length=0;riderLightCache=null;state.ready=false;panel.hidden=true;}
  };
  setMode=function(next,...args){
    const leaving=active()&&['menu','charsel','score'].includes(next);
    const result=original.mode(next,...args);
    if(leaving&&!state.restarting){
      state.rows.clear();floorRows.clear();floorFrame=null;clearNativeCache();sceneryPool.length=0;
      riderLightCache=null;state.ready=false;panel.hidden=true;forestCorridor=null;
    }
    return result;
  };
  // F8's old projection is not an art variant of this candidate.
  document.addEventListener('keydown',e=>{if(active()&&e.code==='F8'){
    e.preventDefault();e.stopImmediatePropagation();setCurvedWorldTrial(true);
  }},true);
  const panel=document.createElement('aside');panel.id='morning-lab-controls';
  panel.innerHTML='<strong>SUNLIT WOOD / 05</strong><span>Sabah ormanı · knight ışık denemesi</span><div><button data-action="restart">BAŞTAN</button><button data-action="pause">DURAKLAT</button><button data-action="corner">KAVŞAĞA GİT</button><button data-action="lighting" aria-pressed="true">IŞIK: SABAH</button></div><small>← → şerit · ↑ zıpla · ↓ eğil<br>Sağ şeritte tekrar →: patikaya dön<br>Hasar kapalı · çizimler onay bekliyor · <b>0 m</b></small>';
  const style=document.createElement('style');style.textContent=`
    #morning-lab-controls{position:fixed;left:16px;top:16px;z-index:20;width:210px;box-sizing:border-box;padding:16px;
      background:#173b30ed;border:1px solid #acc38460;border-radius:9px;color:#fff1cb;font:12px/1.5 system-ui;box-shadow:0 4px 24px #142b3820}
    #morning-lab-controls strong{display:block;letter-spacing:1.8px;font-size:13px}#morning-lab-controls span{display:block;color:#c3d3ae;margin:5px 0 12px}
    #morning-lab-controls button{border:1px solid #cfcc9260;color:#fcf0c8;background:#365941;border-radius:4px;padding:7px;margin:0 4px 5px 0;cursor:pointer;font:10px system-ui}
    #morning-lab-controls small{display:block;color:#cad7b6;margin-top:7px;font-size:10px}
    @media(max-width:820px){#morning-lab-controls{left:8px;top:auto;bottom:8px;width:calc(100% - 16px);padding:8px 12px}
      #morning-lab-controls span,#morning-lab-controls small{display:none}#morning-lab-controls strong{font-size:10px;margin-bottom:5px}
      #morning-lab-controls div{display:inline}#morning-lab-controls button{margin-bottom:0;padding:6px 9px}}
  `;
  document.head.appendChild(style);document.body.appendChild(panel);
  const pauseButton=panel.querySelector('[data-action=pause]'),uiDistance=panel.querySelector('b');
  function setRiderLighting(enabled){
    state.lighting=!!enabled;const button=panel.querySelector('[data-action=lighting]');
    button.textContent=state.lighting?'IŞIK: SABAH':'IŞIK: ORİJİNAL';button.setAttribute('aria-pressed',String(state.lighting));
  }
  panel.addEventListener('click',e=>{
    const action=e.target.dataset.action;if(!state.ready||!action)return;
    if(action==='restart')start();
    if(action==='pause'){paused=!paused;pausePhotoMode=paused;pauseButton.textContent=paused?'DEVAM':'DURAKLAT';}
    if(action==='lighting')setRiderLighting(!state.lighting);
    if(action==='corner'){
      start();dist=216;roadScroll=dist;curvedGroundDistance=dist;
      for(const o of forestCorridor.course)o.entity.z=o.z-dist;
      player.lane=2;player.x=2;
    }
  });
  function boot(){
    try{
      start();
      document.documentElement.dataset.morningForestReady='1';
    }catch(e){state.error=String(e);panel.querySelector('span').textContent='Test başlatılamadı. Yenileyerek tekrar dene.';console.error(e);}
    lastTime=performance.now();requestAnimationFrame(frame);
  }
  window.KRMorningForest={restart:start,setRiderLighting,
    inspectWorld:()=>Array.from(state.rows.values()).flatMap(row=>row.map(o=>({
      x:o.x,z:o.z,id:o.id,width:o.w,kind:o.kind||'plant',
      waterBounds:o.water?o.water.flatMap(shape=>shape.vertices.map(p=>({x:p.x,z:p.z}))):null}))),
    report:()=>({ready:state.ready,error:state.error,
    active:active(),rows:state.rows.size,draws:state.draws,
    riderLighting:state.lighting?'morning-materials-v1':'original',
    renderer:'native-polygons',imagePixels:null,decodedBytes:0,assets:null,
    nativeModels:models.length,nativePaths:models.reduce((sum,m)=>sum+m.shapes.length,0),
    floorRows:floorRows.size,visibleScenery:sceneryCount,
    cache:{bytes:nativeCache.bytes,budgetBytes:nativeCache.budgetBytes,
      entries:nativeCache.models.size+(nativeCache.background?1:0)},
    visualApproval:'pending-user-review'})};
  boot();
})();
