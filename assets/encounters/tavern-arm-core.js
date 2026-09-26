/* Tavern strength duel: explicit RNG, fixed-step stamina and readable AI tells.
   Roadside taxman retains its separate legacy swipe rules. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KRArmRules=api;})(typeof window==='object'?window:globalThis,()=>{
 'use strict';
 const rules=Object.freeze({step:1/120,readyTime:1.4,pinTime:.65,counterWindow:.45});
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 function create(){return{phase:'intro',phaseT:0,power:.5,velocity:0,energy:1,rivalEnergy:1,held:false,restT:1,elapsed:0,acc:0,cue:'rest',cueT:0,cueDuration:1,counterT:0,counterUsed:false,counters:0,effort:0,result:null};}
 function start(s){Object.assign(s,create(),{phase:'ready'});}
 function hold(s,on){
  on=!!on;if(s.phase!=='playing'){s.held=false;return false;}
  if(on&&!s.held&&s.cue==='recover'&&s.cueT<rules.counterWindow&&s.restT>.18&&s.energy>.2&&!s.counterUsed){s.counterT=.75;s.counterUsed=true;s.counters++;}
  if(!on&&s.held)s.restT=0;s.held=on;return true;
 }
 function nextCue(s,rng){
  s.cueT=0;
  if(s.cue==='rest'){s.cue='windup';s.cueDuration=.55+rng()*.35;s.counterUsed=false;}
  else if(s.cue==='windup'){s.cue='surge';s.cueDuration=.8+rng()*.6;}
  else if(s.cue==='surge'){s.cue='recover';s.cueDuration=1.1+rng()*.55;}
  else{s.cue='rest';s.cueDuration=.7+rng()*.8;}
 }
 function tick(s,dt,rng){
  s.phaseT+=dt;
  if(s.phase==='ready'){if(s.phaseT>=rules.readyTime){s.phase='playing';s.phaseT=0;s.cueDuration=.7+rng()*.6;}return;}
  if(s.phase==='pinning'){if(s.phaseT>=rules.pinTime){s.phase='result';s.phaseT=0;}return;}
  if(s.phase!=='playing')return;
  s.elapsed+=dt;s.cueT+=dt;if(s.cueT>=s.cueDuration)nextCue(s,rng);
  s.counterT=Math.max(0,s.counterT-dt);if(!s.held)s.restT+=dt;else s.restT=0;
  s.energy=clamp(s.energy+dt*(s.held?-.20:.26));
  s.rivalEnergy=clamp(s.rivalEnergy+dt*(s.cue==='surge'?-.27:s.cue==='windup'?-.045:.19));
  const fatigue=1+Math.max(0,s.elapsed-30)*.012;
  const rival=(s.cue==='surge'?.29:s.cue==='windup'?.085:s.cue==='recover'?.018:.065)*(.38+.62*s.rivalEnergy)*fatigue;
  const player=s.held?.225*(.12+.88*s.energy)+(s.counterT>0?.20:0):.025;
  s.effort+=(Number(s.held)-s.effort)*Math.min(1,dt*9);
  const target=(player-rival)*.55;
  s.velocity+=(target-s.velocity)*(1-Math.exp(-dt*10));s.power=clamp(s.power+s.velocity*dt);
  if(s.power>=.98||s.power<=.02){const win=s.power>=.98;s.phase='pinning';s.phaseT=0;s.held=false;s.result={win,time:s.elapsed,counters:s.counters};s.pinFrom=s.power;}
 }
 function update(s,dt,rng){
  s.acc+=clamp(Number.isFinite(dt)?dt:0,0,.1);
  while(s.acc+1e-10>=rules.step){s.acc-=rules.step;tick(s,rules.step,rng);}
 }
 return Object.freeze({rules,create,start,hold,update});
});
