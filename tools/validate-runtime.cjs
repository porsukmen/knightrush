const fs=require('node:fs');
const vm=require('node:vm');

const file=process.argv[2]||'KnightRush.html';
const html=fs.readFileSync(file,'utf8');
const match=html.match(/<script>([\s\S]*?)<\/script>/i);
if(!match)throw new Error(`No inline script in ${file}`);

const noop=()=>{};
const gradient={addColorStop:noop};
const context2d=new Proxy({}, {
  get(target,key){
    if(key==='measureText')return text=>({width:String(text||'').length*8});
    if(key==='createLinearGradient'||key==='createRadialGradient')return ()=>gradient;
    if(key==='getImageData')return ()=>({data:new Uint8ClampedArray(4),width:1,height:1});
    if(key==='createImageData')return (width=1,height=1)=>
      ({data:new Uint8ClampedArray(width*height*4),width,height});
    if(key==='canvas')return canvas;
    return target[key]===undefined?noop:target[key];
  },
  set(target,key,value){target[key]=value;return true;}
});
const canvas={width:480,height:800,style:{},dataset:{},getContext:()=>context2d,
  addEventListener:noop,removeEventListener:noop,setPointerCapture:noop,
  getBoundingClientRect:()=>({left:0,top:0,width:480,height:800})};
const root={dataset:{},style:{},clientWidth:480,clientHeight:800};
const document={documentElement:root,hidden:false,hasFocus:()=>true,addEventListener:noop,
  getElementById:id=>id==='game'?canvas:{style:{},offsetHeight:0},
  createElement:tag=>tag==='canvas'?{...canvas,dataset:{},style:{}}:{style:{},dataset:{}}};
const storage={getItem:()=>null,setItem:noop,removeItem:noop};
const sandbox={console,document,localStorage:storage,navigator:{userAgent:'runtime-validator',
    maxTouchPoints:0},performance:{now:()=>0},devicePixelRatio:1,innerWidth:480,innerHeight:800,
  requestAnimationFrame:()=>1,cancelAnimationFrame:noop,setTimeout,clearTimeout,
  Uint8ClampedArray,Math,Date,JSON,Map,Set,WeakMap,Object,Array,Number,String,Boolean,RegExp,
  Error,TypeError,RangeError,Promise,Infinity,NaN};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
sandbox.addEventListener=noop;sandbox.removeEventListener=noop;sandbox.close=noop;
sandbox.visualViewport=null;sandbox.AudioContext=function(){};sandbox.webkitAudioContext=function(){};

