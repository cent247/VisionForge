import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import render from '../test-build/main/render.js';
test('application renderer exports image, gap, and two offset audio layers',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'vf-test-'));await mkdir(join(dir,'media'));
 try{
 execFileSync('ffmpeg',['-v','error','-y','-f','lavfi','-i','color=c=blue:s=320x180','-frames:v','1',join(dir,'media','blue.png')]);
 for(const [name,hz] of [['voice',440],['music',220]])execFileSync('ffmpeg',['-v','error','-y','-f','lavfi','-i',`sine=frequency=${hz}:duration=2`,join(dir,'media',name+'.wav')]);
 const p={schemaVersion:1,id:'p',name:'integration',settings:{width:320,height:180,fps:24},media:[{id:'image',relativePath:'media/blue.png',mediaType:'image',durationSeconds:null},...['voice','music'].map(id=>({id,relativePath:`media/${id}.wav`,mediaType:'audio',durationSeconds:2}))],tracks:[{id:'v',kind:'video',clips:[{id:'c',mediaId:'image',label:'Blue',startSeconds:0.5,sourceInSeconds:0,durationSeconds:2}]},...['voice','music'].map((id,i)=>({id,kind:'audio',clips:[{id:id+'c',mediaId:id,label:id,startSeconds:i*0.5,sourceInSeconds:0,durationSeconds:2}]}))]};
 const file=join(dir,'project.vforge');await writeFile(file,JSON.stringify(p));const restored=JSON.parse(await readFile(file,'utf8'));restored.captions=[{id:'cap',startSeconds:0.5,endSeconds:2,text:'Original caption test'}];const messages=[];const output=join(dir,'output.mp4');
 await render.exportVideo(file,restored,output,m=>messages.push(m));
 const info=JSON.parse(execFileSync('ffprobe',['-v','error','-show_format','-show_streams','-of','json',output]));assert.ok(Math.abs(Number(info.format.duration)-2.5)<0.15);assert.equal(info.streams.filter(s=>s.codec_type==='video').length,1);assert.equal(info.streams.filter(s=>s.codec_type==='audio').length,1);assert.ok(messages.includes('Export complete'));assert.equal(info.streams.filter(s=>s.codec_type==='subtitle').length,1);
 assert.ok(Math.abs(await render.probe(output)-2.5)<0.15);
 await render.exportVideo(file,{...p,tracks:[{...p.tracks[0],clips:[p.tracks[0].clips[0],{...p.tracks[0].clips[0],id:'overlap',startSeconds:1,fadeSeconds:0.2,transform:{scale:0.7,brightness:0.04},keyframes:[{timeSeconds:0,x:-0.1},{timeSeconds:2,x:0.1}]}]}]},join(dir,'overlap.mp4'),()=>{});
 assert.ok(await render.probe(join(dir,'overlap.mp4'))>=3);
 await writeFile(join(dir,'bad.mp4'),'existing-output');const controller=new AbortController();controller.abort();
 await assert.rejects(render.exportVideo(file,p,join(dir,'bad.mp4'),()=>{},controller.signal));
 assert.equal(await readFile(join(dir,'bad.mp4'),'utf8'),'existing-output');
 console.log(JSON.stringify({duration:info.format.duration,streams:info.streams.map(s=>({type:s.codec_type,codec:s.codec_name})),messages},null,2));
 }finally{await rm(dir,{recursive:true,force:true});}
});
