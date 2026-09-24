/* Style inputs: actual approved models only, transparent ground, no UI/scenery. */
const fs=require('node:fs'),path=require('node:path');
const {run,canvas}=require('./journey-render-audit.cjs');
const out=path.resolve('art-source/knight-rush-backgrounds/character-only-references');
fs.mkdirSync(out,{recursive:true});
const models={
  mushroom:`g.translate(215,680);g.scale(3,3);drawMushroomGatherer(2.4);`,
  merchant:`g.translate(240,680);g.scale(2,2);g.translate(-225,-375);drawWanderingMerchant({phase:'browse',clock:0});drawWanderingMerchant({phase:'browse',clock:0},true);`
};
for(const [name,draw] of Object.entries(models)){
  run(`g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.clearRect(0,0,480,800);perfNow=2.4;g.save();${draw}g.restore();`);
  fs.writeFileSync(path.join(out,name+'.png'),canvas.toBuffer('image/png'));
  console.log(name+': transparent, source renderer only');
}
