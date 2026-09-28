/* Post-fight ground plate only. Live loot, input and rewards belong to the event. */
(()=>{'use strict';
 const assetId='fight-loot';
 function drawCutscene(){
  const im=window.KREventVisuals?.peek(assetId);if(!im)return false;
  g.save();try{
   g.fillStyle='#30241e';g.fillRect(0,-PAD_TOP,480,800+PAD_TOT);
   g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
   g.drawImage(im,0,0,480,640);return true;
  }finally{g.restore();}
 }
 window.KRFightLoot=Object.freeze({assetId,drawCutscene});
})();
