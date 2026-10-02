/* Run-only choreography/placement. The approved Lab jump poses stay intact. */
(()=>{'use strict';
 // The hands cue the turn; horse heading and balance follow actual lane travel.
 function advanceLane(lane,velocity,dt){
  if(!(dt>0))return;
  const target=Math.max(-1,Math.min(1,velocity/7));
  lane.stepClock=(lane.stepClock||0)+dt;
  lane.heading+=(target-lane.heading)*(1-Math.exp(-dt/.075));
  lane.bank+=(target-lane.bank)*(1-Math.exp(-dt/.12));
  const held=Math.min(dt,lane.riderCueTime||0),follow=(goal,time,omega)=>{
   // Exact critically damped response: position AND velocity survive a new
   // input, avoiding the head-like jab of an exponential goal change.
   const x=(lane.rider||0)-goal,v=lane.riderVelocity||0,c=v+omega*x,e=Math.exp(-omega*time);
   lane.rider=goal+(x+c*time)*e;lane.riderVelocity=(v-omega*c*time)*e;
  };
  if(held)follow(lane.riderCue,held,24);
  lane.riderCueTime=Math.max(0,(lane.riderCueTime||0)-dt);
  if(dt>held)follow(target*.65,dt-held,18);
  if(!target&&!lane.riderCueTime&&Math.abs(lane.rider)<1e-5&&Math.abs(lane.riderVelocity)<1e-4)lane.rider=lane.riderVelocity=0;
  if(!target&&Math.abs(lane.heading)<1e-5)lane.heading=0;
  if(!target&&Math.abs(lane.bank)<1e-5)lane.bank=0;
 }
 // Input changes the rider's goal, never the current pose. The short lead-in
 // blends into a slower recovery; reversals begin from the live lean too.
 function cueLane(lane,direction){lane.riderCue=Math.sign(direction)*.72;lane.riderCueTime=.14;}
 function resetLane(lane){lane.heading=lane.bank=lane.rider=lane.riderVelocity=lane.riderCue=lane.riderCueTime=lane.stepClock=0;}
 // Camera-relative counterbalance through the existing 90-degree road turn.
 // Zero position and velocity at both ends avoid an entry/exit pose snap.
 function cornerPose(journey){
  const t=Math.max(0,Math.min(1,journey?.turnT||0)),
   amount=journey?.phase==='turning'?(journey.direction<0?-1:1)*Math.sin(Math.PI*t)**2:0;
  return {amount,yaw:-7*amount,bank:.085*amount,rider:.85*amount};
 }
 const knots=[[0,.5],[.060,.78],[.090,.846],[.330,1.07495],[.570,1.328],[.690,1.626],[.780,1.8]],
  slopes=knots.slice(1).map((p,i)=>(p[1]-knots[i][1])/(p[0]-knots[i][0])),
  tangents=knots.map((p,i)=>i===0||i===knots.length-1?1:2/(1/slopes[i-1]+1/slopes[i]));
 function timeAt(elapsed){
  const t=Math.max(0,Math.min(.780,elapsed));let i=1;while(i<knots.length-1&&t>knots[i][0])i++;
  const [x0,y0]=knots[i-1],[x1,y1]=knots[i],d=x1-x0,u=(t-x0)/d,u2=u*u,u3=u2*u;
  return (2*u3-3*u2+1)*y0+(u3-2*u2+u)*d*tangents[i-1]+(-2*u3+3*u2)*y1+(u3-u2)*d*tangents[i];
 }
 function frame(state,x,groundY,unit){
  const pose=KRMountedReview.pose(state),s=pose.horseScale,
   air=pose.jump?.airborne?(state.time-KRMountedJump.timing.takeoff)/(KRMountedJump.timing.contact-KRMountedJump.timing.takeoff):0,
   extraLift=5*s*Math.sin(Math.PI*air)**2,
   height=((pose.jump?.height||0)+extraLift)*unit,
   sole=l=>l.end[1]+s*Math.min(...[-1.08,-.78,.1].flatMap(y=>[-1,2].map(z=>y*Math.cos(l.pitch)-z*Math.sin(l.pitch)))),
   minSole=Math.min(...pose.legs.map(sole))+extraLift,
   // Project the current body's footprint onto Y=0. Its shadow has its own
   // ground anchor; neither world height nor old rider lean moves the actor.
   footprint=pose.legs.map(l=>pose.project([l.root[0],0,l.root[2]])),
   xs=footprint.map(v=>v[0]*unit),ys=footprint.map(v=>v[1]*unit),
   lift=Math.min(1,height/(8*s*unit)),shrink=1-.18*lift,
   bank=state.laneBank||0,cs=Math.cos(bank),sn=Math.sin(bank);
  // Keep the lowest sole from dipping below its unbanked road projection.
  // This small support correction is visual only; collision height is intact.
  let bankLift=0;
  if(bank)for(const l of pose.legs)for(const dx of [-1.53,1.53])for(const dy of [-1.08,.1])for(const dz of [-1.02,2]){
   const cy=dy*Math.cos(l.pitch)-dz*Math.sin(l.pitch),cz=dy*Math.sin(l.pitch)+dz*Math.cos(l.pitch),
    q=pose.project([l.end[0]+dx*s,l.end[1]+cy*s,l.end[2]+cz*s]);
   bankLift=Math.max(bankLift,sn*q[0]+(cs-1)*q[1]);
  }
  return {state,pose,extraLift,bank:{angle:bank,lift:bankLift*unit},placement:{x,y:groundY-extraLift*unit,unit},height,minSole,
   // A full hoof-height margin above the road, using the new rig's own
   // units. Ordinary gallop suspension is not a hazard-clearing jump.
   airborne:!!pose.jump?.airborne&&minSole>4*s,
   shadow:{x:x+(Math.min(...xs)+Math.max(...xs))/2,y:groundY+(Math.min(...ys)+Math.max(...ys))/2,
    rx:((Math.max(...xs)-Math.min(...xs))/2+1.8*s*unit)*shrink,
    ry:((Math.max(...ys)-Math.min(...ys))/2+.7*s*unit)*shrink,alpha:.30*(1-.5*lift)}};
 }
 const duckTiming=Object.freeze({lower:.10,hold:.16,rise:.16,duration:.42}),
  ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);},
  duckAmountAt=t=>t<0?0:t<duckTiming.lower?ease(t/duckTiming.lower):t<=duckTiming.lower+duckTiming.hold?1:1-ease((t-duckTiming.lower-duckTiming.hold)/duckTiming.rise);
 window.KRMountedRunMotion={timeAt,frame,advanceLane,cueLane,resetLane,cornerPose,duckTiming,duckAmountAt,timing:Object.freeze({takeoff:.090,apex:.330,contact:.570,duration:.780})};
})();
