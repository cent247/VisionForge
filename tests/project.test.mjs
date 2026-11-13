import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateProject,splitClip} from '../src/shared/project.mjs';
const fixture=()=>({schemaVersion:1,id:'p',name:'Test',settings:{width:1280,height:720,fps:30},media:[{id:'m',relativePath:'media/test.mp4',mediaType:'video',durationSeconds:10}],tracks:[{id:'v',kind:'video',clips:[{id:'c',mediaId:'m',label:'Test',startSeconds:0,sourceInSeconds:2,durationSeconds:8}]}]});
test('valid document round trips through JSON',()=>assert.deepEqual(validateProject(JSON.parse(JSON.stringify(fixture()))),fixture()));
for(const [name,mutate] of [
 ['path traversal',p=>p.media[0].relativePath='media/../../secret'],
 ['invalid fps',p=>p.settings.fps=0],['odd dimensions',p=>p.settings.width=1279],
 ['negative source trim',p=>p.tracks[0].clips[0].sourceInSeconds=-1],
 ['duplicate media IDs',p=>p.media.push({...p.media[0]})],
 ['missing media',p=>p.tracks[0].clips[0].mediaId='missing'],
 ['source overrun',p=>p.tracks[0].clips[0].durationSeconds=9],
 ['duplicate clips',p=>p.tracks[0].clips.push({...p.tracks[0].clips[0]})]
]) test('rejects '+name,()=>{const p=fixture();mutate(p);assert.throws(()=>validateProject(p));});
test('split preserves source and timeline continuity',()=>{const c=fixture().tracks[0].clips[0];const [l,r]=splitClip(c,3,30,'r');assert.equal(l.durationSeconds+r.durationSeconds,c.durationSeconds);assert.equal(r.sourceInSeconds,l.sourceOutSeconds);assert.equal(r.startSeconds,l.startSeconds+l.durationSeconds);});
test('split rejects boundaries',()=>assert.throws(()=>splitClip(fixture().tracks[0].clips[0],0,30,'r')));
