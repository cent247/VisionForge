import {open,rename,rm,readFile,stat} from 'node:fs/promises';
import {dirname} from 'node:path';
import {isDeepStrictEqual} from 'node:util';
import {randomUUID} from 'node:crypto';
import {validateProject} from '../shared/project.mjs';
import type {ProjectDocument} from '../renderer/src/types/project';
const writes=new Map<string,Promise<void>>();
export async function persistProject(file:string,document:ProjectDocument){
 validateProject(document);const serialized=JSON.stringify(document,null,2);if(Buffer.byteLength(serialized)>32*1024*1024)throw new Error('Project document exceeds32MB limit');
 const previous=writes.get(file)??Promise.resolve();const operation=previous.catch(()=>{}).then(async()=>{const temporary=file+'.'+randomUUID()+'.tmp';let handle;try{handle=await open(temporary,'wx');await handle.writeFile(serialized);await handle.sync();await handle.close();handle=undefined;await rename(temporary,file);
 // Directory syncing improves durability on POSIX; Windows does not expose this through fs.
 if(process.platform!=='win32'){const folder=await open(dirname(file),'r');try{await folder.sync();}finally{await folder.close();}}
 }finally{await handle?.close();await rm(temporary,{force:true});}});writes.set(file,operation);try{await operation;}finally{if(writes.get(file)===operation)writes.delete(file);}
}
export async function readProject(file:string):Promise<ProjectDocument>{if((await stat(file)).size>32*1024*1024)throw new Error('Project document exceeds32MB limit');const value=JSON.parse(await readFile(file,'utf8'));validateProject(value);return value;}
export async function recoverableAutosave(file:string,saved:ProjectDocument){try{const [auto,original]=await Promise.all([stat(file+'.autosave'),stat(file)]);if(auto.mtimeMs<=original.mtimeMs)return null;const candidate=await readProject(file+'.autosave');if(candidate.id!==saved.id||isDeepStrictEqual({...candidate,updatedAt:undefined},{...saved,updatedAt:undefined}))return null;return candidate;}catch{return null;}}

export async function readProjectOrAutosave(file:string){try{return {project:await readProject(file),damaged:false};}catch(savedError){try{return {project:await readProject(file+'.autosave'),damaged:true};}catch{throw savedError;}}}
