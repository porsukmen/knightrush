// One-time, bounded mechanical transplant. Never replaces the host game.
// Source sections are kept verbatim; host integration remains explicit below.
const fs=require('node:fs');
const source=fs.readFileSync('KnightRushMinigame.html','utf8').replace(/\r\n/g,'\n');
let host=fs.readFileSync('KnightRush.html','utf8').replace(/\r\n/g,'\n');
if(host.includes('class MinigameDefinition'))throw Error('Already imported');
function section(from,to){const start=source.indexOf(from),end=source.indexOf(to,start+from.length);
  if(start<0||end<0)throw Error('Source section missing: '+from);return source.slice(start,end);}
function replace(before,after){if(host.split(before).length!==2)throw Error('Non-unique host anchor: '+before.slice(0,90));host=host.replace(before,after);}
const block=section('/* ============================== MINIGAMES','/* ---------- menus, cinematics, overlays ---------- */');
const sounds=section('    danceBeat(accent=false){','    dead(){');
replace('    dead(){',sounds+'    dead(){');
const constants=section('const MENU_RELIC_BTN=', 'const MENU_QUIT_BTN=')+
  section('const MINIGAME_BACK_BTN=', 'const BEAR_MOUTH_BTN=');
replace('const PAUSE_BTN={x:VW-52,y:100,w:38,h:38};', 'const PAUSE_BTN={x:VW-52,y:100,w:38,h:38};\n'+constants);
const actions=section("  if(mode==='discodance'){\n", "  if(a==='tap'&&pt&&activeBearTurntableLab()");
const keys=section("  if(mode==='jousting'&&(e.key===", '  const a=map[e.key];');
const enter=section("  if(e.key==='Enter'&&mode==='discodance'){", "  if(e.key==='Enter'&&GAMEPLAY_MODES.includes(mode))");
const updates=section("  if(mode==='discodance'){updateDiscoDance(dt);return;}", '\n\n  updatePlayer(dt);');
const draws=section("    else if(mode==='discodance') drawDiscoDance();", "    else if(mode==='changelog')");
const entries=[...draws.matchAll(/mode==='([^']+)'\) (\w+)\(\);/g)].map(m=>[m[1],m[2]]);
const updateEntries=[...updates.matchAll(/mode==='([^']+)'\)\{(\w+)\(dt\);return;\}/g)].map(m=>[m[1],m[2]]);
if(entries.length!==19||updateEntries.length!==19)throw Error('Expected nineteen modes');
const bindings=entries.map(([mode,draw],i)=>`  ['${mode}',{draw:${draw},update:${updateEntries[i][1]}}]`).join(',\n');
const adapter=`
/* Minigame host adapter: do not route these gestures into runner/parry input. */
const MINIGAME_MODES=new Map([\n${bindings}\n]);
GAMEPLAY_MODES.push(...MINIGAME_MODES.keys());
function handleMinigameAction(a,pt){
  if(mode==='minigames'){
    if(a==='tap'&&pt)minigamesMenuTap(pt);
    else if(a==='up'||a==='down')scrollMinigamesMenu(a==='up'?-236:236);
    return true;
  }
${actions.replace(/return;/g,'return true;')}
  return false;
}
function handleMinigameKeyDown(e){
  if(paused||settingsOpen)return false;
  if(e.key==='Escape'&&mode==='minigames'){closeMinigamesMenu();e.preventDefault();return true;}
${keys.replace(/return;/g,'return true;')}
${enter.replace(/return;/g,'return true;')}
  if(mode==='punchbag'&&e.key===' '){e.preventDefault();if(!e.repeat)throwPunch();return true;}
  return false;
}
const MINIGAME_POINTER_BINDINGS=[
  ['minigameScroll',beginMinigamesMenuScroll,moveMinigamesMenuScroll,endMinigamesMenuScroll],
  ['forgeBellows',beginForgeBellowsHold,null,endForgeBellowsHold],
  ['pickpocketHold',beginPickpocketHold,null,endPickpocketHold],
  ['tavernSlideAim',beginTavernSlideAim,moveTavernSlideAim,endTavernSlideAim],
  ['swordStrike',beginSwordPointerStrike,null,null],
  ['drinkTrace',beginDrinkPointerTrace,moveDrinkPointerTrace,endDrinkTrace],
  ['wellAim',beginWellPointerAim,moveWellPointerAim,endWellAim],
  ['knifeFlick',beginKnifePointerFlick,moveKnifePointerFlick,endKnifePointerFlick],
  ['goldPan',beginGoldPanPointer,moveGoldPanPointer,endGoldPanPointer],
  ['lockpickHold',beginLockpickPointerHold,null,endLockpickHold],
  ['joustHold',beginJoustPointerHold,null,endJoustHold]
];
function beginMinigamePointer(x,y){
  if(paused||settingsOpen||(!MINIGAME_MODES.has(mode)&&mode!=='minigames'))return false;
  for(const [flag,begin] of MINIGAME_POINTER_BINDINGS)if(begin(x,y)){
    tStart={x,y,done:true,minigameGesture:flag};return true;
  }
  return false;
}
function moveMinigamePointer(x,y){
  if(!tStart||!tStart.minigameGesture)return false;
  const binding=MINIGAME_POINTER_BINDINGS.find(b=>b[0]===tStart.minigameGesture);
  if(binding&&binding[2]&&!paused&&!settingsOpen)binding[2](x,y);
  return true;
}
function endMinigamePointer(x,y){
  if(!tStart||!tStart.minigameGesture)return false;
  const binding=MINIGAME_POINTER_BINDINGS.find(b=>b[0]===tStart.minigameGesture);
  if(binding&&binding[3]&&!paused&&!settingsOpen)binding[3](x,y);
  clearTapIntent(tStart);tStart=null;return true;
}
function cancelMinigameGestures(){
  endJoustHold();cancelLockpickHold();cancelDrinkTrace();cancelWellAim();
  cancelKnifeFlick();cancelGoldPanGesture();endForgeBellowsHold();
  endPickpocketHold();cancelTavernSlideAim();cancelMinigamesMenuScroll();
  if(tStart&&tStart.minigameGesture){clearTapIntent(tStart);tStart=null;}
}
addEventListener('wheel',e=>{
  if(mode==='minigames'&&!paused&&!settingsOpen){e.preventDefault();scrollMinigamesMenu(e.deltaY*.85);}
},{passive:false});
addEventListener('keyup',e=>{
  if(mode==='jousting'&&(e.key===' '||e.key==='Enter')){endJoustHold();e.preventDefault();}
  if(mode==='lockpicking'&&(e.key===' '||e.key==='Enter')){endLockpickHold();e.preventDefault();}
  if(mode==='blacksmithing'&&e.key===' '){endForgeBellowsHold();e.preventDefault();}
  if(mode==='pickpocketing'&&e.key===' '){endPickpocketHold();e.preventDefault();}
});
`;
replace('/* ---------- menus, cinematics, overlays ---------- */',block+adapter+'\n/* ---------- menus, cinematics, overlays ---------- */');
replace("      else if(pt.x>VW/2-80&&pt.x<VW/2+80&&pt.y>468&&pt.y<510){ setMode('relicdex'); SFX.swipe(); }",
  "      else if(pointInRect(pt,MENU_RELIC_BTN)){setMode('relicdex');SFX.swipe();}\n      else if(pointInRect(pt,MENU_MINIGAMES_BTN)){openMinigamesMenu();}");
