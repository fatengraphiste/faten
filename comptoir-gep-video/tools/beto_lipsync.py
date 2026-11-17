#!/usr/bin/env python3
"""Visèmes par image (30 fps) depuis le mp3 + segments de parole -> remotion/src/beto/data.ts"""
import numpy as np, subprocess, re, json
V = "/home/user/faten/comptoir-gep-video/assets/beto_voice.mp3"
raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", V, "-f", "f32le", "-ac", "1", "-ar", "44100", "-"])
y = np.frombuffer(raw, dtype=np.float32); sr = 44100; fps = 30; dur = len(y) / sr
n = int(dur * fps) + 1; r = np.zeros(n)
for i in range(n):
    a = int(i / fps * sr); b = int((i + 1) / fps * sr); seg = y[a:b]
    r[i] = np.sqrt(np.mean(seg ** 2)) * 4 if len(seg) else 0
print("dur", round(dur, 2), "r percentiles", np.percentile(r, [10, 30, 50, 70, 90, 99]).round(2))
# lissage léger (évite le scintillement) puis visèmes selon le skill (seuils 0.10 / 0.30 / 0.65)
rs = np.convolve(r, [0.25, 0.5, 0.25], mode="same")
vis = ["closed" if v < 0.10 else "mid" if v < 0.30 else "open" if v < 0.65 else "o" for v in rs]
o = subprocess.run(["ffmpeg", "-hide_banner", "-i", V, "-af", "silencedetect=noise=-30dB:d=0.25", "-f", "null", "-"], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", o)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", o)]
sp = []; t = 0.0
for a, b in zip(st, en):
    if a > t + 0.1: sp.append([round(t, 2), round(a, 2)])
    t = b
if t < dur - 0.1: sp.append([round(t, 2), round(dur, 2)])
from collections import Counter
print(Counter(vis)); print(sp)
open("/home/user/faten/comptoir-gep-video/remotion/src/beto/data.ts", "w").write(
    "// généré par tools/beto_lipsync.py\nexport const BETO_DUR = %.3f;\nexport const VIS = %s;\nexport const SPEECH: [number, number][] = %s;\n" % (dur, json.dumps("".join({"closed": "c", "mid": "m", "open": "o", "o": "O"}[v] for v in vis)), json.dumps(sp)))
