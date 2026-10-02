/* Local Mounted Lab tack. Unscaled horse-space geometry only: the parent mesh
 * applies horseScale once, after the saddle and articulated legs are built. */
(()=>{'use strict';
 function addSaddle(f,p,h){
  const {face,box,rod,add,mul,leather,blue,steel,gold}=h;
  const scale=p.horseScale||1,b=(p.bob||0)/scale,start=f.length;
  const point=(side,x,y,z)=>[side*x,y+b,z];
  const oriented=(v,axis,sign,col,tag='saddle')=>{
   const a=v[1].map((n,i)=>n-v[0][i]),c=v[2].map((n,i)=>n-v[0][i]),
    n=[a[1]*c[2]-a[2]*c[1],a[2]*c[0]-a[0]*c[2],a[0]*c[1]-a[1]*c[0]];
   face(f,n[axis]*sign<0?[...v].reverse():v,col,tag);
  };

  // The blanket is one folded cloth volume over the back, not a vertical
  // signboard beside it. Its upper surface follows the approved barrel's
  // dorsal stations with .15 clearance. The hanging sides drape around the
  // actual posed skin below, rather than cutting through a raised shoulder.
  const folds=[[0,25.45],[2.8,25.25],[3.5,24.2],[5.9,21.4],[5.9,16.2]];
  const back=-5.6,front=4.5;
  const dorsal=[[-5.6,24.7266666667],[-3,24.4],[2,24.7],[4.5,25.2555555556]],
   sample=(rows,z,column)=>{
    let i=1;while(i<rows.length-1&&z>rows[i][0])i++;
    const a=rows[i-1],c=rows[i],t=Math.max(0,Math.min(1,(z-a[0])/(c[0]-a[0])));
    return a[column]+(c[column]-a[column])*t;
   },blanketTop=z=>sample(dorsal,z,1)+.15,
   clothNodes=new Map(),foldPoint=(side,i,z,inside=false)=>{
    const [x,y]=folds[i],weight=[1,1,.5,0,0][i];
    const v=point(side,Math.max(0,x-(inside?.10:0)),y+(blanketTop(z)-25.45)*weight-(inside?.10:0),z),
     key=`${side}:${i}:${z}`;
    if(!clothNodes.has(key))clothNodes.set(key,{side,row:i,z,shift:0});
    v.clothNode=clothNodes.get(key);return v;
   },zs=[back,-4.35,-3,-1.45,0,2,3.25,front];
  for(const side of [-1,1]){
   for(let i=0;i<folds.length-1;i++){
    for(let j=1;j<zs.length;j++){
     const z0=zs[j-1],z1=zs[j],v=[foldPoint(side,i,z0),foldPoint(side,i,z1),
      foldPoint(side,i+1,z1),foldPoint(side,i+1,z0)],
      inner=[foldPoint(side,i,z0,true),foldPoint(side,i,z1,true),
       foldPoint(side,i+1,z1,true),foldPoint(side,i+1,z0,true)];
     oriented(v,0,side,blue,'cloth');oriented(inner,0,-side,blue,'cloth');
    }
    // Thin closed hems: angled views must not look through open cloth rims.
    for(const z of [back,front])oriented([foldPoint(side,i,z),foldPoint(side,i,z,true),
     foldPoint(side,i+1,z,true),foldPoint(side,i+1,z)],2,z===front?1:-1,blue,'cloth');
   }
   for(let j=1;j<zs.length;j++)oriented([foldPoint(side,4,zs[j-1]),foldPoint(side,4,zs[j-1],true),
    foldPoint(side,4,zs[j],true),foldPoint(side,4,zs[j])],1,-1,blue,'cloth');
   // A broad gold binding follows the actual bends of the cloth.
   for(const z of [back,front])for(let i=1;i<folds.length-1;i++){
    const a=add(foldPoint(side,i,z),[side*.07,.06,0]),c=add(foldPoint(side,i+1,z),[side*.07,.06,0]);
    rod(f,a,c,.32,gold,'cloth-trim');
   }
   for(let j=1;j<zs.length;j++)rod(f,point(side,5.98,16.25,zs[j-1]),point(side,5.98,16.25,zs[j]),.34,gold,'cloth-trim');
   // One large cloth emblem, kept away from the stirrup and girth.
   rod(f,point(side,5.98,20.15,-4.35),point(side,5.98,18.6,-2.9),.4,gold,'cloth-trim');
   rod(f,point(side,5.98,18.6,-2.9),point(side,5.98,20.15,-1.45),.4,gold,'cloth-trim');
  }

  // Tailor the lower front corner behind the foreleg's recovery sweep.
  // Keep the seat/top fixed: contact correction should fit a small fold,
  // not push a long front hem and its leather skirt out beside the greave.
  const reliefWeight=y=>Math.max(0,Math.min(1,(24.2+b-y)/2.8))*.5,
   reliefZ=(y,z)=>z-Math.max(0,z-2)*reliefWeight(y);
  // Rod faces share corner arrays; each physical trim vertex moves once.
  const relieved=new Set();
  for(const q of f.slice(start))for(const v of q.v)if(!relieved.has(v)){
   relieved.add(v);v[2]=reliefZ(v[1],v[2]);
  }

  // Solve in the saddle's rigid frame. The renderer supplies all of the
  // unscaled posed skin before tack is added; no camera or depth bias enters
  // this fit. Clipping triangle footprints finds interior contacts as well
  // as vertex contacts, so a broad panel cannot bridge through a muscle.
  const origin=p.bodyPoint([0,0,0]),ey=p.bodyPoint([0,1,0]).map((v,i)=>v-origin[i]),
   ez=p.bodyPoint([0,0,1]).map((v,i)=>v-origin[i]),
   // Shared skin corners have one rigid-frame image within this fit. Never
   // retain them across poses: the next frame has a new body transform.
   localVertices=new Map(),local=v=>{let q=localVertices.get(v);if(q)return q;
    const d=v.map((v,i)=>v-origin[i]);q=[v[0],d.reduce((n,v,i)=>n+v*ey[i],0),d.reduce((n,v,i)=>n+v*ez[i],0)];localVertices.set(v,q);return q;},
   det2=(a,c,d)=>(c[1]-a[1])*(d[2]-a[2])-(c[2]-a[2])*(d[1]-a[1]),
   bary=(v,t,d)=>[det2(v,t[1],t[2])/d,det2(t[0],v,t[2])/d,det2(t[0],t[1],v)/d],
   bounds=t=>({y0:Math.min(t[0][1],t[1][1],t[2][1]),y1:Math.max(t[0][1],t[1][1],t[2][1]),z0:Math.min(t[0][2],t[1][2],t[2][2]),z1:Math.max(t[0][2],t[1][2],t[2][2])}),
   skin=f.slice(0,start).filter(q=>q.tag==='barrel'||q.limbId).flatMap(q=>q.v.slice(1,-1).map((_,i)=>[q.v[0],q.v[i+1],q.v[i+2]].map(local)))
    .filter(t=>Math.abs(det2(...t))>1e-8).map(v=>({v,...bounds(v)}))
    .filter(q=>q.z0<=front&&q.z1>=back&&q.y1>=16+b&&q.y0<=25.8+b);
  const clipped=(subject,t,sign)=>{
   let result=subject;
   for(let k=0;k<3&&result.length;k++){
    const a=t[k],c=t[(k+1)%3],input=result;result=[];
    for(let j=0;j<input.length;j++){
     const v=input[j],w=input[(j+1)%input.length],dv=sign*det2(a,c,v),dw=sign*det2(a,c,w);
     if(dv>=-1e-9)result.push(v);
     if((dv<0)!==(dw<0)){const r=dv/(dv-dw);result.push([v[0]+(w[0]-v[0])*r,v[1]+(w[1]-v[1])*r,v[2]+(w[2]-v[2])*r]);}
    }
   }return result;
  };
  for(const q of f.slice(start).filter(q=>q.tag==='cloth'))for(let i=1;i<q.v.length-1;i++){
   const t=[q.v[0],q.v[i],q.v[i+1]],area=det2(...t);
   // The existing hidden dorsal/seat stack is a separate fixed contact.
   // Only the two hanging bands have lateral drape freedom; trying to
   // solve a buried horizontal roof by widening it would make a shelf.
   if(t.some(v=>v.clothNode.row<2)||Math.abs(area)<1e-8)continue;
   const side=t.find(v=>Math.abs(v[0])>.01)?.clothNode.side||1,bb=bounds(t),sign=Math.sign(area);
   for(const body of skin){
    if(body.y0>bb.y1||body.y1<bb.y0||body.z0>bb.z1||body.z1<bb.z0)continue;
    for(const v of clipped(body.v,t,sign)){
     // The gold binding projects .16 beyond a panel edge. Include its
     // sewn thickness in the clearance, not just the blue centre surface.
     const w=bary(v,t,area),x=w.reduce((n,w,i)=>n+w*side*t[i][0],0),need=side*v[0]+.10-x;
     if(need<=0)continue;
     const moving=w.reduce((n,w,i)=>n+(t[i].clothNode.row>=2?w:0),0);if(moving<1e-6)continue;
     for(const v of t)if(v.clothNode.row>=2)v.clothNode.shift=Math.max(v.clothNode.shift,need/moving);
    }
   }
  }
  const clothShift=(side,y,z)=>{
   if(z>2)z=2+(z-2)/(1-reliefWeight(y));
   z=Math.max(back,Math.min(front,z));let j=1;while(j<zs.length-1&&z>zs[j])j++;
   const u=(z-zs[j-1])/(zs[j]-zs[j-1]),ys=folds.map((v,i)=>v[1]+b+(blanketTop(z)-25.45)*[1,1,.5,0,0][i]);
   let i=1;while(i<ys.length-1&&y<ys[i])i++;
   const v=Math.max(0,Math.min(1,(ys[i-1]-y)/(ys[i-1]-ys[i]))),
    at=(row,col)=>clothNodes.get(`${side}:${row}:${zs[col]}`).shift,
    a=at(i-1,j-1)*(1-u)+at(i-1,j)*u,c=at(i,j-1)*(1-u)+at(i,j)*u;
   return a*(1-v)+c*v;
  };
  for(let i=start;i<f.length;i++){
   const q=f[i];q.clothPart=q.tag==='cloth'?'panel':'trim';
   q.v=q.v.map(v=>{const side=v.clothNode?.side||Math.sign(v[0])||1,shift=v.clothNode?.shift??clothShift(side,v[1],v[2]);return [v[0]+side*shift,v[1],v[2]];});
  }

  // A low, shortened rear lip leaves room for the original Gear Lab quiver.
  // Its back is Z -2.684 after scaling, ahead of the quiver's Z -2.9 edge.
  // Keep the seat/front contact unchanged; do not lift any rider equipment.
  const stations=[[-2.2,25.05,3.15],[-1.55,25.0,3.05],
   [.8,25.15,2.95],[2.55,25.75,2.8],[3.35,26.05,2.7],[3.8,25.65,2.6]];
  // Preserve the seat top/contact. Only its underside yields enough room for
  // the cloth: a thick hidden bottom must not poke through the blanket.
  const rings=stations.map(([z,y,w])=>{
   const bottom=Math.min(y-.18,Math.max(y-.72,blanketTop(z)+.07));
   return [[w,y-.12,z],[w*.72,y+.15,z],[-w*.72,y+.15,z],[-w,y-.12,z],
    [-w*.88,bottom,z],[w*.88,bottom,z]].map(v=>add(v,[0,b,0]));
  });
  face(f,[...rings[0]].reverse(),leather,'saddle');
  for(let j=1;j<rings.length;j++)for(let i=0;i<6;i++){
   face(f,[rings[j-1][i],rings[j-1][(i+1)%6],rings[j][(i+1)%6],rings[j][i]],leather,'saddle');
  }
  face(f,rings.at(-1),leather,'saddle');

  // Filled rear leather seat, matching the user's marked profile contour.
  // The rims dip under the original quiver and curl up behind its rear edge
  // (local Z -3.914). A closed, gently crowned insert joins them: two narrow
  // rails alone left the blue blanket visible through the intended leather.
  const rearLip=[[-2.2,24.93,3.15,.48],[-2.36,24.58,3.45,.65],
   [-3.95,24.58,3.65,.7],[-4.5,25.05,3.6,.66],[-5.15,25.4,3.3,.5]];
  const centreTop=(z,y)=>Math.max(y-.04,blanketTop(z)+.12),
   centreBottom=(z,y)=>Math.max(centreTop(z,y)-.24,blanketTop(z)+.03);
  for(const side of [-1,1]){
   const lipRings=rearLip.map(([z,y,x,w])=>[
    point(side,x,y,z),point(side,x-w,y-.04,z),
    point(side,x-w,y-.38,z),point(side,x,y-.46,z)]);
   oriented(lipRings[0],2,1,leather);
   for(let j=1;j<lipRings.length;j++)for(let i=0;i<4;i++){
    if(i===1)continue; // Interior wall is replaced by the joined solid fill.
    const next=(i+1)%4;
    oriented([lipRings[j-1][i],lipRings[j-1][next],lipRings[j][next],lipRings[j][i]],
     i%2===0?1:0,i===0?1:i===2?-1:i===1?-side:side,leather);
   }
   oriented(lipRings.at(-1),2,-1,leather);
   const fill=rearLip.map(([z,y,x,w])=>[
    point(side,x-w,y-.04,z),point(side,0,centreTop(z,y),z),
    point(side,0,centreBottom(z,y),z),point(side,x-w,y-.38,z)]);
   for(let j=1;j<fill.length;j++){
    oriented([fill[j-1][0],fill[j-1][1],fill[j][1],fill[j][0]],1,1,leather);
    oriented([fill[j-1][3],fill[j][3],fill[j][2],fill[j-1][2]],1,-1,leather);
   }
   // Split each end into two convex halves; no concave triangle-fan caps.
   oriented(fill[0],2,1,leather);oriented(fill.at(-1),2,-1,leather);
  }

  for(const side of [-1,1]){
   const skirtStart=f.length;
   // The side skirt transitions from the leather seat onto the blanket.
   // Each row is convex and has its own clear fold; no concave triangle fan.
   // Drop below the quiver before extending rearward: the new Y24.4 row
   // is world Y29.768 at scale1.22, .39 below the original quiver's bottom.
   // The high rim still ends at Z-2.2, so no transition cuts its lower edge.
   const skirt=[[2.8,24.9,-2.2,2.8],[3.2,24.4,-2.2,2.95],
    [3.6,24.2,-4.1,3.1],[5.88,21.6,-4.45,2.85],[5.98,20.8,-3.95,2.4]];
   // Connect to the actual varying seat rim, including the raised cantle.
   // A flat skirt root alone left daylight below both raised seat ends.
   const joins=[skirt[0][2],...stations.map(v=>v[0]).filter(z=>z>skirt[0][2]&&z<skirt[0][3]),skirt[0][3]],
    rim=z=>point(side,sample(stations,z,2),sample(stations,z,1)-.12,z);
   for(let j=1;j<joins.length;j++)oriented([rim(joins[j-1]),rim(joins[j]),
    point(side,2.8,24.9,joins[j]),point(side,2.8,24.9,joins[j-1])],0,side,leather);
   for(let i=1;i<skirt.length;i++){
    const a=skirt[i-1],c=skirt[i];
    const v=[point(side,a[0],a[1],a[2]),point(side,a[0],a[1],a[3]),
     point(side,c[0],c[1],c[3]),point(side,c[0],c[1],c[2])];
    oriented(v,0,side,leather);
    const inner=v.map(p=>add(p,[-side*.12,0,0]));
    oriented(inner,0,-side,leather);
    oriented([v[0],v[3],inner[3],inner[0]],2,-1,leather);
    oriented([v[1],inner[1],inner[2],v[2]],2,1,leather);
   }
   const end=skirt.at(-1),a=point(side,...end.slice(0,2),end[2]),c=point(side,...end.slice(0,2),end[3]);
   oriented([a,c,add(c,[-side*.12,0,0]),add(a,[-side*.12,0,0])],1,-1,leather);
   // Leather lies over the same moving blanket. Keep the seat/rim fixed,
   // but carry the complete broad lower flap and its thin backing with it.
   // Split at the cloth's folds so a single wide chord cannot sink through
   // the raised blue centre between correctly placed skirt corners.
   const clip=(polygon,axis,value,sign)=>{
    const result=[];
    for(let i=0;i<polygon.length;i++){
     const a=polygon[i],c=polygon[(i+1)%polygon.length],da=(a[axis]-value)*sign,dc=(c[axis]-value)*sign;
     if(da>=-1e-9)result.push(a);
     if((da<0)!==(dc<0)){const t=da/(da-dc);result.push(a.map((v,j)=>v+(c[j]-v)*t));}
    }
    return result.filter((v,i)=>Math.hypot(...v.map((n,j)=>n-result[(i+result.length-1)%result.length][j]))>1e-8);
   },cuts=[...zs.slice(1,-1).map(z=>[2,z]),[1,21.4+b],[1,24.2+b],[1,24.4+b]],
    panels=f.splice(skirtStart);
   for(const q of panels){
    let polygons=[q.v];
    for(const [axis,value]of cuts)polygons=polygons.flatMap(v=>{
     if(Math.min(...v.map(v=>v[axis]))>=value-1e-8||Math.max(...v.map(v=>v[axis]))<=value+1e-8)return [v];
     return [clip(v,axis,value,-1),clip(v,axis,value,1)].filter(v=>v.length>=3);
    });
    for(const polygon of polygons)f.push({...q,tackPart:'skirt',v:polygon.map(v=>{
     const weight=Math.max(0,Math.min(1,(24.4+b-v[1])/.2));v=[v[0],v[1],reliefZ(v[1],v[2])];
     return [v[0]+side*weight*(clothShift(side,v[1],v[2])+.08),v[1],v[2]];
    })});
   }
  }

  // A continuous broad girth under the barrel gives the saddle a real
  // attachment. Its two halves meet beneath the belly, rather than ending
  // in midair at the sides of the blue cloth.
  const girth=[[3.05,25.0],[4.4,23.6],[5.92,20.05],[5.93,16.43],
   [4.38,13.3],[1.55,11.36],[0,11.32]];
  for(const side of [-1,1]){
   for(let i=1;i<girth.length;i++){
    const a=girth[i-1],c=girth[i],z=2.2,w=.55;
    const v=[point(side,...a,z-w),point(side,...a,z+w),
     point(side,...c,z+w),point(side,...c,z-w)];
    face(f,side>0?v:v.reverse(),leather,'girth');
   }
   // One substantial buckle per side; no stitches, rivet fields or microdetail.
   box(f,point(side,6.12,20.65,2.2),[.2,1.1,1.3],gold,'tack');
   box(f,point(side,6.25,20.65,2.2),[.12,.58,.72],leather,'tack');
  }

  // Tack shares the horse's rigid central pitch. The rider balances upright
  // around the unchanged hip centre; stirrups still follow his actual feet.
  for(let i=start;i<f.length;i++){
   const q=f[i];q.v=q.v.map(v=>p.bodyPoint(q.tag==='girth'&&h.bellyPoint?h.bellyPoint(v):v));
   const a=q.v[1].map((v,k)=>v-q.v[0][k]),c=q.v[2].map((v,k)=>v-q.v[0][k]),n=[a[1]*c[2]-a[2]*c[1],a[2]*c[0]-a[0]*c[2],a[0]*c[1]-a[1]*c[0]],len=Math.hypot(...n)||1;
   q.n=n.map(v=>v/len);
  }
  // Stirrup leathers leave the saddle tree and follow the actual rider feet.
  // Rider joints are already scaled world coordinates, unlike this mesh.
  for(const leg of p.riderLegs||[]){
   const side=leg.side,end=mul(leg.end,1/scale);
   const anchor=p.bodyPoint(point(side,3.25,25.1,.6)),bend=p.bodyPoint(point(side,5.95,21.5,.5));
   // The leather reaches the inside of the stirrup, behind the greave. The
   // visible metal frame still surrounds the boot at its original position.
   const hanger=add(end,[-side*.25,.55,-.35]);
   rod(f,anchor,bend,.42,leather,'tack');
   rod(f,bend,hanger,.42,leather,'tack');
   const tread=add(end,[0,-.95,-.35]);
   rod(f,add(tread,[-1.05,0,0]),add(tread,[1.05,0,0]),.32,steel,'tack');
   for(const sign of [-1,1]){
    rod(f,add(tread,[sign*1.05,0,0]),add(tread,[sign*.7,1.8,0]),.27,steel,'tack');
   }
   rod(f,add(tread,[-.7,1.8,0]),add(tread,[.7,1.8,0]),.27,steel,'tack');
  }
 }
 window.KRMountedHorseSaddle={add:addSaddle};
})();
