/* Render existing in-game backgrounds unchanged for sky art direction. */
const fs = require('node:fs');
const path = require('node:path');
const audit = require('./journey-render-audit.cjs');
const destination = path.resolve('output/sky-lair-reference');
fs.mkdirSync(destination, {recursive:true});
for (const [name, draw] of [
  ['forest-night', 'drawBackground'],
  ['swamp-sky', 'drawSwampBg'],
  ['volcano-sky', 'drawVolcanoBg'],
  ['bear-lair', 'drawCave'],
  ['hydra-lair', 'drawSwampLair'],
  ['snapper-lair', 'drawMagmaChamber'],
]) {
  audit.run(`g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.clearRect(0,0,480,800);perfNow=8;dist=0;${draw}();g.restore();`);
  fs.writeFileSync(path.join(destination, name + '.png'), audit.canvas.toBuffer('image/png'));
}
console.log('Rendered six original sky/lair backgrounds:', destination);
