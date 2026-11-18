#!/usr/bin/env python3
"""Voix Béto v2 (3 parties) : visèmes par image, segments de parole et alignement texte -> temps (DP par partie)."""
import numpy as np, subprocess, re, json
R = "/home/user/faten/comptoir-gep-video"
parts = [R + "/assets/beto2_part%d.mp3" % i for i in range(3)]
dur_of = lambda f: float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]))
GAP = 0.15
offs = []; t = 0.0
for f in parts: offs.append(t); t += dur_of(f) + GAP
raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", R + "/assets/beto2_voice.wav", "-f", "f32le", "-ac", "1", "-ar", "44100", "-"])
y = np.frombuffer(raw, dtype=np.float32); sr = 44100; fps = 30; dur = len(y) / sr
n = int(dur * fps) + 1; r = np.array([np.sqrt(np.mean(y[int(i / fps * sr):int((i + 1) / fps * sr)] ** 2)) * 4 if int(i / fps * sr) < len(y) else 0 for i in range(n)])
rs = np.convolve(r, [0.25, 0.5, 0.25], mode="same")
vis = "".join("c" if v < 0.10 else "m" if v < 0.30 else "o" if v < 0.65 else "O" for v in rs)
def speech(f, off, d=0.14, minlen=0.12):
    o = subprocess.run(["ffmpeg", "-hide_banner", "-i", f, "-af", "silencedetect=noise=-30dB:d=%s" % d, "-f", "null", "-"], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", o)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", o)]
    dd = dur_of(f); sp = []; t = 0.0
    for i in range(len(st)):
        if st[i] > t + 0.02: sp.append((t, st[i]))
        t = en[i] if i < len(en) else dd
    if t < dd - 0.05: sp.append((t, dd))
    return [(a + off, b + off) for a, b in sp if b - a > minlen]
PH = [
 [("hello", "عسلامة"), ("name", "أنا بيتو"), ("listen", "ابقى اسمعني باش تتعود عليا")],
 [("cost", "انت تعرف إلي البني يتكلف برشا"), ("calc", "وتبدا حاسب حسبة"), ("other", "ديما تطلعلك حسبة أخرى"), ("sigh", "آه")],
 [("secret", "أما خليني نحكيلك على سر"), ("dalle", "راو كي تبني بالدالة الحاضرة"), ("light", "الحسبة تخف عليك برشا"), ("say", "نعرف باش تقولي"), ("same0", "ماهو نفس سوم سلعة الدالة العادية"),
  ("yes", "إي صحيح هو نفس السوم"), ("chantier", "أما تكلفة الشانطي الكل تنقص"), ("less0", "خاطر باش تخدم أقل كوفراج"), ("less1", "أقل أيام عمل"), ("less2", "وأقل يد عاملة زادة"), ("save", "هكا إنت توفر وقت"), ("cost2", "وتكلفة")],
]
cues = {}; SP = []
for pi, (f, off, ph) in enumerate(zip(parts, offs, PH)):
    sp = speech(f, off); SP += sp
    ch = [len(re.sub(r"[\W_]", "", t)) for _, t in ph]; cs = [0]
    for c in ch: cs.append(cs[-1] + c)
    m, nn = len(sp), len(ph); tot = sum(b - a for a, b in sp); rate = tot / sum(ch)
    INF = 1e18; dp = [[INF] * (nn + 1) for _ in range(m + 1)]; bk = [[0] * (nn + 1) for _ in range(m + 1)]; dp[0][0] = 0
    for i in range(1, m + 1):
        d = sp[i - 1][1] - sp[i - 1][0]
        for j in range(0, nn + 1):
            for k in range(0, 4):                       # 0 = segment vide (bruit/soupir)
                if j - k < 0 or dp[i - 1][j - k] >= INF: continue
                cost = dp[i - 1][j - k] + ((d - rate * (cs[j] - cs[j - k])) ** 2 if k else (d * 2) ** 2)
                if cost < dp[i][j]: dp[i][j] = cost; bk[i][j] = k
    print("part", pi, "segments", m, "phrases", nn, "cost", round(dp[m][nn], 3))
    i, j = m, nn; asg = []
    while i > 0:
        k = bk[i][j]; asg.append((i - 1, j - k, j)); j -= k; i -= 1
    for si, a, b in reversed(asg):
        if b == a: continue
        t0, t1 = sp[si]; tc = sum(ch[a:b]); c = 0
        for q in range(a, b):
            cues[ph[q][0]] = [round(t0 + (t1 - t0) * c / tc, 2), round(t0 + (t1 - t0) * (c + ch[q]) / tc, 2)]; c += ch[q]
for k, v in cues.items(): print(f"{v[0]:6.2f}-{v[1]:6.2f} {k}")
print("dur", round(dur, 2), "offs", [round(o, 2) for o in offs])
open(R + "/remotion/src/beto/data.ts", "w").write(
    "// généré par tools/beto2_align.py\nexport const BETO_DUR = %.3f;\nexport const VIS = %s;\nexport const SPEECH: [number, number][] = %s;\nexport const CUE: Record<string, [number, number]> = %s;\nexport const PART_OFF = %s;\n" % (dur, json.dumps(vis), json.dumps([[round(a, 2), round(b, 2)] for a, b in SP]), json.dumps(cues), json.dumps([round(o, 2) for o in offs])))
