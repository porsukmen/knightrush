const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/background-lab');
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:1000},deviceScaleFactor:1});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
    await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?backgroundlab=1&backgroundVersion=v1');
    await page.waitForFunction(()=>document.querySelector('#bg-root')?.dataset.ready==='1');
    const run=code=>page.evaluate(code=>(0,eval)(code),code);
    await run('KRBackgroundLab.setOptions({playing:false})');
    const state=await run('KRBackgroundLab.state()');
    const shot=async(name,options)=>{
      await page.evaluate(options=>{KRBackgroundLab.setOptions(options);KRBackgroundLab.renderAt(2.4);},options);
      assert.deepEqual(await run('KRBackgroundLab.report().failures'),[]);
      await page.locator('#bg-canvas').screenshot({path:path.join(out,name+'.png')});
    };
    await shot('01-clearing-alone',{character:false,dialogue:false,frame:'compact'});
    await shot('02-with-gatherer',{character:true});
    await shot('03-dialogue',{dialogue:true});
    await shot('04-values',{dialogue:false,values:true});
    await shot('05-layout',{values:false,guides:true,hotspots:true});
    await shot('06-previous',{variant:'legacy',guides:false,hotspots:false});
    await shot('07-phone',{variant:'candidate',frame:'tall'});
    await page.screenshot({path:path.join(out,'lab-desktop.png'),fullPage:true});
    // Same-time pixels, full animation loop, and static background cache reuse.
    const beforeBuilds=await run('KRBackgroundLab.report().cacheBuilds');
    const a=await run('KRBackgroundLab.renderAt(2.4);document.getElementById("bg-canvas").toDataURL()');
    const b=await run('KRBackgroundLab.renderAt(2.4);document.getElementById("bg-canvas").toDataURL()');assert.equal(a,b);
    for(let i=0;i<=120;i++)await run(`KRBackgroundLab.renderAt(${i/10},${i%10===0})`);
    assert.equal(await run('KRBackgroundLab.report().cacheBuilds'),beforeBuilds,'Animation rebuilt static scene');
    assert.equal(await run('KRBackgroundLab.state()'),state,'Lab mutated selected game state');
    // Inspect via the real canvas mapping, including desktop object-fit margins.
    await run('KRBackgroundLab.setOptions({dialogue:false,character:false});KRBackgroundLab.renderAt(2.4)');
    const clickScene=async(x,y)=>{
      const box=await page.locator('#bg-canvas').boundingBox();const h=1040,s=Math.min(box.width/480,box.height/h);
      await page.mouse.click(box.x+(box.width-480*s)/2+x*s,box.y+(box.height-h*s)/2+(y+120)*s);
    };
    await clickScene(89,291);assert.match(await page.locator('#bg-inspect').innerText(),/occupied home/);
    await clickScene(400,400);assert.match(await page.locator('#bg-inspect').innerText(),/fallen birch/);
    await page.locator('#bg-locations button').nth(2).click();assert.match(await page.locator('#bg-inspect').innerText(),/sorting bench/);
    await page.setViewportSize({width:390,height:844});
    await shot('08-phone-dialogue',{character:true,dialogue:true});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile lab overflows horizontally');
    await page.screenshot({path:path.join(out,'lab-mobile.png'),fullPage:true});
    // Live failure detection must not silently certify a broken renderer.
    await run('window.bgOriginalAmbient=drawGathererClearingAmbient;drawGathererClearingAmbient=()=>g.fillRect(NaN,0,1,1);KRBackgroundLab.renderAt(1)');
    assert.match((await run('KRBackgroundLab.report().failures')).join(' '),/Non-finite/);
    await run('drawGathererClearingAmbient=window.bgOriginalAmbient');
    await page.locator('#bg-reset').click();assert.deepEqual(await run('KRBackgroundLab.report().failures'),[]);
    const report=await run('KRBackgroundLab.report()');
    // Actual encounter integration, not just authoring canvas.
    await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?roadlab=1');
    await page.waitForFunction(()=>document.querySelector('#game')?.dataset.bootReady==='1');
    assert.equal(await run('typeof window.KRBackgroundLab'),'undefined');
    assert.equal(await page.locator('script[src*="background-lab"]').count(),0);
    await run(`SFX.toggle();startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.content==='mushrooms'));
      const slot=roadLabState.slot;dist=slot.at-10;roadScroll=dist;updateJourneyRoadEvents(0);
      player.x=player.lane=journeyNormalSide(slot)+1;
      handleJourneyRoadEventAction(player.lane===2?'right':'left');update(.3);perfNow=2.4;flashA=0;shakeMag=0;render();`);
    assert.equal(await run('mode'),'journeyevent');
    await page.screenshot({path:path.join(out,'09-real-encounter.png')});
    const gameState=await run('JSON.stringify([gold,scrap,journeyMushroomQuest,dist])');
    await run('render();render()');assert.equal(await run('JSON.stringify([gold,scrap,journeyMushroomQuest,dist])'),gameState);
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({...report,checks:['8 visual views','120 motion intervals','deterministic same-time pixels','static cache reuse','canvas and keyboard-accessible inspection','mobile overflow','non-finite fault detection','actual encounter render purity','no lab runtime in normal game'],technical:'passed',visualApproval:'rejected'},null,2));
    console.log('BACKGROUND_LAB_OK — technical checks passed; v1 remains visually rejected. '+out);
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
