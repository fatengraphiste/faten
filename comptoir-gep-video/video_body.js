const NS='http://www.w3.org/2000/svg';
const $=id=>document.getElementById(id);
const svg=$('s');
const mk=(n,a,p)=>{const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);(p||svg).appendChild(e);return e;};
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const seg=(t,a,b)=>clamp((t-a)/(b-a));
const eo=x=>1-Math.pow(1-x,3);
const eio=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const eob=x=>{const c1=1.6,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2);};
const BLUE='#19226d',RED='#db4041',WHITE='#ffffff',PALE='#e9ecf8';
const DUR=67.9;
window.DUR=DUR;

/* ---------- word anchors ---------- */
const FLAT=[];CAPS.forEach(c=>c.words.forEach(w=>FLAT.push(w)));
const A=i=>FLAT[i].s;

/* ---------- logo ---------- */
function buildLogo(g,whiteMode){
  LOGO_PATHS.forEach(p=>{
    const col=p.c==='r'?RED:(whiteMode?WHITE:BLUE);
    if(p.rect)mk('rect',{x:p.rect[0],y:p.rect[1],width:p.rect[2],height:p.rect[3],fill:col},g);
    else mk('path',{d:p.d,fill:col},g);
  });
  g.setAttribute('transform','translate(390,282) scale(0.3)');
}
buildLogo($('logoB'),false);buildLogo($('logoW'),true);

/* ---------- item system ---------- */
const ITEMS=[];
function item(t0,t1,o={}){
  const it={g:mk('g',{display:'none'}),t0,t1,enter:o.enter||'up',inD:o.inD||0.45,outD:o.outD||0.3,ox:o.ox||540,oy:o.oy||700,draws:[],pops:[],wipes:[],upd:null};
  ITEMS.push(it);return it;
}
const R=(it,tag,attrs)=>mk(tag,attrs,it.g);
function path(it,d,attrs,t0,dur){
  const e=R(it,'path',Object.assign({d,fill:'none',pathLength:1,'stroke-dasharray':'1 1.02','stroke-dashoffset':1,'stroke-linecap':'round','stroke-linejoin':'round'},attrs));
  it.draws.push({e,t0,dur});return e;
}
function dash(it,d,attrs,t0){const e=R(it,'path',Object.assign({d,fill:'none','stroke-dasharray':'16 12','stroke-linecap':'round'},attrs));pop(it,e,t0,0.5);return e;}
function pop(it,e,t0,dur=0.45){
  const tr0=e.getAttribute('transform');
  if(tr0){const w=mk('g',{transform:tr0},e.parentNode);e.parentNode.insertBefore(w,e);e.removeAttribute('transform');w.appendChild(e);}
  e.style.transformBox='fill-box';e.style.transformOrigin='center';e.setAttribute('opacity',0);it.pops.push({e,t0,dur});}
