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
  const speedDelivery={family:'PROJECTILE',profileId:'OWNER_BOW',pattern:'SINGLE'},
    speedCommand={hits:1,bowAnimationRecipeId:'BOW_STANDARD'},
    speedAuthored=resolveBowAnimationRecipe(speedCommand,0,'BOW_STANDARD'),
    speedTimeline=buildBowActionTimeline(speedCommand,speedDelivery,0,600),
    oldWindup=Math.max(1.10,speedAuthored.raiseTime)+Math.max(.42,speedAuthored.drawTime)+
      Math.max(.12,speedAuthored.holdTime);
  assert('sharedBowAnimationFifteenPercentFaster',Math.abs(speedTimeline.firstRelease*1.15-oldWindup)<1e-8&&
    speedTimeline.recipe.arrowSpeed===speedAuthored.arrowSpeed&&
    Math.abs(speedTimeline.contacts[0]-speedTimeline.releases[0]-speedTimeline.flightTime)<.0002);
  assert('noGuardPowersOrBulk',squireVisualBulk()===0&&!squire.parryOnHit&&!squire.preparedParry&&
    shot.posture===0&&shot.addsChain===false&&!ready.squirePreparedParry);
  assert('hunterFightIsSingleBowShot',fightCommand('ally').hits===1&&fightCommand('ally').squireHunterBow&&
    fightCommand('ally').deliveryProfileId==='COMPANION_BOW'&&!fightCommand('ally').squireMarkCredit);
  const palette=squire.appearance.bow;
  assert('persistentPartPalette',Object.isFrozen(palette)&&palette.arrowHead&&palette.arrowFeather&&
    palette.wood&&palette.wrap&&squire.appearance.hunter.hat);
  const luminance=color=>{const rgb=color.startsWith('#')?[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)):
    color.match(/[\d.]+/g).map(Number);return .299*rgb[0]+.587*rgb[1]+.114*rgb[2];};
  assert('mantleContrastsEveryBodyColor',['#58734b','#3f6254','#738052','#626d47','#435f45',
    '#795b40','#9b7955','#b69a72','#a99b7b','#526f88','#6e8997','#777c79'].every(body=>
    hunterMantleColors(body).every(mantle=>[body,shade(body,-28)].every(surface=>
      Math.abs(luminance(shade(mantle,-12))-luminance(surface))>=55))));
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
  freshPhase();
  const fightMarks=boss.mark,fightReserve=boss.markFraction;
  assert('hunterFightStarts',performPlayerAction(fightCommand('ally')));
  assert('hunterFightUsesBowTimeline',!!boss.turnAction.bowTimeline&&!boss.turnAction.swordTimeline);
  stepAction();
  assert('hunterFightDoesNotAddMark',boss.mark===fightMarks&&boss.markFraction===fightReserve);

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
  const ambusher=compileClassSkillRoute('squire_hunter_ambusher',{1:'COMMON',2:'COMMON',3:'COMMON'}),
    ambusherLegend=compileClassSkillRoute('squire_hunter_ambusher',{1:'LEGENDARY',2:'LEGENDARY',3:'LEGENDARY'});
  assert('ambusherQualityAndMarks',ambusher.squireHunterDepth===3&&ambusher.squireHunterMarkCredit===2&&
    ambusherLegend.squireHunterMarkCredit===6&&ambusher.squireHunterExplosionPerMark>=1&&
    ambusherLegend.squireHunterExplosionPerMark>ambusher.squireHunterExplosionPerMark);
  replaceRunSkill('call_squire',ambusher);freshPhase();
  const explosive=squireCombatProfile().skills[1];
  assert('ambusherSkills',squireCombatProfile().skills[0].name==='HUNTING SHOT'&&explosive.name==='EXPLOSIVE ARROW');
  assert('explosivePreparationStarts',performPlayerAction(explosive));stepAction();
  const explosiveHeld=squire.hunterReady;
  assert('explosionSnapshot',explosiveHeld.explosionPerMark===ambusher.squireHunterExplosionPerMark);
  for(const variant of ['knight','self','none']){
    squire.hunterReady=explosiveHeld;boss.mark=variant==='self'?5:0;
    const action={actorId:'knight',markPlan:{consumedTotal:variant==='knight'?4:0,
      markDamageByHit:[variant==='knight'?12:0]}};
    resolveSquireReadyShot(action,0);
    const expected=variant==='knight'?4:variant==='self'?explosiveHeld.capacity:0;
    assert('explosiveBranch_'+variant,action.squireReadyResult.detonatedMarks===expected&&
      Math.abs(action.squireReadyResult.explosionDamage-stableCombatNumber(expected*explosiveHeld.explosionPerMark))<.001&&
      boss.mark===(variant==='self'?5-expected:0)&&!squire.hunterReady);
  }
  const phantom=compileClassSkillRoute('squire_hunter_phantom',{1:'COMMON',2:'COMMON',3:'COMMON',4:'COMMON'}),
    phantomLegend=compileClassSkillRoute('squire_hunter_phantom',{1:'LEGENDARY',2:'LEGENDARY',3:'LEGENDARY',4:'LEGENDARY'});
  assert('phantomFinalBudget',phantom.squireHunterMarkCredit===3&&phantomLegend.squireHunterMarkCredit===8&&
    phantom.squireHunterCoveringShot&&phantom.squireHunterExplosionPerMark>=ambusher.squireHunterExplosionPerMark);
  replaceRunSkill('call_squire',phantom);freshPhase();
  const covering=squireCombatProfile().skills[1];
  assert('phantomSkills',covering.name==='COVERING SHOT'&&squireCombatProfile().skills[0].name==='GHOST SHOT');
  performPlayerAction(covering);stepAction();
  const coverHeld=squire.hunterReady,coverHealth=squire.health,knightHealth=player.currentHealthUnits;
  boss.phase='dodge';player.invuln=0;const priorGod=godMode;godMode=false;
  const coverMove={strike:'strike_slam',travel:.8},priorCurrentMove=boss.currentMove,
    priorAttack=boss.attack,priorReaction=boss.parryReaction,
    perfectBefore=skillLabSession.defenseStats.perfects,
    parryBefore=skillLabSession.defenseStats.parries,
    interruptedHazard={src:BOSS_SOURCE,done:false},unrelatedHazard={src:'OTHER_AUDIT',done:false};
  boss.currentMove=()=>coverMove;boss.attack={steps:[coverMove,coverMove]};
  boss.state='strike';boss.stateT=.4;boss.sequenceIndex=0;
  hazards.push(interruptedHazard,unrelatedHazard);
  damagePlayer('COVER AUDIT');godMode=priorGod;
  assert('coverProtectsRealHit',!squire.hunterReady&&squire.health===coverHealth&&player.currentHealthUnits===knightHealth);
  assert('coverPlaysBossParryReaction',boss.parryReaction?.move===coverMove&&boss.parryReaction.strikeT===.5);
  assert('coverCutsBossAttack',boss.state==='recover'&&boss.sequenceIndex===1&&
    interruptedHazard.done&&!unrelatedHazard.done);
  assert('coverRewardsOnlyPerfectDodge',skillLabSession.defenseStats.perfects===perfectBefore+1&&
    skillLabSession.defenseStats.parries===parryBefore);
  hazards.splice(hazards.indexOf(unrelatedHazard),1);hazards.splice(hazards.indexOf(interruptedHazard),1);
  boss.currentMove=priorCurrentMove;boss.attack=priorAttack;boss.parryReaction=priorReaction;
  assert('coverSingleUse',!resolveSquireCoveringShot());
  squire.hunterReady=coverHeld;boss.phase='player';boss.mark=0;
  assert('coverCanAttackInstead',resolveSquireReadyShot({actorId:'knight'},0)>0&&!squire.hunterReady);
  for(let rank=0;rank<4;rank++){
    squire.veterancy=SQUIRE_VETERANCY_RANKS[rank].min;drawSquire();
    assert('featherUpgradeGrowth'+rank,hunterFeatherSize(4,rank)>hunterFeatherSize(3,rank));
  }
  assert('firstFeatherFixed',hunterFeatherSize(1,0)===hunterFeatherSize(1,3)&&hunterFeatherSize(1,0)>1);
  assert('allFeathersReducedEighteenPercent',[1.35,1.70,2.15,3.15].every((size,i)=>
    Math.abs(hunterFeatherSize(i+1,0)-size*.82)<1e-8));
  assert('persistentEarthGhilliePalette',Object.isFrozen(squire.appearance.hunter)&&
    HUNTER_CLOAK_PALETTES.includes(squire.appearance.hunter.ghillie));
  const originalBushRenderer=drawHunterBushCloak,bushCalls=[];
  drawHunterBushCloak=(...args)=>{bushCalls.push(args);originalBushRenderer(...args);};
  drawSquire();drawHunterBushCloak=originalBushRenderer;
  assert('phantomWearsHeadToRumpBushCloak',bushCalls.length===1&&
    bushCalls[0].slice(1,4).every(Number.isFinite)&&bushCalls[0][3]>bushCalls[0][2]);
  const tracker=compileClassSkillRoute('squire_hunter_tracker',{1:'COMMON',2:'COMMON'}),
    trackerLegend=compileClassSkillRoute('squire_hunter_tracker',{1:'LEGENDARY',2:'LEGENDARY'});
  assert('trackerLineageAndQuality',tracker.squireHunterDepth===2&&tracker.evolutionHistory.length===2&&
    tracker.squireVeterancyEfficiency>common.squireVeterancyEfficiency&&
    trackerLegend.squireHunterReadyPower>tracker.squireHunterReadyPower&&
    tracker.squireHunterReadyPerVet>common.squireHunterReadyPerVet);
  assert('legendaryMarksScaleMeaningfully',legendary.squireHunterMarkCredit>=2&&
    trackerLegend.squireHunterMarkCredit>=3&&tracker.squireHunterMarkCredit>common.squireHunterMarkCredit);
  const markScaling={common:common.squireHunterMarkCredit,legendary:legendary.squireHunterMarkCredit,
    doubleCommon:tracker.squireHunterMarkCredit,doubleLegendary:trackerLegend.squireHunterMarkCredit};
  assert('commonMarkSteps',[1,2,2,3].every((marks,i)=>
    squireHunterWholeMarks(Array(i+1).fill('COMMON'))===marks));
  assert('legendaryMarkSteps',[2,4,6,8].every((marks,i)=>
    squireHunterWholeMarks(Array(i+1).fill('LEGENDARY'))===marks));
  const rarityChoices=['COMMON','UNCOMMON','RARE','LEGENDARY'];
  let paths=[[]];
  for(let depth=1;depth<=4;depth++){
    paths=paths.flatMap(path=>rarityChoices.map(rarity=>[...path,rarity]));
    assert('wholeMixedRarityMarksDepth'+depth,paths.every(path=>{
      const marks=squireHunterWholeMarks(path);
      return Number.isInteger(marks)&&marks>0&&marks<=8&&
        (depth===1||marks>=squireHunterWholeMarks(path.slice(0,-1)));
    }));
  }
  assert('detonationCapacityMatchesWholeMarks',[common,legendary,tracker,trackerLegend].every(command=>
    command.squireHunterReadyCapacity===command.squireHunterMarkCredit));
  replaceRunSkill('call_squire',trackerLegend);freshPhase();squire.veterancy=0;squire.encouragement=0;
  boss.mark=0;boss.markFraction=0;
  const legendaryShot=squireCombatProfile().skills[0];
  for(let shotIndex=0;shotIndex<3;shotIndex++){
    freshPhase();assert('legendaryShotStarts'+shotIndex,performPlayerAction(legendaryShot));stepAction();
  }
  assert('legendaryShotsAccumulateWholeMarks',boss.mark===Math.floor(legendaryShot.squireMarkCredit*3)&&boss.mark>=10);
  assert('hunterShotsLeaveNoFraction',boss.markFraction===0);
  squire.veterancy=9;
  assert('veterancyPreservesWholeMarkBudget',squireCombatProfile().skills[0].squireMarkCredit===legendaryShot.squireMarkCredit);
  squire.veterancy=0;
  replaceRunSkill('call_squire',tracker);freshPhase();
  assert('patientAimUnlocked',squireCombatProfile().skills[1].name==='PATIENT AIM');
  const rankLooks=[];
  for(const rank of SQUIRE_VETERANCY_RANKS){
    squire.veterancy=rank.min;
    rankLooks.push(JSON.stringify(hunterTrackerMantleSpec(rank.visualLevel)));
    squire.hunterReady=held;drawSquire();
    squire.hunterReady=null;drawSquire();
  }
  assert('fourDistinctTrackerRanks',new Set(rankLooks).size===4);
  freshPhase();assert('patientAimStarts',performPlayerAction(squireCombatProfile().skills[1]));
  stepAction();assert('patientAimHolds',!!squire.hunterReady);
  boss.phase='dodge';squire.health=1;squire.hunterReady=held;
  resolveSquireIntercept('HUNTER AUDIT');
  assert('deathClearsReady',!squire.present&&!squire.hunterReady&&!squire.hunterFollow&&squire.deathHunter);
  for(const t of [0,.2,.6,1,1.19]){squire.deathT=t;drawSquire();}
  assert('hunterDeathRenders',true);
  const savedLab={...bowRigLab},savedMantle=drawHunterTrackerMantle,mantleRanks=[];
  drawHunterTrackerMantle=(...args)=>{mantleRanks.push(args[1]);return savedMantle(...args);};
  Object.assign(bowRigLab,{actor:2,squireForm:3,paused:true,appearance:randomSquireAppearance(),compare:false});
  for(let rank=0;rank<4;rank++)for(let clip=0;clip<5;clip++){
    Object.assign(bowRigLab,{squireRank:rank,clip,t:clip===3?3:1});
    drawBowRigLab();
  }
  assert('animationLabRendersRealMantleAtAllRanks',new Set(mantleRanks).size===4&&mantleRanks.length===20);
  const labPalette=bowRigLab.appearance;
  bowRigLabTap({x:370,y:180});drawBowRigLab();
  assert('animationLabCompareRetainsPalette',bowRigLab.compare&&bowRigLab.appearance===labPalette);
  bowRigLabTap({x:135,y:180});assert('animationLabRankControl',bowRigLab.squireRank===0);
  bowRigLab.squireForm=SQUIRE_ANIM_FORMS.length-1;
  bowRigLabTap({x:20,y:180});assert('animationLabFormControl',bowRigLab.squireForm===0);
  assert('formSelectionLeavesComparison',!bowRigLab.compare);
  const savedRider=drawSerJonathanRider,previewForms=[];
  drawSerJonathanRider=(x,y,scale,options)=>previewForms.push({hunter:options.squireHunter,bulk:options.squireBulk});
  for(let i=0;i<SQUIRE_ANIM_FORMS.length;i++){drawBowRigLab();bowRigLabTap({x:20,y:180});}
  drawSerJonathanRider=savedRider;
  assert('animationLabCyclesActualRenderedForms',previewForms.length===6&&previewForms[5].hunter===4&&previewForms[4].hunter===3&&
    previewForms[0].hunter===0&&previewForms[0].bulk===0&&
    previewForms[1].hunter===0&&previewForms[1].bulk>0&&
    previewForms[2].hunter===1&&previewForms[3].hunter===2&&bowRigLab.squireForm===0);
  const selectedAppearance=bowRigLab.appearance,buildBefore=equippedSquireCommand();
  for(const entry of squireAnimationTreeEntries()){
    assert('treeSelect_'+(entry.id||'base'),selectSquireAnimationRoute(entry.id));
    for(let clip=0;clip<5;clip++){bowRigLab.clip=clip;bowRigLab.t=.3;drawBowRigLab();}
  }
  assert('treeSelectionPreservesBuildAndPalette',equippedSquireCommand()===buildBefore&&
    bowRigLab.appearance===selectedAppearance);
  selectSquireAnimationRoute('squire_living_bastion');
  assert('treeUsesCompiledGuardDepth',bowRigLab.routeCommand.squireGuardDepth===4&&
    riderLabOptions(bowRigLab).squireBulk>=bowRigLab.routeCommand.squireBulk);
  bowRigLab.treeOpen=true;bowRigLabTap({x:100,y:240});
  assert('treeMenuSelectsBase',bowRigLab.squireForm===0&&!bowRigLab.treeOpen);
  const treePress={done:false},clientX=(240*viewScale+viewX)/renderDpr(),
    clientY=(580*viewScale+viewY)/renderDpr(),priorTreeMode=mode,
    priorHealthLabState=healthLabState;
  mode='healthlab';healthLabState={bowRig:true};
  assert('timelineWorksWithoutTree',beginRiderLabDrag({},clientX,clientY));
  bowRigLab.treeOpen=true;
  assert('treeBlocksUnderlyingTimelineDrag',!beginRiderLabDrag(treePress,clientX,clientY)&&!treePress.done);
  bowRigLabTap({x:240,y:580});
  assert('treeLastUpgradeClickable',bowRigLab.routeId==='squire_hunter_phantom'&&
    bowRigLab.squireForm===5&&!bowRigLab.treeOpen);
  mode=priorTreeMode;healthLabState=priorHealthLabState;
  Object.assign(bowRigLab,{treeOpen:true,treeTarget:'left',treePair:true});
  selectSquireAnimationRoute('squire_hardened_veteran');
  assert('comparePickerAdvancesToRight',bowRigLab.treeOpen&&bowRigLab.treeTarget==='right');
  selectSquireAnimationRoute('squire_living_bastion');
  assert('comparePickerRetainsBothSkills',bowRigLab.compare&&!bowRigLab.treeOpen&&
    bowRigLab.compareLeftId==='squire_hardened_veteran'&&bowRigLab.compareRightId==='squire_living_bastion');
  const selectedPair=[];
  drawSerJonathanRider=(x,y,scale,o)=>selectedPair.push(o.squireBulk);
  drawBowRigLab();drawSerJonathanRider=savedRider;
  assert('compareRendersSelectedUpgradeDifferences',selectedPair.length===2&&selectedPair[1]>selectedPair[0]);
  Object.assign(bowRigLab,{treeOpen:true,treeTarget:'left'});selectSquireAnimationRoute(null);
  assert('compareSupportsBase',squireCompareState(bowRigLab,bowRigLab.compareLeftId).squireForm===0);
  drawHunterTrackerMantle=savedMantle;Object.assign(bowRigLab,savedLab);
  return {passed:true,checks,markScaling,firstShotFrames,commonQuality:common.synthesisQuality,
    legendaryQuality:legendary.synthesisQuality,shotDamage:shot.damage,markCredit:shot.squireMarkCredit,
    readyPower:ready.readyPower,noMarkDamage,selfDamage,assistDamage};
})();
