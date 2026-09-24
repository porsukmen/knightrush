const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs');
const label=process.argv[2]||'after',out=path.resolve('output/sunlit-restoration',label);
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 try{const page=await browser.newPage({viewport:{width:480,height:800}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
 await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);await page.waitForFunction(()=>!!window.KRSunlitForest);
 const run=s=>page.evaluate(s=>(0,eval)(s),s),results=[];
 for(const theme of ['disco','bloodwood']){
  await run(`Math.random=(()=>{let seed=731;return()=>((seed=Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;})();
   roadLabState.direction=0;roadLabState.entry=false;startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='${theme}'));render();`);
  const report=await run(`(()=>{const edge=journeyActiveEdge(),layout=journeyRoadDecorLayout(edge),
   bones=layout.filter(d=>['bones','skull','ribs','spine'].includes(d.kind));
   if('${theme}'==='bloodwood'&&bones.length){dist=bones[0].at-18;curvedGroundDistance=roadScroll=dist;obstacles=[];pickups=[];render();}
   const items=KRSunlitForest.inspect(),decor=DRAW_QUEUE.filter(d=>d.draw===drawJourneyBloodDecor),
    collisions=layout.flatMap(d=>items.filter(p=>Math.abs(p.x-d.offset)<2.4&&Math.abs(p.z-d.at)<4).map(p=>({decor:d.kind,at:d.at,scenery:p.id,x:p.x,z:p.z})));
   return {theme:'${theme}',decor:layout.length,bones:bones.length,queued:decor.length,collisions};})()`);
  await page.screenshot({path:path.join(out,theme+'.png')});results.push(report);
  if(label!=='before'){
   assert.equal(report.collisions.length,0,'New scenery occupies original biome prop footprints');
   if(theme==='bloodwood'){
    assert(report.bones>0);assert(report.queued>0);
    report.visibleBonePixels=await run(`(()=>{
     const original=drawJourneyBloodDecor;render();const a=g.getImageData(0,0,cvs.width,cvs.height).data;
     try{drawJourneyBloodDecor=function(item){if(!['skull','bones','ribs','spine'].includes(item.kind)||item.totem)original(item);};
      render();const b=g.getImageData(0,0,cvs.width,cvs.height).data;let changed=0;
      for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>45)changed++;
      return changed;
     }finally{drawJourneyBloodDecor=original;render();}
    })()`);
    assert(report.visibleBonePixels>30,'Bone entries are queued but not actually visible');
   }
  }
 }
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(results,null,2));console.log('RESTORATION',JSON.stringify(results));
 assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
