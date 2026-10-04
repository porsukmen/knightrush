/* Camera-relative wrist gestures, stored as the rig's existing Y-Z-X Euler
 * offsets. No pose/schema changes, incremental accumulation or hidden roll. */
(()=>{'use strict';
 const D=Math.PI/180,dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=v=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n);};
 function rotate(v,r){const[x,y,z]=r.map(v=>v*D),cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z),a=[v[0],v[1]*cx-v[2]*sx,v[1]*sx+v[2]*cx],b=[a[0]*cz-a[1]*sz,a[0]*sz+a[1]*cz,a[2]];return[b[0]*cy+b[2]*sy,b[1],-b[0]*sy+b[2]*cy];}
 const basis=[[1,0,0],[0,1,0],[0,0,1]],matrix=r=>basis.map(v=>rotate(v,r)),apply=(m,v)=>basis.map((_,i)=>m.reduce((s,col,j)=>s+col[i]*v[j],0)),inverse=(m,v)=>m.map(col=>dot(col,v));
 function around(v,axis,angle){const c=Math.cos(angle),s=Math.sin(angle),k=dot(axis,v),q=cross(axis,v);return v.map((x,i)=>x*c+q[i]*s+axis[i]*k*(1-c));}
 function nearestEuler(m,prior){const z=Math.asin(Math.max(-1,Math.min(1,m[0][1]))),near=(x,p)=>x+360*Math.round((p-x)/360);let x,y;
  if(Math.abs(Math.cos(z))>1e-6){x=Math.atan2(-m[2][1],m[1][1]);y=Math.atan2(-m[0][2],m[0][0]);}
  else{x=prior[0]*D;y=Math.atan2(m[2][0],m[2][2])-Math.sign(z)*x;}
  const candidates=[[x,y,z],[x+Math.PI,y+Math.PI,Math.PI-z]].map(r=>r.map((v,i)=>near(v/D,prior[i])));
  candidates.sort((a,b)=>a.reduce((s,v,i)=>s+(v-prior[i])**2,0)-b.reduce((s,v,i)=>s+(v-prior[i])**2,0));return candidates[0].map(v=>Math.max(-360,Math.min(360,v)));
 }
 function axes(project,point){const p=project(point),grad=[0,1,2].map(i=>{const v=point.slice();v[i]+=.1;const q=project(v);return[(q[0]-p[0])/.1,(q[1]-p[1])/.1];}),right=unit(grad.map(v=>v[0])),downRaw=grad.map(v=>v[1]),down=unit(downRaw.map((v,i)=>v-right[i]*dot(downRaw,right)));return{right,front:unit(cross(right,down))};}
 function wrist(prior,outer,axes,dx,dy){if(dx===0&&dy===0)return prior.slice();const o=matrix(outer),r=matrix(prior),horizontal=dx*.4*D,vertical=dy*.4*D,m=r.map(v=>inverse(o,around(around(apply(o,v),axes.front,horizontal),axes.right,vertical)));return nearestEuler(m,prior);}
 window.KRGuardianAttackRotation=Object.freeze({axes,wrist});
})();
