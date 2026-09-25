const {chromium}=require('playwright'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/inn-decor');
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 try{for(const [device,width,height,dpr]of [['desktop',775,1000,1],['phone',390,844,2]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?roadlab=1');
  await page.waitForFunction(()=>window.KRMossyInn&&window.KRSunlitForest);
  const run=s=>page.evaluate(s=>(0,eval)(s),s);
  const start=theme=>run(`roadLabState.entry=false;roadLabState.direction=0;startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='${theme}'));godMode=true;SFX.setTestMuted(true);`);
  for(const theme of ['bloodwood','disco']){
   await start(theme);await run('dist=roadLabState.slot.at-100;roadScroll=dist;render();');
   await page.screenshot({path:path.join(out,device+'-reference-'+theme+'.png')});
  }
  await start('inn');
  const layout=await run('KRMossyInn.layout(roadLabState.fixture.edge)');
  for(const kind of [0,1,2])for(const depth of [80,24,8]){
   const item=layout.find(x=>x.kind===kind);assert(item);
   await start('inn');
   const reached=await run(`(()=>{const target=KRMossyInn.layout(roadLabState.fixture.edge).find(x=>x.kind===${kind}&&x.at>dist+90).at-${depth};
    for(let i=0;i<8000&&dist<target;i++)update(1/120);obstacles=[];pickups=[];render();return Math.abs(dist-target)<1;})()`);
   assert(reached,'Real simulation must reach the decoration fixture');
   await page.screenshot({path:path.join(out,device+'-kind'+kind+'-depth'+depth+'.png')});
  }
  const measured=await run(`(()=>{
   const queued=[],queue=queueWorldDraw,cam=journeyCameraPoint,sort=Array.prototype.sort,rng=Math.random;
   const state=JSON.stringify([dist,roadScroll,gold,journeyRoute]);
   try{
    queueWorldDraw=(depth,fn,item)=>{if(!item.house&&item.kind!==undefined)queued.push({fn,item});};render();queueWorldDraw=queue;
    const items=queued.filter(x=>x.fn.name==='prop');if(!items.length)throw Error('No real inn decor queued');
    let projections=0,sorts=0;journeyCameraPoint=(...args)=>{projections++;return cam(...args);};
    Array.prototype.sort=function(...args){sorts++;return sort.apply(this,args);};
    Math.random=()=>{throw Error('Decoration consumes gameplay RNG');};
    const matrix=g.getTransform().toString(),alpha=g.globalAlpha;
    for(const entry of items)entry.fn(entry.item);
    return {count:items.length,projections,sorts,stable:state===JSON.stringify([dist,roadScroll,gold,journeyRoute]),canvas:matrix===g.getTransform().toString()&&alpha===g.globalAlpha};
   }finally{queueWorldDraw=queue;journeyCameraPoint=cam;Array.prototype.sort=sort;Math.random=rng;}
  })()`);
  assert.equal(measured.projections,measured.count,'One world projection per decor');assert.equal(measured.sorts,0);
  assert(measured.stable&&measured.canvas);assert.deepEqual(errors,[]);console.log(device,measured);await page.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
