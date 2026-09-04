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
      Number.isInteger(squire.appearance.shield.pattern)&&
      typeof squire.appearance.horseMane==='string'&&
      typeof squire.appearance.horseMark==='string'&&
      typeof squire.appearance.horseStripe==='string'&&
      Number.isInteger(squire.appearance.horsePattern)&&
      squire.appearance.horsePattern>=0&&squire.appearance.horsePattern<=6);
  let summonRenderSafe=true,coatVariantsRenderSafe=true;
  try{
    drawPlayer();drawSquire();
    const summonedAppearance=squire.appearance;
    for(let horsePattern=0;horsePattern<=6;horsePattern++){
      squire.appearance=Object.freeze({...summonedAppearance,horsePattern});drawSquire();
    }
    squire.appearance=summonedAppearance;
  }catch(error){summonRenderSafe=false;coatVariantsRenderSafe=false;}

  boss.phase='dodge';boss.state='idle';boss.attack=null;boss.hazardLanes=[];
  beginPlayerTurn();
  const activated=squirePartyReady()&&companionProfile().id==='squire',
    encourage=knightTurnSkills().find(skill=>(skill.baseId||skill.id)==='call_squire'),
    encourageStarted=performPlayerAction(encourage),encourageFrames=resolveAction(),
    encouraged=squire.encouragement===1;

  selectTurnActor('ally');
  const profile=squireCombatProfile(),squireFight=fightCommand('ally'),
    fightBalanced=squireFight.hits===2&&squireFight.hitDamages?.length===2&&
      squireFight.hitDamages[0]===squireFight.hitDamages[1]&&
      squireFight.hitDamages[0]+squireFight.hitDamages[1]===
        SQUIRE_BASE.slashDamage+SQUIRE_BASE.encourageDamagePerStack,
    slash=profile.skills.find(skill=>skill.id==='squire_slash'),
    pressure=profile.skills.find(skill=>skill.id==='squire_posture'),hpBeforeSlash=boss.hp,
    apBeforeSlash=boss.ap,slashStarted=performPlayerAction(slash),
    slashSwordTimeline=slashStarted&&boss.turnAction?.swordTimeline===SQUIRE_SWORD_TIMELINE&&
      boss.turnAction.impactDelay===BACK_SWORD_TIMING.contact&&
      boss.turnAction.hits===2&&boss.turnAction.hitInterval===
        BACK_SWORD_TIMING.crossContact-BACK_SWORD_TIMING.contact&&
      SQUIRE_SWORD_TIMELINE.contacts.length===2,
    slashBalanced=slash.hits===2&&slash.hitDamages?.length===2&&
      slash.hitDamages[0]===slash.hitDamages[1]&&
      slash.hitDamages[0]+slash.hitDamages[1]===
        SQUIRE_BASE.slashDamage+SQUIRE_BASE.encourageDamagePerStack;
  let slashRenderSafe=true;
  try{
    for(const t of [0,.18,.36,.54,.70,.88,1.18,1.32,1.46,1.63,1.80,1.90,
      2.06,2.22,2.42,2.66,2.80]){
      boss.turnAction.t=t;
      if(!activeSquireSwordPose())throw new Error('Squire sword pose missing');
      drawSquire();
    }
    boss.turnAction.t=0;
  }catch(error){slashRenderSafe=false;}
  const slashFrames=resolveAction(),
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

  /* Production fights allow each actor's individual skill once per player
     phase. Skill Lab intentionally bypasses this, so isolate the ledger check
     here without changing the live audit encounter. */
  const savedLabCombat=skillLabSession.inCombat,savedSkillSerial=boss.skillUseSerial,
    savedPhaseSerial=boss.playerPhaseSerial;
  skillLabSession.inCombat=false;boss.skillUseSerial=Object.create(null);
  const firstSkillReady=!turnSkillUsedThisPhase(slash,'ally');
  markTurnSkillUsedThisPhase(slash,'ally');
  const repeatedSkillBlocked=turnSkillUsedThisPhase(slash,'ally'),
    separateSkillReady=!turnSkillUsedThisPhase(pressure,'ally'),
    knightLedgerIndependent=!turnSkillUsedThisPhase(slash,'knight'),
    repeatFightAllowed=!isTurnSkillCommand(fightCommand('ally'))&&
      !turnSkillUsedThisPhase(fightCommand('ally'),'ally');
  boss.playerPhaseSerial++;
  const nextPhaseSkillReady=!turnSkillUsedThisPhase(slash,'ally');
  boss.playerPhaseSerial=savedPhaseSerial;boss.skillUseSerial=savedSkillSerial;
  skillLabSession.inCombat=savedLabCombat;
  const phaseSkillRule=firstSkillReady&&repeatedSkillBlocked&&separateSkillReady&&
    knightLedgerIndependent&&repeatFightAllowed&&nextPhaseSkillReady;

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
  let deathRenderSafe=true,fallAdvanced=false,landedPoseHeld=false;
  try{
    drawSquire();
    for(let i=0;i<28;i++)updateSquire(1/60);
    fallAdvanced=squire.deathT>.4&&!squire.deathBurst;drawSquire();
    for(let i=0;i<36;i++)updateSquire(1/60);
    landedPoseHeld=squire.deathT>=SQUIRE_DEATH_LAND_AT&&!squire.deathBurst;drawSquire();
    for(let i=0;i<10;i++)updateSquire(1/60);
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

  /* A lethal arena hit must now reuse the authored mounted death language:
     visible fall, grounded hold, then horse + Knight particle breakup. */
  player.alive=true;player.invuln=0;player.currentHealthUnits=player.maxHealthUnits;
  resetPlayerMountedDeath();setMode('boss');
  const knightDeathParticleStart=particles.length;
  damagePlayer('KNIGHT DEATH AUDIT',true);
  const knightDeathSequenceStarted=mode==='dying'&&!player.alive&&
    player.mountedDeath&&player.deathT===0&&!player.deathBurst;
  let knightDeathRenderSafe=true,knightFallAdvanced=false,knightLandedPoseHeld=false;
  try{
    drawPlayer();
    for(let i=0;i<28;i++)updatePlayerMountedDeath(1/60);
    knightFallAdvanced=player.deathT>.4&&!player.deathBurst;drawPlayer();
    for(let i=0;i<36;i++)updatePlayerMountedDeath(1/60);
    knightLandedPoseHeld=player.deathT>=SQUIRE_DEATH_LAND_AT&&!player.deathBurst;drawPlayer();
    for(let i=0;i<10;i++)updatePlayerMountedDeath(1/60);
    drawPlayer();drawParticles(false,true);drawParticles();
  }catch(error){knightDeathRenderSafe=false;}
  const knightRecallFx=player.deathBurst&&particles.length>knightDeathParticleStart&&
    particles.some(p=>p.kind==='squireRecallMote');
  const passed=initialSkills.length===4&&callStarted&&callFrames<180&&called&&callEconomy&&
    encourageLockedOnCallTurn&&appearanceAuthored&&summonRenderSafe&&coatVariantsRenderSafe&&
    deathRenderSafe&&
    activated&&encourageStarted&&encourageFrames<180&&encouraged&&fightBalanced&&slashStarted&&
    slashSwordTimeline&&slashBalanced&&slashRenderSafe&&slashFrames<180&&slashResolved&&
    pressureContract&&pressureStarted&&pressureFrames<180&&
    pressureResolved&&pressureShieldTimeline&&pressureRenderSafe&&deathSequenceStarted&&
    fallAdvanced&&landedPoseHeld&&recallFx&&
    intercepted&&baseDidNotParry&&
    cooldownTwo&&cooldownOne&&cooldownReady&&phaseSkillRule&&
    knightDeathSequenceStarted&&knightDeathRenderSafe&&knightFallAdvanced&&
    knightLandedPoseHeld&&knightRecallFx;
  return {passed,skills:initialSkills.length,callStarted,callFrames,called,callEconomy,
    encourageLockedOnCallTurn,appearanceAuthored,
    summonRenderSafe,coatVariantsRenderSafe,deathRenderSafe,
    activated,encourageStarted,encourageFrames,encouraged,fightBalanced,slashStarted,slashSwordTimeline,
    slashBalanced,slashRenderSafe,slashFrames,slashResolved,pressureContract,pressureStarted,pressureFrames,pressureResolved,
    pressureShieldTimeline,pressureRenderSafe,deathSequenceStarted,fallAdvanced,landedPoseHeld,recallFx,
    intercepted,baseDidNotParry,cooldownTwo,cooldownOne,
    cooldownReady,phaseSkillRule,firstSkillReady,repeatedSkillBlocked,separateSkillReady,
    knightLedgerIndependent,repeatFightAllowed,nextPhaseSkillReady,
    knightDeathSequenceStarted,knightDeathRenderSafe,knightFallAdvanced,
    knightLandedPoseHeld,knightRecallFx};
})();
