/* F5S2 only: current-rank cards plus four high-parent sentinels. The audit
   executes every Apex condition but never builds an ancestor Cartesian matrix. */
globalThis.__afflictionChainAudit=(()=>{
  const defs=MARK_BURST_AFFLICTION_CHAIN_TWIST_DEFINITIONS,failures=[],rows=[],apexRows=[],rankRows=[],
    check=(ok,message,detail)=>{if(!ok)failures.push({message,detail});},near=(a,b)=>Math.abs(a-b)<.0031,
    compile=(t,a=0,rank='COMMON')=>synthesizeMarkBurstDetonationPath('COMMON',
      'burst_affliction_chain_spec','COMMON',t.id,a?'COMMON':rank,a?t.id+'_apex_'+a:null,rank),
    snap=c=>({id:c.activeAttributeRouteId,direct:commandDirectDamageTotal(c),hits:c.hits,
      bleed:commandBleedAmount(c),capacity:c.markDetonationCoreCapacity,potency:c.markRule.damagePerMark,
      relationship:commandExpectedAfflictionChainPower(c),score:stableEvolutionCombinedGuardrailValue(c)}),
    compare=(c,p)=>{const a=snap(c),b=snap(p);for(const key of ['direct','hits','bleed','capacity','potency','relationship','score'])
      check(a[key]+.0031>=b[key],'Parent/rank regression: '+key,{child:a,parent:b});},
    spread=rs=>{const vs=rs.map(r=>r.score);return (Math.max(...vs)-Math.min(...vs))/Math.max(...vs);};
  let cards=0,actions=0;
  const parent=synthesizeMarkBurstDetonationPath('COMMON','burst_affliction_chain_spec','COMMON');
  check(defs.length===4&&defs.every(t=>t.apexes.length===4),'Expected 4 Twists /16 Apex');
  const brief=MARK_BURST_AFFLICTION_CHAIN_BRIEF,
    entries=defs.map(t=>({id:t.id,deliveryPattern:'SEQUENTIAL',identity:MARK_BURST_ROUTE_BY_ID[t.id].twistIdentity})),
    neighbors=MARK_BURST_ROUTE_CONTRACTS.filter(r=>r.depth===3&&brief.comparisonSpecIds.includes(r.parentId))
      .map(r=>({id:r.id,deliveryPattern:r.delivery.pattern,identity:r.twistIdentity})),
    identity=auditTwistIdentitySet(entries,brief,neighbors),neighborSimilarity=Math.max(...entries.flatMap(e=>
      neighbors.map(n=>twistIdentityBehaviorSimilarity(e.identity,n.identity))));
  check(identity.passed&&neighborSimilarity<=brief.maxCatalogSimilarity,'Twist/neighbor identity gate failed',
    {identity,neighborSimilarity});
  for(const t of defs){
    const common=compile(t);compare(common,parent);rows.push(snap(common));
    for(let a=0;a<=4;a++){
      let previous=null;
      for(const rank of SKILL_RARITY_ORDER){
        const c=compile(t,a,rank),route=MARK_BURST_ROUTE_BY_ID[c.activeAttributeRouteId],s=snap(c);cards++;
        if(a)compare(c,common);if(previous)compare(c,previous);previous=c;
        rankRows.push({rank,apex:a,twist:t.id,...s});if(a&&rank==='COMMON')apexRows.push(s);
        check(c.afflictionChain&&c.deliveryPattern==='SEQUENTIAL'&&c.hits>=2&&
          !c.extraChainBonus&&!c.consumeChain&&!c.markGain&&!c.critChance&&!c.posture&&
          !c.critDamageStatUnlocked&&c.afflictionSplitPerContact&&c.animationRecipeId===t.recipe,
          'Identity / Delivery / animation drift',s);
        check(totalCommandChainGain(c)===c.hits&&Array.from({length:c.hits},(_,i)=>
          commandChainGain(c,i)).every(n=>n===1),'Every visible arrow must make one native Chain',s);
        check(c.markRule.cap===c.markDetonationCoreCapacity&&c.markDetonationHitIndex===c.hits-1&&
          commandMarkPlan(c,10000).markDamageByHit.slice(0,-1).every(n=>n===0),
          'Final shared Detonation drift',s);
        check(Array.from({length:c.hits},(_,i)=>commandHitBase(c,i)).every(n=>n>0)&&
          Array.from({length:c.hits},(_,i)=>commandBleedContactAmount(c,0,i)).every(n=>n>0)&&
          near(Array.from({length:c.hits},(_,i)=>commandBleedContactAmount(c,0,i)).reduce((x,n)=>x+n,0),s.bleed),
          'Visible arrow lost positive direct/wound or multiplied total wound',s);
        check(near(c.synthesisIdentityAllocation.primaryShare,.70)&&
          near(Object.values(route.qualityProfile).reduce((x,n)=>x+n,0),1),
          '70/30 or profile conservation drift',s);
        for(const receipt of c.synthesisQualityReceipts)check(near(receipt.baseAttributePowerAllocation,
          receipt.powerBudget*.1)&&near(Object.values(receipt.powerAllocation).reduce((x,n)=>x+n,0),
          receipt.powerBudget),'Receipt conservation failed',receipt);
        check(AFFLICTION_CHAIN_AXES.every(axis=>!(c.synthesisAxisReserve[axis]>0)),
          'Relationship Quality left unused',s);
        if(a)check(route.apexDesign.version===2&&route.apexDesign.runtimeEvidence.length>=3,
          'Missing Apex V2 evidence',route.id);
      }
    }
    const high=synthesizeMarkBurstDetonationPath('LEGENDARY','burst_affliction_chain_spec','LEGENDARY',t.id,'COMMON');
    cards++;compare(high,synthesizeMarkBurstDetonationPath('LEGENDARY','burst_affliction_chain_spec','LEGENDARY'));
  }
  check(spread(rows)<=.20,'Common Twist balance exceeds 20%',rows);
  const apexSpreads=defs.map(t=>({id:t.id,spread:spread(apexRows.filter(r=>r.id.startsWith(t.id)))}));
  for(const row of apexSpreads)check(row.spread<=.25,'Apex balance exceeds 25%',row);
  for(const rank of SKILL_RARITY_ORDER){
    check(spread(rankRows.filter(r=>r.rank===rank&&!r.apex))<=.20,'Current-rank Twist balance failed',rank);
    for(const t of defs)check(spread(rankRows.filter(r=>r.rank===rank&&r.apex&&r.twist===t.id))<=.25,
      'Current-rank Apex balance failed',{rank,twist:t.id});
  }
  const dense=defs[1],denseRows=[];
  for(const rank of SKILL_RARITY_ORDER){
    const c=compile(dense,0,rank),long=compile(dense,1,rank),sameDepth=compile(dense,2,rank),primary=
      synthesizeMarkBurstDetonationPath('COMMON','burst_chain_focus_spec','COMMON',
        'burst_chain_focus_sequence_twist','COMMON','burst_chain_focus_sequence_twist_apex_1',rank);
    denseRows.push({rank,dense:c.hits,long:long.hits,primary:primary.hits});
    check(c.hits>=compile(defs[0],0,rank).hits&&long.hits===sameDepth.hits+1,
      'Dense/Long Delivery must add only its paid silhouette contacts',denseRows.at(-1));
  }
  const denseGrowth=denseRows.at(-1).dense-denseRows[0].dense,
    longGrowth=denseRows.at(-1).long-denseRows[0].long,
    primaryGrowth=denseRows.at(-1).primary-denseRows[0].primary;
  check(denseGrowth<primaryGrowth&&longGrowth<primaryGrowth&&
    denseRows.at(-1).long<denseRows.at(-1).primary,
    'Dense/Long Delivery scaling must stay below Primary Chain',{denseGrowth,longGrowth,primaryGrowth,denseRows});
  openSkillLab();
  const fire=c=>{const old=Math.random;try{Math.random=()=>.999999;
      if(!performPlayerAction(c))throw new Error('Could not start '+c.activeAttributeRouteId);
      const action=boss.turnAction;actions++;while(action.hitIndex<action.hits)resolveTurnActionHit(action);return action;
    }finally{Math.random=old;}},
    start=(c,{mark=20,bleed=0,later=bleed,chain=0,ap=100,last=null}={})=>{
      startSkillLabCombat();applySkillLabPreset('clean',false);skillLabSession.forceCritical=false;
      boss.maxhp=boss.hp=1e9;boss.posture=0;boss.postureMax=1e6;boss.mark=mark;
      boss.bleed=bleed;boss.bleedLater=later;boss.ap=ap;boss.resolve=100;chainStacks=chain;
      boss.criticalFocusLastAttack=last?{knight:last}:{};return fire(c);
    },tick=()=>resolveBossPhaseBleed(false);
  for(const t of defs)for(let a=0;a<=4;a++){
    const c=compile(t,a),action=start(c,{bleed:6}),plan=commandMarkPlan(c,20),native=commandBleedAmount(c);
    check(boss.hp<boss.maxhp&&bossBleed()+.0031>=6+native&&chainStacks>=c.hits&&
      bossMark()===20-plan.consumedTotal&&action.consumedMark===plan.consumedTotal,
      'Actual action lost native payload',snap(c));
    check(action.bowTimeline.recipe.id===t.recipe&&action.bowTimeline.contacts.length===c.hits&&
      action.bowTimeline.releases.length===c.hits,'Bow contacts disagree with combat',t.id);
    action.t=.1;drawBowMechanicCue(action,action.bowTimeline,{from:{x:100,y:200},to:{x:300,y:200}});
    for(let depth=1;depth<=4;depth++)moveTreeSynthesisRarityByDepth[depth]='COMMON';
    const node=WEAPON_SKILL_PROTOTYPE_LAB_NODE_BY_SKILL_AND_ID.mark_burst[c.activeAttributeRouteId],
      preview=node&&moveTreeSynthesisPreviewCommand(node);
    check(preview&&preview.afflictionChain.engine===c.afflictionChain.engine&&preview.hits===c.hits,
      'Skill Lab preview lost mechanic/Delivery',snap(c));
  }
  const stitch=compile(defs[0]),first=compile(defs[0],2),carried=compile(defs[0],3),toxic=compile(defs[0],4);
  let action=start(stitch),native=commandBleedAmount(stitch),bonus=bossBleed()-native;
  check(bonus>0&&near(bossBleed(),bossBleedLater()),'Live Stitch did not deepen both native ticks');
  check(near(start(stitch,{chain:30}).afflictionAppliedThisAction,action.afflictionAppliedThisAction),
    'Starting Chain leaked into parent Stitch conversion');
  check(start(first).afflictionAppliedThisAction>start(first,{bleed:6}).afflictionAppliedThisAction,
    'First Blood condition missing');
  check(start(carried,{chain:20}).afflictionAppliedThisAction>start(carried).afflictionAppliedThisAction,
    'Carried Thread did not opt starting Chain into wound');
  check(commandBleedAmount(toxic)>commandBleedAmount(stitch),'Toxic Stitch did not grow native wound');
  const denseBase=compile(dense),long=compile(dense,1),toxicTips=compile(dense,2),
    sharp=compile(dense,3),closing=compile(dense,4);
  check(long.hits>denseBase.hits&&commandBleedAmount(toxicTips)>commandBleedAmount(denseBase)&&
    commandDirectDamageTotal(sharp)>commandDirectDamageTotal(denseBase)&&
    commandHitBase(closing,closing.hits-1)>commandHitBase(closing,0),
    'Dense Delivery Apex identity missing',{dense:snap(denseBase),long:snap(long),closing:snap(closing)});
  const closure=compile(defs[2]),last=compile(defs[2],2),repeat=compile(defs[2],3),fallback=compile(defs[2],4);
  action=start(closure,{bleed:6});const oldGain=action.afflictionChainFinalGain;
  check(oldGain>0&&chainStacks===closure.hits+oldGain,'Existing wound did not pay final Chain');
  check(!start(closure).afflictionChainFinalGain,'Closure read its newly applied wound');
  check(start(last,{bleed:6,later:0}).afflictionChainFinalGain>
    start(last,{bleed:6}).afflictionChainFinalGain,'Last Pulse condition missing');
  check(start(repeat,{bleed:6,last:{id:repeat.baseId||repeat.id,route:repeat.activeAttributeRouteId}})
    .afflictionChainFinalGain>start(repeat,{bleed:6}).afflictionChainFinalGain,'Repeat condition missing');
  const fallbackEmpty=start(fallback).afflictionChainFinalGain,
    fallbackWounded=start(fallback,{bleed:6}).afflictionChainFinalGain;
  check(fallbackEmpty>0&&fallbackEmpty<fallbackWounded,
    'First Cut fallback missing / too strong',{fallbackEmpty,fallbackWounded});
  const cadence=compile(defs[3]),deep=compile(defs[3],1),fast=compile(defs[3],2),
    cadenceRepeat=compile(defs[3],3),low=compile(defs[3],4);
  start(cadence,{chain:10});native=commandBleedAmount(cadence,0,10);
  check(near(bossBleed(),native)&&bossBleedLater()>native,'Late Cadence changed first tick / missed second');
  const later=bossBleedLater();tick();check(near(bossBleed(),later),'Late Cadence did not survive into second tick');
  const noStart=start(cadence),noStartLater=bossBleedLater();
  check(near(noStartLater,commandBleedAmount(cadence)),'Self-generated Chain fed same-action Cadence');
  start(deep,{chain:10});const deepLater=bossBleedLater();start(cadence,{chain:10});
  check(deepLater>bossBleedLater(),'Deep Cadence condition missing');
  start(fast,{chain:10,ap:1});check(bossBleed()>commandBleedAmount(fast,0,10),'Fast Blood missed last AP');
  start(cadenceRepeat,{chain:10,last:{id:cadenceRepeat.baseId||cadenceRepeat.id,
    route:cadenceRepeat.activeAttributeRouteId}});const repeatLater=bossBleedLater();
  start(cadenceRepeat,{chain:10});check(repeatLater>bossBleedLater(),'Repeated Cadence condition missing');
  start(low);check(bossBleedLater()>commandBleedAmount(low),'Low Tempo fallback missing');
  const beforeChain=chainStacks;tick();tick();check(chainStacks===beforeChain,'Bleed tick invented Chain');
  return {passed:!failures.length,twists:4,apexes:16,cards,actions,spread:spread(rows),apexSpreads,
    identity:{passed:identity.passed,distinctCores:identity.distinctCores,
      maximumSimilarity:identity.maximumSimilarity,neighborSimilarity},denseRows,rows,failures};
})();
