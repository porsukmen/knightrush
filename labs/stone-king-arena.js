/* Fixed-camera Stone King cutscene plate. Image lifetime belongs exclusively to
 * the shared event visual manager; this adapter owns the encounter token. */
(function(root){'use strict';
 const assetId='stone-king-arena';
 const defaults=Object.freeze({horizon:.70,centerX:.50,scale:1,offsetX:0,offsetY:0,
  lanes:true,laneColor:'#8b7757',laneOpacity:.24,laneWidth:.035});
 let mapping={...defaults},owner=null,epoch=0,pending=Promise.resolve(false),rasterStyle=null;
 const eligible=()=>typeof mode!=='undefined'&&['boss','bossintro'].includes(mode)&&
  typeof boss!=='undefined'&&boss?.definitionId==='stone_king_pixel'&&
  typeof player!=='undefined'&&player.alive;
 function reset(){
  if(rasterStyle){if(rasterStyle.canvas.style.imageRendering==='auto')rasterStyle.canvas.style.imageRendering=rasterStyle.previous;rasterStyle=null;}
  epoch++;owner=null;pending=Promise.resolve(false);root.KREventVisuals?.release(assetId);
 }
 function sync(){
  if(!eligible()){if(owner)reset();return pending;}
  if(owner===boss)return pending;
  if(owner)reset();else epoch++;
  owner=boss;const token=owner,generation=epoch;
  pending=(async()=>{
   if(!root.KREventVisuals){
    if(typeof loadEventVisualModule!=='function'||!await loadEventVisualModule('assets/encounters/event-visuals.js','KREventVisuals'))return false;
   }
   if(generation!==epoch||token!==owner||!eligible())return false;
   const ready=await root.KREventVisuals.activate(assetId);
   if(ready&&generation===epoch&&token===owner&&eligible()&&typeof cvs!=='undefined'&&cvs.style){
    rasterStyle={canvas:cvs,previous:cvs.style.imageRendering};cvs.style.imageRendering='auto';
   }
   return ready;
  })();
  return pending;
 }
 const active=()=>eligible()&&owner===boss,coversWorld=()=>active()&&!!root.KREventVisuals?.peek(assetId);
 function configure(values={}){
  for(const key of ['horizon','centerX'])if(Number.isFinite(values[key]))mapping[key]=Math.max(.01,Math.min(.99,values[key]));
  if(Number.isFinite(values.scale))mapping.scale=Math.max(1,values.scale);
  for(const key of ['offsetX','offsetY'])if(Number.isFinite(values[key]))mapping[key]=values[key];
  if(typeof values.lanes==='boolean')mapping.lanes=values.lanes;
  if(typeof values.laneColor==='string')mapping.laneColor=values.laneColor;
  if(Number.isFinite(values.laneOpacity))mapping.laneOpacity=Math.max(0,Math.min(1,values.laneOpacity));
  if(Number.isFinite(values.laneWidth))mapping.laneWidth=Math.max(0,values.laneWidth);
  return {...mapping};
 }
 function placement(image,camera,padding={}){
  const iw=image.naturalWidth||image.width,ih=image.naturalHeight||image.height;
  if(!(iw>0&&ih>0))return null;
  const top=-(padding.top||0),bottom=camera.viewportHeight+(padding.bottom||0),
   anchorX=camera.centerX+mapping.offsetX,anchorY=camera.horizon+mapping.offsetY,
   sourceX=iw*mapping.centerX,sourceY=ih*mapping.horizon;
  // Uniform cover around the measured vanishing point; no actor coordinates,
  // camera lens or world-plane dimensions are altered to fit the illustration.
  const scale=Math.max(anchorX/sourceX,(camera.width-anchorX)/(iw-sourceX),
   (anchorY-top)/sourceY,(bottom-anchorY)/(ih-sourceY))*mapping.scale;
  return {x:anchorX-sourceX*scale,y:anchorY-sourceY*scale,width:iw*scale,height:ih*scale,
   scale,anchorX,anchorY,sourceX,sourceY,top,bottom};
 }
 function drawLanes(ctx,camera,padding={}){
  const stage=root.KRStoneKingStage;if(!stage||!mapping.lanes||mapping.laneOpacity<=0)return;
  const bottom=camera.viewportHeight+(padding.bottom||0),near=Math.max(-camera.follow+2,
   camera.focal*camera.height/Math.max(1,bottom-camera.horizon)-camera.follow-1),far=2000;
  ctx.save();try{
   ctx.fillStyle=mapping.laneColor;ctx.globalAlpha*=mapping.laneOpacity;
   for(const index of[-1.5,-.5,.5,1.5]){
    const x=index*stage.laneWidth,w=mapping.laneWidth*.5,
     points=[[x-w,near],[x+w,near],[x+w,far],[x-w,far]].map(([x,z])=>stage.project(camera,{x,y:.008,z}));
    ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();
   }
  }finally{ctx.restore();}
 }
 function draw(ctx,camera){
  const image=active()&&root.KREventVisuals?.peek(assetId);if(!image)return false;
  const padding={top:typeof PAD_TOP==='number'?PAD_TOP:0,bottom:typeof PAD_BOT==='number'?PAD_BOT:0},rect=placement(image,camera,padding);
  if(!rect)return false;
  ctx.save();try{
   ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   ctx.drawImage(image,rect.x,rect.y,rect.width,rect.height);
  }finally{ctx.restore();}
  drawLanes(ctx,camera,padding);return true;
 }
 const api=Object.freeze({assetId,defaults,sync,reset,active,coversWorld,draw,drawLanes,placement,configure,
  ready:()=>pending,report:()=>({assetId,active:active(),ready:coversWorld(),mapping:{...mapping},visual:root.KREventVisuals?.describe(assetId)})});
 root.KRStoneKingArena=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
