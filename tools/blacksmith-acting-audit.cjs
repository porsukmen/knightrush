const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createCanvas}=require('@napi-rs/canvas');
const {run,canvas}=require('./journey-render-audit.cjs');
run('SFX.toggle();openBlacksmithLab();blacksmithShop.lab.outcome=1;blacksmithShop.lab.quality=4;beginSmithUpgrade();flashA=0;shakeMag=0;');
const pose=(t,success=true,rarity='COMMON',failStyle=0)=>JSON.parse(run(`JSON.stringify(smithActingPose(
 smithKnightPose(0,0,0,true,false,${t}),${t},{success:${success},rarity:'${rarity}',failStyle:${failStyle}}))`));
assert.ok(pose(1.25).right.hy<0,'hammer held overhead');
assert.ok(pose(1.54).right.hy-pose(1.45).right.hy>15,'strike accelerates');
for(const rarity of ['UNCOMMON','RARE','LEGENDARY'])
 assert.deepEqual(pose(3.44,true,rarity),pose(3.44,true,'COMMON'),'do not spoil rarity before reveal');
const reactions=new Set(['COMMON','UNCOMMON','RARE','LEGENDARY'].map(r=>JSON.stringify(pose(4.7,true,r))));
assert.equal(reactions.size,4);
assert.equal(pose(2,false,'COMMON',0).drop,true);
assert.ok(pose(2,false,'COMMON',1).slip>0);
assert.ok(pose(1.8,false,'COMMON',2).right.hx>35);
for(let fail=0;fail<3;fail++)for(let tick=0;tick<=480;tick++){
 const p=pose(tick/60,false,'COMMON',fail);
 for(const key of ['bodyX','bodyY','lean','hop','slip','hammerAngle'])assert.ok(Number.isFinite(p[key]),key);
}
run('updateBlacksmithShop(4.5)');assert.equal(run('blacksmithShop.phase'),'result');
run('updateBlacksmithShop(.5)');assert.equal(run('blacksmithShop.clock'),5);
run('paused=true;updateBlacksmithShop(.5)');assert.equal(run('blacksmithShop.clock'),5);
run('paused=false');
const sheet=createCanvas(480*4,315*3),ctx=sheet.getContext('2d');
const samples=[['Gentle grip',.42,true,0,'COMMON'],['Windup',1.25,true,0,'COMMON'],
 ['Impact',1.55,true,0,'COMMON'],['Follow through',1.7,true,0,'COMMON'],
 ['Common nod',3.8,true,0,'COMMON'],['Uncommon',4.7,true,0,'UNCOMMON'],
 ['Rare celebration',4.7,true,0,'RARE'],['Legendary surprise',3.95,true,0,'LEGENDARY'],
 ['Legendary cheer',5,true,0,'LEGENDARY'],['Drop',2.1,false,0,'COMMON'],
 ['Slip',2.1,false,1,'COMMON'],['Wrong target',1.8,false,2,'COMMON']];
for(let i=0;i<samples.length;i++){
 const [label,t,success,failStyle,rarity]=samples[i];
 run(`blacksmithShop.phase=${t>=4.35?"'result'":"'forge'"};blacksmithShop.clock=${t};blacksmithShop.order.success=${success};blacksmithShop.order.failStyle=${failStyle};
 blacksmithShop.order.rarity='${rarity}';perfNow=${t};render()`);
 const x=i%4*480,y=Math.floor(i/4)*315;
 ctx.fillStyle='#0e111a';ctx.fillRect(x,y,480,315);ctx.fillStyle='#fff';ctx.font='18px sans-serif';ctx.fillText(label,x+12,y+24);
 ctx.drawImage(canvas,0,82,480,280,x,y+35,480,280);
}
const out=path.resolve('output/blacksmith/acting-sheet.png');fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,sheet.toBuffer('image/png'));
console.log('BLACKSMITH_ACTING_OK anticipation/acceleration, 4 rarity reactions, 3 failures, no early rarity leak, result clock and pause');
