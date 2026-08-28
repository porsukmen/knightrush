/* F4S6 scoped cards + deterministic combat. No ancestor Cartesian matrix. */
globalThis.__criticalChargeAudit=(()=>{
  const defs=MARK_BURST_CRITICAL_CHARGE_TWIST_DEFINITIONS,failures=[],rows=[],apexRows=[],arrowRows=[];
  const check=(ok,message,detail)=>{if(!ok)failures.push({message,detail});},
    near=(a,b)=>Math.abs(a-b)<.0031,
    compile=(t,rank='COMMON',a=0)=>synthesizeMarkBurstDetonationPath('COMMON',
      'burst_critical_charge_spec','COMMON',t.id,a?'COMMON':rank,a?t.id+'_apex_'+a:null,rank),
    snap=c=>({id:c.activeAttributeRouteId,direct:commandDirectDamageTotal(c),hits:c.hits,
      chance:c.critChance,precision:c.critPrecisionGain,multiplier:c.critDamageMultiplier,
      temper:commandDefenseTemperRate(c),capacity:c.markDetonationCoreCapacity,
      detonation:c.markRule.damagePerMark,score:stableEvolutionCombinedGuardrailValue(c)}),
    compare=(c,p)=>{const a=snap(c),b=snap(p);
      for(const key of ['direct','hits','chance','precision','multiplier','temper','capacity','detonation','score'])
        check(a[key]+1e-5>=b[key],a.id+' regressed '+key,{child:a,parent:b});
    },spread=rs=>{const values=rs.map(r=>r.score);return (Math.max(...values)-Math.min(...values))/Math.max(...values);};
  let cards=0,actions=0;
  const parent=synthesizeMarkBurstDetonationPath('COMMON','burst_critical_charge_spec','COMMON');
  check(defs.length===4&&defs.every(t=>t.apexes.length===4),'Expected 4 Twists / 16 Apex');
  for(const t of defs){
    const common=compile(t);compare(common,parent);rows.push(snap(common));
    check(t.apexes.some(a=>APEX_MEANINGFUL_DECISION_CLASSES.has(a.decisionClass)),
      'No plan-changing Apex',t.id);
    for(let a=0;a<=4;a++){
      let previous=null;
      for(const rank of SKILL_RARITY_ORDER){
        const c=compile(t,rank,a);cards++;
        if(a)compare(c,common);if(previous)compare(c,previous);previous=c;
        check(c.critCharge&&!c.critDamageStatUnlocked&&!c.synthesisCritAuthoredPower&&
          c.markGain===0&&!c.posture&&!c.breakPowerBonus&&!c.extraChainBonus&&
          c.animationRecipeId===t.recipe&&c.critChance<=1&&c.critPrecisionGain<=1,
          'Critical/Charge identity drift',snap(c));
        check(c.markRule.cap===c.markDetonationCoreCapacity&&c.markDetonationHitIndex===c.hits-1,
          'Final Base Detonation lost',snap(c));
        const route=MARK_BURST_ROUTE_BY_ID[c.activeAttributeRouteId];
        check(!route.qualityProfile.CRIT_POWER&&Math.abs(Object.values(route.qualityProfile)
          .reduce((s,n)=>s+n,0)-1)<1e-6,'Unpaid profile/stat',route.id);
        if(a)check(route.apexDesign.version===2&&route.apexDesign.runtimeEvidence.length>=3,
          'Missing Apex evidence',route.id);
        if(a&&rank==='COMMON')apexRows.push(snap(c));
        if(t.key==='search'){
          check(c.hits>=2,'Search cannot buy its second arrow',snap(c));
          const chain=synthesizeMarkBurstDetonationPath('COMMON','burst_critical_chain_spec','COMMON',
            'burst_critical_chain_flow_twist',a?'COMMON':rank,
            a?'burst_critical_chain_flow_twist_apex_1':null,rank);
          check(c.hits<chain.hits,'Search exceeds Chain density',{search:snap(c),chain:snap(chain)});
          const primary=synthesizeMarkBurstDetonationPath('COMMON','burst_chain_critical_spec','COMMON',
            'burst_chain_critical_ascent_twist',a?'COMMON':rank,
            a?'burst_chain_critical_ascent_twist_apex_1':null,rank);
          check(c.hits<primary.hits,'Search exceeds Primary Chain density',snap(c));
          if(!a||a===1)arrowRows.push({rank,apex:!!a,search:c.hits,
            secondaryChain:chain.hits,primaryChain:primary.hits});
        }
      }
    }
    const high=SKILL_RARITY_ORDER[SKILL_RARITY_ORDER.length-1];cards++;
    compare(synthesizeMarkBurstDetonationPath(high,'burst_critical_charge_spec',high,t.id,'COMMON'),
      synthesizeMarkBurstDetonationPath(high,'burst_critical_charge_spec',high));
  }
  check(spread(rows)<=.25,'Twist spread exceeds 25%',rows);
  for(const t of defs)check(spread(apexRows.filter(r=>r.id.startsWith(t.id)))<=.25,
    'Apex spread exceeds 25%',t.id);
  // Sparse curve sentinels: compare equal Quality, not a lucky early-Crit run.
  // A shared three-pellet packet can equal Chain's initial silhouette; its
  // growth and RNG/Chain count must not inherit Chain's scaling.
  for(const q of [10,15,28,41,65,160,640]){
    const secondary=skillDeliveryMagnitude(q),primary=skillPrimaryChainDeliveryMagnitude(q),
      regular=skillSupportArrowMagnitude(q),long=skillSupportArrowMagnitude(q,true),
      packet=skillSupportArrowMagnitude(q,false,true);
    check(regular<secondary&&long<secondary&&long<primary,
      'Supporting arrow growth reaches Chain curves',{q,regular,long,secondary,primary});
    check(packet<primary&&(q<16?packet<=secondary:packet<secondary),
      'Packet growth reaches Chain curves',{q,packet,secondary,primary});
  }
  const maxRank=SKILL_RARITY_ORDER.at(-1),longHigh=synthesizeMarkBurstDetonationPath(maxRank,
    'burst_critical_charge_spec',maxRank,defs[1].id,maxRank,defs[1].id+'_apex_1',maxRank),
    chainHigh=synthesizeMarkBurstDetonationPath(maxRank,'burst_critical_chain_spec',maxRank,
      'burst_critical_chain_flow_twist',maxRank,'burst_critical_chain_flow_twist_apex_1',maxRank),
    primaryHigh=synthesizeMarkBurstDetonationPath(maxRank,'burst_chain_critical_spec',maxRank,
      'burst_chain_critical_ascent_twist',maxRank,'burst_chain_critical_ascent_twist_apex_1',maxRank);
  check(longHigh.hits<chainHigh.hits&&longHigh.hits<primaryHigh.hits,
    'High-Quality Long Search crosses Chain',{search:longHigh.hits,secondary:chainHigh.hits,primary:primaryHigh.hits});
  cards+=3;
  openSkillLab();
  const fire=(c,roll=0)=>{
    const old=Math.random;try{Math.random=()=>roll;check(performPlayerAction(c),'Action did not start',c.activeAttributeRouteId);}
    finally{Math.random=old;}
    actions++;const action=boss.turnAction;
    while(action.hitIndex<action.hits)resolveTurnActionHit(action);return action;
  },start=(c,{charge=2,roll=0,precision=0,ap=100}={})=>{
    startSkillLabCombat();applySkillLabPreset('clean',false);
    boss.maxhp=boss.hp=1e9;boss.posture=0;boss.postureMax=1e6;boss.mark=8;
    boss.ap=ap;boss.resolve=100;boss.chargeEnabled=true;boss.charge=charge;skillLabSession.forceCritical=false;
    const key=commandCritKey(c,'knight');if(key)skillCritPrecision.set(key,precision);
    return fire(c,roll);
  },again=(c,roll=0)=>{boss.phase='player';boss.turnAction=null;boss.ap=boss.resolve=100;return fire(c,roll);};
  for(const t of defs)for(let a=0;a<=4;a++){
    const c=compile(t,'COMMON',a),action=start(c);
    check(action.chargeSpent===2&&boss.hp<boss.maxhp&&chainStacks===action.hits&&
      near(commandDirectDamageTotal(action.command),commandDirectDamageTotal(c))&&
      action.consumedMark===commandMarkPlan(c,8).consumedTotal,'Real action lost/duplicated payload',snap(c));
    check(action.bowTimeline&&action.bowTimeline.recipe.id===t.recipe,'Wrong Bow recipe',t.id);
    action.t=.1;drawBowMechanicCue(action,action.bowTimeline,{from:{x:100,y:200},to:{x:300,y:200}});
    drawDefenseChargeStatus(boss);
  }
  for(const t of defs){
    const c=compile(t),action=start(c,{charge:0});
    check(action.chargeSpent===0&&bossCharge()===0&&action.hits===1&&
      near(commandDirectDamageTotal(action.command),commandDirectDamageTotal(c))&&
      !boss.pendingCriticalChargeDynamo,'Zero Charge lost base action or generated resources',t.id);
  }
  const search=compile(defs[1]);let action=start(search);
  check(action.hits===1&&action.critPlan.contacts.length===1&&chainStacks===1,
    'First Crit did not stop search/RNG');
  const conserved=a=>{
    check(near(Array.from({length:a.hits},(_,i)=>commandChargeContactPayload(a.command,
      a.chargeBonus,a.chargeSpent,a.hits,i)).reduce((s,n)=>s+n,0),a.chargeBonus),
      'Early stop lost/duplicated Charge packet');
    check(near(commandDirectDamageTotal(a.command),commandDirectDamageTotal(search))&&
      a.command.markDetonationHitIndex===a.hits-1,'Early stop lost direct or Detonation');
  };conserved(action);
  action=start(search,{roll:.99});conserved(action);
  check(action.hits===2&&!action.critPlan.contacts[0].critical&&action.critPlan.contacts[1].critical,
    'Search did not use live miss Precision');
  const cold={...search,critChance:.1,critPrecisionGain:0};action=start(cold,{roll:.99});conserved(action);
  check(action.hits===search.hits&&!action.anyCritical,'No-Crit search truncated early');
  const refund=compile(defs[1],'COMMON',3);action=start(refund);
  check(bossCharge()>0&&bossCharge()<=action.chargeSpent,'Paid refund inert or creates Charge');
  start(refund,{charge:0});check(bossCharge()===0,'Refund generated free Charge');
  const rescue=compile(defs[1],'COMMON',4);action=start(rescue,{roll:.99});
  check(action.hits===2&&criticalChargeContactBonus(action,action.critPlan.contacts[1],1)>
    action.chargeSpent*rescue.critCharge.search,'Last Resort killed by guaranteed final Crit');
  const verdict=compile(defs[0],'COMMON',2),crit={critical:true,roll:0,naturalChance:.3},
    fake={command:verdict,chargeSpent:2,hits:1};
  check(criticalChargeContactBonus(fake,crit,0)>criticalChargeContactBonus(fake,{...crit,roll:.5},0),
    'Natural bonus paid assisted Crit');
  const fallback=compile(defs[0],'COMMON',4);action=start(fallback,{roll:.99});
  check(!action.anyCritical&&criticalChargeContactBonus(action,action.critPlan.contacts[0],0)>0&&
    fallback.critCharge.noncrit<fallback.critCharge.verdict,'Non-Crit fallback missing or too large');
  const rotation=compile(defs[0],'COMMON',3);start(rotation);again(fightCommand('knight'));
  boss.charge=2;action=again(rotation);check(action.command.critChargeContext.alternate,'Rotation not recognized');
  const focus=compile(defs[2]),overflow=compile(defs[2],'COMMON',2);
  for(const charge of [0,2,20,2000]){
    const p=criticalChargeFocusPurchase(focus,charge),f=focus.critCharge;
    check(p.chance>=0&&p.chance+focus.critChance<=1+1e-8&&
      near(p.chance*p.value+p.overflow,charge*f.focus),'Focus double-spent its budget',{charge,p});
  }
  const guaranteed={...overflow,critChance:1};
  const a=criticalChargeFocusPurchase(guaranteed,2),b=criticalChargeFocusPurchase(guaranteed,20);
  check(a.chance===0&&a.overflow>0&&near(b.overflow,10*a.overflow),'Overflow is quadratic or lost');
  action=start(focus,{charge:2000});check(action.critPlan.contacts[0].chance<=1&&Number.isFinite(boss.hp),
    'Large Charge focus broke runtime');
  const last=compile(defs[2],'COMMON',4);action=start(last,{ap:1});
  check(action.command.critChargeContext.lastAp&&boss.ap===0,'Last AP not captured before payment');
  action=start(last,{ap:2});check(!action.command.critChargeContext.lastAp,'Last AP active too early');
  const patient={...compile(defs[2],'COMMON',3),critChance:.01,critPrecisionGain:1};
  action=start(patient,{roll:.999});const key=action.critPlan.key;
  check(!action.anyCritical&&skillCritPrecision.get(key)===1&&boss.criticalChargePrecisionEcho[key]>0,
    'Saturated extra Precision vanished');
  const echo=boss.criticalChargePrecisionEcho[key];boss.charge=0;action=again(parent);
  check(action.criticalChargeEchoCashed&&!boss.criticalChargePrecisionEcho[key]&&echo>0,
    'Precision overflow did not cash once in same skill');
  action=again(parent);check(!action.criticalChargeEchoCashed,'Precision echo repeated');
  const dynamo=compile(defs[3]),parry=compile(defs[3],'COMMON',2),dodge=compile(defs[3],'COMMON',3);
  start(dynamo);const pending=boss.pendingCriticalChargeDynamo;
  boss.charge=200;again(dynamo);check(near(boss.pendingCriticalChargeDynamo.gain,pending.gain),
    'Dynamo stacked or scaled from spent Charge');
  boss.phase='dodge';startDefenseChargePhase();recordDefenseChargeSuccess(1,'DODGE');
  const once=boss.defenseChargeProgress;
  check(!boss.pendingCriticalChargeDynamo&&once>1,'Dynamo did not trigger first real defense');
  recordDefenseChargeSuccess(2,'PARRY');check(boss.defenseChargeProgress===once+2,'Dynamo triggered twice');
  const reward=(c,kind)=>{start(c);boss.phase='dodge';startDefenseChargePhase();
    recordDefenseChargeSuccess(kind==='PARRY'?2:1,kind);return boss.defenseChargeProgress-(kind==='PARRY'?2:1);};
  check(reward(parry,'PARRY')>reward(parry,'DODGE'),'Parry Apex has no defense choice');
  check(reward(dodge,'DODGE')>reward(dodge,'PARRY'),'Dodge Apex has no defense choice');
  start(dynamo,{roll:.99});check(!boss.pendingCriticalChargeDynamo,'Non-Crit armed Dynamo');
  start(dynamo);boss.phase='dodge';startDefenseChargePhase();finalizeDefenseChargePhase(false);
  check(!boss.pendingCriticalChargeDynamo,'Unused Dynamo survived defense phase');
  start(dynamo);applySkillLabPreset('clean',false);
  check(!boss.pendingCriticalChargeDynamo&&!boss.criticalChargePrecisionEcho,'Preset retained state');
  start(dynamo);startSkillLabCombat();check(!boss.pendingCriticalChargeDynamo,'Encounter retained state');
  return {passed:failures.length===0,cards,actions,twists:4,apexes:16,twistSpread:spread(rows),rows,arrowRows,failures};
})();
