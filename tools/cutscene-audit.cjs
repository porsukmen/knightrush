const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const registry=require('../art-source/knight-rush-backgrounds/cutscene-references.js');
const {assets}=require('../assets/encounters/event-visuals.js');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
const dimensions=file=>{const b=fs.readFileSync(path.join(root,file));assert.equal(b.toString('ascii',1,4),'PNG');return [b.readUInt32BE(16),b.readUInt32BE(20)];};
(async()=>{
  for(const r of registry.references){
    assert.equal(r.status,'approved');assert.equal(hash(r.plate),r.plateSha256,'Approved plate changed');
    assert.equal(hash(r.composite),r.compositeSha256,'Approved composite changed');
    assert.equal(hash(r.runtimePlate),r.plateSha256,'Runtime differs from approved plate; treat a new edit as candidate');
    const lightingSource=fs.readFileSync(path.join(root,r.lightingAdapter),'utf8').replace(/\r\n/g,'\n'),boundary=r.lightingPrefixEnd||'  // Runtime scene shared';
    assert(lightingSource.includes(boundary),'Lighting fingerprint boundary missing');
    const lighting=lightingSource.split(boundary)[0];
    assert.equal(crypto.createHash('sha256').update(lighting).digest('hex'),r.lightingPrefixSha256,'Approved lighting/shoulder adapter changed');
    assert.deepEqual(dimensions(r.runtimePlate),r.dimensions);assert.deepEqual(dimensions(r.mobilePlate),r.mobileDimensions);
  }
  for(const variants of Object.values(assets))for(const [tier,s] of Object.entries(variants)){
    assert.deepEqual(dimensions(s.src),[s.width,s.height],'Manager reservation differs from actual image');
    assert(s.width*s.height*4<=(tier==='mobile'?3:7)*1024*1024);
  }
  await require('./event-visuals-audit.cjs')();
  await require('./cutscene-handler-audit.cjs')();
  console.log('CUTSCENE_OK user-approved references intact / asset metadata / tier budgets. Not a new visual approval.');
})().catch(error=>{console.error(error);process.exitCode=1;});
