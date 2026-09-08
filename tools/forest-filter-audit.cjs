/* Short, isolated bark sampling test; no video or retained frame collection. */
const a=require('./journey-render-audit.cjs');
a.run(`startForestCorridor();dist=110;roadScroll=dist;render();
globalThis.originalBlit=forestBlit;
globalThis.artTest=forestGiantArt(.2,-1);
globalThis.fullLevels=artTest[0].levels;
globalThis.drawBarkTest=(depth)=>{
 g.setTransform(1,0,0,1,0,0);g.fillStyle='#263020';g.fillRect(0,0,480,800);
 const part=artTest[0],scale=525/depth/16;
 let level=part.levels[0];for(const l of part.levels)if(l.factor*scale<=1)level=l;
 forestBlit(level.canvas,240+part.left*scale,650+part.top*scale,scale*level.factor,'high');
};`);
const result={};
for(const version of ['old','new']){
  a.run(version==='old'?
    "artTest[0].levels=fullLevels.filter(l=>[1,2,4,8,16].includes(l.factor));forestBlit=(s,x,y,k)=>originalBlit(s,x,y,k,'low')":
    'artTest[0].levels=[fullLevels.find(l=>l.factor===2)];forestBlit=originalBlit');
  let previous=null,sum=0,max=0;
  for(let i=0;i<10;i++){
    a.run(`drawBarkTest(${132-i*.3})`);a.canvas.toBuffer('image/png');
    const pixels=a.canvas.getContext('2d').getImageData(220,470,40,180).data;
    if(previous){let d=0;for(let j=0;j<pixels.length;j++)if(j%4!==3)d+=Math.abs(pixels[j]-previous[j]);sum+=d;max=Math.max(max,d);}
    previous=pixels;
  }
  result[version]={totalTemporalDifference:sum,peakTemporalDifference:max};
}
a.run('dist=110;roadScroll=dist;render()');a.shot('forest-filtered','');
result.cache=a.run('({closeFoliage:[...forestGiantSprites.values()].reduce((n,a)=>n+(a[1].close?1:0),0),closeBytes:[...forestGiantSprites.values()].reduce((n,a)=>n+(a[1].close?a[1].close.canvas.width*a[1].close.canvas.height*4:0),0)})');
console.log(JSON.stringify(result));
