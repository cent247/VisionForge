import {test} from 'node:test';
import assert from 'node:assert/strict';
import {timelineDuration,sliceClip} from '../src/shared/timeline.mjs';
import {valueAt,fadeAt} from '../src/shared/animation.mjs';
import {splitClip} from '../src/shared/project.mjs';
test('duration includes audio tails and captions, rounded up to a complete frame',()=>{assert.equal(timelineDuration({settings:{fps:30},tracks:[{clips:[{startSeconds:2,durationSeconds:1.01}]}],captions:[{endSeconds:4.01}]}),121/30);});
test('split preserves animation, speed, source position and fade envelopes',()=>{const c={id:'a',startSeconds:3,sourceInSeconds:2,durationSeconds:6,speed:1.5,fadeSeconds:1,keyframes:[{timeSeconds:0,x:-.6,volume:.2},{timeSeconds:3,x:.6,volume:1},{timeSeconds:6,x:0,volume:.3}]};const parts=splitClip(c,5,30,'b');for(let i=0;i<=120;i++){const t=i/20,p=t<2?parts[0]:parts[1],local=t-(p.startSeconds-c.startSeconds);assert.ok(Math.abs(valueAt(c.keyframes,t,'x')-valueAt(p.keyframes,local,'x'))<1e-8);assert.ok(Math.abs(fadeAt(c,t)-fadeAt(p,local))<1e-8);}assert.equal(parts[1].sourceInSeconds,5);});
test('nested slices retain original envelope and interpolate new keyframe boundaries',()=>{const c={id:'a',startSeconds:0,sourceInSeconds:0,durationSeconds:10,fadeSeconds:2,keyframes:[{timeSeconds:0,volume:0},{timeSeconds:10,volume:1}]};const s=sliceClip(sliceClip(c,1,9),1,6);assert.equal(s.envelope.offsetSeconds,2);assert.equal(s.keyframes[0].volume,.2);assert.ok(Math.abs(s.keyframes.at(-1).volume-.7)<1e-8);});
