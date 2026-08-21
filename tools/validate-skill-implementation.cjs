'use strict';

/* One mandatory post-implementation gate for every synthesized skill change.
   It intentionally runs the real parser and full runtime audit, then prints
   only the five decisions a designer needs. */
const {spawnSync}=require('node:child_process');
const path=require('node:path');

const root=path.resolve(__dirname,'..'),file=process.argv[2]||'KnightRush.html';
function run(script,...args){
  const result=spawnSync(process.execPath,[path.join(__dirname,script),file,...args],{
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
const combatOutput=run('validate-runtime.cjs','--combat-routes'),
  combatMatch=combatOutput.match(/^COMBAT_ROUTE_RUNTIME_AUDIT (.+)$/m);
if(!combatMatch||!/^COMBAT_ROUTES_OK /m.test(combatOutput))
  throw new Error('Combat-route runtime gate did not report success');
const combat=JSON.parse(combatMatch[1]);
if(!combat.passed||combat.failures.length)
  throw new Error('Combat-route runtime gate failed: '+JSON.stringify(combat));

console.log('STRUCTURE_OK '+JSON.stringify(gate.structure));
console.log('DESIGN_OK '+JSON.stringify(gate.design));
console.log('BUG_OK '+JSON.stringify(gate.bug));
console.log('RARITY_OK '+JSON.stringify(gate.rarity));
console.log('POWER_OK '+JSON.stringify(gate.power));
console.log('COMBAT_ROUTES_OK '+JSON.stringify({routes:combat.routes,
  immediateRoutes:combat.immediateRoutes,chargeRoutes:combat.chargeRoutes,
  patterns:combat.patterns.length,recipes:combat.recipes.length,maxFrames:combat.maxFrames}));
console.log('IMPLEMENTATION_TEMPLATE_OK '+file);
