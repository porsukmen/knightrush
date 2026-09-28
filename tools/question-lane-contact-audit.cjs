const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 fs.mkdirSync('output/question-lane-contact',{recursive:true});
 for(const width of [390,1000]){
  const page=await b.newPage({viewport:{width,height:width===390?844:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href+'?roadlab=1');
  await page.waitForFunction(()=>window.KRSunlitForest,null,{polling:100});
  const run=s=>page.evaluate(s=>(0,eval)(s),s);
  await run(`globalThis.contactFixture=(id,side)=>{
   roadLabState.entry=false;roadLabState.direction=0;
   startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.id===id));
   const s=roadLabState.slot;if(journeyNormalSide(s)!==side)s.id+='y';
   dist=s.at-20;roadScroll=dist;obstacles=[];pickups=[];player.x=player.lane=1;
   updateJourneyRoadEvents(0);return s;
  }`);
  assert(await run("!ROAD_LAB_CASES.some(c=>['well','traveler'].includes(c.id))"));
  if(width===390)assert(await run(`(()=>{for(let seed=0;seed<100;seed++){
   startJourneyWithSeed(seed);for(const n of journeyRoute.nodes)for(const e of n.out)for(const s of e.events)
    if(['well','traveler','traveler_return'].includes(journeyNormalContent(s)))return false;
  }return true;})()`),'retired content absent from generated roads');
  for(const id of ['mushrooms','taxman','wolfden','camp'])for(const side of [-1,1]){
   await run(`contactFixture('${id}',${side});player.lane=player.x=${side+1};updateJourneyRoadEvents(0)`);
   assert.equal(await run('mode'),'run','no distant entry');
   assert.equal(await run('Math.abs(journeyNormalOffset(roadLabState.slot))'),4.45);
   await run(`handleJourneyRoadEventAction('${side>0?'right':'left'}')`);
   assert.equal(await run('mode'),'run','outward swipe cannot activate distant stop');
   await run('dist=roadLabState.slot.at-7;roadScroll=dist');
   const presentation=await run(`(()=>{const fill=g.fillText,rider=drawSerJonathanRider,text=[],looks=[];
    try{g.fillText=function(value,...args){text.push(String(value));return fill.call(this,value,...args)};
     drawSerJonathanRider=function(x,y,s,o){if(o?.appearance&&!o.squire)looks.push(o.appearance);return rider(x,y,s,o)};
     render();return {text,looks,expected:KRJonathan.materials('daylight')};
    }finally{g.fillText=fill;drawSerJonathanRider=rider}})()`);
   assert(!presentation.text.some(t=>t==='?'||t.startsWith('?  ')||t.includes('RIDE INTO THE ?')),'No floating marker/approach banner');
   assert(presentation.looks.length>0,'Production running rider must be captured');
   const look=presentation.looks.at(-1),m=presentation.expected;
   assert.equal(look.armor,m.armor);assert.equal(look.armorLight,m.light);
   assert.equal(look.armorDark,m.dark);assert.equal(look.steelLight,m.shine);
   assert.equal(look.shield.rim,m.light,'Shield silver must not become cream');
   await page.screenshot({path:`output/question-lane-contact/${width}-${id}-${side}.png`});
   await run('dist=roadLabState.slot.at;roadScroll=dist;updateJourneyRoadEvents(.016,dist-2)');
   assert.equal(await run('mode'),'journeyevent','contact enters '+id);
   assert.equal(await run('journeyRoadEventSession.blocking'),true);
   if(id==='wolfden')assert.equal(await run('journeyRoadEventSession.context.den.slide'),'flee');
   const token=await run('journeyRoadEventSession.token');await run('updateJourneyRoadEvents(.1)');
   assert.equal(await run('journeyRoadEventSession.token'),token,'single entry');
   await run("completeJourneyRoadEvent(journeyRoadEventSession.token,{status:'completed'});updateJourneyRoadEvents(0)");
   assert.equal(await run('mode'),'run');assert.equal(await run('journeyRoadEventSession'),null);
   // Passing in the centre or opposite lane never interrupts the runner.
   for(const lane of [1,1-side]){
    await run(`contactFixture('${id}',${side});player.x=player.lane=${lane};dist=roadLabState.slot.at;updateJourneyRoadEvents(.016,dist-2)`);
    assert.equal(await run('mode'),'run');
    await run('dist=roadLabState.slot.at+21;updateJourneyRoadEvents(.016,dist-1)');
    assert.equal(await run('journeyRoadEventSession'),null);
   }
  }
  await run("contactFixture('mushrooms',1);player.x=player.lane=2;paused=true;dist=roadLabState.slot.at;updateJourneyRoadEvents(0)");
  assert.equal(await run('mode'),'run');await run('paused=false;settingsOpen=true;updateJourneyRoadEvents(0)');assert.equal(await run('mode'),'run');
  await run('settingsOpen=false;updateJourneyRoadEvents(0)');assert.equal(await run('mode'),'journeyevent');
  await run("contactFixture('mushrooms',1);player.x=player.lane=2;dist=roadLabState.slot.at+25;updateJourneyRoadEvents(.1,roadLabState.slot.at-3)");
  assert.equal(await run('mode'),'journeyevent','swept contact before expiry');
  // Real run update crosses the near contact window without an extra gesture.
  await run("contactFixture('mushrooms',-1);player.x=player.lane=0;dist=roadLabState.slot.at-1.3;roadScroll=dist;update(.05)");
  assert.equal(await run('mode'),'journeyevent','production movement path');
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('QUESTION_LANE_CONTACT_OK: retired pools, four stops/both sides, direct run contact, skip/expiry, pause, swept contact, once-only lifecycle, phone/desktop captures.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
