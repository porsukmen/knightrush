const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/forest-journey');
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:480,height:800}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
    await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
    await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
    const run=code=>page.evaluate(code=>(0,eval)(code),code);
    await run('startForestCorridor();prepareForestBaked();');
    await page.waitForFunction(()=>[...forestBakedImages.values()].every(e=>e.ready),null,{polling:100});
    assert.equal(await run('forestJourneyRenderer()&&curvedWorldActive()&&!forestWorldEnabled()'),true);
    assert.equal(await run('forestCorridor.course.length'),6);
    assert(await run('forestCorridor.chunks.size<=4'));
    // The experimental GPU floor and camera must never execute in the new path.
    await run(`globalThis.savedForestDraw=drawForestWorld;
      drawForestWorld=()=>{throw Error('Legacy forest renderer executed')};
      globalThis.savedGPUFloor=forestGPUFloor;
      forestGPUFloor=()=>{throw Error('Legacy GPU floor executed')};`);
    for(const distance of [0,44,92,140,208,300,1200]){
      await run(`dist=${distance};roadScroll=dist;curvedGroundDistance=dist;
        for(const item of forestCorridor.course)item.entity.z=item.z-dist;
        prepareForestCorridor();prepareForestBaked();`);
      await page.waitForFunction(()=>[...forestBakedImages.values()].every(e=>e.ready),null,{polling:100});
      await run('render();');
      assert(await run('forestCorridor.chunks.size<=5'));
      assert(await run('DRAW_QUEUE.some(d=>d.draw===drawForestJourneyTree)'));
      assert(await run('!DRAW_QUEUE.some(d=>d.draw===drawStageMouth)'));
      // All trees go through the same far-to-near queue as obstacles.
      assert(await run('DRAW_QUEUE.every((d,i,a)=>!i||a[i-1].z>=d.z)'));
      if([0,44,92,140].includes(distance))await page.screenshot({path:path.join(out,`journey-${distance}.png`)});
    }
    await page.keyboard.press('F8');assert.equal(await run('curvedWorldActive()'),false);
    await run('render()');
    await page.keyboard.press('F8');assert.equal(await run('curvedWorldActive()'),true);
    await page.setViewportSize({width:390,height:844});
    await run('dist=44;roadScroll=dist;curvedGroundDistance=dist;startForestCorridor();prepareForestBaked();');
    await page.waitForFunction(()=>[...forestBakedImages.values()].every(e=>e.ready),null,{polling:100});
    await run('for(let i=0;i<180;i++)update(1/60);render();');
    assert(Math.abs(await run('dist')-54)<.01);
    await page.screenshot({path:path.join(out,'phone.png')});
    await run('drawForestWorld=savedForestDraw;forestGPUFloor=savedGPUFloor;startForestCorridor("legacy");');
    assert.equal(await run('forestWorldEnabled()&&!curvedWorldActive()'),true);
    await run('startRun(0);');
    assert.equal(await run('forestCorridor'),null);
    assert.equal(await run('curvedWorldActive()&&!forestWorldEnabled()'),true);
    await run('render()');
    const current=await page.locator('#game').screenshot();
    // Reproduce the pre-adapter production gates in this isolated browser only.
    // Identical pixels prove the forest opt-in cannot change a normal run.
    await run(`curvedWorldActive=function(){return curvedWorldTrial&&env==='forest'&&biome==='forest'&&!forestCorridor;};
      forestWorldEnabled=function(){return !!forestCorridor&&runJourneyPrototype&&!!journey&&biome==='forest'&&env==='forest';};
      render();`);
    assert(current.equals(await page.locator('#game').screenshot()),'Production run changed outside the corridor');
    assert.deepEqual(errors,[]);
    console.log('FOREST_JOURNEY_OK shared projection/mask/queue; six obstacles; bounded chunks; F8; update; phone; legacy option; normal-run isolation');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
