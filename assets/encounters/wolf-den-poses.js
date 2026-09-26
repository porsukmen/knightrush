/* Editable 2.5D pose drawings. Coordinates are native wolf U-units.
   No projected boxes, 3D mesh, yaw transform, or crossfaded actor copies.
   Read order: front -> front-left -> left -> rear-left -> back -> back run.
   Shape reference: approved Art Lab drawWolf. New angles remain candidates. */
(()=>{
 'use strict';
 const ink={F:'#8b8fa0',D:'#5d6070',L:'#aeb2c2',N:'#1b1a20',E:'#ffd23a',R:'#7a2020',S:'#4a3438',C:'#8f8d88',B:'#6d7280',BD:'#4d5160',BL:'#8a8fa0'};
 // Ordered rectangular ink blocks. Keep the approved wolf's squared skull,
 // stout feet, stepped shoulders/hackles and three-value fur, not fox triangles.
 // Entry format: [material, x, y, width, height], all in native U units.
 const poses={
  diagonal:[
   ['D',3,-8,3.7,7],['D',3,-1.8,4.3,2.4],
   ['D',7,-12,3.2,8],['D',9,-6,2.8,5],['L',8.5,-2,3.6,2.7],
   ['D',-8,-16,17,10],['D',-5,-7,12,3],
   ['F',-7,-17.5,12,8.5],['F',5,-15.5,3,7.5],
   ['L',-6,-18,10,2.8],['D',-5,-18.8,2,2],['D',0,-19,2,2],
   ['D',-4,-12,1.1,5],['D',-1.2,-12,1.1,5],['D',1.6,-12,1.1,5],
   ['S',4.5,-11.6,3,1],['S',5,-9.5,2.4,1],
   ['L',-8,-10,3.5,3],['F',-8,-8,3.4,4.3],['D',-7.8,-4,3.1,4.2],
   ['F',-8.5,-1.3,4.3,2.3],['D',-8.2,.2,3.8,.8],
   ['C',-8,.8,.45,1],['C',-7,.8,.45,1],['C',-6,.8,.45,1],['C',-5,.8,.45,1],
   ['L',-.5,-9.5,3.8,3],['F',0,-7,3.3,3.8],['D',.3,-3.7,3,3.8],
   ['F',-.3,-1.2,4.2,2.3],['D',0,.3,3.8,.7],
   ['C',.2,.9,.45,1],['C',1.2,.9,.45,1],['C',2.2,.9,.45,1],
   ['D',-7.5,-26.8,3,4.6],['D',0,-26.8,2.6,4.6],
   ['F',-8.2,-23,11,7],['D',2.8,-22,2,6],
   ['L',-7,-23,8,1.2],
   ['R',-7,-21.4,2.8,2.5],['E',-6.5,-21,1.7,1.6],
   ['R',-.6,-21.1,2.2,2.4],['E',-.2,-20.7,1.2,1.5],
   ['D',-10,-18.8,7.8,3.2],['F',-10,-18.8,6,1],
   ['N',-10.2,-17.7,3,1.8],['D',-7.4,-15.5,5.4,1.7],['N',-7,-15.2,3.7,.8]
  ],
  side:[
   ['D',-3.5,-8,3.2,7],['D',-4,-1.5,4.3,2.2],
   ['D',5,-8,3.6,5],['D',6,-4,3,4],['D',4.8,-1.2,4.2,2.1],
   ['D',9,-11,3,8],['D',11,-5,3,4],['L',10.5,-2,3.8,2.5],
   ['D',-7,-16,18,10],['D',-3,-7,12,3],['F',-6,-17.5,12,8],
   ['F',6,-15.5,4,8],['L',-5,-18,10,2.7],
   ['D',-5,-19,2,2.2],['D',-.5,-18.6,2,2],['D',4,-17.4,2,2],
   ['D',-2.5,-12,1.2,5],['D',.3,-12,1.2,5],['D',3.1,-11.5,1.2,4.5],
   ['S',5,-11.5,4,1],['S',6,-9.5,3.2,1],
   ['L',-7.5,-10,3.8,3.2],['F',-7.5,-8,3.3,4.5],['D',-7,-4,3,4],
   ['F',-9,-1.2,5.2,2.4],['D',-8.8,.3,4.6,.8],
   ['C',-8.6,.9,.45,.9],['C',-7.6,.9,.45,.9],['C',-6.6,.9,.45,.9],
   ['F',5,-10,4,5],['F',4,-6,3.7,3],['D',4,-3.5,3,3.5],
   ['F',2.5,-1.1,4.7,2.3],['C',2.9,.9,.45,.9],['C',3.9,.9,.45,.9],['C',4.9,.9,.45,.9],
   ['D',-9.5,-26.8,3,4.6],['D',-3.5,-26.3,2.7,4.4],
   ['F',-10.5,-23,10,7],['D',-.5,-22,2,6],['L',-9,-23,7.5,1.2],
   ['R',-9,-21.3,3,2.5],['E',-8.5,-20.9,1.8,1.7],
   ['D',-15,-19,8.5,3.5],['F',-15,-19,7,1.1],
   ['N',-15.3,-18,3,1.8],['D',-12,-15.7,6.3,1.8],['N',-11.5,-15.3,4.6,.8]
  ],
  rearDiagonal:[
   ['D',-6,-8,3.5,7],['D',-7,-1.5,4.4,2.3],
   ['D',4,-8,3.5,7],['D',3.5,-1.5,4.4,2.3],
   ['D',-7,-17,14,5],['L',-5.5,-18,10.5,2],
   ['F',-7,-14.5,6.7,10.5],['F',1,-14.5,7,10.5],
   ['L',-7,-14.5,6.7,2.7],['L',1,-14.5,7,2.7],
   ['D',-1.5,-14.5,4.5,10.5],['D',-3,-5,3,5],['F',-4,-1.6,4.5,2.3],
   ['F',4,-5,3.6,5],['D',4,-1.2,4.2,2.1],
   ['D',0,-10,2.8,9],['L',-.5,-2,3.6,3],
   ['D',-8,-26.5,2.8,4.5],['D',-1,-26.5,2.8,4.5],
   ['F',-8.5,-23,11,6.4],['L',-7,-23,8,1.2],['D',.5,-21.8,2.8,5],
   ['D',-10.5,-20,3.5,3],['F',-10.5,-20,2,1]
  ],
  // Almost rear-facing: head, shoulders and hips settle toward the centre
  // before the symmetric back pose. A narrow cheek still shows on one side.
  rearNear:[
   ['BD',-6,-4,3,6.5],['BD',3.1,-4,3,6.5],
   ['B',-7.8,-14,6.6,10.8],['B',.8,-14,7,10.8],
   ['BL',-7.8,-14,6.6,2.8],['BL',.8,-14,7,2.8],
   ['BD',-2.9,-14,5.7,10],
   ['B',-5.5,-17,10.7,4],['BL',-4.6,-18,8.5,2],
   ['B',-5.2,-22.2,8.9,5.3],
   ['BD',-5.2,-25.2,2.5,4],['BD',1.1,-25,2.4,4],
   ['B',-6.4,-20,1.4,2.2],
   ['BD',-1.5,-10,2.8,9],['BL',-1.9,-2,3.6,3]
  ]
 };
 function drawing(name){for(const [col,x,y,w,h]of poses[name])expRect(x,y,w,h,ink[col]);}
 function front(stand){
  // The actual native coiled pose keeps four paws planted as the chest rises.
  drawWolf(0,0,1/U,stand<.999?'tele_wolf_double_pounce':'idle',(1-stand)*.65,false);
 }
 function rear(t,moving){
  // A rear-only six-frame gait. No directional switching once running.
  const frame=moving?Math.floor(t*10)%6:0;
  drawWolfBack(0,0,1/2.6,frame/6*Math.PI*2/11,moving?1:0);
 }
 function poseName(turn,moving){
  if(moving||turn>=.90)return 'back';
  if(turn<.12)return 'front';
  if(turn<.30)return 'diagonal';
  if(turn<.48)return 'side';
  if(turn<.68)return 'rearDiagonal';
  return 'rearNear';
 }
 function draw(s,stand,turn,t,moving){
  const name=poseName(turn,moving);g.save();g.scale(s*U,s*U);
  if(name==='front')front(stand);else if(name==='back')rear(t,moving);
  else{g.scale(-1,1);drawing(name);} // Same authored angles, mirrored to turn right.
  g.restore();return name;
 }
 function pup(s,t,back=false,moving=false,eating=false){
  if(back){g.save();g.scale(s*.68*U,s*.68*U);rear(t,moving);g.restore();return;}
  const head=.84,dy=eating?12:3.3,bob=eating?Math.sin(t*7)*.18:Math.sin(t*2)*.08;
  g.save();g.scale(s*U,s*U);
  g.save();if(eating){g.beginPath();g.rect(-12,-9.4,24,13);g.clip();g.scale(1,.65);}
  drawWolf(0,0,.68/U,'idle',0,false);g.restore();
  g.save();g.translate(0,dy+bob);g.scale(head,head);
  g.beginPath();[[-6.5,-26.8],[6.5,-26.8],[6.5,-16],[3.2,-16],[3.2,-14.2],[-3.2,-14.2],[-3.2,-16],[-6.5,-16]]
   .forEach((p,i)=>g[i?'lineTo':'moveTo'](p[0],p[1]));g.closePath();g.clip();
  drawWolf(0,0,1/U,'idle',0,false);g.restore();g.restore();
 }
 window.KRWolfDenPoses=Object.freeze({draw,pup,poseName,names:Object.freeze(['front','diagonal','side','rearDiagonal','rearNear','back'])});
})();
