const {chromium}=require('playwright'),path=require('node:path'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{const p=await b.newPage();await p.addInitScript(()=>requestAnimationFrame=()=>0);await p.goto(pathToFileURL(path.join(root,'KnightRush.html')).href+'?queenlab=1');await p.waitForFunction(()=>window.KRRoyalShuffle&&KREventVisuals.peek('royal-shuffle'));
 await p.evaluate(()=>{const c=document.createElement('canvas');c.width=480;c.height=260;const saved=g;try{g=c.getContext('2d');g.save();g.translate(40,-125);g.scale(.83,.83);KRRoyalShuffle.world(KRRoyalShuffleRules.create(2));g.restore();c.id='queen-preview-export';c.style.cssText='position:fixed;top:0;left:0;width:480px;height:260px;z-index:2147483647';document.body.appendChild(c);}finally{g=saved;}});
 await p.locator('#queen-preview-export').screenshot({path:path.join(root,'assets/encounters/royal-shuffle-preview-v1.png')});
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
