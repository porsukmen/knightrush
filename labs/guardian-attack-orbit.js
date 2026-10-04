/* Read-only scene camera. Shared Guardian and native mounted renderers; no
 * authored pose transforms, gameplay projection or contact verdicts change. */
(()=>{'use strict';
 let frame,angle=0,pitch=0,cp=1,sp=0,zoom=1,scale=1,c=1,s=0,knightDepth=0,panX=0,panY=0;
 const E=KRAncientGuardianEncounter;
 function camera(v){const z=v[0]*s+v[2]*c,y=v[1]+190;return [v[0]*c-v[2]*s,y*cp-z*sp-190,y*sp+z*cp];}
 function world(v){const a=frame.heading*Math.PI/180,co=Math.cos(a),si=Math.sin(a);return[(frame.actorRoot.x-1)*150-(v[0]*co+v[2]*si)*5,v[1]*5,(frame.actorRoot.z/.065-v[0]*si+v[2]*co)*5];}
 function scene(v){const q=camera([v[0],v[1],v[2]-frame.actorRoot.z/.065*2.5]);return[(cvs.width/2-viewX)/viewScale+q[0]*scale+panX*cvs.width/viewScale,(cvs.height/2-viewY)/viewScale+(q[1]+190-q[2]*.16)*scale+panY*cvs.height/viewScale,(q[2]-knightDepth)/10];}
 function prepare(f,options){frame=f;angle=options.cameraYaw||0;pitch=Math.max(-35,Math.min(55,options.cameraPitch||0));cp=Math.cos(pitch*Math.PI/180);sp=Math.sin(pitch*Math.PI/180);zoom=options.cameraZoom||1;panX=options.cameraPanX||0;panY=options.cameraPanY||0;const a=angle*Math.PI/180;c=Math.cos(a);s=Math.sin(a);scale=Math.min((cvs.width/viewScale-40)/900,(cvs.height/viewScale-64)/660)*zoom;knightDepth=camera([(player.x-1)*150,0,-frame.actorRoot.z/.065*2.5])[2];}
 function project(v){return scene(world(v));}
 function line(points,color,width=1){g.strokeStyle=color;g.lineWidth=width;g.beginPath();points.forEach((v,i)=>{const p=scene(v);i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]);});g.stroke();}
 function draw(options){
  g.setTransform(1,0,0,1,0,0);g.fillStyle='#292b25';g.fillRect(0,0,cvs.width,cvs.height);g.setTransform(viewScale,0,0,viewScale,viewX,viewY);
  const far=Math.max(800,frame.actorRoot.z/.065*5+180);
  if(options.lanes!==false){for(let z=-120;z<=far;z+=100)line([[-225,0,z],[225,0,z]],'#424537');for(const x of [-225,-150,-75,0,75,150,225])line([[x,0,-120],[x,0,far]],x%150===0?'#8a8061':'#424537');g.font='12px system-ui';g.textAlign='center';for(let lane=0;lane<3;lane++){const p=scene([(lane-1)*150,0,-65]);g.fillStyle=lane===Math.round(player.x)?'#f4d48a':'#aa9e7c';g.fillText(['SOL','ORTA','SAĞ'][lane],p[0],p[1]+14);}}
  // Split the existing guardian geometry around the knight camera plane so
  // the rear actor or forward sword pass cannot paint over the wrong actor.
  const yaw=(frame.heading+angle)*Math.PI/180,A=cp-.16*sp,cy=Math.cos(yaw),sy=Math.sin(yaw);
  const normal=n=>{const x=n[0]*cy+n[2]*sy,z=-n[0]*sy+n[2]*cy,y=n[1]*cp-z*sp,d=n[1]*sp+z*cp;return[x*cy-d*sy,y,x*sy+d*cy];};
  const opts=side=>({project,normal,depthSide:side,cacheKey:['orbit',angle,pitch,zoom,panX,panY,frame.actorRoot.x,frame.actorRoot.z,frame.heading,cvs.width,cvs.height,viewScale,knightDepth].join(':')});
  E.renderer.draw(g,frame.heading+angle,1,{sword:true},1,frame.time,frame.pose,opts(1));
  // Mounted depth points toward the camera (opposite world +Z). Therefore
  // camera yaw ADDS to its view angle. Subtracting it turned the knight in-world.
  const native=KRMountedCombat.frame(),state={...native.state,angle:native.state.angle+angle,worldViewport:true},anchor=scene([(player.x-1)*150,-playerSequenceJumpLift(),0]),
   mounted=KRMountedRunMotion.frame(state,anchor[0],anchor[1],KRMountedRunner.unit*scale);
  // The native knight is a 2.5D reference, not a new pitched mesh. Keep its
  // approved profile while matching the camera's vertical foreshortening.
  g.save();g.translate(anchor[0],anchor[1]);g.scale(1,A);g.translate(-anchor[0],-anchor[1]);KRMountedReview.draw(g,state,null,mounted.placement,mounted.pose);g.restore();
  E.renderer.draw(g,frame.heading+angle,1,{sword:true},1,frame.time,frame.pose,opts(-1));
 }
 function drawCapsules(caps,color,dashed){g.strokeStyle=color;g.lineWidth=1;g.setLineDash(dashed?[4,4]:[]);for(const v of caps){const a=scene([v.x1-240,v.y1-PLAYER_Y,0]),b=scene([v.x2-240,v.y2-PLAYER_Y,0]),r=v.r*scale;g.beginPath();g.moveTo(a[0]-r,a[1]);g.lineTo(b[0]-r,b[1]);g.arc(b[0],b[1],r,Math.PI,0,true);g.lineTo(a[0]+r,a[1]);g.arc(a[0],a[1],r,0,Math.PI,true);g.stroke();}g.setLineDash([]);}
 window.KRGuardianAttackOrbit=Object.freeze({prepare,project,draw,drawCapsules});
})();
