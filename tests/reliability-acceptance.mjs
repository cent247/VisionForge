// Developer acceptance fixture: real compositor, preview cache and cancellation.
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,readdir,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {performance} from 'node:perf_hooks';
import render from '../test-build/main/render.js';
import preview from '../test-build/main/preview.js';
const evidence={platform:process.platform,node:process.version,started:new Date().toISOString(),scope:'Real render functions on Linux; not installed GUI, Windows, physical devices or power-loss acceptance.',checks:[]};
const dir=await mkdtemp(join(tmpdir(),'vf-reliability-'));
const ff=(args)=>execFileSync('ffmpeg',['-v','error','-y',...args],{maxBuffer:32*1024*1024});
let peakRss=0;
const timer=setInterval(()=>{peakRss=Math.max(peakRss,process.memoryUsage().rss);},100);
async function measure(name,fn){const start=performance.now();const details=await fn();evidence.checks.push({name,passed:true,elapsedSeconds:Number(((performance.now()-start)/1000).toFixed(3)),...details});console.log(name+' passed');}
try{
 await mkdir(join(dir,'media'));
 ff(['-f','lavfi','-i','color=c=blue:s=320x180','-frames:v','1',join(dir,'media/blue.png')]);
 ff(['-f','lavfi','-i','sine=frequency=440:duration=300','-c:a','pcm_s16le',join(dir,'media/tone.wav')]);
 const p={schemaVersion:1,id:'reliability',name:'Five minute sixty cut fixture',settings:{width:320,height:180,fps:12},media:[{id:'image',mediaType:'image',relativePath:'media/blue.png',durationSeconds:null},{id:'audio',mediaType:'audio',relativePath:'media/tone.wav',durationSeconds:300}],tracks:[{id:'visual',kind:'video',clips:Array.from({length:60},(_,i)=>({id:'cut'+i,label:'Cut '+i,mediaId:'image',startSeconds:i*5,sourceInSeconds:0,durationSeconds:5,fadeSeconds:.1,transform:{brightness:i%2?.1:0}}))},{id:'sound',kind:'audio',clips:[{id:'tone',label:'Continuous sound',mediaId:'audio',startSeconds:0,sourceInSeconds:0,durationSeconds:300,volume:.2,fadeSeconds:.2}]}],captions:Array.from({length:60},(_,i)=>({id:'caption'+i,startSeconds:i*5+.2,endSeconds:i*5+4.8,text:'Reliability fixture, scene '+(i+1)}))};
 const file=join(dir,'project.vforge');await writeFile(file,JSON.stringify(p));let cached;
 await measure('five-minute-60-cut-captioned-preview',async()=>{cached=await preview.preparePreview(file,p,()=>{});const info=JSON.parse(execFileSync('ffprobe',['-v','error','-show_format','-show_streams','-of','json',cached]));assert.ok(Math.abs(Number(info.format.duration)-300)<.1);assert.equal(info.streams.find(s=>s.codec_type==='video').nb_frames,'3600');assert.equal(info.streams.filter(s=>s.codec_type==='audio').length,1);assert.equal(info.streams.filter(s=>s.codec_type==='subtitle').length,1);ff(['-i',cached,'-f','null','-']);return {durationSeconds:Number(info.format.duration),frames:3600,clips:61,captions:60,resolution:'320x180',fps:12,fullDecode:true};});
 await measure('unchanged-long-preview-cache-hit',async()=>{let progress=0;assert.equal(await preview.preparePreview(file,p,()=>progress++),cached);assert.equal(progress,0);return {renderProgressEvents:progress};});
 await measure('cancel-at-caption-pass-boundary-preserves-output-and-cleans-staging',async()=>{const small=structuredClone(p);small.tracks[0].clips=small.tracks[0].clips.slice(0,2);small.tracks[1].clips[0].durationSeconds=10;small.captions=small.captions.slice(0,2);const output=join(dir,'existing.mp4');await writeFile(output,'completed-export-sentinel');const abort=new AbortController();let reached=false;await assert.rejects(render.exportVideo(file,small,output,message=>{if(message==='Rendering captions'){reached=true;abort.abort();}},abort.signal));assert.ok(reached);assert.equal(await readFile(output,'utf8'),'completed-export-sentinel');assert.ok(!(await readdir(dir)).some(n=>n.startsWith('.render-')||(n.startsWith('.visionforge-')&&n!=='.visionforge-preview')));await render.exportVideo(file,small,output,()=>{});assert.ok(Math.abs(await render.probe(output)-10)<.1);return {captionPassReached:true,oldOutputPreserved:true,temporaryFilesRemoved:true,retryExportPassed:true};});
 await measure('1080p-30-second-six-cut-motion-captioned-preview',async()=>{
  ff(['-f','lavfi','-i','testsrc2=s=1920x1080:r=24:d=5','-c:v','libx264','-preset','veryfast','-threads','2','-pix_fmt','yuv420p',join(dir,'media/camera.mp4')]);
  const hd=structuredClone(p);hd.settings={width:1920,height:1080,fps:24};hd.media.push({id:'camera',mediaType:'video',relativePath:'media/camera.mp4',durationSeconds:5});hd.tracks[0].clips=Array.from({length:6},(_,i)=>({id:'hd'+i,label:'HD cut '+i,mediaId:'camera',startSeconds:i*5,sourceInSeconds:0,durationSeconds:5,motion:i%2===0,fadeSeconds:.15,transform:{brightness:i%2?.05:0}}));hd.tracks[1].clips[0].durationSeconds=30;hd.captions=hd.captions.slice(0,6);
  const controller=new AbortController(),deadline=setTimeout(()=>controller.abort(new Error('1080p fixture exceeded 60s render budget')),60000);let movie;
  try{movie=await preview.preparePreview(file,hd,()=>{},controller.signal);}finally{clearTimeout(deadline);}
  const info=JSON.parse(execFileSync('ffprobe',['-v','error','-show_format','-show_streams','-of','json',movie]));const video=info.streams.find(s=>s.codec_type==='video');assert.equal(video.width,1920);assert.equal(video.height,1080);assert.equal(video.nb_frames,'720');assert.ok(Math.abs(Number(info.format.duration)-30)<.1);assert.equal(info.streams.filter(s=>s.codec_type==='audio').length,1);assert.equal(info.streams.filter(s=>s.codec_type==='subtitle').length,1);ff(['-i',movie,'-f','null','-']);return {durationSeconds:Number(info.format.duration),frames:720,clips:7,captions:6,resolution:'1920x1080',fps:24,movingTestPatternSource:true,motionAndBrightnessEffects:true,fullDecode:true,renderBudgetSeconds:60};
 });
 evidence.passed=true;
}catch(error){evidence.passed=false;evidence.error=String(error.stack??error);console.error(error);process.exitCode=1;}finally{clearInterval(timer);evidence.peakSampledNodeRssMiB=Number((peakRss/1024/1024).toFixed(1));evidence.memoryMeasurement='100ms sampling of Node RSS only; excludes FFmpeg. Descendant-process RSS is unavailable because sandbox /proc child enumeration is absent. Not a leak or long interactive session test.';evidence.finished=new Date().toISOString();await mkdir('evidence',{recursive:true});await writeFile('evidence/reliability-acceptance.json',JSON.stringify(evidence,null,2)+'\n');await rm(dir,{recursive:true,force:true});}
