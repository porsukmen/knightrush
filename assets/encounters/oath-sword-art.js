/* Shared ceremonial evolution of Jonathan's parallel steel blade.
   User-directed gold hilt and ruby, with broad angular material planes.
   Jonathan's own equipment remains unchanged. */
(function(root){'use strict';
 const palettes=Object.freeze({
  shrine:{steel:'#d5e1e5',edge:'#fff7e4',steelSide:'#859eae',ridge:'#edf4f7',hilt:'#f2bf38',hiltLit:'#ffe99a',hiltSide:'#b77824',grip:'#e5a42b',gripSide:'#ac691f',gem:'#e73542',gemLit:'#ff8980',gemSide:'#961c39',rust:'#765443',rustLit:'#a77950'},
  neutral:{steel:'#d0dce6',edge:'#ffffff',steelSide:'#8297ac',ridge:'#edf4f7',hilt:'#edbb35',hiltLit:'#ffe7a0',hiltSide:'#a96925',grip:'#dda02b',gripSide:'#995f24',gem:'#de2d42',gemLit:'#ff827b',gemSide:'#841c3c',rust:'#694b40',rustLit:'#996943'}
 });
 const outlines={
  intact:[[-13,0],[13,0],[13,128],[0,150],[-13,128]],
  decayed:[[-13,0],[13,0],[13,41],[8,46],[13,50],[13,81],[7,86],[12,91],[11,129],[0,150],[-13,128],[-13,105],[-8,100],[-13,95],[-13,61],[-8,55],[-13,49]],
  broken:[[-13,0],[13,0],[13,36],[6,45],[1,39],[-5,52],[-13,44]]
 };
 function draw(g,x,y,scale=1,state='intact',light='shrine'){
  if(!outlines[state])state='intact';const m=palettes[light]||palettes.shrine,worn=state!=='intact';
  const path=points=>{g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();};
  const P=(points,c)=>{path(points);g.fillStyle=c;g.fill();};
  const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
  g.save();try{g.translate(x,y);g.scale(scale,scale);
   // Lengthen steel only; the accepted hilt proportions stay unchanged.
   g.save();g.scale(1,1.23);
   g.save();path(outlines[state]);g.clip();R(-13,0,26,151,m.steel);
   R(4,0,9,129,m.steelSide);P([[4,128],[13,128],[0,150]],m.steelSide);
   P([[-13,0],[-8,0],[-8,128],[0,150],[-13,128]],m.edge);
   R(-2,5,3,120,m.ridge);
   if(worn){
    P([[7,12],[13,8],[14,39],[8,46],[3,38],[6,30]],m.rust);
    P([[-14,50],[-7,57],[-9,71],[-3,82],[-6,94],[-14,103]],m.rust);
    P([[-14,51],[-7,57],[-9,63],[-13,60]],m.rustLit);
    P([[8,91],[13,97],[13,129],[0,150],[-5,135],[1,128],[3,111]],m.rust);
   }g.restore();
   if(state==='broken')P([[-13,44],[-5,52],[1,39],[6,45],[13,36],[6,41],[1,35],[-6,47]],m.steelSide);
   g.restore();
   // Golden grip with three broad raised bands, not fine ornamental texture.
   R(-7,-60,14,48,m.grip);R(3,-60,4,48,m.gripSide);
   R(-7,-60,3,48,m.hiltLit);
   for(const yy of [-51,-39,-27]){
    P([[-7,yy],[7,yy-3],[7,yy+1],[-7,yy+4]],m.hilt);
    P([[-7,yy],[3,yy-2],[3,yy],[-7,yy+2]],m.hiltLit);
   }
   // Squared, clipped pommel: a compact ceremonial cap.
   P([[-6,-77],[6,-77],[11,-69],[11,-61],[6,-57],[-6,-57],[-11,-61],[-11,-69]],m.hilt);
   P([[-6,-77],[6,-77],[10,-71],[-7,-71],[-11,-66],[-11,-69]],m.hiltLit);
   P([[6,-77],[11,-69],[11,-61],[6,-57],[3,-61],[6,-66]],m.hiltSide);
   R(-9,-59,18,4,m.hiltSide);R(-9,-60,18,3,m.hiltLit);
   // Broad rising shoulders and blunt, stepped ends. No franchise emblem
   // or feathered wing subdivisions: the silhouette carries the ceremony.
   for(const side of [-1,1]){
    const Q=(points,c)=>P(points.map(([xx,yy])=>[xx*side,yy]),c);
    Q([[7,-14],[20,-22],[31,-34],[32,-24],[44,-6],[32,-7],[20,-10],[9,0]],m.hilt);
    Q([[7,-14],[20,-22],[31,-34],[32,-27],[21,-18],[8,-9]],m.hiltLit);
    Q([[20,-10],[32,-7],[44,-6],[39,-12],[29,-13],[19,-16],[9,-5],[9,0]],m.hiltSide);
   }
   // Central gold socket and red stone share the guard's physical thickness.
   P([[0,-27],[13,-12],[10,5],[0,12],[-10,5],[-13,-12]],m.hiltSide);
   P([[0,-29],[12,-14],[8,3],[0,8],[-10,2],[-12,-14]],m.hilt);
   P([[0,-29],[0,-23],[-8,-13],[-7,0],[-10,2],[-12,-14]],m.hiltLit);
   P([[0,-23],[8,-13],[0,2],[-8,-13]],m.gem);
   P([[0,-23],[0,-11],[-8,-13]],m.gemLit);
   P([[0,-11],[8,-13],[0,2]],m.gemSide);
   if(worn){P([[-37,-10],[-33,-15],[-30,-12],[-33,-9]],m.hiltSide);R(5,-66,3,5,m.hiltSide);}
  }finally{g.restore();}
 }
 root.KROathSwordArt=Object.freeze({draw,palettes,states:Object.freeze(Object.keys(outlines))});
 root.KROathSwordCandidate=root.KROathSwordArt;
})(globalThis);
