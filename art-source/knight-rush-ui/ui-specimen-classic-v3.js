/* Classic UI v3 specimen, explicitly captured 2026-09-28 for UILab.
 * Explicit user-approved revision: seated selection, diamond, muted upper light.
 * Independent of production. Do not auto-sync future changes. */
(function(root){
 'use strict';
 const semantic=Object.freeze({success:'#9cdb99',danger:'#ffac94',focus:'#fff3bf',warning:'#f4d17a'});
 // Treasure is the sole approved UI anchor; old venue IDs are aliases only.
 const base=Object.freeze({label:'Treasure · Classic',ink:'#493323',paper:'#e8d6ab',sheet:'#ddc79b',light:'#fff0cd',edge:'#a8824a',muted:'#b2a185',mutedInk:'#514333',accent:'#f2d37c',onDark:'#f5dfad',soft:'#ead6b1',paperSoft:'#725839',dark:'#30241e',panel:'#443322',shadow:'#1f1713'});
 const themes=Object.freeze(Object.fromEntries(['treasure','forest','tavern','court','forge','caravan','crimson','disco'].map(k=>[k,base])));
 const theme=()=>base;
 function shape(g,r,color,cut=6){const{x,y,w,h}=r,c=Math.min(cut,w/4,h/4);g.fillStyle=color;g.beginPath();g.moveTo(x+c,y);g.lineTo(x+w-c,y);g.lineTo(x+w,y+c);g.lineTo(x+w,y+h-c);g.lineTo(x+w-c,y+h);g.lineTo(x+c,y+h);g.lineTo(x,y+h-c);g.lineTo(x,y+c);g.closePath();g.fill();}
 function text(g,label,x,y,size=13,color=base.ink,maxWidth=420){
  g.save();g.fillStyle=color;g.textAlign='center';g.textBaseline='alphabetic';
  let font=size;g.font='bold '+font+'px monospace';
  while(font>9&&g.measureText(String(label)).width>maxWidth)g.font='bold '+(--font)+'px monospace';
  g.fillText(String(label),x,y,maxWidth);g.restore();
 }
 function panel(g,r,id='forest',options={}){
  if(options.light){sheet(g,r,id);return;}
  const p=theme(id);g.save();shape(g,{...r,y:r.y+4},p.shadow);shape(g,r,p.panel);
  g.fillStyle=options.light?p.light:p.edge;g.fillRect(r.x+9,r.y+3,Math.max(0,r.w-18),2);
  g.fillStyle=p.edge;g.fillRect(r.x+9,r.y+r.h-3,Math.max(0,r.w-18),1);g.restore();
 }
 function sheet(g,r,id='treasure'){
  const p=theme(id),{x,y,w,h}=r,c=Math.min(12,h/4,w/8);g.save();
  shape(g,{...r,y:y+4},p.shadow,c);
  shape(g,r,p.sheet,c);
  // The standalone matching-edges trial: mirror the original upper rule and
  // two small diamond dots. Content stays at least 28 units inside both ends.
  for(const bottom of [false,true]){
   g.save();if(bottom){g.translate(0,2*y+h);g.scale(1,-1);}
   g.fillStyle='#f6e8c3';g.fillRect(x+8,y+12,Math.max(0,w-16),3);
   g.fillStyle='#a78857';g.fillRect(x+8,y+20,Math.max(0,w-16),1);
   for(const a of [x+18,x+w-18]){g.fillStyle='#a07840';g.beginPath();g.moveTo(a,y+9);g.lineTo(a+4,y+13);g.lineTo(a,y+17);g.lineTo(a-4,y+13);g.closePath();g.fill();}
   g.restore();
  }
  g.restore();
 }
 function button(g,r,label,id='forest',options={}){
  const p=theme(id),off=options.enabled===false,selected=!off&&!!options.selected,secondary=options.variant==='secondary'&&!selected;
  const fill=off?p.muted:secondary?p.panel:p.paper,ink=off?p.mutedInk:secondary?p.onDark:p.ink;
  const face=selected?{...r,y:r.y+2,h:r.h-2}:r;
  g.save();if(!selected)shape(g,{...r,y:r.y+4},p.shadow);shape(g,face,fill);
  g.fillStyle=off?'#d0bea0':secondary?p.edge:p.light;g.fillRect(r.x+8,face.y+3,Math.max(0,r.w-16),2);
  g.fillStyle=p.edge;g.fillRect(r.x+8,r.y+r.h-3,Math.max(0,r.w-16),2);
  // Only keyboard/controller focus has an outline; selection is seated paper.
  if(!off&&options.focus){
   const x=r.x-3,y=r.y-3,w=r.w+6,h=r.h+6,c=Math.min(8,w/4,h/4);
   g.strokeStyle=semantic.focus;g.lineWidth=2;
   g.beginPath();g.moveTo(x+c,y);g.lineTo(x+w-c,y);g.lineTo(x+w,y+c);
   g.lineTo(x+w,y+h-c);g.lineTo(x+w-c,y+h);g.lineTo(x+c,y+h);
   g.lineTo(x,y+h-c);g.lineTo(x,y+c);g.closePath();g.stroke();
  }
  if(selected){
   const compact=r.w<64||r.h<36,dx=r.x+r.w/2,dy=r.y+r.h-8,d=compact?2:2.5;
   g.strokeStyle=p.edge;g.lineWidth=1;g.lineJoin='miter';g.setLineDash([]);
   g.beginPath();g.moveTo(dx,dy-d);g.lineTo(dx+d,dy);
   g.lineTo(dx,dy+d);g.lineTo(dx-d,dy);g.closePath();g.stroke();
  }
  if(label)text(g,label,r.x+r.w/2,face.y+face.h/2+(selected?2:4),options.size||13,ink,r.w-18);
  g.restore();
 }
 function heading(g,r,title,id='forest',size=21){panel(g,r,id);const p=theme(id);text(g,title,r.x+r.w/2,r.y+r.h/2+size*.34,size,p.onDark,r.w-20);}
 root.KRUIClassicSpecimen=Object.freeze({version:2,reference:'treasure-only',theme,themes,semantic,shape,text,panel,sheet,button,heading});
})(globalThis);
