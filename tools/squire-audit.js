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
    callEconomy=boss.ap===initialAp-1&&boss.resolve===initialResolve-1;

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
    pressureFrames=resolveAction(),pressureResolved=boss.posture>postureBefore;

  const move=activeBossAttackSet()[0].steps[0],fakeHazard={src:BOSS_SOURCE,done:false};
  boss.phase='dodge';boss.state='strike';boss.stateT=move.travel*.5;
  boss.attack={steps:[move,move,move]};boss.sequenceIndex=0;hazards.push(fakeHazard);
  const knightHealthBefore=player.currentHealthUnits,chainBefore=chainStacks;
  damagePlayer('SQUIRE AUDIT');
  const intercepted=!squire.present&&squire.health===0&&
      player.currentHealthUnits===knightHealthBefore,
    baseDidNotParry=boss.sequenceIndex===0&&!fakeHazard.done&&chainStacks===chainBefore;

  hazards=[];boss.parryReaction=null;boss.pendingBreak=null;boss.state='idle';boss.attack=null;
  boss.phase='dodge';beginPlayerTurn();const cooldownTwo=squireCooldownTurns()===2;
  boss.phase='dodge';beginPlayerTurn();const cooldownOne=squireCooldownTurns()===1;
  boss.phase='dodge';beginPlayerTurn();
  const readyCommand=knightTurnSkills().find(skill=>(skill.baseId||skill.id)==='call_squire'),
    cooldownReady=squireCooldownTurns()===0&&readyCommand.squireAction==='CALL'&&
      turnCommandAvailable(readyCommand);
  const passed=initialSkills.length===4&&callStarted&&callFrames<180&&called&&callEconomy&&
    activated&&encourageStarted&&encourageFrames<180&&encouraged&&slashStarted&&
    slashFrames<180&&slashResolved&&pressureContract&&pressureStarted&&pressureFrames<180&&
    pressureResolved&&intercepted&&baseDidNotParry&&
    cooldownTwo&&cooldownOne&&cooldownReady;
  return {passed,skills:initialSkills.length,callStarted,callFrames,called,callEconomy,
    activated,encourageStarted,encourageFrames,encouraged,slashStarted,slashFrames,
    slashResolved,pressureContract,pressureStarted,pressureFrames,pressureResolved,
    intercepted,baseDidNotParry,cooldownTwo,cooldownOne,
    cooldownReady};
})();
