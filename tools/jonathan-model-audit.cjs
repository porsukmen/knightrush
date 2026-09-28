const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true}),out='output/jonathan-models',url=pathToFileURL(path.resolve('KnightRush.html')).href;fs.mkdirSync(out,{recursive:true});try{
 const p=await b.newPage({viewport:{width:1180,height:950}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const run=s=>p.evaluate(s=>(0,eval)(s),s);
 await p.goto(url+'?knightmodellab=1');await p.waitForFunction(()=>window.KRJonathanLab);await p.locator('#model-play').uncheck();await p.evaluate(()=>KRJonathanLab.render(0));
 assert.equal(await p.locator('#model-grid canvas').count(),6);
 const rigs=await p.evaluate(()=>['front','back'].flatMap(f=>Array.from({length:21},(_,i)=>KRJonathan.seatedPose(i/20,f))));
 for(const r of rigs){
  for(const a of r.arms){assert(Math.abs(Math.hypot(a.ex-a.sx,a.ey-a.sy)-5)<1e-8);assert(Math.abs(Math.hypot(a.hx-a.ex,a.hy-a.ey)-5.1)<1e-8);}
  for(const l of r.legs){
   assert(Math.abs(l.fy-l.ky-6)<1e-8,'Shin must not shrink when sitting');
   assert(Math.abs(Math.hypot(l.kx-l.hx,-6-r.hip,l.fy/.28)-6)<1e-8,'Projected thigh retains physical length');
  }
 }
 const mounted=await run(`(()=>{const old=g,c=document.createElement('canvas');c.width=c.height=600;try{g=c.getContext('2d');drawSerJonathanRider(300,520,4,{gallop:0,lean:0});return c.toDataURL();}finally{g=old}})()`);
 const mountedPng=Buffer.from(mounted.split(',')[1],'base64');fs.writeFileSync(out+'/mounted-regression.png',mountedPng);
 if(fs.existsSync('output/jonathan-match/mounted-before.png')){
  const a=createCanvas(600,600),b=createCanvas(600,600),ag=a.getContext('2d'),bg=b.getContext('2d');
  ag.drawImage(await loadImage('output/jonathan-match/mounted-before.png'),0,0);bg.drawImage(await loadImage(mountedPng),0,0);
  const old=ag.getImageData(0,0,600,600).data,now=bg.getImageData(0,0,600,600).data;let changed=0;
  for(let i=0;i<old.length;i+=4)if(old.slice(i,i+4).some((v,k)=>v!==now[i+k])){
   const x=i/4%600,y=Math.floor(i/4/600);assert(x>=265&&x<=335&&y>=265&&y<=287,'Mounted change outside removed belt');changed++;
  }
  assert(changed>0,'Mounted belt removal must be visible');
 }
 await p.screenshot({path:out+'/model-board.png',fullPage:true});
 for(const view of ['grayscale','silhouette']){await p.selectOption('#model-view',view);await p.screenshot({path:out+'/model-'+view+'.png',fullPage:true});}
 await p.selectOption('#model-view','color');await p.setViewportSize({width:390,height:844});await p.screenshot({path:out+'/model-board-phone.png',fullPage:true});
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await p.goto(url+'?artlab=1');await p.waitForFunction(()=>window.KRArtLab&&document.documentElement.dataset.artLabReady==='1');
 await p.evaluate(()=>{KRArtLab.setOptions({playing:false});KRArtLab.renderAt(0,false)});
 const refs=await p.locator('.art-card').evaluateAll(ns=>ns.filter(n=>['knight','smith','seated-merchant'].includes(n.dataset.model)).map(n=>({id:n.dataset.model,url:n.querySelector('canvas').toDataURL()})));
 const poses=await run(`(()=>{const saved=g,items=[];try{for(const facing of ['front','back'])for(const sit of [0,.5,1]){const c=document.createElement('canvas');c.width=260;c.height=320;g=c.getContext('2d');KRJonathan.draw(130,298,2.5,{facing,sit,clock:0});items.push({id:facing+' sit '+sit,url:c.toDataURL()});}}finally{g=saved}return items;})()`);
 const sheet=createCanvas(840,1065),sg=sheet.getContext('2d');sg.fillStyle='#26343e';sg.fillRect(0,0,840,1065);
 for(const [i,r] of [...refs,...poses].entries()){const x=i%3*280,y=Math.floor(i/3)*355;sg.drawImage(await loadImage(r.url),x+10,y+30,260,300);sg.fillStyle='#dce6ec';sg.font='16px sans-serif';sg.fillText(r.id,x+10,y+22);}fs.writeFileSync(out+'/reference-comparison.png',sheet.toBuffer('image/png'));
 await p.goto(url+'?discolab=1');await p.waitForFunction(()=>window.KRSunlitForest);
 await run('paused=true');
 const state=await run('JSON.stringify([gold,scrap,player.currentHealthUnits,discoGame])');
 for(const dir of ['left','right','up','down'])for(const k of [0,.5,1])await run(`g.save();g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cvs.width,cvs.height);drawDiscoPlayer(150,230,1.4,'${dir}',${k},0);g.restore()`);
 assert.equal(await run('JSON.stringify([gold,scrap,player.currentHealthUnits,discoGame])'),state,'Drawing mutates gameplay');
 await run("paused=false;startDiscoDance();render()");await p.screenshot({path:out+'/disco-phone.png'});
 await run("startBouldering('forest','minigames');beginBoulderingRun();boulderGame.displayY=420;render()");await p.screenshot({path:out+'/climbing-phone.png'});
 for(const direction of [-1,0,1])for(const moveK of [0,.5,1])await run(`drawClimbingKnightRig(200,200,1.2,CHARS[0],{direction:${direction},moveK:${moveK}})`);
 await p.setViewportSize({width:900,height:1000});await run('resize();render()');await p.screenshot({path:out+'/climbing-desktop.png'});
 for(const width of [390,900]){
  await p.setViewportSize({width,height:width===390?844:1000});await run('resize()');
  for(const [name,start] of [['joust','startJoust();beginJoustHold();joustGame.elapsed=2'],['duel','startSwordDuel();beginSwordDuelRun()'],['pickpocket','startPickpocket();beginPickpocketRun();pickpocketGame.handReach=.8'],['punch','startPunchBag()']]){
   await run(start+';render()');await p.screenshot({path:out+'/'+name+'-'+width+'.png'});
  }
 }
 for(const fall of [0,.5,1])await run(`drawSideJoustKnight(200,450,1,1,{rigId:'ser_jonathan'},${fall},-1);drawSwordFighter(200,450,1,1,{rigId:'ser_jonathan'},'draw',${fall})`);
 const profiles=await run(`(()=>{const old=g,c=document.createElement('canvas');c.width=840;c.height=460;try{g=c.getContext('2d');g.fillStyle='#24333e';g.fillRect(0,0,840,460);KRJonathan.side(140,405,3.2);KRJonathan.side(420,405,3.2,{mounted:true});KRJonathan.draw(700,405,3.2,{facing:'back',sit:1,clock:0});return c.toDataURL()}finally{g=old}})()`);
 fs.writeFileSync(out+'/profile-and-rear-seat.png',Buffer.from(profiles.split(',')[1],'base64'));
 await p.goto(url+'?chuglab=1');await p.waitForFunction(()=>window.KRTavernChug&&KREventVisuals.peek('tavern-chug'));
 await run('drinkGame.phase="playing";drinkGame.player.actual=.6;drinkGame.player.lift=1;render()');await p.screenshot({path:out+'/chug-steel.png'});
 assert.deepEqual(errors,[]);console.log('JONATHAN_MODEL_OK front/back lab, mobile layout, reference comparison, dance/climb extremes, pure render, chug steel');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
