# Photos produits – format WooCommerce

Met toutes les photos produits au même format : carré 1:1 (1200×1200 px), fond gris `#F2F2F2`,
produit centré avec une marge de 8 %, ombre douce, export `.webp`.

- Les photos sur **fond uni clair** (blanc, gris, beige) sont traitées.
- Les photos sur **fond décoré / mise en situation** sont ignorées (laissées telles quelles)
  et listées dans `rapport.csv`.
- Le nom de fichier et l'arborescence des dossiers sont conservés.

## Installation

```bash
pip install numpy pillow opencv-python-headless
```

## Utilisation

```bash
python traiter_photos.py "photos_originales" "photos_traitees"
```

Options : `--taille 1200`, `--gris F2F2F2`, `--marge 0.08`, `--sans-ombre`, `--qualite 88`.

Voir `exemples/avant-apres.png` (haut : original, bas : résultat).
