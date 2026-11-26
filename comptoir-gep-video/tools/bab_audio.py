#!/usr/bin/env python3
"""Audio « Montage BAB » : musique 120 BPM qui monte en intensité avec le montage + bruitages calés sur la chronologie (remotion/src/bab/timeline.json)."""
import json, wave, subprocess, numpy as np
R = "/home/user/faten/comptoir-gep-video"; O = "/tmp/foot/out"; SR = 44100
TL = json.load(open(R + "/remotion/src/bab/timeline.json"))
TOTAL = TL["total"]; S = TL["starts"]; n = int(SR * TOTAL)
rng = np.random.default_rng(21)
def buf(): return np.zeros(n)
def put(b, sig, t, g=1.0):
    i = int(t * SR)
    if i < 0 or i >= n: return
    m = min(len(sig), n - i); b[i:i + m] += g * sig[:m]
def tt(d): return np.arange(int(SR * d)) / SR
def lp(x, a): y = np.zeros_like(x); s = 0.0
def noise(d): return rng.standard_normal(int(SR * d))
def filt_lp(x, fc):
    a = min(0.99, 2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s += a * (v - s); y[i] = s
    return y
def filt_hp(x, fc): return x - filt_lp(x, fc)
def env(d, a=0.005, k=8): t = tt(d); return np.minimum(1, t / a) * np.exp(-t * k)

# ───────────── sons ─────────────
def kick(): t = tt(0.32); f = 48 + 120 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10)
def clap(): x = filt_hp(noise(0.2), 900); return x * env(0.2, 0.002, 22) * 0.55
def hat(o=False): d = 0.14 if o else 0.045; return filt_hp(noise(d), 6000) * env(d, 0.001, 22 if o else 90) * 0.35
def clave(f=1700): t = tt(0.1); return np.sin(2 * np.pi * f * t) * np.exp(-t * 55) * 0.5
def pluck(f, d=0.32, a=0.3): t = tt(d); y = 0.6 * np.sin(2 * np.pi * f * t) + 0.3 * np.sign(np.sin(2 * np.pi * f * t)) + 0.15 * np.sin(4 * np.pi * f * t); return a * y * np.exp(-t * 9)
def bass(f, d=0.45): t = tt(d); return 0.6 * np.sin(2 * np.pi * f * t) * np.minimum(1, t / 0.005) * np.exp(-t * 4.5)
def bell(f, d=1.2, a=0.4): t = tt(d); return a * (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.76 * t) + 0.3 * np.sin(2 * np.pi * f * 5.4 * t)) * np.exp(-t * 3.2)
def pad(freqs, d=2.0, a=0.12): t = tt(d); y = sum(np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2 * t) for f in freqs); e = np.minimum(1, t / 0.25) * np.minimum(1, (d - t) / 0.4); return a * y * e / len(freqs)
def whoosh(d=0.55):
    x = noise(d); t = tt(d); out = np.zeros_like(x); s = 0.0; fc = 250 + 5200 * (t / d) ** 1.6
    for i in range(len(x)): a = min(0.99, 2 * np.pi * fc[i] / SR); s += a * (x[i] - s); out[i] = x[i] - s
    return out * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2 * 0.55
