#!/usr/bin/env python3
"""Telecharge les photos produits Smeg pour une liste de references.
Usage: pip install requests beautifulsoup4 ; python3 download_smeg.py
Cree un dossier images/<REF>/ par produit. Pause entre requetes.
A utiliser uniquement avec l'autorisation de Smeg (revendeur/distributeur)."""
import os, re, time, requests
from urllib.parse import urljoin, quote
from bs4 import BeautifulSoup

BASE = "https://www.smeg.fr"
H = {"User-Agent": "Mozilla/5.0"}
s = requests.Session(); s.headers.update(H)

def find_product_page(ref):
    r = s.get(f"{BASE}/catalogsearch/result/?q={quote(ref)}", timeout=30)
    soup = BeautifulSoup(r.text, "html.parser")
    for a in soup.find_all("a", href=True):
        if ref.lower() in a["href"].lower():
            return urljoin(BASE, a["href"])
    if ref.lower() in r.url.lower():  # redirection directe
        return r.url
    return None

def images(url):
    html = s.get(url, timeout=30).text
    found = set(re.findall(r'https?://[^"\'\s\\]+?\.(?:jpg|jpeg|png|webp)', html, re.I))
    return sorted(u for u in found if "media" in u.lower() or "catalog" in u.lower())

os.makedirs("images", exist_ok=True)
missing = []
for ref in [l.strip() for l in open("refs.txt") if l.strip()]:
    try:
        page = find_product_page(ref)
        if not page:
            missing.append(ref); print("introuvable:", ref); continue
        d = os.path.join("images", ref); os.makedirs(d, exist_ok=True)
        for i, u in enumerate(images(page), 1):
            ext = os.path.splitext(u.split("?")[0])[1] or ".jpg"
            with open(os.path.join(d, f"{ref}_{i}{ext}"), "wb") as f:
                f.write(s.get(u, timeout=60).content)
            time.sleep(0.5)
        print("ok:", ref, page)
    except Exception as e:
        missing.append(ref); print("erreur:", ref, e)
    time.sleep(2)
open("introuvables.txt", "w").write("\n".join(missing))
