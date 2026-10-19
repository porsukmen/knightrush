/* Shared Stone King encounter and opt-in authoring preview.
 * Normal road fights use the native turn, damage and Journey session owners. */
(()=>{
  'use strict';
  const id='stone_king_pixel',art=window.KRStoneKingPixel,stage3D=window.KRStoneKingStage,mounted=window.KRStoneKingPlayer;
  const laneAim=window.KRStoneKingLaneAim.create({art,stage:stage3D});
  const flight=window.KRStoneKingRoyalFlight.create({art,stage:stage3D,laneAim}),fc=flight.config;
  // This court's warm edge light and cool stone bounce are local materials.
  // Neutral/default models and all contact/animation geometry stay shared.
  const arenaMaterials=Object.freeze({...art.palette,
    deep:'#414d63',dark:'#65738a',shade:'#8b98a7',stone:'#adb7c0',mid:'#bdc4c7',light:'#d3d3c8',edge:'#e7dec7',
    capeDark:'#293449',cape:'#404d63',capeLight:'#626d7b',
    mossDark:'#486348',moss:'#719153',mossLight:'#a2b970',
    bladeDark:'#2e394b',blade:'#4a5769',bladeMid:'#69768a',bladeEdge:'#929caa',
    brassDark:'#354153',brass:'#58677a',brassLight:'#8d98a7',grip:'#4d5b70',
    hairDark:'#758399',hair:'#98a5ae',hairLight:'#b9c1c3'});
  const knightMaterials=Object.freeze({armor:'#adbcc9',dark:'#465873',light:'#d8d9ce',steel:'#b8cad5',shine:'#eee1c4',
    plume:'#238fe0',blue:'#2d59a5'});
  const horseMaterials=Object.freeze({
    "#241f19": "#212122",
    "#263568": "#293e6e",
    "#342f26": "#31312f",
    "#354a8b": "#385591",
    "#3e271c": "#3b2925",
    "#48301f": "#3e3e3d",
    "#4b63ac": "#4a6db7",
    "#514531": "#4e473a",
    "#514936": "#4e4b3f",
    "#52696d": "#4f6b76",
    "#58341f": "#4c3c34",
    "#603b24": "#5d3d2d",
    "#664823": "#634a2c",
    "#67421e": "#574a38",
    "#68462c": "#65533f",
    "#746b55": "#716d5e",
    "#7c8d9f": "#7388a8",
    "#805334": "#7d553d",
    "#826233": "#73704f",
    "#82989d": "#819aa2",
    "#85532f": "#7d583e",
    "#8d683c": "#8a6a45",
    "#916027": "#927040",
    "#91653d": "#94734e",
    "#a37043": "#a77a54",
    "#aaa083": "#8d9da8",
    "#b38b55": "#b28d5a",
    "#b68139": "#bd8d49",
    "#b89345": "#ae9048",
    "#bac9d4": "#b4c9d9",
    "#d2c6a5": "#c9c5b8",
    "#d8b65e": "#e2b95f",
    "#edf4f7": "#eee1c5",
    "#eee5c9": "#ede2c5"
  });
  const equipmentMaterials=Object.freeze({
    "#18304f": "#153258",
    "#183653": "#15385c",
    "#1c426f": "#194478",
    "#234f88": "#205191",
    "#243540": "#213749",
    "#2d3d80": "#2a3f89",
    "#353938": "#323b41",
    "#37596a": "#345b73",
    "#38251f": "#352728",
    "#39302a": "#363233",
    "#395663": "#36586c",
    "#3b4d58": "#384f61",
    "#3e6491": "#3b669a",
    "#4059a8": "#3d5bb1",
    "#428ab9": "#408cc1",
    "#444844": "#414a4d",
    "#493025": "#46322e",
    "#493522": "#46372b",
    "#493b2e": "#463d37",
    "#4d65a2": "#4a67ab",
    "#536fac": "#5071b5",
    "#539ec9": "#52a0ce",
    "#5599c5": "#549bcb",
    "#593b2c": "#563d35",
    "#60432b": "#5d4534",
    "#6077c2": "#5d79ca",
    "#673724": "#64392d",
    "#6b482e": "#684a37",
    "#6f91d8": "#6e93dd",
    "#72bae2": "#72bce3",
    "#73a2ce": "#72a4d2",
    "#78432f": "#754538",
    "#79502e": "#765237",
    "#819ee0": "#80a0e4",
    "#82d0ed": "#83d2ec",
    "#83959f": "#8297a4",
    "#87462f": "#844838",
    "#87603b": "#846244",
    "#8cd4f5": "#8ed6f3",
    "#91a1ad": "#90a3b0",
    "#91a6bb": "#91a8be",
    "#92a2b0": "#92a4b3",
    "#985337": "#955540",
    "#a07a50": "#9e7c57",
    "#a2e3fa": "#a5e5f6",
    "#a67543": "#a4774b",
    "#a76043": "#a4624c",
    "#aa7a4b": "#a87c52",
    "#adc9d8": "#afcbd7",
    "#b8edff": "#bbeffa",
    "#b97936": "#b77b3d",
    "#bb7a50": "#b97c57",
    "#bcd3de": "#bed5db",
    "#bdcbd0": "#bfcdce",
    "#c6f2ff": "#caf4f9",
    "#c7444e": "#c44657",
    "#cc9260": "#cb9464",
    "#d39b69": "#d39d6c",
    "#d5e0e7": "#d8e2e2",
    "#d6ad43": "#d6af44",
    "#d7e6e9": "#dae8e4",
    "#d9e5ee": "#dce7e9",
    "#e3ab5b": "#e4ad5c",
    "#e4dec8": "#e7e0c3",
    "#e6c582": "#e8c780",
    "#edf4ef": "#f1f6e8",
    "#ffe37a": "#ffe575",
    "rgb(103,74,50)": "#644c3b",
    "rgb(104,138,209)": "#668cd7",
    "rgb(119,153,224)": "#769be4",
    "rgb(122,151,217)": "#7999de",
    "rgb(137,166,232)": "#89a8eb",
    "rgb(153,115,73)": "#967551",
    "rgb(169,105,38)": "#a66b2f",
    "rgb(17,41,72)": "#0e2b51",
    "rgb(175,111,44)": "#ac7134",
    "rgb(178,114,47)": "#af7437",
    "rgb(192,128,61)": "#be8243",
    "rgb(21,59,104)": "#123d71",
    "rgb(210,222,231)": "#d5e0e2",
    "rgb(212,206,184)": "#d6d0b5",
    "rgb(218,212,190)": "#ddd6bb",
    "rgb(220,164,84)": "#dca656",
    "rgb(221,215,193)": "#e0d9bd",
    "rgb(225,237,246)": "#e5eff0",
    "rgb(235,229,207)": "#eee7c9",
    "rgb(32,56,87)": "#1d3a60",
    "rgb(36,74,119)": "#214c80",
    "rgb(37,41,40)": "#222b31",
    "rgb(41,32,26)": "#262223",
    "rgb(43,47,46)": "#283137",
    "rgb(46,50,49)": "#2b343a",
    "rgb(47,38,32)": "#2c2829",
    "rgb(50,41,35)": "#2f2b2c",
    "rgb(52,56,52)": "#313a3d",
    "rgb(55,93,138)": "#345f93",
    "rgb(57,43,30)": "#362d27",
    "rgb(57,82,161)": "#3654aa",
    "rgb(58,62,58)": "#374043",
    "rgb(6,30,61)": "#032046",
    "rgb(60,64,63)": "#394248",
    "rgb(61,65,61)": "#3a4346",
    "rgb(63,49,36)": "#3c332d",
    "rgb(64,55,49)": "#3d393a",
    "rgb(66,52,39)": "#3f3630",
    "rgb(72,97,176)": "#4563b9",
    "rgb(75,79,75)": "#485154",
    "rgb(80,51,27)": "#4d3524",
    "rgb(80,66,53)": "#4d443e",
    "rgb(86,57,33)": "#533b2a",
    "rgb(89,112,187)": "#5672c4",
    "rgb(89,60,36)": "#563e2d"
  });
  const environmentMaterials=Object.freeze({horse:horseMaterials,equipment:equipmentMaterials});
  let sceneLightingEnabled=typeof BOOT_QUERY==='undefined'||BOOT_QUERY.get('stonelight')!=='neutral';
  function heldWorldFrame(state,raw){
    const p=art.pose(state,raw),u=stage3D.unit;
    return {wrist:{x:stage3D.actorX+p.wrist.x*u,y:(23.2-p.crouch-p.wrist.y)*u,z:stage3D.nearZ-p.wrist.z*u},
      axis:{x:p.axis.x,y:-p.axis.y,z:-p.axis.z},side:{x:p.side.x,y:-p.side.y,z:-p.side.z},unit:u};
  }
  const heldMotions=Object.fromEntries(['strike_stone_king','strike_stone_king_swipe'].map(state=>
    [state,flight.createSpeedClock(raw=>heldWorldFrame(state,raw),{lead:0,speed:fc.heldBladeSpeed,
      ease:state==='strike_stone_king_swipe'?fc.swipeSpeedEase:fc.speedEase})]));
  const sampleHeldPose=(state,raw,options={})=>laneAim.pose(state,heldMotions[state]?.rawAtFraction(raw)??raw,options);
  const contactArt={...art,pose:sampleHeldPose};
  const comboContact=window.KRStoneKingComboContact.create({art:contactArt,stage:stage3D,sampleCollider:values=>mounted.sampleCollider(values),
    sampleFlight:({actor,move,raw,lanes,direction})=>flight.sample('strike_'+move.flightKind,raw,
      {plantLane:move._stoneTargetLock?.plantLane??actor._stonePlantTarget??1,
        targetLane:move._stoneTargetLock?.targetLane??lanes[0]??1,
        direction:move._stoneTargetLock?.direction??direction,swipeHeight:move._stoneTargetLock?.height??move.height,camera:ensureCamera()}).weapon});
  const openingPhases=[],flightPhases=[],flightImpactHold=encounterImpactHold({pixelContact:true});
  let flightStart=art.approachDuration,flightEnd=flightStart;
  const addFlightPhase=(state,duration,command=-1,motionDuration=duration)=>{flightPhases.push({state,duration,motionDuration,command,start:flightEnd,end:flightEnd+duration});flightEnd+=duration;};
  const previewDuration=()=>flightEnd+.3;
  const previewClock=seconds=>seconds<previewDuration()?Math.max(0,seconds):art.approachDuration+(seconds-previewDuration())%(previewDuration()-art.approachDuration);
  function previewFrame(seconds){
    if(seconds<art.approachDuration)return {state:'idle',t:0,approach:Math.max(0,seconds)/art.approachDuration,label:'Saldırı mesafesine yaklaşıyor',comboStage:'vertical'};
    if(seconds<flightStart){
      const opening=openingPhases.find(p=>seconds<p.end);
      return {...opening,t:Math.max(0,Math.min(1,(seconds-opening.start)/opening.motionDuration)),approach:1};
    }
    const phase=flightPhases.find(p=>seconds<p.end);
    if(!phase)return {state:'idle_stone_king_right',t:0,approach:1,comboStage:'complete',label:'Kombo bitti · Duruşa döndü'};
    const index=phase.command,kind=flight.plan[index],state=phase.state;
    const label=state.startsWith('launch')?'Kontrol kolu kaldırıyor · Kılıç zeminden yükseliyor':state.startsWith('return')?'Kılıcı çağırıyor · Ele ve duruşa dönüş':
      (index+1)+'/8 · '+(kind==='swipe'?'Uçan yatay kesiş · ↓ eğil':'Uçan dikey kesiş · şerit değiştir');
    return {state,t:Math.max(0,Math.min(1,(seconds-phase.start)/phase.motionDuration)),approach:1,comboStage:'flight',command:index,label};
  }
  const stagePresentation=createBossPresentation();
  let camera=null,cameraCompact=null;
  let fixedPose={state:'idle',t:0},toolbar=null,lastPhase='',playback=null,lastUi=0,reviewTime=0;
  let approachElapsed=0,approachLast=0;
  let previewTarget=null,previewPlantTarget=null,previewGroundTarget=null,previousReviewTime=0;
  let previewCommands=new Map();
  const renderPerformance={start:0,frames:0,total:0,times:[]};
  function recordRenderPerformance(began,ended){
    if(!renderPerformance.start)renderPerformance.start=began;
    const elapsed=ended-began;renderPerformance.frames++;renderPerformance.total+=elapsed;renderPerformance.times.push(elapsed);
    const span=ended-renderPerformance.start;
    if(span<1000)return;
    const times=renderPerformance.times.sort((a,b)=>a-b);
    cvs.dataset.stoneKingRenderFps=(renderPerformance.frames*1000/span).toFixed(1);
    cvs.dataset.stoneKingDrawMs=(renderPerformance.total/renderPerformance.frames).toFixed(2);
    cvs.dataset.stoneKingDrawP95=times[Math.min(times.length-1,Math.floor(times.length*.95))].toFixed(2);
    cvs.dataset.stoneKingEnvironmentBuilds=String(stage3D.environmentStats().builds);
    renderPerformance.start=ended;renderPerformance.frames=0;renderPerformance.total=0;renderPerformance.times=[];
  }
  const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);},mix=(a,b,t)=>a+(b-a)*t;
  const chooseSwipeHeight=()=>Math.random()<.5?'low':'high';
  const commandLabel=(index,height='high')=>(index+1)+'/8 · '+(flight.plan[index]==='swipe'?
    (height==='low'?'Alçak uçan kesiş · ↑ zıpla':'Yüksek uçan kesiş · ↓ eğil'):'Uçan dikey kesiş · şerit değiştir');
  const playerLane=()=>Math.max(0,Math.min(2,Math.round(player.x)));
  const attacks=[{id:'royal_combo_1',w:24,minTier:1,rec:fc.recoverSwipe+fc.catch,comboType:'authored',comboRank:1,steps:[{
    lanes:()=>[Math.round(player.x)],height:'mid',tele:1.4,travel:heldMotions.strike_stone_king.duration,bodyLunge:0,stageReach:0,
    anim:'tele_stone_king',strike:'strike_stone_king',
    comboRecoverAnim:'bridge_stone_king_swipe',comboRecoverTime:.70,
    recoverAnim:'recover_stone_king',recoverPortion:1
  },{
    lanes:[0,1,2],height:'high',x:1,tele:.32,travel:heldMotions.strike_stone_king_swipe.duration,bodyLunge:0,stageReach:0,
    anim:'tele_stone_king_swipe',strike:'strike_stone_king_swipe',
    comboRecoverAnim:'bridge_stone_king_plant',comboRecoverTime:.65,
    recoverAnim:'recover_stone_king_swipe',recoverPortion:1,pixelContact:true
  },{
    lanes:()=>[boss._stonePlantTarget??playerLane()],height:'mid',tele:.42,travel:.45,bodyLunge:0,stageReach:0,
    attackType:'stone_king_plant',pixelContact:true,
    anim:'tele_stone_king_plant',strike:'strike_stone_king_plant',
    comboRecoverAnim:'hold_stone_king_plant',comboRecoverTime:.10,
    recoverAnim:'recover_stone_king_plant',recoverPortion:1
  },{
    lanes:()=>playerLane()===boss._stonePlantTarget?[]:[playerLane()],height:'low',tele:.48,travel:art.groundSpec.duration??1,bodyLunge:0,stageReach:0,
    attackType:'stone_king_ground',pixelContact:true,
    anim:'tele_stone_king_eruption',strike:'strike_stone_king_eruption',
    comboRecoverAnim:'launch_stone_king_flight',comboRecoverTime:fc.launch,
    recoverAnim:'recover_stone_king_plant',recoverPortion:1
  },...flight.plan.map((kind,index)=>{
    const cap=kind==='swipe'?'Swipe':'Overhead';
    return {lanes:kind==='swipe'?[0,1,2]:()=>[playerLane()],height:kind==='swipe'?'high':'mid',x:1,
      tele:fc['tele'+cap],travel:fc['strike'+cap],bodyLunge:0,stageReach:0,
      attackType:'stone_king_flight',pixelContact:true,flightKind:kind,flightIndex:index,
      anim:'tele_stone_king_flight_'+kind,strike:'strike_stone_king_flight_'+kind,
      ...(index<flight.plan.length-1?{comboRecoverAnim:'recover_stone_king_flight_'+kind,comboRecoverTime:fc['recover'+cap]}:{}),
      recoverAnim:'return_stone_king_flight',recoverPortion:1};
  })]}];
  // Keep the native mechanic classification and cadence, then restore this
  // authored sequence's target policy (a planted lane can have no eruption).
  const authoredTargets=attacks[0].steps.map(({lanes,x})=>({lanes,x}));
  BossCombatMechanics.normalizeSet(attacks,true);
  attacks[0].steps.forEach((step,index)=>{
    step.lanes=authoredTargets[index].lanes;
    if(authoredTargets[index].x!==undefined)step.x=authoredTargets[index].x;
  });
  // Preview and combat share every tell, strike, impact hold and transition.
  // A retimed combo must not keep rehearsing the old artwork-only clock.
  const openingStages=[['vertical','vertical','bridge'],['swipe','swipe','plantBridge'],['plant','plant','plant'],['eruptionTell','eruption']];
  const openingLabels={tele_stone_king:'Kılıcı kaldırıyor',strike_stone_king:'Dikey kesiş',bridge_stone_king_swipe:'Kılıcı güvenli yoldan yatay kesişe alıyor',
    tele_stone_king_swipe:'Yatay kesiş geliyor · ↓ eğil',strike_stone_king_swipe:'Yatay kesiş · ↓ eğil',bridge_stone_king_plant:'Şeridine yaklaşıyor',
    tele_stone_king_plant:'Kılıç zemine saplanacak · şerit değiştir',strike_stone_king_plant:'Kılıç zemine saplanıyor',hold_stone_king_plant:'Kılıç zeminde',
    tele_stone_king_eruption:'Şeridinin altından geliyor · ↑ zıpla',strike_stone_king_eruption:'Ters uç çıkıp hemen çekiliyor · ↑ zıpla'};
  function addOpening(state,duration,comboStage,motionDuration=duration){
    openingPhases.push({state,duration,motionDuration,comboStage,label:openingLabels[state],start:flightStart,end:flightStart+duration});
    flightStart+=duration;
  }
  attacks[0].steps.slice(0,4).forEach((step,index)=>{
    addOpening(step.anim,step.tele,openingStages[index][0]);
    addOpening(step.strike,step.travel+encounterImpactHold(step),openingStages[index][1],step.travel);
    if(index<3)addOpening(step.comboRecoverAnim,step.comboRecoverTime,openingStages[index][2]);
  });
  function rebuildFlightPhases(){
    flightPhases.length=0;flightEnd=flightStart;
    addFlightPhase('launch_stone_king_flight',fc.launch);
    flight.plan.forEach((kind,index)=>{
      const command=previewCommands.get(index),timing=command??flightTiming(kind,{targetLane:1,direction:1,swipeHeight:'high'});
      addFlightPhase('tele_stone_king_flight_'+kind,timing.tele,index);
      addFlightPhase('strike_stone_king_flight_'+kind,timing.travel+flightImpactHold,index,timing.travel);
      addFlightPhase(index===flight.plan.length-1?'return_stone_king_flight':'recover_stone_king_flight_'+kind,
        timing.recovery+(index===flight.plan.length-1?fc.catch:0),index);
    });
  }
  rebuildFlightPhases();
  const pass=()=>false;
  function lockNativeMove(actor){
    const move=actor.currentMove();
    if(actor.state!=='tele'||!move)return;
    // Cueing happens after the sequence driver on transition frames. Capture
    // the entire command here, before that frame can be drawn or hit-tested.
    const lock=move._stoneTargetLock||(move._stoneTargetLock=Object.freeze({
      lanes:Object.freeze(Array.from(actor.hazardLanes||[])),targetLane:actor.hazardLanes?.[0]??1,
      plantLane:actor._stonePlantTarget??1,height:move.height,
      direction:move.flightKind?(Math.random()<.5?-1:1):1}));
    move.lanes=lock.lanes;actor.hazardLanes=Array.from(lock.lanes);
    if(actor.sequenceIndex===0)actor._stoneComboTarget=lock.targetLane;
    if(actor.sequenceIndex===2)actor._stonePlantTarget=lock.targetLane;
    if(actor.sequenceIndex===3)actor._stoneGroundTarget=lock.lanes[0]??-1;
    if(!move.flightKind)return;
    actor._stoneFlightTarget=lock.targetLane;actor._stoneFlightDirection=lock.direction;
    actor._stoneFlightSwipeHeight=lock.height;move.flightDirection=lock.direction;
    const timing=flightTiming(move.flightKind,{targetLane:lock.targetLane,direction:lock.direction,swipeHeight:lock.height});
    move.travel=timing.travel;move.tele=timing.tele;move.comboRecoverTime=timing.recovery;
    actor.teleTime=move.flightKind==='overhead'?Math.max(move.tele,attackTeleTime(move,lock.lanes)-fc.armLead):
      attackTeleTime(move,lock.lanes);
    move.tele=actor.teleTime;
    if(actor.sequenceIndex===actor.attack.steps.length-1)actor.attack.rec=timing.recovery+fc.catch;
  }
  function bindNativeCue(actor){
    if(actor.cueMove===actor._stoneCueWrapper)return;
    const cue=actor.cueMove;
    actor._stoneCueWrapper=actor.cueMove=function(...args){
      const move=cue.apply(this,args);lockNativeMove(this);return move;
    };
  }
  const sequenceDriver={
    update(actor,dt){
      if(actor._artPreview)return true;
      if(actor._stoneRoad&&approachElapsed<art.approachDuration&&actor.state==='idle'&&actor.phase==='dodge'){
        approachElapsed=Math.min(art.approachDuration,approachElapsed+dt);
        actor.z=stage3D.depth(approachElapsed/art.approachDuration);
        return true;
      }
      bindNativeCue(actor);
      const entry=actor.state+':'+actor.sequenceIndex;
      if(actor._stoneEntry!==entry){
        actor._stoneEntry=entry;
        if(actor.state==='comboRecover'&&actor.sequenceIndex===1){actor._stonePlantTarget=playerLane();actor._stonePlantFrom=actor.x;}
        if(actor.state==='comboRecover'&&actor.sequenceIndex===2)comboContact.setPlanted({actor,lane:actor._stonePlantTarget??1});
        if(actor.state==='tele')lockNativeMove(actor);
        if(actor.state==='recover'&&actor.sequenceIndex===attacks[0].steps.length-1)actor._stoneRightIdle=true;
      }
      const presentation=sampleBossPresentation(actor,activeBossDefinition(),stagePresentation);
      const royal=royalMotion(presentation.anim,presentation.t,{plantLane:actor._stonePlantTarget??1,
        targetLane:actor._stoneFlightTarget??actor.hazardLanes?.[0]??1,direction:actor._stoneFlightDirection??1,
        swipeHeight:actor.currentMove()?.height??actor._stoneFlightSwipeHeight??'high'});
      if(royal){
        actor.x=actor.xTarget=royal.actorLane;actor.z=royal.actorZ;
        if(royal.phase==='launch'&&royal.t>=fc.liftAt)comboContact.clearPlanted();
      }else if(actor.state==='comboRecover'&&actor.sequenceIndex<2){
        const t=Math.max(0,Math.min(1,actor.stateT/comboStepRecoveryTime(actor.currentMove(),actor.attack)));
        const k=smooth(t),from=actor.sequenceIndex===0?actor._stoneComboTarget??1:actor._stonePlantFrom??1;
        const to=actor.sequenceIndex===0?1:actor._stonePlantTarget??1;
        actor.x=mix(from,to,k);actor.xTarget=actor.x;
      }else if(actor.sequenceIndex===1&&actor.state==='tele')actor.x=actor.xTarget=1;
      else if(actor.sequenceIndex>=2&&actor.sequenceIndex<=3&&['tele','strike','comboRecover','recover'].includes(actor.state)){
        const k=actor.state==='recover'?smooth((actor.stateT/1.4-.6)/.4):0;
        actor.x=actor.xTarget=mix(actor._stonePlantTarget??1,1,k);
      }
      if(actor.state!=='idle'||actor.phase!=='dodge'||actor.attacksLeft<=0)return false;
      actor.atkTimer-=dt;
      if(actor.atkTimer<=0){
        actor.attack={...attacks[0],steps:attacks[0].steps.map(step=>{
          if(step.flightKind!=='swipe')return {...step};
          const height=chooseSwipeHeight();
          return {...step,height,mechanic:height==='low'?'jumpAll':'duckAll'};
        })};
        actor.attacksLeft=Math.max(0,actor.attacksLeft-attacks[0].steps.length);
        actor._stonePlantTarget=null;actor._stoneGroundTarget=null;actor._stoneFlightTarget=null;actor._stoneFlightDirection=1;actor._stoneFlightSwipeHeight='high';
        actor.sequenceIndex=0;actor.state='tele';actor.stateT=0;actor.cueMove();actor._stoneEntry='tele:0';
        actor._stoneRightIdle=false;
        comboContact.clearPlanted('NEXT_COMBO');
        SFX.roar();
      }
      return true;
    },
    action:pass,parry:pass,key:pass,updatePlayer:pass,pointerMove:pass,pointerEnd:pass,
    pointerStart(){},cancelInput(){},cancel(actor){
      comboContact.clearPlanted('CANCELLED');
      for(const hazard of hazards){
        if(hazard.actor===actor){hazard.active=false;hazard.done=true;}
      }
    },drawLayer(){}
  };
  ENCOUNTERS.register(new EncounterDefinition(id,'boss',{
    name:'THE STONE KING',hitText:'The royal blade struck you',finisherHit:'The Stone King passed judgement',
    arenaLine:'THE STONE KING AWAKENS',scale:1.34,finisherReach:2,element:'earth',rises:false,labOnly:true,
    roadEnemy:true,roadOnly:true,roadHp:55,
    defenseStatus(actor){
      const remaining=actor.attacksLeft>0?attacks[0].steps.length:
        Math.max(0,attacks[0].steps.length-(actor.sequenceIndex||0)-(['comboRecover','recover','idle'].includes(actor.state)?1:0));
      return remaining?'ROYAL COMBO · '+remaining+' attacks left':'RECOVERING';
    },
    attacks,pixelContact:comboContact,sequenceDriver,draw(x,y,scale,state,t,hurt){
      const frame=sampleFrame();paintStatue(g,frame,hurt);
    }
  }));
  function ensureCamera(){
    const compact=innerWidth<1000;
    if(!camera||cameraCompact!==compact){
      camera=stage3D.makeCamera({width:VW,height:VH,compact});cameraCompact=compact;
      // Prepare each possible distance clock before playback. Building a new
      // swipe clock during its cue would otherwise interrupt the movement.
      for(const targetLane of[0,1,2])for(const direction of[-1,1]){
        flight.motionFor('overhead',{targetLane,direction,swipeHeight:'high',camera});
        for(const swipeHeight of['low','high']){
          const options={targetLane,direction,swipeHeight,camera};
          flight.motionFor('swipe',options);
          for(const phase of['tele_swipe','recover_overhead','recover_swipe'])flight.motionForPhase(phase,options);
        }
      }
    }
    return camera;
  }
  function flightTiming(kind,options={}){
    const locked={...options,camera:options.camera??ensureCamera()};
    return {tele:kind==='swipe'?flight.durationForPhase('tele_swipe',locked):fc.teleOverhead,
      travel:flight.durationFor(kind,locked),recovery:flight.durationForPhase('recover_'+kind,locked)};
  }
  function royalMotion(state,t,options){
    let phase;
    options={...options,camera:ensureCamera()};
    if(state==='launch_stone_king_flight')phase='launch';
    else if(state==='idle_stone_king_right')phase='idle_right';
    else if(state==='return_stone_king_flight'){
      const recovery=flight.durationForPhase('recover_swipe',options),seconds=t*(recovery+fc.catch);
      return seconds<recovery?flight.sample('recover_swipe',seconds/recovery,options):
        flight.sample('catch',(seconds-recovery)/fc.catch,options);
    }else if(state.includes('_stone_king_flight_'))phase=state.replace('_stone_king_flight_','_');
    return phase?flight.sample(phase,t,options):null;
  }
  function phaseDepth(state,t,approach){
    const close=art.plantSpec.actorZ,near=stage3D.nearZ;
    if(state==='bridge_stone_king_plant')return mix(near,close,smooth(t));
    if(state==='recover_stone_king_plant')return mix(close,near,smooth((t-.6)/.4));
    if(/_(plant|eruption)$/.test(state))return close;
    return stage3D.depth(approach);
  }
  function sampleFrame(){
      const now=performance.now();
      if(playback){
        reviewTime=playback.paused?playback.elapsed:previewClock((now-playback.started)/1000);
        if(reviewTime+1e-6<previousReviewTime){previewTarget=previewPlantTarget=previewGroundTarget=null;previewCommands.clear();rebuildFlightPhases();}
        let next=previewFrame(reviewTime);
        for(let count=0;count<flight.plan.length&&next.command>=0&&!previewCommands.has(next.command);count++){
          const command={targetLane:playerLane(),direction:Math.random()<.5?-1:1,
            swipeHeight:flight.plan[next.command]==='swipe'?chooseSwipeHeight():'high'};
          Object.assign(command,flightTiming(flight.plan[next.command],command));
          previewCommands.set(next.command,Object.freeze(command));rebuildFlightPhases();next=previewFrame(reviewTime);
        }
        if(['vertical','bridge'].includes(next.comboStage)&&previewTarget===null)previewTarget=playerLane();
        const target=previewTarget??playerLane();
        const bridge=next.state==='bridge_stone_king_swipe',vertical=next.comboStage==='vertical'||!next.comboStage;
        if(['plantBridge','plant','eruptionTell','eruption','recover','flight'].includes(next.comboStage)&&previewPlantTarget===null)previewPlantTarget=playerLane();
        if(['eruptionTell','eruption'].includes(next.comboStage)&&previewGroundTarget===null)previewGroundTarget=playerLane()===previewPlantTarget?-1:playerLane();
        if(next.command>=0&&!next.state.startsWith('return'))next.label=commandLabel(next.command,previewCommands.get(next.command).swipeHeight);
        let lane=bridge?mix(target,1,smooth(next.t)):vertical?target:1;
        if(next.comboStage==='plantBridge')lane=mix(1,previewPlantTarget,smooth(next.t));
        if(['plant','eruptionTell','eruption'].includes(next.comboStage))lane=previewPlantTarget;
        if(next.state==='recover_stone_king_plant')lane=mix(previewPlantTarget,1,smooth((next.t-.6)/.4));
        fixedPose={...next,lane};
        if(['eruptionTell','eruption'].includes(next.comboStage)&&previewGroundTarget<0)fixedPose.label='Saplı kılıç şeridi tehlikeli · Aynı şeritten uç çıkmıyor';
        previousReviewTime=reviewTime;
        if(now-lastUi>70){
          lastUi=now;toolbar.querySelector('input').value=Math.round(reviewTime/previewDuration()*1000);
          status((playback.paused?'Duraklatıldı · ':'')+fixedPose.label);
        }
      }
      if(!fixedPose&&!paused&&!boss._stoneRoad)approachElapsed=Math.min(art.approachDuration,approachElapsed+Math.min(.05,(now-approachLast)/1000));
      approachLast=now;
      const approach=fixedPose?(fixedPose.approach??1):approachElapsed/art.approachDuration;
      const stage=sampleBossPresentation(boss,activeBossDefinition(),stagePresentation);
      const state=fixedPose?.state||((stage.anim==='idle'&&boss._stoneRightIdle)?'idle_stone_king_right':stage.anim),t=fixedPose?.t??stage.t;
      const command=fixedPose?previewCommands.get(fixedPose.command):null;
      // Standalone poses and seeks also own a snapshot. Rendering never reads
      // the moving rider again to aim an attack that has already been cued.
      if(fixedPose&&!fixedPose.targetLock)fixedPose.targetLock=Object.freeze({
        targetLane:command?.targetLane??previewTarget??playerLane(),plantLane:previewPlantTarget??playerLane(),
        groundLane:previewGroundTarget??(/_eruption$/.test(state)?playerLane():-1),
        direction:command?.direction??1,height:command?.swipeHeight??'high'});
      const targetLock=fixedPose?.targetLock??boss.currentMove()?._stoneTargetLock;
      const royal=royalMotion(state,t,{plantLane:targetLock?.plantLane??boss._stonePlantTarget??1,
        targetLane:targetLock?.targetLane??boss._stoneFlightTarget??boss.hazardLanes?.[0]??1,
        direction:targetLock?.direction??boss._stoneFlightDirection??1,
        swipeHeight:targetLock?.height??boss.currentMove()?.height??boss._stoneFlightSwipeHeight??'high'});
      boss.z=royal?.actorZ??phaseDepth(state,t,approach);
      const lane=royal?.actorLane??fixedPose?.lane??(fixedPose?1:boss.x);
      const groundLane=fixedPose?targetLock.groundLane:(boss._stoneGroundTarget??-1);
      const cam=ensureCamera(),layout=stage3D.layout(cam,boss.z,lane,royal?.actorWorldX);
      cvs.dataset.stoneKingDistance=boss.z.toFixed(4);
      cvs.dataset.stoneKingViewScale=layout.statueDrawScale.toFixed(6);
      cvs.dataset.stoneKingFeet=layout.statueFoot.y.toFixed(3);
      cvs.dataset.stoneKingSizeRatio=layout.apparentRatio.toFixed(4);
      cvs.dataset.stoneKingLane=lane.toFixed(4);
      cvs.dataset.stoneKingBodyWorldX=layout.actorX.toFixed(6);
      cvs.dataset.stoneKingPlayerLane=player.x.toFixed(4);
      cvs.dataset.stoneKingCombatPhase=boss.phase||'';
      cvs.dataset.stoneKingTargetLane=String(fixedPose?targetLock.targetLane:(boss._stoneComboTarget??1));
      cvs.dataset.stoneKingComboStep=String(fixedPose?(fixedPose.comboStage==='vertical'?1:['swipe','bridge'].includes(fixedPose.comboStage)?2:3):Math.min(3,(boss.sequenceIndex||0)+1));
      cvs.dataset.stoneKingPlantTarget=String(fixedPose?targetLock.plantLane:(boss._stonePlantTarget??1));
      cvs.dataset.stoneKingGroundTarget=String(groundLane);
      cvs.dataset.stoneKingFlyingPhase=royal?.phase||'';
      cvs.dataset.stoneKingFlyingTarget=String(fixedPose?(royal?targetLock.targetLane:-1):(boss._stoneFlightTarget??-1));
      cvs.dataset.stoneKingFlyingDirection=String(fixedPose?(royal?targetLock.direction:0):(boss._stoneFlightDirection??0));
      cvs.dataset.stoneKingFlyingHeight=String(fixedPose?(command?.swipeHeight??'high'):(boss.currentMove()?.height??'high'));
      cvs.dataset.stoneKingFlyingTravel=String(fixedPose?(command?.travel??0):(boss.currentMove()?.travel??0));
      cvs.dataset.stoneKingCommand=String(fixedPose?(fixedPose.command??-1):(boss.currentMove()?.flightIndex??-1));
      cvs.dataset.stoneKingPlayerModel='mounted-jonathan';
      cvs.dataset.stoneKingPlayerUnit=mounted.nativeUnit.toFixed(4);
      cvs.dataset.stoneKingSwipeResult=comboContact.history.at(-1)?.result||'';
      cvs.dataset.stoneKingDuck=duckPostureAmountAt(player.duckT).toFixed(4);
      const phase=approach<1?'approach':!fixedPose&&isPlayerTurn()?'player-turn':state;
      if(phase!==lastPhase){
        lastPhase=phase;cvs.dataset.stoneKingPhase=phase;
        if(!fixedPose&&toolbar){
          const labels={approach:'Saldırı mesafesine yaklaşıyor',idle:'Bekliyor',tele_stone_king:'Şeridine hazırlanıyor',strike_stone_king:'Dikey kesiş',bridge_stone_king_swipe:'Yatay kesişe geçiyor',tele_stone_king_swipe:'Yatay kesiş geliyor · ↓ eğil',strike_stone_king_swipe:'Yatay kesiş · ↓ eğil',bridge_stone_king_plant:'Şeridine yaklaşıyor',tele_stone_king_plant:'Yere saplayacak · şerit değiştir',strike_stone_king_plant:'Kılıç zemine saplanıyor',hold_stone_king_plant:'Kılıç zeminde',tele_stone_king_eruption:groundLane<0?'Saplı kılıç şeridi tehlikeli':'Şeridinin altından geliyor · ↑ zıpla',strike_stone_king_eruption:groundLane<0?'Saplı kılıç şeridi tehlikeli':'Ters uç · ↑ zıpla',launch_stone_king_flight:'Kontrol kolu kaldırıyor · Kılıç yükseliyor',return_stone_king_flight:'Kılıcı çağırıyor · Duruşa dönüş',recover_stone_king:'Duruşa dönüyor','player-turn':'Sıra sende · komut seç'};
          const move=boss.currentMove(),flightLabel=move?.flightIndex>=0?commandLabel(move.flightIndex,move.height):'';
          status('Savaş · '+(labels[phase]||flightLabel||'Sıra sende'));
        }
      }
      return {state,t,cam,layout,groundLane,royal};
  }
  function paintStatue(context,frame,hurt=false){
    const {layout,cam}=frame;
    const camera={depth:cam.follow+boss.z,unit:stage3D.unit,height:cam.height,actorX:layout.actorX,cameraX:0};
    const sourcePose=frame.royal?.pose||sampleHeldPose(frame.state,frame.t,{lane:layout.lane,depth:boss.z}),
      detached=!!frame.royal?.detached;
    frame.weaponActorProjection={pose:sourcePose,actorX:layout.actorX,actorZ:boss.z,detached,
      x:layout.statueFoot.x,y:layout.statueOriginY,scale:layout.statueDrawScale,stageCamera:camera,
      localWeaponFrame:detached?null:(sourcePose.hideWeapon?sourcePose.releaseWeapon:sourcePose)};
    frame.worldWeapon=frame.royal?.weapon||art.weaponFrameFromPose(sourcePose,frame.weaponActorProjection);
    const renderPose=detached?art.worldWeaponPose(frame.worldWeapon,frame.weaponActorProjection,
      {depthRange:[0,Infinity],riderBackPass:true}):sourcePose;
    art.drawWithPose(context,layout.statueFoot.x,layout.statueOriginY,layout.statueDrawScale,renderPose,hurt,camera,frame.materials);
  }
  function coversWorld(){return mode==='boss'&&!!boss&&boss.definitionId===id;}
  function roadActive(){return coversWorld()&&!!boss._stoneRoad;}
  function usesLabHUD(){return coversWorld()&&!boss._stoneRoad;}
  function combatTarget(height=66){
    if(!roadActive())return null;
    const cam=ensureCamera(),foot=stage3D.project(cam,{x:stage3D.bodyLaneX(boss.x),y:0,z:boss.z}),
      point=stage3D.project(cam,{x:stage3D.bodyLaneX(boss.x),y:height/142*stage3D.statueHeight,z:boss.z}),
      rider=stage3D.project(cam,{x:stage3D.laneX(player.x),y:0,z:0});
    return {...point,s:foot.scale*stage3D.statueHeight/142,footX:rider.x,footY:rider.y};
  }
  function drawNativeEffects(context,draw){
    const anchor=combatTarget();
    context.save();
    try{context.translate(anchor.footX-laneX(player.x,1),anchor.footY-PLAYER_Y);draw();}
    finally{context.restore();}
  }
  function ownsPause(){return coversWorld()&&!!boss._artPreview;}
  function drawGroundTell(context,frame){
    if(frame.groundLane<0||!['tele_stone_king_eruption','strike_stone_king_eruption'].includes(frame.state))return;
    const x=stage3D.laneX(frame.groundLane),cam=frame.cam;
    context.save();context.strokeStyle='#d36a4d';context.fillStyle='#4c2825';
    context.globalAlpha=.5+.25*frame.t;context.lineWidth=2;
    const corners=[[-.75,-.6],[.75,-.6],[.75,.6],[-.75,.6]].map(([dx,z])=>stage3D.project(cam,{x:x+dx,y:.015,z}));
    context.beginPath();corners.forEach((p,i)=>i?context.lineTo(p.x,p.y):context.moveTo(p.x,p.y));context.closePath();context.fill();context.stroke();
    for(const path of [[[-1.15,-.9],[-.55,-.35],[-.7,.15],[.1,.3],[.6,.75]],[[.8,-.9],[.15,-.35],[.3,.15],[1.1,.65]]]){
      context.beginPath();path.forEach(([dx,z],i)=>{const p=stage3D.project(cam,{x:x+dx,y:.025,z});i?context.lineTo(p.x,p.y):context.moveTo(p.x,p.y);});context.stroke();
    }
    context.restore();
  }
  function drawScene(context){
    const renderStarted=performance.now();
    const frame=sampleFrame(),cam=frame.cam,config=stage3D;
    const arenaReady=!!window.KRStoneKingArena?.coversWorld(),lit=sceneLightingEnabled&&arenaReady;
    frame.materials=lit?arenaMaterials:null;
    cvs.dataset.stoneKingEnvironment=arenaReady?'crownfall-court':'loading';
    cvs.dataset.stoneKingSceneLighting=lit?'court':'neutral';
    stage3D.drawEnvironment(context,cam,typeof viewScale==='number'?{scale:viewScale,x:viewX,y:viewY}:null);
    const normalFight=roadActive();
    if(normalFight)drawNativeEffects(context,()=>drawParticles(true));
    const statueSize=config.statueHeight/16;
    stage3D.drawShadow(context,cam,frame.layout.actorX,boss.z,3.8*statueSize,1.25*statueSize,.3);
    if(!fixedPose&&boss.state==='tele'){
      context.save();context.globalAlpha=.12+.12*frame.t;context.fillStyle='#c34643';
      for(const lane of boss.hazardLanes||[1]){
        const centre=stage3D.laneX(lane),half=config.laneWidth*.48;
        const corners=[[-half,-1],[half,-1],[half,boss.z],[-half,boss.z]].map(([x,z])=>stage3D.project(cam,{x:x+centre,y:.015,z}));
        context.beginPath();corners.forEach((p,i)=>i?context.lineTo(p.x,p.y):context.moveTo(p.x,p.y));context.closePath();context.fill();
      }
      context.restore();
    }
    drawGroundTell(context,frame);
    paintStatue(context,frame,boss.hurtT>0);
    if(normalFight)drawNativeEffects(context,()=>{drawParticles(false,true);drawSquire();});
    const knightX=stage3D.laneX(player.x);
    stage3D.drawShadow(context,cam,knightX,0,22/frame.layout.knightFoot.scale,.8,.32);
    if(player.alive||player.mountedDeath){
      mounted.draw(context,mounted.frame({cam,player,live:true,lighting:lit?knightMaterials:null,
        preserveLivePlacement:normalFight,environmentMaterials:lit?environmentMaterials:null}));
    }
    if(frame.worldWeapon)art.drawWeapon(context,cam,frame.worldWeapon,{depthRange:[-Infinity,0],materials:frame.materials,actorProjection:frame.weaponActorProjection});
    if(frame.groundLane>=0&&frame.state==='strike_stone_king_eruption')art.drawGroundBlade(context,cam,{x:stage3D.laneX(frame.groundLane),z:0,height:art.groundEruption(frame.t).height,materials:frame.materials});
    if(normalFight)drawNativeEffects(context,()=>{drawProjectiles();drawParticles();});
    recordRenderPerformance(renderStarted,performance.now());
  }
  function drawHUD(context){
    context.save();context.textAlign='left';context.font='bold 12px monospace';context.fillStyle='#dedbd0';context.fillText('TAŞ KRAL',14,23);
    context.fillStyle='#35373a';context.fillRect(14,31,108,5);context.fillStyle='#a6433c';context.fillRect(14,31,108*Math.max(0,boss.hp/boss.maxhp),5);
    context.restore();
    if(!fixedPose&&isPlayerTurn()){
      // Native turn controls keep their original screen hit boxes. Their normal
      // HUD parent applies uiTop, which the isolated stage must also supply.
      context.save();context.translate(0,uiTop);drawPlayerTurnUI();context.restore();
    }
  }
  function start(fight=false){
    const startingLane=Math.max(0,Math.min(2,Math.round(player.x)));
    comboContact.clearPlanted('RESTART');
    debugRun=true;resetRun();loop=1;biome='forest';playerChar=CHARS.find(c=>c.rigId==='ser_jonathan')||CHARS[charSel]||CHARS[0];
    player.lane=player.x=startingLane;
    startBoss(id);boss.x=boss.xTarget=1;boss.z=stage3D.depth(0);boss.entering=false;boss.rise=1;
    boss._stoneRightIdle=false;
    boss.state='idle';boss.stateT=0;boss.atkTimer=fight?2:1e9;boss._artPreview=!fight;
    if(fight)boss.attacksLeft=12;
    boss.guaranteeQueue=[];fixedPose=fight?null:{state:'idle',t:0,approach:0};lastPhase='';playback=null;reviewTime=0;
    approachElapsed=0;approachLast=performance.now();previewTarget=previewPlantTarget=previewGroundTarget=null;previousReviewTime=0;previewCommands.clear();rebuildFlightPhases();
    comboContact.history.length=0;
    godMode=BOOT_QUERY.get('mortal')!=='1';hazards=[];floaters.length=0;flashA=0;shakeMag=0;
    setMode('boss');paused=false;lastTime=performance.now();
    document.title='Taş Kral · Dev Heykel Boss';cvs.dataset.stoneKing='ready';
    if(!toolbar)mountControls();
    toolbar.querySelector('[data-action="pause"]').textContent='Duraklat';
    toolbar.querySelector('input').value=0;
    status(fight?'Savaş · ← → şerit · ↓ eğil · ↑ zıpla':'Dev taş heykel · güncel şövalye ve at');
  }
  function startRoad(context){
    // Entry belongs to the existing sword-clearing session. Keep the run,
    // selected character, health, equipment, inventory and difficulty intact.
    comboContact.clearPlanted('RESTART');
    fixedPose=null;playback=null;reviewTime=0;lastPhase='';
    approachElapsed=0;approachLast=performance.now();
    previewTarget=previewPlantTarget=previewGroundTarget=null;previousReviewTime=0;
    previewCommands.clear();comboContact.history.length=0;
    if(toolbar){toolbar.remove();toolbar=null;}
    hazards.length=0;projectiles.length=0;
    startBoss(id,context);
    boss._stoneRoad=true;boss._artPreview=false;boss._stoneRightIdle=false;
    boss.hp=boss.maxhp=Math.round(55+progressionTier()*8);boss.postureMax=30;
    boss.enemyTurnBudget=boss.attacksLeft=1;boss.guaranteeQueue=[];
    boss.x=boss.xTarget=1;boss.z=stage3D.depth(0);boss.entering=false;boss.rise=1;
    boss.atkTimer=.25;
    cvs.dataset.stoneKing='ready';
    KRStoneKingArena.sync();return boss;
  }
  function status(text){toolbar.querySelector('output').textContent=text;toolbar.dataset.pose=fixedPose?.state||'combat';}
  function showPose(state,t,label){
    start(false);const targeted=/^(tele|strike)_stone_king$/.test(state)||/_(plant)$/.test(state),
      lane=state.endsWith('_eruption')?(playerLane()===1?2:1):targeted?playerLane():1;
    previewTarget=playerLane();
    if(state.endsWith('_eruption')){previewPlantTarget=lane;previewGroundTarget=playerLane();}
    fixedPose={state,t,approach:1,lane};status(label);
  }
  function playPreview(from=0){
    start(false);
    if(typeof from==='string')from=flightPhases.find(p=>p.state==='tele_stone_king_flight_'+from).start;
    playback={started:performance.now()-from*1000,paused:false,elapsed:from};status(from?'Kontrol kolu · Uçan kılıç kombosu':'Kombo 1 · Saldırı mesafesine yaklaşıyor');
  }
  function pausePreview(){
    if(!playback)return;
    paused=false;
    if(playback.paused){playback.started=performance.now()-playback.elapsed*1000;playback.paused=false;}
    else{playback.elapsed=reviewTime;playback.paused=true;}
    toolbar.querySelector('[data-action="pause"]').textContent=playback.paused?'Devam et':'Duraklat';
  }
  function mountControls(){
    const style=document.createElement('style');style.textContent=`
      #stone-king-tools{position:fixed;z-index:50;top:16px;right:12px;width:210px;max-width:calc(100vw - 16px);padding:8px 11px;background:#e0cfaa;border:3px solid #614531;box-shadow:0 3px 0 #211b18;color:#392d23;font:12px/1.4 system-ui,sans-serif;box-sizing:border-box;text-align:center;touch-action:manipulation}
      #stone-king-tools strong{display:block;font-size:12px;letter-spacing:.12em;margin-bottom:5px}
      #stone-king-tools nav{display:flex;justify-content:center;flex-wrap:wrap;gap:5px}
      #stone-king-tools button{padding:6px 9px;border:1px solid #795b3d;background:#503b2d;color:#f3e6c9;font:inherit;cursor:pointer}
      #stone-king-tools button:focus-visible{outline:3px solid #c5263e;outline-offset:2px}
      #stone-king-tools output{display:block;margin-top:5px;font-size:11px;max-width:440px}
      #stone-king-tools label{display:flex;align-items:center;gap:8px;margin-top:6px;font-size:10px}
      #stone-king-tools input{flex:1;min-width:70px;accent-color:#755643}
      @media(max-width:999px){#stone-king-tools{top:auto;bottom:5px;left:50%;right:auto;transform:translateX(-50%);width:430px;padding:6px}#stone-king-tools button{padding:5px 6px;font-size:11px}#stone-king-tools output{font-size:10px}}
      @media(max-width:999px){#stone-king-tools strong{display:none}}
    `;document.head.appendChild(style);
    toolbar=document.createElement('section');toolbar.id='stone-king-tools';toolbar.setAttribute('aria-label','Taş Kral model kontrolleri');
    toolbar.innerHTML='<strong>TAŞ KRAL · KOMBO 1</strong><nav><button type="button" data-action="play">Komboyu oynat</button><button type="button" data-action="pause">Duraklat</button><button type="button" data-action="idle">Duruş</button><button type="button" data-action="raise">Kılıcı kaldır</button><button type="button" data-action="strike">Dikey kesiş</button><button type="button" data-action="swipe">Yatay kesiş</button><button type="button" data-action="plant">Yere sapla</button><button type="button" data-action="eruption">Yerden çıkış</button><button type="button" data-action="command">Uçan kombo</button><button type="button" data-action="flight-swipe">Uçan swipe</button><button type="button" data-action="flight-cut">Uçan kesiş</button><button type="button" data-action="combat">Savaş</button></nav><label>Zaman<input aria-label="Animasyon zamanı" type="range" min="0" max="1000" step="1" value="0"></label><output aria-live="off"></output>';
    document.body.appendChild(toolbar);
    toolbar.addEventListener('pointerdown',e=>e.stopPropagation());
    toolbar.addEventListener('keydown',e=>e.stopPropagation());
    toolbar.addEventListener('keyup',e=>e.stopPropagation());
    toolbar.addEventListener('click',event=>{
      event.stopPropagation();const action=event.target.closest('button')?.dataset.action;
      event.target.closest('button')?.blur();
      if(action==='idle')showPose('idle',0,'Duruş · taş taç / uzun kılıç / koyu pelerin');
      if(action==='play')playPreview();
      if(action==='pause')pausePreview();
      if(action==='raise')showPose('tele_stone_king',1,'Kol tamamen düz · kılıç havaya dik');
      if(action==='strike')showPose('strike_stone_king',.7,'Dikey kesiş · sağa sola kaymadan');
      if(action==='swipe')showPose('strike_stone_king_swipe',.5,'Yatay kesiş · üç şerit · ↓ eğilerek kaç');
      if(action==='plant')showPose('strike_stone_king_plant',1,'Kılıç şeridinde zemine saplanıyor · ← → kaç');
      if(action==='eruption')showPose('strike_stone_king_eruption',.25,'Ters kılıç ucu · ↑ zıplayarak kaç');
      if(action==='command')playPreview(flightStart);
      if(action==='flight-swipe')playPreview('swipe');
      if(action==='flight-cut')playPreview('overhead');
      if(action==='combat')start(true);
    });
    toolbar.querySelector('input').addEventListener('input',event=>{
      const value=event.target.value,time=Number(value)/1000*previewDuration();
      if(!playback)start(false);
      paused=false;
      playback={started:performance.now()-time*1000,paused:true,elapsed:time};reviewTime=time;fixedPose=previewFrame(time);
      toolbar.querySelector('[data-action="pause"]').textContent='Devam et';
      toolbar.querySelector('input').value=value;
      status('Duraklatıldı · '+fixedPose.label);
    });
    // After a mouse/touch seek, arrows should steer the rider, not scrub time.
    toolbar.querySelector('input').addEventListener('pointerup',event=>event.currentTarget.blur());
  }
  window.KRStoneKingLab={id,art,attacks,stage3D,mounted,flight,heldMotions,heldWorldFrame,sampleHeldPose,contactArt,flightTiming,flightStart,openingPhases,flightPhases,previewDuration,previewFrame,comboContact,sequenceDriver,phaseDepth,royalMotion,coversWorld,ownsPause,drawScene,drawHUD,start,showPose,playPreview,
    arenaMaterials,knightMaterials,environmentMaterials,startRoad,roadActive,usesLabHUD,combatTarget,
    setSceneLighting(value){sceneLightingEnabled=!!value;},get fixedPose(){return fixedPose;}};
})();
