const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/treasure-stability');
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:775,height:1000}});
  await page.route('**/assets/forest/journey-forest.js',route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(root,'assets/forest/journey-forest.js'),'utf8').replace('function begin(){','window.__treasureItems=()=>items; function begin(){')}));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);await page.waitForFunction(()=>window.KRTreasureRoad&&window.__treasureItems);
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  await run("startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='chest'));godMode=true;SFX.setTestMuted(true);");
  await run('dist=roadLabState.slot.at-350;roadScroll=dist;');
  const sample=await run(`(()=>{const result=[],missing=[];let prev=[];for(let i=0;i<3000&&dist<roadLabState.slot.at-40;i++){update(1/60);render();
   const now=__treasureItems().filter(i=>i.record.kind==='pool'||i.record.id===3||i.record.id===7).map(i=>{const p=i.record.kind==='pool'?journeyProjectCamera(i.c.side,i.c.depth):i.projected;return {key:[i.record.x,i.record.localZ,i.view.direction,Math.round(i.view.offset*1e6)].join(':'),x:i.p.x,z:i.p.z,sx:p.x,sy:p.y};});
   const keys=new Set(now.map(o=>o.key));for(const o of prev)if(!keys.has(o.key)){const c=journeyCameraPoint(o.x,o.z),p=journeyProjectCamera(c.side,c.depth);if(c.depth<CFG.Z_FAR&&p.x>50&&p.x<430&&p.y>300&&p.y<650)missing.push({frame:i,o,p,depth:c.depth});}
   prev=now;result.push(now);}return {frames:result,missing:missing.slice(0,10)};})()`);
  const frames=sample.frames;
  const turns=[];
  for(const direction of [-1,1]){
   await run(`roadLabState.entry=true;roadLabState.direction=${direction};startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='chest'));godMode=true;SFX.setTestMuted(true);
    for(let i=0;i<400&&dist<roadLabState.fixture.node.at-20;i++)update(1/60);player.x=player.lane=${direction+1};chooseJourneyDirection(${direction});`);
   turns.push(await run(`(()=>{let prev=new Map();const jumps=[],disappear=[],phases={};
    for(let f=0;f<1000&&mode==='run';f++){update(1/120);render();phases[journey.phase]=(phases[journey.phase]||0)+1;const next=new Map();
     for(const item of __treasureItems()){const o=item.record;if(o.kind!=='pool'&&o.id!==3&&o.id!==7)continue;
      const p=journeyProjectCamera(item.c.side,item.c.depth),key=[o.id,o.x,o.localZ,item.view.direction,Math.round(item.view.offset*1e6)].join(':');if(item.c.depth>CFG.Z_FAR||p.x<30||p.x>450||p.y<290||p.y>700)continue;
      const old=prev.get(key);if(old&&Math.hypot(p.x-old.x,p.y-old.y)>25)jumps.push({f,key,old,p:{...p},phase:journey.phase});next.set(key,{x:p.x,y:p.y,phase:journey.phase});}
     for(const [key,p]of prev)if(!next.has(key)&&p.x>80&&p.x<400&&p.y>330&&p.y<620){
      const identity=key.split(':').slice(0,3).join(':');
      const rebase=[...next].some(([k,q])=>k.split(':').slice(0,3).join(':')===identity&&Math.hypot(q.x-p.x,q.y-p.y)<5);
      if(!rebase)disappear.push({f,key,p,phase:journey.phase});}prev=next;
    }return {phases,jumps:jumps.slice(0,10),disappear:disappear.slice(0,10)};})()`));
  }
  const raster=await run(`(()=>{const result=[];for(const id of [3,7])for(const width of [31,55,63,65,90,130]){
   const images=[];for(const cached of [true,false]){journeyRenderSerial++;g.save();g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cvs.width,cvs.height);g.globalAlpha=cached?1:.999999;
    KRSunlitArt.nativeShapeWithPalette({id:'chest:16',color:c=>c},id,240,300,width,1,300);const data=g.getImageData(100,100,280,250).data;
    let n=0,sx=0,sy=0;for(let i=0;i<data.length;i+=4)if(data[i]+data[i+1]+data[i+2]>80){n++;sx+=(i/4)%280;sy+=Math.floor(i/4/280);}images.push({n,x:sx/n,y:sy/n});g.restore();}
   result.push({id,width,images,dx:images[0].x-images[1].x,dy:images[0].y-images[1].y});}return result;})()`);
  const moves=[],duplicates=[];let prev=new Map();
  for(let f=0;f<frames.length;f++){
   const current=new Map();for(const o of frames[f]){if(current.has(o.key))duplicates.push({f,key:o.key});current.set(o.key,o);
    const old=prev.get(o.key);if(old&&(Math.abs(o.x-old.x)>.001||Math.abs(o.z-old.z)>.001))moves.push({f,old,o});}
   prev=current;
  }
  // Pose sheet across the full hinge, including the old .02/.12 switching thresholds.
  await run('startLockpicking();');
  await run(`g.save();g.setTransform(viewScale,0,0,viewScale,viewX,viewY);expRect(0,-PAD_TOP,480,800+PAD_TOT,'#c5b58f');
   for(let i=0;i<12;i++)KRTreasureRoad.chest(85+(i%3)*153,165+Math.floor(i/3)*180,.85,[0,.015,.025,.1,.125,.2,.3,.4,.55,.7,.85,1][i]);g.restore();`);
  await page.screenshot({path:path.join(out,'hinge-sheet.png')});
  const report={frames:frames.length,moves:moves.slice(0,10),duplicates:duplicates.slice(0,10),missing:sample.missing,turns,raster};
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  assert.equal(moves.length,0);assert.equal(duplicates.length,0);
  assert(sample.missing.length===0,'Visible roadside props vanished during straight traversal');
  assert(turns.every(t=>!t.jumps.length&&!t.disappear.length),'Visible props jumped or vanished in a turn');
  assert(raster.every(r=>r.images.every(i=>i.n>0&&i.n<70000)&&Math.abs(r.dx)<.05&&Math.abs(r.dy)<.05),'Treasure flowers must retain one render representation');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
