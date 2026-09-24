/* Explicit references, not a directory scan. Candidates cannot promote themselves. */
(function(root){
  const registry={
    version:1,
    direction:'Knight/boss blocky massing + merchant/Disco King NPC detail',
    references:[
      {id:'knight',label:'Jonathan',role:'Shape anchor',status:'approved',symbols:['drawSerJonathanRider']},
      {id:'bear',label:'Bear',role:'Volume anchor',status:'approved',symbols:['drawBearNatural']},
      {id:'wolf',label:'Grey Wolf',role:'Miniboss anchor',status:'approved',symbols:['drawWolf']},
      {id:'toad',label:'Mire Toad',role:'Miniboss anchor',status:'approved',symbols:['drawMireToad']},
      {id:'merchant',label:'Wandering Merchant',role:'NPC detail anchor',status:'approved',symbols:['drawWanderingMerchant'],image:'approved-wagon-merchant.png'},
      {id:'disco',label:'Disco King',role:'Expression / motion anchor',status:'approved',symbols:['discoBodyPose','drawDiscoKing']},
      {id:'smith',label:'Blacksmith',role:'Steel / articulation anchor',status:'approved',symbols:['smithKnightPose','drawSmithKnight'],image:'blacksmith-character-reference.png'},
      {id:'mushroom',label:'Mushroom Gatherer',role:'Forest NPC anchor',status:'approved',symbols:['drawMushroomGatherer'],image:'approved-mushroom-gatherer.png',approvalNote:'User approved 2026-09-24: empty asking hand, mushrooms in basket. Character only; not approval of the conversation background.'}
    ],
    sharedSymbols:['rigPolygon','rigSegment','rigJoint','px','expPoly','expSegment','drawTreeArt','drawMerchantDisplayItem'],
    images:['approved-wagon-merchant.png','approved-item-style.png','blacksmith-character-reference.png','approved-mushroom-gatherer.png'],
    visualApproval:'pending-user-review'
  };
  if(typeof module!=='undefined')module.exports=registry;
  else root.KR_ART_REFERENCES=registry;
})(globalThis);
