import {stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {Readable} from 'node:stream';
import {extname} from 'node:path';
export async function mediaResponse(file:string,request:Request){
 if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405});const info=await stat(file);if(!info.isFile())return new Response(null,{status:404});let start=0,end=info.size-1,status=200;const range=request.headers.get('range');
 const type=({'.mp4':'video/mp4','.mp3':'audio/mpeg','.wav':'audio/wav','.png':'image/png','.jpg':'image/jpeg','.webm':'video/webm'} as Record<string,string>)[extname(file).toLowerCase()]??'application/octet-stream';
 const headers:Record<string,string>={'Accept-Ranges':'bytes','Content-Type':type};
 if(range){const m=/^bytes=(\d*)-(\d*)$/.exec(range);if(!m||(!m[1]&&!m[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${info.size}`}});if(m[1]){start=Number(m[1]);end=m[2]?Math.min(Number(m[2]),end):end;}else start=Math.max(0,info.size-Number(m[2]));if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=info.size)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${info.size}`}});status=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;}
 headers['Content-Length']=String(Math.max(0,end-start+1));if(request.method==='HEAD'||info.size===0)return new Response(null,{status,headers});const stream=createReadStream(file,{start,end});request.signal.addEventListener('abort',()=>stream.destroy(),{once:true});return new Response(Readable.toWeb(stream) as ReadableStream,{status,headers});
}
