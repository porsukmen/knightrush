/* ---------- Blacksmith: heat control, precision shaping, and a decisive quench ---------- */
const FORGE_RULES=Object.freeze({heatStart:.18,heatGain:.43,coolRate:.085,strikeLoss:.052,
  workMin:.48,workMax:.76,softMin:.34,danger:.88,overheat:.98,overheatGrace:.55,
  hits:9,hammerTime:.30,targetRadius:29,quenchMin:.38,quenchMax:.84,
  perfectQuenchMin:.50,perfectQuenchMax:.68,quenchTime:1.05});
const FORGE_START_BTN=Object.freeze({x:140,y:665,w:200,h:50});
const FORGE_BELLOWS_RECT=Object.freeze({x:18,y:532,w:142,h:130});
const FORGE_VAT_RECT=Object.freeze({x:329,y:526,w:136,h:138});
const FORGE_BLADE_RECT=Object.freeze({x:137,y:392,w:238,h:94});
const FORGE_TARGET_X=Object.freeze([174,211,248,285,322,351]);
let forgeGame=null;
function nextForgeTarget(previous=-1){
  let next=(rnd()*FORGE_TARGET_X.length)|0;if(next===previous)next=(next+1+((rnd()*(FORGE_TARGET_X.length-1))|0))%FORGE_TARGET_X.length;return next;
}
function startBlacksmith(stageId=biome,returnMode='minigames'){
  forgeGame={stageId:MINIGAME_ARENA_PALETTES[stageId]?stageId:'forest',returnMode,phase:'intro',phaseT:0,
    stage:'heating',heat:FORGE_RULES.heatStart,hits:0,idealHits:0,flaws:0,target:2,hammerT:0,
    impactX:FORGE_TARGET_X[2],impactGood:false,bellowsHeld:false,bellowsPhase:0,bellowsBeat:0,
    overheatT:0,quenchHeat:0,outcome:'',score:0,best:0,feedback:'',feedbackCol:'#e8e2d0'};
  paused=false;pausePhotoMode=false;setMode('blacksmithing');SFX.relic();
}
function leaveBlacksmith(){
  const target=forgeGame&&forgeGame.returnMode||'minigames';endForgeBellowsHold();forgeGame=null;setMode(target);SFX.duck();
}
function beginBlacksmithRun(){
  const f=forgeGame;if(!f)return;const best=f.best||0;
  Object.assign(f,{phase:'playing',phaseT:0,stage:'heating',heat:FORGE_RULES.heatStart,hits:0,
    idealHits:0,flaws:0,target:nextForgeTarget(),hammerT:0,impactX:248,impactGood:false,
    bellowsHeld:false,bellowsPhase:0,bellowsBeat:0,overheatT:0,quenchHeat:0,outcome:'',score:0,best,
    feedback:'HOLD THE BELLOWS - WAKE THE STEEL',feedbackCol:'#ffb45e'});SFX.swipe();
}
function beginForgeBellowsHold(cx,cy,keyboard=false){
  const f=forgeGame;if(mode!=='blacksmithing'||!f||paused||f.phase!=='playing')return false;
  if(!keyboard){const pt=toGame(cx,cy);if(!pointInRect(pt,FORGE_BELLOWS_RECT))return false;}
  f.bellowsHeld=true;f.feedback=f.stage==='quench'?'CAREFUL - THE BLADE IS SHAPED':'PUMPING THE BELLOWS';f.feedbackCol='#ffb45e';SFX.forgeBellows();return true;
}
function endForgeBellowsHold(){if(forgeGame)forgeGame.bellowsHeld=false;}
function forgeHeatQuality(heat){
  if(heat>=FORGE_RULES.workMin&&heat<=FORGE_RULES.workMax)return 'ideal';
  if(heat>=FORGE_RULES.softMin&&heat<FORGE_RULES.danger)return 'workable';return heat<FORGE_RULES.softMin?'cold':'hot';
}
function strikeForgeAt(pt){
  const f=forgeGame;if(!f||f.phase!=='playing'||f.stage!=='forging'||f.hammerT>0)return false;
  const targetX=FORGE_TARGET_X[f.target],hit=pt&&Math.hypot(pt.x-targetX,pt.y-437)<=FORGE_RULES.targetRadius,
    quality=forgeHeatQuality(f.heat);f.impactX=clamp(pt?pt.x:targetX,151,358);f.hammerT=FORGE_RULES.hammerTime;
  if(!hit){f.flaws++;f.impactGood=false;f.feedback='MISSED THE MARK - THE ANVIL OBJECTS';f.feedbackCol='#ff655c';SFX.forgeMiss();shake(2,.10);return false;}
  if(quality==='cold'||quality==='hot'){
    f.flaws++;f.impactGood=false;f.feedback=quality==='cold'?'TOO COLD - THE STEEL REFUSES':'TOO HOT - LET IT BREATHE';f.feedbackCol='#ff655c';SFX.forgeMiss();shake(3,.12);return false;
  }
  const ideal=quality==='ideal';f.hits++;if(ideal)f.idealHits++;else f.flaws+=.35;f.impactGood=true;
  f.heat=Math.max(0,f.heat-FORGE_RULES.strikeLoss);f.feedback=ideal?'CLEAN STRIKE':'WORKABLE - FIND THE GOLD BAND';f.feedbackCol=ideal?'#ffe36a':'#9fd8ff';
  SFX.forgeHit(ideal);burst(f.impactX,430,ideal?'#ffe36a':'#ff9a52',ideal?15:9,ideal?190:130);shake(ideal?4:2,.12);
  if(f.hits>=FORGE_RULES.hits){f.stage='quench';f.target=-1;f.feedback='BLADE SHAPED - QUENCH BEFORE IT BURNS';f.feedbackCol='#7dcfff';SFX.relic();}
  else f.target=nextForgeTarget(f.target);return true;
}
function strikeForgeTarget(){const f=forgeGame;if(!f)return false;return strikeForgeAt({x:FORGE_TARGET_X[Math.max(0,f.target)],y:437});}
function quenchForgeBlade(){
  const f=forgeGame;if(!f||f.phase!=='playing'||f.stage!=='quench')return false;endForgeBellowsHold();f.quenchHeat=f.heat;
  const perfect=f.heat>=FORGE_RULES.perfectQuenchMin&&f.heat<=FORGE_RULES.perfectQuenchMax,safe=f.heat>=FORGE_RULES.quenchMin&&f.heat<=FORGE_RULES.quenchMax;
  f.outcome=perfect?'MASTERWORK':safe?'SERVICEABLE':f.heat>FORGE_RULES.quenchMax?'BRITTLE':'WARPED';
  const heatScore=perfect?25:safe?15:4,shapeScore=Math.round(f.idealHits/FORGE_RULES.hits*60),careScore=Math.max(0,15-Math.round(f.flaws*4));
  f.score=clamp(shapeScore+heatScore+careScore,0,100);f.best=Math.max(f.best,f.score);f.phase='quenching';f.phaseT=0;
  f.feedback=perfect?'THE WATER SINGS':'THE WATER MAKES A CONCERNING NOISE';f.feedbackCol=perfect?'#ffe36a':'#9fd8ff';SFX.forgeQuench();shake(5,.22);return true;
}
function burnForgeBlade(){
  const f=forgeGame;if(!f)return;endForgeBellowsHold();f.outcome='BURNT SLAG';f.score=0;f.phase='result';f.phaseT=0;
  f.feedback='THE STEEL IS AN EXPENSIVE CINDER';f.feedbackCol='#ff655c';SFX.forgeBurn();shake(8,.35);
}
function blacksmithTap(pt){
  const f=forgeGame;if(!f)return;if(pointInRect(pt,MINIGAME_BACK_BTN)){leaveBlacksmith();return;}
  if((f.phase==='intro'||f.phase==='result')&&pointInRect(pt,FORGE_START_BTN)){beginBlacksmithRun();return;}
  if(f.phase!=='playing')return;if(f.stage==='quench'&&pointInRect(pt,FORGE_VAT_RECT)){quenchForgeBlade();return;}
  if(f.stage==='forging'&&pointInRect(pt,FORGE_BLADE_RECT))strikeForgeAt(pt);
}
function updateBlacksmith(dt){
  const f=forgeGame;if(!f)return;f.phaseT+=dt;f.hammerT=Math.max(0,f.hammerT-dt);
  if(f.phase==='playing'){
    if(f.bellowsHeld){f.heat=Math.min(1.08,f.heat+FORGE_RULES.heatGain*dt);const before=f.bellowsBeat;f.bellowsPhase+=dt*4.8;f.bellowsBeat=Math.floor(f.bellowsPhase);if(f.bellowsBeat!==before)SFX.forgeBellows();}
    else f.heat=Math.max(0,f.heat-FORGE_RULES.coolRate*dt);
    if(f.stage==='heating'&&f.heat>=FORGE_RULES.workMin){f.stage='forging';f.target=nextForgeTarget();f.feedback='STEEL READY - STRIKE THE GLOWING MARK';f.feedbackCol='#ffe36a';SFX.relic();}
    if(f.heat>=FORGE_RULES.overheat)f.overheatT+=dt;else f.overheatT=Math.max(0,f.overheatT-dt*2.5);if(f.overheatT>=FORGE_RULES.overheatGrace)burnForgeBlade();
  }else if(f.phase==='quenching'&&f.phaseT>=FORGE_RULES.quenchTime){f.phase='result';f.phaseT=0;}
}
function forgeSteelColor(heat){
  if(heat<.22)return mixCol('#59616a','#9ca4aa',heat/.22);if(heat<.50)return mixCol('#9ca4aa','#c94428',(heat-.22)/.28);
  if(heat<.78)return mixCol('#c94428','#ff9b3d',(heat-.50)/.28);return mixCol('#ff9b3d','#fff4bd',clamp((heat-.78)/.24,0,1));
}
function drawForgeFurnace(){
  g.fillStyle='#252126';g.fillRect(16,180,137,300);g.strokeStyle='#5d4a42';g.lineWidth=8;g.strokeRect(16,180,137,300);
  g.fillStyle='#08080a';g.beginPath();g.moveTo(37,454);g.lineTo(37,277);g.quadraticCurveTo(84,215,132,277);g.lineTo(132,454);g.closePath();g.fill();
  g.fillStyle='#ff4d1f';g.beginPath();g.moveTo(42,449);g.quadraticCurveTo(55,365,74,420);g.quadraticCurveTo(87,328,101,415);g.quadraticCurveTo(119,356,129,449);g.fill();
  g.fillStyle='#ffd65a';g.beginPath();g.moveTo(55,450);g.quadraticCurveTo(72,382,84,434);g.quadraticCurveTo(97,367,115,450);g.fill();
  g.globalAlpha=.6;g.fillStyle='#ff9a3d';for(let i=0;i<10;i++){const x=48+sRnd(i*31)*72,y=250+((perfNow*(55+i*3)+i*67)%185);g.fillRect(x,y,2+(i%2),5);}g.globalAlpha=1;
  g.fillStyle='#453731';g.fillRect(8,459,153,24);g.strokeStyle='#776056';g.strokeRect(8,459,153,24);
}
function drawForgeMaster(){
  const nod=Math.sin(perfNow*1.7)*2;g.save();g.translate(384,315+nod);g.fillStyle='#3a2420';g.beginPath();g.moveTo(-49,27);g.lineTo(47,27);g.lineTo(60,165);g.lineTo(-57,165);g.closePath();g.fill();
  g.fillStyle='#bd7950';g.beginPath();g.arc(0,0,34,0,TAU);g.fill();g.fillStyle='#5b3022';g.beginPath();g.moveTo(-31,7);g.lineTo(0,50);g.lineTo(31,7);g.quadraticCurveTo(0,30,-31,7);g.fill();
  g.strokeStyle='#251716';g.lineWidth=5;g.beginPath();g.moveTo(-18,-4);g.lineTo(-6,-8);g.moveTo(18,-4);g.lineTo(6,-8);g.stroke();g.fillStyle='#2a292e';g.fillRect(-39,-39,78,16);g.fillRect(-27,-62,54,24);
  g.fillStyle='#d7c3a4';g.font='bold 9px monospace';g.textAlign='center';g.fillText('MASTER CINDERS',0,87);g.fillStyle='#ffb45e';g.fillText('JUDGING SILENTLY',0,103);g.restore();
}
function drawForgeArena(){
  const f=forgeGame,p=MINIGAME_ARENA_PALETTES[f&&f.stageId]||MINIGAME_ARENA_PALETTES.forest;g.fillStyle='#100f12';g.fillRect(0,-PAD_TOP,VW,VH+PAD_TOT);
  const glow=g.createRadialGradient(92,330,15,92,330,300);glow.addColorStop(0,'#ff7a2d55');glow.addColorStop(1,'#00000000');g.fillStyle=glow;g.fillRect(0,70,480,600);
  g.fillStyle=shade(p.stoneDark,-8);g.fillRect(0,112,VW,430);g.strokeStyle='#3c3130';g.lineWidth=2;for(let y=120;y<540;y+=34)for(let x=-20+((y/34|0)%2)*28;x<VW;x+=58)g.strokeRect(x,y,58,34);
  g.fillStyle='#211a19';g.fillRect(0,509,VW,245);g.fillStyle='#392821';for(let i=0;i<13;i++)g.fillRect((i*79)%480,535+(i*47)%210,45,5);drawForgeFurnace();drawForgeMaster();
}
function drawForgeAnvil(){
  g.fillStyle='#16191d';g.beginPath();g.moveTo(110,455);g.lineTo(368,455);g.lineTo(391,476);g.lineTo(337,490);g.lineTo(143,490);g.lineTo(89,476);g.closePath();g.fill();
  g.fillStyle='#4a5057';g.beginPath();g.moveTo(91,445);g.lineTo(386,445);g.lineTo(357,468);g.lineTo(126,468);g.closePath();g.fill();g.fillStyle='#24282d';g.fillRect(196,467,91,101);
  g.beginPath();g.moveTo(180,568);g.lineTo(303,568);g.lineTo(337,626);g.lineTo(145,626);g.closePath();g.fill();g.fillStyle='#68717a';g.fillRect(122,449,232,5);
}
function drawForgeBellows(){
  const f=forgeGame,pump=f.bellowsHeld?(Math.sin(f.bellowsPhase*TAU)*.5+.5):.72,top=554+pump*16;g.fillStyle='#121317dd';g.fillRect(11,523,155,147);g.strokeStyle=f.bellowsHeld?'#ff9a3d':'#6c6259';g.lineWidth=3;g.strokeRect(11,523,155,147);
  g.fillStyle='#6b3d2b';g.beginPath();g.moveTo(39,610);g.lineTo(133,610);g.lineTo(122,top);g.lineTo(50,top);g.closePath();g.fill();g.strokeStyle='#b07245';g.lineWidth=5;g.stroke();
  g.fillStyle='#9a6339';g.fillRect(32,top-9,107,12);g.fillRect(33,612,106,11);g.strokeStyle='#d7a56c';g.lineWidth=3;for(let x=53;x<129;x+=23){g.beginPath();g.moveTo(x,top+4);g.lineTo(x-6,606);g.stroke();}
  g.fillStyle='#b9c0c5';g.beginPath();g.moveTo(133,580);g.lineTo(174,570);g.lineTo(174,589);g.lineTo(133,594);g.closePath();g.fill();g.font='bold 11px monospace';g.textAlign='center';g.fillStyle=f.bellowsHeld?'#ffe36a':'#d7d0c2';g.fillText(f.bellowsHeld?'PUMPING':'HOLD BELLOWS',88,649);
}
function drawForgeVat(){
  const f=forgeGame,steam=f.phase==='quenching'?clamp(1-f.phaseT/FORGE_RULES.quenchTime,0,1):0;g.fillStyle='#11151add';g.fillRect(323,517,151,153);g.strokeStyle=f.stage==='quench'&&f.phase==='playing'?'#7dcfff':'#5e6870';g.lineWidth=3;g.strokeRect(323,517,151,153);
  g.fillStyle='#313c44';g.beginPath();g.moveTo(341,562);g.lineTo(457,562);g.lineTo(446,639);g.lineTo(352,639);g.closePath();g.fill();g.strokeStyle='#788892';g.lineWidth=6;g.stroke();
  g.fillStyle='#39758b';g.globalAlpha=.8;g.beginPath();g.ellipse(399,568,57,13,0,0,TAU);g.fill();g.globalAlpha=1;
  if(steam>0){g.strokeStyle='#dffaff';g.lineWidth=7;g.globalAlpha=steam;for(let i=0;i<7;i++){const x=359+i*13,y=554-((perfNow*70+i*27)%90);g.beginPath();g.moveTo(x,560);g.bezierCurveTo(x-13,y+60,x+15,y+30,x-4,y);g.stroke();}g.globalAlpha=1;}
  g.font='bold 11px monospace';g.textAlign='center';g.fillStyle=f.stage==='quench'&&f.phase==='playing'?'#9feaff':'#b9c4ca';g.fillText(f.stage==='quench'?'TAP TO QUENCH':'QUENCH VAT',399,657);
}
function drawForgeBladeAndTongs(){
  const f=forgeGame,shape=clamp(f.hits/FORGE_RULES.hits,0,1),q=f.phase==='quenching'?easeOut(clamp(f.phaseT/.72,0,1)):0;g.save();g.translate(q*149,q*130);g.translate(250,440);g.rotate(q*.78);g.translate(-250,-440);
  g.strokeStyle='#1b1d20';g.lineWidth=11;g.lineCap='round';g.beginPath();g.moveTo(23,430);g.lineTo(154,437);g.moveTo(24,466);g.lineTo(154,443);g.stroke();g.strokeStyle='#687078';g.lineWidth=3;g.beginPath();g.moveTo(27,430);g.lineTo(153,437);g.moveTo(27,466);g.lineTo(153,443);g.stroke();
  g.fillStyle='#17191c';g.fillRect(139,426,23,31);g.strokeStyle='#8a9399';g.lineWidth=4;g.strokeRect(139,426,23,31);
  const cy=439,top=lerp(421,429,shape),bottom=lerp(457,449,shape),tipX=lerp(345,374,shape),col=forgeSteelColor(f.heat);g.shadowColor=f.heat>.35?col:'#0000';g.shadowBlur=f.heat>.35?12+f.heat*18:0;
  g.fillStyle=col;g.beginPath();g.moveTo(156,top);g.lineTo(323,top+shape*3);g.lineTo(tipX,cy);g.lineTo(323,bottom-shape*3);g.lineTo(156,bottom);g.closePath();g.fill();g.shadowBlur=0;g.strokeStyle=shade(col,-45);g.lineWidth=3;g.stroke();
  g.strokeStyle='#fff6d0';g.globalAlpha=clamp((f.heat-.45)*1.8,0,.75);g.lineWidth=2;g.beginPath();g.moveTo(168,top+5);g.lineTo(321,top+7);g.stroke();g.globalAlpha=1;
  if(f.phase==='playing'&&f.stage==='forging'&&f.target>=0){const tx=FORGE_TARGET_X[f.target],pulse=.5+.5*Math.sin(perfNow*8);g.strokeStyle='#fff3a1';g.lineWidth=3;g.beginPath();g.arc(tx,cy,18+pulse*7,0,TAU);g.stroke();g.strokeStyle='#ff7b35';g.lineWidth=2;g.beginPath();g.arc(tx,cy,8+pulse*3,0,TAU);g.stroke();g.fillStyle='#fff7c2';g.font='bold 9px monospace';g.textAlign='center';g.fillText('STRIKE',tx,cy-31);}g.restore();
}
function drawForgeHammer(){
  const f=forgeGame;if(f.phase!=='playing'||f.stage==='heating')return;const active=f.hammerT>0,progress=active?1-f.hammerT/FORGE_RULES.hammerTime:0,swing=active?(progress<.62?easeOut(progress/.62):1-(progress-.62)/.38*.55):0,angle=lerp(-1.05,0,swing),x=active?f.impactX:FORGE_TARGET_X[Math.max(0,f.target)];
  g.save();g.translate(x,325);g.rotate(angle);g.strokeStyle='#251713';g.lineWidth=14;g.lineCap='round';g.beginPath();g.moveTo(0,0);g.lineTo(0,112);g.stroke();g.strokeStyle='#8a5130';g.lineWidth=8;g.beginPath();g.moveTo(0,0);g.lineTo(0,112);g.stroke();g.fillStyle='#25292e';g.fillRect(-34,91,68,35);g.strokeStyle='#090a0c';g.lineWidth=4;g.strokeRect(-34,91,68,35);g.fillStyle='#879199';g.fillRect(-28,96,56,8);g.restore();
  if(active&&progress>.48&&progress<.76){g.globalAlpha=1-Math.abs(progress-.62)/.14;g.fillStyle=f.impactGood?'#fff4bd':'#ff765e';g.beginPath();g.arc(f.impactX,434,24,0,TAU);g.fill();g.globalAlpha=1;}
}
function drawForgeHeatMeter(){
  const f=forgeGame,x=438,y=213,w=24,h=266,marker=y+h*(1-clamp(f.heat,0,1));g.fillStyle='#0a0b0edd';g.fillRect(x-12,y-36,w+24,h+69);g.strokeStyle='#5d6269';g.lineWidth=2;g.strokeRect(x-12,y-36,w+24,h+69);
  const grad=g.createLinearGradient(0,y+h,0,y);grad.addColorStop(0,'#4c5861');grad.addColorStop(.34,'#a83b2c');grad.addColorStop(.58,'#ff7b35');grad.addColorStop(.76,'#ffd45c');grad.addColorStop(1,'#fffbe0');g.fillStyle=grad;g.fillRect(x,y,w,h);
  g.strokeStyle='#7df078';g.lineWidth=3;g.strokeRect(x-3,y+h*(1-FORGE_RULES.workMax),w+6,h*(FORGE_RULES.workMax-FORGE_RULES.workMin));g.fillStyle=f.heat>=FORGE_RULES.overheat?'#ff394e':'#ffffff';
  g.beginPath();g.moveTo(x-9,marker);g.lineTo(x-1,marker-6);g.lineTo(x-1,marker+6);g.fill();g.beginPath();g.moveTo(x+w+9,marker);g.lineTo(x+w+1,marker-6);g.lineTo(x+w+1,marker+6);g.fill();
  g.font='bold 8px monospace';g.textAlign='center';g.fillStyle='#e8e2d0';g.fillText('HEAT',450,y-23);g.fillStyle='#7df078';g.fillText('WORK',450,y+h*(1-FORGE_RULES.workMax)-7);g.fillStyle='#ff655c';g.fillText('BURN',450,y-10);
}
function drawBlacksmithPreview(r){
  g.fillStyle='#241b18';g.fillRect(r.x+3,r.y+3,r.w-6,105);const glow=g.createRadialGradient(r.x+r.w*.3,r.y+62,4,r.x+r.w*.3,r.y+62,55);glow.addColorStop(0,'#ffcf5a');glow.addColorStop(1,'#ff4d1f00');g.fillStyle=glow;g.fillRect(r.x+3,r.y+3,r.w-6,105);
  g.fillStyle='#42484e';g.beginPath();g.moveTo(r.x+18,r.y+73);g.lineTo(r.x+r.w-16,r.y+73);g.lineTo(r.x+r.w-38,r.y+91);g.lineTo(r.x+35,r.y+91);g.closePath();g.fill();
  g.strokeStyle='#382319';g.lineWidth=6;g.beginPath();g.moveTo(r.x+r.w*.68,r.y+16);g.lineTo(r.x+r.w*.56,r.y+72);g.stroke();g.fillStyle='#70777c';g.fillRect(r.x+r.w*.48,r.y+17,r.w*.28,13);
  g.fillStyle='#ff9a3d';g.shadowColor='#ff5a24';g.shadowBlur=10;g.beginPath();g.moveTo(r.x+27,r.y+66);g.lineTo(r.x+r.w-34,r.y+66);g.lineTo(r.x+r.w-18,r.y+72);g.lineTo(r.x+27,r.y+77);g.closePath();g.fill();g.shadowBlur=0;g.fillStyle='#ffe36a';g.font='bold 9px monospace';g.textAlign='center';g.fillText('CLANG!',r.x+r.w/2,r.y+101);
}
function drawBlacksmithGame(){
  const f=forgeGame;if(!f)return;drawForgeArena();drawForgeAnvil();drawForgeBellows();drawForgeVat();drawForgeBladeAndTongs();drawForgeHammer();drawForgeHeatMeter();
  g.fillStyle='#05070ccc';g.fillRect(MINIGAME_BACK_BTN.x,MINIGAME_BACK_BTN.y,MINIGAME_BACK_BTN.w,MINIGAME_BACK_BTN.h);g.strokeStyle='#8b8fa0';g.lineWidth=2;g.strokeRect(MINIGAME_BACK_BTN.x,MINIGAME_BACK_BTN.y,MINIGAME_BACK_BTN.w,MINIGAME_BACK_BTN.h);g.font='bold 14px monospace';g.fillStyle='#e8e2d0';g.textAlign='center';g.fillText('< BACK',62,77);
  g.fillStyle='#05070ccc';g.fillRect(PAUSE_BTN.x,PAUSE_BTN.y+uiTop,PAUSE_BTN.w,PAUSE_BTN.h);g.strokeStyle='#8b8fa0';g.strokeRect(PAUSE_BTN.x,PAUSE_BTN.y+uiTop,PAUSE_BTN.w,PAUSE_BTN.h);g.fillStyle='#e8e2d0';g.font='bold 15px monospace';g.fillText('II',PAUSE_BTN.x+19,PAUSE_BTN.y+uiTop+25);
  g.fillStyle='#090b0ee8';g.fillRect(136,85,208,84);g.strokeStyle='#ff9a3d';g.lineWidth=2;g.strokeRect(136,85,208,84);g.font='bold 11px monospace';g.fillStyle='#d7d0c2';g.fillText('BLADE SHAPE',240,108);
  for(let i=0;i<FORGE_RULES.hits;i++){g.fillStyle=i<f.hits?(i<f.idealHits?'#ffe36a':'#ff9a52'):'#34383e';g.fillRect(166+i*17,122,12,13);}g.font='bold 9px monospace';g.fillStyle='#aeb5bd';g.fillText('FLAWS '+Math.ceil(f.flaws),240,156);
  if(f.phase==='intro'){
    g.fillStyle='#080a0ef2';g.fillRect(27,454,426,196);g.strokeStyle='#ff9a3d';g.lineWidth=3;g.strokeRect(27,454,426,196);g.font='bold 25px monospace';g.fillStyle='#ffe36a';g.fillText('MASTER CINDERS',240,489);g.font='10px monospace';g.fillStyle='#e8e2d0';g.fillText('1. Hold the bellows and heat steel into the green band.',240,522);g.fillText('2. Strike each glowing mark to shape the blade.',240,547);g.fillText('3. Keep the heat alive between hammer blows.',240,572);g.fillStyle='#9feaff';g.fillText('When finished, tap the water before the steel burns.',240,600);
    g.fillStyle='#35251d';g.fillRect(FORGE_START_BTN.x,FORGE_START_BTN.y,FORGE_START_BTN.w,FORGE_START_BTN.h);g.strokeStyle='#ffe36a';g.strokeRect(FORGE_START_BTN.x,FORGE_START_BTN.y,FORGE_START_BTN.w,FORGE_START_BTN.h);g.font='bold 16px monospace';g.fillStyle='#ffe36a';g.fillText('LIGHT THE FORGE',240,696);
  }else if(f.phase==='playing'){
    g.fillStyle='#080a0ee8';g.fillRect(163,675,274,55);g.strokeStyle=f.feedbackCol;g.lineWidth=2;g.strokeRect(163,675,274,55);g.font='bold 10px monospace';g.fillStyle=f.feedbackCol;g.fillText(f.feedback,300,698);g.font='8px monospace';g.fillStyle='#d7d0c2';g.fillText(f.stage==='heating'?'HOLD BELLOWS':f.stage==='quench'?'TAP THE WATER VAT':'TAP THE GLOWING STRIKE MARK',300,717);
    if(f.heat>=FORGE_RULES.danger){g.fillStyle='#ff3b2f';g.globalAlpha=.12+.08*Math.sin(perfNow*12);g.fillRect(0,-PAD_TOP,VW,VH+PAD_TOT);g.globalAlpha=1;}
  }else if(f.phase==='quenching'){
    g.fillStyle='#dffaff';g.globalAlpha=.10+Math.sin(perfNow*18)*.04;g.fillRect(0,-PAD_TOP,VW,VH+PAD_TOT);g.globalAlpha=1;g.font='bold 23px monospace';g.fillStyle='#dffaff';g.fillText('HISSSSSSS!',240,704);
  }else if(f.phase==='result'){
    g.fillStyle='#080a0ef4';g.fillRect(37,482,406,166);g.strokeStyle=f.outcome==='MASTERWORK'?'#ffe36a':f.outcome==='BURNT SLAG'?'#ff655c':'#9fd8ff';g.lineWidth=3;g.strokeRect(37,482,406,166);g.font='bold 27px monospace';g.fillStyle=f.outcome==='MASTERWORK'?'#ffe36a':f.outcome==='BURNT SLAG'?'#ff655c':'#9fd8ff';g.fillText(f.outcome,240,522);g.font='bold 20px monospace';g.fillStyle='#f2eee5';g.fillText('FORGE SCORE  '+f.score,240,556);g.font='10px monospace';g.fillStyle='#d7d0c2';g.fillText('Clean strikes: '+f.idealHits+' / '+FORGE_RULES.hits+'   Quench heat: '+Math.round(f.quenchHeat*100)+'%',240,585);g.fillStyle='#ffb184';g.fillText(f.outcome==='MASTERWORK'?'Master Cinders almost smiles. Almost.':f.outcome==='BURNT SLAG'?'This is technically still metal.':'A sword has occurred. Congratulations.',240,614);
    g.fillStyle='#35251d';g.fillRect(FORGE_START_BTN.x,FORGE_START_BTN.y,FORGE_START_BTN.w,FORGE_START_BTN.h);g.strokeStyle='#ffe36a';g.strokeRect(FORGE_START_BTN.x,FORGE_START_BTN.y,FORGE_START_BTN.w,FORGE_START_BTN.h);g.font='bold 16px monospace';g.fillStyle='#ffe36a';g.fillText('FORGE AGAIN',240,696);
  }
}
