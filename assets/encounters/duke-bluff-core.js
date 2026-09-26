/* Pure rules. The AI is passed its own dice and public bids, NEVER the rival hand. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KRDukeRules=api;})(typeof window==='object'?window:globalThis,()=>{
 'use strict';
 const rules=Object.freeze({dicePerPlayer:3,sides:6,seals:3,coinTime:3.2,coinSettle:1.9,rollTime:.9,revealTime:1.6});
 const rank=b=>b?(b.count-1)*6+b.face:0;
 const valid=(b,previous)=>!!b&&Number.isInteger(b.count)&&b.count>=1&&b.count<=6&&Number.isInteger(b.face)&&b.face>=1&&b.face<=6&&rank(b)>rank(previous);
 const next=b=>rank(b)>=36?null:{count:Math.floor(rank(b)/6)+1,face:rank(b)%6+1};
 function probability(own,bid){
  const need=bid.count-own.filter(v=>v===bid.face).length;
  if(need<=0)return 1;if(need>3)return 0;
  let result=0;for(let k=need;k<=3;k++)result+=[1,3,3,1][k]*(1/6)**k*(5/6)**(3-k);return result;
 }
 function decide({ownDice,bid,history=[]},random){
  const confidence=bid?probability(ownDice,bid):1;
  // Small judgment error. No outcome peeking and no guaranteed bluff gesture.
  if(bid&&(rank(bid)===36||confidence<.20+random()*.30))return{type:'call'};
  const bluff=random()<.22,candidates=[];
  for(let count=1;count<=6;count++)for(let face=1;face<=6;face++){
   const b={count,face};if(!valid(b,bid))continue;
   const chance=probability(ownDice,b),rise=rank(b)-rank(bid);
   if(chance<.025)continue;
   const supported=history.some(h=>h.owner==='player'&&h.face===face)? .045:0;
   const target=bluff?.28:.70;
   candidates.push({b,value:-Math.abs(chance+supported-target)-rise*.009+random()*.17});
  }
  if(!candidates.length)return bid?{type:'call'}:{type:'bid',bid:{count:1,face:ownDice[0]}};
  candidates.sort((a,b)=>b.value-a.value);return{type:'bid',bid:candidates[0].b};
 }
 function create(){return{phase:'intro',phaseT:0,round:0,losses:{player:0,duke:0},playerDice:[1,1,1],rivalDice:[1,1,1],bid:null,history:[],turn:'player',starter:'player',selected:{count:1,face:1},result:null,matchWinner:null,tell:0,aiAction:null,aiDelay:0};}
 function startRound(s,random){
  if(!['intro','result'].includes(s.phase))return;
  if(s.phase==='intro'||s.matchWinner){
   s.losses={player:0,duke:0};s.round=0;s.starter=random()<.5?'player':'duke';s.matchWinner=null;
   s.phase='coinToss';s.phaseT=0;s.bid=null;s.history=[];s.result=null;s.aiAction=null;s.tell=0;return;
  }
  rollRound(s,random);
 }
 function rollRound(s,random){
  s.round++;s.phase='rolling';s.phaseT=0;s.bid=null;s.history=[];s.result=null;s.aiAction=null;s.selected={count:1,face:1};s.tell=0;
  s.playerDice=Array.from({length:3},()=>1+Math.floor(random()*6));s.rivalDice=Array.from({length:3},()=>1+Math.floor(random()*6));
 }
 function beginTurn(s,owner,random){
  s.phase='turn';s.phaseT=0;s.turn=owner;s.selected=next(s.bid)||{count:6,face:6};
  if(owner==='duke'){
   s.aiAction=decide({ownDice:s.rivalDice.slice(),bid:s.bid&&{...s.bid},history:s.history.map(h=>({...h}))},random);
   s.aiDelay=1.25+random()*.85;s.tell=Math.floor(random()*4);
  }
 }
 function bid(s,owner,b,random){
  if(s.phase!=='turn'||s.turn!==owner||!valid(b,s.bid))return false;
  s.bid={count:b.count,face:b.face,owner};s.history.push({...s.bid});beginTurn(s,owner==='player'?'duke':'player',random);return true;
 }
 function challenge(s,owner){
  if(s.phase!=='turn'||s.turn!==owner||!s.bid)return false;
  const count=[...s.playerDice,...s.rivalDice].filter(v=>v===s.bid.face).length,truth=count>=s.bid.count;
  const loser=truth?owner:s.bid.owner;s.result={count,truth,loser,caller:owner,bid:{...s.bid}};s.aiAction=null;s.phase='revealing';s.phaseT=0;return true;
 }
 function update(s,dt,random){
  s.phaseT+=Math.max(0,dt);
  if(s.phase==='coinToss'&&s.phaseT>=rules.coinTime)rollRound(s,random);
  else if(s.phase==='rolling'&&s.phaseT>=rules.rollTime)beginTurn(s,s.starter,random);
  else if(s.phase==='turn'&&s.turn==='duke'&&s.phaseT>=s.aiDelay){const a=s.aiAction;if(a?.type==='call')challenge(s,'duke');else if(a?.type==='bid')bid(s,'duke',a.bid,random);}
  else if(s.phase==='revealing'&&s.phaseT>=rules.revealTime){
   s.losses[s.result.loser]++;s.starter=s.result.loser;s.matchWinner=s.losses[s.result.loser]>=rules.seals?(s.result.loser==='duke'?'player':'duke'):null;s.phase='result';s.phaseT=0;
  }
 }
 return Object.freeze({rules,rank,valid,next,probability,decide,create,startRound,beginTurn,bid,challenge,update});
});
