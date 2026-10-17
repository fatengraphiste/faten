# Reel Creofan — Le secret du prompt Google Flow

Vidéo de 40 s en 9:16 (Reels / TikTok / LinkedIn), faite avec Remotion.

## Lancer

```
npm install
npm run dev      # aperçu dans le navigateur
npm run build    # exporte out/creofan-reel.mp4
```

## Ajouter tes fichiers (optionnel)

Mets-les dans le dossier `public/`, puis écris leur nom dans le panneau à droite du Studio :

- `voiceover` : ta voix off (ex. `voix.mp3`)
- `facecam` : ta vidéo face-cam pour la scène 0:08 (ex. `facecam-1.mp4`)
- `resultImage` : ton vrai résultat Google Flow (ex. `resultat-flow.jpg`)

## Scènes

| Temps | Fichier |
|---|---|
| 0:00 – 0:08 | `src/scenes/Vocal.tsx` — vocal WhatsApp |
| 0:08 – 0:13 | `src/scenes/Solution.tsx` — « Google Flow » |
| 0:13 – 0:28 | `src/scenes/Prompt.tsx` — champ de prompt et frappe |
| 0:28 – 0:35 | `src/scenes/Result.tsx` — prompt ➔ résultat |
| 0:35 – 0:40 | `src/scenes/Cta.tsx` — « Écris PROMPT » |
