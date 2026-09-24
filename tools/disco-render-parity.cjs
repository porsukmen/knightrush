// Compare against the explicit pre-optimization snapshot, never art approvals.
const {chromium}=require('playwright'),{PNG}=require('pngjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/disco-render-parity');
const files=['KnightRush.html','assets/forest/sunlit-forest.js','assets/forest/journey-forest.js','assets/forest/disco-grove.js'];
const urls=new Map(files.map(f=>[pathToFileURL(path.join(root,f)).href,f]));
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true}),results=[];
 try{for(const [device,width,height,dpr]of [['desktop',775,1000,1],['phone',390,844,2]]){
  const images={};
  for(const version of ['before','after']){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   if(version==='before')await page.route('**/*',route=>{
    const f=urls.get(route.request().url());if(!f)return route.continue();
    route.fulfill({contentType:f.endsWith('.html')?'text/html':'text/javascript',body:fs.readFileSync(path.join(root,'output/disco-perf-source-before',path.basename(f)))});
   });
   await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
   await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
   await page.waitForFunction(()=>!!window.KRSunlitForest);
   const run=s=>page.evaluate(s=>(0,eval)(s),s);
   for(const scene of ['straight','near-venue','exit','left','right']){
    await run(`Math.random=(()=>{let n=731;return()=>((n=Math.imul(n,1664525)+1013904223)>>>0)/4294967296;})();initAmbient();
     roadLabState.direction=${scene==='left'?-1:scene==='right'?1:0};roadLabState.entry=${['left','right'].includes(scene)};
     startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='disco'));godMode=true;
     if(roadLabState.entry){for(let i=0;i<400&&dist<roadLabState.fixture.node.at-20;i++)update(1/60);
      player.x=player.lane=roadLabState.direction+1;chooseJourneyDirection(roadLabState.direction);
      for(let i=0;i<300&&journey.phase!=='turning';i++)update(1/60);for(let i=0;i<25;i++)update(1/120);
     }else{const target='${scene}'==='exit'?roadLabState.fixture.edge.pieces.at(-1).end-22:
      roadLabState.slot.at-('${scene}'==='near-venue'?14:45);
      for(let i=0;i<3000&&dist<target;i++){if(mode==='discodance')leaveDiscoDance();update(1/60);}}
     perfNow=5;for(let i=0;i<80;i++)render();`);
    const state=await run('JSON.stringify([dist,player,obstacles,pickups,journeyRoute.eventRecords])');
    const fills=await run(`(()=>{const fill=g.fill;let n=0;try{g.fill=function(...args){n++;return fill.apply(this,args);};render();}finally{g.fill=fill;}return n;})()`);
    const png=await page.screenshot({path:path.join(out,`${device}-${scene}-${version}.png`)});
    if(version==='before')images[scene]={png:PNG.sync.read(png),state,fills};
    else{
     assert.equal(state,images[scene].state,'Gameplay changed: '+scene);
     const a=images[scene].png,b=PNG.sync.read(png);let changed=0,max=0;
     for(let i=0;i<a.data.length;i+=4){let delta=0;
      for(let k=0;k<4;k++)delta=Math.max(delta,Math.abs(a.data[i+k]-b.data[i+k]));
      if(delta)changed++;max=Math.max(max,delta);
     }
     const record={device,scene,changed,max,pixels:a.width*a.height,fillsBefore:images[scene].fills,fillsAfter:fills};results.push(record);console.log(record);
     assert.equal(changed,0,'Optimized renderer must remain pixel-identical: '+device+' '+scene);
    }
   }
   assert.deepEqual(errors,[]);await page.close();
  }
 }fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(results,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
