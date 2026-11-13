import type {ProjectDocument,ImportedMedia} from './project';
declare global {interface Window {visionForge:{
 searchStock(key:string,query:string):Promise<{token:string;id:number;creator:string;pageUrl:string;durationSeconds:number;width:number;height:number}[]>;
 downloadStock(path:string,token:string):Promise<ImportedMedia>;
 openStockPage(url:string):Promise<void>;
 requestPlan(path:string,p:ProjectDocument,script:string,c:{endpoint:string;model:string;key?:string}):Promise<unknown>;
 requestSpeech(path:string,text:string,voice:string,c:{endpoint:string;model:string;key?:string}):Promise<ImportedMedia>;
 requestCaptions(path:string,relative:string,c:{endpoint:string;model:string;key?:string}):Promise<string>;
 autosaveProject(p:{projectPath:string;project:ProjectDocument}):Promise<{ok:boolean}>;
 preparePreview(projectPath:string,project:ProjectDocument,range?:{startSeconds:number;durationSeconds:number}):Promise<string>;
 onPreviewProgress(fn:(message:string)=>void):()=>void;
 cancelPreview():Promise<void>;
 cancelExport():Promise<{ok:boolean}>;
 newProject():Promise<{project:ProjectDocument;projectPath:string;recovered?:boolean}|null>;
 openProject():Promise<{project:ProjectDocument;projectPath:string;recovered?:boolean}|null>;
 saveProject(p:{projectPath:string;project:ProjectDocument}):Promise<{ok:boolean;updatedAt:string}>;
 importMedia(path:string):Promise<ImportedMedia[]>;
 createImage(projectPath:string,data:string):Promise<ImportedMedia>;
 relinkMedia(projectPath:string,relative:string,project:ProjectDocument):Promise<{durationSeconds:number|null;importedAt:string}|null>;
 mediaUrl(projectPath:string,relative:string):Promise<string>;
 exportVideo(projectPath:string,project:ProjectDocument):Promise<{canceled:boolean;output?:string}>;
 onExportProgress(fn:(message:string)=>void):()=>void;
 }}}
export {};
