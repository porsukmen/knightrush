/* Explicit references, not a directory scan. Candidates cannot promote themselves. */
(function(root){
  const registry={
    version:2,
    direction:'Knight/boss blocky massing + merchant/Disco King NPC detail',
    references:[
      {id:'barry',label:'Barrel Barry',role:'Broad human / connected block arms / planted hands',status:'approved',approvedOn:'2026-09-25',symbols:['KRTavernSlide.barry','KRTavernSlide.barryPose','KRTavernSlide.barryMaterials'],image:'approved-barry.png',approvalNote:'User explicitly approved the rebuilt broad torso and articulated arms. Isolated neutral live character only; table, mugs, UI and room are not character references.'},
      {id:'innkeeper',label:'Mossy Oak · Innkeeper',role:'Receding hair / continuous forehead / forward shoulders / wiping cloth',status:'approved',approvedOn:'2026-09-26',symbols:['KRMossyInn.keeper','KRMossyInn.keeperPose','KRMossyInn.keeperMaterials'],image:'approved-innkeeper-v2.png',approvalNote:'User explicitly reapproved the rebuilt bartender after receding-hair, continuous scalp/forehead and forward shoulder-layer fixes. Current neutral live model and wiping animation only; withdrawn v1 and its old composite actor are not shape references.'},
      {id:'seated-merchant',label:'Autumn · Seated Merchant',role:'Seated proportions / folded legs / live merchant rig',status:'approved',approvedOn:'2026-09-25',symbols:['KRAutumnCaravan.actor','KRAutumnCaravan.withRoadFacing','KRAutumnCaravan.withLighting'],image:'approved-seated-merchant.png',approvalNote:'Current seated merchant explicitly approved. No cloth display, wagon, background or UI in the character reference.'},
      {id:'basalt-dwarf',label:'Borin · Basalt Smith',role:'Muscular dwarf / beard / articulated smith',status:'approved',approvedOn:'2026-09-25',symbols:['KRBasaltForge.dwarf','KRBasaltForge.muscularArm','KRBasaltForge.hammerArm','KRBasaltForge.armPose'],image:'approved-basalt-dwarf.png',approvalNote:'User explicitly requested promotion of the current dwarf. Character only; scene approval is separately registered as basalt-hearth-v4.'},
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
    images:['approved-innkeeper-v2.png','approved-barry.png','approved-wagon-merchant.png','approved-item-style.png','blacksmith-character-reference.png','approved-mushroom-gatherer.png','approved-basalt-dwarf.png','approved-seated-merchant.png'],
    visualApproval:'Per-reference explicit user approvals; future edits are not automatically approved'
  };
  if(typeof module!=='undefined')module.exports=registry;
  else root.KR_ART_REFERENCES=registry;
})(globalThis);
