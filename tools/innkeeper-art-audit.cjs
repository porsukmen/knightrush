/* Candidate review only: never updates approved art or reference hashes. */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/innkeeper-art');
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(pathToFileURL(path.join(root,'KnightRush.html')).href);
  await page.waitForFunction(()=>window.KRMossyInn);
  const result=await page.evaluate(()=>{
   const saved={g,perfNow,random:Math.random};
   const before=JSON.stringify([mode,gold,dist,player.currentHealthUnits]);
   let maxBoneError=0,maxContactError=0;
   const pictures=[];
   try{
    Math.random=()=>{throw Error('Character rendering must not consume RNG');};
    for(let i=0;i<=600;i++){
     const p=KRMossyInn.keeperPose(i/60);
     for(const [a,target]of [[p.left,[-30,-54]],[p.right,[34+18*Math.sin(i/60*1.4),-52]]]){
      const len=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
      maxBoneError=Math.max(maxBoneError,Math.abs(len(a.shoulder,a.elbow)-a.upper),Math.abs(len(a.elbow,a.wrist)-a.lower));
      maxContactError=Math.max(maxContactError,len(a.wrist,target));
     }
     if(Math.abs(p.cloth[0]-p.right.wrist[0]-2)>1e-10||p.cloth[1]!==-47)throw Error('Cloth lost palm/counter contact');
     if(i>0){const last=KRMossyInn.keeperPose((i-1)/60);if(Math.abs(p.right.wrist[0]-last.right.wrist[0])>.43)throw Error('Wipe motion jumped');}
    }
    for(const lit of [false,true])for(const t of [0,1,2,3,4,5,Math.asin(.999)/.73,Math.PI/(2*1.4),3*Math.PI/(2*1.4)]){
     const c=document.createElement('canvas');c.width=400;c.height=440;g=c.getContext('2d',{willReadFrequently:true});perfNow=t;
     g.translate(200,397);g.scale(2,2);const transform=Array.from(g.getTransform().toFloat64Array());
     KRMossyInn.keeper(0,0,1,lit);
     // Cloth-coloured pixels along BOTH upper-arm centre lines must remain
     // visible at the exact wipe extremes; torso colour here caught the old bug.
     const sleeve=lit?['ffe0a6','d5bd90','819190']:['e6d6ad','bcaa86','807c68'];
     for(const arm of [KRMossyInn.keeperPose(t).left,KRMossyInn.keeperPose(t).right])for(const u of [.15,.4,.65]){
      const xx=200+2*(arm.shoulder[0]+(arm.elbow[0]-arm.shoulder[0])*u),yy=397+2*(arm.shoulder[1]+(arm.elbow[1]-arm.shoulder[1])*u);
      const rgb=Array.from(g.getImageData(Math.round(xx),Math.round(yy),1,1).data).slice(0,3).map(v=>v.toString(16).padStart(2,'0')).join('');
      const close=sleeve.some(c=>[0,2,4].every(i=>Math.abs(parseInt(c.slice(i,i+2),16)-parseInt(rgb.slice(i,i+2),16))<=5));
      if(!close)throw Error('Upper arm hidden by torso at '+t+'s, u='+u+': '+rgb);
     }
     if(JSON.stringify(transform)!==JSON.stringify(Array.from(g.getTransform().toFloat64Array())))throw Error('Canvas transform leaked');
     if(g.globalAlpha!==1||g.globalCompositeOperation!=='source-over')throw Error('Canvas state leaked');
     const first=c.toDataURL();g.save();g.resetTransform();g.clearRect(0,0,c.width,c.height);g.restore();
     KRMossyInn.keeper(0,0,1,lit);if(first!==c.toDataURL())throw Error('Nondeterministic pose');
     pictures.push({lit,time:t,data:first});
    }
    const board=document.createElement('canvas');board.width=1200;board.height=640;
    const b=board.getContext('2d');b.fillStyle='#202d31';b.fillRect(0,0,1200,640);
    for(let col=0;col<3;col++){
     const c=document.createElement('canvas');c.width=400;c.height=440;g=c.getContext('2d');perfNow=2;
     KRMossyInn.keeper(200,397,2,true);
     if(col===1){const im=g.getImageData(0,0,400,440);for(let i=0;i<im.data.length;i+=4){const y=.2126*im.data[i]+.7152*im.data[i+1]+.0722*im.data[i+2];im.data[i]=im.data[i+1]=im.data[i+2]=y;}g.putImageData(im,0,0);}
     if(col===2){g.globalCompositeOperation='source-in';g.fillStyle='#eadfc2';g.fillRect(0,0,400,440);}
     b.drawImage(c,col*400,0);b.drawImage(c,col*400+152,460,96,106);
     b.fillStyle='#e2cf9e';b.font='17px monospace';b.fillText(['COLOUR','GRAYSCALE','SILHOUETTE'][col],col*400+120,610);
    }
    return{pictures,board:board.toDataURL(),maxBoneError,maxContactError,stateStable:before===JSON.stringify([mode,gold,dist,player.currentHealthUnits])};
   }finally{g=saved.g;perfNow=saved.perfNow;Math.random=saved.random;}
  });
  assert(result.maxBoneError<1e-10);assert.equal(result.maxContactError,0);assert(result.stateStable);assert.deepEqual(errors,[]);
  const save=(name,data)=>fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(data.split(',')[1],'base64'));
  save('review-board',result.board);for(const p of result.pictures)save((p.lit?'hearth':'neutral')+'-'+p.time.toFixed(2),p.data);
  const report={technical:'passed',visual:'candidate-user-review',sampledRigFrames:601,renderedPoses:result.pictures.length,maxBoneError:result.maxBoneError,maxContactError:result.maxContactError,stateStable:result.stateStable};
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(report);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
