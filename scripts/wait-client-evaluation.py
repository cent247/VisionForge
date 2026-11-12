"""Wait for a background evaluation or emit a bounded diagnostic checkpoint."""
import argparse,json,os,time
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--minutes',type=float,required=True);parser.add_argument('--final',action='store_true');args=parser.parse_args()
root=Path('evidence/client-evaluation');deadline=time.monotonic()+args.minutes*60
while time.monotonic()<deadline:
 file=root/'summary.json'
 if file.exists():
  result=json.loads(file.read_text());print(json.dumps({'passed':result.get('passed'),'error':result.get('error'),'elapsedSeconds':result.get('elapsedSeconds')}));raise SystemExit(0 if result.get('passed') or not args.final else 1)
 pid_file=root/'host.pid'
 if pid_file.exists():
  try:os.kill(int(pid_file.read_text().strip()),0)
  except ProcessLookupError:raise SystemExit('Evaluation process stopped before producing its result; inspect session.log')
 status=root/'session.log'
 if status.exists():
  lines=status.read_text(errors='replace').splitlines();print('\n'.join(lines[-3:]),flush=True)
 time.sleep(20)
if args.final:raise SystemExit('Evaluation deadline reached; inspect diagnostic artifacts')
print('Diagnostic checkpoint reached; evaluation continues')
