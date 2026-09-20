// A skin may change art, never the visibility/projection/painter-order contract.
const assert=require('node:assert/strict');
const {run,canvas}=require('./journey-render-audit.cjs');
run(`SFX.toggle();startJourneyWithSeed(0);godMode=true;
 globalThis.renderParityOriginals={disco:drawDiscoRoadObstacle,blood:drawBloodRoadObstacle,pond:drawPond};
 function parityMarker(o,p,S){g.fillStyle='#dd7733';g.fillRect(laneX(1,p.t)-18*S,p.y-22*S,36*S,22*S);}
 drawDiscoRoadObstacle=parityMarker;drawBloodRoadObstacle=parityMarker;
 drawPond=(o,xl,xr,y,S,lanes,ry)=>parityMarker(o,proj(o.z>effZFar?effZFar-6*(1-(CFG.FOCAL+effZFar)/(CFG.FOCAL+o.z)):o.z),S);
`);
let samples=0;
for(const depth of [150,140,100,77,76,75,70,66,60,30,8,0,-2]){
 const alpha=run(`obstacleDistanceAlpha({},${depth})`);
 for(const theme of ['disco','bloodwood'])assert.equal(run(`obstacleDistanceAlpha({roadTheme:'${theme}'},${depth})`),alpha,`visibility differs: ${theme}/${depth}`);
 // The same marker through all skin paths must occupy the same pixels. Use
 // a normal skin dispatcher stub so pond's optional old glint is not compared.
 for(const horizon of [60,38]){
  let expected;
  for(const theme of [null,'disco','bloodwood']){
   run(`g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,480,800);effZFar=${horizon};
     globalThis.parityOb={lanes:[1],kind:'boulder',seed:17,z:${depth},roadTheme:${JSON.stringify(theme)},type:{id:'boulder',draw:(o,xl,xr,y,S,lanes,p)=>parityMarker(o,p,S)}};
     drawObstacle(parityOb,proj(parityOb.z));`);
   const pixels=Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data);
   if(!expected)expected=pixels;else assert(pixels.equals(expected),`straight skin projection differs ${theme}/${depth}/${horizon}`);
   samples++;
  }
 }
}
run(`drawDiscoRoadObstacle=renderParityOriginals.disco;drawBloodRoadObstacle=renderParityOriginals.blood;drawPond=renderParityOriginals.pond;effZFar=CFG.Z_FAR;`);
// At a rotating camera angle, geometry must not switch projection by skin.
const turn=JSON.parse(run(`JSON.stringify((()=>{
 const oldCamera=journeyCameraPoint;
 try{
  journeyCameraPoint=(x,z)=>({side:x*.8-z*.6,depth:x*.6+z*.8});
  let checked=0;
  for(const kind of ['pond','root','boulder'])for(const depth of [30,80,140]){
   let expected=null;
   for(const roadTheme of [null,'disco','bloodwood']){
    const item={x:1,z:depth,lane:1,surfaceLeft:0,surfaceTop:0,entity:{kind,roadTheme}};
    const vertex=journeyObstacleVertex(item,220,GROUND_Y-20),p=journeyProjectTexturedVertex(vertex);
    if(expected&&(p.x!==expected.x||p.y!==expected.y))throw Error('Turning projection differs by theme '+kind+'/'+depth);
    expected=p;checked++;
   }
  }
  return {checked};
 }finally{journeyCameraPoint=oldCamera;}
})())`));
const layering=run(`(()=>{
 const rootReq=['duck','jump',null];let checked=0;
 for(const kind of ['root','boulder','pond'])for(const depth of [20,1,-1]){
  let expected;
  for(const roadTheme of [null,'disco','bloodwood']){
   const o=new ObstacleEntity(kind,depth,kind==='root'?rootReq.slice():[null,'jump',null],'L');o.roadTheme=roadTheme;
   obstacles=[o];pickups=[];roadsideScenery=[];buildWorldDrawQueue(BIO(),false);
   const result=JSON.stringify({world:DRAW_QUEUE.some(d=>d.ref===o),front:FRONT_OBSTACLES.includes(o),over:obstacleDrawsOverRider(o,depth,false)});
   if(expected&&result!==expected)throw Error('Theme changed rider layering '+kind+'/'+depth);
   expected=result;checked++;
  }
 }
 return checked;
})()`);
console.log('OBSTACLE_RENDER_PARITY_OK',JSON.stringify({straight:samples,turn:turn.checked,layering}));
