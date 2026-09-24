// Local palette test. Technical evidence, not aesthetic approval.
const {chromium}=require('playwright');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/morning-rider-lighting');
async function compare(a,b,view){
 const images=await Promise.all([loadImage(a),loadImage(b)]),data=images.map(image=>{
  const c=createCanvas(image.width,image.height),g=c.getContext('2d');g.drawImage(image,0,0);
  return g.getImageData(0,0,c.width,c.height).data;
 });let changed=0,outside=0;
 for(let i=0;i<data[0].length;i+=4){
  if(![0,1,2,3].some(k=>Math.abs(data[0][i+k]-data[1][i+k])>8))continue;
  changed++;const x=((i/4)%images[0].width-view.x)/view.scale,
    y=(Math.floor(i/4/images[0].width)-view.y)/view.scale;
  if(x<145||x>335||y<view.foot-190||y>view.foot+90)outside++;
 }
 assert(changed>100,'Lighting did not visibly affect the rider');
 assert.equal(outside,0,'Local lighting changed the scenery or HUD');return {changed,outside};
}
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?morninglab=1');
  await page.waitForFunction(()=>window.KRMorningForest?.report().ready);
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  const renderer=await run('drawSerJonathanRider.toString()'),results={};
  for(const [device,width,height]of [['desktop',1280,900],['phone',390,844]]){
   await page.setViewportSize({width,height});
   await run('resize();KRMorningForest.restart();dist=40;roadScroll=40;curvedGroundDistance=40;perfNow=5;player.gallop=1.2;for(const r of forestCorridor.course)r.entity.z=r.z-dist;');
   // Native scenery caches fill over several render frames. Compare lighting
   // after warm-up so cache resampling is not mistaken for a scene-wide tint.
   await run('for(let i=0;i<40;i++)render();');
   const before=await run('JSON.stringify({dist,player,journey,character:playerChar})');
   const frames=[];
   for(const enabled of [false,true]){
    await run(`KRMorningForest.setRiderLighting(${enabled});render();`);
    const name=device+(enabled?'-morning':'-original');
    await page.screenshot({path:path.join(out,name+'.png')});
    // Read the backing canvas so pixel coordinates use viewX/viewY/viewScale;
    // a locator screenshot can crop the CSS letterbox on narrow displays.
    frames.push(Buffer.from((await run('cvs.toDataURL()')).split(',')[1],'base64'));
   }
   const view=await run('({x:viewX,y:viewY,scale:viewScale,foot:PLAYER_Y})');
   results[device]=await compare(...frames,view);
   assert.equal(await run('JSON.stringify({dist,player,journey,character:playerChar})'),before,'Lighting mutated gameplay');
  }
  await page.setViewportSize({width:1280,height:900});await run('resize();');
  // Native close-up: rerender the actual animated player at higher resolution,
  // never enlarge a small screenshot to judge material edges.
  for(const pose of ['idle','duck','jump'])for(const enabled of [false,true]){
   const png=await run(`(()=>{
    KRMorningForest.setRiderLighting(${enabled});
    player.duckT=${pose==='duck'?'.24':'-1'};player.jumpT=${pose==='jump'?'.2':'-1'};
    const c=document.createElement('canvas');c.width=460;c.height=${pose==='jump'?'900':'650'};
    const main=g;try{g=c.getContext('2d');g.fillStyle='#d6b16f';g.fillRect(0,0,c.width,c.height);
     g.translate(230,${pose==='jump'?'720':'480'});g.scale(2.8,2.8);g.translate(-laneX(player.x,1),-PLAYER_Y);drawPlayer();
    }finally{g=main;}return c.toDataURL();})()`);
   fs.writeFileSync(path.join(out,pose+(enabled?'-morning':'-original')+'.png'),Buffer.from(png.split(',')[1],'base64'));
  }
  await run('player.duckT=-1;player.jumpT=-1;KRMorningForest.setRiderLighting(true);');
  await page.locator('[data-action=lighting]').click();
  assert.equal(await page.locator('[data-action=lighting]').getAttribute('aria-pressed'),'false');
  await page.locator('[data-action=lighting]').click();
  assert.equal(await page.locator('[data-action=lighting]').getAttribute('aria-pressed'),'true');
  // A direct model draw (e.g. another lab/preview) must not inherit the player profile.
  const isolated=[];
  for(const enabled of [false,true])isolated.push(await run(`(()=>{
   KRMorningForest.setRiderLighting(${enabled});const c=document.createElement('canvas');c.width=240;c.height=240;
   const main=g;try{g=c.getContext('2d');drawRider(120,210,1,{rigId:'ser_jonathan',horse:'#714326',feather:'#268ee8'});}
   finally{g=main;}return c.toDataURL();})()`));
  assert.equal(isolated[0],isolated[1],'Lighting leaked into an unrelated rider draw');
  // Morning lighting must retain only the original player's contact shadow.
  const shadows=[];
  for(const enabled of [false,true])shadows.push(await run(`(()=>{
   KRMorningForest.setRiderLighting(${enabled});const c=document.createElement('canvas');c.width=VW;c.height=VH;
   const main=g,rider=drawRider;try{g=c.getContext('2d');drawRider=()=>{};drawPlayer();}
   finally{g=main;drawRider=rider;}return c.toDataURL();})()`));
  assert.equal(shadows[0],shadows[1],'Morning lighting added a new ground shadow');
  assert.equal(await run('drawSerJonathanRider.toString()'),renderer,'Approved rider renderer was replaced');
  await run('setMode("menu");render();');assert.equal(await run('KRMorningForest.report().active'),false);
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({technical:'passed',results,errors,
   geometryUnchanged:true,gameplayUnchanged:true,unrelatedDrawUnchanged:true,visual:'pending-user-review'},null,2));
  console.log('MORNING_RIDER_LIGHTING_OK '+JSON.stringify(results));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
