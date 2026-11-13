import {sliceClip} from './timeline.mjs';
// Shared boundary validation: reject malformed documents before persistence or export.
export function validateProject(p) {
 const fail = message => { throw new Error(message); };
 const num = (n, min, max) => typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max;
 if (!p || p.schemaVersion !== 1 || typeof p.id !== 'string' || typeof p.name !== 'string' || !Array.isArray(p.media) || !Array.isArray(p.tracks) || p.media.length > 10000 || p.tracks.length > 100) fail('Invalid project document');
 const s = p.settings;
 if (!s || !Number.isInteger(s.width) || !Number.isInteger(s.height) || !num(s.width, 16, 7680) || !num(s.height, 16, 4320) || s.width % 2 || s.height % 2 || !num(s.fps, 1, 120)) fail('Invalid export settings');
 if(s.loudness){const a=s.loudness;if(typeof a.enabled!=='boolean'||!num(a.integratedLufs,-30,-10)||!num(a.truePeakDb,-9,-1)||!num(a.range,1,20))fail('Invalid audio loudness');}
 if(p.captionStyle){for(const [key,min,max] of [['fontSize',8,200],['outline',0,10],['bottomMargin',0,500]])if(p.captionStyle[key]!==undefined&&!num(p.captionStyle[key],min,max))fail('Invalid caption style');}
 for(const key of ['script','storyboard'])if(p[key]!==undefined&&(typeof p[key]!=='string'||p[key].length>1000000))fail('Invalid script draft');
 const ids = new Set();
 for (const m of p.media) {
  if (!m || typeof m.id !== 'string' || ids.has(m.id) || typeof m.relativePath !== 'string' || !/^media\/[a-zA-Z0-9_.-]+$/.test(m.relativePath) || !['video','audio','image'].includes(m.mediaType) || (m.durationSeconds !== null && !num(m.durationSeconds, 0.001, 604800))) fail('Invalid media entry');
  if(m.source!==undefined){const a=m.source;if(!a||a.provider!=='pexels'||typeof a.id!=='string'||!/^\d{1,20}$/.test(a.id)||typeof a.creator!=='string'||!a.creator.trim()||a.creator.length>200||typeof a.pageUrl!=='string'||a.pageUrl.length>2000||!/^https:\/\/www\.pexels\.com\/video\/[a-zA-Z0-9-]+\/$/.test(a.pageUrl)||a.licenseUrl!=='https://www.pexels.com/license/'||typeof a.downloadedAt!=='string'||a.downloadedAt.length>40||!Number.isFinite(Date.parse(a.downloadedAt))||typeof a.sha256!=='string'||! /^[a-f0-9]{64}$/.test(a.sha256))fail('Invalid stock source attribution');}
  ids.add(m.id);
 }
 for(const c of p.captions??[]){if(!num(c.startSeconds,0,604800)||!num(c.endSeconds,c.startSeconds+0.001,604800)||typeof c.text!=='string'||c.text.length>1000)fail('Invalid caption');}
 const trackIds = new Set(), clipIds = new Set();
 for (const t of p.tracks) {
  if (!t || typeof t.id !== 'string' || trackIds.has(t.id) || !['video','audio','overlay'].includes(t.kind) || !Array.isArray(t.clips) || t.clips.length > 10000) fail('Invalid track');
  trackIds.add(t.id);
  for (const c of t.clips) {
   if (!c || typeof c.id !== 'string' || clipIds.has(c.id) || !ids.has(c.mediaId) || !num(c.startSeconds,0,604800) || !num(c.sourceInSeconds,0,604800) || !num(c.durationSeconds,0.001,604800) || typeof c.label !== 'string') fail('Invalid clip');
   if(c.volume!==undefined&&!num(c.volume,0,4)||c.fadeSeconds!==undefined&&!num(c.fadeSeconds,0,c.durationSeconds/2)||c.speed!==undefined&&!num(c.speed,0.25,4))fail('Invalid clip effect');
   if(c.overlayText!==undefined&&(typeof c.overlayText!=='string'||c.overlayText.length>4000))fail('Invalid overlay text');
   if(c.textStyle&&(!num(c.textStyle.fontSize,8,200)||typeof c.textStyle.background!=='boolean'))fail('Invalid text style');
   if(c.motion!==undefined&&typeof c.motion!=='boolean')fail('Invalid motion effect');
   if(c.muteSourceAudio!==undefined&&typeof c.muteSourceAudio!=='boolean')fail('Invalid audio mute');
   if(c.envelope){const e=c.envelope;if(!num(e.offsetSeconds,0,604800)||!num(e.durationSeconds,.001,604800)||!num(e.fadeSeconds,0,e.durationSeconds/2)||e.offsetSeconds+c.durationSeconds>e.durationSeconds+.001)fail('Invalid animation envelope');}
   if(c.transform){if(typeof c.transform!=='object'||Array.isArray(c.transform))fail('Invalid transform');if(c.transform.fit!==undefined&&!['contain','cover'].includes(c.transform.fit))fail('Invalid media fit');for(const [key,min,max] of [['sourceX',0,1],['sourceY',0,1],['x',-1,1],['y',-1,1],['scale',0.1,4],['crop',0,0.45],['brightness',-1,1],['contrast',0,3],['saturation',0,3]])if(c.transform[key]!==undefined&&!num(c.transform[key],min,max))fail('Invalid transform');}
   if(c.keyframes){if(!Array.isArray(c.keyframes)||c.keyframes.length>1000)fail('Invalid keyframes');const times=new Set();for(const k of c.keyframes){if(!num(k.timeSeconds,0,c.durationSeconds)||times.has(k.timeSeconds))fail('Invalid keyframe time');times.add(k.timeSeconds);for(const key of ['x','y'])if(k[key]!==undefined&&!num(k[key],-1,1))fail('Invalid position keyframe');if(k.volume!==undefined&&!num(k.volume,0,4))fail('Invalid volume keyframe');}}
   const m = p.media.find(m => m.id === c.mediaId);
   if (m.mediaType === 'audio' && t.kind !== 'audio' || m.mediaType === 'image' && t.kind === 'audio') fail('Incompatible track media');
   if (m.durationSeconds !== null && c.sourceInSeconds + c.durationSeconds*(c.speed??1) > m.durationSeconds + 0.05) fail('Clip exceeds source duration');
   clipIds.add(c.id);
  }
 }
 return p;
}
export function splitClip(c, at, fps, rightId) {
 const offset = Math.round((at - c.startSeconds) * fps) / fps;
 if (offset < 1 / fps || offset > c.durationSeconds - 1 / fps) throw new Error('Place playhead inside the selected clip.');
 return [sliceClip(c,0,offset),sliceClip(c,offset,c.durationSeconds,rightId)];
}
