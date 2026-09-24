// Road stage integration and manufactured deck boundary; not aesthetic approval.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const out=path.resolve('output/disco-road-stage');fs.mkdirSync(out,{recursive:true});
 try{
  for(const [device,width,height,dpr]of [['desktop',775,1000,1],['phone',390,844,2]]){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
   await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);
   await page.waitForFunction(()=>!!window.KRSunlitForest);
   const run=s=>page.evaluate(s=>(0,eval)(s),s);
   for(const style of ['sunlit','classic']){
    await run(`journeyForestStyle='${style}';roadLabState.direction=0;roadLabState.entry=false;
     startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='disco'));`);
    for(const gap of [54,30,14]){
     await run(`for(let i=0;i<2000&&mode==='run'&&dist<roadLabState.slot.at-${gap};i++)update(1/60);render();`);
     assert.equal(await run('mode'),'run');
     await page.screenshot({path:path.join(out,`${device}-${style}-approach-${gap}.png`)});
    }
    // Real encounter handoff and cleanup retain the original contract.
    await run("for(let i=0;i<1000&&mode==='run';i++)update(1/60);");
    assert.equal(await run('mode'),'discodance');
    await run('leaveDiscoDance();');
    assert.equal(await run('mode'),'run');
    assert.equal(await run('journeyVenueVisible(roadLabState.slot.id)'),false);
    await run(`for(let i=0;i<3000&&mode==='run'&&dist<roadLabState.fixture.edge.pieces.at(-1).end-22;i++)update(1/60);render();`);
    await page.screenshot({path:path.join(out,`${device}-${style}-exit.png`)});
    const evidence=await run(`(()=>{
     const original=drawJourneyDiscoPatch,records=[];
     try{drawJourneyDiscoPatch=(v,a,b,l,r,color,alpha)=>records.push({a,b,l,r,color,alpha});
      drawJourneyDiscoGround();
     }finally{drawJourneyDiscoPatch=original;}
     const end=roadLabState.fixture.edge.pieces.at(-1).end,last=records.filter(p=>p.a>end-12);
     if(!last.length)throw Error('No final deck tiles captured');
     if(Math.abs(Math.max(...last.map(p=>p.b))-end)>.001)throw Error('Deck does not stop at its boundary');
     for(const p of records){
      if(p.b>end+.001||p.b<p.a)throw Error('Floor patch crossed end');
      if(p.alpha!==1||!['#161723',...JOURNEY_DISCO_TILE_COLORS].includes(p.color))throw Error('Deck faded into soil');
     }
     return {lastTiles:last.length,cache:KRSunlitForest.report().cacheBytes};
    })()`);
    assert(evidence.cache<=5*1048576);
   }
   assert.deepEqual(errors,[]);await page.close();
  }
  console.log('DISCO_ROAD_STAGE_OK desktop/phone, both forests, venue approach/handoff/cleanup, opaque saturated tiles and exact exit, cache budget');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
