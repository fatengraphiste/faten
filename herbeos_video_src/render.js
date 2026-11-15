const {chromium}=require('playwright');const path=require('path');
(async()=>{
 const mode=process.argv[2];const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
 await pg.goto('file://'+path.resolve('index.html'));await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(800);
 const fs=require('fs');
 if(mode==='preview'){const ts=process.argv.slice(3).map(Number);for(const t of ts){await pg.evaluate(t=>render(t),t);await pg.screenshot({path:`pv_${t}.jpg`,type:'jpeg',quality:80});}}
 else{fs.mkdirSync('frames',{recursive:true});for(let i=0;i<450;i++){await pg.evaluate(t=>render(t),i/30);await pg.screenshot({path:`frames/f${String(i).padStart(4,'0')}.jpg`,type:'jpeg',quality:93});}}
 await b.close();})();
