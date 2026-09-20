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
  const out=path.resolve('output/journey-crimson-browser');fs.mkdirSync(out,{recursive:true});
  const shot=async name=>{await run('render()');await page.screenshot({path:path.join(out,name+'.png')});};
  await run(`SFX.toggle();
   function redFixture(direction){
    for(let seed=0;seed<100;seed++){
     startJourneyWithSeed(seed);godMode=true;
     for(const node of journeyRoute.nodes)for(const edge of node.out){
      if(edge.preview.theme!=='bloodwood'||edge.direction!==direction)continue;
      const parent=journeyRoute.nodes.find(n=>n.out.some(e=>e.to===node.id));
      if(!parent||parent.out.find(e=>e.to===node.id).preview.theme!=='forest')continue;
      journeyRoute.from=parent.id;journeyRoute.next=node.id;journeyRoute.activeEdge=parent.out.find(e=>e.to===node.id).id;
      dist=node.at-28;roadScroll=dist;runDistance=dist;armJourneyNode();
      roadsideScenery=[];obstacles=[];pickups=[];nextTreeAt=dist-4;nextSpawnAt=Infinity;spawnLoopEntities();
      return {seed,edgeId:edge.id,nodeId:node.id,direction};
     }
    }throw Error('No red fixture');
   }`);
  for(const direction of [-1,1,0]){
   await run(`globalThis.redInfo=redFixture(${direction});globalThis.originalRedTrees=roadsideScenery.filter(t=>!t.gnd).map(t=>({v:t.v,b:t.bloodAmount}));`);
   await shot('entrance-'+direction);
   assert(await run('roadsideScenery.filter(t=>!t.gnd&&dist+t.z<=journeyNode(redInfo.nodeId).at).every(t=>t.bloodAmount===0)'),'Incoming forest cannot be recolored');
   assert(await run(`(()=>{const edge=journeyNode(redInfo.nodeId).out.find(e=>e.id===redInfo.edgeId),at=edge.pieces[0].start;
     const amounts=[0,30,50,75,95].map(d=>journeyThemeStrength(edge,at+d,'bloodwood'));
     return amounts[0]===0&&amounts[1]===0&&amounts[2]>0&&amounts[3]>amounts[2]&&amounts[4]===1;})()`));
   assert(await run(`(()=>{const original=drawJourneyDiscoPatch,alpha=[];
    try{drawJourneyDiscoPatch=(...a)=>alpha.push(a[6]);drawJourneyBloodGround();}
    finally{drawJourneyDiscoPatch=original;}return alpha.length>0&&alpha.every(a=>a===1);})()`));
   await run(`player.lane=${direction+1};chooseJourneyDirection(${direction});
    for(let i=0;i<250&&journeyRoute.activeEdge!==redInfo.edgeId;i++)update(1/60);`);
   assert.equal(await run('journeyRoute.activeEdge'),await run('redInfo.edgeId'));
   if(direction){
    await run('for(let i=0;i<16;i++)update(1/60);');await shot('turning-'+direction);
    assert(await run(`journey.oldTrees.filter(t=>t.branchDirection===undefined&&originalRedTrees.some(b=>b.v===t.v))
      .every(t=>originalRedTrees.some(b=>b.v===t.v&&b.b===t.bloodAmount))`),'Old trees changed during yaw');
   }
   await run(`for(let i=0;i<600&&mode==='run'&&(journey.phase==='turning'||journey.phase==='settling'||journeyRoute.pendingArm);i++)update(1/60);`);
   await shot('entered-'+direction);
  }
  await run(`globalThis.redSlot=journeyActiveEdge().events.find(e=>e.definition==='elite_finale');
   dist=redSlot.at-35;roadScroll=dist;obstacles=[];pickups=[];roadsideScenery=[];nextTreeAt=dist-4;spawnLoopEntities();`);
  await shot('lair');
  await run(`dist=redSlot.at-.01;roadScroll=dist;for(let i=0;i<10&&mode==='run';i++)update(1/60);`);
  assert.equal(await run('mode'),'boss');assert.equal(await run('activeBossDefinition().id'),'road_wolf');
  const freeze=await run('[dist,roadScroll]');await run('for(let i=0;i<175;i++)update(1/60);');
  assert.deepEqual(await run('[dist,roadScroll]'),freeze);await shot('fight');
  await run('for(let i=0;i<1800&&!isPlayerTurn();i++)update(1/60);');
  assert.equal(await run('isPlayerTurn()'),true);await shot('player-turn');
  const tapRect=async name=>{
    const p=await run(`(()=>{const r=${name};return {x:((r.x+r.w/2)*viewScale+viewX)/renderDpr(),y:((r.y+r.h/2)*viewScale+viewY)/renderDpr()};})()`);
    await page.touchscreen.tap(p.x,p.y);
  };
  const hp=await run('boss.hp'),ap=await run('boss.ap');await tapRect('TURN_FIGHT_BTN');
  assert.equal(await run('boss.ap'),ap-1);await run('for(let i=0;i<240;i++)update(1/60);');
  assert(await run(`boss.hp<${hp}`),'fight button deals real HP damage');
  await tapRect('TURN_FINISH_BTN');await run('for(let i=0;i<1800&&!isPlayerTurn();i++)update(1/60);');
  await tapRect('TURN_SKILL_BTN');assert.equal(await run('boss.playerMenu'),'skills');
  const beforeSkill=await run('boss.hp');await tapRect('TURN_SKILL_BTNS[0]');await run('for(let i=0;i<240;i++)update(1/60);');
  assert(await run(`boss.hp<${beforeSkill}`),'skill button deals real HP damage');
  await run('boss.hp=0;defeatBoss();for(let i=0;i<240&&mode!=="run";i++)update(1/60);');
  assert.equal(await run('mode'),'run');assert.equal(await run('journeyRoute.eventRecords[redSlot.id].status'),'completed');
  const reward=await run('[gold,pack]');await run('for(let i=0;i<180;i++)update(1/60);');
  assert.equal(await run('mode'),'run');assert.deepEqual(await run('[gold,pack]'),reward);
  assert.deepEqual(errors,[]);console.log('CRIMSON_BROWSER_OK',JSON.stringify({left:true,right:true,straight:true,opaqueGround:true,stationaryFight:true,completion:true,noDuplicateReward:true,screenshots:out}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
