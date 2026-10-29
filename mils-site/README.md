# Page storytelling MILS · « Assemblez la machine »

Page interactive en 10 écrans, protégée par mot de passe, pour l'offre technique CCA à MILS.

## Fichiers
- `src/content.html` : la page (textes, animations, styles). Elle n'est jamais publiée en clair.
- `src/login.html` : la page de connexion.
- `assets/` : captures de preuve et logos (à créer, voir ci-dessous).
- `build.mjs` : chiffre la page et produit `dist/`.

## Construire
```bash
cd mils-site && npm install
```
```bash
MILS_PASSWORD="mot-de-passe-de-l-offre" node mils-site/build.mjs
```
La scène 3D de toute la page (`src/scene3d.js`, Three.js : rampe, portails, rack, machine) est regroupée en un seul script et intégrée dans la page chiffrée. La page est compressée avant le chiffrement (environ 200 Ko au total).
`dist/index.html` contient la page chiffrée (AES-GCM 256, clé PBKDF2-SHA256, 310 000 itérations). Sans le mot de passe, le contenu est illisible, même en lisant le code source. Choisir un mot de passe long (12 caractères ou plus).

## Mettre en ligne
Déposer le contenu de `dist/` sur l'hébergement (par exemple mils.salesfactory.tn). `vercel.json` ajoute les en-têtes de sécurité sur Vercel ; ailleurs, configurer les mêmes en-têtes.

Attention : les images de `assets/` ne sont pas chiffrées. Ne mettre aucune donnée client en clair (floutage obligatoire).

## Captures attendues (`mils-site/assets/`)
WebP, moins de 300 Ko, 2400 px de large (desktop) :
- `ecran-3-charte-abcd.webp`
- `ecran-4-site-comptoir-gep.webp`, `ecran-4-demo-accueil-mils.webp`
- `ecran-5-demo-fiche-engin.webp`, `ecran-5-formulaire-location.webp`
- `ecran-6-crm-leads.webp` (données floutées)
- `ecran-7-linkedin-client.webp`, `ecran-7-salesfactory.webp`

Tant qu'une image manque, un emplacement hachuré s'affiche à sa place.

## À remplacer avant envoi
- Coordonnées CCA : bloc `#contact` dans `src/content.html`.
- Logo MILS : `assets/logo-mils.webp` (fourni en basse définition ; le remplacer par la version HD de MILS si possible).
