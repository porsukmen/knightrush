const assert=require('node:assert/strict'),R=require('../assets/encounters/royal-shuffle-core'),{chromium}=require('playwright');
const until=(s,p)=>{for(let i=0;s.phase!==p&&i<10000;i++)R.update(s,1/240);assert.equal(s.phase,p);};
for(let seed=1;seed<=100;seed++){
 for(const win of [false,true]){
  const s=R.create(seed*2654435761);s.pocketHand=1;s.pocketVariantOverride='queen';R.begin(s);until(s,'choose');assert(s.pocketed);
  assert.equal(R.tableCards(s).length,3);assert(R.tableCards(s).every(c=>c.role==='KING'));assert.equal(R.visibleCards(s).length,4);
  assert.equal(R.accuse,undefined);if(win)assert(R.catchPocket(s));else R.choose(s,seed%3);until(s,win?'result':'coverup');assert.equal(s.won,win);
  const old=R.tableCards(s).map(c=>({id:c.id,slot:c.slot})),returnSlot=s.spare.slot;
  if(win){R.begin(s);assert.equal(s.phase,'restore');}until(s,'memorize');assert(!s.pocketed&&!s.spare);assert.equal(s.hand,2);
  assert.equal(s.cards.find(c=>c.role==='QUEEN').slot,returnSlot);
  for(const c of s.cards.filter(c=>c.role!=='QUEEN'))assert.equal(c.slot,old.find(o=>o.id===c.id).slot);
 }
 const honest=R.create(seed);honest.pocketHand=0;R.begin(honest);while(R.activeMove(honest)?.kind!=='honestPass')R.update(honest,1/240);const m=R.activeMove(honest);R.update(honest,m.reachTime+m.motionTime*.5);assert(!honest.caught);
}
console.log('POCKET_RULES_OK: 100 seeds / wins, losses, three kings, continuous next hand, honest-pass accusations');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{for(const phone of [false,true]){
 const ctx=await b.newContext({viewport:phone?{width:390,height:844}:{width:775,height:1000},hasTouch:phone,isMobile:phone}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>requestAnimationFrame=()=>0);await p.goto('file:///C:/Users/Altar/Desktop/knight%20rush/KnightRush.html?queenlab=1');await p.waitForFunction(()=>window.KRRoyalShuffle&&KREventVisuals.peek('royal-shuffle'));
 const run=s=>p.evaluate(s=>(0,eval)(s),s),tag=phone?'phone':'desktop';
 const shot=async n=>{await run('paused=false;render()');await p.locator('#game').screenshot({path:'output/royal-shuffle/'+tag+'-'+n+'.png'});};
 await run('SFX.setTestMuted(true);findQueenGame=KRRoyalShuffleRules.create(73491);findQueenGame.pocketHand=1;findQueenGame.pocketVariantOverride="queen";KRRoyalShuffleRules.begin(findQueenGame)');await shot('new-faces');
 await run('while(KRRoyalShuffleRules.activeMove(findQueenGame)?.kind!=="pocketSwitch")KRRoyalShuffleRules.update(findQueenGame,1/240)');
 const rig=await run(`(()=>{const s=findQueenGame,m=KRRoyalShuffleRules.activeMove(s);let max=0;for(let u=0;u<=1;u+=.005){s.phaseT=m.reachTime+u*m.motionTime;for(const a of KRRoyalShuffle.pose(s).arms)max=Math.max(max,Math.abs(Math.hypot(...a.elbow.map((v,i)=>v-a.shoulder[i]))-a.upper),Math.abs(Math.hypot(...a.elbow.map((v,i)=>v-a.wrist[i]))-a.lower));}s.phaseT=m.reachTime;return max;})()`);assert(rig<1e-7);
 for(const u of [.18,.42,.72,.9]){await run(`findQueenGame.phaseT=KRRoyalShuffleRules.activeMove(findQueenGame).reachTime+${u}*KRRoyalShuffleRules.activeMove(findQueenGame).motionTime`);await shot('switch-'+u);}
 await run('while(findQueenGame.phase!=="choose")KRRoyalShuffleRules.update(findQueenGame,1/240)');await shot('pocket-choice');
 const pt=await run('(()=>{const q=KRRoyalShuffle.toScreen(KRRoyalShuffleRules.pocket);return{x:(q.x*viewScale+viewX)/renderDpr(),y:(q.y*viewScale+viewY)/renderDpr()}})()');
 if(phone)await p.touchscreen.tap(pt.x,pt.y);else await p.mouse.click(pt.x,pt.y);
 assert(await run('findQueenGame.pocketCaught'));await run('updateFindQueen(.25)');await shot('surprised');await run('updateFindQueen(.75)');await shot('queen-in-hand');await run('updateFindQueen(.25)');assert(await run('findQueenGame.won'));
 await run('beginFindQueenRound();updateFindQueen(.5)');await shot('restore');await run('updateFindQueen(.6)');assert.equal(await run('findQueenGame.phase'),'memorize');
 await run('findQueenGame=KRRoyalShuffleRules.create(73491);findQueenGame.pocketHand=1;findQueenGame.pocketVariantOverride="queen";KRRoyalShuffleRules.begin(findQueenGame);while(findQueenGame.phase!=="choose")KRRoyalShuffleRules.update(findQueenGame,1/240);KRRoyalShuffleRules.choose(findQueenGame,0);KRRoyalShuffleRules.update(findQueenGame,.7)');await shot('only-king-reveal');
 await run('while(findQueenGame.phase!=="coverup")KRRoyalShuffleRules.update(findQueenGame,1/240);KRRoyalShuffleRules.update(findQueenGame,.55)');await shot('coverup-switch');
 await run('KRRoyalShuffleRules.update(findQueenGame,.5)');assert.equal(await run('findQueenGame.phase'),'memorize');assert.equal(await run('findQueenGame.hand'),2);await shot('auto-next-hand');
 assert.deepEqual(errors,[]);console.log({tag,rig,tapPocket:true,autoNext:true,errors});await ctx.close();
 }}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
