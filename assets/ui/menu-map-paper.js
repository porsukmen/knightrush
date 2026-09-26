/* Main-menu-only map parchment. Native Canvas planes; no image assets.
   One bounded backing surface, rebuilt only when display scale changes.
   Buttons, hit regions and all other KRUI sheets remain owned by the game. */
(()=>{
 'use strict';
 const W=480,H=252;let surface=null,scale=0,builds=0;
 function paint(g){
  const edge=[[28,18],[103,12],[145,17],[151,24],[157,16],[263,12],[326,17],[412,10],
   [440,18],[458,41],[452,84],[460,122],[452,160],[457,207],[451,227],[430,239],
   [364,236],[351,242],[360,226],[346,238],[267,243],[179,239],[91,243],[48,238],
   [22,220],[27,184],[21,153],[28,139],[19,132],[31,126],[25,113],[29,77],[21,42]];
  const path=(points,close=false)=>{g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));if(close)g.closePath();};
  const poly=(points,color)=>{path(points,true);g.fillStyle=color;g.fill();};
  const line=(points,color,width=1)=>{path(points);g.strokeStyle=color;g.lineWidth=width;g.stroke();};
  g.save();g.translate(3,6);poly(edge,'#17110e');g.restore();
  g.save();g.translate(0,2);poly(edge,'#957249');g.restore();poly(edge,'#ddc79b');
  g.save();path(edge,true);g.clip();
  poly([[18,12],[155,12],[154,244],[20,244]],'#e3cea4');
  poly([[316,12],[450,8],[461,244],[316,244]],'#d5bb8c');
  line([...edge,edge[0]],'#ba9962',5);
  line([[29,19],[103,14],[145,19]],'#f6e8c3',2);
  line([[158,18],[263,14],[326,19],[410,12]],'#f6e8c3',2);
  line([[39,63],[40,31],[139,27]],'#a78857');
  line([[43,62],[44,35],[138,31]],'#f6e8c3');
  line([[171,28],[263,24],[326,29],[411,22]],'#a78857');
  line([[39,191],[37,216],[92,230],[177,226],[269,231],[340,226]],'#a78857');
  line([[43,191],[42,213],[93,226],[177,222],[269,227],[339,222]],'#f6e8c3');
  // Cartography only on the unused margins, never behind button labels.
  g.save();g.globalAlpha=.42;
  for(const [x,y,s]of [[42,66,.75],[57,59,.6],[63,79,.45],[425,151,.7],[438,161,.5]]){
   line([[x-12*s,y+15*s],[x,y-13*s],[x+17*s,y+15*s]],'#725839');
   line([[x,y-13*s],[x+2*s,y+4*s],[x+10*s,y+15*s]],'#725839');
  }
  poly([[45,91],[49,104],[42,117],[51,130],[58,139],[54,153],[43,164],[44,181],
   [40,177],[39,162],[49,150],[51,140],[45,133],[36,118],[43,103]],'#aa8b59');
  line([[45,91],[49,104],[42,117],[51,130],[58,139],[54,153],[43,164],[44,181]],'#725839');
  for(const[x,y]of [[426,59],[437,77],[421,92],[436,108],[425,121]]){
   line([[x,y+6],[x,y-10]],'#725839');
   line([[x-6,y-1],[x,y-10],[x+6,y-1],[x+3,y-1],[x+7,y+4],[x-7,y+4],[x-3,y-1]],'#725839');
  }
  g.setLineDash([3,4]);line([[417,137],[414,155],[423,174],[433,185]],'#725839');g.setLineDash([]);
  g.translate(52,203);const ring=[];
  for(let i=0;i<8;i++){const a=i*Math.PI/4;ring.push([Math.cos(a)*12,Math.sin(a)*12]);}
  line([...ring,ring[0]],'#725839',.8);line([[-17,0],[17,0]],'#725839',.8);line([[0,-18],[0,18]],'#725839',.8);
  poly([[0,-17],[3,0],[0,14],[-3,0]],'#725839');poly([[0,-17],[0,14],[-3,0]],'#ddc79b');g.restore();
  for(const x of[155,316]){
   poly([[x-4,13],[x,17],[x-1,243],[x-4,242]],'#cbb184');
   poly([[x,17],[x+2,14],[x+2,243],[x-1,243]],'#ead6b1');
  }
  poly([[23,101],[155,104],[316,99],[458,102],[458,105],[316,102],[155,107],[23,104]],'#cfb78d');
  line([[25,106],[155,109],[316,104],[455,107]],'#ecdab7');g.restore();
  poly([[412,11],[440,18],[458,41],[452,66],[427,47]],'#a88858');
  poly([[412,11],[435,23],[453,40],[432,49],[421,28]],'#f0dfb9');
  poly([[432,49],[453,40],[447,53],[429,58]],'#c4a36c');
  line([[414,13],[436,25],[452,40]],'#fff0cd',1.5);
  poly([[22,220],[48,231],[64,241],[47,237]],'#b08d58');
  poly([[22,220],[38,204],[40,223],[64,241],[45,231]],'#efddb5');
  poly([[420,216],[435,221],[433,239],[426,234],[420,238]],'#725039');
  const seal=[[416,203],[426,198],[437,201],[444,210],[442,222],[432,228],[421,225],[413,216]];
  g.save();g.translate(1,2);poly(seal,'#725039');g.restore();poly(seal,'#8d5538');
  poly([[419,206],[427,202],[436,205],[440,212],[436,222],[425,222],[418,215]],'#a16b46');
  line([[419,210],[424,205],[433,206]],'#c08a58');
  poly([[429,207],[434,213],[429,219],[424,213]],'#70462f');
 }
 function draw(g,y){
  const next=Math.min(2,Math.max(1,Math.abs(g.getTransform().a)));
  if(!surface||scale!==next){
   surface??=document.createElement('canvas');scale=next;
   surface.width=Math.ceil(W*scale);surface.height=Math.ceil(H*scale);
   const c=surface.getContext('2d');c.setTransform(scale,0,0,scale,0,0);paint(c);builds++;
  }
  g.drawImage(surface,0,y,W,H);
 }
 window.KRMenuMapPaper=Object.freeze({draw,report:()=>({builds,bytes:surface?surface.width*surface.height*4:0})});
})();
