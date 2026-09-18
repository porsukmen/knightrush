const {chromium}=require(process.env.KNIGHT_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:480,height:800}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file:///C:/Users/Altar/Desktop/knight%20rush/KnightRush.html');
 await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
 if(process.env.KNIGHT_MENU_SETTLE)await page.waitForTimeout(Number(process.env.KNIGHT_MENU_SETTLE));
 const result=await page.evaluate(async quality=>{
   if(quality){const original=window.forestBlit;window.forestBlit=(sprite,x,y,scale)=>original(sprite,x,y,scale,quality);}
   const samples=[];let previous=performance.now(),phase='loading';
   function sample(now){samples.push({gap:now-previous,phase});previous=now;if(phase!=='done')requestAnimationFrame(sample)}
   requestAnimationFrame(sample);const start=performance.now();await startForestCorridorPrepared();
   const loadingMs=performance.now()-start;phase='running';
   const costs={};
   for(const name of ['render','update','prepareForestBaked','forestGPUFloor','uploadForestGPUBand','forestReferenceDistant','forestFlush']){
    const original=window[name];if(!original)continue;costs[name]={sum:0,max:0,calls:0};
    window[name]=function(...args){const t=performance.now();const r=original(...args),d=performance.now()-t;
      costs[name].sum+=d;costs[name].max=Math.max(costs[name].max,d);costs[name].calls++;return r;};
   }
   await new Promise(r=>setTimeout(r,12000));phase='done';
   const summarize=p=>{const a=samples.filter(s=>s.phase===p).map(s=>s.gap).sort((a,b)=>a-b);return {frames:a.length,median:a[Math.floor(a.length*.5)],p95:a[Math.floor(a.length*.95)],max:a.at(-1)}};
   return {loadingMs,costs,loading:summarize('loading'),running:summarize('running'),state:(0,eval)('({paused,dist,art:forestGiantSprites.size,close:forestCloseSprites.size})')};
 },process.env.KNIGHT_FILTER||'');
 const assets=await page.evaluate(()=>{let bytes=0,pending=0,failed=0;for(const e of forestBakedImages.values()){
 if(e.ready)bytes+=e.image.width*e.image.height*4;else pending++;if(e.failed)failed++;}return {decodedMiB:bytes/1048576,pending,failed};});
 await page.screenshot({path:'output/journey-ground-qa/forest-baked-runtime.png'});
 console.log(JSON.stringify({result,assets,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
