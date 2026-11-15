# Vidéo promo Herbéos (9:16, 15 s)

- `index.html` : l'animation (fonction `render(t)` pilotée image par image)
- `hp_*.png`, `logo.png` : produits détourés et logo
- `audio/voix_v2.mp3` : voix off actuelle (`voix_v1.mp3` = première version)

Refaire le rendu :
```bash
cd herbeos_video_src && node render.js full
ffmpeg -y -framerate 30 -i frames/f%04d.jpg -i audio/voix_v2.mp3 -filter_complex "[1:a]apad,afade=t=out:st=14.65:d=0.35[a]" -map 0:v -map "[a]" -t 15 -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart ../herbeos_promo_9x16_15s.mp4
```

Contrôle qualité Gemini : `python3 tools/gemini_review.py herbeos_promo_9x16_15s.mp4`
