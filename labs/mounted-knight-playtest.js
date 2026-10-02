/* Opt-in testing controls; never loaded by normal play. */
(()=>{'use strict';
 const test=window.KRMountedPlaytest=KRMountedRunner;
 test.status=()=>({ready:test.ready,busy:test.busy,active:test.ready&&test.active(),paused,mode,motion:test.motion,action:test.lastState?.action||'none',swordT:test.swordT,draws:test.draws,cache:window.KRMountedReview?.rearStats()});
 test.command=async name=>{
  if(!test.ready||test.busy)return false;
  if(name==='start'){test.clock=0;test.swordT=-1;test.entryGaitOffset=0;test.entryState=null;test.fastFall=false;test.jumpRate=1;test.jumpBuffered=false;test.gaitRate=1;charSel=0;startJourneyWithSeed(647486904);godMode=true;paused=false;pausePhotoMode=false;return true;}
  if(!test.active())return false;
  if(name==='pause'){paused=!paused;return true;}
  if(['idle','walk','trot','gallop'].includes(name)){
   if(player.jumpT>=0||player.duckT>=0||test.swordT>=0)return false;
   test.busy=true;const wasPaused=paused;paused=true;
   try{await KRMountedReview.prepareState({angle:180,motion:name});test.motion=name;test.clock=0;return true;}
   finally{test.busy=false;if(test.active())paused=wasPaused;}
  }
  if(paused)return false;
  if(name==='sword'){if(player.jumpT>=0||player.duckT>=0||test.swordT>=0)return false;test.swordT=0;return true;}
  if(name==='jump'){
   if(test.motion!=='gallop'){await test.command('gallop');if(test.motion!=='gallop')return false;}
   playerAction('up');return true;
  }
  if(name==='duck'){playerAction('down');return true;}
  return false;
 };
 addEventListener('keydown',event=>{if(event.code==='KeyK'&&!event.repeat&&test.ready&&test.active()){event.preventDefault();test.command('sword');}});
 addEventListener('message',async event=>{
  if(event.source!==parent||event.data?.type!=='kr-mounted-run')return;
  if(event.data.command)await test.command(event.data.command);
  parent.postMessage({type:'kr-mounted-run-status',...test.status()},'*');
 });
})();
