;globalThis.__squireHunterAudit=(()=>{
  const checks={},assert=(name,condition)=>{checks[name]=!!condition;if(!condition)throw new Error('Hunter: '+name);};
  openSkillLab();startSkillLabCombat();
  const common=compileClassSkillRoute('squire_hunter_form',{1:'COMMON'}),
    legendary=compileClassSkillRoute('squire_hunter_form',{1:'LEGENDARY'});
  assert('existingQualityLedger',common?.synthesisActive&&legendary?.synthesisActive&&
    common.synthesisQuality<legendary.synthesisQuality&&common.squireHunterDepth===1&&
    !common.squireGuardDepth&&common.evolutionHistory[0].familyId==='SQUIRE_HUNTER');
  assert('qualityImprovesBothMoves',legendary.squireHunterShotDamage>common.squireHunterShotDamage&&
    legendary.squireHunterReadyPower>common.squireHunterReadyPower&&
    legendary.squireHunterMarkCredit>common.squireHunterMarkCredit);
  replaceRunSkill('call_squire',common);resetSquireCombat();
  boss.hp=boss.maxhp=10000;boss.phase='player';boss.state='idle';boss.turnAction=null;
  boss.playerPhaseSerial=1;boss.ap=boss.apMax=9;boss.resolve=boss.resolveMax=99;
  summonSquire();squire.active=true;squire.ap=1;squire.arrivalT=1;squire.visualX=squire.lastX=170;
  const profile=squireCombatProfile(),shot=profile.skills[0],ready=profile.skills[1];
  assert('twoHunterMoves',profile.name==='HUNTER SQUIRE'&&shot.squireHunterBow&&
    shot.squireMarkCredit>=1&&ready.squireReadyShot&&ready.cost===1);
  assert('noGuardPowersOrBulk',squireVisualBulk()===0&&!squire.parryOnHit&&!squire.preparedParry&&
    shot.posture===0&&shot.addsChain===false&&!ready.squirePreparedParry);
  assert('plainFightRetained',fightCommand('ally').hits===2&&!fightCommand('ally').squireHunterBow);
  const palette=squire.appearance.bow;
  assert('persistentPartPalette',Object.isFrozen(palette)&&palette.arrowHead&&palette.arrowFeather&&
    palette.wood&&palette.wrap&&squire.appearance.hunter.hat);
  assert('sharedArrowScaleFinite',['ally','knight'].every(actor=>
    Number.isFinite(bowFlightArrowScale(actor))&&bowFlightArrowScale(actor)>0));
  const originalArrowRenderer=drawArrowSprite,heldArrowCalls=[];
  drawArrowSprite=(...args)=>heldArrowCalls.push(args);
  drawSpatialBowProp(sampleSpatialBow(2.8,0),2.8,q=>SpatialRiderRig.project(q,0),null,palette);
  drawArrowSprite=originalArrowRenderer;
  assert('heldArrowUsesFlightSpriteAndPalette',heldArrowCalls.length===1&&heldArrowCalls[0][5]===palette);
  const stepAction=()=>{
    let frames=0;
    while(boss.phase==='playerResolve'&&frames++<600){
      updateTurnAction(1/60);updateSquire(1/60);boss.playerActionTimer-=1/60;
      drawPlayer();drawSquire();drawProjectiles();
      if(boss.playerActionTimer<=0)finishPlayerAction();
    }
    assert('boundedAction',frames<600);return frames;
  };
  const freshPhase=()=>{
    boss.phase='player';boss.state='idle';boss.turnAction=null;boss.playerPhaseSerial++;
    boss.ap=9;boss.resolve=99;squire.ap=1;squire.active=true;boss.partyActor='ally';
    chainStacks=0;boss.playerTurnBreak=false;
  };
  freshPhase();boss.mark=0;boss.markFraction=0;
  const oldKnightAp=boss.ap,hpBefore=boss.hp;
  assert('shotStarts',performPlayerAction(shot));
  assert('bowNotSwordTimeline',!!boss.turnAction.bowTimeline&&!boss.turnAction.swordTimeline&&
    isBowTurnAction(boss.turnAction)&&activePlayerBowPose()===null&&!!activeSquireBowPose());
  const firstShotFrames=stepAction();
  assert('commonShotGrantsAtLeastOneMark',boss.hp<hpBefore&&boss.mark>=1&&
    Math.abs(boss.mark+boss.markFraction-shot.squireMarkCredit)<1e-5&&boss.ap===oldKnightAp);
  assert('paletteStableAcrossFrames',squire.appearance.bow===palette);
  const fractionalTotal=boss.markFraction,wholeMarksBefore=boss.mark;
  applyBossMarkEvent(.8,'HUNTER_AUDIT');
  assert('fractionPoolsWithOtherSources',boss.mark===wholeMarksBefore+Math.floor(fractionalTotal+.8)&&
    Math.abs(boss.markFraction-((fractionalTotal+.8)%1))<1e-5);
  const reserveBefore=boss.markFraction;applyBossMarkEvent(2,'WEAPON_AUDIT');
  assert('integerWeaponEventsPreserveReserve',Math.abs(boss.markFraction-reserveBefore)<1e-5);

  freshPhase();boss.mark=0;const readyAp=boss.ap,readyResolve=boss.resolve;
  assert('readyStarts',performPlayerAction(ready));
  assert('readySupportOnly',boss.turnAction.supportOnly&&boss.turnAction.hits===0);
  stepAction();
  assert('readyHoldsWithoutFiring',!!squire.hunterReady&&activeSquireBowPose()?.spatialTime===2.8&&
    boss.ap===readyAp&&boss.resolve===readyResolve-1);
  const held=squire.hunterReady,actionNoMark={actorId:'knight',markPlan:{markDamageByHit:[0],consumedTotal:0}},
    noMarkDamage=resolveSquireReadyShot(actionNoMark,0);
  assert('unmarkedFallback',noMarkDamage>0&&actionNoMark.squireReadyResult.mode==='SUPPORT SHOT'&&
    !squire.hunterReady&&!!squire.hunterFollow);
  assert('singleUse',resolveSquireReadyShot(actionNoMark,0)===0);
  squire.hunterReady=held;
  assert('missingMarkPlanUsesFallback',resolveSquireReadyShot({actorId:'knight'},0)===noMarkDamage);
  squire.hunterReady=held;boss.mark=3;
  const actionMarked={actorId:'knight',markPlan:{markDamageByHit:[0],consumedTotal:0}},
    selfDamage=resolveSquireReadyShot(actionMarked,0);
  assert('smallSelfDetonation',selfDamage>noMarkDamage&&boss.mark===3-held.capacity&&
    actionMarked.squireReadyResult.consumed===held.capacity);
  squire.hunterReady=held;boss.mark=0;
  const actionKnightBurst={actorId:'knight',markPlan:{markAtStart:3,markDamageByHit:[0,30],consumedTotal:3}},
    assistDamage=resolveSquireReadyShot(actionKnightBurst,0);
  assert('preConsumptionSnapshotAndStrongerAssist',assistDamage>selfDamage&&boss.mark===0&&
    actionKnightBurst.squireReadyResult.mode==='MARK ASSIST'&&actionKnightBurst.squireReadyResult.consumed===0);
  assert('notEveryContact',resolveSquireReadyShot(actionKnightBurst,1)===0);
  squire.hunterReady=held;
  assert('noAllyRecursion',resolveSquireReadyShot({actorId:'ally'},0)===0&&squire.hunterReady===held);

  freshPhase();squire.hunterReady=held;
  assert('anotherMoveStarts',performPlayerAction(shot));
  assert('anotherSquireMoveCancels',!squire.hunterReady);stepAction();
  squire.hunterReady=held;boss.phase='dodge';beginPlayerTurn();
  assert('holdsAcrossDefenseEnd',squire.hunterReady===held&&activeSquireBowPose()?.spatialTime===2.8);
  for(let turn=0;turn<3;turn++){boss.phase='dodge';beginPlayerTurn();}
  assert('holdsAcrossMultipleTurns',squire.hunterReady===held&&activeSquireBowPose()?.spatialTime===2.8);
  squire.veterancy=25;squire.encouragement=0;const health25=squireProgressionMaxHealth();
  squire.veterancy=100;const health100=squireProgressionMaxHealth();
  assert('healthNotHardCapped',health100>health25&&health25>=1&&squireVisualBulk()===0);
  squire.veterancy=0;squire.encouragement=0;

  // Full contact pipeline, not just the selector: a real Knight attack consumes
  // the preparation once and records the extra contribution in its hit result.
  freshPhase();boss.partyActor='knight';squire.hunterReady=held;boss.mark=0;
  const hpBeforeKnight=boss.hp;
  assert('knightStarts',performPlayerAction(fightCommand('knight')));
  const knightAction=boss.turnAction,contactAt=knightAction.bowTimeline?.contacts[0]??knightAction.impactDelay;
  const beforeContact=Math.max(0,contactAt-.09);
  updateTurnAction(beforeContact);updateSquire(0);boss.playerActionTimer-=beforeContact;
  assert('readyArrowFliesBeforeKnightContact',knightAction.hitIndex===0&&
    squire.hunterFollow?.action===knightAction&&squire.hunterFollow.t<squire.hunterFollow.flightTime&&
    activeSquireBowPose()?.spatialTime>=3.25);
  updateTurnAction(.09);updateSquire(0);boss.playerActionTimer-=.09;
  assert('readyArrowArrivesOnKnightContact',knightAction.hitIndex>=1&&
    !!knightAction.squireReadyResult&&!squire.hunterReady&&
    squire.hunterFollow.t>=squire.hunterFollow.flightTime&&!squire.hunterFollow.action);
  stepAction();
  assert('knightContactConsumesReady',!squire.hunterReady&&!!knightAction.squireReadyResult&&boss.hp<hpBeforeKnight);

  // Real encounters spend companion AP; the lab remains intentionally unlimited.
  const lab=skillLabSession;skillLabSession=null;freshPhase();
  assert('productionReadyStarts',performPlayerAction(ready));
  assert('productionPersonalApSpent',squire.ap===0&&boss.ap===9);stepAction();
  assert('productionSecondSkillBlocked',!performPlayerAction(shot));
  skillLabSession=lab;
  boss.phase='dodge';squire.health=1;squire.hunterReady=held;
  resolveSquireIntercept('HUNTER AUDIT');
  assert('deathClearsReady',!squire.present&&!squire.hunterReady&&!squire.hunterFollow&&squire.deathHunter);
  for(const t of [0,.2,.6,1,1.19]){squire.deathT=t;drawSquire();}
  assert('hunterDeathRenders',true);
  return {passed:true,checks,firstShotFrames,commonQuality:common.synthesisQuality,
    legendaryQuality:legendary.synthesisQuality,shotDamage:shot.damage,markCredit:shot.squireMarkCredit,
    readyPower:ready.readyPower,noMarkDamage,selfDamage,assistDamage};
})();
