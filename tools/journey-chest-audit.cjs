const assert=require('node:assert/strict');
const {run,shot}=require('./journey-render-audit.cjs');
run(`SFX.toggle();
function chestFixture(){
 roadLabState.entry=false;startRoadLabCase(ROAD_LAB_CASES.findIndex(c=>c.id==='chest'));
 dist=roadLabState.slot.at;roadScroll=dist;runDistance=dist;updateJourneyRoadEvents(0);
}
function solveRoadChest(){
 beginLockpickingRound();
 for(let index=0;index<LOCKPICK_RULES.pins;index++){
  beginLockpickHold(index);let released=false;
  for(let frame=0;frame<1200;frame++){
   update(1/240);const pin=lockpickGame.pins[index];
   if(pin.holdT>LOCKPICK_RULES.minTap+.02&&Math.abs(lockpickPinY(pin)+12-LOCKPICK_RULES.shearY)<Math.max(8,pin.window-lockpickGame.setCount)-1){
    endLockpickHold();released=true;break;
   }
  }
  if(!released||lockpickGame.pins[index].state!=='set')throw Error('Pin did not unlock');
 }
 for(let frame=0;frame<600&&mode==='lockpicking';frame++)update(1/120);
}
`);
const generation=JSON.parse(run(`JSON.stringify((()=>{
 let chests=0;
 for(let seed=0;seed<100;seed++){
  startJourneyWithSeed(seed);
  for(const node of journeyRoute.nodes)for(const edge of node.out){
   for(const slot of edge.events){
    if(JOURNEY_ROAD_EVENTS[slot.definition].kind==='normal'&&journeyNormalContent(slot)==='chest')throw Error('Chest still in ? pool');
    if(slot.definition==='chest_stop'){
     chests++;if(edge.preview.theme!=='chest'||!JOURNEY_ROAD_EVENTS[slot.definition].blocking)throw Error('Chest is not special');
     if(Math.abs((slot.at-node.at)/edge.length-.52)>.02)throw Error('Chest not at road middle');
    }
   }
  }
 }return {seeds:100,chests};
})())`,30000));assert(generation.chests>0);
run('chestFixture();globalThis.beforeChest={gold,dist,roadScroll,runDistance,loop,route:journeyRoute,skills:JSON.stringify(runSkills)};');
assert.equal(run('mode'),'lockpicking');shot('chest-lock-intro','');
run('solveRoadChest()');assert.equal(run('mode'),'journeyevent');assert.equal(run('lockpickGame'),null);
assert.equal(run('gold'),run('beforeChest.gold'),'no automatic reward');
assert.equal(run('journeyRoadEventSession.context.loot.entries.length'),1);
assert.equal(run('claimJourneyChestReward(journeyRoadEventSession.context)'),false,'transition click debounce');
run('update(.25);globalThis.chestContext=journeyRoadEventSession.context;');
const reward=run('chestContext.loot.entries[0].amount');assert(reward>=35&&reward<=55);
shot('chest-loot-unclaimed','');
run('paused=true');assert.equal(run('claimJourneyChestReward(chestContext)'),false);run('paused=false');
assert.equal(run('claimJourneyChestReward(chestContext)'),true);
assert.equal(run('claimJourneyChestReward(chestContext)'),false);
assert.equal(run('gold'),run('beforeChest.gold')+reward);shot('chest-loot-collected','');
run('handleJourneyRoadEventAction("continue")');assert.equal(run('mode'),'run');
assert(run('dist===beforeChest.dist&&roadScroll===beforeChest.roadScroll&&runDistance===beforeChest.runDistance&&loop===beforeChest.loop&&journeyRoute===beforeChest.route&&JSON.stringify(runSkills)===beforeChest.skills'));
assert.equal(run('journeyVenueVisible(chestContext.slot.id)'),false);
assert.equal(run('claimJourneyChestReward(chestContext)'),false,'stale claim');
assert.equal(run('startJourneyRoadEvent(chestContext.slot)'),false,'same chest cannot reopen');
// Same seed recreates both the pin challenge and the reward, not a render RNG.
run('chestFixture();beginLockpickingRound();globalThis.savedPins=JSON.stringify(lockpickGame.pins);');
run('chestFixture();beginLockpickingRound();');assert.equal(run('JSON.stringify(lockpickGame.pins)'),run('savedPins'));
run('lockpickGame.won=true;lockpickGame.phase="result";update(.016);update(.25)');
assert.equal(run('journeyRoadEventSession.context.loot.entries[0].amount'),reward);
const withoutClaim=run('gold');run('handleJourneyRoadEventAction("continue")');assert.equal(run('gold'),withoutClaim);
// Three actual mistimed releases exhaust the picks and offer no currency.
run(`chestFixture();beginLockpickingRound();
 for(let i=0;i<3;i++){beginLockpickHold(0);update(.14);endLockpickHold();}
 for(let f=0;f<300&&mode==='lockpicking';f++)update(1/120);update(.25);`);
assert.equal(run('mode'),'journeyevent');assert.equal(run('journeyRoadEventSession.context.loot.won'),false);
assert.equal(run('journeyRoadEventSession.context.loot.entries.length'),0);shot('chest-loot-failed','');
assert.equal(run('claimJourneyChestReward(journeyRoadEventSession.context)'),false);
run('handleJourneyRoadEventAction("continue")');assert.equal(run('mode'),'run');assert.equal(run('gold'),180);
run('chestFixture();leaveLockpicking()');assert.equal(run('mode'),'run');assert.equal(run('journeyRoadEventSession'),null);assert.equal(run('gold'),180);
// Completed opening can be left via BACK without discarding earned loot.
run('chestFixture();lockpickGame.won=true;lockpickGame.phase="opening";leaveLockpicking();');
assert.equal(run('mode'),'journeyevent');assert.equal(run('gold'),180);
run('globalThis.abandonedChest=journeyRoadEventSession.context;openRoadLab()');
assert.equal(run('claimJourneyChestReward(abandonedChest)'),false);assert.equal(run('lockpickGame'),null);
// Standalone lockpicking retains its replay and existing menu exit.
run('startLockpicking();lockpickGame.phase="result";lockpickGame.won=true;beginLockpickingRound();');
assert.equal(run('mode'),'lockpicking');assert.equal(run('lockpickGame.phase'),'playing');
run('leaveLockpicking()');assert.equal(run('mode'),'minigames');
console.log('JOURNEY_CHEST_OK '+JSON.stringify({generation,realFivePinWin:true,realThreeMissLoss:true,selectableGold:reward,onceOnly:true,skip:true,abandon:true,seeded:true,standalone:true}));
