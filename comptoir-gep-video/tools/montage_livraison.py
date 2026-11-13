#!/usr/bin/env python3
"""Montage livraison : footage + voix-off + transitions aux couleurs Comptoir GEP.
Sorties : /tmp/foot/out/main.mp4 puis comptoir-gep-livraison-9x16.mp4 (avec outro)."""
import os, subprocess, numpy as np, wave

F = "/tmp/foot"; L = F + "/lrf"; O = F + "/out"; os.makedirs(O, exist_ok=True)
VOICE = "/root/.claude/uploads/52174de5-6caf-55ef-ac28-58080d10148d/c1c04cd0-voix_off_videi_mou9awel.mp3"
REPO = "/home/user/faten/comptoir-gep-video"
NAVY, RED = "0x19226d", "0xdb4041"
W, H, FPS = 1080, 1920, 30
VOICE_END = 31.87
TOTAL = 33.13  # final plan joue 4.96 s depuis 28.17

# (fichier, début source, durée)
SEG = [
    (F + "/deux.mp4", 0.0, 4.0),                                  # 0-4  hook (0-4 s de "deux plans")
    (F + "/cgsamedi.mp4", 15.0, 3.0),                             # 4-7  arrivée camion + dalle alvéolée
    (F + "/cgsamedi.mp4", 0.0, 2.2),                              # dalles alvéolées empilées
    (F + "/cgsamedi.mp4", 18.0, 2.0),                             # alvéoles gros plan
    (L + "/DJI_20250627102826_0470_D.LRF.mp4", 0.5, 2.0),         # livraison poutrelles
    (F + "/cgsamedi.mp4", 12.0, 1.8),                             # dalle levée à la grue
    (L + "/DJI_20250627112701_0516_D.LRF.mp4", 0.5, 2.0),         # poutrelles / entrevous
    (L + "/DJI_20250627103105_0473_D.LRF.mp4", 0.5, 2.0),         # chariot télescopique
    (F + "/cgsamedi.mp4", 22.0, 1.9),                             # usine (pause)
    (F + "/deux.mp4", 5.8, 3.4),                                  # poignée de main
    (F + "/plan4.mp4", 2.0, 3.87),                                # "أزيد projets..."
    (F + "/final.mp4", 0.0, 4.96),                                # plan final
]
cuts = [0.0]
for s in SEG: cuts.append(round(cuts[-1] + s[2], 3))
cuts[-1] = TOTAL
print("cuts", cuts)

import sys
SKIPV = os.path.exists(O + '/main_v.mp4') and '--redo' not in sys.argv
# 1) segments normalisés 1080x1920 30 fps
parts = []
for i, (f, ss, d) in enumerate([] if SKIPV else SEG):
    out = f"{O}/seg{i}.mp4"
    vf = (f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
          f"scale=eval=frame:w='{W}*(1+0.06*t/{d})':h='{H}*(1+0.06*t/{d})',crop={W}:{H},fps={FPS},"
          "eq=contrast=1.05:saturation=1.08,format=yuv420p")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(ss), "-t", str(d), "-i", f, "-an",
                    "-vf", vf, "-c:v", "libx264", "-crf", "17", "-preset", "veryfast", out], check=True)
    parts.append(out)
if not SKIPV: open(O + "/list.txt", "w").write("".join(f"file '{p}'\n" for p in parts))
if not SKIPV: subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", O + "/list.txt",
                "-c", "copy", O + "/base.mp4"], check=True)

# 2) transitions : bandes rouge puis bleue, direction différente à chaque coupe
D = 0.24  # demi-durée
VAR = ["LR", "bars", "TB", "RL", "flash", "BT", "vbars", "LR", "RL", "TB", "bars"]
inputs = ["-i", O + "/base.mp4"]
chains, last, n = [], "0:v", 1

def sweep(T, lead, axis, sign, size):
    # position -size*sign -> +size*sign, couvre l'écran (pos=0) à T-lead
    a = f"(t-({T}-{D}-{lead}))/{2*D}"
    return f"{-sign*size}+{2*sign*size}*clip({a}\\,0\\,1)"

