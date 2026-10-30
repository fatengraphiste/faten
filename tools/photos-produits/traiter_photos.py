"""Uniformise les photos produits SMEG pour WooCommerce.

Pour chaque image : détecte si le fond est uni et clair (blanc, gris, beige).
- Fond uni  -> recadrage, produit centré sur un carré blanc (ombre en option).
- Fond décoré / mise en situation -> image ignorée (listée dans rapport.csv).

Usage :
    python traiter_photos.py DOSSIER_SOURCE DOSSIER_SORTIE [--taille 1200] [--fond FFFFFF] [--ombre]
"""
import argparse
import csv
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def couleur_hex(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float32)


def analyser_fond(rgb, bord=6):
    """Renvoie la couleur du fond si elle est unie et claire, sinon None."""
    h, w, _ = rgb.shape
    pixels = np.concatenate([
        rgb[:bord].reshape(-1, 3), rgb[-bord:].reshape(-1, 3),
        rgb[:, :bord].reshape(-1, 3), rgb[:, -bord:].reshape(-1, 3),
    ])
    fond = np.median(pixels, axis=0)
    ecart = np.abs(pixels - fond).max(axis=1)
    part_unie = (ecart < 18).mean()
    clair = fond.mean() > 175                       # blanc, gris clair, beige
    neutre = fond.max() - fond.min() < 45           # pas de couleur franche
    if part_unie > 0.75 and clair and neutre:
        return fond
    return None


def masque_produit(rgb, fond, tolerance=10):
    """Masque binaire du produit : tout ce qui n'est pas fond relié au bord."""
    h, w, _ = rgb.shape
    dist = np.abs(rgb - fond).max(axis=2)
    proche = (dist < tolerance).astype(np.uint8)
    n, labels = cv2.connectedComponents(proche, connectivity=4)
    bords = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    fond_relie = np.isin(labels, bords) & (proche == 1)
    produit = (~fond_relie).astype(np.uint8)

    # nettoyage : bouche les trous, retire les poussières
    produit = cv2.morphologyEx(produit, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    n, labels, stats, _ = cv2.connectedComponentsWithStats(produit, connectivity=8)
    garde = np.zeros_like(produit)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] > 0.002 * h * w:
            garde[labels == i] = 1
    return garde, dist


