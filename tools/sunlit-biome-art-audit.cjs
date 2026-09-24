// Scene evidence, not an automatic aesthetic approval. No runtime instrumentation.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/sunlit-biomes');
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 const results=[];
 try{
  for(const [device,width,height,dpr] of [['desktop',1280,900,1],['phone',390,844,2]]){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
   await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
   await page.waitForFunction(()=>!!window.KRSunlitForest);
   const run=code=>page.evaluate(code=>(0,eval)(code),code);
   for(const theme of ['disco','bloodwood']){
    await run(`roadLabState.direction=0;roadLabState.entry=false;
     startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='${theme}'));
     globalThis.biomeEdge=journeyActiveEdge();globalThis.biomeStart=biomeEdge.pieces[0].start;
     globalThis.biomeEnd=biomeEdge.pieces.at(-1).end;
     globalThis.nativeModelPaths=KRSunlitArt.models.map(m=>m.shapes?.length||0);
     globalThis.actorSource=drawSerJonathanRider.toString();`);
    for(const scene of ['entry','transition','venue','exit','after']){
     await run(`dist=${scene==='entry'?'biomeStart+12':scene==='transition'?'biomeStart+62':scene==='venue'?'roadLabState.slot.at-62':scene==='exit'?'biomeEnd-38':'biomeEnd+2'};
      if('${scene}'==='exit'||'${scene}'==='after')journeyRoute.eventRecords[roadLabState.slot.id]={status:'completed'};
      curvedGroundDistance=roadScroll=runDistance=dist;obstacles=[];pickups=[];roadsideScenery=[];
      nextSpawnAt=dist+24;nextTreeAt=dist-8;armJourneyNode();spawnLoopEntities();
      perfNow=5;for(let i=0;i<24;i++)render();`);
     const before=await run('JSON.stringify({dist,player,obstacles,pickups,records:journeyRoute.eventRecords})');
     await run('render();');
     assert.equal(await run('JSON.stringify({dist,player,obstacles,pickups,records:journeyRoute.eventRecords})'),before);
     assert.equal(await run('drawSerJonathanRider.toString()'),await run('actorSource'));
     assert.deepEqual(await run('KRSunlitArt.models.map(m=>m.shapes?.length||0)'),await run('nativeModelPaths'));
     const report=await run('KRSunlitForest.report()');assert(report.cacheBytes<=5*1048576);
     await page.screenshot({path:path.join(out,`${device}-${theme}-${scene}.png`)});
     results.push({device,theme,scene,report});
    }
    // Local adapter returns the exact original materials outside the biome.
    assert(await run(`(()=>{const source={armor:'#a3b2ad',armorDark:'#536e76',armorLight:'#e8e3bf',
      steel:'#bccbc5',steelLight:'#fff0cc',horse:'#775532',horseMane:'#30302a'};
      const old=dist;try{
       dist=biomeStart;const outside=KRSunlitForest.riderAppearance(source);
       dist=(biomeStart+biomeEnd)/2;const inside=KRSunlitForest.riderAppearance(source);
       return outside===source&&inside!==source&&inside.armor!==source.armor&&source.armor==='#a3b2ad';
      }finally{dist=old;}})()`));
    assert.equal(await run(`KRSunlitForest.materialAt('${theme}',0,'#528b41')`),'#528b41');
    assert.equal(await run('KRSunlitForest.roadColorAt(biomeEdge,biomeEnd)'),'#d6b16f');
    if(theme==='bloodwood'){
     const transition=await run(`(()=>{
      const draw=KRSunlitArt.drawFloorShape;let gradients=0,opaque=true;
      dist=biomeStart+62;curvedGroundDistance=roadScroll=dist;
      try{KRSunlitArt.drawFloorShape=(shape,paint,...args)=>{
       if(shape.color==='#d6b16f'&&typeof paint==='object'){gradients++;opaque=opaque&&g.globalAlpha===1;}
       return draw(shape,paint,...args);};render();}finally{KRSunlitArt.drawFloorShape=draw;}
      let maxJump=0;
      const rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
      for(let d=30;d<96;d+=.13){
       const a=rgb(KRSunlitForest.roadColorAt(biomeEdge,biomeStart+d));
       const b=rgb(KRSunlitForest.roadColorAt(biomeEdge,biomeStart+d+.02));
       maxJump=Math.max(maxJump,...a.map((v,i)=>Math.abs(v-b[i])));
      }
      return {gradients,opaque,maxJump};})()`);
     assert(transition.gradients>0&&transition.opaque,'Transition must be an opaque soil material, not an overlay');
     assert(transition.maxJump<=1,'Soil colour still jumps between quantized steps');
    }
    if(theme==='disco')for(const kind of ['pond','boulder','root']){
     await run(`dist=roadLabState.slot.at-62;curvedGroundDistance=roadScroll=dist;
      obstacles=[1,2,3].map((count,i)=>{const req={};for(let j=0;j<count;j++)req[j]='${kind}'==='root'&&j===0?'duck':'jump';
       const o=new ObstacleEntity('${kind}',18+i*36,req,'L');o.roadTheme='disco';o.seed=310+i;return o;});
      pickups=[];perfNow=5;render();`);
     const before=await run('JSON.stringify(obstacles)');await run('render();');
     assert.equal(await run('JSON.stringify(obstacles)'),before);
     await page.screenshot({path:path.join(out,`${device}-disco-${kind}-lanes.png`)});
    }
   }
   assert.deepEqual(errors,[]);await page.close();
  }
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({results,visualApproval:'pending-user-review',physicalPhone:false},null,2));
  console.log('SUNLIT_BIOME_ART_OK desktop/DPR2 entry, venue, exit, post-exit; shared geometry, local actor light, state purity, 5MiB cap');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
