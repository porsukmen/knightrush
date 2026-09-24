const assert=require('node:assert/strict');
const {run}=require('./journey-render-audit.cjs');
run(`SFX.toggle();
 for(const stage of [1,2,5,12]){
  debugLoop=stage;godMode=true;debugSel={bead:true,idol:true};
  debugBossStart=debugMiniMoves=false;
  pendingJourneySeed=12345;startDebugRun();startRun(0);
  if(!debugRun||!godMode||!runJourneyPrototype||!curvedWorldTrial||mode!=='run')throw Error('Debug launch');
  if(loop!==stage||journeyRoute.stage!==stage||biome!=='forest'||progressionTier()!==stage-1)throw Error('Stage/policy mismatch');
  if(journeyRoute.seed!==12345||activeRunPolicyId!=='journey_forest'||!hasRelic('idol')||!hasRelic('bead'))throw Error('Rig lost');
  if(Math.abs(journeyRoute.baseTotal-CFG.LOOP_DIST*JOURNEY_ROAD_RULES.distanceScale*speed()/CFG.BASE_SPEED)>.00001)throw Error('Speed/route mismatch');
  render();
 }
 debugLoop=3;debugBossStart=true;startDebugRun();startRun(0);
 if(mode!=='bossintro'||boss.definitionId!=='bear'||journeyRoute.stage!==3)throw Error('Boss shortcut');
 setMode('boss');boss.hp=0;defeatBoss();boss.stateT=2.6;updateBoss(.016);
 if(mode!=='town')throw Error('Missing town');townTap({x:240,y:705});townTap({x:240,y:705});
 if(mode!=='run'||loop!==4||journeyRoute.stage!==4||!debugRun)throw Error('Debug continuation');
 paused=true;journeyMapOpen=true;const seed=journeyRoute.seed;
 handleAction('tap',{x:100,y:716});
 if(!debugRun||!godMode||loop!==4||mode!=='run'||journeyRoute.seed!==seed)throw Error('Replay dropped debug/reopened boss');
 paused=true;journeyMapOpen=true;handleAction('tap',{x:300,y:716});
 if(!debugRun||!paused||!journeyMapOpen||mode!=='run'||journeyRoute.stage!==4)throw Error('New seed lost map/debug');
 paused=false;debugBossStart=false;debugMiniMoves=true;debugLoop=2;startDebugRun();startRun(0);
 if(mode!=='miniboss'||!minibossFight?._moveLab||journeyRoute.stage!==2)throw Error('Pattern lab shortcut');
 // Standalone laboratories stay independent of Journey generation.
 startBossLabFor('hydra');if(journeyRoute||biome==='forest')throw Error('Boss Lab isolation');
 debugMiniMoves=false;debugBossStart=false;setMode('menu');uiConfirm();startRun(0);
 if(debugRun||!runJourneyPrototype||!journeyRoute||!curvedWorldTrial)throw Error('PLAY must launch Journey');
`);
assert.equal(run('mode'),'run');
console.log('DEBUG_JOURNEY_OK stages/seed/curved/god/artifacts/pace; boss+pattern lab; town continuation; map replay/new seed; PLAY defaults to Journey');
