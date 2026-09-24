const assert=require('node:assert/strict');
const {run,shot,sandbox}=require('./journey-render-audit.cjs');
run(`SFX.toggle();startJourneyWithSeed(647486904);gold=10000;scrap=1000;openBlacksmithShop();
 function smithTestRng(values){let i=0;return ()=>{if(i>=values.length)throw Error('Unexpected RNG');return values[i++];};}
 function smithTestBuy(index,routeRoll,rarityRoll){
   blacksmithShop.selected=index;blacksmithShop.random=smithTestRng([routeRoll,.99,rarityRoll]);
   if(!beginSmithUpgrade())throw Error('Purchase rejected');
   updateBlacksmithShop(5);shopTap({x:240,y:680});
 }
`);
// Validate the full route index; compile a bounded sample across every form/depth.
// Exhaustive cross-rarity compiler certification lives in the synthesis audits.
const catalogue=JSON.parse(run(`JSON.stringify((()=>{
 let count=0,compiled=0;const rarities={1:'LEGENDARY',2:'COMMON',3:'RARE',4:'UNCOMMON'};
 for(const definition of BASE_TURN_SKILLS){
  const catalog=WEAPON_SKILL_ROUTE_CATALOGS.byId[definition.id],routes=catalog?
   catalog.routes.filter(r=>r.runtimeReadiness==='MATERIALIZED'):
   CLASS_SKILL_ROUTES.filter(r=>r.skillId===definition.id&&r.usesQuality);
  const sampled=new Set();
  for(const route of routes){
   count++;
   if(route.depth>1&&!routes.some(parent=>parent.id===route.parentId&&parent.depth===route.depth-1))throw Error('Orphan route');
   const key=route.formSlot+':'+route.depth;
   if(catalog&&sampled.has(key))continue;sampled.add(key);
   const command=route.classSkillRoute?compileClassSkillRoute(route.id,rarities):compileWeaponSkillRoutePreview(route,rarities);
   if(!command||command.baseId!==definition.id||command.evolutionDepth!==route.depth)throw Error('Bad route '+route.id);
   if(command.evolutionHistory.some(h=>h.rarity!==rarities[h.depth]))throw Error('Lost rarity '+route.id);
   compiled++;
  }
 }
 return {count,compiled};
})())`,60000));
assert(catalogue.count>1000);
// Four actual shop chains, each with independently mixed quality layers.
run(`for(let i=0;i<4;i++){
 for(let depth=1;depth<=4;depth++){
  const before=runSkills.map(s=>JSON.stringify(s)),previous=runSkills[i].evolutionHistory.map(h=>h.rarity);
  smithTestBuy(i,.28,[.999,.1,.96,.8][depth-1]);
  const skill=runSkills[i];if(skill.evolutionDepth!==depth)throw Error('Depth');
  const expected=['LEGENDARY','COMMON','RARE','UNCOMMON'].slice(0,depth);
  if(JSON.stringify(skill.evolutionHistory.map(h=>h.rarity))!==JSON.stringify(expected))throw Error('Quality inheritance');
  for(let j=0;j<4;j++)if(i!==j&&JSON.stringify(runSkills[j])!==before[j])throw Error('Sibling skill changed');
 }
 const balance=gold;if(beginSmithUpgrade()||gold!==balance)throw Error('Apex charged');
}
// The forged cards execute through the real boss action pipeline.
for(let i=0;i<4;i++){
 startBoss();setMode('boss');boss.hp=boss.maxhp=100000;boss.mark=80;beginPlayerTurn();
 boss.ap=20;boss.resolve=20;const hp=boss.hp,mark=boss.mark;
 const action=activeTurnSkills().find(c=>(c.baseId||c.id)===runSkills[i].baseId);
 if(!performPlayerAction(action))throw Error('Forged skill rejected in combat '+i);
 for(let tick=0;tick<240;tick++)update(1/60);
 if(i<3&&boss.hp===hp&&boss.mark===mark)throw Error('No real combat effect '+i);
 if(i===3&&!squire.present)throw Error('Forged squire did not arrive');
}
startJourneyWithSeed(647486904);gold=100;scrap=100;openBlacksmithShop();
const original=runSkills[0],startingGold=gold,earned=goldEarned;
blacksmithShop.random=smithTestRng([0,.99,.999]);
if(!beginSmithUpgrade()||gold!==startingGold-18)throw Error('Payment');
if(beginSmithUpgrade())throw Error('Double purchase');
shopTap({x:240,y:750});if(mode!=='shop')throw Error('Skipped paid animation');
updateBlacksmithShop(2.6);if(runSkills[0]!==original)throw Error('Quality applied before reveal');
`);
shot('smith-grey','');
const greyText=[];const ctx=sandbox.document.getElementById('game').getContext('2d'),fill=ctx.fillText;
ctx.fillText=function(t,...args){greyText.push(String(t));return fill.call(this,t,...args);};run('render()');ctx.fillText=fill;
assert(!greyText.some(t=>/LEGENDARY|RARE|RESOLVE/.test(t)),'Rarity leaked early');
run(`updateBlacksmithShop(1);if(runSkills[0]===original)throw Error('Upgrade not equipped');
const applied=runSkills[0];updateBlacksmithShop(10);settleSmithOrder();
if(runSkills[0]!==applied||gold!==82||goldEarned!==earned)throw Error('Duplicate settlement');`);
shot('smith-legendary','');
run(`shopTap({x:240,y:680});const good=runSkills[0],paid=gold;
blacksmithShop.random=smithTestRng([0,0]);beginSmithUpgrade();updateBlacksmithShop(5);
if(runSkills[0]!==good||gold!==paid-15||goldEarned!==earned)throw Error('Failure damaged skill/refund');
settleSmithOrder();updateBlacksmithShop(5);if(gold!==paid-15)throw Error('Refund duplicated');`);
shot('smith-failure','');
run(`shopTap({x:240,y:680});gold=0;const before=JSON.stringify(runSkills);
if(beginSmithUpgrade()||gold!==0||JSON.stringify(runSkills)!==before)throw Error('Insufficient money');
gold=100;blacksmithShop.random=smithTestRng([0,.99,.1]);beginSmithUpgrade();
paused=true;const stopped=blacksmithShop.clock;updateBlacksmithShop(5);
if(blacksmithShop.clock!==stopped)throw Error('Pause advanced forge');paused=false;updateBlacksmithShop(5);
shopTap({x:240,y:680});shopTap({x:240,y:750});
if(mode!=='run'||loop!==2||biome!=='forest'||blacksmithShop!==null||runSkills[0].evolutionDepth!==2)throw Error('Continuation');
// Real boss exit opens the smith once, not a reward chain. Squire cannot follow.
startBoss();setMode('boss');squire.present=true;boss.hp=0;defeatBoss();boss.stateT=2.6;updateBoss(.016);
if(mode!=='town'||loop!==2||squire.present||boss)throw Error('Boss -> town');
townTap({x:90,y:450});updateTown(.4);if(mode!=='shop')throw Error('Town -> shop');
gold=65;flashA=0;shakeMag=0;render();`);
shot('smith-browse','');
run(`resetRun();if(blacksmithShop!==null||gold!==0||runSkills.some(s=>s.evolutionDepth))throw Error('Fresh run leaked forge');`);
console.log('BLACKSMITH_OK',JSON.stringify({catalogue:catalogue.count,compiled:catalogue.compiled,chains:4,upgrades:16,
 tests:'route-first, mixed rarity, current branch, cap, insufficient gold, atomic payment/refund, pause, grey reveal, boss/shop/run, reset'}));
