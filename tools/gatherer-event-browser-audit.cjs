const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/gatherer-event');
const fixture=fs.readFileSync(path.join(__dirname,'journey-normal-events-browser-audit.cjs'),'utf8')
  .match(/function fixture\(content\)\{[\s\S]*?\}fixture\('mushrooms'\);/)[0];
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const reports=[];
    for(const variant of ['desktop','phone','low-memory-phone','crisp','original','missing-image']){
      const low=variant==='low-memory-phone',phone=variant==='phone'||low,broken=variant==='missing-image',errors=[];
      const page=await browser.newPage({viewport:phone?{width:390,height:844}:{width:480,height:800},deviceScaleFactor:phone?3:1});
      const requestedPlates=[];
      page.on('request',request=>{if(/mushroom-clearing[^/]*\.png$/.test(request.url()))requestedPlates.push(request.url());});
      page.on('pageerror',e=>errors.push(e.message));
      await page.addInitScript(({broken,low})=>{
        window.requestAnimationFrame=()=>0;
        Object.defineProperty(navigator,'deviceMemory',{get:()=>low?2:8});
        Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>low?4:8});
        if(broken){
          const native=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
          Object.defineProperty(HTMLImageElement.prototype,'src',{...native,set(value){
            if(/mushroom-clearing[^/]*\.png$/.test(String(value)))queueMicrotask(()=>this.dispatchEvent(new Event('error')));
            else native.set.call(this,value);
          }});
        }
      },{broken,low});
      await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+(['original','crisp'].includes(variant)?'?clearing='+variant:''));
      await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
      const run=code=>page.evaluate(code=>(0,eval)(code),code);
      assert.equal(await run('!!window.KRGathererScene'),false,'Scene should not load on the menu');
      await run('startJourneyWithSeed(647486904);');
      assert.equal(await run('!!window.KREventVisuals'),false,'New run must not eagerly load all event artwork');
      await run(fixture);
      assert.equal(await run('prepareGathererEncounter()'),!broken);
      assert.equal(await run("[...document.scripts].some(s=>/background-playtest|blockout-lab/.test(s.src))"),false);
      // Production entry gate: the middle lane cannot open the encounter.
      await run("player.x=player.lane=1;handleAction(journeyNormalSide(journeyRoadEventSession.slot)>0?'right':'left');");
      assert.equal(await run('mode'),'run');
      await run("player.x=player.lane=journeyNormalSide(journeyRoadEventSession.slot)>0?2:0;handleAction(player.lane===2?'right':'left');update(.25);render();");
      assert.equal(await run('mode'),'journeyevent');
      await run('Promise.resolve()');
      if(!broken){
        const before=await run('KRGathererScene.report()');
        await run('for(let i=0;i<12;i++){update(1/60);render();}');
        const after=await run('KRGathererScene.report()');
        assert.equal(after.status,'ready');assert(after.sceneDraws>before.sceneDraws);
        assert.equal(after.loads,1,'Plate loaded repeatedly');assert.equal(after.extraCanvasBytes,0);
        assert.equal(after.variant,variant==='original'?'original':variant==='crisp'?'crisp':'simple');
        assert.equal(after.tier,low?'mobile':'standard');
        assert.equal(await run('KREventVisuals.report().active'),variant==='original'?'gatherer-original':variant==='crisp'?'gatherer':'gatherer-simple');
        assert.equal(await run('KRCutscenes.report().state'),'ready');
        assert.equal(await run('KRCutscenes.report().owner'),await run('journeyRoadEventSession.token'));
        assert.equal(await run("KRCutscenes.coversWorld('gatherer')"),true);
        if(phone&&!low)assert(after.sourcePixels[0]>=1100,'Phone uses low-resolution plate');
        assert(after.decodedBytes<=(low?2.5:6.1)*1024*1024,'Decoded plate exceeds budget');
        assert.equal(requestedPlates.length,1,'Exactly one selected plate must load');
        // Orientation changes must not allocate a new offscreen plate or reload.
        await page.setViewportSize({width:phone?844:800,height:phone?390:480});
        await run('resize();render();');
        assert.equal(await run('KRGathererScene.report().loads'),1);
        await page.setViewportSize(phone?{width:390,height:844}:{width:480,height:800});
        await run('resize();render();');
        reports.push({testCase:variant,...after});
      }else{
        assert.equal(await run('KRGathererScene.report().status'),'failed');
        assert.equal(await run('KRCutscenes.report().state'),'fallback');
        assert.equal(await run("KRCutscenes.coversWorld('gatherer')"),false);
      }
      await page.waitForFunction(()=>!forestPreparing);
      // Browser viewport changes can fire blur: respect the game's auto-pause
      // and resume through its real keyboard handler before testing choices.
      if(await run('paused'))await page.keyboard.press('Escape');
      await run('render();');
      await page.screenshot({path:path.join(out,variant+'.png')});
      await run("globalThis.offerSlot=journeyRoadEventSession.slot;handleAction('choice1');update(.25);handleAction('continue');");
      assert.equal(await run('mode'),'run',variant+' '+await run('JSON.stringify({paused,dialogue:journeyRoadEventSession?.context.dialogue,time:journeyRoadEventSession?.context.dialogueTime})'));assert.equal(await run('journeyMushroomQuest.count'),0);
      assert.equal(await run('KREventVisuals.report().reservedBytes'),0,'Completed encounter retained its plate');
      assert.equal(await run('KRCutscenes.report().state'),'idle');
      await run(`for(let i=0;i<10;i++)collect({kind:'mushroom',lane:1,z:0});
        const slot=offerSlot;
        dist=slot.at-15;startJourneyRoadEvent({...slot,id:slot.id+':delivery',content:'mushrooms'});
        player.x=player.lane=journeyNormalSide(slot)>0?2:0;
        handleAction(player.lane===2?'right':'left');update(.25);
        globalThis.savedDelivery=journeyRoadEventSession.context;globalThis.rewardBefore=gold;
        handleAction('choice1');update(.25);handleAction('continue');`);
      assert.equal(await run('gold-rewardBefore'),25);assert.equal(await run('journeyMushroomQuest'),null);
      assert.equal(await run("savedDelivery.finish({status:'completed'})"),false);
      assert.equal(await run('gold-rewardBefore'),25);
      assert.equal(await run('KREventVisuals.report().reservedBytes'),0,'Delivery retained its plate');
      await run(fixture);await run('prepareGathererEncounter()');
      await run("dist=journeyRoadEventSession.slot.at+25;updateJourneyRoadEvents(0);");
      assert.equal(await run('KREventVisuals.report().reservedBytes'),0,'Passed event retained its plate');
      await run(fixture);await run('prepareGathererEncounter()');await run("resetRun();setMode('menu');");
      assert.equal(await run('KREventVisuals.report().entries.length'),0,'Abandoned run retained artwork');
      assert.equal(await run('KRCutscenes.report().state'),'idle');
      assert.deepEqual(errors,[]);await page.close();
    }
    fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({reports,memoryScope:'Estimated application-retained RGBA plate only, excludes browser decoder/GPU/main canvas. Headless emulation, not physical phone profiling.'},null,2));
    console.log('GATHERER_EVENT_OK production boot / lane gate / DPR3 / single plate / low-memory tier / A-B / orientation / quest / once-only delivery / missing-image fallback');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
