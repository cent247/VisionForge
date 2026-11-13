// Real Electron checks: native project dialogs have an owner, and a missing
// desktop bridge cannot masquerade as an operational editor.
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {launchDesktop}=require('./helpers/desktop-harness.cjs');
(async()=>{
 const desktop=await launchDesktop(),temp=await fs.mkdtemp(path.join(os.tmpdir(),'vf-startup-'));
 try{
  const {app,page}=desktop;await page.waitForSelector('.brand');
  const navigation=page.getByRole('navigation',{name:'Workspace'});
  await navigation.getByRole('button',{name:'Storyboard',exact:true}).click();
  assert.equal(await page.locator('#storyboard').evaluate(el=>el.open),true);
  await navigation.getByRole('button',{name:'Caption editor',exact:true}).click();
  assert.equal(await page.locator('#captions').evaluate(el=>el.open),true);
  await navigation.getByRole('button',{name:'Audio tracks',exact:true}).click();
  assert.match(await page.locator('.status').innerText(),/Create or open a project to add audio tracks/);
  await navigation.getByRole('button',{name:'Clip effects',exact:true}).click();
  assert.match(await page.locator('.status').innerText(),/Select a timeline clip/);
  await navigation.getByRole('button',{name:'Project settings',exact:true}).click();
  assert.match(await page.locator('.status').innerText(),/Create or open a project to change/);
  await navigation.getByRole('button',{name:'Editor',exact:true}).click();
  console.log('All six workspace navigation buttons respond and open sections or explain the required selection');
  await app.evaluate(({dialog,BrowserWindow})=>{
   global.__vfDialogOwners=[];
   dialog.showSaveDialog=async(owner)=>{global.__vfDialogOwners.push({type:'save',owned:owner instanceof BrowserWindow});return {canceled:true};};
   dialog.showOpenDialog=async(owner)=>{global.__vfDialogOwners.push({type:'open',owned:owner instanceof BrowserWindow});return {canceled:true,filePaths:[]};};
  });
  await page.getByRole('button',{name:'New',exact:true}).click();
  await page.getByRole('button',{name:'Open',exact:true}).click();
  const owners=await app.evaluate(()=>global.__vfDialogOwners);
  assert.deepEqual(owners,[{type:'save',owned:true},{type:'open',owned:true}]);
  console.log('New and Open reach native dialogs owned by the editor window');
  const windowEvent=app.waitForEvent('window').catch(()=>null);
  await app.evaluate(async({BrowserWindow,app})=>{const window=new BrowserWindow({show:false,webPreferences:{sandbox:true,contextIsolation:true,nodeIntegration:false}});await window.loadFile(app.getAppPath()+'/out/renderer/index.html');});
  const failed=await windowEvent;assert.ok(failed,'Missing-bridge window must open');
  await failed.getByRole('alert').waitFor();
  assert.match(await failed.getByRole('alert').innerText(),/could not start the editor/);
  assert.equal(await failed.getByRole('button',{name:'New',exact:true}).count(),0);
  console.log('Missing desktop bridge displays actionable startup failure instead of inert editing controls');
 }finally{await desktop.close();await fs.rm(temp,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
