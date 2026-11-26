#!/usr/bin/env python3
"""Chronologie unique de la vidéo « Montage BAB » (lue par Remotion ET par l'audio). Plans de 3 s, 120 BPM (6 temps / plan)."""
import json
PLAN = 3.0; N = 11; OUTRO = PLAN * N; TOTAL = OUTRO + 5.0
S = [PLAN * i for i in range(N)]
tl = {"plan": PLAN, "n": N, "outro": OUTRO, "total": TOTAL, "starts": S}
# P3 : premier rang (angles d'abord) ; P5 : rangs 2 à 5
order0 = [0, 4, 1, 2, 3]
row0 = [0.0] * 5
for j, k in enumerate(order0): row0[k] = round(S[2] + 1.0 + 0.25 * j, 3)
drops = [row0]
for r in range(1, 5):
    n = 5 if r % 2 == 0 else 6
    base = S[4] + 0.3 + 0.6 * (r - 1)
    drops.append([round(base + 0.08 * k, 3) for k in range(n)])
tl["drops"] = drops; tl["dropDur"] = 0.3
tl["semelle"] = [S[1] + 0.2, S[1] + 0.9]
tl["rebarV"] = [round(S[1] + 1.1 + 0.15 * k, 3) for k in range(6)]
tl["mortier"] = [S[2] + 0.2, S[2] + 0.95]
tl["about"] = [round(S[3] + 0.7, 3), round(S[3] + 1.15, 3)]
tl["rebarH"] = [round(S[5] + 0.5 + 0.45 * k, 3) for k in range(4)]
tl["cordeau"] = [S[6] + 0.4, S[6] + 1.1]
tl["level"] = [round(S[6] + 1.5, 3), round(S[6] + 2.15, 3)]
tl["wet"] = S[7] + 0.15
tl["pour"] = [S[7] + 0.9, S[7] + 2.85]
tl["vib"] = [S[8] + 0.35, S[8] + 1.9]
tl["cure"] = [round(S[8] + 2.0 + 0.12 * k, 3) for k in range(5)]
tl["result"] = S[9] + 0.55
tl["cta"] = [S[10] + 0.4, S[10] + 1.3]
json.dump(tl, open("/home/user/faten/comptoir-gep-video/remotion/src/bab/timeline.json", "w"), indent=1)
print(json.dumps(tl)[:300])
