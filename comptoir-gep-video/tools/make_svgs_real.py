import json,math,sys
sys.path.insert(0,'tools')
from make_svgs import *
R_=json.load(open('assets/real_section.json'))
PITCH=R_['meta']['pitch_mm']
def area(p):return sum(p[i][0]*p[(i+1)%len(p)][1]-p[(i+1)%len(p)][0]*p[i][1] for i in range(len(p)))/2
def pth(pts,s,ox,oy,dx=0):
    return 'M'+' L'.join(f'{ox+(x+dx)*s:.1f} {oy+y*s:.1f}' for x,y in pts)+' Z'
ENT=R_['entrevous'];CELLS=R_['cells'];POUT=R_['poutrelle'];GOUS=R_['gousset']
ent_h=max(y for x,y in ENT);ent_w=max(x for x,y in ENT)-min(x for x,y in ENT)
DOTS=[(-1,59),(-28,142),(-1,125),(26,139)]
def part(gid,d,cls,extra=''):
    return f'<g id="{gid}"><path class="{cls}" d="{d}"/><path fill="url(#conc)" d="{d}"/>{extra}</g>\n'
# ===== 03 coupe assemblée (formes réelles de la brochure) =====
def svg_pe_coupe():
    W,H=1080,800;s=0.55;ox=540-PITCH*s;oy=450
    o=head(W,H)+title('POUTRELLES + ENTREVOUS · COUPE','Montage 16+5 · plancher préfabriqué')
    slab_top=-55.4
    # slab spanning poutrelles
    x_l,x_r=-95,2*PITCH+95
    d=f'M{ox+x_l*s:.1f} {oy+slab_top*s:.1f} H{ox+x_r*s:.1f} V{oy:.1f} H{ox+x_l*s:.1f} Z'
    o+=f'<g id="table"><path class="t" d="{d}"/><path fill="url(#conc)" d="{d}"/><path class="l" stroke-dasharray="3 9" d="M{ox+(x_l+10)*s:.1f} {oy+slab_top/2*s:.1f} H{ox+(x_r-10)*s:.1f}"/></g>\n'
    for i in range(3):
        o+=part(f'gousset-{i+1}',pth(GOUS,s,ox,oy,dx=i*PITCH),'t')
    for i in range(2):
        cx=PITCH/2+i*PITCH
        d=pth(ENT,s,ox,oy,dx=cx)
        ex=''.join(f'<path class="l" fill="#fff" d="{pth(c,s,ox,oy,dx=cx)}"/>' for c in CELLS)
        o+=f'<g id="entrevous-{i+1}"><path class="o" d="{d}"/><path fill="url(#conc)" d="{d}"/>{ex}</g>\n'
    for i in range(3):
        dots=''.join(f'<circle cx="{ox+(x+i*PITCH)*s:.1f}" cy="{oy+y*s:.1f}" r="3.2" fill="{NAVY}"/>' for x,y in DOTS)
        o+=part(f'poutrelle-{i+1}',pth(POUT,s,ox,oy,dx=i*PITCH),'t',dots)
    xe1=PITCH/2-ent_w/2;xe2=PITCH/2+ent_w/2
    yb=oy+ent_h*s
    o+=dimH('cote-entrevous',ox+xe1*s,ox+xe2*s,yb+80,'520 mm',yb+6,yb+6,above=False)
    xr=ox+x_r*s
    o+=dimV('cote-hauteur',xr+40,oy,yb,'16 cm',xr+6,xr+6)
    o+=dimV('cote-table',xr+40,oy+slab_top*s,oy,'5 cm',xr+6,xr+6)
    o+=callout('legende-table',[(ox+(PITCH*0.9)*s,oy+slab_top*s*0.7),(ox+(PITCH*0.9)*s,oy+slab_top*s-60)],ox+(PITCH*0.9)*s-14,oy+slab_top*s-75,'Table de compression','end')
    o+=callout('legende-treillis',[(ox+(PITCH*1.45)*s,oy+slab_top/2*s),(ox+(PITCH*1.45)*s,oy+slab_top*s-60)],ox+(PITCH*1.45)*s+14,oy+slab_top*s-75,'Treillis soudé Ø3–4','start')
    o+=callout('legende-entrevous',[(ox+(PITCH/2-200)*s,oy+110*s),(ox+(PITCH/2-200)*s,yb+190)],ox+(PITCH/2-200)*s,yb+226,'Entrevous','middle')
    o+=callout('legende-poutrelle',[(ox+(2*PITCH)*s,oy+110*s),(ox+(2*PITCH)*s,yb+190)],ox+(2*PITCH)*s,yb+226,'Poutrelle GEP','middle')
    o+=pill(540,H-60,330,50,'MONTAGE 16 + 5',NAVY)+'\n'
    return o+'</svg>',W,H
