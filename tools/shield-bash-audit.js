;globalThis.__shieldBashAudit=(()=>{
  // Measurements only: no invented exchange rate between player and boss HP.
  openSkillLab();startSkillLabCombat();
  const checks={},assert=(name,value)=>{checks[name]=!!value;if(!value)throw new Error('Shield Bash: '+name);},
    rows=[],step=()=>{
      let frames=0;
      while(boss.phase==='playerResolve'&&frames++<600){
        updateTurnAction(1/60);boss.playerActionTimer-=1/60;
        if(boss.playerActionTimer<=0)finishPlayerAction();
      }
      assert('boundedTimeline',frames<600);
    },weapon=createRunSkill(BASE_TURN_SKILL_BY_ID.sharpshoot),
    fresh=(shields=0,posture=0)=>{
      applySkillLabPreset('clean',false);resetSquireCombat();
      boss.hp=boss.maxHp=10000;boss.posture=posture;boss.postureMax=CFG.BOSS_POSTURE_MAX;
      boss.phase='player';boss.state='idle';boss.turnAction=null;boss.playerPhaseSerial++;
      boss.partyActor='knight';boss.ap=9;boss.resolve=99;
      boss.classArmorExposure=null;boss.skillUseSerial=Object.create(null);
      boss.classSkillUseSerial=Object.create(null);player.invuln=0;
      player.shieldCharges=shields;player.volatileShieldCharges=0;player.volatileShieldPosture=0;
      chainStacks=0;
    },runWeapon=()=>{
      const hp=boss.hp;boss.ap=9;boss.resolve=99;chainStacks=0;
      assert('weaponStarts',performPlayerAction(weapon));step();return stableCombatNumber(hp-boss.hp);
    };
  fresh();const cleanWeaponDamage=runWeapon();
  for(const route of SHIELD_BASH_ROUTES){
    for(const shields of [0,1,2]){
      fresh(shields);const command=compileClassSkillRoute(route.id),hp=boss.hp;
      assert('starts_'+route.id+'_'+shields,performPlayerAction(command));
      assert('shieldAnimation_'+route.id,!!boss.turnAction.shieldTimeline&&!boss.turnAction.bowTimeline);
      step();
      const damage=stableCombatNumber(hp-boss.hp),posture=boss.posture,
        shieldsAfter=player.shieldCharges,volatileAfter=player.volatileShieldCharges,
        supportDamage=runWeapon()-cleanWeaponDamage;
      assert('supportIsolation_'+route.id,command.classArmorExposeRate>0?supportDamage>0:
        Math.abs(supportDamage)<.0001);
      const before=player.currentHealthUnits,priorGod=godMode;godMode=false;
      boss.phase='dodge';boss.state='idle';player.invuln=0;
      damagePlayer('SHIELD BASH AUDIT');godMode=priorGod;
      const actualLoss=before-player.currentHealthUnits,
        preventedUnits=Math.max(0,incomingPlayerDamageUnits(1)-actualLoss);
      rows.push({route:route.id,startingShields:shields,damage,posture,shieldsAfter,
        volatileAfter,supportDamage:stableCombatNumber(supportDamage),
        nextHitPreventedHearts:preventedUnits/PLAYER_HEALTH_CONTRACT.unitsPerHeart});
    }
  }
  assert('allRoutesMeasured',rows.length===SHIELD_BASH_ROUTES.length*3);
  const early=synthesizeF1StablePath('LEGENDARY','twin_rhythm','COMMON'),
    late=synthesizeF1StablePath('COMMON','twin_rhythm','LEGENDARY'),
    earlyPower=stableEvolutionCombinedGuardrailValue(early),latePower=stableEvolutionCombinedGuardrailValue(late);
  assert('reuseWeaponEarlyLegendaryContract',early.synthesisEffectiveQuality>late.synthesisEffectiveQuality&&
    earlyPower>latePower);
  const C={1:'COMMON',2:'COMMON',3:'COMMON',4:'COMMON'},
    guardLegendStyle=compileClassSkillRoute('shield_bash_guard_style',{...C,2:'LEGENDARY'}),
    guardSingleRare=compileClassSkillRoute('shield_bash_guard_mastery',{...C,3:'RARE'}),
    guardStackedRare=compileClassSkillRoute('shield_bash_guard_mastery',{...C,2:'RARE',3:'RARE'}),
    guardAllLegendary=compileClassSkillRoute('shield_bash_guard_capstone',
      {1:'LEGENDARY',2:'LEGENDARY',3:'LEGENDARY',4:'LEGENDARY'}),
    cycleAllLegendary=compileClassSkillRoute('shield_bash_cycle_capstone',
      {1:'LEGENDARY',2:'LEGENDARY',3:'LEGENDARY',4:'LEGENDARY'});
  assert('commonShieldQualityAddsNoBonus',compileClassSkillRoute(
    'shield_bash_guard_capstone',C).classShieldRarityBonus===0);
  assert('singleLegendaryShieldLayerBuysWholeShield',guardLegendStyle.classShieldRarityBonus===1);
  assert('singleRareShieldLayerKeepsFractionInternal',guardSingleRare.classShieldRarityBonus===0&&
    guardSingleRare.classShieldRarityCredits>0);
  assert('mixedRareShieldCreditsStackAcrossLayers',guardStackedRare.classShieldRarityBonus===1&&
    guardStackedRare.classShieldRarityCredits>SHIELD_BASH_SHIELD_CREDIT_STEP);
  assert('legendaryGuardCreditsStackAcrossAllLayers',guardAllLegendary.classShieldRarityBonus===3);
  assert('legendaryCycleCreditsStackAcrossAllLayers',cycleAllLegendary.classShieldRarityBonus===1);
  const setupCommon=[
      compileClassSkillRoute('shield_bash_setup_style',C),
      compileClassSkillRoute('shield_bash_setup_mastery',C),
      compileClassSkillRoute('shield_bash_setup_capstone',C)],
    setupLegendary=[
      compileClassSkillRoute('shield_bash_setup_style',{...C,1:'LEGENDARY',2:'LEGENDARY'}),
      compileClassSkillRoute('shield_bash_setup_mastery',{...C,1:'LEGENDARY',2:'LEGENDARY',3:'LEGENDARY'}),
      compileClassSkillRoute('shield_bash_setup_capstone',
        {1:'LEGENDARY',2:'LEGENDARY',3:'LEGENDARY',4:'LEGENDARY'})];
  assert('setupCommonAuthoredRatesStayExact',setupCommon.map(x=>x.classArmorExposeRate).join('|')===
    '0.15|0.15|0.2');
  assert('setupQualityRatesAccumulate',setupLegendary.every((command,index)=>
    command.classArmorExposeRate>setupCommon[index].classArmorExposeRate));
  const markBurst=createRunSkill(BASE_TURN_SKILL_BY_ID.mark_burst);
  fresh();boss.mark=1;let markHp=boss.hp;
  assert('cleanMarkBurstStarts',performPlayerAction(markBurst));step();
  const cleanMarkedBurst=stableCombatNumber(markHp-boss.hp);
  fresh();assert('totalExposureStarts',performPlayerAction(setupCommon[2]));step();
  boss.mark=1;boss.ap=9;boss.resolve=99;chainStacks=0;markHp=boss.hp;
  assert('exposedMarkBurstStarts',performPlayerAction(markBurst));step();
  const exposedMarkedBurst=stableCombatNumber(markHp-boss.hp);
  assert('totalExposureBoostsDirectAndDetonationPackets',
    Math.abs(exposedMarkedBurst-cleanMarkedBurst*1.2)<.001);
  const commonStylePower=(SKILL_RARITY_SYNTHESIS_ECONOMY.COMMON.quality+
    SKILL_SYNTHESIS_STRUCTURAL_QUALITY[2])*SKILL_SYNTHESIS_DEPTH_LEVERAGE[2]*SKILL_QUALITY_POWER_UNIT,
    percentHealthReference={bossHp:stableDamage(CFG.BOSS_HP_BASE),knightHearts:CHARS[0].maxHearts},
    shieldOpportunityPower=percentHealthReference.bossHp/percentHealthReference.knightHearts,
    pricingDiagnostic={commonStylePower,percentHealthReference,shieldOpportunityPower,
      commonLayerAloneCanBuyShield:commonStylePower>=shieldOpportunityPower,
      note:'Reference-only health-fraction comparison, not an approved synthesis coefficient.'};
  const unit=PLAYER_HEALTH_CONTRACT.unitsPerHeart;
  for(const [hit,shields,spent,lost] of [[2,2,2,0],[2,1,1,1],[3,1,1,2],
    [1,3,1,0],[.5,1,1,0],[1.5,1,1,.5],[0,2,0,0]]){
    fresh(shields);player.currentHealthUnits=player.maxHealthUnits;player.alive=true;
    boss.phase='dodge';const hp=player.currentHealthUnits,priorGod=godMode;godMode=false;
    damagePlayer('CAPACITY AUDIT',false,hit);godMode=priorGod;
    assert('oneShieldOneHeart_'+hit+'_'+shields,player.shieldCharges===shields-spent&&
      hp-player.currentHealthUnits===lost*unit);
  }
  fresh(3);player.volatileShieldCharges=2;player.volatileShieldPosture=VOLATILE_SHIELD_POSTURE_DAMAGE;
  boss.phase='dodge';const hp=player.currentHealthUnits,postureBefore=boss.posture,
    priorGod=godMode;godMode=false;damagePlayer('PURPLE CAPACITY AUDIT',false,2);godMode=priorGod;
  assert('twoPurpleShieldsEachPayOnce',player.shieldCharges===1&&player.volatileShieldCharges===0&&
    player.currentHealthUnits===hp&&boss.posture-postureBefore===2*VOLATILE_SHIELD_POSTURE_DAMAGE);
  fresh(2);player.invuln=1;const invulnHealth=player.currentHealthUnits;godMode=false;
  damagePlayer('INVULNERABLE AUDIT',false,2);godMode=priorGod;
  assert('invulnerabilityDoesNotSpend',player.shieldCharges===2&&player.currentHealthUnits===invulnHealth);
  fresh(2);godMode=false;damagePlayer('EXECUTION AUDIT',true,2);godMode=priorGod;
  assert('executionStillBypassesShields',player.shieldCharges===2&&!player.alive);
  const savedLab=healthLabState;healthLabState={maxHearts:4,currentUnits:unit*4,
    shieldCharges:1,damageMultiplier:2};healthLabApplyHit();
  assert('healthLabMatchesCombat',healthLabState.shieldCharges===0&&healthLabState.currentUnits===unit*3);
  healthLabState=savedLab;
  fresh(1);assert('legendaryVolatileStarts',performPlayerAction(cycleAllLegendary));step();
  assert('legendaryVolatileKeepsOnePurpleAndStacksNormal',player.volatileShieldCharges===1&&
    player.shieldCharges===2);
  return {passed:true,checks,cleanWeaponDamage,rows,
    shieldQuality:{guardLegendStyle:guardLegendStyle.classShieldRarityBonus,
      guardStackedRare:guardStackedRare.classShieldRarityBonus,
      guardAllLegendary:guardAllLegendary.classShieldRarityBonus,
      cycleAllLegendary:cycleAllLegendary.classShieldRarityBonus,
      setupCommon:setupCommon.map(x=>x.classArmorExposeRate),
      setupLegendary:setupLegendary.map(x=>x.classArmorExposeRate)},
    existingWeaponFoundation:{earlyQuality:early.synthesisEffectiveQuality,lateQuality:late.synthesisEffectiveQuality,
      earlyPower,latePower},pricingDiagnostic};
})();
