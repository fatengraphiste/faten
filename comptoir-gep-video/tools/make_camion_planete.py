#!/usr/bin/env python3
"""SVG animé « camion GEP qui roule sur une petite planète » : points de livraison du Grand Tunis.
Calques nommés (ids) pour l'animation : #planet (tourne), #pins, #truck (#wheel-*, #logo), #labels.
Animation SMIL : arrêt de 1.5 s à chaque point, puis la planète tourne de 45° (cycle de 24 s)."""
import re, json, random, math, sys
R0 = "/home/user/faten/comptoir-gep-video"
src = open(R0 + "/remotion/src/logo.ts").read()
body = src[src.index("=[") + 1:]
body = re.sub(r"\{c:", '{"c":', body); body = body.replace(",d:", ',"d":').replace(",rect:", ',"rect":').replace("'", '"')
LOGO = json.loads(body.rstrip(";\n "))
NAVY, RED, DARK, SKY = "#19226d", "#db4041", "#10153f", "#dfe6fb"
CX, CY, RS, RI = 540, 1560, 780, 690                  # centre de la planète, rayon extérieur (route), intérieur
DUR = 24.0; N = 8; STEP = DUR / N; MOVE = 1.5
PLACES = [("تونس", "Tunis Centre"), ("قرطاج", "Carthage"), ("المرسى", "La Marsa"), ("أريانة", "Ariana"), ("منوبة", "Manouba"), ("بن عروس", "Ben Arous"), ("رادس", "Radès"), ("حلق الوادي", "La Goulette")]
def logo(x, y, s, white=False, ident=None):
    parts = []
    for p in LOGO:
        fill = RED if p["c"] == "r" else ("#ffffff" if white else NAVY)
        parts.append(f'<rect x="{p["rect"][0]}" y="{p["rect"][1]}" width="{p["rect"][2]}" height="{p["rect"][3]}" fill="{fill}"/>' if "rect" in p else f'<path d="{p["d"]}" fill="{fill}"/>')
    idattr = f' id="{ident}"' if ident else ""
    return f'<g{idattr} transform="translate({x} {y}) scale({s}) translate(-485 -125)">{"".join(parts)}</g>'
def kt(times, tot=DUR): return ";".join(f"{t / tot:.5f}" for t in times)
# ───────── planète : décor + rotation avec arrêts ─────────
random.seed(7)
blocks = []
for i in range(80):
    a = random.uniform(0, 2 * math.pi); r = random.uniform(90, 640); w = random.uniform(30, 110); h = random.uniform(24, 80)
    x, y = CX + r * math.cos(a), CY + r * math.sin(a); col = random.choice(["#222e8a", "#263391", "#2a3796", "#1f2a82"])
    blocks.append(f'<rect x="{x - w / 2:.1f}" y="{y - h / 2:.1f}" width="{w:.1f}" height="{h:.1f}" rx="10" fill="{col}" transform="rotate({math.degrees(a):.1f} {x:.1f} {y:.1f})"/>')
for i in range(18):
    a = random.uniform(0, 2 * math.pi); r = random.uniform(60, 650); x, y = CX + r * math.cos(a), CY + r * math.sin(a)
    blocks.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{random.uniform(5, 14):.1f}" fill="{random.choice(["#8f98cf", "#c9d0e8", RED])}" opacity="0.4"/>')
dashes = "".join(f'<rect x="{CX - 6}" y="{CY - 735 - 5}" width="12" height="10" rx="5" fill="#fff" opacity="0.9" transform="rotate({k * 5} {CX} {CY})"/>' for k in range(72))
pins = []
for k, (ar, fr) in enumerate(PLACES):
    ang = k * 45; pins.append(f'<g id="pin-{k}" transform="rotate({ang} {CX} {CY})"><g transform="translate({CX} {CY - 560})"><path d="M0 0 C-34 -44 -34 -96 0 -96 C34 -96 34 -44 0 0Z" transform="translate(0 40)" fill="{RED}"/><circle cx="0" cy="-16" r="13" fill="#fff"/><ellipse cx="0" cy="42" rx="22" ry="7" fill="{DARK}" opacity="0.35"/></g></g>')
# rotation de la planète : pause (angle constant) puis rotation de 45° (accélération douce)
t_rot, v_rot, spl = [0.0], [0], []
for k in range(N):
    t_rot += [k * STEP + MOVE, (k + 1) * STEP]; v_rot += [-45 * k, -45 * (k + 1)]; spl += ["0 0 1 1", "0.45 0 0.55 1"]
