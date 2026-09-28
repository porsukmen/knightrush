const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 fs.mkdirSync('output/ui-roles',{recursive:true});
 for(const width of [390,1000]){
  const p=await b.newPage({viewport:{width,height:width===390?844:1000},hasTouch:true}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>requestAnimationFrame=()=>0);
  const run=s=>p.evaluate(s=>(0,eval)(s),s);
  const open=async query=>{await p.goto(pathToFileURL(path.resolve('KnightRush.html')).href+'?'+query);await p.waitForFunction(()=>document.querySelector('#game')?.dataset.bootReady==='1');};
  const capture=async name=>{
   const rows=await run(`(()=>{const original=KRUI,rows=[];window.KRUI={...original,button(g,r,label,id,o={}){rows.push({label,r,role:o.enabled===false?'disabled':o.selected?'primary':o.variant==='secondary'?'secondary':'primary',selected:!!o.selected});original.button(g,r,label,id,o)}};try{render()}finally{window.KRUI=original}return rows})()`);
   await p.screenshot({path:'output/ui-roles/'+width+'-'+name+'.png'});return rows;
  };
  const expect=(rows,label,role)=>{const row=rows.findLast(r=>r.label===label);assert(row,'Missing '+label);assert.equal(row.role,role,label)};
  await open('');let rows=await capture('menu');expect(rows,'▶ PLAY','primary');expect(rows,'SETTINGS','secondary');expect(rows,'MINIGAMES','secondary');
  await run('settingsOpen=true');rows=await capture('settings');expect(rows,'◄ BACK','secondary');await run('settingsOpen=false');
  await open('camplab=1');await run("prepareCutscene('rest-camp',true,journeyRoadEventSession.token)");
  rows=await capture('camp-before');expect(rows,'BACK TO THE ROAD','secondary');
  await run('journeyRoadEventSession.context.resting=true');rows=await capture('camp-resting');expect(rows,'BACK TO THE ROAD','disabled');
  await run('journeyRoadEventSession.context.resting=false;journeyRoadEventSession.context.rested=true');rows=await capture('camp-after');expect(rows,'BACK TO THE ROAD','primary');
  await open('taxmanlab=1');rows=await capture('tax-choices');expect(rows,'Pay the "royal" tax. [5 gold]','primary');expect(rows,'Prove your authority. [Dodge the seal]','primary');
  await run('journeyNormalReply(journeyRoadEventSession.context,["Safe travels."])');rows=await capture('tax-done');expect(rows,'BACK TO THE ROAD','primary');
  await open('fightlootlab=1');rows=await capture('loot-before');expect(rows,'LEAVE LOOT','secondary');
  await run('update(.25);journeyRoadEventSession.context.loot.entries.forEach(e=>claimJourneyLootReward(journeyRoadEventSession.context,e.id))');rows=await capture('loot-after');expect(rows,'CONTINUE','primary');
  await open('dukelab=1');await run("diceGame.phase='turn';diceGame.turn='player';diceGame.bid={owner:'duke',count:2,face:3};diceGame.selected={count:3,face:4}");
  rows=await capture('duke-choices');expect(rows,'< BACK','secondary');expect(rows,'3','primary');expect(rows,'2','secondary');expect(rows,'RAISE CLAIM','primary');expect(rows,'BLUFF!','primary');
  await open('merchantlab=1');rows=await capture('merchant');expect(rows,'BACK TO DEBUG','secondary');expect(rows,'RESET TEST','secondary');
  // Price labels are composed separately; inspect the live shared button rectangles.
  const priceRows=rows.filter(r=>r.label===''&&r.r.y===650);assert(priceRows.some(r=>r.role==='primary'),'buy primary');assert(priceRows.some(r=>r.role==='secondary'),'reroll secondary');
  await open('roadlab=1');
  await run("roadLabState.entry=false;roadLabState.direction=0;startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='chest'));dist=journeyRoadEventTriggerAt(roadLabState.slot);roadScroll=dist;updateJourneyRoadEvents(0)");
  rows=await capture('treasure');expect(rows,'< BACK','secondary');expect(rows,'EXAMINE THE LOCK','primary');
  const levels=rows.filter(r=>['EASY','NORMAL','HARD','MASTER'].includes(r.label));assert.equal(levels.length,4);assert.equal(levels.filter(r=>r.role==='primary').length,1);assert.equal(levels.filter(r=>r.role==='secondary').length,3);
  const target=levels.find(r=>r.role==='secondary');const pt=await run(`({x:(${target.r.x+target.r.w/2}*viewScale+viewX)/renderDpr(),y:(${target.r.y+target.r.h/2}*viewScale+viewY)/renderDpr()})`);await p.touchscreen.tap(pt.x,pt.y);rows=await capture('treasure-selected');expect(rows,target.label,'primary');
  assert.deepEqual(errors,[]);await p.close();
 }
 console.log('UI_ACTION_ROLES_OK: phone/desktop; menu/settings, camp 3 states, tax choices/completion, loot before/after, Duke choices, merchant buy/reroll, Treasure selectable difficulty.');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
