# Photos produits – format WooCommerce

Met toutes les photos produits au même format : carré 1:1 (1200×1200 px), fond blanc,
produit centré avec la même marge de 8 % sur toutes les photos, export `.webp`.
Sur une photo déjà sur fond blanc, le produit n'est pas retouché : il est seulement recadré et centré.

Chaque photo est classée automatiquement dans un des 3 modèles :

| Modèle | Reconnu quand… | Traitement |
|---|---|---|
| 1. Mise en scène | fond non uni (décor) | format seul : redimensionnée et recadrée au carré, fond d'origine |
| 2. Gros plan | le produit est coupé par le cadre | format seul : redimensionnée et recadrée au carré, fond d'origine |
| 3. Produit centré | produit entier sur fond blanc/gris/beige ou transparent | produit centré sur fond blanc, même marge pour tous |

Pour les modèles 1 et 2, aucun fond n'est ajouté : les bandes blanches éventuelles autour
de la photo sont retirées, puis l'image remplit le carré (recadrage au centre).
Le modèle retenu est indiqué pour chaque photo dans `rapport.csv`.
- Toutes les images sortent au même format carré (1200×1200 par défaut).
- Le nom de fichier et l'arborescence des dossiers sont conservés.

## Installation

```bash
pip install numpy pillow opencv-python-headless
```

## Utilisation

```bash
python traiter_photos.py "photos_originales" "photos_traitees"
```

Formats acceptés en entrée : jpg, jpeg, jfif, png, webp, bmp, gif, tif/tiff, avif, ico, tga
(et heic/heif des iPhone après `pip install pillow-heif`). Tout sort en `.webp`.

Conversion seule en `.webp` (même taille, même contenu, transparence gardée) :

```bash
python traiter_photos.py "photos_originales" "photos_webp" --conversion-seule
```

Options : `--taille 1200`, `--fond FFFFFF`, `--marge 0.08`, `--ombre` (désactivée par défaut), `--qualite 92`.

Voir `exemples/avant-apres.png` (haut : original, bas : résultat).
