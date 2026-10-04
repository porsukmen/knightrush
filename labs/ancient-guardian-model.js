/* New, idle-only sculpture. No previous boss mesh, rig or motion is used.
 * Authored planar colours, orthographic depth, native Jonathan GPU backend.
 * Y points down; the front is -Z. Anatomical left is -X (screen-right).
 */
(()=>{'use strict';
const faces=[],parts={},stone={front:'#999989',side:'#747969',back:'#858a76',top:'#b1af99'},dark={front:'#777e6b',side:'#5e6858',back:'#717b65',top:'#969c80'};
let name='body',seed=97131;
const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const add=(v,col,normal,layer=0)=>{const f={v,col,normal,layer,part:name};faces.push(f);(parts[name]??=[]).push(f);return f;};
const cross=(a,b,c)=>{const u=b.map((x,i)=>x-a[i]),v=c.map((x,i)=>x-a[i]);return [u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];};
const area=p=>p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-b[0]*a[1];},0)/2;
const wedge=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function triangles(poly){const p=poly.map(v=>v.slice()).filter((v,i,a)=>i===0||Math.hypot(v[0]-a[i-1][0],v[1]-a[i-1][1])>1e-7);if(p.length>2&&Math.hypot(p[0][0]-p.at(-1)[0],p[0][1]-p.at(-1)[1])<1e-7)p.pop();for(let i=p.length-1;i>=0&&p.length>3;i--)if(Math.abs(wedge(p[(i+p.length-1)%p.length],p[i],p[(i+1)%p.length]))<1e-8)p.splice(i,1);if(area(p)<0)p.reverse();const out=[];let guard=0;while(p.length>3&&guard++<500){let found=false;for(let i=0;i<p.length;i++){const a=p[(i+p.length-1)%p.length],b=p[i],c=p[(i+1)%p.length];if(wedge(a,b,c)<=1e-9)continue;if(p.some(q=>q!==a&&q!==b&&q!==c&&wedge(a,b,q)>=-1e-8&&wedge(b,c,q)>=-1e-8&&wedge(c,a,q)>=-1e-8))continue;out.push([a,b,c]);p.splice(i,1);found=true;break;}if(!found)break;}if(p.length===3&&Math.abs(wedge(...p))>1e-9)out.push(p);return out;}
function plane(poly,z,col,front=true,layer=1){for(const t of triangles(poly))add(t.map(([x,y])=>[x,y,z]),col,[0,0,front?-1:1],layer);}
function solid(poly,front,back,m=stone){let p=poly.slice();if(area(p)<0)p.reverse();plane(p,front,m.front,true,0);plane(p,back,m.back,false,0);for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],n=[b[1]-a[1],a[0]-b[0],0];add([[...a,front],[...b,front],[...b,back],[...a,back]],n[1]<-.2?m.top:m.side,n);}}
function rect(x,y,w,h,z,col,front=true){plane([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],z,col,front);}
function block(x,y,w,h,f,b,m=stone,c=.8){solid([[x+c,y],[x+w-c,y],[x+w,y+c],[x+w,y+h-c],[x+w-c,y+h],[x+c,y+h],[x,y+h-c],[x,y+c]],f,b,m);}
// Sculpted cross-sections: chest, calf, jaw and mantle have their own profile.
// Outward normals are derived from the volume, not from a front/back extrusion.
function skin(rings,cols){const center=(a,b)=>[...a,...b].reduce((s,p)=>s.map((v,i)=>v+p[i]/(a.length+b.length)),[0,0,0]);
 const face=(v,col,inside)=>{let n=cross(v[0],v[1],v[2]);const mid=v.reduce((s,p)=>s.map((x,i)=>x+p[i]/v.length),[0,0,0]);if(n.reduce((s,x,i)=>s+x*(mid[i]-inside[i]),0)<0)n=n.map(x=>-x);add(v,col,n);};
 for(let j=1;j<rings.length;j++)for(let i=0;i<rings[j].length;i++){const k=(i+1)%rings[j].length;face([rings[j-1][i],rings[j-1][k],rings[j][k],rings[j][i]],cols[i%cols.length],center(rings[j-1],rings[j]));}
 face(rings[0],stone.top,center(rings[0],rings[1]));face(rings.at(-1),stone.side,center(rings.at(-2),rings.at(-1)));
}
function sections(rows,cx=0,cols=['#999989','#8c917c','#7b8470','#7b8470','#858a76','#828a75','#87907a','#a2a38c']){skin(rows.map(([y,w,f,b])=>[[cx-w*.72,y,f],[cx+w*.72,y,f],[cx+w,y,f+(b-f)*.3],[cx+w,y,b-(b-f)*.25],[cx+w*.7,y,b],[cx-w*.7,y,b],[cx-w,y,b-(b-f)*.25],[cx-w,y,f+(b-f)*.3]]),cols);}
function profile(rows,y){let i=1;while(i<rows.length-1&&y>rows[i][0])i++;const a=rows[i-1],b=rows[i],t=Math.max(0,Math.min(1,(y-a[0])/(b[0]-a[0])));return a.map((v,k)=>v+(b[k]-v)*t);}
function attachFront(rows,baseZ){for(const f of parts[name]||[]){if(!f.layer||f.normal[2]!==-1)continue;f.v=f.v.map(([x,y,z])=>{const [,w,front,back]=profile(rows,y),side=Math.max(0,Math.min(1,(Math.abs(x)-w*.72)/(w*.28)));return [x,y,front+(back-front)*.3*side+(z-baseZ)];});}}
// Every weather mark is attached to a real face. No camera-facing noise,
// animated shader, glossy light, blue rune, or turn-dependent texture switching.
function weather(list,density=1){for(const f of list){if(f.layer||Math.abs(f.normal[1])>50)continue;const a=f.v[0],b=f.v[1],c=f.v[2],n=f.normal,len=Math.hypot(...n);if(len<1e-8)continue;const norm=n.map(v=>v/len),size=Math.hypot(...cross(a,b,c))/2;
 const count=Math.min(70,Math.floor(size*.16*density));for(let j=0;j<count;j++){let u=rnd(),v=rnd();if(u+v>1){u=1-u;v=1-v;}if(u<.08||v<.08||u+v>.92)continue;const q=a.map((x,i)=>x+(b[i]-x)*u+(c[i]-x)*v+norm[i]*.022);
 const moss=rnd()<.64,col=moss?['#536445','#63754c','#788453','#89935e'][Math.floor(rnd()*4)]:['#878b78','#a4a38c','#6e7665'][Math.floor(rnd()*3)];
 const ab=b.map((x,i)=>x-a[i]),edgeLength=Math.hypot(...ab),e=ab.map(x=>x/edgeLength),t=[norm[1]*e[2]-norm[2]*e[1],norm[2]*e[0]-norm[0]*e[2],norm[0]*e[1]-norm[1]*e[0]],margin=Math.min(...[[a,b],[b,c],[c,a]].map(([p,r])=>Math.hypot(...cross(p,r,q))/Math.hypot(...p.map((x,i)=>r[i]-x)))),s=Math.min(.18+rnd()*.6,margin*.65);if(s<.06)continue;
 const da=e.map(x=>x*s),db=t.map(x=>x*s);
 add([q.map((x,i)=>x-da[i]-db[i]*.2),q.map((x,i)=>x+da[i]*.8-db[i]*.4),q.map((x,i)=>x+da[i]*.55+db[i]*.8),q.map((x,i)=>x-da[i]*.7+db[i]*.7)],col,n,2);
 }} }
