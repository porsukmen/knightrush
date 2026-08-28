/* F5S4 only: current-rank cards, four high-parent sentinels and focused real actions. */
globalThis.__afflictionCriticalAudit=(()=>{
  const defs=MARK_BURST_AFFLICTION_CRITICAL_TWIST_DEFINITIONS,failures=[],rows=[],apexRows=[],
    rankRows=[],check=(ok,message,detail)=>{if(!ok)failures.push({message,detail});},
    near=(a,b)=>Math.abs(a-b)<.0031,
    compile=(t,a=0,rank='COMMON')=>synthesizeMarkBurstDetonationPath('COMMON',
      'burst_affliction_critical_spec','COMMON',t.id,a?'COMMON':rank,
      a?t.id+'_apex_'+a:null,rank),snap=c=>({id:c.activeAttributeRouteId,
      direct:commandDirectDamageTotal(c),hits:c.hits,bleed:commandBleedAmount(c),
      crit:c.critChance,precision:c.critPrecisionGain,capacity:c.markDetonationCoreCapacity,
      potency:c.markRule.damagePerMark,relationship:commandExpectedAfflictionCriticalPower(c),
      score:stableEvolutionCombinedGuardrailValue(c)}),compare=(c,p)=>{
      const a=snap(c),b=snap(p);for(const key of ['direct','hits','bleed','crit','capacity','potency',
        'relationship','score'])check(a[key]+.0031>=b[key],'Parent/rank regression: '+key,
        {child:a,parent:b});},spread=rs=>{const vs=rs.map(r=>r.score);
      return (Math.max(...vs)-Math.min(...vs))/Math.max(...vs);};
  let cards=0,actions=0;
  const parent=synthesizeMarkBurstDetonationPath('COMMON','burst_affliction_critical_spec','COMMON'),
    brief=MARK_BURST_AFFLICTION_CRITICAL_BRIEF,
    entries=defs.map(t=>({id:t.id,deliveryPattern:MARK_BURST_ROUTE_BY_ID[t.id].delivery.pattern,
      identity:MARK_BURST_ROUTE_BY_ID[t.id].twistIdentity})),neighbors=MARK_BURST_ROUTE_CONTRACTS
      .filter(r=>r.depth===3&&brief.comparisonSpecIds.includes(r.parentId)).map(r=>({id:r.id,
        deliveryPattern:r.delivery.pattern,identity:r.twistIdentity})),
    identity=auditTwistIdentitySet(entries,brief,neighbors),neighborSimilarity=Math.max(...entries
      .flatMap(e=>neighbors.map(n=>twistIdentityBehaviorSimilarity(e.identity,n.identity))));
  check(defs.length===4&&defs.every(t=>t.apexes.length===4),'Expected 4 Twists / 16 Apex');
  check(identity.passed&&neighborSimilarity<=brief.maxCatalogSimilarity,
    'Twist/neighbor identity gate failed',{identity,neighborSimilarity});
  for(const t of defs){
    const common=compile(t);compare(common,parent);rows.push(snap(common));
    for(let a=0;a<=4;a++){
      let previous=null;
      for(const rank of SKILL_RARITY_ORDER){
        const c=compile(t,a,rank),route=MARK_BURST_ROUTE_BY_ID[c.activeAttributeRouteId],s=snap(c);
        cards++;if(a)compare(c,common);if(previous)compare(c,previous);previous=c;
        rankRows.push({rank,apex:a,twist:t.id,...s});if(a&&rank==='COMMON')apexRows.push(s);
        const sequence=t.key==='sequence';
        check(c.afflictionCritical&&c.deliveryPattern===(sequence?'SEQUENTIAL':'SINGLE')&&
          c.hits>=(sequence?2:1)&&c.critChance>0&&c.critPrecisionGain===0&&
          !c.critDamageStatUnlocked&&!c.extraChainBonus&&!c.consumeChain&&!c.markGain&&
          c.animationRecipeId===t.recipe,'Identity / forbidden stat / animation drift',s);
        check(totalCommandChainGain(c)===c.hits&&Array.from({length:c.hits},(_,i)=>
          commandChainGain(c,i)).every(n=>n===1),'Every visible arrow must make one native Chain',s);
        check(c.markRule.cap===c.markDetonationCoreCapacity&&c.markDetonationHitIndex===c.hits-1&&
          commandMarkPlan(c,10000).markDamageByHit.slice(0,-1).every(n=>n===0),
          'Final shared Detonation drift',s);
        check(Array.from({length:c.hits},(_,i)=>commandHitBase(c,i)).every(n=>n>0)&&
          (!sequence||Array.from({length:c.hits},(_,i)=>commandBleedContactAmount(c,0,i))
            .every(n=>n>0)),'Visible arrow lost positive conserved payload',s);
        check(near(c.synthesisIdentityAllocation.primaryShare,.70)&&
          near(Object.values(route.qualityProfile).reduce((x,n)=>x+n,0),1),
          '70/30 or profile conservation drift',s);
        for(const receipt of c.synthesisQualityReceipts)check(near(receipt.baseAttributePowerAllocation,
          receipt.powerBudget*.1)&&near(Object.values(receipt.powerAllocation).reduce((x,n)=>x+n,0),
          receipt.powerBudget),'Receipt conservation failed',receipt);
        check(AFFLICTION_CRITICAL_AXES.every(axis=>!(c.synthesisAxisReserve[axis]>0)),
          'Relationship Quality left unused',s);
        if(a)check(route.apexDesign.version===2&&route.apexDesign.runtimeEvidence.length>=3,
          'Missing Apex V2 evidence',route.id);
      }
    }
    const high=synthesizeMarkBurstDetonationPath('LEGENDARY','burst_affliction_critical_spec',
      'LEGENDARY',t.id,'COMMON');cards++;compare(high,synthesizeMarkBurstDetonationPath('LEGENDARY',
        'burst_affliction_critical_spec','LEGENDARY'));
  }
  check(spread(rows)<=.20,'Common Twist balance exceeds 20%',rows);
  const apexSpreads=defs.map(t=>({id:t.id,spread:spread(apexRows.filter(r=>r.id.startsWith(t.id)))}));
  for(const row of apexSpreads)check(row.spread<=.25,'Apex balance exceeds 25%',row);
  for(const rank of SKILL_RARITY_ORDER){
    check(spread(rankRows.filter(r=>r.rank===rank&&!r.apex))<=.20,
      'Current-rank Twist balance failed',rank);
    for(const t of defs)check(spread(rankRows.filter(r=>r.rank===rank&&r.apex&&r.twist===t.id))
      <=.25,'Current-rank Apex balance failed',{rank,twist:t.id});
  }
  const sequence=defs[2],deliveryRows=[];
  for(const rank of SKILL_RARITY_ORDER){
    const c=compile(sequence,0,rank),long=compile(sequence,2,rank),same=compile(sequence,1,rank),
      primary=synthesizeMarkBurstDetonationPath('COMMON','burst_chain_focus_spec','COMMON',
        'burst_chain_focus_sequence_twist','COMMON','burst_chain_focus_sequence_twist_apex_1',rank),
      secondary=synthesizeMarkBurstDetonationPath('COMMON','burst_affliction_chain_spec','COMMON',
        'burst_affliction_chain_dense_twist','COMMON','burst_affliction_chain_dense_twist_apex_2',rank);
    deliveryRows.push({rank,sequence:c.hits,long:long.hits,primary:primary.hits,secondary:secondary.hits});
    check(long.hits===same.hits+1,'Long Sequence must add exactly one same-depth arrow',deliveryRows.at(-1));
  }
  const growth=key=>deliveryRows.at(-1)[key]-deliveryRows[0][key];
  check(growth('sequence')<growth('primary')&&growth('long')<growth('primary')&&
    growth('sequence')<=growth('secondary')&&growth('long')<=growth('secondary'),
    'Support arrows must scale below both Chain roles',{deliveryRows});
  openSkillLab();
  const start=(c,{critical=false,bleed=0,ap=100,last=null}={})=>{
    startSkillLabCombat();applySkillLabPreset('clean',false);boss.maxhp=boss.hp=1e9;
    boss.postureMax=1e6;boss.posture=0;boss.mark=20;boss.bleed=bleed;boss.bleedLater=bleed;
    boss.ap=ap;boss.resolve=100;chainStacks=0;skillLabSession.forceCritical=critical;
    boss.criticalFocusLastAttack=last?{knight:last}:{};
    const old=Math.random;try{Math.random=()=>critical?0:.999999;
      if(!performPlayerAction(c))throw new Error('Could not start '+c.activeAttributeRouteId);
      const action=boss.turnAction;actions++;while(action.hitIndex<action.hits)resolveTurnActionHit(action);
      return {hp:boss.hp,now:bossBleed(),later:bossBleedLater(),hits:action.hits,
        applied:stableCombatNumber(bossBleed()+bossBleedLater()-bleed*2)};
    }finally{Math.random=old;}
  },last=(c,critical,same)=>({id:same?(c.baseId||c.id||c.name):'other_skill',
    route:same?c.activeAttributeRouteId:'other_route',anyCritical:critical});
  const flow=compile(defs[0]),flowCrit=start(flow,{critical:true}),flowMiss=start(flow),
    flowFast=start(compile(defs[0],2),{critical:true}),flowPatient=start(compile(defs[0],3)),
    flowToxic=compile(defs[0],4);
  check(flowCrit.now>flowMiss.now&&flowMiss.later>flowCrit.later,
    'Sharp Flow did not route the paid packet by Crit result',{flowCrit,flowMiss});
  check(flowFast.hp<flowCrit.hp&&flowPatient.later>flowMiss.later&&
    commandBleedAmount(flowToxic)>commandBleedAmount(flow),'Sharp Flow Apex missing');
  const patience=compile(defs[1]),patienceCrit=start(patience,{critical:true}),
    patienceMiss=start(patience),deepPatience=start(compile(defs[1],1)),
    cleanPatience=start(compile(defs[1],2)),oldPatience=start(compile(defs[1],2),{bleed:4}),
    lastPatience=start(compile(defs[1],3),{ap:1}),normalPatience=start(compile(defs[1],3));
  check(patienceMiss.applied>patienceCrit.applied&&deepPatience.applied>patienceMiss.applied&&
    cleanPatience.applied>oldPatience.applied&&lastPatience.applied>normalPatience.applied&&
    commandBleedAmount(compile(defs[1],4))>commandBleedAmount(patience),'Blind Poison/Apex missing',
    {patienceMiss:patienceMiss.applied,patienceCrit:patienceCrit.applied,
      deepPatience:deepPatience.applied,cleanPatience:cleanPatience.applied,
      oldPatience:oldPatience.applied,lastPatience:lastPatience.applied,
      normalPatience:normalPatience.applied,toxic:commandBleedAmount(compile(defs[1],4)),
      native:commandBleedAmount(patience)});
  const seq=compile(sequence),seqMiss=start(seq),seqCrit=start(seq,{critical:true}),
    deepSeq=start(compile(sequence,1)),longSeq=compile(sequence,2),closing=compile(sequence,3);
  check(seqMiss.applied>seqCrit.applied&&deepSeq.applied>seqMiss.applied&&longSeq.hits>seq.hits&&
    commandHitBase(closing,closing.hits-1)>commandHitBase(closing,0)&&
    commandBleedAmount(compile(sequence,4))>commandBleedAmount(seq),
    'Patient Sequence/Apex missing',{seqMiss,seqCrit,long:longSeq.hits,base:seq.hits});
  const rhythm=compile(defs[3]),handoffCommand=compile(defs[3],2),
    repeatCommand=compile(defs[3],3),prevCrit=start(rhythm,{last:last(rhythm,true,true)}),
    prevMiss=start(rhythm,{last:last(rhythm,false,false)}),noHistory=start(rhythm),
    handoff=start(handoffCommand,{last:last(handoffCommand,true,false)}),
    sameCrit=start(handoffCommand,{last:last(handoffCommand,true,true)}),
    repeat=start(repeatCommand,{last:last(repeatCommand,false,true)}),
    otherMiss=start(repeatCommand,{last:last(repeatCommand,false,false)});
  check(prevCrit.applied>prevMiss.applied&&prevMiss.hp<prevCrit.hp&&near(noHistory.hp,prevMiss.hp)&&
    handoff.applied>sameCrit.applied&&repeat.hp<otherMiss.hp&&
    commandBleedAmount(compile(defs[3],4))>commandBleedAmount(rhythm),'Blood Rhythm/Apex missing',
    {prevCrit,prevMiss,noHistory,handoff,sameCrit,repeat,otherMiss,
      toxic:commandBleedAmount(compile(defs[3],4)),native:commandBleedAmount(rhythm)});
  return {passed:!failures.length,twists:4,apexes:16,cards,actions,spread:spread(rows),
    apexSpreads,identity:{passed:identity.passed,distinctCores:identity.distinctCores,
      maximumSimilarity:identity.maximumSimilarity,neighborSimilarity},deliveryRows,rows,failures};
})();
