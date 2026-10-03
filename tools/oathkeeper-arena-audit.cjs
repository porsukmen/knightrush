'use strict';
// This audit owns only its source and output/oathkeeper-arena-audit. It never
// writes production assets or reference baselines. Captures are opt-in so a
// lifecycle run is not accidentally presented as final geometry evidence.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {chromium}=require('playwright'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/oathkeeper-arena-audit');
const {createManager,assets}=require('../assets/encounters/event-visuals.js');
const assetId='oathkeeper-arena',base=process.env.KR_BASE_URL||'http://127.0.0.1:8765';
const capture=process.argv.includes('--captures'),pureOnly=process.argv.includes('--pure-only');
const arenaSource=fs.readFileSync(path.join(root,'labs/oathkeeper-arena.js'),'utf8');
const paletteSource=fs.readFileSync(path.join(root,'assets/encounters/oath-sword-art.js'),'utf8');
const files=['KnightRush.html','labs/oathkeeper-arena.js','assets/encounters/event-visuals.js','labs/oathkeeper-moveset.js','labs/oathkeeper-model.js','labs/oathkeeper-physical.js','labs/oathkeeper-encounter.js','labs/boss-sequence-runtime.js','assets/encounters/oath-sword-art.js','assets/encounters/jonathan-model.js','assets/mounted-combat.js','labs/mounted-knight-renderer.js','labs/mounted-knight-run-motion.js'];
const hashes=()=>Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]));
const report={scope:'Selected-tier arena ownership and native rendering diagnostics. Optional stills are fixed poses, not a fluidity review or aesthetic approval. RGBA payload estimates exclude browser/GPU/main canvas; desktop emulation is not physical-phone FPS.',capturesRequested:capture,sourceHashesBefore:hashes(),checks:[],browser:[],captures:[],errors:[]};
const record=(id,data={})=>report.checks.push({id,passed:true,...data});
const plain=value=>JSON.parse(JSON.stringify(value));
function rig(tier='standard',options={}){
 const spec=assets[assetId][tier],images=[];
 const manager=createManager({tier,...options,createImage:()=>{
  const image={naturalWidth:spec.width,naturalHeight:spec.height,decode:()=>Promise.resolve(),removeAttribute(){this.src='';this.released=true;}};
  images.push(image);return image;
 }});
 const scope={mode:'boss',boss:{definitionId:'oathkeeper'},player:{alive:true},VW:480,VH:800,PAD_TOT:80,PAD_BOT:40,KREventVisuals:manager};
 vm.createContext(scope);vm.runInContext(paletteSource,scope);vm.runInContext(arenaSource,scope);
 return {scope,arena:scope.KROathkeeperArena,manager,images,spec,load:async(index=images.length-1)=>images[index].onload?.()};
}
async function pureAudit(){
 for(const tier of ['standard','mobile']){
  const r=rig(tier),a=r.arena,m=r.manager,s=r.spec,metadata=await sharp(path.join(root,s.src)).metadata();
  assert.equal(metadata.width,s.width);assert.equal(metadata.height,s.height);
  const payload=s.width*s.height*4;
  assert(payload<=m.report().budgetBytes);assert.equal(m.report().maxEntries,2);
  record('asset-metadata-'+tier,{width:s.width,height:s.height,decodedRGBAEstimate:payload,budgetBytes:m.report().budgetBytes,compressedBytes:fs.statSync(path.join(root,s.src)).size});
  const pending=a.sync();assert.equal(a.sync(),pending,'Repeated sync must share the owner promise');
  assert.equal(r.images.length,1);assert.equal(r.images[0].src,s.src);assert.equal(a.coversWorld(),false);
  assert.equal(m.report().reservedBytes,payload);assert.equal(m.report().decodedBytes,0);
  await r.load();assert.equal(await pending,true);assert.equal(a.coversWorld(),true);assert.equal(m.peek(assetId),r.images[0]);
  assert.equal(m.report().decodedBytes,payload);assert.equal(m.report().entries.length,1);
  const nativePalette=plain(r.scope.KROathSwordArt.palettes);
  assert(a.lighting());assert(a.knightLighting());assert(a.swordLighting());
  for(const [key,color]of Object.entries(nativePalette.neutral))assert.equal(a.swordLighting()[color],nativePalette.shrine[key]);
  a.setSceneLighting(false);assert.equal(a.lighting(),null);assert.equal(a.knightLighting(),null);assert.equal(a.swordLighting(),null);
  a.setSceneLighting(true);assert.deepEqual(plain(r.scope.KROathSwordArt.palettes),nativePalette,'Scene lighting must not mutate shared sword palettes');
  const state={imageSmoothingEnabled:false,imageSmoothingQuality:'low'},stack=[],draws=[];
  const ctx={...state,save(){stack.push({imageSmoothingEnabled:this.imageSmoothingEnabled,imageSmoothingQuality:this.imageSmoothingQuality});},restore(){Object.assign(this,stack.pop());},drawImage(...args){draws.push(args);}};
  const before=plain(m.report()),gameBefore=plain({boss:r.scope.boss,player:r.scope.player});
  for(let i=0;i<100;i++)assert.equal(a.draw(ctx),true);
  assert.equal(stack.length,0);assert.equal(ctx.imageSmoothingEnabled,false);assert.equal(ctx.imageSmoothingQuality,'low');
  assert(draws.every(args=>args[0]===r.images[0]),'All draws must reuse the one manager-owned image');
  assert.deepEqual(plain(m.report()),before,'Drawing must not alter loads/ownership/budgets');
  assert.deepEqual(plain({boss:r.scope.boss,player:r.scope.player}),gameBefore,'Drawing must not mutate encounter state');
  ctx.drawImage=()=>{throw Error('draw failure fixture');};assert.throws(()=>a.draw(ctx),/draw failure fixture/);
  assert.equal(stack.length,0);assert.equal(ctx.imageSmoothingEnabled,false);assert.equal(ctx.imageSmoothingQuality,'low');
  record('ready-selected-tier-render-pure-'+tier,{draws:100,managerLoads:m.report().loads,retainedEntries:m.report().entries.length,scenePalettesScoped:true,canvasStateRestoredOnThrow:true});
  r.scope.mode='menu';await a.sync();assert.equal(a.active(),false);assert.equal(a.coversWorld(),false);
  assert.equal(m.report().reservedBytes,0);assert.equal(a.lighting(),null);assert.equal(a.knightLighting(),null);assert.equal(a.swordLighting(),null);assert(r.images[0].released);
  // A reset during network loading releases both the reservation and waiter.
  r.scope.mode='boss';const cancelled=a.sync(),late=r.images[1].onload;a.reset();assert.equal(await cancelled,false);await late();
  assert.equal(m.report().entries.length,0);assert.equal(m.peek(assetId),null);
  // A prior async decode cannot replace a newly ready owner/generation.
  const old=a.sync();let finishDecode;r.images[2].decode=()=>new Promise(resolve=>{finishDecode=resolve;});
  const decoding=r.load(2);a.reset();assert.equal(await old,false);
  const next=a.sync();await r.load(3);assert.equal(await next,true);finishDecode();await decoding;
  assert.equal(m.peek(assetId),r.images[3]);assert.equal(a.coversWorld(),true);
  r.scope.player.alive=false;r.scope.mode='dying';await a.sync();assert.equal(m.report().reservedBytes,0);assert.equal(a.active(),false);
  r.scope.player.alive=true;r.scope.mode='boss';r.scope.boss={definitionId:'oathkeeper'};
  const fresh=a.sync();await r.load(4);assert.equal(await fresh,true);
  r.scope.boss={definitionId:'bear'};const count=m.report().loads;await a.sync();assert.equal(m.report().reservedBytes,0);assert.equal(m.report().loads,count);assert.equal(a.lighting(),null);
  assert.equal(a.draw(ctx),false);m.clear();
  record('reset-cancel-late-decode-death-otherboss-'+tier,{lateCompletionCannotResurrect:true});
  const catalog={...assets,'arena-lookahead-b':assets[assetId],'arena-lookahead-c':assets[assetId],
   'arena-over-budget':{[tier]:{src:'never-requested.png',width:9000,height:9000}}};
  const bounded=rig(tier,{catalog}),bm=bounded.manager,active=bm.activate(assetId);
  await bounded.load(0);assert.equal(await active,true);
  const oldLookahead=bm.prefetch('arena-lookahead-b'),newLookahead=bm.prefetch('arena-lookahead-c');
  assert.equal(await oldLookahead,false,'Loading lookahead must count toward the two-entry bound');
  assert(bounded.images[1].released);assert.equal(bm.peek(assetId),bounded.images[0],'Pinned arena cannot be evicted by lookahead');
  await bounded.load(2);assert.equal(await newLookahead,true);assert.equal(bm.report().entries.length,2);
  assert.equal(bm.report().peakBytes,payload*2);assert(bm.report().peakBytes<=bm.report().budgetBytes);
  const loadsBefore=bm.report().loads;assert.equal(await bm.prefetch('arena-over-budget'),false);assert.equal(bm.report().loads,loadsBefore);
  record('actual-tier-budget-pinned-lru-'+tier,{maxEntries:2,peakReservedRGBAEstimate:bm.report().peakBytes,budgetBytes:bm.report().budgetBytes});bm.clear();
 }
 {
  const r=rig(),m=r.manager;let finishModule;
  delete r.scope.KREventVisuals;r.scope.loadEventVisualModule=()=>new Promise(resolve=>{finishModule=resolve;});
  const pending=r.arena.sync();r.scope.mode='menu';r.arena.sync();r.scope.KREventVisuals=m;finishModule(true);
  assert.equal(await pending,false);assert.equal(m.report().loads,0);record('late-module-reset',{imageLoads:0});
 }
 {
  const r=rig(),pending=r.arena.sync();r.images[0].naturalWidth=99;await r.load();assert.equal(await pending,false);
  assert.equal(r.arena.coversWorld(),false);assert.equal(r.manager.report().reservedBytes,0);
  const loads=r.manager.report().loads;for(let i=0;i<100;i++)await r.arena.sync();
  assert.equal(r.manager.report().loads,loads,'Failed owner must not retry on each update');
  record('dimensions-failure-fallback-no-retry',{loads});r.manager.clear();
 }
}
const run=(page,code)=>page.evaluate(code=>(0,eval)(code),code);
async function boot(browser,tier){
 const context=await browser.newContext({viewport:{width:480,height:850},hasTouch:true,deviceScaleFactor:1});
 const page=await context.newPage(),requests=[],errors=[];
 await page.addInitScript(({tier})=>{
  Object.defineProperty(navigator,'deviceMemory',{configurable:true,get:()=>tier==='mobile'?2:8});
  Object.defineProperty(navigator,'hardwareConcurrency',{configurable:true,get:()=>tier==='mobile'?2:8});
 },{tier});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',request=>{if(/oathkeeper-arena-v1(?:-mobile)?\.png/.test(request.url()))requests.push(request.url());});
 await page.goto(base+'/KnightRush.html?oathkeeperlab=1&seed=99501',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.KROathkeeperEncounter&&window.KRMountedRunner?.ready&&window.KROathkeeperArena,null,{timeout:120000});
 await run(page,'SFX.setTestMuted(true);KROathkeeperArena.ready();');
 await page.waitForFunction(()=>KROathkeeperArena.coversWorld(),null,{timeout:20000,polling:50});
 // A cold asynchronous boot can legitimately trigger the native long-gap
 // watchdog. Resume after all live assets are ready, without deleting effects.
 await run(page,'paused=false;lastTime=performance.now();');
 await page.waitForFunction(()=>floaters.every(f=>f.txt!=='THE ANCIENT OATH AWAKENS'),null,{timeout:10000,polling:50});
 // Keep native initialization and normal RAF first. Freeze only after readiness
 // and the real awakening floater expiry; no presentation effects are deleted.
 await run(page,'window.__arenaAuditRAF=requestAnimationFrame.bind(window);requestAnimationFrame=()=>0;paused=true;');
 await page.waitForTimeout(150);
 return {context,page,requests,errors};
}
async function scene(page,move,t){
 await run(page,`KROathkeeperEncounter.select('${move}',{seed:99501,variant:{hold:.44,lane:0,side:-1,high:false}});KROathkeeperArena.ready();`);
 // E.select may replace the owner and reload the sole selected tier.
 await page.waitForFunction(()=>KROathkeeperArena.coversWorld(),null,{polling:25,timeout:20000});
 // Native updates only advance the newly created floater to expiry here. This
 // is setup, not a motion/collision verdict, and seek then restores the pose.
 await run(page,"while(floaters.some(f=>f.txt==='THE ANCIENT OATH AWAKENS'))update(1/120);paused=false;pausePhotoMode=false;");
 await run(page,`KROathkeeperEncounter.sequenceDriver.seek(boss,${t});perfNow=200+${t};render();`);
}
async function nativePurity(page){
 return run(page,`(()=>{
  const snapshot=()=>JSON.stringify({mode,modeT,perfNow,health:player.currentHealthUnits,alive:player.alive,
   player:{x:player.x,lane:player.lane,jumpT:player.jumpT,duckT:player.duckT,invuln:player.invuln},
   boss:{hp:boss.hp,ap:boss.ap,phase:boss.phase,state:boss.state,stateT:boss.stateT,enemyTurn:boss.enemyTurn,
    time:boss._sequence?.time,clip:boss._sequence?.frame.clip,seed:boss._oathRunSeed,resolved:boss._sequence?.resolved},
   visual:KREventVisuals.report()});
  const before=snapshot(),visualBefore=KREventVisuals.report(),savedRandom=Math.random;let randomCalls=0;
  try{Math.random=()=>{randomCalls++;return savedRandom();};for(let i=0;i<100;i++)render();}
  finally{Math.random=savedRandom;}
  return {identical:before===snapshot(),randomCalls,renders:100,visualBefore,visualAfter:KREventVisuals.report(),
   nativeHUD:!paused&&!pausePhotoMode,canvas:{width:game.width,height:game.height},
   logical:{width:VW,height:VH,padTotal:PAD_TOT,padBottom:PAD_BOT},arena:KROathkeeperArena.report()};
 })()`);
}
async function samePoseCapture(page,tier,viewport,name,move,t){
 await scene(page,move,t);
 const meta=await nativePurity(page);assert.equal(meta.identical,true);assert.equal(meta.randomCalls,0);assert.equal(meta.nativeHUD,true);
 const panels=[];
 for(const [label,enabled]of [['neutral',false],['scene-lit',true]]){
  await run(page,`KROathkeeperArena.setSceneLighting(${enabled});render();`);
  const state=await run(page,'({id:boss._sequence.recipe.id,time:boss._sequence.time,clip:boss._sequence.frame.clip,root:{...boss._sequence.frame.actorRoot},knightLighting:KRMountedCombat.frame().state.lighting,arena:KROathkeeperArena.report()})');
  const file=path.join(out,`${tier}-${viewport.width}x${viewport.height}-${name}-${label}.png`);
  const input=await page.screenshot({path:file});panels.push({label,file,input,state});
 }
 const a=panels[0].state,b=panels[1].state;
 assert.deepEqual(a.root,b.root);assert.equal(a.time,b.time);assert.equal(a.clip,b.clip);assert.notDeepEqual(a.knightLighting,b.knightLighting);
 const width=viewport.width,height=viewport.height,tiles=[];
 for(let i=0;i<panels.length;i++){
  const label=Buffer.from(`<svg width="${width}" height="24"><text x="8" y="17" fill="#e4d1a2" font-family="sans-serif" font-size="12">${tier} / ${name} / ${panels[i].label}</text></svg>`);
  const input=await sharp(panels[i].input).extend({top:24,bottom:0,left:0,right:0,background:'#17252b'}).composite([{input:label,left:0,top:0}]).png().toBuffer();
  tiles.push({input,left:i*width,top:0});
 }
 const board=path.join(out,`${tier}-${viewport.width}x${viewport.height}-${name}-neutral-lit.png`);
 await sharp({create:{width:width*2,height:height+24,channels:4,background:'#17252b'}}).composite(tiles).png().toFile(board);
 const grayscale=path.join(out,`${tier}-${viewport.width}x${viewport.height}-${name}-lit-grayscale.png`);
 await sharp(panels[1].input).grayscale().png().toFile(grayscale);
 report.captures.push({tier,viewport,name,move,t,board,grayscale,panels:panels.map(({input,...p})=>p),purity:meta});
}
async function nativeLifecycle(browser,tier){
 const {context,page,requests,errors}=await boot(browser,tier);
 try{
  const selected=assets[assetId][tier],expectedBytes=selected.width*selected.height*4;
  await scene(page,'fist-eruption',.05);const initial=await nativePurity(page);
  assert.equal(initial.identical,true,'Repeated native renders changed gameplay or manager ownership');assert.equal(initial.randomCalls,0,'Rendering consumed gameplay randomness');
  assert.equal(initial.visualBefore.tier,tier);assert.equal(initial.visualBefore.entries.length,1);
  assert.equal(initial.visualBefore.decodedBytes,expectedBytes);assert.equal(initial.visualBefore.reservedBytes,expectedBytes);
  assert.equal(initial.arena.visual.src,selected.src);
  if(capture){
   for(const viewport of tier==='standard'?[{width:480,height:850},{width:390,height:844}]:[{width:390,height:844}]){
    await page.setViewportSize(viewport);await run(page,'resize();');
    for(const [name,move,t]of [['rest','fist-eruption',.05],['plant','fist-eruption',2.87],['whiphigh','stone-whips',6.74]])await samePoseCapture(page,tier,viewport,name,move,t);
   }
  }else{
   await page.setViewportSize({width:390,height:844});await run(page,'resize();render();');
   const phone=await nativePurity(page);assert.equal(phone.identical,true);assert.equal(phone.randomCalls,0);assert.equal(phone.visualBefore.tier,tier);
  }
  const neutral=await run(page,'KROathkeeperArena.setSceneLighting(false);render();({knight:KRMountedCombat.frame().state.lighting,stone:KROathkeeperArena.lighting(),sword:KROathkeeperArena.swordLighting()})');
  assert.equal(neutral.stone,null);assert.equal(neutral.sword,null);
  const lit=await run(page,'KROathkeeperArena.setSceneLighting(true);render();({knight:KRMountedCombat.frame().state.lighting,stone:KROathkeeperArena.lighting(),sword:KROathkeeperArena.swordLighting()})');
  assert(lit.knight&&lit.stone&&lit.sword);assert.notDeepEqual(lit.knight,neutral.knight);
  await run(page,"resetRun();setMode('menu');");
  const reset=await run(page,'({arena:KROathkeeperArena.report(),visual:KREventVisuals.report()})');
  assert.equal(reset.visual.entries.length,0);assert.equal(reset.visual.reservedBytes,0);assert.equal(reset.arena.active,false);
  await scene(page,'fist-eruption',.05);
  await run(page,"godMode=false;player.invuln=0;damagePlayer('arena audit',true,99);update(1/120);");
  const death=await run(page,'({alive:player.alive,mode,arena:KROathkeeperArena.report(),visual:KREventVisuals.report()})');
  assert.equal(death.alive,false);assert.equal(death.visual.reservedBytes,0);assert.equal(death.arena.active,false);
  await scene(page,'fist-eruption',.05);
  await run(page,"startBoss('bear');setMode('boss');render();");
  const bear=await run(page,'({definition:boss.definitionId,arena:KROathkeeperArena.report(),visual:KREventVisuals.report(),knight:KROathkeeperArena.knightLighting(),sword:KROathkeeperArena.swordLighting()})');
  assert.equal(bear.definition,'bear');assert.equal(bear.visual.reservedBytes,0);assert.equal(bear.arena.active,false);assert.equal(bear.knight,null);assert.equal(bear.sword,null);
  assert(requests.length>0);assert(requests.every(url=>new URL(url).pathname.endsWith('/'+selected.src)),'Both arena tiers were requested');
  assert.deepEqual(errors,[]);
  report.browser.push({tier,initial,reset,death,ordinaryBoss:bear,requests,errors,passed:true});
 }finally{await context.close();}
}
async function browserLoadCancellation(browser){
 const context=await browser.newContext({viewport:{width:480,height:850},deviceScaleFactor:1}),page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let arrived,release;const seen=new Promise(resolve=>{arrived=resolve;}),gate=new Promise(resolve=>{release=resolve;});
 await page.route('**/oathkeeper-arena-v1*.png',async route=>{arrived();await gate;await route.continue().catch(()=>{});});
 try{
  await page.goto(base+'/KnightRush.html?oathkeeperlab=1&seed=99501',{waitUntil:'domcontentloaded'});
  await seen;await page.waitForFunction(()=>window.KROathkeeperArena&&window.KREventVisuals,null,{timeout:120000});
  const during=await run(page,'({arena:KROathkeeperArena.report(),visual:KREventVisuals.report()})');
  assert.equal(during.visual.entries[0].status,'loading');assert(during.visual.reservedBytes>0);assert.equal(during.arena.ready,false);
  await run(page,"setMode('menu');resetRun();");release();
  await page.waitForTimeout(200);
  const after=await run(page,'({arena:KROathkeeperArena.report(),visual:KREventVisuals.report()})');
  assert.equal(after.visual.reservedBytes,0);assert.equal(after.visual.entries.length,0);assert.equal(after.arena.active,false);assert.equal(after.arena.ready,false);
  assert.deepEqual(errors,[]);record('native-network-loading-reset',{during,after,errors});
 }finally{release?.();await context.close();}
}
async function main(){
 fs.mkdirSync(out,{recursive:true});await pureAudit();
 if(!pureOnly){const browser=await chromium.launch({channel:'msedge',headless:true});try{
  await nativeLifecycle(browser,'standard');await nativeLifecycle(browser,'mobile');await browserLoadCancellation(browser);
 }finally{await browser.close();}}
 report.sourceHashesAfter=hashes();report.sourceStableDuringAudit=JSON.stringify(report.sourceHashesBefore)===JSON.stringify(report.sourceHashesAfter);
 // Geometry changes can coexist with an explicitly technical-only lifecycle
 // run. Final still capture runs require a stable complete source snapshot.
 if(capture)assert.equal(report.sourceStableDuringAudit,true,'Production source changed during captures; frames are not current final evidence');
 report.passed=true;fs.writeFileSync(path.join(out,capture?'capture-report.json':'technical-report.json'),JSON.stringify(report,null,2));
 console.log('OATHKEEPER_ARENA_OK '+JSON.stringify({checks:report.checks.length,browserContexts:report.browser.length,captures:report.captures.length,sourceStable:report.sourceStableDuringAudit,report:path.join(out,capture?'capture-report.json':'technical-report.json')}));
}
main().catch(error=>{report.passed=false;report.failure=error.stack;fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,capture?'capture-report.json':'technical-report.json'),JSON.stringify(report,null,2));console.error(error.stack);process.exitCode=1;});