function moss(poly,z,front=true){const edge=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];edge.push(a,[a[0]+(b[0]-a[0])*.38+.25,a[1]+(b[1]-a[1])*.38-.35],[a[0]+(b[0]-a[0])*.68-.22,a[1]+(b[1]-a[1])*.68+.25]);}plane(edge,z,'#687c4d',front,3);const cx=poly.reduce((s,p)=>s+p[0],0)/poly.length,cy=poly.reduce((s,p)=>s+p[1],0)/poly.length;for(let i=0;i<poly.length-1;i+=2){const a=poly[i],b=poly[i+1];plane([[cx,cy],[cx+(a[0]-cx)*.9,cy+(a[1]-cy)*.9],[cx+(b[0]-cx)*.7,cy+(b[1]-cy)*.7]],z+(front?-.025:.025),i%4?'#829059':'#758953',front,4);}}
function cut(points,z,width=.18,col='#5f6757',front=true){for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy),x=-dy/l*width,y=dx/l*width;plane([[a[0]+x,a[1]+y],[b[0]+x,b[1]+y],[b[0]-x,b[1]-y],[a[0]-x,a[1]-y]],z,col,front,5);}}
name='stone-cape';
// A carved mantle rests on the back, then sweeps away from calves and heels.
// Its solid folds follow that curve; it is neither a board nor animated cloth.
const capeXs=[-19,-11,-3,5,13,19],capeFold=[0,1.2,.5,1.5,.7,0],hem=[-7,-4,-6,-3,-8,-10],capeRows=[[-76,.77,4.8],[-70,.83,6.2],[-57,.9,7],[-37,.97,8.5],[-19,1.03,10.5]];
for(let i=0;i<5;i++){const rows=[...capeRows,[(hem[i]+hem[i+1])/2,1.08,12.4]],a=capeXs[i],b=capeXs[i+1];skin(rows.map(([y,s,z],j)=>[[a*s,j===rows.length-1?hem[i]:y,z+capeFold[i]],[b*s,j===rows.length-1?hem[i+1]:y,z+capeFold[i+1]],[b*s,j===rows.length-1?hem[i+1]:y,z+capeFold[i+1]+1.8],[a*s,j===rows.length-1?hem[i]:y,z+capeFold[i]+1.8]]),['#747e68','#78816a',i%2?'#858c73':'#92967e','#7a846c']);
 const at=parts[name].length;cut([[a*.77+.8,-74],[a*.88+.8,-56],[a*1.02+.8,-20],[a*1.06,hem[i]-1]],0,.22,'#69765e',false);moss([[a*.78,-75],[b*.78,-75],[b*.85,-65],[a*.85+2,-61],[a*.83,-67]],.025,false);
 for(const f of parts[name].slice(at))f.v=f.v.map(([x,y,z])=>{const [,s,d]=profile(rows,y),u=Math.max(0,Math.min(1,(x/s-a)/(b-a)));return [x,y,d+capeFold[i]*(1-u)+capeFold[i+1]*u+1.84+z];});}
