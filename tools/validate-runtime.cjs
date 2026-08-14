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
  })();`;
  vm.runInNewContext(source,sandbox,{filename:file,timeout:15000});
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
  if(!mechanics||mechanics.pulseMark!==8||mechanics.pulseEvents!==3||
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
}catch(error){
  console.error(error&&error.stack||error);
  process.exitCode=1;
}
