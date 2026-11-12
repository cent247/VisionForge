"""Run real installed-app checks in an official, isolated Windows evaluation VM.

Never uploads Windows media, guest disks, answer files or generated credentials.
"""
import argparse,hashlib,http.server,json,os,secrets,shutil,socket,subprocess,tarfile,threading,time,urllib.request,zipfile
from pathlib import Path
from xml.sax.saxutils import escape

REPO=Path(__file__).resolve().parents[1]
ISO_URL='https://software-static.download.prss.microsoft.com/dbazure/26300.9457.260913-1737.26h2_ge_release_svc_refresh_CLIENTENTERPRISEEVAL_OEMRET_x64FRE_en-us.iso'
ISO_SHA='bc3f24086ebadc94489066b5ad78089e2cf5c3491e90e790bb81a2b199c10e38'
ISO_BYTES=8225329152
WINDOWS10={
 'url':'https://go.microsoft.com/fwlink/p/?LinkID=2195400&clcid=0x409&country=US&culture=en-us',
 'sha256':'69efac1df9ec8066341d8c9b62297ddece0e6b805533fdb6dd66bc8034fba27a',
 'bytes':5344178176,
 'updates':[
  {'file':'KB5015878-x64.msu','url':'https://catalog.s.download.windowsupdate.com/c/msdownload/update/software/updt/2022/07/windows10.0-kb5015878-x64_3dc7b300371db8672f7fa3b32d4481dccec082b3.msu','sha256':'16a9b53219e0021afcb5daf1fcf4dc2b68e10d6df7a5d78a7ca33c6ac03ed21b'},
  {'file':'KB5015684-x64.msu','url':'https://catalog.s.download.windowsupdate.com/c/upgr/2022/07/windows10.0-kb5015684-x64_523c039b86ca98f2d818c4e6706e2cc94b634c4a.msu','sha256':'cc1a32fff2700b70c2e6c1a70485f2c0b9c12374f420f13e764850b0a8bf7c89'}
 ]}
NODE_VERSION='24.22.2'
INSTALLER_SHA='cbf3eecda878bfa68a425fdb7d637ff6d2248ba337cd06e848a7aaf50fdb87f7'

def digest(path):
 h=hashlib.sha256()
 with path.open('rb') as stream:
  for data in iter(lambda:stream.read(8*1024*1024),b''):h.update(data)
 return h.hexdigest()
def download(url,path):
 if not path.exists():urllib.request.urlretrieve(url,path)

