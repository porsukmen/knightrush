const assert=require('node:assert/strict');
const {run,shot}=require('./journey-render-audit.cjs');
run(`SFX.toggle();
function scrapFightFixture(index=8){
 roadLabState.entry=false;startRoadLabCase(index);
 gold=0;scrap=0;goldEarned=0;dist=roadLabState.slot.at;roadScroll=dist;
 obstacles=[];pickups=[];updateJourneyRoadEvents(0);
}
function scrapWin(){
 boss.hp=0;defeatBoss();boss.stateT=2.6;updateBoss(.016);
}
`);
// All enemy variants: genuine combat victory -> frozen, selectable two-currency loot.
const awards=[];
const seededAmounts=new Set();
for(let seed=1;seed<=40;seed++){
 run(`startJourneyWithSeed(${seed});startJourneyRoadEvent({id:'seeded-salvage',definition:'roadside_fight',enemyId:'road_cutpurse',at:dist});scrapWin();`);
 seededAmounts.add(run('journeyRoadEventSession.context.loot.entries[1].amount'));
}
assert.deepEqual([...seededAmounts].sort(),[2,3,4]);
for(let i=8;i<14;i++){
 run(`scrapFightFixture(${i});globalThis.fightBefore={dist,roadScroll,runDistance,loop,route:journeyRoute,
  earned:goldEarned,skills:JSON.stringify(runSkills)};squire.present=true;scrapWin();
  globalThis.salvageContext=journeyRoadEventSession.context;`);
 assert.equal(run('mode'),'journeyevent');assert.equal(run('boss'),null);
 assert.equal(run('hasCombatAlly()'),false);assert.equal(run('gold+scrap'),0);
 assert.equal(run('claimJourneyLootReward(salvageContext,"scrap")'),false,'transition debounce');
 run('update(.1)');assert.equal(run('salvageContext.lootTime'),.1,'one event tick per frame');
 run('update(.15)');
 const amount=run('salvageContext.loot.entries[1].amount');assert(amount>=2&&amount<=4);awards.push(amount);
 assert.equal(run('prepareJourneyFightLoot(salvageContext)'),false,'no duplicate victory preparation');
 run('paused=true');assert.equal(run('claimJourneyLootReward(salvageContext,"scrap")'),false);
 run('paused=false');assert.equal(run('claimJourneyLootReward(salvageContext,"scrap")'),true);
 assert.equal(run('claimJourneyLootReward(salvageContext,"scrap")'),false);
 assert.equal(run('scrap'),amount);assert.equal(run('goldEarned'),0,'scrap is not gold score');
 run('handleJourneyRoadEventAction("choice1");handleJourneyRoadEventAction("choice1");');
 assert.equal(run('gold'),12);assert.equal(run('goldEarned'),12);
 run('update(2);render();render();handleJourneyRoadEventAction("continue");');
 assert(run("mode==='run'&&dist===fightBefore.dist&&roadScroll===fightBefore.roadScroll&&runDistance===fightBefore.runDistance&&loop===fightBefore.loop&&journeyRoute===fightBefore.route&&JSON.stringify(runSkills)===fightBefore.skills"));
 assert.equal(run('journeyRoute.eventRecords[salvageContext.slot.id].result.scrap'),amount);
 assert.equal(run('journeyRoute.eventRecords[salvageContext.slot.id].result.reward'),12);
 assert.equal(run('journeyVenueVisible(salvageContext.slot.id)'),false);
 assert.equal(run('claimJourneyLootReward(salvageContext,"scrap")'),false,'stale callback');
 assert.equal(run('startJourneyRoadEvent(salvageContext.slot)'),false,'no reopening completed fight');
}
// Deterministic replay, optional claims, abandoned screens and losses do not pay.
run('scrapFightFixture();scrapWin();update(.25);');
assert.equal(run('journeyRoadEventSession.context.loot.entries[1].amount'),awards[0]);
shot('scrap-victory-unclaimed','flashA=0;shakeMag=0;');
run('handleJourneyRoadEventAction("choice2");handleJourneyRoadEventAction("continue");');
assert.equal(run('gold'),0);assert.equal(run('scrap'),awards[0]);
run('scrapFightFixture();scrapWin();update(.25);handleJourneyRoadEventAction("continue");');
assert.equal(run('gold+scrap'),0);
run('scrapFightFixture();');assert.equal(run('finishJourneyRoadFight()'),false,'alive enemy cannot pay');
run('cancelJourneyRoadEvent("lost")');assert.equal(run('gold+scrap'),0);
run('scrapFightFixture();scrapWin();update(.25);globalThis.staleLoot=journeyRoadEventSession.context;openRoadLab();');
assert.equal(run('claimJourneyLootReward(staleLoot,"scrap")'),false);
assert.equal(run('scrap'),0);
// A normal victory funds a roadside upgrade in the SAME run; no lab reset in between.
run(`scrapFightFixture();scrapWin();update(.25);handleJourneyRoadEventAction('choice1');
 handleJourneyRoadEventAction('choice2');handleJourneyRoadEventAction('continue');awardGold(6);
 globalThis.materialsBefore=scrap;
 startJourneyRoadEvent({id:'audit-forge-after-fight',definition:'forge_stop',at:dist,theme:'forge'});
 blacksmithShop.random=()=>.99;`);
