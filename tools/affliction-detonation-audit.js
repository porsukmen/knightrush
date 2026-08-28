/* F5S1 only: current-rank cards + high-parent sentinels. Real contacts, ticks,
   all sixteen refinements and cross-skill fuse consumption; no ancestor matrix. */
globalThis.__afflictionDetonationAudit=(()=>{
  const defs=MARK_BURST_AFFLICTION_DETONATION_TWIST_DEFINITIONS,failures=[],rows=[],apexRows=[],rankRows=[],
    check=(ok,message,detail)=>{if(!ok)failures.push({message,detail});},
    near=(a,b)=>Math.abs(a-b)<.0031,
    compile=(t,a=0,rank='COMMON')=>synthesizeMarkBurstDetonationPath('COMMON',
      'burst_affliction_detonation_spec','COMMON',t.id,a?'COMMON':rank,a?t.id+'_apex_'+a:null,rank),
    snap=c=>({id:c.activeAttributeRouteId,direct:commandDirectDamageTotal(c),bleed:commandBleedAmount(c),
      capacity:c.markDetonationCoreCapacity,potency:c.markRule.damagePerMark,
      relationship:commandExpectedAfflictionDetonationPower(c),score:stableEvolutionCombinedGuardrailValue(c)}),
    compare=(c,p)=>{const a=snap(c),b=snap(p);for(const key of ['direct','bleed','capacity','potency','relationship','score'])
      check(a[key]+.0031>=b[key],'Parent/rank regression: '+key,{child:a,parent:b});},
    spread=rs=>{const vs=rs.map(r=>r.score);return (Math.max(...vs)-Math.min(...vs))/Math.max(...vs);};
  let cards=0,actions=0;
  const parent=synthesizeMarkBurstDetonationPath('COMMON','burst_affliction_detonation_spec','COMMON');
  check(defs.length===4&&defs.every(t=>t.apexes.length===4),'Expected 4 Twists /16 Apex');
  const brief=MARK_BURST_AFFLICTION_DETONATION_BRIEF,
    entries=defs.map(t=>({id:t.id,deliveryPattern:'SINGLE',identity:MARK_BURST_ROUTE_BY_ID[t.id].twistIdentity})),
    neighbors=MARK_BURST_ROUTE_CONTRACTS.filter(r=>r.depth===3&&brief.comparisonSpecIds.includes(r.parentId))
      .map(r=>({id:r.id,deliveryPattern:r.delivery.pattern,identity:r.twistIdentity})),
    identity=auditTwistIdentitySet(entries,brief,neighbors),
    neighborSimilarity=Math.max(...entries.flatMap(e=>neighbors.map(n=>
      twistIdentityBehaviorSimilarity(e.identity,n.identity))));
  check(identity.passed&&neighborSimilarity<=brief.maxCatalogSimilarity,'Twist/neighbor identity gate failed',
    {identity,neighborSimilarity});
  for(const t of defs){
    const common=compile(t);compare(common,parent);rows.push(snap(common));
    for(let a=0;a<=4;a++){
      let previous=null;
      for(const rank of SKILL_RARITY_ORDER){
        const c=compile(t,a,rank),route=MARK_BURST_ROUTE_BY_ID[c.activeAttributeRouteId];cards++;
        if(a)compare(c,common);if(previous)compare(c,previous);previous=c;
        check(c.afflictionDetonation&&c.hits===1&&c.deliveryPattern==='SINGLE'&&
          totalCommandChainGain(c)===1&&!c.extraChainBonus&&!c.markGain&&!c.critChance&&
          !c.posture&&!c.critDamageStatUnlocked&&!c.afflictionTickWeights&&c.animationRecipeId===t.recipe,
          'Native identity / arrow / animation drift',snap(c));
        check(c.markRule.cap===c.markDetonationCoreCapacity&&c.markDetonationCoreCapacity>1&&
          commandMarkPlan(c,10000).consumedTotal===c.markDetonationCoreCapacity,
          'Shared Detonation capacity lost',snap(c));
        check(near(c.synthesisIdentityAllocation.primaryShare,.70)&&
          near(Object.values(route.qualityProfile).reduce((s,n)=>s+n,0),1),
          'Role/profile conservation drift',snap(c));
        for(const r of c.synthesisQualityReceipts)check(near(r.baseAttributePowerAllocation,r.powerBudget*.1)&&
          near(Object.values(r.powerAllocation).reduce((s,n)=>s+n,0),r.powerBudget),'Receipt conservation failed',r);
        check(BLEED_DETONATION_AXES.every(axis=>!(c.synthesisAxisReserve[axis]>0)),
          'Relationship credits left unused',snap(c));
        if(a)check(route.apexDesign.version===2&&route.apexDesign.runtimeEvidence.length>=3,
          'Missing Apex decision evidence',route.id);
        rankRows.push({rank,apex:a,twist:t.id,...snap(c)});
        if(a&&rank==='COMMON')apexRows.push(snap(c));
      }
    }
    const high=synthesizeMarkBurstDetonationPath('LEGENDARY','burst_affliction_detonation_spec','LEGENDARY',t.id,'COMMON');
    cards++;compare(high,synthesizeMarkBurstDetonationPath('LEGENDARY','burst_affliction_detonation_spec','LEGENDARY'));
  }
  check(spread(rows)<=.20,'Twist balance exceeds 20%',rows);
  const apexSpreads=defs.map(t=>({id:t.id,spread:spread(apexRows.filter(r=>r.id.startsWith(t.id)))}));
  for(const row of apexSpreads)check(row.spread<=.25,'Apex balance exceeds 25%',row);
  for(const rank of SKILL_RARITY_ORDER){
    check(spread(rankRows.filter(r=>r.rank===rank&&!r.apex))<=.20,'Current-rank Twist balance failed',rank);
    for(const t of defs)check(spread(rankRows.filter(r=>r.rank===rank&&r.apex&&r.twist===t.id))<=.25,
      'Current-rank Apex balance failed',{rank,twist:t.id});
  }
  openSkillLab();
  const fire=c=>{
    const old=Math.random;try{Math.random=()=>.999999;
      if(!performPlayerAction(c))throw new Error('Could not start '+c.activeAttributeRouteId);
      const action=boss.turnAction;actions++;
      while(action.hitIndex<action.hits)resolveTurnActionHit(action);
      return action;
    }finally{Math.random=old;}
  },start=(c,{mark=20,bleed=0,later=bleed,ap=100,last=null,chain=0}={})=>{
    startSkillLabCombat();applySkillLabPreset('clean',false);skillLabSession.forceCritical=false;
    boss.maxhp=boss.hp=1e9;boss.posture=0;boss.postureMax=1e6;
    boss.mark=mark;boss.bleed=bleed;boss.bleedLater=later;boss.ap=ap;boss.resolve=100;
    boss.criticalFocusLastAttack=last?{knight:last}:{};chainStacks=chain;return fire(c);
  },again=(c,mark=bossMark())=>{boss.phase='player';boss.turnAction=null;boss.ap=boss.resolve=100;
    boss.mark=mark;return fire(c);},tick=()=>resolveBossPhaseBleed(false);
  for(const t of defs)for(let a=0;a<=4;a++){
    const c=compile(t,a),action=start(c,{bleed:6}),plan=commandMarkPlan(c,20);
    check(boss.hp<boss.maxhp&&bossBleed()+.0031>=6+commandBleedAmount(c)&&
      chainStacks===1&&bossMark()===20-plan.consumedTotal&&action.consumedMark===plan.consumedTotal,
      'Actual action lost native payload',snap(c));
    check(action.bowTimeline.recipe.id===t.recipe&&action.bowTimeline.contacts.length===1&&
      action.bowTimeline.releases.length===1,'Bow contacts disagree with combat',t.id);
    action.t=.1;drawBowMechanicCue(action,action.bowTimeline,{from:{x:100,y:200},to:{x:300,y:200}});
    drawBossBleedStatus(boss);
    for(let depth=1;depth<=4;depth++)moveTreeSynthesisRarityByDepth[depth]='COMMON';
    const node=WEAPON_SKILL_PROTOTYPE_LAB_NODE_BY_SKILL_AND_ID.mark_burst[c.activeAttributeRouteId],
      preview=node&&moveTreeSynthesisPreviewCommand(node);
    check(preview&&near(commandBleedAmount(preview),commandBleedAmount(c))&&
      preview.afflictionDetonation.engine===c.afflictionDetonation.engine,'Skill Lab preview lost mechanic',snap(c));
  }
  const fresh=compile(defs[0]),first=compile(defs[0],2),full=compile(defs[0],3),handoff=compile(defs[0],4);
  let action=start(fresh),amount=action.afflictionFreshRupture,wound=commandBleedAmount(fresh);
  check(near(bossBleed(),wound)&&near(bossBleedLater(),wound)&&amount>0,'Fresh rupture ate native ticks');
  const hp=boss.hp;tick();tick();check(near(hp-boss.hp,2*stableDamage(wound))&&!bossBleed()&&!bossBleedLater(),
    'Fresh wound did not end in exactly two ticks');
  check(near(start(fresh,{bleed:100,later:10}).afflictionFreshRupture,amount),'Fresh rupture borrowed old wounds');
  check(!start(fresh,{mark:0}).afflictionFreshRupture,'No-Mark fresh rupture triggered');
  check(start(first).afflictionFreshRupture>start(first,{bleed:6}).afflictionFreshRupture,'First Blood condition missing');
  check(start(full).afflictionFreshRupture>start(full,{mark:1}).afflictionFreshRupture,'Full capacity condition missing');
  check(start(handoff,{last:{id:'other',route:'other'}}).afflictionFreshRupture>
    start(handoff).afflictionFreshRupture,'Handoff condition missing');
  check(near(start(fresh,{chain:30}).afflictionFreshRupture,amount),'Chain multiplied fresh wound bonus');
  const feed=compile(defs[1]),last=compile(defs[1],2),repeat=compile(defs[1],3),fallback=compile(defs[1],4);
  action=start(feed,{bleed:6,later:0});wound=commandBleedAmount(feed);
  check(near(bossBleedLater(),wound)&&near(bossBleed(),6+wound+feed.afflictionDetonation.feed),
    'Feed refreshed old duration or amplified new wound');
  tick();check(near(bossBleed(),wound),'Old final tick got extended');tick();check(!bossBleed(),'Feed added third tick');
  check(start(last,{bleed:6,later:0}).afflictionOldWoundFed>
    start(last,{bleed:6}).afflictionOldWoundFed,'Final pulse condition missing');
  check(start(repeat,{bleed:6,last:{id:repeat.baseId||repeat.id,route:repeat.activeAttributeRouteId}}).afflictionOldWoundFed>
    start(repeat,{bleed:6}).afflictionOldWoundFed,'Repeated maintenance condition missing');
  check(!start(feed).afflictionOldWoundFed&&!start(feed,{bleed:6,mark:0}).afflictionOldWoundFed,
    'Feed needs old wound and real detonation');
  start(fallback);check(bossBleed()>commandBleedAmount(fallback)&&fallback.afflictionDetonation.fallback<
    fallback.afflictionDetonation.feed,'New wound fallback missing / exceeds old wound payoff');
  start(fallback,{mark:0});check(near(bossBleed(),commandBleedAmount(fallback)),'Fallback skipped detonation condition');
  const fuse=compile(defs[2]),spark=compile(defs[2],2),rotation=compile(defs[2],3),lastMark=compile(defs[2],4);
  start(fuse,{mark:0});tick();check(!boss.afflictionDetonationFuse,'Fuse armed before second tick');
  tick();check(near(boss.afflictionDetonationFuse?.amount,fuse.afflictionDetonation.fuse),'Second tick failed to arm fuse');
  const ready=boss.afflictionDetonationFuse.amount;tick();check(near(boss.afflictionDetonationFuse.amount,ready),'Empty tick duplicated fuse');
  again(parent,0);check(boss.afflictionDetonationFuse,'Zero-Mark contact consumed fuse');
  action=again(parent,20);check(near(action.afflictionFuseConsumed,ready)&&!boss.afflictionDetonationFuse,
    'Next different move did not consume finite fuse once');
  check(!again(parent,20).afflictionFuseConsumed,'Fuse consumed twice');
  start(spark,{mark:0});tick();check(near(boss.afflictionDetonationFuse?.amount,spark.afflictionDetonation.spark),
    'First Spark not armed at first tick');
  again(parent,20);tick();check(near(boss.afflictionDetonationFuse?.amount,spark.afflictionDetonation.fuse),
    'First Spark removed normal second-tick reward');
  start(rotation,{mark:0});tick();tick();again(parent,0);action=again(parent,20);
  check(near(action.afflictionFuseConsumed,rotation.afflictionDetonation.fuse+rotation.afflictionDetonation.rotation),
    'Intervening attack did not upgrade ready fuse');
  start(rotation,{mark:0});tick();tick();action=again(parent,20);
  check(near(action.afflictionFuseConsumed,rotation.afflictionDetonation.fuse),'Consuming attack itself earned rotation');
  start(lastMark,{mark:0});tick();tick();action=again(parent,1);
  check(near(action.afflictionFuseConsumed,lastMark.afflictionDetonation.fuse+lastMark.afflictionDetonation.lastMark),
    'Last Mark condition failed');
  start(lastMark,{mark:0});tick();tick();action=again(parent,20);
  check(near(action.afflictionFuseConsumed,lastMark.afflictionDetonation.fuse),'Last Mark paid with Marks remaining');
  // Two overlapping paid wounds mature independently through aggregate tick buckets.
  start(fuse,{mark:0});tick();again(fuse,0);tick();tick();
  check(near(boss.afflictionDetonationFuse?.amount,2*fuse.afflictionDetonation.fuse),'Overlapping wounds lost/duplicated fuse');
  const failure=compile(defs[3]),partial=compile(defs[3],2),lastAP=compile(defs[3],3),aftermath=compile(defs[3],4);
  start(failure,{mark:0});const zero=bossBleed();start(failure);
  check(zero>bossBleed()&&near(bossBleed(),commandBleedAmount(failure)),'No-Mark compensation drift');
  start(partial,{mark:0});const empty=bossBleed();action=start(partial,{mark:1});const incomplete=bossBleed();
  check(incomplete>commandBleedAmount(partial)&&incomplete<empty&&bossMark()===0&&action.consumedMark===1,
    'Partial fallback too strong / withheld Mark');
  start(lastAP,{mark:0,ap:1});const finalWound=bossBleed();start(lastAP,{mark:0});
  check(finalWound>bossBleed(),'Last AP condition missing');
  start(aftermath,{mark:0,last:{id:'other',consumedMark:2}});const after=bossBleed();start(aftermath,{mark:0});
  check(after>bossBleed(),'Previous detonation condition missing');
  start(parent,{mark:1});action=again(aftermath,0);
  check(action.command.afflictionDetonationContext.afterDetonation,'Actual previous consumption was not recorded');
  start(fuse,{mark:0});tick();tick();applySkillLabPreset('clean',false);
  check(!boss.afflictionDetonationFuse&&!boss.bleedFuseAmount&&!boss.bleedFuseAmountLater,
    'Lab reset leaked pending/ready fuse');
  return {passed:!failures.length,twists:4,apexes:16,cards,actions,spread:spread(rows),apexSpreads,
    identity:{passed:identity.passed,distinctCores:identity.distinctCores,
      maximumSimilarity:identity.maximumSimilarity,neighborSimilarity},rows,failures};
})();
