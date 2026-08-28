/* F6S1: current-rank cards + four strong-parent sentinels; no history matrix. */
globalThis.__chargeDetonationAudit=(()=>{
  const defs=MARK_BURST_CHARGE_DETONATION_TWIST_DEFINITIONS,failures=[],rows=[],ranks=[],
    check=(ok,message,detail)=>{if(!ok)failures.push({message,detail});},near=(a,b)=>Math.abs(a-b)<.005,
    compile=(t,a=0,rank='COMMON',base='COMMON')=>synthesizeMarkBurstDetonationPath(base,
      'burst_charge_detonation_spec',base,t.id,a?'COMMON':rank,a?t.id+'_apex_'+a:null,rank),
    snap=c=>({id:c.activeAttributeRouteId,direct:commandDirectDamageTotal(c),
      preparation:commandPreparationDamage(c),hits:c.hits,capacity:c.markDetonationCoreCapacity,
      potency:c.markRule.damagePerMark,relationship:commandExpectedPreparedDetonationPower(c),
      score:stableEvolutionCombinedGuardrailValue(c)}),
    compare=(c,p)=>{const a=snap(c),b=snap(p);for(const key of Object.keys(a).filter(k=>k!=='id'))
      check(a[key]+.005>=b[key],'Parent/rank regression: '+key,{child:a,parent:b});},
    spread=rs=>{const vs=rs.map(r=>r.score);return (Math.max(...vs)-Math.min(...vs))/Math.max(...vs);};
  let cards=0,actions=0,phases=0;
  const brief=MARK_BURST_CHARGE_DETONATION_BRIEF,entries=defs.map(t=>({id:t.id,
    deliveryPattern:t.key==='primer'?'SEQUENTIAL':'SINGLE',identity:MARK_BURST_ROUTE_BY_ID[t.id].twistIdentity})),
    neighbors=MARK_BURST_ROUTE_CONTRACTS.filter(r=>r.depth===3&&brief.comparisonSpecIds.includes(r.parentId))
      .map(r=>({id:r.id,deliveryPattern:r.delivery.pattern,identity:r.twistIdentity})),
    identity=auditTwistIdentitySet(entries,brief,neighbors),neighborSimilarity=Math.max(...entries.flatMap(e=>
      neighbors.map(n=>twistIdentityBehaviorSimilarity(e.identity,n.identity))));
  check(defs.length===4&&defs.every(t=>t.apexes.length===4),'Expected 4/16 family');
  check(identity.passed&&neighborSimilarity<=brief.maxCatalogSimilarity,'Identity/neighbor failure',{identity,neighborSimilarity});
  for(const t of defs){
    const common=compile(t),parent=synthesizeMarkBurstDetonationPath('COMMON','burst_charge_detonation_spec','COMMON');
    compare(common,parent);rows.push(snap(common));
    const decisions=t.apexes.filter(a=>APEX_MEANINGFUL_DECISION_CLASSES.has(a.decisionClass));
    check(decisions.length>=1,'No meaningful Apex decision',t.id);
    for(let a=0;a<=4;a++){
      let previous=null;
      for(const rank of SKILL_RARITY_ORDER){
        const c=compile(t,a,rank),f=c.chargeDetonation,s=snap(c),route=MARK_BURST_ROUTE_BY_ID[c.activeAttributeRouteId];
        cards++;if(a)compare(c,common);if(previous)compare(c,previous);previous=c;ranks.push({rank,apex:a,twist:t.id,...s});
        check(f&&f.engine===t.engine&&Object.isFrozen(f)&&commandChargeMode(c)==='DELAYED_PRIMARY'&&
          !commandCollectsDefenseCharge(c)&&!commandDefenseTemperRate(c)&&!c.chargeBankDamagePerPoint,
          'Charge role or immutable payload drift',s);
        check(!c.markGain&&!c.critChance&&!c.critPrecisionGain&&!c.critDamageStatUnlocked&&!c.posture&&
          !c.extraChainBonus&&!c.consumeChain&&!commandBleedAmount(c),'Third attribute leaked',s);
        check(c.animationRecipeId===t.recipe&&totalCommandChainGain(c)===c.hits&&
          c.markDetonationHitIndex===0&&c.markDetonationCapPattern[0]===c.markDetonationCoreCapacity,
          'Delivery/Base placement drift',s);
        const plan=commandMarkPlan(c,100000);
        if(t.key==='follow'){
          check(f.followPerMark>SKILL_GUARDRAIL_POWER_VALUES.MARK_GAIN,'Follow loses spent Mark value',s);
          if(a===2)check(f.followCapacity>common.chargeDetonation.followCapacity,'Capacity Apex adds no capacity',s);
        }
        check(plan.consumedAtStart===0&&plan.consumedTotal===c.markDetonationCoreCapacity&&
          plan.consumedByHit.slice(1).every(n=>n===0),'Detonation not on real first contact',s);
        if(t.key==='primer'){
          const ledger={totalQuality:c.synthesisQuality},secondary=skillRoleContactMagnitude(
            {primaryAttributeId:'CHARGE',secondaryAttributeId:'CHAIN'},ledger),primary=skillRoleContactMagnitude(
            {primaryAttributeId:'CHAIN',mechanics:{}},ledger);
          check(c.hits>=2&&c.hits<secondary&&c.hits<primary,'Support arrows outran Chain roles',{...s,secondary,primary});
          check(f.primer>0,'Primer budget erased by delivery',s);
        }
        if(a)check(route.apexDesign.version===2&&route.apexDesign.runtimeEvidence.length>=3,
          'Apex metadata missing',s);
        check(near(c.synthesisIdentityAllocation.primaryShare,.7)&&near(c.synthesisIdentityAllocation.secondaryShare,.3),
          '70/30 drift',s);
        for(const receipt of c.synthesisQualityReceipts)check(near(receipt.baseAttributePowerAllocation,receipt.powerBudget*.1)&&
          near(Object.values(receipt.powerAllocation).reduce((s,n)=>s+n,0),receipt.powerBudget),'Receipt/Base leak',s);
      }
    }
    const high=compile(t,0,'COMMON','LEGENDARY');cards++;
    compare(high,synthesizeMarkBurstDetonationPath('LEGENDARY','burst_charge_detonation_spec','LEGENDARY'));
  }
  const apexSpreads=[];
  for(const rank of SKILL_RARITY_ORDER){
    check(spread(ranks.filter(r=>r.rank===rank&&!r.apex))<=.2,'Twist power band >20%',rank);
    for(const t of defs){const gap=spread(ranks.filter(r=>r.rank===rank&&r.twist===t.id&&r.apex));
      check(gap<=.25,'Apex power band >25%',{rank,id:t.id,gap});if(rank==='COMMON')apexSpreads.push({id:t.id,spread:gap});}
  }
  openSkillLab();
  const reset=(marks=8)=>{startSkillLabCombat();applySkillLabPreset('clean',false);skillLabSession.forceCritical=false;
    boss.hp=boss.maxhp=1e9;boss.posture=0;boss.postureMax=1e6;boss.mark=marks;
    boss.ap=100;boss.resolve=1000;boss.charge=0;boss.chargeEnabled=false;chainStacks=0;},
    drain=()=>{const a=boss.turnAction;check(!!a,'Missing real action');if(!a)return null;
      a.t=.1;drawBowMechanicCue(a,a.bowTimeline,{from:{x:100,y:200},to:{x:300,y:200}});
      updateTurnAction(100);actions++;finishPlayerAction();return a;},
    ready=(c,{gain=0,markAfter=null}={})=>{
      const hp=boss.hp,mark=bossMark();check(performPlayerAction(c),'Prepare failed',c.activeAttributeRouteId);
      const p=pendingPrimaryChargeRelease();check(p&&boss.phase==='dodge'&&!boss.turnAction&&boss.hp===hp&&bossMark()===mark,
        'Prepare did damage/consumed Mark');
      for(let i=0;i<gain;i++)recordDefenseChargeSuccess(1,'DODGE');
      check(beginPlayerTurn(),'Prepare did not reach next player phase');phases++;
      if(markAfter!==null)boss.mark=markAfter;boss.ap=100;boss.resolve=1000;
      return p;
    },release=(c,opts={})=>{ready(c,opts);const ap=boss.ap,resolve=boss.resolve;
      check(releasePrimaryCharge(),'Release failed',c.activeAttributeRouteId);const a=drain();
      check(boss.ap===ap&&boss.resolve===resolve&&!pendingPrimaryChargeRelease()&&bossCharge()===0,
        'Free Release or no-bank contract failed');return a;},
    attack=c=>{boss.ap=100;boss.resolve=1000;check(performPlayerAction(c),'Follow action failed');return drain();},
    markSource=synthesizeSharpshootMarkPath('COMMON'),plain={...createRunSkill(BASE_TURN_SKILL_BY_ID.mark_burst),
      id:'audit_plain',baseId:'audit_plain',markRule:null,markDetonation:false,damage:1,hits:1};
  // All twenty authored cards really prepare/release; every recipe has real contacts.
  for(const t of defs)for(let i=0;i<=4;i++){
    const c=compile(t,i);reset();const a=release(c);
    check(a&&a.hits===c.hits&&a.consumedMark===Math.min(8,c.markDetonationCoreCapacity)&&
      a.bowTimeline.contacts.length===c.hits,'Runtime payload/contact mismatch',c.activeAttributeRouteId);
    for(let depth=1;depth<=4;depth++)moveTreeSynthesisRarityByDepth[depth]='COMMON';
    const node=WEAPON_SKILL_PROTOTYPE_LAB_NODE_BY_SKILL_AND_ID.mark_burst[c.activeAttributeRouteId],
      preview=node&&moveTreeSynthesisPreviewCommand(node);
    check(preview&&near(commandExpectedPreparedDetonationPower(preview),commandExpectedPreparedDetonationPower(c)),
      'Lab preview drift',c.activeAttributeRouteId);
  }
  const [snapshot,follow,primer,carry]=defs;
  for(const t of defs){const c=compile(t);reset(8);const a=release(c,{gain:0});
    reset(8);const b=release(c,{gain:12});check(near(a.chargeBonus,b.chargeBonus),'Defense successes changed Primary',t.id);
    reset(0);const z=release(c);check(z.consumedMark===0&&z.chargeBonus+.005>=commandPreparationDamage(c),'Zero Mark lost preparation',t.id);}
  // Snapshot survives intervening real Mark expenditure, not a release-time reread.
  const s=compile(snapshot);reset(11);const a=release(s,{markAfter:0});
  check(near(a.preparedDetonationSnapshot.bonus,11*s.chargeDetonation.snapshot)&&a.consumedMark===0,'Snapshot was reread');
  for(const i of [2,3,4]){
    const c=compile(snapshot,i),f=c.chargeDetonation;reset(i===4?0:11);
    if(i===3)attack(markSource);
    const mark=bossMark(),r=release(c),expected=mark*(f.snapshot+(mark>c.markDetonationCoreCapacity?f.surplus:0)+
      (i===3?f.setup:0))+(mark===0?f.empty:0);
    check(near(r.preparedDetonationSnapshot.bonus,expected),'Snapshot Apex not applied',{i,expected,r:r.preparedDetonationSnapshot});
  }
  // Next-attack ticket: after native Mark, one use, same-phase versus later, empty fallback.
  for(let i=0;i<=4;i++){
    const c=compile(follow,i),f=c.chargeDetonation;reset(0);release(c);
    const stored=boss.preparedDetonationFollow;check(!!stored,'Follow not armed',i);
    const r=attack(i===4?plain:markSource),result=r.preparedDetonationFollowResult;
    check(result&&near(result.payload,result.consumed*(f.followPerMark+f.quick))&&
      near(result.fallback,i===4?f.fallback:0)&&!boss.preparedDetonationFollow,'Follow Apex/one-use failure',{i,result});
    check(result.consumed===0||result.payload-result.consumed*SKILL_GUARDRAIL_POWER_VALUES.MARK_GAIN>0,
      'Follow is a net resource loss',{i,result});
    const again=attack(plain);check(!again.preparedDetonationFollowResult,'Follow recursively repeated');
  }
  const quick=compile(follow,3);reset(0);release(quick);endPlayerTurn();beginPlayerTurn();phases++;
  const later=attack(markSource).preparedDetonationFollowResult;
  check(near(later.payload,later.consumed*quick.chargeDetonation.followPerMark),'Same-phase bonus leaked next phase');
  // Extra pulses in a real Mark source resolve before follow, never after it.
  reset(0);release(compile(follow));const pulseSource={...markSource,markPulsePattern:[2,3],
    markPulseInterval:.2,markPulsePreservesContactMark:true},pulse=attack(pulseSource);
  check(pulse.markGenerated>=5&&pulse.markPulseIndex===2&&pulse.preparedDetonationFollowResult.consumed>0,'Follow ran before Mark pulses');
  // Primer must use real first-contact consumption, then add bonus only on final.
  for(let i=0;i<=4;i++){
    const c=compile(primer,i);reset(i===3?c.markDetonationCoreCapacity:20);ready(c);
    if(i===4)check(!boss.playerPhaseAttackCount,'Early fixture not first');
    releasePrimaryCharge();const r=boss.turnAction,mark=bossMark();resolveTurnActionHit(r);
    check(r.preparedDetonationConsumed===Math.min(mark,c.markDetonationCoreCapacity)&&
      commandChargeContactPayload(c,r.chargeBonus,0,c.hits,0)===0,'Primer order/duplicate prep');
    const expected=r.preparedDetonationConsumed*(c.chargeDetonation.primer+
      (r.preparedDetonationClean?c.chargeDetonation.clean:0)+(r.preparedDetonationFirst?c.chargeDetonation.early:0));
    check(near(preparedDetonationContactBonus(r,r.hits-1),expected),'Primer Apex payoff missing',i);drain();
  }
  // Carry is captured once at preparation, same-phase/rearm and actual rotation conditions.
  for(let i=0;i<=4;i++){
    const c=compile(carry,i),f=c.chargeDetonation;reset(20);const r=release(c),
      key=preparedDetonationKey(c),ticket=boss.preparedDetonationCarry[key];
    check(ticket&&near(ticket.damage,r.consumedMark*(f.carry+f.full)),'Carry native source/full Apex',i);
    if(i===4)attack(markSource);
    const p=ready(c),expected=ticket.damage+ticket.repeat+(i===4?ticket.rotation:0);
    check(p.preparedDetonation.carried>0&&near(p.preparedDetonation.carried,expected)&&!boss.preparedDetonationCarry[key],
      'Carry Apex/reservation failed',{i,expected,p:p.preparedDetonation});
    boss.mark=0;releasePrimaryCharge();drain();check(!boss.preparedDetonationCarry[key],'Carry fed itself at zero Mark');
  }
  // Large resources are uncapped; Quality controls capacity and potency, not source reads.
  const large=compile(snapshot,1,'LEGENDARY');reset(10000);const largeAction=release(large,{markAfter:0});
  check(near(largeAction.preparedDetonationSnapshot.bonus,10000*large.chargeDetonation.snapshot),'Snapshot source capped');
  reset();release(compile(follow));resetSkillLabTurn();
  check(!boss.preparedDetonationFollow&&!Object.keys(boss.preparedDetonationCarry).length,'Reset leaked follow/carry');
  return {passed:!failures.length,twists:4,apexes:16,cards,actions,phases,spread:spread(rows),apexSpreads,
    identity:{passed:identity.passed,distinctCores:identity.distinctCores,maximumSimilarity:identity.maximumSimilarity,neighborSimilarity},rows,failures};
})();
