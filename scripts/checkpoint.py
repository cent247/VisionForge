"""Create a complete source checkpoint without developer dependencies or internal screenshots."""
from pathlib import Path
import zipfile,json,hashlib
root=Path(__file__).resolve().parents[1]
output=root.parents[1]/'VisionForge-audited-development-checkpoint.zip'
exclude={'node_modules','out','test-build','test-store','release','candidate-release','.git','__pycache__'}
files=[]
for p in root.rglob('*'):
 if not p.is_file() or any(part in exclude or part.startswith(('Recovered-Desktop-','Night-Side-')) for part in p.relative_to(root).parts):continue
 relative=p.relative_to(root)
 if relative.parts[:2]==('production','night-side') and ('assets' in relative.parts or p.suffix in ['.mp4','.png']):continue
 if p.suffix=='.png' or p.name=='CHECKSUMS.json':continue
 files.append(p)
checks={}
temporary=output.with_suffix('.zip.tmp')
with zipfile.ZipFile(temporary,'w',zipfile.ZIP_DEFLATED) as archive:
 for p in files:
  relative=str(p.relative_to(root));data=p.read_bytes();checks[relative]=hashlib.sha256(data).hexdigest();archive.writestr('visionforge/'+relative,data)
 archive.writestr('visionforge/CHECKSUMS.json',json.dumps(checks,indent=2))
temporary.replace(output)
(root/'CHECKSUMS.json').write_text(json.dumps(checks,indent=2))
print(json.dumps({'path':str(output),'bytes':output.stat().st_size,'files':len(files)+1}))
