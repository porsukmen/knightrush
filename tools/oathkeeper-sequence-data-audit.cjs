'use strict';
// Recipe/model QA with source-extracted native boss geometry; no browser or art
// baseline writes. A found route is evidence, a failed bounded search is NOT an
// impossibility proof. Run from any cwd: node tools/oathkeeper-sequence-data-audit.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),game=read('KnightRush.html'),
 source=read('labs/oathkeeper-sequences.js'),runtimeSource=read('labs/boss-sequence-runtime.js'),encounterSource=read('labs/oathkeeper-encounter.js'),
 Seq=require('../labs/oathkeeper-sequences.js'),Model=require('../labs/oathkeeper-model.js'),Runtime=require('../labs/boss-sequence-runtime.js');
const report={kind:'oathkeeper-sequence-data',native:{},sampling:[],joins:[],objectJoins:[],continuity:[],routes:[],failures:[],warnings:[],
 scope:'Numerical source/model checks. The legacy continuous-input route solver is disabled for discrete lane encounters; no current pattern-feasibility, visual approval or physical-device performance claim.',
 hashes:Object.fromEntries(['KnightRush.html','labs/oathkeeper-sequences.js','labs/boss-sequence-runtime.js','labs/oathkeeper-model.js','labs/oathkeeper-encounter.js','labs/mounted-knight-run-motion.js','assets/mounted-combat.js'].map(p=>[p,crypto.createHash('sha256').update(read(p)).digest('hex')]))};
