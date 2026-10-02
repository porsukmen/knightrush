const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict'),{createCanvas,loadImage}=require('@napi-rs/canvas');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{const p=await b.newPage({viewport:{width:1100,height:920}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8765/KnightRush.html');await p.waitForFunction(()=>KRMountedRunner?.ready,null,{timeout:90000});
 const rows=await p.evaluate(()=>{paused=true;SFX.setTestMuted(true);uiConfirm();startBoss();mode='boss';paused=true;pausePhotoMode=true;boss.x=boss.xTarget=1;boss.entering=false;boss.state='idle';boss.phase='player';boss.rise=1;squire.present=false;player.jumpT=player.duckT=player.swordPreviewT=-1;player.attackAnim=player.counterAnim=0;
  const rows=[];for(const lane of [0,.5,1,1.5,2])for(const heading of [-1,0,1]){
   player.x=player.lane=lane;KRMountedRunner.laneMotion.heading=heading;boss.turnAction=null;const run=KRMountedRunner.frame(),idle=KRMountedCombat.frame();
   const command=fightCommand('knight'),delivery={family:'PROJECTILE',profileId:'OWNER_BOW',pattern:'SINGLE'},bowTimeline=buildBowActionTimeline(command,delivery,0,200);boss.turnAction={actorId:'knight',command,delivery,bowTimeline,t:bowTimeline.firstRelease-1e-7};const bow=KRMountedCombat.frame(),q=bow.pose.bow,n=bow.pose.project(q.arrowNock),tip=bow.pose.project(KRMountedRig.add(q.arrowNock,KRMountedRig.mul(q.arrowDirection,11.7))),to=bowTurnActionGeometry().to,dx=tip[0]-n[0],dy=tip[1]-n[1],x=bow.placement.x+n[0]*bow.placement.unit,y=bow.placement.y+n[1]*bow.placement.unit;
   rows.push({lane,heading,run:run.state.angle,idle:idle.state.angle,bow:bow.state.angle,native:bow.pose.native.degrees,reach:q.reachError,rayError:Math.abs(dx*(to.y-y)-dy*(to.x-x))/Math.hypot(dx,dy)});
  }KRMountedRunner.laneMotion.heading=0;return rows;
 });
 for(const r of rows){assert.equal(r.idle,r.run);assert.equal(r.bow,r.run);assert(Math.abs(r.native-Math.min(r.run,360-r.run))<1e-8);assert(r.reach<1e-8);assert(r.rayError<.001);}
 const captures=[];for(const [device,width,height]of [['desktop',1100,920],['phone',390,844]]){await p.setViewportSize({width,height});for(const lane of [0,1,2]){await p.evaluate(lane=>{player.x=player.lane=lane;flashA=0;shakeMag=0;render();},lane);const name=`output/mounted-v99-${device}-lane-${lane}.png`;await p.screenshot({path:name});captures.push({device,name});}}
 const board=createCanvas(1170,844),ctx=board.getContext('2d');for(const [i,item]of captures.filter(x=>x.device==='phone').entries())ctx.drawImage(await loadImage(item.name),i*390,0);fs.writeFileSync('output/mounted-v99-phone-lanes.png',board.toBuffer('image/png'));
 const report={rows,errors};fs.writeFileSync('output/mounted-v99-lanes.json',JSON.stringify(report,null,2));console.log(report);assert.deepEqual(errors,[]);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
