const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/lockpick-channel');
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 try{for(const [device,width,height,dpr]of [['desktop',775,1000,1],['phone',390,844,2]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
  await page.waitForFunction(()=>window.KRTreasureRoad?.pickPose);
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  await run('startLockpicking();beginLockpickingRound();SFX.setTestMuted(true);');
  const result=await run(`(()=>{const l=lockpickGame,errors=[];let samples=0;
   for(let i=0;i<5;i++)for(let step=0;step<=100;step++){
    l.cursor=i;l.pickX=84+i*78;l.holdingIndex=i;const p=l.pins[i];p.state='active';p.lift=step/100;
    const pose=KRTreasureRoad.pickPose(l),c=Math.cos(pose.angle),s=Math.sin(pose.angle);
    const tip={x:pose.x+52*s,y:pose.y-52*c};
    if(Math.abs(tip.x-l.pickX)>.0001||Math.abs(tip.y-(415-40*p.lift))>.0001)errors.push('contact');
    // The shaft, including its thickness, stays inside the actual throat and
    // below the other idle pins, without a clipping mask hiding intersections.
    for(let x=0;x<=pose.x-20*c;x+=.5){
     const y=pose.y+(x-pose.x)*Math.tan(pose.angle),half=5/c;
     if(x<=47&&(y-half<441||y+half>482))errors.push('entrance '+i+' '+step);
     if(x>47&&(y-half<415||y+half>484))errors.push('channel '+i+' '+step);
    }
    if(pose.x+5*c>417)errors.push('right wall');samples++;
   }
   return {samples,errors:errors.slice(0,10)};})()`);
  assert.deepEqual(result.errors,[]);assert.equal(result.samples,505);
  for(const i of [0,2,4])for(const lift of [0,.5,1]){
   await run(`for(const pin of lockpickGame.pins){pin.state='idle';pin.lift=0;}
    lockpickGame.cursor=${i};lockpickGame.pickX=${84+i*78};lockpickGame.holdingIndex=${i};
    lockpickGame.pins[${i}].state='active';lockpickGame.pins[${i}].lift=${lift};render();`);
   await page.screenshot({path:path.join(out,device+'-pin'+i+'-lift'+lift+'.png')});
  }
  // Releasing an airborne pin returns the iron to its channel, not after it.
  await run('lockpickGame.holdingIndex=-1;');
  assert.equal(await run('KRTreasureRoad.pickPose(lockpickGame).targetY'),415);
  assert.deepEqual(errors,[]);console.log(device,JSON.stringify(result));await page.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
