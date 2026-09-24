/* Native-canvas milestone images: same renderer at portrait and road size. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {run,canvas}=require('./journey-render-audit.cjs');
const out=path.resolve('output/mushroom-pilot');fs.mkdirSync(out,{recursive:true});
const pass=process.argv[2]||'current';
assert(/^[a-z0-9-]+$/.test(pass));
run(`g.setTransform(1,0,0,1,0,0);g.fillStyle='#16252a';g.fillRect(0,0,480,800);
  perfNow=2.4;
  drawSerJonathanRider(70,240,1.6,{});
  drawWolf(186,240,1.6,'idle',0,false);
  g.save();g.translate(298,240);g.scale(.53,.53);g.translate(-225,-375);drawWanderingMerchant({phase:'browse',clock:0});drawWanderingMerchant({phase:'browse',clock:0},true);g.restore();
  drawDiscoKing(419,240,1.25,null,0,0,2.4);
  g.fillStyle='#59706d';g.fillRect(18,258,444,1);
  g.save();g.translate(216,656);g.scale(2,2);drawMushroomGatherer(2.4);g.restore();
  g.save();g.translate(412,657);g.scale(.58,.58);drawMushroomGatherer(2.4);g.restore();
  smithText('REFERENCE / JONATHAN · WOLF · MERCHANT · DISCO',240,25,11,'#dac49a');
  smithText('MUSHROOM GATHERER — CANDIDATE',240,298,13,'#dac49a');
  smithText('PORTRAIT',216,696,11,'#adc3ba');smithText('ROAD',412,696,10,'#adc3ba');`);
fs.writeFileSync(path.join(out,pass+'-comparison.png'),canvas.toBuffer('image/png'));
// Silhouette is composited on a separate canvas, never a filter in the game.
run(`g.clearRect(0,0,480,800);g.save();g.translate(220,630);g.scale(2.3,2.3);drawMushroomGatherer(2.4);g.restore();
  g.globalCompositeOperation='source-in';g.fillStyle='#e3e5d6';g.fillRect(0,0,480,800);
  g.globalCompositeOperation='destination-over';g.fillStyle='#16252a';g.fillRect(0,0,480,800);g.globalCompositeOperation='source-over';`);
fs.writeFileSync(path.join(out,pass+'-silhouette.png'),canvas.toBuffer('image/png'));
console.log('Milestone evidence: '+out+' / '+pass);