function check(condition,label,detail){if(!condition)report.failures.push({label,...detail});}
function fn(name){
 const m=new RegExp('function '+name+'\\([^\\n]*\\)\\s*\\{').exec(game);assert(m,'Native function absent: '+name);
 let depth=1,i=m.index+m[0].length,quote=null,line=false,block=false;
 for(;i<game.length;i++){const c=game[i],n=game[i+1];if(line){if(c==='\n')line=false;continue;}if(block){if(c==='*'&&n==='/'){block=false;i++;}continue;}
  if(quote){if(c==='\\'){i++;continue;}if(c===quote)quote=null;continue;}
  if(c==='/'&&n==='/'){line=true;i++;continue;}if(c==='/'&&n==='*'){block=true;i++;continue;}if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
  if(c==='{')depth++;if(c==='}'&&!--depth)break;
 }assert(depth===0,'Unclosed native function: '+name);return game.slice(m.index,i+1);
}
const cfg={};for(const k of ['JUMP_TIME','JUMP_H','DUCK_TIME','FOCAL','Z_FAR','BOSS_Z']){const m=new RegExp('\\b'+k+'\\s*:\\s*([.\\d]+)').exec(game);assert(m,'Native CFG absent: '+k);cfg[k]=Number(m[1]);}
const native={CFG:cfg,player:{jumpT:-1},mode:'boss',boss:{definitionId:'oathkeeper'},hasRelic:()=>false,curvedWorldActive:()=>false,journeyWorldOffset:()=>0};vm.createContext(native);
native.window=native;vm.runInContext(read('labs/mounted-knight-run-motion.js'),native);
const jumpLift=Number(/sequenceJumpLift\s*:\s*([\d.]+)/.exec(encounterSource)?.[1]||0);
native.activeBossDefinition=()=>({sequenceJumpLift:jumpLift});
const constants=['const VW=','const HORIZON_Y=','const U=','const SER_JONATHAN_SPINE_LENGTH=','const clamp=','const lerp=','const easeInOut='];
for(const prefix of constants){const at=game.indexOf(prefix);assert(at>=0,prefix);vm.runInContext(game.slice(at,game.indexOf(';',at)+1),native);}
for(const name of ['proj','laneX','jumpDur','playerSequenceJumpLift','jumpHeight','duckPostureAmountAt','serJonathanProjectWorldPoint','serJonathanDuckPose','serJonathanHelmetProjection','serJonathanHelmetTopLocal','serJonathanHelmetTopWorldY','createPlayerHurtVolumes','samplePlayerHurtVolumesAt'])vm.runInContext(fn(name),native);
Object.assign(report.native,vm.runInContext('({VW,VH,HORIZON_Y,PLAYER_Y,GROUND_Y,U,CFG})',native));
const speed=Number(/const speed=options\.lateralSpeed\|\|([\d.]+)/.exec(runtimeSource)?.[1]);assert(speed>0,'Inspect current driver lateral speed');
assert(!/lateralSpeed\s*:/.test(encounterSource),'Encounter overrides speed; extend audit extraction');
const inputMode=/inputMode\s*:\s*['"]([^'"]+)['"]/.exec(encounterSource)?.[1]||'continuous';
Object.assign(report.native,{inputMode,lateralSpeed:inputMode==='continuous'?speed:null,sequenceJumpLift:jumpLift});
function context(startLane=1){return {actor:{z:cfg.BOSS_Z},startLane,playerLane:startLane,playerY:report.native.PLAYER_Y,groundY:report.native.GROUND_Y,width:report.native.VW,height:report.native.VH,resolved:{},project(lane,height,z){const q=native.proj(z);return {x:native.laneX(lane,q.t),y:q.y-height*q.s,s:q.s,depth:z};}};}
const frame=()=>({hazards:[],props:[],cues:[],motion:null}),dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
function numeric(v){if(typeof v==='number')return [v];if(Array.isArray(v))return v.flatMap(numeric);if(v&&typeof v==='object')return Object.values(v).flatMap(numeric);return [];}
const poseAt=(track,t)=>Model.pose(7,{id:'sequence',side:0,motionOverride:Seq.motionAt(track,t)});
const flatMotion=m=>Object.values(m).flat(),motionDistance=(a,b)=>Math.max(...a.map((v,i)=>Math.abs(v-b[i])));
// Bone/contact and sample-purity checks cover the full authored interval.
for(const recipe of Seq.recipes){const ctx=context(),out=frame(),metrics={id:recipe.id,samples:0,maxProps:0,maxHazards:0,maxPrimitives:0,maxCues:0,maxArmBoneError:0,maxLegBoneError:0,maxFootTargetDrift:0,maxHandTargetError:0,maxHandTargetAt:0};
 let previousProps=new Map();
 for(let i=0;i<=Math.ceil(recipe.duration*120);i++){
  const t=Math.min(recipe.duration,i/120);recipe.sample(t,out,ctx);metrics.samples++;
  check(numeric({motion:out.motion,props:out.props,hazards:out.hazards,cues:out.cues}).every(Number.isFinite),'nonfinite sample',{id:recipe.id,t});
  for(const [key,value]of [['Props',out.props.length],['Hazards',out.hazards.length],['Primitives',out.hazards.reduce((n,h)=>n+h.primitives.length,0)],['Cues',out.cues.length]])metrics['max'+key]=Math.max(metrics['max'+key],value);
  check(new Set(out.props.map(p=>p.id)).size===out.props.length,'duplicate prop IDs',{id:recipe.id,t});
  check(new Set(out.hazards.map(h=>h.id)).size===out.hazards.length,'duplicate hazard IDs',{id:recipe.id,t});
  check(out.hazards.every(h=>h.primitives.every(p=>p.r>=0&&p.r<1000)),'invalid primitive radius',{id:recipe.id,t});
  check(out.props.every(p=>p.s>0&&p.s<16&&p.alpha>=0&&p.alpha<=1&&p.w>0&&p.h>0&&p.d>0&&Math.abs(p.x)<10000&&Math.abs(p.y)<10000),'unbounded prop',{id:recipe.id,t});
  const p=Model.pose(7,{id:'sequence',side:0,motionOverride:out.motion});
  for(const a of p.arms){metrics.maxArmBoneError=Math.max(metrics.maxArmBoneError,Math.abs(dist(a.root,a.joint)-a.upper),Math.abs(dist(a.joint,a.end)-a.lower));const e=dist(a.end,out.motion[a.side<0?'left':'right']);if(e>metrics.maxHandTargetError){metrics.maxHandTargetError=e;metrics.maxHandTargetAt=t;}}
  for(const l of p.legs){metrics.maxLegBoneError=Math.max(metrics.maxLegBoneError,Math.abs(dist(l.root,l.joint)-l.upper),Math.abs(dist(l.joint,l.end)-l.lower));metrics.maxFootTargetDrift=Math.max(metrics.maxFootTargetDrift,dist(l.end,[l.side*.87,.33,-.02]));}
  // Only sustained IDs are compared. Spawn/despawn can be intentional; ID changes
  // cannot by themselves establish a correct handoff and remain a visual review.
  for(const p of out.props){const old=previousProps.get(p.id);if(old&&old.alpha>.05&&p.alpha>.05){const d=Math.hypot(p.x-old.x,p.y-old.y),roll=Math.abs(Math.atan2(Math.sin(p.roll-old.roll),Math.cos(p.roll-old.roll)));if(d>20||roll>.15||Math.abs(p.w-old.w)>1||Math.abs(p.h-old.h)>1||Math.abs(p.d-old.d)>1)report.continuity.push({id:recipe.id,prop:p.id,t,stepPixels:d,stepRoll:roll,sizeBefore:[old.w,old.h,old.d],sizeAfter:[p.w,p.h,p.d]});}}
  previousProps=new Map(out.props.map(p=>[p.id,{...p}]));
 }
 recipe.sample(recipe.duration,out,ctx);check(out.hazards.every(h=>!h.active),'active hazard at player-turn boundary',{id:recipe.id});
 const snap=JSON.stringify({motion:out.motion,props:out.props,hazards:out.hazards,cues:out.cues});recipe.sample(recipe.duration,out,ctx);check(snap===JSON.stringify({motion:out.motion,props:out.props,hazards:out.hazards,cues:out.cues}),'nondeterministic recipe',{id:recipe.id});
 check(metrics.maxArmBoneError<1e-8&&metrics.maxLegBoneError<1e-8,'fixed bone length',{id:recipe.id,...metrics});
 // The existing rig caps reach at length-.015; neutral ankles drift <.008 units.
 check(metrics.maxFootTargetDrift<.01,'planted ankle target drift',{id:recipe.id,error:metrics.maxFootTargetDrift});
 check(metrics.maxHandTargetError<.025,'unreachable authored hand target',{id:recipe.id,error:metrics.maxHandTargetError,t:metrics.maxHandTargetAt});
 check(metrics.maxProps<=64&&metrics.maxHazards<=16&&metrics.maxPrimitives<=256&&metrics.maxCues<=32,'recipe resource bound',{id:recipe.id});report.sampling.push(metrics);
}
// Tangents at authored Hermite joins: left/right finite-difference derivatives.
for(const [id,track]of Object.entries(Seq.tracks)){let position=0,velocity=0,worstTime=0;const e=1e-5;
 for(const {t}of track.slice(1,-1)){const a=flatMotion(Seq.motionAt(track,t-e)),b=flatMotion(Seq.motionAt(track,t)),c=flatMotion(Seq.motionAt(track,t+e)),delta=motionDistance(a.map((v,i)=>(b[i]-v)/e),c.map((v,i)=>(v-b[i])/e));position=Math.max(position,motionDistance(a,c));if(delta>velocity){velocity=delta;worstTime=t;}}
 report.joins.push({id,epsilon:e,maxPositionStep:position,maxVelocityJump:velocity,worstTime});check(position<.005&&velocity<.02,'Hermite join',{id,position,velocity,worstTime});
}
// Inspect stable prop identity immediately across physical handoffs/turnarounds.
// This is C0 coverage only: release/catch acting and momentum still need video.
const returnOffsets=/contact=launch\+([\d.]+),endOut=launch\+([\d.]+)/.exec(source);
if(returnOffsets)for(const call of source.matchAll(/returningSlab\(out,ctx,'([^']+)',t,\{([^}]+)\}\)/g)){
 const options=Object.fromEntries([...call[2].matchAll(/(launch|backAt|catchAt):([\d.]+)/g)].map(m=>[m[1],Number(m[2])])),track=/track:'([^']+)'/.exec(call[2])?.[1]||'return',
  recipe=Seq.recipes.find(r=>{const f=frame();r.sample(0,f,context());return f.track===track;});assert(recipe,'Unknown return recipe '+track);
 const times=[options.launch,options.launch+Number(returnOffsets[1]),options.launch+Number(returnOffsets[2]),options.backAt,options.backAt+(options.catchAt-options.backAt)*.60,options.catchAt],ctx=context();
 for(const t of times){const a=frame(),b=frame();recipe.sample(t-1e-6,a,ctx);recipe.sample(t+1e-6,b,ctx);const p=a.props.find(p=>p.id===call[1]),q=b.props.find(p=>p.id===call[1]);
  check(!!p&&!!q,'prop ID lost at physical handoff',{id:recipe.id,prop:call[1],t});if(!p||!q)continue;
  const position=Math.hypot(p.x-q.x,p.y-q.y),roll=Math.abs(Math.atan2(Math.sin(p.roll-q.roll),Math.cos(p.roll-q.roll))),size=Math.max(...['w','h','d','s'].map(k=>Math.abs(p[k]-q[k])));
  report.objectJoins.push({id:recipe.id,prop:call[1],t,epsilon:1e-6,positionStep:position,rollStep:roll,sizeStep:size});check(position<.05&&roll<.001&&size<.001,'prop handoff discontinuity',{id:recipe.id,prop:call[1],t,position,roll,size});
 }
}
// Native action curves, sampled at route update rate, keep the exact gameplay
// capsule construction. No old rider approximation and no knight-only capsule.
function replayRoute(recipe,route,hz){
 const dt=1/hz,ctx=context(route.startLane),out=frame();let x=route.startLane,jump=-1,duck=-1,queued=false,dir=0,input=0,oldHazards=new Map();
 function volumes(){native.player.jumpT=jump;return native.samplePlayerHurtVolumesAt(native.createPlayerHurtVolumes(),native.laneX(x,1),ctx.playerY-native.jumpHeight(),native.duckPostureAmountAt(duck));}
 let before=volumes();
 for(let tick=1;tick<=Math.ceil(recipe.duration*hz);tick++){
  const t0=(tick-1)*dt,t=Math.min(recipe.duration,tick*dt);
  while(input<route.inputs.length&&route.inputs[input].t<=t0+0.00006){const q=route.inputs[input++];dir=q.dir;
   if(q.action==='jump'&&jump<0){jump=0;duck=-1;}
   if(q.action==='duck'||q.action==='queue-duck'){if(jump>=0)queued=cfg.JUMP_TIME-jump<=.22;else duck=0;}
  }
  x=Math.max(0,Math.min(2,x+dir*speed*dt));
  if(queued&&(jump<0||jump+dt>=cfg.JUMP_TIME)){queued=false;jump=-1;duck=0;}
  if(jump>=0){jump+=dt;if(jump>cfg.JUMP_TIME)jump=-1;}
  if(duck>=0){duck+=dt;if(duck>cfg.DUCK_TIME)duck=-1;}
  const after=volumes();recipe.sample(t,out,ctx);const current=new Map();
  for(const h of out.hazards){if(!h.active)continue;const old=oldHazards.get(h.id);for(let i=0;i<h.primitives.length;i++){const p=h.primitives[i];if(Runtime.touchesVolumes(old?.[i]||p,p,old?before:after,after))return {hz,passed:false,t,hazard:h.id,lane:x,jump,duck};}current.set(h.id,h.primitives.map(p=>({...p})));}
  oldHazards=current;before=after;
 }
 return {hz,passed:true,finalLane:x};
}
function routeSearch(recipe,startLane,hz=30){
 const dt=1/hz,ctx=context(startLane),out=frame(),jumpN=Math.floor(cfg.JUMP_TIME/dt+1e-9),duckN=Math.floor(cfg.DUCK_TIME/dt+1e-9),postures=1+jumpN+duckN,
  nx=81,dx=2/(nx-1),steps=Math.round(speed*dt/dx);assert(Math.abs(steps*dx-speed*dt)<1e-9,'Route grid must preserve native continuous speed');
 const volumes=Array.from({length:postures},(_,p)=>Array.from({length:nx},(_,x)=>{const j=p>0&&p<=jumpN?p*dt:-1,d=p>jumpN?(p-jumpN)*dt:-1;native.player.jumpT=j;const baseY=ctx.playerY-native.jumpHeight();return native.samplePlayerHurtVolumesAt(native.createPlayerHurtVolumes(),native.laneX(x*dx,1),baseY,native.duckPostureAmountAt(d));}));
 const transitions=Array.from({length:postures},(_,p)=>p===0?[{p:0,a:''},{p:1,a:'jump'},{p:jumpN+1,a:'duck'}]:p<=jumpN?p===jumpN?[{p:0,a:''},{p:jumpN+1,a:'queue-duck'}]:[{p:p+1,a:''}]:[{p:p===postures-1?0:p+1,a:''},{p:1,a:'jump'}]);
 const states=nx*postures,total=Math.ceil(recipe.duration*hz),back=[],actions=[],startX=Math.round(startLane/dx);let costs=new Float64Array(states).fill(Infinity),previousHazards=new Map(),visited=0,minSurvivors=Infinity;costs[startX]=0;
 for(let tick=1;tick<=total;tick++){
  const t=Math.min(recipe.duration,tick*dt);recipe.sample(t,out,ctx);const hazards=out.hazards.filter(h=>h.active).map(h=>({id:h.id,primitives:h.primitives.map(p=>({...p}))})),next=new Float64Array(states).fill(Infinity),parents=new Int32Array(states).fill(-1),acts=new Uint8Array(states);
  // Four screen pixels of conservative clearance avoid selecting numerically
  // grazing routes. Independent 30/60/120 Hz replay below remains mandatory.
  function safe(x0,p0,x1,p1){const before=volumes[p0][x0],after=volumes[p1][x1];for(const h of hazards){const old=previousHazards.get(h.id);for(let i=0;i<h.primitives.length;i++){const q=h.primitives[i];if(Runtime.touchesVolumes(old?.primitives[i]||q,q,old?before:after,after,4))return false;}}return true;}
  for(let state=0;state<states;state++){const cost=costs[state];if(!Number.isFinite(cost))continue;const p0=Math.floor(state/nx),x0=state%nx;
   for(const d of [0,-1,1]){const x1=Math.max(0,Math.min(nx-1,x0+d*steps));for(const tr of transitions[p0]){const nextState=tr.p*nx+x1,newCost=cost+(d?dt*.1:0)+(tr.a?1:0);if(newCost>=next[nextState])continue;visited++;if(!safe(x0,p0,x1,tr.p))continue;next[nextState]=newCost;parents[nextState]=state;acts[nextState]=tr.a==='jump'?1:tr.a==='duck'?2:tr.a==='queue-duck'?3:0;}}
  }
  back.push(parents);actions.push(acts);costs=next;previousHazards=new Map(hazards.map(h=>[h.id,h]));const survivors=costs.reduce((n,v)=>n+Number.isFinite(v),0);minSurvivors=Math.min(minSurvivors,survivors);
  if(!survivors)return {id:recipe.id,startLane,hz,found:false,failedAt:t,activeHazards:hazards.map(h=>h.id),visited,minSurvivors};
 }
 let best=0;for(let s=1;s<states;s++)if(costs[s]<costs[best])best=s;const route=[];for(let tick=total-1;tick>=0;tick--){const prev=back[tick][best];route.push({t:tick*dt,lane:(best%nx)*dx,fromLane:(prev%nx)*dx,action:['','jump','duck','queue-duck'][actions[tick][best]]});best=prev;}route.reverse();
 const inputs=[];let lastDir=0;for(const q of route){const dir=Math.sign(q.lane-q.fromLane);if(q.action||dir!==lastDir){inputs.push({t:Number(q.t.toFixed(4)),lane:Number(q.fromLane.toFixed(4)),dir,...(q.action?{action:q.action}:{})});}lastDir=dir;}
 return {id:recipe.id,startLane,hz,found:true,minSurvivors,visited,cost:Math.min(...costs),inputs,finalLane:route.at(-1).lane,
  note:'Conservative discrete no-parry route, 4px search clearance, native speed, full jump/duck, optional existing late duck queue, exact swept-circle solver. Does not use damage grace.'};
}
if(inputMode==='continuous'){
 report.routeSearch={status:'completed',inputMode,solver:'legacy-continuous-grid'};
 for(const recipe of Seq.recipes)for(const start of [0,1,2]){const r=routeSearch(recipe,start);if(r.found){r.replays=[30,60,120].map(hz=>replayRoute(recipe,r,hz));for(const replay of r.replays)check(replay.passed,'route replay contact',{id:r.id,startLane:start,...replay});}report.routes.push(r);check(r.found,'no route found in bounded native search',{id:r.id,startLane:start,failedAt:r.failedAt,activeHazards:r.activeHazards});console.log('route',recipe.id,start,r.found?'FOUND':'NOT FOUND',r.failedAt??'',r.visited,r.replays?.map(r=>r.hz+':'+r.passed).join(' '));}
}else{
 report.routeSearch={status:'skipped-obsolete-input-model',inputMode,solver:'legacy-continuous-grid',
  reason:'Three-lane edge-triggered controls use native eased lane destinations. Continuous-grid routes do not validate these controls. Current rejected patterns have not been revalidated or approved.'};
 report.warnings.push({label:'No current encounter-feasibility claim',...report.routeSearch});
}
if(report.continuity.length)report.warnings.push({label:'large sustained-prop step; inspect transition evidence',count:report.continuity.length});
// Report files are test evidence only, never reference baselines.
const output=path.join(root,'output/oathkeeper-sequence');fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'data-audit.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({sampling:report.sampling,joins:report.joins,objectJoinCount:report.objectJoins.length,continuity:report.continuity,routeSearch:report.routeSearch,routeCount:report.routes.length,routePasses:report.routes.filter(r=>r.found).length,failures:report.failures,warnings:report.warnings},null,2));
if(report.failures.length)process.exitCode=1;