# ===== 04 éclaté =====
def svg_eclate():
    W,H=1080,1080;s=0.74;ox=300
    o=head(W,H)+title('VUE ÉCLATÉE · PLANCHER','Les 3 éléments : poutrelles, entrevous, table de compression')
    gh=max(y for x,y in GOUS)
    yt=255                       # slab bottom of layer 1 (y of slab bottom line)
    ye=yt+gh*s+85                # entrevous top ref
    yp_top=ye+ent_h*s+85         # poutrelle: reference slab-bottom line of its own coords
    # layer 1 : table + goussets
    x_l,x_r=-95,PITCH+95;slab_top=-55.4
    d=f'M{ox+x_l*s:.1f} {yt+slab_top*s:.1f} H{ox+x_r*s:.1f} V{yt:.1f} H{ox+x_l*s:.1f} Z'
    o+=f'<g id="eclate-table"><path class="t" d="{d}"/><path fill="url(#conc)" d="{d}"/><path class="l" stroke-dasharray="3 9" d="M{ox+(x_l+10)*s:.1f} {yt+slab_top/2*s:.1f} H{ox+(x_r-10)*s:.1f}"/>'
    for i in range(2):
        dd=pth(GOUS,s,ox,yt,dx=i*PITCH)
        o+=f'<path class="t" d="{dd}"/><path fill="url(#conc)" d="{dd}"/>'
    o+='</g>\n'
    # layer 2 : entrevous
    cx=PITCH/2
    d=pth(ENT,s,ox,ye,dx=cx)
    ex=''.join(f'<path class="l" fill="#fff" d="{pth(c,s,ox,ye,dx=cx)}"/>' for c in CELLS)
    o+=f'<g id="eclate-entrevous"><path class="o" d="{d}"/><path fill="url(#conc)" d="{d}"/>{ex}</g>\n'
    # layer 3 : poutrelles
    for i in range(2):
        dots=''.join(f'<circle cx="{ox+(x+i*PITCH)*s:.1f}" cy="{yp_top+y*s:.1f}" r="3.6" fill="{NAVY}"/>' for x,y in DOTS)
        o+=part(f'eclate-poutrelle-{i+1}',pth(POUT,s,ox,yp_top,dx=i*PITCH),'t',dots).replace('</g>\n',dots+'</g>\n') if False else part(f'eclate-poutrelle-{i+1}',pth(POUT,s,ox,yp_top,dx=i*PITCH),'t',dots)
    # assembly lines & arrows
    o+=f'<g id="lignes-assemblage" fill="none" stroke="{RED}" stroke-width="2.5" stroke-dasharray="9 9">'
    for i in range(2):
        xx=ox+i*PITCH*s
        o+=f'<path d="M{xx:.1f} {yt+gh*s+8:.1f} V{ye-8:.1f}"/><path d="M{xx:.1f} {ye+ent_h*s+8:.1f} V{yp_top-8:.1f}"/>'
    o+='</g>\n'
    xm=ox+PITCH/2*s
    o+=f'<path class="dl" style="marker-start:none" d="M{xm:.1f} {yt+gh*s+14:.1f} V{ye-14:.1f}"/><path class="dl" style="marker-start:none" d="M{xm:.1f} {ye+ent_h*s+14:.1f} V{yp_top-14:.1f}"/>'
    o+=pill(xm+135,(yt+gh*s+ye)/2,230,40,'3 · COULAGE',RED,20)+pill(xm+135,(ye+ent_h*s+yp_top)/2,200,40,'2 · POSE',RED,20)+'\n'
    lx=ox+x_r*s+34
    o+=callout('eclate-leg-table',[(ox+x_r*s-4,yt+slab_top/2*s),(lx,yt+slab_top/2*s)],lx+14,yt+slab_top/2*s-10,'Table de|compression','start',20)
    o+=callout('eclate-leg-entrevous',[(ox+(cx+ent_w/2)*s-6,ye+ent_h*s/2),(lx,ye+ent_h*s/2)],lx+14,ye+ent_h*s/2+7,'Entrevous','start',20)
    o+=callout('eclate-leg-poutrelle',[(ox+(PITCH+45)*s,yp_top+100*s),(lx,yp_top+100*s)],lx+14,yp_top+100*s+7,'Poutrelles','start',20)
    o+=dimV('eclate-cote-t',ox+x_l*s-50,yt+slab_top*s,yt,'5 cm',ox+x_l*s-6,ox+x_l*s-6,right=False)
    o+=dimV('eclate-cote-h',ox+(cx-ent_w/2)*s-50,ye,ye+ent_h*s,'16 cm',ox+(cx-ent_w/2)*s-6,ox+(cx-ent_w/2)*s-6,right=False)
    o+=dimH('eclate-cote-largeur',ox+(cx-ent_w/2)*s,ox+(cx+ent_w/2)*s,ye+ent_h*s+36,'520 mm',ye+ent_h*s+6,ye+ent_h*s+6,above=False) if False else ''
    o+=pill(540,H-60,800,52,'1 · POUTRELLES   →   2 · ENTREVOUS   →   3 · TABLE DE COMPRESSION',NAVY,19)+'\n'
    return o+'</svg>',W,H
