const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {run,canvas}=require('./journey-render-audit.cjs');
const out=path.resolve('output/journey-curved-world');fs.mkdirSync(out,{recursive:true});
run(`SFX.toggle();startJourneyWithSeed(0);godMode=true;dist=100;roadScroll=dist;runDistance=dist;
 roadsideScenery=[];obstacles=[];pickups=[];nextSpawnAt=Infinity;nextTreeAt=Infinity;
 journey.sideTrees=[];journey.oldTrees=[];journey.phase='main';
 for(const z of [12,30,50,70,90,110,140]){
  for(const side of [-1,1])roadsideScenery.push(new RoadsideSceneryEntity(z,side*3,.43,false));
  const o=new ObstacleEntity('boulder',z,[null,'jump',null],'L');o.seed=731;obstacles.push(o);
 }
`);
for(const enabled of [false,true]){
 run(`setCurvedWorldTrial(${enabled});render();`);
 fs.writeFileSync(path.join(out,enabled?'curved.png':'original.png'),canvas.toBuffer('image/png'));
}
const report=JSON.parse(run(`JSON.stringify((()=>{
 let checked=0;for(let z=-3;z<=150;z+=.5){
  const p=proj(z),q=sceneryDepthProjection(z);
  if(Math.abs(linS(p.t)-p.s)>1e-10||Math.abs(q.scale-p.s)>1e-10)throw Error('Scale mismatch');
  if(!Number.isFinite(p.y)||!Number.isFinite(p.s))throw Error('Nonfinite projection');
  if(z<60&&Math.abs(journeyDepthAtY(p.y)-z)>.001)throw Error('Road inverse mismatch');
  checked++;
 }
 const state=JSON.stringify([dist,runDistance,player.x,journeyRoute.seed,obstacles.map(o=>[o.z,o.req])]);
 setCurvedWorldTrial(false);setCurvedWorldTrial(true);
 if(state!==JSON.stringify([dist,runDistance,player.x,journeyRoute.seed,obstacles.map(o=>[o.z,o.req])]))throw Error('Toggle mutated gameplay');
 return {checked,togglePreservesGameplay:true,crest:proj(60),near:proj(0)};
})())`));
assert.equal(report.crest.y,286);assert.equal(report.near.y,634);
run('setCurvedWorldTrial(false);render();');
const original=fs.readFileSync(path.join(out,'original.png'));
assert(original.equals(canvas.toBuffer('image/png')),'Original image does not restore exactly');
// Exercise actual sprite draw paths at both sides of the crest, including
// flat water and tall roots (not only projection arithmetic).
run(`setCurvedWorldTrial(true);roadsideScenery=[];pickups=[];
 for(const theme of ['normal','disco','bloodwood'])for(const kind of ['boulder','pond','root']){
  obstacles=[];
  for(const z of [149,125,90,61,60,59,30,4,-1]){
   const o=new ObstacleEntity(kind,z,kind==='root'?['duck','jump',null]:['jump','jump',null],'L');
   o.roadTheme=theme;o.seed=731;obstacles.push(o);
  }
  render();
 }
 obstacles=[];for(const z of [149,90,60,30,4]){
  dist=stageDistance()-z;roadScroll=dist;render();
 }
 biome='swamp';if(curvedWorldActive())throw Error('Trial leaked into unconverted biome');
 biome='forest';env='cave';if(curvedWorldActive())throw Error('Trial leaked into arena');
`);
console.log('CURVED_WORLD_OK',JSON.stringify(report));
