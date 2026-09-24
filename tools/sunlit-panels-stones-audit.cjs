const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});
 try{for(const [device,width,height,dpr]of [['desktop',1280,900,1],['phone',390,844,2]]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
 await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);await page.waitForFunction(()=>!!window.KRSunlitForest);
 const run=s=>page.evaluate(s=>(0,eval)(s),s),out='output/sunlit-panels-stones';fs.mkdirSync(out,{recursive:true});
 await run(`roadLabState.direction=0;roadLabState.entry=false;startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='disco'));render();`);
 const panels=await run(`(()=>{const original=drawJourneyDiscoPatch,capture=[];
 try{drawJourneyDiscoPatch=(view,a,b,l,r,color,alpha)=>{capture.push({a,b,l,r,color,alpha});};drawJourneyDiscoGround();}
 finally{drawJourneyDiscoPatch=original;}return capture;})()`);
 assert(panels.length>0);assert(panels.every(p=>typeof p.color==='string'&&p.alpha===1),'Manmade panels must not fade');
 const colors=new Set(panels.map(p=>p.color));assert(colors.has('#75417f')&&colors.has('#31646d')&&colors.has('#161723'),'Original tile materials missing');
 assert.equal(new Set(panels.filter(p=>Math.abs(p.r-p.l-2.72)<.001).map(p=>p.l)).size,4,'Original four-column floor missing');
 assert(!colors.has('#342d48')&&!colors.has('#52d8cb'),'Rejected on/off lighting returned');
 await page.screenshot({path:path.join(out,device+'-disco.png')});
 await run(`const edge=journeyActiveEdge();dist=edge.pieces.at(-1).end-22;roadScroll=curvedGroundDistance=dist;
  journeyRoute.eventRecords[roadLabState.slot.id]={status:'completed'};render();`);
 const exit=await run(`(()=>{const original=drawJourneyDiscoPatch;let seen=0,valid=true;
 try{drawJourneyDiscoPatch=(view,a,b,l,r,color,alpha)=>{seen++;valid=valid&&typeof color==='string'&&alpha===1;};drawJourneyDiscoGround();}
 finally{drawJourneyDiscoPatch=original;}return seen>0&&valid;})()`);assert(exit);
 await page.screenshot({path:path.join(out,device+'-disco-exit.png')});
 const stones=await run(`(()=>{startJourneyWithSeed(647486904);godMode=true;
  for(let i=0;i<100;i++)update(1/60);render();const original=KRSunlitArt.nativeShape,records=[];
  try{KRSunlitArt.nativeShape=(...args)=>{if(args[0]===4)records.push({width:args[3],ratio:args[6]});};
   for(let lanes=1;lanes<=3;lanes++){
    const req={};for(let i=0;i<lanes;i++)req[i]='jump';drawObstacleEntity(new ObstacleEntity('boulder',18,req),BIO());
   }
  }finally{KRSunlitArt.nativeShape=original;}
  obstacles=[1,2,3].map((lanes,i)=>{const req={};for(let l=0;l<lanes;l++)req[l]='jump';return new ObstacleEntity('boulder',14+i*30,req);});
  render();return records;})()`);
 assert.equal(stones.length,3);const h=stones[0].width*stones[0].ratio;
 assert(stones.every((s,i)=>Math.abs(s.width*s.ratio/h-(1+.18*i))<1e-6),'Stone height must grow modestly: 1 / 1.18 / 1.36');
 assert(Math.abs(stones[2].width/stones[0].width-3)<1e-6);
 await page.screenshot({path:path.join(out,device+'-stones.png')});assert.deepEqual(errors,[]);await page.close();
 }
 console.log('SUNLIT_PANELS_STONES_OK restored four-column jointed deck, restrained multi-lane height growth');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
