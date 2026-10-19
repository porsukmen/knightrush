/* Stone King's stage adapter for the production mounted Jonathan and horse.
 * The shared mesh, GPU renderer, equipment, duck and jump clips are reused.
 * Only the actor's ground placement is converted to the statue's world plane.
 */
(function(root){
  'use strict';
  const visible=Object.freeze({knight:true,horse:true,shield:true,sword:true,bow:true,quiver:true});
  const clamp=v=>Math.max(0,Math.min(1,v));
  function create({stage,engine=null}){
    const env=engine||{
      player:()=>player,now:()=>perfNow,groundY:()=>PLAYER_Y,nativeX:lane=>laneX(lane,1),
      duckAmount:t=>duckPostureAmountAt(t),jumpDuration:()=>jumpDur(),
      liveFrame:()=>root.KRMountedCombat?.frame(),
      sequenceLift:()=>playerSequenceJumpLift()
    };
    const nativeUnit=()=>root.KRMountedRunner?.unit||3*1.02;
    let preparation=null;
    async function prepare(){
      if(preparation)return preparation;
      preparation=(async()=>{
        if(!root.KRMountedRunner)throw Error('Stone King requires the production mounted runner');
        await root.KRMountedRunner.prepare();
        if(!root.KRMountedRunner.ready)throw Error('Stone King mounted model preparation failed');
        if(!root.KRMountedCollision)await new Promise((resolve,reject)=>{
          const script=document.createElement('script');script.src='labs/mounted-knight-collision.js';
          script.onload=resolve;script.onerror=()=>reject(Error('Mounted collision unavailable'));
          document.body.appendChild(script);
        });
        return api;
      })();
      return preparation;
    }
    function stateFor(options={}){
      const p=options.player||env.player(),lane=options.lane??p.x,
        duckT=options.duckT??p.duckT??-1,jumpT=options.jumpT??p.jumpT??-1,
        jumping=jumpT>=0,duck=options.duck??duckT>=0,
        fold=options.fold??env.duckAmount(duckT),live=options.live?env.liveFrame()?.state:null,
        base={angle:180,time:0,motion:'idle',action:'none',zoom:1,laneStep:0,laneBank:0,riderSteer:0,
          ...(options.state||live||{})};
      const angle=root.KRMountedRunner?.laneAngle?.(lane)||180+2*(lane-1);
      Object.assign(base,{angle,zoom:1,visible,worldViewport:true,externalProjectiles:true});
      if(options.lighting)base.lighting=options.lighting;
      if(options.environmentMaterials)base.environmentMaterials=options.environmentMaterials;
      // Use the same production clip clock as mounted-combat.js. Jumping moves
      // and folds the complete horse; no sine-shaped actor translation is added.
      if(jumping){
        const duration=options.jumpDuration??env.jumpDuration();
        base.motion='gallop';base.action='jump';
        base.time=root.KRMountedRunMotion.timeAt(clamp(jumpT/duration)*root.KRMountedRunMotion.timing.duration);
        base.actionTime=undefined;base.entryState=null;
      }else if(duck||fold>0){base.action='duck';base.duckAmount=clamp(fold);}
      else if(base.action==='jump'||base.action==='duck'){base.action='none';base.motion='idle';base.time=0;}
      return base;
    }
    function nativeFrame(options={}){
      const live=options.live&&options.preserveLivePlacement?env.liveFrame?.():null;
      if(live){
        // Normal combat owns shield approach, Rush displacement and its unit.
        // Reuse that complete frame; its sequence lift is already included.
        const f={...live,state:{...live.state},placement:{...live.placement},bank:{...live.bank}};
        if(options.lighting)f.state.lighting=options.lighting;
        if(options.environmentMaterials)f.state.environmentMaterials=options.environmentMaterials;
        const lane=options.lane??(options.player||env.player()).x;
        f.nativeHomeX=env.nativeX?.(lane)??240;
        return f;
      }
      const state=stateFor(options),f=root.KRMountedRunMotion.frame(state,240,env.groundY(),nativeUnit());
      // Sequence-specific lift is already shared with the production mounted
      // pose and native damage. Never infer it from the old pixel-rider jump.
      const lift=options.liftPixels??(options.live?env.sequenceLift?.()||0:0);
      if(lift){f.placement.y-=lift;f.height+=lift;f.minSole+=lift/f.placement.unit;}
      return f;
    }
    function frame(options={}){
      const p=options.player||env.player(),lane=options.lane??p.x,
        f=nativeFrame({...options,live:options.live??true}),worldX=options.x??stage.laneX(lane),
        ground=stage.project(options.cam,{x:worldX,y:0,z:0}),pixelScale=ground.scale/stage.playerPixelsPerUnit;
      f.nativePlacement={...f.placement};
      f.placement={x:ground.x+(f.nativeHomeX===undefined?0:f.placement.x-f.nativeHomeX)*pixelScale,
        y:ground.y+(f.placement.y-env.groundY())*pixelScale,unit:f.placement.unit*pixelScale};
      f.bank={angle:f.bank.angle,lift:f.bank.lift*pixelScale};
      f.worldX=worldX;f.ground=ground;f.pixelScale=pixelScale;
      return f;
    }
    function draw(ctx,f){
      ctx.save();
      try{
        if(f.bank.angle){ctx.translate(f.placement.x,f.placement.y-f.bank.lift);ctx.rotate(f.bank.angle);ctx.translate(-f.placement.x,-f.placement.y);}
        root.KRMountedReview.draw(ctx,f.state,null,f.placement,f.pose);
      }finally{ctx.restore();}
    }
    function sampleCollider(options={}){
      const p=options.player||env.player(),lane=options.lane??p.x,
        worldX=options.x??stage.laneX(lane),f=options.nativeFrame||nativeFrame({...options,live:false}),
        source={...f,placement:f.nativePlacement||f.placement},px=stage.playerPixelsPerUnit,
        vector=v=>({x:worldX+v[0]/px,y:-v[1]/px,z:v[2]/px}),
        capsules=root.KRMountedCollision.sample(source).map(q=>({id:q.id,a:vector(q.a),b:vector(q.b),r:q.r/px})),
        top=q=>Math.max(q.a.y,q.b.y)+q.r,bottom=q=>Math.min(q.a.y,q.b.y)-q.r,
        helmetTop=Math.max(...capsules.filter(q=>q.id==='helmet').map(top)),
        highest=Math.max(...capsules.map(top)),lowest=Math.min(...capsules.map(bottom));
      return {capsules,helmetTop,top:highest,bottom:lowest,lowestSole:f.minSole*nativeUnit()/px,
        jumpHeight:f.height/px,airborne:f.airborne,state:f.state,nativeFrame:f};
    }
    const api={prepare,frame,draw,sampleCollider,stateFor,nativeFrame,
      get ready(){return !!root.KRMountedRunner?.ready&&!!root.KRMountedReview&&!!root.KRMountedCollision;},
      get nativeUnit(){return nativeUnit();},get modelWorldUnit(){return nativeUnit()/stage.playerPixelsPerUnit;}};
    return api;
  }
  root.KRStoneKingMountedPlayer=Object.freeze({version:1,create});
})(globalThis);
