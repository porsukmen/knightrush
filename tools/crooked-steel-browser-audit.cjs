const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.resolve('ForgeTest.html')).href);
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  await run(`SFX.toggle();globalThis.mendTick=seconds=>{
   for(let t=0;t<seconds-1e-8;t+=1/120)updateSwordMending(Math.min(1/120,seconds-t));
  };globalThis.mendDuration=force=>{let lo=0,hi=1;for(let i=0;i<24;i++){
   const mid=(lo+hi)/2;if(mendForce(mid)<force)lo=mid;else hi=mid;}return (lo+hi)/2;};`);
  const point=(x,y)=>run(`({x:(${x}*viewScale+viewX)/renderDpr(),y:(${y}*viewScale+viewY)/renderDpr()})`);
  const tap=async(x,y)=>{const p=await point(x,y);await page.touchscreen.tap(p.x,p.y);};
  const cdp=await page.context().newCDPSession(page);
  const hold=async index=>{
   const node=await run(`mendNodePoint(${index})`),p=await point(node.x,node.y);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:1,radiusX:2,radiusY:2}]});
  };
  const release=()=>cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  const out=path.resolve('output/crooked-steel');fs.mkdirSync(out,{recursive:true});
  const shot=async name=>{await run('flashA=0;shakeMag=0;render()');await page.screenshot({path:path.join(out,name+'.png')});};
  assert.equal(await run('mode'),'swordmending');await shot('01-intro-phone');
  await tap(240,755);assert.equal(await run('mendGame.phase'),'work');
  await hold(2);assert.equal(await run('mendGame.charge.index'),2);
  await run('mendTick(.6)');await shot('02-held-hammer');
  await release();assert.equal(await run('mendGame.strikes'),0);
  await run('mendTick(.17)');assert.equal(await run('mendGame.strikes'),1);await shot('03-first-impact');
  await run('mendTick(.3)');
  for(let n=0;n<16&&await run('mendQuality()<95');n++){
   const choice=await run(`(()=>{let index=1;for(let i=2;i<8;i++)if(Math.abs(mendGame.bends[i])>Math.abs(mendGame.bends[index]))index=i;
    return {index,flip:mendGame.bends[index]*mendGame.face<0,duration:mendDuration(Math.abs(mendGame.bends[index]))};})()`);
   if(choice.flip){
    const before=await run('mendGame.face');await tap(115,755);
    await run('mendTick(.43)');assert.equal(await run('mendGame.face'),-before);
   }
   await hold(choice.index);assert.equal(await run('mendGame.charge.index'),choice.index);
   await run(`mendTick(${choice.duration})`);await release();await run('mendTick(.44)');
  }
  assert.ok(await run('mendQuality()>=95'));await shot('04-repaired-on-anvil');
  const shape=await run('JSON.stringify(mendGame.bends)');
  await tap(360,755);assert.equal(await run('mendGame.phase'),'inspect');
  await run('mendTick(.8)');await shot('05-inspect');await run('mendTick(.7)');
  assert.equal(await run('mendGame.phase'),'result');
  assert.equal(await run('JSON.stringify(mendGame.bends)'),shape,'show actual result, not a perfect replacement');
  await shot('06-result');await tap(240,755);assert.equal(await run('mendGame.job'),1);
  await page.keyboard.press('ArrowRight');assert.equal(await run('mendGame.cursor'),3);
  await page.keyboard.press('f');await run('mendTick(.43)');assert.equal(await run('mendGame.face'),-1);
  await page.keyboard.down('Space');await run('mendTick(.5)');await page.keyboard.up('Space');
  await run('mendTick(.44)');assert.equal(await run('mendGame.strikes'),1);
  await hold(3);await run('mendTick(.4)');await page.keyboard.press('Escape');
  assert.equal(await run('mendGame.charge'),null);assert.equal(await run('paused'),true);
  const frozen=await run('JSON.stringify(mendGame)');await release();await run('mendTick(2)');
  assert.equal(await run('JSON.stringify(mendGame)'),frozen);
  await page.keyboard.press('Escape');await hold(3);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  assert.equal(await run('mendGame.charge'),null);assert.equal(await run('mendGame.strikes'),1);
  await page.setViewportSize({width:780,height:1300});await run('resize();startSwordMending();beginSwordMending()');
  const node=await run('mendNodePoint(2)'),p=await point(node.x,node.y);
  await page.mouse.move(p.x,p.y);await page.mouse.down();assert.equal(await run('mendGame.charge.index'),2);
  await run('mendTick(.7)');await page.mouse.up();await run('mendTick(.44)');
  assert.equal(await run('mendGame.strikes'),1);await shot('07-desktop');
  await page.keyboard.press('Enter');await run('mendTick(1.5)');assert.equal(await run('mendGame.phase'),'result');
  await tap(62,70);assert.equal(await run('mode'),'minigames');
  assert.deepEqual(errors,[]);
  console.log('CROOKED_STEEL_BROWSER_OK phone touch full repair/turn/result, actual retained blade, next job, keyboard, cancel/pause, desktop mouse, menu exit');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