replace("  if(a==='tap'&&pt&&activeBearTurntableLab()", "  if(handleMinigameAction(a,pt))return;\n  if(a==='tap'&&pt&&activeBearTurntableLab()");
replace("  if(e.key==='p'||e.key==='P'||e.key==='Escape'){", "  if(handleMinigameKeyDown(e))return;\n  if(e.key==='p'||e.key==='P'||e.key==='Escape'){");
replace('    paused=true; pausePhotoMode=false; return;', '    paused=true; pausePhotoMode=false;cancelMinigameGestures(); return;');
replace('else if(GAMEPLAY_MODES.includes(mode)){paused=true; pausePhotoMode=false;}', 'else if(GAMEPLAY_MODES.includes(mode)){paused=true; pausePhotoMode=false;cancelMinigameGestures();}');
replace('  const levelHold=beginDebugStageHold(t.clientX,t.clientY);', '  if(beginMinigamePointer(t.clientX,t.clientY))return;\n  const levelHold=beginDebugStageHold(t.clientX,t.clientY);');
replace('  mDown=true; const levelHold=beginDebugStageHold(e.clientX,e.clientY);', '  if(beginMinigamePointer(e.clientX,e.clientY)){mDown=true;return;}\n  mDown=true; const levelHold=beginDebugStageHold(e.clientX,e.clientY);');
replace('  if(updateRiderLabDrag(tStart,t.clientX,t.clientY))return;', '  if(moveMinigamePointer(t.clientX,t.clientY))return;\n  if(updateRiderLabDrag(tStart,t.clientX,t.clientY))return;');
replace('  if(updateRiderLabDrag(tStart,e.clientX,e.clientY))return;', '  if(moveMinigamePointer(e.clientX,e.clientY))return;\n  if(updateRiderLabDrag(tStart,e.clientX,e.clientY))return;');
replace('  if(!tStart) return; const t=e.changedTouches[0];', '  if(!tStart) return; const t=e.changedTouches[0];\n  if(endMinigamePointer(t.clientX,t.clientY))return;');
replace('  mDown=false; clearDebugStageHold();', '  mDown=false; clearDebugStageHold();\n  if(endMinigamePointer(e.clientX,e.clientY))return;');
replace("addEventListener('touchcancel',()=>{", "addEventListener('touchcancel',()=>{\n  cancelMinigameGestures();");
replace('function autoPause(){', 'function autoPause(){\n  cancelMinigameGestures();');
replace('  updateScoreShown(dt);', `  updateScoreShown(dt);
  if(mode==='minigames'){updateMinigamesMenuScroll(dt);dist+=dt*6;roadScroll+=dt*6;return;}
  const minigameMode=MINIGAME_MODES.get(mode);
  if(minigameMode){minigameMode.update(dt);return;}`);
replace('const FULLSCREEN_RENDERERS=new Map([', `const FULLSCREEN_RENDERERS=new Map([
  ['minigames',drawMinigamesMenu],
  ...Array.from(MINIGAME_MODES,([id,handlers])=>[id,handlers.draw]),`);
const relicStart='  btnBg(VW/2-80,468,160,42);';
const relicEnd='  btnBg(VW/2-80,524,160,42);';
const old=host.slice(host.indexOf(relicStart),host.indexOf(relicEnd,host.indexOf(relicStart)));
replace(old,section('  btnBg(MENU_RELIC_BTN.x,','  btnBg(MENU_QUIT_BTN.x,'));
new Function(host.match(/<script>([\s\S]*?)<\/script>/)[1]);
fs.writeFileSync('KnightRush.html',host.replace(/\n/g,'\r\n'));
console.log('Imported '+block.split('\n').length+' source lines, 19 minigames and scoped input adapters.');
