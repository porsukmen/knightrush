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
  const auditStableApexFamily=config=>{
    const rarities=['COMMON','UNCOMMON','RARE','LEGENDARY'],ids=config.ids,rows=[],groupsByKey=new Map();
    if(!config||!config.familyId||!config.specId||!config.twistId||
       !Array.isArray(ids)||ids.length!==4||new Set(ids).size!==4)
      throw new Error('Stable Apex family audit needs one id and four unique sibling routes');
    for(const formRarity of rarities)for(const specRarity of rarities)
      for(const twistRarity of rarities)for(const apexRarity of rarities)for(const id of ids){
        const history={formRarity,specRarity,twistRarity,apexRarity,id},
          parent=synthesizeSharpshootMarkPath(formRarity,config.specId,specRarity,
            config.twistId,twistRarity),
          command=synthesizeSharpshootMarkPath(formRarity,config.specId,specRarity,
            config.twistId,twistRarity,id,apexRarity);
        if(!command||!parent||commandDirectDamageTotal(command)+1e-6<
           commandDirectDamageTotal(parent)||command.markGain<parent.markGain)
          throw new Error(config.familyId+' erased protected parent output at '+
            Object.values(history).join('/'));
        const row=config.inspect({command,parent,history,rarities});
        if(!row||row.id!==id)throw new Error(config.familyId+' returned an invalid audit row');
        const frozen=Object.freeze({...history,...row}),key=
          formRarity+'|'+specRarity+'|'+twistRarity+'|'+apexRarity;
        rows.push(frozen);
        let group=groupsByKey.get(key);
        if(!group){group=[];groupsByKey.set(key,group);}
        group.push(frozen);
      }
    let groups=0;
    for(const formRarity of rarities)for(const specRarity of rarities)
      for(const twistRarity of rarities)for(const apexRarity of rarities){
        const group=groupsByKey.get(formRarity+'|'+specRarity+'|'+twistRarity+'|'+apexRarity)||[];
        if(group.length!==ids.length)throw new Error(config.familyId+' lost an Apex sibling');
        config.inspectGroup(group,{formRarity,specRarity,twistRarity,apexRarity,ids});
        groups++;
      }
    return Object.freeze({familyId:config.familyId,cards:rows.length,groups,rows});
  };
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
          const rotation=sharpshootMarkRotationVector(command);
          return {quality:command.synthesisQuality,effectiveQuality:command.synthesisEffectiveQuality,
            damage:Number(commandDirectDamageTotal(command).toFixed(3)),mark:command.markGain,
            hits:command.hits,chain:totalCommandChainGain(command),
            chainRate:Number((command.extraChainBonus||0).toFixed(4)),
            pulses:(command.markPulsePattern||[]).length,
            bloomRate:Number((command.markBloomRate||0).toFixed(4)),
            trail:command.phaseMarkTrailPerContact||0,
            score:Number(sharpshootMarkComparisonValue(command).toFixed(3)),
            play:rotation.averageContribution,endMark:rotation.endMark,
            totalDamage:rotation.totalDamage};
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
            sharpshootMarkComparisonValue(command),0)/focus.length,
          chainMean=chain.reduce((sum,command)=>sum+
            sharpshootMarkComparisonValue(command),0)/chain.length,
          focusPlayMean=focus.reduce((sum,command)=>sum+
            sharpshootMarkRotationVector(command).averageContribution,0)/focus.length,
          chainPlayMean=chain.reduce((sum,command)=>sum+
            sharpshootMarkRotationVector(command).averageContribution,0)/chain.length;
        histories.push({formRarity,specRarity,twistRarity,
          scoreRatio:Number((focusMean/chainMean).toFixed(4)),
          playRatio:Number((focusPlayMean/chainPlayMean).toFixed(4))});
      }
    return {uniform,histories};
  })();
  globalThis.__postureTwistAudit=(()=>{
    const rarities=['COMMON','UNCOMMON','RARE','LEGENDARY'],ids=[
      'mark_posture_impact_twist','mark_posture_mark_read_twist',
      'mark_posture_primer_twist','mark_posture_finisher_twist'],rows=[];
    for(const formRarity of rarities)for(const specRarity of rarities)
      for(const twistRarity of rarities)for(const id of ids){
        const command=synthesizeSharpshootMarkPath(formRarity,'mark_posture_spec',specRarity,
          id,twistRarity),parent=synthesizeSharpshootMarkPath(formRarity,'mark_posture_spec',specRarity),
          flat=command.posture||0,perMark=command.posturePerMark||0,
          primer=command.posturePrimer||0,threshold=command.postureThresholdBonus||0;
        if(command.hits!==1||command.deliveryPattern!=='SINGLE'||command.markGain<parent.markGain||
           commandDirectDamageTotal(command)+1e-6<commandDirectDamageTotal(parent))
          throw new Error(id+' breaks inherited Mark/Posture bow chassis');
        if(id===ids[0]&&(perMark||primer||threshold)||
           id===ids[1]&&(!(perMark>0)||primer||threshold)||
           id===ids[2]&&(!(primer>0)||perMark||threshold)||
           id===ids[3]&&(!(threshold>0)||perMark||primer))
          throw new Error(id+' blurred its unique Posture relationship');
        rows.push({formRarity,specRarity,twistRarity,id,
          damage:Number(commandDirectDamageTotal(command).toFixed(3)),mark:command.markGain,
          flat,perMark,primer,threshold,
          reference:Number(commandExpectedPosturePower(command,8).toFixed(3)),
          score:Number(stableEvolutionCombinedGuardrailValue(command).toFixed(3))});
      }
    let maxScoreSpread=0;
    for(const formRarity of rarities)for(const specRarity of rarities)for(const twistRarity of rarities){
      const group=rows.filter(row=>row.formRarity===formRarity&&row.specRarity===specRarity&&
        row.twistRarity===twistRarity),scores=group.map(row=>row.score),
        mean=scores.reduce((sum,value)=>sum+value,0)/scores.length;
      maxScoreSpread=Math.max(maxScoreSpread,(Math.max(...scores)-Math.min(...scores))/mean);
    }
    const standard=ids.map(id=>{
      const command=synthesizeSharpshootMarkPath('COMMON','mark_posture_spec','COMMON',id,'COMMON');
      return {id,damage:Number(commandDirectDamageTotal(command).toFixed(3)),mark:command.markGain,
        flat:command.posture||0,perMark:command.posturePerMark||0,
        primer:command.posturePrimer||0,threshold:command.postureThresholdBonus||0,
        reference:Number(commandExpectedPosturePower(command,8).toFixed(3))};
    }),read=synthesizeSharpshootMarkPath('COMMON','mark_posture_spec','COMMON',ids[1],'COMMON'),
      finisher=synthesizeSharpshootMarkPath('COMMON','mark_posture_spec','COMMON',ids[3],'COMMON'),
      readPlan=commandMarkPlan(read,8),readAtEight=commandPostureDamage(read,0,8,0,100),
      readAtSixteen=commandPostureDamage(read,0,16,0,100),
      finisherBelow=commandPostureDamage(finisher,0,0,49,100),
      finisherAtHalf=commandPostureDamage(finisher,0,0,50,100),
      finisherAbove=commandPostureDamage(finisher,0,0,99,100),
      uncappedLow=commandPostureDamage(read,0,1000,0,100),
      uncappedHigh=commandPostureDamage(read,0,1000000,0,100),savedBoss=boss;
    boss={turnCombat:true,phase:'playerResolve',playerTurnBreak:false,state:'idle',posture:10,
      postureMax:100,posturePrimer:0,pendingBreak:null};
    installBossPosturePrimer(7);const installed=boss.posturePrimer;
    applyTurnSkillPosture(5);const postureAfter=boss.posture,primerAfter=boss.posturePrimer;
    boss=savedBoss;
    if(readPlan.consumedTotal!==0||readPlan.remaining!==8||
       Math.abs((readAtSixteen-readAtEight)-read.posturePerMark*8)>.001||
       !(finisherAtHalf>finisherBelow)||finisherAbove!==finisherAtHalf||
       !(uncappedHigh>uncappedLow)||installed!==7||postureAfter!==22||primerAfter!==0)
      throw new Error('Mark/Posture runtime scaling or general primer lifecycle regressed');
    return {cards:rows.length,rows,standard,maxScoreSpread:Number(maxScoreSpread.toFixed(4)),uncappedLow,uncappedHigh,
      markReadRuntime:{consumed:readPlan.consumedTotal,remaining:readPlan.remaining,
        readAtEight,readAtSixteen},
      finisherRuntime:{below:finisherBelow,atHalf:finisherAtHalf,above:finisherAbove},
      primerRuntime:{installed,postureAfter,primerAfter}};
  })();
  globalThis.__postureImpactApexAudit=(()=>{
    const rarities=['COMMON','UNCOMMON','RARE','LEGENDARY'],ids=[
      'mark_posture_impact_posture_apex','mark_posture_impact_mark_apex',
      'mark_posture_impact_damage_apex','mark_posture_impact_fracture_apex'],rows=[];
    for(const formRarity of rarities)for(const specRarity of rarities)
      for(const twistRarity of rarities)for(const apexRarity of rarities)for(const id of ids){
        const parent=synthesizeSharpshootMarkPath(formRarity,'mark_posture_spec',specRarity,
            'mark_posture_impact_twist',twistRarity),
          command=synthesizeSharpshootMarkPath(formRarity,'mark_posture_spec',specRarity,
            'mark_posture_impact_twist',twistRarity,id,apexRarity),
          wave=command.postureWavePattern,eventPower=command.postureApplicationEventPower||0;
        if(command.hits!==1||command.deliveryPattern!=='SINGLE'||command.markGain<parent.markGain||
           commandDirectDamageTotal(command)+1e-6<commandDirectDamageTotal(parent)||
           command.posture+1e-6<parent.posture||command.posturePerMark||command.posturePrimer||
           command.postureThresholdBonus)
          throw new Error(id+' breaks its reliable-impact parent');
        if(id===ids[3]){
          if(!Array.isArray(wave)||wave.length!==2||Math.abs(wave[0]+wave[1]-1)>.0001||
             Math.abs(wave[1]-.4)>.0001||!(eventPower>0))
            throw new Error(id+' needs one paid 60/40 Posture fracture');
        }else if(wave||eventPower)
          throw new Error(id+' invented a Posture application event');
        rows.push({formRarity,specRarity,twistRarity,apexRarity,id,
          damage:Number(commandDirectDamageTotal(command).toFixed(3)),mark:command.markGain,
          markAllocation:Number((command.synthesisBuildVector?.MARK_GAIN||0).toFixed(4)),
          posture:command.posture,eventPower:Number(eventPower.toFixed(4)),
          score:Number(stableEvolutionCombinedGuardrailValue(command).toFixed(3))});
      }
    let maxScoreSpread=0,postureLeaderRows=0,markLeaderRows=0,markAllocationLeaderRows=0,
      damageLeaderRows=0,fractureRows=0;
    for(const formRarity of rarities)for(const specRarity of rarities)
      for(const twistRarity of rarities)for(const apexRarity of rarities){
        const group=rows.filter(row=>row.formRarity===formRarity&&row.specRarity===specRarity&&
          row.twistRarity===twistRarity&&row.apexRarity===apexRarity),scores=group.map(row=>row.score),
          mean=scores.reduce((sum,value)=>sum+value,0)/scores.length,
          posture=group.find(row=>row.id===ids[0]),mark=group.find(row=>row.id===ids[1]),
          damage=group.find(row=>row.id===ids[2]),fracture=group.find(row=>row.id===ids[3]);
        maxScoreSpread=Math.max(maxScoreSpread,(Math.max(...scores)-Math.min(...scores))/mean);
        if(posture.posture>=Math.max(...group.map(row=>row.posture)))postureLeaderRows++;
        if(mark.mark>=Math.max(...group.map(row=>row.mark)))markLeaderRows++;
        if(mark.markAllocation>Math.max(...group.filter(row=>row.id!==ids[1]).map(row=>row.markAllocation)))
          markAllocationLeaderRows++;
        if(damage.damage>=Math.max(...group.map(row=>row.damage)))damageLeaderRows++;
        if(fracture.eventPower>0)fractureRows++;
      }
    const standard=ids.map(id=>{
      const command=synthesizeSharpshootMarkPath('COMMON','mark_posture_spec','COMMON',
        'mark_posture_impact_twist','COMMON',id,'COMMON');
      return {id,damage:Number(commandDirectDamageTotal(command).toFixed(3)),mark:command.markGain,
        posture:command.posture,eventPower:command.postureApplicationEventPower||0,
        wave:command.postureWavePattern||null,
        score:Number(stableEvolutionCombinedGuardrailValue(command).toFixed(3))};
    }),fractureCommand=synthesizeSharpshootMarkPath('COMMON','mark_posture_spec','COMMON',
      'mark_posture_impact_twist','COMMON',ids[3],'COMMON'),
      fractureTimeline=buildPostureWaveTimeline(fractureCommand,1);
    if(!fractureTimeline||fractureTimeline.times.length!==2||fractureTimeline.times[1]!==1.38)
      throw new Error('Double Fracture runtime timeline drifted');
    return {cards:rows.length,rows,standard,maxScoreSpread:Number(maxScoreSpread.toFixed(4)),
      postureLeaderRows,markLeaderRows,markAllocationLeaderRows,damageLeaderRows,fractureRows,
      waveRuntime:{pattern:fractureTimeline.pattern,times:fractureTimeline.times}};
  })();
  globalThis.__postureReadApexAudit=(()=>{
    const ids=[
      'mark_posture_read_volume_apex','mark_posture_read_mark_apex',
      'mark_posture_read_damage_apex','mark_posture_read_escalation_apex'];
    let maxReferenceSpread=0,maxPlaySpread=0,volumeLeaderRows=0,markLeaderRows=0,
      markAllocationLeaderRows=0,damageLeaderRows=0,escalationRows=0,highMarkLeaderRows=0;
    const matrix=auditStableApexFamily({familyId:'F1S3T2',specId:'mark_posture_spec',
      twistId:'mark_posture_mark_read_twist',ids,inspect:({command,parent,history})=>{
        const plan=commandMarkPlan(command,32),escalation=command.postureMarkEscalation||0,
          id=history.id;
        if(command.hits!==1||command.deliveryPattern!=='SINGLE'||command.markGain<parent.markGain||
           commandDirectDamageTotal(command)+1e-6<commandDirectDamageTotal(parent)||
           command.posture+1e-6<parent.posture||command.posturePerMark+1e-6<parent.posturePerMark||
           plan.consumedTotal!==0||plan.remaining!==32||command.posturePrimer||
           command.postureThresholdBonus||command.postureWavePattern)
          throw new Error(id+' breaks its preserving Mark-read parent');
        if((id===ids[3])!==(escalation>0))
          throw new Error(id+' blurred the unique escalating Mark-read refinement');
        const postureByMark=Object.freeze(Object.fromEntries([0,4,8,16,32].map(mark=>
          [mark,Number(commandPostureDamage(command,0,mark,0,100).toFixed(4))])));
        return {id,
          damage:Number(commandDirectDamageTotal(command).toFixed(3)),mark:command.markGain,
          markAllocation:Number((command.synthesisBuildVector?.MARK_GAIN||0).toFixed(4)),
          perMark:command.posturePerMark,escalation:Number(escalation.toFixed(6)),postureByMark,
          reference:Number(stableEvolutionGuardrailValue(command,8,0).toFixed(3)),
          play:Number(stableEvolutionPlaythroughVector(command).averageContribution.toFixed(3))};
      },inspectGroup:group=>{
        const reference=group.map(row=>row.reference),play=group.map(row=>row.play),
          referenceMean=reference.reduce((sum,value)=>sum+value,0)/reference.length,
          playMean=play.reduce((sum,value)=>sum+value,0)/play.length,
          volume=group.find(row=>row.id===ids[0]),mark=group.find(row=>row.id===ids[1]),
          damage=group.find(row=>row.id===ids[2]),escalation=group.find(row=>row.id===ids[3]);
        maxReferenceSpread=Math.max(maxReferenceSpread,
          (Math.max(...reference)-Math.min(...reference))/referenceMean);
        maxPlaySpread=Math.max(maxPlaySpread,(Math.max(...play)-Math.min(...play))/playMean);
        if(volume.perMark>=Math.max(...group.map(row=>row.perMark)))volumeLeaderRows++;
        if(mark.mark>=Math.max(...group.map(row=>row.mark)))markLeaderRows++;
        if(mark.markAllocation>Math.max(...group.filter(row=>row.id!==ids[1]).map(row=>row.markAllocation)))
          markAllocationLeaderRows++;
        if(damage.damage>=Math.max(...group.map(row=>row.damage)))damageLeaderRows++;
        if(escalation.escalation>0)escalationRows++;
        if(escalation.postureByMark[32]>=Math.max(...group.map(row=>row.postureByMark[32])))
          highMarkLeaderRows++;
      }}),rows=matrix.rows;
    const standard=ids.map(id=>{
      const command=synthesizeSharpshootMarkPath('COMMON','mark_posture_spec','COMMON',
        'mark_posture_mark_read_twist','COMMON',id,'COMMON');
      return {id,damage:Number(commandDirectDamageTotal(command).toFixed(3)),mark:command.markGain,
        flat:command.posture,perMark:command.posturePerMark,
        escalation:Number((command.postureMarkEscalation||0).toFixed(6)),
        postureByMark:Object.fromEntries([0,4,8,16,32].map(mark=>
          [mark,Number(commandPostureDamage(command,0,mark,0,100).toFixed(3))])),
        play:Number(stableEvolutionPlaythroughVector(command).averageContribution.toFixed(3))};
    }),escalating=synthesizeSharpshootMarkPath('COMMON','mark_posture_spec','COMMON',
      'mark_posture_mark_read_twist','COMMON',ids[3],'COMMON'),
      low=commandPostureDamage(escalating,0,1000,0,100),
      high=commandPostureDamage(escalating,0,1000000,0,100),
      extreme=commandPostureDamage(escalating,0,Number.MAX_SAFE_INTEGER,0,100);
    if(!Number.isFinite(low)||!Number.isFinite(high)||!Number.isFinite(extreme)||
       !(high>low)||!(extreme>high))
      throw new Error('Escalating Mark read was capped or became non-finite');
    return {cards:matrix.cards,groups:matrix.groups,rows,standard,
      maxReferenceSpread:Number(maxReferenceSpread.toFixed(4)),
      maxPlaySpread:Number(maxPlaySpread.toFixed(4)),volumeLeaderRows,markLeaderRows,
      markAllocationLeaderRows,damageLeaderRows,escalationRows,highMarkLeaderRows,
      uncapped:{low,high,extreme}};
  })();
  globalThis.__posturePrimerApexAudit=(()=>{
    const ids=['mark_posture_primer_volume_apex','mark_posture_primer_mark_apex',
      'mark_posture_primer_damage_apex','mark_posture_primer_amplification_apex'];
    let maxReferenceSpread=0,maxPlaySpread=0,primerLeaderRows=0,markLeaderRows=0,
      markAllocationLeaderRows=0,damageLeaderRows=0,amplificationRows=0,highSourceLeaderRows=0;
    const matrix=auditStableApexFamily({familyId:'F1S3T3',specId:'mark_posture_spec',
      twistId:'mark_posture_primer_twist',ids,inspect:({command,parent,history})=>{
        const id=history.id,amplification=command.posturePrimerAmplification||0;
        if(command.hits!==1||command.deliveryPattern!=='SINGLE'||
           command.posture+1e-6<parent.posture||command.posturePrimer+1e-6<parent.posturePrimer||
           command.posturePerMark||command.postureMarkEscalation||command.postureThresholdBonus||
           command.postureWavePattern)
          throw new Error(id+' breaks its general next-source Primer parent');
        if((id===ids[3])!==(amplification>0))
          throw new Error(id+' blurred the unique source-amplification refinement');
        const bonusBySource=Object.freeze(Object.fromEntries([1,10,20,50,100].map(source=>
          [source,Number((command.posturePrimer+source*amplification).toFixed(4))])));
        return {id,damage:Number(commandDirectDamageTotal(command).toFixed(3)),mark:command.markGain,
          markAllocation:Number((command.synthesisBuildVector?.MARK_GAIN||0).toFixed(4)),
          primer:command.posturePrimer,amplification:Number(amplification.toFixed(6)),bonusBySource,
          reference:Number(stableEvolutionGuardrailValue(command,8,0).toFixed(3)),
          play:Number(stableEvolutionPlaythroughVector(command).averageContribution.toFixed(3))};
      },inspectGroup:group=>{
        const reference=group.map(row=>row.reference),play=group.map(row=>row.play),
          referenceMean=reference.reduce((sum,value)=>sum+value,0)/reference.length,
          playMean=play.reduce((sum,value)=>sum+value,0)/play.length,
          primer=group.find(row=>row.id===ids[0]),mark=group.find(row=>row.id===ids[1]),
          damage=group.find(row=>row.id===ids[2]),amplifier=group.find(row=>row.id===ids[3]);
        maxReferenceSpread=Math.max(maxReferenceSpread,
          (Math.max(...reference)-Math.min(...reference))/referenceMean);
        maxPlaySpread=Math.max(maxPlaySpread,(Math.max(...play)-Math.min(...play))/playMean);
        if(primer.primer>=Math.max(...group.map(row=>row.primer)))primerLeaderRows++;
        if(mark.mark>Math.max(...group.filter(row=>row.id!==ids[1]).map(row=>row.mark)))markLeaderRows++;
        if(mark.markAllocation>Math.max(...group.filter(row=>row.id!==ids[1]).map(row=>row.markAllocation)))
          markAllocationLeaderRows++;
        if(damage.damage>=Math.max(...group.map(row=>row.damage)))damageLeaderRows++;
        if(amplifier.amplification>0)amplificationRows++;
        if(amplifier.bonusBySource[100]>=Math.max(...group.map(row=>row.bonusBySource[100])))
          highSourceLeaderRows++;
      }}),rows=matrix.rows,
      standard=ids.map(id=>{
        const command=synthesizeSharpshootMarkPath('COMMON','mark_posture_spec','COMMON',
          'mark_posture_primer_twist','COMMON',id,'COMMON');
        return {id,damage:Number(commandDirectDamageTotal(command).toFixed(3)),mark:command.markGain,
          posture:command.posture,primer:command.posturePrimer,
          amplification:Number((command.posturePrimerAmplification||0).toFixed(6)),
          bonusAt20:Number((command.posturePrimer+20*(command.posturePrimerAmplification||0)).toFixed(3)),
          bonusAt100:Number((command.posturePrimer+100*(command.posturePrimerAmplification||0)).toFixed(3)),
          play:Number(stableEvolutionPlaythroughVector(command).averageContribution.toFixed(3))};
      }),amplifier=synthesizeSharpshootMarkPath('COMMON','mark_posture_spec','COMMON',
        'mark_posture_primer_twist','COMMON',ids[3],'COMMON'),savedBoss=boss;
    boss={turnCombat:true,phase:'playerResolve',playerTurnBreak:false,state:'idle',posture:0,
      postureMax:1000,posturePrimer:0,posturePrimerAmplification:0,pendingBreak:null};
    installBossPosturePrimer(5,.25);const installed={flat:boss.posturePrimer,
      amplification:boss.posturePrimerAmplification,bonus:bossPosturePrimerBonus(20)};
    applyTurnSkillPosture(20);const applied=boss.posture,cleared={flat:boss.posturePrimer,
      amplification:boss.posturePrimerAmplification};boss=savedBoss;
    const low=amplifier.posturePrimer+1000*amplifier.posturePrimerAmplification,
      high=amplifier.posturePrimer+1000000*amplifier.posturePrimerAmplification,
      extreme=amplifier.posturePrimer+Number.MAX_SAFE_INTEGER*amplifier.posturePrimerAmplification;
    if(installed.flat!==5||installed.amplification!==.25||installed.bonus!==10||applied!==30||
       cleared.flat!==0||cleared.amplification!==0||!Number.isFinite(extreme)||
       !(high>low)||!(extreme>high))
      throw new Error('General Primer amplification lifecycle or uncapped scale regressed');
    return {cards:matrix.cards,groups:matrix.groups,rows,standard,
      maxReferenceSpread:Number(maxReferenceSpread.toFixed(4)),
      maxPlaySpread:Number(maxPlaySpread.toFixed(4)),primerLeaderRows,markLeaderRows,
      markAllocationLeaderRows,damageLeaderRows,amplificationRows,highSourceLeaderRows,
      runtime:{installed,applied,cleared},uncapped:{low,high,extreme}};
  })();
  globalThis.__postureFinisherApexAudit=(()=>{
    const ids=['mark_posture_finisher_volume_apex','mark_posture_finisher_mark_apex',
      'mark_posture_finisher_damage_apex','mark_posture_finisher_crescendo_apex'],starts=[0,49,50,60,75,90,99];
    let maxReferenceSpread=0,maxPlaySpread=0,thresholdLeaderRows=0,markLeaderRows=0,
      markAllocationLeaderRows=0,damageLeaderRows=0,crescendoRows=0,highBarLeaderRows=0;
    const matrix=auditStableApexFamily({familyId:'F1S3T4',specId:'mark_posture_spec',
      twistId:'mark_posture_finisher_twist',ids,inspect:({command,parent,history})=>{
        const id=history.id,crescendo=command.postureThresholdCrescendo||0;
        if(command.hits!==1||command.deliveryPattern!=='SINGLE'||
           command.posture+1e-6<parent.posture||
           command.postureThresholdBonus+1e-6<parent.postureThresholdBonus||
           command.postureThresholdRatio!==.5||command.posturePerMark||
           command.postureMarkEscalation||command.posturePrimer||
           command.posturePrimerAmplification||command.postureWavePattern)
          throw new Error(id+' breaks its half-bar Finisher parent');
        if((id===ids[3])!==(crescendo>0))
          throw new Error(id+' blurred the unique Crescendo refinement');
        const postureByStart=Object.freeze(Object.fromEntries(starts.map(posture=>
          [posture,Number(commandPostureDamage(command,0,0,posture,100).toFixed(4))])));
        return {id,damage:Number(commandDirectDamageTotal(command).toFixed(3)),mark:command.markGain,
          markAllocation:Number((command.synthesisBuildVector?.MARK_GAIN||0).toFixed(4)),
          flat:command.posture,threshold:command.postureThresholdBonus,
          crescendo:Number(crescendo.toFixed(6)),postureByStart,
          reference:Number(stableEvolutionGuardrailValue(command,8,0).toFixed(3)),
          play:Number(stableEvolutionPlaythroughVector(command).averageContribution.toFixed(3))};
      },inspectGroup:group=>{
        const reference=group.map(row=>row.reference),play=group.map(row=>row.play),
          referenceMean=reference.reduce((sum,value)=>sum+value,0)/reference.length,
          playMean=play.reduce((sum,value)=>sum+value,0)/play.length,
          threshold=group.find(row=>row.id===ids[0]),mark=group.find(row=>row.id===ids[1]),
          damage=group.find(row=>row.id===ids[2]),crescendo=group.find(row=>row.id===ids[3]);
        maxReferenceSpread=Math.max(maxReferenceSpread,
          (Math.max(...reference)-Math.min(...reference))/referenceMean);
        maxPlaySpread=Math.max(maxPlaySpread,(Math.max(...play)-Math.min(...play))/playMean);
        if(threshold.threshold>=Math.max(...group.map(row=>row.threshold))&&
           threshold.postureByStart[50]>=Math.max(...group.map(row=>row.postureByStart[50])))
          thresholdLeaderRows++;
        if(mark.mark>Math.max(...group.filter(row=>row.id!==ids[1]).map(row=>row.mark)))markLeaderRows++;
        if(mark.markAllocation>Math.max(...group.filter(row=>row.id!==ids[1]).map(row=>row.markAllocation)))
          markAllocationLeaderRows++;
        if(damage.damage>=Math.max(...group.map(row=>row.damage)))damageLeaderRows++;
        if(crescendo.crescendo>0)crescendoRows++;
        if(crescendo.postureByStart[90]>=Math.max(...group.map(row=>row.postureByStart[90])))
          highBarLeaderRows++;
      }}),rows=matrix.rows,
      standard=ids.map(id=>{
        const command=synthesizeSharpshootMarkPath('COMMON','mark_posture_spec','COMMON',
          'mark_posture_finisher_twist','COMMON',id,'COMMON');
        return {id,damage:Number(commandDirectDamageTotal(command).toFixed(3)),mark:command.markGain,
          flat:command.posture,threshold:command.postureThresholdBonus,
          crescendo:Number((command.postureThresholdCrescendo||0).toFixed(6)),
          postureByStart:Object.fromEntries(starts.map(posture=>
            [posture,Number(commandPostureDamage(command,0,0,posture,100).toFixed(3))])),
          play:Number(stableEvolutionPlaythroughVector(command).averageContribution.toFixed(3))};
      }),crescendoCommand=synthesizeSharpshootMarkPath('COMMON','mark_posture_spec','COMMON',
        'mark_posture_finisher_twist','COMMON',ids[3],'COMMON'),
      below=commandPostureDamage(crescendoCommand,0,0,49,100),
      atHalf=commandPostureDamage(crescendoCommand,0,0,50,100),
      atThreeQuarters=commandPostureDamage(crescendoCommand,0,0,75,100),
      atDoubleHalf=commandPostureDamage(crescendoCommand,0,0,100,200),
      atDoubleThreeQuarters=commandPostureDamage(crescendoCommand,0,0,150,200),
      deltaOne=atThreeQuarters-atHalf,deltaTwo=atDoubleThreeQuarters-atDoubleHalf,
      high=commandPostureDamage(crescendoCommand,0,0,900000,1000000),
      extremeMax=Number.MAX_SAFE_INTEGER,
      extreme=commandPostureDamage(crescendoCommand,0,0,extremeMax*.9,extremeMax);
    if(!(atHalf>below)||!(atThreeQuarters>atHalf)||Math.abs(deltaTwo-deltaOne*2)>.01||
       !Number.isFinite(high)||!Number.isFinite(extreme)||!(extreme>high))
      throw new Error('Finisher Crescendo threshold snapshot, proportional bar scale or finite output regressed');
    return {cards:matrix.cards,groups:matrix.groups,rows,standard,
      maxReferenceSpread:Number(maxReferenceSpread.toFixed(4)),
      maxPlaySpread:Number(maxPlaySpread.toFixed(4)),thresholdLeaderRows,markLeaderRows,
      markAllocationLeaderRows,damageLeaderRows,crescendoRows,highBarLeaderRows,
      runtime:{below,atHalf,atThreeQuarters,atDoubleHalf,atDoubleThreeQuarters,deltaOne,deltaTwo},
      finite:{high,extreme}};
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
  globalThis.__criticalFamilyAudit=(()=>{
    const rarities=['COMMON','UNCOMMON','RARE','LEGENDARY'],specId='mark_critical_spec',
      twistIds=['mark_critical_volley_twist','mark_critical_weight_twist',
        'mark_critical_reward_twist','mark_critical_packet_twist'],
      focusIds=['mark_focus_concentrated_twist','mark_focus_pulse_twist',
        'mark_focus_bloom_twist','mark_focus_trail_twist'],twistRows=[];
    let identityRows=0,minFocusMarkMargin=Infinity;
    for(const formRarity of rarities)for(const specRarity of rarities)
      for(const twistRarity of rarities){
        const commands=twistIds.map(id=>synthesizeSharpshootMarkPath(formRarity,specId,
          specRarity,id,twistRarity)),focus=focusIds.map(id=>synthesizeSharpshootMarkPath(
          formRarity,'mark_focus_spec',specRarity,id,twistRarity)),
          minFocusMark=Math.min(...focus.map(command=>command.markGain)),
          maxCriticalMark=Math.max(...commands.map(command=>command.markGain));
        minFocusMarkMargin=Math.min(minFocusMarkMargin,minFocusMark-maxCriticalMark);
        const [volley,weight,reward,packet]=commands;
        if(commands.some(command=>!command||command.consumeChain||command.extraChainBonus>0||
             (command.realChainScalingMultiplier||1)!==1)||
           commandDeliveryContract(volley).pattern!=='SEQUENTIAL'||
           totalCommandChainGain(volley)!==volley.hits||!(volley.hits>1)||
           commandDeliveryContract(weight).pattern!=='SINGLE'||weight.hits!==1||
           !(weight.critChancePerStartingMark>0)||commandMarkPlan(weight,12).consumedTotal!==0||
           !(commandExpectedLocalCritChance(weight,12)>commandExpectedLocalCritChance(weight,0))||
           commandDeliveryContract(reward).pattern!=='SINGLE'||!(reward.critMarkBonus>0)||
           commandDeliveryContract(packet).pattern!=='SIMULTANEOUS_PACKET'||packet.hits<2||
           packet.critRollMode!=='SHARED_ACTION'||totalCommandChainGain(packet)!==1)
          throw new Error('F1S4 Twist identity or Delivery failed at '+
            [formRarity,specRarity,twistRarity].join('/')+' '+JSON.stringify(commands.map(command=>({
              name:command&&command.name,pattern:command&&commandDeliveryContract(command).pattern,
              hits:command&&command.hits,chain:command&&totalCommandChainGain(command),
              extra:command&&command.extraChainBonus,real:command&&command.realChainScalingMultiplier,
              read:command&&command.critChancePerStartingMark,reward:command&&command.critMarkBonus,
              roll:command&&command.critRollMode,consumed:command&&commandMarkPlan(command,12).consumedTotal}))));
        twistRows.push({formRarity,specRarity,twistRarity,
          commands:commands.map(command=>({id:command.apexRefinementId||command.name,
            hits:command.hits,damage:commandDirectDamageTotal(command),mark:command.markGain,
            crit:command.critChance,critRead:command.critChancePerStartingMark,
            critMark:command.critMarkBonus,chain:totalCommandChainGain(command),
            play:stableEvolutionPlaythroughVector(command).averageContribution}))});
        identityRows++;
      }
    if(minFocusMarkMargin<1)throw new Error('F1S4 overtook F1S1 guaranteed Mark: '+minFocusMarkMargin);
    const configs=[
      {familyId:'F1S4T1',twistId:twistIds[0],ids:[
        'mark_critical_volley_contacts_apex','mark_critical_volley_chance_apex',
        'mark_critical_volley_mark_apex','mark_critical_volley_damage_apex'],
        roles:['hits','crit','mark','damage']},
      {familyId:'F1S4T2',twistId:twistIds[1],ids:[
        'mark_critical_weight_read_apex','mark_critical_weight_chance_apex',
        'mark_critical_weight_mark_apex','mark_critical_weight_damage_apex'],
        roles:['critRead','crit','mark','damage']},
      {familyId:'F1S4T3',twistId:twistIds[2],ids:[
        'mark_critical_reward_bonus_apex','mark_critical_reward_chance_apex',
        'mark_critical_reward_mark_apex','mark_critical_reward_damage_apex'],
        roles:['critMark','crit','mark','damage']},
      {familyId:'F1S4T4',twistId:twistIds[3],ids:[
        'mark_critical_packet_contacts_apex','mark_critical_packet_chance_apex',
        'mark_critical_packet_mark_apex','mark_critical_packet_damage_apex'],
        roles:['hits','crit','mark','damage']}
    ],families=[];
    for(const config of configs){
      let maxSpread=0,strictRoleRows=0;
      const audit=auditStableApexFamily({familyId:config.familyId,specId,twistId:config.twistId,
        ids:config.ids,inspect:({command,history})=>({id:history.id,
          damage:commandDirectDamageTotal(command),mark:command.markGain,hits:command.hits,
          crit:command.critChance,critRead:command.critChancePerStartingMark,
          critMark:command.critMarkBonus,chain:totalCommandChainGain(command),
          rollMode:command.critRollMode,play:stableEvolutionPlaythroughVector(command).averageContribution}),
        inspectGroup:group=>{
          for(let index=0;index<config.roles.length;index++){
            const role=config.roles[index],chosen=group[index][role],best=Math.max(...group.map(row=>row[role]));
            if(chosen+1e-6<best)throw new Error(config.familyId+' '+role+' role lost');
            if(chosen>Math.max(...group.filter((_,i)=>i!==index).map(row=>row[role]))+1e-6)
              strictRoleRows++;
          }
          const plays=group.map(row=>row.play),mean=plays.reduce((a,b)=>a+b,0)/plays.length,
            spread=(Math.max(...plays)-Math.min(...plays))/Math.max(1,mean);
          maxSpread=Math.max(maxSpread,spread);
        }});
      if(maxSpread>.28||strictRoleRows<1)throw new Error(config.familyId+
        ' Apex balance/role separation failed '+JSON.stringify({maxSpread,strictRoleRows}));
      families.push({familyId:config.familyId,cards:audit.cards,groups:audit.groups,
        maxSpread:Number(maxSpread.toFixed(4)),strictRoleRows});
    }
    let sharedRolls=0,independentRolls=0;
    const shared=createCommandCritPlan({hits:4,critChance:.5,critRollMode:'SHARED_ACTION'},
      'knight',()=>{sharedRolls++;return .25;}),independent=createCommandCritPlan(
      {hits:4,critChance:.5,critRollMode:'PER_CONTACT'},'knight',()=>{
        independentRolls++;return independentRolls%2?.25:.75;});
    if(sharedRolls!==1||new Set(shared.contacts.map(row=>row.critical)).size!==1||
       independentRolls!==4||new Set(independent.contacts.map(row=>row.critical)).size!==2)
      throw new Error('F1S4 shared/independent Crit runtime roll contract failed');
    const hugeWeight=sharpshootCritReadWeightMultiplier(Number.MAX_SAFE_INTEGER),
      hugeChance=commandExpectedLocalCritChance({critChance:.1,
        critChancePerStartingMark:Number.MAX_VALUE},Number.MAX_SAFE_INTEGER);
    if(!Number.isFinite(hugeWeight)||hugeWeight<=1||hugeChance!==1)
      throw new Error('F1S4 uncapped Delivery/Mark read lost finite natural Crit saturation');
    return {cards:families.reduce((sum,row)=>sum+row.cards,0),groups:families.reduce(
      (sum,row)=>sum+row.groups,0),identityRows,minFocusMarkMargin,families,
      runtime:{sharedRolls,independentRolls},finite:{hugeWeight,hugeChance},twistRows};
  })();
  globalThis.__afflictionFamilyAudit=(()=>{
    const rarities=['COMMON','UNCOMMON','RARE','LEGENDARY'],specId='mark_affliction_spec',
      twistIds=['mark_affliction_barbed_twist','mark_affliction_mark_read_twist',
        'mark_affliction_blood_trail_twist','mark_affliction_serrated_volley_twist'],
      focusTwistIds=['mark_focus_concentrated_twist','mark_focus_pulse_twist',
        'mark_focus_bloom_twist','mark_focus_trail_twist'],twistRows=[];
    let identityRows=0,minBaseMark=Infinity,minFocusMarkMargin=Infinity;
    for(const formRarity of rarities)for(const specRarity of rarities)
      for(const twistRarity of rarities){
        const commands=twistIds.map(id=>synthesizeSharpshootMarkPath(formRarity,specId,
          specRarity,id,twistRarity)),focus=focusTwistIds.map(id=>synthesizeSharpshootMarkPath(
          formRarity,'mark_focus_spec',specRarity,id,twistRarity)),
          [barbed,read,trail,volley]=commands;
        minBaseMark=Math.min(minBaseMark,...commands.map(command=>command.markGain));
        minFocusMarkMargin=Math.min(minFocusMarkMargin,
          Math.min(...focus.map(command=>command.markGain))-
          Math.max(...commands.map(command=>command.markGain)));
        const volleyBleed=commandBleedAmount(volley,8),splitBleed=Array.from(
          {length:volley.hits},(_,index)=>commandBleedContactAmount(volley,8,index))
          .reduce((sum,value)=>sum+value,0);
        if(commands.some(command=>!command||command.markGain<1||command.consumeMark||
             commandMarkPlan(command,12).consumedTotal!==0)||
           commandDeliveryContract(barbed).pattern!=='SINGLE'||barbed.hits!==1||
           !(commandBleedAmount(barbed,0)>0)||barbed.afflictionPerStartingMark||
           barbed.afflictionMarkPerTick||barbed.afflictionSplitPerContact||
           commandDeliveryContract(read).pattern!=='SINGLE'||read.hits!==1||
           !(read.afflictionPerStartingMark>0)||read.afflictionMarkPerTick||
           commandBleedAmount(read,12)<=commandBleedAmount(read,0)||
           commandDeliveryContract(trail).pattern!=='SINGLE'||trail.hits!==1||
           !(trail.afflictionMarkPerTick>0)||trail.afflictionPerStartingMark||
           commandDeliveryContract(volley).pattern!=='SIMULTANEOUS_PACKET'||volley.hits<2||
           !volley.afflictionSplitPerContact||totalCommandChainGain(volley)!==1||
           !volley.chainGainPattern||volley.chainGainPattern[0]!==1||
           volley.chainGainPattern.slice(1).some(Boolean)||
           Math.abs(splitBleed-volleyBleed)>1e-6)
          throw new Error('F1S5 Twist identity, Base Mark, or Delivery failed at '+
            [formRarity,specRarity,twistRarity].join('/')+' '+JSON.stringify(commands.map(command=>({
              name:command&&command.name,pattern:command&&commandDeliveryContract(command).pattern,
              hits:command&&command.hits,mark:command&&command.markGain,
              bleed:command&&commandBleedAmount(command,12),
              read:command&&command.afflictionPerStartingMark,
              tickMark:command&&command.afflictionMarkPerTick,
              split:command&&command.afflictionSplitPerContact,
              consumed:command&&commandMarkPlan(command,12).consumedTotal}))));
        twistRows.push({formRarity,specRarity,twistRarity,
          commands:commands.map(command=>({id:command.name,hits:command.hits,
            damage:commandDirectDamageTotal(command),mark:command.markGain,
            bleed:commandBleedAmount(command,8),read:command.afflictionPerStartingMark,
            tickMark:command.afflictionMarkPerTick,chain:totalCommandChainGain(command),
            play:stableEvolutionPlaythroughVector(command).averageContribution}))});
        identityRows++;
      }
    if(minBaseMark<1)throw new Error('F1S5 lost Sharpshoot Base Mark: '+minBaseMark);
    if(minFocusMarkMargin<1)throw new Error('F1S5 overtook F1S1 Primary Mark: '+minFocusMarkMargin);
    const configs=[
      {familyId:'F1S5T1',twistId:twistIds[0],ids:[
        'mark_affliction_barbed_bleed_apex','mark_affliction_barbed_mark_apex',
        'mark_affliction_barbed_damage_apex','mark_affliction_barbed_break_apex'],
        roles:['bleed','mark','damage','breakBleed']},
      {familyId:'F1S5T2',twistId:twistIds[1],ids:[
        'mark_affliction_read_scale_apex','mark_affliction_read_bleed_apex',
        'mark_affliction_read_mark_apex','mark_affliction_read_damage_apex'],
        roles:['read','bleed','mark','damage']},
      {familyId:'F1S5T3',twistId:twistIds[2],ids:[
        'mark_affliction_trail_tick_apex','mark_affliction_trail_bleed_apex',
        'mark_affliction_trail_mark_apex','mark_affliction_trail_final_apex'],
        roles:['tickMark','bleed','mark','finalMark']},
      {familyId:'F1S5T4',twistId:twistIds[3],ids:[
        'mark_affliction_volley_contacts_apex','mark_affliction_volley_bleed_apex',
        'mark_affliction_volley_mark_apex','mark_affliction_volley_damage_apex'],
        roles:['hits','bleed','mark','damage']}
    ],families=[];
    for(const config of configs){
      let maxSpread=0,strictRoleRows=0;
      const audit=auditStableApexFamily({familyId:config.familyId,specId,
        twistId:config.twistId,ids:config.ids,inspect:({command,history})=>({id:history.id,
          damage:commandDirectDamageTotal(command),mark:command.markGain,hits:command.hits,
          bleed:commandBleedAmount(command,0),read:command.afflictionPerStartingMark||0,
          tickMark:command.afflictionMarkPerTick||0,finalMark:command.afflictionFinalMark||0,
          breakBleed:command.afflictionBreakApplicationBonus||0,
          chain:totalCommandChainGain(command),
          play:stableEvolutionPlaythroughVector(command).averageContribution}),
        inspectGroup:group=>{
          for(let index=0;index<config.roles.length;index++){
            const role=config.roles[index],chosen=group[index][role],
              best=Math.max(...group.map(row=>row[role]));
            if(chosen+1e-6<best)throw new Error(config.familyId+' '+role+' role lost');
            if(chosen>Math.max(...group.filter((_,i)=>i!==index).map(row=>row[role]))+1e-6)
              strictRoleRows++;
          }
          const plays=group.map(row=>row.play),mean=plays.reduce((a,b)=>a+b,0)/plays.length,
            spread=(Math.max(...plays)-Math.min(...plays))/Math.max(1,mean);
          maxSpread=Math.max(maxSpread,spread);
        }});
      if(maxSpread>.28||strictRoleRows<1)throw new Error(config.familyId+
        ' Apex balance/role separation failed '+JSON.stringify({maxSpread,strictRoleRows}));
      families.push({familyId:config.familyId,cards:audit.cards,groups:audit.groups,
        maxSpread:Number(maxSpread.toFixed(4)),strictRoleRows});
    }
    const read=synthesizeSharpshootMarkPath('COMMON',specId,'COMMON',twistIds[1],'COMMON'),
      low=commandBleedAmount(read,1000),high=commandBleedAmount(read,1000000),
      extreme=commandBleedAmount(read,Number.MAX_SAFE_INTEGER),
      breakApex=synthesizeSharpshootMarkPath('COMMON',specId,'COMMON',twistIds[0],
        'COMMON','mark_affliction_barbed_break_apex','COMMON'),
      normalBleed=commandAppliedBleedAmount(breakApex,0,false),
      breakBleed=commandAppliedBleedAmount(breakApex,0,true),savedBoss=boss;
    boss={bleed:0,bleedTurns:0,bleedLater:0,bleedLaterTurns:0,bleedMark:0,
      bleedMarkLater:0};
    addBossBleed(10,2,3);
    const delayed={bleed:boss.bleed,bleedLater:boss.bleedLater,
      markPerTick:boss.bleedMark,finalTickMark:boss.bleedMarkLater};
    boss=savedBoss;
    if(!Number.isFinite(extreme)||!(high>low)||!(extreme>high)||
       !(breakBleed>normalBleed)||delayed.bleed!==10||delayed.bleedLater!==10||
       delayed.markPerTick!==2||delayed.finalTickMark!==5)
      throw new Error('F1S5 uncapped read, Break application, or delayed Mark runtime failed');
    return {cards:families.reduce((sum,row)=>sum+row.cards,0),groups:families.reduce(
      (sum,row)=>sum+row.groups,0),identityRows,minBaseMark,minFocusMarkMargin,families,
      runtime:{normalBleed,breakBleed,delayed},uncapped:{low,high,extreme},twistRows};
  })();
  globalThis.__chargeFamilyAudit=(()=>{
    const rarities=['COMMON','UNCOMMON','RARE','LEGENDARY'],specId='mark_charge_spec',
      twistIds=['mark_charge_release_twist','mark_charge_packet_twist',
        'mark_charge_resonance_twist','mark_charge_distribution_twist'],rows=[];
    let minBaseMark=Infinity,minFocusMarkMargin=Infinity;
    for(const formRarity of rarities)for(const specRarity of rarities)
      for(const twistRarity of rarities){
        const commands=twistIds.map(id=>synthesizeSharpshootMarkPath(formRarity,specId,
          specRarity,id,twistRarity)),focus=synthesizeSharpshootMarkPath(formRarity,
          'mark_focus_spec',specRarity,'mark_focus_concentrated_twist',twistRarity),
          [release,packet,resonance,distribution]=commands;
        minBaseMark=Math.min(minBaseMark,...commands.map(command=>command.markGain));
        minFocusMarkMargin=Math.min(minFocusMarkMargin,
          focus.markGain-Math.max(...commands.map(command=>command.markGain)));
        if(commands.some(command=>!command||command.markGain<1||
             commandMarkPlan(command,12).consumedTotal!==0)||
           commandChargeMode(release)!=='FULL_RELEASE'||release.hits!==1||
           commandDeliveryContract(packet).pattern!=='SIMULTANEOUS_PACKET'||packet.hits<2||
           totalCommandChainGain(packet)!==1||!(packet.chargeMarkPerCharge>0)||
           commandChargeMarkBonus(packet,DEFENSE_CHARGE.expectedSpend)<1||
           commandChargeMode(resonance)!=='MARK_RESONANCE'||resonance.hits!==1||
           !(resonance.chargeDamagePerMarkPerCharge>0)||
           commandChargeMode(distribution)!=='DISTRIBUTED'||distribution.hits!==1||
           !(distribution.chargeDistributedDamagePerCharge>0)||
           !(distribution.chargeDistributedMarkPerAction>0)||
           Math.floor(distribution.chargeDistributedMarkPerAction*
             DEFENSE_CHARGE.expectedSpend+1e-9)<1)
          throw new Error('F1S6 Twist identity or runtime output failed at '+
            [formRarity,specRarity,twistRarity].join('/')+' '+JSON.stringify(commands.map(command=>({
              id:command&&command.name,mode:command&&commandChargeMode(command),
              hits:command&&command.hits,mark:command&&command.markGain,
              rate:command&&commandDefenseTemperRate(command),
              chargeMark:command&&command.chargeMarkPerCharge,
              resonance:command&&command.chargeDamagePerMarkPerCharge,
              distribution:command&&command.chargeDistributedDamagePerCharge,
              actionMark:command&&command.chargeDistributedMarkPerAction}))));
        rows.push({formRarity,specRarity,twistRarity,commands:commands.map(command=>({
          id:command.name,mode:commandChargeMode(command),hits:command.hits,
          damage:commandDirectDamageTotal(command),mark:command.markGain,
          rate:commandDefenseTemperRate(command),chargeMark:command.chargeMarkPerCharge,
          resonance:command.chargeDamagePerMarkPerCharge,
          distribution:command.chargeDistributedDamagePerCharge,
          actionMark:command.chargeDistributedMarkPerAction,
          expected:commandExpectedDefenseTemperPower(command),
          play:stableEvolutionPlaythroughVector(command).averageContribution}))});
      }
    if(minBaseMark<1||minFocusMarkMargin<1)
      throw new Error('F1S6 lost Base Mark or overtook Mark/Mark '+
        JSON.stringify({minBaseMark,minFocusMarkMargin}));
    const configs=[
      {twist:twistIds[0],ids:['mark_charge_release_power_apex',
        'mark_charge_release_mark_apex','mark_charge_release_reserve_apex',
        'mark_charge_release_break_apex'],roles:['rate','mark','retention','breakRate']},
      {twist:twistIds[1],ids:['mark_charge_packet_mark_apex',
        'mark_charge_packet_damage_apex','mark_charge_packet_reserve_apex',
        'mark_charge_packet_wave_apex'],roles:['chargeMark','damage','retention','waves']},
      {twist:twistIds[2],ids:['mark_charge_resonance_charge_apex',
        'mark_charge_resonance_read_apex','mark_charge_resonance_mark_apex',
        'mark_charge_resonance_reserve_apex'],roles:['rate','resonance','mark','retention']},
      {twist:twistIds[3],ids:['mark_charge_distribution_opening_apex',
        'mark_charge_distribution_shared_apex','mark_charge_distribution_mark_apex',
        'mark_charge_distribution_final_apex'],roles:['rate','distribution','actionMark','finalRate']}
    ],families=[];
    for(const config of configs){
      let roleRows=0,maxSpread=0;
      for(const apexRarity of rarities){
        const entries=config.ids.map(id=>{
          const command=synthesizeSharpshootMarkPath('COMMON',specId,'COMMON',config.twist,
            'COMMON',id,apexRarity);
          return {id,damage:commandDirectDamageTotal(command),mark:command.markGain,
            rate:commandDefenseTemperRate(command),chargeMark:command.chargeMarkPerCharge,
            resonance:command.chargeDamagePerMarkPerCharge,
            retention:command.chargeRetentionRate,breakRate:command.chargeBreakDamagePerCharge,
            distribution:command.chargeDistributedDamagePerCharge,
            actionMark:command.chargeDistributedMarkPerAction,
            finalRate:command.chargeFinalDamagePerCharge,waves:command.packetWaveCount||1,
            play:stableEvolutionPlaythroughVector(command).averageContribution};
        });
        for(let index=0;index<config.roles.length;index++){
          const role=config.roles[index],chosen=entries[index][role],best=Math.max(...entries.map(row=>row[role]));
          if(chosen+1e-6<best)throw new Error(config.twist+' '+role+' Apex role lost');
          if(chosen>Math.max(...entries.filter((_,i)=>i!==index).map(row=>row[role]))+1e-6)roleRows++;
        }
        const plays=entries.map(row=>row.play),mean=plays.reduce((a,b)=>a+b,0)/plays.length;
        maxSpread=Math.max(maxSpread,(Math.max(...plays)-Math.min(...plays))/Math.max(1,mean));
      }
      if(roleRows<4||maxSpread>.35)throw new Error(config.twist+' Charge Apex separation failed '+
        JSON.stringify({roleRows,maxSpread}));
      families.push({id:config.twist,roleRows,maxSpread:Number(maxSpread.toFixed(4))});
    }
    const common=synthesizeSharpshootMarkPath('COMMON',specId,'COMMON',twistIds[0],'COMMON'),
      low=commandChargeReleaseBonus(common,2,8,false),high=commandChargeReleaseBonus(common,20,8,false);
    if(!(high>low)||defenseChargeBankResult(3,1)!==3||defenseChargeBankResult(3,7)!==7)
      throw new Error('F1S6 uncapped release or best-phase bank failed');
    return {cards:rows.length*4,rows,minBaseMark,minFocusMarkMargin,families,
      uncapped:{low,high,bankSeven:defenseChargeBankResult(3,7)}};
  })();
  globalThis.__twistDeliveryDecisionAudit=(()=>{
    const rarities=['COMMON','UNCOMMON','RARE','LEGENDARY'],twists=
      SHARPSHOOT_MARK_ROUTE_CONTRACTS.filter(route=>route.depth===3&&
        route.runtimeReadiness==='MATERIALIZED'),patternCounts=Object.create(null);
    let rows=0,splitPayloadRows=0;
    for(const twist of twists){
      const decision=twist.deliveryDecision;
      if(!decision||!decision.reason||!decision.rejectedPattern)
        throw new Error(twist.id+' lost its authored Delivery decision');
      patternCounts[twist.delivery.pattern]=(patternCounts[twist.delivery.pattern]||0)+1;
      for(const formRarity of rarities)for(const specRarity of rarities)
        for(const twistRarity of rarities){
          const command=synthesizeSharpshootMarkPath(formRarity,twist.parentId,specRarity,
              twist.id,twistRarity),delivery=commandDeliveryContract(command),
            chain=totalCommandChainGain(command),expectedChain=
              decision.resourcePolicy==='CHAIN_PER_CONTACT'?command.hits:1;
          if(delivery.pattern!==twist.delivery.pattern||chain!==expectedChain||
             (delivery.pattern==='SINGLE'&&command.hits!==1)||
             (delivery.pattern!=='SINGLE'&&command.hits<2))
            throw new Error(twist.id+' runtime Delivery contradicts its authored decision at '+
              [formRarity,specRarity,twistRarity].join('/')+' '+JSON.stringify({
                pattern:delivery.pattern,hits:command.hits,chain,decision}));
          if(decision.payloadPolicy==='SPLIT_TOTAL_ACROSS_CONTACTS'){
            const total=commandAppliedBleedAmount(command,8,false),split=Array.from(
              {length:command.hits},(_,index)=>commandBleedContactAmount(command,8,index))
              .reduce((sum,value)=>sum+value,0);
            if(!command.afflictionSplitPerContact||Math.abs(total-split)>1e-6)
              throw new Error(twist.id+' multiplied or lost its split payload');
            splitPayloadRows++;
          }
          rows++;
        }
    }
    const expectedRows=twists.length*Math.pow(rarities.length,3);
    if(rows!==expectedRows||splitPayloadRows!==64)
      throw new Error('Stable Twist Delivery decision coverage drifted');
    return {twists:twists.length,rows,expectedRows,splitPayloadRows,patternCounts};
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
      postureRead:command.posturePerMark||0,postureEscalation:command.postureMarkEscalation||0,
      primer:command.posturePrimer||0,primerAmplification:command.posturePrimerAmplification||0,
      finisher:command.postureThresholdBonus||0,
      finisherCrescendo:command.postureThresholdCrescendo||0,
      crit:command.critChance||0,critRead:command.critChancePerStartingMark||0,
      critMark:command.critMarkBonus||0,bleed:commandBleedAmount(command),
      bleedRead:command.afflictionPerStartingMark||0,
      bleedTickMark:command.afflictionMarkPerTick||0,
      bleedFinalMark:command.afflictionFinalMark||0,
      bleedBreak:command.afflictionBreakApplicationBonus||0,
      bleedEvents:command.afflictionApplicationEventPower||0,
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
        rankStatRestorations:child.synthesisRankStatFloorRestorations||0,
        rankStatKeys:child.synthesisRankStatFloorKeys||[],
        parentMark:parent.markGain,childMark:child.markGain,parentBloom:parent.markBloomRate,
        childBloom:child.markBloomRate,childDamage});
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
      worstRankRepairs=repairRows.slice().sort((a,b)=>
        (b.rankFloor+b.rankStatDamage)-(a.rankFloor+a.rankStatDamage)).slice(0,8),
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
      worstRepairs,worstRankRepairs,worstLayerGains};
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
  /* Full-history coverage grows deliberately with every materialized family.
     Keep a finite guard, but allow the exhaustive route matrix to finish on
     slower CI/mobile-development machines. This timeout never touches gameplay. */
  vm.runInNewContext(source,sandbox,{filename:file,timeout:180000});
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
    const focusApex=audit.focusConcentratedApexAudit,
      standardApex=audit.focusConcentratedApexMatrix.filter(row=>row.formRarity==='COMMON'&&
        row.specRarity==='COMMON'&&row.twistRarity==='COMMON');
    if(!focusApex||focusApex.cards!==512||focusApex.distinctRoleRows<1||
       standardApex.length!==8)
      throw new Error('F1S1T1 Apex coverage failed: '+JSON.stringify({focusApex,standardApex}));
    console.log('MARK_MARK_T1_APEX '+JSON.stringify({audit:focusApex,standard:standardApex}));
    const pulseApex=audit.focusPulseApexAudit,
      standardPulseApex=audit.focusPulseApexMatrix.filter(row=>row.formRarity==='COMMON'&&
        row.specRarity==='COMMON'&&row.twistRarity==='COMMON');
    if(!pulseApex||pulseApex.cards!==768||pulseApex.densityRoleRows<1||
       pulseApex.payloadRoleRows<1||pulseApex.impactRoleRows<1||standardPulseApex.length!==12)
      throw new Error('F1S1T2 Apex coverage failed: '+JSON.stringify({pulseApex,standardPulseApex}));
    console.log('MARK_MARK_T2_APEX '+JSON.stringify({audit:pulseApex,standard:standardPulseApex}));
    const bloomApex=audit.focusBloomApexAudit,
      standardBloomApex=audit.focusBloomApexMatrix.filter(row=>row.formRarity==='COMMON'&&
        row.specRarity==='COMMON'&&row.twistRarity==='COMMON');
    if(!bloomApex||bloomApex.cards!==768||bloomApex.rateRoleRows<1||
       bloomApex.markRoleRows<1||bloomApex.impactRoleRows<1||standardBloomApex.length!==12)
      throw new Error('F1S1T3 Apex coverage failed: '+JSON.stringify({bloomApex,standardBloomApex}));
    console.log('MARK_MARK_T3_APEX '+JSON.stringify({audit:bloomApex,standard:standardBloomApex}));
    const trailApex=audit.focusTrailApexAudit,
      standardTrailApex=audit.focusTrailApexMatrix.filter(row=>row.formRarity==='COMMON'&&
        row.specRarity==='COMMON'&&row.twistRarity==='COMMON');
    if(!trailApex||trailApex.cards!==768||trailApex.strengthRoleRows<1||
       trailApex.markRoleRows<1||trailApex.impactRoleRows<1||standardTrailApex.length!==12)
      throw new Error('F1S1T4 Apex coverage failed: '+JSON.stringify({trailApex,standardTrailApex}));
    console.log('MARK_MARK_T4_APEX '+JSON.stringify({audit:trailApex,standard:standardTrailApex}));
    const focusFamily=audit.focusApexFamilyBalanceAudit;
    if(!focusFamily||focusFamily.rows!==256||focusFamily.maxFamilyScoreSpread>.12||
       focusFamily.maxFamilyPlaySpread>.12||focusFamily.maxCardScoreSpread>.20||
       focusFamily.maxCardPlaySpread>.20)
      throw new Error('F1S1 adjacent Apex balance failed: '+JSON.stringify(focusFamily));
    console.log('MARK_MARK_ADJACENT_APEX '+JSON.stringify(focusFamily));
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
  if(Math.min(...scoreRatios)<.87||Math.max(...scoreRatios)>1.20||
     Math.min(...playRatios)<.895||Math.max(...playRatios)>1.31)
    throw new Error('Mark/Mark versus Mark/Chain balance band failed: '+JSON.stringify({
      minScore:Math.min(...scoreRatios),maxScore:Math.max(...scoreRatios),
      minPlay:Math.min(...playRatios),maxPlay:Math.max(...playRatios)}));
  const postureTwists=sandbox.__postureTwistAudit;
  if(!postureTwists||postureTwists.cards!==256||postureTwists.standard.length!==4||
     postureTwists.maxScoreSpread>.15)
    throw new Error('F1S3 Twist coverage failed: '+JSON.stringify(postureTwists));
  console.log('MARK_POSTURE_TWISTS '+JSON.stringify({cards:postureTwists.cards,
    standard:postureTwists.standard,maxScoreSpread:postureTwists.maxScoreSpread,
    uncappedLow:postureTwists.uncappedLow,
    uncappedHigh:postureTwists.uncappedHigh,markReadRuntime:postureTwists.markReadRuntime,
    finisherRuntime:postureTwists.finisherRuntime,primerRuntime:postureTwists.primerRuntime}));
  const postureImpactApex=sandbox.__postureImpactApexAudit;
  if(!postureImpactApex||postureImpactApex.cards!==1024||postureImpactApex.maxScoreSpread>.15||
     postureImpactApex.postureLeaderRows!==256||postureImpactApex.markLeaderRows!==256||
     postureImpactApex.markAllocationLeaderRows!==256||
     postureImpactApex.damageLeaderRows!==256||postureImpactApex.fractureRows!==256)
    throw new Error('F1S3T1 Apex coverage or role balance failed: '+JSON.stringify(postureImpactApex));
  console.log('MARK_POSTURE_T1_APEX '+JSON.stringify({cards:postureImpactApex.cards,
    standard:postureImpactApex.standard,maxScoreSpread:postureImpactApex.maxScoreSpread,
    postureLeaderRows:postureImpactApex.postureLeaderRows,
    markLeaderRows:postureImpactApex.markLeaderRows,
    markAllocationLeaderRows:postureImpactApex.markAllocationLeaderRows,
    damageLeaderRows:postureImpactApex.damageLeaderRows,
    fractureRows:postureImpactApex.fractureRows,waveRuntime:postureImpactApex.waveRuntime}));
  const postureReadApex=sandbox.__postureReadApexAudit;
  if(!postureReadApex||postureReadApex.cards!==1024||postureReadApex.groups!==256||
     postureReadApex.maxReferenceSpread>.20||
     postureReadApex.maxPlaySpread>.35||postureReadApex.volumeLeaderRows!==256||
     postureReadApex.markLeaderRows!==256||postureReadApex.markAllocationLeaderRows!==256||
     postureReadApex.damageLeaderRows!==256||postureReadApex.escalationRows!==256||
     postureReadApex.highMarkLeaderRows!==256)
    throw new Error('F1S3T2 Apex coverage or role balance failed: '+JSON.stringify(postureReadApex));
  console.log('MARK_POSTURE_T2_APEX '+JSON.stringify({cards:postureReadApex.cards,
    groups:postureReadApex.groups,
    standard:postureReadApex.standard,maxReferenceSpread:postureReadApex.maxReferenceSpread,
    maxPlaySpread:postureReadApex.maxPlaySpread,volumeLeaderRows:postureReadApex.volumeLeaderRows,
    markLeaderRows:postureReadApex.markLeaderRows,
    markAllocationLeaderRows:postureReadApex.markAllocationLeaderRows,
    damageLeaderRows:postureReadApex.damageLeaderRows,
    escalationRows:postureReadApex.escalationRows,
    highMarkLeaderRows:postureReadApex.highMarkLeaderRows,uncapped:postureReadApex.uncapped}));
  console.log('MOVE_FAMILY_ACCEPTANCE_OK '+JSON.stringify({familyId:'F1S3T2',
    cards:postureReadApex.cards,groups:postureReadApex.groups,
    parentInheritance:true,siblingRoles:true,rarityCoverage:true,
    scenarioBalance:true,runtimeOrdering:true,uncappedScale:true}));
  const posturePrimerApex=sandbox.__posturePrimerApexAudit;
  if(!posturePrimerApex||posturePrimerApex.cards!==1024||posturePrimerApex.groups!==256||
     posturePrimerApex.maxReferenceSpread>.20||posturePrimerApex.maxPlaySpread>.35||
     posturePrimerApex.primerLeaderRows!==256||posturePrimerApex.markLeaderRows!==256||
     posturePrimerApex.markAllocationLeaderRows!==256||posturePrimerApex.damageLeaderRows!==256||
     posturePrimerApex.amplificationRows!==256||posturePrimerApex.highSourceLeaderRows!==256)
    throw new Error('F1S3T3 Apex coverage or role balance failed: '+JSON.stringify(posturePrimerApex));
  console.log('MARK_POSTURE_T3_APEX '+JSON.stringify({cards:posturePrimerApex.cards,
    groups:posturePrimerApex.groups,standard:posturePrimerApex.standard,
    maxReferenceSpread:posturePrimerApex.maxReferenceSpread,
    maxPlaySpread:posturePrimerApex.maxPlaySpread,primerLeaderRows:posturePrimerApex.primerLeaderRows,
    markLeaderRows:posturePrimerApex.markLeaderRows,
    markAllocationLeaderRows:posturePrimerApex.markAllocationLeaderRows,
    damageLeaderRows:posturePrimerApex.damageLeaderRows,
    amplificationRows:posturePrimerApex.amplificationRows,
    highSourceLeaderRows:posturePrimerApex.highSourceLeaderRows,
    runtime:posturePrimerApex.runtime,uncapped:posturePrimerApex.uncapped}));
  console.log('MOVE_FAMILY_ACCEPTANCE_OK '+JSON.stringify({familyId:'F1S3T3',
    cards:posturePrimerApex.cards,groups:posturePrimerApex.groups,
    parentInheritance:true,siblingRoles:true,rarityCoverage:true,
    scenarioBalance:true,runtimeOrdering:true,uncappedScale:true}));
  const postureFinisherApex=sandbox.__postureFinisherApexAudit;
  if(!postureFinisherApex||postureFinisherApex.cards!==1024||postureFinisherApex.groups!==256||
     postureFinisherApex.maxReferenceSpread>.20||postureFinisherApex.maxPlaySpread>.35||
     postureFinisherApex.thresholdLeaderRows!==256||postureFinisherApex.markLeaderRows!==256||
     postureFinisherApex.markAllocationLeaderRows!==256||postureFinisherApex.damageLeaderRows!==256||
     postureFinisherApex.crescendoRows!==256||postureFinisherApex.highBarLeaderRows!==256)
    throw new Error('F1S3T4 Apex coverage or role balance failed: '+JSON.stringify(postureFinisherApex));
  console.log('MARK_POSTURE_T4_APEX '+JSON.stringify({cards:postureFinisherApex.cards,
    groups:postureFinisherApex.groups,standard:postureFinisherApex.standard,
    maxReferenceSpread:postureFinisherApex.maxReferenceSpread,
    maxPlaySpread:postureFinisherApex.maxPlaySpread,
    thresholdLeaderRows:postureFinisherApex.thresholdLeaderRows,
    markLeaderRows:postureFinisherApex.markLeaderRows,
    markAllocationLeaderRows:postureFinisherApex.markAllocationLeaderRows,
    damageLeaderRows:postureFinisherApex.damageLeaderRows,
    crescendoRows:postureFinisherApex.crescendoRows,
    highBarLeaderRows:postureFinisherApex.highBarLeaderRows,
    runtime:postureFinisherApex.runtime,finite:postureFinisherApex.finite}));
  console.log('MOVE_FAMILY_ACCEPTANCE_OK '+JSON.stringify({familyId:'F1S3T4',
    cards:postureFinisherApex.cards,groups:postureFinisherApex.groups,
    parentInheritance:true,siblingRoles:true,rarityCoverage:true,
    scenarioBalance:true,runtimeOrdering:true,naturalBarScale:true}));
  const criticalFamily=sandbox.__criticalFamilyAudit;
  if(!criticalFamily||criticalFamily.cards!==4096||criticalFamily.groups!==1024||
     criticalFamily.identityRows!==64||criticalFamily.minFocusMarkMargin<1||
     criticalFamily.families.some(family=>family.cards!==1024||family.groups!==256||
       family.maxSpread>.28||family.strictRoleRows<1))
    throw new Error('F1S4 Mark/Critical family failed: '+JSON.stringify(criticalFamily));
  console.log('MARK_CRITICAL_FAMILY '+JSON.stringify({cards:criticalFamily.cards,
    groups:criticalFamily.groups,identityRows:criticalFamily.identityRows,
    minFocusMarkMargin:criticalFamily.minFocusMarkMargin,families:criticalFamily.families,
    runtime:criticalFamily.runtime,finite:criticalFamily.finite,
    standard:criticalFamily.twistRows.filter(row=>row.formRarity==='COMMON'&&
      row.specRarity==='COMMON'&&row.twistRarity==='COMMON')}));
  const afflictionFamily=sandbox.__afflictionFamilyAudit;
  if(!afflictionFamily||afflictionFamily.cards!==4096||afflictionFamily.groups!==1024||
     afflictionFamily.identityRows!==64||afflictionFamily.minBaseMark<1||
     afflictionFamily.minFocusMarkMargin<1||
     afflictionFamily.families.some(family=>family.cards!==1024||family.groups!==256||
       family.maxSpread>.28||family.strictRoleRows<1))
    throw new Error('F1S5 Mark/Affliction family failed: '+JSON.stringify(afflictionFamily));
  console.log('MARK_AFFLICTION_FAMILY '+JSON.stringify({cards:afflictionFamily.cards,
    groups:afflictionFamily.groups,identityRows:afflictionFamily.identityRows,
    minBaseMark:afflictionFamily.minBaseMark,
    minFocusMarkMargin:afflictionFamily.minFocusMarkMargin,
    families:afflictionFamily.families,runtime:afflictionFamily.runtime,
    uncapped:afflictionFamily.uncapped,
    standard:afflictionFamily.twistRows.filter(row=>row.formRarity==='COMMON'&&
      row.specRarity==='COMMON'&&row.twistRarity==='COMMON')}));
  const chargeFamily=sandbox.__chargeFamilyAudit;
  if(!chargeFamily||chargeFamily.cards!==256||chargeFamily.minBaseMark<1||
     chargeFamily.minFocusMarkMargin<1||chargeFamily.families.length!==4||
     chargeFamily.families.some(family=>family.roleRows<4||family.maxSpread>.35)||
     !(chargeFamily.uncapped.high>chargeFamily.uncapped.low)||
     chargeFamily.uncapped.bankSeven!==7)
    throw new Error('F1S6 Mark/Charge family failed: '+JSON.stringify(chargeFamily));
  console.log('MARK_CHARGE_FAMILY '+JSON.stringify({cards:chargeFamily.cards,
    minBaseMark:chargeFamily.minBaseMark,minFocusMarkMargin:chargeFamily.minFocusMarkMargin,
    families:chargeFamily.families,uncapped:chargeFamily.uncapped,
    standard:chargeFamily.rows.filter(row=>row.formRarity==='COMMON'&&
      row.specRarity==='COMMON'&&row.twistRarity==='COMMON')}));
  const deliveryDecisions=sandbox.__twistDeliveryDecisionAudit;
  if(!deliveryDecisions||deliveryDecisions.rows!==deliveryDecisions.expectedRows||
     deliveryDecisions.splitPayloadRows!==64)
    throw new Error('Stable Twist Delivery decision gate failed: '+JSON.stringify(deliveryDecisions));
  console.log('TWIST_DELIVERY_DECISIONS '+JSON.stringify(deliveryDecisions));
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
  const hierarchySpecs=hierarchyAudit?hierarchyAudit.routes-hierarchyAudit.twists-
      hierarchyAudit.apexes:0,
    expectedHierarchyComparisons=hierarchyAudit?hierarchySpecs*16+
      hierarchyAudit.twists*64+hierarchyAudit.apexes*256:0;
  if(!hierarchyAudit||hierarchyAudit.comparisons!==expectedHierarchyComparisons||
     hierarchyAudit.failures.length)
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
    worstRankRepairs:hierarchyAudit.worstRankRepairs,
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
  const expectedParentRoutes=hierarchyAudit.routes,
    expectedParentComparisons=hierarchySpecs*12+hierarchyAudit.twists*96+
      hierarchyAudit.apexes*576;
  if(!parentStrength||parentStrength.routes!==expectedParentRoutes||
     parentStrength.comparisons!==expectedParentComparisons||
     parentStrength.reversals.length||
     parentStrength.minScoreRetention+1e-6<parentStrengthMinRetention||
     parentStrength.minPlayRetention+1e-6<parentStrengthMinRetention||
     parentStrength.minChildScoreGap+1e-6<parentStrengthMinVisibleGap||
     parentStrength.minChildPlayGap+1e-6<parentStrengthMinVisibleGap)
    throw new Error('Stable child erased or reversed its parent strength: '+JSON.stringify({
       expectedRoutes:expectedParentRoutes,expectedComparisons:expectedParentComparisons,
      reversals:parentStrength&&parentStrength.reversals.slice(0,3),
      minScoreRetention:parentStrength&&parentStrength.minScoreRetention,
      minPlayRetention:parentStrength&&parentStrength.minPlayRetention,
      minChildScoreGap:parentStrength&&parentStrength.minChildScoreGap,
      minChildPlayGap:parentStrength&&parentStrength.minChildPlayGap,
      worstScore:parentStrength&&parentStrength.worstScore,
      worstPlay:parentStrength&&parentStrength.worstPlay}));
  console.log('IMPLEMENTATION_GATE '+JSON.stringify({
    structure:{passed:true,routes:hierarchyAudit.routes,twists:hierarchyAudit.twists,
      apexes:hierarchyAudit.apexes,comparisons:hierarchyAudit.comparisons},
    design:{passed:true,t3Cards:audit.focusBloomApexAudit.cards,
      t3RoleRows:[audit.focusBloomApexAudit.rateRoleRows,audit.focusBloomApexAudit.markRoleRows,
        audit.focusBloomApexAudit.impactRoleRows],t4Cards:audit.focusTrailApexAudit.cards,
      t4RoleRows:[audit.focusTrailApexAudit.strengthRoleRows,audit.focusTrailApexAudit.markRoleRows,
        audit.focusTrailApexAudit.impactRoleRows],f1s3Cards:postureTwists.cards,
      f1s3Relationships:postureTwists.standard.length,
       f1s3t1ApexCards:postureImpactApex.cards,
       f1s3t1ApexMaxSpread:postureImpactApex.maxScoreSpread,
       f1s3t2ApexCards:postureReadApex.cards,
       f1s3t2ApexGroups:postureReadApex.groups,
       f1s3t2ReferenceSpread:postureReadApex.maxReferenceSpread,
       f1s3t2PlaySpread:postureReadApex.maxPlaySpread,
       f1s3t3ApexCards:posturePrimerApex.cards,
       f1s3t3ApexGroups:posturePrimerApex.groups,
       f1s3t3ReferenceSpread:posturePrimerApex.maxReferenceSpread,
       f1s3t3PlaySpread:posturePrimerApex.maxPlaySpread,
       f1s3t4ApexCards:postureFinisherApex.cards,
       f1s3t4ApexGroups:postureFinisherApex.groups,
       f1s3t4ReferenceSpread:postureFinisherApex.maxReferenceSpread,
       f1s3t4PlaySpread:postureFinisherApex.maxPlaySpread,
       f1s4Cards:criticalFamily.cards,f1s4Groups:criticalFamily.groups,
       f1s4IdentityRows:criticalFamily.identityRows,
       f1s4MinMarkWall:criticalFamily.minFocusMarkMargin,
       f1s4FamilySpreads:criticalFamily.families.map(family=>family.maxSpread),
       f1s5Cards:afflictionFamily.cards,f1s5Groups:afflictionFamily.groups,
       f1s5IdentityRows:afflictionFamily.identityRows,
       f1s5MinBaseMark:afflictionFamily.minBaseMark,
       f1s5MinFocusMarkWall:afflictionFamily.minFocusMarkMargin,
       f1s5FamilySpreads:afflictionFamily.families.map(family=>family.maxSpread),
       deliveryDecisionTwists:deliveryDecisions.twists,
       deliveryDecisionRows:deliveryDecisions.rows},
    bug:{passed:true,runtime:true,mechanicAudit:true,posturePrimer:true,
       uncappedPostureRead:true,uncappedEscalatingRead:true,
       safeIntegerEscalatingRead:true,generalPrimerAmplification:true,
       safeIntegerPrimerAmplification:true,finisherCrescendoSnapshot:true,
       proportionalFinisherBarScale:true,safeIntegerFinisherCrescendo:true,doubleFracture:true,
       sharedCritRoll:true,independentCritRolls:true,finiteCritWeight:true,
       uncappedAfflictionRead:true,breakAffliction:true,delayedAfflictionMark:true},
    rarity:{passed:true,ladders:rankAudit.ladders,comparisons:rankAudit.comparisons,
      parentComparisons:parentStrength.comparisons},
    power:{passed:true,maxFamilyScoreSpread:audit.focusApexFamilyBalanceAudit.maxFamilyScoreSpread,
      maxFamilyPlaySpread:audit.focusApexFamilyBalanceAudit.maxFamilyPlaySpread,
      maxCardScoreSpread:audit.focusApexFamilyBalanceAudit.maxCardScoreSpread,
      maxCardPlaySpread:audit.focusApexFamilyBalanceAudit.maxCardPlaySpread}
  }));
}catch(error){
  console.error(error&&error.stack||error);
  process.exitCode=1;
}
