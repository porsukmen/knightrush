// Smoke-test the actual publish directory, without untracked local fallbacks.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=fs.realpathSync(path.resolve(process.argv[2]||'_site'));
const server=http.createServer((req,res)=>{
 if(req.url==='/favicon.ico'){res.writeHead(204);res.end();return;}
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 const relative=path.relative(root,file);
 if(relative.startsWith('..')||path.isAbsolute(relative)){res.writeHead(403);res.end();return;}
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 const type={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png'}[path.extname(file)];
 res.writeHead(200,{'Content-Type':type||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
 try{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],missing=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))missing.push([r.status(),r.url()]);});
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
  await page.waitForFunction(()=>window.KRMountedRunner?.ready,null,{timeout:90000});
  const result=await page.evaluate(()=>{
   SFX.setTestMuted(true);uiConfirm();startBoss();mode='boss';paused=true;pausePhotoMode=true;
   boss.entering=false;boss.rise=1;boss.state='idle';boss.phase='player';boss.x=boss.xTarget=1;squire.present=false;
   player.jumpT=player.duckT=player.swordPreviewT=-1;player.attackAnim=player.counterAnim=0;
   const actions=[];
   for(const lane of [0,1,2])for(const kind of ['none','parry','bash','bow']){
    player.x=player.lane=lane;boss.turnAction=null;player.parryShield=null;
    KRMountedRunMotion.resetLane(KRMountedRunner.laneMotion);
    if(kind==='parry')player.parryShield={phase:'release',releaseFrom:1,t:.3,prepare:1};
    if(kind==='bash'||kind==='bow'){
     paused=false;boss.phase='player';boss.ap=9;boss.resolve=99;boss.playerPhaseSerial++;
     boss.classSkillUseSerial=Object.create(null);boss.skillUseSerial=Object.create(null);
     if(!performPlayerAction(kind==='bash'?compileClassSkillRoute('shield_bash_reinforced'):fightCommand('knight')))throw Error('Command failed: '+kind);
     paused=true;boss.turnAction.t=.7;
    }
    flashA=0;shakeMag=0;render();
    const frame=KRMountedCombat.frame();actions.push({lane,expected:kind,actual:frame.state.action});
   }
   return {ready:KRMountedRunner.ready,actions};
  });
  assert.deepEqual(missing,[],'Missing published assets');assert.deepEqual(errors,[],'Browser errors');
  assert(result.actions.every(x=>x.expected===x.actual),'Wrong mounted action');
  console.log('MOUNTED_PAGES_OK',JSON.stringify(result));
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
