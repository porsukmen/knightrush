/* Native-resolution artwork and live-rig regressions, independent of shop RNG. */
const assert=require('node:assert/strict');
const {run,canvas,shot}=require('./journey-render-audit.cjs');
run('SFX.toggle();startJourneyWithSeed(5);gold=100;scrap=10;openBlacksmithShop();flashA=0;shakeMag=0;');
// Card touch geometry follows both the rotation and the selected-card lift.
run(`for(let selected=0;selected<4;selected++){
 blacksmithShop.selected=selected;
 for(let i=0;i<4;i++){
  const p=smithCardPose(i),r=smithCardRect(i);
  const world=(x,y)=>({x:p.x+x*Math.cos(p.angle)-y*Math.sin(p.angle),y:p.y+x*Math.sin(p.angle)+y*Math.cos(p.angle)});
  if(!smithCardHit(p,i)||!smithCardHit(world(r.w/2-2,r.h/2-2),i))throw Error('Card misses its actual surface');
  if(smithCardHit(world(r.w/2+3,0),i))throw Error('Card accepts outside its rotated edge');
 }
}blacksmithShop.selected=0;`);
const pose=t=>JSON.parse(run(`JSON.stringify(smithKnightPose(${t},0,0,false,false,0))`));
const a=pose(0),b=pose(1.2);
for(const key of ['bodyX','bodyY','chest','headTilt','plume'])assert.notEqual(a[key],b[key],key+' must animate');
assert.notDeepEqual(a.left,b.left);assert.notDeepEqual(a.right,b.right);
let previous=pose(0);
for(let frame=1;frame<=300;frame++){
 const next=pose(frame/60);
 assert.ok(Math.abs(next.bodyX-previous.bodyX)<.02,'idle must not jump');
 assert.ok(Math.abs(next.bodyY-previous.bodyY)<.02,'breathing must not jump');
 previous=next;
}
// Isolate the knight, so moving fire/embers cannot produce a false animation pass.
run('g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,480,800);perfNow=0;drawSmithKnight(240,200,0,0,false,0,false)');
const first=Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data);
run('g.clearRect(0,0,480,800);perfNow=1.2;drawSmithKnight(240,200,0,0,false,0,false)');
assert.ok(!first.equals(Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data)),'knight must not be a still image');
// The artwork must not secretly reintroduce a low-res raster or change the global context.
assert.deepEqual(JSON.parse(run(`JSON.stringify((()=>{
 const ctx=g,oldImage=g.drawImage,oldCreate=document.createElement;let images=0,canvases=0;
 g.drawImage=function(...args){images++;return oldImage.apply(this,args);};
 document.createElement=function(tag){if(tag==='canvas')canvases++;return oldCreate.call(this,tag);};
 try{drawSmithScene(blacksmithShop);return {images,canvases,sameContext:g===ctx};}
 finally{g.drawImage=oldImage;document.createElement=oldCreate;}
})())`)),{images:0,canvases:0,sameContext:true});
// Hammer lands on the anvil surface in local scene coordinates.
const strike=JSON.parse(run('JSON.stringify(smithKnightPose(0,0,0,true,false,1.55))'));
assert.ok(Math.abs(110+(strike.right.hx-6)*3*.62-134)<3);
assert.ok(Math.abs(43+(strike.right.hy+4)*3*.62-100)<2);
shot('smith-bastion-idle','perfNow=0');shot('smith-bastion-idle2','perfNow=1.2');
console.log('BLACKSMITH_ART_OK direct vector canvas, independent idle rig, continuous motion, hammer contact');
