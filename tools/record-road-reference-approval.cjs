/* One explicit user-approved promotion. Writes NEW PNG artifacts only with
   --record-user-approval; prints metadata for reviewed apply_patch updates. */
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createHash}=require('node:crypto'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),extras=process.argv.includes('--record-obstacle-complements'),record=process.argv.includes('--record-user-approval')||extras;
const hash=b=>createHash('sha256').update(b).digest('hex'),url=pathToFileURL(path.join(root,'KnightRush.html')).href;
const roads=require('../art-source/knight-rush-special-roads/creator-references.js');
const data={approvedOn:'2026-09-25',approval:roads.approval,images:{},fingerprints:{},lighting:{}};
function artifact(file,buffer){
 const target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});
 if(record){
  if(extras&&fs.existsSync(target))assert.equal(hash(fs.readFileSync(target)),hash(buffer),'Existing approval differs: '+file);
  else{assert(!fs.existsSync(target),'Approval already exists: '+file);fs.writeFileSync(target,buffer,{flag:'wx'});}
 }
 else if(process.argv.includes('--preview')){const dir=path.join(root,'output/reference-preview');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,path.basename(file)),buffer);}
 else assert.equal(hash(fs.readFileSync(target)),hash(buffer),'Live reference differs: '+file);
 data.images[file]=hash(buffer);
}
(async()=>{
 const b=await chromium.launch({channel:'msedge',headless:true});
 try{
  const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(url+'?artlab=1');await p.waitForFunction(()=>document.documentElement.dataset.artLabReady==='1');
  await p.evaluate(()=>KRArtLab.setOptions({playing:false,time:2}));
  const previous=require('../art-source/knight-rush-sharp-plane/reference-baseline.json');
  const fingerprints=await p.evaluate(()=>Object.fromEntries([...new Set(KRArtLab.registry.references.flatMap(r=>r.symbols).concat(KRArtLab.registry.sharedSymbols))].map(n=>[n,KRArtLab.source(n)])));
  for(const [name,source]of Object.entries(fingerprints))data.fingerprints[name]=hash(source.replace(/\r\n/g,'\n'));
  for(const [name,value]of Object.entries(previous.fingerprints))assert.equal(data.fingerprints[name],value,'Old approval changed: '+name);
  for(const [name,value]of Object.entries(previous.images))assert.equal(hash(fs.readFileSync(path.join(root,'art-source/knight-rush-sharp-plane',name))),value);
  for(const id of ['innkeeper','seated-merchant']){
   const png=await p.evaluate(id=>{
    const c=document.createElement('canvas');c.width=640;c.height=720;const saved={g,perfNow};
    try{g=c.getContext('2d');perfNow=2;
     if(id==='innkeeper')KRMossyInn.keeper(320,650,3,false);
     else{g.translate(320-165*2.3,650-461*2.3);g.scale(2.3,2.3);const s={phase:'browse',clock:2};KRAutumnCaravan.withLighting(()=>{KRAutumnCaravan.actor(s);KRAutumnCaravan.actor(s,true);},false);}
     return c.toDataURL();
    }finally{g=saved.g;perfNow=saved.perfNow;}
   },id);
   artifact('art-source/knight-rush-sharp-plane/approved-'+id+'.png',Buffer.from(png.split(',')[1],'base64'));
  }
  for(const [scene,version]of [['mossy-inn','mossy-inn-v4'],['autumn-caravan','autumn-caravan-v1']]){
   await p.goto(url+'?backgroundlab=1&scene='+scene);await p.waitForFunction(()=>document.documentElement.dataset.serviceLabReady==='1');
   await p.evaluate(()=>KRServiceBackgroundLab.setOptions({view:'scene',time:2}));
   await p.locator('#service-reference').evaluate(c=>{c.style.width='960px';c.style.maxHeight='none';});
   const png=await p.locator('#service-reference').screenshot();
   artifact('art-source/knight-rush-backgrounds/approved/'+version+'-composite.png',png);
   artifact('art-source/knight-rush-backgrounds/approved/'+version+'.png',fs.readFileSync(path.join(root,'assets/encounters/'+version+'.png')));
   data.lighting[scene]=hash(fs.readFileSync(path.join(root,'assets/forest/'+scene+'.js'),'utf8').replace(/\r\n/g,'\n').split(' function drawCutscene(){')[0]);
  }
  await p.goto(url+'?roadcreatorlab=1');await p.waitForFunction(()=>document.documentElement.dataset.roadCreatorReady==='1');
  for(const ref of roads.references)for(const view of roads.views){
   await p.evaluate(v=>KRRoadCreatorLab.setOptions(v),{theme:ref.theme,view,kind:'boulder',lanes:'012',depth:24});
   assert.equal((await p.evaluate(()=>KRRoadCreatorLab.report())).mode,'run');
   const png=await p.locator('#rc-canvas').evaluate(c=>c.toDataURL());
   artifact('art-source/knight-rush-special-roads/approved/'+ref.theme+'-'+view+'.png',Buffer.from(png.split(',')[1],'base64'));
  }
  for(const ref of roads.references)for(const kind of ['pond','root']){
   await p.evaluate(v=>KRRoadCreatorLab.setOptions(v),{theme:ref.theme,view:'obstacles',kind,lanes:'012',depth:24});
   const png=await p.locator('#rc-canvas').evaluate(c=>c.toDataURL());
   artifact('art-source/knight-rush-special-roads/approved/'+ref.theme+'-obstacles-'+kind+'.png',Buffer.from(png.split(',')[1],'base64'));
  }
  assert.deepEqual(errors,[]);
  data.sourceFiles={};for(const f of ['KnightRush.html','assets/forest/journey-forest.js','assets/forest/sunlit-forest.js','assets/forest/disco-grove.js','assets/forest/basalt-forge.js','assets/forest/treasure-road.js','assets/forest/autumn-caravan.js','assets/forest/mossy-inn.js'])data.sourceFiles[f]=hash(fs.readFileSync(path.join(root,f)));
  console.log(JSON.stringify(data,null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