def composer(rgb, masque, dist, fond_src, taille, gris, marge, ombre):
    """Produit centré sur un carré de couleur `gris` (blanc par défaut).

    Pas de détourage dur : les pixels proches de l'ancien fond sont ramenés
    progressivement vers la nouvelle couleur, les pixels francs du produit restent
    intacts. Sur une photo déjà sur fond blanc, le produit n'est pas retouché.
    """
    ys, xs = np.where(masque > 0)
    pad = 6
    y0, y1 = max(0, ys.min() - pad), min(rgb.shape[0], ys.max() + 1 + pad)
    x0, x1 = max(0, xs.min() - pad), min(rgb.shape[1], xs.max() + 1 + pad)
    rgb, masque, dist = rgb[y0:y1, x0:x1], masque[y0:y1, x0:x1], dist[y0:y1, x0:x1]

    k = gris / np.maximum(fond_src, 1)            # ancien fond -> nouveau fond (1 si déjà blanc)
    franc = np.clip((dist - 2) / 40.0, 0, 1)[..., None]
    avant = rgb * (k + (1 - k) * franc)

    zone = int(taille * (1 - 2 * marge))
    echelle = zone / max(avant.shape[:2])
    nw, nh = max(1, round(avant.shape[1] * echelle)), max(1, round(avant.shape[0] * echelle))
    interp = cv2.INTER_AREA if echelle < 1 else cv2.INTER_LANCZOS4
    avant = cv2.resize(avant, (nw, nh), interpolation=interp)
    solide = cv2.resize(np.clip(franc[..., 0] * 3, 0, 1), (nw, nh), interpolation=cv2.INTER_AREA)

    toile = np.ones((taille, taille, 3), np.float32) * gris
    ox = (taille - nw) // 2
    oy = (taille - nh) // 2 - int(taille * 0.01)   # léger décalage vers le haut pour l'ombre
    toile[oy:oy + nh, ox:ox + nw] = avant

    if ombre:
        sombre = np.zeros((taille, taille), np.float32)
        # ombre de contact : ellipse aplatie sous les pieds (bas de la partie solide,
        # pas du reflet clair éventuel de la photo d'origine)
        lignes = np.where(solide.max(axis=1) > 0.5)[0]
        bas = lignes.max() if len(lignes) else nh - 1
        base = solide[max(0, bas - max(2, nh // 40)):bas + 1].max(axis=0)
        cols = np.where(base > 0.3)[0]
        if len(cols):
            cx = ox + (cols.min() + cols.max()) / 2
            rx = (cols.max() - cols.min()) / 2 * 0.95
            cy = oy + bas
            cv2.ellipse(sombre, (int(cx), int(cy)), (int(rx), max(3, int(taille * 0.01))),
                        0, 0, 360, 1.0, -1)
            sombre = cv2.GaussianBlur(sombre, (0, 0), taille * 0.01) * 0.40
        # ombre diffuse : silhouette décalée vers le bas, très floue
        diffuse = np.zeros((taille, taille), np.float32)
        dy = int(taille * 0.015)
        y_end = min(taille, oy + dy + nh)
        diffuse[oy + dy:y_end, ox:ox + nw] = solide[: y_end - oy - dy]
        diffuse = cv2.GaussianBlur(diffuse, (0, 0), taille * 0.02) * 0.15
        sombre = np.clip(sombre + diffuse, 0, 0.6)
        # l'ombre ne s'applique que sur le fond (et les reflets clairs), jamais sur le produit
        couvre = np.zeros((taille, taille), np.float32)
        couvre[oy:oy + nh, ox:ox + nw] = cv2.GaussianBlur(solide, (0, 0), 1.5)
        toile *= (1 - sombre * (1 - couvre))[..., None]

    return Image.fromarray(np.clip(toile, 0, 255).astype(np.uint8))


def main():
    p = argparse.ArgumentParser()
    p.add_argument("source", type=Path)
    p.add_argument("sortie", type=Path)
    p.add_argument("--taille", type=int, default=1200)
    p.add_argument("--fond", default="FFFFFF")
    p.add_argument("--marge", type=float, default=0.08)
    p.add_argument("--ombre", action="store_true")
    p.add_argument("--qualite", type=int, default=92)
    args = p.parse_args()

    gris = couleur_hex(args.fond)
    fichiers = sorted(f for f in args.source.rglob("*") if f.suffix.lower() in EXTENSIONS)
    args.sortie.mkdir(parents=True, exist_ok=True)
    rapport = []
    for f in fichiers:
        rel = f.relative_to(args.source)
        try:
            rgb = np.asarray(Image.open(f).convert("RGB"), dtype=np.float32)
            fond = analyser_fond(rgb)
            if fond is None:
                rapport.append((rel, "ignorée", "fond non uni"))
                continue
            masque, dist = masque_produit(rgb, fond)
            if masque.sum() < 0.01 * masque.size:
                rapport.append((rel, "ignorée", "produit non détecté"))
                continue
            img = composer(rgb, masque, dist, fond, args.taille, gris, args.marge, args.ombre)
            out = args.sortie / rel.with_suffix(".webp")
            out.parent.mkdir(parents=True, exist_ok=True)
            img.save(out, "WEBP", quality=args.qualite, method=6)
            rapport.append((rel, "traitée", "fond %d,%d,%d" % tuple(fond)))
        except Exception as e:  # une image cassée ne bloque pas le lot
            rapport.append((rel, "erreur", str(e)))
        print(*rapport[-1], sep=" | ")

    with open(args.sortie / "rapport.csv", "w", newline="", encoding="utf-8") as fh:
        csv.writer(fh).writerows([("fichier", "statut", "détail"), *rapport])


if __name__ == "__main__":
    main()
