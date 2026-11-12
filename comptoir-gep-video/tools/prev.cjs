const { chromium } = require('playwright');const fs=require('fs');
(async()=>{const br=await chromium.launch();
for(const f of fs.readdirSync('svg').filter(x=>x.endsWith('.svg'))){
  const m=fs.readFileSync('svg/'+f,'utf8').match(/viewBox="0 0 (\d+) (\d+)"/);const w=+m[1],h=+m[2];
  const p=await br.newPage({viewport:{width:w,height:h}});await p.goto('file://'+process.cwd()+'/svg/'+f);await p.waitForTimeout(300);
  await p.screenshot({path:'/tmp/'+f.replace('.svg','.png')});await p.close();}
await br.close();console.log('ok');})();
