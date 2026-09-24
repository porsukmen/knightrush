// Native floor coverage and before-turn readability. No production instrumentation.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});
 try{const page=await browser.newPage({viewport:{width:480,height:800}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
 await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);
 await page.waitForFunction(()=>!!window.KRSunlitForest);
 const run=s=>page.evaluate(s=>(0,eval)(s),s),out='output/sunlit-entrances';fs.mkdirSync(out,{recursive:true});
 // Crimson banks must stay wine-red, not drift back to autumnal brown/orange.
 // Check both foliage planes, bark, verge and attached root/plant materials.
 const bankSources=['#528b41','#67984b','#4b8341','#95b951','#b2c85f','#91b44b',
  '#805936','#b58b50','#4f432d','#775739','#b28b4f','#8bac46','#d3b06d',
  '#50713f','#a2af50','#8da641','#526f39','#407749','#88a949','#507940',
  '#658744','#9bb24e','#86a44b','#bed069','#735437','#b18b54','#89663e',
  '#d2b076','#9c7748','#739447','#a9bd59'];
 for(const source of bankSources){
  const full=await run(`KRSunlitForest.materialAt('bloodwood',1,'${source}')`);
  const [r,g,b]=[1,3,5].map(i=>parseInt(full.slice(i,i+2),16));
  assert(r>b&&b>g,'Crimson bank material lost its red/burgundy hue: '+source);
  assert.equal(await run(`KRSunlitForest.materialAt('bloodwood',0,'${source}')`),source,'Unblended forest must stay unchanged');
 }
 const results=[];
 for(const theme of ['disco','bloodwood'])for(const direction of [-1,1]){
  await run(`roadLabState.direction=${direction};roadLabState.entry=true;
   startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='${theme}'));
   for(let i=0;i<400&&dist<roadLabState.fixture.node.at-20;i++)update(1/60);render();`);
  const entry=await run(`(()=>{const e=roadLabState.fixture.edge,start=e.pieces[0].start;
   return {phase:journey.phase,views:journeyDiscoRoadViews('${theme}').filter(v=>!v.spill).length,
    ground:KRSunlitForest.roadColorAt(e,start),trees:journeyThemeStrength(e,start,'${theme}'),
    incoming:KRSunlitForest.roadColorAt(journeyActiveEdge(),dist),
    blend:[-1,0,30,31,45,65,85,95].map(d=>KRSunlitForest.roadColorAt(e,start+d))};})()`);
  assert.equal(entry.phase,'approach');assert(entry.views>0);assert.equal(entry.trees,0);
  if(theme==='bloodwood'){
   assert.equal(entry.ground,'#d6b16f','Natural Crimson entrance must not start with a red step');
   assert(entry.blend.slice(0,3).every(c=>c==='#d6b16f'),'Forest lead-in stays unchanged');
   const rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
   const distance=c=>rgb(c).reduce((n,v,i)=>n+Math.abs(v-rgb('#d6b16f')[i]),0);
   const values=entry.blend.map(distance);
   assert(values.every((v,i)=>!i||v>=values[i-1]),'Crimson soil must deepen monotonically');
   assert(values[3]<5&&new Set(entry.blend).size>=5,'Entry must be continuous, not a jump');
   assert.equal(entry.blend.at(-1),'#7e3539','Full Crimson soil retains its original red');
  }
  assert.equal(entry.incoming,'#d6b16f','Normal incoming soil must stay normal');
  await page.screenshot({path:path.join(out,`${theme}-${direction}-preview.png`)});
  await run(`player.x=player.lane=${direction+1};chooseJourneyDirection(${direction});
   for(let i=0;i<300&&journey.phase!=='turning';i++)update(1/60);`);
  const motion=await run(`(()=>{const original=drawJourneyDiscoPatch,cull=KRSunlitArt.floorSectionVisible,colors=new Map();
   let submitted=0,previousSubmitted=0,centreCullMisses=0,footprintChecks=0;
   try{for(let frame=0;frame<150;frame++){
    update(1/120);render();const records=[];
    KRSunlitArt.floorSectionVisible=(...args)=>{footprintChecks++;return cull(...args);};
    drawJourneyDiscoPatch=(view,a,b,l,r,color,alpha)=>records.push({edge:view.edge.id,a,b,l,r,color,alpha});
    drawJourneyDiscoGround();const frozen=JSON.stringify(records);records.length=0;
    const clock=perfNow;perfNow+=53;drawJourneyDiscoGround();perfNow=clock;
    if(JSON.stringify(records)!==frozen)throw Error('Floor colours depend on the animation clock');
    drawJourneyDiscoPatch=original;
    KRSunlitArt.floorSectionVisible=cull;
    submitted+=records.length;
    for(const p of records){
     if(p.alpha!==1)throw Error('Translucent deck');
     const key=[p.edge,p.a,p.l].join(':');
     if(colors.has(key)&&colors.get(key)!==p.color)throw Error('Panel recolours during turn/handoff');
     colors.set(key,p.color);
    }
    for(const view of journeyDiscoRoadViews())if(!view.spill){
     const begin=(view.begin??view.edge.pieces[0].start)+(view.edge.direction?-1:-5),end=view.end??view.edge.pieces.at(-1).end;
     for(let a=begin;a<end;a+=4){
      const w=view.point(a,0),c=journeyCameraPoint(w.x,w.z);
      if(c.depth>=-12&&c.depth<=CFG.Z_FAR+8&&Math.abs(c.side)<=c.depth*3+40)previousSubmitted+=6;
     }
     for(const p of records.filter(p=>p.edge===view.edge.id)){
      const w=view.point(p.a,0),c=journeyCameraPoint(w.x,w.z);
      if(c.depth<-12||c.depth>CFG.Z_FAR+8||Math.abs(c.side)>c.depth*3+40)centreCullMisses++;
     }
    }
   }}finally{drawJourneyDiscoPatch=original;KRSunlitArt.floorSectionVisible=cull;}
   return {submitted,previousSubmitted,centreCullMisses,footprintChecks,phase:journey.phase};})()`);
  if(theme==='disco'){
   assert(motion.submitted>0);assert(motion.submitted<motion.previousSubmitted*1.1,'Restored tile floor submits duplicate patches');
   assert(motion.footprintChecks>0,'Restored floor must still use whole-footprint visibility');
  }
  assert.notEqual(motion.phase,'turning');results.push({theme,direction,entry,motion});
  await page.screenshot({path:path.join(out,`${theme}-${direction}-after.png`)});
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(results,null,2));
 console.log('SUNLIT_ENTRANCES_OK',JSON.stringify(results));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
