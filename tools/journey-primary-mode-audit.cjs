const assert=require('node:assert/strict'),fs=require('node:fs');
const {run,shot}=require('./journey-render-audit.cjs');
const source=fs.readFileSync('KnightRush.html','utf8');
for(const retired of ['startMiniboss','packTypes','packLeap','minibossSpawned',
  'countersNeeded','debugMiniStart','pendingJourneyPrototype','minibossGate']){
  assert(!new RegExp('\\b'+retired+'\\b').test(source),'Retired runtime remains: '+retired);
}
run('SFX.toggle();');
// The full-width PLAY hit area and the keyboard route all use seeded Journey.
for(const x of [100,240,380]){
  run(`resetRun();setMode('menu');handleAction('tap',{x:${x},y:430});`);
  assert.equal(run('mode'),'charsel');
  run('uiConfirm();');
  assert(run("mode==='run'&&activeRunPolicyId==='journey_forest'&&!!journeyRoute&&curvedWorldActive()&&!debugRun&&!godMode"));
}
run("resetRun();setMode('menu');handleAction('up');uiConfirm();");
assert(run("mode==='run'&&journeyRoute.stage===1&&journeyMushroomQuest===null"));
assert.equal(run("['horn','alpha','sigil'].some(id=>ARTIFACT_IDS.includes(id))"),false);
assert.equal(run("UPG_DEFS.some(u=>u.key==='fang')"),false);
assert.equal(run('hasCombatAlly()'),false);
shot('journey-primary-play','resetRun();setMode("menu")');
shot('journey-primary-debug','setMode("debugcfg")');

// Enemy art and every authored move stay usable without counters ending the lab.
const patterns=[];
for(const id of ['wolf','toad','imp']){
  run(`resetRun();godMode=true;startMiniMoveLab('${id}');`);
  assert.equal(run('activeMinibossDefinition().id'),id);
  const before=run('JSON.stringify([gold,bossScoreRun])');
  run('for(let n=0;n<12;n++)minibossCounterHit();render();');
  assert.equal(run('minibossFight.state'),'idle');
  assert.equal(run('minibossFight.counters'),12);
  assert.equal(run('JSON.stringify([gold,bossScoreRun])'),before);
  const count=run('minibossFight._moveLab.moves.length');
  const simulated=run(`(()=>{
    const seen=new Set();let frames=0;
    while(mode==='miniboss'&&frames++<36000){
      if(minibossFight.attack)seen.add(minibossFight._moveLab.selected);
      update(1/60);
      if(frames%180===0)render();
    }
    if(mode!=='menu'||minibossFight!==null)throw Error('Pattern lab did not finish');
    return {frames,seen:seen.size};
  })()`,30000);
  assert.equal(simulated.seen,count,'all authored attacks must still run: '+id);
  patterns.push({id,count,...simulated});
}
// Squire remains the supported ally, including selection and combat cleanup.
run(`openSkillLab();startSkillLabCombat();
  Object.assign(squire,{present:true,active:true,health:1});
  if(!hasCombatAlly()||companionProfile().id!=='squire'||!selectTurnActor('ally'))throw Error('Squire party regression');
  setMode('run');
  if(hasCombatAlly()||squire.present)throw Error('Squire cleanup regression');
`);
console.log(JSON.stringify({primaryMode:'Journey',recruitmentRetired:true,patterns,squire:true},null,2));
