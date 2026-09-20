const assert=require('node:assert/strict');
const {run}=require('./journey-render-audit.cjs');
const result=JSON.parse(run(`JSON.stringify((()=>{
 startJourneyWithSeed(0,true);
 const saved=journeyRoute,transform=[viewScale,viewX,viewY],samples=[];
 try{
  viewScale=1;viewX=0;viewY=0;
  for(const theme of ['disco','bloodwood']){
   journeyRoute={...saved,from:'a',next:'b',activeEdge:'ab',chosen:[],nodes:[
    {id:'a',type:'road',at:0,x:120,y:240,out:[{id:'ab',to:'b',
     preview:{theme,special:true},events:[],pieces:[
      {theme:'forest',start:0,end:100},{theme,start:100,end:200},
      {theme:'forest',start:200,end:300}]}]},
    {id:'b',type:'road',at:300,x:120,y:540,out:[]}]};
   dist=0;drawJourneyMap();
   for(const y of [270,390,510]){
    const pixel=Array.from(g.getImageData(120,y,1,1).data);
    samples.push({theme,y,pixel,expected:JOURNEY_ROAD_THEMES[theme].color});
   }
  }
 }finally{journeyRoute=saved;[viewScale,viewX,viewY]=transform;}
 return samples;
})())`));
for(const sample of result){
 const expected=sample.expected.slice(1).match(/../g).map(v=>parseInt(v,16));
 assert.deepEqual(sample.pixel,[...expected,255],sample.theme+' at '+sample.y);
}
console.log('JOURNEY_MAP_COLOR_OK full-edge colors including entry and exit buffers');
