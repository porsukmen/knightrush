const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/background-blockout');
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  const meta=JSON.parse(fs.readFileSync(path.join(root,'art-source/knight-rush-backgrounds/gatherer-blockout-v2/layout.json'),'utf8'));
  assert.equal(meta.status,'layout-candidate');assert(Object.values(meta.checks).every(Boolean));
  assert.equal(meta.dimensions.personHeight,1.75);assert.equal(meta.camera.projection,'perspective');
  assert(Math.abs(meta.camera.position[2]-1.7)<1e-5);
  for(const anchor of [...meta.anchors,...meta.planAnchors])assert(anchor.point[0]>=0&&anchor.point[0]<=480&&anchor.point[1]>=0&&anchor.point[1]<=512,'Clipped projected anchor '+anchor.id);
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:1000},deviceScaleFactor:1}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
    await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?backgroundlab=1&backgroundVersion=v2');
    await page.waitForFunction(()=>document.querySelector('#blockout-root')?.dataset.ready==='1'||document.querySelector('#blockout-root')?.dataset.failed==='1');
    assert.equal(await page.locator('#blockout-root').getAttribute('data-failed'),null,await page.locator('#bo-error').innerText());
    const run=code=>page.evaluate(code=>(0,eval)(code),code),state=await run('KRBackgroundBlockout.state()');
    const shot=async(name,opts)=>{
      await page.evaluate(opts=>KRBackgroundBlockout.setOptions(opts),opts);
      assert.deepEqual(await run('KRBackgroundBlockout.report().failures'),[]);
      await page.locator('#bo-canvas').screenshot({path:path.join(out,name+'.png')});
    };
    await shot('01-perspective',{labels:false});await shot('02-projected-labels',{labels:true});
    await page.screenshot({path:path.join(out,'lab-desktop.png'),fullPage:true});
    await shot('03-environment',{figure:'none',labels:false});
    await shot('04-approved-npc-scale',{figure:'approved'});
    await shot('05-metric-grid',{view:'grid',labels:true});
    assert(await page.locator('#bo-figure').isDisabled());
    await shot('06-plan',{view:'plan'});
    // Click a Blender-projected plan marker through the actual letterboxed canvas.
    const anchor=meta.planAnchors.find(a=>a.id==='table'),box=await page.locator('#bo-canvas').boundingBox(),s=Math.min(box.width/480,box.height/512);
    await page.mouse.click(box.x+(box.width-480*s)/2+anchor.point[0]*s,box.y+(box.height-512*s)/2+anchor.point[1]*s);
    assert.match(await page.locator('#bo-inspect').innerText(),/Work table/);
    await page.locator('#bo-links button').nth(0).click();assert.match(await page.locator('#bo-inspect').innerText(),/Door/);
    await page.setViewportSize({width:390,height:844});
    await shot('07-mobile-dialogue',{view:'perspective',figure:'approved',dialogue:true,phone:true,labels:false});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile overflow');
    assert.equal(await run('KRBackgroundBlockout.state()'),state,'Preview mutated game state');
    await shot('08-mobile-layout',{dialogue:false,figure:'mannequin',labels:true});
    await page.screenshot({path:path.join(out,'lab-mobile.png'),fullPage:true});
    const report=await run('KRBackgroundBlockout.report()');
    await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?roadlab=1');
    await page.waitForFunction(()=>document.querySelector('#game')?.dataset.bootReady==='1');
    assert.equal(await run('typeof KRBackgroundBlockout'),'undefined');
    assert.equal(await page.locator('script[src*="background-blockout"]').count(),0);
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({...report,technical:'passed',checks:['Blender geometry assertions','projected anchors inside frame','all camera and figure views','desktop/mobile layout','plan marker click','inspection controls','game state purity','normal-game isolation']},null,2));
    console.log('BACKGROUND_BLOCKOUT_OK — layout candidate, no aesthetic approval. '+out);
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
