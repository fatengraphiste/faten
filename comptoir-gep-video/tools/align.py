import re,subprocess,json,sys
A='voice.mp3'
out=subprocess.run(['ffmpeg','-hide_banner','-i',A,'-af','silencedetect=noise=-34dB:d=0.12','-f','null','-'],capture_output=True,text=True).stderr
st=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',out)]
en=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',out)]
DUR=67.5004
# speech segments
segs=[];t=0.0
for s,e in zip(st,en):
    if s-t>0.05: segs.append([t,s])
    t=e
if DUR-t>0.05: segs.append([t,DUR])
# merge micro-gaps (<0.2) are already in silence list; drop speech blips <0.3
segs=[s for s in segs if s[1]-s[0]>=0.3]
# phrases from script (| = optional break, newline = sentence)
words=[]  # (text, weight, breakAfter)
for line in open('script_ar.txt',encoding='utf-8'):
    line=line.strip()
    if not line: continue
    for ph in line.split('|'):
        ph=ph.strip()
        if not ph: continue
        toks=ph.split()
        for i,w in enumerate(toks):
            end=re.search(r'[.،,:?؟!…]$',w) is not None or w.endswith('...')
            clean=re.sub(r'[ً-ْـ]','',w)
            lat=re.sub(r'[^A-Za-zéèàç]','',w)
            wt=len(lat)*0.55+ (len(re.sub(r'[^؀-ۿ]','',clean))*0.8) 
            wt=max(wt,1.2)
            words.append([w,wt,end or i==len(toks)-1])
n=len(words);m=len(segs)
tot=sum(w[1] for w in words);spk=sum(s[1]-s[0] for s in segs);k=spk/tot
pre=[0]
for w in words: pre.append(pre[-1]+w[1])
INF=1e18
dp=[[INF]*(n+1) for _ in range(m+1)];bk=[[0]*(n+1) for _ in range(m+1)]
dp[0][0]=0
for j in range(1,m+1):
    d=segs[j-1][1]-segs[j-1][0]
    for i in range(j,n+1):
        for a in range(j-1,i):
            if dp[j-1][a]>=INF: continue
            W=pre[i]-pre[a]
            c=(d-k*W)**2/(d+0.6)
            # boundary should fall at phrase end
            if i<n and not words[i-1][2]: c+=0.6
            v=dp[j-1][a]+c
            if v<dp[j][i]: dp[j][i]=v;bk[j][i]=a
assert dp[m][n]<INF
# backtrack
cuts=[];i=n
for j in range(m,0,-1):
    a=bk[j][i];cuts.append((a,i));i=a
cuts.reverse()
res=[]
for (a,b),(s0,s1) in zip(cuts,segs):
    W=pre[b]-pre[a];t=s0
    for idx in range(a,b):
        d=(s1-s0)*words[idx][1]/W
        res.append({'w':words[idx][0],'s':round(t,3),'e':round(t+d,3),'seg':len(res)})
        t+=d
    print(f"{s0:6.2f}-{s1:6.2f} ({s1-s0:4.2f}s, {b-a:2d}w) "+' '.join(w[0] for w in words[a:b]))
json.dump({'segs':segs,'words':res,'k':k},open('align.json','w'),ensure_ascii=False,indent=1)
print(len(segs),'segments',n,'words')
