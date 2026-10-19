/* Colossal stone statue drawn from the user's square/rectangle description.
 * Broad matte surfaces, restrained value changes and a slender stone weapon.
 * Both swords share one shape: the head sword is a small coloured version,
 * rendered behind the head and crown rather than pasted over their front.
 */
(function(root){
  'use strict';
  const W=320,H=440,OX=160,OY=320,U=3;
  const headSword=Object.freeze({scale:.35,headScale:.9,length:102,x:0,y:-148.3});
  const palette=Object.freeze({
    deep:'#555555',dark:'#707070',shade:'#909090',stone:'#a8a8a8',
    mid:'#b8b8b8',light:'#c7c7c7',edge:'#cfcfcf',
    capeDark:'#3e3e3e',cape:'#525252',capeLight:'#666666',
    mossDark:'#58663d',moss:'#7b8a4b',mossLight:'#9ca765',
    goldDark:'#b88719',gold:'#f2bf27',goldLight:'#ffe17c',
    rubyDark:'#ae2430',ruby:'#ef2639',rubyLight:'#ff6871',
    bladeDark:'#3f3f3f',blade:'#5c5c5c',bladeMid:'#707070',bladeEdge:'#838383',
    brassDark:'#424242',brass:'#666666',brassLight:'#888888',grip:'#595959',
    hairDark:'#838383',hair:'#999999',hairLight:'#aeaeae'
  });
  const clamp=n=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));
  const mix=(a,b,k)=>a+(b-a)*k,smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
  const V=(x=0,y=0,z=0)=>({x,y,z});
  const add=(a,b)=>V(a.x+b.x,a.y+b.y,a.z+b.z),mul=(a,k)=>V(a.x*k,a.y*k,a.z*k);
  const dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z;
  const cross=(a,b)=>V(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x);
  const unit=a=>mul(a,1/(Math.hypot(a.x,a.y,a.z)||1));
  const blend=(a,b,k)=>V(mix(a.x,b.x,k),mix(a.y,b.y,k),mix(a.z,b.z,k));
  const rotate=(v,n,a)=>add(add(mul(v,Math.cos(a)),mul(cross(n,v),Math.sin(a))),mul(n,dot(n,v)*(1-Math.cos(a))));
  const bladeStart=20.4;
  const bladeProfile=Object.freeze([
    [bladeStart,3.1,.9],[31,3.05,.88],[51,2.95,.84],[70,2.85,.75],[75,2.7,.62],[85,0,0]
  ].map(row=>Object.freeze(row)));
  function bladeSection(y){
    y=Math.max(bladeStart,Math.min(85,y));
    let i=0;while(i+1<bladeProfile.length&&bladeProfile[i+1][0]<=y)i++;
    const a=bladeProfile[i],b=bladeProfile[Math.min(i+1,bladeProfile.length-1)],q=b[0]===a[0]?0:(y-a[0])/(b[0]-a[0]);
    const halfWidth=mix(a[1],b[1],q),halfThickness=mix(a[2],b[2],q),core=halfWidth-Math.min(.62,halfWidth*.3);
    const crossSection=[[-halfWidth,0],[-core,-halfThickness],[core,-halfThickness],[halfWidth,0],[core,halfThickness],[-core,halfThickness]];
    return {halfWidth,halfThickness,core,crossSection};
  }
  const bladeMesh=(()=>{
    const rings=bladeProfile.map(([y,w,t])=>{
      const core=w-Math.min(.62,w*.3);
      return [V(-w,y,0),V(-core,y,-t),V(core,y,-t),V(w,y,0),V(core,y,t),V(-core,y,t)];
    });
    const faces=[];
    const face=(vertices,kind)=>{
      const n=cross(add(vertices[1],mul(vertices[0],-1)),add(vertices[2],mul(vertices[0],-1)));
      if(Math.hypot(n.x,n.y,n.z)<1e-9)return;
      faces.push({vertices,normal:unit(n),kind});
    };
    face(rings[0],'base');
    for(let i=0;i<rings.length-1;i++)for(let j=0;j<6;j++){
      const k=(j+1)%6,a=rings[i][j],b=rings[i+1][j],c=rings[i+1][k],d=rings[i][k];
      const kind=j===4?'front':j===1?'back':'bevel';
      if(kind==='front'||kind==='back'){
        const n=cross(add(b,mul(a,-1)),add(c,mul(a,-1)));
        if(Math.hypot(n.x,n.y,n.z)>1e-9)face([a,b,c,d],kind);
        else face([a,c,d],kind);
      }else{face([a,b,c],kind);face([a,c,d],kind);}
    }
    return Object.freeze(faces.map(f=>Object.freeze(f)));
  })();
  // These are the physical hilt pieces used by every view, including the
  // coloured miniature. Framing and contact checks consume the same vertices.
  const weaponParts=Object.freeze((()=>{
    const rect=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],parts=[];
    const orient=outline=>outline.reduce((sum,a,i)=>{const b=outline[(i+1)%outline.length];return sum+a[0]*b[1]-b[0]*a[1];},0)<0?[...outline].reverse():outline;
    const part=(name,outline,z0,z1,material,front=[],back=front)=>{const p={name,outline:orient(outline),z0,z1,material,front,back};parts.push(p);return p;};
    const stroke=(x0,y0,x1,y1,width,key)=>{
      const dx=x1-x0,dy=y1-y0,k=width/(2*Math.hypot(dx,dy)),x=-dy*k,y=dx*k;
      return {points:[[x0+x,y0+y],[x1+x,y1+y],[x1-x,y1-y],[x0-x,y0-y]],key};
    };
    const wraps=[];
    for(let i=0;i<4;i++){
      const y=-9.6+i*5;
      wraps.push(stroke(-1.3,y,1.3,y+4.4,.15,'brassDark'),stroke(1.3,y,-1.3,y+4.4,.15,'brassDark'));
      wraps.push(stroke(-1.1,y,1.5,y+4.4,.075,'bladeMid'),stroke(1.5,y,-1.1,y+4.4,.075,'bladeMid'));
    }
    part('grip',rect(-1.8,-10.5,3.6,22.3),-1.35,1.35,
      {front:'grip',edge:'bladeDark',cap:'brass'},[[-1.8,-10.5,.38,22.3,'bladeMid'],[1.35,-10.5,.45,22.3,'brassDark'],...wraps]);
    // A tapered, faceted counterweight rather than a rectangular end block.
    const pommel=part('pommel',[[-1.7,-17],[1.7,-17],[3.15,-13.3],[3.05,-12],[1.8,-10.2],[-1.8,-10.2],[-3.05,-12],[-3.15,-13.3]],-2.2,2.2,{},[]);
    const rings=[[-17,1.7,1.5],[-13.3,3.15,2.2],[-12,3.05,2.2],[-10.2,1.8,1.35]].map(([y,w,d])=>
      [[-w*.7,y,-d],[w*.7,y,-d],[w,y,-d*.65],[w,y,d*.65],[w*.7,y,d],[-w*.7,y,d],[-w,y,d*.65],[-w,y,-d*.65]].map(v=>V(...v)));
    const custom=(vertices,key)=>{
      const normal=unit(cross(add(vertices[1],mul(vertices[0],-1)),add(vertices[2],mul(vertices[0],-1))));return {vertices,normal,key};
    };
    pommel.faces=[custom(rings[0],'brassLight'),custom([...rings.at(-1)].reverse(),'brassDark')];
    for(let i=0;i<rings.length-1;i++)for(let j=0;j<8;j++){
      const k=(j+1)%8;pommel.faces.push(custom([rings[i][j],rings[i+1][j],rings[i+1][k],rings[i][k]],j===4?'brassLight':j===0?'brass':'bladeMid'));
    }
    // The user's front reference has high outer prongs and lowered wing tips.
    const wing=[[-2,11.7],[-5.5,10.7],[-9.5,7.6],[-10.4,5.3],[-10.7,9.1],[-12.9,12],[-14.2,15.3],[-14.1,16.3],[-15.2,18.2],[-9.9,17.1],[-8.8,14.3],[-3.5,16.9],[-2.9,20.3],[0,19.8],[2.9,20.3],[3.5,16.9],[8.8,14.3],[9.9,17.1],[15.2,18.2],[14.2,15.3],[12.9,12],[10.7,9.1],[10.4,5.3],[9.5,7.6],[5.5,10.7],[2,11.7]];
    part('guard',wing,-1.25,1.25,{front:'brass',back:'brass',edge:'brassDark',cap:'brassLight'},
      [{points:[[-10.4,5.3],[-9.8,8.2],[-5.4,11.3],[-2,12.3],[-2,11.7],[-5.5,10.7],[-9.5,7.6]],key:'brassLight'},
       {points:[[10.4,5.3],[9.8,8.2],[5.4,11.3],[2,12.3],[2,11.7],[5.5,10.7],[9.5,7.6]],key:'brassLight'},
       [-2.9,19.6,5.8,.7,'bladeDark']]);
    // The narrow blade seats inside the collar, with a recessed stone tang
    // behind its small shadow seam rather than an unconnected floating slab.
    part('blade-tang',rect(-2.3,19.4,4.6,1.4),-.6,.6,{front:'bladeDark',back:'bladeDark',edge:'bladeDark'});
    const ridge=[[-13.7,16.35],[-12.15,12.3],[-10.5,12.3],[-4.6,14.2],[-4.6,13.15],[-10.5,11.1],[-12.35,11.3],[-14.55,16.7]];
    for(const sign of [-1,1])for(const mirror of [-1,1]){
      const a=sign*1.25,b=sign*1.52;
      part('guard-ridge',ridge.map(([x,y])=>[x*mirror,y]),Math.min(a,b),Math.max(a,b),{front:'brassLight',back:'brassLight',edge:'brassDark'});
    }
    const diamond=(w,h)=>[[0,14-h],[w,14],[0,14+h],[-w,14]];
    for(const sign of [-1,1]){
      const a=sign*1.25,b=sign*1.65,c=sign*2.95;
      part('jewel-setting',diamond(3.1,4.6),Math.min(a,b),Math.max(a,b),{front:'brassLight',back:'brassLight',edge:'bladeDark'});
      const jewel=part('jewel',diamond(2.35,3.7),Math.min(b,c),Math.max(b,c),{},[]),rim=diamond(2.35,3.7).map(([x,y])=>V(x,y,b)),peak=V(0,14,c);
      const ordered=sign>0?rim:[...rim].reverse();jewel.faces=[custom([...ordered].reverse(),'rubyDark')];
      for(let i=0;i<4;i++){
        const v=ordered[i],w=ordered[(i+1)%4],top=(v.y+w.y)/2<14;
        jewel.faces.push(custom([v,w,peak],top?'rubyLight':'ruby'));
      }
    }
    return parts.map(p=>Object.freeze({...p,outline:Object.freeze(p.outline.map(Object.freeze)),faces:p.faces&&Object.freeze(p.faces.map(Object.freeze))}));
  })());
  const weaponMesh=Object.freeze([
    ...bladeMesh,
    ...weaponParts.flatMap(part=>{
      if(part.faces)return part.faces.map(face=>Object.freeze({...face,part:part.name,kind:part.name}));
      const {outline,z0,z1}=part,faces=[{vertices:outline.map(([x,y])=>V(x,y,z1)),normal:V(0,0,1)},
        {vertices:[...outline].reverse().map(([x,y])=>V(x,y,z0)),normal:V(0,0,-1)}];
      for(let i=0;i<outline.length;i++){
        const a=outline[i],b=outline[(i+1)%outline.length];
        faces.push({vertices:[V(...a,z0),V(...b,z0),V(...b,z1),V(...a,z1)],normal:unit(V(b[1]-a[1],a[0]-b[0],0))});
      }
      return faces.map(face=>Object.freeze({...face,part:part.name,kind:part.name}));
    })
  ]);
  const weaponHull=Object.freeze([...new Map(weaponMesh.flatMap(face=>face.vertices).map(v=>[`${v.x},${v.y},${v.z}`,v])).values()]);
  // Compile the unchanged solid surfaces and their inlays once. Clipping blade
  // inlays here avoids projecting and painting off-face strips every frame.
  const weaponRenderFaces=(()=>{
    const vertices=new Map(),vertex=(x,y,z)=>{
      const key=[x,y,z].join(',');if(!vertices.has(key))vertices.set(key,Object.freeze([x,y,z]));return vertices.get(key);
    };
    const front=[[-2.5,bladeStart,5,65,'blade'],[-2.4,bladeStart,.6,56,'bladeMid'],[-.5,bladeStart,2.7,56,'bladeMid'],
      [-2.5,31.2,.8,5.3,'moss'],[-2.5,35.3,1.1,1.7,'mossDark'],[1.7,43,.75,4.3,'moss'],
      [1.9,47.1,.55,.8,'mossDark'],[1.55,60,1.1,3.4,'moss'],[-2.4,70,.65,4.5,'moss'],
      [-2.5,25,.4,1.6,'bladeDark'],[2.2,50,.5,2.2,'bladeDark'],[-.6,38,.25,1.8,'bladeMid']];
    const back=[[-2.5,bladeStart,5,65,'blade'],[-2.4,bladeStart,.6,56,'bladeMid'],[-.5,bladeStart,2.7,56,'bladeMid'],
      [-2.5,31.2,.8,5.3,'mossDark'],[1.7,43,.75,4.3,'moss'],[1.55,60,1.1,3.4,'moss'],[-2.4,70,.65,4.5,'mossDark']];
    const clip=(polygon,outline)=>{
      const area=outline.reduce((sum,a,i)=>{const b=outline[(i+1)%outline.length];return sum+a.x*b.y-b.x*a.y;},0),sign=area<0?-1:1;
      for(let i=0;i<outline.length&&polygon.length;i++){
        const a=outline[i],b=outline[(i+1)%outline.length],distance=p=>sign*((b.x-a.x)*(p[1]-a.y)-(b.y-a.y)*(p[0]-a.x)),next=[];
        for(let j=0;j<polygon.length;j++){
          const p=polygon[j],q=polygon[(j+1)%polygon.length],d=distance(p),e=distance(q);
          if(d>=0)next.push(p);
          if((d>=0)!==(e>=0)){const t=d/(d-e);next.push([mix(p[0],q[0],t),mix(p[1],q[1],t)]);}
        }
        polygon=next;
      }
      return polygon;
    };
    const faces=bladeMesh.map(face=>{
      const n=face.normal,v=face.vertices[0],offset=-dot(n,v),rows=face.kind==='front'?front:face.kind==='back'?back:[];
      const decals=[];
      for(const[x,y,w,h,key]of rows){
        const polygon=clip([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],face.vertices);
        if(polygon.length<3)continue;
        const area=polygon.reduce((sum,a,i)=>{const b=polygon[(i+1)%polygon.length];return sum+a[0]*b[1]-b[0]*a[1];},0);
        if(Math.abs(area)<1e-9)continue;
        decals.push(Object.freeze({vertices:Object.freeze(polygon.map(([a,b])=>vertex(a,b,-(n.x*a+n.y*b+offset)/n.z))),key}));
      }
      return Object.freeze({vertices:Object.freeze(face.vertices.map(v=>vertex(v.x,v.y,v.z))),normal:Object.freeze([n.x,n.y,n.z]),
        key:face.kind==='front'?'bladeDark':face.kind==='back'?'blade':face.kind==='base'?'bladeDark':'bladeEdge',decals:Object.freeze(decals)});
    });
    const decals=(rows,z)=>Object.freeze(rows.map(row=>{
      const points=Array.isArray(row)?[[row[0],row[1]],[row[0]+row[2],row[1]],[row[0]+row[2],row[1]+row[3]],[row[0],row[1]+row[3]]]:row.points;
      return Object.freeze({vertices:Object.freeze(points.map(([x,y])=>vertex(x,y,z))),key:Array.isArray(row)?row[4]:row.key});
    }));
    const face=(points,key,normal,rows=[],part='')=>faces.push(Object.freeze({vertices:Object.freeze(points),key,normal:Object.freeze(normal),decals:rows,part}));
    for(const part of weaponParts){
      if(part.faces){
        for(const f of part.faces)face(f.vertices.map(v=>vertex(v.x,v.y,v.z)),f.key,[f.normal.x,f.normal.y,f.normal.z],[],part.name);
        continue;
      }
      const {outline,z0,z1,material}=part;
      face(outline.map(([x,y])=>vertex(x,y,z1)),material.front,[0,0,1],decals(part.front,z1),part.name);
      face([...outline].reverse().map(([x,y])=>vertex(x,y,z0)),material.back||material.front,[0,0,-1],decals(part.back,z0),part.name);
      for(let i=0;i<outline.length;i++){
        const a=outline[i],b=outline[(i+1)%outline.length],normal=[b[1]-a[1],a[0]-b[0],0];
        const key=material.cap&&Math.abs(normal[1])>Math.abs(normal[0])?material.cap:material.edge;
        face([vertex(...a,z0),vertex(...b,z0),vertex(...b,z1),vertex(...a,z1)],key,normal,[],part.name);
      }
    }
    return Object.freeze(faces);
  })();
  const shoulder=V(32,-92),rest=V(0,-64),up=V(0,-1),swingNormal=V(-1,0,0);
  function project(v,pivotX=0,verticalPerspective=1){
    const k=300/(300-v.z),ky=mix(1,k,verticalPerspective);
    return {x:pivotX+(v.x-pivotX)*k,y:-92+(v.y+92)*ky,k};
  }
  function projectJoint(frame,v){
    const camera=frame.stageCamera;
    if(!camera)return project(v,frame.projectionX??frame.wrist.x,frame.projectionDepth??1);
    const depth=camera.depth-v.z*camera.unit,k=camera.depth/depth;
    const pivotX=((camera.cameraX||0)-camera.actorX)/camera.unit;
    const pivotY=4.2-(frame.crouch-19)-camera.height/camera.unit;
    return {x:pivotX+(v.x-pivotX)*k,y:pivotY+(v.y-pivotY)*k,k,z:v.z,depth};
  }
  function spatialArmMesh(frame){
    const arm=frame.rightArm||frame,elbow=arm.elbow||frame.elbow,wrist=arm.wrist||frame.wrist;
    if(!elbow||!wrist)return {bones:[],faces:[]};
    const faces=[],bones=[],origin=V(32,-92,0);
    const face=(vertices,key,part,detail=false,surface='',ownerId=null)=>{
      const normal=cross(add(vertices[1],mul(vertices[0],-1)),add(vertices[2],mul(vertices[0],-1)));
      if(Math.hypot(normal.x,normal.y,normal.z)<1e-9)return;
      const record={vertices,normal:unit(normal),key,part,detail,id:part+'/'+surface,ownerId};
      faces.push(record);return record;
    };
    const prism=(start,end,width,depth,key,part,reference)=>{
      const delta=add(end,mul(start,-1)),length=Math.hypot(delta.x,delta.y,delta.z),axis=unit(delta);
      // A world-space width reference stays well-defined when the bone points
      // at the camera. The fallback is chosen in 3D, never from screen length.
      let side=add(reference,mul(axis,-dot(reference,axis)));
      if(Math.hypot(side.x,side.y,side.z)<1e-5){
        const fallback=Math.abs(axis.y)<Math.abs(axis.z)?V(0,1,0):V(0,0,1);
        side=add(fallback,mul(axis,-dot(fallback,axis)));
      }
      side=unit(side);const normal=unit(cross(side,axis));
      const point=(x,y,z)=>add(start,add(mul(side,x),add(mul(axis,y),mul(normal,z))));
      const rect=(x,y,w,h,z,reverse=false)=>{
        const rows=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];if(reverse)rows.reverse();
        return rows.map(([a,b])=>point(a,b,z));
      };
      const x=-width/2,d=depth/2;
      face(rect(x,0,width,length,d),key,part,false,'front');
      face(rect(x,0,width,length,-d,true),key,part,false,'back');
      face([point(x,0,-d),point(x+width,0,-d),point(x+width,0,d),point(x,0,d)],'light',part,false,'start');
      face([point(x,length,d),point(x+width,length,d),point(x+width,length,-d),point(x,length,-d)],'mid',part,false,'end');
      face([point(x,0,d),point(x,length,d),point(x,length,-d),point(x,0,-d)],'shade',part,false,'left');
      face([point(x+width,0,-d),point(x+width,length,-d),point(x+width,length,d),point(x+width,0,d)],'mid',part,false,'right');
      const details=[[-width/2,0,width*.27,length,'light'],[width*.26,1,width*.24,Math.max(0,length-2),'dark'],
        [-width/2+.6,2,width-1.2,1.3,'light'],[-width/2+.6,length-3,width-1.2,1,'shade']];
      for(const sign of[-1,1])details.forEach(([a,b,w,h,col],index)=>{
        const surface=sign>0?'front':'back';
        if(h>0)face(rect(a,b,w,h,sign*(d+.002),sign<0),col,part,true,surface+'/detail'+index,part+'/'+surface);
      });
      const bone={part,start,end,width,depth,length,axis,side,normal,point};bones.push(bone);return bone;
    };
    const upper=prism(origin,elbow,11,6,'shade','upper',V(1,0,0));
    // Carry the upper arm's cross-section through the anatomical elbow turn.
    // Reprojecting a fixed -X reference becomes singular when the forearm
    // crosses the chest and points along -X, abruptly rolling its 11x6 block.
    const forearmAxis=unit(add(wrist,mul(elbow,-1))),turn=cross(upper.axis,forearmAxis),cos=dot(upper.axis,forearmAxis);
    const width=mul(upper.side,-1),first=cross(turn,width);
    const transported=cos>-1+1e-8?add(add(width,first),mul(cross(turn,first),1/(1+cos))):width;
    prism(elbow,wrist,11,6,'stone','forearm',transported);
    // The hinge itself is a small oriented stone block, including real end
    // faces. It does not flatten into a screen-aligned knee-cap-like sticker.
    const jointStart=add(elbow,mul(upper.axis,-4)),jointEnd=add(elbow,mul(upper.axis,4));
    prism(jointStart,jointEnd,12,7,'stone','elbow',upper.side);
    return {bones,faces};
  }
  // Lower-body joints live in the fixed foot frame, outside the translated
  // torso. Positive Z points toward the camera; the ankle never follows the hip.
  function legPose(crouch=0){
    const c=Math.max(0,Math.min(57.999,Number.isFinite(crouch)?crouch:0));
    const kneeForward=Math.sqrt(Math.max(0,29*c-c*c/4));
    return {crouch:c,upperLength:29,lowerLength:29,legs:[-1,1].map(side=>{
      const x=side<0?-14:15;
      // A fixed X hinge permits flexion in the forward Y/Z plane only.
      return {side,hip:V(x,-60+c,0),knee:V(x,-31+c/2,kneeForward),ankle:V(x,-2,0)};
    })};
  }
  function legMesh(crouch=0){
    const rig=legPose(crouch),vertical=(29-rig.crouch/2)/29;
    const tangent=rig.legs[0].knee.z/Math.max(.0001,29-rig.crouch/2);
    const depth=Math.min(8,4.8/Math.max(tangent,.0001));
    const legs=rig.legs.map(leg=>{
      // One continuous solid: the two rigid front planes meet at the knee.
      // Their back planes meet at a miter. There is no internal end cap or
      // separate knee plate that could conceal the actual limb inclination.
      const kneeBack=add(leg.knee,V(0,0,-depth/Math.max(vertical,.0001)));
      const faces=[],segments={};
      for(const part of ['thigh','shin']){
        const start=part==='thigh'?leg.hip:leg.knee,end=part==='thigh'?leg.knee:leg.ankle;
        const axis=unit(add(end,mul(start,-1))),normal=V(0,-axis.z,axis.y);
        const outline=part==='thigh'?[[-7,0],[7,0],[7,29],[-7,29]]:
          [[-7,0],[7,0],[7,5],[5,5],[5,29],[-7,29]];
        const map=(x,t)=>add(t===0?start:t===29?end:add(start,mul(axis,t)),V(x,0,0));
        const front=outline.map(([x,t])=>map(x,t));
        const back=outline.map(([x,t])=>
          (part==='thigh'&&t===29||part==='shin'&&t===0)?add(kneeBack,V(x,0,0)):add(map(x,t),mul(normal,-depth)));
        segments[part]={start,end,axis,normal,front,back,outline};
        faces.push({part,kind:'front',vertices:front,normal});
        faces.push({part,kind:'back',vertices:[...back].reverse(),normal:mul(normal,-1)});
        for(let i=0;i<outline.length;i++){
          const j=(i+1)%outline.length;
          if(part==='thigh'&&i===2||part==='shin'&&i===0)continue;
          const vertices=[front[i],back[i],back[j],front[j]];
          const n=unit(cross(add(vertices[1],mul(vertices[0],-1)),add(vertices[2],mul(vertices[0],-1))));
          const kind=part==='thigh'&&i===0?'hip':part==='shin'&&i===4?'ankle':'side';
          faces.push({part,kind,vertices,normal:n});
        }
      }
      return {...leg,segments,faces};
    });
    return {crouch:rig.crouch,depth,legs};
  }
  function projectLegPoint(frame,v){
    const camera=frame.stageCamera;
    const depth=(camera?.depth||300)-v.z*(camera?.unit||1),k=(camera?.depth||300)/depth;
    const pivotX=camera?((camera.cameraX||0)-camera.actorX)/camera.unit:0;
    const pivotY=camera?4.2-camera.height/camera.unit:-48;
    return {x:pivotX+(v.x-pivotX)*k,y:pivotY+(v.y-pivotY)*k,k,z:v.z,depth};
  }
  function weaponPoint(frame,x,y,z=0){
    const normal=unit(cross(frame.side,frame.axis));
    const world=add(add(add(frame.wrist,mul(frame.side,x)),mul(frame.axis,y)),mul(normal,z));
    if(frame.stageCamera)return projectJoint(frame,world);
    const vertical=frame.projectionDepth??1;
    const point=project(world,frame.projectionX??frame.wrist.x,vertical);
    // Thickness keeps its perspective even when the cut's centreline uses
    // orthographic height. This leaves the tested vertical trajectory intact.
    point.y+=normal.y*z*(point.k-1)*(1-vertical);
    return {...point,z:world.z};
  }
  function elbowFor(wrist,poleHint=V(1,0,0)){
    const delta=add(wrist,mul(shoulder,-1)),d=Math.hypot(delta.x,delta.y,delta.z),axis=unit(delta);
    const along=(31*31-36*36+d*d)/(2*Math.max(d,.001));
    const pole=unit(add(poleHint,mul(axis,-dot(poleHint,axis))));
    return add(add(shoulder,mul(axis,along)),mul(pole,Math.sqrt(Math.max(0,31*31-along*along))));
  }
  function solveArm(target,side=-1){
    const sign=side<0?-1:1,origin=V(sign*32,-92,0),delta=add(target,mul(origin,-1));
    const distance=Math.hypot(delta.x,delta.y,delta.z),axis=distance>1e-8?mul(delta,1/distance):V(0,1,0);
    const reach=Math.max(5.000001,Math.min(67,distance)),wrist=add(origin,mul(axis,reach));
    const along=(31*31-36*36+reach*reach)/(2*reach);
    // A fixed pole behind the arm keeps the command elbow continuous when
    // the hand passes over its shoulder or crosses a lane in front of it.
    let pole=add(V(0,0,-1),mul(axis,axis.z));
    if(Math.hypot(pole.x,pole.y,pole.z)<1e-7)pole=add(V(sign,0,0),mul(axis,-sign*axis.x));
    pole=unit(pole);
    return {wrist,elbow:add(add(origin,mul(axis,along)),mul(pole,Math.sqrt(Math.max(0,31*31-along*along))))};
  }
  function cutFrame(q){
    const a=2.45*q,axis=rotate(up,swingNormal,a),side=cross(axis,V(1,0,0));
    return {wrist:add(shoulder,mul(axis,67)),elbow:add(shoulder,mul(axis,31)),axis,side,projectionX:32,projectionDepth:0};
  }
  // Reach down with the arm while the torso keeps its full stature. The blade
  // has a shallow downward pitch and sweeps sideways at the rider's head level.
  // Arm and weapon yaw together; their fixed lengths and wrist angle never pop.
  const swipeSpec=Object.freeze({crouch:6,armDrop:31,bladePitch:17*Math.PI/180,unit:20/172.2,startAngle:70*Math.PI/180,endAngle:-70*Math.PI/180});
  function swipeFrame(q){
    const a=mix(swipeSpec.startAngle,swipeSpec.endAngle,q),pitch=swipeSpec.bladePitch;
    const radial=V(Math.sin(a),0,Math.cos(a)),axis=V(radial.x*Math.cos(pitch),Math.sin(pitch),radial.z*Math.cos(pitch));
    const side=V(-Math.cos(a),0,Math.sin(a));
    const drop=swipeSpec.armDrop,radius=Math.sqrt(67*67-drop*drop);
    const arm=V(radial.x*radius,drop,radial.z*radius);
    return {wrist:add(shoulder,arm),elbow:add(shoulder,mul(arm,31/67)),axis,side,
      crouch:swipeSpec.crouch,projectionDepth:1};
  }
  function frameQuaternion(frame){
    const x=frame.side,y=frame.axis,z=unit(cross(x,y));
    const m00=x.x,m01=y.x,m02=z.x,m10=x.y,m11=y.y,m12=z.y,m20=x.z,m21=y.z,m22=z.z;
    const trace=m00+m11+m22;let a,b,c,d,s;
    if(trace>0){s=Math.sqrt(trace+1)*2;d=s/4;a=(m21-m12)/s;b=(m02-m20)/s;c=(m10-m01)/s;}
    else if(m00>m11&&m00>m22){s=Math.sqrt(1+m00-m11-m22)*2;d=(m21-m12)/s;a=s/4;b=(m01+m10)/s;c=(m02+m20)/s;}
    else if(m11>m22){s=Math.sqrt(1+m11-m00-m22)*2;d=(m02-m20)/s;a=(m01+m10)/s;b=s/4;c=(m12+m21)/s;}
    else{s=Math.sqrt(1+m22-m00-m11)*2;d=(m10-m01)/s;a=(m02+m20)/s;b=(m12+m21)/s;c=s/4;}
    return [a,b,c,d];
  }
  function blendBasis(a,b,q){
    const qa=frameQuaternion(a);let qb=frameQuaternion(b),cos=qa.reduce((sum,n,i)=>sum+n*qb[i],0);
    if(cos<0){qb=qb.map(n=>-n);cos=-cos;}
    let wa=1-q,wb=q;
    if(cos<.9995){const angle=Math.acos(Math.min(1,cos)),den=Math.sin(angle);wa=Math.sin((1-q)*angle)/den;wb=Math.sin(q*angle)/den;}
    const r=qa.map((n,i)=>n*wa+qb[i]*wb),length=Math.hypot(...r),[x,y,z,w]=r.map(n=>n/length);
    return {side:V(1-2*(y*y+z*z),2*(x*y+z*w),2*(x*z-y*w)),
      axis:V(2*(x*y-z*w),1-2*(x*x+z*z),2*(y*z+x*w))};
  }
  function bridgeFrame(q){
    q=clamp(q);
    const start=cutFrame(1),end=swipeFrame(0),startCrouch=2.5*Math.sin(Math.PI*.8);
    if(q===0)return {...start,crouch:startCrouch};
    if(q===1)return end;
    // Fold a normal elbow while the shoulder opens, rather than pulling the
    // wrist into the shoulder. The 31/36 bones keep a comfortable 55–67 reach.
    const d0=unit(add(start.wrist,mul(shoulder,-1))),d1=unit(add(end.wrist,mul(shoulder,-1)));
    const direction=unit(blend(d0,d1,smooth(q))),reach=67-12*Math.sin(Math.PI*q);
    const wrist=add(shoulder,mul(direction,reach));
    // Carry one hinge plane with the shoulder. It cannot flip when the hand
    // passes a world-space pole; the elbow stays below and behind the forearm.
    const hint=V(.3,1,-.2),initialPole=unit(add(hint,mul(d0,-dot(hint,d0))));
    const turn=cross(d0,direction),angle=Math.acos(Math.max(-1,Math.min(1,dot(d0,direction))));
    const pole=Math.hypot(turn.x,turn.y,turn.z)>1e-8?rotate(initialPole,unit(turn),angle):initialPole;
    const along=(31*31-36*36+reach*reach)/(2*reach);
    const elbow=add(add(shoulder,mul(direction,along)),mul(pole,Math.sqrt(Math.max(0,31*31-along*along))));
    // Turn the real blade after withdrawing it, keeping the wrist aligned
    // with the forearm and every preparation pose clear of the mounted rider.
    let {axis,side}=blendBasis(start,end,smooth((q-.4)/.55));
    const forearm=unit(add(wrist,mul(elbow,-1))),wristAngle=Math.acos(Math.max(-1,Math.min(1,dot(axis,forearm))));
    if(wristAngle>35*Math.PI/180){
      const hinge=unit(cross(axis,forearm)),bend=wristAngle-35*Math.PI/180;
      axis=rotate(axis,hinge,bend);side=rotate(side,hinge,bend);
    }
    return {axis,side,wrist,elbow,crouch:mix(startCrouch,end.crouch,smooth(q)),projectionDepth:q};
  }
  function swipeRecoveryFrame(q){
    const start=swipeFrame(1),end={side:V(1,0,0),axis:V(0,1,0)};
    const wrist=blend(start.wrist,rest,q);
    return {...blendBasis(start,end,q),wrist,elbow:elbowFor(wrist,V(1,0,0)),
      crouch:swipeSpec.crouch*(1-q),projectionDepth:1};
  }
  const plantSpec=(()=>{
    const unit=20/172.2,actorZ=6.6,wristZ=actorZ/unit;
    return Object.freeze({crouch:12,readyCrouch:6,actorZ,wristX:32,readyWristY:-75.8,readyWristZ:36,
      plantedWristY:shoulder.y+Math.sqrt(67*67-wristZ*wristZ),plantedWristZ:wristZ,unit});
  })();
  const groundSpec=Object.freeze({duration:.34,maxHeight:2.1,riseAt:.12,fallAt:.32,
    riseEnd:.12/.34,fallEnd:.32/.34,unit:20/172.2});
  function plantFrame(q=0){
    const wrist=V(plantSpec.wristX,mix(plantSpec.readyWristY,plantSpec.plantedWristY,q),mix(plantSpec.readyWristZ,plantSpec.plantedWristZ,q));
    return {wrist,elbow:elbowFor(wrist),axis:V(0,1,0),side:V(1,0,0),
      crouch:mix(plantSpec.readyCrouch,plantSpec.crouch,q),projectionDepth:1};
  }
  function plantBridgeFrame(q){
    const start=swipeFrame(1),end=plantFrame(0),wrist=blend(start.wrist,end.wrist,q);
    return {...blendBasis(start,end,q),wrist,elbow:elbowFor(wrist),
      crouch:mix(start.crouch,end.crouch,q),projectionDepth:1};
  }
  function plantRecoveryFrame(q){
    const start=plantFrame(1),withdraw=clamp(q/.65),settle=clamp((q-.65)/.35);
    const clear=V(plantSpec.wristX,-80,plantSpec.plantedWristZ);
    const wrist=q<.65?blend(start.wrist,clear,withdraw):blend(clear,rest,settle);
    return {wrist,elbow:elbowFor(wrist),axis:V(0,1,0),side:V(1,0,0),
      crouch:plantSpec.crouch*(1-settle),projectionDepth:1};
  }
  // The inverted point is the physical held blade, not a second sprite. Its
  // local coordinate 85 is the point; all of the unexposed blade stays below Y=0.
  function groundBladePose(height=0,x=0,z=0){
    height=Math.max(0,Number.isFinite(height)?height:0);
    const map=v=>V(x+v.x*groundSpec.unit,height+(v.y-85)*groundSpec.unit,z+v.z*groundSpec.unit);
    return {height,x,z,tip:V(x,height,z),faces:bladeMesh.map(face=>({
      kind:face.kind,normal:face.normal,vertices:face.vertices.map(map)
    }))};
  }
  function groundEruption(raw=0){
    const q=clamp(raw),s=groundSpec;
    // One rise and immediate retreat: no peak hold or low exposed linger.
    const height=q<s.riseEnd?s.maxHeight*smooth(q/s.riseEnd):
      q<s.fallEnd?s.maxHeight*(1-smooth((q-s.riseEnd)/(s.fallEnd-s.riseEnd))):0;
    const atFloor=85-height/groundSpec.unit,section=bladeSection(atFloor);
    return {height,halfWidth:height>0?section.halfWidth*groundSpec.unit:0,
      halfDepth:height>0?section.halfThickness*groundSpec.unit:0};
  }
  function drawGroundBlade(ctx,camera,{x=0,z=0,height=0,hurt=false,materials=null}={}){
    if(!(height>0))return;
    const base=materials||palette,c=hurt?{...base,bladeDark:'#777777',blade:'#a8a8a8',bladeEdge:'#cfcfcf'}:base;
    const light=unit(V(-.3,-.5,.8)),tint=(hex,k)=>'#'+[1,3,5].map(i=>Math.max(0,Math.min(255,Math.round(parseInt(hex.slice(i,i+2),16)*k))).toString(16).padStart(2,'0')).join('');
    const project=v=>{const scale=camera.focal/(camera.follow+v.z);return {
      x:camera.centerX+v.x*scale,y:camera.horizon+(camera.height-v.y)*scale,z:-v.z};};
    const clip=vertices=>{
      const out=[];
      for(let i=0;i<vertices.length;i++){
        const a=vertices[i],b=vertices[(i+1)%vertices.length],inside=a.y>=0,next=b.y>=0;
        if(inside)out.push(a);
        if(inside!==next)out.push(blend(a,b,-a.y/(b.y-a.y)));
      }
      return out;
    };
    const faces=[];
    for(const face of groundBladePose(height,x,z).faces){
      const clipped=clip(face.vertices);if(clipped.length<3)continue;
      const points=clipped.map(project),area=points.reduce((sum,a,i)=>{const b=points[(i+1)%points.length];return sum+a.x*b.y-b.x*a.y;},0)/2;
      // The upward world axis reverses the canvas Y orientation. The same
      // surface winding as the held volume therefore remains camera-facing.
      if(area<=.00001)continue;
      const local=face.normal,normal=V(local.x,-local.y,-local.z);
      const material=face.kind==='front'?c.bladeDark:face.kind==='back'?c.blade:face.kind==='base'?c.bladeDark:c.bladeEdge;
      faces.push({points,depth:points.reduce((sum,v)=>sum+v.z,0)/points.length,
        colour:tint(material,.84+.23*Math.max(0,dot(normal,light)))});
    }
    faces.sort((a,b)=>a.depth-b.depth);
    ctx.save();
    for(const face of faces){ctx.fillStyle=face.colour;ctx.beginPath();face.points.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.closePath();ctx.fill();}
    ctx.restore();
  }
  function pose(state='idle',t=0){
    const rawQ=smooth(t),q=rawQ<1e-10?0:rawQ>1-1e-10?1:rawQ;
    let wrist=rest,axis=V(0,1),side=V(1,0),angle=0,crouch=0,cameraZoom=1,pole=V(1,0,0),elbow=null;
    if(state==='tele_stone_king'){
      wrist=add(blend(rest,V(32,-159),q),V(42*Math.sin(Math.PI*q),0,45*Math.sin(Math.PI*q)));
      // Pitch around the blade's crossguard; no roll or sideways blade rotation.
      axis=V(0,Math.cos(Math.PI*q),Math.sin(Math.PI*q));
      side=rotate(V(1,0,0),axis,Math.PI/2*q);
    }else if(state==='strike_stone_king'){
      ({wrist,axis,side,elbow}=cutFrame(q));
      crouch=2.5*Math.sin(Math.PI*q*.8);
    }else if(state==='recover_stone_king'){
      const end=cutFrame(1);wrist=blend(end.wrist,rest,q);
      axis=rotate(up,swingNormal,mix(2.45,Math.PI,q));
      side=rotate(V(1,0,0),axis,Math.PI/2*(1-q));
      pole=blend(cross(end.axis,V(1,0,0)),V(1,0,0),q);
      crouch=2.5*Math.sin(Math.PI*.8)*(1-q);
    }else if(state==='bridge_stone_king_swipe'){
      ({wrist,axis,side,elbow,crouch}=bridgeFrame(q));
    }else if(state==='tele_stone_king_swipe'||state==='strike_stone_king_swipe'){
      ({wrist,axis,side,elbow,crouch}=swipeFrame(state==='tele_stone_king_swipe'?0:q));
    }else if(state==='recover_stone_king_swipe'){
      ({wrist,axis,side,elbow,crouch}=swipeRecoveryFrame(q));
    }else if(state==='bridge_stone_king_plant'){
      ({wrist,axis,side,elbow,crouch}=plantBridgeFrame(q));
    }else if(state==='tele_stone_king_plant'){
      ({wrist,axis,side,elbow,crouch}=plantFrame(0));
    }else if(state==='strike_stone_king_plant'||state==='hold_stone_king_plant'||state==='tele_stone_king_eruption'||state==='strike_stone_king_eruption'){
      ({wrist,axis,side,elbow,crouch}=plantFrame(state==='strike_stone_king_plant'?q:1));
    }else if(state==='recover_stone_king_plant'){
      ({wrist,axis,side,elbow,crouch}=plantRecoveryFrame(q));
    }else if(state==='break')crouch=5*q;
    // Shared phase endpoints must be numerically identical at every camera
    // scale; sin(PI) residue otherwise moves a few shaded outline pixels.
    if(state==='tele_stone_king'&&q===1)({wrist,axis,side,elbow}=cutFrame(0));
    if(state==='recover_stone_king'&&q===0)({wrist,axis,side,elbow}=cutFrame(1));
    if(state==='recover_stone_king'&&q===1){wrist=rest;axis=V(0,1);crouch=0;elbow=elbowFor(rest);}
    if(state==='bridge_stone_king_swipe'&&q===0)({wrist,axis,side,elbow}=cutFrame(1));
    if(state==='bridge_stone_king_swipe'&&q===1)({wrist,axis,side,elbow,crouch}=swipeFrame(0));
    if(state==='recover_stone_king_swipe'&&q===0)({wrist,axis,side,elbow,crouch}=swipeFrame(1));
    if(state==='recover_stone_king_swipe'&&q===1){wrist=rest;axis=V(0,1);side=V(1,0,0);crouch=0;elbow=elbowFor(rest);}
    if(state==='bridge_stone_king_plant'&&q===0)({wrist,axis,side,elbow,crouch}=swipeFrame(1));
    if(state==='bridge_stone_king_plant'&&q===1)({wrist,axis,side,elbow,crouch}=plantFrame(0));
    if(state==='recover_stone_king_plant'&&q===0)({wrist,axis,side,elbow,crouch}=plantFrame(1));
    if(state==='recover_stone_king_plant'&&q===1){wrist=rest;axis=V(0,1);side=V(1,0,0);crouch=0;elbow=elbowFor(rest);}
    // Orthographic height during the cut prevents perspective lifting the tip
    // before it descends. Depth still changes width, thickness and foreshortening.
    // Settle into the cut's projection while lifting, then restore it smoothly
    // during recovery. The raised endpoint must not switch projection modes.
    const projectionX=wrist.x,projectionDepth=state==='tele_stone_king'?1-q:state==='strike_stone_king'?0:state==='recover_stone_king'?q:state==='bridge_stone_king_swipe'?q:1;
    return {state,q,grip:project(wrist,projectionX,projectionDepth),angle,crouch,death:state==='dying'?q:0,
      depth:true,cameraZoom,projectionX,projectionDepth,wrist,axis,side,elbow:elbow??elbowFor(wrist,pole)};
  }
  const approachDuration=1.2,duration=approachDuration+5.2;
  const approachDepth=t=>mix(8,4.3,smooth(t));
  function previewTime(seconds){
    const elapsed=Math.max(0,Number.isFinite(seconds)?seconds:0);
    if(elapsed<duration)return elapsed;
    const period=duration-approachDuration;
    let phase=(elapsed-duration)%period;
    if(phase<1e-9||period-phase<1e-9)phase=0;
    return approachDuration+phase;
  }
  function timeline(seconds){
    let s=Math.max(0,Math.min(duration,seconds));
    if(s<approachDuration)return {state:'idle',t:0,approach:s/approachDuration,label:'Saldırı mesafesine yaklaşıyor'};
    s-=approachDuration;
    if(s<.35)return {state:'idle',t:0,approach:1,label:'Mesafede hazır'};
    if(s<1.95)return {state:'tele_stone_king',t:(s-.35)/1.6,approach:1,label:'Kolu ve kılıcı kaldırıyor'};
    if(s<2.45)return {state:'tele_stone_king',t:1,approach:1,label:'Kol dümdüz · kılıç havaya dik'};
    if(s<3.15)return {state:'strike_stone_king',t:(s-2.45)/.7,approach:1,label:'Kameraya doğru kesiş'};
    if(s<3.5)return {state:'strike_stone_king',t:1,approach:1,label:'Kesmenin devamı'};
    if(s<4.95)return {state:'recover_stone_king',t:(s-3.5)/1.45,approach:1,label:'Duruşa dönüş'};
    return {state:'idle',t:0,approach:1,label:'Mesafede hazır'};
  }
  const comboDuration=approachDuration+11.45;
  function comboPreviewTime(seconds){
    const elapsed=Math.max(0,Number.isFinite(seconds)?seconds:0);
    if(elapsed<comboDuration)return elapsed;
    const period=comboDuration-approachDuration;
    let phase=(elapsed-comboDuration)%period;
    if(phase<1e-9||period-phase<1e-9)phase=0;
    return approachDuration+phase;
  }
  function comboTimeline(seconds){
    const elapsed=Math.max(0,Math.min(comboDuration,seconds));
    if(elapsed<approachDuration+3.5)return {...timeline(elapsed),comboStage:'vertical'};
    const s=elapsed-approachDuration;
    if(s<4.5)return {state:'bridge_stone_king_swipe',t:(s-3.5),approach:1,comboStage:'bridge',label:'Kılıcı yana alıyor'};
    if(s<5.1)return {state:'tele_stone_king_swipe',t:(s-4.5)/.6,approach:1,comboStage:'swipe',label:'Yatay kesiş hazırlanıyor · eğil'};
    if(s<5.9)return {state:'strike_stone_king_swipe',t:(s-5.1)/.8,approach:1,comboStage:'swipe',label:'Üç şeritten yatay kesiş · eğil'};
    if(s<6.1)return {state:'strike_stone_king_swipe',t:1,approach:1,comboStage:'swipe',label:'Yatay kesişin devamı'};
    if(s<7.1)return {state:'bridge_stone_king_plant',t:(s-6.1),approach:1,comboStage:'plantBridge',label:'Şeridine yaklaşıyor · kılıcı dik çeviriyor'};
    if(s<7.8)return {state:'tele_stone_king_plant',t:(s-7.1)/.7,approach:1,comboStage:'plant',label:'Kılıç yere saplanacak · şerit değiştir'};
    if(s<8.3)return {state:'strike_stone_king_plant',t:(s-7.8)/.5,approach:1,comboStage:'plant',label:'Kılıcın ucu zemine saplanıyor'};
    if(s<8.45)return {state:'hold_stone_king_plant',t:(s-8.3)/.15,approach:1,comboStage:'plant',label:'Kılıç zeminde'};
    if(s<9.15)return {state:'tele_stone_king_eruption',t:(s-8.45)/.7,approach:1,comboStage:'eruptionTell',label:'Bulunduğun şeridin altından geliyor · zıpla'};
    if(s<9.75)return {state:'strike_stone_king_eruption',t:(s-9.15)/.6,approach:1,comboStage:'eruption',ground:groundEruption((s-9.15)/.6),label:'Ters kılıç ucu yerden çıkıyor · zıpla'};
    if(s<11.15)return {state:'recover_stone_king_plant',t:(s-9.75)/1.4,approach:1,comboStage:'recover',label:'Kılıcı zeminden çıkarıyor'};
    return {state:'idle',t:0,approach:1,comboStage:'recover',label:'Mesafede hazır'};
  }
  function paint(ctx,p,hurt=false,materials=null){
    const base=materials||palette,c=hurt?{...base,deep:'#777777',dark:'#9a9a9a',shade:'#bebebe',stone:'#dedede',mid:'#ebebeb',light:'#f5f5f5',edge:'#fcfcfc'}:base;
    // One physical arm renderer is used from rest through command and capture.
    // Changing to projected strips at a phase boundary swaps its lit face.
    const spatialRightArm=true;
    // Independent rectangles of different sizes; no enlarged pixel sprite.
    // Keep floating-point residue at a settled joint from changing a half-step
    // rounding tie and moving its rectangle edge by a whole screen pixel.
    const snap=v=>Math.round(v*3+1e-8)/3;
    const P=(x,y,w,h,col)=>{ctx.fillStyle=col;ctx.fillRect(snap(x),snap(y),snap(w),snap(h));};
    const facet=(points,col)=>{
      ctx.fillStyle=col;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();
    };
    const ruby=(x,y,w,h,m=c,map=null)=>{
      // Compact red inlay with flat corners and rectangular colour patches.
      // It keeps its jewel shape without a needle tip or triangular highlights.
      const rect=(x,y,w,h,col)=>map?facet([[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([a,b])=>map(a,b)),col):P(x,y,w,h,col);
      const cut=(a,b,col)=>{const points=[[x-a*.25,y-b],[x+a*.25,y-b],
        [x+a,y-b*.25],[x+a,y+b*.25],[x+a*.25,y+b],
        [x-a*.25,y+b],[x-a,y+b*.25],[x-a,y-b*.25]];facet(map?points.map(([a,b])=>map(a,b)):points,col);};
      cut(w+.9,h+1,m.bladeDark);cut(w+.4,h+.5,m.brassLight);cut(w,h,c.ruby);
      rect(x-w*.55,y-h*.6,w*.65,h*.65,c.rubyLight);
      rect(x-w*.35,y+h*.4,w*.7,h*.25,c.rubyDark);
    };
    const block=(x,y,w,h,col=c.stone,top=c.light,side=c.shade)=>{
      P(x,y,w,h,col);P(x,y,w,2.5,top);P(x+w-2.5,y+2.5,2.5,h-2.5,side);
    };
    const seam=(x,y,w)=>{P(x,y,w,.7,c.shade);P(x,y+.7,w,.45,c.stone);};
    const moss=(x,y,w,h)=>{P(x,y,w,h,c.mossDark);P(x,y,w-1.5,h-1,c.moss);P(x+.8,y,w-2.5,1.2,c.mossLight);};
    const segment=(a,b,w,col,lit)=>{
      const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);
      ctx.save();ctx.translate(a.x,a.y);ctx.rotate(Math.atan2(dy,dx)-Math.PI/2);
      if(len<2.5){P(-w/2,-1.25,w,2.5,col);ctx.restore();return;}
      P(-w/2,0,w,len,col);P(-w/2,0,w*.27,len,lit);P(w*.26,1,w*.24,len-2,c.dark);
      P(-w/2+.6,2,w-1.2,1.3,c.light);P(-w/2+.6,len-3,w-1.2,1,c.shade);ctx.restore();
    };
    const volumeSword=(m,map,withHand)=>{
      const faces=[],frame=map.frame,n=unit(cross(frame.side,frame.axis));
      let surfaceMap=map;
      // Adjacent faces share physical vertices and material/normal combinations.
      const colourCaches=new Map(),pointCaches=new Map();
      const projected=(sourceMap,vertex)=>{
        let points=pointCaches.get(sourceMap);
        if(!points){points=new Map();pointCaches.set(sourceMap,points);}
        let point=points.get(vertex);
        if(!point){point=sourceMap.point(...vertex);points.set(vertex,point);}
        return point;
      };
      const tint=(hex,k)=>'#'+[1,3,5].map(i=>Math.max(0,Math.min(255,Math.round(parseInt(hex.slice(i,i+2),16)*k))).toString(16).padStart(2,'0')).join('');
      const light=unit(V(-.3,-.5,.8));
      const colour=(hex,local,sourceMap=surfaceMap)=>{
        let normals=colourCaches.get(sourceMap);
        if(!normals){normals=new Map();colourCaches.set(sourceMap,normals);}
        let colours=normals.get(local);
        if(!colours){colours=new Map();normals.set(local,colours);}
        if(colours.has(hex))return colours.get(hex);
        const f=sourceMap.frame,normal=add(add(mul(f.side,local[0]),mul(f.axis,local[1])),mul(unit(cross(f.side,f.axis)),local[2]));
        const amount=.84+.23*Math.max(0,dot(unit(normal),light));
        const result=tint(hex,sourceMap.handShade===undefined?amount:mix(1,amount,sourceMap.handShade));
        colours.set(hex,result);return result;
      };
      const signedArea=points=>points.reduce((sum,a,i)=>{const b=points[(i+1)%points.length];return sum+a.x*b.y-b.x*a.y;},0)/2;
      const depthPlane=points=>{
        if(points.some(v=>!(v.depth>0)||!Number.isFinite(v.depth)))return null;
        const a=points[0];let first,second,determinant=0;
        for(let i=1;i<points.length-1;i++)for(let j=i+1;j<points.length;j++){
          const b=points[i],c=points[j],det=(b.x-a.x)*(c.y-a.y)-(c.x-a.x)*(b.y-a.y);
          if(Math.abs(det)>Math.abs(determinant)){first=b;second=c;determinant=det;}
        }
        if(Math.abs(determinant)<1e-9)return null;
        const u=1/a.depth,du=1/first.depth-u,dv=1/second.depth-u;
        const x=(du*(second.y-a.y)-dv*(first.y-a.y))/determinant;
        const y=((first.x-a.x)*dv-(second.x-a.x)*du)/determinant;
        const plane=[x,y,u-x*a.x-y*a.y];
        // A few decorative bevel polygons are not perfectly planar. Keep
        // their established painter order rather than inventing a depth plane.
        return points.every(v=>Math.abs(x*v.x+y*v.y+plane[2]-1/v.depth)<=1e-8)?plane:null;
      };
      const clipHalfPlane=(points,x,y,z)=>{
        const clipped=[];
        for(let i=0;i<points.length;i++){
          const a=points[i],b=points[(i+1)%points.length],da=x*a.x+y*a.y+z,db=x*b.x+y*b.y+z;
          if(da>=0)clipped.push(a);
          if((da>=0)!==(db>=0)){const t=da/(da-db);clipped.push({x:mix(a.x,b.x,t),y:mix(a.y,b.y,t)});}
        }
        return clipped;
      };
      const queue=(vertices,col,normal,decals=null,faceZ=0,reverse=false,decalPlane=null,weaponPart='')=>{
        const sourceMap=surfaceMap,f=sourceMap.frame,normalAxis=unit(cross(f.side,f.axis));
        if(sourceMap.eye){
          const eye=sourceMap.eye,v=vertices[0];
          if(normal[0]*(eye.x-v[0])+normal[1]*(eye.y-v[1])+normal[2]*(eye.z-v[2])<=0)return;
        }
        if(sourceMap.aboveFloor||f.state?.endsWith('_plant')||f.state?.endsWith('_eruption')){
          const above=sourceMap.aboveFloor||((v)=>23.2-f.crouch-f.wrist.y-f.side.y*v[0]-f.axis.y*v[1]-normalAxis.y*v[2]);
          const clipped=[];
          for(let i=0;i<vertices.length;i++){
            const a=vertices[i],b=vertices[(i+1)%vertices.length],ay=above(a),by=above(b);
            if(ay>=0)clipped.push(a);
            if((ay>=0)!==(by>=0)){const t=ay/(ay-by);clipped.push(a.map((v,j)=>mix(v,b[j],t)));}
          }
          vertices=clipped;if(vertices.length<3)return;
        }
        for(const distance of sourceMap.clipDistances||[]){
          const clipped=[];
          for(let i=0;i<vertices.length;i++){
            const a=vertices[i],b=vertices[(i+1)%vertices.length],ay=distance(a),by=distance(b);
            if(ay>=0)clipped.push(a);
            if((ay>=0)!==(by>=0)){const t=ay/(ay-by);clipped.push(a.map((v,j)=>mix(v,b[j],t)));}
          }
          vertices=clipped;if(vertices.length<3)return;
        }
        const points=vertices.map(v=>projected(sourceMap,v));
        if(signedArea(points)<=.00001)return;
        faces.push({points,col:sourceMap.fixedMaterials?col:colour(col,normal,sourceMap),depth:points.reduce((s,v)=>s+v.z,0)/points.length,
          stoneLimb:!!sourceMap.fixedMaterials,decals,faceZ,reverse,normal,decalPlane,sourceMap,weaponPart});
      };
      const solid=(outline,z0,z1,material,front=null,back=front)=>{
        queue(outline.map(([x,y])=>[x,y,z1]),material.front,[0,0,1],front,z1,false);
        queue([...outline].reverse().map(([x,y])=>[x,y,z0]),material.back||material.front,[0,0,-1],back,z0,true);
        for(let i=0;i<outline.length;i++){
          const a=outline[i],b=outline[(i+1)%outline.length],normal=[b[1]-a[1],a[0]-b[0],0];
          const edge=material.cap&&Math.abs(normal[1])>Math.abs(normal[0])?material.cap:material.edge;
          queue([[...a,z0],[...b,z0],[...b,z1],[...a,z1]],edge,normal);
        }
      };
      const rect=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
      if(!map.handOnly){
      for(const face of weaponRenderFaces){
        queue(face.vertices,m[face.key],face.normal,face.decals.length?face.decals.map(decal=>({vertices:decal.vertices,col:m[decal.key]})):null,0,false,null,face.part);
      }
      }
      if(withHand){
        surfaceMap=map.handMap||map;
        const fingers=[[-6,-5,11,2.5,c.light],[2.5,-2.5,2.5,4.5,c.shade],[-5,-2.5,9,.7,c.shade],
          [-5,.1,9,.7,c.shade],[-6,-4,2.5,6,c.light],[4,-2,2,4,c.stone]];
        const morph=surfaceMap.handMorph;
        solid(morph?.outline||rect(-6.5,-5,13,8),-(morph?.depth??5.5),morph?.depth??5.5,
          {front:c.mid,edge:c.shade,cap:c.light},morph?.decals||fingers);
        surfaceMap=map;
      }
      if(map.spatialArm&&(!p.weaponOnly||p.weaponActor)){
        const mesh=spatialArmMesh(p),details=new Map();
        for(const face of mesh.faces)if(face.detail){
          if(!details.has(face.ownerId))details.set(face.ownerId,[]);
          details.get(face.ownerId).push(face);
        }
        for(const face of mesh.faces){
          if(face.detail)continue;
          const points=face.vertices.map(v=>projectJoint(p,v));
          if(signedArea(points)<=.00001)continue;
          // A stone surface and its inlaid bands form one painter item. Short
          // strips must never sort behind their own sloping parent face.
          const armDetails=(details.get(face.id)||[]).map(detail=>({id:detail.id,
            points:detail.vertices.map(v=>projectJoint(p,v)),col:c[detail.key]}));
          faces.push({points,col:c[face.key],depth:points.reduce((sum,v)=>sum+v.z,0)/points.length,
            stableId:'arm/'+face.id,armDetails,decals:null});
        }
      }
      if(map.spatialArm){
        faces.forEach((face,index)=>{face.order=index;face.stableId??='weapon/'+index;});
        faces.sort((a,b)=>Math.round(a.depth*1e6)-Math.round(b.depth*1e6)||a.order-b.order);
      }else faces.sort((a,b)=>a.depth-b.depth);
      if(map.spatialArm&&p.stageCamera&&(!p.weaponOnly||p.weaponActor)&&!map.handOnly){
        const groups=[[],[]];
        for(const face of faces){
          const limb=face.stoneLimb||face.stableId?.startsWith('arm/');
          face.depthPlane=depthPlane(face.points);
          const box={left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity};let convex=true;
          const edges=face.points.map((a,i)=>{
            const b=face.points[(i+1)%face.points.length],c=face.points[(i+2)%face.points.length];
            box.left=Math.min(box.left,a.x);box.right=Math.max(box.right,a.x);
            box.top=Math.min(box.top,a.y);box.bottom=Math.max(box.bottom,a.y);
            const dx=b.x-a.x,dy=b.y-a.y;if(dx*(c.y-b.y)-dy*(c.x-b.x)<-1e-8)convex=false;
            return [-dy,dx,dy*a.x-dx*a.y];
          });
          face.bounds=box;face.clipPlanes=convex?edges:[[1,0,-box.left],[-1,0,box.right],[0,1,-box.top],[0,-1,box.bottom]];
          face.depthPatches=face.depthPlane?[{points:face.points,plane:face.depthPlane,clipPlanes:face.clipPlanes}]:[];
          // Keep a twisted bevel's original pigment; triangulate only its
          // reciprocal depth when it crosses a detached arm or hand.
          if(!face.depthPlane&&p.detachedWeapon&&face.weaponPart==='pommel'){
            for(let i=1;i<face.points.length-1;i++){
              const points=[face.points[0],face.points[i],face.points[i+1]],plane=depthPlane(points);
              if(!plane)continue;
              const clipPlanes=points.map((a,j)=>{const b=points[(j+1)%3],dx=b.x-a.x,dy=b.y-a.y;return [-dy,dx,dy*a.x-dx*a.y];});
              face.depthPatches.push({points,plane,clipPlanes});
            }
          }
          groups[limb?1:0].push(face);
        }
        // Average-depth sorting cannot resolve a sword crossing a forearm.
        // Reciprocal depth is affine on the screen: clip only the portion of
        // an opposite-class face that is physically nearer at each fragment.
        if(groups[0].length&&groups[1].length)for(let group=0;group<2;group++)for(const face of groups[group]){
          const box=face.bounds;
          for(const other of groups[1-group]){
            const bounds=other.bounds;
            if(box.right<=bounds.left||box.left>=bounds.right||box.bottom<=bounds.top||box.top>=bounds.bottom)continue;
            // The accepted intersecting grip keeps its old pose. Treat its
            // counterweight as buried wherever the arm silhouette covers it,
            // including protruding bevel slivers and nonplanar facet edges.
            const buriedPommel=!p.detachedWeapon&&face.weaponPart==='pommel';
            if(!p.detachedWeapon&&other.weaponPart==='pommel')continue;
            if(buriedPommel){(face.depthOccluders??=[]).push(other.points);continue;}
            for(const target of face.depthPatches)for(const occluder of other.depthPatches){
              const plane=occluder.plane.map((v,i)=>v-target.plane[i]);
              let cover=clipHalfPlane(occluder.points,plane[0],plane[1],plane[2]-1e-8);
              for(const [x,y,z]of target.clipPlanes){cover=clipHalfPlane(cover,x,y,z);if(cover.length<3)break;}
              if(cover.length<3||Math.abs(signedArea(cover))<1e-5)continue;
              (face.depthOccluders??=[]).push(cover);
            }
          }
        }
      }
      // Seal shared raster edges once, without widening the silhouette. Separate
      // antialiased face fills otherwise expose the background through seams
      // while a sword, arm or hand moves by a fraction of a screen pixel.
      if(p.weaponOnly&&!p.weaponActor||map.spatialArm&&!p.weaponOnly){
        ctx.fillStyle=p.weaponOnly?m.bladeDark:c.shade;ctx.beginPath();
        for(const face of faces){
          if(!p.weaponOnly&&!face.stoneLimb&&!face.stableId?.startsWith('arm/'))continue;
          face.points.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));
          ctx.closePath();
        }
        ctx.fill();
      }
      const limbFace=face=>face.stoneLimb||face.stableId?.startsWith('arm/');
      // Both ownership paths seal the same weapon surfaces. Hidden fragments
      // must also clip this base coat, or a dark counterweight rim remains.
      if(p.weaponActor||map.spatialArm&&!map.handOnly){
        const weaponFaces=faces.filter(face=>!limbFace(face));
        ctx.fillStyle=m.bladeDark;ctx.beginPath();
        for(const face of weaponFaces){
          if(face.depthOccluders?.length)continue;
          face.points.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.closePath();
        }
        ctx.fill();
        for(const face of weaponFaces){
          if(!face.depthOccluders?.length)continue;
          ctx.save();const box=face.bounds;
          for(const cover of face.depthOccluders){
            ctx.beginPath();ctx.rect(box.left-1,box.top-1,box.right-box.left+2,box.bottom-box.top+2);
            cover.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.closePath();ctx.clip('evenodd');
          }
          facet(face.points.map(v=>[v.x,v.y]),m.bladeDark);ctx.restore();
        }
      }
      for(const face of faces){
        if(p.weaponActor&&limbFace(face))continue;
        if(face.depthOccluders?.length){
          ctx.save();const box=face.bounds;
          // Sequential complements form the union of occluders without the
          // overlap cancellation that one combined even-odd path would cause.
          for(const cover of face.depthOccluders){
            ctx.beginPath();ctx.rect(box.left-1,box.top-1,box.right-box.left+2,box.bottom-box.top+2);
            cover.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.closePath();ctx.clip('evenodd');
          }
        }
        const polygon=face.points.map(v=>[v.x,v.y]);facet(polygon,face.col);
        if(face.armDetails?.length){
          ctx.save();ctx.beginPath();polygon.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();
          for(const detail of face.armDetails)facet(detail.points.map(v=>[v.x,v.y]),detail.col);
          ctx.restore();
        }
        if(face.decals){
          ctx.save();ctx.beginPath();polygon.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();
          for(const decal of face.decals){
            const [x,y,w,h,col]=Array.isArray(decal)?decal:[0,0,0,0,decal.col];
            const points=decal.vertices?decal.vertices.map(v=>{const q=projected(face.sourceMap,v);return [q.x,q.y];}):
              (Array.isArray(decal)?rect(x,y,w,h):decal.points).map(([a,b])=>{
                const plane=face.decalPlane,z=plane?-(plane.normal.x*a+plane.normal.y*b+plane.offset)/plane.normal.z:face.faceZ;
                return face.sourceMap(a,b,z);
              });
            facet(points,face.sourceMap.fixedMaterials?col:colour(col,face.normal,face.sourceMap));
          }
          ctx.restore();
        }
        if(face.depthOccluders?.length)ctx.restore();
      }
    };
    // Shared outline and proportions for the held sword and its small copy.
    // Only the palette changes: matte dark stone in hand, coloured at the head.
    const sword=(m,map=null,withHand=false)=>{
      if(!map){
        map=(x,y)=>[x,y];map.point=(x,y,z=0)=>V(x,y,z);
        map.frame={wrist:V(),side:V(1,0),axis:V(0,1)};
      }
      volumeSword(m,map,withHand);
    };
    const weaponMap=(frame,spatialArm=false)=>{
      const map=(x,y,z=0)=>{const v=weaponPoint(frame,x,y,z);return [v.x,v.y];};
      map.point=(x,y,z=0)=>weaponPoint(frame,x,y,z);map.frame=frame;map.spatialArm=spatialArm;return map;
    };
    const catchHandMap=grip=>{
      const close=clamp(grip.close);
      const basis=close===1?{axis:grip.axis,side:grip.side}:blendBasis({axis:V(0,1),side:V(1,0)},grip,close);
      const map=weaponMap({...p,...grip,...basis});
      map.fixedMaterials=true;
      {
        // Keep this topology even at full closure. A separate closed-hand
        // branch changes the inlay pigments at the last fraction of the motion.
        const open=[[-19/3,-4],[-6,-4],[-6,-8],[-10/3,-8],[-10/3,-4],[-7/3,-4],[-7/3,-10],[1/3,-10],
          [1/3,-4],[1,-4],[1,-9],[11/3,-9],[11/3,-4],[14/3,-4],[14/3,-7],[20/3,-7],
          [20/3,13/3],[4,13/3],[4,5],[1,5],[1,4],[2/3,4],[2/3,6],[-7/3,6],[-7/3,4],[-3,4],[-3,5],[-6,5],[-6,4],[-8,4],[-8,-1],[-19/3,-1]];
        const closed=open.map(([x,y],i)=>i<=15?[mix(-6.5,6.5,(x+19/3)/13),-5]:
          i===16?[6.5,3]:i<=29?[mix(-6.5,6.5,(x+8)/(44/3)),3]:[-6.5,mix(-5,3,(y+4)/8)]);
        const from=[[-6.5,-4,13,2.5,c.light],[4,-1.5,2.5,5.5,c.shade],[-6,-2,3,7,c.mid],[-2.5,-2,3,8,c.stone],
          [1,-2,3,7,c.stone],[4.5,-2,2,5,c.shade],[-6,-8,2.5,5,c.light],[-2.5,-10,2.5,7,c.mid],
          [1,-9,2.5,6,c.stone],[4.5,-7,2,4,c.shade],[-8,-1,3,5,c.shade]].map(row=>[...row.slice(0,4).map(snap),row[4]]);
        const to=[[-6,-5,11,2.5,c.light],[2.5,-2.5,2.5,4.5,c.shade],[-5,-2.5,9,.7,c.shade],
          [-5,.1,9,.7,c.shade],[-6,-4,2.5,6,c.light],[4,-2,2,4,c.stone],
          ...Array.from({length:5},()=>[-1,-3.75,0,0,c.light])];
        map.handMorph={outline:open.map((v,i)=>v.map((n,j)=>mix(n,closed[i][j],close))),depth:5.5*close,
          decals:from.map((row,i)=>[...row.slice(0,4).map((n,j)=>mix(n,to[i][j],close)),to[i][4]])};
      }
      return map;
    };
    if(p.weaponOnly&&p.weaponActor){
      const frame={...p,...p.releaseWeapon},map=weaponMap(frame,true);
      const grip=p.catchGrip||p.rightHand||{wrist:p.wrist,axis:frame.axis,side:frame.side,
        close:p.rightArm?.hand==='closed'?1:0};
      map.handMap=catchHandMap(grip);
      const normal=unit(cross(frame.side,frame.axis)),local=v=>add(frame.wrist,
        add(mul(frame.side,v[0]),add(mul(frame.axis,v[1]),mul(normal,v[2]))));
      if(p.weaponClipFloor)map.aboveFloor=v=>23.2-p.crouch-local(v).y;
      if(p.weaponDepthRange){
        const [min,max]=p.weaponDepthRange,worldZ=v=>p.weaponActorZ-local(v).z*p.stageCamera.unit;
        map.clipDistances=[];
        if(Number.isFinite(min))map.clipDistances.push(v=>worldZ(v)-min);
        if(Number.isFinite(max))map.clipDistances.push(v=>max-worldZ(v));
      }
      volumeSword(c,map,true);return;
    }
    if(p.weaponOnly){
      const frame=p.weaponWorld,u=20/172.2,normal=unit(cross(frame.side,frame.axis)),camera=p.weaponCamera;
      const world=(x,y,z=0)=>V(frame.wrist.x+frame.side.x*(x*u)+frame.axis.x*(y*u)+normal.x*(z*u),
        frame.wrist.y+frame.side.y*(x*u)+frame.axis.y*(y*u)+normal.y*(z*u),
        frame.wrist.z+frame.side.z*(x*u)+frame.axis.z*(y*u)+normal.z*(z*u));
      const point=(x,y,z=0)=>{const v=world(x,y,z),k=camera.focal/(camera.follow+v.z);return {
        x:camera.centerX+v.x*k,y:camera.horizon+(camera.height-v.y)*k,z:-v.z,k};};
      const map=(x,y,z=0)=>{const v=point(x,y,z);return [v.x,v.y];};
      const lighting=v=>V(v.x,-v.y,-v.z);
      map.frame={wrist:lighting(frame.wrist),side:lighting(frame.side),axis:lighting(frame.axis)};
      map.point=point;
      const eye=V(-frame.wrist.x,camera.height-frame.wrist.y,-camera.follow-frame.wrist.z);
      map.eye=V(dot(eye,frame.side)/u,dot(eye,frame.axis)/u,dot(eye,normal)/u);
      if(p.weaponClipFloor)map.aboveFloor=v=>world(...v).y;
      if(p.weaponDepthRange){
        const [min,max]=p.weaponDepthRange;map.clipDistances=[];
        if(Number.isFinite(min))map.clipDistances.push(v=>world(...v).z-min);
        if(Number.isFinite(max))map.clipDistances.push(v=>max-world(...v).z);
      }
      volumeSword(c,map,false);return;
    }
    ctx.save();ctx.translate(OX,OY);
    // Six broad cloth panels keep their real width and length. Their tops
    // follow the shoulders in every pose; the hems stay on the same floor.
    // A single backward fold gathers the fixed-length cloth as the knees bend.
    const capePanels=[[-37,-116,74,114,c.capeDark],[-43,-111,22,111,c.cape],[-40,-109,12,108,c.capeLight],
      [21,-111,22,111,c.cape],[25,-109,11,108,c.capeLight],[36,-94,7,94,c.capeDark]];
    for(const [x,y,width,length,col]of capePanels){
      const drop=Math.max(0,Math.min(length-1e-6,p.crouch)),middle=y+(length+drop)/2;
      const fold=-.5*Math.sqrt(Math.max(0,2*length*drop-drop*drop));
      const vertices=[V(x,y+drop,0),V(x+width,y+drop,0),V(x+width,middle,fold),
        V(x+width,y+length,0),V(x,y+length,0),V(x,middle,fold)];
      facet(vertices.map(v=>{const point=projectLegPoint(p,v);return [point.x,point.y];}),col);
    }
    // Solid lower limbs, with the actual inclined front/back/side planes
    // projected through the stage camera. The knee is their shared miter.
    const lower=legMesh(p.crouch),cam=p.stageCamera;
    const eye=cam?V(((cam.cameraX||0)-cam.actorX)/cam.unit,4.2-cam.height/cam.unit,cam.depth/cam.unit):V(0,-48,300);
    const light=unit(V(-.35,-.75,1)),restLight=.45+.55*light.z;
    const lit=(hex,n)=>{
      const amount=(.45+.55*Math.max(0,dot(n,light)))/restLight;
      return '#'+[1,3,5].map(i=>Math.min(255,Math.round(parseInt(hex.slice(i,i+2),16)*amount)).toString(16).padStart(2,'0')).join('');
    };
    const visible=[];
    for(const leg of lower.legs)for(const face of leg.faces){
      const center=mul(face.vertices.reduce(add,V()),1/face.vertices.length);
      if(dot(face.normal,add(eye,mul(center,-1)))<=1e-8)continue;
      visible.push({...face,leg,center});
    }
    visible.sort((a,b)=>a.center.z-b.center.z);
    for(const face of visible){
      const vertices=face.vertices.map(v=>{const out=projectLegPoint(p,v);return [out.x,out.y];});
      const material=face.kind==='front'?(face.part==='thigh'?c.deep:c.dark):face.kind==='hip'?c.light:face.kind==='back'?c.dark:c.shade;
      facet(vertices,lit(material,face.normal));
      if(face.kind!=='front')continue;
      const leg=face.leg,segment=leg.segments[face.part],base=face.part==='thigh'?-60:-31,x=leg.hip.x-7;
      const point=(a,b)=>{
        const v=add(add(segment.start,V(a-leg.hip.x,0,0)),mul(segment.axis,b-base));
        const out=projectLegPoint(p,v);return [out.x,out.y];
      };
      const R=(a,b,w,h,col)=>{
        a=snap(a);b=snap(b);w=snap(w);h=snap(h);
        facet([[a,b],[a+w,b],[a+w,b+h],[a,b+h]].map(([u,v])=>point(u,v)),lit(col,face.normal));
      };
      const B=(a,b,w,h,col,top,side)=>{R(a,b,w,h,col);R(a,b,w,2.5,top);R(a+w-2.5,b+2.5,2.5,h-2.5,side);};
      ctx.save();ctx.beginPath();vertices.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.closePath();ctx.clip();
      if(face.part==='thigh'){
        B(x+1,-58,11,26,c.shade,c.mid,c.dark);
        R(x+2,-56,4,22,c.stone);R(x+2,-56,3,1.4,c.light);R(x+7,-52,3,18,c.dark);
      }else{
        B(x+1,-30,10,28,c.stone,c.mid,c.shade);
        R(x+2,-28,3,24,c.light);R(x+6,-28,2.3,23,c.mid);R(x+2,-4,8,1.4,c.shade);
        R(x+7,-15,3,.7,c.shade);R(x+7,-14.3,3,.45,c.stone);R(x+8,-15,.65,3,c.dark);
        if(leg.side<0){R(-18,-14,3.5,5.5,c.mossDark);R(-18,-14,2,4.5,c.moss);R(-17.2,-14,1,1.2,c.mossLight);R(-17,-8,2,2,c.mossDark);}
      }
      ctx.restore();
    }
    // Restore the original compact block kneecap artwork on the shared hinge.
    // Its frame bisects the two limb frames, so its familiar proportions stay
    // rigid while the thigh and shin continue their full spatial inclination.
    for(const leg of lower.legs){
      const x=leg.hip.x-7,axis=unit(add(leg.segments.thigh.axis,leg.segments.shin.axis));
      const normal=unit(add(leg.segments.thigh.normal,leg.segments.shin.normal));
      const point=(a,b)=>{
        const v=add(add(leg.knee,V(a-leg.hip.x,0,0)),mul(axis,b+31));
        const out=projectLegPoint(p,v);return [out.x,out.y];
      };
      const R=(a,b,w,h,col)=>{
        a=snap(a);b=snap(b);w=snap(w);h=snap(h);
        facet([[a,b],[a+w,b],[a+w,b+h],[a,b+h]].map(([u,v])=>point(u,v)),lit(col,normal));
      };
      R(x-1,-35,15,9,c.deep);
      R(x-2,-34,15,7,c.stone);R(x-2,-34,15,2.5,c.light);R(x+10.5,-31.5,2.5,4.5,c.shade);
      R(x,-33,9,2,c.mid);R(x+1,-31,7,2,c.light);R(x+1,-28,10,1,c.shade);
    }
    // Only the ankle hinges; each foot and collar remain fixed to the floor.
    for(const leg of lower.legs){
      const x=leg.side<0?-21:8;
      block(x-2,-3,15,4,c.mid,c.light,c.shade);P(x-4,0,18,4,c.dark);
      P(x-4,0,16,2.6,c.stone);P(x-3,0,12,1,c.light);P(x-4,3,18,1.2,c.deep);
    }
    // Longer legs lift the waist by twelve units. Seven more units through the
    // abdomen lift the chest/head, preserving the face rather than stretching it.
    ctx.save();ctx.translate(0,p.crouch-12);
    // A short fractured stump seats directly beneath the empty shoulder cap.
    // Its broad stepped stone shelves remain attached to the shoulder.
    if(!p.leftArm){
    ctx.save();ctx.translate(-4,-7);
    facet([[-34,-87],[-23,-87],[-23,-75],[-26,-75],[-26,-78],[-30,-78],[-30,-73],[-34,-73]],c.shade);
    P(-34,-87,3,14,c.stone);P(-31,-87,5,9,c.mid);P(-26,-87,3,12,c.stone);
    // Unequal square fracture shelves read as broken masonry, not fingers.
    P(-34,-75,4,2,c.light);P(-33,-76,3,1,c.edge);
    P(-26,-77,3,2,c.light);P(-25,-78,2,1,c.mid);
    P(-30,-78,4,1.5,c.deep);P(-30,-80,1,3.5,c.dark);
    P(-29,-85,1,6,c.dark);P(-29,-80,3,1,c.shade);
    moss(-34,-80,2.5,3);P(-33,-77,1.5,1,c.mossDark);
    ctx.restore();
    }
    // Belt and overlapping rectangular faulds open over the long legs.
    P(-21,-64,42,11,c.deep);block(-20,-63,39,7,c.stone,c.light,c.shade);
    P(-18,-60,34,2,c.mid);P(-3,-63,7,7,c.dark);P(-2,-62,5,5,c.mid);P(-1,-61,3,3,c.shade);
    P(-24,-54,20,15,c.dark);block(-24,-54,17,12,c.stone,c.light,c.shade);
    P(-27,-48,12,9,c.shade);P(-27,-48,9,2,c.mid);P(-23,-41,12,3,c.dark);
    P(5,-54,20,15,c.dark);block(7,-54,17,12,c.shade,c.mid,c.dark);
    P(16,-48,12,8,c.stone);P(18,-48,9,2,c.mid);P(10,-41,15,3,c.dark);
    moss(18,-48,5,5);P(22,-43,3,3,c.mossDark);seam(-20,-49,6);
    block(-19,-73,38,12,c.stone,c.mid,c.shade);P(-15,-70,29,3,c.mid);
    ctx.save();ctx.translate(0,-7);
    // Broad stone breastplate with inset blocks and sparse masonry seams.
    P(-23,-98,46,35,c.dark);P(-24,-91,7,21,c.shade);P(17,-91,7,21,c.deep);
    block(-20,-96,40,17,c.mid,c.light,c.shade);P(-18,-94,33,3,c.light);
    P(-20,-80,40,2.4,c.deep);P(-18,-77,36,10,c.stone);P(-15,-68,30,5,c.stone);
    P(-18,-76,6,8,c.shade);P(12,-76,6,8,c.shade);P(-12,-67,24,2,c.mid);
    P(-19,-96,2,15,c.edge);P(16,-94,2,12,c.stone);
    P(-13,-92,25,1,c.mid);P(-13,-90,7,.7,c.stone);
    P(11,-89,5,.7,c.shade);P(13,-89,.7,4,c.shade);P(13,-85,3,.7,c.shade);
    P(-15,-74,5,.7,c.dark);P(-12,-74,.7,3,c.dark);P(-12,-71,3,.7,c.dark);
    // Keep the neck fixed at the shoulders. Reduce the whole head around its
    // chin attachment, so the face, hair and crown keep a single registration.
    P(-7,-104,14,8,c.stone);P(-4.5,-103,9,7,c.mid);P(4,-103,2.5,7,c.shade);
    P(-10,-98,20,2.5,c.stone);
    ctx.save();ctx.translate(0,-101.5);ctx.scale(.9,.9);ctx.translate(0,101.5);
    // The complete little sword is painted first. The skull and crown below
    // physically occlude its lower blade, establishing insertion from behind.
    // Preserve the original head sword's size and seat. The stage calibrates
    // the knight against this prop, while the crown stays in the foreground.
    ctx.save();ctx.translate(headSword.x,headSword.y);ctx.scale(headSword.scale,headSword.scale);
    sword({...c,bladeDark:'#385b7b',blade:'#648fb7',bladeMid:'#8bb4d2',bladeEdge:'#b6d3e4',
      brassDark:c.goldDark,brass:c.gold,brassLight:c.goldLight,grip:c.gold});
    ctx.restore();
    // Trim three units from each outer hair edge; face geometry stays fixed.
    P(-13,-128.5,26,3.5,c.hairDark);
    P(-13,-128.5,3,15.5,c.hair);P(-13,-113,2,5,c.hair);
    P(-13,-127.5,1,5.5,c.hairLight);P(-13,-119,1,5,c.hairLight);
    P(10,-128.5,3,15.5,c.hair);P(11,-113,2,5,c.hair);
    P(11,-127.5,2,5.5,c.hairLight);P(11,-119,2,5,c.hairLight);
    // One continuous face/jaw colour surface. The chin overlaps the face by a
    // half unit in the same colour, so no differently coloured seam is exposed.
    P(-12,-128,24,22,c.shade);P(-10.5,-128,21,24.5,c.mid);
    P(-8.5,-104,17,2.5,c.mid);
    P(-10.5,-126,2.5,22.5,c.light);P(8,-126,2.5,22.5,c.stone);
    P(-8,-125,15,3,c.light);P(-8,-122,15,2,c.mid);
    P(-9,-119,7,1.8,c.shade);P(2.5,-119,7,1.8,c.shade);
    P(-7.5,-116.8,3.5,2.6,c.deep);P(4,-116.8,3.5,2.6,c.deep);
    P(-1.3,-118,2.7,7.5,c.stone);P(-1.3,-117,1,6,c.light);P(-2,-111,4,1,c.shade);
    P(-3.8,-107.7,7.6,1,c.shade);
    P(-8,-102.2,16,.7,c.shade);
    // A short block fringe crosses the upper forehead and joins the side hair.
    // The crown is drawn afterwards, keeping the hair tucked beneath its band.
    P(-11.5,-127.8,23,1.8,c.hairDark);
    P(-11.5,-127,8,3,c.hair);P(-3.5,-127,8.5,1.7,c.hair);P(5,-127,6.5,2.3,c.hair);
    P(-10.5,-127,5,1.2,c.hairLight);P(-2.5,-127,5.5,1.2,c.hairLight);P(6,-127,3.5,1.2,c.hairLight);
    // Contact shade belongs to the hair, beneath the crown's foreground lip.
    P(-13,-127.35,26,1.65,c.hairDark);
    // The user's supplied crown: five spear-leaf points on narrowed stems.
    // Curved sides leave the scooped arch openings between neighbouring leaves.
    // Scale from the band's lower edge and seat it on the scalp. The smaller
    // band overlaps the hair slightly, without wrapping around the temples.
    ctx.save();ctx.translate(0,-127.2);ctx.scale(.75,.84);ctx.translate(0,127);
    const crownLeaf=(cx,tipY,halfWidth,tilt=0)=>{
      const shoulderY=tipY+7.5;
      ctx.beginPath();ctx.moveTo(cx-2.5,-130.5);
      ctx.quadraticCurveTo(cx+.3,-134,cx-halfWidth,shoulderY);
      ctx.lineTo(cx+tilt,tipY);ctx.lineTo(cx+halfWidth,shoulderY);
      ctx.quadraticCurveTo(cx-.3,-134,cx+2.5,-130.5);ctx.closePath();
      ctx.fillStyle=c.shade;ctx.fill();ctx.save();ctx.clip();
      P(cx-halfWidth-1,tipY,halfWidth+1,20,c.mid);
      P(cx-.65,tipY,1.3,20,c.stone);ctx.restore();
    };
    crownLeaf(-17.5,-140,3.1,-3);crownLeaf(17.5,-140,3.1,3);
    crownLeaf(-9.5,-144,4,-.8);crownLeaf(9.5,-144,4,.8);
    crownLeaf(0,-145,4.5);
    // Small, block-built rosettes echo the supplied crown's inset decoration.
    for(const [cx,cy]of [[-9.5,-137.6],[0,-138.6],[9.5,-137.6]]){
      P(cx-.55,cy-.55,1.1,1.1,c.stone);
      P(cx-1.6,cy-.4,.8,.8,c.light);P(cx+.8,cy-.4,.8,.8,c.light);
      P(cx-.4,cy-1.6,.8,.8,c.light);P(cx-.4,cy+.8,.8,.8,c.light);
    }
    // The band rests on the top hair blocks, above the forehead.
    P(-19.5,-132,39,5,c.shade);P(-18.5,-131.5,37,3.5,c.mid);
    P(-18,-132,36,1,c.light);P(-18,-128.2,36,1,c.stone);
    for(const x of [-14.3,-5,5,14.3])P(x-1.1,-132.3,2.2,1.6,c.dark);
    // Paint the front lip last so it visibly covers the upper hair blocks.
    P(-19.3,-128.3,38.6,1.8,c.mid);P(-18.5,-128.3,37,.55,c.light);
    P(-19.3,-126.8,38.6,.3,c.shade);
    ctx.restore();
    ctx.restore(); // Head group; arms and torso remain at their existing scale.
    // Both arm bones use the same spatial wrist as the sword; no sliding grip.
    const rs={x:32,y:-92},w=p.grip,e=projectJoint(p,p.elbow);
    if(!p.hideWeapon&&p.state==='strike_stone_king'&&p.q>.035&&p.q<.98){
      for(const lag of [.17,.085]){
        ctx.save();ctx.globalAlpha*=lag>.1?.07:.13;
        sword(c,weaponMap({...cutFrame(Math.max(0,p.q-lag)),crouch:p.crouch,stageCamera:p.stageCamera}));ctx.restore();
      }
    }
    const jointScale=e.k,wristScale=w.k;
    // The same projected arm and foreground layer continue into the rest pose;
    // no bone solver, overlap or material switches at either animation boundary.
    // Slightly broader caps, still attached directly over the existing arms.
    P(-40,-100,22,14,c.dark);P(-37,-103,15,3,c.stone);
    block(-40,-100,22,10,c.mid,c.light,c.shade);P(-42,-96,5,7,c.stone);P(-41,-96,4,1.5,c.light);
    P(-36,-91,16,4,c.shade);P(-31,-87,11,2,c.dark);
    block(-18,-97,5,7,c.mid,c.light,c.shade);moss(-35,-102,8,2.5);moss(-39,-98,4,2.5);
    P(18,-100,22,14,c.dark);P(22,-103,15,3,c.stone);
    block(18,-100,22,10,c.stone,c.light,c.shade);P(37,-96,5,7,c.shade);P(37,-96,4,1.5,c.mid);
    P(20,-91,16,4,c.shade);P(20,-87,11,2,c.dark);
    block(13,-97,5,7,c.mid,c.light,c.shade);moss(34,-100,6,2.5);moss(38,-97,3,4);
    const emptyHand=(w,open=false)=>{
      const k=w.k||1;
      ctx.save();ctx.translate(w.x,w.y);ctx.scale(k,k);
      block(-6.5,-4,13,8,c.mid,c.light,c.shade);
      P(-6,-2,3,7,c.mid);P(-2.5,-2,3,8,c.stone);P(1,-2,3,7,c.stone);P(4.5,-2,2,5,c.shade);
      if(open){P(-6,-8,2.5,5,c.light);P(-2.5,-10,2.5,7,c.mid);P(1,-9,2.5,6,c.stone);P(4.5,-7,2,4,c.shade);}
      P(-8,-1,3,5,c.shade);ctx.restore();
    };
    if(p.leftArm){
      const arm=p.leftArm,ls=projectJoint(p,V(-32,-92)),le=projectJoint(p,arm.elbow),lw=projectJoint(p,arm.wrist);
      segment(ls,le,11*(ls.k+le.k)/2,c.shade,c.mid);
      P(le.x-6*le.k,le.y-4*le.k,12*le.k,8*le.k,c.dark);
      block(le.x-5*le.k,le.y-4*le.k,10*le.k,6*le.k,c.stone,c.mid,c.shade);
      segment(le,lw,10*(le.k+lw.k)/2,c.stone,c.mid);
      // The existing left forearm's moss and rectangular seams travel with
      // the bone instead of remaining painted on the hanging silhouette.
      const dx=lw.x-le.x,dy=lw.y-le.y,length=Math.hypot(dx,dy),k=(le.k+lw.k)/2;
      ctx.save();ctx.translate(le.x,le.y);ctx.rotate(Math.atan2(dy,dx)-Math.PI/2);ctx.scale(k,k);
      const h=length/k;P(-4,3,3.5,Math.max(0,h-8),c.light);moss(-4,Math.max(2,h*.27),3.5,7);moss(-3,h*.55,2.5,4);
      seam(-3,h-6,6);block(-6,h-4,12,4,c.mid,c.light,c.shade);ctx.restore();
      emptyHand(lw,arm.hand!=='closed');
    }
    if(!spatialRightArm){
      segment(rs,e,11*(1+jointScale)/2,c.shade,c.light);
      P(e.x-6*jointScale,e.y-4*jointScale,12*jointScale,8*jointScale,c.dark);
      block(e.x-5*jointScale,e.y-4*jointScale,10*jointScale,6*jointScale,c.stone,c.light,c.shade);
      segment(e,w,11*(jointScale+wristScale)/2,c.stone,c.light);
    }
    // The held sword is entirely matte stone, with a red inset diamond.
    ctx.save();
    const heldFrame=p.hideWeapon?p.releaseWeapon:p;
    const handGrip=p.catchGrip||p.rightHand||{
      wrist:p.wrist,
      axis:heldFrame?.axis||V(0,1),side:heldFrame?.side||V(1,0),
      close:(heldFrame||p.rightArm?.hand==='closed')?1:0
    };
    const handMap=catchHandMap(handGrip);
    // Open/closed fingers share their solids and palette. Detached commands
    // still enqueue the arm and hand even when no local sword is present.
    const map=heldFrame?weaponMap({...p,...heldFrame},spatialRightArm):handMap;
    map.spatialArm=spatialRightArm;map.handMap=handMap;
    if(!heldFrame)map.handOnly=true;
    volumeSword(c,map,true);
    ctx.restore();ctx.restore();ctx.restore();ctx.restore();
  }
  function draw(ctx,x,y,scale,state='idle',t=0,hurt=false,stageCamera=null,materials=null){
    const p=pose(state,t),s=scale*U;ctx.save();
    try{
      if(stageCamera){p.stageCamera=stageCamera;p.grip=projectJoint(p,p.wrist);}
      if(p.death){ctx.globalAlpha*=1-p.death;y+=p.death*12*s;}
      ctx.translate(x-OX*s,y-OY*s);ctx.scale(s,s);paint(ctx,p,hurt,materials);
    }finally{ctx.restore();}
  }
  function drawWithPose(ctx,x,y,scale,input,hurt=false,stageCamera=null,materials=null){
    const p={...pose(input?.state||'idle',input?.q||0),...input},s=scale*U;
    if(p.rightArm){const arm=p.rightArm.elbow?p.rightArm:{...p.rightArm,...solveArm(p.rightArm.wrist,1)};p.rightArm=arm;p.wrist=arm.wrist;p.elbow=arm.elbow;}
    if(p.leftArm)p.leftArm=p.leftArm.elbow?{...p.leftArm}:{...p.leftArm,...solveArm(p.leftArm.wrist,-1)};
    if(stageCamera)p.stageCamera=stageCamera;
    p.grip=projectJoint(p,p.wrist);
    ctx.save();
    try{
      if(p.death){ctx.globalAlpha*=1-p.death;y+=p.death*12*s;}
      ctx.translate(x-OX*s,y-OY*s);ctx.scale(s,s);paint(ctx,p,hurt,materials);
    }finally{ctx.restore();}
  }
  function weaponFrameFromPose(input,actor){
    const f=input.hideWeapon?input.releaseWeapon:input;if(!f)return null;
    const u=actor.stageCamera.unit;
    return {wrist:V(actor.actorX+f.wrist.x*u,(23.2-input.crouch-f.wrist.y)*u,actor.actorZ-f.wrist.z*u),
      axis:V(f.axis.x,-f.axis.y,-f.axis.z),side:V(f.side.x,-f.side.y,-f.side.z)};
  }
  function worldWeaponPose(worldFrame,actor,{depthRange=null,riderBackPass=false}={}){
    const input=actor.pose||{},p={...pose(input.state||'idle',input.q||0),...input};
    if(p.rightArm){const arm=p.rightArm.elbow?p.rightArm:{...p.rightArm,...solveArm(p.rightArm.wrist,1)};p.rightArm=arm;p.wrist=arm.wrist;p.elbow=arm.elbow;}
    const u=actor.stageCamera.unit,crouch=p.crouch||0;
    // Adding a render-only sword must not turn an open commanding hand into
    // the default closed weapon grip or rotate it with the flying blade.
    const originalHeld=p.hideWeapon?p.releaseWeapon:p;
    if(!p.catchGrip&&!p.rightHand)p.rightHand={wrist:p.wrist,axis:originalHeld?.axis||V(0,1,0),side:originalHeld?.side||V(1,0,0),
      close:originalHeld||p.rightArm?.hand==='closed'?1:0};
    p.stageCamera=actor.stageCamera;p.hideWeapon=true;p.detachedWeapon=actor.detached!==false;
    p.weaponActorZ=actor.actorZ;
    p.releaseWeapon={wrist:V((worldFrame.wrist.x-actor.actorX)/u,23.2-crouch-worldFrame.wrist.y/u,(actor.actorZ-worldFrame.wrist.z)/u),
      axis:V(worldFrame.axis.x,-worldFrame.axis.y,-worldFrame.axis.z),side:V(worldFrame.side.x,-worldFrame.side.y,-worldFrame.side.z),
      state:'strike_stone_king_plant',withHand:false};
    if(actor.localWeaponFrame)p.releaseWeapon={...actor.localWeaponFrame,state:'strike_stone_king_plant'};
    if(depthRange){
      const n=unit(cross(worldFrame.side,worldFrame.axis));let min=Infinity,max=-Infinity;
      for(const v of weaponHull){const z=worldFrame.wrist.z+u*(worldFrame.side.z*v.x+worldFrame.axis.z*v.y+n.z*v.z);min=Math.min(min,z);max=Math.max(max,z);}
      if(max<depthRange[0]||min>depthRange[1])delete p.releaseWeapon;
    }
    return p;
  }
  function drawWeapon(ctx,camera,worldFrame,{clipFloor=true,hurt=false,depthRange=null,riderBackPass=false,materials=null,actorProjection=null}={}){
    if(depthRange){
      const normal=unit(cross(worldFrame.side,worldFrame.axis)),scale=20/172.2,base=worldFrame.wrist.z;
      let min=Infinity,max=-Infinity;
      for(const v of weaponHull){
        const z=base+scale*(worldFrame.side.z*v.x+worldFrame.axis.z*v.y+normal.z*v.z);
        min=Math.min(min,z);max=Math.max(max,z);
      }
      if((Number.isFinite(depthRange[0])&&max<depthRange[0])||(Number.isFinite(depthRange[1])&&min>depthRange[1]))return;
    }
    // The back pass covers the Z0 cut before the rider is drawn. Complementary
    // antialiased clips would leave a moving hairline through the stone blade.
    const range=riderBackPass&&depthRange?.[0]===0&&depthRange?.[1]===Infinity?null:depthRange;
    ctx.save();
    try{
      if(actorProjection){
        const p=worldWeaponPose(worldFrame,actorProjection,{depthRange:range});
        if(!p.releaseWeapon)return;
        Object.assign(p,{weaponOnly:true,weaponActor:true,weaponClipFloor:clipFloor,weaponDepthRange:range});
        const s=actorProjection.scale*U;
        if(p.death)ctx.globalAlpha*=1-p.death;
        ctx.translate(actorProjection.x,actorProjection.y+(p.crouch-19+(p.death||0)*12)*s);ctx.scale(s,s);
        paint(ctx,p,hurt,materials);
      }else paint(ctx,{weaponOnly:true,weaponWorld:worldFrame,weaponCamera:camera,weaponClipFloor:clipFloor,weaponDepthRange:range},hurt,materials);
    }
    finally{ctx.restore();}
  }
  const api={version:56,width:W,height:H,origin:{x:OX,y:OY},palette,headSword,bladeStart,bladeTip:85,bladeProfile,bladeSection,bladeMesh,weaponParts,weaponMesh,weaponHull,pose,paint,draw,drawWithPose,drawWeapon,worldWeaponPose,weaponFrameFromPose,solveArm,project,projectJoint,spatialArmMesh,projectLegPoint,legPose,legMesh,weaponPoint,timeline,duration,approachDuration,approachDepth,previewTime,
    swipeSpec,swipeFrame,bridgeFrame,plantSpec,plantFrame,plantBridgeFrame,plantRecoveryFrame,groundSpec,groundBladePose,groundEruption,drawGroundBlade,comboTimeline,comboDuration,comboPreviewTime,
    style:'native-variable-size-rectangles',design:'colossal-living-stone-statue'};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.KRStoneKingPixel=api;
})(globalThis);
