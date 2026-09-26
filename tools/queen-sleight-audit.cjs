const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage({viewport:{width:1600,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>requestAnimationFrame=()=>0);await p.goto('file:///C:/Users/Altar/Desktop/knight%20rush/KnightRush.html?queenlab=1');await p.waitForFunction(()=>window.KRRoyalShuffle&&KREventVisuals.peek('royal-shuffle'));
 const report=await p.evaluate(()=>{
  const c=document.createElement('canvas');c.width=1500;c.height=1200;c.id='sleight-strip';c.style.cssText='position:fixed;left:0;top:0;z-index:2147483647;width:1500px;height:720px';document.body.appendChild(c);
  const ctx=c.getContext('2d'),saved=g,rows=[];
  try{for(const [row,kind]of KRRoyalShuffleRules.tricks.entries()){
   const s=KRRoyalShuffleRules.create(1234567);s.pocketHand=0;s.trickOrder=[kind,...KRRoyalShuffleRules.tricks.filter(k=>k!==kind)];KRRoyalShuffleRules.begin(s);
   while(KRRoyalShuffleRules.activeMove(s)?.kind!==kind)KRRoyalShuffleRules.update(s,1/240);
   const m=KRRoyalShuffleRules.activeMove(s),samples=[.12,.32,.52,.68,.87];let maxRig=0;
   for(let t=0;t<=1;t+=.005){s.phaseT=m.reachTime+t*m.motionTime;for(const a of KRRoyalShuffle.pose(s).arms)maxRig=Math.max(maxRig,Math.abs(Math.hypot(...a.elbow.map((v,i)=>v-a.shoulder[i]))-a.upper),Math.abs(Math.hypot(...a.elbow.map((v,i)=>v-a.wrist[i]))-a.lower));}
   for(const [col,u]of samples.entries()){
    s.phaseT=m.reachTime+u*m.motionTime;const before=JSON.stringify(s);const tile=document.createElement('canvas');tile.width=480;tile.height=350;g=tile.getContext('2d');g.translate(0,-205);KRRoyalShuffle.world(s);ctx.drawImage(tile,col*300,row*240+22,300,218);ctx.fillStyle='#fff';ctx.font='14px monospace';ctx.fillText(kind+' '+u,col*300+8,row*240+16);if(before!==JSON.stringify(s))throw Error('render mutation');
   }
   rows.push({kind,maxRig});
  }}finally{g=saved;}
  return rows;
 });
 for(const row of report)assert(row.maxRig<1e-7,JSON.stringify(row));
 await p.locator('#sleight-strip').screenshot({path:'output/royal-shuffle/sleight-contact-sheet.png'});await p.locator('#sleight-strip').evaluate(e=>e.remove());
 for(const phone of [false,true]){
  await p.setViewportSize(phone?{width:390,height:844}:{width:775,height:1000});
  await p.evaluate(()=>{paused=false;pausePhotoMode=false;findQueenGame=KRRoyalShuffleRules.create(1234567);findQueenGame.pocketHand=0;findQueenGame.trickOrder=['doubleLift','handoff','falseDrop'];KRRoyalShuffleRules.begin(findQueenGame);while(KRRoyalShuffleRules.activeMove(findQueenGame)?.kind!=='doubleLift')KRRoyalShuffleRules.update(findQueenGame,1/240);const m=KRRoyalShuffleRules.activeMove(findQueenGame);findQueenGame.phaseT=m.reachTime+.52*m.motionTime;render();});
  await p.locator('#game').screenshot({path:`output/royal-shuffle/${phone?'phone':'desktop'}-double-lift.png`});
 }
 assert.deepEqual(errors,[]);console.log({report,errors});
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
