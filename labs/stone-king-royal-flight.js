/* The original weapon arm commands a gently steering stone blade.
 * Positions are world units: Y is up, positive Z is away from the camera.
 * The detached blade keeps the statue weapon's unscaled mesh and materials. */
(function(root){
  'use strict';
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
  const mix=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
  const V=(x=0,y=0,z=0)=>({x,y,z});
  const add=(a,b)=>V(a.x+b.x,a.y+b.y,a.z+b.z);
  const sub=(a,b)=>V(a.x-b.x,a.y-b.y,a.z-b.z);
  const mul=(a,s)=>V(a.x*s,a.y*s,a.z*s);
  const dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z;
  const cross=(a,b)=>V(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x);
  const length=a=>Math.hypot(a.x,a.y,a.z);
  const unit=(a,fallback=V(1,0,0))=>length(a)>1e-10?mul(a,1/length(a)):fallback;
  const blend=(a,b,t)=>add(mul(a,1-t),mul(b,t));
  const config=Object.freeze({launch:1.7,teleOverhead:.08,returnLead:0,
    catch:1.6,catchAt:.35,armLead:.30,
    bladeSpeed:60,heldBladeSpeed:96,speedRamp:.12,speedEase:.68,swipeSpeedEase:1,speedSamples:1024,
    releaseAt:.20,handClearAt:.34,handWithdrawFraction:.40,handRaisedAt:.70,
    liftAt:.40,withdrawAt:.63,retreatZ:22,hoverY:22,hoverZ:6.5,
    overheadEndY:3.5,overheadTurnEase:1.35,overheadSideYaw:22*Math.PI/180,overheadSideOffset:2.25,
    swipeY:7.6,swipeLowY:1.35,swipeZ:6.5,swipeSteer:10*Math.PI/180,
    commandReach:67,screenMargin:14});
  const plan=Object.freeze(['overhead','overhead','overhead','overhead','swipe','overhead','overhead','swipe']);
  function quaternion(frame){
    const x=frame.side,y=frame.axis,z=cross(x,y);
    const m00=x.x,m01=y.x,m02=z.x,m10=x.y,m11=y.y,m12=z.y,m20=x.z,m21=y.z,m22=z.z;
    const trace=m00+m11+m22;let a,b,c,d,s;
    if(trace>0){s=Math.sqrt(trace+1)*2;d=s/4;a=(m21-m12)/s;b=(m02-m20)/s;c=(m10-m01)/s;}
    else if(m00>m11&&m00>m22){s=Math.sqrt(1+m00-m11-m22)*2;d=(m21-m12)/s;a=s/4;b=(m01+m10)/s;c=(m02+m20)/s;}
    else if(m11>m22){s=Math.sqrt(1+m11-m00-m22)*2;d=(m02-m20)/s;a=(m01+m10)/s;b=s/4;c=(m12+m21)/s;}
    else{s=Math.sqrt(1+m22-m00-m11)*2;d=(m10-m01)/s;a=(m02+m20)/s;b=(m12+m21)/s;c=s/4;}
    return [a,b,c,d];
  }
  function blendBasis(a,b,t){
    const qa=quaternion(a);let qb=quaternion(b),cos=qa.reduce((sum,n,i)=>sum+n*qb[i],0);
    if(cos<0){qb=qb.map(n=>-n);cos=-cos;}
    let wa=1-t,wb=t;
    if(cos<.9995){const angle=Math.acos(clamp(cos,-1,1)),den=Math.sin(angle);wa=Math.sin((1-t)*angle)/den;wb=Math.sin(t*angle)/den;}
    const r=qa.map((n,i)=>n*wa+qb[i]*wb),l=Math.hypot(...r),[x,y,z,w]=r.map(n=>n/l);
    return {side:V(1-2*(y*y+z*z),2*(x*y+z*w),2*(x*z-y*w)),
      axis:V(2*(x*y-z*w),1-2*(x*x+z*z),2*(y*z+x*w))};
  }
  function create({art,stage,laneAim=null}){
    if(!art||!stage)throw new TypeError('Stone King flight needs the shared statue and stage');
    const aiming=laneAim||(root.KRStoneKingLaneAim||(typeof require==='function'?require('./stone-king-lane-aim.js'):null))?.create({art,stage});
    const bodyLaneX=stage.bodyLaneX||stage.laneX;
    const plantedPose=lane=>aiming?aiming.pose('strike_stone_king_plant',1,{lane,depth:art.plantSpec.actorZ}):art.plantFrame(1);
    const bladeUnit=stage.unit,bladeLength=85*bladeUnit;
    const frame=(wrist,axis,side)=>({wrist,axis,side,unit:bladeUnit,normal:cross(side,axis)});
    // Every material vertex has the same weight, including the base, tip and
    // both cutting edges. Rotation contributes to speed just like translation.
    const speedPoints=Object.freeze([...new Map(art.bladeMesh.flatMap(face=>face.vertices)
      .map(v=>[[v.x,v.y,v.z].join(','),Object.freeze(V(v.x,v.y,v.z))])).values()]);
    function speedPositions(weapon){
      const normal=cross(weapon.side,weapon.axis),u=weapon.unit??bladeUnit,out=new Float64Array(speedPoints.length*3);
      speedPoints.forEach((v,i)=>{
        out[i*3]=weapon.wrist.x+(weapon.side.x*v.x+weapon.axis.x*v.y+normal.x*v.z)*u;
        out[i*3+1]=weapon.wrist.y+(weapon.side.y*v.x+weapon.axis.y*v.y+normal.y*v.z)*u;
        out[i*3+2]=weapon.wrist.z+(weapon.side.z*v.x+weapon.axis.z*v.y+normal.z*v.z)*u;
      });
      return out;
    }
    function createSpeedClock(path,options={}){
      if(typeof path!=='function')throw new TypeError('A blade speed clock needs a world-frame path');
      const speed=options.speed??config.bladeSpeed,lead=Math.max(0,options.lead??config.armLead);
      if(!(Number.isFinite(speed)&&speed>0))throw new RangeError('Blade speed must be positive');
      const ramp=clamp(options.ramp??config.speedRamp,.001,.45),ease=clamp(options.ease??config.speedEase),
        easeCurve=options.easeCurve==='quintic'?'quintic':'cubic',
        steps=Math.max(64,Math.round(options.samples??config.speedSamples));
      const knots=[0],arc=[0],rms=(a,b)=>{
        let squared=0;for(let j=0;j<a.length;j++)squared+=(a[j]-b[j])**2;
        return Math.sqrt(squared/speedPoints.length);
      };
      const append=(a,pa,b,pb,depth=0)=>{
        const mid=(a+b)*.5,pm=speedPositions(path(mid)),left=rms(pa,pm),right=rms(pm,pb),distance=left+right;
        // Frustum bounds can switch their controlling mesh vertex. Refine
        // these corners rather than smearing their speed across a fixed bin.
        if(depth<18&&b-a>1e-8&&distance>1e-9&&Math.abs(left-right)>distance*.0005){
          append(a,pa,mid,pm,depth+1);append(mid,pm,b,pb,depth+1);return;
        }
        knots.push(b);arc.push(arc[arc.length-1]+distance);
      };
      const positions=Array.from({length:steps+1},(_,i)=>speedPositions(path(i/steps))),segments=positions.slice(1).map((p,i)=>rms(positions[i],p));
      const corners=new Set();
      for(let i=Math.ceil(steps*.04);i<Math.floor(steps*.96);i++){
        if(Math.abs(segments[i-1]-2*segments[i]+segments[i+1])>segments[i]*.0001)
          for(const j of[i-1,i,i+1])corners.add(j);
      }
      for(let i=0;i<steps;i++){
        if(corners.has(i))append(i/steps,positions[i],(i+1)/steps,positions[i+1]);
        else{knots.push((i+1)/steps);arc.push(arc[arc.length-1]+segments[i]);}
      }
      const pathLength=arc[arc.length-1],travelDuration=pathLength/(speed*(1-ramp)),duration=lead+travelDuration;
      // Retain the established travel duration, then ease distance
      // through the whole move. Arc inversion preserves the exact blade path.
      // Speed is the duration reference; the eased midpoint moves faster.
      const rampIntegral=x=>x*x*x-.5*x*x*x*x;
      const distanceFraction=raw=>{
        const q=clamp(raw);
        if(q<=0)return 0;if(q>=1)return 1;
        const reference=q<ramp?ramp*rampIntegral(q/ramp)/(1-ramp):
          q>1-ramp?1-ramp*rampIntegral((1-q)/ramp)/(1-ramp):(q-ramp*.5)/(1-ramp);
        const eased=easeCurve==='quintic'?q*q*q*(10+q*(-15+6*q)):q*q*(3-2*q);
        return mix(reference,eased,ease);
      };
      const rawAtDistance=fraction=>{
        const q=clamp(fraction);if(q<=0||pathLength<1e-10)return 0;if(q>=1)return 1;
        const distance=q*pathLength;let lo=0,hi=arc.length-1;
        while(hi-lo>1){const mid=(lo+hi)>>1;if(arc[mid]<distance)lo=mid;else hi=mid;}
        const span=arc[hi]-arc[lo];return mix(knots[lo],knots[hi],span>1e-12?(distance-arc[lo])/span:0);
      };
      const rawAtSeconds=seconds=>rawAtDistance(distanceFraction(travelDuration>1e-10?(seconds-lead)/travelDuration:seconds>=lead?1:0));
      return Object.freeze({metric:'rms-unique-blade-vertices',pointCount:speedPoints.length,length:pathLength,
        speed,lead,ramp,ease,easeCurve,sampleCount:arc.length,travelDuration,duration,distanceFraction,rawAtDistance,rawAtSeconds,
        rawAtFraction:t=>rawAtSeconds(clamp(t)*duration),sampleAtSeconds:seconds=>path(rawAtSeconds(seconds))});
    }
    // The descending cut gradually takes the reference's camera-facing angle.
    // Start straight, then pitch and yaw the complete original stone mesh.
    const reference=art.pose('strike_stone_king',.7),yaw=8*Math.PI/180;
    const yawVector=(v,angle)=>V(v.x*Math.cos(angle)+v.z*Math.sin(angle),v.y,
      -v.x*Math.sin(angle)+v.z*Math.cos(angle));
    const fromArt=v=>yawVector(V(v.x,-v.y,-v.z),yaw);
    const overheadAxis=fromArt(reference.axis),overheadSide=fromArt(reference.side);
    const overheadPitch=Math.asin(-overheadAxis.y),overheadStartPitch=-Math.asin(.25);
    function overheadBasis(q,options={}){
      const lane=clamp(options.targetLane??1,0,2),turn=-config.overheadSideYaw*(lane-1)*q;
      if(q>=1)return {axis:yawVector(V(0,-Math.sin(overheadPitch),-Math.cos(overheadPitch)),turn),
        side:yawVector(V(0,-Math.cos(overheadPitch),Math.sin(overheadPitch)),turn)};
      // Pitch and cross-section roll accompany the continuous descent.
      // Rolling around this axis keeps the centre attack exactly in the Y/Z
      // plane instead of introducing a lateral bow from a compound SLERP.
      const pitch=mix(overheadStartPitch,overheadPitch,q),roll=Math.PI/2*q;
      return {axis:yawVector(V(0,-Math.sin(pitch),-Math.cos(pitch)),turn),
        side:yawVector(V(Math.cos(roll),-Math.cos(pitch)*Math.sin(roll),Math.sin(pitch)*Math.sin(roll)),turn)};
    }
    const storageAxis=V(0,.25,-Math.sqrt(1-.25*.25)),storageSide=V(1,0,0),centreOffset=34*bladeUnit,riseBank=15*Math.PI/180;
    const hover=()=>frame(V(0,config.hoverY,config.hoverZ),storageAxis,storageSide);
    function blendFrame(a,b,t){const basis=blendBasis(a,b,t);return frame(blend(a.wrist,b.wrist,t),basis.axis,basis.side);}
    const weaponCentre=weapon=>add(weapon.wrist,mul(weapon.axis,centreOffset));
    function centredFrame(a,b,t,basis){
      const centre=blend(weaponCentre(a),weaponCentre(b),t);
      return frame(sub(centre,mul(basis.axis,centreOffset)),basis.axis,basis.side);
    }
    function bankedRise(a,b,t,turn){
      if(t<=0)return a;if(t>=1)return b;
      const basis=blendBasis(a,b,t),bank=turn*Math.sin(Math.PI*t);
      return centredFrame(a,b,t,{axis:yawVector(basis.axis,bank),side:yawVector(basis.side,bank)});
    }
    function actorFor(phase,t,options){
      const plantLane=clamp(options.plantLane??1,0,2),launchMove=smooth((t-config.releaseAt)/(1-config.releaseAt));
      if(phase==='launch')return {actorLane:mix(plantLane,1,launchMove),actorZ:mix(art.plantSpec.actorZ,config.retreatZ,launchMove),
        actorWorldX:mix(stage.actorX+bodyLaneX(plantLane),0,launchMove)};
      if(phase==='catch'){
        const settle=smooth((t-config.catchAt)/(1-config.catchAt));
        return {actorLane:1,actorZ:mix(config.retreatZ,stage.nearZ,settle),actorWorldX:mix(0,stage.actorX,settle)};
      }
      if(phase==='idle_right')return {actorLane:1,actorZ:stage.nearZ,actorWorldX:stage.actorX};
      return {actorLane:1,actorZ:config.retreatZ,actorWorldX:0};
    }
    const actorWorldX=actor=>Number.isFinite(actor.actorWorldX)?actor.actorWorldX:stage.actorX+bodyLaneX(actor.actorLane);
    function actorPoint(local,actor,crouch=0){
      return V(actorWorldX(actor)+local.x*bladeUnit,
        (23.2-crouch-local.y)*bladeUnit,actor.actorZ-local.z*bladeUnit);
    }
    function localPoint(world,actor,crouch=0){
      return V((world.x-actorWorldX(actor))/bladeUnit,
        23.2-crouch-world.y/bladeUnit,(actor.actorZ-world.z)/bladeUnit);
    }
    function planted(plantLane=1){
      const p=plantedPose(plantLane),actor={actorLane:plantLane,actorZ:art.plantSpec.actorZ};
      return frame(actorPoint(p.wrist,actor,p.crouch),V(0,-1,0),V(1,0,0));
    }
    function launch(t,options={}){
      t=clamp(t);const start=planted(options.plantLane??1);
      if(t<=config.liftAt)return start;
      if(t<config.withdrawAt){
        const k=smooth((t-config.liftAt)/(config.withdrawAt-config.liftAt));
        return frame(add(start.wrist,V(0,2.2*k,0)),start.axis,start.side);
      }
      const clear=frame(add(start.wrist,V(0,2.2,0)),start.axis,start.side);
      const q=smooth((t-config.withdrawAt)/(1-config.withdrawAt));
      if(q<=0)return clear;if(q>=1)return hover();
      // Lift around the weapon's centre with one hinge, keeping the front face
      // readable. A small bank avoids pointing directly down the viewing ray.
      const angle=Math.acos(-storageAxis.y)*q,bank=riseBank*Math.sin(Math.PI*q);
      return centredFrame(clear,hover(),q,{axis:yawVector(V(0,-Math.cos(angle),-Math.sin(angle)),bank),
        side:yawVector(V(1,0,0),bank)});
    }
    const overheadTargets=new WeakMap(),overheadDefaultCamera=stage.makeCamera();
    function overheadTarget(lane,options){
      if(lane===1)return 0;
      const camera=options.camera||overheadDefaultCamera;
      let lanes=overheadTargets.get(camera);
      if(!lanes){lanes=new Map();overheadTargets.set(camera,lanes);}
      if(lanes.has(lane))return lanes.get(lane);
      // Match the horizontal sweep's visible screen edges with the complete
      // descending sword. Using the grip as the edge would crop its long tip.
      const basis=overheadBasis(1,{...options,targetLane:lane}),bounds=screenBounds(basis.axis,basis.side,config.hoverZ,{...options,camera});
      const compensation=config.hoverZ*basis.axis.x/basis.axis.z;
      const target=clamp(stage.laneX(lane)+(lane-1)*config.overheadSideOffset,
        bounds.left-compensation,bounds.right-compensation);
      lanes.set(lane,target);return target;
    }
    function overhead(raw,options={}){
      const lane=clamp(options.targetLane??1,0,2),q=smooth(raw);
      if(q<=0)return hover();
      const target=overheadTarget(lane,options);
      const orientation=1-Math.pow(1-q,config.overheadTurnEase),basis=overheadBasis(orientation,options);
      // Compensate the grip as it turns so the actual blade at player depth
      // stays on the selected lane throughout the descending cut.
      const gripX=target*q+config.hoverZ*basis.axis.x/basis.axis.z;
      return frame(V(gripX,mix(config.hoverY,config.overheadEndY,q),config.hoverZ),basis.axis,basis.side);
    }
    // Roll the cut sideways, then neutralize its yaw at the screen centre.
    // The grip leads slightly at entry and follows at exit. Yaw preserves every
    // vertex's height, including the duck-safe blade and crossguard clearance.
    const rollSideways=v=>V(-v.y,v.x,v.z);
    const swipeAxis=rollSideways(overheadAxis),swipeSide=rollSideways(overheadSide);
    const centreYaw=Math.atan2(swipeAxis.x,-swipeAxis.z);
    const swipeNeutralAxis=yawVector(swipeAxis,centreYaw),swipeNeutralSide=yawVector(swipeSide,centreYaw);
    // Include hilt, crossguard, pommel and gems when placing the entire sword
    // inside the viewport. The real camera is also passed to contact sampling.
    const renderHull=art.weaponHull||(()=>{
      const points=art.bladeMesh.flatMap(face=>face.vertices);
      const solid=(outline,z0,z1)=>{for(const [x,y]of outline)for(const z of [z0,z1])points.push(V(x,y,z));};
      solid([[-3,-10],[3,-10],[3,4],[-3,4]],-3,3);
      solid([[-3.5,-17],[3.5,-17],[3.5,-16],[4.5,-16],[4.5,-10],[-4.5,-10],[-4.5,-16],[-3.5,-16]],-3.5,3.5);
      solid([[-20,2],[-10,2],[-10,5],[10,5],[10,2],[20,2],[20,6],[16,6],[16,9],[7,9],[7,11],[-7,11],[-7,9],[-16,9],[-16,6],[-20,6]],-3,3);
      const jewel=(w,h)=>[[-w*.25,7-h],[w*.25,7-h],[w,7-h*.25],[w,7+h*.25],[w*.25,7+h],[-w*.25,7+h],[-w,7+h*.25],[-w,7-h*.25]];
      for(const sign of [-1,1]){solid(jewel(3.9,5.1),sign*3,sign*4.1);solid(jewel(3.1,4.2),sign*4.1,sign*5.2);}
      return points;
    })();
    function screenBounds(axis,side,z,options={},floorWristY=null){
      const camera=options.camera||stage.makeCamera(),normal=cross(side,axis);
      let left=-Infinity,right=Infinity,bottom=-Infinity,top=Infinity;
      const offsetOf=v=>mul(add(mul(side,v.x),add(mul(axis,v.y),mul(normal,v.z))),bladeUnit);
      let offsets;
      if(Number.isFinite(floorWristY)){
        // Buried stone has no visible screen bounds. Clip the actual solid
        // faces, including edge intersections, just as the renderer does.
        offsets=[];
        for(const face of art.weaponMesh||art.bladeMesh){
          const points=face.vertices.map(offsetOf);
          for(let i=0;i<points.length;i++){
            const a=points[i],b=points[(i+1)%points.length],ay=floorWristY+a.y,by=floorWristY+b.y;
            if(ay>=0)offsets.push(a);
            if((ay<0)!==(by<0))offsets.push(blend(a,b,ay/(ay-by)));
          }
        }
      }else offsets=renderHull.map(offsetOf);
      for(const offset of offsets){
        const depth=camera.follow+z+offset.z;
        left=Math.max(left,(config.screenMargin-camera.centerX)*depth/camera.focal-offset.x);
        right=Math.min(right,(camera.width-config.screenMargin-camera.centerX)*depth/camera.focal-offset.x);
        bottom=Math.max(bottom,camera.height+(camera.horizon-camera.viewportHeight+config.screenMargin)*depth/camera.focal-offset.y);
        top=Math.min(top,camera.height+(camera.horizon-config.screenMargin)*depth/camera.focal-offset.y);
      }
      return {left,right,bottom,top};
    }
    function fitFrame(weapon,options={},clipFloor=false){
      const bounds=screenBounds(weapon.axis,weapon.side,weapon.wrist.z,options,clipFloor?weapon.wrist.y:null);
      return frame(V(clamp(weapon.wrist.x,bounds.left,bounds.right),
        clamp(weapon.wrist.y,bounds.bottom,bounds.top),weapon.wrist.z),weapon.axis,weapon.side);
    }
    function swipeHeight(options={}){
      if(Number.isFinite(options.swipeHeight))return options.swipeHeight;
      return options.swipeHeight==='low'?config.swipeLowY:config.swipeY;
    }
    function swipe(raw,options={}){
      const direction=options.direction===-1?-1:1,q=smooth(raw),turn=config.swipeSteer*direction*(1-2*q);
      const axis=yawVector(swipeNeutralAxis,turn),side=yawVector(swipeNeutralSide,turn);
      const bounds=screenBounds(axis,side,config.swipeZ,options);
      return frame(V(mix(direction>0?bounds.left:bounds.right,direction>0?bounds.right:bounds.left,q),
        swipeHeight(options),config.swipeZ),axis,side);
    }
    const motionClocks=new Map();
    function motionFor(kind,options={}){
      const motionKind=kind==='swipe'?'swipe':'overhead',camera=options.camera||stage.makeCamera();
      // Do not build the same physical path again for inputs it never uses.
      const targetLane=motionKind==='swipe'?1:clamp(options.targetLane??1,0,2),
        direction=motionKind==='swipe'&&options.direction===-1?-1:1,
        height=motionKind==='swipe'?swipeHeight(options):config.swipeY;
      const key=JSON.stringify([motionKind,targetLane,direction,height,camera.width,camera.viewportHeight,
        camera.follow,camera.focal,camera.height,camera.horizon,camera.centerX]);
      if(motionClocks.has(key))return motionClocks.get(key);
      const locked=Object.freeze({targetLane,direction,swipeHeight:height,camera:Object.freeze({...camera})});
      const clock=createSpeedClock(q=>motionKind==='swipe'?swipe(q,locked):overhead(q,locked),
        {ease:motionKind==='swipe'?config.swipeSpeedEase:config.speedEase,
          easeCurve:motionKind==='swipe'?'quintic':'cubic'});
      if(motionClocks.size>=128)motionClocks.clear();
      motionClocks.set(key,clock);return clock;
    }
    const durationFor=(kind,options={})=>motionFor(kind,options).duration;
    function recoveryFrame(kind,raw,options={}){
      const swipeMove=kind==='swipe',start=swipeMove?swipe(1,options):overhead(1,options);
      const bank=swipeMove?(options.direction===-1?riseBank:-riseBank):
        (clamp(options.targetLane??1,0,2)===2?-riseBank:riseBank);
      const q=smooth(raw),end=hover(),rise=bankedRise(start,end,q,bank);
      if(!swipeMove||swipeHeight(options)>=config.swipeY)return rise;
      // Withdraw the complete low blade in depth while it rises at the outer
      // edge. This clears the wider mounted lanes without changing its shape.
      const startCentre=weaponCentre(start),endCentre=weaponCentre(end),outward=Math.pow(q,1.8),upward=1-Math.pow(1-q,1.8),
        retreat=q>0&&q<1?12*Math.sin(Math.PI*q):0;
      return frame(add(rise.wrist,V((endCentre.x-startCentre.x)*(outward-q),
        (endCentre.y-startCentre.y)*(upward-q),retreat)),rise.axis,rise.side);
    }
    function phasePath(phase,raw,options={}){
      if(phase==='tele_overhead')return hover();
      if(phase==='tele_swipe'){
        // The opposite sweep ends in this sweep's exact starting pose. Reverse
        // its clear return path so low setup descends behind the rider first.
        if(swipeHeight(options)<config.swipeY)return fitFrame(recoveryFrame('swipe',1-raw,
          {...options,direction:options.direction===-1?1:-1}),options);
        return fitFrame(blendFrame(hover(),swipe(0,options),smooth(raw)),options);
      }
      if(phase==='recover_overhead')return fitFrame(recoveryFrame('overhead',raw,options),options);
      if(phase==='recover_swipe')return fitFrame(recoveryFrame('swipe',raw,options),options);
      throw new TypeError('Unknown Stone King travel phase: '+phase);
    }
    const phaseClocks=new Map();
    function motionForPhase(phase,options={}){
      if(phase==='strike_overhead'||phase==='strike_swipe')return motionFor(phase.slice(7),options);
      const camera=options.camera||stage.makeCamera(),swipeMove=phase.endsWith('_swipe'),
        targetLane=swipeMove||phase==='tele_overhead'?1:clamp(options.targetLane??1,0,2),
        direction=swipeMove&&options.direction===-1?-1:1;
      const height=swipeMove?swipeHeight(options):config.swipeY,key=JSON.stringify([phase,targetLane,direction,height,camera.width,camera.viewportHeight,
        camera.follow,camera.focal,camera.height,camera.horizon,camera.centerX]);
      if(phaseClocks.has(key))return phaseClocks.get(key);
      const locked=Object.freeze({targetLane,direction,swipeHeight:height,camera:Object.freeze({...camera})});
      const lead=phase==='tele_overhead'?config.teleOverhead:phase==='tele_swipe'?config.armLead:config.returnLead;
      const clock=createSpeedClock(q=>phasePath(phase,q,locked),{lead});
      if(phaseClocks.size>=128)phaseClocks.clear();
      phaseClocks.set(key,clock);return clock;
    }
    const durationForPhase=(phase,options={})=>motionForPhase(phase,options).duration;
    const topCommand=V(0,1,0);
    const lowerCommand=lane=>unit(V((clamp(lane,0,2)-1)*.5,-.42,-.68));
    function swipeCommands(options){return options.direction===-1?[lowerCommand(2),lowerCommand(0)]:[lowerCommand(0),lowerCommand(2)];}
    function armAt(direction,actor,crouch=0,hand='open'){
      const shoulder=actorPoint(V(32,-92,0),actor,crouch),ray=mul(unit(direction),bladeUnit);
      return {wrist:localPoint(add(shoulder,mul(ray,67)),actor,crouch),
        elbow:localPoint(add(shoulder,mul(ray,31)),actor,crouch),hand};
    }
    function armAlong(from,to,t,actor,crouch=0,options={},hand='open'){
      const camera=options.camera||stage.makeCamera(),shoulder=actorPoint(V(32,-92,0),actor,crouch),radius=67*bladeUnit;
      const anchor=direction=>stage.project(camera,add(shoulder,mul(unit(direction),radius)));
      const a=anchor(from),b=anchor(to),q=clamp(t),pixel={x:mix(a.x,b.x,q),y:mix(a.y,b.y,q)};
      // A screen chord through the projected reach sphere is lifted back into
      // depth. The near intersection stays on one continuous hemisphere, so
      // the hand traces a line while both original arm bones remain rigid.
      const eye=V(0,camera.height,-camera.follow),ray=V((pixel.x-camera.centerX)/camera.focal,
        (camera.horizon-pixel.y)/camera.focal,1),offset=sub(eye,shoulder);
      const aa=dot(ray,ray),bb=dot(offset,ray),discriminant=bb*bb-aa*(dot(offset,offset)-radius*radius);
      const depth=(-bb-Math.sqrt(Math.max(0,discriminant)))/aa;
      const hit=add(eye,mul(ray,depth)),arm=mul(unit(sub(hit,shoulder)),radius),wrist=add(shoulder,arm);
      return {wrist:localPoint(wrist,actor,crouch),elbow:localPoint(add(shoulder,mul(arm,31/67)),actor,crouch),hand};
    }
    function releaseHandProgress(t){
      if(t<=config.releaseAt)return 0;
      if(t<=config.handClearAt)return config.handWithdrawFraction*smooth((t-config.releaseAt)/(config.handClearAt-config.releaseAt));
      return mix(config.handWithdrawFraction,1,smooth((t-config.handClearAt)/(config.handRaisedAt-config.handClearAt)));
    }
    function releasedHandClear(weapon,arm,actor,crouch,options){
      const camera=options.camera||stage.makeCamera(),hand=stage.project(camera,actorPoint(arm.wrist,actor,crouch));
      const k=hand.scale*bladeUnit,handBox={left:hand.x-9*k,right:hand.x+8*k,top:hand.y-11*k,bottom:hand.y+9*k};
      const hilt={left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity};
      // Keep the sword in the embedded painter layer until the open fingers
      // have cleared its complete grip, pommel and guard in the actual camera.
      for(const p of renderHull){
        if(p.y>21)continue;
        const world=add(weapon.wrist,mul(add(mul(weapon.side,p.x),add(mul(weapon.axis,p.y),mul(weapon.normal,p.z))),bladeUnit));
        const projected=stage.project(camera,world);
        hilt.left=Math.min(hilt.left,projected.x);hilt.right=Math.max(hilt.right,projected.x);
        hilt.top=Math.min(hilt.top,projected.y);hilt.bottom=Math.max(hilt.bottom,projected.y);
      }
      const gap=4;
      return handBox.right+gap<hilt.left||handBox.left-gap>hilt.right||handBox.bottom+gap<hilt.top||handBox.top-gap>hilt.bottom;
    }
    function embeddedWeapon(weapon,actor,crouch,withHand){
      return {wrist:localPoint(weapon.wrist,actor,crouch),
        axis:V(weapon.axis.x,-weapon.axis.y,-weapon.axis.z),side:V(weapon.side.x,-weapon.side.y,-weapon.side.z),
        state:'strike_stone_king_plant',withHand};
    }
    function idleWorld(actor){return frame(actorPoint(V(0,-64,0),actor,0),V(0,-1,0),V(1,0,0));}
    function catchArm(t,options={}){
      const shoulder=V(32,-92,0),idle=art.pose('idle',0);
      const startActor=actorFor('catch',config.catchAt,options);
      const raised=armAlong(topCommand,topCommand,0,startActor,0,options);
      if(t<=config.catchAt)return {...raised,hand:'closed'};
      if(t>=1)return {wrist:idle.wrist,elbow:idle.elbow,hand:'closed'};
      const q=smooth((t-config.catchAt)/(1-config.catchAt));
      const first=unit(sub(raised.elbow,shoulder)),last=unit(sub(idle.elbow,shoulder));
      // Lower the upper arm forward in its Y/Z hinge plane. The elbow stays
      // beside its shoulder in X; only the final idle seating moves it sideways.
      const angle=mix(Math.atan2(first.z,-first.y),Math.PI,q);
      const x=first.x*(1-smooth(q/.2))+last.x*smooth((q-.75)/.25);
      const yz=Math.sqrt(Math.max(0,1-x*x));
      const upper=V(x,-Math.cos(angle)*yz,Math.sin(angle)*yz);
      // Fold the forearm up and forward, then turn it across the chest while
      // the elbow is already below the shoulder. Both rigid bones retain size.
      const sagittal=V(0,-Math.sin(angle),-Math.cos(angle));
      const turn=smooth((q-.45)/.55),hint=unit(blend(sagittal,V(-1,0,0),turn));
      const bend=unit(sub(hint,mul(upper,dot(upper,hint))));
      const finalForearm=unit(sub(idle.wrist,idle.elbow));
      const finalFlex=Math.acos(clamp(dot(last,finalForearm),-1,1));
      const flex=finalFlex*smooth(q)+10*Math.PI/180*Math.sin(Math.PI*q);
      const forearm=add(mul(upper,Math.cos(flex)),mul(bend,Math.sin(flex)));
      const elbow=add(shoulder,mul(upper,31));
      return {wrist:add(elbow,mul(forearm,36)),elbow,hand:'closed'};
    }
    function catchWeapon(t,actor,options){
      if(t>=1)return idleWorld(actor);
      const top=armAlong(topCommand,topCommand,0,actor,0,options);
      const raised=frame(actorPoint(top.wrist,actor),hover().axis,hover().side);
      if(t<config.catchAt)return blendFrame(hover(),raised,smooth(t/config.catchAt));
      const q=smooth((t-config.catchAt)/(1-config.catchAt)),arm=catchArm(t,options);
      // The captured sword follows the actual hand. Turn it down as the elbow
      // folds into the chest, keeping the complete stone blade above ground.
      const basis=blendBasis(raised,idleWorld(actor),q*q);
      return frame(actorPoint(arm.wrist,actor),basis.axis,basis.side);
    }
    function sample(phase='launch',raw=0,options={}){
      const t=clamp(raw),actor=actorFor(phase,t,options),base=art.pose('idle',0);
      let weapon=hover(),rightArm=null,crouch=0;
      if(phase==='launch'){
        crouch=art.plantSpec.crouch*(1-smooth((t-.20)/.45));
        weapon=launch(t,options);
        const p=plantedPose(options.plantLane??1),ray=sub(p.wrist,V(32,-92,0));
        const startDirection=unit(V(ray.x,-ray.y,-ray.z));
        rightArm=t<=config.releaseAt?armAt(startDirection,actor,crouch,'closed'):
          armAlong(startDirection,topCommand,releaseHandProgress(t),actor,crouch,options);
      }else if(phase==='tele_overhead'){
        weapon=hover();
      }else if(phase==='strike_overhead'){
        const clock=motionFor('overhead',options),seconds=t*clock.duration;
        const w=clock.rawAtSeconds(seconds),a=clock.rawAtSeconds(seconds+config.armLead);
        weapon=overhead(w,options);
        rightArm=armAlong(topCommand,lowerCommand(options.targetLane??1),smooth(a),actor,crouch,options);
      }else if(phase==='recover_overhead'){
        const clock=motionForPhase(phase,options),seconds=t*clock.duration;
        const w=clock.rawAtSeconds(seconds),a=clock.rawAtSeconds(seconds+clock.lead);
        weapon=phasePath(phase,w,options);
        rightArm=armAlong(lowerCommand(options.targetLane??1),topCommand,smooth(a),actor,crouch,options);
      }else if(phase==='tele_swipe'){
        const clock=motionForPhase(phase,options),seconds=t*clock.duration;
        const w=clock.rawAtSeconds(seconds),a=clock.rawAtSeconds(seconds+clock.lead);
        weapon=phasePath(phase,w,options);
        rightArm=armAlong(topCommand,swipeCommands(options)[0],smooth(a),actor,crouch,options);
      }else if(phase==='strike_swipe'){
        const clock=motionFor('swipe',options),seconds=t*clock.duration;
        const w=clock.rawAtSeconds(seconds),a=clock.rawAtSeconds(seconds+config.armLead);
        weapon=swipe(w,options);
        rightArm=armAlong(...swipeCommands(options),smooth(a),actor,crouch,options);
      }else if(phase==='recover_swipe'){
        const clock=motionForPhase(phase,options),seconds=t*clock.duration;
        const w=clock.rawAtSeconds(seconds),a=clock.rawAtSeconds(seconds+clock.lead);
        weapon=phasePath(phase,w,options);
        rightArm=armAlong(swipeCommands(options)[1],topCommand,smooth(a),actor,crouch,options);
      }else if(phase==='catch'||phase==='idle_right'){
        weapon=phase==='idle_right'?idleWorld(actor):fitFrame(catchWeapon(t,actor,options),options);
        const grip=phase==='idle_right'||t>=config.catchAt;
        rightArm=grip?(phase==='idle_right'||t>=1?{wrist:base.wrist,elbow:base.elbow,hand:'closed'}:catchArm(t,options)):
          armAlong(topCommand,topCommand,0,actor,0,options);
        const pose={...base,crouch,hideWeapon:true,rightArm,royalFlight:true,spatialRightArm:true};
        if(phase==='catch')pose.catchGrip={wrist:rightArm.wrist,
          axis:V(weapon.axis.x,-weapon.axis.y,-weapon.axis.z),side:V(weapon.side.x,-weapon.side.y,-weapon.side.z),
          close:smooth((t-.25)/.20)};
        pose.releaseWeapon={...embeddedWeapon(weapon,actor,crouch,grip),state:'idle'};
        return {...actor,weapon,pose,phase,t,detached:false,planted:false,catchHand:grip?'right':'approach'};
      }
      if(!phase.startsWith('strike_'))weapon=fitFrame(weapon,options,phase==='launch');
      const pose={...base,crouch,hideWeapon:true,rightArm:rightArm||armAlong(topCommand,topCommand,0,actor,crouch,options),royalFlight:true,spatialRightArm:true};
      if(phase==='launch')pose.rightHand={wrist:pose.rightArm.wrist,axis:V(0,1,0),side:V(1,0,0),
        close:1-smooth((t-config.releaseAt)/(config.handClearAt-config.releaseAt))};
      // Clearance decides the stationary handoff; ownership remains with the
      // flight renderer after lift starts, even if the rising sword crosses
      // the commanding hand later in the animation.
      const detached=phase!=='launch'||t>=config.liftAt||
        (t>=config.handClearAt&&releasedHandClear(weapon,pose.rightArm,actor,crouch,options));
      if(!detached)pose.releaseWeapon=embeddedWeapon(weapon,actor,crouch,t<=config.releaseAt);
      return {...actor,weapon,pose,phase,t,detached,planted:phase==='launch'&&t<=config.liftAt};
    }
    function weaponMesh(worldFrame){
      const {wrist,axis,side}=worldFrame,normal=cross(side,axis),u=worldFrame.unit??bladeUnit;
      return art.bladeMesh.map(face=>({kind:face.kind,vertices:face.vertices.map(v=>add(wrist,
        mul(add(mul(side,v.x),add(mul(axis,v.y),mul(normal,v.z))),u)))}));
    }
    const instanceConfig=Object.freeze({...config,strikeOverhead:durationFor('overhead'),strikeSwipe:durationFor('swipe'),
      teleSwipe:durationForPhase('tele_swipe'),recoverOverhead:durationForPhase('recover_overhead'),recoverSwipe:durationForPhase('recover_swipe')});
    return {version:29,config:instanceConfig,plan,hover,planted,launch,overhead,swipe,sample,weaponMesh,bladeLength,screenBounds,renderHull,
      speedPoints,createSpeedClock,motionFor,durationFor,motionForPhase,durationForPhase,phasePath,
      command:(t,options={})=>options.kind==='swipe'?swipe(t,options):overhead(t,options),
      returnToHover:(t,options={})=>fitFrame(recoveryFrame(options.kind==='swipe'?'swipe':'overhead',t,options),options),
      catch:(t,options={})=>sample('catch',t,options)};
  }
  const api={version:29,create,config,plan};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.KRStoneKingRoyalFlight=api;
})(globalThis);
