---
name: redaction-caption
description: Après chaque vidéo validée par l'utilisateur, produire sa caption (légende) et son image de couverture pour les réseaux sociaux de Creofan, selon la nature du contenu (Reel ou post). À utiliser aussi dès que l'utilisateur demande une caption, une légende, une cover ou des hashtags.
---

# Caption + cover Creofan

## Déclencheur
**Après chaque validation d'une vidéo** par l'utilisateur (« c'est bon », « validé », « ok »…), sans attendre qu'il le demande : livrer dans le même message la **caption** et l'**image de couverture**. Tant que la vidéo n'est pas validée, ne pas les produire.

## Ordre de travail
1. Formuler l'objectif du partage en une phrase.
2. Rédiger la caption (règles ci-dessous).
3. Fabriquer la cover à partir de **ce même objectif** : le titre de la cover reprend l'idée de la caption, jamais le script de la vidéo.
4. Envoyer la caption (dans le message) et la cover (fichier PNG).

## Principe
La caption n'est jamais un résumé du script de la vidéo : elle indique **l'objectif de partager ce contenu** (ce que le contenu prouve ou apporte à l'audience). Elle est toujours courte.

## Règles communes
- Langue : **mélange derja tunisienne (en lettres arabes) et français**, les termes métier restant en français (mascotte, marque, branding…). Ton **formel : vouvoiement** — en derja, forme du pluriel de politesse (« ماركتكم », « تنجموا », jamais « ماركتك », « تنجم »).
- Pas de numéro de téléphone ni de coordonnées dans la caption.
- Pas de répétition du texte ou du script du contenu.
- 1 à 2 emojis maximum, en rapport avec le sujet.
- Hashtags après le texte, séparés par une ligne vide : 5 à 8, du plus précis au plus large, toujours `#creofan` en premier. Exemple : `#creofan #mascotte #claude #ai #branding #contentcreation #tunisie`.
- Pas d'appel à l'action (CTA) sauf si l'utilisateur le demande explicitement pour ce contenu.

## Selon la nature du contenu
### Reel
- **Un seul titre** d'une ligne (≈ 70 caractères max), qui énonce l'objectif du Reel, sous forme d'affirmation ou de question.
- Aucun paragraphe, aucun CTA.
- Format : titre + ligne vide + hashtags.

### Post (image, carrousel)
- **Titre** accrocheur d'une ligne, puis **1 à 3 phrases courtes** qui apportent l'information ou la valeur (le « pourquoi » du post), sans reprendre le texte des visuels.
- Pour un carrousel : annoncer le bénéfice de la lecture, pas le contenu slide par slide.
- Format : titre + ligne vide + phrases courtes + ligne vide + hashtags.

## Méthode
1. Identifier la nature (Reel ou post) ; si ce n'est pas clair, le demander.
2. Formuler en une phrase l'objectif du partage (ce que l'audience doit retenir).
3. Rédiger selon le format ci-dessus, en derja + français, en vouvoyant.
4. Relire : formel (vouvoiement) ? mélange derja/français ? court ? pas de numéro ? pas de CTA non demandé ? pas de copie du script ?

## Exemple (Reel, mascotte créée avec Claude)
```
تنجموا تصنعوا mascotte لماركتكم بـ Claude 🤯

#creofan #mascotte #claude #ai #branding #contentcreation #tunisie
```

## Image de couverture
- Format 1080×1920 (PNG), contenu important dans la zone centrale (compatible grille 4:5) ; rendue avec Remotion (`npx remotion still … <CompId> out/couvertures/<nom>.png`), sur le modèle de la composition `CoverHab5` (`creofan-reel/src/habouba/HabV5.tsx`).
- Charte Creofan : rouge #f7322a, beige #fff5f5, blanc ; Poppins + Salma ; fond plat (pas de cercles empilés) ; pas de rouge sur rouge.
- **Icône Creofan** en haut au centre, en petit.
- **Titre** en 2 lignes maximum, en derja (lettres arabes) + français, vouvoiement, en pastilles (rouge / blanche) ; une seule idée.
- Le visuel du contenu (mascotte, objet…) sous le titre, sans chevaucher le texte ; pas de numéro de téléphone.
- Vérifier le rendu en l'ouvrant avant l'envoi : aucun texte coupé ni superposé.
- Enregistrer dans `creofan-reel/out/couvertures/`, commiter et pousser avec la vidéo.
