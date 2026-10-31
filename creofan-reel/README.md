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

La ligne du « f » se trace comme un stylo (o → barre → boucle haute → boucle basse → a), caméra serrée sur le f, puis recul : c-r-e et n. apparaissent. Fond beige, logo rouge.

```
npx remotion render Outro out/creofan-outro.mp4
```

- `src/outro/Outro.tsx` : l'animation (90 images à 30 i/s, 1080×1920). Le tracé du stylo est la ligne médiane `MAIN_PTS`, utilisée comme masque sur le vrai logo.
- `public/outro/` : logos SVG d'origine

# Outro Creofan, version icône (`OutroIcon`, 3 s)

Même style : l'icône est une seule ligne continue tracée au stylo — haut du cercle, le « f » (boucle haute, boucle basse, barre), puis le bas du cercle. Recul de caméra, puis onde et léger rebond.

```
npx remotion render OutroIcon out/creofan-outro-icon.mp4
```

- `src/outro/OutroIcon.tsx` : ligne médiane `TOP` + `F_PTS` + `BOTTOM`, utilisée comme masque sur l'icône d'origine
