const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url'),Q=require('../assets/encounters/tavern-arm-core.js');
const rng=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const smart=s=>s.cue==='recover'||s.cue==='rest'&&s.energy>.65;
const results={};
for(const policy of ['hold','rest','smart']){let wins=0,total=0;for(let seed=1;seed<=100;seed++){const s=Q.create(),random=rng(seed);Q.start(s);for(let i=0;i<12000&&!s.result;i++){Q.hold(s,policy==='hold'||policy==='smart'&&smart(s));Q.update(s,1/60,random);}assert(s.result);wins+=Number(s.result.win);total+=s.elapsed;assert(s.energy>=0&&s.energy<=1);assert(s.rivalEnergy>=0&&s.rivalEnergy<=1);}results[policy]={wins,seconds:total/100};}
assert.equal(results.hold.wins,0);assert.equal(results.rest.wins,0);assert(results.smart.wins>=90);console.log('ARM_RULES_OK',results);
// Same simulation across 30/60/120 Hz, with no per-frame randomness.
for(const hz of [30,60,120]){const s=Q.create(),r=rng(8);Q.start(s);s.phase='playing';Q.hold(s,true);for(let i=0;i<hz*10;i++)Q.update(s,1/hz,r);if(hz===30)results.frame=s;else assert(Math.abs(results.frame.power-s.power)<1e-10);}
if(process.argv.includes('--rules-only'))process.exit(0);
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..'),out=path.join(root,'output/tavern-arm');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{for(const [device,width,height,dpr]of [['desktop',775,1000,1],['phone',390,844,2]]){
 const p=await b.newPage({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(phone=>{requestAnimationFrame=()=>0;Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>phone?4:8});Object.defineProperty(navigator,'deviceMemory',{get:()=>phone?4:8});},device==='phone');
 await p.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?armlab=1');await p.waitForFunction(()=>window.KRTavernArm&&KREventVisuals.peek('tavern-arm'),null,{polling:50});
 const run=code=>p.evaluate(code=>(0,eval)(code),code),shot=async name=>{await run('SFX.setTestMuted(true);perfNow=2;shakeT=0;render()');await p.screenshot({path:path.join(out,device+'-'+name+'.png')});};
 const point=expr=>run(`(()=>{const r=${expr};return{x:((r.x+r.w/2)*viewScale+viewX)/renderDpr(),y:((r.y+r.h/2)*viewScale+viewY)/renderDpr()}})()`);
 const tap=async expr=>{const pt=await point(expr);await p.touchscreen.tap(pt.x,pt.y);};
 await shot('intro');await tap('ARM_WRESTLE_START_BTN');assert.equal(await run('armWrestleGame.phase'),'ready');await shot('ready');
 await run('for(let i=0;i<90;i++)updateArmWrestling(1/60)');assert.equal(await run('armWrestleGame.phase'),'playing');
 await p.keyboard.down('Space');assert(await run('armWrestleGame.held'));await run('for(let i=0;i<60;i++)updateArmWrestling(1/60)');assert(await run('armWrestleGame.energy<.9'));
 await p.keyboard.up('Space');assert.equal(await run('armWrestleGame.held'),false);
 const cdp=await p.context().newCDPSession(p),pt=await point('KRTavernArm.holdRect');await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...pt,id:1}]});assert(await run('armWrestleGame.held'));
 await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});assert.equal(await run('armWrestleGame.held'),false);
 await p.mouse.move(pt.x,pt.y);await p.mouse.down();assert(await run('armWrestleGame.held'));await p.keyboard.press('p');assert(await run('paused'));assert.equal(await run('armWrestleGame.held'),false);
 const before=await run('JSON.stringify(armWrestleGame)');await run('updateArmWrestling(5)');assert.equal(await run('JSON.stringify(armWrestleGame)'),before);await p.mouse.up();await p.keyboard.press('p');
 for(const power of [0,.05,.5,.95,1]){await run(`armWrestleGame.phase='playing';armWrestleGame.power=${power};`);await shot('pose-'+power);}
 for(const cue of ['rest','windup','surge','recover']){await run(`armWrestleGame.power=.5;armWrestleGame.cue='${cue}';armWrestleGame.cueT=.1`);await shot('cue-'+cue);}
 const state=await run('JSON.stringify([armWrestleGame,gold,dist])');await run('for(let i=0;i<20;i++)KRTavernArm.draw()');assert.equal(await run('JSON.stringify([armWrestleGame,gold,dist])'),state);
 assert(await run(`(()=>{for(let i=0;i<=100;i++){const p=KRTavernArm.pose({power:i/100});for(const e of [p.rivalElbow3,p.playerElbow3])if(Math.abs(Math.hypot(...p.grip3.map((v,j)=>v-e[j]))-Math.hypot(138,62,68))>1e-7)return false;if(Math.abs(Math.hypot(p.shoulder[0]-p.rivalElbow[0],p.shoulder[1]-p.rivalElbow[1])-135)>1e-7)return false;}const win=KRTavernArm.pose({power:1}),lose=KRTavernArm.pose({power:0});return win.grip[0]<win.rivalElbow[0]&&lose.grip[0]>lose.playerElbow[0];})()`));
 for(const lit of [false,true]){await run(`g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle='#b1a68e';g.fillRect(0,0,cvs.width,cvs.height);g.scale(2,2);g.translate(-55,-110);KRTavernArm.actor(${lit},'all',{power:.5,cue:'rest'},2);g.restore()`);await p.screenshot({path:path.join(out,device+'-actor-'+lit+'.png')});}
 for(const policy of ['hold','smart']){
  await run(`KRArmRules.start(armWrestleGame);for(let i=0;i<9000&&armWrestleGame.phase!=='result';i++){const s=armWrestleGame;KRArmRules.hold(s,${policy==='hold'?'true':"s.cue==='recover'||s.cue==='rest'&&s.energy>.65"});updateArmWrestling(1/60);}`);
  assert.equal(await run('armWrestleGame.result.win'),policy==='smart');await shot('result-'+policy);
 }
 const report=await run('KREventVisuals.report()');assert.equal(report.active,'tavern-arm');assert(report.reservedBytes<=report.budgetBytes);assert.equal(report.tier,device==='phone'?'mobile':'standard');
 await tap('MINIGAME_BACK_BTN');assert.equal(await run('mode'),'minigames');assert.equal(await run('KREventVisuals.report().reservedBytes'),0);
 await run("startArmWrestling('forest','journeyroadresume');armWrestleGame.roadAttempt=true;beginArmWrestlingMatch();armWrestleSwipe('right')");assert(await run('armWrestleGame.power>.5'));assert.equal(await run('KREventVisuals.report().reservedBytes'),0);
 assert.deepEqual(errors,[]);console.log(device,'ARM_BROWSER_OK hold / release / cancel / pause / rig / both outcomes / taxman');await p.close();
}}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
