const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/tax-collector');
fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 for(const [device,width,height,dpr]of [['desktop',1000,1000,1],['phone',390,844,2],['small-phone',320,568,2]]){
  const p=await b.newPage({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:true}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(phone=>{requestAnimationFrame=()=>0;Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>phone?4:8});Object.defineProperty(navigator,'deviceMemory',{get:()=>phone?4:8});},device!=='desktop');
  await p.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?taxmanlab=1');
  // This audit freezes RAF; async loading must be polled independently of it.
  await p.waitForFunction(()=>window.KRTaxCollector&&KRCutscenes.report().state==='ready',null,{polling:100});
  const run=s=>p.evaluate(s=>(0,eval)(s),s);
  await run('SFX.setTestMuted(true);modeT=2;update(.3);');
  assert.equal(await run('mode'),'journeyevent');
  const im=await run("(()=>{const im=KREventVisuals.peek('royal-tax-collector');return[im.naturalWidth,im.naturalHeight]})()");
  assert.deepEqual(im,device==='desktop'?[1215,1296]:[768,819]);
  const report=await run('KREventVisuals.report()');assert(report.reservedBytes<=report.budgetBytes);
  assert.equal(report.active,'royal-tax-collector');
  const state=await run('JSON.stringify([gold,dist,mode,journeyRoadEventSession.context.dialogue])');
  for(const t of [0,2,4]){await run(`perfNow=${t};render()`);await p.screenshot({path:path.join(out,device+'-scene-'+t+'.png')});}
  assert.equal(await run('JSON.stringify([gold,dist,mode,journeyRoadEventSession.context.dialogue])'),state);
  assert(await run(`(()=>{const len=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);for(let t=0;t<12;t+=.025){const p=KRTaxCollector.pose(t);for(const a of [p.asking,p.seal]){if(Math.abs(len(a.shoulder,a.elbow)-KRTaxCollector.bones.upper)>1e-8||Math.abs(len(a.elbow,a.wrist)-KRTaxCollector.bones.lower)>1e-8)return false;}}return true;})()`),'Fixed arm bones');
  // Lab-only isolated comparison: never injected into the production render path.
  const pixels=await run(`(()=>{const previous=g,c=document.createElement('canvas');c.width=480;c.height=520;const ctx=c.getContext('2d');const frames=[];try{g=ctx;for(const lit of [false,true]){ctx.clearRect(0,0,480,520);ctx.save();ctx.translate(240,488);ctx.scale(1.9,1.9);KRTaxCollector.actor(2,lit);ctx.restore();frames.push({url:c.toDataURL(),rgba:Array.from(ctx.getImageData(0,0,480,520).data)});}}finally{g=previous;}return frames;})()`);
  assert.notEqual(pixels[0].url,pixels[1].url,'Lighting must affect material planes');
  for(let i=3;i<pixels[0].rgba.length;i+=4)assert.equal(pixels[0].rgba[i],pixels[1].rgba[i],'Lighting preserves geometry');
  if(device==='desktop')for(const [i,f]of pixels.entries())fs.writeFileSync(path.join(out,i?'actor-scene.png':'actor-neutral.png'),Buffer.from(f.url.split(',')[1],'base64'));
  await run(`(()=>{const before=[g.fillStyle,g.globalAlpha,g.getTransform().toString()].join('|');KRTaxCollector.drawConversation(2);if(before!==[g.fillStyle,g.globalAlpha,g.getTransform().toString()].join('|'))throw Error('Canvas state leaked');})()`);
  assert.equal(await run('journeyNormalChoices(journeyRoadEventSession.context).length'),2);
  await run("handleAction('choice1');");assert.equal(await run('gold'),175);await run("update(.3);handleAction('continue');");assert.equal(await run('mode'),'run');
  assert.equal(await run('KREventVisuals.report().reservedBytes'),0);
  // Real event entry, controls, deterministic win/loss and one-time settlement.
  await p.reload();await p.waitForFunction(()=>window.KRTaxCollector&&KRCutscenes.report().state==='ready',null,{polling:100});
  await run("modeT=2;update(.3);handleAction('choice2');render();");assert.equal(await run('mode'),'journeyevent');assert.equal(await run('journeyRoadEventSession.context.taxSeal.phase'),'intro');
  await p.screenshot({path:path.join(out,device+'-seal-intro.png')});
  await run("handleAction('continue');");
  await p.keyboard.press('ArrowLeft');assert.equal(await run('journeyRoadEventSession.context.taxSeal.target'),-170);
  const client=async(x,y)=>run(`({x:(${x}*viewScale+viewX)/renderDpr(),y:(${y}*viewScale+viewY)/renderDpr()})`);
  const a=await client(200,600),z=await client(478,600);await p.mouse.move(a.x,a.y);await p.mouse.down();await p.mouse.move(z.x,z.y,{steps:5});await p.mouse.up();assert.equal(await run('journeyRoadEventSession.context.taxSeal.target'),170,'Real mouse drag');
  const cdp=await p.context().newCDPSession(p),touchEnd=await client(20,600);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[z]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[touchEnd]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await run('journeyRoadEventSession.context.taxSeal.target'),-170,'Real touch drag');await cdp.detach();
  await p.keyboard.press('Escape');assert.equal(await run('paused'),true);
  assert(await run(`(()=>{const before=JSON.stringify(journeyRoadEventSession.context.taxSeal);lastTime=performance.now();frame(lastTime+16);return before===JSON.stringify(journeyRoadEventSession.context.taxSeal);})()`),'Pause freezes seal state');
  await p.keyboard.press('Escape');assert.equal(await run('paused'),false);
  await run("(()=>{const s=journeyRoadEventSession.context.taxSeal;KRTaxCollector.sealPointer(s,'down',{x:200,y:600});KRTaxCollector.sealPointer(s,'move',{x:480,y:600});if(s.target!==170)throw Error('Drag failed');cancelMinigameGestures();if(s.drag)throw Error('Cancel failed');s.paper=s.target=0;})()");
  const gameCheck=await run(`(()=>{const s=journeyRoadEventSession.context.taxSeal;let n=0,feints=0,last='';while(!s.result&&n++<1800){if(s.phase==='commit')s.target=s.aim>=240?-170:170;if(s.phase==='feint'&&last!=='feint')feints++;last=s.phase;const p=KRTaxCollector.sealPose(s);for(const a of[p.asking,p.seal]){for(const [v,w,len]of[[a.shoulder,a.elbow,35],[a.elbow,a.wrist,33]])if(Math.abs(Math.hypot(v[0]-w[0],v[1]-w[1])-len)>.001)throw Error('IK bone stretch');}update(1/60);}for(let i=0;i<120;i++)update(1/60);render();return{win:s.result?.win,gold,misses:s.misses,feints};})()`);
  assert.equal(gameCheck.win,true);assert.equal(gameCheck.gold,180);assert.equal(gameCheck.misses,3);
  assert(await run(`(()=>{const before=JSON.stringify(journeyRoadEventSession.context.taxSeal);for(let i=0;i<10;i++)render();return before===JSON.stringify(journeyRoadEventSession.context.taxSeal);})()`),'Render is read-only');
  await p.screenshot({path:path.join(out,device+'-seal-win.png')});
  await run("pausePhotoMode=true;render()");await p.screenshot({path:path.join(out,device+'-seal-photo.png')});await run('pausePhotoMode=false');
  await run("handleAction('continue')");assert.equal(await run('mode'),'run');assert.equal(await run('KREventVisuals.report().reservedBytes'),0);
  await p.reload();await p.waitForFunction(()=>window.KRTaxCollector&&KRCutscenes.report().state==='ready',null,{polling:100});
  await run("modeT=2;update(.3);gold=3;handleAction('choice2');handleAction('continue');for(let i=0;i<600;i++)update(1/60);render()");
  assert.equal(await run('journeyRoadEventSession.context.taxSeal.result.win'),false);assert.equal(await run('gold'),0);assert.equal(await run('journeyRoadEventSession.context.taxSeal.cost'),3);
  await run('for(let i=0;i<200;i++)update(1/60)');assert.equal(await run('gold'),0);
  await p.screenshot({path:path.join(out,device+'-seal-lose.png')});await run("handleAction('continue')");assert.equal(await run('mode'),'run');
  assert.deepEqual(errors,[]);await p.close();console.log(device,'TAX_ART_OK lighting / bones / input / release');
 }
 const p=await b.newPage();await p.addInitScript(()=>{requestAnimationFrame=()=>0;const d=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',{...d,set(v){d.set.call(this,String(v).includes('royal-tax-collector-v1')?'missing-tax-test.png':v);}});});
 await p.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?taxmanlab=1');await p.waitForFunction(()=>window.KRCutscenes?.report().state==='fallback',null,{polling:100});
 await p.evaluate(()=>{modeT=2;update(.3);render();handleAction('choice1');update(.3);handleAction('continue');});assert.equal(await p.evaluate(()=>mode),'run');await p.close();
 console.log('TAX_FALLBACK_OK — seal gameplay and character remain candidates');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
