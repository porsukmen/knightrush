const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const fixture=fs.readFileSync(path.join(__dirname,'journey-normal-events-browser-audit.cjs'),'utf8')
  .match(/function fixture\(content\)\{[\s\S]*?\}fixture\('mushrooms'\);/)[0];
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const page=await browser.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{
      window.requestAnimationFrame=()=>0;
      window.heldVisualScripts=[];window.holdVisualScripts=true;
      const append=Element.prototype.appendChild;
      Element.prototype.appendChild=function(child){
        if(window.holdVisualScripts&&child.tagName==='SCRIPT'&&/assets\/encounters\/(event-visuals|gatherer-scene)\.js$/.test(child.src)){
          window.heldVisualScripts.push([this,child]);return child;
        }
        return append.call(this,child);
      };
      window.flushVisualScripts=()=>{window.holdVisualScripts=false;for(const [parent,child] of window.heldVisualScripts.splice(0))append.call(parent,child);};
    });
    await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);
    await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
    const run=code=>page.evaluate(code=>(0,eval)(code),code);
    await run(fixture);
    assert.equal(await run('heldVisualScripts.length'),1,'Only shared manager module should be pending');
    // Reset while code itself is still loading, not just during image decode.
    await run("resetRun();setMode('menu');flushVisualScripts();");
    await page.waitForFunction(()=>!!window.KREventVisuals,null,{polling:50});
    assert.equal(await run('KREventVisuals.report().loads'),0,'Late module completion loaded an abandoned plate');
    assert.equal(await run('!!window.KRGathererScene'),false,'Stale request continued through its dependency chain');
    await run(fixture);await run('prepareGathererEncounter()');
    await run(`globalThis.visualSlot=journeyRoadEventSession.slot;cancelJourneyRoadEvent('test-reset');
      delete journeyRoute.eventRecords[visualSlot.id];journeyRoute.normalSeen={};dist=visualSlot.at-220;
      updateJourneyEventVisuals();`);
    assert.equal(await run('KREventVisuals.report().reservedBytes'),0,'Distant scene preloaded too early');
    await run('dist=visualSlot.at-160;updateJourneyEventVisuals();');
    assert.equal(await run('journeyVisualTarget.id'),await run('visualSlot.id'));
    assert(await run('prepareGathererEncounter()'));
    assert.equal(await run('KREventVisuals.report().entries.length'),1);
    // No whole-map prefetch: an edge change to an empty branch releases lookahead.
    await run("journeyRoute.activeEdge='test-empty-branch';updateJourneyEventVisuals();");
    assert.equal(await run('KREventVisuals.report().reservedBytes'),0);
    await run(fixture);await run('prepareGathererEncounter()');
    assert(await run('prepareGathererEncounter(true)'));await run("setMode('town');");
    assert.equal(await run('KREventVisuals.report().entries.length'),0);
    assert.deepEqual(errors,[]);
    console.log('EVENT_VISUALS_BROWSER_OK late module reset / 180m selected-road prefetch / branch release / town cleanup / no JS errors');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
