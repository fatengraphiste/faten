#!/usr/bin/env python3
"""Audio « camion GEP » : voix2 (villes) + voix1 (signature) + musique rythmique 120 BPM calée sur les villes (temps forts à 1.85, 2.85, 3.85, 4.85 s) + SFX."""
import numpy as np, subprocess, wave
R = "/home/user/faten/comptoir-gep-video"; O = "/tmp/foot/out"; SR = 44100
V2_OFF = 4.506; END = V2_OFF + 9.95 + 0.4; TOTAL = round(END + 5, 2)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", R + "/assets/camion_voix1.mp3", "-i", R + "/assets/camion_voix2.mp3", "-filter_complex",
  "[0:a]aresample=44100,apad=pad_dur=0.3[a];[1:a]aresample=44100[b];[a][b]concat=n=2:v=0:a=1[o]", "-map", "[o]", "-ac", "1", O + "/camion_voice.wav"], check=True)
rng = np.random.default_rng(5); n = int(SR * TOTAL); mus = np.zeros(n)
BEAT = 0.5; OFF = 0.35
def add(sig, t0, g=1.0):
    i = int(t0 * SR)
    if 0 <= i < n: mus[i:i + len(sig)] += g * sig[:max(0, n - i)]
def kick():
    t = np.arange(int(SR * 0.3)) / SR; f = 45 + 110 * np.exp(-t * 28); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)
def clap():
    t = np.arange(int(SR * 0.22)) / SR; x = rng.standard_normal(len(t)); x = x - np.convolve(x, np.ones(6) / 6, mode="same"); return x * np.exp(-t * 24) * 0.55
def hat(o=False):
    t = np.arange(int(SR * (0.12 if o else 0.04))) / SR; x = rng.standard_normal(len(t)); x = x - np.convolve(x, np.ones(4) / 4, mode="same"); return x * np.exp(-t * (30 if o else 90)) * 0.3
def pluck(f, d=0.35, a=0.3):
    t = np.arange(int(SR * d)) / SR; y = np.sign(np.sin(2 * np.pi * f * t)) * 0.4 + np.sin(2 * np.pi * f * t) * 0.6; return a * y * np.exp(-t * 9)
def bass(f, d=0.4):
    t = np.arange(int(SR * d)) / SR; return 0.55 * np.sin(2 * np.pi * f * t) * np.exp(-t * 5)
K, C, H, HO = kick(), clap(), hat(), hat(True)
NOTES = [110, 110, 165, 110, 131, 131, 196, 147]            # basse (La mineur)
ARP = [440, 523.25, 659.25, 523.25, 587.33, 659.25, 783.99, 659.25]
nb = int((TOTAL - OFF) / BEAT) + 1
for b in range(nb):
    t = OFF + b * BEAT
    add(K, t, 0.9)
    if b % 2 == 1: add(C, t, 0.8)
    add(H, t + BEAT / 2, 0.8)
    if b % 4 == 3: add(HO, t + BEAT / 2, 0.8)
    add(bass(NOTES[b % 8]), t, 0.8)
    add(pluck(ARP[b % 8], 0.3, 0.22), t + BEAT / 2, 0.8)
    if b % 2 == 0: add(pluck(ARP[(b + 3) % 8] * 2, 0.25, 0.12), t, 0.8)
# montée avant la signature et coup à l'arrivée de la phrase finale
t = np.arange(int(SR * 1.2)) / SR; riser = rng.standard_normal(len(t)) * (t / 1.2) ** 2 * 0.35; riser = riser - np.convolve(riser, np.ones(10) / 10, mode="same"); add(riser, V2_OFF - 0.95, 0.7)
imp = np.sin(2 * np.pi * np.cumsum(70 + 90 * np.exp(-np.arange(int(SR * 0.7)) / SR * 6)) / SR) * np.exp(-np.arange(int(SR * 0.7)) / SR * 4); add(imp, V2_OFF + 0.05, 1.0); add(imp, 0.1, 0.8); add(riser[::-1], 0.1, 0.6)
add(imp, END, 1.0)
mus *= np.minimum(1, np.arange(n) / (SR * 0.2)) * np.minimum(1, (n - np.arange(n)) / (SR * 1.5)); mus = mus / (np.abs(mus).max() + 1e-9) * 0.8
def pop(f0, f1, d=0.12, a=0.45):
    m = int(SR * d); tt = np.arange(m) / SR; ff = f0 + (f1 - f0) * (tt / d); return a * np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-tt * 20)
sfx = np.zeros(n)
for t0 in [V2_OFF + x for x in (0.8, 1.84, 2.84, 3.81, 4.85)]: i = int((t0 + 0.05) * SR); sfx[i:i + int(SR * 0.12)] += pop(500, 1500)
for t0 in [V2_OFF + x for x in (5.79, 6.78, 8.63)] + [0.05]: i = int(t0 * SR); sfx[i:i + int(SR * 0.12)] += pop(700, 1700, 0.12, 0.35)
for nm, arr in [("music", mus), ("sfx", sfx)]:
    with wave.open(f"{O}/camion_{nm}.wav", "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(arr, -1, 1) * 32767).astype("<i2").tobytes())
fc = (f"[0:a]aresample={SR},aformat=channel_layouts=stereo,apad,atrim=0:{TOTAL},asplit[v1][v2];"
      f"[1:a]aresample={SR},aformat=channel_layouts=stereo,atrim=0:{TOTAL},volume=0.5[m1];[m1][v1]sidechaincompress=threshold=0.03:ratio=5:attack=10:release=250[md];"
      f"[2:a]aresample={SR},aformat=channel_layouts=stereo,atrim=0:{TOTAL}[sx];"
      f"[v2][md][sx]amix=inputs=3:normalize=0:weights=1.6 1.1 0.8,afade=t=out:st={TOTAL-1.2}:d=1.2[a]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", O + "/camion_voice.wav", "-i", O + "/camion_music.wav", "-i", O + "/camion_sfx.wav", "-filter_complex", fc, "-map", "[a]", "-t", str(TOTAL), "-c:a", "aac", "-b:a", "192k", O + "/camion_audio.m4a"], check=True)
print("ok", TOTAL)
