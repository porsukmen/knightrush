const {chromium}=require('playwright'),assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/roadside-services');
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:480,height:800},hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);await page.waitForFunction(()=>window.KRMossyInn&&window.KRSunlitForest);
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  const start=async theme=>run(`roadLabState.entry=false;startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='${theme}'));godMode=true;SFX.setTestMuted(true);dist=journeyRoadEventTriggerAt(roadLabState.slot);roadScroll=dist;obstacles=[];pickups=[];updateJourneyRoadEvents(0);`);
  for(const theme of ['inn','caravan']){
   await start(theme);assert.equal(await run('mode'),'run');assert.equal(await run('journeyStepDistance(8)'),8);
   // Centre-lane press only changes lane; it cannot also accept the service.
   await run('player.x=player.lane=1');await page.keyboard.press('ArrowRight');assert.equal(await run('mode'),'run');assert.equal(await run('player.lane'),2);
   await page.keyboard.press('ArrowRight');assert.equal(await run('mode'),'run','Must actually reach the outer lane');
   await run('player.x=2');
   for(const data of ["{fresh:false,mode:'run',roadStop:roadLabState.slot.id}","{fresh:true,mode:'merchant',roadStop:roadLabState.slot.id}","{fresh:true,mode:'run',roadStop:'old-event'}"]){
    assert.equal(await run(`tryJourneyRoadsideStop('right',${data})`),false);
   }
   assert.equal(await run("tryJourneyRoadsideStop('left',null)"),false);
   await run('paused=true');await page.keyboard.press('ArrowRight');assert.equal(await run('mode'),'run');await run('paused=false');
   await run('render()');await page.screenshot({path:path.join(out,theme+'-offer.png')});
   await page.keyboard.press('ArrowRight');assert.equal(await run('mode'),theme==='inn'?'journeyevent':'merchant');
   await run("cancelJourneyRoadEvent('test-return');setMode('run');updateJourneyRoadEvents(0)");await page.keyboard.press('ArrowRight');assert.equal(await run('mode'),'run','No reentry');
   await start(theme);await run('dist=journeyRoadEventTriggerAt(roadLabState.slot)+19;updateJourneyRoadEvents(0)');
   assert.equal(await run('journeyRoute.eventRecords[roadLabState.slot.id].status'),'passed');assert.equal(await run('mode'),'run');
   // Actual pointer swipe takes its consent snapshot on pointer-down.
   await start(theme);await run('player.x=player.lane=2');
   await page.mouse.move(200,470);await page.mouse.down();await page.mouse.move(300,470,{steps:4});await page.mouse.up();
   assert.equal(await run('mode'),theme==='inn'?'journeyevent':'merchant');
   // Starting the gesture before the encounter window must not enter later.
   await start(theme);await run('dist-=10;player.x=player.lane=2');
   await page.mouse.move(200,470);await page.mouse.down();await run('dist+=10');await page.mouse.move(300,470,{steps:4});await page.mouse.up();assert.equal(await run('mode'),'run');
  }
  await start('inn');
  assert.equal(await run("KRMossyInn.hazard({kind:'root',lanes:[]},(z,x)=>({x,z:dist+30+z}))"),true,'Inn roots route to linen art');
  const paving=await run(`(()=>{const edge=journeyActiveEdge(),p=edge.pieces.find(p=>p.theme==='inn'),view={point:(z,x)=>({x,z})};
   const check=at=>KRMossyInn.floorDetails(view,Math.floor(at/4),at,at+4,edge,at).filter(s=>s.color==='#77796d');
   return{before:check(p.start-4).length,start:check(p.start).length,end:check(edge.pieces.filter(p=>p.theme==='inn').at(-1).end).length};})()`);
  assert.deepEqual(paving,{before:0,start:1,end:0});
  for(const offset of [-12,5,60]){
   await run(`dist=journeyActiveEdge().pieces.find(p=>p.theme==='inn').start+${offset};roadScroll=dist;render()`);await page.screenshot({path:path.join(out,'inn-paving-'+offset+'.png')});
  }
  assert.deepEqual(errors,[]);console.log('ROADSIDE_SERVICES_OK lane/fresh key/pointer/range/pass/reentry + hard paving edges + linen routing');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
