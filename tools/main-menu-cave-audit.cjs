const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const{pathToFileURL}=require('node:url'),root=path.resolve(__dirname,'..'),out=path.join(root,'output/main-menu-cave');
fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 for(const[device,width,height]of [['phone',390,844],['desktop',1200,900]]){
  const p=await b.newPage({viewport:{width,height},hasTouch:device==='phone'}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>requestAnimationFrame=()=>0);
  await p.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
  await p.waitForFunction(()=>document.querySelector('#game')?.dataset.bootReady==='1');
  const run=s=>p.evaluate(s=>(0,eval)(s),s);
  await run('mode="menu";perfNow=0;flashA=0;resize();render()');
  const paper=await run('KRMenuMapPaper.report()');
  await run('for(let i=0;i<20;i++)render()');
  assert.equal(await run('KRMenuMapPaper.report().builds'),paper.builds,'Static parchment must not rebuild every frame');
  assert(paper.bytes<2*1024*1024,'Parchment cache must stay below 2 MiB');
  await p.screenshot({path:path.join(out,device+'-menu.png')});
  const before=await run('JSON.stringify([player.x,player.lane,boss,env,biome,gold,dist])');
  await run('perfNow=.9;render()');await p.screenshot({path:path.join(out,device+'-breath.png')});
  const idle=await run(`(()=>{
   const c=document.createElement('canvas');c.width=960;c.height=330;
   const original=g,legRenderer=drawSerJonathanHorseLeg,horses=[],hooves=[],blades=[];
   try{g=c.getContext('2d');g.fillStyle='#1b292d';g.fillRect(0,0,960,330);
    for(let i=0;i<4;i++){
     const target={};drawSerJonathanRider(120+i*240,306,1.7,{gallop:0,
      swordAction:backSwordPoseAt(2,{}),mountedIdle:menuKnightIdlePose(i*1.5),swordFxTarget:target});
     const {base,tip}=target.swordFxPose,length=Math.hypot(tip.x-base.x,tip.y-base.y);
     blades.push([(tip.x-base.x)/length,(tip.y-base.y)/length]);
    }
    const sheet=c.toDataURL();
    for(const t of [0,1,2,3,4.8,8]){g.clearRect(0,0,c.width,c.height);
     const contacts=[];
     drawSerJonathanHorseLeg=(...args)=>{contacts.push([args,g.getTransform().toString()]);return legRenderer(...args)};
     drawSerJonathanRider(120,306,1.7,{gallop:0,horseOnly:true,mountedIdle:menuKnightIdlePose(t)});
     horses.push(c.toDataURL());
     hooves.push(JSON.stringify(contacts));}
    return {sheet,blades,hoovesStill:hooves.every(s=>s===hooves[0]),
     horseBreathes:horses.some(s=>s!==horses[0]),
     bladeSteady:blades.every(v=>Math.abs(v[0]-blades[0][0])<1e-8&&Math.abs(v[1]-blades[0][1])<1e-8)};
   }finally{g=original;drawSerJonathanHorseLeg=legRenderer;}
  })()`);
  assert(idle.hoovesStill,'Idle must not move planted hooves');
  assert(idle.horseBreathes,'Horse must visibly breathe and sway its tail');
  assert(idle.bladeSteady,'Straight arm must not swing the sword during idle '+JSON.stringify(idle.blades));
  if(device==='phone')fs.writeFileSync(path.join(out,'knight-idle-poses.png'),Buffer.from(idle.sheet.split(',')[1],'base64'));
  assert.equal(await run('JSON.stringify([player.x,player.lane,boss,env,biome,gold,dist])'),before);
  const labels=await run(`(()=>{const texts=[],original=g.fillText;g.fillText=function(t,...args){texts.push(t);return original.call(this,t,...args)};try{render()}finally{g.fillText=original}return texts})()`);
  for(const s of ['OLD FOREST','FOREST TEST','QUIT','CHANGELOG','wolfwood'])assert(!labels.some(t=>String(t).includes(s)),s);
  for(const [key,mode]of [['MENU_MINIGAMES_BTN','minigames'],['MENU_RELIC_BTN','relicdex'],['MENU_DEBUG_BTN','debugcfg']]){
   await run(`handleAction('tap',{x:${key}.x+10,y:${key}.y+10})`);assert.equal(await run('mode'),mode);await run('mode="menu"');
  }
  await run('handleAction("tap",{x:MENU_SETTINGS_BTN.x+10,y:MENU_SETTINGS_BTN.y+10});render()');
  assert(await run('settingsOpen'));await p.screenshot({path:path.join(out,device+'-settings.png')});
  const perf=await run('journeyPerf.enabled');await run('settingsTap({x:240,y:VH/2-158})');assert.notEqual(await run('journeyPerf.enabled'),perf);
  const curved=await run('curvedWorldTrial');await run('settingsTap({x:240,y:VH/2-200})');assert.equal(await run('curvedWorldTrial'),curved);
  await run('debugRun=true;render()');await p.screenshot({path:path.join(out,device+'-debug-settings.png')});
  await run('settingsOpen=false;debugRun=false;mode="menu";handleAction("tap",{x:MENU_PLAY_BTN.x+10,y:MENU_PLAY_BTN.y+10})');
  assert.notEqual(await run('mode'),'menu');assert.deepEqual(errors,[]);console.log({device,passed:true,errors});await p.close();
 }
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
