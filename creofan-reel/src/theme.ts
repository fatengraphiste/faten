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

// Salma Arabic Bold pour les mots en arabe
loadFont({
  family: "Salma",
  url: staticFile("fonts/salma-arabic-bold.otf"),
  weight: "700",
});

export const FONT = "Poppins, sans-serif";
export const FONT_AR = "Salma, Poppins, sans-serif";

export const RED = "#f7322a";
export const BEIGE = "#fff5f5";
export const WHITE = "#ffffff";
// Texte foncé pour la lisibilité sur fond blanc
export const INK = "#2a0f0e";

export const FPS = 30;


// Zone de sécurité Reels / TikTok (1080×1920) : rien d'important en dehors
export const SAFE = { top: 250, bottom: 450, left: 70, right: 150 };
