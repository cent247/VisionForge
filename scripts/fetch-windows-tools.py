"""Fetch a pinned Windows FFmpeg/FFprobe candidate; verify archive and executable provenance."""
import pathlib,sys,json,urllib.request,hashlib,zipfile,struct,shutil
stage=pathlib.Path(sys.argv[1]).resolve();stage.mkdir(exist_ok=True,parents=True)
url='https://api.github.com/repos/FFmpeg-Builds/FFmpeg-Builds/releases/tags/latest'
request=urllib.request.Request(url,headers={'User-Agent':'VisionForge-development-verification','Accept':'application/vnd.github+json'})
with urllib.request.urlopen(request,timeout=30) as response:release=json.load(response)
asset=next(a for a in release['assets'] if a['name']=='ffmpeg-n9.0-latest-win64-gpl-9.0.zip')
expected=asset.get('digest','');assert expected.startswith('sha256:'),'Published archive SHA256 is required'
archive=stage/asset['name']
with urllib.request.urlopen(asset['browser_download_url'],timeout=180) as response,archive.open('wb') as out:
 while block:=response.read(1024*1024):out.write(block)
actual=hashlib.file_digest(archive.open('rb'),'sha256').hexdigest();assert 'sha256:'+actual==expected,'Archive checksum mismatch';assert archive.stat().st_size==asset['size']
folder=stage/'verified';folder.mkdir(exist_ok=True);files=[]
with zipfile.ZipFile(archive) as z:
 for name in ['ffmpeg.exe','ffprobe.exe']:
  entry=next(i for i in z.namelist() if i.endswith('/bin/'+name));data=z.read(entry);offset=struct.unpack_from('<I',data,60)[0];assert data[:2]==b'MZ' and data[offset:offset+4]==b'PE\0\0' and struct.unpack_from('<H',data,offset+4)[0]==0x8664,'Not an AMD64 PE executable';(folder/name).write_bytes(data);files.append({'file':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'machine':'AMD64'})
 for basename in ['LICENSE.txt','README.txt']:
  entries=[i for i in z.namelist() if i.endswith('/'+basename)]
  if entries:(folder/basename).write_bytes(z.read(entries[0]))
manifest={'release':release['html_url'],'releaseName':release['name'],'assetId':asset['id'],'archive':asset['browser_download_url'],'archiveBytes':asset['size'],'archiveSha256':actual,'files':files,'verification':'Archive hash and AMD64 executable headers verified. Windows execution not tested. Final GPL corresponding-source/dependency review remains required.'}
(folder/'MANIFEST.json').write_text(json.dumps(manifest,indent=2));(stage/'release-metadata.json').write_text(json.dumps(release,indent=2));print(json.dumps(manifest,indent=2))
