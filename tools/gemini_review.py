#!/usr/bin/env python3
"""Fait évaluer une vidéo (image + son) par Gemini et affiche une note /10.

Usage : python3 tools/gemini_review.py chemin/video.mp4 [--model gemini-3.5-flash] [--brief "contexte"]

La clé API est lue dans la variable d'environnement GEMINI_API_KEY.
Si elle est enregistrée comme « Network secret » de l'environnement cloud
(hôte generativelanguage.googleapis.com, en-tête x-goog-api-key),
le proxy l'injecte lui-même : le script envoie alors une valeur fictive.
"""
import argparse, base64, json, os, sys, urllib.request, urllib.error

PROMPT = """Tu es directeur artistique senior spécialisé en publicités vidéo courtes (Reels/TikTok).
Regarde ET écoute attentivement cette vidéo. {brief}
Donne en français :
1. Une note globale /10.
2. Une note /10 pour chaque critère : accroche (3 premières secondes), lisibilité des textes et prix,
   qualité visuelle, rythme et synchronisation avec la voix off, cohérence de marque, appel à l'action et outro.
3. Les 3 points forts.
4. Les 5 améliorations concrètes les plus importantes, classées par impact, avec le timecode concerné.
Sois exigeant et précis."""

FALLBACK = ["gemini-3.5-flash", "gemini-3-flash-preview", "gemini-flash-latest"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--model", default=None)
    ap.add_argument("--brief", default="")
    a = ap.parse_args()

    key = os.environ.get("GEMINI_API_KEY", "injected-by-proxy")
    data = open(a.video, "rb").read()
    if len(data) > 19 * 1024 * 1024:
        sys.exit("Vidéo > 19 Mo : compresse-la avant (limite de l'envoi direct).")
    body = json.dumps({
        "contents": [{"parts": [
            {"inline_data": {"mime_type": "video/mp4", "data": base64.b64encode(data).decode()}},
            {"text": PROMPT.format(brief=a.brief)},
        ]}],
        "generationConfig": {"temperature": 0.4},
    }).encode()

    for model in ([a.model] if a.model else FALLBACK):
        req = urllib.request.Request(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
            data=body, headers={"Content-Type": "application/json", "x-goog-api-key": key})
        try:
            r = json.load(urllib.request.urlopen(req, timeout=300))
        except urllib.error.HTTPError as e:
            print(f"[{model}] HTTP {e.code} : {e.read().decode()[:200]}", file=sys.stderr)
            continue
        print(f"# Évaluation Gemini ({model})\n")
        print("".join(p.get("text", "") for p in r["candidates"][0]["content"]["parts"]))
        return
    sys.exit("Aucun modèle n'a répondu (clé invalide ou quota dépassé).")


if __name__ == "__main__":
    main()
