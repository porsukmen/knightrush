const assert=require('node:assert/strict'),R=require('../assets/encounters/royal-shuffle-core');
const counts=[0,0,0],samples=600;
function until(s,test){for(let i=0;!test()&&i<10000;i++)R.update(s,1/120);assert(test());}
for(let seed=1;seed<=samples;seed++){
 const s=R.create(seed*2654435761);
 for(let hand=1;hand<=3;hand++){
  if(s.phase==='intro'||s.phase==='result')R.begin(s);
  assert.equal(s.hand,hand);
  const pocket=s.shuffleMoves.some(m=>m.kind==='pocketSwitch');counts[hand-1]+=Number(pocket);
  if(hand===3)assert(pocket);
  until(s,()=>s.phase==='choose');
  assert(R.visibleCards(s).every(c=>c.role==='QUEEN'?c.red&&c.suit==='hearts':!c.red&&c.suit==='clubs'));
  assert.equal(new Set(R.tableCards(s).map(c=>c.slot)).size,3);
  const win=hand!==2;
  if(win&&R.pocketCard(s)?.role==='QUEEN')assert(R.catchPocket(s));
  else assert(R.choose(s,R.tableCards(s).find(c=>(c.role==='QUEEN')===win).slot));
  until(s,()=>s.phase==='result'||s.hand>hand);
 }
 assert(s.matchOver&&s.you===2&&s.dealer===1);
}
assert(Math.abs(counts[0]/samples-.5)<.08);assert(Math.abs(counts[1]/samples-.75)<.08);
console.log({queenHeartsKingsClubs:true,threeHandMatches:samples,pocketRate:counts.map(n=>n/samples),consecutivePocketRounds:'passed'});
