// No server, no browser security overrides, no network. Accept a staged/build
// directory to prove the labs do not depend on unrelated working-tree files.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{const root=path.resolve(process.argv[2]||path.join(__dirname,'..')),browser=await chromium.launch({channel:'msedge',headless:true});try{
 const context=await browser.newContext({offline:true,viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[],network=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
 await page.goto(pathToFileURL(path.join(root,'labs/GuardianAttackLab.html')).href);
 await page.waitForFunction(()=>window.KRGuardianAttackStudio?.state().settled,null,{timeout:60000});
 // Access must still be blocked; readiness is through the channel, not disabled security.
 assert.equal(await page.evaluate(()=>{try{return !!document.getElementById('gameFrame').contentWindow.KRGuardianAttackBridge;}catch{return false;}}),false);
 await page.locator('[data-camera="90"]').click();await page.waitForFunction(()=>KRGuardianAttackStudio.state().settled);
 const native=page.frames().find(f=>f.url().includes('attackeditor=1'));
 for(const camera of ['90','game']){
  await page.locator(`[data-camera="${camera}"]`).click();await page.waitForFunction(()=>KRGuardianAttackStudio.state().settled);
  const snapshot=await page.evaluate(()=>KRGuardianAttackStudio.inspect());
  const exact=await native.evaluate(points=>points.map(point=>[KRGuardianAttackBridge.project(point),[0,1,2].map(i=>{const p=point.slice();p[i]+=.1;return KRGuardianAttackBridge.project(p);})]),snapshot.projectionSamples.map(s=>s.point));
  snapshot.projectionSamples.forEach((s,i)=>{assert.deepEqual(s.screen,exact[i][0]);s.axes.forEach((a,j)=>a.forEach((v,k)=>assert.ok(Math.abs(s.screen[k]+v*.1-exact[i][1][j][k])<1e-10)));});
 }
 await page.locator('[data-action="jump"]').click();await page.waitForFunction(()=>KRGuardianAttackStudio.state().settled);assert.ok(await page.evaluate(()=>KRGuardianAttackStudio.inspect().player.jump>0));
 await page.goto(pathToFileURL(path.join(root,'labs/AncientGuardianModelLab.html')).href);
 await page.waitForFunction(()=>!!window.KRAncientGuardianLab,null,{timeout:60000});
 assert.ok(!/yüklenemedi/i.test(await page.locator('#status').textContent()));
 await page.evaluate(()=>{KRAncientGuardianLab.set({time:8.4,angle:90});KRAncientGuardianLab.draw();});
 assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
 console.log('GUARDIAN_FILE_OK: both labs offline, origin protection intact, native projection samples exact, knight jump, model animation');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
