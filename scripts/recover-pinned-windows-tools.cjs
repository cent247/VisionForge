// Recover the exact media tools from our retained, hash-pinned installer.
// This avoids depending on a supplier's mutable latest-release download.
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFile}=require('node:child_process'),{promisify}=require('node:util');
const run=promisify(execFile),sha=data=>crypto.createHash('sha256').update(data).digest('hex');
(async()=>{
 const installer=path.resolve(process.argv[2]),stage=path.resolve(process.argv[3]??'tool-stage'),verified=path.join(stage,'verified'),unpacked=path.join(stage,'recorded-payload');
 assert.equal(sha(await fs.readFile(installer)),'cbf3eecda878bfa68a425fdb7d637ff6d2248ba337cd06e848a7aaf50fdb87f7','Recorded installer hash mismatch');
 const seven=await require('app-builder-lib/out/toolsets/7zip').getPath7za();
 await fs.mkdir(stage,{recursive:true});await fs.mkdir(verified,{recursive:true});
 try{
  await run(seven,['e','-y','-o'+stage,installer,'$PLUGINSDIR/app-64.7z'],{maxBuffer:4000000});
  await run(seven,['x','-y','-o'+unpacked,path.join(stage,'app-64.7z')],{maxBuffer:4000000});
  const original=path.join(unpacked,'resources/tools/win-x64');
  const manifest=JSON.parse(await fs.readFile('resources/tools/win-x64/MANIFEST.json','utf8'));
  for(const entry of manifest.files){const data=await fs.readFile(path.join(original,entry.file));assert.equal(data.length,entry.bytes);assert.equal(sha(data),entry.sha256);await fs.writeFile(path.join(verified,entry.file),data);}
  const license=await fs.readFile(path.join(original,'LICENSE.txt')),expected=await fs.readFile('resources/tools/win-x64/LICENSE.txt');assert.deepEqual(license,expected);await fs.writeFile(path.join(verified,'LICENSE.txt'),license);
  await fs.writeFile(path.join(verified,'MANIFEST.json'),JSON.stringify(manifest,null,2));
  console.log(JSON.stringify({source:'Retained installer 0.1.0',installerSha256:'cbf3eecda878bfa68a425fdb7d637ff6d2248ba337cd06e848a7aaf50fdb87f7',executablesVerified:manifest.files.length}));
 }finally{await fs.rm(unpacked,{recursive:true,force:true});await fs.rm(path.join(stage,'app-64.7z'),{force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
