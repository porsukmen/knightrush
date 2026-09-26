const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/ui-system');
fs.mkdirSync(out,{recursive:true});
const luminance=c=>{const v=c.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;};
const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
(async()=>{
 const b=await chromium.launch({channel:'msedge',headless:true}),errors=[],checks=[];
 try{
  for(const [device,width,height] of [['desktop',1000,1000],['phone',390,844]]){
   const p=await b.newPage({viewport:{width,height},hasTouch:device==='phone'});
   p.on('pageerror',e=>errors.push(device+': '+e.message));
   await p.goto(pathToFileURL(path.join(root,'UILab.html')).href);
   const palettes=await p.evaluate(()=>KRUI.themes);
   for(const [id,c] of Object.entries(palettes)){
    for(const [a,d]of [['ink','paper'],['onDark','panel'],['soft','dark']])assert(ratio(c[a],c[d])>=4.5,id+' contrast '+a+'/'+d);
    assert(ratio(c.mutedInk,c.muted)>=3,id+' disabled contrast');
    assert.deepEqual(c,palettes.treasure,'Venue aliases must keep the single Treasure palette');
   }
   assert.equal(await p.locator('[data-view="tavern"],[data-view="round"]').count(),0,'Withdrawn reference tabs removed');
   for(const tab of ['system','states']){await p.click('[data-view="'+tab+'"]');assert(await p.locator('#reference').evaluate(c=>c.width===960&&c.height===1240));}
   await p.selectOption('#theme','treasure');await p.click('[data-view="components"]');
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await p.screenshot({path:path.join(out,device+'-lab.png'),fullPage:true});
   await p.click('[data-view="loot"]');
   await p.screenshot({path:path.join(out,device+'-treasure-loot-specimen.png'),fullPage:true});
   for(const tab of ['components','lock','loot'])await p.click('[data-view="'+tab+'"]');
   const isolated=await p.evaluate(()=>{
    const c=document.createElement('canvas'),g=c.getContext('2d');g.translate(3,7);g.fillStyle='#123456';g.strokeStyle='#654321';g.font='19px serif';g.textAlign='right';g.lineWidth=7;
    const state=()=>JSON.stringify([g.fillStyle,g.strokeStyle,g.font,g.textAlign,g.lineWidth,[...['a','b','c','d','e','f'].map(k=>g.getTransform()[k])]]);
    const a=state();KRUI.button(g,{x:1,y:1,w:90,h:40},'TEST','forge',{selected:true});KRUI.panel(g,{x:1,y:60,w:90,h:40},'court');KRUI.heading(g,{x:1,y:1,w:90,h:40},'TEST','tavern');KRUI.sheet(g,{x:1,y:60,w:90,h:80});return a===state();
   });assert(isolated,'Canvas state restoration');
   await p.close();
   for(const [name,query,ready]of [
    ['menu','','true'],['duke','dukelab=1',"window.KRDukeBluff&&KREventVisuals.peek('duke-bluff')"],
    ['shuffle','queenlab=1',"window.KRRoyalShuffle&&KREventVisuals.peek('royal-shuffle')"],
    ['arm','armlab=1',"window.KRTavernArm&&KREventVisuals.peek('tavern-arm')"],
    ['chug','chuglab=1',"window.KRTavernChug&&KREventVisuals.peek('tavern-chug')"],
    ['slide','tavernslidelab=1',"window.KRTavernSlide&&KREventVisuals.peek('tavern-slide')"],
    ['merchant','merchantlab=1',"window.KRAutumnCaravan&&KREventVisuals.peek('autumn-caravan')"]
   ]){
    const q=await b.newPage({viewport:{width,height},hasTouch:device==='phone'});
    q.on('pageerror',e=>errors.push(device+'/'+name+': '+e.message));
    await q.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
    await q.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+(query?'?'+query:''));
    await q.waitForFunction(()=>document.querySelector('#game')?.dataset.bootReady==='1');
    const run=s=>q.evaluate(s=>(0,eval)(s),s);
    await q.waitForFunction(ready,{},{timeout:30000});await run('SFX.setTestMuted(true);render()');
    await q.screenshot({path:path.join(out,device+'-'+name+'.png')});
    if(name==='menu'){
     for(const screen of ['relicdex','changelog','score']){
      await run("mode='"+screen+"';modeT=5;render()");
      await q.screenshot({path:path.join(out,device+'-'+screen+'.png')});
     }
     await run("mode='menu';modeT=0");
     await run('openMinigamesMenu();render()');await q.screenshot({path:path.join(out,device+'-minigames.png')});
     await run('settingsOpen=true;render()');await q.screenshot({path:path.join(out,device+'-settings.png')});
    }
    if(name==='duke'){
     await run("diceGame.phase='turn';diceGame.turn='player';diceGame.bid={owner:'duke',count:2,face:3};diceGame.selected={count:1,face:1};render()");
     await q.screenshot({path:path.join(out,device+'-duke-disabled.png')});
     const result=await run("(()=>{const s=JSON.stringify(diceGame);render();return s===JSON.stringify(diceGame)})()");assert(result,'UI does not mutate Duke state');
    }
    await run('settingsOpen=false;paused=true;render()');await q.screenshot({path:path.join(out,device+'-'+name+'-pause.png')});
    await q.close();checks.push(device+'/'+name);
   }
   for(const theme of ['inn','forge','chest']){
    const q=await b.newPage({viewport:{width,height},hasTouch:true});q.on('pageerror',e=>errors.push(device+'/'+theme+': '+e.message));
    await q.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
    await q.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
    await q.waitForFunction(()=>window.KRMossyInn&&window.KRBasaltForge&&window.KRSunlitForest);
    const run=s=>q.evaluate(s=>(0,eval)(s),s);
    await run("SFX.setTestMuted(true);initAmbient();roadLabState.entry=false;roadLabState.direction=0;startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='"+theme+"'));godMode=true;gold=1000;scrap=100;dist=journeyRoadEventTriggerAt(roadLabState.slot);roadScroll=dist;obstacles=[];pickups=[];updateJourneyRoadEvents(0);");
    if(theme==='inn')await run("player.x=player.lane=2;handleAction('right',null,null,{fresh:true,mode:'run',roadStop:roadLabState.slot.id});");
    assert.equal(await run('mode'),theme==='inn'?'journeyevent':theme==='forge'?'shop':'lockpicking',device+'/'+theme+' entry');
    await run('render()');
    const scene={inn:'mossy-inn',forge:'basalt-forge',chest:'treasure-grove'}[theme];
    // UI-only fixture skips the running-road prefetch interval; await its plate explicitly.
    await run("prepareCutscene('"+scene+"',true,journeyRoadEventSession?.token??'ui-audit')");
    await q.waitForFunction(()=>window.KRCutscenes?.report().state==='ready',{}, {timeout:12000});await run('render()');
    await q.screenshot({path:path.join(out,device+'-'+theme+'.png')});
    const before=await run('JSON.stringify([gold,scrap,mode,dist])');await run('render()');assert.equal(await run('JSON.stringify([gold,scrap,mode,dist])'),before);
    await q.close();checks.push(device+'/'+theme);
   }
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,palettes:1,compatibilityAliases:8,labViews:5,canvasState:'preserved',screens:checks,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
