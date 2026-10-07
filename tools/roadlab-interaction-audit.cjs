'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const out=path.resolve(__dirname,'../output/roadlab-interaction');fs.mkdirSync(out,{recursive:true});
 try{
  const page=await browser.newPage({viewport:{width:407,height:663}});
  page.on('pageerror',e=>console.log('PAGE_ERROR',e.message));
  page.on('console',m=>{if(['error','warning'].includes(m.type()))console.log('CONSOLE',m.text());});
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(process.env.KR_ROAD_URL||'http://127.0.0.1:8765/KnightRush.html');
  await page.waitForFunction(()=>window.KRSwordEvent&&window.KRMountedRunner?.ready,null,{polling:100,timeout:120000});
  if(process.env.KR_ROAD_FUZZ){
   const result=await page.evaluate(()=>{
    const failed=[];let checked=0;
    for(let seed=0;seed<30;seed++)for(const direction of [-1,0,1]){
     openRoadLab();roadLabState.seed=seed;roadLabState.direction=direction;
     const ok=startRoadLabCase(5);checked++;
     if(!ok||journeyActiveEdge()?.preview.theme!=='oath')failed.push({seed,direction,ok,mode,theme:journeyActiveEdge()?.preview.theme});
    }return {checked,failed};
   });console.log('SEED_FUZZ',JSON.stringify(result));return;
  }
  const click=async rect=>{
   const pt=await page.evaluate(r=>({x:(viewX+(r.x+r.w/2)*viewScale)/renderDpr(),y:(viewY+(r.y+r.h/2)*viewScale)/renderDpr()}),rect);
   await page.mouse.click(pt.x,pt.y);await page.evaluate(()=>render());
  };
  await click(await page.evaluate(()=>MENU_DEBUG_BTN));
  await click({x:244,y:262,w:108,h:34});
  console.log('MENU',await page.evaluate(()=>({mode,paused,roadLabState})));
  await page.screenshot({path:path.join(out,'menu.png')});
  const p=await page.evaluate(()=>{const r=ROAD_LAB_UI.test(5);return {x:(viewX+(r.x+r.w/2)*viewScale)/renderDpr(),y:(viewY+(r.y+r.h/2)*viewScale)/renderDpr()};});
  await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+8,p.y);await page.mouse.up();
  assert.equal(await page.evaluate(()=>journeyActiveEdge()?.preview.theme),'oath','Mouse drift inside the same button must select Oath');
  await page.evaluate(()=>{openRoadLab();render();});
  await page.evaluate(p=>{
   const fire=(type,x)=>dispatchEvent(new TouchEvent(type,{cancelable:true,changedTouches:[new Touch({identifier:1,target:document.body,clientX:x,clientY:p.y})]}));
   fire('touchstart',p.x);fire('touchmove',p.x+8);fire('touchend',p.x+8);
  },p);
  assert.equal(await page.evaluate(()=>journeyActiveEdge()?.preview.theme),'oath','Touch drift inside the same button must select Oath');
  await page.evaluate(()=>{openRoadLab();render();});
  const crossing=await page.evaluate(()=>{const a=ROAD_LAB_UI.test(4),b=ROAD_LAB_UI.test(5),point=(x,y)=>({x:(viewX+x*viewScale)/renderDpr(),y:(viewY+y*viewScale)/renderDpr()});return {a:point(a.x+a.w-1,a.y+20),b:point(b.x+1,b.y+20)};});
  await page.mouse.move(crossing.a.x,crossing.a.y);await page.mouse.down();await page.mouse.move(crossing.b.x,crossing.b.y);await page.mouse.up();
  assert.equal(await page.evaluate(()=>mode),'roadlab','A release over a different button must not select that road');
  console.log('ROADLAB_POINTER_OK');
  const themes=['forge','caravan','inn','bloodwood','disco','oath','chest'];
  for(const index of [0,1,2,3,4,6,5]){
   await page.evaluate(()=>{openRoadLab();render();});
   await click(await page.evaluate(i=>ROAD_LAB_UI.test(i),index));
   assert.equal(await page.evaluate(()=>journeyActiveEdge()?.preview.theme),themes[index],'Wrong road selected by button '+index);
   console.log('CLICK',index,await page.evaluate(()=>({mode,active:roadLabState.active,index:roadLabState.index,theme:journeyActiveEdge()?.preview.theme,slot:roadLabState.slot?.id,dist})));
  }
  for(let i=0;i<2400;i++){
   const state=await page.evaluate(()=>{
    update(1/30);render();
    const views=journeyDiscoRoadViews('oath').filter(v=>!v.spill).map(v=>{const s=KROathRoad.site(v.edge),p=s&&v.point(s.at,0);return {edge:v.edge.id,site:s?.at,slot:s?.slotId,depth:p&&journeyCameraPoint(p.x,p.z).depth};});
    return {dist,mode,phase:journey?.phase,active:journeyRoute.activeEdge,at:roadLabState.slot.at,views};
   });
   if(i%150===0||state.views.some(v=>v.depth>-1&&v.depth<1)||state.mode!=='run')console.log('RIDE',i,JSON.stringify(state));
   if(i%450===0)await page.screenshot({path:path.join(out,'ride-'+i+'.png')});
   if(state.mode!=='run')break;
  }
  await page.waitForFunction(()=>mode==='boss'&&boss?.definitionId==='ancientguardian',null,{polling:100,timeout:120000});
  await page.evaluate(()=>journeyRoadEventSession.context.preparation);
  console.log('FINAL',await page.evaluate(()=>({mode,dist,event:journeyRoute.eventRecords[roadLabState.slot.id],boss:boss?.definitionId})));
  await page.evaluate(()=>{paused=true;pausePhotoMode=true;render();});
  await page.screenshot({path:path.join(out,'final.png')});
  console.log('ROADLAB_INTERACTION_OK');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
