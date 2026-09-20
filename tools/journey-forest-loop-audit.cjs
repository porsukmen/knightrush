const assert=require('node:assert/strict');
const {run}=require('./journey-render-audit.cjs');
const result=JSON.parse(run(`JSON.stringify((()=>{
  SFX.toggle();startJourneyWithSeed(647486904);
  if(!curvedWorldTrial||!curvedWorldActive())throw Error('Journey must start curved');
  gold=87;upg.arrow=2;relics[0]={type:'idol',charged:true};syncArtifactCache();
  journeyMushroomQuest={state:'collecting',count:4};
  const quest=journeyMushroomQuest,skills=JSON.stringify(runSkills),rows=[],maps=[];
  for(let stage=1;stage<=8;stage++){
    if(loop!==stage||biome!=='forest'||activeBossDefinition().id!=='bear')throw Error('Not forest/bear');
    if(journeyRoute.stage!==stage||journeyRoute.seed!==647486904)throw Error('Route seed/stage');
    if(progressionTier()!==stage-1)throw Error('Tier must advance every bear');
    maps.push(JSON.stringify(journeyRoute.nodes.map(n=>[n.worldX,n.worldY])));
    rows.push({stage,hp:bossMaxHp(),attacks:bossAttackCount(),speed:+speed().toFixed(2)});
    startBoss();setMode('boss');
    Object.assign(squire,{present:true,active:true,health:3,hunterReady:{},hunterFollow:{}});
    if(!squire.present)throw Error('Fixture did not summon');
    boss.hp=-3;defeatBoss();
    boss.stateT=2.6;updateBoss(.016);
    if(mode!=='town'||loop!==stage||!townVisit)throw Error('Missing town');
    townTap({x:90,y:450});updateTown(.4);
    if(mode!=='shop')throw Error('Missing smith');
    shopTap({x:240,y:750});
    if(mode!=='town')throw Error('Smith did not return to town');
    townTap({x:240,y:705});townTap({x:240,y:705});
    if(mode!=='run'||boss!==null||loop!==stage+1)throw Error('Reward screen or duplicate continuation');
    if(squire.present||squire.active||squire.health||squire.hunterReady||squire.hunterFollow)throw Error('Squire leaked');
    if(journeyMushroomQuest!==quest||JSON.stringify(runSkills)!==skills||upg.arrow!==2)throw Error('Build/quest reset');
    if(gold!==87+40*stage||relics[0]?.type!=='idol')throw Error('Gold/artifacts lost');
    spawnLoopEntities();render();
  }
  if(new Set(maps).size!==8)throw Error('Maps did not regenerate');
  setCurvedWorldTrial(false);nextLoop();
  if(curvedWorldTrial)throw Error('F8 choice lost at stage change');
  startJourneyWithSeed(647486904);
  if(!curvedWorldTrial||loop!==1||bossMaxHp()!==105)throw Error('Fresh journey defaults');
  // Summons are combat-local, including defeat/exit; the wolf pack is not.
  setMode('boss');squire.present=true;pack=1;packTypes=['wolf'];setMode('dying');
  if(squire.present||pack!==1)throw Error('Combat exit cleanup scope');
  pendingJourneyPrototype=false;startRun(0);
  if(activeRunPolicyId!=='endless_build'||runJourneyPrototype||curvedWorldTrial)throw Error('Normal PLAY isolation');
  const classic=[];for(loop=1;loop<=4;loop++){biome=biomeOf(loop);classic.push([biome,bossMaxHp()]);}
  resetRun();return {rows,classic,uniqueMaps:new Set(maps).size};
})())`,30000));
assert.deepEqual(result.rows.map(r=>r.hp),[105,130,156,184,213,244,276,310]);
assert.deepEqual(result.classic.map(r=>r[0]),['forest','swamp','volcano','forest']);
assert.deepEqual(result.classic.map(r=>r[1]),[105,115,141.75,164]);
console.log(JSON.stringify(result,null,2));
