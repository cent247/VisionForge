import {sliceClip} from '../../../shared/timeline.mjs';
import {planScript,validatePlan} from '../../../shared/planner.mjs';
import {parseSrt,toSrt} from '../../../shared/captions.mjs';
import Preview from './Preview';
import Services from './Services';
import ProjectSettings from './ProjectSettings';
import {splitClip,validateProject} from '../../../shared/project.mjs';
import { useState, useEffect } from 'react';
import { Film, FolderOpen, Plus, Save, Download, Music2, Image as ImageIcon, Scissors, Sparkles, Layers, Captions, Settings, Trash2, ZoomIn, ZoomOut, MousePointer2 } from 'lucide-react';
import { useEditor } from '../store';
import type { ImportedMedia, TimelineClip, TimelineTrack } from '../types/project';

const uid = () => crypto.randomUUID();
const snap = (seconds: number, fps: number) => Math.max(0, Math.round(seconds * fps) / fps);
const timecode = (seconds: number, fps: number) => {
  const frames = Math.round(seconds * fps);
  const minutes = Math.floor(frames / (fps * 60));
  const secs = Math.floor(frames / fps) % 60;
  const frame = frames % fps;
  return `${String(minutes).padStart(2,'0')}:${String(secs).padStart(2,'0')}:${String(frame).padStart(2,'0')}`;
};

