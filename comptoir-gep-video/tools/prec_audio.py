#!/usr/bin/env python3
"""Audio vidéo précontrainte : voix + musique (ducking) + whooshes discrets aux changements de plan."""
import numpy as np, wave, subprocess
R = "/home/user/faten/comptoir-gep-video"; O = "/tmp/foot/out"
VOICE = R + "/assets/prec_voice.wav"
import json
_B = json.load(open('/tmp/foot/out/prec_bounds.json'))
TOTAL = round(_B['dur'] + 0.1 + 5, 2); SR = 44100
CUTS = _B['B'][1:]
rng = np.random.default_rng(5)
def whoosh(dur=0.5):
    n = int(SR * dur); t = np.arange(n) / SR; noise = rng.standard_normal(n)
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2; fc = 300 + 3800 * (t / dur) ** 1.5
    y = np.zeros(n); lp = 0.0
    for i in range(n):
        a = min(0.99, 2 * np.pi * fc[i] / SR); lp += a * (noise[i] - lp); y[i] = noise[i] - lp
    y *= env; return y / (np.abs(y).max() + 1e-9)
wh = whoosh(); sfx = np.zeros(int(SR * (TOTAL + 1)))
for T in CUTS:
    i = int(SR * (T - 0.3)); sfx[i:i + len(wh)] += wh * 0.3
with wave.open(O + "/prec_sfx.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(sfx, -1, 1) * 32767).astype("<i2").tobytes())
fc_ = (f"[0:a]aresample={SR},aformat=channel_layouts=stereo,apad,atrim=0:{TOTAL},asplit[v1][v2];"
       f"[1:a]aresample={SR},aformat=channel_layouts=stereo,atrim=0:{TOTAL},volume=0.7[m1];"
       f"[m1][v1]sidechaincompress=threshold=0.03:ratio=7:attack=20:release=500[md];"
       f"[2:a]aresample={SR},aformat=channel_layouts=stereo,atrim=0:{TOTAL}[sx];"
       f"[v2][md][sx]amix=inputs=3:normalize=0:weights=1.6 1.1 0.8,afade=t=out:st={TOTAL-1.2}:d=1.2[a]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", VOICE, "-i", R + "/assets/music_eleven_edu.mp3", "-i", O + "/prec_sfx.wav", "-filter_complex", fc_,
                "-map", "[a]", "-t", str(TOTAL), "-c:a", "aac", "-b:a", "192k", O + "/prec_audio.m4a"], check=True)
print("ok")
