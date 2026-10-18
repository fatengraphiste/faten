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

