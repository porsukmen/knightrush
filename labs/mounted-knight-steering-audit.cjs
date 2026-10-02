const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),{createCanvas,loadImage}=require('@napi-rs/canvas');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage({viewport:{width:1100,height:920}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8765/KnightRush.html');await p.waitForFunction(()=>window.KRMountedRunner?.ready,null,{timeout:90000});
 await p.evaluate(()=>{SFX.setTestMuted(true);uiConfirm();paused=true;pausePhotoMode=true;});
 const report=await p.evaluate(()=>{
  const P=KRMountedRunner,dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i])),r={bones:0,horse:0,legs:0,rows:[]};
  for(const action of ['none','duck','jump'])for(const amount of [-.7,-.3,0,.3,.7]){
   const state={angle:180,time:action==='jump'?1.075:.23,motion:'gallop',action,duckAmount:action==='duck'?.65:0},base=KRMountedReview.pose(state),q=KRMountedReview.pose({...state,riderSteer:amount});
   for(let j=0;j<4;j++)for(const key of ['root','joint','end'])r.horse=Math.max(r.horse,dist(base.legs[j][key],q.legs[j][key]));
   for(let j=0;j<2;j++)for(const key of ['root','joint','end'])r.legs=Math.max(r.legs,dist(base.riderLegs[j][key],q.riderLegs[j][key]));
   for(const a of q.armChains)r.bones=Math.max(r.bones,Math.abs(dist(a.root,a.joint)-5),Math.abs(dist(a.joint,a.end)-5.1));
   const chestX=q.native.body.lean||0;r.rows.push({action,amount,lean:chestX-(base.native.body.lean||0),forward:q.steering?.forwardPitch||0,handDelta:q.armChains.map((a,i)=>q.project(a.end)[0]-q.project(base.armChains[i].end)[0])});
  }
  r.angles=[];r.profileContinuity=0;
  for(const angle of [135,176,180,184,225])for(const action of ['none','duck','jump'])for(const amount of [-.7,.7]){
   const state={angle,time:action==='jump'?1.075:.23,motion:'gallop',action,duckAmount:action==='duck'?.65:0},base=KRMountedReview.pose(state),q=KRMountedReview.pose({...state,riderSteer:amount});
   r.angles.push({angle,action,amount,handY:q.armChains.map((a,i)=>a.end[1]-base.armChains[i].end[1])});
   for(const a of q.armChains)r.bones=Math.max(r.bones,Math.abs(dist(a.root,a.joint)-a.a),Math.abs(dist(a.joint,a.end)-a.b));
   for(let j=0;j<4;j++)for(const key of ['root','joint','end'])r.horse=Math.max(r.horse,dist(base.legs[j][key],q.legs[j][key]));
   for(let j=0;j<2;j++)for(const key of ['root','joint','end'])r.legs=Math.max(r.legs,dist(base.riderLegs[j][key],q.riderLegs[j][key]));
  }
  for(const angle of [90,270])for(const amount of [-.7,.7]){
   const poses=[-1,1].map(sign=>KRMountedReview.pose({angle:angle+sign*.001,time:.23,motion:'gallop',action:'none',riderSteer:amount}));
   for(let i=0;i<2;i++)for(const key of ['root','joint','end'])r.profileContinuity=Math.max(r.profileContinuity,dist(poses[0].armChains[i][key],poses[1].armChains[i][key]));
  }
  player.x=player.lane=1;KRMountedRunMotion.resetLane(P.laneMotion);P.clock=.23;playerAction('right');for(let i=0;i<10;i++)updatePlayer(1/120);
  const before=P.frame().pose;playerAction('up');const after=P.frame().pose;r.jumpEntry=Math.max(...before.armChains.flatMap((a,i)=>['root','joint','end'].map(k=>dist(a[k],after.armChains[i][k]))));
  return r;
 });
 assert(report.bones<1e-9);assert.equal(report.horse,0);assert.equal(report.legs,0);assert(report.jumpEntry<1e-8);for(const r of report.rows){assert(Math.abs(r.lean-r.amount*.055)<1e-10);assert.equal(r.forward,0);assert(r.handDelta.every(d=>Math.abs(d)<1e-8||Math.sign(d)===Math.sign(r.amount)));}
 for(const r of report.angles){assert(r.handY[0]*r.handY[1]<0,`Hands need separate rein roles: ${JSON.stringify(r)}`);const strength=Math.abs(r.amount*Math.cos(r.angle*Math.PI/180));assert(Math.abs(Math.max(...r.handY)-.18*strength)<1e-9);assert(Math.abs(Math.min(...r.handY)+.06*strength)<1e-9);}assert(report.profileContinuity<.001);
 const shots=await p.evaluate(()=>{
  const canvas=document.createElement('canvas');canvas.width=400;canvas.height=400;const ctx=canvas.getContext('2d'),rows=[],visible={knight:true,horse:true,shield:true,sword:true,bow:true,quiver:true};
  for(const angle of [135,180,225])for(const action of ['none','duck','jump'])for(const amount of [-.65,0,.65]){ctx.clearRect(0,0,400,400);ctx.fillStyle='#19282e';ctx.fillRect(0,0,400,400);KRMountedReview.draw(ctx,{angle,time:action==='jump'?1.075:.23,motion:'gallop',action,duckAmount:action==='duck'?.65:0,riderSteer:amount,visible,zoom:1},null,{x:200,y:350,unit:5.8});rows.push({angle,action,amount,url:canvas.toDataURL()});}return rows;
 });
 for(const angle of [135,180,225]){const selected=shots.filter(s=>s.angle===angle),c=createCanvas(1200,1275),ctx=c.getContext('2d');ctx.fillStyle='#19282e';ctx.fillRect(0,0,c.width,c.height);for(let i=0;i<selected.length;i++){const x=i%3*400,y=Math.floor(i/3)*425;ctx.drawImage(await loadImage(selected[i].url),x,y+25);ctx.fillStyle='#eee5c9';ctx.font='16px sans-serif';ctx.fillText(`${angle} / ${selected[i].action} / ${selected[i].amount}`,x+8,y+19);}fs.writeFileSync(`output/mounted-v84-steering-${angle}.png`,c.toBuffer('image/png'));}
 for(const [device,width,height]of [['desktop',1100,920],['phone',390,844]]){await p.setViewportSize({width,height});for(const direction of [-1,1]){await p.evaluate(direction=>{const P=KRMountedRunner;player.x=player.lane=1;player.jumpT=player.duckT=-1;P.clock=.23;KRMountedRunMotion.resetLane(P.laneMotion);playerAction(direction<0?'left':'right');for(let i=0;i<10;i++)updatePlayer(1/120);render();},direction);await p.screenshot({path:`output/mounted-v84-${device}-${direction<0?'left':'right'}.png`});}}
 report.errors=errors;fs.writeFileSync('output/mounted-v84-steering-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));assert.deepEqual(errors,[]);
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
