// Authoring entry only; production and the fixed course share one art renderer.
(()=>{
 const script=document.createElement('script');script.src='assets/forest/sunlit-forest.js';
 script.onerror=()=>{console.error('Sunlit forest renderer could not load');requestAnimationFrame(frame);};
 document.body.appendChild(script);
})();
