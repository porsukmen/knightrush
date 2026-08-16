'use strict';

/* One mandatory post-implementation gate for every synthesized skill change.
   It intentionally runs the real parser and full runtime audit, then prints
   only the five decisions a designer needs. */
const {spawnSync}=require('node:child_process');
const path=require('node:path');

const root=path.resolve(__dirname,'..'),file=process.argv[2]||'KnightRush.html';
function run(script){
  const result=spawnSync(process.execPath,[path.join(__dirname,script),file],{
    cwd:root,encoding:'utf8',maxBuffer:128*1024*1024,windowsHide:true
  });
  if(result.status!==0){
    const output=((result.stdout||'')+'\n'+(result.stderr||'')).trim().split(/\r?\n/);
    console.error(output.slice(-40).join('\n'));
    process.exit(result.status||1);
  }
  return result.stdout||'';
}

const parseOutput=run('validate-html.cjs');
if(!/^PARSE_OK /m.test(parseOutput))throw new Error('Parser gate did not report PARSE_OK');
const runtimeOutput=run('validate-runtime.cjs'),match=runtimeOutput.match(/^IMPLEMENTATION_GATE (.+)$/m);
if(!match)throw new Error('Runtime gate did not publish IMPLEMENTATION_GATE');
const gate=JSON.parse(match[1]);
for(const id of ['structure','design','bug','rarity','power'])
  if(!(gate[id]&&gate[id].passed))throw new Error(id+' gate failed: '+JSON.stringify(gate[id]));

console.log('STRUCTURE_OK '+JSON.stringify(gate.structure));
console.log('DESIGN_OK '+JSON.stringify(gate.design));
console.log('BUG_OK '+JSON.stringify(gate.bug));
console.log('RARITY_OK '+JSON.stringify(gate.rarity));
console.log('POWER_OK '+JSON.stringify(gate.power));
console.log('IMPLEMENTATION_TEMPLATE_OK '+file);
