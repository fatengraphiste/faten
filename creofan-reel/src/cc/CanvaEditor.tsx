import { Img, interpolate, staticFile } from "remotion";
import { RED, WHITE } from "../theme";
import { C } from "./cues";
import { BeigeBg, Check, clamp, Cursor, Headline, usePop, useT, Window } from "./ui";

const SELECT = C.modification - 22;
const NEW_TEXT = "Café du matin";

// L'éditeur Canva : on retouche le design créé par Claude
export const CanvaEditor: React.FC = () => {
  const t = useT(C.canvaEditor);
  const pop = usePop();
  const selected = t >= SELECT;
  const changing = t >= C.modification;
  const typedNew = NEW_TEXT.slice(0, Math.floor(interpolate(t, [C.modification, C.modification + 22], [0, NEW_TEXT.length], clamp)));
  const saved = pop(t, C.modification + 30, 12);

  return (
    <BeigeBg>
      <Headline
        t={t}
        top={260}
        items={[
          { at: C.canvaEditor, text: "تلقاه directement على Canva" },
          { at: C.modification, text: "اعمل modification كيف ما تحب" },
        ]}
      />

      <Window t={t} inAt={C.canvaEditor} top={480} height={1120} bg="#ebecf0">
        {/* Barre du haut Canva */}
        <div
          style={{
            height: 92,
            background: "linear-gradient(90deg, #00c4cc, #5a32fa 70%, #7d2ae8)",
            display: "flex",
            alignItems: "center",
            padding: "0 30px",
            gap: 34,
            color: WHITE,
            fontSize: 26,
            fontWeight: 600,
          }}
        >
          <span>Accueil</span>
          <span>Fichier</span>
          <span>Redimensionner</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, opacity: saved }}>
            <Check size={28} /> Enregistré
          </div>
          <div style={{ backgroundColor: WHITE, color: "#5a32fa", borderRadius: 12, padding: "10px 24px" }}>Partager</div>
        </div>

        {/* Outils à gauche */}
        <div style={{ position: "absolute", top: 92, left: 0, bottom: 0, width: 130, backgroundColor: WHITE }}>
          {["Design", "Éléments", "Texte", "Importer", "Projets"].map((l, i) => (
            <div key={l} style={{ position: "absolute", top: 30 + i * 120, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontSize: 18, color: "#3c3c43" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: i === 2 && selected ? "#ede5ff" : "#f1f1f4", border: i === 2 && selected ? "3px solid #8b3dff" : "none" }} />
              {l}
            </div>
          ))}
        </div>

        {/* Barre d'outils texte quand le texte est sélectionné */}
        {selected ? (
          <div
            style={{
              position: "absolute",
              top: 112,
              left: 160,
              right: 30,
              height: 70,
              borderRadius: 16,
              backgroundColor: WHITE,
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "0 24px",
              fontSize: 24,
              transform: `scale(${pop(t, SELECT, 14)})`,
            }}
          >
            <span style={{ border: "2px solid #ddd", borderRadius: 8, padding: "4px 14px" }}>Poppins</span>
            <span style={{ border: "2px solid #ddd", borderRadius: 8, padding: "4px 14px" }}>52</span>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: changing ? RED : WHITE, border: "2px solid #ccc" }} />
            <span style={{ fontWeight: 800 }}>B</span>
          </div>
        ) : null}

        {/* Page du design */}
        <div
          style={{
            position: "absolute",
            top: 230,
            left: 190,
            width: 740,
            height: 740,
            backgroundColor: WHITE,
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          <Img src={staticFile("resultat-flow.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 55%, rgba(0,0,0,0.6))" }} />
          <div
            style={{
              position: "absolute",
              left: 40,
              bottom: 50,
              padding: "6px 14px",
              fontSize: 72,
              fontWeight: 800,
              color: changing ? RED : WHITE,
              backgroundColor: changing ? WHITE : "transparent",
              borderRadius: 12,
              outline: selected ? "4px solid #8b3dff" : "none",
              outlineOffset: 8,
            }}
          >
            {changing ? typedNew || " " : "Coffee time"}
            {changing && t < C.modification + 24 ? "|" : ""}
          </div>
        </div>

        <Cursor
          t={t}
          keys={[
            { t: C.canvaEditor + 6, x: 600, y: 700 },
            { t: SELECT - 10, x: 380, y: 935 },
            { t: SELECT, x: 380, y: 935, click: true },
            { t: C.modification + 40, x: 820, y: 600 },
          ]}
        />
      </Window>
    </BeigeBg>
  );
};
