// Publish the tracked web game and its local dependencies, never local labs'
// generated output, browser profiles, experimental Godot projects or backups.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dest=path.resolve(root,process.argv[2]||'_site');
const files=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
const roots=new Set(['KnightRush.html','ArtTest.html','BackgroundTest.html','MorningForestTest.html','RoadTest.html','ART_STYLE_KESKIN_DUZLEM.md']);
const selected=files.filter(file=>roots.has(file)||file.startsWith('assets/')||
 file.startsWith('art-source/knight-rush-sharp-plane/')||file.startsWith('art-source/knight-rush-backgrounds/')||
 file.startsWith('tools/')&&(file.endsWith('.js')||file.startsWith('tools/skills/')));
fs.mkdirSync(dest,{recursive:true});
for(const file of selected){const target=path.join(dest,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,file),target);}
fs.copyFileSync(path.join(root,'KnightRush.html'),path.join(dest,'index.html'));
for(const file of ['assets/forest/sunlit-forest.js','assets/forest/journey-forest.js','assets/forest/disco-grove.js',
 'assets/encounters/cutscene-handler.js','assets/encounters/event-visuals.js']){
 if(!fs.existsSync(path.join(dest,file)))throw Error('Missing published dependency: '+file);
}
console.log(`PAGES_BUILD_OK ${selected.length+1} files: ${dest}`);
