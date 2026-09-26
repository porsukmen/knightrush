const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const raw=require('../assets/encounters/royal-shuffle-core.js'),R={...raw,create(seed){const s=raw.create(seed);s.pocketHand=0;return s;}},{chromium}=require('playwright');
const out=path.resolve(__dirname,'../output/royal-shuffle');fs.mkdirSync(out,{recursive:true});
function until(s,phase,dt=1/60){for(let i=0;s.phase!==phase&&i<10000;i++)R.update(s,dt);assert.equal(s.phase,phase);}
const seen=new Set();let maxCardStep=0,maxHandStep=0;
for(let seed=1;seed<=200;seed++){
 const s=R.create(seed*2654435761);R.begin(s);assert.equal(s.shuffleMoves.filter(R.isTrick).length,1);
 let prev=s.cards.map(c=>R.trajectory(s,c)),hands=R.handTargets(s);
 while(s.phase!=='choose'){
  const m=R.activeMove(s);if(R.isTrick(m))seen.add(m.kind);
  R.update(s,1/240);
  const poses=s.cards.map(c=>R.trajectory(s,c)),h=R.handTargets(s);
  assert.equal(new Set(s.cards.map(c=>c.id)).size,3);
  for(let i=0;i<3;i++){const p=poses[i],q=prev[i];assert(Number.isFinite(p.x+p.y+p.lift));maxCardStep=Math.max(maxCardStep,Math.hypot(p.x-q.x,p.y-p.lift-q.y+q.lift));}
  for(let i=0;i<2;i++)maxHandStep=Math.max(maxHandStep,Math.hypot(h[i][0]-hands[i][0],h[i][1]-hands[i][1]));
  prev=poses;hands=h;
 }
 R.choose(s,s.cards.find(c=>c.role==='QUEEN').slot);until(s,'result');assert(s.won);
 const previous=s.cards.map(c=>c.slot);R.begin(s);assert.deepEqual(s.cards.map(c=>c.slot),previous);assert.equal(s.shuffleMoves.filter(R.isTrick).length,2);
 assert.equal(new Set(s.shuffleMoves.filter(R.isTrick).map(m=>m.kind)).size,2);
 const a=R.create(seed*2654435761),b=R.create(seed*2654435761);R.begin(a);R.begin(b);until(a,'choose',1/30);until(b,'choose',1/144);assert.deepEqual(a.cards,b.cards);
 assert.equal(R.accuse,undefined);assert.equal(R.canCatch,undefined);
}
assert.equal(seen.size,4);
// Normal-tempo tricks have higher velocity; test continuity at exact joins,
// rather than treating the old slow animation's per-frame travel as a jump.
for(let seed=1;seed<=40;seed++){
 const s=R.create(seed);R.begin(s);until(s,'shuffle');
 while(s.phase==='shuffle'){
  const m=R.activeMove(s),ends=[m.reachTime,...(m.keys||[]).map(k=>m.reachTime+k.t*m.motionTime),m.duration];
  for(const t of ends){
   const a=structuredClone(s);a.phaseT=Math.max(0,t-1e-7);
   const points=()=>[...a.cards.map(c=>{const p=R.trajectory(a,c);return[p.x,p.y-p.lift];}),...R.handTargets(a)];
   const before=points();R.update(a,2e-7);const after=points();
   before.forEach((p,i)=>assert(Math.hypot(p[0]-after[i][0],p[1]-after[i][1])<.01,'animation join discontinuity'));
  }
  R.update(s,m.duration-s.phaseT+1e-7);
 }
}
console.log({core:'passed',seeds:200,tricks:[...seen],maxCardStep,maxHandStep});
for(const outcomes of [[false,false],[true,false,true],[false,true,false]]){
 const s=R.create(0xfedcba98);for(const win of outcomes){R.begin(s);until(s,'choose');R.choose(s,s.cards.find(c=>(c.role==='QUEEN')===win).slot);until(s,'result');}assert(s.matchOver);assert.equal(s.hand,outcomes.length);assert.equal(s.you,outcomes.filter(Boolean).length);
}
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{for(const phone of [false,true]){
 const ctx=await b.newContext({viewport:phone?{width:390,height:844}:{width:775,height:1000},deviceScaleFactor:phone?2:1,isMobile:phone,hasTouch:phone});const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(phone=>{requestAnimationFrame=()=>0;if(phone){Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>4});Object.defineProperty(navigator,'deviceMemory',{get:()=>4});}},phone);
 const run=c=>p.evaluate(c=>(0,eval)(c),c);
 await p.goto(pathToFileURL(path.resolve(__dirname,'../KnightRush.html')).href+'?queenlab=1');await p.waitForFunction(()=>window.KRRoyalShuffle&&KREventVisuals.peek('royal-shuffle'));
 await run('findQueenGame.pocketHand=0;SFX.setTestMuted(true);render()');const tag=phone?'phone':'desktop';
 const shot=async name=>{await run('render()');await p.locator('#game').screenshot({path:path.join(out,`${tag}-${name}.png`)});};
 const tap=async(x,y)=>{const pt=await run(`({x:(${x}*viewScale+viewX)/renderDpr(),y:(${y}*viewScale+viewY)/renderDpr()})`);if(phone)await p.touchscreen.tap(pt.x,pt.y);else await p.mouse.click(pt.x,pt.y);};
 await shot('intro');await tap(240,694);assert.equal(await run('findQueenGame.phase'),'memorize');await shot('memorize');
 await run('while(findQueenGame.phase!=="shuffle")updateFindQueen(1/120); updateFindQueen(.45)');await shot('shuffle');
 const rig=await run(`(()=>{let max=0;const s=KRRoyalShuffleRules.create(3);s.pocketHand=0;KRRoyalShuffleRules.begin(s);while(s.phase!=='choose'){KRRoyalShuffleRules.update(s,1/120);for(const a of KRRoyalShuffle.pose(s).arms){max=Math.max(max,Math.abs(Math.hypot(...a.elbow.map((x,i)=>x-a.shoulder[i]))-a.upper),Math.abs(Math.hypot(...a.elbow.map((x,i)=>x-a.wrist[i]))-a.lower));}}return max;})()`);assert(rig<1e-7,`rig ${rig}`);
 const noCatchBefore=await run('JSON.stringify(findQueenGame)');await p.keyboard.press('c');await tap(240,649);
 const hand=await run('(()=>{const w=KRRoyalShuffle.pose(findQueenGame).arms[0].wrist;return KRRoyalShuffle.toScreen({x:w[0],y:w[1]})})()');await tap(hand.x,hand.y);assert.equal(await run('JSON.stringify(findQueenGame)'),noCatchBefore);
 await run('while(findQueenGame.phase!=="choose")updateFindQueen(1/120);chooseFindQueenSlot(findQueenGame.cards.find(c=>c.role==="QUEEN").slot);updateFindQueen(1.3)');assert.equal(await run('findQueenGame.you'),1);
 await p.keyboard.press('Enter');assert.equal(await run('findQueenGame.hand'),2);await run('while(findQueenGame.phase!=="choose")updateFindQueen(1/120)');await shot('choose');
 const slot=await run('findQueenGame.cards.find(c=>c.role==="QUEEN").slot'),cardPoint=await run(`KRRoyalShuffle.toScreen({x:${172}+68*${slot},y:407})`);await tap(cardPoint.x,cardPoint.y);assert.equal(await run('findQueenGame.phase'),'reveal');await run('updateFindQueen(.7)');await shot('reveal');await run('updateFindQueen(.6)');assert(await run('findQueenGame.matchOver&&findQueenGame.you===2'));await shot('win');
 const purity=await run(`(()=>{const before=JSON.stringify({s:findQueenGame,gold,scrap,dist,hp:player.hp});for(let i=0;i<20;i++)KRRoyalShuffle.draw();return before===JSON.stringify({s:findQueenGame,gold,scrap,dist,hp:player.hp});})()`);assert(purity);
 await run('beginFindQueenRound();paused=true');const before=await run('JSON.stringify(findQueenGame)');await run('updateFindQueen(4)');assert.equal(await run('JSON.stringify(findQueenGame)'),before);await run('paused=false');
 const report=await run('KREventVisuals.report()');console.log({tag,rig,report,errors});assert.deepEqual(errors,[]);
 // Same pose/geometry, scene-local material adaptation. QA only.
 await p.evaluate(()=>{const c=document.createElement('canvas');c.width=960;c.height=450;const old=g;try{g=c.getContext('2d');g.fillStyle='#263433';g.fillRect(0,0,960,450);const s=KRRoyalShuffleRules.create(1);KRRoyalShuffle.actor(s,false);g.translate(480,0);KRRoyalShuffle.actor(s,true);c.id='queen-lighting';c.style.cssText='position:fixed;left:0;top:0;width:960px;height:450px;z-index:2147483647';document.body.appendChild(c);}finally{g=old;}});await p.locator('#queen-lighting').screenshot({path:path.join(out,`${tag}-lighting.png`)});await p.locator('#queen-lighting').evaluate(e=>e.remove());
 await run('leaveFindQueen()');assert.equal(await run('KREventVisuals.report().entries.length'),0);
 // Selected-image failure must not block the new game or exit.
 await p.evaluate(()=>{const d=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',{...d,set(v){d.set.call(this,String(v).includes('royal-shuffle-v1')?'assets/encounters/queen-audit-missing.png':v);}});});
 await run('startFindQueen();');await p.waitForFunction(()=>KRCutscenes.report().state==='fallback');await shot('fallback');await tap(240,694);assert.equal(await run('findQueenGame.phase'),'memorize');await tap(62,77);assert.equal(await run('mode'),'minigames');assert.equal(await run('KREventVisuals.report().reservedBytes'),0);
 await run('startFindQueen();setMode("menu")');await p.waitForTimeout(100);assert.equal(await run('KREventVisuals.report().reservedBytes'),0);assert.deepEqual(errors,[]);await ctx.close();
 }}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
