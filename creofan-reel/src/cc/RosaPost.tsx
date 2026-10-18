import { loadFont } from "@remotion/fonts";
import { Img, staticFile } from "remotion";
import { FONT } from "../theme";

// Police serif élégante pour la marque de parfum
for (const [file, weight, style] of [
  ["latin-400-normal", "400", "normal"],
  ["latin-700-normal", "700", "normal"],
  ["latin-400-italic", "400", "italic"],
] as const) {
  loadFont({
    family: "Playfair",
    url: staticFile(`fonts/playfair-display-${file}.woff2`),
    weight,
    style,
  });
}

const SERIF = "Playfair, Georgia, serif";
export const WINE = "#7a1328";
export const GOLD = "#a87b3f";

/**
 * Post Instagram 4:5 « ROSA » (conçu en 1080×1350, mis à l'échelle via `width`).
 * `tagline` est le texte modifié dans l'éditeur Canva.
 */
export const RosaPost: React.FC<{
  width: number;
  tagline?: string;
  taglineColor?: string;
  selected?: boolean;
}> = ({ width, tagline = "L'essence de la féminité", taglineColor = WINE, selected }) => (
  <div style={{ width, height: width * 1.25, overflow: "hidden", position: "relative" }}>
    <div
      style={{
        width: 1080,
        height: 1350,
        transform: `scale(${width / 1080})`,
        transformOrigin: "0 0",
        position: "relative",
        backgroundColor: "#f4efe6",
      }}
    >
      <Img
        src={staticFile("cc/rosa-photo.jpg")}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 64%" }}
      />

      {/* Texte dans la zone crème en haut à gauche */}
      <div style={{ position: "absolute", left: 90, top: 120, width: 520 }}>
        <div style={{ fontFamily: FONT, fontSize: 26, letterSpacing: 9, color: GOLD, fontWeight: 600 }}>
          NOUVELLE COLLECTION
        </div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 160, lineHeight: 1, color: WINE, letterSpacing: 6, marginTop: 24 }}>
          ROSA
        </div>
        <div style={{ fontFamily: FONT, fontSize: 24, letterSpacing: 12, color: WINE, marginTop: 14 }}>
          EAU DE PARFUM
        </div>
        <div style={{ width: 130, height: 3, backgroundColor: GOLD, margin: "40px 0" }} />
        <div
          style={{
            display: "inline-block",
            maxWidth: 400,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 58,
            lineHeight: 1.2,
            color: taglineColor,
            outline: selected ? "6px solid #8b3dff" : "none",
            outlineOffset: 14,
          }}
        >
          {tagline || " "}
        </div>
      </div>

      {/* Appel à l'action en bas à gauche */}
      <div style={{ position: "absolute", left: 90, bottom: 110 }}>
        <div
          style={{
            display: "inline-block",
            fontFamily: FONT,
            fontSize: 28,
            letterSpacing: 5,
            fontWeight: 600,
            color: "#fff",
            backgroundColor: WINE,
            padding: "22px 48px",
            borderRadius: 999,
          }}
        >
          DÉCOUVRIR
        </div>
        <div style={{ fontFamily: FONT, fontSize: 24, letterSpacing: 4, color: WINE, marginTop: 26 }}>
          @rosa.parfums
        </div>
      </div>
    </div>
  </div>
);
