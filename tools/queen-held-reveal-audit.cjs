const assert=require('node:assert/strict'),R=require('../assets/encounters/royal-shuffle-core');
function until(s,phase){for(let i=0;s.phase!==phase&&i<15000;i++)R.update(s,1/240);assert.equal(s.phase,phase);}
for(const when of ['shuffle','settle','choose']){
 const s=R.create(73491);s.pocketHand=1;s.pocketVariantOverride='queen';R.begin(s);
 if(when==='shuffle'){until(s,'shuffle');while(!s.pocketed)R.update(s,1/240);}else until(s,when);
 assert(R.catchPocket(s));until(s,'surprise');const q=R.pocketCard(s);let p=R.trajectory(s,q),h=R.handTargets(s)[0];
 while(s.phase==='surprise'){
  R.update(s,1/240);const n=R.trajectory(s,q),w=R.handTargets(s)[0];
  assert(Math.hypot(n.x-p.x,n.y-p.y)<2);assert(Math.hypot(w[0]-h[0],w[1]-h[1])<5);
  if(s.phase==='surprise'&&s.phaseT>=.18){assert(Math.abs(w[0]-n.x+3)<1e-8);assert(Math.abs(w[1]-n.y-24)<1e-8);}
  p=n;h=w;
 }
 assert.equal(s.phase,'result');assert(s.won);assert.equal(p.turn,1);assert.equal(p.frontality,1);assert.equal(p.angle,0);assert.equal(p.pocketAmount,0);assert.equal(R.visibleCards(s).filter(c=>c.role==='QUEEN').length,1);
 R.begin(s);assert.equal(s.phase,'restore');const start=R.trajectory(s,q);assert(Math.hypot(start.x-p.x,start.y-p.y)<1e-8);assert.deepEqual(R.handTargets(s)[0],h);
 until(s,'memorize');assert.equal(s.cards.filter(c=>c.role==='QUEEN').length,1);assert(!s.restoreFrom&&!s.restoreHands);
}
console.log('PASS: caught during shuffle/settle/choice, continuous hand attachment, one Queen, held result and next-hand return');
