import {contextBridge,ipcRenderer} from 'electron';
contextBridge.exposeInMainWorld('visionForge',{
 searchStock:(key:string,query:string)=>ipcRenderer.invoke('stock:search',key,query),
 downloadStock:(path:string,token:string)=>ipcRenderer.invoke('stock:download',path,token),
 openStockPage:(url:string)=>ipcRenderer.invoke('stock:page',url),
 requestPlan:(path:string,p:unknown,script:string,c:unknown)=>ipcRenderer.invoke('services:plan',path,p,script,c),
 requestSpeech:(path:string,text:string,voice:string,c:unknown)=>ipcRenderer.invoke('services:speech',path,text,voice,c),
 requestCaptions:(path:string,relative:string,c:unknown)=>ipcRenderer.invoke('services:captions',path,relative,c),
 autosaveProject:(payload:unknown)=>ipcRenderer.invoke('project:autosave',payload),
 preparePreview:(projectPath:string,project:unknown)=>ipcRenderer.invoke('preview:prepare',projectPath,project),
 cancelPreview:()=>ipcRenderer.invoke('preview:cancel'),
 cancelExport:()=>ipcRenderer.invoke('video:cancel'),
 newProject:()=>ipcRenderer.invoke('project:new'),
 openProject:()=>ipcRenderer.invoke('project:open'),
 saveProject:(payload:unknown)=>ipcRenderer.invoke('project:save',payload),
 importMedia:(projectPath:string)=>ipcRenderer.invoke('media:import',projectPath),
 createImage:(projectPath:string,data:string)=>ipcRenderer.invoke('media:image',projectPath,data),
 relinkMedia:(projectPath:string,relative:string,project:unknown)=>ipcRenderer.invoke('media:relink',projectPath,relative,project),
 mediaUrl:(projectPath:string,relative:string)=>ipcRenderer.invoke('media:url',projectPath,relative),
 exportVideo:(projectPath:string,project:unknown)=>ipcRenderer.invoke('video:export',projectPath,project),
 onExportProgress:(fn:(message:string)=>void)=>{const cb=(_e:unknown,message:string)=>fn(message);ipcRenderer.on('export:progress',cb);return()=>ipcRenderer.removeListener('export:progress',cb);}
});
