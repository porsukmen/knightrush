/* Six F6 cards x four current ranks + two high-parent sentinels each.
   Real prepare/defend/release transitions, not an ancestor Cartesian matrix. */
globalThis.__chargeSpecsAudit=(()=>{
  const defs=MARK_BURST_CHARGE_SPEC_DEFINITIONS,form=MARK_BURST_ROUTE_BY_ID.charge_primary_form,
    failures=[],rows=[],growth=[],balance=[],near=(a,b)=>Math.abs(a-b)<.004,
    check=(ok,message,detail)=>{if(!ok)failures.push({message,detail});},
    compile=(id,rank='COMMON',parent='COMMON')=>synthesizeMarkBurstDetonationPath(parent,id,rank),
    snap=c=>({id:c.activeAttributeRouteId,direct:commandDirectDamageTotal(c),hits:c.hits,
      preparation:commandPreparationDamage(c),rate:commandDefenseTemperRate(c),bank:c.chargeBankDamagePerPoint||0,
      crit:c.critChance||0,posture:c.posture||0,bleed:commandBleedAmount(c),
      capacity:c.markDetonationCoreCapacity||0,detonation:c.markRule?c.markRule.damagePerMark:0,
      score:stableEvolutionCombinedGuardrailValue(c)}),
    compare=(c,p,strong=false)=>{const a=snap(c),b=snap(p);
      for(const key of ['direct','hits','preparation','rate','bank','posture','bleed','capacity','detonation','score',
        ...(strong?[]:['crit'])])check(a[key]+.004>=b[key],'Parent/rank regression',{key,a,b});
    },inspect=(c,r)=>{
      const s=snap(c),pure=r.secondaryAttributeId==='CHARGE',identity=c.synthesisIdentityAllocation,
        receipts=c.synthesisQualityReceipts,plan=commandMarkPlan(c,100000),
        timeline=buildBowActionTimeline(c,commandDeliveryContract(c),0,600,8);
      check(c.baseAttributeId==='DETONATION'&&c.primaryAttributeId==='CHARGE'&&
        c.secondaryAttributeId===r.secondaryAttributeId&&commandChargeMode(c)==='DELAYED_PRIMARY'&&
        c.deliveryTiming==='DELAYED_RELEASE'&&c.markGain===0,'F6 identity/delay lost',s);
      check(near(identity.primaryShare,pure?1:.7)&&near(identity.secondaryShare,pure?0:.3),
        'Identity allocation drift',s);
      for(const receipt of receipts)check(near(receipt.baseAttributePowerAllocation,receipt.powerBudget*.1)&&
        near(Object.values(receipt.powerAllocation).reduce((a,b)=>a+b,0),receipt.powerBudget),
        'Base share/Quality conservation drift',s);
      check(s.preparation>0&&s.rate===0&&commandCollectsDefenseCharge(c)&&s.bank>0&&
        !c.chargePowerPerPoint&&!c.critDamageStatUnlocked&&!c.critPrecisionGain&&
        !c.breakPowerBonus&&!c.chargeAfflictionPerCharge&&!c.chargePosturePerPoint,
        'Unapproved stat/relationship or missing pure bank',s);
      check((s.crit>0)===(r.secondaryAttributeId==='CRITICAL')&&s.crit<=1&&
        (s.posture>0)===(r.secondaryAttributeId==='POSTURE')&&
        (s.bleed>0)===(r.secondaryAttributeId==='AFFLICTION'),'Secondary output ownership drift',s);
      check(!c.extraChainBonus&&!c.consumeChain&&totalCommandChainGain(c)===c.hits&&
        (r.secondaryAttributeId==='CHAIN'?c.hits>=2&&c.chargeSplitAcrossContacts&&
          c.deliveryPattern==='SEQUENTIAL':c.hits===1&&c.deliveryPattern==='SINGLE'),
        'Chain contact/scaling contract drift',s);
      check(plan.consumedTotal===s.capacity&&s.capacity>=1&&
        plan.markDamageByHit.slice(0,-1).every(n=>n===0)&&
        near(plan.markDamageByHit.at(-1),s.capacity*s.detonation),'Final dynamic Detonation lost',s);
      check(timeline.recipe.id===MARK_BURST_DETONATION_SPEC_ANIMATION_BY_ID[r.id]&&
        timeline.contacts.length===c.hits&&timeline.releases.length===c.hits&&timeline.firstRelease>0,
        'Bow recipe/contact mismatch',s);
      if(pure)check(c.chargePureMastery===true&&c.chargeBankDamagePerPoint>
        primaryChargeBankRate(c.synthesisAxisCredits.CHARGE_RELEASE||0),
        'Pure Charge did not add its paid mastery above the Primary bank',s);
      if(r.secondaryAttributeId==='CRITICAL')check(c.chargeCritIncludesRelease&&
        commandExpectedLocalCritPower(c)>0,'Crit did not price the whole release',s);
    };
  let cards=0,actions=0,phases=0;
  check(defs.length===6&&MARK_BURST_ROUTE_CONTRACTS.filter(r=>r.depth===2&&r.parentId===form.id).length===6,
    'F6 must expose six Specializations');
  for(const def of defs){
    const r=MARK_BURST_ROUTE_BY_ID[def.id];let previous=null;
    for(const rank of SKILL_RARITY_ORDER){
      const c=compile(def.id,rank);cards++;inspect(c,r);compare(c,synthesizeMarkBurstFormRoute(form,'COMMON'));
      if(previous)compare(c,previous);previous=c;rows.push({rank,...snap(c)});
      if(def.secondary==='CHAIN'){
        const primary=compile('burst_chain_focus_spec',rank);
        check(c.hits<primary.hits,'Secondary Chain outgrew Primary',{rank,secondary:c.hits,primary:primary.hits});
        growth.push({rank,secondary:c.hits,primary:primary.hits});
      }
    }
    for(const rank of ['COMMON','LEGENDARY']){
      const c=compile(def.id,rank,'LEGENDARY');cards++;inspect(c,r);
      compare(c,synthesizeMarkBurstFormRoute(form,'LEGENDARY'));compare(c,compile(def.id,rank),true);
    }
    check(compile(def.id,'LEGENDARY','LEGENDARY').markDetonationCoreCapacity>
      compile(def.id).markDetonationCoreCapacity,'Base Detonation stayed capped at low Quality',def.id);
  }
  for(const rank of SKILL_RARITY_ORDER){
    const values=rows.filter(r=>r.rank===rank).map(r=>r.score),
      spread=(Math.max(...values)-Math.min(...values))/Math.max(...values);
    check(spread<=.20,'F6 reference sibling balance exceeds 20%',{rank,spread});
    balance.push({rank,spread:Number(spread.toFixed(4))});
  }
  openSkillLab();
  for(const def of defs){
    for(let depth=1;depth<=4;depth++)moveTreeSynthesisRarityByDepth[depth]='COMMON';
    const node=WEAPON_SKILL_PROTOTYPE_LAB_NODE_BY_SKILL_AND_ID.mark_burst[def.id],
      preview=node&&moveTreeSynthesisPreviewCommand(node);
    check(preview&&preview.activeAttributeRouteId===def.id&&
      near(commandPreparationDamage(preview),commandPreparationDamage(compile(def.id)))&&
      near(preview.chargeBankDamagePerPoint||0,compile(def.id).chargeBankDamagePerPoint||0),
      'Lab preview missing/wrong',def.id);
  }
  const drain=()=>{const a=boss.turnAction;check(!!a,'No release action');if(!a)return null;
    while(a.hitIndex<a.hits)resolveTurnActionHit(a);
    a.t=.1;drawBowMechanicCue(a,a.bowTimeline,{from:{x:100,y:200},to:{x:300,y:200}});
    actions++;finishPlayerAction();return a;
  },release=(c,{bank=0,gain=2,mark=0,roll=.999999,auto=false,interleave=false,withSecondary=false}={})=>{
    startSkillLabCombat();applySkillLabPreset('clean',false);skillLabSession.forceCritical=false;
    boss.hp=boss.maxhp=1e9;boss.posture=0;boss.postureMax=1e6;boss.mark=mark;
    boss.ap=5;boss.resolve=100;boss.charge=bank;
    boss.chargeEnabled=commandCollectsDefenseCharge(c)||withSecondary;chainStacks=0;
    check(performPlayerAction(c)===true,'Prepare failed',c.activeAttributeRouteId);
    const pending=pendingPrimaryChargeRelease(),pure=c.chargePureMastery===true;
    check(pending&&pending.status==='ARMED'&&boss.phase==='player'&&!boss.turnAction&&
      boss.hp===boss.maxhp&&bossMark()===mark&&boss.ap===4&&boss.resolve===100-c.cost&&
      bossCharge()===0&&pending.reservedBank===bank&&!turnCommandAvailable(c),
      'Prepare cost/damage/lock/reservation drift',snap(c));
    check(releasePrimaryCharge()===false,'Release allowed before defense');
    check(endPlayerTurn()===true&&boss.phase==='dodge'&&pending.status==='DEFENDING',
      'Finish Turn did not enter defense without firing');
    for(let i=0;i<Math.floor(gain/2);i++)recordDefenseChargeSuccess(2,'PARRY');
    if(gain%2)recordDefenseChargeSuccess(1,'DODGE');
    check(boss.defenseChargeProgress===(boss.chargeEnabled?gain:0)&&
      pendingPrimaryChargeTotal()===gain+bank,
      'Charge counting/cap drift',{bank,gain,pure});
    drawDefenseChargeStatus(boss);
    check(beginPlayerTurn(false)===true,'Defense did not finish');phases++;
    check(pending.status==='READY'&&pending.charge===gain&&boss.defenseChargeProgress===0&&
      bossCharge()===0,'Defense ownership/bank settlement drift');
    if(interleave){
      const secondary=compile('burst_affliction_charge_spec');
      check(performPlayerAction(secondary)===true,'Intervening Secondary failed');
      const a=drain();check(a&&a.chargeSpent===0&&pending.reservedBank===bank,
        'Secondary spent reserved old bank');
      boss.hp=boss.maxhp;boss.bleed=0;boss.bleedLater=0;chainStacks=0;
    }
    const ap=boss.ap,resolve=boss.resolve,oldRandom=Math.random;
    try{Math.random=()=>roll;
      if(auto){
        check(endPlayerTurn()===true&&boss.phase==='dodge'&&pending.status==='DEFENDING'&&
          !boss.turnAction,'Finish Turn auto-fired a READY Release');
        recordDefenseChargeSuccess(1,'DODGE');
        check(beginPlayerTurn(false)===true&&pending.status==='READY'&&pending.charge===gain,
          'Withheld Release did not preserve the better completed defense phase');phases++;
      }
      check(releasePrimaryCharge()===true,'Free manual release failed');
      const action=boss.turnAction,expected=commandChargeReleaseBonus(c,gain+bank,mark,false);
      check(action&&near(action.chargeBonus,expected)&&action.chargeSpent===gain+bank&&
        boss.ap===ap&&boss.resolve===resolve&&!pendingPrimaryChargeRelease(),
        'Release price/Charge packet drift',{expected,actual:action&&action.chargeBonus});
      drain();
      check(!pendingPrimaryChargeRelease()&&releasePrimaryCharge()===false,'Release could be repeated');
      const result={damage:boss.maxhp-boss.hp,bank:bossCharge(),mark:bossMark(),bleed:bossBleed(),
        later:bossBleedLater(),posture:boss.posture,critical:action.anyCritical,
        chain:chainStacks,bonus:action.chargeBonus};
      check(action.bowTimeline.contacts.length===c.hits,'Runtime contact count drift');
      if(c.secondaryAttributeId==='CHAIN'){
        const markPlan=commandMarkPlan(c,mark),
          expectedDamage=Array.from({length:c.hits},(_,i)=>combatTurnHitDamageBreakdown(
          stableDamage(commandHitBase(c,i)+expected/c.hits),markPlan.markDamageByHit[i],0,i,false,chainBonus(),false,
          CFG.CRIT_DAMAGE_MULT).final).reduce((a,b)=>a+b,0);
        check(near(result.damage,expectedDamage),'Runtime duplicated Charge or failed live Chain',
          {damage:result.damage,expectedDamage});
      }
      return result;
    }finally{Math.random=oldRandom;}
  };
  for(const def of defs){
    const c=compile(def.id),empty=release(c,{gain:0}),successful=release(c,{gain:12}),
      full=release(c,{bank:3,gain:4,mark:10000});
    check(successful.damage>empty.damage,
      'Native Primary failed to express earned defense Charge',{id:def.id,empty,successful});
    check(empty.damage>0&&full.damage>empty.damage&&full.mark===10000-c.markDetonationCoreCapacity&&
      full.chain===c.hits&&full.bank===0,
      'Native delayed output/resources lost',{id:def.id,empty,full});
    if(def.secondary==='AFFLICTION'){
      check(near(full.bleed,commandBleedAmount(c))&&near(full.later,full.bleed),
        'Charge multiplied wound',full);
      const hp=boss.hp;resolveBossPhaseBleed(false);resolveBossPhaseBleed(false);
      check(near(hp-boss.hp,2*stableDamage(full.bleed))&&bossBleed()===0&&bossBleedLater()===0,
        'Bleed did not expire after two ticks');
    }
  }
  const pure=compile('burst_charge_focus_spec'),protectedRelease=release(pure,{bank:3,gain:4,interleave:true}),
    immediate=release(pure,{bank:3,gain:4}),low=release(pure,{bank:12,gain:12}),
    high=release(pure,{bank:120,gain:120});
  check(near(protectedRelease.damage,immediate.damage)&&near(high.bonus-commandPreparationDamage(pure),
    (low.bonus-commandPreparationDamage(pure))*10),
    'Reservation or uncapped linear scaling failed',{protectedRelease,immediate,low,high});
  release(pure,{bank:3,gain:4,auto:true});
  const crit=compile('burst_charge_critical_spec'),normal=release(crit,{gain:4,mark:20}),
    critical=release(crit,{gain:4,mark:20,roll:0});
  check(!normal.critical&&critical.critical&&normal.mark===critical.mark&&near(critical.damage-normal.damage,
    stableDamage((commandDirectDamageTotal(crit)+normal.bonus)*crit.critDamageMultiplier)-
      stableDamage(commandDirectDamageTotal(crit)+normal.bonus)),
    'Critical did not multiply direct + Charge only',{normal,critical});
  const mixed=release(compile('burst_charge_detonation_spec'),{bank:3,gain:4,withSecondary:true});
  check(mixed.bank===0,'Prepared Primary failed to reserve/spend its own old and new bank');
  // Both skills use the corrected native motor, including the bare Form.
  for(const spec of [null,...SHARPSHOOT_CHARGE_PRIMARY_BLUEPRINTS.map(row=>row.specId)]){
    const c=synthesizeSharpshootChargePath('COMMON',spec,'COMMON'),
      empty=release(c,{gain:0}),earned=release(c,{gain:12});
    check(commandPreparationDamage(c)>0&&commandCollectsDefenseCharge(c)&&
      earned.damage>empty.damage,
      'Sharpshoot native Primary failed to use defense Charge',{spec,empty,earned});
  }
  for(const [spec,twist] of [['charge_mark_spec','charge_mark_conversion_twist'],
    ['charge_posture_spec','charge_posture_impact_twist'],
    ['charge_affliction_spec','charge_affliction_wound_twist']]){
    const c=synthesizeSharpshootChargePath('COMMON',spec,'COMMON',twist,'COMMON'),r=release(c,{gain:0});
    check(r.damage>commandDirectDamageTotal(c)&&r.bank===0&&
      (c.preparedRelease.mark?r.mark>=c.markGain+Math.floor(c.preparedRelease.mark):true)&&
      (c.preparedRelease.posture?r.posture>c.posture:true)&&
      (c.preparedRelease.bleed?r.bleed>commandBleedAmount(c):true),
      'Legacy paid prepared payload disappeared at zero defense',{twist,r});
  }
  check(defenseChargeBankResult(3,4)===4&&defenseChargeBankResult(7,2)===7,
    'Normal Secondary best-phase bank changed');
  startSkillLabCombat();applySkillLabPreset('clean',false);
  boss.ap=5;boss.resolve=100;boss.charge=3;boss.chargeEnabled=true;
  check(performPlayerAction(pure)&&pendingPrimaryChargeRelease().reservedBank===3,
    'Reset sentinel did not reserve bank');
  applySkillLabPreset('clean',false);
  check(!pendingPrimaryChargeRelease()&&bossCharge()===0,'Lab reset retained prepared Charge');
  return {passed:!failures.length,specializations:defs.length,cards,actions,phases,balance,growth,
    rows:rows.filter(r=>r.rank==='COMMON'),failures};
})();
