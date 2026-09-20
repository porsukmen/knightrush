const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:480,height:800},hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});
  await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  const point=expression=>run(`(()=>{const p=${expression};return {x:(p.x*viewScale+viewX)/renderDpr(),y:(p.y*viewScale+viewY)/renderDpr()};})()`);
  const tap=async expression=>{const p=await point(expression);await page.touchscreen.tap(p.x,p.y);};
  const out=path.resolve('output/journey-seed-browser');fs.mkdirSync(out,{recursive:true});
  const shot=async name=>{await run('render()');await page.screenshot({path:path.join(out,name+'.png')});};
  const fixtures=await run(`(()=>{
    const found={};for(let seed=0;seed<300;seed++){
      const graph=generateJourneyGraph(seed,CFG.LOOP_DIST),first=graph.nodes.find(n=>n.id===graph.next);
      const exits=first.out.map(e=>e.direction).join(',');
      if(exits==='0,1'&&found.right===undefined)found.right=seed;
      if(exits==='-1,1'&&found.split===undefined)found.split=seed;
      if(found.right!==undefined&&found.split!==undefined)return found;
    }throw Error('Missing junction fixtures');
  })()`);
  await run(`SFX.toggle();journeyRoadEventHandlers.delete('disco_finale');startJourneyWithSeed(${fixtures.right});godMode=true;`);
  const signature=await run('JSON.stringify(journeyRoute.nodes)');
  // Read the actual graph: first fork has straight + right in this fixed seed.
  await run(`while(dist<journeyNode(journeyRoute.next).at-15)update(1/60);render();`);
  await shot('straight-right-choice');
  await page.keyboard.press('ArrowRight');assert.equal(await run('player.lane'),2);
  await page.keyboard.press('ArrowRight');assert(await run('journeyRoute.selection'));
  await run(`for(let i=0;i<120&&journey.phase!=='turning';i++)update(1/60);
    for(let i=0;i<18;i++)update(1/60);render();`);
  assert.equal(await run('journey.phase'),'turning');assert.equal(await run('journey.direction'),1);
  await shot('chosen-right-turn');
  await run(`for(let i=0;i<1400;i++){if(mode!=='run')throw Error('Route interrupted by '+mode);update(1/60);}render();`);
  assert.equal(await run('mode'),'run');assert.equal(await run('journeyRoute.event'),null);
  await page.keyboard.press('Escape');await run('render()');await tap('({x:240,y:VH/2+214})');
  assert.equal(await run('journeyMapOpen'),true);await shot('map-road-only');
  await page.keyboard.press('Escape');assert.equal(await run('paused'),true);
  assert.equal(await run('journeyMapOpen'),false);
  await tap('({x:240,y:VH/2+214})');await tap('({x:100,y:715})');
  assert.equal(await run('journeyRoute.seed'),fixtures.right);assert.equal(await run('dist'),0);
  assert.equal(await run('JSON.stringify(journeyRoute.nodes)'),signature);
  // No minigame or miniboss can interrupt the alternative route either.
  await run(`godMode=true;for(let i=0;i<20000&&mode==='run';i++){
    const n=journeyNode(journeyRoute.next);
    if(!journeyRoute.pendingArm&&dist>n.at-12&&n.out.length&&!n.out.some(e=>e.direction===0)){
      player.lane=n.out[0].direction+1;chooseJourneyDirection(n.out[0].direction);
    }
    update(1/60);
  }render();`);
  assert.equal(await run('mode'),'bossintro');assert.equal(await run('journeyRoute.status'),'boss');
  // A closed forward road waits for an explicit turn, never choosing a side.
  await run(`startJourneyWithSeed(${fixtures.split});godMode=true;while(dist<journeyNode(journeyRoute.next).at-10)update(1/60);render();`);
  assert.deepEqual(await run('journey.networkDirections'),[-1,1]);
  await shot('left-right-dead-end');
  await run('for(let i=0;i<160;i++)update(1/60);render();');
  assert.equal(await run('journey.phase'),'approach');
  assert.equal(await run('dist'),await run('journeyNode(journeyRoute.next).at+4'));
  const stopped=await run('JSON.stringify([dist,runDistance,roadScroll])');
  await run('for(let i=0;i<60;i++)update(1/60);');
  assert.equal(await run('JSON.stringify([dist,runDistance,roadScroll])'),stopped);
  await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowLeft');
  await run('update(1/60);render();');
  assert.equal(await run('journey.phase'),'turning');
  await page.keyboard.press('Escape');await run('render()');await tap('({x:240,y:VH/2+214})');
  await tap('({x:350,y:715})');assert.notEqual(await run('journeyRoute.seed'),fixtures.split);
  assert.equal(await run('mode'),'run');assert.equal(await run('paused'),true);
  assert.equal(await run('journeyMapOpen'),true);
  const newSeed=await run('journeyRoute.seed');
  await run('render()');await tap('({x:350,y:715})');
  assert.notEqual(await run('journeyRoute.seed'),newSeed);
  assert.equal(await run('journeyMapOpen&&paused'),true);await shot('new-seed-map-stays-open');
  await page.keyboard.press('Escape');assert.equal(await run('paused'),true);
  assert.equal(await run('journeyMapOpen'),false);
  await page.keyboard.press('Escape');assert.equal(await run('paused'),false);
  await run('pendingJourneyPrototype=false;startRun(0);render();');assert.equal(await run('journeyRoute'),null);
  assert.deepEqual(errors,[]);
  console.log('JOURNEY_SEED_BROWSER_OK route-only run to boss; manual turns; closed road waits; repeated NEW SEED keeps map paused/open; PLAY isolation');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
