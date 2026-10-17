import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Police Poppins incluse dans public/fonts (fonctionne hors connexion)
for (const weight of ["400", "600", "800"]) {
  loadFont({
    family: "Poppins",
    url: staticFile(`fonts/poppins-latin-${weight}-normal.woff2`),
    weight,
  });
}

export const FONT = "Poppins, sans-serif";

export const RED = "#f7322a";
export const BEIGE = "#fff5f5";
export const WHITE = "#ffffff";
// Texte foncé pour la lisibilité sur fond blanc
export const INK = "#2a0f0e";

export const FPS = 30;

// Découpage du script (en frames, 30 fps)
export const SCENES = {
  vocal: { from: 0, duration: 240 }, // 0:00 – 0:08
  solution: { from: 240, duration: 150 }, // 0:08 – 0:13
  prompt: { from: 390, duration: 450 }, // 0:13 – 0:28
  result: { from: 840, duration: 210 }, // 0:28 – 0:35
  cta: { from: 1050, duration: 150 }, // 0:35 – 0:40
};

export const TOTAL_DURATION = 1200;
