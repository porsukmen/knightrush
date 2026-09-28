const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 fs.mkdirSync('output/pause-buttons',{recursive:true});
 try{
  for(const width of [390,1000]){
   let expected;
   for(const query of ['roadlab','camplab','taxmanlab','dukelab','queenlab','armlab','chuglab','tavernslidelab']){
    const page=await browser.newPage({viewport:{width,height:width===390?844:1000},hasTouch:true}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>requestAnimationFrame=()=>0);
    await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href+'?'+query+'=1');
    await page.waitForFunction(()=>document.querySelector('#game')?.dataset.bootReady==='1');
    const run=s=>page.evaluate(s=>(0,eval)(s),s);
    if(query==='roadlab')await run("startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.id==='camp'));dist=roadLabState.slot.at-50;roadScroll=dist");
    const actual=await run(`(()=>{
     const original=drawPauseButton,calls=[];
     drawPauseButton=function(offset=uiTop){
      const state=()=>JSON.stringify([g.fillStyle,g.strokeStyle,g.font,g.lineWidth,g.textAlign,g.getTransform()]);
      const before=state();original(offset);const isolated=before===state();
      const t=g.getTransform(),a=new DOMPoint(PAUSE_BTN.x+6,PAUSE_BTN.y+offset+6).matrixTransform(t),
       z=new DOMPoint(PAUSE_BTN.x+32,PAUSE_BTN.y+offset+32).matrixTransform(t);
      calls.push({isolated,clip:{x:a.x/renderDpr(),y:a.y/renderDpr(),width:(z.x-a.x)/renderDpr(),height:(z.y-a.y)/renderDpr()},
       x:((PAUSE_BTN.x+19)*viewScale+viewX)/renderDpr(),y:((PAUSE_BTN.y+uiTop+19)*viewScale+viewY)/renderDpr()});
     };
     try{render()}finally{drawPauseButton=original}return calls;
    })()`);
    assert(actual.length>=1,query+' draws the shared pause control');
    for(const call of actual)for(const key of Object.keys(call.clip))call.clip[key]=Math.round(call.clip[key]*1000)/1000;
    for(const call of actual){assert(call.isolated,query+' restores canvas state');assert.deepEqual(call,actual[0],query+' consistent underlying HUD geometry')}
    actual[0].pixels=(await page.screenshot({clip:actual[0].clip})).toString('base64');
    if(!expected)expected=actual[0];
    assert.deepEqual(actual[0],expected,query+' identical icon, material, position and hit center');
    await page.screenshot({path:`output/pause-buttons/${width}-${query}.png`});
    await page.touchscreen.tap(actual[0].x,actual[0].y);
    assert.equal(await run('paused'),true,query+' touch pauses');
    await page.keyboard.press('Escape');assert.equal(await run('paused'),false,query+' resumes');
    assert.deepEqual(errors,[]);await page.close();
   }
  }
  console.log('PAUSE_BUTTON_OK: eight run/event/minigame scenes, identical pixels and placement, canvas isolation, touch pause and keyboard resume at phone/desktop widths.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
