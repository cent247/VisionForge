const fs=require('node:fs');const path=require('node:path');
const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));const inventory=[];
for(const [directory,metadata] of Object.entries(lock.packages??{})){
 if(!directory)continue;const manifest=path.join(directory,'package.json');let installed;
 try{installed=JSON.parse(fs.readFileSync(manifest,'utf8'));}catch{continue;}
 if(!installed.name||!installed.version)continue;
 inventory.push({name:installed.name,version:installed.version,license:installed.license??metadata.license??null,path:directory,development:metadata.dev??false,optional:metadata.optional??false});
}
inventory.sort((a,b)=>a.path.localeCompare(b.path));fs.writeFileSync('DEPENDENCIES.json',JSON.stringify(inventory,null,2)+'\n');console.log(inventory.length+' installed dependency manifests recorded');
