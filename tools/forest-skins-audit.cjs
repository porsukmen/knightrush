const fs=require('node:fs');
const {run,canvas,out}=require('./journey-render-audit.cjs');
const {createCanvas}=require(process.env.KNIGHT_CANVAS_MODULE||'@napi-rs/canvas');
const sheet=createCanvas(1440,800),ctx=sheet.getContext('2d');
for(let skin=0;skin<3;skin++){
  run(`drawForestTreeGallery(${skin})`);ctx.drawImage(canvas,skin*480,0);
}
fs.writeFileSync(out+'/tree-plant-families.png',sheet.toBuffer('image/png'));
const result=run(`(()=>{
  for(let i=0;i<12;i++)for(const side of [-1,1]){
    const a=forestGiantArt((i+.1)/12,side),b=forestGiantArt((i+.45)/12,side),v=forestGiantArt((i+.85)/12,side);
    if(a===b||b===v||a[0]!==b[0]||b[0]!==v[0]||a[1]!==v[1]||v.length!==3)throw Error('Plant sharing');
    if(a!==forestGiantArt((i+.1)/12,side))throw Error('Unstable cache');
    // Lower foliage must not be truncated by its canvas boundary.
    const c=a[1].levels[0].canvas,p=c.getContext('2d').getImageData(0,c.height-1,c.width,1).data;
    for(let j=3;j<p.length;j+=4)if(p[j])throw Error('Clipped foliage '+i);
  }
  const surfaces=new Set();let arrays=0;
  for(const art of forestGiantSprites.values()){
    for(const p of art)for(const l of p.levels)surfaces.add(l.canvas);
    for(const l of art.distantLevels)surfaces.add(l.canvas);
    arrays+=art.pixels.byteLength+art.integral.byteLength;
  }
  let bytes=arrays;for(const c of surfaces)bytes+=c.width*c.height*4;
  return {variants:forestGiantSprites.size,sharedCrowns:forestCrownSprites.size,
    rawCacheMiB:bytes/1048576};
})()`);
console.log(JSON.stringify(result));
run('startForestCorridor();dist=44;roadScroll=dist;render()');
fs.writeFileSync(out+'/tree-skins-world.png',canvas.toBuffer('image/png'));
console.log('WORLD_RENDER_OK',run('forestCloseSprites.size'));
