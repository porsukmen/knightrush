const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.resolve('DiscoTest.html')).href);
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  const point=(x,y)=>run(`({x:(${x}*viewScale+viewX)/renderDpr(),y:(${y}*viewScale+viewY)/renderDpr()})`);
  const tap=async(x,y)=>{const p=await point(x,y);await page.touchscreen.tap(p.x,p.y);};
  const cdp=await page.context().newCDPSession(page);
  const swipe=async dir=>{
   const [dx,dy]={left:[-85,0],right:[85,0],up:[0,-85],down:[0,85]}[dir];
   const p=await point(240,650),q=await point(240+dx,650+dy);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:1,radiusX:2,radiusY:2}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...q,id:1,radiusX:2,radiusY:2}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  };
  const out=path.resolve('output/disco-revamp');fs.mkdirSync(out,{recursive:true});
  const shot=async name=>{await run('flashA=0;shakeMag=0;render()');await page.screenshot({path:path.join(out,name+'.png')});};
  assert.equal(await run('mode'),'discodance');await run('SFX.toggle()');await shot('01-seated-mobile');
  const start=await run('({x:DISCO_START_BTN.x+DISCO_START_BTN.w/2,y:DISCO_START_BTN.y+DISCO_START_BTN.h/2})');
  await tap(start.x,start.y);assert.equal(await run('discoGame.phase'),'rise');
  await swipe('left');assert.equal(await run('discoGame.inputIndex'),0);
  await run("discoGame.sequence=['left','right','up','down','left'];updateDiscoDance(1.25)");
  await run('updateDiscoDance(DISCO_RULES.showLead+.35)');
  for(let i=0;i<5;i++){
   assert.equal(await run('discoGame.phase'),'show');assert.equal(await run('discoGame.showCue'),i);
   await swipe('left');assert.equal(await run('discoGame.inputIndex'),0);
   if(i===0){
    await shot('02-king-left');await page.keyboard.press('Escape');
    const clock=await run('discoGame.sceneT');await run('updateDiscoDance(2)');
    assert.equal(await run('discoGame.sceneT'),clock);await page.keyboard.press('Escape');
   }
   await run('updateDiscoDance(DISCO_RULES.demonstrate)');
  }
  assert.equal(await run('discoGame.phase'),'ready');await run('updateDiscoDance(DISCO_RULES.readyTime)');
  for(const [i,dir] of ['left','right','up','down','left'].entries()){
   assert.equal(await run('discoGame.phase'),'input');assert.equal(await run('discoGame.kingPose'),null);
   const crowdBefore=await run('JSON.stringify([discoGame.crowdCheer,discoGame.sceneT])');
   await swipe(dir);assert.equal(await run('discoGame.inputIndex'),i+1);
   assert.equal(await run('JSON.stringify([discoGame.crowdCheer,discoGame.sceneT])'),crowdBefore,'touch cannot reset or snap crowd animation');
   assert.equal(await run('discoGame.playerPose'),dir);
   await run('updateDiscoDance(.16)');await shot('player-'+dir);
   await run('updateDiscoDance(.55)');
  }
  assert.equal(await run('discoGame.wins'),1);
  await run('updateDiscoDance(1.45);updateDiscoDance(DISCO_RULES.showLead+5*DISCO_RULES.demonstrate+.01);updateDiscoDance(DISCO_RULES.readyTime)');
  const dir=await run('discoGame.sequence[0]');
  await page.keyboard.press({left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown'}[dir]);
  assert.equal(await run('discoGame.inputIndex'),1);
  await page.setViewportSize({width:780,height:1300});await run('resize();startDiscoDance()');await shot('03-seated-desktop');
  await tap(62,70);assert.equal(await run('mode'),'minigames');
  assert.deepEqual(errors,[]);
  console.log('DISCO_REVAMP_BROWSER_OK launcher, complete five-move demo, real touch sequence recall, keyboard, ignored watch-phase input, pause, mobile/desktop, back');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
