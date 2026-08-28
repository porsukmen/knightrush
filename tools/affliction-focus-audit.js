/* F5S5: bounded current-rank coverage and deterministic real actions, no history product. */
globalThis.__afflictionFocusAudit=(()=>{
  const defs=MARK_BURST_AFFLICTION_FOCUS_TWIST_DEFINITIONS,failures=[],rows=[],rankRows=[],
    check=(ok,message,detail)=>{if(!ok)failures.push({message,detail});},near=(a,b)=>Math.abs(a-b)<.004,
    compile=(t,a=0,rank='COMMON',base='COMMON')=>synthesizeMarkBurstDetonationPath(base,
      'burst_affliction_focus_spec',base,t.id,a?'COMMON':rank,a?t.id+'_apex_'+a:null,rank),
    snap=c=>({id:c.activeAttributeRouteId,direct:commandDirectDamageTotal(c),hits:c.hits,
      bleed:commandBleedAmount(c),capacity:c.markDetonationCoreCapacity,potency:c.markRule.damagePerMark,
      score:stableEvolutionCombinedGuardrailValue(c)}),compare=(c,p)=>{
      const a=snap(c),b=snap(p);for(const key of ['direct','hits','bleed','capacity','potency','score'])
        check(a[key]+.004>=b[key],'Parent/rank regression: '+key,{child:a,parent:b});
    },spread=rs=>{const vs=rs.map(r=>r.score);return (Math.max(...vs)-Math.min(...vs))/Math.max(...vs);};
  let cards=0,actions=0;
  const brief=MARK_BURST_AFFLICTION_FOCUS_BRIEF,entries=defs.map(t=>({id:t.id,
    deliveryPattern:MARK_BURST_ROUTE_BY_ID[t.id].delivery.pattern,
    identity:MARK_BURST_ROUTE_BY_ID[t.id].twistIdentity})),neighbors=MARK_BURST_ROUTE_CONTRACTS
      .filter(r=>r.depth===3&&brief.comparisonSpecIds.includes(r.parentId)).map(r=>({id:r.id,
        deliveryPattern:r.delivery.pattern,identity:r.twistIdentity})),
    identity=auditTwistIdentitySet(entries,brief,neighbors),neighborSimilarity=Math.max(...entries
      .flatMap(e=>neighbors.map(n=>twistIdentityBehaviorSimilarity(e.identity,n.identity)))),
    parent=synthesizeMarkBurstDetonationPath('COMMON','burst_affliction_focus_spec','COMMON');
  check(defs.length===4&&defs.every(t=>t.apexes.length===4),'Expected 4 Twists / 16 Apex');
  check(identity.passed&&neighborSimilarity<=brief.maxCatalogSimilarity,'Identity/neighbor gate',
    {identity,neighborSimilarity});
  for(const t of defs){
    const common=compile(t);compare(common,parent);rows.push(snap(common));
    const decisions=t.apexes.filter(a=>APEX_MEANINGFUL_DECISION_CLASSES.has(a.decisionClass));
    check(decisions.length>=2&&new Set(decisions.map(a=>a.decisionClass)).size>=2,
      'Need two distinct player-plan decisions',t.id);
    for(let a=0;a<=4;a++){
      let previous=null;
      for(const rank of SKILL_RARITY_ORDER){
        const c=compile(t,a,rank),s=snap(c),f=c.afflictionFocus,
          route=MARK_BURST_ROUTE_BY_ID[c.activeAttributeRouteId];cards++;
        if(a)compare(c,common);if(previous)compare(c,previous);previous=c;
        rankRows.push({rank,apex:a,twist:t.id,...s});
        check(f&&f.engine===t.engine&&f.bleedPowerStatUnlocked===(t.key==='power')&&
          !c.critChance&&!c.critPrecisionGain&&!c.critDamageStatUnlocked&&!c.postureDamage&&
          !c.extraChainBonus&&!c.consumeChain&&!c.markGain&&c.animationRecipeId===t.recipe,
          'Identity/forbidden stat/animation drift',s);
        check(c.deliveryPattern===(t.key==='layer'?'SEQUENTIAL':'SINGLE')&&
          totalCommandChainGain(c)===c.hits&&Array.from({length:c.hits},(_,i)=>
            commandChainGain(c,i)).every(n=>n===1),'Real-contact Chain mismatch',s);
        check(c.markRule.cap===c.markDetonationCoreCapacity&&c.markDetonationHitIndex===c.hits-1&&
          commandMarkPlan(c,10000).markDamageByHit.slice(0,-1).every(n=>n===0),'Detonation drift',s);
        check(near(c.synthesisIdentityAllocation.primaryShare,1)&&
          near(Object.values(route.qualityProfile).reduce((n,x)=>n+x,0),1),'Pure allocation drift',s);
        for(const receipt of c.synthesisQualityReceipts)check(near(receipt.baseAttributePowerAllocation,
          receipt.powerBudget*.1)&&near(Object.values(receipt.powerAllocation).reduce((n,x)=>n+x,0),
          receipt.powerBudget),'Base/Quality receipt conservation',receipt);
        check(AFFLICTION_FOCUS_AXES.every(axis=>!(c.synthesisAxisReserve[axis]>0)),
          'Unused relationship Quality',s);
        if(a)check(route.apexDesign.version===2&&route.apexDesign.runtimeEvidence.length>=3,
          'Apex V2 missing',s);
        if(t.key==='layer')check(near(Array.from({length:c.hits},(_,i)=>
          commandBleedContactAmount(c,0,i)).reduce((n,x)=>n+x,0),commandBleedAmount(c)),
          'Native wound duplicated across arrows',s);
      }
    }
    const high=compile(t,0,'COMMON','LEGENDARY'),highParent=synthesizeMarkBurstDetonationPath(
      'LEGENDARY','burst_affliction_focus_spec','LEGENDARY');cards++;compare(high,highParent);
  }
  const apexSpreads=[];
  for(const rank of SKILL_RARITY_ORDER){
    check(spread(rankRows.filter(r=>r.rank===rank&&!r.apex))<=.20,'Twist balance >20%',rank);
    for(const t of defs){const value=spread(rankRows.filter(r=>r.rank===rank&&r.apex&&r.twist===t.id));
      check(value<=.25,'Apex balance >25%',{id:t.id,rank,value});
      if(rank==='COMMON')apexSpreads.push({id:t.id,spread:value});}
  }
  const deliveryRows=[];
  for(const rank of SKILL_RARITY_ORDER){
    const c=compile(defs[3],1,rank),long=compile(defs[3],2,rank),
      primary=synthesizeMarkBurstDetonationPath('COMMON','burst_chain_focus_spec','COMMON',
        'burst_chain_focus_sequence_twist','COMMON','burst_chain_focus_sequence_twist_apex_1',rank),
      secondary=synthesizeMarkBurstDetonationPath('COMMON','burst_affliction_chain_spec','COMMON',
        'burst_affliction_chain_dense_twist','COMMON','burst_affliction_chain_dense_twist_apex_2',rank);
    deliveryRows.push({rank,normal:c.hits,long:long.hits,primary:primary.hits,secondary:secondary.hits});
    check(long.hits===c.hits+1&&long.hits<primary.hits&&long.hits<secondary.hits,
      'Support arrows reached Chain density',deliveryRows.at(-1));
  }
  for(const q of [16,67,2560,1e6])check(skillSupportArrowMagnitude(q)+1<skillDeliveryMagnitude(q)&&
    skillSupportArrowMagnitude(q)+1<skillPrimaryChainDeliveryMagnitude(q),
    'Support scaling reached Chain motor',{q});
  openSkillLab();
  const start=(c,{bleed=0,later=bleed,ap=100,last=null,count=0,marks=20,chain=0}={})=>{
    startSkillLabCombat();applySkillLabPreset('clean',false);boss.maxhp=boss.hp=1e9;
    boss.postureMax=1e6;boss.posture=0;boss.mark=marks;boss.bleed=bleed;boss.bleedLater=later;
    boss.ap=ap;boss.resolve=100;chainStacks=chain;skillLabSession.forceCritical=false;
    boss.playerPhaseAttackCount=count;boss.criticalFocusLastAttack=last?{knight:last}:{};
    const random=Math.random;try{Math.random=()=>.999999;
      check(performPlayerAction(c),'Action failed to start',c.activeAttributeRouteId);
      const action=boss.turnAction;actions++;
      check(!!action.bowTimeline,'Missing Bow timeline',c.activeAttributeRouteId);
      if(action.bowTimeline)drawBowMechanicCue(action,action.bowTimeline,
        {from:{x:300,y:400},to:{x:600,y:400}});
      while(action.hitIndex<action.hits)resolveTurnActionHit(action);
      check(chainStacks-chain===action.hits,'Runtime Chain differs from visible contacts',c.activeAttributeRouteId);
      check(boss.mark===Math.max(0,marks-c.markDetonationCoreCapacity),'Runtime Mark capacity drift',c.activeAttributeRouteId);
      return {hp:boss.hp,now:bossBleed()-bleed,later:bossBleedLater()-later,
        rupture:action.afflictionFocusRuptureDamage||0,action,context:action.command.afflictionFocusContext};
    }finally{Math.random=random;}
  },previous=(c,same=true)=>({id:same?(c.baseId||c.id||c.name):'other_skill',
    route:same?c.activeAttributeRouteId:'other_route'}),runs=new Map();
  // Every Twist and every Apex executes in actual combat, including generic stat refinements.
  for(const t of defs)for(let a=0;a<=4;a++)runs.set(t.key+'_'+a,start(compile(t,a),
    {bleed:t.key==='reopen'?4:0}));
  const power=compile(defs[0]),p=runs.get('power_0'),pDeep=runs.get('power_1'),
    cleanC=compile(defs[0],2),cleanOld=start(cleanC,{bleed:4}),powerRepeatC=compile(defs[0],3),
    repeatedPower=start(powerRepeatC,{last:previous(powerRepeatC)}),
    otherPower=start(powerRepeatC,{last:previous(powerRepeatC,false)}),
    lastAPOnly=start(powerRepeatC,{ap:1}),impact=runs.get('power_4');
  check(pDeep.now>p.now&&runs.get('power_2').now>cleanOld.now&&
    repeatedPower.now>otherPower.now&&near(lastAPOnly.now,runs.get('power_3').now)&&
    impact.hp<p.hp,'Power Apex repeat behavior / old last-AP rule leaked');
  check(near(p.now,commandBleedAmount(power))&&near(p.now,p.later)&&power.afflictionFocus.power>0,
    'Wound Power paid twice / native tick mismatch');
  const reopen=compile(defs[1]),r=runs.get('reopen_0'),lastTickC=compile(defs[1],2),
    mature=start(lastTickC,{bleed:8,later:0}),young=start(lastTickC,{bleed:4,later:4}),
    handC=compile(defs[1],3),other=start(handC,{bleed:4,last:previous(handC,false)}),
    same=start(handC,{bleed:4,last:previous(handC)}),fallbackC=compile(defs[1],4),
    fallback=start(fallbackC),empty=start(reopen),highChain=start(reopen,{bleed:4,chain:100});
  check(runs.get('reopen_1').rupture>r.rupture&&mature.rupture>young.rupture&&
    other.rupture>same.rupture&&fallback.rupture>0&&empty.rupture===0&&
    fallbackC.afflictionFocus.fallback<SHARPSHOOT_AFFLICTION_SECONDARY_ENVELOPE.existingBleedReference*
      2*fallbackC.afflictionFocus.reopen,
    'Reopen Apex behavior');
  check(near(r.now,commandBleedAmount(reopen))&&near(r.later,r.now)&&
    near(r.rupture,8*reopen.afflictionFocus.reopen)&&near(highChain.rupture,r.rupture),
    'Old wound consumed / new wound re-read / rupture scaled by Chain');
  const before=boss.hp;resolveAfflictionFocusReopen(highChain.action,0,0,0);
  check(near(before,boss.hp),'Reopen ran twice');
  const late=compile(defs[2]),l=runs.get('late_0'),earlyC=compile(defs[2],2),
    laterAction=start(earlyC,{count:1}),matureC=compile(defs[2],3),
    matureLate=start(matureC,{bleed:8,later:0}),youngLate=start(matureC,{bleed:4});
  check(near(l.now,commandBleedAmount(late))&&near(l.later-l.now,late.afflictionFocus.late)&&
    runs.get('late_1').later>l.later&&runs.get('late_2').later>laterAction.later&&
    matureLate.later>youngLate.later&&runs.get('late_4').hp<l.hp,'Late Apex behavior');
  const layer=compile(defs[3]),ly=runs.get('layer_0'),freshC=compile(defs[3],3),
    freshOld=start(freshC,{bleed:20}),repeatC=compile(defs[3],4),
    repeat=start(repeatC,{last:previous(repeatC)}),alternate=start(repeatC,{last:previous(repeatC,false)}),
    baseline=start(layer,{bleed:1000});
  check(runs.get('layer_1').now>ly.now&&runs.get('layer_2').action.hits===ly.action.hits+1&&
    runs.get('layer_3').now>freshOld.now&&repeat.now>alternate.now,'Layer Apex behavior');
  check(near(ly.action.afflictionNativeApplied,commandBleedAmount(layer))&&near(ly.now,baseline.now)&&
    near(ly.now,commandBleedAmount(layer)+commandBleedAmount(layer)*(layer.hits-1)/2*
      layer.afflictionFocus.layer),'Layer reads bonus/old wound or duplicates native packet');
  const isolation=afflictionFocusLayerBonus(ly.action.command,{afflictionNativeApplied:2,
    afflictionAppliedThisAction:1e9},1);
  check(near(isolation,2*layer.afflictionFocus.layer),'Recursive bonus read');
  // Real consecutive actions: do not manufacture the repeat condition only in the fixture.
  finishPlayerAction();
  const oldRandom=Math.random;try{Math.random=()=>.999999;
    check(performPlayerAction(layer),'Repeat action did not start');actions++;
    const a=boss.turnAction;if(a){check(a.command.afflictionFocusContext.repeat&&
      !a.command.afflictionFocusContext.firstAttack,'Real same-move history/first-attack state lost');
      while(a.hitIndex<a.hits)resolveTurnActionHit(a);}
  }finally{Math.random=oldRandom;}
  // Two actual defense-phase ticks exhaust the delayed packet without generating resources.
  const tickRun=start(late,{marks:0}),chainBefore=chainStacks,markBefore=boss.mark,
    firstHp=boss.hp;resolveBossPhaseBleed(false);const firstLoss=firstHp-boss.hp;
  const secondHp=boss.hp;resolveBossPhaseBleed(false);const secondLoss=secondHp-boss.hp;
  check(near(firstLoss,tickRun.now)&&near(secondLoss,tickRun.later)&&bossBleed()===0&&
    bossBleedLater()===0&&chainStacks===chainBefore&&boss.mark===markBefore,'Two-tick/resource boundary');
  boss.playerPhaseAttackCount=7;boss.phase='dodge';beginPlayerTurn(false);
  check(boss.playerPhaseAttackCount===0,'New phase did not reset first-attack condition');
  boss.playerPhaseAttackCount=7;resetSkillLabTurn();check(boss.playerPhaseAttackCount===0&&
    Object.keys(boss.criticalFocusLastAttack).length===0,'Lab reset leaked attack history');
  for(const old of [1e3,1e6,Number.MAX_SAFE_INTEGER/100]){
    const value=old*reopen.afflictionFocus.reopen;
    check(Number.isFinite(value)&&value>0,'Uncapped reopening failed',old);
  }
  const highOld=start(reopen,{bleed:1e6,later:1e6});
  check(Number.isFinite(highOld.rupture)&&near(highOld.rupture,2e6*reopen.afflictionFocus.reopen)&&
    highOld.rupture>r.rupture,'High old-wound runtime was capped or non-finite');
  for(const t of defs)start(compile(t),{marks:0});
  return {passed:!failures.length,twists:4,apexes:16,cards,actions,spread:spread(rows),apexSpreads,
    identity:{passed:identity.passed,distinctCores:identity.distinctCores,
      maximumSimilarity:identity.maximumSimilarity,neighborSimilarity},deliveryRows,rows,failures};
})();
