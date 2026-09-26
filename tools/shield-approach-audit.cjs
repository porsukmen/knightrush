const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/shield-approach');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({channel:'msedge',headless:true});
 try{
  const p=await b.newPage({viewport:{width:480,height:850}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await p.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
  await p.waitForFunction(()=>document.querySelector('#game')?.dataset.bootReady==='1');
  const run=s=>p.evaluate(s=>(0,eval)(s),s);
  await run("openSkillLab();startSkillLabCombat();skillLabSession.combatHud=false;boss.phase='player';boss.ap=9;boss.resolve=99;performPlayerAction(compileClassSkillRoute('shield_bash_reinforced'));boss.turnAction.t=1.08;flashA=0;shakeMag=0;modeT=3;initAmbient();render()");
  const report=await run(`(()=>{
   const check=(v,m)=>{if(!v)throw Error(m)},rows=[];
   for(const actorId of ['knight','ally'])for(const lane of [0,1,2])for(const hits of [1,4]){
    player.x=player.lane=2;boss.x=lane;squire.visualX=100;
    const timeline=buildShieldBashTimeline({hits},{animationProfile:'SHIELD_IMPACT'}),
     a={actorId,t:0,shieldTimeline:timeline,shieldTravel:buildShieldApproach(actorId)},
     sample=t=>{a.t=t;const pose=shieldBashPoseAt(shieldActionPoseTime(a),{});
      return shieldApproachPosition(a,pose.lunge)},start=sample(0),end=sample(timeline.recoveryEnd);
    check(start.x===a.shieldTravel.fromX&&start.y===a.shieldTravel.fromY,'start');
    check(end.x===start.x&&end.y===start.y,'exact return');
    for(const time of timeline.contacts){const at=sample(time);
     check(Math.abs(at.x-a.shieldTravel.toX)<.001&&Math.abs(at.y-a.shieldTravel.toY)<.001,'every contact at boss');}
    let prev=start,maxStep=0;
    for(let t=1/120;t<=timeline.recoveryEnd;t+=1/120){const at=sample(t);
     maxStep=Math.max(maxStep,Math.hypot(at.x-prev.x,at.y-prev.y));prev=at;}
    check(maxStep<18,'continuous movement '+JSON.stringify({actorId,lane,hits,maxStep,travel:a.shieldTravel}));
    check(player.x===2&&player.lane===2&&boss.x===lane,'logical positions unchanged');
    rows.push({actorId,lane,hits,maxStep});
   }
   for(const route of SHIELD_BASH_ROUTES){
    const command=compileClassSkillRoute(route.id);
    check(!!buildShieldBashTimeline(command,{animationProfile:'SHIELD_IMPACT'}),'route coverage');
   }
   player.x=player.lane=2;boss.x=0;boss.turnAction.shieldTravel=buildShieldApproach('knight');
   return rows;
  })()`);
  for(const [device,width,height]of [['phone',390,844],['desktop',1200,900]]){
   await p.setViewportSize({width,height});
   for(const [name,t]of [['start',0],['approach',.78],['contact',1.08],['return',1.36],['rest',2.46]]){
    await run(`boss.turnAction.t=${t};flashA=0;shakeMag=0;bannerT=0;render()`);
    await p.screenshot({path:path.join(out,device+'-'+name+'.png')});
   }
  }
  console.log(JSON.stringify({passed:true,cases:report.length,routes:await run('SHIELD_BASH_ROUTES.length'),errors}));
  assert.deepEqual(errors,[]);
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
