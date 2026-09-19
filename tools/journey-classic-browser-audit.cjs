// Browser smoke, original-art parity, real turn input and desktop timing.
// This is not an iPhone performance certification.
const {chromium}=require(process.env.KNIGHT_PLAYWRIGHT_MODULE||'playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path'),fs=require('node:fs');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:480,height:800}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});
    await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);
    await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
    const run=code=>page.evaluate(code=>(0,eval)(code),code);
    const out=path.resolve('output/journey-classic');fs.mkdirSync(out,{recursive:true});
    // Test the low-level corner independently from the seeded graph controller.
    await run(`pendingJourneyPrototype=true;startRun(0);journeyRoute=null;journey=createJourneyState();godMode=true;render();`);
    const parity=await run(`(()=>{
      journey.phase='main';runJourneyPrototype=false;render();
      const original=g.getImageData(0,0,cvs.width,cvs.height).data;
      runJourneyPrototype=true;render();
      const actual=g.getImageData(0,0,cvs.width,cvs.height).data;
      let changed=0;for(let i=0;i<actual.length;i++)if(actual[i]!==original[i])changed++;
      return {changed,experimentalRenderer:forestWorldEnabled()};
    })()`);
    if(parity.changed||parity.experimentalRenderer)throw Error('Original art parity failed: '+JSON.stringify(parity));
    await run(`dist=153;roadScroll=dist;journey=createJourneyState();roadsideScenery=[];
      obstacles=[];pickups=[];nextTreeAt=dist-3;spawnLoopEntities();updateJourneyPrototype(0,0);
      player.lane=0;player.x=0;render();`);
    await page.screenshot({path:path.join(out,'before-turn.png')});
    await page.keyboard.press('ArrowLeft');
    if(await run(`journey.phase`)!=='turning')throw Error('ArrowLeft did not trigger the corner');
    const timing=await run(`(()=>{
      const times=[];
      for(let i=0;i<38;i++){
        const began=performance.now();update(1/60);render();times.push(performance.now()-began);
      }
      times.sort((a,b)=>a-b);
      return {median:times[19],p95:times[36],phase:journey.phase,lane:player.lane};
    })()`);
    if(timing.phase!=='settling'||timing.lane!==1)throw Error('Turn handoff failed: '+JSON.stringify(timing));
    await page.screenshot({path:path.join(out,'after-turn.png')});
    await run(`for(let i=0;i<180;i++){update(1/60);}render();`);
    if(!await run(`journey.phase==='branch'||(journey.eventExit&&journey.phase==='approach')`))throw Error('New road never reached full width');
    await page.screenshot({path:path.join(out,'branch.png')});
    await run(`pendingJourneyPrototype=false;startRun(0);render();`);
    if(await run(`runJourneyPrototype||forestWorldEnabled()`))throw Error('Journey leaked into PLAY');
    if(errors.length)throw Error(errors.join('\n'));
    console.log('CLASSIC_JOURNEY_BROWSER_OK '+JSON.stringify({parity,desktopTurnMs:timing,screenshots:out}));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