name='legs';
// Raised knee landmark; ankle/ground positions and the upright stance stay fixed.
const kneeY=-26,shinRows=[[kneeY,3.2,-4,2.3],[-21,3.35,-3.7,4.2],[-16,3.15,-3,4.8],[-8,2.65,-2.4,3.4],[-4,2.5,-2.4,2.9],[-2,2.5,-2.7,2.5]];
for(const side of [-1,1]){const x=side<0?-10:3,cx=x+3.5;
 sections([[-43,3.8,-3.2,4.2],[-35.5,3.7,-3.5,4.7],[-29,3.05,-3.7,2.8],[kneeY,3.2,-4,2.3]],cx);
 sections(shinRows,cx);sections([[-4,2.7,-3.5,2.6],[-2,3.8,-6.3,3],[0,3.8,-6.6,3]],cx);
 const start=parts[name].length;cut([[x+5,-22],[x+3,-19],[x+4,-17]],0);
 for(const f of parts[name].slice(start))f.v=f.v.map(([xx,yy])=>[xx,yy,profile(shinRows,yy)[2]-.04]);
 moss([[x+1,-2.5],[x+4,-2.5],[x+6.8,-1.5],[x+6.8,0],[x+.5,0]],-6.7);}
name='waist';
solid([[-11,-52],[11,-52],[12,-38],[8,-36],[1.5,-38],[0,-44],[-2,-38],[-12,-37]],-4.8,4.5,dark);
for(const side of [-1,1]){const x=side<0?-11:1;solid([[x,-48],[x+9,-48],[x+10,-38],[x+3,-39],[x,-38]],-5.1,-4.7,stone);rect(x+1,-47,7,.6,-5.15,'#b1ad91');}
name='torso';
const torsoRows=[[-77,12.8,-4.2,3.5],[-71,15,-6.9,5.5],[-64,13.9,-6.7,5],[-57,11.9,-5.6,4],[-50,9,-4.5,3.5]];
sections(torsoRows);
sections([[-79,6.2,-2.5,3],[-77,12.9,-4.4,3.8],[-74.5,13.7,-5.9,4.5]],0,['#90947f','#858c76','#76826b','#77816c','#879078','#7d886f','#8c947c','#a5a58d']);
rect(-8,-52,16,2,-5.0,'#707861');rect(-8,-52,16,.4,-5.03,'#bab399');
// Shallow carved civilization motif. No luminous outline.
cut([[-9,-69],[-5,-69],[-5,-61],[0,-57],[5,-61],[5,-69],[9,-69]],-4.91,.25,'#7f846f');
cut([[-2,-70],[0,-72],[2,-70],[2,-64],[0,-62],[-2,-64],[-2,-70]],-4.94,.17,'#7c826d');
moss([[-13,-76],[-8,-76],[-9,-70],[-7,-68],[-10,-65],[-13,-67],[-14,-71]],-4.96);
moss([[6,-58],[10,-61],[11,-57],[9,-51],[5,-51],[4,-54]],-4.96);
cut([[8,-76],[7,-72],[9,-69],[8,-66]],-5.44,.2);
attachFront(torsoRows,-4.8);
name='broken-right-arm';
// Anatomical right: only a chipped shoulder stump remains, no hidden forearm.
solid([[12,-76],[17,-75],[20,-71],[18,-67],[16,-68],[14,-66],[12,-69]],-3.8,3.8,dark);
plane([[13,-73],[17,-73],[19,-70],[17,-68],[16,-70],[14,-68]],-3.86,'#aaa38a');
moss([[12,-76],[17,-75],[18,-73],[15,-72],[14,-70],[12,-71]],-3.9);
name='left-shoulder';
solid([[-12,-77],[-18,-78],[-22,-74],[-22,-69],[-18,-67],[-13,-70]],-4.7,4.1);
name='left-upper-arm';
sections([[-70,3.2,-3.8,3.2],[-64,3.7,-4.1,3.7],[-58,3.4,-3.6,2.9],[-54,2.8,-3.4,2]],-18.9);
// Full octagonal forearm: matching, perpendicular cross-sections do not twist
// or collapse into a diagonal ribbon in profile. Broad elbow -> palm-sized wrist.
name='left-forearm';
const elbow=[-19,-55.7,-1.5],wrist=[-2.8,-63.5,-13.5],axis=wrist.map((v,i)=>v-elbow[i]),length=Math.hypot(...axis),t=axis.map(v=>v/length),u=[-t[1],t[0],0],ul=Math.hypot(...u);for(let i=0;i<3;i++)u[i]/=ul;const v=[t[1]*u[2]-t[2]*u[1],t[2]*u[0]-t[0]*u[2],t[0]*u[1]-t[1]*u[0]];
skin([[0,3.1],[.26,3.9],[.65,3.3],[1,2.35]].map(([q,r])=>Array.from({length:8},(_,i)=>{const a=(i+.5)*Math.PI/4;return elbow.map((n,k)=>n+axis[k]*q+r*(u[k]*Math.cos(a)+v[k]*Math.sin(a)));})),['#969b83','#a5a68d','#a6a78e','#929a80','#828d72','#79846d','#818d72','#939b80']);
name='left-shoulder';
moss([[-21,-74],[-18,-76],[-14,-74],[-15,-71],[-19,-71],[-20,-68],[-22,-69]],-4.76);
name='neck';sections([[-83,3,-1.8,2.7],[-80,3.25,-2,3],[-76,4.8,-3,3.8]],0,['#808772','#77816b','#747e68','#78816d','#828a72','#77816b','#7d876f','#979b80']);
name='head';
const headRows=[[-92,5.6,-3.8,3.1],[-89.4,6.25,-4.4,4.6],[-85.2,6.25,-4.5,5.1],[-81,5.7,-4.15,3.8],[-78.1,4.3,-4.55,2.4],[-77.3,3.5,-4.45,1.8]];
sections(headRows);
// Upright, watchful carved eyes under a level brow, a firm jaw and closed mouth.
// No pupils or tired drooping lids: these are recessed stone sockets.
for(const side of [-1,1]){const P=p=>p.map(([x,y])=>[x*side,y]);
 plane(P([[1.2,-88],[4.35,-88.1],[4,-87.05],[1.45,-87.0]]),-4.1,'#626e5b');
 plane(P([[1.5,-87.85],[4,-87.95],[3.75,-87.5],[1.6,-87.45]]),-4.13,'#949b82');
 plane(P([[.85,-89.1],[4.7,-89.2],[4.55,-88.4],[1.05,-88.35]]),-4.38,'#b0ae93');
 plane(P([[1.7,-85.8],[4.6,-86.1],[4.1,-83.5],[2.4,-82.9]]),-4.08,'#a5a58c');}
