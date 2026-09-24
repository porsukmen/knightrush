/* Loaded ONLY by ?backgroundplaytest=1. Exercises the production encounter,
   input and quest flow in an isolated iframe without replacing its renderer. */
(async()=>{
  'use strict';
  try{
    cvs.style.imageRendering='auto';
    const index=ROAD_LAB_CASES.findIndex(entry=>entry.id==='mushrooms');
    if(!startRoadLabCase(index))throw Error('Could not create test encounter');
    roadLabState.active=false;
    const slot=roadLabState.slot;dist=slot.at-10;runDistance=roadScroll=dist;
    obstacles=[];pickups=[];updateJourneyRoadEvents(0);
    if(!await prepareGathererEncounter())throw Error('Encounter scene failed to load');
    KRGathererScene.setLighting(BOOT_QUERY.get('lighting'));
    const side=journeyNormalSide(slot);player.x=player.lane=side>0?2:0;
    handleAction(side>0?'right':'left');
    if(mode!=='journeyevent')throw Error('Real encounter entry did not open');
    // Real choice hitboxes, debounce, response and return-to-road behavior.
    update(.25);cvs.tabIndex=0;cvs.focus({preventScroll:true});
    // The iframe may load after focus was on the parent's launch button. Do not
    // mistake that pre-start transition for losing focus during an active run.
    hadFocus=document.hasFocus();paused=false;lastTime=performance.now();
    window.KRBackgroundPlaytest={report:()=>({mode,paused,content:journeyRoadEventSession?.context.content,
      dialogue:journeyRoadEventSession?.context.dialogue,quest:journeyMushroomQuest,
      backing:[cvs.width,cvs.height],scene:KRGathererScene.report(),isolated:true})};
    cvs.dataset.backgroundReady='1';requestAnimationFrame(frame);
  }catch(error){
    cvs.dataset.backgroundFailed='1';const p=document.createElement('p');p.style.cssText='position:fixed;z-index:10;color:#ffbaab;background:#101619;padding:20px';
    p.textContent='Background playtest: '+error.message;document.body.appendChild(p);console.error(error);
  }
})();
