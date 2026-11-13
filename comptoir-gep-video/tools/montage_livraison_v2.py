#!/usr/bin/env python3
"""Montage livraison v2 : base vidéo étalonnée + xfade discrets + audio (voix, musique, whoosh).
Sorties : remotion/public/liv_base.mp4 (sans texte) et /tmp/foot/out/liv_audio.m4a.
Ensuite : Remotion rend les textes animés sur la base, puis tools/liv_final.sh assemble."""
import os, subprocess, wave, numpy as np

F = "/tmp/foot"; L = F + "/lrf"; O = F + "/out"; os.makedirs(O, exist_ok=True)
REPO = "/home/user/faten/comptoir-gep-video"
VOICE = "/root/.claude/uploads/52174de5-6caf-55ef-ac28-58080d10148d/c1c04cd0-voix_off_videi_mou9awel.mp3"
W, H, FPS = 1080, 1920, 30
TOTAL = 33.13
XD = 0.30  # durée des fondus

# (fichier, début source, durée d'affichage, type d'étalonnage)
SEG = [
    (F + "/deux.mp4",    0.0, 4.0,  "ai"),     # 0-4   hook
    (F + "/cgsamedi.mp4", 15.0, 3.0, "cg"),    # 4-7   camion + dalle alvéolée
    (F + "/d0488.mp4",   1.5, 2.2,  "drone"),  # 7-9.2 vue drone en contre-plongée (remplace le plan avec texte)
    (F + "/cgsamedi.mp4", 18.0, 2.0, "cg"),    # alvéoles
    (L + "/DJI_20250627102826_0470_D.LRF.mp4", 0.5, 2.0, "drone"),  # livraison poutrelles
    (F + "/cgsamedi.mp4", 12.0, 1.8, "cg"),    # dalle levée à la grue
    (F + "/d0512.mp4",   1.0, 2.0,  "drone"),  # chariot télescopique
    (F + "/d0500.mp4",   0.4, 3.9,  "drone"),  # travail dessous (remplace le plan usine 19-21 s)
    (F + "/deux.mp4",    5.7, 3.95, "ai"),     # poignée de main
    (F + "/plan4.mp4",   2.5, 3.32, "ai"),     # projets / ربح صافي
    (F + "/final.mp4",   0.0, 4.96, "ai"),     # plan final
]
# étalonnage par type : saturation, contraste, luminosité, gamma
GRADE = {
    "ai":    dict(s=0.86, c=1.04, b=0.00, g=1.00),
    "cg":    dict(s=0.92, c=1.06, b=0.01, g=1.02),
    "drone": dict(s=1.00, c=1.10, b=0.02, g=0.96),
}
# look commun : ombres bleu marine, hautes lumières légèrement chaudes, léger vignettage
LOOK = ("colorbalance=rs=-0.02:gs=-0.01:bs=0.07:rm=-0.01:bm=0.04:rh=0.03:gh=0.01:bh=-0.02,"
        "curves=all='0/0.02 0.5/0.5 1/0.98',vignette=PI/6")

cuts = [0.0]
for s in SEG: cuts.append(round(cuts[-1] + s[2], 3))
cuts[-1] = TOTAL
print("cuts", cuts)

TRANS = ["wipeleft", "smoothleft", "slideup", "circleopen", "wiperight", "zoomin",
         "slidedown", "wipeup", "smoothright", "circleopen"]

# 1) segments (prolongés de XD pour le fondu)
for i, (f, ss, d, g) in enumerate(SEG):
    out = f"{O}/v2seg{i}.mp4"
    gp = GRADE[g]; dur = d + (XD if i < len(SEG) - 1 else 0)
    vf = (f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
          f"scale=eval=frame:w='{W}*(1+0.05*t/{d})':h='{H}*(1+0.05*t/{d})',crop={W}:{H},fps={FPS},"
          f"eq=saturation={gp['s']}:contrast={gp['c']}:brightness={gp['b']}:gamma={gp['g']},{LOOK},format=yuv420p")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(ss), "-t", str(dur), "-i", f, "-an", "-vf", vf,
                    "-c:v", "libx264", "-crf", "16", "-preset", "veryfast", out], check=True)

# 2) chaîne xfade : coupe réelle à cuts[k], fondu centré (démarre XD/2 avant)
inp = []; fc = []
for i in range(len(SEG)): inp += ["-i", f"{O}/v2seg{i}.mp4"]
cur = "0:v"; acc = SEG[0][2] + XD  # durée cumulée de la sortie courante
for k in range(1, len(SEG)):
    off = cuts[k] - XD / 2
    t = TRANS[(k - 1) % len(TRANS)]
    fc.append(f"[{cur}][{k}:v]xfade=transition={t}:duration={XD}:offset={off:.3f}[x{k}]")
    cur = f"x{k}"
fc = ";".join(fc)
subprocess.run(["ffmpeg", "-v", "error", "-y"] + inp + ["-filter_complex", fc, "-map", f"[{cur}]", "-t", str(TOTAL),
                "-c:v", "libx264", "-crf", "16", "-preset", "veryfast", "-pix_fmt", "yuv420p",
                REPO + "/remotion/public/liv_base.mp4"], check=True)

# 3) audio : whoosh doux à chaque coupe, musique ducked, voix
SR = 44100
rng = np.random.default_rng(11)
def whoosh(dur=0.55):
    n = int(SR * dur); t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2.0
    fcut = 250 + 4500 * (t / dur) ** 1.5
    y = np.zeros(n); lp = 0.0
    for i in range(n):
        a = min(0.99, 2 * np.pi * fcut[i] / SR); lp += a * (noise[i] - lp); y[i] = noise[i] - lp
    y *= env
    return y / (np.abs(y).max() + 1e-9)
wh = whoosh(); sfx = np.zeros(int(SR * (TOTAL + 1)))
for T in cuts[1:-1]:
    s = int(SR * (T - 0.3)); sfx[s:s + len(wh)] += wh * 0.42
with wave.open(O + "/sfx2.wav", "wb") as w_:
    w_.setnchannels(1); w_.setsampwidth(2); w_.setframerate(SR)
    w_.writeframes((np.clip(sfx, -1, 1) * 32767).astype("<i2").tobytes())

fcA = (f"[0:a]aresample={SR},aformat=channel_layouts=stereo,apad,atrim=0:{TOTAL},asplit[v1][v2];"
       f"[1:a]aresample={SR},aformat=channel_layouts=stereo,atrim=0:{TOTAL},volume=0.5[m1];"
       f"[m1][v1]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[md];"
       f"[2:a]aresample={SR},aformat=channel_layouts=stereo,atrim=0:{TOTAL}[sx];"
       f"[v2][md][sx]amix=inputs=3:normalize=0:weights=1.6 1 0.9,afade=t=out:st={TOTAL-0.6}:d=0.6[a]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", VOICE, "-i", REPO + "/assets/music.wav", "-i", O + "/sfx2.wav",
                "-filter_complex", fcA, "-map", "[a]", "-t", str(TOTAL), "-c:a", "aac", "-b:a", "192k",
                O + "/liv_audio.m4a"], check=True)
print("OK")
