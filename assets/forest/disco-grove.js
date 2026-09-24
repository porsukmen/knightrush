/* Compatibility adapter only. The user-restored Disco art lives in
   KnightRush.html: four-column dark-jointed floor, amps, cables, soda,
   roadside dancers and the minigame-matched open-air throne stage.
   Do not duplicate or redesign that art in this projection adapter. */
(()=>{
 'use strict';
 const originalPatch=drawJourneyDiscoPatch;
 const active=()=>!!window.KRSunlitForest?.active();
 const floorPatch={vertices:Array.from({length:4},()=>({x:0,z:0})),color:'#161723'};
 drawJourneyDiscoPatch=function(view,at,end,left,right,color,alpha){
  if(!active())return originalPatch(view,at,end,left,right,color,alpha);
  // Shared Sunlit road projection, with the original art and world positions.
  const ratio=CURVED_ROAD_HALF/6.25;left*=ratio;right*=ratio;
  const shape=floorPatch;
  view.point(at,left,shape.vertices[0]);view.point(at,right,shape.vertices[1]);
  view.point(end,right,shape.vertices[2]);view.point(end,left,shape.vertices[3]);
  g.globalAlpha=alpha;KRSunlitArt.drawFloorShape(shape,color);
 };
 window.KRSunlitDisco={version:'restored-classic',active,tileWidth:2.72};
})();