def thud(): t = tt(0.35); return np.sin(2 * np.pi * np.cumsum(60 + 80 * np.exp(-t * 25)) / SR) * np.exp(-t * 9) * 0.9 + filt_lp(noise(0.35), 500) * np.exp(-t * 18) * 0.4
def ting(f=2300, d=0.45): t = tt(d); return (np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 1.52 * t) + 0.35 * np.sin(2 * np.pi * f * 2.3 * t)) * np.exp(-t * 11) * 0.28
def clack(): t = tt(0.14); return (filt_hp(noise(0.14), 1200) * np.exp(-t * 60) * 0.55 + np.sin(2 * np.pi * 150 * t) * np.exp(-t * 45) * 0.7)
def scrape(d, fc=1800): x = filt_hp(filt_lp(noise(d), fc), 300); t = tt(d); return x * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t)) * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.08) * 0.5
def pour(d): x = filt_lp(noise(d), 900); t = tt(d); g = (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 11 * t + np.sin(t * 5)))) ; return x * g * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.2) * 1.3
def buzz(d): t = tt(d); y = (np.sign(np.sin(2 * np.pi * 96 * t)) * 0.5 + np.sin(2 * np.pi * 192 * t) * 0.3) * (0.7 + 0.3 * np.sin(2 * np.pi * 31 * t)); return (y + filt_hp(noise(d), 2500) * 0.25) * np.minimum(1, t / 0.08) * np.minimum(1, (d - t) / 0.12) * 0.32
def plink(f=1250): t = tt(0.25); return np.sin(2 * np.pi * np.cumsum(f * (1 - 0.45 * t / 0.25)) / SR) * np.exp(-t * 20) * 0.45
def bubble(f=820): t = tt(0.14); return np.sin(2 * np.pi * np.cumsum(f * (1 + 0.8 * t / 0.14)) / SR) * np.exp(-t * 22) * 0.4
def spray(d): return filt_hp(noise(d), 3500) * np.minimum(1, tt(d) / 0.05) * np.minimum(1, (d - tt(d)) / 0.2) * 0.22
def pop(f0=500, f1=1500): t = tt(0.12); return np.sin(2 * np.pi * np.cumsum(f0 + (f1 - f0) * t / 0.12) / SR) * np.exp(-t * 20) * 0.4
def twang(): t = tt(0.6); return np.sin(2 * np.pi * np.cumsum(300 + 30 * np.exp(-t * 10)) / SR) * np.exp(-t * 7) * 0.4

