# Reel Creofan — Parler à Google Flow

Vidéo de 54 s en 9:16, synchronisée sur la voix off.

```
npm install
npm run dev      # aperçu
npm run build    # exporte out/creofan-reel.mp4
```

- `public/vocal-ons.mp4` : vocal WhatsApp d'Ons (0:00 – 0:10)
- `public/voix-off.mp3` : voix off (à partir de 0:10)
- `public/resultat-flow.jpg` : rendu final Google Flow
- `src/cues.ts` : les temps de synchronisation (un mot de la voix off → une animation)

---

# Vidéo 2 — Connecter Claude à Canva (`ClaudeCanva`, 34 s)

```
npx remotion render ClaudeCanva out/claude-canva.mp4
```

- `public/cc/voix-off.mp3` : voix off améliorée (réduction de bruit, EQ, compression, volume)
- `public/cc/music.mp3` + `*.wav` : musique rythmée et effets sonores
- `src/cc/cues.ts` : synchronisation de chaque animation sur la voix

---

# Outro Creofan (`Outro`, 3 s)

Le point rouge envahit l'écran, l'icône blanche se dessine en tournant, puis le logo complet se révèle en cercle.

```
npx remotion render Outro out/creofan-outro.mp4
```

- `src/outro/Outro.tsx` : l'animation (90 images à 30 i/s, 1080×1920)
- `public/outro/` : logos SVG d'origine
