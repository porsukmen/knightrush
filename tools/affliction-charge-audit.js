/* F5S6: 76 current-rank cards + four strong-parent sentinels, bounded real combat scenarios. */
globalThis.__afflictionChargeAudit=(()=>{
  const defs=MARK_BURST_AFFLICTION_CHARGE_TWIST_DEFINITIONS,failures=[],rows=[],rankRows=[],
    check=(ok,message,detail)=>{if(!ok)failures.push({message,detail});},near=(a,b)=>Math.abs(a-b)<.0041,
    compile=(t,a=0,rank='COMMON',base='COMMON')=>synthesizeMarkBurstDetonationPath(base,
      'burst_affliction_charge_spec',base,t.id,a?'COMMON':rank,a?t.id+'_apex_'+a:null,rank),
    snap=c=>({id:c.activeAttributeRouteId,direct:commandDirectDamageTotal(c),bleed:commandBleedAmount(c),
      charge:commandDefenseTemperRate(c),capacity:c.markDetonationCoreCapacity,potency:c.markRule.damagePerMark,
      relationship:commandExpectedAfflictionChargePower(c),score:stableEvolutionCombinedGuardrailValue(c)}),
    compare=(c,p)=>{const a=snap(c),b=snap(p);for(const key of Object.keys(a).filter(k=>k!=='id'))
      check(a[key]+.0041>=b[key],'Parent/rank regression: '+key,{child:a,parent:b});},
    spread=rs=>{const vs=rs.map(r=>r.score);return (Math.max(...vs)-Math.min(...vs))/Math.max(...vs);};
  let cards=0,actions=0,phases=0;
  const parent=synthesizeMarkBurstDetonationPath('COMMON','burst_affliction_charge_spec','COMMON'),
    brief=MARK_BURST_AFFLICTION_CHARGE_BRIEF,entries=defs.map(t=>({id:t.id,
      deliveryPattern:'SINGLE',identity:MARK_BURST_ROUTE_BY_ID[t.id].twistIdentity})),
    neighbors=MARK_BURST_ROUTE_CONTRACTS.filter(r=>r.depth===3&&brief.comparisonSpecIds.includes(r.parentId))
      .map(r=>({id:r.id,deliveryPattern:r.delivery.pattern,identity:r.twistIdentity})),
    identity=auditTwistIdentitySet(entries,brief,neighbors),neighborSimilarity=Math.max(...entries.flatMap(e=>
      neighbors.map(n=>twistIdentityBehaviorSimilarity(e.identity,n.identity))));
  check(defs.length===4&&defs.map(t=>t.apexes.length).join('/')==='4/4/3/4','Expected 4/15 family');
  check(identity.passed&&neighborSimilarity<=brief.maxCatalogSimilarity,'Identity/neighbor failure',
    {identity,neighborSimilarity});
  for(const t of defs){
    const common=compile(t);compare(common,parent);rows.push(snap(common));
    const decisions=t.apexes.filter(a=>APEX_MEANINGFUL_DECISION_CLASSES.has(a.decisionClass));
    check(decisions.length>=2&&new Set(decisions.map(a=>a.decisionClass)).size>=2,
      'Apex decisions collapsed',t.id);
    check(MARK_BURST_ROUTE_BY_ID[t.id].apexTarget===t.apexes.length,'Apex target mismatch',t.id);
    for(let a=0;a<=t.apexes.length;a++){
      let previous=null;
      for(const rank of SKILL_RARITY_ORDER){
        const c=compile(t,a,rank),s=snap(c),f=c.afflictionCharge,route=MARK_BURST_ROUTE_BY_ID[c.activeAttributeRouteId];
        cards++;if(a)compare(c,common);if(previous)compare(c,previous);previous=c;
        rankRows.push({rank,apex:a,twist:t.id,...s});
        check(f&&f.engine===t.engine&&c.hits===1&&c.deliveryPattern==='SINGLE'&&
          totalCommandChainGain(c)===1&&c.animationRecipeId===t.recipe&&commandChargeMode(c)==='FULL_RELEASE',
          'Parent delivery/Charge/animation drift',s);
        check(!c.critChance&&!c.critPrecisionGain&&!c.critDamageStatUnlocked&&!c.posture&&!c.breakPowerBonus&&
          !c.afflictionFocus&&!c.extraChainBonus&&!c.consumeChain&&!c.markGain,'Third attribute leak',s);
        check(c.markDetonationHitIndex===0&&c.markRule.cap===c.markDetonationCoreCapacity,
          'Base Detonation drift',s);
        check(near(c.synthesisIdentityAllocation.primaryShare,.70)&&
          near(c.synthesisIdentityAllocation.secondaryShare,.30),'70/30 drift',s);
        for(const receipt of c.synthesisQualityReceipts)check(near(receipt.baseAttributePowerAllocation,
          receipt.powerBudget*.1)&&near(Object.values(receipt.powerAllocation).reduce((n,x)=>n+x,0),
          receipt.powerBudget),'Quality/Base receipt leak',s);
        check(AFFLICTION_CHARGE_AXES.every(axis=>!(c.synthesisAxisReserve[axis]>0)),
          'Unused relationship Quality',s);
        if(a)check(route.apexDesign.version===2&&route.apexDesign.runtimeEvidence.length>=3&&
          !/son AP|son kullanılabilir AP|son komut/i.test(route.promise),'Apex metadata / removed condition',s);
      }
    }
    const high=compile(t,0,'COMMON','LEGENDARY');cards++;compare(high,
      synthesizeMarkBurstDetonationPath('LEGENDARY','burst_affliction_charge_spec','LEGENDARY'));
  }
  const apexSpreads=[];
  for(const rank of SKILL_RARITY_ORDER){
    check(spread(rankRows.filter(r=>r.rank===rank&&!r.apex))<=.20,'Twist power band >20%',rank);
    for(const t of defs){const gap=spread(rankRows.filter(r=>r.rank===rank&&r.twist===t.id&&r.apex));
      check(gap<=.25,'Apex power band >25%',{rank,id:t.id,gap});if(rank==='COMMON')apexSpreads.push({id:t.id,spread:gap});}
  }
  openSkillLab();
  const perform=c=>{
    const oldRandom=Math.random;try{Math.random=()=>.999999;
      check(performPlayerAction(c),'Action failed',c.activeAttributeRouteId);const a=boss.turnAction;
      if(!a)return null;actions++;
      if(a.bowTimeline)drawBowMechanicCue(a,a.bowTimeline,{from:{x:300,y:400},to:{x:600,y:400}});
      while(a.hitIndex<a.hits)resolveTurnActionHit(a);
      drawBossBleedStatus(boss);drawDefenseChargeStatus(boss);finishPlayerAction();return a;
    }finally{Math.random=oldRandom;}
  },start=(c,{charge=8,bleed=0,later=bleed,flawless=false,count=0,last=null,marks=20}={})=>{
    startSkillLabCombat();applySkillLabPreset('clean',false);boss.maxhp=boss.hp=1e12;
    boss.postureMax=1e6;boss.posture=0;boss.mark=marks;boss.bleed=bleed;boss.bleedLater=later;
    boss.chargeEnabled=true;boss.charge=charge;boss.ap=boss.resolve=100;chainStacks=0;
    boss.lastDefenseFlawless=flawless;boss.playerPhaseAttackCount=count;
    boss.criticalFocusLastAttack=last?{knight:last}:{};skillLabSession.forceCritical=false;
    const a=perform(c);if(!a)return {};
    check(a.chargeSpent===charge&&bossCharge()===0&&near(a.chargeBonus,charge*commandDefenseTemperRate(c)),
      'Cast lost/doubled parent Charge payment',{id:c.activeAttributeRouteId,charge,spent:a.chargeSpent,bonus:a.chargeBonus});
    check(chainStacks===1&&boss.mark===Math.max(0,marks-c.markDetonationCoreCapacity),
      'Real contact/Mark consumption mismatch',c.activeAttributeRouteId);
    return {a,now:bossBleed()-bleed,later:bossBleedLater()-later,
      refund:boss.afflictionChargeState&&boss.afflictionChargeState.now.refund||0};
  },defend=(kinds=['PARRY'],hit=false)=>{
    boss.phase='dodge';boss.state='idle';startDefenseChargePhase();
    for(const kind of kinds)recordDefenseChargeSuccess(kind==='PARRY'?2:1,kind);
    if(hit){player.invuln=0;damagePlayer('audit');}
    const before={hp:boss.hp,now:bossBleed(),later:bossBleedLater(),bank:bossCharge(),
      gain:boss.defenseChargeProgress,chain:chainStacks,marks:boss.mark};
    check(beginPlayerTurn(false)!==false,'Defense phase did not close');phases++;
    check(chainStacks===before.chain&&boss.mark===before.marks,'Wound tick generated Chain/Mark');
    return {...before,damage:before.hp-boss.hp,after:bossCharge(),next:bossBleed(),nextLater:bossBleedLater()};
  },previous=(c,same=false)=>({id:same?(c.baseId||c.id||c.name):'other_skill',
    route:same?c.activeAttributeRouteId:'other_route'}),runs=new Map();
  // Exercise every actual Apex and both scheduled ticks, not only metadata or helpers.
  for(const t of defs)for(let a=0;a<=t.apexes.length;a++){
    const c=compile(t,a),cast=start(c),first=defend(),second=defend();
    runs.set(t.key+'_'+a,{c,cast,first,second});
    check(bossBleed()===0&&bossBleedLater()===0,'Wound exceeded two ticks',c.activeAttributeRouteId);
    const state=boss.afflictionChargeState;
    check(!state||Object.values(state.now).every(n=>n===0)&&Object.values(state.later).every(n=>n===0)&&
      state.readyRefund===0,'Delayed Charge state survived its two ticks',c.activeAttributeRouteId);
  }
  const loaded=compile(defs[0]),base=runs.get('loaded_0'),emptyC=compile(defs[0],2),
    empty=start(emptyC,{charge:0}),emptyBase=start(loaded,{charge:0}),perfectC=compile(defs[0],3),
    perfect=start(perfectC,{flawless:true}),imperfect=start(perfectC),double=start(loaded,{charge:16});
  check(runs.get('loaded_1').cast.now>base.cast.now&&empty.now>emptyBase.now&&
    perfect.now>imperfect.now&&runs.get('loaded_4').cast.now>base.cast.now,'Loaded Apex behavior');
  check(near(double.now-commandBleedAmount(loaded),2*(base.cast.now-commandBleedAmount(loaded))),
    'Charge wound is not linear / duplicates native wound');
  // Real completed-defense evidence, including ignored invulnerability and actual damage.
  start(perfectC);defend();check(boss.lastDefenseFlawless===true,'Flawless defense not recorded');
  const good=perform(perfectC);check(good&&good.command.afflictionChargeContext.flawless,'Flawless snapshot missing');
  defend(['PARRY'],true);check(boss.lastDefenseFlawless===false,'Actual hit did not invalidate flawless');
  const bad=perform(perfectC);check(bad&&!bad.command.afflictionChargeContext.flawless,'Hit history leaked flawless');
  boss.phase='dodge';startDefenseChargePhase();player.invuln=1;damagePlayer('ignored');
  check(!boss.defenseTookDamage,'Invulnerable event counted as actual damage');
  const guard=compile(defs[1]),g=runs.get('guard_0'),parryC=compile(defs[1],2),
    parryStart=start(parryC),parry=defend(['PARRY']),dodgeStart=start(parryC),dodge=defend(['DODGE','DODGE']),
    earlyC=compile(defs[1],3),earlyStart=start(earlyC,{count:0}),early=defend(),
    lateStart=start(earlyC,{count:1}),late=defend();
  check(runs.get('guard_1').first.damage>g.first.damage&&parry.damage>dodge.damage&&
    early.damage>late.damage&&runs.get('guard_4').cast.now>g.cast.now,'Guard Apex behavior');
  check(parry.after===2&&dodge.after===2&&g.first.after===2&&
    near(parry.damage-parryStart.now,2*(parryC.afflictionCharge.feed+parryC.afflictionCharge.parry))&&
    near(dodge.damage-dodgeStart.now,2*parryC.afflictionCharge.feed),'Guard consumed or copied Charge');
  const devour=compile(defs[2]),d=runs.get('devour_0'),matureC=compile(defs[2],2),
    matureStart=start(matureC,{bleed:8,later:0}),matureTick=defend(),
    youngStart=start(matureC,{bleed:4,later:4}),youngTick=defend(),dryC=compile(defs[2],3),
    dryStart=start(dryC),dry=defend([]),dryBaseStart=start(devour),dryBase=defend([]);
  check(runs.get('devour_1').first.damage>d.first.damage&&
    matureTick.damage-matureTick.now>youngTick.damage-youngTick.now&&
    dry.damage-dryStart.now>dryBase.damage-dryBaseStart.now,'Devour Apex behavior');
  check(d.first.after===0&&d.second.after===0&&d.first.damage>g.first.damage,
    'Devour must spend bank for higher immediate wound');
  start(devour);boss.charge=7;const reconciled=defend(['PARRY']);
  check(near(reconciled.damage-reconciled.now,7*(devour.afflictionCharge.meter+
    devour.afflictionCharge.meterOpportunityValue))&&reconciled.after===0,
    'Stored bank + defense gain counted twice / restored after spending',reconciled);
  // Overlapping wounds buy additive bonuses; the converted bank itself is still worth only one bank.
  start(devour,{charge:0});perform(devour);boss.charge=7;const overlap=defend(['PARRY']);
  check(near(overlap.damage-overlap.now,7*(2*devour.afflictionCharge.meter+
    devour.afflictionCharge.meterOpportunityValue))&&overlap.after===0,'Overlap duplicated resource value',overlap);
  defend();const expired=defend();check(expired.after===2&&expired.damage===0,'Expired devour still spends bank');
  const returned=compile(defs[3]),r=runs.get('return_0'),cleanC=compile(defs[3],2),
    clean=start(cleanC),dirty=start(cleanC,{bleed:4}),handoffC=compile(defs[3],3),
    handoff=start(handoffC,{last:previous(handoffC)}),same=start(handoffC,{last:previous(handoffC,true)});
  check(r.cast.refund>=1&&runs.get('return_1').cast.refund>r.cast.refund&&clean.refund>dirty.refund&&
    handoff.refund>same.refund&&runs.get('return_4').cast.now>r.cast.now,'Return Apex behavior',
    {base:r.cast.refund,deep:runs.get('return_1').cast.refund,clean:clean.refund,dirty:dirty.refund,
      handoff:handoff.refund,same:same.refund});
  check(r.first.after===2+r.cast.refund&&r.second.after===Math.max(r.first.after,2),
    'Refund paid before bank reconciliation or paid again',r.first);
  for(const charge of [0,1,2,1000]){
    const c=compile(defs[3],1,'LEGENDARY'),cast=start(c,{charge}),plan=cast.a.afflictionChargeReturnPlan,
      credit=c.afflictionCharge.returnPower,value=SHARPSHOOT_CHARGE_SECONDARY_ENVELOPE.retainedChargePower;
    check(plan.refund<=charge&&near(plan.refund*value+plan.wound*2,credit),'Refund receipt leaked',{charge,plan,credit});
    const phase=defend();check(phase.after===2+plan.refund,'Refund was lost to normal bank',{charge,phase});
  }
  start(returned);const installed=boss.afflictionChargeState.now.refund;
  perform(returned);check(boss.afflictionChargeState.now.refund===installed,
    'Zero-charge repeat created recursive refund');
  defend();const bank=bossCharge();payAfflictionChargeRefund();check(bossCharge()===bank,'Refund paid twice');
  start(guard);const nativeAfter=start(guard).now;defend(['DODGE','DODGE']);defend(['PARRY']);
  boss.phase='dodge';startDefenseChargePhase();recordDefenseChargeSuccess(2,'PARRY');
  check(bossBleed()===0,'Expired guard still feeds wound');
  start(guard);boss.phase='dodge';startDefenseChargePhase();recordDefenseChargeSuccess(1000000,'PARRY');
  check(near(bossBleed()-nativeAfter,1e6*guard.afflictionCharge.feed),'Large defense feed capped');
  start(devour);boss.charge=1e6;const highMeter=defend([]);
  check(near(highMeter.damage-highMeter.now,1e6*(devour.afflictionCharge.meter+
    devour.afflictionCharge.meterOpportunityValue))&&highMeter.after===0,'Large meter capped');
  for(const t of defs)start(compile(t),{charge:0,marks:0});
  resetSkillLabTurn();check(boss.afflictionChargeState===null&&!boss.lastDefenseFlawless,
    'Lab reset leaked delayed state');
  start(returned);applySkillLabPreset('clean',false);check(boss.afflictionChargeState===null,
    'Preset leaked refund');
  return {passed:!failures.length,twists:4,apexes:15,cards,actions,phases,spread:spread(rows),apexSpreads,
    identity:{passed:identity.passed,distinctCores:identity.distinctCores,
      maximumSimilarity:identity.maximumSimilarity,neighborSimilarity},rows,failures};
})();
