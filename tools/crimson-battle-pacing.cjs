const {chromium}=require('playwright'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const label=process.argv[2]||'current',out=path.resolve('output/crimson-battle-pacing',label);
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
try{const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{window.testRAF=requestAnimationFrame.bind(window);window.requestAnimationFrame=()=>0;});
await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);await page.waitForFunction(()=>!!window.KRSunlitForest);
const run=s=>page.evaluate(s=>(0,eval)(s),s);
await run(`Math.random=(()=>{let seed=731;return()=>((seed=Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;})();
roadLabState.direction=0;roadLabState.entry=false;startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.theme==='bloodwood'));godMode=true;
globalThis.testSlot=journeyActiveEdge().events.find(e=>e.definition==='elite_finale');
dist=testSlot.at-.01;roadScroll=dist;for(let i=0;i<10&&mode==='run';i++)update(1/60);render();`);
assert.equal(await run('mode'),'boss');
await page.screenshot({path:path.join(out,'fight.png')});
const data=await run(`(async()=>{
 const names=['update','render','drawBackground','drawCurvedRoadWorld','buildWorldDrawQueue','queueRoadsideWorld','drawJourneyBloodDecor','drawJourneyBloodLair','drawActiveBossWorld','drawPlayer','drawParticles','drawAmbient','drawVignette','drawModeScreen','drawTelegraphs'];
 const saved={},totals={};for(const name of names){const f=(0,eval)(name);saved[name]=f;totals[name]={ms:0,calls:0};globalThis['profile_'+name]=function(...args){const t=performance.now();try{return f(...args);}finally{totals[name].ms+=performance.now()-t;totals[name].calls++;}};(0,eval)(name+'=globalThis.profile_'+name);}
 const frames=[],cpu=[];let last=0;
 try{for(let i=0;i<300;i++){const now=await new Promise(testRAF);if(last&&i>=30)frames.push(now-last);last=now;
  const t=performance.now();update(1/120);render();if(i>=30)cpu.push(performance.now()-t);
 }}finally{for(const name of names){globalThis['restore_'+name]=saved[name];(0,eval)(name+'=globalThis.restore_'+name);}}
 const summary=a=>{a.sort((a,b)=>a-b);return {median:a[a.length>>1],p95:a[Math.floor(a.length*.95)],p99:a[Math.floor(a.length*.99)],max:a.at(-1)};};
 return {cpu:summary(cpu),frames:summary(frames),totals,cache:KRSunlitForest.report(),mode,env,phase:boss.phase,definition:activeBossDefinition().id};
})()`);
await page.screenshot({path:path.join(out,'fight-later.png')});assert.deepEqual(errors,[]);
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(data,null,2));console.log(JSON.stringify(data));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
