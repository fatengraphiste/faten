import numpy as np, math, os
from PIL import Image, ImageDraw, ImageFilter
W,H=1080,1920; FPS=30; N=39
RED=(247,50,43)
herb=Image.open('../v/frames/f0449.jpg').convert('RGB')
ta=Image.open('txt_a.png').convert('RGBA'); tb=Image.open('txt_b.png').convert('RGBA')
cv=[Image.open(f'cv/c{i:02d}.png').convert('RGB') for i in range(1,7)]
T=(114,634,965,1285)  # target card rect in card video
def lerp(a,b,t): return a+(b-a)*t
def eio(x): return 4*x**3 if x<.5 else 1-(-2*x+2)**3/2
def eo(x): return 1-(1-x)**3
def cl(x): return max(0,min(1,x))
def rr_mask(w,h,r):
    m=Image.new('L',(w,h),0); ImageDraw.Draw(m).rounded_rectangle([0,0,w-1,h-1],r,fill=255); return m
# background: red + faint big ring like card video
bg=Image.new('RGB',(W,H),RED)
d=ImageDraw.Draw(bg); d.ellipse([-420,420,700,1540],outline=(250,90,84),width=18)
bg=bg.filter(ImageFilter.GaussianBlur(1))
portrait=(240,467,840,1453)  # 600x986 card-ish portrait
os.makedirs('tf',exist_ok=True)
for i in range(N):
    t=i/FPS
    fr=bg.copy()
    if t<0.40:   # phase A: shrink full frame into portrait card
        k=eio(t/0.40); rect=[lerp(0,portrait[j],k) if j<2 else lerp((W,H)[j-2],portrait[j],k) for j in range(4)]
        rad=lerp(0,70,k); whiten=0; tilt=-3*math.sin(k*math.pi)
    elif t<0.70: # phase B: card closes into landscape card
        k=eio((t-0.40)/0.30); rect=[lerp(portrait[j],T[j],k) for j in range(4)]
        rad=lerp(70,48,k); whiten=k; tilt=0
    else:
        rect=list(T); rad=48; whiten=1; tilt=0
    x0,y0,x1,y1=[int(round(v)) for v in rect]; w,h=x1-x0,y1-y0
    content=herb.resize((w,h),Image.LANCZOS)
    if whiten>0: content=Image.blend(content,Image.new('RGB',(w,h),(255,255,255)),whiten)
    # vibration shake during phase C
    dx=0; rot=tilt
    for b0 in (0.70,0.92):
        if b0<=t<b0+0.16:
            amp=22*(1-(t-b0)/0.16)
            dx=amp*(1 if i%2==0 else -1); rot+=1.6*(1 if i%2 else -1)*(1-(t-b0)/0.16)
    card=content.convert('RGBA'); card.putalpha(rr_mask(w,h,int(rad)))
    # shadow
    sh=Image.new('RGBA',(w+160,h+160),(0,0,0,0)); m=rr_mask(w,h,int(rad)).point(lambda v:int(v*.35))
    shc=Image.new('RGBA',(w,h),(110,0,0,255)); shc.putalpha(m); sh.paste(shc,(80,110),shc); sh=sh.filter(ImageFilter.GaussianBlur(30))
    if rot: card=card.rotate(rot,resample=Image.BICUBIC,expand=True); 
    cx,cy=(x0+x1)/2+dx,(y0+y1)/2
    frR=fr.convert('RGBA')
    if t>0.02: frR.alpha_composite(sh,(int(cx-sh.width/2),int(cy-sh.height/2+20)))
    frR.alpha_composite(card,(int(cx-card.width/2),int(cy-card.height/2)))
    # teaser texts
    oa=cl((t-0.62)/0.12); ob=cl((t-0.80)/0.12)
    fade=1-cl((t-1.12)/0.12)
    for img,o,yoff in ((ta,oa,(1-eo(oa))*-50),(tb,ob,(1-eo(ob))*50)):
        if o*fade>0:
            l=img.copy(); l.putalpha(l.getchannel('A').point(lambda v:int(v*o*fade)))
            frR.alpha_composite(l,(0,int(yoff)))
    out=frR.convert('RGB')
    # phase D: crossfade to card video (same card rect)
    if t>=1.10:
        k=cl((t-1.10)/0.18); out=Image.blend(out,cv[min(5,i-33)],eo(k))
    out.save(f'tf/t{i:03d}.png')
print('ok')
