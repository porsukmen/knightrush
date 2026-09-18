// Convert the user's green markup to code-native paths, preserving gaps/branches.
const {createCanvas,loadImage}=require(process.env.KNIGHT_CANVAS_MODULE||'@napi-rs/canvas');
const simplify=(p,e=1.4)=>{
 if(p.length<3)return p;const a=p[0],b=p[p.length-1],dx=b[0]-a[0],dy=b[1]-a[1],ll=dx*dx+dy*dy;
 let best=e*e,at=-1;
 for(let i=1;i<p.length-1;i++){const t=ll?Math.max(0,Math.min(1,((p[i][0]-a[0])*dx+(p[i][1]-a[1])*dy)/ll)):0;
 const d=(p[i][0]-a[0]-dx*t)**2+(p[i][1]-a[1]-dy*t)**2;if(d>best){best=d;at=i;}}
 return at<0?[a,b]:simplify(p.slice(0,at+1),e).slice(0,-1).concat(simplify(p.slice(at),e));
};
(async()=>{
 const im=await loadImage('C:/Users/Altar/Desktop/sarmasik.png');
 if(im.width!==3072||im.height!==2400)throw Error('Unexpected template dimensions');
 const c=createCanvas(im.width,im.height),g=c.getContext('2d');g.drawImage(im,0,0);
 const heights=[1,1,1,1,1,1,.66,1,.7,.84,1,.85],result=[];
 for(let model=0;model<12;model++){
  const W=768,H=800,ox=model%4*W,oy=Math.floor(model/4)*H,
    rgba=g.getImageData(ox,oy,W,H).data,m=new Uint8Array(W*H),active=[];
  for(let p=0;p<m.length;p++){const r=rgba[p*4],gr=rgba[p*4+1],b=rgba[p*4+2];
   if(gr>80&&gr-r>18&&gr-b>24){m[p]=1;active.push(p);}}
  const offsets=[-W,1-W,1,W+1,W,W-1,-1,-W-1];
  let changed=true;
  while(changed){changed=false;for(let phase=0;phase<2;phase++){
   const remove=[];for(const p of active){if(!m[p]||p<W||p>=W*(H-1)||p%W===0||p%W===W-1)continue;
    const n=offsets.map(o=>m[p+o]),count=n.reduce((a,b)=>a+b,0);
    if(count<2||count>6)continue;let transitions=0;for(let i=0;i<8;i++)if(!n[i]&&n[(i+1)%8])transitions++;
    if(transitions!==1)continue;
    if(phase===0?(n[0]*n[2]*n[4]||n[2]*n[4]*n[6]):(n[0]*n[2]*n[6]||n[0]*n[4]*n[6]))continue;
    remove.push(p);
   }for(const p of remove)m[p]=0;if(remove.length)changed=true;
  }}
  const nodes=active.filter(p=>m[p]),neighbors=p=>offsets.filter((o,i)=>{
    if(i%2&& (m[p+offsets[(i+7)%8]]||m[p+offsets[(i+1)%8]]))return false;
    return p+o>=0&&p+o<m.length&&m[p+o];}).map(o=>p+o),
    seen=new Set(),key=(a,b)=>a<b?a+':'+b:b+':'+a,paths=[];
  function walk(a,b){const path=[a];let prev=a,cur=b;seen.add(key(a,b));
   while(true){path.push(cur);const ns=neighbors(cur);if(ns.length!==2)break;
    const next=ns.find(n=>n!==prev);if(seen.has(key(cur,next)))break;seen.add(key(cur,next));prev=cur;cur=next;}
   if(path.length>=3)paths.push(simplify(path.map(p=>[p%W,Math.floor(p/W)])));
  }
  for(const p of nodes)if(neighbors(p).length!==2)for(const q of neighbors(p))if(!seen.has(key(p,q)))walk(p,q);
  for(const p of nodes)for(const q of neighbors(p))if(!seen.has(key(p,q)))walk(p,q);
  result.push(paths.map(path=>path.map(([x,y])=>[Math.round((x/.75-512)*10)/10,Math.round(((y-100)/.75-750)/heights[model]*10)/10])));
 }
 console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1});
