/* Pure table coordinates. The opponent and the live game use this SAME solver.
   No canvas, RNG, economy, sounds or wall-clock work inside simulations. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KRTavernPhysics=api;})(typeof window==='object'?window:globalThis,()=>{
 'use strict';
 const rules=Object.freeze({mugsEach:3,friction:235,restitution:.88,railRestitution:.91,minShot:260,maxShot:950,
  stopSpeed:3,settleTime:.25,coinTossTime:3.1,coinImpacts:Object.freeze([1.05,1.43,1.66]),aiThinkTime:.85,mugRadius:25.5,mugHeightScale:1.35,step:1/120,
  left:70,right:410,tableTop:0,tableBottom:900,targetX:240,targetY:450,
  rings:Object.freeze([38,88,132]),scores:Object.freeze([3,2,1])});
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function project(x,y){const t=(y-rules.tableTop)/(rules.tableBottom-rules.tableTop),q=t/(3.1-2.1*t);return{x:240+(x-240)*(60+156*q)/170,y:320+370*q,scale:(60+156*q)/170};}
 function unproject(x,y){const q=(y-320)/370,t=3.1*q/(1+2.1*q);return{x:240+(x-240)*170/(60+156*q),y:rules.tableTop+t*(rules.tableBottom-rules.tableTop)};}
 function launch(owner){return{x:240,y:owner==='player'?835:65};}
 function score(m){if(!m.onTable)return 0;const d=Math.hypot(m.x-rules.targetX,m.y-rules.targetY);for(let i=0;i<3;i++)if(d<=rules.rings[i])return rules.scores[i];return 0;}
 function makeMug(owner,vx,vy){return{...launch(owner),owner,vx,vy,index:0,onTable:true,angle:0,spin:vx*.008,fallT:0,alpha:1};}
 function step(mugs,dt=rules.step){let impact=0,hitX=0,hitY=0,fallen=0;
  for(const m of mugs){
   if(!m.onTable){m.fallT+=dt;m.alpha=Math.max(0,1-m.fallT*2);continue;}
   const speed=Math.hypot(m.vx,m.vy);if(speed){const next=Math.max(0,speed-rules.friction*dt),travel=(speed+next)*.5*dt/speed;m.x+=m.vx*travel;m.y+=m.vy*travel;m.vx*=next/speed;m.vy*=next/speed;m.angle+=m.spin*dt;}
   if(m.y<rules.tableTop-rules.mugRadius||m.y>rules.tableBottom+rules.mugRadius){m.onTable=false;m.fallT=0;fallen++;continue;}
   // Only long sides have cushions. Both short ends are genuinely open.
   if(m.x<rules.left+rules.mugRadius){m.x=rules.left+rules.mugRadius;if(m.vx<0){impact=Math.max(impact,-m.vx);hitX=m.x;hitY=m.y;m.vx*=-rules.railRestitution;}}
   if(m.x>rules.right-rules.mugRadius){m.x=rules.right-rules.mugRadius;if(m.vx>0){impact=Math.max(impact,m.vx);hitX=m.x;hitY=m.y;m.vx*=-rules.railRestitution;}}
  }
  for(let pass=0;pass<2;pass++)for(let i=0;i<mugs.length;i++)for(let j=i+1;j<mugs.length;j++){
   const a=mugs[i],b=mugs[j];if(!a.onTable||!b.onTable)continue;
   let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>=rules.mugRadius*2)continue;
   if(d<.0001){dx=1;dy=0;d=1;}const nx=dx/d,ny=dy/d,overlap=rules.mugRadius*2-d;
   a.x-=nx*overlap*.5;a.y-=ny*overlap*.5;b.x+=nx*overlap*.5;b.y+=ny*overlap*.5;
   const rel=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rel>=0)continue;
   const impulse=-(1+rules.restitution)*rel*.5;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny;
   a.spin-=impulse*.012;b.spin+=impulse*.012;if(-rel>impact){impact=-rel;hitX=(a.x+b.x)/2;hitY=(a.y+b.y)/2;}
  }
  let moving=false;for(const m of mugs)if(m.onTable){if(Math.hypot(m.vx,m.vy)>rules.stopSpeed)moving=true;else m.vx=m.vy=0;}
  return{moving,impact,hitX,hitY,fallen};
 }
 function simulate(board,shot,owner='ai'){
  const mugs=board.filter(m=>m.onTable).map(m=>({...m}));mugs.push(makeMug(owner,shot.vx,shot.vy));
  for(let i=0;i<540;i++)if(!step(mugs).moving)break;
  return mugs;
 }
 function evaluate(board){let result=0;for(const m of board){if(!m.onTable)continue;const s=score(m),sign=m.owner==='ai'?1:-1,d=Math.hypot(m.x-240,m.y-450);
   result+=sign*(s*120+Math.max(0,rules.rings[2]-d)*.065);
   // A low-value guard between the player's launch and a scoring friendly cup.
   if(m.owner==='ai'&&s<2&&m.y>450&&m.y<630){for(const a of board)if(a!==m&&a.owner==='ai'&&score(a)>=2&&Math.abs(a.x-m.x)<32)result+=12;}
  }return result;}
 function plan(board){
  const s=launch('ai'),targets=[{x:240,y:450,label:'DRAW'},...[-58,58].flatMap(dx=>[-38,38].map(dy=>({x:240+dx,y:450+dy,label:'DRAW'}))),{x:240,y:570,label:'GUARD'}];
  for(const m of board)if(m.onTable)targets.push({x:m.x,y:m.y,label:m.owner==='player'?'TAKEOUT':'PROMOTION'});
  const candidates=[];
  for(const target of targets)for(const bank of [0,-1,1]){
   const wall=bank<0?rules.left+rules.mugRadius:rules.right-rules.mugRadius,x=bank?2*wall-target.x:target.x,dx=x-s.x,dy=target.y-s.y,d=Math.hypot(dx,dy);if(d<10||dy<=0)continue;
   for(const factor of target.label==='TAKEOUT'||target.label==='PROMOTION'?[1,1.18,1.45]:[.98,1.03,1.1]){
    const speed=clamp(Math.sqrt(2*rules.friction*d)*factor*(bank?1.06:1),rules.minShot,rules.maxShot);
    candidates.push({vx:dx/d*speed,vy:dy/d*speed,label:bank?'BANK '+target.label:target.label});
   }
  }
  return{candidates,cursor:0,best:null,board:board.map(m=>({...m})),bestValue:-Infinity};
 }
 function advancePlan(p,budget=5){for(let n=0;n<budget&&p.cursor<p.candidates.length;n++){
   const c=p.candidates[p.cursor++],result=simulate(p.board,c),value=evaluate(result)-Math.hypot(c.vx,c.vy)*.0005;
   if(value>p.bestValue){p.bestValue=value;p.best=c;}
  }return p.cursor===p.candidates.length;}
 // Execution, not strategy: sample once per shot, never per simulation/frame.
 // Most throws are steady; occasional small slips leave an opening to exploit.
 function humanizeShot(shot,slipRoll,aimRoll,powerRoll){
  const slip=slipRoll<.18,aimSpread=slip?.065:.022,powerSpread=slip?.06:.025;
  const angle=Math.atan2(shot.vy,shot.vx)+(clamp(aimRoll,0,1)*2-1)*aimSpread;
  const speed=clamp(Math.hypot(shot.vx,shot.vy)*(1+(clamp(powerRoll,0,1)*2-1)*powerSpread),rules.minShot,rules.maxShot);
  return{...shot,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed};
 }
 return Object.freeze({rules,project,unproject,launch,score,makeMug,step,simulate,evaluate,plan,advancePlan,humanizeShot});
});
