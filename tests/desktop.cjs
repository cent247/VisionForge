const {_electron:electron}=require('/opt/codex/cua_node/lib/node_modules/playwright-core');
const {spawn}=require('node:child_process');
const fs=require('node:fs');const path=require('node:path');
(async()=>{const root=path.resolve('..');const display=200+Math.floor(Math.random()*2000);const log=fs.openSync('../test-tools/desktop-xorg.log','w');const x=spawn('/usr/lib/xorg/Xorg',[`:${display}`,'-config',root+'/test-tools/xorg.conf','-logfile',root+'/test-tools/desktop-xorg-server.log','-nolisten','unix','-nolisten','local','-listen','tcp','-ac'],{stdio:['ignore',log,log]});let app;
try{await new Promise(r=>setTimeout(r,1800));app=await electron.launch({executablePath:path.resolve('node_modules/electron/dist/electron'),args:['--no-sandbox','--disable-gpu',path.resolve('.')],env:{...process.env,DISPLAY:`127.0.0.1:${display}`},timeout:30000});const page=await app.firstWindow();await page.waitForSelector('.brand');console.log('Desktop UI loaded:',await page.title());console.log(await page.locator('.status').innerText());await page.screenshot({path:'evidence/desktop-internal.png'});}
finally{if(app)await app.close();x.kill();}})().catch(e=>{console.error(e);process.exitCode=1;});
