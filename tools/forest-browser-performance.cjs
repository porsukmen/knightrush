const {chromium}=require(process.env.KNIGHT_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{for(const kind of ['normal','forest']){
  const page=await browser.newPage({viewport:{width:480,height:800}});
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});
  await page.goto('file:///C:/Users/Altar/Desktop/knight%20rush/KnightRush.html');
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.bootReady==='1');
  const result=await page.evaluate(async kind=>{
   const evalGame=code=>(0,eval)(code),t=performance.now();
   evalGame(kind==='forest'?'startForestCorridor()':'pendingJourneyPrototype=false;startRun(0)');
   const startMs=performance.now()-t,first=performance.now();evalGame('render()');
   const firstMs=performance.now()-first,samples=[],counts={},originals={};
   for(const name of ['forestGiantArt','forestReferenceDistant','forestGround','forestFlush']){
    originals[name]=window[name];if(!originals[name])continue;counts[name]=0;
    window[name]=function(...args){const t=performance.now();const r=originals[name](...args);counts[name]+=performance.now()-t;return r;};
   }
   for(let i=0;i<90;i++){
    await new Promise(r=>setTimeout(r,17));
    const t=performance.now();evalGame(kind==='forest'?'updateForestCorridor(1/60);render()':'update(1/60);render()');samples.push(performance.now()-t);
   }
   samples.sort((a,b)=>a-b);
   return {startMs,firstMs,median:samples[45],p95:samples[85],max:samples[89],counts,
    state:evalGame('({paused,mode,close:forestCloseSprites.size,art:forestGiantSprites.size,gpu:forestGPU.enabled})')};
  },kind);
  console.log(JSON.stringify({kind,...result}));await page.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
