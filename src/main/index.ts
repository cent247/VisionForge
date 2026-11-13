import {createStockService,pexelsPage} from './stock';
import {projectMediaRoot} from './media';
import {persistProject,readProject,recoverableAutosave,readProjectOrAutosave} from './project-storage';
import {requestPlan,requestSpeech,requestCaptions,ServiceConfig} from './services';
import {preparePreview} from './preview';
import {mediaResponse} from './media-protocol';
import {importFiles,relinkFile} from './media-management';
import {exportVideo,probe} from './render';
import { validateProject } from '../shared/project.mjs';
import type {IpcMainInvokeEvent} from 'electron';
import { app, BrowserWindow, dialog, ipcMain, protocol, net, shell } from 'electron';
import { copyFile, mkdir, readFile, writeFile, stat, rename, realpath, lstat } from 'node:fs/promises';
import { basename, dirname, extname, join, resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import type { ProjectDocument, TimelineClip, ImportedMedia } from '../renderer/src/types/project';
const here = __dirname;
const stock=createStockService();
if(app.isPackaged&&process.platform==='win32'){process.env.VISIONFORGE_TOOLS=join(process.resourcesPath,'tools','win-x64');process.env.VISIONFORGE_FONTS=join(process.resourcesPath,'fonts');}
const previewsInProgress=new Map<number,AbortController>(),previewFiles=new Map<string,string>();
const exportsInProgress = new Map<number,AbortController>();
const projects = new Set<string>();
protocol.registerSchemesAsPrivileged([{scheme:'vfmedia', privileges:{secure:true,standard:true,stream:true,supportFetchAPI:true}}]);
function checkPath(p:string){const full=resolve(p);if(!projects.has(full))throw new Error('Project is not open in this session.');return full;}
async function mediaPath(projectPath:string, relative:string){
 const root=resolve(dirname(checkPath(projectPath)),'media');
 const target=resolve(dirname(projectPath),relative);
 if(!target.startsWith(root+sep))throw new Error('Invalid media path');
 const actualRoot=await projectMediaRoot(projectPath),actual=await realpath(target);if(!actual.startsWith(actualRoot+sep))throw new Error('Media path escapes the project folder');return actual;
}
function handle(channel:string,fn:(event:IpcMainInvokeEvent,...args:any[])=>any){ipcMain.handle(channel,(event,...args)=>{if(!BrowserWindow.fromWebContents(event.sender)||event.senderFrame!==event.sender.mainFrame)throw new Error('Untrusted IPC sender');return fn(event,...args);});}
function createWindow(){
 const win=new BrowserWindow({width:1480,height:920,minWidth:1080,minHeight:700,webPreferences:{preload:join(here,'../preload/index.js'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 win.webContents.session.setPermissionRequestHandler((_contents,_permission,callback)=>callback(false));
 win.webContents.session.setPermissionCheckHandler(()=>false);
 if(!process.env.ELECTRON_RENDERER_URL)win.webContents.session.webRequest.onHeadersReceived((details,callback)=>callback({responseHeaders:{...details.responseHeaders,'Content-Security-Policy':["default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: vfmedia:; media-src vfmedia:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'"]}}));
 win.webContents.on('preload-error',()=>{dialog.showErrorBox('VisionForge startup failed','The editor could not load its desktop connection. Close VisionForge and report this startup error.');});
 const senderId=win.webContents.id;win.on('closed',()=>{stock.clear(String(senderId));exportsInProgress.get(senderId)?.abort();previewsInProgress.get(senderId)?.abort();});
 win.webContents.setWindowOpenHandler(() => ({action:'deny'}));
 win.webContents.on('will-navigate', e => e.preventDefault());
 if(process.env.ELECTRON_RENDERER_URL)void win.loadURL(process.env.ELECTRON_RENDERER_URL);else void win.loadFile(join(here,'../renderer/index.html'));
}
handle('project:new',async(e)=>{
 const r=await dialog.showSaveDialog(BrowserWindow.fromWebContents(e.sender)!,{defaultPath:'Untitled.vforge',filters:[{name:'VisionForge Project',extensions:['vforge']}]});if(r.canceled||!r.filePath)return null;
 const dir=r.filePath.replace(/\.vforge$/i,'');await mkdir(join(dir,'media'),{recursive:true});const now=new Date().toISOString();
 const project:ProjectDocument={schemaVersion:1,id:randomUUID(),name:basename(dir),createdAt:now,updatedAt:now,settings:{width:1280,height:720,fps:30,aspectRatio:'16:9'},media:[],tracks:[{id:randomUUID(),name:'Video 1',kind:'video',clips:[]},{id:randomUUID(),name:'Audio 1',kind:'audio',clips:[]}]};
 const projectPath=resolve(join(dir,'project.vforge'));await writeFile(projectPath,JSON.stringify(project,null,2),{flag:'wx'});projects.add(projectPath);return{project,projectPath};
});
handle('project:open',async(e)=>{const r=await dialog.showOpenDialog(BrowserWindow.fromWebContents(e.sender)!,{properties:['openFile'],filters:[{name:'VisionForge Project',extensions:['vforge']}]});if(r.canceled||!r.filePaths[0])return null;const projectPath=resolve(r.filePaths[0]),state=await readProjectOrAutosave(projectPath);let project=state.project,recovered=state.damaged;if(state.damaged){const answer=await dialog.showMessageBox({type:'warning',buttons:['Recover autosave','Cancel'],defaultId:0,cancelId:1,message:'The saved project cannot be read. A validated autosave is available. Recover it?'});if(answer.response!==0)return null;}else{const candidate=await recoverableAutosave(projectPath,project);if(candidate){const answer=await dialog.showMessageBox({type:'question',buttons:['Recover autosave','Open saved project'],defaultId:0,message:'A newer autosave is available.'});if(answer.response===0){project=candidate;recovered=true;}}}projects.add(projectPath);return{project,projectPath,recovered};});
handle('project:autosave',async(_e,p:{projectPath:string;project:ProjectDocument})=>{const file=checkPath(p.projectPath);validateProject(p.project);await persistProject(file+'.autosave',p.project);return{ok:true};});
handle('project:save',async(_e,p:{projectPath:string;project:ProjectDocument})=>{const file=checkPath(p.projectPath);validateProject(p.project);const project={...p.project,updatedAt:new Date().toISOString()};await persistProject(file,project);return{ok:true,updatedAt:project.updatedAt};});
handle('media:import',async(_e,projectPath:string)=>{
 const file=checkPath(projectPath);const r=await dialog.showOpenDialog({properties:['openFile','multiSelections'],filters:[{name:'Media',extensions:['mp4','mov','mkv','webm','avi','mp3','wav','m4a','aac','png','jpg','jpeg','webp']}]});if(r.canceled)return[];
 return importFiles(file,r.filePaths);
});
handle('media:image',async(_e,projectPath:string,data:string)=>{checkPath(projectPath);if(typeof data!=='string'||data.length>12000000||!data.startsWith('data:image/png;base64,'))throw new Error('Invalid overlay image');const payload=Buffer.from(data.slice(22),'base64');if(payload.length<24||payload.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error('Invalid PNG overlay');const root=await projectMediaRoot(projectPath);const id=randomUUID(),relativePath=`media/${id}.png`;await writeFile(join(root,id+'.png'),payload,{flag:'wx'});return{id,name:'Text overlay',relativePath,mediaType:'image',durationSeconds:null,importedAt:new Date().toISOString()};});
handle('media:relink',async(_e,projectPath:string,relative:string,project:ProjectDocument)=>{checkPath(projectPath);validateProject(project);if(!/^media\/[a-zA-Z0-9_.-]+$/.test(relative))throw new Error('Invalid media path');const r=await dialog.showOpenDialog({properties:['openFile'],title:'Locate replacement media'});if(r.canceled||!r.filePaths[0])return null;return relinkFile(projectPath,relative,r.filePaths[0],project);});
handle('media:url',async(_e,projectPath:string,relative:string)=>{const file=await mediaPath(projectPath,relative);await stat(file);return `vfmedia://local/${encodeURIComponent(file)}?v=${Date.now()}`;});
handle('video:cancel',e=>{exportsInProgress.get(e.sender.id)?.abort();return{ok:true};});
handle('video:export',async(e,projectPath:string,project:ProjectDocument)=>{
 checkPath(projectPath);previewsInProgress.get(e.sender.id)?.abort();if(exportsInProgress.has(e.sender.id))throw new Error('An export is already running.');const r=await dialog.showSaveDialog({defaultPath:project.name+'.mp4',filters:[{name:'MP4 video',extensions:['mp4']}]});if(r.canceled||!r.filePath)return{canceled:true};
 const controller=new AbortController();exportsInProgress.set(e.sender.id,controller);try{await exportVideo(projectPath,project,r.filePath,message=>{if(!e.sender.isDestroyed())e.sender.send('export:progress',message);},controller.signal);return{canceled:false,output:r.filePath};}catch(error){if(controller.signal.aborted)return{canceled:true};throw error;}finally{exportsInProgress.delete(e.sender.id);}
});
handle('stock:search',async(e,key:string,query:string)=>stock.search(String(e.sender.id),key,query));
handle('stock:download',async(e,path:string,token:string)=>stock.download(String(e.sender.id),token,checkPath(path)));
handle('stock:page',async(_e,url:string)=>{const page=url==='https://www.pexels.com/'?url:pexelsPage(url);await shell.openExternal(page);});
handle('services:plan',async(_e,path:string,p:ProjectDocument,script:string,config:ServiceConfig)=>{checkPath(path);validateProject(p);return requestPlan(config,script,p);});
handle('services:speech',async(_e,path:string,text:string,voice:string,config:ServiceConfig)=>{checkPath(path);return requestSpeech(config,text,voice,path);});
handle('services:captions',async(_e,path:string,relative:string,config:ServiceConfig)=>{checkPath(path);return requestCaptions(config,path,relative);});
handle('preview:cancel',e=>{previewsInProgress.get(e.sender.id)?.abort();});
handle('preview:prepare',async(e,projectPath:string,project:ProjectDocument)=>{checkPath(projectPath);if(exportsInProgress.has(e.sender.id))throw new Error('Wait for export');previewsInProgress.get(e.sender.id)?.abort();const controller=new AbortController();previewsInProgress.set(e.sender.id,controller);try{const file=await preparePreview(projectPath,project,()=>{},controller.signal);controller.signal.throwIfAborted();const token=randomUUID();previewFiles.set(token,file);while(previewFiles.size>16)previewFiles.delete(previewFiles.keys().next().value!);return 'vfmedia://preview/'+token;}finally{if(previewsInProgress.get(e.sender.id)===controller)previewsInProgress.delete(e.sender.id);}});
app.whenReady().then(()=>{
 protocol.handle('vfmedia',async request=>{try{const url=new URL(request.url);if(url.hostname==='preview'){const file=previewFiles.get(url.pathname.slice(1));return file?mediaResponse(file,request):new Response('Forbidden',{status:403});}if(url.hostname!=='local')return new Response('Forbidden',{status:403});const requested=decodeURIComponent(url.pathname.slice(1));for(const p of projects){const root=resolve(dirname(p),'media');if(requested.startsWith(root+sep)){const relative='media/'+basename(requested),actual=await mediaPath(p,relative);if(actual!==await realpath(requested))return new Response('Forbidden',{status:403});return mediaResponse(actual,request);}}return new Response('Forbidden',{status:403});}catch{return new Response('Not found',{status:404});}});
 createWindow();app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)createWindow();});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
