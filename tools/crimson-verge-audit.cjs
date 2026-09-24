// Palette-only regression: restored original Crimson ground and plants.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const out=path.resolve('output/crimson-verge');fs.mkdirSync(out,{recursive:true});
 try{for(const [device,width,height,dpr]of [['desktop',775,1000,1],['phone',390,844,2]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);
  await page.waitForFunction(()=>!!window.KRSunlitForest);
  const run=s=>page.evaluate(s=>(0,eval)(s),s);
  const colors=await run(`(()=>{const sources=['#50713f','#a2af50','#8da641','#526f39','#407749','#88a949','#507940'];
   return {verge:sources.map(c=>KRSunlitForest.materialAt('bloodwood',1,c)),
    forest:sources.map(c=>KRSunlitForest.materialAt('bloodwood',0,c)),sources,
    soil:KRSunlitForest.materialAt('bloodwood',1,'#d6b16f'),
    disco:KRSunlitForest.materialAt('disco',1,'#a2af50')};})()`);
  assert.equal(colors.verge[0],'#33202a');assert.deepEqual(colors.forest,colors.sources);
  assert.equal(colors.soil,'#7e3539');assert.equal(colors.disco,'#786477');
  assert.deepEqual(colors.verge.slice(1),['#91334b','#72253e','#481e2e','#4e2034','#a43853','#69283f'],
   'Road-edge planes and separate plant colours must remain unchanged');
  await run(`roadLabState.direction=0;roadLabState.entry=false;
   startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='bloodwood'));godMode=true;
   const target=roadLabState.fixture.edge.pieces[0].start+115;
   for(let i=0;i<2500&&dist<target;i++)update(1/60);
   perfNow=5;for(let i=0;i<40;i++)render();`);
  await page.screenshot({path:path.join(out,device+'.png')});
  assert.deepEqual(errors,[]);await page.close();
 }console.log('CRIMSON_VERGE_OK restored original Crimson palette; unchanged disco/forest; desktop/phone');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
