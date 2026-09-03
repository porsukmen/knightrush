;globalThis.__squireAudit=(()=>{
  openSkillLab();startSkillLabCombat();
  const resolveAction=()=>{
    let frames=0;
    while(boss.phase==='playerResolve'&&frames++<180){
      updateTurnAction(1/60);boss.playerActionTimer-=1/60;
      if(boss.playerActionTimer<=0)finishPlayerAction();
    }
    return frames;
  };
  const initialSkills=knightTurnSkills(),call=initialSkills.find(skill=>
      (skill.baseId||skill.id)==='call_squire'),
    initialAp=boss.ap,initialResolve=boss.resolve,
    callStarted=performPlayerAction(call),callFrames=resolveAction(),
    called=squire.present&&squire.health===1&&!squire.active,
    callEconomy=boss.ap===initialAp-1&&boss.resolve===initialResolve-1,
    arrivingCommand=knightTurnSkills().find(skill=>(skill.baseId||skill.id)==='call_squire'),
    encourageLockedOnCallTurn=arrivingCommand.squireAction==='ARRIVING'&&
      !turnCommandAvailable(arrivingCommand),
    appearanceAuthored=!!(squire.appearance&&squire.appearance.sword&&
      squire.appearance.shield&&squire.appearance.shield.style==='squire'&&
      Number.isInteger(squire.appearance.shield.pattern));
  let summonRenderSafe=true;
  try{drawPlayer();drawSquire();}catch(error){summonRenderSafe=false;}

  boss.phase='dodge';boss.state='idle';boss.attack=null;boss.hazardLanes=[];
  beginPlayerTurn();
  const activated=squirePartyReady()&&companionProfile().id==='squire',
    encourage=knightTurnSkills().find(skill=>(skill.baseId||skill.id)==='call_squire'),
    encourageStarted=performPlayerAction(encourage),encourageFrames=resolveAction(),
    encouraged=squire.encouragement===1;

  selectTurnActor('ally');
  const profile=squireCombatProfile(),slash=profile.skills.find(skill=>skill.id==='squire_slash'),
    pressure=profile.skills.find(skill=>skill.id==='squire_posture'),hpBeforeSlash=boss.hp,
    apBeforeSlash=boss.ap,slashStarted=performPlayerAction(slash),slashFrames=resolveAction(),
    slashResolved=boss.hp<hpBeforeSlash&&boss.ap===apBeforeSlash-1&&slash.posture===0,
    pressureContract=pressure.cost===1&&pressure.posture===
      SQUIRE_BASE.postureDamage+SQUIRE_BASE.encouragePosturePerStack;

  boss.phase='dodge';boss.state='idle';boss.attack=null;boss.hazardLanes=[];
  beginPlayerTurn();selectTurnActor('ally');
  const postureBefore=boss.posture,pressureStarted=performPlayerAction(pressure),
    pressureShieldTimeline=pressureStarted&&isSquireShieldTurnAction(boss.turnAction)&&
      !!activeSquireShieldPose();
  let pressureRenderSafe=true;
  try{
    for(const t of [0,.48,.72,.94,1.18,1.5]){boss.turnAction.t=t;drawSquire();}
    boss.turnAction.t=0;
  }catch(error){pressureRenderSafe=false;}
  const pressureFrames=resolveAction(),pressureResolved=boss.posture>postureBefore;

  const move=activeBossAttackSet()[0].steps[0],fakeHazard={src:BOSS_SOURCE,done:false};
  boss.phase='dodge';boss.state='strike';boss.stateT=move.travel*.5;
  boss.attack={steps:[move,move,move]};boss.sequenceIndex=0;hazards.push(fakeHazard);
  const knightHealthBefore=player.currentHealthUnits,chainBefore=chainStacks,
    particleCountBefore=particles.length;
  damagePlayer('SQUIRE AUDIT');
  const intercepted=!squire.present&&squire.health===0&&
      player.currentHealthUnits===knightHealthBefore,
    baseDidNotParry=boss.sequenceIndex===0&&!fakeHazard.done&&chainStacks===chainBefore,
    deathSequenceStarted=squire.deathT===0&&!squire.deathBurst;
  let deathRenderSafe=true,fallAdvanced=false;
  try{
    drawSquire();
    for(let i=0;i<28;i++)updateSquire(1/60);
    fallAdvanced=squire.deathT>.4&&!squire.deathBurst;drawSquire();
    for(let i=0;i<30;i++)updateSquire(1/60);
    drawSquire();drawParticles(false,true);drawParticles();
  }catch(error){deathRenderSafe=false;}
  const recallFx=squire.deathBurst&&particles.length>particleCountBefore&&
    particles.some(p=>p.kind==='squireRecallMote');

  hazards=[];boss.parryReaction=null;boss.pendingBreak=null;boss.state='idle';boss.attack=null;
  boss.phase='dodge';beginPlayerTurn();const cooldownTwo=squireCooldownTurns()===2;
  boss.phase='dodge';beginPlayerTurn();const cooldownOne=squireCooldownTurns()===1;
  boss.phase='dodge';beginPlayerTurn();
  const readyCommand=knightTurnSkills().find(skill=>(skill.baseId||skill.id)==='call_squire'),
    cooldownReady=squireCooldownTurns()===0&&readyCommand.squireAction==='CALL'&&
      turnCommandAvailable(readyCommand);
  const passed=initialSkills.length===4&&callStarted&&callFrames<180&&called&&callEconomy&&
    encourageLockedOnCallTurn&&appearanceAuthored&&summonRenderSafe&&deathRenderSafe&&
    activated&&encourageStarted&&encourageFrames<180&&encouraged&&slashStarted&&
    slashFrames<180&&slashResolved&&pressureContract&&pressureStarted&&pressureFrames<180&&
    pressureResolved&&pressureShieldTimeline&&pressureRenderSafe&&deathSequenceStarted&&
    fallAdvanced&&recallFx&&
    intercepted&&baseDidNotParry&&
    cooldownTwo&&cooldownOne&&cooldownReady;
  return {passed,skills:initialSkills.length,callStarted,callFrames,called,callEconomy,
    encourageLockedOnCallTurn,appearanceAuthored,
    summonRenderSafe,deathRenderSafe,
    activated,encourageStarted,encourageFrames,encouraged,slashStarted,slashFrames,
    slashResolved,pressureContract,pressureStarted,pressureFrames,pressureResolved,
    pressureShieldTimeline,pressureRenderSafe,deathSequenceStarted,fallAdvanced,recallFx,
    intercepted,baseDidNotParry,cooldownTwo,cooldownOne,
    cooldownReady};
})();
