const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const Q=require('../assets/encounters/tavern-slide-physics.js'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/tavern-slide-v2');fs.mkdirSync(out,{recursive:true});
function settled(owner,x,y){return{...Q.makeMug(owner,0,0),x,y};}
function solve(board){const p=Q.plan(board);while(!Q.advancePlan(p,4)){}return p;}
assert.equal(Q.rules.mugRadius,30*.85);assert.deepEqual(Q.rules.rings,[38,88,132]);
for(const [d,score] of [[38,3],[39,2],[88,2],[89,1],[132,1],[133,0]])assert.equal(Q.score(settled('player',240+d,450)),score);
for(const x of [70,180,240,410])for(const y of [237,360,475,680,714]){const p=Q.project(x,y),w=Q.unproject(p.x,p.y);assert(Math.abs(w.x-x)<1e-8&&Math.abs(w.y-y)<1e-8);}
const wall=[{...Q.makeMug('player',-400,-150),x:88}];Q.step(wall);assert(wall[0].vx>0,'Cushion must bounce');
const end=[{...Q.makeMug('player',0,-820),y:Q.rules.tableTop-Q.rules.mugRadius+1}];Q.step(end);assert(!end[0].onTable,'Short end must remain open');
const target=[settled('player',240,450)],before=JSON.stringify(target),p=solve(target),after=Q.simulate(target,p.best);
assert.equal(JSON.stringify(target),before,'Planner mutated real cups');assert(after.filter(m=>m.owner==='player').reduce((a,m)=>a+Q.score(m),0)<3,'AI must dislodge center cup');
assert(after.filter(m=>m.owner==='ai').reduce((a,m)=>a+Q.score(m),0)>=2,'AI should replace attacked cup');
// Repeatability and identical simulated/live solver result.
const shot={vx:-430,vy:-350},sim=Q.simulate([],shot,'player'),live=[Q.makeMug('player',shot.vx,shot.vy)];for(let i=0;i<540;i++)if(!Q.step(live).moving)break;
assert.deepEqual(sim,live);assert.deepEqual(Q.simulate(target,p.best),after);
let wins=0,losses=0,ties=0,bankPlans=0,maxBatchMs=0;
for(let game=0;game<24;game++){
 let board=[];
 for(let turn=0;turn<6;turn++){
  const owner=(turn+game)%2?'ai':'player';
  if(owner==='ai'){const plan=Q.plan(board);let ready=false;while(!ready){const start=performance.now();ready=Q.advancePlan(plan,4);maxBatchMs=Math.max(maxBatchMs,performance.now()-start);}if(plan.best.label.startsWith('BANK'))bankPlans++;board=Q.simulate(board,plan.best);}
  else{const s=Q.launch('player'),dx=((game*17+turn*11)%41)-20,dy=450-s.y,d=Math.hypot(dx,dy),speed=Math.sqrt(2*Q.rules.friction*d)*(1+(game%5-2)*.012);board=Q.simulate(board,{vx:dx/d*speed,vy:dy/d*speed},'player');}
 }
 const sums={player:0,ai:0};board.forEach(m=>sums[m.owner]+=Q.score(m));if(sums.ai>sums.player)wins++;else if(sums.ai<sums.player)losses++;else ties++;
}
assert(wins>losses,'AI should beat a repetitive bullseye policy');console.log({AIvsCenter:{wins,losses,ties},bankPlans,maxBatchMs});
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});
 try{for(const [device,width,height,dpr] of [['desktop',775,1000,1],['phone',390,844,2]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(phone=>{requestAnimationFrame=()=>0;Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>phone?4:8});Object.defineProperty(navigator,'deviceMemory',{get:()=>phone?4:8});},device==='phone');
  await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);const run=code=>page.evaluate(code=>(0,eval)(code),code);
  await page.waitForFunction(()=>window.KRSunlitForest,null,{polling:50});await run("startTavernSlide('forest','minigames');SFX.setTestMuted(true);");
  await page.waitForFunction(()=>window.KRTavernSlide&&KREventVisuals.peek('tavern-slide'),null,{polling:50});
  // Planted palms and rigid bones through idle breathing, independent of light.
  assert(await run(`(()=>{
   for(let i=0;i<=600;i++){
    const pose=KRTavernSlide.barryPose(i/10);
    for(const [side,a] of [[-1,pose.left],[1,pose.right]]){
     const len=(x,y)=>Math.hypot(x[0]-y[0],x[1]-y[1]);
     if(Math.abs(len(a.shoulder,a.elbow)-a.upper)>1e-8||Math.abs(len(a.elbow,a.wrist)-a.lower)>1e-8)return false;
     if(a.wrist[0]!==side*48||a.wrist[1]!==-52||side*a.elbow[0]<=side*a.shoulder[0])return false;
    }
   }return true;
  })()`),'Barry shoulders/elbows/wrists must remain attached with invariant bone lengths');
  assert(await run(`(()=>{
   const near={...KRTavernPhysics.makeMug('player',0,0),x:240,y:120};
   const t={phase:'playing',shotActive:false,shotIndex:1,first:'player',mugs:[near]};
   const before=JSON.stringify(t),waiting=KRTavernSlide.mugLayers(t);
   if(waiting.length!==2||waiting[0].m.owner!=='ai'||waiting[1].m!==near||JSON.stringify(t)!==before)return false;
   const shot=KRTavernPhysics.makeMug('ai',0,300);t.shotActive=true;t.mugs.push(shot);
   if(KRTavernSlide.mugLayers(t)[0].m!==shot)return false;
   shot.y=180;return KRTavernSlide.mugLayers(t)[1].m===shot;
  })()`),'Waiting and moving Barry cups must share far-to-near depth sorting');
  const shot=async name=>{await run('paused=false;shakeT=0;perfNow=2;render();');await page.screenshot({path:path.join(out,device+'-'+name+'.png')});};
  await shot('intro');
  for(const first of ['player','ai']){
   await run(`beginTavernSlideMatch();tavernSlideGame.first='${first}';`);
   let previous=0;
   for(const [time,name]of [[.52,'flight'],[1.05,'contact'],[1.23,'bounce'],[1.95,'settled'],[2.9,'read-result']]){
    await run(`updateTavernSlide(${time-previous});`);previous=time;
    assert.equal(await run('tavernSlideGame.phase'),'coinToss');assert.equal(await run('tavernSlideGame.mugs.length'),0);
    await shot('coin-'+first+'-'+name);
   }
   const pose=await run('KRTavernSlide.coinPose(tavernSlideGame.phaseT,tavernSlideGame.first)');assert(pose.settled);assert.equal(pose.height,0);assert.equal(pose.crown,first==='player');
   await run('updateTavernSlide(.21);');assert.equal(await run('tavernSlideGame.phase'),'playing');
   if(first==='ai')await shot('barry-ready');
  }
  await run("beginTavernSlideMatch();tavernSlideGame.first='player';updateTavernSlide(TAVERN_SLIDE_RULES.coinTossTime+.01);");await shot('aim');
  assert(await run(`(()=>{const p=KRTavernPhysics.project(240,835),s=p.scale*TAVERN_SLIDE_RULES.mugRadius/17;
    const x=(p.x*viewScale+viewX)/renderDpr(),y=((p.y-36*s*TAVERN_SLIDE_RULES.mugHeightScale)*viewScale+viewY)/renderDpr();
    const hit=beginTavernSlideAim(x,y);cancelTavernSlideAim();return hit;})()`),'Tall mug upper body must be draggable');
  // Use real input path, not a direct velocity launch. Inspect state without a second RAF.
  const pt=await run("(()=>{const p=KRTavernPhysics.project(240,835);return{x:(p.x*viewScale+viewX)/renderDpr(),y:(p.y*viewScale+viewY)/renderDpr(),s:viewScale/renderDpr()};})()");
  if(device==='phone'){
   const cdp=await page.context().newCDPSession(page),touch=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
   await touch('touchStart',pt.x,pt.y-10*pt.s);await touch('touchMove',pt.x+22*pt.s,pt.y+63*pt.s);await shot('pull');await touch('touchEnd');await cdp.detach();
  }else{
   await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowUp');assert(await run('tavernSlideGame.keyAngle>0&&tavernSlideGame.keyPower>.36'));
   await page.mouse.move(pt.x,pt.y-10*pt.s);await page.mouse.down();await page.mouse.move(pt.x+22*pt.s,pt.y+63*pt.s,{steps:5});await shot('pull');await page.mouse.up();
  }
  assert(await run('tavernSlideGame.shotActive'));
  await run('for(let i=0;i<180;i++)updateTavernSlide(1/120);');await shot('collision');
  await run("for(let i=0;i<12000&&tavernSlideGame.phase!=='result';i++){if(tavernCanPlayerAim())launchTavernKeyboardShot();updateTavernSlide(1/120);}");assert.equal(await run('tavernSlideGame.phase'),'result');await shot('result');
  assert.equal(await run('tavernSlideGame.mugs.length'),6);
  // Useful populated table screenshot independent of stochastic match path.
  await run("tavernSlideGame.phase='playing';tavernSlideGame.feedback='YOUR TURN — DRAW, ATTACK OR BANK';tavernSlideGame.shotActive=false;tavernSlideGame.shotIndex=4;tavernSlideGame.first='player';tavernSlideGame.mugs=[{...KRTavernPhysics.makeMug('ai',0,0),x:229,y:449},{...KRTavernPhysics.makeMug('player',0,0),x:291,y:473},{...KRTavernPhysics.makeMug('ai',0,0),x:241,y:559}];");await shot('tactical-table');
  // The native update accumulator resolves the same shot at different refresh rates.
  const endpoints=await run(`(()=>{const saved=tavernSlideGame;try{return [30,60,120,165].map(hz=>{tavernSlideGame={mugs:[KRTavernPhysics.makeMug('player',370,-640)],physicsAccumulator:0,shotActive:false};for(let i=0;i<hz*5;i++)updateTavernMugPhysics(1/hz);return tavernSlideGame.mugs.map(m=>[m.x,m.y,m.onTable]);});}finally{tavernSlideGame=saved;}})()`);
  endpoints.slice(1).forEach(e=>e.forEach((m,i)=>{assert(Math.abs(m[0]-endpoints[0][i][0])<.001);assert(Math.abs(m[1]-endpoints[0][i][1])<.001);assert.equal(m[2],endpoints[0][i][2]);}));
  const snapshot=await run('JSON.stringify([gold,scrap,dist,tavernSlideGame.mugs])');await run('for(let i=0;i<20;i++)KRTavernSlide.draw();');assert.equal(await run('JSON.stringify([gold,scrap,dist,tavernSlideGame.mugs])'),snapshot);
  const report=await run('KREventVisuals.report()');assert.equal(report.active,'tavern-slide');assert(report.reservedBytes<=report.budgetBytes);
  for(const lit of [false,true]){await run(`g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle='#a99979';g.fillRect(0,0,cvs.width,cvs.height);g.translate(0,-170);g.scale(2,2);KRTavernSlide.barry(${lit});g.restore();`);await page.screenshot({path:path.join(out,device+'-barry-'+(lit?'lit':'neutral')+'.png')});}
  await run('leaveTavernSlide();');assert.equal(await run('mode'),'minigames');assert.equal(await run('KREventVisuals.report().reservedBytes'),0);
  await page.evaluate(()=>{const d=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',{...d,set(v){d.set.call(this,String(v).includes('tavern-slide-v2')?'assets/encounters/intentional-slide-audit-missing.png':v);}});});
  await run('startTavernSlide();');await page.waitForFunction(()=>KRCutscenes.report().state==='fallback',null,{polling:50});await shot('fallback');await run("beginTavernSlideMatch();tavernSlideGame.first='player';updateTavernSlide(TAVERN_SLIDE_RULES.coinTossTime+.01);launchTavernKeyboardShot();");assert(await run('tavernSlideGame.shotActive'));await run('leaveTavernSlide();');
  assert.deepEqual(errors,[]);console.log(device,'SLIDE_OK input / match / purity / memory / return');await page.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
