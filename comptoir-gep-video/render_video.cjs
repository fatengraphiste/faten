const { chromium } = require('playwright');
const fs=require('fs');
const [,, a, b, fps0]=process.argv; const fps=Number(fps0||30);
(async()=>{
  const br=await chromium.launch();
  const p=await br.newPage({viewport:{width:1080,height:1920}});
  p.on('pageerror',e=>console.log('PAGEERR',e.message));
  await p.goto('file://'+process.cwd()+'/video.html');
  await p.evaluate(()=>document.fonts.ready);
  await p.evaluate(async()=>{const urls=[];for(let i=1;i<=89;i++)urls.push('hook/h'+String(i).padStart(3,'0')+'.jpg');urls.push('assets/bg-blue-rays.webp');await Promise.all(urls.map(u=>new Promise(r=>{const im=new Image();im.onload=im.onerror=r;im.src=u;})));});
  for(let i=Number(a);i<Number(b);i++){
    await p.evaluate(t=>render(t),i/fps);
    await p.screenshot({path:`frames/f${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:94});
  }
  await br.close();console.log('done',a,b);
})();
