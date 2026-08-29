/* F6S3: four current ranks, strong-parent sentinels and real event boundaries.
   No ancestor Cartesian matrix or browser runner. */
globalThis.__chargePostureAudit=(()=>{
  const defs=MARK_BURST_CHARGE_POSTURE_TWIST_DEFINITIONS,failures=[],rows=[],ranks=[],
    check=(ok,message,detail)=>{if(!ok)failures.push({message,detail});},near=(a,b)=>Math.abs(a-b)<.01,
    compile=(t,a=0,rank='COMMON',base='COMMON')=>synthesizeMarkBurstDetonationPath(base,
      'burst_charge_posture_spec',base,t.id,a?'COMMON':rank,a?t.id+'_apex_'+a:null,rank),
    snap=c=>({id:c.activeAttributeRouteId,direct:commandDirectDamageTotal(c),hits:c.hits,
      preparation:commandPreparationDamage(c),posture:c.posture,capacity:c.markDetonationCoreCapacity,
      potency:c.markRule.damagePerMark,relationship:commandExpectedPreparedPosturePower(c),
      score:stableEvolutionCombinedGuardrailValue(c)}),
    compare=(c,p)=>{const a=snap(c),b=snap(p);for(const k of Object.keys(a).filter(k=>k!=='id'))
      check(a[k]+.01>=b[k],'Parent/rank regression: '+k,{child:a,parent:b});},
    spread=rs=>{const vs=rs.map(r=>r.score);return (Math.max(...vs)-Math.min(...vs))/Math.max(...vs);};
  let cards=0,actions=0,phases=0;
  const brief=MARK_BURST_CHARGE_POSTURE_BRIEF,entries=defs.map(t=>({id:t.id,
    deliveryPattern:t.key==='breach'?'SEQUENTIAL':'SINGLE',identity:MARK_BURST_ROUTE_BY_ID[t.id].twistIdentity})),
    neighbors=MARK_BURST_ROUTE_CONTRACTS.filter(r=>r.depth===3&&brief.comparisonSpecIds.includes(r.parentId))
      .map(r=>({id:r.id,deliveryPattern:r.delivery.pattern,identity:r.twistIdentity})),
    identity=auditTwistIdentitySet(entries,brief,neighbors),neighborSimilarity=Math.max(...entries.flatMap(e=>
      neighbors.map(n=>twistIdentityBehaviorSimilarity(e.identity,n.identity))));
  check(defs.length===4&&defs.every(t=>t.apexes.length===4),'Expected 4/16 family');
  check(identity.passed&&neighborSimilarity<=brief.maxCatalogSimilarity,'Identity/neighbor failure',{identity,neighborSimilarity});
  const inspect=c=>{
    const f=c.chargePosture,s=snap(c),ledger={totalQuality:c.synthesisQuality,receipts:c.synthesisQualityReceipts};
    check(f&&Object.isFrozen(f)&&commandChargeMode(c)==='DELAYED_PRIMARY'&&
      commandCollectsDefenseCharge(c)&&!commandDefenseTemperRate(c)&&c.chargeBankDamagePerPoint>0,
      'Primary/bank contract drift',s);
    check(!c.markGain&&!c.critChance&&!c.critPrecisionGain&&!c.critDamageStatUnlocked&&!c.breakPowerBonus&&
      !c.extraChainBonus&&!c.consumeChain&&!commandBleedAmount(c),'Third attribute/pure stat leaked',s);
    check(c.markDetonationHitIndex===c.hits-1&&commandMarkPlan(c,10000).consumedTotal===s.capacity&&
      totalCommandChainGain(c)===c.hits,'Native contact/Detonation drift',s);
    if(f.engine==='PREP_POSTURE_BREACH')check(c.hits>=2&&c.hits<skillRoleContactMagnitude(
      {primaryAttributeId:'CHARGE',secondaryAttributeId:'CHAIN'},ledger)&&
      near(c.postureContactPattern.at(-1),0),'Breach/support growth drift',s);
    else check(c.hits===1,'Single route gained extra arrows',s);
    check(near(c.synthesisIdentityAllocation.primaryShare,.7)&&near(c.synthesisIdentityAllocation.secondaryShare,.3),'70/30 drift',s);
    for(const receipt of c.synthesisQualityReceipts)check(near(receipt.baseAttributePowerAllocation,receipt.powerBudget*.1)&&
      near(Object.values(receipt.powerAllocation).reduce((n,p)=>n+p,0),receipt.powerBudget),'Base/Quality drift',s);
  };
  for(const t of defs){const common=compile(t);rows.push(snap(common));
    compare(common,synthesizeMarkBurstDetonationPath('COMMON','burst_charge_posture_spec','COMMON'));
    for(let a=0;a<=4;a++){let previous=null;for(const rank of SKILL_RARITY_ORDER){
      const c=compile(t,a,rank);cards++;inspect(c);if(a)compare(c,common);if(previous)compare(c,previous);previous=c;
      ranks.push({rank,apex:a,twist:t.id,...snap(c)});check(c.animationRecipeId===t.recipe,'Recipe drift',c.activeAttributeRouteId);
    }}
    const high=compile(t,0,'COMMON','LEGENDARY');cards++;inspect(high);
    compare(high,synthesizeMarkBurstDetonationPath('LEGENDARY','burst_charge_posture_spec','LEGENDARY'));
    for(let a=1;a<=4;a++){const c=compile(t,a,'COMMON','LEGENDARY');cards++;inspect(c);compare(c,high);}
  }
  const apexSpreads=[];
  for(const rank of SKILL_RARITY_ORDER){
    check(spread(ranks.filter(r=>r.rank===rank&&!r.apex))<=.2,'Twist power band >20%',rank);
    for(const t of defs){const gap=spread(ranks.filter(r=>r.rank===rank&&r.twist===t.id&&r.apex));
      check(gap<=.25,'Apex power band >25%',{rank,id:t.id,gap});if(rank==='COMMON')apexSpreads.push({id:t.id,spread:gap});}
  }
  openSkillLab();
  const reset=(posture=0)=>{startSkillLabCombat();applySkillLabPreset('clean',false);skillLabSession.forceCritical=false;
    boss.hp=boss.maxhp=1e9;boss.posture=posture;boss.postureMax=100;boss.mark=20;
    boss.ap=100;boss.resolve=1000;boss.charge=0;boss.chargeEnabled=false;chainStacks=0;},
    drain=()=>{const a=boss.turnAction;check(!!a,'Missing action');if(!a)return null;
      a.t=.1;drawBowMechanicCue(a,a.bowTimeline,{from:{x:100,y:200},to:{x:300,y:200}});
      drawDefenseChargeStatus(boss);updateTurnAction(100);actions++;finishPlayerAction();return a;},
    prepare=c=>{const hp=boss.hp,mark=bossMark(),posture=boss.posture;
      check(performPlayerAction(c),'Prepare failed',c.activeAttributeRouteId);
      check(pendingPrimaryChargeRelease()?.status==='ARMED'&&boss.phase==='player'&&!boss.turnAction&&
        boss.hp===hp&&bossMark()===mark&&boss.posture===posture,'Prepare fired or changed resources');
      check(endPlayerTurn()&&pendingPrimaryChargeRelease()?.status==='DEFENDING',
        'Prepare did not wait for manual Finish Turn');},
    ready=(c,gain=0)=>{prepare(c);for(let i=0;i<gain;i++)recordDefenseChargeSuccess(1,'DODGE');
      check(beginPlayerTurn(),'Missing ready phase');phases++;boss.ap=100;boss.resolve=1000;},
    release=()=>{const ap=boss.ap,resolve=boss.resolve;check(releasePrimaryCharge(),'Release failed');const a=drain();
      // A self-Break has its own global AP/Resolve reward; Release itself spent zero.
      check(a.resolveSpent===0&&(a.causedBreak||boss.ap===ap&&boss.resolve===resolve)&&
        !pendingPrimaryChargeRelease()&&bossCharge()===0,'Free Release/no-bank failed',a.command.activeAttributeRouteId);return a;},
    attack=c=>{boss.ap=100;boss.resolve=1000;check(performPlayerAction(c),'Attack failed');return drain();},
    plain={...createRunSkill(BASE_TURN_SKILL_BY_ID.mark_burst),markRule:null,markDetonation:false,damage:1,hits:1},
    pressure={...createRunSkill(BASE_TURN_SKILL_BY_ID.sharpshoot),posture:2,markGain:0,damage:1,hits:1},
    [breach,ambush,transfer,aftershock]=defs;
  for(const t of defs)for(let i=0;i<=4;i++){
    const c=compile(t,i);reset();ready(c,4);const a=release(),prep=Array.from({length:a.hits},(_,j)=>
      commandChargeContactPayload(a.command,a.chargeBonus,0,a.hits,j)).reduce((n,v)=>n+v,0);
    check(near(prep,commandPreparationDamage(c))&&near(a.preparedPostureOwnApplied,c.posture+c.chargePosture.safe)&&
      a.consumedMark===c.markDetonationCoreCapacity&&a.bowTimeline.contacts.length===c.hits,
      'Native payload/real contact mismatch',c.activeAttributeRouteId);
    for(let d=1;d<=4;d++)moveTreeSynthesisRarityByDepth[d]='COMMON';
    const node=WEAPON_SKILL_PROTOTYPE_LAB_NODE_BY_SKILL_AND_ID.mark_burst[c.activeAttributeRouteId],
      preview=node&&moveTreeSynthesisPreviewCommand(node);
    check(preview&&near(commandExpectedPreparedPosturePower(preview),commandExpectedPreparedPosturePower(c)),
      'Lab preview mismatch',c.activeAttributeRouteId);
  }
  // Real opening contact, self-Break versus already Broken, plus prior different skill.
  for(let i=0;i<=4;i++){
    const c=compile(breach,i);reset(99.99);ready(c);releasePrimaryCharge();const a=boss.turnAction;
    resolveTurnActionHit(a);check(a.preparedPostureOpened&&boss.playerTurnBreak&&
      near(preparedPostureContactBonus(a,a.hits-1),c.chargePosture.breach),'Own opener Break/final failed',i);drain();
  }
  reset();const b=compile(breach,3);ready(b);boss.pendingBreak={source:'fixture'};beginBossBreak(boss);
  const already=release();check(!already.preparedPostureOpened&&
    near(preparedPostureContactBonus(already,already.hits-1),b.chargePosture.ready),'Ready Gedik failed');
  reset();attack(pressure);ready(compile(breach,4));const joint=release();
  check(joint.preparedPostureJoint&&near(joint.preparedPostureOwnApplied,
    joint.command.posture+joint.command.chargePosture.joint),'Joint setup ignored actual prior Posture');
  // Ambush records real external Break after Prepare, never the release's own Break.
  for(let i=0;i<=4;i++){
    const c=compile(ambush,i);reset(99);ready(c);attack(pressure);
    check(pendingPrimaryChargeRelease().preparedPosture.breakSeen,'External Break not captured');
    const a=release(),f=c.chargePosture;check(a.preparedPosture.breakSkillId==='sharpshoot'&&
      near(preparedPostureContactBonus(a,0),f.ambush+f.first+f.coop),'Ambush Apex mismatch',i);
  }
  reset(99.99);ready(compile(ambush));const self=release();
  check(!self.preparedPosture.breakSeen&&preparedPostureContactBonus(self,0)===0,'Self Release counted as ambush');
  reset(99);prepare(compile(ambush));applyBossPosture(2,'parry');phases++;
  check(primaryChargeReleaseReady(),'Defense Break did not ready Release');
  const defended=release();check(defended.preparedPosture.breakSeen&&!defended.preparedPosture.breakSkillId,
    'Defense Break was not tracked separately from skill');
  // Transfer: actual delivered pressure, after next attack, once, no copied payloads.
  for(let i=0;i<=4;i++){
    const c=compile(transfer,i);reset();ready(c);const r=release(),ticket=boss.preparedPostureTransfer;
    check(ticket&&near(ticket.damage,r.preparedPostureOwnApplied*c.chargePosture.transferRate),'Transfer source mismatch',i);
    const a=attack(pressure);check(near(a.preparedPostureTransferResult,ticket.damage+ticket.handoff+ticket.quick)&&
      !boss.preparedPostureTransfer,'Transfer Apex/once failure',i);
    check(!attack(plain).preparedPostureTransferResult,'Transfer recursed');
  }
  reset(99.9);ready(compile(transfer));release();
  check(near(boss.preparedPostureTransfer.damage,.1*compile(transfer).chargePosture.transferRate),
    'Overflow counted as real applied Posture');
  reset();const quick=compile(transfer,3);ready(quick);release();const old=boss.preparedPostureTransfer;
  prepare(compile(breach));check(boss.preparedPostureTransfer===old,'Prepare consumed transfer');
  beginPlayerTurn();phases++;const next=release();
  check(near(next.preparedPostureTransferResult,old.damage),'Same-skill or next-phase bonus leaked');
  // Delayed pressure: keep native impact; resolve only in the next defense, once.
  for(let i=0;i<=4;i++){
    const c=compile(aftershock,i);reset();ready(c);
    if(i===3){boss.pendingBreak={source:'fixture'};beginBossBreak(boss);}
    const a=release(),f=c.chargePosture;
    if(i===4)attack(pressure);
    const pending=boss.preparedPostureAftershock,expected=f.aftershock+(i===3?f.broken:0)+(i===4?f.follow:0);
    check(pending&&near(pending.early+pending.late,expected),'Aftershock Apex setup mismatch',i);
    const before=i===3?0:boss.posture,chain=chainStacks,marks=bossMark();endPlayerTurn();phases++;
    if(i===2)check(near(boss.posture,before+expected)&&!boss.preparedPostureLate,'Early aftershock timing');
    else {check(near(boss.posture,before)&&near(boss.preparedPostureLate,expected),'Late fired too early',i);
      boss.attack=chooseBossAttack(5);boss.sequenceIndex=0;boss.state='strike';boss.stateT=100;
      updateBoss(.01);updateHazards();check(near(boss.posture,before+expected)&&!boss.preparedPostureLate,'Real boss move did not resolve artçı',i);}
    const once=boss.posture;finishPreparedPostureDefenseMove();
    check(near(boss.posture,once)&&bossMark()===marks&&chainStacks===0,'Artçı repeated or generated Mark/Chain',i);
  }
  // Late Break interrupts the remaining combo; early Break prevents its first attack.
  for(const i of [0,2]){
    reset();const c=compile(aftershock,i);ready(c);release();boss.posture=99.99;endPlayerTurn();phases++;
    if(i===0){boss.attack=chooseBossAttack(5);boss.sequenceIndex=0;boss.state='strike';boss.stateT=100;updateBoss(.01);updateHazards();}
    check(boss.playerTurnBreak&&boss.phase==='player'&&!boss.preparedPostureLate,'Artçı failed to open/interrupt Break',i);
  }
  // No late Break can bypass the pending collision/grace verdict of attack one.
  reset();ready(compile(aftershock));release();endPlayerTurn();phases++;
  const blocker={src:BOSS_SOURCE,done:false,impact:perfNow+100,kind:'frame',lanes:[0],height:'mid'};
  hazards.push(blocker);boss.posture=99.99;boss.preparedPostureMoveEnded=true;
  updateHazards();check(boss.phase==='dodge'&&boss.preparedPostureLate>0&&!blocker.done,'Artçı erased unresolved first attack');
  blocker.done=true;updateHazards();check(boss.playerTurnBreak&&!boss.preparedPostureLate,'Artçı did not follow collision verdict');
  // A failed action cannot consume the one-use transfer; same skill is not Joint setup.
  reset();ready(compile(transfer,2));release();boss.ap=0;const retained=boss.preparedPostureTransfer;
  check(!performPlayerAction(plain)&&boss.preparedPostureTransfer===retained,'Failed action consumed transfer');
  boss.ap=100;const same=attack(plain);check(near(same.preparedPostureTransferResult,retained.damage),
    'Same skill received different-skill transfer bonus');
  reset();attack({...plain,posture:2});ready(compile(breach,4));check(!release().preparedPostureJoint,'Same skill counted as Joint');
  // A second real attack inside the Break removes the first-opportunity bonus.
  reset(99);const first=compile(ambush,2);ready(first);attack(pressure);attack(plain);
  const late=release();check(near(preparedPostureContactBonus(late,0),first.chargePosture.ambush),'First-opportunity bonus leaked later');
  // A new player window alone does not deliver the next-defense packet.
  reset();const art=compile(aftershock);ready(art);release();
  const q=boss.preparedPostureAftershock.late;
  check(near(q,art.chargePosture.aftershock),'Unexpected pending packet');
  beginPlayerTurn(true); // a new player window does not deliver the next-defense packet
  check(near(boss.preparedPostureAftershock.late,q),'Player window consumed next-defense packet');
  reset();ready(compile(transfer));release();resetSkillLabTurn();
  check(!boss.preparedPostureTransfer&&!boss.preparedPostureAftershock&&!boss.preparedPostureLastAttack&&
    !boss.preparedPostureLate&&!pendingPrimaryChargeRelease(),'Reset leaked prepared pressure');
  return {passed:!failures.length,twists:4,apexes:16,cards,actions,phases,spread:spread(rows),apexSpreads,
    identity:{passed:identity.passed,distinctCores:identity.distinctCores,maximumSimilarity:identity.maximumSimilarity,neighborSimilarity},rows,failures};
})();
