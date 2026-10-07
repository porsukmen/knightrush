const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1200,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/KnightRush.html?guardianlab=1&guardiancombo=blender-v9&v=16');
 await page.waitForFunction(()=>window.KRGuardianBlenderV9?.stats().revision===16&&window.KRAncientGuardianEncounter&&typeof boss!=='undefined'&&boss?.definitionId==='ancientguardian',null,{timeout:90000});
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;return KROathkeeperArena.ready();});
 const quick=process.argv.includes('--quick');
 const report=await page.evaluate(quick=>{
  const G=KRGuardianBlenderV9.gameTime,V={...KRGuardianBlenderV9,sample:(t,c)=>KRGuardianBlenderV9.sample(G(t),c)},E=KRAncientGuardianEncounter,D=E.sequenceDriver,dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
  const press=key=>{dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));dispatchEvent(new KeyboardEvent('keyup',{key,bubbles:true}));};
  const center=[],targetLocks=[],stationary=[],routes=[],repeatRoutes=[];let reachError=0,gripError=0,jointGap=0,handStep=0,oldExcursion=0,newExcursion=0,last=null;
  for(let k=429;k<=483;k++){const t=k/60,p=V.sample(t),raw=V.raw(t),w=p.hand.p([-2.8,-63.5,-13.5]);reachError=Math.max(reachError,p.armReachError||0);gripError=Math.max(gripError,dist(p.hand.p([0,-63.5,-13.5]),p.grip));jointGap=Math.max(jointGap,dist(p.upper.p([-19,-55.7,-1.5]),p.forearm.p([-19,-55.7,-1.5])),dist(p.forearm.p([-2.8,-63.5,-13.5]),w));if(last)handStep=Math.max(handStep,dist(w,last));last=w;oldExcursion=Math.max(oldExcursion,raw.grip[0]-45);newExcursion=Math.max(newExcursion,p.grip[0]-45);}
  for(const t of [10.9,11.08,12.1,13.3,16.25]){const p=V.sample(t),h=p.body.p([0,-43,0]),a=Math.PI/18;center.push({t,x:-(h[0]*Math.cos(a)+h[2]*Math.sin(a)),feet:p.legs.map(l=>l.ankle)});}
  for(const lane of [0,1,2]){const ctx={playerLane:lane};V.sample(2.24,ctx);ctx.playerLane=2-lane;V.sample(4,ctx);const first=ctx.guardianV9Targets.first;V.sample(5.05,ctx);const swipe=ctx.guardianV9Targets.swipe;ctx.playerLane=lane;V.sample(9.21,ctx);ctx.playerLane=2-lane;const spike=V.sample(10.1,ctx).spike;for(let i=0;i<5;i++){ctx.playerLane=(lane+i)%3;V.sample(18.45+i*1.05,ctx);ctx.playerLane=(lane+i+1)%3;V.sample(19.2+i*1.05,ctx);}targetLocks.push({lane,first,swipe,spike:spike.lane,five:ctx.guardianV9Targets.five});}
  const swipeContinuity=[0,1,2].map(lane=>{const ctx={playerLane:lane},r={lane,wristStep:0,elbowStep:0,orientationStep:0,reversal:0,jointGap:0};let last=V.sample(6.85,ctx);for(let g=G(6.85)+1/60;g<=G(8.3)+1/60;g+=1/60){const p=KRGuardianBlenderV9.sample(Math.min(g,G(8.3)),ctx);r.wristStep=Math.max(r.wristStep,dist(p.wrist,last.wrist));r.elbowStep=Math.max(r.elbowStep,dist(p.elbow,last.elbow));r.orientationStep=Math.max(r.orientationStep,dist(p.hand.n([1,0,0]),last.hand.n([1,0,0])));r.reversal=Math.max(r.reversal,last.wrist[0]-p.wrist[0]);r.jointGap=Math.max(r.jointGap,dist(p.upper.p([-19,-55.7,-1.5]),p.elbow),dist(p.forearm.p([-2.8,-63.5,-13.5]),p.wrist));last=p;}return r;});
  function run(hz,lane,from,until,route=false,duck=6.3,dodge=.43,repeat=false){
   E.restart();player.x=player.lane=lane;let repeatEntry=null;
   if(repeat){D.seek(boss,G(24.24));update(.1);endPlayerTurn();update(1/hz);const p=boss._sequence.frame.pose,r=V.sample(24.25,{playerLane:lane}),bones=Object.keys(r).filter(k=>r[k]?.p);repeatEntry={source:p.authoredTime,time:boss._sequence.time,turn:boss.enemyTurn,poseGap:Math.max(...bones.map(k=>dist(p[k].p([0,0,0]),r[k].p([0,0,0])))),first:boss._sequence.context.guardianV9Targets.first,five:boss._sequence.context.guardianV9Targets.five.length};}
   if(from)D.seek(boss,G(from));const keys=new Set(),events=[],contacts=[];let spikeSeen=false;
   function once(id,key){if(keys.has(id))return;keys.add(id);press(key);events.push([+boss._sequence.time.toFixed(4),key]);}
   for(let i=0;i<hz*26&&boss._sequence&&boss._sequence.time<G(until)&&player.alive;i++){
    const t=V.authoredTime(boss._sequence.time);
    if(route){
     if(t>=3.1)once('opening',player.lane===2?'ArrowLeft':'ArrowRight');
     if(t>=duck)once('swipe','ArrowDown');
     if(t>=9.4)once('spike',player.lane===0?'ArrowRight':'ArrowLeft');
     if(t>=14.12+player.lane*.06)once('low','ArrowUp');
     for(let j=0;j<5;j++)if(t>=18.45+j*1.05+dodge)once('five'+j,player.lane===2?'ArrowLeft':'ArrowRight');
    }
    const hits=E.state().stats.hits;update(Math.min(1/hz,G(until)-boss._sequence.time));if(E.state().stats.hits>hits)contacts.push({time:t,lane:player.x});spikeSeen ||= !!boss?._sequence?.frame.centerSpike?.height;
   }
   return{hz,lane,from,until,events,contacts,spikeSeen,repeatEntry,...E.state(),resolved:boss?._lastSequence?.resolved||boss?._sequence?.resolved,targets:boss?._sequence?.context.guardianV9Targets};
  }
  for(const hz of (quick?[60]:[30,60,120]))for(const lane of (quick?[2]:[0,1,2])){
   for(const [from,until,kind] of [[0,5,'opening'],[6.86,8.3,'harmless-preparation'],[8.3,8.65,'stab'],[9.21,9.86,'warning'],[9.21,10.6,'eruption'],[13.35,14.14,'low-warning'],[14.15,14.78,'low-sweep'],...[0,1,2,3,4].map(i=>[18.45+i*1.05,19.48+i*1.05,'five-'+(i+1)]),...[1,2,3,4].map(i=>[18.45+i*1.05,18.93+i*1.05,'five-lift-'+i]),[23.7,24.25,'shoulder-recovery']])stationary.push({kind,...run(hz,lane,from,until)});
   let best;for(const duck of [6.0,6.08,5.95,6.15,6.22,6.3]){const r=run(hz,lane,0,26,true,duck);if(!best||r.stats.hits<best.stats.hits)best=r;if(!r.stats.hits)break;}routes.push(best);
   let repeated;for(const duck of [6.0,6.08,5.95,6.15,6.22,6.3]){const r=run(hz,lane,0,26,true,duck,.43,true);if(!repeated||r.stats.hits<repeated.stats.hits)repeated=r;if(!r.stats.hits)break;}repeatRoutes.push(repeated);
  }
  const soles=[10.9,11.08,12.1,16.25,17.65,19.2,20.25,23.4].map(t=>({t,feet:V.sample(t).legs.map(l=>Math.max(...[-3.8,3.8].flatMap(x=>[-6.6,3].map(z=>l.foot.p([l.side*6.5+x,0,z])[1]))))}));
  const boneKeys=Object.keys(V.raw(3.55)).filter(k=>V.raw(3.55)[k]?.p),stance=[],jump={heightError:0,rotationError:0,relativeError:0},seams=[];
  const downstrokeDurations=[[3.8,4.48],...[0,1,2,3,4].map(i=>[18.93+i*1.05,19.47+i*1.05])].map(([a,b],i)=>({seconds:G(b)-G(a),ratio:(G(b)-G(a))/((b-a)*(i?4.5/5.25:1.9/2.24))})),idle=[];
  const finalTiming=[0,1,2,3,4].map(i=>{const start=18.45+i*1.05,find=(source,old=false,lift=false)=>{let a=lift?0:old?.38:.48,b=lift?.48:1.02;for(let k=0;k<40;k++){const m=(a+b)/2,u=(m-.38)/.64,s=old?3.55+.93*u*u*u*(10+u*(-15+6*u)):V.sample(start+m).repeatedOpeningTime;if(lift?s>source:s<source)a=m;else b=m;}return G(start+(a+b)/2);};return{oldHold:find(3.9,true)-G(start+.38),hold:find(3.9)-G(start+.48),oldDescent:find(4,true)-find(3.9,true),previousDescent:(G(start+.82)-G(start+.46))*.1/.16,descent:find(4)-find(3.9),lift:i?find(3.9,false,true)-find(4,false,true):null};});
  const commandTiming={landingToBlade:G(13.35)-G(10.9),recovery:G(12.1)-G(11.2),deadHold:G(12.75)-G(12.1),bladeMotion:G(14.78)-G(13.35)};
  const angularTravel=(a,b)=>{let previous=V.raw(a).weaponDirection,total=0;for(let i=1;i<=600;i++){const direction=V.raw(a+(b-a)*i/600).weaponDirection;total+=Math.acos(Math.max(-1,Math.min(1,direction.reduce((s,v,j)=>s+v*previous[j],0))));previous=direction;}return total;};
  const openingLift={seconds:G(3.55)-G(2.24),radians:angularTravel(2.24,3.55),closingSeconds:G(19.98)-G(19.5),closingRadians:angularTravel(3.55,4.05)};
  const postJumpLift={seconds:G(18.83)-G(18.1),closingSeconds:openingLift.closingSeconds,maxElbowStep:0,maxWristStep:0,coreSteps:[],sourceReversal:0};let previousLift;
  for(let i=0;i<=240;i++){const p=KRGuardianBlenderV9.sample(G(18.1)+postJumpLift.seconds*i/240);if(previousLift){postJumpLift.maxElbowStep=Math.max(postJumpLift.maxElbowStep,dist(p.elbow,previousLift.elbow));postJumpLift.maxWristStep=Math.max(postJumpLift.maxWristStep,dist(p.wrist,previousLift.wrist));postJumpLift.sourceReversal=Math.max(postJumpLift.sourceReversal,(previousLift.postJumpLiftSource||18.1)-(p.postJumpLiftSource||18.83));if(i>48&&i<192)postJumpLift.coreSteps.push(dist(p.wrist,previousLift.wrist));}previousLift=p;}
  const liftContinuity=[];
  for(const lane of [0,1,2])for(let i=1;i<5;i++){
   const start=18.45+i*1.05,ctx={playerLane:lane},r={lane,strike:i+1,maxElbowStep:0,minReach:Infinity,maxReach:0,minBend:Infinity,maxBend:0};let previous;
   for(let g=G(start);g<=G(start+.48);g+=1/240){const p=KRGuardianBlenderV9.sample(g,ctx);if(previous)r.maxElbowStep=Math.max(r.maxElbowStep,dist(p.elbow,previous.elbow));previous=p;
    if(p.repeatedOpeningTime>=3.9&&p.repeatedOpeningTime<=4.05){const reach=dist(p.shoulder,p.wrist),axis=p.wrist.map((v,j)=>(v-p.shoulder[j])/reach),e=p.elbow.map((v,j)=>v-p.shoulder[j]),along=e.reduce((s,v,j)=>s+v*axis[j],0),bend=Math.hypot(...e.map((v,j)=>v-along*axis[j]));r.minReach=Math.min(r.minReach,reach);r.maxReach=Math.max(r.maxReach,reach);r.minBend=Math.min(r.minBend,bend);r.maxBend=Math.max(r.maxBend,bend);}
   }liftContinuity.push(r);
  }
  const singleDescent=[0,1,2,3,4].map(i=>{const s=18.45+i*1.05,ys=[];let maxSource=0;for(let j=0;j<=120;j++){const p=V.sample(s+.48+.57*j/120);ys.push(p.body.p([0,-43,0])[1]);maxSource=Math.max(maxSource,p.repeatedOpeningTime);}return{maxSource,reversal:Math.max(...ys.slice(1).map((y,j)=>ys[j]-y)),endY:ys.at(-1),impactY:V.raw(4.05).body.p([0,-43,0])[1],lateSink:Math.abs(ys.at(-1)-ys[114])};});
  for(const lane of [0,1,2]){const p=V.sample(24.25,{playerLane:lane}),r=V.sample(2.24,{playerLane:lane});idle.push({lane,position:Math.max(...boneKeys.map(k=>dist(p[k].p([0,0,0]),r[k].p([0,0,0])))),rotation:Math.max(...boneKeys.flatMap(k=>[[1,0,0],[0,1,0],[0,0,1]].map(a=>dist(p[k].n(a),r[k].n(a)))))});}
  const turn={duration:G(6.85)-G(4.48),speeds:[],roundTrip:0};
  for(const t of [5.1,5.3,5.5,5.7,5.9,6.1,6.3,6.5]){const a=V.raw(t).torso.n([0,0,1]),b=V.raw(t+.05).torso.n([0,0,1]);let angle=Math.atan2(b[0],b[2])-Math.atan2(a[0],a[2]);while(angle<0)angle+=Math.PI*2;turn.speeds.push(angle*180/Math.PI/(G(t+.05)-G(t)));}
  for(let t=0;t<=24.25;t+=.013)turn.roundTrip=Math.max(turn.roundTrip,Math.abs(V.authoredTime(G(t))-t));
  for(let t=16.8;t<=18.1;t+=1/120){const p=V.sample(t),r=V.raw(t),shift=p.body.p([0,-43,0]).map((x,i)=>x-r.body.p([0,-43,0])[i]);for(const k of boneKeys){jump.heightError=Math.max(jump.heightError,Math.abs(p[k].p([0,0,0])[1]-r[k].p([0,0,0])[1]));jump.rotationError=Math.max(jump.rotationError,dist(p[k].n([0,1,0]),r[k].n([0,1,0])));jump.relativeError=Math.max(jump.relativeError,dist(p[k].p([0,0,0]),r[k].p([0,0,0]).map((x,i)=>x+shift[i])));}}
  for(const lane of [0,1,2])for(let i=0;i<5;i++)for(let j=0;j<=64;j++){const t=18.45+i*1.05+.38+j*.01,p=V.sample(t,{playerLane:lane}),source=p.repeatedOpeningTime??3.55,r=V.sample(source,{playerLane:lane});let position=0,rotation=0;for(const k of boneKeys){position=Math.max(position,dist(p[k].p([0,0,0]),r[k].p([0,0,0])));for(const axis of [[1,0,0],[0,1,0],[0,0,1]])rotation=Math.max(rotation,dist(p[k].n(axis),r[k].n(axis)));}stance.push({t,lane,source,position,rotation});}
  // Clock .38 is now inside the moving return arc, not a stopped overhead pose.
  // Use a smaller epsilon to isolate discontinuities from legitimate motion.
  const finalJoins=[0,1,2,3,4].flatMap(i=>{const s=18.45+i*1.05;return[s,s+.38,s+.48,s+1.02];});
  for(const t of [16.8,17.65,18.1,18.83,...finalJoins,23.7,23.98,24.25]){const a=V.sample(t-1e-6),b=V.sample(t+1e-6);seams.push({t,gap:Math.max(...boneKeys.map(k=>dist(a[k].p([0,0,0]),b[k].p([0,0,0]))))});}
  const finalGeometry={jointGap:0,gripGap:0,legLengthError:0};
  const overhead=[0,1,2,3,4].map(i=>{const p=V.sample(18.93+i*1.05);return{bodyUp:p.body.n([0,-1,0])[1],bladeUp:p.weapon.n([0,1,0])[1],gripAboveHead:p.head.p([0,-83,0])[1]-p.grip[1]};});
  const lowReadability=[13.7,13.95,14.15,14.4].map(t=>{E.restart();D.seek(boss,G(t));const f=boss._sequence.frame,p=f.pose,g=E.project(f,p.grip),a=E.project(f,p.weapon.p([0,-44.28,-13.5]));return{t,gripX:g[0]/VW,baseX:a[0]/VW,warning:p.lowSweepCue?.alpha||0,active:f.hazards.some(h=>h.active)};});
  for(let t=16.8;t<=24.25;t+=1/120){const p=V.sample(t);finalGeometry.jointGap=Math.max(finalGeometry.jointGap,dist(p.upper.p([-19,-55.7,-1.5]),p.forearm.p([-19,-55.7,-1.5])),dist(p.forearm.p([-2.8,-63.5,-13.5]),p.wrist));finalGeometry.gripGap=Math.max(finalGeometry.gripGap,dist(p.hand.p([0,-63.5,-13.5]),p.grip));for(const l of p.legs)finalGeometry.legLengthError=Math.max(finalGeometry.legLengthError,Math.abs(dist(l.hip,l.knee)-17),Math.abs(dist(l.knee,l.ankle)-24));}
  E.restart();D.seek(boss,G(10.1));const time=E.state().time,health=player.currentHealthUnits;paused=true;frame(performance.now());const frozen=E.state().time===time;paused=false;render();render();const pure=health===player.currentHealthUnits;
  E.restart();const restart=boss._sequence.context.guardianV9Targets.first===undefined&&boss._sequence.context.guardianV9Targets.five.length===0;boss.state='break';D.update(boss,.01);const breakClean=!boss._sequence;
  E.restart();player.x=player.lane=1;player.currentHealthUnits=144;for(let i=0;i<600&&player.alive;i++)update(1/120);const death=!player.alive&&!boss._sequence;
  E.restart();D.seek(boss,G(24.24));update(.02);const menuHealth=player.currentHealthUnits;for(let i=0;i<120;i++)update(1/60);const menuSafe=player.currentHealthUnits===menuHealth&&!boss._sequence;
  startBoss('bear');const ordinary=!activeBossSequenceDriver();
  return{duration:V.duration,postJumpLift,openingLift,liftContinuity,commandTiming,singleDescent,finalTiming,downstrokeDurations,idle,turn,jump,seams,lowReadability,swipeContinuity,overhead,finalGeometry,soles,stance,center,targetLocks,reachError,gripError,jointGap,handStep,oldExcursion,newExcursion,stationary,routes,repeatRoutes,frozen,pure,restart,breakClean,death,menuSafe,ordinary};
 },quick);
 fs.mkdirSync('output/guardian-blender-v9/repairs',{recursive:true});fs.writeFileSync(`output/guardian-blender-v9/repairs/${quick?'quick-':''}audit.json`,JSON.stringify({report,errors},null,2));
 console.log(JSON.stringify({duration:report.duration,lowReadability:report.lowReadability,swipeContinuity:report.swipeContinuity,overhead:report.overhead,finalGeometry:report.finalGeometry,routes:report.routes.map(r=>({hz:r.hz,lane:r.lane,hits:r.stats.hits,health:r.health,phase:r.phase})),stationary:report.stationary.map(r=>({hz:r.hz,lane:r.lane,kind:r.kind,hits:r.stats.hits}))},null,2));
 if(!quick)for(const size of [{name:'desktop',width:1200,height:1000},{name:'phone',width:390,height:844}]){await page.setViewportSize(size);for(const t of [4.05,19.23,23.7,23.84,23.98,24.1,24.25]){await page.evaluate(t=>{const E=KRAncientGuardianEncounter;E.restart();E.sequenceDriver.seek(boss,KRGuardianBlenderV9.gameTime(t));flashA=shakeMag=0;floaters.length=0;render();},t);await page.screenshot({path:`output/guardian-blender-v9/repairs/${size.name}-${t}.png`});}await page.evaluate(()=>{const E=KRAncientGuardianEncounter;E.restart();E.sequenceDriver.seek(boss,KRGuardianBlenderV9.gameTime(24.24));update(.1);flashA=shakeMag=0;floaters.length=0;render();});await page.screenshot({path:`output/guardian-blender-v9/repairs/${size.name}-player-idle.png`});}
 assert.deepEqual(errors,[]);assert.ok(report.center.every(r=>Math.abs(r.x)<.002));assert.ok(report.reachError<.01);assert.ok(report.gripError<.02);assert.ok(report.jointGap<.02);
 assert.ok(report.newExcursion<report.oldExcursion*.15);for(const r of report.targetLocks){assert.equal(r.first,r.lane);assert.equal(r.swipe,2-r.lane);assert.equal(r.spike,r.lane);assert.deepEqual(r.five,[0,1,2,3,4].map(i=>(r.lane+i)%3));}
 assert.ok(report.duration<20);assert.ok(report.soles.every(s=>s.feet.every(y=>y<.002)),JSON.stringify(report.soles));assert.ok(report.stance.every(s=>s.position<.005&&s.rotation<.005),JSON.stringify(report.stance.filter(s=>s.position>=.005||s.rotation>=.005)));
 assert.ok(Math.abs(report.turn.duration-1.2)<1e-9&&report.turn.roundTrip<1e-9);assert.ok(Math.min(...report.turn.speeds)/Math.max(...report.turn.speeds)>.88,JSON.stringify(report.turn));
 assert.ok(report.downstrokeDurations.every((d,i)=>Math.abs(d.ratio-1.15/(i?1.32*1.3:1))<1e-9),JSON.stringify(report.downstrokeDurations));assert.ok(report.idle.every(p=>p.position<.00001&&p.rotation<.00001),JSON.stringify(report.idle));
 assert.ok(Math.abs(report.openingLift.radians/report.openingLift.seconds-report.openingLift.closingRadians/report.openingLift.closingSeconds)<1e-8,JSON.stringify(report.openingLift));
 assert.ok(Math.abs(report.postJumpLift.seconds-report.postJumpLift.closingSeconds)<1e-9&&report.postJumpLift.maxElbowStep<1.1&&report.postJumpLift.maxWristStep<1.1&&report.postJumpLift.sourceReversal<1e-8&&Math.min(...report.postJumpLift.coreSteps)>.01,JSON.stringify(report.postJumpLift));
 assert.ok(report.finalTiming.every(p=>p.hold<.2&&Math.abs(p.descent-.224669248859956/1.3)<1e-8&&(p.lift===null||p.lift>p.descent*1.5)),JSON.stringify(report.finalTiming));
 assert.ok(report.liftContinuity.every(p=>p.maxElbowStep<1.1&&p.maxReach-p.minReach<1e-8&&p.maxBend-p.minBend<1e-8),JSON.stringify(report.liftContinuity));
 assert.ok(Math.abs(report.commandTiming.landingToBlade-.765)<1e-9&&Math.abs(report.commandTiming.bladeMotion-1.103125)<1e-9&&Math.abs(report.commandTiming.deadHold-.04)<1e-9,JSON.stringify(report.commandTiming));
 assert.ok(report.singleDescent.every(p=>p.maxSource<=4.05000001&&p.reversal<.005&&Math.abs(p.endY-p.impactY)<.005&&p.lateSink<.005),JSON.stringify(report.singleDescent));
 assert.ok(Object.values(report.jump).every(e=>e<.00001),JSON.stringify(report.jump));assert.ok(report.seams.every(s=>s.gap<(s.t<18.45?.02:.005)),JSON.stringify(report.seams));
 assert.ok(report.finalGeometry.jointGap<.02,JSON.stringify(report.finalGeometry));assert.ok(report.finalGeometry.gripGap<.02);assert.ok(report.finalGeometry.legLengthError<.025);
 assert.ok(report.swipeContinuity.every(r=>r.wristStep<2.1&&r.elbowStep<1.6&&r.orientationStep<.08&&r.reversal<.005&&r.jointGap<.02),JSON.stringify(report.swipeContinuity));assert.ok(report.overhead.every(p=>p.bodyUp<-.99&&p.bladeUp<-.97&&p.gripAboveHead>10),JSON.stringify(report.overhead));
 for(const r of report.lowReadability){assert.ok(r.gripX>.02&&r.gripX<.98&&r.baseX>.02&&r.baseX<.98,JSON.stringify(r));assert.equal(r.warning,0);if(r.t<14.15)assert.equal(r.active,false);}
 for(const r of report.stationary){if(['harmless-preparation','warning','low-warning','shoulder-recovery'].includes(r.kind)||r.kind.startsWith('five-lift-')||(r.kind==='stab'&&r.lane!==0))assert.equal(r.stats.hits,0,JSON.stringify(r));else assert.ok(r.stats.hits>=1,JSON.stringify(r));}
 for(const r of report.routes){assert.equal(r.stats.hits,0,JSON.stringify(r));assert.equal(r.health,576);assert.equal(r.phase,'player');}
 for(const r of report.repeatRoutes){assert.equal(r.stats.hits,0,JSON.stringify(r));assert.equal(r.health,576);assert.equal(r.phase,'player');assert.equal(r.repeatEntry.turn,2);assert.ok(Math.abs(r.repeatEntry.source-2.24)<1e-9);assert.ok(r.repeatEntry.poseGap<1e-8);assert.equal(r.repeatEntry.first,r.lane);assert.equal(r.repeatEntry.five,0);}
 for(const k of ['frozen','pure','restart','breakClean','death','menuSafe','ordinary'])assert.equal(report[k],true,k);
 console.log('GUARDIAN_V9_REPAIRS_OK');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
