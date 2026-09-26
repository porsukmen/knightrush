const assert=require('node:assert/strict'),R=require('../assets/encounters/royal-shuffle-core');
const variants=['queen','king','feintQueen','feintKing'];
function until(s,p){for(let i=0;s.phase!==p&&i<15000;i++)R.update(s,1/240);assert.equal(s.phase,p);}
for(const variant of variants)for(let seed=1;seed<=60;seed++)for(const pickPocket of [false,true]){
 const s=R.create(seed*2654435761);s.pocketHand=1;s.pocketVariantOverride=variant;R.begin(s);
 while(s.phase!=='choose'){
  for(const c of R.visibleCards(s)){const p=R.trajectory(s,c);assert(Number.isFinite(p.x+p.y+p.widthScale));assert(!p.peekFace);}
  R.update(s,1/240);
 }
 assert.equal(R.tableCards(s).length,3);assert.equal(new Set(R.visibleCards(s).map(c=>c.id)).size,4);
 assert.equal(R.pocketCard(s).role,variant==='queen'?'QUEEN':'KING');
 assert.equal(R.tableCards(s).filter(c=>c.role==='QUEEN').length,variant==='queen'?0:1);
 const slots=R.tableCards(s).map(c=>[c.id,c.slot]),returnSlot=s.spare.slot;
 if(pickPocket){assert(R.catchPocket(s));assert(!R.catchPocket(s));assert.equal(R.accuse,undefined);}
 else R.choose(s,R.tableCards(s).find(c=>c.role==='QUEEN')?.slot??0);
 const win=pickPocket?variant==='queen':variant!=='queen';until(s,win?'result':'coverup');assert.equal(s.won,win);assert.equal(s.you,win?1:0);assert.equal(s.dealer,win?0:1);
 if(win)R.begin(s);until(s,'memorize');assert.equal(s.hand,2);assert(!s.pocketed&&!s.spare);assert.equal(new Set(s.cards.map(c=>c.slot)).size,3);
 for(const c of s.cards){const old=slots.find(([id])=>id===c.id);assert.equal(c.slot,old?old[1]:returnSlot);}
}
console.log('PASS: four pocket variants, 480 hands, no face flashes, correct/wrong accusations, table wins, continuity of next-hand layout');

(async()=>{const {chromium}=require('playwright'),b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage({viewport:{width:775,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>requestAnimationFrame=()=>0);await p.goto('file:///C:/Users/Altar/Desktop/knight%20rush/KnightRush.html?queenlab=1');await p.waitForFunction(()=>window.KRRoyalShuffle&&KREventVisuals.peek('royal-shuffle'));
 const run=s=>p.evaluate(s=>(0,eval)(s),s);
 for(const variant of variants){
  await run(`SFX.setTestMuted(true);findQueenGame=KRRoyalShuffleRules.create(73491);findQueenGame.pocketHand=1;findQueenGame.pocketVariantOverride='${variant}';KRRoyalShuffleRules.begin(findQueenGame);while(KRRoyalShuffleRules.activeMove(findQueenGame)?.kind!=='pocketSwitch')KRRoyalShuffleRules.update(findQueenGame,1/240)`);
  const report=await run(`(()=>{const s=findQueenGame,m=KRRoyalShuffleRules.activeMove(s);let rig=0;for(let u=0;u<=1;u+=.005){s.phaseT=m.reachTime+u*m.motionTime;for(const c of KRRoyalShuffleRules.visibleCards(s)){const st=KRRoyalShuffle.cardState(s,c);if(st.face||st.flip!==1)throw Error('pocket face flash');}for(const a of KRRoyalShuffle.pose(s).arms)rig=Math.max(rig,Math.abs(Math.hypot(...a.elbow.map((v,i)=>v-a.shoulder[i]))-a.upper),Math.abs(Math.hypot(...a.elbow.map((v,i)=>v-a.wrist[i]))-a.lower));}s.phaseT=m.reachTime;return rig;})()`);assert(report<1e-7);
  for(const u of [.40,.53,.65,.9]){await run(`findQueenGame.phaseT=KRRoyalShuffleRules.activeMove(findQueenGame).reachTime+${u}*KRRoyalShuffleRules.activeMove(findQueenGame).motionTime;paused=false;render()`);await p.locator('#game').screenshot({path:`output/royal-shuffle/decoy-${variant}-${u}.png`});}
  await run('while(findQueenGame.phase!=="choose")KRRoyalShuffleRules.update(findQueenGame,1/240)');
  const pt=await run('(()=>{const q=KRRoyalShuffle.toScreen(KRRoyalShuffleRules.pocket);return{x:(q.x*viewScale+viewX)/renderDpr(),y:(q.y*viewScale+viewY)/renderDpr()}})()');await p.mouse.click(pt.x,pt.y);
  await run('KRRoyalShuffleRules.update(findQueenGame,.5);render()');assert.equal(await run('findQueenGame.pocketPicked'),true);
  await p.locator('#game').screenshot({path:`output/royal-shuffle/decoy-${variant}-picked.png`});
  await p.setViewportSize({width:390,height:844});await run('paused=false;render()');await p.locator('#game').screenshot({path:`output/royal-shuffle/phone-decoy-${variant}-picked.png`});await p.setViewportSize({width:775,height:1000});
 }
 assert.deepEqual(errors,[]);console.log('PASS: four rendered variants, fixed-length rigs, real pocket clicks, desktop/phone-size captures');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
