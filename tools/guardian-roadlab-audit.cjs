'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.KR_BASE_URL||'http://127.0.0.1:8765';
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))errors.push(r.url());});
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(base+'/KnightRush.html?roadlab=1');
  await page.waitForFunction(()=>window.KRSwordEvent&&window.KRMountedRunner?.ready,null,{polling:100,timeout:120000});
  for(const beforeTurn of [false,true])for(const direction of [-1,0,1]){
   const entry=await page.evaluate(({direction,beforeTurn})=>{
    roadLabState.direction=direction;roadLabState.entry=beforeTurn;
    if(!startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='oath')))throw Error('No road fixture');
    return {direction,beforeTurn,dist,slot:roadLabState.slot,edge:journeyRoute.activeEdge};
   },{direction,beforeTurn});
   console.log('START',JSON.stringify(entry));
   const crossing=await page.evaluate(()=>{
    let frames=0;
    while(mode==='run'&&dist<roadLabState.slot.at+40&&frames++<6000){
     if(roadLabState.entry&&dist>=roadLabState.fixture.node.at-25&&journeyRoute.activeEdge!==roadLabState.fixture.edge.id){
      player.x=player.lane=roadLabState.direction+1;chooseJourneyDirection(roadLabState.direction);
     }
     update(1/60);
    }
    return {dist,frames,mode,session:journeyRoadEventSession?.context.phase};
   });
   console.log('CROSSING',JSON.stringify(crossing));
   await page.waitForFunction(()=>boss?.definitionId==='ancientguardian'&&mode==='boss',null,{polling:100,timeout:120000});
   assert.equal(await page.evaluate(()=>boss._sequence.recipe.id),'guardian-blender-v9');
   console.log('ROADLAB_ENTRY_OK',direction);
  }
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
