/* Real Canvas pixels, without a browser. Set KNIGHT_CANVAS_MODULE to the installed
   @napi-rs/canvas module path when it is not on Node's normal module path. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {createCanvas}=require(process.env.KNIGHT_CANVAS_MODULE||'@napi-rs/canvas');
const canvas=createCanvas(480,800),noop=()=>{};
function decorate(c){return Object.assign(c,{style:{},dataset:{},addEventListener:noop,
  removeEventListener:noop,setPointerCapture:noop,getBoundingClientRect:()=>({left:0,top:0,width:480,height:800})});}
decorate(canvas);
const root={dataset:{},style:{},clientWidth:480,clientHeight:800};
const document={documentElement:root,hidden:false,hasFocus:()=>true,addEventListener:noop,
  getElementById:id=>id==='game'?canvas:{style:{},offsetHeight:0},
  createElement:tag=>tag==='canvas'?decorate(createCanvas(480,800)):{style:{},dataset:{}}};
const sandbox={console,document,localStorage:{getItem:()=>null,setItem:noop},
  navigator:{userAgent:'canvas-audit',maxTouchPoints:0},performance:{now:()=>0},
  devicePixelRatio:1,innerWidth:480,innerHeight:800,location:{search:''},URLSearchParams,
  requestAnimationFrame:noop,cancelAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,
  addEventListener:noop,removeEventListener:noop,AudioContext:function(){},Uint8ClampedArray};
sandbox.window=sandbox;sandbox.globalThis=sandbox;sandbox.visualViewport=null;
const source=fs.readFileSync('KnightRush.html','utf8').match(/<script>([\s\S]*?)<\/script>/i)[1];
vm.createContext(sandbox);vm.runInContext(source,sandbox,{timeout:30000});
const out=path.resolve('output/journey-ground-qa');fs.mkdirSync(out,{recursive:true});
function shot(name,setup){vm.runInContext(setup+';render();',sandbox,{timeout:10000});
  fs.writeFileSync(path.join(out,name+'.png'),canvas.toBuffer('image/png'));}
module.exports={sandbox,canvas,shot,out,run:code=>vm.runInContext(code,sandbox,{timeout:10000})};
if(require.main===module){
vm.runInContext("debugRun=false;godMode=false;startRun(0);runJourneyPrototype=true;journey=createJourneyState();",sandbox);
// The incoming treeline already exists before the swipe. Compare the actual
// depth-sorted tree pixels on both sides of the turn's START boundary.
vm.runInContext(`
  dist=153;roadScroll=dist;nextTreeAt=dist-3;spawnLoopEntities();updateJourneyPrototype(0,0);
  player.x=0;player.lane=0;
  function auditDrawJourneyTrees(){
    g.globalAlpha=1;g.clearRect(0,0,480,800);DRAW_QUEUE.length=0;drawItemCount=0;
    if(journey.phase==='approach'){
      for(const t of roadsideScenery)queueWorldDraw(t.z,drawRoadsideSceneryEntity,t);
      for(const t of journey.sideTrees){const p=journeyTreeCameraPoint(t);
        if(p.depth>-6&&p.depth<SPAWN_FAR)queueWorldDraw(p.depth,drawJourneyTree,t);}
    }else queueJourneyTrees();
    DRAW_QUEUE.sort(compareWorldDepthDescending);
    for(const item of DRAW_QUEUE)item.draw(item.ref,BIO());
    g.globalAlpha=1;
  }
  const preparedTrees=journey.sideTrees.slice();auditDrawJourneyTrees();
`,sandbox);
const treeEntryBefore=Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data);
vm.runInContext(`
  tryJourneyCornerTurn();
  if(!preparedTrees.length||preparedTrees.some((t,i)=>journey.sideTrees[i]!==t))
    throw new Error('Turn rebuilt the prepared treeline');
  auditDrawJourneyTrees();
`,sandbox);
const treeEntryAfter=Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data);
if(!treeEntryBefore.equals(treeEntryAfter))throw new Error('Trees snap on the turn start frame');
vm.runInContext("journey=createJourneyState();roadsideScenery=[];",sandbox);
// Obstacles and all pickup sprites keep their identity and world position.
// At turn input the old-route drawing and rotated-world drawing must match.
vm.runInContext(`
  dist=153;journey=createJourneyState();player.x=0;player.lane=0;
  obstacles=[new ObstacleEntity('boulder',14,['jump',null,null],'L'),
    new ObstacleEntity('pond',20,[null,'jump',null],'M'),
    new ObstacleEntity('root',28,[null,null,'duck'],'R')];
  obstacles[2].treeV=.37;
  pickups=[{kind:'coin',lane:1,z:16},{kind:'arrow',lane:2,z:23},{kind:'lance',lane:0,z:32}];
  const retainedObstacles=obstacles.slice(),retainedPickups=pickups.slice();
  function auditDrawRoadActors(rotated){
    g.globalAlpha=1;g.clearRect(0,0,480,800);DRAW_QUEUE.length=0;drawItemCount=0;
    if(rotated){
      for(const o of journey.oldObstacles)queueWorldDraw(journeyCameraPoint(o.x,o.z).depth,drawJourneyObstacle,o);
      for(const c of journey.oldPickups)queueWorldDraw(journeyCameraPoint(c.x,c.z).depth,drawJourneyPickup,c);
    }else{
      for(const o of obstacles)queueWorldDraw(o.z,drawObstacleEntity,o);
      for(const c of pickups)queueWorldDraw(c.z,drawPickupEntity,c);
    }
    DRAW_QUEUE.sort(compareWorldDepthDescending);
    for(const item of DRAW_QUEUE)item.draw(item.ref,BIO());
    g.globalAlpha=1;
  }
  auditDrawRoadActors(false);
`,sandbox);
const actorsBefore=Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data);
vm.runInContext(`
  tryJourneyCornerTurn();
  if(retainedObstacles.some((o,i)=>journey.oldObstacles[i].entity!==o)||
     retainedPickups.some((c,i)=>journey.oldPickups[i].entity!==c))
    throw new Error('Corner discarded or replaced existing actors');
  auditDrawRoadActors(true);
`,sandbox);
if(!actorsBefore.equals(Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data)))
  throw new Error('Obstacle/item sprites snap on turn input');
shot('actors-turn-start',"perfNow=8");
vm.runInContext(`
  const retainedPositions=journey.oldObstacles.map(o=>[o.x,o.z]);
  updateJourneyPrototype(.22,speed()*.22);updateRunCollisions();
  if(journey.oldObstacles.length!==3||journey.oldPickups.length!==3||!player.alive)
    throw new Error('Actors vanish or collide while still visible during the turn');
  if(journey.oldObstacles.some((o,i)=>o.x!==retainedPositions[i][0]||o.z!==retainedPositions[i][1]))
    throw new Error('Old-road actors drift out of world space');
`,sandbox);
shot('actors-turn-middle',"perfNow=8.22");
// The slab's two ends have different depths as the camera turns. Its baseline
// must slant with the old road; a billboard would keep both ends at the same Y.
vm.runInContext(`
  const stone=journey.oldObstacles[0];journeyObstacleSurface(stone);
  const sx0=laneX(-.44,1),sx1=laneX(.44,1),
    a=journeyProjectTexturedVertex(journeyObstacleVertex(stone,sx0,GROUND_Y)),
    b=journeyProjectTexturedVertex(journeyObstacleVertex(stone,sx1,GROUND_Y));
  if(Math.abs(a.y-b.y)<3)throw new Error('Obstacle still faces the camera instead of its road');
  const topA=journeyProjectTexturedVertex(journeyObstacleVertex(stone,sx0,GROUND_Y-38.4)),
    topB=journeyProjectTexturedVertex(journeyObstacleVertex(stone,sx1,GROUND_Y-38.4));
  if(Math.abs((a.y-topA.y)-(b.y-topB.y))<.1)
    throw new Error('Obstacle face lacks depth-dependent perspective');
  journey.turnT=.5;player.x=.5;
`,sandbox);
shot('actors-turn-oblique',"perfNow=8.31");
vm.runInContext(`
  g.clearRect(0,0,480,800);drawJourneyStoneVolume(stone,1);
  const faceLeft=-1.44*JOURNEY_LANE_WORLD,faceRight=-.56*JOURNEY_LANE_WORLD,
    faceFront=stone.z,faceBack=stone.z+1.35,
    faceSide=journeyCameraPose().x<stone.x?faceLeft:faceRight,
    facePoint=(x,z,height)=>journeyProjectTexturedVertex({...journeyCameraPoint(x,z),height});
  const faceCenters=[
    facePoint((faceLeft+faceRight)/2,(faceFront+faceBack)/2,38.4),
    facePoint(faceSide,(faceFront+faceBack)/2,19.2)
  ];
  for(const p of faceCenters){
    const alpha=g.getImageData(Math.round(p.x),Math.round(p.y),1,1).data[3];
    if(alpha!==255)throw new Error('Stone top/side is translucent: '+alpha);
  }
`,sandbox);
vm.runInContext(`
  journey.turnT=1;updateJourneyPrototype(0,0);
  journey.phase='branch';journey.branchTravel=80;updateJourneyPrototype(0,0);
  if(journey.oldObstacles.length||journey.oldPickups.length)
    throw new Error('Actors behind the camera were never culled');
  journey=createJourneyState();roadsideScenery=[];obstacles=[];pickups=[];
`,sandbox);
shot('far',"dist=115;roadScroll=dist;perfNow=10;nextTreeAt=dist-3;spawnLoopEntities()");
shot('mouth',"dist=153;roadScroll=dist;perfNow=11;roadsideScenery=[];obstacles=[];pickups=[];nextTreeAt=dist-3;spawnLoopEntities();updateJourneyPrototype(0,0);player.x=0;player.lane=0");
shot('turn-half',"tryJourneyCornerTurn();journey.turnT=.5;player.x=.5;perfNow=12");
shot('narrow',"journey.turnT=1;updateJourneyPrototype(0,0);spawnLoopEntities();perfNow=13");
shot('wide',"const travelToWide=48-journey.branchTravel;dist+=travelToWide;for(const t of roadsideScenery)t.z-=travelToWide;for(const o of obstacles)o.z-=travelToWide;for(const c of pickups)c.z-=travelToWide;updateJourneyPrototype(0,travelToWide);spawnLoopEntities();perfNow=14");
shot('original',"journey.phase='branch';perfNow=15");
// Reproduce the reported one-frame transition, with the same camera base,
// clock and texture. Changing only phase must not replace any ground pixels.
vm.runInContext("dist=153;roadScroll=160;journey=createJourneyState();player.x=0;player.lane=0;tryJourneyCornerTurn();journey.turnT=1;perfNow=16;",sandbox);
shot('handoff-before',"player.x=1");
const turnEndFrame=Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data);
vm.runInContext("g.clearRect(0,0,480,800);drawJourneyTurningRoadSystem();",sandbox);
const turnEndRoad=Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data);
vm.runInContext("updateJourneyPrototype(0,0);g.clearRect(0,0,480,800);drawJourneyTurningRoadSystem();",sandbox);
const settledRoad=Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data);
if(!turnEndRoad.equals(settledRoad))throw new Error('Road snaps on the turn/settling phase boundary');
shot('handoff-after',"player.x=1");
const settledFrame=Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data);
if(!turnEndFrame.equals(settledFrame))throw new Error('World scenery snaps at turn handoff');
// Check the actual final rotating frame too, not just the state boundary.
vm.runInContext("journey.phase='turning';journey.turnT=.999;g.clearRect(0,0,480,800);drawJourneyTurningRoadSystem();",sandbox);
const penultimate=canvas.getContext('2d').getImageData(0,0,480,800).data;
function roadEdges(pixels,y){
  let left=240,right=240;
  while(left>0&&pixels[(y*480+left-1)*4+3]>128)left--;
  while(right<479&&pixels[(y*480+right+1)*4+3]>128)right++;
  return [left,right];
}
for(const y of [550,650,720,780]){
  const a=roadEdges(penultimate,y),b=roadEdges(settledRoad,y);
  if(Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]))>3)
    throw new Error('Near-ground edge jumps on the last rotating frame at y='+y+': '+a+' -> '+b);
}
// Reject trunks on either road, before the camera starts moving as well.
vm.runInContext(`
  dist=153;journey=createJourneyState();roadsideScenery=[];
  spawnRoadsideScenery(7,-2.8,.3); // inside the new mouth
  if(roadsideScenery.length)throw new Error('Tree spawned on the side-road mouth');
  spawnRoadsideScenery(30,-2.8,.3); // ordinary verge, unaffected
  if(roadsideScenery.length!==1)throw new Error('Normal verge tree was lost');
  player.lane=0;player.x=0;tryJourneyCornerTurn();
  for(const t of journey.sideTrees){
    const x=-JOURNEY_LANE_WORLD-t.d,z=160+t.off*4*1.2*journeyTreeWidth(t.d);
    if(journeyRoadContainsWorldPoint(x,z))throw new Error('New tree overlaps a road footprint');
  }
  if(journey.oldTrees.some(t=>journeyRoadContainsWorldPoint(t.x,t.z)))
    throw new Error('Old treeline blocks the junction');
`,sandbox);
// Forward camera velocity survives the turning -> straight handoff.
vm.runInContext(`
  journey=createJourneyState();dist=153;player.lane=0;player.x=0;tryJourneyCornerTurn();
  if(journeySpeedScale()!==1)throw new Error('Turn slows the runner');
  journey.turnT=.999;const beforeCornerEnd=journeyCameraPose();
  journey.turnT=1;const atCornerEnd=journeyCameraPose();
  const exitSpeed=(beforeCornerEnd.x-atCornerEnd.x)/(.001*.62);
  if(Math.abs(exitSpeed-speed())/speed()>.02)throw new Error('Camera brakes before exit');
  updateJourneyPrototype(0,0);const afterCornerEnd=journeyCameraPose();
  if(Math.hypot(afterCornerEnd.x-atCornerEnd.x,afterCornerEnd.z-atCornerEnd.z)>.001)
    throw new Error('Camera jumps at exit');
  if(!roadsideScenery.length||journey.sideTrees.length)
    throw new Error('Normal route did not take ownership of corner scenery');
  const gateKinds=new Set(),gateCoverage=new Set(),gateRandom=Math.random;
  let gateSeed=913;Math.random=()=>((gateSeed=(gateSeed*1664525+1013904223)>>>0)/4294967296);
  try{for(let i=0;i<1200;i++){
    dist=145;journey=createJourneyState();journey.nextSideTree=SPAWN_FAR+1;
    obstacles=[];pickups=[];updateJourneyPrototype(0,0);updateJourneyPrototype(0,0);
    const gates=obstacles.filter(o=>o.journeyGate);
    if(gates.length!==1||!gates[0].type.solid||!gates[0].lanes.length)
      throw new Error('Corner must have one normal obstacle pattern');
    gateKinds.add(gates[0].kind);
    gateCoverage.add(gates[0].kind+':'+gates[0].lanes.length);
    dist=166;updateJourneyPrototype(0,0);
    if(!player.alive)throw new Error('Corner has a scripted death');
  }}finally{Math.random=gateRandom;}
  if(gateKinds.size!==3)throw new Error('Corner must include root, pond and boulder');
  for(const kind of ['root','pond','boulder'])for(const count of [1,2,3])
    if(!gateCoverage.has(kind+':'+count))throw new Error('Missing corner pattern '+kind+':'+count);
`,sandbox);
// No forced lateral snap, no conflicting lane easing, no last-frame lean pop.
vm.runInContext(`
  dist=153;journey=createJourneyState();player.lane=0;player.x=.18;
  const entryLean=playerRoadLean();tryJourneyCornerTurn();
  if(player.x!==.18||playerRoadLean()!==entryLean)throw new Error('Knight snaps on turn input');
  for(const fps of [30,60,120]){
    journey.turnT=0;journey.phase='turning';player.lane=0;player.x=.18;
    let prevLean=entryLean;
    while(journey.phase==='turning'){
      updateJourneyPrototype(1/fps,speed()/fps);
      const position=player.x;updatePlayer(1/fps);
      if(player.x!==position)throw new Error('Lane controller fights turn position');
      if(Math.abs(playerRoadLean()-prevLean)>.2)throw new Error('Knight lean pops at '+fps+'fps');
      prevLean=playerRoadLean();
    }
    if(player.x!==1||playerRoadLean()!==0)throw new Error('Knight does not settle smoothly');
  }
`,sandbox);
// Shared placement policy must produce the exact same trees for the same RNG.
vm.runInContext(`
  const realRandom=Math.random;
  const seeded=()=>{let seed=19;return ()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);};
  try{
    obstacles=[];roadsideScenery=[];dist=153;journey=createJourneyState();
    runJourneyPrototype=false;Math.random=seeded();let row=5;
    while(row<SPAWN_FAR)row+=spawnRoadsideSceneryRow(row,dist+row);
    const normalTrees=JSON.stringify(roadsideScenery);
    runJourneyPrototype=true;Math.random=seeded();populateJourneyTrees();
    const cornerTrees=JSON.stringify(journey.sideTrees.map(t=>new RoadsideSceneryEntity(t.d,t.off,t.v,t.gnd)));
    if(normalTrees!==cornerTrees||journey.nextSideTree!==row)throw new Error('Corner tree policy differs from main');
    const spawnSample=branch=>{
      Math.random=seeded();obstacles=[];pickups=[];lastObsFull=false;
      dist=225;nextSpawnAt=dist+24;nextTreeAt=dist+SPAWN_FAR+1;
      minibossSpawned=true;journey.phase='branch';runJourneyPrototype=branch;spawnLoopEntities();
      return JSON.stringify({obstacles:obstacles.map(o=>({kind:o.kind,z:o.z,req:o.req,side:o.side})),pickups,nextSpawnAt});
    };
    const branchSpawn=spawnSample(true),mainSpawn=spawnSample(false);
    if(branchSpawn!==mainSpawn||!obstacles.some(o=>o.type.solid))
      throw new Error('New route obstacle spawning differs from main');
  }finally{Math.random=realRandom;runJourneyPrototype=true;}
`,sandbox);
// Full-width road/tree rendering is pixel-identical, without replacing trees
// on the frame that the throat finishes widening.
vm.runInContext("journey.phase='settling';journey.branchTravel=48;g.clearRect(0,0,480,800);for(const t of roadsideScenery)drawRoadsideSceneryEntity(t,BIO());",sandbox);
const branchTrees=Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data);
vm.runInContext("journey.phase='branch';runJourneyPrototype=false;g.clearRect(0,0,480,800);for(const t of roadsideScenery)drawRoadsideSceneryEntity(t,BIO());",sandbox);
if(!branchTrees.equals(Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data)))
  throw new Error('Full-width tree rendering differs from main');
vm.runInContext("runJourneyPrototype=true;g.globalAlpha=1;",sandbox);
// While approaching, only perspective changes: the side texture cannot crawl.
vm.runInContext("journey=createJourneyState();dist=153;perfNow=20;roadScroll=153;g.clearRect(0,0,480,800);drawJourneyRouteSystem();",sandbox);
const stillSide=Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data);
vm.runInContext("perfNow=21;roadScroll=154;g.clearRect(0,0,480,800);drawJourneyRouteSystem();",sandbox);
if(!stillSide.equals(Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data)))
  throw new Error('Side road animates before the turn');
// Full-width transition must reproduce original road pixels exactly.
vm.runInContext("journey.phase='settling';journey.branchTravel=48;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,480,800);drawJourneySettlingRoad();",sandbox);
const widened=Buffer.from(canvas.getContext('2d').getImageData(0,286,480,514).data);
vm.runInContext("g.clearRect(0,0,480,800);drawRoad();",sandbox);
const original=Buffer.from(canvas.getContext('2d').getImageData(0,286,480,514).data);
let changed=0;for(let i=0;i<widened.length;i++)if(widened[i]!==original[i])changed++;
if(changed)throw new Error('Full-width road texture differs in '+changed+' channels');
// Fractional viewport scaling exposed horizontal seams that 1:1 screenshots
// missed. The solid road centre must have no transparent scanline boundaries.
vm.runInContext("journey.phase='settling';journey.branchTravel=0;g.clearRect(0,0,480,800);"+
  "g.setTransform(1.375,0,0,1.375,0,0);drawJourneySettlingRoad();g.setTransform(1,0,0,1,0,0);",sandbox);
const roadColumn=canvas.getContext('2d').getImageData(330,450,1,340).data;
for(let i=3;i<roadColumn.length;i+=4)if(roadColumn[i]!==255)
  throw new Error('Fractional viewport has a horizontal seam at row '+(450+(i-3)/4));
// Tall-phone overscan: the near verge must keep expanding below the rider,
// never inherit a vertical edge from the source canvas's clipping rectangle.
canvas.height=1100;
vm.runInContext("PAD_BOT=300;journey.phase='settling';journey.branchTravel=0;perfNow=22;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,480,1100);drawJourneySettlingRoad();",sandbox);
const tallRoad=canvas.getContext('2d').getImageData(0,0,480,1100).data;
let lastWidth=0;
for(const y of [700,800,900,1000,1080]){
  const edges=roadEdges(tallRoad,y),width=edges[1]-edges[0];
  if(width<lastWidth+15)throw new Error('Road bottom becomes vertical at y='+y);
  lastWidth=width;
}
fs.writeFileSync(path.join(out,'tall-road-bottom.png'),canvas.toBuffer('image/png'));
canvas.height=800;
vm.runInContext("PAD_BOT=0;g.setTransform(1,0,0,1,0,0);",sandbox);
// A side road must stay on the ground even when its far end is beyond the
// horizon, and must disappear entirely when its mouth is out of view.
for(const distance of [30,115,153]){
  vm.runInContext("journey=createJourneyState();dist="+distance+
    ";g.clearRect(0,0,480,800);drawJourneyRouteSystem();",sandbox);
  const sky=canvas.getContext('2d').getImageData(0,0,480,286).data;
  for(let i=3;i<sky.length;i+=4)if(sky[i])throw new Error('Side road rendered above horizon');
  if(distance===30){const frame=canvas.getContext('2d').getImageData(0,0,480,800).data;
    for(let i=3;i<frame.length;i+=4)if(frame[i])throw new Error('Distant mouth was not culled');}
}
console.log('JOURNEY_PIXELS_OK full-width road identical; frames: '+out);
// The new forest renderer has one pinhole camera for ALL ground contacts.
vm.runInContext(`
  dist=153;runJourneyPrototype=true;journey=createJourneyState();
  forestWorldFrame={camera:forestCamera()};
  for(const lane of [0,1,2]){
    const p=forestProject([(lane-1)*4,0,dist]);
    if(Math.abs(p.x-laneX(lane,1))>.001||Math.abs(p.y-GROUND_Y)>.001)
      throw new Error('World projection disagrees with the gameplay contact plane');
  }
  const groundAt=d=>forestProject([0,0,dist+d]);
  for(const d of [16,30,60,76,100,140]){
    const before=groundAt(d+.01),at=groundAt(d),after=groundAt(d-.01),
      v0=at.y-before.y,v1=after.y-at.y;
    if(v0<=0||v1<=0||Math.abs(v1/v0-1)>.01)
      throw new Error('World arrival has a velocity discontinuity at '+d);
  }
  const topVisibility=d=>{
    const near=forestProject([0,1,dist+d-.7]),far=forestProject([0,1,dist+d+1.7]);
    return Math.abs(near.y-far.y)/(FOREST_WORLD.focal/(FOREST_WORLD.follow+d));
  };
  if(topVisibility(8)<=topVisibility(80))throw new Error('Approach does not reveal stone top perspective');
  roadsideScenery=[];obstacles=[];pickups=[];nextTreeAt=dist-4;nextSpawnAt=dist+22;
  spawnLoopEntities();updateJourneyPrototype(0,0);
  obstacles=[new ObstacleEntity('boulder',20,['jump','jump',null],'L'),
    new ObstacleEntity('pond',38,[null,'jump','jump'],'R'),
    new ObstacleEntity('root',63,['duck','jump',null],'L')];obstacles[2].treeV=.37;
  player.lane=1;player.x=1;perfNow=40;
`,sandbox);
shot('forest-world-integrated','');
vm.runInContext("obstacles[0].z=7;perfNow=41;",sandbox);
shot('forest-world-stone-near','');
const forestTimes=[];
for(let i=0;i<8;i++){
  const began=performance.now();vm.runInContext('render()',sandbox);forestTimes.push(performance.now()-began);
}
const textReport=vm.runInContext('JSON.stringify({drawItems:forestWorldFrame.faceCount,trees:roadsideScenery.length,cachedTreeSprites:forestTreeSprites.size})',sandbox);
console.log('FOREST_WORLD_OK '+textReport+' native frame ms median='+forestTimes.sort((a,b)=>a-b)[4].toFixed(1));
const comparison={};
for(const [name,code] of [['legacy','runJourneyPrototype=false;render();runJourneyPrototype=true'],['worldOnly','drawForestWorld()'],
  ['groundOnly','forestGround()'],['withoutGround','{const ground=forestGround;forestGround=()=>{};drawForestWorld();forestGround=ground;}']]){
  const samples=[];for(let i=0;i<5;i++){const began=performance.now();vm.runInContext(code,sandbox);samples.push(performance.now()-began);}
  comparison[name]=samples.sort((a,b)=>a-b)[2].toFixed(1);
}
console.log('FOREST_NATIVE_COMPARISON '+JSON.stringify(comparison));
vm.runInContext('dist=153;player.lane=0;player.x=0;tryJourneyCornerTurn();updateJourneyPrototype(.31,0);',sandbox);
shot('forest-world-light-turn','');
const turnTimes=[];
for(let i=0;i<5;i++){const began=performance.now();vm.runInContext('render()',sandbox);turnTimes.push(performance.now()-began);}
console.log('FOREST_LIGHT_TURN_MS '+turnTimes.sort((a,b)=>a-b)[2].toFixed(1));
}
