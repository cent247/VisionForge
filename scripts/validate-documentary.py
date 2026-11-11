"""Developer-side validation of the genuine application's final MP4."""
import pathlib,json,subprocess,sys,numpy as np
root=pathlib.Path(sys.argv[1]).resolve();ev=root/'evidence';workflow=json.loads((ev/'workflow.json').read_text());project=pathlib.Path(workflow['project']);movie=root/'Night-Side.mp4';doc=json.loads((project/'project.vforge').read_text())
preview=max((project/'.visionforge-preview').glob('*.mp4'),key=lambda p:p.stat().st_mtime)
def run(args):return subprocess.check_output(args)
probe=json.loads(run(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(movie)]));(ev/'ffprobe.json').write_text(json.dumps(probe,indent=2));decode=subprocess.run(['ffmpeg','-v','error','-i',str(movie),'-f','null','-'],capture_output=True);(ev/'decode.txt').write_bytes(decode.stderr)
def frames(path):return run(['ffmpeg','-v','error','-i',str(path),'-map','0:v:0','-f','framemd5','-']).decode()
a,b=frames(movie),frames(preview);(ev/'export-frames.md5').write_text(a);(ev/'preview-frames.md5').write_text(b)
def envelope(path):
 raw=run(['ffmpeg','-v','error','-i',str(path),'-map','0:a:0','-ac','1','-ar','8000','-f','f32le','-']);x=np.frombuffer(raw,dtype=np.float32);return np.sqrt(np.mean(x[:len(x)//80*80].reshape(-1,80)**2,axis=1))
voice=next(m for m in doc['media'] if m['name']=='Generated narration.mp3');source,mix=envelope(project/voice['relativePath']),envelope(movie);checks=[]
for seconds in (10,50,90,140):
 ref=source[seconds*100:(seconds+8)*100];start=seconds*100+240;lags=list(range(-30,31));values=[float(np.corrcoef(ref,mix[start+lag:start+lag+len(ref)])[0,1]) for lag in lags];best=int(np.argmax(values));checks.append({'sourceSeconds':seconds,'lagSeconds':lags[best]/100,'envelopeCorrelation':values[best]})
analysis=subprocess.run(['ffmpeg','-hide_banner','-i',str(movie),'-af','loudnorm=I=-16:TP=-2:LRA=9:print_format=json','-f','null','-'],capture_output=True);text=analysis.stderr.decode();(ev/'loudness.txt').write_text(text);loud=json.loads(text[text.rfind('{'):text.rfind('}')+1]);audio=all(abs(c['lagSeconds'])<1/30 and c['envelopeCorrelation']>.9 for c in checks)
result={'durationSeconds':float(probe['format']['duration']),'fullDecodePassed':decode.returncode==0 and not decode.stderr,'previewExportFramesIdentical':a==b,'frames':sum(bool(x) and not x.startswith('#') for x in a.splitlines()),'audioTimingMethod':'10ms RMS envelopes,8s source windows,expected2.4s narration offset; ±300ms search. Sampled timing, not exhaustive playback or waveform identity.','audioTimingSamples':checks,'sampledAudioTimingPassed':audio,'integratedLufs':float(loud['input_i']),'truePeakDb':float(loud['input_tp']),'subtitleStreams':sum(s['codec_type']=='subtitle' for s in probe['streams'])}
result['passed']=result['durationSeconds']>=120 and result['fullDecodePassed'] and result['previewExportFramesIdentical'] and audio and -18<result['integratedLufs']<-14 and result['truePeakDb']<-.5 and result['subtitleStreams']==1;(ev/'validation.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2));assert result['passed']