function text(it,x,y,str,o={}){
  const e=R(it,'text',{x,y,'font-size':o.size||40,'font-weight':o.w||800,fill:o.fill||BLUE,'text-anchor':o.anchor||'middle','dominant-baseline':'central','letter-spacing':o.ls||0});
  e.textContent=str;if(o.t0!==undefined)pop(it,e,o.t0);return e;
}
function pill(it,cx,cy,w,h,str,o={}){
  const g=R(it,'g',{});
  mk('rect',{x:cx-w/2,y:cy-h/2,width:w,height:h,rx:h/2,fill:o.bg||RED,stroke:o.stroke||'none','stroke-width':o.sw||0},g);
  const t=mk('text',{x:cx+(o.dx||0),y:cy+2,'font-size':o.size||34,'font-weight':800,fill:o.fg||WHITE,'text-anchor':'middle','dominant-baseline':'central','letter-spacing':o.ls||1},g);t.textContent=str;
  if(o.check){const c=mk('path',{d:'M-14 0 L-4 11 L16 -12',fill:'none',stroke:WHITE,'stroke-width':7,'stroke-linecap':'round','stroke-linejoin':'round',transform:`translate(${cx-w/2+h/2+4},${cy})`},g);}
  if(o.t0!==undefined)pop(it,g,o.t0);
  return g;
}
function wipeImg(it,href,x,y,w,h,t0,dur,o={}){
  const id='cp'+Math.random().toString(36).slice(2,8);
  const cp=mk('clipPath',{id},it.g);
  const r=mk('rect',{x,y,width:0,height:h,rx:o.rx||0},cp);
  const im=R(it,'image',{x,y,width:w,height:h,href,preserveAspectRatio:o.par||'xMidYMid meet','clip-path':`url(#${id})`});
  it.wipes.push({r,x,w,t0,dur});return im;
}
function arrowDim(it,x1,x2,y,col,t0,dur,sw=6,tick=26){
  // double arrow with end ticks
  path(it,`M${x1} ${y} H${x2}`,{stroke:col,'stroke-width':sw},t0,dur);
  path(it,`M${x1+22} ${y-14} L${x1} ${y} L${x1+22} ${y+14}`,{stroke:col,'stroke-width':sw},t0+dur*0.7,dur*0.4);
  path(it,`M${x2-22} ${y-14} L${x2} ${y} L${x2-22} ${y+14}`,{stroke:col,'stroke-width':sw},t0+dur*0.7,dur*0.4);
  path(it,`M${x1} ${y-tick} V${y+tick}`,{stroke:col,'stroke-width':sw},t0,dur*0.3);
  path(it,`M${x2} ${y-tick} V${y+tick}`,{stroke:col,'stroke-width':sw},t0,dur*0.3);
}
function checkIcon(it,cx,cy,r,t0){
  const g=R(it,'g',{});
  mk('circle',{cx,cy,r,fill:RED},g);
  mk('path',{d:`M${cx-r*0.42} ${cy+r*0.02} L${cx-r*0.1} ${cy+r*0.36} L${cx+r*0.46} ${cy-r*0.34}`,fill:'none',stroke:WHITE,'stroke-width':r*0.26,'stroke-linecap':'round','stroke-linejoin':'round'},g);
  pop(it,g,t0);return g;
}

/* ================= SCENE B  (light, overlay on hook) ================= */
{
  const it=item(4.7,8.55,{enter:'fade'});
  pill(it,540,420,620,96,'ESPACE OUVERT',{bg:BLUE,size:44,t0:A(11)});
  const ell=path(it,'M445 1100 a90 52 0 1 0 180 0 a90 52 0 1 0 -180 0',{stroke:RED,'stroke-width':9,'stroke-dasharray':'0.06 0.04'},A(16)-0.05,0.8);
  ell.setAttribute('stroke-dasharray','1 1.02');
  pill(it,540,1010,380,88,'0 POTEAU',{bg:RED,size:40,t0:A(17)-0.1,check:true,dx:22});
}

/* ================= SCENE C/D  cards (blue) ================= */
{
  const it=item(8.95,16.05,{enter:'up'});
  text(it,540,405,'PLANCHER PRÉFABRIQUÉ',{size:42,fill:WHITE,ls:2});
  path(it,'M300 432 H780',{stroke:RED,'stroke-width':7},9.3,0.6);
  const cards=[[470,'photo_pout.jpg','POUTRELLES + ENTREVOUS'],[880,'photo_da.jpg','DALLE ALVÉOLÉE']];
  cards.forEach(([y,img,lab],i)=>{
    const g=R(it,'g',{});
    mk('rect',{x:90,y,width:900,height:380,rx:40,fill:WHITE},g);
    const cp=mk('clipPath',{id:'cc'+i},g);mk('rect',{x:104,y:y+14,width:872,height:290,rx:30},cp);
    mk('image',{x:104,y:y+14,width:872,height:290,href:'assets/'+img,preserveAspectRatio:'xMidYMid slice','clip-path':`url(#cc${i})`},g);
    const t=mk('text',{x:540,y:y+343,'font-size':36,'font-weight':800,fill:BLUE,'text-anchor':'middle','dominant-baseline':'central','letter-spacing':1.5},g);t.textContent=lab;
    pop(it,g,9.15+i*0.3,0.5);
    // highlight border
    const hl=path(it,`M${90+40} ${y} H${990-40} a40 40 0 0 1 40 40 V${y+380-40} a40 40 0 0 1 -40 40 H${90+40} a40 40 0 0 1 -40 -40 V${y+40} a40 40 0 0 1 40 -40 Z`,{stroke:RED,'stroke-width':10},i===0?A(29):A(33),0.5);
  });
  // question bubble
  const q=R(it,'g',{});
  mk('circle',{cx:900,cy:860,r:72,fill:RED,stroke:WHITE,'stroke-width':8},q);
  const qt=mk('text',{x:900,y:868,'font-size':104,'font-weight':900,fill:WHITE,'text-anchor':'middle','dominant-baseline':'central'},q);qt.textContent='?';
  pop(it,q,A(27)-0.1,0.5);
  // hide bubble later
  it.upd=(t)=>{ q.setAttribute('display',t>A(29)+0.3?'none':'inline'); };
}

