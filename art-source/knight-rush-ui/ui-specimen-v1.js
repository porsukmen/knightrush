/* Frozen UI Lab specimen. Separate from runtime; refresh only after explicit review. */
/* Knight Rush UI v1: presentation only; no input, state, timers or artwork. */
(function(root){
 'use strict';
 const semantic=Object.freeze({success:'#9cdb99',danger:'#ffac94',focus:'#fff3bf',warning:'#f4d17a'});
 const base={ink:'#382b20',paper:'#e7d0a0',light:'#fff0ca',edge:'#a67c43',muted:'#b6a689',mutedInk:'#51483b',accent:'#e9c577',onDark:'#f6e1b6',soft:'#d6c5a5',dark:'#29231d',panel:'#3a2e24'};
 const variants={
  forest:{label:'Forest',dark:'#20291f',panel:'#303d2c',paper:'#d7d9ae',light:'#f5f4d0',edge:'#7d8a53',accent:'#bfce80',soft:'#c4d0b3'},
  tavern:{label:'Tavern',dark:'#2b221c',panel:'#443024',paper:'#e6c58f',light:'#ffe8b5',edge:'#a77a40',accent:'#e8b665'},
  court:{label:'Royal games',dark:'#2b2329',panel:'#413039',paper:'#e3cba0',light:'#ffebc7',edge:'#a78557',accent:'#debd79'},
  forge:{label:'Basalt Forge',dark:'#20262b',panel:'#313c43',paper:'#d5b082',light:'#ffe1b4',edge:'#98724e',accent:'#edb276',soft:'#c0ccd0'},
  caravan:{label:'Autumn Caravan',dark:'#30251d',panel:'#493427',paper:'#e9c38e',light:'#ffe9be',edge:'#ae7544',accent:'#e9ab68'},
  treasure:{label:'Treasure',dark:'#30241e',panel:'#443322',paper:'#e8d6ab',light:'#fff0cd',edge:'#a8824a',accent:'#f2d37c'},
  crimson:{label:'Crimson',dark:'#2e1c25',panel:'#462a35',paper:'#dfbbaf',light:'#ffe5d3',edge:'#a57a70',accent:'#e3aaa1'},
  disco:{label:'Disco',dark:'#221d30',panel:'#362c48',paper:'#d3c0e8',light:'#f3e7ff',edge:'#8971a8',accent:'#d9b3ef'}
 };
 const themes=Object.freeze(Object.fromEntries(Object.entries(variants).map(([k,v])=>[k,Object.freeze({...base,...v})])));
 const theme=id=>themes[id]||themes.forest;
 function shape(g,r,color,cut=6){const{x,y,w,h}=r,c=Math.min(cut,w/4,h/4);g.fillStyle=color;g.beginPath();g.moveTo(x+c,y);g.lineTo(x+w-c,y);g.lineTo(x+w,y+c);g.lineTo(x+w,y+h-c);g.lineTo(x+w-c,y+h);g.lineTo(x+c,y+h);g.lineTo(x,y+h-c);g.lineTo(x,y+c);g.closePath();g.fill();}
 function text(g,label,x,y,size=13,color=base.ink,maxWidth=420){
  g.save();g.fillStyle=color;g.textAlign='center';g.textBaseline='alphabetic';
  let font=size;g.font='bold '+font+'px monospace';
  while(font>9&&g.measureText(String(label)).width>maxWidth)g.font='bold '+(--font)+'px monospace';
  g.fillText(String(label),x,y,maxWidth);g.restore();
 }
 function panel(g,r,id='forest',options={}){
  const p=theme(id);g.save();shape(g,{...r,y:r.y+4},'#171511');shape(g,r,options.light?p.paper:p.panel);
  g.fillStyle=options.light?p.light:p.edge;g.fillRect(r.x+9,r.y+3,Math.max(0,r.w-18),2);
  g.fillStyle=p.edge;g.fillRect(r.x+9,r.y+r.h-3,Math.max(0,r.w-18),1);g.restore();
 }
 function button(g,r,label,id='forest',options={}){
  const p=theme(id),off=options.enabled===false,secondary=options.variant==='secondary';
  const fill=off?p.muted:secondary?p.panel:p.paper,ink=off?p.mutedInk:secondary?p.onDark:p.ink;
  g.save();shape(g,{...r,y:r.y+4},'#171511');shape(g,r,fill);
  g.fillStyle=off?p.edge:secondary?p.edge:p.light;g.fillRect(r.x+8,r.y+3,Math.max(0,r.w-16),2);
  g.fillStyle=p.edge;g.fillRect(r.x+8,r.y+r.h-3,Math.max(0,r.w-16),2);
  if(options.selected||options.focus){g.strokeStyle=semantic.focus;g.lineWidth=2;g.strokeRect(r.x+3,r.y+3,r.w-6,r.h-6);g.fillStyle=p.ink;g.fillRect(r.x+10,r.y+r.h-7,r.w-20,3);}
  if(label)text(g,label,r.x+r.w/2,r.y+r.h/2+4,options.size||13,ink,r.w-18);
  g.restore();
 }
 function heading(g,r,title,id='forest',size=21){panel(g,r,id);const p=theme(id);text(g,title,r.x+r.w/2,r.y+r.h/2+size*.34,size,p.onDark,r.w-20);}
 root.KRUI=Object.freeze({version:1,theme,themes,semantic,shape,text,panel,button,heading});
})(globalThis);

