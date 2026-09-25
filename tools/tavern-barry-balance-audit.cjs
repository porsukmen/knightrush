const assert=require('node:assert/strict'),Q=require('../assets/encounters/tavern-slide-physics.js');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function oldShot(shot,slip,aim,power){const angle=Math.atan2(shot.vy,shot.vx)+(aim*2-1)*.009,speed=clamp(Math.hypot(shot.vx,shot.vy)*(1+(power*2-1)*.015),Q.rules.minShot,Q.rules.maxShot);return{...shot,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed};}
const sample={vx:110,vy:460,label:'TAKEOUT'},saved=JSON.stringify(sample);
for(const slip of [0,.18,1])for(const aim of [0,.5,1])for(const power of [0,.5,1]){
 const shot=Q.humanizeShot(sample,slip,aim,power),speed=Math.hypot(shot.vx,shot.vy);
 assert.deepEqual(shot,Q.humanizeShot(sample,slip,aim,power));assert.equal(shot.label,sample.label);
 assert(Math.abs(Math.atan2(shot.vy,shot.vx)-Math.atan2(sample.vy,sample.vx))<=(slip<.18?.065:.022)+1e-9);
 assert(speed>=Q.rules.minShot-1e-9&&speed<=Q.rules.maxShot+1e-9);
}
assert.equal(JSON.stringify(sample),saved);
function matches(execute){const result={wins:0,losses:0,ties:0,margin:0};
 for(let game=0;game<64;game++){
  const random=rng(game+817);let board=[];
  for(let turn=0;turn<6;turn++){
   if((turn+game)%2){const plan=Q.plan(board);while(!Q.advancePlan(plan,4)){}board=Q.simulate(board,execute(plan.best,random(),random(),random()));}
   else{const s=Q.launch('player'),dx=((game*17+turn*11)%41)-20,dy=450-s.y,d=Math.hypot(dx,dy),speed=Math.sqrt(2*Q.rules.friction*d)*(1+(game%5-2)*.012);board=Q.simulate(board,{vx:dx/d*speed,vy:dy/d*speed},'player');}
  }
  const sums={player:0,ai:0};board.forEach(m=>sums[m.owner]+=Q.score(m));result.margin+=sums.ai-sums.player;
  result[sums.ai>sums.player?'wins':sums.ai<sums.player?'losses':'ties']++;
 }result.margin/=64;return result;
}
const before=matches(oldShot),after=matches(Q.humanizeShot);console.log({before,after});
assert(after.margin<before.margin,'Execution errors should reduce the advantage');
assert(after.wins>after.losses,'Barry must remain a strong strategic opponent');
assert(after.margin>before.margin*.55,'This is a small nerf, not an easy mode');
console.log('BARRY_BALANCE_OK deterministic / bounded / non-mutating / still competitive');
