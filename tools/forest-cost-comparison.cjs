/* Read-only runtime ablations: no video, no frame retention, short native samples. */
const a=require('./journey-render-audit.cjs');
const results={};
function measure(name,code){
  a.run(code);a.canvas.toBuffer('image/png');
  const samples=[];for(let i=0;i<5;i++){
    const t=performance.now();a.run(code);samples.push(performance.now()-t);
    a.canvas.toBuffer('image/png');
  }
  results[name]=+samples.sort((x,y)=>x-y)[2].toFixed(2);
}
a.run('startForestCorridor();dist=110;roadScroll=dist;render();globalThis.savedFloor=forestStylizedGround;globalThis.savedFar=forestGiantDistanceLayer;globalThis.savedNear=forestGiantTree;');
a.canvas.toBuffer('image/png');
results.corridorCounts=a.run(`(()=>{let near=0,far=0,total=0;for(const chunk of forestCorridor.chunks.values())for(const t of chunk.trees){total++;const d=14+t.z-dist;if(d>0&&784*525/16/d>=.5){if(d>600)far++;else near++;}}return {near,far,total,rows:forestGroundRows.size,marks:[...forestGroundRows.values()].reduce((n,row)=>n+row.reduce((s,a)=>s+a.length/4,0),0)}})()`);
measure('testFull','render()');
measure('testWithoutFloor','forestStylizedGround=()=>{};render();forestStylizedGround=savedFloor');
measure('testWithoutFarTrees','forestGiantDistanceLayer=()=>{};render();forestGiantDistanceLayer=savedFar');
measure('testWithoutNearTrees','forestGiantTree=()=>{};render();forestGiantTree=savedNear');
measure('testWithoutAnyTrees','forestGiantTree=()=>{};forestGiantDistanceLayer=()=>{};render();forestGiantTree=savedNear;forestGiantDistanceLayer=savedFar');
measure('testFloorOnly','forestStylizedGround()');
a.shot('cart-track-ground','');
a.run('pendingJourneyPrototype=false;debugRun=false;startRun(0);dist=110;roadScroll=dist;roadsideScenery=[];obstacles=[];pickups=[];nextTreeAt=dist-4;nextSpawnAt=dist+22;spawnLoopEntities();');
results.normalCounts=a.run('({trees:roadsideScenery.filter(t=>!t.gnd).length,groundProps:roadsideScenery.filter(t=>t.gnd).length,obstacles:obstacles.length,pickups:pickups.length,prototype:runJourneyPrototype,corridor:!!forestCorridor})');
measure('normalFull','render()');
measure('normalFloorOnly','drawRoad()');
a.run('globalThis.savedNormalRoad=drawRoad;globalThis.savedNormalTrees=roadsideScenery;');
measure('normalWithoutFloor','drawRoad=()=>{};render();drawRoad=savedNormalRoad');
measure('normalWithoutScenery','roadsideScenery=[];render();roadsideScenery=savedNormalTrees');
console.log(JSON.stringify(results));
