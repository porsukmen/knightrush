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
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  const out=path.resolve('output/journey-turn-input');fs.mkdirSync(out,{recursive:true});
  await run(`SFX.toggle();journeyRoadEventHandlers.delete('disco_finale');journeyRoadEventHandlers.delete('elite_finale');
   function turnInputFixture(direction,offset,disco=false){
    for(let seed=0;seed<100;seed++){
     startJourneyWithSeed(seed);godMode=true;
     const node=journeyRoute.nodes.find(n=>n.out.some(e=>e.direction===direction&&
       (!disco||e.preview.theme==='disco'))&&(!disco||n.out.some(e=>e.direction===0)));
     if(!node)continue;
     const parent=journeyRoute.nodes.find(n=>n.out.some(e=>e.to===node.id));
     journeyRoute.from=parent.id;journeyRoute.next=node.id;
     journeyRoute.activeEdge=parent.out.find(e=>e.to===node.id).id;
     dist=node.at+offset;roadScroll=dist;runDistance=dist;armJourneyNode();
     roadsideScenery=[];obstacles=[];pickups=[];nextTreeAt=dist-4;nextSpawnAt=Infinity;
     spawnLoopEntities();player.lane=1;player.x=1;render();
     return node.out.find(e=>e.direction===direction).id;
    }throw Error('No matching fixture');
   }`);
  const session=await page.context().newCDPSession(page);
  const swipe=async direction=>{
   const x=direction===1?210:270,points=[{x,y:620}];
   await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});
   await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+direction*110,y:620}]});
   await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  };
  let inputs=0;
  for(const direction of [-1,1])for(const offset of [-50,-15,3.9,9.9,14,17.9])for(const touch of [false,true]){
   const edge=await run(`turnInputFixture(${direction},${offset})`);
   const action=()=>touch?swipe(direction):page.keyboard.press(direction===1?'ArrowRight':'ArrowLeft');
   await action();assert.equal(await run('player.lane'),direction+1);
   assert.equal(await run('journeyRoute.selection'),null,'First gesture must only change lanes');
   await action();assert.equal(await run('journeyRoute.selection'),edge,'Outer-lane gesture must latch');
   await run(`for(let i=0;i<240&&journey.phase!=='turning';i++)update(1/60);`);
   assert.equal(await run('journey.phase'),'turning');assert.equal(await run('journey.direction'),direction);
   assert.equal(await run('journeyRoute.activeEdge'),edge);inputs++;
  }
  // Passing a Disco branch must keep its still-visible art in world space.
  // Reproduce the reported seed by RUNNING past the old +4 straight commit,
  // not teleporting into a late fixture (which hid the original bug).
  let lateSeedInputs=0;
  for(const curved of [false,true])for(const touch of [false,true])for(const frameDt of [1/60,.1]){
   const edge=await run(`startJourneyWithSeed(647486904);godMode=true;curvedWorldTrial=${curved};
    const n=journeyNode(journeyRoute.next);
    dist=n.at-2;roadScroll=dist;runDistance=dist;
    roadsideScenery=[];obstacles=[];pickups=[];nextTreeAt=Infinity;nextSpawnAt=Infinity;
    while(dist<n.at+16)update(${frameDt});
    if(journeyRoute.pendingArm||journey.phase!=='approach')throw Error('Late choice already closed');
    n.out.find(e=>e.direction===1).id;`);
   const action=()=>touch?swipe(1):page.keyboard.press('ArrowRight');
   await action();await action();
   assert.equal(await run('journeyRoute.selection'),edge);
   // A long next frame must still commit the accepted input at the boundary.
   await run('update(.2);render();');
   assert.equal(await run('journey.phase'),'turning');
   assert.equal(await run('journeyRoute.activeEdge'),edge);
   await run('for(let i=0;i<180;i++)update(1/60);');
   assert.equal(await run('mode'),'run');
   assert(await run('Number.isFinite(journeyCameraPose().yaw)'));
   lateSeedInputs++;
  }
  // A genuinely missed exit must not be reopened after the shared deadline.
  await run(`startJourneyWithSeed(647486904);godMode=true;
   dist=journeyNode(journeyRoute.next).at+JOURNEY_TURN_LATE_DISTANCE-.1;
   update(1/60);`);
  assert.equal(await run('journeyActiveEdge().direction'),0);
  assert.equal(await run('chooseJourneyDirection(1)'),false);
  const missed=await run('turnInputFixture(1,JOURNEY_TURN_LATE_DISTANCE-.1,true)');
  const points=await run(`JSON.stringify(journeyDiscoRoadViews().filter(v=>v.edge.id===${JSON.stringify(missed)})
    .map(v=>({spill:!!v.spill,point:v.point(v.edge.pieces[0].start+12,7)})))`);
  await page.screenshot({path:path.join(out,'before-missed-disco.png')});
  await run('update(1/60);render();');
  assert(await run('journeyRoute.pendingArm'));
  assert.equal(await run(`JSON.stringify(journeyDiscoRoadViews().filter(v=>v.edge.id===${JSON.stringify(missed)})
    .map(v=>({spill:!!v.spill,point:v.point(v.edge.pieces[0].start+12,7)})))`),points);
  await page.screenshot({path:path.join(out,'after-missed-disco.png')});
  assert.equal(await run('journeyActiveEdge().direction'),0,'No automatic side turn');
  await run('for(let i=0;i<160;i++)update(1/60);');
  assert.equal(await run('journey.passedNodeId'),undefined,'Old branch references must retire');
  assert.deepEqual(errors,[]);
  console.log('JOURNEY_TURN_INPUT_BROWSER_OK '+JSON.stringify({inputs,lateSeedInputs,seed:647486904,keyboardAndTouch:true,missedDiscoStable:true,screenshots:out}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
