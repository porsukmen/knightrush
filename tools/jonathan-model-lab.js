/* Shared Jonathan models, user-approved for reuse on 2026-09-28. */
(()=>{'use strict';
 document.title='Jonathan — shared event models';document.body.style.cssText='margin:0;background:#172128;color:#dce6ec;font:15px system-ui;overflow:auto';
 cvs.style.display='none';
 const style=document.createElement('style');style.textContent='#jonathan-model-lab canvas{position:static!important;inset:auto!important;transform:none!important;width:100%!important;height:auto!important;background:transparent!important;max-height:none!important;image-rendering:auto!important}html,body{position:static!important;height:auto!important;min-height:100%;display:block!important;overflow:auto!important;touch-action:auto!important}';document.head.appendChild(style);
 const root=document.createElement('main');root.id='jonathan-model-lab';root.style.cssText='max-width:1120px;margin:auto;padding:24px';
 root.innerHTML='<h1>JONATHAN · FRONT / BACK</h1><p>APPROVED · Shared Jonathan models. Reuse for all future knight appearances. Silver steel / blue plume.</p><p><a style="color:#9bc9eb" href="KnightRush.html?artlab=1">Approved Art Lab</a> · <a style="color:#9bc9eb" href="KnightRush.html?camplab=1">Camp</a></p><label><input id="model-play" type="checkbox" checked> Idle motion</label> <label>View <select id="model-view"><option value="color">Colour</option><option value="grayscale">Grayscale</option><option value="silhouette">Silhouette</option></select></label><section id="model-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:16px;margin-top:18px"></section>';
 document.body.appendChild(root);const grid=root.querySelector('#model-grid'),cards=[];
 for(const [label,opts] of [['MOUNTED · LIVE SOURCE',{mounted:true}],['FRONT · STANDING',{facing:'front'}],['BACK · STANDING',{facing:'back'}],['FRONT · SEATED',{facing:'front',sit:1}],['BACK · SEATED',{facing:'back',sit:1}],['CAMP · COOL DAYLIGHT',{facing:'front',sit:1,lighting:'daylight'}]]){
  const card=document.createElement('article');card.style.cssText='background:#24333e;border:1px solid #435865;padding:12px';
  const title=document.createElement('h3');title.textContent=label;title.style.fontSize='14px';card.appendChild(title);
  const canvas=document.createElement('canvas');canvas.width=500;canvas.height=760;canvas.style.cssText='width:100%;display:block';card.appendChild(canvas);grid.appendChild(card);cards.push({canvas,opts});
 }
 function render(t=0){const saved=g;try{for(const {canvas,opts} of cards){
  g=canvas.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,500,760);
  const footY=opts.mounted?0:KRJonathan.seatedPose(opts.sit||0,opts.facing).legs[0].fy;
  g.fillStyle='#31434e';g.fillRect(45,577+(footY+1.25)*U*4.2,410,2);
  if(opts.mounted){drawSerJonathanRider(250,577+(8-Math.sin(.9)*.34)*U*4.2,4.2,{gallop:0,lean:0});}
  else{KRJonathan.draw(250,577,4.2,{...opts,clock:t});KRJonathan.draw(250,730,1,{...opts,clock:t});}
  const view=root.querySelector('#model-view').value;
  if(view==='silhouette'){g.globalCompositeOperation='source-in';g.fillStyle='#dce6ec';g.fillRect(0,0,500,760);g.globalCompositeOperation='source-over';}
  canvas.style.filter=view==='grayscale'?'grayscale(1)':'none';
 }}finally{g=saved}}
 window.KRJonathanLab={render,cards};root.dataset.ready='1';root.querySelector('#model-view').onchange=()=>render(0);
 function frame(t){render(root.querySelector('#model-play').checked?t/1000:0);requestAnimationFrame(frame)}requestAnimationFrame(frame);
})();
