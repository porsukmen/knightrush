/* Shared native tavern coin. Games own the toss trajectory and RNG; this only draws. */
(()=>{'use strict';
 const rim=Array.from({length:16},(_,i)=>[Math.cos(i*Math.PI/8),Math.sin(i*Math.PI/8)]);
 function draw(g,p){
  const P=(points,c)=>{g.fillStyle=c;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();};
  const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
  const L=(x,y,X,Y,w,c)=>{g.strokeStyle=c;g.lineWidth=w;g.lineCap='butt';g.beginPath();g.moveTo(x,y);g.lineTo(X,Y);g.stroke();};
  const disc=(r,c)=>{g.fillStyle=c;g.beginPath();rim.forEach(([x,y],i)=>i?g.lineTo(x*r,y*r):g.moveTo(x*r,y*r));g.closePath();g.fill();};
  g.save();g.translate(p.x+3,p.groundY+2);g.scale(p.radius*(1+p.height/170),p.radius*.32);g.globalAlpha*=.28/(1+p.height/65);disc(1,'#36210e');g.restore();
  g.save();g.translate(p.x,p.y);g.rotate(p.angle||0);g.scale(p.radius,p.radius);
  g.save();g.translate(0,.12);g.scale(1,p.tilt);disc(1,'#8f581f');g.restore();
  g.scale(1,p.tilt);disc(1,'#e6b44c');disc(.91,'#ffe194');disc(.79,'#b98430');disc(.72,'#dba94a');
  for(let i=0;i<16;i++){const [x,y]=rim[i];L(x*.86,y*.86,x*.95,y*.95,.025,i>7?'#fff0b3':'#a57229');}
  if(p.crown){
   const crown=[[-.5,-.28],[-.29,-.06],[0,-.44],[.28,-.06],[.5,-.28],[.37,.27],[-.37,.27]];
   P(crown.map(([x,y])=>[x,y+.065]),'#8d5a21');P(crown,'#ffe8a2');R(-.37,.31,.74,.10,'#f6d481');
   for(const x of [-.23,0,.23])R(x-.035,.11,.07,.08,'#a97628');
  }else{
   P([[-.29,-.48],[.26,-.48],[.41,-.18],[.41,.24],[.26,.49],[-.29,.49],[-.42,.24],[-.42,-.18]],'#885820');
   P([[-.23,-.46],[.22,-.46],[.34,-.17],[.34,.21],[.22,.43],[-.23,.43],[-.34,.21],[-.34,-.17]],'#f2d07a');
   L(-.11,-.37,-.13,.36,.035,'#a7762e');L(.11,-.37,.13,.36,.035,'#a7762e');
   L(-.34,-.22,.34,-.22,.10,'#a3742c');L(-.34,.22,.34,.22,.10,'#a3742c');
  }g.restore();
 }
 window.KRTavernCoin=Object.freeze({draw});
})();
