# Photos produits – format WooCommerce

Met toutes les photos produits au même format : carré 1:1 (1200×1200 px), fond blanc,
produit centré avec la même marge de 8 % sur toutes les photos, export `.webp`.
Sur une photo déjà sur fond blanc, le produit n'est pas retouché : il est seulement recadré et centré.

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

Options : `--taille 1200`, `--fond FFFFFF`, `--marge 0.08`, `--ombre` (désactivée par défaut), `--qualite 92`.

Voir `exemples/avant-apres.png` (haut : original, bas : résultat).
