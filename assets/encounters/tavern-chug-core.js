/* Explicit fixed-step mug physics. Neither contestant can win by spilling. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KRChugRules=api;})(typeof window==='object'?window:globalThis,()=>{
 'use strict';
 const rules=Object.freeze({step:1/120,readyTime:1.3,maxTime:45,flow:.071});
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const mug=()=>({done:0,angle:0,actual:0,lift:0,foam:0,spillT:0,spills:0,flow:0,held:false});
 function create(){return{phase:'intro',phaseT:0,elapsed:0,acc:0,player:mug(),rival:mug(),aim:0,aiT:0,aiBias:0,aiRest:0,drag:null,up:false,down:false,result:null};}
 function start(s){Object.assign(s,create(),{phase:'ready'});}
 function ideal(m){return .25+.53*m.done;}
 function sway(m,t,seed=0){return m.done*(Math.sin(t*2.05+seed)*.047+Math.sin(t*3.3+seed*.7)*.017);}
 function hold(s,on){s.player.held=s.phase==='playing'&&!!on;}
 function setAngle(s,a){s.aim=clamp(a);}
 function advanceMug(m,aim,held,t,dt,seed){
  m.held=held;m.angle+=( (held?aim:0)-m.angle)*(1-Math.exp(-dt*14));
  m.lift+=((held&&m.spillT===0?1:0)-m.lift)*(1-Math.exp(-dt*9));
  m.actual=clamp(m.angle+sway(m,t,seed));m.spillT=Math.max(0,m.spillT-dt);m.flow=0;
  const delta=m.actual-ideal(m);
  if(held&&m.spillT===0){
   // A modest incline pours slowly; over-tilting froths up before spilling.
   m.flow=clamp((delta+.13)/.11)*clamp(1-Math.max(0,delta-.055)*2.5);
   m.foam=clamp(m.foam+dt*(delta>.075?(delta-.075)*4.5:-.32));
   if(m.foam>=1){m.spills++;m.spillT=.95;m.foam=.48;m.flow=0;}
   m.done=clamp(m.done+dt*rules.flow*m.flow);
  }else m.foam=clamp(m.foam-dt*.55);
 }
 function tick(s,dt,rng){
  s.phaseT+=dt;
  if(s.phase==='ready'){if(s.phaseT>=rules.readyTime){s.phase='playing';s.phaseT=0;}return;}
  if(s.phase!=='playing')return;
  s.elapsed+=dt;s.aiT-=dt;s.aiRest=Math.max(0,s.aiRest-dt);
  if(s.aiT<=0){s.aiT=1.6+rng()*1.2;s.aiBias=(rng()-.43)*.17;if(rng()<.27)s.aiRest=.45+rng()*.55;}
  if(s.up||s.down){s.aim=clamp(s.aim+dt*((s.up?.37:0)-(s.down?.37:0)));s.player.held=true;}
  advanceMug(s.player,s.aim,s.player.held,s.elapsed,dt,0);
  const rivalAim=ideal(s.rival)+s.aiBias+Math.sin(s.elapsed*1.1)*.048;
  advanceMug(s.rival,rivalAim,s.aiRest===0&&s.rival.spillT===0,s.elapsed,dt,2.4);
  if(s.player.done>=1||s.rival.done>=1||s.elapsed>=rules.maxTime){
   const tie=Math.abs(s.player.done-s.rival.done)<1e-8;
   s.result={win:!tie&&s.player.done>s.rival.done,tie,time:s.elapsed,spills:s.player.spills};
   s.phase='result';s.phaseT=0;s.player.held=false;s.rival.held=false;s.drag=null;s.up=s.down=false;
  }
 }
 function update(s,dt,rng){s.acc+=clamp(Number.isFinite(dt)?dt:0,0,.1);while(s.acc+1e-10>=rules.step){s.acc-=rules.step;tick(s,rules.step,rng);}}
 return Object.freeze({rules,create,start,hold,setAngle,ideal,sway,update});
});
