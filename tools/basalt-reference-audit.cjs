/* --record-user-approval is only for the explicit 2026-09-25 promotion.
   Captures are exclusive-create. Existing approvals/baselines are never rewritten. */
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createHash}=require('node:crypto'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),record=process.argv.includes('--record-user-approval');
const sha=s=>createHash('sha256').update(s).digest('hex');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1000,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?artlab=1');
  await page.waitForFunction(()=>document.documentElement.dataset.artLabReady==='1');
  const names=await page.evaluate(()=>KRArtLab.registry.references.flatMap(r=>r.symbols).concat(KRArtLab.registry.sharedSymbols));
  const sources=await page.evaluate(names=>Object.fromEntries(names.map(n=>[n,KRArtLab.source(n)])),names);
  const fingerprints=Object.fromEntries(Object.entries(sources).map(([n,s])=>[n,sha(s.replace(/\r\n/g,'\n'))]));
  const baseline=JSON.parse(fs.readFileSync(path.join(root,'art-source/knight-rush-sharp-plane/reference-baseline.json')));
  for(const [name,hash]of Object.entries(baseline.fingerprints))assert.equal(fingerprints[name],hash,'Existing approved renderer changed: '+name);
  for(const [name,hash]of Object.entries(baseline.images))assert.equal(sha(fs.readFileSync(path.join(root,'art-source/knight-rush-sharp-plane',name))),hash);
  const portrait=await page.evaluate(()=>{
   const c=document.createElement('canvas');c.width=640;c.height=720;
   const saved=g;try{g=c.getContext('2d');KRBasaltForge.dwarf(320,635,2.8,5,0,null,0,true,true);return c.toDataURL();}finally{g=saved;}
  });
  await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?backgroundlab=1&scene=basalt-forge');
  await page.waitForFunction(()=>document.documentElement.dataset.forgeLabReady==='1');
  const composite=await page.locator('#forge-reference').screenshot();
  for(const view of ['scene','plate','neutral'])for(const pose of ['idle','bow','shield','gauntlet']){
   const before=await page.evaluate(()=>KRForgeBackgroundLab.state());
   await page.evaluate(v=>KRForgeBackgroundLab.setOptions(v),{view,pose,time:5});
   assert.equal(await page.evaluate(()=>KRForgeBackgroundLab.state()),before);
  }
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>KRForgeBackgroundLab.setOptions({view:'scene',pose:'idle'}));
  fs.mkdirSync(path.join(root,'output/basalt-forge'),{recursive:true});
  await page.screenshot({path:path.join(root,'output/basalt-forge/approved-background-lab-phone.png'),fullPage:true});
  assert.deepEqual(errors,[]);
  const buffers={
   'art-source/knight-rush-sharp-plane/approved-basalt-dwarf.png':Buffer.from(portrait.split(',')[1],'base64'),
   'art-source/knight-rush-backgrounds/approved/basalt-hearth-v4-composite.png':composite,
   'art-source/knight-rush-backgrounds/approved/basalt-hearth-v4.png':fs.readFileSync(path.join(root,'assets/encounters/basalt-hearth-v4.png'))
  };
  if(record){
   for(const file of Object.keys(buffers))assert(!fs.existsSync(path.join(root,file)),'Already recorded; do not overwrite '+file);
   for(const [file,data]of Object.entries(buffers))fs.writeFileSync(path.join(root,file),data,{flag:'wx'});
  }else{
   assert.equal((await page.evaluate(()=>KRForgeBackgroundLab.report())).approval,'approved');
   for(const [file,data]of Object.entries(buffers))assert.equal(sha(data),sha(fs.readFileSync(path.join(root,file))),'Live reference changed: '+file);
  }
  const lighting=fs.readFileSync(path.join(root,'assets/forest/basalt-forge.js'),'utf8').replace(/\r\n/g,'\n').split(' const ore=')[0];
  console.log(JSON.stringify({fingerprints:Object.fromEntries(Object.entries(fingerprints).filter(([n])=>n.startsWith('KRBasaltForge.'))),images:Object.fromEntries(Object.entries(buffers).map(([n,b])=>[n,sha(b)])),lightingPrefixSha256:sha(lighting),recorded:record},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
