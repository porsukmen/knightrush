const {chromium}=require('playwright'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/photo-mode');
fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 for(const [device,width,height]of [['phone',390,844],['desktop',1100,900]]){
  const page=await browser.newPage({viewport:{width,height}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
  await page.waitForFunction(()=>window.KRSunlitForest);
  const run=s=>page.evaluate(s=>(0,eval)(s),s);
  await run(`drawLegacyForestBackground=()=>{throw Error('Retired forest renderer invoked')};
   SFX.setTestMuted(true);mode='menu';charSel=2;
   handleAction('tap',{x:MENU_PLAY_BTN.x+10,y:MENU_PLAY_BTN.y+10});render();`);
  assert.equal(await run('mode'),'run');assert.equal(await run('playerChar.rigId'),'ser_jonathan');
  assert(await run('KRSunlitForest.active()'));
  await page.keyboard.press('F8');assert(await run('curvedWorldActive()'));
  await run('paused=true;pausePhotoMode=true;render()');
  await page.screenshot({path:path.join(out,device+'-run.png')});
  const ids=await run('MINIGAMES.ids');
  for(const id of [...ids,'menu','minigames','relicdex','score','debugcfg']){
   await run(`paused=false;pausePhotoMode=false;settingsOpen=false;openMinigamesMenu();
    ${ids.includes(id)?`MINIGAMES.get(${JSON.stringify(id)}).start();`:`mode=${JSON.stringify(id)};`}
    render();`);
   const visual={find_the_queen:['KRRoyalShuffle','royal-shuffle'],drinking_contest:['KRTavernChug','tavern-chug'],
    royal_arm_wrestle:['KRTavernArm','tavern-arm'],duke_doubledown_dice:['KRDukeBluff','duke-bluff'],
    tavern_table_slide:['KRTavernSlide','tavern-slide']}[id];
   if(visual){await run(`prepareCutscene(${JSON.stringify(visual[1])},true,'tavern-games')`);
    await page.waitForFunction(([module,asset])=>window[module]&&KREventVisuals.peek(asset),visual);}
   // Give asynchronous scene plates a chance to load before the frozen capture.
   await page.waitForFunction(()=>Array.from(document.images).every(i=>i.complete));
   const result=await run(`(()=>{
    paused=true;handleAction('tap',{x:240,y:VH/2+43});
    const screen=FULLSCREEN_RENDERERS.get(mode);let calls=0;
    FULLSCREEN_RENDERERS.set(mode,()=>{calls++;screen()});
    const before=JSON.stringify([mode,modeT,perfNow,dist,gold]);
    try{frame(performance.now()+100);return {photo:pausePhotoMode,calls,frozen:before===JSON.stringify([mode,modeT,perfNow,dist,gold])};}
    finally{FULLSCREEN_RENDERERS.set(mode,screen)}
   })()`);
   assert(result.photo,id+' enters screenshot mode');assert.equal(result.calls,1,id+' keeps current renderer');assert(result.frozen,id+' stays frozen');
   await page.screenshot({path:path.join(out,device+'-'+id+'.png')});
   await run(`handleAction('tap',{x:240,y:200})`);assert(await run('paused&&!pausePhotoMode'));
  }
  assert.deepEqual(errors,[]);console.log({device,games:ids.length,menus:5,jonathan:true,currentForest:true,errors});
  await page.close();
 }
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
