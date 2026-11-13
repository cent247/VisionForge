// State persistence through real workspace navigation in the installed editor.
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {launchDesktop}=require('../tests/helpers/desktop-harness.cjs');
(async()=>{
 const desktop=await launchDesktop(),temp=await fs.mkdtemp(path.join(os.tmpdir(),'vf-navigation-'));
 try{
  const {app,page}=desktop;await page.waitForSelector('.brand');
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(1366,768));
  const navigation=page.getByRole('navigation',{name:'Workspace'});
  const projectFolder=path.join(temp,'Navigation-project');
  await app.evaluate(({dialog},file)=>{dialog.showSaveDialog=async()=>({canceled:false,filePath:file});},projectFolder+'.vforge');
  await page.getByRole('button',{name:'New',exact:true}).click();
  await page.getByRole('heading',{name:'Navigation-project',exact:true}).waitFor();
  await navigation.getByRole('button',{name:'Project settings',exact:true}).click();
  assert.equal(await page.locator('#project-settings').evaluate(el=>el.open),true);
  await page.getByRole('spinbutton',{name:'Export width',exact:true}).fill('1920');
  await page.getByRole('button',{name:'Apply project settings',exact:true}).click();
  await page.getByRole('textbox',{name:'Text overlay',exact:true}).fill('Navigation check');
  await page.getByRole('button',{name:'Add text overlay',exact:true}).click();
  await page.locator('.clip.overlay').filter({hasText:'Navigation check'}).waitFor();
  await navigation.getByRole('button',{name:'Clip effects',exact:true}).click();
  await page.getByRole('spinbutton',{name:'transform brightness',exact:true}).fill('0.1');
  await navigation.getByRole('button',{name:'Audio tracks',exact:true}).click();
  await page.getByRole('button',{name:'+ Audio track',exact:true}).click();
  await navigation.getByRole('button',{name:'Caption editor',exact:true}).click();
  await page.getByRole('textbox',{name:'SRT captions',exact:true}).fill('1\n00:00:00,000 --> 00:00:01,000\nNavigation caption\n');
  await page.getByRole('button',{name:'Apply SRT captions',exact:true}).click();
  await page.getByRole('button',{name:'Save',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.status').textContent.includes('project saved'));
  const saved=JSON.parse(await fs.readFile(path.join(projectFolder,'project.vforge'),'utf8'));
  assert.equal(saved.settings.width,1920);
  assert.equal(saved.tracks.filter(t=>t.kind==='audio').length,2);
  assert.equal(saved.tracks.find(t=>t.kind==='overlay').clips[0].transform.brightness,0.1);
  assert.equal(saved.captions[0].text,'Navigation caption');
  console.log('Navigation reaches working project settings, clip effects, audio-track creation and captions; edits persist');

 }finally{await desktop.close();await fs.rm(temp,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
