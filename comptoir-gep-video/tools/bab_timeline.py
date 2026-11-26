#!/usr/bin/env python3
"""Chronologie « Montage BAB » v2 : calée sur la voix off (assets/bab_voix.mp3, 11 phrases).
La voix est découpée par phrase, légèrement accélérée (x1.06) et réassemblée avec 0.16 s d'écart pour tenir ≤ 40 s avec l'outro.
Sortie : remotion/src/bab/timeline.json (lu par Remotion ET par tools/bab_audio.py)."""
import json
R = "/home/user/faten/comptoir-gep-video"
SRC = [(0.0, 4.28), (4.56, 7.71), (8.09, 12.04), (12.44, 14.23), (14.57, 17.84), (18.23, 19.92), (20.27, 22.63), (22.99, 26.32), (26.59, 29.30), (29.63, 34.11), (34.42, 37.64)]
SP, G, L0, TAILCUT = 1.06, 0.16, 0.2, 0.45
OUTRO_LEN = 4.8
N = len(SRC)
vs, ve, cur = [], [], L0
for a, b in SRC:
    vs.append(round(cur, 3)); ve.append(round(cur + (b - a) / SP, 3)); cur = ve[-1] + G
S = [0.0] + [round(ve[i] + G / 2, 3) for i in range(N - 1)]
OUTRO = round(ve[-1] + TAILCUT, 3); TOTAL = round(OUTRO + OUTRO_LEN, 3)
E = S[1:] + [OUTRO]; D = [round(E[i] - S[i], 3) for i in range(N)]
tl = {"n": N, "outro": OUTRO, "total": TOTAL, "starts": S, "lens": D, "voiceStart": vs, "voiceEnd": ve, "src": SRC, "speed": SP}
def sp(i, f): return round(S[i] + f, 3)
# P1 semelle + 4 aciers en attente
tl["semelle"] = [sp(1, 0.15), sp(1, 0.75)]
tl["rebarV"] = [round(S[1] + 1.15 + (D[1] - 1.15 - 0.35) * k / 3, 3) for k in range(4)]
# P2 mortier + 2 blocs d'angle ; P3 blocs d'about surlignés + 2 blocs courants ; P4 rangs 2 à 5
tl["mortier"] = [sp(2, 0.3), sp(2, 1.1)]
land = [[0.0] * 4, [0.0] * 5, [0.0] * 4, [0.0] * 5, [0.0] * 4]
land[0][0] = sp(2, D[2] * 0.5); land[0][3] = sp(2, D[2] * 0.82)
land[0][1] = sp(3, 1.0); land[0][2] = sp(3, 1.55)
for r in range(1, 5):
    base = S[4] + 0.55 + (D[4] - 1.2) * (r - 1) / 4
    for k in range(len(land[r])): land[r][k] = round(base + 0.1 * k, 3)
tl["land"] = land; tl["travel"] = 0.42
tl["about"] = [sp(3, 0.2), sp(3, 0.55)]
tl["rebarH"] = [round(S[5] + 0.45 + (D[5] - 0.45 - 0.35) * k / 3, 3) for k in range(4)]
tl["cordeau"] = [sp(6, 0.25), sp(6, 0.85)]
tl["level"] = [sp(6, 1.35), sp(6, 2.05)]
tl["wet"] = sp(7, 0.1)
tl["pour"] = [sp(7, 0.95), round(S[7] + D[7] - 0.25, 3)]
tl["vib"] = [sp(8, 0.2), sp(8, 0.2 + D[8] * 0.5)]
tl["cure"] = [round(S[8] + D[8] * 0.55 + 0.16 * k, 3) for k in range(5)]
tl["result"] = sp(9, 1.0)
tl["cta"] = [sp(10, 0.3), sp(10, D[10] * 0.55)]
json.dump(tl, open(R + "/remotion/src/bab/timeline.json", "w"), indent=1)
print("plans", D); print("outro", OUTRO, "total", TOTAL)