rot_vals = ";".join(f"{v} {CX} {CY}" for v in v_rot)
planet = f'''<g id="planet"><animateTransform attributeName="transform" type="rotate" values="{rot_vals}" keyTimes="{kt(t_rot)}" calcMode="spline" keySplines="{';'.join(spl)}" dur="{DUR}s" repeatCount="indefinite"/>
  <circle cx="{CX}" cy="{CY}" r="{RI + 4}" fill="url(#pg)"/>
  <g id="planet-decor">{''.join(blocks)}</g>
  <circle id="route" cx="{CX}" cy="{CY}" r="560" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="3 16" stroke-linecap="round" opacity="0.5"/>
  <g id="pins">{''.join(pins)}</g>
  <g id="road"><circle cx="{CX}" cy="{CY}" r="{(RS + RI) / 2}" fill="none" stroke="{DARK}" stroke-width="{RS - RI}"/><circle cx="{CX}" cy="{CY}" r="{RS - 2}" fill="none" stroke="#fff" stroke-width="5" opacity="0.8"/><circle cx="{CX}" cy="{CY}" r="{RI + 2}" fill="none" stroke="#fff" stroke-width="5" opacity="0.8"/>{dashes}</g>
</g>'''
# ───────── camion (origine = point de contact au sommet de la route) ─────────
def wheel(ident, x, cum):
    t_w, v_w = [0.0], [0]
    for k in range(N):
        t_w += [k * STEP + MOVE, (k + 1) * STEP]; v_w += [cum * k, cum * (k + 1)]
    vals = ";".join(f"{v} {x} -52" for v in v_w)
    bolts = "".join(f'<circle cx="{x + 26 * math.cos(i * 2 * math.pi / 5):.1f}" cy="{-52 + 26 * math.sin(i * 2 * math.pi / 5):.1f}" r="4.5" fill="{NAVY}"/>' for i in range(5))
    return f'<g id="{ident}"><animateTransform attributeName="transform" type="rotate" values="{vals}" keyTimes="{kt(t_w)}" calcMode="spline" keySplines="{";".join(spl)}" dur="{DUR}s" repeatCount="indefinite"/><circle cx="{x}" cy="-52" r="52" fill="{DARK}"/><circle cx="{x}" cy="-52" r="29" fill="{SKY}"/><circle cx="{x}" cy="-52" r="11" fill="{NAVY}"/>{bolts}</g>'
