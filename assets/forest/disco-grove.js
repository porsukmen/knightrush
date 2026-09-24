/* Compatibility adapter only. The user-restored Disco art lives in
   KnightRush.html: four-column dark-jointed floor, amps, cables, soda,
   roadside dancers and the minigame-matched open-air throne stage.
   Do not duplicate or redesign that art in this projection adapter. */
(()=>{
 'use strict';
 const originalPatch=drawJourneyDiscoPatch;
 const active=()=>!!window.KRSunlitForest?.active();
 const floorPatch={vertices:[],color:'#161723'};
 drawJourneyDiscoPatch=function(view,at,end,left,right,color,alpha){
  if(!active())return originalPatch(view,at,end,left,right,color,alpha);
  // Shared Sunlit road projection, with the original art and world positions.
  const ratio=CURVED_ROAD_HALF/6.25;left*=ratio;right*=ratio;
  floorPatch.vertices[0]=view.point(at,left);floorPatch.vertices[1]=view.point(at,right);
  floorPatch.vertices[2]=view.point(end,right);floorPatch.vertices[3]=view.point(end,left);
  g.globalAlpha=alpha;KRSunlitArt.drawFloorShape(floorPatch,color);
 };
 window.KRSunlitDisco={version:'restored-classic',active,tileWidth:2.72};
})();
