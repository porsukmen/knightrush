const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url'),root=path.resolve(__dirname,'..');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage({viewport:{width:390,height:844}});await p.addInitScript(()=>requestAnimationFrame=()=>0);
 await p.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);await p.waitForFunction(()=>window.KRSunlitForest);
 const result=await p.evaluate(()=>eval(`(()=>{
  Math.random=(()=>{let seed=731;return()=>((seed=Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;})();
  roadLabState.entry=true;roadLabState.direction=1;
  startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='chest'));
  godMode=true;paused=false;const pops=[];let previous=new Map();
  const snapshot=()=>new Map(KRSunlitForest.inspect().map(o=>{
   const c=journeyCameraPoint(o.x,o.z),p=journeyProjectCamera(c.side,c.depth);
   return [o.x.toFixed(4)+':'+o.z.toFixed(4)+':'+o.id+':'+o.kind,{...o,depth:c.depth,sx:p.x,sy:p.y}];}));
  let lastPhase=journey.phase,previousPixels=null,lastShot=null,worst={count:0};
  for(let frame=0;frame<2400&&mode==='run';frame++){
   if(journey.phase==='approach'&&dist>roadLabState.fixture.node.at-20){player.x=player.lane=2;chooseJourneyDirection(1);}
   update(1/60);if(mode!=='run')break;render();const now=snapshot();
   const pixels=g.getImageData(0,0,cvs.width,cvs.height).data;let changed=0;
   if(previousPixels)for(let i=0;i<pixels.length;i+=4)if(Math.abs(pixels[i]-previousPixels[i])+Math.abs(pixels[i+1]-previousPixels[i+1])+Math.abs(pixels[i+2]-previousPixels[i+2])>150)changed++;
   const shot=cvs.toDataURL();if(changed>worst.count&&journey.phase!=='turning')worst={count:changed,frame,phase:journey.phase,before:lastShot,after:shot};
   previousPixels=pixels;lastShot=shot;
   if(lastPhase==='settling'&&journey.phase==='main')previous=new Map();
   if(frame>1)for(const [kind,a,b]of [['appeared',now,previous],['vanished',previous,now]])for(const [key,o]of a){
    const c=journeyCameraPoint(o.x,o.z),p=journeyProjectCamera(c.side,c.depth),m=KRSunlitArt.models[o.id],
     scale=o.w*150/JOURNEY_LANE_WORLD*linS(p.t)/(m?.width||1),
     visible=m?p.x+m.right*scale>12&&p.x+m.left*scale<468&&p.y+m.top*scale<VH+PAD_BOT-20:p.x>-100&&p.x<580;
    if(!b.has(key)&&c.depth>-12&&c.depth<55&&visible)
     pops.push({frame,dist,phase:journey.phase,...o,change:kind,roots:obstacles.filter(o=>o.kind==='root').map(o=>({z:o.z,side:o.side}))});
   }
   previous=now;lastPhase=journey.phase;
  }
  return {pops,dist,phase:journey.phase,worst};})()`));
 fs.mkdirSync(path.join(root,'output/scenery-continuity'),{recursive:true});
 for(const key of ['before','after']){if(result.worst[key])fs.writeFileSync(path.join(root,'output/scenery-continuity/'+key+'.png'),Buffer.from(result.worst[key].split(',')[1],'base64'));delete result.worst[key];}
 fs.writeFileSync(path.join(root,'output/scenery-continuity/report.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({count:result.pops.length,dist:result.dist,worst:result.worst,first:result.pops.slice(0,2)},null,2));
 await p.screenshot({path:path.join(root,'output/scenery-continuity/phone.png')});
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
