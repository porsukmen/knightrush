'use strict';

const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(process.argv[2]||process.cwd());
const port=Number.parseInt(process.argv[3]||'8765',10);
const mime=Object.freeze({
  '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8',
  '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif',
  '.svg':'image/svg+xml','.wav':'audio/wav','.mp3':'audio/mpeg','.ogg':'audio/ogg'
});

const server=http.createServer((request,response)=>{
  let pathname;
  try{pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);}
  catch{response.writeHead(400);response.end('Bad request');return;}
  if(pathname==='/')pathname='/KnightRush.html';
  const target=path.resolve(root,'.'+pathname);
  if(target!==root&&!target.startsWith(root+path.sep)){
    response.writeHead(403);response.end('Forbidden');return;
  }
  fs.stat(target,(statError,stat)=>{
    if(statError||!stat.isFile()){
      response.writeHead(404);response.end('Not found');return;
    }
    response.writeHead(200,{'Content-Type':mime[path.extname(target).toLowerCase()]||
      'application/octet-stream','Cache-Control':'no-store'});
    const stream=fs.createReadStream(target);
    stream.on('error',()=>{if(!response.headersSent)response.writeHead(500);response.end();});
    stream.pipe(response);
  });
});

server.listen(port,'127.0.0.1',()=>{
  process.stdout.write(`Knight Rush local server: http://127.0.0.1:${port}/KnightRush.html\n`);
});
