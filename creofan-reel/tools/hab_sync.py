#!/usr/bin/env python3
"""Synchro labiale de Habouba : usage  python3 tools/hab_sync.py chemin/voix.mp3
Écrit public/habouba/voix.mp3 et src/habouba/habData.ts (enveloppe RMS 30 i/s + plans calés sur les pauses)."""
import subprocess, sys, re, shutil, numpy as np
src = sys.argv[1]
shutil.copy(src, "public/habouba/voix.mp3")
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", src, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
dur = len(a) / 16000
n = int(dur * 30)
env = []
for f in range(n):
    seg = a[int(f * 16000 / 30):int((f + 1) * 16000 / 30)]
    env.append(float(np.sqrt(np.mean(seg ** 2)) * 4) if len(seg) else 0.0)   # r = sqrt(moyenne(v²)) * 4 (méthode du skill)
m = max(env); env = [round(min(1.0, e), 3) for e in env]
# pauses (> 0,25 s sous -34 dB) → bornes des plans
out = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", "silencedetect=noise=-34dB:d=0.25", "-f", "null", "-"], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", out)]
en = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", out)]
cuts = [(s + e) / 2 for s, e in zip(st, en) if 0.5 < s < dur - 0.5]
print("durée", round(dur, 2), "pauses", [round(c, 2) for c in cuts])
open("src/habouba/habEnv.json", "w").write(str(env))
print("OK : renseigner HAB_VOICE, HAB_DURATION_S, HAB_ENV et HAB_BEATS dans src/habouba/habData.ts (pauses ci-dessus)")
