/* Scoped F4S5: 80 active-rank cards, four high-ancestor sentinels, deterministic
   contact/state scenarios. No Cartesian ancestor matrix or browser sweep. */
globalThis.__criticalAfflictionAudit=(()=>{
  const defs=MARK_BURST_CRITICAL_AFFLICTION_TWIST_DEFINITIONS,failures=[],rows=[],apexRows=[];
  const check=(ok,message,detail)=>{if(!ok)failures.push({message,detail});},
    // Runtime rounds at each application to .001; authoring coefficients keep
    // more decimals. Allow one combat quantum for the two application steps.
    near=(a,b)=>Math.abs(a-b)<.0011,
    compile=(t,rank='COMMON',a=0)=>synthesizeMarkBurstDetonationPath('COMMON',
      'burst_critical_affliction_spec','COMMON',t.id,a?'COMMON':rank,a?t.id+'_apex_'+a:null,rank),
    snap=c=>({id:c.activeAttributeRouteId,direct:commandDirectDamageTotal(c),hits:c.hits,
      bleed:commandBleedAmount(c),chance:c.critChance,precision:c.critPrecisionGain,
      multiplier:c.critDamageMultiplier,capacity:c.markDetonationCoreCapacity,
      detonation:c.markRule.damagePerMark,score:stableEvolutionCombinedGuardrailValue(c)}),
    compare=(c,p)=>{const a=snap(c),b=snap(p);
      for(const key of ['direct','hits','bleed','chance','precision','multiplier','capacity','detonation','score'])
        check(a[key]+1e-5>=b[key],a.id+' regressed '+key,{child:a,parent:b});
    },spread=rs=>{const values=rs.map(r=>r.score);return (Math.max(...values)-Math.min(...values))/Math.max(...values);};
  let cards=0,actions=0;
  const parent=synthesizeMarkBurstDetonationPath('COMMON','burst_critical_affliction_spec','COMMON');
  check(defs.length===4&&defs.every(t=>t.apexes.length===4),'Expected 4 Twists / 16 Apex');
  for(const t of defs){
    const common=compile(t);compare(common,parent);rows.push(snap(common));
    const route=MARK_BURST_ROUTE_BY_ID[t.id];
    check(route.twistIdentity&&route.stableCausality,'Missing authored identity',t.id);
    check(t.apexes.some(a=>APEX_MEANINGFUL_DECISION_CLASSES.has(a.decisionClass)),
      'Family lacks a plan-changing Apex',t.id);
    for(let a=0;a<=4;a++){
      let previous=null;
      for(const rank of SKILL_RARITY_ORDER){
        const c=compile(t,rank,a);cards++;
        if(a)compare(c,common);if(previous)compare(c,previous);previous=c;
        check(c.critBleed&&!c.critDamageStatUnlocked&&!c.synthesisCritAuthoredPower&&
          c.markGain===0&&!c.posture&&!c.breakPowerBonus&&!c.extraChainBonus&&
          c.animationRecipeId===t.recipe&&c.critChance<=1&&c.critPrecisionGain<=1,
          'Mixed identity or animation drift',snap(c));
        check(c.markRule.cap===c.markDetonationCoreCapacity&&c.markDetonationHitIndex===c.hits-1,
          'Final uncapped Base Detonation lost',snap(c));
        check(totalCommandChainGain(c)===c.hits,'Hidden Chain/contact gain',snap(c));
        const authored=MARK_BURST_ROUTE_BY_ID[c.activeAttributeRouteId];
        check(!authored.qualityProfile.CRIT_POWER&&near(Object.values(authored.qualityProfile)
          .reduce((sum,n)=>sum+n,0),1),'Quality profile leak',authored.id);
        if(a)check(authored.apexDesign.version===2&&authored.apexDesign.runtimeEvidence.length>=3,
          'Missing Apex V2 evidence',authored.id);
        if(a&&rank==='COMMON')apexRows.push(snap(c));
        if(t.key==='volley'){
          check(c.hits>=2,'Salvo cannot buy its second real arrow',snap(c));
          const chain=synthesizeMarkBurstDetonationPath('COMMON','burst_critical_chain_spec','COMMON',
            'burst_critical_chain_flow_twist',a?'COMMON':rank,
            a?'burst_critical_chain_flow_twist_apex_1':null,rank);
          check(c.hits<chain.hits,'Affliction density reached Chain route',{bleed:snap(c),chain:snap(chain)});
          check(c.afflictionSplitPerContact&&near(Array.from({length:c.hits},(_,i)=>
            commandBleedContactAmount(c,0,i)).reduce((s,n)=>s+n,0),commandBleedAmount(c)),
            'Base wound copied per contact',snap(c));
        }
      }
    }
    const high=SKILL_RARITY_ORDER[SKILL_RARITY_ORDER.length-1],
      highParent=synthesizeMarkBurstDetonationPath(high,'burst_critical_affliction_spec',high),
      highChild=synthesizeMarkBurstDetonationPath(high,'burst_critical_affliction_spec',high,t.id,'COMMON');
    cards++;compare(highChild,highParent);
  }
  check(spread(rows)<=.25,'Twist spread exceeds 25%',rows);
  for(const t of defs)check(spread(apexRows.filter(r=>r.id.startsWith(t.id)))<=.25,
    'Apex spread exceeds 25%',t.id);
  openSkillLab();
  const finish=action=>{while(action.hitIndex<action.hits)resolveTurnActionHit(action);return action;},
    fire=(c,roll=0,defer=false)=>{
      const old=Math.random;try{Math.random=()=>roll;check(performPlayerAction(c),'Action failed to start',c.activeAttributeRouteId);}
      finally{Math.random=old;}
      actions++;return defer?boss.turnAction:finish(boss.turnAction);
    },start=(c,{roll=0,precision=0,bleed=0,later=bleed,defer=false}={})=>{
      startSkillLabCombat();applySkillLabPreset('clean',false);
      boss.maxhp=boss.hp=1e9;boss.posture=0;boss.postureMax=1e6;boss.mark=8;
      boss.ap=boss.resolve=100;boss.bleed=bleed;boss.bleedLater=later;skillLabSession.forceCritical=false;
      const key=commandCritKey(c,'knight');if(key)skillCritPrecision.set(key,precision);
      return fire(c,roll,defer);
    },again=(c,roll=0)=>{boss.phase='player';boss.turnAction=null;boss.ap=boss.resolve=100;return fire(c,roll);};
  for(const t of defs)for(let a=0;a<=4;a++){
    const c=compile(t,'COMMON',a),action=start(c);
    check(boss.hp<boss.maxhp&&boss.bleed+.001>=commandBleedAmount(c)&&near(boss.bleed,boss.bleedLater)&&
      chainStacks===action.hits&&action.consumedMark===commandMarkPlan(c,8).consumedTotal,
      'Real action lost payload',snap(c));
    check(action.bowTimeline&&action.bowTimeline.recipe.id===t.recipe&&
      action.bowTimeline.firstRelease>0,'Bow timeline missing',t.id);
    action.t=.1;drawBowMechanicCue(action,action.bowTimeline,{from:{x:100,y:200},to:{x:300,y:200}});
    drawBossBleedStatus(boss);
  }
  const crit={critical:true,roll:0,naturalChance:.25},miss={...crit,critical:false,roll:.99},
    natural=compile(defs[0],'COMMON',2),first=compile(defs[0],'COMMON',3),
    wound=compile(defs[0],'COMMON',4);
  check(criticalBleedContactBonus(natural,crit,0)>criticalBleedContactBonus(natural,
    {...crit,roll:.5},0),'Natural bonus paid assisted Crit');
  check(criticalBleedContactBonus(first,crit,0,0,{bleed:0})>
    criticalBleedContactBonus(first,crit,0,0,{bleed:6}),'First Blood ignored starting wound');
  let action=start(wound,{roll:.99});
  check(!action.anyCritical&&near(boss.bleed,commandBleedAmount(wound)+wound.critBleed.noncrit),
    'Non-Crit wound fallback failed');
  check(wound.critBleed.noncrit>0&&wound.critBleed.noncrit<wound.critBleed.wound,'Fallback exceeds Crit wound');
  const volley=compile(defs[1]),opening=compile(defs[1],'COMMON',4),final=compile(defs[1],'COMMON',3);
  action=start(volley,{defer:true});
  skillCritPrecision.set(action.critPlan.key,0);let rollIndex=0;
  action.critPlan=createCommandCritPlan({...action.command,critChance:.25,critPrecisionGain:.1},
    'knight',()=>rollIndex++===0?0:.99);
  resolveTurnActionHit(action);
  check(!action.criticalBleedBonus&&near(boss.bleed,commandBleedContactAmount(volley,8,0)),
    'Opening Crit strengthened its own wound');
  finish(action);
  check(near(action.criticalBleedBonus,volley.critBleed.prior*(volley.hits-1)),
    'Prior Crit wound feedback lost or doubled');
  const second=action.critPlan.contacts[1];
  check(second&&second.precisionAfter>second.precisionBefore,
    'Salvo non-Crit did not gain live Precision');
  check(criticalBleedContactBonus(opening,miss,1,1,{bleed:6})>
    criticalBleedContactBonus(opening,miss,1,1,{bleed:0})&&
    criticalBleedContactBonus(opening,crit,0,0,{bleed:6})===0,'Bloody Opening timing wrong');
  check(criticalBleedContactBonus(final,crit,final.hits-1,0)>0&&
    criticalBleedContactBonus(final,miss,final.hits-1,0)===0,'Final Cut requires its own Crit');
  const trace=compile(defs[2]),handoff=compile(defs[2],'COMMON',2),reveal=compile(defs[2],'COMMON',3),
    reliable=compile(defs[2],'COMMON',4),other=synthesizeSharpshootCriticalPath('COMMON');
  action=start(trace);let stored=boss.criticalBleedTrace;
  check(!action.criticalBleedTraceConsumed&&near(boss.bleed,commandBleedAmount(trace))&&stored.amount>0,
    'Trace consumed itself or applied early');
  const beforeChain=chainStacks,beforePrecision=skillCritPrecision.get(action.critPlan.key);
  resolveBossPhaseBleed(false);
  check(boss.criticalBleedTrace===stored&&chainStacks===beforeChain&&
    skillCritPrecision.get(action.critPlan.key)===beforePrecision,'Tick consumed trace or changed Crit/Chain');
  action=again(trace);
  check(near(action.criticalBleedTraceConsumed,stored.amount)&&near(boss.criticalBleedTrace.amount,stored.amount),
    'Same skill failed to consume or recursively grew trace');
  action=again(fightCommand('knight'));
  check(near(action.criticalBleedTraceConsumed,stored.amount)&&!boss.criticalBleedTrace,'Trace did not clear once');
  action=again(fightCommand('knight'));check(!action.criticalBleedTraceConsumed,'Trace consumed twice');
  start(handoff);stored=boss.criticalBleedTrace;action=again(other);
  check(other.skill===true&&near(action.criticalBleedTraceConsumed,stored.amount+stored.differentSkillBonus),
    'Different skill did not receive handoff');
  start(handoff);stored=boss.criticalBleedTrace;action=again(fightCommand('knight'));
  check(near(action.criticalBleedTraceConsumed,stored.amount),'Fight incorrectly received different-skill bonus');
  start(reveal);stored=boss.criticalBleedTrace;action=again({...other,critChance:1});
  check(near(action.criticalBleedTraceConsumed,stored.amount+stored.criticalBonus),'Consuming Crit did not reveal trace');
  start(reveal);stored=boss.criticalBleedTrace;action=again({...other,critChance:0,critPrecisionGain:0},.99);
  check(near(action.criticalBleedTraceConsumed,stored.amount),'Non-Crit received reveal bonus');
  start(reliable,{roll:.99});
  check(boss.criticalBleedTrace&&near(boss.criticalBleedTrace.amount,reliable.critBleed.noncrit)&&
    boss.criticalBleedTrace.amount<reliable.critBleed.trace,'Non-Crit trace fallback failed');
  applySkillLabPreset('clean',false);check(!boss.criticalBleedTrace,'Preset retained trace');
  start(trace);startSkillLabCombat();check(!boss.criticalBleedTrace,'Encounter retained trace');
  const hunt=compile(defs[3]),fresh=compile(defs[3],'COMMON',2),last=compile(defs[3],'COMMON',3),
    follow=compile(defs[3],'COMMON',4);
  action=start(hunt);
  const cleanHuntDamage=boss.maxhp-boss.hp;
  check(boss.bleed>0&&action.command.critBleedContext.bleed===0&&
    criticalBleedHuntBonus(action.command,crit,action.command.critBleedContext)===0,
    'Hunter read its own new wound');
  action=start(hunt,{bleed:6});
  check(boss.maxhp-boss.hp>cleanHuntDamage,'Hunter helper did not reach real direct damage');
  check(near(action.command.critBleedContext.bleed,6)&&near(boss.bleed,6+commandBleedAmount(hunt)),
    'Hunter consumed or changed starting wound');
  check(criticalBleedHuntBonus(hunt,miss,{bleed:6})===0&&
    criticalBleedHuntBonus(hunt,crit,{bleed:6})>0,'Hunter not conditional on direct Crit');
  check(criticalBleedHuntBonus(fresh,crit,{bleed:0})>0,'Fresh Hunt inert');
  action=start(last,{bleed:6,later:0});
  check(action.command.critBleedContext.lastTick&&criticalBleedHuntBonus(last,crit,action.command.critBleedContext)>
    criticalBleedHuntBonus(last,crit,{bleed:6,lastTick:false}),'Last Pulse did not snapshot final tick');
  start(follow,{bleed:6});again(fightCommand('knight'));action=again(follow);
  check(action.command.critBleedContext.alternate,'Follow-up lost different-attack window');
  action=again(follow);check(!action.command.critBleedContext.alternate,'Repeated attack kept follow-up window');
  const small=criticalBleedHuntBonus(hunt,crit,{bleed:6}),large=criticalBleedHuntBonus(hunt,crit,{bleed:6000});
  check(Number.isFinite(large)&&near(large,small*1000),'Hunter has a hidden wound cap');
  return {passed:failures.length===0,cards,actions,twists:4,apexes:16,twistSpread:spread(rows),rows,failures};
})();
