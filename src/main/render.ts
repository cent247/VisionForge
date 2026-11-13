import {timelineDuration} from '../shared/timeline.mjs';
import {compositeArgs} from './composite';
import {inspect,executable,projectMediaRoot} from './media';
import {toSrt} from '../shared/captions.mjs';
import {validateProject} from '../shared/project.mjs';
import {copyFile,mkdir,writeFile,rename,rm,realpath} from 'node:fs/promises';
import {basename,dirname,join,resolve,relative,isAbsolute,sep} from 'node:path';
import {randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import type {ProjectDocument} from '../renderer/src/types/project';
export async function probe(file:string){try{return(await inspect(file)).durationSeconds;}catch{return null;}}
function command(args:string[],signal?:AbortSignal,cwd?:string,onProgress?:(percent:number)=>void,total=1):Promise<void>{return new Promise((done,fail)=>{const child=spawn(executable('ffmpeg'),['-progress','pipe:1','-nostats',...args],{windowsHide:true,signal,cwd});let err='',failure:Error|undefined,buffer='',last=-1;child.stdout.on('data',chunk=>{buffer+=String(chunk);const lines=buffer.split('\n');buffer=lines.pop()??'';for(const line of lines){const m=/^out_time_us=(\d+)/.exec(line);if(m){const percent=Math.min(100,Math.max(0,Math.floor(Number(m[1])/1000000/total*100)));if(percent!==last){last=percent;onProgress?.(percent);}}}});child.stderr.on('data',b=>{err=(err+String(b)).slice(-4000);});child.on('error',e=>{failure=e;});child.on('close',code=>failure?fail(failure):code===0?done():fail(new Error(`FFmpeg exited ${code}: ${err}`)));});}

// Keep large filter graphs and absolute media paths off the Windows command line.
export async function fileBackedCompositeArgs(args:string[],folder:string){
 const result=[...args],index=result.indexOf('-filter_complex');
 if(index<0)throw new Error('Missing timeline filter graph');
 await writeFile(join(folder,'timeline.ffgraph'),result[index+1],{flag:'wx'});
 result.splice(index,2,'-/filter_complex','timeline.ffgraph');
 for(let i=0;i<result.length-1;i++)if(result[i]==='-i'&&isAbsolute(result[i+1]))result[i+1]=relative(folder,result[i+1]);
 return result;
}

export async function exportVideo(projectPath:string,document:ProjectDocument,output:string,progress:(message:string)=>void,signal?:AbortSignal){
 validateProject(document);signal?.throwIfAborted();const p=structuredClone(document),root=await projectMediaRoot(projectPath);const outputParent=await realpath(dirname(resolve(output))),actualOutput=join(outputParent,basename(output));const normalized=(value:string)=>process.platform==='win32'?value.toLowerCase():value;const projectFile=await realpath(projectPath);if(normalized(actualOutput)===normalized(projectFile)||normalized(actualOutput)===normalized(projectFile+'.autosave')||normalized(actualOutput).startsWith(normalized(root+sep)))throw new Error('Export cannot overwrite a project file or imported project media. Choose another output folder.');const used=new Set(p.tracks.flatMap(t=>t.clips.map(c=>c.mediaId)));
 let checked=0;const usedMedia=p.media.filter(m=>used.has(m.id));for(const m of usedMedia){progress(`Checking media ${++checked}/${usedMedia.length}`);const path=await realpath(resolve(dirname(projectPath),m.relativePath));if(!path.startsWith(root+sep))throw new Error('Media path escapes project');const meta=await inspect(path);if(m.mediaType==='audio'&&!meta.hasAudio||m.mediaType!=='audio'&&!meta.hasVideo)throw new Error('Invalid media type: '+m.name);m.hasAudio=meta.hasAudio;}
 const temporary=join(dirname(projectPath),'.render-'+randomUUID()),staging=join(dirname(output),'.visionforge-'+randomUUID()+'.mp4');await mkdir(temporary);
 try{progress('Rendering timeline');const mixed=join(temporary,'mixed.mp4');const args=await fileBackedCompositeArgs(compositeArgs(projectPath,p),temporary);await command([...args,mixed],signal,temporary,percent=>progress('Rendering timeline '+percent+'%'),timelineDuration(p));
 if(p.captions?.length){progress('Rendering captions');await writeFile(join(temporary,'captions.srt'),toSrt(p.captions));const fonts=join(temporary,'fonts');await mkdir(fonts);const font=process.env.VISIONFORGE_FONTS??resolve('resources/fonts');try{await copyFile(join(font,'DejaVuSans.ttf'),join(fonts,'DejaVuSans.ttf'));}catch{}const style=p.captionStyle??{};
 await command(['-y','-i',mixed,'-i','captions.srt','-vf',`subtitles=filename=captions.srt:fontsdir=fonts:original_size=${p.settings.width}x${p.settings.height}:force_style='FontName=DejaVu Sans,PlayResX=${p.settings.width},PlayResY=${p.settings.height},FontSize=${style.fontSize??Math.round(p.settings.height*.045)},Outline=${style.outline??2},MarginV=${style.bottomMargin??24}'`,'-map','0:v','-map','0:a?','-map','1:0','-c:v','libx264','-preset','veryfast','-threads','2','-pix_fmt','yuv420p','-c:a','copy','-c:s','mov_text','-metadata:s:s:0','language=eng','-movflags','+faststart',staging],signal,temporary,percent=>progress('Rendering captions '+percent+'%'),timelineDuration(p));
 }else await copyFile(mixed,staging);signal?.throwIfAborted();await rename(staging,output);progress('Export complete');
 }finally{await rm(temporary,{recursive:true,force:true});await rm(staging,{force:true});}
}