def prepare(work,installer,target='windows11'):
 payload=work/'payload';payload.mkdir(parents=True,exist_ok=True)
 if digest(installer)!=INSTALLER_SHA:raise ValueError('Pinned tested installer mismatch')
 shutil.copyfile(installer,payload/'installer.exe')
 node_name=f'node-v{NODE_VERSION}-win-x64.zip'
 download(f'https://nodejs.org/dist/v{NODE_VERSION}/{node_name}',payload/'node.zip')
 sums=urllib.request.urlopen(f'https://nodejs.org/dist/v{NODE_VERSION}/SHASUMS256.txt',timeout=60).read().decode()
 node_sha=next(line.split()[0] for line in sums.splitlines() if line.endswith('  '+node_name))
 if digest(payload/'node.zip')!=node_sha:raise ValueError('Official Node runtime hash mismatch')
 with zipfile.ZipFile(payload/'harness.zip','w',zipfile.ZIP_DEFLATED) as archive:
  for folder in ['tests','node_modules/playwright-core']:
   for file in (REPO/folder).rglob('*'):
    if file.is_file():archive.write(file,file.relative_to(REPO))
  archive.write(REPO/'scripts/check-packaged-licenses.cjs','scripts/check-packaged-licenses.cjs')
 private=work/'private';private.mkdir(mode=0o700,exist_ok=True)
 password=secrets.token_hex(16)+'aA!7';token=secrets.token_hex(32)
 config={'baseUrl':'http://10.0.2.2:28080','reportToken':token,'installerSha256':INSTALLER_SHA,'nodeSha256':node_sha}
 config['targetBuild']='19045' if target=='windows10' else '26300'
 if target=='windows10':
  config['updates']=WINDOWS10['updates']
  for update in config['updates']:
   download(update['url'],payload/update['file'])
   if digest(payload/update['file'])!=update['sha256']:raise ValueError('Microsoft update package hash mismatch')
 (private/'guest-config.json').write_text(json.dumps(config))
 shutil.copyfile(REPO/'scripts/windows-client-guest.ps1',private/'guest-start.ps1')
 if target=='windows10':shutil.copyfile(REPO/'scripts/windows10-evaluation-updates.ps1',private/'guest-updates.ps1')
 (private/'vf-seed.marker').write_text('Isolated evaluation setup')
 first="powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -Command &quot;$d=Get-PSDrive -PSProvider FileSystem | Where-Object {Test-Path (Join-Path $_.Root 'vf-seed.marker')} | Select-Object -First 1; if($d){Start-Process powershell.exe -ArgumentList @('-NoProfile','-ExecutionPolicy','RemoteSigned','-File',(Join-Path $d.Root 'guest-start.ps1'))}&quot;"
 if target=='windows10':first=first.replace('guest-start.ps1','guest-updates.ps1')
 component='processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS"'
 xml=f'''<?xml version="1.0" encoding="utf-8"?>
<unattend xmlns="urn:schemas-microsoft-com:unattend" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State">
 <settings pass="windowsPE">
  <component name="Microsoft-Windows-International-Core-WinPE" {component}><SetupUILanguage><UILanguage>en-US</UILanguage></SetupUILanguage><InputLocale>0409:00000409</InputLocale><SystemLocale>en-US</SystemLocale><UILanguage>en-US</UILanguage><UserLocale>en-US</UserLocale></component>
  <component name="Microsoft-Windows-Setup" {component}>
   <DynamicUpdate><Enable>false</Enable></DynamicUpdate>
   <DiskConfiguration><Disk wcm:action="add"><DiskID>0</DiskID><WillWipeDisk>true</WillWipeDisk><CreatePartitions>
    <CreatePartition wcm:action="add"><Order>1</Order><Type>EFI</Type><Size>260</Size></CreatePartition>
    <CreatePartition wcm:action="add"><Order>2</Order><Type>MSR</Type><Size>16</Size></CreatePartition>
    <CreatePartition wcm:action="add"><Order>3</Order><Type>Primary</Type><Extend>true</Extend></CreatePartition>
   </CreatePartitions><ModifyPartitions>
    <ModifyPartition wcm:action="add"><Order>1</Order><PartitionID>1</PartitionID><Format>FAT32</Format><Label>System</Label></ModifyPartition>
    <ModifyPartition wcm:action="add"><Order>2</Order><PartitionID>3</PartitionID><Format>NTFS</Format><Label>Windows</Label><Letter>C</Letter></ModifyPartition>
   </ModifyPartitions></Disk><WillShowUI>OnError</WillShowUI></DiskConfiguration>
   <ImageInstall><OSImage><InstallFrom><MetaData wcm:action="add"><Key>/IMAGE/INDEX</Key><Value>1</Value></MetaData></InstallFrom><InstallTo><DiskID>0</DiskID><PartitionID>3</PartitionID></InstallTo><WillShowUI>OnError</WillShowUI></OSImage></ImageInstall>
   <UserData><AcceptEula>true</AcceptEula><FullName>VisionForge Test</FullName><Organization>Local software evaluation</Organization></UserData>
  </component>
 </settings>
 <settings pass="specialize"><component name="Microsoft-Windows-Shell-Setup" {component}><ComputerName>VF-CLIENT-TEST</ComputerName><TimeZone>UTC</TimeZone></component></settings>
 <settings pass="oobeSystem">
  <component name="Microsoft-Windows-International-Core" {component}><InputLocale>0409:00000409</InputLocale><SystemLocale>en-US</SystemLocale><UILanguage>en-US</UILanguage><UserLocale>en-US</UserLocale></component>
  <component name="Microsoft-Windows-Shell-Setup" {component}>
   <OOBE><HideEULAPage>true</HideEULAPage><HideOnlineAccountScreens>true</HideOnlineAccountScreens><HideWirelessSetupInOOBE>true</HideWirelessSetupInOOBE><ProtectYourPC>3</ProtectYourPC></OOBE>
   <UserAccounts><LocalAccounts><LocalAccount wcm:action="add"><Name>VFTestAdmin</Name><Group>Administrators</Group><Password><Value>{escape(password)}</Value><PlainText>true</PlainText></Password></LocalAccount></LocalAccounts></UserAccounts>
   <AutoLogon><Enabled>true</Enabled><Username>VFTestAdmin</Username><LogonCount>5</LogonCount><Password><Value>{escape(password)}</Value><PlainText>true</PlainText></Password></AutoLogon>
   <FirstLogonCommands><SynchronousCommand wcm:action="add"><Order>1</Order><Description>Run isolated application acceptance</Description><CommandLine>{first}</CommandLine></SynchronousCommand></FirstLogonCommands>
  </component>
 </settings>
</unattend>'''
 (private/'Autounattend.xml').write_text(xml)
 import xml.etree.ElementTree as ET
 ET.fromstring(xml)
 subprocess.run(['xorriso','-as','mkisofs','-quiet','-J','-R','-V','VFSEED','-o',str(work/'seed.iso'),str(private)],check=True)
 for file in private.iterdir():file.chmod(0o600)
 (work/'seed.iso').chmod(0o600)
 return payload,token

