const assert=require('node:assert/strict'),fs=require('node:fs');
const {run,canvas,out}=require('./journey-render-audit.cjs');
run('SFX.toggle();');
// Pure graph checks: determinism, reachability, no cycles or dead branches,
// unique visible exits and enough space to finish a corner before the next.
const stats=JSON.parse(run(`JSON.stringify((()=>{
 const signatures=new Set(),exits=new Set();let merges=0,paths=0;
 for(let seed=0;seed<2000;seed++){
  const graph=generateJourneyGraph(seed,1323),again=generateJourneyGraph(seed,1323);
  if(graph.nodes.some(n=>!['start','road','boss'].includes(n.type)))throw Error('Encounter generated');
  if(JSON.stringify(graph)!==JSON.stringify(again))throw Error('Non-deterministic seed '+seed);
  signatures.add(JSON.stringify(graph.nodes));
  const byId=new Map(graph.nodes.map(n=>[n.id,n])),seen=new Set(),incoming=new Map();
  const walk=id=>{
   const node=byId.get(id);seen.add(id);
   if(node.type==='boss'){paths++;return;}
   if(!node.out.length)throw Error('Dead branch '+seed+':'+id);
   if(new Set(node.out.map(e=>e.direction)).size!==node.out.length)throw Error('Duplicate exit');
   exits.add(node.out.map(e=>e.direction).join(','));
   for(const edge of node.out){
    const next=byId.get(edge.to);if(!next||next.row!==node.row+1||next.at-node.at<80)throw Error('Bad edge');
    incoming.set(next.id,(incoming.get(next.id)||0)+1);walk(next.id);
   }
  };
  walk('start');if(seen.size!==graph.nodes.length)throw Error('Unreachable node');
  if([...incoming.values()].some(n=>n>1))merges++;
 }
 return {seeds:signatures.size,exits:[...exits],merges,paths};
})())`));
assert.equal(stats.seeds,2000);
for(const kind of ['0','1','-1','0,1','-1,0','-1,1'])assert(stats.exits.includes(kind),kind);
// Simulate complete runs, taking opposing policies through the same graph.
const results=[];
for(const seed of [0,1,2,7,19,42,123,456,999,2026])for(const policy of ['left','right','straight']){
 const fps=policy==='left'?25:policy==='right'?60:120;
 const result=JSON.parse(run(`JSON.stringify((()=>{
  pendingJourneySeed=${seed};pendingJourneyPrototype=true;debugRun=false;startRun(0);godMode=true;
  const turns=[],visits=[],total=stageDistance();let tick=0;
  while(mode!=='bossintro'&&tick++<12000){
   if(mode==='run'){
    const node=journeyNode(journeyRoute.next);
    if(!journeyRoute.pendingArm&&journey.phase==='approach'&&dist>=node.at-20){
     const direction=${JSON.stringify(policy)}==='left'?-1:${JSON.stringify(policy)}==='right'?1:0;
     const edge=node.out.find(e=>e.direction===direction)||node.out[0];
     if(edge){player.lane=edge.direction+1;chooseJourneyDirection(edge.direction);}
    }
    const oldDist=dist,oldRun=runDistance,oldPhase=journey.phase;update(1/${fps});
    if(Math.abs((dist-oldDist)-(runDistance-oldRun))>1e-7)throw Error('Odometer jump');
    if(oldPhase!=='turning'&&journey.phase==='turning')turns.push(journey.direction);
   }else throw Error('Unexpected mode '+mode);
  }
  if(mode!=='bossintro'||journeyRoute.status!=='boss')throw Error('Never reached boss: '+JSON.stringify(journeyRoute));
  if(Math.abs(dist-total)>1||journeyRoute.chosen.length!==5)throw Error('Wrong terminal progress');
  if(journeyRoute.event||journeyRoute.nodes.some(n=>n.result))throw Error('Unexpected encounter result');
  return {seed:${seed},policy:${JSON.stringify(policy)},chosen:journeyRoute.chosen,turns,visits};
 })())`));
 results.push(result);
}
assert(results.some(r=>r.turns.includes(-1))&&results.some(r=>r.turns.includes(1)));
assert.notDeepEqual(results.find(r=>r.seed===123&&r.policy==='left').chosen,results.find(r=>r.seed===123&&r.policy==='right').chosen);
run(`startJourneyWithSeed(123);godMode=true;
 const forced=journeyRoute.nodes.find(n=>n.out.length===1&&n.out[0].direction!==0);
 if(!forced)throw Error('Missing forced-corner fixture');
 journeyRoute.next=forced.id;armJourneyNode();dist=forced.at-2;runDistance=dist;roadScroll=dist;
 for(let i=0;i<240;i++)update(1/60);
 if(journey.phase!=='approach'||dist!==forced.at+4||journeyRoute.chosen.length)throw Error('Single exit turned automatically');
 player.lane=forced.out[0].direction+1;chooseJourneyDirection(forced.out[0].direction);update(1/60);
 if(journey.phase!=='turning')throw Error('Manual single-exit turn failed');`);
run(`pendingJourneySeed=123;pendingJourneyPrototype=true;startRun(0);paused=true;journeyMapOpen=true;render();`);
fs.writeFileSync(out+'/seeded-map.png',canvas.toBuffer('image/png'));
run(`pendingJourneyPrototype=false;startRun(0);if(journeyRoute||journeyMapOpen)throw Error('Route leaked into PLAY');
 startLogBalance();leaveLogBalance();if(mode!=='minigames')throw Error('Standalone log balance changed');`);
console.log('JOURNEY_SEED_OK '+JSON.stringify({...stats,fullRuns:results.length}));
