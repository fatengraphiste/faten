const { chromium } = require('playwright');
(async()=>{
  const times=process.argv.slice(2).map(Number);
  const br=await chromium.launch();const p=await br.newPage({viewport:{width:1080,height:1920}});
  p.on('pageerror',e=>console.log('PAGEERR',e.message));
  await p.goto('file://'+process.cwd()+'/video.html');await p.evaluate(()=>document.fonts.ready);
  await p.evaluate(async()=>{const urls=[];for(let i=1;i<=89;i++)urls.push('hook/h'+String(i).padStart(3,'0')+'.jpg');urls.push('assets/bg-blue-rays.webp');await Promise.all(urls.map(u=>new Promise(r=>{const im=new Image();im.onload=im.onerror=r;im.src=u;})));});
  for(const t of times){await p.evaluate(t=>render(t),t);await p.screenshot({path:`/tmp/probe_${t.toFixed(2)}.jpg`,type:'jpeg',quality:85});}
  await br.close();
})();
