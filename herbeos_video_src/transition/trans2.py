import math, os
from PIL import Image, ImageDraw, ImageFilter
W,H=1080,1920; FPS=30; N=72; CY=960
herb=Image.open('../v/frames/f0449.jpg').convert('RGB')
bg=Image.open('bg0.png').convert('RGB')
ta=Image.open('txt_a.png').convert('RGBA'); tb=Image.open('txt_b.png').convert('RGBA')
cv=[Image.open(f'cv/c{i:02d}.png').convert('RGB') for i in range(1,7)]
T=(114,634,965,1285)
cl=lambda x:max(0,min(1,x))
eio=lambda x:4*x**3 if x<.5 else 1-(-2*x+2)**3/2
eo=lambda x:1-(1-x)**3
ei=lambda x:x**3
def back(x,c=1.6): return 1+(c+1)*(x-1)**3+c*(x-1)**2
def rr(w,h,r):
    m=Image.new('L',(max(1,w),max(1,h)),0); ImageDraw.Draw(m).rounded_rectangle([0,0,max(1,w)-1,max(1,h)-1],min(r,max(1,h)//2,max(1,w)//2),fill=255); return m
# zoomed herb (hold phase zoom)
os.makedirs('tf2',exist_ok=True)
for f in os.listdir('tf2'): os.remove('tf2/'+f)
for i in range(N):
    t=i/FPS
    fr=bg.copy().convert('RGBA')
    z=1+0.04*eo(cl(t/0.45))
    hz=herb.resize((int(W*z),int(H*z)),Image.LANCZOS).crop((int((W*z-W)/2),int((H*z-H)/2),int((W*z-W)/2)+W,int((H*z-H)/2)+H))
    if t<0.45:
        fr=hz.convert('RGBA')
    elif t<1.05:  # split close: halves squash to the centre line
        k=ei(cl((t-0.45)/0.60))
        hh=max(1,int(960*(1-k)))
        top=hz.crop((0,0,W,960)).resize((W,hh),Image.LANCZOS)
        bot=hz.crop((0,960,W,H)).resize((W,hh),Image.LANCZOS)
        # darken towards the seam
        dim=Image.new('RGB',(W,hh),(0,0,0))
        top=Image.blend(top,dim,0.35*k); bot=Image.blend(bot,dim,0.35*k)
        fr.paste(top,(0,CY-hh)); fr.paste(bot,(0,CY))
        # seam glow
        g=Image.new('RGBA',(W,60),(255,255,255,0)); ImageDraw.Draw(g).rectangle([0,26,W,34],fill=(255,255,255,int(255*k)))
        g=g.filter(ImageFilter.GaussianBlur(6)); fr.alpha_composite(g,(0,CY-30))
        # shadows cast on bg by panels
        for y0 in (CY-hh,CY+hh):
            s=Image.new('RGBA',(W,80),(0,0,0,0)); ImageDraw.Draw(s).rectangle([0,36,W,44],fill=(80,0,0,int(120*(1-k))))
            s=s.filter(ImageFilter.GaussianBlur(14)); fr.alpha_composite(s,(0,y0-40))
    else:
        # line -> card rising from the seam
        if t<1.25:
            k=eio(cl((t-1.05)/0.20)); w=int(W+(T[2]-T[0]-W)*k); h=8
        else:
            k=cl((t-1.25)/0.40); w=T[2]-T[0]; h=max(8,int((T[3]-T[1])*back(k)))
        # vibration
        dx=0; rot=0
        for b0 in (1.45,1.75,2.0):
            if b0<=t<b0+0.18:
                a=1-(t-b0)/0.18; dx=24*a*(1 if i%2 else -1); rot=1.8*a*(-1 if i%2 else 1)
        card=Image.new('RGBA',(w,h),(255,255,255,255)); card.putalpha(rr(w,h,48))
        # glow + shadow
        sh=Image.new('RGBA',(w+200,h+200),(0,0,0,0)); m=rr(w,h,48).point(lambda v:int(v*.4))
        c2=Image.new('RGBA',(w,h),(110,0,0,255)); c2.putalpha(m); sh.paste(c2,(100,125),c2); sh=sh.filter(ImageFilter.GaussianBlur(32))
        if rot: card=card.rotate(rot,resample=Image.BICUBIC,expand=True)
        cx=W/2+dx
        if h>12: fr.alpha_composite(sh,(int(cx-sh.width/2),int(CY-sh.height/2+20)))
        fr.alpha_composite(card,(int(cx-card.width/2),int(CY-card.height/2)))
        if t<1.3:
            g=Image.new('RGBA',(W,80),(255,255,255,0)); ImageDraw.Draw(g).rectangle([(W-w)//2,36,(W+w)//2,44],fill=(255,255,255,200))
            fr.alpha_composite(g.filter(ImageFilter.GaussianBlur(8)),(0,CY-40))
        oa=cl((t-1.45)/0.15); ob=cl((t-1.70)/0.15); fade=1-cl((t-2.15)/0.15)
        for img,o,yo in ((ta,oa,(1-eo(oa))*-50),(tb,ob,(1-eo(ob))*50)):
            if o*fade>0:
                l=img.copy(); l.putalpha(l.getchannel('A').point(lambda v,o=o:int(v*o*fade))); fr.alpha_composite(l,(0,int(yo)))
    out=fr.convert('RGB')
    if t>=2.20:
        k=cl((t-2.20)/0.17); out=Image.blend(out,cv[min(5,i-66)],eo(k))
    out.save(f'tf2/t{i:03d}.png')
print('ok', N/FPS)