/* ================= WHITE SHEET (E..H) ================= */
const SH=item(16.0,63.15,{enter:'up',inD:0.5});
R(SH,'rect',{x:80,y:390,width:920,height:920,rx:44,fill:WHITE});

/* ---- E1 poutrelles + entrevous ---- */
{
  const it=item(16.25,20.95,{enter:'fade'});
  text(it,540,462,'POUTRELLES + ENTREVOUS',{size:42,ls:1.5});
  path(it,'M300 492 H780',{stroke:RED,'stroke-width':7},16.5,0.5);
  wipeImg(it,'assets/k_poutrelle.png',100,540,520,185,A(36),0.7);
  wipeImg(it,'assets/k_entrevous3d.png',650,530,300,193,A(39),0.7);
  wipeImg(it,'assets/k_application.png',100,800,880,131,17.9,0.9);
  text(it,540,975,'Coupe du plancher poutrelles-entrevous',{size:26,w:500,fill:'#5b648f'});
  const h=pill(it,300,1075,420,96,'HABITATIONS',{bg:BLUE,size:30,t0:A(43),dx:28});
  const hi=R(it,'path',{d:'M-24 14 V-8 L0 -30 L24 -8 V14 Z M-7 14 V0 H7 V14',fill:'none',stroke:WHITE,'stroke-width':4,'stroke-linejoin':'round',transform:'translate(114,1075)'});pop(it,hi,A(43));
  const p2=pill(it,760,1075,420,96,'PLANS COMPLEXES',{bg:BLUE,size:28,t0:A(46),dx:28});
  const pi=R(it,'path',{d:'M-26 -24 H26 V4 H4 V26 H-26 Z M-10 -24 V26 M4 4 H-10',fill:'none',stroke:WHITE,'stroke-width':4,'stroke-linejoin':'round',transform:'translate(574,1075)'});pop(it,pi,A(46));
  pill(it,540,1205,660,84,'JUSQU\'À 9 M DE PORTÉE',{bg:RED,size:32,t0:19.85});
}
/* ---- E2 manual, no crane ---- */
{
  const it=item(20.95,22.95,{enter:'fade'});
  text(it,540,462,'MONTAGE MANUEL',{size:42,ls:1.5});
  path(it,'M300 492 H780',{stroke:RED,'stroke-width':7},21.1,0.4);
  // crane icon
  const cg=R(it,'g',{transform:'translate(540,640)'});
  mk('path',{d:'M-50 70 V-70 M-80 -70 H80 M46 -70 V-20 M46 -20 l-9 16 h18 z M-50 -70 L-80 -40 M-50 -70 L-20 -70',fill:'none',stroke:BLUE,'stroke-width':8,'stroke-linecap':'round','stroke-linejoin':'round'},cg);
  mk('path',{d:'M-70 70 H-30',fill:'none',stroke:BLUE,'stroke-width':10,'stroke-linecap':'round'},cg);
  pop(it,cg,21.05);
  const cr=mk('circle',{cx:540,cy:640,r:110,fill:'none',stroke:RED,'stroke-width':14,pathLength:1,'stroke-dasharray':'1 1.02','stroke-dashoffset':1},it.g);it.draws.push({e:cr,t0:A(51)-0.05,dur:0.4});
  const sl=mk('path',{d:'M462 718 L618 562',fill:'none',stroke:RED,'stroke-width':14,'stroke-linecap':'round',pathLength:1,'stroke-dasharray':'1 1.02','stroke-dashoffset':1},it.g);it.draws.push({e:sl,t0:A(51)+0.25,dur:0.3});
  pill(it,540,820,360,84,'SANS GRUE',{bg:RED,size:36,t0:A(52)-0.1});
  wipeImg(it,'assets/k_steps_pout.png',110,880,860,372,21.3,1.2);
}
/* ---- E3 portee 9 m  (+ >9 m ?) ---- */
function elevation(it,xL,xR,t0,slabCol,dy=0){
  const wl=R(it,'rect',{x:xL-90,y:740+dy,width:90,height:250,fill:BLUE});
  const wr=R(it,'rect',{x:xR,y:740+dy,width:90,height:250,fill:BLUE});
  pop(it,wl,t0);pop(it,wr,t0+0.1);
  const sl=R(it,'rect',{x:xL,y:712+dy,width:xR-xL,height:46,fill:slabCol||PALE,stroke:BLUE,'stroke-width':5});
  pop(it,sl,t0+0.2);
  // beam ticks
  let d='';for(let x=xL+24;x<xR-10;x+=34)d+=`M${x} ${716+dy} V${754+dy} `;
  path(it,d,{stroke:BLUE,'stroke-width':2.5,opacity:.55},t0+0.3,0.7);
}
{
  const it=item(22.95,27.35,{enter:'fade'});
  text(it,540,462,'PORTÉE MAXIMALE',{size:42,ls:1.5});
  path(it,'M300 492 H780',{stroke:RED,'stroke-width':7},23.1,0.4);
  elevation(it,240,840,23.1,null,50);
  arrowDim(it,240,840,910,RED,A(53),1.0);
  const nine=text(it,540,1075,'9 m',{size:150,w:900,fill:RED,t0:A(57)});
  const nt=text(it,540,1190,'POUTRELLES + ENTREVOUS',{size:30,w:700,fill:BLUE,ls:1.5,t0:A(59)});
  it.upd=t=>{const f=t>A(60)?1:0;nine.setAttribute('display',f?'none':'inline');nt.setAttribute('display',f?'none':'inline');};
  const big=text(it,540,1075,'> 9 m ?',{size:150,w:900,fill:RED,t0:A(61)});
  big.setAttribute('display','inline');
  dash(it,'M840 910 H1000',{stroke:RED,'stroke-width':6},A(63));
  const old=it.upd;it.upd=t=>{old(t);big.style.display=t<A(60)?'none':'';};
}
/* ---- F2a  dalle alveolee reveal ---- */
{
  const it=item(27.4,29.25,{enter:'fade'});
  const cp=mk('clipPath',{id:'cph'},it.g);mk('rect',{x:110,y:420,width:860,height:310,rx:30},cp);
  R(it,'image',{x:110,y:420,width:860,height:310,href:'assets/photo_da.jpg',preserveAspectRatio:'xMidYMid slice','clip-path':'url(#cph)'});
  pill(it,330,700,420,76,'DALLE ALVÉOLÉE',{bg:RED,size:30,t0:A(68)-0.1});
  const X0=120,W0=840,Y0=840,H0=W0*145/941;
  wipeImg(it,'assets/k_da16.png',X0,Y0,W0,H0,27.7,0.8);
  const holes=[102,208,314,421,527,634,740].map(v=>v/941);
  holes.forEach((f,i)=>{
    const g=R(it,'g',{});
    mk('circle',{cx:X0+f*W0,cy:Y0+H0*0.46,r:25,fill:RED},g);
    const t=mk('text',{x:X0+f*W0,y:Y0+H0*0.46+2,'font-size':28,'font-weight':900,fill:WHITE,'text-anchor':'middle','dominant-baseline':'central'},g);t.textContent=i+1;
    pop(it,g,28.35+i*0.11,0.35);
  });
  pill(it,540,1090,440,92,'7 ALVÉOLES',{bg:BLUE,size:40,t0:29.0-0.1});
  text(it,540,1200,'Section DA16 · largeur 1,20 m',{size:28,w:500,fill:'#5b648f'});
}
/* ---- F2b 15 m ---- */
{
  const it=item(29.25,32.15,{enter:'fade'});
  text(it,540,462,'GRANDE PORTÉE',{size:42,ls:1.5});
  path(it,'M300 492 H780',{stroke:RED,'stroke-width':7},29.4,0.4);
  elevation(it,190,890,29.4,'#d6dcf2',50);
  arrowDim(it,190,890,910,RED,A(70)+0.1,1.0);
  text(it,540,1075,'15 m',{size:150,w:900,fill:RED,t0:A(73)});
  pill(it,540,1200,600,92,'0 POTEAU INTERMÉDIAIRE',{bg:BLUE,size:30,t0:A(75),check:true,dx:26});
}
/* ---- F3 crane ---- */
{
  const it=item(32.15,33.3,{enter:'fade'});
  text(it,540,462,'POSE À LA GRUE',{size:42,ls:1.5});
  path(it,'M300 492 H780',{stroke:RED,'stroke-width':7},32.3,0.4);
  const im=wipeImg(it,'assets/k_crane.png',260,540,560,465,32.3,0.6);
  pill(it,540,1130,560,92,'PLANCHER POSÉ D\'UN COUP',{bg:RED,size:30,t0:A(79)});
  it.upd=t=>{im.setAttribute('transform',`translate(0,${-14*Math.sin((t-32.3)*5)})`);};
}
/* ---- F4 sans etais ---- */
{
  const it=item(33.3,36.85,{enter:'fade'});
  text(it,540,462,'SOUS-FACE LIBRE',{size:42,ls:1.5});
  path(it,'M300 492 H780',{stroke:RED,'stroke-width':7},33.45,0.4);
  elevation(it,240,840,33.45,null,50);
  const props=R(it,'g',{});
  let d='';[300,420,540,660,780].forEach(x=>{d+=`M${x} 810 V1035 M${x-22} 1035 H${x+22} `;});
  const pp=mk('path',{d,fill:'none',stroke:BLUE,'stroke-width':6,'stroke-linecap':'round',pathLength:1,'stroke-dasharray':'1 1.02','stroke-dashoffset':1},props);it.draws.push({e:pp,t0:A(82)-0.4,dur:0.6});
  const x1=mk('path',{d:'M250 820 L830 1035 M830 820 L250 1035',fill:'none',stroke:RED,'stroke-width':16,'stroke-linecap':'round',pathLength:1,'stroke-dasharray':'1 1.02','stroke-dashoffset':1},it.g);it.draws.push({e:x1,t0:A(84),dur:0.5});
  pill(it,300,1160,300,84,'SANS ÉTAIS',{bg:RED,size:32,t0:A(84)+0.1});
  pill(it,720,1160,420,84,'TRAVAUX IMMÉDIATS',{bg:BLUE,size:30,t0:A(86),check:true,dx:22});
  it.upd=t=>{props.setAttribute('opacity',t>A(85)+0.5?Math.max(0.15,1-(t-A(85)-0.5)*2):1);};
}

