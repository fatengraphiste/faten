import re,sys
import xml.etree.ElementTree as ET
ET.register_namespace('','http://www.w3.org/2000/svg')
NS='{http://www.w3.org/2000/svg}'
SHAPES={'path','polygon','rect','circle','line','polyline','ellipse'}
CSS='''
@keyframes draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes pop{0%{opacity:0;transform:scale(.6)}70%{transform:scale(1.08)}100%{opacity:1;transform:scale(1)}}
.anim-draw{stroke-dasharray:1 1.02;stroke-dashoffset:1;animation:draw 1.1s ease-in-out forwards}
.anim-fade{opacity:0;animation:fade .6s ease-out forwards}
.anim-pop{opacity:0;transform-box:fill-box;transform-origin:center;animation:pop .5s ease-out forwards}
@keyframes mk{from{marker-start:none;marker-end:none}to{marker-start:url(#ah);marker-end:url(#ah)}}
'''
def run(src,dst,step=0.45):
    tree=ET.parse(src);root=tree.getroot()
    st=root.find(f'{NS}defs/{NS}style')
    extra=CSS
    st.text=(st.text or '')+extra
    groups=[g for g in root if g.tag==NS+'g' and g.get('id')]
    t=0.2
    for g in groups:
        gid=g.get('id')
        is_dim=gid.startswith('cote') or gid.startswith('eclate-cote')
        is_leg=gid.startswith('leg') or gid.startswith('eclate-leg')
        is_pill=gid.startswith('pill') or gid=='numeros'
        is_title=gid=='titre'
        for el in g.iter():
            tag=el.tag.replace(NS,'')
            cls=el.get('class','')
            if tag=='text':
                el.set('class',(cls+' anim-fade').strip());el.set('style',(el.get('style','')+f';animation-delay:{t+0.5:.2f}s').strip(';'))
            elif tag in SHAPES:
                if is_pill or el.get('stroke-dasharray'):
                    el.set('class',(cls+' anim-fade').strip());el.set('style',(el.get('style','')+f';animation-delay:{t+0.3:.2f}s').strip(';'))
                elif ('o' in cls.split() or 't' in cls.split() or 'l' in cls.split() or 'dl' in cls.split() or 'ex' in cls.split() or 'ld' in cls.split()):
                    el.set('class',(cls+' anim-draw').strip());el.set('pathLength','1')
                    if 'dl' in cls.split():
                        el.set('style',f'animation:draw 1.1s ease-in-out {t:.2f}s forwards,mk 1.1s steps(1,end) {t:.2f}s forwards;marker-start:none;marker-end:none')
                    else:
                        el.set('style',f'animation-delay:{t:.2f}s')
                else:
                    el.set('class',(cls+' anim-fade').strip());el.set('style',(el.get('style','')+f';animation-delay:{t+0.8:.2f}s').strip(';'))
        t+=0.25 if (is_leg or is_title or is_pill) else step
    tree.write(dst,encoding='utf-8',xml_declaration=True)
    print(dst,f'{t:.1f}s')
for n in ['01_dalle_alveolee_coupe','02_dalle_alveolee_3d','03_poutrelle_entrevous_coupe','04_plancher_eclate','05_elements_3d']:
    run(f'svg/{n}.svg',f'svg/animated/{n}_anime.svg')
