#!/usr/bin/env python3
"""Telecharge les photos produits depuis https://www.smeg.com/fr/produits/<REF>
Usage:
  py -m pip install requests beautifulsoup4 playwright
  py -m playwright install chromium
  py download_smeg.py
Cree images/<REF>/ pour chaque reference, plus debug/<REF>.html (page brute)
et introuvables.txt (references sans image). A utiliser avec l'autorisation de Smeg."""
import os, re, time, json, requests
from urllib.parse import urljoin
from bs4 import BeautifulSoup

BASE = "https://www.smeg.com/fr/produits/"
H = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
     "Accept-Language": "fr-FR,fr;q=0.9"}
IMG = re.compile(r'https?:[^"\'\s\\<>)]+?\.(?:jpg|jpeg|png|webp)(?:\?[^"\'\s\\<>)]*)?', re.I)
s = requests.Session(); s.headers.update(H)

def get_html_requests(url):
    r = s.get(url, timeout=30); r.raise_for_status(); return r.text

def get_html_browser(url):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(user_agent=H["User-Agent"])
        pg.goto(url, wait_until="networkidle", timeout=60000)
        pg.mouse.wheel(0, 4000); pg.wait_for_timeout(1500)
        html = pg.content(); b.close(); return html

def extract(html, url, ref):
    soup = BeautifulSoup(html, "html.parser")
    urls = set(IMG.findall(html.replace("\\/", "/")))
    for t in soup.find_all(["img", "source", "meta"]):
        for a in ("src", "data-src", "data-zoom", "content", "srcset", "data-srcset"):
            v = t.get(a)
            if v:
                for part in str(v).split(","):
                    u = part.strip().split(" ")[0]
                    if re.search(r'\.(jpg|jpeg|png|webp)', u, re.I):
                        urls.add(urljoin(url, u))
    # garde surtout les images liees au produit (nom contient la ref) ; sinon tout
    key = ref.lower()
    prod = {u for u in urls if key in u.lower()}
    return sorted(prod or {u for u in urls if not re.search(r'logo|icon|flag|sprite|banner', u, re.I)})

def save(u, folder, ref, i):
    ext = os.path.splitext(u.split("?")[0])[1] or ".jpg"
    c = s.get(u, timeout=60)
    if c.ok and len(c.content) > 3000:
        with open(os.path.join(folder, f"{ref}_{i}{ext}"), "wb") as f: f.write(c.content)
        return True
    return False

os.makedirs("images", exist_ok=True); os.makedirs("debug", exist_ok=True)
missing = []
for ref in [l.strip() for l in open("refs.txt") if l.strip()]:
    url = BASE + ref
    try:
        html = get_html_requests(url); imgs = extract(html, url, ref)
        if not imgs:
            html = get_html_browser(url); imgs = extract(html, url, ref)
        open(os.path.join("debug", ref + ".html"), "w", encoding="utf-8").write(html)
        folder = os.path.join("images", ref); os.makedirs(folder, exist_ok=True)
        n = sum(save(u, folder, ref, i) for i, u in enumerate(imgs, 1))
        print(f"{'ok' if n else 'AUCUNE IMAGE'}: {ref} ({n} images)")
        if not n: missing.append(ref)
    except Exception as e:
        missing.append(ref); print("erreur:", ref, e)
    time.sleep(2)
open("introuvables.txt", "w").write("\n".join(missing))