/* ---- Cases ---- */
function caseChip(it,txt,t0){pill(it,540,462,780,84,txt,{bg:BLUE,size:30,t0,ls:1.5});}
/* G1: 14 m hall */
{
  const it=item(36.9,45.45,{enter:'fade'});
  caseChip(it,'CAS 1 · SALLE OUVERTE DE 14 M',A(90));
  const x0=150,x1=930,y0=620,y1=970;
  R(it,'rect',{x:x0,y:y0,width:x1-x0,height:y1-y0,fill:'#f0f2fb'});
  path(it,`M${x0} ${y0} H${x1} V${y1} H${x0} Z`,{stroke:BLUE,'stroke-width':14,'stroke-linejoin':'miter'},37.6,1.0);
  arrowDim(it,x0,x1,560,RED,A(93)+0.2,1.0);
  text(it,540,830,'14 m',{size:130,w:900,fill:RED,t0:A(96)-0.05});
  const nine=(x1-x0)*9/14;
  dash(it,`M${x0+8} 730 H${x0+nine}`,{stroke:BLUE,'stroke-width':8},A(104)-0.1);
  text(it,x0+nine/2,700,'9 m max.',{size:30,w:700,fill:BLUE,t0:A(104)});
  pill(it,540,1100,720,104,'DALLE ALVÉOLÉE',{bg:RED,size:46,t0:A(100)-0.05,check:true,dx:34});
  text(it,540,1210,'14 m  >  9 m',{size:54,w:800,fill:BLUE,t0:A(105)});
}
/* G2: complex plan */
{
  const it=item(45.45,51.25,{enter:'fade'});
  caseChip(it,'CAS 2 · PLAN AVEC PETITES PIÈCES',A(108));
  path(it,'M170 600 H920 V810 H700 V1010 H170 Z',{stroke:BLUE,'stroke-width':14,'stroke-linejoin':'miter'},A(109),1.2);
  path(it,'M330 600 V1010 M490 600 V810 M170 800 H490 M700 810 H490 M330 800 V1010',{stroke:BLUE,'stroke-width':8},A(111),1.1);
  path(it,'M610 560 V740 M760 740 V560',{stroke:BLUE,'stroke-width':8,opacity:0},0,1);
  pill(it,540,1100,820,104,'POUTRELLES + ENTREVOUS',{bg:RED,size:36,t0:A(114)-0.05,check:true,dx:34});
  pill(it,320,1215,420,84,'S\'ADAPTE AU PLAN',{bg:BLUE,size:28,t0:A(115)});
  pill(it,760,1215,420,84,'PLUS ÉCONOMIQUE',{bg:BLUE,size:28,t0:A(119)});
}
/* G3: 11 m */
{
  const it=item(51.25,59.35,{enter:'fade'});
  caseChip(it,'CAS 3 · PORTÉE DE 11 M',A(121));
  const x0=205,x1=875,y0=620,y1=870;
  R(it,'rect',{x:x0,y:y0,width:x1-x0,height:y1-y0,fill:'#f0f2fb'});
  path(it,`M${x0} ${y0} H${x1} V${y1} H${x0} Z`,{stroke:BLUE,'stroke-width':14,'stroke-linejoin':'miter'},A(122),0.9);
  arrowDim(it,x0,x1,565,RED,A(123),0.9);
  text(it,540,745,'11 m',{size:110,w:900,fill:RED,t0:A(124)});
  text(it,540,940,'Travailler dessous dès le 1er jour ?',{size:32,w:600,fill:'#5b648f',t0:A(126)});
  pill(it,540,1030,720,104,'DALLE ALVÉOLÉE',{bg:RED,size:46,t0:A(130)-0.05,check:true,dx:34});
  pill(it,250,1170,300,80,'SANS ÉTAIS',{bg:BLUE,size:28,t0:A(132)});
  pill(it,560,1170,300,80,'POSE À LA GRUE',{bg:BLUE,size:26,t0:A(134)});
  pill(it,850,1170,260,80,'DESSOUS LIBRE',{bg:BLUE,size:24,t0:A(138)});
}
/* H: the rule */
{
  const it=item(59.35,63.15,{enter:'fade'});
  text(it,540,462,'LA RÈGLE DU CHOIX',{size:42,ls:1.5,t0:A(141)});
  path(it,'M300 492 H780',{stroke:RED,'stroke-width':7},A(141)+0.2,0.4);
  const x0=130,x15=950,ppm=(x15-x0)/15,x9=x0+9*ppm,yb=850,hb=110;
  const s1=R(it,'rect',{x:x0,y:yb,width:x9-x0,height:hb,fill:BLUE});
  const s2=R(it,'rect',{x:x9,y:yb,width:x15-x9,height:hb,fill:RED});
  pop(it,s1,A(142));pop(it,s2,A(142)+0.15);
  text(it,(x0+x9)/2,yb+hb/2+2,'POUTRELLES + ENTREVOUS',{size:25,fill:WHITE,ls:1,t0:A(142)+0.3});
  text(it,(x9+x15)/2,yb+hb/2+2,'DALLE ALVÉOLÉE',{size:25,fill:WHITE,ls:1,t0:A(142)+0.4});
  [[0,'0 m'],[9,'9 m'],[15,'15 m']].forEach(([m,l])=>text(it,x0+m*ppm,yb+hb+50,l,{size:34,fill:BLUE,t0:A(143)}));
  const mg=R(it,'g',{});
  mk('path',{d:'M-34 -20 H34 L0 26 Z',fill:RED,stroke:WHITE,'stroke-width':5,'stroke-linejoin':'round'},mg);
  const mt=mk('text',{x:0,y:-62,'font-size':32,'font-weight':800,fill:BLUE,'text-anchor':'middle','dominant-baseline':'central','letter-spacing':1.5},mg);mt.textContent='VOTRE PORTÉE';
  it.upd=t=>{const p=eio(seg(t,A(143),A(148)));const m=4+p*8.5;mg.setAttribute('transform',`translate(${x0+m*ppm},${yb-26})`);mg.setAttribute('opacity',seg(t,A(143),A(143)+0.3));};
  pill(it,540,1190,700,92,'CHOISISSEZ SELON VOTRE PORTÉE',{bg:BLUE,size:28,t0:A(148)});
}

