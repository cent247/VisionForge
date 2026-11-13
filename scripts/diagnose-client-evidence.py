"""Summarize retained Windows evaluation evidence; never rerun the guest."""
import json, pathlib, subprocess, sys
root=pathlib.Path(sys.argv[1]); records=[]
for folder in sorted(root.iterdir()):
 if not folder.is_dir(): continue
 record={'target':folder.name}
 for name in ['summary.json','host-platform.json','guest-report.json']:
  file=folder/name
  if file.exists(): record[name]=json.loads(file.read_text())
 images=sorted(folder.glob('display-*.png'))
 # Initial, middle, and final screens distinguish installation from a guest crash.
 selected=sorted(set([0,len(images)//2,len(images)-1])) if images else []
 record['screens']=[]
 for index in selected:
  image=images[index]
  result=subprocess.run(['tesseract',str(image),'stdout'],capture_output=True,text=True,timeout=30)
  record['screens'].append({'file':image.name,'ocr':result.stdout[:5000],'ocrExitCode':result.returncode})
 log=folder/'qemu.log'
 if log.exists():record['qemuLogTail']=log.read_text(errors='replace')[-4000:]
 records.append(record)
output=root/'diagnosis.json';output.write_text(json.dumps(records,indent=2)+'\n')
print(json.dumps(records,indent=2))
