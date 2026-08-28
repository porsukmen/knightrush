/* Scoped F4S4 audit: current-rank ladders and deterministic actions only. */
globalThis.__criticalFocusAudit=(()=>{
  const defs=MARK_BURST_CRITICAL_FOCUS_TWIST_DEFINITIONS,failures=[],rows=[],apexRows=[];
  const check=(ok,message,detail)=>{if(!ok)failures.push({message,detail});},
    compile=(t,rank='COMMON',a=0)=>synthesizeMarkBurstDetonationPath('COMMON',
      'burst_critical_focus_spec','COMMON',t.id,a?'COMMON':rank,a?t.id+'_apex_'+a:null,rank),
    snap=c=>({id:c.activeAttributeRouteId,direct:commandDirectDamageTotal(c),hits:c.hits,
      chance:c.critChance,precision:c.critPrecisionGain,multiplier:c.critDamageMultiplier,
      capacity:c.markDetonationCoreCapacity,detonation:c.markRule.damagePerMark,
      score:stableEvolutionCombinedGuardrailValue(c)}),
    compare=(c,p)=>{const a=snap(c),b=snap(p);
      for(const key of ['direct','hits','chance','precision','multiplier','capacity','detonation','score'])
        check(a[key]+1e-5>=b[key],a.id+' regressed '+key,{child:a,parent:b});
    },spread=rs=>{const v=rs.map(r=>r.score);return (Math.max(...v)-Math.min(...v))/Math.max(...v);};
  let cards=0;
  for(const route of MARK_BURST_ROUTE_CONTRACTS){
    if(route.primaryAttributeId!=='CRITICAL'||route.secondaryAttributeId!=='CRITICAL')
      check(!(route.qualityProfile.CRIT_POWER>0),'Non-pure authored Crit Damage leak',route.id);
  }
  const form=MARK_BURST_ROUTE_BY_ID.critical_primary_form,specs=MARK_BURST_ROUTE_CONTRACTS.filter(
    r=>r.depth===2&&r.parentId===form.id);
  for(const rank of SKILL_RARITY_ORDER){
    const base=synthesizeMarkBurstFormRoute(form,rank);
    check(!base.critDamageStatUnlocked&&!base.synthesisCritAuthoredPower,'Form unlocked Crit Damage');
    for(const spec of specs){
      const c=synthesizeMarkBurstDetonationPath('COMMON',spec.id,rank);cards++;
      check(c.critDamageStatUnlocked===(spec.secondaryAttributeId==='CRITICAL'),
        'Wrong stat unlock',spec.id);
      check(c.critChance<=1&&c.critPrecisionGain<=1,'Probability ceiling violated',snap(c));
      if(spec.secondaryAttributeId!=='CRITICAL')check(!c.synthesisCritAuthoredPower,
        'Mixed spec paid generic Crit Damage',snap(c));
    }
  }
  const parent=synthesizeMarkBurstDetonationPath('COMMON','burst_critical_focus_spec','COMMON');
  check(defs.length===4&&defs.every(t=>t.apexes.length===4),'Expected 4 Twists / 16 Apex');
  for(const t of defs){
    const common=compile(t);compare(common,parent);rows.push(snap(common));
    for(let a=0;a<=4;a++){
      let previous=null;
      for(const rank of SKILL_RARITY_ORDER){
        const c=compile(t,rank,a);cards++;
        if(a)compare(c,common);if(previous)compare(c,previous);previous=c;
        check(c.critFocus&&c.critDamageStatUnlocked&&c.markGain===0&&!c.posture&&
          !c.breakPowerBonus&&!c.extraChainBonus&&c.animationRecipeId===t.recipe,
          'Pure Critical identity or animation drift',snap(c));
        check(c.markRule.cap===c.markDetonationCoreCapacity&&c.markDetonationHitIndex===c.hits-1,
          'Final uncapped Base Detonation lost',snap(c));
        check(totalCommandChainGain(c)===(t.key==='packet'?1:c.hits),'Chain/contact truth failed',snap(c));
        if(a&&rank==='COMMON')apexRows.push(snap(c));
        const chain=synthesizeMarkBurstDetonationPath('COMMON','burst_critical_chain_spec','COMMON',
          'burst_critical_chain_flow_twist',a?'COMMON':rank,
          a?'burst_critical_chain_flow_twist_apex_1':null,rank);
        if(t.key==='sequence'||t.key==='cascade')check(c.hits<chain.hits,
          'Pure Crit contact density reached Chain route',{pure:snap(c),chain:snap(chain)});
      }
    }
  }
  check(spread(rows)<=.25,'Twist spread exceeds 25%',rows);
  for(const t of defs)check(spread(apexRows.filter(r=>r.id.startsWith(t.id)))<=.25,
    'Apex spread exceeds 25%',t.id);
  openSkillLab();let actions=0;
  const fire=(c,roll=0)=>{
    const old=Math.random;try{Math.random=()=>roll;check(performPlayerAction(c),'Action failed to start',c.activeAttributeRouteId);}
    finally{Math.random=old;}
    actions++;const action=boss.turnAction;
    while(action.hitIndex<action.hits)resolveTurnActionHit(action);
    return action;
  },start=(c,{roll=0,precision=.4,mark=8,missing=0}={})=>{
    startSkillLabCombat();applySkillLabPreset('clean',false);
    boss.maxhp=1e9;boss.hp=1e9*(1-missing);boss.mark=mark;boss.posture=0;boss.postureMax=1e6;
    boss.ap=boss.resolve=100;skillLabSession.forceCritical=false;
    const key=commandCritKey(c,'knight');if(key)skillCritPrecision.set(key,precision);
    return fire(c,roll);
  },again=(c,roll=0)=>{boss.phase='player';boss.turnAction=null;boss.ap=boss.resolve=100;return fire(c,roll);};
  for(const t of defs)for(let a=0;a<=4;a++){
    const c=compile(t,'COMMON',a),action=start(c);
    check(boss.hp<boss.maxhp&&chainStacks===(t.key==='packet'?1:action.hits)&&
      action.consumedMark===commandMarkPlan(c,8).consumedTotal,'Real action lost payload',snap(c));
  }
  const cascade=compile(defs[2]),missCascade={...cascade,critChance:.1,critPrecisionGain:.1};
  let action=start(missCascade,{roll:.99,precision:0});
  check(action.hits===1&&chainStacks===1&&action.consumedMark===cascade.markRule.cap,
    'First miss lost Base Detonation or created hidden contacts');
  check(commandHitBase(action.command,0)>=commandDirectDamageTotal(parent),'Cascade lost inherited first hit');
  const hundred={...cascade,critChance:1};action=start(hundred,{precision:0});
  check(action.hits===cascade.hits,'100% Crit did not finish the finite paid plan');
  const packet=compile(defs[3]),key=commandCritKey(packet,'knight');let rolls=0;
  skillCritPrecision.set(key,0);
  const plan=createCommandCritPlan({...packet,critChance:.1,critPrecisionGain:.2},'knight',()=>{rolls++;return .99;});
  plan.contacts.forEach((_,i)=>commitCommandCritContact(plan,i));
  check(rolls===1&&skillCritPrecision.get(key)===.2,'Packet rolled or updated Precision per pellet');
  let cascadeRolls=0;
  skillCritPrecision.set(commandCritKey(missCascade,'knight'),0);
  const stopPlan=createCommandCritPlan(missCascade,'knight',()=>{cascadeRolls++;return .99;});
  check(cascadeRolls===1&&stopPlan.contacts.length===1,'Cascade rolled hidden future arrows');
  const rotated=compile(defs[0],'COMMON',4);action=start(rotated);
  check(!action.command.critFocusContext.alternate,'Fresh encounter granted rotation bonus');
  again(fightCommand('knight'));action=again(rotated);
  check(action.command.critFocusContext.alternate,'Different attack did not enable rotation');
  const repeat=compile(defs[2],'COMMON',4);start({...repeat,critChance:1});action=again({...repeat,critChance:1});
  check(action.command.critFocusContext.repeat,'Complete Crit series did not prime immediate repeat');
  again(fightCommand('knight'));action=again({...repeat,critChance:1});
  check(!action.command.critFocusContext.repeat,'Repeat bonus survived an intervening attack');
  const retain=compile(defs[1],'COMMON',3);action=start(retain,{precision:.6});
  check(skillCritPrecision.get(action.critPlan.key)>0&&skillCritPrecision.get(action.critPlan.key)<=.6,
    'Retention did not preserve finite existing Precision');
  action=start(retain,{precision:0});check(skillCritPrecision.get(action.critPlan.key)===0,'Retention created Precision');
  const verdict=compile(defs[1]);action=start({...verdict,critChance:1},{precision:0});
  check(criticalFocusContactBonus(action.command,action.critPlan,0)>0,'Guaranteed Crit killed Precision investment');
  const recovery=compile(defs[0],'COMMON',3),crit={critical:true,roll:0,naturalChance:.3,precisionBefore:0},
    miss={...crit,critical:false,roll:.9},fake={startingPrecision:0,contacts:[miss,crit,crit]};
  check(criticalFocusContactBonus(recovery,fake,1)>criticalFocusContactBonus(recovery,fake,2),
    'Recovery did not reward only first Crit after first miss');
  const natural=compile(defs[3],'COMMON',3),noAssist={startingPrecision:.4,contacts:[crit]},
    assist={...noAssist,contacts:[{...crit,roll:.5}]};
  check(criticalFocusContactBonus(natural,noAssist,0)>criticalFocusContactBonus(natural,assist,0),
    'Natural Crit bonus also paid Precision-assisted Crit');
  const execute=compile(defs[3],'COMMON',4);action=start(execute,{missing:.8});
  check(action.command.critFocusContext.missingHealth===.8,'Missing-health snapshot failed');
  const full=start(execute,{missing:0});
  check(criticalFocusContactBonus(action.command,action.critPlan,0,action.command.critFocusContext)>
    criticalFocusContactBonus(full.command,full.critPlan,0,full.command.critFocusContext),'Execution Apex is inert');
  return {passed:failures.length===0,cards,actions,twists:4,apexes:16,twistSpread:spread(rows),rows,failures};
})();
