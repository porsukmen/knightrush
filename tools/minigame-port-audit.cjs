const assert=require('node:assert/strict'),fs=require('node:fs');
const {run,canvas,out}=require('./journey-render-audit.cjs');
const source=fs.readFileSync('KnightRushMinigame.html','utf8').replace(/\r\n/g,'\n');
const current=fs.readFileSync('KnightRush.html','utf8').replace(/\r\n/g,'\n');
const marker='/* ============================== MINIGAMES';
const donor=source.slice(source.indexOf(marker),source.indexOf('/* ---------- menus, cinematics, overlays ---------- */',source.indexOf(marker)));
// Only these adapters gained seeded RNG, Journey result copy and single-attempt
// return guards. Keep the original strict art/rules check for every other function.
const journeyAdapters='makeLockpickPins|beginLockpickingRound|drawLockpickingGame|makeWishingWellSetup|beginWishingWellThrow|drawWishingWellGame|beginArmWrestlingMatch|drawArmWrestlingGame';
const withoutJourneyAdapters=text=>text.replace(new RegExp('function ('+journeyAdapters+')\\([^]*?\\n\\}', 'g'),(_,name)=>'/* Journey adapter: '+name+' */');
assert(withoutJourneyAdapters(current).includes(withoutJourneyAdapters(donor)),'Non-adapter minigame rules/art must remain unchanged');
const cases=[
  ['disco_king','discoGame','beginDiscoRun()'],
  ['coin_slots','slotGame','beginSlotSpin()'],
  ['punch_bag','punchGame','throwPunch()'],
  ['wobbly_joust','joustGame','beginJoustHold()'],
  ['three_blades','swordGame','beginSwordDuelRun()'],
  ['find_the_queen','findQueenGame','beginFindQueenRound()'],
  ['chicken_derby','chickenRaceGame','openChickenBetting();beginChickenRace()'],
  ['log_balance','logBalanceGame','beginLogBalanceRound()'],
  ['lockpick_chest','lockpickGame','beginLockpickingRound()'],
  ['drinking_contest','drinkGame','beginDrinkingContest()'],
  ['wishing_well','wellGame','beginWishingWellThrow()'],
  ['boulder_panic','boulderGame','beginBoulderingRun()'],
  ['royal_arm_wrestle','armWrestleGame','beginArmWrestlingMatch()'],
  ['duke_doubledown_dice','diceGame','beginDiceGuessRound()'],
  ['sir_flips_a_blade','knifeGame','beginKnifeFlipRun()'],
  ['prospectors_gold_pan','goldPanGame','beginGoldPanningRun()'],
  ['master_cinders_forge','forgeGame','beginBlacksmithRun()'],
  ['silken_fingers','pickpocketGame','beginPickpocketRun()'],
  ['tavern_table_slide','tavernSlideGame','beginTavernSlideMatch()']
];
run(`SFX.toggle();pendingJourneyPrototype=false;startRun(0);dist=71;runDistance=71;roadScroll=71;
  globalThis.portProgress=JSON.stringify({dist,runDistance,loop,player,skills:runSkills});
  openMinigamesMenu();render();`);
fs.writeFileSync(out+'/minigames-menu.png',canvas.toBuffer('image/png'));
for(const [id,state,begin] of cases){
  try{
    run(`MINIGAMES.get('${id}').start();render();${begin};render();`);
    for(let step=0;step<8;step++)run(`for(let i=0;i<120;i++)update(1/60);render();`);
    const result=run(`JSON.stringify({mode,phase:${state}.phase})`);
    run(`handleAction('tap',{x:40,y:70});if(mode!=='minigames')throw Error('Back did not return');
      if(portProgress!==JSON.stringify({dist,runDistance,loop,player,skills:runSkills}))throw Error('Minigame changed campaign');`);
    console.log(id+' OK '+result);
  }catch(error){throw Error(id+': '+error.stack);}
}
run(`startPunchBag();handleMinigameKeyDown({key:' ',repeat:false,preventDefault(){}});
  if(punchGame.score!==1||keyboardParryHeld)throw Error('Punch key routed to parry');
  autoPause();if(!paused)throw Error('Background did not pause');
  if(handleMinigameKeyDown({key:' ',repeat:false,preventDefault(){}}))throw Error('Paused keyboard acted');
  if(punchGame.score!==1)throw Error('Paused punch changed');
  paused=false;leavePunchBag();closeMinigamesMenu();
  pendingJourneyPrototype=true;startRun(0);if(!runJourneyPrototype)throw Error('Journey entry lost');
  pendingJourneyPrototype=false;startRun(0);if(runJourneyPrototype)throw Error('PLAY isolation lost');`);
console.log('MINIGAME_PORT_OK 19 games; unchanged non-adapter source; intro/update/render/back; campaign isolation; pause; parry isolation');
