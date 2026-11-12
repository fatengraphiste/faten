import math,base64
NAVY='#19226d';RED='#db4041';TINT='#eef0fa';TINT2='#dfe3f4'
FONT=base64.b64encode(open('assets/Montserrat-latin.woff2','rb').read()).decode()
C30=math.cos(math.radians(30));S30=0.5
def head(w,h):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
<defs>
<style>
@font-face{{font-family:'Montserrat';src:url(data:font/woff2;base64,{FONT}) format('woff2');font-weight:100 900}}
text{{font-family:'Montserrat',Arial,sans-serif;fill:{NAVY}}}
.o{{fill:#fff;stroke:{NAVY};stroke-width:5;stroke-linejoin:round;stroke-linecap:round}}
.t{{fill:{TINT};stroke:{NAVY};stroke-width:5;stroke-linejoin:round;stroke-linecap:round}}
.l{{fill:none;stroke:{NAVY};stroke-width:3;stroke-linecap:round;stroke-linejoin:round}}
.ex{{fill:none;stroke:{RED};stroke-width:2;stroke-linecap:round}}
.dl{{fill:none;stroke:{RED};stroke-width:3.5;stroke-linecap:round;marker-start:url(#ah);marker-end:url(#ah)}}
.lab{{font-size:24px;font-weight:600}}
.dim{{font-size:26px;font-weight:800;fill:{RED}}}
.ld{{fill:none;stroke:{NAVY};stroke-width:2;stroke-linecap:round}}
</style>
<marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 1 L10 5 L0 9 z" fill="{RED}"/></marker>
<pattern id="conc" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="3" cy="4" r="1.2" fill="{NAVY}" opacity=".32"/><circle cx="12" cy="9" r="1.1" fill="{NAVY}" opacity=".32"/><circle cx="6" cy="15" r="1" fill="{NAVY}" opacity=".32"/><circle cx="16" cy="16" r="1.2" fill="{NAVY}" opacity=".32"/></pattern>
</defs>
<rect width="{w}" height="{h}" fill="#ffffff"/>
'''
def title(t,sub,x=70,y=95):
    return f'<g id="titre"><text x="{x}" y="{y}" font-size="34" font-weight="800">{t}</text><rect x="{x}" y="{y+22}" width="90" height="7" fill="{RED}"/><text x="{x}" y="{y+68}" font-size="22" font-weight="500" opacity=".75">{sub}</text></g>\n'
def pill(x,y,w,h,txt,bg=RED,size=22):
    return f'<g><rect x="{x-w/2}" y="{y-h/2}" width="{w}" height="{h}" rx="{h/2}" fill="{bg}"/><text x="{x}" y="{y+1}" font-size="{size}" font-weight="800" fill="#fff" style="fill:#fff" text-anchor="middle" dominant-baseline="central" letter-spacing="1">{txt}</text></g>'
def dimH(gid,x1,x2,y,label,e1,e2,above=True,lab_dy=None):
    d=-18 if above else 36
    if lab_dy is not None:d=lab_dy
    s=f'<g id="{gid}">'
    s+=f'<path class="ex" d="M{x1} {e1} V{y+(8 if y>e1 else -8)} M{x2} {e2} V{y+(8 if y>e2 else -8)}"/>'
    s+=f'<path class="dl" d="M{x1} {y} H{x2}"/>'
    w=len(label)*17+22
    s+=f'<rect x="{(x1+x2)/2-w/2}" y="{y+d-24}" width="{w}" height="34" fill="#fff"/><text class="dim" x="{(x1+x2)/2}" y="{y+d}" text-anchor="middle">{label}</text></g>\n'
    return s
def dimV(gid,x,y1,y2,label,e1,e2,right=True):
    s=f'<g id="{gid}">'
    sg=1 if right else -1
    s+=f'<path class="ex" d="M{e1} {y1} H{x-8*sg} M{e2} {y2} H{x-8*sg}"/>'
    s+=f'<path class="dl" d="M{x} {y1} V{y2}"/>'
    tx=x+22*sg;anchor='start' if right else 'end'
    s+=f'<text class="dim" x="{tx}" y="{(y1+y2)/2+9}" text-anchor="{anchor}">{label}</text></g>\n'
    return s
def callout(gid,pts,tx,ty,txt,anchor='start',size=24):
    d='M'+' L'.join(f'{x} {y}' for x,y in pts)
    x,y=pts[0]
    return f'<g id="{gid}"><path class="ld" d="{d}"/><circle cx="{x}" cy="{y}" r="5" fill="{NAVY}"/>'+''.join(f'<text class="lab" x="{tx}" y="{ty+i*size*1.15:.0f}" text-anchor="{anchor}" font-size="{size}">{t}</text>' for i,t in enumerate(txt.split('|')))+'</g>\n'
def octa(cx,cy,w,h):
    return f'M{cx-.26*w:.1f} {cy-h/2:.1f} H{cx+.26*w:.1f} L{cx+.5*w:.1f} {cy-h/2+.24*h:.1f} V{cy+h/2-.24*h:.1f} L{cx+.26*w:.1f} {cy+h/2:.1f} H{cx-.26*w:.1f} L{cx-.5*w:.1f} {cy+h/2-.24*h:.1f} V{cy-h/2+.24*h:.1f} Z'
# ---------------- iso helpers ----------------
def P(O,s,x,y,z=0):
    return (O[0]+(x+z)*C30*s, O[1]+(x-z)*S30*s-y*s)
def pts(l):return ' '.join(f'{a:.1f},{b:.1f}' for a,b in l)
def extrude(O,s,poly,L,holes=(),gid='',end_class='t',side_class='o'):
    out=f'<g id="{gid}">'
    n=len(poly)
    vis=[]
    for i in range(n):
        p,q=poly[i],poly[(i+1)%n]
        dx,dy=q[0]-p[0],q[1]-p[1];nx,ny=dy,-dx
        ln=math.hypot(nx,ny)
        if ln==0:continue
        nx,ny=nx/ln,ny/ln
        if nx+ny>0.01:vis.append((nx+ny,i))
    for _,i in sorted(vis):
        p,q=poly[i],poly[(i+1)%n]
        quad=[P(O,s,p[0],p[1],0),P(O,s,q[0],q[1],0),P(O,s,q[0],q[1],L),P(O,s,p[0],p[1],L)]
        out+=f'<polygon class="{side_class}" points="{pts(quad)}"/>'
    front=[P(O,s,x,y,0) for x,y in poly]
    d='M'+' L'.join(f'{a:.1f} {b:.1f}' for a,b in front)+' Z'
    for h in holes:
        hh=[P(O,s,x,y,0) for x,y in h]
        d+=' M'+' L'.join(f'{a:.1f} {b:.1f}' for a,b in hh)+' Z'
    out+=f'<path class="{end_class}" fill-rule="evenodd" d="{d}"/>'
    out+=f'<path fill="url(#conc)" fill-rule="evenodd" d="{d}"/>'
    return out+'</g>\n'
def octpoly(cx,cy,w,h):
    return [(cx-.26*w,cy-h/2),(cx+.26*w,cy-h/2),(cx+.5*w,cy-h/2+.24*h),(cx+.5*w,cy+h/2-.24*h),(cx+.26*w,cy+h/2),(cx-.26*w,cy+h/2),(cx-.5*w,cy+h/2-.24*h),(cx-.5*w,cy-h/2+.24*h)][::-1]
# =============== A. Dalle alvéolée — coupe ===============
def svg_da_coupe():
    W,H=1080,760;s=6.6;wc,hc=120,16;x0,y0=90,360;x1=x0+wc*s;y1=y0+hc*s
    o=head(W,H)+title('DALLE ALVÉOLÉE · COUPE','DA16 · béton précontraint · 237 kg/m²')
    hh=y1-y0
    path=(f'M{x0+6} {y0} H{x1-6} L{x1} {y0+6} V{y0+.28*hh} L{x1-9} {y0+.38*hh} V{y0+.62*hh} L{x1} {y0+.72*hh} V{y1-6} L{x1-6} {y1} H{x0+6} L{x0} {y1-6} V{y0+.72*hh} L{x0+9} {y0+.62*hh} V{y0+.38*hh} L{x0} {y0+.28*hh} V{y0+6} Z')
    o+=f'<g id="dalle"><path class="t" d="{path}"/><path fill="url(#conc)" d="{path}"/>'
    centers=[x0+(12.9+15.7*k)*s for k in range(7)]
    cy=y0+(3.3+10.6/2)*s
    for cx in centers:o+=f'<path class="o" d="{octa(cx,cy,10.3*s,10.6*s)}"/>'
    o+='</g>\n<g id="torons">'
    for cx in centers:
        for dx in(-1.9,1.9):o+=f'<circle cx="{cx+dx*s:.1f}" cy="{y1-7}" r="3.6" fill="{NAVY}"/>'
    o+='</g>\n'
    o+=dimH('cote-largeur',x0,x1,y0-150,'120 cm',y0-6,y0-6)
    o+=dimV('cote-epaisseur',x1+60,y0,y1,'16 cm',x1+8,x1+8)
    o+='<g id="numeros">'
    for i,cx in enumerate(centers):
        o+=f'<path class="ex" stroke-dasharray="4 6" d="M{cx:.1f} {y0-26} V{cy-.5*10.6*s-8:.1f}"/><circle cx="{cx:.1f}" cy="{y0-50}" r="21" fill="{RED}"/><text x="{cx:.1f}" y="{y0-49}" text-anchor="middle" dominant-baseline="central" font-size="24" font-weight="800" style="fill:#fff">{i+1}</text>'
    o+='</g>\n'
    o+=pill(540,y1+130,300,50,'7 ALVÉOLES')+'\n'
    o+=callout('legende-cle',[(x0+4,y0+.5*hh),(x0-30,y0+.5*hh+50),(x0-30,y1+215)],x0-30,y1+250,'Clé de joint','start')
    o+=callout('legende-toron',[(centers[4]+1.9*s,y1-7),(centers[4]+1.9*s,y1+215)],centers[4]-60,y1+250,'Torons de précontrainte','start')
    o+=callout('legende-alveole',[(centers[5],cy),(centers[5],y0-40),(x1-40,y0-40)],x1-40,y0-52,'','end',22) if False else ''
    o+='</svg>'
    return o,W,H
# =============== B. Dalle alvéolée — vue 3D ===============
def svg_da_3d():
    W,H=1080,900;s=5.0;O=(200,470)
    o=head(W,H)+title('DALLE ALVÉOLÉE · VUE 3D','Largeur 1,20 m · alvéoles continues sur toute la longueur')
    poly=[(0,0),(120,0),(120,16),(0,16)]
    holes=[octpoly(12.9+15.7*k,3.3+5.3,10.3,10.6) for k in range(7)]
    o+=extrude(O,s,poly,56,holes,'dalle')
    # dashed continuation
    bx,by=P(O,s,0,16,56);cx_,cy_=P(O,s,120,16,56)
    o+=f'<g id="rupture"><path class="l" stroke-dasharray="10 9" d="M{P(O,s,120,0,56)[0]:.1f} {P(O,s,120,0,56)[1]:.1f} L{P(O,s,120,0,76)[0]:.1f} {P(O,s,120,0,76)[1]:.1f} M{cx_:.1f} {cy_:.1f} L{P(O,s,120,16,76)[0]:.1f} {P(O,s,120,16,76)[1]:.1f} M{bx:.1f} {by:.1f} L{P(O,s,0,16,76)[0]:.1f} {P(O,s,0,16,76)[1]:.1f}"/></g>\n'
    # dimension width (along a, offset along -b)
    def off(x,y,z,d=70):return P(O,s,x,y,z-d/s)
    a1=P(O,s,0,0,0);a2=P(O,s,120,0,0)
    o1=(a1[0]-70*C30,a1[1]+70*S30);o2=(a2[0]-70*C30,a2[1]+70*S30)
    mid=((o1[0]+o2[0])/2,(o1[1]+o2[1])/2)
    o+=f'<g id="cote-largeur"><path class="ex" d="M{a1[0]-8*C30:.1f} {a1[1]+8*S30:.1f} L{o1[0]-8:.1f} {o1[1]+4:.1f} M{a2[0]-8*C30:.1f} {a2[1]+8*S30:.1f} L{o2[0]-8:.1f} {o2[1]+4:.1f}"/><path class="dl" d="M{o1[0]:.1f} {o1[1]:.1f} L{o2[0]:.1f} {o2[1]:.1f}"/><text class="dim" transform="translate({mid[0]-22:.1f},{mid[1]+44:.1f}) rotate(30)" text-anchor="middle">120 cm</text></g>\n'
    # thickness (vertical at left)
    p0=P(O,s,0,0,0);p1=P(O,s,0,16,0)
    tx=p0[0]-60
    o+=f'<g id="cote-epaisseur"><path class="ex" d="M{p0[0]-8:.1f} {p0[1]:.1f} H{tx-8} M{p1[0]-8:.1f} {p1[1]:.1f} H{tx-8}"/><path class="dl" d="M{tx} {p0[1]:.1f} V{p1[1]:.1f}"/><text class="dim" x="{tx-18}" y="{(p0[1]+p1[1])/2+9}" text-anchor="end">16 cm</text></g>\n'
    # length (along b on right side bottom edge)
    q1=P(O,s,120,0,0);q2=P(O,s,120,0,56)
    r1=(q1[0]+60*C30,q1[1]+60*S30);r2=(q2[0]+60*C30,q2[1]+60*S30)
    m2=((r1[0]+r2[0])/2,(r1[1]+r2[1])/2)
    o+=f'<g id="cote-longueur"><path class="ex" d="M{q1[0]+8:.1f} {q1[1]+4:.1f} L{r1[0]+6:.1f} {r1[1]+4:.1f} M{q2[0]+8:.1f} {q2[1]+4:.1f} L{r2[0]+6:.1f} {r2[1]+4:.1f}"/><path class="dl" d="M{r1[0]:.1f} {r1[1]:.1f} L{r2[0]:.1f} {r2[1]:.1f}"/><text class="dim" transform="translate({m2[0]+40:.1f},{m2[1]+12:.1f}) rotate(-30)" text-anchor="middle">L selon besoins</text></g>\n'
    o+=pill(540,830,460,52,'DA16 · DA20 · DA26.5 · DA32',NAVY,22)+'\n'
    o+='</svg>'
    return o,W,H
# =============== C. Poutrelle + entrevous — coupe assemblée ===============
def poutrelle_poly(cx,hp,fl=12,ft=4,web=8):
    # section coords: y measured from slab top downward -> we draw directly in px by caller
    return None
def svg_pe_coupe():
    W,H=1080,800;s=6.2;ox=90;oy=300
    X=lambda c:ox+c*s
    Y=lambda y:oy+y*s
    o=head(W,H)+title('POUTRELLES + ENTREVOUS · COUPE','Montage 16+5 · plancher préfabriqué')
    # entrevous (52 wide, 16 high, from y=5 to 21)
    ent=''
    for c in (0,60):
        x_a=c+4;x_b=c+56;y_a=5;y_b=21
        d=f'M{X(x_a)} {Y(y_a)} H{X(x_b)} V{Y(y_b-2)} L{X(x_b-2)} {Y(y_b)} H{X(x_a+2)} L{X(x_a)} {Y(y_b-2)} Z'
        ent+=f'<g id="entrevous-{1 if c==0 else 2}"><path class="o" d="{d}"/><path fill="url(#conc)" d="{d}"/>'
        wall=2.4;cw=(52-4*wall)/3
        for k in range(3):
            xa=x_a+wall+k*(cw+wall);xb=xa+cw
            ent+=f'<rect class="l" x="{X(xa)}" y="{Y(y_a+wall)}" width="{(xb-xa)*s}" height="{(16-2*wall)*s}" rx="7" fill="#fff"/>'
        ent+='</g>\n'
    o+=ent
    # poutrelles at c=0,60,120
    for i,c in enumerate((0,60,120)):
        web=8;fl=12;ft=4
        d=(f'M{X(c-web/2)} {Y(5)} H{X(c+web/2)} V{Y(21-ft)} H{X(c+fl/2)} V{Y(21)} H{X(c-fl/2)} V{Y(21-ft)} H{X(c-web/2)} Z')
        o+=f'<g id="poutrelle-{i+1}"><path class="t" d="{d}"/><path fill="url(#conc)" d="{d}"/><circle cx="{X(c-2)}" cy="{Y(19)}" r="3.6" fill="{NAVY}"/><circle cx="{X(c+2)}" cy="{Y(19)}" r="3.6" fill="{NAVY}"/></g>\n'
    # table de compression
    d=f'M{X(-6)} {Y(0)} H{X(126)} V{Y(5)} H{X(-6)} Z'
    o+=f'<g id="table"><path class="t" d="{d}"/><path fill="url(#conc)" d="{d}"/><path class="l" stroke-dasharray="3 9" d="M{X(-4)} {Y(2.5)} H{X(124)}"/></g>\n'
    # cotes
    o+=dimH('cote-entrevous',X(4),X(56),Y(21)+78,'520 mm',Y(21)+4,Y(21)+4,above=False)
    o+=dimV('cote-hauteur',X(126)+60,Y(5),Y(21),'16 cm',X(126)+6,X(126)+6)
    o+=dimV('cote-table',X(126)+60,Y(0),Y(5),'5 cm',X(126)+6,X(126)+6)
    # callouts
    o+=callout('legende-table',[(X(18),Y(1.2)),(X(18),Y(-9))],X(18)-10,Y(-9)-14,'Table de compression','start')
    o+=callout('legende-treillis',[(X(90),Y(2.5)),(X(90),Y(-9))],X(90)-10,Y(-9)-14,'Treillis soudé Ø3–4','start')
    o+=callout('legende-entrevous',[(X(14),Y(13)),(X(14),Y(21)+170),],X(14),Y(21)+206,'Entrevous','middle')
    o+=callout('legende-poutrelle',[(X(60),Y(17.5)),(X(60),Y(21)+170)],X(60)+14,Y(21)+206,'','start') if False else ''
    o+=callout('legende-poutrelle',[(X(120)+4,Y(15)),(X(120)+4,Y(21)+170)],X(120),Y(21)+206,'Poutrelle GEP','middle')
    o+=pill(540,H-70,330,50,'MONTAGE 16 + 5',NAVY)+'\n'
    o+='</svg>'
    return o,W,H
# =============== D. éclaté ===============
def svg_eclate():
    W,H=1080,1060;s=8.0;ox=262;
    X=lambda c:ox+c*s
    o=head(W,H)+title('VUE ÉCLATÉE · PLANCHER','Les 3 éléments : poutrelles, entrevous, table de compression')
    y_t=200;y_e=440;y_p=700
    # slab
    d=f'M{X(-6)} {y_t} H{X(66)} V{y_t+5*s} H{X(-6)} Z'
    o+=f'<g id="eclate-table"><path class="t" d="{d}"/><path fill="url(#conc)" d="{d}"/><path class="l" stroke-dasharray="3 9" d="M{X(-4)} {y_t+25} H{X(64)}"/></g>\n'
    # entrevous
    x_a,x_b=4,56;ya=y_e;yb=y_e+16*s
    d=f'M{X(x_a)} {ya} H{X(x_b)} V{yb-20} L{X(x_b)-20} {yb} H{X(x_a)+20} L{X(x_a)} {yb-20} Z'
    o+=f'<g id="eclate-entrevous"><path class="o" d="{d}"/><path fill="url(#conc)" d="{d}"/>'
    wall=2.4;cw=(52-4*wall)/3
    for k in range(3):
        xa=x_a+wall+k*(cw+wall)
        o+=f'<rect class="l" x="{X(xa)}" y="{ya+wall*s}" width="{cw*s}" height="{(16-2*wall)*s}" rx="9" fill="#fff"/>'
    o+='</g>\n'
    # poutrelles at 0 and 60
    for i,c in enumerate((0,60)):
        web,fl,ft=8,12,4
        d=f'M{X(c-web/2)} {y_p} H{X(c+web/2)} V{y_p+(16-ft)*s} H{X(c+fl/2)} V{y_p+16*s} H{X(c-fl/2)} V{y_p+(16-ft)*s} H{X(c-web/2)} Z'
        o+=f'<g id="eclate-poutrelle-{i+1}"><path class="t" d="{d}"/><path fill="url(#conc)" d="{d}"/><circle cx="{X(c-2)}" cy="{y_p+(16-2)*s}" r="5" fill="{NAVY}"/><circle cx="{X(c+2)}" cy="{y_p+(16-2)*s}" r="5" fill="{NAVY}"/></g>\n'
    # assembly lines & arrows
    o+=f'<g id="lignes-assemblage" fill="none" stroke="{RED}" stroke-width="2.5" stroke-dasharray="9 9">'
    for c in (0,60):
        o+=f'<path d="M{X(c)} {y_t+5*s+8} V{y_e-8}"/><path d="M{X(c)} {y_e+16*s+8} V{y_p-8}"/>'
    o+='</g>\n'
    for xm,ya_,yb_ in ((X(30),y_t+5*s+14,y_e-14),(X(30),y_e+16*s+14,y_p-14)):
        o+=f'<path class="dl" style="marker-start:none" d="M{xm} {ya_} V{yb_}"/>'
    o+=pill(X(30)+120,(y_t+5*s+y_e)/2,230,40,'3 · COULAGE',RED,20)+pill(X(30)+120,(y_e+16*s+y_p)/2,200,40,'2 · POSE',RED,20)+'\n'
    # labels right
    lx=X(66)+34
    o+=callout('eclate-leg-table',[(X(66),y_t+25),(lx,y_t+25)],lx+14,y_t+20,'Table de|compression','start',20)
    o+=callout('eclate-leg-entrevous',[(X(56),y_e+80),(lx,y_e+80)],lx+14,y_e+87,'Entrevous','start',20)
    o+=callout('eclate-leg-poutrelle',[(X(66)-60,y_p+120),(lx,y_p+120)],lx+14,y_p+127,'Poutrelles','start',20)
    o+=dimH('eclate-cote-entrevous',X(4),X(56),y_e+16*s+120,'520 mm',y_e+16*s+4,y_e+16*s+4,above=False,lab_dy=-16) if False else ''
    o+=dimV('eclate-cote-h',X(-6)-40,y_e,y_e+16*s,'16 cm',X(4)-8,X(4)-8,right=False)
    o+=dimV('eclate-cote-t',X(-6)-40,y_t,y_t+5*s,'5 cm',X(-6)-8,X(-6)-8,right=False)
    o+=pill(540,H-70,800,52,'1 · POUTRELLES   →   2 · ENTREVOUS   →   3 · TABLE DE COMPRESSION',NAVY,19)+'\n'
    o+='</svg>'
    return o,W,H
# =============== E. éléments 3D (poutrelle + entrevous) ===============
def svg_elements():
    W,H=1080,1220;s=6.0
    o=head(W,H)+title('LES ÉLÉMENTS · VUES 3D','Poutrelle précontrainte et entrevous')
    # poutrelle
    O=(200,500)
    prof=[(-6,0),(6,0),(6,4),(4,4),(4,16),(-4,16),(-4,4),(-6,4)]
    prof=[(x+6,y) for x,y in prof]  # shift so x>=0
    o+=extrude(O,s,prof,52,(),'poutrelle')
    # armature stubs (rods) at front end
    o+=f'<g id="armatures" class="l" stroke-width="4">'
    for (x,y) in ((4,2),(6,2),(8,2)):
        a=P(O,s,x,y,0);b=P(O,s,x,y,-9)
        o+=f'<path d="M{a[0]:.1f} {a[1]:.1f} L{b[0]:.1f} {b[1]:.1f}"/>'
    o+='</g>\n'
    # length dim
    q1=P(O,s,12,0,0);q2=P(O,s,12,0,52)
    r1=(q1[0]+60*C30,q1[1]+60*S30);r2=(q2[0]+60*C30,q2[1]+60*S30);m=((r1[0]+r2[0])/2,(r1[1]+r2[1])/2)
    o+=f'<g id="cote-poutrelle-longueur"><path class="ex" d="M{q1[0]+8:.1f} {q1[1]+4:.1f} L{r1[0]+6:.1f} {r1[1]+4:.1f} M{q2[0]+8:.1f} {q2[1]+4:.1f} L{r2[0]+6:.1f} {r2[1]+4:.1f}"/><path class="dl" d="M{r1[0]:.1f} {r1[1]:.1f} L{r2[0]:.1f} {r2[1]:.1f}"/><text class="dim" transform="translate({m[0]+36:.1f},{m[1]+10:.1f}) rotate(-30)" text-anchor="middle">0,40 à 9 m</text></g>\n'
    a=P(O,s,0,0,0);b=P(O,s,0,16,0)
    o+=f'<g id="cote-poutrelle-h"><path class="ex" d="M{a[0]-8:.1f} {a[1]:.1f} H{a[0]-62:.1f} M{b[0]-8:.1f} {b[1]:.1f} H{b[0]-62:.1f}"/><path class="dl" d="M{a[0]-54:.1f} {a[1]:.1f} V{b[1]:.1f}"/><text class="dim" x="{a[0]-72:.1f}" y="{(a[1]+b[1])/2+9:.1f}" text-anchor="end">16 cm</text></g>\n'
    o+=callout('leg-poutrelle',[(P(O,s,6,16,30)[0],P(O,s,6,16,30)[1]),(P(O,s,6,16,30)[0]+40,P(O,s,6,16,30)[1]-90)],P(O,s,6,16,30)[0]+50,P(O,s,6,16,30)[1]-100,'Poutrelle en béton précontraint','start',22)
    # entrevous
    O2=(200,900)
    ep=[(2,0),(50,0),(52,2),(52,16),(0,16),(0,2)]
    wall=2.4;cw=(52-4*wall)/3
    holes=[]
    for k in range(3):
        xa=wall+k*(cw+wall)
        holes.append([(xa,wall),(xa+cw,wall),(xa+cw,16-wall),(xa,16-wall)][::-1])
    o+=extrude(O2,s,ep,25,holes,'entrevous')
    q1=P(O2,s,0,0,0);q2=P(O2,s,52,0,0)
    o1=(q1[0]-60*C30,q1[1]+60*S30);o2=(q2[0]-60*C30,q2[1]+60*S30);mm=((o1[0]+o2[0])/2,(o1[1]+o2[1])/2)
    o+=f'<g id="cote-entrevous-largeur"><path class="ex" d="M{q1[0]-8*C30:.1f} {q1[1]+4:.1f} L{o1[0]-6:.1f} {o1[1]+3:.1f} M{q2[0]-8*C30:.1f} {q2[1]+4:.1f} L{o2[0]-6:.1f} {o2[1]+3:.1f}"/><path class="dl" d="M{o1[0]:.1f} {o1[1]:.1f} L{o2[0]:.1f} {o2[1]:.1f}"/><text class="dim" transform="translate({mm[0]-16:.1f},{mm[1]+40:.1f}) rotate(30)" text-anchor="middle">520 mm</text></g>\n'
    r1=P(O2,s,52,0,0);r2=P(O2,s,52,0,25)
    t1=(r1[0]+50*C30,r1[1]+50*S30);t2=(r2[0]+50*C30,r2[1]+50*S30);mt=((t1[0]+t2[0])/2,(t1[1]+t2[1])/2)
    o+=f'<g id="cote-entrevous-profondeur"><path class="ex" d="M{r1[0]+8:.1f} {r1[1]+4:.1f} L{t1[0]+6:.1f} {t1[1]+4:.1f} M{r2[0]+8:.1f} {r2[1]+4:.1f} L{t2[0]+6:.1f} {t2[1]+4:.1f}"/><path class="dl" d="M{t1[0]:.1f} {t1[1]:.1f} L{t2[0]:.1f} {t2[1]:.1f}"/><text class="dim" transform="translate({mt[0]+34:.1f},{mt[1]+10:.1f}) rotate(-30)" text-anchor="middle">250 mm</text></g>\n'
    a=P(O2,s,0,0,0);b=P(O2,s,0,16,0)
    o+=f'<g id="cote-entrevous-h"><path class="ex" d="M{a[0]-8:.1f} {a[1]:.1f} H{a[0]-62:.1f} M{b[0]-8:.1f} {b[1]:.1f} H{b[0]-62:.1f}"/><path class="dl" d="M{a[0]-54:.1f} {a[1]:.1f} V{b[1]:.1f}"/><text class="dim" x="{a[0]-72:.1f}" y="{(a[1]+b[1])/2+9:.1f}" text-anchor="end">H</text></g>\n'
    o+=pill(540,1150,520,52,'H = 12 · 16 · 20 · 25 · 30 cm',NAVY,22)+'\n'
    p=P(O2,s,26,16,12)
    o+=callout('leg-entrevous',[(p[0],p[1]),(p[0]+30,p[1]-90)],p[0]+40,p[1]-100,'Entrevous à 3 alvéoles','start',22)
    o+='</svg>'
    return o,W,H
if __name__=='__main__':
    for name,fn in [('01_dalle_alveolee_coupe',svg_da_coupe),('02_dalle_alveolee_3d',svg_da_3d),('03_poutrelle_entrevous_coupe',svg_pe_coupe),('04_plancher_eclate',svg_eclate),('05_elements_3d',svg_elements)]:
        s,w,h=fn();open(f'svg/{name}.svg','w').write(s);print(name,w,h,len(s)//1024,'ko')
