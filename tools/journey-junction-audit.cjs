const assert=require('node:assert/strict');
const {run}=require('./journey-render-audit.cjs');
const result=JSON.parse(run(`JSON.stringify((()=>{
 const expected=[30,10,10,10,17,17,6],random=journeyRandom(98765),counts={};
 if(JOURNEY_JUNCTION_PATTERNS.some((p,i)=>p.weight!==expected[i]))throw Error('Weights changed');
 for(let i=0;i<100000;i++){
  const p=pickJourneyJunction(random);counts[p.id]=(counts[p.id]||0)+1;
 }
 for(const p of JOURNEY_JUNCTION_PATTERNS)
  if(Math.abs(counts[p.id]/1000-p.weight)>.5)throw Error('Biased selector: '+p.id);
 let fallback=0,maxMs=0;const actual={};
 for(let seed=0;seed<100;seed++){
  const start=Date.now(),graph=generateJourneyGraph(seed,1984.5);
  maxMs=Math.max(maxMs,Date.now()-start);
  if(graph.nodes.length===2)fallback++;
  for(const n of graph.nodes){
   if(n.type==='boss')continue;
   const pattern=JOURNEY_JUNCTION_PATTERNS.find(p=>p.id===n.junction);
   if(!pattern||pattern.directions.join(',')!==n.out.map(e=>e.direction).join(','))
    throw Error('Partial junction: '+seed+':'+n.id);
   if(n.type==='road')actual[n.junction]=(actual[n.junction]||0)+1;
  }
 }
 return {counts,actual,fallback,maxMs};
})())`));
assert(result.fallback<=5,'Excessive straight fallback');
assert.equal(Object.keys(result.actual).length,7);
console.log('JOURNEY_JUNCTION_OK '+JSON.stringify(result));
