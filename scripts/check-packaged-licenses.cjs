const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(process.argv[2]??'resources/legal');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'runtime-dependencies.json'),'utf8'));let checked=0;
for(const item of manifest)for(const file of item.licenseFiles){const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file.file))).digest('hex');if(actual!==file.sha256)throw new Error('License mismatch: '+file.file);checked++;}
if(!checked)throw new Error('Empty runtime license manifest');console.log(checked+' packaged license texts verified');