# ───────────── musique : 120 BPM, couches ajoutées plan par plan ─────────────
mus = buf(); B = 0.5
ROOTS = [130.81, 110.0, 87.31, 98.0]                       # Do, La, Fa, Sol (une mesure = 2 s)
CH = [[261.63, 329.63, 392.0], [220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 246.94, 293.66]]
K, C_, H, HO = kick(), clap(), hat(), hat(True)
for b in range(int(TOTAL / B)):
    t = b * B; bar = (b // 4) % 4; bi = b % 4
    if t >= S[1] and t < TL["outro"] + 0.1: put(mus, K, t, 0.95 if t >= S[2] else 0.6)
    elif t < S[1] and bi in (0, 2): put(mus, K, t, 0.45)
    if t >= S[2] and t < TL["outro"]: put(mus, H, t + B / 2, 0.85); put(mus, clave(1700 if bi % 2 else 1400), t + (B * 0.75 if bi % 2 else B * 0.25), 0.9)
    if t >= S[3] and t < TL["outro"]: put(mus, bass(ROOTS[bar]), t, 0.9); put(mus, bass(ROOTS[bar] * (1.5 if bi == 2 else 1.0)), t + B / 2, 0.55)
    if t >= S[4] and t < TL["outro"] and bi in (1, 3): put(mus, C_, t, 0.85)
    if t >= S[4] and t < TL["outro"]: put(mus, pluck(CH[bar][b % 3] * 2, 0.3, 0.2), t + B / 2, 0.9)
    if t >= S[6] and t < TL["outro"] and bi == 0: put(mus, pad(CH[bar], 2.0, 0.16), t, 1.0)
    if bi == 3 and t >= S[3]: put(mus, HO, t + B / 2, 0.8)
    if S[7] <= t < S[9]:                                   # pic : mélodie d'octave + double croche de hat
        mel = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.0, 698.46]
        put(mus, pluck(mel[b % 8], 0.36, 0.22), t, 0.9)
        put(mus, H, t + B / 4, 0.5); put(mus, H, t + B * 0.75, 0.5)
    if t >= S[9] and t < S[10] + 0.1 and bi == 0: put(mus, pad(CH[0] + [523.25], 2.0, 0.2), t, 1.0)
    if S[9] <= t < TL["outro"] and bi in (0, 2): put(mus, pluck(CH[0][(b // 2) % 3] * 2, 0.4, 0.2), t, 0.9)
# montée avant le pic et coup d'arrivée
r0 = S[7] - 0.9; x = filt_hp(noise(0.9), 1500) * (tt(0.9) / 0.9) ** 2 * 0.5; put(mus, x, r0, 0.8)
imp = thud(); put(mus, imp, S[7], 0.9); put(mus, imp, S[9] + 0.55, 1.0)
# outro : accord doux + scintillements, fondu final
put(mus, pad([261.63, 329.63, 392.0, 523.25], 4.8, 0.22), TL["outro"], 1.0)
for k in range(8): put(mus, bell(1046.5 * (1.0 + 0.25 * (k % 3)), 0.9, 0.15), TL["outro"] + 0.5 + 0.35 * k, 0.8)
fade = np.minimum(1, np.arange(n) / (SR * 0.15)) * np.minimum(1, (n - np.arange(n)) / (SR * 1.6)); mus *= fade
mus = mus / (np.abs(mus).max() + 1e-9) * 0.85

# ───────────── bruitages ─────────────
sfx = buf()
W = whoosh()
for T in S[1:] + [TL["outro"]]: put(sfx, W, T - 0.3, 0.8)
put(sfx, W, 0.05, 0.5)
# tags : petits « pop » (même liste que TAGS dans BabMontage.tsx)
TAGDT = {0: [0.6, 1.1], 1: [0.8, 1.4], 2: [0.7, 1.3], 3: [0.8, 1.2], 4: [0.6, 1.2], 5: [0.6, 1.1], 6: [0.6, 1.5], 7: [0.4, 1.2], 8: [0.6, 1.5], 9: [0.7]}
for pi, l in TAGDT.items():
    for dt in l: put(sfx, pop(520 + 60 * pi, 1500), S[pi] + dt + 0.05, 0.55)
put(sfx, scrape(0.7, 1200), TL["semelle"][0], 0.8); put(sfx, thud(), TL["semelle"][1], 0.9)
for t in TL["rebarV"]: put(sfx, ting(2100 + rng.uniform(-200, 300)), t + 0.3, 0.85)
put(sfx, scrape(TL["mortier"][1] - TL["mortier"][0], 1500), TL["mortier"][0], 1.0)
for row in TL["drops"]:
    for ts in row: put(sfx, clack() * rng.uniform(0.7, 1.0), ts + TL["dropDur"], 0.9)
for t in TL["about"]: put(sfx, bell(1318.5, 0.7, 0.35), t + 0.25, 0.8)
for k, t in enumerate(TL["rebarH"]): put(sfx, scrape(0.3, 5000), t, 0.5); put(sfx, ting(2500 + 150 * k), t + 0.38, 0.8)
put(sfx, twang(), TL["cordeau"][1], 0.9)
for t in TL["level"]: put(sfx, bubble(820), t, 0.9)
put(sfx, bell(1568, 0.9, 0.3), TL["level"][1] + 0.35, 0.8)
put(sfx, spray(0.8), TL["wet"], 0.9)
put(sfx, pour(TL["pour"][1] - TL["pour"][0]), TL["pour"][0], 0.9)
for k in range(6): put(sfx, bubble(300 + 40 * (k % 3)), TL["pour"][0] + 0.3 + 0.28 * k, 0.5)
put(sfx, buzz(TL["vib"][1] - TL["vib"][0]), TL["vib"][0], 0.9)
for k, t in enumerate(TL["cure"]): put(sfx, plink(1200 + 120 * (k % 3)), t + 0.55, 0.8)
for k, f in enumerate([523.25, 659.25, 783.99, 1046.5]): put(sfx, bell(f, 1.0, 0.3), TL["result"] + 0.08 * k, 0.9)
for k in range(6): put(sfx, bell(2093 + 180 * k, 0.5, 0.12), TL["result"] + 0.3 + 0.12 * k, 0.7)
put(sfx, bell(880, 1.1, 0.4), TL["cta"][0] + 0.2, 0.9); put(sfx, pop(700, 1900), TL["cta"][0] + 0.05, 0.7)
put(sfx, bell(1760, 0.9, 0.3), TL["cta"][1] + 0.3, 0.9); put(sfx, pop(800, 2100), TL["cta"][1] + 0.05, 0.7)
sfx = sfx / (np.abs(sfx).max() + 1e-9) * 0.95

mix = mus * 0.55 + sfx * 0.9
mix = mix / max(1.0, np.abs(mix).max() / 0.94)
for nm, a in [("bab_music", mus), ("bab_sfx", sfx), ("bab_mix", mix)]:
    with wave.open(f"{O}/{nm}.wav", "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(a, -1, 1) * 32767).astype("<i2").tobytes())
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", O + "/bab_mix.wav", "-af", "aformat=channel_layouts=stereo", "-c:a", "aac", "-b:a", "192k", O + "/bab_audio.m4a"], check=True)
print("ok", TOTAL)
