(()=>{'use strict';
const lab=KRAncientGuardianLab,ref=KRAncientGuardianReference,stage=document.querySelector('.stage');
const style=document.createElement('style');style.textContent='.reference-pair{display:grid;grid-template-columns:minmax(0,1fr) 32%;align-items:center;gap:10px}.reference-pair canvas{min-height:0;height:auto;max-height:none}.reference-film video{width:100%;display:block;max-height:72vh;object-fit:contain}.reference-film{margin:0}.reference-film figcaption{font-size:11px;color:#c5c6b5}.reference-tools{padding:8px 0;display:flex;flex-wrap:wrap;gap:7px}.reference-tools button{padding:6px 9px;font-size:12px}.reference-off .reference-film{display:none}.reference-off{grid-template-columns:1fr}@media(max-width:760px){.reference-pair{grid-template-columns:minmax(0,1fr) 35%}}';document.head.append(style);
const pair=document.createElement('div');pair.className='reference-pair';const canvas=document.getElementById('scene');stage.insertBefore(pair,canvas);pair.append(canvas);
const figure=document.createElement('figure');figure.className='reference-film';figure.innerHTML='<video id="motionReference" muted playsinline preload="auto" aria-label="Kendi hareket referansın"></video><figcaption>REFERANSA.MOV · <output id="referenceClock">1.60 s</output></figcaption>';pair.append(figure);
const video=figure.querySelector('video');let videoURL;
// This local Lab server has no byte-range support; a bounded local Blob makes
// exact frame seeking reliable without changing the server or uploading media.
fetch('../output/guardian-reference-motion/reference-local.mp4').then(r=>{if(!r.ok)throw Error(r.status);return r.blob();}).then(blob=>{videoURL=URL.createObjectURL(blob);video.src=videoURL;}).catch(()=>{figure.querySelector('figcaption').textContent='Yerel referans videosu yüklenemedi.';});
addEventListener('pagehide',()=>{if(videoURL)URL.revokeObjectURL(videoURL);});
const bar=document.createElement('div');bar.className='reference-tools';bar.innerHTML='<button id="referencePlay">Referansla birlikte oynat</button><button id="referenceToggle" aria-pressed="true">Referansı gizle</button><span>Video ile aynı zaman · 30 kare/sn</span>';stage.append(bar);
document.getElementById('referencePlay').onclick=()=>{lab.set({time:ref.labStart,playing:true,stopAt:9.75,angle:0,speed:1});document.getElementById('motionSpeed').value='1';};
document.getElementById('referenceToggle').onclick=e=>{const hidden=pair.classList.toggle('reference-off');e.target.textContent=hidden?'Referansı göster':'Referansı gizle';e.target.setAttribute('aria-pressed',String(!hidden));};
document.querySelector('.note').textContent='Video ayak basışları ve ana gövde pozları için referanstır; kişisel sallanmalar aktarılmaz. Seçilmiş ana pozlar temiz hareket eğrileriyle bağlanır. Sol ayak ayrı bir basış noktasına geçerken sağ ayak yerde kalır. Gövde ters döndükten sonra sağ ayak kalkar ve sol destek üzerinde yatay slice gelir. Finalde iki ayak da zemindedir. Kemik uzunlukları sabittir; kayıtlı pozlar korunur. Henüz yalnız Lab çalışmasıdır.';
document.getElementById('spinPlay').parentElement.parentElement.querySelector('p').textContent='Sol ayak kameraya yakın basar → sağ ayak yerdeyken ters gövde → ağırlık sola → sağ ayak kalkışı ve yatay slice → iki ayakla denge.';
document.querySelector('header span').textContent='REFERANS POZLAR · TEMİZLENMİŞ HAREKET';
let lastDesired=-1;
function sync(){const state=lab.state(),time=Math.max(ref.videoStart,Math.min(ref.videoEnd,state.time-ref.labStart+ref.videoStart)),active=state.playing&&state.time>=ref.labStart&&state.time<=9.75;video.playbackRate=state.speed;
 if(active){if(Math.abs(video.currentTime-time)>.10&&!video.seeking)video.currentTime=time;if(video.paused)video.play().catch(()=>{});}
 else {if(!video.paused)video.pause();if(Math.abs(time-lastDesired)>.002&&!video.seeking&&video.readyState>=1){lastDesired=time;video.currentTime=time;}}
 document.getElementById('referenceClock').value=time.toFixed(2)+' s';if(active)lastDesired=-1;requestAnimationFrame(sync);
}video.onloadedmetadata=()=>{video.currentTime=ref.videoStart;};requestAnimationFrame(sync);
})();
