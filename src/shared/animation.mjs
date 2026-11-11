export function valueAt(frames,time,key,fallback=0){
 const values=(frames??[]).filter(f=>Number.isFinite(f[key])).sort((a,b)=>a.timeSeconds-b.timeSeconds);if(!values.length)return fallback;
 if(time<=values[0].timeSeconds)return values[0][key];
 for(let i=1;i<values.length;i++){const a=values[i-1],b=values[i];if(time<=b.timeSeconds)return a[key]+(b[key]-a[key])*(time-a.timeSeconds)/(b.timeSeconds-a.timeSeconds);}
 return values[values.length-1][key];
}
export function expressionAt(frames,key,fallback=0){
 const values=(frames??[]).filter(f=>Number.isFinite(f[key])).sort((a,b)=>a.timeSeconds-b.timeSeconds);if(!values.length)return String(fallback);
 let expression=String(values[values.length-1][key]);
 for(let i=values.length-1;i>0;i--){const a=values[i-1],b=values[i];expression=`if(lt(t,${b.timeSeconds}),${a[key]}+(${b[key]-a[key]})*(t-${a.timeSeconds})/${b.timeSeconds-a.timeSeconds},${expression})`;}
 return `if(lt(t,${values[0].timeSeconds}),${values[0][key]},${expression})`;
}
export function fadeAt(clip,time){const e=clip.envelope??{offsetSeconds:0,durationSeconds:clip.durationSeconds,fadeSeconds:clip.fadeSeconds??0};if(!e.fadeSeconds)return 1;const t=time+e.offsetSeconds;return Math.max(0,Math.min(1,t/e.fadeSeconds,(e.durationSeconds-t)/e.fadeSeconds));}
