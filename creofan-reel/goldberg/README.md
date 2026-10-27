# Zero Manual Keyframes — la bille de Creofan

Reel de 15 s, 1080×1920, 60 i/s, 126 BPM, en boucle parfaite.
Une seule bille, dont la position est une fonction physique du temps, déclenche tout le reste.

- `goldberg.template.html` : trajectoire, caméra, typographie, audio Web Audio
- `build.py` : assemble `goldberg.html` autonome (police Cairo Black, logo Creofan, badge Claude en base64)
- `render.mjs` : rendu Playwright (3 sous-images par image) + ffmpeg `tmix` + H.264/AAC

```
python3 build.py
node render.mjs --audit   # images clés → out/audit-*.png
node render.mjs           # → out/goldberg.mp4
```
