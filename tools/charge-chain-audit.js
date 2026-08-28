/* F6S2: current-rank cards, strong parents, and mechanic-boundary actions only. */
globalThis.__chargeChainAudit=(()=>{
  const defs=MARK_BURST_CHARGE_CHAIN_TWIST_DEFINITIONS,failures=[],rows=[],ranks=[],
    check=(ok,message,detail)=>{if(!ok)failures.push({message,detail});},near=(a,b)=>Math.abs(a-b)<.01,
    compile=(t,a=0,rank='COMMON',base='COMMON')=>synthesizeMarkBurstDetonationPath(base,
      'burst_charge_chain_spec',base,t.id,a?'COMMON':rank,a?t.id+'_apex_'+a:null,rank),
    snap=c=>({id:c.activeAttributeRouteId,direct:commandDirectDamageTotal(c),
      preparation:commandPreparationDamage(c),hits:c.hits,capacity:c.markDetonationCoreCapacity,
      potency:c.markRule.damagePerMark,relationship:commandExpectedPreparedChainPower(c),
      score:stableEvolutionCombinedGuardrailValue(c)}),
    compare=(c,p)=>{const a=snap(c),b=snap(p);for(const key of Object.keys(a).filter(k=>k!=='id'))
      check(a[key]+.01>=b[key],'Parent/rank regression: '+key,{child:a,parent:b});},
    spread=rs=>{const vs=rs.map(r=>r.score);return (Math.max(...vs)-Math.min(...vs))/Math.max(...vs);};
  let cards=0,actions=0,phases=0;
  const brief=MARK_BURST_CHARGE_CHAIN_BRIEF,entries=defs.map(t=>({id:t.id,
    deliveryPattern:'SEQUENTIAL',identity:MARK_BURST_ROUTE_BY_ID[t.id].twistIdentity})),
    neighbors=MARK_BURST_ROUTE_CONTRACTS.filter(r=>r.depth===3&&brief.comparisonSpecIds.includes(r.parentId))
      .map(r=>({id:r.id,deliveryPattern:r.delivery.pattern,identity:r.twistIdentity})),
    identity=auditTwistIdentitySet(entries,brief,neighbors),neighborSimilarity=Math.max(...entries.flatMap(e=>
      neighbors.map(n=>twistIdentityBehaviorSimilarity(e.identity,n.identity))));
  check(defs.length===4&&defs.every(t=>t.apexes.length===4),'Expected 4/16 family');
  check(identity.passed&&neighborSimilarity<=brief.maxCatalogSimilarity,'Identity/neighbor failure',{identity,neighborSimilarity});
  const inspect=c=>{
    const f=c.chargeChain,s=snap(c),ledger={totalQuality:c.synthesisQuality,receipts:c.synthesisQualityReceipts},
      primary=skillRoleContactMagnitude({primaryAttributeId:'CHAIN',mechanics:{}},ledger);
    check(f&&Object.isFrozen(f)&&commandChargeMode(c)==='DELAYED_PRIMARY'&&
      !commandCollectsDefenseCharge(c)&&!commandDefenseTemperRate(c)&&!c.chargeBankDamagePerPoint,
      'Primary role/bank drift',s);
    check(!c.markGain&&!c.critChance&&!c.critPrecisionGain&&!c.critDamageStatUnlocked&&!c.posture&&
      !c.extraChainBonus&&!c.consumeChain&&!commandBleedAmount(c),'Third attribute leaked',s);
    check(f.totalPlannedContacts<=primary&&totalCommandChainGain(c)===c.hits,
      'Combined arrows outgrew Primary or fake Chain',{...s,plan:f.totalPlannedContacts,primary});
    check(c.markDetonationHitIndex===c.hits-1&&commandMarkPlan(c,100000).consumedTotal===s.capacity,
      'Final native Detonation drift',s);
    if(c.synthesisAxisCredits.PREP_CHAIN_DRY>0)check(f.dryProbability*f.dry+f.dryGuaranteed>0,
      'Dry Apex became impossible at high Quality',s);
    check(near(c.synthesisIdentityAllocation.primaryShare,.7)&&near(c.synthesisIdentityAllocation.secondaryShare,.3),
      '70/30 drift',s);
    for(const receipt of c.synthesisQualityReceipts)check(near(receipt.baseAttributePowerAllocation,receipt.powerBudget*.1)&&
      near(Object.values(receipt.powerAllocation).reduce((n,p)=>n+p,0),receipt.powerBudget),'Base/Quality drift',s);
  };
  for(const t of defs){
    const common=compile(t),parent=synthesizeMarkBurstDetonationPath('COMMON','burst_charge_chain_spec','COMMON');
    compare(common,parent);rows.push(snap(common));
    for(let a=0;a<=4;a++){
      let previous=null;
      for(const rank of SKILL_RARITY_ORDER){
        const c=compile(t,a,rank);cards++;inspect(c);if(a)compare(c,common);
        if(previous)compare(c,previous);previous=c;ranks.push({rank,apex:a,twist:t.id,...snap(c)});
        check(c.animationRecipeId===t.recipe,'Wrong recipe',c.activeAttributeRouteId);
      }
    }
    const high=compile(t,0,'COMMON','LEGENDARY');cards++;inspect(high);
    compare(high,synthesizeMarkBurstDetonationPath('LEGENDARY','burst_charge_chain_spec','LEGENDARY'));
    for(let a=1;a<=4;a++){const child=compile(t,a,'COMMON','LEGENDARY');cards++;inspect(child);compare(child,high);}
  }
  const apexSpreads=[];
  for(const rank of SKILL_RARITY_ORDER){
    check(spread(ranks.filter(r=>r.rank===rank&&!r.apex))<=.2,'Twist power band >20%',rank);
    for(const t of defs){const gap=spread(ranks.filter(r=>r.rank===rank&&r.twist===t.id&&r.apex));
      check(gap<=.25,'Apex power band >25%',{rank,id:t.id,gap});if(rank==='COMMON')apexSpreads.push({id:t.id,spread:gap});}
  }
  openSkillLab();
  const reset=(marks=20,chain=0)=>{startSkillLabCombat();applySkillLabPreset('clean',false);skillLabSession.forceCritical=false;
    boss.hp=boss.maxhp=1e9;boss.posture=0;boss.postureMax=1e6;boss.mark=marks;
    boss.ap=100;boss.resolve=1000;boss.charge=0;boss.chargeEnabled=false;chainStacks=chain;},
    drain=()=>{const first=boss.turnAction,result=[];
      check(!!first,'Missing actual action');
      while(boss.turnAction&&result.length<4){const a=boss.turnAction;
        a.t=.1;drawBowMechanicCue(a,a.bowTimeline,{from:{x:100,y:200},to:{x:300,y:200}});
        drawDefenseChargeStatus(boss);updateTurnAction(100);actions++;finishPlayerAction();result.push(a);}
      check(!boss.turnAction,'Follow-up recursion');return result;},
    ready=(c,gain=0)=>{const hp=boss.hp,mark=bossMark();check(performPlayerAction(c),'Prepare failed',c.activeAttributeRouteId);
      const p=pendingPrimaryChargeRelease();check(p&&boss.phase==='dodge'&&!boss.turnAction&&boss.hp===hp&&bossMark()===mark,
        'Prepare fired or detonated');
      for(let i=0;i<gain;i++)recordDefenseChargeSuccess(1,'DODGE');
      check(beginPlayerTurn(),'Missing next phase');phases++;boss.ap=100;boss.resolve=1000;return p;},
    release=(auto=false)=>{const ap=boss.ap,resolve=boss.resolve;check(releasePrimaryCharge(auto),'Free Release failed');
      const result=drain();check(boss.ap===ap&&boss.resolve===resolve&&!pendingPrimaryChargeRelease()&&bossCharge()===0,
        'Release spent AP/Resolve or gained defense Charge');return result;},
    attack=c=>{boss.ap=100;boss.resolve=1000;check(performPlayerAction(c),'Attack failed');return drain();},
    source=synthesizeSharpshootMarkPath('COMMON'),
    plain={...createRunSkill(BASE_TURN_SKILL_BY_ID.mark_burst),markRule:null,markDetonation:false,damage:1,hits:1},
    [rise,escort,wait,threshold]=defs;
  for(const t of defs)for(let i=0;i<=4;i++){
    const c=compile(t,i);reset();ready(c,3);const r=release()[0];
    const preparation=Array.from({length:r.hits},(_,j)=>commandChargeContactPayload(r.command,r.chargeBonus,0,r.hits,j))
      .reduce((n,v)=>n+v,0);
    check(near(preparation,commandPreparationDamage(c))&&r.chargeBonus>0,'Preparation copied/lost',c.activeAttributeRouteId);
    check(r.bowTimeline.contacts.length===r.hits&&r.preparedChainGenerated===r.hits&&
      r.consumedMark===Math.min(20,c.markDetonationCoreCapacity),'Native contact/Mark mismatch',c.activeAttributeRouteId);
    for(let depth=1;depth<=4;depth++)moveTreeSynthesisRarityByDepth[depth]='COMMON';
    const node=WEAPON_SKILL_PROTOTYPE_LAB_NODE_BY_SKILL_AND_ID.mark_burst[c.activeAttributeRouteId],
      preview=node&&moveTreeSynthesisPreviewCommand(node);
    check(preview&&near(commandExpectedPreparedChainPower(preview),commandExpectedPreparedChainPower(c)),
      'Lab preview mismatch',c.activeAttributeRouteId);
  }
  // Rise: normal contacts build their own paid bonus; starting Chain only via its Apex.
  for(const i of [0,3,4])for(const start of [0,8]){
    const c=compile(rise,i),f=c.chargeChain;reset(0);ready(c);chainStacks=start;releasePrimaryCharge();const r=boss.turnAction;
    for(let j=0;j<r.hits;j++){
      const expected=(j*(f.rise+(start===0?f.zero:0))+start*f.carried)/f.normalHits;
      check(near(preparedChainContactBonus(r,j),stableDamage(expected)),'Rise source/Apex mismatch',{i,start,j});
      resolveTurnActionHit(r);
    }drain();
  }
  // Escort is after all native contacts, paid once, with no duplicated Mark/preparation.
  for(let i=0;i<=4;i++){
    const c=compile(escort,i),f=c.chargeChain;reset();ready(c);release();
    check(boss.preparedChainEscort?.hits===f.escortCount,'Escort was not armed',i);
    const results=attack(source),[trigger,extra]=results;
    check(results.length===2&&extra?.freeFollowUp&&extra.hits===f.escortCount&&
      extra.chainAtStart===trigger.chainAtStart+trigger.hits&&!extra.consumedMark&&!extra.chargeBonus&&
      !extra.command.markRule&&!extra.command.markGain&&extra.preparedChainGenerated===extra.hits&&
      !boss.preparedChainEscort,'Escort contact/order/ownership failed',{i,length:results.length});
    if(extra)check(near(commandDirectDamageTotal(extra.command),f.escortDamage+f.handoff+f.quick),
      'Escort Apex damage absent',i);
    check(attack(plain).length===1,'Escort repeated');
  }
  for(const i of [3,4]){
    const c=compile(escort,i);reset();ready(c);release();
    if(i===4){endPlayerTurn();beginPlayerTurn();phases++;}
    const extra=attack(plain)[1];check(extra&&near(commandDirectDamageTotal(extra.command),c.chargeChain.escortDamage),
      'Same-skill/late escort condition leaked',i);
  }
  // Next prepare does not use the ticket; its automatic Release does, then ends phase.
  reset();const e=compile(escort);ready(e);release();const old=boss.preparedChainEscort;
  ready(compile(rise));check(boss.preparedChainEscort===old,'Prepare consumed escort');
  const automatic=release(true);check(automatic.length===2&&boss.phase==='dodge','Auto-finish lost escort/phase');
  // Wait reads actual attacks performed while READY, not defense or its own arrows.
  for(let i=0;i<=4;i++)for(const scenario of ['early','one','same','different']){
    const c=compile(wait,i),f=c.chargeChain;reset(0);ready(c,5);
    const input=scenario==='early'?[]:scenario==='one'?[plain]:scenario==='same'?[plain,plain]:[plain,source];
    let generated=0;for(const command of input)generated+=attack(command)[0].preparedChainGenerated;
    const setup=pendingPrimaryChargeRelease().chainSetup;
    check((setup?.chain||0)===generated&&(setup?.actions||0)===input.length,'Wait tracked wrong history',{i,scenario,setup});
    releasePrimaryCharge();const r=boss.turnAction,
      expected=generated*(f.wait+(input.length===1?f.one:0)+(scenario==='different'?f.variety:0))+
        (input.length===0?f.early:0);
    check(near(preparedChainContactBonus(r,r.hits-1),stableDamage(expected)),
      'Wait Apex/source mismatch',{i,scenario,expected,setup:r.preparedChainSetup});
    while(r.hitIndex<r.hits)resolveTurnActionHit(r);
    check(near(preparedChainContactBonus(r,r.hits-1),stableDamage(expected)),'Own Release fed wait');drain();
  }
  // Four/three threshold residues: extras pay Chain but never recursively trigger.
  for(let i=0;i<=4;i++){
    const c=compile(threshold,i),f=c.chargeChain;
    for(let start=0;start<f.step;start++){
      reset(20);ready(c);chainStacks=start;releasePrimaryCharge();const r=boss.turnAction,roles=r.command.preparedChainRoles;
      let chain=start,count=0;
      for(let j=0;j<roles.length;j++){
        const role=roles[j],isExtra=role.normal===null;
        if(isExtra){count++;check(j>0&&roles[j-1].normal!==null&&chain%f.step===0,
          'Extra did not follow a normal threshold',{i,start,j});
          check(commandChargeContactPayload(r.command,r.chargeBonus,0,r.hits,j)===0&&
            !r.markPlan.consumedByHit[j],'Extra copied preparation/Detonation',{i,start,j});}
        resolveTurnActionHit(r);chain++;
      }
      check(count<=f.extraBudget&&chainStacks===chain&&r.hits===f.normalHits+count,
        'Threshold budget/Chain mismatch',{i,start,count,chain,actual:chainStacks});
      if(!count)check(near(commandHitBase(r.command,r.hits-1),commandHitBase(c,c.hits-1)+f.dry+f.dryGuaranteed),
        'No-threshold fallback missing',i);
      drain();
    }
  }
  // High-Quality dry branch converts impossible conditional power to the final.
  const highDry=compile(threshold,4,'LEGENDARY','LEGENDARY');reset();ready(highDry);
  const dryAction=release()[0],df=highDry.chargeChain,
    finalNormal=dryAction.command.preparedChainRoles.findIndex(r=>r.normal===df.normalHits-1);
  check(df.dryGuaranteed>0&&near(commandHitBase(dryAction.command,finalNormal),
    commandHitBase(highDry,highDry.hits-1)+df.dryGuaranteed),'High-Quality fallback lost its budget');
  reset();ready(compile(escort));release();resetSkillLabTurn();
  check(!boss.preparedChainEscort&&!pendingPrimaryChargeRelease(),'Reset leaked escort/setup');
  return {passed:!failures.length,twists:4,apexes:16,cards,actions,phases,spread:spread(rows),apexSpreads,
    identity:{passed:identity.passed,distinctCores:identity.distinctCores,maximumSimilarity:identity.maximumSimilarity,neighborSimilarity},rows,failures};
})();
