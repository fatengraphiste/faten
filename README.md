# Faten — Remotion

Projet vidéo en React avec [Remotion](https://www.remotion.dev).

## Démarrer

```bash
npm install
npm run dev            # ouvre Remotion Studio (aperçu + édition des props)
```

## Rendu

```bash
npm run build          # Intro 16:9 → out/intro.mp4
npm run build:vertical # Intro 9:16 (Reels/TikTok) → out/intro-vertical.mp4
npm run still          # image fixe → out/intro.png
```

## Structure

- `src/Root.tsx` — déclare les compositions (format, durée, fps, props par défaut)
- `src/Intro.tsx` — l'animation d'intro (titre, sous-titre, couleur d'accent modifiables dans le Studio)