/* ================= I: CTA (blue, no sheet) ================= */
{
  const it=item(63.3,67.95,{enter:'fade'});
  const plane=R(it,'g',{transform:'translate(540,640)'});
  mk('path',{d:'M-130 10 L140 -90 L60 110 L10 30 Z M10 30 L140 -90',fill:'none',stroke:WHITE,'stroke-width':12,'stroke-linejoin':'round','stroke-linecap':'round',pathLength:1,'stroke-dasharray':'1 1.02'},plane);
  const pp=plane.firstChild;it.draws.push({e:pp,t0:63.4,dur:0.9});
  path(it,'M-260 120 C-200 60 -170 140 -110 80',{stroke:RED,'stroke-width':10},64.0,0.7).setAttribute('transform','translate(540,640)');
  text(it,540,880,'ENVOYEZ VOTRE PLAN',{size:76,w:900,fill:WHITE,ls:1,t0:A(154)});
  path(it,'M240 935 H840',{stroke:RED,'stroke-width':10},A(154)+0.3,0.5);
  text(it,540,1020,'L\'équipe Comptoir GEP vous accompagne',{size:36,w:600,fill:WHITE,t0:A(157)});
  it.upd=t=>{plane.setAttribute('transform',`translate(540,${640-10*Math.sin(t*3)})`);};
}

