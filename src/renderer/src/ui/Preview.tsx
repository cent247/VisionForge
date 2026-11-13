import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {timelineDuration} from '../../../shared/timeline.mjs';
import type {ProjectDocument} from '../types/project';
type Range={startSeconds:number;durationSeconds:number};
export default function Preview({project,path,time,seekRequest,playing,onTime,onPlaying,onMessage}:{project:ProjectDocument|null;path:string|null;time:number;seekRequest:{seconds:number;revision:number};playing:boolean;onTime:(n:number)=>void;onPlaying:(b:boolean)=>void;onMessage:(s:string)=>void}){
 const [url,setUrl]=useState(''),[busy,setBusy]=useState(false),[progress,setProgress]=useState(''),[notice,setNotice]=useState('Prepare a short preview here, or update the full timeline preview.');
 const ref=useRef<HTMLVideoElement>(null),generation=useRef(0),pending=useRef(false),canceled=useRef(false),range=useRef<Range|null>(null);
 const signature=JSON.stringify(project?{settings:project.settings,tracks:project.tracks,media:project.media,captions:project.captions,captionStyle:project.captionStyle}:null);
 useEffect(()=>{generation.current++;setUrl('');setBusy(false);setProgress('');pending.current=false;range.current=null;onPlaying(false);setNotice('Prepare a short preview here, or update the full timeline preview.');void window.visionForge.cancelPreview();},[path,signature]);
 useEffect(()=>window.visionForge.onPreviewProgress?.(message=>{if(pending.current&&!canceled.current)setProgress(message);}),[]);
 async function prepare(short=false){
  if(!project||!path||pending.current)return;
  const total=timelineDuration(project),start=Math.floor(time*project.settings.fps)/project.settings.fps;
  if(total<=0||short&&start>=total){setNotice('Add a clip and place the playhead within the timeline.');onPlaying(false);return;}
  const requested=short?{startSeconds:start,durationSeconds:Math.min(10,total-start)}:undefined;
  const id=generation.current;pending.current=true;canceled.current=false;setUrl('');range.current=null;setBusy(true);setProgress('Checking preview media');
  setNotice(short?`Preparing ${requested!.durationSeconds.toFixed(1)} seconds from ${start.toFixed(1)}s.`:`Preparing the full ${total.toFixed(1)}-second timeline. Large projects can take time.`);
  try{const result=await window.visionForge.preparePreview(path,project,requested);if(id===generation.current&&!canceled.current){range.current=requested??null;setUrl(result);const message=short?'Short preview ready. Full preview remains available for the entire timeline.':'Full timeline preview ready.';setNotice(message);onMessage(message);}}
  catch(e){if(id===generation.current){const message=canceled.current?'Preview canceled.':`Preview failed: ${e}`;setNotice(message);onMessage(message);onPlaying(false);}}
  finally{if(id===generation.current){pending.current=false;setBusy(false);setProgress('');}}
 }
 useEffect(()=>{const video=ref.current;if(!playing){video?.pause();return;}if(!url){void prepare();return;}void video?.play().catch(e=>{const message='Playback failed: '+String(e);setNotice(message);onMessage(message);onPlaying(false);});},[playing,url]);
 useLayoutEffect(()=>{const video=ref.current;if(!video)return;const offset=range.current?.startSeconds??0,target=seekRequest.seconds;
  if(range.current&&(target<offset-.001||target>offset+range.current.durationSeconds+.001)){setUrl('');range.current=null;onPlaying(false);setNotice('The playhead is outside the short preview. Prepare another short preview here or use Full preview.');return;}
  const local=Math.max(0,target-offset);if(Math.abs(video.currentTime-local)>.001)video.currentTime=Math.min(local,video.duration||local);
 },[seekRequest,url]);
 return <div className="preview-stage">
  <div className="preview-toolbar">
   <button disabled={!project||busy} onClick={()=>{onPlaying(true);void prepare(true);}}>Preview 10 seconds here</button>
   <button disabled={!project||busy} onClick={()=>void prepare()}>Update preview</button>
   {busy&&<button disabled={canceled.current} onClick={()=>{canceled.current=true;onPlaying(false);setProgress('Canceling preview…');void window.visionForge.cancelPreview();}}>Cancel preview</button>}
  </div>
  <div className="preview-feedback" role="status" aria-label="Preview preparation status" aria-live="polite" aria-atomic="true">{busy?progress:notice}</div>
  <div className="preview-picture">{url?<video ref={ref} data-seek-request={seekRequest.seconds} data-seek-revision={seekRequest.revision} src={url} style={{width:'100%',height:'100%',objectFit:'contain'}} onLoadedMetadata={()=>{if(ref.current)ref.current.currentTime=Math.max(0,Math.min(time-(range.current?.startSeconds??0),ref.current.duration));}} onTimeUpdate={()=>{if(ref.current)onTime(ref.current.currentTime+(range.current?.startSeconds??0));}} onEnded={()=>onPlaying(false)} onError={()=>{const message='Preview playback failed: '+(ref.current?.error?.message??'Unable to decode preview');setNotice(message);onMessage(message);onPlaying(false);}}/>:<div className="preview-placeholder">{busy?notice:'Select a timeline clip to edit it. Use a short preview to check a small section before rendering the whole timeline.'}</div>}</div>
 </div>;
}
