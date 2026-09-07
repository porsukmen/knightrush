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
      typeof squire.appearance.horsePoint==='string'&&
      typeof squire.appearance.horseCoatFamily==='string'&&
      Number.isInteger(squire.appearance.horsePattern)&&
      squire.appearance.horsePattern>=0&&squire.appearance.horsePattern<=10);
  let summonRenderSafe=true,coatVariantsRenderSafe=true;
  try{
    drawPlayer();drawSquire();
    const summonedAppearance=squire.appearance;
    for(let horsePattern=0;horsePattern<=10;horsePattern++){
      squire.appearance=Object.freeze({...summonedAppearance,horsePattern});drawSquire();
    }
    squire.appearance=summonedAppearance;
  }catch(error){summonRenderSafe=false;coatVariantsRenderSafe=false;}

  boss.phase='dodge';boss.state='idle';boss.attack=null;boss.hazardLanes=[];
  beginPlayerTurn();
  const activated=squirePartyReady()&&companionProfile().id==='squire'&&
      squire.ap===SQUIRE_BASE.apMax&&squire.apMax===1,
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
    slashResolved=boss.hp<hpBeforeSlash&&boss.ap===apBeforeSlash&&slash.posture===0,
    labSquireApUnrestricted=squire.ap===SQUIRE_BASE.apMax,
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

  /* A production phase spends the Squire's personal point, never the Knight's.
     Skill Lab keeps that point visually full so repeated animation tests remain free. */
  const savedLabCombatForAp=skillLabSession.inCombat;
  skillLabSession.inCombat=false;boss.phase='player';boss.partyActor='ally';
  squire.ap=squire.apMax;boss.skillUseSerial=Object.create(null);
  const productionKnightAp=boss.ap,productionSquireReady=turnCommandAvailable(slash,'ally'),
    productionSlashStarted=performPlayerAction(slash),
    productionSquireApSpent=squire.ap===0&&boss.ap===productionKnightAp;
  const productionSlashFrames=resolveAction();
  boss.partyActor='ally';
  const secondSquireActionBlocked=!turnCommandAvailable(pressure,'ally');
  boss.phase='dodge';boss.state='idle';boss.attack=null;boss.hazardLanes=[];
  beginPlayerTurn();selectTurnActor('ally');
  const nextPhaseSquireApRefilled=squire.ap===squire.apMax&&
    turnCommandAvailable(pressure,'ally');
  skillLabSession.inCombat=savedLabCombatForAp;

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
  /* Guard Form uses the production weapon Quality economy, not a parallel rank
     system. Validate the complete Common and Legendary histories plus the final
     prepared-parry ordering against a stored Knight shield. */
  const allCommon=['COMMON','COMMON','COMMON','COMMON','COMMON'],
    allLegendary=['COMMON','LEGENDARY','LEGENDARY','LEGENDARY','LEGENDARY'],
    commonGuard=compileClassSkillRoute('squire_living_bastion',allCommon),
    legendaryGuard=compileClassSkillRoute('squire_living_bastion',allLegendary),
    guardQualityLedger=commonGuard&&legendaryGuard&&commonGuard.synthesisQuality===15&&
      legendaryGuard.synthesisQuality===67&&commonGuard.synthesisProjectedResolveCost===1&&
      legendaryGuard.synthesisProjectedResolveCost===5&&
      legendaryGuard.synthesisEffectiveQuality>commonGuard.synthesisEffectiveQuality&&
      legendaryGuard.squireBaseMaxHealth>commonGuard.squireBaseMaxHealth&&
      legendaryGuard.squireVeterancyEfficiency>commonGuard.squireVeterancyEfficiency;
  replaceRunSkill('call_squire',legendaryGuard);resetSquireCombat();
  player.alive=true;player.invuln=0;resetPlayerMountedDeath();setMode('boss');
  boss.phase='player';boss.state='idle';boss.turnAction=null;boss.playerPhaseSerial=1;
  summonSquire();squire.active=true;squire.ap=1;
  const guardProfile=squireCombatProfile(),guardBash=guardProfile.skills.find(skill=>
      skill.squireShieldBash),coveringCross=guardProfile.skills[0],
    guardKitReady=squire.maxHealth===legendaryGuard.squireBaseMaxHealth&&
      guardProfile.name==='GUARD SQUIRE'&&guardBash?.squireShieldGrant===0&&
      guardBash.squirePreparedParryCount===legendaryGuard.squirePreparedParryBaseCount&&guardBash.squirePreparedParry&&
      coveringCross?.name==='COVERING CROSS'&&!coveringCross.squirePreparedParry&&squireVisualBulk()>=1;
  const normalFightDoesNotPrepare=guardProfile.fightName==='SQUIRE SLASH'&&
    guardProfile.fightPreparedParry!==true&&fightCommand('ally').squirePreparedParry!==true;
  const noFreeVeterancy=!awardSquireDefenseVeterancy()&&squire.veterancy===0;
  squire.defenseVeterancyEligible=true;
  const earnedVeterancy=awardSquireDefenseVeterancy()&&squire.veterancy===1;
  const rankContract=squireVeterancyRank(0).name==='RECRUIT'&&
    squireVeterancyRank(2).name==='GUARD'&&squireVeterancyRank(5).name==='VETERAN'&&
    squireVeterancyRank(9).name==='BASTION'&&nextSquireVeterancyRank(0).min===2&&
    nextSquireVeterancyRank(2).min===5&&nextSquireVeterancyRank(9)===null;
  squire.preparedParry=true;player.shieldCharges=1;
  const preparedHealth=squire.health,preparedKnightHealth=player.currentHealthUnits;
  boss.phase='dodge';boss.state='strike';boss.attack={steps:[move]};boss.sequenceIndex=0;
  damagePlayer('PREPARED SQUIRE PARRY AUDIT');
  const preparedParryResolved=!squire.preparedParry&&squire.health===preparedHealth&&
    player.currentHealthUnits===preparedKnightHealth&&player.shieldCharges===1&&squire.parryT===0;
  let guardRenderSafe=true;
  try{drawSquire();for(const t of [0,.18,.34,.52,.76,.96]){squire.parryT=t;drawSquire();}}
  catch(error){guardRenderSafe=false;}
  const guardPreparationChecks={},checkGuard=(name,value)=>{
    guardPreparationChecks[name]=!!value;if(!value)throw new Error('Guard preparation: '+name);
  };
  const preparationByRarity={};
  for(const rarity of ['COMMON','UNCOMMON','RARE','LEGENDARY']){
    const route=compileClassSkillRoute('squire_living_bastion',{1:rarity,2:rarity,3:rarity,4:rarity});
    replaceRunSkill('call_squire',route);
    const counts=[0,2,5,9].map(v=>{squire.veterancy=v;return squireCombatProfile().skills[1].squirePreparedParryCount;});
    preparationByRarity[rarity]={quality:route.squirePreparedParryQuality,counts};
    checkGuard('paidRankScaling'+rarity,counts[0]===route.squirePreparedParryBaseCount&&
      counts[1]===counts[0]&&counts[2]===counts[0]&&counts[3]===counts[0]+1);
    checkGuard('noPassiveParry'+rarity,!route.squireParryOnHit);
  }
  checkGuard('rarityHistoryScalesCapacity',preparationByRarity.COMMON.counts[0]===1&&
    preparationByRarity.LEGENDARY.counts[0]>preparationByRarity.RARE.counts[0]&&
    preparationByRarity.RARE.counts[0]>preparationByRarity.UNCOMMON.counts[0]);
  const rarityNames=['COMMON','UNCOMMON','RARE','LEGENDARY'],historyCache=new Map(),
    compileHistory=indices=>{
      const key=indices.join('');if(!historyCache.has(key))historyCache.set(key,
        compileClassSkillRoute('squire_living_bastion',Object.fromEntries(indices.map((r,i)=>[i+1,rarityNames[r]]))));
      return historyCache.get(key);
    },ownedStats=['squireBaseMaxHealth','squireVeterancyEfficiency','squireVeterancyDamagePerPoint',
      'squireGuardBashPosture','squireParryPosture','squireCoveringCrossDamageBonus','squirePreparedParryBaseCount'];
  for(let n=0;n<256;n++){
    const indices=[(n>>6)&3,(n>>4)&3,(n>>2)&3,n&3],route=compileHistory(indices),
      progress=route.squirePreparedParryProgress;
    if(Math.abs(progress.spent+progress.reserve-progress.credit)>.0002)
      throw new Error('Guard preparation wallet lost power: '+indices);
    const paid=route.synthesisQualityReceipts.reduce((sum,r)=>sum+(r.powerAllocation.PREPARED_PARRY||0),0);
    if(Math.abs(paid-progress.credit)>.0002)throw new Error('Guard preparation history receipt mismatch');
    for(let layer=0;layer<4;layer++)if(indices[layer]<3){
      const next=indices.slice();next[layer]++;const stronger=compileHistory(next);
      if(ownedStats.some(stat=>stronger[stat]<route[stat]))throw new Error('Guard history regression: '+indices+' layer '+layer);
      if(!ownedStats.some(stat=>stronger[stat]>route[stat]))throw new Error('Guard rarity has no visible improvement');
    }
  }
  checkGuard('all256HistoriesPaidAndMonotonic',historyCache.size===256);
  const early=compileHistory([3,0,0,0]),late=compileHistory([0,0,0,3]),
    commonFoundation=compileClassSkillRoute('squire_guard_form',{1:'COMMON'}),
    legendaryFoundation=compileClassSkillRoute('squire_guard_form',{1:'LEGENDARY'});
  checkGuard('earlyLegendaryFoundationSurvives',early.squireBaseMaxHealth>late.squireBaseMaxHealth&&
    early.squireGuardBashPosture>late.squireGuardBashPosture&&
    legendaryFoundation.squireBaseMaxHealth>commonFoundation.squireBaseMaxHealth&&
    early.synthesisQualityReceipts[0].effectiveQuality===legendaryFoundation.synthesisQualityReceipts[0].effectiveQuality);
  checkGuard('lateLegendarySpecializes',late.squirePreparedParryProgress.credit>early.squirePreparedParryProgress.credit&&
    late.squireParryPosture>early.squireParryPosture);
  const stackCounts=[[0,0,0,0],[3,0,0,0],[3,3,0,0],[3,3,3,0],[3,3,3,3]]
    .map(h=>compileHistory(h).squirePreparedParryBaseCount);
  checkGuard('legendaryStackPreserved',stackCounts.at(-1)>stackCounts[1]&&
    stackCounts.every((v,i)=>!i||v>=stackCounts[i-1]));
  replaceRunSkill('call_squire',legendaryGuard);squire.veterancy=9;
  boss.phase='player';boss.state='idle';boss.turnAction=null;boss.partyActor='ally';
  boss.playerPhaseSerial++;boss.ap=9;boss.resolve=99;boss.posture=0;boss.hp=100000;
  squire.ap=1;squire.active=true;squire.parryT=-1;squire.preparedParry=20;
  const preparedShieldBefore=player.shieldCharges,finalBash=squireCombatProfile().skills[1];
  checkGuard('bashStillUsesShieldAnimation',performPlayerAction(finalBash)&&
    isSquireShieldTurnAction(boss.turnAction)&&!!activeSquireShieldPose());
  resolveAction();
  checkGuard('bashPreparesWithoutStackingOrShields',squire.preparedParry===finalBash.squirePreparedParryCount&&
    player.shieldCharges===preparedShieldBefore);
  boss.phase='dodge';boss.state='strike';boss.attack={steps:[move]};boss.sequenceIndex=0;
  const parryHealth=squire.health,parryKnightHealth=player.currentHealthUnits;
  for(let left=finalBash.squirePreparedParryCount;left>0;left--){
    boss.phase='dodge';boss.state='strike';boss.posture=0;
    checkGuard('paidParryConsumed'+left,resolvePreparedSquireParry('AUDIT')&&squire.preparedParry===left-1);
  }
  checkGuard('allPaidParriesDamageFree',squire.health===parryHealth&&player.currentHealthUnits===parryKnightHealth);
  checkGuard('noUnpaidParry',!resolvePreparedSquireParry('AUDIT'));
  boss.phase='dodge';boss.state='idle';squire.preparedParry=2;
  beginPlayerTurn();checkGuard('expiresAfterOneDefense',!squire.preparedParry);
  boss.phase='dodge';squire.parryOnHit=true;squire.parryT=-1;
  const unpreparedHealth=squire.health;
  resolveSquireIntercept('AUDIT');
  checkGuard('unpreparedHitNeverParries',squire.health===unpreparedHealth-1&&squire.parryT===-1);
  const passed=initialSkills.length===4&&callStarted&&callFrames<180&&called&&callEconomy&&
    encourageLockedOnCallTurn&&appearanceAuthored&&summonRenderSafe&&coatVariantsRenderSafe&&
    deathRenderSafe&&
    activated&&encourageStarted&&encourageFrames<180&&encouraged&&fightBalanced&&slashStarted&&
    slashSwordTimeline&&slashBalanced&&slashRenderSafe&&slashFrames<180&&slashResolved&&
    labSquireApUnrestricted&&productionSquireReady&&productionSlashStarted&&
    productionSquireApSpent&&productionSlashFrames<180&&secondSquireActionBlocked&&
    nextPhaseSquireApRefilled&&
    pressureContract&&pressureStarted&&pressureFrames<180&&
    pressureResolved&&pressureShieldTimeline&&pressureRenderSafe&&deathSequenceStarted&&
    fallAdvanced&&landedPoseHeld&&recallFx&&
    intercepted&&baseDidNotParry&&
    cooldownTwo&&cooldownOne&&cooldownReady&&phaseSkillRule&&
    knightDeathSequenceStarted&&knightDeathRenderSafe&&knightFallAdvanced&&
    knightLandedPoseHeld&&knightRecallFx&&guardQualityLedger&&guardKitReady&&
    normalFightDoesNotPrepare&&noFreeVeterancy&&earnedVeterancy&&rankContract&&
    preparedParryResolved&&guardRenderSafe;
  return {passed,guardPreparationChecks,preparationByRarity,
    mixedHistoryExamples:Object.fromEntries([["LCCC",early],["CCCL",late],
      ["LLCC",compileHistory([3,3,0,0])],["LLLC",compileHistory([3,3,3,0])]].map(([key,route])=>
      [key,{health:route.squireBaseMaxHealth,bash:route.squireGuardBashPosture,
        parryPosture:route.squireParryPosture,parries:route.squirePreparedParryBaseCount,
        reserve:route.squirePreparedParryProgress.reserve}])),
    skills:initialSkills.length,callStarted,callFrames,called,callEconomy,
    encourageLockedOnCallTurn,appearanceAuthored,
    summonRenderSafe,coatVariantsRenderSafe,deathRenderSafe,
    activated,encourageStarted,encourageFrames,encouraged,fightBalanced,slashStarted,slashSwordTimeline,
    slashBalanced,slashRenderSafe,slashFrames,slashResolved,labSquireApUnrestricted,
    productionSquireReady,productionSlashStarted,productionSquireApSpent,productionSlashFrames,
    secondSquireActionBlocked,nextPhaseSquireApRefilled,
    pressureContract,pressureStarted,pressureFrames,pressureResolved,
    pressureShieldTimeline,pressureRenderSafe,deathSequenceStarted,fallAdvanced,landedPoseHeld,recallFx,
    intercepted,baseDidNotParry,cooldownTwo,cooldownOne,
    cooldownReady,phaseSkillRule,firstSkillReady,repeatedSkillBlocked,separateSkillReady,
    knightLedgerIndependent,repeatFightAllowed,nextPhaseSkillReady,
    knightDeathSequenceStarted,knightDeathRenderSafe,knightFallAdvanced,
    knightLandedPoseHeld,knightRecallFx,guardQualityLedger,guardKitReady,
    normalFightDoesNotPrepare,noFreeVeterancy,earnedVeterancy,rankContract,
    preparedParryResolved,guardRenderSafe,
    commonGuardQuality:commonGuard&&commonGuard.synthesisQuality,
    legendaryGuardQuality:legendaryGuard&&legendaryGuard.synthesisQuality};
})();
