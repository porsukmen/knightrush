const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 for(const width of [320,1000]){
  const page=await browser.newPage({viewport:{width,height:width===320?568:1000},hasTouch:true});
  await page.addInitScript(()=>requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);
  await page.waitForFunction(()=>window.KRAutumnCaravan&&window.KRBasaltForge,null,{polling:100});
  const run=code=>page.evaluate(code=>(0,eval)(code),code);
  const tapUI=async key=>{
   const p=await run(`(()=>{const r=KRAutumnCaravan.UI.${key};return{x:((r.x+r.w/2)*viewScale+viewX)/renderDpr(),y:((r.y+r.h/2)*viewScale+viewY)/renderDpr()}})()`);
   await page.touchscreen.tap(p.x,p.y);
  };
  const check=async(name,controls)=>{
   const result=await run(`(()=>{
    const original=KRUI,boxes=[];
    window.KRUI={...original,sheet(g,r,...args){boxes.push(r);return original.sheet(g,r,...args)},
     panel(g,r,id,options){if(options?.light)boxes.push(r);return original.panel(g,r,id,options)}};
    try{render();return (${controls}).map(r=>({r,inside:boxes.some(p=>
     r.x>=p.x+8&&r.x+r.w<=p.x+p.w-8&&r.y>=p.y+29&&r.y+r.h+4<=p.y+p.h-29)}));}
    finally{window.KRUI=original;}
   })()`);
   assert(result.every(r=>r.inside),name+' '+JSON.stringify(result));
  };
  await check('menu','[MENU_PLAY_BTN,MENU_MINIGAMES_BTN,MENU_RELIC_BTN,MENU_SETTINGS_BTN,MENU_DEBUG_BTN]');
  await run('settingsOpen=true');await check('settings','[{x:170,y:444,w:140,h:44}]');await run('settingsOpen=false');
  await run('openMerchantLab()');await check('merchant lab','[KRAutumnCaravan.UI.buy,KRAutumnCaravan.UI.reroll,KRAutumnCaravan.UI.addGold,KRAutumnCaravan.UI.reset,KRAutumnCaravan.UI.leave(true)]');
  await run('gold=1000');const cost=await run('merchantRerollCost()');
  await tapUI('reroll');await tapUI('reroll');assert.equal(await run('gold'),1000-cost);
  await run('updateMerchantShop(.5);merchantShop.selected=3');
  const price=await run('merchantShop.stock[3].price');
  await tapUI('buy');await tapUI('buy');assert.equal(await run('gold'),1000-cost-price);
  await run('updateMerchantShop(2)');
  await run('merchantShop.lab=false');await check('merchant','[KRAutumnCaravan.UI.buy,KRAutumnCaravan.UI.reroll,KRAutumnCaravan.UI.leave(false)]');
  await tapUI('leave(false)');assert.notEqual(await run('mode'),'merchant');
  await run("setMode('menu');roadLabState.entry=false;startRoadLabCase(0);dist=roadLabState.slot.at;updateJourneyRoadEvents(0)");
  await check('forge','[KRBasaltForge.UI.confirm,KRBasaltForge.UI.leave]');
  await run("startTavernSlide('forest','minigames')");
  await page.waitForFunction(()=>window.KRTavernSlide&&window.KREventVisuals?.peek('tavern-slide'),null,{polling:100});
  await check('slide','[TAVERN_SLIDE_START_BTN]');
  await page.close();
 }
 console.log('PAPER_CONTAINMENT_OK menu/settings/merchant/merchant-lab/forge/slide at 320px + desktop; all action buttons inside with ornament clearance');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
