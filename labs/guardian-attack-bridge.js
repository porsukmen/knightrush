/* Opt-in authoring only. Native scene, renderer, projection and player poses.
 * No simulation update, damage resolution, save-game write or normal-game hook. */
(()=>{'use strict';
 if(BOOT_QUERY.get('attackeditor')!=='1')return;
 const E=KRAncientGuardianEncounter,M=KRAncientGuardianStance;
 let frame=null,config={},lastResult=null;
 const clampN=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
 function joints(p){return {body:p.body.p([0,-43,0]),head:p.head.p([0,-87,0]),hand:p.grip,elbow:p.elbow,weapon:p.weapon.p([0,-20,-13.5]),leftFoot:p.legs[0].ankle,rightFoot:p.legs[1].ankle,leftKnee:p.legs[0].knee,rightKnee:p.legs[1].knee};}
 function screen(q){return [(q[0]*viewScale+viewX)/cvs.width,(q[1]*viewScale+viewY)/cvs.height];}
 function viewProject(v){return config.cameraMode==='orbit'?KRGuardianAttackOrbit.project(v):E.project(frame,v);}
 function project(v){return screen(viewProject(v));}
 function playerPose(kind,phase){player.jumpT=kind==='jump'?clampN(phase,0,1)*jumpDur():-1;player.duckT=kind==='duck'?clampN(phase,0,1)*CFG.DUCK_TIME:-1;}
 function volumes(kind,phase){const j=player.jumpT,d=player.duckT;playerPose(kind,phase);const v=samplePlayerHurtVolumes(createPlayerHurtVolumes());player.jumpT=j;player.duckT=d;return v.capsules.slice(0,v.count).map(c=>({...c}));}
 function guides(){g.save();g.setTransform(viewScale,0,0,viewScale,viewX,viewY);g.lineWidth=1;g.font='10px system-ui';g.textAlign='center';
  if(config.cameraMode!=='orbit'&&config.lanes!==false){for(const lane of [0,1,2]){g.strokeStyle=lane===Math.round(player.x)?'#fff0cd':'rgba(241,218,174,.65)';g.beginPath();for(let i=0;i<=40;i++){const p=proj(14-i*14.8/40);const x=laneX(lane,p.t);i?g.lineTo(x,p.y):g.moveTo(x,p.y);}g.stroke();g.fillStyle='#30241e';g.fillRect(laneX(lane,1)-26,PLAYER_Y+16,52,17);g.fillStyle='#fff0cd';g.fillText(['SOL','ORTA','SAĞ'][lane],laneX(lane,1),PLAYER_Y+28);}
   for(const z of [0,2,4,6,8,10]){const p=proj(z);g.strokeStyle='rgba(240,216,170,.23)';g.beginPath();g.moveTo(laneX(-.45,p.t),p.y);g.lineTo(laneX(2.45,p.t),p.y);g.stroke();}}
  const colors={normal:'#f4d48a',duck:'#9cdbbd',jump:'#a7caf4'};
  if(config.volumes!==false){for(const kind of config.compare?['normal','duck','jump']:[config.action||'normal']){const caps=volumes(kind,kind===config.action?config.phase:.5);if(config.cameraMode==='orbit'){KRGuardianAttackOrbit.drawCapsules(caps,colors[kind],kind!==config.action);continue;}g.strokeStyle=colors[kind];g.lineWidth=1.3;g.setLineDash(kind===config.action?[]:[4,4]);for(const c of caps){g.beginPath();g.moveTo(c.x1-c.r,c.y1);g.lineTo(c.x2-c.r,c.y2);g.arc(c.x2,c.y2,c.r,Math.PI,0,true);g.lineTo(c.x1+c.r,c.y1);g.arc(c.x1,c.y1,c.r,0,Math.PI,true);g.stroke();}g.setLineDash([]);}}
  if(config.blade!==false){g.strokeStyle=lastResult?.touching?'#ed957f':'#dcd2a2';g.lineWidth=2;g.beginPath();for(let i=0;i<39;i++){const q=viewProject(frame.pose.weapon.p([0,-43+43*i/38,-13.5]));i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]);}g.stroke();}
  g.restore();
 }
 function set(c={}){config={...c};paused=true;pausePhotoMode=true;settingsOpen=false;floaters.length=0;flashA=0;shakeMag=0;player.invuln=0;squire.present=false;player.gallop=0;player.x=player.lane=clampN(c.lane??1,0,2);player.laneFrom=player.x;player.lastLaneChange=-100;playerPose(c.action||'normal',c.phase??.5);
  const source=c.base==='combo'?clampN(c.time,0,M.comboDuration):clampN(c.baseTime,0,M.comboDuration),base=M.sampleVersion(source,29),pose=M.applyEdits(base,c.edits||{});
  frame=E.setPreview({time:source,pose,rootX:clampN(c.rootX??1,0,2),rootZ:clampN(c.rootZ??6,2,14),heading:clampN(c.heading??10,-180,180)});
  if(config.cameraMode==='orbit')KRGuardianAttackOrbit.prepare(frame,config);
  const caps=samplePlayerHurtVolumes(createPlayerHurtVolumes()),blade=[];let touching=false;
  for(let i=0;i<39;i++){const y=-43+43*i/38,q=E.project(frame,pose.weapon.p([0,y,-13.5])),r=(y>-6?Math.max(.35,3.12*(-y)/6):3.12)*5*proj(q[2]).s,p={x:q[0],y:q[1],z:q[2],r,depthRadius:2.2};blade.push(p);for(let j=0;j<caps.count;j++)if(KRBossSequenceRuntime.movingCircleTouchesCapsule(p,p,caps.capsules[j],caps.capsules[j]))touching=true;}
  const positions=joints(pose);lastResult={positions,tip:pose.weapon.p([0,0,-13.5]),handles:Object.fromEntries(Object.entries(positions).map(([k,v])=>[k,project(v)])),touching,issues:pose.editorIssues||[],blade,view:{width:VW,height:VH},player:{x:laneX(player.x,1),y:PLAYER_Y,duck:duckPostureAmountAt(player.duckT),jump:jumpHeight()},durations:{jump:jumpDur(),duck:CFG.DUCK_TIME},root:{x:frame.actorRoot.x,z:frame.actorRoot.z,heading:frame.heading}};
  if(config.cameraMode==='orbit')KRGuardianAttackOrbit.draw(config);else render();guides();return lastResult;
 }
 function start(){paused=true;pausePhotoMode=true;set({base:'fixed',baseTime:0,lane:1});}
 // The normal RAF would repaint guides while paused; the Lab owns only its
 // explicit render requests. Cancel the native scheduled frame via startup.
 window.KRGuardianAttackBridge=Object.freeze({start,set,project,inspect:()=>lastResult,version:1});
 // Only the embedding local-file lab may open this authoring channel.
 if(location.protocol==='file:'&&parent!==window){let port=null;
  addEventListener('message',e=>{if(e.source!==parent||e.origin!=='null'||e.data?.type!=='kr-guardian-file-connect'||!e.ports[0])return;
   port?.close();port=e.ports[0];const connection=port;
   connection.onmessage=({data})=>{if(data?.type!=='render')return;try{
    const result=set(data.config),points=Object.values(result.positions);
    if(Array.isArray(data.config.projectionPoint))points.push(data.config.projectionPoint);
    const projectionSamples=points.map(point=>{const screen=project(point),axes=[0,1,2].map(i=>{const v=point.slice();v[i]+=.1;return project(v).map((n,j)=>(n-screen[j])/.1);});return{point,screen,axes};});
    connection.postMessage({type:'rendered',id:data.id,result:{...result,projectionSamples}});
   }catch(error){connection.postMessage({type:'error',id:data.id,message:error.message});}};
   connection.postMessage({type:'ready'});
  });
 }
})();
