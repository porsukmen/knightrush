/* F6S4: sparse current ranks, strong-parent sentinels and real outcome boundaries.
   No ancestor Cartesian product or browser run. */
globalThis.__chargeCriticalAudit=(()=>{
  const defs=MARK_BURST_CHARGE_CRITICAL_TWIST_DEFINITIONS,failures=[],rows=[],ranks=[],
    check=(ok,message,detail)=>{if(!ok)failures.push({message,detail});},near=(a,b)=>Math.abs(a-b)<.015,
    compile=(t,a=0,rank='COMMON',base='COMMON')=>synthesizeMarkBurstDetonationPath(base,
      'burst_charge_critical_spec',base,t.id,a?'COMMON':rank,a?t.id+'_apex_'+a:null,rank),
    snap=c=>({id:c.activeAttributeRouteId,direct:commandDirectDamageTotal(c),hits:c.hits,
      preparation:commandPreparationDamage(c),chance:c.critChance,capacity:c.markDetonationCoreCapacity,
      potency:c.markRule.damagePerMark,relationship:commandExpectedPreparedCriticalPower(c),
      score:stableEvolutionCombinedGuardrailValue(c)}),
    compare=(c,p)=>{const a=snap(c),b=snap(p);for(const k of ['direct','preparation','chance','capacity','potency','score'])
      check(a[k]+.0001>=b[k],'Parent/rank regression: '+k,{child:a,parent:b});},
    spread=rs=>{const vs=rs.map(r=>r.score);return (Math.max(...vs)-Math.min(...vs))/Math.max(...vs);};
  let cards=0,actions=0,phases=0;
  const brief=MARK_BURST_CHARGE_CRITICAL_BRIEF,entries=defs.map(t=>({id:t.id,
    deliveryPattern:t.key==='shotgun'?'SIMULTANEOUS_PACKET':'SINGLE',identity:MARK_BURST_ROUTE_BY_ID[t.id].twistIdentity})),
    neighbors=MARK_BURST_ROUTE_CONTRACTS.filter(r=>r.depth===3&&brief.comparisonSpecIds.includes(r.parentId))
      .map(r=>({id:r.id,deliveryPattern:r.delivery.pattern,identity:r.twistIdentity})),
    identity=auditTwistIdentitySet(entries,brief,neighbors),neighborSimilarity=Math.max(...entries.flatMap(e=>
      neighbors.map(n=>twistIdentityBehaviorSimilarity(e.identity,n.identity))));
  check(defs.length===4&&defs.every(t=>t.apexes.length===4),'Expected 4/16 family');
  check(identity.passed&&neighborSimilarity<=brief.maxCatalogSimilarity,'Identity/neighbor failure',{identity,neighborSimilarity});
  const inspect=c=>{
    const f=c.chargeCritical,s=snap(c),ledger={totalQuality:c.synthesisQuality,receipts:c.synthesisQualityReceipts};
    check(f&&Object.isFrozen(f)&&commandChargeMode(c)==='DELAYED_PRIMARY'&&
      commandCollectsDefenseCharge(c)&&!commandDefenseTemperRate(c)&&c.chargeBankDamagePerPoint>0,
      'Primary/bank contract drift',s);
    check(!c.markGain&&!c.critPrecisionGain&&!c.critDamageStatUnlocked&&!c.breakPowerBonus&&
      !c.posture&&!c.extraChainBonus&&!c.consumeChain&&!commandBleedAmount(c)&&
      c.critDamageMultiplier===CFG.CRIT_DAMAGE_MULT&&c.critChance>0&&c.critChance<=1,
      'Third attribute/Crit stat leak',s);
    check(c.markDetonationHitIndex===c.hits-1&&commandMarkPlan(c,10000).consumedTotal===s.capacity&&
      totalCommandChainGain(c)===c.hits,'Native contact/Detonation drift',s);
    if(f.engine==='PREP_CRIT_SHOTGUN')check(c.chainScalingTiming==='ACTION_START',
      'Simultaneous pellets read one shared Chain snapshot',s);
    const secondary=skillRoleContactMagnitude({primaryAttributeId:'CHARGE',secondaryAttributeId:'CHAIN',mechanics:{}},ledger),
      primary=skillRoleContactMagnitude({primaryAttributeId:'CHAIN',mechanics:{}},ledger);
    check(f.plannedContacts<=Math.max(3,secondary)&&f.plannedContacts<=primary,
      'Combined support plan outgrew Chain',{id:s.id,plan:f.plannedContacts,secondary,primary});
    check(near(c.synthesisIdentityAllocation.primaryShare,.7)&&near(c.synthesisIdentityAllocation.secondaryShare,.3),'70/30 drift',s);
    for(const receipt of c.synthesisQualityReceipts)check(near(receipt.baseAttributePowerAllocation,receipt.powerBudget*.1)&&
      near(Object.values(receipt.powerAllocation).reduce((n,p)=>n+p,0),receipt.powerBudget),'Base/Quality drift',s);
    check(f.steady+f.missing+f.repeat<=(s.direct+s.preparation)*(CFG.CRIT_DAMAGE_MULT-1)+.001,
      'Insurance exceeds Crit advantage',s);
  };
  for(const t of defs){const common=compile(t);rows.push(snap(common));
    compare(common,synthesizeMarkBurstDetonationPath('COMMON','burst_charge_critical_spec','COMMON'));
    for(let a=0;a<=4;a++){let previous=null;for(const rank of SKILL_RARITY_ORDER){
      const c=compile(t,a,rank);cards++;inspect(c);if(a)compare(c,common);if(previous)compare(c,previous);previous=c;
      ranks.push({rank,apex:a,twist:t.id,...snap(c)});check(c.animationRecipeId===t.recipe,'Recipe drift',c.activeAttributeRouteId);
    }}
    const high=compile(t,0,'COMMON','LEGENDARY');cards++;inspect(high);
    compare(high,synthesizeMarkBurstDetonationPath('LEGENDARY','burst_charge_critical_spec','LEGENDARY'));
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
    drain=()=>{const a=boss.turnAction;check(!!a,'Missing action');if(!a)return null;
      a.t=.1;drawBowMechanicCue(a,a.bowTimeline,{from:{x:100,y:200},to:{x:300,y:200}});
      drawDefenseChargeStatus(boss);updateTurnAction(100);actions++;finishPlayerAction();return a;},
    ready=(c,gain=0)=>{const hp=boss.hp,mark=bossMark();check(performPlayerAction(c),'Prepare failed',c.activeAttributeRouteId);
      check(pendingPrimaryChargeRelease()?.status==='ARMED'&&boss.phase==='player'&&!boss.turnAction&&boss.hp===hp&&bossMark()===mark,
        'Prepare fired or detonated');
      check(endPlayerTurn()&&pendingPrimaryChargeRelease()?.status==='DEFENDING',
        'Prepare did not wait for manual Finish Turn');
      for(let i=0;i<gain;i++)recordDefenseChargeSuccess(1,'DODGE');
      check(beginPlayerTurn(),'Missing ready phase');phases++;boss.ap=100;boss.resolve=1000;},
    release=(crit=true)=>{const ap=boss.ap,resolve=boss.resolve;check(releasePrimaryCharge(),'Release failed');
      if(boss.turnAction)boss.turnAction.critPlan=createCommandCritPlan(boss.turnAction.command,'knight',()=>crit?0:.999999);
      const a=drain();if(!a)throw new Error(JSON.stringify(failures.slice(-4)));
      check(a.resolveSpent===0&&boss.ap===ap&&boss.resolve===resolve&&
        !pendingPrimaryChargeRelease()&&bossCharge()===0,'Free Release/no-bank failed');return a;},
    attack=c=>{boss.ap=100;boss.resolve=1000;check(performPlayerAction(c),'Attack failed');return drain();},
    plain={...createRunSkill(BASE_TURN_SKILL_BY_ID.sharpshoot),markRule:null,markGain:0,damage:1,hits:1},
    [shotgun,aim,steady,aftershock]=defs;
  for(const t of defs)for(let i=0;i<=4;i++){
    const c=compile(t,i);reset();ready(c,4);const a=release(),prep=Array.from({length:a.hits},(_,j)=>
      commandChargeContactPayload(a.command,a.chargeBonus,0,a.hits,j)).reduce((n,v)=>n+v,0);
    check(near(prep,commandPreparationDamage(a.command))&&a.consumedMark===c.markDetonationCoreCapacity&&
      a.bowTimeline.contacts.length===c.hits,'Native payload/real contact mismatch',c.activeAttributeRouteId);
    for(let d=1;d<=4;d++)moveTreeSynthesisRarityByDepth[d]='COMMON';
    const node=WEAPON_SKILL_PROTOTYPE_LAB_NODE_BY_SKILL_AND_ID.mark_burst[c.activeAttributeRouteId],
      preview=node&&moveTreeSynthesisPreviewCommand(node);
    check(preview&&near(commandExpectedPreparedCriticalPower(preview),commandExpectedPreparedCriticalPower(c)),
      'Lab preview mismatch',c.activeAttributeRouteId);
  }
  // One packet, independent rolls, additive outcome bonus and one final detonation.
  for(let i=0;i<=4;i++){
    reset();const c=compile(shotgun,i),f=c.chargeCritical;ready(c);releasePrimaryCharge();let n=0;
    boss.turnAction.critPlan=createCommandCritPlan(c,'knight',()=>n++%2?0:.999999);
    const a=drain(),crits=a.critPlan.contacts.filter(h=>h.critical).length;
    check(crits>0&&crits<c.hits&&near(a.preparedCriticalBonus,crits*(f.perCrit+f.opening)+(c.hits-crits)*f.partial)&&
      chainStacks===c.hits&&a.consumedMark===c.markDetonationCoreCapacity,'Independent pellet outcome failed',i);
  }
  check(compile(shotgun,2).hits===compile(shotgun).hits+1,'Paid pellet Apex missing');
  for(const i of [3,4]){
    reset();const c=compile(aim,i);ready(c);if(i===4)attack(plain);const a=release(false);
    check(near(a.preparedCriticalBonus,i===3?c.chargeCritical.early:c.chargeCritical.handoff),'Aim timing/rotation Apex failed',i);
    reset();ready(c);if(i===3)attack(plain);check(near(release(false).preparedCriticalBonus,0),'Aim condition leaked',i);
  }
  check(compile(aim,1).critChance>compile(aim).critChance,'Aim mastery did not buy chance');
  // Chance saturation conserves expected native power and never creates Crit Damage.
  reset();const focused=compile(aim),originalGlobal=playerChar.globalCritChance;
  try{playerChar.globalCritChance=1;
    const adapted=preparedCriticalRuntimeCommand(focused,'knight'),before=commandDirectDamageTotal(focused)+commandPreparationDamage(focused),
      after=commandDirectDamageTotal(adapted)+commandPreparationDamage(adapted);
    check(adapted.critChance===0&&after>before&&near(after*CFG.CRIT_DAMAGE_MULT,
      before*(CFG.CRIT_DAMAGE_MULT+focused.critChance*(CFG.CRIT_DAMAGE_MULT-1))), 'Chance overflow lost/doubled Quality');
  }finally{playerChar.globalCritChance=originalGlobal;}
  for(let i=0;i<=4;i++){
    reset();const c=compile(steady,i),f=c.chargeCritical;ready(c);boss.hp=boss.maxhp*.5;
    const a=release(false);check(near(a.preparedCriticalBonus,f.steady+.5*f.missing),'Insurance/missing Health failed',i);
    ready(c);const repeated=release(false);check(repeated.preparedCriticalContext.repeat&&
      near(repeated.preparedCriticalBonus,f.steady+repeated.preparedCriticalMissing*f.missing+f.repeat),'Repeat insurance failed',i);
    ready(c);const critical=release(true);check(near(critical.preparedCriticalBonus,0),'Insurance paid on Crit',i);
  }
  reset();const repeat=compile(steady,4);ready(repeat);release(false);attack(plain);ready(repeat);
  check(!release(false).preparedCriticalContext.repeat,'Other real attack did not break repeat');
  // Source Crit arms once; real next defense completion delivers clean non-Crit arrows.
  for(let i=0;i<=4;i++){
    reset();const c=compile(aftershock,i),f=c.chargeCritical;ready(c);if(i===4)attack(plain);
    const source=release(true),ticket=boss.preparedCriticalAftershock;
    check(ticket&&near(ticket.damage,f.supportDamage+(i===4?f.rotation:f.first))&&!boss.turnAction,
      'Aftershock armed incorrectly',i);
    endPlayerTurn();check(!boss.turnAction&&boss.preparedCriticalAftershock===ticket,'Aftershock fired during defense');
    const mark=bossMark();skillLabSession.forceCritical=true;beginPlayerTurn();phases++;
    const follow=drain();skillLabSession.forceCritical=false;
    check(follow.freeFollowUp&&follow.hits===f.supportHits&&!follow.anyCritical&&!follow.chargeBonus&&
      !follow.command.markRule&&!follow.command.chargeCritical&&!boss.preparedCriticalAftershock&&
      bossMark()===mark&&chainStacks===f.supportHits&&!boss.preparedCriticalPhase,
      'Support copied payload, Crit, recursed or stole first attack',i);
    check(!releasePreparedCriticalAftershock(),'Aftershock repeated');
    ready(c);release(false);check(!boss.preparedCriticalAftershock,'Non-Crit scheduled artçı');
  }
  check(compile(aftershock,2).chargeCritical.supportHits===compile(aftershock).chargeCritical.supportHits+1,'Paid support Apex missing');
  // Actual HP, not just the payload counters: preparation Crits once, the paid
  // outcome bonus does not Crit again, and Base Detonation remains outside it.
  for(const t of [shotgun,aim,steady])for(const crit of [false,true]){
    reset();const c=compile(t,3);ready(c);const before=boss.hp,a=release(crit),
      native=commandDirectDamageTotal(a.command)+a.chargeBonus,
      detonation=a.markPlan.markDamageByHit.reduce((n,v)=>n+v,0),
      expected=native*(crit?CFG.CRIT_DAMAGE_MULT:1)+a.preparedCriticalBonus+detonation;
    check(Math.abs(before-boss.hp-expected)<.02,'Real HP copied preparation/bonus or Crit-multiplied Detonation',
      {id:c.activeAttributeRouteId,crit,actual:before-boss.hp,expected});
  }
  // Artçı and a new ready preparation can coexist. Support cannot consume that
  // preparation or the player's first-attack condition, including defense Break.
  reset();ready(compile(aftershock));release(true);const next=compile(aim,3);
  check(performPlayerAction(next),'Next Prepare failed');
  check(endPlayerTurn()&&pendingPrimaryChargeRelease()?.status==='DEFENDING',
    'Next Prepare did not enter defense manually');
  boss.postureMax=100;boss.posture=99.99;
  applyBossPosture(1,'parry');phases++;
  check(boss.playerTurnBreak&&primaryChargeReleaseReady()&&boss.turnAction?.freeFollowUp,
    'Defense Break did not release support alongside ready preparation');
  drain();boss.ap=100;boss.resolve=1000;const opening=release(false);
  check(opening.preparedCriticalContext.first&&near(opening.preparedCriticalBonus,next.chargeCritical.early),
    'Automatic support consumed the new preparation/opening condition');
  // Critical and Chain are additive in the global damage formula. Insurance must
  // not acquire a second Chain scaling term that reverses the critical advantage.
  for(const chain of [8,100]){
    const damage=[];
    for(const crit of [false,true]){
      reset();const c=compile(steady,4);ready(c);release(false);ready(c);
      chainStacks=chain;boss.hp=1e6;const before=boss.hp,a=release(crit),
        native=commandDirectDamageTotal(a.command)+a.chargeBonus,
        detonation=a.markPlan.markDamageByHit.reduce((n,v)=>n+v,0),
        expected=native*(1+chainBonus()*chain+(crit?CFG.CRIT_DAMAGE_MULT-1:0))+a.preparedCriticalBonus+detonation;
      damage.push(before-boss.hp);
      check(Math.abs(before-boss.hp-expected)<.02,'Outcome bonus acquired extra Chain scaling',{chain,crit,expected,actual:before-boss.hp});
    }
    check(damage[1]>damage[0],'High Chain made a non-Crit stronger than Crit',{chain,damage});
  }
  // Synthetic price boundary only, not a history matrix: paid chance saturation
  // and near-certain Crit must leave neither dead Quality nor inverted insurance.
  const boundary={...compile(steady),preparedRelease:{damage:10},damage:10,hits:1,hitDamages:[10]},
    axes={CRIT_CHANCE:100,PREP_CRIT_STEADY:20,PREP_CRIT_MISSING:10,PREP_CRIT_REPEAT:10};
  materializePreparedCritical(boundary,axes,{totalQuality:16},'PREP_CRIT_STEADY');
  check(boundary.critChance===1&&boundary.chargeCritical.steady===0&&
    boundary.chargeCritical.missing===0&&boundary.chargeCritical.repeat===0&&
    near((commandDirectDamageTotal(boundary)+commandPreparationDamage(boundary))*CFG.CRIT_DAMAGE_MULT,160),
    'Saturated insurance/chance budget lost or inverted');
  reset();ready(compile(aftershock));release(true);resetSkillLabTurn();
  check(!boss.preparedCriticalAftershock&&!boss.preparedCriticalLastAttack&&!boss.preparedCriticalPhase&&
    !pendingPrimaryChargeRelease(),'Reset leaked prepared Critical state');
  return {passed:!failures.length,twists:4,apexes:16,cards,actions,phases,spread:spread(rows),apexSpreads,
    identity:{passed:identity.passed,distinctCores:identity.distinctCores,maximumSimilarity:identity.maximumSimilarity,neighborSimilarity},rows,failures};
})();
