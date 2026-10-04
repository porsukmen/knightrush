/* file:// documents have opaque origins. Use a dedicated MessageChannel,
 * without relaxing browser security or copying/bundling the game source. */
(()=>{'use strict';
 function connect(frame,ready,failed){
  let connected=false,port=null,pending=null,snapshot=null,sequence=0;
  const proxy={
   set(config){return new Promise((resolve,reject)=>{pending={id:++sequence,resolve,reject};port.postMessage({type:'render',id:sequence,config});});},
   // Editing only samples the drag point and +0.1 on each axis. The native
   // renderer supplies those exact samples, including perspective and pitch.
   project(v){const samples=snapshot?.projectionSamples;if(!samples?.length)throw Error('Projection not ready');const s=samples.reduce((a,b)=>distance(v,a.point)<distance(v,b.point)?a:b);return s.screen.map((n,i)=>n+v.reduce((sum,x,j)=>sum+(x-s.point[j])*s.axes[j][i],0));}
  };
  function distance(a,b){return a.reduce((sum,x,i)=>sum+(x-b[i])**2,0);}
  function attempt(){
   if(connected)return;port?.close();const channel=new MessageChannel();port=channel.port1;
   port.onmessage=({data})=>{
    if(data?.type==='ready'){connected=true;clearInterval(timer);ready(proxy);return;}
    if(!pending||data?.id!==pending.id)return;
    const request=pending;pending=null;
    if(data.type==='error'){request.reject(Error(data.message));return;}
    if(data.type==='rendered'){snapshot=data.result;request.resolve(snapshot);}
   };
   try{frame.contentWindow.postMessage({type:'kr-guardian-file-connect'},'*',[channel.port2]);}catch(error){failed(error);}
  }
  const timer=setInterval(attempt,500);attempt();
  addEventListener('pagehide',()=>{clearInterval(timer);port?.close();},{once:true});
 }
 window.KRGuardianAttackFileBridge=Object.freeze({connect});
})();
