const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 for(const phone of [false,true]){
  const ctx=await b.newContext({viewport:phone?{width:390,height:844}:{width:775,height:1000},isMobile:phone,hasTouch:phone});
  const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('file:///C:/Users/Altar/Desktop/knight%20rush/KnightRush.html');
  const run=s=>p.evaluate(s=>(0,eval)(s),s);
  await run('SFX.setTestMuted(true);openMinigamesMenu()');
  const point=async(x,y)=>run(`({x:(${x}*viewScale+viewX)/renderDpr(),y:(${y}*viewScale+viewY)/renderDpr()})`);
  const a=await point(240,610),z=await point(240,360);
  if(phone){const c=await ctx.newCDPSession(p);await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});for(let i=1;i<=10;i++)await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x,y:a.y+(z.y-a.y)*i/10}]});await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  else{await p.mouse.move(a.x,a.y);await p.mouse.wheel(0,160);await p.waitForTimeout(150);assert(await run('minigameMenuScroll>0'));await p.mouse.down();await p.mouse.move(z.x,z.y,{steps:10});await p.mouse.up();}
  await p.waitForTimeout(150);assert(await run('minigameMenuScroll>100'));
  // Render every thumbnail, including Derby in the previously crashing fourth row.
  await run('minigameMenuVelocity=0;for(let y=0;y<=maxMinigameMenuScroll()+150;y+=150){setMinigameMenuScroll(y);render()}');
  await run('setMinigameMenuScroll(170);render()');
  await p.screenshot({path:'output/royal-shuffle/menu-'+(phone?'phone':'desktop')+'-fixed.png'});
  // Real input opens a game after scrolling; no direct start() shortcut.
  const r=await run('(()=>{const i=MINIGAMES.ids.indexOf("find_the_queen"),r=MINIGAME_CARD_RECTS[i];setMinigameMenuScroll(r.y-190);return{x:r.x+r.w/2,y:220}})()'),pt=await point(r.x,r.y);
  if(phone)await p.touchscreen.tap(pt.x,pt.y);else await p.mouse.click(pt.x,pt.y);
  assert.equal(await run('mode'),'findqueen');await run('leaveFindQueen()');assert.equal(await run('mode'),'minigames');
  assert.deepEqual(errors,[]);console.log({device:phone?'phone':'desktop',scroll:true,drag:true,open:true,allPreviews:true,errors});await ctx.close();
 }
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
