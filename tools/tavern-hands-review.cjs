/* Authoring-only evidence. Captures real renderers; never loads in the game. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const{pathToFileURL}=require('node:url'),{chromium}=require('playwright'),{createCanvas,loadImage}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/tavern-hands'),stage=process.argv[2]||'after';
assert(['before','after'].includes(stage));
const dir=path.join(out,stage);fs.mkdirSync(dir,{recursive:true});
const sourceFiles=['assets/encounters/tavern-slide.js','assets/encounters/duke-bluff.js','assets/encounters/royal-shuffle.js','assets/encounters/tavern-chug.js','assets/encounters/tavern-arm.js','assets/encounters/tavern-games.js','assets/forest/mossy-inn.js'];
if(stage==='before')for(const f of sourceFiles){const to=path.join(dir,path.basename(f));if(!fs.existsSync(to))fs.copyFileSync(path.join(root,f),to);}
const labels={barry:'Barry',duke:'Duke',shuffle:'Royal Shuffle',chugs:'Sir Chugs',arm:'Oakbreaker',keeper:'Bartender'};
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage({viewport:{width:1400,height:1050}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?artlab=1');
 await p.waitForFunction(()=>window.KRArtLab&&document.documentElement.dataset.artLabReady==='1');
 await p.evaluate(()=>{KRArtLab.setOptions({playing:false,action:false,view:'color'});KRArtLab.renderAt(0,true)});
 const refs=await p.locator('.art-card').evaluateAll(ns=>ns.map(n=>({label:n.innerText.split('\n')[0],url:n.querySelector('canvas').toDataURL()})));
 const overview=createCanvas(1120,1240),og=overview.getContext('2d');og.fillStyle='#1a2b31';og.fillRect(0,0,1120,1240);
 for(const[i,r]of refs.entries()){const x=i%4*280,y=Math.floor(i/4)*310;og.fillStyle='#ead7ad';og.font='14px sans-serif';og.fillText(r.label,x+5,y+18);og.drawImage(await loadImage(r.url),x+8,y+26,264,272);if([10,12].includes(i))fs.writeFileSync(path.join(dir,i===10?'reference-merchant.png':'reference-gatherer.png'),Buffer.from(r.url.split(',')[1],'base64'));}
 if(stage==='after'||!fs.existsSync(path.join(dir,'live-reference-overview.png')))fs.writeFileSync(path.join(dir,'live-reference-overview.png'),overview.toBuffer('image/png'));
 for(const f of ['tavern-chug-core.js','tavern-chug.js','tavern-arm-core.js','tavern-arm.js'])await p.addScriptTag({url:pathToFileURL(path.join(root,'assets/encounters',f)).href});
 // Re-render the preserved ORIGINAL source for high-resolution before shots.
 // Never reconstruct an old hand by approximation or modify the production page.
 if(stage==='before'){
  await p.evaluate(()=>{delete window.KRMossyInn;}); // its normal module has a duplicate-load guard
  for(const f of sourceFiles)await p.addScriptTag({url:pathToFileURL(path.join(dir,path.basename(f))).href});
 }
 const frames=await p.evaluate(()=>{
  const saved={g,perfNow},rows=[],before=JSON.stringify([gold,mode,dist]);
  const capture=(id,index,draw,hands)=>{const c=document.createElement('canvas');c.width=960;c.height=1300;g=c.getContext('2d');g.scale(2,2);perfNow=[0,1.12,3.37][index];draw();rows.push({id,index,hands,url:c.toDataURL()});};
  try{for(let i=0;i<3;i++){
   capture('barry',i,()=>KRTavernSlide.barry(false),[[192,327],[288,327]]);
   const ds={phase:i?'revealing':'turn',phaseT:i===1?.45:.9,tell:0},dp=KRDukeBluff.pose([0,1.12,3.37][i],ds);
   capture('duke',i,()=>KRDukeBluff.actor(false,'all',ds),[dp.left.wrist,dp.right.wrist].map(([x,y])=>[240+x,315+y]));
   const qs=KRRoyalShuffleRules.create(12);qs.elapsed=1;
   if(i){qs.phase='surprise';qs.phaseT=i===1?.25:.9;qs.pocketCaught=true;qs.pocketed=true;qs.pocketCardId=qs.cards[0].id;}
   capture('shuffle',i,()=>KRRoyalShuffle.actor(qs,false),KRRoyalShuffle.pose(qs).arms.map(a=>a.wrist.slice(0,2)));
   const cs=KRChugRules.create();cs.elapsed=1;cs.rival.lift=[0,.6,1][i];cs.rival.actual=.65;const cp=KRTavernChug.pose(cs);
   capture('chugs',i,()=>KRTavernChug.actor(false,'all',cs),[cp.wrist,cp.freeWrist]);
   const as={phase:'playing',power:[.5,.18,.82][i],cue:'rest'},ap=KRTavernArm.pose(as,0);
   capture('arm',i,()=>{KRTavernArm.actor(false,'all',as,0);KRTavernArm.player(as,false)},[ap.grip,ap.freeWrist]);
   const kp=KRMossyInn.keeperPose([0,1.12,3.37][i]);
   capture('keeper',i,()=>KRMossyInn.keeper(240,450,1.4,false),[kp.left.wrist,kp.right.wrist].map(([x,y])=>[240+x*1.4,450+y*1.4]));
  }}finally{g=saved.g;perfNow=saved.perfNow;}
  if(before!==JSON.stringify([gold,mode,dist]))throw Error('Rendering changed game state');return rows;
 });
 for(const f of frames)fs.writeFileSync(path.join(dir,`${f.id}-${f.index}.png`),Buffer.from(f.url.split(',')[1],'base64'));
 fs.writeFileSync(path.join(dir,'frames.json'),JSON.stringify(frames.map(({url,...f})=>f),null,2));
 assert.deepEqual(errors,[]);
 if(stage==='after'){
  const prev=JSON.parse(fs.readFileSync(path.join(out,'before/frames.json'))),W=1060,rowH=210;
  const board=createCanvas(W,100+6*rowH),cg=board.getContext('2d');cg.fillStyle='#1a2b31';cg.fillRect(0,0,W,board.height);cg.font='bold 24px sans-serif';cg.fillStyle='#efdbb2';cg.fillText('ESKI',195,38);cg.fillText('YENI',695,38);cg.font='15px sans-serif';cg.fillText('Ayni karakter, ayni poz, ayni olcek — ellerin yakin gorunumu',225,70);
  for(const [r,id]of Object.keys(labels).entries()){
   const index=id==='chugs'?2:0,y=100+r*rowH;cg.fillStyle='#efdbb2';cg.font='bold 17px sans-serif';cg.fillText(labels[id],15,y+22);
   for(const [col,arr,folder]of [[0,prev,'before'],[1,frames,'after']]){
    const f=arr.find(f=>f.id===id&&f.index===index),im=await loadImage(path.join(out,folder,`${id}-${index}.png`));
    for(let k=0;k<2;k++){const[x,yy]=f.hands[k];cg.drawImage(im,(x-38)*2,(yy-34)*2,152,152,col*520+125+k*190,y+36,152,152);}
   }
   cg.fillStyle='#354449';cg.fillRect(15,y+rowH-3,W-30,1);
  }
  fs.writeFileSync(path.join(out,'hands-before-after.png'),board.toBuffer('image/png'));
  const full=createCanvas(1200,760),fg=full.getContext('2d');fg.fillStyle='#1a2b31';fg.fillRect(0,0,1200,760);
  for(const[r,id]of Object.keys(labels).entries()){
   const xx=r%3*400,yy=Math.floor(r/3)*380;fg.fillStyle='#efdbb2';fg.font='16px sans-serif';fg.fillText(labels[id]+' — ESKI / YENI',xx+15,yy+25);
   const ims=await Promise.all(['before','after'].map(folder=>loadImage(path.join(out,folder,`${id}-0.png`))));
   const tmp=createCanvas(960,1300),tg=tmp.getContext('2d');let x0=960,y0=1300,x1=0,y1=0;
   for(const im of ims){tg.clearRect(0,0,960,1300);tg.drawImage(im,0,0);const d=tg.getImageData(0,0,960,1300).data;for(let k=3;k<d.length;k+=4)if(d[k]>20){const n=(k-3)/4,x=n%960,y=Math.floor(n/960);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}}
   const sw=x1-x0+12,sh=y1-y0+12,scale=Math.min(185/sw,318/sh);
   for(const[c,im]of ims.entries())fg.drawImage(im,x0-6,y0-6,sw,sh,xx+c*200+(200-sw*scale)/2,yy+44,sw*scale,sh*scale);
  }
  fs.writeFileSync(path.join(out,'characters-before-after.png'),full.toBuffer('image/png'));
  const motion=createCanvas(1060,1260),mg=motion.getContext('2d');mg.fillStyle='#1a2b31';mg.fillRect(0,0,1060,1260);
  for(const[r,id]of ['duke','shuffle','chugs','arm','keeper'].entries()){
   mg.fillStyle='#efdbb2';mg.font='17px sans-serif';mg.fillText(labels[id]+' — hareket ortasi / uc poz',20,r*250+25);
   for(const [j,index]of [1,2].entries())for(const[col,arr,folder]of [[0,prev,'before'],[1,frames,'after']]){
    const f=arr.find(f=>f.id===id&&f.index===index),im=await loadImage(path.join(out,folder,`${id}-${index}.png`));
    const k=id==='duke'||id==='keeper'?1:0,[x,y]=f.hands[k],xx=j*520+col*220+30;
    mg.font='13px sans-serif';mg.fillText(folder==='before'?'ESKI':'YENI',xx,r*250+50);
    mg.drawImage(im,(x-45)*2,(y-45)*2,180,180,xx,r*250+58,180,180);
   }
  }
  fs.writeFileSync(path.join(out,'motion-before-after.png'),motion.toBuffer('image/png'));
 }
 console.log(stage.toUpperCase()+' hands: 6 actors / 18 deterministic poses / live references captured');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