for k, T in enumerate(cuts[1:-1]):
    v = VAR[k % len(VAR)]
    layers = []  # (couleur, lead, axis, sign, w, h, offset_other)
    if v in ("LR", "RL", "TB", "BT"):
        ax = "x" if v in ("LR", "RL") else "y"
        sg = 1 if v in ("LR", "TB") else -1
        size = W if ax == "x" else H
        layers = [(RED, 0.07, ax, sg, W, H, 0), (NAVY, 0.0, ax, sg, W, H, 0)]
    elif v == "bars":
        for j in range(3):
            c = RED if j % 2 else NAVY
            layers.append((c, 0.0, "x", 1 if j % 2 == 0 else -1, W, H // 3 + 1, j * (H // 3)))
    elif v == "vbars":
        for j in range(3):
            c = NAVY if j % 2 else RED
            layers.append((c, 0.0, "y", 1 if j % 2 == 0 else -1, W // 3 + 1, H, j * (W // 3)))
    elif v == "flash":
        layers = [("flash",)]
    for ly in layers:
        if ly[0] == "flash":
            col = f"color=c={RED}:s={W}x{H}:r={FPS}:d={TOTAL}[c{n}]"
            chains.append(col)
            chains.append(f"[c{n}]format=yuva420p,colorchannelmixer=aa=1,"
                          f"fade=t=in:st={T-0.12}:d=0.12:alpha=1,fade=t=out:st={T}:d=0.2:alpha=1[f{n}]")
            chains.append(f"[{last}][f{n}]overlay=0:0[o{n}]")
            last = f"o{n}"; n += 1
            # impact de zoom : zoom pulse léger via blanc bref
            continue
        col, lead, ax, sg, w, h, off = ly
        chains.append(f"color=c={col}:s={w}x{h}:r={FPS}:d={TOTAL}[c{n}]")
        size = w if ax == "x" else h
        full = W if ax == "x" else H
        pos = sweep(T, lead, ax, sg, full if v in ("LR", "RL", "TB", "BT") else full)
        if ax == "x":
            ov = f"overlay=x='{pos}':y={off}:eval=frame:enable='between(t,{T-D-0.1},{T+D+0.1})'"
        else:
            ov = f"overlay=x={off}:y='{pos}':eval=frame:enable='between(t,{T-D-0.1},{T+D+0.1})'"
        chains.append(f"[{last}][c{n}]{ov}[o{n}]")
        last = f"o{n}"; n += 1

# barre de progression discrète rouge en bas ? non : on garde le plan propre
fc = ";".join(chains)
if not SKIPV: subprocess.run(["ffmpeg", "-v", "error", "-y"] + inputs + ["-filter_complex", fc, "-map", f"[{last}]",
                "-t", str(TOTAL), "-c:v", "libx264", "-crf", "17", "-preset", "veryfast", "-pix_fmt", "yuv420p",
                O + "/main_v.mp4"], check=True)

# 3) audio : whoosh à chaque coupe + musique ducked + voix
SR = 44100
rng = np.random.default_rng(7)
def whoosh(dur=0.7):
    n_ = int(SR * dur); t = np.arange(n_) / SR
    noise = rng.standard_normal(n_)
    # balayage passe-bande simple par modulation de filtre à une pôle
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2.2
    fc_ = 300 + 5200 * (t / dur) ** 1.6
    y = np.zeros(n_); lp = 0.0
    for i in range(n_):
        a = min(0.99, 2 * np.pi * fc_[i] / SR)
        lp += a * (noise[i] - lp); y[i] = noise[i] - lp  # passe-haut mobile
    y *= env
    return y / (np.abs(y).max() + 1e-9)
wh = whoosh()
sfx = np.zeros(int(SR * (TOTAL + 1)))
for T in cuts[1:-1]:
    s = int(SR * (T - 0.42))
    sfx[s:s + len(wh)] += wh * 0.55
with wave.open(O + "/sfx.wav", "wb") as w_:
    w_.setnchannels(1); w_.setsampwidth(2); w_.setframerate(SR)
    w_.writeframes((np.clip(sfx, -1, 1) * 32767).astype("<i2").tobytes())

fcA = (f"[1:a]aresample={SR},aformat=channel_layouts=stereo,apad,atrim=0:{TOTAL},asplit[v1][v2];"
       f"[2:a]aresample={SR},aformat=channel_layouts=stereo,atrim=0:{TOTAL},volume=0.5[m1];"
       f"[m1][v1]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[md];"
       f"[3:a]aresample={SR},aformat=channel_layouts=stereo,atrim=0:{TOTAL}[sx];"
       f"[v2][md][sx]amix=inputs=3:normalize=0:weights=1.6 1 0.9,"
       f"afade=t=out:st={TOTAL-0.6}:d=0.6[a]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", O + "/main_v.mp4", "-i", VOICE,
                "-i", REPO + "/assets/music.wav", "-i", O + "/sfx.wav",
                "-filter_complex", fcA, "-map", "0:v", "-map", "[a]", "-t", str(TOTAL),
                "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", O + "/main.mp4"], check=True)

# 4) outro (5 s de la v4) + concat
OUT_START = 67.631
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(OUT_START), "-i", REPO + "/comptoir-gep-isometrique-v4-9x16.mp4",
                "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p", "-r", str(FPS), "-c:a", "aac", "-b:a", "192k",
                "-ar", str(SR), "-ac", "2", O + "/outro.mp4"], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", O + "/main.mp4", "-i", O + "/outro.mp4", "-filter_complex",
                "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]", "-map", "[v]", "-map", "[a]",
                "-c:v", "libx264", "-crf", "17", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                REPO + "/comptoir-gep-livraison-9x16.mp4"], check=True)
print("OK")
