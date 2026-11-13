// Preserve installed runtime dependency license texts without rewriting them.
const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');const lock=JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'),'utf8'));
const output=path.join(root,'resources/legal');const check=process.argv.includes('--check');
const generated=new Map();const manifest=[];
for(const [directory,metadata] of Object.entries(lock.packages??{})){
 if(!directory||metadata.dev)continue;
 const pkgDir=path.join(root,directory);const pkg=JSON.parse(fs.readFileSync(path.join(pkgDir,'package.json'),'utf8'));
 const licenseFiles=fs.readdirSync(pkgDir).filter(name=>/^(license|licence|copying|notice)(\.|$)/i.test(name)&&fs.statSync(path.join(pkgDir,name)).isFile()).sort();
 if(!licenseFiles.length)throw new Error('No license text found for '+directory);
 const records=[];
 for(const name of licenseFiles){const data=fs.readFileSync(path.join(pkgDir,name));const relative=directory.replace(/^node_modules\//,'packages/')+'/'+name;generated.set(relative,data);records.push({file:relative,sha256:crypto.createHash('sha256').update(data).digest('hex')});}
 manifest.push({name:pkg.name,version:pkg.version,license:pkg.license??metadata.license??null,installedPath:directory,licenseFiles:records});
}
manifest.sort((a,b)=>a.installedPath.localeCompare(b.installedPath));
generated.set('runtime-dependencies.json',Buffer.from(JSON.stringify(manifest,null,2)+'\n'));
generated.set('README.txt',Buffer.from('VisionForge runtime dependency notices\n\nLicense texts are copied verbatim from installed package versions recorded in runtime-dependencies.json. This conservative set includes non-development lockfile dependencies even when a package is not retained by bundling. Electron and Chromium license notices are supplied beside the executable by electron-builder. DejaVu font notices are in resources/fonts. FFmpeg/FFprobe GPL text and release-blocking source status are in resources/tools/win-x64. This directory is not a complete GPL corresponding-source archive or a legal approval.\n'));
for(const [relative,data]of generated){const target=path.join(output,relative);if(check){if(!fs.existsSync(target)||!fs.readFileSync(target).equals(data))throw new Error('Missing or stale license artifact: '+relative);}else{fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data);}}
console.log(JSON.stringify({mode:check?'check':'write',packages:manifest.length,files:generated.size,status:'passed'}));
