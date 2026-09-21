function discoSequence(){
  const sequence=[];
  while(sequence.length<DISCO_RULES.moves){
    const direction=pick(DISCO_DIRECTIONS),n=sequence.length;
    if(n>1&&sequence[n-1]===direction&&sequence[n-2]===direction)continue;
    sequence.push(direction);
  }
  return sequence;
}
function startDiscoDance(stageId=biome,returnMode='minigames'){
  discoGame={stageId:MINIGAME_ARENA_PALETTES[stageId]?stageId:'forest',returnMode,
    phase:'intro',phaseT:0,round:0,wins:0,perfects:0,sequence:[],showCue:-1,
    inputIndex:0,inputBeatCue:0,judgments:[],roundResults:[],message:'',judgeText:'',judgeT:0,
    kingPose:'up',kingPoseT:0,playerPose:null,playerPoseT:0};
  paused=false;pausePhotoMode=false;setMode('discodance');SFX.relic();
}
function leaveDiscoDance(){
  const target=discoGame&&discoGame.returnMode||'minigames';
  discoGame=null;setMode(target);SFX.duck();
}
function beginDiscoRound(){
  if(!discoGame)return;
  Object.assign(discoGame,{phase:'show',phaseT:0,sequence:discoSequence(),showCue:-1,
    inputIndex:0,inputBeatCue:0,judgments:[],message:'WATCH THE KING!',judgeText:'',judgeT:0,
    kingPose:'up',kingPoseT:0,
    playerPose:null,playerPoseT:0});
}
function beginDiscoRun(){
  if(!discoGame)return;
  discoGame.round=0;discoGame.wins=0;discoGame.perfects=0;discoGame.roundResults=[];
  beginDiscoRound();SFX.danceBeat(true);
}
function finishDiscoRound(success,message){
  if(!discoGame||discoGame.phase!=='input')return;
  if(success)discoGame.wins++;
  discoGame.roundResults.push(success);
  discoGame.phase='roundResult';discoGame.phaseT=0;
  discoGame.message=message;discoGame.kingPose=success?'up':'down';discoGame.kingPoseT=.8;
  if(success){SFX.win();flash('#ffe36a',.18);}
  else{SFX.danceBad();shake(4,.24);}
}
function handleDiscoSwipe(direction){
  const d=discoGame;
  if(!d||d.phase!=='input'||!DISCO_DIR_INFO[direction])return false;
  const target=DISCO_RULES.inputLead+d.inputIndex*DISCO_RULES.beat,
    offset=d.phaseT-target,expected=d.sequence[d.inputIndex];
  d.playerPose=direction;d.playerPoseT=.42;
  if(offset<-DISCO_RULES.window){finishDiscoRound(false,'TOO EARLY! THE HORSE PANICKED.');return true;}
  if(direction!==expected){finishDiscoRound(false,'WRONG MOVE! THE KING SAW THAT.');return true;}
  if(offset>DISCO_RULES.window){finishDiscoRound(false,'TOO LATE! EVEN THE TURTLE BOOED.');return true;}
  const perfect=Math.abs(offset)<=.12;
  d.judgments.push({direction,offset,perfect});
  if(perfect)d.perfects++;
  d.inputIndex++;
  SFX.danceGood();
  d.judgeText=perfect?'ROYAL!':'GOOD!';d.judgeT=.42;
  if(d.inputIndex>=d.sequence.length)
    finishDiscoRound(true,'ROUND CLEARED — HIS MAJESTY APPROVES!');
  return true;
}
function updateDiscoDance(dt){
  const d=discoGame;if(!d)return;
  d.phaseT+=dt;d.kingPoseT=Math.max(0,d.kingPoseT-dt);d.playerPoseT=Math.max(0,d.playerPoseT-dt);
  d.judgeT=Math.max(0,(d.judgeT||0)-dt);
  if(d.phase==='show'){
    const cue=Math.min(d.sequence.length-1,Math.floor((d.phaseT-DISCO_RULES.showLead)/DISCO_RULES.beat));
    if(cue>=0&&cue!==d.showCue){
      d.showCue=cue;d.kingPose=d.sequence[cue];d.kingPoseT=DISCO_RULES.beat*.82;
      SFX.danceBeat(cue===0);
    }
    if(d.phaseT>=DISCO_RULES.showLead+d.sequence.length*DISCO_RULES.beat){
      d.phase='ready';d.phaseT=0;d.message='YOUR TURN — SWIPE ON THE BEAT!';d.kingPose='up';
    }
  }else if(d.phase==='ready'){
    if(d.phaseT>=DISCO_RULES.readyTime){
      d.phase='input';d.phaseT=0;d.inputIndex=0;d.inputBeatCue=0;d.message='';
    }
  }else if(d.phase==='input'){
    while(d.inputBeatCue<d.sequence.length&&d.phaseT>=
      DISCO_RULES.inputLead+d.inputBeatCue*DISCO_RULES.beat){
      SFX.danceBeat(d.inputBeatCue===0);d.inputBeatCue++;
    }
    if(d.inputIndex<d.sequence.length&&d.phaseT>
      DISCO_RULES.inputLead+d.inputIndex*DISCO_RULES.beat+DISCO_RULES.window)
      finishDiscoRound(false,'MISSED BEAT! A PEASANT FAINTED.');
  }else if(d.phase==='roundResult'&&d.phaseT>=DISCO_RULES.resultTime){
    d.round++;
    if(d.round>=DISCO_RULES.rounds){
      d.phase='complete';d.phaseT=0;
      d.message=d.wins===3?'PERFECT COURTLY DISCO!':d.wins===2?'A NOBLE GROOVE!':
        d.wins===1?'TECHNICALLY, THAT WAS DANCING.':'BANISHED FROM THE DANCE FLOOR!';
      if(d.wins===3)SFX.win();else SFX.relic();
    }else beginDiscoRound();
  }
}
function discoDanceTap(pt){
  if(!discoGame)return;
  if(pointInRect(pt,MINIGAME_BACK_BTN)){leaveDiscoDance();return;}
  if(discoGame.phase==='intro'&&pointInRect(pt,DISCO_START_BTN)){beginDiscoRun();return;}
  if(discoGame.phase==='complete'){
    if(pointInRect(pt,DISCO_REPLAY_BTN)){beginDiscoRun();return;}
    if(pointInRect(pt,DISCO_EXIT_BTN)){leaveDiscoDance();return;}
  }
}
function drawDiscoArrow(x,y,size,direction,col=null,alpha=1){
  const info=DISCO_DIR_INFO[direction]||DISCO_DIR_INFO.up;
  g.save();g.translate(x,y);g.rotate(info.angle);g.globalAlpha=alpha;
  g.fillStyle=col||info.col;g.beginPath();
  g.moveTo(0,-size);g.lineTo(size*.82,-size*.12);g.lineTo(size*.36,-size*.12);
  g.lineTo(size*.36,size);g.lineTo(-size*.36,size);g.lineTo(-size*.36,-size*.12);
  g.lineTo(-size*.82,-size*.12);g.closePath();g.fill();
  g.fillStyle='#ffffff66';g.fillRect(-size*.16,-size*.70,size*.32,size*.92);
  g.restore();
}
function drawDiscoCrowdMember(x,y,scale,index,cheer){
  const wave=Math.sin(perfNow*6+index*1.7),arm=cheer?wave*5:0,
    tunics=['#8f4c52','#426b70','#766044','#5d4b78'][index%4];
  g.save();g.translate(x,y-Math.abs(wave)*2*cheer);g.scale(scale,scale);
  g.fillStyle='#080a0d66';g.beginPath();g.ellipse(0,3,10,3,0,0,TAU);g.fill();
  g.strokeStyle='#c49a78';g.lineWidth=3;g.lineCap='square';
  g.beginPath();g.moveTo(-5,-14);g.lineTo(-11,-24-arm);g.moveTo(5,-14);g.lineTo(11,-24+arm);g.stroke();
  g.fillStyle=tunics;g.fillRect(-7,-18,14,18);
  g.fillStyle='#b88765';g.fillRect(-5,-27,10,9);
  g.fillStyle=index%3===0?'#8d919b':'#5a3b28';g.fillRect(-6,-29,12,4);
  if(index%3===0){g.fillStyle='#c3c7d0';g.fillRect(-4,-31,8,2);}
  g.fillStyle='#17151a';g.fillRect(-6,0,4,6);g.fillRect(2,0,4,6);
  g.restore();
}
function drawDiscoKing(x,y,scale,direction='up',energy=0){
  const pose=DISCO_DIR_INFO[direction]?direction:(Math.sin(perfNow*4)>0?'left':'right'),
    beat=Math.sin(perfNow/DISCO_RULES.beat*TAU),bounce=Math.abs(beat)*2.2+energy*3,
    lean=pose==='left'?-5:pose==='right'?5:0,crouch=pose==='down'?7:0,jump=pose==='up'?energy*7:0;
  g.save();g.translate(x+lean*scale,y-(bounce+jump)*scale);g.scale(scale,scale);
  g.fillStyle='#00000066';g.beginPath();g.ellipse(-lean,5+bounce+jump,25,6,0,0,TAU);g.fill();
  /* enormous cape, tiny dancing legs, and needlessly royal platform boots */
  g.fillStyle='#4b236f';g.beginPath();g.moveTo(-22,-52);g.lineTo(-29,-8);g.lineTo(28,-8);g.lineTo(21,-52);g.closePath();g.fill();
  g.fillStyle='#7a3fa1';g.fillRect(-25,-47,5,33);g.fillRect(20,-47,5,33);
  const legKick=pose==='left'?-5:pose==='right'?5:0;
  g.fillStyle='#f1c24f';g.fillRect(-14+legKick,-9,10,14-crouch*.3);g.fillRect(4+legKick,-9,10,14-crouch*.3);
  g.fillStyle='#1c1722';g.fillRect(-18+legKick,3-crouch*.3,15,7);g.fillRect(3+legKick,3-crouch*.3,15,7);
  g.fillStyle='#d89e32';g.fillRect(-24,-55+crouch,48,48-crouch);
  g.fillStyle='#f2cf63';g.fillRect(-20,-50+crouch,40,10);g.fillRect(-18,-34+crouch,36,7);
  /* sequins blink on stable positions instead of random crawling */
  const sequin=['#55d9ff','#ff5ac8','#7df078','#ffffff'];
  for(let i=0;i<12;i++){g.globalAlpha=.55+.4*((i+(perfNow*5|0))%3===0);
    g.fillStyle=sequin[i%sequin.length];g.fillRect(-16+(i%4)*10,-47+((i/4)|0)*11+crouch,4,4);}
  g.globalAlpha=1;
  /* arms point with absurd confidence */
  g.strokeStyle='#d89e32';g.lineWidth=8;g.lineCap='square';g.beginPath();
  if(pose==='left'){g.moveTo(-19,-45+crouch);g.lineTo(-38,-47);g.lineTo(-51,-56);g.moveTo(19,-45+crouch);g.lineTo(31,-28);}
  else if(pose==='right'){g.moveTo(19,-45+crouch);g.lineTo(38,-47);g.lineTo(51,-56);g.moveTo(-19,-45+crouch);g.lineTo(-31,-28);}
  else if(pose==='down'){g.moveTo(-19,-43+crouch);g.lineTo(-30,-18);g.moveTo(19,-43+crouch);g.lineTo(30,-18);}
  else{g.moveTo(-19,-45);g.lineTo(-31,-70);g.moveTo(19,-45);g.lineTo(31,-70);}
  g.stroke();
  g.fillStyle='#e4b785';g.fillRect(-10,-68+crouch,20,18);
  g.fillStyle='#fff1c7';g.fillRect(-11,-57+crouch,22,8);             // heroic square beard
  g.fillStyle='#6f431f';g.fillRect(-9,-59+crouch,18,3);             // unreasonable moustache
  g.fillStyle='#11131b';g.fillRect(-10,-66+crouch,9,5);g.fillRect(1,-66+crouch,9,5);
  g.fillStyle='#55d9ff';g.fillRect(-8,-65+crouch,5,2);g.fillRect(3,-65+crouch,5,2);
  /* crown widened into a disco equalizer */
  g.fillStyle='#ffe36a';g.fillRect(-14,-77+crouch,28,10);
  g.beginPath();g.moveTo(-14,-77+crouch);g.lineTo(-12,-88+crouch);g.lineTo(-5,-79+crouch);
  g.lineTo(0,-91+crouch);g.lineTo(6,-79+crouch);g.lineTo(13,-88+crouch);g.lineTo(14,-77+crouch);g.fill();
  g.fillStyle='#ff5ac8';g.fillRect(-2,-80+crouch,4,4);
  g.restore();
}
function drawDiscoArena(){
  const d=discoGame,p=MINIGAME_ARENA_PALETTES[d&&d.stageId]||MINIGAME_ARENA_PALETTES.forest;
  g.fillStyle=p.sky;g.fillRect(0,-PAD_TOP,VW,VH+PAD_TOT);
  g.fillStyle=p.skyBand;g.fillRect(0,132,VW,168);
  /* Same moonlit roadside language as the route, now commandeered by a royal stage. */
  g.fillStyle='#dbe3d2';g.beginPath();g.arc(390,112,43,0,TAU);g.fill();
  g.fillStyle=p.sky;g.beginPath();g.arc(405,100,39,0,TAU);g.fill();
  for(let i=0;i<34;i++){const sx=sRnd(i*19+4)*VW,sy=38+sRnd(i*31+9)*170;
    g.globalAlpha=.25+sRnd(i*13)*.55;g.fillStyle='#d9e7ff';g.fillRect(sx,sy,2,2);}
  g.globalAlpha=1;
  g.fillStyle=p.far;g.fillRect(0,275,VW,VH-275);
  for(let i=0;i<14;i++){
    const x=i*39-22+(i%2)*9,h=70+(i%4)*17;
    g.fillStyle=i%2?p.tree:p.treeLight;g.fillRect(x+15,252-h*.35,9,h);
    g.beginPath();g.moveTo(x,275);g.lineTo(x+20,275-h);g.lineTo(x+43,275);g.fill();
  }
  /* A stolen tournament platform with enchanted stained-stone dance tiles. */
  g.fillStyle=p.stoneDark;g.beginPath();g.moveTo(54,300);g.lineTo(426,300);g.lineTo(490,720);g.lineTo(-10,720);g.closePath();g.fill();
  for(let row=0;row<7;row++){
    const y1=340+row*54,y2=y1+50,spread1=112+row*26,spread2=spread1+24;
    for(let col=0;col<4;col++){
      const xa=VW/2-spread1+col*(spread1*2/4),xb=VW/2-spread1+(col+1)*(spread1*2/4),
        xc=VW/2-spread2+(col+1)*(spread2*2/4),xd=VW/2-spread2+col*(spread2*2/4);
      const pulse=((row+col+(perfNow*2|0))%5===0);
      g.fillStyle=pulse?(col%2?'#a83688':'#238aa6'):((row+col)%2?p.stone:p.stoneDark);
      g.beginPath();g.moveTo(xa,y1);g.lineTo(xb,y1);g.lineTo(xc,y2);g.lineTo(xd,y2);g.closePath();g.fill();
    }
  }
  g.fillStyle='#161019';g.fillRect(74,278,332,38);
  g.fillStyle='#5b3b24';g.fillRect(82,286,316,22);
  g.fillStyle='#ffe36a';g.fillRect(90,290,300,4);
  for(let i=0;i<11;i++)drawDiscoCrowdMember(62+i*36,294,.72,i,true);
  /* The disco ball is a knight's shield on a rope. Nobody has questioned it. */
  g.strokeStyle='#6b6675';g.lineWidth=2;g.beginPath();g.moveTo(VW/2,-PAD_TOP);g.lineTo(VW/2,88);g.stroke();
  g.fillStyle='#cdd6e5';g.beginPath();g.arc(VW/2,105,18,0,TAU);g.fill();
  g.strokeStyle='#6b7180';g.lineWidth=1;
  for(let q=-12;q<=12;q+=8){g.beginPath();g.moveTo(VW/2+q,90);g.lineTo(VW/2+q,120);g.stroke();}
  g.beginPath();g.moveTo(VW/2-17,105);g.lineTo(VW/2+17,105);g.stroke();
  const ray=.35+.25*Math.sin(perfNow*5);g.globalAlpha=ray;
  g.fillStyle=p.accent;g.beginPath();g.moveTo(228,116);g.lineTo(82,350);g.lineTo(126,350);g.closePath();g.fill();
  g.fillStyle='#ff5ac8';g.beginPath();g.moveTo(252,116);g.lineTo(400,350);g.lineTo(438,350);g.closePath();g.fill();g.globalAlpha=1;
}
function drawDiscoSequenceStrip(){
  const d=discoGame;if(!d||!d.sequence.length)return;
  const y=138;
  for(let i=0;i<d.sequence.length;i++){
    const x=100+i*70,shown=d.phase!=='show'||i<=d.showCue,
      active=d.phase==='show'&&i===d.showCue,done=d.phase==='input'&&i<d.inputIndex;
    g.fillStyle=done?'#244b31':active?'#5b4320':'#111520cc';g.fillRect(x-25,y-25,50,50);
    g.strokeStyle=shown?DISCO_DIR_INFO[d.sequence[i]].col:'#555866';g.lineWidth=active?4:2;g.strokeRect(x-25,y-25,50,50);
    if(shown)drawDiscoArrow(x,y,14,d.sequence[i],null,done?.45:1);
    else{g.fillStyle='#6d7180';g.font='bold 20px monospace';g.textAlign='center';g.fillText('?',x,y+7);}
  }
}
function drawDiscoHighway(){
  const d=discoGame;if(!d||d.phase!=='input')return;
  const left=102,laneW=69,hitY=574,topY=210;
  g.fillStyle='#070910aa';g.beginPath();g.moveTo(164,topY);g.lineTo(316,topY);g.lineTo(402,608);g.lineTo(78,608);g.closePath();g.fill();
  for(let lane=0;lane<4;lane++){
    const x=left+lane*laneW;
    g.strokeStyle='#ffffff18';g.lineWidth=1;g.beginPath();g.moveTo(190+lane*34,topY);g.lineTo(x,608);g.stroke();
    drawDiscoArrow(x,hitY,18,DISCO_LANES[lane],'#ffffff',.22);
  }
  g.strokeStyle='#ffe36a';g.lineWidth=3;g.beginPath();g.moveTo(76,598);g.lineTo(404,598);g.stroke();
  for(let i=d.inputIndex;i<d.sequence.length;i++){
    const target=DISCO_RULES.inputLead+i*DISCO_RULES.beat,
      progress=1-(target-d.phaseT)/DISCO_RULES.inputLead;
    if(progress<-.05||progress>1.18)continue;
    const direction=d.sequence[i],lane=DISCO_LANES.indexOf(direction),x=left+lane*laneW,
      y=lerp(topY,hitY,clamp(progress,0,1));
    g.fillStyle='#00000099';g.beginPath();g.arc(x+3,y+4,25,0,TAU);g.fill();
    drawDiscoArrow(x,y,20,direction);
  }
}
function drawDiscoRoundPips(){
  const d=discoGame;g.textAlign='center';g.font='bold 12px monospace';g.fillStyle='#d7d9e2';
  g.fillText('ROYAL SET  '+Math.min(d.round+1,DISCO_RULES.rounds)+' / '+DISCO_RULES.rounds,VW/2,42);
  for(let i=0;i<DISCO_RULES.rounds;i++){
    g.fillStyle=i<d.roundResults.length?(d.roundResults[i]?'#ffe36a':'#6e2935'):(i===d.round?'#ffffff':'#4b4e59');
    g.beginPath();g.arc(VW/2-28+i*28,60,7,0,TAU);g.fill();
  }
}
function drawDiscoDance(){
  const d=discoGame;if(!d)return;
  drawDiscoArena();
  const kingEnergy=d.kingPoseT>0?Math.sin(Math.PI*clamp(d.kingPoseT/.68,0,1)):0;
  drawDiscoKing(VW/2,322,1.05,d.kingPose,kingEnergy);
  if(d.phase!=='intro'&&d.phase!=='complete')drawDiscoRoundPips();
  if(d.phase==='show')drawDiscoSequenceStrip();
  if(d.phase==='input')drawDiscoHighway();
  const pose=d.playerPoseT>0?d.playerPose:null,
    lean=pose==='left'?-1:pose==='right'?1:0,duck=pose==='down'?.8:0,
    air=pose==='up'?.5:0,hop=pose==='up'?20:0;
  drawRider(VW/2,720-hop,.88,{gallop:(perfNow*1.6)%1,rigId:playerChar.rigId,
    feather:playerChar.feather,horse:playerChar.horse,chubby:playerChar.chubby,
    monkey:playerChar.monkey,caveman:playerChar.caveman,lean,duck,air});
  g.fillStyle='#05070ccc';g.fillRect(MINIGAME_BACK_BTN.x,MINIGAME_BACK_BTN.y,MINIGAME_BACK_BTN.w,MINIGAME_BACK_BTN.h);
  g.strokeStyle='#8b8fa0';g.lineWidth=2;g.strokeRect(MINIGAME_BACK_BTN.x,MINIGAME_BACK_BTN.y,MINIGAME_BACK_BTN.w,MINIGAME_BACK_BTN.h);
  g.font='bold 14px monospace';g.fillStyle='#e8e2d0';g.textAlign='center';g.fillText('◄ BACK',62,77);
  g.fillStyle='#05070ccc';g.fillRect(PAUSE_BTN.x,PAUSE_BTN.y+uiTop,PAUSE_BTN.w,PAUSE_BTN.h);
  g.strokeStyle='#8b8fa0';g.strokeRect(PAUSE_BTN.x,PAUSE_BTN.y+uiTop,PAUSE_BTN.w,PAUSE_BTN.h);
  g.fillStyle='#e8e2d0';g.font='bold 18px monospace';g.fillText('Ⅱ',PAUSE_BTN.x+19,PAUSE_BTN.y+uiTop+25);
  if(d.phase==='intro'){
    g.fillStyle='#05070ce8';g.fillRect(30,336,420,348);g.strokeStyle='#ffe36a';g.lineWidth=3;g.strokeRect(30,336,420,348);
    g.font='bold 31px monospace';g.fillStyle='#ffe36a';g.fillText('DISCO KING',VW/2,380);
    g.font='bold 14px monospace';g.fillStyle='#ff5ac8';g.fillText('THE ROYAL SWIPE-OFF',VW/2,407);
    g.font='13px monospace';g.fillStyle='#e8e2d0';
    g.fillText('His Majesty demonstrates 5 sacred moves.',VW/2,458);
    g.fillText('Copy every direction on the glowing beat.',VW/2,482);
    g.fillText('One royal mistake fails that round.',VW/2,506);
    g.fillText('Survive all 3 rounds. Preserve your dignity.',VW/2,530);
    g.fillStyle='#8b8fa0';g.fillText('Swipe or use arrow keys / WASD',VW/2,565);
    g.fillStyle='#281d0d';g.fillRect(DISCO_START_BTN.x,DISCO_START_BTN.y,DISCO_START_BTN.w,DISCO_START_BTN.h);
    g.strokeStyle='#ffe36a';g.lineWidth=3;g.strokeRect(DISCO_START_BTN.x,DISCO_START_BTN.y,DISCO_START_BTN.w,DISCO_START_BTN.h);
    g.font='bold 19px monospace';g.fillStyle='#ffe36a';g.fillText('BEGIN THE GROOVE',VW/2,638);
  }else if(d.phase==='ready'){
    g.fillStyle='#05070cdd';g.fillRect(60,390,360,82);g.strokeStyle='#55d9ff';g.lineWidth=3;g.strokeRect(60,390,360,82);
    g.font='bold 23px monospace';g.fillStyle='#ffffff';g.fillText('YOUR TURN!',VW/2,425);
    g.font='bold 13px monospace';g.fillStyle='#55d9ff';g.fillText('SWIPE WHEN THE NOTES HIT THE LINE',VW/2,452);
  }else if(d.phase==='input'){
    g.font='bold 13px monospace';g.fillStyle='#ffffff';g.fillText('MOVE '+Math.min(d.inputIndex+1,5)+' / 5',VW/2,190);
    if(d.judgeT>0){
      g.globalAlpha=clamp(d.judgeT/.18,0,1);g.font='bold 18px monospace';
      g.fillStyle=d.judgeText==='ROYAL!'?'#ffe36a':'#c0f79a';g.fillText(d.judgeText,VW/2,628);g.globalAlpha=1;
    }
  }else if(d.phase==='roundResult'){
    const ok=d.roundResults[d.roundResults.length-1];
    g.fillStyle='#05070ce8';g.fillRect(38,410,404,90);g.strokeStyle=ok?'#ffe36a':'#ff5b68';g.lineWidth=3;g.strokeRect(38,410,404,90);
    g.font='bold 18px monospace';g.fillStyle=ok?'#ffe36a':'#ff7c86';g.fillText(d.message,VW/2,453);
    g.font='12px monospace';g.fillStyle='#d7d9e2';g.fillText(ok?'The crowd pretends this was rehearsed.':'A bard has already written a cruel song.',VW/2,480);
  }else if(d.phase==='complete'){
    g.fillStyle='#05070cee';g.fillRect(28,348,424,356);g.strokeStyle='#ffe36a';g.lineWidth=3;g.strokeRect(28,348,424,356);
    g.font='bold 26px monospace';g.fillStyle='#ffe36a';g.fillText(d.message,VW/2,397);
    g.font='bold 56px monospace';g.fillStyle=d.wins===3?'#ffe36a':'#e8e2d0';g.fillText(d.wins+' / 3',VW/2,474);
    g.font='13px monospace';g.fillStyle='#aeb2c2';g.fillText('rounds cleared · '+d.perfects+' perfectly timed moves',VW/2,505);
    g.fillStyle='#182818';g.fillRect(DISCO_REPLAY_BTN.x,DISCO_REPLAY_BTN.y,DISCO_REPLAY_BTN.w,DISCO_REPLAY_BTN.h);
    g.strokeStyle='#7df078';g.strokeRect(DISCO_REPLAY_BTN.x,DISCO_REPLAY_BTN.y,DISCO_REPLAY_BTN.w,DISCO_REPLAY_BTN.h);
    g.fillStyle='#7df078';g.font='bold 15px monospace';g.fillText('DANCE AGAIN',148,661);
    g.fillStyle='#211820';g.fillRect(DISCO_EXIT_BTN.x,DISCO_EXIT_BTN.y,DISCO_EXIT_BTN.w,DISCO_EXIT_BTN.h);
    g.strokeStyle='#ff5ac8';g.strokeRect(DISCO_EXIT_BTN.x,DISCO_EXIT_BTN.y,DISCO_EXIT_BTN.w,DISCO_EXIT_BTN.h);
    g.fillStyle='#ff8bd4';g.fillText('LEAVE STAGE',332,661);
  }
}
