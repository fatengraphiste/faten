# Assemble goldberg.html autonome (police Cairo, logo Creofan et badge Claude en base64)
import base64, pathlib
here = pathlib.Path(__file__).resolve().parent
pub = here.parent / "public"
b64 = lambda p: base64.b64encode(pathlib.Path(p).read_bytes()).decode()
html = (here / "goldberg.template.html").read_text(encoding="utf-8")
for k, p in {"CAIRO_AR": here / "fonts/cairo-arabic-900-normal.woff2", "CAIRO_LAT": here / "fonts/cairo-latin-900-normal.woff2",
             "LOGO": pub / "logo-creofan-complet.png", "CLAUDE": pub / "cc/claude-icon.png"}.items():
    html = html.replace("{{%s}}" % k, b64(p))
(here / "goldberg.html").write_text(html, encoding="utf-8")
print("goldberg.html", len(html) // 1024, "Ko")