class QMP:
 def __init__(self,port):
  self.socket=socket.create_connection(('127.0.0.1',port),timeout=20);self.file=self.socket.makefile('rwb');self.file.readline();self.command('qmp_capabilities')
 def command(self,name,arguments=None):
  self.file.write(json.dumps({'execute':name,**({'arguments':arguments} if arguments else {})}).encode()+b'\n');self.file.flush()
  while True:
   result=json.loads(self.file.readline())
   if 'return' in result:return result['return']
   if 'error' in result:raise RuntimeError(result['error'])

def run(args):
 work=args.work.resolve();work.mkdir(parents=True,exist_ok=True);evidence=REPO/'evidence/client-evaluation';evidence.mkdir(parents=True,exist_ok=True)
 payload,token=prepare(work,args.installer.resolve(),args.target)
 iso=work/(args.target+'-Enterprise-Evaluation-x64.iso');url=WINDOWS10['url'] if args.target=='windows10' else ISO_URL;iso_sha=WINDOWS10['sha256'] if args.target=='windows10' else ISO_SHA;iso_bytes=WINDOWS10['bytes'] if args.target=='windows10' else ISO_BYTES
 download(url,iso)
 if iso.stat().st_size!=iso_bytes or digest(iso)!=iso_sha:raise ValueError('Microsoft-published evaluation ISO hash mismatch')
 report={'passed':False,'isoSha256':iso_sha,'installerSha256':INSTALLER_SHA,'osTest':args.target+' Enterprise evaluation x64 VM','physicalHardwareTest':False,'events':[],'updateInputs':WINDOWS10['updates'] if args.target=='windows10' else []}
 class Handler(http.server.SimpleHTTPRequestHandler):
  def __init__(self,*a,**k):super().__init__(*a,directory=str(payload),**k)
  def log_message(self,*a):pass
  def do_POST(self):
   if self.path!='/report' or self.headers.get('Authorization')!='Bearer '+token:self.send_error(403);return
   size=int(self.headers.get('Content-Length','0'))
   if not 0<size<10_000_000:self.send_error(413);return
   event=json.loads(self.rfile.read(size));report['events'].append(event);print('Guest stage: '+str(event.get('stage')),flush=True)
   (evidence/'guest-report.json').write_text(json.dumps(report,indent=2));self.send_response(200);self.end_headers();self.wfile.write(b'OK')
 server=http.server.ThreadingHTTPServer(('127.0.0.1',28080),Handler);threading.Thread(target=server.serve_forever,daemon=True).start()
 kvm=os.access('/dev/kvm',os.R_OK|os.W_OK);report['acceleration']='kvm' if kvm else 'tcg';print('Guest acceleration: '+report['acceleration'],flush=True)
 vars_file=work/'OVMF_VARS.fd';shutil.copyfile('/usr/share/OVMF/OVMF_VARS_4M.ms.fd',vars_file)
 disk=work/'system.qcow2'
 if not disk.exists():subprocess.run(['qemu-img','create','-f','qcow2',str(disk),'64G'],check=True)
 tpm_dir=work/'tpm';tpm_dir.mkdir(exist_ok=True);left,right=socket.socketpair()
 log=(evidence/'qemu.log').open('wb');tlog=(evidence/'swtpm.log').open('wb')
 tpm=subprocess.Popen(['swtpm','socket','--tpm2','--tpmstate','dir='+str(tpm_dir),'--ctrl','type=unixio,clientfd='+str(left.fileno()),'--flags','not-need-init'],pass_fds=[left.fileno()],stdout=tlog,stderr=subprocess.STDOUT);left.close()
 command=['qemu-system-x86_64','-machine','q35,smm=on','-accel','kvm' if kvm else 'tcg,thread=multi','-cpu','host' if kvm else 'max','-smp','2','-m','4096','-drive','if=pflash,format=raw,readonly=on,file=/usr/share/OVMF/OVMF_CODE_4M.secboot.fd','-drive','if=pflash,format=raw,file='+str(vars_file),'-drive','file='+str(disk)+',format=qcow2,if=ide','-cdrom',str(iso),'-drive','file='+str(work/'seed.iso')+',media=cdrom,readonly=on,if=ide','-boot','once=d,order=c,menu=on','-chardev','socket,id=chrtpm,fd='+str(right.fileno()),'-tpmdev','emulator,id=tpm0,chardev=chrtpm','-device','tpm-tis,tpmdev=tpm0','-nic','user,model=e1000e','-display','none','-vnc','127.0.0.1:71','-qmp','tcp:127.0.0.1:34441,server=on,wait=off','-audiodev','none,id=audio0','-device','ich9-intel-hda','-device','hda-duplex,audiodev=audio0']
 process=subprocess.Popen(command,pass_fds=[right.fileno()],stdout=log,stderr=subprocess.STDOUT);right.close();started=time.monotonic();qmp=None
 try:
  for _ in range(40):
   try:qmp=QMP(34441);break
   except OSError:
    if process.poll() is not None:raise RuntimeError('QEMU stopped before QMP startup')
    time.sleep(1)
  if qmp is None:raise RuntimeError('QMP unavailable')
  report['tpmBackend']=qmp.command('query-tpm')
  next_capture=0;capture=0
  while time.monotonic()-started<args.timeout_minutes*60:
   elapsed=time.monotonic()-started
   if elapsed<35:qmp.command('human-monitor-command',{'command-line':'sendkey spc'})
   if elapsed>=next_capture:
    try:qmp.command('screendump',{'filename':str(evidence/f'display-{capture:03d}.png'),'format':'png'})
    except RuntimeError:qmp.command('screendump',{'filename':str(evidence/f'display-{capture:03d}.ppm')})
    capture+=1;next_capture=elapsed+90;print(f'Guest elapsed: {elapsed:.0f}s; free disk: {shutil.disk_usage(work).free//1024**3}GiB',flush=True)
   completed=next((e for e in report['events'] if e.get('stage')=='complete'),None)
   if completed:
    report['passed']=completed['details'].get('passed') is True
    if not report['passed']:raise RuntimeError('Guest acceptance failed; inspect guest-report.json')
    break
   if process.poll() is not None:raise RuntimeError('Guest stopped without acceptance report')
   if shutil.disk_usage(work).free<5*1024**3:raise RuntimeError('Test host disk reserve reached')
   time.sleep(2)
  else:raise TimeoutError('Guest acceptance deadline reached')
 except Exception as error:report['error']=str(error);raise
 finally:
  report['elapsedSeconds']=round(time.monotonic()-started,1);(evidence/'summary.json').write_text(json.dumps(report,indent=2))
  if qmp:
   try:qmp.command('system_powerdown')
   except Exception:pass
  try:process.wait(timeout=45)
  except subprocess.TimeoutExpired:process.terminate();process.wait(timeout=15)
  tpm.terminate();tpm.wait(timeout=15);server.shutdown();log.close();tlog.close()

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--installer',type=Path,required=True);parser.add_argument('--work',type=Path,required=True);parser.add_argument('--target',choices=['windows10','windows11'],default='windows11');parser.add_argument('--timeout-minutes',type=int,default=90);run(parser.parse_args())
