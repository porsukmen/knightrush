// Capture deterministic before/after frames when restructuring presentation code.
// Use --record BEFORE editing, then run without arguments to compare.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
process.env.KNIGHT_AUDIT_SEED='417';
const {run,canvas}=require('./journey-render-audit.cjs');
// Compare rendering against the old checkpoint independently of the deliberate
// 1.5x distance change (which changes the progress HUD at the same distance).
if(process.argv.includes('--baseline-distance'))run('CFG.LOOP_DIST=1323;');
const file=path.resolve('output/render-refactor-baseline.json');
const scenarios={
  menu:"mode='menu'",
  run:"mode='run'",
  paused:"mode='run';paused=true",
  photo:"mode='run';paused=true;pausePhotoMode=true",
  shake:"mode='run';shakeMag=4",
  cave:"mode='run';env='cave'",
  approach:"runJourneyPrototype=true;journey=createJourneyState();updateJourneyPrototype(0,0)",
  turn:"runJourneyPrototype=true;journey=createJourneyState();updateJourneyPrototype(0,0);player.lane=0;player.x=0;tryJourneyCornerTurn();journey.turnT=.5;player.x=.5",
  handoff:"runJourneyPrototype=true;journey=createJourneyState();updateJourneyPrototype(0,0);player.lane=0;player.x=0;tryJourneyCornerTurn();journey.turnT=1;updateJourneyPrototype(0,0)",
  foreground:"obstacles=[new ObstacleEntity('root',.7,['duck','jump',null],'L')];obstacles[0].treeV=.37",
  relicdex:"mode='relicdex'",
  changelog:"mode='changelog'",
  debugcfg:"mode='debugcfg'",
  charsel:"mode='charsel'",
  score:"mode='score'",
  bosslabselect:"mode='bosslabselect'",
  bosslabmoves:"startBossLabFor('bear');openBossLabMoves()",
  skilllab:"openSkillLab()",
  healthlab:"openHealthLab()"
};
const hashes={};
for(const [name,code] of Object.entries(scenarios)){
  run(`Math.random=(()=>{let seed=417;return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};})();
    pendingJourneyPrototype=false;debugRun=false;startRun(0);
    perfNow=10;dist=153;roadScroll=dist;shakeMag=0;paused=false;pausePhotoMode=false;
    forestCorridor=null;roadsideScenery=[];obstacles=[];pickups=[];
    nextTreeAt=dist-3;spawnLoopEntities();
    ${code};render();`);
  hashes[name]=crypto.createHash('sha256').update(canvas.getContext('2d').getImageData(0,0,480,800).data).digest('hex');
}
if(process.argv.includes('--record')){
  fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(hashes,null,2)+'\n');
  console.log('RENDER_BASELINE_RECORDED '+Object.keys(hashes).length+' frames');
}else{
  const expected=JSON.parse(fs.readFileSync(file,'utf8'));
  // Corner texture fixes intentionally change these images. Keep the original
  // baseline and optionally verify only unrelated screens; journey-render-audit
  // separately checks the corner handoff, original road parity and projection.
  const checked=Object.entries(hashes).filter(([name])=>
    !(name==='menu'&&process.argv.includes('--skip-menu'))&&
    !(process.argv.includes('--skip-journey')&&['approach','turn','handoff'].includes(name)));
  for(const [name,hash] of checked)if(expected[name]!==hash)throw Error('Render changed: '+name);
  console.log('RENDER_REFACTOR_OK '+checked.length+' frames pixel-identical');
}
