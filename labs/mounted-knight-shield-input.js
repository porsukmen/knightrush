/* Authored pose time stays stable for scrubbing; real-time playback is faster. */
(()=>{'use strict';
 const rate=1.25,guard=1.24,releaseTime=1.49,end=3.26;
 const begin=()=>({held:true,phase:'prepare',time:0});
 function release(input){input.held=false;if(input.phase==='hold'){input.phase='release';input.time=releaseTime;}}
 function advance(input,seconds){let dt=Math.max(0,seconds)*rate;
  if(input.phase==='prepare'){const step=Math.min(dt,guard-input.time);input.time+=step;dt-=step;
   if(input.time>=guard){input.time=guard;input.phase='hold';if(!input.held)release(input);}}
  if(input.phase==='release'){input.time=Math.min(end,input.time+dt);if(input.time>=end)input.phase='done';}
  return input;
 }
 window.KRMountedShieldInput={rate,guard,releaseTime,end,begin,release,advance};
})();
