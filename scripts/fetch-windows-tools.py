"""Fetch the recorded Windows tool archive without an unauthenticated metadata API call."""
import pathlib,sys,json,urllib.request,hashlib,zipfile,struct
root=pathlib.Path(__file__).resolve().parents[1]
manifest=json.loads((root/'resources/tools/win-x64/MANIFEST.json').read_text())
stage=pathlib.Path(sys.argv[1]).resolve();stage.mkdir(exist_ok=True,parents=True)
url=manifest['archive']
assert url.startswith('https://github.com/FFmpeg-Builds/FFmpeg-Builds/releases/download/'),'Unexpected supplier'
archive=stage/'windows-tools-pinned.zip'
def verified():
 return archive.is_file() and archive.stat().st_size==manifest['archiveBytes'] and hashlib.file_digest(archive.open('rb'),'sha256').hexdigest()==manifest['archiveSha256']
if not verified():
 request=urllib.request.Request(url,headers={'User-Agent':'VisionForge-development-verification'})
 with urllib.request.urlopen(request,timeout=180) as response,archive.open('wb') as out:
  while block:=response.read(1024*1024):out.write(block)
assert verified(),'Pinned supplier archive changed or was incomplete; do not silently refresh the recorded build'
folder=stage/'verified';folder.mkdir(exist_ok=True)
with zipfile.ZipFile(archive) as z:
 for expected in manifest['files']:
  name=expected['file'];assert name in ['ffmpeg.exe','ffprobe.exe']
  entry=next(i for i in z.namelist() if i.endswith('/bin/'+name));data=z.read(entry)
  assert len(data)==expected['bytes'] and hashlib.sha256(data).hexdigest()==expected['sha256'],'Pinned executable hash mismatch'
  offset=struct.unpack_from('<I',data,60)[0]
  assert data[:2]==b'MZ' and data[offset:offset+4]==b'PE\0\0' and struct.unpack_from('<H',data,offset+4)[0]==0x8664,'Not AMD64'
  (folder/name).write_bytes(data)
 for name in ['LICENSE.txt','README.txt']:
  entries=[i for i in z.namelist() if i.endswith('/'+name)]
  if entries:(folder/name).write_bytes(z.read(entries[0]))
(folder/'MANIFEST.json').write_text(json.dumps(manifest,indent=2));print(json.dumps({'pinnedArchiveSha256':manifest['archiveSha256'],'executablesVerified':len(manifest['files']),'metadataApiRequired':False}))
