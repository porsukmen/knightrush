const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {run,canvas}=require('./journey-render-audit.cjs');
run(fs.readFileSync('assets/encounters/gatherer-scene.js','utf8'));
const out=path.resolve('output/gatherer-lighting');fs.mkdirSync(out,{recursive:true});
const gameState=run('JSON.stringify([mode,gold,scrap,dist,loop,player.hp,journeyMushroomQuest,relics])');
function draw(sun,t){
  run(`g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,480,800);g.save();g.translate(210,680);g.scale(3,3);
    g.fillStyle='#123456';g.globalAlpha=1;
    globalThis.beforeLightContext=g;globalThis.beforeLightMatrix=JSON.stringify(g.getTransform());globalThis.beforeLightStyle=g.fillStyle;globalThis.beforeLightSegment=expSegment;
    ${sun?'KRGathererLighting.draw':'drawMushroomGatherer'}(${t});
    if(g!==beforeLightContext||JSON.stringify(g.getTransform())!==beforeLightMatrix)throw Error('Context / matrix leak');
    if(expSegment!==beforeLightSegment)throw Error('Shoulder adapter leaked into other models');
    ${sun?`if(g.fillStyle!==beforeLightStyle||g.globalAlpha!==1)throw Error('Material state leak: '+beforeLightStyle+' -> '+g.fillStyle+' alpha '+g.globalAlpha);`:''}
    g.restore();`);
  return Buffer.from(canvas.getContext('2d').getImageData(0,0,480,800).data);
}
const original=draw(false,2.4);fs.writeFileSync(path.join(out,'original.png'),canvas.toBuffer('image/png'));
const sun=draw(true,2.4);fs.writeFileSync(path.join(out,'sunlit.png'),canvas.toBuffer('image/png'));
assert(!original.equals(sun),'No material repaint');assert(draw(true,2.4).equals(sun),'Non-deterministic repaint');
assert(draw(false,2.4).equals(original),'Palette leaked into original renderer');
// Only the user-requested left upper-sleeve plane trial may change edge alpha.
// Its original source renderer stays intact; all other body regions must match.
for(let y=0;y<660;y++)for(let x=0;x<480;x++){
  if(x>=52&&x<=158&&y>=350&&y<=464)continue;
  const a=(y*480+x)*4+3;assert.equal(sun[a],original[a],'Repaint changed model silhouette');
}
for(const t of [0,.5,1,2,3,4,5]){
  const pixels=draw(true,t);
  for(let y=0;y<800;y++)assert.equal(pixels[(y*480)*4+3]+pixels[(y*480+479)*4+3],0,'Clipped model edge');
}
assert.equal(run('JSON.stringify([mode,gold,scrap,dist,loop,player.hp,journeyMushroomQuest,relics])'),gameState);
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({technical:'passed',visual:'pending-user-review',checks:['unchanged silhouette outside left shoulder trial','deterministic materials','original colors preserved','no context or segment-adapter leak','animated model not clipped','game state unchanged']},null,2));
console.log('GATHERER_LIGHTING_OK — native geometry / palette / context isolation; visual review pending');
