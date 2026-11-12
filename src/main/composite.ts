import {expressionAt} from '../shared/animation.mjs';
import {timelineDuration,envelopeFor} from '../shared/timeline.mjs';
import type {ProjectDocument,TimelineClip} from '../renderer/src/types/project';
import {dirname,resolve} from 'node:path';
function tempo(speed:number){const changes:string[]=[];while(speed>2){changes.push('atempo=2');speed/=2;}while(speed<.5){changes.push('atempo=0.5');speed/=.5;}changes.push(`atempo=${speed}`);return changes.join(',');}
function gain(c:TimelineClip){const e=envelopeFor(c);return `(${expressionAt(c.keyframes,'volume',c.volume??1)})*(${e.fadeSeconds?`max(0,min(1,min((t+${e.offsetSeconds})/${e.fadeSeconds},(${e.durationSeconds}-t-${e.offsetSeconds})/${e.fadeSeconds})))`:'1'})`;}
export function compositeArgs(projectPath:string,p:ProjectDocument){
 const {width:w,height:h,fps}=p.settings,total=timelineDuration(p);if(!p.tracks.some(t=>t.clips.length))throw new Error('Add media to the timeline before rendering.');
 const args=['-y','-filter_complex_threads','1','-f','lavfi','-i',`color=c=black:s=${w}x${h}:r=${fps}:d=${total}`],filters:string[]=[],sounds:string[]=[];let input=1,layer='0:v';
 for(const track of p.tracks)for(const c of [...track.clips].sort((a,b)=>a.startSeconds-b.startSeconds)){
 const m=p.media.find(m=>m.id===c.mediaId)!,idx=input++,speed=c.speed??1,env=envelopeFor(c),source=resolve(dirname(projectPath),m.relativePath);
 if(m.mediaType==='image')args.push('-protocol_whitelist','file,pipe','-loop','1','-framerate',String(fps),'-t',String(c.durationSeconds),'-threads','1','-i',source);else args.push('-protocol_whitelist','file,pipe','-ss',String(c.sourceInSeconds),'-t',String(c.durationSeconds*speed),'-threads','1','-i',source);
 if(track.kind!=='audio'){
 const crop=c.transform?.crop??0,fit=c.transform?.fit==='cover'?`scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}:(iw-ow)*${c.transform.sourceX??.5}:(ih-oh)*${c.transform.sourceY??.5},format=rgba`:`scale=${w}:${h}:force_original_aspect_ratio=decrease,format=rgba,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=black@0`;
 filters.push(`[${idx}:v]setpts=(PTS-STARTPTS)/${speed}+${env.offsetSeconds}/TB,${crop?`crop=iw*${1-2*crop}:ih*${1-2*crop},`:''}${fit},setsar=1[raw${idx}]`);let visual=`raw${idx}`;const color=c.transform;
 if(color&&((color.brightness??0)!==0||(color.contrast??1)!==1||(color.saturation??1)!==1)){filters.push(`[raw${idx}]split[color${idx}][alphaInput${idx}]`,`[alphaInput${idx}]alphaextract[alpha${idx}]`,`[color${idx}]format=yuv444p,eq=brightness=${color.brightness??0}:contrast=${color.contrast??1}:saturation=${color.saturation??1}[adjusted${idx}]`,`[adjusted${idx}][alpha${idx}]alphamerge[colored${idx}]`);visual=`colored${idx}`;}
 const sw=Math.max(2,Math.round(w*(c.transform?.scale??1)/2)*2),sh=Math.max(2,Math.round(h*(c.transform?.scale??1)/2)*2);
 filters.push(`[${visual}]fps=${fps},format=rgba${c.motion?`,crop=iw/1.06:ih/1.06:(iw-ow)/2+(iw-ow)/3*sin(t):(ih-oh)/2,scale=${w}:${h}`:''}${env.fadeSeconds?`,fade=t=in:st=0:d=${env.fadeSeconds}:alpha=1,fade=t=out:st=${env.durationSeconds-env.fadeSeconds}:d=${env.fadeSeconds}:alpha=1`:''},scale=${sw}:${sh},setpts=PTS-${env.offsetSeconds}/TB+${c.startSeconds}/TB[v${idx}]`);
 const x=expressionAt(c.keyframes,'x',c.transform?.x??0).replace(/\bt\b/g,`(t-${c.startSeconds})`),y=expressionAt(c.keyframes,'y',c.transform?.y??0).replace(/\bt\b/g,`(t-${c.startSeconds})`);
 filters.push(`[${layer}][v${idx}]overlay=x='(W-w)/2+W*(${x})':y='(H-h)/2+H*(${y})':eof_action=pass:repeatlast=0:enable='gte(t,${c.startSeconds})*lt(t,${c.startSeconds+c.durationSeconds})'[layer${idx}]`);layer=`layer${idx}`;
 }
 if(track.kind==='audio'||m.mediaType==='video'&&m.hasAudio&&!c.muteSourceAudio){filters.push(`[${idx}:a:0]asetpts=PTS-STARTPTS,${tempo(speed)},atrim=duration=${c.durationSeconds},aformat=sample_rates=48000:channel_layouts=stereo,asetpts=N/SR/TB,volume='${gain(c)}':eval=frame,adelay=${Math.round(c.startSeconds*1000)}:all=1,apad,asetpts=N/SR/TB,atrim=duration=${total}[a${idx}]`);sounds.push(`[a${idx}]`);}
 }
 if(sounds.length)filters.push(`${sounds.join('')}amix=inputs=${sounds.length}:duration=longest:normalize=0,alimiter=limit=.85:level=0:latency=1${p.settings.loudness?.enabled?`,loudnorm=I=${p.settings.loudness.integratedLufs}:TP=${p.settings.loudness.truePeakDb}:LRA=${p.settings.loudness.range},aresample=48000`:''}[aout]`);
 args.push('-filter_complex',filters.join(';'),'-map',layer==='0:v'?'0:v':`[${layer}]`);if(sounds.length)args.push('-map','[aout]');args.push('-t',String(total),'-frames:v',String(Math.round(total*fps)),'-c:v','libx264','-preset','veryfast','-crf','20','-threads','2','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart');return args;
}
