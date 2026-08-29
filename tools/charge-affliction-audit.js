/* F6S5: sparse ranks/strong parents, then real application and phase boundaries. */
globalThis.__chargeAfflictionAudit=(()=>{
  const defs=MARK_BURST_CHARGE_AFFLICTION_TWIST_DEFINITIONS,failures=[],rows=[],ranks=[],
    check=(ok,message,detail)=>{if(!ok)failures.push({message,detail});},near=(a,b)=>Math.abs(a-b)<.02,
    compile=(t,a=0,rank='COMMON',base='COMMON')=>synthesizeMarkBurstDetonationPath(base,
      'burst_charge_affliction_spec',base,t.id,a?'COMMON':rank,a?t.id+'_apex_'+a:null,rank),
    snap=c=>({id:c.activeAttributeRouteId,direct:commandDirectDamageTotal(c),hits:c.hits,
      preparation:commandPreparationDamage(c),bleed:commandBleedAmount(c),capacity:c.markDetonationCoreCapacity,
      potency:c.markRule.damagePerMark,relationship:commandExpectedPreparedAfflictionPower(c),
      score:stableEvolutionCombinedGuardrailValue(c)}),
    compare=(c,p)=>{const a=snap(c),b=snap(p);for(const k of Object.keys(a).filter(k=>k!=='id'))
      check(a[k]+.001>=b[k],'Parent/rank regression: '+k,{child:a,parent:b});},
    spread=rs=>{const vs=rs.map(r=>r.score);return (Math.max(...vs)-Math.min(...vs))/Math.max(...vs);};
  let cards=0,actions=0,phases=0;
  const brief=MARK_BURST_CHARGE_AFFLICTION_BRIEF,entries=defs.map(t=>({id:t.id,
    deliveryPattern:t.key==='sequence'?'SEQUENTIAL':'SINGLE',identity:MARK_BURST_ROUTE_BY_ID[t.id].twistIdentity})),
    neighbors=MARK_BURST_ROUTE_CONTRACTS.filter(r=>r.depth===3&&brief.comparisonSpecIds.includes(r.parentId))
      .map(r=>({id:r.id,deliveryPattern:r.delivery.pattern,identity:r.twistIdentity})),
    identity=auditTwistIdentitySet(entries,brief,neighbors),neighborSimilarity=Math.max(...entries.flatMap(e=>
      neighbors.map(n=>twistIdentityBehaviorSimilarity(e.identity,n.identity))));
  check(defs.length===4&&defs.every(t=>t.apexes.length===4),'Expected 4/16 family');
  check(identity.passed&&neighborSimilarity<=brief.maxCatalogSimilarity,'Identity/neighbor failure',{identity,neighborSimilarity});
  const inspect=c=>{
    const f=c.chargeAffliction,s=snap(c),ledger={totalQuality:c.synthesisQuality,receipts:c.synthesisQualityReceipts};
    check(f&&Object.isFrozen(f)&&commandChargeMode(c)==='DELAYED_PRIMARY'&&
      commandCollectsDefenseCharge(c)&&!commandDefenseTemperRate(c)&&c.chargeBankDamagePerPoint>0,'Primary/bank drift',s);
    check(!c.markGain&&!c.critChance&&!c.critPrecisionGain&&!c.critDamageStatUnlocked&&!c.breakPowerBonus&&
      !c.posture&&!c.extraChainBonus&&!c.consumeChain&&c.afflictionSplitPerContact,'Third attribute/native wound drift',s);
    check(c.markDetonationHitIndex===c.hits-1&&commandMarkPlan(c,10000).consumedTotal===s.capacity&&
      totalCommandChainGain(c)===c.hits,'Contact/Detonation drift',s);
    if(f.engine==='PREP_AFF_SEQUENCE')check(c.hits>=2&&c.hits<skillRoleContactMagnitude(
      {primaryAttributeId:'CHARGE',secondaryAttributeId:'CHAIN',mechanics:{}},ledger),'Support arrows outgrew Secondary Chain',s);
    check(near(c.synthesisIdentityAllocation.primaryShare,.7)&&near(c.synthesisIdentityAllocation.secondaryShare,.3),'70/30 drift',s);
    for(const receipt of c.synthesisQualityReceipts)check(near(receipt.baseAttributePowerAllocation,receipt.powerBudget*.1)&&
      near(Object.values(receipt.powerAllocation).reduce((n,p)=>n+p,0),receipt.powerBudget),'Base/Quality drift',s);
  };
  for(const t of defs){const common=compile(t);rows.push(snap(common));
    compare(common,synthesizeMarkBurstDetonationPath('COMMON','burst_charge_affliction_spec','COMMON'));
    for(let a=0;a<=4;a++){let previous=null;for(const rank of SKILL_RARITY_ORDER){
      const c=compile(t,a,rank);cards++;inspect(c);if(a)compare(c,common);if(previous)compare(c,previous);previous=c;
      ranks.push({rank,apex:a,twist:t.id,...snap(c)});check(c.animationRecipeId===t.recipe,'Recipe drift',c.activeAttributeRouteId);
    }}
    const high=compile(t,0,'COMMON','LEGENDARY');cards++;inspect(high);
    compare(high,synthesizeMarkBurstDetonationPath('LEGENDARY','burst_charge_affliction_spec','LEGENDARY'));
    for(let a=1;a<=4;a++){const c=compile(t,a,'COMMON','LEGENDARY');cards++;inspect(c);compare(c,high);}
  }
  const apexSpreads=[];
  for(const rank of SKILL_RARITY_ORDER){
    check(spread(ranks.filter(r=>r.rank===rank&&!r.apex))<=.2,'Twist power band >20%',rank);
    for(const t of defs){const gap=spread(ranks.filter(r=>r.rank===rank&&r.twist===t.id&&r.apex));
      check(gap<=.25,'Apex power band >25%',{rank,id:t.id,gap});if(rank==='COMMON')apexSpreads.push({id:t.id,spread:gap});}
  }
  openSkillLab();
  const reset=()=>{startSkillLabCombat();applySkillLabPreset('clean',false);skillLabSession.forceCritical=false;
    boss.hp=boss.maxhp=1e9;boss.posture=0;boss.postureMax=1e6;boss.mark=20;
    boss.ap=100;boss.resolve=1000;boss.charge=0;boss.chargeEnabled=false;chainStacks=0;},
    drain=()=>{const a=boss.turnAction;if(!a)throw new Error('Missing action '+JSON.stringify(failures.slice(-3)));
      a.t=.1;drawBowMechanicCue(a,a.bowTimeline,{from:{x:100,y:200},to:{x:300,y:200}});
      drawDefenseChargeStatus(boss);updateTurnAction(100);actions++;finishPlayerAction();return a;},
    prepare=c=>{boss.ap=100;boss.resolve=1000;const hp=boss.hp,mark=bossMark(),bleed=bossBleed();
      check(performPlayerAction(c),'Prepare failed',c.activeAttributeRouteId);
      check(pendingPrimaryChargeRelease()?.status==='ARMED'&&boss.phase==='player'&&!boss.turnAction&&boss.hp===hp&&
        bossMark()===mark&&near(bossBleed(),bleed),'Prepare fired, wounded or detonated');
      check(endPlayerTurn()&&pendingPrimaryChargeRelease()?.status==='DEFENDING',
        'Prepare did not wait for manual Finish Turn');},
    ready=(c,gain=0)=>{prepare(c);for(let i=0;i<gain;i++)recordDefenseChargeSuccess(1,'DODGE');
      check(beginPlayerTurn(),'Missing ready phase');phases++;boss.ap=100;boss.resolve=1000;},
    release=()=>{const ap=boss.ap,resolve=boss.resolve;check(releasePrimaryCharge(),'Release failed');
      if(boss.turnAction)boss.turnAction.critPlan=createCommandCritPlan(boss.turnAction.command,'knight',()=>1,0);
      const a=drain();check(a.resolveSpent===0&&boss.ap===ap&&boss.resolve===resolve&&
        !pendingPrimaryChargeRelease()&&bossCharge()===0,'Free Release/no-bank failed');return a;},
    attack=(c,free=false)=>{boss.ap=100;boss.resolve=1000;check(performPlayerAction(c,{freeFollowUp:free}),'Attack failed');return drain();},
    plain={...createRunSkill(BASE_TURN_SKILL_BY_ID.mark_burst),markRule:null,markDetonation:false,damage:1,hits:1,canCrit:false},
    wound={...createRunSkill(BASE_TURN_SKILL_BY_ID.sharpshoot),markRule:null,markGain:0,damage:1,hits:1,canCrit:false,
      affliction:{id:'BLEED',amount:4},afflictionSplitPerContact:true},
    nextCharge=synthesizeMarkBurstDetonationPath('COMMON','burst_charge_detonation_spec','COMMON'),
    foreignCharge=synthesizeSharpshootChargePath('COMMON','charge_mark_spec','COMMON'),
    [feed,sequence,setup,barb]=defs;
  for(const t of defs)for(let i=0;i<=4;i++){
    const c=compile(t,i);reset();ready(c,3);const a=release(),prep=Array.from({length:a.hits},(_,j)=>
      commandChargeContactPayload(a.command,a.chargeBonus,0,a.hits,j)).reduce((n,v)=>n+v,0),
      native=commandBleedAmount(c)+(t.key==='sequence'?c.chargeAffliction.clean:0);
    check(near(prep,commandPreparationDamage(c))&&near(a.preparedAfflictionApplied,native)&&near(bossBleedLater(),native)&&
      a.consumedMark===c.markDetonationCoreCapacity&&a.bowTimeline.contacts.length===c.hits,'Native payload copied/lost',c.activeAttributeRouteId);
    for(let d=1;d<=4;d++)moveTreeSynthesisRarityByDepth[d]='COMMON';
    const node=WEAPON_SKILL_PROTOTYPE_LAB_NODE_BY_SKILL_AND_ID.mark_burst[c.activeAttributeRouteId],
      preview=node&&moveTreeSynthesisPreviewCommand(node);
    check(preview&&near(commandExpectedPreparedAfflictionPower(preview),commandExpectedPreparedAfflictionPower(c)),
      'Lab preview mismatch',c.activeAttributeRouteId);
  }
  for(let i=0;i<=4;i++){
    reset();const c=compile(feed,i),f=c.chargeAffliction;attack(wound);if(i===2)boss.bleedLater=0;
    ready(c);const p=pendingPrimaryChargeRelease().preparedAffliction;
    check(p.tickSeen&&near(p.tickDamage,4)&&p.coop,'Old actual tick/Coop not recorded',i);
    boss.bleed=0;boss.bleedLater=0;const a=release();
    check(near(a.preparedAfflictionDirect,4*(f.feed+(i===2?f.last:0)+f.coop)),'Feed Apex/source snapshot failed',i);
  }
  reset();const empty=compile(feed,4);prepare(empty);addBossBleed(4);beginPlayerTurn();phases++;
  check(near(release().preparedAfflictionDirect,empty.chargeAffliction.empty),'New defense wound counted as pre-existing');
  reset();attack(wound);prepare(compile(feed));boss.postureMax=100;boss.posture=99.99;
  applyBossPosture(1,'parry');phases++;const breakFeed=release();
  check(near(breakFeed.preparedAffliction.tickDamage,4*BLEED_STATUS.breakMultiplier),'Actual Break tick damage ignored');
  for(let i=0;i<=4;i++)for(const clean of [false,true]){
    reset();const c=compile(sequence,i),f=c.chargeAffliction;if(!clean)addBossBleed(4);
    ready(c);chainStacks=100;const before=boss.hp,a=release(),own=commandBleedAmount(c)+(clean?f.clean:0),
      expectedBonus=own*f.sequence+f.early;
    check(near(a.preparedAfflictionOwnApplied,own)&&near(a.preparedAfflictionDirect,expectedBonus),
      'Sequence/Apex read old or duplicated wound',i);
    let expected=expectedBonus;
    for(let j=0;j<a.hits;j++)expected+=(commandHitBase(c,j)+commandChargeContactPayload(c,a.chargeBonus,0,a.hits,j))*
      (1+chainBonus()*(100+j))+(a.markPlan.markDamageByHit[j]||0);
    check(near(before-boss.hp,expected),'Real HP duplicated prep, wound bonus or Chain',{i,actual:before-boss.hp,expected});
  }
  reset();const early=compile(sequence,4);ready(early);attack(plain);const late=release();
  check(near(late.preparedAfflictionDirect,late.preparedAfflictionOwnApplied*early.chargeAffliction.sequence),'Early bonus leaked');
  for(let i=0;i<=4;i++){
    reset();const c=compile(setup,i),f=c.chargeAffliction;ready(c);attack(wound);const a=release(),p=a.preparedAffliction;
    check(p.actions===1&&near(p.wound,4)&&near(p.foreignWound,4)&&
      near(a.preparedAfflictionApplied,commandBleedAmount(c)+4*(f.setup+f.one+f.handoff)), 'Ready setup/Apex failed',i);
  }
  reset();const one=compile(setup,2);attack(wound);ready(one);attack(plain);const noSetup=release();
  check(noSetup.preparedAffliction.wound===0&&near(noSetup.preparedAfflictionApplied,commandBleedAmount(one)),
    'Old wound or non-wounding attack counted as setup');
  reset();ready(one);attack(wound);attack(plain);const two=release();
  check(two.preparedAffliction.actions===2&&near(two.preparedAfflictionApplied,commandBleedAmount(one)+4*one.chargeAffliction.setup),
    'One-action bonus survived a second attack');
  reset();const direct=compile(setup,4);ready(direct);attack(wound,true);boss.ap=0;
  check(!performPlayerAction(plain)&&pendingPrimaryChargeRelease().preparedAffliction.actions===0,'Failed/free action counted as setup');
  boss.ap=100;check(near(release().preparedAfflictionDirect,direct.chargeAffliction.direct),'Direct Release fallback failed');
  // Own two native ticks, with/without preparing and same/different Charge skill.
  for(let i=0;i<=4;i++)for(const preparing of [false,true]){
    reset();const c=compile(barb,i),f=c.chargeAffliction;ready(c);release();
    for(let tick=0;tick<2;tick++){
      if(preparing)prepare(i===3?foreignCharge:nextCharge);else endPlayerTurn();
      const before=boss.hp,native=bossBleed(),mark=bossMark(),chain=chainStacks,
        extra=preparing?f.barb+(tick===0?f.first:0)+(i===3?f.rotation:0):f.safe;
      check(beginPlayerTurn(),'Tick phase failed');phases++;
      check(near(before-boss.hp,native+extra)&&bossMark()===mark&&chainStacks===chain&&bossCharge()===0,
        'Barb tick/Apex copied native payload or generated resource',{i,preparing,tick,actual:before-boss.hp,expected:native+extra});
      if(preparing){boss.ap=100;boss.resolve=1000;release();}
    }
    check(!boss.preparedAfflictionBarbs,'Barb survived its two native ticks');
  }
  reset();const b=compile(barb);ready(b);release();prepare(compile(feed));const native=bossBleed();
  beginPlayerTurn();phases++;check(near(pendingPrimaryChargeRelease().preparedAffliction.tickDamage,native),
    'Barb bonus fed back into preparation');release();
  reset();ready(b);release();resetSkillLabTurn();
  check(!boss.preparedAfflictionBarbs&&!boss.preparedAfflictionLastAttack&&boss.preparedAfflictionTickPhase===null&&
    !pendingPrimaryChargeRelease(),'Reset leaked prepared wounds');
  return {passed:!failures.length,twists:4,apexes:16,cards,actions,phases,spread:spread(rows),apexSpreads,
    identity:{passed:identity.passed,distinctCores:identity.distinctCores,maximumSimilarity:identity.maximumSimilarity,neighborSimilarity},rows,failures};
})();
