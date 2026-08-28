/* Runs inside validate-runtime's existing VM with --critical-posture.
   One family only: current-rank ladders and deterministic real actions, no
   cross-product history matrix, browser, frames or randomized brute force. */
globalThis.__criticalPostureAudit=(()=>{
  const definitions=MARK_BURST_CRITICAL_POSTURE_TWIST_DEFINITIONS,
    spec='burst_critical_posture_spec',rows=[],apexRows=[],failures=[],
    require=(condition,message,detail=null)=>{
      if(!condition)failures.push({message,detail});
    },compile=(twist,rank='COMMON',apex=null)=>synthesizeMarkBurstDetonationPath(
      'COMMON',spec,'COMMON',twist.id,apex?'COMMON':rank,
      apex?twist.id+'_apex_'+apex:null,rank),
    snapshot=command=>({id:command.activeAttributeRouteId,hits:command.hits,
      direct:commandDirectDamageTotal(command),posture:command.posture,
      detonation:command.markRule.damagePerMark,capacity:command.markDetonationCoreCapacity,
      chance:command.critChance,precision:command.critPrecisionGain,
      multiplier:command.critDamageMultiplier,
      score:stableEvolutionCombinedGuardrailValue(command)}),
    compare=(child,parent)=>{
      const a=snapshot(child),b=snapshot(parent);
      for(const field of ['direct','posture','detonation','capacity','chance','precision','multiplier','hits','score'])
        require(a[field]+1e-5>=b[field],a.id+' regressed '+field,{child:a,parent:b});
      for(const field of ['critPostureVerdictBonus','critPostureNaturalBonus','critPostureNonCritBonus',
        'critPostureBreakRetention','critPostureVolleyMissRate','critPosturePrecisionCashoutRate',
        'critPostureFullCashoutBonus','critPostureFailureReserveRate','critPostureBreakArrowDamage',
        'critPosturePacketNonCritBonus'])require((child[field]||0)+1e-5>=(parent[field]||0),
          a.id+' regressed owned '+field,{child:child[field],parent:parent[field]});
    },spread=items=>{const scores=items.map(row=>row.score);return (
      Math.max(...scores)-Math.min(...scores))/Math.max(...scores);};
  require(definitions.length===4&&definitions.map(d=>d.apexes.length).join(',')==='4,4,4,3',
    'F4S3 needs deliberate 4/4/4/3 Apex counts');
  const parent=synthesizeMarkBurstDetonationPath('COMMON',spec,'COMMON');
  for(const twist of definitions){
    const route=MARK_BURST_ROUTE_BY_ID[twist.id],common=compile(twist);
    require(route.apexTarget===twist.apexes.length&&route.twistIdentity&&route.stableCausality,
      'Missing F4S3 authoring contracts');
    compare(common,parent);rows.push(snapshot(common));
    let previous=null;
    for(const rank of SKILL_RARITY_ORDER){
      const command=compile(twist,rank),packet=twist.pattern==='SIMULTANEOUS_PACKET';
      require(command.baseAttributeId==='DETONATION'&&command.primaryAttributeId==='CRITICAL'&&
        command.secondaryAttributeId==='POSTURE'&&command.markGain===0&&
        command.markRule.cap===command.markDetonationCoreCapacity&&
        !command.breakPowerBonus&&!command.extraChainBonus&&
        totalCommandChainGain(command)===(packet?1:command.hits)&&
        command.critRollMode===(packet?'SHARED_ACTION':'PER_CONTACT'),
        'F4S3 motor/packet ownership drifted',snapshot(command));
      require(command.animationRecipeId===twist.recipe,'Wrong F4S3 animation');
      if(previous)compare(command,previous);previous=command;
      const pure=synthesizeMarkBurstDetonationPath('COMMON','burst_posture_focus_spec',
        'COMMON','burst_posture_focus_crusher_twist',rank);
      require(command.posture<=pure.posture,'Mixed F4S3 stole reliable pure Posture leadership');
    }
    for(let index=1;index<=twist.apexes.length;index++){
      previous=null;
      for(const rank of SKILL_RARITY_ORDER){
        const child=compile(twist,rank,index),apex=MARK_BURST_ROUTE_BY_ID[child.activeAttributeRouteId];
        require(apex.apexDesign.version===2&&child.markDetonationEventMode===common.markDetonationEventMode&&
          child.animationRecipeId===common.animationRecipeId,'Apex changed its parent identity');
        compare(child,common);if(previous)compare(child,previous);previous=child;
        if(rank==='COMMON')apexRows.push(snapshot(child));
        const pure=synthesizeMarkBurstDetonationPath('COMMON','burst_posture_focus_spec','COMMON',
          'burst_posture_focus_crusher_twist','COMMON','burst_posture_focus_crusher_twist_apex_1',rank);
        require(child.posture<=pure.posture,'Apex stole pure Posture leadership');
      }
    }
  }
  for(const rank of SKILL_RARITY_ORDER){
    const volley=compile(definitions[1],rank),long=compile(definitions[1],rank,1),
      chain=synthesizeMarkBurstDetonationPath('COMMON','burst_critical_chain_spec','COMMON',
        'burst_critical_chain_flow_twist',rank),chainApex=synthesizeMarkBurstDetonationPath(
        'COMMON','burst_critical_chain_spec','COMMON','burst_critical_chain_flow_twist',
        'COMMON','burst_critical_chain_flow_twist_apex_1',rank);
    require(volley.hits<chain.hits&&long.hits<chainApex.hits,
      'Posture volley must remain below Chain density',
      {rank,volley:volley.hits,long:long.hits,chain:chain.hits,chainApex:chainApex.hits});
  }
  require(spread(rows)<=.25,'F4S3 Twist sibling spread exceeds 25%',rows);
  for(const twist of definitions){
    const siblings=apexRows.filter(row=>row.id.startsWith(twist.id));
    require(spread(siblings)<=.25,'F4S3 Apex sibling spread exceeds 25%',siblings);
  }
  /* Deterministic real combat. Every authored Common route resolves once;
     selected state edges then test the actual event branches. */
  openSkillLab();let actions=0;
  const start=(command,{precision=0,roll=0,posture=0,max=100000,mark=8,broken=false}={})=>{
    startSkillLabCombat();applySkillLabPreset('clean',false);
    boss.hp=boss.maxhp=1000000;boss.postureMax=max;boss.posture=posture;boss.mark=mark;
    boss.ap=boss.resolve=100;boss.playerTurnBreak=broken;
    skillLabSession.forceCritical=false;
    const key=commandCritKey(command,'knight');skillCritPrecision.set(key,precision);
    require(performPlayerAction(command),'Authored F4S3 action did not start');
    const action=boss.turnAction;
    action.critPlan=createCommandCritPlan(command,'knight',()=>roll,null,0,0,0,mark,broken);
    actions++;return action;
  },finish=action=>{
    while(action.hitIndex<action.hits)resolveTurnActionHit(action);
    if(action.criticalAftershotTimeline)
      while(action.criticalAftershotIndex<action.criticalAftershotTimeline.count)
        resolveTurnActionCriticalAftershot(action);
    return action;
  };
  for(const twist of definitions)for(let index=0;index<=twist.apexes.length;index++){
    const command=compile(twist,'COMMON',index||null),action=start(command,{precision:.4});
    finish(action);
    require(boss.hp<boss.maxhp&&chainStacks===totalCommandChainGain(command)&&
      action.consumedMark===commandMarkPlan(command,8).consumedTotal,
      'Real action lost contact, Chain or Detonation truth',snapshot(command));
  }
  const verdict=compile(definitions[0]),clean=compile(definitions[0],'COMMON',2),
    seal=compile(definitions[0],'COMMON',3),steady=compile(definitions[0],'COMMON',4),
    missVolley=compile(definitions[1],'COMMON',4),cashout=compile(definitions[2]),
    full=compile(definitions[2],'COMMON',2),reserve=compile(definitions[2],'COMMON',3),
    arrow=compile(definitions[2],'COMMON',4),packet=compile(definitions[3]),
    priority=compile(definitions[3],'COMMON',2),stubborn=compile(definitions[3],'COMMON',3);
  const crit={critical:true,roll:0,naturalChance:.3,chance:.7,precisionBefore:.4},
    miss={...crit,critical:false,roll:.9};
  require(criticalPostureBonus(clean,crit)>criticalPostureBonus(clean,{...crit,roll:.5}),
    'Natural Crit reward also triggered on Precision-assisted Crit');
  require(criticalPostureBonus(steady,miss)>0&&criticalPostureBonus(stubborn,miss)>0,
    'Non-Crit guarantees are inert');
  require(criticalPostureBonus(missVolley,miss,2,true)===
    stableCombatNumber(2*missVolley.critPostureVolleyMissRate)&&
    criticalPostureBonus(missVolley,miss,2,false)===0,'Miss bonus must apply only to final');
  require(criticalPostureCashout(full,{...crit,chance:1})>
    criticalPostureCashout(full,crit)&&criticalPostureCashout(cashout,miss)===0,
    'Cashout/guaranteed-Precision focus trigger drifted');
  for(const roll of [0,1]){
    const current=start(verdict,{precision:.4,roll}),contact=current.critPlan.contacts[0],
      expected=stableCombatNumber(verdict.posture)*(contact.critical?contact.multiplier:1)+
        criticalPostureBonus(verdict,contact);
    finish(current);require(Math.abs(boss.posture-expected)<1e-4,
      'Verdict did not apply the same Crit exactly once to native Posture',
      {roll,actual:boss.posture,expected});
  }
  const volleyCommand={...missVolley,critChance:.1,critPrecisionGain:.15};
  let action=start(volleyCommand,{roll:.99}),expectedPosture=0,misses=0;
  for(let index=0;index<action.hits;index++){
    const contact=action.critPlan.contacts[index],share=volleyCommand.postureContactPattern[index];
    expectedPosture+=volleyCommand.posture*share*(contact.critical?contact.multiplier:1)+
      criticalPostureBonus(volleyCommand,contact,misses,index===action.hits-1,share);
    if(!contact.critical)misses++;
  }
  finish(action);require(Math.abs(boss.posture-expectedPosture)<1e-4,
    'Salvo duplicated Posture or counted its final miss retroactively');
  action=start(seal,{precision:.6,posture:99.99,max:100});finish(action);
  require(action.causedBreak&&skillCritPrecision.get(action.critPlan.key)>0&&
    skillCritPrecision.get(action.critPlan.key)<=.6,'Break Seal must preserve, not create Precision');
  action=start(seal,{precision:0,posture:99.99,max:100});finish(action);
  require(skillCritPrecision.get(action.critPlan.key)===0,'Break Seal manufactured Precision');
  action=start(reserve,{precision:.4});finish(action);
  const stored=boss.posturePrimer;
  require(stored>0&&!action.causedBreak,'Failed cashout did not install finite reserve');
  boss.phase='player';boss.turnAction=null;boss.ap=boss.resolve=100;
  skillCritPrecision.set(commandCritKey(reserve,'knight'),.4);
  require(performPlayerAction(reserve),'Reserve follow-up failed');actions++;
  action=boss.turnAction;action.critPlan=createCommandCritPlan(reserve,'knight',()=>0);finish(action);
  require(Math.abs(boss.posturePrimer-stored)<1e-5,'Cashout reserve stacked or read its own output');
  const bonus=criticalPostureCashout(arrow,crit);
  action=start(arrow,{precision:.4,posture:100-arrow.posture-bonus/2,max:100});
  while(action.hitIndex<action.hits)resolveTurnActionHit(action);
  require(action.critPostureCashoutOpenedBreak&&chainStacks===1,'Cashout did not open its own Break');
  const precisionAfter=skillCritPrecision.get(action.critPlan.key),markAfter=boss.mark;
  action.t=action.criticalAftershotTimeline.times[0]-.1;drawTurnActionProjectile();
  resolveTurnActionCriticalAftershot(action);
  require(chainStacks===2&&boss.mark===markAfter&&skillCritPrecision.get(action.critPlan.key)===
    precisionAfter,'Reward arrow changed Crit, Precision or Detonation');
  resolveTurnActionCriticalAftershot(action);require(chainStacks===2,'Reward arrow recursed');
  for(const options of [{precision:.4,posture:99.99,max:100},{precision:0},
      {precision:.4,roll:1},{precision:.4,broken:true}]){
    action=start(arrow,options);finish(action);
    require(!action.critPostureCashoutOpenedBreak&&chainStacks===1,
      'Reward arrow triggered without cashout-caused Break');
  }
  const packetDamage=before=>{
    const command={...priority,critPostureResolveBeforeDamage:before},
      current=start(command,{precision:.4,posture:99.99,max:100});finish(current);
    require(chainStacks===1,'Shotgun produced per-pellet Chain');
    return boss.maxhp-boss.hp;
  };
  require(packetDamage(true)>packetDamage(false),'Priority packet failed to use its own Break');
  action=start(packet,{roll:1});let writes=0;
  const originalSet=skillCritPrecision.set;
  try{
    skillCritPrecision.set=function(...args){writes++;return originalSet.apply(this,args);};
    finish(action);
  }finally{delete skillCritPrecision.set;}
  require(writes===1,'Shared packet updated Precision more than once');
  leaveSkillLabCombat();skillCritPrecision.clear();
  if(failures.length)throw new Error('F4S3 targeted failures: '+JSON.stringify(failures));
  return {passed:true,twists:4,apexes:15,rankedCards:76,actions,
    twistSpread:Number(spread(rows).toFixed(4)),rows,apexRows};
})();
