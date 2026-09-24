/* Journey integration: the route owns topology, distance, events and hazards.
   This adapter owns only Sunlit Forest presentation and spatial biome colour. */
(()=>{
 'use strict';
 const art=window.KRSunlitArt;if(!art)throw Error('Sunlit forest art must load first');
 const base={background:drawBackground,ground:drawCurvedRoadWorld,scenery:queueRoadsideWorld,
  tree:drawJourneyTree,obstacle:drawObstacleEntity,oldObstacle:drawJourneyObstacle,
  ambient:drawAmbient,vignette:drawVignette,reset:resetRun,mode:setMode,
  blood:drawJourneyBloodGround,service:drawJourneyServiceGround,disco:drawJourneyDiscoGround,
  commit:commitJourneyEdge,finish:finishJourneyCornerTurn,queue:buildWorldDrawQueue,endTrees:journeyEndTrees,masked:drawGroundMaskedWorldItem};
 const active=art.active,half=CURVED_ROAD_HALF,unit=150/JOURNEY_LANE_WORLD;
 const floors=new Map(),palettes=new Map(),water=new Map(),usedFloorKeys=new Set(),usedWaterKeys=new Set(),itemPool=[];
 let owner=null,views=[],rowKeys=new Set(),items=[],frameId=-1;
 // Material targets, not a translucent screen overlay. Three broad values
 // remain distinct on the exact same foliage, bark and soil geometry.
 const materialTargets={disco:{
  '#65b2e8':'#414d6c','#86c9ed':'#808da2','#acdced':'#ada8b5',
  '#7eabb0':'#626b83','#5f8d89':'#535c70','#5b8061':'#51465e',
  '#285d40':'#2d3047','#376643':'#38344d','#23583c':'#282c41',
  '#528b41':'#695186','#67984b':'#7c6095','#4b8341':'#5d497b',
  '#95b951':'#ae8cbf','#b2c85f':'#bc9bc9','#91b44b':'#a27db4',
  '#805936':'#62506a','#b58b50':'#a78877','#4f432d':'#333342',
  '#775739':'#58445d','#b28b4f':'#997580','#8bac46':'#806383','#d3b06d':'#bb9699',
  '#50713f':'#3f3b51','#d6b16f':'#756775','#a2af50':'#786477','#8da641':'#6b5971','#526f39':'#4f405d',
  '#83bfcb':'#414d6c','#cce5bf':'#808da2','#e5e5ab':'#ada8b5',
  '#edd68a':'#b6a4ca','#fff2bb':'#ece1ec','#638953':'#51465e','#94ad70':'#797487',
  // Distance stays quiet. The stage and its lamps, not the mountains, glow.
  '#d7e5d9':'#696a83','#f6f3d9':'#9290a7','#7daba8':'#626b83','#a0c3b4':'#858c9d',
  '#789a69':'#535c70','#9db77c':'#717d8a','#889366':'#655d71','#b1b98a':'#82798f',
  '#407749':'#394953','#88a949':'#6e8290','#507940':'#405961',
  '#f3ecc5':'#cddcdb','#dcb04a':'#d6af65','#8061b5':'#996baf','#b19bdf':'#c09acb',
  '#658744':'#4c5361','#9bb24e':'#7e8490',
  '#6b7b76':'#59606d','#a9b4a0':'#89959e','#4d6460':'#383f50','#526965':'#465061',
  '#86a44b':'#57687a','#bed069':'#9cabb0',
  '#735437':'#51424a','#b18b54':'#8b7275','#89663e':'#6e5961','#d2b076':'#ba9d86',
  '#9c7748':'#806579','#739447':'#4b5968','#a9bd59':'#7d8690',
  '#dfbb7c':'#807484','#dcb776':'#7b6e7d','#c8a369':'#66576b','#cfaa6d':'#6d6074',
  '#b39664':'#55465a','#b4ad86':'#9a8f9e','#b7a66a':'#544356','#c3ac6d':'#665465',
  '#3d5d3e':'#303946','#528d80':'#476a79','#397878':'#324c65','#7ebcb2':'#7497aa',
  '#acd7c9':'#a5c4d1','#356960':'#303e53','#46776a':'#41536b','#e1efcf':'#d0dfdf',
  '#d6ebcf':'#bad2d7','#91ab68':'#556f73'},
 bloodwood:{
  '#65b2e8':'#612b3b','#86c9ed':'#ac5056','#acdced':'#d68b70',
  '#7eabb0':'#6a5865','#5f8d89':'#674650','#5b8061':'#52383f',
  '#285d40':'#381d24','#376643':'#42212a','#23583c':'#311a23',
  '#528b41':'#863140','#67984b':'#973d46','#4b8341':'#742c3a',
  '#95b951':'#c45a4c','#b2c85f':'#cf6851','#91b44b':'#b94e48',
  '#805936':'#472730','#b58b50':'#885048','#4f432d':'#2b2028',
  '#775739':'#513039','#b28b4f':'#8a5349','#8bac46':'#7d4449','#d3b06d':'#b6816d',
  '#50713f':'#33262c','#d6b16f':'#7e3539','#a2af50':'#873d45','#8da641':'#68303d','#526f39':'#472832',
  '#dfbb7c':'#944a48','#dcb776':'#89403f','#c8a369':'#692b33','#cfaa6d':'#763139',
  '#b39664':'#542730','#b4ad86':'#966359','#b7a66a':'#542b34','#c3ac6d':'#63313a',
  '#83bfcb':'#443642','#cce5bf':'#80646a','#e5e5ab':'#b18a79',
  '#edd68a':'#bd7156','#fff2bb':'#e6a576','#638953':'#52383f','#94ad70':'#826068',
  '#d7e5d9':'#66535e','#f6f3d9':'#94777b','#7daba8':'#6a5865','#a0c3b4':'#96767b',
  '#789a69':'#674650','#9db77c':'#8b6066','#889366':'#5c4045','#b1b98a':'#886669',
  // Existing plants keep their silhouettes, but no sugary pink/green meadow.
  '#407749':'#4a2430','#88a949':'#93483e','#507940':'#603139',
  '#f3ecc5':'#b6907c','#dcb04a':'#65313a','#8061b5':'#872e3f','#b19bdf':'#b35451',
  '#658744':'#5f3036','#9bb24e':'#a55648',
  '#6b7b76':'#625159','#a9b4a0':'#9b8278','#4d6460':'#392b37','#526965':'#493942',
  '#86a44b':'#64373e','#bed069':'#9e5a4f',
  '#735437':'#42252c','#b18b54':'#815144','#89663e':'#63393b','#d2b076':'#b88869',
  '#9c7748':'#744638','#739447':'#63323e','#a9bd59':'#9c5048',
  '#3d5d3e':'#301c27','#528d80':'#742533','#397878':'#471925','#7ebcb2':'#9b3945',
  '#acd7c9':'#bc635e','#356960':'#321923','#46776a':'#58212d','#e1efcf':'#d88d77',
  '#d6ebcf':'#be6c62','#91ab68':'#62303a'}};
 const pool=[],decorClearances=[];let count=0,headingRoute=null,headingCount=-1,heading=0;
 function prepareDecorClearances(){
  decorClearances.length=0;
  for(const theme of ['disco','bloodwood'])for(const view of journeyDiscoRoadViews(theme)){
   if(view.spill){decorClearances.push(view.point(view.begin+42.5,view.onlySide*7));continue;}
   // Keep the existing seeded prop layout. Reserve its ground footprint in
   // the NEW planting system, rather than moving or hiding the old props.
   for(const decor of journeyRoadDecorLayout(view.edge)){
    const p=view.point(decor.at,decor.offset),c=journeyCameraPoint(p.x,p.z);
    if(c.depth>-45&&c.depth<SPAWN_FAR+35)decorClearances.push(p);
   }
  }
 }
 function palette(theme,amount){
  const step=Math.round(clamp(amount,0,1)*16);if(!step||theme==='forest')return null;
  let tiers=palettes.get(theme);if(!tiers){tiers=[];palettes.set(theme,tiers);}
  if(tiers[step])return tiers[step];
  const key=theme+':'+step;
  const colors=new Map(),profile={id:key,color(color){
   const cached=colors.get(color);if(cached!==undefined)return cached;
   const n=parseInt(color.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;
   let target;
   if(theme==='disco')target=[r*.72+b*.13,g*.66+b*.08,b*.84+r*.08];
   else if(theme==='bloodwood')target=[r*.85+g*.08,g*.55+b*.06,b*.58+r*.10];
   else if(theme==='forge')target=[r*1.04+g*.07,g*.78,b*.78];
   else if(theme==='caravan')target=[r*.88,g*.98,b*1.13];
   else if(theme==='inn')target=[r*1.09,g*.91,b*.76];
   else target=[r*1.05,g*.96,b*.83];
   const hex=materialTargets[theme]?.[color]||'#'+target.map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('');
   const result=mixCol(color,hex,step/16);colors.set(color,result);return result;
  }};tiers[step]=profile;return profile;
 }
 function atPalette(edge,at){return palette(edge?.preview.theme||'forest',
   journeyThemeStrength(edge,at,edge?.preview.theme));}
 // Large sky surfaces need a continuous ramp, not the 16 material tiers used
 // by stationary world props. Reuse one profile and its small color table;
 // do not create a screen-sized cache (or retain palettes) at every distance.
 const skyColors=new Map();
 const skyProfile={id:'continuous-sky',continuous:true,amount:0,target:null,color(color){
  if(!skyColors.has(color))skyColors.set(color,mixCol(color,this.target.color(color),this.amount));
  return skyColors.get(color);
 }};
 function skyPalette(edge,at){
  const theme=edge?.preview.theme,amount=journeyThemeStrength(edge,at,theme);
  if(!amount||!theme||theme==='forest')return null;
  const target=palette(theme,1);if(amount===1)return target;
  skyProfile.amount=amount;skyProfile.target=target;skyColors.clear();return skyProfile;
 }
 function groundColor(edge,at,color){
  const theme=edge?.preview.theme;
  // Natural biome soil starts at the forest colour and changes with location.
  // ONLY Disco's manufactured dance deck has a hard entrance; its separate
  // opaque tile renderer must not dictate Crimson/forest material blending.
  const amount=journeyThemeStrength(edge,at,theme);
  if(!amount||!theme||theme==='forest')return color;
  const target=palette(theme,1).color(color);return amount===1?target:mixCol(color,target,amount);
 }
 function groundPaint(view,edge,a,b,color){
  const c0=groundColor(edge,view.at(a),color),c1=groundColor(edge,view.at(b),color);
  if(c0===c1)return c0;
  const project=(d,x)=>{const w=view.point(d,x),c=journeyCameraPoint(w.x,w.z);return journeyProjectCamera(c.side,c.depth);};
  const p=project(a,0),q=project(b,0),l=project((a+b)/2,-half),r=project((a+b)/2,half);
  // Gradient is perpendicular to the projected road cross-section. It remains
  // painted into the same opaque soil polygon while a side road rotates.
  const tx=r.x-l.x,ty=r.y-l.y,len=Math.hypot(tx,ty)||1,nx=-ty/len,ny=tx/len,
    reach=(q.x-p.x)*nx+(q.y-p.y)*ny;
  if(!Number.isFinite(reach)||Math.abs(reach)<.05)return c0;
  const paint=g.createLinearGradient(p.x,p.y,p.x+nx*reach,p.y+ny*reach);
  paint.addColorStop(0,c0);paint.addColorStop(1,c1);return paint;
 }
 // Lighting touches supported rider materials, never the approved rig or UI.
 // A warm key still separates steel from the cooler forest ambient shadows.
 const riderProfiles={
  disco:{armor:'#9797b2',armorDark:'#484c68',armorLight:'#d7cee6',steel:'#b5c3d3',steelLight:'#ecedf5'},
  bloodwood:{armor:'#a2989d',armorDark:'#554553',armorLight:'#ddbaa8',steel:'#bfb0ae',steelLight:'#f1d7bf'}
 };
 let riderCache=null;
 function riderAppearance(source){
  const edge=journeyActiveEdge(),theme=edge?.preview.theme,profile=riderProfiles[theme];
  if(!active()||!profile)return source;
  const step=Math.round(journeyThemeStrength(edge,dist,theme)*16);if(!step)return source;
  if(riderCache?.source===source&&riderCache.key===theme+step)return riderCache.value;
  const value={...source};for(const key in profile)value[key]=mixCol(source[key],profile[key],step/16);
  // Horse stays brown, plume stays blue, heraldry remains recognizable.
  value.horse=mixCol(source.horse,theme==='disco'?'#6b4d62':'#815044',step/16*.24);
  value.horseMane=mixCol(source.horseMane,theme==='disco'?'#303245':'#392b36',step/16*.3);
  riderCache={source,key:theme+step,value};return value;
 }
 function globalYaw(){
  if(headingRoute!==journeyRoute||headingCount!==journeyRoute.chosen.length){
   headingRoute=journeyRoute;headingCount=journeyRoute.chosen.length;
   const chosen=new Set(journeyRoute.chosen);heading=0;
   for(const node of journeyRoute.nodes)for(const edge of node.out)if(chosen.has(edge.id))heading+=edge.direction;
  }
  return (heading-(journeyActiveRoad()?journeyTurnDirection():0))*Math.PI/2+journeyCameraPose().yaw;
 }
 function getViews(){
  return curvedRoadViews().map(view=>{
   const p=view.point(0,0),direction=Math.sign(p.x),side=direction!==0;
   let node=journeyNode(journeyActiveRoad()?journeyRoute.from:journeyRoute.next);
   if(!journeyActiveRoad()&&journeyRoute.pendingArm&&journey.passedNodeId)node=journeyNode(journey.passedNodeId);
   const edge=side?node?.out.find(e=>e.direction===direction):null;
   return {...view,direction,origin:p,key:[direction,p.x,p.z,view.offset].join(':'),
    at:d=>side?(node?.at??journeyForkDistance())+d:d,
    edgeAt:d=>side?edge:journeyActiveRoad()?(d>journeyNode(journeyRoute.from).at
      ?journeyNode(journeyRoute.from).out.find(e=>e.direction===0):journey.oldRoadEdge):journeyForestEdgeAt(d)};
  });
 }
 function insideRoad(p,margin=1.3,except=null){
  for(const v of views){if(v===except)continue;
   const d=v.direction?v.direction*(p.x-v.origin.x):p.z;
   if(d<v.start-margin||d>v.finish+margin)continue;
   const side=v.direction?Math.abs(p.z-v.origin.z):Math.abs(p.x);
   if(side<half*(v.direction?journeyBranchWidth(Math.max(0,d)):1)+margin)return true;
  }return false;
 }
 function begin(){
  if(owner!==journeyRoute){owner=journeyRoute;floors.clear();water.clear();art.clear();headingRoute=null;}
  art.setSeed(journeyRoute.seed);art.prepare();
  if(frameId===journeyRenderSerial)return;
  frameId=journeyRenderSerial;views=getViews();rowKeys.clear();items.length=0;rootPositions();prepareDecorClearances();
  const cam=journeyCameraPose(),f=CFG.FOCAL;
  art.setFloorFrame({x:cam.x,z:cam.z,cos:Math.cos(cam.yaw),sin:Math.sin(cam.yaw),focal:f,
   near:journeyDepthAtY(VH+PAD_BOT+32),far:CFG.Z_FAR,
   frustum:(VW/2+2)*JOURNEY_LANE_WORLD/(150*f),horizontal:unit*f,
   vertical:(GROUND_Y-HORIZON_Y)*f/(CFG.Z_FAR*CFG.Z_FAR)});
  for(const view of views){
   const low=Math.max(view.start,view.center-35),high=Math.min(view.finish,view.center+SPAWN_FAR+30);
   // Include all four planting belts in coarse frustum/depth rejection.
   for(let row=Math.floor((low+view.offset)/18);row<=Math.ceil((high+view.offset)/18);row++){
    const d=row*18-view.offset;
    const a=view.point(d,-36),b=view.point(d+18,36),ca=journeyCameraPoint(a.x,a.z),cb=journeyCameraPoint(b.x,b.z);
    if(Math.max(ca.depth,cb.depth)<sceneryNearLimit()-10||Math.min(ca.depth,cb.depth)>SPAWN_FAR+30)continue;
    rowKeys.add('false:'+row);
    for(const o of art.rowRecords(row,false)){
     const z=o.localZ-view.offset;if(z<view.start||z>view.finish)continue;
     const p=view.point(z,o.x),c=journeyCameraPoint(p.x,p.z);
     if(c.depth<sceneryNearLimit()||c.depth>SPAWN_FAR)continue;
     let projected=null,width=0,clip=0;
     if(o.kind!=='pool'){
      projected=journeyProjectCamera(c.side,c.depth);width=o.w*unit*linS(projected.t);
      const m=art.models[o.id],s=width/m.width;clip=curvedSpriteClipY(c.depth);
      // Reject outer-belt trees before palette/road/prop-footprint work.
      if(projected.x+m.right*s<0||projected.x+m.left*s>VW||projected.y+m.top*s>clip)continue;
     }
     if(insideRoad(p,o.kind==='pool'?o.w*.6+1:o.id<3?2.1:.4))continue;
     if((o.id<3||o.kind==='pool')&&rootAnchors.some(root=>
       Math.abs(p.x-root.x)<(o.kind==='pool'?o.w*.6+2.6:4)&&Math.abs(p.z-root.z)<(o.kind==='pool'?6:5)))continue;
     const clearance=o.kind==='pool'?o.w*.6+2.6:o.id<3?3.4:2.6;
     if(decorClearances.some(decor=>Math.abs(p.x-decor.x)<clearance&&Math.abs(p.z-decor.z)<4.5))continue;
     const pal=atPalette(view.edgeAt(z),view.at(z));
     const item=itemPool[items.length]||(itemPool[items.length]={});
     item.record=o;item.view=view;item.z=z;item.p=p;item.c=c;item.palette=pal;
     item.projected=projected;item.width=width;item.clip=clip;items.push(item);
    }
   }
  }
  art.trimRows(rowKeys);
 }
 const groundRows=[],groundRowPool=[];
 function ground(){
  begin();const used=usedFloorKeys;used.clear();usedWaterKeys.clear();g.save();g.globalAlpha=1;
  for(const view of views){
   const from=Math.max(view.start,view.center-24),to=Math.min(view.finish,view.center+SPAWN_FAR);
   if(!art.floorSectionVisible(view,from,to))continue;
   groundRows.length=0;
   for(let row=Math.floor((from+view.offset)/4);row*4-view.offset<to;row++){
    const start=row*4-view.offset,a=Math.max(from,start),b=Math.min(to,start+4.015);
    if(!art.floorSectionVisible(view,a,Math.max(b,a+3.8)))continue;
    const key=view.key+':'+row+':'+a+':'+b;used.add(key);
    let shapes=floors.get(key);
    if(!shapes){
     const local={point:(d,x)=>view.point(d-view.offset,x)};
     shapes=art.floorRow(local,row,a+view.offset,b+view.offset).filter(shape=>{
      if(!['#a2af50','#8da641','#526f39'].includes(shape.color))return true;
      return !shape.vertices.some(p=>insideRoad(p,.3,view));
     });floors.set(key,shapes);
    }
    const rowInfo=groundRowPool[groundRows.length]||(groundRowPool[groundRows.length]={});
    Object.assign(rowInfo,{shapes,a,b,edge:view.edgeAt((a+b)/2)});groundRows.push(rowInfo);
   }
   // Paint every grassy backing BEFORE any soil. Repainting grass per cell
   // exposed thin green horizontal seams through the soil's antialiased edge.
   for(const {shapes,a,b,edge}of groundRows)for(const shape of shapes)
    if(shape.color==='#a2af50')art.drawFloorShape(shape,groundPaint(view,edge,a,b,shape.color));
   let batchPaint=null;
   const flush=()=>{if(batchPaint!==null){g.fillStyle=batchPaint;g.fill();batchPaint=null;}};
   for(const {shapes,a,b,edge}of groundRows)for(const shape of shapes)if(shape.color==='#d6b16f'){
    const paint=groundPaint(view,edge,a,b,shape.color);
    if(typeof paint==='string'){
     if(paint!==batchPaint){flush();batchPaint=paint;g.beginPath();}
     art.drawFloorShape(shape,paint,true);
    }else{flush();art.drawFloorShape(shape,paint);}
   }
   flush();
   // Preserve small draw paths: batching disconnected detail polygons reduced
   // CPU submissions but regressed DPR2 frame pacing on the test host.
   for(const {shapes,a,b,edge}of groundRows)for(const shape of shapes){
     if(shape.color==='#d6b16f'||shape.color==='#a2af50')continue;
     if(edge?.preview.theme==='disco'&&
       !['#d6b16f','#a2af50','#8da641','#526f39'].includes(shape.color))continue;
     art.drawFloorShape(shape,groundColor(edge,view.at((a+b)/2),shape.color));
   }
  }
  for(const key of floors.keys())if(!used.has(key))floors.delete(key);
  for(const item of items)if(item.record.kind==='pool'){
   const {record:o,view,z}=item;
   // Every bank and reflection uses the same road transform as its trees.
   const key=view.key+':'+o.x+':'+z;usedWaterKeys.add(key);
   let shapes=water.get(key);
   if(!shapes){shapes=art.waterShapes(false,o.x,z,o.w,5.5,false,view.point);water.set(key,shapes);}
   art.withPalette(item.palette,()=>{for(const shape of shapes)art.drawFloorShape(shape);});
  }
  for(const key of water.keys())if(!usedWaterKeys.has(key))water.delete(key);
  g.restore();
 }
 function queueScenery(){
  begin();count=0;
  for(const item of items){
   const o=item.record;if(o.kind==='pool')continue;
   const p=item.projected,width=item.width;
   const entry=pool[count]||(pool[count]={});count++;
   Object.assign(entry,{id:o.id,x:p.x,y:p.y,width,alpha:treeDistanceAlpha(o,item.c.depth),
    clip:item.clip,palette:item.palette});
   queueWorldDraw(item.c.depth,drawScenery,entry);
  }
  queueCurvedEndTrees();
 }
 function drawScenery(o){art.withPalette(o.palette,()=>art.nativeShape(o.id,o.x,o.y,o.width,o.alpha,o.clip));}
 let endGroves=new WeakMap();
 journeyEndTrees=function(node,edge){
  if(!active())return base.endTrees(node,edge);
  let trees=endGroves.get(node);if(trees)return trees;
  trees=[];
  // A dead end is a grove, not two exposed ranks of trunks. Stagger several
  // rooted rows behind the road stop; all use the existing world projection.
  for(let row=0;row<4;row++)for(let i=-8;i<=8;i++){
   const v=sRnd(journeyRoute.seed*.001+node.row*71+row*31+i*13);
   trees.push({old:true,endCap:true,x:i*3.2+(row%2?1.6:0),
    z:node.at+22+row*5.5+v*1.4,v,
    discoAmount:journeyDiscoStrength(edge,node.at),discoEntryId:edge?.direction?edge.id:null,
    bloodAmount:journeyThemeStrength(edge,node.at,'bloodwood')});
  }
  endGroves.set(node,trees);return trees;
 };
 function drawEndTree(tree,stage){
  if(!active())return base.tree(tree,stage);
  const c=journeyTreeCameraPoint(tree);if(c.depth<=sceneryNearLimit()||c.depth>=treeVisibilityFar(tree))return;
  const p=journeyProjectCamera(c.side,c.depth),pal=tree.bloodAmount?palette('bloodwood',tree.bloodAmount):palette('disco',tree.discoAmount||0);
  const id=Math.min(2,Math.floor(tree.v*3)),width=(9.6+tree.v*2)*unit*linS(p.t),m=art.models[id],s=width/m.width,
   clip=curvedSpriteClipY(c.depth);
  if(p.x+m.right*s<0||p.x+m.left*s>VW||p.y+m.top*s>clip)return;
  art.withPalette(pal,()=>art.nativeShape(id,p.x,p.y,width,treeDistanceAlpha(tree,c.depth),clip));
 }
 function lanePoint(o,d=0,x=0){
  const cam=journeyCameraPose(),sin=Math.sin(cam.yaw),cos=Math.cos(cam.yaw);
  return {x:cam.x+x*cos+(o.z+d)*sin,z:cam.z-x*sin+(o.z+d)*cos};
 }
 let rootAnchors=[];
 function rootPositions(){
  rootAnchors.length=0;
  for(const o of obstacles)if(o.kind==='root'&&o.roadTheme!=='disco')rootAnchors.push(lanePoint(o,0,o.side==='L'?-9.3:9.3));
  for(const item of journey.oldObstacles||[])if(item.entity.kind==='root'&&item.entity.roadTheme!=='disco')
   rootAnchors.push({x:item.x-(item.lane-1)*JOURNEY_LANE_WORLD+(item.entity.side==='L'?-9.3:9.3),z:item.z});
  for(const item of journey.sunlitPreview?.obstacles||[])if(item.entity.kind==='root'&&item.entity.roadTheme!=='disco')
   rootAnchors.push(item.point(0,item.entity.side==='L'?-9.3:9.3));
 }
 function hazard(o,point,depth,side){
  if(depth<o.type.cullZ||depth>SPAWN_FAR)return;
  g.save();g.globalAlpha=obstacleDistanceAlpha(o,depth);
  const pal=o.roadTheme==='bloodwood'?palette('bloodwood',o.bloodAmount||1):null;
  art.withPalette(pal,()=>{
   if(o.kind==='root')art.root(o,x=>point(0,x));
   if(o.kind==='boulder')art.rock(o,point);
   if(o.kind==='pond')for(const group of obstacleLaneGroups(o.lanes)){
    const lane=(group.start+group.end)/2;
    for(const shape of art.waterShapes(false,(lane-1)*JOURNEY_LANE_WORLD,0,(group.end-group.start+1)*3.7,3.2,true,point))art.drawFloorShape(shape);
   }
  });g.restore();
 }
 // Prepare the selected road's regular spawn stream during the turn, not in
 // the first post-turn frame. Same pattern generator and clearance contracts;
 // these exact entities (and coins) transfer to gameplay once the turn ends.
 commitJourneyEdge=function(edge){
  const accepted=base.commit(edge);
  if(!accepted||!active()||journey.phase!=='turning')return accepted;
  const sourceObstacles=obstacles,sourcePickups=pickups,sourceTrees=roadsideScenery;
  const arrival=journey.turnStartDist+journey.turnForward,atBase=journeyNode(journeyRoute.from).at,
    dir=journeyTurnDirection(),corner=journeyForkDistance()-5;
  let next=arrival+Math.max(18,JOURNEY_WIDEN_DISTANCE-journey.turnExitTravel+12);
  const point=(at,x)=>({x:dir*(JOURNEY_LANE_WORLD+at-atBase),z:corner-dir*x});
  try{
   obstacles=[];pickups=[];roadsideScenery=[];
   while(next<arrival+SPAWN_FAR&&next<stageDistance()-30){
    const at=next;next+=CFG.SPAWN_GAP;
    const road=journeySpawnRoadAt(at);if(!road||at>stageDistance()-40||journeySpawnClearance(road,at))continue;
    spawnPattern(at-dist);
   }
   journey.sunlitPreview={next,
    obstacles:obstacles.map(entity=>{const at=dist+entity.z,lane=(Math.min(...entity.lanes)+Math.max(...entity.lanes))/2;
     return {entity,at,lane,...point(at,(lane-1)*JOURNEY_LANE_WORLD),point:(d,x)=>point(at+d,x)};}),
    pickups:pickups.map(entity=>{const at=dist+entity.z;return {entity,at,...point(at,(entity.lane-1)*JOURNEY_LANE_WORLD)};})};
  }finally{obstacles=sourceObstacles;pickups=sourcePickups;roadsideScenery=sourceTrees;}
  return accepted;
 };
 finishJourneyCornerTurn=function(){
  const preview=active()?journey.sunlitPreview:null;base.finish();
  if(!preview)return;
  obstacles=preview.obstacles.map(item=>{item.entity.z=item.entity.prevZ=item.at-dist;return item.entity;});
  pickups=preview.pickups.map(item=>{item.entity.z=item.at-dist;return item.entity;});
  nextSpawnAt=preview.next;journey.sunlitPreview=null;
 };
 function drawPreview(item,stage){
  const c=journeyCameraPoint(item.x,item.z),o=item.entity;
  if(o.roadTheme==='disco'||o.roadTheme==='bloodwood'&&o.kind!=='root'){
   const p=journeyProjectCamera(c.side,c.depth),local=laneX(item.lane,p.t);
   g.save();g.translate(p.x-local,0);base.obstacle({...o,z:c.depth},stage);g.restore();
  }else hazard(o,item.point,c.depth,c.side);
 }
 buildWorldDrawQueue=function(stage,newForest){
  base.queue(stage,newForest);
  if(!active()||journey.phase!=='turning'||!journey.sunlitPreview)return;
  for(const item of journey.sunlitPreview.obstacles){const c=journeyCameraPoint(item.x,item.z);
   if(c.depth>item.entity.type.cullZ&&c.depth<SPAWN_FAR)queueWorldDraw(c.depth,drawPreview,item);}
  for(const item of journey.sunlitPreview.pickups)queueWorldDraw(journeyCameraPoint(item.x,item.z).depth,drawJourneyPickup,item);
  DRAW_QUEUE.sort(compareWorldDepthDescending);
 };
 drawBackground=function(){if(!active())return base.background();begin();
  art.background(skyPalette(journeyActiveEdge(),dist),globalYaw());};
 drawCurvedRoadWorld=function(){if(active())ground();else base.ground();};
 queueRoadsideWorld=function(newForest){if(active())queueScenery();else base.scenery(newForest);};
 drawJourneyTree=drawEndTree;
 drawGroundMaskedWorldItem=function(draw,ref,depth,stage){
  // Native trees already crop against the curved ground. End groves used to
  // receive the same generic mask a second time, including cached trees.
  if(active()&&(draw===drawEndTree||draw===drawScenery))return draw(ref,stage);
  return base.masked(draw,ref,depth,stage);
 };
 drawObstacleEntity=function(o,stage){
  if(!active()||o.roadTheme==='disco'||o.roadTheme==='bloodwood'&&o.kind!=='root')return base.obstacle(o,stage);
  // Lane stream uses camera-facing coordinates; project them into the SAME
  // fixed road frame as Journey's curved ground, including the settling phase.
  const cam=journeyCameraPose(),sin=Math.sin(cam.yaw),cos=Math.cos(cam.yaw),
   point=(d,x)=>({x:cam.x+x*cos+(o.z+d)*sin,z:cam.z-x*sin+(o.z+d)*cos}),
   lane=(Math.min(...o.lanes)+Math.max(...o.lanes))/2;
  hazard(o,point,o.z,(lane-1)*JOURNEY_LANE_WORLD);
 };
 drawJourneyObstacle=function(item,stage){
  const o=item.entity;
  if(!active()||o.roadTheme==='disco'||o.roadTheme==='bloodwood'&&o.kind!=='root')return base.oldObstacle(item,stage);
  const c=journeyCameraPoint(item.x,item.z),point=(d,x)=>({x:item.x+x-(item.lane-1)*JOURNEY_LANE_WORLD,z:item.z+d});
  hazard(o,point,c.depth,c.side);
 };
 // New road colours already include these themes; keep the dance tiles and
 // all event/decor/venue queues, without painting the old green road over them.
 drawJourneyBloodGround=function(){if(!active())base.blood();};
 drawJourneyServiceGround=function(){if(!active())base.service();};
 drawAmbient=function(){if(!active())base.ambient();};
 drawVignette=function(){if(!active())base.vignette();};
 // All road fights stop the road. Retain only the opaque scenery BEHIND the
 // first live actor, at screen resolution, inside the SAME 5 MiB art budget.
 // Near scenery still draws after the wolf in its original painter order.
 let battlePlate=null,battleCandidate=null,battleRejected=null,battleBuilds=0,battleHits=0;
 function clearBattlePlate(){
  if(battlePlate)art.releaseSurface(battlePlate.canvas);
  battlePlate=null;battleCandidate=null;battleRejected=null;
 }
 function drawBattleWorld(stage,newForest){
  if(newForest||!active()||mode!=='boss'||!boss?.roadEventToken||journey.phase==='turning'||
    journey.phase==='settling'||obstacles.length||pickups.length||journey.oldObstacles?.length||
    journey.oldPickups?.length){clearBattlePlate();return false;}
  // These particles must remain BEHIND scenery, so use the original full
  // painter pipeline on such frames instead of baking or reordering effects.
  if(particles.some(p=>p.behindBoss&&!p.behindPlayer))return false;
  const camera=journeyCameraPose(),key=[viewScale,PAD_TOP,PAD_BOT,dist,roadScroll,curvedGroundDistance,
    camera.x,camera.z,camera.yaw,boss.z,journey.phase,journeyRoute.activeEdge,
    journeyRoute.eventRecords[boss.roadEventToken]?.status].join(':');
  if(battlePlate&&(battlePlate.key!==key||battlePlate.boss!==boss||battlePlate.canvas.width===1))clearBattlePlate();
  if(battleRejected===key)return false;
  if(!battlePlate){
   // A changed camera must settle before a large surface is rebuilt.
   if(battleCandidate!==key){battleCandidate=key;return false;}
   begin();
   const canvas=art.reserveSurface(Math.ceil(VW*viewScale),Math.ceil((VH+PAD_TOT)*viewScale));
   if(!canvas){battleRejected=key;return false;} // No repeated failed allocations/queue builds.
   updateEffHorizon();buildWorldDrawQueue(stage,false);
   const allowed=d=>d===drawScenery||d===drawEndTree||d===drawJourneyBloodDecor||d===drawJourneyBloodLair;
   const split=DRAW_QUEUE.findIndex(d=>!allowed(d.draw));
   if(split<0){art.releaseSurface(canvas);battleRejected=key;return false;}
   // Unknown/new props, dancers, pickups and actors are live by default.
   // Only the explicitly static prefix is baked, not the rest of the queue.
   const main=g;
   try{
    g=canvas.getContext('2d',{alpha:false});g.setTransform(viewScale,0,0,viewScale,0,PAD_TOP*viewScale);
    g.imageSmoothingEnabled=main.imageSmoothingEnabled;stage.bg();
    for(let i=0;i<split;i++){const d=DRAW_QUEUE[i];drawGroundMaskedWorldItem(d.draw,d.ref,d.z,stage);}
   }catch(error){art.releaseSurface(canvas);throw error;}finally{g=main;}
   battlePlate={canvas,key,boss,tail:DRAW_QUEUE.slice(split).map(d=>({...d}))};battleBuilds++;
  }
  const c=battlePlate.canvas;
  g.drawImage(c,0,-PAD_TOP,c.width/viewScale,c.height/viewScale);
  updateEffHorizon();FRONT_OBSTACLES.length=0;JOURNEY_FRONT_OBSTACLES.length=0;
  for(const d of battlePlate.tail)drawGroundMaskedWorldItem(d.draw,d.ref,d.z,stage);
  battleHits++;return true;
 }
 function clear(){clearBattlePlate();art.clear();floors.clear();water.clear();items.length=0;itemPool.length=0;pool.length=0;owner=null;frameId=-1;endGroves=new WeakMap();}
 resetRun=function(){clear();return base.reset();};
 setMode=function(next,...args){const result=base.mode(next,...args);if(next!=='boss')clearBattlePlate();if(['menu','charsel','score','town'].includes(next))clear();return result;};
 window.KRSunlitForest={active,riderAppearance,drawBattleWorld,clearBattlePlate,
  roadColorAt:(edge,at)=>groundColor(edge,at,'#d6b16f'),
  materialAt:(theme,amount,color)=>palette(theme,amount)?.color(color)||color,
  report:()=>({...art.report(),active:active(),floorRows:floors.size,
  visibleScenery:count,battleCacheBytes:battlePlate?battlePlate.canvas.width*battlePlate.canvas.height*4:0,
  battleBuilds,battleHits,renderer:'sunlit-journey',legacyGameplay:true}),
  inspect:()=>items.map(i=>({x:i.p.x,z:i.p.z,id:i.record.id,kind:i.record.kind||'plant',palette:i.palette?.id||'forest'}))};
})();