cut([[-1.7,-80.85],[1.7,-80.85]],-4.16,.12,'#65705c');rect(-1.25,-80.5,2.5,.27,-4.12,'#b0ad92');
cut([[4.9,-91],[4.3,-89.9],[4.7,-89]],-4.12,.12);
moss([[-5.5,-91],[-3.5,-92],[-3.8,-90.4],[-5,-89.7],[-5.8,-88.2]],-4.13);
attachFront(headRows,-4);
// The nose is sculpted in side view too, with a bridge, tip and undercut.
const noseL=[[-.7,-88.5,-4.65],[-1.15,-83.8,-4.55],[-.85,-83.1,-4.35]],noseR=noseL.map(([x,y,z])=>[-x,y,z]),ridgeTop=[0,-88.6,-5],tip=[0,-84,-6.9],base=[0,-83.25,-5.4];
for(const [s,ridge,col]of [[noseL,[ridgeTop,tip,base],'#a7a68e'],[noseR,[ridgeTop,tip,base],'#858e76']])for(let i=0;i<2;i++){const q=[s[i],s[i+1],ridge[i+1],ridge[i]];let n=cross(...q.slice(0,3));if(n[2]>0)n=n.map(x=>-x);add(q,col,n);}add([noseL[2],noseR[2],base],'#737e67',[0,1,-1]);
name='crown';
// Fitted circlet: an open octagonal band follows the skull, rather than a
// broad shelf hovering over it. Its lower edge overlaps the crown of the head.
const crownRing=[[-4.2,-4.15],[4.2,-4.15],[5.85,-2],[5.85,1.8],[4.1,3.55],[-4.1,3.55],[-5.85,1.8],[-5.85,-2]],crownTop=-93.1,crownBottom=-91.5;
for(let i=0;i<crownRing.length;i++){const a=crownRing[i],b=crownRing[(i+1)%crownRing.length],ia=a.map(v=>v*.89),ib=b.map(v=>v*.89),n=[b[1]-a[1],0,a[0]-b[0]],P=(p,y)=>[p[0],y,p[1]];
 add([P(a,crownTop),P(b,crownTop),P(b,crownBottom),P(a,crownBottom)],i===0?'#a1a187':'#899278',n);
 add([P(ia,crownTop),P(ib,crownTop),P(ib,crownBottom),P(ia,crownBottom)],'#717d65',n.map(v=>-v));
 add([P(a,crownTop),P(b,crownTop),P(ib,crownTop),P(ia,crownTop)],'#b6b294',[0,-1,0]);}
