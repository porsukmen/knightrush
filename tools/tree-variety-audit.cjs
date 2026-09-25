// Native canopy regression: no new gameplay model IDs or per-frame randomness.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/tree-variety');
(async()=>{
 fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({channel:'msedge',headless:true});
 try{
  for(const [device,width,height,dpr] of [['desktop',1200,900,1],['phone',390,844,2]]){
   const p=await b.newPage({viewport:{width,height},deviceScaleFactor:dpr}),errors=[];p.on('pageerror',e=>errors.push(e.message));
   await p.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?roadcreatorlab=1');
   await p.waitForFunction(()=>window.KRRoadCreatorLab&&window.KRSunlitArt);
   const geometry=await p.evaluate(()=>{
    const a=KRSunlitArt,ctx=document.createElement('canvas').getContext('2d'),failures=[];
    for(const [id,m] of a.models.slice(0,3).entries()){
     const crowns=m.shapes.filter(s=>s.crown).map(s=>s.crown),areas=crowns.map(c=>c.w*c.h);
     if(Math.max(...areas)/Math.min(...areas)<1.7)failures.push({id,uniformCrownSizes:areas});
     if(new Set(crowns.map(c=>c.key.split(':')[0])).size<3)failures.push({id,uniformCrownForms:true});
     // Compound bark/leaf paths must survive the once-only ground clipping.
     for(const s of m.shapes)for(let y=s.top+.3;y<Math.min(0,s.bottom);y+=4)for(let x=s.left+.3;x<s.right;x+=4)
      if(ctx.isPointInPath(s.path,x,y)!==ctx.isPointInPath(s.groundPath,x,y))failures.push({id,groundClip:[x,y]});
     // Every coverage rectangle must really be inside at least one opaque plane.
     for(const r of m.covers)for(let y=r.top+.01;y<r.bottom;y+=.5)for(let x=r.left+.01;x<r.right;x+=.5){
      if(!m.shapes.some(s=>ctx.isPointInPath(s.path,x,y))){failures.push({id,x,y,r});break;}
     }
     for(const s of m.shapes)if(s.crown){const c=s.crown;
      for(let y=-.5;y<.44;y+=.0125)for(let x=-.5;x<.5;x+=.0125)
       if(c.paths.slice(1).some(q=>ctx.isPointInPath(q,x,y))&&!ctx.isPointInPath(c.paths[0],x,y))failures.push({id,lightOutside:[x,y]});
     }
    }
    const canvas=document.createElement('canvas');canvas.width=1050;canvas.height=780;const g=canvas.getContext('2d');
    g.fillStyle='#c8d3bd';g.fillRect(0,0,1050,780);
    for(let id=0;id<3;id++)for(let row=0;row<2;row++){
     const m=a.models[id];g.save();g.translate(175+id*350,360+row*390);g.scale(1.02,1.02);
     for(const s of m.shapes){g.fillStyle=row?'#263a32':s.color;g.fill(s.groundPath);}g.restore();
    }
    return {failures,counts:a.models.slice(0,3).map(m=>m.shapes.length),models:a.models.length,board:canvas.toDataURL()};
   });
   assert.deepEqual(geometry.failures,[],'Canopy occlusion/light geometry is unsafe');assert.deepEqual(geometry.counts,[19,16,15]);assert.equal(geometry.models,8);
   if(device==='desktop')fs.writeFileSync(path.join(out,'canopy-models.png'),Buffer.from(geometry.board.split(',')[1],'base64'));
   for(const theme of ['forest','bloodwood','disco','forge','chest','caravan','inn']){
    await p.evaluate(theme=>{
     KRRoadCreatorLab.setOptions({theme:theme==='forest'?'bloodwood':theme,view:'road'});
     if(theme==='forest'){startJourneyWithSeed(647486904);godMode=true;paused=true;for(let i=0;i<180;i++)update(1/60);}
     for(let i=0;i<24;i++)KRRoadCreatorLab.draw();
    },theme);
    const data=await p.locator('#rc-canvas').evaluate(c=>c.toDataURL());
    fs.writeFileSync(path.join(out,device+'-'+theme+'.png'),Buffer.from(data.split(',')[1],'base64'));
    const state=await p.evaluate(()=>JSON.stringify([dist,player.x,obstacles.map(o=>[o.kind,o.z])])),frozen=[];
    for(let i=0;i<3;i++){await p.evaluate(()=>KRRoadCreatorLab.draw());frozen.push(await p.locator('#rc-canvas').evaluate(c=>c.toDataURL()));}
    assert.equal(frozen[0],frozen[2],'Frozen scenery changed');assert.equal(await p.evaluate(()=>JSON.stringify([dist,player.x,obstacles.map(o=>[o.kind,o.z])])),state);
    const cache=await p.evaluate(()=>KRSunlitArt.report());assert(cache.cacheBytes<=cache.budgetBytes);
   }
   for(const view of ['turn-left','turn-right']){
    await p.evaluate(view=>{KRRoadCreatorLab.setOptions({theme:'bloodwood',view});for(let i=0;i<24;i++)KRRoadCreatorLab.draw();},view);
    const png=await p.locator('#rc-canvas').evaluate(c=>c.toDataURL());fs.writeFileSync(path.join(out,device+'-'+view+'.png'),Buffer.from(png.split(',')[1],'base64'));
   }
   assert.deepEqual(errors,[]);await p.close();
  }
  console.log('TREE_VARIETY_OK mixed-size/form crowns / unchanged plane counts / safe occlusion / seven themes / both turns / frozen pixels / 5 MiB cap');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
