// Publish the tracked web game and its local dependencies, never local labs'
// generated output, browser profiles, experimental Godot projects or backups.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dest=path.resolve(root,process.argv[2]||'_site');
const files=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
const roots=new Set(['KnightRush.html','ArtTest.html','BackgroundTest.html','MorningForestTest.html','RoadTest.html','RoadCreatorLab.html','UILab.html','ART_STYLE_KESKIN_DUZLEM.md']);
// Production sword-event dependencies, not model labs or Blender sources.
const actorRuntimeFiles=new Set(['walk-poses.js','walk-equipment.js','shield-geometry.js','walk-native.js']
 .map(file=>'art-source/blender/jonathan-approved-v1/'+file));
const selected=files.filter(file=>roots.has(file)||file.startsWith('assets/')||actorRuntimeFiles.has(file)||
 file.startsWith('art-source/knight-rush-sharp-plane/')||file.startsWith('art-source/knight-rush-backgrounds/')||file.startsWith('art-source/knight-rush-special-roads/')||file.startsWith('art-source/knight-rush-ui/')||
 file.startsWith('tools/')&&(file.endsWith('.js')||file.startsWith('tools/skills/')));
fs.mkdirSync(dest,{recursive:true});
for(const file of selected){const target=path.join(dest,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,file),target);}
fs.copyFileSync(path.join(root,'KnightRush.html'),path.join(dest,'index.html'));
for(const file of ['assets/forest/sunlit-forest.js','assets/forest/journey-forest.js','assets/forest/disco-grove.js',
 'assets/encounters/cutscene-handler.js','assets/encounters/event-visuals.js',
 'assets/encounters/jonathan-gpu.js','assets/encounters/jonathan-model.js','assets/encounters/sword-event.js',
 'assets/encounters/oath-sword-art.js','assets/encounters/sword-clearing-v4.png',
 'assets/encounters/sword-clearing-v4-mobile.png','assets/forest/oath-road.js',...actorRuntimeFiles]){
 if(!fs.existsSync(path.join(dest,file)))throw Error('Missing published dependency: '+file);
}
console.log(`PAGES_BUILD_OK ${selected.length+1} files: ${dest}`);
