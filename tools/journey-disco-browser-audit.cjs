const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:480,height:800},hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
  await page.waitForFunction(()=>!!window.KRSunlitForest);
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  const out=path.resolve('output/journey-disco');fs.mkdirSync(out,{recursive:true});
  const shot=async name=>{await run('render()');await page.screenshot({path:path.join(out,name+'.png')});};
  await run(`SFX.toggle();
   function discoFixture(side){
    for(let seed=0;seed<100;seed++){
     startJourneyWithSeed(seed);godMode=true;
     for(const node of journeyRoute.nodes)for(const edge of node.out){
      if(edge.preview.theme!=='disco'||(side?edge.direction===0:edge.direction!==0))continue;
      const parent=journeyRoute.nodes.find(n=>n.out.some(e=>e.to===node.id));
      if(!parent||parent.out.find(e=>e.to===node.id).preview.theme!=='forest')continue;
      journeyRoute.from=parent.id;journeyRoute.next=node.id;
      journeyRoute.activeEdge=parent.out.find(e=>e.to===node.id).id;
      dist=node.at-28;roadScroll=dist;runDistance=dist;armJourneyNode();
      roadsideScenery=[];obstacles=[];pickups=[];nextTreeAt=dist-4;nextSpawnAt=dist+60;
      spawnLoopEntities();return {seed,nodeId:node.id,edgeId:edge.id,direction:edge.direction};
     }
    }throw Error('Disco fixture missing');
   }
   globalThis.discoFixtureInfo=discoFixture(true);render();`);
  await shot('01-turn-preview');
  assert(await run('journeyDiscoRoadViews().some(v=>v.spill&&v.begin<journeyNode(journeyRoute.next).at)'));
  assert(await run('journey.previewWorldTrees.some(t=>t.discoAmount>.8)'));
  assert(await run(`journey.previewBranches.find(b=>b.direction===discoFixtureInfo.direction).sideTrees
    .filter(t=>t.d<=30).every(t=>t.discoAmount===0)`),'Entrance trees must stay green');
  const spatialSamples=await run(`(()=>{const edge=journeyNode(journeyRoute.next).out.find(e=>e.id===discoFixtureInfo.edgeId),
    start=edge.pieces[0].start;return [0,30,50,75,95].map(d=>journeyDiscoStrength(edge,start+d));})()`);
  assert.equal(spatialSamples[0],0);assert.equal(spatialSamples[1],0);assert.equal(spatialSamples[4],1);
  assert(spatialSamples[2]>0&&spatialSamples[3]>spatialSamples[2]);
  assert(await run(`(()=>{const original=drawJourneyDiscoPatch,alpha=[];
    try{drawJourneyDiscoPatch=(...args)=>{alpha.push(args[6]);};drawJourneyDiscoGround();}
    finally{drawJourneyDiscoPatch=original;}return alpha.length>0&&alpha.every(a=>a===1);
  })()`),'Road material must be opaque, never layered with alpha');
  await run(`globalThis.treeColorsBeforeTurn=roadsideScenery.filter(t=>!t.gnd)
    .map(t=>({v:t.v,amount:t.discoAmount}));
    globalThis.endCapColors=(journey.endTrees||[]).map(t=>t.discoAmount*journeyDiscoReveal(t.discoEntryId));`);
  await run(`player.lane=discoFixtureInfo.direction+1;chooseJourneyDirection(discoFixtureInfo.direction);
   for(let i=0;i<200&&journey.phase!=='turning';i++)update(1/60);
   for(let i=0;i<16;i++)update(1/60);`);
  assert.equal(await run('journey.phase'),'turning');await shot('02-turning');
  assert.equal(await run('journeyDiscoViewReveal(journeyActiveEdge())'),1,'No camera-dependent recoloring');
  assert.deepEqual(await run('(journey.endTrees||[]).map(t=>t.discoAmount*journeyDiscoReveal(t.discoEntryId))'),
    await run('endCapColors'),'Dead-end backdrop trees must not inherit the selected road palette');
  const oldTreeColorsStable=await run(`journey.oldTrees.filter(t=>t.branchDirection===undefined&&
    treeColorsBeforeTurn.some(before=>before.v===t.v)).every(t=>
    treeColorsBeforeTurn.some(before=>before.v===t.v&&before.amount===t.discoAmount))`);
  assert(oldTreeColorsStable,'Old-road trees changed color during turn');
  await run(`globalThis.branchColors=journey.sideTrees.map(t=>({v:t.v,amount:t.discoAmount}));
   for(let i=0;i<100&&journey.phase==='turning';i++)update(1/60);`);
  const branchColorsStable=await run(`roadsideScenery.filter(t=>branchColors.some(b=>b.v===t.v)).every(t=>
    branchColors.some(before=>before.v===t.v&&before.amount===t.discoAmount))`);
  assert(branchColorsStable,'Branch trees changed color after turn');
  await shot('02b-turn-complete');
  assert.equal(await run('journeyDiscoViewReveal(journeyActiveEdge())'),1,'Disco is visible when the camera faces the road');
  const revealSamples=await run(`(()=>{
    const edge=journeyActiveEdge(),entered=journeyRoute.discoEnteredAt[edge.id],saved=dist;
    try{return [0,16,32,48,65].map(d=>{dist=entered+d;return journeyDiscoViewReveal(edge);});}
    finally{dist=saved;}
  })()`);
  assert.deepEqual(revealSamples,[1,1,1,1,1],'No post-turn whole-scene palette animation');
  await run(`for(let i=0;i<500&&mode==='run'&&journeyRoute.pendingArm;i++)update(1/60);`);
  assert.equal(await run('journeyActiveEdge().id'),await run('discoFixtureInfo.edgeId'));
  await shot('03-disco-forest');
  const renderingContracts=await run(`(()=>{
    const crowd=drawDiscoCrowdMember,courtier=drawDiscoCourtier,patch=drawJourneyDiscoPatch,seen=[],tiles=[];
    try{
      drawDiscoCrowdMember=()=>seen.push(g.globalAlpha);
      drawDiscoCourtier=()=>seen.push(g.globalAlpha);
      g.globalAlpha=.2;drawJourneyDiscoDancer({x:7.1,z:dist+12,index:1});
      const dancerAlpha=seen.slice();seen.length=0;
      drawJourneyDiscoEntryBall({x:7,z:dist+12,direction:1});
      const entrancePeople=seen.length;
      drawJourneyDiscoPatch=(view,at,end,left,right,color,alpha)=>{
        const width=window.KRSunlitDisco?.active()?KRSunlitDisco.tileWidth:2.72;
        if(Math.abs(right-left-width)<.001)tiles.push(end-at);
      };
      drawJourneyDiscoGround();
      const tint=canopyDiscoCache;render();
      return {dancerAlpha,entrancePeople,tiles:tiles.length,minTileSpan:Math.min(...tiles),
        tintCached:window.KRSunlitForest?.active()?KRSunlitForest.report().cacheBytes<=KRSunlitForest.report().budgetBytes:!!tint&&tint===canopyDiscoCache};
    }finally{drawDiscoCrowdMember=crowd;drawDiscoCourtier=courtier;drawJourneyDiscoPatch=patch;g.globalAlpha=1;}
  })()`);
  assert.deepEqual(renderingContracts.dancerAlpha,[1]);
  assert.equal(renderingContracts.entrancePeople,0);
  assert(renderingContracts.tiles>0&&renderingContracts.minTileSpan>3.4,'Tiles must not be split at the midpoint');
  assert(renderingContracts.tintCached,'Purple forest must respect its bounded native cache');
  const renderTiming=await run(`(()=>{
   const times=[];for(let i=0;i<50;i++){
    perfNow+=1/60;const t=performance.now();render();
    if(i>=10)times.push(performance.now()-t);
   }times.sort((a,b)=>a-b);return {medianMs:times[20],p95Ms:times[38]};
  })()`);
  await run(`globalThis.discoSlot=journeyActiveEdge().events.find(e=>e.definition==='disco_finale');
   for(let i=0;i<2000&&mode==='run'&&dist<discoSlot.at-24;i++)update(1/60);`);
  await shot('04-venue-approach');
  await run(`for(let i=0;i<500&&mode==='run';i++)update(1/60);`);
  assert.equal(await run('mode'),'discodance');await shot('05-minigame');
  const frozen=await run('JSON.stringify([dist,runDistance,roadScroll])');
  await page.keyboard.press('Escape');assert.equal(await run('paused'),true);
  await page.keyboard.press('Escape');
  await run(`beginDiscoRun();for(let i=0;i<6000&&discoGame.phase!=='complete';i++){
    const d=discoGame;
    if(d.phase==='input'&&d.phaseT>=.45)
      handleDiscoSwipe(d.sequence[d.inputIndex]);
    update(1/60);
   }`);
  assert.equal(await run('discoGame.phase'),'complete');
  assert.equal(await run('discoGame.wins'),3);
  assert.equal(await run('JSON.stringify([dist,runDistance,roadScroll])'),frozen);
  await run('leaveDiscoDance();');assert.equal(await run('mode'),'run');
  assert.equal(await run('journeyRoute.eventRecords[discoSlot.id].status'),'completed');
  assert(await run('journeyDiscoStrength(journeyActiveEdge(),dist+12)>.8'));
  await run('for(let i=0;i<30;i++)update(1/60);');await shot('06-after-minigame');
  assert.equal(await run('journeyRoadEventSession'),null);
  await run(`discoFixtureInfo=discoFixture(false);`);await shot('07-straight-preview');
  await run(`for(let i=0;i<2000&&mode==='run';i++)update(1/60);`);
  assert.equal(await run('mode'),'discodance');await run('leaveDiscoDance();');
  assert.equal(await run('journeyRoadEventSession'),null);
  await run(`const end=journeyNode(journeyRoute.next).at;
   for(let i=0;i<2000&&mode==='run'&&dist<end-20;i++)update(1/60);`);
  assert.equal(await run('mode'),'run');await shot('08-exit-blend');
  await run(`startJourneyWithSeed(0);`);assert.equal(await run('discoGame'),null);
  assert.deepEqual(errors,[]);
  console.log('JOURNEY_DISCO_BROWSER_OK '+JSON.stringify({screenshots:out,freeze:true,completedWins:3,sideAndStraight:true,desktopRender:renderTiming}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
