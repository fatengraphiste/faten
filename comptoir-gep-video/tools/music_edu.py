#!/usr/bin/env python3
"""Musique douce « éducative » (pad + arpèges pincés), 88 BPM, 68 s -> assets/music_edu.wav"""
import numpy as np, wave
SR = 44100; BPM = 88; DUR = 68.0
beat = 60 / BPM
n = int(SR * DUR); out = np.zeros(n)
def note_freq(m): return 440 * 2 ** ((m - 69) / 12)
chords = [(48, [60, 64, 67, 71]), (45, [57, 60, 64, 69]), (41, [60, 64, 65, 69]), (43, [59, 62, 67, 71])]  # Cmaj7, Am7, Fmaj7, G
bar = 4 * beat
def add(sig, t0):
    i = int(t0 * SR); j = min(n, i + len(sig))
    if i < n: out[i:j] += sig[: j - i]
def pluck(f, dur=1.4, amp=0.22):
    t = np.arange(int(SR * dur)) / SR
    env = np.exp(-t * 3.2) * (1 - np.exp(-t * 400))
    y = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 6) + 0.12 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 9)
    return amp * env * y
def pad(freqs, dur, amp=0.05):
    t = np.arange(int(SR * dur)) / SR
    env = np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 1.2)
    y = sum(np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 1.004 * t) for f in freqs)
    return amp * env * y / len(freqs)
rng = np.random.default_rng(3)
nb = int(DUR / (2 * bar)) + 1
for b in range(nb):
    root, ch = chords[b % 4]; t0 = b * 2 * bar
    add(pad([note_freq(root - 12)] + [note_freq(m - 12) for m in ch[:3]], 2 * bar + 0.8), t0)
    add(pluck(note_freq(root - 12), 2.2, 0.28), t0)                      # basse
    for s in range(16):                                                    # arpège en croches
        m = ch[[0, 1, 2, 3, 2, 1, 2, 3][s % 8]] + (12 if s % 8 in (3, 7) else 0)
        if rng.random() < 0.82: add(pluck(note_freq(m), 1.1, 0.16 + 0.05 * (s % 4 == 0)), t0 + s * beat / 2)
fade = np.minimum(1, np.arange(n) / (SR * 1.5)) * np.minimum(1, (n - np.arange(n)) / (SR * 3))
out *= fade; out = out / (np.abs(out).max() + 1e-9) * 0.7
with wave.open("assets/music_edu.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype("<i2").tobytes())
print("ok", n / SR)
