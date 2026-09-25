/* User-owned approvals. Never auto-promote a generated candidate or update a
   digest to silence an audit. Paths are relative to the Knight Rush root. */
(function(root){
  const registry={version:3,references:[{
    id:'mossy-inn-v4',name:'The Mossy Oak / Innkeeper',status:'approved',approvedOn:'2026-09-25',
      approval:'Inn environment remains approved. Rebuilt bartender v2 separately reapproved in Art Lab on 2026-09-26; this archived composite still contains withdrawn actor v1.',
      scope:'Crisp simplified generated interior, scene lighting and counter occlusion. Use current approved isolated Art Lab v2 for the actor, not the archived composite. No UI approval implied.',
    plate:'art-source/knight-rush-backgrounds/approved/mossy-inn-v4.png',plateSha256:'f61b3b251cd6f3b59205084e25d2b30560fde48f340dc07f3392fe57621dedb3',
    composite:'art-source/knight-rush-backgrounds/approved/mossy-inn-v4-composite.png',compositeSha256:'f28787c2c5bd05cacba17c9e48684f43117253bb75f8b62feab08014cc0b9534',
    runtimePlate:'assets/encounters/mossy-inn-v4.png',mobilePlate:'assets/encounters/mossy-inn-v4-mobile.png',dimensions:[1448,1086],mobileDimensions:[768,576],
    actorRenderer:'KRMossyInn.keeper',actorStatus:'approved',actorApprovedOn:'2026-09-26',lightingAdapter:'assets/forest/mossy-inn.js',lightingPrefixEnd:' // Left hand rests;',lightingPrefixSha256:'4a6e01f3ca5d5e4725bc5b9bc543ef9836a77333f6cdeae8b20da5931932922c',
    archivedActorPrefixSha256:'468c186de236640b832b243804bc8c65a6e83dcc55d7c64261e1d3440e4ae71b',fingerprintScope:'Environment prefix protected here. Current reapproved v2 character/pose/material hashes are protected in the Art Lab baseline. Archived v1 actor digest retained for history only.',
    layout:'art-source/knight-rush-backgrounds/mossy-inn-v4/scene-brief.md',lab:'KnightRush.html?backgroundlab=1&scene=mossy-inn',
    notes:'Warm hearth left, cool window right; shelves and drinks behind bar, no stairs behind it; mildly weary face, no held glass; live hand/cloth on counter. V1/V3 plates are not this approval.'
  },{
    id:'autumn-caravan-v1',name:'Autumn Caravan / Seated Merchant',status:'approved',approvedOn:'2026-09-25',
    approval:'User explicitly approved the current merchant background and seated merchant as references.',
    scope:'Generated autumn clearing with native seated merchant, red display cloth, grounded parked wagon, horse and driver. No UI included.',
    plate:'art-source/knight-rush-backgrounds/approved/autumn-caravan-v1.png',plateSha256:'e404769ec22badd71d50c6e4c91aa6961b2140fb7181c57188cc4d1e9914f4bd',
    composite:'art-source/knight-rush-backgrounds/approved/autumn-caravan-v1-composite.png',compositeSha256:'69a955c9355d660e21cc59dc3db91613f0ac82f07c3082fbfd78b9ea94e6f12d',
    runtimePlate:'assets/encounters/autumn-caravan-v1.png',mobilePlate:'assets/encounters/autumn-caravan-v1-mobile.png',dimensions:[1448,1086],mobileDimensions:[768,576],
    actorRenderer:'KRAutumnCaravan.actor',lightingAdapter:'assets/forest/autumn-caravan.js',lightingPrefixEnd:' function drawCutscene(){',lightingPrefixSha256:'87b602efcc314e91793ce942268423140a50de60940951634e92e4b7d2f4b13a',
    layout:'art-source/knight-rush-backgrounds/autumn-caravan-v1/scene-brief.md',lab:'KnightRush.html?backgroundlab=1&scene=autumn-caravan',
    notes:'Warm vibrant autumn material lighting reaches seated legs as well as upper-body rig. Wagon, horse and driver remain native, not baked into the plate. Merchant faces the road; camp stays off traffic lanes.'
  },{
    id:'basalt-hearth-v4',name:'Basalt Hearth / Borin',status:'approved',approvedOn:'2026-09-25',
    approval:'User explicitly requested adding the current forge to approved cutscenes and the dwarf to approved designs.',
    scope:'Simplified generated workshop plus scene-lit live dwarf, foreground anvil and native workpieces. Interior/light/contact reference, not a required UI or biome template.',
    plate:'art-source/knight-rush-backgrounds/approved/basalt-hearth-v4.png',
    plateSha256:'7f432dc1c73dd9627ba2a63abac19557203c93359af587ebaca40d973def8f78',
    composite:'art-source/knight-rush-backgrounds/approved/basalt-hearth-v4-composite.png',
    compositeSha256:'fd0b005f42be3f1de89123e9024a415daa08520e0f13bfa3b187b04f53acd95d',
    runtimePlate:'assets/encounters/basalt-hearth-v4.png',mobilePlate:'assets/encounters/basalt-hearth-v4-mobile.png',
    dimensions:[1448,1086],mobileDimensions:[768,576],
    actorRenderer:'KRBasaltForge.dwarf',lightingAdapter:'assets/forest/basalt-forge.js',lightingPrefixEnd:' const ore=',
    lightingPrefixSha256:'61d25d13528e694eb98b0a5a07c12f33172b145b1f2b856334b1cd7cde045548',
    layout:'art-source/knight-rush-backgrounds/basalt-hearth-v4/scene-brief.md',
    lab:'KnightRush.html?backgroundlab=1&scene=basalt-forge',
    notes:'Quiet broad planes; warm forge left/cool window right; locally recoloured live actor; lowered supported anvil; fixed-length arm rig; visible workpiece volume; same plate reused for occlusion. Earlier v2/v3 scenes and dwarf drafts are not approved.'
  },{
    id:'gatherer-clearing-crisp',name:"The Gatherer's Clearing",status:'approved',
    approvedOn:'2026-09-24',
    approval:'User explicitly approved the current background as the Knight Rush Cutscene reference.',
    scope:'Crisp illustrated environment plus scene-lit live gatherer. A quality anchor, not a forest-only template or UI/layout requirement.',
    plate:'art-source/knight-rush-backgrounds/approved/gatherer-clearing.png',
    plateSha256:'7ad56d51ca6a91acef1b249b0dbf61c0df21c2203cec89fadfb8671f25461065',
    composite:'art-source/knight-rush-backgrounds/approved/gatherer-clearing-composite.png',
    compositeSha256:'4b69cb3cc029b22fef0cde21f50f984f2ed5a6e6461b8057eb4eeae88bad1e7f',
    runtimePlate:'assets/encounters/mushroom-clearing-crisp.png',
    mobilePlate:'assets/encounters/mushroom-clearing-crisp-mobile.png',
    dimensions:[1215,1295],mobileDimensions:[768,819],
    actorRenderer:'drawMushroomGatherer',lightingAdapter:'assets/encounters/gatherer-scene.js',
    lightingPrefixSha256:'fe22167d6b869efb0471eaaf267f7b9fade7d2b0af23a64aa2c7ab4b9fe8243f',
    layout:'art-source/knight-rush-backgrounds/gatherer-near-v3/layout.json',
    notes:'Warm clearing light, cooler reflected shade, consistent teal sleeves, inward shoulder shade planes, separate contact/cast shadows; actor not baked into plate.'
  }]};
  if(typeof module!=='undefined')module.exports=registry;
  else root.KRCutsceneReferences=registry;
})(globalThis);
