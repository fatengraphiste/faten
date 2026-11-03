"""Uniformise les photos produits SMEG pour WooCommerce.

Chaque photo est classée dans un des 3 modèles :
1. Mise en scène (produit dans un décor) : fond non uni.
2. Gros plan (détail du produit) : le produit est coupé par le cadre.
3. Produit centré : produit entier sur fond uni clair (blanc, gris, beige) ou transparent.

- Modèle 3 -> produit recadré et centré sur un carré blanc, avec la même marge
  pour tous les produits (ombre en option).
- Modèles 1 et 2 -> composition d'origine conservée : ni fond changé, ni fond
  ajouté. Les éventuelles bandes blanches ajoutées autour de la photo sont
  retirées, puis l'image est redimensionnée et recadrée au carré (centre).

Toutes les images sortent au même format : carré `taille`×`taille`, en .webp.
Formats lus : jpg, jpeg, jfif, png, webp, bmp, gif, tif/tiff, avif, ico, tga,
et heic/heif (photos iPhone) si `pillow-heif` est installé.

Usage :
    python traiter_photos.py DOSSIER_SOURCE DOSSIER_SORTIE [--taille 1200] [--fond FFFFFF] [--ombre]
    python traiter_photos.py DOSSIER_SOURCE DOSSIER_SORTIE --nouveaux
        (ne traite que les photos ajoutées depuis le dernier lancement)
    python traiter_photos.py DOSSIER_SOURCE DOSSIER_SORTIE --conversion-seule
        (convertit seulement en .webp : même taille, même contenu, transparence gardée)
"""
import argparse
import csv
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageOps

try:  # photos iPhone (.heic) : optionnel
    from pillow_heif import register_heif_opener
    register_heif_opener()
except ImportError:
    pass

EXTENSIONS = {".jpg", ".jpeg", ".jpe", ".jfif", ".png", ".webp", ".bmp", ".dib", ".gif",
              ".tif", ".tiff", ".avif", ".heic", ".heif", ".ico", ".tga"}


def ouvrir(chemin):
    """Ouvre n'importe quel format : 1re image d'un GIF, rotation EXIF des photos,
    TIFF 16 bits ramenés en 8 bits."""
    im = Image.open(chemin)
    im.seek(0)
    im = ImageOps.exif_transpose(im)
    if im.mode in ("I", "I;16", "I;16B", "I;16L", "I;16N"):
        im = im.point(lambda v: v / 256).convert("L")
    return im


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


def charger(chemin, fond):
    """Image en RGB float + alpha (None si l'image est opaque).

    Un fond transparent est remplacé par la couleur de fond : sinon les zones
    transparentes ressortent en noir.
    """
    im = ouvrir(chemin)
    if im.mode in ("RGBA", "LA", "PA") or "transparency" in im.info:
        rgba = np.asarray(im.convert("RGBA"), dtype=np.float32)
        alpha = rgba[..., 3] / 255.0
        if alpha.min() < 0.99:
            a = alpha[..., None]
            return rgba[..., :3] * a + fond * (1 - a), alpha
        return rgba[..., :3], None
    return np.asarray(im.convert("RGB"), dtype=np.float32), None


def masque_alpha(alpha):
    """Masque produit d'une image détourée : on se fie à la transparence."""
    h, w = alpha.shape
    masque = (alpha > 0.05).astype(np.uint8)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(masque, connectivity=8)
    garde = np.zeros_like(masque)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] > 0.002 * h * w:
            garde[labels == i] = 1
    return garde


def est_detail(masque, seuil=0.05, droit=0.85):
    """Gros plan : le produit est coupé par le cadre.

    Cas reconnus : il touche au moins deux bords de l'image ; il touche un bord
    et s'arrête ailleurs sur une coupe droite ; ou l'image a déjà une marge
    blanche mais le contenu s'arrête sur au moins deux bords parfaitement
    droits (photo recadrée collée sur du blanc). Un produit entier a des
    contours arrondis : ses bords ne sont pleins que sur une petite partie.
    """
    cotes = [masque[0], masque[-1], masque[:, 0], masque[:, -1]]
    touche = sum(c.mean() > seuil for c in cotes)
    if touche >= 2:
        return True
    ys, xs = np.where(masque > 0)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    e = 2  # quelques pixels vers l'intérieur pour ignorer l'anticrénelage
    bords = [masque[min(y0 + e, y1), x0:x1 + 1].mean(), masque[max(y1 - e, y0), x0:x1 + 1].mean(),
             masque[y0:y1 + 1, min(x0 + e, x1)].mean(), masque[y0:y1 + 1, max(x1 - e, x0)].mean()]
    # coupé par un bord de l'image + une coupe droite nette ailleurs (gros plan en biais)
    if touche == 1 and max(bords) > 0.7:
        return True
    return sum(b > droit for b in bords) >= 2


def retirer_bandes_blanches(rgb, tolerance=8, part=0.995):
    """Retire les lignes/colonnes entièrement blanches au bord de l'image
    (bandes ajoutées pour faire un carré). Le contenu de la photo n'est pas touché."""
    blanc = (255 - rgb.min(axis=2)) < tolerance
    lignes = np.where(blanc.mean(axis=1) < part)[0]
    cols = np.where(blanc.mean(axis=0) < part)[0]
    if len(lignes) < 0.2 * rgb.shape[0] or len(cols) < 0.2 * rgb.shape[1]:
        return rgb  # presque tout blanc : on ne touche à rien
    return rgb[lignes.min():lignes.max() + 1, cols.min():cols.max() + 1]


