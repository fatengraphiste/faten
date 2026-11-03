const { chromium } = require('playwright');
const { mkdirSync, rmSync } = require('fs');
const { execSync } = require('child_process');
const dur = Number(process.argv[2]||5), fps=30;
const out = `/tmp/gepv_${dur}`;
rmSync(out,{recursive:true,force:true}); mkdirSync(out,{recursive:true});
(async()=>{
const b = await chromium.launch();
const p = await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+process.cwd()+'/outro-9x16.html');
await p.evaluate(d=>{window.DUR=d},dur);
const n=dur*fps;
for(let i=0;i<n;i++){
  await p.evaluate(t=>render(t),i/fps);
  await p.screenshot({path:`${out}/f${String(i).padStart(4,'0')}.png`});
}
await b.close();
execSync(`ffmpeg -y -loglevel error -framerate ${fps} -i ${out}/f%04d.png -c:v libx264 -pix_fmt yuv420p -crf 14 -movflags +faststart comptoir-gep-outro-9x16-${dur}s.mp4`);
console.log('done',dur);
})();
