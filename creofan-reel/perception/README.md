# Perception Inversion — « الإطار يقود العقل »

Vidéo de 15,36 s (32 temps à 125 BPM), 1080×1920, 60 i/s, sans coupe ni fondu.

- `perception.template.html` : le code (canvas, `window.seek(t)`, audio Web Audio)
- `build.py` : assemble `perception.html` autonome (polices Salma + Poppins et logo intégrés en base64)
- `render.mjs` : rendu Playwright (3 sous-images par image) + ffmpeg `tmix` + encodage H.264/AAC

```
python3 build.py
node render.mjs --audit   # images clés → out/audit-*.png
node render.mjs           # → out/perception.mp4
```

Si Playwright n'est pas trouvé : `PLAYWRIGHT_PATH=/chemin/vers/node_modules/playwright node render.mjs`
