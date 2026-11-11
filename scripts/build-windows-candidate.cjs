/* Linux-only cross-packaging. This produces an internal candidate, not Windows acceptance. */
const fs=require('node:fs');const path=require('node:path');
const {build,Platform,Arch}=require('electron-builder');
const {WineVmManager}=require('app-builder-lib/out/vm/WineVm');
const {UninstallerReader}=require('app-builder-lib/out/targets/nsis/nsisUtil');
const output=path.resolve('candidate-release');
const original=WineVmManager.prototype.exec;
const evidence={method:'Linux cross-build; NSIS intermediate uninstaller extracted by upstream UninstallerReader instead of executed under Wine',windowsRuntimeTested:false,extractions:[]};
WineVmManager.prototype.exec=async function(file,args,options){
 const resolved=path.resolve(file);
 if(process.platform!=='linux'||!resolved.startsWith(output+path.sep)||!resolved.endsWith('.exe')||args.length!==0)throw new Error('Unexpected Windows execution requested; cross-build refused: '+path.basename(file));
 const uninstaller=path.join(path.dirname(file),path.basename(file,'exe')+'__uninstaller.exe');
 await UninstallerReader.exec(file,uninstaller);
 const content=fs.readFileSync(uninstaller);if(content.readUInt16LE(0)!==0x5a4d)throw new Error('Extracted uninstaller is not a PE executable');
 evidence.extractions.push({installer:path.basename(file),uninstaller:path.basename(uninstaller),bytes:content.length,method:'static extraction; not executed'});
 fs.writeFileSync('evidence/alternative-testing/packaging.json',JSON.stringify(evidence,null,2));
};
(async()=>{try{const files=await build({targets:Platform.WINDOWS.createTarget(['nsis','portable'],Arch.x64),publish:'never',config:{directories:{output},win:{signExecutable:false},nsis:{artifactName:'VisionForge-INTERNAL-CANDIDATE-Setup-${version}-${arch}.${ext}'},portable:{artifactName:'VisionForge-INTERNAL-CANDIDATE-Portable-${version}-${arch}.${ext}'}}});evidence.buildPassed=true;evidence.files=files;console.log(JSON.stringify(evidence,null,2));}catch(error){evidence.buildPassed=false;evidence.failure=String(error);throw error;}finally{WineVmManager.prototype.exec=original;fs.writeFileSync('evidence/alternative-testing/packaging.json',JSON.stringify(evidence,null,2));}})().catch(error=>{console.error(error);process.exitCode=1;});
