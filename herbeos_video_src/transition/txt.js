const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+path.resolve('txt.html'));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
await p.evaluate(()=>{document.getElementById('b').style.visibility='hidden'});await p.screenshot({path:'txt_a.png',omitBackground:true});
await p.evaluate(()=>{document.getElementById('b').style.visibility='visible';document.getElementById('a').style.visibility='hidden'});await p.screenshot({path:'txt_b.png',omitBackground:true});
await b.close()})();
