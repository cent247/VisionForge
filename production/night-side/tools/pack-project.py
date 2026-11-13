from pathlib import Path
import json,zipfile,hashlib
root=Path(__file__).resolve().parents[1];record=json.loads((root/'evidence/workflow.json').read_text());project=Path(record['project']);document=json.loads((project/'project.vforge').read_text());files=[project/'project.vforge']+[project/m['relativePath'] for m in document['media']];mapping=[]
output=root.parents[3]/'VisionForge-Night-Side-Project.zip'
with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED) as archive:
 for p in files:
  relative='project/'+str(p.relative_to(project));archive.write(p,relative);mapping.append({'path':relative,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
 for name in ['SCRIPT.txt','captions.srt','SOURCES.json','SOURCES-AND-LICENSES.md','FONT-LICENSE.txt']:
  p=root/name
  if p.exists():archive.write(p,name)
 for folder in ['tools','evidence','source-metadata']:
  for p in (root/folder).rglob('*'):
   if p.is_file() and p.suffix not in ['.png','.mp4']:archive.write(p,str(p.relative_to(root)))
 archive.writestr('PROJECT-MEDIA-CHECKSUMS.json',json.dumps(mapping,indent=2))
print(json.dumps({'path':str(output),'bytes':output.stat().st_size,'media':len(document['media'])}))
