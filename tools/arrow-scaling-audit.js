/* Completed Mark Burst only. Two lineage sentinels per multi-arrow card, four
   current ranks for changed engines, sparse uncapped curves. No Cartesian sweep. */
globalThis.__arrowScalingAudit=(()=>{
  const failures=[],examples=[],initialContactTies=[],families=new Set(),changed=new Set([
      'DETONATION_PACKET','DETONATION_CRIT_PACKET','DETONATION_BLEED_PACKET',
      'PURE_POSTURE_SEQUENCE','POSTURE_CRIT_LADDER']),representatives=new Map(),
    check=(ok,message,detail)=>{if(!ok)failures.push({message,detail});},
    near=(a,b)=>Math.abs(a-b)<.0031,
    lineage=route=>{const path=[];while(route){path.unshift(route);
      route=MARK_BURST_ROUTE_BY_ID[route.parentId];}return path;},
    compile=(path,rank='COMMON',all=false)=>synthesizeMarkBurstFormRoute(
      ...path.flatMap((route,index)=>[route,all||index===path.length-1?rank:'COMMON'])),
    quality=c=>c.synthesisQualityReceipts.reduce((sum,r)=>sum+r.quality,0),
    compareChain=(c,secondary,primary)=>{
      const q=quality(c),packet=c.deliveryPattern==='SIMULTANEOUS_PACKET',
        initialPacket=packet&&q<16,
        // A paid +1-contact Apex may start at three arrows like a three-pellet
        // packet. This is an intercept, not Chain's faster growth curve.
        paidLong=Object.entries(c.synthesisAxisCredits||{}).reduce((sum,[axis,power])=>
          sum+(axis.endsWith('_LONG')?power:0),0),
        initialPaidContact=q<16&&c.apexRefinementId==='LONG'&&
          paidLong>=SKILL_GUARDRAIL_POWER_VALUES.CHAIN_GAIN&&
          c.hits===skillSupportArrowMagnitude(q)+1&&c.hits===3,
        initialTie=initialPacket||initialPaidContact;
      check(q===quality(secondary)&&q===quality(primary),'Comparison Quality mismatch',c.activeAttributeRouteId);
      check(c.hits<primary.hits&&(initialTie?c.hits<=secondary.hits:c.hits<secondary.hits),
        'Supporting arrows reached Chain density',{id:c.activeAttributeRouteId,q,
          arrows:c.hits,secondary:secondary.hits,primary:primary.hits});
      if(initialPaidContact&&c.hits===secondary.hits)initialContactTies.push({
        id:c.activeAttributeRouteId,q,arrows:c.hits,secondary:secondary.hits});
      check(!c.extraChainBonus,'Non-Chain gained a Chain coefficient',c.activeAttributeRouteId);
    },chainCache=new Map(),chains=(depth,rank,all)=>{
      const key=[depth,rank,all].join('|');if(chainCache.has(key))return chainCache.get(key);
      const result=['burst_critical_chain_flow_twist_apex_1',
        'burst_chain_critical_ascent_twist_apex_1'].map(id=>
          compile(lineage(MARK_BURST_ROUTE_BY_ID[id]).slice(0,depth),rank,all));
      chainCache.set(key,result);return result;
    };
  let cards=0,actions=0,routes=0;
  for(const q of [16,32,64,256,1e6])check(skillSupportArrowMagnitude(q)+1<skillDeliveryMagnitude(q)&&
    skillSupportArrowMagnitude(q)+1<skillPrimaryChainDeliveryMagnitude(q),
    'Paid starting arrow inherited Chain growth',{q});
  for(const route of MARK_BURST_ROUTE_CONTRACTS){
    if(route.runtimeReadiness!=='MATERIALIZED'||route.depth<2||
       route.primaryAttributeId==='CHAIN'||route.secondaryAttributeId==='CHAIN')continue;
    const path=lineage(route),common=compile(path);
    if(common.hits<=1)continue;
    routes++;families.add(common.markDetonationEventMode||route.id);
    const high=compile(path,'LEGENDARY',true);
    for(const [c,rank,all] of [[common,'COMMON',false],[high,'LEGENDARY',true]]){
      cards++;compareChain(c,...chains(route.depth,rank,all));
      const plan=commandMarkPlan(c,c.markDetonationCoreCapacity+2),packet=c.deliveryPattern==='SIMULTANEOUS_PACKET';
      check(plan.consumedTotal===c.markDetonationCoreCapacity,'Arrow count truncated Mark capacity',route.id);
      // Shared packets retain one Chain; explicitly authored per-contact packets
      // (prepared Critical pellets) generate one Chain per real arrow.
      const sharedChain=packet&&!route.mechanics.visibleContactsCreateChain;
      check(totalCommandChainGain(c)===(sharedChain?1:c.hits),'Contact/Chain truth drift',route.id);
      const timeline=buildBowActionTimeline(c,commandDeliveryContract(c),0,600,8);
      check(timeline.contacts.length===c.hits,'Animation lost mechanical arrows',route.id);
      if(changed.has(c.markDetonationEventMode)){
        check(near(commandDirectDamageTotal(c),BASE_TURN_SKILL_BY_ID.mark_burst.damage+
          c.synthesisAxisCredits.DIRECT_DAMAGE),'Arrow redistribution lost direct damage',route.id);
        if(c.postureContactPattern)check(near(c.postureContactPattern.reduce((s,n)=>s+n,0),1),
          'Posture redistribution lost payload',route.id);
        if(c.afflictionSplitPerContact)check(near(Array.from({length:c.hits},(_,i)=>
          commandBleedContactAmount(c,0,i)).reduce((s,n)=>s+n,0),commandBleedAmount(c)),
          'Wound redistribution lost payload',route.id);
      }
    }
    check(high.hits>=common.hits&&commandDirectDamageTotal(high)>=commandDirectDamageTotal(common)&&
      high.markDetonationCoreCapacity>=common.markDetonationCoreCapacity,
      'High-Quality output regressed',route.id);
    if(route.depth===3&&changed.has(common.markDetonationEventMode)){
      representatives.set(common.markDetonationEventMode,high);
      const [secondary,primary]=chains(route.depth,'LEGENDARY',true);
      examples.push({id:route.id,common:common.hits,legendary:high.hits,
        secondary:secondary.hits,primary:primary.hits,markCapacity:high.markDetonationCoreCapacity});
    }
    if(changed.has(common.markDetonationEventMode)){
      let previous=common;
      for(const rank of SKILL_RARITY_ORDER.slice(1)){
        const c=compile(path,rank);cards++;compareChain(c,...chains(route.depth,rank,false));
        check(c.hits>=previous.hits&&commandDirectDamageTotal(c)+.0031>=commandDirectDamageTotal(previous)&&
          c.markDetonationCoreCapacity>=previous.markDetonationCoreCapacity,
          'Current-rank regression',route.id);previous=c;
      }
    }
  }
  // The three-pellet initial silhouette is not a Chain growth rate. Future
  // cumulative Quality must still grow, with no fixed arrow or Mark ceiling.
  for(const q of [10,15,28,67,160,640,2560]){
    const secondary=skillDeliveryMagnitude(q),primary=skillPrimaryChainDeliveryMagnitude(q),
      short=skillSupportArrowMagnitude(q),long=skillSupportArrowMagnitude(q,true),
      packet=skillSupportArrowMagnitude(q,false,true);
    check(short<=long&&long<secondary&&packet<primary&&
      (q<16?packet<=secondary:packet<secondary),'Uncapped growth hierarchy broken',{q,short,long,packet,secondary,primary});
  }
  check(skillSupportArrowMagnitude(2560)>skillSupportArrowMagnitude(67)&&
    skillSupportArrowMagnitude(2560,false,true)>skillSupportArrowMagnitude(67,false,true),
    'Supporting arrows acquired a fixed cap');
  check(representatives.size===changed.size,'Missing changed-engine coverage',[...representatives.keys()]);
  openSkillLab();
  for(const [engine,c] of representatives){
    const packet=c.deliveryPattern==='SIMULTANEOUS_PACKET',capacity=c.markDetonationCoreCapacity;
    if(packet)check(capacity>c.hits,'Missing multi-Mark-per-arrow sentinel',engine);
    for(const marks of packet?[0,1,capacity+2]:[capacity+2]){
      startSkillLabCombat();applySkillLabPreset('clean',false);
      boss.maxhp=boss.hp=1e9;boss.posture=0;boss.postureMax=1e6;boss.mark=marks;
      boss.ap=boss.resolve=100;skillLabSession.forceCritical=false;
      const old=Math.random;try{Math.random=()=>.999999;
        check(performPlayerAction(c),'Action did not start',engine);
        const action=boss.turnAction;actions++;
        while(action.hitIndex<action.hits)resolveTurnActionHit(action);
        const plan=commandMarkPlan(c,marks);
        check(action.hits===c.hits&&action.consumedMark===plan.consumedTotal&&
          bossMark()===marks-plan.consumedTotal,'Real action lost Mark capacity',{engine,marks});
        check(chainStacks===(packet?1:c.hits),'Real action generated wrong Chain',engine);
        check(action.bowTimeline.contacts.length===c.hits,'Runtime animation drift',engine);
        if(c.afflictionSplitPerContact)check(boss.bleed+.0031>=commandBleedAmount(c),
          'Real packet lost wound',engine);
      }finally{Math.random=old;}
    }
  }
  // More Marks than arrows does not prove every arrow detonated: one arrow can
  // spend several Marks. Preserve EMPTY_BARBS/FULL_BARB's actual-contact tests.
  const firePacket=(c,marks)=>{
    startSkillLabCombat();applySkillLabPreset('clean',false);
    boss.maxhp=boss.hp=1e9;boss.posture=0;boss.postureMax=1e6;boss.mark=marks;
    boss.ap=boss.resolve=100;skillLabSession.forceCritical=false;
    const old=Math.random;try{Math.random=()=>.999999;
      check(performPlayerAction(c),'Packet Apex action did not start',c.activeAttributeRouteId);
      const action=boss.turnAction;actions++;
      while(action.hitIndex<action.hits)resolveTurnActionHit(action);
      return {damage:boss.maxhp-boss.hp,wound:boss.bleed};
    }finally{Math.random=old;}
  };
  for(const refinement of ['EMPTY_BARBS','FULL_BARB']){
    const route=MARK_BURST_ROUTE_CONTRACTS.find(r=>r.depth===4&&
      r.parentId==='detonation_bleed_packet_twist'&&r.mechanics.refinement===refinement),
      c=compile(lineage(route),'LEGENDARY',true);
    for(const marks of [c.hits,c.markDetonationCoreCapacity-1]){
      const plan=commandMarkPlan(c,marks),empty=plan.consumedByHit.filter(n=>n===0).length,
        result=firePacket(c,marks);
      check(commandUnspentDetonationContacts(c,plan)===empty,'Wrong empty-contact count',refinement);
      if(refinement==='EMPTY_BARBS')check(near(result.wound,commandBleedAmount(c)+
        empty*c.afflictionPerUnspentContact),'Low-Mark Apex lost wound fallback',{marks,empty,result});
      else{
        const baseline=firePacket({...c,detonationFullPacketBonus:0},marks),gain=result.damage-baseline.damage;
        check(empty===0?gain>0:near(gain,0),'Full-packet Apex triggered before every contact detonated',
          {marks,empty,gain});
      }
    }
  }
  return {passed:!failures.length,routes,cards,actions,families:[...families],examples,initialContactTies,failures};
})();
