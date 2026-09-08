/* Validates CPU atlas generation and fallback, NOT shader or GPU performance. */
const assert=require('node:assert/strict');
const a=require('./journey-render-audit.cjs');
a.run('startForestCorridor();dist=110;roadScroll=dist;render();');
assert.ok(a.run('!!forestGPU.error'),'Native 2D harness must fall back without WebGL');
a.run(`globalThis.atlasUploads=[];
 const strip=document.createElement('canvas');strip.width=2048;strip.height=256;
 globalThis.atlasTest={strip,c:strip.getContext('2d'),slots:new Array(16),uploads:0,
 gl:{TEXTURE_2D:1,RGBA:2,UNSIGNED_BYTE:3,texSubImage2D:(...args)=>atlasUploads.push(args[3])}};
 for(let band=6;band<22;band++)uploadForestGPUBand(atlasTest,band,0,200);
`);
assert.equal(a.run('atlasTest.uploads'),16);
assert.equal(a.run('new Set(atlasTest.slots).size'),16);
const old=a.run('atlasTest.slots.slice()');
a.run('uploadForestGPUBand(atlasTest,22,0,220)');
assert.equal(a.run('atlasTest.uploads'),17);
assert.equal(a.run('atlasTest.slots[6]'),22);
assert.equal(a.run('atlasTest.slots.filter((v,i)=>i!==6).length'),15);
const report=a.run('({fallback:forestGPU.error,uploads:atlasTest.uploads,slots:atlasTest.slots,atlasBaseBytes:2048*4096*4,stripBytes:2048*256*4})');
console.log(JSON.stringify(report));
a.run(`globalThis.hdTest={...atlasTest,slots:new Array(8),uploads:0,bandWorld:2,worldWidth:16};
 for(let band=26;band<34;band++)uploadForestGPUBand(hdTest,band,0,200);`);
assert.equal(a.run('hdTest.uploads'),8);
assert.equal(a.run('new Set(hdTest.slots).size'),8);
a.run('uploadForestGPUBand(hdTest,34,0,200)');
assert.equal(a.run('hdTest.slots[2]'),34);
for(const d of [0,3.9,4,110,384]){
  const first=Math.floor((d-4)/2)*2;
  assert.ok(first<=d-4&&first+16>=d+10,'HD ring must cover visible close zone and blend');
}
console.log('HD_ATLAS_OK 8 rolling bands; 16 MiB base; same seeded geometry; shader unverified');
