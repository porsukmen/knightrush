/* Candidate fixed-camera combat environment. The shared manager owns its one
 * selected image; this adapter owns only the encounter token and materials. */
(function(root){'use strict';
 let assetId='oathkeeper-arena';
 const materials=Object.freeze({
  stone:['#344c4d','#77927d','#c0c79a'],edge:['#3b5552','#8da282','#d2d2a1'],
  old:['#2d4443','#657e63','#a9b77c'],dark:['#182c2d','#345044','#668055'],
  moss:['#244426','#5b872d','#a5bd45'],earth:['#3d3427','#80613a','#be9550'],
  seal:['#284a44','#668476','#b6bc88'],boulder:['#314b4d','#749188','#bac6aa']
 });
 const knightMaterials=Object.freeze({armor:'#9ea99f',dark:'#4b6269',light:'#d6dccc',
  steel:'#bacdc9',shine:'#fff7df',plume:'#269ce5',blue:'#2d68b7'}),
  swordColors=Object.freeze(Object.fromEntries(Object.entries(root.KROathSwordArt.palettes.neutral)
   .map(([key,color])=>[color,root.KROathSwordArt.palettes.shrine[key]])));
 let owner=null,epoch=0,pending=Promise.resolve(false),sceneLighting=true;
 const eligible=()=>['boss','bossintro'].includes(mode)&&['oathkeeper','oathkeeper2d','ancientguardian'].includes(boss?.definitionId)&&player.alive;
 function reset(){epoch++;owner=null;pending=Promise.resolve(false);root.KREventVisuals?.release(assetId);}
 function sync(){
  if(!eligible()){if(owner)reset();return pending;}
  if(owner===boss)return pending;
  // First acquisition may reuse the road event's decoded approach prefetch.
  // Replacing a live actor still releases that actor's scene ownership.
  if(owner)reset();else epoch++;
  assetId=boss.definitionId==='ancientguardian'?'ancient-guardian-courtyard':'oathkeeper-arena';
  owner=boss;const token=owner,generation=epoch;
  pending=(async()=>{
   if(!root.KREventVisuals&&!await loadEventVisualModule('assets/encounters/event-visuals.js','KREventVisuals'))return false;
   if(generation!==epoch||token!==owner||!eligible())return false;
   return root.KREventVisuals.activate(assetId);
  })();
  return pending;
 }
 const active=()=>owner===boss&&eligible(),
  coversWorld=()=>active()&&!!root.KREventVisuals?.peek(assetId),
  lighting=()=>active()&&sceneLighting?materials:null;
 const knightLighting=()=>active()&&sceneLighting?knightMaterials:null,
  swordLighting=()=>active()&&sceneLighting?swordColors:null;
 function draw(ctx){
  const image=active()&&root.KREventVisuals?.peek(assetId);if(!image)return false;
  const scale=Math.max(VW/image.naturalWidth,(VH+PAD_TOT)/image.naturalHeight),
   width=image.naturalWidth*scale,height=image.naturalHeight*scale;
  ctx.save();try{
   ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   ctx.drawImage(image,(VW-width)/2,VH+PAD_BOT-height,width,height);
  }finally{ctx.restore();}
  return true;
 }
 root.KROathkeeperArena=Object.freeze({get assetId(){return assetId;},materials,knightMaterials,swordColors,sync,reset,active,coversWorld,draw,lighting,knightLighting,swordLighting,
  ready:()=>pending,setSceneLighting(value){sceneLighting=!!value;},
  report:()=>({active:active(),ready:coversWorld(),sceneLighting,assetId,visual:root.KREventVisuals?.describe(assetId)})});
})(globalThis);
