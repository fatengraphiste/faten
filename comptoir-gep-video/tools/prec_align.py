#!/usr/bin/env python3
"""Voix finale = voix d'origine avec le passage 47.90-51.40 s remplacé par l'extrait « partie exemple ».
Alignement texte -> temps : poids en caractères sur le temps de parole, calé sur les pauses (fins de phrases)."""
import re, subprocess, json, sys
U = "/root/.claude/uploads/52174de5-6caf-55ef-ac28-58080d10148d/"
V1 = U + "cab37818-precontarinte_2mezen.mp3"; V2 = U + "f991e3c1-vois_partie_exemple.mp3"
OUT = "/tmp/foot/out/prec_voice.wav"
# 1) voix combinée
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", V1, "-i", V2, "-filter_complex",
  "[0:a]atrim=0:47.90,asetpts=N/SR/TB[a];[1:a]asetpts=N/SR/TB[b];[0:a]atrim=51.40,asetpts=N/SR/TB[c];[a][b][c]concat=n=3:v=0:a=1[o]",
  "-map", "[o]", "-ar", "44100", "-ac", "1", OUT], check=True)
# 1b) remplacement des mots « des câbles en aciers précontraints » (15.54-16.75) et « fissuration » (34.59-35.17)
import numpy as np, wave
CLIP = U + "28ceb5aa-fissuration-des_cables_en_aciers_pr_contraints.mp3"
def load(path):
    return np.frombuffer(subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "44100", "-"]), dtype=np.float32).copy()
SR = 44100
y = load(OUT); c = load(CLIP)
rms = lambda a: float(np.sqrt(np.mean(a ** 2)) + 1e-9)
def splice(y, a, b, new, fade=0.006):
    ia, ib = int(a * SR), int(b * SR); new = new * (rms(y[ia:ib]) / rms(new)); n = int(fade * SR)
    ramp = np.linspace(0, 1, n)
    new = new.copy(); new[:n] *= ramp; new[-n:] *= ramp[::-1]
    return np.concatenate([y[:ia], new, y[ib:]])
A = c[int(0.0 * SR):int(1.27 * SR)]            # « fissuration »
B = c[int(1.87 * SR):int(3.22 * SR)]           # « des câbles en aciers précontraints »
y = splice(y, 34.59, 35.17, A)                 # d'abord le plus tardif (les indices antérieurs ne bougent pas)
y = splice(y, 15.54, 16.75, B)
with wave.open(OUT, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(y, -1, 1) * 32767).astype("<i2").tobytes())
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", OUT]))
o = subprocess.run(["ffmpeg", "-hide_banner", "-i", OUT, "-af", "silencedetect=noise=-30dB:d=0.14", "-f", "null", "-"], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", o)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", o)]
sil = list(zip(st, en[:len(st)])) + ([(st[-1], dur)] if len(st) > len(en) else [])
sp = []; t = 0.0
for a, b in sil:
    if a > t + 0.05: sp.append((t, a))
    t = b
if t < dur - 0.05: sp.append((t, dur))
tot = sum(b - a for a, b in sp)
def at(frac):
    x = frac * tot
    for a, b in sp:
        if x <= b - a: return a + x
        x -= b - a
    return dur
PH = [
 ("title", "شنوة هي la précontrainte"), ("arme", "الـ béton armé يتحمل compression كبيرة"), ("fiss", "أما ضعيف و يشقق كي يتجبد ولا يهز des charges كبار"),
 ("trac", "وهنا نحكيو على résistance à la traction"), ("sol1", "باش نحلو هالمشكلة"), ("sol2", "جات الـ béton précontraint"), ("how", "كيفاش تصير"),
 ("ins1", "في عوض نحطوا حديد عادي"), ("ins2", "ندخلوا فيه des cable acier précontraint"), ("pull", "نجبدوا les câbles"), ("tens", "وهذي إلي نسميوها la mise en tension"),
 ("pour", "ونصبوا عليهم ال béton"), ("cut1", "كي يشيح الـ béton"), ("cut2", "نقصوا les cables مل اجناب"), ("eff", "هنا يصير الـ effet"), ("back", "يحبوا يرجعوا لطولهم الأصلي"),
 ("comp0", "كي يرجعوا"), ("comp1", "يوليو يكبسوا عل الـ Béton منداخل بالقوي"), ("comp2", "يعملوا compression"), ("hk", "هكا"), ("zero0", "الـ béton يولي ديما مكبوس في بعضو"), ("zero", "zéro fissuration"),
 ("load1", "ويولي ينجم يهز أكثر charge"), ("load2", "على مسافات طويلة"), ("load3", "يعني les grandes portées"), ("load4", "من غير حتى عرصة في الوسط"),
 ("more", "باش تفهمها أكثر"), ("hands1", "اعمل روحك باش تهز صف متاع كتب بيديك الزوز"), ("hands2", "من غير داعم من لوطا"),
 ("press1", "وتكبسهم في بعضهم"), ("press2", "الكتب باش يلصقوا"), ("press3", "وتنجم تهزهم الكل كأنهم قطعة وحدة"), ("exact", "هذا بالضبط شنوة تعمل la précontrainte"),
 ("rec1", "les Cables يكبسوا الـ béton من داخل"), ("rec2", "كيما صار معاك"), ("rec3", "تكبس الكتب باش ما يطيحوش"), ("end", "وهكة نربحو portée طويلة ومساحات مفتوحة"),
]
ch = [len(re.sub(r"[\W_]", "", t)) for _, t in PH]; n = len(PH); m = len(sp)
rate = tot / sum(ch)
INF = 1e18
# DP : chaque segment de parole reçoit 1..3 phrases consécutives (coût = écart durée/poids)
dp = [[INF] * (n + 1) for _ in range(m + 1)]; bk = [[0] * (n + 1) for _ in range(m + 1)]; dp[0][0] = 0
cs = [0]
for c in ch: cs.append(cs[-1] + c)
for i in range(1, m + 1):
    d = sp[i - 1][1] - sp[i - 1][0]
    for j in range(1, n + 1):
        for kk in range(1, 4):
            if j - kk < 0 or dp[i - 1][j - kk] >= INF: continue
            cost = dp[i - 1][j - kk] + (d - rate * (cs[j] - cs[j - kk])) ** 2
            if cost < dp[i][j]: dp[i][j] = cost; bk[i][j] = kk
# la voix peut avoir plus de segments que de phrases : on autorise des segments vides (saut) -> repli simple si échec
res = []
i, j = m, n
if dp[m][n] >= INF:
    raise SystemExit("DP infeasible: m=%d n=%d" % (m, n))
asg = []
while i > 0:
    kk = bk[i][j]; asg.append((i - 1, j - kk, j)); j -= kk; i -= 1
asg.reverse()
for si, a, b in asg:
    t0, t1 = sp[si]; tot_c = sum(ch[a:b]); c = 0
    for q in range(a, b):
        res.append({"k": PH[q][0], "t0": round(t0 + (t1 - t0) * c / tot_c, 2), "t1": round(t0 + (t1 - t0) * (c + ch[q]) / tot_c, 2), "seg": si}); c += ch[q]
json.dump({"dur": dur, "speech": [(round(a, 2), round(b, 2)) for a, b in sp], "chunks": res}, open("/tmp/foot/out/prec_align.json", "w"), ensure_ascii=False)
print("dur", round(dur, 2)); print([(round(a, 2), round(b, 2)) for a, b in sp])
for r in res: print(f"{r['t0']:6.2f}-{r['t1']:6.2f} {r['k']}")
