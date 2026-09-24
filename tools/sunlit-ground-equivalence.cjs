// Compare optimized scratch-buffer projection with the original ground path.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});
 try{const page=await browser.newPage({viewport:{width:480,height:800}});
 await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
 await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);
 await page.waitForFunction(()=>!!window.KRSunlitForest);
 const results=await page.evaluate(()=> (0,eval)(`(()=>{
  roadLabState.direction=1;roadLabState.entry=true;startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='disco'));
  for(let i=0;i<400&&dist<roadLabState.fixture.node.at-20;i++)update(1/60);
  player.x=player.lane=2;chooseJourneyDirection(1);
  for(let i=0;i<300&&journey.phase!=='turning';i++)update(1/60);
  const surfaces=[0,1].map(()=>{const c=document.createElement('canvas');c.width=480;c.height=800;return c;}),results=[];
  for(let step=0;step<50;step++){
   update(1/60);render();const main=g;
   const polygons=[];
   for(const view of journeyDiscoRoadViews())if(!view.spill){
    const start=view.begin??view.edge.pieces[0].start,end=view.end??view.edge.pieces.at(-1).end;
    for(let at=start-1;at<end;at+=4)polygons.push([view.point(at,-6),view.point(at,6),view.point(at+4,6),view.point(at+4,-6)]);
   }
   try{for(let variant=0;variant<2;variant++){
    g=surfaces[variant].getContext('2d');g.clearRect(0,0,480,800);
    for(const vertices of polygons){
     if(variant)KRSunlitArt.drawFloorShape({vertices,color:'#754b85'});
     else drawCurvedGroundPolygon(vertices.map(p=>({...journeyCameraPoint(p.x,p.z),u:0,v:0})),'#754b85');
    }
   }}finally{g=main;}
   const data=surfaces.map(c=>c.getContext('2d').getImageData(0,0,480,800).data);let major=0;
   for(let i=0;i<data[0].length;i+=4)if(Math.abs(data[0][i+3]-data[1][i+3])>24)major++;
   results.push({step,major});
  }
  return results;
 })()`));
 const worst=Math.max(...results.map(r=>r.major));assert(worst<480*800*.002,JSON.stringify(results));
 console.log('SUNLIT_GROUND_EQUIVALENCE_OK',JSON.stringify({frames:results.length,worstMajorPixels:worst}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
