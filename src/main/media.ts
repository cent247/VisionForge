import {spawn} from 'node:child_process';
import {dirname,join,resolve,sep} from 'node:path';
import {realpath} from 'node:fs/promises';
export async function projectMediaRoot(projectPath:string){const directory=await realpath(dirname(resolve(projectPath))),root=await realpath(join(directory,'media'));if(!root.startsWith(directory+sep))throw new Error('Media folder escapes project');return root;}
export function executable(bin:string){return process.env.VISIONFORGE_TOOLS?join(process.env.VISIONFORGE_TOOLS,bin+(process.platform==='win32'?'.exe':'')):bin;}
export function inspect(file:string):Promise<{durationSeconds:number|null;hasAudio:boolean;width?:number;height?:number;hasVideo:boolean}>{return new Promise((done,fail)=>{
 const child=spawn(executable('ffprobe'),['-v','error','-show_format','-show_streams','-of','json',file],{windowsHide:true});let out='',err='',overflow=false;
 const timer=setTimeout(()=>child.kill(),15000);child.stdout.on('data',b=>{out+=String(b);if(out.length>2000000){overflow=true;child.kill();}});child.stderr.on('data',b=>{err=(err+String(b)).slice(-1000);});child.once('error',e=>{clearTimeout(timer);fail(e);});child.once('close',code=>{clearTimeout(timer);try{if(code!==0||overflow)throw new Error('Unable to inspect media: '+err);const data=JSON.parse(out),video=data.streams.find((s:any)=>s.codec_type==='video'&&!s.disposition?.attached_pic),seconds=Number(data.format?.duration);done({durationSeconds:Number.isFinite(seconds)&&seconds>0?seconds:null,hasAudio:data.streams.some((s:any)=>s.codec_type==='audio'),hasVideo:!!video,width:video?.width,height:video?.height});}catch(e){fail(e);}});
});}
