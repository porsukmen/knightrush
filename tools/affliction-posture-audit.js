/* F5S3 only: current-rank cards plus four high-parent sentinels. No ancestor Cartesian matrix. */
globalThis.__afflictionPostureAudit=(()=>{
  const defs=MARK_BURST_AFFLICTION_POSTURE_TWIST_DEFINITIONS,failures=[],rows=[],apexRows=[],rankRows=[],
    check=(ok,message,detail)=>{if(!ok)failures.push({message,detail});},near=(a,b)=>Math.abs(a-b)<.0031,
    compile=(t,a=0,rank='COMMON')=>synthesizeMarkBurstDetonationPath('COMMON',
      'burst_affliction_posture_spec','COMMON',t.id,a?'COMMON':rank,a?t.id+'_apex_'+a:null,rank),
    snap=c=>({id:c.activeAttributeRouteId,direct:commandDirectDamageTotal(c),hits:c.hits,
      bleed:commandBleedAmount(c),posture:commandPostureDamage(c,0,0,0,1e6,0,0),
      capacity:c.markDetonationCoreCapacity,potency:c.markRule.damagePerMark,
      relationship:commandExpectedAfflictionPosturePower(c),score:stableEvolutionCombinedGuardrailValue(c)}),
    compare=(c,p)=>{const a=snap(c),b=snap(p);for(const key of ['direct','hits','bleed','posture','capacity','potency','relationship','score'])
      check(a[key]+.0031>=b[key],'Parent/rank regression: '+key,{child:a,parent:b});},
    spread=rs=>{const vs=rs.map(r=>r.score);return (Math.max(...vs)-Math.min(...vs))/Math.max(...vs);};
  let cards=0,actions=0;
  const parent=synthesizeMarkBurstDetonationPath('COMMON','burst_affliction_posture_spec','COMMON');
  check(defs.length===4&&defs.every(t=>t.apexes.length===4),'Expected 4 Twists / 16 Apex');
  const brief=MARK_BURST_AFFLICTION_POSTURE_BRIEF,
    entries=defs.map(t=>({id:t.id,deliveryPattern:MARK_BURST_ROUTE_BY_ID[t.id].delivery.pattern,
      identity:MARK_BURST_ROUTE_BY_ID[t.id].twistIdentity})),
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
        const sequence=t.key==='sequence';
        check(c.afflictionPosture&&c.deliveryPattern===(sequence?'SEQUENTIAL':'SINGLE')&&
          c.hits>=(sequence?2:1)&&!c.extraChainBonus&&!c.consumeChain&&!c.markGain&&!c.critChance&&
          !c.critDamageStatUnlocked&&!c.breakPowerBonus&&c.animationRecipeId===t.recipe,
          'Identity / forbidden stat / animation drift',s);
        check(totalCommandChainGain(c)===c.hits&&Array.from({length:c.hits},(_,i)=>
          commandChainGain(c,i)).every(n=>n===1),'Every visible arrow must make one native Chain',s);
        check(c.markRule.cap===c.markDetonationCoreCapacity&&c.markDetonationHitIndex===c.hits-1&&
          commandMarkPlan(c,10000).markDamageByHit.slice(0,-1).every(n=>n===0),
          'Final shared Detonation drift',s);
        check(Array.from({length:c.hits},(_,i)=>commandHitBase(c,i)).every(n=>n>0)&&
          (!sequence||Array.from({length:c.hits},(_,i)=>commandBleedContactAmount(c,0,i)).every(n=>n>0)&&
            c.postureContactPattern.every(n=>n>0)&&near(c.postureContactPattern.reduce((x,n)=>x+n,0),1)),
          'Visible arrow lost positive conserved payload',s);
        check(near(c.synthesisIdentityAllocation.primaryShare,.70)&&
          near(Object.values(route.qualityProfile).reduce((x,n)=>x+n,0),1),
          '70/30 or profile conservation drift',s);
        for(const receipt of c.synthesisQualityReceipts)check(near(receipt.baseAttributePowerAllocation,
          receipt.powerBudget*.1)&&near(Object.values(receipt.powerAllocation).reduce((x,n)=>x+n,0),
          receipt.powerBudget),'Receipt conservation failed',receipt);
        check(AFFLICTION_POSTURE_AXES.every(axis=>!(c.synthesisAxisReserve[axis]>0)),
          'Relationship Quality left unused',s);
        if(a)check(route.apexDesign.version===2&&route.apexDesign.runtimeEvidence.length>=3,
          'Missing Apex V2 evidence',route.id);
      }
    }
    const high=synthesizeMarkBurstDetonationPath('LEGENDARY','burst_affliction_posture_spec','LEGENDARY',
      t.id,'COMMON');cards++;compare(high,synthesizeMarkBurstDetonationPath('LEGENDARY',
        'burst_affliction_posture_spec','LEGENDARY'));
  }
  check(spread(rows)<=.20,'Common Twist balance exceeds 20%',rows);
  const apexSpreads=defs.map(t=>({id:t.id,spread:spread(apexRows.filter(r=>r.id.startsWith(t.id)))}));
  for(const row of apexSpreads)check(row.spread<=.25,'Apex balance exceeds 25%',row);
  for(const rank of SKILL_RARITY_ORDER){
    check(spread(rankRows.filter(r=>r.rank===rank&&!r.apex))<=.20,'Current-rank Twist balance failed',rank);
    for(const t of defs)check(spread(rankRows.filter(r=>r.rank===rank&&r.apex&&r.twist===t.id))<=.25,
      'Current-rank Apex balance failed',{rank,twist:t.id});
  }
  const sequence=defs[2],deliveryRows=[];
  for(const rank of SKILL_RARITY_ORDER){
    const c=compile(sequence,0,rank),long=compile(sequence,2,rank),sameDepth=compile(sequence,1,rank),
      primary=synthesizeMarkBurstDetonationPath('COMMON','burst_chain_focus_spec','COMMON',
        'burst_chain_focus_sequence_twist','COMMON','burst_chain_focus_sequence_twist_apex_1',rank),
      secondary=synthesizeMarkBurstDetonationPath('COMMON','burst_affliction_chain_spec','COMMON',
        'burst_affliction_chain_dense_twist','COMMON','burst_affliction_chain_dense_twist_apex_2',rank);
    deliveryRows.push({rank,sequence:c.hits,long:long.hits,primary:primary.hits,secondary:secondary.hits});
    check(long.hits===sameDepth.hits+1,'Long Sequence must add exactly one paid same-depth arrow',deliveryRows.at(-1));
  }
  const growth=key=>deliveryRows.at(-1)[key]-deliveryRows[0][key];
  check(growth('sequence')<growth('primary')&&growth('long')<growth('primary')&&
    growth('sequence')<=growth('secondary')&&growth('long')<=growth('secondary'),
    'Support arrows must scale below both Chain roles',{deliveryRows});
  openSkillLab();
  const fire=c=>{const old=Math.random;try{Math.random=()=>.999999;
      if(!performPlayerAction(c))throw new Error('Could not start '+c.activeAttributeRouteId);
      const action=boss.turnAction;actions++;while(action.hitIndex<action.hits)resolveTurnActionHit(action);return action;
    }finally{Math.random=old;}},
    start=(c,{bleed=0,later=bleed,broken=false,willBreak=false,ap=100,lastBreak=false}={})=>{
      startSkillLabCombat();applySkillLabPreset('clean',false);skillLabSession.forceCritical=false;
      boss.maxhp=boss.hp=1e9;boss.postureMax=1e6;boss.posture=willBreak?
        boss.postureMax-Math.max(.01,commandPostureDamage(c)*.5):0;
      boss.playerTurnBreak=broken;boss.mark=20;boss.bleed=bleed;boss.bleedLater=later;
      boss.ap=ap;boss.resolve=100;chainStacks=0;
      boss.criticalFocusLastAttack=lastBreak?{knight:{id:'other',route:'other',causedBreak:true}}:{};
      return fire(c);
    };
  for(const t of defs)for(let a=0;a<=4;a++){
    const c=compile(t,a),action=start(c,{bleed:2}),plan=commandMarkPlan(c,20),native=commandBleedAmount(c);
    check(boss.hp<boss.maxhp&&bossBleed()+bossBleedLater()+.0031>=4+native*2&&
      chainStacks===c.hits&&bossMark()===20-plan.consumedTotal&&action.consumedMark===plan.consumedTotal,
      'Actual action lost native payload',snap(c));
    check(action.bowTimeline.recipe.id===t.recipe&&action.bowTimeline.contacts.length===c.hits&&
      action.bowTimeline.releases.length===c.hits,'Bow contacts disagree with combat',t.id);
    action.t=.1;drawBowMechanicCue(action,action.bowTimeline,{from:{x:100,y:200},to:{x:300,y:200}});
    for(let depth=1;depth<=4;depth++)moveTreeSynthesisRarityByDepth[depth]='COMMON';
    const node=WEAPON_SKILL_PROTOTYPE_LAB_NODE_BY_SKILL_AND_ID.mark_burst[c.activeAttributeRouteId],
      preview=node&&moveTreeSynthesisPreviewCommand(node);
    check(preview&&preview.afflictionPosture.engine===c.afflictionPosture.engine&&preview.hits===c.hits,
      'Skill Lab preview lost mechanic/Delivery',snap(c));
  }
  const fresh=compile(defs[0]),deepFresh=compile(defs[0],1),fallback=compile(defs[0],2),
    heavy=compile(defs[0],3),toxic=compile(defs[0],4);
  let action=start(fresh),freshPosture=boss.posture;start(fresh,{bleed:4});const oldFreshPosture=boss.posture;
  check(freshPosture>oldFreshPosture,'Fresh Crack condition missing',{freshPosture,oldFreshPosture});
  start(deepFresh);const deepFreshPosture=boss.posture;
  check(deepFreshPosture>freshPosture,'Deep Crack missing',{deepFreshPosture,freshPosture});
  start(fallback,{bleed:4});const oldFallback=boss.posture;start(fallback);const newFallback=boss.posture;
  check(oldFallback>oldFreshPosture&&oldFallback<newFallback,'Old Scar fallback missing / too strong',
    {oldFallback,oldFreshPosture,newFallback});
  check(commandPostureDamage(heavy)>commandPostureDamage(fresh)&&commandBleedAmount(toxic)>commandBleedAmount(fresh),
    'Fresh Crack native Apex missing');
  const pressure=compile(defs[1]),deepPressure=compile(defs[1],1),fast=compile(defs[1],2),
    patient=compile(defs[1],3),toxicPressure=compile(defs[1],4);
  start(pressure,{willBreak:true});const breakNow=bossBleed(),breakLater=bossBleedLater();
  start(pressure);const slowNow=bossBleed(),slowLater=bossBleedLater();
  check(breakNow>slowNow&&slowLater>breakLater,'Pressure tick routing missing');
  start(deepPressure);const deepSlow=bossBleedLater();start(pressure);
  check(deepSlow>bossBleedLater(),'Deep Pressure missing');
  start(fast,{willBreak:true});const fastHp=boss.hp;start(pressure,{willBreak:true});
  check(fastHp<boss.hp,'Fast Leak immediate wound missing');
  start(patient);const patientLater=bossBleedLater();start(pressure);
  check(patientLater>bossBleedLater()&&commandBleedAmount(toxicPressure)>commandBleedAmount(pressure),
    'Patient/Toxic Pressure missing');
  const seq=compile(sequence),deepSeq=compile(sequence,1),longSeq=compile(sequence,2),
    closing=compile(sequence,3),toxicSeq=compile(sequence,4);
  action=start(seq);const seqPosture=action.postureApplied;
  check(action.hits>=2&&seqPosture>commandPostureDamage(seq),'Barbed Sequence wound-to-later-Posture missing');
  const deepSeqPosture=start(deepSeq).postureApplied,sequenceApexDetail={deepSeqPosture,seqPosture,
    longHits:longSeq.hits,baseHits:seq.hits,closingFirst:closing.postureContactPattern[0],
    closingLast:closing.postureContactPattern.at(-1),toxicBleed:commandBleedAmount(toxicSeq),
    baseBleed:commandBleedAmount(seq)};
  check(deepSeqPosture>seqPosture&&longSeq.hits>seq.hits&&
    closing.postureContactPattern.at(-1)>closing.postureContactPattern[0]&&
    commandBleedAmount(toxicSeq)>commandBleedAmount(seq),'Barbed Sequence Apex missing',sequenceApexDetail);
  const open=compile(defs[3]),deepOpen=compile(defs[3],1),last=compile(defs[3],2),
    follow=compile(defs[3],3),prep=compile(defs[3],4);
  start(open);const normalWound=bossBleed()+bossBleedLater();
  start(open,{broken:true});const brokenWound=bossBleed()+bossBleedLater();
  check(brokenWound>normalWound,'Open Armor Broken wound missing',{normalWound,brokenWound,
    openRate:open.afflictionPosture.open});
  start(deepOpen,{broken:true});const deepOpenWound=bossBleed()+bossBleedLater();
  start(last,{broken:true,ap:1});const lastApWound=bossBleed()+bossBleedLater();
  start(last,{broken:true});const lastNormalWound=bossBleed()+bossBleedLater();
  start(follow,{broken:true,lastBreak:true});const followBreakWound=bossBleed()+bossBleedLater();
  start(follow,{broken:true});const followNormalWound=bossBleed()+bossBleedLater();
  check(deepOpenWound>brokenWound&&lastApWound>lastNormalWound&&followBreakWound>followNormalWound,
    'Open Armor conditional Apex missing',{deepOpenWound,brokenWound,lastApWound,lastNormalWound,
      followBreakWound,followNormalWound});
  start(prep);const prepPosture=boss.posture;start(open);const openPosture=boss.posture;
  start(prep,{broken:true});const prepBrokenPosture=boss.posture;
  start(open,{broken:true});const openBrokenPosture=boss.posture;
  check(prepPosture>openPosture&&near(prepBrokenPosture,openBrokenPosture),
    'Preparation Tip condition missing',{prepPosture,openPosture,prepBrokenPosture,openBrokenPosture});
  return {passed:!failures.length,twists:4,apexes:16,cards,actions,spread:spread(rows),apexSpreads,
    identity:{passed:identity.passed,distinctCores:identity.distinctCores,
      maximumSimilarity:identity.maximumSimilarity,neighborSimilarity},deliveryRows,rows,failures};
})();
