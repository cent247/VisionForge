const {build,Platform,Arch}=require('electron-builder');
if(process.platform!=='win32')throw new Error('Native Windows build requires Windows');
build({targets:Platform.WINDOWS.createTarget(['nsis'],Arch.x64),publish:'never',config:{win:{signExecutable:false},artifactName:'VisionForge-INTERNAL-CANDIDATE-Setup-${version}-${arch}.${ext}'}}).catch(error=>{console.error(error);process.exitCode=1;});
