"""Prepare recorded, hash-pinned original media; final assembly/export happens in VisionForge."""
import pathlib,json,urllib.request,hashlib,shutil,concurrent.futures
source=pathlib.Path(__file__).resolve().parents[1]/'production/night-side';root=source/'windows';assets=root/'assets';evidence=root/'evidence'
assets.mkdir(parents=True,exist_ok=True);evidence.mkdir(exist_ok=True)
def sha(path):
 with path.open('rb') as file:return hashlib.file_digest(file,'sha256').hexdigest()
records=[r for r in json.loads((source/'SOURCES.json').read_text())['records'] if r['name'].endswith('.mp4')]
assert len(records)==5
def download(record):
 name=record['name'];assert pathlib.Path(name).name==name
 target=assets/name
 if not target.exists() or sha(target)!=record['sha256']:
  temp=target.with_suffix('.downloading');request=urllib.request.Request(record['download'],headers={'User-Agent':'VisionForge-documentary-verification'})
  with urllib.request.urlopen(request,timeout=180) as response,temp.open('wb') as out:
   while block:=response.read(1024*1024):out.write(block)
  assert temp.stat().st_size==record['bytes'] and sha(temp)==record['sha256'],'Source media changed: '+name
  temp.replace(target)
 print(name,record['bytes'],flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:list(pool.map(download,records))
voice=source/'assets/Generated narration.mp3';assert voice.stat().st_size==3076844 and sha(voice)=='843ff21cb6bf2ca6d0b4366dfdf7f56b48786dc474515d7d2b42bbe504c70a72'
shutil.copy2(voice,assets/voice.name)
for name in ['SCRIPT.txt','SOURCES.json','SOURCES-AND-LICENSES.md','FONT-LICENSE.txt']:shutil.copy2(source/name,root/name)
shutil.copy2(source/'evidence/narration-timing.json',evidence/'narration-timing.json')
(evidence/'input-provenance.json').write_text(json.dumps({'footage':records,'narration':{'file':voice.name,'sha256':sha(voice),'bytes':voice.stat().st_size,'origin':'Recorded original Kokoro narration from the genuine Linux application workflow; reused, not newly synthesized.'},'music':'Generated original harmonic pad by the UI test recipe; no samples','assembly':'Windows application UI and shared project engine; no external final assembly'},indent=2))
print('Pinned footage and original narration prepared. No AI model installation is needed.')
