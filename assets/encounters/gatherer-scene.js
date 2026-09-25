/* Scene-specific material repaint plus a local left-shoulder plane trial.
   The approved source renderer remains untouched; no duplicate character rig. */
(()=>{
  'use strict';
  const palette=Object.freeze({
    // One teal textile on BOTH sleeves: restrained warm highlight, not a mint
    // material on the broad left sleeve and a different blue on the right.
    '#356572':'#287f86','#203e4b':'#234a55','#608d94':'#69a9a4','#274c59':'#28616c',
    // Skin lit by warm clearing sunlight, reflected warmth on the shaded cheek.
    '#c99e72':'#dea46c','#e4bf90':'#ffe1a1','#956c50':'#a97555',
    '#a27752':'#ad734f','#b28764':'#cd9162','#795941':'#815c4d',
    '#b18660':'#c48a56','#f0cf9b':'#fff0bb','#8c6047':'#9b6448','#b9936d':'#e0b27c',
    // Undershirt/cuffs retain broad pale planes, not a glow/white outline.
    '#d9c69b':'#e6d3a0','#eee0b8':'#fff0bd','#c6b38a':'#d7cca0','#ece0b8':'#ebe0b2',
    // Rust scarf becomes a distinct vermilion accent.
    '#934e3b':'#b54e31','#cc8460':'#f39754','#743b33':'#783e36','#b76649':'#d66b3b',
    // Apron: honey/cognac leather; shaded side is not desaturated mud.
    '#ac8251':'#d09b4f','#775231':'#805035','#997145':'#b77736',
    '#b08a53':'#d49e4e','#644831':'#7b4d36','#573f2c':'#65452f',
    '#d1ac6d':'#f4cd78','#c3a06a':'#edc26e','#503e2d':'#584638',
    '#775433':'#965b2b','#d2ac70':'#f4ca77','#c39b62':'#dfb260',
    '#513c2b':'#6d4932','#473b2d':'#484538','#684533':'#834b31',
    '#b6b9a3':'#e3e6bd','#c29760':'#e2b764','#d5b57c':'#ffe09a',
    // Pack and boots catch the same ochre sunlight as the door and timber.
    '#583f2c':'#644834','#946b41':'#b67f3e','#c39c61':'#e3b96a',
    '#70513a':'#96613b','#b08a56':'#e2ad60','#57412f':'#65503c',
    '#947146':'#bc8a4a','#59412f':'#75523b','#aa8050':'#d29b52',
    '#956d44':'#b88349','#292b29':'#383b30',
    '#43505a':'#536c70','#75808a':'#92a59b','#303d48':'#3d515d','#536470':'#69848a',
    // Silver beard: sunlit ivory vs green-blue reflected forest shade.
    '#747465':'#989174','#5b6054':'#606e65','#263831':'#283c39',
    '#666c69':'#7e9186','#aab0a0':'#d5ddbb','#505c58':'#546f6b',
    '#7d8880':'#a5b6a2','#c3c6b0':'#f1e9bf','#566760':'#69877b',
    '#d7d5bb':'#fff1c8','#565245':'#655b49','#bba987':'#d2b67d',
    '#dcd9be':'#fff0c0','#a7b3a2':'#d5dfbd','#64786d':'#819d8d',
    // Cap: directional top light and a visibly shaded under-brim.
    '#76563b':'#97633c','#b18b56':'#dfa45c','#4f3d2f':'#625040',
    '#a7834f':'#c68b46','#d4b577':'#ffe09a','#6b5035':'#70523a',
    '#7a8260':'#799653','#b2b18a':'#c9d78c','#d0b987':'#f0d78a',
    // Basket and its contents are repainted with the hand, using the real rig.
    '#513b29':'#62472e','#c19760':'#e5ba68','#9b723e':'#c28b42',
    '#65482e':'#80532f','#c29658':'#e5b968','#674a30':'#8a592e','#d2ac6e':'#ffe09a',
    '#d3c297':'#f1d9a0','#9d9776':'#ad9f72','#a9533f':'#be5436',
    '#db8960':'#f39a59','#664039':'#7c4637','#efd9a6':'#fff2c3','#dbbb88':'#f2ce8a',
    // Replace the original solid dark ground slab with scene-grounded shadows.
    '#11231e':'rgba(0,0,0,0)'
  });
  const contexts=new WeakMap();
  // Local geometry trial for the screen-left upper sleeve. Replace only its
  // two nested segment fills, at their original point in the draw order, so
  // the vest and forearm still occlude the shoulder correctly.
  function sleevePlanes(original){
    return function(ax,ay,bx,by,width,col){
      if(ax===-27&&ay===-101&&bx===-42&&by===-82&&width===20){
        return original(ax,ay,bx,by,width,'#356572');
      }
      if(ax===-30&&ay===-101&&bx===-44&&by===-84&&width===12){
        const nx=-19/Math.hypot(15,19)*10,ny=-15/Math.hypot(15,19)*10;
        const a=[-27+nx,-101+ny],b=[-42+nx,-82+ny],
          c=[-42-nx,-82-ny],d=[-27-nx,-101-ny];
        const split=(p,q)=>[p[0]+(q[0]-p[0])*.42,p[1]+(q[1]-p[1])*.42];
        const top=split(a,d),bottom=split(b,c);
        // Lit face meets the outside silhouette: no dark border on that edge.
        expPoly([a,b,bottom,top],'#608d94');
        // The shadow has real width, on ONE inward-facing plane, not a frame.
        expPoly([top,bottom,c,d],'#274c59');
        return;
      }
      return original(ax,ay,bx,by,width,col);
    };
  }
  function materialContext(target){
    if(contexts.has(target))return contexts.get(target);
    const methods=new Map(),proxy=new Proxy(target,{
      get(obj,key){const value=Reflect.get(obj,key,obj);if(typeof value!=='function')return value;
        if(!methods.has(key))methods.set(key,value.bind(obj));return methods.get(key);},
      set(obj,key,value){return Reflect.set(obj,key,key==='fillStyle'&&typeof value==='string'?(palette[value]??value):value,obj);}
    });
    contexts.set(target,proxy);return proxy;
  }
  function draw(t){
    const target=g,fill=target.fillStyle,originalSegment=expSegment;target.save();
    try{
      // Warm translucent cast shadow extends down/right, away from upper-left
      // sunlight. Smaller contact shapes anchor each boot; soil stays visible.
      expPoly([[-33,-3],[26,-6],[74,12],[56,20],[8,12],[-34,3]],'rgba(62,77,43,.22)');
      expPoly([[-30,-2],[28,-4],[56,8],[38,13],[-12,7]],'rgba(66,66,35,.20)');
      expPoly([[-32,-3],[-2,-3],[2,2],[-26,4],[-34,1]],'rgba(43,49,31,.42)');
      expPoly([[5,-3],[35,-3],[40,2],[10,4],[4,1]],'rgba(43,49,31,.42)');
      g=materialContext(target);expSegment=sleevePlanes(originalSegment);drawMushroomGatherer(t);
    }finally{expSegment=originalSegment;g=target;target.restore();target.fillStyle=fill;}
  }
  window.KRGathererLighting=Object.freeze({draw,palette,id:'clearing-sunlight-v1'});
  // Runtime scene shared by the real event and the lab's live-game preview.
  // Placement comes from gatherer-near-v3/layout.json; no Blender/lab files load
  // during a run. Keep the source plate in art-source as the editable archive.
  const actor=Object.freeze({x:245.285,y:467.554,scale:(467.554-249.778)/168});
  // Only ONE decoded plate is retained. No extra full-screen backing canvas,
  // pixel readbacks, runtime sharpening or per-frame image allocations.
  const clearing=new URLSearchParams(location.search).get('clearing');
  const variant=clearing==='original'?'original':clearing==='crisp'?'crisp':'simple';
  const assetId=variant==='original'?'gatherer-original':variant==='crisp'?'gatherer':'gatherer-simple';
  let sceneDraws=0,originalColors=false;
  const manager=()=>window.KREventVisuals;
  function prepare(){return manager()?.prefetch(assetId)||Promise.resolve(false);}
  function drawConversation(t){
    const plate=manager()?.peek(assetId);
    if(!plate)return false; // Existing native backdrop is the fallback.
    const target=g;target.save();
    try{
      target.fillStyle='#171e20';target.fillRect(0,-PAD_TOP,480,800+PAD_TOT);
      target.imageSmoothingEnabled=true;target.imageSmoothingQuality='high';target.drawImage(plate,0,0,480,512);
      target.translate(actor.x,actor.y);target.scale(actor.scale,actor.scale);
      if(originalColors)drawMushroomGatherer(t);else draw(t);
      sceneDraws++;return true;
    }finally{target.restore();}
  }
  window.KRGathererScene=Object.freeze({assetId,prepare,drawConversation,
    activate:()=>manager()?.activate(assetId)||Promise.resolve(false),
    release:()=>manager()?.release(assetId),
    setLighting:value=>{originalColors=value==='original';},
    get ready(){return !!manager()?.peek(assetId);},
    report:()=>{const m=manager(),s=m?.describe(assetId),r=m?.report();return {
      status:s?.status||'idle',loads:r?.loads||0,sceneDraws,asset:s?.src,variant,tier:r?.tier,
      sourcePixels:s?.sourcePixels||null,decodedBytes:s?.decodedBytes||0,extraCanvasBytes:0,
      lighting:originalColors?'original':'sunlit'};}});
})();
