# Assemble perception.html : polices et logo intégrés en base64 (aucun fichier externe)
import base64, pathlib, sys
here = pathlib.Path(__file__).resolve().parent
pub = here.parent / "public"
up = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else None
def b64(p): return base64.b64encode(pathlib.Path(p).read_bytes()).decode()
html = (here / "perception.template.html").read_text(encoding="utf-8")
html = (html.replace("{{SALMA_BOLD}}", b64(here / "fonts/salma-arabic-bold.otf"))
            .replace("{{SALMA_LIGHT}}", b64(here / "fonts/salma-arabic-light.otf"))
            .replace("{{POPPINS_800}}", b64(pub / "fonts/poppins-latin-800-normal.woff2"))
            .replace("{{LOGO}}", b64(pub / "ame/logo-creofan-rouge.png")))
(here / "perception.html").write_text(html, encoding="utf-8")
print("perception.html", len(html) // 1024, "Ko")