export default function App() {
  const {project,path,set,add,updateProject,undo,redo,past,future} = useEditor();
  const [message,setMessage] = useState('Create or open a project to begin.');
  const [scriptText,setScriptText] = useState('');
  const [scenePlan,setScenePlan] = useState('');
  const [overlayText,setOverlayText] = useState('Your title');
  const [overlayFont,setOverlayFont]=useState(60),[overlayBackground,setOverlayBackground]=useState(false);
  const [captionText,setCaptionText] = useState('');
  const [playing,setPlaying] = useState(false);
  const [exporting,setExporting] = useState(false);
  const [selected,setSelected] = useState<string | null>(null);
  const [playhead,setPlayhead] = useState(0);
  const [zoom,setZoom] = useState(55);
  const [trimDraft,setTrimDraft]=useState<{id:string;start:number;duration:number}|null>(null);
  const fps = project?.settings.fps ?? 30;
  const selectedClip = project?.tracks.flatMap(t => t.clips).find(c => c.id === selected);
  const total = Math.max(30, ...(project?.tracks.flatMap(t => t.clips.map(c => c.startSeconds + c.durationSeconds)) ?? [30]));
  const timelineWidth = Math.max(900, total * zoom + 100);

  useEffect(()=>{if(!project||!path)return;const timer=setTimeout(()=>{void window.visionForge.autosaveProject({projectPath:path,project:{...project,script:scriptText,storyboard:scenePlan}}).catch(e=>setMessage(`Autosave failed: ${e}`));},2000);return()=>clearTimeout(timer);},[project,path,scriptText,scenePlan]);
  useEffect(()=>window.visionForge.onExportProgress(setMessage),[]);

  useEffect(()=>{if(playhead>=total)setPlaying(false);},[playhead,total]);
  async function exportMovie(){if(!project||!path)return;setPlaying(false);setExporting(true);try{const r=await window.visionForge.exportVideo(path,project);setMessage(r.canceled?'Export canceled.':`Export saved: ${r.output}`);}catch(e){setMessage(`Export failed: ${e}`);}finally{setExporting(false);}}
  function roughCut(){
    if(!project)return;
    const visuals=project.media.filter(m=>m.mediaType!=='audio').sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));let cursor=0;
    const clips=visuals.map(m=>{const duration=m.durationSeconds??10;const c:TimelineClip={id:uid(),mediaId:m.id,label:m.name,startSeconds:cursor,sourceInSeconds:0,sourceOutSeconds:duration,durationSeconds:duration,fadeSeconds:0.3,motion:m.mediaType==='image'};cursor+=duration;return c;});
    let narrationCursor=0;const voice=project.media.filter(m=>m.mediaType==='audio'&&!/music/i.test(m.name)).sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true})).map(m=>{const duration=m.durationSeconds??5;const c:TimelineClip={id:uid(),mediaId:m.id,label:m.name,startSeconds:narrationCursor,sourceInSeconds:0,sourceOutSeconds:duration,durationSeconds:duration,volume:1};narrationCursor+=duration;return c;});
    const music=project.media.filter(m=>m.mediaType==='audio'&&/music/i.test(m.name)).map(m=>({id:uid(),mediaId:m.id,label:m.name,startSeconds:0,sourceInSeconds:0,sourceOutSeconds:Math.min(cursor,m.durationSeconds??cursor),durationSeconds:Math.min(cursor,m.durationSeconds??cursor),volume:0.12,fadeSeconds:1}));
    commit([{id:uid(),name:'Story / B-roll',kind:'video',clips},{id:uid(),name:'Narration',kind:'audio',clips:voice},{id:uid(),name:'Background music',kind:'audio',clips:music}]);setMessage('Local rough cut assembled by filename order. Review the timeline; Undo restores the previous edit.');
  }
  function editSelected(patch:Partial<TimelineClip>){if(!project||!selectedClip)return;const c={...selectedClip,...patch};if(c.durationSeconds<=0||c.sourceInSeconds<0||c.startSeconds<0||(c.speed??1)<0.25||(c.speed??1)>4)return;const m=project.media.find(m=>m.id===c.mediaId);if(m?.durationSeconds&&c.sourceInSeconds+c.durationSeconds*(c.speed??1)>m.durationSeconds+0.01){setMessage('Trim exceeds source duration.');return;}c.keyframes=c.keyframes?.filter(k=>k.timeSeconds<=c.durationSeconds);c.sourceOutSeconds=c.sourceInSeconds+c.durationSeconds*(c.speed??1);c.fadeSeconds=Math.min(c.fadeSeconds??0,c.durationSeconds/2);const next={...project,tracks:project.tracks.map(t=>({...t,clips:t.clips.map(v=>v.id===c.id?c:v)}))};try{validateProject(next);updateProject(next);}catch(e){setMessage(`Invalid clip edit: ${e}`);}}
  function commit(tracks: TimelineTrack[]) {
    if (project) updateProject({...project,tracks,updatedAt:new Date().toISOString()});
  }
  async function create() {
    try { const r=await window.visionForge.newProject(); if(r) {set(r.project,r.projectPath);setSelected(null);setPlayhead(0);setScriptText('');setScenePlan('');setMessage('Project created.');} }
    catch(e) {setMessage(String(e));}
  }
  async function open() {
    try {const r=await window.visionForge.openProject(); if(r) {set(r.project,r.projectPath);setSelected(null);setPlayhead(0);setScriptText(r.project.script??'');setScenePlan(r.project.storyboard??'');setMessage(r.recovered?'Project opened from recovered autosave. Save to restore the project file.':'Project opened.');} }
    catch(e) {setMessage(String(e));}
  }
  async function save() {
    if (!project || !path) return;
    try {await window.visionForge.saveProject({projectPath:path,project:{...project,script:scriptText,storyboard:scenePlan}});setMessage('Timeline and project saved.');}
    catch(e) {setMessage(`Save failed: ${String(e)}`);}
  }
  async function importMedia() {
    if (!path) return;
    try {const files=await window.visionForge.importMedia(path);add(files);setMessage(`${files.length} media file(s) imported.`);}
    catch(e) {setMessage(`Import failed: ${String(e)}`);}
  }
  function place(media: ImportedMedia) {
    if (!project) return;
    const track = project.tracks.find(t => t.kind === (media.mediaType === 'audio' ? 'audio' : 'video'));
    if (!track) {setMessage('No suitable track.');return;}
    const duration = media.durationSeconds && media.durationSeconds > 0 ? media.durationSeconds : 5;
    const clip: TimelineClip = {id:uid(),mediaId:media.id,label:media.name,startSeconds:snap(playhead,fps),sourceInSeconds:0,sourceOutSeconds:duration,durationSeconds:duration};
    commit(project.tracks.map(t => t.id === track.id ? {...t,clips:[...t.clips,clip]} : t));
    setSelected(clip.id);
    setMessage(`Placed ${media.name}. Duration defaults to 5s when unknown.`);
  }
  async function addTextOverlay(replace=false){if(!project||!path||!overlayText.trim()||replace&&!selectedClip)return;try{const canvas=document.createElement('canvas');canvas.width=project.settings.width;canvas.height=project.settings.height;const ctx=canvas.getContext('2d')!;const font=Math.min(200,Math.max(8,overlayFont)),lines=overlayText.split('\n').slice(0,20),lineHeight=font*1.3,top=(canvas.height-lines.length*lineHeight)/2;ctx.font=`bold ${font}px Arial`;ctx.textAlign='center';ctx.textBaseline='top';if(overlayBackground){ctx.fillStyle='rgba(0,0,0,.72)';ctx.fillRect(canvas.width*.04,top-font*.3,canvas.width*.92,lines.length*lineHeight+font*.6);}ctx.fillStyle='white';ctx.shadowColor='black';ctx.shadowBlur=8;lines.forEach((line,i)=>ctx.fillText(line,canvas.width/2,top+i*lineHeight,canvas.width*.88));const media=await window.visionForge.createImage(path,canvas.toDataURL('image/png'));const clip:TimelineClip=replace?{...selectedClip!,mediaId:media.id,label:overlayText.slice(0,100),overlayText,textStyle:{fontSize:font,background:overlayBackground}}:{id:uid(),mediaId:media.id,label:overlayText.slice(0,100),overlayText,textStyle:{fontSize:font,background:overlayBackground},startSeconds:playhead,sourceInSeconds:0,sourceOutSeconds:5,durationSeconds:5,fadeSeconds:.25};const tracks=replace?project.tracks.map(t=>({...t,clips:t.clips.map(c=>c.id===clip.id?clip:c)})):[...project.tracks,{id:uid(),name:'Text overlay',kind:'overlay' as const,clips:[clip]}];updateProject({...project,media:[...project.media,media],tracks});setSelected(clip.id);setMessage(replace?'Text overlay updated.':'Text overlay added.');}catch(e){setMessage(`Overlay failed: ${e}`);}}

  function rippleDelete(){if(!project||!selectedClip)return;commit(project.tracks.map(t=>t.clips.some(c=>c.id===selectedClip.id)?{...t,clips:t.clips.filter(c=>c.id!==selectedClip.id).map(c=>c.startSeconds>=selectedClip.startSeconds+selectedClip.durationSeconds?{...c,startSeconds:c.startSeconds-selectedClip.durationSeconds}:c)}:t));setSelected(null);}
  function remove() {
    if (!project || !selected) return;
    commit(project.tracks.map(t => ({...t,clips:t.clips.filter(c => c.id !== selected)})));
    setSelected(null);setMessage('Clip deleted.');
  }
  function split() {
    if (!project || !selectedClip) return;
    const offset=snap(playhead-selectedClip.startSeconds,fps);
    const frame=1/fps;
    if(offset < frame || offset > selectedClip.durationSeconds-frame) {setMessage('Place playhead inside the selected clip.');return;}
    const [left,right] = splitClip(selectedClip,playhead,fps,uid()) as [TimelineClip,TimelineClip];
    commit(project.tracks.map(t => ({...t,clips:t.clips.flatMap(c => c.id===selectedClip.id ? [left,right] : [c])})));
    setSelected(right.id);setMessage('Clip split at playhead.');
  }
  function move(clipId: string, trackId: string, at: number) {
    if (!project) return;
    const from=project.tracks.find(t => t.clips.some(c => c.id===clipId));
    const target=project.tracks.find(t => t.id===trackId);
    const clip=from?.clips.find(c => c.id===clipId);
    if (!clip || !from || !target) return;
    if ((from.kind==='audio') !== (target.kind==='audio')) {setMessage('Moving clips between incompatible track types is not supported.');return;}
    const edges=project.tracks.flatMap(t=>t.clips.filter(c=>c.id!==clipId).flatMap(c=>[c.startSeconds,c.startSeconds+c.durationSeconds]));const closest=edges.sort((a,b)=>Math.abs(a-at)-Math.abs(b-at))[0];const moved={...clip,startSeconds:snap(closest!==undefined&&Math.abs(closest-at)*zoom<8?closest:at,fps)};
    commit(project.tracks.map(t => ({...t,clips:[...t.clips.filter(c => c.id!==clipId),...(t.id===target.id?[moved]:[])]})));
    setSelected(clipId);setMessage('Clip moved.');
  }

  function trimHandle(e:React.PointerEvent,c:TimelineClip,edge:'left'|'right'){
    e.preventDefault();e.stopPropagation();if(!project)return;const origin=e.clientX;
    const calculate=(x:number)=>{const delta=Math.round((x-origin)/zoom*fps)/fps;const from=edge==='left'?Math.min(c.durationSeconds-1/fps,Math.max(0,delta)):0;const to=edge==='right'?Math.max(1/fps,Math.min(c.durationSeconds,c.durationSeconds+delta)):c.durationSeconds;return {from,to};};
    const move=(event:PointerEvent)=>{const v=calculate(event.clientX);setTrimDraft({id:c.id,start:c.startSeconds+v.from,duration:v.to-v.from});};
    const finish=(event:PointerEvent)=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',finish);window.removeEventListener('pointercancel',cancel);setTrimDraft(null);const v=calculate(event.clientX);if(v.from===0&&v.to===c.durationSeconds)return;const trimmed=sliceClip(c,v.from,v.to) as TimelineClip;commit(project.tracks.map(t=>({...t,clips:t.clips.map(item=>item.id===c.id?trimmed:item)})));setSelected(c.id);setMessage('Clip trimmed. Undo restores the previous edit.');};
    const cancel=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',finish);window.removeEventListener('pointercancel',cancel);setTrimDraft(null);};
    window.addEventListener('pointermove',move);window.addEventListener('pointerup',finish);window.addEventListener('pointercancel',cancel);
  }

  useEffect(()=>{const handler=(event:KeyboardEvent)=>{const target=event.target as HTMLElement;if(target.closest('input,textarea,select,[contenteditable="true"]'))return;const command=event.ctrlKey||event.metaKey;if(command&&event.key.toLowerCase()==='s'){event.preventDefault();void save();}else if(command&&event.key.toLowerCase()==='z'){event.preventDefault();event.shiftKey?redo():undo();}else if(event.key===' '){event.preventDefault();setPlaying(v=>!v);}else if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();setPlaying(false);setPlayhead(t=>Math.max(0,t+(event.key==='ArrowRight'?1:-1)/fps));}else if(event.key==='Delete'){event.preventDefault();remove();}};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);},[project,path,scriptText,scenePlan,selected,fps]);

  return <div className="shell">
    <header><div className="brand"><Film/> VISION<span>FORGE</span><small>DEVELOPMENT BUILD</small></div><nav>
      <button onClick={create}><Plus/> New</button><button onClick={open}><FolderOpen/> Open</button>
      <button disabled={!project} onClick={save}><Save/> Save</button>
      <button disabled={!project||exporting} className="primary" onClick={exportMovie}><Download/> {exporting?'Exporting…':'Export MP4'}</button>{exporting&&<button onClick={()=>void window.visionForge.cancelExport()}>Cancel export</button>}
    </nav></header>
    <div className="body"><aside><label>WORKSPACE</label><p className="active"><Scissors/> Editor</p><p><Sparkles/> Storyboard <small>LOCAL</small></p><p><Captions/> Caption editor</p><p><Music2/> Audio tracks</p><p><Layers/> Clip effects</p><p><Settings/> Project settings</p><footer>● LOCAL PROJECT MODE</footer></aside>
    <main><div className="heading"><div><label>VIDEO WORKSPACE</label><h1>{project?.name??'Your next story starts here'}</h1><small>{project?`${project.settings.width} × ${project.settings.height} · ${fps} FPS`:'Create a project or open an existing one.'}</small></div><div><button disabled={!project} onClick={roughCut}>Assemble local rough cut</button><button disabled={!project} onClick={importMedia}><Plus/> Import media</button></div></div>
      <div className="upper"><section className="panel media-panel"><h3>MEDIA LIBRARY <small>{project?.media.length??0} ITEMS</small></h3>
        {!project?.media.length?<div className="empty"><ImageIcon/><b>No media imported</b><p>Import video, audio, or images to start.</p><button disabled={!project} onClick={importMedia}>Import files</button></div>:
          <div className="media-list">{project.media.map(m=><div className="media" key={m.id}>{m.mediaType==='audio'?<Music2/>:m.mediaType==='image'?<ImageIcon/>:<Film/>}<span>{m.name}<small>{m.mediaType} · {m.durationSeconds?`${m.durationSeconds.toFixed(1)}s`:'5s placeholder'}</small></span><button aria-label={`Relink ${m.name}`} onClick={async()=>{if(!project||!path)return;try{const r=await window.visionForge.relinkMedia(path,m.relativePath,project);if(r){updateProject({...project,media:project.media.map(v=>v.id===m.id?{...v,...r}:v)});setMessage('Media relinked.');}}catch(e){setMessage(`Relink failed: ${e}`);}}}>Relink</button><button onClick={()=>place(m)} title="Add at playhead"><Plus/></button></div>)}</div>}
      </section><section className="panel preview"><h3>PREVIEW MONITOR <small>{timecode(playhead,fps)}</small></h3><div className="screen"><Preview project={project} path={path} time={playhead} playing={playing} onTime={setPlayhead} onPlaying={setPlaying} onMessage={setMessage}/></div><div className="controls"><button disabled={!project} onClick={()=>setPlaying(v=>!v)}>{playing?'Pause':'Play'}</button> Playhead: {timecode(playhead,fps)} <input aria-label="Playhead seconds" type="number" min="0" step={1/fps} value={playhead} onChange={e=>setPlayhead(Math.max(0,Number(e.target.value)))}/> <button onClick={()=>setPlayhead(0)}>Reset playhead</button></div></section></div>
      <section className="panel timeline"><div className="timeline-header"><h3>TIMELINE <small>{project?.tracks.length??0} TRACKS</small></h3><div className="timeline-tools"><button disabled={!past.length} onClick={undo}>Undo</button><button disabled={!future.length} onClick={redo}>Redo</button><button disabled={!project} onClick={()=>{if(project)commit([...project.tracks,{id:uid(),name:`Video ${project.tracks.filter(t=>t.kind==='video').length+1}`,kind:'video',clips:[]}]);}}>+ Video track</button><button disabled={!project} onClick={()=>{if(project)commit([...project.tracks,{id:uid(),name:`Audio ${project.tracks.filter(t=>t.kind==='audio').length+1}`,kind:'audio',clips:[]}]);}}>+ Audio track</button><button disabled={!selectedClip} onClick={split}><Scissors/> Split</button><button disabled={!selectedClip} onClick={rippleDelete}>Ripple delete</button><button disabled={!selectedClip} onClick={remove}><Trash2/> Delete</button><button onClick={()=>setZoom(v=>Math.max(20,v-10))}><ZoomOut/></button><span>{zoom} px/s</span><button onClick={()=>setZoom(v=>Math.min(200,v+10))}><ZoomIn/></button></div></div>
      {!project?<div className="empty">Create a project to start editing.</div>:<div className="timeline-scroll"><div className="timeline-canvas" style={{width:timelineWidth+115}}>
        <div className="time-ruler"><div className="ruler-label">TIME</div><div className="ruler-body" onClick={e=>{const rect=e.currentTarget.getBoundingClientRect();setPlayhead(snap((e.clientX-rect.left)/zoom,fps));}}>{Array.from({length:Math.ceil(timelineWidth/(zoom*5))+1},(_,i)=><span key={i} style={{left:i*5*zoom}}>{i*5}s</span>)}</div></div>
        {project.tracks.map(t=><div className="track" key={t.id}><b>{t.name}<small>{t.kind}</small></b><div className="lane" onClick={e=>{if(e.target===e.currentTarget){const rect=e.currentTarget.getBoundingClientRect();setPlayhead(snap((e.clientX-rect.left)/zoom,fps));}}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const id=e.dataTransfer.getData('application/x-visionforge-clip');if(id){const rect=e.currentTarget.getBoundingClientRect();move(id,t.id,(e.clientX-rect.left)/zoom);}}}>
          {t.clips.map(c=><div key={c.id} draggable onDragStart={e=>{e.dataTransfer.setData('application/x-visionforge-clip',c.id);e.dataTransfer.effectAllowed='move';}} onClick={e=>{e.stopPropagation();setSelected(c.id);}} className={`clip ${selected===c.id?'selected':''} ${t.kind}`} style={{left:(trimDraft?.id===c.id?trimDraft.start:c.startSeconds)*zoom,width:Math.max(20,(trimDraft?.id===c.id?trimDraft.duration:c.durationSeconds)*zoom)}} title={`${c.label} (${c.durationSeconds.toFixed(2)}s)`}><button className="trim-handle left" aria-label={`Trim start ${c.label}`} onPointerDown={e=>trimHandle(e,c,'left')} onClick={e=>e.stopPropagation()}/><strong>{c.label}</strong><small>{c.durationSeconds.toFixed(2)}s</small><button className="trim-handle right" aria-label={`Trim end ${c.label}`} onPointerDown={e=>trimHandle(e,c,'right')} onClick={e=>e.stopPropagation()}/></div>)}
        </div></div>)}
        <div className="playhead" style={{left:115+playhead*zoom}}><div/></div>
      </div></div>}
      {selectedClip&&<div className="inspector"><b>Clip controls</b>{(['startSeconds','sourceInSeconds','durationSeconds','speed','volume','fadeSeconds'] as const).map(key=><label key={key}>{key}<input aria-label={key} type="number" min="0" step="0.1" value={selectedClip[key]??(key==='volume'||key==='speed'?1:0)} onChange={e=>editSelected({[key]:Number(e.target.value)})}/></label>)}{(['x','y','scale','crop','brightness','contrast','saturation'] as const).map(key=><label key={key}>{key}<input aria-label={`transform ${key}`} type="number" step="0.05" value={selectedClip.transform?.[key]??(['scale','contrast','saturation'].includes(key)?1:0)} onChange={e=>editSelected({transform:{...selectedClip.transform,[key]:Number(e.target.value)}})}/></label>)}<button onClick={()=>{const at=snap(Math.min(selectedClip.durationSeconds,Math.max(0,playhead-selectedClip.startSeconds)),fps);editSelected({keyframes:[...(selectedClip.keyframes??[]).filter(k=>k.timeSeconds!==at),{timeSeconds:at,x:selectedClip.transform?.x??0,y:selectedClip.transform?.y??0,volume:selectedClip.volume??1}].sort((a,b)=>a.timeSeconds-b.timeSeconds)});}}>Capture keyframe</button><small>{selectedClip.keyframes?.length??0} keyframes</small>{selectedClip.keyframes?.map((frame,index)=><div key={index} className="inspector"><small>Keyframe {index+1}</small>{(['timeSeconds','x','y','volume'] as const).map(key=><label key={key}>{key}<input type="number" step={key==='timeSeconds'?1/fps:.05} aria-label={`Keyframe ${index+1} ${key}`} value={frame[key]??(key==='volume'?1:0)} onChange={e=>editSelected({keyframes:selectedClip.keyframes!.map((item,i)=>i===index?{...item,[key]:Number(e.target.value)}:item).sort((a,b)=>a.timeSeconds-b.timeSeconds)})}/></label>)}<button onClick={()=>editSelected({keyframes:selectedClip.keyframes!.filter((_,i)=>i!==index)})}>Delete keyframe {index+1}</button></div>)}<label>Mute source audio<input aria-label="Mute source audio" type="checkbox" checked={!!selectedClip.muteSourceAudio} onChange={e=>editSelected({muteSourceAudio:e.target.checked})}/></label><label>Motion<input aria-label="Motion" type="checkbox" checked={!!selectedClip.motion} onChange={e=>editSelected({motion:e.target.checked})}/></label></div>}
      {project&&path&&<Services project={project} path={path} script={scriptText} onPlan={setScenePlan} onMedia={m=>add([m])} onCaptions={setCaptionText} message={setMessage}/>}<details className="caption-editor"><summary>Script storyboard / B-roll planning</summary><p>Offline planning uses rules and filename matching. Review every scene before applying. Narration timing is an estimate.</p><textarea aria-label="Narration script" value={scriptText} onChange={e=>setScriptText(e.target.value)} placeholder="Paste script paragraphs, one paragraph per scene"/><button disabled={!project} onClick={()=>{try{setScenePlan(JSON.stringify(planScript(scriptText,project?.media??[]),null,2));setMessage('Storyboard prepared for review.');}catch(e){setMessage(String(e));}}}>Plan scenes</button><textarea aria-label="Review scene plan" value={scenePlan} onChange={e=>setScenePlan(e.target.value)}/><button disabled={!project} onClick={()=>{try{if(!project)return;const plan=validatePlan(JSON.parse(scenePlan),project.media);let at=0;const clips=plan.map((s:any)=>{const m=project.media.find(v=>v.id===s.mediaId)!;const duration=s.durationSeconds,source=s.sourceInSeconds??0,speed=s.speed??1;const c:TimelineClip={id:uid(),mediaId:m.id,label:s.narration.slice(0,60),startSeconds:at,sourceInSeconds:source,sourceOutSeconds:source+duration*speed,durationSeconds:duration,speed,fadeSeconds:s.fadeSeconds??Math.min(.3,duration/2),transform:s.transform,motion:s.motion,muteSourceAudio:s.muteSourceAudio};at+=duration;return c;});const tracks=[{id:uid(),name:'Reviewed storyboard',kind:'video' as const,clips},...project.tracks.filter(t=>t.kind==='audio')];validateProject({...project,tracks});commit(tracks);setMessage('Reviewed storyboard applied. Undo restores the previous timeline.');}catch(e){setMessage(`Plan rejected: ${e}`);}}}>Apply reviewed plan</button></details>
      <div className="inspector"><textarea aria-label="Text overlay" value={overlayText} onChange={e=>setOverlayText(e.target.value)}/><button disabled={!project} onClick={()=>void addTextOverlay()}>Add text overlay</button><label>Font size<input aria-label="Overlay font size" type="number" min="8" max="200" value={overlayFont} onChange={e=>setOverlayFont(Number(e.target.value))}/></label><label>Background<input aria-label="Text background" type="checkbox" checked={overlayBackground} onChange={e=>setOverlayBackground(e.target.checked)}/></label><button disabled={!selectedClip?.overlayText} onClick={()=>{if(selectedClip){setOverlayText(selectedClip.overlayText??'');setOverlayFont(selectedClip.textStyle?.fontSize??60);setOverlayBackground(selectedClip.textStyle?.background??false);}}}>Load selected text</button><button disabled={!selectedClip?.overlayText} onClick={()=>void addTextOverlay(true)}>Update selected text</button></div>
      {project&&<ProjectSettings project={project} apply={updateProject} message={setMessage}/>}<details className="caption-editor"><summary>Caption editor / SRT</summary><input aria-label="Import SRT file" type="file" accept=".srt" onChange={async e=>{const file=e.target.files?.[0];if(file)setCaptionText(await file.text());}}/><textarea aria-label="SRT captions" placeholder="Paste SRT captions here" value={captionText} onChange={e=>setCaptionText(e.target.value)}/><button disabled={!project} onClick={()=>{try{if(project){const captions=parseSrt(captionText);updateProject({...project,captions});setMessage(`${captions.length} captions applied.`);}}catch(e){setMessage(String(e));}}}>Apply SRT captions</button><button disabled={!project} onClick={()=>setCaptionText(toSrt(project?.captions??[]))}>Load project captions</button><button disabled={!project} onClick={()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([toSrt(project?.captions??[])],{type:'text/plain'}));a.download=(project?.name??'captions')+'.srt';a.click();URL.revokeObjectURL(a.href);}}>Export SRT</button></details>
      <div className="timeline-foot"><MousePointer2/> Click ruler or lane to seek; click a clip to select; drag clip to move. <span>{selectedClip?`Selected: ${selectedClip.label}`:'No clip selected'}</span></div>
      </section><footer className="status">{message}<span>HYBRID · LOCAL EDITING · CLOUD OPTIONAL</span></footer>
    </main></div>
  </div>;
}
