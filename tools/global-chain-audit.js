/* Linear catalogue scan + selected current-rank/high-lineage sentinels.
   No ancestor Cartesian product; conditional combat is deterministic. */
globalThis.__globalChainAudit=(()=>{
  const failures=[],examples=[],samples=new Map(),combat=new Map(),counts={sharpshoot:0,mark_burst:0},
    check=(ok,message,detail)=>{if(!ok)failures.push({message,detail});},
    near=(a,b)=>Math.abs(a-b)<.004,
    role=r=>r.primaryAttributeId==='CHAIN'?'PRIMARY':r.secondaryAttributeId==='CHAIN'?'SECONDARY':'SUPPORT',
    compile=(r,rank='COMMON',all=false)=>{
      for(let d=1;d<=4;d++)moveTreeSynthesisRarityByDepth[d]=all||d===r.depth?rank:'COMMON';
      const node=WEAPON_SKILL_PROTOTYPE_LAB_NODE_BY_SKILL_AND_ID[r.skillId][r.id],
        c=moveTreeSynthesisPreviewCommand(node);
      if(c)applyWeaponSkillRouteIdentity(c,r);return c;
    },q=c=>c.synthesisQualityReceipts.reduce((sum,r)=>sum+r.quality,0),
    inspect=(r,c)=>{
      const kind=role(r),quality=q(c),detail={skill:r.skillId,id:r.id,kind,q:quality,hits:c.hits};
      check(Number.isFinite(commandDirectDamageTotal(c))&&commandDirectDamageTotal(c)>0,
        'Invalid direct packet',detail);
      check(Array.from({length:c.hits},(_,i)=>commandHitBase(c,i)).every(n=>n>0),
        'Empty mechanical contact',detail);
      if(kind!=='SUPPORT'){
        check(c.hits>=2&&c.deliveryPattern!=='SINGLE','Chain motor is still a single arrow',detail);
        check(!c.consumeChain&&Array.from({length:c.hits},(_,i)=>commandChainGain(c,i)).every(n=>n>=1),
          'Chain contact is silent or consumes Chain',detail);
        if(kind==='SECONDARY')check(c.extraChainBonus===0,'Secondary kept generic Chain damage stat',detail);
      }else if(c.hits>1){
        // Fixed three-pellet silhouette may tie the initial Chain salvo.
        const limit=Math.max(skillSupportArrowMagnitude(quality,true),
          skillSupportArrowMagnitude(quality,false,true));
        check(c.hits<=limit,'Supporting arrows inherited Chain density',{...detail,limit});
      }
      const timeline=buildBowActionTimeline(c,commandDeliveryContract(c),0,600,8);
      check(timeline.contacts.length===c.hits,'Bow timeline differs from real contacts',detail);
    };
  let cards=0,actions=0;
  openSkillLab();
  for(const r of [...SHARPSHOOT_MARK_ROUTE_CONTRACTS,...MARK_BURST_ROUTE_CONTRACTS]){
    if(r.runtimeReadiness!=='MATERIALIZED')continue;
    const c=compile(r);
    if(role(r)==='SUPPORT'&&c.hits<=1)continue;
    cards++;counts[r.skillId]++;inspect(r,c);
    const key=[r.skillId,r.formSlot,role(r),c.deliveryPattern].join('|');
    if(!samples.has(key)||r.depth===3&&samples.get(key).depth<3)samples.set(key,r);
    if(role(r)!=='SUPPORT'&&(r.depth===2||r.depth===3&&
      (c.deliveryPattern==='SIMULTANEOUS_PACKET'||c.deliveryPattern==='IMPACT_ECHO')))
      combat.set([r.skillId,r.formSlot,role(r),c.deliveryPattern].join('|'),r);
  }
  for(const r of samples.values()){
    const c=compile(r,'LEGENDARY',true);cards++;inspect(r,c);
  }
  const apexIds=['mark_chain_echo_generation_apex','mark_chain_shotgun_chain_apex'];
  for(const id of apexIds){
    const r=SHARPSHOOT_MARK_ROUTE_BY_ID[id],parent=SHARPSHOOT_MARK_ROUTE_BY_ID[r.parentId];
    let previous=null;
    for(const rank of SKILL_RARITY_ORDER){
      const c=compile(r,rank),p=compile(parent);cards++;inspect(r,c);
      check(commandDirectDamageTotal(c)>commandDirectDamageTotal(p)&&c.markGain>=p.markGain&&
        c.hits>=p.hits,'Approved Apex lost parent output',id);
      if(previous)check(commandDirectDamageTotal(c)+.004>=commandDirectDamageTotal(previous)&&
        c.markGain>=previous.markGain&&c.hits>=previous.hits,'Apex rank regressed',id);
      if(id===apexIds[0])check(commandHitBase(c,c.hits-1)>commandHitBase(c,0),
        'Final-echo Apex did not strengthen final contact',id);
      check(totalCommandChainGain(c)===c.hits,'Impact Apex grants bonus Chain',id);
      previous=c;
      if(rank==='COMMON')examples.push({id,hits:c.hits,direct:commandDirectDamageTotal(c),
        parentDirect:commandDirectDamageTotal(p),final:commandHitBase(c,c.hits-1)});
    }
    combat.set(id,r);
  }
  // The four Mark/Chain families changed together. Check each current Apex rank,
  // including density/Weight siblings, without multiplying ancestor rarities.
  const markChainApexes=SHARPSHOOT_MARK_ROUTE_CONTRACTS.filter(r=>r.depth===4&&
    r.formSlot===1&&r.secondaryAttributeId==='CHAIN'),apexBalance=[];
  for(const r of markChainApexes){
    let previous=null;
    for(const rank of SKILL_RARITY_ORDER){
      const c=compile(r,rank),p=compile(SHARPSHOOT_MARK_ROUTE_BY_ID[r.parentId]);cards++;inspect(r,c);
      check(commandDirectDamageTotal(c)+.004>=commandDirectDamageTotal(p)&&c.markGain>=p.markGain&&
        c.hits>=p.hits,'Mark/Chain Apex lost parent output',{id:r.id,rank});
      if(previous)check(commandDirectDamageTotal(c)+.004>=commandDirectDamageTotal(previous)&&
        c.markGain>=previous.markGain&&c.hits>=previous.hits,'Mark/Chain Apex rank regressed',{id:r.id,rank});
      if(c.packetWavePattern){
        check(c.chainReadOffsetPattern.every((n,i)=>n===c.packetWavePattern.reduce((sum,w,j)=>
          sum+(w<c.packetWavePattern[i]?commandChainGain(c,j):0),0)),
          'Packet wave lost real Chain snapshot',{id:r.id,rank});
      }
      if(r.mechanics.weightChannel)check(c.deliveryWeight>=p.deliveryWeight&&c.deliveryWeight>=2,
        'Weighted Chain series lost its heavy payoff',{id:r.id,rank});
      if(r.mechanics.weightChannel)check(commandHitExtraChainBonus(c,0)>0,
        'Weight is only metadata, not a real combat payoff',{id:r.id,rank});
      apexBalance.push({id:r.id,parent:r.parentId,rank,
        play:stableEvolutionPlaythroughVector(c).averageContribution});
      previous=c;
    }
  }
  const balance=[];
  for(const rank of SKILL_RARITY_ORDER)for(const parent of new Set(markChainApexes.map(r=>r.parentId))){
    const rows=apexBalance.filter(r=>r.rank===rank&&r.parent===parent),values=rows.map(r=>r.play),
      mean=values.reduce((a,b)=>a+b,0)/values.length,spread=(Math.max(...values)-Math.min(...values))/mean;
    balance.push({parent,rank,spread:Number(spread.toFixed(4))});
    check(spread<=.25,'Mark/Chain Apex siblings exceed existing 25% guardrail',{parent,rank,spread,rows});
  }
  // Current-rank native output for each Chain role, not all lineage permutations.
  for(const r of [...SHARPSHOOT_MARK_ROUTE_CONTRACTS,...MARK_BURST_ROUTE_CONTRACTS].filter(
    r=>r.runtimeReadiness==='MATERIALIZED'&&r.depth===2&&role(r)!=='SUPPORT')){
    let previous=null;
    for(const rank of SKILL_RARITY_ORDER){
      const c=compile(r,rank);cards++;inspect(r,c);
      if(previous)check(c.hits>=previous.hits&&commandDirectDamageTotal(c)+.004>=
        commandDirectDamageTotal(previous),'Chain specialization rank regressed',r.id);
      previous=c;
    }
  }
  for(const r of combat.values()){
    const c=compile(r);
    startSkillLabCombat();applySkillLabPreset('clean',false);
    boss.maxhp=boss.hp=1e9;boss.posture=0;boss.postureMax=1e6;boss.mark=0;
    boss.ap=boss.resolve=100;boss.charge=4;boss.chargeEnabled=true;
    skillLabSession.forceCritical=false;
    const old=Math.random;try{Math.random=()=>.999999;
      check(performPlayerAction(c),'Action did not start',r.id);
      if(commandChargeMode(c)==='DELAYED_PRIMARY'){
        const pending=pendingPrimaryChargeRelease();
        check(!!pending,'Primary Charge failed to arm',r.id);
        if(!pending)continue;
        pending.status='READY';pending.charge=4;pending.dodges=1;pending.parries=1;
        pending.maxStreak=2;pending.actionSteps=1;
        boss.phase='player';boss.state='idle';boss.ap=boss.resolve=100;
        check(releasePrimaryCharge(),'Release did not start',r.id);
      }
      const a=boss.turnAction;actions++;
      while(a.hitIndex<a.hits)resolveTurnActionHit(a);
      check(a.hits>=2&&chainStacks>=a.hits,'Zero-setup attack failed to generate Chain',r.id);
      check(a.bowTimeline&&a.bowTimeline.contacts.length===a.hits,'Runtime Bow lost contacts',r.id);
      check(boss.hp<boss.maxhp,'No real damage',r.id);
      if(r.skillId==='sharpshoot')check(bossMark()>=c.markGain,'Base Mark output lost',r.id);
      else check(c.markGain===0&&bossMark()===0,'Mark Burst generated Mark',r.id);
      if(c.afflictionSplitPerContact)check(boss.bleed+.004>=commandBleedAmount(c),
        'Multi-arrow packet lost Bleed',r.id);
      if(apexIds.includes(r.id))check(near(commandDirectDamageTotal(a.command),
        commandDirectDamageTotal(c)),'Apex duplicated/lost direct packet',r.id);
    }finally{Math.random=old;}
  }
  for(const quality of [10,15,67,160,640,2560]){
    const secondary=Math.max(2,skillDeliveryMagnitude(quality)),primary=skillPrimaryChainDeliveryMagnitude(quality);
    check(skillSupportArrowMagnitude(quality,true)<secondary&&secondary<primary,
      'Global growth hierarchy broken',quality);
  }
  return {passed:!failures.length,catalogue:counts,cards,highLineageSamples:samples.size,actions,
    examples,balance,failures};
})();
