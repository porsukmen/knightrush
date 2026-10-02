const {chromium}=require('playwright'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{const p=await b.newPage({viewport:{width:1100,height:920}}),errors=[],label=process.argv.find(v=>/^v100-[a-z]+$/.test(v)),profiled=process.argv.includes('--profile'),cdp=profiled?await p.context().newCDPSession(p):null;if(cdp)await cdp.send('Profiler.enable');p.on('pageerror',e=>errors.push(e.message));
 if(label)await p.route('**/mounted-knight-renderer.js',async r=>{let s=await(await r.fetch()).text();
  s=s.replace(/function horse\(([^)]*)\)\{/,(_,args)=>'window.meshProfile={calls:0,ms:0,full:0,fallbacks:[]};function horse(...args){const t=performance.now();try{return buildHorse(...args);}finally{meshProfile.calls++;meshProfile.ms+=performance.now()-t;if(!args[2])meshProfile.full++;}}\n function buildHorse('+args+'){');
  s=s.replace("if(a.length!==b.length||a.some((f,i)=>f.tag!==b[i].tag||f.v.length!==b[i].v.length))return horse(p,withReins);","if(a.length!==b.length||a.some((f,i)=>f.tag!==b[i].tag||f.v.length!==b[i].v.length)){if(meshProfile.fallbacks.length<5)meshProfile.fallbacks.push({a:a.length,b:b.length,tagsA:a.reduce((o,f)=>(o[f.tag]=(o[f.tag]||0)+1,o),{}),tagsB:b.reduce((o,f)=>(o[f.tag]=(o[f.tag]||0)+1,o),{})});return horse(p,withReins);}");await r.fulfill({body:s,contentType:'application/javascript'});});
 await p.goto('http://127.0.0.1:8765/KnightRush.html');await p.waitForFunction(()=>KRMountedRunner?.ready,null,{timeout:90000});
 await p.evaluate(()=>{SFX.setTestMuted(true);uiConfirm();godMode=true;paused=false;
  window.gameProfile={rows:[],active:false,kind:'run',moving:false,current:null,clock:0};
  const oldPose=KRMountedReview.pose,oldActor=drawPlayer,oldRender=render,oldUpdate=update;
  KRMountedReview.pose=function(...args){const t=performance.now();try{return oldPose.apply(this,args);}finally{if(gameProfile.current){gameProfile.current.pose+=performance.now()-t;gameProfile.current.poses++;}}};
  drawPlayer=function(...args){const t=performance.now();try{return oldActor.apply(this,args);}finally{if(gameProfile.current)gameProfile.current.actor+=performance.now()-t;}};
  render=function(...args){if(!gameProfile.active)return oldRender.apply(this,args);const t=performance.now(),row={at:t,mode,action:boss?.turnAction?.actorId==='knight'?gameProfile.kind:'none',actor:0,pose:0,poses:0};gameProfile.current=row;try{return oldRender.apply(this,args);}finally{row.render=performance.now()-t;row.clip=KRMountedRunner.lastState?.action;gameProfile.current=null;gameProfile.rows.push(row);}};
  update=function(dt){oldUpdate(dt);if(!gameProfile.active)return;
   gameProfile.clock+=dt;if(gameProfile.moving){player.lane=Math.floor(gameProfile.clock/.6)%3;}
   if(gameProfile.kind==='run')return;
   if(gameProfile.kind==='lane'){boss.phase='player';boss.state='idle';boss.turnAction=null;return;}
   if(gameProfile.kind==='parry'){boss.phase='dodge';boss.state='idle';boss.turnAction=null;if(!player.parryShield)beginPlayerParryHold();else if(player.parryShield.phase==='hold'&&player.parryShield.t>.15)releasePlayerParryHold();return;}
   if(!boss.turnAction){boss.phase='player';boss.state='idle';boss.ap=9;boss.resolve=99;boss.partyActor='knight';boss.hp=boss.maxhp=100000;boss.posture=0;boss.postureMax=100000;boss.playerPhaseSerial++;boss.classSkillUseSerial=Object.create(null);boss.skillUseSerial=Object.create(null);performPlayerAction(gameProfile.kind==='bow'?fightCommand('knight'):compileClassSkillRoute('shield_bash_reinforced'));}
  };
 });
 const report=[];for(const [kind,moving]of (label?[['run',true],['lane',true],['bow',true],['bash',false],['parry',false]]:[['run',false],['bow',false],['bow',true],['bash',false]])){
  await p.evaluate(({kind,moving})=>{gameProfile.active=false;gameProfile.kind=kind;gameProfile.moving=moving;gameProfile.clock=0;KRMountedRunMotion.resetLane(KRMountedRunner.laneMotion);if(kind!=='run'){startBoss();mode='boss';boss.entering=false;boss.state='idle';boss.phase='player';boss.rise=1;boss.turnAction=null;boss.x=boss.xTarget=1;squire.present=false;player.x=player.lane=1;player.jumpT=player.duckT=-1;}paused=false;}, {kind,moving});
  await p.waitForTimeout(500);
  if(cdp)await cdp.send('Profiler.start');await p.evaluate(()=>{gameProfile.rows=[];gameProfile.active=true;if(window.meshProfile)Object.assign(meshProfile,{calls:0,ms:0,full:0,fallbacks:[]});});await p.waitForTimeout(kind==='run'?4000:6000);
  report.push(await p.evaluate(()=>{gameProfile.active=false;const rows=gameProfile.rows,stats=a=>{a=a.filter(Number.isFinite).sort((a,b)=>a-b);return {mean:a.reduce((a,b)=>a+b,0)/a.length,p50:a[Math.floor(a.length*.5)],p95:a[Math.floor(a.length*.95)],max:a.at(-1)};};return {kind:gameProfile.kind,moving:gameProfile.moving,mode,paused,frames:rows.length,fps:1000*(rows.length-1)/(rows.at(-1).at-rows[0].at),gap:stats(rows.slice(1).map((r,i)=>r.at-rows[i].at)),render:stats(rows.map(r=>r.render)),actor:stats(rows.map(r=>r.actor)),pose:stats(rows.map(r=>r.pose)),poseCalls:stats(rows.map(r=>r.poses)),worst:rows.toSorted((a,b)=>b.render-a.render).slice(0,8)};}));
  if(label)report.at(-1).mesh=await p.evaluate(()=>meshProfile);if(cdp){const {profile}=await cdp.send('Profiler.stop'),nodes=new Map(profile.nodes.map(n=>[n.id,n])),counts=new Map();for(const id of profile.samples||[])counts.set(id,(counts.get(id)||0)+1);report.at(-1).cpuProfile=[...counts].sort((a,b)=>b[1]-a[1]).slice(0,25).map(([id,count])=>({count,...nodes.get(id).callFrame}));}
 }
 fs.writeFileSync(`output/mounted-${label||'v99'}-game-${profiled?'cpu-profile':'profile'}.json`,JSON.stringify({report,errors},null,2));console.log(JSON.stringify({report,errors},null,2));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
