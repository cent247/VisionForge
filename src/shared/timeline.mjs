import {valueAt} from './animation.mjs';
export function timelineDuration(p){const end=Math.max(0,...p.tracks.flatMap(t=>t.clips.map(c=>c.startSeconds+c.durationSeconds)),...(p.captions??[]).map(c=>c.endSeconds));return Math.ceil((end-1e-8)*p.settings.fps)/p.settings.fps;}
export function envelopeFor(c){return c.envelope??{offsetSeconds:0,durationSeconds:c.durationSeconds,fadeSeconds:c.fadeSeconds??0};}
export function sliceClip(c,from,to,id=c.id){
 if(from<0||to>c.durationSeconds+1e-8||to<=from)throw new Error('Invalid clip slice');
 const e=envelopeFor(c),keys=['x','y','volume'],populated=keys.filter(k=>(c.keyframes??[]).some(f=>Number.isFinite(f[k])));
 const boundary=t=>Object.fromEntries([['timeSeconds',t-from],...populated.map(k=>[k,valueAt(c.keyframes,t,k,c[k]??c.transform?.[k]??0)])]);
 const keyframes=populated.length?[boundary(from),...(c.keyframes??[]).filter(k=>k.timeSeconds>from&&k.timeSeconds<to).map(k=>({...k,timeSeconds:k.timeSeconds-from})),boundary(to)]:undefined;
 return {...c,id,startSeconds:c.startSeconds+from,sourceInSeconds:c.sourceInSeconds+from*(c.speed??1),sourceOutSeconds:c.sourceInSeconds+to*(c.speed??1),durationSeconds:to-from,fadeSeconds:Math.min(c.fadeSeconds??0,(to-from)/2),envelope:{...e,offsetSeconds:e.offsetSeconds+from},keyframes};
}