/* ================= captions ================= */
const PAGES=[];
CAPS.forEach(c=>{
  const ws=c.words;const n=ws.length;
  if(n<=8){PAGES.push(ws);return;}
  const parts=Math.ceil(n/7),per=Math.ceil(n/parts);
  for(let i=0;i<n;i+=per)PAGES.push(ws.slice(i,i+per));
});
const isLat=w=>/[A-Za-z]/.test(w);
const chip=$('chip');let curPage=-1;
function buildPage(i){
  const ws=PAGES[i];let html='';let j=0;
  while(j<ws.length){
    if(isLat(ws[j].w)){
      let k=j;let inner='';
      let trail='';
      while(k<ws.length&&isLat(ws[k].w)){
        let txt=ws[k].w;
        const m=txt.match(/[،؟]+$/);
        if(m){trail=m[0];txt=txt.slice(0,-m[0].length);}
        inner+=`<span class="w" data-i="${k}">${txt}</span> `;k++;}
      html+=`<span class="ltr">${inner.trim()}</span>${trail?'<span class="p">'+trail+'</span>':''} `;j=k;
    }else{html+=`<span class="w" data-i="${j}">${ws[j].w}</span> `;j++;}
  }
  chip.innerHTML=html;curPage=i;
}
function updCaps(t){
  let idx=-1;
  for(let i=0;i<PAGES.length;i++){
    const a=PAGES[i][0].s-0.07,b=PAGES[i][PAGES[i].length-1].e+0.3;
    if(t>=a&&t<=b)idx=i;
  }
  const cap=$('cap');
  if(idx<0){cap.style.opacity=0;return;}
  if(idx!==curPage)buildPage(idx);
  const ws=PAGES[idx],a=ws[0].s-0.07,b=ws[ws.length-1].e+0.3;
  cap.style.opacity=Math.min(1,(t-a)/0.12)*Math.min(1,(b-t)/0.18);
  const spans=chip.querySelectorAll('.w');
  spans.forEach(sp=>{const w=ws[+sp.dataset.i];
    const cls=(t>=w.s-0.03&&t<w.e)?'w on':(t>=w.e?'w done':'w');
    if(sp.className!==cls)sp.className=cls;});
}

