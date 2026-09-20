const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {run,canvas,shot,out}=require('./journey-render-audit.cjs');
run('SFX.toggle();openMerchantLab();perfNow=0;');
assert.equal(run('typeof merchantInkPaths'),'undefined','rounded illustration experiment must be removed');
assert.equal(run('typeof merchantProject'),'undefined','old caravan renderer must be removed');
assert.equal(run(`(()=>{const tree=drawTreeArt;let calls=0;
 try{drawTreeArt=(...args)=>{calls++;return tree(...args);};merchantSceneCache=null;render();return calls;}
 finally{drawTreeArt=tree;}})()`),11,'camp must render the actual runner trees');
const state=run('JSON.stringify({stock:merchantShop.stock,gold,relics,phase:merchantShop.phase})');
shot('merchant-depth-browse','');
const cached=run('merchantSceneCache.canvas');
run('render();');assert.equal(run('merchantSceneCache.canvas'),cached,'static caravan should reuse its native-resolution cache');
run(`g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle='#172635';g.fillRect(0,0,480,800);
 const displayItems=[...ARTIFACT_IDS.map(id=>({kind:'artifact',id})),{kind:'heal'},{kind:'mystery',id:'shield'}];
 for(let i=0;i<displayItems.length;i++){
   const x=60+i%4*120,y=58+Math.floor(i/4)*130;
   g.fillStyle='#293e50';g.fillRect(x-55,y-51,110,124);
   drawMerchantProp(displayItems[i],x,y,1.16,false,true);
   smithText(displayItems[i].kind==='artifact'?displayItems[i].id:displayItems[i].kind,x,y+55,10,'#f0d8aa',106);
 }
 g.restore();`);
fs.writeFileSync(path.join(out,'merchant-item-depth-atlas.png'),canvas.toBuffer('image/png'));
assert.equal(run('JSON.stringify({stock:merchantShop.stock,gold,relics,phase:merchantShop.phase})'),state,'drawing must not alter inventory or stock');
run(`merchantShop.stock=[{kind:'artifact',id:'shield',price:30},{kind:'artifact',id:'horn',price:42},
 {kind:'heal',price:12},{kind:'mystery',id:'moon',price:20}];merchantShop.selected=0;`);
shot('merchant-depth-featured','');
run('buyMerchantItem();updateMerchantShop(.9);');shot('merchant-depth-handoff','');
assert.equal(run('merchantShop.phase'),'handoff');
console.log('MERCHANT_ART_OK original runner trees, native angular art, all 22 relics, tonic/package, state isolation, cached background, purchase handoff');
