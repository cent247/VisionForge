const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {launchDesktop}=require('./helpers/desktop-harness.cjs');
(async()=>{const root=await fs.mkdtemp(path.join(os.tmpdir(),'vf-security-')),outside=await fs.mkdtemp(path.join(os.tmpdir(),'vf-security-outside-'));const desktop=await launchDesktop();const {app,page}=desktop;const results=[];
try{
 await page.waitForSelector('.brand');
 // Production renderer must block injected scripts and outgoing fetches.
 assert.equal(await page.evaluate(()=>{const el=document.createElement('script');el.textContent='window.__injected=true';document.head.append(el);return window.__injected===true;}),false);
 assert.equal(await page.evaluate(async()=>{try{await fetch('http://127.0.0.1:1/');return false;}catch{return true;}}),true);results.push('production CSP blocks injected inline script and direct renderer requests');
 await app.evaluate(({dialog},f)=>{dialog.showSaveDialog=async()=>({canceled:false,filePath:f});},path.join(root,'Security.vforge'));
 await page.getByRole('button',{name:'New',exact:true}).click();await page.getByRole('heading',{name:'Security',exact:true}).waitFor();
 const project=path.join(root,'Security','project.vforge');
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=8;return c.toDataURL('image/png');});
 await assert.rejects(page.evaluate(({project})=>window.visionForge.createImage(project,'data:image/png;base64,bm90IGEgcG5n'),{project}),/Invalid PNG/);
 const imported=await page.evaluate(({project,png})=>window.visionForge.createImage(project,png),{project,png});assert.ok((await fs.stat(path.join(path.dirname(project),imported.relativePath))).isFile());results.push('valid PNG overlay accepted; non-PNG payload rejected');
 const media=path.join(path.dirname(project),'media');await fs.rename(media,media+'.original');await fs.symlink(outside,media,process.platform==='win32'?'junction':'dir');
 await assert.rejects(page.evaluate(({project,png})=>window.visionForge.createImage(project,png),{project,png}),/Media folder escapes/);assert.deepEqual(await fs.readdir(outside),[]);results.push('external media-directory junction cannot receive overlay writes');
 await fs.rm(media,{force:true});await fs.rename(media+'.original',media);
 await fs.writeFile('evidence/security-desktop.json',JSON.stringify({passed:true,results},null,2));
 console.log(results.join('\n'));
}finally{await desktop.close();await fs.rm(root,{recursive:true,force:true});await fs.rm(outside,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
