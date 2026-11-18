#!/usr/bin/env python3
"""Audio Béto v2 : voix + musique rythmée (ducking) + whoosh/pop aux apparitions et aux textes"""
import subprocess, numpy as np, wave, json, re
R = "/home/user/faten/comptoir-gep-video"; O = "/tmp/foot/out"; SR = 44100
src = open(R + "/remotion/src/beto/data.ts").read()
dur = float(re.search(r"BETO_DUR = ([\d.]+)", src).group(1)); cue = json.loads(re.search(r"CUE: Record<string, \[number, number\]> = (\{.*?\});", src).group(1))
TOTAL = round(dur + 0.1 + 5, 2)
def pop(f0=500, f1=1400, d=0.13, amp=0.5):
    n = int(SR * d); t = np.arange(n) / SR; f = f0 + (f1 - f0) * (t / d); ph = 2 * np.pi * np.cumsum(f) / SR
    return amp * np.sin(ph) * np.exp(-t * 22)
sfx = np.zeros(int(SR * (TOTAL + 1)))
def put(sig, t0):
    i = int(t0 * SR); sfx[i:i + len(sig)] += sig[:max(0, len(sfx) - i)]
for t in [0.0, 1.5, 4.55]: put(pop(), t)                         # apparitions du hook
for k in ["cost", "calc", "other", "secret", "dalle", "light", "say", "yes", "chantier", "less0", "less1", "less2", "save"]: put(pop(700, 1700, 0.1, 0.3), cue[k][0] - 0.02)
with wave.open(O + "/b2_sfx.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(sfx, -1, 1) * 32767).astype("<i2").tobytes())
fc = (f"[0:a]aresample={SR},aformat=channel_layouts=stereo,apad,atrim=0:{TOTAL},asplit[v1][v2];"
      f"[1:a]aresample={SR},aformat=channel_layouts=stereo,atrim=0:{TOTAL},volume=0.55[m1];"
      f"[m1][v1]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=400[md];"
      f"[2:a]aresample={SR},aformat=channel_layouts=stereo,atrim=0:{TOTAL}[sx];"
      f"[3:a]aresample={SR},aformat=channel_layouts=stereo,volume=0.7,asplit=2[wa][wb];[wa]adelay=2400|2400[wa2];[wb]adelay=3800|3800[wb2];"
      f"[v2][md][sx][wa2][wb2]amix=inputs=5:normalize=0:weights=1.6 1.1 0.8 0.6 0.6,afade=t=out:st={TOTAL-1.2}:d=1.2[a]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", R + "/assets/beto2_voice.wav", "-i", R + "/assets/music.wav", "-i", O + "/b2_sfx.wav", "-i", R + "/assets/whoosh.wav", "-filter_complex", fc, "-map", "[a]", "-t", str(TOTAL), "-c:a", "aac", "-b:a", "192k", O + "/b2_audio.m4a"], check=True)
print("ok", TOTAL)
