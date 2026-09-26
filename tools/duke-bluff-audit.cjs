const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url'),Q=require('../assets/encounters/duke-bluff-core.js');
function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
assert(!Q.valid({count:1,face:3},{count:1,face:3}));assert(Q.valid({count:1,face:4},{count:1,face:3}));assert(Q.valid({count:2,face:1},{count:1,face:6}));assert.equal(Q.next({count:6,face:6}),null);
// Exact enumeration against all 216 unknown hands, no wildcard ones.
for(const own of [[1,2,3],[6,6,6],[3,3,4]])for(let count=1;count<=6;count++)for(let face=1;face<=6;face++){
 let hits=0;for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)for(let c=1;c<=6;c++)if([...own,a,b,c].filter(n=>n===face).length>=count)hits++;
 assert(Math.abs(Q.probability(own,{count,face})-hits/216)<1e-10);
}
// The private player hand is a throwing getter: AI has no reason to touch it.
const view={ownDice:[2,4,4],bid:{count:2,face:4,owner:'player'},history:[]};Object.defineProperty(view,'playerDice',{get(){throw Error('AI cheated');}});
assert.deepEqual(Q.decide(view,rng(4)),Q.decide({...view,unknownHand:[6,6,6]},rng(4)));
const tally={player:0,duke:0,bluffs:0,truths:0,maxActions:0};
for(const value of [.1,.9]){
 const s=Q.create();let calls=0;const random=()=>{calls++;return value;};Q.startRound(s,random);
 assert.equal(s.phase,'coinToss');assert.equal(s.round,0);assert.equal(calls,1);
 assert.equal(s.starter,value<.5?'player':'duke');Q.startRound(s,random);assert.equal(calls,1,'Repeated start cannot reroll the coin');
 assert.equal(Q.bid(s,'player',{count:1,face:1},random),false);assert.equal(Q.challenge(s,'player'),false);
 Q.update(s,Q.rules.coinTime-.01,random);assert.equal(s.phase,'coinToss');assert.equal(calls,1);
 Q.update(s,.02,random);assert.equal(s.phase,'rolling');assert.equal(s.round,1);assert.equal(calls,7);
 Q.update(s,1,random);assert.equal(s.turn,s.starter);
 s.phase='result';s.starter='duke';Q.startRound(s,random);assert.equal(s.phase,'rolling');assert.equal(s.starter,'duke');
 s.phase='result';s.matchWinner='player';Q.startRound(s,random);assert.equal(s.phase,'coinToss');assert.equal(s.round,0);
}
for(let seed=1;seed<=400;seed++){
 const random=rng(seed),s=Q.create();let steps=0;Q.startRound(s,random);
 while(!s.matchWinner&&steps++<400){
  if(s.phase==='result'){Q.startRound(s,random);continue;}
  if(s.phase==='turn'&&s.turn==='player'){
   const a=Q.decide({ownDice:s.playerDice,bid:s.bid,history:s.history.map(h=>({...h,owner:h.owner==='duke'?'player':'duke'}))},random);
   if(a.type==='call')assert(Q.challenge(s,'player'));else assert(Q.bid(s,'player',a.bid,random));
  }
  if(s.phase==='revealing'){const before={...s.losses},result=s.result;Q.update(s,2,random);assert.equal(s.losses[result.loser],before[result.loser]+1);Q.update(s,2,random);assert.equal(s.losses[result.loser],before[result.loser]+1);tally[result.truth?'truths':'bluffs']++;}
  else Q.update(s,3,random);
 }
 assert(s.matchWinner,'Every match terminates');assert(s.round<=5);assert.equal(s.losses[s.matchWinner==='player'?'duke':'player'],3);tally[s.matchWinner]++;tally.maxActions=Math.max(tally.maxActions,steps);
}
console.log('DUKE_RULES_OK',tally);
if(process.argv.includes('--rules-only'))process.exit(0);
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..'),out=path.join(root,'output/duke-bluff');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 for(const [device,width,height,dpr]of [['desktop',775,1000,1],['phone',390,844,2]]){
  const p=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(phone=>{requestAnimationFrame=()=>0;Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>phone?4:8});Object.defineProperty(navigator,'deviceMemory',{get:()=>phone?4:8});},device==='phone');
  await p.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?dukelab=1');await p.waitForFunction(()=>window.KRDukeBluff&&KREventVisuals.peek('duke-bluff'),null,{polling:50});
  const run=code=>p.evaluate(code=>(0,eval)(code),code),shot=async name=>{await run('SFX.setTestMuted(true);perfNow=2;render();');await p.screenshot({path:path.join(out,device+'-'+name+'.png')});};
  const tap=async expr=>{const pt=await run(`(()=>{const r=${expr};return{x:((r.x+r.w/2)*viewScale+viewX)/renderDpr(),y:((r.y+r.h/2)*viewScale+viewY)/renderDpr()}})()`);await p.touchscreen.tap(pt.x,pt.y);};
  await shot('intro');await tap('DICE_REPLAY_BTN');assert.equal(await run('diceGame.phase'),'coinToss');
  const coinState=await run('JSON.stringify(diceGame)');await p.keyboard.press('Enter');await tap('DICE_REPLAY_BTN');assert.equal(await run('JSON.stringify(diceGame)'),coinState);
  await run('paused=true;updateDiceGuess(10)');assert.equal(await run('JSON.stringify(diceGame)'),coinState);await run('paused=false');
  for(const starter of ['player','duke'])for(const t of [.35,.65,1.4,2.1]){
   await run(`diceGame.starter='${starter}';diceGame.phaseT=${t}`);await shot('coin-'+starter+'-'+t);
   if(t===2.1)assert.equal(await run('KRDukeBluff.coinPose(diceGame.phaseT,diceGame.starter).crown'),starter==='player');
  }
  const drawn=await run('JSON.stringify(diceGame)');await run('for(let i=0;i<12;i++)KRDukeBluff.draw()');assert.equal(await run('JSON.stringify(diceGame)'),drawn);
  await run('updateDiceGuess(1.2)');assert.equal(await run('diceGame.phase'),'rolling');
  await run("diceGame.starter='player';updateDiceGuess(1);");await shot('opening');
  await run('diceGame.rivalDice=[1,1,1];perfNow=2;render()');const concealed=await p.screenshot();
  await run('diceGame.rivalDice=[6,6,6];render()');assert(concealed.equals(await p.screenshot()),'Hidden dice must not leak into any pixels');
  await p.keyboard.press('ArrowRight');assert.equal(await run('diceGame.selected.face'),2);
  await p.keyboard.press('ArrowUp');assert.equal(await run('diceGame.selected.count'),2);
  await tap('KRDukeBluff.rects.count[1]');await tap('KRDukeBluff.rects.face[3]');assert.deepEqual(await run('diceGame.selected'),{count:2,face:4});
  await tap('KRDukeBluff.rects.raise');assert.equal(await run('diceGame.turn'),'duke');await shot('thinking');
  const state=await run('JSON.stringify([diceGame,gold,dist])');await run('for(let i=0;i<12;i++)KRDukeBluff.draw()');assert.equal(await run('JSON.stringify([diceGame,gold,dist])'),state);
  await run('paused=true;updateDiceGuess(10)');assert.equal(await run('JSON.stringify([diceGame,gold,dist])'),state);await run('paused=false;updateDiceGuess(3)');
  // Explicit truth/falsehood challenge fixtures through the REAL touch handler.
  for(const truth of [false,true]){
   await run(`diceGame.phase='turn';diceGame.turn='player';diceGame.bid={owner:'duke',count:3,face:4};diceGame.playerDice=[1,2,4];diceGame.rivalDice=${truth?'[4,4,6]':'[2,3,6]'};diceGame.losses={player:0,duke:0};`);
   await tap('KRDukeBluff.rects.call');assert.equal(await run('diceGame.phase'),'revealing');
   for(const t of [.0,.45,.95]){await run(`diceGame.phaseT=${t}`);await shot('reveal-'+truth+'-'+t);}
   await run('updateDiceGuess(2)');assert.equal(await run('diceGame.result.truth'),truth);assert.equal(await run(`diceGame.losses.${truth?'player':'duke'}`),1);await shot('result-'+truth);
  }
  await run("diceGame.phase='turn';diceGame.turn='player';diceGame.bid={owner:'duke',count:2,face:4};diceGame.selected={count:1,face:1}");
  assert.equal(await run('submitDukeBid()'),false);await p.keyboard.press('b');assert.equal(await run('diceGame.phase'),'revealing');
  // Every articulated pose uses invariant bones, including the raised cup.
  assert(await run(`(()=>{for(const phase of ['turn','rolling','revealing','result'])for(let i=0;i<=100;i++){const s={phase,phaseT:i/60,tell:i%4},p=KRDukeBluff.pose(i/60,s);for(const a of [p.left,p.right]){const d=(u,v)=>Math.hypot(u[0]-v[0],u[1]-v[1]);if(Math.abs(d(a.shoulder,a.elbow)-a.upper)>1e-7||Math.abs(d(a.elbow,a.wrist)-a.lower)>1e-7)return false;}}return true})()`));
  for(const lit of [false,true]){await run(`g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle='#b3ab94';g.fillRect(0,0,cvs.width,cvs.height);g.scale(2,2);g.translate(-80,-110);KRDukeBluff.actor(${lit},'all',{phase:'turn',tell:0});g.restore();`);await p.screenshot({path:path.join(out,device+'-actor-'+lit+'.png')});}
  const report=await run('KREventVisuals.report()');assert.equal(report.active,'duke-bluff');assert.equal(report.tier,device==='phone'?'mobile':'standard');assert(report.reservedBytes<=report.budgetBytes);
  await tap('MINIGAME_BACK_BTN');assert.equal(await run('mode'),'minigames');assert.equal(await run('KREventVisuals.report().reservedBytes'),0);
  assert.deepEqual(errors,[]);console.log(device+' DUKE_BROWSER_OK touch / reveal / seals / pause / purity / rig / release');await p.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
