const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {createCanvas}=require('@napi-rs/canvas');
const scope={};vm.createContext(scope);
vm.runInContext(fs.readFileSync('assets/ui/knight-rush-ui.js','utf8'),scope);
const canvas=createCanvas(500,420),g=canvas.getContext('2d');
for(const h of [66,96,162,242,350]){
 g.clearRect(0,0,500,420);scope.KRUI.sheet(g,{x:20,y:20,w:448,h});
 const pixels=g.getImageData(0,0,500,420).data;
 // Stay inside the paper: the cast shadow intentionally falls only downward.
 for(let y=21;y<44;y++)for(let x=34;x<454;x++){
  const top=(y*500+x)*4,bottom=((40+h-1-y)*500+x)*4;
  assert.deepEqual([...pixels.slice(top,top+4)],[...pixels.slice(bottom,bottom+4)],'Top/bottom ornament mirror');
 }
}
// Validate browser state in the production engine, not native-canvas's cached
// style getters (which do not consistently reflect nested restore()).
(async()=>{
 const browser=await require('playwright').chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage();await page.addScriptTag({path:'assets/ui/knight-rush-ui.js'});
  assert(await page.evaluate(()=>{
   const g=document.createElement('canvas').getContext('2d');
   g.translate(3,7);g.fillStyle='#123456';g.font='19px serif';
   const state=()=>JSON.stringify([g.fillStyle,g.font,g.getTransform()]);
   const before=state();KRUI.sheet(g,{x:10,y:20,w:300,h:160});return state()===before;
  }));
  console.log('MATCHING_EDGES_OK production mirror at five panel heights / browser canvas state unchanged');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
