/* A small, bounded render audit: never encode video or retain frame arrays. */
const fs=require('node:fs'),path=require('node:path'),{run,canvas,out,sandbox}=require('./journey-render-audit.cjs');
const {loadImage}=require(process.env.KNIGHT_CANVAS_MODULE||'@napi-rs/canvas');
(async()=>{
  sandbox.referenceFloor=await loadImage(path.resolve('assets/forest-trail/forest-floor-v1.png'));
  run('installForestTrailTexture(referenceFloor);startForestCorridor();dist=110;roadScroll=dist;render()');
  const times=[],memory=[];
  for(let i=0;i<10;i++){
    const start=performance.now();run('dist+=.3;roadScroll=dist;render()');times.push(performance.now()-start);
    // Force native deferred raster work to complete, as presentation does in a browser.
    canvas.toBuffer('image/png');
    await new Promise(resolve=>setImmediate(resolve));
    if(i%5===4){if(global.gc)global.gc();memory.push(process.memoryUsage().rss/1048576);}
  }
  fs.writeFileSync(path.join(out,'reference-forest-v1.png'),canvas.toBuffer('image/png'));
  console.log(JSON.stringify({frames:11,medianMs:times.sort((a,b)=>a-b)[5],rssMB:process.memoryUsage().rss/1048576,memory,
    runtime:run('({ready:forestTrail.ready,levels:forestTrail.levels.length,floorBytes:forestTrail.floor.pixels.data.byteLength})')}));
})().catch(error=>{console.error(error);process.exitCode=1;});
