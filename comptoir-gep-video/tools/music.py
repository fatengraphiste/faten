import numpy as np, wave
SR=44100;DUR=72.5;N=int(SR*DUR);BPM=112;B=60/BPM
rng=np.random.default_rng(11)
out=np.zeros(N,dtype=np.float64)
def add(sig,t):
    i=int(t*SR)
    if i>=N:return
    e=min(N,i+len(sig));out[i:e]+=sig[:e-i]
def env(n,a,d):
    t=np.arange(n)/SR;return np.minimum(1,t/max(a,1e-4))*np.exp(-t/d)
def lp(x,fc):
    a=np.exp(-2*np.pi*fc/SR);k=(1-a)*a**np.arange(int(SR*0.01));return np.convolve(x,k)[:len(x)]
def kick():
    n=int(.28*SR);t=np.arange(n)/SR;f=45+110*np.exp(-t/0.035);ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t/0.13)*0.95
def clap():
    n=int(.22*SR);x=rng.standard_normal(n);x=x-lp(x,900);t=np.arange(n)/SR
    e=np.exp(-t/0.06);return x*e*0.33
def hat(open_=False):
    n=int((.16 if open_ else .05)*SR);x=rng.standard_normal(n);x=x-lp(x,6000);t=np.arange(n)/SR
    return x*np.exp(-t/(0.05 if open_ else 0.012))*0.16
def tone(f,dur,wave='saw',a=.005,d=.2,vol=.3,cut=None):
    n=int(dur*SR);t=np.arange(n)/SR;ph=2*np.pi*f*t
    if wave=='saw':x=2*((f*t)%1)-1
    elif wave=='tri':x=2*np.abs(2*((f*t)%1)-1)-1
    else:x=np.sin(ph)
    if cut:x=lp(x,cut)
    return x*env(n,a,d)*vol
def riser(dur,vol=.35):
    n=int(dur*SR);x=rng.standard_normal(n);t=np.linspace(0,1,n)
    # rising band by mixing hp noise whose gain grows
    y=(x-lp(x,400+3500*t.mean()))*t**2.2
    return y*vol
midi=lambda m:440*2**((m-69)/12)
# progression Am F C G, 1 bar = 4 beats
chords=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]
bass_root=[33,29,36,31]  # A1 F1 C2 G1
arp_scale=[69,72,74,76,79,76,74,72]
def section_on(t):
    # returns instruments active
    if t<8.4:   return dict(kick=t>4.4,clap=False,hat=t>2.9,bass=t>4.4,arp=False,pad=True)
    if t<59.4:  return dict(kick=True,clap=True,hat=True,bass=True,arp=(t>16.2),pad=True)
    if t<63.3:  return dict(kick=False,clap=False,hat=True,bass=True,arp=True,pad=True)
    return dict(kick=True,clap=True,hat=True,bass=True,arp=True,pad=t<70.5)
nb=int(DUR/B)+1
for b in range(nb):
    t=b*B;bar=(b//4)%4;beat=b%4;s=section_on(t)
    if s['kick']:add(kick(),t)
    if s['clap'] and beat in(1,3):add(clap(),t)
    if s['hat']:
        add(hat(),t);add(hat(),t+B/2) if t>8.4 else None
        if beat in(1,3) and t>8.4:add(hat(True),t+B/2)
    if s['bass']:
        r=midi(bass_root[bar])
        add(tone(r,B*.9,'sine',.004,.35,.55,300),t)
        if t>8.4:add(tone(r*2,B*.4,'saw',.004,.12,.18,700),t+B*.5)
    if s['arp']:
        for k in range(2):
            m=arp_scale[(b*2+k)%8] if ((b*2+k)%3!=2) else None
            if m:add(tone(midi(m),B*.5,'tri',.003,.18,.20,3500),t+k*B/2)
    if s['pad'] and beat==0:
        for m in chords[bar]:add(tone(midi(m),B*4,'saw',.35,2.5,.09,1200),t)
# risers into sections and final hit
add(riser(1.6),6.85);add(riser(1.3),58.0);add(riser(1.6),61.7)
add(kick()*1.1,63.3);add(kick()*1.1,8.45)
# end: fade tail
fade=np.ones(N);te=int(3.0*SR);fade[-te:]=np.linspace(1,0,te)**1.5;out*=fade
out=np.tanh(out*1.3)/np.tanh(1.3)
out/=np.max(np.abs(out))/0.9
pcm=(out*32767).astype(np.int16)
with wave.open('assets/music.wav','wb') as w:
    w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
print('music ok',DUR,'s',BPM,'bpm')
