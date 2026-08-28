/* F5 native motors only: 24 current-rank cards and 12 high-parent sentinels.
   Deterministic real contacts/two defense ticks; no ancestor Cartesian matrix. */
globalThis.__afflictionSpecsAudit=(()=>{
  const defs=MARK_BURST_AFFLICTION_SPEC_DEFINITIONS,form=MARK_BURST_ROUTE_BY_ID.affliction_primary_form,
    failures=[],rows=[],growth=[],rankRows=[],check=(ok,message,detail)=>{if(!ok)failures.push({message,detail});},
    near=(a,b)=>Math.abs(a-b)<.0031,
    compile=(id,rank='COMMON',parentRank='COMMON')=>
      synthesizeMarkBurstDetonationPath(parentRank,id,rank),
    snap=c=>({id:c.activeAttributeRouteId,direct:commandDirectDamageTotal(c),hits:c.hits,
      bleed:commandBleedAmount(c),detonation:c.markRule.damagePerMark,capacity:c.markDetonationCoreCapacity,
      crit:c.critChance||0,critPower:commandExpectedLocalCritPower(c),precision:c.critPrecisionGain||0,posture:c.posture||0,
      charge:commandDefenseTemperRate(c),score:stableEvolutionCombinedGuardrailValue(c)}),
    compare=(c,p,strongerFoundation=false)=>{const a=snap(c),b=snap(p);
      // A stronger pre-Crit Form raises the direct denominator. The later,
      // identically paid Secondary Crit keeps its absolute expected bonus, not
      // a free fixed percentage of the larger foundation. Current-rank chance
      // and immediate-parent stats are still checked independently.
      for(const key of ['direct','hits','bleed','detonation','capacity','critPower','precision','posture','charge',
        ...(strongerFoundation?['score']:['crit'])])
        check(a[key]+.0031>=b[key],'Parent/rank output regressed',{key,child:a,parent:b});
    },inspect=(c,r)=>{
      const s=snap(c),identity=c.synthesisIdentityAllocation,pure=r.secondaryAttributeId==='AFFLICTION',
        chain=r.secondaryAttributeId==='CHAIN',plan=commandMarkPlan(c,10000),
        receipts=c.synthesisQualityReceipts,timeline=buildBowActionTimeline(c,commandDeliveryContract(c),0,600,8);
      check(c.baseAttributeId==='DETONATION'&&c.primaryAttributeId==='AFFLICTION'&&
        c.secondaryAttributeId===r.secondaryAttributeId&&c.markGain===0,'Attribute identity drift',s);
      check(near(identity.primaryShare,pure?1:.70)&&near(identity.secondaryShare,pure?0:.30),
        '70/30 role split drift',s);
      for(const receipt of receipts)check(near(receipt.baseAttributePowerAllocation,receipt.powerBudget*.10)&&
        near(Object.values(receipt.powerAllocation).reduce((sum,n)=>sum+n,0),receipt.powerBudget),
        'Base share or receipt conservation drift',s);
      const last=receipts.at(-1),secondaryPaid=identity.secondaryAxes.reduce((sum,key)=>
        sum+(last.powerAllocation[key]||0),0)-(identity.secondaryAxes.includes(r.baseAttributeAxis)?
          last.baseAttributePowerAllocation:0);
      check(near(secondaryPaid,identity.secondaryPower),'Secondary receipt differs from declared allocation',s);
      check(s.bleed>0&&BLEED_STATUS.durationTicks===2&&!c.afflictionTickWeights&&
        !c.critAfflictionTickWeights&&!c.afflictionPerStartingChain&&!c.afflictionPerStartingMark&&
        !c.critBleed&&!c.breakPowerBonus&&!c.critDamageStatUnlocked&&!s.precision,
        'Specialization gained an unapproved relationship/stat',s);
      check(s.crit>=0&&s.crit<=1&&((s.crit>0)===(r.secondaryAttributeId==='CRITICAL')),
        'Local Crit ownership/range drift',s);
      check((s.posture>0)===(r.secondaryAttributeId==='POSTURE')&&
        (s.charge>0)===(r.secondaryAttributeId==='CHARGE'),'Secondary native output missing/leaked',s);
      check(!c.extraChainBonus&&!c.consumeChain&&totalCommandChainGain(c)===c.hits&&
        (chain?c.hits>=2&&c.deliveryPattern==='SEQUENTIAL':c.hits===1&&c.deliveryPattern==='SINGLE'),
        'Native Chain/contact contract drift',s);
      check(c.markRule.cap===c.markDetonationCoreCapacity&&plan.consumedTotal===s.capacity&&
        plan.consumedAtStart===s.capacity&&plan.markDamageByHit.slice(0,-1).every(n=>n===0)&&
        near(plan.markDamageByHit.at(-1),s.capacity*s.detonation),
        'Final uncapped Detonation package lost',s);
      check(timeline.recipe.id===MARK_BURST_DETONATION_SPEC_ANIMATION_BY_ID[r.id]&&
        timeline.contacts.length===c.hits&&timeline.releases.length===c.hits&&timeline.firstRelease>0,
        'Bow presentation does not match native contacts',s);
      if(chain){
        check(c.afflictionSplitPerContact&&near(Array.from({length:c.hits},(_,i)=>
          commandBleedContactAmount(c,0,i)).reduce((sum,n)=>sum+n,0),s.bleed),
          'Bleed packet duplicated/lost across arrows',s);
      }
    };
  let cards=0,actions=0;
  check(defs.length===6&&MARK_BURST_ROUTE_CONTRACTS.filter(r=>r.depth===2&&r.parentId===form.id).length===6,
    'F5 must expose exactly six Specializations');
  for(const def of defs){
    const r=MARK_BURST_ROUTE_BY_ID[def.id],parent=synthesizeMarkBurstFormRoute(form,'COMMON');
    let previous=null;
    for(const rank of SKILL_RARITY_ORDER){
      const c=compile(def.id,rank);cards++;inspect(c,r);compare(c,parent);
      if(previous)compare(c,previous);previous=c;
      rankRows.push({rank,...snap(c)});if(rank==='COMMON')rows.push(snap(c));
      const pure=compile('burst_affliction_focus_spec',rank);
      check(commandBleedAmount(pure)+.0031>=commandBleedAmount(c),'Pure Affliction lost wound leadership',snap(c));
      if(def.secondary==='CHAIN'){
        const primary=compile('burst_chain_focus_spec',rank);
        check(c.hits<primary.hits,'Secondary outgrew Primary Chain',{rank,secondary:c.hits,primary:primary.hits});
        growth.push({rank,secondary:c.hits,primary:primary.hits});
      }
    }
    for(const rank of ['COMMON','LEGENDARY']){
      const c=compile(def.id,rank,'LEGENDARY');cards++;inspect(c,r);
      compare(c,synthesizeMarkBurstFormRoute(form,'LEGENDARY'));compare(c,compile(def.id,rank),true);
    }
  }
  const values=rows.map(r=>r.score),spread=(Math.max(...values)-Math.min(...values))/Math.max(...values);
  check(spread<=.20,'F5 native sibling balance exceeds 20%',{spread,rows});
  const balance=SKILL_RARITY_ORDER.map(rank=>{
    const rs=rankRows.filter(row=>row.rank===rank),vs=rs.map(row=>row.score),
      gap=(Math.max(...vs)-Math.min(...vs))/Math.max(...vs);
    check(gap<=.20,'F5 current-rank sibling balance exceeds 20%',{rank,gap,rows:rs});
    return {rank,spread:Number(gap.toFixed(4))};
  });
  const detonation=rows.find(r=>r.id==='burst_affliction_detonation_spec');
  check(detonation.detonation>rows.find(r=>r.id==='burst_affliction_focus_spec').detonation&&
    detonation.capacity>1,'Secondary Detonation must grow potency and capacity',detonation);
  openSkillLab();
  for(const def of defs){
    for(let depth=1;depth<=4;depth++)moveTreeSynthesisRarityByDepth[depth]='COMMON';
    const node=WEAPON_SKILL_PROTOTYPE_LAB_NODE_BY_SKILL_AND_ID.mark_burst[def.id],
      preview=node&&moveTreeSynthesisPreviewCommand(node);
    check(preview&&preview.activeAttributeRouteId===def.id&&
      near(commandBleedAmount(preview),commandBleedAmount(compile(def.id))),
      'Specialization missing from Skill Lab preview',def.id);
  }
  const fire=(c,{mark=0,charge=0,chain=0,roll=.999999}={})=>{
    startSkillLabCombat();applySkillLabPreset('clean',false);skillLabSession.forceCritical=false;
    boss.hp=boss.maxhp=1e9;boss.posture=0;boss.postureMax=1e6;boss.mark=mark;
    boss.ap=boss.resolve=100;boss.charge=charge;boss.chargeEnabled=true;chainStacks=chain;
    const old=Math.random;try{Math.random=()=>roll;
      check(performPlayerAction(c),'F5 action did not start',c.activeAttributeRouteId);
      const action=boss.turnAction;actions++;
      while(action.hitIndex<action.hits)resolveTurnActionHit(action);
      check(action.bowTimeline.contacts.length===c.hits,'Runtime Bow lost contacts',c.activeAttributeRouteId);
      action.t=.1;drawBowMechanicCue(action,action.bowTimeline,{from:{x:100,y:200},to:{x:300,y:200}});
      drawBossBleedStatus(boss);
      return {damage:boss.maxhp-boss.hp,bleed:bossBleed(),later:bossBleedLater(),chain:chainStacks,
        mark:bossMark(),posture:boss.posture,charge:bossCharge(),critical:action.anyCritical};
    }finally{Math.random=old;}
  };
  for(const def of defs){
    const c=compile(def.id),result=fire(c),wound=commandBleedAmount(c);
    check(result.damage>0&&near(result.bleed,wound)&&near(result.later,wound)&&
      result.chain===c.hits&&result.mark===0,'Zero-setup action lost native output',{id:def.id,result});
    const startHp=boss.hp,startChain=chainStacks,startPosture=boss.posture;
    resolveBossPhaseBleed(false);resolveBossPhaseBleed(false);
    check(near(startHp-boss.hp,2*stableDamage(wound))&&bossBleed()===0&&bossBleedLater()===0&&
      chainStacks===startChain&&bossMark()===0&&boss.posture===startPosture,
      'Two Bleed ticks produced extra resources/damage',{id:def.id,damage:startHp-boss.hp,wound});
    const marked=fire(c,{mark:10000,chain:12});
    check(marked.mark===10000-c.markDetonationCoreCapacity&&near(marked.bleed,wound)&&
      near(marked.later,wound)&&marked.chain===12+c.hits,'Starting Mark/Chain changed native wound',def.id);
  }
  const crit=compile('burst_affliction_critical_spec'),normal=fire(crit,{mark:20}),
    critical=fire(crit,{mark:20,roll:0});
  check(!normal.critical&&critical.critical&&critical.damage>normal.damage&&
    near(normal.bleed,critical.bleed)&&normal.mark===critical.mark&&near(critical.damage-normal.damage,
      stableDamage(commandDirectDamageTotal(crit)*crit.critDamageMultiplier)-stableDamage(commandDirectDamageTotal(crit))),
    'Crit multiplied Bleed/Detonation or failed direct payoff',{normal,critical});
  const charged=compile('burst_affliction_charge_spec'),empty=fire(charged),full=fire(charged,{charge:12});
  check(full.charge===0&&full.damage>empty.damage&&near(full.bleed,empty.bleed)&&
    commandChargeMode(charged)==='FULL_RELEASE'&&near(full.damage-empty.damage,
      12*commandDefenseTemperRate(charged)),'Charge was capped, delayed or multiplied Bleed',{empty,full});
  return {passed:!failures.length,specializations:defs.length,cards,actions,spread:Number(spread.toFixed(4)),
    growth,balance,rows,failures};
})();