def carre_sans_fond(rgb, taille):
    """Modèles 1 et 2 : remplit le carré avec la photo (aucun fond ajouté).
    L'image est redimensionnée sur son petit côté puis recadrée au centre."""
    rgb = retirer_bandes_blanches(rgb)
    h, w = rgb.shape[:2]
    echelle = taille / min(h, w)
    nw, nh = max(taille, round(w * echelle)), max(taille, round(h * echelle))
    interp = cv2.INTER_AREA if echelle < 1 else cv2.INTER_LANCZOS4
    img = cv2.resize(rgb, (nw, nh), interpolation=interp)
    ox, oy = (nw - taille) // 2, (nh - taille) // 2
    img = img[oy:oy + taille, ox:ox + taille]
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))


def enregistrer(img, out, qualite):
    """Écrit d'abord un fichier temporaire puis le renomme : si le script est
    interrompu, il ne reste jamais d'image à moitié écrite."""
    tmp = out.with_name(out.name + ".tmp")
    img.save(tmp, "WEBP", quality=qualite, method=6)
    tmp.replace(out)


def deja_faite(out):
    """Image de sortie présente et lisible (pas abîmée par une interruption)."""
    if not out.exists():
        return False
    try:
        with Image.open(out) as im:
            im.verify()
        return True
    except Exception:
        return False


def main():
    p = argparse.ArgumentParser()
    p.add_argument("source", type=Path)
    p.add_argument("sortie", type=Path)
    p.add_argument("--taille", type=int, default=1200)
    p.add_argument("--fond", default="FFFFFF")
    p.add_argument("--marge", type=float, default=0.08)
    p.add_argument("--ombre", action="store_true")
    p.add_argument("--qualite", type=int, default=92)
    p.add_argument("--conversion-seule", action="store_true",
                   help="convertit en .webp sans aucun autre traitement")
    p.add_argument("--nouveaux", action="store_true",
                   help="ne traite que les photos absentes du dossier de sortie")
    args = p.parse_args()

    gris = couleur_hex(args.fond)
    fichiers = sorted(f for f in args.source.rglob("*") if f.suffix.lower() in EXTENSIONS)
    args.sortie.mkdir(parents=True, exist_ok=True)
    rapport = []
    deja = set()
    for f in fichiers:
        rel = f.relative_to(args.source)
        try:
            out = args.sortie / rel.with_suffix(".webp")
            if out in deja:  # photo.jpg et photo.png -> photo.webp et photo_png.webp
                out = out.with_name(f"{f.stem}_{f.suffix[1:].lower()}.webp")
            deja.add(out)
            out.parent.mkdir(parents=True, exist_ok=True)
            if args.nouveaux and deja_faite(out):
                rapport.append((rel, "déjà faite", "non retraitée"))
                continue

            if args.conversion_seule:
                im = ouvrir(f)
                transp = im.mode in ("RGBA", "LA", "PA") or "transparency" in im.info
                im = im.convert("RGBA" if transp else "RGB")
                enregistrer(im, out, args.qualite)
                rapport.append((rel, "convertie en webp", "%d×%d" % im.size))
                continue

            rgb, alpha = charger(f, gris)

            if alpha is not None:                      # fond transparent
                fond = gris
                masque = masque_alpha(alpha)
                dist = np.abs(rgb - fond).max(axis=2)
                origine = "fond transparent"
            else:
                fond = analyser_fond(rgb)
                if fond is None:
                    enregistrer(carre_sans_fond(rgb, args.taille), out, args.qualite)
                    rapport.append((rel, "modèle 1 : mise en scène", "format seul, fond d'origine"))
                    continue
                masque, dist = masque_produit(rgb, fond)
                origine = "fond %d,%d,%d" % tuple(fond)

            if masque.sum() < 0.01 * masque.size:
                enregistrer(carre_sans_fond(rgb, args.taille), out, args.qualite)
                rapport.append((rel, "modèle 1 : mise en scène", "produit non détecté, format seul"))
                continue
            if alpha is None and est_detail(masque):
                enregistrer(carre_sans_fond(rgb, args.taille), out, args.qualite)
                rapport.append((rel, "modèle 2 : gros plan", "format seul, fond d'origine"))
                continue

            img = composer(rgb, masque, dist, fond, args.taille, gris, args.marge, args.ombre)
            enregistrer(img, out, args.qualite)
            rapport.append((rel, "modèle 3 : produit centré", origine))
        except Exception as e:  # une image cassée ne bloque pas le lot
            rapport.append((rel, "erreur", str(e)))
        finally:
            print(*rapport[-1], sep=" | ")

    # utf-8-sig + « ; » : s'ouvre directement en colonnes avec les accents dans Excel (FR)
    nom_rapport = "rapport_nouveaux.csv" if args.nouveaux else "rapport.csv"
    with open(args.sortie / nom_rapport, "w", newline="", encoding="utf-8-sig") as fh:
        csv.writer(fh, delimiter=";").writerows([("fichier", "statut", "détail"), *rapport])


if __name__ == "__main__":
    main()
