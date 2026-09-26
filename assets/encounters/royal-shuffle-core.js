/* Pure Royal Shuffle. Three physical card identities; one trajectory per card. */
(function(root){
 'use strict';
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
 const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*ease(t)),idle=()=>[[188,363],[292,363]];
 // Physical IDs remain stable; the queen is hearts and every king is clubs.
 const deck=Object.freeze([{id:'black_king',rank:'K',role:'KING',red:false,suit:'clubs'},{id:'red_queen',rank:'Q',role:'QUEEN',red:true,suit:'hearts'},{id:'red_king',rank:'K',role:'KING',red:false,suit:'clubs'}].map(Object.freeze));
 const rules=Object.freeze({cards:3,kings:2,queens:1,swaps:8,showTime:1.1,flipTime:.34,swapTime:.5,wins:2});
 const tricks=Object.freeze(['doubleLift','handoff','falseDrop','falseTransfer','pocketSwitch']);
 const pocket=Object.freeze({x:210,y:316}),reserve=Object.freeze({x:270,y:320});
 const isTrick=m=>!!m&&tricks.includes(m.kind);
 const pocketCard=s=>visibleCards(s).find(c=>c.id===s.pocketCardId);
 function rng(s){s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;}
 function shuffled(s,a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng(s)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function create(seed=1){const s={rng:seed>>>0,phase:'intro',phaseT:0,elapsed:0,hand:0,you:0,dealer:0,cards:deck.map((c,slot)=>({...c,slot})),shuffleMoves:[],shuffleIndex:0,cursorSlot:1,selectedSlot:-1,won:false,matchOver:false,accused:false,caught:false,notice:'',handsFrom:idle(),pocketed:false,spare:null,pocketCaught:false};s.trickOrder=shuffled(s,tricks.filter(k=>k!=='pocketSwitch'));s.pocketHand=null;return s;}
 function begin(s){
  if(s.phase!=='intro'&&s.phase!=='result')return false;
  const held=s.phase==='result'&&s.pocketCaught&&!s.matchOver;
  s.restoreFrom=held?trajectory(s,pocketCard(s)):null;s.restoreHands=held?handTargets(s):null;
  if(s.phase==='result'&&s.matchOver)Object.assign(s,create(s.rng));
  Object.assign(s,{hand:s.hand+1,phase:s.pocketed?'restore':'memorize',phaseT:0,selectedSlot:-1,cursorSlot:1,accused:false,caught:false,pocketCaught:false,pocketPicked:false,notice:'',won:false,shuffleIndex:0,handsFrom:idle()});
  // Continue the exact table layout, including the replacement king's position.
  if(s.pocketed)s.restoreSlot=s.spare.slot;
  s.shuffleMoves=[];
  const pairs=[[0,1],[1,2],[0,2]],count=8+(s.hand-1)*2;let prev=-1;
  for(let i=0;i<count;i++){
   let p=Math.floor(rng(s)*3);if(p===prev)p=(p+1)%3;prev=p;
   const kind=i===2?'feint':i===4?'cycle':'swap',duration=(.59-s.hand*.025)*(.88+rng(s)*.24);
   s.shuffleMoves.push({kind,pair:pairs[p].slice(),duration:duration*(kind==='feint'?1.22:1)});
  }
  // Integrated tricks; two ordinary moves follow. No final cheat announcement.
  const eligible=shuffled(s,Array.from({length:count-4},(_,i)=>i+1)),chosen=[];
  for(const at of eligible){if(chosen.every(n=>Math.abs(n-at)>1)){chosen.push(at);if(chosen.length===(s.hand===1?1:2))break;}}
  chosen.sort((a,b)=>a-b).forEach((at,i)=>{s.shuffleMoves[at]={kind:s.trickOrder[(s.hand-1+i)%s.trickOrder.length],pair:[],duration:.82-s.hand*.025};});
  const usePocket=s.pocketHand==null?rng(s)<[.5,.75,1][Math.min(2,s.hand-1)]:s.hand===s.pocketHand;
  if(usePocket){const at=chosen[chosen.length-1];s.shuffleMoves[at]={kind:'pocketSwitch',pair:[],duration:.76};}
  const honestAt=shuffled(s,s.shuffleMoves.map((m,i)=>!isTrick(m)?i:-1).filter(i=>i>0&&i<count-1))[0];
  if(honestAt!==undefined)s.shuffleMoves[honestAt]={kind:'honestPass',pair:[],duration:.78};
  return true;
 }
 function activeMove(s){return s.phase==='shuffle'?s.shuffleMoves[s.shuffleIndex]:null;}
 const base=slot=>[172+slot*68,407,0],grip=p=>[p[0],p[1]-p[2]-29];
 function key(t,a,b,wa=grip(a),wb=grip(b)){return{t,a,b,wa,wb};}
 function buildTrick(m){
  const [as,bs]=m.pair,A=base(as),B=base(bs),ax=A[0],bx=B[0],mid=(ax+bx)/2;
  if(m.kind==='doubleLift'){
   const a0=[ax,407,0],b0=[ax+3,405,2],a1=[ax,407,8],b1=[ax+3,405,10],a2=[bx,407,8],b2=[bx+3,405,10];
   const free=[a1[0]+(m.handOrder[0]?18:-18),grip(a1)[1]-18];
   m.keys=[key(0,A,B),key(.22,a0,b0),key(.30,a1,b1,free,grip(b1)),
    key(.55,a2,b2,grip(b2),grip(b2)),key(.65,a2,b2,grip(b2),grip(a2)),key(1,B,A,grip(A),grip(B))];
   m.catchWindow=[.30,.49];m.endSwap=true;
  }else if(m.kind==='handoff'){
   const a=[mid-3,392,7],b=[mid+3,394,9];
   m.keys=[key(0,A,B),key(.34,a,b),key(.47,a,b),key(.60,a,b,grip(b),grip(a)),key(1,B,A,grip(A),grip(B))];
   m.catchWindow=[.44,.62];m.endSwap=true;
  }else if(m.kind==='falseTransfer'||m.kind==='honestPass'){
   const meet=[mid,389,8],receiving=[mid+8,grip(meet)[1]],empty=[bx+(bx>ax?16:-16),353];
   if(m.kind==='falseTransfer'){
    m.keys=[key(0,A,B),key(.28,meet,B,grip(meet),receiving),key(.42,meet,B,grip(meet),receiving),
     key(.65,[ax,395,8],B,grip([ax,395,8]),empty),key(1,A,B)];m.endSwap=false;m.catchWindow=[.42,.60];
   }else{
    m.keys=[key(0,A,B),key(.28,meet,B,grip(meet),receiving),key(.42,meet,B,grip(meet),receiving),
     key(.60,meet,B,grip(B),grip(meet)),key(1,B,A,grip(A),grip(B))];m.endSwap=true;
   }
  }else if(m.kind==='pocketSwitch'){
   const P=[pocket.x,pocket.y,0],S=[reserve.x,reserve.y,0],over=[ax+3,407,5];
   m.keys=m.feint
    ?[key(0,A,S),key(.28,A,over),key(.44,[ax-3,399,8],A),key(.58,A,[ax+3,399,8]),key(.82,A,P),key(1,A,P)]
    :[key(0,A,S),key(.28,A,over),key(.44,[ax-3,399,8],A),key(.82,P,A),key(1,P,A)];
   m.endSwap=false;
  }else{
   const inward=Math.sign(ax-bx);
   m.keys=[key(0,A,B),key(.28,[bx+inward*8,407,8],[ax,390,0]),key(.42,[bx,407,1],[ax,407,0]),
    key(.56,[bx+inward*12,405,7],[ax,397,2]),key(.80,[ax,407,7],[bx,392,1]),key(1,A,B)];
   m.catchWindow=[.44,.62];m.endSwap=false;
  }
 }
 function prepareMove(s){
  const m=activeMove(s);if(!m)return;
  if(isTrick(m)||m.kind==='honestPass'){
   const q=tableCards(s).find(c=>c.role==='QUEEN')?.slot??s.spare.slot;m.pair=[q,(q+1+Math.floor(rng(s)*2))%3];
   if(m.kind==='pocketSwitch'){
    m.variant=m.variant||s.pocketVariantOverride||['queen','king','feintQueen','feintKing'][Math.floor(rng(s)*4)];
    m.feint=m.variant.startsWith('feint');
    const targets=s.cards.filter(c=>(c.role==='KING')===m.variant.toLowerCase().endsWith('king'));
    const source=targets[Math.floor(rng(s)*targets.length)];
    m.sourceId=source.id;m.pair=[source.slot,source.slot];
    s.spare={id:'pocket_king',rank:'K',role:'KING',red:false,suit:'clubs',slot:source.slot};
    s.pocketCardId=m.feint?s.spare.id:source.id;
   }
   m.handOrder=m.pair[0]<m.pair[1]?[0,1]:[1,0];buildTrick(m);
  }else{
   const cost=p=>p.reduce((v,slot,i)=>v+Math.hypot(s.handsFrom[i][0]-base(slot)[0],s.handsFrom[i][1]-378),0);
   const rev=m.pair.slice().reverse();if(cost(rev)<cost(m.pair))m.pair=rev;
   m.handOrder=[0,1];m.endSwap=m.kind!=='feint';
  }
  const reach=Math.max(...m.pair.map((slot,i)=>{const h=s.handsFrom[m.handOrder[i]],p=m.keys?(i?m.keys[0].wb:m.keys[0].wa):grip(base(slot));return Math.hypot(h[0]-p[0],h[1]-p[1]);}));
  m.reachTime=Math.max(.13,reach/420);m.motionTime=m.keys?m.duration:m.duration*.72;m.duration=m.reachTime+m.motionTime;
 }
 function progress(s){const m=activeMove(s);return m?clamp((s.phaseT-m.reachTime)/m.motionTime):0;}
 function motion(s){
  const m=activeMove(s),u=progress(s);if(!m)return null;
  let a,b,wa,wb;
  if(m.keys){
   let hi=1;while(hi<m.keys.length-1&&u>m.keys[hi].t)hi++;
   const k=m.keys[hi-1],n=m.keys[hi],v=(u-k.t)/(n.t-k.t);
   a=mix(k.a,n.a,v);b=mix(k.b,n.b,v);wa=mix(k.wa,n.wa,v);wb=mix(k.wb,n.wb,v);
  }else{
   const A=base(m.pair[0]),B=base(m.pair[1]),f=ease(u),k=m.kind==='feint'?Math.sin(f*Math.PI)*.64:f;
   a=[A[0]+(B[0]-A[0])*k,407-Math.sin(k*Math.PI)*14,0];
   b=[B[0]+(A[0]-B[0])*k,407+Math.sin(k*Math.PI)*14,0];wa=grip(a);wb=grip(b);
  }
  const hands=[];hands[m.handOrder[0]]=wa;hands[m.handOrder[1]]=wb;
  return{a,b,hands,u,m};
 }
 function caughtDisplay(s){
  if(!s.pocketCaught||!['surprise','result'].includes(s.phase))return null;
  const t=s.phase==='result'?1.2:s.phaseT;
  const lift=clamp((t-.18)/.32),present=clamp((t-.50)/.40);
  const p=mix(mix([pocket.x,pocket.y,0],[211,289,0],lift),[237,302,0],present);
  return{x:p[0],y:p[1],lift:0,angle:0,frontality:ease(present),layer:20,pocketAmount:1-ease(lift),widthScale:.4,heightScale:.68,turn:ease((t-.55)/.38),reach:clamp(t/.18)};
 }
 const heldGrip=p=>[p.x-3*p.widthScale/.4,p.y+24*p.heightScale/.68];
 function trajectory(s,c){
  const v=motion(s);let p,pocketAmount=0;
  const inPocket=c.id===s.pocketCardId;
  const shown=inPocket?caughtDisplay(s):null;if(shown)return shown;
  if(['restore','coverup'].includes(s.phase)&&(inPocket||c===s.spare)){
   const t=clamp((s.phaseT-.16)/.68),fake=pocketCard(s)===s.spare;
   if(inPocket&&s.phase==='restore'&&s.restoreFrom){
    const a=s.restoreFrom,q=mix([a.x,a.y,0],base(s.restoreSlot),t),f=ease(t);
    return{x:q[0],y:q[1],lift:0,angle:a.angle*(1-f),frontality:(a.frontality||0)*(1-f),layer:20*(1-f),pocketAmount:0,widthScale:.4+.6*f,heightScale:.68+.32*f};
   }
   p=mix(inPocket?[pocket.x,pocket.y,0]:base(s.restoreSlot),inPocket&&!fake?base(s.restoreSlot):[reserve.x,reserve.y,0],t);
   pocketAmount=fake?1:inPocket?1-ease(t):ease(t);
  }else if(v?.m.kind==='pocketSwitch'&&(c.id===v.m.sourceId||c===s.spare)){
   const source=c.id===v.m.sourceId;p=source?v.a:v.b;
   pocketAmount=source?(v.m.feint?0:ease((v.u-.64)/.18)):(1-ease(v.u/.28))+(v.m.feint?ease((v.u-.64)/.18):0);
  }else if(s.pocketed&&inPocket){p=[pocket.x,pocket.y,0];pocketAmount=1;}
  else{const i=v?v.m.pair.indexOf(c.slot):-1;p=i===0?v.a:i===1?v.b:base(c.slot);}
  return{x:p[0],y:p[1],lift:p[2],angle:0,layer:p[2],pocketAmount,widthScale:1-.60*pocketAmount,heightScale:1-.32*pocketAmount};
 }
 function visibleCards(s){return s.spare?[...s.cards,s.spare]:s.cards;}
 function tableCards(s){return visibleCards(s).filter(c=>!(s.pocketed&&c.id===s.pocketCardId));}
 function handTargets(s){
  const shown=caughtDisplay(s);
  if(shown)return [mix(s.handsFrom[0],heldGrip(shown),shown.reach),mix(s.handsFrom[1],idle()[1],s.phase==='result'?1:s.phaseT/.38)];
  if(['restore','coverup'].includes(s.phase)){
   const q=trajectory(s,pocketCard(s)),k=pocketCard(s)===s.spare?null:trajectory(s,s.spare),t=clamp(s.phaseT/.16),end=clamp((s.phaseT-.84)/.2);
   return [q,k].map((p,i)=>p?mix(mix(s.restoreHands?.[i]||idle()[i],s.phase==='restore'&&s.restoreFrom&&i===0?heldGrip(p):grip([p.x,p.y,p.lift]),t),idle()[i],end):idle()[i]);
  }
  const v=motion(s);if(v){const t=clamp(s.phaseT/v.m.reachTime);return v.hands.map((w,i)=>mix(s.handsFrom[i],w,t));}
  return ['settle','surprise','pocketReveal'].includes(s.phase)?idle().map((w,i)=>mix(s.handsFrom[i],w,s.phaseT/.38)):idle();
 }
 function catchPocket(s){
  const arriving=activeMove(s)?.kind==='pocketSwitch'&&progress(s)>=.82;
  if((!s.pocketed&&!arriving)||!['shuffle','settle','choose'].includes(s.phase))return false;
  if(s.pocketPicked)return false;
  s.pocketPicked=true;s.caught=pocketCard(s)?.role==='QUEEN';s.pocketCaught=s.caught;
  s.notice=s.caught?'THE QUEEN IN YOUR POCKET!':'ONLY A KING. YOU TOOK THE BAIT.';
  if(s.phase!=='shuffle'){s.handsFrom=handTargets(s);s.phase=s.caught?'surprise':'pocketReveal';s.phaseT=0;}return true;
 }
 function commit(s,m){if(m.kind==='pocketSwitch'){s.pocketed=true;return;}if(!m.endSwap)return;for(const c of tableCards(s)){const i=m.pair.indexOf(c.slot);if(i>=0)c.slot=m.pair[1-i];}}
 function settle(s){s.won=s.pocketPicked?s.pocketCaught:s.caught||tableCards(s).find(c=>c.slot===s.selectedSlot)?.role==='QUEEN';if(s.won)s.you++;else s.dealer++;s.matchOver=s.you===2||s.dealer===2;s.phase=s.pocketed&&!s.won?'coverup':'result';if(s.phase==='coverup')s.restoreSlot=s.spare.slot;s.phaseT=0;}
 function choose(s,slot){if(s.phase!=='choose'||!Number.isInteger(slot)||slot<0||slot>2)return false;s.selectedSlot=s.cursorSlot=slot;s.phase='reveal';s.phaseT=0;return true;}
 function duration(s){return ['restore','coverup'].includes(s.phase)?1.04:s.phase==='surprise'?1.2:s.phase==='pocketReveal'?.9:s.phase==='memorize'?Math.max(.82,rules.showTime-(s.hand-1)*.14):s.phase==='flip'?rules.flipTime:s.phase==='shuffle'?activeMove(s).duration:s.phase==='settle'?.38:s.phase==='reveal'?1.2:Infinity;}
 function advance(s){
  if(s.phase==='restore'||s.phase==='coverup'){
   const cover=s.phase==='coverup',c=pocketCard(s);if(c!==s.spare)c.slot=s.restoreSlot;s.spare=null;s.pocketed=false;s.pocketCardId=null;s.restoreFrom=null;s.restoreHands=null;
   if(cover){s.phase='result';if(!s.matchOver)begin(s);}else s.phase='memorize';
  }
  else if(s.phase==='surprise'||s.phase==='pocketReveal')settle(s);
  else if(s.phase==='memorize')s.phase='flip';
  else if(s.phase==='flip'){s.phase='shuffle';prepareMove(s);}
  else if(s.phase==='shuffle'){
   s.handsFrom=handTargets(s);commit(s,activeMove(s));s.shuffleIndex++;
   if(s.pocketPicked)s.phase=s.pocketCaught?'surprise':'pocketReveal';else if(s.caught||s.shuffleIndex===s.shuffleMoves.length)s.phase='settle';else prepareMove(s);
  }else if(s.phase==='settle'){s.phase=s.caught?'reveal':'choose';if(s.caught)s.selectedSlot=s.cards.find(c=>c.role==='QUEEN').slot;}
  else if(s.phase==='reveal')settle(s);
 }
 function update(s,dt){
  if(!Number.isFinite(dt)||dt<=0)return;
  let left=dt;while(left>1e-9){const d=duration(s),step=Math.min(left,Math.max(0,d-s.phaseT));s.phaseT+=step;s.elapsed+=step;left-=step;if(s.phaseT>=d-1e-9){advance(s);s.phaseT=0;}else break;}
 }
 const api={rules,deck,tricks,isTrick,create,begin,update,choose,catchPocket,caughtDisplay,heldGrip,trajectory,handTargets,activeMove,duration,progress,visibleCards,tableCards,pocketCard,pocket,reserve};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.KRRoyalShuffleRules=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this);
