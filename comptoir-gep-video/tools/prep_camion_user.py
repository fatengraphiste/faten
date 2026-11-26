#!/usr/bin/env python3
"""Prépare le SVG de l'utilisateur pour l'animation : ajoute data-i (index DOM) à chaque élément."""
import xml.etree.ElementTree as ET, re
ET.register_namespace("", "http://www.w3.org/2000/svg"); ET.register_namespace("xlink", "http://www.w3.org/1999/xlink")
R = "/home/user/faten/comptoir-gep-video"
t = ET.parse(R + "/assets/camion_gep_user.svg"); root = t.getroot()
for i, e in enumerate(root.iter()):
    if i: e.set("data-i", str(i - 1))
root.set("width", "1080"); root.set("height", "1920")
out = ET.tostring(root, encoding="unicode")
open(R + "/remotion/public/camion-user.svg", "w").write(out); print("ok", len(out))
