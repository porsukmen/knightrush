/* Opt-in native encounter. One sequence is one real enemy turn; the ordinary
 * game owns player/horse, inputs, hurt geometry, damage, AP and turn menus. */
(function(root){'use strict';
 const Model=root.KROathkeeperModel,Seq=root.KROathkeeperMoveset,renderer=Model.createRenderer();
 const nativeContext={project(lane,height,z){
  const p=proj(z);return {x:laneX(lane,p.t),y:p.y-height*p.s,s:p.s,depth:z};
 }};
 let lastDraw=null,selectedIndex=0,runSeed=null,runVariant=null;
 // Randomness belongs to starting a lab run, never to timeline sampling. The
 // same actor-owned seed/override survives native turns and deterministic seek.
 const recipes=Seq.recipes.map(recipe=>Object.freeze({...recipe,sample(t,out,ctx){
  ctx.seed=Number.isFinite(ctx.actor?._oathRunSeed)?ctx.actor._oathRunSeed:0;
  if(ctx.actor?._oathVariant)ctx.variant=ctx.actor._oathVariant;else delete ctx.variant;
  return recipe.sample(t,out,ctx);
 }}));
 const nativeSequenceDriver=root.KRBossSequenceRuntime.createDriver({sequences:recipes,inputMode:'lanes',
  drawLayer(pass,frame,actor){
   // The ordinary world pass already drew only the far portion of this rig.
   // Reuse its exact sample/projection for the portion crossing the rider plane.
   if(pass==='front'&&lastDraw?.actor===actor&&lastDraw.frame===frame&&lastDraw.frontNeeded)
    drawActor(lastDraw,-1);
   Seq.drawProps(g,pass,frame);
  }});
 // Weight is an update-time effect, not part of sampling or rendering. Compare
 // the two sampled clip times so a variable hold cannot move sound off contact;
 // seek/restart replaces the state and never replays skipped markers.
 const effects=Object.freeze({
  'fist-eruption':[['impact','thud',4],['bulletRelease','swipe',0]],
  'splitting-boulder':[['release','swipe',0]],
  'twin-pillars':[['impact','thud',4],['rise','thud',3]],
  'stone-whips':[['dig','thud',3],['close','thud',4],['vertical','thud',4]],
  'maw-beam':[['release','roar',0]]
 });
 const sequenceDriver=Object.freeze({...nativeSequenceDriver,update(actor,dt){
  const state=actor?._sequence,from=state?.frame.clip,
   live=!!state&&dt>0&&!paused&&mode==='boss'&&actor===boss&&player.alive&&
    actor.phase==='dodge'&&actor.state==='sequence';
  const handled=nativeSequenceDriver.update(actor,dt);
  if(!live||paused||mode!=='boss'||actor._sequence!==state||!player.alive||
   actor.phase!=='dodge'||actor.state!=='sequence')return handled;
  const to=state.frame.clip;
  if(!Number.isFinite(from)||!Number.isFinite(to)||to<=from)return handled;
  for(const [marker,sound,magnitude] of effects[state.recipe.id]||[]){
   const at=state.recipe.markers?.[marker];
   if(from<at&&to>=at){SFX[sound]();if(magnitude)shake(magnitude,.12);}
  }
  return handled;
 }});
 function makePose(){return {action:{id:'sequence',side:0,time:0,motionOverride:null},unit:1,x:0,y:0,
  actor:null,frame:null,anim:'idle',opacity:1,frontNeeded:false,
  restFrame:{time:0,actorRoot:{x:1,z:14+Seq.restDepthOffset,height:Seq.restLift},ctx:nativeContext,context:nativeContext}};}
 function sample(p,out=makePose()){
  const actor=p.actor||boss,frame=actor?._sequence?.frame;
  out.actor=actor;out.frame=frame||out.restFrame;
  if(!frame){
   out.restFrame.actorRoot.x=actor?.x??1;out.restFrame.actorRoot.z=(actor?.z??14)+Seq.restDepthOffset;out.restFrame.actorRoot.height=Seq.restLift;
   out.restFrame.motion=Seq.neutral;
  }
  out.action.id=actor?._sequence?.recipe.id||'moveset-neutral';
  out.action.time=frame?.time??0;
  out.action.motionOverride=frame?.motion||Seq.neutral;
  out.unit=p.scale*30;out.x=p.x;out.y=p.y;return out;
 }
 const rig=Object.freeze({profiles:Object.freeze({}),createPose:makePose,samplePose:sample});
 function drawActor(p,depthSide){
  const frame=p.frame,actorRoot=frame.actorRoot;
  g.save();g.globalAlpha*=p.opacity;
  const result=renderer.draw(g,7,{width:VW,height:VH,angle:0,unit:p.unit,baseY:p.y,
   lighting:root.KROathkeeperArena?.lighting()?'shrine':'neutral',
   materials:root.KROathkeeperArena?.lighting()||undefined,
   colorMap:root.KROathkeeperArena?.swordLighting()||undefined,
   project:v=>Seq.projectPoint(frame,v),
   projectionMode:'oathkeeper-long-lens',cameraPosition:Seq.cameraPosition(frame),
   depthProject:v=>1-Seq.perspectiveScale(actorRoot.z+v[2]*Seq.depthScale),
   perspectiveScale:v=>Seq.perspectiveScale(actorRoot.z+v[2]*Seq.depthScale),
   extraFaces:frame.props?.length?Seq.propFaces(frame):[],
   // Keep this key identical across both passes: clipping only changes a GPU
   // uniform, not the geometry or the sampled motion.
   projectKey:[actorRoot.x,actorRoot.z,actorRoot.height,p.anim,p.actor?._oathRunSeed,p.actor?._oathVariantKey].join(','),pixelRatio:viewScale,action:p.action,
   clipZ:-actorRoot.z/Seq.depthScale,depthSide,ground:false,hideEffectMeshes:true});
  g.restore();return result;
 }
 function draw(x,y,scale,anim,t,hurt,contacts,sampled){
  const p=sampled||sample({actor:boss,x,y,scale,anim,t});
  p.anim=anim;p.opacity=anim==='dying'?1-t:1;
  Seq.drawShadows(g,p.frame);
  p.frontNeeded=!!drawActor(p,1)?.frontNeeded;lastDraw=p;
  // Outside an active defense there is no sequence front-layer callback. The
  // native neutral/recovery actor still needs its complete silhouette.
  if(!p.actor?._sequence&&p.frontNeeded)drawActor(p,-1);
 }
 ENCOUNTERS.register(new EncounterDefinition('oathkeeper','boss',{
  name:'OATHKEEPER',hitText:'The broken oath found you',finisherHit:'The oathkeeper passed judgment',
  arenaLine:'THE ANCIENT OATH AWAKENS',draw,attacks:[],scale:3.65,contactRig:rig,sequenceDriver,
  finisherReach:12,element:'earth',rises:false,labOnly:true,sequenceJumpLift:30
 }));
 function indexFor(selection){
  if(typeof selection==='string'){
   const id=recipes.findIndex(recipe=>recipe.id===selection);if(id>=0)return id;
  }
  const number=Number(selection);
  return Math.max(0,Math.min(recipes.length-1,Math.floor(Number.isFinite(number)?number:0)));
 }
 function currentIndex(){
  if(mode==='boss'&&boss?.definitionId==='oathkeeper'){
   if(boss._sequence)return boss._sequence.index;
   const last=recipes.findIndex(recipe=>recipe.id===boss._lastSequence?.id);
   if(last>=0)return last;
  }
  return selectedIndex;
 }
 function freshSeed(){
  const seed=Math.floor(Math.random()*4294967296)>>>0;
  return seed===runSeed?(seed+2654435769)>>>0:seed;
 }
 function copyVariant(variant){
  if(variant==null)return null;
  if(typeof variant!=='object'||Array.isArray(variant))throw Error('Lab variant override must be an object');
  return JSON.parse(JSON.stringify(variant));
 }
 function state(){
  const index=currentIndex(),recipe=recipes[index];
  return {selectedIndex,index,id:recipe.id,name:recipe.name,seed:runSeed,variant:copyVariant(runVariant),
   phase:mode==='boss'&&boss?.definitionId==='oathkeeper'?boss.phase:null,
    time:boss?._sequence?.time??0,duration:recipe.duration,inputMode:sequenceDriver.inputMode};
 }
 function startRoad(context){
  // The event owns road state and rewards. This path must never reset a run,
  // select a debug stage or grant the lab's default immortality.
  lastDraw=null;startBoss('oathkeeper',context);
  boss._oathRunSeed=Math.trunc(context.seed)>>>0;boss._oathVariant=null;boss._oathVariantKey='null';
  boss.hp=boss.maxhp=Math.round(55+progressionTier()*8);boss.postureMax=30;boss.guaranteeQueue=[];
  boss.z=14;boss.enemyTurnBudget=boss.attacksLeft=1;
  return boss;
 }
 function start(selection=BOOT_QUERY.get('move')??BOOT_QUERY.get('sequence')??0,options={}){
  selectedIndex=indexFor(selection);
  const querySeed=BOOT_QUERY.has('seed')?Number(BOOT_QUERY.get('seed')):NaN;
  const requestedSeed=options.seed!==undefined?Number(options.seed):runSeed??querySeed;
  runSeed=Number.isFinite(requestedSeed)?Math.trunc(requestedSeed)>>>0:freshSeed();
  if(Object.prototype.hasOwnProperty.call(options,'variant'))runVariant=copyVariant(options.variant);
  lastDraw=null;
  debugRun=true;resetRun();loop=debugLoop;biome=bossHomeStage('oathkeeper').id;
  // Practice is immortal by default; the real damage path remains available
  // to audits and balance tests. Normal menu PLAY already clears godMode.
  godMode=BOOT_QUERY.get('mortal')!=='1';
  playerChar=CHARS[charSel]||CHARS[0];startBoss('oathkeeper');
  boss._oathRunSeed=runSeed;boss._oathVariant=copyVariant(runVariant);boss._oathVariantKey=JSON.stringify(runVariant);
  boss.x=boss.xTarget=1;boss.entering=false;boss.rise=1;boss.state='idle';boss.stateT=0;
  boss.enemyTurnBudget=boss.attacksLeft=1;boss.enemyTurn=1+selectedIndex;
  hazards=[];paused=false;pausePhotoMode=false;flashA=0;shakeMag=0;
  setMode('boss');
  Seq.prepareWhips?.({...nativeContext,seed:runSeed,variant:runVariant||undefined,startActorX:1,startActorZ:14});
  Seq.prepareFist?.({...nativeContext,seed:runSeed,variant:runVariant||undefined,startActorX:1,startActorZ:14});
  sequenceDriver.startRecipe(boss,selectedIndex);
  return state();
 }
 const select=(selection,options={})=>start(selection,options),
  restart=()=>start(currentIndex(),{seed:runSeed}),reroll=()=>start(currentIndex(),{seed:freshSeed(),variant:null});
 function labActive(){return BOOT_QUERY.get('oathkeeperlab')==='1'&&mode==='boss'&&boss?.definitionId==='oathkeeper';}
 function handleLabKey(event){
  if(!labActive()||settingsOpen||event.ctrlKey||event.altKey||event.metaKey||
   event.target?.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(event.target?.tagName||''))return false;
  const key=event.key.toLowerCase(),index=/^[1-5]$/.test(key)?Number(key)-1:-1;
  if(index<0&&key!=='r'&&key!=='n')return false;
  if(!event.repeat){if(index>=0)select(index);else if(key==='n'||event.shiftKey)reroll();else restart();}
  return true;
 }
 function drawLabHint(ctx){
  if(!labActive()||pausePhotoMode||settingsOpen||paused)return;
  const palette=KRUI.theme(currentUITheme());
  KRUI.text(ctx,(currentIndex()+1)+'/'+recipes.length+' · 1–5 SELECT · R REPLAY · N VARIANT',
   VW/2,VH-uiTop-64,12,palette.onDark,450);
 }
 root.KROathkeeperEncounter=Object.freeze({sample,rig,sequenceDriver,renderer,startRoad,start,select,restart,reroll,state,
  list:()=>recipes.map((recipe,index)=>({index,id:recipe.id,name:recipe.name,duration:recipe.duration})),
  handleLabKey,drawLabHint});
})(globalThis);
