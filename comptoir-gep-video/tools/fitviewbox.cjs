const { chromium } = require('playwright');const fs=require('fs');
(async()=>{const br=await chromium.launch();
for(const f of process.argv.slice(2)){
  const p=await br.newPage({viewport:{width:1600,height:1600}});
  const src=fs.readFileSync(f,'utf8').replace(/viewBox="[^"]*" width="\d+" height="\d+"/,'viewBox="-400 -400 2400 2400" width="1600" height="1600"');
  await p.setContent('<body style="margin:0">'+src+'</body>');
  const bb=await p.evaluate(()=>{const s=document.querySelector('svg');const r=[...s.children].filter(e=>e.tagName!=='defs'&&e.tagName!=='rect'&&e.getBBox);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const e of r){const b=e.getBBox();x0=Math.min(x0,b.x);y0=Math.min(y0,b.y);x1=Math.max(x1,b.x+b.width);y1=Math.max(y1,b.y+b.height);}return [x0,y0,x1,y1];});
  const m=24;const vx=Math.floor(bb[0]-m),vy=Math.floor(bb[1]-m),w=Math.ceil(bb[2]-bb[0]+2*m),h=Math.ceil(bb[3]-bb[1]+2*m);
  let out=fs.readFileSync(f,'utf8').replace(/viewBox="[^"]*" width="\d+" height="\d+"/,`viewBox="${vx} ${vy} ${w} ${h}" width="${w}" height="${h}"`).replace(/<rect id="bg"[^>]*\/>\n?/,'');
  fs.writeFileSync(f,out);console.log(f,vx,vy,w,h);await p.close();}
await br.close();})();