# ===== 05 éléments 3D (formes réelles) =====
def up(poly,Hh):
    p=[(x,Hh-y) for x,y in poly]
    return p[::-1] if area(p)<0 else p
def svg_elements():
    W,H=1080,1240;s=0.58
    o=head(W,H)+title('LES ÉLÉMENTS · VUES 3D','Poutrelle précontrainte et entrevous')
    # poutrelle
    ymin=min(y for x,y in POUT);ymax=max(y for x,y in POUT);xmin=min(x for x,y in POUT)
    pp=up([(x-xmin,y-ymin) for x,y in POUT],ymax-ymin)
    ph=ymax-ymin;pw=max(x for x,y in pp)
    O=(170,520)
    o+=extrude(O,s,pp,520,(),'poutrelle',side_class='o4')
    # armatures
    o+='<g id="armatures" class="l" stroke-width="4">'
    for (x,y) in ((pw*0.30,18),(pw*0.5,26),(pw*0.7,18)):
        a=P(O,s,x,y,0);b=P(O,s,x,y,-90)
        o+=f'<path d="M{a[0]:.1f} {a[1]:.1f} L{b[0]:.1f} {b[1]:.1f}"/>'
    o+='</g>\n'
    q1=P(O,s,pw,0,0);q2=P(O,s,pw,0,520)
    r1=(q1[0]+60*C30,q1[1]+60*S30);r2=(q2[0]+60*C30,q2[1]+60*S30);m=((r1[0]+r2[0])/2,(r1[1]+r2[1])/2)
    o+=f'<g id="cote-poutrelle-longueur"><path class="ex" d="M{q1[0]+8:.1f} {q1[1]+4:.1f} L{r1[0]+6:.1f} {r1[1]+4:.1f} M{q2[0]+8:.1f} {q2[1]+4:.1f} L{r2[0]+6:.1f} {r2[1]+4:.1f}"/><path class="dl" d="M{r1[0]:.1f} {r1[1]:.1f} L{r2[0]:.1f} {r2[1]:.1f}"/><text class="dim" transform="translate({m[0]+36:.1f},{m[1]+10:.1f}) rotate(-30)" text-anchor="middle">0,40 à 9 m</text></g>\n'
    a=P(O,s,0,0,0);b=P(O,s,0,ph,0)
    o+=f'<g id="cote-poutrelle-h"><path class="ex" d="M{a[0]-8:.1f} {a[1]:.1f} H{a[0]-62:.1f} M{b[0]-8:.1f} {b[1]:.1f} H{b[0]-62:.1f}"/><path class="dl" d="M{a[0]-54:.1f} {a[1]:.1f} V{b[1]:.1f}"/><text class="dim" x="{a[0]-72:.1f}" y="{(a[1]+b[1])/2+9:.1f}" text-anchor="end">H</text></g>\n'
    tp=P(O,s,pw/2,ph,300)
    o+=callout('leg-poutrelle',[(tp[0],tp[1]),(tp[0]+40,tp[1]-90)],tp[0]+50,tp[1]-100,'Poutrelle en béton précontraint','start',22)
    # entrevous
    exm=min(x for x,y in ENT);ey=max(y for x,y in ENT)
    ep=up([(x-exm,y) for x,y in ENT],ey)
    holes=[up([(x-exm,y) for x,y in c],ey) for c in CELLS]
    O2=(190,960)
    o+=extrude(O2,s,ep,250,holes,'entrevous',side_class='o4')
    ew=max(x for x,y in ep)
    q1=P(O2,s,0,0,0);q2=P(O2,s,ew,0,0)
    o1=(q1[0]-60*C30,q1[1]+60*S30);o2=(q2[0]-60*C30,q2[1]+60*S30);mm=((o1[0]+o2[0])/2,(o1[1]+o2[1])/2)
    o+=f'<g id="cote-entrevous-largeur"><path class="ex" d="M{q1[0]-8*C30:.1f} {q1[1]+4:.1f} L{o1[0]-6:.1f} {o1[1]+3:.1f} M{q2[0]-8*C30:.1f} {q2[1]+4:.1f} L{o2[0]-6:.1f} {o2[1]+3:.1f}"/><path class="dl" d="M{o1[0]:.1f} {o1[1]:.1f} L{o2[0]:.1f} {o2[1]:.1f}"/><text class="dim" transform="translate({mm[0]-16:.1f},{mm[1]+40:.1f}) rotate(30)" text-anchor="middle">520 mm</text></g>\n'
    r1=P(O2,s,ew,0,0);r2=P(O2,s,ew,0,250)
    t1=(r1[0]+50*C30,r1[1]+50*S30);t2=(r2[0]+50*C30,r2[1]+50*S30);mt=((t1[0]+t2[0])/2,(t1[1]+t2[1])/2)
    o+=f'<g id="cote-entrevous-profondeur"><path class="ex" d="M{r1[0]+8:.1f} {r1[1]+4:.1f} L{t1[0]+6:.1f} {t1[1]+4:.1f} M{r2[0]+8:.1f} {r2[1]+4:.1f} L{t2[0]+6:.1f} {t2[1]+4:.1f}"/><path class="dl" d="M{t1[0]:.1f} {t1[1]:.1f} L{t2[0]:.1f} {t2[1]:.1f}"/><text class="dim" transform="translate({mt[0]+34:.1f},{mt[1]+10:.1f}) rotate(-30)" text-anchor="middle">250 mm</text></g>\n'
    a=P(O2,s,0,0,0);b=P(O2,s,0,ey,0)
    o+=f'<g id="cote-entrevous-h"><path class="ex" d="M{a[0]-8:.1f} {a[1]:.1f} H{a[0]-62:.1f} M{b[0]-8:.1f} {b[1]:.1f} H{b[0]-62:.1f}"/><path class="dl" d="M{a[0]-54:.1f} {a[1]:.1f} V{b[1]:.1f}"/><text class="dim" x="{a[0]-72:.1f}" y="{(a[1]+b[1])/2+9:.1f}" text-anchor="end">H</text></g>\n'
    o+=pill(540,1180,520,52,'H = 12 · 16 · 20 · 25 · 30 cm',NAVY,22)+'\n'
    p=P(O2,s,ew/2,ey,120)
    o+=callout('leg-entrevous',[(p[0],p[1]),(p[0]+30,p[1]-90)],p[0]+40,p[1]-100,'Entrevous à 3 alvéoles','start',22)
    return o+'</svg>',W,H
if __name__=='__main__':
    for name,fn in [('03_poutrelle_entrevous_coupe',svg_pe_coupe),('04_plancher_eclate',svg_eclate),('05_elements_3d',svg_elements)]:
        s_,w,h=fn();open(f'svg/{name}.svg','w').write(s_);print(name,w,h)