try{
  const source=match[1]+`\n;globalThis.__runtimeAudit=typeof SHARPSHOOT_MARK_MATERIALIZATION_AUDIT==='undefined'?null:
    SHARPSHOOT_MARK_MATERIALIZATION_AUDIT;
  globalThis.__twistBalanceAudit=typeof SHARPSHOOT_TWIST_PLAYTHROUGH_AUDIT==='undefined'?null:
    SHARPSHOOT_TWIST_PLAYTHROUGH_AUDIT;
  globalThis.__focusMechanicAudit=(()=>{
    const pulse=synthesizeSharpshootMarkPath('COMMON','mark_focus_spec','COMMON',
        'mark_focus_pulse_twist','COMMON'),
      bloom=synthesizeSharpshootMarkPath('COMMON','mark_focus_spec','COMMON',
        'mark_focus_bloom_twist','COMMON'),
      trail=synthesizeSharpshootMarkPath('COMMON','mark_focus_spec','COMMON',
        'mark_focus_trail_twist','COMMON'),timeline=buildMarkPulseTimeline(pulse,1),savedBoss=boss;
    boss={mark:0,phase:'player',playerMarkTrailPerContact:0};
    for(const amount of pulse.markPulsePattern)applyBossMarkEvent(amount,'MARK_PULSE');
    const pulseMark=boss.mark,pulseEvents=pulse.markPulsePattern.length,
      bloomFromEight=commandBloomMarkGain(bloom,8),installed=installPlayerMarkTrail(trail),
      firstTrail=applyPlayerMarkTrailEvent(),secondTrail=applyPlayerMarkTrailEvent();
    clearPlayerMarkTrail();const cleared=boss.playerMarkTrailPerContact,
      hugeBloom=commandBloomMarkGain({markBloomRate:.125},3000000000);
    boss.mark=0;const hugeMark=applyBossMarkEvent(3000000000,'UNBOUNDED_AUDIT');boss=savedBoss;
    return {pulseMark,pulseEvents,pulseTimelineEvents:timeline.times.length,bloomFromEight,
      installed,firstTrail,secondTrail,cleared,hugeBloom,hugeMark};
  })();
  globalThis.__focusScaleAudit=(()=>{
    const rarities=['COMMON','UNCOMMON','RARE','LEGENDARY'],focusIds=[
      'mark_focus_concentrated_twist','mark_focus_pulse_twist',
      'mark_focus_bloom_twist','mark_focus_trail_twist'],chainIds=[
      'mark_chain_direct_twist','mark_chain_converter_twist',
      'mark_chain_echo_twist','mark_chain_shotgun_twist'],make=(specId,twistId,rarity)=>
        synthesizeSharpshootMarkPath(rarity,specId,rarity,twistId,rarity),describe=command=>{
          const play=stableEvolutionPlaythroughVector(command);
          return {quality:command.synthesisQuality,effectiveQuality:command.synthesisEffectiveQuality,
            damage:Number(commandDirectDamageTotal(command).toFixed(3)),mark:command.markGain,
            hits:command.hits,chain:totalCommandChainGain(command),
            chainRate:Number((command.extraChainBonus||0).toFixed(4)),
            pulses:(command.markPulsePattern||[]).length,
            bloomRate:Number((command.markBloomRate||0).toFixed(4)),
            trail:command.phaseMarkTrailPerContact||0,
            score:Number(stableEvolutionCombinedGuardrailValue(command).toFixed(3)),
            play:play.averageContribution,endMark:play.endMark,totalDamage:play.totalDamage};
        },uniform=rarities.map(rarity=>({rarity,
          focus:focusIds.map(id=>({id,...describe(make('mark_focus_spec',id,rarity))})),
          chain:chainIds.map(id=>({id,...describe(make('mark_chain_spec',id,rarity))}))})),
        histories=[];
    for(const formRarity of rarities)for(const specRarity of rarities)
      for(const twistRarity of rarities){
        const focus=focusIds.map(id=>synthesizeSharpshootMarkPath(formRarity,'mark_focus_spec',
            specRarity,id,twistRarity)),chain=chainIds.map(id=>synthesizeSharpshootMarkPath(
            formRarity,'mark_chain_spec',specRarity,id,twistRarity)),
          focusMean=focus.reduce((sum,command)=>sum+
            stableEvolutionCombinedGuardrailValue(command),0)/focus.length,
          chainMean=chain.reduce((sum,command)=>sum+
            stableEvolutionCombinedGuardrailValue(command),0)/chain.length,
          focusPlayMean=focus.reduce((sum,command)=>sum+
            stableEvolutionPlaythroughVector(command).averageContribution,0)/focus.length,
          chainPlayMean=chain.reduce((sum,command)=>sum+
            stableEvolutionPlaythroughVector(command).averageContribution,0)/chain.length;
        histories.push({formRarity,specRarity,twistRarity,
          scoreRatio:Number((focusMean/chainMean).toFixed(4)),
          playRatio:Number((focusPlayMean/chainPlayMean).toFixed(4))});
      }
    return {uniform,histories};
  })();
  globalThis.__pureRarityExpressionAudit=(()=>{
    const rarities=['COMMON','UNCOMMON','RARE','LEGENDARY'],twists=[
      'mark_focus_concentrated_twist','mark_focus_pulse_twist',
      'mark_focus_bloom_twist','mark_focus_trail_twist'];
    return twists.map(twistId=>({twistId,rows:rarities.map(rarity=>{
      const command=synthesizeSharpshootMarkPath('COMMON','mark_focus_spec','COMMON',
        twistId,rarity),actual=command.synthesisRarityDirectExpressionPower||0,
        desired=command.synthesisRarityDirectExpressionDesiredPower||0;
      if(actual<-.0001||actual>desired+.0001||
         command.synthesisAxisReserve.MARK_GAIN.rank!==command.synthesisRarityExpressionRawMarkRank)
        throw new Error(twistId+' pure rarity expression crossed a Mark threshold at '+rarity);
      return {rarity,damage:Number(commandDirectDamageTotal(command).toFixed(3)),
        mark:command.markGain||0,actual,desired,
        reserve:command.synthesisAxisReserve.MARK_GAIN.reserve};
    })}));
  })();
  globalThis.__chainDisplayAudit=(()=>{
    const rarities=['COMMON','UNCOMMON','RARE','LEGENDARY'],routes=
      SHARPSHOOT_MARK_ROUTE_CONTRACTS.filter(route=>{
        let current=route;
        while(current&&current.id!=='mark_chain_spec')current=
          current.parentId&&SHARPSHOOT_MARK_ROUTE_BY_ID[current.parentId];
        return !!current&&route.runtimeReadiness==='MATERIALIZED';
      });
    let ladders=0,comparisons=0,minDamageDelta=Infinity,minChainDelta=Infinity;
    const commandFor=(route,history,rank)=>{
      if(route.depth===2)return synthesizeSharpshootMarkPath(history[0],route.id,rank);
      if(route.depth===3)return synthesizeSharpshootMarkPath(history[0],route.parentId,
        history[1],route.id,rank);
      const twist=SHARPSHOOT_MARK_ROUTE_BY_ID[route.parentId];
      return synthesizeSharpshootMarkPath(history[0],twist.parentId,history[1],
        twist.id,history[2],route.id,rank);
    },check=(route,history)=>{
      const commands=rarities.map(rank=>commandFor(route,history,rank));ladders++;
      for(let index=1;index<commands.length;index++){
        const before=commands[index-1],after=commands[index],damageDelta=
          commandRealChainDamagePerStack(after)-commandRealChainDamagePerStack(before),
          chainDelta=totalCommandChainGain(after)-totalCommandChainGain(before);
        comparisons++;minDamageDelta=Math.min(minDamageDelta,damageDelta);
        minChainDelta=Math.min(minChainDelta,chainDelta);
        if(damageDelta<-1e-6||chainDelta<0)throw new Error(route.id+
          ' rank ladder regresses real Chain output at '+history.join('/')+' '+
          rarities[index-1]+' -> '+rarities[index]);
      }
    };
    for(const route of routes){
      if(route.depth===2)for(const form of rarities)check(route,[form]);
      else if(route.depth===3)for(const form of rarities)for(const spec of rarities)
        check(route,[form,spec]);
      else for(const form of rarities)for(const spec of rarities)for(const twist of rarities)
        check(route,[form,spec,twist]);
    }
    return {routes:routes.length,ladders,comparisons,
      minDamageDelta:Number(minDamageDelta.toFixed(6)),minChainDelta};
  })();
  globalThis.__stableRankAudit=(()=>{
    const rarities=['COMMON','UNCOMMON','RARE','LEGENDARY'],routes=
      SHARPSHOOT_MARK_ROUTE_CONTRACTS.filter(route=>route.runtimeReadiness==='MATERIALIZED'),
      regressions=[],stagnant=[];let ladders=0,comparisons=0;
    const commandFor=(route,history,rank)=>{
      if(route.depth===1)return synthesizeSharpshootMarkPath(rank);
      if(route.depth===2)return synthesizeSharpshootMarkPath(history[0],route.id,rank);
      if(route.depth===3)return synthesizeSharpshootMarkPath(history[0],route.parentId,
        history[1],route.id,rank);
      const twist=SHARPSHOOT_MARK_ROUTE_BY_ID[route.parentId];
      return synthesizeSharpshootMarkPath(history[0],twist.parentId,history[1],
        twist.id,history[2],route.id,rank);
    },profile=command=>({
      damage:commandDirectDamageTotal(command),mark:command.markGain||0,
      hits:command.hits||1,chain:totalCommandChainGain(command),
      weight:command.deliveryWeight||1,posture:command.posture||0,
      crit:command.critChance||0,bleed:commandBleedAmount(command),
      charge:commandDefenseTemperRate(command),pulses:(command.markPulsePattern||[]).length,
      bloom:command.markBloomRate||0,trail:command.phaseMarkTrailPerContact||0,
      chainDamage:commandOwnsChainScaling(command)?commandRealChainDamagePerStack(command):0
    }),check=(route,history)=>{
      const commands=rarities.map(rank=>commandFor(route,history,rank));ladders++;
      for(let index=1;index<commands.length;index++){
        comparisons++;const before=profile(commands[index-1]),after=profile(commands[index]);
        let improved=false;
        for(const key of Object.keys(before))if(after[key]+1e-6<before[key])regressions.push({
          route:route.id,history:history.join('/'),from:rarities[index-1],to:rarities[index],
          stat:key,before:Number(before[key].toFixed(4)),after:Number(after[key].toFixed(4))});
        else if(after[key]>before[key]+1e-6)improved=true;
        if(!improved)stagnant.push({route:route.id,history:history.join('/'),
          from:rarities[index-1],to:rarities[index]});
      }
    };
    for(const route of routes){
      if(route.depth===1)check(route,[]);
      else if(route.depth===2)for(const form of rarities)check(route,[form]);
      else if(route.depth===3)for(const form of rarities)for(const spec of rarities)
        check(route,[form,spec]);
      else for(const form of rarities)for(const spec of rarities)for(const twist of rarities)
        check(route,[form,spec,twist]);
    }
    return {routes:routes.length,ladders,comparisons,regressions,stagnant};
  })();
  globalThis.__stableHierarchyAudit=(()=>{
    const rarities=['COMMON','UNCOMMON','RARE','LEGENDARY'],routes=
      SHARPSHOOT_MARK_ROUTE_CONTRACTS.filter(route=>route.runtimeReadiness==='MATERIALIZED'&&
        route.depth>1),twists=routes.filter(route=>route.depth===3),
      apexes=routes.filter(route=>route.depth===4),failures=[],repairRows=[],layerRows=[];
    let comparisons=0,maxDamageRestored=0,maxMarkRestored=0,maxLayerGain=0,
      maxLegacyWalletError=0,maxRankFloorPower=0,maxRankStatFloorDamage=0;
    const pair=(route,history,rank)=>{
      if(route.depth===2)return {parent:synthesizeSharpshootMarkPath(history[0]),
        child:synthesizeSharpshootMarkPath(history[0],route.id,rank)};
      if(route.depth===3)return {parent:synthesizeSharpshootMarkPath(history[0],route.parentId,
          history[1]),child:synthesizeSharpshootMarkPath(history[0],route.parentId,history[1],
          route.id,rank)};
      const twist=SHARPSHOOT_MARK_ROUTE_BY_ID[route.parentId];
      return {parent:synthesizeSharpshootMarkPath(history[0],twist.parentId,history[1],
          twist.id,history[2]),child:synthesizeSharpshootMarkPath(history[0],twist.parentId,
          history[1],twist.id,history[2],route.id,rank)};
    },check=(route,history,rank)=>{
      const {parent,child}=pair(route,history,rank),report=child.synthesisLayerInheritance,
        parentDamage=commandDirectDamageTotal(parent),childDamage=commandDirectDamageTotal(child),
        parentScore=stableEvolutionCombinedGuardrailValue(parent),
        childScore=stableEvolutionCombinedGuardrailValue(child),
        parentPlay=stableEvolutionPlaythroughVector(parent).averageContribution,
        childPlay=stableEvolutionPlaythroughVector(child).averageContribution,
        weightOwned=!!(route.mechanics&&route.mechanics.weightChannel);
      comparisons++;
      if(!report||report.mode!=='PARENT_PLUS_DELTA'||childDamage+.001<parentDamage+
          report.minimumDirectGain||(child.markGain||0)<(parent.markGain||0)||
          childScore+.051<parentScore+report.minimumLayerGain||
          childPlay+.051<parentPlay+report.minimumLayerGain||
          (!weightOwned&&((child.deliveryWeight||1)!==1||(child.chainBonusWeight||1)!==1)))
        failures.push({route:route.id,history:history.join('/'),rank,parentDamage,childDamage,
          parentMark:parent.markGain,childMark:child.markGain,parentScore,childScore,parentPlay,
          childPlay,report,deliveryWeight:child.deliveryWeight,chainBonusWeight:child.chainBonusWeight});
      maxDamageRestored=Math.max(maxDamageRestored,report&&report.damageRestored||0);
      maxMarkRestored=Math.max(maxMarkRestored,report&&report.markRestored||0);
      maxLayerGain=Math.max(maxLayerGain,childPlay-parentPlay);
      maxLegacyWalletError=Math.max(maxLegacyWalletError,child.synthesisLegacyWalletError||0);
      maxRankFloorPower=Math.max(maxRankFloorPower,child.synthesisRankFloorPower||0);
      maxRankStatFloorDamage=Math.max(maxRankStatFloorDamage,
        child.synthesisRankStatFloorDamage||0);
      repairRows.push({route:route.id,history:history.join('/'),rank,
        restored:report&&report.damageRestored||0,layerBudget:report&&report.layerPowerBudget||0,
        legacyError:child.synthesisLegacyWalletError||0,
        rankFloor:child.synthesisRankFloorPower||0,
        rankStatDamage:child.synthesisRankStatFloorDamage||0,
        rankStatRestorations:child.synthesisRankStatFloorRestorations||0});
      layerRows.push({route:route.id,history:history.join('/'),rank,
        gain:childPlay-parentPlay,parentPlay,childPlay});
    };
    for(const route of routes){
      if(route.depth===2)for(const form of rarities)for(const rank of rarities)
        check(route,[form],rank);
      else if(route.depth===3)for(const form of rarities)for(const spec of rarities)
        for(const rank of rarities)check(route,[form,spec],rank);
      else for(const form of rarities)for(const spec of rarities)for(const twist of rarities)
        for(const rank of rarities)check(route,[form,spec,twist],rank);
    }
    const percentile=(rows,key,p)=>{
      const values=rows.map(row=>row[key]).sort((a,b)=>a-b);
      return values[Math.min(values.length-1,Math.floor((values.length-1)*p))]||0;
    },worstRepairs=repairRows.slice().sort((a,b)=>b.restored-a.restored).slice(0,8),
      worstLayerGains=layerRows.slice().sort((a,b)=>b.gain-a.gain).slice(0,8);
    return {routes:routes.length,twists:twists.length,apexes:apexes.length,comparisons,failures,
      maxDamageRestored:Number(maxDamageRestored.toFixed(3)),maxMarkRestored,
      maxLayerGain:Number(maxLayerGain.toFixed(3)),
      repairP50:Number(percentile(repairRows,'restored',.5).toFixed(3)),
      repairP95:Number(percentile(repairRows,'restored',.95).toFixed(3)),
      repairedCards:repairRows.filter(row=>row.restored>.001).length,
      maxLegacyWalletError:Number(maxLegacyWalletError.toFixed(3)),
      legacyErrorP95:Number(percentile(repairRows,'legacyError',.95).toFixed(3)),
      maxRankFloorPower:Number(maxRankFloorPower.toFixed(3)),
      rankFloorP95:Number(percentile(repairRows,'rankFloor',.95).toFixed(3)),
      maxRankStatFloorDamage:Number(maxRankStatFloorDamage.toFixed(3)),
      rankStatDamageP95:Number(percentile(repairRows,'rankStatDamage',.95).toFixed(3)),
      worstRepairs,worstLayerGains};
  })();
  globalThis.__parentStrengthAudit=(()=>{
    const rarities=['COMMON','UNCOMMON','RARE','LEGENDARY'],routes=
      SHARPSHOOT_MARK_ROUTE_CONTRACTS.filter(route=>route.runtimeReadiness==='MATERIALIZED'&&
        route.depth>1),reversals=[];
    let comparisons=0,minScoreRetention=Infinity,minPlayRetention=Infinity,
      minChildScoreGap=Infinity,minChildPlayGap=Infinity,worstScore=null,worstPlay=null,
      worstChildScoreGap=null,worstChildPlayGap=null;
    const historiesFor=length=>{
      let histories=[[]];
      for(let index=0;index<length;index++)histories=histories.flatMap(history=>
        rarities.map(rarity=>history.concat(rarity)));
      return histories;
    },profile=command=>({damage:Number(commandDirectDamageTotal(command).toFixed(3)),
      mark:command.markGain||0,hits:command.hits||1,chain:totalCommandChainGain(command),
      weight:command.deliveryWeight||1,
      score:Number(stableEvolutionCombinedGuardrailValue(command).toFixed(3)),
      play:stableEvolutionPlaythroughVector(command).averageContribution}),
    commandsFor=(route,history,childRank)=>{
      if(route.depth===2)return {parent:synthesizeSharpshootMarkPath(history[0]),
        child:synthesizeSharpshootMarkPath(history[0],route.id,childRank)};
      if(route.depth===3)return {parent:synthesizeSharpshootMarkPath(history[0],route.parentId,
          history[1]),child:synthesizeSharpshootMarkPath(history[0],route.parentId,history[1],
          route.id,childRank)};
      const twist=SHARPSHOOT_MARK_ROUTE_BY_ID[route.parentId];
      return {parent:synthesizeSharpshootMarkPath(history[0],twist.parentId,history[1],
          twist.id,history[2]),child:synthesizeSharpshootMarkPath(history[0],twist.parentId,
          history[1],twist.id,history[2],route.id,childRank)};
    };
    for(const route of routes)for(const childRank of rarities){
      const histories=historiesFor(route.depth-1);
      for(const history of histories)for(let dimension=0;dimension<history.length;dimension++){
        const rarityIndex=rarities.indexOf(history[dimension]);
        if(rarityIndex>=rarities.length-1)continue;
        const higher=history.slice();higher[dimension]=rarities[rarityIndex+1];
        const low=commandsFor(route,history,childRank),high=commandsFor(route,higher,childRank),
          parentScoreGap=stableEvolutionCombinedGuardrailValue(high.parent)-
            stableEvolutionCombinedGuardrailValue(low.parent),
          childScoreGap=stableEvolutionCombinedGuardrailValue(high.child)-
            stableEvolutionCombinedGuardrailValue(low.child),
          parentPlayGap=stableEvolutionPlaythroughVector(high.parent).averageContribution-
            stableEvolutionPlaythroughVector(low.parent).averageContribution,
          childPlayGap=stableEvolutionPlaythroughVector(high.child).averageContribution-
            stableEvolutionPlaythroughVector(low.child).averageContribution,
          scoreRetention=parentScoreGap>.001?childScoreGap/parentScoreGap:1,
          playRetention=parentPlayGap>.001?childPlayGap/parentPlayGap:1,
          row={route:route.id,childRank,history:history.join('/'),
            higher:higher.join('/'),dimension,parentScoreGap,childScoreGap,parentPlayGap,
            childPlayGap,scoreRetention,playRetention};
        comparisons++;
        if(parentScoreGap<-.001||parentPlayGap<-.001||childScoreGap<-.001||childPlayGap<-.001)
          reversals.push(row);
        const detailed=()=>({...row,profiles:{lowParent:profile(low.parent),
          highParent:profile(high.parent),lowChild:profile(low.child),highChild:profile(high.child)}});
        if(scoreRetention<minScoreRetention){minScoreRetention=scoreRetention;worstScore=detailed();}
        if(playRetention<minPlayRetention){minPlayRetention=playRetention;worstPlay=detailed();}
        if(parentScoreGap>=1&&childScoreGap<minChildScoreGap){minChildScoreGap=childScoreGap;
          worstChildScoreGap=detailed();}
        if(parentPlayGap>=1&&childPlayGap<minChildPlayGap){minChildPlayGap=childPlayGap;
          worstChildPlayGap=detailed();}
      }
    }
    return {routes:routes.length,comparisons,reversals,
      minScoreRetention:Number(minScoreRetention.toFixed(4)),
      minPlayRetention:Number(minPlayRetention.toFixed(4)),
      minChildScoreGap:Number(minChildScoreGap.toFixed(4)),
      minChildPlayGap:Number(minChildPlayGap.toFixed(4)),worstScore,worstPlay,
      worstChildScoreGap,worstChildPlayGap};
  })();`;
  vm.runInNewContext(source,sandbox,{filename:file,timeout:60000});
  if(canvas.dataset.bootReady!=='1')throw new Error('Inline script finished without bootReady=1');
  console.log(`RUNTIME_OK ${file}`);
  const audit=sandbox.__runtimeAudit;
  if(audit&&audit.focusTwistBoundaryMatrix){
    const standard=audit.focusTwistMatrix.filter(row=>row.formRarity==='COMMON'&&
      row.specRarity==='COMMON'&&row.twistRarity==='COMMON');
    const minMarkMargin=Math.min(...audit.focusTwistBoundaryMatrix.map(row=>
      row.minFocusMark-row.maxChainMark));
    const minDamageGap=Math.min(...audit.focusTwistBoundaryMatrix.map(row=>
      row.minChainDamage-row.maxFocusDamage));
    console.log('MARK_MARK_AUDIT '+JSON.stringify({cards:audit.focusTwistCards,
      histories:audit.focusTwistBoundaryMatrix.length,minMarkMargin,
      minDamageGap:Number(minDamageGap.toFixed(3)),standard}));
  }
  const mechanics=sandbox.__focusMechanicAudit;
  if(!mechanics||mechanics.pulseMark!==7||mechanics.pulseEvents!==3||
     mechanics.pulseTimelineEvents!==3||mechanics.bloomFromEight!==1||mechanics.installed!==1||
     mechanics.firstTrail!==1||mechanics.secondTrail!==1||mechanics.cleared!==0||
     mechanics.hugeBloom!==375000000||mechanics.hugeMark!==3000000000)
    throw new Error(`Mark/Mark runtime mechanic audit failed: ${JSON.stringify(mechanics)}`);
  console.log('MARK_MARK_RUNTIME '+JSON.stringify(mechanics));
  const scale=sandbox.__focusScaleAudit,scoreRatios=scale.histories.map(row=>row.scoreRatio),
    playRatios=scale.histories.map(row=>row.playRatio);
  console.log('MARK_MARK_SCALE '+JSON.stringify({uniform:scale.uniform,
    crossRoute:{histories:scale.histories.length,
      minScoreRatio:Math.min(...scoreRatios),maxScoreRatio:Math.max(...scoreRatios),
      minPlayRatio:Math.min(...playRatios),maxPlayRatio:Math.max(...playRatios)}}));
  if(Math.min(...scoreRatios)<.95||Math.max(...scoreRatios)>1.20||
     Math.min(...playRatios)<.895||Math.max(...playRatios)>1.31)
    throw new Error('Mark/Mark versus Mark/Chain balance band failed: '+JSON.stringify({
      minScore:Math.min(...scoreRatios),maxScore:Math.max(...scoreRatios),
      minPlay:Math.min(...playRatios),maxPlay:Math.max(...playRatios)}));
  const pureExpression=sandbox.__pureRarityExpressionAudit;
  if(!pureExpression||pureExpression.some(route=>{
    const rows=route.rows;
    return rows[0].actual!==0||rows.at(-1).damage<=rows[0].damage||
      rows.some((row,index)=>index>0&&row.damage+1e-6<rows[index-1].damage);
  }))throw new Error('Pure Attribute rarity expression failed: '+JSON.stringify(pureExpression));
  console.log('PURE_RARITY_EXPRESSION '+JSON.stringify(pureExpression));
  const twistBalance=sandbox.__twistBalanceAudit;
  if(!twistBalance||twistBalance.maxStandardContributionSpread>.20)
    throw new Error('Standard Twist rotation balance failed: '+JSON.stringify(twistBalance));
  const summarizeTwistRow=row=>row&&({formRarity:row.formRarity,specRarity:row.specRarity,
    twistRarity:row.twistRarity,contributionSpread:row.contributionSpread,
    damageSpread:row.damageSpread,entries:row.entries.map(entry=>({twistId:entry.twistId,
      play:entry.averageContribution,damage:entry.totalDamage,endMark:entry.endMark}))});
  console.log('TWIST_ROTATION_BALANCE '+JSON.stringify({
    maxStandardContributionSpread:twistBalance.maxStandardContributionSpread,
    maxAllHistoryContributionSpread:twistBalance.maxContributionSpread,
    worstStandard:summarizeTwistRow(Object.values(twistBalance.reference).sort((a,b)=>
      b.contributionSpread-a.contributionSpread)[0]),
    worstAllHistory:summarizeTwistRow(twistBalance.worstContributionRow)}));
  console.log('CHAIN_DISPLAY_SCALE '+JSON.stringify(sandbox.__chainDisplayAudit));
  const rankAudit=sandbox.__stableRankAudit;
  if(rankAudit.regressions.length||rankAudit.stagnant.length)throw new Error(
    'Stable rank contract failed: '+JSON.stringify({regressions:rankAudit.regressions.slice(0,5),
      stagnant:rankAudit.stagnant.slice(0,5)}));
  const regressionStats=rankAudit.regressions.reduce((counts,row)=>
    (counts[row.stat]=(counts[row.stat]||0)+1,counts),{}),regressionRoutes=
    rankAudit.regressions.reduce((counts,row)=>(counts[row.route]=(counts[row.route]||0)+1,counts),{});
  console.log('STABLE_RANK_AUDIT '+JSON.stringify({routes:rankAudit.routes,ladders:rankAudit.ladders,
    comparisons:rankAudit.comparisons,regressions:rankAudit.regressions.length,
    stagnant:rankAudit.stagnant.length,byStat:regressionStats,byRoute:regressionRoutes,
    examples:rankAudit.regressions.slice(0,20)}));
  const hierarchyAudit=sandbox.__stableHierarchyAudit;
  if(!hierarchyAudit||hierarchyAudit.twists!==8||hierarchyAudit.apexes!==16||
     hierarchyAudit.comparisons!==4704||hierarchyAudit.failures.length)
    throw new Error('Stable hierarchy contract failed: '+JSON.stringify(hierarchyAudit&&{
      routes:hierarchyAudit.routes,twists:hierarchyAudit.twists,apexes:hierarchyAudit.apexes,
      comparisons:hierarchyAudit.comparisons,failures:hierarchyAudit.failures.slice(0,5)}));
  console.log('STABLE_HIERARCHY_AUDIT '+JSON.stringify({routes:hierarchyAudit.routes,
    twists:hierarchyAudit.twists,apexes:hierarchyAudit.apexes,
    comparisons:hierarchyAudit.comparisons,maxDamageRestored:hierarchyAudit.maxDamageRestored,
    maxMarkRestored:hierarchyAudit.maxMarkRestored,maxLayerGain:hierarchyAudit.maxLayerGain,
    repairP50:hierarchyAudit.repairP50,repairP95:hierarchyAudit.repairP95,
    repairedCards:hierarchyAudit.repairedCards,maxLegacyWalletError:hierarchyAudit.maxLegacyWalletError,
    legacyErrorP95:hierarchyAudit.legacyErrorP95,worstRepairs:hierarchyAudit.worstRepairs,
    maxRankFloorPower:hierarchyAudit.maxRankFloorPower,
    rankFloorP95:hierarchyAudit.rankFloorP95,
    maxRankStatFloorDamage:hierarchyAudit.maxRankStatFloorDamage,
    rankStatDamageP95:hierarchyAudit.rankStatDamageP95,
    worstLayerGains:hierarchyAudit.worstLayerGains}));
  if(hierarchyAudit.maxDamageRestored>1.1||hierarchyAudit.repairP95>.001)
    throw new Error('Stable compiler relies on excessive hidden inheritance repair: '+
      JSON.stringify({max:hierarchyAudit.maxDamageRestored,p95:hierarchyAudit.repairP95,
        examples:hierarchyAudit.worstRepairs.slice(0,3)}));
  if(hierarchyAudit.maxRankFloorPower>.5||hierarchyAudit.rankFloorP95>.001||
     hierarchyAudit.maxRankStatFloorDamage>2||hierarchyAudit.rankStatDamageP95>.001)
    throw new Error('Stable rank compiler relies on excessive hidden repair: '+JSON.stringify({
      maxRankFloor:hierarchyAudit.maxRankFloorPower,rankFloorP95:hierarchyAudit.rankFloorP95,
      maxRankStatDamage:hierarchyAudit.maxRankStatFloorDamage,
      rankStatDamageP95:hierarchyAudit.rankStatDamageP95}));
  console.log('APEX_FAMILY_BALANCE '+JSON.stringify(audit.apexFamilyPlaythroughAudit));
  const parentStrength=sandbox.__parentStrengthAudit;
  console.log('PARENT_STRENGTH_AUDIT '+JSON.stringify({routes:parentStrength.routes,
    comparisons:parentStrength.comparisons,reversals:parentStrength.reversals.length,
    minScoreRetention:parentStrength.minScoreRetention,
    minPlayRetention:parentStrength.minPlayRetention,
    minChildScoreGap:parentStrength.minChildScoreGap,
    minChildPlayGap:parentStrength.minChildPlayGap,worstScore:parentStrength.worstScore,
    worstPlay:parentStrength.worstPlay,worstChildScoreGap:parentStrength.worstChildScoreGap,
    worstChildPlayGap:parentStrength.worstChildPlayGap}));
  const parentStrengthMinRetention=.10,parentStrengthMinVisibleGap=1;
  if(!parentStrength||parentStrength.routes!==30||parentStrength.comparisons!==10056||
     parentStrength.reversals.length||
     parentStrength.minScoreRetention+1e-6<parentStrengthMinRetention||
     parentStrength.minPlayRetention+1e-6<parentStrengthMinRetention||
     parentStrength.minChildScoreGap+1e-6<parentStrengthMinVisibleGap||
     parentStrength.minChildPlayGap+1e-6<parentStrengthMinVisibleGap)
    throw new Error('Stable child erased or reversed its parent strength: '+JSON.stringify({
      expectedRoutes:30,expectedComparisons:10056,
      reversals:parentStrength&&parentStrength.reversals.slice(0,3),
      minScoreRetention:parentStrength&&parentStrength.minScoreRetention,
      minPlayRetention:parentStrength&&parentStrength.minPlayRetention,
      minChildScoreGap:parentStrength&&parentStrength.minChildScoreGap,
      minChildPlayGap:parentStrength&&parentStrength.minChildPlayGap,
      worstScore:parentStrength&&parentStrength.worstScore,
      worstPlay:parentStrength&&parentStrength.worstPlay}));
}catch(error){
  console.error(error&&error.stack||error);
  process.exitCode=1;
}
