"""Recover pinned upstream build inputs for inspection; never assert GPL completeness."""
import hashlib,json,os,tarfile,urllib.request,zipfile
from pathlib import Path

ROOT=Path('source-recovery');ROOT.mkdir(exist_ok=True)
TOKEN=os.environ.get('GITHUB_TOKEN','')
class Redirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):
  new=super().redirect_request(req,fp,code,msg,headers,newurl)
  if new is not None:new.remove_header('Authorization')
  return new
OPENER=urllib.request.build_opener(Redirect())
def download(url,destination,limit,expected=None):
 headers={'Accept':'application/vnd.github+json','User-Agent':'VisionForge-source-recovery'}
 if TOKEN and url.startswith('https://api.github.com/'):headers['Authorization']='Bearer '+TOKEN
 digest=hashlib.sha256();size=0
 with OPENER.open(urllib.request.Request(url,headers=headers),timeout=120) as response,destination.open('wb') as output:
  while True:
   data=response.read(1024*1024)
   if not data:break
   size+=len(data)
   if size>limit:raise ValueError('Source download exceeds bounded size')
   digest.update(data);output.write(data)
 result={'file':destination.name,'bytes':size,'sha256':digest.hexdigest(),'url':url}
 if expected and result['sha256']!=expected:raise ValueError('Pinned source artifact hash mismatch')
 return result
report={'completeCorrespondingSource':False,'status':'recovering candidate build inputs','supplierRun':43017921659,'supplierRecipeCommit':'c9fe5114060e507409f7ee07edfd82efaf25d767','ffmpegCommit':'c179411bbb2864cc71323d3055acda25d5c2aace','files':[],'unresolved':['Review every enabled component against actual recovered source and patches','Confirm complete build/toolchain/runtime prerequisites and exact linkage to pinned executable hashes','Provide a durable source distribution alongside final binaries']}
try:
 cache=ROOT/'supplier-download-cache.zip'
 report['files'].append(download('https://api.github.com/repos/FFmpeg-Builds/FFmpeg-Builds/actions/artifacts/13853393567/zip',cache,2500000000,'078e955870c12f8c73d3e4a8e23da975b61d1f6edc6b28a09dab18a7a16beb16'))
 inventory=[]
 with zipfile.ZipFile(cache) as archive:
  members=archive.infolist()
  if len(members)>10000 or sum(m.file_size for m in members)>12000000000:raise ValueError('Unexpected source-cache archive bounds')
  for member in members:
   if member.filename.endswith('cache.tar.gz'):
    with archive.open(member) as stream,tarfile.open(fileobj=stream,mode='r|gz') as source:
     for i,item in enumerate(source):
      if i>200000:raise ValueError('Source inventory exceeds entry limit')
      if item.isfile():inventory.append({'path':item.name,'bytes':item.size})
 report['cacheInventory']=inventory
 if not inventory:raise ValueError('Supplier source cache had no inspectable source inventory')
 for repo,sha,name in [('FFmpeg/FFmpeg',report['ffmpegCommit'],'ffmpeg-source.tar.gz'),('FFmpeg-Builds/FFmpeg-Builds',report['supplierRecipeCommit'],'supplier-build-recipes.tar.gz')]:report['files'].append(download('https://api.github.com/repos/'+repo+'/tarball/'+sha,ROOT/name,200000000))
 chunks=ROOT/'chunks';chunks.mkdir(exist_ok=True);report['chunks']=[]
 with cache.open('rb') as source:
  index=0
  while True:
   data=source.read(384*1024*1024)
   if not data:break
   name='source-cache.part-'+str(index).zfill(3);(chunks/name).write_bytes(data);report['chunks'].append({'file':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()});index+=1
 report['status']='candidate source inputs recovered and hash verified; completeness review still required'
except Exception as error:
 report['status']='recovery failed';report['error']=str(error);raise
finally:(ROOT/'recovery.json').write_text(json.dumps(report,indent=2)+'\n')
