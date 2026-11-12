import {createHash} from 'node:crypto';
import {mkdir,stat,lstat,realpath,readFile,readdir,rm} from 'node:fs/promises';
import {dirname,join,sep} from 'node:path';
import {projectMediaRoot} from './media';
import {exportVideo} from './render';
import {validateProject} from '../shared/project.mjs';
import type {ProjectDocument} from '../renderer/src/types/project';
export async function preparePreview(projectPath:string,p:ProjectDocument,progress:(s:string)=>void,signal?:AbortSignal){
 validateProject(p);const root=await projectMediaRoot(projectPath);const content={settings:p.settings,tracks:p.tracks,captions:p.captions,captionStyle:p.captionStyle};const hash=createHash('sha256').update(JSON.stringify(content));
 for(const id of new Set(p.tracks.flatMap(t=>t.clips.map(c=>c.mediaId)))){const m=p.media.find(m=>m.id===id)!;const file=await realpath(join(dirname(projectPath),m.relativePath));if(!file.startsWith(root+sep))throw new Error('Invalid preview media path');const info=await stat(file);hash.update(JSON.stringify([m,file,info.size,info.mtimeMs]));}
 // Fingerprint the compiled renderer bundle (or compiled test modules), so cache survives edits safely.
 for(const file of ['index.js','render.js','composite.js'])try{hash.update(await readFile(join(__dirname,file)));}catch{}
 try{hash.update(await readFile(join(process.env.VISIONFORGE_FONTS??'resources/fonts','DejaVuSans.ttf')));}catch{}
 const folder=join(dirname(projectPath),'.visionforge-preview');await mkdir(folder,{recursive:true});const expected=join(await realpath(dirname(projectPath)),'.visionforge-preview');if(await realpath(folder)!==expected||(await lstat(folder)).isSymbolicLink())throw new Error('Preview folder must not be redirected');const output=join(folder,hash.digest('hex')+'.mp4');let cached=false;try{const info=await lstat(output);if(!info.isFile()||info.isSymbolicLink())throw new Error('Invalid preview cache entry');cached=true;}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}if(!cached)await exportVideo(projectPath,p,output,progress,signal);
 const old=(await Promise.all((await readdir(folder)).filter(f=>f.endsWith('.mp4')).map(async name=>{const info=await lstat(join(folder,name));return info.isFile()&&!info.isSymbolicLink()?{name,time:info.mtimeMs}:null;}))).filter((entry):entry is {name:string;time:number}=>entry!==null);for(const entry of old.sort((a,b)=>b.time-a.time).slice(3))if(join(folder,entry.name)!==output)await rm(join(folder,entry.name),{force:true});return output;
}
