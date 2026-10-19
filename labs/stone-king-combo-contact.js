/* Stone King candidate: the visible blade owns contact in world space.
 * The mounted player's real body capsules share the rendered pose. */
(function(root){
  'use strict';
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z});
  const add=(a,b)=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z});
  const mul=(a,k)=>({x:a.x*k,y:a.y*k,z:a.z*k});
  const dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z;
  const cross=(a,b)=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
  const sq=v=>dot(v,v);
  const art=typeof module!=='undefined'&&module.exports?require('../assets/encounters/stone-king-pixel.js'):root.KRStoneKingPixel;
  function bladeHalfWidth(y){return art.bladeSection(y).halfWidth;}
  function worldContact(pose,actorX,actorZ,playerWorldX,unit,radius=10.5/23){
    const wrist=pose.wrist,axis=pose.axis,side=pose.side;
    const normal={x:side.y*axis.z-side.z*axis.y,y:side.z*axis.x-side.x*axis.z,z:side.x*axis.y-side.y*axis.x};
    const point=y=>({x:actorX+(wrist.x+axis.x*y)*unit,
      y:(23.2-pose.crouch-wrist.y-axis.y*y)*unit,z:actorZ-(wrist.z+axis.z*y)*unit});
    const start=art.bladeProfile[0][0],end=art.bladeProfile[art.bladeProfile.length-1][0];
    const a=point(start),b=point(end),dx=b.x-a.x,dz=b.z-a.z,lengthSq=dx*dx+dz*dz;
    const amount=clamp(((playerWorldX-a.x)*dx-a.z*dz)/Math.max(lengthSq,1e-12));
    const x=lerp(a.x,b.x,amount),z=lerp(a.z,b.z,amount),bladeY=lerp(start,end,amount);
    const separation=Math.hypot(x-playerWorldX,z),height=lerp(a.y,b.y,amount);
    const section=art.bladeSection(bladeY),rx=separation>1e-10?(playerWorldX-x)/separation:1,rz=separation>1e-10?-z/separation:0;
    let planarThickness=0,halfHeight=0;
    for(const [width,thickness]of section.crossSection){
      planarThickness=Math.max(planarThickness,Math.abs(width*(side.x*rx+side.z*rz)+thickness*(normal.x*rx+normal.z*rz))*unit);
      halfHeight=Math.max(halfHeight,Math.abs(width*side.y+thickness*normal.y)*unit);
    }
    return {overlap:separation<=radius+planarThickness,separation,reach:radius+planarThickness,
      x,z,height,lowerY:height-halfHeight,upperY:height+halfHeight,bladeY,amount};
  }
  function closestSegment(p,a,b){const d=sub(b,a),length=sq(d);return add(a,mul(d,length>1e-15?clamp(dot(sub(p,a),d)/length):0));}
  function closestTriangle(p,a,b,c){
    const ab=sub(b,a),ac=sub(c,a),ap=sub(p,a),d1=dot(ab,ap),d2=dot(ac,ap);
    if(sq(cross(ab,ac))<1e-18){
      const points=[closestSegment(p,a,b),closestSegment(p,b,c),closestSegment(p,c,a)];
      return points.reduce((best,at)=>sq(sub(p,at))<sq(sub(p,best))?at:best);
    }
    if(d1<=0&&d2<=0)return a;
    const bp=sub(p,b),d3=dot(ab,bp),d4=dot(ac,bp);
    if(d3>=0&&d4<=d3)return b;
    const vc=d1*d4-d3*d2;
    if(vc<=0&&d1>=0&&d3<=0)return add(a,mul(ab,d1/(d1-d3)));
    const cp=sub(p,c),d5=dot(ab,cp),d6=dot(ac,cp);
    if(d6>=0&&d5<=d6)return c;
    const vb=d5*d2-d1*d6;
    if(vb<=0&&d2>=0&&d6<=0)return add(a,mul(ac,d2/(d2-d6)));
    const va=d3*d6-d5*d4;
    if(va<=0&&(d4-d3)>=0&&(d5-d6)>=0)return add(b,mul(sub(c,b),(d4-d3)/((d4-d3)+(d5-d6))));
    const denom=va+vb+vc;
    if(Math.abs(denom)<1e-16)return a;
    return add(a,add(mul(ab,vb/denom),mul(ac,vc/denom)));
  }
  function segmentDistanceSq(p1,q1,p2,q2){
    const d1=sub(q1,p1),d2=sub(q2,p2),r=sub(p1,p2),a=sq(d1),e=sq(d2),f=dot(d2,r);
    let s=0,t=0;
    if(a<=1e-14&&e<=1e-14)return sq(r);
    if(a<=1e-14)t=clamp(f/e);
    else{
      const c=dot(d1,r);
      if(e<=1e-14)s=clamp(-c/a);
      else{
        const b=dot(d1,d2),denom=a*e-b*b;
        if(denom>1e-14)s=clamp((b*f-c*e)/denom);
        t=(b*s+f)/e;
        if(t<0){t=0;s=clamp(-c/a);}else if(t>1){t=1;s=clamp((b-c)/a);}
      }
    }
    return sq(sub(add(p1,mul(d1,s)),add(p2,mul(d2,t))));
  }
  function segmentTriangleDistanceSq(p,q,a,b,c){
    const n=cross(sub(b,a),sub(c,a)),d=sub(q,p),denom=dot(n,d);
    if(Math.abs(denom)>1e-13){
      const t=dot(n,sub(a,p))/denom;
      if(t>=0&&t<=1){const at=add(p,mul(d,t));if(sq(sub(at,closestTriangle(at,a,b,c)))<1e-15)return 0;}
    }
    return Math.min(sq(sub(p,closestTriangle(p,a,b,c))),sq(sub(q,closestTriangle(q,a,b,c))),
      segmentDistanceSq(p,q,a,b),segmentDistanceSq(p,q,b,c),segmentDistanceSq(p,q,c,a));
  }
  function bounds(vertices){
    const min={x:Infinity,y:Infinity,z:Infinity},max={x:-Infinity,y:-Infinity,z:-Infinity};
    for(const v of vertices)for(const axis of ['x','y','z']){min[axis]=Math.min(min[axis],v[axis]);max[axis]=Math.max(max[axis],v[axis]);}
    return {min,max};
  }
  function capsuleMeshContact(faces,capsules){
    if(!faces.length||!capsules.length)return null;
    const box=bounds(faces.flatMap(f=>f.vertices));
    for(const capsule of capsules){
      const {a,b,r}=capsule;
      if(['x','y','z'].some(k=>Math.max(a[k],b[k])+r<box.min[k]||Math.min(a[k],b[k])-r>box.max[k]))continue;
      for(const face of faces)for(let i=1;i<face.vertices.length-1;i++){
        const [p,q,s]=[face.vertices[0],face.vertices[i],face.vertices[i+1]];
        if(segmentTriangleDistanceSq(a,b,p,q,s)<=r*r+1e-10)return {capsule:capsule.id||'body',lowerY:box.min.y,upperY:box.max.y};
      }
    }
    return null;
  }
  function bladeWorldMesh(model,pose,actorX,actorZ,unit){
    const {wrist,axis,side}=pose,normal=cross(side,axis);
    const transform=v=>{
      const p=add(wrist,add(mul(side,v.x),add(mul(axis,v.y),mul(normal,v.z))));
      return {x:actorX+p.x*unit,y:(23.2-pose.crouch-p.y)*unit,z:actorZ-p.z*unit};
    };
    return model.bladeMesh.map(face=>({kind:face.kind,vertices:face.vertices.map(transform)}));
  }
  function flightWorldMesh(model,frame,unit){
    frame=frame?.weapon||frame;
    if(!frame?.wrist||!frame.axis||!frame.side)return [];
    const normal=frame.normal||cross(frame.side,frame.axis),scale=frame.unit??unit;
    const transform=v=>add(frame.wrist,mul(add(mul(frame.side,v.x),add(mul(frame.axis,v.y),mul(normal,v.z))),scale));
    return model.bladeMesh.map(face=>({kind:face.kind,vertices:face.vertices.map(transform)}));
  }
  function clipGround(vertices){
    const clipped=[];
    for(let i=0;i<vertices.length;i++){
      const a=vertices[i],b=vertices[(i+1)%vertices.length],insideA=a.y>=0,insideB=b.y>=0;
      if(insideA)clipped.push(a);
      if(insideA!==insideB){const k=a.y/(a.y-b.y);clipped.push({x:lerp(a.x,b.x,k),y:0,z:lerp(a.z,b.z,k)});}
    }
    return clipped;
  }
  function groundWorldMesh(model,stage,raw,lane){
    const sample=model.groundEruption(raw),height=sample.height,x=stage.laneX(lane);
    if(height<=1e-9)return [];
    return model.groundBladePose(height,x,0).faces.map(face=>({kind:face.kind,vertices:clipGround(face.vertices)})).filter(face=>face.vertices.length>=3);
  }
  function create({art,stage,engine=null,sampleCollider=null,sampleFlight=null}){
    const env=engine||{
      now:()=>perfNow,actor:()=>boss,player:()=>player,hazards:()=>hazards,
      duck:()=>isDucking(),duckAmount:()=>duckPostureAmountAt(player.duckT),
      jumpWorld:()=>jumpHeight()/stage.riderNativeHeight*stage.knightHeight,
      helmetHeight:duck=>(PLAYER_Y-serJonathanHelmetTopWorldY(PLAYER_Y,duck))/stage.playerPixelsPerUnit,
      parryWindow:h=>parryWindow(h),pending:h=>unresolvedTapParryIntentFor(h),
      finish:(h,parried,collides,raw)=>finishSweepContact(h,laneX(player.x,1),h.height,parried,collides,false,raw)
    };
    const history=[];let planted=null,lastPlantStrike=null;
    function playerSample(){const p=env.player();return {x:stage.laneX(p.x),lane:p.x,duck:env.duck(),fold:env.duckAmount(),jump:env.jumpWorld(),duckT:p.duckT??-1,jumpT:p.jumpT??-1};}
    function actorSample(actor){return {x:stage.actorX+(stage.bodyLaneX||stage.laneX)(actor.x),z:actor.z,lane:actor.x};}
    function colliderAt(sample,time){
      const take=sampleCollider||env.sampleCollider;
      return take?take({...sample,player:env.player(),time}):null;
    }
    function interpolateClock(a,b,k,span){
      if(a<0&&b>=0)return b-span*(1-k);
      if(a>=0&&b<0)return a+span*k;
      return lerp(a,b,k);
    }
    function finish(h,result){
      if(h.done)return;h.result=result;
      history.push({result,at:h.contactAt??env.now(),raw:h.contactProgress??1,world:h.contact||null,samples:h.samples,
        type:h.move.attackType||'stone_king_swipe',lanes:h.lanes.slice(),direction:h.direction});
      if(history.length>60)history.shift();
      if(result==='HIT'||result==='PARRY')env.finish(h,result==='PARRY',result==='HIT',h.contactProgress);
      else h.done=true;
    }
    const resolver={
      spawn(actor,move,def,src){
        const ground=move.attackType==='stone_king_ground',flight=move.attackType==='stone_king_flight',now=env.now(),h={kind:'pixel',actor,move,def,src,resolver,lanes:actor.hazardLanes.slice(),height:ground?'low':move.height||'high',ground,flight,
          direction:move.flightDirection??actor._stoneFlightDirection??1,
          born:now,impact:now+move.travel,duration:move.travel,done:false,lastTime:0,sampleAt:now,samples:0,
          from:2,to:0,parryInputAt:-Infinity,previousActor:actorSample(actor),previousPlayer:playerSample()};
        if(ground&&!h.lanes.length){h.done=true;h.result='SKIPPED';return h;}
        if(flight&&!sampleFlight&&!env.sampleFlight)throw Error('Stone King flight contact requires its rendered world frame');
        if(move.attackType==='stone_king_plant')lastPlantStrike=h;
        env.hazards().push(h);return h;
      },
      setPlanted({actor=env.actor(),lane=actor.hazardLanes[0],pose=null,frame=null,actorZ=art.plantSpec.actorZ,def={},src='boss'}={}){
        if(planted&&planted.actor===actor&&planted.lanes[0]===lane&&planted.active)return planted;
        resolver.clearPlanted();
        const now=env.now(),mesh=frame?flightWorldMesh(art,frame,stage.unit):
          bladeWorldMesh(art,pose||art.pose('strike_stone_king_plant',1,{lane,depth:actorZ}),stage.actorX+(stage.bodyLaneX||stage.laneX)(lane),actorZ,stage.unit),h={
            kind:'pixel',actor,move:{attackType:'stone_king_planted',height:'mid',travel:.5},def,src,resolver,
            lanes:[lane],height:'mid',persistent:true,active:true,mesh:mesh.map(face=>({...face,vertices:clipGround(face.vertices)})).filter(face=>face.vertices.length>=3),
            born:now,impact:now,duration:Infinity,done:false,lastTime:0,sampleAt:now,samples:0,from:2,to:0,parryInputAt:-Infinity,
            previousActor:actorSample(actor),previousPlayer:playerSample()};
        // The entry stab and the sword left in its wound are one hazard cycle.
        // A stab already awarded contact must not deal a second immediate hit.
        if(lastPlantStrike?.actor===actor&&lastPlantStrike.lanes.includes(lane)&&
          (lastPlantStrike.contact||['HIT','PARRY'].includes(lastPlantStrike.result))){h.done=true;h.result='COVERED';h.coveredBy=lastPlantStrike;}
        planted=h;env.hazards().push(h);return h;
      },
      clearPlanted(reason='WITHDRAWN'){
        if(!planted)return;
        planted.active=false;
        if(!planted.done&&!planted.contact)finish(planted,reason);
        planted=null;
      },
      update(h){
        if(h.done)return;
        if(h.actor!==env.actor()||h.actor.parryReaction||!env.player().alive){finish(h,'CANCELLED');return;}
        const now=env.now(),time=clamp(now-h.born,0,h.duration),currentActor=actorSample(h.actor),currentPlayer=playerSample();
        if(!h.contact){
          // Substeps cover the entire elapsed interval, including a low-FPS frame
          // that jumps across a lane. Actor and knight motion share that interval.
          const steps=Math.max(1,Math.ceil((time-h.lastTime)*480)),sampleAt=h.sampleAt??h.born+h.lastTime,
            span=Math.max(0,now-sampleAt);
          for(let i=0;i<=steps;i++){
            const at=lerp(h.lastTime,time,i/steps),raw=h.persistent?1:clamp(at/h.duration);
            // A final frame can extend past this short attack. Interpolate
            // posture clocks over real elapsed time before clipping the hazard;
            // otherwise a later jump is incorrectly moved before the impact.
            const k=span>1e-12?clamp((h.born+at-sampleAt)/span):1;
            const actorX=lerp(h.previousActor.x,currentActor.x,k),actorZ=lerp(h.previousActor.z,currentActor.z,k);
            const knightX=lerp(h.previousPlayer.x,currentPlayer.x,k),fold=lerp(h.previousPlayer.fold,currentPlayer.fold,k);
            const jump=lerp(h.previousPlayer.jump,currentPlayer.jump,k),duck=k<.5?h.previousPlayer.duck:currentPlayer.duck;
            const playerPose={x:knightX,lane:lerp(h.previousPlayer.lane,currentPlayer.lane,k),fold,jump,duck,
              duckT:interpolateClock(h.previousPlayer.duckT,currentPlayer.duckT,k,span),jumpT:interpolateClock(h.previousPlayer.jumpT,currentPlayer.jumpT,k,span)};
            const body=colliderAt(playerPose,h.born+at),capsules=body?.capsules||body;
            let contact;
            if(h.persistent){
              if(h.active&&capsules)contact=capsuleMeshContact(h.mesh,capsules);
              else if(h.active){
                const lane=h.lanes[0],z=art.plantSpec.actorZ;
                contact=worldContact(art.pose('strike_stone_king_plant',1,{lane,depth:z}),stage.actorX+(stage.bodyLaneX||stage.laneX)(lane),z,knightX,stage.unit);
                if(!contact.overlap)contact=null;
              }
            }else if(h.ground){
              const mesh=groundWorldMesh(art,stage,raw,h.lanes[0]);
              if(capsules)contact=capsuleMeshContact(mesh,capsules);
              else{
                const height=art.groundEruption(raw).height,reach=bladeHalfWidth(85-height/stage.unit)*stage.unit+10.5/23;
                if(height>0&&Math.abs(knightX-stage.laneX(h.lanes[0]))<=reach&&jump<=height)
                  contact={lowerY:0,upperY:height,playerX:knightX};
              }
            }else if(h.flight){
              const take=sampleFlight||env.sampleFlight,frame=take({actor:h.actor,move:h.move,raw,time:h.born+at,lanes:h.lanes,direction:h.direction});
              if(capsules)contact=capsuleMeshContact(flightWorldMesh(art,frame,stage.unit),capsules);
            }else if(capsules){
              const pose=art.pose(h.move.strike||'strike_stone_king_swipe',raw,
                {lane:lerp(h.previousActor.lane,currentActor.lane,k),depth:actorZ}),mesh=bladeWorldMesh(art,pose,actorX,actorZ,stage.unit);
              contact=capsuleMeshContact(mesh,capsules);
            }else{
              contact=worldContact(art.pose(h.move.strike||'strike_stone_king_swipe',raw,
                {lane:lerp(h.previousActor.lane,currentActor.lane,k),depth:actorZ}),actorX,actorZ,knightX,stage.unit);
              if(!contact.overlap)contact=null;
              if(contact){
                const helmet=env.helmetHeight(fold)+jump;
                if((duck&&helmet<contact.lowerY-.015)||jump>contact.upperY+.25)contact=null;
              }
            }
            h.samples++;
            if(!contact)continue;
            h.crossed=true;
            h.contact={...contact,playerX:knightX};h.contactAt=h.born+at;h.contactProgress=raw;h.impact=h.contactAt;break;
          }
          h.previousActor=currentActor;h.previousPlayer=currentPlayer;h.lastTime=time;h.sampleAt=now;
        }
        if(h.contact){
          const window=env.parryWindow(h),inputAt=h.parryInputAt;
          if(h.parryInputEligible===true||Math.abs(inputAt-h.contactAt)<=window){finish(h,'PARRY');return;}
          const pending=env.pending(h);
          if(pending&&Math.abs(pending.at-h.contactAt)<=window)return;
          if(env.now()>=h.contactAt+window){finish(h,'HIT');return;}
        }else if(!h.persistent&&time>=h.duration)finish(h,'SAFE');
      },history,worldContact,groundMesh:(raw,lane)=>groundWorldMesh(art,stage,raw,lane),
      get planted(){return planted;}
    };
    return resolver;
  }
  const api={version:6,create,worldContact,bladeHalfWidth,bladeWorldMesh,flightWorldMesh,groundWorldMesh,capsuleMeshContact,segmentTriangleDistanceSq};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.KRStoneKingComboContact=api;
})(globalThis);
