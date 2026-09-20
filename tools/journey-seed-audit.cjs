const assert=require('node:assert/strict'),fs=require('node:fs');
const {run,canvas,out}=require('./journey-render-audit.cjs');
// Route-only regression: content behavior has its own Disco integration audit.
run("SFX.toggle();journeyRoadEventHandlers.delete('disco_finale');journeyRoadEventHandlers.delete('elite_finale');");
// Pure graph checks: determinism, reachability, no cycles or dead branches,
// unique visible exits and enough space to finish a corner before the next.
const stats=JSON.parse(run(`JSON.stringify((()=>{
 const signatures=new Set(),exits=new Set();let merges=0,paths=0,leftLeft=0;
 for(let seed=0;seed<300;seed++){
  const graph=generateJourneyGraph(seed,1323),again=generateJourneyGraph(seed,1323);
  if(graph.nodes.some(n=>!['start','road','boss'].includes(n.type)))throw Error('Encounter generated');
  if(JSON.stringify(graph)!==JSON.stringify(again))throw Error('Non-deterministic seed '+seed);
  signatures.add(JSON.stringify(graph.nodes));
  const byId=new Map(graph.nodes.map(n=>[n.id,n])),seen=new Set(),incoming=new Map();
  const walk=id=>{
   const node=byId.get(id);seen.add(id);
   if(node.type==='boss'){if(node.baseAt!==graph.baseTotal||node.at<graph.baseTotal)throw Error('Wrong boss budget');paths++;return;}
   if(!node.out.length)throw Error('Dead branch '+seed+':'+id);
   if(new Set(node.out.map(e=>e.direction)).size!==node.out.length)throw Error('Duplicate exit');
   exits.add(node.out.map(e=>e.direction).join(','));
   for(const edge of node.out){
    const next=byId.get(edge.to);if(!next||next.row!==node.row+1||next.at-node.at<80)throw Error('Bad edge');
    incoming.set(next.id,(incoming.get(next.id)||0)+1);walk(next.id);
    if(edge.direction===-1&&next.out.some(e=>e.direction===-1))leftLeft++;
    const heading=(node.heading+edge.direction+4)%4;
    if(next.heading!==heading)throw Error('Wrong relative direction');
    const delta=[[0,-1],[1,0],[0,1],[-1,0]][heading],length=next.at-node.at;
    if(Math.abs(next.worldX-node.worldX-delta[0]*length)>1e-6||
      Math.abs(next.worldY-node.worldY-delta[1]*length)>1e-6)throw Error('World coordinates disagree with road');
   }
  };
  walk('start');if(seen.size!==graph.nodes.length)throw Error('Unreachable node');
  const segments=graph.nodes.flatMap(a=>a.out.map(e=>({a,b:byId.get(e.to)})));
  for(let i=0;i<segments.length;i++)for(let j=i+1;j<segments.length;j++){
   const {a,b}=segments[i],{a:c,b:d}=segments[j];
   if(a===c||a===d||b===c||b===d)continue;
   const gap=key=>Math.max(0,Math.min(a[key],b[key])-Math.max(c[key],d[key]),
    Math.min(c[key],d[key])-Math.max(a[key],b[key]));
   if(Math.hypot(gap('worldX'),gap('worldY'))<28*graph.baseTotal/1984.5-1e-6)
    throw Error('Roads collide: '+seed);
  }
  if([...incoming.values()].some(n=>n>1))merges++;
 }
 return {seeds:signatures.size,exits:[...exits],merges,paths,leftLeft};
})())`,30000));
assert.equal(stats.seeds,300);assert(stats.leftLeft>0);assert.equal(stats.merges,0);
for(const kind of ['0','1','-1','0,1','-1,0','-1,1','-1,0,1'])assert(stats.exits.includes(kind),kind);
// Simulate complete runs, taking opposing policies through the same graph.
const results=[];
for(const seed of [0,1,2,7,19,42,123,456,999,2026])for(const policy of ['left','right','straight']){
 const fps=policy==='left'?25:policy==='right'?60:120;
 const result=JSON.parse(run(`JSON.stringify((()=>{
  pendingJourneySeed=${seed};pendingJourneyPrototype=true;debugRun=false;startRun(0);godMode=true;
  const turns=[],visits=[];let tick=0;
  while(mode!=='bossintro'&&tick++<40000){
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
  if(Math.abs(dist-stageDistance())>1||journeyNode(journeyRoute.next).type!=='boss')throw Error('Wrong terminal progress');
  if(journeyRoute.event||journeyRoute.nodes.some(n=>n.result))throw Error('Unexpected encounter result');
  return {seed:${seed},policy:${JSON.stringify(policy)},chosen:journeyRoute.chosen,turns,visits};
 })())`));
 results.push(result);
}
assert(results.some(r=>r.turns.includes(-1))&&results.some(r=>r.turns.includes(1)));
assert(results.some(r=>r.turns.some((d,i)=>i&&d===-1&&r.turns[i-1]===-1)));
run(`startJourneyWithSeed(0);godMode=true;
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
