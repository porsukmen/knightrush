// Publish the tracked web game and its local dependencies, never local labs'
// generated output, browser profiles, experimental Godot projects or backups.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dest=path.resolve(root,process.argv[2]||'_site');
const files=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
const roots=new Set(['KnightRush.html','ArtTest.html','BackgroundTest.html','MorningForestTest.html','RoadTest.html','RoadCreatorLab.html','UILab.html','ART_STYLE_KESKIN_DUZLEM.md']);
// Production sword-event dependencies, not model labs or Blender sources.
const actorRuntimeFiles=new Set(['walk-poses.js','walk-equipment.js','shield-geometry.js','walk-native.js']
 .map(file=>'art-source/blender/jonathan-approved-v1/'+file));
// Mounted production poses live beside their authoring lab, but are runtime
// dependencies. Publish these explicitly, never lab audits or generated data.
const mountedRuntimeFiles=new Set(['mounted-knight-rig.js','mounted-horse-gpu.js',
 'mounted-horse-saddle.js','mounted-knight-sword.js','mounted-knight-shield.js',
 'mounted-knight-bow.js','mounted-knight-duck.js','mounted-knight-jump.js',
 'mounted-knight-jump-entry.js','mounted-knight-steering.js','mounted-knight-action-gpu.js',
 'mounted-knight-renderer.js','mounted-knight-run-motion.js','mounted-knight-playtest.js']
 .map(file=>'labs/'+file));
// The sword road event uses these native boss modules in production. Keep the
// authoring previews and audits out of the deployed runtime allowlist.
const oathkeeperRuntimeFiles=new Set(['oathkeeper-moves.js','oathkeeper-model.js',
 'boss-sequence-runtime.js','oathkeeper-sequences.js','oathkeeper-physical.js',
 'oathkeeper-moveset.js','oathkeeper-arena.js','oathkeeper-encounter.js']
 .map(file=>'labs/'+file));
const guardianLabFile=file=>['labs/GuardianAttackLab.html','labs/AncientGuardianModelLab.html'].includes(file)||/^labs\/(ancient-guardian-|guardian-attack-).*\.(js|css|png|json)$/.test(file);
const selected=files.filter(file=>guardianLabFile(file)||roots.has(file)||file.startsWith('assets/')||actorRuntimeFiles.has(file)||
 mountedRuntimeFiles.has(file)||oathkeeperRuntimeFiles.has(file)||
 file.startsWith('art-source/knight-rush-sharp-plane/')||file.startsWith('art-source/knight-rush-backgrounds/')||file.startsWith('art-source/knight-rush-special-roads/')||file.startsWith('art-source/knight-rush-ui/')||
 file.startsWith('tools/')&&(file.endsWith('.js')||file.startsWith('tools/skills/')));
fs.mkdirSync(dest,{recursive:true});
for(const file of selected){const target=path.join(dest,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,file),target);}
fs.copyFileSync(path.join(root,'KnightRush.html'),path.join(dest,'index.html'));
for(const file of ['assets/forest/sunlit-forest.js','assets/forest/journey-forest.js','assets/forest/disco-grove.js',
 'assets/encounters/cutscene-handler.js','assets/encounters/event-visuals.js',
 'assets/encounters/jonathan-gpu.js','assets/encounters/jonathan-model.js','assets/encounters/sword-event.js',
 'assets/encounters/oath-sword-art.js','assets/encounters/sword-clearing-v4.png',
 'assets/encounters/sword-clearing-v4-mobile.png','assets/forest/oath-road.js',
 'assets/encounters/oathkeeper-arena-v1.png','assets/encounters/oathkeeper-arena-v1-mobile.png',
 'assets/mounted-runner.js','assets/mounted-combat.js',...actorRuntimeFiles,...mountedRuntimeFiles,...oathkeeperRuntimeFiles]){
 if(!fs.existsSync(path.join(dest,file)))throw Error('Missing published dependency: '+file);
}
console.log(`PAGES_BUILD_OK ${selected.length+1} files: ${dest}`);
