import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Img, random, staticFile } from "remotion";
import { MixedText } from "../components";
import { INK, RED, WHITE } from "../theme";

// Couvertures 1080×1920 : contenu important dans le recadrage 4:5 de la grille (y 285 → 1635)
for (const w of ["700", "900"]) {
  loadFont({ family: "KufiCover", url: staticFile(`fonts/noto-kufi-arabic-arabic-${w}-normal.woff2`), weight: w });
}
const KUFI = "KufiCover, sans-serif";
const GREY = "#8a7f7e";

// « Regard » : la grille « ذكاء » avec le mot caché « ديزاين » révélé
export const CoverRegard: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: INK, alignItems: "center" }}>
    <div style={{ position: "absolute", top: 330, left: 70, right: 70, textAlign: "center" }}>
      <MixedText text="عينيك ليك ولا للـ IA ؟" size={84} color={WHITE} latinColor={RED} />
    </div>
    <div style={{ position: "absolute", top: 520, left: 90, width: 900, height: 760 }}>
      {Array.from({ length: 8 }).map((_, r) =>
        Array.from({ length: 6 }).map((__, c) => {
          const hidden = r === 4 && c === 2;
          return (
            <div key={`${r}-${c}`} style={{ position: "absolute", left: c * 150, top: r * 95, width: 150, textAlign: "center", opacity: hidden ? 1 : 0.25 + random(`o${r}${c}`) * 0.3 }}>
              <MixedText text={hidden ? "ديزاين" : "ذكاء"} size={hidden ? 74 : 44} color={hidden ? RED : GREY} style={hidden ? { display: "inline-block", transform: "scale(1.5)" } : undefined} />
            </div>
          );
        }),
      )}
    </div>
    <div style={{ position: "absolute", top: 1380, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ display: "inline-block", backgroundColor: RED, borderRadius: 999, padding: "6px 56px" }}>
        <MixedText text="لقيتها في 2 ثواني ؟" size={64} color={WHITE} />
      </div>
    </div>
    <Img src={staticFile("logo-creofan-complet.png")} style={{ position: "absolute", top: 1520, width: 220 }} />
  </AbsoluteFill>
);

// « الروح » : les cercles qui fusionnent en un point rouge, sur charbon
export const CoverAme: React.FC = () => {
  const C = { x: 540, y: 1090 };
  return (
    <AbsoluteFill style={{ backgroundColor: "#1c1412" }}>
      <div dir="rtl" style={{ position: "absolute", top: 340, left: 70, right: 70, textAlign: "center", fontFamily: KUFI, fontWeight: 900, lineHeight: 1.3 }}>
        <div style={{ fontSize: 104, color: "transparent", WebkitTextStroke: "3px #f6eee4" }}>مش الـ إي آي</div>
        <div style={{ fontSize: 104, color: "#f6eee4" }}>
          اللي خلّاك <span style={{ color: RED }}>تحسّ</span>
        </div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {[300, 250, 205, 165, 130].map((r, i) => (
          <circle key={r} cx={C.x} cy={C.y} r={r} fill="none" stroke={i % 2 ? "#d4a857" : "#f6eee4"} strokeWidth={i === 0 ? 3 : 2} opacity={0.35 + i * 0.12} />
        ))}
        <circle cx={C.x + 205} cy={C.y - 165} r={44} fill="#d4a857" />
        <circle cx={C.x - 230} cy={C.y + 120} r={30} fill="#f6eee4" />
        <circle cx={C.x} cy={C.y} r={92} fill={RED} />
      </svg>
      <div style={{ position: "absolute", top: 1470, left: 0, right: 0, textAlign: "center", fontFamily: KUFI, fontWeight: 900, fontSize: 64, color: "#d4a857" }}>
        الديزاينر هو الروح
      </div>
    </AbsoluteFill>
  );
};