for(const x of [-3.35,0,3.35]){const h=x===0?2.8:2.15;solid([[x-.8,crownTop],[x-.7,crownTop-h+.6],[x,crownTop-h],[x+.7,crownTop-h+.6],[x+.8,crownTop]],-4.12,-3.56,{front:'#a4a48a',side:'#7c876e',back:'#899278',top:'#b9b398'});}
for(const x of [-3.1,3.1])solid([[x-.65,crownTop],[x-.6,crownTop-1.45],[x,crownTop-2],[x+.6,crownTop-1.45],[x+.65,crownTop]],2.95,3.5,dark);
for(const x of [-5.75,5.75])block(x-.25,-95,.5,2,-.8,.7,dark,.16);
moss([[-4.1,-93],[-2.1,-93],[-2.5,-92.2],[-3.5,-91.6],[-4.2,-92]],-4.19);
// Capture the event's actual vector sword. This is a geometry adapter, not
// a redraw: every hilt, ruby, bevel and blade coordinate comes from draw().
function swordPolygons(){const polygons=[],stack=[];let sx=1,sy=1,tx=0,ty=0,path=[],clip=null;const map=p=>[p[0]*sx+tx,p[1]*sy+ty];const record=p=>polygons.push({p:p.map(map),col:ctx.fillStyle,clip:clip?.map(q=>q.slice())});const ctx={fillStyle:'#000000',save(){stack.push({sx,sy,tx,ty,clip});},restore(){({sx,sy,tx,ty,clip}=stack.pop());},translate(x,y){tx+=x*sx;ty+=y*sy;},scale(x,y){sx*=x;sy*=y;},beginPath(){path=[];},moveTo(x,y){path.push([x,y]);},lineTo(x,y){path.push([x,y]);},closePath(){},fill(){record(path);},fillRect(x,y,w,h){record([[x,y],[x+w,y],[x+w,y+h],[x,y+h]]);},clip(){clip=path.map(map);}};KROathSwordArt.draw(ctx,0,0,1,'decayed','shrine');return polygons;}
function intersection(poly,clip){let out=poly;for(let i=0;i<clip.length&&out.length;i++){const a=clip[i],b=clip[(i+1)%clip.length],input=out;out=[];for(let j=0;j<input.length;j++){const p=input[j],q=input[(j+1)%input.length],wp=wedge(a,b,p),wq=wedge(a,b,q);if(wp>=-1e-8)out.push(p);if((wp>=0)!==(wq>=0)){const t=wp/(wp-wq);out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}}}return out;}
const swordArt=swordPolygons();
const stoneSwordPalette={'#d5e1e5':'#989d86','#fff7e4':'#b7b59b','#859eae':'#707d68','#edf4f7':'#a9b095','#f2bf38':'#9a9b7e','#ffe99a':'#b9b493','#b77824':'#737c62','#e5a42b':'#898f73','#ac691f':'#66745c','#e73542':'#60704c','#ff8980':'#85915d','#961c39':'#4f6144','#765443':'#566c46','#a77950':'#7b8654'};
function sword(scale,y,z,stoneVersion){
 const palette=KROathSwordArt.palettes.shrine,colour=c=>stoneVersion?stoneSwordPalette[c]||'#89917a':c;
 const classify=s=>{if(s.clip)return 'blade';if([palette.gem,palette.gemLit,palette.gemSide].includes(s.col))return 'gem';const xs=s.p.map(p=>Math.abs(p[0])),ys=s.p.map(p=>p[1]);if(Math.max(...ys)<=-54)return 'pommel';if(Math.max(...xs)>13.01)return 'guard';if(Math.max(...ys)<=-12&&Math.max(...xs)<=7.01)return 'grip';return 'socket';};
 // The authored front drawing is retained. Only the physical depth changes:
 // a double bevel and tapered point, octagonal grip, thick pommel, swept guard,
 // socket and raised stone/ruby. Decorative paint is not extruded into slabs.
 const depth=(type,x,yy)=>{const a=Math.abs(x);if(type==='blade')return (.55+4.05*(1-Math.min(1,a/13)))*Math.max(0,Math.min(1,(184.5-yy)/27.06));
  if(type==='grip')return 6.2-Math.max(0,a-3)*.8;
  if(type==='pommel')return 9.5-Math.max(0,a-5)*.75-Math.max(0,-71-yy)*.42;
  // Thickness hierarchy: blade ridge 4.6 < guard 5.51–6.3 < setting 6.35.
  // A slightly prouder gem: 1.77 at the center, with its rim still seated.
  if(type==='guard')return 6.3-Math.min(44,a)*.018;
  const socket=6.35-Math.max(0,a-7)*.09;
  if(type==='gem')return socket+.12+1.65*Math.max(0,1-a/8-Math.abs(yy+11)/13);
  return socket;};
 const project=(p,type,side,offset=0)=>[p[0]*scale,y+p[1]*scale,z+side*(depth(type,...p)*scale+offset)];
 const surface=(poly,type,col,layer=0)=>{
  // Split across the bevel ridge and tip shoulder. Each triangle stays on the
  // actual surface through a full turn, including rust and painted blade edges.
  const xs=type==='blade'?[-50,-13,0,13,50]:type==='gem'?[-50,-8,0,8,50]:[-50,-7,-3,0,3,7,50],ys=type==='blade'?[-90,0,157.44,184.5,200]:type==='gem'?[-90,-23,-11,2,200]:[-90,-71,-54,-34,-12,12,200];
  for(const tri of triangles(poly))for(let xi=1;xi<xs.length;xi++)for(let yi=1;yi<ys.length;yi++){
   const cell=[[xs[xi-1],ys[yi-1]],[xs[xi],ys[yi-1]],[xs[xi],ys[yi]],[xs[xi-1],ys[yi]]],p=intersection(tri,cell);
   for(const t of triangles(p))for(const side of [-1,1]){const v=t.map(q=>project(q,type,side,layer*.0005)),n=cross(...v);if(Math.hypot(...n)<1e-9)continue;add(v,col,n[2]*side<0?n.map(a=>-a):n,layer);}
  }
 };
 const body=(poly,type,col)=>{surface(poly,type,col);let p=poly.slice();if(area(p)<0)p.reverse();for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],v=[project(a,type,-1),project(b,type,-1),project(b,type,1),project(a,type,1)],n=[b[1]-a[1],a[0]-b[0],0];add(v,type==='blade'?colour(palette.steelSide):colour(palette.hiltSide),n);}};
 const built=new Set();
 for(let index=0;index<swordArt.length;index++){const s=swordArt[index],type=classify(s),col=colour(s.col),key=type==='guard'?type+Math.sign(s.p[0][0]):type;
  if(!built.has(key)){body(type==='blade'?s.clip:s.p,type,col);built.add(key);}
  let polygons=[s.p];if(s.clip){polygons=[];for(const t of triangles(s.clip)){const p=intersection(s.p,t);if(p.length>2)polygons.push(p);}}
  for(const p of polygons)surface(p,type,col,index+2);
 }
}
name='great-stone-sword';const swordScale=.24,swordGuard=-150*1.23*swordScale;sword(swordScale,swordGuard,-13.5,true);
// Native sword rust becomes stone moss, already wrapped onto the bevel above.
name='left-hand';
// Palm covers the pommel from above. Fingers bend down its front face.
block(-3.4,-65,7,2.4,-16.4,-11.8,stone,.55);
for(let i=0;i<4;i++)block(-2.8+i*1.4,-63.6,1.24,3.5,-16.6,-14.6,stone,.25);
block(-3.8,-63.6,1.8,3,-14.1,-11.7,dark,.4);
moss([[-3.2,-65],[.8,-65],[1.8,-63.8],[-.3,-62.8],[-3.2,-63.4]],-16.65);
// Event scale .52 beside a 2.2x native knight. The captured reference is 413px
// high at 3.6x; in this lab it is 150px high, with 4.7px per guardian unit.
// Sword event: guard y=373, boulder occlusion y=389, sword scale=.52.
// Start at that exposure, then lift 2.35 units for the requested visible ruby
// above the fitted crown's middle point. Most of the blade remains embedded.
const headSwordScale=.52*(150/(413*2.2/3.6))/4.7,headSwordEntryY=-92,
 headSwordExposedBlade=(389-373)/.52,headSwordLift=2.35,headSwordGuardY=headSwordEntryY-headSwordExposedBlade*headSwordScale-headSwordLift,
 headSwordTipY=headSwordGuardY+184.5*headSwordScale;
name='embedded-event-sword';sword(headSwordScale,headSwordGuardY,0,false);
// Weather the stone, not the golden quest sword. Freeze once: no frame noise.
for(const key of Object.keys(parts)){if(key==='embedded-event-sword')continue;name=key;weather(parts[key].slice(),key==='stone-cape'?2.5:key==='head'?.2:1.4);}
const meshes={sword:faces};
window.KRAncientGuardian=Object.freeze({meshes,parts,create:()=>KRGearGPU.create(meshes,()=>{},{depthShear:.09}),metadata:Object.freeze({pose:'upright-idle',rightArm:'broken-stump',leftHand:[0,-63,-14],swordPommel:[0,swordGuard-77*swordScale,-13.5],swordTip:[0,0,-13.5],feetY:0,headSword:'KROathSwordArt.draw / decayed',headSwordScale,headSwordTipY,headSwordEntryY,headSwordGuardY,headSwordExposedBlade,headSwordLift,swordProfile:'bevel / faceted grip / swept guard / pommel',forearmRadii:[3.1,3.9,3.3,2.35],profile:'sculpted-cross-sections',bodyHeight:99,includesAnimation:false})});
})();
