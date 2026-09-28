const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true}),out='output/run-event-vitals';fs.mkdirSync(out,{recursive:true});try{
 const p=await b.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>requestAnimationFrame=()=>0);
 await p.goto(pathToFileURL(path.resolve('KnightRush.html')).href+'?roadlab=1');
 await p.waitForFunction(()=>window.KRSunlitForest,null,{polling:100});
 const run=s=>p.evaluate(s=>(0,eval)(s),s);
 await run(`resetRun();godMode=false;debugRun=false;setMode('run');relics=[];syncArtifactCache();setPlayerDamageTakenModifier(.25);pickups=[];
 globalThis.crash=()=>{obstacles=[{z:.3,prevZ:.8,req:['jump','jump','jump'],type:{},kind:'log'}];player.jumpT=-1;player.duckT=-1;updateRunCollisions();}`);
 const unit=await run('PLAYER_HEALTH_CONTRACT.unitsPerHeart'),full=await run('player.currentHealthUnits');
 await run('crash()');assert.equal(await run('player.currentHealthUnits'),full-unit);assert(await run('player.alive'));
 await run('crash()');assert.equal(await run('player.currentHealthUnits'),full-unit,'Contact invulnerability prevents duplicate wounds');
 await run('obstacles=[];render()');await p.screenshot({path:out+'/phone-run.png'});
 for(let hp=full-unit;hp>0;hp-=unit){await run('player.invuln=0;crash()');assert.equal(await run('player.currentHealthUnits'),Math.max(0,hp-unit));}
 assert.equal(await run('mode'),'dying');assert.equal(await run('player.alive'),false);
 await run(`resetRun();godMode=false;startBoss();grantPlayerShields(2);grantPlayerShields(1,30);setMode('boss')`);
 assert.equal(await run('player.shieldCharges'),3,'Same-battle phase transition retains shields');
 await run('startBoss()');assert.equal(await run('player.shieldCharges'),0,'New enemy must start without old skill shields');
 await run('grantPlayerShields(1,30);boss.hp=0;defeatBoss()');
 assert.deepEqual(await run('[player.shieldCharges,player.volatileShieldCharges,player.volatileShieldPosture]'),[0,0,0]);
 await run(`startBoss();grantPlayerShields(2);relics=[{type:'shield',charged:true}];syncArtifactCache();setMode('run')`);
 assert.equal(await run('player.shieldCharges'),0,'Abort/exit clears skill shields');assert(await run('relics[0].charged'),'Artifact untouched');
 await run(`relics=[];syncArtifactCache();player.currentHealthUnits-=PLAYER_HEALTH_CONTRACT.unitsPerHeart;restorePlayerHealthAfterBoss()`);
 assert.equal(await run('player.currentHealthUnits'),await run('player.maxHealthUnits'));
 assert(await run('player.heartFlashFromUnits<player.heartFlashToUnits'),'Inn/boss full-heal uses refill animation');
 for(const width of [390,1000]){
  await p.setViewportSize({width,height:width===390?844:1000});
  await run(`resize();roadLabState.entry=false;roadLabState.direction=0;startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.id==='camp'));
   dist=roadLabState.slot.at;roadScroll=dist;player.x=player.lane=journeyNormalSide(roadLabState.slot)+1;updateJourneyRoadEvents(0);`);
  await run("prepareCutscene('rest-camp',true,journeyRoadEventSession.token)");
  await run(`player.currentHealthUnits=player.maxHealthUnits-2*PLAYER_HEALTH_CONTRACT.unitsPerHeart;update(.3);handleJourneyRoadEventAction('choice1');for(let i=0;i<20;i++)update(.1);render()`);
  assert.equal(await run('player.currentHealthUnits'),await run('player.maxHealthUnits'),'Heal is real immediately, not tied to rendering');
  const start=await run('player.heartFlashStartedAt');
  const samples=[];
  for(const [name,t] of [['start',0],['filling',.52],['full',1.5]]){
   await run(`perfNow=${start+t};render()`);
   samples.push(await run('displayedHeartUnits(player.currentHealthUnits,{startedAt:player.heartFlashStartedAt,fromUnits:player.heartFlashFromUnits,toUnits:player.heartFlashToUnits})'));
   await p.screenshot({path:out+'/'+width+'-camp-'+name+'.png'});
  }
  assert(samples[0]<samples[1]&&samples[1]<samples[2],'Hearts must progressively fill');
  assert.equal(samples[2],await run('player.maxHealthUnits'));
  const before=await run('JSON.stringify([player.currentHealthUnits,player.shieldCharges,gold])');await run('render();render()');
  assert.equal(await run('JSON.stringify([player.currentHealthUnits,player.shieldCharges,gold])'),before,'HUD render is pure');
 }
 assert.deepEqual(errors,[]);console.log('RUN_EVENT_VITALS_OK exact one-heart obstacle, invulnerability, lethal final hit, battle-only normal/purple shields, artifact preservation, animated camp heal, desktop/phone, render purity');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