/* ================= master render ================= */
const HOOKN=89;
function render(t){
  // hook frame
  const hf=Math.min(HOOKN,Math.floor(t*30)+1);
  $('hook').setAttribute('href','hook/h'+String(hf).padStart(3,'0')+'.jpg');
  // blue panel transition
  const p=eio(seg(t,8.45,9.0));
  $('panel').setAttribute('display',p>0?'inline':'none');
  $('panelR').setAttribute('y',1920*(1-p));
  const edge=$('panelEdge');edge.setAttribute('y',1920*(1-p)-4);edge.setAttribute('opacity',p>0&&p<1?1:0);
  $('bgb').setAttribute('transform',`translate(540,960) scale(${1+0.06*seg(t,8.45,67.9)}) translate(-540,-960)`);
  // logo crossfade
  const la=seg(t,0.3,0.8);
  $('logoB').setAttribute('opacity',la*(1-seg(t,8.6,9.0)));
  $('logoW').setAttribute('opacity',la*seg(t,8.6,9.0));
  // items
  for(const it of ITEMS){
    if(t<it.t0||t>it.t1){it.g.setAttribute('display','none');continue;}
    it.g.setAttribute('display','inline');
    const a=clamp((t-it.t0)/it.inD),b=clamp((it.t1-t)/it.outD);
    const e=eo(a),ob=eo(b);
    it.g.setAttribute('opacity',Math.min(e,ob));
    let tr='';
    if(it.enter==='up')tr=`translate(0,${(1-e)*60-(1-ob)*20})`;
    it.g.setAttribute('transform',tr);
    for(const d of it.draws)d.e.setAttribute('stroke-dashoffset',1-eio(seg(t,d.t0,d.t0+d.dur)));
    for(const w of it.wipes)w.r.setAttribute('width',w.w*eo(seg(t,w.t0,w.t0+w.dur)));
    for(const q of it.pops){const s=seg(t,q.t0,q.t0+q.dur);q.e.setAttribute('opacity',Math.min(1,s*3));q.e.style.transform=`scale(${0.55+0.45*eob(s)})`;}
    if(it.upd)it.upd(t);
  }
  bandsUpd(t);
  updCaps(t);
}
const BANDS=[16.0,27.3,36.85,63.2];
function bandsUpd(t){
  let on=false;
  for(const b0 of BANDS){const p=seg(t,b0-0.05,b0+0.55);if(p>0&&p<1){on=true;const x=-1500+eio(p)*3000;$('bands').setAttribute('transform',`translate(540,960) rotate(-18) translate(${x},0)`);}}
  $('bands').setAttribute('opacity',on?1:0);
}
window.render=render;
render(0);
