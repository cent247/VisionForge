"""Wait for a background evaluation or emit a bounded diagnostic checkpoint."""
import argparse,json,os,time
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--minutes',type=float,required=True);parser.add_argument('--final',action='store_true');parser.add_argument('--after-boot',action='store_true');args=parser.parse_args()
root=Path('evidence/client-evaluation');deadline=time.monotonic()+(15*60 if args.after_boot else args.minutes*60);boot_seen=False
while time.monotonic()<deadline:
 file=root/'summary.json'
 if file.exists():
  result=json.loads(file.read_text());print(json.dumps({'passed':result.get('passed'),'error':result.get('error'),'elapsedSeconds':result.get('elapsedSeconds')}));raise SystemExit(0 if result.get('passed') or not args.final else 1)
 pid_file=root/'host.pid'
 if pid_file.exists():
  try:os.kill(int(pid_file.read_text().strip()),0)
  except ProcessLookupError:raise SystemExit('Evaluation process stopped before producing its result; inspect session.log')
 boot_file=root/'host-platform.json'
 if args.after_boot and not boot_seen and boot_file.exists():
  deadline=time.monotonic()+max(0,boot_file.stat().st_mtime+args.minutes*60-time.time());boot_seen=True
 status=root/'session.log'
 if status.exists():
  lines=status.read_text(errors='replace').splitlines();print('\n'.join(lines[-3:]),flush=True)
 time.sleep(20)
if args.final or args.after_boot and not boot_seen:raise SystemExit('Evaluation deadline reached; inspect diagnostic artifacts')
print('Diagnostic checkpoint reached; evaluation continues')
