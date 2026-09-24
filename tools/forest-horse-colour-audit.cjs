// Compare the same live rider pose in classic and sunlit Journey.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const before=process.argv.includes('--before'),out=path.resolve('output/forest-horse-colour',before?'before':'after');
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const results=[];
  for(const [device,width,height]of [['desktop',775,1000],['phone',390,844]]){
   const page=await browser.newPage({viewport:{width,height}}),errors=[],palettes={};
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
   await page.goto(pathToFileURL(path.resolve('KnightRush.html')).href);
   await page.waitForFunction(()=>!!window.KRSunlitForest);
   const run=s=>page.evaluate(s=>(0,eval)(s),s);
   for(const style of ['classic','sunlit']){
    await run(`journeyForestStyle='${style}';startJourneyWithSeed(647486904);godMode=true;
     for(let i=0;i<120;i++)update(1/60);perfNow=5;player.gallop=1.2;render();`);
    await page.screenshot({path:path.join(out,`${device}-${style}.png`)});
    const result=await run(`(()=>{
     const main=g,original=drawSerJonathanRider,c=document.createElement('canvas');
     c.width=460;c.height=650;let material;
     try{g=c.getContext('2d');g.fillStyle='#777b71';g.fillRect(0,0,460,650);
      g.translate(230,480);g.scale(2.8,2.8);g.translate(-laneX(player.x,1),-PLAYER_Y);
      drawSerJonathanRider=(x,y,s,o)=>{
       const horse=o.appearance?.horse||o.horse||'#6f4327';
       g.fillStyle=o.appearance?.horseMane||shade(horse,-48);
       material={horse,mane:g.fillStyle,armor:o.appearance?.armor||'#919da7'};
       return original(x,y,s,o);
      };drawPlayer();
     }finally{g=main;drawSerJonathanRider=original;}
     return {material,image:c.toDataURL()};
    })()`);
    palettes[style]=result.material;
    fs.writeFileSync(path.join(out,`${device}-${style}-rider.png`),Buffer.from(result.image.split(',')[1],'base64'));
   }
   if(!before)assert.equal(palettes.sunlit.mane,palettes.classic.mane,'Daylight must retain the original brown mane/tail material');
   assert.notEqual(palettes.sunlit.armor,palettes.classic.armor,'Keep the rest of the sunlight profile');
   assert.deepEqual(errors,[]);results.push({device,palettes});await page.close();
  }
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(results,null,2));
  console.log('FOREST_HORSE_COLOUR',JSON.stringify(results));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
