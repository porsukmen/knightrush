/* F6S6: sparse current ranks/strong parents, exact bank events and real releases.
   References price quality; they never cap the runtime bank or defense count. */
globalThis.__chargeFocusAudit=(()=>{
  const defs=MARK_BURST_CHARGE_FOCUS_TWIST_DEFINITIONS,failures=[],rows=[],ranks=[],
    check=(ok,message,detail)=>{if(!ok)failures.push({message,detail});},near=(a,b)=>Math.abs(a-b)<.025,
    compile=(t,a=0,rank='COMMON',base='COMMON')=>synthesizeMarkBurstDetonationPath(base,
      'burst_charge_focus_spec',base,t.id,a?'COMMON':rank,a?t.id+'_apex_'+a:null,rank),
    snap=c=>({id:c.activeAttributeRouteId,direct:commandDirectDamageTotal(c),hits:c.hits,
      preparation:commandPreparationDamage(c),bank:c.chargeBankDamagePerPoint,
      capacity:c.markDetonationCoreCapacity,potency:c.markRule.damagePerMark,
      relationship:commandExpectedPreparedFocusPower(c),score:stableEvolutionCombinedGuardrailValue(c)}),
    compare=(c,p)=>{const a=snap(c),b=snap(p);for(const k of ['direct','hits','preparation','bank','capacity','potency','score'])
      check(a[k]+.025>=b[k],'Parent/rank regression: '+k,{child:a,parent:b});},
    spread=rs=>{const vs=rs.map(r=>r.score);return (Math.max(...vs)-Math.min(...vs))/Math.max(...vs);};
  let cards=0,actions=0,phases=0;
  const brief=MARK_BURST_CHARGE_FOCUS_BRIEF,entries=defs.map(t=>({id:t.id,
    deliveryPattern:t.key==='split'?'SEQUENTIAL':'SINGLE',identity:MARK_BURST_ROUTE_BY_ID[t.id].twistIdentity})),
    neighbors=MARK_BURST_ROUTE_CONTRACTS.filter(r=>r.depth===3&&brief.comparisonSpecIds.includes(r.parentId))
      .map(r=>({id:r.id,deliveryPattern:r.delivery.pattern,identity:r.twistIdentity})),
    identity=auditTwistIdentitySet(entries,brief,neighbors),neighborSimilarity=Math.max(...entries.flatMap(e=>
      neighbors.map(n=>twistIdentityBehaviorSimilarity(e.identity,n.identity))));
  check(defs.length===4&&defs.every(t=>t.apexes.length===4),'Expected 4/16 family');
  check(identity.passed&&neighborSimilarity<=brief.maxCatalogSimilarity,'Identity/neighbor failure',{identity,neighborSimilarity});
  const inspect=c=>{
    const f=c.chargeFocus,s=snap(c),ledger={totalQuality:c.synthesisQuality,receipts:c.synthesisQualityReceipts},
      paid=Object.entries(c.synthesisAxisCredits).reduce((sum,[key,v])=>sum+(key.startsWith('PREP_FOCUS_')?v:0),0),
      expressed=commandExpectedPreparedFocusPower(c)+commandPreparationDamage(c)-c.synthesisAxisCredits.CHARGE_RELEASE+
        (c.hits-1)*SKILL_GUARDRAIL_POWER_VALUES.CHAIN_GAIN;
    check(f&&Object.isFrozen(f)&&Object.isFrozen(c.preparedRelease)&&commandChargeMode(c)==='DELAYED_PRIMARY'&&
      commandCollectsDefenseCharge(c)&&!commandDefenseTemperRate(c)&&s.bank>0,'Primary/pure bank drift',s);
    check(!c.markGain&&!c.critChance&&!c.critPrecisionGain&&!c.critDamageStatUnlocked&&!c.breakPowerBonus&&
      !c.posture&&!commandBleedAmount(c)&&!c.extraChainBonus&&!c.consumeChain&&!c.chargePowerPerPoint,
      'Unapproved attribute/general multiplier',s);
    check(c.markDetonationHitIndex===c.hits-1&&commandMarkPlan(c,10000).consumedTotal===s.capacity&&
      totalCommandChainGain(c)===c.hits,'Contact/Detonation drift',s);
    check(near(paid,expressed),'Relationship budget spent twice/lost',{id:s.id,paid,expressed});
    if(f.engine==='PREP_FOCUS_SPLIT')for(const primary of [true,false])
      check(c.hits>=2&&c.hits<skillRoleContactMagnitude(
        {primaryAttributeId:primary?'CHAIN':'CHARGE',secondaryAttributeId:primary?'CHARGE':'CHAIN',mechanics:{}},ledger),
        'Support arrows outgrew Chain role',{...s,primary});
    check(near(c.synthesisIdentityAllocation.primaryShare,1)&&near(c.synthesisIdentityAllocation.secondaryShare,0),
      'Pure same-attribute budget drift',s);
    for(const receipt of c.synthesisQualityReceipts)check(near(receipt.baseAttributePowerAllocation,receipt.powerBudget*.1)&&
      near(Object.values(receipt.powerAllocation).reduce((n,p)=>n+p,0),receipt.powerBudget),'Base/Quality drift',s);
    check(f.empty<=(s.bank+f.bankRate)+.001&&f.start<=f.streak,'Fallback rewards failure',s);
  };
  for(const t of defs){const common=compile(t);rows.push(snap(common));
    compare(common,synthesizeMarkBurstDetonationPath('COMMON','burst_charge_focus_spec','COMMON'));
    for(let a=0;a<=4;a++){let previous=null;for(const rank of SKILL_RARITY_ORDER){
      const c=compile(t,a,rank);cards++;inspect(c);if(a)compare(c,common);if(previous)compare(c,previous);previous=c;
      ranks.push({rank,apex:a,twist:t.id,...snap(c)});check(c.animationRecipeId===t.recipe,'Recipe drift',c.activeAttributeRouteId);
    }}
    const high=compile(t,0,'COMMON','LEGENDARY');cards++;inspect(high);
    compare(high,synthesizeMarkBurstDetonationPath('LEGENDARY','burst_charge_focus_spec','LEGENDARY'));
    for(let a=1;a<=4;a++){const c=compile(t,a,'COMMON','LEGENDARY');cards++;inspect(c);compare(c,high);}
  }
  const long=defs[1],legendary=synthesizeMarkBurstDetonationPath('LEGENDARY','burst_charge_focus_spec','LEGENDARY',
    long.id,'LEGENDARY',long.id+'_apex_2','LEGENDARY');cards++;inspect(legendary);
  const apexSpreads=[];
  for(const rank of SKILL_RARITY_ORDER){
    check(spread(ranks.filter(r=>r.rank===rank&&!r.apex))<=.2,'Twist power band >20%',rank);
    for(const t of defs){const gap=spread(ranks.filter(r=>r.rank===rank&&r.twist===t.id&&r.apex));
      check(gap<=.25,'Apex power band >25%',{rank,id:t.id,gap});if(rank==='COMMON')apexSpreads.push({id:t.id,spread:gap});}
  }
  openSkillLab();
  const reset=()=>{startSkillLabCombat();applySkillLabPreset('clean',false);skillLabSession.forceCritical=false;
    boss.hp=boss.maxhp=1e9;boss.posture=0;boss.postureMax=1e6;boss.mark=20;
    boss.ap=100;boss.resolve=1000;boss.charge=0;boss.chargeEnabled=true;chainStacks=0;player.invuln=0;},
    drain=()=>{const a=boss.turnAction;if(!a)throw new Error('Missing action '+JSON.stringify(failures.slice(-3)));
      a.t=.1;drawBowMechanicCue(a,a.bowTimeline,{from:{x:100,y:200},to:{x:300,y:200}});
      drawDefenseChargeStatus(boss);updateTurnAction(100);actions++;finishPlayerAction();return a;},
    prepare=(c,old=0)=>{boss.ap=100;boss.resolve=1000;boss.charge=old;
      const hp=boss.hp,mark=bossMark(),ap=boss.ap,resolve=boss.resolve;
      check(performPlayerAction(c),'Prepare failed',c.activeAttributeRouteId);
      const p=pendingPrimaryChargeRelease();
      check(p&&boss.phase==='dodge'&&!boss.turnAction&&boss.hp===hp&&bossMark()===mark&&boss.ap<ap&&boss.resolve<resolve,
        'Prepare fired/did not pay');
      check(p.reservedBank===(commandCollectsDefenseCharge(c)?old:0),'Old bank not reserved',c.activeAttributeRouteId);
      return p;},
    ready=(c,old=0,events=[])=>{const p=prepare(c,old);
      for(const [kind,gain] of events)recordDefenseChargeSuccess(gain,kind);
      check(beginPlayerTurn(),'Missing ready phase');phases++;boss.ap=100;boss.resolve=1000;return p;},
    release=()=>{const ap=boss.ap,resolve=boss.resolve,before=boss.hp,chain=chainStacks;
      check(releasePrimaryCharge(),'Release failed');
      if(boss.turnAction)boss.turnAction.critPlan=createCommandCritPlan(boss.turnAction.command,'knight',()=>1,0);
      const a=drain();a.auditDamage=before-boss.hp;a.auditChain=chain;
      check(a.resolveSpent===0&&boss.ap===ap&&boss.resolve===resolve&&!pendingPrimaryChargeRelease(),
        'Free Release failed');return a;},
    attack=c=>{boss.ap=100;boss.resolve=1000;check(performPlayerAction(c),'Attack failed');return drain();},
    plain={...createRunSkill(BASE_TURN_SKILL_BY_ID.mark_burst),markRule:null,markDetonation:false,damage:1,hits:1,canCrit:false},
    foreign=synthesizeSharpshootChargePath('COMMON','charge_mark_spec','COMMON'),
    other=synthesizeMarkBurstDetonationPath('COMMON','burst_charge_detonation_spec','COMMON'),
    [power,split,streak,carry]=defs,
    expectedHP=a=>{
      const c=a.command,f=c.chargeFocus,bank=commandReservedChargeBonus(c,a.chargeSpent),
        preparation=commandPreparationDamage(c),front=f?.front||0;
      let total=a.preparedFocusDirect||0;
      for(let j=0;j<a.hits;j++){
        const payload=f?.engine==='PREP_FOCUS_SPLIT'?(j===0?preparation+bank*front:bank*(1-front)/(a.hits-1)):
          (preparation+bank)/a.hits;
        total+=(commandHitBase(c,j)+payload)*(1+chainBonus()*(a.auditChain+j))+(a.markPlan.markDamageByHit[j]||0);
      }
      return total;
    };
  for(const t of defs)for(let i=0;i<=4;i++){
    const c=compile(t,i),f=c.chargeFocus;reset();ready(c,3,[['PARRY',2],['DODGE',1]]);
    const p=pendingPrimaryChargeRelease();check(pendingPrimaryChargeTotal(p)===6&&bossCharge()===0,'Reserved/new bank lost');
    chainStacks=100;const a=release(),prep=Array.from({length:a.hits},(_,j)=>
      commandChargeContactPayload(a.command,a.chargeBonus,a.chargeSpent,a.hits,j)).reduce((n,v)=>n+v,0),
      relation=6*(f.bankRate+f.quick)+3*(f.old+f.new)+
        (t.key==='streak'?2*f.start+f.streak+f.dodge:0);
    check(a.chargeSpent===6&&bossCharge()===0&&near(prep,commandPreparationDamage(c)+commandReservedChargeBonus(c,6))&&
      near(a.preparedFocusDirect,relation)&&a.consumedMark===c.markDetonationCoreCapacity&&
      a.bowTimeline.contacts.length===c.hits&&chainStacks===100+c.hits,'One bank/payload/Apex failed',c.activeAttributeRouteId);
    check(near(a.auditDamage,expectedHP(a)),'Real HP copied bank, preparation or bonus Chain',{id:c.activeAttributeRouteId,
      actual:a.auditDamage,expected:expectedHP(a)});
    for(let d=1;d<=4;d++)moveTreeSynthesisRarityByDepth[d]='COMMON';
    const node=WEAPON_SKILL_PROTOTYPE_LAB_NODE_BY_SKILL_AND_ID.mark_burst[c.activeAttributeRouteId],
      preview=node&&moveTreeSynthesisPreviewCommand(node);
    check(preview&&near(commandExpectedPreparedFocusPower(preview),commandExpectedPreparedFocusPower(c)),
      'Lab preview mismatch',c.activeAttributeRouteId);
  }
  // Zero/one/high bank: a successful defense never loses more fallback than it earns.
  for(const t of [power,split])for(let i=0;i<=4;i++){
    let zero=0;
    for(const bank of [0,1,120]){
      reset();const c=compile(t,i);ready(c,bank);const a=release(),f=c.chargeFocus;
      check(a.chargeSpent===bank&&near(a.preparedFocusDirect,bank*(f.bankRate+f.old)+(bank?0:f.empty)),
        'Zero/high-bank or reserve Apex failed',{id:c.activeAttributeRouteId,bank});
      check(near(a.auditDamage,expectedHP(a)),'Fallback real HP mismatch',{id:c.activeAttributeRouteId,bank});
      if(!bank)zero=a.auditDamage;else check(a.auditDamage>=zero,'Earning Charge reduced damage',c.activeAttributeRouteId);
    }
  }
  reset();const newCard=compile(power,3);ready(newCard,0,Array.from({length:12},()=>['DODGE',1]));
  check(near(release().preparedFocusDirect,12*(newCard.chargeFocus.bankRate+newCard.chargeFocus.new)),
    'New-bank Apex read old bank or capped defense');
  // Series can restart after real damage; invulnerability is not a failed defense.
  for(let i=0;i<=4;i++){
    reset();const c=compile(streak,i),f=c.chargeFocus,p=prepare(c,10);
    recordDefenseChargeSuccess(2,'PARRY');recordDefenseChargeSuccess(1,'DODGE');
    const before=p.preparedFocus.bonus;
    player.invuln=1;damagePlayer('audit');check(p.preparedFocus.streak===2,'Invulnerable hit reset pure streak');
    player.invuln=0;damagePlayer('audit');
    check(p.preparedFocus.streak===0&&near(p.preparedFocus.bonus,before)&&p.reservedBank===10,
      'Damage erased earned bonus/bank or did not reset streak');
    recordDefenseChargeSuccess(1,'DODGE');recordDefenseChargeSuccess(2,'PARRY');
    const bonus=3*f.start+f.streak+f.dodge+2*(f.streak+f.parry);
    check(p.preparedFocus.streak===2&&near(p.preparedFocus.bonus,bonus),'Restarted streak/Apex wrong',i);
    beginPlayerTurn();phases++;check(near(release().preparedFocusDirect,bonus),'Streak paid twice/multiplied bank',i);
  }
  reset();const sc=compile(streak);const sp=prepare(sc,120);
  for(let i=0;i<120;i++)recordDefenseChargeSuccess(1,'DODGE');
  check(near(sp.preparedFocus.bonus,119*sc.chargeFocus.streak),'Streak coefficient grows with length');
  beginPlayerTurn();phases++;check(release().chargeSpent===240,'Uncapped old/new charge failed');
  // Frozen, single-use carry is consumed only on successful manual Primary Prepare.
  for(let i=0;i<=4;i++){
    reset();const c=compile(carry,i),f=c.chargeFocus;ready(c,4);const source=release(),ticket=boss.preparedFocusCarry;
    check(ticket&&Object.isFrozen(ticket)&&near(ticket.damage,4*f.carry)&&near(ticket.repeat,4*f.repeat)&&
      near(ticket.handoff,4*f.handoff),'Carry source/Apex wrong',i);
    attack(plain);check(boss.preparedFocusCarry===ticket,'Ordinary attack consumed carry');
    boss.ap=0;check(!performPlayerAction(other)&&boss.preparedFocusCarry===ticket,'Failed Prepare consumed carry');
    const target=i===4?foreign:c,p=ready(target);
    const expected=4*(f.carry+(i===4?f.handoff:f.repeat));
    check(!boss.preparedFocusCarry&&near(p.preparedFocus.carry,expected),'Carry not consumed once/rotation wrong',i);
    const a=release();check(near(a.preparedFocusDirect,expected)&&!boss.preparedFocusCarry,
      'Carried damage created another carry without spent Charge',i);
    check(source.preparedFocusDirect===4*f.quick,'Quick carry not separately paid',i);
  }
  // Cross-route same skill is neither same movement nor a foreign skill.
  for(const i of [3,4]){
    reset();const c=compile(carry,i);ready(c,4);release();const p=ready(other);
    check(near(p.preparedFocus.carry,4*c.chargeFocus.carry),'Wrong repeat/handoff condition');release();
  }
  // An incoming carry cannot inflate the next receipt, even when real bank is spent again.
  reset();const cc=compile(carry,1);ready(cc,4);release();const first=boss.preparedFocusCarry.damage;
  ready(cc,4);release();check(near(boss.preparedFocusCarry.damage,first),'Carry recursively multiplied itself');
  resetSkillLabTurn();check(!boss.preparedFocusCarry&&!pendingPrimaryChargeRelease(),'Reset leaked carry');
  // Secondary action between Ready and Release cannot steal the reserved bank.
  reset();const pc=compile(power);ready(pc,5,[['PARRY',2]]);
  const secondary=synthesizeMarkBurstDetonationPath('COMMON','burst_affliction_charge_spec','COMMON');
  attack(secondary);check(pendingPrimaryChargeTotal()===7,'Secondary stole reserved bank');
  check(release().chargeSpent===7,'Secondary changed Release spend');
  // The free automatic end-turn path is still functional.
  reset();ready(pc,3);check(endPlayerTurn()&&boss.turnAction?.primaryChargeRelease,'Auto Release failed');
  drain();check(!pendingPrimaryChargeRelease(),'Auto Release remained pending');
  return {passed:!failures.length,twists:4,apexes:16,cards,actions,phases,spread:spread(rows),apexSpreads,
    identity:{passed:identity.passed,distinctCores:identity.distinctCores,maximumSimilarity:identity.maximumSimilarity,neighborSimilarity},
    rows,failures};
})();
