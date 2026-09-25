const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createHash}=require('node:crypto'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/road-creator-lab');
const refs=require('../art-source/knight-rush-special-roads/creator-references.js'),baseline=require('../art-source/knight-rush-special-roads/creator-baseline.json');
const hash=b=>createHash('sha256').update(b).digest('hex');
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 for(const [file,digest]of Object.entries(baseline.images))assert.equal(hash(fs.readFileSync(path.join(root,file))),digest,'Locked approval changed');
 const b=await chromium.launch({channel:'msedge',headless:true}),url=pathToFileURL(path.join(root,'KnightRush.html')).href;
 try{
  for(const [device,width,height,dpr]of [['desktop',1440,1000,1],['phone',390,844,2]]){
   const p=await b.newPage({viewport:{width,height},deviceScaleFactor:dpr}),errors=[];p.on('pageerror',e=>errors.push(e.message));
   await p.goto(url+'?roadcreatorlab=1');await p.waitForFunction(()=>document.documentElement.dataset.roadCreatorReady==='1');
   for(const r of refs.references){
    await p.locator(`[data-theme="${r.theme}"]`).click();assert.equal((await p.evaluate(()=>KRRoadCreatorLab.report())).options.theme,r.theme);
    for(const view of refs.views){
     await p.selectOption('#rc-view',view);
     await p.waitForFunction(()=>document.getElementById('rc-approved').complete&&document.getElementById('rc-approved').naturalWidth>0);
     const report=await p.evaluate(()=>KRRoadCreatorLab.report());assert.equal(report.mode,'run');assert.equal(report.options.view,view);
     if(view==='road')assert.equal(report.theme,r.theme);
    }
    await p.selectOption('#rc-view','obstacles');
    for(const kind of ['boulder','pond','root'])for(const lanes of ['1','01','012','02'])for(const depth of [65,8]){
     await p.evaluate(v=>KRRoadCreatorLab.setOptions(v),{kind,lanes,depth});
     const ob=await p.evaluate(()=>({theme:obstacles[0].roadTheme,lanes:obstacles[0].lanes,req:obstacles[0].req}));
     assert.equal(ob.theme,r.theme);assert.deepEqual(ob.lanes,Array.from(lanes,Number));
     if(r.theme==='inn'&&kind==='root')for(const lane of ob.lanes)assert.equal(ob.req[lane],'duck');
    }
   }
   await p.evaluate(()=>KRRoadCreatorLab.setOptions({theme:'inn',view:'obstacles',kind:'root',lanes:'02',depth:24}));
   // Native trees fill their bounded drawing cache over several renders.
   // Warm that cache before demanding exact pixels; world state never advances.
   const state=await p.evaluate(()=>JSON.stringify([dist,player.x,obstacles.map(o=>[o.kind,o.z,o.req])]));
   await p.evaluate(()=>{for(let i=0;i<16;i++)KRRoadCreatorLab.draw();});
   const before=await p.locator('#rc-canvas').evaluate(c=>c.toDataURL());await p.evaluate(()=>KRRoadCreatorLab.draw());
   assert(hash(await p.locator('#rc-canvas').evaluate(c=>c.toDataURL()))===hash(before),'Frozen draw must stay frozen after cache warmup');
   assert.equal(await p.evaluate(()=>JSON.stringify([dist,player.x,obstacles.map(o=>[o.kind,o.z,o.req])])),state);
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow');
   await p.screenshot({path:path.join(out,device+'-roads.png'),fullPage:true});
   for(const scene of ['mossy-inn','autumn-caravan']){
    await p.goto(url+'?backgroundlab=1&scene='+scene);await p.waitForFunction(()=>document.documentElement.dataset.serviceLabReady==='1');
    const state=await p.evaluate(()=>KRServiceBackgroundLab.state());
    for(const view of ['plate','neutral','approved','scene'])await p.selectOption('#service-view',view);
    assert.equal(await p.evaluate(()=>KRServiceBackgroundLab.state()),state);
    assert.equal((await p.evaluate(()=>KRServiceBackgroundLab.report())).approval,'approved');
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Scene horizontal overflow');
    await p.screenshot({path:path.join(out,device+'-'+scene+'.png'),fullPage:true});
   }
   assert.deepEqual(errors,[]);await p.close();
  }
  const normal=await b.newPage(),loaded=[];normal.on('request',r=>loaded.push(r.url()));
  await normal.goto(url);await normal.waitForFunction(()=>window.KRSunlitForest);
  assert(!loaded.some(u=>/road-creator-lab|creator-references|creator-baseline|service-background-lab|art-lab-runtime/.test(u)),'Authoring code in normal play');
  await normal.goto(url+'?roadlab=1&roadcase=inn');await normal.waitForFunction(()=>window.KRSunlitForest);
  assert.equal(await normal.evaluate(()=>mode),'run');assert.equal(await normal.evaluate(()=>roadLabState.slot.theme),'inn');
  await normal.close();console.log('ROAD_CREATOR_OK six themes / 42 views / 288 obstacle variants / phone layout / approved integrity / no normal-play lab load');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