assert.equal(run('mode'),'shop');assert.equal(run('beginSmithUpgrade()'),true);
assert.equal(run('gold'),0);assert.equal(run('scrap'),run('materialsBefore')-2);
run('updateBlacksmithShop(5);shopTap({x:240,y:680});shopTap({x:240,y:750});');
assert.equal(run('mode'),'run');assert.equal(run('runSkills[0].evolutionDepth'),1);
// Stages and town keep materials. A NEW playthrough resets them, including lab grants.
run('awardScrap(10);globalThis.stageScrap=scrap;nextLoop();openTown();');
assert.equal(run('scrap'),run('stageScrap'));
run('townTap({x:90,y:450});updateTown(.4);');assert.equal(run('mode'),'shop');
assert.equal(run('smithQuote(runSkills[0]).scrapCost'),3);
run('startJourneyWithSeed(123);');assert.equal(run('scrap'),0);
// Both balances checked before RNG or any charge; no negative balances, even on double input.
run(`gold=100;scrap=1;openBlacksmithShop();blacksmithShop.random=()=>{throw Error('Unfunded RNG');};`);
assert.equal(run('beginSmithUpgrade()'),false);assert.equal(run('gold'),100);assert.equal(run('scrap'),1);
shot('scrap-smith-insufficient','flashA=0;shakeMag=0;');
run('scrap=100;gold=17;');assert.equal(run('beginSmithUpgrade()'),false);
assert.equal(run('gold'),17);assert.equal(run('scrap'),100);
run('gold=100;scrap=100;blacksmithShop.random=()=>.99;');
for(const cost of [2,3,5,8]){
 assert.equal(run('smithQuote(runSkills[0]).scrapCost'),cost);
 run('gold=100;globalThis.priorScrap=scrap;');assert.equal(run('beginSmithUpgrade()'),true);
 assert.equal(run('beginSmithUpgrade()'),false);assert.equal(run('scrap'),run('priorScrap')-cost);
 run('updateBlacksmithShop(5);settleSmithOrder();shopTap({x:240,y:680});');
 assert.equal(run('scrap'),run('priorScrap')-cost);
}
assert.equal(run('beginSmithUpgrade()'),false,'Apex does not charge');
// Ordinary failures consume materials, technical failures refund BOTH currencies once.
run(`openBlacksmithLab();blacksmithShop.lab.outcome=2;gold=100;scrap=10;beginSmithUpgrade();updateBlacksmithShop(5);`);
assert.equal(run('scrap'),8);assert.equal(run('gold'),91);assert.equal(run('runSkills[0].evolutionDepth'),0);
run('settleSmithOrder();');assert.equal(run('scrap'),8);assert.equal(run('gold'),91);
shot('scrap-smith-fail','');
run(`shopTap({x:240,y:680});blacksmithShop.lab.outcome=1;gold=100;scrap=10;
 beginSmithUpgrade();resetRunSkill(runSkills[0].baseId);updateBlacksmithShop(5);`);
assert.equal(run('blacksmithShop.order.error'),true);assert.equal(run('gold'),100);assert.equal(run('scrap'),10);
run('settleSmithOrder()');assert.equal(run('gold'),100);assert.equal(run('scrap'),10);
// A recipe that cannot compile never charges either currency.
run(`shopTap({x:240,y:680});globalThis.savedCompiler=compileSmithUpgrade;compileSmithUpgrade=()=>null;`);
assert.equal(run('beginSmithUpgrade()'),false);assert.equal(run('gold'),100);assert.equal(run('scrap'),10);
run('compileSmithUpgrade=savedCompiler;blacksmithShop.lab=null;blacksmithShop.message="";refreshSmithCards();');
shot('scrap-smith-funded','');
run('openBlacksmithLab();startRun(0);');assert.equal(run('scrap'),0,'lab funds must not leak');
shot('scrap-run-hud','awardGold(124);awardScrap(16);flashA=0;shakeMag=0;');
console.log('JOURNEY_SCRAP_OK '+JSON.stringify({enemies:6,awards,costs:[2,3,5,8],
 tests:'select/skip/duplicate/pause/stale/loss, real fight->road forge, stage/town persistence, new-run reset, no unfunded RNG, atomic debit, failure and technical refund'}));
