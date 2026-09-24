/* User-owned approvals. Never auto-promote a generated candidate or update a
   digest to silence an audit. Paths are relative to the Knight Rush root. */
(function(root){
  const registry={version:1,references:[{
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
