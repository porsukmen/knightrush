// Compare performance edits with a saved source snapshot, never baseline-update art.
const {chromium}=require('playwright'),{createCanvas,loadImage}=require('@napi-rs/canvas');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),out=path.resolve('output/sunlit-perf-visual');
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 try{const results=[];for(const [device,width,height,dpr]of [['desktop',775,1000,1],['phone',390,844,2]]){
  const images={};for(const version of ['before','after']){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr});
   if(version==='before')await page.route('**/assets/forest/*.js',route=>{
    const file=path.join('output/perf-source-before',path.basename(new URL(route.request().url()).pathname));
    return fs.existsSync(file)?route.fulfill({contentType:'text/javascript',body:fs.readFileSync(file,'utf8')}):route.continue();
   });
   await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
   await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);await page.waitForFunction(()=>window.KRSunlitForest);
   const run=s=>page.evaluate(s=>(0,eval)(s),s);
   assert.equal(await run("KRSunlitArt.models[0].shapes[0].groundPath!==undefined"),version==='after','Source intercept must work');
   for(const scene of ['forest','end','turn','disco','bloodwood']){
    await run(`Math.random=(()=>{let s=731;return()=>((s=Math.imul(s,1664525)+1013904223)>>>0)/4294967296;})();
     if('${scene}'==='forest'){startJourneyWithSeed(647486904);godMode=true;for(let i=0;i<110;i++)update(1/60);}
     else{roadLabState.direction=1;roadLabState.entry=${['end','turn'].includes(scene)};
      startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='${scene==='disco'?'disco':'bloodwood'}'));
      if(${['end','turn'].includes(scene)}){for(let i=0;i<400&&dist<roadLabState.fixture.node.at-20;i++)update(1/60);}
      if('${scene}'==='turn'){player.x=player.lane=2;chooseJourneyDirection(1);for(let i=0;i<300&&journey.phase!=='turning';i++)update(1/60);for(let i=0;i<18;i++)update(1/60);}
     }perfNow=5;for(let i=0;i<30;i++)render();`);
    images[version+scene]=await page.screenshot({path:path.join(out,`${device}-${scene}-${version}.png`)});
   }await page.close();
  }
  for(const scene of ['forest','end','turn','disco','bloodwood']){
   const data=[];for(const version of ['before','after']){const im=await loadImage(images[version+scene]),c=createCanvas(im.width,im.height),g=c.getContext('2d');g.drawImage(im,0,0);data.push(g.getImageData(0,0,c.width,c.height).data);}
   let major=0,total=0;for(let i=0;i<data[0].length;i+=4){let delta=0;for(let k=0;k<3;k++)delta=Math.max(delta,Math.abs(data[0][i+k]-data[1][i+k]));if(delta>24)major++;total+=delta;}
   const pixels=data[0].length/4,result={device,scene,major,fraction:major/pixels,mean:total/pixels};results.push(result);
   assert(result.fraction<.002,'Visible scene changed: '+JSON.stringify(result));
  }
 }fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(results,null,2));console.log('PERF_VISUAL_OK',JSON.stringify(results));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
