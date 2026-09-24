/* Repeatable technical checks, NOT aesthetic approval. Run from any directory. */
const {chromium}=require('playwright');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createHash}=require('node:crypto'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/art-lab');
const baselinePath=path.join(root,'art-source/knight-rush-sharp-plane/reference-baseline.json');
const initial=process.argv.includes('--record-initial');
if(initial&&fs.existsSync(baselinePath))throw Error('Initial reference baseline already exists. Never auto-overwrite approved anchors.');
const sha=s=>createHash('sha256').update(s.replace(/\r\n/g,'\n')).digest('hex');
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const errors=[],motionWarnings=[],comparisons=[];
 let report;
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1080},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?artlab=1');
  await page.waitForFunction(()=>window.KRArtLab&&document.documentElement.dataset.artLabReady==='1',{},{timeout:120000});
  await page.evaluate(()=>KRArtLab.setOptions({playing:false}));
  const registry=await page.evaluate(()=>KRArtLab.registry);
  assert.equal(await page.locator('.art-card').count(),registry.references.length);
  assert.equal(await page.evaluate(()=>Object.keys(KRArtLab.bounds()).length),registry.references.length,'All renderers must be framed');
  const names=[...new Set([...registry.references.filter(r=>r.status==='approved').flatMap(r=>r.symbols),...registry.sharedSymbols])];
  const sources=await page.evaluate(names=>Object.fromEntries(names.map(name=>[name,KRArtLab.source(name)])),names);
  const fingerprints=Object.fromEntries(Object.entries(sources).map(([name,source])=>[name,sha(source)]));
  const images=Object.fromEntries(registry.images.map(file=>[file,createHash('sha256').update(fs.readFileSync(path.join(root,'art-source/knight-rush-sharp-plane',file))).digest('hex')]));
  const baseline={version:1,note:'Protected reference sources at Art Lab setup. Not approval of candidate art.',fingerprints,images};
  if(!initial){
    assert.ok(fs.existsSync(baselinePath),'Reference baseline missing; do not invent one during a routine art edit');
    const previous=JSON.parse(fs.readFileSync(baselinePath,'utf8'));
    for(const [name,hash] of Object.entries(previous.fingerprints))assert.equal(fingerprints[name],hash,'Approved renderer changed: '+name+' — review required, do not auto-rebaseline');
    for(const [name,hash] of Object.entries(previous.images))assert.equal(images[name],hash,'Approved image changed: '+name);
    assert.deepEqual(Object.keys(fingerprints).sort(),Object.keys(previous.fingerprints).sort(),'Protected reference set changed — review required');
  }
  const before=await page.evaluate(()=>KRArtLab.state());
  const sheet=createCanvas(6*250,registry.references.length*290),sg=sheet.getContext('2d');
  sg.fillStyle='#10171b';sg.fillRect(0,0,sheet.width,sheet.height);
  for(const action of [false,true]){
    await page.evaluate(action=>KRArtLab.setOptions({action,view:'color'}),action);
    for(let time=0;time<=5;time++){
      const first=await page.evaluate(t=>KRArtLab.renderAt(t,true),time);
      const second=await page.evaluate(t=>KRArtLab.renderAt(t,true),time);
      assert.deepEqual(first,second,'Same time must render the same pixels');
      comparisons.push({action,time,models:first.map(r=>({id:r.id,hash:r.hash,count:r.count}))});
      if(!action){
        const snapshots=await page.locator('.art-card canvas').evaluateAll(nodes=>nodes.map(c=>c.toDataURL()));
        for(let i=0;i<snapshots.length;i++){
          sg.fillStyle='#1b292d';sg.fillRect(time*250,i*290,249,289);
          sg.drawImage(await loadImage(snapshots[i]),time*250+5,i*290+24,240,247.5);
          sg.fillStyle=registry.references[i].status==='candidate'?'#eac67b':'#bdd0c1';sg.font='14px sans-serif';
          sg.fillText(registry.references[i].label+' / '+time+'s',time*250+10,i*290+18);
        }
      }
    }
    await page.screenshot({path:path.join(out,action?'desktop-action.png':'desktop-idle.png'),fullPage:true});
  }
  fs.writeFileSync(path.join(out,'idle-contact-sheet.png'),sheet.toBuffer('image/png'));
  assert.equal(await page.evaluate(()=>KRArtLab.state()),before,'Lab must not change selected game state');
  // Inspect motion at 30 fps; downsample only diagnostics, never displayed art.
  const motion=await page.evaluate(()=>{
    const miniature=document.createElement('canvas');miniature.width=64;miniature.height=66;
    const context=miniature.getContext('2d',{willReadFrequently:true}),warnings=[];
    for(const action of [false,true]){
      KRArtLab.setOptions({action});let previous={};
      for(let frame=0;frame<=180;frame++){
        const t=frame/30;KRArtLab.renderAt(t,false);
        for(const card of document.querySelectorAll('.art-card')){
          context.clearRect(0,0,64,66);context.drawImage(card.querySelector('canvas'),0,0,64,66);
          const data=context.getImageData(0,0,64,66).data,id=card.dataset.model;
          let count=0,x=0,y=0;
          for(let i=0;i<data.length;i+=4)if(data[i+3]>80){const p=i/4;count++;x+=p%64;y+=Math.floor(p/64);}
          const current={count,x:x/Math.max(1,count),y:y/Math.max(1,count)},last=previous[id];
          if(last&&(Math.abs(current.count-last.count)/Math.max(1,last.count)>.3||Math.hypot(current.x-last.x,current.y-last.y)>5))warnings.push({id,action,time:t,reason:'Large frame-to-frame silhouette change; inspect, not automatic rejection'});
          previous[id]=current;
        }
      }
    }
    return warnings;
  });
  motionWarnings.push(...motion);
  // A non-default view really changes the display, and mobile stays scrollable.
  await page.selectOption('#art-view','silhouette');
  await page.screenshot({path:path.join(out,'silhouette.png'),fullPage:true});
  await page.selectOption('#art-view','grayscale');
  assert.equal(await page.locator('.art-card canvas').first().evaluate(c=>c.style.filter),'grayscale(1)');
  await page.selectOption('#art-view','color');await page.selectOption('#art-bg','forest');
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(out,'mobile.png'),fullPage:true});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Mobile horizontal overflow');
  await page.locator('#art-scrub').fill('2');await page.locator('#art-scrub').dispatchEvent('input');
  assert.equal(await page.locator('#art-play').textContent(),'Play');
  report=await page.evaluate(()=>KRArtLab.report());
  assert.deepEqual(report.failures,[],'Technical art failures');
  // Fault injection proves the checks catch real broken drawing, not keywords.
  const faults=await page.evaluate(()=>{
    const original=drawMushroomGatherer,findings={};
    try{
      for(const [name,broken] of Object.entries({
        finite:()=>g.fillRect(NaN,0,10,10),
        stack:()=>g.save(),
        empty:()=>{},
        mutation:()=>{gold++;original(0);}
      })){
        document.getElementById('art-reset').click();const oldGold=gold;
        drawMushroomGatherer=broken;KRArtLab.renderAt(0,true);
        findings[name]=KRArtLab.report().failures;
        drawMushroomGatherer=original;gold=oldGold;
      }
    }finally{drawMushroomGatherer=original;document.getElementById('art-reset').click();}
    return findings;
  });
  for(const [name,failures] of Object.entries(faults))assert(failures.length>0,'Check failed to detect '+name);
  // Verify the one-second live sampler, rather than only calling it manually.
  const sampleBefore=await page.evaluate(()=>{KRArtLab.setOptions({playing:true});return KRArtLab.report().sampleCount;});
  await page.waitForFunction(n=>KRArtLab.report().sampleCount>=n+2,sampleBefore,{timeout:15000});
  await page.evaluate(()=>KRArtLab.setOptions({playing:false}));
  assert.deepEqual(errors,[]);
  // Ordinary boot must not load the lab scripts or install its checks.
  const normal=await browser.newPage(),labLoads=[];
  normal.on('request',r=>{if(/art-lab-runtime|art-references/.test(r.url()))labLoads.push(r.url());});
  await normal.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?roadlab=1');
  await normal.waitForFunction(()=>document.querySelector('#game')?.dataset.bootReady==='1');
  assert.equal(await normal.evaluate(()=>typeof window.KRArtLab),'undefined');assert.deepEqual(labLoads,[]);
  await normal.close();
  if(initial)fs.writeFileSync(baselinePath,JSON.stringify(baseline,null,2)+'\n',{flag:'wx'});
  report={...report,referenceIntegrity:'passed',determinism:'passed',motionSamples:362,
    motionWarnings,comparisons,faultInjection: Object.keys(faults),normalGameplayInstrumentation:'absent',
    visualApproval:'pending-user-review'};
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({technical:'passed',visual:'pending-user-review',references:names.length,
    sampledModels:registry.references.length,motionWarnings:motionWarnings.length,out},null,2));
 }catch(e){
  fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({error:e.stack,errors,visualApproval:'pending-user-review'},null,2));throw e;
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
