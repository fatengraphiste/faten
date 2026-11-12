# Comptoir GEP : version isométrique (composition `GepIso`)

- Rendu : `npx remotion render src/index.ts GepIso out/comptoir-gep-isometrique.mp4`
- Studio : `npx remotion studio` puis composition `GepIso`
- Voix off : remplacer `public/audio/comptoir-gep-voice.mp3` par le fichier original (même durée = même synchronisation).
  Le timing des sous-titres et des animations vient de `src/captions.json` (alignement mot à mot).
- Moteur isométrique : `src/iso/engine.tsx` (`iso(cam, x, y, z)`, prismes extrudés, cotes isométriques).
- Une scène = un composant dans `src/iso/Scene*.tsx`, montée dans une `<Sequence>` (`src/iso/GepIso.tsx`).
