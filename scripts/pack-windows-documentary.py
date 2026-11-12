"""Pack the actual application's saved project and media, without preview cache or developer tools."""
import pathlib,json,zipfile,hashlib
root=pathlib.Path('production/night-side/windows');workflow=json.loads((root/'evidence/workflow.json').read_text());assert workflow['completed'];project=pathlib.Path(workflow['project']);doc=json.loads((project/'project.vforge').read_text())
output=root/'Night-Side-Windows-Project.zip';checks={}
with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED) as archive:
 for file in [project/'project.vforge']+[project/m['relativePath'] for m in doc['media']]:
  name=str(pathlib.Path('project')/file.relative_to(project));archive.write(file,name);checks[name]=hashlib.file_digest(file.open('rb'),'sha256').hexdigest()
 for name in ['SCRIPT.txt','SOURCES.json','SOURCES-AND-LICENSES.md','FONT-LICENSE.txt','captions.srt']:archive.write(root/name,name)
 for name in ['workflow.json','validation.json','input-provenance.json','ffprobe.json']:archive.write(root/'evidence'/name,'evidence/'+name)
 archive.writestr('MEDIA-SHA256.json',json.dumps(checks,indent=2))
print(json.dumps({'projectMedia':len(doc['media']),'projectPackage':str(output),'bytes':output.stat().st_size,'sha256':hashlib.file_digest(output.open('rb'),'sha256').hexdigest()}))
