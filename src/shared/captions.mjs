export function parseSrt(text){
 const time=s=>{const m=/^(\d+):(\d{2}):(\d{2})[,.](\d{3})$/.exec(s.trim());if(!m||+m[2]>59||+m[3]>59)throw new Error('Invalid caption timestamp');return +m[1]*3600 + +m[2]*60 + +m[3]+ +m[4]/1000;};
 if(!text.trim())return [];
 return text.replace(/\r/g,'').trim().split(/\n\s*\n/).map((block,i)=>{const lines=block.split('\n');if(/^\d+$/.test(lines[0]))lines.shift();const timing=lines.shift()?.split(/\s+-->\s+/);if(!timing||timing.length!==2)throw new Error(`Invalid caption ${i+1}`);const start=time(timing[0]),end=time(timing[1]);if(end<=start||!lines.join('').trim())throw new Error(`Invalid caption ${i+1}`);return{id:`caption-${i}`,startSeconds:start,endSeconds:end,text:lines.join('\n')};});
}
export function toSrt(captions){const stamp=t=>{const n=Math.round(t*1000);return `${String(Math.floor(n/3600000)).padStart(2,'0')}:${String(Math.floor(n/60000)%60).padStart(2,'0')}:${String(Math.floor(n/1000)%60).padStart(2,'0')},${String(n%1000).padStart(3,'0')}`;};return captions.map((c,i)=>`${i+1}\n${stamp(c.startSeconds)} --> ${stamp(c.endSeconds)}\n${c.text}\n`).join('\n');}