cum = (math.pi / 4 * RS) / 52 * 180 / math.pi        # degrés de roue pour 45° de planète
truck = f'''<g id="truck" transform="translate({CX} {CY - RS + 26})">
  <animateTransform attributeName="transform" additive="sum" type="translate" values="0 0;0 -2.5;0 0" dur="0.8s" repeatCount="indefinite"/>
  <ellipse cx="0" cy="8" rx="330" ry="9" fill="{DARK}" opacity="0.25"/>
  <g id="chassis"><rect x="-320" y="-118" width="640" height="34" rx="8" fill="{DARK}"/><rect x="-320" y="-134" width="430" height="22" rx="7" fill="#b8c0d9"/><rect x="-320" y="-122" width="430" height="10" rx="5" fill="#fff"/><rect x="-320" y="-112" width="430" height="6" fill="{RED}"/></g>
  <g id="load"><rect x="-308" y="-190" width="402" height="56" rx="12" fill="#cfd4e4"/><rect x="-294" y="-246" width="374" height="56" rx="12" fill="#dde1ee"/><rect x="-276" y="-302" width="338" height="56" rx="12" fill="#e8ebf4"/>
    <rect x="-255" y="-304" width="20" height="172" rx="5" fill="{RED}"/><rect x="25" y="-304" width="20" height="172" rx="5" fill="{RED}"/>
    <rect x="-200" y="-262" width="230" height="104" rx="18" fill="#fff"/><rect x="-200" y="-176" width="230" height="10" rx="5" fill="{RED}"/>{logo(-85, -216, 0.2, ident="logo-load")}</g>
  <g id="cab"><rect x="104" y="-300" width="11" height="200" rx="5" fill="#8f98cf"/><path d="M122 -86 L122 -228 Q122 -250 144 -250 L232 -250 Q252 -250 266 -232 L312 -170 Q326 -152 326 -126 L326 -86 Z" fill="{NAVY}"/>
    <path d="M140 -234 L226 -234 Q238 -234 246 -224 L278 -184 L140 -184 Z" fill="{SKY}"/><path d="M160 -234 L186 -234 L162 -184 L136 -184 Z" fill="#fff" opacity="0.45"/>
    <rect x="122" y="-118" width="204" height="18" fill="{RED}"/><rect x="214" y="-176" width="3" height="68" fill="#fff" opacity="0.25"/><rect x="226" y="-150" width="30" height="7" rx="3" fill="#fff" opacity="0.7"/>
    {logo(262, -138, 0.05, white=True, ident="logo-cab")}<path d="M326 -128 L338 -124 Q342 -122 342 -116 L342 -100 L326 -100 Z" fill="#fff"/><rect x="316" y="-96" width="36" height="16" rx="6" fill="#aab3d6"/></g>
  {wheel("wheel-rear-1", -205, cum)}{wheel("wheel-rear-2", -100, cum)}{wheel("wheel-front", 215, cum)}
</g>'''
# ───────── bulles de livraison (fixes, au-dessus du camion) ─────────
labels = []
for k, (ar, fr) in enumerate(PLACES):
    a, b = k * STEP + 0.15, k * STEP + MOVE - 0.1
    keys = [0, a, a + 0.25, b - 0.2, b, DUR]; vals = [0, 0, 1, 1, 0, 0]
    if k == 0: keys = [0, b - 0.2, b, DUR]; vals = [1, 1, 0, 0]
    dy = ";".join(["16 0 ".split()[0]] ) if False else None
    labels.append(f'''<g id="label-{k}" opacity="{1 if k == 0 else 0}"><animate attributeName="opacity" values="{";".join(map(str, vals))}" keyTimes="{kt(keys)}" dur="{DUR}s" repeatCount="indefinite"/>
    <rect x="270" y="388" width="540" height="104" rx="52" fill="#fff" stroke="#e3e6ee" stroke-width="5"/><path d="M522 492 L540 512 L558 492Z" fill="#fff"/>
    <g transform="translate(332 440)"><path d="M0 22 C-22 -4 -22 -34 0 -34 C22 -34 22 -4 0 22Z" fill="{RED}"/><circle cx="0" cy="-16" r="7" fill="#fff"/></g>
    <text x="560" y="436" text-anchor="middle" font-family="GEPF, Cairo, Montserrat, sans-serif" font-weight="800" font-size="44" fill="{NAVY}" direction="rtl">{ar}</text>
    <text x="560" y="474" text-anchor="middle" font-family="GEPF, Montserrat, sans-serif" font-weight="700" font-size="28" fill="{RED}">{fr}</text></g>''')
clouds = "".join(f'<g transform="translate({x} {y}) scale({s})" opacity="0.95"><ellipse cx="0" cy="0" rx="120" ry="34" fill="#fff"/><circle cx="-30" cy="-24" r="38" fill="#fff"/><circle cx="34" cy="-30" r="48" fill="#fff"/></g>' for x, y, s in [(150, 640, 1), (900, 560, 0.8), (1020, 880, 0.6), (80, 920, 0.7)])
svg = f'''<svg id="camion-planete-gep" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
<title>Camion Comptoir GEP — livraisons dans le Grand Tunis</title>
<defs>
 <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="{SKY}"/><stop offset="1" stop-color="#c9d0e8"/></linearGradient>
 <radialGradient id="pg" cx="0.5" cy="0.15" r="0.9"><stop offset="0" stop-color="#2b3892"/><stop offset="1" stop-color="{NAVY}"/></radialGradient>
 <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5"><stop offset="0.9" stop-color="#fff" stop-opacity="0.9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
</defs>
<rect id="sky-bg" width="1080" height="1920" fill="url(#sky)"/>
<g id="clouds">{clouds}</g>
<circle id="atmosphere" cx="{CX}" cy="{CY}" r="{RS + 70}" fill="url(#halo)" opacity="0.7"/>
{planet}
{truck}
<g id="labels">{"".join(labels)}</g>
<g id="brand">{logo(540, 330, 0.26, ident="logo-top")}</g>
</svg>'''
for path in [R0 + "/svg/camion-planete-gep.svg", R0 + "/remotion/public/camion-planete-gep.svg"]:
    open(path, "w").write(svg)
print("ok", len(svg))
